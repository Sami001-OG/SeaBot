import { motion } from "motion/react";
import { SectionCard, CodeBlock } from "../components/Cards";
import { Database, Layers, Component, Cpu } from "lucide-react";

export function ArchitectureView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto grid auto-rows-min gap-5"
    >
      <div className="col-span-full mb-2">
        <h1 className="text-[18px] font-bold text-white mb-1 tracking-tight">Architecture & Tech Stack</h1>
        <p className="text-text-dim text-[13px]">Step 2, 3 & 4: Modular design, technology selection, and system breakdown.</p>
      </div>

      <div className="col-span-full">
        <SectionCard title="2. System Architecture Map (Hybrid Model)" icon={Layers} mono>
          <div className="font-mono text-[11px] text-[#a5b4fc] whitespace-pre overflow-x-auto bg-terminal-bg p-4 rounded-[4px] border border-terminal-border">
{`[ Web & Desktop Client ] <-----(REST/WebSocket)-----> [ API Gateway (Node/Go) ]
        |                                                     |
  UI / Workflows / Dashboards                         +-------+-------+
        |                                             |               |
 [ Local Daemon ] <--(IPC)--> [ Execution Sandbox ]   | [ Model Router ] -> [ Local LLM (Ollama) ]
        |                             |               |               |
 [ OS File System ]            [ Tool Plugins ]       | [ Agent Brain  ] -> [ Cloud API (Gemini/GPT) ]
                                                      |
                                           [ Memory Engine (Redis/Vector DB) ]`}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 col-span-full">
        <SectionCard title="3. Technology Stack Selection" icon={Cpu}>
          <div className="space-y-4 text-[13px] text-text-main">
            <div>
              <strong className="text-white">Desktop/Web UI: Tauri + React + Vite + Tailwind</strong>
              <p className="text-text-dim mt-1">Why: Tauri avoids electron's memory bloat using system webviews. React provides the ecosystem needed for complex workflow builders (like React Flow).</p>
            </div>
            <div>
              <strong className="text-white">Backend & APIs: Node.ts + Express (Scale to Go/Rust later)</strong>
              <p className="text-text-dim mt-1">Why: Unmatched ecosystem for AI (Langchain, LlamaIndex). Fast to MVP as a single developer.</p>
            </div>
            <div>
              <strong className="text-white">Local Models: Ollama / Llama.cpp</strong>
              <p className="text-text-dim mt-1">Why: Standardized local inference API. Effortless swapping of GGUF models.</p>
            </div>
            <div>
              <strong className="text-white">Memory: Qdrant (Vector) + SQLite (Relational)</strong>
              <p className="text-text-dim mt-1">Why: Both operate locally flawlessly but can connect to cloud equivalents seamlessly.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="4. Core Modules Breakdown" icon={Component}>
          <ul className="space-y-4 text-[13px] text-text-main">
             <li className="flex flex-col">
               <strong className="text-white">Model Router</strong>
               <span className="text-text-dim mt-1">A unified interface wrapping local and cloud models. Automatically routes requests based on context limits, costs, and capabilities.</span>
             </li>
             <li className="flex flex-col">
               <strong className="text-white">Agent Brain</strong>
               <span className="text-text-dim mt-1">Handles Prompt formatting, reasoning loop (ReAct), and task decomposition. Manages state between LLM calls.</span>
             </li>
             <li className="flex flex-col">
               <strong className="text-white">Tool Execution Sandbox</strong>
               <span className="text-text-dim mt-1">Secure isolated environment (Docker / Firecracker / Restricted Shell) where generated code and commands run safely.</span>
             </li>
             <li className="flex flex-col">
               <strong className="text-white">Plugin System</strong>
               <span className="text-text-dim mt-1">Dynamic loading of OpenAPI specs to give agents new capabilities (GitHub, Jira, FileSystem).</span>
             </li>
          </ul>
        </SectionCard>
      </div>
    </motion.div>
  );
}
