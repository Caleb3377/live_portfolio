import React, { useState } from 'react';
import { Download, Database, MessageSquare, Terminal, Mail, Send, CheckCircle } from 'lucide-react';

interface HomeProps {
  onNavigateToProject: (tab: 'rag' | 'whatsapp' | 'webgen') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateToProject }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  const techStack = [
    { name: 'Python', category: 'Backend / AI', desc: 'Desarrollo de pipelines RAG avanzados, procesamiento de lenguaje natural y scripts de extracción.' },
    { name: 'LangChain', category: 'AI Framework', desc: 'Orquestación de cadenas de LLM, memoria de conversación y agentes autónomos.' },
    { name: 'ElevenLabs', category: 'Voice Synthesis', desc: 'Clonación de voz y generación de respuestas de audio hiperrealistas y de baja latencia.' },
    { name: 'Supabase', category: 'Backend / DB', desc: 'Base de datos Postgres vectorizada, autenticación, storage y funciones serverless de Deno.' },
    { name: 'Pinecone', category: 'Vector Search', desc: 'Almacenamiento e indexación de embeddings de alta dimensionalidad para búsqueda semántica.' },
    { name: 'Deno / Node', category: 'Runtime', desc: 'Ejecución de lógica de backend aislada y de alto rendimiento para APIs y webhooks.' },
    { name: 'React / TS', category: 'Frontend', desc: 'Interfaces de usuario reactivas, fluidas y optimizadas para herramientas de Inteligencia Artificial.' },
  ];

  const projects = [
    {
      id: 'rag',
      title: 'RAG Avanzado con PDFs Técnicos',
      description: 'Chunking inteligente con extracción precisa de tablas en markdown y búsqueda semántica en pgvector. Respuestas con razonamiento (thinking) y citas de página.',
      icon: Database,
      tech: ['Python', 'Supabase', 'NVIDIA Embeddings', 'Nemotron LLM'],
      badge: 'Destacado'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Voice Bot',
      description: 'Flujo completo de conversación por voz en tiempo real: Twilio webhooks, Claude LLM para generación y ElevenLabs para voz sintética humana.',
      icon: MessageSquare,
      tech: ['Twilio', 'Claude 3.5', 'ElevenLabs', 'Deno'],
      badge: 'Demo Video'
    },
    {
      id: 'webgen',
      title: 'Generador de Webs IA',
      description: 'Crea una página web responsive completa en 10 segundos a partir de un prompt, con paletas de color HSL dinámicas y renderizado en vivo.',
      icon: Terminal,
      tech: ['React', 'Deno Edge', 'NVIDIA LLM', 'HTML/CSS/JS'],
      badge: 'Interactivo'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section glass-panel">
        <div className="hero-glow" />
        <span className="hero-badge">Disponible para nuevos retos</span>
        <h1 className="hero-title">
          Hola, soy <span className="gradient-text">Yerson</span>
        </h1>
        <h2 className="hero-subtitle">AI Developer & Web Builder</h2>
        <p className="hero-description">
          Especializado en diseñar e implementar soluciones avanzadas de Inteligencia Artificial: sistemas RAG robustos, agentes autónomos de voz e interfaces interactivas de última generación.
        </p>

        <div className="hero-actions">
          <a href="#contact" className="btn-primary">
            <Mail size={18} />
            <span>Contactar Conmigo</span>
          </a>
          <button className="btn-secondary" onClick={() => alert('Descargando Currículum Vitae...')}>
            <Download size={18} />
            <span>Descargar CV</span>
          </button>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-container">
        <h3 className="section-title">Proyectos Destacados</h3>
        <div className="projects-grid">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <div key={project.id} className="project-card glass-panel">
                <div className="project-header">
                  <div className="project-icon-box">
                    <Icon size={24} color="#c084fc" />
                  </div>
                  <span className="project-badge">{project.badge}</span>
                </div>
                <h4 className="project-card-title">{project.title}</h4>
                <p className="project-card-desc">{project.description}</p>
                <div className="project-tech-tags">
                  {project.tech.map((t) => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>
                <button 
                  className="btn-project-action"
                  onClick={() => onNavigateToProject(project.id as 'rag' | 'whatsapp' | 'webgen')}
                >
                  Probar Demo
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-container">
        <h3 className="section-title">Mi Stack Tecnológico</h3>
        <div className="stack-grid">
          {techStack.map((tech) => (
            <div key={tech.name} className="stack-card glass-panel">
              <span className="stack-category">{tech.category}</span>
              <h4 className="stack-name">{tech.name}</h4>
              <p className="stack-desc">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-container contact-section">
        <h3 className="section-title">Trabajemos Juntos</h3>
        <div className="contact-card glass-panel">
          {formSubmitted ? (
            <div className="success-state">
              <CheckCircle size={64} color="#10b981" className="success-icon" />
              <h4>¡Mensaje Enviado con Éxito!</h4>
              <p>Gracias por contactar. Te responderé en las próximas 24 horas.</p>
              <button className="btn-secondary" onClick={() => setFormSubmitted(false)}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Tu nombre..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  className="glass-input"
                  placeholder="tu@correo.com..."
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mensaje / Propuesta</label>
                <textarea
                  className="glass-input textarea"
                  rows={5}
                  placeholder="Cuéntame sobre tu proyecto..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
                <Send size={18} />
                <span>{submitting ? 'Enviando...' : 'Enviar Mensaje'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 60px;
          padding-bottom: 60px;
        }

        .hero-section {
          padding: 60px;
          position: relative;
          overflow: hidden;
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }

        .hero-glow {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(192,132,252,0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-badge {
          font-size: 13px;
          color: var(--primary);
          background: var(--primary-glow);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--border-glow);
          font-weight: 600;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: 54px;
          font-weight: 800;
          letter-spacing: -1.5px;
          color: var(--text-primary);
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary), var(--accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-top: -10px;
        }

        .hero-description {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 700px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }

        .section-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          position: relative;
          padding-left: 16px;
        }

        .section-title::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 4px;
          background: var(--primary);
          border-radius: 4px;
          box-shadow: 0 0 8px var(--primary);
        }

        /* Projects Cards */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .project-card {
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          height: 100%;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
        }

        .project-icon-box {
          background: rgba(192, 132, 252, 0.08);
          border: 1px solid var(--border-glow);
          padding: 12px;
          border-radius: 12px;
        }

        .project-badge {
          font-size: 11px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
        }

        .project-card-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .project-card-desc {
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-secondary);
          flex-grow: 1;
        }

        .project-tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tech-tag {
          font-size: 11px;
          color: var(--accent-cyan);
          background: var(--accent-cyan-glow);
          border: 1px solid rgba(34, 211, 238, 0.15);
          padding: 4px 10px;
          border-radius: 6px;
          font-family: var(--font-mono);
        }

        .btn-project-action {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-family: var(--font-display);
          font-size: 14px;
          transition: var(--transition-smooth);
        }

        .btn-project-action:hover {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
          transform: translateY(-1px);
        }

        /* Tech Stack Grid */
        .stack-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .stack-card {
          padding: 24px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stack-category {
          font-size: 11px;
          color: var(--primary);
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .stack-name {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stack-desc {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        /* Contact Section */
        .contact-card {
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-family: var(--font-display);
          font-weight: 500;
          color: var(--text-secondary);
        }

        .textarea {
          resize: vertical;
        }

        .submit-btn {
          width: 100%;
          justify-content: center;
        }

        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          padding: 20px 0;
        }

        .success-icon {
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 30px;
          }

          .hero-title {
            font-size: 38px;
          }

          .hero-subtitle {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
