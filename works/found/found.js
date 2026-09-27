// Found — a window a few millimetres wide, magnified, walking slowly round the outline of one letter
// from the fonts on this machine. Every moment is a flat shape; the letter is never seen.
// After Ellsworth Kelly's found shapes. The six walks were found in lab/found.html.

const COLOURS = { red: '#d42a20', blue: '#1d3f96', yellow: '#f3c300', green: '#1f7a4a', black: '#141414', white: '#f4f1ea', pink: '#e8a6b8', sky: '#7fb3d9' };
const PLATES = [
  { font: 'Impact', glyph: '%', weight: 'normal', rot: 0, fg: 'red', bg: 'black', pt: 0.6088, zoom: 24 },
  { font: 'sans-serif', glyph: 'B', weight: 'normal', rot: 0, fg: 'green', bg: 'blue', pt: 0.5412, zoom: 20 },
  { font: 'Consolas', glyph: '§', weight: 'bold', rot: 90, fg: 'yellow', bg: 'blue', pt: 0.9199, zoom: 22 },
  { font: 'Courier New', glyph: 'Q', weight: 'bold', rot: 90, fg: 'black', bg: 'white', pt: 0.3622, zoom: 20 },
  { font: 'serif', glyph: 'ø', weight: 'normal', rot: 90, fg: 'white', bg: 'sky', pt: 0.3315, zoom: 26 },
  { font: 'Verdana', glyph: 'R', weight: 'normal', rot: 0, fg: 'pink', bg: 'red', pt: 0.6054, zoom: 20 },
];
const SPEED = 4;                                                   // outline steps per second: a few minutes per letter

const q = new URLSearchParams(location.search);
const p = PLATES[Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1)) - 1];
const S = 1024, FONT = `${p.weight} ${S * 0.7}px "${p.font}", serif`;
document.body.style.background = COLOURS[p.bg];

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

function draw(t) {
  const i = Math.floor(t) % path.length, f = t - Math.floor(t), [x0, y0] = path[i], [x1, y1] = path[(i + 1) % path.length];
  const ex = x0 + (x1 - x0) * f, ey = y0 + (y1 - y0) * f, k = (Math.min(W, H) / S) * p.zoom;
  ctx.fillStyle = COLOURS[p.bg]; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(p.rot * Math.PI / 180); ctx.scale(k, k); ctx.translate(-ex, -ey);
  ctx.font = FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COLOURS[p.fg];
  ctx.fillText(p.glyph, S / 2, S / 2);
  ctx.restore();
  // signed low right, in whichever of the two colours is not passing under it just now
  const d = devicePixelRatio || 1, sx = W - 16 * d, sy = H - 14 * d;
  const under = ctx.getImageData(sx - 40 * d, sy - 4 * d, 1, 1).data;
  const fg = COLOURS[p.fg], onFg = Math.abs(under[0] - parseInt(fg.slice(1, 3), 16)) + Math.abs(under[1] - parseInt(fg.slice(3, 5), 16)) + Math.abs(under[2] - parseInt(fg.slice(5, 7), 16)) < 60;
  ctx.font = `${10 * d}px system-ui, -apple-system, "Segoe UI", sans-serif`; ctx.textAlign = 'right';
  ctx.fillStyle = onFg ? COLOURS[p.bg] : COLOURS[p.fg]; ctx.globalAlpha = 0.8;
  ctx.fillText('Claude Opus 5.5, 2026', sx, sy); ctx.globalAlpha = 1;
}

document.fonts.ready.then(() => {
  size(); path = outline();
  let t = p.pt * path.length;
  draw(t); window.drawn = true;
  if (q.has('still')) return;
  addEventListener('resize', () => { size(); draw(t); });
  let last = performance.now();
  const loop = now => { t += (now - last) / 1000 * SPEED; last = now; draw(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
});
