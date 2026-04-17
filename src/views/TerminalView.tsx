import React, { useState, useRef, useEffect } from 'react';
import { ReActStep } from '../engine/types';

export function TerminalView() {
  const [logs, setLogs] = useState<ReActStep[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    setIsRunning(true);
    setLogs([]);
    
    // Add initial UI log
    setLogs([{
      id: Math.random().toString(),
      timestamp: Date.now(),
      type: 'system',
      agentId: 'SYS-ORCH-01',
      content: `➜ ~ nexus run "${input}"`
    }]);

    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: input })
      });

      if (!response.body) throw new Error('No readable stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // SSE splits by \n\n
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ""; // Keep the last incomplete message in the buffer

        for (const msg of messages) {
          if (msg.startsWith('data: ')) {
            try {
              const data = JSON.parse(msg.slice(6));
              setLogs(prev => [...prev, {
                id: Math.random().toString(),
                timestamp: data.timestamp || Date.now(),
                type: data.type,
                agentId: 'WRK-EXEC-05',
                content: data.content
              }]);
            } catch (e) {
              console.error("Parse error computing stream data", e);
            }
          }
        }
      }
    } catch (e: any) {
      setLogs(prev => [...prev, {
        id: Math.random().toString(),
        timestamp: Date.now(),
        type: 'error',
        agentId: 'SYS-ORCH-01',
        content: `Connection Error: ${e.message}`
      }]);
    } finally {
      setIsRunning(false);
      setInput('');
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'system': return 'text-success font-bold';
      case 'thought': return 'text-text-dim italic';
      case 'action': return 'text-warning font-bold';
      case 'observation': return 'text-[#a5b4fc]';
      case 'reflection': return 'text-accent font-semibold';
      case 'error': return 'text-red-500 bg-red-500/10 p-1 rounded font-bold';
      default: return 'text-text-main';
    }
  };

  const getLogPrefix = (type: string) => {
    switch (type) {
      case 'thought': return '[THINK]';
      case 'action': return '[TOOLS]';
      case 'observation': return '[RESULT]';
      case 'reflection': return '[REFLECT]';
      case 'error': return '[ERROR]';
      case 'system': return '[NEXUS]';
      default: return '[SYS]';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto h-full flex flex-col pb-10">
      <h2 className="text-[12px] uppercase tracking-[0.05em] font-semibold text-text-dim mb-4">
        Live Execution Terminal <span className="text-accent ml-2">{isRunning ? 'ACTIVE RUN' : 'IDLE'}</span>
      </h2>
      
      <div 
        ref={scrollRef}
        className="flex-1 bg-terminal-bg border border-terminal-border rounded-t-[4px] p-4 font-mono text-[10px] md:text-[12px] leading-[1.6] text-text-main overflow-y-auto"
      >
        <div className="mb-4">
          <span className="text-success">[14:00:00]</span> [NEXUS] Core initialized. Real generative agent mounted. 
          <br/><span className="text-text-dim">Try commanding it to evaluate the local src/App.tsx file or run "ls".</span>
        </div>
        
        {logs.map((log) => {
          const timeStr = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false });
          return (
            <div key={log.id} className="mt-2 flex items-start group hover:bg-white/5 px-2 rounded-sm transition-colors py-1">
              <span className="text-success min-w-[65px] md:min-w-[75px] shrink-0 opacity-80">[{timeStr}]</span>
              <span className={`mr-2 md:mr-3 min-w-[60px] md:min-w-[70px] shrink-0 ${getLogColor(log.type)}`}>
                {getLogPrefix(log.type)}
              </span>
              <span className={`break-words flex-1 leading-relaxed ${getLogColor(log.type)}`}>
                {log.content}
              </span>
              <span className="opacity-0 group-hover:opacity-100 text-border-default text-[10px] ml-4 shrink-0 transition-opacity hidden sm:inline-block">
                {log.agentId}
              </span>
            </div>
          );
        })}
        
        {isRunning && (
          <div className="mt-2 flex items-center px-2">
            <span className="text-accent">[LIVE  ]</span>
            <span className="ml-2 md:ml-3 min-w-[60px] md:min-w-[70px] invisible">[WAIT]</span>
            <span className="animate-pulse">_ Generating via Gemini...</span>
          </div>
        )}
      </div>

      {/* Input Console */}
      <div className="bg-[#0b0c0e] border-x border-b border-terminal-border p-3 rounded-b-[4px]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-success font-mono font-bold">➜</span>
          <span className="text-accent font-mono">~ nexus dispatch</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            placeholder="Type an objective here... (e.g. 'Read package.json and summarize dependecies')"
            className="flex-1 bg-transparent outline-none border-none text-text-main font-mono text-[12px] placeholder:text-text-dim/50 ml-2 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isRunning}
            className="px-4 py-1.5 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:hover:bg-accent text-white font-mono text-[10px] font-bold rounded flex items-center transition-colors"
          >
            {isRunning ? 'EXECUTING...' : 'EXECUTE'}
          </button>
        </form>
      </div>
    </div>
  );
}
