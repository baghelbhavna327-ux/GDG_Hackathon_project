import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { AnimatedCount } from './AnimatedCount';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral' | 'urgent';
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  footer?: ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBg = 'bg-teal-50',
  iconColor = 'text-teal-600',
  footer,
}) => {
  const getChangeStyle = () => {
    switch (changeType) {
      case 'increase':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'decrease':
        return 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300';
      case 'urgent':
        return 'text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300 font-bold animate-pulse';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const isNumeric = typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?%?$/.test(value.trim()));
  const isPercent = typeof value === 'string' && value.includes('%');
  const numericVal = typeof value === 'number' ? value : parseFloat(value) || 0;

  return (
    <div className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card card-hover-interactive">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isNumeric ? (
                <AnimatedCount 
                  value={numericVal} 
                  suffix={isPercent ? '%' : ''} 
                  decimals={numericVal % 1 !== 0 ? 1 : 0} 
                />
              ) : (
                value
              )}
            </h3>
            {change && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium transition-transform duration-150 group-hover:scale-105 ${getChangeStyle()}`}>
                {change}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg} ${iconColor} transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {footer && <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">{footer}</div>}
    </div>
  );
};
