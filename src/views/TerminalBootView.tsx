import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Play } from "lucide-react";

interface TerminalBootViewProps {
  onLaunchUI: () => void;
}

interface TermLine {
  text: React.ReactNode;
  type: 'system' | 'user' | 'error' | 'success' | 'agent';
}

export function TerminalBootView({ onLaunchUI }: TerminalBootViewProps) {
  const [lines, setLines] = useState<TermLine[]>([
    { text: "SeaBot OS v2.0.0-rc.1 (Core Kernel)", type: "system" },
    { text: "Initializing Autonomous Agent Architecture...", type: "system" },
    { text: "Loading Planner, Researcher, and Action Nodes... [OK]", type: "success" },
    { text: "Type 'help' to see available commands or 'seabot start --ui' to launch the graphic interface.", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setLines(prev => [...prev, { text: `seabot@kernel:~$ ${trimmed}`, type: "user" }]);

    const lower = trimmed.toLowerCase();

    // Command Router
    setTimeout(() => {
      if (lower === "help") {
        setLines(prev => [...prev, 
           { text: "Available Commands:", type: "system" },
           { text: "  seabot install      - Authenticates and installs core agent packages", type: "system" },
           { text: "  seabot start --ui   - Launches the Web Dashboard & GUI Studio", type: "system" },
           { text: "  seabot start --cli  - Launches terminal-only chat agent mode", type: "system" },
           { text: "  clear               - Clears terminal output", type: "system" }
        ]);
      } else if (lower === "clear") {
        setLines([]);
      } else if (lower === "seabot install") {
        setLines(prev => [...prev, { text: "Fetching registry packages...", type: "system" }]);
        setTimeout(() => {
           setLines(prev => [...prev, { text: "Installing core agent modules...", type: "system" }]);
           setTimeout(() => {
              setLines(prev => [...prev, { text: "Installation complete! You can now run the agent.", type: "success" }]);
           }, 800);
        }, 600);
      } else if (lower === "seabot start --ui" || lower.includes("--ui")) {
        setLines(prev => [...prev, { text: "Mounting React Fiber components...", type: "system" }, { text: "Forwarding port 3000 to Dashboard Interface...", type: "success" }]);
        setTimeout(() => {
           onLaunchUI();
        }, 1000);
      } else if (lower === "seabot start --cli") {
        setLines(prev => [...prev, { text: "[SYSTEM] CLI Agent Mode initialized. You can now chat natively in the terminal.", type: "success" }]);
        setLines(prev => [...prev, { text: "Agent: Hello! I am operating in pure terminal mode. How can I assist you today?", type: "agent" }]);
      } else if (lower.startsWith("seabot") || prevLinesAreCLI()) {
        // If they are just conversing with the CLI agent natively
        if (prevLinesAreCLI() && !lower.startsWith("seabot")) {
            simulateAgentReasoning(trimmed);
        } else {
            setLines(prev => [...prev, { text: `Command not recognized: ${trimmed}. Type 'help' for options.`, type: "error" }]);
        }
      } else {
        setLines(prev => [...prev, { text: `bash: ${trimmed}: command not found`, type: "error" }]);
      }
    }, 150);
  };

  const prevLinesAreCLI = () => {
     // Check if we booted CLI mode
     return lines.some(l => l.text?.toString().includes("CLI Agent Mode initialized"));
  };

  const simulateAgentReasoning = (userText: string) => {
     // This proves it works as an agent even in the terminal
     setLines(prev => [...prev, { text: "[Planner Node] Analyzing intent...", type: "system" }]);
     setTimeout(() => {
        setLines(prev => [...prev, { text: "[Action Node] Formulating response...", type: "system" }]);
        setTimeout(() => {
           setLines(prev => [...prev, { text: `Agent: I have processed your input: "${userText}". Since we are in the terminal, I will provide text-based execution. If you need GUI artifacts, please type 'seabot start --ui'!`, type: "agent" }]);
        }, 800);
     }, 600);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  return (
    <div 
       className="w-full h-screen bg-[#050505] text-[#00ff00] font-mono p-4 md:p-8 flex flex-col cursor-text selection:bg-[#00ff00] selection:text-black"
       onClick={() => inputRef.current?.focus()}
    >
       <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 text-[13px] md:text-[14px]">
          {lines.map((line, idx) => (
             <div key={idx} className={`
                ${line.type === 'error' ? 'text-red-500' : ''}
                ${line.type === 'success' ? 'text-[#00ff00]' : ''}
                ${line.type === 'system' ? 'text-[#888]' : ''}
                ${line.type === 'user' ? 'text-white' : ''}
                ${line.type === 'agent' ? 'text-cyan-400' : ''}
             `}>
                {line.text}
             </div>
          ))}
          <div ref={bottomRef} />
       </div>
       
       <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2 text-[14px]">
          <span className="text-[#00ff00] shrink-0">seabot@kernel:~$</span>
          <input 
             ref={inputRef}
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             className="bg-transparent border-none outline-none flex-1 text-white shadow-none focus:ring-0 w-full"
             autoFocus
             spellCheck={false}
             autoComplete="off"
          />
       </form>
    </div>
  );
}
