// Gestos básicos: tap (toggle), long-press (end), swipe (pattern switch)
export function attachGestures(target, {onTap=(()=>{}), onLong=(()=>{}), onSwipeLeft=(()=>{}), onSwipeRight=(()=>{})}={}){
  let t0=0, x0=0, y0=0, pressed=false, longTimer=null;
  const start=(x,y)=>{ pressed=true; t0=Date.now(); x0=x; y0=y; longTimer=setTimeout(()=>{ if(pressed){ onLong(); pressed=false; } }, 800); };
  const end=(x,y)=>{ if(!pressed) return; const dt=Date.now()-t0; const dx=x-x0, dy=y-y0; clearTimeout(longTimer); pressed=false;
    const adx=Math.abs(dx), ady=Math.abs(dy);
    if(adx>50 && adx>ady){ if(dx<0) onSwipeLeft(); else onSwipeRight(); return; }
    if(dt<200) onTap();
  };
  target.addEventListener('pointerdown', e=>start(e.clientX,e.clientY));
  target.addEventListener('pointerup', e=>end(e.clientX,e.clientY));
  target.addEventListener('pointercancel', ()=>{pressed=false; clearTimeout(longTimer);});
}