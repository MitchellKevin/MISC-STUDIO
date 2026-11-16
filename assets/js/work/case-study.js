// ------------------------------------------------------------------
// Case study page — fills case-study.html with one project from
// case-studies.js (picked by ?project=<slug>) and runs its scroll motion.
//
//   - the project shot sits as a rounded card under the intro and grows to
//     the full width of the screen as it scrolls into view (--p, 0 → 1)
//   - a project's gallery, if it has one, drifts past at its own speeds
//   - everything else fades up through site.js: elements built here carry
//     [data-reveal], and this file runs before site.js scans for them
//
// No dependencies: one rAF-throttled scroll handler does all the motion.
// ------------------------------------------------------------------
(() => {
  const ROOT = '../../';

  // where each gallery shot starts and ends its drift, in px (repeats every 4)
  const PARALLAX = [[-60, 60], [80, -80], [-50, 70], [40, -110]];

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const studies = window.CASE_STUDIES || [];
  const current = studies.findIndex(
    (s) => s.slug === new URLSearchParams(location.search).get('project')
  );

  const asset = (path) => (/^https?:\/\//.test(path) ? path : ROOT + path);
  const pad = (n) => String(n).padStart(2, '0');

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  // mark a built element to fade up on scroll, optionally staggered
  const reveal = (node, delay) => {
    node.setAttribute('data-reveal', '');
    if (delay) node.style.setProperty('--d', delay);
    return node;
  };

  if (current === -1) {
    // unknown or missing project: back to the work list
    location.replace(ROOT + 'index.html#work');
    return;
  }

  const project = studies[current];
  render(project, studies[(current + 1) % studies.length]);
  animate();

  // MARK: Render
  function render(project, next) {
    const slot = (name) => document.querySelector(`[data-cs="${name}"]`);

    document.title = `${project.title} — Case study — MISC STUDIO`;
    slot('title').textContent = project.title;
    slot('label').textContent = project.label || 'Project';
    slot('intro').textContent = project.intro || '';

    // the shot and its blurred backdrop
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
      const item = reveal(el('article', 'cs-chapter'), i);
      item.append(
        el('span', 'cs-chapter__num', pad(i + 1)),
        el('h3', 'cs-chapter__heading t-title', chapter.heading),
        el('p', 'cs-chapter__body', chapter.body)
      );
      story.appendChild(item);
    });

    renderExtras(project, document.querySelector('[data-cs-extra]'));

    slot('next').href = `case-study.html?project=${next.slug}`;
    slot('next').setAttribute('aria-label', `Next project: ${next.title}`);
    slot('next-title').textContent = next.title;
    slot('next-label').textContent = next.label || '';
    slot('next-image').src = asset(next.image);

    const gallery = document.querySelector('[data-cs-gallery]');
    (project.gallery || []).forEach((shot) => {
      const figure = el('figure', 'cs-shot');
      const frame = el('div', 'cs-shot__frame');
      const img = el('img');
      img.src = asset(shot.src);
      img.alt = shot.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      frame.appendChild(img);
      figure.appendChild(frame);
      // no visible caption: over the pinned shot it was clutter. The text
      // stays as the image's alt for screen readers.
      gallery.appendChild(figure);
    });
    // Like the old page: the gallery moves into the hero, right after the
    // project shot, so the shot stays pinned (sticky) at full width while
    // the smaller shots scroll up over it. The empty section is dropped.
    const wrap = document.querySelector('[data-cs-gallery-wrap]');
    if (gallery.children.length) {
      const hero = document.querySelector('.cs-hero');
      hero.appendChild(gallery);
      hero.classList.add('has-drift');
    }
    if (wrap) wrap.remove();
  }

  // MARK: Extra sections
  // Optional, per project (see case-studies.js): decisions, system,
  // structure, build, figures. Each is skipped when the project lacks it.
  // Everything is built with textContent, so the copy is never parsed as HTML.
  // Sections alternate surfaces so the page keeps changing ground as you go.
  function renderExtras(project, root) {
    if (!root) return;
    const surfaces = ['paper', 'void', 'light', 'paper', 'void'];
    let count = 0;

    // a section with the usual eyebrow, plus an optional heading and lead
    const section = (name, label, head = {}) => {
      const surface = surfaces[count++ % surfaces.length];
      const wrap = el('section', `section cs-${name}`);
      wrap.dataset.surface = surface;
      if (surface === 'void') wrap.appendChild(el('div', 'grain'));
      const inner = el('div', 'shell');
      const top = el('div', 'section__head');
      const intro = el('div', 'section__intro');
      intro.appendChild(el('span', 'eyebrow', label));
      if (head.heading) intro.appendChild(reveal(el('h2', 't-narrative cs-head__title balance', head.heading)));
      top.appendChild(intro);
      if (head.body) top.appendChild(reveal(el('p', 'section__aside', head.body), 1));
      inner.appendChild(top);
      wrap.appendChild(inner);
      root.appendChild(wrap);
      return inner;
    };

    // Design decisions: text beside a screenshot, alternating sides
    if (project.decisions && project.decisions.length) {
      const inner = section('decisions', 'Design decisions');
      const list = el('div', 'cs-decisions__list');
      project.decisions.forEach((d, i) => {
        const row = el('article', `cs-decision${i % 2 ? ' cs-decision--flip' : ''}`);
        const text = reveal(el('div', 'cs-decision__text'));
        text.appendChild(el('span', 'cs-decision__label', `${pad(i + 1)} — ${d.label || 'Decision'}`));
        text.appendChild(el('h3', 'cs-decision__heading t-title balance', d.heading));
        text.appendChild(el('p', 'cs-decision__body', d.body));
        if (d.quote) {
          const q = el('blockquote', 'cs-decision__quote');
          q.appendChild(el('p', null, `“${d.quote.text}”`));
          if (d.quote.translation) q.appendChild(el('span', null, d.quote.translation));
          text.appendChild(q);
        }
        row.appendChild(text);
        if (d.image) {
          const fig = reveal(el('figure', 'cs-decision__shot'), 1);
          const img = el('img');
          img.src = asset(d.image);
          img.alt = d.alt || '';
          img.loading = 'lazy';
          img.decoding = 'async';
          fig.appendChild(img);
          row.appendChild(fig);
        }
        list.appendChild(row);
      });
      inner.appendChild(list);
    }

    // Visual system: colour swatches and typefaces
    if (project.system) {
      const s = project.system;
      const inner = section('system', 'Visual system', s);
      if (s.colors && s.colors.length) {
        const grid = el('div', 'cs-swatches');
        s.colors.forEach((c, i) => {
          const sw = reveal(el('div', 'cs-swatch'), i % 4);
          const chip = el('span', 'cs-swatch__chip');
          chip.style.background = c.hex;
          const meta = el('span', 'cs-swatch__meta');
          meta.append(el('strong', null, c.name), el('span', null, c.hex));
          sw.append(chip, meta);
          grid.appendChild(sw);
        });
        inner.appendChild(grid);
      }
      if (s.fonts && s.fonts.length) {
        const list = el('dl', 'cs-fonts');
        s.fonts.forEach((f, i) => {
          const row = reveal(el('div', 'cs-font'), i);
          row.append(el('dt', 't-title', f.name), el('dd', null, f.use));
          list.appendChild(row);
        });
        inner.appendChild(list);
      }
    }

    // Page structure: the sections of the site, in order, as numbered cards
    if (project.structure && project.structure.steps) {
      const inner = section('structure', 'Page structure', project.structure);
      const list = el('ol', 'cs-steps');
      project.structure.steps.forEach((step, i) => {
        const li = reveal(el('li', 'card cs-step'), i % 4);
        li.append(
          el('span', 'card__num', `Section ${pad(i + 1)}`),
          el('strong', 't-heading', step.title),
          el('p', null, step.text)
        );
        list.appendChild(li);
      });
      inner.appendChild(list);
    }

    // Build notes: the technical choices
    if (project.build && project.build.notes) {
      const inner = section('build', 'Build', project.build);
      const list = el('ul', 'cs-notes');
      project.build.notes.forEach((n, i) => {
        const li = reveal(el('li', 'cs-note'), i % 2);
        li.append(el('span', 'cs-note__num', pad(i + 1)), el('strong', 't-heading', n.title), el('p', null, n.text));
        list.appendChild(li);
      });
      inner.appendChild(list);
    }

    // Figures: a row of big numbers
    if (project.figures && project.figures.items) {
      const inner = section('figures', 'In numbers', project.figures);
      const row = el('div', 'cs-figures__row');
      project.figures.items.forEach((f, i) => {
        const cell = reveal(el('div', 'cs-figure'), i);
        const value = el('strong', 'cs-figure__value', f.value);
        if (f.unit) value.appendChild(el('small', null, f.unit));
        cell.append(value, el('span', 'cs-figure__label', f.label));
        row.appendChild(cell);
      });
      inner.appendChild(row);
    }
  }

  // MARK: Animate
  function animate() {
    if (prefersReduced) {
      document.querySelector('[data-cs-stage]').style.setProperty('--p', 1);
      return;
    }
    const stage = document.querySelector('[data-cs-stage]');
    const shots = Array.from(document.querySelectorAll('.cs-shot'));
    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;

      // the card is at rest while its top sits at the bottom of the screen,
      // and fills the width once its top has climbed to 15% from the top
      const r = stage.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
      stage.style.setProperty('--p', (1 - Math.pow(1 - p, 2)).toFixed(4));

      // each gallery shot drifts from `from` to `to` px while it crosses
      shots.forEach((shot, i) => {
        const b = shot.getBoundingClientRect();
        if (b.bottom < -300 || b.top > vh + 300) return;
        const t = Math.min(1, Math.max(0, (vh - b.top) / (vh + b.height)));
        const [from, to] = PARALLAX[i % PARALLAX.length];
        // over the last stretch of its crossing a shot shrinks a little and
        // fades, so it lets go of the pinned image instead of sliding off
        const out = Math.max(0, (t - 0.75) / 0.25);
        shot.firstElementChild.style.transform =
          `translate3d(0, ${(from + (to - from) * t).toFixed(1)}px, 0) scale(${(1 - out * 0.15).toFixed(3)})`;
        shot.style.opacity = (1 - out).toFixed(3);
      });
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
