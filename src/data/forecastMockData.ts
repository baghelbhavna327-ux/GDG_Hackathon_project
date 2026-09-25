/**
 * AI Demand Forecast Mock Data Interface & Schema
 * 
 * NOTE FOR DAY 2+ BACKEND INTEGRATION:
 * This schema mimics the payload expected from the Python AI API endpoint (e.g., POST /api/v1/forecast).
 * When integrating real ML models (e.g. ARIMA, Prophet, XGBoost, or LSTM neural networks),
 * replace these mock getters with actual async API calls.
 */

export interface ForecastTimeSeriesPoint {
  date: string;
  historicalConsumption?: number;
  predictedDemand: number;
  currentStockRunway: number;
  confidenceUpper?: number;
  confidenceLower?: number;
}

export interface AIPredictionResponse {
  medicine: string;
  dosage: string;
  phc: string;
  district: string;
  state: string;
  forecastPeriod: '7 days' | '30 days';
  currentStock: number;
  unit: string;
  predictedDemand: number;
  predictedRemainingStock: number;
  stockoutRisk: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  demandIncreasePct: number;
  estimatedShortage: number;
  riskExplanation: string;
  recommendedAction: string;
  modelConfidenceScore: number;
  historicalData: ForecastTimeSeriesPoint[];
}

// Pre-computed Mock Prediction Scenarios
export const mockForecastPresets: Record<string, AIPredictionResponse> = {
  'Paracetamol_7': {
    medicine: 'Paracetamol',
    dosage: '500mg Tablets',
    phc: 'Guna PHC-04',
    district: 'Guna',
    state: 'Madhya Pradesh',
    forecastPeriod: '7 days',
    currentStock: 120,
    unit: 'units',
    predictedDemand: 180,
    predictedRemainingStock: -60, // Deficit
    stockoutRisk: 'HIGH',
    demandIncreasePct: 38.5,
    estimatedShortage: 60,
    riskExplanation: 'High stock-out risk detected because predicted demand exceeds current inventory.',
    recommendedAction: 'Transfer 150 units of Paracetamol from PHC-B Central Store within 36 hours to prevent stock-out.',
    modelConfidenceScore: 96.4,
    historicalData: [
      { date: '18 Sep (D-6)', historicalConsumption: 24, predictedDemand: 24, currentStockRunway: 280 },
      { date: '19 Sep (D-5)', historicalConsumption: 26, predictedDemand: 26, currentStockRunway: 254 },
      { date: '20 Sep (D-4)', historicalConsumption: 28, predictedDemand: 28, currentStockRunway: 226 },
      { date: '21 Sep (D-3)', historicalConsumption: 32, predictedDemand: 30, currentStockRunway: 194 },
      { date: '22 Sep (D-2)', historicalConsumption: 35, predictedDemand: 34, currentStockRunway: 159 },
      { date: '23 Sep (D-1)', historicalConsumption: 39, predictedDemand: 38, currentStockRunway: 120 },
      { date: '24 Sep (Today)', historicalConsumption: 42, predictedDemand: 42, currentStockRunway: 120 },
      { date: '25 Sep (D+1)', predictedDemand: 46, currentStockRunway: 74, confidenceUpper: 52, confidenceLower: 40 },
      { date: '26 Sep (D+2)', predictedDemand: 49, currentStockRunway: 25, confidenceUpper: 56, confidenceLower: 42 },
      { date: '27 Sep (D+3)', predictedDemand: 52, currentStockRunway: -27, confidenceUpper: 60, confidenceLower: 44 },
      { date: '28 Sep (D+4)', predictedDemand: 48, currentStockRunway: -75, confidenceUpper: 55, confidenceLower: 40 },
      { date: '29 Sep (D+5)', predictedDemand: 44, currentStockRunway: -119, confidenceUpper: 50, confidenceLower: 38 },
      { date: '30 Sep (D+6)', predictedDemand: 41, currentStockRunway: -160, confidenceUpper: 47, confidenceLower: 35 },
      { date: '01 Oct (D+7)', predictedDemand: 38, currentStockRunway: -180, confidenceUpper: 44, confidenceLower: 32 },
    ],
  },
  'Paracetamol_30': {
    medicine: 'Paracetamol',
    dosage: '500mg Tablets',
    phc: 'Guna PHC-04',
    district: 'Guna',
    state: 'Madhya Pradesh',
    forecastPeriod: '30 days',
    currentStock: 120,
    unit: 'units',
    predictedDemand: 820,
    predictedRemainingStock: -700,
    stockoutRisk: 'CRITICAL',
    demandIncreasePct: 42.0,
    estimatedShortage: 700,
    riskExplanation: 'Critical long-term stock-out risk detected. Baseline supply will be exhausted in <4 days.',
    recommendedAction: 'Trigger monthly bulk replenishment of 1,000 units from State Medical Corporation.',
    modelConfidenceScore: 92.1,
    historicalData: [
      { date: 'Week -3', historicalConsumption: 160, predictedDemand: 160, currentStockRunway: 540 },
      { date: 'Week -2', historicalConsumption: 185, predictedDemand: 180, currentStockRunway: 355 },
      { date: 'Week -1', historicalConsumption: 235, predictedDemand: 230, currentStockRunway: 120 },
      { date: 'Week 1', predictedDemand: 280, currentStockRunway: -160, confidenceUpper: 310, confidenceLower: 250 },
      { date: 'Week 2', predictedDemand: 260, currentStockRunway: -420, confidenceUpper: 295, confidenceLower: 230 },
      { date: 'Week 3', predictedDemand: 240, currentStockRunway: -660, confidenceUpper: 270, confidenceLower: 210 },
      { date: 'Week 4', predictedDemand: 220, currentStockRunway: -700, confidenceUpper: 250, confidenceLower: 190 },
    ],
  },
  'Amoxicillin_7': {
    medicine: 'Amoxicillin',
    dosage: '500mg Capsules',
    phc: 'Bhopal PHC-12',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    forecastPeriod: '7 days',
    currentStock: 450,
    unit: 'units',
    predictedDemand: 175,
    predictedRemainingStock: 275,
    stockoutRisk: 'NORMAL',
    demandIncreasePct: 8.2,
    estimatedShortage: 0,
    riskExplanation: 'Stock levels are optimal with sufficient 18-day runway under standard seasonal trends.',
    recommendedAction: 'Maintain standard weekly monitoring. No immediate transfer required.',
    modelConfidenceScore: 95.8,
    historicalData: [
      { date: '18 Sep', historicalConsumption: 22, predictedDemand: 22, currentStockRunway: 580 },
      { date: '19 Sep', historicalConsumption: 24, predictedDemand: 24, currentStockRunway: 556 },
      { date: '20 Sep', historicalConsumption: 25, predictedDemand: 25, currentStockRunway: 531 },
      { date: '21 Sep', historicalConsumption: 26, predictedDemand: 26, currentStockRunway: 505 },
      { date: '22 Sep', historicalConsumption: 27, predictedDemand: 26, currentStockRunway: 478 },
      { date: '23 Sep', historicalConsumption: 28, predictedDemand: 27, currentStockRunway: 450 },
      { date: '24 Sep (Today)', historicalConsumption: 25, predictedDemand: 25, currentStockRunway: 450 },
      { date: '25 Sep (D+1)', predictedDemand: 26, currentStockRunway: 424, confidenceUpper: 30, confidenceLower: 22 },
      { date: '26 Sep (D+2)', predictedDemand: 25, currentStockRunway: 399, confidenceUpper: 29, confidenceLower: 21 },
      { date: '27 Sep (D+3)', predictedDemand: 26, currentStockRunway: 373, confidenceUpper: 31, confidenceLower: 22 },
      { date: '28 Sep (D+4)', predictedDemand: 24, currentStockRunway: 349, confidenceUpper: 28, confidenceLower: 20 },
      { date: '29 Sep (D+5)', predictedDemand: 25, currentStockRunway: 324, confidenceUpper: 30, confidenceLower: 21 },
      { date: '30 Sep (D+6)', predictedDemand: 24, currentStockRunway: 300, confidenceUpper: 28, confidenceLower: 20 },
      { date: '01 Oct (D+7)', predictedDemand: 25, currentStockRunway: 275, confidenceUpper: 29, confidenceLower: 21 },
    ],
  },
  'ORS_7': {
    medicine: 'ORS',
    dosage: '21.8g WHO Formula',
    phc: 'Indore PHC-08',
    district: 'Indore',
    state: 'Madhya Pradesh',
    forecastPeriod: '7 days',
    currentStock: 80,
    unit: 'units',
    predictedDemand: 140,
    predictedRemainingStock: -60,
    stockoutRisk: 'HIGH',
    demandIncreasePct: 45.2,
    estimatedShortage: 60,
    riskExplanation: 'High stock-out risk detected because predicted demand exceeds current inventory.',
    recommendedAction: 'Dispatch 200 ORS sachets from regional medical warehouse.',
    modelConfidenceScore: 94.3,
    historicalData: [
      { date: '18 Sep', historicalConsumption: 14, predictedDemand: 14, currentStockRunway: 180 },
      { date: '19 Sep', historicalConsumption: 16, predictedDemand: 16, currentStockRunway: 164 },
      { date: '20 Sep', historicalConsumption: 18, predictedDemand: 18, currentStockRunway: 146 },
      { date: '21 Sep', historicalConsumption: 20, predictedDemand: 20, currentStockRunway: 126 },
      { date: '22 Sep', historicalConsumption: 22, predictedDemand: 22, currentStockRunway: 104 },
      { date: '23 Sep', historicalConsumption: 24, predictedDemand: 24, currentStockRunway: 80 },
      { date: '24 Sep (Today)', historicalConsumption: 20, predictedDemand: 20, currentStockRunway: 80 },
      { date: '25 Sep (D+1)', predictedDemand: 22, currentStockRunway: 58, confidenceUpper: 26, confidenceLower: 18 },
      { date: '26 Sep (D+2)', predictedDemand: 24, currentStockRunway: 34, confidenceUpper: 28, confidenceLower: 20 },
      { date: '27 Sep (D+3)', predictedDemand: 22, currentStockRunway: 12, confidenceUpper: 26, confidenceLower: 18 },
      { date: '28 Sep (D+4)', predictedDemand: 20, currentStockRunway: -8, confidenceUpper: 24, confidenceLower: 16 },
      { date: '29 Sep (D+5)', predictedDemand: 18, currentStockRunway: -26, confidenceUpper: 22, confidenceLower: 14 },
      { date: '30 Sep (D+6)', predictedDemand: 18, currentStockRunway: -44, confidenceUpper: 21, confidenceLower: 15 },
      { date: '01 Oct (D+7)', predictedDemand: 16, currentStockRunway: -60, confidenceUpper: 19, confidenceLower: 13 },
    ],
  },
};

/**
 * Mock API Fetcher simulating a call to Python AI Service
 */
export function getMockAIPrediction(
  medicine: string,
  forecastPeriod: '7 days' | '30 days',
  phcName: string,
  districtName: string,
  stateName: string
): AIPredictionResponse {
  const key = `${medicine}_${forecastPeriod === '7 days' ? '7' : '30'}`;
  const preset = mockForecastPresets[key] || mockForecastPresets['Paracetamol_7'];

  return {
    ...preset,
    medicine,
    phc: phcName,
    district: districtName,
    state: stateName,
    forecastPeriod,
  };
}
