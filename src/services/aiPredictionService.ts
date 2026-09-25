/**
 * HealthChain AI - FastAPI AI Prediction Service Client
 * 
 * Interacts with the Python FastAPI backend running at http://localhost:8000.
 */

export interface FastAPIPredictRequest {
  phc: string;
  state?: string;
  district?: string;
  medicine: string;
  current_stock: number;
  patient_count?: number;
  previous_consumption?: number;
  day_of_week?: number; // 0=Mon, 6=Sun
  month?: number;        // 1-12
  emergency_flag?: number; // 0=Normal, 1=Emergency
}

export interface FastAPIPredictionData {
  phc: string;
  medicine: string;
  predicted_daily_demand: number;
  predicted_7_day_demand: number;
  predicted_30_day_demand: number;
  current_stock: number;
  days_remaining: number;
  shortage_quantity: number;
  stock_out_risk: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  reason: string;
}

export interface FastAPIPredictResponse {
  success: boolean;
  data: FastAPIPredictionData;
}

export interface FastAPIEmergencyPredictRequest {
  phc: string;
  state: string;
  district: string;
  medicine: string;
  current_stock: number;
  patient_count: number;
  previous_consumption: number;
  day_of_week?: number;
  month?: number;
}

export interface FastAPIEmergencyMetrics {
  predicted_daily_demand: number;
  predicted_7_day_demand: number;
  days_remaining: number;
  stock_out_risk: string;
  shortage_quantity: number;
}

export interface FastAPIEmergencyPredictionData {
  phc: string;
  state: string;
  district: string;
  medicine: string;
  current_stock: number;
  normal: FastAPIEmergencyMetrics;
  emergency: FastAPIEmergencyMetrics;
  demand_increase_percentage: number;
  emergency_7_day_demand: number;
  shortage_quantity: number;
  stock_out_risk: string;
  reason: string;
}

export interface FastAPIEmergencySimulationResponse {
  success: boolean;
  data: FastAPIEmergencyPredictionData;
}

export interface FastAPIHealthResponse {
  status: string;
  service: string;
  version: string;
  model_loaded: boolean;
}

const AI_SERVICE_URL = ((import.meta as any).env?.VITE_AI_SERVICE_URL as string) || 'http://localhost:8000';

/**
 * Fetch dynamic medicine demand prediction from FastAPI endpoint
 */
export async function fetchDemandPrediction(
  request: FastAPIPredictRequest
): Promise<FastAPIPredictionData> {
  const url = `${AI_SERVICE_URL}/predict`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`AI Prediction Service error (${response.status}): ${errorText}`);
  }

  const result: FastAPIPredictResponse = await response.json();
  if (!result.success || !result.data) {
    throw new Error('Invalid response structure received from AI prediction service.');
  }

  return result.data;
}

/**
 * Fetch dynamic emergency surge prediction from FastAPI emergency simulation endpoint
 */
export async function fetchEmergencyPrediction(
  request: FastAPIEmergencyPredictRequest
): Promise<FastAPIEmergencyPredictionData> {
  const url = `${AI_SERVICE_URL}/predict/emergency`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Emergency AI Prediction Service error (${response.status}): ${errorText}`);
  }

  const result: FastAPIEmergencySimulationResponse = await response.json();
  if (!result.success || !result.data) {
    throw new Error('Invalid response structure received from Emergency AI prediction service.');
  }

  return result.data;
}

export interface FederatedStateNode {
  state: string;
  sample_count: number;
  training_status: string;
  model_status: string;
  mae: number;
  rmse: number;
  r2: number;
}

export interface FederatedGlobalModelInfo {
  name: string;
  artifact: string;
  status: string;
  total_rounds: number;
  participating_states: string[];
  training_timestamp: string;
  metrics: {
    mae: number;
    rmse: number;
    r2: number;
  };
}

export interface FederatedMetadataResponse {
  success: boolean;
  service: string;
  status: 'CONNECTED' | 'UNAVAILABLE';
  aggregation_method: string;
  global_model: FederatedGlobalModelInfo;
  state_nodes: FederatedStateNode[];
}

export interface FederatedPredictionData {
  model_type: string;
  state: string;
  district: string;
  phc: string;
  medicine: string;
  current_stock: number;
  predicted_daily_demand: number;
  predicted_7_day_demand: number;
  predicted_30_day_demand: number;
  days_remaining: number;
  shortage_quantity: number;
  stock_out_risk: string;
  aggregation_method: string;
  explanation: string;
}

export interface FederatedPredictionResponse {
  success: boolean;
  data: FederatedPredictionData;
}

/**
 * Fetch real metadata and verified metrics from the Federated AI backend
 */
export async function fetchFederatedMetadata(): Promise<FederatedMetadataResponse> {
  const url = `${AI_SERVICE_URL}/federated/metadata`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Federated AI Service error (${response.status})`);
  }

  const result: FederatedMetadataResponse = await response.json();
  return result;
}

/**
 * Run inference using the Aggregated Global Federated Model
 */
export async function fetchFederatedPrediction(
  request: FastAPIPredictRequest
): Promise<FederatedPredictionData> {
  const url = `${AI_SERVICE_URL}/federated/predict`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Federated AI Inference error (${response.status})`);
  }

  const result: FederatedPredictionResponse = await response.json();
  if (!result.success || !result.data) {
    throw new Error('Invalid response structure received from Federated AI service.');
  }

  return result.data;
}

/**
 * Check health status of FastAPI prediction service
 */
export async function checkAIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return false;
    const data: FastAPIHealthResponse = await response.json();
    return data.status === 'success';
  } catch {
    return false;
  }
}
