import React, { useState, useEffect } from "react";
import { GitBranch, Network, Play, GitMerge, FileJson, ArrowRight, CornerDownRight } from "lucide-react";

interface NodeSession {
  id: string;
  timestamp: number;
  messages: any[];
  parentId?: string;
  nodeName?: string;
}

export function NodesView() {
  const [nodes, setNodes] = useState<NodeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeSessionId = localStorage.getItem('seabot-current-session-id');

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/fs/list?path=system_memory/sessions`);
      if (res.ok) {
        const files = await res.json();
        const jsonFiles = files.filter((f: any) => !f.isDirectory && f.name.endsWith('.json'));
        
        const loaded: NodeSession[] = [];
        for (const file of jsonFiles) {
           const cRes = await fetch(`/api/fs/read?path=${encodeURIComponent(file.path)}`);
           if (cRes.ok) {
              const data = await cRes.json();
              if (data && data.content) {
                 loaded.push(JSON.parse(data.content));
              }
           }
        }
        
        loaded.sort((a, b) => a.timestamp - b.timestamp);
        setNodes(loaded);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchActive = async () => {
    if (!activeSessionId) return;
    
    // Find active session
    const activeData = nodes.find(n => n.id === activeSessionId);
    if (!activeData) return;

    // Create new branch
    const branchTimestamp = Date.now();
    const branchId = `sess_${branchTimestamp}`;
    
    const newContext = [
      ...activeData.messages,
      { 
         role: 'system', 
         content: `[SYSTEM] Branch ${branchId.substring(5,11)} spawned successfully from context ${activeSessionId.substring(5,11)}. Path isolated.` 
      }
    ];

    const branchSession: NodeSession = {
       id: branchId,
       timestamp: branchTimestamp,
       messages: newContext,
       parentId: activeSessionId,
       nodeName: `Branch ${branchId.substring(5,9)}`
    };

    // Save to Disk
    await fetch('/api/fs/write', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({
          targetPath: `system_memory/sessions/${branchId}.json`,
          content: JSON.stringify(branchSession, null, 2)
       })
    });

    // Jump to the branch
    localStorage.setItem('seabot-resume-session', branchId);
    const studioBtn = document.getElementById('nav-chat');
    if (studioBtn) studioBtn.click();
  };

  const handleResume = (id: string) => {
    localStorage.setItem('seabot-resume-session', id);
    const studioBtn = document.getElementById('nav-chat');
    if (studioBtn) studioBtn.click();
  };

  // Build tree logic visually
  // To keep it simple, we group by parent
  const rootNodes = nodes.filter(n => !n.parentId);
  
  const getChildren = (parentId: string) => nodes.filter(n => n.parentId === parentId);

  const renderNode = (node: NodeSession, depth = 0) => {
    const children = getChildren(node.id);
    const isActive = activeSessionId === node.id;
    
    return (
      <div key={node.id} className="flex flex-col">
        <div className={`flex items-center gap-3 p-4 border rounded-xl mb-3 transition-colors ${isActive ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#111] border-[#222]'}`} style={{ marginLeft: `${depth * 40}px` }}>
           {depth > 0 && <CornerDownRight className="w-5 h-5 text-[#555] absolute -translate-x-8 -translate-y-4" />}
           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${isActive ? 'bg-blue-500/20 border-blue-500/50' : 'bg-[#0A0A0A] border-[#333]'}`}>
              {depth === 0 ? <Network className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-[#888]'}`} /> : <GitBranch className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-[#888]'}`} />}
           </div>
           <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                 <h3 className={`font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>{node.nodeName || (depth === 0 ? 'Main Trunk' : 'Parallel Branch')}</h3>
                 {isActive && <span className="bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">Active</span>}
              </div>
              <div className="text-[11px] text-[#777] font-mono flex items-center gap-2 truncate">
                 <span>ID: {node.id.substring(5,13)}</span>
                 <span>•</span>
                 <span>{new Date(node.timestamp).toLocaleString()}</span>
                 <span>•</span>
                 <span>{node.messages.length} vectors</span>
              </div>
           </div>
           <div className="flex items-center gap-3 ml-4 shrink-0">
              <button 
                 onClick={() => handleResume(node.id)}
                 className="flex items-center gap-1.5 hover:bg-white/10 px-3 py-1.5 rounded text-[11px] font-bold text-[#ccc] transition-colors"
              >
                 <Play className="w-3.5 h-3.5" /> RESUME
              </button>
           </div>
        </div>
        
        {children.length > 0 && (
           <div className="flex flex-col relative">
              {/* Visual line connecting branches optionally */}
              {children.map(c => renderNode(c, depth + 1))}
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full p-6 md:p-8 bg-[#0A0A0A] text-[#ededed] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#222] pb-6">
        <div>
           <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
             <GitMerge className="w-6 h-6 text-purple-400" /> Instances & Branches
           </h1>
           <p className="text-[#a1a1aa] text-[13px]">Manage isolated context streams, clone active sessions, and spawn parallel nodes.</p>
        </div>
        <button 
           onClick={handleBranchActive}
           disabled={!activeSessionId || nodes.length === 0}
           className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 text-[12px] font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20"
        >
           <GitBranch className="w-4 h-4" /> Branch Active Node
        </button>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto">
         {isLoading ? (
            <div className="flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-[#222] border-t-purple-500 rounded-full animate-spin"></div>
            </div>
         ) : rootNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-[#555] py-20 border border-dashed border-[#333] rounded-2xl bg-white/[0.02]">
               <Network className="w-12 h-12 mb-4" />
               <p className="text-[#888] font-medium">No active node traces found.</p>
               <p className="text-xs mt-1">Start a chat session to initialize the main trunk.</p>
            </div>
         ) : (
            <div className="space-y-6">
               {rootNodes.map(root => renderNode(root))}
            </div>
         )}
      </div>

    </div>
  );
}
