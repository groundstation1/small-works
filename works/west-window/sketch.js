// West Window — an empty room, one afternoon.
// The window is never seen; only what it lets in.

const W = 800, H = 800;
const DAY = 100;                         // seconds for one afternoon and its night
const L = 1.4;                           // the left wall (with the window) sits at x = -L
const WIN = { y0: 0.8, y1: 2.2, z0: 0.9, z1: 2.3 };
const GHOST = { x0: 1.28, x1: 1.86, y0: 1.08, y1: 1.8 };   // where the picture was
const CAM = [1.05, 1.2, 4.3], LOOK = [1.15, 1.02, 0], FOV = 21 * Math.PI / 180;

let wx, wy, wz, surf, alb, ao, grainN, img, tone;
let bounce = 0;

function setup() {
  createCanvas(W, H);
  pixelDensity(1);
  const seed = paramSeed(7);
  randomSeed(seed); noiseSeed(seed);
  img = createImage(W, H);
  const n = W * H;
  wx = new Float32Array(n); wy = new Float32Array(n); wz = new Float32Array(n);
  surf = new Uint8Array(n); alb = new Float32Array(n * 3); ao = new Float32Array(n); grainN = new Float32Array(n);

  // tone curve: soft shoulder, then display gamma
  tone = new Uint8ClampedArray(2048);
  for (let k = 0; k < 2048; k++) { const v = k / 512; tone[k] = 255 * Math.pow(1 - Math.exp(-v * 1.5), 1 / 2.2); }

  buildRoom();
  if (STILL) noLoop();
}

// ---------- the room, fixed: where each pixel lands and what it is made of ----------
function buildRoom() {
  const f = vnorm(vsub(LOOK, CAM));
  const r = vnorm(vcross(f, [0, 1, 0]));
  const u = vcross(r, f);
  const tf = Math.tan(FOV);
  const boardW = 0.15, jointL = 1.35;
  const boardHash = [];
  for (let b = 0; b < 80; b++) boardHash.push([random(), random(), random()]);

  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const i = py * W + px;
    const sx = (px / W * 2 - 1) * tf, sy = (1 - py / H * 2) * tf;
    const d = [f[0] + r[0] * sx + u[0] * sy, f[1] + r[1] * sx + u[1] * sy, f[2] + r[2] * sx + u[2] * sy];
    const tF = d[1] < 0 ? -CAM[1] / d[1] : 1e9;
    const tW = d[2] < 0 ? -CAM[2] / d[2] : 1e9;
    const t = Math.min(tF, tW);
    const x = CAM[0] + d[0] * t, y = CAM[1] + d[1] * t, z = CAM[2] + d[2] * t;
    wx[i] = x; wy[i] = Math.max(0, y); wz[i] = Math.max(0, z);
    const dist = t * Math.hypot(d[0], d[1], d[2]);
    const fp = dist * 2 * tf / H;         // how much world one pixel covers here
    let R, G, B;

    if (tF < tW) {                         // floor: oak boards running toward the wall
      surf[i] = 0;
      const bi = Math.floor((x + 6) / boardW), h = boardHash[bi % 80];
      const tint = 0.82 + 0.3 * h[0];
      const g = 0.9 + 0.2 * noise(x * 40, z * 1.2 + bi * 9) + 0.06 * noise(x * 90, z * 6);
      R = 0.50 * tint * g; G = 0.36 * tint * g; B = 0.23 * tint * g;
      // seams between boards and board ends, widened to the pixel so they don't shimmer
      const sw = 0.004;
      const ex = (((x + 6) % boardW) + boardW) % boardW, edx = Math.min(ex, boardW - ex);
      const ez = (((z + h[1] * jointL) % jointL) + jointL) % jointL, edz = Math.min(ez, jointL - ez);
      const seam = Math.max(seamCov(edx, sw, fp), seamCov(edz, sw, fp));
      R *= 1 - 0.55 * seam; G *= 1 - 0.55 * seam; B *= 1 - 0.55 * seam;
      ao[i] = 1 - 0.45 * Math.exp(-z / 0.1);
    } else {                               // wall: plaster over a painted baseboard
      surf[i] = 1;
      const p = 0.95 + 0.07 * noise(x * 2.5, y * 2.5) + 0.025 * noise(x * 30, y * 30);
      // years of this same afternoon bleached the paint; where a picture hung, it didn't
      const hung = span(x, GHOST.x0, GHOST.x1, 0.03) * span(y, GHOST.y0, GHOST.y1, 0.03);
      const dust = hung * Math.exp(-(GHOST.y1 - y) / 0.015) * 0.12;   // grime along the frame's top
      R = (0.85 - 0.10 * hung) * p * (1 - dust); G = (0.81 - 0.045 * hung) * p * (1 - dust); B = (0.72 - 0.03 * hung) * p * (1 - dust);
      const nail = Math.hypot(x - (GHOST.x0 + GHOST.x1) / 2, y - GHOST.y1 - 0.09);
      if (nail < 0.009) { R *= 0.35; G *= 0.35; B *= 0.35; }
      else if (nail < 0.02 && y < GHOST.y1 + 0.09) { R *= 0.85; G *= 0.85; B *= 0.85; }
      if (y < 0.11) { R = 0.86; G = 0.85; B = 0.82; }
      const lip = seamCov(Math.abs(y - 0.11), 0.004, fp);
      R *= 1 - 0.35 * lip; G *= 1 - 0.35 * lip; B *= 1 - 0.35 * lip;
      ao[i] = (1 - 0.3 * Math.exp(-y / 0.08)) * (1 - 0.12 * Math.exp(-(x + L) / 0.6));
    }
    alb[i * 3] = R; alb[i * 3 + 1] = G; alb[i * 3 + 2] = B;
    grainN[i] = (random() - 0.5) * 0.018;
  }
}

function seamCov(e, w, fp) { const band = Math.max(w, fp); return e < band / 2 ? w / band : 0; }

// ---------- the afternoon ----------
function draw() {
  const T0 = parseFloat(PARAMS.get('t'));             // ?t=0..1 holds one moment of the day
  const T = Number.isFinite(T0) ? T0 : STILL ? 0.72 : ((millis() / 1000) / DAY + 0.04) % 1;
  const secs = millis() / 1000;

  // the sun: lowering, swinging slowly round to face the window
  const el = radians(lerp(44, -9, T / 0.97));
  const az = radians(lerp(-38, -22, T));
  const d = [Math.cos(el) * Math.cos(az), -Math.sin(el), Math.cos(el) * Math.sin(az)];
  const up = smoothstep(0, 0.07, T) * smoothstep(-0.01, radians(3), el);    // arrives round the neighbour's roof
  const low = constrain(degrees(el) / 30, 0, 1);
  const thin = 0.3 + 0.7 * Math.sqrt(low);                                  // more air to pass through, the lower it gets
  const sun = [1.0 * up * thin, (0.45 + 0.5 * low) * up * thin, (0.16 + 0.7 * low) * up * thin];
  const day = smoothstep(radians(-9), radians(12), el) * (0.35 + 0.65 * smoothstep(0, 0.1, T));
  const amb = [0.03 + 0.14 * day, 0.037 + 0.165 * day, 0.07 + 0.2 * day];     // sky fill: cool
  const bn = [bounce * 0.9, bounce * 0.55, bounce * 0.3];                     // warmth thrown back by the patch

  // the curtain: a sheer panel over the far side of the window, breathing
  const cz = 1.95 + 0.1 * (noise(secs * 0.25) - 0.5) + 0.04 * Math.sin(secs * 0.7);

  img.loadPixels();
  const P = img.pixels;
  let patch = 0;
  for (let i = 0; i < W * H; i++) {
    const x = wx[i], y = wy[i], z = wz[i];
    let lit = 0;
    if (up > 0) {
      const cosI = surf[i] === 0 ? -d[1] : -d[2];
      if (cosI > 0) {
        const s = (x + L) / d[0];                       // back toward the sun, to the window's plane
        const hy = y - d[1] * s, hz = z - d[2] * s;
        const pen = 0.006 + s * 0.011;                  // far light, soft edges
        let c = span(hy, WIN.y0, WIN.y1, pen) * span(hz, WIN.z0, WIN.z1, pen);
        if (c > 0) {
          c *= 1 - bar(hz, 1.6, 0.03, pen);             // mullion
          c *= 1 - bar(hy, 1.5, 0.03, pen);             // transom
          const veil = clamp01((hz - cz + hy * 0.05) / pen + 0.5);
          c *= 1 - veil * (0.62 + 0.08 * Math.sin(hz * 70 + hy * 3));
          lit = c * cosI;
          patch += lit;
        }
      }
    }
    const a = ao[i], g = 1 + grainN[i];
    const j = i * 4, k = i * 3;
    const r = alb[k] * (amb[0] * a + bn[0] * a + sun[0] * lit * 2.4) * g;
    const gg = alb[k + 1] * (amb[1] * a + bn[1] * a + sun[1] * lit * 2.4) * g;
    const b = alb[k + 2] * (amb[2] * a + bn[2] * a + sun[2] * lit * 2.4) * g;
    P[j] = tone[Math.min(2047, (r * 512) | 0)];
    P[j + 1] = tone[Math.min(2047, (gg * 512) | 0)];
    P[j + 2] = tone[Math.min(2047, (b * 512) | 0)];
    P[j + 3] = 255;
  }
  img.updatePixels();
  image(img, 0, 0);
  bounce = lerp(bounce, (patch / (W * H)) * 2.2 * up, 0.2);

  push();
  noStroke(); fill(12, 9, 8, 120); textFont('system-ui, sans-serif'); textSize(10); textAlign(RIGHT, BASELINE);
  text('Claude Opus 5.5, 2026', W - 16, H - 14);
  pop();
}

// ---------- small helpers ----------
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function span(v, a, b, s) { return clamp01((v - a) / s + 0.5) * clamp01((b - v) / s + 0.5); }
function bar(v, c, hw, s) { return span(v, c - hw, c + hw, s); }
function smoothstep(a, b, v) { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); }
function vsub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vcross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function vnorm(a) { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
