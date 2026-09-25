import React, { useState, useMemo } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { IndiaPhcLeafletMap } from '../components/maps/IndiaPhcLeafletMap';
import { mockIndiaPHCs } from '../data/indiaPhcData';
import { IndiaPHC, PriorityLevel, ResourceCategory, Hospital } from '../types';
import { 
  Search, 
  Filter, 
  MapPin, 
  Pill, 
  Bed, 
  Users, 
  AlertTriangle, 
  Phone, 
  PlusCircle, 
  SlidersHorizontal,
  Activity,
  Wind,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';

interface PhcMapPageProps {
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

export const PhcMapPage: React.FC<PhcMapPageProps> = ({ hospitals, onCreateTransfer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedPhc, setSelectedPhc] = useState<IndiaPHC | null>(mockIndiaPHCs[0]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // States list from dataset
  const states = useMemo(() => {
    const list = Array.from(new Set(mockIndiaPHCs.map((p) => p.state))).sort();
    return ['All States', ...list];
  }, []);

  // Filtered PHC nodes
  const filteredPHCs = useMemo(() => {
    return mockIndiaPHCs.filter((phc) => {
      const matchesSearch = 
        phc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phc.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState = selectedState === 'All States' || phc.state === selectedState;

      const matchesRisk = 
        selectedRisk === 'All' ? true :
        selectedRisk === 'critical' ? phc.status === 'critical' :
        selectedRisk === 'low_resources' ? phc.status === 'low_resources' :
        selectedRisk === 'normal' ? phc.status === 'normal' : true;

      return matchesSearch && matchesState && matchesRisk;
    });
  }, [searchQuery, selectedState, selectedRisk]);

  // Status breakdown counts
  const normalCount = mockIndiaPHCs.filter(p => p.status === 'normal').length;
  const lowResourcesCount = mockIndiaPHCs.filter(p => p.status === 'low_resources').length;
  const criticalCount = mockIndiaPHCs.filter(p => p.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Primary Health Center (PHC) Monitoring Map"
        subtitle="Geospatial distribution, live medicine stock levels, bed availability & stock-out risk across Indian regions"
        badge="Live GIS Telemetry"
        action={
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Dispatch Rebalancing Transfer
          </button>
        }
      />

      {/* Filter and Search Bar Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search PHC Field */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PHC name, district (e.g. Guna), or state..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
            />
          </div>

          {/* State Filter Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter Buttons */}
          <div className="md:col-span-3 flex items-center gap-1.5 justify-start md:justify-end">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Risk:</span>
            {[
              { label: 'All', val: 'All' },
              { label: 'Normal', val: 'normal' },
              { label: 'Warning', val: 'low_resources' },
              { label: 'Critical', val: 'critical' },
            ].map((btn) => (
              <button
                key={btn.val}
                onClick={() => setSelectedRisk(btn.val)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedRisk === btn.val
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend & Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Map Legend */}
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700">Map Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-slate-600 font-medium">Normal ({normalCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500 shadow-xs" />
              <span className="text-slate-600 font-medium">Low Resources ({lowResourcesCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500 shadow-xs animate-pulse" />
              <span className="text-rose-700 font-bold">Critical ({criticalCount})</span>
            </div>
          </div>

          <span className="text-slate-500 font-medium">
            Showing <strong>{filteredPHCs.length}</strong> of {mockIndiaPHCs.length} PHCs across India
          </span>
        </div>
      </div>

      {/* Main Map + Selected PHC Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Leaflet Map */}
        <div className="lg:col-span-8">
          <IndiaPhcLeafletMap
            phcList={filteredPHCs}
            selectedPhcId={selectedPhc?.id}
            onSelectPhc={(phc) => setSelectedPhc(phc)}
            height="580px"
          />
        </div>

        {/* Right: Selected PHC Telemetry Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPhc ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
              {/* Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedPhc.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      selectedPhc.status === 'critical'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                        : selectedPhc.status === 'low_resources'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {selectedPhc.status === 'low_resources' ? 'Low Resources' : selectedPhc.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">{selectedPhc.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {selectedPhc.district}, {selectedPhc.state} • PIN: {selectedPhc.pincode}
                </p>
              </div>

              {/* Critical Alert Warning if present */}
              {selectedPhc.criticalShortageItems && selectedPhc.criticalShortageItems.length > 0 && (
                <div className="rounded-lg bg-rose-50 p-3 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    Active Supply Shortage:
                  </p>
                  <p className="text-rose-800">
                    {selectedPhc.criticalShortageItems.join(', ')}
                  </p>
                </div>
              )}

              {/* Exact Metrics List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium flex items-center gap-2">
                    <Pill className="h-4 w-4 text-teal-600" />
                    Medicine Stock Level
                  </span>
                  <span className={`font-bold ${selectedPhc.medicineStockPct < 40 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                    {selectedPhc.medicineStockPct}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium flex items-center gap-2">
                    <Bed className="h-4 w-4 text-blue-600" />
                    Beds Available
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedPhc.availableBeds} / {selectedPhc.totalBeds} Free
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-600" />
                    Staff Attendance
                  </span>
                  <span className={`font-bold ${selectedPhc.staffAttendancePct < 75 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {selectedPhc.staffAttendancePct}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-600" />
                    Today's Patients
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedPhc.todaysPatients} Patients
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-semibold flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    Stock-out Risk
                  </span>
                  <span
                    className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                      selectedPhc.stockoutRisk === 'CRITICAL' || selectedPhc.stockoutRisk === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : selectedPhc.stockoutRisk === 'MODERATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedPhc.stockoutRisk}
                  </span>
                </div>
              </div>

              {/* Contact Desk */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{selectedPhc.contactPerson}</p>
                  <p className="text-[10px] text-slate-500">Medical Officer In-Charge</p>
                </div>
                <a
                  href={`tel:${selectedPhc.phone}`}
                  className="font-bold text-teal-700 flex items-center gap-1 hover:underline text-xs"
                >
                  <Phone className="h-3.5 w-3.5 text-teal-600" />
                  {selectedPhc.phone}
                </a>
              </div>

              {/* Rebalance Trigger */}
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="w-full py-2.5 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Initiate AI Rebalance for {selectedPhc.district}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 text-xs">
              Click any marker on the map to inspect full clinical telemetry.
            </div>
          )}

          {/* Quick Filtered PHC Nodes List */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Matching Facilities ({filteredPHCs.length})</span>
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredPHCs.map((phc) => (
                <button
                  key={phc.id}
                  onClick={() => setSelectedPhc(phc)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition border ${
                    selectedPhc?.id === phc.id
                      ? 'bg-teal-50 border-teal-200 text-teal-950 font-bold'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-900 truncate">{phc.name}</p>
                    <p className="text-[10px] text-slate-500">{phc.district}, {phc.state}</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      phc.status === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : phc.status === 'low_resources'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {phc.status === 'low_resources' ? 'Warning' : phc.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
