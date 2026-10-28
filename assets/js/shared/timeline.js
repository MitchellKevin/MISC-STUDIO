// Timeline — an arrow travels a winding road past each event.
//
// Shared by the homepage and the about page. Call initTimeline() once the
// markup is in the DOM; it no-ops when there is no .tlpath on the page.
// Pinned — same ordering caveat as initShowcase.
// Requires gsap + ScrollTrigger.
window.initTimeline = function () {
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
};
