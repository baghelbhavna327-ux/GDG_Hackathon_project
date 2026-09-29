import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SectionHeader } from '../components/common/SectionHeader';
import { AiForecastInteractiveChart } from '../components/charts/AiForecastInteractiveChart';
import { ForecastTimeSeriesPoint } from '../data/forecastMockData';
import { mockIndiaPHCs } from '../data/indiaPhcData';
import { mockMedicineInventory } from '../data/medicineInventoryData';
import { Hospital, PriorityLevel, ResourceCategory, DiseaseAdjustedPredictionData } from '../types';
import { 
  BrainCircuit, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Pill, 
  Building2, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Truck, 
  Layers, 
  Activity,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Loader2,
  PackagePlus,
  ShieldAlert,
  Info
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { RequestSupplyModal, RequestSupplyContext } from '../components/clinician/RequestSupplyModal';
import { ShapExplainabilityModal } from '../components/ai/ShapExplainabilityModal';
import { 
  fetchDemandPrediction, 
  fetchDiseaseAdjustedDemand,
  FastAPIPredictRequest, 
  FastAPIPredictionData 
} from '../services/aiPredictionService';
import { useTranslation } from '../i18n';

interface ForecastPageProps {
  hospitals: Hospital[];
  onCreateTransfer: (data: {
    originFacilityId: string;
    destinationFacilityId: string;
    resourceName: string;
    category: ResourceCategory;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
  }) => void;
}

/**
 * AI Demand Forecast Page
 * 
 * Integrated directly with the Python FastAPI AI Prediction Microservice (POST http://localhost:8000/predict).
 */
export const ForecastPage: React.FC<ForecastPageProps> = ({ hospitals, onCreateTransfer }) => {
  const { t, isHindi } = useTranslation();
  const [searchParams] = useSearchParams();
  const paramState = searchParams.get('state');
  const paramDistrict = searchParams.get('district');

  // 1. Selector States
  const [selectedState, setSelectedState] = useState(paramState || 'Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState(paramDistrict || 'Guna');
  const [selectedPhc, setSelectedPhc] = useState('PHC Guna Central');
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol');
  const [forecastPeriod, setForecastPeriod] = useState<'7 days' | '30 days'>('7 days');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [isShapModalOpen, setIsShapModalOpen] = useState(false);

  // 2. API States
  const [predictionData, setPredictionData] = useState<FastAPIPredictionData | null>(null);
  const [diseaseData, setDiseaseData] = useState<DiseaseAdjustedPredictionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States List
  const statesList = useMemo(() => {
    return Array.from(new Set(mockIndiaPHCs.map(p => p.state))).sort();
  }, []);

  // Districts List based on State
  const districtsList = useMemo(() => {
    const list = Array.from(
      new Set(mockIndiaPHCs.filter(p => p.state === selectedState).map(p => p.district))
    ).sort();
    return list.length > 0 ? list : ['Guna', 'Bhopal', 'Indore', 'Shivpuri'];
  }, [selectedState]);

  // PHCs List based on District and State
  const phcsList = useMemo(() => {
    const list = mockIndiaPHCs
      .filter(p => p.state === selectedState && p.district === selectedDistrict)
      .map(p => p.name);
    if (list.length > 0) return list;
    const stateFallback = mockIndiaPHCs.filter(p => p.state === selectedState).map(p => p.name);
    return stateFallback.length > 0 ? stateFallback : [`${selectedDistrict} PHC-01`];
  }, [selectedState, selectedDistrict]);

  // Unique Medicines List
  const medicinesList = useMemo(() => {
    return ['Paracetamol', 'Amoxicillin', 'ORS', 'Azithromycin', 'Normal Saline (0.9% NaCl)', 'Metformin', 'Insulin Regular (Human)'];
  }, []);

  // Handle State Change -> Reset District & PHC
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const availableDistricts = Array.from(
      new Set(mockIndiaPHCs.filter(p => p.state === newState).map(p => p.district))
    ).sort();
    const newDistrict = availableDistricts[0] || '';
    setSelectedDistrict(newDistrict);
    
    const availablePhcs = mockIndiaPHCs
      .filter(p => p.state === newState && (newDistrict ? p.district === newDistrict : true))
      .map(p => p.name);
    setSelectedPhc(availablePhcs[0] || `${newDistrict} PHC-01`);
  };

  // Handle District Change -> Reset PHC
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const availablePhcs = mockIndiaPHCs
      .filter(p => p.state === selectedState && p.district === newDistrict)
      .map(p => p.name);
    setSelectedPhc(availablePhcs[0] || `${newDistrict} PHC-01`);
  };

  // Handle PHC Change
  const handlePhcChange = (newPhc: string) => {
    setSelectedPhc(newPhc);
  };

  // 3. Lookup existing project inventory and PHC records
  const matchingPhc = useMemo(() => {
    return mockIndiaPHCs.find(
      (p) => p.name.toLowerCase() === selectedPhc.toLowerCase() && p.state.toLowerCase() === selectedState.toLowerCase()
    ) || mockIndiaPHCs.find(
      (p) => p.name.toLowerCase() === selectedPhc.toLowerCase()
    ) || mockIndiaPHCs.find(
      (p) => p.state.toLowerCase() === selectedState.toLowerCase()
    ) || mockIndiaPHCs[0];
  }, [selectedPhc, selectedState]);

  const matchingInventory = useMemo(() => {
    // 1. Direct match by medicine and PHC name
    const directPhcMatch = mockMedicineInventory.find(
      (item) =>
        item.medicine.toLowerCase() === selectedMedicine.toLowerCase() &&
        item.phc.toLowerCase() === selectedPhc.toLowerCase()
    );
    if (directPhcMatch) return directPhcMatch;

    // 2. Match by medicine and District
    const districtMatch = mockMedicineInventory.find(
      (item) =>
        item.medicine.toLowerCase() === selectedMedicine.toLowerCase() &&
        item.district.toLowerCase() === selectedDistrict.toLowerCase()
    );
    if (districtMatch) return districtMatch;

    // 3. Match by medicine and State
    const stateMatch = mockMedicineInventory.find(
      (item) =>
        item.medicine.toLowerCase() === selectedMedicine.toLowerCase() &&
        item.state.toLowerCase() === selectedState.toLowerCase()
    );
    if (stateMatch) return stateMatch;

    return null;
  }, [selectedMedicine, selectedPhc, selectedDistrict, selectedState]);

  const patientCountValue = matchingPhc?.todaysPatients ?? 150;
  const currentStockValue = matchingInventory?.currentStock ?? Math.round(patientCountValue * 0.85);
  const previousConsumptionValue = matchingInventory?.dailyUsage ?? Math.max(10, Math.round(patientCountValue * 0.18));
  const unitValue = matchingInventory?.unit ?? 'units';
  const dosageValue = matchingInventory?.dosage ?? '500mg Tablets';

  // 4. Fetch Real-time Prediction & Disease Adjusted Demand
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const currentMonth = now.getMonth() + 1; // 1-12

    const requestPayload: FastAPIPredictRequest = {
      phc: selectedPhc,
      state: selectedState,
      district: selectedDistrict,
      medicine: selectedMedicine,
      current_stock: currentStockValue,
      patient_count: patientCountValue,
      previous_consumption: previousConsumptionValue,
      day_of_week: dayOfWeek,
      month: currentMonth,
      emergency_flag: 0,
    };

    Promise.all([
      fetchDemandPrediction(requestPayload),
      fetchDiseaseAdjustedDemand(requestPayload)
    ])
      .then(([pred, disAdj]) => {
        if (isMounted) {
          setPredictionData(pred);
          setDiseaseData(disAdj);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Prediction / Disease Adjustment Error:', err);
          setError('AI prediction service is unavailable. Please make sure FastAPI is running on port 8000.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedDistrict, selectedPhc, selectedMedicine, currentStockValue, patientCountValue, previousConsumptionValue]);

  // 5. Map Real API Prediction into UI Fields
  const prediction = useMemo(() => {
    const is7Day = forecastPeriod === '7 days';
    
    // Real API predicted demand
    const predictedDemand = predictionData
      ? (is7Day ? predictionData.predicted_7_day_demand : predictionData.predicted_30_day_demand)
      : (is7Day ? 232.4 : 996.0);

    const currentStock = predictionData ? predictionData.current_stock : currentStockValue;
    const predictedRemainingStock = currentStock - predictedDemand;
    const stockoutRisk = predictionData ? predictionData.stock_out_risk : 'HIGH';
    const estimatedShortage = predictionData ? predictionData.shortage_quantity : Math.max(0, predictedDemand - currentStock);
    const daysRemaining = predictionData ? predictionData.days_remaining : (predictedDemand > 0 ? (currentStock / (predictedDemand / (is7Day ? 7 : 30))) : 3.6);
    const riskExplanation = predictionData ? predictionData.reason : 'High stock-out risk detected because predicted demand exceeds current inventory.';

    // Calculate percentage increase over baseline previous consumption
    const dailyDemand = predictionData?.predicted_daily_demand ?? (predictedDemand / (is7Day ? 7 : 30));
    const demandIncreasePct = previousConsumptionValue > 0
      ? Math.max(0, Math.round(((dailyDemand - previousConsumptionValue) / previousConsumptionValue) * 100))
      : 35.0;

    // Build recommended action based on real risk level & shortage
    let recommendedAction = 'Maintain standard weekly monitoring. Stock levels are healthy.';
    if (stockoutRisk === 'CRITICAL') {
      recommendedAction = `Immediate emergency replenishment of ${Math.ceil(estimatedShortage || 150)} ${unitValue} required within 24 hours to avoid total stock-out.`;
    } else if (stockoutRisk === 'HIGH') {
      recommendedAction = `Transfer ${Math.ceil(estimatedShortage || 100)} ${unitValue} of ${selectedMedicine} from regional buffer warehouse within 48 hours.`;
    } else if (stockoutRisk === 'WARNING') {
      recommendedAction = `Monitor daily dispensing rate and prepare standard reorder buffer of ${Math.ceil(predictedDemand * 0.25)} ${unitValue}.`;
    }

    // Dynamic Chart Data generation from real daily prediction and inventory trajectory
    const historicalPoints: ForecastTimeSeriesPoint[] = [];
    const historyDays = is7Day ? 7 : 14;
    const forecastDays = is7Day ? 7 : 30;

    // Past Days
    for (let i = historyDays - 1; i >= 1; i--) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - i);
      const dateStr = pastDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const variance = Math.sin(i * 1.5) * 3;
      const pastUsage = Math.max(5, Math.round(previousConsumptionValue + variance));
      historicalPoints.push({
        date: `${dateStr} (D-${i})`,
        historicalConsumption: pastUsage,
        predictedDemand: pastUsage,
        currentStockRunway: currentStock + (i * pastUsage),
      });
    }

    // Today
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    historicalPoints.push({
      date: `${todayStr} (Today)`,
      historicalConsumption: previousConsumptionValue,
      predictedDemand: Math.round(dailyDemand),
      currentStockRunway: currentStock,
    });

    // Future Forecast Days
    let runway = currentStock;
    for (let i = 1; i <= forecastDays; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const dateStr = futureDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      runway = Math.round(runway - dailyDemand);
      historicalPoints.push({
        date: `${dateStr} (D+${i})`,
        predictedDemand: Math.round(dailyDemand),
        currentStockRunway: runway,
        confidenceUpper: Math.round(dailyDemand * 1.15),
        confidenceLower: Math.max(0, Math.round(dailyDemand * 0.85)),
      });
    }

    return {
      medicine: selectedMedicine,
      dosage: dosageValue,
      phc: selectedPhc,
      district: selectedDistrict,
      state: selectedState,
      forecastPeriod,
      currentStock,
      unit: unitValue,
      predictedDemand: Math.round(predictedDemand * 10) / 10,
      predictedRemainingStock: Math.round(predictedRemainingStock * 10) / 10,
      stockoutRisk,
      demandIncreasePct,
      estimatedShortage: Math.round(estimatedShortage * 10) / 10,
      riskExplanation,
      recommendedAction,
      daysRemaining: Math.round(daysRemaining * 10) / 10,
      historicalData: historicalPoints,
    };
  }, [predictionData, forecastPeriod, selectedMedicine, selectedPhc, selectedDistrict, selectedState, currentStockValue, previousConsumptionValue, dosageValue, unitValue]);

  const isDeficit = prediction.predictedRemainingStock < 0;

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <SectionHeader
        title={t('page.forecast.title')}
        subtitle={t('page.forecast.subtitle')}
        badge="FastAPI ML Engine"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
            >
              <Truck className="h-4 w-4" />
              {isHindi ? "पुनर्संतुलन स्थानांतरण प्रेषण" : "Dispatch Rebalance Transfer"}
            </button>
          </div>
        }
      />

      {/* Error Banner if FastAPI service is unavailable */}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                {isHindi ? "ऑफ़लाइन फ़ॉलबैक मोड में स्थानीय आधार अनुमान दिखाए जा रहे हैं।" : "Showing local baseline estimates in offline fallback mode."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              // Trigger reload
              const now = new Date();
              fetchDemandPrediction({
                phc: selectedPhc,
                state: selectedState,
                district: selectedDistrict,
                medicine: selectedMedicine,
                current_stock: currentStockValue,
                patient_count: patientCountValue,
                previous_consumption: previousConsumptionValue,
                day_of_week: (now.getDay() + 6) % 7,
                month: now.getMonth() + 1,
                emergency_flag: 0,
              })
                .then((data) => {
                  setPredictionData(data);
                  setIsLoading(false);
                })
                .catch(() => {
                  setError('AI prediction service is unavailable. Please make sure FastAPI is running on port 8000.');
                  setIsLoading(false);
                });
            }}
            className="rounded-lg bg-rose-600 dark:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 dark:hover:bg-rose-600 transition"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Top Selectors Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
              {isHindi ? "पूर्वानुमान मॉडल चयनकर्ता" : "Forecasting Model Selectors"}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                {isHindi ? "फास्टएपीआई से क्वेरी हो रही है..." : "Querying FastAPI..."}
              </span>
            )}
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
              {t('hero.confidence')}: XGBoost
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* 1. State Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{isHindi ? "राज्य" : "State"}</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {statesList.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* 2. District Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{isHindi ? "ज़िला" : "District"}</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {districtsList.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 3. PHC Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('forecast.selectPhc')}</label>
            <select
              value={selectedPhc}
              onChange={(e) => handlePhcChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {phcsList.map((p) => (
                <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Medicine Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('forecast.selectMedicine')}</label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {medicinesList.map((med) => (
                <option key={med} value={med} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {med}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Forecast Period: 7 days / 30 days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{isHindi ? "पूर्वानुमान अवधि" : "Forecast Period"}</label>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setForecastPeriod('7 days')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition ${
                  forecastPeriod === '7 days'
                    ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {isHindi ? "7 दिन" : "7 Days"}
              </button>
              <button
                type="button"
                onClick={() => setForecastPeriod('30 days')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition ${
                  forecastPeriod === '30 days'
                    ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {isHindi ? "30 दिन" : "30 Days"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Medicine */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('inventory.medicineName')}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-tight">{prediction.medicine}</h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{prediction.dosage}</span>
            </div>
          </div>
        </div>

        {/* Current Stock */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('hero.currentStock')}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-2xl">{prediction.currentStock}</h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{prediction.unit}</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{selectedPhc}</p>
        </div>

        {/* Predicted Demand */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {forecastPeriod === '7 days' ? t('hero.predicted7DayDemand') : (isHindi ? "अनुमानित 30-दिवसीय मांग" : "Predicted 30-Day Demand")}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h4 className="font-extrabold text-teal-700 dark:text-teal-400 text-2xl">{prediction.predictedDemand}</h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{prediction.unit}</span>
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">+{prediction.demandIncreasePct}% {isHindi ? "मांग वृद्धि वेग" : "surge velocity"}</p>
        </div>

        {/* Predicted Remaining Stock */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isHindi ? "अनुमानित शेष स्टॉक" : "Predicted Remaining Stock"}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h4 className={`font-extrabold text-2xl ${isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {prediction.predictedRemainingStock}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{prediction.unit}</span>
          </div>
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            {isDeficit 
              ? (isHindi ? `${Math.abs(prediction.predictedRemainingStock)} यूनिट्स की कमी` : `Deficit of ${Math.abs(prediction.predictedRemainingStock)} units`) 
              : (isHindi ? 'सुरक्षित अधिशेष' : 'Surplus safe')}
          </p>
        </div>

        {/* Stock-out Risk */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex flex-col justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('hero.stockOutRisk')}</p>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-extrabold ${
                prediction.stockoutRisk === 'CRITICAL' || prediction.stockoutRisk === 'HIGH'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 animate-pulse'
                  : prediction.stockoutRisk === 'WARNING'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${
                prediction.stockoutRisk === 'CRITICAL' || prediction.stockoutRisk === 'HIGH' ? 'bg-rose-600' : 'bg-emerald-600'
              }`} />
              {isHindi ? (prediction.stockoutRisk === 'CRITICAL' ? 'गंभीर' : prediction.stockoutRisk === 'HIGH' ? 'उच्च' : prediction.stockoutRisk === 'WARNING' ? 'चेतावनी' : 'सामान्य') : prediction.stockoutRisk}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{isHindi ? "हस्तक्षेप अपेक्षित" : "Intervention required"}</p>
        </div>
      </div>

      {/* Recharts Graph: Historical Consumption vs Predicted Demand vs Current Stock */}
      <AiForecastInteractiveChart
        data={prediction.historicalData}
        medicineName={prediction.medicine}
        forecastPeriod={prediction.forecastPeriod}
        currentStock={prediction.currentStock}
      />

      {/* Regional Disease & Seasonal Scenario Comparison Card */}
      {diseaseData && (
        <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-6 shadow-card space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    {t('disease.intelligenceTitle')} — {t('disease.adjustedForecast')}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Scenario Model
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedDistrict}, {selectedState} • {diseaseData.seasonal_context.season}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold ${
                diseaseData.disease_impact.impact_score === 'CRITICAL'
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                <ShieldAlert className="h-3.5 w-3.5" />
                {t('disease.impact_score') || 'Impact'}: {diseaseData.disease_impact.impact_score}
              </span>
            </div>
          </div>

          {/* 3-Column Scenario Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Baseline Machine Learning Forecast */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('disease.baselineForecast')}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  XGBoost
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {diseaseData.baseline.predicted_7_day_demand}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{prediction.unit} / 7d</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Daily Demand: <strong>{diseaseData.baseline.predicted_daily_demand}</strong> {prediction.unit}/day
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Stock Runway</span>
                  <strong className="text-slate-700 dark:text-slate-300">{diseaseData.baseline.days_remaining} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Baseline Shortage</span>
                  <strong className={diseaseData.baseline.shortage_quantity > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {diseaseData.baseline.shortage_quantity} {prediction.unit}
                  </strong>
                </div>
              </div>
            </div>

            {/* Column 2: Regional Disease & Seasonal Signals */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-4 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  {t('disease.diseaseImpact')}
                </span>
                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                  +{diseaseData.disease_impact.adjustment_percentage}%
                </span>
              </div>

              <div>
                <p className="text-sm font-extrabold text-amber-950 dark:text-amber-200">
                  {diseaseData.disease_impact.active_signals[0]?.diseaseName || 'Regional Epidemiological Surge'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-800 dark:text-amber-400 mt-1 font-mono">
                  <span>Source: {diseaseData.disease_impact.active_signals[0]?.source || 'IDSP / NCDC Official'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                {diseaseData.disease_impact.contributing_signals.map((sig, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 shrink-0 font-bold">•</span>
                    <span className="leading-tight">{sig}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Adjusted Scenario Forecast */}
            <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800/80 bg-rose-50/40 dark:bg-rose-950/30 p-4 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                  {t('disease.adjustedForecast')}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  diseaseData.adjusted_forecast.stock_out_risk === 'CRITICAL'
                    ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 border border-rose-400'
                    : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                }`}>
                  {diseaseData.adjusted_forecast.stock_out_risk} Risk
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">
                    {diseaseData.adjusted_forecast.predicted_7_day_demand}
                  </span>
                  <span className="text-xs text-rose-900 dark:text-rose-300 font-semibold">{prediction.unit} / 7d</span>
                </div>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1">
                  Adjusted Daily: <strong>{diseaseData.adjusted_forecast.predicted_daily_demand}</strong> {prediction.unit}/day
                </p>
              </div>

              <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-rose-700 dark:text-rose-400 block">Shortened Runway</span>
                  <strong className="text-rose-900 dark:text-rose-200">{diseaseData.adjusted_forecast.days_remaining} Days</strong>
                </div>
                <div>
                  <span className="text-rose-700 dark:text-rose-400 block">Scenario Deficit</span>
                  <strong className="text-rose-900 dark:text-rose-200 font-extrabold">
                    {diseaseData.adjusted_forecast.shortage_quantity} {prediction.unit}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar for Supply Request */}
          <div className="rounded-xl bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                {t('disease.planningAlert')}
              </span>
              <p className="text-xs text-slate-200 font-medium">
                {diseaseData.adjusted_forecast.requires_supply_request
                  ? `${selectedPhc} is facing an estimated deficit of ${diseaseData.adjusted_forecast.shortage_quantity} ${prediction.unit} under the ${diseaseData.disease_impact.active_signals[0]?.diseaseName || 'regional disease surge'} scenario.`
                  : 'Projected inventory buffer remains sufficient under the current seasonal scenario.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSupplyModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 px-4 py-2 text-xs font-extrabold text-slate-950 transition shadow-sm cursor-pointer"
              >
                <PackagePlus className="h-4 w-4" />
                <span>{t('disease.requestSupply')}</span>
              </button>
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{t('disease.disclaimer')}</span>
          </div>
        </div>
      )}

      {/* "AI Risk Explanation" Card */}
      <div className="rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-white via-slate-50 to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 dark:bg-teal-500 text-white shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                {isHindi ? "AI जोखिम निदान एवं अनुशंसित कार्रवाई" : "AI Risk Explanation & Recommended Action"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPhc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShapModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 px-3 py-1.5 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              {isHindi ? "SHAP व्याख्या" : "Explain with SHAP"}
            </button>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800/60">
              FastAPI Intelligence
            </span>
          </div>
        </div>

        {/* Primary Explanation Statement */}
        <div className="rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 flex items-start gap-3 text-rose-950 dark:text-rose-200">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-sm text-rose-950 dark:text-rose-200">
              "{prediction.riskExplanation}"
            </p>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
              {isHindi 
                ? "मशीन लर्निंग प्रतिगमन मॉडल ऐतिहासिक खपत, ओपीडी फुटफॉल और इन्वेंट्री स्तरों का विश्लेषण करता है।" 
                : "Based on machine learning regression model analyzing historical consumption, patient footfall, and inventory levels."}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-subtle">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
              {isHindi ? "मांग वृद्धि प्रतिशत" : "Demand Increase Percentage"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-rose-700 dark:text-rose-400">+{prediction.demandIncreasePct}%</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{isHindi ? "आधार खपत से अधिक" : "above baseline consumption"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-subtle">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">{t('hero.shortageQuantity')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-rose-700 dark:text-rose-400">{prediction.estimatedShortage} {prediction.unit}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{isHindi ? "प्रक्षेपित कमी" : "projected deficit"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-subtle">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">{t('hero.daysRemaining')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-400">{prediction.daysRemaining} {isHindi ? "दिन" : "Days"}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{isHindi ? "बिना हस्तक्षेप के" : "without intervention"}</span>
            </div>
          </div>
        </div>

        {/* Recommended Action Protocol & Direct Execution */}
        <div className="rounded-xl bg-teal-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              {t('hero.recommendedAction')}
            </span>
            <p className="text-xs text-slate-100 font-medium leading-relaxed">
              {prediction.recommendedAction}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsSupplyModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition shadow-md cursor-pointer"
            >
              <PackagePlus className="h-4 w-4" />
              {t('dashboard.requestMedicineSupply')}
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:from-teal-300 hover:to-cyan-300 transition shadow-md cursor-pointer"
            >
              <Truck className="h-4 w-4" />
              {isHindi ? "AI स्थानांतरण प्रोटोकॉल निष्पादित करें" : "Execute AI Transfer Protocol"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Clinician Supply Request */}
      <RequestSupplyModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
        context={{
          phcId: 'phc-' + selectedPhc.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          phcName: selectedPhc,
          district: selectedDistrict,
          state: selectedState,
          medicine: prediction.medicine,
          currentStock: prediction.currentStock,
          unit: prediction.unit,
          predictedDailyDemand: diseaseData?.adjusted_forecast?.predicted_daily_demand || Math.round(prediction.predictedDemand / (forecastPeriod === '7 days' ? 7 : 30)),
          predicted7DayDemand: diseaseData?.adjusted_forecast?.predicted_7_day_demand || (forecastPeriod === '7 days' ? prediction.predictedDemand : Math.round(prediction.predictedDemand * (7 / 30))),
          daysRemaining: diseaseData?.adjusted_forecast?.days_remaining ?? prediction.daysRemaining,
          shortageQuantity: diseaseData?.adjusted_forecast?.shortage_quantity ?? prediction.estimatedShortage,
          stockOutRisk: (diseaseData?.adjusted_forecast?.stock_out_risk || prediction.stockoutRisk) as any,
          reason: diseaseData && diseaseData.disease_impact.active_signals.length > 0
            ? `Scenario Demand Surge (+${diseaseData.disease_impact.adjustment_percentage}%): ${diseaseData.disease_impact.active_signals[0]?.diseaseName} in ${selectedDistrict}, ${selectedState} (${diseaseData.disease_impact.active_signals[0]?.source}). Immediate replenishment of ${diseaseData.adjusted_forecast.shortage_quantity} ${prediction.unit} requested for ${selectedPhc}.`
            : prediction.riskExplanation
        }}
        onSuccess={() => {
          setIsSupplyModalOpen(false);
        }}
      />

      {/* Modal for dispatch */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />

      {/* SHAP Feature Impact Explainability Modal */}
      <ShapExplainabilityModal
        isOpen={isShapModalOpen}
        onClose={() => setIsShapModalOpen(false)}
        predictContext={{
          phc: selectedPhc,
          state: selectedState,
          district: selectedDistrict,
          medicine: selectedMedicine,
          current_stock: currentStockValue,
          patient_count: patientCountValue,
          previous_consumption: previousConsumptionValue,
          day_of_week: (new Date().getDay() + 6) % 7,
          month: new Date().getMonth() + 1,
          emergency_flag: 0,
        }}
      />
    </div>
  );
};

