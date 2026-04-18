import { Database, Settings, Zap, Waves, Bot } from "lucide-react";

export function Sidebar({ 
  currentView, 
  setCurrentView 
}: { 
  currentView: string, 
  setCurrentView: (v: string) => void
}) {
  const navItems = [
    { id: 'studio', label: 'Workspace', icon: Bot },
    { id: 'workflows', label: 'Automations', icon: Zap },
    { id: 'memory', label: 'Vector Vault', icon: Database },
  ];

  return (
    <div className="w-[50px] md:w-[60px] bg-[#0A0A0A] border-r border-[#222222] h-screen flex flex-col items-center py-4 flex-shrink-0 z-50">
      
      <div 
        className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-blue-500/20 cursor-pointer"
        onClick={() => setCurrentView('studio')}
      >
        <Waves className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </div>
      
      <div className="flex-1 flex flex-col gap-3 md:gap-4 w-full items-center">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setCurrentView(item.id)}
              className={`relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all group ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'text-[#737373] hover:text-[#ededed] hover:bg-white/5'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 md:h-6 bg-blue-500 rounded-r-full" />}
              <item.icon className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" strokeWidth={1.5} />
            </button>
          )
        })}
      </div>
      
      <div className="flex flex-col gap-4 w-full items-center mt-auto pb-2">
        <button
          title="Settings"
          onClick={() => setCurrentView('settings')}
          className={`relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all group ${
            currentView === 'settings' 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'text-[#737373] hover:text-[#ededed] hover:bg-white/5'
          }`}
        >
          {currentView === 'settings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 md:h-6 bg-blue-500 rounded-r-full" />}
          <Settings className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-45" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
