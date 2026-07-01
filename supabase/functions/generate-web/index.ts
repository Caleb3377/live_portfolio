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
    const nvidiaLlmKey = Deno.env.get("NVIDIA_LLM_API_KEY") ?? "";

    if (!nvidiaLlmKey) {
      throw new Error("Missing NVIDIA_LLM_API_KEY environment variable");
    }

    const { prompt, palette, businessType } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an elite, senior UI/UX designer and web developer.
Your task is to generate a fully complete, professional, and visually stunning single-file HTML website based on the user's requirements.
The website must include:
- A responsive HTML5 structure.
- Modern CSS styles inside a <style> tag. Use harmonious color palettes (like HSL), gradients, modern typography (import from Google Fonts), glassmorphism, flexbox/grid layout, and beautiful hover animations.
- Subtle interactive JavaScript inside a <script> tag if it improves the design (e.g., toggles, modals, interactive cards, micro-animations, theme changes).
- Realistic content placeholder texts and SVGs for icons. DO NOT use generic lorem ipsum; write copy tailored to the user's business type.
- Do NOT include markdown code blocks like \`\`\`html or \`\`\`. Start directly with <!DOCTYPE html> and end with </html>. Only output the raw code.

Configuration:
- Business Type: ${businessType || "General"}
- Color Palette Style: ${palette || "Neon Cyan"}
- User Requirements: ${prompt}`;

    console.log(`Generating web for prompt: "${prompt}"`);
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
          { role: "user", content: `Generate the website for: ${prompt}` }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 8192,
        stream: true,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      throw new Error(`Failed to call LLM for web generation: ${errText}`);
    }

    // Stream the raw code chunk by chunk
    const stream = new ReadableStream({
      async start(controller) {
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
                  const content = data.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
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
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });

  } catch (error: any) {
    console.error("Error inside generate-web function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
