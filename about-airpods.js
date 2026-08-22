// ------------------------------------------------------------------
// AirPods, driven by scroll.
//
// Six beats across one pinned section: the case sits closed, turns,
// the lid swings open, the buds lift out, the case drops away, and the
// buds grow and turn before settling under a light that keeps orbiting.
//
// What had to be worked out about the model (tools/ has the scripts):
//
//  * 65 separate meshes, no baked animation — so every part moves under
//    our own timing rather than a canned clip.
//  * The scene graph splits at the top into buds (30 meshes) and case
//    (35). Within the case, the LID is the six meshes that reach the
//    full height of the open shell; everything lower is hinge and body.
//    Grouping on position alone put the inner tray with the lid, which
//    would have swung half the case open.
//  * It ships POSED OPEN. The closed state does not exist in the file,
//    so it is constructed here: lid rotated +125 degrees about the case's
//    back rim, buds dropped into their wells.
//  * 6.99MB -> 825KB via Draco + WebP. Draco needs its decoder, which is
//    why there is a second CDN path below.
// ------------------------------------------------------------------
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODEL = 'models/airpods-4.glb';
const DRACO = 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/';

// the buds live under this node; the lid is these six meshes
const BUDS_ROOT = 'NwGGgfiOhfXuluV';
const LID = ['tIkViEHUUFQAmea', 'bTVaRraRjrgTKif', 'OWQgrklvaGQVzql',
             'pYsNPIqDUEiOujl', 'yEMgjLzqNkCKSLZ', 'PmVlNPzgFCzzJWV'];
// ------------------------------------------------------------------
// TUNE ME. Everything you would want to nudge lives here; nothing below
// this block needs touching.
//
// `beats` are positions in the scroll, 0 = top of the section, 1 = the
// end. Each pair is [start, end] and they are meant to OVERLAP a little —
// that overlap is what makes it read as one move instead of a checklist.
// Keep every number inside 0..1 and keep start < end.
// ------------------------------------------------------------------
const TUNE = {
  scrollLength: 9,        // how many screen-heights the section is pinned for.
                          // Higher = slower, more scrolling per beat.

  beats: {
    turn:  [0.08, 0.34],  // 2 · the case spins
    lid:   [0.30, 0.50],  // 3 · the lid opens
    out:   [0.46, 0.66],  // 4 · the buds rise
    drop:  [0.62, 0.78],  // 5 · the case falls away
    hero:  [0.70, 0.94],  // 6 · the buds grow and turn
    light: [0.86, 1.00]   // 7 · the orbiting lights fade up
  },

  lidClosedDeg: 120,       // how far the lid is rotated shut. Found by sweeping
                          // 70/90/105/120 and looking: 70 leaves a gap, past 90
                          // it tips over the front and the buds show again.
                          // Tied to the hinge below — move that and this
                          // has to be re-found.
  lidHingeZ: 0.15,           // nudge the hinge forward (+) / back (-), as a
                          // share of case depth
  lidHingeY: .15,           // nudge the hinge up (+) / down (-), as a share of
                          // case height

  stowDepth: -0.15,        // how deep the buds sit below the case rim when
                          // closed, as a share of case height. The usable
                          // window is narrow — about -0.12 to -0.04. Below
                          // that the stems come out of the bottom, above it
                          // the buds rise over the rim. Found by x-raying the
                          // case at -0.15 / -0.08 / 0 / 0.08.
  turnTurns: 0,           // whole revolutions before the lid opens. 0 = the
                          // case does not spin at all; it just sits there and
                          // opens. Set to 1 to bring the turn back.
  turnEndDeg: 0,          // where the turn stops. 0 = dead front-on.

  modelSize: 3.4,         // on-screen size of the whole thing
  cameraZ: 9,             // pull back to make it smaller in frame

  budPartX: 0.004,        // how far the buds drift apart as they rise
  heroScale: 1.85,        // final bud size (1 = unchanged)
  heroSpinTurns: 0.8,     // how far the buds rotate in the hero beat
  heroSepFactor: 0.35,    // final gap between them, as a share of model width

  caseFallY: 0.09,        // how far the discarded case sinks
  caseTumble: 0.5,        // ...and how much it tips over, in radians

  // In the source pose the buds are splayed OUTWARD, which is invisible while
  // they float above the case but drives them straight through its side walls
  // once they are lowered in. These upright them again for the stowed pose,
  // and unwind to zero as they rise. Radians.
  stowTiltZ: 0,          // lean the pair upright (negative = close the splay)
  stowTiltX: 0,           // nod them forward/back into the wells

  heroTiltX: 0.5,         // how far the buds nod forward at full size
  heroTiltZ: 0.30,        // ...and how far they lean apart

  orbitSpeed: 1.0,        // multiplier on the circling lights
  orbitStrength: 1.0      // ...and on their brightness
};

// Tune from the address bar instead of editing this file:
//   about.html?tune=lidClosedDeg:140,lidHingeZ:0.03
// Handy while dialling a value in; the file stays the source of truth.
(function () {
  const q = new URLSearchParams(location.search).get('tune');
  if (!q) return;
  q.split(',').forEach(pair => {
    const [k, v] = pair.split(':');
    const n = parseFloat(v);
    if (k in TUNE && typeof TUNE[k] === 'number' && !isNaN(n)) TUNE[k] = n;
  });
})();

const LID_CLOSED = TUNE.lidClosedDeg * Math.PI / 180;

const stage = document.querySelector('[data-airpods]');
if (stage) init(stage);

// map a scroll position onto one beat, eased
const span = (p, a, b) => {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function init(host) {
  const canvas = host.querySelector('[data-airpods-canvas]');
  const status = host.querySelector('[data-airpods-status]');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
  cam.position.set(0, 0, TUNE.cameraZ);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.15;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(3, 5, 6);
  scene.add(key);

  // the two lights that circle the buds once everything has settled
  const orbitA = new THREE.PointLight(0xffffff, 0, 14, 2);
  const orbitB = new THREE.PointLight(0xbcd4ff, 0, 14, 2);
  scene.add(orbitA, orbitB);

  const rig = new THREE.Group();
  scene.add(rig);

  let parts = null, progress = 0, raf = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / r.height;
    cam.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(new DRACOLoader().setDecoderPath(DRACO));
  loader.load(MODEL, (gltf) => {
    parts = split(gltf.scene);
    rig.add(parts.root);
    if (status) status.remove();
    apply();
    hook();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, undefined, (err) => {
    console.error('[airpods] model failed to load', err);
    if (status) status.textContent = 'AirPods konden niet laden.';
  });

  function split(root) {
    root.updateWorldMatrix(true, true);

    const budsRoot = root.getObjectByName(BUDS_ROOT);
    const isLid = o => LID.some(p => o.name.startsWith(p) || (o.parent && o.parent.name.startsWith(p)));

    const meshes = [];
    root.traverse(o => { if (o.isMesh) meshes.push(o); });

    const box = new THREE.Box3(), c = new THREE.Vector3();
    const buckets = { case: [], lid: [], L: [], R: [] };
    meshes.forEach(o => {
      if (budsRoot && budsRoot.getObjectById(o.id)) {
        box.setFromObject(o); box.getCenter(c);
        buckets[c.x < 0 ? 'L' : 'R'].push(o);
      } else buckets[isLid(o) ? 'lid' : 'case'].push(o);
    });

    // The case fades out later, so its materials are cloned to keep that
    // local. They are NOT flagged transparent here: a transparent material
    // stops occluding, and the whole point of the closed case is that it
    // hides the buds. The flag goes on only once the fade actually starts.
    buckets.case.concat(buckets.lid).forEach(o => {
      o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone();
    });

    const caseBox = new THREE.Box3();
    buckets.case.forEach(o => caseBox.expandByObject(o));

    const holder = new THREE.Group();
    const caseGrp = new THREE.Group();
    // the lid turns about the case's back rim, and rides with the case
    const lidPivot = new THREE.Group();
    // The lid has no position of its own — it pivots, so this point is the
    // whole ball game. Deriving it from the CASE was wrong: caseBox.max.y is
    // set by a boss that stands proud of the body, and caseBox.min.z is the
    // very back of the shell, while the lid actually hinges lower and further
    // forward than either. The pivot ended up high and far back, so the lid
    // swung on too big an arc and floated off the case.
    //
    // Take it from the lid instead: its own bottom edge IS the hinge line.
    const lidBox = new THREE.Box3();
    buckets.lid.forEach(o => lidBox.expandByObject(o));
    const lidV = new THREE.Vector3();
    const edgeBand = (lidBox.max.y - lidBox.min.y) * 0.04;   // the bottom 4%
    let hingeZ = -Infinity;
    buckets.lid.forEach(o => {
      const pos = o.geometry.getAttribute('position');
      o.updateWorldMatrix(true, false);
      for (let i = 0; i < pos.count; i++) {
        lidV.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        // frontmost point along the lid's lowest edge
        if (lidV.y <= lidBox.min.y + edgeBand && lidV.z > hingeZ) hingeZ = lidV.z;
      }
    });
    if (!isFinite(hingeZ)) hingeZ = caseBox.min.z;

    lidPivot.position.set(
      0,
      lidBox.min.y + (caseBox.max.y - caseBox.min.y) * TUNE.lidHingeY,
      hingeZ + (caseBox.max.z - caseBox.min.z) * TUNE.lidHingeZ);
    const budL = new THREE.Group();
    const budR = new THREE.Group();

    // Each bud group is placed AT its own bud before the meshes are attached.
    // Left at the origin, the group would sit far below the buds, and scaling
    // it up would multiply that gap and fling them off the top of the frame.
    const lBox = new THREE.Box3(); buckets.L.forEach(o => lBox.expandByObject(o));
    const rBox = new THREE.Box3(); buckets.R.forEach(o => rBox.expandByObject(o));
    const homeL = lBox.getCenter(new THREE.Vector3());
    const homeR = rBox.getCenter(new THREE.Vector3());
    // How far the buds drop to be stowed. Measured HERE, while everything is
    // still in the model's own space: caseBox above was taken before any
    // re-parenting, and after the centring and scaling below the two would be
    // in different spaces entirely, making the subtraction meaningless.
    // The buds must end up below the case's FRONT RIM. Using caseBox.max.y
    // measures the hinge, which sticks up at the back — buds dropped to clear
    // that still poke out over the front, which is exactly what you see from
    // the camera. So measure the rim itself: the highest point of the case
    // across its front half.
    const midZ = (caseBox.min.z + caseBox.max.z) / 2;
    let rimY = -Infinity;
    const v = new THREE.Vector3();
    buckets.case.forEach(o => {
      const pos = o.geometry.getAttribute('position');
      o.updateWorldMatrix(true, false);
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (v.z > midZ && v.y > rimY) rimY = v.y;
      }
    });
    if (!isFinite(rimY)) rimY = caseBox.max.y;
    // Stowing is not a straight drop. In the source pose the buds stand OUT
    // of the case and sit forward of it — they reach z 0.014 while the case
    // front wall is at 0.011 — so lowering them alone leaves them poking
    // through the front. The offset moves them back into their wells as well
    // as down into them.
    const budsAll = lBox.clone().union(rBox);
    const caseCtr = caseBox.getCenter(new THREE.Vector3());
    const caseH = caseBox.max.y - caseBox.min.y;
    const stow = new THREE.Vector3(
      0,
      (rimY - budsAll.max.y) - caseH * TUNE.stowDepth,
      caseCtr.z - budsAll.getCenter(new THREE.Vector3()).z
    );
    budL.position.copy(homeL);
    budR.position.copy(homeR);

    holder.add(caseGrp, budL, budR);
    caseGrp.add(lidPivot);
    root.add(holder);

    // attach() keeps world transforms, so re-parenting does not move anything
    buckets.case.forEach(o => caseGrp.attach(o));
    buckets.lid.forEach(o => lidPivot.attach(o));
    buckets.L.forEach(o => budL.attach(o));
    buckets.R.forEach(o => budR.attach(o));

    // centre and scale the whole thing to a predictable size on screen
    const all = new THREE.Box3().setFromObject(root);
    const size = all.getSize(new THREE.Vector3());
    const ctr = all.getCenter(new THREE.Vector3());
    holder.position.sub(ctr);
    const outer = new THREE.Group();
    outer.add(holder);
    outer.scale.setScalar(TUNE.modelSize / Math.max(size.x, size.y, size.z));

    return { root: outer, holder, caseGrp, lidPivot, budL, budR, stow,
             homeL, homeR, heroSep: size.x * TUNE.heroSepFactor, heroY: ctr.y,   // frame centre, in the model's own space
             caseMats: buckets.case.concat(buckets.lid)
               .flatMap(o => Array.isArray(o.material) ? o.material : [o.material]) };
  }

  function apply() {
    if (!parts) return;
    const p = progress;

    // 1 · closed, easing into 2 · a full turn that lands facing the viewer.
    // The lid hinges at the BACK, so it opens away from camera — which only
    // reads if you are looking at the front. Stopping part-way round put the
    // opening on the far side.
    const turn = span(p, ...TUNE.beats.turn);
    parts.holder.rotation.y = turn * (Math.PI * 2 * TUNE.turnTurns + TUNE.turnEndDeg * Math.PI / 180);

    // 3 · the lid swings open
    parts.lidPivot.rotation.x = LID_CLOSED * (1 - span(p, ...TUNE.beats.lid));

    // 4 · the buds lift out of their wells and drift apart
    const out = span(p, ...TUNE.beats.out);
    const stowed = 1 - out;
    const baseL = parts.homeL.clone().addScaledVector(parts.stow, stowed);
    const baseR = parts.homeR.clone().addScaledVector(parts.stow, stowed);
    baseL.x -= out * TUNE.budPartX;
    baseR.x += out * TUNE.budPartX;

    // 5 · the case drops away
    const gone = span(p, ...TUNE.beats.drop);
    parts.caseGrp.position.y = -gone * TUNE.caseFallY;
    parts.caseGrp.rotation.z = gone * TUNE.caseTumble;
    const fading = gone > 0.001;
    parts.caseMats.forEach(m => {
      m.opacity = 1 - gone;
      // switching `transparent` rebuilds the shader, so only touch it on the
      // frame the state actually changes
      if (m.transparent !== fading) { m.transparent = fading; m.needsUpdate = true; }
    });
    parts.caseGrp.visible = gone < 0.999;

    // 6 · the buds grow and turn, then settle
    const hero = span(p, ...TUNE.beats.hero);
    const s = 1 + hero * (TUNE.heroScale - 1);
    parts.budL.scale.setScalar(s);
    parts.budR.scale.setScalar(s);
    const spin = hero * Math.PI * 2 * TUNE.heroSpinTurns;
    // `stowed` is 1 when tucked away and 0 once they are out, so the
    // uprighting unwinds exactly as they rise
    parts.budL.rotation.set(hero * TUNE.heroTiltX + stowed * TUNE.stowTiltX, spin,
                             hero * TUNE.heroTiltZ + stowed * TUNE.stowTiltZ);
    parts.budR.rotation.set(hero * TUNE.heroTiltX + stowed * TUNE.stowTiltX, spin,
                            -hero * TUNE.heroTiltZ - stowed * TUNE.stowTiltZ);
    // ...and travel to the middle of the frame rather than staying up where
    // the case used to hold them
    parts.budL.position.lerpVectors(baseL, new THREE.Vector3(-parts.heroSep, parts.heroY, 0), hero);
    parts.budR.position.lerpVectors(baseR, new THREE.Vector3( parts.heroSep, parts.heroY, 0), hero);


  }

  function hook() {
    if (!window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progress = 1; apply();
      return;
    }
    ScrollTrigger.create({
      trigger: host,
      start: 'top top',
      end: '+=' + window.innerHeight * TUNE.scrollLength,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => { progress = self.progress; apply(); }
    });
  }

  // the orbit runs on time, not scroll — it has to keep moving once you stop
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    const [lo, hi] = TUNE.beats.light;
    const lit = Math.max(0, Math.min(1, (progress - lo) / (hi - lo)));
    const w = t * TUNE.orbitSpeed;
    orbitA.intensity = lit * 26 * TUNE.orbitStrength;
    orbitB.intensity = lit * 20 * TUNE.orbitStrength;
    orbitA.position.set(Math.cos(w * 1.1) * 4, Math.sin(w * 0.7) * 2.2, Math.sin(w * 1.1) * 4);
    orbitB.position.set(Math.cos(-w * 0.8 + 2) * 4.4, Math.sin(-w * 1.3) * 2, Math.sin(-w * 0.8 + 2) * 4.4);
    if (parts) parts.root.position.y = Math.sin(t * 0.8) * 0.05;
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(tick);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => {
      if (e[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
      else { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 }).observe(host);
  }
}
