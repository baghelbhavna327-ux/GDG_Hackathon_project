# HealthChain AI - Backend API

Backend server and database layer for **HealthChain AI**, a national healthcare resource and supply-chain management platform for monitoring Primary Health Centres (PHCs), medicine inventory, bed availability, staff attendance, patient footfall, AI predictions, and resource redistribution.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Environment Management:** `dotenv`
- **Security / Middleware:** `cors`, `express.json()`
- **Dev Tooling:** `nodemon`

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── config/          # Database connection and environment config
│   │   └── db.js
│   ├── controllers/     # Request handlers & business logic
│   │   ├── healthController.js
│   │   ├── phcController.js
│   │   ├── medicineController.js
│   │   ├── inventoryController.js
│   │   ├── bedController.js
│   │   ├── staffController.js
│   │   ├── patientController.js
│   │   ├── alertController.js
│   │   ├── transferController.js
│   │   └── predictionController.js
│   ├── data/            # Simulated demonstration datasets & seeder
│   │   ├── seedData.js
│   │   └── seed.js
│   ├── middleware/      # Custom middleware (error handling, logging)
│   │   └── errorHandler.js
│   ├── models/          # 9 Mongoose data schemas
│   │   ├── Alert.js
│   │   ├── Bed.js
│   │   ├── Inventory.js
│   │   ├── Medicine.js
│   │   ├── PatientFootfall.js
│   │   ├── PHC.js
│   │   ├── Prediction.js
│   │   ├── ResourceTransfer.js
│   │   ├── Staff.js
│   │   └── index.js
│   ├── routes/          # Express API route definitions
│   │   ├── healthRoutes.js
│   │   ├── phcRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── bedRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── transferRoutes.js
│   │   └── predictionRoutes.js
│   └── server.js        # Main Express server entrypoint
├── .env                 # Environment variables
├── .gitignore           # Git ignore configuration
├── package.json         # Project metadata and dependencies
└── README.md            # Backend documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Review or edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthchain-ai
NODE_ENV=development
```

### 3. Seed Simulated Demonstration Data

Populate MongoDB with 20 PHCs, 15 medicines, 300 inventory items, beds, staff, 7-day footfalls, 18 alerts, 15 predictions, and 8 redistribution transfers:

```bash
npm run seed
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Verify API Health

Send a `GET` request to:
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "HealthChain AI API is running"
}
```

---

## 📡 API Endpoints

### 🩺 Primary Health Centres (PHCs)
- `GET /api/phcs/stats`: Dashboard-ready aggregated stats (total PHCs, critical count, bed availability %, attendance %, footfall).
- `GET /api/phcs`: List all PHCs (supports query params `?state=&district=&riskLevel=&search=`).
- `GET /api/phcs/state/:state`: Filter PHCs by state.
- `GET /api/phcs/district/:district`: Filter PHCs by district.
- `GET /api/phcs/:id`: Single PHC with bed capacity, staff members, and inventory list.

### 💊 Medicines
- `GET /api/medicines`: List all available medicines (supports `?category=&search=`).
- `GET /api/medicines/:id`: Single medicine details.

### 📦 Inventory
- `GET /api/inventory`: All 300 inventory items populated with medicine and PHC info (supports `?state=&district=&medicine=&risk=&search=`).
- `GET /api/inventory/critical`: High-risk inventory items (`daysRemaining <= 5`).
- `GET /api/inventory/low-stock`: Low-stock & medium-risk items (`daysRemaining <= 10`).
- `GET /api/inventory/phc/:phcId`: Full inventory for a specific PHC.
- `GET /api/inventory/:id`: Single inventory record.

### 🛏️ Beds
- `GET /api/beds/summary`: Aggregated bed metrics (`totalBeds`, `occupiedBeds`, `availableBeds`, `occupancyPercentage`).
- `GET /api/beds`: All 20 PHC bed capacity and occupancy records.
- `GET /api/beds/phc/:phcId`: Bed capacity and occupancy for a specific PHC.

### 👩‍⚕️ Staff Attendance
- `GET /api/staff/attendance`: Staff attendance metrics (`totalStaff`, `activeStaff`, `attendancePercentage`, and `roleBreakdown`).
- `GET /api/staff`: All staff members across PHCs (supports `?role=&status=&phcId=`).
- `GET /api/staff/phc/:phcId`: Staff members assigned to a specific PHC.

### 👥 Patient Footfall
- `GET /api/patients/footfall/summary`: Aggregated patient metrics (`todaysPatients`, `weeklyPatients`, `dailyAverage`, and 7-day `dailyBreakdown`).
- `GET /api/patients/footfall`: All patient footfall records (supports `?phcId=&startDate=&endDate=`).
- `GET /api/patients/footfall/phc/:phcId`: 7-day footfall history for a specific PHC.

### 🚨 Alerts
- `GET /api/alerts`: All alerts sorted newest first (supports `?severity=&type=&status=&search=`).
- `GET /api/alerts/critical`: Critical and high severity alerts requiring immediate response.
- `GET /api/alerts/recent`: Top 10 most recent system alerts.
- `GET /api/alerts/phc/:phcId`: Alert history for a specific PHC.

### 🔄 Resource Redistribution
- `GET /api/transfers`: All redistribution recommendations (supports `?priority=&status=&medicine=&search=`).
- `GET /api/transfers/pending`: Recommendations awaiting action (`status: PENDING` or `RECOMMENDED`).
- `GET /api/transfers/high-priority`: Critical & high priority transfer routes.
- `GET /api/transfers/:id`: Single transfer recommendation details.

### 🔮 AI Predictions (FastAPI Integration Ready)
- `GET /api/predictions`: All AI demand & stock-out predictions (supports `?risk=&forecastDays=&medicine=&search=`).
- `GET /api/predictions/high-risk`: Filter for `HIGH` & `CRITICAL` stock-out risk predictions.
- `GET /api/predictions/phc/:phcId`: All prediction forecasts for a specific PHC.
- `GET /api/predictions/:id`: Single prediction record by ID.
- `POST /api/predictions`: Ingests single or batch prediction records from the external Python/FastAPI ML service.





