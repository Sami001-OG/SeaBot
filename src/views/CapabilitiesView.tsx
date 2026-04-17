import { motion } from "motion/react";
import { SectionCard } from "../components/Cards";
import { BrainCircuit, Wrench, MessageSquare, Puzzle, ServerCog, ShieldCheck } from "lucide-react";

export function CapabilitiesView() {
  const ListSection = ({ items }: { items: string[] }) => (
    <ul className="space-y-2.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start text-[13px] text-text-main leading-relaxed">
          <span className="text-accent mt-1 mr-2.5 text-[10px]">■</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto grid auto-rows-min gap-5 pb-20"
    >
      <div className="col-span-full mb-2">
        <h1 className="text-[18px] font-bold text-white mb-1 tracking-tight">System Capabilities</h1>
        <p className="text-text-dim text-[13px]">Comprehensive feature matrix and operational scope of the Nexus OS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 col-span-full items-start">
        <SectionCard title="AI Core" icon={BrainCircuit}>
          <ListSection items={[
            "Multi-model support (Claude, GPT, Gemini, Ollama, LM Studio, openrouter etc)",
            "Agentic ReAct loops (Pi-Mono engine)",
            "Sub-agent spawning",
            "Markdown-based memory (MEMORY.md)",
            "Vector/SQLite semantic search",
            "Human-readable memory journaling"
          ]} />
        </SectionCard>

        <SectionCard title="Core Tools" icon={Wrench}>
          <ListSection items={[
            "File system read/write/edit",
            "Secure, whitelisted command execution",
            "Browser automation (Chrome Relay, Playwright)",
            "Web scraping & screenshot capture",
            "Live Canvas (A2UI HTML/CSS/JS rendering)",
            "Voice input/output (macOS/iOS/Android)"
          ]} />
        </SectionCard>

        <SectionCard title="Channels" icon={MessageSquare}>
          <ListSection items={[
            "WhatsApp, Telegram, Signal",
            "Slack, Discord, Google Chat, Microsoft Teams",
            "iMessage, BlueBubbles, Matrix",
            "IRC, Twitch, Zalo, WeChat, QQ",
            "LINE, Feishu, Mattermost, Nostr",
            "WebChat widget"
          ]} />
        </SectionCard>

        <SectionCard title="Extensibility" icon={Puzzle}>
          <ListSection items={[
            "ClawHub Skills registry (5,700+ modules)",
            "Plugin architecture",
            "MCP (Model Context Protocol) support",
            "SDK for custom development",
            "Codex/Claude/Cursor bundle compatibility"
          ]} />
        </SectionCard>

        <SectionCard title="Operations" icon={ServerCog}>
          <ListSection items={[
            "npm / Docker / Nix installation",
            "CLI wizard for guided setup",
            "Cron-based task scheduling",
            "Cross-platform (macOS, Linux, Windows WSL2)",
            "iOS/Android companion apps"
          ]} />
        </SectionCard>

        <SectionCard title="Security & Privacy" icon={ShieldCheck}>
          <ListSection items={[
            "Local-first data processing",
            "Command whitelisting",
            "Sandboxed code execution",
            "Transparent, human-editable memory files"
          ]} />
        </SectionCard>
      </div>
    </motion.div>
  );
}
