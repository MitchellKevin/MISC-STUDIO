// MARK: Hero Text Animation

gsap.registerPlugin(CustomEase);

const customEaseIn = CustomEase.create('custom-ease-in', '0.52, 0.00, 0.48, 1.00');
const fourtyFrames = 1.3333333;
const fiftyFrames = 1.66666;
const twoFrames = 0.666666;
const fourFrames = 0.133333;
const sixFrames = 0.2;

const header = document.querySelector('.header');
const book = document.querySelector('.first-desc span');
const open = document.querySelector('.second-desc span');
const copy = document.querySelector('.copyright span');
const scrollToRows = document.querySelectorAll('.scroll-to .scroll-to__row span');
const btnCircle = document.querySelector('.book-btn__circle');
const btnText = document.querySelector('.btn-text span');
const partners = document.querySelector('.partners');
// GOOD DESIGN
const go = document.querySelector('#go span');
const od = document.querySelector('#od span');
const des = document.querySelector('#des span');
const ign = document.querySelector('#ign span');
// EARNS TRUST
const ear = document.querySelector('#ear span');
const ns = document.querySelector('#ns span');
const tru = document.querySelector('#tru span');
const st = document.querySelector('#st span');

// Each chunk starts fully outside its own overflow:hidden mask, so the offset
// must be wider than the chunk itself. Directions alternate so neighbouring
// chunks slide in from opposite sides and mesh together.
const showElements = () => {
  const timeline = gsap.timeline();
  timeline
        .fromTo(btnCircle, { autoAlpha: 0 }, { autoAlpha: 1, duration: fourtyFrames, ease: customEaseIn}, 0)
        .fromTo(btnCircle, { scale: 0.417 }, { scale: 1, duration: fourtyFrames, ease: customEaseIn}, 0)
        .fromTo(header, {y: '-100%'}, {y: '0rem', duration: fourtyFrames, ease: customEaseIn}, 0)
        .fromTo(go, {x: '2.2rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, 0)
        .fromTo(book, {y: '0.5rem'}, {y: '0rem', duration: fourtyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(des, {x: '3.1rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(ns, {x: '-2.2rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(st, {x: '-2.2rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(open, {y: '0.3rem'}, {y: '0rem', duration: fourtyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(btnText, {y: '0.4rem'}, {y: '0rem', duration: fourtyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(od, {x: '-2.2rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(ign, {x: '-3.1rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(ear, {x: '3.1rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(tru, {x: '3.1rem'}, { x: '0rem', duration: fiftyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(copy, {y: '0.4rem'}, {y: '0rem', duration: fourtyFrames, ease: customEaseIn}, sixFrames)
        .fromTo(scrollToRows, {y: '0.5rem'}, {y: '0rem', duration: fourtyFrames, ease: customEaseIn}, sixFrames)
        .fromTo(partners, {autoAlpha: 0, y: '0.3rem'}, {autoAlpha: 1, y: '0rem', duration: fourtyFrames, ease: customEaseIn}, sixFrames);

  return timeline;
}

const hideElements = () => {
  const timeline = gsap.timeline();

  timeline
        .fromTo(copy, {y: '0rem'}, {y: '0.4rem', duration: fourtyFrames, ease: customEaseIn}, 0)
        .fromTo(scrollToRows, {y: '0rem'}, {y: '0.5rem', duration: fourtyFrames, ease: customEaseIn}, 0)
        .fromTo(partners, {autoAlpha: 1, y: '0rem'}, {autoAlpha: 0, y: '0.3rem', duration: fourtyFrames, ease: customEaseIn}, 0)
        .fromTo(open, {y: '0rem'}, {y: '0.3rem', duration: fourtyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(btnText, {y: '0rem'}, {y: '0.4rem', duration: fourtyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(od, {x: '0rem'}, { x: '-2.2rem', duration: fiftyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(ign, {x: '0rem'}, { x: '-3.1rem', duration: fiftyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(ear, {x: '0rem'}, { x: '3.1rem', duration: fiftyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(tru, {x: '0rem'}, { x: '3.1rem', duration: fiftyFrames, ease: customEaseIn}, twoFrames)
        .fromTo(book, {y: '0rem'}, {y: '0.5rem', duration: fourtyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(des, {x: '0rem'}, { x: '3.1rem', duration: fiftyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(ns, {x: '0rem'}, { x: '-2.2rem', duration: fiftyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(st, {x: '0rem'}, { x: '-2.2rem', duration: fiftyFrames, ease: customEaseIn}, fourFrames)
        .fromTo(btnCircle, { autoAlpha: 1 }, { autoAlpha: 0, duration: fourtyFrames, ease: customEaseIn}, sixFrames)
        .fromTo(btnCircle, { scale: 1 }, { scale: 0.417, duration: fourtyFrames, ease: customEaseIn}, sixFrames)
        .fromTo(header, {y: '0rem'}, {y: '-100%', duration: fourtyFrames, ease: customEaseIn}, sixFrames)
        .fromTo(go, {x: '0rem'}, { x: '2.2rem', duration: fiftyFrames, ease: customEaseIn}, sixFrames);

  return timeline;
}

// Live local time in the Netherlands, so the line reads e.g. "Netherlands — 14:32 CEST".
// Handles CET/CEST automatically and stays correct wherever the visitor is.
const localTime = document.querySelector('#local-time');
// the about section shows the same clock, without the country prefix
const aboutTime = document.querySelector('#about-time');

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
  hour12: false,
});

const renderLocalTime = () => {
  if (!localTime && !aboutTime) return;
  const now = timeFormatter.format(new Date());
  const next = `Netherlands — ${now}`;
  // only touch the DOM when the minute actually rolls over
  if (localTime && localTime.textContent !== next) {
    localTime.textContent = next;
  }
  if (aboutTime && aboutTime.textContent !== now) {
    aboutTime.textContent = now;
  }
}

// MARK: Services — pinned scroll section
//
// The page scrolls normally: the hero scrolls away, then the services section
// pins to the viewport. While it is pinned, scrolling rotates the dial and
// carousels the centre content from one service to the next. Scrolling back up
// reverses it, and scrolling past releases the pin and continues the page.

gsap.registerPlugin(ScrollTrigger);
if (window.MorphSVGPlugin) gsap.registerPlugin(MorphSVGPlugin);

// On touch-only devices, normalize scrolling so the pinned services section
// snaps reliably — the mobile address bar resizing the viewport mid-pin was
// throwing the snap off. Scoped to touch so desktop scrolling is untouched.
if (ScrollTrigger.isTouch === 1) {
  ScrollTrigger.normalizeScroll(true);
}

// MARK: Horizontal statement — the line scrolls sideways while pinned, and each
// character springs into place as it passes through the viewport.
// NOTE: created BEFORE the services pin because it sits higher on the page.
// ScrollTrigger must build pinned triggers top-to-bottom (and refresh them in
// that order) so each pin's spacer is accounted for when the next one measures
// its start — otherwise the services carousel fires early, during this section.
const hWrapper = document.querySelector('.Horizontal');
const hText = document.querySelector('.Horizontal__text');

if (hWrapper && hText) {
  // Split into word + character spans ourselves (no SplitText plugin needed).
  const words = hText.textContent.trim().split(/\s+/);
  hText.textContent = '';
  const hChars = [];
  words.forEach((word) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'h-word';
    for (const ch of word) {
      const charEl = document.createElement('span');
      charEl.className = 'h-char';
      charEl.textContent = ch;
      wordEl.appendChild(charEl);
      hChars.push(charEl);
    }
    hText.appendChild(wordEl);
  });

  // Pin the section and drive the line leftward with the scroll.
  const scrollTween = gsap.to(hText, {
    xPercent: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: hWrapper,
      pin: true,
      scrub: true,
      // scroll distance ~= how far the line travels, for a natural 1:1 feel
      end: () => '+=' + hText.offsetWidth,
      invalidateOnRefresh: true,
      // higher priority = refreshed first, so its pin spacer is set before the
      // services pin below measures its position
      refreshPriority: 1,
    },
  });

  // Each character animates as it crosses the viewport, measured against the
  // horizontal container animation above (nested ScrollTriggers).
  hChars.forEach((char) => {
    gsap.from(char, {
      yPercent: 'random(-200, 200)',
      rotation: 'random(-20, 20)',
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger: char,
        containerAnimation: scrollTween,
        start: 'left 100%',
        end: 'left 30%',
        scrub: 1,
      },
    });
  });
}

// MARK: Focus points — the three tiles rise + fade in (staggered) the first
// time the section scrolls into view. Ported from the studio's other site;
// the SVG illustrations loop on their own via CSS.
(() => {
  const focusSection = document.getElementById('focusPoints');
  if (!focusSection) return;
  const tiles = focusSection.querySelectorAll('.focusPoint_tile');
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tiles.forEach((tile) => tile.classList.add('animate'));
        obs.disconnect(); // reveal once, then stop observing
      });
    },
    { threshold: 0.2 }
  );
  observer.observe(focusSection);
})();

// MARK: Credentials — the block fades up once when it comes into view.
(() => {
  const list = document.querySelector('.creds');
  if (!list) return;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        list.classList.add('animate');
        obs.disconnect(); // reveal once, then stop observing
      });
    },
    { threshold: 0.15 }
  );
  observer.observe(list);
})();

const servicesSection = document.querySelector('.services');
const dialWheel = document.querySelector('.dial-wheel');
const dialNums = gsap.utils.toArray('.dial-num');
const services = gsap.utils.toArray('.service');

const SERVICE_COUNT = services.length;   // 3
const STEP_ANGLE = 28;                   // deg the dial turns per service (must match --step-angle in CSS)
const LAST = SERVICE_COUNT - 1;          // number of transitions (2)
const SPREAD = 135;                      // % of viewport between services (>100 leaves an empty gap)
const MAX_BLUR = 14;                     // px of blur at the extremes; 0 at centre
const SCROLL_PER = 1.4;                  // viewport-heights of scroll per transition

const setActiveDial = (idx) => {
  dialNums.forEach((num, i) => num.classList.toggle('is-active', i === idx));
};

// Blur + fade each card by how far it sits from the centre, so a service is
// sharp when centred and softens as it slides away / rises in from below.
const applyDepth = () => {
  services.forEach((service) => {
    const dist = Math.min(Math.abs(gsap.getProperty(service, 'yPercent')) / SPREAD, 1);
    service.style.filter = `blur(${(dist * MAX_BLUR).toFixed(2)}px)`;
    service.style.opacity = (1 - dist * 0.55).toFixed(3);
  });
};

// Starting state: service 1 centred, the rest spaced below, dial on marker 01.
services.forEach((service, i) => gsap.set(service, { yPercent: i * SPREAD }));
gsap.set(dialWheel, { rotation: 0 });
setActiveDial(0);
applyDepth();

if (servicesSection && SERVICE_COUNT > 1) {
  const carousel = gsap.timeline({
    // Driven every frame the scrub/snap moves the timeline — including the
    // settle after a snap — so the blur tracks the cards all the way to a
    // crisp centre instead of freezing mid-transition (ScrollTrigger.onUpdate
    // stops firing once the scroll itself stops, which left the blur stuck).
    onUpdate: () => {
      applyDepth();
      setActiveDial(Math.round(carousel.progress() * LAST));
    },
    scrollTrigger: {
      trigger: servicesSection,
      start: 'top top',
      // longer pin so each transition has room to breathe
      end: () => '+=' + window.innerHeight * LAST * SCROLL_PER,
      pin: true,
      scrub: 1,
      // settle on each service instead of resting mid-transition
      snap: { snapTo: 1 / LAST, duration: 0.3, ease: 'power1.inOut' },
    },
  });

  // rotate the whole dial across the section, then carousel every card upward
  carousel.to(dialWheel, { rotation: -LAST * STEP_ANGLE, ease: 'none' }, 0);
  services.forEach((service, i) => {
    carousel.to(service, { yPercent: (i - LAST) * SPREAD, ease: 'none' }, 0);
  });

  // right-side line icon morphs from one service's icon to the next, in sync
  // with the scrub — one morph per transition, spread across the timeline.
  const svcIcon = document.querySelector('#svc-icon');
  const iconIds = ['#icon-ux', '#icon-web', '#icon-photo'];
  if (svcIcon && window.MorphSVGPlugin && iconIds.length === SERVICE_COUNT) {
    const seg = carousel.duration() / LAST;
    for (let i = 0; i < LAST; i++) {
      carousel.to(svcIcon, { morphSVG: iconIds[i + 1], ease: 'none', duration: seg }, i * seg);
    }
  }
}

// MARK: Process — pinned section; the step track slides horizontally on scroll.
// Created after the services pin and before the showcase, so the pins are built
// top-to-bottom and ScrollTrigger measures each one's position correctly.
const processSection = document.querySelector('.process');
if (processSection) {
  const track = processSection.querySelector('.process__track');
  const steps = gsap.utils.toArray('.process__step');
  const dots = gsap.utils.toArray('.process__dot');
  const STEPS = steps.length;
  if (track && STEPS > 1) {
    const setActiveDot = (idx) => dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    setActiveDot(0);
    gsap.timeline({
      scrollTrigger: {
        trigger: processSection,
        start: 'top top',
        end: () => '+=' + window.innerHeight * (STEPS - 1) * 0.85,
        pin: true,
        scrub: 1,
        snap: { snapTo: 1 / (STEPS - 1), duration: 0.3, ease: 'power1.inOut' },
        onUpdate: (self) => setActiveDot(Math.round(self.progress * (STEPS - 1))),
      },
    }).to(track, { xPercent: -100 * (STEPS - 1) / STEPS, ease: 'none' });
  }
}

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

// MARK: About — the logo's wave used as a waterline over the portrait.
//
// One sine function feeds two shapes per layer: the closed path that masks the
// lit copy of the photo, and the open curve drawn on top of it. They are built
// from the same points, so the light always stops exactly at the visible wave.
// Scroll raises the level; a ticker drifts the two layers at different speeds
// and wavelengths so the crests never settle into a repeating pattern.
const aboutSection = document.querySelector('.about');
if (aboutSection) {
  const VB = 200;   // the orb's viewBox is 200 x 200
  const OVER = 40;  // draw past both edges so the ends are never visible
  // the waterline and the ink fill run on one scroll window, so the portrait
  // finishes lighting up at the same moment the last line of copy inks in
  const aboutBody = aboutSection.querySelector('.about__body');
  const READ_START = 'top 80%';
  const READ_END = 'bottom 55%';
  const layers = [
    {
      fill: aboutSection.querySelector('.about__wave--back'),
      crest: aboutSection.querySelector('.about__crest--back'),
      amp: 7, wavelength: 118, speed: 22, phase: 0,
    },
    {
      fill: aboutSection.querySelector('.about__wave--front'),
      crest: aboutSection.querySelector('.about__crest--front'),
      amp: 4.5, wavelength: 84, speed: -34, phase: 40,
    },
  ];

  if (layers.every((l) => l.fill && l.crest)) {
    // starts below the orb (empty) and ends above it (fully lit)
    const level = { y: VB + 14 };

    const draw = () => {
      layers.forEach((l) => {
        let d = '';
        for (let x = -OVER; x <= VB + OVER; x += 4) {
          const y = level.y + l.amp * Math.sin(((x + l.phase) / l.wavelength) * Math.PI * 2);
          d += `${x === -OVER ? 'M' : 'L'}${x},${y.toFixed(2)} `;
        }
        l.crest.setAttribute('d', d);
        // same curve, closed off below the orb so the mask fills everything
        // under the waterline
        l.fill.setAttribute('d', `${d}L${VB + OVER},${VB + OVER} L${-OVER},${VB + OVER} Z`);
      });
    };

    draw();

    gsap.fromTo(
      level,
      { y: VB + 14 },
      {
        // ends above the orb, so the portrait is fully lit by the time the
        // section sits in the middle of the screen
        y: -26,
        ease: 'none',
        onUpdate: draw,
        scrollTrigger: {
          trigger: aboutBody || aboutSection,
          start: READ_START,
          end: READ_END,
          scrub: 0.5,
        },
      }
    );

    // the drift only runs while the section is actually on screen
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let visible = false;
      ScrollTrigger.create({
        trigger: aboutSection,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => { visible = self.isActive; },
      });
      gsap.ticker.add((time, deltaTime) => {
        if (!visible) return;
        layers.forEach((l) => { l.phase += (l.speed * deltaTime) / 1000; });
        draw();
      });
    }
  }

  // the paragraphs ink in as you scroll past them — the same treatment the
  // service detail pages give their overview copy
  const aboutFills = gsap.utils.toArray('.about .fill-text > span');
  if (aboutFills.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const fillTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutBody || aboutSection,
        start: READ_START,
        end: READ_END,
        scrub: true,
      },
    });
    aboutFills.forEach((span) => fillTl.to(span, { backgroundSize: '200% 200%', ease: 'none' }));
  }

  // the rest of the copy rises once — the paragraphs sit this one out, the
  // ink fill above is their entrance
  gsap.from(
    aboutSection.querySelectorAll(
      '.about__eyebrow, .about__title, .about__facts, .about__next'
    ),
    {
      y: '0.2rem',
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: aboutSection, start: 'top 70%', once: true },
    }
  );

  gsap.from(aboutSection.querySelector('.about__figure'), {
    scale: 0.94,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: aboutSection, start: 'top 75%', once: true },
  });
}

// MARK: Timeline — an arrow travels a winding road past each event.
// Created after the showcase pin because it sits below it on the page, and
// ScrollTrigger has to build pinned triggers top-to-bottom.
//
// One sine function owns the geometry: the drawn curve, the arrow's position
// and angle, and every event's coordinates are all read from it, so they can
// never drift apart — including after a resize.
const tlSection = document.querySelector('.tlpath');
if (tlSection) {
  const track = tlSection.querySelector('.tlpath__track');
  const line = tlSection.querySelector('.tlpath__line');
  const trail = tlSection.querySelector('.tlpath__trail');
  const arrow = tlSection.querySelector('.tlpath__arrow');
  const head = tlSection.querySelector('.tlpath__head');
  const hint = tlSection.querySelector('.tlpath__hint');
  const events = gsap.utils.toArray('.tlev', tlSection);
  const COUNT = events.length;

  if (COUNT > 1) {
    const SCREENS = 4.1; // how long the road is, in viewport widths
    const WAVES = 2.25;  // how many crests it makes along the way

    let W = 0;
    let H = 0;
    let AMP = 0;
    let LEN = 0;

    const px = (t) => t * W;
    // the road rides below centre so cards sitting above it clear the heading
    const py = (t) => H * 0.56 + AMP * Math.sin(t * Math.PI * 2 * WAVES);
    // events sit evenly along the road; the first starts well clear of the
    // heading in the top-left corner
    const eventT = (i) => 0.12 + (i / (COUNT - 1)) * 0.78;

    const build = () => {
      W = window.innerWidth * SCREENS;
      H = tlSection.clientHeight;
      // a flatter wave leaves room for a card above and below the line
      AMP = H * 0.1;
      track.style.width = W + 'px';

      // the SVG has no viewBox, so one user unit is one CSS pixel and these
      // coordinates line up with the absolutely positioned event nodes
      const STEPS = 260;
      let d = 'M' + px(0).toFixed(1) + ' ' + py(0).toFixed(1);
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        d += ' L' + px(t).toFixed(1) + ' ' + py(t).toFixed(1);
      }
      line.setAttribute('d', d);
      trail.setAttribute('d', d);
      LEN = trail.getTotalLength();
      trail.style.strokeDasharray = LEN;

      events.forEach((el, i) => {
        const t = eventT(i);
        el.style.left = px(t) + 'px';
        el.style.top = py(t) + 'px';
      });
    };

    const render = (p) => {
      // the camera follows the arrow but never runs off either end of the road
      const vw = window.innerWidth;
      const tx = gsap.utils.clamp(-(W - vw), 0, -(px(p) - vw * 0.5));
      gsap.set(track, { x: tx });

      // the arrow points along the tangent, sampled just either side of it
      const d = 0.002;
      const t0 = Math.max(0, p - d);
      const t1 = Math.min(1, p + d);
      const angle = (Math.atan2(py(t1) - py(t0), px(t1) - px(t0)) * 180) / Math.PI;
      gsap.set(arrow, { x: px(p), y: py(p), rotation: angle });

      // the travelled part of the road draws itself in behind the arrow
      trail.style.strokeDashoffset = LEN * (1 - p);

      // The heading and the scroll hint are an intro, not part of the journey.
      // Clearing them out once you set off frees the whole width for the road,
      // which is what lets a card stay readable for far longer.
      const setOff = p > 0.05;
      if (head) head.classList.toggle('is-gone', setOff);
      if (hint) hint.classList.toggle('is-gone', setOff);

      events.forEach((el, i) => {
        el.classList.toggle('is-past', p >= eventT(i) - 0.015);
        // a card only dissolves once it is nearly off the left edge
        el.classList.toggle('is-gone', px(eventT(i)) + tx < vw * 0.1);
      });
    };

    build();
    render(0);

    ScrollTrigger.create({
      trigger: tlSection,
      start: 'top top',
      end: () => '+=' + window.innerHeight * SCREENS * 0.8,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        build();
        render(self.progress);
      },
      onUpdate: (self) => render(self.progress),
    });
  }
}

// Build the hero intro but hold it on its first frame, so the hero stays hidden
// behind the loading screen and only animates in once the loader is gone.
const heroIntro = showElements().pause(0);

document.addEventListener('DOMContentLoaded', () => {
  renderLocalTime();
  setInterval(renderLocalTime, 1000);
});

// MARK: Loading screen — shapes morph into "MISC"; when it fades out, and only
// then, the hero intro plays.
(() => {
  const loaderEl = document.getElementById('loader');
  const startHero = () => heroIntro.play();

  if (!loaderEl) {
    startHero();
    return;
  }

  document.documentElement.style.overflow = 'hidden'; // no scrolling behind it

  const loaderWave = document.getElementById('loader-wave');
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;

    if (loaderWave) {
      // wave sweeps up: covers the loader, then reveals the page beneath
      const panel = loaderWave.querySelector('.loader-wave__svg');
      gsap.set(panel, { yPercent: 100 });
      gsap.set(loaderWave, { visibility: 'visible' });
      const tl = gsap.timeline({ onComplete: () => { loaderWave.style.display = 'none'; } });
      tl.to(panel, { yPercent: -100, duration: 1.4, ease: 'power2.inOut' }, 0);
      // once the wave fully covers the screen, drop the loader behind it
      tl.add(() => {
        loaderEl.style.display = 'none';
        document.documentElement.style.overflow = '';
      }, 0.8);
      // play the hero intro as the wave starts pulling back to reveal it
      tl.add(startHero, 0.95);
    } else {
      gsap.to(loaderEl, {
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          loaderEl.style.display = 'none';
          document.documentElement.style.overflow = '';
          startHero();
        },
      });
    }
  };

  if (window.MorphSVGPlugin) {
    gsap.registerPlugin(MorphSVGPlugin);
    MorphSVGPlugin.convertToPath('#shp-m, #shp-i, #shp-s, #shp-c');
    // slow, deliberate morph
    gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1.05 }, onComplete: dismiss })
      .to('#shp-m', { morphSVG: '#ltr-m' }, 0.2)
      .to('#shp-i', { morphSVG: '#ltr-i' }, 0.65)
      .to('#shp-s', { morphSVG: '#ltr-s' }, 1.1)
      .to('#shp-c', { morphSVG: '#ltr-c' }, 1.55)
      .to({}, { duration: 1.0 }); // hold on the finished word before fading
  } else {
    // plugin failed to load — never leave the page stuck behind the loader
    gsap.delayedCall(1.4, dismiss);
  }
  // safety net in case the timeline never completes
  gsap.delayedCall(8, dismiss);
})();

// MARK: Testimonials — cards start stacked, then fan out on scroll
const tcardLeft = document.querySelector('.tcard--left');
const tcardRight = document.querySelector('.tcard--right');

if (tcardLeft && tcardRight) {
  // Only on desktop — on mobile the cards stack vertically and must not be
  // transformed. gsap.matchMedia reverts the inline transforms below the query.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 701px)', () => {
    // stacked start: both slid to the shared centre, no rotation
    gsap.set(tcardLeft, { x: '1.45rem', y: '0.1rem', rotation: 0 });
    gsap.set(tcardRight, { x: '-1.45rem', y: '0.1rem', rotation: 0 });

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: '.testimonials',
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    });
    reveal
      .to(tcardLeft, { x: '0rem', rotation: -6, duration: 0.9, ease: 'power3.out' }, 0)
      .to(tcardRight, { x: '0rem', rotation: 6, duration: 0.9, ease: 'power3.out' }, 0.08);

    // hover: straighten and lift (GSAP owns the transform, so this can't be CSS)
    const cards = [
      { el: tcardLeft, rest: -6 },
      { el: tcardRight, rest: 6 },
    ];
    const listeners = cards.map(({ el, rest }) => {
      const onEnter = () => gsap.to(el, { rotation: 0, y: '-0.2rem', duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      const onLeave = () => gsap.to(el, { rotation: rest, y: '0.1rem', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      return { el, onEnter, onLeave };
    });

    return () => {
      listeners.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  });

  // Mobile — Tinder-style swipe deck: the cards stack on top of each other;
  // drag the top one sideways past a threshold to fling it off, and it returns
  // to the back of the stack so you can keep swiping through them.
  mm.add('(max-width: 700px)', () => {
    const cards = gsap.utils.toArray('.tcard');
    const n = cards.length;
    const wrap = document.querySelector('.tcards');
    let stack = cards.slice(); // stack[0] = the top (draggable) card

    // fan each card the opposite way so the one behind peeks out
    const restRot = (i) => (i % 2 === 0 ? -1 : 1) * (4 + i * 2);
    const layout = (animate = true) => {
      stack.forEach((card, i) => {
        gsap.set(card, { zIndex: n - i });
        const props = { x: 0, y: i * 12, rotation: restRot(i), scale: 1 - i * 0.05, opacity: 1 };
        if (animate) gsap.to(card, { ...props, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
        else gsap.set(card, props);
      });
    };
    layout(false);

    let active = null;
    let dragging = false;
    let startX = 0;

    const onDown = (e) => {
      const top = stack[0];
      if (!top || !top.contains(e.target)) return;
      active = top;
      dragging = true;
      startX = e.clientX;
      gsap.killTweensOf(active);
    };
    const onMove = (e) => {
      if (!dragging || !active) return;
      const dx = e.clientX - startX;
      gsap.set(active, { x: dx, rotation: restRot(0) + dx * 0.05 });
    };
    const finish = (e) => {
      if (!dragging || !active) return;
      dragging = false;
      const card = active;
      active = null;
      const dx = (typeof e.clientX === 'number' ? e.clientX : startX) - startX;
      if (Math.abs(dx) > window.innerWidth * 0.22) {
        const dir = dx > 0 ? 1 : -1;
        gsap.to(card, {
          x: dir * window.innerWidth * 1.15,
          rotation: dir * 16,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
          onComplete: () => {
            stack.shift();
            gsap.set(card, { x: 0, rotation: 0, opacity: 0 }); // reset off-view
            stack.push(card);
            layout(); // rest slide up; the returned card fades in at the back
          },
        });
      } else {
        gsap.to(card, { x: 0, rotation: restRot(0), duration: 0.5, ease: 'power3.out' });
      }
    };

    wrap.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);

    return () => {
      wrap.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      gsap.set(cards, { clearProps: 'all' });
    };
  });
}

// MARK: Credentials — each certificate behaves like a sheet of paper held up to
// the light: the document leans toward the cursor and a specular highlight
// tracks the pointer across it. Only the scan tilts, never the caption, so the
// text stays crisp. Desktop / real-hover pointers only.
(() => {
  const grid = document.querySelector('.creds');
  if (!grid) return;

  // Hovering, focusing or clicking a row swaps which scan is on the stage.
  const rows = gsap.utils.toArray('.cred__row', grid);
  const panels = gsap.utils.toArray('.cred', grid);
  const show = (i) => {
    panels.forEach((p, n) => {
      const on = n === i;
      p.classList.toggle('is-active', on);
      // hidden panels stay out of the accessibility tree and the tab order
      p.toggleAttribute('aria-hidden', !on);
      p.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', on ? '0' : '-1'));
    });
    rows.forEach((r, n) => {
      r.classList.toggle('is-active', n === i);
      r.setAttribute('aria-pressed', String(n === i));
    });
  };
  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', () => show(i));
    row.addEventListener('focus', () => show(i));
    row.addEventListener('click', () => show(i));
  });
  show(0);

  const certMM = gsap.matchMedia();
  certMM.add('(min-width: 701px) and (hover: hover)', () => {
    const docs = gsap.utils.toArray('.cred__doc', grid);
    const MAX = 10; // max tilt in degrees

    const teardown = docs.map((doc) => {
      gsap.set(doc, { transformPerspective: 800, transformOrigin: 'center' });
      const rotX = gsap.quickTo(doc, 'rotationX', { duration: 0.5, ease: 'power3' });
      const rotY = gsap.quickTo(doc, 'rotationY', { duration: 0.5, ease: 'power3' });

      const onMove = (e) => {
        const r = doc.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0 … 1
        const py = (e.clientY - r.top) / r.height;
        rotY((px - 0.5) * MAX * 2);
        rotX(-(py - 0.5) * MAX * 2);
        // feeds the radial-gradient in the CSS, so the glare follows the cursor
        doc.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        doc.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      };
      const onEnter = () =>
        gsap.to(doc, { scale: 1.04, z: 40, duration: 0.4, ease: 'power3', overwrite: 'auto' });
      const onLeave = () => {
        rotX(0);
        rotY(0);
        gsap.to(doc, { scale: 1, z: 0, duration: 0.6, ease: 'power3', overwrite: 'auto' });
      };

      doc.addEventListener('pointermove', onMove);
      doc.addEventListener('pointerenter', onEnter);
      doc.addEventListener('pointerleave', onLeave);

      return () => {
        doc.removeEventListener('pointermove', onMove);
        doc.removeEventListener('pointerenter', onEnter);
        doc.removeEventListener('pointerleave', onLeave);
        doc.style.removeProperty('--mx');
        doc.style.removeProperty('--my');
        gsap.set(doc, { clearProps: 'all' });
      };
    });

    return () => teardown.forEach((fn) => fn());
  });
})();

// MARK: Pricing — 3D tilt on hover. The card leans toward the cursor (in real
// perspective) and lifts slightly; it eases back to flat on leave. Desktop /
// real-hover pointers only — reverted on touch by gsap.matchMedia.
(() => {
  const planMM = gsap.matchMedia();
  planMM.add('(min-width: 701px) and (hover: hover)', () => {
    const cards = gsap.utils.toArray('.plan');
    const MAX = 9; // max tilt in degrees

    const teardown = cards.map((card) => {
      gsap.set(card, { transformPerspective: 900, transformOrigin: 'center' });
      // quickTo keeps the rotation buttery under rapid pointermove events
      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });

      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * MAX * 2);
        rotX(-py * MAX * 2);
      };
      const onEnter = () =>
        gsap.to(card, { scale: 1.03, z: 30, duration: 0.4, ease: 'power3', overwrite: 'auto' });
      const onLeave = () => {
        rotX(0);
        rotY(0);
        gsap.to(card, { scale: 1, z: 0, duration: 0.6, ease: 'power3', overwrite: 'auto' });
      };

      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);

      return () => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
        gsap.set(card, { clearProps: 'all' });
      };
    });

    return () => teardown.forEach((fn) => fn());
  });
})();

// MARK: FAQ accordion — one answer open at a time
const faqItems = Array.from(document.querySelectorAll('.faq__item'));

faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq__q');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    const willOpen = !item.classList.contains('is-open');
    faqItems.forEach((other) => {
      other.classList.remove('is-open');
      const t = other.querySelector('.faq__q');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
});

// MARK: Contact — services are multi-select, but "Not sure yet" is exclusive
// (selecting it clears & locks the others; picking a real service unlocks them).
const serviceChecks = Array.from(document.querySelectorAll('.cservice input[name="service"]'));
const notSure = document.querySelector('.cservice input[value="not-sure"]');
if (serviceChecks.length && notSure) {
  const syncLock = () => {
    const locked = notSure.checked;
    serviceChecks.forEach((cb) => { if (cb !== notSure) cb.disabled = locked; });
  };
  serviceChecks.forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb === notSure && cb.checked) {
        serviceChecks.forEach((o) => { if (o !== notSure) o.checked = false; });
      } else if (cb.checked) {
        notSure.checked = false;
      }
      syncLock();
    });
  });
}

// MARK: Smooth-scroll for all on-page hash links (header + footer nav, hero
// "Get in touch"). Cross-page .html links are handled by page-transition.js.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented) return;
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
