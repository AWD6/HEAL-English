# Google Cloud Speech-to-Text setup for Burmese

The v10 AI Translator sends recorded Burmese audio to Google Cloud Speech-to-Text because Web Speech support for `my-MM` varies by browser and device. Other interpreter languages continue using the browser's speech recognition. No keyboard-dictation fallback is included.

## One-time Google Cloud setup

1. In Google Cloud Console, select or create the project connected to your Apps Script project. Enable **Cloud Speech-to-Text API** and billing for that project. Google Cloud charges may apply based on audio use.
2. Create an API key and restrict it to **Cloud Speech-to-Text API**. Do not add a website-referrer restriction: the request comes from Apps Script servers. Keep the key private.
3. Open the Apps Script project used by the configured `/exec` URL. In **Project Settings > Script Properties**, add `HEAL_SPEECH_API_KEY` with the key as its value. Never put the key in `translator-config.js` or any GitHub file.
4. Replace the Apps Script project's `Code.gs` with this package's `Code.gs`. In **Deploy > Manage deployments**, edit the existing Web app deployment, choose **New version**, and deploy. Keep it executing as you and accessible to app users. If Google gives a new `/exec` URL, update `translator-config.js`.
5. Upload all files from the package to the GitHub repository root. Keep `index.html`, `interpreter-stt.js`, `translator-config.js`, `script.js`, `Code.gs`, `assets/`, and `vendor/` in their package paths.

The browser captures Burmese audio as short 16 kHz mono WAV phrases and submits it through a hidden form to Apps Script; the API key stays server-side. Speech is sent to Google Cloud only when the listening language is Burmese. The translation text continues to go to Google Translate.

## Verify deployment

After deployment, open the app on the phone using HTTPS, allow microphone access, choose Burmese, then start listening and speak a short phrase in Burmese. The interpreter status should show “กำลังรู้จำเสียงพม่า…” after the pause at the end of the phrase. If it reports a missing API key, verify the Script Property name exactly. If it reports an API error, check API enablement, billing, API-key restrictions, and redeploy the new `Code.gs` version.

Cloud Speech-to-Text officially lists Burmese (Myanmar) as `my-MM` with a supported model. See [Google's supported languages](https://cloud.google.com/speech-to-text/docs/speech-to-text-supported-languages).
