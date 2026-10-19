# HEAL English — v11 AI Translator update

Upload the contents of this folder to the repository root. `index.html` must stay at the root. Keep `interpreter-stt.js`, `assets/audio/my/`, and `vendor/` in their package paths.

This update starts Google Apps Script translation at once alongside the direct Google Translate request, shortens end-of-speech waits, removes the keyboard-dictation fallback, and uses Google Cloud Speech-to-Text (`my-MM`) for Burmese listening. Thai, English, and Chinese listening continue to use browser Speech Recognition.

**Burmese Cloud STT needs one-time setup before it can work:** enable Cloud Speech-to-Text API and billing, store an API key restricted to that API in Apps Script Script Properties as `HEAL_SPEECH_API_KEY`, replace Apps Script `Code.gs` with this package's version, then deploy a new Web app version. Keep the key out of GitHub. Follow [SPEECH_TO_TEXT_SETUP.md](SPEECH_TO_TEXT_SETUP.md).

The translation and audio endpoints previously supplied were verified for Thai/English/Chinese/Burmese translation and TTS. The new Cloud Speech-to-Text path cannot be live-tested until the API key and redeployed Apps Script backend are configured. GitHub Pages must use HTTPS and microphone permission must be granted.


This package is configured to use the latest Google Apps Script deployment supplied by the owner for translation and speech audio. The endpoint was checked for Thai/Chinese/Burmese translation directions and Chinese/Burmese speech audio.
