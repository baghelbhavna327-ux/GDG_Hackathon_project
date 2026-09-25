import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { 
  Settings, 
  BellRing, 
  BrainCircuit, 
  Database, 
  ShieldCheck, 
  Sliders, 
  Save, 
  Check,
  Server,
  RefreshCw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [syncInterval, setSyncInterval] = useState('30');
  const [icuThreshold, setIcuThreshold] = useState('85');
  const [oxygenThreshold, setOxygenThreshold] = useState('40');
  const [aiSensitivity, setAiSensitivity] = useState('High');
  const [autoDivertEnabled, setAutoDivertEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="System & Platform Settings"
        subtitle="Telemetry frequency, neural alert thresholds, and automated dispatch protocols"
        badge="Node Config"
      />

      {isSaved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          Settings successfully updated and synchronized across all PHC grid nodes.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Telemetry & EHR Synchronization */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distributed EHR & Telemetry Sync</h3>
              <p className="text-xs text-slate-500">Frequency of telemetry updates across participating hospitals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Telemetry Polling Interval
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="15">Every 15 Seconds (Ultra Real-Time)</option>
                <option value="30">Every 30 Seconds (Recommended)</option>
                <option value="60">Every 60 Seconds</option>
                <option value="300">Every 5 Minutes (Low Bandwidth)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                FHIR & HL7 Data Stream Protocol
              </label>
              <input
                type="text"
                disabled
                value="HL7 v2.8 / FHIR R4 Fast Interoperability Standard"
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI & Neural Surge Engine Rules */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Surge Engine & Autonomous Alerts</h3>
              <p className="text-xs text-slate-500">Threshold triggers for automated emergency alerts and rebalancing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                ICU Surge Alarm Trigger ({icuThreshold}%)
              </label>
              <input
                type="range"
                min="60"
                max="98"
                value={icuThreshold}
                onChange={(e) => setIcuThreshold(e.target.value)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">Trigger alert when ICU &gt; {icuThreshold}%</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Oxygen Buffer Alarm ({oxygenThreshold}%)
              </label>
              <input
                type="range"
                min="20"
                max="60"
                value={oxygenThreshold}
                onChange={(e) => setOxygenThreshold(e.target.value)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">Trigger alert when O2 &lt; {oxygenThreshold}%</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Neural Anomaly Sensitivity
              </label>
              <select
                value={aiSensitivity}
                onChange={(e) => setAiSensitivity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
              >
                <option value="Ultra-Sensitive">Ultra-Sensitive (Early warning)</option>
                <option value="High">High (Recommended for Urban Grids)</option>
                <option value="Balanced">Balanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDivertEnabled}
                onChange={(e) => setAutoDivertEnabled(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-slate-800 font-medium">
                Allow AI to automatically suggest ambulance diversion routes during Defcon 2 surge
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlertsEnabled}
                onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-slate-800 font-medium">
                Broadcast SMS & Pager alerts to on-duty Chief Medical Officers upon critical depletion
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <Save className="h-4 w-4" />
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
