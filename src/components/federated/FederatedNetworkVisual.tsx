import React, { useState } from 'react';
import { Network, Database, BrainCircuit, ShieldCheck, RefreshCw, Cpu, Server, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface FederatedNetworkVisualProps {
  activeClientsCount?: number;
  globalRounds?: number;
  modelAccuracy?: number;
  privacyEpsilon?: number;
}

export const FederatedNetworkVisual: React.FC<FederatedNetworkVisualProps> = ({
  activeClientsCount = 48,
  globalRounds = 142,
  modelAccuracy = 94.2,
  privacyEpsilon = 1.2,
}) => {
  const { t, isHindi } = useTranslation();
  const [activeStep, setActiveStep] = useState<number>(1); // 0: Local Training, 1: Aggregation, 2: Global Model Update
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const triggerRoundCycle = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(0);
    setTimeout(() => {
      setActiveStep(1);
      setTimeout(() => {
        setActiveStep(2);
        setTimeout(() => {
          setIsSimulating(false);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 p-6 shadow-2xl relative overflow-hidden">
      {/* Background Tech Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(13, 148, 136, 0.4) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shadow-glow-teal animate-float-slow">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {isHindi ? 'फेडरेटेड एआई आर्किटेक्चर एवं नोड पाइपलाइन' : 'Federated Privacy-Preserving Learning Flow'}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Lock className="h-2.5 w-2.5" /> DP-SGD (ε={privacyEpsilon})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isHindi
                ? 'स्थानीय PHC डेटा कभी केंद्र में नहीं भेजा जाता — केवल एन्क्रिप्टेड भार (Weights) एकत्रित होते हैं।'
                : 'Raw patient EHR remains strictly local — only encrypted neural gradients aggregate.'}
            </p>
          </div>
        </div>

        <button
          onClick={triggerRoundCycle}
          disabled={isSimulating}
          className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-teal-900/40 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          {isSimulating
            ? (isHindi ? 'सिंकिंग नोड्स...' : 'Synchronizing Nodes...')
            : (isHindi ? 'सिंक अनुकरण चलाएं' : 'Simulate Federated Sync')}
        </button>
      </div>

      {/* Interactive 3-Stage Pipeline Diagram */}
      <div className="relative z-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Stage 1: Edge Nodes (PHC Clients) */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            activeStep === 0 
              ? 'border-teal-400 bg-teal-950/40 shadow-glow-teal scale-[1.02]' 
              : 'border-slate-800 bg-slate-900/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" /> 1. {isHindi ? 'स्थानीय प्रशिक्षण' : 'Local Edge Training'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{activeClientsCount} PHC Nodes</span>
            </div>

            <div className="space-y-2">
              {['Guna PHC-04 (Tier-3)', 'Shivpuri PHC-03 (Tier-2)', 'Ashoknagar PHC-01 (Tier-3)'].map((phc, idx) => (
                <div key={phc} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                    <span className="font-semibold text-slate-200">{phc}</span>
                  </div>
                  <span className="text-[10px] text-teal-300 font-mono">
                    {activeStep === 0 ? 'Epoch 10/10' : 'Local ΔW Ready'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {isHindi ? 'डेटा डिवाइस पर सुरक्षित है' : 'Data remains on-premises'}
            </p>
          </div>

          {/* Center Connection / Aggregator Flow */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            activeStep === 1 
              ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-blue scale-[1.02]' 
              : 'border-slate-800 bg-slate-900/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> 2. {isHindi ? 'सुरक्षित एकत्रीकरण' : 'Secure Aggregation'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">FedAvg / SecAgg</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
              <div className="relative">
                <div className={`h-12 w-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 ${
                  activeStep === 1 ? 'animate-pulse' : ''
                }`}>
                  <Network className="h-6 w-6" />
                </div>
                {/* Flow particles */}
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 animate-ping opacity-75" />
              </div>
              <p className="text-xs font-bold text-cyan-200">
                {isHindi ? 'होमोमोर्फिक एन्क्रिप्टेड औसत' : 'Homomorphic Encrypted Averaging'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isHindi ? 'शोर (Gaussian Noise) इंजेक्शन लागू' : 'Differential Privacy clipping active'}
              </p>
            </div>
          </div>

          {/* Stage 3: Global Model Distribution */}
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            activeStep === 2 
              ? 'border-emerald-400 bg-emerald-950/40 shadow-glow-teal scale-[1.02]' 
              : 'border-slate-800 bg-slate-900/60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> 3. {isHindi ? 'वैश्विक मॉडल अपडेट' : 'Global Model Sync'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">v{globalRounds}.0</span>
            </div>

            <div className="space-y-2.5 p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isHindi ? 'सटीकता (F1-Score)' : 'Inference Accuracy'}</span>
                <span className="font-bold text-emerald-300 font-mono">{modelAccuracy}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${modelAccuracy}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                <span>{isHindi ? 'वैश्विक राउंड्स' : 'Trained Rounds'}</span>
                <span className="font-mono font-bold text-white">#{globalRounds}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
              {isHindi ? 'सभी PHC नोड्स में समकालिक मॉडल' : 'Distributed back to all 48 PHCs'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
