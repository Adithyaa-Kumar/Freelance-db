const http = require('http');

function makeRequest(path, method = 'GET', postData = null) {
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
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

async function testEndpoints() {
  console.log('\n=== Testing Backend API ===\n');

  // Test 1: Health
  console.log('1️⃣ Testing /api/health');
  try {
    const health = await makeRequest('/api/health');
    console.log(`Status: ${health.status}`);
    console.log(`Response: ${health.body}\n`);
  } catch (err) {
    console.error(`Error: ${err.message}\n`);
  }

  // Test 2: Try to get analytics (should fail without auth)
  console.log('2️⃣ Testing /api/analytics/dashboard (without token)');
  try {
    const analytics = await makeRequest('/api/analytics/dashboard');
    console.log(`Status: ${analytics.status}`);
    console.log(`Response: ${analytics.body}\n`);
  } catch (err) {
    console.error(`Error: ${err.message}\n`);
  }

  // Test 3: Seed routes
  console.log('3️⃣ Testing /api/seed/import');
  try {
    const seed = await makeRequest('/api/seed/import', 'POST');
    console.log(`Status: ${seed.status}`);
    console.log(`Response: ${seed.body}\n`);
  } catch (err) {
    console.error(`Error: ${err.message}\n`);
  }
}

testEndpoints();
