import React, { useState, useMemo, useEffect } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { AiForecastInteractiveChart } from '../components/charts/AiForecastInteractiveChart';
import { ForecastTimeSeriesPoint } from '../data/forecastMockData';
import { mockIndiaPHCs } from '../data/indiaPhcData';
import { mockMedicineInventory } from '../data/medicineInventoryData';
import { Hospital, PriorityLevel, ResourceCategory } from '../types';
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
  Loader2
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { 
  fetchDemandPrediction, 
  FastAPIPredictRequest, 
  FastAPIPredictionData 
} from '../services/aiPredictionService';

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
  // 1. Selector States
  const [selectedState, setSelectedState] = useState('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Guna');
  const [selectedPhc, setSelectedPhc] = useState('PHC Guna Central');
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol');
  const [forecastPeriod, setForecastPeriod] = useState<'7 days' | '30 days'>('7 days');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // 2. API States
  const [predictionData, setPredictionData] = useState<FastAPIPredictionData | null>(null);
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

  // 4. Fetch Real-time Prediction from FastAPI Service
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

    fetchDemandPrediction(requestPayload)
      .then((data) => {
        if (isMounted) {
          setPredictionData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('FastAPI Prediction Error:', err);
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
        title="AI Demand Forecast"
        subtitle="Predict medicine and healthcare resource requirements before shortages occur."
        badge="FastAPI ML Engine"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
            >
              <Truck className="h-4 w-4" />
              Dispatch Rebalance Transfer
            </button>
          </div>
        }
      />

      {/* Error Banner if FastAPI service is unavailable */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-rose-700 mt-0.5">Showing local baseline estimates in offline fallback mode.</p>
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
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Selectors Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Forecasting Model Selectors
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-teal-700 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                Querying FastAPI...
              </span>
            )}
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Model Confidence: N/A (FastAPI XGBoost)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* 1. State Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* 2. District Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 3. PHC Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PHC Center</label>
            <select
              value={selectedPhc}
              onChange={(e) => handlePhcChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {phcsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Medicine Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Formulary</label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {medicinesList.map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Forecast Period: 7 days / 30 days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Forecast Period</label>
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setForecastPeriod('7 days')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition ${
                  forecastPeriod === '7 days'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setForecastPeriod('30 days')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition ${
                  forecastPeriod === '30 days'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Medicine */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Medicine</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 shrink-0">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base leading-tight">{prediction.medicine}</h4>
              <span className="text-[10px] text-slate-500">{prediction.dosage}</span>
            </div>
          </div>
        </div>

        {/* Current Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Stock</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h4 className="font-extrabold text-slate-900 text-2xl">{prediction.currentStock}</h4>
            <span className="text-xs text-slate-500 font-semibold">{prediction.unit}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Recorded at {selectedPhc}</p>
        </div>

        {/* Predicted Demand */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Predicted {forecastPeriod} Demand
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h4 className="font-extrabold text-teal-700 text-2xl">{prediction.predictedDemand}</h4>
            <span className="text-xs text-slate-500 font-semibold">{prediction.unit}</span>
          </div>
          <p className="text-[10px] text-teal-600 font-medium mt-0.5">+{prediction.demandIncreasePct}% surge velocity</p>
        </div>

        {/* Predicted Remaining Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Predicted Remaining Stock
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h4 className={`font-extrabold text-2xl ${isDeficit ? 'text-rose-600' : 'text-emerald-700'}`}>
              {prediction.predictedRemainingStock}
            </h4>
            <span className="text-xs text-slate-500 font-semibold">{prediction.unit}</span>
          </div>
          <p className="text-[10px] font-bold text-rose-600 mt-0.5">
            {isDeficit ? `Deficit of ${Math.abs(prediction.predictedRemainingStock)} units` : 'Surplus safe'}
          </p>
        </div>

        {/* Stock-out Risk */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card flex flex-col justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stock-out Risk</p>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-extrabold ${
                prediction.stockoutRisk === 'CRITICAL' || prediction.stockoutRisk === 'HIGH'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                  : prediction.stockoutRisk === 'WARNING'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${
                prediction.stockoutRisk === 'CRITICAL' || prediction.stockoutRisk === 'HIGH' ? 'bg-rose-600' : 'bg-emerald-600'
              }`} />
              {prediction.stockoutRisk}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Intervention required</p>
        </div>
      </div>

      {/* Recharts Graph: Historical Consumption vs Predicted Demand vs Current Stock */}
      <AiForecastInteractiveChart
        data={prediction.historicalData}
        medicineName={prediction.medicine}
        forecastPeriod={prediction.forecastPeriod}
        currentStock={prediction.currentStock}
      />

      {/* "AI Risk Explanation" Card */}
      <div className="rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-white via-slate-50 to-teal-50/40 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">AI Risk Explanation & Recommended Action</h3>
              <p className="text-xs text-slate-500">Machine learning demand forecast generated for {selectedPhc}</p>
            </div>
          </div>

          <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            FastAPI Intelligence
          </span>
        </div>

        {/* Primary Explanation Statement */}
        <div className="rounded-lg bg-rose-50/80 border border-rose-200 p-3.5 flex items-start gap-3 text-rose-950">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-sm text-rose-950">
              "{prediction.riskExplanation}"
            </p>
            <p className="text-xs text-rose-800 mt-0.5">
              Based on machine learning regression model analyzing historical consumption, patient footfall, and inventory levels.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-subtle">
            <span className="text-slate-500 font-semibold block mb-1">Demand Increase Percentage</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-rose-700">+{prediction.demandIncreasePct}%</span>
              <span className="text-[11px] text-slate-500">above baseline consumption</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-subtle">
            <span className="text-slate-500 font-semibold block mb-1">Estimated Shortage Deficit</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-rose-700">{prediction.estimatedShortage} {prediction.unit}</span>
              <span className="text-[11px] text-slate-500">projected deficit</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-subtle">
            <span className="text-slate-500 font-semibold block mb-1">Stock Exhaustion Runway</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-amber-700">{prediction.daysRemaining} Days</span>
              <span className="text-[11px] text-slate-500">without intervention</span>
            </div>
          </div>
        </div>

        {/* Recommended Action Protocol & Direct Execution */}
        <div className="rounded-xl bg-teal-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              Recommended Action Protocol
            </span>
            <p className="text-xs text-slate-100 font-medium leading-relaxed">
              {prediction.recommendedAction}
            </p>
          </div>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:from-teal-300 hover:to-cyan-300 transition shadow-md"
          >
            <Truck className="h-4 w-4" />
            Execute AI Transfer Protocol
          </button>
        </div>
      </div>

      {/* Modal for dispatch */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};

