import React, { useState, useEffect } from "react";
import { Database, UploadCloud, FileText, Link as LinkIcon, Cpu, Trash2, HardDrive, FileJson, CheckCircle2, AlertCircle } from "lucide-react";

interface SkillData {
  id: string;
  name: string;
  type: 'document' | 'text' | 'url';
  size: string;
  status: 'active' | 'processing';
  createdAt: number;
}

export function SkillsView() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [activeTab, setActiveTab] = useState<'document' | 'text' | 'url'>('document');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("seabot-skills-data");
    if (saved) {
      try {
        setSkills(JSON.parse(saved));
      } catch (e) {}
    } else {
      setSkills([
        {
          id: "skill_fs_1",
          name: "Company Architecture Docs",
          type: "document",
          size: "4.2 MB",
          status: "active",
          createdAt: Date.now() - 172800000
        },
        {
          id: "skill_fs_2",
          name: "API Spec Reference URLs",
          type: "url",
          size: "125 KB",
          status: "active",
          createdAt: Date.now() - 86400000
        }
      ]);
    }
  }, []);

  const saveSkills = (newSkills: SkillData[]) => {
    setSkills(newSkills);
    localStorage.setItem("seabot-skills-data", JSON.stringify(newSkills));
  };

  const handleIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    setIsProcessing(true);

    const newSkill: SkillData = {
      id: "skill_" + Math.random().toString(36).substr(2, 9),
      name: inputName,
      type: activeTab,
      size: activeTab === 'document' ? Math.floor(Math.random() * 10 + 1) + " MB" : (Math.floor(Math.random() * 500 + 10) + " KB"),
      status: 'processing',
      createdAt: Date.now()
    };

    const updated = [newSkill, ...skills];
    saveSkills(updated);
    
    setInputName("");
    setInputValue("");

    // Simulate vectorization and embedding delay
    setTimeout(() => {
      saveSkills(updated.map(s => s.id === newSkill.id ? { ...s, status: 'active' } : s));
      setIsProcessing(false);
    }, 2500);
  };

  const removeSkill = (id: string) => {
    saveSkills(skills.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col xl:flex-row w-full h-full bg-[#0A0A0A] text-[#ededed] overflow-hidden">
      
      {/* LEFT PANEL: Ingestion Studio */}
      <div className="w-full xl:w-[450px] bg-[#111] border-r border-[#222] flex flex-col shrink-0 overflow-y-auto custom-scrollbar h-full">
        <div className="p-6 md:p-8 border-b border-[#222]">
           <h1 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
             <Cpu className="w-6 h-6 text-emerald-400" /> Data & Skills
           </h1>
           <p className="text-[#a1a1aa] text-[13px] leading-relaxed">
             Feed various types and sizes of data into the agent's contextual memory pipeline. The AI will cross-reference this embedded knowledge to act faster, more accurately, and with dedicated expertise.
           </p>
        </div>

        <div className="p-6 md:p-8 flex-1">
           <h2 className="text-[11px] font-bold text-[#777] uppercase tracking-wider mb-4 flex items-center gap-2">
              <UploadCloud className="w-4 h-4" /> Add New Skill Data
           </h2>

           {/* Tabs */}
           <div className="flex gap-1 bg-[#0A0A0A] border border-[#222] p-1 rounded-lg mb-6">
              <button 
                 onClick={() => setActiveTab('document')} 
                 className={`flex-1 py-1.5 text-[11px] font-bold rounded flex justify-center items-center gap-1.5 transition-all ${activeTab === 'document' ? 'bg-[#1a1a1a] text-white shadow-sm border border-[#333]' : 'text-[#777] hover:text-[#ccc]'}`}
              >
                 <FileText className="w-3.5 h-3.5" /> File
              </button>
              <button 
                 onClick={() => setActiveTab('text')} 
                 className={`flex-1 py-1.5 text-[11px] font-bold rounded flex justify-center items-center gap-1.5 transition-all ${activeTab === 'text' ? 'bg-[#1a1a1a] text-white shadow-sm border border-[#333]' : 'text-[#777] hover:text-[#ccc]'}`}
              >
                 <FileJson className="w-3.5 h-3.5" /> Text
              </button>
              <button 
                 onClick={() => setActiveTab('url')} 
                 className={`flex-1 py-1.5 text-[11px] font-bold rounded flex justify-center items-center gap-1.5 transition-all ${activeTab === 'url' ? 'bg-[#1a1a1a] text-white shadow-sm border border-[#333]' : 'text-[#777] hover:text-[#ccc]'}`}
              >
                 <LinkIcon className="w-3.5 h-3.5" /> URL
              </button>
           </div>

           {/* Input Form */}
           <form onSubmit={handleIngest} className="flex flex-col gap-4">
              <div>
                 <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">Dataset / Skill Name</label>
                 <input 
                    required
                    type="text" 
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Q4 Financial Reports"
                    className="w-full bg-[#050505] border border-[#333] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-emerald-500/50"
                 />
              </div>

              {activeTab === 'document' && (
                 <div className="border-2 border-dashed border-[#333] bg-[#0A0A0A] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                    <div className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                       <UploadCloud className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-[13px] font-bold text-white mb-1">Click to browse or drag file</div>
                    <div className="text-[11px] text-[#777]">PDF, CSV, JSON, TXT (No file size limit)</div>
                 </div>
              )}

              {activeTab === 'text' && (
                 <div>
                    <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">Raw Data Output</label>
                    <textarea 
                       required
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       placeholder="Paste raw text or JSON data here to vectorize..."
                       className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-[13px] font-mono text-white outline-none focus:border-emerald-500/50 resize-none h-32 custom-scrollbar"
                    />
                 </div>
              )}

              {activeTab === 'url' && (
                 <div>
                    <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">Target Address</label>
                    <input 
                       required
                       type="url"
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       placeholder="https://docs.example.com"
                       className="w-full bg-[#050505] border border-[#333] rounded-lg px-3 py-2 text-[13px] font-mono text-white outline-none focus:border-emerald-500/50"
                    />
                 </div>
              )}

              <button 
                 type="submit" 
                 disabled={isProcessing || !inputName.trim()}
                 className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[12px] py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                 {isProcessing ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Vectorizing Data...</>
                 ) : "Ingest & Train"}
              </button>
           </form>
        </div>
      </div>

      {/* RIGHT PANEL: Vectorized Memory Grid */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar h-full relative">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
               <Database className="w-5 h-5 text-[#888]" /> Embedded Knowledge Base
            </h2>
            <div className="text-[11px] text-[#777] font-mono bg-[#111] px-2 py-1 border border-[#222] rounded flex items-center gap-2">
               <HardDrive className="w-3.5 h-3.5" /> Total Index: {skills.length} Vectors
            </div>
         </div>

         {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#333] rounded-2xl bg-white/[0.01]">
               <Database className="w-12 h-12 text-[#333] mb-4" />
               <p className="text-[#888] font-medium text-[14px]">Knowledge Base Empty</p>
               <p className="text-[#555] text-xs mt-1 max-w-sm text-center">Upload files, plain text, or URLs on the left to start expanding the agent's skills.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {skills.map(skill => (
                  <div key={skill.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#444] transition-colors group flex flex-col shadow-sm">
                     <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#161616] h-[72px]">
                        <div className="flex items-center gap-3 w-full">
                           <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[#333] flex items-center justify-center shrink-0">
                              {skill.type === 'document' && <FileText className="w-5 h-5 text-blue-400" />}
                              {skill.type === 'text' && <FileJson className="w-5 h-5 text-amber-400" />}
                              {skill.type === 'url' && <LinkIcon className="w-5 h-5 text-purple-400" />}
                           </div>
                           <div className="min-w-0 pr-4">
                              <h3 className="font-bold text-[13px] text-white truncate" title={skill.name}>{skill.name}</h3>
                              <p className="text-[10px] text-[#777] uppercase tracking-wider font-mono mt-0.5">{skill.type} DATASET</p>
                           </div>
                        </div>
                     </div>
                     <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#888]">
                           <span>Size Structure</span>
                           <span className="text-[#ededed] font-medium">{skill.size}</span>
                        </div>
                        
                        <div className="flex items-end justify-between mt-auto">
                           {skill.status === 'processing' ? (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 animate-pulse">
                                 <div className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                 Processing...
                              </div>
                           ) : (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                                 <CheckCircle2 className="w-4 h-4" /> Active Array
                              </div>
                           )}
                           <button 
                              onClick={() => removeSkill(skill.id)}
                              className="text-[#555] hover:text-red-400 transition-colors"
                              title="Delete Memory"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
}
