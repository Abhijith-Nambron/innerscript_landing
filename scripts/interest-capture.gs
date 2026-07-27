/**
 * InnerScript interest capture - Google Apps Script
 *
 * Deploy this script as a Web App from the signup Google Sheet. The expected
 * columns are email, source, timestamp, and userAgent.
 */

var SHEET_NAME = '';
var FALLBACK_EMAIL_COLUMN = 1;
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
    if (!named) throw new Error('Sheet not found: ' + SHEET_NAME);
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
  if (lastRow < 2) return false;

  var width = Math.max(emailColumn, sourceColumn);
  var values = sheet.getRange(2, 1, lastRow - 1, width).getValues();

  for (var i = 0; i < values.length; i++) {
    var rowEmail = String(values[i][emailColumn - 1] || '').trim().toLowerCase();
    var rowSource = String(values[i][sourceColumn - 1] || '').trim();
    if (rowEmail === email && rowSource === source) return true;
  }

  return false;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
