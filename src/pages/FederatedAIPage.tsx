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

export const FederatedAIPage: React.FC = () => {
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
      setError('Federated AI service is currently unavailable.');
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
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-indigo-900 gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-indigo-700 shrink-0" />
          <span>
            <strong>Federated Learning Demo (Synthetic Datasets):</strong> Demonstrates privacy-preserving multi-state parameter aggregation using Federated Averaging (FedAvg). Local state data remains at simulated client nodes.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold uppercase text-[10px] bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
            Federated Learning Demo
          </span>
          <span className="font-bold text-[10px] bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-800">
            Demo/Synthetic Data
          </span>
        </div>
      </div>

      {/* Main Page Header */}
      <SectionHeader
        title="Federated AI Network Command"
        subtitle="Decentralized multi-state machine learning orchestrator aggregating local Primary Health Center demand models via Federated Averaging (FedAvg)"
        badge="Multi-State FedAvg"
        action={
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
              {isConnected ? 'CONNECTED' : 'UNAVAILABLE'}
            </div>
            <button
              onClick={loadMetadata}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-teal-600 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Network
            </button>
          </div>
        }
      />

      {/* Error Alert with Retry */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-rose-700 mt-0.5">Please ensure Python FastAPI microservice is listening on port 8000.</p>
            </div>
          </div>
          <button
            onClick={loadMetadata}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Participating State Nodes"
          value={isLoading ? '...' : (networkData?.state_nodes.length ?? 3)}
          subtitle="MP, Rajasthan, Gujarat"
          change="3 State Clients"
          changeType="neutral"
          icon={Network}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />

        <StatCard
          title="Federated Rounds"
          value={isLoading ? '...' : (networkData?.global_model.total_rounds ?? 3)}
          subtitle="Convergence completed"
          change="FedAvg Aggregation"
          changeType="increase"
          icon={Cpu}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Global Model R² Accuracy"
          value={isLoading ? '...' : (networkData?.global_model.metrics.r2 ? `${(networkData.global_model.metrics.r2 * 100).toFixed(1)}%` : '77.8%')}
          subtitle={`MAE: ${networkData?.global_model.metrics.mae ?? 4.48} • RMSE: ${networkData?.global_model.metrics.rmse ?? 5.25}`}
          change="Multi-State Aggregated"
          changeType="increase"
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Data Pooling Protocol"
          value="Zero Raw Data Centered"
          subtitle="Parameter exchange only"
          change="Sovereign Nodes"
          changeType="increase"
          icon={ShieldCheck}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Visual Federated Learning Flow Diagram */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Decentralized Federated Aggregation Flow
            </h3>
          </div>
          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
            Algorithm: Federated Averaging (FedAvg)
          </span>
        </div>

        {/* Interactive Node Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center py-2">
          {/* Column 1: 3 Participating State Local Nodes */}
          <div className="md:col-span-4 space-y-3">
            {/* MP Client */}
            <div className="rounded-xl border-2 border-teal-200 bg-gradient-to-r from-teal-50/50 to-white p-3.5 shadow-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs">Madhya Pradesh Client Node</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  600 Samples • Local R²: <strong className="text-teal-700">0.8661</strong>
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                W, b Extracted
              </span>
            </div>

            {/* Rajasthan Client */}
            <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50/50 to-white p-3.5 shadow-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs">Rajasthan Client Node</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  600 Samples • Local R²: <strong className="text-cyan-700">0.5325</strong>
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                W, b Extracted
              </span>
            </div>

            {/* Gujarat Client */}
            <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-white p-3.5 shadow-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs">Gujarat Client Node</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  600 Samples • Local R²: <strong className="text-emerald-700">0.9339</strong>
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
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
              <span className="text-xs font-extrabold text-slate-900 block">
                FedAvg Parameter Server
              </span>
              <span className="text-[11px] text-slate-500 block">
                Weighted parameter averaging across local client weights
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              <Lock className="h-3 w-3 text-teal-600" />
              Zero Dataset Upload
            </div>
          </div>

          {/* Column 3: Global Aggregated Model */}
          <div className="md:col-span-4 rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50/60 to-white p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-200">
                Global Model Node
              </span>
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Federated Global Model</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Artifact: <code className="text-indigo-900 bg-indigo-50 px-1 py-0.5 rounded text-[10px]">models/global_model.pkl</code>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-1.5 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">MAE</span>
                <span className="font-extrabold text-slate-900">{networkData?.global_model.metrics.mae ?? '4.482'}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">RMSE</span>
                <span className="font-extrabold text-slate-900">{networkData?.global_model.metrics.rmse ?? '5.252'}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">R² Score</span>
                <span className="font-extrabold text-indigo-700">{networkData?.global_model.metrics.r2 ?? '0.7775'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Model Performance Table & Global Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Performance Breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                State Node Verified Training Performance
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              3 Simulated Nodes Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3.5 py-3">Participating State</th>
                  <th scope="col" className="px-3 py-3">Local Samples</th>
                  <th scope="col" className="px-3 py-3">MAE</th>
                  <th scope="col" className="px-3 py-3">RMSE</th>
                  <th scope="col" className="px-3 py-3">R² Score</th>
                  <th scope="col" className="px-3 py-3 text-right">Training Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {networkData?.state_nodes.map((node, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="px-3.5 py-3 font-extrabold text-slate-900 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-teal-600" />
                      {node.state}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {node.sample_count} records
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      {node.mae.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      {node.rmse.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {node.r2.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
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
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                Global Model Artifact
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              FedAvg
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Model Name:</span>
              <span className="font-bold text-slate-900">{networkData?.global_model.name ?? 'Global Federated Model'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Aggregation Strategy:</span>
              <span className="font-bold text-slate-900">{networkData?.aggregation_method ?? 'Federated Averaging'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Federated Rounds:</span>
              <span className="font-bold text-slate-900">{networkData?.global_model.total_rounds ?? 3} Rounds</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Model Status:</span>
              <span className="font-extrabold text-emerald-700">READY (Serialized)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Participating Nodes:</span>
              <span className="font-bold text-slate-900">MP, RJ, GJ (3 States)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Artifact Path:</span>
              <span className="font-mono text-[10px] text-slate-700">models/global_model.pkl</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Global Model Inference Demo */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Global Model Real-Time Inference Demo
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Querying Aggregated Multi-State Parameters
          </span>
        </div>

        {/* Input Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State Node</label>
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

          {/* District */}
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

          {/* PHC */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PHC Center</label>
            <select
              value={selectedPhc}
              onChange={(e) => setSelectedPhc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
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

        {/* Global Inference Output Cards */}
        {inferenceResult && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-1">
              <span className="text-[11px] font-bold text-teal-800 uppercase block">Daily Consumption</span>
              <span className="text-xl font-extrabold text-slate-900">{inferenceResult.predicted_daily_demand} {unitValue}</span>
              <span className="text-[10px] text-slate-500 block">Aggregated FedAvg Rate</span>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase block">7-Day Demand</span>
              <span className="text-xl font-extrabold text-slate-900">{inferenceResult.predicted_7_day_demand} {unitValue}</span>
              <span className="text-[10px] text-slate-500 block">Weekly Buffer Forecast</span>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-1">
              <span className="text-[11px] font-bold text-indigo-800 uppercase block">Stock Runway</span>
              <span className="text-xl font-extrabold text-slate-900">{inferenceResult.days_remaining} Days</span>
              <span className="text-[10px] text-slate-500 block">Current Stock: {inferenceResult.current_stock} {unitValue}</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Stock-Out Risk</span>
              <span className={`text-xl font-extrabold ${
                inferenceResult.stock_out_risk === 'CRITICAL' ? 'text-rose-600' : 'text-amber-700'
              }`}>
                {inferenceResult.stock_out_risk}
              </span>
              <span className="text-[10px] text-slate-500 block">Shortage: {inferenceResult.shortage_quantity} {unitValue}</span>
            </div>
          </div>
        )}
      </div>

      {/* How Federated Learning Works Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Layers className="h-4 w-4 text-teal-600" />
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
            How Federated Learning Works in HealthChain AI
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-4 space-y-2 border border-slate-200">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-extrabold text-xs">1</span>
            <h4 className="font-extrabold text-slate-900">Local State Training</h4>
            <p className="text-slate-600 leading-relaxed">
              Each participating state trains a local model using its own dataset. Raw training datasets are not required to be centrally pooled for this federated training workflow.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 space-y-2 border border-slate-200">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-xs">2</span>
            <h4 className="font-extrabold text-slate-900">Parameter Aggregation (FedAvg)</h4>
            <p className="text-slate-600 leading-relaxed">
              Only numeric model parameter weights (W and b) are transmitted to the server. The server aggregates updates using Federated Averaging to create a shared global model.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 space-y-2 border border-slate-200">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-extrabold text-xs">3</span>
            <h4 className="font-extrabold text-slate-900">National-Scale Forecasting</h4>
            <p className="text-slate-600 leading-relaxed">
              The resulting global model generalizes across clinical patterns in multiple states without compromising state-level data sovereignty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
