import React, { useState } from 'react';
import { Hospital, PriorityLevel, ResourceCategory } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { BedCapacityBarChart } from '../components/charts/BedCapacityBarChart';
import { ResourceUtilizationChart } from '../components/charts/ResourceUtilizationChart';
import { HospitalStatusTable } from '../components/tables/HospitalStatusTable';
import { StatCard } from '../components/common/StatCard';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Bed, Activity, Wind, Layers, PlusCircle, MapPin, Phone, ArrowRightLeft } from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';

interface ResourcesPageProps {
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

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ hospitals, onCreateTransfer }) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Totals
  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const totalOccupied = hospitals.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const freeBeds = totalBeds - totalOccupied;

  const totalIcu = hospitals.reduce((acc, h) => acc + h.icuTotal, 0);
  const totalIcuOccupied = hospitals.reduce((acc, h) => acc + h.icuOccupied, 0);
  const freeIcu = totalIcu - totalIcuOccupied;

  const totalVents = hospitals.reduce((acc, h) => acc + h.ventilatorsTotal, 0);
  const totalVentsOccupied = hospitals.reduce((acc, h) => acc + h.ventilatorsOccupied, 0);
  const freeVents = totalVents - totalVentsOccupied;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Critical Healthcare Resources & Bed Management"
        subtitle="Network-wide telemetry for ICU bed utilization, mechanical ventilators, and high-flow oxygen grids"
        badge="Autonomous Allocation"
        action={
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Dispatch Equipment Transfer
          </button>
        }
      />

      {/* Resource Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inpatient Beds"
          value={`${totalOccupied} / ${totalBeds}`}
          subtitle={`${freeBeds} Available beds in grid`}
          change={`${Math.round((totalOccupied/totalBeds)*100)}% Full`}
          changeType="increase"
          icon={Bed}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Intensive Care Units (ICU)"
          value={`${totalIcuOccupied} / ${totalIcu}`}
          subtitle={`Only ${freeIcu} Free ICU beds remaining`}
          change="Critical load"
          changeType="urgent"
          icon={Activity}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="Mechanical Ventilators"
          value={`${totalVentsOccupied} / ${totalVents}`}
          subtitle={`${freeVents} Units on standby`}
          change={`${Math.round((totalVentsOccupied/totalVents)*100)}% in use`}
          changeType="neutral"
          icon={Wind}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Resource Utilization Index"
          value="85.2%"
          subtitle="Regional emergency threshold: 88%"
          change="Surge alert"
          changeType="urgent"
          icon={Layers}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BedCapacityBarChart hospitals={hospitals} />
        <ResourceUtilizationChart hospitals={hospitals} />
      </div>

      {/* Facility Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Hospital Resource Distribution Table</h3>
        <HospitalStatusTable
          hospitals={hospitals}
          onSelectHospital={(h) => setSelectedHospital(h)}
        />
      </div>

      {/* Facility Detail Modal */}
      {selectedHospital && (
        <Modal
          isOpen={!!selectedHospital}
          onClose={() => setSelectedHospital(null)}
          title={selectedHospital.name}
          subtitle={`${selectedHospital.type} • ${selectedHospital.region}`}
          maxWidth="xl"
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedHospital.status} size="md" />
                  <span className="text-xs font-semibold text-slate-600">
                    Surge Probability: {selectedHospital.predictedSurgeRisk}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedHospital.address}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-teal-600" />
                  {selectedHospital.phone}
                </span>
                <span className="text-[10px] text-slate-500">24/7 Dispatch Unit</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Beds</p>
                <p className="text-lg font-bold text-slate-900">{selectedHospital.occupiedBeds}/{selectedHospital.totalBeds}</p>
                <p className="text-[10px] text-teal-600 font-semibold">{selectedHospital.totalBeds - selectedHospital.occupiedBeds} Free</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[10px] uppercase font-bold text-slate-400">ICU Capacity</p>
                <p className="text-lg font-bold text-slate-900">{selectedHospital.icuOccupied}/{selectedHospital.icuTotal}</p>
                <p className="text-[10px] text-rose-600 font-bold">{selectedHospital.icuTotal - selectedHospital.icuOccupied} Free</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[10px] uppercase font-bold text-slate-400">Ventilators</p>
                <p className="text-lg font-bold text-slate-900">{selectedHospital.ventilatorsOccupied}/{selectedHospital.ventilatorsTotal}</p>
                <p className="text-[10px] text-slate-500">{selectedHospital.ventilatorsTotal - selectedHospital.ventilatorsOccupied} Free</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[10px] uppercase font-bold text-slate-400">Oxygen Level</p>
                <p className="text-lg font-bold text-slate-900">{selectedHospital.oxygenLevelPct}%</p>
                <p className="text-[10px] text-teal-600 font-semibold">Regulated Feed</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedHospital(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedHospital(null);
                  setIsTransferModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Dispatch Transfer
              </button>
            </div>
          </div>
        </Modal>
      )}

      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
