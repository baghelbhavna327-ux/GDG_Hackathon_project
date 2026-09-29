import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  Building2, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  Info,
  Layers,
  MapPin
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { fetchDiseaseEvents, fetchDiseaseAdjustedDemand } from '../../services/aiPredictionService';
import { mockIndiaPHCs } from '../../data/indiaPhcData';

export const RegionalDiseaseIntelligencePanel: React.FC = () => {
  const { t, isHindi } = useTranslation();
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Guna');
  const [diseaseEvents, setDiseaseEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchDiseaseEvents(selectedState, selectedDistrict).then(events => {
      if (isMounted) {
        setDiseaseEvents(events);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, [selectedState, selectedDistrict]);

  // Affected PHCs in selected district
  const affectedPhcs = useMemo(() => {
    return mockIndiaPHCs.filter(
      p => p.state.toLowerCase() === selectedState.toLowerCase() &&
           p.district.toLowerCase() === selectedDistrict.toLowerCase()
    );
  }, [selectedState, selectedDistrict]);

  // Compute highest severity
  const highestImpact = useMemo(() => {
    if (diseaseEvents.some(e => e.severityLevel === 'CRITICAL')) return 'CRITICAL';
    if (diseaseEvents.some(e => e.severityLevel === 'HIGH')) return 'HIGH';
    if (diseaseEvents.some(e => e.severityLevel === 'MEDIUM')) return 'MEDIUM';
    return diseaseEvents.length > 0 ? 'LOW' : 'NORMAL';
  }, [diseaseEvents]);

  // Average or max demand impact
  const maxDemandImpact = useMemo(() => {
    if (diseaseEvents.length === 0) return 0;
    const maxMultiplier = Math.max(...diseaseEvents.map(e => e.impactFactor || 0.15));
    // Add seasonal 14% late monsoon factor
    return Math.round((maxMultiplier + 0.14) * 100);
  }, [diseaseEvents]);

  const topEvent = diseaseEvents[0];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card hover:shadow-card-hover transition duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                {t('disease.intelligenceTitle')}
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {isHindi ? 'निगरानी संकेत' : 'Surveillance Signal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('disease.intelligenceSubtitle')}
            </p>
          </div>
        </div>

        {/* Region Selectors */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              if (e.target.value === 'Jaipur') setSelectedState('Rajasthan');
              else if (e.target.value === 'Ahmedabad') setSelectedState('Gujarat');
              else setSelectedState('Madhya Pradesh');
            }}
            className="text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="Guna">Guna (MP)</option>
            <option value="Bhopal">Bhopal (MP)</option>
            <option value="Indore">Indore (MP)</option>
            <option value="Jaipur">Jaipur (RJ)</option>
            <option value="Ahmedabad">Ahmedabad (GJ)</option>
          </select>
        </div>
      </div>

      {/* Grid of 4 Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Region */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isHindi ? 'क्षेत्र' : 'Region'}</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1 truncate">
            {selectedDistrict}, {selectedState}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Central Epidemiological Zone</span>
        </div>

        {/* Active Signals */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t('disease.activeSignals')}</span>
          </div>
          <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {isLoading ? '...' : `${diseaseEvents.length} Active`}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {topEvent ? topEvent.eventType : 'No Surge'}
          </span>
        </div>

        {/* Highest Impact */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>{t('disease.highestImpact')}</span>
          </div>
          <p className={`text-sm font-extrabold mt-1 ${
            highestImpact === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' :
            highestImpact === 'HIGH' ? 'text-amber-600 dark:text-amber-400' :
            highestImpact === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {isLoading ? '...' : highestImpact}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Operational Risk</span>
        </div>

        {/* Demand Adjustment Impact */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
            <TrendingUp className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>{t('disease.demandAdjustment')}</span>
          </div>
          <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {isLoading ? '...' : `+${maxDemandImpact}%`}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {affectedPhcs.length} {t('disease.affectedPhcs')}
          </span>
        </div>
      </div>

      {/* Active Disease Event Banner */}
      {topEvent && (
        <div className="mb-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-amber-900 dark:text-amber-200">
                {topEvent.diseaseName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                {topEvent.reportingPeriod}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Source: {topEvent.source}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              {topEvent.notes || 'Seasonal transition vector increase reported across rural and peri-urban PHC clusters.'}
            </p>
          </div>

          <button
            onClick={() => navigate(`/forecast?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition shrink-0 cursor-pointer"
          >
            <span>{t('disease.viewDetails')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Non-clinical Prototype Disclaimer */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <Info className="h-3 w-3 text-slate-400 shrink-0" />
        <span>{t('disease.disclaimer')}</span>
      </div>
    </div>
  );
};
