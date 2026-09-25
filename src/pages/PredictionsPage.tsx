import React from 'react';
import { AIAlert, DemandForecastPoint } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { DemandForecastChart } from '../components/charts/DemandForecastChart';
import { StatusBadge } from '../components/common/StatusBadge';
import { Sparkles, BrainCircuit, Activity, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface PredictionsPageProps {
  alerts: AIAlert[];
  forecastData: DemandForecastPoint[];
  onDismissAlert: (id: string) => void;
  onMitigateAlert: (id: string) => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({
  alerts,
  forecastData,
  onDismissAlert,
  onMitigateAlert,
}) => {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Predictive AI & Outbreak Surveillance"
        subtitle="Machine learning anomaly detection, epidemiological surge early-warning, and autonomous mitigation"
        badge="Neural Grid Active"
      />

      {/* Demand Forecast Chart */}
      <DemandForecastChart data={forecastData} />

      {/* AI Anomaly Advisory Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Active AI Neural Anomaly Advisories</h3>
          </div>
          <span className="text-xs text-slate-500">
            Updated every 60 seconds from distributed EHR & triage feeds
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.severity} />
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Confidence: {alert.confidenceScore}%
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{alert.timestamp}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">{alert.title}</h4>
                <p className="text-xs font-semibold text-teal-700 mb-2">{alert.facilityName}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Recommended Action Protocol:</span>
                  <p className="text-slate-600 leading-normal">{alert.actionRecommended}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      alert.status === 'resolved'
                        ? 'bg-emerald-500'
                        : alert.status === 'mitigating'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-rose-500'
                    }`}
                  />
                  Status: {alert.status.toUpperCase()}
                </span>
                <div className="flex gap-2">
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => onMitigateAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition shadow-sm"
                    >
                      Execute Mitigation
                    </button>
                  )}
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
