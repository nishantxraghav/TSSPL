import React from 'react';
import { CaseStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<CaseStatus, { label: string; bg: string; text: string; dot: string }> = {
  WIP: { label: 'WIP', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  Clear: { label: 'Clear', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  MinorIssue: { label: 'Minor Issue', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  MajorIssue: { label: 'Major Issue', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  Interim: { label: 'Interim', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
};

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-jakarta font-medium',
      config.bg, config.text, className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export { statusConfig };
