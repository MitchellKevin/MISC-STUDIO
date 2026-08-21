// MARK: Particle field — an image rebuilt out of dots that scatter under
// the cursor and spring back.
//
// Nothing is hand-plotted: the source image is drawn into an offscreen
// canvas, sampled on a grid, and every pixel that passes becomes one
// particle. Change the image and the field follows, no coordinates to
// maintain.
//
// Two modes:
//   threshold — only pixels brighter than `threshold` become dots, all the
//     same size. Right for a flat logo: the dark half reads as the gap.
//   halftone  — every opaque pixel becomes a dot whose SIZE tracks its
//     brightness. Right for a photograph, where a hard cut-off would
//     collapse the whole thing into a silhouette.
//
// Used by the homepage hero (the logo) and the about hero (a portrait).
// Dependency-free on purpose — this runs before GSAP has anything to do,
// and a canvas loop has no business waiting on a CDN.
window.initParticles = function (options) {
  const o = Object.assign({
    canvas: '.hero__particles',
    container: '.hero',
    src: 'nomi-logo.png',
    gap: 4,           // sampling grid in CSS px — also the dot spacing
    dot: 1.7,         // dot size (threshold mode)
    align: 'center',  // 'center' | 'right'
    inset: 0,         // gap from the edge when align is 'right', in CSS px
    mode: 'threshold',
    threshold: 0.55,
    minDot: 0.5,      // halftone: dot size at black
    maxDot: 3.1,      // halftone: dot size at white
    // Levels, applied before the tone is turned into a dot size. A photo
    // rarely uses the full range — MS.jpg tops out around 0.43 — so without
    // stretching what is actually there, every dot comes out tiny and the
    // portrait never reads. Defaults are a no-op.
    black: 0,         // input tone that becomes 0
    white: 1,         // input tone that becomes 1
    gamma: 1,         // >1 lifts the midtones
    cut: 0.06,        // drop dots below this, AFTER levels
    square: false,    // centre-crop a non-square source to a square
    fill: null        // size of the field; defaults to the homepage sizing
  }, options || {});

  const canvas = document.querySelector(o.canvas);
  const host = document.querySelector(o.container);
  if (!canvas || !host || !canvas.getContext) return null;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const REACH = 175;     // how close the cursor has to get to push a dot
  const PUSH = 6500;     // shove strength, falls off with distance
  const SPRING = 0.02;   // pull back to the dot's home — low, so they drift far
  const FRICTION = 0.93; // high, so a shove keeps carrying after the cursor left

  let particles = [];
  let width = 0;
  let height = 0;
  let running = false;
  const pointer = { x: -9999, y: -9999 };

  const image = new Image();

  const build = () => {
    // the canvas is display:none on small screens — nothing to sample
    if (!canvas.offsetParent && getComputedStyle(canvas).display === 'none') {
      particles = [];
      return;
    }

    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // draw at the size it will occupy, so one source pixel is one dot
    const size = Math.round(o.fill ? o.fill(width, height)
                                   : Math.min(height * 0.55, width * 0.36));
    if (size < 40) { particles = []; return; }

    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d', { willReadFrequently: true });

    if (o.square && image.naturalWidth && image.naturalHeight) {
      // centre-crop the source so a portrait does not come out stretched
      const s = Math.min(image.naturalWidth, image.naturalHeight);
      const sx = (image.naturalWidth - s) / 2;
      const sy = (image.naturalHeight - s) / 2;
      octx.drawImage(image, sx, sy, s, s, 0, 0, size, size);
    } else {
      octx.drawImage(image, 0, 0, size, size);
    }

    let data;
    try {
      data = octx.getImageData(0, 0, size, size).data;
    } catch (err) {
      // a tainted canvas (file://) would throw here — leave the section as it
      // was rather than blow up
      canvas.style.display = 'none';
      return;
    }

    const originX = o.align === 'right'
      ? Math.round(width - size - o.inset)
      : Math.round((width - size) / 2);
    const originY = Math.round((height - size) / 2);

    const halftone = o.mode === 'halftone';
    const span = Math.max(0.0001, o.white - o.black);
    const invGamma = 1 / o.gamma;
    particles = [];
    for (let y = 0; y < size; y += o.gap) {
      for (let x = 0; x < size; x += o.gap) {
        const i = (y * size + x) * 4;
        if (data[i + 3] < 128) continue;
        const lum = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;

        let s;
        if (halftone) {
          let t = (lum - o.black) / span;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          if (invGamma !== 1) t = Math.pow(t, invGamma);
          // whatever is left down in the shadows becomes empty space, which
          // is what separates the subject from the background
          if (t < o.cut) continue;
          s = o.minDot + (o.maxDot - o.minDot) * t;
        } else {
          if (lum < o.threshold) continue;
          s = o.dot;
        }
        particles.push({
          hx: originX + x, hy: originY + y,
          x: originX + x, y: originY + y,
          vx: 0, vy: 0, s: s
        });
      }
    }
  };

  // the canvas paints itself, so it has to read the theme token rather than
  // inherit it; theme-toggle.js fires themechange after the swap
  let dotColor = '#ffffff';
  const readDotColor = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--color-white').trim();
    if (v) dotColor = v;
  };
  readDotColor();
  window.addEventListener('themechange', () => { readDotColor(); draw(); });

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.rect(p.x, p.y, p.s, p.s);
    }
    ctx.fill();
  };

  const step = () => {
    if (!running) return;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < REACH * REACH) {
        // inverse-square shove. The floor on dist2 is what keeps a direct hit
        // from launching a dot clean off the canvas — raise PUSH and this has
        // to come up with it
        const force = PUSH / Math.max(dist2, 400);
        const dist = Math.sqrt(dist2) || 1;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
      p.vx = (p.vx + (p.hx - p.x) * SPRING) * FRICTION;
      p.vy = (p.vy + (p.hy - p.y) * SPRING) * FRICTION;
      p.x += p.vx;
      p.y += p.vy;
    }
    draw();
    requestAnimationFrame(step);
  };

  const start = () => {
    if (running || reduced || !particles.length) return;
    running = true;
    requestAnimationFrame(step);
  };
  const stop = () => { running = false; };

  host.addEventListener('pointermove', (e) => {
    const rect = host.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  host.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  // the loop only runs while the section is actually on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(host);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw();
      start();
    }, 200);
  });

  image.addEventListener('load', () => {
    build();
    draw();      // paint the resting image even if the loop never starts
    start();
  });
  image.src = o.src;

  return { rebuild: () => { build(); draw(); }, stop: stop };
};

// The homepage hero, with the settings it has always used. The about page
// calls initParticles() itself with its own image, so this only fires where
// .hero__particles actually exists.
if (document.querySelector('.hero__particles')) window.initParticles();
