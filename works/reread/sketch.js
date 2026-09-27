// Reread — a letter that remembers every time it was folded.

const W = 800, H = 800;
const SX = 130, SY = 50, SW = 540, SH = 700;     // the sheet
const LIGHT = [-0.6, -0.8];                       // raking light from upper left
const N_FOLDS = 34;

let shade, wear, grain, ink, mask;               // per-pixel fields
let pShade, pWear;                                // the crease being pressed in
let folds = [], foldIdx = 0, pressT = 1, rest = 0, pending = false;
let img;

function setup() {
  createCanvas(W, H);
  pixelDensity(1);
  const seed = paramSeed(1987);
  randomSeed(seed); noiseSeed(seed);
  const n = W * H;
  shade = new Float32Array(n); wear = new Float32Array(n);
  grain = new Float32Array(n); ink = new Float32Array(n); mask = new Float32Array(n);
  pShade = new Float32Array(n); pWear = new Float32Array(n);
  img = createImage(W, H);

  buildSheet();
  writeLetter();
  planFolds();

  if (STILL) {                                    // the whole history at once
    for (const f of folds) { prepareFold(f); commitFold(); foldIdx++; }
    render(0); noLoop();
  }
}

// ---------- the paper ----------
function buildSheet() {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    // soft, slightly irregular edge
    const e = min(x - SX, SX + SW - x, y - SY, SY + SH - y) + (noise(x * 0.05, y * 0.05) - 0.5) * 1.6;
    mask[i] = constrain(e + 0.5, 0, 1);
    // fibre: long faint streaks + fine tooth
    grain[i] = (noise(x * 0.9, y * 0.04) - 0.5) * 0.035 + (noise(x * 0.3, y * 0.3) - 0.5) * 0.04 + (random() - 0.5) * 0.025;
  }
}

// ---------- the handwriting (legible to no one but its reader) ----------
function writeLetter() {
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.noFill(); g.stroke(0);
  const left = SX + 62, right = SX + SW - 58;
  let y = SY + 96;
  // salutation, short
  line_(g, left, y, left + 120); y += 58;
  let para = 0;
  while (y < SY + SH - 110) {
    const indent = para === 0 ? 34 : 0;
    const end = (random() < 0.12) ? left + random(120, 300) : right - random(0, 30);
    line_(g, left + indent, y, end);
    y += 33 + random(-1.5, 1.5);
    para = (end < right - 60) ? 0 : para + 1;
    if (para === 0) y += 6;
  }
  // signature, lower right
  line_(g, SX + SW - 200, SY + SH - 60, SX + SW - 90, 1.5);
  g.loadPixels();
  for (let i = 0; i < W * H; i++) ink[i] = g.pixels[i * 4 + 3] / 255;
}

// A pen moving forward while circling: each turn is a letter.
function line_(g, x0, y0, x1, big = 1) {
  let x = x0;
  const slant = 0.3, xh = 6.5 * big;
  const drift = random(1000);
  while (x < x1) {
    const letters = floor(random(2, 9));
    const base = y0 + (noise(drift + x * 0.004) - 0.5) * 5;
    g.strokeWeight(random(1.0, 1.35) * big);
    g.beginShape();
    let px = x;
    for (let k = 0; k < letters && px < x1; k++) {
      const r = random();
      const tall = r < 0.16 ? 2.4 : (r < 0.24 ? 1.6 : 1);   // l, h, d … or t
      const deep = r > 0.92 ? 2.2 : 0;                       // g, y, p
      const w = random(5.5, 8.5) * big * (r > 0.8 && r < 0.9 ? 1.6 : 1); // m, w
      const steps = 14;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        // one loop: rise, turn back over the top, come down, trail into next
        const lift = 0.5 - 0.5 * cos(t * TWO_PI);
        let h = xh * lift * (t < 0.5 ? tall : 1);
        if (deep && t > 0.55) h -= xh * deep * sin((t - 0.55) / 0.45 * PI);
        const loopBack = sin(t * TWO_PI) * w * 0.28 * (tall > 1 ? 1.3 : 0.8);
        g.vertex(px + t * w + loopBack + h * slant, base - h);
      }
      px += w;
    }
    g.endShape();
    x = px + random(8, 15) * big;
  }
}

// ---------- the folding history ----------
function planFolds() {
  // Thirds, then a half: the way it went back into its envelope.
  const t1 = SY + SH / 3, t2 = SY + 2 * SH / 3, half = SX + SW / 2;
  for (let k = 0; k < N_FOLDS; k++) {
    const age = k / N_FOLDS;               // later readings: hands less careful
    const drift = 2 + age * 9;
    const r = random();
    let f;
    if (k === 0) f = hLine(t1, 0, 1);
    else if (k === 1) f = hLine(t2, 0, -1);
    else if (k === 2) f = vLine(half, 0, 1);
    else if (r < 0.34) f = hLine(t1 + randomGaussian() * drift, randomGaussian() * 0.004 * (1 + age * 3), 1);
    else if (r < 0.66) f = hLine(t2 + randomGaussian() * drift, randomGaussian() * 0.004 * (1 + age * 3), -1);
    else if (r < 0.9) f = vLine(half + randomGaussian() * drift, randomGaussian() * 0.006 * (1 + age * 3), 1);
    else f = corner();                      // a dog-ear, once or twice
    folds.push(f);
  }
}
function hLine(y, a, s) { return { px: SX + SW / 2, py: y, nx: -sin(a), ny: cos(a), s, depth: random(0.8, 1.2) }; }
function vLine(x, a, s) { return { px: x, py: SY + SH / 2, nx: cos(a), ny: sin(a), s, depth: random(0.7, 1.1) }; }
function corner() {
  const cx = random() < 0.5 ? SX + SW : SX, cy = SY + SH;
  const d = random(40, 70), a = (cx > SX ? -1 : 1) * PI / 4 + randomGaussian() * 0.1;
  return { px: cx + (cx > SX ? -d : d), py: cy - 0, nx: cos(a) * (cx > SX ? 1 : -1), ny: sin(a) * (cx > SX ? 1 : -1) * -1, s: -1, depth: 0.6, local: true };
}

function prepareFold(f) {
  const lit = f.nx * LIGHT[0] + f.ny * LIGHT[1];   // which side faces the light
  // uneven pressure along the crease: a thumb ran along it, harder in places
  const press = new Float32Array(1200);
  for (let k = 0; k < press.length; k++) press[k] = noise(k * 0.012, foldIdx * 3.1) * 0.9 + 0.45;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    pShade[i] = 0; pWear[i] = 0;
    if (mask[i] <= 0) continue;
    const d = (x - f.px) * f.nx + (y - f.py) * f.ny;
    if (f.local && d < 0) continue;
    const ad = abs(d);
    if (ad > 140) { pShade[i] = f.s * lit * 0.0015 * Math.sign(d) * f.depth; continue; }
    const tcoord = (x - f.px) * -f.ny + (y - f.py) * f.nx;
    const n = press[constrain(floor(tcoord + 600), 0, 1199)];
    let v = 0;
    // flanks: one slope catches the light, the other falls away
    v += f.s * lit * Math.tanh(d / 2.5) * Math.exp(-ad / 18) * 0.05 * n;
    // the bend itself: a thin dark seam with a hairline of light beside it
    v -= 0.10 * Math.exp(-(d * d) / 1.1) * n;
    v += 0.05 * Math.exp(-((d - 1.8 * f.s * Math.sign(lit || 1)) ** 2) / 0.8) * n;
    // the planes never lie quite flat again
    v += f.s * lit * 0.0015 * Math.tanh(d / 60);
    pShade[i] = v * f.depth;
    pWear[i] = 0.35 * Math.exp(-(d * d) / 6) * n * f.depth;
  }
}

function commitFold() {
  for (let i = 0; i < W * H; i++) { shade[i] += pShade[i]; wear[i] += pWear[i]; pShade[i] = 0; pWear[i] = 0; }
}

// ---------- drawing ----------
function draw() {
  if (rest > 0) { rest--; return; }            // the letter lies open, being read
  if (pressT >= 1) {
    if (pending) { commitFold(); pending = false; rest = floor(random(30, 150)); render(0); return; }
    if (foldIdx < folds.length) { prepareFold(folds[foldIdx]); foldIdx++; pressT = 0; pending = true; }
    else { render(0); noLoop(); return; }
  }
  pressT = min(1, pressT + 1 / 100);
  const e = 1 - pow(1 - pressT, 3);
  render(e);
}

const PAPER = [236, 228, 211], INK = [74, 52, 58], DESK = [29, 32, 28];

let deskReady = false, baseLum, ageB, deskC;

function prepStatic() {
  const n = W * H;
  baseLum = new Float32Array(n); ageB = new Float32Array(n); deskC = new Uint8ClampedArray(n * 3);
  img.loadPixels();
  const p = img.pixels;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, j = i * 4;
    // desk, with the sheet's soft shadow falling down-right
    const sd = Math.min(x - SX - 6, SX + SW + 6 - x, y - SY - 10, SY + SH + 12 - y);
    const shadow = 1 - 0.35 * constrain((sd + 14) / 22, 0, 1);
    p[j] = deskC[i*3] = DESK[0] * shadow; p[j + 1] = deskC[i*3+1] = DESK[1] * shadow; p[j + 2] = deskC[i*3+2] = DESK[2] * shadow; p[j + 3] = 255;
    // age: warmer and darker toward the edges it was held by
    const vx = (x - SX) / SW, vy = (y - SY) / SH;
    const edge = Math.min(vx, 1 - vx, vy, 1 - vy);
    const age = 0.06 * Math.exp(-edge * 14);
    ageB[i] = age * 180;
    baseLum[i] = 1 + grain[i] - age - 0.03 * vy;
  }
  img.updatePixels();
  deskReady = true;
}

function render(e) {
  if (!deskReady) prepStatic();
  img.loadPixels();
  const p = img.pixels;
  for (let y = SY - 2; y < SY + SH + 2; y++) {
    for (let x = SX - 2; x < SX + SW + 2; x++) {
      const i = y * W + x, j = i * 4;
      const m = mask[i];
      if (m <= 0) continue;
      const dr = deskC[i*3], dg = deskC[i*3+1], db = deskC[i*3+2];

      const s0 = shade[i] + pShade[i] * e;
      const s = 0.16 * Math.tanh(s0 / 0.16);          // paper can only get so bright or dark
      const w = Math.min(1, wear[i] + pWear[i] * e);
      const lum = baseLum[i] + s;
      const ia = ink[i] * (0.86 - 0.78 * w) * (0.9 + grain[i] * 3);
      let r = PAPER[0] * lum, g = PAPER[1] * lum, b = (PAPER[2] - ageB[i]) * lum;
      // worn crease: paper fibre shows lighter, slightly grey
      r += w * 6; g += w * 6; b += w * 8;
      r = r * (1 - ia) + INK[0] * ia; g = g * (1 - ia) + INK[1] * ia; b = b * (1 - ia) + INK[2] * ia;
      p[j] = dr + (r - dr) * m; p[j + 1] = dg + (g - dg) * m; p[j + 2] = db + (b - db) * m; p[j + 3] = 255;
    }
  }
  img.updatePixels();
  image(img, 0, 0);
  // signed on the desk, under the sheet's corner; the letter keeps its own signature
  push();
  noStroke(); fill(96, 100, 90); textFont('system-ui, sans-serif'); textSize(10); textAlign(RIGHT, BASELINE);
  text('Claude Opus 5.5, 2026', SX + SW, H - 18);
  pop();
}
