import React, { useState, useEffect } from 'react';
import { 
  fetchEmergencyPrediction, 
  FastAPIEmergencyPredictRequest, 
  FastAPIEmergencyPredictionData 
} from '../../services/aiPredictionService';
import { 
  SlidersHorizontal, 
  Siren, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  Pill, 
  Loader2, 
  AlertTriangle,
  Info,
  PackagePlus,
  ArrowRight
} from 'lucide-react';
import { RequestSupplyModal, RequestSupplyContext } from '../clinician/RequestSupplyModal';
import { InventoryRiskLevel } from '../../types';
import { useTranslation } from '../../i18n';

interface EmergencyWhatIfSimulatorProps {
  phcName: string;
  state: string;
  district: string;
  medicine: string;
  currentStock: number;
  patientCount: number;
  previousConsumption: number;
  onInitiateTransfer?: (item: string, qty: number) => void;
}

export const EmergencyWhatIfSimulator: React.FC<EmergencyWhatIfSimulatorProps> = ({
  phcName,
  state,
  district,
  medicine,
  currentStock,
  patientCount,
  previousConsumption,
  onInitiateTransfer
}) => {
  const { t, isHindi } = useTranslation();
  const [scenarioMultiplier, setScenarioMultiplier] = useState<'normal' | 'surge20' | 'surge40'>('surge20');
  const [predictionData, setPredictionData] = useState<FastAPIEmergencyPredictionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);

  // Load emergency prediction from FastAPI
  useEffect(() => {
    let isMounted = true;
    const loadPrediction = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const payload: FastAPIEmergencyPredictRequest = {
          phc: phcName,
          state,
          district,
          medicine,
          current_stock: currentStock,
          patient_count: patientCount,
          previous_consumption: previousConsumption
        };
        const data = await fetchEmergencyPrediction(payload);
        if (isMounted) {
          setPredictionData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('FastAPI Emergency predict error, calculating fallback simulation matrix:', err);
          // Fallback based on real input parameters
          const baseDaily = previousConsumption > 0 ? previousConsumption : Math.max(12, Math.round(patientCount * 0.18));
          const base7Day = Math.round(baseDaily * 7);
          const baseDays = Number((currentStock / (baseDaily || 1)).toFixed(1));
          const baseShortage = Math.max(0, base7Day - currentStock);

          const emergDaily = Math.round(baseDaily * 1.45);
          const emerg7Day = Math.round(emergDaily * 7);
          const emergDays = Number((currentStock / (emergDaily || 1)).toFixed(1));
          const emergShortage = Math.max(0, emerg7Day - currentStock);

          const fallback: FastAPIEmergencyPredictionData = {
            phc: phcName,
            state,
            district,
            medicine,
            current_stock: currentStock,
            normal: {
              predicted_daily_demand: baseDaily,
              predicted_7_day_demand: base7Day,
              days_remaining: baseDays,
              stock_out_risk: baseDays < 2 ? 'CRITICAL' : baseDays < 5 ? 'HIGH' : 'NORMAL',
              shortage_quantity: baseShortage
            },
            emergency: {
              predicted_daily_demand: emergDaily,
              predicted_7_day_demand: emerg7Day,
              days_remaining: emergDays,
              stock_out_risk: emergDays < 2 ? 'CRITICAL' : emergDays < 4 ? 'HIGH' : 'WARNING',
              shortage_quantity: emergShortage
            },
            demand_increase_percentage: 45.0,
            emergency_7_day_demand: emerg7Day,
            shortage_quantity: emergShortage,
            stock_out_risk: emergDays < 2 ? 'CRITICAL' : 'HIGH',
            reason: `Outbreak surge modeling projects acute consumption spike. Stock will deplete in ${emergDays} days without expedited rebalance.`
          };
          setPredictionData(fallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPrediction();
    return () => {
      isMounted = false;
    };
  }, [phcName, state, district, medicine, currentStock, patientCount, previousConsumption]);

  // Compute Active Emergency Scenario Numbers based on user selection
  const normalMetrics = predictionData?.normal || {
    predicted_daily_demand: Math.round(patientCount * 0.18),
    predicted_7_day_demand: Math.round(patientCount * 0.18 * 7),
    days_remaining: Number((currentStock / (Math.max(1, patientCount * 0.18))).toFixed(1)),
    stock_out_risk: 'HIGH',
    shortage_quantity: Math.max(0, Math.round(patientCount * 0.18 * 7) - currentStock)
  };

  const surgeMultiplierFactor = scenarioMultiplier === 'normal' ? 1.0 : scenarioMultiplier === 'surge20' ? 1.20 : 1.40;

  const simulatedEmergencyMetrics = {
    dailyDemand: Number((normalMetrics.predicted_daily_demand * surgeMultiplierFactor).toFixed(1)),
    sevenDayDemand: Number((normalMetrics.predicted_7_day_demand * surgeMultiplierFactor).toFixed(1)),
    daysRemaining: Number((currentStock / Math.max(1, normalMetrics.predicted_daily_demand * surgeMultiplierFactor)).toFixed(1)),
    shortage: Number(Math.max(0, normalMetrics.predicted_7_day_demand * surgeMultiplierFactor - currentStock).toFixed(1)),
    get risk(): InventoryRiskLevel {
      if (this.daysRemaining < 2.0) return 'CRITICAL';
      if (this.daysRemaining < 4.5) return 'HIGH';
      if (this.daysRemaining < 7.0) return 'WARNING';
      return 'NORMAL';
    }
  };

  const supplyContext: RequestSupplyContext = {
    phcId: 'phc-emergency-sim',
    phcName,
    district,
    state,
    medicine,
    currentStock,
    unit: 'Units',
    predictedDailyDemand: simulatedEmergencyMetrics.dailyDemand,
    predicted7DayDemand: simulatedEmergencyMetrics.sevenDayDemand,
    daysRemaining: simulatedEmergencyMetrics.daysRemaining,
    shortageQuantity: simulatedEmergencyMetrics.shortage,
    stockOutRisk: simulatedEmergencyMetrics.risk,
    reason: `What-If Emergency Simulation (${scenarioMultiplier === 'surge40' ? '+40% Outbreak Surge' : '+20% Surge'}) projects ${simulatedEmergencyMetrics.shortage} unit deficit for ${phcName}.`
  };

  return (
    <>
      <div className="rounded-2xl border border-rose-300 dark:border-rose-900/80 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-xs">
              <Siren className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {t('emergency.emergencySimulation')}
                </h3>
                <span className="text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                  FastAPI Model Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('emergency.simulationSubtitle')}
              </p>
            </div>
          </div>

          {/* Scenario Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setScenarioMultiplier('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                scenarioMultiplier === 'normal'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {isHindi ? "सामान्य आधारभूत" : "Normal Baseline"}
            </button>
            <button
              type="button"
              onClick={() => setScenarioMultiplier('surge20')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                scenarioMultiplier === 'surge20'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>{isHindi ? "उछाल +20%" : "Surge +20%"}</span>
            </button>
            <button
              type="button"
              onClick={() => setScenarioMultiplier('surge40')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                scenarioMultiplier === 'surge40'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>{isHindi ? "आपातकाल +40%" : "Emergency +40%"}</span>
            </button>
          </div>
        </div>

        {/* Selected PHC & Medicine Context */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">{phcName}</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <Pill className="h-3.5 w-3.5" />
              {medicine}
            </span>
          </div>
          <div className="text-slate-600 dark:text-slate-300">
            {t('hero.currentStock')}: <strong className="text-slate-900 dark:text-slate-100">{currentStock} {isHindi ? "यूनिट्स" : "Units"}</strong>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
            <span>{t('emergency.simulating')}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2.5 px-3">{isHindi ? "टेलीमेट्री मीट्रिक" : "Telemetry Metric"}</th>
                  <th className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{isHindi ? "सामान्य आधारभूत" : "Normal Baseline"}</th>
                  <th className="py-2.5 px-3 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-extrabold rounded-t-lg">
                    {scenarioMultiplier === 'normal' ? (isHindi ? "सामान्य आधारभूत" : "Normal Baseline") : scenarioMultiplier === 'surge20' ? (isHindi ? "आपातकाल +20% उछाल" : "Emergency +20% Surge") : (isHindi ? "आपातकाल +40% प्रकोप" : "Emergency +40% Outbreak")}
                  </th>
                  <th className="py-2.5 px-3 text-right">{isHindi ? "प्रभाव विचलन" : "Variance Impact"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{isHindi ? "दैनिक मांग" : "Daily Demand"}</td>
                  <td className="py-2.5 px-3">{normalMetrics.predicted_daily_demand} {isHindi ? "यूनिट्स/दिन" : "units/day"}</td>
                  <td className="py-2.5 px-3 font-bold bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300">
                    {simulatedEmergencyMetrics.dailyDemand} {isHindi ? "यूनिट्स/दिन" : "units/day"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                    +{Math.round((surgeMultiplierFactor - 1) * 100)}% {isHindi ? "उछाल" : "Surge"}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{t('forecast.predicted7DayDemand')}</td>
                  <td className="py-2.5 px-3">{normalMetrics.predicted_7_day_demand} {isHindi ? "यूनिट्स" : "units"}</td>
                  <td className="py-2.5 px-3 font-bold bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300">
                    {simulatedEmergencyMetrics.sevenDayDemand} {isHindi ? "यूनिट्स" : "units"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                    +{(simulatedEmergencyMetrics.sevenDayDemand - normalMetrics.predicted_7_day_demand).toFixed(1)} {isHindi ? "यूनिट्स" : "units"}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{t('hero.daysRemaining')}</td>
                  <td className="py-2.5 px-3">{normalMetrics.days_remaining} {isHindi ? "दिन" : "days"}</td>
                  <td className="py-2.5 px-3 font-extrabold bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300">
                    {simulatedEmergencyMetrics.daysRemaining} {isHindi ? "दिन" : "days"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                    -{(normalMetrics.days_remaining - simulatedEmergencyMetrics.daysRemaining).toFixed(1)} {isHindi ? "दिन रनवे" : "days runway"}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{t('hero.stockOutRisk')}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {isHindi ? (normalMetrics.stock_out_risk === 'NORMAL' ? 'सामान्य' : normalMetrics.stock_out_risk === 'WARNING' ? 'चेतावनी' : 'गंभीर') : normalMetrics.stock_out_risk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 bg-rose-50/60 dark:bg-rose-950/30">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      simulatedEmergencyMetrics.risk === 'CRITICAL'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      {isHindi ? (simulatedEmergencyMetrics.risk === 'CRITICAL' ? 'गंभीर' : simulatedEmergencyMetrics.risk === 'HIGH' ? 'उच्च' : 'चेतावनी') : simulatedEmergencyMetrics.risk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-700 dark:text-rose-400">
                    {isHindi ? "वृद्धि" : "Escalated"}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{t('hero.shortageQuantity')}</td>
                  <td className="py-2.5 px-3">{normalMetrics.shortage_quantity} {isHindi ? "यूनिट्स" : "units"}</td>
                  <td className="py-2.5 px-3 font-black bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300">
                    {simulatedEmergencyMetrics.shortage} {isHindi ? "यूनिट्स" : "units"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-rose-600">
                    {simulatedEmergencyMetrics.shortage > 0 ? `+${(simulatedEmergencyMetrics.shortage - normalMetrics.shortage_quantity).toFixed(1)} ${isHindi ? "कमी अंतर" : "unit gap"}` : (isHindi ? "पर्याप्त" : "Covered")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Clinical Disclaimer Banner */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 dark:text-slate-200">{isHindi ? "नैदानिक एवं परिचालन अस्वीकरण:" : "Clinical & Operational Disclaimer:"}</strong>{' '}
            {isHindi 
              ? "यह आपातकालीन सिमुलेटर बफ़र पुनः आवंटन में अस्पताल प्रशासकों की सहायता के लिए गणितीय निर्णय-समर्थन अनुमान प्रदान करता है।" 
              : "This What-If Emergency Simulator provides mathematical decision-support projections to assist regional hospital administrators in buffer reallocation. It does not replace formal clinical triage protocols or on-ground epidemiologist advisories."}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isHindi ? "प्रक्षेपित कमी:" : "Projected deficit:"} <strong className="text-rose-600 dark:text-rose-400">{simulatedEmergencyMetrics.shortage} {isHindi ? "यूनिट्स" : "units"}</strong> {isHindi ? `(${scenarioMultiplier === 'surge40' ? '+40% आपातकालीन उछाल' : scenarioMultiplier === 'surge20' ? '+20% उछाल' : 'आधारभूत'})` : `under ${scenarioMultiplier === 'surge40' ? '+40% emergency surge' : scenarioMultiplier === 'surge20' ? '+20% surge' : 'baseline'}`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSupplyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PackagePlus className="h-4 w-4" />
              <span>{isHindi ? "आपातकालीन आपूर्ति बफ़र मांगें" : "Request Emergency Supply Buffer"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Pre-filled Supply Request Modal */}
      <RequestSupplyModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
        context={supplyContext}
      />
    </>
  );
};
