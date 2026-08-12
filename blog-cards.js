// MARK: Blog cards — the glass plate rides the cursor across the cover.
//
// Dependency-free on purpose: blog.html loads no GSAP, and the homepage strip
// should not need it either. The plate itself is positioned and eased in CSS —
// all this does is publish the cursor offset from the centre of the cover as
// --glass-x / --glass-y, clamped so the plate never slides out of the frame.
// With no pointer events at all the variables stay unset and the plate simply
// sits in the middle, which is what touch devices get.
(() => {
  const cards = document.querySelectorAll('.bpost');
  if (!cards.length) return;

  // a plate that runs right up to the edge looks clipped — keep it inside
  const EDGE = 10;

  cards.forEach((card) => {
    const media = card.querySelector('.bpost__media');
    const glass = card.querySelector('.bpost__glass');
    if (!media || !glass) return;

    const track = (e) => {
      const box = media.getBoundingClientRect();
      // the plate is measured live: its width depends on the label
      const limitX = Math.max(0, (box.width - glass.offsetWidth) / 2 - EDGE);
      const limitY = Math.max(0, (box.height - glass.offsetHeight) / 2 - EDGE);
      const x = e.clientX - box.left - box.width / 2;
      const y = e.clientY - box.top - box.height / 2;
      glass.style.setProperty('--glass-x', Math.max(-limitX, Math.min(limitX, x)).toFixed(1) + 'px');
      glass.style.setProperty('--glass-y', Math.max(-limitY, Math.min(limitY, y)).toFixed(1) + 'px');
    };

    // pointerenter places it before the fade-in starts, so it never flashes in
    // at the centre and then jumps to the cursor
    card.addEventListener('pointerenter', track);
    card.addEventListener('pointermove', track);
  });
})();
