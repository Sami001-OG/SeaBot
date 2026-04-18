import React, { useState, useEffect } from "react";
import { Link, Radio, Plus, Trash2, Webhook, MessageSquare, ShieldCheck, Github, MessageCircle, Settings, X, Power, PowerOff } from "lucide-react";

interface ChannelConfig {
  id: string;
  type: 'telegram' | 'whatsapp' | 'slack' | 'github' | 'custom';
  name: string;
  identifier: string; // Token, SID, etc. masked
  isActive: boolean;
  createdAt: number;
}

export function ChannelsView() {
  const [channels, setChannels] = useState<ChannelConfig[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Modal Form State
  const [newType, setNewType] = useState<ChannelConfig['type']>('telegram');
  const [newName, setNewName] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("seabot-channels");
    if (saved) {
      try {
        setChannels(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Mock some default disconnected states if empty to show the UI
      setChannels([
        { id: 'mock-1', type: 'telegram', name: 'Main Telegram Bot', identifier: 'bot123456:AA.......', isActive: false, createdAt: Date.now() }
      ]);
    }
  }, []);

  const saveChannels = (newChannels: ChannelConfig[]) => {
    setChannels(newChannels);
    localStorage.setItem("seabot-channels", JSON.stringify(newChannels));
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newIdentifier.trim()) return;

    const newChannel: ChannelConfig = {
      id: `chan_${Math.random().toString(36).substr(2, 9)}`,
      type: newType,
      name: newName,
      identifier: newIdentifier,
      isActive: true,
      createdAt: Date.now()
    };

    const updated = [...channels, newChannel];
    saveChannels(updated);
    setIsAddModalOpen(false);
    setNewName("");
    setNewIdentifier("");

    // If writing to backend mapping for the primary ones
    const envMap: Record<string, string> = {};
    if (newType === 'telegram') envMap['TELEGRAM_BOT_TOKEN'] = newIdentifier;
    if (newType === 'slack') envMap['SLACK_BOT_TOKEN'] = newIdentifier;
    if (newType === 'github') envMap['GITHUB_ACCESS_TOKEN'] = newIdentifier;
    
    if (Object.keys(envMap).length > 0) {
       await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(envMap)
       });
    }
  };

  const handleDelete = (id: string) => {
    saveChannels(channels.filter(c => c.id !== id));
  };

  const toggleActive = (id: string) => {
    saveChannels(channels.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const getPlatformIcon = (type: string) => {
     switch(type) {
        case 'telegram': return <MessageCircle className="w-5 h-5 text-[#38bdf8]" />;
        case 'whatsapp': return <MessageSquare className="w-5 h-5 text-[#4ade80]" />;
        case 'slack': return <img src="https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png" className="w-5 h-5 grayscale hover:grayscale-0 transition-all opacity-80" alt="slack" />;
        case 'github': return <Github className="w-5 h-5 text-[#ededed]" />;
        default: return <Webhook className="w-5 h-5 text-[#a78bfa]" />;
     }
  };

  const getPlatformLabel = (type: string) => {
     switch(type) {
        case 'telegram': return 'Telegram Bot API';
        case 'whatsapp': return 'WhatsApp (Twilio)';
        case 'slack': return 'Slack Events/RTM';
        case 'github': return 'GitHub App Webhook';
        default: return 'Custom Webhook';
     }
  };

  return (
    <div className="flex flex-col w-full h-full p-6 md:p-8 bg-[#0A0A0A] text-[#ededed] overflow-y-auto custom-scrollbar relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#222] pb-6">
        <div>
           <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
             <Link className="w-6 h-6 text-blue-400" /> Channels & Webhooks
           </h1>
           <p className="text-[#a1a1aa] text-[13px]">Manage active omni-channel listeners connected to the SeaBot Gateway.</p>
        </div>
        <button 
           onClick={() => setIsAddModalOpen(true)}
           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-[12px] font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
        >
           <Plus className="w-4 h-4" /> Add Channel
        </button>
      </div>

      {/* Connection Grid */}
      {channels.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#333] rounded-2xl bg-white/[0.01]">
            <Radio className="w-12 h-12 text-[#444] mb-4" />
            <span className="text-[#888] font-medium">No channels configured</span>
            <span className="text-[#555] text-xs mt-1">Add a webhook destination or bot API token to start listening.</span>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {channels.map((channel) => (
               <div key={channel.id} className="border border-[#222] bg-[#111] rounded-xl overflow-hidden flex flex-col shadow-sm group">
                  <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#161616]">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[#333] flex items-center justify-center">
                           {getPlatformIcon(channel.type)}
                        </div>
                        <div>
                           <div className="font-bold text-[13px] text-[#ededed] mb-0.5 max-w-[120px] truncate">{channel.name}</div>
                           <div className="text-[10px] text-[#777] font-mono tracking-wide">{getPlatformLabel(channel.type)}</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                           onClick={() => toggleActive(channel.id)}
                           className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${channel.isActive ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
                           title={channel.isActive ? "Deactivate Channel" : "Activate Channel"}
                        >
                           {channel.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                     <div className="mb-4">
                        <div className="text-[10px] text-[#666] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                           <ShieldCheck className="w-3.5 h-3.5" /> Authentication Identity
                        </div>
                        <div className="bg-[#050505] border border-[#222] rounded p-2 text-[11px] font-mono text-[#a1a1aa] truncate flex items-center justify-between">
                           <span>{channel.identifier.substring(0, 8)}...{channel.identifier.substring(channel.identifier.length - 4)}</span>
                           <span className="text-[9px] text-[#555] bg-[#111] px-1 rounded">Hidden</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#555]">
                           <span className={`w-2 h-2 rounded-full ${channel.isActive ? 'bg-green-500 animate-pulse border border-green-400' : 'bg-[#444]'}`}></span>
                           {channel.isActive ? 'Polling / Listening' : 'Disconnected'}
                        </div>
                        <div className="flex gap-2">
                           <button className="text-[#777] hover:text-white transition-colors" title="Settings"><Settings className="w-4 h-4" /></button>
                           <button 
                              onClick={() => handleDelete(channel.id)}
                              className="text-[#777] hover:text-red-400 transition-colors"
                              title="Delete Channel"
                           ><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-[#333] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between p-4 border-b border-[#222]">
                  <h3 className="font-bold text-[#ededed] text-lg">Add New Channel</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-[#777] hover:text-white"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleAddChannel} className="p-6">
                  
                  <div className="mb-5">
                     <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">Platform</label>
                     <div className="grid grid-cols-5 gap-2">
                        {(['telegram', 'whatsapp', 'slack', 'github', 'custom'] as const).map(t => (
                           <button
                              key={t}
                              type="button"
                              onClick={() => setNewType(t)}
                              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${newType === t ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-[#0A0A0A] border-[#333] text-[#777] hover:border-[#555]'}`}
                           >
                              {getPlatformIcon(t)}
                              <span className="text-[9px] font-bold uppercase">{t.substring(0,4)}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="mb-5">
                     <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">Connection Name</label>
                     <input 
                        required
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Acme Support Bot"
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[13px] text-white focus:border-blue-500 outline-none"
                     />
                  </div>

                  <div className="mb-6">
                     <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">Token / Webhook ID / Account SID</label>
                     <input 
                        required
                        type="password" 
                        value={newIdentifier}
                        onChange={(e) => setNewIdentifier(e.target.value)}
                        placeholder="Paste authentication token or channel ID here..."
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[13px] font-mono text-white focus:border-blue-500 outline-none"
                     />
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-sm font-medium transition-colors">Cancel</button>
                     <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">Connect Channel</button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}
