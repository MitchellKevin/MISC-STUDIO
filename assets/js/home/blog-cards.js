// MARK: Blog row — the arrow buttons under the homepage's sideways row.
//
// Dependency-free on purpose: the homepage strip should not need GSAP for
// this. The row itself is a native scroller (CSS scroll-snap), so swiping
// and trackpads just work; this only adds the buttons. Each press moves one
// card along, and a button greys out at its end. While every card fits on
// screen there is nothing to scroll, so the buttons stay hidden.
(() => {
  const track = document.querySelector('[data-blog-track]');
  const nav = document.querySelector('[data-blog-nav]');
  if (!track || !nav) return;

  const prev = nav.querySelector('[data-blog-prev]');
  const next = nav.querySelector('[data-blog-next]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // one card plus the gap between cards
  const step = () => {
    const card = track.querySelector('.bpost');
    if (!card) return track.clientWidth;
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    nav.hidden = max <= 1;
    // a pixel of slack: scroll positions land on fractions at some zoom levels
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };

  const go = (dir) =>
    track.scrollBy({ left: dir * step(), behavior: reduced.matches ? 'auto' : 'smooth' });

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
