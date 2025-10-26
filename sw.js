self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open('neuroxr-v1-3').then(c=>c.addAll([
    './','./index.html','./styles.css','./manifest.webmanifest',
    './apps/vr/index.html','./apps/vr/vr.js',
    './apps/ar/index.html','./apps/ar/ar.js',
    './apps/teacher/index.html','./apps/teacher/teacher.js',
    './apps/packs/index.html','./apps/packs/packs.js',
    './apps/editor/index.html','./apps/editor/editor.js',
    './js/analytics.js','./js/ui.js','./js/timer.js','./js/captions.js','./js/gestures.js','./js/tts.js','./js/themes.js','./js/playlists.js','./js/ble.js','./js/dp.js','./js/packs.js',
    './assets/models/manifest.json','./assets/subtitles/box_es.vtt','./assets/subtitles/steps.json',
    './assets/themes/themes.json','./playlists/demo_rutina.json'
  ]).catch(()=>{})));
});
self.addEventListener('activate', e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith((async()=>{
    const cache = await caches.open('neuroxr-v1-3');
    const cached = await cache.match(e.request);
    if(cached) return cached;
    try{
      const resp = await fetch(e.request);
      cache.put(e.request, resp.clone()).catch(()=>{});
      return resp;
    }catch{
      return cache.match('./index.html');
    }
  })());
});
