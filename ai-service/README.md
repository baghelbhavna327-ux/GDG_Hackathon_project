# HealthChain AI — AI Prediction Microservice

FastAPI-powered machine learning microservice for **HealthChain AI**. Provides real-time medicine demand forecasting, stock-out risk assessment, emergency demand surge simulation, and proactive regional resource rebalancing recommendations for Primary Health Centres (PHCs).

---

## 🌐 Service Overview

- **AI Service Base URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Interactive ReDoc:** `http://localhost:8000/redoc`
- **Integration Target:** Node.js Backend (`http://localhost:5000`) and React Frontend (`http://localhost:5173`)
- **CORS Support:** Enabled for `http://localhost:5000` and `http://localhost:5173`
- **Authentication:** None (Hackathon Prototype)

---

## 🚀 How to Start the Service

Follow these steps from within the `ai-service/` directory:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Generate synthetic healthcare dataset (3,000 rows across 20 PHCs)
python generate_data.py

# 3. Train the XGBoost regression demand pipeline
python train.py

# 4. Start the FastAPI AI service
uvicorn app.main:app --reload --port 8000
```

---

## 📡 API Endpoints Documentation

### 1. Health Status Check

- **Method:** `GET`
- **URL:** `http://localhost:8000/health`
- **Purpose:** Verifies service uptime, operational status, and confirms whether the serialized ML model pipeline is loaded in memory.
- **Request JSON:** None

- **Response JSON:**
```json
{
  "status": "success",
  "service": "HealthChain AI Prediction Service",
  "version": "1.0.0",
  "model_loaded": true
}
```

---

### 2. Single Medicine Demand Forecast & Stock-Out Risk

- **Method:** `POST`
- **URL:** `http://localhost:8000/predict`
- **Purpose:** Predicts daily medicine consumption using the trained XGBoost pipeline, calculates 7-day and 30-day demand horizons, evaluates remaining stock runway (days), determines shortage quantity, and assigns a 4-tier stock-out risk (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

- **Request JSON:**
```json
{
  "phc": "Guna PHC-04",
  "state": "Madhya Pradesh",
  "district": "Guna",
  "medicine": "Paracetamol",
  "current_stock": 120,
  "patient_count": 180,
  "previous_consumption": 30,
  "day_of_week": 3,
  "month": 9,
  "emergency_flag": 0
}
```

- **Response JSON:**
```json
{
  "success": true,
  "data": {
    "phc": "Guna PHC-04",
    "medicine": "Paracetamol",
    "predicted_daily_demand": 46.6,
    "predicted_7_day_demand": 326.2,
    "predicted_30_day_demand": 1398.0,
    "current_stock": 120.0,
    "days_remaining": 2.6,
    "shortage_quantity": 206.2,
    "stock_out_risk": "CRITICAL",
    "reason": "Critical stock-out risk detected: Current inventory covers only 2.6 days. Predicted 7-day demand (326 units) exceeds available stock by 206 units. Emergency replenishment or inter-facility transfer required immediately."
  }
}
```

---

### 3. Emergency Surge Simulation

- **Method:** `POST`
- **URL:** `http://localhost:8000/predict/emergency`
- **Purpose:** Simulates how an emergency surge in patient footfall and consumption impacts medicine demand and accelerates inventory depletion, comparing the emergency scenario (`emergency_flag = 1`) directly against the normal baseline (`emergency_flag = 0`).

- **Request JSON:**
```json
{
  "phc": "Guna PHC-04",
  "state": "Madhya Pradesh",
  "district": "Guna",
  "medicine": "Paracetamol",
  "current_stock": 120,
  "patient_count": 250,
  "previous_consumption": 35
}
```

- **Response JSON:**
```json
{
  "success": true,
  "data": {
    "phc": "Guna PHC-04",
    "state": "Madhya Pradesh",
    "district": "Guna",
    "medicine": "Paracetamol",
    "current_stock": 120.0,
    "normal": {
      "predicted_daily_demand": 86.3,
      "predicted_7_day_demand": 604.1,
      "days_remaining": 1.4,
      "stock_out_risk": "CRITICAL",
      "shortage_quantity": 484.1
    },
    "emergency": {
      "predicted_daily_demand": 105.2,
      "predicted_7_day_demand": 736.4,
      "days_remaining": 1.1,
      "stock_out_risk": "CRITICAL",
      "shortage_quantity": 616.4
    },
    "demand_increase_percentage": 21.9,
    "emergency_7_day_demand": 736.4,
    "shortage_quantity": 616.4,
    "stock_out_risk": "CRITICAL",
    "reason": "Emergency simulation: Daily demand increases by 21.9% (from 86.3 to 105.2 units/day). Inventory runway is compressed from 1.4 to 1.1 days, resulting in a 7-day shortage of 616.4 units (CRITICAL risk)."
  }
}
```

---

### 4. High-Risk Facility Inventories

- **Method:** `GET`
- **URL:** `http://localhost:8000/predictions/high-risk`
- **Purpose:** Evaluates latest inventory levels across all PHCs and medicines in the system, returning all facilities currently under `CRITICAL` or `HIGH` risk of stock exhaustion, sorted by greatest shortage severity.
- **Request JSON:** None

- **Response JSON:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "phc": "PHC Guna Central",
      "district": "Guna",
      "state": "Madhya Pradesh",
      "medicine": "Paracetamol",
      "current_stock": 87.0,
      "predicted_daily_demand": 38.1,
      "predicted_7_day_demand": 266.7,
      "shortage_quantity": 179.7,
      "days_remaining": 2.3,
      "stock_out_risk": "CRITICAL",
      "reason": "Critical stock-out risk detected: Current inventory covers only 2.3 days. Predicted 7-day demand (267 units) exceeds available stock by 180 units. Emergency replenishment or inter-facility transfer required immediately."
    }
  ]
}
```

---

## 🧮 Calculation Logic & Risk Thresholds

1. **Daily Demand ($\hat{y}$):** Forecasted via trained XGBoost pipeline from patient footfall, previous consumption, inventory, temporal, and facility features.
2. **Multi-Day Projections:**
   - 7-Day Demand = $\hat{y} \times 7$
   - 30-Day Demand = $\hat{y} \times 30$
3. **Inventory Runway (Days Remaining):**
   $$\text{Days Remaining} = \frac{\text{Current Stock}}{\hat{y}}$$
4. **Shortage Quantity:**
   $$\text{Shortage} = \max(\text{7-Day Demand} - \text{Current Stock}, 0)$$
5. **Stock-Out Risk Classification:**
   - `CRITICAL`: $\le 3\text{ days of stock remaining}$
   - `HIGH`: $> 3\text{ and } \le 7\text{ days of stock remaining}$
   - `MEDIUM`: $> 7\text{ and } \le 14\text{ days of stock remaining}$
   - `LOW`: $> 14\text{ days of stock remaining}$

---

## 📁 Directory Structure

```text
ai-service/
├── data/
│   └── healthcare_data.csv       # Synthetic dataset (3,000 observations)
├── models/
│   └── demand_model.pkl          # Trained XGBoost pipeline artifact (R2: 0.9908)
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI application & routes
│   ├── model.py                  # Model artifact loader
│   ├── schemas.py                # Pydantic request/response schemas
│   └── prediction.py             # Inference & risk computation engine
├── generate_data.py              # Realistic synthetic data generator
├── train.py                      # Leak-free training & evaluation script
├── pipeline.py                   # Scalable feature transformer & XGBoost pipeline
├── test_service.py               # Comprehensive verification test suite
├── requirements.txt              # Microservice dependencies
├── .gitignore
└── README.md
```
