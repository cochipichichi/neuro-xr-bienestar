// Importador de packs .zip (JSZip vía CDN) -> actualiza manifests locales
import { toast } from './ui.js';
export async function importZip(file){
  if(!file) return;
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default;
  const zip = await JSZip.loadAsync(file);
  const models = []; let themesPatch=null;
  for(const path of Object.keys(zip.files)){
    const lower = path.toLowerCase();
    if(lower.endsWith('.glb')){
      // Guardar GLB en Cache para servir offline
      const blob = await zip.files[path].async('blob');
      const cache = await caches.open('neuroxr-v1-3');
      const url = new URL('./assets/models/'+path.split('/').pop(), location.href).toString();
      await cache.put(url, new Response(blob));
      models.push(path.split('/').pop());
    }
    if(lower.endsWith('themes.json')){
      const json = await zip.files[path].async('string');
      themesPatch = JSON.parse(json);
      // Guardar themes.json combinado en Cache
      const cache = await caches.open('neuroxr-v1-3');
      const orig = await fetch('./assets/themes/themes.json').then(r=>r.json()).catch(()=>({}));
      const merged = {...orig, ...themesPatch};
      await cache.put(new URL('./assets/themes/themes.json', location.href).toString(),
                      new Response(new Blob([JSON.stringify(merged,null,2)],{type:'application/json'})));
    }
  }
  // Actualizar manifest de modelos en Cache
  if(models.length){
    const cache = await caches.open('neuroxr-v1-3');
    const url = new URL('./assets/models/manifest.json', location.href).toString();
    let current = await fetch('./assets/models/manifest.json').then(r=>r.json()).catch(()=>({options:[]}));
    const opts = Array.from(new Set([...(current.options||[]), ...models]));
    const next = { default: opts[0]||current.default||'', options: opts };
    await cache.put(url, new Response(new Blob([JSON.stringify(next,null,2)],{type:'application/json'})));
  }
  toast('Pack importado ✔');
}