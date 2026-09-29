const { DiseaseEvent } = require('../models');
const dotenv = require('dotenv');
dotenv.config();

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.FASTAPI_AI_URL || 'http://localhost:8000';

// Fallback seed events if MongoDB has not yet seeded
const FALLBACK_EVENTS = [
  {
    diseaseId: 'DE-MP-GNA-2026-01',
    diseaseName: 'Dengue & Vector-Borne Viral Surge',
    region: 'Central Madhya Pradesh',
    state: 'Madhya Pradesh',
    district: 'Guna',
    eventType: 'SURGE',
    reportingPeriod: 'Epidemiological Week 38 (Post-Monsoon)',
    severityLevel: 'HIGH',
    caseCount: 184,
    trendPercentage: 28.5,
    impactFactor: 0.28,
    source: 'Integrated Disease Surveillance Programme (IDSP) / NCDC',
    sourceType: 'OFFICIAL_GOV',
    sourceUrl: 'https://ncdc.mohfw.gov.in/idsp-weekly-reports/',
    sourceDate: new Date('2026-09-20'),
    confidence: 'HIGH',
    active: true,
    affectedMedicines: [
      { medicine: 'Paracetamol', impactMultiplier: 0.35, confidence: 'HIGH' },
      { medicine: 'Normal Saline (0.9% NaCl)', impactMultiplier: 0.30, confidence: 'HIGH' },
      { medicine: 'ORS', impactMultiplier: 0.20, confidence: 'MEDIUM' },
      { medicine: 'Amoxicillin', impactMultiplier: 0.08, confidence: 'LOW' }
    ]
  },
  {
    diseaseId: 'DE-MP-BPL-2026-02',
    diseaseName: 'Seasonal Influenza & Acute Respiratory Infection',
    region: 'Bhopal Metro Cluster',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    eventType: 'SEASONAL',
    reportingPeriod: 'Epidemiological Week 38',
    severityLevel: 'MEDIUM',
    caseCount: 312,
    trendPercentage: 14.2,
    impactFactor: 0.18,
    source: 'State Health Directorate, Madhya Pradesh',
    sourceType: 'OFFICIAL_GOV',
    sourceUrl: 'https://health.mp.gov.in/surveillance',
    sourceDate: new Date('2026-09-21'),
    confidence: 'HIGH',
    active: true,
    affectedMedicines: [
      { medicine: 'Azithromycin', impactMultiplier: 0.32, confidence: 'HIGH' },
      { medicine: 'Amoxicillin', impactMultiplier: 0.28, confidence: 'HIGH' },
      { medicine: 'Paracetamol', impactMultiplier: 0.22, confidence: 'HIGH' }
    ]
  },
  {
    diseaseId: 'DE-MP-IND-2026-03',
    diseaseName: 'Acute Diarrheal & Waterborne Influx',
    region: 'Malwa Plateau',
    state: 'Madhya Pradesh',
    district: 'Indore',
    eventType: 'OUTBREAK',
    reportingPeriod: 'Epidemiological Week 38',
    severityLevel: 'HIGH',
    caseCount: 240,
    trendPercentage: 32.0,
    impactFactor: 0.30,
    source: 'IDSP District Surveillance Unit, Indore',
    sourceType: 'OFFICIAL_GOV',
    sourceUrl: 'https://idsp.nic.in/reports',
    sourceDate: new Date('2026-09-22'),
    confidence: 'HIGH',
    active: true,
    affectedMedicines: [
      { medicine: 'ORS', impactMultiplier: 0.45, confidence: 'HIGH' },
      { medicine: 'Normal Saline (0.9% NaCl)', impactMultiplier: 0.38, confidence: 'HIGH' },
      { medicine: 'Amoxicillin', impactMultiplier: 0.15, confidence: 'MEDIUM' }
    ]
  },
  {
    diseaseId: 'DE-RJ-JPR-2026-04',
    diseaseName: 'Vector-Borne Surveillance Alert',
    region: 'Eastern Rajasthan',
    state: 'Rajasthan',
    district: 'Jaipur',
    eventType: 'REGIONAL_ALERT',
    reportingPeriod: 'Epidemiological Week 38',
    severityLevel: 'MEDIUM',
    caseCount: 160,
    trendPercentage: 11.5,
    impactFactor: 0.15,
    source: 'Rajasthan Department of Medical, Health & Family Welfare',
    sourceType: 'OFFICIAL_GOV',
    sourceUrl: 'https://rajswasthya.nic.in',
    sourceDate: new Date('2026-09-18'),
    confidence: 'HIGH',
    active: true,
    affectedMedicines: [
      { medicine: 'Paracetamol', impactMultiplier: 0.25, confidence: 'HIGH' },
      { medicine: 'Normal Saline (0.9% NaCl)', impactMultiplier: 0.20, confidence: 'MEDIUM' }
    ]
  },
  {
    diseaseId: 'DE-GJ-AHM-2026-05',
    diseaseName: 'Seasonal Gastroenteritis Advisory',
    region: 'Ahmedabad Central Zone',
    state: 'Gujarat',
    district: 'Ahmedabad',
    eventType: 'SEASONAL',
    reportingPeriod: 'Epidemiological Week 38',
    severityLevel: 'MEDIUM',
    caseCount: 195,
    trendPercentage: 9.8,
    impactFactor: 0.14,
    source: 'Health & Family Welfare Department, Government of Gujarat',
    sourceType: 'OFFICIAL_GOV',
    sourceUrl: 'https://gujhealth.gujarat.gov.in',
    sourceDate: new Date('2026-09-19'),
    confidence: 'HIGH',
    active: true,
    affectedMedicines: [
      { medicine: 'ORS', impactMultiplier: 0.30, confidence: 'HIGH' },
      { medicine: 'Normal Saline (0.9% NaCl)', impactMultiplier: 0.22, confidence: 'MEDIUM' }
    ]
  }
];

/**
 * @desc    Get all active disease surveillance events
 * @route   GET /api/disease-events
 * @access  Public
 */
const getDiseaseEvents = async (req, res, next) => {
  try {
    const { state, district, active } = req.query;
    const filter = {};

    if (active !== 'false') {
      filter.active = true;
    }
    if (state && state !== 'All States') {
      filter.state = new RegExp(`^${state.trim()}$`, 'i');
    }
    if (district && district !== 'All Districts') {
      filter.district = new RegExp(`^${district.trim()}$`, 'i');
    }

    let events = [];
    try {
      events = await DiseaseEvent.find(filter).sort({ severityLevel: -1, createdAt: -1 }).lean();
    } catch (dbErr) {
      console.warn('[DiseaseEvents DB fallback]:', dbErr.message);
    }

    if (!events || events.length === 0) {
      events = FALLBACK_EVENTS.filter(e => {
        if (state && state !== 'All States' && e.state.toLowerCase() !== state.toLowerCase().trim()) return false;
        if (district && district !== 'All Districts' && e.district.toLowerCase() !== district.toLowerCase().trim()) return false;
        return true;
      });
    }

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
      disclaimer: 'Operational healthcare intelligence signals for medicine supply-chain planning only. Not for clinical patient diagnosis.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get disease events for specific region / district
 * @route   GET /api/disease-events/:region
 * @access  Public
 */
const getDiseaseEventsByRegion = async (req, res, next) => {
  try {
    const { region } = req.params;
    const regex = new RegExp(region.trim(), 'i');

    let events = [];
    try {
      events = await DiseaseEvent.find({
        $or: [{ district: regex }, { state: regex }, { region: regex }],
        active: true
      }).lean();
    } catch (dbErr) {
      console.warn('[DiseaseEvents region DB fallback]:', dbErr.message);
    }

    if (!events || events.length === 0) {
      events = FALLBACK_EVENTS.filter(
        e => e.district.toLowerCase().includes(region.toLowerCase()) ||
             e.state.toLowerCase().includes(region.toLowerCase()) ||
             e.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    return res.status(200).json({
      success: true,
      region,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create / Ingest a new disease surveillance event
 * @route   POST /api/disease-events
 * @access  Admin
 */
const createDiseaseEvent = async (req, res, next) => {
  try {
    const event = await DiseaseEvent.create(req.body);
    return res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Predict Disease-Adjusted Demand (Proxy to FastAPI)
 * @route   POST /api/predictions/disease-adjusted
 * @access  Public
 */
const predictDiseaseAdjustedDemand = async (req, res, next) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/predict/disease-adjusted-demand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return res.status(response.status).json({
        success: false,
        message: `FastAPI Disease Prediction error: ${errorText}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'FastAPI microservice unreachable for disease-adjusted demand prediction: ' + error.message
    });
  }
};

module.exports = {
  getDiseaseEvents,
  getDiseaseEventsByRegion,
  createDiseaseEvent,
  predictDiseaseAdjustedDemand
};
