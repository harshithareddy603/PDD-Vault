import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker URL for web & mobile browsers
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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
  'Resume': ['curriculum vitae', 'resume', 'experience', 'education', 'skills', 'projects', 'summary', 'work history', 'b.tech', 'b.e.', 'software engineer', 'career objective', 'professional summary'],
  'Voter ID': ['election commission', 'voter id', 'epic no', 'elector photo identity', 'elector', 'voter identity card'],
  'Certificate': ['certificate', 'certified', 'birth certificate', 'marriage certificate', 'degree', 'course completion', 'provisional', 'transfer certificate', 'bonafide'],
  'Education': ['mark sheet', 'marksheet', 'board of education', 'university', 'school', 'grade card', 'transcript', 'roll no', 'examination', 'passing certificate', 'cgpa'],
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

const LAST_DAY_OF_MONTH: Record<string, string> = {
  '01': '31', '02': '28', '03': '31', '04': '30',
  '05': '31', '06': '30', '07': '31', '08': '31',
  '09': '30', '10': '31', '11': '30', '12': '31'
};

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normalizes various date strings to standard YYYY-MM-DD format.
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // 1. Text Month formats with Year: MMM YYYY or Month YYYY (e.g. May 2027)
  const monthYearMatch = clean.match(/^([a-zA-Z]{3,9})[\s,/-]+(\d{4})$/);
  if (monthYearMatch) {
    const [, mStr, y] = monthYearMatch;
    const month = MONTH_MAP[mStr.toLowerCase()];
    if (month) {
      const lastDay = LAST_DAY_OF_MONTH[month] || '28';
      return `${y}-${month}-${lastDay}`;
    }
  }

  // 2. Text Month formats: DD MMM YYYY or DD-MMM-YYYY or DD/MMM/YYYY (e.g. 15-OCT-2029)
  const textMonthMatch1 = clean.match(/^(\d{1,2})[/.\s-]([a-zA-Z]{3,9})[/.\s-](\d{4})$/);
  if (textMonthMatch1) {
    const [, d, mStr, y] = textMonthMatch1;
    const month = MONTH_MAP[mStr.toLowerCase()];
    if (month) {
      const day = d.padStart(2, '0');
      return `${y}-${month}-${day}`;
    }
  }

  // 3. Text Month formats: MMM DD, YYYY or MMM DD YYYY (e.g. October 15, 2029)
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

  // 4. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
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

  // 5. YYYY/MM/DD or YYYY-MM-DD
  const match2 = numOnly.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/);
  if (match2) {
    const [, y, m, d] = match2;
    const monthStr = m.padStart(2, '0');
    const dayStr = d.padStart(2, '0');
    return `${y}-${monthStr}-${dayStr}`;
  }

  // 6. YYYY only (e.g. Year of Birth 1995 or 2027)
  const match3 = numOnly.match(/^(\d{4})$/);
  if (match3) {
    return `${match3[1]}-12-31`;
  }

  return null;
}

/**
 * Searches raw OCR text for Expiry / Validity / End dates.
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

  const dateRegex = '(\\d{1,2}[/.-](?:\\d{1,2}|[a-zA-Z]{3,9})[/.-]\\d{4}|\\d{4}[/.-]\\d{1,2}[/.-]\\d{1,2}|[a-zA-Z]{3,9}\\s+\\d{1,2},?\\s+\\d{4}|[a-zA-Z]{3,9}\\s+\\d{4})';

  // Strategy A: Direct keyword match on same line
  for (const kw of expiryKeywords) {
    const pattern = new RegExp(`(?:${kw})[:\\s]*${dateRegex}`, 'i');
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) return normalized;
    }
  }

  // Strategy B: Line-by-line scanning where keyword is on one line and date is on current/next line
  const lines = rawText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    const hasKw = expiryKeywords.some(kw => lineLower.includes(kw.replace('\\.', '.')));
    if (hasKw) {
      const currentLineDate = lines[i].match(new RegExp(dateRegex, 'i'));
      if (currentLineDate) {
        const normalized = normalizeDate(currentLineDate[0]);
        if (normalized) return normalized;
      }
      if (i + 1 < lines.length) {
        const nextLineDate = lines[i + 1].match(new RegExp(dateRegex, 'i'));
        if (nextLineDate) {
          const normalized = normalizeDate(nextLineDate[0]);
          if (normalized) return normalized;
        }
      }
    }
  }

  // Strategy C: End date of date ranges (e.g., "Aug 2023 - May 2027", "Jul 2025 - Dec 2025", "2021 - 2025")
  const rangeRegex = /(?:[a-zA-Z]{3,9}\s+\d{4}|\d{4})\s*[-–—to]+\s*([a-zA-Z]{3,9}\s+\d{4}|\d{4})/gi;
  const rangeMatches = [...rawText.matchAll(rangeRegex)];
  let latestDate: string | null = null;
  let maxYear = 0;

  for (const match of rangeMatches) {
    if (match[1]) {
      const endDateStr = match[1].trim();
      const normalized = normalizeDate(endDateStr);
      if (normalized) {
        const yearStr = normalized.split('-')[0];
        const yearNum = parseInt(yearStr, 10);
        if (yearNum > maxYear && yearNum < 2100) {
          maxYear = yearNum;
          latestDate = normalized;
        }
      }
    }
  }

  if (latestDate) return latestDate;

  return null;
}

/**
 * Extracts document ID or contact identifier (Phone, Registration No, Policy No, PAN, Aadhaar, etc.)
 */
function extractDocumentIDNumber(rawText: string, category: DetectedCategory): string | null {
  // 1. Aadhaar
  const aadhaarMatch = rawText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
  if (aadhaarMatch) return aadhaarMatch[0].replace(/\s+/g, '-');

  // 2. PAN Card
  const panMatch = rawText.match(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/);
  if (panMatch) return panMatch[0];

  // 3. Passport
  const passportMatch = rawText.match(/\b[A-Z][0-9]{7}\b/);
  if (passportMatch && (rawText.toLowerCase().includes('passport') || rawText.toLowerCase().includes('ind'))) {
    return passportMatch[0];
  }

  // 4. Driving Licence
  const dlMatch = rawText.match(/\b([A-Z]{2}[- /]?\d{2}[- /]?\d{4,11})\b/i);
  if (dlMatch && (rawText.toLowerCase().includes('licence') || rawText.toLowerCase().includes('license') || rawText.toLowerCase().includes('dl'))) {
    return dlMatch[1].toUpperCase();
  }

  // 5. Voter ID
  const voterMatch = rawText.match(/\b[A-Z]{3}[0-9]{7}\b/);
  if (voterMatch) return voterMatch[0];

  // 6. Explicit ID / Registration / Policy / Roll / Certificate / Employee Number labels
  const labelMatch = rawText.match(/(?:reg|registration|cert|certificate|roll|id|emp|employee|student|ref|reference|policy|account|invoice)\s*(?:no|num|number)?[\s.:#-]*([A-Z0-9/-]{4,25})/i);
  if (labelMatch && labelMatch[1]) {
    return labelMatch[1].trim();
  }

  // 7. Phone / Contact Number (for Resumes, CVs, and general documents)
  const phoneMatch = rawText.match(/(?:\+91[\s-]?)?([6-9]\d{9})\b/);
  if (phoneMatch) {
    return phoneMatch[0].trim();
  }

  return null;
}

/**
 * Extract Person Name from OCR text (handles Title Case and ALL CAPS names at the top)
 */
function extractPersonName(rawText: string, category: DetectedCategory): string | null {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Explicit label matching: Name:, Full Name:, Holder Name:, Insured Name:
  for (const line of lines) {
    const labelMatch = line.match(/(?:name|full name|holder name|insured name|patient name|customer name|name\s*\/\s*नाम)[:\s]+([A-Za-z\s]{3,50})/i);
    if (labelMatch && labelMatch[1]) {
      const candidate = labelMatch[1].trim();
      const lower = candidate.toLowerCase();
      if (!lower.includes('government') && !lower.includes('department') && !lower.includes('summary')) {
        return toTitleCase(candidate);
      }
    }
  }

  // 2. Check top 5 lines for a person's name (ALL CAPS or Title Case)
  const topLines = lines.slice(0, 5);
  for (const line of topLines) {
    const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
    const wordCount = cleanLine.split(/\s+/).length;
    
    if (cleanLine.length >= 4 && cleanLine.length <= 60 && wordCount >= 2 && wordCount <= 5) {
      const lower = cleanLine.toLowerCase();
      const invalidWords = [
        'curriculum', 'vitae', 'resume', 'government', 'department', 'republic',
        'licence', 'prescription', 'insurance', 'authority', 'commission', 'professional',
        'summary', 'experience', 'education', 'technical', 'skills', 'certificate', 'hospital'
      ];

      const isInvalid = invalidWords.some(w => lower.includes(w));
      if (!isInvalid) {
        return toTitleCase(cleanLine);
      }
    }
  }

  // 3. Indian ID specific heuristics (Line above "Father's Name" or "S/O" / "D/O" / "W/O")
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("father's name") || l.includes("father name") || l.startsWith("s/o") || l.startsWith("d/o") || l.startsWith("w/o")) {
      if (i > 0) {
        const candidateAbove = lines[i - 1].replace(/[^a-zA-Z\s]/g, '').trim();
        if (candidateAbove.length > 3 && candidateAbove.split(' ').length >= 1) {
          return toTitleCase(candidateAbove);
        }
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
 * Extract text directly from a PDF file using PDF.js or render page 1 canvas if scanned.
 */
async function extractTextOrCanvasFromPDF(pdfSource: string | File | Blob): Promise<{ text: string; imageCanvasUrl: string | null }> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (pdfSource instanceof File || pdfSource instanceof Blob) {
      arrayBuffer = await pdfSource.arrayBuffer();
    } else if (typeof pdfSource === 'string' && pdfSource.startsWith('data:')) {
      const base64Str = pdfSource.split(',')[1] || pdfSource;
      const binaryStr = atob(base64Str);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      const res = await fetch(pdfSource as string);
      arrayBuffer = await res.arrayBuffer();
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    const numPages = Math.min(pdf.numPages, 3); // Read up to first 3 pages
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    let canvasImageUrl: string | null = null;
    // If text is minimal (e.g. scanned image PDF), render page 1 to canvas for Tesseract OCR
    if (fullText.trim().length < 30) {
      const page1 = await pdf.getPage(1);
      const viewport = page1.getViewport({ scale: 1.5 });
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page1.render({ canvasContext: context, viewport }).promise;
          canvasImageUrl = canvas.toDataURL('image/png');
        }
      }
    }

    return { text: fullText, imageCanvasUrl: canvasImageUrl };
  } catch (err) {
    console.warn("PDF extraction error:", err);
    return { text: '', imageCanvasUrl: null };
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

  const docNumber: string | null = extractDocumentIDNumber(rawText, bestCategory);
  
  // DOB extraction
  let dob: string | null = null;
  const dobMatch = rawText.match(/(?:dob|date of birth|yob|year of birth)[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4}|[0-9]{4})/i);
  if (dobMatch) {
    dob = normalizeDate(dobMatch[1]);
  }

  const expiryDate: string | null = extractExpiryDate(rawText);
  const personName: string | null = extractPersonName(rawText, bestCategory);
  const confidence = Math.min(0.6 + maxScore * 0.1, 0.98);

  // --- DOCUMENT TITLE FORMATTING ---
  const personNamePart = personName ? `${personName} - ` : '';
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
  else if (personName) docTitle = `${personName} - Document`;
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
 * Perform 100% Universal Parsing on ANY file type accepted by upload logic:
 * - Images (.jpg, .jpeg, .png, .webp, .bmp, .gif, .tiff, .heic)
 * - PDFs (.pdf - digital & scanned)
 * - Text/Data files (.txt, .csv, .md, .json, .rtf, .html, .xml, .log)
 * - Word documents (.doc, .docx)
 * - Any other file format (safe fallback)
 */
export async function performLocalOCR(
  imageSource: string | File | Blob,
  filename: string = '',
  onProgress?: (progress: number) => void
): Promise<ExtractedDocData> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. Text & Code Documents (.txt, .csv, .md, .json, .rtf, .html, .log, .xml, .tsv)
  const isTextFile = ['txt', 'csv', 'md', 'json', 'rtf', 'html', 'log', 'xml', 'tsv'].includes(ext);
  if (isTextFile) {
    try {
      if (onProgress) onProgress(0.5);
      let text = '';
      if (imageSource instanceof File || imageSource instanceof Blob) {
        text = await imageSource.text();
      } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
        const base64Str = imageSource.split(',')[1] || imageSource;
        text = atob(base64Str);
      } else if (typeof imageSource === 'string') {
        const res = await fetch(imageSource);
        text = await res.text();
      }
      if (onProgress) onProgress(1.0);
      if (text && text.trim().length > 0) {
        return parseExtractedText(text, filename);
      }
    } catch (err) {
      console.warn("Text file reading fallback:", err);
    }
  }

  // 2. Word Documents (.doc, .docx)
  const isWordDoc = ['doc', 'docx'].includes(ext);
  if (isWordDoc) {
    try {
      if (onProgress) onProgress(0.5);
      let text = '';
      if (imageSource instanceof File || imageSource instanceof Blob) {
        text = await imageSource.text();
      } else if (typeof imageSource === 'string') {
        const res = await fetch(imageSource);
        text = await res.text();
      }
      // Strip XML/HTML tags and extract clean text strings
      const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      if (onProgress) onProgress(1.0);
      if (cleanText.trim().length > 10) {
        return parseExtractedText(cleanText, filename);
      }
    } catch (err) {
      console.warn("Word doc reading fallback:", err);
    }
  }

  // 3. PDF Documents (.pdf)
  const isPdf = 
    ext === 'pdf' ||
    (imageSource instanceof File && imageSource.type === 'application/pdf') ||
    (imageSource instanceof Blob && imageSource.type === 'application/pdf') ||
    (typeof imageSource === 'string' && (imageSource.includes('application/pdf') || imageSource.toLowerCase().endsWith('.pdf')));

  if (isPdf) {
    if (onProgress) onProgress(0.3);
    const { text, imageCanvasUrl } = await extractTextOrCanvasFromPDF(imageSource);
    if (onProgress) onProgress(0.8);

    if (text && text.trim().length >= 30) {
      if (onProgress) onProgress(1.0);
      return parseExtractedText(text, filename);
    } else if (imageCanvasUrl) {
      imageSource = imageCanvasUrl;
    }
  }

  // 4. Image Files (.jpg, .jpeg, .png, .webp, .bmp, .gif, .tiff, camera images)
  try {
    const worker = await createWorker('eng');
    if (onProgress) onProgress(0.5);
    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    if (onProgress) onProgress(1.0);

    const rawText = ret.data.text || '';
    return parseExtractedText(rawText, filename);
  } catch (error) {
    console.warn('OCR error fallback to filename parsing:', error);
    return parseExtractedText('', filename);
  }
}
