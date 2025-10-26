# 🧠 Neuro-XR — v1.3

Novedades v1.3:
- **Packs**: importador `.zip` (temas, modelos `.glb`, audios) → guarda en cache/PWA y actualiza manifests.
- **Editor de rutinas**: constructor visual (drag & drop) con export `.json` y previsualización VR/AR.
- **BLE (opcional)**: frecuencia cardíaca con Web Bluetooth (on-device, sin PII).
- **Privacidad diferencial local (LDP)**: ruido Laplace opcional en export Docente + buckets.

Se conservan funciones de v1.2 (playlists, TTS, gestos, temas, panel Docente).

## Rutas nuevas
- `/apps/packs/` – importador ZIP (JSZip vía CDN).
- `/apps/editor/` – editor visual de rutinas.
- BLE: `js/ble.js`; LDP: `js/dp.js`; Packs: `js/packs.js`.

> Importante: WebXR/BL requiere HTTPS y dispositivos compatibles.
