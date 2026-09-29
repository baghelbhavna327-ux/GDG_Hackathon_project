import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, Siren, Pill } from 'lucide-react';

export interface DemoScenario {
  id: string;
  name: string;
  category: 'critical' | 'surge' | 'balanced';
  phcName: string;
  state: string;
  district: string;
  medicine: string;
  tag: string;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: 'sc-guna-crit',
    name: '🔴 Guna PHC-04: Critical Paracetamol Stockout',
    category: 'critical',
    phcName: 'Guna PHC-04',
    state: 'Madhya Pradesh',
    district: 'Guna',
    medicine: 'Paracetamol',
    tag: 'Critical Shortage'
  },
  {
    id: 'sc-shivpuri-surge',
    name: '🚨 Shivpuri PHC-03: Respiratory Outbreak Surge',
    category: 'surge',
    phcName: 'Shivpuri PHC-03',
    state: 'Madhya Pradesh',
    district: 'Shivpuri',
    medicine: 'Amoxicillin',
    tag: '+40% Outbreak'
  },
  {
    id: 'sc-pune-depot',
    name: '🟢 Pune Central: Surplus Buffer Depot',
    category: 'balanced',
    phcName: 'PHC Pune East',
    state: 'Maharashtra',
    district: 'Pune',
    medicine: 'ORS',
    tag: 'Balanced Buffer'
  }
];

interface DemoScenarioBarProps {
  activeScenarioId?: string;
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  activeScenarioId,
  onSelectScenario
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-900 border border-teal-500/30 text-white text-xs shadow-md">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-500 text-slate-950 font-bold shrink-0">
          <Sparkles className="h-3 w-3 fill-current" />
        </span>
        <span className="font-extrabold text-teal-300 text-xs tracking-wide uppercase">
          Quick Demo Scenarios:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {demoScenarios.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectScenario(sc)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-teal-500 text-slate-950 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              <span>{sc.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
