import React from 'react';
import { AIAlert } from '../../types';
import { Sparkles, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface AIInsightsWidgetProps {
  alerts: AIAlert[];
  onAction?: (alert: AIAlert) => void;
}

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ alerts, onAction }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50/30 p-5 shadow-card">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">HealthChain Neural Advisory</h3>
            <p className="text-xs text-slate-500">Autonomous allocation & outbreak mitigation engine</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-full border border-teal-200">
          Autonomous AI Active
        </span>
      </div>

      <div className="space-y-3.5 mt-4">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-subtle hover:border-teal-300 transition"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={alert.severity} />
                <span className="text-xs font-semibold text-slate-900">{alert.title}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {alert.confidenceScore}% conf
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {alert.message}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="font-semibold text-slate-700">Target Facility:</span>
                <span>{alert.facilityName}</span>
              </div>
              {onAction && alert.status !== 'resolved' && (
                <button
                  onClick={() => onAction(alert)}
                  className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 self-start sm:self-auto"
                >
                  Execute AI Recommendation
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
