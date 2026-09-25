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
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isCritical ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
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
                  <span className="font-semibold text-sm">{alert.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/70 border border-current font-medium opacity-80">
                    {alert.facilityName}
                  </span>
                  {isMitigating && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                      Mitigation in progress
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 text-slate-700 leading-relaxed max-w-4xl">
                  {alert.actionRecommended}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {!isMitigating && onMitigate && (
                <button
                  onClick={() => onMitigate(alert.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm"
                >
                  Auto-Mitigate
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
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
