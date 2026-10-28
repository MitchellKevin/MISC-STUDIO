// ------------------------------------------------------------------
// Dot globe. Used twice on the about page: once spinning to Hoofddorp,
// once with visited countries lit up.
//
// Dependency-free at runtime, like hero-particles.js. The country data
// is precomputed by tools/build-globe.js into about-globe-data.js —
// one byte per sample point — and the coordinates are rebuilt here from
// the same Fibonacci formula rather than shipped.
//
// The projection is plain orthographic: rotate the sphere so (lon0,lat0)
// faces the viewer, then drop the z axis. Points with z <= 0 are on the
// far side and are skipped, which is what makes it read as a ball.
// ------------------------------------------------------------------
(function () {
  const RAD = Math.PI / 180;

  function decode(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // the same sequence tools/build-globe.js walked, so index i here is the
  // same point as index i there
  function coords(count) {
    const lon = new Float32Array(count);
    const lat = new Float32Array(count);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      lat[i] = Math.asin(y) / RAD;
      lon[i] = Math.atan2(Math.sin(th) * r, Math.cos(th) * r) / RAD;
    }
    return { lon, lat };
  }

  function create(canvas, options) {
    const data = window.GLOBE_DATA;
    if (!canvas || !data) return null;
    const opts = options || {};
    const ctx = canvas.getContext('2d');
    const bytes = decode(data.bytes);
    const { lon, lat } = coords(data.count);

    // country name -> index, so callers can highlight by name
    const byName = new Map();
    data.countries.forEach((n, i) => byName.set(n.toLowerCase(), i));

    let highlight = new Uint8Array(data.countries.length);   // 1 = lit
    let rot = { lon: opts.lon || 0, lat: opts.lat || 20 };
    let width = 0, height = 0, radius = 0, dpr = 1;
    let raf = 0, spinning = true, visible = true;
    let ink = '#ffffff', dim = '#767676';

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      ink = (cs.getPropertyValue('--color-white') || '#fff').trim();
      dim = (cs.getPropertyValue('--color-dim') || '#767676').trim();
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, height) * (opts.fill || 0.42);
    }

    function draw() {
      if (!width) return;
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const sinP = Math.sin(rot.lat * RAD), cosP = Math.cos(rot.lat * RAD);
      const base = Math.max(0.9, radius / 150);      // dot size tracks the globe

      let lit = null;
      for (let i = 0; i < data.count; i++) {
        const c = bytes[i];
        if (c === data.ocean) continue;

        const phi = lat[i] * RAD;
        const dl = (lon[i] - rot.lon) * RAD;
        const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);
        // z is the component pointing at the viewer — negative means far side
        const z = sinP * sinPhi + cosP * cosPhi * Math.cos(dl);
        if (z <= 0) continue;

        const x = cx + radius * cosPhi * Math.sin(dl);
        const y = cy - radius * (cosP * sinPhi - sinP * cosPhi * Math.cos(dl));
        const on = highlight[c] === 1;

        // fade dots out towards the rim so the sphere has some volume
        const a = on ? 1 : 0.15 + 0.55 * z;
        const r = on ? base * 1.5 : base;
        if (on) {
          (lit || (lit = [])).push(x, y, r);
        } else {
          ctx.globalAlpha = a;
          ctx.fillStyle = dim;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.283185);
          ctx.fill();
        }
      }
      // lit countries last so they sit on top of their neighbours
      if (lit) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = ink;
        ctx.beginPath();
        for (let i = 0; i < lit.length; i += 3) {
          ctx.moveTo(lit[i] + lit[i + 2], lit[i + 1]);
          ctx.arc(lit[i], lit[i + 1], lit[i + 2], 0, 6.283185);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (opts.marker) drawMarker(cx, cy, sinP, cosP);
    }

    // a ring on the surface at a fixed lon/lat, hidden when it swings round back
    function drawMarker(cx, cy, sinP, cosP) {
      const m = opts.marker;
      const phi = m.lat * RAD;
      const dl = (m.lon - rot.lon) * RAD;
      const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);
      const z = sinP * sinPhi + cosP * cosPhi * Math.cos(dl);
      if (z <= 0.02) return;
      const x = cx + radius * cosPhi * Math.sin(dl);
      const y = cy - radius * (cosP * sinPhi - sinP * cosPhi * Math.cos(dl));
      ctx.globalAlpha = Math.min(1, z * 2.2);
      ctx.strokeStyle = ink;
      ctx.lineWidth = Math.max(1.2, radius / 120);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(4, radius / 26), 0, 6.283185);
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.6, radius / 80), 0, 6.283185);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    let last = 0;
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      if (spinning) rot.lon = (rot.lon + dt * 0.004) % 360;
      draw();
    }

    readColors();
    resize();
    draw();
    raf = requestAnimationFrame(frame);

    const onResize = () => { resize(); draw(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('themechange', () => { readColors(); draw(); });

    // stop burning frames while the section is off screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) last = 0;
      }, { threshold: 0.05 }).observe(canvas);
    }

    return {
      rotation: rot,
      stopSpin() { spinning = false; },
      startSpin() { spinning = true; },
      redraw: draw,
      /* names not in the dataset are reported back so a typo is visible
         rather than silently doing nothing */
      setVisited(names) {
        highlight = new Uint8Array(data.countries.length);
        const missing = [];
        (names || []).forEach(n => {
          const i = byName.get(String(n).trim().toLowerCase());
          if (i === undefined) missing.push(n);
          else highlight[i] = 1;
        });
        draw();
        return missing;
      },
      countryNames: data.countries.slice()
    };
  }

  window.DotGlobe = { create };
})();
