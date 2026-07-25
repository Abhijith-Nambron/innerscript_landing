/**
 * InnerScript interest capture — Google Apps Script
 *
 * IMPORTANT: Saving this file is not enough. You must deploy a NEW web-app version
 * or the landing page keeps using the old always-append script.
 *
 * Deploy as a Web App:
 *   1. Open the signup Google Sheet → Extensions → Apps Script
 *   2. Replace ALL code with this file
 *   3. Click Deploy → Manage deployments
 *   4. Pencil (Edit) on the existing deployment
 *   5. Version → New version
 *   6. Execute as: Me
 *   7. Who has access: Anyone
 *   8. Deploy
 *   9. Keep the same Web App URL (already in src/main.js)
 *
 * Verify after deploy:
 *   Submit the same email+source twice. Second response must be:
 *   {"status":"already_exists"}
 *   (not plain OK)
 *
 * Expected sheet columns (row 1 headers, order flexible if headers match names):
 *   email | source | timestamp | userAgent
 *
 * Response body (JSON text):
 *   {"status":"ok"}
 *   {"status":"already_exists"}
 */

var SHEET_NAME = ''; // leave blank to use the active/first sheet
var FALLBACK_EMAIL_COLUMN = 1; // 1-indexed, used only if headers are missing
var FALLBACK_SOURCE_COLUMN = 2;

function doPost(e) {
  try {
    var params = readParams_(e);
    var email = String(params.email || '').trim().toLowerCase();
    var source = String(params.source || '').trim();
    var timestamp = String(params.timestamp || new Date().toISOString());
    var userAgent = String(params.userAgent || '');

    if (!email || !source) {
      return jsonResponse({ status: 'error', message: 'email and source are required' });
    }

    var sheet = getSignupSheet_();
    var columns = resolveColumns_(sheet);

    if (emailSourceExists_(sheet, email, source, columns.email, columns.source)) {
      return jsonResponse({ status: 'already_exists' });
    }

    // Always append in the canonical order used by the landing page.
    sheet.appendRow([email, source, timestamp, userAgent]);
    return jsonResponse({ status: 'ok' });
  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error && error.message ? error.message : String(error)
    });
  }
}

function readParams_(e) {
  var params = (e && e.parameter) || {};
  if (params.email || params.source) return params;

  // Fallback if the request body was sent as JSON.
  if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (ignore) {}
  }

  return params;
}

function getSignupSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (SHEET_NAME) {
    var named = spreadsheet.getSheetByName(SHEET_NAME);
    if (!named) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    return named;
  }
  return spreadsheet.getSheets()[0];
}

function resolveColumns_(sheet) {
  var lastColumn = Math.max(sheet.getLastColumn(), 4);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var emailCol = FALLBACK_EMAIL_COLUMN;
  var sourceCol = FALLBACK_SOURCE_COLUMN;

  for (var i = 0; i < headers.length; i++) {
    var header = String(headers[i] || '').trim().toLowerCase();
    if (header === 'email') emailCol = i + 1;
    if (header === 'source') sourceCol = i + 1;
  }

  return { email: emailCol, source: sourceCol };
}

function emailSourceExists_(sheet, email, source, emailColumn, sourceColumn) {
  var lastRow = sheet.getLastRow();
  // Row 1 is headers; data starts at row 2.
  if (lastRow < 2) return false;

  var width = Math.max(emailColumn, sourceColumn);
  var values = sheet.getRange(2, 1, lastRow, width).getValues();

  for (var i = 0; i < values.length; i++) {
    var rowEmail = String(values[i][emailColumn - 1] || '').trim().toLowerCase();
    var rowSource = String(values[i][sourceColumn - 1] || '').trim();
    if (rowEmail === email && rowSource === source) {
      return true;
    }
  }

  return false;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
