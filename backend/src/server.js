const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import modular routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const phcRoutes = require('./routes/phcRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const bedRoutes = require('./routes/bedRoutes');
const staffRoutes = require('./routes/staffRoutes');
const patientRoutes = require('./routes/patientRoutes');
const alertRoutes = require('./routes/alertRoutes');
const transferRoutes = require('./routes/transferRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const federatedRoutes = require('./routes/federatedRoutes');
const userRoutes = require('./routes/userRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const searchRoutes = require('./routes/searchRoutes');
const supplyRequestRoutes = require('./routes/supplyRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const diseaseEventRoutes = require('./routes/diseaseEventRoutes');

// Centralized error middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// 1. Load environment variables
dotenv.config();

// 2. Initialize Express application
// 2. Initialize Express application
const app = express();

// Render runs this service behind a reverse proxy.
// Trust the first proxy hop so Express can determine the client IP
// correctly for middleware such as express-rate-limit.
app.set('trust proxy', 1);

// 3. Connect to MongoDB
connectDB();

// 4. CORS Configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by CORS for this origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// 5. Body Parsing and Cookie Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 6. Base API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/phcs', phcRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/redistributions', transferRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/federated', federatedRoutes);
app.use('/api/supply-requests', supplyRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disease-events', diseaseEventRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'HealthChain AI API',
      version: '1.0.0',
      status: 'active',
      environment: process.env.NODE_ENV || 'development',
      clientUrl: clientUrl,
      endpoints: {
        health: '/api/health',
        auth: {
          register: '/api/auth/register',
          login: '/api/auth/login',
          me: '/api/auth/me',
          profile: '/api/auth/profile',
          logout: '/api/auth/logout'
        },
        dashboardSummary: '/api/dashboard/summary',
        phcs: '/api/phcs',
        medicines: '/api/medicines',
        inventory: '/api/inventory',
        beds: '/api/beds',
        staff: '/api/staff',
        patientFootfall: '/api/patients/footfall',
        alerts: '/api/alerts',
        transfers: '/api/transfers',
        redistributions: '/api/redistributions',
        predictions: '/api/predictions',
        federatedStatus: '/api/federated/status',
        federatedMetadata: '/api/federated/metadata'
      }
    }
  });
});

// 7. Centralized Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Server Listener
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Server] HealthChain AI Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  console.log(`[Client URL] Accepting requests from: ${clientUrl}`);
  console.log(`[API Base] http://localhost:${PORT}/api/health`);
});

module.exports = app;
