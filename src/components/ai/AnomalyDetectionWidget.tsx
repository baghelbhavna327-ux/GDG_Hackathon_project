import React, { useState, useEffect } from 'react';
import { 
  fetchActiveAnomalies, 
  AnomalyRecord 
} from '../../services/aiAdvancedService';
import { 
  AlertOctagon, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Loader2, 
  Building2, 
  Pill, 
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const AnomalyDetectionWidget: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnomalies = async () => {
    setIsLoading(true);
    try {
      const list = await fetchActiveAnomalies();
      setAnomalies(list);
    } catch (err) {
      console.warn('Anomaly detection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-xs">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Operational Anomaly Detection
              </h3>
              <span className="text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                Isolation Forest
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unusual spikes in medicine consumption burn, OPD patient footfall shocks & stock drain
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAnomalies}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-xs flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
          <span>Evaluating multi-variate operational distributions...</span>
        </div>
      ) : anomalies.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>All monitored facilities are operating within normal expected statistical distributions.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anomalies.map((anom, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border space-y-2 text-xs transition ${
                anom.severity === 'CRITICAL'
                  ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80'
                  : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-rose-700 dark:text-rose-400" />
                  <strong className="text-slate-900 dark:text-slate-100">{anom.phc}</strong>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    anom.severity === 'CRITICAL'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {anom.severity} ANOMALY
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                <Pill className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>Formulary: <strong>{anom.medicine}</strong></span>
                <span>• Score: {anom.anomaly_score}</span>
              </div>

              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {anom.reason}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500">
                <span>Burn Velocity: +{((anom.metric_deviations.consumption_ratio - 1) * 100).toFixed(0)}%</span>
                <span>Footfall Jump: +{((anom.metric_deviations.footfall_ratio - 1) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
