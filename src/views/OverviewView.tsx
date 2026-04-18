import React, { useState, useEffect } from "react";
import { Activity, Cpu, Database, Radio, Server, MessageSquare, Zap, Network, Bot, LayoutTemplate, Timer, Globe2 } from "lucide-react";

export function OverviewView() {
  const [activeModelName, setActiveModelName] = useState("Gemini 2.5 Flash");
  const [activeChannelsCount, setActiveChannelsCount] = useState(0);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    // Sync model
    const mName = localStorage.getItem("seabot-active-model-name");
    if (mName) setActiveModelName(mName);

    // Sync channels
    const channelsData = localStorage.getItem("seabot-channels");
    if (channelsData) {
      try {
        const channels: any[] = JSON.parse(channelsData);
        setActiveChannelsCount(channels.filter(c => c.isActive).length);
      } catch (e) {}
    }

    // Mock Uptime
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     const s = seconds % 60;
     if (h > 0) return `${h}h ${m}m ${s}s`;
     if (m > 0) return `${m}m ${s}s`;
     return `${s}s`;
  };

  return (
    <div className="flex flex-col w-full h-full p-6 md:p-8 bg-[#0A0A0A] text-[#ededed] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="mb-8 border-b border-[#222] pb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <LayoutTemplate className="w-6 h-6 text-blue-400" /> System Overview
        </h1>
        <p className="text-[#a1a1aa] text-[13px]">Real-time telemetry, agent routing status, and infrastructure metrics.</p>
      </div>

      {/* Top 4 Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Model Module */}
        <div className="bg-gradient-to-br from-[#111] to-[#151515] border border-[#222] rounded-xl p-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot className="w-16 h-16 text-blue-500" />
           </div>
           <div className="text-[10px] uppercase tracking-wider font-bold text-[#777] mb-3 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-400" /> Active Core Routing</div>
           <div className="text-xl font-bold text-white mb-1 truncate">{activeModelName}</div>
           <div className="text-[11px] text-[#555] font-mono"><span className="text-green-500">●</span> Stream established</div>
        </div>

        {/* Channels Module */}
        <div className="bg-gradient-to-br from-[#111] to-[#151515] border border-[#222] rounded-xl p-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe2 className="w-16 h-16 text-emerald-500" />
           </div>
           <div className="text-[10px] uppercase tracking-wider font-bold text-[#777] mb-3 flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-emerald-400" /> Webhook Listeners</div>
           <div className="text-2xl font-bold text-white mb-1">{activeChannelsCount}</div>
           <div className="text-[11px] text-[#555] font-mono">Bound to native network ports</div>
        </div>

        {/* Sessions Module */}
        <div className="bg-gradient-to-br from-[#111] to-[#151515] border border-[#222] rounded-xl p-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageSquare className="w-16 h-16 text-purple-500" />
           </div>
           <div className="text-[10px] uppercase tracking-wider font-bold text-[#777] mb-3 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-purple-400" /> Live Agent Sessions</div>
           <div className="text-2xl font-bold text-white mb-1">1</div>
           <div className="text-[11px] text-[#555] font-mono">Primary IDE Chat thread active</div>
        </div>

        {/* Uptime Module */}
        <div className="bg-gradient-to-br from-[#111] to-[#151515] border border-[#222] rounded-xl p-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Timer className="w-16 h-16 text-amber-500" />
           </div>
           <div className="text-[10px] uppercase tracking-wider font-bold text-[#777] mb-3 flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-amber-400" /> Daemon Uptime</div>
           <div className="text-xl font-bold text-white mb-1 font-mono tracking-tight">{formatUptime(uptime)}</div>
           <div className="text-[11px] text-[#555] font-mono"><span className="text-amber-500">●</span> Local Node 3000</div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Metric Charts */}
        <div className="col-span-1 lg:col-span-2 border border-[#222] bg-[#111] rounded-xl flex flex-col overflow-hidden">
           <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#161616]">
              <div className="text-[12px] font-bold text-white flex items-center gap-2"><Cpu className="w-4 h-4 text-[#888]" /> Edge Node Performance</div>
              <div className="text-[10px] bg-blue-500/10 text-blue-400 font-mono px-2 py-0.5 rounded">LIVE</div>
           </div>
           <div className="flex-1 p-6 flex flex-col justify-end relative">
               <div className="absolute top-4 left-6 text-[24px] font-bold font-mono tracking-tight text-white mb-1">104<span className="text-[12px] text-[#777] ml-1">MB RAM</span></div>
               {/* Mock CSS Wave Graph */}
               <div className="w-full h-32 flex items-end gap-1 opacity-60">
                 {[40, 45, 30, 60, 55, 75, 40, 80, 95, 60, 50, 40, 45, 30, 40, 50, 60, 45, 55, 40].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/50 to-blue-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                 ))}
               </div>
           </div>
        </div>

        {/* Quick Logs / Database Vault */}
        <div className="col-span-1 border border-[#222] bg-[#111] rounded-xl flex flex-col overflow-hidden">
           <div className="p-4 border-b border-[#222] flex items-center gap-2 bg-[#161616]">
              <Database className="w-4 h-4 text-[#888]" /> 
              <div className="text-[12px] font-bold text-white">System Memory Vault</div>
           </div>
           <div className="flex-1 p-4 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#333] border-t-purple-500 mb-4 animate-spin-slow flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#222] border-b-blue-500 animate-spin-reverse"></div>
              </div>
              <p className="text-[13px] text-white font-medium mb-1">Vault Synchronized</p>
              <p className="text-[11px] text-[#777] px-4 leading-relaxed">
                 Auto-saved architecture snippets and agent memories are being safely stored via embedded NoSQL block mapping.
              </p>
           </div>
           <div className="border-t border-[#222] p-3 flex justify-between items-center text-[10px] font-mono text-[#555] bg-[#0A0A0A]">
              <span>Index Size: 1.2KB</span>
              <span className="text-green-500">Secured</span>
           </div>
        </div>

      </div>

    </div>
  );
}
