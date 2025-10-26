export async function applyTheme(name){ try{ const t = await fetch('./assets/themes/themes.json').then(r=>r.json()); const th = t[name]||t['mar']; if(!th) return;
  const root = document.documentElement.style; Object.entries(th.css).forEach(([k,v])=> root.setProperty(k, v)); localStorage.setItem('theme', name);
}catch{} }
export async function initTheme(){ const name = localStorage.getItem('theme')||'mar'; await applyTheme(name); return name; }