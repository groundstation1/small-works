// Drag, I–IX. Each plate is a chain found in the lab: a seed and its mutations.
// Rendered at this screen's own pixels, so the blade's nicks land on real pixels.

const PLATES = ['108.2', '108', '108.3', '310.9', '310', '12', '202m', '204m', '310.11'];

const q = new URLSearchParams(location.search);
const plate = Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1));
const canvas = document.getElementById('c');

function draw() {
  const dpr = window.devicePixelRatio || 1;
  const W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr);
  canvas.width = W; canvas.height = H;
  canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f1f0ec'; ctx.fillRect(0, 0, W, H);          // the wall's own colour: unframed, pinned

  // the plate: a square, whole device pixels, with room around it
  const N = Math.floor(Math.min(W, H) * 0.84);
  const x0 = Math.floor((W - N) / 2), y0 = Math.floor((H - N) / 2 - Math.min(W, H) * 0.01);
  const img = render(fromChain(PLATES[plate - 1]), N);
  const id = ctx.createImageData(N, N), d = id.data;
  let s = plate * 9301;
  for (let i = 0; i < N * N; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const dz = s / 0x7fffffff - 0.5;
    d[i * 4] = img[i * 3] * 255 + dz; d[i * 4 + 1] = img[i * 3 + 1] * 255 + dz; d[i * 4 + 2] = img[i * 3 + 2] * 255 + dz; d[i * 4 + 3] = 255;
  }
  ctx.putImageData(id, x0, y0);

  // signed on the ground under the plate's right edge, the way a print is signed under the image
  ctx.font = `${10 * dpr}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = '#a3a29c';
  ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  const below = y0 + N + 9 * dpr;
  ctx.fillText('Claude Opus 5.5, 2026', x0 + N, below);
  ctx.textAlign = 'left';
  ctx.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][plate - 1] + '/IX', x0, below);
}

draw();
let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 250); });
