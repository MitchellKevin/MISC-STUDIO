// ------------------------------------------------------------------
// Work orbit — the projects as curved screens on the inside wall of a
// ring, with the camera standing in the middle. Scrolling through the
// (pinned) section turns the ring; it can also be dragged or flicked, and
// the prev / next buttons and arrow keys step it one project at a time.
//
// The screens are made of the site's dot (hero-particles.js): round the
// sides of the ring, and while a shot loads, each one breaks up into the
// logo's 2px accent dots on the same 4px grid instead of fading.
//
// The projects come from the .work-grid links already in the section
// (image, title, tag, href), so the HTML stays the single source of truth
// and is exactly what shows when WebGL or this module is not available.
//
// Requires three (import map in index.html).
// ------------------------------------------------------------------
import * as THREE from 'three';

const section = document.querySelector('[data-orbit]');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The headline is the bottle: the screens are labels wrapped round a
// cylinder standing on the text, and the camera looks at it from in front.
// The front screen passes over the type, its neighbours turn away round the
// sides and fade out before they reach the back.
const RADIUS = 6;           // bottle radius (world units); the text sits on its axis
const CAMERA_Z = 19;        // camera distance from the bottle's axis
const CARD_W = 5.6;         // arc length of one screen round the bottle
const CARD_H = CARD_W / 1.6;
const STEP = 1.02;          // angle between neighbouring screens, radians
// the bottle leans so the screens travel bottom-left to top-right
const TILT = 0.2;           // lean of the bottle's axis, radians (towards the right)
const LEAN_BACK = 0.1;      // and tipped back a touch, so the path reads as a ring
const LIFTS = [0.1, -0.12, 0.14, -0.06, 0.1, -0.14, 0.05]; // small stagger, in card heights
const FADE_FROM = 1.15;     // radians round the bottle where a screen starts to fade…
const FADE_TO = 1.62;       // …and where it is gone (so the back never covers the text)
const SEG_X = 64;

const VERT = /* glsl */ `
uniform float uAlong;
uniform float uSpan;
varying vec2 vUv;
varying float vEdge;
void main() {
  vUv = uv;
  // how far round the bottle this vertex sits from facing the camera
  vEdge = abs(uAlong + (uv.x - 0.5) * uSpan);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uAspect;
uniform float uRadius;
uniform float uHover;
uniform float uReady;
uniform vec2 uFade;
uniform float uCell;
uniform vec3 uDot;
varying vec2 vUv;
varying float vEdge;
float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hash(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float d = roundedBox(p, vec2(uAspect, 1.0) * 0.5, uRadius);
  float aa = fwidth(d);
  float mask = 1.0 - smoothstep(-aa, aa, d);
  vec4 tex = texture2D(uTex, vUv);
  // A screen is made of the logo's dots: on the same 4px screen grid, each
  // cell is a square dot that grows from the 2px dot to the full cell as the
  // screen comes round the bottle (or finishes loading), each cell at its own
  // moment. Full cells show the shot; the ones still forming are the accent.
  float cover = (1.0 - smoothstep(uFade.x, uFade.y, vEdge)) * uReady;
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 f = fract(gl_FragCoord.xy / uCell) - 0.5;
  float v = cover * 1.5 - hash(cell) * 0.45;
  float side = v >= 1.0 ? 1.0 : (v > 0.0 ? mix(0.5, 1.0, v) : 0.0);
  float inDot = side > 0.0 ? step(max(abs(f.x), abs(f.y)), side * 0.5) : 0.0;
  vec3 col = v >= 1.0 ? tex.rgb : uDot;
  gl_FragColor = vec4(col, mask * inDot);
  // the textures are sRGB and three decodes them to linear when sampling; a
  // ShaderMaterial does not encode back on its own, which made every shot
  // look darker and muddier than it is. This is three's standard step.
  #include <colorspace_fragment>
  // the gloss and the faint edge go on after, in screen colour, so they stay
  // subtle instead of washing the shot out
  // the glare is always on at full strength; hover only pops the screen
  // forward a little (the scale in work-orbit's frame loop)
  float sheen = smoothstep(0.55, 0.0, abs(vUv.x - vUv.y * 0.35 - 0.45)) * 0.09;
  float rim = 1.0 - smoothstep(0.0, 0.012, -d);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.9, rim * 0.5) + sheen;
  if (gl_FragColor.a < 0.002) discard;
}`;

// a label: a strip of the bottle's surface, centred facing the camera,
// curved left to right and straight top to bottom
function screenGeometry() {
  const span = CARD_W / RADIUS;
  const g = new THREE.BufferGeometry();
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= SEG_X; i++) {
    const u = i / SEG_X;
    const a = (u - 0.5) * span;
    const x = RADIUS * Math.sin(a);
    const z = RADIUS * Math.cos(a);
    pos.push(x, -CARD_H / 2, z, x, CARD_H / 2, z);
    uv.push(u, 0, u, 1);
  }
  for (let i = 0; i < SEG_X; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

// the "your project" slot, drawn rather than photographed
function slotTexture(lines) {
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 1000;
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, c.width, c.height);
  x.setLineDash([18, 14]);
  x.lineWidth = 4;
  x.strokeStyle = '#0022ff';
  x.strokeRect(40, 40, c.width - 80, c.height - 80);
  x.setLineDash([]);
  x.fillStyle = '#0022ff';
  x.beginPath();
  x.arc(c.width / 2, 360, 70, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = '#fff';
  x.lineWidth = 9;
  x.lineCap = 'round';
  x.beginPath();
  x.moveTo(c.width / 2 - 28, 360); x.lineTo(c.width / 2 + 28, 360);
  x.moveTo(c.width / 2, 332); x.lineTo(c.width / 2, 388);
  x.stroke();
  x.textAlign = 'center';
  x.font = '500 104px "Overused Grotesk", Helvetica, Arial, sans-serif';
  x.fillStyle = '#111111';
  x.fillText(lines[0], c.width / 2, 600);
  x.fillStyle = '#686868';
  x.fillText(lines[1], c.width / 2, 710);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

function init() {
  const stage = section.querySelector('.work-orbit__stage');
  const canvas = section.querySelector('.work-orbit__canvas');
  const links = Array.from(section.querySelectorAll('.work-grid a'));
  const items = links.map((a) => ({
    href: a.getAttribute('href'),
    img: a.querySelector('img') ? a.querySelector('img').getAttribute('src') : null,
    title: a.querySelector('.work__title').textContent.trim(),
    tag: a.querySelector('.work__tag').textContent.trim(),
    slot: a.classList.contains('work--slot'),
  }));
  if (!items.length) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);
  const bottle = new THREE.Group();
  bottle.rotation.order = 'ZXY';
  bottle.rotation.z = -TILT;
  bottle.rotation.x = LEAN_BACK;
  scene.add(bottle);

  section.classList.add('is-orbit');

  const geometry = screenGeometry();
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const meshes = items.map((item, i) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      extensions: { derivatives: true },
      uniforms: {
        uTex: { value: null },
        uAspect: { value: CARD_W / CARD_H },
        uRadius: { value: 0.045 },
        uHover: { value: 0 },
        uReady: { value: 0 },
        uFade: { value: new THREE.Vector2(FADE_FROM, FADE_TO) },
        uAlong: { value: 0 },
        uSpan: { value: CARD_W / RADIUS },
        // the logo's 4px dot grid, in device pixels, and its accent
        uCell: { value: ((window.miscDots && window.miscDots.GAP) || 4) * renderer.getPixelRatio() },
        uDot: { value: new THREE.Color(window.miscDots ? window.miscDots.color(canvas) : '#0022ff') },
      },
    });
    const mesh = new THREE.Mesh(geometry, mat);
    // roll in place, then pitch up the diagonal, then swing round the ring
    mesh.position.y = LIFTS[i % LIFTS.length] * CARD_H;
    mesh.userData = { index: i, hover: 0, ready: 0 };
    bottle.add(mesh);
    const done = (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      mat.uniforms.uTex.value = tex;
      mesh.userData.loaded = true;
      wake();
    };
    if (item.slot) {
      const lines = ['Your project.', 'Could be next.'];
      (document.fonts && document.fonts.load ? document.fonts.load('500 104px "Overused Grotesk"') : Promise.resolve())
        .then(() => done(slotTexture(lines)), () => done(slotTexture(lines)));
    } else {
      loader.load(item.img, done);
    }
    return mesh;
  });

  // DOM bits the ring keeps up to date
  const elIndex = section.querySelector('[data-orbit-index]');
  const elTotal = section.querySelector('[data-orbit-total]');
  const elTitle = section.querySelector('[data-orbit-title]');
  const elTag = section.querySelector('[data-orbit-tag]');
  const elLink = section.querySelector('[data-orbit-link]');
  const cursor = section.querySelector('.work-orbit__cursor');
  const pad = (n) => String(n).padStart(2, '0');
  if (elTotal) elTotal.textContent = pad(items.length);

  // MARK: Motion state. The ring's angle is the scroll position (mapped
  // over the pinned section) plus whatever the visitor dragged.
  const span = (items.length - 1) * STEP;
  // The scroll starts with every screen out of sight round the back of the
  // bottle and ends the same way: the ring turns far enough past both ends
  // that the first screen's trailing edge, and later the last one's, has
  // faded out completely (half a screen + the fade distance).
  const lead = CARD_W / RADIUS / 2 + FADE_TO + 0.05;
  let scrollRot = -lead;
  let drag = 0;                      // current drag offset (eased)
  let dragTarget = 0;                // where the drag offset is heading
  let rot = -lead;
  let current = -1;
  let running = false;
  let visible = false;
  const pointer = new THREE.Vector2(-9, -9);
  let hovered = null;

  // the pinned stretch only: the section may have room on top first (the
  // dotted seam, see site.css), which scrolls by before the stage sticks
  const readScroll = () => {
    const r = section.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(section).paddingTop) || 0;
    const total = r.height - pad - window.innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -(r.top + pad) / total)) : 0;
    scrollRot = -lead + p * (span + lead * 2);
  };

  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // portrait screens get a wider lens so a whole screen still fits across
    // keep the front screen a good size on a narrow portrait screen too
    camera.fov = camera.aspect < 1 ? 58 : 32;
    camera.updateProjectionMatrix();
    wake();
  };

  const nearest = (angle) => Math.min(items.length - 1, Math.max(0, Math.round(angle / STEP)));

  const setCaption = (i) => {
    if (i === current) return;
    current = i;
    const item = items[i];
    if (elIndex) elIndex.textContent = pad(i + 1);
    if (elTitle) elTitle.textContent = item.title;
    if (elTag) elTag.textContent = item.tag;
    if (elLink) {
      elLink.setAttribute('href', item.href);
      elLink.querySelectorAll('.btn__label').forEach((l) => { l.textContent = item.slot ? 'Start a project' : 'View case study'; });
    }
    section.style.setProperty('--orbit-pulse', String(Math.random()));
    section.classList.remove('is-switch');
    void section.offsetWidth;
    section.classList.add('is-switch');
  };

  const raycaster = new THREE.Raycaster();
  const pick = () => {
    if (pointer.x < -2) return null;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(meshes, false);
    for (const h of hits) {
      // ignore the parts of the bottle that have faded out
      const local = bottle.worldToLocal(h.point.clone());
      const a = Math.abs(Math.atan2(local.x, local.z));
      if (a < FADE_FROM) return h.object;
    }
    return null;
  };

  const frame = () => {
    if (!running) return;
    readScroll();
    drag += (dragTarget - drag) * 0.12;
    const goal = scrollRot + drag;
    rot += (goal - rot) * 0.14;

    meshes.forEach((m, i) => {
      const along = i * STEP - rot;
      m.rotation.y = along;
      m.material.uniforms.uAlong.value = along;
      // nearer screens draw last, so the front one covers its neighbours
      m.renderOrder = Math.round(Math.cos(along) * 100);
      const u = m.material.uniforms;
      const isHover = m === hovered;
      m.userData.hover += ((isHover ? 1 : 0) - m.userData.hover) * 0.15;
      u.uHover.value = m.userData.hover;
      const s = 1 + m.userData.hover * 0.035;
      m.scale.set(s, s, s);
      if (m.userData.loaded) m.userData.ready += (1 - m.userData.ready) * 0.06;
      u.uReady.value = m.userData.ready;
    });

    setCaption(nearest(rot));
    // nothing in front yet (or any more): hide the caption and its buttons
    section.classList.toggle('is-empty', Math.abs(rot - nearest(rot) * STEP) > STEP * 0.75);
    hovered = dragging ? null : pick();
    stage.classList.toggle('is-pointing', !!hovered);
    if (cursor) cursor.classList.toggle('is-on', !!hovered);

    renderer.render(scene, camera);

    // stop the loop once everything has settled; any input wakes it again
    const settled = Math.abs(goal - rot) < 0.0005 && Math.abs(dragTarget - drag) < 0.0005
      && meshes.every((m) => (!m.userData.loaded || m.userData.ready > 0.995) && Math.abs(m.userData.hover - (m === hovered ? 1 : 0)) < 0.005)
      && meshes.every((m) => m.userData.loaded);
    if (settled || !visible) { running = false; return; }
    requestAnimationFrame(frame);
  };
  function wake() {
    if (running || !visible) return;
    running = true;
    requestAnimationFrame(frame);
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
  }, { rootMargin: '10% 0px' }).observe(stage);
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', resize);
  resize();

  // MARK: Input — horizontal drag / flick turns the ring; a click (not a
  // drag) on a screen opens it.
  let dragging = false;
  let startX = 0;
  let lastX = 0;
  let moved = 0;
  let vel = 0;
  let lastT = 0;
  const toNdc = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (cursor) cursor.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
  };
  const snap = () => {
    // land the ring on the nearest screen, keeping the scroll part as is
    const goal = scrollRot + dragTarget;
    dragTarget += nearest(goal) * STEP - goal;
  };

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = lastX = e.clientX;
    moved = 0;
    vel = 0;
    lastT = performance.now();
    canvas.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
    wake();
  });
  canvas.addEventListener('pointermove', (e) => {
    toNdc(e);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved = Math.max(moved, Math.abs(e.clientX - startX));
      // one screen width of drag turns the ring about one and a half steps
      const k = (STEP * 1.5) / stage.clientWidth;
      dragTarget -= dx * k;
      const now = performance.now();
      vel = (-dx * k) / Math.max(1, now - lastT) * 16;
      lastT = now;
    }
    wake();
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
    if (moved < 6) {
      const hit = pick();
      if (hit) { window.location.href = items[hit.userData.index].href; return; }
    }
    // carry a flick a little further, then settle on a screen
    if (performance.now() - lastT < 90) dragTarget += vel * 10;
    snap();
    wake();
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { pointer.set(-9, -9); wake(); });

  const step = (dir) => {
    const goal = scrollRot + dragTarget;
    const to = Math.min(items.length - 1, Math.max(0, nearest(goal) + dir));
    dragTarget += to * STEP - goal;
    wake();
  };
  section.querySelectorAll('[data-orbit-step]').forEach((b) => {
    b.addEventListener('click', () => step(Number(b.getAttribute('data-orbit-step'))));
  });
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  setCaption(0);
}

if (section && !reduced && webglOk()) {
  // Claim the pinned section's full height straight away, so everything
  // below it is already where it will stay (menu links and #hash jumps
  // aim at the right spot); only the textures wait.
  section.classList.add('is-orbit');
  // build when the section is about a screen away, so the textures are not
  // fetched during the first paint of the page
  const near = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    near.disconnect();
    init();
  }, { rootMargin: '120% 0px' });
  near.observe(section);
}
