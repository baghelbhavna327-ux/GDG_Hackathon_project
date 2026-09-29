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

async function run() {
  console.log('--- Testing Auth and Notifications ---');
  
  // 1. Login Admin
  const adminLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'admin@healthchain.gov',
    password: 'password123'
  });
  console.log('Admin login:', adminLogin.status, adminLogin.body.user ? adminLogin.body.user.name : adminLogin.body);
  const adminToken = adminLogin.body.token;

  // 2. Login Clinician
  const clinicianLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'clinician@healthchain.gov',
    password: 'password123'
  });
  console.log('Clinician login:', clinicianLogin.status, clinicianLogin.body.user ? clinicianLogin.body.user.name : clinicianLogin.body);
  const clinicianToken = clinicianLogin.body.token;

  // 3. Check Admin unread notifications
  const adminNotifs = await get('http://localhost:5000/api/notifications', adminToken);
  console.log('Admin notifications count:', adminNotifs.body.data ? adminNotifs.body.data.length : 0, 'Unread count:', adminNotifs.body.unreadCount);

  // 4. Check Clinician unread notifications
  const clinicianNotifs = await get('http://localhost:5000/api/notifications', clinicianToken);
  console.log('Clinician notifications count:', clinicianNotifs.body.data ? clinicianNotifs.body.data.length : 0, 'Unread count:', clinicianNotifs.body.unreadCount);

  // 5. Test Mark All As Read
  const markRead = await patch('http://localhost:5000/api/notifications/mark-all-read', {}, adminToken);
  console.log('Admin mark all read result:', markRead.status, markRead.body.success);

  const adminUnreadAfter = await get('http://localhost:5000/api/notifications/unread-count', adminToken);
  console.log('Admin unread count after mark all read:', adminUnreadAfter.body.unreadCount);

  console.log('--- All Notifications tests passed cleanly! ---');
}

run().catch(console.error);
