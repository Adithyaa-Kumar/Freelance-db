const http = require('http');
const fs = require('fs');

let authToken = null;

function makeRequest(path, method = 'GET', postData = null, useAuth = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (useAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function testFull() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE BACKEND API TEST SUITE    ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Test 1: Health
  console.log('1️⃣  Health Check');
  try {
    const health = await makeRequest('/api/health');
    console.log(`   ✅ Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.body)}\n`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test 2: Register
  console.log('2️⃣  Register (Create User)');
  try {
    const register = await makeRequest('/api/auth/register', 'POST', {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#',
      name: 'Test User'
    });
    console.log(`   Status: ${register.status}`);
    if (register.status === 201 || register.status === 200) {
      console.log(`   ✅ Success`);
      if (register.body.data && register.body.data.token) {
        authToken = register.body.data.token;
        console.log(`   Token: ${authToken.substring(0, 20)}...\n`);
      } else if (register.body.token) {
        authToken = register.body.token;
        console.log(`   Token: ${authToken.substring(0, 20)}...\n`);
      } else {
        console.log(`   Response: ${JSON.stringify(register.body)}\n`);
      }
    } else {
      console.log(`   ❌ Failed: ${JSON.stringify(register.body)}\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test 3: Analytics Stats (with auth)
  if (authToken) {
    console.log('3️⃣  Analytics - Get Stats');
    try {
      const stats = await makeRequest('/api/analytics/stats', 'GET', null, true);
      console.log(`   Status: ${stats.status}`);
      if (stats.status === 200) {
        console.log(`   ✅ Success`);
        console.log(`   Data: ${JSON.stringify(stats.body)}\n`);
      } else {
        console.log(`   ❌ Failed: ${JSON.stringify(stats.body)}\n`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }

    // Test 4: Analytics Revenue
    console.log('4️⃣  Analytics - Revenue Trend');
    try {
      const revenue = await makeRequest('/api/analytics/revenue', 'GET', null, true);
      console.log(`   Status: ${revenue.status}`);
      if (revenue.status === 200) {
        console.log(`   ✅ Success`);
        console.log(`   Items: ${revenue.body.length}`);
        console.log(`   Sample: ${JSON.stringify(revenue.body[0])}\n`);
      } else {
        console.log(`   ❌ Failed: ${JSON.stringify(revenue.body)}\n`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }

    // Test 5: Seed/Import Data
    console.log('5️⃣  Seed - Import Sample Data');
    try {
      const seed = await makeRequest('/api/seed/import', 'POST', {}, true);
      console.log(`   Status: ${seed.status}`);
      if (seed.status === 201 || seed.status === 200 || seed.status === 500) {
        // 500 is expected if data already exists
        if (seed.status === 500 && seed.body.message && seed.body.message.includes('already exists')) {
          console.log(`   ℹ️  Data already seeded`);
          console.log(`   Response: ${JSON.stringify(seed.body)}\n`);
        } else if (seed.status === 200 || seed.status === 201) {
          console.log(`   ✅ Success`);
          console.log(`   Response: ${JSON.stringify(seed.body).substring(0, 100)}...\n`);
        } else {
          console.log(`   ⚠️  Status ${seed.status}`);
          console.log(`   Response: ${JSON.stringify(seed.body)}\n`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }
  } else {
    console.log('⚠️  Skipping authenticated tests (no token)\n');
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║         TEST SUITE COMPLETE                ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

testFull().catch(console.error);
