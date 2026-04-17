import { motion } from "motion/react";
import { SectionCard, CodeBlock } from "../components/Cards";
import { BrainCircuit, ShieldAlert, DatabaseBackup } from "lucide-react";

export function AgentEngineView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto grid auto-rows-min gap-5"
    >
      <div className="col-span-full mb-2">
        <h1 className="text-[18px] font-bold text-white mb-1 tracking-tight">Agent & Engine</h1>
        <p className="text-text-dim text-[13px]">Step 5, 6 & 7: Autonomous logic, execution sandbox, and memory systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 col-span-full">
        <SectionCard title="5. Agent Framework Design" icon={BrainCircuit}>
          <div className="space-y-4 text-[13px] text-text-main">
            <p>
              The Agent Brain relies on a continuous loop: <strong className="text-accent font-mono">Observe {'>'} Plan {'>'} Execute {'>'} Reflect</strong>.
            </p>
            <ul className="list-disc pl-4 space-y-2 text-text-dim">
              <li><strong className="text-text-main">Planning:</strong> LLM decomposes prompt into a DAG (Directed Acyclic Graph) of sub-tasks.</li>
              <li><strong className="text-text-main">Reasoning (ReAct):</strong> Agents narrate their thoughts to keep context focused before calling a tool.</li>
              <li><strong className="text-text-main">Reflection & Try-Catch:</strong> If a tool fails (e.g., shell error), the agent reads stderr, reflects, and retries with a modified command. Max retry limits apply.</li>
              <li><strong className="text-text-main">Multi-Agent Collab:</strong> A hierarchy where a "Manager Agent" spawns "Specialist Agents" (e.g., CodeWriter, QA_Tester).</li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard title="7. Memory System Architecture" icon={DatabaseBackup}>
           <div className="space-y-4 text-[13px] text-text-main">
              <p>Memory is tiered to mimic human cognition, preventing token-limit exhaustion.</p>
              <div className="border-l-2 border-accent/50 pl-3">
                <strong className="text-text-main text-[10px] uppercase tracking-[0.1em] block mb-1">Short-Term (Context Window)</strong>
                <span className="text-text-dim text-[13px]">Recent conversation history and immediately relevant tool outputs. Managed via shifting window buffering.</span>
              </div>
              <div className="border-l-2 border-success/50 pl-3">
                <strong className="text-text-main text-[10px] uppercase tracking-[0.1em] block mb-1">Long-Term (Vector Memory)</strong>
                <span className="text-text-dim text-[13px]">Embeddings of past successful workflows, personal data, and codebase chunks. Accessed via RAG (Retrieval Augmented Generation).</span>
              </div>
              <div className="border-l-2 border-warning/50 pl-3">
                <strong className="text-text-main text-[10px] uppercase tracking-[0.1em] block mb-1">Procedural Memory</strong>
                <span className="text-text-dim text-[13px]">Compiled macros of workflows that the agent "learned" to do efficiently, drastically reducing API calls for repetitive tasks.</span>
              </div>
           </div>
        </SectionCard>
      </div>

      <div className="col-span-full">
        <SectionCard title="6. Secure Execution Sandbox" icon={ShieldAlert}>
          <div className="text-[13px] text-text-main mb-4">
            Executing LLM-generated code/shell commands is highly dangerous. We use a defense-in-depth approach.
          </div>
          <CodeBlock 
            language="yaml"
            code={`# Execution Engine Security Tiers

Tier 1: Read-Only (Local)
  - Agents can only read specific whitelisted directories.
  - Cannot execute code. Safe for parsing local docs.

Tier 2: Ephemeral Docker Container (Isolated Compute)
  - Generates code -> builds container -> runs -> extracts stdout.
  - No internet access, destroyed on completion.

Tier 3: User Confirmation (Interactive)
  - "The Agent wishes to execute: 'rm -rf node_modules' - Allow? [y/N]"
  - Requires web UI intercept and WebSockets signaling.

Tier 4: Deep OS (Desktop App Only)
  - Full system access (Browser Automation, File System). 
  - Restricted entirely by OS-level permissions (e.g., Mac Accessibility controls).`}
          />
        </SectionCard>
      </div>
    </motion.div>
  );
}
