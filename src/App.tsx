import React, { useState } from 'react';
import { Home as HomeIcon, Database, MessageSquare, Terminal, Menu, X, Cpu } from 'lucide-react';
import Home from './components/Home';
import RagDemo from './components/RagDemo';
import WhatsappDemo from './components/WhatsappDemo';
import WebGenerator from './components/WebGenerator';

type Tab = 'portfolio' | 'rag' | 'whatsapp' | 'webgen';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'portfolio', label: 'Portfolio CV', icon: HomeIcon },
    { id: 'rag', label: 'RAG Técnico (PDF)', icon: Database },
    { id: 'whatsapp', label: 'WhatsApp Bot Voz', icon: MessageSquare },
    { id: 'webgen', label: 'Generador Webs IA', icon: Terminal },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return <Home onNavigateToProject={(tab) => setActiveTab(tab)} />;
      case 'rag':
        return <RagDemo />;
      case 'whatsapp':
        return <WhatsappDemo />;
      case 'webgen':
        return <WebGenerator />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header glass-panel">
        <div className="logo-container">
          <Cpu className="logo-icon animate-pulse" size={24} color="#c084fc" />
          <span className="logo-text">AI Portfolio</span>
        </div>
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar glass-panel ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Cpu className="logo-icon" size={32} color="#c084fc" />
          <div className="brand-info">
            <span className="brand-name">AI Developer</span>
            <span className="brand-subtitle">Web Builder</span>
          </div>
        </div>

        <nav className="nav-menu">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.label}</span>
                {isActive && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="status-badge">
            <span className="pulse-indicator green" />
            <span>Supabase Cloud Conectado</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-inner">{renderContent()}</div>
      </main>

      {/* Styles for the layout */}
      <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
        }

        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          padding: 0 20px;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          border-radius: 0 0 16px 16px;
          border-top: none;
          border-inline: none;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 18px;
          background: linear-gradient(135deg, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .menu-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        .sidebar {
          width: 280px;
          position: fixed;
          top: 20px;
          bottom: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          z-index: 90;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.5px;
          color: var(--text-primary);
        }

        .brand-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 14px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 15px;
          text-align: left;
          transition: var(--transition-smooth);
          position: relative;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          background: rgba(192, 132, 252, 0.08);
          color: var(--primary);
          border-color: rgba(192, 132, 252, 0.15);
        }

        .nav-icon {
          transition: var(--transition-smooth);
        }

        .nav-item.active .nav-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 5px rgba(192, 132, 252, 0.4));
        }

        .active-indicator {
          position: absolute;
          right: 16px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--primary);
          box-shadow: 0 0 8px var(--primary);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          background: rgba(16, 185, 129, 0.05);
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .main-content {
          margin-left: 320px;
          flex-grow: 1;
          padding: 20px 20px 20px 0;
          min-height: 100vh;
        }

        .content-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .app-container {
            flex-direction: column;
          }

          .mobile-header {
            display: flex;
          }

          .sidebar {
            position: fixed;
            top: 64px;
            left: -100%;
            bottom: 0;
            width: 80%;
            max-width: 320px;
            height: calc(100vh - 64px);
            border-radius: 0;
            border-inline: none;
            border-bottom: none;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(7, 7, 15, 0.95);
          }

          .sidebar.open {
            left: 0;
          }

          .main-content {
            margin-left: 0;
            padding: 84px 20px 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
