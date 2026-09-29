import React, { useState, useEffect, useMemo } from 'react';
import { InteractivePhcManagementMap } from '../components/maps/InteractivePhcManagementMap';
import { phcService } from '../services/phcService';
import { mockIndiaPHCs } from '../data/indiaPhcData';
import { IndiaPHC, PriorityLevel, ResourceCategory, Hospital } from '../types';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Pill, 
  Bed, 
  Users, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  AlertOctagon,
  ShieldCheck,
  ChevronRight,
  Filter,
  Activity
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { useTranslation } from '../i18n';

interface PhcManagementPageProps {
  hospitals?: Hospital[];
  onCreateTransfer?: (data: {
    originFacilityId: string;
    destinationFacilityId: string;
    resourceName: string;
    category: ResourceCategory;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
  }) => void;
}

export const PhcManagementPage: React.FC<PhcManagementPageProps> = () => {
  const { t, isHindi } = useTranslation();
  const [phcList, setPhcList] = useState<IndiaPHC[]>(mockIndiaPHCs);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPhc, setEditingPhc] = useState<IndiaPHC | null>(null);
  const [deletingPhc, setDeletingPhc] = useState<IndiaPHC | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    totalBeds: 30,
    availableBeds: 18,
    staffAttendancePct: 90,
    medicineStockPct: 85,
    stockoutRisk: 'LOW' as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
    contactPerson: 'Dr. Medical Officer',
    phone: '+91 755 2445890',
    latitude: 23.25,
    longitude: 77.41,
  });

  // Load PHCs from backend
  useEffect(() => {
    let isMounted = true;
    const fetchPhcs = async () => {
      setIsLoading(true);
      try {
        const data = await phcService.getPHCs();
        if (isMounted && data.length > 0) {
          setPhcList(data);
        }
      } catch (err) {
        console.warn('Error loading PHCs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPhcs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Distinct States
  const states = useMemo(() => {
    const set = new Set(phcList.map((p) => p.state));
    return ['All States', ...Array.from(set).sort()];
  }, [phcList]);

  // Distinct Districts
  const districts = useMemo(() => {
    const list = phcList.filter(
      (p) => selectedState === 'All States' || p.state === selectedState
    );
    const set = new Set(list.map((p) => p.district));
    return ['All Districts', ...Array.from(set).sort()];
  }, [phcList, selectedState]);

  // Filtered PHC records
  const filteredPHCs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return phcList.filter((phc) => {
      const matchesSearch =
        !query ||
        phc.name.toLowerCase().includes(query) ||
        phc.district.toLowerCase().includes(query) ||
        phc.state.toLowerCase().includes(query) ||
        (phc.code && phc.code.toLowerCase().includes(query));

      const matchesState = selectedState === 'All States' || phc.state === selectedState;
      const matchesDistrict = selectedDistrict === 'All Districts' || phc.district === selectedDistrict;

      const matchesStatus =
        selectedStatus === 'All Status' ||
        (selectedStatus === 'normal' && phc.status === 'normal') ||
        (selectedStatus === 'low_resources' && phc.status === 'low_resources') ||
        (selectedStatus === 'critical' && phc.status === 'critical');

      return matchesSearch && matchesState && matchesDistrict && matchesStatus;
    });
  }, [phcList, searchQuery, selectedState, selectedDistrict, selectedStatus]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      code: `PHC-IN-${Math.floor(100 + Math.random() * 900)}`,
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      totalBeds: 30,
      availableBeds: 18,
      staffAttendancePct: 90,
      medicineStockPct: 85,
      stockoutRisk: 'LOW',
      contactPerson: 'Dr. Medical Officer',
      phone: '+91 755 2445890',
      latitude: 23.25,
      longitude: 77.41,
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (phc: IndiaPHC) => {
    setEditingPhc(phc);
    setFormData({
      name: phc.name,
      code: phc.code || '',
      state: phc.state,
      district: phc.district,
      totalBeds: phc.totalBeds,
      availableBeds: phc.availableBeds,
      staffAttendancePct: phc.staffAttendancePct,
      medicineStockPct: phc.medicineStockPct,
      stockoutRisk: phc.stockoutRisk,
      contactPerson: phc.contactPerson,
      phone: phc.phone,
      latitude: phc.coordinates[0],
      longitude: phc.coordinates[1],
    });
  };

  // Submit Create
  const handleCreatePhc = async (e: React.FormEvent) => {
    e.preventDefault();
    const status: 'normal' | 'low_resources' | 'critical' = 
      formData.stockoutRisk === 'CRITICAL' || formData.stockoutRisk === 'HIGH' ? 'critical' :
      formData.stockoutRisk === 'MODERATE' ? 'low_resources' : 'normal';

    const newPhc = await phcService.createPHC({
      name: formData.name,
      code: formData.code,
      state: formData.state,
      district: formData.district,
      coordinates: [formData.latitude, formData.longitude],
      status,
      medicineStockPct: formData.medicineStockPct,
      totalBeds: Number(formData.totalBeds),
      availableBeds: Number(formData.availableBeds),
      staffAttendancePct: Number(formData.staffAttendancePct),
      stockoutRisk: formData.stockoutRisk,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
    });

    setPhcList([newPhc, ...phcList]);
    setIsAddModalOpen(false);
  };

  // Submit Update
  const handleUpdatePhc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhc) return;

    const status: 'normal' | 'low_resources' | 'critical' = 
      formData.stockoutRisk === 'CRITICAL' || formData.stockoutRisk === 'HIGH' ? 'critical' :
      formData.stockoutRisk === 'MODERATE' ? 'low_resources' : 'normal';

    await phcService.updatePHC(editingPhc.id, {
      name: formData.name,
      state: formData.state,
      district: formData.district,
      totalBeds: Number(formData.totalBeds),
      availableBeds: Number(formData.availableBeds),
      stockoutRisk: formData.stockoutRisk,
      medicineStockPct: Number(formData.medicineStockPct),
      staffAttendancePct: Number(formData.staffAttendancePct),
    });

    setPhcList(
      phcList.map((p) =>
        p.id === editingPhc.id
          ? {
              ...p,
              name: formData.name,
              state: formData.state,
              district: formData.district,
              totalBeds: Number(formData.totalBeds),
              availableBeds: Number(formData.availableBeds),
              staffAttendancePct: Number(formData.staffAttendancePct),
              medicineStockPct: Number(formData.medicineStockPct),
              stockoutRisk: formData.stockoutRisk,
              status,
            }
          : p
      )
    );
    setEditingPhc(null);
  };

  // Submit Delete
  const handleDeletePhc = async () => {
    if (!deletingPhc) return;
    await phcService.deletePHC(deletingPhc.id);
    setPhcList(phcList.filter((p) => p.id !== deletingPhc.id));
    setDeletingPhc(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <Building2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('phc.title')}
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('phc.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{isHindi ? "नया PHC जोड़ें" : "Add New PHC"}</span>
        </button>
      </div>

      {/* 2. Interactive National PHC Grid Map (Full dragging, zoom in/out, reset view, locate all) */}
      <InteractivePhcManagementMap
        phcList={filteredPHCs}
        height="580px"
        onEditPhc={(phc) => handleOpenEditModal(phc)}
      />

      {/* 3. Search & Quick Filters Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('phc.searchPhc')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* State Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('All Districts');
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer transition"
            >
              {states.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {st === 'All States' ? (isHindi ? 'सभी राज्य' : 'All States') : st}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer transition"
            >
              {districts.map((dst) => (
                <option key={dst} value={dst} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {dst === 'All Districts' ? (isHindi ? 'सभी ज़िले' : 'All Districts') : dst}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter & Reset */}
          <div className="md:col-span-2 flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer transition"
            >
              <option value="All Status" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'सभी स्थितियाँ' : 'All Status'}</option>
              <option value="normal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'सामान्य स्टॉक' : 'Normal Stock'}</option>
              <option value="low_resources" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'कम स्टॉक' : 'Low Stock'}</option>
              <option value="critical" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'गंभीर स्टॉक' : 'Critical Stock'}</option>
            </select>

            {(searchQuery || selectedState !== 'All States' || selectedDistrict !== 'All Districts' || selectedStatus !== 'All Status') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedState('All States');
                  setSelectedDistrict('All Districts');
                  setSelectedStatus('All Status');
                }}
                title={isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. PHC Facility Registry Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {isHindi ? `पंजीकृत स्वास्थ्य केंद्र (${filteredPHCs.length})` : `Registered Health Facilities (${filteredPHCs.length})`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHindi ? "क्षमता एवं जोखिम सूचकांकों के साथ लाइव परिचालन रजिस्ट्री" : "Live operational registry with capacity and risk indices"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/75 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">{t('phc.facilityName')}</th>
                <th scope="col" className="px-4 py-3.5">{t('phc.location')}</th>
                <th scope="col" className="px-4 py-3.5">{t('phc.beds')}</th>
                <th scope="col" className="px-4 py-3.5">{isHindi ? "स्टाफ उपस्थिति" : "Staff Attendance"}</th>
                <th scope="col" className="px-4 py-3.5">{isHindi ? "दवा स्टॉक" : "Medicine Stock"}</th>
                <th scope="col" className="px-4 py-3.5">{t('hero.stockOutRisk')}</th>
                <th scope="col" className="px-5 py-3.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPHCs.length > 0 ? (
                filteredPHCs.map((phc) => {
                  const bedPct = Math.round((phc.availableBeds / (phc.totalBeds || 1)) * 100);

                  return (
                    <tr key={phc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition">
                      {/* Facility Name & Code */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center font-bold text-xs shrink-0">
                            {phc.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{phc.name}</p>
                            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
                              {phc.code || 'PHC'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* State & District */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{phc.district}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{phc.state}</p>
                      </td>

                      {/* Bed Capacity */}
                      <td className="px-4 py-3.5">
                        <div className="w-28">
                          <div className="flex justify-between text-[11px] font-bold mb-1">
                            <span className="text-slate-900 dark:text-slate-100">{phc.availableBeds} / {phc.totalBeds} Free</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${bedPct < 30 ? 'bg-rose-500' : 'bg-teal-500'}`}
                              style={{ width: `${bedPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Staff Attendance */}
                      <td className="px-4 py-3.5">
                        <span className={`font-bold text-xs ${phc.staffAttendancePct < 75 ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                          {phc.staffAttendancePct}%
                        </span>
                      </td>

                      {/* Medicine Stock */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${
                            phc.medicineStockPct < 40 ? 'bg-rose-500 animate-pulse' : phc.medicineStockPct < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{phc.medicineStockPct}%</span>
                        </div>
                      </td>

                      {/* Risk Level */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          phc.status === 'critical'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80'
                            : phc.status === 'low_resources'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                        }`}>
                          {phc.status === 'low_resources' ? 'Low Stock' : phc.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(phc)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 transition"
                            title="Edit Facility"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPhc(phc)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Delete Facility"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                    No matching PHC facilities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add PHC Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Primary Health Center"
          subtitle="Register a new primary health care facility into the national grid"
          maxWidth="lg"
        >
          <form onSubmit={handleCreatePhc} className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. PHC Sehore Central"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">District *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Total Beds</label>
                <input
                  type="number"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Available Beds</label>
                <input
                  type="number"
                  value={formData.availableBeds}
                  onChange={(e) => setFormData({ ...formData, availableBeds: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Medicine Stock %</label>
                <input
                  type="number"
                  value={formData.medicineStockPct}
                  onChange={(e) => setFormData({ ...formData, medicineStockPct: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Risk Level</label>
                <select
                  value={formData.stockoutRisk}
                  onChange={(e) => setFormData({ ...formData, stockoutRisk: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                >
                  <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Normal (LOW)</option>
                  <option value="MODERATE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low Stock (MODERATE)</option>
                  <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">High Risk</option>
                  <option value="CRITICAL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold shadow-sm"
              >
                Save PHC Facility
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. Edit PHC Modal */}
      {editingPhc && (
        <Modal
          isOpen={!!editingPhc}
          onClose={() => setEditingPhc(null)}
          title={`Edit Facility: ${editingPhc.name}`}
          subtitle="Update capacity, operational staffing, and stockout metrics"
          maxWidth="lg"
        >
          <form onSubmit={handleUpdatePhc} className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Facility Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Total Beds</label>
                <input
                  type="number"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Available Beds</label>
                <input
                  type="number"
                  value={formData.availableBeds}
                  onChange={(e) => setFormData({ ...formData, availableBeds: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Medicine Stock %</label>
                <input
                  type="number"
                  value={formData.medicineStockPct}
                  onChange={(e) => setFormData({ ...formData, medicineStockPct: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800 dark:text-slate-200">Risk Level</label>
                <select
                  value={formData.stockoutRisk}
                  onChange={(e) => setFormData({ ...formData, stockoutRisk: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none"
                >
                  <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Normal (LOW)</option>
                  <option value="MODERATE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low Stock (MODERATE)</option>
                  <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">High Risk</option>
                  <option value="CRITICAL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPhc(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold shadow-sm"
              >
                Update Facility
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {deletingPhc && (
        <Modal
          isOpen={!!deletingPhc}
          onClose={() => setDeletingPhc(null)}
          title="Delete Facility Confirmation"
          subtitle="Are you sure you want to remove this PHC from the active registry?"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p>
              This will permanently remove <strong className="text-slate-900 dark:text-slate-100">{deletingPhc.name}</strong> ({deletingPhc.district}, {deletingPhc.state}) from the active healthcare monitoring network.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingPhc(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePhc}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
