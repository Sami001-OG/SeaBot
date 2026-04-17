import { motion } from "motion/react";
import { SectionCard, CodeBlock } from "../components/Cards";
import { Target, Flag, Rocket, GitPullRequest } from "lucide-react";

export function VisionView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto grid auto-rows-min gap-5"
    >
      <div className="col-span-full mb-2">
        <h1 className="text-[18px] font-bold text-white mb-1 tracking-tight">System Vision</h1>
        <p className="text-text-dim text-[13px]">Step 1 & 9: Core philosophy, target audience, and development roadmap.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 col-span-full">
        <SectionCard title="1. Platform Identity" icon={Target}>
          <div className="space-y-4 text-[13px] text-text-main leading-relaxed">
            <p>
              <strong className="text-white block mb-1">What is Nexus AI OS?</strong>
              Nexus is a privacy-first, local+cloud hybrid AI Operating System. It transitions AI from a "chatbot interface" to an "autonomous computational backend." 
              Like OpenClaw, it treats AI models as a kernel resource, agents as background daemons, and tools as system syscalls.
            </p>
            <ul className="list-disc pl-4 space-y-2 text-text-dim">
              <li><strong className="text-text-main">Target Users:</strong> Power users, automated startups, enterprise developers, and AI researchers.</li>
              <li><strong className="text-text-main">Core Philosophy:</strong> Modularity over monoliths. The user owns their context and compute. If the Wi-Fi drops, the local agents keep working.</li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard title="9. Development Roadmap" icon={Flag}>
          <div className="space-y-4">
            <div className="relative pl-6 border-l border-border-default space-y-6">
              <div className="relative">
                <span className="absolute -left-[31px] w-4 h-4 rounded-full border-4 border-panel bg-accent"></span>
                <h4 className="text-[13px] font-medium text-white">MVP (Phase 1)</h4>
                <p className="text-[11px] text-text-dim mt-1">Local Model Inference, basic REPL execution sandbox, LangChain/LlamaIndex integration, and initial React dashboard.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] w-4 h-4 rounded-full border-4 border-panel bg-text-dim"></span>
                <h4 className="text-[13px] font-medium text-white">30-Day Build (Phase 2)</h4>
                <p className="text-[11px] text-text-dim mt-1">Vector DB (Chroma/Milvus) local integration. Multi-agent planning protocols (ReAct/Plan-and-Solve). File system and terminal tools.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] w-4 h-4 rounded-full border-4 border-panel bg-text-dim"></span>
                <h4 className="text-[13px] font-medium text-white">90-Day Startup (Phase 3)</h4>
                <p className="text-[11px] text-text-dim mt-1">Cloud sync for context (hybrid mode). Desktop App wrapper (Electron/Tauri) with deep OS integration. Plugin marketplace API.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="col-span-full">
        <SectionCard title="Scale & Expansion Strategy" icon={Rocket}>
          <div className="text-[13px] text-text-main mb-4">
            The system assumes a single developer initially, but scale relies on micro-services and strict API boundaries.
          </div>
          <CodeBlock 
            language="typescript"
            code={`// The Core Principle: Every component communicates via gRPC / REST
// allowing teams to later rewrite modules in Rust/Go without breaking the system.

interface AgentPayload {
  taskId: string;
  objective: string;
  allocatedCompute: "local" | "cloud" | "hybrid";
  sandboxBounds: { network: boolean, filesystem: string[] };
}

// Future expansion: cluster-level orchestration via Kubernetes integration.
export async function dispatchToSwarm(payload: AgentPayload) {
  // 1. Check local compute
  // 2. Offload to cloud if complex
  // 3. Monitor via EventStream
}`}
          />
        </SectionCard>
      </div>
    </motion.div>
  );
}
