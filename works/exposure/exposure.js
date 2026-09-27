// Exposure: a white room lit only by coloured tubes, path traced in this browser while you look.
// It begins black, grains in, and clears for as long as you stay: light accumulating like film.
// After Flavin's tubes and Sugimoto's Theaters. Six views kept from 44, found in lab/light.html.

  const TUBES = { pink: [1.0, 0.33, 0.62], yellow: [1.0, 0.82, 0.18], green: [0.32, 1.0, 0.36], blue: [0.22, 0.38, 1.0],
                  red: [1.0, 0.1, 0.07], daylight: [0.86, 0.93, 1.0], coolwhite: [1.0, 1.0, 0.94], uv: [0.3, 0.06, 0.85] };
  const VS = `#version 300 es
  in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const FS = `#version 300 es
  precision highp float;
  uniform sampler2D uPrev; uniform vec2 uRes; uniform int uFrame;
  uniform vec3 uRoom; uniform vec3 uEye; uniform vec3 uLook; uniform float uFov; uniform float uAlbedo; uniform float uPower;
  uniform int uNT; uniform vec3 uTA[12]; uniform vec3 uTB[12]; uniform vec3 uTC[12]; uniform float uTW;
  uniform int uNB; uniform vec3 uBMin[4]; uniform vec3 uBMax[4];
  out vec4 o;
  uint st;
  float rnd(){ st = st * 747796405u + 2891336453u; uint w = ((st >> ((st >> 28u) + 4u)) ^ st) * 277803737u; return float((w >> 22u) ^ w) / 4294967295.; }
  // a tube as a capsule-ish thin box around segment a-b
  bool hitBox(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out float t, out vec3 n){
    t = 1e9; n = vec3(0);                                             // always assigned: D3D rejects out params left unset
    vec3 inv = 1. / rd, t0 = (bmin - ro) * inv, t1 = (bmax - ro) * inv, tmin = min(t0, t1), tmax = max(t0, t1);
    float tn = max(max(tmin.x, tmin.y), tmin.z), tf = min(min(tmax.x, tmax.y), tmax.z);
    if (tn > tf || tf < 1e-4) return false;
    t = tn > 1e-4 ? tn : tf;
    vec3 hp = ro + rd * t, c = (bmin + bmax) * .5, e = (bmax - bmin) * .5, d = (hp - c) / e, ad = abs(d);
    if (ad.x > ad.y && ad.x > ad.z) n = vec3(sign(d.x), 0., 0.);     // plain ifs: nested ?: on vec3 breaks the D3D translation
    else if (ad.y > ad.z) n = vec3(0., sign(d.y), 0.);
    else n = vec3(0., 0., sign(d.z));
    return true;
  }
  void tubeBox(int i, out vec3 mn, out vec3 mx){ vec3 a = uTA[i], b = uTB[i]; mn = min(a, b) - vec3(uTW * .5); mx = max(a, b) + vec3(uTW * .5); }
  // scene: returns t, normal, kind (0 wall, 1 floor, 2 box, 3+i tube)
  float scene(vec3 ro, vec3 rd, out vec3 n, out int kind){
    vec3 bmin = vec3(-uRoom.x * .5, 0., -uRoom.z), bmax = vec3(uRoom.x * .5, uRoom.y, 0.);
    vec3 inv = 1. / rd, t0 = (bmin - ro) * inv, t1 = (bmax - ro) * inv, tmax = max(t0, t1);
    float t = min(min(tmax.x, tmax.y), tmax.z);
    if (t == tmax.x) n = vec3(-sign(rd.x), 0., 0.);
    else if (t == tmax.y) n = vec3(0., -sign(rd.y), 0.);
    else n = vec3(0., 0., -sign(rd.z));
    kind = 0; if (n.y > .5) kind = 1;
    float tt = 0.; vec3 nn = vec3(0);
    for (int i = 0; i < 4; i++) { if (i >= uNB) break; if (hitBox(ro, rd, uBMin[i], uBMax[i], tt, nn) && tt < t) { t = tt; n = nn; kind = 2; } }
    for (int i = 0; i < 12; i++) { if (i >= uNT) break; vec3 mn, mx; tubeBox(i, mn, mx); if (hitBox(ro, rd, mn, mx, tt, nn) && tt < t) { t = tt; n = nn; kind = 3 + i; } }
    return t;
  }
  vec3 cosDir(vec3 n){ float a = 6.2831853 * rnd(), r = sqrt(rnd()); vec3 u = normalize(abs(n.x) > .5 ? cross(n, vec3(0,1,0)) : cross(n, vec3(1,0,0))), v = cross(n, u); return normalize(u * cos(a) * r + v * sin(a) * r + n * sqrt(1. - r * r)); }
  void main(){
    st = uint(gl_FragCoord.x) * 1973u + uint(gl_FragCoord.y) * 9277u + uint(uFrame) * 26699u | 1u;
    vec2 uv = (gl_FragCoord.xy + vec2(rnd(), rnd()) - uRes * .5) / uRes.y;
    vec3 f = normalize(uLook - uEye), r = normalize(cross(f, vec3(0, 1, 0))), u = cross(r, f);
    float k = tan(radians(uFov) * .5) * 2.;
    vec3 ro = uEye, rd = normalize(f + (r * uv.x + u * uv.y) * k);
    vec3 acc = vec3(0), thr = vec3(1);
    for (int b = 0; b < 4; b++) {
      vec3 n; int kind; float t = scene(ro, rd, n, kind);
      if (kind >= 3) { if (b == 0) acc += thr * uTC[kind - 3] * uPower * .12; break; }   // looking at a tube: bright, not blinding
      vec3 x = ro + rd * t + n * 1e-4;
      float alb = kind == 1 ? uAlbedo * .8 : kind == 2 ? .08 : uAlbedo;
      // direct light: one tube, one point on it
      if (uNT > 0) {
        int i = int(rnd() * float(uNT)); i = min(i, uNT - 1);
        vec3 a = uTA[i], bb = uTB[i], p = mix(a, bb, rnd()), axis = bb - a; float len = length(axis); axis /= max(len, 1e-4);
        vec3 L = p - x; float d = length(L); L /= d;
        float cs = dot(n, L);
        if (cs > 0.) {
          vec3 sn; int sk; float st2 = scene(x, L, sn, sk);
          if (sk == 3 + i || st2 > d - uTW) {
            float ca = dot(axis, L); float proj = len * uTW * sqrt(max(0., 1. - ca * ca)) + uTW * uTW;   // pow() of a negative is NaN in GLSL
            acc += thr * (alb / 3.14159) * uTC[i] * uPower * cs * proj / (d * d) * float(uNT);
          }
        }
      }
      thr *= alb;
      if (b > 2) { float q = max(thr.r, max(thr.g, thr.b)); if (rnd() > q) break; thr /= q; }
      ro = x; rd = cosDir(n);
    }
    float lum = dot(acc, vec3(.3, .6, .1)); if (lum > 6.) acc *= 6. / lum;   // clamp fireflies: rare paths that would speckle for minutes
    vec4 prev = texelFetch(uPrev, ivec2(gl_FragCoord.xy), 0);
    o = prev + vec4(acc, 1.);
  }`;
  const SHOW = `#version 300 es
  precision highp float; uniform sampler2D uAcc; uniform float uExposure; out vec4 o;
  vec3 aces(vec3 x){ return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
  void main(){ vec4 a = texelFetch(uAcc, ivec2(gl_FragCoord.xy), 0); vec3 c = aces(a.rgb / max(a.a, 1.) * uExposure); o = vec4(pow(c, vec3(1. / 2.2)), 1.); }`;

  function tracer(size) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
    gl.getExtension('EXT_color_buffer_float');
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(x); return x; };
    const prog = (fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); return p; };
    const P = prog(FS), S = prog(SHOW);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const tex = [0, 1].map(() => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size, size, 0, gl.RGBA, gl.FLOAT, null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); return t; });
    const fb = tex.map(t => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; });
    const attrib = p => { const l = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); };
    let cur = 0, frame = 0, scene = null;
    return {
      canvas: cv,
      load(p) {
        scene = p; frame = 0;
        for (const f of fb) { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
      },
      step(n = 1) {
        const p = scene; gl.useProgram(P); attrib(P); gl.viewport(0, 0, size, size);
        const U = (name) => gl.getUniformLocation(P, name);
        gl.uniform2f(U('uRes'), size, size); gl.uniform3f(U('uRoom'), p.W, p.H, p.D); gl.uniform3fv(U('uEye'), p.eye); gl.uniform3fv(U('uLook'), p.look);
        gl.uniform1f(U('uFov'), p.fov); gl.uniform1f(U('uAlbedo'), p.albedo); gl.uniform1f(U('uPower'), p.power); gl.uniform1f(U('uTW'), p.w);
        gl.uniform1i(U('uNT'), p.tubes.length); gl.uniform1i(U('uNB'), p.boxes.length);
        const flat = (arr, key) => new Float32Array(Array.from({ length: 12 }, (_, i) => arr[i] ? arr[i][key] : [0, 0, 0]).flat());
        gl.uniform3fv(U('uTA'), flat(p.tubes, 'a')); gl.uniform3fv(U('uTB'), flat(p.tubes, 'b'));
        gl.uniform3fv(U('uTC'), new Float32Array(Array.from({ length: 12 }, (_, i) => p.tubes[i] ? TUBES[p.tubes[i].c] : [0, 0, 0]).flat()));
        gl.uniform3fv(U('uBMin'), new Float32Array(Array.from({ length: 4 }, (_, i) => p.boxes[i] ? p.boxes[i].min : [0, 0, 0]).flat()));
        gl.uniform3fv(U('uBMax'), new Float32Array(Array.from({ length: 4 }, (_, i) => p.boxes[i] ? p.boxes[i].max : [0, 0, 0]).flat()));
        for (let i = 0; i < n; i++) {
          gl.uniform1i(U('uFrame'), frame++);
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb[1 - cur]); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[cur]); gl.uniform1i(U('uPrev'), 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3); cur = 1 - cur;
        }
      },
      show(exposure = 1) {
        gl.useProgram(S); attrib(S); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, size, size);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[cur]); gl.uniform1i(gl.getUniformLocation(S, 'uAcc'), 0);
        gl.uniform1f(gl.getUniformLocation(S, 'uExposure'), exposure); gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      get frame() { return frame; },
    };
  }


const PLATES = [{"W": 7.60218349378556, "D": 5.436026459559798, "H": 3.4613403263967486, "w": 0.035, "boxes": [], "tubes": [{"a": [-2.4, 0.02, -2.9189459493769983], "b": [-2.4, 2.44, -2.9189459493769983], "c": "red"}, {"a": [-1.7142857142857144, 0.02, -2.9189459493769983], "b": [-1.7142857142857144, 2.44, -2.9189459493769983], "c": "green"}, {"a": [-1.0285714285714287, 0.02, -2.9189459493769983], "b": [-1.0285714285714287, 2.44, -2.9189459493769983], "c": "red"}, {"a": [-0.34285714285714297, 0.02, -2.9189459493769983], "b": [-0.34285714285714297, 2.44, -2.9189459493769983], "c": "green"}, {"a": [0.3428571428571425, 0.02, -2.9189459493769983], "b": [0.3428571428571425, 2.44, -2.9189459493769983], "c": "red"}, {"a": [1.0285714285714285, 0.02, -2.9189459493769983], "b": [1.0285714285714285, 2.44, -2.9189459493769983], "c": "green"}, {"a": [1.714285714285714, 0.02, -2.9189459493769983], "b": [1.714285714285714, 2.44, -2.9189459493769983], "c": "red"}, {"a": [2.4, 0.02, -2.9189459493769983], "b": [2.4, 2.44, -2.9189459493769983], "c": "green"}], "eye": [-1.8152668157798284, 1.55, -0.3739089336711913], "look": [3.80109174689278, 1.3297330249100923, -5.436026459559798], "fov": 61.41263082274236, "power": 22.469801906961948, "albedo": 0.764300415054895}, {"W": 7.60218349378556, "D": 5.436026459559798, "H": 3.4613403263967486, "w": 0.035, "boxes": [], "tubes": [{"a": [-2.4, 0.02, -2.9189459493769983], "b": [-2.4, 2.44, -2.9189459493769983], "c": "red"}, {"a": [-1.7142857142857144, 0.02, -2.9189459493769983], "b": [-1.7142857142857144, 2.44, -2.9189459493769983], "c": "green"}, {"a": [-1.0285714285714287, 0.02, -2.9189459493769983], "b": [-1.0285714285714287, 2.44, -2.9189459493769983], "c": "red"}, {"a": [-0.34285714285714297, 0.02, -2.9189459493769983], "b": [-0.34285714285714297, 2.44, -2.9189459493769983], "c": "green"}, {"a": [0.3428571428571425, 0.02, -2.9189459493769983], "b": [0.3428571428571425, 2.44, -2.9189459493769983], "c": "red"}, {"a": [1.0285714285714285, 0.02, -2.9189459493769983], "b": [1.0285714285714285, 2.44, -2.9189459493769983], "c": "green"}, {"a": [1.714285714285714, 0.02, -2.9189459493769983], "b": [1.714285714285714, 2.44, -2.9189459493769983], "c": "red"}, {"a": [2.4, 0.02, -2.9189459493769983], "b": [2.4, 2.44, -2.9189459493769983], "c": "green"}], "eye": [2.087421209481545, 0.9149694523774088, -3.3752102940808983], "look": [3.80109174689278, 1.7817094192374494, -5.436026459559798], "fov": 38.14404029515572, "power": 38.3567680134438, "albedo": 0.7468747856421396}, {"W": 7.138816208578646, "D": 6.108864046633244, "H": 3.160193180595525, "w": 0.035, "boxes": [], "tubes": [{"a": [3.439408104289323, 0.02, -5.978864046633244], "b": [1.781408104289323, 1.708, -5.978864046633244], "c": "coolwhite"}, {"a": [3.3694081042893234, 0.02, -5.908864046633243], "b": [1.7114081042893232, 1.708, -5.908864046633243], "c": "daylight"}, {"a": [3.299408104289323, 0.02, -5.838864046633244], "b": [1.641408104289323, 1.708, -5.838864046633244], "c": "blue"}], "eye": [1.8443768850993365, 0.9161128757987171, -4.172646990907379], "look": [3.569408104289323, 0.8571608603931963, -6.108864046633244], "fov": 51.13463579444215, "power": 23.93476917501539, "albedo": 0.7422238605236634}, {"W": 7.499872795306146, "D": 4.833140998147428, "H": 3.3995710463728757, "w": 0.035, "boxes": [], "tubes": [{"a": [3.619936397653073, 0.02, -4.703140998147428], "b": [1.961936397653073, 1.708, -4.703140998147428], "c": "blue"}, {"a": [3.5499363976530733, 0.02, -4.633140998147428], "b": [1.8919363976530732, 1.708, -4.633140998147428], "c": "uv"}], "eye": [2.284988546115346, 2.0645744553301486, -2.929975375928916], "look": [3.749936397653073, 1.7994882602244613, -4.833140998147428], "fov": 54.78458016412333, "power": 16.19272919651121, "albedo": 0.8073272501584142}, {"W": 6.608852834440768, "D": 6.310736492276192, "H": 3.5322537902276965, "w": 0.035, "boxes": [], "tubes": [{"a": [0.019889184898853163, 0.54591317670982, -6.250736492276192], "b": [2.459889184898853, 0.54591317670982, -6.250736492276192], "c": "red"}, {"a": [0.019889184898853163, 2.98591317670982, -6.250736492276192], "b": [2.459889184898853, 2.98591317670982, -6.250736492276192], "c": "yellow"}, {"a": [0.019889184898853163, 0.54591317670982, -6.250736492276192], "b": [0.019889184898853163, 2.98591317670982, -6.250736492276192], "c": "red"}, {"a": [2.459889184898853, 0.54591317670982, -6.250736492276192], "b": [2.459889184898853, 2.98591317670982, -6.250736492276192], "c": "red"}], "eye": [-2.804426417220384, 0.35, -0.5], "look": [3.304426417220384, 0.05, -6.010736492276192], "fov": 37.61244330089539, "power": 37.31734055560082, "albedo": 0.816372746839188}, {"W": 7.940970168448985, "D": 7.86210235580802, "H": 3.1845810703234747, "w": 0.035, "boxes": [], "tubes": [{"a": [3.8904850842244922, 0.02, -7.78210235580802], "b": [3.8904850842244922, 2.46, -7.78210235580802], "c": "green"}, {"a": [3.8204850842244924, 0.02, -7.712102355808019], "b": [3.8204850842244924, 2.46, -7.712102355808019], "c": "blue"}, {"a": [3.750485084224492, 0.02, -7.64210235580802], "b": [3.750485084224492, 2.46, -7.64210235580802], "c": "daylight"}], "eye": [-3.4704850842244923, 0.35, -0.5], "look": [3.9704850842244923, 0.05, -7.56210235580802], "fov": 38.51529270410538, "power": 39.589507893659174, "albedo": 0.8562440539430827}];

const q = new URLSearchParams(location.search);
const p = PLATES[Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1)) - 1];
const STILL = q.has('still');
const size = STILL ? 600 : Math.min(1100, Math.floor(Math.min(innerWidth, innerHeight)));   // one sample per css pixel keeps it alive
const T = tracer(size);
T.canvas.id = 'c'; document.body.append(T.canvas);
T.load(p);

// signed small, below the right edge of the image, on the dark
const mark = document.createElement('div');
mark.textContent = 'Claude Opus 5.5, 2026';
mark.style.cssText = 'position:fixed;font:10px system-ui,-apple-system,"Segoe UI",sans-serif;color:#555;white-space:nowrap';
document.body.append(mark);
const place = () => { const s = Math.min(innerWidth, innerHeight); mark.style.right = (innerWidth - s) / 2 + 10 + 'px'; mark.style.bottom = (innerHeight - s) / 2 + 8 + 'px'; };
place(); addEventListener('resize', place);

if (STILL) {
  (async () => { for (let i = 0; i < 90; i++) { T.step(8); await new Promise(r => setTimeout(r, 0)); } T.show(); window.drawn = true; })();
} else {
  window.drawn = true;
  const loop = () => { T.step(2); T.show(); requestAnimationFrame(loop); };
  loop();
}
