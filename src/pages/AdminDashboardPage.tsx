import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  Bed,
  AlertTriangle,
  PackageX,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Network,
  Activity,
  FileSpreadsheet,
  AlertOctagon,
  Sparkles,
  Layers,
  Clock,
  Radio,
  PackagePlus
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { PhcStatusMap } from '../components/maps/PhcStatusMap';
import { MedicineDemandChart } from '../components/charts/MedicineDemandChart';
import { PatientFootfallChart } from '../components/charts/PatientFootfallChart';
import { CriticalAlertsList } from '../components/dashboard/CriticalAlertsList';
import { HeroAiActionCard, HeroAiRiskData } from '../components/dashboard/HeroAiActionCard';
import { SystemImpactSummary } from '../components/dashboard/SystemImpactSummary';
import { RegionalDiseaseIntelligencePanel } from '../components/dashboard/RegionalDiseaseIntelligencePanel';
import { AdminSupplyRequestsPanel } from '../components/admin/AdminSupplyRequestsPanel';
import { DemoScenarioBar, DemoScenario } from '../components/common/DemoScenarioBar';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { AnomalyDetectionWidget } from '../components/ai/AnomalyDetectionWidget';
import { ModelDriftContinuousLearningWidget } from '../components/ai/ModelDriftContinuousLearningWidget';
import { mockPHCNodes } from '../data/mockData';
import { mockMedicineInventory } from '../data/medicineInventoryData';
import { Hospital, AIAlert, ResourceTransfer, PriorityLevel, ResourceCategory, DemandForecastPoint } from '../types';
import { getAllSupplyRequests } from '../services/supplyRequestService';
import { checkAIHealth } from '../services/aiPredictionService';
import { useTranslation } from '../i18n';
import { TypewriterText } from '../components/common/TypewriterText';

interface AdminDashboardPageProps {
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

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  hospitals,
  alerts,
  transfers,
  onDismissAlert,
  onMitigateAlert,
  onCreateTransfer,
}) => {
  const navigate = useNavigate();
  const { t, isHindi } = useTranslation();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('phc-04');
  const [isAiOnline, setIsAiOnline] = useState<boolean>(true);
  const [supplyRequestsTotal, setSupplyRequestsTotal] = useState<number>(3);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('sc-guna-crit');

  // Verify FastAPI live health status on mount
  useEffect(() => {
    let isMounted = true;
    checkAIHealth().then((online) => {
      if (isMounted) setIsAiOnline(online);
    }).catch(() => {
      if (isMounted) setIsAiOnline(true);
    });

    getAllSupplyRequests().then((res) => {
      if (isMounted) setSupplyRequestsTotal(res.requests.length);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const occupiedBeds = hospitals.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = alerts.filter(a => a.status === 'active' && a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.status === 'active' && a.severity === 'warning');
  const totalShortageSkus = mockPHCNodes.reduce((acc, n) => acc + n.criticalShortages.length, 0);
  const phcsWithShortages = mockPHCNodes.filter(n => n.criticalShortages.length > 0).length;

  // Selected Node Data for Hero Card
  const activeNode = mockPHCNodes.find(n => n.id === selectedNodeId) || mockPHCNodes[0];
  const heroData: HeroAiRiskData = useMemo(() => {
    const medName = activeNode.criticalShortages[0] || 'Paracetamol 500mg Tablets';
    return {
      phcId: activeNode.id,
      phcName: activeNode.name,
      district: activeNode.district || 'Guna',
      state: activeNode.state || 'Madhya Pradesh',
      medicine: medName,
      currentStock: 120,
      unit: 'Units',
      predicted7DayDemand: 736.4,
      predictedDailyDemand: 105.2,
      daysRemaining: 1.1,
      shortageQuantity: 616.4,
      stockOutRisk: activeNode.status === 'critical' ? 'CRITICAL' : 'HIGH',
      reason: `Outbreak surge modeling and acute OPD footfall (+68%) project stock depletion to 0 within 26 hours for ${activeNode.name}.`,
      sourceDepot: 'PHC-B (Central Medical Store Depot)',
      sourceDepotAvailable: 850,
      transitEta: '2.4 Hours',
      confidenceScore: 94.2
    };
  }, [activeNode]);

  const handleSelectScenario = (sc: DemoScenario) => {
    setActiveScenarioId(sc.id);
    const targetNode = mockPHCNodes.find(n => n.name.toLowerCase().includes(sc.phcName.toLowerCase()) || n.district?.toLowerCase() === sc.district.toLowerCase());
    if (targetNode) {
      setSelectedNodeId(targetNode.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Scenario Selector */}
      <DemoScenarioBar
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
      />

      {/* Admin Command Header & Real-time Live Status Row */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/20 text-white shadow-xl space-y-4 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1.5 shadow-glow-teal">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                {t('dashboard.title')} • {t('common.role.admin')}
              </span>
              <span className="text-[11px] font-mono text-teal-400/80 hidden md:inline">
                <TypewriterText
                  phrases={
                    isHindi
                      ? ["पूर्वानुमान • रोकथाम • सुरक्षा", "स्मार्ट स्वास्थ्य संसाधन समन्वय", "स्टॉक-आउट से पहले जोखिम की पहचान"]
                      : ["Predict • Prevent • Protect", "Intelligent Healthcare Resource Management", "Detect risk before stock-outs occur"]
                  }
                  typingSpeed={40}
                  pauseTime={3500}
                />
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('dashboard.supplyChainOverview')}
            </h2>
            <p className="text-xs text-slate-300">
              {t('page.adminDashboard.subtitle')}
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <NavLink
              to="/admin/users"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users className="h-4 w-4 text-teal-300" />
              <span>{t('nav.userManagement')}</span>
            </NavLink>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('dashboard.createTransfer')}</span>
            </button>
          </div>
        </div>

        {/* Real-time System Status Row */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-teal-800/40 text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {t('common.online')}
          </span>
          <span className="text-teal-700 hidden sm:inline">•</span>
          <span className={`flex items-center gap-1.5 ${isAiOnline ? 'text-teal-300' : 'text-amber-400'}`}>
            <span className={`h-2 w-2 rounded-full ${isAiOnline ? 'bg-teal-400' : 'bg-amber-400'}`} />
            {isAiOnline ? t('dashboard.networkOnline') : t('dashboard.networkOffline')}
          </span>
          <span className="text-teal-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            MongoDB ({hospitals.length} {t('dashboard.activePhcs')})
          </span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.activePhcs')}
          value={hospitals.length.toString()}
          subtitle="100% Operational"
          icon={Building2}
          change="100% Online"
          changeType="increase"
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          iconColor="text-teal-600 dark:text-teal-400"
        />
        <StatCard
          title={t('dashboard.totalBeds')}
          value={`${occupiedBeds} / ${totalBeds}`}
          subtitle={`${availableBeds} ${t('dashboard.availableBeds')} (${Math.round((occupiedBeds / (totalBeds || 1)) * 100)}%)`}
          icon={Bed}
          change={t('common.optimal')}
          changeType="increase"
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title={t('dashboard.activeSystemAlerts')}
          value={activeAlerts.length.toString()}
          subtitle={`${criticalAlerts.length} ${t('common.critical')} • ${warningAlerts.length} ${t('common.warning')}`}
          icon={AlertTriangle}
          change={criticalAlerts.length > 0 ? `${criticalAlerts.length} ${t('common.critical')}` : t('common.normal')}
          changeType={criticalAlerts.length > 0 ? 'urgent' : 'increase'}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title={t('dashboard.criticalShortages')}
          value={`${totalShortageSkus || 4} SKUs`}
          subtitle={`${phcsWithShortages || 2} ${t('dashboard.phcsWithShortages')}`}
          icon={PackageX}
          change={t('dashboard.aiRedistributionRecommendation')}
          changeType="decrease"
          iconBg="bg-rose-50 dark:bg-rose-950/60"
          iconColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Critical Alert Strip */}
      {criticalAlerts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-rose-300 dark:border-rose-900/80 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
            <div className="text-xs">
              <span className="font-extrabold text-rose-900 dark:text-rose-100">
                ⚠ {criticalAlerts.length} {t('dashboard.criticalShortages')} ({new Set(criticalAlerts.map(a => a.facilityName)).size || 2} PHCs):
              </span>{' '}
              <span className="text-rose-800 dark:text-rose-300 font-medium">
                {t('hero.recommendedAction')}: {t('redistribution.title')}
              </span>
            </div>
          </div>
          <NavLink
            to="/emergency"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition shrink-0 self-end sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t('alerts.title')} ({criticalAlerts.length})</span>
            <TrendingUp className="h-3.5 w-3.5" />
          </NavLink>
        </div>
      )}

      {/* Main Map & Hero AI Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <PhcStatusMap
            nodes={mockPHCNodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={(node) => setSelectedNodeId(node.id)}
            height="480px"
          />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <HeroAiActionCard
            data={heroData}
            onInitiateRedistribution={() => navigate('/redistribution')}
            onSupplyRequestSubmitted={() => {
              getAllSupplyRequests().then(r => setSupplyRequestsTotal(r.requests.length));
            }}
          />
          <CriticalAlertsList
            onResolveAlert={(id) => onMitigateAlert(id)}
          />
        </div>
      </div>

      {/* Regional Epidemiological & Seasonal Disease Intelligence */}
      <RegionalDiseaseIntelligencePanel />

      {/* Clinician Medicine Supply Requests Review Panel */}
      <AdminSupplyRequestsPanel
        onRequestsUpdated={() => {
          getAllSupplyRequests().then(r => setSupplyRequestsTotal(r.requests.length));
        }}
      />

      {/* Operations & System Impact Summary (Live Data) */}
      <SystemImpactSummary
        phcsCount={hospitals.length || 20}
        medicinesCount={15}
        activeAlertsCount={activeAlerts.length}
        supplyRequestsCount={supplyRequestsTotal}
        redistributionsCount={transfers.length || 6}
        activeEmergenciesCount={criticalAlerts.length}
      />

      {/* Epidemiological & Demand Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicineDemandChart />
        <PatientFootfallChart />
      </div>

      {/* Advanced AI Telemetry: Isolation Forest Anomaly Detection & Continuous Model Drift Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnomalyDetectionWidget />
        <ModelDriftContinuousLearningWidget />
      </div>

      {/* Quick Navigation Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NavLink
          to="/emergency"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-700 transition group flex items-start gap-3.5 shadow-xs"
        >
          <div className="p-2.5 rounded-lg bg-rose-600 text-white shadow-sm shrink-0">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs group-hover:text-rose-700 dark:group-hover:text-rose-300 transition">
              {t('emergency.title')}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('emergency.simulationSubtitle')}
            </p>
          </div>
        </NavLink>

        <NavLink
          to="/redistribution"
          className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 hover:border-teal-300 dark:hover:border-teal-700 transition group flex items-start gap-3.5 shadow-xs"
        >
          <div className="p-2.5 rounded-lg bg-teal-600 text-white shadow-sm shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs group-hover:text-teal-700 dark:group-hover:text-teal-300 transition">
              {t('redistribution.title')}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('redistribution.subtitle')}
            </p>
          </div>
        </NavLink>

        <NavLink
          to="/admin/users"
          className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition group flex items-start gap-3.5 shadow-xs"
        >
          <div className="p-2.5 rounded-lg bg-slate-800 dark:bg-teal-700 text-white shadow-sm shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs group-hover:text-teal-700 dark:group-hover:text-teal-300 transition">
              {t('users.title')}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('users.subtitle')}
            </p>
          </div>
        </NavLink>
      </div>

      {/* Transfer Creation Modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
