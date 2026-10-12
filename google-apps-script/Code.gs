/**
 * GDF client details form → this Google Sheet.
 * Setup steps: README.md → "Connect the Google Sheet" in the gdf-form repository.
 */
const SHEET_NAME = 'Leads';
const HEADERS = ['Submitted at', 'Full name', 'Email', 'Company', 'Phone'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Bots fill the hidden "website" field; accept quietly and store nothing.
  if (p.website) return json_({ ok: true });

  const row = {
    fullName: clean_(p.fullName, 120),
    email: clean_(p.email, 160).toLowerCase(),
    company: clean_(p.company, 160),
    phone: clean_(p.phone, 30),
  };
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email);
  const phoneDigits = row.phone.replace(/\D/g, '').length;
  if (!row.fullName || !row.company || !validEmail || phoneDigits < 7 || phoneDigits > 15) {
    return json_({ ok: false, error: 'invalid' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(), row.fullName, row.email, row.company, row.phone]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet() {
  return ContentService.createTextOutput('GDF client form endpoint is running.');
}

function sheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Trims, limits length and stops text being read as a spreadsheet formula
// (this also keeps "+966..." phone numbers as text).
function clean_(value, max) {
  const text = String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
