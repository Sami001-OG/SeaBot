import { MessageSquare, BarChart2, Link, Radio, FileText, Loader, Zap, Monitor, Settings, Bug, ScrollText } from "lucide-react";

export function Sidebar({ 
  currentView, 
  setCurrentView 
}: { 
  currentView: string, 
  setCurrentView: (v: string) => void
}) {
  const groups = [
    {
      title: "Chat",
      items: [
        { id: 'chat', label: 'Chat', icon: MessageSquare }
      ]
    },
    {
      title: "Control",
      items: [
        { id: 'overview', label: 'Overview', icon: BarChart2 },
        { id: 'channels', label: 'Channels', icon: Link },
        { id: 'instances', label: 'Instances', icon: Radio },
        { id: 'sessions', label: 'Sessions', icon: FileText },
        { id: 'cron', label: 'Cron Jobs', icon: Loader }
      ]
    },
    {
      title: "Agent",
      items: [
        { id: 'skills', label: 'Skills', icon: Zap },
        { id: 'nodes', label: 'Nodes', icon: Monitor }
      ]
    },
    {
      title: "Settings",
      items: [
        { id: 'config', label: 'Config', icon: Settings },
        { id: 'debug', label: 'Debug', icon: Bug },
        { id: 'logs', label: 'Logs', icon: ScrollText }
      ]
    }
  ];

  return (
    <div className="w-[240px] bg-[#050505] border-r border-[#1a1a1a] h-screen flex flex-col flex-shrink-0 z-50 overflow-y-auto custom-scrollbar pt-6">
      <div className="flex-1 flex flex-col px-3">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="mb-6">
            <div className="text-[#666666] text-[11px] font-semibold tracking-wide px-3 mb-2">{group.title}</div>
            <div className="flex flex-col gap-0.5">
              {group.items.map(item => {
                const isActive = currentView === item.id;
                return (
                  <button
                    id={`nav-${item.id}`}
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-[13px] ${
                      isActive 
                        ? 'bg-[#3b1a1f]/80 text-[#e65a6b] font-medium' 
                        : 'text-[#a1a1aa] hover:text-[#ededed] hover:bg-white/5'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-[#e65a6b]" : "text-[#737373]"}`} strokeWidth={isActive ? 2 : 1.5} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
