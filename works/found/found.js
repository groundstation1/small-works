// Found — a window a few millimetres wide, magnified, walking slowly round the outline of one letter
// from the fonts on this machine. Every moment is a flat shape; the letter is never seen.
// After Ellsworth Kelly's found shapes. The six walks were found in lab/found.html.

const COLOURS = { red: '#d42a20', blue: '#1d3f96', yellow: '#f3c300', green: '#1f7a4a', black: '#141414', white: '#f4f1ea', pink: '#e8a6b8', sky: '#7fb3d9', orange: '#ec6a1c', ochre: '#c89a3a' };
// kept from 46 walks (lab/found.html ?walks=200 and 220): seeds 201, 213, 236, 210, 212, 205
const PLATES = [
  { font: 'Courier New', glyph: 'ø', weight: 'normal', italic: true, fg: 'red', bg: 'pink', zoom: 16 },
  { font: 'Trebuchet MS', glyph: '{', weight: 'normal', italic: true, fg: 'orange', bg: 'white', zoom: 16 },
  { font: 'Bodoni MT', glyph: 'R', weight: 'normal', italic: false, fg: 'white', bg: 'black', zoom: 16 },
  { font: 'Century Gothic', glyph: 'ß', weight: 'normal', italic: false, fg: 'ochre', bg: 'black', zoom: 32 },
  { font: 'Bodoni MT', glyph: 's', weight: 'normal', italic: false, fg: 'white', bg: 'green', zoom: 16 },
  { font: 'Palatino Linotype', glyph: 'å', weight: 'normal', italic: false, fg: 'yellow', bg: 'blue', zoom: 16 },
];
const SPEED = 4;                                                   // outline steps per second: a few minutes per letter

const q = new URLSearchParams(location.search);
const n = Math.min(PLATES.length + 1, Math.max(1, parseInt(q.get('plate'), 10) || 1));
const SCORE = n === PLATES.length + 1;                             // the last plate: all six walks at once, as found
let p = PLATES[SCORE ? 0 : n - 1];
const S = 1024, fontOf = pl => `${pl.italic ? 'italic ' : ''}${pl.weight} ${S * 0.7}px "${pl.font}", serif`;
let FONT = fontOf(p);
document.body.style.background = SCORE ? '#e4e2dc' : COLOURS[p.bg];

// the outline, traced once on a large mask and smoothed so the window glides
function outline() {
  const work = document.createElement('canvas'); work.width = work.height = S;
  const w = work.getContext('2d'); w.font = FONT; w.textAlign = 'center'; w.textBaseline = 'middle'; w.fillText(p.glyph, S / 2, S / 2);
  const a = w.getImageData(0, 0, S, S).data, on = (x, y) => x >= 0 && y >= 0 && x < S && y < S && a[(y * S + x) * 4 + 3] > 127;
  let sx = -1, sy = -1;
  for (let y = 0; y < S && sx < 0; y++) for (let x = 0; x < S; x++) if (on(x, y)) { sx = x; sy = y; break; }
  const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]], path = [];
  let x = sx, y = sy, dir = 7, guard = 0;
  do {
    path.push([x, y]);
    let moved = false;
    for (let i = 0; i < 8; i++) { const d = (dir + 6 + i) % 8, nx = x + N8[d][0], ny = y + N8[d][1]; if (on(nx, ny)) { x = nx; y = ny; dir = d; moved = true; break; } }
    if (!moved) break;
  } while ((x !== sx || y !== sy) && ++guard < S * 40);
  const K = 12, sm = [];
  for (let i = 0; i < path.length; i++) { let mx = 0, my = 0; for (let j = -K; j <= K; j++) { const [px, py] = path[(i + j + path.length) % path.length]; mx += px; my += py; } sm.push([mx / (2 * K + 1), my / (2 * K + 1)]); }
  return sm;
}

const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
let W, H, path;
function size() { const d = devicePixelRatio || 1; W = canvas.width = Math.round(innerWidth * d); H = canvas.height = Math.round(innerHeight * d); }

function draw(t, box) {
  const [bx, by, bw, bh] = box || [0, 0, W, H];
  const L = path.length, i = ((Math.floor(t) % L) + L) % L, f = t - Math.floor(t), [x0, y0] = path[i], [x1, y1] = path[(i + 1) % path.length];
  const ex = x0 + (x1 - x0) * f, ey = y0 + (y1 - y0) * f, k = (Math.min(bw, bh) / S) * p.zoom;
  ctx.save();
  ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  ctx.fillStyle = COLOURS[p.bg]; ctx.fillRect(bx, by, bw, bh);
  ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(k, k); ctx.translate(-ex, -ey);
  ctx.font = FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COLOURS[p.fg];
  ctx.fillText(p.glyph, S / 2, S / 2);
  ctx.restore();
  if (box) return;
  sign();
}
function sign() {
  // signed low right, in whichever of the two colours is not passing under it just now
  const d = devicePixelRatio || 1, sx = W - 16 * d, sy = H - 14 * d;
  if (SCORE) { ctx.font = `${10 * d}px system-ui, -apple-system, "Segoe UI", sans-serif`; ctx.textAlign = 'right'; ctx.fillStyle = '#9a978f'; ctx.fillText('Claude Opus 5.5, 2026', sx, sy); return; }
  const under = ctx.getImageData(sx - 40 * d, sy - 4 * d, 1, 1).data;
  const fg = COLOURS[p.fg], onFg = Math.abs(under[0] - parseInt(fg.slice(1, 3), 16)) + Math.abs(under[1] - parseInt(fg.slice(3, 5), 16)) + Math.abs(under[2] - parseInt(fg.slice(5, 7), 16)) < 60;
  ctx.font = `${10 * d}px system-ui, -apple-system, "Segoe UI", sans-serif`; ctx.textAlign = 'right';
  ctx.fillStyle = onFg ? COLOURS[p.bg] : COLOURS[p.fg]; ctx.globalAlpha = 0.8;
  ctx.fillText('Claude Opus 5.5, 2026', sx, sy); ctx.globalAlpha = 1;
}

// the score: each walk a row of seven moments, evenly spaced round its letter
function score() {
  const rows = PLATES.length, cols = 7, d = devicePixelRatio || 1, gap = 5 * d;
  const cell = Math.floor(Math.min((W * 0.86 - gap * (cols - 1)) / cols, (H * 0.86 - gap * (rows - 1)) / rows));
  const x0 = Math.round((W - cols * cell - gap * (cols - 1)) / 2), y0 = Math.round((H - rows * cell - gap * (rows - 1)) / 2);
  ctx.fillStyle = '#e4e2dc'; ctx.fillRect(0, 0, W, H);
  PLATES.forEach((pl, r) => {
    p = pl; FONT = fontOf(pl); path = outline();
    for (let c = 0; c < cols; c++) draw(path.length * c / cols, [x0 + c * (cell + gap), y0 + r * (cell + gap), cell, cell]);
  });
  sign(); window.drawn = true;
}

document.fonts.ready.then(() => {
  if (SCORE) {
    size(); score(); addEventListener('resize', () => { size(); score(); });
    // a row is a walk: clicking it asks the gallery (or this page) to walk that letter
    canvas.style.cursor = 'pointer';
    canvas.onclick = e => {
      const d = devicePixelRatio || 1, gap = 5 * d, rows = PLATES.length;
      const cell = Math.floor(Math.min((W * 0.86 - gap * 6) / 7, (H * 0.86 - gap * (rows - 1)) / rows));
      const y0 = Math.round((H - rows * cell - gap * (rows - 1)) / 2), r = Math.floor((e.clientY * d - y0) / (cell + gap));
      if (r < 0 || r >= rows) return;
      if (parent !== window) parent.postMessage({ plate: r + 1 }, '*'); else location.search = '?plate=' + (r + 1);
    };
    return;
  }
  size(); path = outline();
  let t = 0;
  draw(t); window.drawn = true;
  if (q.has('still')) return;
  addEventListener('resize', () => { size(); draw(t); });
  let last = performance.now();
  const loop = now => { t += Math.max(0, now - last) / 1000 * SPEED; last = now; draw(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
});
