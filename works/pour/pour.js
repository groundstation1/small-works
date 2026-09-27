// Pour — a thread of paint falling from a swinging hand. Nobody draws these lines: the hand only swings,
// and the thread's own physics (coiling, looping, meandering, going straight) lays them down.
// The geometric model of Brun, Audoly, Ribe, Eaves & Lister ("Liquid ropes", PRL 2015), with the hand
// as a pendulum that drifts as the painter walks. Six kept from 48, found in lab/rope.html (v2).

const PALETTES = {
  pollock: { ground: '#d8ccb4', inks: ['#141210', '#f1ece2', '#8a8f93', '#b27b3a'] },
  ink: { ground: '#f2efe8', inks: ['#111111'] },
  blue: { ground: '#f2efe8', inks: ['#1b2f7a', '#111111'] },
  red: { ground: '#eee8dc', inks: ['#b3261e', '#111111', '#eee8dc'] },
  night: { ground: '#101214', inks: ['#e9e6de', '#c9a34a', '#7c8a96'] },
};
const PLATES = [   // seeds 37, 36, 27, 21, 9, 31
  { pal: 'ink', seed: 190465815, coil: 0.018286548841278998, width: 0.0038442355525679893, heavy: 3, medium: 9, fine: 22, order: 'fine-first' },
  { pal: 'red', seed: 561440562, coil: 0.007245646674418822, width: 0.0029594107471406462, heavy: 4, medium: 15, fine: 30, order: 'fine-first' },
  { pal: 'blue', seed: 312820282, coil: 0.010290980555582791, width: 0.0028266114128753543, heavy: 1, medium: 13, fine: 33, order: 'heavy-first' },
  { pal: 'blue', seed: 340524174, coil: 0.02487399007193744, width: 0.0029252775608561935, heavy: 3, medium: 11, fine: 24, order: 'fine-first' },
  { pal: 'pollock', seed: 680655046, coil: 0.01941832543350756, width: 0.003513865409418941, heavy: 4, medium: 6, fine: 14, order: 'fine-first' },
  { pal: 'night', seed: 262478600, coil: 0.011154384411638602, width: 0.003397455234918744, heavy: 1, medium: 9, fine: 8, order: 'mixed' },
];

const q = new URLSearchParams(location.search);
const p = PLATES[Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1)) - 1];
const pal = PALETTES[p.pal];
document.body.style.background = pal.ground;

function rng(seed) { let a = (seed >>> 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const range = (R, a, b) => a + (b - a) * R();

// the model: contact point (r, ψ) from below the nozzle, laid tangent θ, canvas moving under the nozzle at V in direction φ
const B = 0.715;
const kappa = (r, d) => { const c = Math.cos(d), A = B * B * c / (1 - B * c); return Math.sqrt(Math.max(r, 0)) * (1 + A * r) * Math.sin(d); };

// the body: a pendulum swing that turns and drifts; its real velocity is the model's V
function swing(R, N) {
  const c0 = [range(R, -0.1, 1.1) * N, range(R, -0.1, 1.1) * N], walk = range(R, 0, 6.283), drift = range(R, 0.02, 0.25) * N;
  const axis0 = range(R, 0, Math.PI), turn = range(R, -0.6, 0.6), A = range(R, 0.15, 0.55) * N;
  const vmax = range(R, 0.9, 2.4), omega = vmax / A, T = range(R, 3, 14) * Math.PI / omega, wob = range(R, 0, 0.25);
  const H = t => { const k = t / T, ax = axis0 + turn * k, s = Math.sin(omega * t), w = Math.sin(omega * t * 2 + 1) * wob;
    return [c0[0] + Math.cos(walk) * drift * k + Math.cos(ax) * A * s - Math.sin(ax) * A * w,
            c0[1] + Math.sin(walk) * drift * k + Math.sin(ax) * A * s + Math.cos(ax) * A * w]; };
  return { H, T };
}
function pourOne(ctx, N, R, ink, weight) {
  const unit = p.coil * N, step = 0.05, { H, T } = swing(R, N);
  let r = 1, psi = R() * 6.283, theta = psi + Math.PI / 2, t = 0;
  let [hx, hy] = H(0), px = hx + Math.cos(psi) * unit, py = hy + Math.sin(psi) * unit;
  const w0 = Math.max(0.4, p.width * N * weight), fill = range(R, 0.7, 1);
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (R() < 0.5) for (let k = 0; k < 3 + R() * 5; k++) {             // where it lands it splashes a little
    const a = R() * 6.283, d = w0 * range(R, 0, 2.2);
    ctx.beginPath(); ctx.arc(px + Math.cos(a) * d, py + Math.sin(a) * d, w0 * range(R, 0.3, 1.1), 0, 7); ctx.fill();
  }
  ctx.lineWidth = w0; ctx.beginPath(); ctx.moveTo(px, py);
  for (let i = 1; t < T && i < 400000; i++) {
    const dt = step * unit, [nx, ny] = H(t + dt), vx = (nx - hx) / dt, vy = (ny - hy) / dt;
    const V = Math.hypot(vx, vy), phi = Math.atan2(-vy, -vx);
    const f = (r, psi, th) => { const d = th - psi; return [Math.cos(d) + V * Math.cos(psi - phi), (Math.sin(d) - V * Math.sin(psi - phi)) / Math.max(r, 0.02), kappa(r, d)]; };
    const k1 = f(r, psi, theta), k2 = f(r + k1[0] * step / 2, psi + k1[1] * step / 2, theta + k1[2] * step / 2);
    r = Math.max(0.01, r + k2[0] * step); psi += k2[1] * step; theta += k2[2] * step;
    px += Math.cos(theta) * step * unit; py += Math.sin(theta) * step * unit;
    ctx.lineTo(px, py);
    hx = nx; hy = ny; t += dt;
    if (i % 12 === 0) { ctx.stroke(); const left = Math.max(0, 1 - t / (T * fill)); ctx.lineWidth = Math.max(0.3, w0 * (0.3 + 0.7 * left)); ctx.beginPath(); ctx.moveTo(px, py); }
  }
  ctx.stroke();
}

function paint() {
  const canvas = document.getElementById('c'), d = devicePixelRatio || 1;
  const css = Math.floor(Math.min(innerWidth, innerHeight)), N = Math.round(css * d);
  canvas.width = canvas.height = N; canvas.style.width = canvas.style.height = css + 'px';
  const ctx = canvas.getContext('2d'), R = rng(p.seed);
  ctx.fillStyle = pal.ground; ctx.fillRect(0, 0, N, N);
  const plan = [];
  for (let i = 0; i < p.heavy; i++) plan.push([3.2, 0]);
  for (let i = 0; i < p.medium; i++) plan.push([1.2, 1 + (i % 3)]);
  for (let i = 0; i < p.fine; i++) plan.push([0.35, i % 4]);
  if (p.order === 'fine-first') plan.reverse(); else if (p.order === 'mixed') plan.sort(() => R() - 0.5);
  for (const [weight, k] of plan) pourOne(ctx, N, R, pal.inks[k % pal.inks.length], weight);
  // signed low right, small, in the last ink at a whisper
  ctx.font = `${10 * d}px system-ui, -apple-system, "Segoe UI", sans-serif`; ctx.textAlign = 'right';
  ctx.globalAlpha = 0.55; ctx.fillStyle = pal.inks[0] === '#e9e6de' ? '#8a8a86' : '#6f6a62';
  ctx.fillText('Claude Opus 5.5, 2026', N - 14 * d, N - 12 * d); ctx.globalAlpha = 1;
  window.drawn = true;
}
paint();
let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(paint, 300); });
