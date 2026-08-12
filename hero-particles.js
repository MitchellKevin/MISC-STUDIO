// MARK: Hero particles — the logo, rebuilt out of dots that scatter under the
// cursor and spring back.
//
// The mark is not hand-plotted: nomi-logo.svg is rasterised into an offscreen
// canvas, sampled on a grid, and every light pixel becomes one particle. Change
// the logo and the particle field follows, no coordinates to maintain.
//
// Dependency-free on purpose — this runs before GSAP has anything to do, and a
// canvas loop has no business waiting on a CDN.
(() => {
  const canvas = document.querySelector('.hero__particles');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GAP = 4;         // sampling grid, in CSS pixels — also the dot spacing
  const DOT = 1.7;       // dot size
  const REACH = 175;     // how close the cursor has to get to push a dot
  const PUSH = 6500;     // shove strength, falls off with distance
  const SPRING = 0.02;   // pull back to the dot's home — low, so they drift far
  const FRICTION = 0.93; // high, so a shove keeps carrying after the cursor left

  let particles = [];
  let width = 0;
  let height = 0;
  let running = false;
  const pointer = { x: -9999, y: -9999 };

  const logo = new Image();

  const build = () => {
    // the canvas is display:none on small screens — nothing to sample
    if (!canvas.offsetParent && getComputedStyle(canvas).display === 'none') {
      particles = [];
      return;
    }

    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // draw the mark at the size it will occupy, so one source pixel is one dot
    const size = Math.round(Math.min(height * 0.55, width * 0.36));
    if (size < 40) return;

    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.drawImage(logo, 0, 0, size, size);

    let data;
    try {
      data = octx.getImageData(0, 0, size, size).data;
    } catch (err) {
      // opening the page over file:// taints the canvas the moment an SVG is
      // drawn into it — leave the hero as it was rather than throw
      canvas.style.display = 'none';
      return;
    }

    // dead centre, so the headline reads straight over the mark
    const originX = Math.round((width - size) / 2);
    const originY = Math.round((height - size) / 2);

    particles = [];
    for (let y = 0; y < size; y += GAP) {
      for (let x = 0; x < size; x += GAP) {
        const i = (y * size + x) * 4;
        if (data[i + 3] < 128) continue;
        // only the light half of the mark becomes dots: on a black page the
        // black wave is the gap between them, so the logo reads as a negative
        const lum = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
        if (lum < 0.55) continue;
        particles.push({ hx: originX + x, hy: originY + y, x: originX + x, y: originY + y, vx: 0, vy: 0 });
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.rect(p.x, p.y, DOT, DOT);
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

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  hero.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  // the loop only runs while the hero is actually on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(hero);
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

  logo.addEventListener('load', () => {
    build();
    draw();      // paint the resting mark even if the loop never starts
    start();
  });
  logo.src = 'nomi-logo.svg';
})();
