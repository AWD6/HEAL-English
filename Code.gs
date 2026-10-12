/**
 * HEAL English usage logging endpoint for a Google Sheet-bound Apps Script.
 * Receives only room name, date, timestamp and a random event id; never send patient data.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!payload.id || !payload.room || !payload.dateLabel || !payload.timestamp) {
      return json_({ ok: false, error: 'Missing required fields' });
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const log = getOrCreateSheet_(ss, 'usage_log', ['event_id', 'room', 'date_be', 'started_at_utc', 'date_key', 'count']);
    const ids = log.getLastRow() > 1 ? log.getRange(2, 1, log.getLastRow() - 1, 1).getValues().flat() : [];
    if (ids.indexOf(payload.id) === -1) {
      log.appendRow([String(payload.id), String(payload.room).slice(0, 60), String(payload.dateLabel), String(payload.timestamp), String(payload.dateKey || ''), 1]);
      rebuildSummary_(ss, log);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: 'HEAL English usage logger' });
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#ccfbf1');
  }
  return sheet;
}

function rebuildSummary_(ss, log) {
  const summary = getOrCreateSheet_(ss, 'usage_summary', ['room', 'date_be', 'count']);
  const values = log.getLastRow() > 1 ? log.getRange(2, 1, log.getLastRow() - 1, 6).getValues() : [];
  const totals = {};
  values.forEach(row => {
    const room = String(row[1]);
    const date = String(row[2]);
    const dateKey = String(row[4]);
    const key = `${dateKey}|${room}`;
    if (!totals[key]) totals[key] = { room, date, dateKey, count: 0 };
    totals[key].count += Number(row[5]) || 1;
  });
  const rows = Object.values(totals).sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.room.localeCompare(b.room));
  if (summary.getLastRow() > 1) summary.getRange(2, 1, summary.getLastRow() - 1, 3).clearContent();
  if (rows.length) summary.getRange(2, 1, rows.length, 3).setValues(rows.map(r => [r.room, r.date, r.count]));
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
