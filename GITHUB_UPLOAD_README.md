# GitHub upload notes

Upload the **contents of this folder** to the repository root, not the ZIP directory itself.

- Keep `assets/audio/my/` and `vendor/` unchanged.
- The static UI works on GitHub Pages.
- `server.py` provides same-origin `/translate` and `/google-tts` routes for deployments that run Python; GitHub Pages cannot run Python, so configure these routes through a backend/reverse proxy when deploying the live AI Translator.
