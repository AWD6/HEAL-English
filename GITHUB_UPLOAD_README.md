# HEAL English — v8 mobile AI Translator update

Upload the contents of this folder to the repository root. `index.html` must be at the root.

This package includes mobile fixes for AI Translator speech recognition, translation, and speech playback. Google Translate and Google TTS requests now allow up to 9 seconds for a slow mobile connection instead of failing after 1.4 seconds (translation) or 3.2 seconds (speech). Keep `assets/audio/my/` and `vendor/` intact.

For Google Apps Script translation and speech, deploy `Code.gs` as a Web App and set its public `/exec` URL in `translator-config.js`. The `/dev` test URL is editor-only. GitHub Pages must be served over HTTPS for microphone access.
