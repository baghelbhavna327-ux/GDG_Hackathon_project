import React from 'react';
import { FacilityStatus, SeverityLevel, TransferStatus, PriorityLevel } from '../../types';

interface StatusBadgeProps {
  status: FacilityStatus | SeverityLevel | TransferStatus | PriorityLevel | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'optimal':
      case 'delivered':
      case 'low':
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
      case 'moderate':
      case 'in_transit':
      case 'mitigating':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
      case 'warning':
      case 'high':
      case 'pending_approval':
      case 'scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
      case 'critical':
      case 'surge':
      case 'emergency':
      case 'active':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20 animate-pulse';
      case 'info':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-600/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-sm font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} ${getBadgeStyle()}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatText(status)}
    </span>
  );
};
