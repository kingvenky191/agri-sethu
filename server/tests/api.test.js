const http = require('http');
const assert = require('assert');

function makeRequest({ path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runApiTests() {
  console.log('====================================================');
  console.log('🌐 RUNNING AGRI SETHU API & ROUTE PROTECTION TESTS');
  console.log('====================================================\n');

  // 1. Health check
  const health = await makeRequest({ path: '/api/health' });
  assert.strictEqual(health.status, 200);
  assert.strictEqual(health.data.status, 'HEALTHY');
  console.log('✅ [PASS] API /api/health returned 200 HEALTHY');

  // 2. Demo logins
  const farmerLogin = await makeRequest({
    path: '/api/auth/demo-login',
    method: 'POST',
    body: { role: 'farmer' }
  });
  assert.strictEqual(farmerLogin.status, 200);
  const farmerToken = farmerLogin.data.token;
  assert.ok(farmerToken);
  console.log('✅ [PASS] Farmer demo login succeeded');

  const buyerLogin = await makeRequest({
    path: '/api/auth/demo-login',
    method: 'POST',
    body: { role: 'buyer' }
  });
  assert.strictEqual(buyerLogin.status, 200);
  const buyerToken = buyerLogin.data.token;
  assert.ok(buyerToken);
  console.log('✅ [PASS] Buyer demo login succeeded');

  // 3. Route Protection: Farmer cannot access Buyer-only route
  const farmerOnBuyerRoute = await makeRequest({
    path: '/api/buyer/dashboard',
    headers: { 'Authorization': `Bearer ${farmerToken}` }
  });
  assert.strictEqual(farmerOnBuyerRoute.status, 403);
  console.log('✅ [PASS] Route Protection: Farmer denied access to /api/buyer/dashboard (403 Forbidden)');

  // 4. Route Protection: Buyer cannot access Farmer-only route
  const buyerOnFarmerRoute = await makeRequest({
    path: '/api/farmer/dashboard',
    headers: { 'Authorization': `Bearer ${buyerToken}` }
  });
  assert.strictEqual(buyerOnFarmerRoute.status, 403);
  console.log('✅ [PASS] Route Protection: Buyer denied access to /api/farmer/dashboard (403 Forbidden)');

  // 5. Farmer accessing farmer dashboard
  const farmerDashboard = await makeRequest({
    path: '/api/farmer/dashboard',
    headers: { 'Authorization': `Bearer ${farmerToken}` }
  });
  assert.strictEqual(farmerDashboard.status, 200);
  assert.ok(farmerDashboard.data.kpis);
  console.log('✅ [PASS] Farmer successfully retrieved /api/farmer/dashboard');

  // 6. Buyer accessing buyer dashboard
  const buyerDashboard = await makeRequest({
    path: '/api/buyer/dashboard',
    headers: { 'Authorization': `Bearer ${buyerToken}` }
  });
  assert.strictEqual(buyerDashboard.status, 200);
  assert.ok(buyerDashboard.data.buyer);
  console.log('✅ [PASS] Buyer successfully retrieved /api/buyer/dashboard');

  // 7. IVR Phone API test for Telugu & Hindi
  const ivrTelugu = await makeRequest({
    path: '/api/ivr/call',
    method: 'POST',
    body: { lang: 'te', step: 1 }
  });
  assert.strictEqual(ivrTelugu.status, 200);
  assert.ok(ivrTelugu.data.speechText.includes('నమస్కారం'));
  console.log('✅ [PASS] IVR Helpline generates synthetic speech script in Telugu');

  const ivrHindi = await makeRequest({
    path: '/api/ivr/call',
    method: 'POST',
    body: { lang: 'hi', step: 1 }
  });
  assert.strictEqual(ivrHindi.status, 200);
  assert.ok(ivrHindi.data.speechText.includes('नमस्ते'));
  console.log('✅ [PASS] IVR Helpline generates synthetic speech script in Hindi');

  console.log('\n====================================================');
  console.log('🎉 ALL API SECURITY & ROUTE PROTECTION TESTS PASSED!');
  console.log('====================================================');
}

runApiTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
