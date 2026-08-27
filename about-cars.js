// ------------------------------------------------------------------
// Cars. Pick one from the row at the bottom: the one on screen drives
// off, the next drives in behind it.
//
// Notes on the models (measured, see the check in tools/):
//
//  * All three point the same way — nose along -Z — so "forward" is one
//    direction for every car and the drive-off needs no special cases.
//  * Their scales do not match at all. The Mercedes and Ferrari are in
//    metres (~4.6m long); the BMW is a hundredth of that. Each is scaled
//    to a fixed on-screen length rather than trusted.
//  * 46MB of source became 6.5MB (Draco + WebP, textures capped at 1024).
//    The Ferrari alone went 26MB -> 2.6MB; it carries 539k vertices, so
//    the win is almost all geometry compression.
//
// Only the selected car is fetched, and each is kept once loaded, so the
// page costs one car up front rather than three.
// ------------------------------------------------------------------
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const DRACO = 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/';

const TUNE = {
  length: 6.3,        // every car is scaled to this on-screen length

  // Two angles, because the car turns as it arrives. At yaw 0 the nose
  // points -Z (down the road, away from camera); the camera sits out on +X,
  // so swinging towards -PI/2 brings the nose round to face the viewer.
  driveYaw: 0.05,     // while moving — near enough straight down the road
  parkYaw: 1.15,      // parked: about 55 degrees, a three-quarter FRONT.
                      // Sign matters and depends on where the camera sits:
                      // with it out on +X, positive swings the nose towards
                      // you, negative shows you the tail.
  turnLead: -.01,     // how late in the arrival the turn starts, 0..1
  // Just past the frame edge — the visible width at the car's distance is
  // about 6 units, so 8 is off-screen right without a long dead run-up.
  driveOut: 9,       // a leaving car exits to the left
  driveIn: -8,         // the next one waits off the right edge
  outTime: 0.85,      // seconds to leave
  inTime: 1.05        // ...and to arrive
};

const host = document.querySelector('[data-cars]');
if (host) init(host);

function init(root) {
  const D = (window.ABOUT && window.ABOUT.cars) || [];
  if (!D.length) return;

  const canvas = root.querySelector('[data-cars-canvas]');
  const menu = root.querySelector('[data-cars-menu]');
  const nameEl = root.querySelector('[data-cars-name]');
  const yearEl = root.querySelector('[data-cars-year]');
  const noteEl = root.querySelector('[data-cars-note]');
  const status = root.querySelector('[data-cars-status]');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  // Square-on to the road. With the camera off the Z axis the road runs into
  // the distance, so an arriving car mostly grows towards you instead of
  // sweeping in from the edge. At z = 0 the Z axis is exactly screen-
  // horizontal: +Z is screen-right, and a car entering from there crosses the
  // frame at a constant size. The three-quarter view comes from the car's own
  // yaw instead of from the camera.
  cam.position.set(7.2, 1.45, 0);
  cam.lookAt(0, 0.55, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.25;

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(6, 8, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(-7, 3, -6);
  scene.add(rim);

  const stage = new THREE.Group();
  scene.add(stage);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(new DRACOLoader().setDecoderPath(DRACO));

  const cache = new Map();
  let current = null;      // { group } on stage
  let index = -1;
  let busy = false;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / r.height;
    cam.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  let raf = 0;
  const clock = new THREE.Clock();
  const tick = () => {
    raf = requestAnimationFrame(tick);
    // a slow drift so a parked car is not a still image
    if (current && !busy) {
      const t = clock.getElapsedTime();
      current.group.position.y = Math.sin(t * 0.7) * 0.02;
    }
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(tick);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => {
      if (e[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
      else { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 }).observe(root);
  }

  function load(i) {
    const car = D[i];
    if (cache.has(car.file)) return Promise.resolve(cache.get(car.file).clone(true));
    if (status) status.textContent = 'Laden…';
    return new Promise((resolve, reject) => {
      loader.load(car.file, (gltf) => {
        const model = gltf.scene;
        // normalise: centre on the ground, scale to a fixed length, face -Z
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const ctr = box.getCenter(new THREE.Vector3());
        const s = TUNE.length / Math.max(size.x, size.y, size.z);
        model.position.set(-ctr.x, -box.min.y, -ctr.z);
        // A per-car correction for models built facing the other way, baked in
        // on its own node so the heading animation above stays uniform.
        const spinner = new THREE.Group();
        spinner.add(model);
        spinner.rotation.y = (car.spin || 0) * Math.PI / 180;
        const inner = new THREE.Group();
        inner.add(spinner);
        inner.scale.setScalar(s);
        cache.set(car.file, inner);
        if (status) status.textContent = '';
        resolve(inner.clone(true));
      }, undefined, (err) => {
        console.error('[cars] failed to load', car.file, err);
        if (status) status.textContent = 'Model kon niet laden.';
        reject(err);
      });
    });
  }

  function setBusy(on) {
    busy = on;
    [].slice.call(menu.children).forEach(b => {
      b.disabled = on;
      b.classList.toggle('is-busy', on);
    });
  }

  function label(i) {
    const car = D[i];
    if (nameEl) nameEl.textContent = car.name || '';
    if (yearEl) yearEl.textContent = car.year || '';
    if (noteEl) noteEl.textContent = car.note || '';
    [].slice.call(menu.children).forEach((b, j) => {
      b.classList.toggle('is-on', j === i);
      b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    });
  }

  async function show(i) {
    if (busy || i === index) return;
    setBusy(true);
    label(i);

    const arriving = await load(i).catch(() => null);
    if (!arriving) { setBusy(false); return; }

    arriving.rotation.y = TUNE.driveYaw;
    arriving.position.set(0, 0, TUNE.driveIn);
    stage.add(arriving);

    const leaving = current;
    const g = window.gsap;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!g || still) {
      if (leaving) stage.remove(leaving.group);
      arriving.position.z = 0;
      arriving.rotation.y = TUNE.parkYaw;
      current = { group: arriving };
      index = i;
      setBusy(false);
      return;
    }

    const tl = g.timeline({
      onComplete: () => {
        if (leaving) stage.remove(leaving.group);
        current = { group: arriving };
        index = i;
        setBusy(false);
      }
    });

    if (leaving) {
      // forward is -Z for every one of these models, so a leaving car just
      // accelerates along it — power2.in so it pulls away rather than glides.
      // It straightens out of its parked angle first, the way a car would.
      tl.to(leaving.group.rotation, { y: TUNE.driveYaw, duration: TUNE.outTime * 0.6, ease: 'power2.in' }, 0)
        .to(leaving.group.position, { z: TUNE.driveOut, duration: TUNE.outTime, ease: 'power2.in' }, 0);
    }
    const at = leaving ? TUNE.outTime * 0.55 : 0;
    tl.to(arriving.position, { z: 0, duration: TUNE.inTime, ease: 'power3.out' }, at)
      // the turn starts once it is most of the way in, so it arrives and
      // swings its nose round rather than crabbing in sideways
      .to(arriving.rotation, { y: TUNE.parkYaw, duration: TUNE.inTime * 0.72, ease: 'power2.inOut' },
          at + TUNE.inTime * TUNE.turnLead);
  }

  D.forEach((car, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cars__pick';
    b.textContent = car.name || ('Car ' + (i + 1));
    b.addEventListener('click', () => show(i));
    menu.appendChild(b);
  });

  show(0);
}
