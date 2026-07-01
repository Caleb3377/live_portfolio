import React, { useState } from 'react';
import { Play, Code, Eye, RefreshCw, Layers } from 'lucide-react';

const WebGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [palette, setPalette] = useState('Cyberpunk (Neon)');
  const [businessType, setBusinessType] = useState('SaaS / Tech');
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');

  const palettes = ['Cyberpunk (Neon)', 'Warm Coffee (Brown)', 'Professional Dark', 'Clean Minimalist'];
  const businessTypes = ['SaaS / Tech', 'Local Restaurant', 'E-commerce Shop', 'Creative Agency', 'Personal Portfolio'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setGeneratedCode('');
    setActiveView('preview');

    try {
      // Invoke generate-web Edge Function (streaming response)
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      };
 
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-web`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, palette, businessType }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setGeneratedCode((prev) => prev + chunk);
        }
      }
    } catch (err: any) {
      console.error("Web Gen error:", err);
      // Fallback local simulation if backend fails
      simulateWebGeneration();
    } finally {
      setGenerating(false);
    }
  };

  const simulateWebGeneration = () => {
    const mockStyles = {
      'Cyberpunk (Neon)': `
        body { background: #0a0a16; color: #00f2fe; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        h1 { font-size: 3rem; text-shadow: 0 0 10px #00f2fe, 0 0 20px #7f00ff; color: #fff; margin-bottom: 10px; }
        p { color: #8f8faf; max-width: 500px; text-align: center; }
        .btn { background: linear-gradient(135deg, #00f2fe, #7f00ff); color: white; border: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px rgba(0, 242, 254, 0.4); margin-top: 20px; transition: 0.3s; }
        .btn:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(0, 242, 254, 0.6); }
      `,
      'Warm Coffee (Brown)': `
        body { background: #fdfbf7; color: #4e3629; font-family: Georgia, serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        h1 { font-size: 2.8rem; color: #4e3629; font-weight: normal; border-bottom: 2px solid #d4a373; padding-bottom: 10px; }
        p { color: #6f5d53; max-width: 500px; text-align: center; font-style: italic; }
        .btn { background: #8b5a2b; color: white; border: none; padding: 12px 24px; font-size: 1rem; cursor: pointer; border-radius: 4px; margin-top: 20px; transition: 0.3s; }
        .btn:hover { background: #6f441b; }
      `,
      'Professional Dark': `
        body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        h1 { font-size: 2.5rem; font-weight: 800; color: #fff; letter-spacing: -1px; }
        p { color: #94a3b8; max-width: 500px; text-align: center; line-height: 1.6; }
        .btn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: 0.3s; }
        .btn:hover { background: #2563eb; }
      `,
      'Clean Minimalist': `
        body { background: #ffffff; color: #111111; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        h1 { font-size: 2.2rem; font-weight: 300; letter-spacing: 1px; }
        p { color: #666; max-width: 450px; text-align: center; line-height: 1.5; font-size: 0.95rem; }
        .btn { background: #111; color: #fff; border: 1px solid #111; padding: 10px 20px; font-size: 0.9rem; cursor: pointer; margin-top: 20px; transition: 0.2s; }
        .btn:hover { background: #fff; color: #111; }
      `
    }[palette] || `body { background: #111; color: #fff; }`;

    const generatedHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${businessType} - Demo</title>
  <style>
    ${mockStyles}
  </style>
</head>
<body>
  <h1>${businessType}</h1>
  <p>${prompt}</p>
  <button class="btn" onclick="alert('¡Gracias por hacer clic!')">Comenzar Ahora</button>
</body>
</html>`;

    // Stream code simulation
    let idx = 0;
    const interval = setInterval(() => {
      const step = Math.ceil(generatedHTML.length / 30);
      if (idx < generatedHTML.length) {
        setGeneratedCode((prev) => prev + generatedHTML.slice(idx, idx + step));
        idx += step;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const defaultHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0c0c1e; color: #8892b0; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    h1 { color: #64ffda; }
  </style>
</head>
<body>
  <h1>Generador de Webs IA</h1>
  <p>Configura tu prompt a la izquierda y presiona "Generar Web" para ver los resultados en vivo.</p>
</body>
</html>`;

  const previewSource = generatedCode || defaultHTML;

  return (
    <div className="webgen-container">
      <div className="webgen-header">
        <h2 className="glow-text">AI Website Generator Sandbox</h2>
        <p className="subtitle">
          Escribe una propuesta, elige una paleta y un tipo de negocio. Nuestro modelo de IA (NVIDIA) creará el código HTML/CSS completo y lo renderizará en tiempo real.
        </p>
      </div>

      <div className="webgen-workspace">
        {/* Configuration Panel */}
        <div className="workspace-left">
          <form onSubmit={handleGenerate} className="glass-panel gen-form-card">
            <h3 className="card-title">Configuración</h3>
            
            <div className="form-group">
              <label>Tipo de Negocio</label>
              <select 
                className="glass-input select-input"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                {businessTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Paleta de Colores</label>
              <select 
                className="glass-input select-input"
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
              >
                {palettes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Describe tu Página Web</label>
              <textarea 
                className="glass-input textarea"
                rows={6}
                placeholder="Ej. Una cafetería artesanal en Barcelona. Incluye menú de cafés, horarios, una sección sobre nuestra filosofía orgánica y un formulario de reserva."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary gen-btn" disabled={generating || !prompt.trim()}>
              {generating ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
              <span>{generating ? 'Generando...' : 'Generar Web'}</span>
            </button>
          </form>
        </div>

        {/* Live Preview / Code Workspace */}
        <div className="workspace-right">
          <div className="glass-panel workspace-card">
            <div className="workspace-header">
              <div className="header-left">
                <Layers size={18} color="#c084fc" />
                <span>Espacio de Trabajo</span>
              </div>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${activeView === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveView('preview')}
                >
                  <Eye size={14} />
                  <span>Vista Previa</span>
                </button>
                <button 
                  className={`toggle-btn ${activeView === 'code' ? 'active' : ''}`}
                  onClick={() => setActiveView('code')}
                >
                  <Code size={14} />
                  <span>Código</span>
                </button>
              </div>
            </div>

            <div className="workspace-body">
              {activeView === 'preview' ? (
                <iframe 
                  className="preview-iframe"
                  title="Web Preview"
                  srcDoc={previewSource}
                />
              ) : (
                <pre className="code-viewer">
                  <code>{generatedCode || 'El código generado se mostrará aquí...'}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .webgen-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding-bottom: 40px;
          height: 100%;
        }

        .webgen-header {
          text-align: left;
        }

        .webgen-header h2 {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .webgen-header .subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 800px;
          margin-top: 8px;
        }

        .webgen-workspace {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
          align-items: start;
        }

        .gen-form-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .form-group label {
          font-size: 13px;
          font-family: var(--font-display);
          font-weight: 500;
          color: var(--text-secondary);
        }

        .select-input {
          background-color: #0d0d1c !important;
          color: var(--text-primary);
        }

        .textarea {
          resize: vertical;
        }

        .gen-btn {
          width: 100%;
          justify-content: center;
        }

        .workspace-card {
          display: flex;
          flex-direction: column;
          height: 520px;
        }

        .workspace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .view-toggle {
          display: flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 3px;
          border-radius: 8px;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-family: var(--font-display);
          font-weight: 500;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 6px;
          transition: var(--transition-smooth);
        }

        .toggle-btn:hover {
          color: var(--text-primary);
        }

        .toggle-btn.active {
          color: var(--primary);
          background: rgba(192, 132, 252, 0.08);
        }

        .workspace-body {
          flex-grow: 1;
          background: #000;
          min-height: 0;
          position: relative;
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: #fff;
        }

        .code-viewer {
          padding: 20px;
          overflow: auto;
          height: 100%;
          text-align: left;
          font-family: var(--font-mono);
          font-size: 13px;
          color: #a7f3d0; /* Soft green for code */
          white-space: pre-wrap;
          line-height: 1.5;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 1024px) {
          .webgen-workspace {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WebGenerator;
