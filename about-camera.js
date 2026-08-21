// ------------------------------------------------------------------
// The photography tile opens into a 3D camera.
//
// Click the tile: the other hobbies slide aside, the camera rises out of
// the tile, fires a flash, turns to show its back, and the photos appear
// on its rear screen.
//
// Two things about the model are worth knowing (see tools/ and the notes
// in about-data.js):
//
//  * It is ONE mesh with ONE material — there is no named "screen" to
//    hand a texture to. The screen was found by shape instead: a flat,
//    back-facing island of 32 triangles at z -15.23, 13.19 x 8.99, which
//    is the 3:2 of a Sony rear LCD. A plane is laid over exactly that
//    rectangle, so the photos need no texture surgery.
//
//  * The .glb ships at 1.3MB, down from 21MB. All of that was texture:
//    two 4096 PNGs became 2048 WebP. Geometry was already light (22k
//    verts) and is untouched, so no Draco decoder is needed.
//
// three.js is loaded as a module from a CDN; everything else on this site
// is dependency-free, so this is the one place that is not.
// ------------------------------------------------------------------
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODEL = 'models/sony-camera-2048.glb';

// the rear screen, in the model's own coordinates
const SCREEN = { x0: -3.23, x1: 9.96, y0: 1.95, y1: 10.93, z: -15.23 };
const SCREEN_W = SCREEN.x1 - SCREEN.x0;
const SCREEN_H = SCREEN.y1 - SCREEN.y0;

const stage = document.querySelector('[data-camera-stage]');
const tile = document.querySelector('.focus-photo');
const section = document.querySelector('#ab-hobby');
if (stage && tile && section) boot();

function boot() {
  const shots = (window.ABOUT && window.ABOUT.photos) || [];
  let started = false;
  let api = null;

  const open = () => {
    if (started) return;
    started = true;
    section.classList.add('is-camera-open');
    api = build(shots);
  };
  const close = () => {
    if (!started) return;
    started = false;
    section.classList.remove('is-camera-open');
    if (api) { api.dispose(); api = null; }
  };

  tile.classList.add('is-clickable');
  tile.setAttribute('role', 'button');
  tile.setAttribute('tabindex', '0');
  tile.setAttribute('aria-expanded', 'false');
  const toggle = () => {
    const on = section.classList.contains('is-camera-open');
    tile.setAttribute('aria-expanded', on ? 'false' : 'true');
    on ? close() : open();
  };
  tile.addEventListener('click', toggle);
  tile.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
  const back = stage.querySelector('[data-camera-close]');
  if (back) back.addEventListener('click', () => { tile.setAttribute('aria-expanded', 'false'); close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && section.classList.contains('is-camera-open')) {
      tile.setAttribute('aria-expanded', 'false'); close();
    }
  });
}

function build(shots) {
  const host = stage.querySelector('[data-camera-canvas]');
  const flash = stage.querySelector('[data-camera-flash]');
  const status = stage.querySelector('[data-camera-status]');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  cam.position.set(0, 0, 42);

  // A metallic-roughness material renders black without something to
  // reflect. RoomEnvironment builds a studio box on the fly, so the body
  // gets highlights without shipping an HDR file.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  // a black body on a black page reads as a silhouette without this
  scene.environmentIntensity = 1.5;

  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(4, 8, 10);
  scene.add(key);
  // two rims, one each side, to draw an edge against the black background
  const rimL = new THREE.DirectionalLight(0xffffff, 2.2);
  rimL.position.set(-9, 3, -6);
  scene.add(rimL);
  const rimR = new THREE.DirectionalLight(0xffffff, 1.6);
  rimR.position.set(9, -2, -7);
  scene.add(rimR);

  const rig = new THREE.Group();      // what the animation turns
  scene.add(rig);

  let raf = 0, disposed = false, screenMat = null, cycle = 0;
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

  new GLTFLoader().load(MODEL, (gltf) => {
    if (disposed) return;
    const model = gltf.scene;

    // centre the model on its own bounding box so it turns about itself
    const box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(centre);

    const holder = new THREE.Group();
    holder.add(model);
    // scale so the longest edge is a predictable height in view
    holder.scale.setScalar(26 / Math.max(size.x, size.y, size.z));
    rig.add(holder);

    // --- the screen ---------------------------------------------------
    // SCREEN is in the mesh's own space, so the plane is added inside the
    // model and inherits every transform above it — including the scene
    // node scale Sketchfab exports, which is why it cannot be positioned
    // from world coordinates.
    const mesh = model.getObjectByProperty('isMesh', true);
    const geo = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H);
    screenMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a, transparent: true, opacity: 1, toneMapped: false
    });
    const panel = new THREE.Mesh(geo, screenMat);
    panel.position.set((SCREEN.x0 + SCREEN.x1) / 2, (SCREEN.y0 + SCREEN.y1) / 2, SCREEN.z - 0.05);
    panel.rotation.y = Math.PI;        // face -z, same way as the screen
    (mesh ? mesh.parent : model).add(panel);

    if (status) status.textContent = '';
    play(holder, panel, shots);
  }, undefined, (err) => {
    // a failed model must not leave a blank hole where the tile used to be
    console.error('[about-camera] model failed to load', err);
    if (status) status.textContent = 'Camera kon niet laden.';
  });

  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    rig.position.y = Math.sin(t * 0.9) * 0.22;      // slow idle float
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(tick);

  // --- the sequence ---------------------------------------------------
  function play(holder, panel, list) {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = window.gsap ? gsap.timeline() : null;

    // start turned away and small, as though coming out of the tile
    holder.rotation.set(0, Math.PI * 0.08, 0);
    rig.scale.setScalar(0.2);
    rig.position.z = -18;

    const fire = () => {
      if (!flash) return;
      flash.classList.remove('is-firing');
      void flash.offsetWidth;                        // restart the animation
      flash.classList.add('is-firing');
    };

    const showShots = () => {
      if (!list.length) {
        screenMat.color.set(0x11161c);
        return;
      }
      const loader = new THREE.TextureLoader();
      const next = () => {
        if (disposed) return;
        const src = list[cycle % list.length];
        cycle++;
        loader.load(src, (tex) => {
          if (disposed) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          // cover the 3:2 panel without squashing the photo
          const target = SCREEN_W / SCREEN_H;
          const actual = tex.image.width / tex.image.height;
          if (actual > target) {
            tex.repeat.set(target / actual, 1);
            tex.offset.set((1 - target / actual) / 2, 0);
          } else {
            tex.repeat.set(1, actual / target);
            tex.offset.set(0, (1 - actual / target) / 2);
          }
          const old = screenMat.map;
          screenMat.map = tex;
          screenMat.color.set(0xffffff);
          screenMat.needsUpdate = true;
          if (old) old.dispose();
        });
        panel.userData.timer = setTimeout(next, 2600);
      };
      next();
    };

    if (still || !tl) {
      rig.scale.setScalar(1); rig.position.z = 0;
      holder.rotation.y = Math.PI;
      showShots();
      return;
    }

    tl.to(rig.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0)
      .to(rig.position, { z: 0, duration: 0.9, ease: 'power3.out' }, 0)
      // settle facing the viewer, lens first
      .to(holder.rotation, { y: 0, duration: 0.7, ease: 'power2.out' }, 0.35)
      .add(fire, 1.25)
      // then turn its back to show what it just took
      .to(holder.rotation, { y: Math.PI, duration: 1.15, ease: 'power2.inOut' }, 1.5)
      .add(showShots, 2.35);
  }

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        }
      });
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
