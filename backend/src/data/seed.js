/**
 * HealthChain AI - Automated MongoDB Database Seeder
 * 
 * Populates realistic simulated data across:
 * - 20 PHCs
 * - 15 Essential Medicines
 * - Complete Inventory Records
 * - Bed Capacities & Occupancies
 * - Staff Attendance Records
 * - 7 Days of Patient Footfall
 * - 18 Critical & Warning Alerts
 * - 15 AI Demand Forecasts
 * - 8 Resource Redistribution Recommendations
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { medicinesData, phcsData } = require('./seedData');
const {
  PHC,
  Medicine,
  Inventory,
  Bed,
  Staff,
  PatientFootfall,
  Alert,
  Prediction,
  ResourceTransfer,
  User
} = require('../models');

// Load env vars
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthchain-ai';

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seeder] Connected successfully.');

    // 1. Clear existing collections
    console.log('[Seeder] Clearing previous collections...');
    await Promise.all([
      PHC.deleteMany({}),
      Medicine.deleteMany({}),
      Inventory.deleteMany({}),
      Bed.deleteMany({}),
      Staff.deleteMany({}),
      PatientFootfall.deleteMany({}),
      Alert.deleteMany({}),
      Prediction.deleteMany({}),
      ResourceTransfer.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('[Seeder] Old data cleared.');

    // 2. Insert Medicines
    console.log('[Seeder] Seeding 15 essential medicines...');
    const insertedMedicines = await Medicine.insertMany(medicinesData);
    const medMap = {};
    insertedMedicines.forEach(med => {
      medMap[med.name] = med;
    });

    // 3. Insert PHCs
    console.log('[Seeder] Seeding 20 Primary Health Centres...');
    const insertedPHCs = await PHC.insertMany(phcsData);
    const phcMap = {};
    insertedPHCs.forEach(phc => {
      phcMap[phc.name] = phc;
    });

    // 4. Generate Inventory & Bed Records for all 20 PHCs
    console.log('[Seeder] Generating inventories and bed allocations...');
    const inventoryDocs = [];
    const bedDocs = [];
    const staffDocs = [];
    const footfallDocs = [];

    // Helper roles
    const staffRoles = [
      { name: 'Dr. Rajesh Sharma', role: 'Medical Officer' },
      { name: 'Sunita Patil', role: 'Staff Nurse' },
      { name: 'Amit Verma', role: 'Pharmacist' },
      { name: 'Pooja Nair', role: 'Lab Technician' },
      { name: 'Ramesh Yadav', role: 'ANM Health Worker' }
    ];

    insertedPHCs.forEach(phc => {
      // Bed record
      const occupied = Math.max(0, phc.totalBeds - phc.availableBeds);
      bedDocs.push({
        phcId: phc._id,
        totalBeds: phc.totalBeds,
        occupiedBeds: occupied,
        availableBeds: phc.availableBeds,
        lastUpdated: new Date()
      });

      // Staff records
      staffRoles.forEach((roleInfo, idx) => {
        const isPresent = idx < Math.round((phc.activeStaff / phc.staffCount) * staffRoles.length);
        staffDocs.push({
          phcId: phc._id,
          name: `${roleInfo.name} (${phc.district})`,
          role: roleInfo.role,
          attendanceStatus: isPresent ? 'PRESENT' : 'ABSENT',
          attendancePercentage: isPresent ? Math.floor(88 + Math.random() * 12) : Math.floor(40 + Math.random() * 20),
          date: new Date()
        });
      });

      // 7-day patient footfall
      for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
        const footfallDate = new Date();
        footfallDate.setDate(footfallDate.getDate() - dayOffset);

        // Calculate realistic footfall based on risk level and bed capacity
        const baseFootfall = phc.riskLevel === 'CRITICAL' ? 140 : phc.riskLevel === 'HIGH' ? 110 : 80;
        const variation = Math.floor(Math.random() * 30) - 15;
        const patientCount = Math.max(20, baseFootfall + variation);

        footfallDocs.push({
          phcId: phc._id,
          date: footfallDate,
          patientCount
        });
      }

      // Inventory across medicines
      insertedMedicines.forEach(med => {
        let currentStock = 300;
        let dailyUsage = 20;

        if (phc.riskLevel === 'CRITICAL') {
          // Critical PHCs have low stock & high usage (2-4 days remaining)
          if (med.name.includes('Paracetamol') || med.name.includes('ORS') || med.name.includes('Amoxicillin')) {
            dailyUsage = 35;
            currentStock = 105; // 3 days remaining
          } else {
            dailyUsage = 15;
            currentStock = 90; // 6 days
          }
        } else if (phc.riskLevel === 'HIGH') {
          // Low stock PHCs (4-8 days remaining)
          if (med.name.includes('ORS') || med.name.includes('Azithromycin')) {
            dailyUsage = 25;
            currentStock = 125; // 5 days remaining
          } else {
            dailyUsage = 20;
            currentStock = 220; // 11 days
          }
        } else if (phc.riskLevel === 'NORMAL') {
          // Surplus hubs (20-40 days remaining)
          dailyUsage = 25;
          currentStock = 850; // 34 days
        } else {
          // Medium / Normal
          dailyUsage = 18;
          currentStock = 360; // 20 days
        }

        inventoryDocs.push({
          phcId: phc._id,
          medicineId: med._id,
          currentStock,
          dailyUsage,
          reorderLevel: dailyUsage * 7, // 7-day safety buffer
          lastUpdated: new Date()
        });
      });
    });

    await Promise.all([
      Inventory.insertMany(inventoryDocs),
      Bed.insertMany(bedDocs),
      Staff.insertMany(staffDocs),
      PatientFootfall.insertMany(footfallDocs)
    ]);
    console.log(`[Seeder] Seeded ${inventoryDocs.length} inventories, ${bedDocs.length} bed records, ${staffDocs.length} staff records, ${footfallDocs.length} footfall entries.`);

    // 5. Seed 18 Realistic Alerts
    console.log('[Seeder] Seeding 18 system alerts...');
    const alertList = [
      {
        phcId: phcMap['PHC Guna Central']?._id,
        type: 'STOCK_OUT',
        severity: 'CRITICAL',
        title: 'Critical Paracetamol & ORS Depletion',
        message: 'Current Paracetamol inventory at Guna Central is 105 units with daily consumption of 35 units (3 days of stock remaining). Stock-out imminent.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Guna Central']?._id,
        type: 'BED_SHORTAGE',
        severity: 'CRITICAL',
        title: 'Emergency Ward Bed Crunch (87% Occupied)',
        message: 'Only 4 beds available out of 30 total capacity. Inpatient triage redirection advised.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Nashik Tribal Belt']?._id,
        type: 'STAFF_SHORTAGE',
        severity: 'CRITICAL',
        title: 'Severe Clinician Absenteeism',
        message: 'Active staff attendance dropped to 55%. Emergency rotational physician needed from Nashik Civil.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Gorakhpur East']?._id,
        type: 'EMERGENCY',
        severity: 'CRITICAL',
        title: 'Seasonal Encephalitis & Acute Fever Cluster',
        message: 'Patient footfall increased by +68% over past 48 hours. Urgent restocking of antipyretics and IV fluids required.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Kutch Rural Outpost']?._id,
        type: 'STOCK_OUT',
        severity: 'CRITICAL',
        title: 'Insulin Cold-Chain Stock Depleted',
        message: 'Insulin Glargine stock reached 0 units. 14 registered diabetic patients awaiting monthly quota.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Jodhpur Desert Edge']?._id,
        type: 'STOCK_OUT',
        severity: 'CRITICAL',
        title: 'ORS & Heat-Stroke Kit Depletion',
        message: 'Extreme desert temperature surge caused rapid exhaustion of electrolyte supplies.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Indore Rural']?._id,
        type: 'STOCK_OUT',
        severity: 'WARNING',
        title: 'Amoxicillin Below Reorder Level',
        message: 'Stock remaining is 125 capsules against weekly projected burn rate of 175 units.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Udaipur South']?._id,
        type: 'BED_SHORTAGE',
        severity: 'WARNING',
        title: 'High Inpatient Bed Occupancy (89%)',
        message: '25 of 28 beds occupied. Maternity wing operating at maximum safe density.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Nagpur Rural']?._id,
        type: 'STOCK_OUT',
        severity: 'WARNING',
        title: 'Azithromycin Stock Approaching Low Threshold',
        message: '6 days of supply remaining based on current local respiratory viral cases.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Varanasi Ghats']?._id,
        type: 'EMERGENCY',
        severity: 'WARNING',
        title: 'High Pilgrim Footfall Influx',
        message: 'Footfall surge of +42% recorded today. Demand for IFA and Cetirizine trending upward.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Shivpuri North']?._id,
        type: 'STAFF_SHORTAGE',
        severity: 'WARNING',
        title: 'Pharmacist Shift Vacancy',
        message: 'Dispensing pharmacist on medical leave. Auxiliary nurse handling prescription dispensing.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Surat Coastal']?._id,
        type: 'EXPIRING_MEDICINE',
        severity: 'WARNING',
        title: 'Expiring Batch: Albendazole 400mg',
        message: '120 units set to reach expiry threshold within 45 days. Prioritize mass deworming drive.',
        status: 'ACTIVE'
      },
      {
        phcId: phcMap['PHC Kanpur South']?._id,
        type: 'GENERAL',
        severity: 'INFO',
        title: 'Routine Monthly Stock Audit Completed',
        message: 'Physical inventory reconciliation matched digital ledger with 99.4% accuracy.',
        status: 'ACKNOWLEDGED'
      },
      {
        phcId: phcMap['PHC Pune East']?._id,
        type: 'GENERAL',
        severity: 'INFO',
        title: 'Surplus Buffer Available for Redistribution',
        message: 'Surplus of 850 units of Paracetamol & Amoxicillin validated for inter-district transit.',
        status: 'ACKNOWLEDGED'
      },
      {
        phcId: phcMap['PHC Bhopal West']?._id,
        type: 'GENERAL',
        severity: 'INFO',
        title: 'Regional Cold-Chain Storage Operational',
        message: 'All vaccine and insulin coolers maintained at standard 2°C - 8°C optimal range.',
        status: 'ACKNOWLEDGED'
      },
      {
        phcId: phcMap['PHC Ahmedabad Metro East']?._id,
        type: 'GENERAL',
        severity: 'INFO',
        title: 'Automated Stock Replenishment Delivered',
        message: 'State central warehouse shipment of 5,000 general medical units checked into inventory.',
        status: 'RESOLVED'
      },
      {
        phcId: phcMap['PHC Jaipur Rural North']?._id,
        type: 'GENERAL',
        severity: 'INFO',
        title: 'Solar Backup Grid Operational',
        message: 'Primary power stability test passed. 100% cold-chain uptime ensured.',
        status: 'RESOLVED'
      },
      {
        phcId: phcMap['PHC Rajkot West']?._id,
        type: 'GENERAL',
        severity: 'INFO',
        title: 'Telemedicine Consultation Link Active',
        message: 'Specialist tele-cardiology clinic running at capacity with Rajkot District Hospital.',
        status: 'RESOLVED'
      }
    ].filter(a => a.phcId);

    await Alert.insertMany(alertList);
    console.log(`[Seeder] Seeded ${alertList.length} alerts.`);

    // 6. Seed 15 AI Demand Forecast Records
    console.log('[Seeder] Seeding 15 AI prediction records...');
    const predictionsList = [
      {
        phcId: phcMap['PHC Guna Central']?._id,
        medicineId: medMap['Paracetamol 500mg']?._id,
        currentStock: 105,
        predictedDemand: 245,
        forecastDays: 7,
        stockOutRisk: 'CRITICAL',
        shortageQuantity: 140
      },
      {
        phcId: phcMap['PHC Guna Central']?._id,
        medicineId: medMap['Oral Rehydration Salts (ORS)']?._id,
        currentStock: 90,
        predictedDemand: 210,
        forecastDays: 7,
        stockOutRisk: 'CRITICAL',
        shortageQuantity: 120
      },
      {
        phcId: phcMap['PHC Nashik Tribal Belt']?._id,
        medicineId: medMap['Amoxicillin 500mg']?._id,
        currentStock: 80,
        predictedDemand: 195,
        forecastDays: 7,
        stockOutRisk: 'CRITICAL',
        shortageQuantity: 115
      },
      {
        phcId: phcMap['PHC Gorakhpur East']?._id,
        medicineId: medMap['Paracetamol 500mg']?._id,
        currentStock: 110,
        predictedDemand: 280,
        forecastDays: 7,
        stockOutRisk: 'CRITICAL',
        shortageQuantity: 170
      },
      {
        phcId: phcMap['PHC Jodhpur Desert Edge']?._id,
        medicineId: medMap['Oral Rehydration Salts (ORS)']?._id,
        currentStock: 75,
        predictedDemand: 260,
        forecastDays: 7,
        stockOutRisk: 'CRITICAL',
        shortageQuantity: 185
      },
      {
        phcId: phcMap['PHC Kutch Rural Outpost']?._id,
        medicineId: medMap['Insulin Glargine 100IU/ml']?._id,
        currentStock: 5,
        predictedDemand: 45,
        forecastDays: 7,
        stockOutRisk: 'CRITICAL',
        shortageQuantity: 40
      },
      {
        phcId: phcMap['PHC Indore Rural']?._id,
        medicineId: medMap['Azithromycin 250mg']?._id,
        currentStock: 125,
        predictedDemand: 175,
        forecastDays: 7,
        stockOutRisk: 'HIGH',
        shortageQuantity: 50
      },
      {
        phcId: phcMap['PHC Udaipur South']?._id,
        medicineId: medMap['Salbutamol Inhaler 100mcg']?._id,
        currentStock: 40,
        predictedDemand: 75,
        forecastDays: 7,
        stockOutRisk: 'HIGH',
        shortageQuantity: 35
      },
      {
        phcId: phcMap['PHC Nagpur Rural']?._id,
        medicineId: medMap['Cetirizine 10mg']?._id,
        currentStock: 130,
        predictedDemand: 180,
        forecastDays: 7,
        stockOutRisk: 'HIGH',
        shortageQuantity: 50
      },
      {
        phcId: phcMap['PHC Varanasi Ghats']?._id,
        medicineId: medMap['Pantoprazole 40mg']?._id,
        currentStock: 140,
        predictedDemand: 190,
        forecastDays: 7,
        stockOutRisk: 'MEDIUM',
        shortageQuantity: 50
      },
      {
        phcId: phcMap['PHC Shivpuri North']?._id,
        medicineId: medMap['Ibuprofen 400mg']?._id,
        currentStock: 180,
        predictedDemand: 190,
        forecastDays: 7,
        stockOutRisk: 'MEDIUM',
        shortageQuantity: 10
      },
      {
        phcId: phcMap['PHC Bhopal West']?._id,
        medicineId: medMap['Paracetamol 500mg']?._id,
        currentStock: 850,
        predictedDemand: 200,
        forecastDays: 7,
        stockOutRisk: 'LOW',
        shortageQuantity: 0
      },
      {
        phcId: phcMap['PHC Pune East']?._id,
        medicineId: medMap['Amoxicillin 500mg']?._id,
        currentStock: 920,
        predictedDemand: 210,
        forecastDays: 7,
        stockOutRisk: 'LOW',
        shortageQuantity: 0
      },
      {
        phcId: phcMap['PHC Lucknow Central Hub']?._id,
        medicineId: medMap['Paracetamol 500mg']?._id,
        currentStock: 1100,
        predictedDemand: 250,
        forecastDays: 7,
        stockOutRisk: 'LOW',
        shortageQuantity: 0
      },
      {
        phcId: phcMap['PHC Ahmedabad Metro East']?._id,
        medicineId: medMap['Insulin Glargine 100IU/ml']?._id,
        currentStock: 180,
        predictedDemand: 35,
        forecastDays: 7,
        stockOutRisk: 'LOW',
        shortageQuantity: 0
      }
    ].filter(p => p.phcId && p.medicineId);

    await Prediction.insertMany(predictionsList);
    console.log(`[Seeder] Seeded ${predictionsList.length} AI prediction records.`);

    // 7. Seed 8 Resource Redistribution Recommendations
    console.log('[Seeder] Seeding 8 resource redistribution recommendations...');
    const transferList = [
      {
        sourcePhcId: phcMap['PHC Bhopal West']?._id,
        destinationPhcId: phcMap['PHC Guna Central']?._id,
        medicineId: medMap['Paracetamol 500mg']?._id,
        availableSurplus: 650,
        predictedShortage: 140,
        recommendedQuantity: 150,
        priority: 'CRITICAL',
        status: 'PENDING',
        reason: 'Recipient PHC Guna Central has only 3 days of stock remaining with predicted severe outbreak demand.',
        estimatedDistance: 198
      },
      {
        sourcePhcId: phcMap['PHC Bhopal West']?._id,
        destinationPhcId: phcMap['PHC Guna Central']?._id,
        medicineId: medMap['Oral Rehydration Salts (ORS)']?._id,
        availableSurplus: 500,
        predictedShortage: 120,
        recommendedQuantity: 130,
        priority: 'CRITICAL',
        status: 'PENDING',
        reason: 'Critical depletion of electrolyte reserves during heat advisory.',
        estimatedDistance: 198
      },
      {
        sourcePhcId: phcMap['PHC Pune East']?._id,
        destinationPhcId: phcMap['PHC Nashik Tribal Belt']?._id,
        medicineId: medMap['Amoxicillin 500mg']?._id,
        availableSurplus: 700,
        predictedShortage: 115,
        recommendedQuantity: 120,
        priority: 'CRITICAL',
        status: 'PENDING',
        reason: 'Nashik Tribal PHC facing severe antibiotic stock-out with high pediatric infection load.',
        estimatedDistance: 212
      },
      {
        sourcePhcId: phcMap['PHC Lucknow Central Hub']?._id,
        destinationPhcId: phcMap['PHC Gorakhpur East']?._id,
        medicineId: medMap['Paracetamol 500mg']?._id,
        availableSurplus: 850,
        predictedShortage: 170,
        recommendedQuantity: 200,
        priority: 'CRITICAL',
        status: 'PENDING',
        reason: 'Gorakhpur experiencing +68% acute fever footfall spike.',
        estimatedDistance: 270
      },
      {
        sourcePhcId: phcMap['PHC Jaipur Rural North']?._id,
        destinationPhcId: phcMap['PHC Jodhpur Desert Edge']?._id,
        medicineId: medMap['Oral Rehydration Salts (ORS)']?._id,
        availableSurplus: 450,
        predictedShortage: 185,
        recommendedQuantity: 200,
        priority: 'HIGH',
        status: 'ACCEPTED',
        reason: 'Desert high-temperature emergency dispatch approved by State Directorate.',
        estimatedDistance: 330
      },
      {
        sourcePhcId: phcMap['PHC Ahmedabad Metro East']?._id,
        destinationPhcId: phcMap['PHC Kutch Rural Outpost']?._id,
        medicineId: medMap['Insulin Glargine 100IU/ml']?._id,
        availableSurplus: 145,
        predictedShortage: 40,
        recommendedQuantity: 40,
        priority: 'HIGH',
        status: 'IN_TRANSIT',
        reason: 'Cold-chain vehicle dispatched with refrigerated insulin cartridges.',
        estimatedDistance: 380
      },
      {
        sourcePhcId: phcMap['PHC Pune East']?._id,
        destinationPhcId: phcMap['PHC Nagpur Rural']?._id,
        medicineId: medMap['Cetirizine 10mg']?._id,
        availableSurplus: 600,
        predictedShortage: 50,
        recommendedQuantity: 60,
        priority: 'MEDIUM',
        status: 'COMPLETED',
        reason: 'Proactive seasonal allergy prevention transfer completed successfully.',
        estimatedDistance: 710
      },
      {
        sourcePhcId: phcMap['PHC Jaipur Rural North']?._id,
        destinationPhcId: phcMap['PHC Udaipur South']?._id,
        medicineId: medMap['Salbutamol Inhaler 100mcg']?._id,
        availableSurplus: 220,
        predictedShortage: 35,
        recommendedQuantity: 40,
        priority: 'MEDIUM',
        status: 'COMPLETED',
        reason: 'Balanced regional redistribution to support high elevation asthma patients.',
        estimatedDistance: 395
      }
    ].filter(t => t.sourcePhcId && t.destinationPhcId && t.medicineId);

    await ResourceTransfer.insertMany(transferList);
    console.log(`[Seeder] Seeded ${transferList.length} redistribution transfers.`);

    // 10. Seed Default User Accounts
    console.log('[Seeder] Seeding default authentication accounts...');
    const defaultUsers = [
      {
        name: 'Dr. Rachel Vance',
        email: 'admin@healthchain.gov.in',
        password: 'Admin@123456',
        role: 'admin',
        department: 'Regional Healthcare Crisis Directorate',
        facility: 'National Command Center',
        phoneNumber: '+91 98111 22334',
        dutyStatus: 'on_duty'
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'worker@healthchain.gov.in',
        password: 'Worker@123456',
        role: 'health_worker',
        department: 'Primary Healthcare Operations',
        facility: 'PHC Sehore North',
        phoneNumber: '+91 98222 33445',
        dutyStatus: 'on_duty'
      },
      {
        name: 'Rajesh Gupta',
        email: 'viewer@healthchain.gov.in',
        password: 'Viewer@123456',
        role: 'viewer',
        department: 'Public Health Telemetry & Oversight',
        facility: 'State Health Mission Registry',
        phoneNumber: '+91 98333 44556',
        dutyStatus: 'on_duty'
      }
    ];

    for (const userData of defaultUsers) {
      await User.create(userData);
    }
    console.log(`[Seeder] Seeded ${defaultUsers.length} user accounts.`);

    console.log('----------------------------------------------------');
    console.log('✅ HealthChain AI Database Seeding Complete!');
    console.log(`- PHCs: ${insertedPHCs.length}`);
    console.log(`- Medicines: ${insertedMedicines.length}`);
    console.log(`- Inventories: ${inventoryDocs.length}`);
    console.log(`- Bed Records: ${bedDocs.length}`);
    console.log(`- Staff Records: ${staffDocs.length}`);
    console.log(`- Footfall Records: ${footfallDocs.length}`);
    console.log(`- Alerts: ${alertList.length}`);
    console.log(`- Predictions: ${predictionsList.length}`);
    console.log(`- Transfers: ${transferList.length}`);
    console.log(`- Users: ${defaultUsers.length}`);
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    console.log('[Seeder] Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
