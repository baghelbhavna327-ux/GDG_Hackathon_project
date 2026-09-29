import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Hospital as HospitalIcon,
  Bed,
  Pill,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
  ShieldCheck,
  PackagePlus,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { MedicineDemandChart } from '../components/charts/MedicineDemandChart';
import { PatientFootfallChart } from '../components/charts/PatientFootfallChart';
import { CriticalAlertsList } from '../components/dashboard/CriticalAlertsList';
import { RegionalDiseaseIntelligencePanel } from '../components/dashboard/RegionalDiseaseIntelligencePanel';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { RequestSupplyModal, RequestSupplyContext } from '../components/clinician/RequestSupplyModal';
import { ClinicianSupplyRequestsHistory } from '../components/clinician/ClinicianSupplyRequestsHistory';
import { Hospital, AIAlert, ResourceTransfer, PriorityLevel, ResourceCategory, DemandForecastPoint } from '../types';
import { useTranslation } from '../i18n';
import { TypewriterText } from '../components/common/TypewriterText';

interface ClinicianDashboardPageProps {
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

export const ClinicianDashboardPage: React.FC<ClinicianDashboardPageProps> = ({
  hospitals,
  alerts,
  onDismissAlert,
  onMitigateAlert,
  onCreateTransfer,
}) => {
  const { user } = useAuth();
  const { t, isHindi } = useTranslation();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [supplyContext, setSupplyContext] = useState<RequestSupplyContext | null>(null);
  const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);

  const assignedFacility = user?.facility || 'PHC Sehore North';
  const myHospital = hospitals.find(h => h.name.toLowerCase().includes(assignedFacility.toLowerCase()) || h.name.includes('Sehore')) || hospitals[0] || {
    id: 'h-sehore',
    name: assignedFacility,
    region: 'Central Metro',
    totalBeds: 24,
    occupiedBeds: 19,
    status: 'SURGE_WARNING'
  };

  const openSupplyRequestFor = (medicineName: string, currentStock: number, unit: string, risk: 'HIGH' | 'CRITICAL' | 'WARNING', shortage: number) => {
    setSupplyContext({
      phcId: myHospital.id || 'phc-01',
      phcName: assignedFacility,
      district: 'Sehore',
      state: 'Madhya Pradesh',
      medicine: medicineName,
      currentStock: currentStock,
      unit: unit,
      predictedDailyDemand: 110,
      predicted7DayDemand: 770,
      daysRemaining: 3,
      shortageQuantity: shortage,
      stockOutRisk: risk,
      reason: `Assigned facility ${assignedFacility} reported urgent depletion. Requesting immediate emergency stock replenishment.`
    });
    setIsSupplyModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Clinician Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 border border-teal-400/20 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1.5 shadow-glow-teal">
              <HospitalIcon className="h-3.5 w-3.5 text-teal-400" />
              {t('common.facility')}: {assignedFacility}
            </span>
            <span className="text-[11px] font-mono text-teal-400/80 hidden md:inline">
              <TypewriterText
                phrases={
                  isHindi
                    ? ["क्लीनिकल निर्णय सहायता प्रणाली", "त्वरित आपूर्ति रीक्विजिशन", "रियल-टाइम स्टॉक मॉनिटरिंग"]
                    : ["Clinical Decision Support", "Instant Supply Requisitions", "Real-time Stock Monitoring"]
                }
                typingSpeed={40}
                pauseTime={3500}
              />
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {t('page.clinicianDashboard.title')}
          </h2>
          <p className="text-xs text-slate-300">
            {t('page.clinicianDashboard.subtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <NavLink
            to="/forecast"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <TrendingUp className="h-4 w-4 text-teal-300" />
            <span>{t('nav.demandForecast')}</span>
          </NavLink>
          <button
            onClick={() => {
              setSupplyContext({
                phcId: myHospital.id || 'phc-01',
                phcName: assignedFacility,
                district: 'Sehore',
                state: 'Madhya Pradesh',
                medicine: 'Paracetamol 500mg Tablets',
                currentStock: 380,
                unit: 'Tablets',
                predictedDailyDemand: 110,
                predicted7DayDemand: 770,
                daysRemaining: 3,
                shortageQuantity: 390,
                stockOutRisk: 'CRITICAL',
                reason: `Acute OPD patient surge at ${assignedFacility}. Stock exhaustion expected within 72 hours.`
              });
              setIsSupplyModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 cursor-pointer"
          >
            <PackagePlus className="h-4 w-4" />
            <span>{t('supplyRequest.requestSupply')}</span>
          </button>
        </div>
      </div>

      {/* Facility Operations KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('phc.occupancy')}
          value={`${myHospital.occupiedBeds} / ${myHospital.totalBeds}`}
          subtitle={`${Math.round((myHospital.occupiedBeds / (myHospital.totalBeds || 1)) * 100)}% ${t('dashboard.occupancyRate')}`}
          icon={Bed}
          change={`${myHospital.totalBeds - myHospital.occupiedBeds} Free`}
          changeType="increase"
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          iconColor="text-teal-600 dark:text-teal-400"
        />
        <StatCard
          title="ICU & Oxygen"
          value="4 ICU Beds"
          subtitle="Oxygen Reservoir: 78%"
          icon={Activity}
          change={t('common.optimal')}
          changeType="increase"
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title={t('dashboard.patientFootfall')}
          value="184 Patients"
          subtitle="+14% vs 7-day avg"
          icon={Users}
          change="OPD Surge"
          changeType="urgent"
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title={t('dashboard.criticalShortages')}
          value="2 Critical"
          subtitle="Paracetamol & Amoxicillin"
          icon={Pill}
          change="Reorder Sent"
          changeType="decrease"
          iconBg="bg-rose-50 dark:bg-rose-950/60"
          iconColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Local Facility Operational Status & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Regional Epidemiological & Seasonal Disease Intelligence */}
          <RegionalDiseaseIntelligencePanel />

          {/* Facility Medicine Inventory Snapshot */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {t('inventory.title')} ({assignedFacility})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('inventory.subtitle')}
                </p>
              </div>
              <NavLink
                to="/inventory"
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1"
              >
                <span>{t('common.viewAll')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </NavLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">Paracetamol 500mg</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                      3 {t('hero.daysRemaining')}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">380 Tabs</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('inventory.burnRate')}: 110/day</p>
                </div>
                <button
                  onClick={() => openSupplyRequestFor('Paracetamol 500mg Tablets', 380, 'Tablets', 'CRITICAL', 390)}
                  className="mt-3 w-full py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PackagePlus className="h-3 w-3" />
                  {t('supplyRequest.requestSupply')}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Amoxicillin 500mg</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-600 text-white">
                      5 {t('hero.daysRemaining')}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">420 Caps</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('inventory.burnRate')}: 80/day</p>
                </div>
                <button
                  onClick={() => openSupplyRequestFor('Amoxicillin 500mg Capsules', 420, 'Capsules', 'HIGH', 280)}
                  className="mt-3 w-full py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PackagePlus className="h-3 w-3" />
                  {t('supplyRequest.requestSupply')}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">ORS Solution</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                      {t('common.optimal')}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">1,250 Pkts</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('inventory.burnRate')}: 45/day</p>
                </div>
                <button
                  onClick={() => openSupplyRequestFor('Oral Rehydration Salts (ORS)', 1250, 'Packets', 'WARNING', 150)}
                  className="mt-3 w-full py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PackagePlus className="h-3 w-3" />
                  {t('supplyRequest.requestSupply')}
                </button>
              </div>
            </div>
          </div>

          {/* Demand & Footfall Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MedicineDemandChart />
            <PatientFootfallChart />
          </div>
        </div>

        {/* Right Column: Local Triage & Alerts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/80 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/60 dark:to-slate-900 p-4 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{t('profile.title')}</span>
            </div>
            <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
              {t('profile.subtitle')}
            </p>
            <div className="pt-2 border-t border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-teal-900 dark:text-teal-200">{t('common.facility')}</span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{assignedFacility}</span>
            </div>
          </div>

          <CriticalAlertsList
            onResolveAlert={(id) => onMitigateAlert(id)}
          />
        </div>
      </div>

      {/* Clinician's Submitted Supply Requests History */}
      <ClinicianSupplyRequestsHistory key={refreshHistoryKey} />

      {/* Modal for Clinician Supply Request */}
      <RequestSupplyModal
        isOpen={isSupplyModalOpen}
        onClose={() => {
          setIsSupplyModalOpen(false);
          setSupplyContext(null);
        }}
        context={supplyContext}
        onSuccess={() => {
          setIsSupplyModalOpen(false);
          setSupplyContext(null);
          setRefreshHistoryKey(k => k + 1);
        }}
      />

      {/* Transfer / Stock Request Modal */}
      <NewTransferModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
