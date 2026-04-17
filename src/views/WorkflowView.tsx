import React from "react";
import { Zap, Play, Terminal, Database, Code, Globe, ArrowRight } from "lucide-react";

export function WorkflowView() {

  const triggerWorkflow = async (prompt: string) => {
     // Store the workflow prompt and trigger an event to physically flip to the Command Center
     localStorage.setItem("seabot-pending-workflow", prompt);
     // Reload to let App loop and mount CommandCenter automatically 
     // (or we can just dispatch a custom event, but a quick reload works beautifully in this SPA shell for the demo)
     window.location.reload();
  };

  const pipelines = [
    {
      id: "crypto_pipeline",
      name: "Crypto Signal Builder",
      desc: "Autonomously generates a crypto data scraper, connects to a technical indicator API, formats signals, and logs them to a database.",
      icon: Zap,
      steps: [
        { label: "Fetch Market Data", icon: Globe },
        { label: "Analyze Indicators", icon: Code },
        { label: "Log to SQLite", icon: Database },
      ],
      prompt: "Build an automated crypto signal application locally. Include an API fetcher for market data, a processor for technical indicators, and export the logs to SQLite."
    },
    {
      id: "saas_scaffold",
      name: "React SaaS Scaffold",
      desc: "Instantly chains fs_list and fs_write to architect a production-ready Vite + React frontend folder structure with Tailwind CSS setup.",
      icon: Code,
      steps: [
        { label: "Architect Folders", icon: Terminal },
        { label: "Write Components", icon: Code },
        { label: "Inject Styles", icon: Zap },
      ],
      prompt: "Using fs_write, architect a complete React SaaS template inside a folder named 'saas_frontend'. Include a sidebar, dashboard view, and tailwind configuration."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="w-6 h-6 text-accent" /> Workflow Automations
        </h1>
        <p className="text-text-dim text-sm max-w-2xl">
          Instantly trigger complex, multi-step agent pipelines. These pre-configured workflows send highly-optimized objective architectures to the Autonomous Engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pipelines.map(pipe => (
          <div key={pipe.id} className="bg-panel border border-border-default rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
            
            {/* Background Accent */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <pipe.icon className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg font-bold text-white">{pipe.name}</h2>
            </div>

            <p className="text-sm text-text-dim mb-6 flex-1">
              {pipe.desc}
            </p>

            <div className="bg-bg-base border border-border-default rounded-lg p-4 mb-6">
               <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-3">Pipeline Execution Path</div>
               <div className="flex items-center gap-2">
                 {pipe.steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center gap-1.5 flex-1 relative">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10 relative">
                          <step.icon className="w-3.5 h-3.5 text-text-main" />
                        </div>
                        <span className="text-[10px] text-center text-text-dim leading-tight">{step.label}</span>
                      </div>
                      {idx < pipe.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-border-default -translate-y-3 shrink-0" />
                      )}
                    </React.Fragment>
                 ))}
               </div>
            </div>

            <button 
              onClick={() => triggerWorkflow(pipe.prompt)}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-accent hover:text-white border border-border-default hover:border-accent text-text-main py-3 rounded-lg text-sm font-semibold transition-all z-10 relative"
            >
              <Play className="w-4 h-4 z-10 relative" /> Trigger Automation
            </button>
          </div>
        ))}
        
        <div className="border border-dashed border-border-default rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer bg-panel/30 min-h-[300px]">
           <Zap className="w-8 h-8 text-text-dim mb-3" />
           <h3 className="font-semibold text-white mb-1">Create Custom Workflow</h3>
           <p className="text-xs text-text-dim">Define a new agent pipeline graph and store it in Memory.</p>
        </div>
      </div>
    </div>
  );
}
