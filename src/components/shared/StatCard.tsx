import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accentColor: string;
  bgColor: string;
  iconColor: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, accentColor, bgColor, iconColor, delay = 0 }: StatCardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 opacity-0 animate-fade-up')}
      style={{
        borderLeft: `4px solid ${accentColor}`,
        animationDelay: `${delay}s`,
        animationFillMode: 'forwards',
      }}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0')} style={{ backgroundColor: bgColor }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <div className="font-syne font-bold text-slate-900 text-2xl leading-none">{value}</div>
        <div className="text-slate-500 text-sm font-jakarta mt-1">{label}</div>
      </div>
    </div>
  );
}
