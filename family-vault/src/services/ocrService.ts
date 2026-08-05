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
  | 'General';

export type ExtractedDocData = {
  category: DetectedCategory;
  confidence: number;
  name: string | null;
  documentNumber: string | null;
  dob: string | null;
  expiryDate: string | null;
  rawText: string;
};

// Keyword scoring definitions for smart auto-categorization
const CATEGORY_KEYWORDS: Record<DetectedCategory, string[]> = {
  'Aadhaar': ['aadhaar', 'uidai', 'unique identification', 'government of india', 'govt of india', 'mera aadhaar', 'pehchan'],
  'PAN': ['income tax department', 'permanent account number', 'pan card', 'govt of india', 'father name'],
  'Passport': ['republic of india', 'passport', 'passport no', 'type p', 'mrz', 'country code ind', 'nationality indian'],
  'Driving Licence': ['driving licence', 'driving license', 'licence no', 'dl no', 'transport department', 'form 7', 'valid till', 'authorization to drive'],
  'Insurance': ['policy', 'policy no', 'sum insured', 'premium', 'term insurance', 'health insurance', 'star health', 'lic', 'hdfc ergo', 'claim', 'insured', 'nominee'],
  'Medical': ['prescription', 'hospital', 'doctor', 'patient', 'diagnosis', 'blood report', 'lab test', 'clinic', 'rx', 'medical officer', 'dosage', 'pharmacy'],
  'Resume': ['curriculum vitae', 'resume', 'experience', 'education', 'skills', 'projects', 'summary', 'work history', 'b.tech', 'b.e.', 'software engineer'],
  'Voter ID': ['election commission', 'voter id', 'epic no', 'elector photo identity', 'elector'],
  'General': []
};

// Date normalization helper (converts DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD to YYYY-MM-DD)
function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.replace(/[^0-9/-]/g, '').trim();
  
  // DD/MM/YYYY or DD-MM-YYYY
  const match1 = clean.match(/^(\d{2})[/.-](\d{2})[/.-](\d{4})$/);
  if (match1) {
    const [, d, m, y] = match1;
    return `${y}-${m}-${d}`;
  }
  
  // YYYY/MM/DD or YYYY-MM-DD
  const match2 = clean.match(/^(\d{4})[/.-](\d{2})[/.-](\d{2})$/);
  if (match2) {
    const [, y, m, d] = match2;
    return `${y}-${m}-${d}`;
  }

  // YYYY only (e.g. Year of Birth 1995)
  const match3 = clean.match(/^(\d{4})$/);
  if (match3) {
    return `${match3[1]}-01-01`;
  }

  return null;
}

/**
 * 100% Client-Side Text Parser and Classifier
 */
export function parseExtractedText(rawText: string, filename: string = ''): ExtractedDocData {
  const textLower = (rawText + ' ' + filename).toLowerCase();
  
  // 1. Smart Category Detection based on Keyword Weights
  let bestCategory: DetectedCategory = 'General';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [DetectedCategory, string[]][]) {
    if (keywords.length === 0) continue;
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

  // 2. Specific Document Number & Date Extractions based on Patterns
  let docNumber: string | null = null;
  let dob: string | null = null;
  let expiryDate: string | null = null;
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

  // --- PASSPORT DETECTION ---
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

  // --- EXPIRY DATE EXTRACTION (Passport, Driving Licence, Insurance) ---
  const expiryMatch = rawText.match(/(?:expiry|valid till|valid upto|expiration|expires)[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4})/i);
  if (expiryMatch) {
    expiryDate = normalizeDate(expiryMatch[1]);
  }

  // --- INSURANCE POLICY NUMBER ---
  if (bestCategory === 'Insurance' && !docNumber) {
    const policyMatch = rawText.match(/(?:policy\s*(?:no|num|number)?[:\s]*)([A-Z0-9/-]{6,20})/i);
    if (policyMatch) {
      docNumber = policyMatch[1];
    }
  }

  // --- NAME EXTRACTION (Fallback heuristics) ---
  if (!name) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    for (const line of lines) {
      // Look for lines that look like a person's name (2-3 capitalized words, no numbers/keywords)
      if (/^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/.test(line) &&
          !textLower.includes('government') && 
          !textLower.includes('department') && 
          !textLower.includes('republic') &&
          !textLower.includes('licence') &&
          !textLower.includes('prescriptions')) {
        name = line;
        break;
      }
    }
  }

  // Default title/name formatting based on category if name not found
  if (!name) {
    if (bestCategory === 'Aadhaar') name = 'Aadhaar Card';
    else if (bestCategory === 'PAN') name = 'PAN Card';
    else if (bestCategory === 'Passport') name = 'Passport';
    else if (bestCategory === 'Driving Licence') name = 'Driving Licence';
    else if (bestCategory === 'Insurance') name = 'Insurance Policy';
    else if (bestCategory === 'Medical') name = 'Medical Record';
    else if (bestCategory === 'Resume') name = 'Resume / CV';
    else if (bestCategory === 'Voter ID') name = 'Voter ID';
    else name = filename.replace(/\.[^/.]+$/, '') || 'Uploaded Document';
  }

  return {
    category: bestCategory,
    confidence,
    name,
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
    // If OCR fails (e.g. unsupported image format or PDF), perform basic filename-based parsing
    return parseExtractedText('', filename);
  }
}
