import React, { useState, useEffect, useRef } from 'react';

export function SetupTerminalView({ onComplete }: { onComplete: () => void }) {
  const [history, setHistory] = useState<string[]>([
    "🌊 initializing SeaBot Setup Wizard...",
    "==========================================",
    "Run this wizard in your native terminal via 'npx seabot' or complete it here:",
    ""
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const prompts = [
    { key: "GEMINI_API_KEY", msg: "Primary AI API Key (Gemini/OpenAI) [Press Enter to Skip]:" },
    { key: "TELEGRAM_TOKEN", msg: "Telegram Bot Token (Channels Integration) [Press Enter to Skip]:" },
    { key: "WHATSAPP_TOKEN", msg: "WhatsApp Cloud Token (Channels Integration) [Press Enter to Skip]:" },
    { key: "SEARCH_API_KEY", msg: "Tavily Search API Key (Web Surfing) [Press Enter to Skip]:" },
  ];

  useEffect(() => {
    if (step < prompts.length) {
      setHistory(prev => [...prev, prompts[step].msg]);
    } else if (step === prompts.length) {
      finalizeSetup();
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [step]);

  const finalizeSetup = async () => {
    setHistory(prev => [...prev, "Saving configuration to local .env...", "[SUCCESS] Environment configured successfully."]);
    
    try {
      await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setHistory(prev => [...prev, "[STARTING] Redirecting to SeaBot Web Dashboard on localhost..."]);
      setTimeout(onComplete, 2000);
    } catch (e) {
      setHistory(prev => [...prev, "[ERROR] Failed to save config via API."]);
      setTimeout(onComplete, 2000); // Proceed anyway for the demo
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const val = input.trim();
      if (step < prompts.length) {
        if (val) {
          setConfig(prev => ({ ...prev, [prompts[step].key]: val }));
        }
        setHistory(prev => [...prev, `> ${val ? '********' : '[SKIPPED]'}`]);
        setStep(prev => prev + 1);
        setInput("");
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0b0c0e] flex items-center justify-center p-4 md:p-10 font-mono">
      <div className="w-full max-w-3xl h-[500px] border border-terminal-border bg-terminal-bg rounded flex flex-col p-6 shadow-2xl relative overflow-hidden">
        
        {/* Fake Terminal Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
           </div>
           <span className="text-text-dim text-xs font-semibold tracking-wider">seabot-cli — local bash</span>
           <div className="w-16"></div> {/* Spacer to center title */}
        </div>

        {/* Terminal Output */}
        <div className="flex-1 overflow-y-auto space-y-2 text-[13px] md:text-sm text-[#00c6ff] pb-10">
          {history.map((line, i) => (
            <div key={i} className={line.startsWith('>') ? 'text-white/70' : line.includes('ERROR') ? 'text-red-400' : ''}>
              {line}
            </div>
          ))}
          {step < prompts.length && (
            <div className="flex items-center mt-2 animate-pulse-fast">
              <span className="mr-3 text-white">➜</span>
              <input
                autoFocus
                type="text"
                spellCheck="false"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none flex-1 text-white focus:ring-0 w-full"
              />
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>
    </div>
  );
}
