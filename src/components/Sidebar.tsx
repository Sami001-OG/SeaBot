import { Network, BrainCircuit, Database, Layout, Terminal, Settings, ChevronRight, Zap, Waves, FolderGit2, MessagesSquare } from "lucide-react";

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
    { id: 'workspace', label: 'File Explorer', icon: FolderGit2, section: 'Core Capabilities' },
    { id: 'memory', label: 'Vector Vault', icon: Database, section: 'Core Capabilities' },
    { id: 'terminal', label: 'Terminal Logs', icon: Terminal, section: 'Core Capabilities' },
    { id: 'settings', label: 'Platform Settings', icon: Settings, section: 'Configuration' },
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
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00c6ff] to-[#0072ff] flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(0,198,255,0.5)]">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-[18px] tracking-tight">SeaBot</span>
        </div>
        
        <div className="flex-1 py-5 flex flex-col gap-1 overflow-y-auto">
          {['Core Capabilities', 'Configuration'].map(section => (
            <div key={section} className="mb-4">
              <div className="px-5 mb-2 text-[10px] text-text-dim uppercase tracking-[0.1em]">
                {section}
              </div>
              {navItems.filter(item => item.section === section).map(item => {
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
          ))}
        </div>
        
        <div className="border-t border-border-default p-4 shrink-0">
          <div className="bg-bg-base/50 rounded-lg p-3 border border-border-default">
            <div className="text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">Daemon Status</div>
            <div className="flex items-center text-[11px] font-mono text-text-main">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-2 animate-pulse"></span>
              <span>Port 18789 Listening</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
