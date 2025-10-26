const KEY = 'neuroxr.analytics.v1';
export function record(event, payload={}){ const arr = JSON.parse(localStorage.getItem(KEY)||'[]'); arr.push({ ts: Date.now(), event, ...payload }); localStorage.setItem(KEY, JSON.stringify(arr)); }
export const getAll = ()=> JSON.parse(localStorage.getItem(KEY)||'[]');
export const clearAll = ()=> localStorage.removeItem(KEY);
export const startSession = (mode)=> record('session_start', { mode });
export const endSession = (mode, extras={})=> record('session_end', { mode, ...extras });