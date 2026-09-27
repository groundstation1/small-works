// Figure: a simulated body (bones, joints, gravity, a floor, rhythmic muscles, a posture reflex)
// in a dark room, photographed with the shutter open. You never see it; only the light it leaves.
// The body is lit from the upper left: a sharp rim where the light catches it, a soft mass in shadow.
// After Marey, Muybridge and long-exposure photography. Six bodies kept from about seventy (lab/body.html).

const PLATES = [{"m": {"neck": {"base": -0.05167276575230062, "amp": 0.010075987956952304, "f": 1.129859110340476, "ph": 0}, "spine": {"base": 0.2548357436899096, "amp": 0.2466798261157237, "f": 2.259718220680952, "ph": 5.810730722632259}, "hipL": {"base": 0.1003841108875349, "amp": 0.7656102251261474, "f": 1.129859110340476, "ph": 0}, "hipR": {"base": -0.0963727632071823, "amp": 0.5500871088551514, "f": 1.129859110340476, "ph": 3.0843776701776555}, "kneeL": {"base": -0.8157911617774515, "amp": 0.7342120455997063, "f": 1.129859110340476, "ph": -1.57}, "kneeR": {"base": -0.8157911617774515, "amp": 0.5275276742601274, "f": 1.129859110340476, "ph": 1.571592653589793}, "shL": {"base": -0.0011394155211746915, "amp": 0.2459907112643123, "f": 1.129859110340476, "ph": 3.141592653589793}, "shR": {"base": 0.1054797124117613, "amp": 0.2459907112643123, "f": 1.129859110340476, "ph": 0}, "elL": {"base": 0.15808498347178102, "amp": 0.32429739471990615, "f": 1.129859110340476, "ph": 0}, "elR": {"base": 0.6198021383956075, "amp": 0.008772281580604613, "f": 1.129859110340476, "ph": 3.141592653589793}}, "balance": 0.7691259296843782, "stiff": 0.37616560554597533, "push": 0.7874922098591924, "mu": 0.6151840506191365, "vx": 1.6176999643910677, "lean": 0.036222832289058704, "T": 6.524388153105974, "seed": 45}, {"m": {"neck": {"base": 0.262499712780118, "amp": 0.034531173727009444, "f": 1.0996501922607422, "ph": 0}, "spine": {"base": 0.09388212049379946, "amp": 0.06793668679893017, "f": 2.1993003845214845, "ph": 4.617030033997726}, "hipL": {"base": -0.005307740345597278, "amp": 0.6192638548091054, "f": 1.0996501922607422, "ph": 0}, "hipR": {"base": 0.17107034295331686, "amp": 0.504609883448315, "f": 1.0996501922607422, "ph": 2.99058800086625}, "kneeL": {"base": -0.5861148757860064, "amp": 0.5275033882074058, "f": 1.0996501922607422, "ph": -1.57}, "kneeR": {"base": -0.5861148757860064, "amp": 0.4298384625144708, "f": 1.0996501922607422, "ph": 1.571592653589793}, "shL": {"base": 0.2406090666074306, "amp": 0.5694891859544442, "f": 1.0996501922607422, "ph": 3.141592653589793}, "shR": {"base": -0.27269255155697464, "amp": 0.5694891859544442, "f": 1.0996501922607422, "ph": 0}, "elL": {"base": 0.10907080052420497, "amp": 0.317579344031401, "f": 1.0996501922607422, "ph": 0}, "elR": {"base": 0.94860130995512, "amp": 0.07595189695712179, "f": 1.0996501922607422, "ph": 3.141592653589793}}, "balance": 0.4166218169499189, "stiff": 0.31061335543636237, "push": 0.6525990132708103, "mu": 0.73530768081313, "vx": 0.7569992168108002, "lean": 0.2011889625689946, "T": 5.237133501563221, "seed": 43}, {"m": {"neck": {"base": 0.06782334423623981, "amp": 0.04070919564692303, "f": 2.1418042927980423, "ph": 0}, "spine": {"base": 0.047168684331700184, "amp": 0.19344318116782233, "f": 4.283608585596085, "ph": 1.2236475071508903}, "hipL": {"base": 0.15745914233848451, "amp": 0.6245159365236759, "f": 2.1418042927980423, "ph": 0}, "hipR": {"base": 0.28157271451782434, "amp": 0.4268605040179547, "f": 2.1418042927980423, "ph": 3.116047936126015}, "kneeL": {"base": -0.2593966138316318, "amp": 0.23345695244846865, "f": 2.1418042927980423, "ph": -1.57}, "kneeR": {"base": -0.2593966138316318, "amp": 0.1595692704710844, "f": 2.1418042927980423, "ph": 1.571592653589793}, "shL": {"base": 0.11950038392096757, "amp": 0.9333523043431342, "f": 2.1418042927980423, "ph": 3.141592653589793}, "shR": {"base": -0.26187649397179485, "amp": 0.9333523043431342, "f": 2.1418042927980423, "ph": 0}, "elL": {"base": 0.5531481759622693, "amp": 0.12517786084208637, "f": 2.1418042927980423, "ph": 0}, "elR": {"base": 0.6736032010987401, "amp": 0.3249902984825894, "f": 2.1418042927980423, "ph": 3.141592653589793}}, "balance": 0.20728474203497171, "stiff": 0.31273690215311944, "push": 0.4407872828654945, "mu": 0.7203336387104354, "vx": 0.32546766819432377, "lean": 0.062247848522383714, "T": 7.721667586360127, "seed": 68}, {"m": {"neck": {"base": 0.2078590838704258, "amp": 0.06970942004118115, "f": 1.4265528704971076, "ph": 0}, "spine": {"base": 0.13958116406574844, "amp": 0.11014205793617293, "f": 2.853105740994215, "ph": 0.7681063977538143}, "hipL": {"base": -0.1592599164461717, "amp": 0.60562276057899, "f": 1.4265528704971076, "ph": 0}, "hipR": {"base": 0.05128892110660671, "amp": 0.3956200908454792, "f": 1.4265528704971076, "ph": 2.872140073770378}, "kneeL": {"base": -0.4787133756559342, "amp": 0.4308420380903408, "f": 1.4265528704971076, "ph": -1.57}, "kneeR": {"base": -0.4787133756559342, "amp": 0.2814454431771982, "f": 1.4265528704971076, "ph": 1.571592653589793}, "shL": {"base": 0.2679659364279359, "amp": 0.3682857751846314, "f": 1.4265528704971076, "ph": 3.141592653589793}, "shR": {"base": 0.08486773995682595, "amp": 0.3682857751846314, "f": 1.4265528704971076, "ph": 0}, "elL": {"base": 0.7881673791445791, "amp": 0.44355898012872785, "f": 1.4265528704971076, "ph": 0}, "elR": {"base": 1.094030764326453, "amp": 0.31511563330423087, "f": 1.4265528704971076, "ph": 3.141592653589793}}, "balance": 0.042145739682018755, "stiff": 0.17228695009835066, "push": 0.5197224462870509, "mu": 0.7174868865683675, "vx": 0.3228011906147003, "lean": 0.07745505588827654, "T": 7.932539193192497, "seed": 64}, {"m": {"neck": {"base": 0.25864739175885915, "amp": 0.11859737547347321, "f": 0.6116605568677187, "ph": 0}, "spine": {"base": -0.10510200564749539, "amp": 0.13511811097851023, "f": 1.2233211137354374, "ph": 2.288097239995841}, "hipL": {"base": -0.03930528128985317, "amp": 0.9818142706528306, "f": 0.6116605568677187, "ph": 0}, "hipR": {"base": -0.06568353592883797, "amp": 0.7137523657626372, "f": 0.6116605568677187, "ph": 3.3343520582619535}, "kneeL": {"base": -0.9257640230469404, "amp": 0.8331876207422464, "f": 0.6116605568677187, "ph": -1.57}, "kneeR": {"base": -0.9257640230469404, "amp": 0.6057048193376724, "f": 0.6116605568677187, "ph": 1.571592653589793}, "shL": {"base": -0.0086265033110976, "amp": 0.33116940986365084, "f": 0.6116605568677187, "ph": 3.141592653589793}, "shR": {"base": 0.22792824022471908, "amp": 0.33116940986365084, "f": 0.6116605568677187, "ph": 0}, "elL": {"base": 0.9236092071980238, "amp": 0.38042600045446306, "f": 0.6116605568677187, "ph": 0}, "elR": {"base": 0.07873251736164093, "amp": 0.05482116364873946, "f": 0.6116605568677187, "ph": 3.141592653589793}}, "balance": 0.11470588934607805, "stiff": 0.3062082236632705, "push": 0.7891219235491008, "mu": 0.6279050017870031, "vx": 0.5833999235881493, "lean": 0.15532217489089817, "T": 4.7950803835410625, "seed": 65}, {"m": {"neck": {"base": 0.19709935546852647, "amp": 0.12661109024193137, "f": 1.85238970965147, "ph": 0}, "spine": {"base": -0.22157768048346044, "amp": 0.03127969003980979, "f": 3.70477941930294, "ph": 1.9463083155865317}, "hipL": {"base": 0.02837809531483798, "amp": 0.7172290917485953, "f": 1.85238970965147, "ph": 0}, "hipR": {"base": -0.007693247334100317, "amp": 0.5597577627014373, "f": 1.85238970965147, "ph": 3.3518410713976143}, "kneeL": {"base": -0.3319334517000243, "amp": 0.29874010653002186, "f": 1.85238970965147, "ph": -1.57}, "kneeR": {"base": -0.3319334517000243, "amp": 0.2331501825347725, "f": 1.85238970965147, "ph": 1.571592653589793}, "shL": {"base": -0.2932954047806561, "amp": 0.8633497774368153, "f": 1.85238970965147, "ph": 3.141592653589793}, "shR": {"base": -0.25400750236585734, "amp": 0.8633497774368153, "f": 1.85238970965147, "ph": 0}, "elL": {"base": 0.07483035083860158, "amp": 0.017632052884437144, "f": 1.85238970965147, "ph": 0}, "elR": {"base": 0.3136995191685855, "amp": 0.012801659642718732, "f": 1.85238970965147, "ph": 3.141592653589793}}, "balance": 0.7993695426732302, "stiff": 0.4190742673119531, "push": 0.3868584810756147, "mu": 0.7634226721641607, "vx": 0.954032853897661, "lean": 0.28526061784941703, "T": 6.120321131078526, "seed": 71}];
const q = new URLSearchParams(location.search);
const p = PLATES[Math.min(PLATES.length, Math.max(1, parseInt(q.get('plate'), 10) || 1)) - 1];
const STILL = q.has('still');

// joints: 0 head, 1 neck, 2 pelvis, 3 kneeL, 4 footL, 5 kneeR, 6 footR, 7 elbowL, 8 handL, 9 elbowR, 10 handR, 11 mid-spine
const REST = [[0, 1.74], [0, 1.47], [0, 0.93], [0.03, 0.48], [0.03, 0.03], [-0.03, 0.48], [-0.03, 0.03], [0.02, 1.17], [0.04, 0.9], [-0.02, 1.17], [-0.04, 0.9], [0.01, 1.2]];
const BONES = [[0, 1], [1, 11], [11, 2], [2, 3], [3, 4], [2, 5], [5, 6], [1, 7], [7, 8], [1, 9], [9, 10]];
const THICK = [0.2, 0.32, 0.27, 0.16, 0.12, 0.16, 0.12, 0.1, 0.08, 0.1, 0.08];
const MUSCLES = { neck: [1, 11, 0], spine: [11, 2, 1], hipL: [2, 11, 3], kneeL: [3, 2, 4], hipR: [2, 11, 5], kneeR: [5, 2, 6], shL: [1, 11, 7], elL: [7, 1, 8], shR: [1, 11, 9], elR: [9, 1, 10] };
const REST_ANGLE = { neck: 0, spine: 0, hipL: 0, kneeL: 0, hipR: 0, kneeR: 0, shL: Math.PI, elL: 0, shR: Math.PI, elR: 0 };
  const PROFILE = {
    chest: [[0, 0.055, 0.05], [0.12, 0.11, 0.08], [0.45, 0.125, 0.135], [0.8, 0.11, 0.12], [1, 0.105, 0.11]],
    belly: [[0, 0.105, 0.11], [0.4, 0.11, 0.12], [0.75, 0.14, 0.115], [0.92, 0.15, 0.1], [1, 0.12, 0.085]],
    thigh: [[0, 0.085, 0.085], [0.15, 0.085, 0.095], [0.55, 0.07, 0.075], [0.92, 0.05, 0.055], [1, 0.05, 0.05]],
    shin: [[0, 0.05, 0.05], [0.25, 0.065, 0.045], [0.55, 0.05, 0.04], [0.9, 0.03, 0.032], [1, 0.03, 0.03]],
    upper: [[0, 0.05, 0.052], [0.25, 0.042, 0.05], [0.7, 0.036, 0.04], [1, 0.033, 0.034]],
    fore: [[0, 0.036, 0.038], [0.3, 0.04, 0.036], [0.8, 0.026, 0.026], [1, 0.022, 0.022]],
  };
  const HEAD = [[0, -0.05], [0.05, -0.06], [0.13, -0.1], [0.21, -0.095], [0.265, -0.04], [0.27, 0.02], [0.245, 0.07],
                [0.2, 0.09], [0.17, 0.092], [0.15, 0.117], [0.132, 0.1], [0.115, 0.098], [0.1, 0.1], [0.085, 0.092],
                [0.07, 0.082], [0.058, 0.035], [0.03, 0.045], [0, 0.048]];      // (along from neck to head, towards the face)
  const FOOT = [[-0.055, -0.03], [-0.065, 0.02], [-0.045, 0.06], [0.06, 0.07], [0.19, 0.068], [0.215, 0.055],
                [0.2, 0.035], [0.1, 0.005], [0.03, -0.035]];                   // (along the foot, towards the sole)
  function drawHuman(g, P, k, H) {
    const X = ([x, y]) => [x * k, H - 0.12 * k - y * k];
    const frame = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6; return { a, L, d: [dx / L, dy / L], n: [-dy / L, dx / L] }; };
    const at = (F, u, v) => X([F.a[0] + F.d[0] * u + F.n[0] * v, F.a[1] + F.d[1] * u + F.n[1] * v]);
    const smooth = pts => {                                             // a closed curve through the midpoints: no corners
      g.beginPath();
      const m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      let s = m(pts[pts.length - 1], pts[0]); g.moveTo(s[0], s[1]);
      for (let i = 0; i < pts.length; i++) { const e = m(pts[i], pts[(i + 1) % pts.length]); g.quadraticCurveTo(pts[i][0], pts[i][1], e[0], e[1]); }
      g.closePath(); g.fill();
    };
    const limb = (a, b, prof) => {                                      // a, b: joint indices or points
      const F = frame(Array.isArray(a) ? a : P[a], Array.isArray(b) ? b : P[b]), back = prof.map(([u, w]) => at(F, u * F.L, -w)), front = prof.map(([u, , w]) => at(F, u * F.L, w)).reverse();
      smooth([...back, ...front]);
    };
    limb(1, 11, PROFILE.chest); limb(11, 2, PROFILE.belly);
    for (const [hip, knee, foot] of [[2, 3, 4], [2, 5, 6]]) {
      limb(hip, knee, PROFILE.thigh); limb(knee, foot, PROFILE.shin);
      // the foot: at right angles to the shin, pointing forwards; flat once it is on the floor
      const S = frame(P[knee], P[foot]); let dir = [S.n[0], S.n[1]];
      if (P[foot][1] < 0.06) { const w = 1 - P[foot][1] / 0.06; dir = [dir[0] * (1 - w) + w * Math.sign(S.n[0] || 1), dir[1] * (1 - w)]; }
      const dl = Math.hypot(dir[0], dir[1]) || 1, Fd = { a: P[foot], d: [dir[0] / dl, dir[1] / dl], n: [0, 0] };
      Fd.n = [Fd.d[1] * Math.sign(S.n[0] || 1), -Fd.d[0] * Math.sign(S.n[0] || 1)];       // towards the sole
      smooth(FOOT.map(([u, v]) => at(Fd, u, v)));
    }
    for (const [sh, el, hand] of [[1, 7, 8], [1, 9, 10]]) {
      const shoulder = [P[sh][0] * 0.8 + P[11][0] * 0.2, P[sh][1] * 0.8 + P[11][1] * 0.2];   // the arm hangs from just below the neck
      limb(shoulder, el, PROFILE.upper); limb(el, hand, PROFILE.fore);
      // the hand: palm on from the wrist, four fingers and a thumb, a little curled
      const F = frame(P[el], P[hand]);
      const palm = [[0, -0.022], [0.09, -0.03], [0.1, 0.03], [0.02, 0.026]].map(([u, v]) => at({ ...F, a: P[hand] }, u, v));
      smooth(palm);
      g.lineCap = 'round';
      [-0.022, -0.008, 0.007, 0.021].forEach((v, i) => {
        const len = [0.075, 0.085, 0.08, 0.065][i], Fh = { ...F, a: P[hand] };
        const p0 = at(Fh, 0.09, v), p1 = at(Fh, 0.09 + len * 0.6, v * 1.1 + 0.006), p2 = at(Fh, 0.09 + len, v * 1.15 + 0.018);
        g.lineWidth = 0.017 * k; g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]); g.stroke();
      });
      const Fh = { ...F, a: P[hand] }, t0 = at(Fh, 0.015, 0.025), t1 = at(Fh, 0.05, 0.05), t2 = at(Fh, 0.085, 0.052);
      g.lineWidth = 0.02 * k; g.beginPath(); g.moveTo(t0[0], t0[1]); g.quadraticCurveTo(t1[0], t1[1], t2[0], t2[1]); g.stroke();
    }
    // neck and head, facing the way the body faces
    const Fn = frame(P[1], P[0]); Fn.n = [Fn.d[1], -Fn.d[0]];              // head frame: along = up the neck, n = towards the face
    smooth(HEAD.map(([u, v]) => at(Fn, u, v)));
  }

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
