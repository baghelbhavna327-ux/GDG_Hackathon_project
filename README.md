<<<<<<< HEAD
# HealthChain AI — Predict. Prevent. Protect.

A federated AI platform for public healthcare resource management and national medicine supply-chain optimization across Primary Health Centres (PHCs).

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────┐
                               │     React Frontend      │
                               │  (http://localhost:5173) │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │  Node.js / Express API  │
                               │  (http://localhost:5000) │
                               └───────┬──────────┬──────┘
                                       │          │
                     ┌─────────────────┘          └─────────────────┐
                     ▼                                              ▼
       ┌───────────────────────────┐                  ┌───────────────────────────┐
       │     MongoDB Database      │                  │    FastAPI AI Service     │
       │ (mongodb://localhost:27017│                  │  (http://localhost:8000)  │
       │    /healthchain-ai)       │                  └─────────────┬─────────────┘
       └───────────────────────────┘                                │
                                                                    ▼
                                                      ┌───────────────────────────┐
                                                      │   Federated AI Network    │
                                                      │ (MP, Rajasthan, Gujarat)  │
                                                      └───────────────────────────┘
```

---

## 🌟 Tech Stack Overview

- **Frontend:** React 18 with TypeScript, Vite, Tailwind CSS, Recharts, Leaflet Geospatial Maps, Lucide React
- **Backend:** Node.js, Express, Mongoose ODM, MongoDB
- **AI Microservice:** Python 3.11+, FastAPI, XGBoost, Scikit-Learn, Pydantic v2, Uvicorn
- **Federated Learning:** Flower (flwr), NumPy, Scikit-learn, Multi-client FedAvg Aggregation

---

## 🚀 Quick Setup & Execution Guide

### Prerequisites
- Node.js (v18+ or v20+)
- Python (v3.10+)
- MongoDB running locally on `localhost:27017`

---

### Step 1: Install Dependencies

```bash
# 1. Install Frontend Dependencies (Root directory)
npm install

# 2. Install Backend Dependencies
cd backend
npm install
cd ..

# 3. Install AI Service Dependencies
cd ai-service
pip install -r requirements.txt
cd ..

# 4. Install Federated AI Dependencies
cd federated-ai
pip install -r requirements.txt
cd ..
```

---

### Step 2: Seed Database

Populate MongoDB with 20 PHCs, 15 medicines, 300 inventory items, staff, bed records, alerts, and transfers:

```bash
cd backend
npm run seed
cd ..
```

---

### Step 3: Start All Services

Open 3 separate terminals:

#### Terminal 1 — Start FastAPI AI Service (Port 8000):
```bash
cd ai-service
python -m uvicorn app.main:app --port 8000 --reload
```
*Health Check:* `http://localhost:8000/health`

#### Terminal 2 — Start Node.js Express Backend (Port 5000):
```bash
cd backend
npm run dev
```
*API Base:* `http://localhost:5000/api/health`

#### Terminal 3 — Start React Frontend (Port 5173):
```bash
npm run dev -- --host
```
*Web App:* `http://localhost:5173`

---

### Step 4: Run Federated Learning Simulation & Tests

```bash
# Run automated multi-state FedAvg training simulation (MP, RJ, GJ)
cd federated-ai
python run_federated.py

# Run comprehensive verification suite
python test_federated.py
python test_endpoints.py
cd ..
```

---

## 🧪 Integration QA Test Suite

Run the full end-to-end integration test runner:

```bash
node qa_integration_suite.cjs
```

---

## 🌐 Core API Endpoints

| Endpoint | Method | Service | Purpose |
|---|---|---|---|
| `/health` | `GET` | FastAPI (8000) | Check AI model loading and microservice health |
| `/predict` | `POST` | FastAPI (8000) | Predict daily demand, 7/30-day demand, stock runway, and risk |
| `/predict/emergency` | `POST` | FastAPI (8000) | Simulate footfall shock and compare baseline vs. emergency demand |
| `/api/dashboard/summary` | `GET` | Node.js (5000) | Real dynamic MongoDB summaries for beds, alerts, and transfers |
| `/api/phcs` | `GET` | Node.js (5000) | Filter PHCs by `?state=...` and `?district=...` |
| `/api/inventory/low-stock` | `GET` | Node.js (5000) | List inventory items under critical or low-stock risk |
| `/api/redistributions` | `POST` | Node.js (5000) | Create inter-facility redistribution recommendation |
| `/api/redistributions/:id` | `PUT` | Node.js (5000) | Mark status `COMPLETED` (atomically updates source & destination stock) |
| `/api/federated/status` | `GET` | Node.js (5000) | Retrieve high-level federated model version and 3-state metadata |

---

## 🔒 Security & Privacy Notice

- **Synthetic Datasets:** All datasets for Madhya Pradesh, Rajasthan, Gujarat, and Uttar Pradesh are generated synthetically for hackathon demonstration. No real Patient Identifiable Information (PII) is included.
- **Privacy Boundaries:** Federated learning transmits model weight and gradient vectors during training, avoiding centralized pooling of raw hospital logs. Additional cryptographic privacy techniques (such as Differential Privacy and Secure Multi-Party Computation) would be required for national production deployment.
- **Secrets & Configuration:** No passwords or secrets are committed. All configurations are loaded through `.env` files matching `.env.example`.
=======
# GDG_Hackathon_project
>>>>>>> b6240277fec9d4a57887c868c8c37d7bf3e1538a
