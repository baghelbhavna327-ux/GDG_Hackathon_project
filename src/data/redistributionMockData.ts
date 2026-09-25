export interface RedistributionRecommendation {
  id: string;
  code: string;
  sourcePhc: string;
  sourceDistrict: string;
  sourceState: string;
  sourceSurplus: number;
  destinationPhc: string;
  destinationDistrict: string;
  destinationState: string;
  destinationShortage: number;
  resource: string;
  category: string;
  unit: string;
  recommendedQuantity: number;
  priority: 'EMERGENCY' | 'HIGH' | 'ROUTINE';
  estimatedDistanceKm: number;
  estimatedTransitTime: string;
  routeCorridor: string;
  reason: string;
  confidenceScore: number;
  patientsProtected: number;
  status: 'PENDING_APPROVAL' | 'ACCEPTED' | 'IN_TRANSIT';
}

export const mockRedistributionRecommendations: RedistributionRecommendation[] = [
  // Primary Example from prompt:
  {
    id: 'redist-001',
    code: 'REC-MP-7701',
    sourcePhc: 'Bhopal PHC-12',
    sourceDistrict: 'Bhopal',
    sourceState: 'Madhya Pradesh',
    sourceSurplus: 500,
    destinationPhc: 'Guna PHC-04',
    destinationDistrict: 'Guna',
    destinationState: 'Madhya Pradesh',
    destinationShortage: 150,
    resource: 'Paracetamol 500mg Tablets',
    category: 'Analgesics & Antipyretics',
    unit: 'units',
    recommendedQuantity: 150,
    priority: 'EMERGENCY',
    estimatedDistanceKm: 182,
    estimatedTransitTime: '1h 45m',
    routeCorridor: 'NH-46 North Highway',
    reason: 'Recipient PHC has predicted demand above available inventory (viral fever influx detected).',
    confidenceScore: 96.8,
    patientsProtected: 320,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'redist-002',
    code: 'REC-MP-7702',
    sourcePhc: 'PHC-B (Central Store Depot)',
    sourceDistrict: 'Bhopal Hub',
    sourceState: 'Madhya Pradesh',
    sourceSurplus: 800,
    destinationPhc: 'Indore PHC-08',
    destinationDistrict: 'Indore',
    destinationState: 'Madhya Pradesh',
    destinationShortage: 200,
    resource: 'ORS Rehydration Salts',
    category: 'Rehydration Salts',
    unit: 'packs',
    recommendedQuantity: 200,
    priority: 'HIGH',
    estimatedDistanceKm: 194,
    estimatedTransitTime: '2h 10m',
    routeCorridor: 'State Highway 18 (Indore-Bhopal Expressway)',
    reason: 'Recipient PHC has predicted demand above available inventory amid sudden seasonal dehydration cases.',
    confidenceScore: 94.2,
    patientsProtected: 410,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'redist-003',
    code: 'REC-MP-7703',
    sourcePhc: 'Gwalior PHC-06',
    sourceDistrict: 'Gwalior',
    sourceState: 'Madhya Pradesh',
    sourceSurplus: 350,
    destinationPhc: 'Shivpuri PHC-03',
    destinationDistrict: 'Shivpuri',
    destinationState: 'Madhya Pradesh',
    destinationShortage: 80,
    resource: 'Azithromycin 500mg Tablets',
    category: 'Antibiotics',
    unit: 'units',
    recommendedQuantity: 80,
    priority: 'HIGH',
    estimatedDistanceKm: 114,
    estimatedTransitTime: '1h 20m',
    routeCorridor: 'NH-44 Express Link',
    reason: 'Recipient PHC has predicted demand above available inventory with current stock dropping below 3 days.',
    confidenceScore: 91.5,
    patientsProtected: 160,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'redist-004',
    code: 'REC-MP-7704',
    sourcePhc: 'Jabalpur PHC-01',
    sourceDistrict: 'Jabalpur',
    sourceState: 'Madhya Pradesh',
    sourceSurplus: 220,
    destinationPhc: 'Guna PHC-04',
    destinationDistrict: 'Guna',
    destinationState: 'Madhya Pradesh',
    destinationShortage: 50,
    resource: 'Normal Saline (0.9% NaCl IV)',
    category: 'IV Fluids',
    unit: 'bottles',
    recommendedQuantity: 50,
    priority: 'EMERGENCY',
    estimatedDistanceKm: 278,
    estimatedTransitTime: '3h 15m',
    routeCorridor: 'NH-45 to NH-46 Link',
    reason: 'Recipient PHC has critical IV fluid shortage (<2 days runway) while source facility holds 45 days reserve.',
    confidenceScore: 95.0,
    patientsProtected: 95,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'redist-005',
    code: 'REC-MH-7705',
    sourcePhc: 'Pune PHC Hadapsar',
    sourceDistrict: 'Pune',
    sourceState: 'Maharashtra',
    sourceSurplus: 400,
    destinationPhc: 'Nagpur PHC Rural',
    destinationDistrict: 'Nagpur',
    destinationState: 'Maharashtra',
    destinationShortage: 60,
    resource: 'Atorvastatin 10mg Tablets',
    category: 'Cardiovascular',
    unit: 'units',
    recommendedQuantity: 60,
    priority: 'ROUTINE',
    estimatedDistanceKm: 710,
    estimatedTransitTime: 'Inter-district overnight convoy',
    routeCorridor: 'Samruddhi Mahamarg Corridor',
    reason: 'Recipient PHC has predicted demand above available inventory with stock expiring in nearest depot.',
    confidenceScore: 89.2,
    patientsProtected: 120,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'redist-006',
    code: 'REC-UP-7706',
    sourcePhc: 'Varanasi PHC Kashi',
    sourceDistrict: 'Varanasi',
    sourceState: 'Uttar Pradesh',
    sourceSurplus: 300,
    destinationPhc: 'Lucknow PHC Mohanlalganj',
    destinationDistrict: 'Lucknow',
    destinationState: 'Uttar Pradesh',
    destinationShortage: 70,
    resource: 'Ciprofloxacin 500mg Tablets',
    category: 'Antibiotics',
    unit: 'units',
    recommendedQuantity: 70,
    priority: 'HIGH',
    estimatedDistanceKm: 295,
    estimatedTransitTime: '3h 30m',
    routeCorridor: 'Purvanchal Expressway Corridor',
    reason: 'Recipient PHC has predicted demand above available inventory during seasonal gastro spike.',
    confidenceScore: 93.4,
    patientsProtected: 180,
    status: 'PENDING_APPROVAL',
  },
];
