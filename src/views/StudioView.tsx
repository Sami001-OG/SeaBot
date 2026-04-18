import React, { useState, useEffect, useRef } from "react";
import { Folder, FileText, Search, Code, Save, RefreshCw, Terminal, Send, Play, Bot, ChevronDown, Check, Activity, X, Server, Network, ShieldAlert, CheckCircle2, Database } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface FSItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

const INITIAL_MODEL_DIRECTORY = [
  { provider: "Google", models: [
    { id: "gemini:gemini-3.1-pro", name: "Gemini 3.1 Pro", badge: "Smart" },
    { id: "gemini:gemini-3.1-flash", name: "Gemini 3.1 Flash", badge: "Fast" },
    { id: "gemini:gemini-3-pro", name: "Gemini 3 Pro" },
    { id: "gemini:gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini:gemini-2.5-flash", name: "Gemini 2.5 Flash", badge: "Fast" },
    { id: "gemini:gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite" },
    { id: "gemini:gemini-2.5-flash-live", name: "Gemini 2.5 Flash Live" },
    { id: "gemini:gemini-2.5-flash-tts", name: "Gemini 2.5 Flash TTS" },
    { id: "gemini:gemini-2.5-pro-tts", name: "Gemini 2.5 Pro TTS" },
    { id: "gemini:gemini-2", name: "Gemini 2" },
    { id: "gemini:gemini-1.5", name: "Gemini 1.5" },
    { id: "gemini:gemma-3n", name: "Gemma 3n" },
    { id: "gemini:gemma", name: "Gemma" },
    { id: "gemini:veo-3.1", name: "Veo 3.1" },
    { id: "gemini:imagen-4", name: "Imagen 4" },
    { id: "gemini:lyria", name: "Lyria" },
    { id: "gemini:palm-2", name: "PaLM 2" },
    { id: "gemini:nano-banana-2", name: "Nano Banana 2" },
    { id: "gemini:nano-banana-pro", name: "Nano Banana Pro" }
  ]},
  { provider: "OpenAI", models: [
    { id: "openai:gpt-5.4-pro", name: "GPT-5.4 Pro", badge: "Smart" },
    { id: "openai:gpt-5.4", name: "GPT-5.4" },
    { id: "openai:gpt-5.4-mini", name: "GPT-5.4 Mini", badge: "Fast" },
    { id: "openai:gpt-5.4-nano", name: "GPT-5.4 Nano" },
    { id: "openai:gpt-5.2", name: "GPT-5.2" },
    { id: "openai:gpt-5.1", name: "GPT-5.1" },
    { id: "openai:gpt-5", name: "GPT-5" },
    { id: "openai:gpt-5-mini", name: "GPT-5-mini" },
    { id: "openai:gpt-5-nano", name: "GPT-5-nano" },
    { id: "openai:gpt-4.1", name: "GPT-4.1" },
    { id: "openai:gpt-4.1-mini", name: "GPT-4.1 Mini" },
    { id: "openai:gpt-4.1-nano", name: "GPT-4.1 Nano" },
    { id: "openai:gpt-4o", name: "GPT-4o" },
    { id: "openai:o1", name: "o1", badge: "Reason" },
    { id: "openai:o3", name: "o3", badge: "Reason" },
    { id: "openai:gpt-oss-20b", name: "GPT-oss-20B" },
    { id: "openai:gpt-oss-120b", name: "GPT-oss-120B" },
    { id: "openai:codex-max", name: "Codex Max" },
    { id: "openai:dall-e", name: "DALL-E" },
    { id: "openai:sora", name: "Sora" },
    { id: "openai:whisper", name: "Whisper" }
  ]},
  { provider: "Anthropic", models: [
    { id: "anthropic:claude-4-6-opus", name: "Claude Opus 4.6", badge: "Smart" },
    { id: "anthropic:claude-4-5-opus", name: "Claude Opus 4.5" },
    { id: "anthropic:claude-4-1-opus", name: "Claude Opus 4.1" },
    { id: "anthropic:claude-4-opus", name: "Claude Opus 4" },
    { id: "anthropic:claude-3-5-opus", name: "Claude Opus 3.5" },
    { id: "anthropic:claude-4-6-sonnet", name: "Claude Sonnet 4.6" },
    { id: "anthropic:claude-4-5-sonnet", name: "Claude Sonnet 4.5" },
    { id: "anthropic:claude-4-sonnet", name: "Claude Sonnet 4" },
    { id: "anthropic:claude-3-5-sonnet", name: "Claude Sonnet 3.5", badge: "Smart" },
    { id: "anthropic:claude-4-5-haiku", name: "Claude Haiku 4.5", badge: "Fast" },
    { id: "anthropic:claude-4-haiku", name: "Claude Haiku 4" },
    { id: "anthropic:claude-3-5-haiku", name: "Claude Haiku 3.5" }
  ]},
  { provider: "Meta", models: [
    { id: "groq:llama-4-maverick", name: "Llama 4 Maverick (17B)", badge: "Fast" },
    { id: "groq:llama-4-scout", name: "Llama 4 Scout (17B)" },
    { id: "groq:llama-3.3-70b", name: "Llama 3.3 (70B)" },
    { id: "groq:llama-3.2-90b-vision", name: "Llama 3.2 90B Vision" },
    { id: "groq:llama-3.2-11b-vision", name: "Llama 3.2 11B Vision" },
    { id: "groq:llama-3.2-3b", name: "Llama 3.2 1B/3B" },
    { id: "groq:llama-3.1", name: "Llama 3.1" }
  ]},
  { provider: "xAI", models: [
    { id: "openrouter:xai/grok-4.20-reasoning", name: "Grok 4.20-reasoning", badge: "Reason" },
    { id: "openrouter:xai/grok-4.20-non-reasoning", name: "Grok 4.20-non-reasoning" },
    { id: "openrouter:xai/grok-4.1-fast-reasoning", name: "Grok 4.1-fast-reasoning" },
    { id: "openrouter:xai/grok-4.1-fast", name: "Grok 4.1-fast", badge: "Fast" },
    { id: "openrouter:xai/grok-4", name: "Grok 4" },
    { id: "openrouter:xai/grok-3", name: "Grok 3" },
    { id: "openrouter:xai/grok-3-mini", name: "Grok 3-mini" },
    { id: "openrouter:xai/grok-2-vision", name: "Grok 2 Vision" },
    { id: "openrouter:xai/grok-2", name: "Grok 2" }
  ]},
  { provider: "Mistral AI", models: [
    { id: "mistral:mistral-large-3", name: "Mistral Large 3" },
    { id: "mistral:mistral-medium-3.1", name: "Mistral Medium 3.1" },
    { id: "mistral:mistral-small-3.1", name: "Mistral Small 3.1" },
    { id: "mistral:ministral-3", name: "Ministral 3 (3B/8B/14B)" },
    { id: "mistral:mistral-7b", name: "Mistral 7B" },
    { id: "mistral:codestral", name: "Codestral" },
    { id: "mistral:pixtral", name: "Pixtral" }
  ]},
  { provider: "DeepSeek", models: [
    { id: "openrouter:deepseek/deepseek-v3.2", name: "DeepSeek-V3.2", badge: "Smart" },
    { id: "openrouter:deepseek/deepseek-v3.1", name: "DeepSeek-V3.1" },
    { id: "openrouter:deepseek/deepseek-v3", name: "DeepSeek-V3" },
    { id: "openrouter:deepseek/deepseek-r1-0528", name: "DeepSeek-R1-0528" },
    { id: "openrouter:deepseek/deepseek-r1", name: "DeepSeek-R1", badge: "Reason" },
    { id: "openrouter:deepseek/deepseek-r1-zero", name: "DeepSeek-R1-Zero" },
    { id: "openrouter:deepseek/deepseek-v2", name: "DeepSeek-V2" },
    { id: "openrouter:deepseek/deepseek-llm-67b", name: "DeepSeek-LLM (7B/67B)" },
    { id: "openrouter:deepseek/deepseek-coder", name: "DeepSeek Coder" }
  ]},
  { provider: "Alibaba / Qwen", models: [
    { id: "openrouter:qwen/qwen3-235b-a22b", name: "Qwen3-235B-A22B" },
    { id: "openrouter:qwen/qwen3-32b", name: "Qwen3-32B" },
    { id: "openrouter:qwen/qwen3.5-flash", name: "Qwen3.5-Flash" },
    { id: "openrouter:qwen/qwen3.5-122b-a10b", name: "Qwen3.5-122B-A10B" },
    { id: "openrouter:qwen/qwq", name: "QVQ" },
    { id: "openrouter:qwen/qwen-omni", name: "Qwen-Omni" }
  ]},
  { provider: "Microsoft / Amazon / NVIDIA / Others", models: [
    { id: "openrouter:microsoft/phi-4-reasoning", name: "Phi-4-reasoning" },
    { id: "openrouter:amazon/nova-premier", name: "Amazon Nova Premier" },
    { id: "openrouter:nvidia/cosmos-3", name: "NVIDIA Cosmos 3" },
    { id: "openrouter:bytedance/seed-2.0-pro", name: "Seed-2.0-Pro" },
    { id: "openrouter:zhipu/glm-5v-turbo", name: "GLM-5V-Turbo" },
    { id: "openrouter:moonshot/kimi-k2.5", name: "Kimi K2.5" },
    { id: "openrouter:minimax/minimax-text-01", name: "MiniMax-Text-01" },
    { id: "openrouter:cohere/command-r-plus", name: "Command R+" }
  ]},
  { provider: "OpenRouter", models: []}
];

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
                                onClick={() => { 
                                  setProvider(mod.id); 
                                  setShowProviderMenu(false); 
                                  setModelSearch(""); 
                                  localStorage.setItem("seabot-active-model", mod.id);
                                  localStorage.setItem("seabot-active-model-name", mod.name);
                                }} 
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
