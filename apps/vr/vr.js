import * as A from '../../js/analytics.js';
import { Timer } from '../../js/timer.js';
import { BOX_4444, PAT_478, captionAt } from '../../js/captions.js';
import { attachGestures } from '../../js/gestures.js';
import { speak } from '../../js/tts.js';
import { haptic } from '../../js/ui.js';

const statusEl = document.getElementById('status');
const circle = document.getElementById('circle');
const sim = document.getElementById('sim');
const timerEl = document.getElementById('timer');
const subEl = document.getElementById('subtitle');
const durEl = document.getElementById('dur');
const modelSel = document.getElementById('modelSel');
const togglePatternBtn = document.getElementById('togglePattern');
const ttsBtn = document.getElementById('tts');

let PATTERN = BOX_4444;
let useTTS = localStorage.getItem('neuroxr.tts.enabled')==='1';
function paintTTS(){ ttsBtn.textContent = useTTS? '🔇 TTS' : '🔊 TTS'; }
paintTTS();
ttsBtn.addEventListener('click', ()=>{ useTTS=!useTTS; localStorage.setItem('neuroxr.tts.enabled', useTTS?'1':'0'); paintTTS(); });

// URL params (from playlist)
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

// Timer
let timer = null; let elapsed=0;
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
    onDone: ()=>{ subEl.textContent='Sesión finalizada'; A.endSession('vr'); haptic(30); }
  });
}
setupTimer();
durEl.addEventListener('change', setupTimer);

// Gestures on simulation card
attachGestures(document.body, {
  onTap(){ if(!timer) return; if(timer.running){ timer.pause(); statusEl.textContent='Pausado'; } else { timer.start(); statusEl.textContent='En curso'; } haptic(); },
  onLong(){ timer.stop(); statusEl.textContent='Terminado'; A.endSession('vr'); haptic(40); },
  onSwipeLeft(){ PATTERN = PAT_478; statusEl.textContent='Patrón 4‑7‑8'; haptic(10); },
  onSwipeRight(){ PATTERN = BOX_4444; statusEl.textContent='Patrón 4‑4‑4‑4'; haptic(10); }
});

document.getElementById('simulate')?.addEventListener('click', ()=>{
  sim.style.display = 'block';
  A.startSession('vr-sim');
  statusEl.textContent = 'Simulación iniciada.';
  timer.start();
});

document.getElementById('startVR')?.addEventListener('click', async ()=>{
  try{
    A.startSession('vr');
    statusEl.textContent = 'Cargando WebXR + Three.js…';
    const THREE = await import('https://unpkg.com/three@0.159.0/build/three.module.js');
    const { VRButton } = await import('https://unpkg.com/three@0.159.0/examples/jsm/webxr/VRButton.js');
    const { OrbitControls } = await import('https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js');
    const { GLTFLoader } = await import('https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js');
    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.xr.enabled = true;
    document.body.appendChild( renderer.domElement );
    document.body.appendChild( VRButton.createButton( renderer ) );
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0d1117);
    const camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 100 ); camera.position.set(0,1.6,2);
    const controls = new OrbitControls(camera, renderer.domElement);
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); scene.add(light);
    const geo = new THREE.SphereGeometry(0.25, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2f81f7, metalness: 0.1, roughness: 0.4 });
    const sphere = new THREE.Mesh(geo, mat); sphere.position.set(0,1.5,-1); scene.add(sphere);

    let glb = null;
    try{
      const sel = modelSel.value;
      if(sel){ const loader = new GLTFLoader(); const gltf = await loader.loadAsync(`../../assets/models/${sel}`); glb = gltf.scene; glb.position.set(0,1.2,-1); glb.scale.set(0.6,0.6,0.6); scene.add(glb); sphere.visible=false; statusEl.textContent='Modelo GLB cargado.'; }
    }catch{ statusEl.textContent='GLB no encontrado. Usando esfera.'; }

    setupTimer(); timer.start();
    let t=0;
    renderer.setAnimationLoop(()=>{
      t += 0.01;
      const k = 0.1*Math.sin(t);
      (glb||sphere).scale.set(1+k,1+k,1+k);
      renderer.render(scene, camera);
    });
    statusEl.textContent += ' VR listo.';
  }catch(e){
    statusEl.textContent = 'VR no soportado o fallo al iniciar. Prueba Simulación.';
  }
});

window.addEventListener('beforeunload', ()=> A.endSession('vr'));
