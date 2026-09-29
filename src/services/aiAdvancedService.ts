/**
 * HealthChain AI - Advanced AI, Explainability & Optimization API Client
 * Interacts with FastAPI microservice at http://localhost:8000.
 */

import { FastAPIPredictRequest } from './aiPredictionService';

const AI_SERVICE_URL = ((import.meta as any).env?.VITE_AI_SERVICE_URL as string) || 'http://localhost:8000';

export interface ShapFactor {
  feature: string;
  label: string;
  impact: number;
  direction: 'INCREASES_DEMAND' | 'DECREASES_DEMAND';
  rank: number;
}

export interface ShapExplainData {
  model_type: string;
  phc: string;
  medicine: string;
  predicted_daily_demand: number;
  base_value: number;
  explanation: ShapFactor[];
  summary: string;
}

export interface OrToolsTransfer {
  transfer_id: string;
  source_phc_id: string;
  source_phc_name: string;
  source_district: string;
  source_state: string;
  source_surplus_before: number;
  destination_phc_id: string;
  destination_phc_name: string;
  destination_district: string;
  destination_state: string;
  destination_shortage_before: number;
  medicine: string;
  allocated_quantity: number;
  remaining_deficit: number;
  priority: string;
  distance_km: number;
  estimated_transit_time: string;
  status: string;
}

export interface OrToolsOptimizationResponse {
  success: boolean;
  solver_engine: string;
  optimization_status: string;
  total_transfers_recommended: number;
  total_units_allocated: number;
  transfers: OrToolsTransfer[];
  disclaimer: string;
}

export interface AnomalyRecord {
  phc: string;
  medicine: string;
  anomaly_detected: boolean;
  anomaly_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  metric_deviations: {
    consumption_ratio: number;
    footfall_ratio: number;
    stock_burn_pct: number;
    bed_occupancy_pct: number;
    staff_attendance_pct: number;
  };
  reason: string;
}

export interface EnsembleRiskData {
  phc: string;
  medicine: string;
  overall_risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  signals: {
    stock_out: string;
    demand_forecast: string;
    anomaly: string;
    emergency_outbreak: string;
    bed_staff_capacity: string;
  };
  formula: string;
  recommendation: string;
}

export interface SequenceDemandData {
  success: boolean;
  model: string;
  phc: string;
  medicine: string;
  historical_window_days: number;
  predicted_daily_demand: number;
  predicted_7_day_demand: number;
  predicted_30_day_demand: number;
  current_stock: number;
  days_remaining: number;
  shortage_quantity_7d: number;
  stock_out_risk: string;
  data_source: string;
}

export interface BedDemandData {
  total_beds: number;
  current_occupied: number;
  current_available: number;
  current_occupancy_pct: number;
  predicted_7d_occupied: number;
  predicted_7d_available: number;
  projected_occupancy_pct: number;
  capacity_pressure_risk: string;
  recommendation: string;
}

export interface StaffDemandData {
  phc: string;
  patient_footfall: number;
  occupied_beds: number;
  current_staff_on_duty: number;
  predicted_staff_requirement: number;
  breakdown: {
    doctors_needed: number;
    nurses_needed: number;
    pharmacists_needed: number;
    support_staff_needed: number;
  };
  staff_shortage_surplus: number;
  status: string;
  risk_level: string;
  recommendation: string;
}

export interface DriftMonitorData {
  success: boolean;
  feature: string;
  method: string;
  score: number;
  p_value?: number;
  threshold: number;
  drift_detected: boolean;
  baseline_sample_size: number;
  current_sample_size: number;
  baseline_mean: number;
  current_mean: number;
  summary: string;
}

export interface ContinuousLearningData {
  success: boolean;
  model_type: string;
  model_version: string;
  observations_seen: number;
  last_updated: string;
  observation_feedback: {
    input_features: Record<string, any>;
    actual_consumption: number;
    prediction_before_update: number;
    prediction_after_update: number;
    loss_reduction: number;
  };
  status: string;
  production_safety_note: string;
}

export interface CopilotChatResponse {
  success: boolean;
  query: string;
  category: string;
  response: string;
  suggested_actions: Array<{
    label: string;
    action_url?: string;
    type: string;
    requires_confirmation?: boolean;
  }>;
  action_safety: {
    autonomous_execution_allowed: boolean;
    human_approval_required: boolean;
    message: string;
  };
}

/**
 * 1. Fetch SHAP Explainability feature contributions for XGBoost model
 */
export async function fetchShapExplanation(request: FastAPIPredictRequest): Promise<ShapExplainData> {
  const url = `${AI_SERVICE_URL}/explain/predict`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) throw new Error(`SHAP Explain API Error (${res.status})`);
  const json = await res.json();
  return json.data;
}

/**
 * 2. Execute OR-Tools Mixed-Integer Redistribution Optimization
 */
export async function fetchOrToolsOptimization(
  shortages: any[],
  surpluses: any[],
  medicine?: string
): Promise<OrToolsOptimizationResponse> {
  const url = `${AI_SERVICE_URL}/optimize/redistribution`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ shortages, surpluses, medicine })
  });
  if (!res.ok) throw new Error(`OR-Tools Optimization API Error (${res.status})`);
  return res.json();
}

/**
 * 3. Detect Operational Anomaly using Isolation Forest
 */
export async function fetchAnomalyDetection(data: any): Promise<AnomalyRecord> {
  const url = `${AI_SERVICE_URL}/detect/anomaly`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Anomaly Detection API Error (${res.status})`);
  const json = await res.json();
  return json.data;
}

/**
 * 4. Fetch Active Ranked Anomalies
 */
export async function fetchActiveAnomalies(): Promise<AnomalyRecord[]> {
  const url = `${AI_SERVICE_URL}/anomalies`;
  const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Active Anomalies API Error (${res.status})`);
  const json = await res.json();
  return json.data;
}

/**
 * 5. Compute Ensemble Multi-Signal Operational Risk
 */
export async function fetchEnsembleRisk(data: any): Promise<EnsembleRiskData> {
  const url = `${AI_SERVICE_URL}/score/ensemble-risk`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Ensemble Risk API Error (${res.status})`);
  const json = await res.json();
  return json.data;
}

/**
 * 6. Predict Sequential Demand using PyTorch GRU
 */
export async function fetchDemandSequence(data: any): Promise<SequenceDemandData> {
  const url = `${AI_SERVICE_URL}/predict/demand-sequence`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Sequential GRU API Error (${res.status})`);
  return res.json();
}

/**
 * 7. Forecast Bed Inpatient Demand & Saturation Risk
 */
export async function fetchBedDemand(data: any): Promise<BedDemandData> {
  const url = `${AI_SERVICE_URL}/predict/bed-demand`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Bed Demand API Error (${res.status})`);
  const json = await res.json();
  return json.data;
}

/**
 * 8. Forecast Staff Workforce Demand
 */
export async function fetchStaffDemand(data: any): Promise<StaffDemandData> {
  const url = `${AI_SERVICE_URL}/predict/staff-demand`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Staff Demand API Error (${res.status})`);
  const json = await res.json();
  return json.data;
}

/**
 * 9. Monitor Feature Data Drift (PSI & KS-Test)
 */
export async function fetchDriftMonitoring(data: any): Promise<DriftMonitorData> {
  const url = `${AI_SERVICE_URL}/monitor/drift`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Drift Monitoring API Error (${res.status})`);
  return res.json();
}

/**
 * 10. Update Continuous Learning Model
 */
export async function updateContinuousLearning(observation: any): Promise<ContinuousLearningData> {
  const url = `${AI_SERVICE_URL}/learn/update`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(observation)
  });
  if (!res.ok) throw new Error(`Continuous Learning API Error (${res.status})`);
  return res.json();
}

/**
 * 11. Query Grounded AI Copilot
 */
export async function queryCopilot(query: string, context?: any): Promise<CopilotChatResponse> {
  const url = `${AI_SERVICE_URL}/copilot/chat`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, context })
  });
  if (!res.ok) throw new Error(`AI Copilot API Error (${res.status})`);
  return res.json();
}
