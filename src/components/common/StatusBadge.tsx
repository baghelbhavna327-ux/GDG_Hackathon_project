import React from 'react';
import { FacilityStatus, SeverityLevel, TransferStatus, PriorityLevel } from '../../types';
import { useTranslation } from '../../i18n';

interface StatusBadgeProps {
  status: FacilityStatus | SeverityLevel | TransferStatus | PriorityLevel | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const { t, isHindi } = useTranslation();

  const getBadgeStyle = () => {
    switch (status) {
      case 'optimal':
      case 'delivered':
      case 'low':
      case 'resolved':
      case 'approved':
      case 'fulfilled':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 ring-emerald-600/20';
      case 'moderate':
      case 'in_transit':
      case 'mitigating':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60 ring-blue-600/20';
      case 'warning':
      case 'high':
      case 'pending_approval':
      case 'pending':
      case 'scheduled':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 ring-amber-600/20';
      case 'critical':
      case 'surge':
      case 'emergency':
      case 'active':
      case 'rejected':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 ring-rose-600/20 animate-pulse';
      case 'info':
        return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60 ring-cyan-600/20';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 ring-slate-600/20';
    }
  };

  const formatText = (text: string) => {
    const raw = text.toLowerCase().replace(/_/g, ' ');
    if (raw === 'critical') return t('common.critical').toUpperCase();
    if (raw === 'warning') return t('common.warning').toUpperCase();
    if (raw === 'optimal') return t('common.optimal').toUpperCase();
    if (raw === 'high') return t('common.high').toUpperCase();
    if (raw === 'medium' || raw === 'moderate') return t('common.medium').toUpperCase();
    if (raw === 'low') return t('common.low').toUpperCase();
    if (raw === 'active') return t('common.active').toUpperCase();
    if (raw === 'pending' || raw === 'pending approval') return t('supplyRequest.pending').toUpperCase();
    if (raw === 'approved') return t('supplyRequest.approved').toUpperCase();
    if (raw === 'rejected') return t('supplyRequest.rejected').toUpperCase();
    if (raw === 'in transit') return t('supplyRequest.inTransit').toUpperCase();
    if (raw === 'fulfilled' || raw === 'delivered') return t('supplyRequest.fulfilled').toUpperCase();
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
