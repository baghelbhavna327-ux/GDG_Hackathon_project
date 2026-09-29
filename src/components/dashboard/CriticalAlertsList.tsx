import React from 'react';
import { mockNationalCriticalAlerts } from '../../data/mockData';
import { AlertCircle, AlertTriangle, ArrowUpRight, CheckCircle2, Siren } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { useTranslation } from '../../i18n';

interface CriticalAlertsListProps {
  onResolveAlert?: (alertId: string) => void;
}

export const CriticalAlertsList: React.FC<CriticalAlertsListProps> = ({ onResolveAlert }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              {t('alerts.title')} (4)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.recentAlerts')}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1 rounded-full">
          2 {t('dashboard.criticalShortages')}
        </span>
      </div>

      <div className="space-y-3 mt-4">
        {mockNationalCriticalAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 card-hover-interactive ${
                isCritical
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/90 dark:border-rose-900/60'
                  : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-900/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {isCritical && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCritical ? 'bg-rose-600' : 'bg-amber-500'}`} />
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{alert.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{alert.timestamp}</span>
                  <StatusBadge status={alert.severity} size="sm" />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                {alert.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <strong className="text-slate-900 dark:text-slate-100">{t('common.action')}:</strong> {alert.recommendedAction}
                </span>

                <button
                  onClick={() => onResolveAlert && onResolveAlert(alert.id)}
                  className="inline-flex items-center gap-1 font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 self-end sm:self-auto shrink-0 bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition shadow-xs text-[11px] cursor-pointer"
                >
                  {t('alerts.mitigate')}
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
