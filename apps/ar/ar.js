import * as A from '../../js/analytics.js';
import { Timer } from '../../js/timer.js';
import { BOX_4444, PAT_478, captionAt } from '../../js/captions.js';
import { attachGestures } from '../../js/gestures.js';
import { speak } from '../../js/tts.js';
import { haptic } from '../../js/ui.js';

const statusEl = document.getElementById('status');
const sim = document.getElementById('sim');
const gallery = document.getElementById('gallery');
const timerEl = document.getElementById('timer');
const subEl = document.getElementById('subtitle');
const durEl = document.getElementById('dur');
const modelSel = document.getElementById('modelSel');
const ttsBtn = document.getElementById('tts');
let PATTERN = BOX_4444;
let useTTS = localStorage.getItem('neuroxr.tts.enabled')==='1';
function paintTTS(){ ttsBtn.textContent = useTTS? '🔇 TTS' : '🔊 TTS'; }
paintTTS();
ttsBtn.addEventListener('click', ()=>{ useTTS=!useTTS; localStorage.setItem('neuroxr.tts.enabled', useTTS?'1':'0'); paintTTS(); });

// URL params (playlist)
const params = new URLSearchParams(location.search);
if(params.get('dur')) durEl.value = String(parseInt(params.get('dur'),10));
if(params.get('pat')==='478') PATTERN = PAT_478;

// Manifest models
async function loadManifest(){
  try{
    const man = await fetch('../../assets/models/manifest.json').then(r=>r.json());
    const opts = man.options||[man.default];
    modelSel.innerHTML = opts.map(x=>`<option>${x}</option>`).join('');
    modelSel.value = params.get('glb') || man.default;
  }catch{ modelSel.innerHTML = '<option value="">(sin modelo)</option>'; }
}
loadManifest();

let timer=null; let elapsed=0;
function setupTimer(){
  const mins = Math.max(1, Math.min(20, parseInt(durEl.value||'5',10)));
  elapsed = 0;
  timer = new Timer({
    durationSec: mins*60,
    onTick: (left)=>{
      elapsed = (mins*60 - left);
      const m = Math.floor(left/60).toString().padStart(2,'0');
      const s = (left%60).toString().padStart(2,'0');
      timerEl.textContent = `${m}:${s}`;
      timerEl.style.display = 'block';
      subEl.style.display = 'block';
      const text = captionAt(elapsed, PATTERN);
      subEl.textContent = text;
      if(useTTS && text) speak(text, { rate: 0.95 });
    },
    onDone: ()=>{ subEl.textContent='Sesión finalizada'; A.endSession('ar'); haptic(30); }
  });
}
setupTimer();
durEl.addEventListener('change', setupTimer);

// Gestures
attachGestures(document.body, {
  onTap(){ if(!timer) return; if(timer.running){ timer.pause(); statusEl.textContent='Pausado'; } else { timer.start(); statusEl.textContent='En curso'; } haptic(); },
  onLong(){ timer.stop(); statusEl.textContent='Terminado'; A.endSession('ar'); haptic(40); },
  onSwipeLeft(){ PATTERN = PAT_478; statusEl.textContent='Patrón 4‑7‑8'; haptic(10); },
  onSwipeRight(){ PATTERN = BOX_4444; statusEl.textContent='Patrón 4‑4‑4‑4'; haptic(10); }
});

document.getElementById('simulate')?.addEventListener('click', ()=>{
  sim.style.display = 'block';
  statusEl.textContent = 'Simulación AR activa.';
  A.startSession('ar-sim');
  timer.start();
});
document.getElementById('addImg')?.addEventListener('click', ()=>{
  const img = document.createElement('div');
  img.style.width='120px'; img.style.height='80px'; img.style.borderRadius='12px';
  img.style.background='linear-gradient(135deg,#2f81f7,#2ea043)';
  img.title='imagen calmante';
  gallery.appendChild(img);
  A.record('ar_sim_image_added', {});
});

document.getElementById('startAR')?.addEventListener('click', async ()=>{
  try{
    A.startSession('ar');
    statusEl.textContent = 'Cargando WebXR + GLB…';
    const THREE = await import('https://unpkg.com/three@0.159.0/build/three.module.js');
    const { ARButton } = await import('https://unpkg.com/three@0.159.0/examples/jsm/webxr/ARButton.js');
    const { GLTFLoader } = await import('https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js');
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 1.0); scene.add(light);
    const geo = new THREE.PlaneGeometry(0.25, 0.25);
    const mat = new THREE.MeshBasicMaterial({ color: 0x2f81f7 });
    const marker = new THREE.Mesh(geo, mat); marker.visible = false; scene.add(marker);
    const session = renderer.xr.getSession();
    const refSpace = await session.requestReferenceSpace('viewer');
    const xrRefSpace = await session.requestReferenceSpace('local');
    const hitTestSource = await session.requestHitTestSource({ space: refSpace });

    let glb = null;
    async function ensureGLB(){
      if(glb) return glb;
      try{
        const sel = modelSel.value; if(!sel) return null;
        const { GLTFLoader } = await import('https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(`../../assets/models/${sel}`);
        glb = gltf.scene; glb.visible=false; scene.add(glb);
      }catch{ statusEl.textContent='GLB no encontrado. Usando marcador.'; }
      return glb;
    }

    renderer.setAnimationLoop(async (t, frame)=>{
      if(frame){
        const hits = frame.getHitTestResults(hitTestSource);
        if(hits.length){
          const pose = hits[0].getPose(xrRefSpace);
          marker.visible=true;
          marker.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
          marker.lookAt(camera.position);
          const mdl = await ensureGLB();
          if(mdl){ mdl.visible=true; mdl.position.copy(marker.position); mdl.lookAt(camera.position); mdl.rotation.y += 0.005; }
        }
      }
      renderer.render(scene, camera);
    });
    setupTimer(); timer.start();
    statusEl.textContent = 'AR listo.';
  }catch(e){
    statusEl.textContent = 'AR no soportado o fallo al iniciar. Usa Simulación.';
  }
});

window.addEventListener('beforeunload', ()=> A.endSession('ar'));
