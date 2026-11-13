// ------------------------------------------------------------------
// Case study page — fills case-study.html with one project from
// case-studies.js (picked by ?project=<slug>) and runs its scroll
// animations. Loaded after gsap + ScrollTrigger, at the end of <body>.
//
// Plain-JS take on the "SmoothScrollHero" React component (framer-motion):
//   - the project shot sits as a card under the title and grows to fill
//     the screen as you scroll, then scrolls away with the overview under it
//   - a project's gallery, if it has one, drifts past at its own speeds
//   - everything below rises in as it enters the view
// Its Lenis smooth scrolling is left out: the rest of the site scrolls
// natively, and a case study should not feel different under the wheel.
// ------------------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

const ROOT = '../../';

// where each gallery shot starts and ends its drift, in px (repeats every 4)
const PARALLAX = [[-200, 200], [200, -250], [-200, 200], [0, -500]];

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const studies = window.CASE_STUDIES || [];
const current = studies.findIndex(
  (s) => s.slug === new URLSearchParams(location.search).get('project')
);

const asset = (path) => (/^https?:\/\//.test(path) ? path : ROOT + path);

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

if (current === -1) {
  // unknown or missing project: back to the work list
  location.replace(ROOT + 'index.html#showcase');
} else {
  const project = studies[current];
  render(project, studies[(current + 1) % studies.length]);
  animate(!!(project.gallery && project.gallery.length));
}

// MARK: Render
function render(project, next) {
  const slot = (name) => document.querySelector(`[data-cs="${name}"]`);

  document.title = `${project.title} — Case study — MISC STUDIO`;
  slot('title').textContent = project.title;
  slot('label').textContent = `Case study — ${project.label || 'Project'}`;
  slot('intro').textContent = project.intro || '';

  // the hero shot and its blurred backdrop
  document.querySelectorAll('[data-cs="image"]').forEach((img) => {
    img.src = asset(project.image);
    if (!img.hasAttribute('aria-hidden')) img.alt = project.title;
  });

  const live = slot('live');
  if (project.live) live.href = project.live;
  else live.remove();

  const facts = document.querySelector('[data-cs-facts]');
  (project.facts || []).forEach((fact) => {
    const row = el('div');
    row.append(el('dt', null, fact.label), el('dd', null, fact.value));
    facts.appendChild(row);
  });

  const story = document.querySelector('[data-cs-story]');
  (project.story || []).forEach((chapter, i) => {
    const item = el('article', 'cs-chapter');
    item.append(
      el('span', 'cs-chapter__num', String(i + 1).padStart(2, '0')),
      el('h3', 'cs-chapter__heading', chapter.heading),
      el('p', 'cs-chapter__body', chapter.body)
    );
    story.appendChild(item);
  });

  renderExtras(project, document.querySelector('[data-cs-extra]'));

  slot('next').href = `case-study.html?project=${next.slug}`;
  slot('next').setAttribute('aria-label', `Next project: ${next.title}`);
  slot('next-title').textContent = next.title;
  slot('next-image').src = asset(next.image);

  const gallery = document.querySelector('[data-cs-gallery]');
  (project.gallery || []).forEach((shot) => {
    const figure = el('figure', 'cs-shot');
    const frame = el('div', 'cs-shot__frame');
    const img = el('img');
    img.src = asset(shot.src);
    img.alt = shot.alt || '';
    frame.appendChild(img);
    figure.appendChild(frame);
    gallery.appendChild(figure);
  });
  gallery.hidden = !gallery.children.length;
}

// MARK: Extra sections
// Optional, per project (see case-studies.js): decisions, system, structure,
// build, figures. Each one is skipped when the project doesn't have it.
// Everything is built with textContent, so the copy is never parsed as HTML.
function renderExtras(project, root) {
  if (!root) return;

  // a section with the usual label, plus an optional heading and lead
  const section = (name, label, head = {}) => {
    const wrap = el('section', `cs-${name}`);
    const inner = el('div', 'container');
    const top = el('div', 'cs-head cs-reveal');
    top.appendChild(el('span', 'section-label', label));
    if (head.heading) top.appendChild(el('h2', 'cs-head__title', head.heading));
    if (head.body) top.appendChild(el('p', 'cs-head__body', head.body));
    inner.appendChild(top);
    wrap.appendChild(inner);
    root.appendChild(wrap);
    return inner;
  };

  // Design decisions: text beside a screenshot, alternating sides
  if (project.decisions && project.decisions.length) {
    const inner = section('decisions', 'Design decisions');
    project.decisions.forEach((d, i) => {
      const row = el('article', `cs-decision cs-reveal${i % 2 ? ' cs-decision--flip' : ''}`);
      const text = el('div', 'cs-decision__text');
      if (d.label) text.appendChild(el('span', 'cs-decision__label', d.label));
      text.appendChild(el('h3', 'cs-decision__heading', d.heading));
      text.appendChild(el('p', 'cs-decision__body', d.body));
      if (d.quote) {
        const q = el('blockquote', 'cs-decision__quote');
        q.appendChild(el('p', null, `“${d.quote.text}”`));
        if (d.quote.translation) q.appendChild(el('span', null, d.quote.translation));
        text.appendChild(q);
      }
      row.appendChild(text);
      if (d.image) {
        const fig = el('figure', 'cs-decision__shot');
        const img = el('img');
        img.src = asset(d.image);
        img.alt = d.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        fig.appendChild(img);
        row.appendChild(fig);
      }
      inner.appendChild(row);
    });
  }

  // Visual system: colour swatches and typefaces
  if (project.system) {
    const s = project.system;
    const inner = section('system', 'Visual system', s);
    if (s.colors && s.colors.length) {
      const grid = el('div', 'cs-swatches cs-reveal');
      s.colors.forEach((c) => {
        const sw = el('div', 'cs-swatch');
        const chip = el('span', 'cs-swatch__chip');
        chip.style.background = c.hex;
        sw.append(chip, el('strong', null, c.name), el('span', null, c.hex));
        grid.appendChild(sw);
      });
      inner.appendChild(grid);
    }
    if (s.fonts && s.fonts.length) {
      const list = el('dl', 'cs-fonts cs-reveal');
      s.fonts.forEach((f) => {
        const row = el('div');
        row.append(el('dt', null, f.name), el('dd', null, f.use));
        list.appendChild(row);
      });
      inner.appendChild(list);
    }
  }

  // Page structure: the sections of the site, in order
  if (project.structure && project.structure.steps) {
    const inner = section('structure', 'Page structure', project.structure);
    const list = el('ol', 'cs-steps');
    project.structure.steps.forEach((step, i) => {
      const li = el('li', 'cs-reveal');
      li.append(
        el('span', 'cs-steps__num', String(i + 1).padStart(2, '0')),
        el('strong', null, step.title),
        el('span', 'cs-steps__text', step.text)
      );
      list.appendChild(li);
    });
    inner.appendChild(list);
  }

  // Build notes: the technical choices, two columns
  if (project.build && project.build.notes) {
    const inner = section('build', 'Build', project.build);
    const list = el('ul', 'cs-notes');
    project.build.notes.forEach((n) => {
      const li = el('li', 'cs-reveal');
      li.append(el('strong', null, n.title), el('span', null, n.text));
      list.appendChild(li);
    });
    inner.appendChild(list);
  }

  // Figures: a row of big numbers
  if (project.figures && project.figures.items) {
    const inner = section('figures', 'In numbers', project.figures);
    const row = el('div', 'cs-figures__row cs-reveal');
    project.figures.items.forEach((f) => {
      const cell = el('div');
      const value = el('strong', null, f.value);
      if (f.unit) value.appendChild(el('small', null, f.unit));
      cell.append(value, el('span', null, f.label));
      row.appendChild(cell);
    });
    inner.appendChild(row);
  }
}

// MARK: Animate
function animate(hasGallery) {
  const hero = document.querySelector('.cs-hero');
  const sticky = document.querySelector('.cs-hero__sticky');

  // px of scroll the card takes to fill the screen. Longer with a gallery,
  // so its shots have room to drift past. Without motion there is nothing
  // to scroll through, so the hero is just one screen.
  const range = prefersReduced ? 0 : hasGallery ? 1500 : 1000;
  hero.style.minHeight = `calc(${range}px + 100vh)`;

  // a tween driven straight by the page scroll between two px positions
  const scrub = (target, from, to, start, end) =>
    gsap.fromTo(target, from, { ...to, ease: 'none', scrollTrigger: { start, end, scrub: 0.4 } });

  // --- Intro: title rises in, the card follows ---
  // (the caption's children, not the caption itself, which the scroll fades)
  gsap
    .timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
    .from('.cs-hero__caption > *', { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0)
    .from('.cs-hero__frame', { y: 80, autoAlpha: 0, duration: 1.1 }, 0.15);

  if (range) {
    // --- Hero: the card grows to fill the screen, sliding over the title ---
    scrub(sticky, { '--p': 0 }, { '--p': 1 }, 0, range);
    scrub('.cs-hero__caption', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -80 }, 0, range * 0.4);
  }

  // --- Gallery parallax ---
  // Each shot moves from `from` to `to` px while it crosses the screen,
  // then shrinks and fades over the last quarter. The trigger is the
  // figure, the frame inside it is what moves, so the moving element
  // never shifts its own start and end points.
  if (hasGallery && !prefersReduced) {
    gsap.utils.toArray('.cs-shot').forEach((shot, i) => {
      const [from, to] = PARALLAX[i % PARALLAX.length];
      const offset = (n) => (n < 0 ? '-=' : '+=') + Math.abs(n);
      gsap
        .timeline({
          scrollTrigger: {
            trigger: shot,
            start: `top${offset(from)} bottom`,
            end: `bottom top${offset(-to)}`,
            scrub: true,
          },
        })
        .fromTo(shot.firstElementChild, { y: from }, { y: to, ease: 'none', duration: 1 }, 0)
        .to(shot.firstElementChild, { scale: 0.85, autoAlpha: 0, ease: 'none', duration: 0.25 }, 0.75);
    });
  }

  // --- Reveal on scroll ---
  const reveal = (target) =>
    gsap.from(target, {
      y: prefersReduced ? 0 : 40,
      autoAlpha: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: { trigger: target, start: 'top 88%' },
    });

  [
    '.cs-overview .section-label',
    '.cs-overview__title',
    ...document.querySelectorAll('.cs-meta > div'),
    '.cs-overview .btn',
    '.cs-story .section-label',
    ...document.querySelectorAll('.cs-chapter'),
    ...document.querySelectorAll('.cs-reveal'),
    '.detail-cta__inner',
    '.cs-next__card',
  ].forEach((target) => {
    if (typeof target !== 'string' || document.querySelector(target)) reveal(target);
  });
}
