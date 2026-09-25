/**
 * HealthChain AI - Simulated Demonstration Seed Data
 * 
 * DISCLAIMER:
 * This data is simulated strictly for hackathon prototyping, testing, and demonstration purposes.
 * It does NOT represent real patient records or official government healthcare data.
 */

// 1. 15 Commonly Used Essential Medicines
const medicinesData = [
  {
    name: 'Paracetamol 500mg',
    category: 'Analgesic / Antipyretic',
    unit: 'tablets',
    expiryDate: new Date('2026-11-30')
  },
  {
    name: 'Amoxicillin 500mg',
    category: 'Antibiotic',
    unit: 'capsules',
    expiryDate: new Date('2027-03-15')
  },
  {
    name: 'Oral Rehydration Salts (ORS)',
    category: 'Electrolyte',
    unit: 'sachets',
    expiryDate: new Date('2027-08-20')
  },
  {
    name: 'Azithromycin 250mg',
    category: 'Antibiotic',
    unit: 'tablets',
    expiryDate: new Date('2026-12-10')
  },
  {
    name: 'Cetirizine 10mg',
    category: 'Antihistamine',
    unit: 'tablets',
    expiryDate: new Date('2027-05-30')
  },
  {
    name: 'Metformin 500mg',
    category: 'Antidiabetic',
    unit: 'tablets',
    expiryDate: new Date('2026-09-15')
  },
  {
    name: 'Amlodipine 5mg',
    category: 'Antihypertensive',
    unit: 'tablets',
    expiryDate: new Date('2027-01-25')
  },
  {
    name: 'Iron & Folic Acid (IFA)',
    category: 'Supplement',
    unit: 'tablets',
    expiryDate: new Date('2026-10-05')
  },
  {
    name: 'Ibuprofen 400mg',
    category: 'NSAID / Anti-inflammatory',
    unit: 'tablets',
    expiryDate: new Date('2027-04-12')
  },
  {
    name: 'Salbutamol Inhaler 100mcg',
    category: 'Respiratory / Bronchodilator',
    unit: 'inhalers',
    expiryDate: new Date('2026-08-30')
  },
  {
    name: 'Dextromethorphan Syrup',
    category: 'Cough Suppressant',
    unit: 'bottles',
    expiryDate: new Date('2027-02-18')
  },
  {
    name: 'Pantoprazole 40mg',
    category: 'Antacid / PPI',
    unit: 'tablets',
    expiryDate: new Date('2027-06-20')
  },
  {
    name: 'Ciprofloxacin 500mg',
    category: 'Antibiotic',
    unit: 'tablets',
    expiryDate: new Date('2026-11-15')
  },
  {
    name: 'Insulin Glargine 100IU/ml',
    category: 'Antidiabetic / Cold-Chain',
    unit: 'vials',
    expiryDate: new Date('2026-07-22')
  },
  {
    name: 'Albendazole 400mg',
    category: 'Anthelmintic',
    unit: 'tablets',
    expiryDate: new Date('2027-10-10')
  }
];

// 2. 20 Realistic Primary Health Centres across 5 Indian States
const phcsData = [
  // --- MADHYA PRADESH ---
  {
    name: 'PHC Guna Central',
    district: 'Guna',
    state: 'Madhya Pradesh',
    location: { latitude: 24.654, longitude: 77.312 },
    totalBeds: 30,
    availableBeds: 4,
    staffCount: 12,
    activeStaff: 7,
    riskLevel: 'CRITICAL' // Critical medicine shortage & high occupancy
  },
  {
    name: 'PHC Bhopal West',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    location: { latitude: 23.2599, longitude: 77.4126 },
    totalBeds: 50,
    availableBeds: 36,
    staffCount: 20,
    activeStaff: 19,
    riskLevel: 'NORMAL' // High surplus
  },
  {
    name: 'PHC Indore Rural',
    district: 'Indore',
    state: 'Madhya Pradesh',
    location: { latitude: 22.7196, longitude: 75.8577 },
    totalBeds: 35,
    availableBeds: 8,
    staffCount: 15,
    activeStaff: 13,
    riskLevel: 'HIGH' // Low stock of ORS and Paracetamol
  },
  {
    name: 'PHC Shivpuri North',
    district: 'Shivpuri',
    state: 'Madhya Pradesh',
    location: { latitude: 25.432, longitude: 77.654 },
    totalBeds: 25,
    availableBeds: 14,
    staffCount: 10,
    activeStaff: 6,
    riskLevel: 'MEDIUM' // Staff shortage
  },

  // --- RAJASTHAN ---
  {
    name: 'PHC Jaipur Rural North',
    district: 'Jaipur',
    state: 'Rajasthan',
    location: { latitude: 26.9124, longitude: 75.7873 },
    totalBeds: 45,
    availableBeds: 32,
    staffCount: 18,
    activeStaff: 17,
    riskLevel: 'NORMAL' // Medicine surplus
  },
  {
    name: 'PHC Udaipur South',
    district: 'Udaipur',
    state: 'Rajasthan',
    location: { latitude: 24.5854, longitude: 73.7125 },
    totalBeds: 28,
    availableBeds: 3,
    staffCount: 11,
    activeStaff: 10,
    riskLevel: 'HIGH' // Bed shortage
  },
  {
    name: 'PHC Jodhpur Desert Edge',
    district: 'Jodhpur',
    state: 'Rajasthan',
    location: { latitude: 26.2389, longitude: 73.0243 },
    totalBeds: 30,
    availableBeds: 5,
    staffCount: 12,
    activeStaff: 7,
    riskLevel: 'CRITICAL' // ORS & Salbutamol shortage
  },
  {
    name: 'PHC Kota Industrial',
    district: 'Kota',
    state: 'Rajasthan',
    location: { latitude: 25.2138, longitude: 75.8648 },
    totalBeds: 40,
    availableBeds: 24,
    staffCount: 16,
    activeStaff: 15,
    riskLevel: 'NORMAL'
  },

  // --- MAHARASHTRA ---
  {
    name: 'PHC Pune East',
    district: 'Pune',
    state: 'Maharashtra',
    location: { latitude: 18.5204, longitude: 73.8567 },
    totalBeds: 50,
    availableBeds: 35,
    staffCount: 22,
    activeStaff: 21,
    riskLevel: 'NORMAL' // Surplus hub
  },
  {
    name: 'PHC Nagpur Rural',
    district: 'Nagpur',
    state: 'Maharashtra',
    location: { latitude: 21.1458, longitude: 79.0882 },
    totalBeds: 32,
    availableBeds: 6,
    staffCount: 14,
    activeStaff: 9,
    riskLevel: 'HIGH' // Antibiotic shortage
  },
  {
    name: 'PHC Nashik Tribal Belt',
    district: 'Nashik',
    state: 'Maharashtra',
    location: { latitude: 19.9975, longitude: 73.7898 },
    totalBeds: 24,
    availableBeds: 2,
    staffCount: 9,
    activeStaff: 5,
    riskLevel: 'CRITICAL' // Bed & staff crisis
  },
  {
    name: 'PHC Aurangabad North',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    location: { latitude: 19.8762, longitude: 75.3433 },
    totalBeds: 36,
    availableBeds: 20,
    staffCount: 15,
    activeStaff: 14,
    riskLevel: 'NORMAL'
  },

  // --- UTTAR PRADESH ---
  {
    name: 'PHC Varanasi Ghats',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    location: { latitude: 25.3176, longitude: 82.9739 },
    totalBeds: 40,
    availableBeds: 5,
    staffCount: 16,
    activeStaff: 11,
    riskLevel: 'HIGH' // High footfall demand spike
  },
  {
    name: 'PHC Lucknow Central Hub',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    location: { latitude: 26.8467, longitude: 80.9462 },
    totalBeds: 55,
    availableBeds: 38,
    staffCount: 24,
    activeStaff: 23,
    riskLevel: 'NORMAL' // High surplus
  },
  {
    name: 'PHC Kanpur South',
    district: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    location: { latitude: 26.4499, longitude: 80.3319 },
    totalBeds: 30,
    availableBeds: 7,
    staffCount: 13,
    activeStaff: 12,
    riskLevel: 'MEDIUM' // Moderate stock
  },
  {
    name: 'PHC Gorakhpur East',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    location: { latitude: 26.7606, longitude: 83.3732 },
    totalBeds: 28,
    availableBeds: 3,
    staffCount: 10,
    activeStaff: 6,
    riskLevel: 'CRITICAL' // High fever cluster / antipyretic shortage
  },

  // --- GUJARAT ---
  {
    name: 'PHC Ahmedabad Metro East',
    district: 'Ahmedabad',
    state: 'Gujarat',
    location: { latitude: 23.0225, longitude: 72.5714 },
    totalBeds: 60,
    availableBeds: 42,
    staffCount: 25,
    activeStaff: 24,
    riskLevel: 'NORMAL' // Key surplus hub
  },
  {
    name: 'PHC Surat Coastal',
    district: 'Surat',
    state: 'Gujarat',
    location: { latitude: 21.1702, longitude: 72.8311 },
    totalBeds: 38,
    availableBeds: 10,
    staffCount: 17,
    activeStaff: 16,
    riskLevel: 'MEDIUM'
  },
  {
    name: 'PHC Rajkot West',
    district: 'Rajkot',
    state: 'Gujarat',
    location: { latitude: 22.3039, longitude: 70.8022 },
    totalBeds: 30,
    availableBeds: 18,
    staffCount: 14,
    activeStaff: 13,
    riskLevel: 'NORMAL'
  },
  {
    name: 'PHC Kutch Rural Outpost',
    district: 'Kutch',
    state: 'Gujarat',
    location: { latitude: 23.242, longitude: 69.6669 },
    totalBeds: 20,
    availableBeds: 2,
    staffCount: 8,
    activeStaff: 4,
    riskLevel: 'CRITICAL' // Extreme remote shortage
  }
];

module.exports = {
  medicinesData,
  phcsData
};
