import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { SetupTerminalView } from "./views/SetupTerminalView";
import { SettingsView } from "./views/SettingsView";
import { MemoryView } from "./views/MemoryView";
import { WorkflowView } from "./views/WorkflowView";
import { StudioView } from "./views/StudioView";

export default function App() {
  const [currentView, setCurrentView] = useState('studio');
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
      case 'studio':
        return <StudioView />;
      case 'workflows':
        return <WorkflowView />;
      case 'memory':
        return <MemoryView />;
      case 'settings':
        return <SettingsView />;
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
    <div className="flex w-screen h-screen bg-[#0b0c0e] text-text-main overflow-hidden font-sans text-[13px] antialiased selection:bg-accent-dim selection:text-accent relative">
      <Sidebar currentView={currentView} setCurrentView={handleViewChange} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className={`flex-1 overflow-hidden relative ${currentView === 'studio' ? 'p-0' : 'p-4 md:p-6 overflow-y-auto'}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
