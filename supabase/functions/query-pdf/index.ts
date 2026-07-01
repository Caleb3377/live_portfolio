import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const nvidiaEmbedKey = Deno.env.get("NVIDIA_EMBED_API_KEY") ?? "";
    const nvidiaLlmKey = Deno.env.get("NVIDIA_LLM_API_KEY") ?? "";

    if (!nvidiaEmbedKey || !nvidiaLlmKey) {
      throw new Error("Missing NVIDIA API keys in environment variables");
    }

    const { query, documentId } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Generate embedding for query
    console.log(`Generating embedding for query: "${query}"`);
    const embedResponse = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${nvidiaEmbedKey}`,
      },
      body: JSON.stringify({
        input: [query],
        model: "nvidia/nv-embedcode-7b-v1",
        input_type: "query",
        encoding_format: "float",
        truncate: "NONE"
      }),
    });

    if (!embedResponse.ok) {
      const errText = await embedResponse.text();
      throw new Error(`Failed to embed query: ${errText}`);
    }

    const embedResult = await embedResponse.json();
    const queryEmbedding = embedResult.data[0].embedding;

    // 2. Perform vector similarity search via Supabase match_chunks
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Searching database for similar chunks...");
    const { data: matchedChunks, error: matchError } = await supabase.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: 0.1, // Retrieve general matches
      match_count: 5,
      filter_document_id: documentId || null,
    });

    if (matchError) throw matchError;

    // 3. Build context for the LLM
    console.log(`Found ${matchedChunks?.length || 0} matching chunks.`);
    let contextText = "";
    const citations: Array<{ id: string; page_number: number; is_table: boolean; similarity: number }> = [];

    if (matchedChunks && matchedChunks.length > 0) {
      contextText = matchedChunks.map((chunk: any, i: number) => {
        citations.push({
          id: chunk.id,
          page_number: chunk.page_number,
          is_table: chunk.is_table,
          similarity: chunk.similarity
        });
        return `[Chunk ${i+1}] (Page ${chunk.page_number}, ${chunk.is_table ? "Table" : "Text"}):
${chunk.content}`;
      }).join("\n\n");
    } else {
      contextText = "No relevant context found in the uploaded documents.";
    }

    const systemPrompt = `You are an expert AI assistant answering questions about technical documents.
Use the following retrieved context blocks from the document to answer the user's question.
If the answer cannot be determined from the context, state that clearly.
For any facts or values you mention, cite the source Chunk number and Page number (e.g. "[Page X]" or "[Table Y]").

Retrieved Context:
${contextText}

Provide a concise, highly accurate technical response.`;

    // 4. Request Nemotron LLM with reasoning/thinking enabled (streaming response)
    console.log("Requesting Nvidia Nemotron LLM...");
    const llmResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${nvidiaLlmKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 4096,
        chat_template_kwargs: { enable_thinking: true },
        reasoning_budget: 4096,
        stream: true,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      throw new Error(`Failed to call LLM: ${errText}`);
    }

    // Stream response to frontend
    const stream = new ReadableStream({
      async start(controller) {
        // First send metadata citations
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "citations", citations }) + "\n"));

        const reader = llmResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") continue;

              if (trimmed.startsWith("data: ")) {
                const dataStr = trimmed.slice(6);
                try {
                  const data = JSON.parse(dataStr);
                  const choice = data.choices?.[0];
                  if (choice) {
                    const reasoning = choice.delta?.reasoning_content;
                    const content = choice.delta?.content;
                    if (reasoning || content) {
                      controller.enqueue(new TextEncoder().encode(
                        JSON.stringify({ type: "delta", reasoning, content }) + "\n"
                      ));
                    }
                  }
                } catch (e) {
                  // Ignore parse errors on incomplete lines
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });

  } catch (error: any) {
    console.error("Error inside query-pdf function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
