import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

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
        return 'text-emerald-700 bg-emerald-50';
      case 'decrease':
        return 'text-rose-700 bg-rose-50';
      case 'urgent':
        return 'text-rose-700 bg-rose-100 font-bold animate-pulse';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
            {change && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${getChangeStyle()}`}>
                {change}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {footer && <div className="mt-4 border-t border-slate-100 pt-3">{footer}</div>}
    </div>
  );
};
