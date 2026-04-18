import React, { useState, useEffect, useRef } from "react";
import { Folder, FileText, Search, Code, Save, RefreshCw, Terminal, Send, Play, Bot, ChevronDown, Check, Activity, X, Server, Network, ShieldAlert, CheckCircle2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface FSItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

const INITIAL_MODEL_DIRECTORY = [
  { provider: "Google Gemini", models: [
    { id: "gemini:gemini-2.5-flash", name: "Gemini 2.5 Flash", badge: "Fast" },
    { id: "gemini:gemini-2.5-pro", name: "Gemini 2.5 Pro", badge: "Smart" },
  ]},
  { provider: "OpenAI", models: [
    { id: "openai:gpt-4o", name: "GPT-4o", badge: "Smart" },
    { id: "openai:gpt-4o-mini", name: "GPT-4o Mini", badge: "Fast" },
    { id: "openai:o1-mini", name: "o1 Mini", badge: "Reason" }
  ]},
  { provider: "Anthropic", models: [
    { id: "anthropic:claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", badge: "Smart" },
    { id: "anthropic:claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", badge: "Fast" },
    { id: "anthropic:claude-3-opus-20240229", name: "Claude 3.0 Opus" }
  ]},
  { provider: "Groq (Local/Fast)", models: [
    { id: "groq:llama3-70b-8192", name: "Llama 3 70B", badge: "Fast" },
    { id: "groq:mixtral-8x7b-32768", name: "Mixtral 8x7B" }
  ]},
  { provider: "Mistral", models: [
    { id: "mistral:mistral-large-latest", name: "Mistral Large" },
  ]},
  { provider: "OpenRouter", models: [
    { id: "openrouter:anthropic/claude-3.5-sonnet", name: "OR: Claude 3.5 Sonnet" },
    { id: "openrouter:google/gemini-2.5-pro", name: "OR: Gemini 2.5 Pro" },
    { id: "openrouter:liquid/lfm-40b", name: "OR: LFM 40B" }
  ]}
];

export function StudioView() {
  const [mobilePane, setMobilePane] = useState<'explorer' | 'editor' | 'chat'>('chat');

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

  const [provider, setProvider] = useState("gemini:gemini-2.5-flash"); // Exact string mapping
  const [modelDirectory, setModelDirectory] = useState(INITIAL_MODEL_DIRECTORY);
  const [modelSearch, setModelSearch] = useState("");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  // === Terminal Output State ===
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const providerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadDirectory(currentPath); }, [currentPath]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [terminalLogs]);
  useEffect(() => {
    // Attempt dynamically fetching all available OpenRouter Models
    fetch("https://openrouter.ai/api/v1/models")
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const freeModels: any[] = [];
          const paidModels: any[] = [];
          
          data.data.forEach((m: any) => {
             const isFree = (m.pricing?.prompt === "0" && m.pricing?.completion === "0") || m.id.endsWith(":free") || m.id.includes("-free");
             const mapped = {
                id: `openrouter:${m.id}`,
                name: m.name || m.id,
                badge: isFree ? "Free" : (m.context_length >= 100000 ? `${Math.floor(m.context_length/1000)}k` : undefined)
             };
             
             if (isFree) freeModels.push(mapped);
             else paidModels.push(mapped);
          });
          
          setModelDirectory(prev => {
             const copy = [...prev];
             const existingIds = new Set();
             copy.forEach(g => g.models.forEach(x => existingIds.add(x.id)));
             
             const uniqueFree = freeModels.filter((x: any) => !existingIds.has(x.id));
             const uniquePaid = paidModels.filter((x: any) => !existingIds.has(x.id));
             
             const orIdx = copy.findIndex(g => g.provider === "OpenRouter");
             if (orIdx >= 0) {
                // rename existing OpenRouter to OpenRouter (Premium)
                copy[orIdx].provider = "OpenRouter (Premium)";
                copy[orIdx].models = [...copy[orIdx].models, ...uniquePaid];
                
                // Insert Free models group right above it
                if (uniqueFree.length > 0) {
                   copy.splice(orIdx, 0, { provider: "OpenRouter (Free)", models: uniqueFree });
                }
             }
             return copy;
          });
        }
      }).catch(err => console.error("Could not fetch OpenRouter models:", err));
      
    const pendingQuery = localStorage.getItem("seabot-pending-workflow");
    if (pendingQuery) {
      setInput(pendingQuery);
      setMobilePane('chat');
      localStorage.removeItem("seabot-pending-workflow");
      setTimeout(() => { document.getElementById("studio-submit-btn")?.click(); }, 50);
    }
    
    const clickOut = (e: MouseEvent) => {
       if (providerMenuRef.current && !providerMenuRef.current.contains(e.target as Node)) {
          setShowProviderMenu(false);
       }
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

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
      
      if (window.innerWidth < 768) {
         setMobilePane('editor');
      }
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
      pushTerminalLog(`[FS] Saved ${selectedFilePath}`);
    } catch(e) {} finally { setIsSaving(false); }
  };

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
    pushTerminalLog(`> INITIATING OBJECTIVE (${provider}): ${objective}`);

    try {
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, provider }), // Send exact provider mapping e.g openai:gpt-4o
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
                 
                 if (data.content.includes("fs_write")) {
                   setTimeout(() => {
                     loadDirectory(currentPath);
                     if (selectedFilePath) openFile(selectedFilePath);
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

  const getProviderName = () => {
     for (const group of modelDirectory) {
        for (const mod of group.models) {
           if (mod.id === provider) return mod.name;
        }
     }
     return "Select Model";
  };

  const filteredDirectory = modelDirectory.map(group => ({
      ...group,
      models: group.models.filter(m => 
          m.name.toLowerCase().includes(modelSearch.toLowerCase()) || 
          m.id.toLowerCase().includes(modelSearch.toLowerCase())
      )
  })).filter(group => group.models.length > 0);

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-[#0A0A0A] font-sans overflow-hidden text-[#ededed]">
      
      {/* MOBILE NAV BAR */}
      <div className="md:hidden flex items-center border-b border-[#222] bg-[#111] shrink-0 w-full h-[46px]">
         <button onClick={() => setMobilePane('explorer')} className={`flex-1 flex justify-center items-center h-full text-[11px] uppercase tracking-wider font-bold transition-colors ${mobilePane === 'explorer' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[#777] border-b-2 border-transparent hover:text-[#ededed]'}`}>
            <Folder className="w-3.5 h-3.5 mr-2" /> Files
         </button>
         <button onClick={() => setMobilePane('editor')} className={`flex-1 flex justify-center items-center h-full text-[11px] uppercase tracking-wider font-bold transition-colors ${mobilePane === 'editor' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[#777] border-b-2 border-transparent hover:text-[#ededed]'}`}>
            <Code className="w-3.5 h-3.5 mr-2" /> Code
         </button>
         <button onClick={() => setMobilePane('chat')} className={`flex-1 flex justify-center items-center h-full text-[11px] uppercase tracking-wider font-bold transition-colors ${mobilePane === 'chat' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[#777] border-b-2 border-transparent hover:text-[#ededed]'}`}>
            <Bot className="w-3.5 h-3.5 mr-2" /> Agent
         </button>
      </div>

      {/* 1. LEFT PANE: EXPLORER */}
      <div className={`${mobilePane === 'explorer' ? 'flex' : 'hidden'} md:flex w-full md:w-[220px] lg:w-[260px] border-r border-[#222] flex-col bg-[#111111] shrink-0 h-full`}>
        <div className="h-[46px] border-b border-[#222] flex items-center px-4 text-[11px] font-bold text-[#888] uppercase tracking-wider justify-between bg-[#111] shrink-0">
          <div className="flex items-center gap-2"><Folder className="w-3.5 h-3.5" /> EXPLORER</div>
          <button onClick={() => loadDirectory(currentPath)}><RefreshCw className="w-3.5 h-3.5 hover:text-white transition-colors" /></button>
        </div>
        
        <div className="p-2 border-b border-[#222] text-xs font-mono flex items-center gap-1 bg-[#161616] shrink-0 overflow-x-hidden">
          <span className="text-blue-400 cursor-pointer hover:underline shrink-0" onClick={() => setCurrentPath("")}>~</span>
          {currentPath && <span className="text-[#888] truncate">/{currentPath}</span>}
          {currentPath !== "" && (
             <button className="ml-auto text-[#888] hover:text-white shrink-0" onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                setCurrentPath(parts.join('/'));
             }}>..</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {items.map(item => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-left text-[13px] rounded-md transition-colors ${selectedFilePath === item.path ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-[#ededed]'}`}
              onClick={() => {
                if (item.isDirectory) setCurrentPath(item.path);
                else openFile(item.path);
              }}
            >
              {item.isDirectory ? <Folder className="w-4 h-4 text-blue-400 shrink-0" /> : <FileText className="w-4 h-4 text-[#777] shrink-0" />}
              <span className="truncate">{item.name}</span>
            </button>
          ))}
          {items.length === 0 && <div className="text-xs text-[#555] text-center py-6 border border-dashed border-[#333] m-2 rounded">Directory Empty</div>}
        </div>
      </div>

      {/* 2. CENTER PANE: EDITOR & TERMINAL */}
      <div className={`${mobilePane === 'editor' ? 'flex' : 'hidden'} md:flex flex-1 flex-col border-r border-[#222] min-w-0 bg-[#0A0A0A] h-full`}>
        
        {/* Code Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
            {selectedFilePath ? (
              <>
                {/* Editor Tabs */}
                <div className="h-[46px] border-b border-[#222] px-2 flex items-center justify-between bg-[#111] shrink-0">
                   <div className="flex items-center h-full max-w-[70%] overflow-hidden">
                     <div className="flex items-center gap-2 text-[12px] text-[#ededed] font-mono px-4 h-full bg-[#0A0A0A] border-t-2 border-blue-500 border-r border-[#222] border-l border-l-[#222] truncate">
                       <Code className="w-4 h-4 text-blue-400 shrink-0" /> {selectedFilePath.split('/').pop()}
                       <X className="w-3.5 h-3.5 ml-3 text-[#666] hover:text-white cursor-pointer shrink-0" onClick={() => setSelectedFilePath(null)} />
                     </div>
                   </div>
                   <button 
                      onClick={handleSave}
                      className="flex items-center gap-1.5 hover:bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded text-[11px] font-bold tracking-wide transition-colors shrink-0"
                   >
                     {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} SAVE
                   </button>
                </div>
                
                {/* Editor Body */}
                <div className="flex-1 relative flex">
                  <textarea 
                    value={fileContent || ""}
                    onChange={(e) => setFileContent(e.target.value)}
                    spellCheck={false}
                    className="flex-1 w-full bg-transparent p-4 text-[13px] font-mono whitespace-pre overflow-auto text-[#d4d4d4] leading-relaxed outline-none resize-none custom-scrollbar"
                  />
                  <div className="absolute right-4 bottom-4 text-[10px] font-mono text-[#555] bg-[#111] px-2 py-1 rounded border border-[#222] pointer-events-none z-10 hidden md:block">
                     {selectedFilePath}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#555] flex-col gap-3">
                 <div className="w-16 h-16 rounded-full bg-blue-500/5 flex items-center justify-center mb-2 border border-blue-500/10">
                   <Activity className="w-8 h-8 opacity-60 text-blue-400" />
                 </div>
                 <p className="text-sm font-medium text-[#888]">SeaBot Integrated OS Active</p>
                 <p className="text-[12px] font-mono text-[#555]">Select a file or prompt the agent to generate code.</p>
              </div>
            )}
        </div>

        {/* Console / Trace Bottom Panel */}
        <div className="h-[200px] md:h-[250px] border-t border-[#222] flex flex-col bg-[#111] shrink-0">
           <div className="h-9 border-b border-[#222] flex items-center px-4 text-[10px] md:text-[11px] font-medium text-[#888] uppercase tracking-wider bg-[#111] gap-4 md:gap-6 shrink-0">
              <span className="text-[#ededed] border-b-[2px] border-blue-500 pb-[8px] transform translate-y-[4px]">Terminal Trace</span>
              <span className="hover:text-[#ededed] cursor-pointer pb-[8px] transform translate-y-[4px] border-b-[2px] border-transparent">Output</span>
              <span className="hover:text-[#ededed] cursor-pointer pb-[8px] transform translate-y-[4px] border-b-[2px] border-transparent">Ports</span>
           </div>
           <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] md:text-[12px] leading-relaxed custom-scrollbar bg-[#0A0A0A] text-[#a1a1aa]">
              {terminalLogs.length === 0 && <div className="text-[#555] italic">Waiting for command execution...</div>}
              {terminalLogs.map((log, i) => (
                 <div key={i} className={`whitespace-pre-wrap break-all md:break-normal ${log.includes('[ERROR]') || log.includes('[FATAL]') ? 'text-red-400' : log.includes('INITIATING') ? 'text-blue-400' : log.includes('[SUCCESS]') || log.includes('[FS]') ? 'text-green-400' : 'text-[#a1a1aa]'}`}>
                   <span className="text-[#555]">❯</span> {log}
                 </div>
              ))}
              <div ref={terminalEndRef} />
           </div>
        </div>

      </div>

      {/* 3. RIGHT PANE: AGENT CHAT (Command Center) */}
      <div className={`${mobilePane === 'chat' ? 'flex' : 'hidden'} md:flex w-full md:w-[320px] lg:w-[380px] flex-col bg-[#111] shrink-0 h-full`}>
        
        {/* Chat Header */}
        <div className="h-[46px] border-b border-[#222] px-4 flex items-center justify-between bg-[#111] shrink-0 relative" ref={providerMenuRef}>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-[#ededed] text-[13px]">Agent Operator</span>
          </div>
          <div>
             <div 
                 onClick={() => setShowProviderMenu(!showProviderMenu)}
                 className="flex items-center gap-1.5 text-[10px] font-bold text-[#ededed] px-2 py-1 border border-[#333] rounded-md hover:bg-white/5 cursor-pointer bg-[#161616]"
              >
                <Server className="w-3 h-3 text-blue-400" />
                {getProviderName()}
             </div>
             {showProviderMenu && (
                <div className="absolute top-10 right-4 w-64 md:w-72 bg-[#161616] border border-[#333] rounded-md shadow-2xl z-50 flex flex-col max-h-[60vh]">
                  <div className="px-3 pt-3 pb-2 border-b border-[#222] shrink-0">
                     <div className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">Select Gateway Model</div>
                     <input 
                        type="text" 
                        placeholder="Search 250+ models..."
                        value={modelSearch}
                        onChange={e => setModelSearch(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] hover:border-[#444] text-[#ededed] text-[11px] px-2.5 py-1.5 rounded outline-none focus:border-blue-500 custom-scrollbar"
                     />
                  </div>
                  <div className="overflow-y-auto custom-scrollbar p-0 py-2">
                    {filteredDirectory.length === 0 && <div className="text-[#555] text-[11px] text-center py-4">No models found...</div>}
                    {filteredDirectory.map((group) => (
                        <div key={group.provider} className="mb-2">
                           <div className="px-3 py-1.5 text-[11px] font-bold text-[#888]">{group.provider}</div>
                           {group.models.map(mod => (
                              <button 
                                key={mod.id} 
                                onClick={() => { setProvider(mod.id); setShowProviderMenu(false); setModelSearch(""); }} 
                                className={`w-full text-left px-4 py-1.5 text-[12px] flex items-center justify-between hover:bg-blue-500/10 transition-colors ${provider === mod.id ? 'text-blue-400 bg-blue-500/5' : 'text-[#ccc]'}`}
                              >
                                 <span className="truncate pr-2">{mod.name}</span>
                                 {mod.badge && <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${mod.badge === 'Fast' ? 'bg-green-500/20 text-green-400' : mod.badge === 'Smart' ? 'bg-purple-500/20 text-purple-400' : mod.badge === 'Free' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium tracking-wide' : 'bg-blue-500/20 text-blue-400'}`}>{mod.badge}</span>}
                              </button>
                           ))}
                        </div>
                    ))}
                  </div>
                </div>
              )}
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
                     <div className="w-full bg-[#111] border border-[#222] text-[#ededed] px-3 py-3 md:px-4 md:py-4 rounded-xl shadow-sm text-[12px] md:text-[13px] prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-[#222] prose-pre:text-[11px] md:prose-pre:text-[12px] overflow-hidden break-words">
                       <ReactMarkdown>{m.content}</ReactMarkdown>
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
