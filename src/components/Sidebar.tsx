import { Network, BrainCircuit, Database, Layout, Terminal, Settings, ChevronRight, Zap } from "lucide-react";

export function Sidebar({ 
  currentView, 
  setCurrentView, 
  isOpen, 
  setIsOpen 
}: { 
  currentView: string, 
  setCurrentView: (v: string) => void,
  isOpen: boolean,
  setIsOpen: (v: boolean) => void
}) {
  const navItems = [
    { id: 'vision', label: 'System Vision', icon: Network },
    { id: 'architecture', label: 'Architecture', icon: Database },
    { id: 'agent', label: 'Agent Engine', icon: BrainCircuit },
    { id: 'capabilities', label: 'Capabilities', icon: Zap },
    { id: 'ui', label: 'Dashboard UX', icon: Layout },
    { id: 'terminal', label: 'Execution', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-panel border-r border-border-default h-screen flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-[60px] flex items-center px-6 border-b border-border-default shrink-0">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-[18px] tracking-tight">Nexus OS</span>
        </div>
        
        <div className="flex-1 py-5 flex flex-col gap-1 overflow-y-auto">
          <div className="px-5 mb-2 text-[10px] text-text-dim uppercase tracking-[0.1em]">
            Platform Specs
          </div>
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-5 py-2.5 transition-all text-left ${
                  isActive 
                    ? 'bg-accent-dim text-accent border-r-2 border-accent' 
                    : 'text-text-dim hover:bg-accent-dim hover:text-accent border-r-2 border-transparent'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-accent" />}
              </button>
            )
          })}
        </div>
        
        <div className="border-t border-border-default p-4 shrink-0">
          <div className="bg-bg-base/50 rounded-lg p-3 border border-border-default">
            <div className="text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">System Status</div>
            <div className="flex items-center text-[11px] font-mono text-text-main">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-2"></span>
              <span>All Systems Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
