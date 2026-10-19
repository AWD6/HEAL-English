/**
 * HEAL English usage logging endpoint for a Google Sheet-bound Apps Script.
 * Logs room/date/timestamp events; Burmese STT audio is handled separately only when the interpreter listens for Burmese.
 */
function doPost(e) {
  if (e && e.parameter && e.parameter.action === 'interpreter-stt') {
    return recognizeInterpreterSpeech_(e.parameter);
  }
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

/**
 * Short-utterance speech recognition for Burmese on browsers without a
 * Burmese Web Speech engine. Keep the Google Cloud API key in Script Properties.
 */
function recognizeInterpreterSpeech_(params) {
  const requestId = String(params.requestId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
  try {
    const lang = String(params.lang || 'my-MM');
    const allowed = ['my-MM'];
    const audio = String(params.audio || '');
    if (!requestId) throw new Error('Invalid speech request id');
    if (allowed.indexOf(lang) === -1) throw new Error('Unsupported speech language');
    if (!audio || audio.length > 1400000) throw new Error('Audio is empty or too long; speak a shorter phrase');
    const apiKey = PropertiesService.getScriptProperties().getProperty('HEAL_SPEECH_API_KEY');
    if (!apiKey) throw new Error('Google Cloud Speech-to-Text is not configured (missing HEAL_SPEECH_API_KEY)');

    const response = UrlFetchApp.fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-Goog-Api-Key': apiKey },
      payload: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: lang,
          model: 'default'
        },
        audio: { content: audio }
      }),
      muteHttpExceptions: true
    });
    const code = response.getResponseCode();
    const body = JSON.parse(response.getContentText() || '{}');
    if (code < 200 || code >= 300) {
      const detail = body.error && body.error.message ? body.error.message : 'Speech service request failed';
      throw new Error('Google Cloud Speech-to-Text HTTP ' + code + ': ' + detail);
    }
    const transcript = (body.results || []).map(result => {
      const alternatives = result.alternatives || [];
      return alternatives.length ? String(alternatives[0].transcript || '') : '';
    }).join(' ').trim();
    if (!transcript) throw new Error('No Burmese speech was recognized; try speaking closer to the microphone');
    return speechPostMessage_(requestId, { ok: true, transcript: transcript });
  } catch (err) {
    return speechPostMessage_(requestId, { ok: false, error: String(err && err.message || err) });
  }
}

function speechPostMessage_(requestId, result) {
  const message = JSON.stringify({ type: 'heal-interpreter-stt', requestId: requestId, result: result })
    .replace(/</g, '\\u003c');
  const html = '<!doctype html><meta charset="utf-8"><script>parent.postMessage(' + message + ', "*");<\/script>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = String(params.callback || '');
  const action = String(params.action || '');
  try {
    if (action === 'interpreter-translate') {
      const source = String(params.q || '').trim();
      const from = String(params.sl || 'auto');
      const to = String(params.tl || 'th');
      if (!source || source.length > 1500) throw new Error('Invalid text');
      // Use Apps Script's Google Language service first. UrlFetchApp requests
      // to the public web endpoint can be rate-limited (HTTP 429).
      try {
        const translated = String(LanguageApp.translate(source, from === 'auto' ? '' : from, to) || '').trim();
        if (translated) return jsonpOrJson_({ ok: true, translation: translated }, callback);
      } catch (err) {
        // Continue with Google's public hosts if LanguageApp is unavailable.
      }
      const query = '?client=gtx&dt=t&sl=' + encodeURIComponent(from)
        + '&tl=' + encodeURIComponent(to) + '&q=' + encodeURIComponent(source);
      const response = fetchGoogleProvider_([
        'https://translate.googleapis.com/translate_a/single' + query,
        'https://translate.google.com/translate_a/single' + query
      ], { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }, 'Translation provider error');
      const data = JSON.parse(response.getContentText());
      const translation = (data[0] || []).map(row => row && row[0] || '').join('').trim();
      if (!translation) throw new Error('Empty translation response');
      return jsonpOrJson_({ ok: true, translation: translation }, callback);
    }
    if (action === 'interpreter-tts') {
      const source = String(params.q || '').trim();
      const to = String(params.tl || 'th');
      if (!source || source.length > 250) throw new Error('Invalid text');
      const query = '?client=gtx&ie=UTF-8&tl=' + encodeURIComponent(to)
        + '&q=' + encodeURIComponent(source);
      const response = fetchGoogleProvider_([
        'https://translate.googleapis.com/translate_tts' + query,
        'https://translate.google.com/translate_tts?client=tw-ob&ie=UTF-8&tl='
          + encodeURIComponent(to) + '&q=' + encodeURIComponent(source)
      ], { 'User-Agent': 'Mozilla/5.0', 'Accept': 'audio/mpeg' }, 'Speech provider error');
      const bytes = response.getContent();
      if (!bytes || !bytes.length) throw new Error('Empty speech response');
      return jsonpOrJson_({ ok: true, audio: Utilities.base64Encode(bytes) }, callback);
    }
    // Preserve the previous JSON health response for callers outside the
    // AI Translator. Only the two explicitly named interpreter actions use JSONP.
    return json_({ ok: true, service: 'HEAL English usage logger' });
  } catch (err) {
    return jsonpOrJson_({ ok: false, error: String(err && err.message || err) }, callback);
  }
}

function fetchGoogleProvider_(urls, headers, failureMessage) {
  let lastStatus = 0;
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = UrlFetchApp.fetch(urls[i], {
        headers: headers,
        muteHttpExceptions: true
      });
      const status = response.getResponseCode();
      if (status >= 200 && status < 300) return response;
      lastStatus = status;
    } catch (err) {
      // Try Google's second public host if the first is unavailable.
    }
  }
  throw new Error(lastStatus ? failureMessage + ' (HTTP ' + lastStatus + ')' : failureMessage);
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

function jsonpOrJson_(value, callback) {
  if (!callback) return json_(value);
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(callback)) {
    return json_({ ok: false, error: 'Invalid callback' });
  }
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(value) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}


