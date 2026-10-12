/**
 * GDF client form -> Google Sheet
 *
 * Setup:
 * 1. Paste this into Extensions > Apps Script of the target Google Sheet.
 * 2. Project Settings (gear icon) > Script Properties > Add property:
 *      SHARED_SECRET = <same value as GOOGLE_SCRIPT_SECRET in Vercel>
 * 3. Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).
 *    Put the web app URL in GOOGLE_SCRIPT_URL in Vercel.
 */

// Tab the rows are written to (created automatically if missing).
const SHEET_NAME = 'Leads';

const HEADERS = ['Timestamp', 'Full Name', 'Email', 'Company', 'Phone'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);

    // Kept in Script Properties so the secret never lives in code.
    const secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret) {
      return json({ ok: false, error: 'SHARED_SECRET script property is not set' });
    }
    if (data.secret !== secret) {
      return json({ ok: false, error: 'Unauthorized' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      safe(data.fullName),
      safe(data.email),
      safe(data.company),
      safe(data.phone),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Keep values as plain text: stops formula injection and keeps "+966..." from being parsed as a number.
function safe(value) {
  const s = String(value == null ? '' : value).slice(0, 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
