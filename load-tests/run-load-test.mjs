import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'https://pdd-family-vault.onrender.com';
const EMAIL = 'bunny.akki21@gmail.com';
const PASSWORD = 'Bunny123';
const DURATION_MS = 60 * 1000; // 1 minute
const CONCURRENCY = 100; // 100 virtual users

async function run() {
  console.log(`Starting baseline load test against: ${BACKEND_URL}`);
  console.log(`Config: ${CONCURRENCY} VUs for 1 minute`);
  
  // Step 1: Warm up the server (Render free tier cold start check)
  console.log('Warming up backend server...');
  let warmedUp = false;
  for (let i = 0; i < 12; i++) { // Up to 1 minute of retries
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.ok) {
        warmedUp = true;
        console.log('Backend server is awake and healthy.');
        break;
      }
    } catch (e) {
      console.log('Waiting for backend server to wake up (Render cold start)...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  if (!warmedUp) {
    console.error('Error: Backend server did not wake up in time. Aborting test.');
    return;
  }

  // Step 2: Login to get token
  let token = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    if (res.ok) {
      const data = await res.json();
      token = data.token;
      console.log('Login successful. Auth token acquired.');
    } else {
      console.warn(`Login failed with status ${res.status}. Running health check fallbacks.`);
    }
  } catch (err) {
    console.warn(`Login request failed: ${err.message}. Running health check fallbacks.`);
  }

  const results = {
    totalRequests: 0,
    success: 0,
    failed: 0,
    times: [],
  };

  const startTime = Date.now();
  const endTime = startTime + DURATION_MS;

  async function worker() {
    while (Date.now() < endTime) {
      const reqStart = Date.now();
      try {
        const url = token 
          ? `${BACKEND_URL}/api/auth/me` 
          : `${BACKEND_URL}/health`;
        
        const headers = token 
          ? { 'Authorization': `Bearer ${token}` }
          : {};
        
        const res = await fetch(url, { headers });
        const duration = Date.now() - reqStart;
        results.times.push(duration);
        results.totalRequests++;
        
        if (res.ok) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (err) {
        results.failed++;
        results.totalRequests++;
        results.times.push(Date.now() - reqStart);
      }
    }
  }

  console.log(`Launching ${CONCURRENCY} workers for 60 seconds...`);
  
  // Start concurrent workers
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalDurationSeconds = (Date.now() - startTime) / 1000;
  const rps = results.totalRequests / totalDurationSeconds;

  const sortedTimes = results.times.sort((a, b) => a - b);
  const minTime = sortedTimes[0] || 0;
  const maxTime = sortedTimes[sortedTimes.length - 1] || 0;
  const avgTime = sortedTimes.reduce((a, b) => a + b, 0) / (sortedTimes.length || 1);

  // Generate markdown report
  const report = `# Load Test Report - Baseline

* **Target URL:** ${BACKEND_URL}
* **Test Date:** ${new Date().toLocaleString()}
* **Concurrency:** ${CONCURRENCY} Virtual Users (VUs)
* **Target Duration:** 1 minute (Actual: ${totalDurationSeconds.toFixed(2)}s)

## Summary Metrics

| Metric | Value |
| --- | --- |
| **Total Requests Sent** | ${results.totalRequests} |
| **Successful Requests (2xx)** | ${results.success} |
| **Failed Requests** | ${results.failed} |
| **Requests Per Second (RPS)** | ${rps.toFixed(2)} req/sec |

## Response Times
* **Average:** ${avgTime.toFixed(2)}ms
* **Minimum:** ${minTime}ms
* **Maximum:** ${maxTime}ms
`;

  const reportDir = './load-tests';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }
  
  fs.writeFileSync(path.join(reportDir, 'load-test-reports.md'), report);

  const csvReport = `Metric,Value
Target URL,${BACKEND_URL}
Test Date,${new Date().toLocaleString().replace(/,/g, '')}
Concurrency (VUs),${CONCURRENCY}
Duration (seconds),${totalDurationSeconds.toFixed(2)}
Total Requests Sent,${results.totalRequests}
Successful Requests,${results.success}
Failed Requests,${results.failed}
Requests Per Second (RPS),${rps.toFixed(2)}
Average Response Time (ms),${avgTime.toFixed(2)}
Minimum Response Time (ms),${minTime}
Maximum Response Time (ms),${maxTime}
`;
  fs.writeFileSync(path.join(reportDir, 'load-test-reports.csv'), csvReport);
  console.log('Load test completed successfully. Reports generated at load-tests/load-test-reports.md and load-test-reports.csv');
}

run().catch(console.error);
