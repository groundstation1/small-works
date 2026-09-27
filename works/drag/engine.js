// Drag: the engine, frozen as it was when these plates were found (lab/drag.js).

function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
const range = (R, a, b) => a + (b - a) * R();

const PIGMENTS = [
  [0.89, 0.0, 0.13], [1.0, 0.96, 0.0], [0.07, 0.04, 0.56], [0.07, 0.21, 0.14], [0.96, 0.96, 0.94],
  [0.14, 0.13, 0.12], [0.54, 0.2, 0.14], [0.8, 0.62, 0.02], [0.89, 0.15, 0.21], [0.16, 0.32, 0.75],
  [0.33, 0.41, 0.47], [0.98, 0.85, 0.37], [0.25, 0.51, 0.43], [0.79, 0.12, 0.48],
];
const DIGITAL = [[1, 0, 1], [0, 1, 0], [0, 0, 1], [0, 1, 1], [1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 1]];

let FORCE_KIND = null;                         // explorer override: ?kind=mono
function generate(seed) {
  const R = rng(seed * 7919 + 13);
  let kind = pick(R, ['pigment', 'pigment', 'pigment', 'digital', 'mono', 'two']);
  if (FORCE_KIND) kind = FORCE_KIND;
  let pal;
  if (kind === 'pigment') pal = Array.from({ length: 3 + Math.floor(R() * 4) }, () => pick(R, PIGMENTS));
  else if (kind === 'digital') pal = Array.from({ length: 3 + Math.floor(R() * 3) }, () => pick(R, DIGITAL));
  else if (kind === 'mono') pal = [[0, 0, 0], [1, 1, 1], [0.5, 0.5, 0.5], [0.15, 0.15, 0.15], [0.85, 0.85, 0.85]];
  else pal = [pick(R, PIGMENTS), pick(R, PIGMENTS)];
  const vertical = R();
  const n = 4 + Math.floor(R() * 13);
  const layers = [];
  for (let k = 0; k < n; k++) layers.push(newLayer(R, pal, vertical));
  return { bg: pick(R, pal).slice(), pal, vertical, layers };
}

function newLayer(R, pal, vertical) {
  const full = R() < 0.55;
  const a = full ? 0 : range(R, -0.1, 0.8);
  const s = R() < 0.5 ? 0 : range(R, 0, 0.7);
  return {
    dir: R() < vertical ? pick(R, ['down', 'up']) : pick(R, ['right', 'left']),
    a, b: full ? 1 : Math.min(1.1, a + range(R, 0.1, 0.9)),
    s, e: R() < 0.5 ? 1 : Math.min(1, s + range(R, 0.15, 0.9)),
    load: R() < 0.3 ? null : Array.from({ length: 1 + Math.floor(R() * 3) }, () => pick(R, pal).slice()),
    K: Math.pow(R(), 1.5), D: range(R, 0.05, 1),
    press: range(R, 0.4, 1.2), colVar: range(R, 0, 0.8), colFreq: Math.floor(range(R, 5, 300)),
    skip: range(R, 0, 0.8), skipFreq: range(R, 1, 40),
    chatter: R() < 0.3 ? range(R, 0, 0.6) : 0, chatterFreq: range(R, 20, 200),
    blend: pick(R, ['mix', 'mix', 'mix', 'mix', 'mix', 'mix', 'mul', 'screen', 'diff', 'add']),
    nseed: Math.floor(R() * 1e9),
  };
}

function mutate(prog, mseed) {
  const R = rng(mseed * 104729 + 7);
  const p = JSON.parse(JSON.stringify(prog));
  const times = 1 + Math.floor(R() * 3);
  for (let t = 0; t < times; t++) {
    const L = pick(R, p.layers), what = R();
    if (what < 0.35) {                                         // nudge the numbers of one pass
      for (const key of ['K', 'D', 'press', 'colVar', 'skip', 'chatter', 'a', 'b', 's', 'e'])
        if (R() < 0.4) L[key] = Math.max(0, L[key] * range(R, 0.7, 1.3) + range(R, -0.05, 0.05));
      L.colFreq = Math.max(1, Math.floor(L.colFreq * range(R, 0.5, 2)));
    } else if (what < 0.5) L.load = R() < 0.2 ? null : [pick(R, p.pal).slice(), ...(R() < 0.5 ? [pick(R, p.pal).slice()] : [])];
    else if (what < 0.6) L.dir = pick(R, ['down', 'up', 'right', 'left']);
    else if (what < 0.7) L.blend = pick(R, ['mix', 'mul', 'screen', 'diff', 'add']);
    else if (what < 0.82) p.layers.push(newLayer(R, p.pal, p.vertical));
    else if (what < 0.9 && p.layers.length > 2) p.layers.splice(Math.floor(R() * p.layers.length), 1);
    else { L.nseed = Math.floor(R() * 1e9); }                 // same pass, different blade
  }
  return p;
}

// "202m.4" = seed 202 with a mono palette, then mutation 4; "t" = two pigments, "p" = pigments.
function fromChain(chain) {
  const raw = String(chain).split('.');
  const kinds = { m: 'mono', t: 'two', p: 'pigment', d: 'digital' };
  const suffix = raw[0].match(/[a-z]$/);
  const saved = FORCE_KIND;
  if (suffix) FORCE_KIND = kinds[suffix[0]];
  const parts = [parseInt(raw[0], 10), ...raw.slice(1).map(Number)];
  let p = generate(parts[0]);
  FORCE_KIND = saved;
  for (const m of parts.slice(1)) p = mutate(p, m);
  return p;
}

function noise1(R, freq) {
  const v = Array.from({ length: Math.ceil(freq) + 3 }, () => R() * 2 - 1);
  return u => {
    const x = u * freq, i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
    const a = v[((i % v.length) + v.length) % v.length], b = v[(((i + 1) % v.length) + v.length) % v.length];
    return a + (b - a) * s;
  };
}

// ---------- the drag ----------
function render(prog, N) {
  const img = new Float32Array(N * N * 3);
  for (let i = 0; i < N * N; i++) { img[i * 3] = prog.bg[0]; img[i * 3 + 1] = prog.bg[1]; img[i * 3 + 2] = prog.bg[2]; }
  for (const L of prog.layers) sweep(img, N, L);
  return img;
}

function sweep(img, N, L) {
  const R = rng(L.nseed);
  const colN = noise1(R, L.colFreq), skipN = noise1(R, L.skipFreq);
  const vert = L.dir === 'down' || L.dir === 'up', rev = L.dir === 'up' || L.dir === 'left';
  const A0 = Math.max(0, Math.floor(L.a * N)), A1 = Math.min(N, Math.ceil(L.b * N));
  const S0 = Math.floor(Math.min(L.s, L.e) * N), S1 = Math.floor(Math.max(L.s, L.e) * N);
  const edge = Math.max(1, (A1 - A0) * 0.02);
  const bc = [0, 0, 0];
  for (let i = A0; i < A1; i++) {
    const u = (i - A0) / Math.max(1, A1 - A0);
    const taper = Math.min(1, (i - A0) / edge, (A1 - 1 - i) / edge);
    const col = L.colVar * colN(i / 256);              // nicks in the blade are a fixed size in pixels
    const first = rev ? S1 - 1 : S0;
    const idx0 = (vert ? first * N + i : i * N + first) * 3;
    if (L.load) {
      const q = u * (L.load.length - 1), k = Math.floor(q), f = q - k, c0 = L.load[k], c1 = L.load[Math.min(k + 1, L.load.length - 1)];
      bc[0] = c0[0] + (c1[0] - c0[0]) * f; bc[1] = c0[1] + (c1[1] - c0[1]) * f; bc[2] = c0[2] + (c1[2] - c0[2]) * f;
    } else { bc[0] = img[idx0]; bc[1] = img[idx0 + 1]; bc[2] = img[idx0 + 2]; }
    for (let t = S0; t < S1; t++) {
      const j = rev ? S1 - 1 - (t - S0) : t;
      const tt = (t - S0) / N;
      let press = (L.press + col + L.skip * skipN(tt) + L.chatter * Math.sin(tt * L.chatterFreq * 6.283 + i * 0.01)) * taper;
      if (press <= 0) continue;                                 // the blade lifts here
      const D = Math.min(1, L.D * press), K = Math.min(1, L.K * press);
      const idx = (vert ? j * N + i : i * N + j) * 3;
      for (let c = 0; c < 3; c++) {
        const p = img[idx + c], b = bc[c];
        let out;
        switch (L.blend) {
          case 'mul': out = p + (p * b - p) * D; break;
          case 'screen': out = p + ((1 - (1 - p) * (1 - b)) - p) * D; break;
          case 'diff': out = p + (Math.abs(p - b) - p) * D; break;
          case 'add': out = p + b * D * 0.5; break;
          default: out = p + (b - p) * D;
        }
        img[idx + c] = out;
        bc[c] = b + (p - b) * K;
      }
    }
  }
}

