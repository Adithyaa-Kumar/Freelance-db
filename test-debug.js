const http = require('http');

function makeRequest(path, method = 'GET', postData = null, useAuth = false, token = null) {
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

    if (useAuth && token) {
      options.headers['Authorization'] = `Bearer ${token}`;
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

async function testDebug() {
  console.log('\n🔍 DEBUGGING ANALYTICS ENDPOINT\n');

  let token = null;

  // Get token
  console.log('1️⃣  Getting auth token...');
  try {
    const register = await makeRequest('/api/auth/register', 'POST', {
      email: `debug-${Date.now()}@example.com`,
      password: 'Test123!',
      name: 'Debug User'
    });
    if (register.body.data && register.body.data.token) {
      token = register.body.data.token;
      console.log(`   ✅ Token: ${token.substring(0, 30)}...\n`);
    } else {
      console.log(`   ❌ No token in response\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test endpoints
  const endpoints = [
    { path: '/api/analytics/stats', method: 'GET', needsAuth: true },
    { path: '/api/analytics/revenue', method: 'GET', needsAuth: true },
    { path: '/api/analytics/projects', method: 'GET', needsAuth: true },
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.method} ${endpoint.path}`);
    try {
      const res = await makeRequest(endpoint.path, endpoint.method, null, endpoint.needsAuth, token);
      console.log(`   Status: ${res.status}`);
      if (res.status === 200) {
        console.log(`   ✅ Success\n`);
      } else {
        console.log(`   Response: ${JSON.stringify(res.body).substring(0, 100)}\n`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }
  }
}

testDebug();
