/**
 * Comprehensive Backend API Test Suite for HealthChain AI
 */

const http = require('http');
const app = require('./src/server');

const PORT = 5099;

const endpointsToTest = [
  { url: '/api/health', name: 'Health Status Check', validate: data => data.success && data.message },
  { url: '/api/phcs', name: 'List All PHCs', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/phcs/stats', name: 'PHC Stats Summary', validate: data => data.success && data.data.totalPHCs > 0 },
  { url: '/api/medicines', name: 'List All Medicines', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/inventory', name: 'List All Inventory Items', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/inventory/critical', name: 'Critical Stock Items', validate: data => data.success && Array.isArray(data.data) },
  { url: '/api/beds', name: 'List All Bed Capacities', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/beds/summary', name: 'Bed Overview Summary', validate: data => data.success && data.data.totalBeds > 0 },
  { url: '/api/staff', name: 'List All Staff Records', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/staff/attendance', name: 'Staff Attendance Summary', validate: data => data.success && data.data.totalStaff > 0 },
  { url: '/api/patients/footfall', name: 'Patient Footfall History', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/alerts', name: 'List All System Alerts', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/alerts/critical', name: 'Critical Alerts', validate: data => data.success && Array.isArray(data.data) },
  { url: '/api/predictions', name: 'List All AI Predictions', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/predictions/high-risk', name: 'High-Risk Predictions', validate: data => data.success && Array.isArray(data.data) },
  { url: '/api/transfers', name: 'List All Redistribution Transfers', validate: data => data.success && Array.isArray(data.data) && data.count > 0 },
  { url: '/api/transfers/pending', name: 'Pending Transfers', validate: data => data.success && Array.isArray(data.data) }
];

const runTests = () => {
  const server = app.listen(PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`🏥 HealthChain AI - Backend Test Suite`);
    console.log(`Running against http://localhost:${PORT}`);
    console.log(`======================================================\n`);

    let passedCount = 0;
    let failedCount = 0;

    for (const item of endpointsToTest) {
      await new Promise(resolve => {
        const fullUrl = `http://localhost:${PORT}${item.url}`;
        http.get(fullUrl, res => {
          let rawData = '';
          res.on('data', chunk => rawData += chunk);
          res.on('end', () => {
            try {
              if (res.statusCode !== 200) {
                console.error(`❌ [FAIL] ${item.name} (${item.url}) - Status: ${res.statusCode}`);
                failedCount++;
                return resolve();
              }

              const parsed = JSON.parse(rawData);

              if (item.validate(parsed)) {
                console.log(`✅ [PASS] ${item.name.padEnd(32)} ${item.url.padEnd(30)} (Status: ${res.statusCode})`);
                passedCount++;
              } else {
                console.error(`❌ [FAIL] ${item.name} (${item.url}) - Validation condition failed`);
                failedCount++;
              }
            } catch (err) {
              console.error(`❌ [FAIL] ${item.name} (${item.url}) - JSON Parse Error: ${err.message}`);
              failedCount++;
            }
            resolve();
          });
        }).on('error', err => {
          console.error(`❌ [FAIL] ${item.name} (${item.url}) - Network Error: ${err.message}`);
          failedCount++;
          resolve();
        });
      });
    }

    console.log(`\n======================================================`);
    console.log(`📊 Test Results: ${passedCount} Passed, ${failedCount} Failed out of ${endpointsToTest.length} endpoints`);
    console.log(`======================================================\n`);

    server.close(() => {
      process.exit(failedCount === 0 ? 0 : 1);
    });
  });
};

runTests();
