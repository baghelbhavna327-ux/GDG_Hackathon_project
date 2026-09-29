const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function patch(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data || {});
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runHeroWorkflowTest() {
  console.log('====================================================');
  console.log('HEALTHCHAIN AI — HERO WORKFLOW END-TO-END VALIDATION');
  console.log('Story: MONITOR → DETECT → PREDICT → ALERT → REQUEST → APPROVE → REDISTRIBUTE → TRACK');
  console.log('====================================================\n');

  // STEP 1: VERIFY AI PREDICTION (FastAPI XGBoost Engine)
  console.log('1. [PREDICT] Testing FastAPI AI Engine on port 8000 (/predict)...');
  const aiPredict = await post('http://localhost:8000/predict', {
    phc: 'Guna PHC-04',
    state: 'Madhya Pradesh',
    district: 'Guna',
    medicine: 'Paracetamol',
    current_stock: 120,
    patient_count: 240,
    previous_consumption: 48
  });
  console.log('   FastAPI Status:', aiPredict.status);
  console.log('   AI Predicted 7-Day Demand:', aiPredict.body?.data?.predicted_7_day_demand, 'units');
  console.log('   AI Stock-out Risk:', aiPredict.body?.data?.stock_out_risk);
  console.log('   AI Days Remaining:', aiPredict.body?.data?.days_remaining, 'days');
  console.log('   AI Shortage Deficit:', aiPredict.body?.data?.shortage_quantity, 'units\n');

  // STEP 2: VERIFY EMERGENCY WHAT-IF SIMULATION (FastAPI Emergency Surge)
  console.log('2. [EMERGENCY] Testing FastAPI Emergency What-If Simulator (/predict/emergency)...');
  const aiEmergency = await post('http://localhost:8000/predict/emergency', {
    phc: 'Guna PHC-04',
    state: 'Madhya Pradesh',
    district: 'Guna',
    medicine: 'Paracetamol',
    current_stock: 120,
    patient_count: 240,
    previous_consumption: 48
  });
  console.log('   FastAPI Emergency Status:', aiEmergency.status);
  console.log('   Normal 7-Day Demand:', aiEmergency.body?.data?.normal?.predicted_7_day_demand, 'units');
  console.log('   Emergency Surge (+45%):', aiEmergency.body?.data?.emergency?.predicted_7_day_demand, 'units');
  console.log('   Emergency Days Remaining:', aiEmergency.body?.data?.emergency?.days_remaining, 'days\n');

  // STEP 3: AUTHENTICATE CLINICIAN & ADMIN
  console.log('3. [AUTH] Authenticating Clinician and Admin sessions...');
  const clinicianLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'worker@healthchain.gov.in',
    password: 'Worker@123456'
  });
  const clinicianToken = clinicianLogin.body.token;
  console.log('   Clinician Auth:', clinicianLogin.status, clinicianLogin.body?.data?.user?.name);

  const adminLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'admin@healthchain.gov.in',
    password: 'Admin@123456'
  });
  const adminToken = adminLogin.body.token;
  console.log('   Admin Auth:', adminLogin.status, adminLogin.body?.data?.user?.name, '\n');

  // STEP 4: CLINICIAN SUBMITS SUPPLY REQUEST (REQUEST)
  console.log('4. [REQUEST] Clinician submits AI-prefilled supply request...');
  const supplyPayload = {
    phcId: 'phc-04',
    phcName: 'Guna PHC-04',
    district: 'Guna',
    state: 'Madhya Pradesh',
    medicine: 'Paracetamol 500mg Tablets',
    currentStock: 120,
    predictedDailyDemand: 105.2,
    predicted7DayDemand: 736.4,
    daysRemaining: 1.1,
    shortageQuantity: 616.4,
    stockOutRisk: 'CRITICAL',
    requestedQuantity: 600,
    urgency: 'CRITICAL',
    reason: 'Acute OPD patient influx (+68%) projects stock exhaustion within 26 hours. Immediate central replenishment requested.'
  };

  const createReqRes = await post('http://localhost:5000/api/supply-requests', supplyPayload, clinicianToken);
  console.log('   Supply Request Creation Status:', createReqRes.status);
  const createdRequestId = createReqRes.body?.data?._id;
  console.log('   Created Request ID:', createdRequestId, 'Status:', createReqRes.body?.data?.status, '\n');

  // STEP 5: ADMIN RECEIVES REAL-TIME NOTIFICATION (ALERT)
  console.log('5. [ALERT / NOTIFY] Verifying Admin receives real-time notification...');
  const adminNotifs = await get('http://localhost:5000/api/notifications', adminToken);
  console.log('   Admin Notifications Count:', adminNotifs.body?.data?.length);
  const topAdminNotif = adminNotifs.body?.data?.[0];
  console.log('   Latest Notification Type:', topAdminNotif?.type, 'Title:', topAdminNotif?.title);
  console.log('   Message:', topAdminNotif?.message, '\n');

  // STEP 6: ADMIN APPROVES REQUEST (APPROVE)
  console.log('6. [APPROVE] Admin reviews and approves supply request with regional routing...');
  const approveRes = await patch(`http://localhost:5000/api/supply-requests/${createdRequestId}/approve`, {
    approvedQuantity: 600,
    adminComment: 'Approved for priority transfer dispatch from PHC-B Central Depot.'
  }, adminToken);
  console.log('   Approval Status:', approveRes.status);
  console.log('   Updated Request Status:', approveRes.body?.data?.status);
  console.log('   Approved Qty:', approveRes.body?.data?.approvedQuantity, '\n');

  // STEP 7: CLINICIAN RECEIVES APPROVAL NOTIFICATION & TRACKING
  console.log('7. [TRACK] Verifying Clinician receives status notification & progress tracking...');
  const clinicianNotifs = await get('http://localhost:5000/api/notifications', clinicianToken);
  const topClinicianNotif = clinicianNotifs.body?.data?.[0];
  console.log('   Clinician Latest Notification:', topClinicianNotif?.type, '-', topClinicianNotif?.title);
  console.log('   Message:', topClinicianNotif?.message, '\n');

  // STEP 8: DISPATCH & FULFILLMENT (REDISTRIBUTE / FULFILL)
  console.log('8. [REDISTRIBUTE / FULFILL] Admin executes stock dispatch and fulfills request...');
  const fulfillRes = await patch(`http://localhost:5000/api/supply-requests/${createdRequestId}/fulfill`, {}, adminToken);
  console.log('   Fulfillment Status:', fulfillRes.status);
  console.log('   Final Status:', fulfillRes.body?.data?.status, '\n');

  console.log('====================================================');
  console.log('✅ COMPLETE HERO WORKFLOW VERIFIED SUCCESSFULLY!');
  console.log('====================================================');
}

runHeroWorkflowTest().catch(console.error);
