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

export type SupplyRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
export type SupplyRequestUrgency = 'HIGH' | 'CRITICAL';

export interface SupplyRequest {
  _id: string;
  requestedBy: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    facility?: string;
  } | string;
  clinicianId?: string;
  clinicianName: string;
  phcId: string;
  phcName: string;
  district?: string;
  state?: string;
  medicine: string;
  currentStock: number;
  predictedDailyDemand: number;
  predicted7DayDemand: number;
  daysRemaining: number;
  shortageQuantity: number;
  stockOutRisk: InventoryRiskLevel;
  requestedQuantity: number;
  urgency: SupplyRequestUrgency;
  reason: string;
  status: SupplyRequestStatus;
  adminComment?: string;
  approvedQuantity?: number | null;
  transferredRecordId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyRequestPayload {
  phcId: string;
  phcName: string;
  district?: string;
  state?: string;
  medicine: string;
  currentStock: number;
  predictedDailyDemand?: number;
  predicted7DayDemand?: number;
  daysRemaining?: number;
  shortageQuantity?: number;
  stockOutRisk?: InventoryRiskLevel;
  requestedQuantity: number;
  urgency: SupplyRequestUrgency;
  reason: string;
}

export type NotificationType =
  | 'SUPPLY_REQUEST'
  | 'SUPPLY_APPROVED'
  | 'SUPPLY_REJECTED'
  | 'SUPPLY_FULFILLED'
  | 'CRITICAL_STOCK'
  | 'HIGH_STOCK_RISK'
  | 'EMERGENCY'
  | 'REDISTRIBUTION'
  | 'DISEASE_ALERT'
  | 'REGIONAL_DEMAND_ALERT';

export interface AppNotification {
  _id: string;
  id?: string;
  recipientUserId?: string | null;
  recipientRole?: 'admin' | 'health_worker' | 'viewer' | 'all';
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string | null;
  relatedEntityType?: 'SupplyRequest' | 'Transfer' | 'Alert' | 'PHC' | 'Inventory' | 'Emergency' | 'General' | 'DiseaseEvent';
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export type DiseaseEventType = 'SEASONAL' | 'OUTBREAK' | 'SURGE' | 'REGIONAL_ALERT';
export type DiseaseSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DiseaseAffectedMedicine {
  medicine: string;
  impactMultiplier: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DiseaseEvent {
  _id?: string;
  diseaseId: string;
  diseaseName: string;
  region: string;
  state: string;
  district: string;
  eventType: DiseaseEventType;
  reportingPeriod: string;
  severityLevel: DiseaseSeverity;
  caseCount?: number | null;
  trendPercentage?: number;
  impactFactor: number;
  affectedMedicines?: DiseaseAffectedMedicine[];
  source: string;
  sourceType: 'OFFICIAL_GOV' | 'DEMO' | 'SYNTHETIC';
  sourceUrl?: string;
  sourceDate: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  active: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiseaseAdjustedPredictionData {
  phc: string;
  state: string;
  district: string;
  medicine: string;
  current_stock: number;
  baseline: {
    predicted_daily_demand: number;
    predicted_7_day_demand: number;
    days_remaining: number;
    shortage_quantity: number;
  };
  seasonal_context: {
    month: number;
    season: string;
    seasonal_factor: number;
    primary_concern: string;
  };
  disease_impact: {
    impact_score: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    adjustment_percentage: number;
    active_signals_count: number;
    active_signals: Array<{
      diseaseId: string;
      diseaseName: string;
      eventType: string;
      severityLevel: string;
      caseCount?: number;
      trendPercentage?: number;
      source: string;
      sourceType: string;
      sourceDate: string;
      impactMultiplier: number;
    }>;
    contributing_signals: string[];
  };
  adjusted_forecast: {
    predicted_daily_demand: number;
    predicted_7_day_demand: number;
    predicted_30_day_demand: number;
    days_remaining: number;
    shortage_quantity: number;
    stock_out_risk: InventoryRiskLevel;
    requires_supply_request: boolean;
  };
  disclaimer: string;
}



