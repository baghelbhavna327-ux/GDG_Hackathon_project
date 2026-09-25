/**
 * Emergency Simulation Predefined Mock Dataset
 * 
 * DISCLAIMER:
 * This dataset is a frontend simulation tool using predefined mock values
 * designed to demonstrate how healthcare authorities can visualize, model,
 * and respond to changing resource and medicine demands during an acute crisis.
 */

export interface SimulationStateData {
  statusTitle: string;
  patientFootfall: string;
  patientFootfallValue: number;
  patientFootfallChange: string;
  medicineDemand: string;
  medicineDemandChange: string;
  criticalPhcs: number;
  criticalPhcsChange: string;
  bedOccupancy: string;
  bedOccupancyPct: number;
  bedOccupancyChange: string;
  activeSurgeEventName?: string;
  bannerDescription: string;
  footfallChartData: { day: string; actualVisits: number; simulatedCrisisVisits: number }[];
  medicineDemandChartData: { medicine: string; normalDemand: number; emergencyDemand: number; availableStock: number }[];
  criticalPhcList: {
    name: string;
    district: string;
    state: string;
    bedOccupancy: string;
    occupancyPct: number;
    medicineRunway: string;
    status: 'critical' | 'warning' | 'normal';
    emergencyNeed: string;
  }[];
  recommendedTransfers: {
    id: string;
    resource: string;
    quantity: number;
    unit: string;
    from: string;
    to: string;
    eta: string;
    priority: 'EMERGENCY' | 'HIGH';
    reason: string;
  }[];
}

// 1. Normal Operations Predefined Mock Data
export const normalOperationsData: SimulationStateData = {
  statusTitle: 'NORMAL OPERATIONS',
  patientFootfall: '1,240/day',
  patientFootfallValue: 1240,
  patientFootfallChange: 'Baseline steady (±2%)',
  medicineDemand: 'Normal',
  medicineDemandChange: 'Standard replenishment cycle',
  criticalPhcs: 8,
  criticalPhcsChange: 'Under regional threshold',
  bedOccupancy: '52%',
  bedOccupancyPct: 52,
  bedOccupancyChange: 'Optimal headroom available (48% free)',
  bannerDescription: 'Healthcare grid is operating within standard seasonal bounds. All primary supply chains and regional buffers are stable.',
  footfallChartData: [
    { day: 'Day 1', actualVisits: 1180, simulatedCrisisVisits: 1180 },
    { day: 'Day 2', actualVisits: 1220, simulatedCrisisVisits: 1220 },
    { day: 'Day 3', actualVisits: 1205, simulatedCrisisVisits: 1205 },
    { day: 'Day 4', actualVisits: 1240, simulatedCrisisVisits: 1240 },
    { day: 'Day 5', actualVisits: 1210, simulatedCrisisVisits: 1210 },
    { day: 'Day 6', actualVisits: 1260, simulatedCrisisVisits: 1260 },
    { day: 'Day 7', actualVisits: 1240, simulatedCrisisVisits: 1240 },
  ],
  medicineDemandChartData: [
    { medicine: 'Paracetamol', normalDemand: 160, emergencyDemand: 160, availableStock: 480 },
    { medicine: 'ORS Sachets', normalDemand: 80, emergencyDemand: 80, availableStock: 350 },
    { medicine: 'Normal Saline IV', normalDemand: 45, emergencyDemand: 45, availableStock: 190 },
    { medicine: 'Azithromycin', normalDemand: 60, emergencyDemand: 60, availableStock: 220 },
    { medicine: 'Medical Oxygen', normalDemand: 120, emergencyDemand: 120, availableStock: 400 },
  ],
  criticalPhcList: [
    { name: 'Guna PHC-04', district: 'Guna', state: 'Madhya Pradesh', bedOccupancy: '24 / 40 Beds', occupancyPct: 60, medicineRunway: '6.5 Days', status: 'warning', emergencyNeed: 'Routine restock' },
    { name: 'Shivpuri PHC-03', district: 'Shivpuri', state: 'Madhya Pradesh', bedOccupancy: '16 / 35 Beds', occupancyPct: 45, medicineRunway: '8.2 Days', status: 'normal', emergencyNeed: 'None' },
    { name: 'Indore PHC-08', district: 'Indore', state: 'Madhya Pradesh', bedOccupancy: '48 / 80 Beds', occupancyPct: 60, medicineRunway: '5.4 Days', status: 'warning', emergencyNeed: 'Routine ORS supply' },
    { name: 'Lucknow PHC-09', district: 'Lucknow', state: 'Uttar Pradesh', bedOccupancy: '22 / 45 Beds', occupancyPct: 48, medicineRunway: '7.1 Days', status: 'normal', emergencyNeed: 'None' },
  ],
  recommendedTransfers: [
    {
      id: 'sim-trf-01',
      resource: 'Paracetamol 500mg',
      quantity: 50,
      unit: 'units',
      from: 'Bhopal Central Store',
      to: 'Guna PHC-04',
      eta: '2h 15m',
      priority: 'HIGH',
      reason: 'Scheduled routine weekly redistribution.',
    },
  ],
};

// 2. Emergency Mode Active Predefined Mock Data
export const emergencyModeData: SimulationStateData = {
  statusTitle: 'EMERGENCY MODE ACTIVE',
  patientFootfall: '+65%',
  patientFootfallValue: 2046, // 1240 * 1.65
  patientFootfallChange: 'Surge from 1,240 to 2,046 visits/day',
  medicineDemand: '+72%',
  medicineDemandChange: 'Critical burn rate spike across all antimicrobials & IV fluids',
  criticalPhcs: 24,
  criticalPhcsChange: '16 additional PHCs breached red threshold',
  bedOccupancy: '82%',
  bedOccupancyPct: 82,
  bedOccupancyChange: 'Severe capacity crunch (Only 18% beds free)',
  activeSurgeEventName: 'Simulated Regional Viral Outbreak & Acute Respiratory Surge (Central Zone)',
  bannerDescription: 'CRISIS PROTOCOL ACTIVE: High-velocity outpatient intake detected across 24 Primary Health Centers. Autonomous resource rebalancing protocols have been triggered to avert critical stock-outs and bed bottlenecks.',
  footfallChartData: [
    { day: 'Day 1', actualVisits: 1180, simulatedCrisisVisits: 1210 },
    { day: 'Day 2', actualVisits: 1220, simulatedCrisisVisits: 1350 },
    { day: 'Day 3', actualVisits: 1205, simulatedCrisisVisits: 1540 },
    { day: 'Day 4', actualVisits: 1240, simulatedCrisisVisits: 1780 },
    { day: 'Day 5', actualVisits: 1210, simulatedCrisisVisits: 1920 },
    { day: 'Day 6', actualVisits: 1260, simulatedCrisisVisits: 2010 },
    { day: 'Day 7 (Peak)', actualVisits: 1240, simulatedCrisisVisits: 2046 },
  ],
  medicineDemandChartData: [
    { medicine: 'Paracetamol', normalDemand: 160, emergencyDemand: 380, availableStock: 120 }, // Deficit
    { medicine: 'ORS Sachets', normalDemand: 80, emergencyDemand: 220, availableStock: 80 },  // Deficit
    { medicine: 'Normal Saline IV', normalDemand: 45, emergencyDemand: 140, availableStock: 40 }, // Deficit
    { medicine: 'Azithromycin', normalDemand: 60, emergencyDemand: 150, availableStock: 65 },  // Deficit
    { medicine: 'Medical Oxygen', normalDemand: 120, emergencyDemand: 280, availableStock: 140 }, // Deficit
  ],
  criticalPhcList: [
    { name: 'Guna PHC-04', district: 'Guna', state: 'Madhya Pradesh', bedOccupancy: '38 / 40 Beds', occupancyPct: 95, medicineRunway: '1.2 Days', status: 'critical', emergencyNeed: 'Immediate Paracetamol (150u) & Saline IV (50b)' },
    { name: 'Indore PHC-08', district: 'Indore', state: 'Madhya Pradesh', bedOccupancy: '76 / 80 Beds', occupancyPct: 95, medicineRunway: '1.8 Days', status: 'critical', emergencyNeed: 'Immediate ORS (200p) & Oxygen Cylinders' },
    { name: 'Lucknow PHC Mohanlalganj', district: 'Lucknow', state: 'Uttar Pradesh', bedOccupancy: '41 / 45 Beds', occupancyPct: 91, medicineRunway: '1.9 Days', status: 'critical', emergencyNeed: 'Emergency Ciprofloxacin & Dextrose IV' },
    { name: 'Patna PHC Danapur', district: 'Patna', state: 'Bihar', bedOccupancy: '38 / 40 Beds', occupancyPct: 95, medicineRunway: '1.1 Days', status: 'critical', emergencyNeed: 'Antimalarials & Emergency Antibiotics' },
    { name: 'Bhopal PHC-12', district: 'Bhopal', state: 'Madhya Pradesh', bedOccupancy: '39 / 45 Beds', occupancyPct: 86.6, medicineRunway: '2.4 Days', status: 'critical', emergencyNeed: 'Emergency float nurses & ORS supply' },
    { name: 'Shivpuri PHC-03', district: 'Shivpuri', state: 'Madhya Pradesh', bedOccupancy: '29 / 35 Beds', occupancyPct: 82.8, medicineRunway: '2.6 Days', status: 'critical', emergencyNeed: 'Azithromycin & Step-down beds' },
  ],
  recommendedTransfers: [
    {
      id: 'sim-trf-101',
      resource: 'Paracetamol 500mg (10x10 Strips)',
      quantity: 150,
      unit: 'units',
      from: 'PHC-B Central Store Depot',
      to: 'Guna PHC-04',
      eta: '1h 45m via NH-46',
      priority: 'EMERGENCY',
      reason: 'Averts 100% stock-out risk for 320 acute fever patients.',
    },
    {
      id: 'sim-trf-102',
      resource: 'ORS WHO Formulation Sachets',
      quantity: 200,
      unit: 'packs',
      from: 'PHC-B Central Store Depot',
      to: 'Indore PHC-08',
      eta: '2h 10m via SH-18',
      priority: 'EMERGENCY',
      reason: 'Prevents acute dehydration shortfall amid +72% surge.',
    },
    {
      id: 'sim-trf-103',
      resource: 'Normal Saline (0.9% NaCl IV Fluids)',
      quantity: 50,
      unit: 'bottles',
      from: 'Jabalpur Regional Hub',
      to: 'Guna PHC-04',
      eta: '3h 15m via NH-45',
      priority: 'EMERGENCY',
      reason: 'Restores critical emergency infusion buffer from 1.2 to 5.8 days.',
    },
    {
      id: 'sim-trf-104',
      resource: 'Azithromycin 500mg Tablets',
      quantity: 80,
      unit: 'units',
      from: 'Gwalior PHC-06',
      to: 'Shivpuri PHC-03',
      eta: '1h 20m via NH-44',
      priority: 'HIGH',
      reason: 'Rebalances antibiotic supply to meet acute respiratory surge.',
    },
  ],
};
