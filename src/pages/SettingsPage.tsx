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
  RefreshCw,
  Globe
} from 'lucide-react';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useTranslation } from '../i18n';

export const SettingsPage: React.FC = () => {
  const { t, isHindi } = useTranslation();
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
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        badge="Node Config"
      />

      {isSaved && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          {isHindi 
            ? "सेटिंग्स सफलतापूर्वक अपडेट की गईं और सभी PHC ग्रिड नोड्स पर सिंक्रनाइज़ की गईं।" 
            : "Settings successfully updated and synchronized across all PHC grid nodes."}
        </div>
      )}

      {/* Language & Localization Settings */}
      <div className="rounded-xl border border-teal-200 dark:border-teal-800/80 bg-gradient-to-r from-teal-50/50 to-white dark:from-teal-950/30 dark:to-slate-900 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-teal-100 dark:border-teal-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('settings.languageSettings')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.languageHint')}</p>
            </div>
          </div>
          <div className="shrink-0">
            <LanguageSelector variant="dropdown" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Telemetry & EHR Synchronization */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isHindi ? "वितरित EHR एवं टेलीमेट्री सिंक" : "Distributed EHR & Telemetry Sync"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isHindi ? "भाग लेने वाले अस्पतालों में टेलीमेट्री अपडेट की आवृत्ति" : "Frequency of telemetry updates across participating hospitals"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isHindi ? "टेलीमेट्री पोलिंग अंतराल" : "Telemetry Polling Interval"}
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="15" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? "प्रत्येक 15 सेकंड (अल्ट्रा रियल-टाइम)" : "Every 15 Seconds (Ultra Real-Time)"}</option>
                <option value="30" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? "प्रत्येक 30 सेकंड (अनुशंसित)" : "Every 30 Seconds (Recommended)"}</option>
                <option value="60" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? "प्रत्येक 60 सेकंड" : "Every 60 Seconds"}</option>
                <option value="300" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? "प्रत्येक 5 मिनट (कम बैंडविड्थ)" : "Every 5 Minutes (Low Bandwidth)"}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isHindi ? "FHIR एवं HL7 डेटा स्ट्रीम प्रोटोकॉल" : "FHIR & HL7 Data Stream Protocol"}
              </label>
              <input
                type="text"
                disabled
                value="HL7 v2.8 / FHIR R4 Fast Interoperability Standard"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI & Neural Surge Engine Rules */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isHindi ? "AI सर्ज इंजन एवं स्वायत्त अलर्ट" : "AI Surge Engine & Autonomous Alerts"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isHindi ? "स्वचालित आपातकालीन अलर्ट और पुनर्संतुलन के लिए थ्रेशोल्ड ट्रिगर" : "Threshold triggers for automated emergency alerts and rebalancing"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isHindi ? `ICU सर्ज अलार्म ट्रिगर (${icuThreshold}%)` : `ICU Surge Alarm Trigger (${icuThreshold}%)`}
              </label>
              <input
                type="range"
                min="60"
                max="98"
                value={icuThreshold}
                onChange={(e) => setIcuThreshold(e.target.value)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? `ICU > ${icuThreshold}% होने पर अलर्ट ट्रिगर करें` : `Trigger alert when ICU > ${icuThreshold}%`}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isHindi ? `ऑक्सीजन बफ़र अलार्म (${oxygenThreshold}%)` : `Oxygen Buffer Alarm (${oxygenThreshold}%)`}
              </label>
              <input
                type="range"
                min="20"
                max="60"
                value={oxygenThreshold}
                onChange={(e) => setOxygenThreshold(e.target.value)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? `O2 < ${oxygenThreshold}% होने पर अलर्ट ट्रिगर करें` : `Trigger alert when O2 < ${oxygenThreshold}%`}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isHindi ? "न्यूरल विसंगति संवेदनशीलता" : "Neural Anomaly Sensitivity"}
              </label>
              <select
                value={aiSensitivity}
                onChange={(e) => setAiSensitivity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none cursor-pointer"
              >
                <option value="Ultra-Sensitive" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? "अल्ट्रा-संवेदनशील (प्रारंभिक चेतावनी)" : "Ultra-Sensitive (Early warning)"}</option>
                <option value="High" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? "उच्च (शहरी ग्रिड हेतु अनुशंसित)" : "High (Recommended for Urban Grids)"}</option>
                <option value="Balanced" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? "संतुलित" : "Balanced"}</option>
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
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {isHindi 
                  ? "गंभीर उछाल के दौरान AI को स्वचालित रूप से एम्बुलेंस डायवर्जन मार्ग सुझाने की अनुमति दें" 
                  : "Allow AI to automatically suggest ambulance diversion routes during Defcon 2 surge"}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlertsEnabled}
                onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {isHindi 
                  ? "गंभीर कमी पर ऑन-ड्यूटी मुख्य चिकित्सा अधिकारियों को एसएमएस व पेजर अलर्ट प्रसारित करें" 
                  : "Broadcast SMS & Pager alerts to on-duty Chief Medical Officers upon critical depletion"}
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};
