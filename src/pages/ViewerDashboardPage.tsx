import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Bed,
  AlertTriangle,
  Eye,
  Lock,
  Network,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { MedicineDemandChart } from '../components/charts/MedicineDemandChart';
import { PatientFootfallChart } from '../components/charts/PatientFootfallChart';
import { Hospital, AIAlert, ResourceTransfer, DemandForecastPoint } from '../types';
import { useTranslation } from '../i18n';
import { TypewriterText } from '../components/common/TypewriterText';

interface ViewerDashboardPageProps {
  hospitals: Hospital[];
  alerts: AIAlert[];
  forecastData: DemandForecastPoint[];
  transfers: ResourceTransfer[];
}

export const ViewerDashboardPage: React.FC<ViewerDashboardPageProps> = ({
  hospitals,
  alerts,
  transfers,
}) => {
  const { t, isHindi } = useTranslation();
  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const occupiedBeds = hospitals.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Viewer Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-700 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-600 flex items-center gap-1.5 shadow-glow-teal">
              <Eye className="h-3.5 w-3.5 text-teal-400" />
              {t('common.role.viewer')} • Read-Only
            </span>
            <span className="text-[11px] font-mono text-teal-400/80 hidden md:inline">
              <TypewriterText
                phrases={
                  isHindi
                    ? ["निरीक्षण एवं सार्वजनिक रिपोर्टिंग", "सक्रिय टेलीमेट्री दृश्य"]
                    : ["Surveillance & Public Reporting", "Active Telemetry View"]
                }
                typingSpeed={40}
                pauseTime={3500}
              />
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {t('page.viewerDashboard.title')}
          </h2>
          <p className="text-xs text-slate-300">
            {t('page.viewerDashboard.subtitle')}
          </p>
        </div>

        {/* Read-Only Status Indicator */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
          <Lock className="h-4 w-4 text-amber-400" />
          <span>{isHindi ? 'केवल पढ़ने की अनुमति (Observer Mode)' : 'Operational Actions Restricted (Observer Mode)'}</span>
        </div>
      </div>

      {/* Aggregated National KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.activePhcs')}
          value={hospitals.length.toString()}
          subtitle="3 Participating States"
          icon={Building2}
          change="100% Operational"
          changeType="increase"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title={t('dashboard.totalBeds')}
          value={`${occupiedBeds} / ${totalBeds}`}
          subtitle={`${Math.round((occupiedBeds / (totalBeds || 1)) * 100)}% Capacity`}
          icon={Bed}
          change="Stable Flow"
          changeType="increase"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('dashboard.activeSystemAlerts')}
          value={activeAlertsCount.toString()}
          subtitle="Supply & Capacity Warnings"
          icon={AlertTriangle}
          change="Under Management"
          changeType="urgent"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title={t('federated.title')}
          value="v2.4 Aggregated"
          subtitle="94.2% Accuracy"
          icon={Network}
          change="FedAvg Active"
          changeType="increase"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts & Analytical Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicineDemandChart />
        <PatientFootfallChart />
      </div>

      {/* State-by-State Overview & Redistribution Summary Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* State Capacity Summary */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span>{t('dashboard.supplyChainOverview')}</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Live Telemetry</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Madhya Pradesh</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">8 PHCs • 186 Beds • 92% Essential Stock</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                {t('common.optimal')}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Rajasthan</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">6 PHCs • 140 Beds • 88% Essential Stock</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
                {t('common.medium')}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Gujarat</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">6 PHCs • 130 Beds • 95% Essential Stock</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                {t('common.optimal')}
              </span>
            </div>
          </div>
        </div>

        {/* Redistribution & Logistics Overview */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span>{t('redistribution.title')}</span>
            <NavLink to="/redistribution" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1">
              <span>{t('common.viewAll')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </NavLink>
          </h3>

          <div className="space-y-2.5 text-xs">
            {transfers.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{item.resourceName} ({item.quantity} {item.unit})</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.originFacilityName} → {item.destinationFacilityName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  item.status === 'delivered' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' :
                  item.status === 'scheduled' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
