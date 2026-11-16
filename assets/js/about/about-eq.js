// ------------------------------------------------------------------
// The AirPods heading, drawn as an equalizer.
//
// A column of stacked segments per bar, bouncing, and the whole field
// clipped to the letterforms — so the word IS the meter rather than
// sitting next to one.
//
// The clip is a destination-in composite, not a clipping path: canvas
// has no "clip to text", but drawing the word over the bars with
// destination-in keeps only the pixels the glyphs cover, which comes to
// the same thing and costs one fill.
//
// The word, the font and the size all come from the <h2> itself, so the
// heading stays a real heading in the markup — the canvas only paints
// over the top of it. Change the text in about.html and this follows.
//
// It is the meter of the site's own music: it moves only while the
// soundtrack is actually playing (sound-toggle.js announces it), and holds
// its last shape, frozen, while it is off — like the bars in the header.
//
// Unlit segments are still drawn, faintly. Without them the word breaks
// up into disconnected fragments every time the levels drop, and a
// heading you cannot read is not worth the effect.
// ------------------------------------------------------------------
(function () {
  const word = document.querySelector('[data-eq]');
  const canvas = document.querySelector('[data-eq-canvas]');
  if (!word || !canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const host = word.closest('.apods__bg');

  // Bottom to top, as on a real meter: quiet at the base, brighter as it
  // climbs. The ramp is in weight rather than hue, so the body of the
  // word belongs to a monochrome page — the ink is the theme token, so it
  // inverts with everything else.
  //
  // It tops out short of full strength on purpose: the only thing at full
  // strength is the peak cap, so the cap always has somewhere to stand out
  // from.
  const RAMP = [
    [0.00, 0.42],
    [0.40, 0.58],
    [0.62, 0.75],
    [0.80, 0.90]
  ];
  const UNLIT = 0.18;     // how much of its band an unlit segment keeps

  // The single segment riding the top of each bar — one row, never a
  // block. A band of colour several rows deep reads as a coloured chunk
  // of the letter; one row reads as the level it actually is.
  // Fine enough that a letter is built from ~9 bars rather than ~5: any
  // coarser and the glyphs stop being letters and turn into blocks.
  // All four are shares of the TEXT height, not the canvas height — see
  // draw(), where the whole grid is fitted to the letters.
  const BAR_W = 0.049;
  const BAR_GAP = 0.027;
  const SEG_H = 0.035;    // keeps the grid square-ish at any size
  const SEG_GAP = 0.020;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const small = window.matchMedia('(max-width: 700px)');

  let w = 0, h = 0, dpr = 1;
  let raf = 0, running = false, visible = false;
  // the meter's own clock: it only advances while the music plays, so
  // pausing freezes the shape where it was and playing picks it up again
  let clock = 1.3, last = 0;
  let playing = !!(window.miscSound && window.miscSound.sounding);

  // ---- sizing ------------------------------------------------------
  // The canvas is measured, not assumed: it sits over the heading, so
  // its box already carries whatever the media queries decided.
  function measure() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  // the glyphs are drawn from the heading's own computed font, so the
  // canvas word matches the one it is covering
  function font() {
    const cs = getComputedStyle(word);
    return `${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`;
  }

  // ---- levels ------------------------------------------------------
  // Layered sines rather than random noise: noise jitters, and a real
  // spectrum moves in bands. The three periods do not divide into each
  // other, so the pattern takes a long time to visibly repeat.
  function level(i, t, n) {
    const a = Math.sin(t * 1.7 + i * 0.55);
    const b = Math.sin(t * 2.9 + i * 0.21 + 1.3);
    const c = Math.sin(t * 0.7 + i * 0.9 + 2.1);
    // sits high and dips, rather than sitting low and spiking: an unlit
    // segment is nearly invisible on black, and the word has to stay a word
    const v = 0.7 + 0.18 * a + 0.12 * b + 0.09 * c;
    // low end runs hotter, the way bass does on a meter
    const tilt = 1.06 - (i / n) * 0.18;
    return Math.max(0.06, Math.min(1, v * tilt));
  }

  function band(f) {
    let a = RAMP[0][1];
    for (const [stop, alpha] of RAMP) if (f >= stop) a = alpha;
    return a;
  }

  // Taken from the surface token on the word itself, not hard-coded, so
  // the meter inks itself for whatever surface the section sits on.
  let ink = '#ffffff';
  // the peak caps take the site's blue accent, from its token
  let peak = '#0022ff';
  function readInk() {
    const cs = getComputedStyle(word);
    const v = cs.getPropertyValue('--ink').trim();
    if (v) ink = v;
    const a = cs.getPropertyValue('--brand-accent').trim();
    if (a) peak = a;
  }

  // ---- paint -------------------------------------------------------
  function draw(now) {
    if (playing && last && now) clock += Math.min(0.1, (now - last) / 1000);
    last = playing ? now : 0;
    const t = clock;

    ctx.clearRect(0, 0, w, h);

    // The meter is fitted to the letters, not to the canvas. The canvas is
    // deliberately bigger than the word — it has to be, or an overhanging
    // glyph gets sliced — so a ramp measured against the canvas puts its
    // peak band in the empty space above the caps, where no glyph can
    // ever show it. Everything below is in glyph-box space.
    ctx.font = font();
    // the heading is set with tight (negative) tracking; drawn without it the
    // canvas word comes out wider than the real one, and its first and last
    // letters run off the edges of the canvas
    if ('letterSpacing' in ctx) {
      const ls = getComputedStyle(word).letterSpacing;
      ctx.letterSpacing = ls === 'normal' ? '0px' : ls;
    }
    ctx.textAlign = 'center';
    const m = ctx.measureText(word.textContent);
    const asc = m.actualBoundingBoxAscent || 0;
    const desc = m.actualBoundingBoxDescent || 0;
    const boxH = asc + desc;
    if (boxH <= 0) return;
    const baseline = h / 2 + (asc - desc) / 2;
    const floorY = baseline + desc;      // the bottom of the ink

    const barW = boxH * BAR_W;
    const pitch = boxH * (BAR_W + BAR_GAP);
    const segPitch = boxH * (SEG_H + SEG_GAP);
    const segH = boxH * SEG_H;
    const rows = Math.max(1, Math.floor(boxH / segPitch));
    const n = Math.max(1, Math.round(w / pitch));
    // centre the field, so the leftover fraction of a bar is split
    const x0 = (w - (n * pitch - boxH * BAR_GAP)) / 2;

    // levels first, then a row at a time. Bands only change going up, so
    // walking rows on the outside sets fill and alpha a handful of times
    // per frame instead of once per segment.
    const lit = [];
    for (let i = 0; i < n; i++) {
      lit.push(Math.round((still.matches ? 1 : level(i, t, n)) * rows));
    }

    for (let r = 0; r < rows; r++) {
      const f = rows === 1 ? 1 : r / (rows - 1);
      const alpha = band(f);
      const y = floorY - (r + 1) * segPitch + (segPitch - segH);

      ctx.fillStyle = ink;
      ctx.globalAlpha = alpha * UNLIT;
      for (let i = 0; i < n; i++) {
        if (r >= lit[i]) ctx.fillRect(x0 + i * pitch, y, barW, segH);
      }
      // the body of the bar stops one row short — that row is the cap
      ctx.globalAlpha = alpha;
      for (let i = 0; i < n; i++) {
        if (r < lit[i] - 1) ctx.fillRect(x0 + i * pitch, y, barW, segH);
      }
      ctx.fillStyle = peak;
      ctx.globalAlpha = 1;
      for (let i = 0; i < n; i++) {
        if (r === lit[i] - 1) ctx.fillRect(x0 + i * pitch, y, barW, segH);
      }
    }
    ctx.globalAlpha = 1;

    // ---- and now only where the letters are ------------------------
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = '#000';
    ctx.fillText(word.textContent, w / 2, baseline);
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    draw(now);
    // a static meter (music off, or reduced motion) needs one frame, not sixty
    if (!running || still.matches || !playing) { raf = 0; last = 0; return; }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf || !w) return;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // ---- on / off ----------------------------------------------------
  // On a phone the heading is normal-sized type in front of the model,
  // and an equalizer at that size is mush — so the canvas stays off and
  // the <h2> is simply left alone.
  function apply() {
    const on = !small.matches;
    running = on && visible;
    host.classList.toggle('is-eq', on);
    canvas.hidden = !on;
    if (!on) { stop(); return; }
    if (!measure()) return;
    if (running) start(); else { stop(); requestAnimationFrame(draw); }
  }

  // the canvas is the last section on the page; there is no reason for it
  // to run while you are eight screens above it
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      running = visible && !small.matches;
      if (running) start(); else stop();
    }, { rootMargin: '20% 0px' }).observe(canvas);
  } else {
    visible = true;
  }

  // metrics are wrong until Poppins is actually there, and a heading
  // measured in the fallback font clips the effect to the wrong shape
  const ready = document.fonts && document.fonts.ready
    ? document.fonts.ready
    : Promise.resolve();
  readInk();
  ready.then(apply);

  window.addEventListener('resize', () => { if (measure()) requestAnimationFrame(draw); });
  window.addEventListener('soundchange', (e) => {
    playing = !!(e.detail && e.detail.sounding);
    if (running && playing) start();
  });
  small.addEventListener('change', apply);
  still.addEventListener('change', apply);
})();
