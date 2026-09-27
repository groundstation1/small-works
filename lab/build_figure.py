# Builds works/figure/ : six bodies kept from ~70, found in lab/body.html (v=2, draw=exposure).
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLATES = json.loads(open(os.path.join(ROOT, 'lab', 'figure-plates.json'), encoding='utf8').read())
LAB = open(os.path.join(ROOT, 'lab', 'body.html'), encoding='utf8').read()
HUMAN = LAB[LAB.index('  const PROFILE = {'):LAB.index('  // poses: sharp single silhouettes')]

JS = r"""// Figure: a simulated body (bones, joints, gravity, a floor, rhythmic muscles, a posture reflex)
// in a dark room, photographed with the shutter open. You never see it; only the light it leaves.
// The body is lit from the upper left: a sharp rim where the light catches it, a soft mass in shadow.
// After Marey, Muybridge and long-exposure photography. Six bodies kept from about seventy (lab/body.html).

const PLATES = __PLATES__;
const q = new URLSearchParams(location.search);
const p = PLATES[Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1)) - 1];
const STILL = q.has('still');

// joints: 0 head, 1 neck, 2 pelvis, 3 kneeL, 4 footL, 5 kneeR, 6 footR, 7 elbowL, 8 handL, 9 elbowR, 10 handR, 11 mid-spine
const REST = [[0, 1.74], [0, 1.47], [0, 0.93], [0.03, 0.48], [0.03, 0.03], [-0.03, 0.48], [-0.03, 0.03], [0.02, 1.17], [0.04, 0.9], [-0.02, 1.17], [-0.04, 0.9], [0.01, 1.2]];
const BONES = [[0, 1], [1, 11], [11, 2], [2, 3], [3, 4], [2, 5], [5, 6], [1, 7], [7, 8], [1, 9], [9, 10]];
const THICK = [0.2, 0.32, 0.27, 0.16, 0.12, 0.16, 0.12, 0.1, 0.08, 0.1, 0.08];
const MUSCLES = { neck: [1, 11, 0], spine: [11, 2, 1], hipL: [2, 11, 3], kneeL: [3, 2, 4], hipR: [2, 11, 5], kneeR: [5, 2, 6], shL: [1, 11, 7], elL: [7, 1, 8], shR: [1, 11, 9], elR: [9, 1, 10] };
const REST_ANGLE = { neck: 0, spine: 0, hipL: 0, kneeL: 0, hipR: 0, kneeR: 0, shL: Math.PI, elL: 0, shR: Math.PI, elR: 0 };
__HUMAN__
let SPAN = 8;                                                          // metres of floor the plate shows, at least
const DT = 1 / 240, GAIN = (+q.get('gain') || 11) / 255, RIM = 0.05, FILL = 0.22, SOFT = 0.035;   // metres of blur on the shadowed mass

const ang = (x, y) => Math.atan2(y, x), wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const rot = (pt, c, a) => { const dx = pt[0] - c[0], dy = pt[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };

// framed like a photographer would: run the movement once unseen, then centre the plate on where it went
let START = 1.2;
{ const probe = body(); let lo = 1e9, hi = -1e9;
  while (probe.t < p.T) { probe.step(); for (const [x] of probe.P) { lo = Math.min(lo, x); hi = Math.max(hi, x); } }
  SPAN = Math.max(SPAN, hi - lo + 1.6);                                // a longer movement: step back
  START += SPAN / 2 - (lo + hi) / 2; }
function body() {
  const P = REST.map(([x, y]) => [x + START, y + 0.02]), O = P.map(([x, y]) => [x - p.vx / 240, y]);
  for (const qq of [P, O]) for (const pt of qq) { const dx = pt[0] - START, dy = pt[1]; pt[0] = START + dx * Math.cos(p.lean) + dy * Math.sin(p.lean); pt[1] = -dx * Math.sin(p.lean) + dy * Math.cos(p.lean) + 0.02; }
  const L = BONES.map(([a, b]) => Math.hypot(REST[a][0] - REST[b][0], REST[a][1] - REST[b][1]));
  let s = 0;
  return {
    P, get t() { return s * DT; },
    step() {
      const t = s * DT;
      for (let i = 0; i < P.length; i++) {
        const [x, y] = P[i], [ox, oy] = O[i]; O[i] = [x, y];
        let vx = (x - ox) * 0.996, vy = (y - oy) * 0.996; const sp = Math.hypot(vx, vy), cap = 6 * DT;
        if (sp > cap) { vx *= cap / sp; vy *= cap / sp; }
        P[i] = [x + vx, y + vy - 9.81 * DT * DT];
      }
      if (p.balance) {
        const tilt = ang(P[1][0] - P[2][0], P[1][1] - P[2][1]) - Math.PI / 2, e = -wrap(tilt) * p.balance * 0.02;
        for (const i of [0, 1, 7, 8, 9, 10, 11]) P[i] = rot(P[i], P[2], e * (i === 11 ? 0.5 : 1));
        for (const i of [3, 4, 5, 6]) P[i] = rot(P[i], P[2], -e * 0.6);
      }
      for (const [k, [piv, par, ch]] of Object.entries(MUSCLES)) {
        const mu = p.m[k], target = REST_ANGLE[k] + mu.base + mu.amp * Math.sin(6.283 * mu.f * t + mu.ph);
        const a0 = ang(P[piv][0] - P[par][0], P[piv][1] - P[par][1]), a1 = ang(P[ch][0] - P[piv][0], P[ch][1] - P[piv][1]);
        const err = wrap(a0 + target - a1) * p.stiff * 0.12;
        const nc = rot(P[ch], P[piv], err), np = rot(P[par], P[piv], -err * p.push);
        const sx = -((nc[0] - P[ch][0]) + (np[0] - P[par][0])) / 3, sy = -((nc[1] - P[ch][1]) + (np[1] - P[par][1])) / 3;
        P[ch] = [nc[0] + sx, nc[1] + sy]; P[par] = [np[0] + sx, np[1] + sy]; P[piv] = [P[piv][0] + sx, P[piv][1] + sy];
      }
      for (let it = 0; it < 16; it++) {
        BONES.forEach(([a, b], i) => {
          const dx = P[b][0] - P[a][0], dy = P[b][1] - P[a][1], d = Math.hypot(dx, dy) || 1e-6, k = (d - L[i]) / d * 0.5;
          P[a] = [P[a][0] + dx * k, P[a][1] + dy * k]; P[b] = [P[b][0] - dx * k, P[b][1] - dy * k];
        });
        for (let i = 0; i < P.length; i++) if (P[i][1] < 0) { P[i][1] = 0; P[i][0] = O[i][0] + (P[i][0] - O[i][0]) * (1 - p.mu); }
      }
      s++;
    },
  };
}

// the plate
const plate = document.createElement('canvas'); plate.id = 'plate'; document.body.append(plate);
const W = STILL ? 1800 : Math.min(2400, Math.round(innerWidth * (devicePixelRatio || 1))), H = Math.round(W / 2.4), K = W / SPAN;
plate.width = W; plate.height = H;
const c = plate.getContext('2d');
const mk = () => { const x = document.createElement('canvas'); x.width = W; x.height = H; return [x, x.getContext('2d')]; };
const [f, fc] = mk(), [r, rc] = mk(), [sf, sfc] = mk(), [sr, src] = mk();
fc.lineCap = 'round'; fc.strokeStyle = fc.fillStyle = 'rgb(238, 226, 208)';
sfc.globalCompositeOperation = src.globalCompositeOperation = 'lighter';

function instant(P) {                                                  // one instant: silhouette, and its lit edge
  fc.clearRect(0, 0, W, H);
  drawHuman(fc, P, K, H);
  rc.globalCompositeOperation = 'copy'; rc.drawImage(f, 0, 0);
  rc.globalCompositeOperation = 'destination-out'; rc.drawImage(f, RIM * K * 0.8, RIM * K * 0.6);
  sfc.globalAlpha = 1 / 8; sfc.drawImage(f, 0, 0);
  src.globalAlpha = 1 / 8; src.drawImage(r, 0, 0);
}
function commit() {                                                    // eight instants onto the film: the mass soft, the rim sharp
  c.globalCompositeOperation = 'lighter';
  c.filter = `blur(${SOFT * K}px)`; c.globalAlpha = GAIN * FILL * 255 / 238; c.drawImage(sf, 0, 0);
  c.filter = 'none'; c.globalAlpha = GAIN * 255 / 238; c.drawImage(sr, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  sfc.clearRect(0, 0, W, H); src.clearRect(0, 0, W, H);
}
function dark() { c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = '#070707'; c.fillRect(0, 0, W, H); }

// signed on the dark below the plate, right
const mark = document.createElement('div');
mark.textContent = 'Claude Opus 5.5, 2026';
mark.style.cssText = 'position:fixed;right:16px;bottom:14px;font:10px system-ui,-apple-system,"Segoe UI",sans-serif;color:#4a4a4a';
document.body.append(mark);

if (STILL) {
  dark(); const b = body(); let n = 0;
  while (b.t < p.T) { b.step(); instant(b.P); if (++n % 8 === 0) commit(); }
  commit(); window.drawn = true;
} else {
  window.drawn = true;
  let b, n, hold, fade, last;
  const begin = () => { dark(); b = body(); n = 0; hold = 0; fade = 0; last = performance.now(); };
  begin();
  const loop = now => {
    const ms = Math.min(100, now - last); last = now;
    if (b.t < p.T) {                                                   // the shutter is open: real time
      for (let k = Math.round(ms / 1000 / DT); k > 0 && b.t < p.T; k--) { b.step(); instant(b.P); if (++n % 8 === 0) commit(); }
    } else if ((hold += ms) < 25000) {                                 // the plate, held
    } else if ((fade += ms) < 3000) {                                  // then it goes dark, and the room is used again
      c.globalAlpha = 0.04; c.fillStyle = '#070707'; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
    } else begin();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
"""

os.makedirs(os.path.join(ROOT, 'works', 'figure'), exist_ok=True)
open(os.path.join(ROOT, 'works', 'figure', 'figure.js'), 'w', encoding='utf8').write(JS.replace('__PLATES__', json.dumps(PLATES)).replace('__HUMAN__', HUMAN))
open(os.path.join(ROOT, 'works', 'figure', 'index.html'), 'w', encoding='utf8').write("""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Figure</title>
<style>html, body { margin: 0; height: 100%; overflow: hidden; background: #070707; } body { display: flex; align-items: center; justify-content: center; }
#plate { width: 100vw; height: auto; max-height: 100vh; display: block; }</style>
</head><body><script src="figure.js"></script></body></html>
""")
works = open(os.path.join(ROOT, 'works.js'), encoding='utf8').read()
if "id: 'figure'" not in works:
    end = works.index("];\n\n// Every entry")
    works = works[:end] + """  {
    id: 'figure',
    title: 'Figure',
    year: 2026,
    ground: '#070707',
    plates: ['I', 'II', 'III', 'IV', 'V', 'VI'],
    cover: 1,
  },
""" + works[end:]
    open(os.path.join(ROOT, 'works.js'), 'w', encoding='utf8').write(works)
print('built')
