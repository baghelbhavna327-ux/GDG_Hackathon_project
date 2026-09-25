import React from 'react';
import { mockNationalCriticalAlerts } from '../../data/mockData';
import { AlertCircle, AlertTriangle, ArrowUpRight, CheckCircle2, Siren } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface CriticalAlertsListProps {
  onResolveAlert?: (alertId: string) => void;
}

export const CriticalAlertsList: React.FC<CriticalAlertsListProps> = ({ onResolveAlert }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Critical Healthcare Alerts (4)</h3>
            <p className="text-xs text-slate-500">Live district anomaly detection & immediate triage protocols</p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
          2 Urgent Shortages
        </span>
      </div>

      <div className="space-y-3 mt-4">
        {mockNationalCriticalAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all hover:shadow-subtle ${
                isCritical
                  ? 'bg-rose-50/60 border-rose-200/90'
                  : 'bg-amber-50/60 border-amber-200/90'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isCritical ? 'bg-rose-600 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{alert.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">{alert.timestamp}</span>
                  <StatusBadge status={alert.severity} size="sm" />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                {alert.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-[11px] text-slate-700 font-medium">
                  <strong className="text-slate-900">Protocol:</strong> {alert.recommendedAction}
                </span>

                <button
                  onClick={() => onResolveAlert && onResolveAlert(alert.id)}
                  className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800 self-end sm:self-auto shrink-0 bg-white px-2.5 py-1 rounded border border-slate-200 hover:border-teal-300 transition shadow-xs text-[11px]"
                >
                  Initiate Action
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
