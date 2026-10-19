// Optional: set a deployed Cloudflare Worker URL here for a faster proxy.
// Leave empty to use the verified Google Apps Script translation and TTS endpoint.
window.HEAL_TRANSLATOR_API_BASE = '';

// Public Google Apps Script Web App used as the cross-browser fallback for
// translation and speech audio (JSONP works when mobile CORS blocks fetch).
window.HEAL_TRANSLATOR_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFA0Abxz84lsR-YTo4NH6GPDz6VNEZy-G2sXEn54XJxJB9ffleg2RNRAquffbUk4tY/exec';
