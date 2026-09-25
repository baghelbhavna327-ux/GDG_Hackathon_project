import React, { useState } from 'react';
import { 
  Building2, 
  Bed, 
  Wind, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  PlusCircle, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { AlertBanner } from '../components/common/AlertBanner';
import { DemandForecastChart } from '../components/charts/DemandForecastChart';
import { ResourceUtilizationChart } from '../components/charts/ResourceUtilizationChart';
import { ResourceMap } from '../components/maps/ResourceMap';
import { HospitalStatusTable } from '../components/tables/HospitalStatusTable';
import { AIInsightsWidget } from '../components/ai/AIInsightsWidget';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { Hospital, AIAlert, ResourceTransfer, PriorityLevel, ResourceCategory, DemandForecastPoint } from '../types';
import { useNavigate } from 'react-router-dom';

interface OverviewPageProps {
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

export const OverviewPage: React.FC<OverviewPageProps> = ({
  hospitals,
  alerts,
  forecastData,
  transfers,
  onDismissAlert,
  onMitigateAlert,
  onCreateTransfer,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedMapHospitalId, setSelectedMapHospitalId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Aggregate statistics
  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const totalOccupied = hospitals.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const overallOccupancyPct = Math.round((totalOccupied / totalBeds) * 100);

  const totalIcu = hospitals.reduce((acc, h) => acc + h.icuTotal, 0);
  const totalIcuOccupied = hospitals.reduce((acc, h) => acc + h.icuOccupied, 0);
  const icuOccupancyPct = Math.round((totalIcuOccupied / totalIcu) * 100);

  const avgOxygen = Math.round(
    hospitals.reduce((acc, h) => acc + h.oxygenLevelPct, 0) / hospitals.length
  );

  const activeSurgeHospitals = hospitals.filter(
    h => h.status === 'surge' || h.status === 'critical'
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <SectionHeader
        title="Regional Healthcare Operations Grid"
        subtitle="Real-time predictive telemetry, ICU capacity load, and autonomous resource reallocation"
        badge="Live Telemetry"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Dispatch Resource Transfer
            </button>
          </div>
        }
      />

      {/* Critical Alert Banners */}
      <AlertBanner
        alerts={alerts}
        onDismiss={onDismissAlert}
        onMitigate={onMitigateAlert}
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Inpatient Bed Load"
          value={`${overallOccupancyPct}%`}
          subtitle={`${totalOccupied.toLocaleString()} / ${totalBeds.toLocaleString()} beds occupied`}
          change="+4.2% today"
          changeType="increase"
          icon={Bed}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="ICU & High Dependency Load"
          value={`${icuOccupancyPct}%`}
          subtitle={`${totalIcuOccupied} / ${totalIcu} ICU units in use`}
          change="Severe pressure"
          changeType="urgent"
          icon={Activity}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="Avg Medical Oxygen Level"
          value={`${avgOxygen}%`}
          subtitle="Buffer threshold safe > 60%"
          change="3.1 days reserve"
          changeType="neutral"
          icon={Wind}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Critical Surge Facilities"
          value={activeSurgeHospitals}
          subtitle="East Valley & Metro Apex alert"
          change="High surge risk"
          changeType="urgent"
          icon={ShieldAlert}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Interactive Map & AI Insights Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ResourceMap
            hospitals={hospitals}
            selectedHospitalId={selectedMapHospitalId}
            onSelectHospital={(id) => setSelectedMapHospitalId(id)}
            height="440px"
          />
        </div>
        <div className="lg:col-span-4">
          <AIInsightsWidget
            alerts={alerts}
            onAction={(alert) => {
              onMitigateAlert(alert.id);
            }}
          />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DemandForecastChart data={forecastData} />
        <ResourceUtilizationChart hospitals={hospitals} />
      </div>

      {/* Facility Breakdown Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Network Resource Status</h3>
            <p className="text-xs text-slate-500">Live bed count, ventilator allocation, and surge risk index</p>
          </div>
          <button
            onClick={() => navigate('/hospitals')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
          >
            View all facility details
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <HospitalStatusTable
          hospitals={hospitals}
          onSelectHospital={(h) => setSelectedMapHospitalId(h.id)}
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
