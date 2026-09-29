import React, { useState, useEffect, useMemo } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatCard } from '../components/common/StatCard';
import { mockIndiaPHCs } from '../data/indiaPhcData';
import { mockMedicineInventory } from '../data/medicineInventoryData';
import { 
  Network, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Database, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  BrainCircuit, 
  Lock, 
  Share2, 
  SlidersHorizontal,
  Info,
  Loader2,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { 
  fetchFederatedMetadata, 
  fetchFederatedPrediction, 
  FederatedMetadataResponse, 
  FederatedPredictionData 
} from '../services/aiPredictionService';
import { useTranslation } from '../i18n';
import { FederatedNetworkVisual } from '../components/federated/FederatedNetworkVisual';

export const FederatedAIPage: React.FC = () => {
  const { t, isHindi } = useTranslation();
  // 1. Federated Network State
  const [networkData, setNetworkData] = useState<FederatedMetadataResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Interactive Global Model Inference State
  const [selectedState, setSelectedState] = useState<string>('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Guna');
  const [selectedPhc, setSelectedPhc] = useState<string>('PHC Guna Central');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('Paracetamol');
  const [isInferenceLoading, setIsInferenceLoading] = useState<boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<FederatedPredictionData | null>(null);

  // Load Verified Federated AI Metadata
  const loadMetadata = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFederatedMetadata();
      setNetworkData(data);
    } catch (err: any) {
      console.error('Federated metadata fetch error:', err);
      setError(err?.message || (isHindi ? 'फेडरेटेड AI सेवा वर्तमान में अनुपलब्ध है।' : 'Federated AI service is currently unavailable.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  // Filtered dropdown lists (Cascading)
  const statesList = useMemo(() => ['Madhya Pradesh', 'Rajasthan', 'Gujarat'], []);

  const districtsList = useMemo(() => {
    const list = Array.from(
      new Set(mockIndiaPHCs.filter(p => p.state === selectedState).map(p => p.district))
    ).sort();
    return list.length > 0 ? list : ['Guna', 'Bhopal', 'Indore'];
  }, [selectedState]);

  const phcsList = useMemo(() => {
    const list = mockIndiaPHCs
      .filter(p => p.state === selectedState && p.district === selectedDistrict)
      .map(p => p.name);
    if (list.length > 0) return list;
    const stateFallback = mockIndiaPHCs.filter(p => p.state === selectedState).map(p => p.name);
    return stateFallback.length > 0 ? stateFallback : [`${selectedDistrict} PHC-01`];
  }, [selectedState, selectedDistrict]);

  const medicinesList = useMemo(() => [
    'Paracetamol', 'Amoxicillin', 'ORS', 'Azithromycin', 'Normal Saline (0.9% NaCl)'
  ], []);

  // Cascading state handlers
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

  // Localized inventory lookup
  const matchingPhc = useMemo(() => {
    return mockIndiaPHCs.find(
      (p) => p.name.toLowerCase() === selectedPhc.toLowerCase() && p.state.toLowerCase() === selectedState.toLowerCase()
    ) || mockIndiaPHCs.find(
      (p) => p.name.toLowerCase() === selectedPhc.toLowerCase()
    ) || mockIndiaPHCs[0];
  }, [selectedPhc, selectedState]);

  const matchingInventory = useMemo(() => {
    return mockMedicineInventory.find(
      (item) =>
        item.medicine.toLowerCase() === selectedMedicine.toLowerCase() &&
        item.phc.toLowerCase() === selectedPhc.toLowerCase()
    ) || mockMedicineInventory.find(
      (item) =>
        item.medicine.toLowerCase() === selectedMedicine.toLowerCase() &&
        item.state.toLowerCase() === selectedState.toLowerCase()
    );
  }, [selectedMedicine, selectedPhc, selectedState]);

  const patientCountValue = matchingPhc?.todaysPatients ?? 150;
  const currentStockValue = matchingInventory?.currentStock ?? Math.round(patientCountValue * 0.85);
  const previousConsumptionValue = matchingInventory?.dailyUsage ?? Math.max(10, Math.round(patientCountValue * 0.18));
  const unitValue = matchingInventory?.unit ?? 'units';

  // Run Global Model Inference
  const handleRunInference = async () => {
    setIsInferenceLoading(true);
    const now = new Date();

    try {
      const pred = await fetchFederatedPrediction({
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
      });
      setInferenceResult(pred);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setIsInferenceLoading(false);
    }
  };

  useEffect(() => {
    if (networkData) {
      handleRunInference();
    }
  }, [selectedPhc, selectedMedicine, selectedState, selectedDistrict]);

  const isConnected = networkData?.status === 'CONNECTED';

  return (
    <div className="space-y-6">
      {/* Simulation & Prototype Notice Pill */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-indigo-700 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>{isHindi ? "फेडरेटेड लर्निंग डेमो (सिंथेटिक डेटासेट):" : "Federated Learning Demo (Synthetic Datasets):"}</strong> {isHindi ? "फेडरेटेड एवरेजिंग (FedAvg) का उपयोग करके गोपनीयता-संरक्षण बहु-राज्य पैरामीटर एकत्रीकरण प्रदर्शित करता है। स्थानीय राज्य डेटा क्लाइंट नोड्स पर ही सुरक्षित रहता है।" : "Demonstrates privacy-preserving multi-state parameter aggregation using Federated Averaging (FedAvg). Local state data remains at simulated client nodes."}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold uppercase text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded">
            {isHindi ? "फेडरेटेड लर्निंग डेमो" : "Federated Learning Demo"}
          </span>
          <span className="font-bold text-[10px] bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded text-indigo-800 dark:text-indigo-300">
            {isHindi ? "डेमो/सिंथेटिक डेटा" : "Demo/Synthetic Data"}
          </span>
        </div>
      </div>

      {/* Main Page Header */}
      <SectionHeader
        title={t('page.federatedAi.title')}
        subtitle={t('page.federatedAi.subtitle')}
        badge="Multi-State FedAvg"
        action={
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
              isConnected 
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
              {isConnected ? (isHindi ? 'कनेक्टेड' : 'CONNECTED') : (isHindi ? 'अनुपलब्ध' : 'UNAVAILABLE')}
            </div>
            <button
              onClick={loadMetadata}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-teal-600 dark:text-teal-400 ${isLoading ? 'animate-spin' : ''}`} />
              {isHindi ? "नेटवर्क सिंक" : "Sync Network"}
            </button>
          </div>
        }
      />

      {/* Error Alert with Retry */}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-rose-700 dark:text-rose-300 mt-0.5">Please ensure Python FastAPI microservice is listening on port 8000.</p>
            </div>
          </div>
          <button
            onClick={loadMetadata}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('federated.activeNodes')}
          value={isLoading ? '...' : (networkData?.state_nodes.length ?? 3)}
          subtitle="MP, Rajasthan, Gujarat"
          change="3 State Clients"
          changeType="neutral"
          icon={Network}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />

        <StatCard
          title={t('federated.currentRound')}
          value={isLoading ? '...' : (networkData?.global_model.total_rounds ?? 3)}
          subtitle={isHindi ? "अभिसरण पूर्ण हुआ" : "Convergence completed"}
          change="FedAvg Aggregation"
          changeType="increase"
          icon={Cpu}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title={t('federated.globalModelAccuracy')}
          value={isLoading ? '...' : (networkData?.global_model.metrics.r2 ? `${(networkData.global_model.metrics.r2 * 100).toFixed(1)}%` : '77.8%')}
          subtitle={`MAE: ${networkData?.global_model.metrics.mae ?? 4.48} • RMSE: ${networkData?.global_model.metrics.rmse ?? 5.25}`}
          change={isHindi ? "बहु-राज्य एकत्रित" : "Multi-State Aggregated"}
          changeType="increase"
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title={isHindi ? "डेटा पूलिंग प्रोटोकॉल" : "Data Pooling Protocol"}
          value={isHindi ? "शून्य कच्चा डेटा साझा" : "Zero Raw Data Centered"}
          subtitle={isHindi ? "केवल पैरामीटर आदान-प्रदान" : "Parameter exchange only"}
          change="Sovereign Nodes"
          changeType="increase"
          icon={ShieldCheck}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Animated Interactive Federated Flow Visual */}
      <FederatedNetworkVisual
        activeClientsCount={networkData?.global_model.participating_states.length ? networkData.global_model.participating_states.length * 16 : 48}
        globalRounds={networkData?.global_model.total_rounds ?? 142}
        modelAccuracy={networkData?.global_model.metrics.r2 ? parseFloat((networkData.global_model.metrics.r2 * 100).toFixed(1)) : 94.2}
      />

      {/* Visual Federated Learning Flow Diagram */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
              Decentralized Federated Aggregation Flow
            </h3>
          </div>
          <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 self-start sm:self-auto">
            Algorithm: Federated Averaging (FedAvg)
          </span>
        </div>

        {/* Interactive Node Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center py-2">
          {/* Column 1: 3 Participating State Local Nodes */}
          <div className="md:col-span-4 space-y-3">
            {/* MP Client */}
            <div className="rounded-xl border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-r from-teal-50/50 to-white dark:from-teal-950/40 dark:to-slate-800 p-3.5 shadow-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">Madhya Pradesh Client Node</h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  600 Samples • Local R²: <strong className="text-teal-700 dark:text-teal-300">0.8661</strong>
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                W, b Extracted
              </span>
            </div>

            {/* Rajasthan Client */}
            <div className="rounded-xl border-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-r from-cyan-50/50 to-white dark:from-cyan-950/40 dark:to-slate-800 p-3.5 shadow-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">Rajasthan Client Node</h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  600 Samples • Local R²: <strong className="text-cyan-700 dark:text-cyan-300">0.5325</strong>
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                W, b Extracted
              </span>
            </div>

            {/* Gujarat Client */}
            <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/40 dark:to-slate-800 p-3.5 shadow-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">Gujarat Client Node</h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  600 Samples • Local R²: <strong className="text-emerald-700 dark:text-emerald-300">0.9339</strong>
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                W, b Extracted
              </span>
            </div>
          </div>

          {/* Column 2: Central Aggregation Connector */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-3 text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md animate-pulse">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">
                FedAvg Parameter Server
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Weighted parameter averaging across local client weights
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              <Lock className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              Zero Dataset Upload
            </div>
          </div>

          {/* Column 3: Global Aggregated Model */}
          <div className="md:col-span-4 rounded-xl border-2 border-indigo-300 dark:border-indigo-800 bg-gradient-to-r from-indigo-50/60 to-white dark:from-indigo-950/40 dark:to-slate-800 p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                Global Model Node
              </span>
              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Federated Global Model</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Artifact: <code className="text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1 py-0.5 rounded text-[10px]">models/global_model.pkl</code>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-slate-900/80 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold">MAE</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">{networkData?.global_model.metrics.mae ?? '4.482'}</span>
              </div>
              <div className="bg-white dark:bg-slate-900/80 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold">RMSE</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">{networkData?.global_model.metrics.rmse ?? '5.252'}</span>
              </div>
              <div className="bg-white dark:bg-slate-900/80 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold">R² Score</span>
                <span className="font-extrabold text-indigo-700 dark:text-indigo-300">{networkData?.global_model.metrics.r2 ?? '0.7775'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Model Performance Table & Global Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Performance Breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
                State Node Verified Training Performance
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              3 Simulated Nodes Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[11px] text-slate-500 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-3.5 py-3">Participating State</th>
                  <th scope="col" className="px-3 py-3">Local Samples</th>
                  <th scope="col" className="px-3 py-3">MAE</th>
                  <th scope="col" className="px-3 py-3">RMSE</th>
                  <th scope="col" className="px-3 py-3">R² Score</th>
                  <th scope="col" className="px-3 py-3 text-right">Training Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {networkData?.state_nodes.map((node, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-3.5 py-3 font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      {node.state}
                    </td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                      {node.sample_count} records
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {node.mae.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {node.rmse.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        {node.r2.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {node.training_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Model Architecture & Metadata Details */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
                Global Model Artifact
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              FedAvg
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Model Name:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{networkData?.global_model.name ?? 'Global Federated Model'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Aggregation Strategy:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{networkData?.aggregation_method ?? 'Federated Averaging'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Federated Rounds:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{networkData?.global_model.total_rounds ?? 3} Rounds</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Model Status:</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">READY (Serialized)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Participating Nodes:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">MP, RJ, GJ (3 States)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Artifact Path:</span>
              <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300">models/global_model.pkl</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Global Model Inference Demo */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
              Global Model Real-Time Inference Demo
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Querying Aggregated Multi-State Parameters
          </span>
        </div>

        {/* Input Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State Node</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* PHC */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PHC Center</label>
            <select
              value={selectedPhc}
              onChange={(e) => setSelectedPhc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {phcsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Medicine */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Medicine Formulary</label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {medicinesList.map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Inference Output Cards */}
        {inferenceResult && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 p-4 space-y-1">
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase block">Daily Consumption</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{inferenceResult.predicted_daily_demand} {unitValue}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Aggregated FedAvg Rate</span>
            </div>

            <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 p-4 space-y-1">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase block">7-Day Demand</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{inferenceResult.predicted_7_day_demand} {unitValue}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Weekly Buffer Forecast</span>
            </div>

            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-1">
              <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase block">Stock Runway</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{inferenceResult.days_remaining} Days</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Current Stock: {inferenceResult.current_stock} {unitValue}</span>
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-4 space-y-1">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase block">Stock-Out Risk</span>
              <span className={`text-xl font-extrabold ${
                inferenceResult.stock_out_risk === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
              }`}>
                {inferenceResult.stock_out_risk}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Shortage: {inferenceResult.shortage_quantity} {unitValue}</span>
            </div>
          </div>
        )}
      </div>

      {/* How Federated Learning Works Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
            How Federated Learning Works in HealthChain AI
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 border border-slate-200 dark:border-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-extrabold text-xs">1</span>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Local State Training</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Each participating state trains a local model using its own dataset. Raw training datasets are not required to be centrally pooled for this federated training workflow.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 border border-slate-200 dark:border-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-xs">2</span>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Parameter Aggregation (FedAvg)</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Only numeric model parameter weights (W and b) are transmitted to the server. The server aggregates updates using Federated Averaging to create a shared global model.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 border border-slate-200 dark:border-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-extrabold text-xs">3</span>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100">National-Scale Forecasting</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The resulting global model generalizes across clinical patterns in multiple states without compromising state-level data sovereignty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
