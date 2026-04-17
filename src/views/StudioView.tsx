import React, { useState, useEffect, useRef } from "react";
import { Folder, FileText, Search, Code, Save, RefreshCw, Terminal, Send, Play, Bot, ChevronDown, Check, Activity, X, Plus, Server, Network } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface FSItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

export function StudioView() {
  // === FS Explorer State ===
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState<FSItem[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // === Chat / Agent Engine State ===
  const [messages, setMessages] = useState<{ role: string; content: string; type?: string }[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  // === Terminal Output State ===
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initial Loaders
  useEffect(() => { loadDirectory(currentPath); }, [currentPath]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [terminalLogs]);
  useEffect(() => {
    const pendingQuery = localStorage.getItem("seabot-pending-workflow");
    if (pendingQuery) {
      setInput(pendingQuery);
      localStorage.removeItem("seabot-pending-workflow");
      setTimeout(() => { document.getElementById("studio-submit-btn")?.click(); }, 50);
    }
  }, []);

  // === FS Methods ===
  const loadDirectory = async (pathStr: string) => {
    try {
      const res = await fetch(`/api/fs/list?path=${encodeURIComponent(pathStr)}`);
      const data = await res.json();
      setItems(data.sort((a: FSItem, b: FSItem) => {
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
        return a.isDirectory ? -1 : 1;
      }));
    } catch(e) {}
  };

  const openFile = async (filePath: string) => {
    try {
      const res = await fetch(`/api/fs/read?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) throw new Error("Failed to read");
      const data = await res.json();
      setFileContent(data.content);
      setSelectedFilePath(filePath);
    } catch(e) { alert("Cannot open binary or inaccessible file."); }
  };

  const handleSave = async () => {
    if (!selectedFilePath) return;
    setIsSaving(true);
    try {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ targetPath: selectedFilePath, content: fileContent })
      });
    } catch(e) {} finally { setIsSaving(false); }
  };

  const pushTerminalLog = (log: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${log}`]);
  };

  // === Chat Methods ===
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const objective = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: objective }]);
    setIsProcessing(true);
    pushTerminalLog(`> INITIATING OBJECTIVE: ${objective}`);

    try {
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, provider }),
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
                 
                 // MAGIC: If the agent writes to the filesystem, auto-refresh the UI
                 if (data.content.includes("fs_write")) {
                   setTimeout(() => {
                     loadDirectory(currentPath);
                     if (selectedFilePath) openFile(selectedFilePath); // Reload active file to show injection live
                   }, 1000);
                 }
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
    } finally {
      setIsProcessing(false);
    }
  };

  const providers = ["gemini", "openai", "anthropic", "groq", "openrouter", "mistral"];

  return (
    <div className="flex w-full h-[calc(100vh-60px)] -mt-4 md:-mt-6 ml-[-1rem] md:ml-[-1.5rem] w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] bg-[#0b0c0e] font-sans overflow-hidden">
      
      {/* LEFT PANE: EXPLORER */}
      <div className="w-[260px] border-r border-[#1a1c23] flex flex-col bg-[#0b0c0e] shrink-0">
        <div className="h-10 border-b border-[#1a1c23] flex items-center px-4 text-[11px] font-bold text-text-dim uppercase tracking-wider justify-between bg-[#111216]">
          <div className="flex items-center gap-2"><Folder className="w-3.5 h-3.5" /> Project Files</div>
          <button onClick={() => loadDirectory(currentPath)}><RefreshCw className="w-3 h-3 hover:text-white transition-colors" /></button>
        </div>
        
        <div className="p-2 border-b border-[#1a1c23] text-xs font-mono break-all flex items-center gap-1 bg-[#0b0c0e]">
          <span className="text-accent cursor-pointer hover:underline" onClick={() => setCurrentPath("")}>~</span>
          {currentPath && <span className="text-text-dim">/{currentPath}</span>}
          {currentPath !== "" && (
             <button className="ml-auto text-text-dim hover:text-white" onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                setCurrentPath(parts.join('/'));
             }}>..</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
          {items.map(item => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-2.5 px-2 py-1 text-left text-[13px] rounded-md transition-colors ${selectedFilePath === item.path ? 'bg-accent/15 text-accent font-medium' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'}`}
              onClick={() => {
                if (item.isDirectory) setCurrentPath(item.path);
                else openFile(item.path);
              }}
            >
              {item.isDirectory ? <Folder className="w-4 h-4 text-[#38bdf8] shrink-0" /> : <FileText className="w-4 h-4 text-text-dim shrink-0" />}
              <span className="truncate">{item.name}</span>
            </button>
          ))}
          {items.length === 0 && <div className="text-xs text-text-dim text-center py-6 border border-dashed border-[#1a1c23] m-2 rounded">Directory Empty</div>}
        </div>
      </div>

      {/* CENTER PANE: EDITOR & TRACE TERMINAL */}
      <div className="flex-1 flex flex-col border-r border-[#1a1c23] min-w-0 bg-[#0f1115]">
        
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-h-0">
            {selectedFilePath ? (
              <>
                <div className="h-10 border-b border-[#1a1c23] px-3 flex items-center justify-between bg-[#0b0c0e]">
                   <div className="flex items-center gap-2 text-[12px] text-text-main font-mono px-3 py-1 bg-white/5 rounded-t-md border-t border-l border-r border-[#1a1c23] opacity-100">
                     <Code className="w-4 h-4 text-accent" /> {selectedFilePath.split('/').pop()}
                     <X className="w-3 h-3 ml-2 hover:text-white cursor-pointer" onClick={() => setSelectedFilePath(null)} />
                   </div>
                   <button 
                      onClick={handleSave}
                      className="flex items-center gap-1.5 bg-accent text-white px-3 py-1 rounded text-[11px] font-bold tracking-wide transition-colors hover:bg-accent/80"
                   >
                     {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} SAVE
                   </button>
                </div>
                <div className="flex-1 relative">
                  <textarea 
                    value={fileContent || ""}
                    onChange={(e) => setFileContent(e.target.value)}
                    spellCheck={false}
                    className="absolute inset-0 w-full h-full bg-transparent p-4 text-[13px] font-mono text-[#d4d4d8] leading-relaxed outline-none resize-none custom-scrollbar"
                  />
                  <div className="absolute right-4 bottom-4 text-[10px] font-mono text-text-dim bg-panel px-2 py-1 rounded shadow-sm border border-border-default z-10 pointer-events-none">
                     {selectedFilePath}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-dim flex-col gap-3 bg-[#0f1115]">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                   <Activity className="w-8 h-8 opacity-40 text-accent" />
                 </div>
                 <p className="text-sm font-medium text-white/50">SeaBot Local Engine Active</p>
                 <p className="text-[11px] font-mono text-text-dim">Waiting for agent to modify files or UI selection...</p>
              </div>
            )}
        </div>

        {/* Console / Trace Bottom Panel */}
        <div className="h-48 border-t border-[#1a1c23] flex flex-col bg-[#0b0c0e]">
           <div className="h-8 border-b border-[#1a1c23] flex items-center px-4 text-[11px] font-bold text-text-dim uppercase tracking-wider bg-[#111216] gap-4">
              <span className="text-white border-b-2 border-accent pb-[7px] transform translate-y-[1px]">Terminal Trace</span>
              <span className="hover:text-white cursor-pointer">Problems</span>
              <span className="hover:text-white cursor-pointer">Output</span>
           </div>
           <div className="flex-1 p-2 overflow-y-auto font-mono text-[11px] custom-scrollbar text-[#4ade80]">
              {terminalLogs.length === 0 && <div className="text-text-dim italic">Waiting for command execution...</div>}
              {terminalLogs.map((log, i) => (
                 <div key={i} className={`whitespace-pre-wrap ${log.includes('[ERROR]') || log.includes('[FATAL]') ? 'text-red-400' : log.includes('INITIATING') ? 'text-accent' : ''}`}>{log}</div>
              ))}
              <div ref={terminalEndRef} />
           </div>
        </div>

      </div>

      {/* RIGHT PANE: AGENT CHAT / COMMAND CENTER */}
      <div className="w-[380px] flex flex-col bg-[#0b0c0e] shrink-0">
        
        {/* Gateway Protocol Header */}
        <div className="h-14 border-b border-[#1a1c23] px-4 flex items-center justify-between bg-[#111216]">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-accent" />
            <span className="font-semibold text-white tracking-tight text-sm">Operator</span>
          </div>
          <div className="flex items-center gap-2 relative">
             <div 
                 onClick={() => setShowProviderMenu(!showProviderMenu)}
                 className="flex items-center gap-1.5 text-[11px] font-bold text-white px-2 py-1 border border-[#1a1c23] rounded bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <Server className="w-3 h-3 text-accent" />
                {provider.toUpperCase()}
             </div>
             {showProviderMenu && (
                <div className="absolute top-8 right-0 w-36 bg-[#111216] border border-[#1a1c23] rounded-md shadow-xl z-50 py-1">
                  {providers.map(p => (
                     <button key={p} onClick={() => { setProvider(p); setShowProviderMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-text-dim hover:bg-accent/20 hover:text-accent uppercase">
                        {p}
                     </button>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f1115]">
            {messages.length === 0 && (
               <div className="text-center mt-6">
                 <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl mx-auto flex items-center justify-center mb-3">
                   <Network className="w-6 h-6 text-accent" />
                 </div>
                 <h3 className="text-white font-semibold text-sm mb-1">AI Integrated Workspace</h3>
                 <p className="text-[12px] text-text-dim max-w-[250px] mx-auto leading-relaxed">
                   The ultimate coding orchestration engine. Speak to your Operator to manipulate the filesystem natively.
                 </p>
               </div>
            )}
            {messages.map((m, idx) => {
               if (m.role === 'user') {
                 return (
                   <div key={idx} className="flex flex-col items-end">
                     <span className="text-[10px] text-text-dim mb-1 font-bold uppercase mr-1">CEO (You)</span>
                     <div className="bg-white/10 text-white px-3.5 py-2.5 rounded-xl rounded-tr-sm text-[13px] border border-white/5 shadow-sm max-w-[90%]">
                       {m.content}
                     </div>
                   </div>
                 );
               } else if (m.role === 'system') {
                 return (
                   <div key={idx} className="flex justify-start">
                     <div className="max-w-[95%] border-l-2 border-accent/50 pl-3 py-1 text-[11px] font-mono text-text-dim break-all whitespace-pre-wrap">
                       {m.content}
                     </div>
                   </div>
                 );
               } else {
                 return (
                   <div key={idx} className="flex flex-col items-start w-full">
                     <span className="text-[10px] text-accent mb-1 font-bold uppercase ml-1 flex items-center gap-1"><Bot className="w-3 h-3"/> SEABOT OPERATOR</span>
                     <div className="w-[95%] bg-[#111216] border border-[#1a1c23] text-text-main px-4 py-3 rounded-xl rounded-tl-sm shadow-sm text-[13px] prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#0b0c0e] prose-pre:border prose-pre:border-[#1a1c23] prose-pre:text-[11px] overflow-hidden break-words">
                       <ReactMarkdown>{m.content}</ReactMarkdown>
                     </div>
                   </div>
                 );
               }
            })}
            {isProcessing && (
              <div className="flex items-center gap-2 text-text-dim text-xs font-mono animate-pulse ml-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> 
                Processing objective execution...
              </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Text Box */}
        <div className="p-3 bg-[#0b0c0e] border-t border-[#1a1c23]">
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
                placeholder="Instruct the Operator (e.g. 'Build a React component in /src')"
                className="w-full bg-[#111216] border border-[#1a1c23] hover:border-[#272a35] focus:border-accent rounded-lg pl-3 pr-10 py-3 text-[13px] text-white outline-none resize-none min-h-[50px] shadow-inner transition-colors"
                rows={2}
              />
              <button
                type="submit"
                id="studio-submit-btn"
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 bottom-2 w-7 h-7 flex items-center justify-center bg-accent text-white rounded shrink-0 disabled:opacity-50 hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
           </form>
           <div className="flex items-center justify-between mt-2 px-1">
             <div className="flex items-center gap-1.5 cursor-pointer text-text-dim hover:text-white transition-colors" onClick={() => setIsAutoMode(!isAutoMode)}>
               <div className={`w-3 h-3 rounded-sm border ${isAutoMode ? 'bg-accent border-accent' : 'border-text-dim'} flex items-center justify-center`}>
                 {isAutoMode && <Check className="w-2 h-2 text-white" />}
               </div>
               <span className="text-[10px] font-medium tracking-wide">AUTONOMOUS</span>
             </div>
             <span className="text-[10px] text-[#52525b] font-mono block">Shift + Enter to break</span>
           </div>
        </div>

      </div>
    </div>
  );
}
