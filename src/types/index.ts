export type FacilityStatus = 'optimal' | 'moderate' | 'critical' | 'surge';
export type SeverityLevel = 'critical' | 'warning' | 'info';
export type TransferStatus = 'in_transit' | 'scheduled' | 'delivered' | 'pending_approval';
export type PriorityLevel = 'emergency' | 'high' | 'routine';
export type ResourceCategory = 
  | 'ICU Beds' 
  | 'Mechanical Ventilators' 
  | 'Medical Oxygen' 
  | 'Blood & Plasma' 
  | 'Critical Pharmaceuticals' 
  | 'PPE Supplies';

export type InventoryRiskLevel = 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface MedicineInventoryRecord {
  id: string;
  medicine: string;
  category: string;
  dosage: string;
  phc: string;
  district: string;
  state: string;
  currentStock: number;
  unit: string;
  dailyUsage: number;
  predicted7DayDemand: number;
  daysRemaining: number;
  risk: InventoryRiskLevel;
  expiryDate: string;
  batchNumber: string;
  isExpiringSoon?: boolean; // Expiring within 30-60 days
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Trauma Level 1' | 'General Hospital' | 'Community Health Center' | 'Children & Specialty';
  region: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  status: FacilityStatus;
  totalBeds: number;
  occupiedBeds: number;
  icuTotal: number;
  icuOccupied: number;
  ventilatorsTotal: number;
  ventilatorsOccupied: number;
  oxygenLevelPct: number; // 0-100%
  bloodSupplyUnits: number;
  staffOnDutyPct: number;
  predictedSurgeRisk: number; // 0-100
  phone: string;
}

export interface IndiaPHC {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  status: 'normal' | 'low_resources' | 'critical'; // Green, Yellow, Red
  medicineStockPct: number; // 0-100%
  totalBeds: number;
  availableBeds: number;
  staffAttendancePct: number; // 0-100%
  todaysPatients: number;
  stockoutRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  criticalShortageItems?: string[];
  contactPerson: string;
  phone: string;
  pincode: string;
  oxygenBufferPct: number;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: ResourceCategory;
  facilityId: string;
  facilityName: string;
  currentStock: number;
  totalCapacity: number;
  unit: string;
  dailyBurnRate: number;
  daysOfSupplyLeft: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  lastRestocked: string;
}

export interface AIAlert {
  id: string;
  severity: SeverityLevel;
  title: string;
  message: string;
  facilityId: string;
  facilityName: string;
  timestamp: string;
  actionRecommended: string;
  status: 'active' | 'mitigating' | 'resolved';
  confidenceScore: number; // 0-100
  type: 'bed_shortage' | 'oxygen_drop' | 'surge_prediction' | 'supply_depletion' | 'staffing_bottleneck';
}

export interface DemandForecastPoint {
  timeLabel: string;
  actualOccupancy?: number;
  predictedOccupancy: number;
  confidenceUpper: number;
  confidenceLower: number;
  capacityLimit: number;
}

export interface ResourceTransfer {
  id: string;
  trackingCode: string;
  originFacilityId: string;
  originFacilityName: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  resourceName: string;
  category: ResourceCategory;
  quantity: number;
  unit: string;
  priority: PriorityLevel;
  status: TransferStatus;
  dispatchTime: string;
  estimatedArrival: string;
  routeDistanceKm: number;
}

export interface RegionalKPI {
  regionName: string;
  activeHospitals: number;
  totalBedCapacity: number;
  currentOccupiedBeds: number;
  totalIcuCapacity: number;
  currentOccupiedIcu: number;
  avgOxygenLevelPct: number;
  criticalAlertsCount: number;
  predictedSurgeRiskScore: number; // 0 - 100
}
