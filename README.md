# 🧠 Neuro-XR: Atención & Bienestar en Aula — v1.2

**Slug:** `neuro-xr-bienestar`

Mini‑apps VR/AR de respiración guiada, sonidos e imágenes calmantes con **analítica anónima**, **playlists**, **TTS**, **gestos**, **temas**, y **panel del docente**.

## Novedades v1.2
1. **Playlists / Rutinas (5–10 min):** crea secuencias (respirar, foco visual, silencio) en `/playlists/*.json` y lánzalas desde el portal.
2. **TTS + Subtítulos sincronizados:** `SpeechSynthesis` lee los pasos de respiración en español, en paralelo a captions (box 4-4-4-4).
3. **Panel del docente:** agregados locales (duración, conteo sesiones, deltas emocionales); export **CSV** y **JSON**.
4. **Gestos:** tap = **pausa/continuar**, long‑press = **terminar**, swipe = **cambiar patrón** (4‑4‑4‑4 ↔ 4‑7‑8).
5. **Temas calmantes + hápticos:** paletas “bosque/mar/noche”; vibración sutil en eventos (si `navigator.vibrate`).

## Estructura
```
/apps/vr        # VR Respiración (GLB + timer + gestos + TTS)
/apps/ar        # AR Hit-test (GLB + timer + gestos + TTS)
/apps/teacher   # Panel docente (analytics → CSV/JSON)
/assets/models  # .glb opcionales (edita manifest.json)
/assets/subtitles # .vtt / steps.json
/assets/themes  # paletas de tema
/playlists      # rutinas .json (secuencias guiadas)
/js             # ui.js, analytics.js, timer.js, captions.js, gestures.js, tts.js, themes.js, playlists.js
index.html      # Portal con tarjetas, temas, rutinas y accesibilidad
sw.js, manifest.webmanifest
```

## Publicación
- Estático + HTTPS (GitHub Pages funciona). Si WebXR no está disponible, usa **Simulación**.
- Analítica: localStorage (sin PII). Exporta desde el portal o el panel docente.

MIT © 2025
