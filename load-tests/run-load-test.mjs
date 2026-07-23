import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

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

  // Generate Styled XLSX directly using ExcelJS
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Baseline Report');

  // Set column widths
  worksheet.columns = [
    { key: 'param', width: 35 },
    { key: 'val', width: 45 }
  ];

  // Title Row (Row 1)
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'PDD Family Vault Application Baseline Load Test Report';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0F172A' } };
  worksheet.mergeCells('A1:B1');

  // Row 4: Headers for Parameters
  worksheet.getRow(4).values = ['Parameters', 'Value'];
  const headerRow4 = worksheet.getRow(4);
  headerRow4.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0EA5E9' } // Sky Blue
    };
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  // Rows 5-8: Parameter Values
  worksheet.getRow(5).values = ['Target URL', 'https://pdd-family-vault.vercel.app'];
  worksheet.getRow(6).values = ['Backend API URL', `${BACKEND_URL}/health`];
  worksheet.getRow(7).values = ['Virtual Users (VU)', CONCURRENCY];
  worksheet.getRow(8).values = ['Test Duration (sec)', DURATION_MS / 1000];

  // Style Row 5 to 8 Values
  for (let r = 5; r <= 8; r++) {
    const row = worksheet.getRow(r);
    row.getCell('A').font = { name: 'Arial', size: 11 };
    row.getCell('B').font = { name: 'Arial', size: 11, bold: true };
    row.getCell('B').alignment = { horizontal: 'left' };
    
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  }

  // Row 11: Section Header
  const sectionCell = worksheet.getCell('A11');
  sectionCell.value = 'Execution Performance Summary';
  sectionCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0F172A' } };

  // Row 12: Headers for Performance Table
  worksheet.getRow(12).values = ['Key Performance Indicators (KPI)', 'Result'];
  const headerRow12 = worksheet.getRow(12);
  headerRow12.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0EA5E9' }
    };
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  const passRate = results.totalRequests > 0 ? ((results.success / results.totalRequests) * 100).toFixed(1) + '%' : '0.0%';

  // Populate Performance Data
  worksheet.getRow(13).values = ['Total Requests Sent', results.totalRequests];
  worksheet.getRow(14).values = ['Requests Per Second (RPS)', `${rps.toFixed(2)} req/sec`];
  worksheet.getRow(15).values = ['Successful Requests (2xx)', results.success];
  worksheet.getRow(16).values = ['Failed Requests (0/5xx/4xx)', results.failed];
  worksheet.getRow(17).values = ['Overall Pass Rate', passRate];
  worksheet.getRow(18).values = ['Average Latency (ms)', `${avgTime.toFixed(0)} ms`];
  worksheet.getRow(19).values = ['Minimum Latency (ms)', `${minTime} ms`];
  worksheet.getRow(20).values = ['Maximum Latency (ms)', `${maxTime} ms`];

  // Style Performance Rows 13 to 20
  for (let r = 13; r <= 20; r++) {
    const row = worksheet.getRow(r);
    row.getCell('A').font = { name: 'Arial', size: 11 };
    row.getCell('B').font = { name: 'Arial', size: 11, bold: true };
    row.getCell('B').alignment = { horizontal: 'right' };
    
    // Highlight rows
    if (r === 14 || r === 17) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDCFCE7' } // Light Green
        };
      });
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  }

  // Save the styled workbook
  await workbook.xlsx.writeFile(path.join(reportDir, 'load-test-reports.xlsx'));
  
  console.log('Load test completed successfully. Reports generated at load-tests/load-test-reports.md and load-test-reports.xlsx');
}

run().catch(console.error);
