import * as path from 'path';
import * as fs from 'fs';
import PDFDocument from 'pdfkit';

export type PdfLang = 'en' | 'mr';

const FONT_PATH = path.join(
  process.cwd(),
  'assets/fonts/NotoSansDevanagari-Regular.ttf',
);

export function normalizePdfLang(lang?: string): PdfLang {
  return lang?.toLowerCase().startsWith('mr') ? 'mr' : 'en';
}

export function createPdfDoc(lang: PdfLang) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  if (fs.existsSync(FONT_PATH)) {
    doc.registerFont('AppFont', FONT_PATH);
    doc.font('AppFont');
  } else {
    doc.font('Helvetica');
  }
  // Keep locale for date formatting
  void lang;
  return doc;
}

export function pdfFont(doc: PDFKit.PDFDocument, bold = false) {
  if (fs.existsSync(FONT_PATH)) {
    doc.font('AppFont');
  } else {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
  }
  return doc;
}

const demand = {
  en: {
    title: 'DEMAND LETTER',
    date: 'Date',
    customer: 'Customer',
    phone: 'Phone',
    unit: 'Unit',
    milestone: 'Milestone',
    dueDate: 'Due Date',
    status: 'Status',
    installmentAmount: 'Installment amount',
    alreadyPaid: 'Already paid',
    balanceDue: 'Balance due',
    body: 'Kindly clear the outstanding balance on or before the due date to avoid further follow-ups.',
    signatory: 'Authorized Signatory',
  },
  mr: {
    title: 'मागणी पत्र',
    date: 'दिनांक',
    customer: 'ग्राहक',
    phone: 'फोन',
    unit: 'युनिट',
    milestone: 'टप्पा',
    dueDate: 'देय दिनांक',
    status: 'स्थिती',
    installmentAmount: 'हप्त्याची रक्कम',
    alreadyPaid: 'आधी भरलेले',
    balanceDue: 'देय शिल्लक',
    body: 'कृपया देय दिनांकापूर्वी थकीत रक्कम भरा, जेणेकरून पुढील स्मरणपत्रे टाळता येतील.',
    signatory: 'अधिकृत सही',
  },
} as const;

const agreement = {
  en: {
    title: 'ALLOTMENT / BOOKING AGREEMENT',
    project: 'Project',
    agreementDate: 'Agreement date',
    bookingDate: 'Booking date',
    bookingRef: 'Booking ref',
    status: 'Status',
    allottee: '1. Allottee (Purchaser)',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    pan: 'PAN',
    aadhaar: 'Aadhaar',
    unitSection: '2. Unit allotted',
    unitNo: 'Unit no.',
    type: 'Type',
    wing: 'Wing / block',
    floor: 'Floor',
    config: 'Configuration',
    area: 'Area',
    facing: 'Facing',
    broker: 'Channel partner / broker',
    consideration: '3. Consideration',
    builtUp: 'Built-up',
    gst: 'GST',
    maintenance: 'Maintenance fee',
    advocate: 'Advocate fee',
    mecb: 'MECB fee',
    oneTime: 'One-time maintenance',
    govtCharges: 'Govt charges (stamp + registration)',
    totalValue: 'Total agreement value',
    bookingAmount: 'Booking amount',
    tokenAmount: 'Token amount',
    paymentSplit: 'Payment split — Cash',
    bank: 'Bank',
    loan: 'Loan',
    schedule: '4. Payment schedule',
    noSchedule: 'No installment schedule on record.',
    due: 'Due',
    paid: 'paid',
    bal: 'bal',
    received: 'Amount received to date',
    balance: 'Balance',
    bankDetails: '5. Company bank details for remittance',
    accountName: 'Account name',
    bankName: 'Bank',
    accountNo: 'A/c no.',
    ifsc: 'IFSC',
    termsTitle: 'Terms (summary)',
    terms: [
      'This allotment / booking agreement confirms provisional allotment of the unit subject to timely payment of the schedule above and execution of the sale deed / conveyance as applicable.',
      'Allottee shall pay stamp duty, registration, and statutory charges as applicable. Possession is subject to clear dues and project handover timelines.',
      'Cancellation, if permitted, may attract deduction as per company policy. This document is computer-generated for operational use and does not replace a registered instrument.',
    ],
    allotteeSign: 'Allottee signature',
    authSign: 'Authorized signatory',
  },
  mr: {
    title: 'वाटप / बुकिंग करार',
    project: 'प्रकल्प',
    agreementDate: 'करार दिनांक',
    bookingDate: 'बुकिंग दिनांक',
    bookingRef: 'बुकिंग संदर्भ',
    status: 'स्थिती',
    allottee: '१. वाटपधारक (खरेदीदार)',
    name: 'नाव',
    phone: 'फोन',
    email: 'ईमेल',
    address: 'पत्ता',
    pan: 'पॅन',
    aadhaar: 'आधार',
    unitSection: '२. वाटप युनिट',
    unitNo: 'युनिट क्र.',
    type: 'प्रकार',
    wing: 'विंग / ब्लॉक',
    floor: 'मजला',
    config: 'रचना',
    area: 'क्षेत्रफळ',
    facing: 'दिशा',
    broker: 'चॅनेल पार्टनर / दलाल',
    consideration: '३. मोबदला',
    builtUp: 'बिल्ट-अप',
    gst: 'जीएसटी',
    maintenance: 'देखभाल शुल्क',
    advocate: 'वकील शुल्क',
    mecb: 'एमईसीबी शुल्क',
    oneTime: 'एकदाची देखभाल',
    govtCharges: 'शासकीय शुल्क (मुद्रांक + नोंदणी)',
    totalValue: 'एकूण करार मूल्य',
    bookingAmount: 'बुकिंग रक्कम',
    tokenAmount: 'टोकन रक्कम',
    paymentSplit: 'पेमेंट विभाजन — रोख',
    bank: 'बँक',
    loan: 'कर्ज',
    schedule: '४. पेमेंट वेळापत्रक',
    noSchedule: 'नोंदीत हप्ता वेळापत्रक नाही.',
    due: 'देय',
    paid: 'भरले',
    bal: 'शिल्लक',
    received: 'आजपर्यंत प्राप्त रक्कम',
    balance: 'शिल्लक',
    bankDetails: '५. कंपनी बँक तपशील (पेमेंटसाठी)',
    accountName: 'खात्याचे नाव',
    bankName: 'बँक',
    accountNo: 'खाते क्र.',
    ifsc: 'IFSC',
    termsTitle: 'अटी (सारांश)',
    terms: [
      'हा वाटप / बुकिंग करार वरील वेळापत्रकानुसार वेळेवर पेमेंट व लागू असेल तेव्हा विक्री करार / कन्व्हेयन्सच्या अधीन युनिटचे तात्पुरते वाटप पुष्टी करतो.',
      'वाटपधारकाने लागू मुद्रांक, नोंदणी व इतर शासकीय शुल्क भरावेत. ताबा थकीत रक्कम मोकळी असल्यास व प्रकल्प हस्तांतरण वेळापत्रकानुसार असेल.',
      'रद्दीकरण परवानगी असल्यास कंपनी धोरणानुसार कपात लागू होऊ शकते. हा संगणकीय दस्तऐवज कार्यालयीन वापरासाठी आहे; नोंदणीकृत दस्तऐवजाची जागा घेत नाही.',
    ],
    allotteeSign: 'वाटपधारक सही',
    authSign: 'अधिकृत सही',
  },
} as const;

export function demandCopy(lang: PdfLang) {
  return demand[lang];
}

export function agreementCopy(lang: PdfLang) {
  return agreement[lang];
}

export function localeFor(lang: PdfLang) {
  return lang === 'mr' ? 'mr-IN' : 'en-IN';
}
