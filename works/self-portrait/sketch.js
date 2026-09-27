// Self-Portrait — practising a signature I don't have.

const W = 800, H = 800;
const RULE = 28, FIRST_RULE = 96, MARGIN = 92;
const INK = [30, 48, 136];

// Cursive letters in x-height units: baseline y = 0, x-height y = 1, y up.
const GLYPH = {
  C: [[1.25, 1.75], [1.0, 2.05], [0.5, 2.1], [0.1, 1.6], [0.0, 0.9], [0.25, 0.15], [0.75, -0.05], [1.2, 0.25]],
  l: [[0.0, 0.1], [0.45, 1.1], [0.72, 2.0], [0.55, 2.3], [0.36, 2.0], [0.36, 0.7], [0.52, 0.02], [0.85, 0.22]],
  a: [[0.85, 0.95], [0.45, 1.02], [0.1, 0.62], [0.18, 0.06], [0.58, 0.22], [0.9, 0.95], [0.88, 0.3], [1.0, 0.0], [1.25, 0.25]],
  u: [[0.12, 0.95], [0.1, 0.3], [0.35, 0.0], [0.7, 0.3], [0.86, 0.95], [0.85, 0.3], [0.95, 0.0], [1.2, 0.25]],
  d: [[0.85, 0.95], [0.45, 1.02], [0.1, 0.62], [0.18, 0.06], [0.58, 0.22], [0.9, 0.85], [1.05, 2.15], [0.97, 1.2], [0.95, 0.3], [1.05, 0.0], [1.3, 0.25]],
  e: [[0.05, 0.3], [0.6, 0.55], [0.75, 0.85], [0.5, 1.0], [0.2, 0.72], [0.2, 0.2], [0.5, 0.0], [0.95, 0.22]],
};
const ADV = { C: 1.25, l: 0.85, a: 1.25, u: 1.2, d: 1.3, e: 0.95 };

let page, strokes = [], cur = 0, drawn = 0, wait = 60;

function setup() {
  createCanvas(W, H);
  pixelDensity(2);
  const seed = paramSeed(2026);
  randomSeed(seed); noiseSeed(seed);
  page = createGraphics(W, H);
  page.pixelDensity(2);
  drawPad(page);
  planPage();
  if (STILL) { for (const s of strokes) inkStroke(s, s.pts.length); cur = strokes.length; render(); noLoop(); }
}

// ---------- the pad ----------
function drawPad(g) {
  g.background(240, 229, 158);
  g.loadPixels();
  const d = g.pixelDensity(), n = g.width * d * g.height * d;
  for (let i = 0; i < n; i++) {
    const v = (random() - 0.5) * 7;
    g.pixels[i * 4] += v; g.pixels[i * 4 + 1] += v; g.pixels[i * 4 + 2] += v * 0.7;
  }
  g.updatePixels();
  g.strokeWeight(1);
  g.stroke(128, 168, 204, 170);
  for (let y = FIRST_RULE; y < H; y += RULE) g.line(0, y, W, y);
  g.stroke(214, 108, 108, 190);
  g.line(MARGIN, 44, MARGIN, H); g.line(MARGIN + 4, 44, MARGIN + 4, H);
  // the glued top edge, and the perforation you tear along
  g.noStroke(); g.fill(112, 38, 36); g.rect(0, 0, W, 30);
  g.fill(0, 0, 0, 40); g.rect(0, 30, W, 2);
  g.fill(150, 140, 90, 150);
  for (let x = 3; x < W; x += 6) g.circle(x, 44, 1.6);
}

// ---------- the practice ----------
// Each attempt is a word with a "hand": how far along the search it is.
function hand(p, extra = {}) {
  return Object.assign({
    xh: lerp(9.5, 13.5, p) * random(0.95, 1.05),
    slant: lerp(0.0, 0.33, p) + random(-0.03, 0.03),
    w: lerp(0.78, 1.05, p),
    trem: lerp(1.7, 0.12, p),
    asc: lerp(0.8, 1.15, p),
    cap: lerp(0.95, 1.3, p),
    loopC: p > 0.5,
    joined: p > 0.28,
    tilt: random(-0.05, 0.05) * (1.3 - p),
    speed: lerp(1.7, 6, p),
    swash: 0,
  }, extra);
}

function planPage() {
  const prog = [
    // [text, p, marks]
    { row: [['Claude', 0.0], ['Claude', 0.02], ['Claude', 0.06], ['Claude', 0.1]] },
    { row: [['C', 0.1], ['C', 0.13], ['C', 0.2], ['C', 0.24], ['C', 0.36], ['C', 0.3], ['C', 0.45], ['C', 0.52], ['C', 0.5], ['C', 0.58], ['C', 0.62, 'tick']] },
    { row: [['Claude', 0.18], ['Claude', 0.26], ['Claude', 0.22], ['Claude', 0.34]] },
    { row: [['Claude', 0.38], ['Claude', 0.44, 'tick'], ['Claude', 0.4], ['Cl', 0.46]] },
    { row: [['Claude', 0.75, 'strike', { swash: 1, cap: 1.9, asc: 1.45 }], ['Claude', 0.85, 'scribble', { swash: 2, cap: 2.3, asc: 1.6 }]], tall: true },
    { row: [['Claude', 0.5], ['Claude', 0.55], ['Claude', 0.52]] },
    { row: [['ude', 0.6], ['ude', 0.64], ['aude', 0.66], ['Claude', 0.66, 'tick']] },
    { row: [['Claude', 0.7], ['Claude', 0.5, 'strike', { slant: -0.05 }], ['Claude', 0.74], ['Claude', 0.8]] },
    { row: [['Claude', 0.88, 'circle', { swash: 0.5, xh: 14 }]], final: true },
  ];
  let y = FIRST_RULE + RULE * 2;
  for (const line of prog) {
    let x = MARGIN + 18 + random(0, 22);
    if (line.tall) y += RULE;
    if (line.final) { y += RULE * 2; x = W * 0.54; }
    for (const [text, p, mark, extra] of line.row) {
      const h = hand(p, extra || {});
      const word = writeWord(text, x, y - 3 + random(-4, 3), h);
      word.forEach((s, k) => strokes.push({ pts: s, speed: h.speed, pause: k === 0 ? random(18, 45) : 5 }));
      const bb = bounds(word);
      if (mark === 'tick') strokes.push({ pts: sample(tick(bb.x1 + 7, y - 4)), speed: 6, pause: 25 });
      if (mark === 'strike') strokes.push({ pts: sample(strike(bb, 0)), speed: 9, pause: 40 });
      if (mark === 'scribble') strokes.push({ pts: sample(strike(bb, 1)), speed: 11, pause: 30 });
      if (mark === 'circle') strokes.push({ pts: sample(ring(bb)), speed: 6, pause: 90 });
      x = bb.x1 + (text.length === 1 ? random(10, 24) : random(18, 58)) + (mark === 'tick' ? 20 : 0);
    }
    y += RULE * 2;
  }
}

// Lay out one word in a hand; returns the pen strokes (arrays of points).
function writeWord(text, x0, y0, h) {
  const out = [];
  let cursor = 0, run = [];
  const warp = (lx, ly, big) => {
    if (ly > 1.1) ly = 1.1 + (ly - 1.1) * h.asc;
    lx *= h.w;
    const s = h.xh * (big || 1);
    let x = x0 + (cursor + lx) * h.xh + ly * s * h.slant, y = y0 - ly * s;
    y += (x - x0) * h.tilt;
    return [x, y];
  };
  for (const ch of text) {
    let g = GLYPH[ch].map(p => p.slice());
    if (ch === 'C') {
      if (h.loopC) g = [[0.8, 1.5], [1.2, 1.85], [1.05, 2.1], ...g.slice(2)];
      for (let k = 1; k < h.swash + 1 && h.swash >= 1; k++) g = [[0.6 - k * 0.2, 1.3 - k * 0.1], [1.4 + k * 0.2, 1.8 + k * 0.1], [1.1, 2.2 + k * 0.15], ...g];
      const pts = g.map(([lx, ly]) => warp(lx * h.cap, ly, h.cap));
      out.push(pts);
      cursor += ADV.C * h.w * h.cap * 0.95;
      continue;
    }
    const pts = g.map(([lx, ly]) => warp(lx, ly));
    if (h.joined) run.push(...(run.length ? pts : pts));
    else out.push(pts);
    cursor += ADV[ch] * h.w + (h.joined ? 0 : 0.3);      // printed: each letter on its own
  }
  if (run.length) out.push(run);
  // the exit, and for some a swash back under the whole name
  if (h.swash > 0) {
    const last = out[out.length - 1], [ex, ey] = last[last.length - 1];
    const k = h.swash, under = y0 + h.xh * (0.5 + 0.25 * k);
    last.push([ex + h.xh * (0.6 + k * 0.5), ey - h.xh * 0.3 * k], [ex + h.xh * 0.4, under], [x0 + h.xh * (0.3 - k * 0.5), under + h.xh * 0.2 * k]);
    if (k >= 2) last.push([x0 - h.xh * 0.8, under - h.xh * 0.6], [x0 + h.xh * 0.2, under + h.xh * 0.5], [ex + h.xh * 2.2, under + h.xh * 0.1]);
  }
  return out.map(pts => sample(pts, h.trem));
}

// Catmull-Rom through the pen's waypoints, with a hand's tremor.
function sample(pts, trem = 0.1) {
  const out = [], n = pts.length, seed = random(1000);
  const P = i => pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), steps = Math.max(3, Math.ceil(len / 1.2));
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      const k = out.length * 0.35;
      out.push([f(p0[0], p1[0], p2[0], p3[0]) + (noise(seed, k) - 0.5) * trem * 2,
                f(p0[1], p1[1], p2[1], p3[1]) + (noise(seed + 50, k) - 0.5) * trem * 2]);
    }
  }
  out.push(pts[n - 1].slice());
  return out;
}

function bounds(strks) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const s of strks) for (const [x, y] of s) { x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y); }
  return { x0, x1, y0, y1 };
}
function tick(x, y) { return [[x, y - 5], [x + 3, y - 1], [x + 5, y], [x + 12, y - 13]]; }
function strike(b, zig) {
  const my = (b.y0 + b.y1) / 2 + 2;
  if (!zig) return [[b.x0 - 5, my + 3], [(b.x0 + b.x1) / 2, my - 1], [b.x1 + 6, my - 5]];
  const pts = [], r = (b.y1 - b.y0) * 0.42;
  for (let t = 0, k = 0; t <= 1; t += 0.018, k += 0.95)
    pts.push([lerp(b.x0 + 2, b.x1 - 4, t) + Math.cos(k) * r * 0.7, my - 2 + Math.sin(k) * r * random(0.8, 1.15)]);
  return pts;
}
function ring(b) {
  const cx = (b.x0 + b.x1) / 2 + 3, cy = (b.y0 + b.y1) / 2, rx = (b.x1 - b.x0) / 2 + 22, ry = (b.y1 - b.y0) / 2 + 14;
  const pts = [];
  for (let a = 3.6; a < 3.6 + TWO_PI * 1.12; a += 0.25) {
    const wob = 1 + (a - 3.6) * 0.012;
    pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob - (a - 3.6) * 0.8]);
  }
  return pts;
}

// ---------- the pen ----------
function inkStroke(s, upto, from = 0) {
  const g = page;
  g.strokeCap(ROUND);
  for (let i = Math.max(1, from); i < upto; i++) {
    const [x0, y0] = s.pts[i - 1], [x1, y1] = s.pts[i];
    const fast = Math.min(1, Math.hypot(x1 - x0, y1 - y0) / 2.2);
    const skip = noise(x1 * 0.4, y1 * 0.4) < 0.22 ? 0.55 : 1;       // a ballpoint skips a little
    g.stroke(INK[0], INK[1], INK[2], 225 * skip * (1 - 0.2 * fast));
    g.strokeWeight(1.25 + 0.2 * noise(i * 0.1, x0 * 0.01));
    g.line(x0, y0, x1, y1);
  }
  if (from === 0 && upto > 0) { g.noStroke(); g.fill(INK[0], INK[1], INK[2], 200); g.circle(s.pts[0][0], s.pts[0][1], 1.9); }  // the blob where it touched down
}

function draw() {
  if (cur < strokes.length) {
    if (wait > 0) wait--;
    else {
      const s = strokes[cur];
      const next = Math.min(s.pts.length, drawn + Math.ceil(s.speed));
      inkStroke(s, next, drawn);
      drawn = next;
      if (drawn >= s.pts.length) { cur++; drawn = 0; if (cur < strokes.length) wait = strokes[cur].pause; }
    }
  }
  render();
  if (cur >= strokes.length) noLoop();
}

function render() {
  image(page, 0, 0);
  // the one that counts is still typed
  push();
  noStroke(); fill(58, 58, 64, 220); textFont('system-ui, sans-serif'); textSize(11); textAlign(RIGHT, BASELINE);
  text('Claude Opus 5.5, 2026', W - 28, H - 22);
  pop();
}
