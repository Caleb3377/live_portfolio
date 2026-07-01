import React, { useState } from 'react';
import { Play, Pause, Phone, Video, MoreVertical, CheckCheck, Mic, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  type: 'text' | 'voice';
  content: string;
  duration?: string;
  timestamp: string;
  transcription?: string;
  thinking?: string;
}

const WhatsappDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flow' | 'demo'>('flow');
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const steps = [
    { title: "Twilio Webhook", desc: "El webhook de Twilio recibe la nota de voz y la redirige al backend serverless." },
    { title: "Transcripción de Audio", desc: "Se extrae el audio codificado en base64 y se transcribe a texto mediante Whisper API." },
    { title: "Razonamiento Claude", desc: "Claude procesa la transcripción, analiza el historial de chat y genera la respuesta ideal." },
    { title: "Síntesis ElevenLabs", desc: "La respuesta de texto de Claude se envía a la API de ElevenLabs con clonación de voz realista." },
    { title: "Respuesta de Audio", desc: "Twilio responde al webhook original enviando el archivo de audio generado de vuelta a WhatsApp." }
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'user',
      type: 'voice',
      content: 'Nota de voz de 8s',
      duration: '0:08',
      timestamp: '14:23',
      transcription: 'Hola Yerson, me gustaría saber si tu bot puede integrarse directamente con bases de datos en la nube como Supabase y si tiene latencia aceptable para respuestas de voz.',
      thinking: 'El usuario pregunta por la integración con Supabase y la latencia. \n1. Confirmar la viabilidad técnica: Supabase JS SDK es totalmente compatible con Deno/Node.\n2. Explicar optimización de latencia: ElevenLabs streaming y respuestas parciales (chunking) de Claude.'
    },
    {
      id: 'msg-2',
      sender: 'bot',
      type: 'voice',
      content: 'Audio generado por ElevenLabs',
      duration: '0:12',
      timestamp: '14:24',
      transcription: '¡Hola! Sí, absolutamente. El bot está diseñado para conectarse a Supabase y guardar logs o perfiles en tiempo real. Para la latencia, transmitimos en streaming los caracteres de Claude directo a ElevenLabs, logrando respuestas por voz en menos de 1.5 segundos.'
    }
  ];

  const handlePlayVoice = (msgId: string, index: number) => {
    if (isPlaying === msgId) {
      setIsPlaying(null);
      setCurrentStep(-1);
    } else {
      setIsPlaying(msgId);
      setCurrentStep(index === 0 ? 1 : 4);
      
      // Simulate pipeline progression steps
      if (index === 0) {
        setTimeout(() => setCurrentStep(2), 2000);
        setTimeout(() => setCurrentStep(3), 4500);
      } else {
        setTimeout(() => setCurrentStep(4), 1500);
      }

      // Automatically stop after duration
      const durationMs = index === 0 ? 8000 : 12000;
      setTimeout(() => {
        setIsPlaying((current) => current === msgId ? null : current);
        if (index === 0) setCurrentStep(3); // Keep it on the last step of the workflow
      }, durationMs);
    }
  };

  return (
    <div className="whatsapp-container">
      <div className="whatsapp-header">
        <h2 className="glow-text">WhatsApp AI Bot de Voz (ElevenLabs)</h2>
        <p className="subtitle">
          Simulador interactivo del bot conversacional de voz. Twilio webhook → Transcripción → Razonamiento del LLM → Síntesis con voz humana ultra realista de ElevenLabs.
        </p>
      </div>

      <div className="whatsapp-tabs">
        <button 
          className={`tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
          onClick={() => setActiveTab('flow')}
        >
          Diagrama del Flujo
        </button>
        <button 
          className={`tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          Simulador Móvil Interactivo
        </button>
      </div>

      <div className="whatsapp-content">
        {activeTab === 'flow' ? (
          <div className="flow-wrapper glass-panel">
            <h3 className="card-title">Arquitectura del Webhook de Voz</h3>
            <div className="flow-steps-grid">
              {steps.map((step, idx) => (
                <div key={idx} className={`flow-step-card ${currentStep >= idx ? 'glow-step' : ''}`}>
                  <span className="flow-step-num">{idx + 1}</span>
                  <h4 className="flow-step-title">{step.title}</h4>
                  <p className="flow-step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="video-placeholder">
              <span className="pulse-indicator" />
              <span>Para el portfolio en producción, se recomienda incrustar un vídeo demo grabado de WhatsApp aquí.</span>
            </div>
          </div>
        ) : (
          <div className="demo-wrapper">
            {/* Phone Mockup */}
            <div className="phone-container glass-panel">
              {/* Phone Header */}
              <div className="phone-header">
                <ArrowLeft size={20} color="#fff" />
                <div className="phone-avatar-box">
                  <div className="phone-avatar">YS</div>
                </div>
                <div className="phone-contact-info">
                  <span className="phone-contact-name">Yerson (AI Voice Assistant)</span>
                  <span className="phone-contact-status">en línea</span>
                </div>
                <div className="phone-header-actions">
                  <Video size={18} color="#fff" />
                  <Phone size={18} color="#fff" />
                  <MoreVertical size={18} color="#fff" />
                </div>
              </div>

              {/* Chat Area */}
              <div className="phone-chat-body">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  const isAudioPlaying = isPlaying === msg.id;

                  return (
                    <div key={msg.id} className={`chat-bubble-row ${isUser ? 'user-row' : 'bot-row'}`}>
                      <div className={`chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                        {/* Audio Wave player */}
                        <div className="audio-player-row">
                          <button 
                            className="btn-play-pause"
                            onClick={() => handlePlayVoice(msg.id, idx)}
                          >
                            {isAudioPlaying ? <Pause size={16} fill="#fff" /> : <Play size={16} fill="#fff" />}
                          </button>
                          
                          <div className="waveform-box">
                            <div className={`waveform-bars ${isAudioPlaying ? 'playing' : ''}`}>
                              <span style={{height: '12px'}}/>
                              <span style={{height: '18px'}}/>
                              <span style={{height: '14px'}}/>
                              <span style={{height: '24px'}}/>
                              <span style={{height: '10px'}}/>
                              <span style={{height: '20px'}}/>
                              <span style={{height: '14px'}}/>
                              <span style={{height: '16px'}}/>
                            </div>
                            <span className="audio-duration">{msg.duration}</span>
                          </div>
                        </div>

                        {/* Interactive metadata/transcription */}
                        {(isAudioPlaying || currentStep >= (idx === 0 ? 1 : 4)) && (
                          <div className="msg-details">
                            <div className="details-divider" />
                            <div className="details-section">
                              <span className="details-label">Transcripción:</span>
                              <p className="details-text">{msg.transcription}</p>
                            </div>
                            {msg.thinking && (
                              <div className="details-section">
                                <span className="details-label">Pensamiento Claude:</span>
                                <pre className="details-thinking">{msg.thinking}</pre>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="chat-bubble-footer">
                          <span className="chat-time">{msg.timestamp}</span>
                          {!isUser && <CheckCheck size={16} color="#4facfe" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phone Footer input */}
              <div className="phone-chat-footer">
                <input 
                  type="text" 
                  className="phone-input" 
                  placeholder="Mensaje de prueba..." 
                  disabled
                />
                <div className="phone-mic-box">
                  <Mic size={20} color="#fff" />
                </div>
              </div>
            </div>

            {/* Explanatory sidebar of the current simulation step */}
            <div className="pipeline-state-panel glass-panel">
              <h3 className="card-title">Ejecución del Webhook</h3>
              {currentStep === -1 ? (
                <div className="empty-state">
                  <Play size={32} color="#c084fc" />
                  <p>Presiona el botón de reproducción de la **nota de voz del usuario** en el móvil para visualizar el flujo paso a paso en tiempo real.</p>
                </div>
              ) : (
                <div className="current-step-display">
                  <div className="step-badge">Paso {currentStep + 1}</div>
                  <h4 className="active-step-title">{steps[currentStep].title}</h4>
                  <p className="active-step-desc">{steps[currentStep].desc}</p>
                  
                  {currentStep >= 2 && (
                    <div className="step-meta">
                      <span className="pulse-indicator green" />
                      <span>Procesando con baja latencia en ElevenLabs...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .whatsapp-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding-bottom: 40px;
          height: 100%;
        }

        .whatsapp-header {
          text-align: left;
        }

        .whatsapp-header h2 {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .whatsapp-header .subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 800px;
          margin-top: 8px;
        }

        .whatsapp-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 15px;
          padding: 8px 16px;
          cursor: pointer;
          border-radius: 8px;
          transition: var(--transition-smooth);
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .tab-btn.active {
          color: var(--primary);
          background: rgba(192, 132, 252, 0.08);
        }

        .flow-wrapper {
          padding: 30px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .flow-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .flow-step-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: 12px;
          position: relative;
          transition: var(--transition-smooth);
        }

        .flow-step-card.glow-step {
          border-color: var(--primary);
          box-shadow: 0 0 15px var(--primary-glow);
          background: rgba(192, 132, 252, 0.03);
        }

        .flow-step-num {
          position: absolute;
          top: 15px;
          right: 15px;
          font-family: var(--font-mono);
          font-size: 24px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.05);
        }

        .flow-step-card.glow-step .flow-step-num {
          color: var(--primary);
        }

        .flow-step-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .flow-step-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .video-placeholder {
          background: rgba(0, 0, 0, 0.3);
          border: 1px dashed var(--border-color);
          padding: 30px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        /* Mobile Demo UI */
        .demo-wrapper {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 30px;
          align-items: start;
        }

        .phone-container {
          background: #0b141a; /* WhatsApp Dark Mode bg */
          border-radius: 32px;
          border: 4px solid #2e303a;
          height: 560px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        }

        .phone-header {
          background: #1f2c34;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .phone-avatar-box {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phone-avatar {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 12px;
          color: #fff;
        }

        .phone-contact-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex-grow: 1;
        }

        .phone-contact-name {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        .phone-contact-status {
          font-size: 10px;
          color: #8596a0;
        }

        .phone-header-actions {
          display: flex;
          gap: 16px;
        }

        .phone-chat-body {
          flex-grow: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-image: radial-gradient(#1f2c34 1px, transparent 1px);
          background-size: 16px 16px;
        }

        .chat-bubble-row {
          display: flex;
          width: 100%;
        }

        .user-row {
          justify-content: flex-end;
        }

        .bot-row {
          justify-content: flex-start;
        }

        .chat-bubble {
          max-width: 85%;
          padding: 10px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .user-bubble {
          background: #005c4b; /* WhatsApp Green */
          color: #e9edef;
          border-top-right-radius: 0;
        }

        .bot-bubble {
          background: #202c33;
          color: #e9edef;
          border-top-left-radius: 0;
        }

        .audio-player-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 240px;
        }

        .btn-play-pause {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .waveform-box {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .waveform-bars {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 24px;
        }

        .waveform-bars span {
          width: 3px;
          background: #8596a0;
          border-radius: 2px;
        }

        .waveform-bars.playing span {
          background: var(--accent-cyan);
          animation: danceBar 1s infinite alternate;
        }

        .waveform-bars.playing span:nth-child(2n) {
          animation-delay: 0.2s;
        }

        .waveform-bars.playing span:nth-child(3n) {
          animation-delay: 0.4s;
        }

        @keyframes danceBar {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.2); }
        }

        .audio-duration {
          font-size: 9px;
          color: #8596a0;
          text-align: left;
        }

        .msg-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          background: rgba(0, 0, 0, 0.15);
          padding: 8px;
          border-radius: 6px;
        }

        .details-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        .details-label {
          font-size: 9px;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
          font-weight: bold;
        }

        .details-text {
          font-size: 11px;
          line-height: 1.4;
          color: #e9edef;
        }

        .details-thinking {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #a78bfa;
          white-space: pre-wrap;
          line-height: 1.3;
        }

        .chat-bubble-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          color: #8596a0;
          margin-top: 2px;
        }

        .phone-chat-footer {
          background: #1f2c34;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .phone-input {
          flex-grow: 1;
          background: #2a3942;
          border: none;
          color: #fff;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 13px;
        }

        .phone-mic-box {
          background: #00a884;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Pipeline state panel */
        .pipeline-state-panel {
          padding: 24px;
          text-align: left;
          height: 100%;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          gap: 16px;
          color: var(--text-secondary);
          text-align: center;
          padding: 20px;
        }

        .current-step-display {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px 0;
        }

        .step-badge {
          font-size: 11px;
          color: var(--primary);
          background: var(--primary-glow);
          border: 1px solid var(--border-glow);
          padding: 4px 10px;
          border-radius: 4px;
          font-family: var(--font-mono);
          align-self: flex-start;
        }

        .active-step-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .active-step-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .step-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .demo-wrapper {
            grid-template-columns: 1fr;
          }

          .phone-container {
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default WhatsappDemo;
