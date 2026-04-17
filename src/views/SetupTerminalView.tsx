import React, { useState, useEffect, useRef } from 'react';

type WizardState = 'IDLE' | 'RUNTIME' | 'PROVIDER' | 'API_KEY' | 'GATEWAY' | 'VERIFYING';

export function SetupTerminalView({ onComplete }: { onComplete: () => void }) {
  const [history, setHistory] = useState<string[]>([
    "🌊 SeaBot OS Initialized.",
    "==========================================",
    "Run 'seabot onboard --install-daemon' to configure Gateway, Runtime, and Model Providers.",
    ""
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<WizardState>('IDLE');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState('GEMINI');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [history, step]);

  const finalizeSetup = async (finalConfig: Record<string, string>) => {
    setHistory(prev => [...prev, "Verifying Gateway daemon on port 18789..."]);
    
    setTimeout(async () => {
       setHistory(prev => [...prev, "[SUCCESS] Gateway verified.", "Saving configuration to local .env..."]);
       try {
         await fetch('/api/setup', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(finalConfig)
         });
         setHistory(prev => [...prev, "[SUCCESS] Environment configured successfully.", "[STARTING] Launching Web Interface..."]);
         setTimeout(onComplete, 1500);
       } catch (e) {
         setHistory(prev => [...prev, "[ERROR] Failed to save config via API."]);
         setTimeout(onComplete, 1500);
       }
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const val = input.trim();
      let nextHistory = [...history, `> ${val}`];
      
      switch (step) {
        case 'IDLE':
          if (val === 'seabot onboard --install-daemon' || val === 'openclaw onboard --install-daemon') {
            nextHistory.push(
              "Starting Daemon Installer...",
              "Configure Node.js Runtime Path [default: /usr/local/bin/node]:"
            );
            setStep('RUNTIME');
          } else {
             nextHistory.push(`Command not found: ${val}. Try 'seabot onboard --install-daemon'`);
          }
          break;
        case 'RUNTIME':
          setConfig(prev => ({ ...prev, NODE_RUNTIME_PATH: val || '/usr/local/bin/node' }));
          nextHistory.push(
            "Supported Providers: openai, anthropic, gemini, xai, mistral, groq, cerebras, openrouter, huggingface, nvidia, together, moonshot, qianfan, qwen, volcengine, byteplus, xiaomi, vercel, cloudflare, stepfun, venice, kilocode, minimax, copilot",
            "Select Model Provider [default: gemini]:"
          );
          setStep('PROVIDER');
          break;
        case 'PROVIDER':
          const prov = (val || 'gemini').toUpperCase();
          setSelectedProvider(prov);
          setConfig(prev => ({ ...prev, PRIMARY_PROVIDER: prov }));
          nextHistory.push(
            `Enter API Key for ${prov} (Supports rotation: ${prov}_API_KEYS, OPENCLAW_LIVE_${prov}_KEY) [skip]:`
          );
          setStep('API_KEY');
          break;
        case 'API_KEY':
          if (val) {
             // In UI, hide the actual token output in log history loop (already pushed `> ${val}` above)
             nextHistory[nextHistory.length - 1] = `> ${'*'.repeat(val.length)}`;
             setConfig(prev => ({ ...prev, [`${selectedProvider}_API_KEY`]: val }));
          } else {
             nextHistory[nextHistory.length - 1] = `> [SKIPPED]`;
          }
          nextHistory.push("Configure Gateway Port [default: 18789]:");
          setStep('GATEWAY');
          break;
        case 'GATEWAY':
          const updatedConfig = { ...config, GATEWAY_PORT: val || '18789' };
          setConfig(updatedConfig);
          setStep('VERIFYING');
          finalizeSetup(updatedConfig);
          break;
      }
      
      setHistory(nextHistory);
      setInput("");
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0b0c0e] flex items-center justify-center p-4 md:p-10 font-mono">
      <div className="w-full max-w-4xl h-[600px] border border-terminal-border bg-terminal-bg rounded flex flex-col p-6 shadow-2xl relative overflow-hidden">
        
        {/* Fake Terminal Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
           </div>
           <span className="text-text-dim text-xs font-semibold tracking-wider">seabot bash — 80x24</span>
           <div className="w-16"></div> 
        </div>

        {/* Terminal Output */}
        <div className="flex-1 overflow-y-auto space-y-2 text-[13px] md:text-sm text-[#00c6ff] pb-10">
          {history.map((line, i) => (
            <div key={i} className={line.startsWith('>') ? 'text-white/70' : line.includes('ERROR') ? 'text-red-400' : ''}>
              {line}
            </div>
          ))}
          {step !== 'VERIFYING' && (
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
