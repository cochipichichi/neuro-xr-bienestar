export function laplaceNoise(scale){ const u = Math.random()-0.5; return -scale * Math.sign(u) * Math.log(1-2*Math.abs(u)); }
export function dpCount(n, epsilon=1.0){ const scale = 1/epsilon; return Math.max(0, Math.round(n + laplaceNoise(scale))); }
export function bucketizeMinutes(mins){ if(mins<3) return '<3'; if(mins<=7) return '3-7'; return '>7'; }