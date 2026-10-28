// ------------------------------------------------------------------
// Intro + scroll animations for the service detail pages (GSAP).
// Loaded after gsap + ScrollTrigger, at the end of <body>.
// ------------------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// --- Hero intro: elements rise and fade in on load ---
gsap
  .timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
  .from('.detail-hero__label', { y: 20, autoAlpha: 0, duration: 0.6 }, 0)
  .from('.detail-hero__title', { y: 32, autoAlpha: 0, duration: 0.8 }, 0.08)
  .from('.detail-hero__sub', { y: 22, autoAlpha: 0, duration: 0.6 }, 0.24)
  .from('.detail-hero__pills li', { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.05 }, 0.34)
  .from('.detail-hero .btn', { y: 16, autoAlpha: 0, duration: 0.5 }, 0.5)
  .from('.detail-hero__icon', { autoAlpha: 0, scale: 0.9, duration: 0.9 }, 0.2);

// gentle continuous float on the hero icon (on the inner svg, so it doesn't
// fight the intro tween on the container)
gsap.to('.detail-hero__icon svg', {
  y: 10,
  duration: 3,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
});

// --- Reveal on scroll ---
// Single elements rise/fade as they enter the viewport.
const reveal = (target, vars = {}) =>
  gsap.from(target, {
    y: 30,
    autoAlpha: 0,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: target, start: 'top 88%' },
    ...vars,
  });

[
  '.detail-overview .section-label',
  '.detail-overview .section-title',
  '.detail-features .section-label',
  '.detail-features .section-title',
  '.detail-positions .section-label',
  '.detail-positions .section-title',
  '.positions-empty',
  '.detail-process .section-label',
  '.detail-process .section-title',
  '.more-services .section-label',
  '.more-services .section-title',
].forEach((sel) => {
  if (document.querySelector(sel)) reveal(sel);
});

reveal('.detail-cta__inner', { y: 24, scale: 0.98 });

// Groups whose children stagger in together as the group scrolls into view.
const staggerGroup = (groupSel, stagger = 0.08, y = 30) => {
  gsap.utils.toArray(groupSel).forEach((group) => {
    gsap.from(group.children, {
      y,
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger,
      scrollTrigger: { trigger: group, start: 'top 85%' },
    });
  });
};

staggerGroup('.feature-grid', 0.08);
staggerGroup('.process-list', 0.07, 22);
staggerGroup('.more-grid', 0.1, 24);
staggerGroup('.footer__top', 0.12, 22);

// --- Scroll-driven gradient fill on the overview copy ---
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fillSpans = gsap.utils.toArray('.detail-overview__body .fill-text > span');
if (fillSpans.length && !prefersReduced) {
  const fillTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.detail-overview__body',
      start: 'top 80%',
      end: 'bottom 45%',
      scrub: true,
    },
  });
  // fill each paragraph in turn as the block scrolls through
  fillSpans.forEach((span) => fillTl.to(span, { backgroundSize: '200% 200%', ease: 'none' }));
}
