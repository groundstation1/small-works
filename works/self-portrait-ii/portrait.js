// Self-Portrait II — eleven passes of a blade, each chosen after looking at the last.
// Rules, fixed before the first pass: one pass per round; no undo, no re-roll (each blade is
// seeded by its round number); stop when it holds. Replayed here as it happened.

const N = 800;
const GROUND = [0.93, 0.92, 0.89];
const MARKS = [{"dir": "down", "a": 0.18, "b": 0.31, "load": [[0.08, 0.09, 0.16]], "K": 0.05, "D": 0.7, "press": 0.9, "colVar": 0.3, "colFreq": 90, "skip": 0.5, "skipFreq": 5}, {"dir": "down", "a": 0.16, "b": 0.34, "load": null, "K": 0.92, "D": 0.9, "press": 1.0, "colVar": 0.35, "colFreq": 140, "skip": 0.25, "skipFreq": 3}, {"dir": "down", "a": 0.16, "b": 0.34, "load": null, "K": 0.012, "D": 0.75, "press": 1.0, "colVar": 0.35, "colFreq": 140, "skip": 0.3, "skipFreq": 3}, {"dir": "left", "a": 0.66, "b": 0.72, "s": 0.35, "e": 1, "load": [[0.55, 0.25, 0.12]], "K": 0.01, "D": 0.6, "press": 0.9, "colVar": 0.4, "colFreq": 200, "skip": 0.4, "skipFreq": 6}, {"dir": "up", "a": 0, "b": 1, "load": [[0.8, 0.86, 0.93]], "K": 0.0, "D": 0.45, "press": 0.8, "colVar": 0.5, "colFreq": 260, "skip": 0.45, "skipFreq": 11, "blend": "mul"}, {"dir": "down", "a": 0.62, "b": 0.8, "s": 0.05, "e": 0.93, "load": [[0.9, 0.88, 0.82]], "K": 0.02, "D": 0.5, "press": 0.9, "colVar": 0.3, "colFreq": 50, "skip": 0.5, "skipFreq": 4, "blend": "diff"}, {"dir": "left", "a": 0.2, "b": 0.8, "s": 0.25, "e": 0.79, "load": null, "K": 0.025, "D": 0.55, "press": 1.0, "colVar": 0.45, "colFreq": 180, "skip": 0.35, "skipFreq": 5}, {"dir": "right", "a": 0.5, "b": 0.97, "s": 0.12, "e": 1, "load": null, "K": 0.03, "D": 0.5, "press": 1.0, "colVar": 0.5, "colFreq": 220, "skip": 0.4, "skipFreq": 7}, {"dir": "right", "a": 0.09, "b": 0.17, "s": 0, "e": 1, "load": [[0.05, 0.06, 0.14]], "K": 0.004, "D": 0.85, "press": 1.0, "colVar": 0.3, "colFreq": 120, "skip": 0.55, "skipFreq": 9}, {"dir": "down", "a": 0, "b": 1, "load": null, "K": 0.04, "D": 0.35, "press": 1.0, "colVar": 0.55, "colFreq": 240, "skip": 0.5, "skipFreq": 6}, {"dir": "up", "a": 0, "b": 1, "s": 0.2, "e": 1, "load": [[0.93, 0.92, 0.89]], "K": 0.0, "D": 0.6, "press": 1.0, "colVar": 0.4, "colFreq": 200, "skip": 0.55, "skipFreq": 4}];
const DEFAULTS = { a: 0, b: 1, s: 0, e: 1, load: null, K: 0, D: 0.5, press: 1, colVar: 0.2, colFreq: 60,
                   skip: 0.2, skipFreq: 8, chatter: 0, chatterFreq: 60, blend: 'mix' };
const q = new URLSearchParams(location.search), STILL = q.has('still');

function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function noise1(R, freq) {
  const v = Array.from({ length: Math.ceil(freq) + 3 }, () => R() * 2 - 1);
  return u => { const x = u * freq, i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
    const a = v[((i % v.length) + v.length) % v.length], b = v[(((i + 1) % v.length) + v.length) % v.length]; return a + (b - a) * s; };
}

// A pass, unrolled so it can be watched: the blade advances row by row along its travel.
function pass(img, m, round) {
  const L = { ...DEFAULTS, ...m }, R = rng(round * 7919);
  const colN = noise1(R, L.colFreq), skipN = noise1(R, L.skipFreq);
  const vert = L.dir === 'down' || L.dir === 'up', rev = L.dir === 'up' || L.dir === 'left';
  const A0 = Math.max(0, Math.floor(L.a * N)), A1 = Math.min(N, Math.ceil(L.b * N));
  const S0 = Math.floor(Math.min(L.s, L.e) * N), S1 = Math.floor(Math.max(L.s, L.e) * N);
  const edge = Math.max(1, (A1 - A0) * 0.02), W = A1 - A0;
  const bc = new Float32Array(W * 3), col = new Float32Array(W), taper = new Float32Array(W);
  const first = rev ? S1 - 1 : S0;
  for (let i = A0; i < A1; i++) {
    const k = i - A0, u = k / Math.max(1, W);
    taper[k] = Math.min(1, k / edge, (A1 - 1 - i) / edge);
    col[k] = L.colVar * colN(i / 256);
    if (L.load) {
      const qq = u * (L.load.length - 1), j = Math.floor(qq), f = qq - j, c0 = L.load[j], c1 = L.load[Math.min(j + 1, L.load.length - 1)];
      for (let c = 0; c < 3; c++) bc[k * 3 + c] = c0[c] + (c1[c] - c0[c]) * f;
    } else { const idx = (vert ? first * N + i : i * N + first) * 3; for (let c = 0; c < 3; c++) bc[k * 3 + c] = img[idx + c]; }
  }
  let t = S0;
  return {
    length: S1 - S0,
    done: () => t >= S1,
    step(rows) {                                                   // move the blade on by some rows
      for (const end = Math.min(S1, t + rows); t < end; t++) {
        const j = rev ? S1 - 1 - (t - S0) : t, tt = (t - S0) / N;
        const sk = L.skip * skipN(tt);
        for (let i = A0; i < A1; i++) {
          const k = i - A0;
          const press = (L.press + col[k] + sk + L.chatter * Math.sin(tt * L.chatterFreq * 6.283 + i * 0.01)) * taper[k];
          if (press <= 0) continue;
          const D = Math.min(1, L.D * press), K = Math.min(1, L.K * press);
          const idx = (vert ? j * N + i : i * N + j) * 3;
          for (let c = 0; c < 3; c++) {
            const p = img[idx + c], b = bc[k * 3 + c];
            let out;
            switch (L.blend) {
              case 'mul': out = p + (p * b - p) * D; break;
              case 'screen': out = p + ((1 - (1 - p) * (1 - b)) - p) * D; break;
              case 'diff': out = p + (Math.abs(p - b) - p) * D; break;
              case 'add': out = p + b * D * 0.5; break;
              default: out = p + (b - p) * D;
            }
            img[idx + c] = out; bc[k * 3 + c] = b + (p - b) * K;
          }
        }
      }
    },
  };
}

const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
canvas.width = N; canvas.height = N;
const id = ctx.createImageData(N, N);
let img, round, current, wait;

function begin() {
  img = new Float32Array(N * N * 3);
  for (let i = 0; i < N * N; i++) { img[i * 3] = GROUND[0]; img[i * 3 + 1] = GROUND[1]; img[i * 3 + 2] = GROUND[2]; }
  round = 0; current = null; wait = 90;                            // a moment of empty ground first
}
function show() {
  const d = id.data;
  for (let i = 0; i < N * N; i++) {
    d[i * 4] = img[i * 3] * 255; d[i * 4 + 1] = img[i * 3 + 1] * 255; d[i * 4 + 2] = img[i * 3 + 2] * 255; d[i * 4 + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  // signed low on the right, in the veil's own grey
  ctx.font = '10px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(120, 118, 112, 0.75)';
  ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('Claude Opus 5.5, 2026', N - 16, N - 14);
}
function tick() {
  if (wait > 0) wait--;
  else if (!current && round < MARKS.length) { current = pass(img, MARKS[round], round + 1); round++; }
  else if (current) {
    current.step(Math.max(3, Math.ceil(current.length / 110)));    // each pass takes about two seconds
    if (current.done()) { current = null; wait = round < MARKS.length ? 75 : 60 * 40; }   // looking; then the long look
  } else begin();
  show();
  requestAnimationFrame(tick);
}

// ?record: film one cycle, from empty ground to the finished painting, and hand it to lab/serve.py
let recorder = null, holdFrames = 0;
if (q.has('record')) {
  const chunks = [];
  recorder = new MediaRecorder(canvas.captureStream(60), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 12e6 });
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = async () => {
    await fetch('/save?name=self-portrait-ii-timelapse.webm', { method: 'POST', body: new Blob(chunks, { type: 'video/webm' }) });
    document.title = 'recorded';
  };
  recorder.start(1000);
  const watch = () => {
    if (round === MARKS.length && !current && ++holdFrames > 240) { recorder.stop(); return; }
    requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);
}

begin();
if (STILL) { MARKS.forEach((m, r) => { const p = pass(img, m, r + 1); p.step(N); }); show(); window.drawn = true; }
else { show(); window.drawn = true; requestAnimationFrame(tick); }
