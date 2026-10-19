# HEAL English — v9 mobile AI Translator update

Upload the contents of this folder to the repository root. `index.html` must be at the root. Keep all app files, including `assets/audio/my/` and `vendor/`.

This version configures the verified public Google Apps Script `/exec` endpoint for AI Translator translation and Google TTS, including when Safari or mobile Chrome blocks cross-origin `fetch`. Translation and audio requests use JSONP. The HTML asset versions were bumped so GitHub Pages fetches the updated configuration instead of a cached version.

The endpoint was checked for Thai ↔ English, Chinese, and Burmese translation, and TTS audio responses for Thai, English, Chinese, and Burmese. GitHub Pages must be served over HTTPS and the browser must be allowed to use the microphone. Speech recognition availability still depends on the browser and device.
