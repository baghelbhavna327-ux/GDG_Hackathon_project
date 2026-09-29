import React from 'react';
import { 
  Building2, 
  Pill, 
  AlertTriangle, 
  PackagePlus, 
  Truck, 
  Siren,
  Activity,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { AnimatedCount } from '../common/AnimatedCount';

interface SystemImpactSummaryProps {
  phcsCount: number;
  medicinesCount: number;
  activeAlertsCount: number;
  supplyRequestsCount: number;
  redistributionsCount: number;
  activeEmergenciesCount: number;
  title?: string;
  subtitle?: string;
}

export const SystemImpactSummary: React.FC<SystemImpactSummaryProps> = ({
  phcsCount,
  medicinesCount,
  activeAlertsCount,
  supplyRequestsCount,
  redistributionsCount,
  activeEmergenciesCount,
  title,
  subtitle
}) => {
  const { t, isHindi } = useTranslation();

  const displayTitle = title || t('impact.title');
  const displaySubtitle = subtitle || t('impact.subtitle');

  const metrics = [
    {
      id: 'phcs',
      label: t('dashboard.activePhcs'),
      value: phcsCount.toString(),
      subtext: isHindi ? '100% सक्रिय' : '100% Operational',
      icon: Building2,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/60'
    },
    {
      id: 'medicines',
      label: t('inventory.totalSkus'),
      value: medicinesCount.toString(),
      subtext: isHindi ? 'आवश्यक दवा सूची' : 'Essential Formulary',
      icon: Pill,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60'
    },
    {
      id: 'alerts',
      label: t('dashboard.activeAlerts'),
      value: activeAlertsCount.toString(),
      subtext: activeAlertsCount > 0 ? (isHindi ? 'निगरानी सक्रिय' : 'Surveillance Active') : (isHindi ? 'सामान्य' : 'Nominal'),
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60'
    },
    {
      id: 'requests',
      label: t('dashboard.pendingRequests'),
      value: supplyRequestsCount.toString(),
      subtext: isHindi ? 'चिकित्सक कतार' : 'Clinician Queue',
      icon: PackagePlus,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60'
    },
    {
      id: 'redistributed',
      label: t('dashboard.totalTransfers'),
      value: redistributionsCount.toString(),
      subtext: isHindi ? 'प्रेषित ट्रांसफर' : 'Transfers Dispatched',
      icon: Truck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'emergencies',
      label: t('emergency.activeAlerts'),
      value: activeEmergenciesCount.toString(),
      subtext: activeEmergenciesCount > 0 ? (isHindi ? 'आपातकालीन प्रोटोकॉल' : 'Surge Protocols Active') : (isHindi ? '0 प्रकोप' : '0 Outbreaks'),
      icon: Siren,
      color: activeEmergenciesCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400',
      bg: activeEmergenciesCount > 0 ? 'bg-rose-50 dark:bg-rose-950/60' : 'bg-slate-100 dark:bg-slate-800'
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 self-start sm:self-auto flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified Live Metrics
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const numVal = parseInt(metric.value, 10) || 0;
          return (
            <div
              key={metric.id}
              className="group p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${metric.bg} ${metric.color} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                  <AnimatedCount value={numVal} />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">
                  {metric.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {metric.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
