import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { SetupTerminalView } from "./views/SetupTerminalView";
import { SettingsView } from "./views/SettingsView";
import { MemoryView } from "./views/MemoryView";
import { WorkflowView } from "./views/WorkflowView";
import { StudioView } from "./views/StudioView";
import { TopBar } from "./components/TopBar";

export default function App() {
  const [currentView, setCurrentView] = useState('studio');
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
          <div className="p-4 md:p-6 flex items-center justify-center h-full text-[#777]">
            Not Implemented Yet
          </div>
        );
    }
  };

  return (
    <div className="flex w-screen h-screen bg-[#0A0A0A] text-[#ededed] overflow-hidden font-sans text-[13px] antialiased">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {currentView !== 'studio' && <TopBar toggleMobileMenu={() => {}} />}
        <main className={`flex-1 overflow-y-auto ${currentView === 'studio' ? 'p-0 h-full' : 'p-4 md:p-8 bg-[#0b0c0e]'}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
