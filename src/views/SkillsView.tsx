import React, { useState, useEffect } from "react";
import { Zap, Github, ShoppingCart, TrendingUp, MonitorSmartphone, Server, Trash2, PlusCircle, CheckCircle2, AlertCircle, X } from "lucide-react";

interface AgentSkill {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  sop: string;
  status: 'active' | 'inactive';
  icon: string;
  isCustom: boolean;
}

const NATIVE_SKILLS: AgentSkill[] = [
  {
    id: "skill_playwright_browsing",
    name: "Headless Web Browser",
    description: "Allows the OS to autonomously browse the live internet, click elements, fill forms, and take screenshots using Puppeteer/Playwright.",
    icon: "MonitorSmartphone",
    dependencies: ["npm install playwright", "npx playwright install chromium"],
    sop: "When the objective requires scraping dynamic websites or shopping, create a Node script calling Playwright. Launch chromium headlessly. Output the scraped text to stdout or click elements procedurally. Use system_exec to run your script and observe the browser DOM.",
    status: "inactive",
    isCustom: false
  },
  {
    id: "skill_trading_backtest",
    name: "Trading Strategy Backtester",
    description: "Grants quantitative capability. Backtest trading logic over historical data using Python plugins.",
    icon: "TrendingUp",
    dependencies: ["pip install pandas numpy backtrader yfinance"],
    sop: "When asked to analyze or backtest a trading strategy, write a standalone Python script utilizing 'backtrader' and 'yfinance'. Fetch historical OHLCV data directly. Program the logic into a strategy class, run the Cerebro engine, and print the Final Portfolio Value alongside a breakdown of win rates.",
    status: "inactive",
    isCustom: false
  },
  {
    id: "skill_ecom_shopper",
    name: "Autonomous Shopper API",
    description: "Equips the agent with logic circuits to interact with standard E-Commerce structures.",
    icon: "ShoppingCart",
    dependencies: ["npm install axios cheerio puppeteer"],
    sop: "When asked to buy something or construct an order, ALWAYS search multiple marketplaces using Cherrio/Puppeteer. Compile the optimal price list. Simulate logging into the target store, navigating to the cart, and stop explicitly right before entering payment details.",
    status: "inactive",
    isCustom: false
  }
];

export function SkillsView() {
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSkill, setCustomSkill] = useState({ name: "", description: "", dependencies: "", sop: "" });

  useEffect(() => {
    fetch('/api/fs/read?path=.nexus/skills.json')
      .then(res => res.json())
      .then(data => {
         if (data && data.content) {
            setSkills(JSON.parse(data.content));
         } else {
            setSkills(NATIVE_SKILLS);
            syncToBackend(NATIVE_SKILLS);
         }
      }).catch(() => {
         setSkills(NATIVE_SKILLS);
         syncToBackend(NATIVE_SKILLS);
      });
  }, []);

  const syncToBackend = async (data: AgentSkill[]) => {
    setIsProcessing(true);
    try {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          targetPath: '.nexus/skills.json',
          content: JSON.stringify(data, null, 2)
        })
      });
    } catch(e) {}
    setIsProcessing(false);
  };

  const toggleStatus = (id: string) => {
    const next = skills.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } as AgentSkill : s);
    setSkills(next);
    syncToBackend(next);
  };

  const deleteSkill = (id: string) => {
    const next = skills.filter(s => s.id !== id);
    setSkills(next);
    syncToBackend(next);
  };

  const saveCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkill.name || !customSkill.sop) return;

    const newSkill: AgentSkill = {
       id: `custom_skill_${Date.now()}`,
       name: customSkill.name,
       description: customSkill.description,
       dependencies: customSkill.dependencies.split(',').map(s => s.trim()).filter(Boolean),
       sop: customSkill.sop,
       status: 'active',
       icon: 'Server',
       isCustom: true
    };

    const next = [...skills, newSkill];
    setSkills(next);
    syncToBackend(next);
    setShowCustomModal(false);
    setCustomSkill({ name: "", description: "", dependencies: "", sop: "" });
  };

  const renderIcon = (name: string) => {
    if (name === "MonitorSmartphone") return <MonitorSmartphone className="w-6 h-6 text-emerald-400" />;
    if (name === "TrendingUp") return <TrendingUp className="w-6 h-6 text-purple-400" />;
    if (name === "ShoppingCart") return <ShoppingCart className="w-6 h-6 text-amber-400" />;
    return <Server className="w-6 h-6 text-blue-400" />;
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0A] text-[#ededed] overflow-y-auto custom-scrollbar p-6 lg:p-10">
      
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full">
         <div>
           <h1 className="text-2xl font-bold flex items-center gap-3 tracking-wide">
             <Zap className="w-7 h-7 text-yellow-400" /> Executive Capabilities & Skills
           </h1>
           <p className="text-[#a1a1aa] mt-2 max-w-3xl leading-relaxed text-[14px]">
             Manage the OS core capabilities. When a skill is deployed, its Standard Operating Procedure (SOP) and dependencies are injected natively into the Agent's Node Execution Graph, granting it literal instructions on how to use standard tooling to achieve exotic tasks autonomously.
           </p>
         </div>
         <button 
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
         >
           <PlusCircle className="w-4 h-4" /> Add Custom Skill
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        {skills.map(skill => (
           <div key={skill.id} className="bg-[#111] border border-[#222] hover:border-[#333] flex flex-col rounded-xl overflow-hidden transition-all shadow-sm">
             <div className="p-5 border-b border-[#222] flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
                  {renderIcon(skill.icon)}
                </div>
                <div>
                   <h3 className="font-bold text-[15px]">{skill.name}</h3>
                   <div className="text-[11px] font-mono mt-1 text-[#777] uppercase">
                     {skill.isCustom ? 'Custom Plugin' : 'Native Core'}
                   </div>
                </div>
             </div>
             
             <div className="p-5 flex-1 flex flex-col gap-4">
                <p className="text-[13px] text-[#aaa] leading-relaxed flex-1">
                  {skill.description}
                </p>
                
                {skill.dependencies.length > 0 && (
                  <div className="bg-[#050505] border border-[#222] rounded text-[10px] font-mono p-2">
                    <div className="text-[#555] mb-1">REQ DEPENDENCIES</div>
                    <ul className="text-blue-400 list-disc pl-4 space-y-1">
                       {skill.dependencies.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
             </div>

             <div className="bg-[#161616] border-t border-[#222] p-3 flex justify-between items-center">
                <button 
                  onClick={() => toggleStatus(skill.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${skill.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-[#777] hover:text-[#ccc] border border-transparent hover:border-[#333]'}`}
                >
                   {skill.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                   {skill.status === 'active' ? 'Deployed Active' : 'Install / Activate'}
                </button>

                {skill.isCustom && (
                  <button onClick={() => deleteSkill(skill.id)} className="text-[#555] hover:text-red-400 transition-colors p-2">
                     <Trash2 className="w-4 h-4" />
                  </button>
                )}
             </div>
           </div>
        ))}
      </div>

      {/* CUSTOM SKILL MODAL */}
      {showCustomModal && (
         <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col font-sans">
               <div className="p-5 border-b border-[#222] flex justify-between items-center">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-400" /> Create Custom Logic Skill
                  </h2>
                  <button onClick={() => setShowCustomModal(false)} className="text-[#777] hover:text-white">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={saveCustomSkill} className="p-5 flex flex-col gap-4">
                  <div>
                     <label className="text-[12px] font-bold text-[#888] uppercase mb-1 block">Skill Name</label>
                     <input required autoFocus value={customSkill.name} onChange={e => setCustomSkill({...customSkill, name: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded px-3 py-2 text-[13px] outline-none focus:border-blue-500" placeholder="e.g. Discord Notifier Script" />
                  </div>
                  <div>
                     <label className="text-[12px] font-bold text-[#888] uppercase mb-1 block">Description</label>
                     <input required value={customSkill.description} onChange={e => setCustomSkill({...customSkill, description: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded px-3 py-2 text-[13px] outline-none focus:border-blue-500" placeholder="What does this capability do?" />
                  </div>
                  <div>
                     <label className="text-[12px] font-bold text-[#888] uppercase mb-1 block">Terminal Dependencies (Comma Separated)</label>
                     <input value={customSkill.dependencies} onChange={e => setCustomSkill({...customSkill, dependencies: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded px-3 py-2 text-[13px] font-mono outline-none focus:border-blue-500" placeholder="npm install discord.js, pip install requests" />
                  </div>
                  <div>
                     <label className="text-[12px] font-bold text-[#888] uppercase mb-1 block">Standard Operating Procedure (SOP)</label>
                     <textarea required value={customSkill.sop} onChange={e => setCustomSkill({...customSkill, sop: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded px-3 py-2 text-[13px] font-mono outline-none focus:border-blue-500 h-32 resize-none custom-scrollbar" placeholder="When asked to notify Discord, you MUST write a node script that logs in using the DISCORD_TOKEN env variable..." />
                  </div>

                  <div className="mt-4 flex gap-3">
                     <button type="button" onClick={() => setShowCustomModal(false)} className="flex-1 py-2 rounded-lg font-bold text-[13px] bg-[#161616] border border-[#333] text-white hover:bg-[#222]">Cancel</button>
                     <button type="submit" className="flex-1 py-2 rounded-lg font-bold text-[13px] bg-blue-600 text-white hover:bg-blue-500">Deploy Global Skill</button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}
