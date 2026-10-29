// Showcase carousel — an infinite row of project shots under a liquid-glass
// WebGL lens. Plain-JS port of the "LiquidGlassCarousel" React component.
//
// Reads its projects from the .work-card links already in .showcase__deck
// (image, title, href), so the HTML stays the single source of truth and is
// also what shows if WebGL is missing. showcase.js checks for WebGL up front
// and skips the pinned deck when this takes over.
//
// Differences from the original component, all because it now lives inside a
// scrolling page rather than filling a screen of its own:
//   - vertical wheel / swipes scroll the page; only horizontal ones move the row
//   - built lazily when the section first comes into view, so the intro plays
//     where it is seen and the textures are not fetched on page load
//   - background and lens ring follow the theme tokens (and the theme toggle)
//   - clicking the focused project opens it; the overlay title is a real link
//
// Requires gsap (global) + three (import map).
import * as THREE from 'three';

const PORTRAIT_ASPECT = 3 / 4;

// On a phone-shaped stage the tilted lens reads as an S: its top edge dips in
// at the right and its bottom edge rises in at the left. fitAspect is that
// stage shape (width / height). On anything wider the top edge is slid out to
// the right end and the bottom edge to the left end, each held straight (and
// off-stage) from its highest / lowest point inwards, so the middle is plain
// glass and the S just gets longer. inset pulls both curves back in (in stage
// heights); keep it at 0 so each curve meets the side edge exactly where it
// does on a phone — anything more and the curve visibly turns back before the
// edge. Narrower stages are left alone.
const LENS = {
  sizeX: 0.565, sizeY: 1, posX: 0.5, posY: 0.5, rotation: 65, fitAspect: 0.68, inset: 0, spin: 0, zoom: 0,
  // whiteGlow (the "nova") is added white light: it greyed the shots on a dark
  // page and washed their colour out on a light one, so it stays off
  dispersion: 11, blur: 0, glow: 4.2, whiteGlow: 0, novaSize: 12, blueRing: 6,
  ringRadius: 0.49, ringWidth: 0.014, shimmer: true, shimmerFreq: 12,
  shimmerSpeed: 3.5, shimmerDepth: 0.12, rimStart: 0.578, rimTangential: 0.6,
  rimInward: 0, rimFreq1: 2, rimFreq2: 1, rimLine: 1.4, rimLinePos: 0.488,
  rimLineWidth: 0.003, vignette: 0, vignetteSize: 0.3, samples: 16,
};

// Where the unwidened lens's top edge peaks, in the shader's height-based units
// (x right of centre; the bottom edge bottoms out at the mirror point, -x).
// From the ellipse A x² + 2B xy + C y² = 1 that the shader's rotation describes.
const LENS_PEAK_X = (() => {
  const r = (LENS.rotation * Math.PI) / 180;
  const ca = Math.cos(r), sa = Math.sin(r);
  const A = (ca * ca) / LENS.sizeX ** 2 + (sa * sa) / LENS.sizeY ** 2;
  const B = (ca * sa) / LENS.sizeX ** 2 - (sa * ca) / LENS.sizeY ** 2;
  const C = (sa * sa) / LENS.sizeX ** 2 + (ca * ca) / LENS.sizeY ** 2;
  return (-B * Math.sqrt(A / (A * C - B * B))) / A;
})();

const FOCUS = {
  cardDuration: 0.7, focusDuration: 0.9, cardEase: 'power4.out',
  focusEase: 'power3.out', stagger: 0.06, dropDist: 1.4, centerScale: 1.18,
  lensFade: 0.85,
};

const ENTRY = {
  delay: 0.2, startH: 80, riseDuration: 1.0, stagger: 0.07, riseEase: 'power3.out',
  fromBelow: 0.9, growDelay: 0.25, growDuration: 2.15, growEase: 'expo.inOut',
  growStagger: 0.085, lensBloom: 1.4, lensBloomEase: 'power2.inOut',
};

const LENS_VERTEX = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const LENS_FRAGMENT = /* glsl */ `
#define PI 3.14159265
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uExtend;
uniform float uFit;
uniform float uPeakX;
uniform float uSizeX;
uniform float uSizeY;
uniform float uAspect;
uniform float uZoom;
uniform float uDispersion;
uniform float uBlur;
uniform float uGlow;
uniform float uWhiteGlow;
uniform float uNovaSize;
uniform float uBlueRing;
uniform float uRingRadius;
uniform float uRingWidth;
uniform float uShimmer;
uniform float uShimmerFreq;
uniform float uShimmerSpeed;
uniform float uShimmerDepth;
uniform float uTime;
uniform float uRimStart;
uniform float uRimTangential;
uniform float uRimInward;
uniform float uRimFreq1;
uniform float uRimFreq2;
uniform vec3 uBlueColor;
uniform float uRimLine;
uniform float uRimLinePos;
uniform float uRimLineWidth;
uniform float uVignette;
uniform float uVignetteSize;
uniform float uShape;
uniform float uSquareRound;
uniform float uRotation;
uniform int uSamples;

const int MAX_SAMPLES = 16;

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// side +1 evaluates the lens with its top edge slid right by uExtend, side -1
// with its bottom edge slid left; left of the top edge's peak (right of the
// bottom edge's low point) the edge is held where it was, so it stays straight
vec3 discLens(vec2 center, float aspectCorrect, float side, out float outA) {
  vec2 p = (vUv - center);
  p.x *= aspectCorrect;
  p.x = side > 0.0 ? max(p.x - uExtend, uPeakX) : min(p.x + uExtend, -uPeakX);
  vec2 p0 = p; // in height units, before rotation
  float ca = cos(uRotation), sa = sin(uRotation);
  p = mat2(ca, -sa, sa, ca) * p;
  vec2 halfSize = vec2(uSizeX, uSizeY);
  float dist = length(p / halfSize);
  outA = 0.0;

  float maskND;
  if (uShape > 0.5) {
    float corner = min(uSizeX, uSizeY) * clamp(uSquareRound, 0.0, 1.0);
    float sd = sdRoundBox(p, halfSize, corner);
    maskND = 1.0 + sd / min(uSizeX, uSizeY);
  } else {
    maskND = dist;
  }
  if (maskND > 1.0) return vec3(0.0);

  float shapeND = clamp(maskND, 0.0, 1.0);
  float nd = clamp(dist, 0.0, 1.0);
  // The bending is worked out as if the stage were still uFit wide — measured
  // from the centre of whichever half this pixel is in — and scaled back to
  // real uv at the end (toUv). Otherwise a wide stage would smear every
  // sideways shift by its extra width and the ends would not match the phone.
  float fit = min(aspectCorrect, uFit);
  vec2 toUv = vec2(fit / aspectCorrect, 1.0);
  vec2 offset = vec2(p0.x / fit, p0.y);
  vec2 radialDir = normalize(offset + 1e-6);
  vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
  float angle = atan(p.y, p.x);

  float pull = uZoom * 0.30 * (nd * nd);
  float rimStrength = smoothstep(uRimStart, 1.0, nd);
  float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
  float rScreen = (uSizeX + uSizeY) * 0.5;
  vec2 rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
  vec2 rimPull = -radialDir * rimStrength * rScreen * uRimInward;

  vec2 baseUV = vUv + (-offset * pull + rimOff + rimPull) * toUv;

  float rimMask = smoothstep(0.55, 1.0, nd);
  vec2 dispDir = offset * uDispersion * 0.004 * rimMask * toUv;
  int N = uSamples;
  if (N < 2) N = 2;
  if (N > MAX_SAMPLES) N = MAX_SAMPLES;
  vec3 col = vec3(0.0);
  vec3 caW = vec3(0.0);
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= N) break;
    float t = float(i) / float(N - 1);
    vec2 sUV = baseUV + dispDir * (t - 0.5);
    vec3 s = texture2D(uTex, sUV).rgb;
    vec3 w = vec3(
      exp(-pow((t - 0.00) / 0.38, 2.0)),
      exp(-pow((t - 0.50) / 0.38, 2.0)),
      exp(-pow((t - 1.00) / 0.38, 2.0))
    );
    col += s * w;
    caW += w;
  }
  col /= max(caW, vec3(0.001));

  float blurFade = 1.0 - smoothstep(0.72, 0.98, nd);
  if (uBlur > 0.01 && blurFade > 0.01) {
    vec2 blurRad = vec2(uBlur) / uRes * blurFade;
    vec3 bcol = vec3(0.0);
    float btw = 0.0;
    for (float a = 0.0; a < PI * 2.0; a += PI * 2.0 / 6.0) {
      for (float rr = 0.4; rr <= 1.001; rr += 0.3) {
        vec2 o = vec2(cos(a), sin(a)) * blurRad * rr;
        float w = 1.0 - rr * 0.38;
        bcol += texture2D(uTex, baseUV + o).rgb * w;
        btw += w;
      }
    }
    col = mix(bcol / btw, col, rimMask);
  }

  col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, shapeND));

  float r2 = shapeND * shapeND * 0.25;
  float gs = max(uNovaSize * uGlow * 0.003, 0.004);
  float nova = exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18;
  nova *= uWhiteGlow * (uGlow / 17.0) * 1.15;
  col += vec3(nova);

  float dC = shapeND * 0.5;
  float tR = clamp(uRingRadius, 0.1, 0.49);
  float rW = max(uRingWidth, 0.003);
  float ring = exp(-pow((dC - tR) / rW, 2.0));
  ring *= uBlueRing * (uGlow / 17.0) * 1.8;
  if (uShimmer > 0.5) ring *= sin(angle * uShimmerFreq + uTime * uShimmerSpeed) * uShimmerDepth + (1.0 - uShimmerDepth);
  float ringAura = exp(-pow((dC - tR) / (rW * 6.0), 2.0)) * 0.28 * uBlueRing * (uGlow / 17.0);
  col += uBlueColor * (ring + ringAura);
  col += vec3(exp(-pow((dC - uRimLinePos) / max(uRimLineWidth, 0.0001), 2.0)) * uRimLine);

  outA = smoothstep(1.0, 0.93, maskND);
  return col;
}

void main(){
  vec3 base = texture2D(uTex, vUv).rgb;
  vec3 outc = base;
  // upper part reads the top-edge version, lower part the bottom-edge one,
  // cross-faded across the middle; identical when the lens is not widened
  float a = 0.0;
  float wTop = smoothstep(-0.12, 0.12, vUv.y - uCenter.y);
  if (wTop > 0.0) {
    vec3 c = discLens(uCenter, uAspect, 1.0, a);
    outc = mix(base, c, a);
  }
  if (wTop < 1.0) {
    vec3 c = discLens(uCenter, uAspect, -1.0, a);
    outc = mix(mix(base, c, a), outc, wTop);
  }
  if (uVignette > 0.001) {
    vec2 vc = vUv - 0.5;
    vc.x *= uAspect;
    float d = length(vc) / max(uVignetteSize, 0.0001);
    float vig = 1.0 - uVignette * smoothstep(0.5, 1.0, d);
    outc *= clamp(vig, 0.0, 1.0);
  }
  gl_FragColor = vec4(outc, 1.0);
  // the render target holds linear colour; encode it for the screen like
  // every built-in material does, or the shots come out dark and muddy
  #include <colorspace_fragment>
}
`;

const isLight = (background) => {
  const c = new THREE.Color(background);
  return (c.r + c.g + c.b) / 3 > 0.5;
};

// The blue ring (with its aura) and the white rim line are the same story:
// a crisp edge on white, but on black they bloom into a glow and a bright
// streak along the curves. Light background only.
const edgeFxFor = (background) => (isLight(background)
  ? { uBlueRing: LENS.blueRing, uRimLine: LENS.rimLine }
  : { uBlueRing: 0, uRimLine: 0 });

const LENS_FX_KEYS = [
  'uDispersion', 'uBlueRing', 'uRimLine', 'uVignette', 'uZoom', 'uRimTangential', 'uRimInward',
];

const REPEATS = 4;
const CLICK_SLOP = 6;
const TOUCH_CLICK_SLOP = 12;
const FLICK_IDLE_MS = 90;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const pad = (n) => String(n).padStart(2, '0');

function at(list, index) {
  const item = list[index];
  if (item === undefined) throw new Error('Index out of range.');
  return item;
}

// MARK: Engine — Three.js scene, input and animation. Returns null when WebGL
// is unavailable so the caller can leave the plain deck in place.
function createCarousel(mount, cursorElement, options) {
  const reduced = prefersReducedMotion();
  const entryOn = options.entry && !reduced;
  const items = options.items;
  if (items.length === 0) return null;

  let W = Math.max(1, mount.clientWidth);
  let H = Math.max(1, mount.clientHeight);
  const panelHFor = () => Math.max(120, Math.min(options.panelHeight, Math.round(H * options.panelFill())));
  let PANEL_H = panelHFor();
  const GAP = options.gap;
  const EASE = reduced ? 0.28 : 0.09;
  const SNAP_EASE = reduced ? 0.22 : 0.05;
  const WHEEL = 1.4;
  const DRAG = 1.6;
  const TOUCH_DRAG = 1;
  const TOUCH_EASE = 0.22;
  const FRICTION = 0.865;
  const SNAP_IDLE_MS = 120;
  const SHRINK_MAX = 60;
  const SHRINK_ATTACK = 0.25;
  const SHRINK_DECAY = 0.06;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    return null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H);
  renderer.setClearColor(new THREE.Color(options.background), 1);
  Object.assign(renderer.domElement.style, {
    display: 'block',
    width: '100%',
    height: '100%',
    // vertical swipes still scroll the page; horizontal ones drive the row
    touchAction: 'pan-y',
    userSelect: 'none',
  });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -100, 100);
  camera.position.z = 10;

  const loader = new THREE.TextureLoader();
  const sources = items.map((img) => {
    const s = { tex: null, aspect: img.aspect || PORTRAIT_ASPECT, locked: img.aspect != null };
    loader.load(
      img.src,
      (tex) => {
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.colorSpace = THREE.SRGBColorSpace;
        if (!s.locked && tex.image) s.aspect = tex.image.width / tex.image.height;
        s.tex = tex;
        recomputeTotal();
        if (!userInteracted) {
          scroll = centerForIndex(0);
          target = scroll;
        }
      },
      undefined,
      () => { s.aspect = s.aspect || PORTRAIT_ASPECT; },
    );
    return s;
  });

  const slotWidth = (srcIndex) => at(sources, srcIndex).aspect * PANEL_H + GAP;

  let offsets = [];
  let totalWidth = 0;
  function recomputeTotal() {
    offsets = [];
    let acc = 0;
    for (let i = 0; i < sources.length; i++) {
      offsets.push(acc);
      acc += slotWidth(i);
    }
    totalWidth = acc;
  }
  recomputeTotal();

  function centerForIndex(idx) {
    const N = sources.length;
    const loop = Math.floor(idx / N);
    const s = ((idx % N) + N) % N;
    return at(offsets, s) + slotWidth(s) / 2 - GAP / 2 + loop * totalWidth;
  }

  function nearestIndex(value) {
    if (!totalWidth) return 0;
    const N = sources.length;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < N; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        best = i + k * N;
      }
    }
    return best;
  }

  function centerIndex(value) {
    if (!totalWidth) return 0;
    let bestI = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sources.length; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        bestI = i;
      }
    }
    return bestI;
  }

  let lastCenter = -1;
  const pool = [];
  for (let r = 0; r < REPEATS; r++) {
    for (let i = 0; i < sources.length; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), mat);
      mesh.visible = false;
      scene.add(mesh);
      pool.push({ mesh, mat, srcIndex: i, bound: false });
    }
  }

  let scroll = centerForIndex(0);
  let target = scroll;
  let userInteracted = false;
  let velocity = 0;
  let prevScroll = 0;
  let scrollEnergy = 0;
  let pendingFocus = null;
  let lastInput = performance.now();
  let snapped = false;

  const rt = new THREE.WebGLRenderTarget(W * dpr, H * dpr);
  const lensScene = new THREE.Scene();
  const lensCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const lensUniforms = {
    uTex: { value: rt.texture },
    uRes: { value: new THREE.Vector2(W * dpr, H * dpr) },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uExtend: { value: 0 },
    uFit: { value: LENS.fitAspect },
    uPeakX: { value: LENS_PEAK_X },
    uSizeX: { value: LENS.sizeX },
    uSizeY: { value: LENS.sizeY },
    uShape: { value: 0 },
    uSquareRound: { value: 0 },
    uRotation: { value: 0 },
    uAspect: { value: W / H },
    uZoom: { value: LENS.zoom },
    uDispersion: { value: LENS.dispersion },
    uBlur: { value: LENS.blur },
    uGlow: { value: LENS.glow },
    uWhiteGlow: { value: LENS.whiteGlow },
    uNovaSize: { value: LENS.novaSize },
    uBlueRing: { value: edgeFxFor(options.background).uBlueRing },
    uRingRadius: { value: LENS.ringRadius },
    uRingWidth: { value: LENS.ringWidth },
    uShimmer: { value: reduced || !LENS.shimmer ? 0 : 1 },
    uShimmerFreq: { value: LENS.shimmerFreq },
    uShimmerSpeed: { value: LENS.shimmerSpeed },
    uShimmerDepth: { value: LENS.shimmerDepth },
    uTime: { value: 0 },
    uRimStart: { value: LENS.rimStart },
    uRimTangential: { value: LENS.rimTangential },
    uRimInward: { value: LENS.rimInward },
    uRimFreq1: { value: LENS.rimFreq1 },
    uRimFreq2: { value: LENS.rimFreq2 },
    uBlueColor: { value: new THREE.Color(options.ringColor) },
    uRimLine: { value: edgeFxFor(options.background).uRimLine },
    uRimLinePos: { value: LENS.rimLinePos },
    uRimLineWidth: { value: LENS.rimLineWidth },
    uVignette: { value: LENS.vignette },
    uVignetteSize: { value: LENS.vignetteSize },
    uSamples: { value: LENS.samples },
  };
  const lensMat = new THREE.ShaderMaterial({
    uniforms: lensUniforms,
    vertexShader: LENS_VERTEX,
    fragmentShader: LENS_FRAGMENT,
  });
  const lensQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat);
  lensScene.add(lensQuad);

  const focusState = {
    active: false,
    srcIndex: -1,
    poolIdx: -1,
    lensFx: entryOn ? 0 : 1,
    anim: null,
  };
  const drop = new Array(REPEATS * sources.length).fill(0);
  let focusScale = 1;
  const lastCenterX = new Array(REPEATS * sources.length);
  const pEntry = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryActive = entryOn;
  let entrySettled = false;
  const growArr = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryAnim = null;

  const lensFxFull = {};
  for (const key of LENS_FX_KEYS) lensFxFull[key] = lensUniforms[key].value;

  let panelRects = [];
  let centeredPanel = null;

  function layout() {
    panelRects = [];
    centeredPanel = null;
    let centeredDist = Infinity;
    const half = W / 2;
    const buffer = PANEL_H;
    pool.forEach((p, poolIdx) => {
      const rep = Math.floor(poolIdx / sources.length);
      const i = p.srcIndex;
      const src = at(sources, i);
      const slotCenterInLoop = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      let x = slotCenterInLoop - scroll;
      x = ((x % totalWidth) + totalWidth) % totalWidth;
      x += (rep - Math.floor(REPEATS / 2)) * totalWidth;
      if (x > half + totalWidth) x -= totalWidth * REPEATS;

      const centerX = x;
      const inEntry = entryActive || entrySettled;
      if (!inEntry && (centerX < -half - buffer || centerX > half + buffer)) {
        p.mesh.visible = false;
        lastCenterX[poolIdx] = undefined;
        return;
      }
      lastCenterX[poolIdx] = centerX;

      const shrink = 1 - 0.25 * scrollEnergy;
      const h = PANEL_H * shrink;
      const wPx = src.aspect * PANEL_H * shrink;

      if (src.tex && !p.bound) {
        p.mat.map = src.tex;
        p.mat.color.set(0xffffff);
        p.mat.needsUpdate = true;
        p.bound = true;
      }

      let y = 0;
      const isFocused = focusState.active && focusState.poolIdx === poolIdx;
      const d = drop[poolIdx] || 0;
      let drawW = wPx;
      let drawH = h;
      if (isFocused) {
        drawW = wPx * focusScale;
        drawH = h * focusScale;
      } else if (d > 0) {
        y = -d * H * FOCUS.dropDist;
      }

      p.mesh.visible = true;
      let finalX = centerX;
      let finalY = y;
      let finalW = drawW;
      let finalH = drawH;
      if (entryActive || entrySettled) {
        const pe = pEntry[poolIdx] || 0;
        const g = growArr[poolIdx] || 0;
        const curH = ENTRY.startH + (drawH - ENTRY.startH) * g;
        finalH = curH;
        finalW = curH * src.aspect;

        const cSrc = centerIndex(scroll);
        let di = i - cSrc;
        if (di > sources.length / 2) di -= sources.length;
        if (di < -sources.length / 2) di += sources.length;
        const N = sources.length;
        const midRep = Math.floor(REPEATS / 2);
        if (rep !== midRep) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const slotH = (s) => {
          const gg = growArr[midRep * N + s] || 0;
          return ENTRY.startH + (PANEL_H - ENTRY.startH) * gg;
        };
        let off = 0;
        if (di > 0) {
          for (let k = 0; k < di; k++) {
            const sa = (((cSrc + k) % N) + N) % N;
            const sb = (((cSrc + k + 1) % N) + N) % N;
            off += (at(sources, sa).aspect * slotH(sa) + at(sources, sb).aspect * slotH(sb)) / 2 + GAP;
          }
        } else if (di < 0) {
          for (let k = 0; k < -di; k++) {
            const sa = (((cSrc - k) % N) + N) % N;
            const sb = (((cSrc - k - 1) % N) + N) % N;
            off -= (at(sources, sa).aspect * slotH(sa) + at(sources, sb).aspect * slotH(sb)) / 2 + GAP;
          }
        }
        finalX = off;
        if (finalX < -half - buffer || finalX > half + buffer) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const below = -H * ENTRY.fromBelow;
        finalY = below + (y - below) * pe;
      }

      p.mesh.position.set(finalX, finalY, 0);
      p.mesh.scale.set(finalW, finalH, 1);

      const sx = centerX + W / 2;
      const sy = H / 2 - y;
      panelRects.push({
        left: sx - drawW / 2,
        right: sx + drawW / 2,
        top: sy - drawH / 2,
        bottom: sy + drawH / 2,
        poolIdx,
        srcIndex: i,
        centerX,
      });

      if (Math.abs(centerX) < centeredDist) {
        centeredDist = Math.abs(centerX);
        centeredPanel = { srcIndex: i, centerX, wPx, h, poolIdx };
      }
    });
  }

  function panelAtPointer(px, py) {
    for (const r of panelRects) {
      if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) return r;
    }
    return null;
  }

  function localPoint(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const el = renderer.domElement;
  let dragging = false;
  let dragPointerId = null;
  let dragLastX = 0;
  let dragDist = 0;
  let dragVel = 0;
  let dragMoveT = 0;
  let suppressClick = false;
  let dragPointerType = 'mouse';
  let lastPointerX = Number.NaN;
  let lastPointerY = Number.NaN;
  let pointerInside = false;
  let lastPointerType = 'mouse';

  if (cursorElement) {
    gsap.set(cursorElement, { xPercent: 20, yPercent: 30, scale: 0, autoAlpha: 0 });
  }
  const moveX = cursorElement ? gsap.quickTo(cursorElement, 'x', { duration: 0.5, ease: 'power3.out' }) : null;
  const moveY = cursorElement ? gsap.quickTo(cursorElement, 'y', { duration: 0.5, ease: 'power3.out' }) : null;

  let overPanel = false;
  let hoverPanel = false;
  let cursorNow = '';
  function setCursor(v) {
    if (v === cursorNow) return;
    cursorNow = v;
    el.style.cursor = v;
  }

  function updateCursor() {
    if (entryActive || entrySettled) return setCursor('');
    if (focusState.active) return setCursor(hoverPanel ? 'pointer' : '');
    if (dragging) return setCursor('grabbing');
    if (!hoverPanel) return setCursor('');
    return setCursor('grab');
  }

  function setHover(on) {
    hoverPanel = on;
    setView(on);
  }

  // over the focused shot the cursor turns into a plain pointer: it is a link now
  function focusedHit(px, py) {
    const hit = panelAtPointer(px, py);
    return hit && hit.poolIdx === focusState.poolIdx ? hit : null;
  }

  function refreshHover() {
    if (!pointerInside || lastPointerType !== 'mouse') return;
    if (!Number.isFinite(lastPointerX)) return;
    if (focusState.active) {
      hoverPanel = focusedHit(lastPointerX, lastPointerY) !== null;
      setView(false);
      return;
    }
    setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
  }

  function setView(on) {
    if (entryActive || entrySettled) on = false;
    if (dragging || focusState.active) on = false;
    if (on === overPanel) {
      updateCursor();
      return;
    }
    overPanel = on;
    updateCursor();
    if (!cursorElement) return;
    gsap.killTweensOf(cursorElement, 'scale,autoAlpha,opacity,visibility');
    gsap.to(cursorElement, {
      scale: on ? 1 : 0,
      autoAlpha: on ? 1 : 0,
      duration: on ? 0.35 : 0.25,
      ease: on ? 'power3.out' : 'power3.in',
    });
  }

  const inputLocked = () => focusState.active || entryActive || entrySettled;

  // Only sideways wheel / trackpad swipes move the row. Plain vertical wheel
  // falls through to the page — the original hijacked it, which traps the
  // visitor inside the section with no way to scroll past.
  function onWheel(e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (inputLocked()) return;
    userInteracted = true;
    pendingFocus = null;
    target += e.deltaX * WHEEL;
    lastInput = performance.now();
    snapped = false;
  }

  function onPointerDown(e) {
    suppressClick = false;
    if (inputLocked()) return;
    if (dragging) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging = true;
    dragPointerId = e.pointerId;
    dragPointerType = e.pointerType || 'mouse';
    try { el.setPointerCapture(e.pointerId); } catch { /* capture is best-effort */ }
    const p = localPoint(e);
    dragLastX = p.x;
    lastPointerX = p.x;
    lastPointerY = p.y;
    dragDist = 0;
    dragVel = 0;
    dragMoveT = performance.now();
    setView(false);
    velocity = 0;
    pendingFocus = null;
    userInteracted = true;
    snapped = false;
    lastInput = dragMoveT;
  }

  function onPointerMove(e) {
    const p = localPoint(e);
    if (dragging && e.pointerId === dragPointerId) {
      const sens = dragPointerType === 'mouse' ? DRAG : TOUCH_DRAG;
      const dx = p.x - dragLastX;
      dragLastX = p.x;
      dragDist += Math.abs(dx);
      target -= dx * sens;
      dragVel = dragVel * 0.6 + -dx * sens * 0.4;
      dragMoveT = performance.now();
      lastInput = dragMoveT;
      snapped = false;
    }
    lastPointerX = p.x;
    lastPointerY = p.y;
    lastPointerType = e.pointerType || 'mouse';
    pointerInside = true;
    if (e.pointerType !== 'mouse') return;
    if (moveX) moveX(p.x);
    if (moveY) moveY(p.y);
    refreshHover();
  }

  function onPointerUp(e) {
    if (!dragging) return;
    if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return;
    dragging = false;
    if (dragPointerId !== null) {
      try { el.releasePointerCapture(dragPointerId); } catch { /* already released */ }
      dragPointerId = null;
    }
    velocity = performance.now() - dragMoveT > FLICK_IDLE_MS ? 0 : dragVel;
    dragVel = 0;
    lastInput = performance.now();
    snapped = false;
    suppressClick = dragDist > (dragPointerType === 'mouse' ? CLICK_SLOP : TOUCH_CLICK_SLOP);
    if (dragPointerType === 'mouse') {
      setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
    } else {
      updateCursor();
    }
  }

  function onEnter(e) {
    pointerInside = true;
    lastPointerType = e.pointerType || 'mouse';
  }
  function onLeave() {
    pointerInside = false;
    setHover(false);
  }

  function onClick(e) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const p = localPoint(e);
    // focused: the shot itself opens the project, anywhere else closes
    if (focusState.active) {
      if (focusedHit(p.x, p.y)) options.onOpen(focusState.srcIndex);
      else closeFocus();
      return;
    }
    if (inputLocked()) return;
    const hit = panelAtPointer(p.x, p.y);
    if (!hit) return;
    if (centeredPanel && hit.poolIdx === centeredPanel.poolIdx) {
      pendingFocus = null;
      openFocus();
      return;
    }
    userInteracted = true;
    velocity = 0;
    target = centerForIndex(nearestIndex(scroll + hit.centerX));
    snapped = true;
    pendingFocus = { srcIndex: hit.srcIndex };
    setView(false);
  }

  function openFocus() {
    if (focusState.active || !centeredPanel) return;
    const src = sources[centeredPanel.srcIndex];
    if (!src || !src.tex) return;

    focusState.active = true;
    focusState.srcIndex = centeredPanel.srcIndex;
    const focusPoolIdx = centeredPanel.poolIdx;
    focusState.poolIdx = focusPoolIdx;
    target = centerForIndex(nearestIndex(scroll));

    const focusX = lastCenterX[focusPoolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.idx !== focusPoolIdx && o.x !== undefined)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => a.dist - b.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && o.dist - prevDist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    for (const key of LENS_FX_KEYS) lensFxFull[key] = lensUniforms[key].value;

    if (focusState.anim) focusState.anim.kill();
    const scaleProxy = { v: focusScale };
    const tl = gsap.timeline();
    tl.to(focusState, { lensFx: 0, duration: FOCUS.lensFade, ease: 'power3.out' }, 0);
    tl.to(scaleProxy, {
      v: FOCUS.centerScale,
      duration: FOCUS.focusDuration,
      ease: FOCUS.focusEase,
      onUpdate() { focusScale = scaleProxy.v; },
    }, 0);
    ranked.forEach((o) => {
      tl.to(drop, { [o.idx]: 1, duration: FOCUS.cardDuration, ease: FOCUS.cardEase }, o.rank * FOCUS.stagger);
    });
    focusState.anim = tl;
    setView(false);
    options.onFocusChange(true);
  }

  function closeFocus() {
    if (!focusState.active) return;
    if (focusState.anim) focusState.anim.kill();

    const focusX = lastCenterX[focusState.poolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.x !== undefined && (drop[o.idx] || 0) > 0)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => b.dist - a.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && prevDist - o.dist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    options.onFocusChange(false);
    const scaleProxy = { v: focusScale };
    const tl = gsap.timeline({
      onComplete: () => {
        focusState.active = false;
        focusState.srcIndex = -1;
        updateCursor();
      },
    });
    tl.to(focusState, { lensFx: 1, duration: FOCUS.lensFade * 0.8, ease: 'power3.inOut' }, 0);
    tl.to(scaleProxy, {
      v: 1,
      duration: FOCUS.focusDuration * 0.85,
      ease: FOCUS.focusEase,
      onUpdate() { focusScale = scaleProxy.v; },
    }, 0);
    ranked.forEach((o) => {
      tl.to(drop, { [o.idx]: 0, duration: FOCUS.cardDuration * 0.85, ease: FOCUS.cardEase }, o.rank * FOCUS.stagger * 0.7);
    });
    focusState.anim = tl;
  }

  function playEntry() {
    if (!entryOn) {
      options.onEntryDone(true);
      return;
    }
    if (entryAnim) entryAnim.kill();
    pEntry.fill(0);
    entryActive = true;
    entrySettled = false;
    options.onEntryDone(false);
    growArr.fill(0);
    focusState.lensFx = 0;
    target = centerForIndex(nearestIndex(scroll));
    scroll = target;
    velocity = 0;
    snapped = true;
    layout();
    const visible = [];
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] !== undefined) visible.push(k);
    }
    const tl = gsap.timeline({ delay: ENTRY.delay });
    const spread = ENTRY.stagger * Math.max(visible.length - 1, 1);
    let lastRiseEnd = 0;
    visible.forEach((idx) => {
      const t = Math.random() * spread;
      lastRiseEnd = Math.max(lastRiseEnd, t + ENTRY.riseDuration);
      tl.to(pEntry, { [idx]: 1, duration: ENTRY.riseDuration, ease: ENTRY.riseEase }, t);
    });
    tl.call(() => {
      entryActive = false;
      entrySettled = true;
    }, [], lastRiseEnd);
    const cSrcG = centerIndex(scroll);
    const Ng = sources.length;
    const midRepG = Math.floor(REPEATS / 2);
    const growList = [];
    let maxRank = 0;
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] === undefined) continue;
      if (Math.floor(k / Ng) !== midRepG) continue;
      let di = (k % Ng) - cSrcG;
      if (di > Ng / 2) di -= Ng;
      if (di < -Ng / 2) di += Ng;
      const r = Math.abs(di);
      maxRank = Math.max(maxRank, r);
      growList.push({ idx: k, rank: r });
    }
    const growStart = lastRiseEnd + ENTRY.growDelay;
    let growEnd = growStart;
    tl.to(focusState, { lensFx: 1, duration: ENTRY.lensBloom, ease: ENTRY.lensBloomEase }, growStart);
    growList.forEach((o) => {
      const t = growStart + (maxRank - o.rank) * ENTRY.growStagger;
      growEnd = Math.max(growEnd, t + ENTRY.growDuration);
      tl.to(growArr, { [o.idx]: 1, duration: ENTRY.growDuration, ease: ENTRY.growEase }, t);
    });
    tl.call(() => {
      entrySettled = false;
      growArr.fill(1);
      options.onEntryDone(true);
      updateCursor();
    }, [], growEnd);
    entryAnim = tl;
  }

  function step(direction) {
    if (inputLocked()) return;
    userInteracted = true;
    velocity = 0;
    pendingFocus = null;
    target = centerForIndex(nearestIndex(scroll) + direction);
    snapped = true;
    lastInput = performance.now();
  }

  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.addEventListener('pointerenter', onEnter);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('click', onClick);

  let raf = 0;
  let running = true;
  let visible = true;

  function tick() {
    if (!running) return;
    if (!visible || document.hidden) {
      raf = 0;
      return;
    }
    if (!dragging) {
      target += velocity;
      velocity *= FRICTION;
      if (Math.abs(velocity) < 0.05) velocity = 0;
      if (!snapped && !focusState.active && performance.now() - lastInput > SNAP_IDLE_MS) {
        target = centerForIndex(nearestIndex(scroll));
        snapped = true;
      }
    }
    const follow = dragging && dragPointerType !== 'mouse'
      ? TOUCH_EASE
      : snapped && !pendingFocus ? SNAP_EASE : EASE;
    scroll += (target - scroll) * follow;

    const ci = centerIndex(scroll);
    if (ci !== lastCenter) {
      lastCenter = ci;
      options.onActiveChange(ci);
    }

    const rawSpeed = scroll - prevScroll;
    prevScroll = scroll;
    const norm = Math.min(1, Math.abs(rawSpeed) / Math.max(1, SHRINK_MAX));
    const k = norm > scrollEnergy ? SHRINK_ATTACK : SHRINK_DECAY;
    scrollEnergy += (norm - scrollEnergy) * k;

    layout();
    refreshHover();

    if (pendingFocus && !focusState.active && Math.abs(target - scroll) < 0.5) {
      const pf = pendingFocus;
      pendingFocus = null;
      if (centeredPanel && centeredPanel.srcIndex === pf.srcIndex) openFocus();
    }

    lensUniforms.uCenter.value.set(LENS.posX, LENS.posY);
    lensUniforms.uAspect.value = W / H;
    lensUniforms.uExtend.value = Math.max(0, (W / H - LENS.fitAspect) / 2 - LENS.inset);
    lensUniforms.uTime.value = performance.now() * 0.001;
    const rad = (a) => (a * Math.PI) / 180;
    lensUniforms.uRotation.value = rad(LENS.rotation) + rad(LENS.spin) * (performance.now() * 0.001);
    const fx = focusState.lensFx;
    for (const key of LENS_FX_KEYS) lensUniforms[key].value = lensFxFull[key] * fx;

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(lensScene, lensCam);
    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!running || raf) return;
    raf = requestAnimationFrame(tick);
  }

  startLoop();
  if (entryOn) playEntry();
  else options.onEntryDone(true);

  function onResize() {
    W = Math.max(1, mount.clientWidth);
    H = Math.max(1, mount.clientHeight);
    PANEL_H = panelHFor();
    recomputeTotal();
    renderer.setSize(W, H);
    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    rt.setSize(W * ratio, H * ratio);
    lensUniforms.uRes.value.set(W * ratio, H * ratio);
    if (!userInteracted) {
      scroll = centerForIndex(0);
      target = scroll;
    }
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(mount);
  const intersection = new IntersectionObserver(([entry]) => {
    const box = entry && entry.boundingClientRect;
    if (!box || (box.width === 0 && box.height === 0)) return;
    visible = entry ? entry.isIntersecting : true;
    if (visible) startLoop();
  });
  intersection.observe(mount);
  const onVisibility = () => { if (!document.hidden) startLoop(); };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    openFocus: () => { if (!inputLocked()) openFocus(); },
    closeFocus,
    isFocused: () => focusState.active,
    next: () => step(1),
    previous: () => step(-1),
    setColors(background, ring) {
      renderer.setClearColor(new THREE.Color(background), 1);
      lensUniforms.uBlueColor.value.set(ring);
      // tick() rewrites the lens effects from lensFxFull every frame, so the
      // edges have to change there too or the next frame would put them back
      const edges = edgeFxFor(background);
      for (const key in edges) {
        lensFxFull[key] = edges[key];
        lensUniforms[key].value = edges[key];
      }
    },
  };
}

// MARK: Mount — wires the engine to the existing showcase markup.
const section = document.querySelector('.showcase');
const deck = section && section.querySelector('.showcase__deck[data-carousel]');

if (deck) {
  const cards = Array.from(deck.querySelectorAll('.work-card'));
  const items = cards.map((card) => {
    const img = card.querySelector('img');
    const meta = card.querySelector('.work-card__meta');
    return {
      src: img.getAttribute('src'),
      title: (meta ? meta.firstChild.textContent : img.alt).trim(),
      // as written, not the resolved .href: page-transition.js only plays the
      // wave for relative .html links
      href: card.getAttribute('href'),
    };
  });

  const indexEl = section.querySelector('#work-index');
  const totalEl = section.querySelector('#work-total');
  if (totalEl) totalEl.textContent = pad(items.length);

  // overlay: the current title (a real link, so keyboard and screen-reader
  // users get the project too), the trailing "View" label and a close button
  const stage = document.createElement('div');
  stage.className = 'showcase__stage';
  stage.tabIndex = 0;
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.setAttribute('aria-label', 'Recent work. Use the arrow keys to browse, Enter to open.');
  stage.innerHTML = `
    <div class="showcase__mount"></div>
    <a class="showcase__now"><span></span> <span class="showcase__arrow" aria-hidden="true">→</span></a>
    <div class="showcase__cursor" aria-hidden="true">View</div>
    <button class="showcase__close" type="button" aria-label="Close focused project">Close</button>
    <p class="showcase__live" aria-live="polite"></p>`;

  const mount = stage.querySelector('.showcase__mount');
  const now = stage.querySelector('.showcase__now');
  const closeBtn = stage.querySelector('.showcase__close');
  const live = stage.querySelector('.showcase__live');
  const mobile = window.matchMedia('(max-width: 700px)');
  let engine = null;

  const show = (i) => {
    const item = items[i];
    now.href = item.href;
    now.firstElementChild.textContent = item.title;
    if (indexEl) indexEl.textContent = pad(i + 1);
    live.textContent = `${item.title}, ${pad(i + 1)} of ${pad(items.length)}`;
  };

  const build = () => {
    deck.after(stage);
    engine = createCarousel(mount, stage.querySelector('.showcase__cursor'), {
      items,
      // share of the stage height a shot may fill; leaves room for the 1.18x
      // focus zoom and the title above. Smaller on phones, where the landscape
      // shots would otherwise run wider than the screen. Read on every resize,
      // so it follows the same 700px breakpoint as the CSS.
      panelHeight: 680,
      panelFill: () => (mobile.matches ? 0.5 : 0.64),
      gap: 16,
      background: token('--color-black'),
      ringColor: token('--color-accent'),
      entry: true,
      onActiveChange: show,
      // One click opens the case study: the focus zoom plays as the start of
      // the page transition instead of waiting for a second click. It goes
      // through the title link so the wave from page-transition.js runs.
      onFocusChange: (open) => {
        stage.classList.toggle('is-focused', open);
        if (open) now.click();
      },
      onEntryDone: (done) => stage.classList.toggle('is-ready', done),
      onOpen: (i) => { show(i); now.click(); },
    });
    if (!engine) {
      // no WebGL after all: put the plain cards back
      stage.remove();
      section.classList.remove('showcase--carousel');
      return;
    }
    show(0);

    closeBtn.addEventListener('click', () => engine.closeFocus());
    stage.addEventListener('keydown', (e) => {
      if (e.target !== stage) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); engine.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); engine.previous(); }
      else if (e.key === 'Escape') { e.preventDefault(); engine.closeFocus(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (engine.isFocused()) now.click();
        else engine.openFocus();
      }
    });

    // coming back with the browser's back button can restore this page as it
    // was left, mid-zoom; drop the focus so the row is browsable again
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) engine.closeFocus();
    });

    // the theme toggle only flips data-theme, so follow it here
    new MutationObserver(() => engine.setColors(token('--color-black'), token('--color-accent')))
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  };

  section.classList.add('showcase--carousel');
  // build on first approach so the intro plays in view and the shots are
  // not downloaded for visitors who never scroll this far
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    build();
  }, { rootMargin: '0px 0px -25% 0px' });
  io.observe(section);
}
