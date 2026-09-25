"""
Pydantic Request and Response Schemas for HealthChain AI Prediction Service
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

