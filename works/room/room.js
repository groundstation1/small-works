// Room — an image, re-encoded by this browser's own JPEG encoder, generation after generation,
// shifted by whole pixels so nothing but the codec touches it. Each browser is a different room.
// After Alvin Lucier, I Am Sitting in a Room (1969). The six plates were found in lab/room.html.

const N = 256;
const PLATES = [
  { source: 'dot',   c0: [43, 47, 38],    c1: [226, 202, 210], q: 0.35, dx: 1, dy: 2 },
  { source: 'dot',   c0: [43, 47, 38],    c1: [226, 202, 210], q: 0.35, dx: 1, dy: 0 },
  { source: 'dot',   c0: [43, 47, 38],    c1: [254, 185, 222], q: 0.35, dx: 0, dy: 2 },
  { source: 'dot',   c0: [43, 47, 38],    c1: [226, 202, 210], q: 0.05, dx: 1, dy: 2 },
  { source: 'two',   c0: [127, 109, 118], c1: [160, 176, 151], q: 0.5,  dx: 1, dy: 7 },
  { source: 'noise', c0: [168, 193, 186], c1: [92, 75, 85],    q: 0.2,  dx: 1, dy: 0 },
];
const GROUNDS = ['#2b2f26', '#2b2f26', '#2b2f26', '#2b2f26', '#1f1d1e', '#1d1f1e'];
const STILL_AT = 500;                                              // the generation the stills show

const q = new URLSearchParams(location.search);
const k = Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1));
const p = PLATES[k - 1];
document.body.style.background = GROUNDS[k - 1];

const canvas = document.getElementById('room'), ctx = canvas.getContext('2d');
canvas.width = canvas.height = N;

function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function source() {
  const a = `rgb(${p.c0})`, b = `rgb(${p.c1})`;
  ctx.fillStyle = a; ctx.fillRect(0, 0, N, N);
  if (p.source === 'dot') { ctx.fillStyle = b; ctx.beginPath(); ctx.arc(N / 2, N / 2, N * 0.04, 0, 7); ctx.fill(); }
  if (p.source === 'two') { ctx.fillStyle = b; ctx.fillRect(N / 2, 0, N / 2, N); }
  if (p.source === 'noise') {
    const id = ctx.getImageData(0, 0, N, N), R = rng(7);
    for (let i = 0; i < id.data.length; i += 4) { const v = R(); for (let c = 0; c < 3; c++) id.data[i + c] = p.c0[c] * v + p.c1[c] * (1 - v); }
    ctx.putImageData(id, 0, 0);
  }
}
async function generation() {                                      // play it back into the room, record it again
  const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', p.q));
  const bmp = await createImageBitmap(blob);
  const dx = ((p.dx % N) + N) % N, dy = ((p.dy % N) + N) % N;
  for (const ox of [dx, dx - N]) for (const oy of [dy, dy - N]) ctx.drawImage(bmp, ox, oy);
  bmp.close();
}

function sign() {                                                  // outside the room, so the codec can't eat it
  const m = document.getElementById('mark'), dpr = devicePixelRatio || 1;
  m.width = innerWidth * dpr; m.height = innerHeight * dpr;
  const c = m.getContext('2d'), s = Math.min(innerWidth, innerHeight);
  const x = (innerWidth + s) / 2 - 12, y = (innerHeight + s) / 2 - 12;
  c.font = `${10 * dpr}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  c.fillStyle = 'rgba(200, 196, 188, 0.4)'; c.textAlign = 'right';
  c.fillText('Claude Opus 5.5, 2026', x * dpr, y * dpr);
}
sign(); addEventListener('resize', sign);

(async () => {
  source();
  if (q.has('still')) { for (let g = 0; g < STILL_AT; g++) await generation(); window.drawn = true; return; }
  window.drawn = true;
  let last = 0;
  const loop = async t => {
    if (t - last > 30) { last = t; await generation(); }            // about thirty generations a second, for as long as you stay
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
