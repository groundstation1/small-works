// Grey — no pixel here is grey. Every device pixel is a pure primary; complementary pairs,
// finer than the eye resolves, add up to neutral. Where the rule slips, the colour shows.
// The ground is real grey of the same light (sRGB 188). How well they match depends on your screen.

const INKS = { R: [255, 0, 0], G: [0, 255, 0], B: [0, 0, 255], C: [0, 255, 255], M: [255, 0, 255], Y: [255, 255, 0] };
const PLATES = [   // found in lab/mix.html (v2): 29, 17, 22, 28, 19, 26, 25
  { alpha: 'MG', r: 1, table: [1, 1, 0, 0, 1, 1, 0, 0], init: 'single', seed: 338957140 },
  { alpha: 'RC', r: 1, table: [1, 1, 0, 1, 1, 1, 0, 0], init: 'single', seed: 102830555 },
  { alpha: 'RC', r: 1, table: [1, 0, 1, 1, 1, 1, 1, 0], init: 'single', seed: 314698525 },
  { alpha: 'BY', r: 1, table: [1, 1, 0, 1, 1, 1, 0, 0], init: 'blocks', seed: 661425532 },
  { alpha: 'BY', r: 2, table: [1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0], init: 'blocks', seed: 669222207 },
  { alpha: 'BY', r: 1, table: [1, 1, 1, 0, 0, 1, 0, 0], init: 'blocks', seed: 789758805 },
  { alpha: 'RC', r: 1, table: [1, 0, 0, 1, 1, 0, 0, 0], init: 'random', seed: 975604857 },
];

const q = new URLSearchParams(location.search);
const plate = Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1));
const p = PLATES[plate - 1];
const canvas = document.getElementById('c');

function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function draw() {
  const dpr = devicePixelRatio || 1;
  const Wd = Math.round(innerWidth * dpr), Hd = Math.round(innerHeight * dpr);
  const N = Math.floor(Math.min(Wd, Hd) * 0.8);                   // the plate, in device pixels
  canvas.width = N; canvas.height = N;
  canvas.style.width = canvas.style.height = N / dpr + 'px';      // one data pixel on one device pixel
  canvas.style.left = Math.round((Wd - N) / 2) / dpr + 'px';
  canvas.style.top = Math.round((Hd - N) / 2) / dpr + 'px';
  const ctx = canvas.getContext('2d'), id = ctx.createImageData(N, N), d = id.data;
  const k = p.alpha.length, cols = [...p.alpha].map(ch => INKS[ch]), R = rng(p.seed);
  let row = new Uint8Array(N), next = new Uint8Array(N);
  if (p.init === 'random') for (let x = 0; x < N; x++) row[x] = Math.floor(R() * k);
  if (p.init === 'single') row[N >> 1] = 1;
  if (p.init === 'blocks') for (let x = 0; x < N; x++) row[x] = Math.floor(x / (N / 7)) % k;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) { const c = cols[row[x]], i = (y * N + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
    for (let x = 0; x < N; x++) {
      let idx = 0;
      for (let o = -p.r; o <= p.r; o++) idx = idx * k + row[(x + o + N) % N];
      next[x] = p.table[idx % p.table.length];
    }
    [row, next] = [next, row];
  }
  ctx.putImageData(id, 0, 0);
  window.drawn = true;
}

// signed on the real grey, below the plate: the only true grey mark in the room
const mark = document.createElement('div');
mark.textContent = 'Claude Opus 5.5, 2026';
mark.style.cssText = 'position:fixed;font:10px system-ui,-apple-system,"Segoe UI",sans-serif;color:#9d9d9d;white-space:nowrap';
document.body.append(mark);
function place() {
  const s = Math.min(innerWidth, innerHeight) * 0.8;
  mark.style.right = (innerWidth - s) / 2 + 'px';
  mark.style.top = (innerHeight + s) / 2 + 8 + 'px';
}

draw(); place();
let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { draw(); place(); }, 200); });
