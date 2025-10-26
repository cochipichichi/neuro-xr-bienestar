import { importZip } from '../../js/packs.js';
import { toast } from '../../js/ui.js';
const log = document.getElementById('log');
document.getElementById('file').addEventListener('change', async (e)=>{
  const f = e.target.files?.[0];
  if(!f) return;
  log.textContent = 'Importando…';
  try{ await importZip(f); log.textContent = 'Listo ✔'; toast('Pack importado'); }catch(err){ log.textContent = 'Error al importar'; }
});