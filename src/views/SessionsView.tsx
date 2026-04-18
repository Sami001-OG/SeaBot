import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar, Clock, Trash2, ArrowRight, Server, FileJson, Play } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export function SessionsView() {
  const [sessions, setSessions] = useState<{name: string, path: string, timestamp: number}[]>([]);
  const [selectedSessionData, setSelectedSessionData] = useState<{id: string, timestamp: number, messages: any[]} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await fetch(`/api/fs/list?path=system_memory/sessions`);
      if (res.ok) {
        const files = await res.json();
        const parsedFiles = files
          .filter((f: any) => !f.isDirectory && f.name.endsWith('.json'))
          .map((f: any) => {
            const tsStr = f.name.replace('sess_', '').replace('.json', '');
            return {
              name: f.name,
              path: f.path,
              timestamp: parseInt(tsStr, 10) || 0
            };
          })
          .sort((a: any, b: any) => b.timestamp - a.timestamp); // newest first
        setSessions(parsedFiles);
      } else {
        // Assume directory doesn't exist yet
        setSessions([]);
      }
    } catch(e) {
      setSessions([]);
    }
  };

  const loadSessionContent = async (path: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/fs/read?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSessionData(JSON.parse(data.content));
      }
    } catch(e) {
      console.error("Failed to read session data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      // Deleting directly via a write with null/empty might work, or if there's a delete endpoint
      // Using generic fs approach if explicit delete doesn't exist: overwrite with empty object to invalidate it,
      // but ideally we just let it be or use an empty array.
       const shellRes = await fetch('/api/fs/write', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ targetPath: path, content: "" })
       });
       
       setSessions(prev => prev.filter(s => s.path !== path));
       if (selectedSessionData && path.includes(selectedSessionData.id)) {
          setSelectedSessionData(null);
       }
    } catch(err) {
       console.error("Failed to delete session file", err);
    }
  };

  const handleResumeSession = () => {
    if (!selectedSessionData) return;
    localStorage.setItem('seabot-resume-session', selectedSessionData.id);
    // Tell the app to change view. A hacky way without drilling:
    const studioBtn = document.getElementById('nav-chat');
    if (studioBtn) studioBtn.click();
  };

  return (
    <div className="flex w-full h-full bg-[#0A0A0A] text-[#ededed] overflow-hidden">
      
      {/* LEFT: Session List */}
      <div className="w-full md:w-[280px] lg:w-[320px] bg-[#111] border-r border-[#222] h-full flex flex-col shrink-0">
        <div className="p-4 border-b border-[#222] shrink-0 bg-[#161616]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" /> System Memory
          </h2>
          <p className="text-[11px] text-[#777] mt-1 font-mono">/system_memory/sessions/</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {sessions.length === 0 ? (
             <div className="text-center p-6 border border-dashed border-[#333] rounded-xl bg-white/[0.02]">
                <FileJson className="w-8 h-8 text-[#555] mx-auto mb-2" />
                <p className="text-xs text-[#888]">No chat history found.</p>
             </div>
          ) : (
            sessions.map((sess) => {
              const d = new Date(sess.timestamp);
              const isSelected = selectedSessionData?.id === `sess_${sess.timestamp}`;
              return (
                <div 
                  key={sess.name}
                  onClick={() => loadSessionContent(sess.path)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#0A0A0A] border-[#222] hover:border-[#444]'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`text-[12px] font-bold ${isSelected ? 'text-blue-400' : 'text-[#ededed]'}`}>
                       Session {sess.name.substring(5, 10)}...
                    </div>
                    <button onClick={(e) => handleDeleteSession(sess.path, e)} className="text-[#666] hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#777] font-mono">
                     <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {d.toLocaleDateString()}</span>
                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {d.toLocaleTimeString()}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT: Session Viewer */}
      <div className="hidden md:flex flex-1 flex-col bg-[#0A0A0A] h-full relative">
        {isLoading ? (
           <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#222] border-t-blue-500 rounded-full animate-spin"></div>
           </div>
        ) : !selectedSessionData ? (
           <div className="flex-1 flex flex-col items-center justify-center text-[#555]">
              <MessageSquare className="w-16 h-16 opacity-50 mb-4 text-[#444]" />
              <h3 className="text-lg font-medium text-[#777] mb-2">Select a saved session</h3>
              <p className="text-[13px] text-[#555] max-w-sm text-center">
                All interactions are seamlessly mirrored to your local container filesystem and persists across instances.
              </p>
           </div>
        ) : (
           <>
              <div className="h-16 px-6 border-b border-[#222] bg-[#111] shrink-0 flex items-center justify-between">
                 <div>
                    <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                       <FileJson className="w-4 h-4 text-emerald-400" />
                       sess_{selectedSessionData.timestamp}.json
                    </h3>
                    <p className="text-[11px] text-[#777] font-mono mt-0.5">
                       {new Date(selectedSessionData.timestamp).toLocaleString()} • {selectedSessionData.messages.length} vectors
                    </p>
                 </div>
                 <button 
                    onClick={handleResumeSession}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
                 >
                    <Play className="w-4 h-4" /> Resume in Studio
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {selectedSessionData.messages.map((m, idx) => {
                     if (m.role === 'user') {
                       return (
                         <div key={idx} className="flex flex-col items-end">
                           <div className="bg-[#222] text-[#ededed] px-4 py-3 rounded-2xl rounded-tr-sm text-[13px] border border-[#333] shadow-sm max-w-[85%]">
                             {m.content}
                           </div>
                         </div>
                       );
                     } else if (m.role === 'system') {
                       return (
                         <div key={idx} className="flex justify-start">
                           <div className="max-w-[80%] border-l-2 border-blue-500/30 pl-3 py-1 text-[11px] font-mono text-[#666] break-all whitespace-pre-wrap">
                             {m.content}
                           </div>
                         </div>
                       );
                     } else {
                       return (
                         <div key={idx} className="flex flex-col items-start w-full">
                           <div className="w-full bg-[#111] border border-[#222] text-[#ededed] px-4 py-4 rounded-xl shadow-sm text-[13px] prose prose-invert prose-p:leading-relaxed overflow-hidden break-words">
                             <ReactMarkdown>{m.content}</ReactMarkdown>
                           </div>
                         </div>
                       );
                     }
                  })}
              </div>
           </>
        )}
      </div>
    </div>
  );
}
