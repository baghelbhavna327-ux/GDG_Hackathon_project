"""
Pydantic Request and Response Schemas for HealthChain AI Prediction & Advanced Optimization Services
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "success"
    service: str = "HealthChain AI Prediction Service"
    version: str = "1.0.0"
    model_loaded: bool = True

class PredictRequest(BaseModel):
    phc: str = Field(default="PHC Guna Central", description="Primary Health Centre Name", example="Guna PHC-04")
    state: Optional[str] = Field(default="Madhya Pradesh", description="State Name", example="Madhya Pradesh")
    district: Optional[str] = Field(default="Guna", description="District Name", example="Guna")
    medicine: str = Field(default="Paracetamol", description="Medicine Name", example="Paracetamol")
    current_stock: float = Field(..., ge=0, description="Current stock available at the PHC", example=120.0)
    patient_count: Optional[float] = Field(default=120.0, ge=0, description="Daily patient footfall", example=180.0)
    previous_consumption: Optional[float] = Field(default=None, description="Previous day consumption", example=30.0)
    day_of_week: Optional[int] = Field(default=None, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)", example=3)
    month: Optional[int] = Field(default=None, ge=1, le=12, description="Month of year (1-12)", example=9)
    emergency_flag: Optional[int] = Field(default=0, ge=0, le=1, description="Emergency surge indicator (0 or 1)", example=0)

class PredictionData(BaseModel):
    phc: str
    medicine: str
    predicted_daily_demand: float
    predicted_7_day_demand: float
    predicted_30_day_demand: float
    current_stock: float
    days_remaining: float
    shortage_quantity: float
    stock_out_risk: str  # CRITICAL, HIGH, MEDIUM, LOW
    reason: str

class PredictResponse(BaseModel):
    success: bool = True
    data: PredictionData

class HighRiskItem(BaseModel):
    phc: str
    district: str
    state: str
    medicine: str
    current_stock: float
    predicted_daily_demand: float
    predicted_7_day_demand: float
    shortage_quantity: float
    days_remaining: float
    stock_out_risk: str
    reason: str

class HighRiskResponse(BaseModel):
    success: bool = True
    count: int
    data: List[HighRiskItem]

class EmergencySimulationRequest(BaseModel):
    phc: str = Field(default="Guna PHC-04", description="Primary Health Centre Name", example="Guna PHC-04")
    state: Optional[str] = Field(default="Madhya Pradesh", description="State Name", example="Madhya Pradesh")
    district: Optional[str] = Field(default="Guna", description="District Name", example="Guna")
    medicine: str = Field(default="Paracetamol", description="Medicine Name", example="Paracetamol")
    current_stock: float = Field(..., ge=0, description="Current stock available at the PHC", example=120.0)
    patient_count: Optional[float] = Field(default=250.0, ge=0, description="Patient footfall (under emergency condition)", example=250.0)
    previous_consumption: Optional[float] = Field(default=None, description="Previous day consumption", example=35.0)
    day_of_week: Optional[int] = Field(default=None, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)")
    month: Optional[int] = Field(default=None, ge=1, le=12, description="Month of year (1-12)")

class ScenarioMetrics(BaseModel):
    predicted_daily_demand: float
    predicted_7_day_demand: float
    days_remaining: float
    stock_out_risk: str
    shortage_quantity: float

class EmergencySimulationData(BaseModel):
    phc: str
    state: str
    district: str
    medicine: str
    current_stock: float
    normal: ScenarioMetrics
    emergency: ScenarioMetrics
    demand_increase_percentage: float
    emergency_7_day_demand: float
    shortage_quantity: float
    stock_out_risk: str
    reason: str

class EmergencySimulationResponse(BaseModel):
    success: bool = True
    data: EmergencySimulationData

# ==================== ADVANCED AI SCHEMAS ====================

class ExplainFactor(BaseModel):
    feature: str
    label: str
    impact: float
    direction: str
    rank: int

class ExplainResponse(BaseModel):
    success: bool = True
    model_type: str = "XGBoost Regressor (TreeExplainer)"
    phc: str
    medicine: str
    predicted_daily_demand: float
    base_value: float
    explanation: List[ExplainFactor]
    summary: str

class ShortageItem(BaseModel):
    phc_id: Optional[str] = "phc-dst"
    phc_name: str
    district: Optional[str] = "Guna"
    state: Optional[str] = "Madhya Pradesh"
    medicine: str
    shortage_quantity: float
    priority: Optional[str] = "HIGH"

class SurplusItem(BaseModel):
    phc_id: Optional[str] = "phc-src"
    phc_name: str
    district: Optional[str] = "Pune"
    state: Optional[str] = "Maharashtra"
    medicine: str
    available_surplus: float
    total_stock: Optional[float] = None

class OptimizationRequest(BaseModel):
    shortages: List[ShortageItem]
    surpluses: List[SurplusItem]
    medicine: Optional[str] = None

class AnomalyRequest(BaseModel):
    phc: Optional[str] = "Guna PHC-04"
    medicine: Optional[str] = "Paracetamol"
    daily_consumption: Optional[float] = 45.0
    baseline_consumption: Optional[float] = 25.0
    patient_count: Optional[float] = 160.0
    baseline_footfall: Optional[float] = 120.0
    current_stock: Optional[float] = 100.0
    bed_occupancy_pct: Optional[float] = 0.75
    staff_attendance_pct: Optional[float] = 0.88

class EnsembleRiskRequest(BaseModel):
    phc: Optional[str] = "Guna PHC-04"
    medicine: Optional[str] = "Paracetamol"
    days_remaining: Optional[float] = 2.0
    stock_out_risk: Optional[str] = "HIGH"
    predicted_daily_demand: Optional[float] = 45.0
    baseline_daily_demand: Optional[float] = 25.0
    anomaly_severity: Optional[str] = "LOW"
    anomaly_detected: Optional[bool] = False
    emergency_flag: Optional[int] = 0
    bed_occupancy_pct: Optional[float] = 0.75
    staff_attendance_pct: Optional[float] = 0.85

class DemandSequenceRequest(BaseModel):
    phc: Optional[str] = "Guna PHC-04"
    medicine: Optional[str] = "Paracetamol"
    current_stock: Optional[float] = 120.0
    previous_consumption: Optional[float] = 35.0
    patient_count: Optional[float] = 140.0
    emergency_flag: Optional[int] = 0
    historical_sequence: Optional[List[float]] = None

class BedDemandRequest(BaseModel):
    phc: Optional[str] = "Guna PHC-04"
    total_beds: Optional[int] = 40
    occupied_beds: Optional[int] = 31
    patient_count: Optional[float] = 160.0
    emergency_flag: Optional[int] = 0

class StaffDemandRequest(BaseModel):
    phc: Optional[str] = "Guna PHC-04"
    patient_count: Optional[float] = 150.0
    occupied_beds: Optional[int] = 25
    staff_on_duty: Optional[int] = 12
    emergency_flag: Optional[int] = 0

class DriftRequest(BaseModel):
    feature: Optional[str] = "daily_demand"
    method: Optional[str] = "PSI"
    baseline_samples: Optional[List[float]] = None
    current_samples: Optional[List[float]] = None
    simulate_drift: Optional[bool] = False

class ContinuousLearningRequest(BaseModel):
    patient_count: Optional[float] = 130.0
    previous_consumption: Optional[float] = 38.0
    emergency_flag: Optional[int] = 0
    actual_consumption: Optional[float] = None

class CopilotRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class DiseaseAdjustedPredictRequest(BaseModel):
    phc: Optional[str] = "PHC Guna Central"
    state: Optional[str] = "Madhya Pradesh"
    district: Optional[str] = "Guna"
    medicine: Optional[str] = "Paracetamol"
    current_stock: float = 120.0
    patient_count: Optional[float] = 147.0
    previous_consumption: Optional[float] = 25.0
    day_of_week: Optional[int] = None
    month: Optional[int] = None
    emergency_flag: Optional[int] = 0

class RegionalDemandAnalysisRequest(BaseModel):
    state: Optional[str] = "Madhya Pradesh"
    district: Optional[str] = "Guna"
    medicines: Optional[List[str]] = None

