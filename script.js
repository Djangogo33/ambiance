// ===== DATE =====
const nowD = new Date();
document.getElementById('date-el').textContent = nowD.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const TODAY = nowD.toISOString().slice(0, 10);

// ===== WEATHER + 3-DAY FORECAST =====
const WI = { 0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌦️", 61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "❄️", 73: "❄️", 75: "❄️", 80: "🌧️", 81: "🌧️", 82: "🌧️", 95: "⛈️" };
const WD = { 0: "Dégagé", 1: "Peu nuageux", 2: "Part. nuageux", 3: "Couvert", 45: "Brouillard", 48: "Brouillard", 51: "Bruine légère", 53: "Bruine", 55: "Bruine dense", 61: "Pluie légère", 63: "Pluie", 65: "Pluie forte", 71: "Neige légère", 73: "Neige", 75: "Neige forte", 80: "Averses", 81: "Averses", 82: "Averses fortes", 95: "Orage" };

async function wxFetch(lat, lon) {
  try {
    const [r1, r2] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,apparent_temperature&timezone=auto`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`)
    ]);
    const cur = await r1.json(), daily = await r2.json();
    const w = cur.current, dd = daily.daily;
    document.getElementById('wx').innerHTML = `<div class="wx-icon">${WI[w.weather_code] || '🌡️'}</div><div><div class="wx-temp">${Math.round(w.temperature_2m)}°</div><div class="wx-desc">${WD[w.weather_code] || ''}</div><div class="wx-feels">Ressenti ${Math.round(w.apparent_temperature)}°</div></div>`;
    const bar = document.getElementById('fcst-bar');
    bar.style.display = 'flex';
    bar.innerHTML = dd.time.slice(1, 4).map((t, i) => {
      const lbl = new Date(t + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long' });
      return `${i > 0 ? '<div class="fcst-sep"></div>' : ''}<div class="fcst-day"><span class="fcst-ico">${WI[dd.weather_code[i + 1]] || '🌡️'}</span><div><div class="fcst-day-lbl">${lbl}</div><div class="fcst-range">${Math.round(dd.temperature_2m_max[i + 1])}° <span style="color:var(--muted);font-weight:400">${Math.round(dd.temperature_2m_min[i + 1])}°</span></div></div></div>`;
    }).join('');
  } catch (e) { document.getElementById('wx').innerHTML = '<div style="font-size:.72rem;color:var(--muted)">Météo indisponible</div>'; }
}
if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => wxFetch(p.coords.latitude, p.coords.longitude), () => wxFetch(48.8566, 2.3522));
else wxFetch(48.8566, 2.3522);

// ===== TABS =====
function tab(name) {
  ['ambiance', 'dash', 'repas'].forEach(t => {
    document.getElementById('s-' + t).style.display = t === name ? 'block' : 'none';
    document.getElementById('nt-' + t).classList.toggle('on', t === name);
  });
}

// ===== MOODS =====
const MOODS = {
  focus: {
    colors: ['#0d1b2a', '#1b3a5c', '#2e6b9e', '#5ba3d0', '#a8dadc'], accent: '#5ba3d0', type: 'dots',
    prompt: 'Citation courte et précise sur la concentration, la clarté mentale ou la discipline. Auteur réel varié.',
    music: { name: "Onde alpha — concentration", scale: [261, 294, 329, 392, 440], tempo: 1.4, wave: 'sine', base: 40 }
  },
  calm: {
    colors: ['#0a2e1f', '#145a32', '#1e8449', '#52b788', '#95d5b2'], accent: '#52b788', type: 'waves',
    prompt: 'Citation courte et apaisante sur la sérénité, la paix ou la nature. Auteur réel varié.',
    music: { name: "Drone naturel — sérénité", scale: [220, 247, 277, 330, 370], tempo: 2.2, wave: 'sine', base: 20 }
  },
  create: {
    colors: ['#1a0a2e', '#4a1a7a', '#9b59b6', '#c77dff', '#e0aaff'], accent: '#c77dff', type: 'sparks',
    prompt: 'Citation courte et inspirante sur la créativité, l\'art ou l\'imagination. Auteur réel varié.',
    music: { name: "Arpège stellaire — créativité", scale: [349, 392, 466, 523, 587], tempo: 0.9, wave: 'triangle', base: 0 }
  },
  energy: {
    colors: ['#2d0000', '#7b1a00', '#d62828', '#f77f00', '#fcbf49'], accent: '#f77f00', type: 'burst',
    prompt: 'Citation courte et percutante sur l\'énergie, la puissance ou l\'action. Auteur réel varié.',
    music: { name: "Pulse rythmique — énergie", scale: [130, 165, 196, 220, 261], tempo: 0.5, wave: 'sawtooth', base: 60 }
  },
  dream: {
    colors: ['#080c1a', '#1a2040', '#344080', '#7b8cde', '#c5caf0'], accent: '#7b8cde', type: 'stars',
    prompt: 'Citation courte et poétique sur les rêves, l\'imaginaire ou l\'infini. Auteur réel varié.',
    music: { name: "Pad onirique — rêverie", scale: [196, 220, 261, 311, 349], tempo: 3.0, wave: 'sine', base: 7 }
  }
};
let curMood = null;

function mood(key) {
  curMood = key; const m = MOODS[key];
  document.querySelectorAll('.mood-btn').forEach(b => { b.classList.remove('on'); b.style.borderColor = ''; b.style.boxShadow = ''; });
  const btn = document.getElementById('mb-' + key);
  btn.classList.add('on'); btn.style.borderColor = m.accent; btn.style.boxShadow = `0 0 18px ${m.accent}2e`;
  document.getElementById('qcard').style.borderColor = m.accent + '40';
  document.getElementById('mcard').style.borderColor = m.accent + '40';
  document.getElementById('tname').textContent = m.music.name;
  document.getElementById('tsub').textContent = key.charAt(0).toUpperCase() + key.slice(1);
  document.getElementById('pal').innerHTML = m.colors.map(c => `<div class="sw" style="background:${c}"></div>`).join('');
  document.getElementById('glow').style.background = `radial-gradient(ellipse at 15% 15%,${m.accent}18 0%,transparent 55%),radial-gradient(ellipse at 85% 85%,${m.accent}0e 0%,transparent 55%)`;
  document.documentElement.style.setProperty('--accent', m.accent);
  setVizColor(m.accent);
  if (musicPlaying) { stopMusic(); musicPlaying = true; document.getElementById('pbtn').textContent = '⏸'; setVizOn(true); startLoop(); }
  startCanvas(key); fetchQuote();
  document.getElementById('nqbtn').style.display = 'inline-block';
}

// ===== AI QUOTE =====
async function fetchQuote() {
  if (!curMood) return;
  document.getElementById('qt').innerHTML = '<span class="pulse">Génération en cours…</span>';
  document.getElementById('qa').textContent = '';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1000,
        messages: [{ role: 'user', content: `${MOODS[curMood].prompt} Réponds UNIQUEMENT avec la citation entre guillemets français « », un saut de ligne, puis le nom de l'auteur précédé d'un tiret. Rien d'autre.` }]
      })
    });
    const d = await r.json(); const txt = d.content[0].text.trim();
    const lines = txt.split('\n').filter(l => l.trim());
    document.getElementById('qt').textContent = lines[0] || txt;
    document.getElementById('qa').textContent = lines[1] || '';
  } catch (e) { document.getElementById('qt').textContent = '« Une erreur est survenue. »'; }
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._to); t._to = setTimeout(() => t.style.opacity = '0', 2200);
}

// ===== STATS =====
function updateStats() {
  const done = todos.filter(t => t.done).length;
  document.getElementById('st-tasks').textContent = `${done}/${todos.length}`;
  const hd = habits.filter(h => h.days.includes(TODAY)).length;
  document.getElementById('st-habits').textContent = `${hd}/${habits.length}`;
  document.getElementById('st-pom').textContent = pomCount;
}

// ===== JOURNAL =====
(async () => { try { const r = await window.storage.get('journal_' + TODAY); if (r && r.value) document.getElementById('jnl').value = r.value; } catch (e) { } })();

async function saveJournal() {
  const txt = document.getElementById('jnl').value;
  try { await window.storage.set('journal_' + TODAY, txt); showToast('Journal sauvegardé ✓'); } catch (e) { showToast('Erreur de sauvegarde'); }
}

async function analyzeJournal() {
  const txt = document.getElementById('jnl').value.trim();
  if (!txt) { showToast('Écris d\'abord quelques lignes !'); return; }
  const el = document.getElementById('j-analysis');
  el.style.display = 'block';
  el.innerHTML = '<div class="j-analysis-lbl">✨ Analyse IA</div><span class="pulse">Analyse en cours…</span>';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1000,
        messages: [{ role: 'user', content: `Voici mon journal du jour : "${txt}"\n\nFais une analyse bienveillante en 3-4 phrases : sentiment général, ce qui ressort de positif, et un conseil doux pour la suite. Commence directement par l'analyse, sois chaleureux et encourageant.` }]
      })
    });
    const d = await r.json();
    const html = d.content[0].text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    el.innerHTML = '<div class="j-analysis-lbl">✨ Analyse IA</div>' + html;
  } catch (e) { el.innerHTML = '<div class="j-analysis-lbl">✨ Analyse IA</div>Erreur lors de l\'analyse.'; }
}

// ===== TODOS + PRIORITIES =====
let todos = [], todoPrio = 'med';
const PRIO_ORDER = { high: 0, med: 1, low: 2 };
const PRIO_ICON = { high: '🔴', med: '🟡', low: '🟢' };

(async () => { try { const r = await window.storage.get('todos'); if (r) todos = JSON.parse(r.value); } catch (e) { } renderTodos(); })();
async function saveTodos() { try { await window.storage.set('todos', JSON.stringify(todos)); } catch (e) { } renderTodos(); }
function addTodo() { const i = document.getElementById('ti'); if (!i.value.trim()) return; todos.push({ id: Date.now(), text: i.value.trim(), done: false, prio: todoPrio }); i.value = ''; saveTodos(); }
function togTodo(id) { todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t); saveTodos(); }
function delTodo(id) { todos = todos.filter(t => t.id !== id); saveTodos(); }
function setPrio(p) { todoPrio = p;['high', 'med', 'low'].forEach(x => document.getElementById('pb-' + x).classList.toggle('on', x === p)); }

function renderTodos() {
  const el = document.getElementById('tlist');
  if (!todos.length) { el.innerHTML = '<div class="empty"><span class="ei">✅</span>Aucune tâche pour l\'instant !</div>'; updateStats(); return; }
  const act = todos.filter(t => !t.done).sort((a, b) => PRIO_ORDER[a.prio || 'med'] - PRIO_ORDER[b.prio || 'med']);
  const dn = todos.filter(t => t.done);
  let h = '';
  act.forEach(t => { h += `<div class="titem"><button class="tcheck" onclick="togTodo(${t.id})"></button><span class="prio-dot">${PRIO_ICON[t.prio || 'med']}</span><span class="ttxt">${esc(t.text)}</span><button class="dbtn" onclick="delTodo(${t.id})">✕</button></div>`; });
  if (dn.length) {
    h += `<div class="divid">Terminées (${dn.length})</div>`;
    dn.forEach(t => { h += `<div class="titem"><button class="tcheck ok" onclick="togTodo(${t.id})">✓</button><span class="prio-dot" style="opacity:.3">${PRIO_ICON[t.prio || 'med']}</span><span class="ttxt done">${esc(t.text)}</span><button class="dbtn" onclick="delTodo(${t.id})">✕</button></div>`; });
  }
  el.innerHTML = h; updateStats();
}

// ===== HABITS =====
let habits = [];
(async () => { try { const r = await window.storage.get('habits'); if (r) habits = JSON.parse(r.value); } catch (e) { } renderHabits(); })();
async function saveHabits() { try { await window.storage.set('habits', JSON.stringify(habits)); } catch (e) { } renderHabits(); }
function addHabit() { const i = document.getElementById('hi'); if (!i.value.trim()) return; habits.push({ id: Date.now(), name: i.value.trim(), days: [] }); i.value = ''; saveHabits(); }
function togHabit(id) { habits = habits.map(h => { if (h.id !== id) return h; const done = h.days.includes(TODAY); return { ...h, days: done ? h.days.filter(d => d !== TODAY) : [...h.days, TODAY] }; }); saveHabits(); }
function delHabit(id) { habits = habits.filter(h => h.id !== id); saveHabits(); }
function streak(h) { let s = 0, d = new Date(); while (true) { const k = d.toISOString().slice(0, 10); if (h.days.includes(k)) { s++; d.setDate(d.getDate() - 1); } else break; } return s; }

function renderHabits() {
  const el = document.getElementById('hlist');
  if (!habits.length) { el.innerHTML = '<div class="empty"><span class="ei">📊</span>Ajoutez vos premières habitudes !</div>'; updateStats(); return; }
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { k: d.toISOString().slice(0, 10), l: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2) }; });
  el.innerHTML = habits.map(h => {
    const done = h.days.includes(TODAY), s = streak(h);
    const grid = last7.map(day => `<div class="wcell"><div class="wlbl">${day.l}</div><div class="wdot${h.days.includes(day.k) ? ' ok' : ''}${day.k === TODAY ? ' td' : ''}"></div></div>`).join('');
    return `<div class="hcard"><div class="hhdr"><button class="hcheck${done ? ' ok' : ''}" onclick="togHabit(${h.id})">${done ? '✓' : ''}</button><span class="hname">${esc(h.name)}</span><span class="hstrk">🔥 ${s}j</span><button class="dbtn" onclick="delHabit(${h.id})">✕</button></div><div class="wgrid">${grid}</div></div>`;
  }).join('');
  updateStats();
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ===== VISUALIZER =====
const vizEl = document.getElementById('viz');
for (let i = 0; i < 18; i++) { const b = document.createElement('div'); b.className = 'vb'; const h = 5 + Math.random() * 17, d = (.25 + Math.random() * .5).toFixed(2); b.style.setProperty('--h', h + 'px'); b.style.setProperty('--d', d + 's'); b.style.height = '3px'; b.style.animationDelay = (Math.random() * .4).toFixed(2) + 's'; vizEl.appendChild(b); }
function setVizColor(c) { document.querySelectorAll('.vb').forEach(b => b.style.background = c + '77'); }
function setVizOn(on) { document.querySelectorAll('.vb').forEach(b => { b.className = 'vb' + (on ? ' p' : ''); }); }

// ===== AUDIO =====
let actx = null, musicPlaying = false, mNodes = [], mTO = null;
function getActx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }
function stopMusic() { mNodes.forEach(n => { try { n.stop(); } catch (e) { } }); mNodes = []; if (mTO) clearTimeout(mTO); setVizOn(false); document.getElementById('pbtn').textContent = '▶'; musicPlaying = false; }
function pNote(freq, t, dur, wave, g, ctx, dest) { const o = ctx.createOscillator(), gn = ctx.createGain(), v = document.getElementById('vol').value / 100 * .18; o.type = wave; o.frequency.setValueAtTime(freq, t); gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(g * v, t + .08); gn.gain.linearRampToValueAtTime(0, t + dur * .9); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + dur); mNodes.push(o); }
function startLoop() {
  if (!curMood) return; const ctx = getActx(), m = MOODS[curMood].music, mst = ctx.createGain(); mst.gain.value = 1; mst.connect(ctx.destination);
  if (m.base > 0) { const dr = ctx.createOscillator(), dg = ctx.createGain(), v = document.getElementById('vol').value / 100 * .04; dr.type = 'sine'; dr.frequency.value = m.base; dg.gain.value = v; dr.connect(dg); dg.connect(mst); dr.start(); mNodes.push(dr); }
  let t = ctx.currentTime;
  function sched() { if (!musicPlaying) return; const now = ctx.currentTime; for (let i = 0; i < 4; i++) { const f = m.scale[Math.floor(Math.random() * m.scale.length)] * (Math.random() > .7 ? 2 : 1), d = m.tempo * (.5 + Math.random() * 1.5); pNote(f, t, d, m.wave, .25, ctx, mst); t += m.tempo * (.4 + Math.random() * .8); } mTO = setTimeout(sched, Math.max(100, (t - now - 1) * 1000)); }
  sched();
}
function toggleMusic() { if (!curMood) return; if (musicPlaying) { stopMusic(); } else { musicPlaying = true; document.getElementById('pbtn').textContent = '⏸'; setVizOn(true); if (curMood) setVizColor(MOODS[curMood].accent); startLoop(); } }

// ===== CANVAS =====
let animId = null, parts = [], spd = 1, szm = 1, pct = 40;
function updPC(v) { document.getElementById('pcv').textContent = v; pct = +v; if (curMood) startCanvas(curMood); }
function updSP(v) { document.getElementById('spv').textContent = v; spd = v / 5; }
function updSZ(v) { document.getElementById('szv').textContent = v; szm = v / 5; }
function startCanvas(key) {
  if (animId) cancelAnimationFrame(animId);
  parts = []; const cv = document.getElementById('cv'), ctx = cv.getContext('2d'), W = 680, H = 170, m = MOODS[key], n = pct;
  if (key === 'focus') { for (let i = 0; i < n; i++)parts.push({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 2.5, sp: .2 + Math.random() * .4, ph: Math.random() * Math.PI * 2 }); }
  else if (key === 'calm') { for (let i = 0; i < Math.min(n, 10); i++)parts.push({ yb: 14 + i * 18, amp: 8 + Math.random() * 14, fr: .01 + Math.random() * .006, ph: Math.random() * Math.PI * 2, sp: .008 + Math.random() * .006, al: .12 + (9 - i) * .04 }); }
  else if (key === 'create') { for (let i = 0; i < n; i++)parts.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 3, ang: Math.random() * Math.PI * 2, sp: .4 + Math.random() * .8, hue: 260 + Math.random() * 80, ph: Math.random() * Math.PI * 2 }); }
  else if (key === 'energy') { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 3; parts.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1.5 + Math.random() * 3, life: Math.random(), dec: .005 + Math.random() * .01, hue: 20 + Math.random() * 30 }); } }
  else if (key === 'dream') { for (let i = 0; i < n; i++)parts.push({ x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 2, tw: Math.random() * Math.PI * 2, ts: .015 + Math.random() * .04, dr: (Math.random() - .5) * .15 }); }
  let t = 0;
  function draw() {
    t += .016; const s = spd, z = szm;
    const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, m.colors[0]); gr.addColorStop(.5, m.colors[1]); gr.addColorStop(1, m.colors[2]);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    if (key === 'focus') { parts.forEach(p => { p.y -= p.sp * s; if (p.y < -p.r) p.y = H + p.r; const a = .3 + .4 * Math.sin(t * 1.5 + p.ph); ctx.beginPath(); ctx.arc(p.x, p.y, p.r * z, 0, Math.PI * 2); ctx.fillStyle = `rgba(91,163,208,${a})`; ctx.fill(); }); }
    else if (key === 'calm') { parts.forEach((p, i) => { ctx.beginPath(); for (let x = 0; x <= W; x += 4) { const y = p.yb + Math.sin(x * p.fr + t * p.sp * 40 * s + p.ph) * p.amp * z; i === 0 && x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = `rgba(82,183,136,${p.al})`; ctx.lineWidth = 1.5 * z; ctx.stroke(); }); }
    else if (key === 'create') { parts.forEach(p => { p.ang += .012 * p.sp * s; p.x += Math.sin(p.ang) * p.sp * s * .7; p.y += Math.cos(p.ang * .8) * p.sp * s * .5; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0; const a = .4 + .5 * Math.abs(Math.sin(t * p.sp + p.ph)); ctx.beginPath(); ctx.arc(p.x, p.y, p.r * z, 0, Math.PI * 2); ctx.fillStyle = `hsla(${p.hue + Math.sin(t * .5) * 30},80%,70%,${a})`; ctx.fill(); }); }
    else if (key === 'energy') { ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(0, 0, W, H); parts.forEach(p => { p.x += p.vx * s; p.y += p.vy * s; p.life -= p.dec * s; if (p.life <= 0) { const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 3; p.x = W / 2 + (Math.random() - .5) * 40; p.y = H / 2 + (Math.random() - .5) * 20; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; p.life = .8 + Math.random() * .2; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r * z * p.life, 0, Math.PI * 2); ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.life * .8})`; ctx.fill(); }); }
    else if (key === 'dream') { parts.forEach(p => { p.tw += p.ts * s; p.x += p.dr * s; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; const a = .1 + .7 * (.5 + .5 * Math.sin(p.tw)); const r = p.r * z * (.7 + .6 * Math.abs(Math.sin(p.tw * 1.2))); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = `rgba(197,202,240,${a})`; ctx.fill(); }); }
    animId = requestAnimationFrame(draw);
  } draw();
}

// ===== TIMER V2 — POMODORO =====
let tSec = 25 * 60, tRun = false, tInt = null, tMode = 'work', pomCount = 0;
const TIMER_DEFS = { work: 25, short: 5, long: 15 };

(async () => { try { const r = await window.storage.get('pom_' + TODAY); if (r) pomCount = +r.value || 0; } catch (e) { } renderTomatoes(); updateStats(); })();

function setTimerMode(m) {
  if (tRun) toggleTimer();
  tMode = m;
  tSec = TIMER_DEFS[m] * 60;
  document.getElementById('tdis').textContent = fmt(tSec);
  document.querySelectorAll('.tmdbtn').forEach(b => b.classList.remove('on'));
  document.getElementById('tm-' + m).classList.add('on');
  const btn = document.getElementById('ttgl');
  btn.textContent = '▶ Start'; btn.classList.remove('at'); btn.style.borderColor = '';
}

function setTimer(min) {
  if (tRun) toggleTimer();
  tSec = +min * 60;
  document.getElementById('tdis').textContent = fmt(tSec);
  const btn = document.getElementById('ttgl');
  btn.textContent = '▶ Start'; btn.classList.remove('at');
}

function fmt(s) { const m = Math.floor(s / 60), sc = s % 60; return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`; }

function playChime() {
  try {
    const ctx = getActx();
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t = ctx.currentTime + i * .22;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.13, t + .04); g.gain.linearRampToValueAtTime(0, t + .45);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .55);
    });
  } catch (e) { }
}

function renderTomatoes() {
  const pos = pomCount % 4;
  document.getElementById('tcount').innerHTML =
    Array.from({ length: 4 }, (_, i) => `<span class="tom${i < pos ? ' ok' : ''}">🍅</span>`).join('') +
    (pomCount > 0 ? `<span class="tom-total">×${pomCount}</span>` : '');
}

function toggleTimer() {
  tRun = !tRun; const btn = document.getElementById('ttgl');
  if (tRun) {
    btn.textContent = '⏸ Pause'; btn.classList.add('at');
    if (curMood) btn.style.borderColor = MOODS[curMood].accent;
    tInt = setInterval(() => {
      tSec--;
      document.getElementById('tdis').textContent = fmt(tSec);
      if (tSec <= 0) {
        clearInterval(tInt); tRun = false;
        playChime();
        btn.textContent = '▶ Start'; btn.classList.remove('at'); btn.style.borderColor = '';
        document.getElementById('tdis').textContent = '✓ Fini !';
        if (tMode === 'work') {
          pomCount++; renderTomatoes(); updateStats();
          window.storage.set('pom_' + TODAY, String(pomCount)).catch(() => { });
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted')
            new Notification('🍅 Pomodoro terminé !', { body: 'Pause bien méritée !' });
          setTimeout(() => setTimerMode(pomCount % 4 === 0 ? 'long' : 'short'), 900);
        } else {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted')
            new Notification('💪 Pause terminée !', { body: 'Au travail !' });
          setTimeout(() => setTimerMode('work'), 900);
        }
      }
    }, 1000);
  } else { clearInterval(tInt); btn.textContent = '▶ Reprendre'; btn.classList.remove('at'); }
}

function reqNotif() {
  if (typeof Notification === 'undefined') { showToast('Notifications non supportées'); return; }
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      const h = document.getElementById('notif-hint');
      if (p === 'granted') { h.textContent = '🔔 Notifications activées ✓'; }
      else { h.textContent = '🔕 Notifications refusées'; h.style.cursor = 'default'; }
    });
  }
}
// Init notif hint state
if (typeof Notification !== 'undefined') {
  if (Notification.permission === 'granted') document.getElementById('notif-hint').textContent = '🔔 Notifications activées ✓';
  else if (Notification.permission === 'denied') { document.getElementById('notif-hint').textContent = '🔕 Notifications refusées'; document.getElementById('notif-hint').style.cursor = 'default'; }
} else { document.getElementById('notif-hint').style.display = 'none'; }

// ===== AI MEALS + RECETTES =====
let lastMeals = [], lastIng = '';

async function genMeals() {
  const ing = document.getElementById('ing').value.trim(); if (!ing) return;
  lastIng = ing;
  const btn = document.getElementById('gbtn'); btn.disabled = true; btn.textContent = '🤔 L\'IA réfléchit…';
  document.getElementById('mempty').style.display = 'none'; document.getElementById('mealcard').style.display = 'none';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1000,
        messages: [{ role: 'user', content: `Ingrédients disponibles : ${ing}.\nPropose 3 idées de repas. Réponds UNIQUEMENT en JSON valide sans markdown, sans backticks : [{"emoji":"🍝","nom":"Nom du plat","desc":"description courte et appétissante en 1 phrase"}]. Rien d'autre.` }]
      })
    });
    const d = await r.json();
    let meals = null;
    try {
      const txt = d.content[0].text.trim().replace(/```json|```/g, '');
      const m = txt.match(/\[[\s\S]*\]/);
      if (m) meals = JSON.parse(m[0]);
    } catch (pe) { }
    if (meals && Array.isArray(meals) && meals.length > 0) {
      lastMeals = meals;
      document.getElementById('mres').innerHTML = meals.map((m, i) => `
        <div class="meal-idea" id="mi-${i}">
          <div class="meal-hdr"><span class="meal-emoji">${m.emoji || '🍳'}</span><span class="meal-name">${esc(m.nom || '')}</span></div>
          <div class="meal-desc">${esc(m.desc || '')}</div>
          <button class="ghost-btn" style="margin-top:8px" onclick="getRecipe(${i})">📋 Voir la recette complète</button>
          <div class="meal-recipe" id="mr-${i}"></div>
        </div>`).join('');
    } else {
      // Fallback: affichage texte simple
      const html = d.content[0].text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
      document.getElementById('mres').innerHTML = `<div class="mres">${html}</div>`;
    }
    document.getElementById('mealcard').style.display = 'block';
  } catch (e) { document.getElementById('mres').textContent = 'Erreur. Réessayez.'; document.getElementById('mealcard').style.display = 'block'; }
  btn.disabled = false; btn.textContent = '✨ Générer des idées de repas';
}

async function getRecipe(idx) {
  const meal = lastMeals[idx]; if (!meal) return;
  const recEl = document.getElementById('mr-' + idx);
  const btn = document.querySelector('#mi-' + idx + ' .ghost-btn');
  // Toggle si déjà chargé
  if (recEl.dataset.loaded === '1') {
    const visible = recEl.style.display === 'block';
    recEl.style.display = visible ? 'none' : 'block';
    btn.textContent = visible ? '📋 Voir la recette complète' : '▲ Masquer la recette';
    return;
  }
  btn.disabled = true; btn.textContent = '⏳ Génération…';
  recEl.style.display = 'block';
  recEl.innerHTML = '<span class="pulse">Génération de la recette…</span>';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1000,
        messages: [{ role: 'user', content: `Donne la recette complète de "${meal.nom}" en utilisant ces ingrédients disponibles : ${lastIng}.\nFormat : **Ingrédients** (liste concise) puis **Préparation** (4-5 étapes numérotées). Direct et pratique.` }]
      })
    });
    const d = await r.json();
    recEl.innerHTML = d.content[0].text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    recEl.dataset.loaded = '1';
    btn.textContent = '▲ Masquer la recette';
  } catch (e) { recEl.innerHTML = 'Erreur de génération.'; btn.textContent = '📋 Voir la recette complète'; }
  btn.disabled = false;
}
