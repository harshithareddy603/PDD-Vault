import { createWorker } from 'tesseract.js';

export type DetectedCategory = 
  | 'Aadhaar'
  | 'PAN'
  | 'Passport'
  | 'Driving Licence'
  | 'Insurance'
  | 'Medical'
  | 'Resume'
  | 'Voter ID'
  | 'Certificate'
  | 'Education'
  | 'Property'
  | 'License'
  | 'ID'
  | 'Other'
  | 'General';

export type ExtractedDocData = {
  category: DetectedCategory;
  appCategory: string; // Direct mapping to standard app CATEGORIES dropdown
  confidence: number;
  name: string | null;
  documentNumber: string | null;
  dob: string | null;
  expiryDate: string | null;
  rawText: string;
};

// Comprehensive keyword map for category classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Aadhaar': ['aadhaar', 'uidai', 'unique identification', 'government of india', 'govt of india', 'mera aadhaar', 'pehchan', 'help@uidai.gov.in'],
  'PAN': ['income tax department', 'permanent account number', 'pan card', 'govt of india', 'father name', 'income tax'],
  'Passport': ['republic of india', 'passport', 'passport no', 'type p', 'mrz', 'country code ind', 'nationality indian', 'place of birth'],
  'Driving Licence': ['driving licence', 'driving license', 'licence no', 'dl no', 'transport department', 'form 7', 'valid till', 'authorization to drive', 'union of india', 'motor vehicle'],
  'Insurance': ['policy', 'policy no', 'sum insured', 'premium', 'term insurance', 'health insurance', 'star health', 'lic', 'hdfc ergo', 'claim', 'insured', 'nominee', 'validity', 'expiry date', 'policyholder'],
  'Medical': ['prescription', 'hospital', 'doctor', 'patient', 'diagnosis', 'blood report', 'lab test', 'clinic', 'rx', 'medical officer', 'dosage', 'pharmacy', 'health record'],
  'Resume': ['curriculum vitae', 'resume', 'experience', 'education', 'skills', 'projects', 'summary', 'work history', 'b.tech', 'b.e.', 'software engineer', 'career objective'],
  'Voter ID': ['election commission', 'voter id', 'epic no', 'elector photo identity', 'elector', 'voter identity card'],
  'Certificate': ['certificate', 'certified', 'birth certificate', 'marriage certificate', 'degree', 'course completion', 'provisional', 'transfer certificate', 'bonafide'],
  'Education': ['mark sheet', 'marksheet', 'board of education', 'university', 'school', 'grade card', 'transcript', 'roll no', 'examination', 'passing certificate'],
  'Property': ['property', 'deed', 'sale agreement', 'house tax', 'rent agreement', 'lease deed', 'land record', 'registry', 'khata', 'patta', 'stamp duty']
};

const MONTH_MAP: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09', sept: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12'
};

/**
 * Normalizes various date strings to standard YYYY-MM-DD format.
 * Supports:
 * - 31/12/2030, 31-12-2030, 31.12.2030 (DD/MM/YYYY)
 * - 2030-12-31, 2030/12/31 (YYYY-MM-DD)
 * - 31 DEC 2030, 31-OCT-2029, 31/OCT/2029
 * - OCT 31 2029, October 31, 2029
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // 1. Text Month formats: DD MMM YYYY or DD-MMM-YYYY or DD/MMM/YYYY (e.g. 15-OCT-2029)
  const textMonthMatch1 = clean.match(/^(\d{1,2})[/.\s-]([a-zA-Z]{3,9})[/.\s-](\d{4})$/);
  if (textMonthMatch1) {
    const [, d, mStr, y] = textMonthMatch1;
    const month = MONTH_MAP[mStr.toLowerCase()];
    if (month) {
      const day = d.padStart(2, '0');
      return `${y}-${month}-${day}`;
    }
  }

  // 2. Text Month formats: MMM DD, YYYY or MMM DD YYYY (e.g. October 15, 2029)
  const textMonthMatch2 = clean.match(/^([a-zA-Z]{3,9})[/.\s-](\d{1,2})[,\s]+(\d{4})$/);
  if (textMonthMatch2) {
    const [, mStr, d, y] = textMonthMatch2;
    const month = MONTH_MAP[mStr.toLowerCase()];
    if (month) {
      const day = d.padStart(2, '0');
      return `${y}-${month}-${day}`;
    }
  }

  // Clean numeric dates
  const numOnly = clean.replace(/[^0-9/-]/g, '').trim();

  // 3. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const match1 = numOnly.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (match1) {
    let [, d, m, y] = match1;
    let dayNum = parseInt(d, 10);
    let monthNum = parseInt(m, 10);
    
    // Swap if month > 12 (MM/DD/YYYY format handling)
    if (monthNum > 12 && dayNum <= 12) {
      [dayNum, monthNum] = [monthNum, dayNum];
    }
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      const dayStr = dayNum.toString().padStart(2, '0');
      const monthStr = monthNum.toString().padStart(2, '0');
      return `${y}-${monthStr}-${dayStr}`;
    }
  }

  // 4. YYYY/MM/DD or YYYY-MM-DD
  const match2 = numOnly.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/);
  if (match2) {
    const [, y, m, d] = match2;
    const monthStr = m.padStart(2, '0');
    const dayStr = d.padStart(2, '0');
    return `${y}-${monthStr}-${dayStr}`;
  }

  // 5. YYYY only (e.g. Year of Birth 1995)
  const match3 = numOnly.match(/^(\d{4})$/);
  if (match3) {
    return `${match3[1]}-01-01`;
  }

  return null;
}

/**
 * Searches raw OCR text for Expiry / Validity dates matching keywords like:
 * validity, valid till, valid upto, valid up to, valid through, expiry, expiry date,
 * expiration, expires, exp date, val till, val upto, upto, till, due date
 */
function extractExpiryDate(rawText: string): string | null {
  const expiryKeywords = [
    'validity period',
    'validity',
    'valid till',
    'valid upto',
    'valid up to',
    'valid through',
    'date of expiry',
    'expiry date',
    'expiration date',
    'expiration',
    'expires',
    'exp date',
    'exp\\.',
    'exp:',
    'val till',
    'val upto',
    'due date',
    'upto',
    'till'
  ];

  const dateRegex = '(\\d{1,2}[/.-](?:\\d{1,2}|[a-zA-Z]{3,9})[/.-]\\d{4}|\\d{4}[/.-]\\d{1,2}[/.-]\\d{1,2}|[a-zA-Z]{3,9}\\s+\\d{1,2},?\\s+\\d{4})';

  // Strategy A: Direct keyword match on same line or within 30 characters
  for (const kw of expiryKeywords) {
    const pattern = new RegExp(`(?:${kw})[:\\s]*${dateRegex}`, 'i');
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) return normalized;
    }
  }

  // Strategy B: Line-by-line scanning where keyword is on one line and date is on same/next line
  const lines = rawText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    const hasKw = expiryKeywords.some(kw => lineLower.includes(kw.replace('\\.', '.')));
    if (hasKw) {
      // Look for date in current line
      const currentLineDate = lines[i].match(new RegExp(dateRegex, 'i'));
      if (currentLineDate) {
        const normalized = normalizeDate(currentLineDate[0]);
        if (normalized) return normalized;
      }
      // Look for date in next line
      if (i + 1 < lines.length) {
        const nextLineDate = lines[i + 1].match(new RegExp(dateRegex, 'i'));
        if (nextLineDate) {
          const normalized = normalizeDate(nextLineDate[0]);
          if (normalized) return normalized;
        }
      }
    }
  }

  return null;
}

/**
 * Extract Name from OCR text based on field labels and heuristics
 */
function extractPersonName(rawText: string, category: DetectedCategory): string | null {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Explicit label matching: Name:, Full Name:, Holder Name:, Insured Name:, Customer Name:
  for (const line of lines) {
    const labelMatch = line.match(/(?:name|full name|holder name|insured name|patient name|customer name|name\s*\/\s*नाम)[:\s]+([A-Z][a-zA-Z\s]{2,40})/i);
    if (labelMatch && labelMatch[1]) {
      const candidate = labelMatch[1].trim();
      if (!candidate.toLowerCase().includes('government') && !candidate.toLowerCase().includes('department')) {
        return candidate;
      }
    }
  }

  // 2. Indian ID specific heuristics (Line above "Father's Name" or "S/O" / "D/O" / "W/O")
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("father's name") || l.includes("father name") || l.startsWith("s/o") || l.startsWith("d/o") || l.startsWith("w/o")) {
      if (i > 0) {
        const candidateAbove = lines[i - 1].replace(/[^a-zA-Z\s]/g, '').trim();
        if (candidateAbove.length > 3 && candidateAbove.split(' ').length >= 1) {
          return candidateAbove;
        }
      }
    }
  }

  // 3. Heuristic for capitalized multi-word lines that look like a person's name
  for (const line of lines) {
    const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
    if (/^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/.test(cleanLine)) {
      const lower = cleanLine.toLowerCase();
      if (!lower.includes('government') && 
          !lower.includes('department') && 
          !lower.includes('republic') &&
          !lower.includes('licence') &&
          !lower.includes('prescriptions') &&
          !lower.includes('insurance') &&
          !lower.includes('authority') &&
          !lower.includes('commission')) {
        return cleanLine;
      }
    }
  }

  return null;
}

/**
 * Maps fine-grained categories to standard app dropdown categories:
 * "ID" | "Certificate" | "Insurance" | "Medical" | "License" | "Resume" | "Passport" | "Education" | "Property" | "Other"
 */
function mapToAppCategory(category: DetectedCategory): string {
  switch (category) {
    case 'Aadhaar':
    case 'PAN':
    case 'Voter ID':
    case 'ID':
      return 'ID';
    case 'Driving Licence':
    case 'License':
      return 'License';
    case 'Passport':
      return 'Passport';
    case 'Insurance':
      return 'Insurance';
    case 'Medical':
      return 'Medical';
    case 'Resume':
      return 'Resume';
    case 'Education':
      return 'Education';
    case 'Property':
      return 'Property';
    case 'Certificate':
      return 'Certificate';
    default:
      return 'Other';
  }
}

/**
 * 100% Client-Side Text Parser and Classifier
 */
export function parseExtractedText(rawText: string, filename: string = ''): ExtractedDocData {
  const textLower = (rawText + ' ' + filename).toLowerCase();
  
  // 1. Category Detection using Keyword Scoring
  let bestCategory: DetectedCategory = 'General';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [DetectedCategory, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (textLower.includes(kw)) {
        score += (kw.length > 5 ? 2 : 1);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  let docNumber: string | null = null;
  let dob: string | null = null;
  let expiryDate: string | null = extractExpiryDate(rawText);
  let name: string | null = null;
  let confidence = Math.min(0.6 + maxScore * 0.1, 0.98);

  // --- AADHAAR DETECTION ---
  const aadhaarMatch = rawText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
  if (aadhaarMatch) {
    docNumber = aadhaarMatch[0].replace(/\s+/g, '-');
    if (bestCategory === 'General' || maxScore < 2) {
      bestCategory = 'Aadhaar';
      confidence = 0.95;
    }
  }

  // Aadhaar DOB / Year of Birth
  const dobMatch = rawText.match(/(?:dob|date of birth|yob|year of birth)[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4}|[0-9]{4})/i);
  if (dobMatch) {
    dob = normalizeDate(dobMatch[1]);
  }

  // --- PAN CARD DETECTION ---
  const panMatch = rawText.match(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/);
  if (panMatch) {
    docNumber = panMatch[0];
    if (bestCategory === 'General' || maxScore < 2) {
      bestCategory = 'PAN';
      confidence = 0.98;
    }
  }

  // --- PASSPORT DETECTION & MRZ ---
  const passportMatch = rawText.match(/\b[A-Z][0-9]{7}\b/);
  if (passportMatch && (textLower.includes('passport') || textLower.includes('republic') || textLower.includes('mrz') || textLower.includes('ind'))) {
    docNumber = passportMatch[0];
    bestCategory = 'Passport';
    confidence = 0.98;
  }

  // MRZ Code parsing for Passports
  const mrzLines = rawText.split('\n').filter(line => line.includes('P<IND') || line.match(/^[A-Z0-9<]{30,44}$/));
  if (mrzLines.length > 0) {
    bestCategory = 'Passport';
    confidence = 0.99;
    const line1 = mrzLines[0];
    if (line1.startsWith('P<IND')) {
      const nameParts = line1.substring(5).split('<<');
      if (nameParts.length >= 2) {
        const lastName = nameParts[0].replace(/</g, ' ').trim();
        const firstName = nameParts[1].replace(/</g, ' ').trim();
        name = `${firstName} ${lastName}`.trim();
      }
    }
  }

  // --- DRIVING LICENCE DETECTION ---
  const dlMatch = rawText.match(/\b([A-Z]{2}[- /]?\d{2}[- /]?\d{4,11})\b/i);
  if (dlMatch && (textLower.includes('licence') || textLower.includes('license') || textLower.includes('dl') || textLower.includes('transport'))) {
    docNumber = dlMatch[1].toUpperCase();
    bestCategory = 'Driving Licence';
    confidence = 0.95;
  }

  // --- VOTER ID DETECTION ---
  const voterMatch = rawText.match(/\b[A-Z]{3}[0-9]{7}\b/);
  if (voterMatch) {
    docNumber = voterMatch[0];
    bestCategory = 'Voter ID';
    confidence = 0.95;
  }

  // --- INSURANCE POLICY NUMBER ---
  if (bestCategory === 'Insurance' && !docNumber) {
    const policyMatch = rawText.match(/(?:policy\s*(?:no|num|number)?[:\s]*)([A-Z0-9/-]{6,20})/i);
    if (policyMatch) {
      docNumber = policyMatch[1];
    }
  }

  // --- PERSON NAME EXTRACTION ---
  if (!name) {
    name = extractPersonName(rawText, bestCategory);
  }

  // --- DOCUMENT TITLE FORMATTING ---
  const personNamePart = name ? `${name} - ` : '';
  let docTitle = '';
  
  if (bestCategory === 'Aadhaar') docTitle = `${personNamePart}Aadhaar Card`;
  else if (bestCategory === 'PAN') docTitle = `${personNamePart}PAN Card`;
  else if (bestCategory === 'Passport') docTitle = `${personNamePart}Passport`;
  else if (bestCategory === 'Driving Licence') docTitle = `${personNamePart}Driving Licence`;
  else if (bestCategory === 'Insurance') docTitle = `${personNamePart}Insurance Policy`;
  else if (bestCategory === 'Medical') docTitle = `${personNamePart}Medical Record`;
  else if (bestCategory === 'Resume') docTitle = `${personNamePart}Resume`;
  else if (bestCategory === 'Voter ID') docTitle = `${personNamePart}Voter ID`;
  else if (bestCategory === 'Certificate') docTitle = `${personNamePart}Certificate`;
  else if (bestCategory === 'Education') docTitle = `${personNamePart}Education Marksheet`;
  else if (bestCategory === 'Property') docTitle = `${personNamePart}Property Document`;
  else docTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Uploaded Document';

  const appCat = mapToAppCategory(bestCategory);

  return {
    category: bestCategory,
    appCategory: appCat,
    confidence,
    name: docTitle,
    documentNumber: docNumber,
    dob,
    expiryDate,
    rawText
  };
}

/**
 * Perform 100% Local OCR on an image file/blob or URL using Tesseract.js
 */
export async function performLocalOCR(
  imageSource: string | File | Blob,
  filename: string = '',
  onProgress?: (progress: number) => void
): Promise<ExtractedDocData> {
  try {
    const worker = await createWorker('eng');
    
    if (onProgress) {
      onProgress(0.4);
    }
    
    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    
    if (onProgress) {
      onProgress(1.0);
    }

    const rawText = ret.data.text || '';
    return parseExtractedText(rawText, filename);
  } catch (error) {
    console.warn('Tesseract OCR fallback to filename parsing:', error);
    return parseExtractedText('', filename);
  }
}
