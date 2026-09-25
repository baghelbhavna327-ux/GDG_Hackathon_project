import React, { useState } from 'react';
import { 
  Building2, 
  Bed, 
  AlertTriangle, 
  PackageX, 
  PlusCircle, 
  RefreshCw, 
  ShieldCheck,
  Activity,
  HeartPulse,
  TrendingUp,
  Truck
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { PhcStatusMap } from '../components/maps/PhcStatusMap';
import { MedicineDemandChart } from '../components/charts/MedicineDemandChart';
import { PatientFootfallChart } from '../components/charts/PatientFootfallChart';
import { CriticalAlertsList } from '../components/dashboard/CriticalAlertsList';
import { AiRecommendationCard } from '../components/dashboard/AiRecommendationCard';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { mockPHCNodes } from '../data/mockData';
import { Hospital, AIAlert, ResourceTransfer, PriorityLevel, ResourceCategory, DemandForecastPoint } from '../types';

interface DashboardPageProps {
  hospitals: Hospital[];
  alerts: AIAlert[];
  forecastData: DemandForecastPoint[];
  transfers: ResourceTransfer[];
  onDismissAlert: (id: string) => void;
  onMitigateAlert: (id: string) => void;
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

export const DashboardPage: React.FC<DashboardPageProps> = ({
  hospitals,
  alerts,
  onDismissAlert,
  onMitigateAlert,
  onCreateTransfer,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              National Health Grid • Central Zone
            </span>
            <span className="text-xs text-slate-400 font-medium">Updated 2 mins ago</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Good Morning, Administrator
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            National Healthcare Resource Overview & Predictive Logistics Command
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Dispatch Rebalance
          </button>
        </div>
      </div>

      {/* 4 Required KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total PHCs */}
        <StatCard
          title="Total PHCs"
          value="1,250"
          subtitle="Across 52 district clusters"
          change="100% Online"
          changeType="increase"
          icon={Building2}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />

        {/* KPI 2: Available Beds */}
        <StatCard
          title="Available Beds"
          value="68%"
          subtitle="30,600 Free / 45,000 Capacity"
          change="Optimal Buffer"
          changeType="increase"
          icon={Bed}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        {/* KPI 3: Critical Alerts */}
        <StatCard
          title="Critical Alerts"
          value="24"
          subtitle="2 Urgent stockouts, 4 bed surges"
          change="Action Required"
          changeType="urgent"
          icon={AlertTriangle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />

        {/* KPI 4: PHCs with Low Stock */}
        <StatCard
          title="PHCs with Low Stock"
          value="87"
          subtitle="Medicine runway < 3 days"
          change="Requires Rebalance"
          changeType="decrease"
          icon={PackageX}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* SECTION 1 — PHC STATUS MAP */}
      <div className="space-y-2">
        <PhcStatusMap
          nodes={mockPHCNodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={(node) => setSelectedNodeId(node.id)}
          height="460px"
        />
      </div>

      {/* SECTION 2 & SECTION 3 — MEDICINE DEMAND & PATIENT FOOTFALL CHARTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SECTION 2 — MEDICINE DEMAND */}
        <MedicineDemandChart />

        {/* SECTION 3 — PATIENT FOOTFALL */}
        <PatientFootfallChart />
      </div>

      {/* SECTION 4 — CRITICAL ALERTS */}
      <div className="space-y-2">
        <CriticalAlertsList
          onResolveAlert={(id) => onMitigateAlert(id)}
        />
      </div>

      {/* SECTION 5 — AI REDISTRIBUTION RECOMMENDATION */}
      <div className="space-y-2">
        <AiRecommendationCard
          onExecuteDispatch={(rec) => {
            onCreateTransfer({
              originFacilityId: 'phc-05',
              destinationFacilityId: 'phc-01',
              resourceName: rec.item,
              category: 'Critical Pharmaceuticals',
              quantity: rec.quantity,
              unit: rec.unit,
              priority: 'emergency',
            });
          }}
        />
      </div>

      {/* Transfer Dispatch Modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
