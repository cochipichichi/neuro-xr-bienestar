import { getAll, clearAll } from '../../js/analytics.js';
import { downloadJSON, downloadCSV, toast } from '../../js/ui.js';
import { dpCount, bucketizeMinutes } from '../../js/dp.js';

const MAPPING = { 'Muy ansioso/a':1,'Ansioso/a':2,'Neutral':3,'Calmo/a':4,'Muy calmo/a':5 };

function compute(){
  const ev = getAll();
  const sessions = ev.filter(e=>e.event==='session_start' || e.event==='session_end');
  const mood = ev.filter(e=>e.event==='mood_ticket');
  const starts = sessions.filter(e=>e.event==='session_start').length;
  const durations = []; let lastStart=null;
  for(const e of sessions){
    if(e.event==='session_start') lastStart=e.ts;
    if(e.event==='session_end' && lastStart){ durations.push((e.ts-lastStart)/60000); lastStart=null; }
  }
  const durTotal = Math.round(durations.reduce((a,b)=>a+b,0));
  const durAvg = durations.length? (durTotal/durations.length).toFixed(1) : '0.0';
  const deltas = mood.map(m=> (MAPPING[m.after]||0) - (MAPPING[m.before]||0) );
  const deltaAvg = deltas.length? (deltas.reduce((a,b)=>a+b,0)/deltas.length).toFixed(2) : '0.00';

  // Buckets con conteo DP
  const eps = parseFloat(document.getElementById('eps').value||'1');
  const buckets = {'<3':0,'3-7':0,'>7':0};
  durations.forEach(m=> buckets[bucketizeMinutes(m)]++);
  const noisy = { '<3': dpCount(buckets['<3'], eps), '3-7': dpCount(buckets['3-7'], eps), '>7': dpCount(buckets['>7'], eps) };

  document.getElementById('k-total').textContent = String(dpCount(starts, eps));
  document.getElementById('k-dur').textContent = String(Math.max(0, Math.round(durTotal))); // no DP en suma (podrías agregarlo)
  document.getElementById('k-avg').textContent = String(durAvg);
  document.getElementById('k-delta').textContent = String(deltaAvg);
  document.getElementById('buckets').textContent = JSON.stringify(noisy, null, 2);
  document.getElementById('events').textContent = JSON.stringify(ev, null, 2) || '—';
}
compute();
document.getElementById('eps').addEventListener('change', compute);

document.getElementById('export-json').addEventListener('click', ()=> downloadJSON('neuroxr-analytics.json', getAll()));
document.getElementById('export-csv').addEventListener('click', ()=> {
  const ev = getAll();
  const rows = [['ts','event','mode','before','after','note']];
  ev.forEach(e=> rows.push([e.ts,e.event,e.mode||'',e.before||'',e.after||'',(e.note||'').replace(/\n/g,' ')]));
  downloadCSV('neuroxr-analytics.csv', rows);
});
document.getElementById('clear').addEventListener('click', ()=>{ clearAll(); toast('Analítica borrada'); compute(); });
