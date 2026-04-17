import React, { useState, useEffect } from "react";
import { Database, Search, ArrowRight, BrainCircuit, Waves } from "lucide-react";

interface MemoryItem {
  id: string;
  content: string;
  tags: string[];
  timestamp: number;
}

export function MemoryView() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [isStoring, setIsStoring] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      // Sort newest first
      setMemories(data.sort((a: MemoryItem, b: MemoryItem) => b.timestamp - a.timestamp));
    } catch(e) {
      console.error(e);
    }
  };

  const storeMemory = async () => {
    if (!newMemory.trim()) return;
    setIsStoring(true);
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        // Just assigning a "manual_ui" tag for things spawned via the GUI vs the Autonomous Agent
        body: JSON.stringify({ content: newMemory, tags: ["manual_ui"] })
      });
      setNewMemory("");
      await fetchMemories();
    } catch(e) {
      console.error(e);
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Database className="w-6 h-6 text-accent" /> Long-Term Memory (Vectors)
        </h1>
        <p className="text-text-dim text-sm max-w-3xl">
          View the implicit knowledge dynamically injected into the embedded vector database. The agent OS queries these autonomously when resolving related tasks.
        </p>
      </div>

      <div className="bg-panel border border-border-default rounded-xl p-4 mb-8 shadow-sm flex items-start gap-4">
        <div className="flex-1 relative">
           <textarea 
             placeholder="Inject manual context: Describe a global instruction, a code pattern, or a fact the system should memorize permanently..."
             className="w-full bg-bg-base border border-border-default rounded-lg p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono resize-none h-24"
             value={newMemory}
             onChange={e => setNewMemory(e.target.value)}
           />
        </div>
        <button 
           onClick={storeMemory}
           disabled={isStoring}
           className="bg-accent hover:bg-accent/80 text-white px-6 py-4 rounded-lg font-medium transition-colors h-24 w-32 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
        >
          <Waves className="w-5 h-5" />
          <span>{isStoring ? 'Embedding...' : 'Store'}</span>
        </button>
      </div>

      <h3 className="text-xs uppercase tracking-wider text-text-dim font-bold mb-4 flex items-center gap-2">
        <BrainCircuit className="w-4 h-4" /> Embedded Vault ({memories.length} Entires)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
        {memories.map(m => (
          <div key={m.id} className="bg-panel border border-border-default rounded-xl p-4 shadow-sm hover:border-accent/40 transition-colors flex flex-col min-h-[160px]">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                {m.id}
              </span>
              <span className="text-[10px] text-text-dim">
                {new Date(m.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-text-main mb-4 flex-1 break-words">{m.content}</p>
            {m.tags && m.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {m.tags.map(t => (
                  <span key={t} className="text-[10px] bg-white/5 text-text-dim px-1.5 py-0.5 rounded">#{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {memories.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-dim border border-dashed border-border-default rounded-xl bg-panel/30">
            Vault is currently empty.
          </div>
        )}
      </div>
    </div>
  );
}
