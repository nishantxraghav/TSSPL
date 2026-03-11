import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';

interface TopBarProps {
  title: string;
  breadcrumb?: string[];
}

export function TopBar({ title, breadcrumb }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-jakarta mb-0.5">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="font-syne font-bold text-slate-800 text-lg leading-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
