import React, { useState, useEffect } from "react";
import { Clock, Terminal, Zap, Trash2, Power, PowerOff, Sparkles, AlertCircle } from "lucide-react";

interface CronJob {
  id: string;
  prompt: string;
  schedule: string;
  taskDefinition: string;
  isActive: boolean;
  createdAt: number;
  lastRun?: number;
  nextRun?: number;
}

export function CronView() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [promptInput, setPromptInput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("seabot-cron-jobs");
    if (saved) {
      try {
        setJobs(JSON.parse(saved));
      } catch (e) {}
    } else {
      setJobs([{
        id: "cron_boot_xyz",
        prompt: "Check system health and notify main channel every hour",
        schedule: "0 * * * *",
        taskDefinition: "sys_health_check && notify(channel_id)",
        isActive: true,
        createdAt: Date.now() - 86400000,
        lastRun: Date.now() - 3600000,
        nextRun: Date.now() + 3600000
      }]);
    }
  }, []);

  const saveJobs = (newJobs: CronJob[]) => {
    setJobs(newJobs);
    localStorage.setItem("seabot-cron-jobs", JSON.stringify(newJobs));
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    
    setIsCompiling(true);
    
    // Simulate AI parsing the natural language prompt into a cron schedule and task target
    setTimeout(() => {
       const lower = promptInput.toLowerCase();
       let inferredSchedule = "*/30 * * * *"; // default 30 mins
       if (lower.includes("minute")) inferredSchedule = "*/1 * * * *";
       if (lower.includes("hour")) inferredSchedule = "0 * * * *";
       if (lower.includes("day") || lower.includes("daily")) inferredSchedule = "0 0 * * *";
       if (lower.includes("week")) inferredSchedule = "0 0 * * 0";

       const newJob: CronJob = {
          id: "cron_" + Math.random().toString(36).substr(2, 9),
          prompt: promptInput,
          schedule: inferredSchedule,
          taskDefinition: "auto_exec_agent_vector",
          isActive: true,
          createdAt: Date.now(),
          nextRun: Date.now() + 60000
       };

       saveJobs([newJob, ...jobs]);
       setPromptInput("");
       setIsCompiling(false);
       
       // Log to virtual memory /fs/write as well
       fetch('/api/fs/write', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
             targetPath: "system_memory/cron/" + newJob.id + ".json", 
             content: JSON.stringify(newJob, null, 2) 
          })
       }).catch(() => {});
       
    }, 1200);
  };

  const toggleJob = (id: string) => {
    saveJobs(jobs.map(j => j.id === id ? { ...j, isActive: !j.isActive } : j));
  };

  const deleteJob = (id: string) => {
    saveJobs(jobs.filter(j => j.id !== id));
  };

  return (
    <div className="flex flex-col w-full h-full p-6 md:p-8 bg-[#0A0A0A] text-[#ededed] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="mb-8 border-b border-[#222] pb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-500" /> Cron Jobs & Automations
        </h1>
        <p className="text-[#a1a1aa] text-[13px] max-w-3xl leading-relaxed">
          Prompt the daemon to establish automatic, looping schedules. Instead of running node workflows manually, 
          the system will interpret your conditions, map them to standard unix cron syntax, and execute agent logic autonomously in the background.
        </p>
      </div>

      {/* Compiler / Prompt Studio */}
      <div className="mb-10 bg-gradient-to-r from-[#111] to-[#161616] border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
         <div className="px-4 py-3 border-b border-[#333] flex items-center gap-2 bg-[#0A0A0A]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[12px] font-bold text-white uppercase tracking-widest">Natural Language Scheduler</span>
         </div>
         <form onSubmit={handleCreateJob} className="p-4 flex flex-col gap-4">
            <div className="relative">
               <textarea 
                 value={promptInput}
                 onChange={e => setPromptInput(e.target.value)}
                 placeholder="e.g., 'Summarize Telegram unread messages every 30 minutes' or 'Execute system health check daily at 9 AM'"
                 className="w-full bg-[#050505] border border-[#222] rounded-xl p-4 text-[13px] text-white outline-none focus:border-amber-500/50 resize-none placeholder:text-[#555] custom-scrollbar"
                 rows={3}
                 disabled={isCompiling}
               />
               <kbd className="absolute bottom-4 right-4 text-[10px] font-mono text-[#555] bg-[#111] border border-[#333] px-2 py-0.5 rounded shadow-sm">Enter to compile</kbd>
            </div>
            
            <div className="flex justify-between items-center pr-2">
               <div className="flex items-center gap-2 text-[11px] text-[#777] font-mono">
                  <Terminal className="w-3.5 h-3.5" />
                  Compiles directly to daemon registry
               </div>
               <button 
                  type="submit"
                  disabled={isCompiling || !promptInput.trim()}
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-[12px] px-5 py-2 rounded-lg transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
               >
                  {isCompiling ? (
                     <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Parsing Logic...</>
                  ) : "Initialize Job"}
               </button>
            </div>
         </form>
      </div>

      {/* Active Jobs Grid */}
      <div>
         <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#777]" /> Active System Timers
         </h2>

         {jobs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#333] rounded-2xl bg-white/[0.02]">
               <Clock className="w-12 h-12 text-[#444] mb-4 mx-auto" />
               <p className="text-[#888] font-medium">No cron jobs configured</p>
               <p className="text-[12px] text-[#555] mt-1">Prompt a condition above to start background processing.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {jobs.map((job) => (
                  <div key={job.id} className="bg-[#111] border border-[#222] rounded-xl flex flex-col overflow-hidden relative group shadow-sm hover:border-[#333] transition-colors">
                     
                     <div className="p-4 border-b border-[#222] flex items-start justify-between bg-[#161616]">
                        <div className="pr-4">
                           <div className="text-[12px] font-bold text-white mb-1.5 leading-snug line-clamp-2">{job.prompt}</div>
                           <div className="text-[10px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded inline-block">
                              cron: {job.schedule}
                           </div>
                        </div>
                        <button 
                           onClick={() => toggleJob(job.id)}
                           className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all " + (job.isActive ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20" : "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20")}
                        >
                           {job.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                     </div>

                     <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                           <div className="text-[10px] uppercase font-bold text-[#666] tracking-wider mb-1">Target Invocation</div>
                           <div className="font-mono text-[11px] text-[#a1a1aa] bg-[#050505] border border-[#222] p-2 rounded truncate">
                              {job.taskDefinition}
                           </div>
                        </div>

                        <div className="mt-5 flex items-end justify-between">
                           <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-[#555]">Next Exec</span>
                              <span className="text-[11px] text-[#cfcfcf] font-medium flex items-center gap-1.5">
                                 {job.isActive ? (
                                    <><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div> {job.nextRun ? new Date(job.nextRun).toLocaleTimeString() : 'Pending...'}</>
                                 ) : (
                                    <><div className="w-1.5 h-1.5 bg-[#444] rounded-full"></div> Suspended</>
                                 )}
                              </span>
                           </div>
                           <button onClick={() => deleteJob(job.id)} className="text-[#666] hover:text-red-400 transition-colors p-1">
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
