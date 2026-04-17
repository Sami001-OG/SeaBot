import React, { useState, useEffect, useRef } from "react";
import { Terminal, Send, Play, Settings, Bot, ChevronDown, Check, Activity } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export function CommandCenterView() {
  const [messages, setMessages] = useState<{ role: string; content: string; type?: string }[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Check if there is a pending queued prompt from the Automations View
    const pendingQuery = localStorage.getItem("seabot-pending-workflow");
    if (pendingQuery) {
      setInput(pendingQuery);
      localStorage.removeItem("seabot-pending-workflow");
      // Fire it immediately
      setTimeout(() => {
         const btn = document.getElementById("hidden-submit-btn");
         if (btn) btn.click();
      }, 50);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const objective = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: objective }]);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // PASS THE DYNAMIC PROVIDER DOWN TO THE EXPRESS STREAM
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
              // Render Final output directly
              if (data.type === 'reflection') {
                setMessages(prev => [...prev, { role: "agent", content: data.content, type: 'final' }]);
              } else if (data.type === 'thought' || data.type === 'action' || data.type === 'system') {
                 setMessages(prev => [...prev, { role: "system", content: `[${data.type.toUpperCase()}] ${data.content}` }]);
              } else if (data.type === 'error') {
                 setMessages(prev => [...prev, { role: "system", content: `[ERROR] ${data.content}` }]);
              }
            } catch (err) {}
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "agent", content: `Agent Gateway connection failed: ${err.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const providers = ["gemini", "openai", "anthropic", "groq", "openrouter", "mistral"];

  return (
    <div className="flex flex-col h-full bg-panel border border-border-default rounded-xl shadow-sm overflow-hidden">
      
      {/* Top Protocol Bar: Mirrored from OpenClaw's Gateway / Settings Panel overlay */}
      <div className="h-14 border-b border-border-default px-4 flex items-center justify-between bg-bg-base/50">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-white">Agent Command Center</h2>
          <div className="h-4 w-px bg-border-default mx-2"></div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-dim px-2 py-1 bg-white/5 border border-white/5 rounded">
            <Activity className="w-3.5 h-3.5 text-success animate-pulse" />
            Gateway Active
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative">
          {/* Dynamic Model Switcher */}
          <div 
             onClick={() => setShowProviderMenu(!showProviderMenu)}
             className="flex items-center gap-2 text-xs font-medium text-text-main px-3 py-1.5 border border-border-default rounded bg-bg-base cursor-pointer hover:bg-white/5"
          >
            <span className="text-text-dim">Model:</span>
            {provider.toUpperCase()}
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>

          {showProviderMenu && (
            <div className="absolute top-10 right-32 w-40 bg-panel border border-border-default rounded-md shadow-lg z-50 py-1">
              {providers.map(p => (
                 <button 
                   key={p}
                   onClick={() => { setProvider(p); setShowProviderMenu(false); }}
                   className="w-full text-left px-4 py-2 text-xs text-white hover:bg-accent/20 hover:text-accent uppercase"
                 >
                    {p}
                 </button>
              ))}
            </div>
          )}

          <button 
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${isAutoMode ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-transparent border border-border-default text-text-dim'}`}
          >
            {isAutoMode && <Check className="w-3 h-3" />} Autonomous Mode
          </button>
        </div>
      </div>

      {/* Chat / Thought Stream UI */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-bg-base">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-text-dim max-w-lg mx-auto text-center space-y-4 pt-10">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <Bot className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-white">You are the CEO.</h2>
            <p className="text-sm leading-relaxed">
              OpenClaw is your locally-controlled AI operator. Use this command center to give high-level goals. It will autonomously plan, write code, run terminal commands, and build full applications.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
               <button onClick={() => setInput("Build a crypto signal dashboard")} className="p-3 text-left border border-border-default rounded hover:border-accent/40 bg-panel text-xs text-text-main transition-colors text-ellipsis overflow-hidden">
                  <span className="font-semibold text-accent block mb-1">Crypto App</span>
                  "Build a crypto signal dashboard"
               </button>
               <button onClick={() => setInput("Scan the workspace, find syntax errors, and fix them automatically.")} className="p-3 text-left border border-border-default rounded hover:border-accent/40 bg-panel text-xs text-text-main transition-colors text-ellipsis overflow-hidden">
                  <span className="font-semibold text-accent block mb-1">Code Review</span>
                  "Scan the workspace, fix syntax errors"
               </button>
            </div>
          </div>
        )}

        {messages.map((m, idx) => {
          if (m.role === 'user') {
            return (
              <div key={idx} className="flex justify-end">
                <div className="max-w-[80%] bg-accent text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md text-[14px]">
                  {m.content}
                </div>
              </div>
            );
          } else if (m.role === 'system') {
            // Logs / Thoughts / Actions
            return (
              <div key={idx} className="flex justify-start opacity-70">
                <div className="max-w-[90%] bg-bg-base border border-border-default font-mono text-[11px] text-text-dim px-3 py-2 rounded break-all whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            );
          } else {
            // Final Agent Output / Markdown Output
            return (
              <div key={idx} className="flex justify-start w-full">
                <div className="max-w-[85%] bg-panel border border-border-default text-text-main px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm text-[14px] prose prose-invert prose-p:leading-relaxed prose-pre:bg-bg-base prose-pre:border prose-pre:border-border-default overflow-hidden break-words">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            );
          }
        })}
        {isProcessing && (
          <div className="flex justify-start items-center gap-3 text-text-dim text-sm font-mono animate-pulse">
            <Play className="w-4 h-4 text-accent" /> 
            Operator is executing on Model: {provider.toUpperCase()}...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-panel border-t border-border-default">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSubmit();
              }
            }}
            placeholder={isAutoMode ? "Give a high-level goal (e.g., 'Deploy a backend server with Express...')" : "Ask a coding question..."}
            className="w-full bg-bg-base border border-border-default rounded-xl pl-4 pr-14 py-3.5 text-[14px] text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none min-h-[60px] custom-scrollbar"
            rows={1}
          />
          <button
            type="submit"
            id="hidden-submit-btn"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-accent text-white rounded-lg disabled:opacity-50 hover:bg-accent/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2 text-[10px] text-text-dim">
          Shift + Enter to add a new line. The Agent will execute tools autonomously using {provider.toUpperCase()}.
        </div>
      </div>
    </div>
  );
}
