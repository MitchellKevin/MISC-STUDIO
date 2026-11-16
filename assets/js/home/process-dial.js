// ------------------------------------------------------------------
// Process dial — the "How it works" section. It pins while you scroll
// through it: the number dial on the left turns, the steps rise through
// the middle (sharp at the centre, blurred as they move away), and on the
// right a field of dots reforms from one step's icon into the next.
//
// The icons are the old line icons (24×24 SVG path data on each step's
// data-icon). Each one is stroked into an offscreen canvas and sampled
// into points; every dot travels from its spot in one icon to its spot
// in the next, bursting outwards half-way, and is pushed away by the
// cursor like the hero logo.
//
// Without JS, or before this runs, the steps are a plain list.
// ------------------------------------------------------------------
(() => {
  const section = document.querySelector('[data-pdial]');
  if (!section) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stage = section.querySelector('.pdial__stage');
  const steps = Array.from(section.querySelectorAll('.pdial__step'));
  const nums = Array.from(section.querySelectorAll('.pdial__num'));
  const wheel = section.querySelector('.pdial__wheel');
  const indexEl = section.querySelector('[data-pdial-index]');
  const canvas = section.querySelector('.pdial__particles');
  const LAST = steps.length - 1;
  if (LAST < 1) return;

  // how far, and which way, the wheel turns per step: from the CSS, because
  // the desktop dial (left edge) and the phone dial (top arc) differ
  const dialEl = section.querySelector('.pdial__dial');
  let stepAngle = 28;
  let dialDir = 1;
  const readDial = () => {
    if (!dialEl) return;
    const cs = getComputedStyle(dialEl);
    stepAngle = parseFloat(cs.getPropertyValue('--step-angle')) || 28;
    dialDir = parseFloat(cs.getPropertyValue('--dial-dir')) || 1;
  };
  const SPREAD = 62;       // svh between neighbouring steps
  const MAX_BLUR = 12;     // px of blur one step away from the centre

  section.classList.add('is-dial');

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n) => String(n).padStart(2, '0');

  // MARK: Particles
  // Same density as the hero logo: one dot on every GAP px grid point that
  // lands on the drawing, each DOT px square. The dot count is whatever the
  // biggest icon needs; smaller icons park their spare dots on top of their
  // own, where they don't show.
  const GAP = 4;
  const DOT = 2;
  let COUNT = 0;
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  let W = 0;
  let H = 0;
  let sets = [];                         // per icon: Float32Array [x0, y0, x1, y1, …]
  let px = new Float32Array(0);
  let py = px;
  let vx = px;
  let vy = px;
  let burst = px;                        // a fixed random direction per dot
  // px/py: each dot's mouse offset from its scroll position (vx/vy its speed)
  let dotColor = '#0022ff';
  const dotSize = DOT;
  const pointer = { x: -9999, y: -9999 };

  // Strokes one 24×24 icon into a size×size canvas and returns every point
  // of the GAP grid that lands on the stroke, in shuffled order (so a dot's
  // partner in the next icon is somewhere else entirely and the change reads
  // as a swirl, not a slide).
  const sample = (d, size) => {
    const off = document.createElement('canvas');
    off.width = off.height = size;
    const o = off.getContext('2d', { willReadFrequently: true });
    o.scale(size / 24, size / 24);
    o.lineWidth = 0.9;
    o.lineCap = 'round';
    o.lineJoin = 'round';
    o.strokeStyle = '#fff';
    o.stroke(new Path2D(d));
    const data = o.getImageData(0, 0, size, size).data;
    const pts = [];
    for (let y = 0; y < size; y += GAP) {
      for (let x = 0; x < size; x += GAP) {
        if (data[(y * size + x) * 4 + 3] > 128) pts.push([x, y]);
      }
    }
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    return pts;
  };

  let fieldSize = 0;
  const build = () => {
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // desktop: a big icon tucked towards the bottom-right corner; narrower
    // screens: centred in the band above the step text
    const wide = window.innerWidth >= 1024;
    fieldSize = Math.round(wide ? Math.min(W * 0.98, H * 0.93) : Math.min(W * 0.98, H * 0.96));
    // (the icons leave ~15% empty on each side of their 24-unit box, so the
    // box can run past the right edge without the drawing touching it)
    const ox = wide ? W - fieldSize + fieldSize * 0.02 : (W - fieldSize) / 2;
    const oy = wide ? H - fieldSize : (H - fieldSize) / 2;
    const raw = steps.map((s) => sample(s.dataset.icon || '', fieldSize));
    COUNT = Math.max(1, ...raw.map((p) => p.length));
    sets = raw.map((pts) => {
      const out = new Float32Array(COUNT * 2);
      const n = pts.length || 1;
      for (let i = 0; i < COUNT; i++) {
        const p = pts[i % n] || [fieldSize / 2, fieldSize / 2];
        out[i * 2] = p[0] + ox;
        out[i * 2 + 1] = p[1] + oy;
      }
      return out;
    });
    px = new Float32Array(COUNT);
    py = new Float32Array(COUNT);
    vx = new Float32Array(COUNT);
    vy = new Float32Array(COUNT);
    burst = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.35 + Math.random() * 0.65;
      burst[i * 2] = Math.cos(a) * r;
      burst[i * 2 + 1] = Math.sin(a) * r;
    }
    const c = getComputedStyle(canvas).getPropertyValue('--dot-color').trim();
    if (c) dotColor = c;
  };

  // the hero logo's shove (hero-particles.js), with a stronger pull back
  // into the icon so the shape snaps back together sooner
  const REACH = 175;
  const PUSH = 6500;
  const SPRING = 0.05;
  const FRICTION = 0.9;

  const stepParticles = (f) => {
    if (!sets.length) return;
    const i0 = clamp(Math.floor(f), 0, LAST);
    const i1 = Math.min(i0 + 1, LAST);
    const raw = clamp(f - i0, 0, 1);
    const t = raw * raw * (3 - 2 * raw);           // smoothstep
    const a = sets[i0];
    const b = sets[i1];
    const spread = Math.sin(Math.PI * t) * fieldSize * 0.32; // the half-way burst
    // The scroll alone decides where a dot sits: exactly on its spot between
    // this icon and the next, no easing or springing. The mouse adds an
    // offset on top (px/py), and only that offset has physics: it gets
    // shoved away and springs back to zero.
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    for (let i = 0; i < COUNT; i++) {
      const hx = a[i * 2] + (b[i * 2] - a[i * 2]) * t + burst[i * 2] * spread;
      const hy = a[i * 2 + 1] + (b[i * 2 + 1] - a[i * 2 + 1]) * t + burst[i * 2 + 1] * spread;
      if (!reduced) {
        const dx = hx + px[i] - pointer.x;
        const dy = hy + py[i] - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REACH * REACH) {
          const force = PUSH / Math.max(d2, 400);
          const d = Math.sqrt(d2) || 1;
          vx[i] += (dx / d) * force;
          vy[i] += (dy / d) * force;
        }
        vx[i] = (vx[i] - px[i] * SPRING) * FRICTION;
        vy[i] = (vy[i] - py[i] * SPRING) * FRICTION;
        px[i] += vx[i];
        py[i] += vy[i];
      }
      ctx.rect(hx + px[i], hy + py[i], dotSize, dotSize);
    }
    ctx.fill();
  };

  stage.addEventListener('pointermove', (e) => {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
  });
  stage.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });

  // MARK: Scroll → steps, dial and dots
  const progress = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  };

  let f = 0;
  let active = -1;
  const layout = () => {
    steps.forEach((s, i) => {
      const d = i - f;
      const dist = Math.min(Math.abs(d), 1);
      s.style.transform = `translateY(calc(-50% + ${(d * SPREAD).toFixed(3)}svh))`;
      // sharp for the last stretch into the centre, then softening fast
      const soft = Math.max(0, dist - 0.18) / 0.82;
      s.style.filter = soft > 0.005 ? `blur(${(soft * MAX_BLUR).toFixed(2)}px)` : 'none';
      s.style.opacity = (1 - dist * 0.97).toFixed(3);
      s.style.visibility = Math.abs(d) > 1.4 ? 'hidden' : '';
    });
    if (wheel) wheel.style.transform = `rotate(${(-dialDir * f * stepAngle).toFixed(3)}deg)`;
    const now = clamp(Math.round(f), 0, LAST);
    if (now !== active) {
      active = now;
      nums.forEach((n, i) => n.classList.toggle('is-active', i === now));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === now));
      if (indexEl) indexEl.textContent = pad(now + 1);
    }
  };

  let visible = false;
  let running = false;
  const frame = () => {
    if (!running) return;
    const target = progress() * LAST;
    f = target;
    layout();
    stepParticles(f);
    if (!visible) { running = false; return; }
    requestAnimationFrame(frame);
  };
  const wake = () => {
    if (running || !visible) return;
    running = true;
    requestAnimationFrame(frame);
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) wake();
    }).observe(section);
  } else {
    visible = true;
    wake();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { readDial(); build(); wake(); }, 150);
  });

  // Snap: when the scroll has properly come to rest close to a step, ease
  // the last bit of the way onto it, slowly. Stopping somewhere near the
  // middle between two steps is left alone, so it never yanks you a long way.
  const SNAP_IDLE = 380;     // ms of no scrolling before it settles
  const SNAP_RANGE = 0.3;    // only within this much of a step (in steps)
  const SNAP_TIME = 1.1;     // seconds the glide takes
  let snapTimer;
  let snapping = false;
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  const snap = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (r.top > 0 || -r.top > total) return;          // not pinned
    const p = -r.top / total;
    const stepPos = p * LAST;
    const off = Math.round(stepPos) - stepPos;
    if (Math.abs(off) < 0.01 || Math.abs(off) > SNAP_RANGE) return;
    const top = window.scrollY + (off / LAST) * total;
    snapping = true;
    const done = () => { snapping = false; };
    if (window.miscLenis) {
      window.miscLenis.scrollTo(top, { duration: SNAP_TIME, easing: easeOut, onComplete: done });
    } else {
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      setTimeout(done, SNAP_TIME * 1000);
    }
  };
  window.addEventListener('scroll', () => {
    if (snapping) return;                              // our own glide
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snap, SNAP_IDLE);
  }, { passive: true });
  // any wheel / touch from the visitor cancels a glide in progress
  ['wheel', 'touchstart'].forEach((type) => window.addEventListener(type, () => {
    snapping = false;
  }, { passive: true }));

  // Keyboard: the steps only move with the page scroll, so focusing a link
  // in one scrolls the page to where that step sits in the middle.
  steps.forEach((s, i) => {
    s.addEventListener('focusin', () => {
      requestAnimationFrame(() => {
        const top = section.getBoundingClientRect().top + window.scrollY;
        const total = section.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + total * (i / LAST), behavior: 'instant' });
      });
    });
  });

  readDial();
  build();
  f = progress() * LAST;
  layout();
  stepParticles(f);
})();
