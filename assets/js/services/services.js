// ------------------------------------------------------------------
// Service detail pages. Reveals, the menu and the process rail come from
// site.js; this only drives the overview copy, which inks in paragraph by
// paragraph as it scrolls through the screen (services.css reads --p).
// No dependencies.
// ------------------------------------------------------------------
(() => {
  const paras = Array.from(document.querySelectorAll('.fill-text'));
  if (!paras.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    paras.forEach((p) => p.style.setProperty('--p', '1'));
    return;
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    paras.forEach((p) => {
      const r = p.getBoundingClientRect();
      // 0 while the paragraph's top is below 85% of the screen, 1 once its
      // bottom has risen past 55%
      const start = vh * 0.85;
      const end = vh * 0.55;
      const t = (start - r.top) / (start - end + r.height);
      p.style.setProperty('--p', Math.min(1, Math.max(0, t)).toFixed(3));
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
