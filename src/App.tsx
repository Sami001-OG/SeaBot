import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { VisionView } from "./views/VisionView";
import { ArchitectureView } from "./views/ArchitectureView";
import { AgentEngineView } from "./views/AgentEngineView";
import { CapabilitiesView } from "./views/CapabilitiesView";
import { TerminalView } from "./views/TerminalView";
import { SetupTerminalView } from "./views/SetupTerminalView";

export default function App() {
  const [currentView, setCurrentView] = useState('vision');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configured = localStorage.getItem("seabot-configured");
    if (configured) setIsConfigured(true);
  }, []);

  if (!isConfigured) {
    return <SetupTerminalView onComplete={() => {
      localStorage.setItem("seabot-configured", "true");
      setIsConfigured(true);
    }} />
  }

  const renderView = () => {
    switch (currentView) {
      case 'vision':
        return <VisionView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'agent':
        return <AgentEngineView />;
      case 'capabilities':
        return <CapabilitiesView />;
      case 'ui':
        return (
          <div className="p-4 md:p-6 max-w-[1200px] mx-auto flex flex-col items-center justify-center h-full text-text-dim">
            <h2 className="text-[12px] uppercase tracking-[0.05em] font-semibold text-text-main mb-2">Step 8: Dashboard Architecture</h2>
            <p className="text-center max-w-lg mb-8 text-[13px]">This entire application fulfills Step 8: delivering a professional, SaaS-grade React dashboard as the Web Interface module.</p>
          </div>
        );
      case 'terminal':
        return <TerminalView />;
      default:
        return (
          <div className="p-4 md:p-6 flex items-center justify-center h-full text-text-dim">
            Not Implemented Yet
          </div>
        );
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex w-screen h-screen bg-bg-base text-text-main overflow-hidden font-sans text-[13px] antialiased selection:bg-accent-dim selection:text-accent relative">
      <Sidebar currentView={currentView} setCurrentView={handleViewChange} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-bg-base relative">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
