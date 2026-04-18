import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { SetupTerminalView } from "./views/SetupTerminalView";
import { SettingsView } from "./views/SettingsView";
import { StudioView } from "./views/StudioView";
import { ChannelsView } from "./views/ChannelsView";
import { OverviewView } from "./views/OverviewView";
import { NodesView } from "./views/NodesView";
import { SessionsView } from "./views/SessionsView";
import { CronView } from "./views/CronView";
import { SkillsView } from "./views/SkillsView";
import { TopBar } from "./components/TopBar";

// Generic View Shell for Dashboard Sections
function PlaceholderView({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col w-full h-full p-8 bg-[#0b0c0e]">
      <div className="mb-6 border-b border-[#222] pb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-[#a1a1aa] text-sm">{description}</p>
      </div>
      <div className="flex-1 flex items-center justify-center border border-dashed border-[#333] rounded-xl bg-white/[0.01]">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333]">
             <div className="w-2 h-2 rounded-full bg-[#555] animate-pulse"></div>
          </div>
          <h3 className="text-[#ededed] font-medium text-sm mb-1">Module Initializing</h3>
          <p className="text-[12px] text-[#777] max-w-sm">
            This module is being provisioned by the SeaBot core OS. Telemetry streams will appear here when active.
          </p>
        </div>
      </div>
    </div>
  );
}

// Live Logs Viewer
function LogsView() {
  const [logs, setLogs] = useState<string[]>([
     `[SYSTEM] SeaBot OS Daemon Initialization sequence starting...`,
     `[SYSTEM] Binding VectorDB Vault... OK.`,
     `[SYSTEM] Mounting OpenRouter Engine... OK.`
  ]);

  useEffect(() => {
    const lines = [
       "[GATEWAY] Checking connection to Anthropic APIs... OK.",
       "[GATEWAY] Checking connection to OpenAI APIs... OK.",
       "[CRON] Loaded 0 active background routines.",
       "[NET] Webhook listeners attached to local 3000 port.",
       "[MEM] Total isolated RAM utilization: 104MB.",
       "Waiting for incoming connections on /api/agent/stream..."
    ];
    let step = 0;
    const t = setInterval(() => {
      if (step < lines.length) {
         setLogs(prev => [...prev, lines[step]]);
         step++;
      }
    }, 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col w-full h-full p-8 bg-[#0b0c0e]">
      <div className="mb-6 border-b border-[#222] pb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Global System Logs</h1>
        <p className="text-[#a1a1aa] text-sm">Streaming stdout/stderr from the main SeaBot OS daemon cluster.</p>
      </div>
      <div className="flex-1 bg-[#050505] border border-[#222] rounded-xl p-4 font-mono text-[12px] text-[#ededed] overflow-y-auto">
        {logs.map((L, i) => (
           <div key={i} className="mb-1 text-[#a1a1aa]">
              <span className="text-[#555] mr-2">{(new Date()).toISOString().split('T')[1].split('.')[0]}</span>
              {L}
           </div>
        ))}
        <div className="h-4 w-2 bg-[#555] animate-pulse mt-1"></div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('chat');
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
      case 'chat':
        return <StudioView />;
      case 'config':
        return <SettingsView />;
      case 'overview':
        return <OverviewView />;
      case 'channels':
        return <ChannelsView />;
      case 'instances':
        return <NodesView />;
      case 'sessions':
        return <SessionsView />;
      case 'cron':
        return <CronView />;
      case 'skills':
        return <SkillsView />;
      case 'nodes':
        return <PlaceholderView title="Hardware Nodes" description="API latency graphs and edge-compute hardware node mapping." />;
      case 'debug':
        return <PlaceholderView title="Debugger" description="Tracing tools, breakpoint management, and real-time inspector." />;
      case 'logs':
        return <LogsView />;
      default:
        return <PlaceholderView title="Unknown Module" description="This module is lost in the void." />;
    }
  };

  return (
    <div className="flex w-screen h-screen bg-[#0A0A0A] text-[#ededed] overflow-hidden font-sans text-[13px] antialiased">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {currentView !== 'chat' && <TopBar toggleMobileMenu={() => {}} />}
        <main className={`flex-1 overflow-y-auto ${currentView === 'chat' ? 'p-0 h-full' : 'p-0 bg-[#0b0c0e] h-full'}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
