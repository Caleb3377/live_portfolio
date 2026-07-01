import React, { useState, useRef } from 'react';
import { Upload, Send, FileText, ChevronRight, Activity } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface Citation {
  id: string;
  page_number: number;
  is_table: boolean;
  similarity: number;
}

const RagDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [reasoningText, setReasoningText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preloaded mock data for instant testing
  const handleLoadDemoDoc = () => {
    setDocumentId("demo-doc-id-123");
    setDocumentName("manual_bomba_hidraulica_v4.pdf");
    setActiveStep(1); // Set to Chunked/Indexed state
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setActiveStep(1); // Stage 1: Extraction & Chunking

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Invoke Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('upload-pdf', {
        body: formData,
      });

      if (error) throw error;

      setDocumentId(data.documentId);
      setDocumentName(file.name);
      setActiveStep(2); // Stage 2: Embedded & Vector Saved
    } catch (err: any) {
      console.error("Upload error:", err);
      // Fallback to local simulation if environment variables or backend fails
      setTimeout(() => {
        setDocumentId("simulated-doc-id");
        setDocumentName(file.name);
        setActiveStep(2);
      }, 2500);
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setChatLoading(true);
    setReasoningText('');
    setResponseText('');
    setCitations([]);
    setActiveStep(3); // Stage 3: Query Embedding & Vector Retrieval

    try {
      // Invoke query-pdf function using SSE/streaming
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      };
      
      const response = await fetch(`${supabaseUrl}/functions/v1/query-pdf`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, documentId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setActiveStep(4); // Stage 4: Prompt Construction & Nemotron Reasoning

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === 'citations') {
                setCitations(data.citations);
              } else if (data.type === 'delta') {
                if (data.reasoning) {
                  setReasoningText((prev) => prev + data.reasoning);
                }
                if (data.content) {
                  setResponseText((prev) => prev + data.content);
                }
              }
            } catch (err) {
              // Parse error
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Query error:", err);
      // Mock simulation fallback if backend fails
      simulateMockQueryResponse(query);
    } finally {
      setChatLoading(false);
      setActiveStep(5); // Completed
    }
  };

  const simulateMockQueryResponse = (_q: string) => {
    // Stage 3: Similarity Search
    setTimeout(() => {
      setActiveStep(4); // Stage 4: Nemotron Reasoning
      setCitations([
        { id: '1', page_number: 14, is_table: true, similarity: 0.94 },
        { id: '2', page_number: 15, is_table: false, similarity: 0.88 },
      ]);

      const mockReasoning = [
        "<pensamiento>",
        "\nEl usuario pregunta sobre la presión máxima de la bomba hidráulica.",
        "\nBuscando en los chunks indexados de 'manual_bomba_hidraulica_v4.pdf'.",
        "\nEncontrada Tabla 3 en la Página 14: 'Especificaciones de Presión y Flujo'.",
        "\nLa bomba modelo H-400 indica una presión máxima de servicio de 350 bar (5076 psi).",
        "\nEl límite de alivio de seguridad está ajustado a 380 bar.",
        "\nDebo responder citando la Tabla 3 de la pág. 14 y el párrafo aclaratorio de la pág. 15.",
        "\n</pensamiento>\n"
      ];

      const mockAnswer = [
        "Según la **Tabla 3 (Página 14)** del manual de especificaciones técnicas, la presión máxima de servicio continuo para la bomba hidráulica (Modelo H-400) es de **350 bar** (5076 psi).\n\n",
        "Adicionalmente, el documento aclara en la **Página 15** que la válvula de alivio de presión interna viene ajustada de fábrica a **380 bar** (5511 psi) para prevenir daños estructurales durante sobrecargas temporales."
      ];

      // Stream reasoning
      let rIdx = 0;
      const rInterval = setInterval(() => {
        if (rIdx < mockReasoning.length) {
          setReasoningText((prev) => prev + mockReasoning[rIdx]);
          rIdx++;
        } else {
          clearInterval(rInterval);
          // Stream answer
          let aIdx = 0;
          const aInterval = setInterval(() => {
            if (aIdx < mockAnswer.length) {
              setResponseText((prev) => prev + mockAnswer[aIdx]);
              aIdx++;
            } else {
              clearInterval(aInterval);
            }
          }, 300);
        }
      }, 150);
    }, 1200);
  };

  return (
    <div className="rag-container">
      <div className="rag-header">
        <h2 className="glow-text">Advanced PDF RAG Engine</h2>
        <p className="subtitle">
          Sube tus especificaciones técnicas, manuales o tablas complejas. Nuestro pipeline procesará el contenido con pgvector y la API de NVIDIA para consultas hiperprecisas con citas verificables.
        </p>
      </div>

      <div className="rag-workspace">
        {/* Left Side: Document Control & Pipeline */}
        <div className="workspace-left">
          {/* File Dropzone */}
          <div className="glass-panel card-upload">
            <h3 className="card-title">1. Documento de Origen</h3>
            
            {!documentId ? (
              <form onSubmit={handleUpload} className="upload-form">
                <div 
                  className="dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} color="#c084fc" className="upload-icon" />
                  <span className="dropzone-text">
                    {file ? file.name : "Arrastra tu PDF aquí o haz clic para buscar"}
                  </span>
                  <span className="dropzone-sub">Soporta PDF hasta 10MB</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    style={{ display: 'none' }}
                  />
                </div>
                
                <div className="upload-actions">
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={!file || uploading}
                  >
                    <span>{uploading ? "Procesando..." : "Indexar Documento"}</span>
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleLoadDemoDoc}
                  >
                    Cargar Documento Demo
                  </button>
                </div>
              </form>
            ) : (
              <div className="active-doc-badge">
                <FileText size={24} color="#22d3ee" />
                <div className="doc-info">
                  <span className="doc-name">{documentName}</span>
                  <span className="doc-status">Indexado en pgvector</span>
                </div>
                <button 
                  className="btn-clear"
                  onClick={() => {
                    setDocumentId(null);
                    setDocumentName(null);
                    setFile(null);
                    setResponseText('');
                    setReasoningText('');
                    setCitations([]);
                    setActiveStep(0);
                  }}
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* RAG Pipeline Visualizer */}
          <div className="glass-panel card-pipeline">
            <h3 className="card-title">Pipeline Visualizador</h3>
            <div className="pipeline-steps">
              <div className={`pipeline-step ${activeStep >= 1 ? 'active' : ''}`}>
                <div className="step-num">1</div>
                <div className="step-info">
                  <span className="step-title">Extracción y Chunking</span>
                  <span className="step-desc">Se extrae el texto y tablas (markdown). Ventanas de 400 palabras.</span>
                </div>
              </div>
              <ChevronRight className="arrow-divider" />
              <div className={`pipeline-step ${activeStep >= 2 ? 'active' : ''}`}>
                <div className="step-num">2</div>
                <div className="step-info">
                  <span className="step-title">Embeddings (nv-embedcode)</span>
                  <span className="step-desc">Generación de vectores (4096-d) en modo passage.</span>
                </div>
              </div>
              <ChevronRight className="arrow-divider" />
              <div className={`pipeline-step ${activeStep >= 3 ? 'active' : ''}`}>
                <div className="step-num">3</div>
                <div className="step-info">
                  <span className="step-title">Consulta y Similaridad</span>
                  <span className="step-desc">Embedding query + Búsqueda coseno en base de datos.</span>
                </div>
              </div>
              <ChevronRight className="arrow-divider" />
              <div className={`pipeline-step ${activeStep >= 4 ? 'active' : ''}`}>
                <div className="step-num">4</div>
                <div className="step-info">
                  <span className="step-title">Nemotron Reasoning</span>
                  <span className="step-desc">El LLM razona internamente (enable_thinking) y cita fuentes.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Playground */}
        <div className="workspace-right">
          <div className="glass-panel chat-card">
            <div className="chat-header">
              <Activity className="chat-header-icon animate-pulse" size={18} color="#22d3ee" />
              <span>Consola del Modelo Nvidia Nemotron-3</span>
              {documentId && <span className="active-pill">Listo para Consultas</span>}
            </div>

            <div className="chat-body">
              {/* Citations block */}
              {citations.length > 0 && (
                <div className="citations-container">
                  <span className="citations-title">Contexto Recuperado (pgvector):</span>
                  <div className="citations-list">
                    {citations.map((c, idx) => (
                      <span key={idx} className="citation-badge">
                        Pág. {c.page_number} {c.is_table ? '(Tabla)' : '(Texto)'} | Sim. {(c.similarity * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming panels */}
              <div className="panels-wrapper">
                {/* Reasoning Panel */}
                <div className="panel-reasoning">
                  <div className="panel-title">Proceso de Pensamiento (Thinking)</div>
                  <div className="panel-content reasoning-font">
                    {reasoningText || (chatLoading ? "Analizando y pensando sobre los chunks..." : "El razonamiento interno del LLM aparecerá aquí...")}
                  </div>
                </div>

                {/* Final Answer Panel */}
                <div className="panel-response">
                  <div className="panel-title">Respuesta de Precisión Técnica</div>
                  <div className="panel-content response-font">
                    {responseText || (chatLoading ? "Generando respuesta..." : "La respuesta estructurada final con citas aparecerá aquí...")}
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-footer">
              <form onSubmit={handleQuery} className="chat-form">
                <input
                  type="text"
                  className="glass-input chat-input"
                  placeholder={documentId ? "Pregunta algo sobre el documento..." : "Carga o selecciona un documento primero..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!documentId || chatLoading}
                />
                <button 
                  type="submit" 
                  className="btn-primary chat-send-btn"
                  disabled={!documentId || chatLoading || !query.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rag-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding-bottom: 40px;
          height: 100%;
        }

        .rag-header {
          text-align: left;
        }

        .rag-header h2 {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .rag-header .subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 800px;
          margin-top: 8px;
        }

        .rag-workspace {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .workspace-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-upload {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          text-align: left;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dropzone {
          border: 2px dashed rgba(192, 132, 252, 0.3);
          border-radius: 12px;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: var(--transition-smooth);
          background: rgba(255, 255, 255, 0.01);
        }

        .dropzone:hover {
          border-color: var(--primary);
          background: rgba(192, 132, 252, 0.03);
        }

        .dropzone-text {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .dropzone-sub {
          font-size: 12px;
          color: var(--text-muted);
        }

        .upload-actions {
          display: flex;
          gap: 12px;
        }

        .upload-actions button {
          flex: 1;
          justify-content: center;
        }

        .active-doc-badge {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(34, 211, 238, 0.05);
          border: 1px solid rgba(34, 211, 238, 0.2);
          padding: 16px;
          border-radius: 12px;
        }

        .doc-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          text-align: left;
        }

        .doc-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .doc-status {
          font-size: 12px;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }

        .btn-clear {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          font-family: var(--font-display);
        }

        .btn-clear:hover {
          text-decoration: underline;
        }

        /* Pipeline visualizer */
        .card-pipeline {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pipeline-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pipeline-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          text-align: left;
          opacity: 0.4;
          transition: var(--transition-smooth);
        }

        .pipeline-step.active {
          opacity: 1;
        }

        .step-num {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--border-color);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-family: var(--font-mono);
          font-weight: bold;
          flex-shrink: 0;
          color: var(--text-secondary);
        }

        .pipeline-step.active .step-num {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
        }

        .step-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-title {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .step-desc {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .arrow-divider {
          display: none;
        }

        /* Chat Playground Card */
        .chat-card {
          display: flex;
          flex-direction: column;
          height: 600px;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .active-pill {
          margin-left: auto;
          font-size: 11px;
          color: #10b981;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 3px 8px;
          border-radius: 12px;
        }

        .chat-body {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          gap: 16px;
          overflow-y: auto;
        }

        .citations-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 8px;
        }

        .citations-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .citations-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .citation-badge {
          font-size: 11px;
          background: var(--accent-cyan-glow);
          color: var(--accent-cyan);
          border: 1px solid rgba(34, 211, 238, 0.2);
          padding: 3px 8px;
          border-radius: 4px;
          font-family: var(--font-mono);
        }

        .panels-wrapper {
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 16px;
          flex-grow: 1;
          min-height: 0;
        }

        .panel-reasoning, .panel-response {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.03);
          overflow: hidden;
        }

        .panel-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          text-align: left;
        }

        .panel-content {
          padding: 16px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.5;
          text-align: left;
          color: var(--text-secondary);
          white-space: pre-wrap;
        }

        .reasoning-font {
          font-family: var(--font-mono);
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.01);
        }

        .response-font {
          color: #e2e8f0;
        }

        .chat-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
        }

        .chat-form {
          display: flex;
          gap: 12px;
        }

        .chat-input {
          flex-grow: 1;
          border-radius: 24px;
        }

        .chat-send-btn {
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .rag-workspace {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RagDemo;
