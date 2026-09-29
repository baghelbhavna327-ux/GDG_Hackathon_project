import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Truck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Pill, 
  Building2, 
  PackagePlus, 
  TrendingDown, 
  Layers, 
  ChevronRight, 
  Send 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { RequestSupplyModal, RequestSupplyContext } from '../clinician/RequestSupplyModal';
import { InventoryRiskLevel } from '../../types';
import { useTranslation } from '../../i18n';
import { Card3D } from '../common/Card3D';
import { AnimatedCount } from '../common/AnimatedCount';

export interface HeroAiRiskData {
  phcId: string;
  phcName: string;
  district: string;
  state: string;
  medicine: string;
  currentStock: number;
  unit: string;
  predicted7DayDemand: number;
  predictedDailyDemand?: number;
  daysRemaining: number;
  shortageQuantity: number;
  stockOutRisk: InventoryRiskLevel;
  reason: string;
  sourceDepot?: string;
  sourceDepotAvailable?: number;
  transitEta?: string;
  confidenceScore?: number;
}

interface HeroAiActionCardProps {
  data?: HeroAiRiskData;
  onInitiateRedistribution?: (data: HeroAiRiskData) => void;
  onSupplyRequestSubmitted?: () => void;
}

const defaultHeroData: HeroAiRiskData = {
  phcId: 'phc-04',
  phcName: 'Guna PHC-04',
  district: 'Guna',
  state: 'Madhya Pradesh',
  medicine: 'Paracetamol 500mg',
  currentStock: 120,
  unit: 'Units',
  predicted7DayDemand: 736.4,
  predictedDailyDemand: 105.2,
  daysRemaining: 1.1,
  shortageQuantity: 616.4,
  stockOutRisk: 'CRITICAL',
  reason: 'Severe acute fever surge and respiratory footfall (+68%) project stock depletion to 0 within 26 hours.',
  sourceDepot: 'PHC-B (Central Medical Depot)',
  sourceDepotAvailable: 850,
  transitEta: '2.4 Hours',
  confidenceScore: 94.2
};

export const HeroAiActionCard: React.FC<HeroAiActionCardProps> = ({
  data = defaultHeroData,
  onInitiateRedistribution,
  onSupplyRequestSubmitted
}) => {
  const { t, isHindi } = useTranslation();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);

  const isCritical = data.stockOutRisk === 'CRITICAL';
  const supplyContext: RequestSupplyContext = {
    phcId: data.phcId,
    phcName: data.phcName,
    district: data.district,
    state: data.state,
    medicine: data.medicine,
    currentStock: data.currentStock,
    unit: data.unit,
    predictedDailyDemand: data.predictedDailyDemand || Math.round(data.predicted7DayDemand / 7),
    predicted7DayDemand: data.predicted7DayDemand,
    daysRemaining: data.daysRemaining,
    shortageQuantity: data.shortageQuantity,
    stockOutRisk: data.stockOutRisk,
    reason: data.reason
  };

  const localizedReason = isHindi && data.reason.includes('Outbreak surge')
    ? `तीव्र बुखार और ओपीडी फुटफॉल (+68%) के कारण ${data.phcName} में 26 घंटों के भीतर स्टॉक 0 होने का अनुमान है।`
    : data.reason;

  return (
    <>
      <Card3D maxTilt={2.5} glare={true} className="rounded-2xl">
        <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-xl ${
          isCritical 
            ? 'border-rose-500/80 bg-gradient-to-br from-slate-950 via-rose-950/70 to-slate-900 text-white animate-critical-pulse' 
            : 'border-teal-500/80 bg-gradient-to-br from-slate-950 via-teal-950/70 to-slate-900 text-white animate-pulse-subtle'
        } p-4 sm:p-5`}>
          {/* Glow effect */}
          <div className={`absolute -right-10 -bottom-10 h-56 w-56 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity duration-300 ${
            isCritical ? 'bg-rose-500' : 'bg-teal-500'
          }`} />

          <div className="relative z-10 space-y-4">
            {/* Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                  isCritical ? 'bg-rose-600 text-white' : 'bg-teal-500 text-slate-950'
                }`}>
                  <ShieldAlert className="h-4 w-4" />
                </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-300 dark:text-rose-300 block">
                  {isCritical ? t('hero.criticalRisk') : t('hero.highRisk')}
                </span>
                <span className="text-xs text-slate-300 font-medium">FastAPI XGBoost Demand Telemetry</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                isCritical
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-400 text-slate-950'
              }`}>
                {isCritical ? t('common.critical') : t('common.high')} {t('common.priority')}
              </span>
              {data.confidenceScore && (
                <span className="text-[10px] font-bold bg-white/10 text-slate-200 px-2 py-0.5 rounded-full border border-white/20">
                  {data.confidenceScore}% {t('hero.confidence')}
                </span>
              )}
            </div>
          </div>

          {/* Target Facility & Medicine Banner */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-teal-400" />
                <span className="font-bold text-white text-sm">{data.phcName}</span>
                <span className="text-slate-400">({data.district}, {data.state})</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mt-1 flex items-center gap-1.5 truncate">
                <Pill className="h-4 w-4 text-teal-400 shrink-0" />
                {data.medicine}
              </h3>
            </div>
          </div>

          {/* 5 Real Metric Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 transition-transform hover:scale-105">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                {t('hero.currentStock')}
              </span>
              <span className="text-base font-extrabold text-white">
                <AnimatedCount value={data.currentStock} suffix={` ${data.unit}`} />
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 transition-transform hover:scale-105">
              <span className="text-[10px] text-teal-300 font-medium uppercase tracking-wider block">
                {t('hero.predicted7DayDemand')}
              </span>
              <span className="text-base font-extrabold text-teal-300">
                <AnimatedCount value={data.predicted7DayDemand} decimals={1} suffix={` ${data.unit}`} />
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 transition-transform hover:scale-105">
              <span className="text-[10px] text-amber-300 font-medium uppercase tracking-wider block">
                {t('hero.daysRemaining')}
              </span>
              <span className="text-base font-extrabold text-amber-300">
                <AnimatedCount value={data.daysRemaining} decimals={1} suffix={` ${t('common.units') === 'Units' ? 'Days' : 'दिन'}`} />
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/30 col-span-2 sm:col-span-3 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                  {t('hero.shortageQuantity')}
                </span>
                <span className="text-sm font-extrabold text-rose-400">
                  <AnimatedCount value={data.shortageQuantity} decimals={1} suffix={` ${data.unit}`} />
                </span>
              </div>
            </div>
          </div>

          {/* AI Clinical & Logistical Reason */}
          <div className="text-xs text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wide block mb-0.5">
              {t('hero.aiExplanation')}
            </span>
            <p className="line-clamp-2 text-slate-300 text-xs">
              {localizedReason}
            </p>
          </div>

          {/* Action Hub Footer */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-extrabold uppercase tracking-wider text-teal-300">
                {t('hero.recommendedAction')}
              </span>
              {data.transitEta && (
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Clock className="h-3 w-3 text-teal-400" />
                  {t('redistribution.eta')}: {data.transitEta}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5 text-teal-300" />
                <span>{t('common.viewDetails')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSupplyModalOpen(true)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold shadow-lg transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isCritical
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white'
                    : 'bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950'
                }`}
              >
                <PackagePlus className="h-3.5 w-3.5" />
                <span>{t('dashboard.requestMedicineSupply')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card3D>

      {/* Details & Telemetry Inspection Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`AI Risk Telemetry • ${data.medicine}`}
        subtitle={`Detailed demand projection and recommended load balancing for ${data.phcName}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{t('common.facility')}</span>
              <strong className="text-slate-900 dark:text-slate-100 text-sm">{data.phcName}</strong>
              <p className="text-[11px] text-slate-500">{data.district}, {data.state}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{t('hero.daysRemaining')}</span>
              <strong className="text-rose-600 dark:text-rose-400 text-sm">{data.daysRemaining} {t('hero.daysRemaining')}</strong>
              <p className="text-[11px] text-slate-500">{t('hero.shortageQuantity')}: {data.shortageQuantity} {data.unit}</p>
            </div>
          </div>

          {data.sourceDepot && (
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5">
              <div className="flex items-center justify-between text-teal-950 dark:text-teal-200 font-bold">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {t('hero.sourceDepot')}
                </span>
                <span className="text-[10px] bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100 px-2 py-0.5 rounded">
                  {t('hero.availableAtDepot')}: {data.sourceDepotAvailable} {data.unit}
                </span>
              </div>
              <p className="text-teal-800 dark:text-teal-300 text-xs">
                {data.sourceDepot} - {data.shortageQuantity} {data.unit} ({data.transitEta || '2.5 hours'}).
              </p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100">{t('hero.aiExplanation')}:</span>
            <p>{localizedReason}</p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
            >
              {t('common.close')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDetailsModalOpen(false);
                setIsSupplyModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PackagePlus className="h-4 w-4" />
              <span>{t('supplyRequest.requestSupply')}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Embedded Pre-filled Supply Request Modal */}
      <RequestSupplyModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
        context={supplyContext}
        onSuccess={() => {
          if (onSupplyRequestSubmitted) {
            onSupplyRequestSubmitted();
          }
        }}
      />
    </>
  );
};
