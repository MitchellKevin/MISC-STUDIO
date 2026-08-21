// Showcase — a scroll-driven deck of project cards.
//
// Shared by the homepage and the about page. Call initShowcase() once the
// markup is in the DOM; it no-ops when there is no .showcase on the page.
// Pinned, so the caller decides WHEN to build it — ScrollTrigger needs
// pinned triggers created in top-to-bottom page order.
// Requires gsap + ScrollTrigger.
window.initShowcase = function () {
  // MARK: Showcase — a scroll-driven deck of project cards.
  // Created after the process pin (which sits above it) so ScrollTrigger measures
  // its position correctly once the pin spacers exist.
  //
  // The section pins and the scroll position maps straight onto "which card is in
  // front": card i sits at depth d = i - progress. Depth >= 0 means it is still
  // stacked (the deeper it goes the higher, smaller and dimmer it sits, so the
  // stack reads as more-work-behind before you scroll at all); depth < 0 means it
  // has been scrolled past and drops away below. Deriving every card from that one
  // number is what makes the whole thing exactly reversible on the way back up.
  const showcaseSection = document.querySelector('.showcase');
  const deck = showcaseSection && showcaseSection.querySelector('.showcase__deck');
  if (showcaseSection && deck) {
    const cards = gsap.utils.toArray('.work-card', deck);
    const CARDS = cards.length;

    const PEEK = 10;      // % of card height each card behind pokes out above
    const SHRINK = 0.045; // scale lost per card of depth
    const FADE = 0.24;    // opacity lost per card of depth
    const MAX_DEPTH = 3;  // cards deeper than this stop fanning and sit hidden

    const place = (i, d) => {
      if (d >= 0) {
        // The fan is clamped to MAX_DEPTH so the deck stays the same compact size
        // whether there are four projects or forty — without this the stack climbs
        // a card-height per project and walks off the top of the section.
        const dv = Math.min(d, MAX_DEPTH);
        gsap.set(cards[i], {
          yPercent: -dv * PEEK,
          scale: 1 - dv * SHRINK,
          autoAlpha: Math.max(0, 1 - d * FADE),
        });
      } else {
        const t = Math.min(1, -d); // 0 -> 1 as the card drops away
        gsap.set(cards[i], { yPercent: t * 150, scale: 1, autoAlpha: 1 - t });
      }
    };

    cards.forEach((card, i) => gsap.set(card, { zIndex: CARDS - i, transformOrigin: '50% 100%' }));

    const totalEl = document.querySelector('#work-total');
    const indexEl = document.querySelector('#work-index');
    if (totalEl) totalEl.textContent = String(CARDS).padStart(2, '0');

    let front = -1;
    const render = (p) => {
      cards.forEach((_, i) => place(i, i - p));
      const idx = gsap.utils.clamp(0, CARDS - 1, Math.round(p));
      if (idx === front) return;
      front = idx;
      cards.forEach((c, i) => c.classList.toggle('is-front', i === idx));
      if (indexEl) indexEl.textContent = String(idx + 1).padStart(2, '0');
    };

    render(0); // paint the resting stack before the first scroll

    if (CARDS > 1) {
      ScrollTrigger.create({
        trigger: showcaseSection,
        start: 'top top',
        // 0.55 viewport heights per card — enough to feel deliberate without
        // turning a long project list into an endless pinned section
        end: () => '+=' + window.innerHeight * (CARDS - 1) * 0.55,
        pin: true,
        scrub: 0.6,
        snap: { snapTo: 1 / (CARDS - 1), duration: 0.3, ease: 'power1.inOut' },
        onUpdate: (self) => render(self.progress * (CARDS - 1)),
      });
    }

    // gentle horizontal parallax on the giant background word
    gsap.fromTo(
      '.showcase__bgtext',
      { xPercent: 6 },
      {
        xPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: showcaseSection, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  }
};
