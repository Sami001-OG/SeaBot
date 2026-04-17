import { Bell, Search, Activity, Menu } from "lucide-react";

export function TopBar({ toggleMobileMenu }: { toggleMobileMenu: () => void }) {
  return (
    <div className="h-[60px] border-b border-border-default bg-panel flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-text-dim hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-1 md:w-96 items-center bg-bg-base border border-border-default rounded-[4px] px-3 py-1.5 focus-within:border-accent transition-colors">
          <Search className="w-4 h-4 text-text-dim mr-2 shrink-0" />
          <input 
            type="text"
            placeholder="Search modules..."
            className="bg-transparent border-none outline-none text-[13px] text-text-main w-full placeholder-text-dim"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6 ml-4">
        <div className="hidden lg:flex gap-6 font-mono text-[11px] text-text-main">
          <div className="flex items-center gap-2">
            <span>LATENCY: 14ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span>CPU: 12%</span>
          </div>
          <div className="flex items-center gap-2">
            <span>RAM: 4.2 / 16GB</span>
          </div>
        </div>
        <button className="text-text-dim hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent border-[1.5px] border-panel"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-border-default flex items-center justify-center shrink-0">
          <span className="text-[10px] font-mono text-text-main">ADM</span>
        </div>
      </div>
    </div>
  );
}
