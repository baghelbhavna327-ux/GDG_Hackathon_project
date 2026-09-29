import React, { useState, useEffect } from 'react';
import { 
  fetchDriftMonitoring, 
  updateContinuousLearning, 
  DriftMonitorData, 
  ContinuousLearningData 
} from '../../services/aiAdvancedService';
import { 
  Activity, 
  Cpu, 
  TrendingUp, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const ModelDriftContinuousLearningWidget: React.FC = () => {
  const [driftData, setDriftData] = useState<DriftMonitorData | null>(null);
  const [continuousData, setContinuousData] = useState<ContinuousLearningData | null>(null);
  const [isLoadingDrift, setIsLoadingDrift] = useState(false);
  const [isUpdatingContinuous, setIsUpdatingContinuous] = useState(false);

  const loadDrift = async () => {
    setIsLoadingDrift(true);
    try {
      const res = await fetchDriftMonitoring({ feature: 'daily_demand', method: 'PSI' });
      setDriftData(res);
    } catch (err) {
      console.warn('Drift monitoring error:', err);
    } finally {
      setIsLoadingDrift(false);
    }
  };

  const handleTriggerIncrementalUpdate = async () => {
    setIsUpdatingContinuous(true);
    try {
      const res = await updateContinuousLearning({
        patient_count: 165.0,
        previous_consumption: 42.0,
        emergency_flag: 0,
        actual_consumption: 46.5
      });
      setContinuousData(res);
    } catch (err) {
      console.warn('Continuous update error:', err);
    } finally {
      setIsUpdatingContinuous(false);
    }
  };

  useEffect(() => {
    loadDrift();
    handleTriggerIncrementalUpdate();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Drift Monitoring Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                Data Drift Surveillance
              </h4>
              <p className="text-[11px] text-slate-500">Population Stability Index (PSI) & KS-Test</p>
            </div>
          </div>

          <button
            onClick={loadDrift}
            disabled={isLoadingDrift}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-xs flex items-center gap-1 cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoadingDrift ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {driftData ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monitored Feature</span>
                <strong className="text-slate-900 dark:text-slate-100">{driftData.feature}</strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">PSI Score</span>
                <strong className={`text-base ${driftData.drift_detected ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {driftData.score} (Threshold: {driftData.threshold})
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              {driftData.summary}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Baseline Mean: {driftData.baseline_mean}</span>
              <span>Current Sample Mean: {driftData.current_mean}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-500">Loading drift analysis...</div>
        )}
      </div>

      {/* 2. Continuous Learning Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                Continuous Learning Prototype
              </h4>
              <p className="text-[11px] text-slate-500">Streaming Online SGD Regressor</p>
            </div>
          </div>

          <button
            onClick={handleTriggerIncrementalUpdate}
            disabled={isUpdatingContinuous}
            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
          >
            {isUpdatingContinuous ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Stream Feed
          </button>
        </div>

        {continuousData ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Model Version</span>
                <strong className="text-purple-950 dark:text-purple-100">{continuousData.model_version}</strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Observations Seen</span>
                <strong className="text-purple-950 dark:text-purple-100 text-base">{continuousData.observations_seen}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Observation fed: Actual consumption {continuousData.observation_feedback.actual_consumption} units (Loss Delta: -{continuousData.observation_feedback.loss_reduction}).
            </p>

            <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
              * {continuousData.production_safety_note}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-500">Streaming online model active...</div>
        )}
      </div>
    </div>
  );
};
