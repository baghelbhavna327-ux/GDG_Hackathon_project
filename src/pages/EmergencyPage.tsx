import React, { useState, useMemo } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatCard } from '../components/common/StatCard';
import { normalOperationsData, emergencyModeData, SimulationStateData } from '../data/emergencySimulationData';
import { mockIndiaPHCs } from '../data/indiaPhcData';
import { mockMedicineInventory } from '../data/medicineInventoryData';
import { Hospital, PriorityLevel, ResourceCategory } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { 
  AlertOctagon, 
  Siren, 
  RotateCcw, 
  Bed, 
  Users, 
  Pill, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Sparkles, 
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  Building2,
  SlidersHorizontal,
  Loader2,
  TrendingUp,
  BrainCircuit,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { 
  fetchEmergencyPrediction, 
  FastAPIEmergencyPredictRequest, 
  FastAPIEmergencyPredictionData 
} from '../services/aiPredictionService';

interface EmergencyPageProps {
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

export const EmergencyPage: React.FC<EmergencyPageProps> = ({ hospitals, onCreateTransfer }) => {
  // 1. Selector States (Cascading Hierarchy)
  const [selectedState, setSelectedState] = useState('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Guna');
  const [selectedPhc, setSelectedPhc] = useState('Guna PHC-04');
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol');

  // 2. Simulation & API States
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [predictionData, setPredictionData] = useState<FastAPIEmergencyPredictionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [authorizedTransfers, setAuthorizedTransfers] = useState<string[]>([]);

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

  // Cascading Handlers
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

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const availablePhcs = mockIndiaPHCs
      .filter(p => p.state === selectedState && p.district === newDistrict)
      .map(p => p.name);
    setSelectedPhc(availablePhcs[0] || `${newDistrict} PHC-01`);
  };

  const handlePhcChange = (newPhc: string) => {
    setSelectedPhc(newPhc);
  };

  // Lookup localized inventory and PHC records
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

  const patientCountValue = matchingPhc?.todaysPatients ?? 250;
  const currentStockValue = matchingInventory?.currentStock ?? Math.round(patientCountValue * 0.85);
  const previousConsumptionValue = matchingInventory?.dailyUsage ?? Math.max(10, Math.round(patientCountValue * 0.18));
  const unitValue = matchingInventory?.unit ?? 'units';

  // API Call: Trigger Emergency Simulation
  const handleRunEmergencySimulation = async () => {
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const currentMonth = now.getMonth() + 1; // 1-12

    const payload: FastAPIEmergencyPredictRequest = {
      phc: selectedPhc,
      state: selectedState,
      district: selectedDistrict,
      medicine: selectedMedicine,
      current_stock: currentStockValue,
      patient_count: patientCountValue,
      previous_consumption: previousConsumptionValue,
      day_of_week: dayOfWeek,
      month: currentMonth,
    };

    try {
      const data = await fetchEmergencyPrediction(payload);
      setPredictionData(data);
      setIsEmergencyActive(true);
    } catch (err: any) {
      console.error('FastAPI Emergency Simulation Error:', err);
      setError('AI prediction service is unavailable. Please make sure FastAPI is running on port 8000.');
      setPredictionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSimulation = () => {
    setIsEmergencyActive(false);
    setPredictionData(null);
    setError(null);
    setAuthorizedTransfers([]);
  };

  const handleAuthorizeTransfer = (id: string) => {
    setAuthorizedTransfers((prev) => [...prev, id]);
  };

  // Base simulation UI data fallback
  const simData: SimulationStateData = isEmergencyActive ? emergencyModeData : normalOperationsData;

  return (
    <div className="space-y-6">
      {/* Top Header & Simulation Trigger Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isEmergencyActive
                  ? 'bg-rose-600 text-white shadow-md animate-pulse'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isEmergencyActive ? 'bg-white' : 'bg-teal-600'}`} />
              {isEmergencyActive ? '🚨 Emergency Surge Active' : 'Standard Baseline Operations'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isEmergencyActive ? 'Regional Crisis Inflow Active' : 'Standard Baseline Operations'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Emergency Simulation Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Evaluate how HealthChain AI dynamically models surge footfall, critical drug deficits, and automated load rebalancing via FastAPI.
          </p>
        </div>

        {/* Big Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {!isEmergencyActive ? (
            <button
              onClick={handleRunEmergencySimulation}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition-all transform cursor-pointer ring-4 ring-rose-200 ${
                isLoading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:from-rose-500 hover:to-red-500 hover:scale-105 active:scale-95 animate-pulse'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Running Emergency AI Simulation...
                </>
              ) : (
                <>
                  <Siren className="h-5 w-5" />
                  🚨 Simulate Emergency
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleResetSimulation}
              className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 shadow-md hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-slate-600" />
              Reset Simulation
            </button>
          )}
        </div>
      </div>

      {/* Selectors Bar (State -> District -> PHC -> Medicine) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Emergency Simulation Parameters
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-700 font-bold animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                Running Emergency AI Simulation...
              </span>
            )}
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              FastAPI Endpoint: POST /predict/emergency
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
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
        </div>

        {/* Selected Node Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span><strong>Current Stock:</strong> {currentStockValue} {unitValue}</span>
            <span><strong>Daily Patients:</strong> {patientCountValue}</span>
            <span><strong>Base Consumption:</strong> {previousConsumptionValue} {unitValue}/day</span>
          </div>
          <span className="text-[11px] text-teal-700 font-medium">
            Node: {selectedPhc} ({selectedDistrict}, {selectedState})
          </span>
        </div>
      </div>

      {/* Error Banner with Retry Button */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-rose-700 mt-0.5">Please ensure python uvicorn service is active on port 8000.</p>
            </div>
          </div>
          <button
            onClick={handleRunEmergencySimulation}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* REAL FASTAPI EMERGENCY PREDICTION COMPARISON DASHBOARD */}
      {predictionData && isEmergencyActive && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Emergency Active Banner */}
          <div className="rounded-xl border-2 border-rose-500 bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 text-white p-5 shadow-elevated">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white shadow-md">
                  <AlertOctagon className="h-6 w-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold uppercase tracking-wide">
                      FASTAPI AI EMERGENCY SURGE SIMULATION ACTIVE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-rose-800 text-[10px] font-extrabold uppercase">
                      Surge +{predictionData.demand_increase_percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 leading-relaxed max-w-4xl font-medium">
                    {predictionData.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg text-white border border-white/30 flex items-center gap-1.5">
                  <Radio className="h-4 w-4" />
                  Risk Level: {predictionData.stock_out_risk}
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison: Normal vs Emergency Situation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. NORMAL SITUATION CARD */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                    Normal Baseline Situation
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  {predictionData.normal.stock_out_risk} Risk
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Daily Demand:</span>
                  <span className="font-bold text-slate-900">{predictionData.normal.predicted_daily_demand} {unitValue}/day</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">7-Day Demand:</span>
                  <span className="font-bold text-slate-900">{predictionData.normal.predicted_7_day_demand} {unitValue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Days Remaining:</span>
                  <span className="font-bold text-teal-700">{predictionData.normal.days_remaining} days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Estimated Shortage:</span>
                  <span className="font-bold text-slate-900">{predictionData.normal.shortage_quantity} {unitValue}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-bold text-slate-900">{predictionData.current_stock} {unitValue}</span>
                </div>
              </div>
            </div>

            {/* 2. EMERGENCY SITUATION CARD */}
            <div className="rounded-xl border-2 border-rose-400 bg-rose-50/40 p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-rose-900">
                    Emergency Surge Situation
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                  {predictionData.emergency.stock_out_risk} Risk
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-rose-800 font-medium">Daily Demand:</span>
                  <span className="font-extrabold text-rose-950">{predictionData.emergency.predicted_daily_demand} {unitValue}/day</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-rose-800 font-medium">7-Day Demand:</span>
                  <span className="font-extrabold text-rose-950">{predictionData.emergency.predicted_7_day_demand} {unitValue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-rose-800 font-medium">Days Remaining:</span>
                  <span className="font-extrabold text-rose-700">{predictionData.emergency.days_remaining} days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-rose-800 font-medium">Estimated Shortage:</span>
                  <span className="font-extrabold text-rose-700">{predictionData.emergency.shortage_quantity} {unitValue}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-rose-800 font-medium">Current Stock:</span>
                  <span className="font-extrabold text-rose-950">{predictionData.current_stock} {unitValue}</span>
                </div>
              </div>
            </div>

            {/* 3. EMERGENCY IMPACT & DELTA CARD */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-700" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
                    Emergency Impact Delta
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  FastAPI XGBoost
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Demand Comparison */}
                <div className="p-2 rounded bg-white/80 border border-amber-200/60 space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Demand Shift:</span>
                    <span className="text-rose-600 font-extrabold">+{predictionData.demand_increase_percentage}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span>{predictionData.normal.predicted_daily_demand}</span>
                    <ArrowRight className="h-3 w-3 text-amber-600" />
                    <span className="font-bold text-rose-700">{predictionData.emergency.predicted_daily_demand} {unitValue}/d</span>
                  </div>
                </div>

                {/* Runway Comparison */}
                <div className="p-2 rounded bg-white/80 border border-amber-200/60 space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Runway Compression:</span>
                    <span className="text-rose-600 font-extrabold">
                      -{(predictionData.normal.days_remaining - predictionData.emergency.days_remaining).toFixed(1)} Days
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span>{predictionData.normal.days_remaining}d</span>
                    <ArrowRight className="h-3 w-3 text-amber-600" />
                    <span className="font-bold text-rose-700">{predictionData.emergency.days_remaining}d</span>
                  </div>
                </div>

                {/* Shortage Deficit */}
                <div className="p-2 rounded bg-white/80 border border-amber-200/60 space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Additional Deficit:</span>
                    <span className="text-rose-700 font-extrabold">+{predictionData.shortage_quantity} {unitValue}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span>{predictionData.normal.shortage_quantity}</span>
                    <ArrowRight className="h-3 w-3 text-amber-600" />
                    <span className="font-bold text-rose-700">{predictionData.emergency.shortage_quantity} {unitValue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Patient Footfall */}
        <StatCard
          title="Patient Footfall"
          value={predictionData && isEmergencyActive ? `${Math.round(patientCountValue * 1.65)} / day` : `${patientCountValue} / day`}
          subtitle={isEmergencyActive ? '+65% Crisis Surge' : 'Normal Daily Footfall'}
          change={isEmergencyActive ? '+65% Surge' : 'Normal'}
          changeType={isEmergencyActive ? 'urgent' : 'neutral'}
          icon={Users}
          iconBg={isEmergencyActive ? 'bg-rose-100' : 'bg-blue-50'}
          iconColor={isEmergencyActive ? 'text-rose-700' : 'text-blue-600'}
        />

        {/* KPI 2: Medicine Demand */}
        <StatCard
          title="Medicine Demand"
          value={
            predictionData && isEmergencyActive 
              ? `${predictionData.emergency.predicted_daily_demand} ${unitValue}/day` 
              : `${previousConsumptionValue} ${unitValue}/day`
          }
          subtitle={
            predictionData && isEmergencyActive 
              ? `+${predictionData.demand_increase_percentage}% Surge` 
              : 'Stable Usage'
          }
          change={isEmergencyActive ? `+${predictionData?.demand_increase_percentage ?? 72}% Surge` : 'Stable'}
          changeType={isEmergencyActive ? 'urgent' : 'neutral'}
          icon={Pill}
          iconBg={isEmergencyActive ? 'bg-rose-100' : 'bg-teal-50'}
          iconColor={isEmergencyActive ? 'text-rose-700' : 'text-teal-600'}
        />

        {/* KPI 3: Critical PHCs */}
        <StatCard
          title="Critical PHCs"
          value={isEmergencyActive ? '24 in Red Zone' : '8 on Watch'}
          subtitle={simData.criticalPhcsChange}
          change={isEmergencyActive ? '24 in Red Zone' : '8 on Watch'}
          changeType={isEmergencyActive ? 'urgent' : 'increase'}
          icon={Building2}
          iconBg={isEmergencyActive ? 'bg-rose-100' : 'bg-amber-50'}
          iconColor={isEmergencyActive ? 'text-rose-700' : 'text-amber-600'}
        />

        {/* KPI 4: Bed Occupancy */}
        <StatCard
          title="Bed Occupancy"
          value={simData.bedOccupancy}
          subtitle={simData.bedOccupancyChange}
          change={isEmergencyActive ? '82% Critical' : '52% Safe'}
          changeType={isEmergencyActive ? 'urgent' : 'increase'}
          icon={Bed}
          iconBg={isEmergencyActive ? 'bg-rose-100' : 'bg-emerald-50'}
          iconColor={isEmergencyActive ? 'text-rose-700' : 'text-emerald-600'}
        />
      </div>

      {/* Charts Grid: Patient Footfall Spike vs Medicine Demand Surge */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Increased Patient Footfall Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                {isEmergencyActive ? 'Patient Footfall Outbreak Velocity (+65%)' : 'Patient Footfall (Baseline)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEmergencyActive ? `Simulated crisis influx for ${selectedPhc}` : `Standard clinic attendance for ${selectedPhc}`}
              </p>
            </div>
            {isEmergencyActive && (
              <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 self-start sm:self-auto animate-pulse">
                Surge Peak: {Math.round(patientCountValue * 1.65)} visits
              </span>
            )}
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simData.footfallChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="crisisGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} domain={[900, 2200]} />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString()} Visits`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="actualVisits"
                  name="Baseline Attendance"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#normalGrad)"
                />
                {isEmergencyActive && (
                  <Area
                    type="monotone"
                    dataKey="simulatedCrisisVisits"
                    name="Simulated Emergency Surge Inflow"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#crisisGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Medicine Demand Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Pill className="h-4 w-4 text-teal-600" />
                {isEmergencyActive ? `Medicine Demand Surge vs Stock (${selectedMedicine})` : `Medicine Demand (${selectedMedicine})`}
              </h3>
              <p className="text-xs text-slate-500">
                {isEmergencyActive ? 'Consumption pressure modeled under emergency protocols' : 'Balanced inventory runway'}
              </p>
            </div>
            {isEmergencyActive && (
              <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 self-start sm:self-auto">
                Stockout Risk: {predictionData?.stock_out_risk ?? 'CRITICAL'}
              </span>
            )}
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simData.medicineDemandChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="medicine" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  formatter={(val: number) => [`${val} Units`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="availableStock" name="Available In-Stock" fill="#0d9488" radius={[4, 4, 0, 0]} />
                {isEmergencyActive ? (
                  <Bar dataKey="emergencyDemand" name="Crisis Demand" fill="#e11d48" radius={[4, 4, 0, 0]} />
                ) : (
                  <Bar dataKey="normalDemand" name="Normal Demand" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bed Availability Warning Card */}
      <div className={`rounded-xl border p-5 transition-all ${
        isEmergencyActive 
          ? 'border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-amber-50 shadow-card' 
          : 'border-slate-200 bg-white shadow-card'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              isEmergencyActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-teal-50 text-teal-600'
            }`}>
              <Bed className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {isEmergencyActive ? '⚠️ Regional Bed Availability Warning (82% Occupied)' : 'Regional Bed Capacity Status (52% Occupied)'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  isEmergencyActive ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isEmergencyActive ? 'Critical Density' : 'Optimal'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                {isEmergencyActive
                  ? `Inpatient and acute observation beds have reached critical capacity across ${selectedDistrict} district. Ambulance diversion and step-down discharge protocols are recommended.`
                  : '48% of total inpatient capacity remains available across regional Primary Health Centers. Standard admission pipelines operating normally.'
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <div className="w-36 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Bed Load:</span>
                <span className={isEmergencyActive ? 'text-rose-700' : 'text-teal-700'}>{simData.bedOccupancy}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isEmergencyActive ? 'bg-rose-600' : 'bg-teal-500'
                  }`}
                  style={{ width: isEmergencyActive ? '82%' : '52%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical PHC List Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`h-5 w-5 ${isEmergencyActive ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {isEmergencyActive ? `Critical Emergency PHC Cluster List (${simData.criticalPhcList.length} Facilities Under Alert)` : `Monitored Facilities (${simData.criticalPhcList.length})`}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Status updated every 60s
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3.5">PHC Facility</th>
                  <th scope="col" className="px-4 py-3.5">District & State</th>
                  <th scope="col" className="px-3 py-3.5">Bed Occupancy</th>
                  <th scope="col" className="px-3 py-3.5">Medicine Stock Runway</th>
                  <th scope="col" className="px-4 py-3.5">Emergency Requirement / Action</th>
                  <th scope="col" className="px-3 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simData.criticalPhcList.map((phc, index) => {
                  const isCritical = phc.status === 'critical';

                  return (
                    <tr 
                      key={index}
                      className={`hover:bg-slate-50 transition ${isCritical ? 'bg-rose-50/20' : ''}`}
                    >
                      <td className="px-4 py-3.5 font-extrabold text-slate-900">
                        {phc.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {phc.district}, {phc.state}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="w-28">
                          <div className="flex justify-between text-[11px] font-bold mb-0.5">
                            <span>{phc.bedOccupancy}</span>
                            <span className={phc.occupancyPct > 85 ? 'text-rose-600' : 'text-slate-600'}>{phc.occupancyPct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${phc.occupancyPct > 85 ? 'bg-rose-600' : 'bg-teal-500'}`}
                              style={{ width: `${phc.occupancyPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                          isCritical ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {phc.medicineRunway}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium">
                        {phc.emergencyNeed}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isCritical 
                            ? 'bg-rose-600 text-white animate-pulse' 
                            : phc.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {phc.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommended Resource Transfers Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {isEmergencyActive ? 'Crisis-Response Automated Resource Transfer Recommendations' : 'Scheduled Rebalancing Transfers'}
            </h3>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            {simData.recommendedTransfers.length} Actionable Dispatch Protocols
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simData.recommendedTransfers.map((trf) => {
            const isAuthorized = authorizedTransfers.includes(trf.id);

            return (
              <div
                key={trf.id}
                className="rounded-xl border-2 border-teal-500/40 bg-white p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <span className="font-extrabold text-slate-900 text-sm">{trf.resource}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                      {trf.priority} PRIORITY
                    </span>
                  </div>

                  {/* Route Flow */}
                  <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Source:</span>
                      <span className="font-extrabold text-slate-900">{trf.from}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-rose-700 uppercase block">Destination:</span>
                      <span className="font-extrabold text-slate-900">{trf.to}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-600">Dispatch Quantity:</span>
                    <span className="font-extrabold text-teal-800 text-sm">
                      {trf.quantity} {trf.unit}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Clinical Impact:</strong> {trf.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    ETA: {trf.eta}
                  </span>

                  {isAuthorized ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Dispatched
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAuthorizeTransfer(trf.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 font-extrabold text-white text-xs hover:bg-teal-700 transition shadow-sm cursor-pointer"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Authorize Dispatch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
