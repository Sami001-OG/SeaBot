import { motion } from "motion/react";
import { SectionCard } from "../components/Cards";
import { BrainCircuit, GitCommit, GitMerge, Database, RefreshCw, TerminalSquare } from "lucide-react";

export function AgentEngineView() {
  const swarmAgents = [
    { id: 'SYS-ORCH-01', role: 'orchestrator', status: 'planning', memory: '1.2MB', tasks: 4 },
    { id: 'WRK-RSRC-89', role: 'researcher', status: 'thinking', memory: '4.5MB', tasks: 1 },
    { id: 'WRK-CODE-22', role: 'coder', status: 'idle', memory: '0.8MB', tasks: 0 },
    { id: 'WRK-EXEC-05', role: 'sandbox', status: 'acting', memory: '128MB', tasks: 1 },
  ];

  const taskDag = [
    { id: 'TSK-001', obj: 'Analyze repository structure', status: 'completed', agent: 'WRK-RSRC-89' },
    { id: 'TSK-002', obj: 'Draft authentication service', status: 'in_progress', agent: 'SYS-ORCH-01' },
    { id: 'TSK-003', obj: 'Validate security compliance', status: 'pending', agent: 'unassigned' },
    { id: 'TSK-004', obj: 'Execute container tests', status: 'pending', agent: 'unassigned' },
  ];

  const reactTraces = [
    { type: 'thought', text: 'I need to check the local API endpoints for the authentication service to understand current auth patterns.' },
    { type: 'action', text: 'Tool: fs_read (path: "./api/auth.ts")' },
    { type: 'observation', text: 'File contains basic express routes. Missing rate limiting and JWT validation.' },
    { type: 'reflection', text: 'The existing implementation is highly insecure. I must dynamically modify the DAG to spawn a "Security Analysis" task before I can consider TSK-002 complete.' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in_progress':
      case 'planning':
      case 'thinking':
      case 'acting': return 'text-accent';
      case 'idle':
      case 'pending': return 'text-text-dim';
      default: return 'text-text-main';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'thought': return 'text-text-dim italic';
      case 'action': return 'text-warning font-bold';
      case 'observation': return 'text-[#a5b4fc]';
      case 'reflection': return 'text-accent font-semibold';
      default: return 'text-text-main';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 auto-rows-min gap-5"
    >
      <div className="col-span-full mb-2">
        <h1 className="text-[18px] font-bold text-white mb-1 tracking-tight">Agent Engine Control</h1>
        <p className="text-text-dim text-[13px]">Live dashboard visualizing Agent State, Planning (DAG), Multi-Agent Swarms, and ReAct Reflection.</p>
      </div>

      {/* MULTI-AGENT SWARM TOPOLOGY */}
      <div className="flex flex-col gap-5">
        <SectionCard title="Multi-Agent Swarm Topology" icon={NetworkIcon}>
          <div className="space-y-3">
            {swarmAgents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    {['planning', 'thinking', 'acting'].includes(agent.status) && (
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      agent.status === 'idle' ? 'bg-text-dim' : 'bg-accent'
                    }`}></span>
                  </div>
                  <div>
                    <div className="font-mono text-[12px] text-white tracking-tight">{agent.id}</div>
                    <div className="text-[10px] text-text-dim uppercase tracking-wider mt-0.5">{agent.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[11px] font-semibold uppercase tracking-wider ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </div>
                  <div className="text-[10px] text-text-dim font-mono mt-0.5">Mem: {agent.memory}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* AGENT STATE & CONTEXT */}
        <SectionCard title="Agent State Sandbox" icon={Database}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-terminal-bg border border-terminal-border rounded">
              <div className="text-[10px] text-text-dim uppercase tracking-wider mb-1">Context Window</div>
              <div className="text-[16px] text-white font-mono">14.2<span className="text-[12px] text-text-dim">K</span> / 128<span className="text-[12px] text-text-dim">K</span></div>
            </div>
            <div className="p-3 bg-terminal-bg border border-terminal-border rounded">
              <div className="text-[10px] text-text-dim uppercase tracking-wider mb-1">LTM Vectors</div>
              <div className="text-[16px] text-white font-mono">1,402</div>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 rounded">
            <div className="text-[10px] text-text-dim uppercase tracking-wider mb-2">Loaded Tools</div>
            <div className="flex flex-wrap gap-2">
              {['fs_read', 'fs_write', 'system_exec', 'browser_relay', 'semantic_search'].map(tool => (
                <span key={tool} className="text-[10px] font-mono text-[#a5b4fc] bg-[#a5b4fc]/10 px-2 py-1 rounded">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex flex-col gap-5">
        {/* TASK PLANNING (DAG) */}
        <SectionCard title="Dynamic Task DAG (Planning)" icon={GitMerge}>
          <div className="relative before:absolute before:inset-0 before:ml-4 before:h-full before:w-[1px] before:bg-white/10 ml-1">
            {taskDag.map((task, index) => (
              <div key={task.id} className="relative flex items-center mb-4 last:mb-0">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-panel z-10 shrink-0 ${
                  task.status === 'completed' ? 'bg-success' : task.status === 'in_progress' ? 'bg-accent' : 'bg-text-dim'
                }`}>
                  {task.status === 'in_progress' && <RefreshCw size={12} className="text-white animate-spin" />}
                  {task.status === 'completed' && <GitCommit size={12} className="text-white" />}
                  {task.status === 'pending' && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                </div>
                <div className="ml-4 w-full p-3 rounded border border-white/5 bg-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-text-dim">{task.id}</span>
                    <span className={`text-[9px] uppercase tracking-wider font-bold ${getStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                  <div className="text-[12px] text-white leading-tight mb-2">{task.obj}</div>
                  <div className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded inline-block">
                    {task.agent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* AGENT REFLECTION (REACT TRACES) */}
        <SectionCard title="Agent Reflection & ReAct Engine" icon={TerminalSquare}>
          <div className="bg-terminal-bg border border-terminal-border rounded p-4 font-mono text-[11px] leading-[1.6] overflow-hidden">
            <div className="text-text-dim mb-3 border-b border-terminal-border pb-2">
              {'// TRACE ID: rct-9f2a-4bcc // AGENT: SYS-ORCH-01'}
            </div>
            <div className="space-y-3">
              {reactTraces.map((trace, idx) => (
                <div key={idx} className="flex items-start">
                  <span className={`min-w-[85px] shrink-0 uppercase tracking-wider text-[10px] mt-0.5 ${
                    trace.type === 'action' ? 'text-warning' : 
                    trace.type === 'reflection' ? 'text-accent' : 
                    'text-success'
                  }`}>
                    [{trace.type}]
                  </span>
                  <span className={`flex-1 break-words ${getLogColor(trace.type)}`}>
                    {trace.text}
                  </span>
                </div>
              ))}
              <div className="flex items-start pt-2 opacity-50 animate-pulse">
                <span className="min-w-[85px] shrink-0 uppercase tracking-wider text-[10px] mt-0.5 text-success">
                  [THINK]
                </span>
                <span className="flex-1 break-words text-text-dim italic">
                  Updating DAG graph and dispatching...
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

    </motion.div>
  );
}

function NetworkIcon(props: any) {
  return <BrainCircuit {...props} />;
}
