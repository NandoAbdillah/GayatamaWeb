import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export type StatusType =
  | 'open'
  | 'draft'
  | 'pending'
  | 'submitted'
  | 'in_progress'
  | 'approved'
  | 'verified'
  | 'revision'
  | 'rejected'
  | 'converted_to_pos';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className,
  showIcon = true,
}) => {
  const normalizedStatus = (status || '').toLowerCase() as StatusType;

  const configMap: Record<
    string,
    {
      bg: string;
      text: string;
      dot: string;
      pulse?: boolean;
      defaultLabel: string;
      Icon: React.ElementType;
    }
  > = {
    open: {
      bg: 'bg-blue-50 border-blue-200/80',
      text: 'text-blue-700',
      dot: 'bg-primary-500',
      defaultLabel: 'Terbuka',
      Icon: Clock,
    },
    draft: {
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      defaultLabel: 'Draf',
      Icon: Clock,
    },
    pending: {
      bg: 'bg-amber-50 border-amber-200/80',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      pulse: true,
      defaultLabel: 'Menunggu Verifikasi',
      Icon: Clock,
    },
    submitted: {
      bg: 'bg-amber-50 border-amber-200/80',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      pulse: true,
      defaultLabel: 'Diajukan ke DPL',
      Icon: Clock,
    },
    in_progress: {
      bg: 'bg-indigo-50 border-indigo-200/80',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
      pulse: true,
      defaultLabel: 'Sedang Berjalan',
      Icon: RefreshCw,
    },
    approved: {
      bg: 'bg-emerald-50 border-emerald-200/80',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      defaultLabel: 'Disetujui DPL',
      Icon: CheckCircle2,
    },
    verified: {
      bg: 'bg-teal-50 border-teal-200/80',
      text: 'text-teal-800',
      dot: 'bg-teal-500',
      defaultLabel: 'Terverifikasi',
      Icon: CheckCircle2,
    },
    revision: {
      bg: 'bg-orange-50 border-orange-200/80',
      text: 'text-orange-800',
      dot: 'bg-orange-500',
      pulse: true,
      defaultLabel: 'Perlu Revisi',
      Icon: AlertCircle,
    },
    rejected: {
      bg: 'bg-rose-50 border-rose-200/80',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
      defaultLabel: 'Ditolak',
      Icon: XCircle,
    },
    converted_to_pos: {
      bg: 'bg-purple-50 border-purple-200/80',
      text: 'text-purple-800',
      dot: 'bg-purple-500',
      defaultLabel: 'Dijadikan Pos Kebutuhan',
      Icon: CheckCircle2,
    },
  };

  const current = configMap[normalizedStatus] || {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
    defaultLabel: label || status,
    Icon: Clock,
  };

  const displayLabel = label || current.defaultLabel;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-4 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-sm select-none',
        current.bg,
        current.text,
        sizeClasses[size],
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {current.pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              current.dot
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', current.dot)} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
};
