// Any Other Business — everyone lines up. There's always one.

const W = 800, H = 800;
const COLS = 6, ROWS = 8, CW = 82, CH = 50, GX = 106, GY = 84;
const GROUND = [142, 67, 49];

const PIN = CH / 2 - 7;                     // pinned near the top edge: they swing from there
let slips = [], board, dissent = -1, stance = 0, phase = 'calm', phaseT = 0, hold = 9, pause = 2.5;

function setup() {
  createCanvas(W, H);
  pixelDensity(2);
  const seed = paramSeed(48);
  randomSeed(seed); noiseSeed(seed);
  board = makeBoard();

  const ox = (W - (COLS - 1) * GX) / 2, oy = (H - (ROWS - 1) * GY) / 2 - PIN - 4;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    slips.push({
      c, r, hx: ox + c * GX, hy: oy + r * GY,
      x: 0, y: 0, a: randomGaussian() * 0.02, va: 0, vx: 0, vy: 0, lift: 0,
      shape: cutShape(), tone: random(-6, 6),
    });
  }
  for (const s of slips) { s.x = s.hx; s.y = s.hy; }

  if (STILL) {                                    // find a moment mid-argument
    for (let k = 0; k < 60 * 9; k++) step(1 / 60);
    render(); noLoop();
  }
}

// scissors never quite go straight
function cutShape() {
  const hw = CW / 2 + random(-2, 2), hh = CH / 2 + random(-1.5, 1.5);
  const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [x + random(-1.4, 1.4), y + random(-1.4, 1.4)]);
  const pts = [];
  for (let e = 0; e < 4; e++) {
    const [x0, y0] = corners[e], [x1, y1] = corners[(e + 1) % 4];
    const n = 5, bow = random(-0.7, 0.7);
    for (let k = 0; k < n; k++) {
      const t = k / n, len = Math.hypot(x1 - x0, y1 - y0);
      const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
      const off = bow * Math.sin(t * PI) + (k ? random(-0.25, 0.25) : 0);
      pts.push([lerp(x0, x1, t) + nx * off, lerp(y0, y1, t) + ny * off + PIN]);
    }
  }
  return pts;
}

function makeBoard() {
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.loadPixels();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const n = (noise(x * 0.012, y * 0.012) - 0.5) * 10 + (random() - 0.5) * 7;   // pressed card, a little uneven
    g.pixels[i] = GROUND[0] + n; g.pixels[i + 1] = GROUND[1] + n * 0.6; g.pixels[i + 2] = GROUND[2] + n * 0.5; g.pixels[i + 3] = 255;
  }
  g.updatePixels();
  return g;
}

// ---------- the meeting ----------
function step(dt) {
  phaseT += dt;
  if (phase === 'calm' && phaseT > pause) {
    let next; do next = floor(random(slips.length)); while (next === dissent);
    dissent = next; phase = 'rising'; phaseT = 0; hold = random(7, 13); pause = random(1.5, 4);
  }
  if (phase === 'rising') {
    stance = lerp(stance, slips[dissent].side * 0.2, 0.012);   // it makes its point, slowly
    if (phaseT > hold) giveIn();
  }
  if (phase === 'yielding') { stance *= 0.9; if (phaseT > 1.2) { phase = 'calm'; phaseT = 0; } }

  for (let i = 0; i < slips.length; i++) {
    const s = slips[i];
    if (s.side === undefined) s.side = random() < 0.5 ? -1 : 1;
    // each lines itself up with its neighbours, and a little with the grid
    let sum = 0, n = 0;
    for (const j of neighbours(s)) { sum += slips[j].a; n++; }
    let target = 0.9 * (sum / n);              // and, faintly, with the grid itself
    if (i === dissent && phase !== 'calm') target = stance;
    const k = i === dissent ? 30 : 22;
    s.va += (k * (target - s.a) - 5.5 * s.va) * dt;
    s.va += (noise(i * 7.1, frameCount * 0.004) - 0.5) * 0.02;          // draughts in the room
    s.a += s.va * dt;
    const over = !STILL && mouseOver(s);
    s.lift = lerp(s.lift, over ? 1 : 0, 0.15);
  }
}

function giveIn() {
  if (dissent < 0) return;
  const s = slips[dissent];
  s.va -= s.a * 6;                                // a quick, slightly embarrassed correction
  phase = 'yielding'; phaseT = 0;
  s.side = random() < 0.5 ? -1 : 1;
}

function neighbours(s) {
  const out = [];
  for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const c = s.c + dc, r = s.r + dr;
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) out.push(r * COLS + c);
  }
  return out;
}

function mouseOver(s) {
  const dx = mouseX - s.x, dy = mouseY - s.y;
  const lx = dx * Math.cos(-s.a) - dy * Math.sin(-s.a), ly = dx * Math.sin(-s.a) + dy * Math.cos(-s.a);
  return Math.abs(lx) < CW / 2 && Math.abs(ly - PIN) < CH / 2;
}

function mousePressed() {
  const i = slips.findIndex(mouseOver);
  if (i < 0) return;
  if (i === dissent && phase === 'rising') { giveIn(); pause = 0.4; }   // told off; someone else starts
  else slips[i].va += (random() < 0.5 ? -1 : 1) * 1.6;   // jostled; it rights itself
}

// ---------- drawing ----------
function draw() {
  step(Math.min(deltaTime / 1000, 1 / 30));
  render();
}

function render() {
  image(board, 0, 0);
  const ctx = drawingContext;
  for (let pass = 0; pass < 2; pass++) {              // all shadows first, then all paper
    for (const s of slips) {
      push();
      translate(s.x, s.y); rotate(s.a);
      const L = s.lift;
      if (pass === 0) {
        ctx.shadowColor = 'rgba(40, 12, 6, 0.45)';
        ctx.shadowBlur = 3 + L * 8; ctx.shadowOffsetX = 1.5 + L * 3; ctx.shadowOffsetY = 2.5 + L * 5;
        noStroke(); fill(GROUND[0], GROUND[1], GROUND[2]);
      } else {
        ctx.shadowColor = 'transparent';
        noStroke(); fill(236 + s.tone, 228 + s.tone, 210 + s.tone * 0.8);
      }
      scale(1 + L * 0.025);
      beginShape();
      for (const [x, y] of s.shape) vertex(x, y);
      endShape(CLOSE);
      if (pass === 1) {
        // the pin
        fill(120, 110, 96, 90); circle(0, 0, 3.2);
        fill(255, 255, 255, 120); circle(-0.5, -0.5, 1.1);
      }
      pop();
    }
  }
  ctx.shadowColor = 'transparent';
  push();
  noStroke(); fill(236, 222, 200, 150); textFont('system-ui, sans-serif'); textSize(10); textAlign(RIGHT, BASELINE);
  text('Claude Opus 5.5, 2026', W - 16, H - 14);
  pop();
}
