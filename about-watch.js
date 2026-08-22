// ------------------------------------------------------------------
// The watch runs on the visitor's own clock.
//
// The dial artwork carries no hands — only the pinion hole — so the
// hands are SVG drawn over it and simply rotated. The clean dial sits on
// top of the photograph's dial, hiding the hands and date baked into
// that shot.
//
// The second hand SWEEPS rather than ticks. A mechanical watch beats
// several times a second, so a once-per-second jump reads as a quartz
// movement and gives the whole thing away. Sub-second precision costs
// nothing here: the angle is just derived from the millisecond.
//
// Deliberately a generic watch — which ones someone actually owns is not
// something worth publishing.
// ------------------------------------------------------------------
(function () {
  const face = document.querySelector('[data-rlx-face]');
  if (!face) return;

  const hour = face.querySelector('[data-rlx-hour]');
  const min = face.querySelector('[data-rlx-min]');
  const sec = face.querySelector('[data-rlx-sec]');
  if (!hour || !min || !sec) return;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let running = false;

  const draw = () => {
    const now = new Date();
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    // the hour and minute hands creep too: an hour hand that only moves on
    // the hour is the other giveaway
    hour.setAttribute('transform', 'rotate(' + (h * 30).toFixed(3) + ')');
    min.setAttribute('transform', 'rotate(' + (m * 6).toFixed(3) + ')');
    sec.setAttribute('transform', 'rotate(' + (s * 6).toFixed(3) + ')');
  };

  const tick = () => {
    raf = requestAnimationFrame(tick);
    draw();
  };

  const start = () => {
    if (running || still) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  draw();   // show the right time before any of the above runs

  if (still) return;   // correct, just not animated

  // no reason to run a render loop for a watch nobody is looking at
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => { e[0].isIntersecting ? start() : stop(); },
      { threshold: 0 }).observe(face);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { draw(); start(); }
  });
})();
