import { useState, useMemo } from 'react';
import { 
  mockHospitals, 
  mockSupplyInventory, 
  mockAIAlerts, 
  mockForecastData, 
  mockTransfers, 
  mockRegionalKPIs 
} from '../data/mockData';
import { Hospital, SupplyItem, AIAlert, ResourceTransfer, PriorityLevel, ResourceCategory } from '../types';

export function useHealthcareData() {
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [supplies, setSupplies] = useState<SupplyItem[]>(mockSupplyInventory);
  const [alerts, setAlerts] = useState<AIAlert[]>(mockAIAlerts);
  const [transfers, setTransfers] = useState<ResourceTransfer[]>(mockTransfers);
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const matchesRegion = selectedRegion === 'All Regions' || hospital.region === selectedRegion;
      const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            hospital.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            hospital.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [hospitals, selectedRegion, searchQuery]);

  // Filtered supplies
  const filteredSupplies = useMemo(() => {
    return supplies.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [supplies, searchQuery]);

  // Selected hospital details
  const selectedHospital = useMemo(() => {
    return hospitals.find(h => h.id === selectedHospitalId) || null;
  }, [hospitals, selectedHospitalId]);

  // Dismiss alert
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' as const } : a));
  };

  // Mitigate alert
  const mitigateAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'mitigating' as const } : a));
  };

  // Add new transfer
  const createTransfer = (newTransfer: {
    originFacilityId: string;
    destinationFacilityId: string;
    resourceName: string;
    category: ResourceCategory;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
  }) => {
    const origin = hospitals.find(h => h.id === newTransfer.originFacilityId);
    const dest = hospitals.find(h => h.id === newTransfer.destinationFacilityId);

    const transfer: ResourceTransfer = {
      id: `trf-${Date.now().toString().slice(-4)}`,
      trackingCode: `MED-TR-${Math.floor(1000 + Math.random() * 9000)}`,
      originFacilityId: newTransfer.originFacilityId,
      originFacilityName: origin ? origin.name : 'Unknown Facility',
      destinationFacilityId: newTransfer.destinationFacilityId,
      destinationFacilityName: dest ? dest.name : 'Unknown Facility',
      resourceName: newTransfer.resourceName,
      category: newTransfer.category,
      quantity: newTransfer.quantity,
      unit: newTransfer.unit,
      priority: newTransfer.priority,
      status: 'in_transit',
      dispatchTime: 'Just now',
      estimatedArrival: '~45 mins',
      routeDistanceKm: +(Math.random() * 15 + 5).toFixed(1),
    };

    setTransfers(prev => [transfer, ...prev]);
  };

  return {
    hospitals,
    filteredHospitals,
    supplies,
    filteredSupplies,
    alerts,
    forecastData: mockForecastData,
    transfers,
    regionalKPIs: mockRegionalKPIs,
    selectedRegion,
    setSelectedRegion,
    searchQuery,
    setSearchQuery,
    selectedHospitalId,
    setSelectedHospitalId,
    selectedHospital,
    dismissAlert,
    mitigateAlert,
    createTransfer,
  };
}
