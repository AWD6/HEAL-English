const ALLOWED_ORIGIN = '*';
const GOOGLE_TRANSLATE = 'https://translate.googleapis.com/translate_a/single';
const GOOGLE_TTS = 'https://translate.googleapis.com/translate_tts';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN === '*' ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const headers = corsHeaders(request.headers.get('Origin') || '*');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
    if (!['/translate', '/google-tts'].includes(url.pathname)) return new Response('Not found', { status: 404, headers });

    const text = url.searchParams.get('q') || '';
    const target = url.searchParams.get('tl') || 'th';
    if (!text || text.length > 1500) return new Response('Invalid text', { status: 400, headers });

    const upstream = url.pathname === '/translate' ? new URL(GOOGLE_TRANSLATE) : new URL(GOOGLE_TTS);
    upstream.searchParams.set('client', 'gtx');
    upstream.searchParams.set('q', text);
    upstream.searchParams.set('tl', target);
    if (url.pathname === '/translate') {
      upstream.searchParams.set('sl', url.searchParams.get('sl') || 'auto');
      upstream.searchParams.set('dt', 't');
    } else {
      upstream.searchParams.set('ie', 'UTF-8');
    }

    try {
      const response = await fetch(upstream, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': url.pathname === '/translate' ? 'application/json' : 'audio/mpeg' }
      });
      if (!response.ok) return new Response('Translation provider error', { status: 502, headers });
      headers['Cache-Control'] = 'no-store';
      headers['Content-Type'] = url.pathname === '/translate' ? 'application/json; charset=utf-8' : 'audio/mpeg';
      return new Response(response.body, { status: 200, headers });
    } catch (_) {
      return new Response('Translation provider unavailable', { status: 502, headers });
    }
  }
};
