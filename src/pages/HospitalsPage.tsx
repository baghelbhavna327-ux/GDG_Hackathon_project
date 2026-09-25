import React, { useState } from 'react';
import { Hospital, PriorityLevel, ResourceCategory } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { HospitalStatusTable } from '../components/tables/HospitalStatusTable';
import { BedCapacityBarChart } from '../components/charts/BedCapacityBarChart';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Bed, 
  Activity, 
  Wind, 
  Droplet, 
  Users, 
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';

interface HospitalsPageProps {
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

export const HospitalsPage: React.FC<HospitalsPageProps> = ({ hospitals, onCreateTransfer }) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hospital Network & Bed Management"
        subtitle="Facility-by-facility capacity breakdown, intensive care units, and clinical staffing telemetry"
        badge={`${hospitals.length} Active Facilities`}
      />

      {/* Bed Capacity Comparison Chart */}
      <BedCapacityBarChart hospitals={hospitals} />

      {/* Hospital Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Hospital Facility Registry</h3>
        <HospitalStatusTable
          hospitals={hospitals}
          onSelectHospital={(hospital) => setSelectedHospital(hospital)}
        />
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <Modal
          isOpen={!!selectedHospital}
          onClose={() => setSelectedHospital(null)}
          title={selectedHospital.name}
          subtitle={`${selectedHospital.type} • ${selectedHospital.region}`}
          maxWidth="xl"
        >
          <div className="space-y-5">
            {/* Status & Contact Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={selectedHospital.status} size="md" />
                  <span className="text-xs font-semibold text-slate-600">
                    Predicted Surge Risk: {selectedHospital.predictedSurgeRisk}%
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
                <span className="text-[11px] text-slate-500">24/7 Triage Desk</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">General Beds</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {selectedHospital.occupiedBeds} / {selectedHospital.totalBeds}
                </p>
                <p className="text-[10px] text-slate-500">
                  {selectedHospital.totalBeds - selectedHospital.occupiedBeds} Available
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">ICU Units</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {selectedHospital.icuOccupied} / {selectedHospital.icuTotal}
                </p>
                <p className="text-[10px] text-rose-600 font-semibold">
                  {selectedHospital.icuTotal - selectedHospital.icuOccupied} Left
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Ventilators</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {selectedHospital.ventilatorsOccupied} / {selectedHospital.ventilatorsTotal}
                </p>
                <p className="text-[10px] text-slate-500">
                  {selectedHospital.ventilatorsTotal - selectedHospital.ventilatorsOccupied} Available
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Oxygen Tank</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {selectedHospital.oxygenLevelPct}%
                </p>
                <p className="text-[10px] text-teal-600 font-semibold">Continuous Feed</p>
              </div>
            </div>

            {/* Quick Actions in Modal */}
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
                Dispatch Transfer to this Facility
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Transfer modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
