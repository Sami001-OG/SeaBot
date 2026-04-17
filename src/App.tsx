import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { VisionView } from "./views/VisionView";
import { ArchitectureView } from "./views/ArchitectureView";
import { AgentEngineView } from "./views/AgentEngineView";
import { CapabilitiesView } from "./views/CapabilitiesView";

export default function App() {
  const [currentView, setCurrentView] = useState('vision');

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
          <div className="p-6 max-w-[1200px] mx-auto flex flex-col items-center justify-center h-full text-text-dim">
            <h2 className="text-[12px] uppercase tracking-[0.05em] font-semibold text-text-main mb-2">Step 8: UI/UX Design</h2>
            <p className="text-center max-w-lg mb-8 text-[13px]">This entire application is the fulfillment of Step 8: delivering a professional, SaaS-grade React dashboard as the Web Interface module.</p>
          </div>
        );
      case 'terminal':
        return (
          <div className="p-6 max-w-[1200px] mx-auto h-full flex flex-col">
            <h2 className="text-[12px] uppercase tracking-[0.05em] font-semibold text-text-dim mb-4">Step 10: Code Generation & Execution</h2>
            <div className="flex-1 bg-terminal-bg border border-terminal-border rounded-[4px] p-4 font-mono text-[12px] leading-[1.6] text-[#a5b4fc] overflow-y-auto">
              <div><span className="text-success">[14:02:11]</span> <span>➜</span> ~ nexus status</div>
              <div className="mt-1"><span className="text-success">[14:02:12]</span> [Nexus Core] Hybrid mode engaged. Local router ready.</div>
              <div className="mt-1"><span className="text-success">[14:02:12]</span> [Agent Pool] 0 active processes.</div>
              <div className="mt-2 animate-pulse">_</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 flex items-center justify-center h-full text-text-dim">
            Not Implemented Yet
          </div>
        );
    }
  };

  return (
    <div className="flex w-screen h-screen bg-bg-base text-text-main overflow-hidden font-sans text-[13px] antialiased selection:bg-accent-dim selection:text-accent">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 bg-bg-base">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
