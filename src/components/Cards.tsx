import React from 'react';

export function SectionCard({ title, icon: Icon, children, mono = false }: { title: string, icon?: React.ElementType, children: React.ReactNode, mono?: boolean }) {
  return (
    <div className="bg-panel border border-border-default rounded-[8px] p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-border-default pb-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-text-dim flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          <span className={mono ? 'font-mono' : ''}>{title}</span>
        </h3>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export function CodeBlock({ code, language = 'bash' }: { code: string, language?: string }) {
  return (
    <div className="mt-3 rounded-[4px] flex-grow border border-terminal-border bg-terminal-bg font-mono text-[12px] leading-[1.6]">
      <div className="flex items-center px-4 py-2 border-b border-terminal-border bg-[#0e1014] text-text-dim text-[11px] uppercase tracking-wider">
        <div className="flex space-x-1.5 mr-4">
          <div className="w-2 h-2 rounded-full bg-border-default"></div>
          <div className="w-2 h-2 rounded-full bg-border-default"></div>
          <div className="w-2 h-2 rounded-full bg-border-default"></div>
        </div>
        {language}
      </div>
      <div className="p-4 overflow-x-auto text-[#a5b4fc] whitespace-pre">
        {code}
      </div>
    </div>
  );
}
