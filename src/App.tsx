import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { VisionView } from "./views/VisionView";
import { ArchitectureView } from "./views/ArchitectureView";
import { AgentEngineView } from "./views/AgentEngineView";
import { CapabilitiesView } from "./views/CapabilitiesView";
import { AgentBrain } from "./engine/AgentBrain";
import { ReActStep } from "./engine/types";

export default function App() {
  const [currentView, setCurrentView] = useState('vision');
  const [terminalLogs, setTerminalLogs] = useState<ReActStep[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Run the agent brain simulation on mount
  useEffect(() => {
    const orchestrator = new AgentBrain('SYSTEM-01');
    
    const handleStep = (step: ReActStep) => {
      setTerminalLogs(prev => [...prev, step]);
    };

    orchestrator.on('step', handleStep);

    // Give it a brief delay before starting the simulation to feel realistic
    const runSim = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      orchestrator.executeObjective("Ensure system local environments are verified and integrated.");
    };

    runSim();
    
    return () => {
      // In a real app we'd want a cleanup method on the event emitter
    };
  }, []);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'system': return 'text-success';
      case 'thought': return 'text-text-dim italic';
      case 'action': return 'text-warning font-bold';
      case 'observation': return 'text-[#a5b4fc]';
      case 'reflection': return 'text-accent';
      case 'error': return 'text-red-500 font-bold bg-red-500/10 p-1 rounded';
      default: return 'text-text-main';
    }
  };

  const getLogPrefix = (type: string) => {
    switch (type) {
      case 'thought': return '[THINK]';
      case 'action': return '[TOOLS]';
      case 'observation': return '[RESULT]';
      case 'reflection': return '[REFLECT]';
      case 'error': return '[ERROR]';
      case 'system': return '[AGENT]';
      default: return '[SYS]';
    }
  };

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
          <div className="p-6 max-w-[1200px] mx-auto h-full flex flex-col pb-10">
            <h2 className="text-[12px] uppercase tracking-[0.05em] font-semibold text-text-dim mb-4">Step 10: Code Generation & Execution</h2>
            <div 
              ref={scrollRef}
              className="flex-1 bg-terminal-bg border border-terminal-border rounded-[4px] p-4 font-mono text-[12px] leading-[1.6] text-text-main overflow-y-auto"
            >
              <div className="mb-4">
                <span className="text-success">[14:00:00]</span> <span>➜</span> ~ nexus start --hybrid
              </div>
              <div className="mt-1"><span className="text-success">[14:00:01]</span> [Nexus Core] Hybrid mode engaged. Local router ready.</div>
              <div className="mt-1 mb-6"><span className="text-success">[14:00:01]</span> [Agent Pool] SYSTEM-01 Orchestrator initialized.</div>
              
              {terminalLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false });
                return (
                  <div key={log.id} className="mt-1 flex items-start group hover:bg-white/5 px-2 rounded-sm transition-colors">
                    <span className="text-success min-w-[75px] shrink-0">[{timeStr}]</span>
                    <span className={`mr-3 font-semibold min-w-[70px] shrink-0 ${getLogColor(log.type)}`}>
                      {getLogPrefix(log.type)}
                    </span>
                    <span className={`break-words flex-1 ${getLogColor(log.type)}`}>
                      {log.content}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 text-border-default text-[10px] ml-4 shrink-0 transition-opacity">
                      {log.agentId}
                    </span>
                  </div>
                );
              })}
              
              <div className="mt-2 flex items-center px-2">
                <span className="text-success">[     LIVE]</span>
                <span className="ml-3 font-semibold min-w-[70px] invisible">[WAIT]</span>
                <span className="animate-pulse">_</span>
              </div>
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
