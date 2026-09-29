import React from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AIAlert } from '../../types';

interface AlertBannerProps {
  alerts: AIAlert[];
  onDismiss?: (id: string) => void;
  onMitigate?: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss, onMitigate }) => {
  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'mitigating');

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {activeAlerts.slice(0, 2).map((alert) => {
        const isCritical = alert.severity === 'critical';
        const isMitigating = alert.status === 'mitigating';

        return (
          <div
            key={alert.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
              isCritical
                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
                : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isCritical ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
                }`}
              >
                {isCritical ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : alert.severity === 'warning' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{alert.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/70 dark:bg-slate-800 border border-current font-medium opacity-80 text-slate-700 dark:text-slate-300">
                    {alert.facilityName}
                  </span>
                  {isMitigating && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-800/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                      Mitigation in progress
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                  {alert.actionRecommended}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {!isMitigating && onMitigate && (
                <button
                  onClick={() => onMitigate(alert.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition shadow-sm"
                >
                  Auto-Mitigate
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
