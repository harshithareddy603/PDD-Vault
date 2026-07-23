import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const csvPath = './load-tests/load-test-reports.csv';
const xlsxPath = './load-tests/load-test-reports.xlsx';

function generate() {
  if (!fs.existsSync(csvPath)) {
    console.error('Error: CSV file not found.');
    return;
  }
  
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const rows = csvData.trim().split('\n').map(line => line.split(','));
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Baseline Report');
  
  // Write XLSX file
  XLSX.writeFile(wb, xlsxPath);
  console.log('Successfully generated load-test-reports.xlsx!');
}

generate();
