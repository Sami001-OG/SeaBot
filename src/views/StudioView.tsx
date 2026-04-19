import React, { useState, useEffect, useRef } from "react";
import { Folder, FileText, Search, Code, Save, RefreshCw, Terminal, Send, Play, Bot, ChevronDown, Check, Activity, X, Server, Network, ShieldAlert, CheckCircle2, Database } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface FSItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

// --- Interactive Render Components ---
function InteractivePreview({ inline, className, children }: any) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'txt';
  const isHtml = match && (language === 'html' || language === 'html5');
  const codeContent = String(children).replace(/\n$/, '');

  useEffect(() => {
    // If it's a standard code block, autonomously store it in the memory vault
    if (!inline && !isHtml && !hasSaved && codeContent.trim().length > 0) {
       const snippetName = `snippet_${Math.random().toString(36).substring(7)}.${language}`;
       fetch('/api/fs/write', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ targetPath: `system_memory/${snippetName}`, content: codeContent })
       }).catch(() => {});
       setHasSaved(true);
    }
  }, [inline, isHtml, hasSaved, codeContent, language]);

  if (!inline && isHtml) {
    // Inject Tailwind CDN seamlessly so the agent has styles out of the box
    // Also inject generic chart.js / d3 libs just in case it wants to make graphs!
    const srcDoc = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
          <style>
            body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: transparent; }
            /* Custom scrollbar for the iframe interior */
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          </style>
        </head>
        <body>
          ${codeContent}
        </body>
      </html>
    `;

    return (
      <div className="w-full my-5 border border-[#333] shadow-2xl rounded-xl overflow-hidden bg-[#0A0A0A] flex flex-col font-sans">
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-[#222] bg-gradient-to-r from-[#111] to-[#151515] px-3 h-10 shrink-0">
          <div className="flex gap-4 h-full items-center">
            <span className="flex items-center gap-1.5 text-blue-400 text-[10px] uppercase font-bold tracking-widest pl-1 pr-3 border-r border-[#333]">
               <Activity className="w-3.5 h-3.5" /> Artifact
            </span>
            <div className="flex gap-1 h-full">
               <button 
                 onClick={() => setViewMode('preview')}
                 className={`px-3 text-[11px] font-bold tracking-wide transition-colors h-full flex items-center ${viewMode === 'preview' ? 'text-white border-b-2 border-blue-500' : 'text-[#777] border-b-2 border-transparent hover:text-[#ccc]'}`}
               >
                 Live Preview
               </button>
               <button 
                 onClick={() => setViewMode('code')}
                 className={`px-3 text-[11px] font-bold tracking-wide transition-colors h-full flex items-center ${viewMode === 'code' ? 'text-white border-b-2 border-blue-500' : 'text-[#777] border-b-2 border-transparent hover:text-[#ccc]'}`}
               >
                 Source Code
               </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]/10 border border-[#fca5a5]/30"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-[#fde047]/10 border border-[#fde047]/30"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-[#86efac]/10 border border-[#86efac]/30"></div>
          </div>
        </div>

        {/* Content Body */}
        {viewMode === 'preview' ? (
          <div className="w-full bg-[#ffffff] relative flex flex-col resize-y overflow-auto" style={{ minHeight: '400px', height: '450px' }}>
            <iframe 
               srcDoc={srcDoc} 
               className="w-full h-full border-none outline-none flex-1" 
               title="Interactive UI Preview"
               sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-modals"
            />
          </div>
        ) : (
          <div className="w-full relative flex flex-col resize-y overflow-auto" style={{ minHeight: '400px', height: '450px' }}>
             <pre className="!m-0 !p-4 !bg-[#050505] text-[11.5px] leading-relaxed overflow-x-auto flex-1 custom-scrollbar">
               <code className={className}>{children}</code>
             </pre>
          </div>
        )}
      </div>
    );
  }

  // Fallback to normal code block behavior for non-HTML / inline
  if (!inline) {
    return (
      <div className="w-full my-4 border border-[#222] shadow-sm rounded-xl overflow-hidden bg-[#0A0A0A] flex flex-col font-sans">
        <div 
           className="flex items-center justify-between border-b border-[#222] bg-[#111] px-3 h-10 shrink-0 cursor-pointer hover:bg-[#161616] transition-colors"
           onClick={() => setIsExpanded(!isExpanded)}
        >
           <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-medium text-[#ccc]">Code Block (Auto-Stored in System Memory)</span>
           </div>
           <button className="text-[10px] text-blue-400 hover:text-blue-300 uppercase font-bold tracking-wider">
              {isExpanded ? 'Hide' : 'Expand'}
           </button>
        </div>
        {isExpanded && (
           <pre className="!m-0 !p-3 !bg-[#050505] text-[11px] leading-relaxed overflow-x-auto custom-scrollbar text-[#a1a1aa]">
             <code className={className}>{children}</code>
           </pre>
        )}
      </div>
    );
  }

  return (
    <code className="px-1.5 py-0.5 rounded-md bg-[#222] border border-[#333] text-[#cfcfcf] text-[11px] font-medium">{children}</code>
  );
}

export function StudioView() {
  // === Chat / Agent Engine State ===
  const [messages, setMessages] = useState<{ role: string; content: string; type?: string }[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  // === Terminal Output State ===
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  const sessionIdRef = useRef<string>(`sess_${Date.now()}`);
  const parentIdRef = useRef<string | undefined>(undefined);
  const nodeNameRef = useRef<string | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [terminalLogs]);
  useEffect(() => {
    const pendingQuery = localStorage.getItem("seabot-pending-workflow");
    if (pendingQuery) {
      setInput(pendingQuery);
      localStorage.removeItem("seabot-pending-workflow");
      setTimeout(() => { document.getElementById("studio-submit-btn")?.click(); }, 50);
    }
    
    // Check for Resume Session
    const resumeSessionId = localStorage.getItem('seabot-resume-session');
    if (resumeSessionId) {
      sessionIdRef.current = resumeSessionId;
      localStorage.removeItem('seabot-resume-session');
      fetch(`/api/fs/read?path=system_memory/sessions/${resumeSessionId}.json`)
        .then(res => res.json())
        .then(data => {
           if (data && data.content) {
              const parsed = JSON.parse(data.content);
              if (parsed.messages) setMessages(parsed.messages);
              if (parsed.parentId) parentIdRef.current = parsed.parentId;
              if (parsed.nodeName) nodeNameRef.current = parsed.nodeName;
           }
        }).catch(() => {});
    }
  }, []);

  // Sync to FileSystem Automatically when messages update
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('seabot-current-session-id', sessionIdRef.current);
      fetch('/api/fs/write', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({
            targetPath: `system_memory/sessions/${sessionIdRef.current}.json`,
            content: JSON.stringify({ 
               id: sessionIdRef.current, 
               timestamp: parseInt(sessionIdRef.current.replace('sess_', '')), 
               messages,
               parentId: parentIdRef.current,
               nodeName: nodeNameRef.current
            }, null, 2)
         })
      }).catch(() => {});
    }
  }, [messages]);

  const pushTerminalLog = (log: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${log}`]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const objective = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: objective }]);
    setIsProcessing(true);
    
    const activeModel = localStorage.getItem("seabot-active-model") || "gemini:gemini-2.5-flash";
    pushTerminalLog(`> INITIATING OBJECTIVE (${activeModel}): ${objective}`);

    try {
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, provider: activeModel }), 
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(5));
              
              if (data.type === 'reflection') {
                setMessages(prev => [...prev, { role: "agent", content: data.content, type: 'final' }]);
                pushTerminalLog(`[SUCCESS] Objective Completed.`);
              } else if (data.type === 'thought') {
                 setMessages(prev => [...prev, { role: "system", content: `[THOUGHT] ${data.content}` }]);
              } else if (data.type === 'action') {
                 setMessages(prev => [...prev, { role: "system", content: `[ACTION] ${data.content}` }]);
                 pushTerminalLog(`[ACTION ENGINED] ${data.content}`);
              } else if (data.type === 'observation') {
                 pushTerminalLog(`[OBSERVATION] ${data.content.substring(0, 150)}${data.content.length > 150 ? '...' : ''}`);
              } else if (data.type === 'error') {
                 setMessages(prev => [...prev, { role: "system", content: `[ERROR] ${data.content}` }]);
                 pushTerminalLog(`[FATAL] ${data.content}`);
              }
            } catch (err) {}
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "agent", content: `Gateway connection failed: ${err.message}` }]);
      pushTerminalLog(`[API GATEWAY ERROR] ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-[#0A0A0A] font-sans overflow-hidden text-[#ededed]">
      
      {/* 3. RIGHT PANE: AGENT CHAT (Command Center) - NOW FULL WIDTH */}
      <div className={`flex w-full flex-1 flex-col bg-[#111] h-full transition-all duration-300`}>
        
        {/* Chat Header */}
        <div className="h-[46px] border-b border-[#222] px-4 flex items-center justify-between bg-[#111] shrink-0 relative">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-[#ededed] text-[13px]">Agent Organizer</span>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-5 custom-scrollbar bg-[#0A0A0A]">
            {messages.length === 0 && (
               <div className="text-center mt-10">
                 <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
                   <Network className="w-7 h-7 text-blue-400" />
                 </div>
                 <h3 className="text-[#ededed] font-medium text-[15px] mb-2">How can I help you build?</h3>
                 <p className="text-[13px] text-[#777] max-w-[260px] mx-auto leading-relaxed">
                   I govern the filesystem, terminal, and LLM routes. Give me an objective to begin.
                 </p>
               </div>
            )}
            {messages.map((m, idx) => {
               if (m.role === 'user') {
                 return (
                   <div key={idx} className="flex flex-col items-end">
                     <div className="bg-[#222] text-[#ededed] px-3.5 py-2.5 md:px-4 md:py-2.5 rounded-2xl rounded-tr-sm text-[12px] md:text-[13px] border border-[#333] shadow-sm max-w-[85%]">
                       {m.content}
                     </div>
                   </div>
                 );
               } else if (m.role === 'system') {
                 return (
                   <div key={idx} className="flex justify-start">
                     <div className="max-w-[95%] border-l-2 border-blue-500/30 pl-3 py-1 text-[10px] md:text-[11px] font-mono text-[#666] break-all whitespace-pre-wrap">
                       {m.content}
                     </div>
                   </div>
                 );
               } else {
                 return (
                   <div key={idx} className="flex flex-col items-start w-full">
                     <div className="w-full bg-[#111] border border-[#222] text-[#ededed] px-3 py-3 md:px-4 md:py-4 rounded-xl shadow-sm text-[12px] md:text-[13px] prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-pre:border-none overflow-hidden break-words">
                       <ReactMarkdown
                         components={{
                           code: InteractivePreview
                         }}
                       >
                         {m.content}
                       </ReactMarkdown>
                     </div>
                   </div>
                 );
               }
            })}
            {isProcessing && (
              <div className="flex items-center gap-2 text-[#777] text-[11px] md:text-[12px] font-mono animate-pulse ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 
                Agent is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Text Box */}
        <div className="p-3 md:p-4 bg-[#111] border-t border-[#222] shrink-0">
           <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSubmit();
                  }
                }}
                placeholder="Message SeaBot..."
                className="w-full bg-[#161616] border border-[#333] hover:border-[#444] focus:border-blue-500 rounded-xl pl-3 pr-12 md:pl-4 md:pr-12 py-3 md:py-3.5 text-[12px] md:text-[13px] text-[#ededed] outline-none resize-none min-h-[50px] transition-colors custom-scrollbar"
                rows={1}
              />
              <button
                type="submit"
                id="studio-submit-btn"
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
              >
                <Send className="w-4 h-4 ml-[2px]" />
              </button>
           </form>
           <div className="flex items-center justify-between mt-2 md:mt-3 px-1">
             <div className="flex items-center gap-1.5 cursor-pointer text-[#777] hover:text-[#ededed] transition-colors" onClick={() => setIsAutoMode(!isAutoMode)}>
               <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[4px] border ${isAutoMode ? 'bg-blue-500 border-blue-500' : 'border-[#444] bg-[#161616]'} flex items-center justify-center`}>
                 {isAutoMode && <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" strokeWidth={3} />}
               </div>
               <span className="text-[10px] md:text-[11px] font-medium tracking-wide">Autonomous</span>
             </div>
             <span className="text-[9px] md:text-[10px] text-[#555] font-mono hidden md:block">Shift + Return to break</span>
           </div>
        </div>

      </div>
    </div>
  );
}
