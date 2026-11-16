// MARK: The dot — the one material the whole site is built from.
//
// The logo is drawn as a field of 2px dots on a 4px grid, and everything
// else is made of the same dot: the hero mark, the seams where one surface
// gives way to the next, the process icons (process-dial.js), the work
// screens dissolving round the ring (work-orbit.js), the journal covers and
// the MISC wordmark that closes every page. Same grid, same size, same
// accent blue, same shove under the cursor. Three moves, used everywhere:
//   form   — dots fly in and assemble the shape
//   burst  — the shape blows apart along each dot's own direction
//   reform — they come back together as the next thing
//
// Nothing is hand-plotted: the source (an image, or type drawn on the fly)
// is drawn into an offscreen canvas, sampled on the grid, and every pixel
// that passes becomes one dot.
//
// Two modes:
//   threshold — only pixels brighter than `threshold` become dots, all the
//     same size. Right for a flat logo or for type.
//   halftone  — every opaque pixel becomes a dot whose SIZE tracks its
//     brightness. Right for a photograph.
//
// Dependency-free on purpose — this runs before anything else has loaded,
// and a canvas loop has no business waiting on a CDN.
window.miscDots = {
  GAP: 4,           // grid in CSS px — the dot spacing everywhere
  DOT: 2,           // the dot
  REACH: 175,       // how close the cursor has to get to push a dot
  PUSH: 6500,       // shove strength, falls off with distance
  // the canvas paints itself, so it reads the colour from CSS: its own
  // --dot-color if it sets one, else the site accent
  color(el) {
    return getComputedStyle(el).getPropertyValue('--dot-color').trim()
      || getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
      || '#0022ff';
  },
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

window.initParticles = function (options) {
  const D = window.miscDots;
  const o = Object.assign({
    canvas: '.hero__particles',   // selector or element
    container: '.hero',           // selector or element
    // 640px is plenty for a 4px sampling grid
    src: 'assets/img/brand/logo-640.webp',
    // instead of an image: (ctx, w, h) => draws the source at the size of
    // the whole field (used for type)
    source: null,
    gap: D.GAP,
    dot: D.DOT,
    align: 'center',  // 'center' | 'right'
    inset: 0,         // gap from the edge when align is 'right', in CSS px
    mode: 'threshold',
    threshold: 0.55,
    minDot: 0.5,      // halftone: dot size at black
    maxDot: 3.1,      // halftone: dot size at white
    black: 0,         // levels before tone → size (halftone)
    white: 1,
    gamma: 1,
    cut: 0.06,
    square: false,    // centre-crop a non-square source to a square
    fill: null,       // size of the field; defaults to the homepage sizing
    spring: 0.02,     // pull back home — low, so they drift far
    friction: 0.93,   // high, so a shove keeps carrying after the cursor left
    // form: hold the dots back until this happens, then assemble them.
    //   null      — just there
    //   'view'    — when the field first scrolls into view
    //   a Promise — when it resolves (its value may be a DOMRect to fly
    //               out of, in viewport coordinates)
    assemble: null,
  }, options || {});

  const pick = (v) => (typeof v === 'string' ? document.querySelector(v) : v);
  const canvas = pick(o.canvas);
  const host = pick(o.container);
  if (!canvas || !host || !canvas.getContext) return null;

  const ctx = canvas.getContext('2d');
  const reduced = D.reduced;
  const REACH = D.REACH;
  const PUSH = D.PUSH;

  // per dot: home, start (for the assembly), offset + speed (the cursor's
  // shove, the only part with physics), size, delay, burst direction
  let n = 0;
  let hx, hy, sx, sy, ox, oy, vx, vy, ds, dl, bx, by;
  let width = 0;
  let height = 0;
  let fieldSize = 0;
  let bounds = null;          // the drawing's own box, for flying out of a rect
  let visible = false;
  let running = false;
  let held = !!o.assemble && !reduced;   // nothing drawn until it forms
  let formAt = -1;            // performance.now() the assembly started
  let formFrom = null;        // DOMRect to fly out of, else a burst
  const FORM = 1500;          // ms one dot takes to land
  const STAGGER = 650;        // ms spread of start times across the field
  const pointer = { x: -9999, y: -9999 };

  const image = o.source ? null : new Image();

  const build = () => {
    n = 0;
    // the canvas is display:none on small screens — nothing to sample
    if (!canvas.offsetParent && getComputedStyle(canvas).display === 'none') return;

    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    if (!width || !height) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // draw at the size it will occupy, so one source pixel is one dot.
    let size;
    let sizeY;
    if (o.source) {
      size = Math.round(width);
      sizeY = Math.round(height);
    } else {
      size = Math.round(o.fill ? o.fill(width, height) : Math.min(height * 1.45, width * 0.95));
      const ratio = !o.square && image.naturalWidth && image.naturalHeight
        ? image.naturalHeight / image.naturalWidth : 1;
      sizeY = Math.round(size * ratio);
    }
    if (size < 40) return;
    fieldSize = Math.max(size, sizeY);

    const off = document.createElement('canvas');
    off.width = size;
    off.height = sizeY;
    const octx = off.getContext('2d', { willReadFrequently: true });

    if (o.source) {
      o.source(octx, size, sizeY);
    } else if (o.square && image.naturalWidth && image.naturalHeight) {
      const s = Math.min(image.naturalWidth, image.naturalHeight);
      octx.drawImage(image, (image.naturalWidth - s) / 2, (image.naturalHeight - s) / 2, s, s, 0, 0, size, size);
    } else {
      octx.drawImage(image, 0, 0, size, sizeY);
    }

    let data;
    try {
      data = octx.getImageData(0, 0, size, sizeY).data;
    } catch (err) {
      // a tainted canvas (file://) — leave the section as it was
      canvas.style.display = 'none';
      return;
    }

    const inset = typeof o.inset === 'function' ? o.inset(width, height) : o.inset;
    const originX = o.source ? 0
      : o.align === 'right' ? Math.round(width - size - inset) : Math.round((width - size) / 2);
    const originY = o.source ? 0 : Math.round((height - sizeY) / 2);

    const halftone = o.mode === 'halftone';
    const span = Math.max(0.0001, o.white - o.black);
    const invGamma = 1 / o.gamma;
    const px = [];
    const py = [];
    const ps = [];
    for (let y = 0; y < sizeY; y += o.gap) {
      for (let x = 0; x < size; x += o.gap) {
        const i = (y * size + x) * 4;
        if (data[i + 3] < 128) continue;
        const lum = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
        let s;
        if (halftone) {
          let t = (lum - o.black) / span;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          if (invGamma !== 1) t = Math.pow(t, invGamma);
          if (t < o.cut) continue;
          s = o.minDot + (o.maxDot - o.minDot) * t;
        } else {
          if (lum < o.threshold) continue;
          s = o.dot;
        }
        px.push(originX + x);
        py.push(originY + y);
        ps.push(s);
      }
    }

    n = px.length;
    hx = Float32Array.from(px);
    hy = Float32Array.from(py);
    ds = Float32Array.from(ps);
    sx = new Float32Array(n);
    sy = new Float32Array(n);
    ox = new Float32Array(n);
    oy = new Float32Array(n);
    vx = new Float32Array(n);
    vy = new Float32Array(n);
    dl = new Float32Array(n);
    bx = new Float32Array(n);
    by = new Float32Array(n);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.35 + Math.random() * 0.65;
      bx[i] = Math.cos(a) * r;
      by[i] = Math.sin(a) * r;
      dl[i] = Math.random() * STAGGER;
      if (hx[i] < x0) x0 = hx[i];
      if (hx[i] > x1) x1 = hx[i];
      if (hy[i] < y0) y0 = hy[i];
      if (hy[i] > y1) y1 = hy[i];
    }
    bounds = n ? { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) } : null;
    if (formAt >= 0) placeStarts();
  };

  // where each dot sets off from: the same spot in a small copy of the
  // drawing (flying out of a rect), or blown out along its burst direction
  const placeStarts = () => {
    const hr = host.getBoundingClientRect();
    const r = formFrom;
    for (let i = 0; i < n; i++) {
      if (r && bounds) {
        sx[i] = r.left - hr.left + ((hx[i] - bounds.x) / bounds.w) * r.width;
        sy[i] = r.top - hr.top + ((hy[i] - bounds.y) / bounds.h) * r.height;
      } else {
        sx[i] = hx[i] + bx[i] * fieldSize * 0.55;
        sy[i] = hy[i] + by[i] * fieldSize * 0.55;
      }
    }
  };

  let dotColor = D.color(canvas);
  window.addEventListener('themechange', () => { dotColor = D.color(canvas); draw(performance.now()); });

  // one frame: where every dot is, plus whether anything is still moving
  // in-out, so the trip itself is seen (the loader is still fading out
  // over the first few hundred ms of it)
  const easeOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const draw = (now, physics) => {
    ctx.clearRect(0, 0, width, height);
    if (held || !n) return false;
    let busy = false;
    const forming = formAt >= 0;
    const at = forming ? now - formAt : 0;
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      let x = hx[i];
      let y = hy[i];
      if (forming) {
        const t = Math.min(1, Math.max(0, (at - dl[i]) / FORM));
        if (t < 1) {
          busy = true;
          const e = easeOut(t);
          x = sx[i] + (x - sx[i]) * e;
          y = sy[i] + (y - sy[i]) * e;
        }
      }
      if (physics) {
        const dx = x + ox[i] - pointer.x;
        const dy = y + oy[i] - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REACH * REACH) {
          // inverse-square shove; the floor on d2 keeps a direct hit from
          // launching a dot clean off the canvas
          const force = PUSH / Math.max(d2, 400);
          const d = Math.sqrt(d2) || 1;
          vx[i] += (dx / d) * force;
          vy[i] += (dy / d) * force;
        }
        vx[i] = (vx[i] - ox[i] * o.spring) * o.friction;
        vy[i] = (vy[i] - oy[i] * o.spring) * o.friction;
        ox[i] += vx[i];
        oy[i] += vy[i];
        if (!busy && (vx[i] > 0.02 || vx[i] < -0.02 || vy[i] > 0.02 || vy[i] < -0.02)) busy = true;
      }
      ctx.rect(x + ox[i], y + oy[i], ds[i], ds[i]);
    }
    ctx.fill();
    if (forming && at > FORM + STAGGER) formAt = -1;
    return busy;
  };

  // the loop only runs while the field is on screen AND something moves;
  // a pointer, a scroll or an assembly wakes it again
  const step = (now) => {
    if (!running) return;
    const busy = draw(now, !reduced);
    if (!visible || !busy) { running = false; return; }
    requestAnimationFrame(step);
  };
  const wake = () => {
    if (running || reduced || !visible || !n) return;
    running = true;
    requestAnimationFrame(step);
  };

  const form = (from) => {
    if (!held) return;
    held = false;
    if (reduced) { draw(performance.now()); return; }
    formFrom = from && from.width ? from : null;
    formAt = performance.now();
    placeStarts();
    wake();
  };

  host.addEventListener('pointermove', (e) => {
    const rect = host.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    wake();
  });
  host.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  let ready = false;
  let viewed = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && entries[0].intersectionRatio > 0) viewed = true;
      if (visible && ready && o.assemble === 'view') form(null);
      if (visible) wake();
    }, { threshold: [0, 0.35] }).observe(host);
  } else {
    visible = true;
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw(performance.now());
      wake();
    }, 200);
  });

  const begin = () => {
    build();
    ready = true;
    draw(performance.now());   // paint the resting image even if the loop never starts
    if (o.assemble === 'view') {
      if (viewed || !('IntersectionObserver' in window)) form(null);
    } else if (o.assemble && typeof o.assemble.then === 'function') {
      o.assemble.then(form, () => form(null));
    }
    wake();
  };
  if (o.source) {
    // type needs its webfont before it is sampled, or it samples Arial
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(begin, begin);
  } else {
    image.addEventListener('load', begin);
    image.src = o.src;
  }

  return { rebuild: () => { build(); draw(performance.now()); }, form, wake };
};

// MARK: Hero — the logo, flown out of the loader's icon
// The glass loader ends on the logo as a small blue tile in the middle of
// the screen. When it hands over (window.miscIntro), each dot leaves its
// spot in that small mark and flies to the same spot in the big one, so the
// icon visibly becomes the hero. Without the loader (a repeat visit) the
// mark forms out of a burst instead.
if (document.querySelector('.hero__particles')) {
  const heroCanvas = document.querySelector('.hero__particles');
  const loaderIcon = () => {
    // the stage is full-screen and slid/scaled as one piece; the icon is its
    // centre, glass-icon-half wide each way, of which the white mark itself
    // is ~70% (glass-reveal's markShare)
    const stage = document.querySelector('#loader .loader__stage');
    if (!stage) return null;
    const r = stage.getBoundingClientRect();
    const half = parseFloat(getComputedStyle(stage).getPropertyValue('--glass-icon-half')) || 0;
    if (!half || !r.width) return null;
    const scale = r.width / window.innerWidth;
    const m = half * scale * 0.704;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2 + half * scale * 0.078;
    return new DOMRect(cx - m, cy - m, m * 2, m * 2);
  };
  const intro = window.miscIntro || Promise.resolve();
  const right = heroCanvas.dataset.align === 'right';
  window.initParticles(Object.assign({
    assemble: intro.then(loaderIcon),
  }, right ? {
    align: 'right',
    // A big mark pushed right, clear of the headline and the price, just
    // running off the right edge
    fill: (w, h) => (w < 1024 ? Math.min(h * 1.1, w * 1.38) : Math.min(h * 2, w * 1.05)),
    inset: (w) => (w < 1024 ? -w * 0.28 : -w * 0.3),
  } : {}));
}

// MARK: Footer — the MISC wordmark that closes every page forms the first
// time it comes into view. The canvas carries its own image path in
// data-src, because the pages sit at different depths. Sampling the word is
// a few hundred ms on a phone, so it waits until the footer is about a
// screen away.
const footerMark = document.querySelector('.footer__particles');
if (footerMark) {
  const initFooterMark = () => window.initParticles({
    canvas: footerMark,
    container: '.footer__mark',
    src: footerMark.dataset.src,
    fill: (w) => w,
    assemble: 'view',
  });
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      near.disconnect();
      initFooterMark();
    }, { rootMargin: '100% 0px' });
    near.observe(footerMark);
  } else {
    initFooterMark();
  }
}

// MARK: Journal covers — type, set in dots
// A post's cover is one word or number from the post itself, drawn in the
// site face and sampled into the dot field on the hero's graphite. The
// plain text inside the cover is what shows without JS; once the dots are
// up it steps aside (.is-dotted).
//   <span class="dotcover" data-dotcover="15">…</span>
document.querySelectorAll('[data-dotcover]').forEach((cover) => {
  const word = cover.dataset.dotcover;
  if (!word) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'dotcover__dots';
  canvas.setAttribute('aria-hidden', 'true');
  cover.appendChild(canvas);
  const init = () => {
    const api = window.initParticles({
      canvas,
      container: cover,
      assemble: 'view',
      spring: 0.04,
      friction: 0.9,
      source: (ctx, w, h) => {
        // as big as fits: 62% of the height, or 82% of the width
        const family = getComputedStyle(cover).fontFamily;
        let size = h * 0.62;
        ctx.font = `600 ${size}px ${family}`;
        if ('letterSpacing' in ctx) ctx.letterSpacing = `${(-0.05 * size).toFixed(1)}px`;
        const tw = ctx.measureText(word).width;
        if (tw > w * 0.82) {
          size *= (w * 0.82) / tw;
          ctx.font = `600 ${size}px ${family}`;
          if ('letterSpacing' in ctx) ctx.letterSpacing = `${(-0.05 * size).toFixed(1)}px`;
        }
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word, w / 2, h / 2 + size * 0.04);
      },
    });
    if (api) cover.classList.add('is-dotted');
  };
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      near.disconnect();
      init();
    }, { rootMargin: '50% 0px' });
    near.observe(cover);
  } else {
    init();
  }
});

// MARK: Seams — where one surface gives way to the next, it doesn't stop
// on a hard line: it breaks up into the logo's dots, solid at the edge and
// thinning out into single 2px dots further down. Drawn once, still.
// Opt in per section with data-seam; the section makes room for it with
// extra padding on top (site.css). The colour is the section above's
// (--seam-stops on it overrides, for a background that isn't flat).
(() => {
  const D = window.miscDots;
  document.querySelectorAll('[data-seam]').forEach((section) => {
    const prev = section.previousElementSibling;
    if (!prev) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'seam';
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const G = D.GAP;
    // one fixed pattern per seam, so a redraw (resize) doesn't reshuffle it
    const ph1 = Math.random() * 6.28;
    const ph2 = Math.random() * 6.28;
    const rand = (x, y) => {
      const v = Math.sin(x * 12.9898 + y * 78.233 + ph1 * 37.719) * 43758.5453;
      return v - Math.floor(v);
    };

    const draw = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = r.width;
      const H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const stops = getComputedStyle(prev).getPropertyValue('--seam-stops').trim();
      if (stops) {
        const g = ctx.createLinearGradient(0, 0, W, 0);
        stops.split(',').forEach((st) => {
          const [c, at] = st.trim().split(/\s+/);
          g.addColorStop(Math.min(1, Math.max(0, parseFloat(at) / 100)), c);
        });
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = getComputedStyle(prev).backgroundColor;
      }
      // a solid lip, so no hairline shows at the edge
      ctx.fillRect(0, 0, W, G);
      ctx.beginPath();
      // depth 0 at the edge, 1 at the bottom of the band. Each column runs a
      // little longer or shorter (two slow waves), and each cell has its own
      // threshold, so the edge reads as dissolving rather than as a gradient.
      for (let y = G; y < H; y += G) {
        for (let x = 0; x < W; x += G) {
          const reach = 0.72 + 0.28 * Math.sin(x * 0.011 + ph1) * Math.sin(x * 0.0043 + ph2);
          const t = y / (H * reach);
          const v = (1 - t) * 1.5 - rand(x, y) * 0.55;
          if (v <= 0) continue;
          // full cells near the edge, then down to the logo's 2px dot
          const s = v >= 0.85 ? G : v >= 0.45 ? 3 : D.DOT;
          ctx.rect(x, y, s, s);
        }
      }
      ctx.fill();
    };

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 200);
    });
    window.addEventListener('themechange', draw);
    draw();
  });
})();
