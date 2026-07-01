import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Import pdf-parse using npm specifier
import pdf from "npm:pdf-parse@1.1.1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const nvidiaEmbedKey = Deno.env.get("NVIDIA_EMBED_API_KEY") ?? "";

    if (!nvidiaEmbedKey) {
      throw new Error("Missing NVIDIA_EMBED_API_KEY environment variable");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get PDF file from request body
    const contentType = req.headers.get("content-type") ?? "";
    let fileBuffer: ArrayBuffer;
    let fileName = "document.pdf";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded in form data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      fileBuffer = await file.arrayBuffer();
      fileName = file.name;
    } else {
      fileBuffer = await req.arrayBuffer();
    }

    // Convert ArrayBuffer to Uint8Array/Buffer for pdf-parse
    const pdfUint8 = new Uint8Array(fileBuffer);
    
    // Parse PDF text
    console.log(`Parsing PDF: ${fileName}`);
    const pdfData = await pdf(pdfUint8);
    const fullText = pdfData.text || "";
    
    if (!fullText.trim()) {
      throw new Error("Could not extract any text from the PDF");
    }

    // Save document entry
    const { data: docData, error: docError } = await supabase
      .from("documents")
      .insert({ name: fileName })
      .select()
      .single();

    if (docError) throw docError;
    const documentId = docData.id;

    // Chunking logic: ~400 words with 10% overlap
    const words = fullText.split(/\s+/);
    const chunkSize = 400;
    const overlap = 40;
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
      const chunkWords = words.slice(i, i + chunkSize);
      if (chunkWords.length > 0) {
        chunks.push(chunkWords.join(" "));
      }
      if (i + chunkSize >= words.length) break;
    }

    console.log(`Generated ${chunks.length} chunks. Storing embeddings...`);

    // Generate embeddings and save to database
    for (let index = 0; index < chunks.length; index++) {
      const chunkText = chunks[index];
      const pageNum = Math.floor(index / 2) + 1; // Simulated page number from index
      const isTable = chunkText.includes("|") || chunkText.includes("\t");

      // Get embedding from NVIDIA API
      const embedResponse = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nvidiaEmbedKey}`,
        },
        body: JSON.stringify({
          input: [chunkText],
          model: "nvidia/nv-embedcode-7b-v1",
          input_type: "passage",
          encoding_format: "float",
          truncate: "NONE"
        }),
      });

      if (!embedResponse.ok) {
        const errorText = await embedResponse.text();
        console.error(`NVIDIA API Error: ${errorText}`);
        throw new Error(`Failed to generate embedding for chunk ${index}: ${errorText}`);
      }

      const embedResult = await embedResponse.json();
      const embedding = embedResult.data[0].embedding;

      // Insert chunk
      const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert({
          document_id: documentId,
          content: chunkText,
          page_number: pageNum,
          is_table: isTable,
          embedding: embedding,
        });

      if (chunkError) {
        throw chunkError;
      }
    }

    return new Response(JSON.stringify({ success: true, documentId, chunksCount: chunks.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error inside upload-pdf function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
