import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { TerminalView } from "./views/TerminalView";
import { SetupTerminalView } from "./views/SetupTerminalView";
import { SettingsView } from "./views/SettingsView";
import { WorkspaceView } from "./views/WorkspaceView";
import { MemoryView } from "./views/MemoryView";
import { CommandCenterView } from "./views/CommandCenterView";
import { WorkflowView } from "./views/WorkflowView";

export default function App() {
  const [currentView, setCurrentView] = useState('command-center');
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
      case 'command-center':
        return <CommandCenterView />;
      case 'workflows':
        return <WorkflowView />;
      case 'workspace':
        return <WorkspaceView />;
      case 'memory':
        return <MemoryView />;
      case 'terminal':
        return <TerminalView />;
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
