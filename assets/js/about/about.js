// ------------------------------------------------------------------
// About page. Builds every section from about-data.js: the timeline
// rows, the switch panels, the hobby cards and the goals.
//
// The page's structure lives in the markup; this file only fills it:
//   · chapter numbers, counted off the sections that survive
//   · the section index rail down the right-hand side
//   · every section's copy, straight out of about-data.js
// ------------------------------------------------------------------
(function () {
  const D = window.ABOUT || {};
  const q = sel => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // ---- copy that is still a placeholder ----------------------------
  // Anything in about-data.js that still starts with TODO or "Vul aan"
  // is rendered as a note rather than as body copy, so an unfinished
  // line looks the same wherever it lands and cannot ship unnoticed.
  const PLACEHOLDER = /^\s*(TODO|Vul aan)\b/i;
  // `value` is either a finished line, a placeholder, or { body, todo } —
  // a finished line that still has a question hanging off it.
  function copy(node, value) {
    if (!node) return node;
    node.textContent = '';
    const v = typeof value === 'string' || value == null ? { body: value } : value;
    const body = (v.body || '').trim();
    const todo = (v.todo || '').trim();
    if (body) {
      if (PLACEHOLDER.test(body)) node.appendChild(el('em', 'ab__todo', body));
      else node.appendChild(document.createTextNode(body));
    }
    if (todo) node.appendChild(el('em', 'ab__todo', todo));
    return node;
  }

  // ---- internship section is opt-in --------------------------------
  const intro = /(^|[?&])intro(=|&|$)/.test(location.search);
  document.querySelectorAll('[data-intro-only]').forEach(s => {
    if (intro) s.removeAttribute('hidden');
    else s.remove();
  });

  // ---- chapter numbers ---------------------------------------------
  // Counted after the line above, so dropping the internship section
  // renumbers the rest rather than leaving a hole.
  document.querySelectorAll('[data-num]').forEach((n, i) => {
    n.textContent = String(i + 1).padStart(2, '0');
  });

  // ---- section index -----------------------------------------------
  const nav = q('[data-abnav]');
  const sections = [...document.querySelectorAll('[data-chapter]')];
  if (nav && sections.length) {
    sections.forEach((sec, i) => {
      if (!sec.id) sec.id = 'ab-section-' + i;
      const a = el('a', 'abnav__link');
      a.href = '#' + sec.id;
      a.appendChild(el('span', 'abnav__label', sec.dataset.label || sec.id));
      a.appendChild(el('span', 'abnav__tick'));
      const li = el('li');
      li.appendChild(a);
      nav.appendChild(li);
      sec._navLink = a;
    });
    // the section covering the middle of the screen is the one you are on;
    // a plain "is it visible" test lights two up at once on the tall ones
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            sections.forEach(s => s._navLink.classList.toggle('is-on', s === e.target));
          }
        });
      }, { rootMargin: '-50% 0px -50% 0px' });
      sections.forEach(s => io.observe(s));
    }
  }

  // ---- section copy -------------------------------------------------
  document.querySelectorAll('[data-copy]').forEach(node => {
    copy(node, (D.copy || {})[node.dataset.copy]);
  });

  // ---- roadmap — numbered rows ---------------------------------------
  // One row per stop: number, year, what, where, and the kind of stop as a
  // pill. Rows fade up as they scroll in (data-reveal, handled by site.js).
  const road = q('[data-road]');
  if (road && D.road) {
    D.road.forEach((r, i) => {
      const li = el('li', 'road__row');
      li.setAttribute('data-reveal', '');
      li.style.setProperty('--d', String(i % 3));
      li.appendChild(el('span', 'road__num', String(i + 1).padStart(2, '0')));
      li.appendChild(el('span', 'road__year', r.year));
      const what = el('span', 'road__what');
      what.appendChild(el('span', 'road__title', r.title));
      what.appendChild(el('span', 'road__where', r.where));
      li.appendChild(what);
      li.appendChild(el('span', 'road__kind pill', (r.kind || '').trim()));
      road.appendChild(li);
    });
  }

  // ---- projects — homepage showcase markup -------------------------
  const work = q('[data-work]');
  if (work && D.projects) {
    D.projects.forEach(p => {
      const a = el('a', 'work-card');
      a.href = p.link || '#';
      // case studies open in place; anything off-site still gets a new tab
      const external = /^https?:\/\//.test(a.getAttribute('href'));
      if (external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.setAttribute('aria-label', p.name + (external ? ', view project' : ', view case study'));
      const img = el('img');
      img.src = p.img || '';
      img.alt = p.name;
      const meta = el('span', 'work-card__meta', p.name + ' ');
      // an off-site ↗ already points where the hover turns the → to
      meta.appendChild(el('span', external ? 'showcase__arrow showcase__arrow--out' : 'showcase__arrow', external ? '↗' : '→'));
      a.appendChild(img); a.appendChild(meta);
      work.appendChild(a);
    });
    const total = q('#work-total');
    if (total) total.textContent = String(D.projects.length).padStart(2, '0');
  }

  // ---- the IT → CMD switch -----------------------------------------
  const panels = D.switchPanels || {};
  ['it', 'cmd'].forEach(side => {
    const host = q('[data-panel="' + side + '"]');
    const c = panels[side];
    if (!host || !c) return;
    host.appendChild(el('h3', 'abs__heading t-narrative', c.heading));
    host.appendChild(copy(el('p', 'abs__body'), c));
  });

  const toggle = q('.abs__toggle');
  if (toggle) {
    const set = on => {
      toggle.setAttribute('aria-checked', on ? 'true' : 'false');
      document.querySelectorAll('[data-side]').forEach(n => {
        n.classList.toggle('is-on', (n.dataset.side === 'cmd') === on);
      });
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-checked') !== 'true'));
    set(false);
  }

  // ---- internship goals --------------------------------------------
  const goals = q('[data-goals]');
  if (goals && D.goals) {
    D.goals.forEach((g, i) => {
      const li = el('li', 'ab__goal');
      li.setAttribute('data-reveal', '');
      li.appendChild(el('span', 'ab__goal-num', String(i + 1).padStart(2, '0')));
      const b = el('div');
      b.appendChild(el('h3', 'ab__goal-title', g.title));
      b.appendChild(copy(el('p', 'ab__goal-body'), g.body));
      li.appendChild(b);
      goals.appendChild(li);
    });
  }

  // ---- hobbies — homepage focus tiles ------------------------------
  // Same viewBox and stroke weights as the focus illustrations, so these
  // sit next to them without looking like a different set.
  // Drawn in currentColor, so each card sets the ink (see .hobby__art in
  // about.css) and the set follows whatever surface it sits on.
  const ART = {
    sport: `<svg class="focus-illustration" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <g fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.8" stroke-linecap="round">
          <path d="M92 22h16"/><path d="M100 22v8"/>
          <circle cx="100" cy="72" r="34"/>
        </g>
        <circle cx="100" cy="72" r="30" fill="currentColor" fill-opacity="0.06"/>
        <g stroke="currentColor" stroke-opacity="0.4" stroke-width="1.3" stroke-linecap="round">
          <path d="M100 44v5"/><path d="M128 72h-5"/><path d="M100 100v-5"/><path d="M72 72h5"/>
        </g>
        <line class="sw-hand" x1="100" y1="72" x2="100" y2="48"
              stroke="var(--brand-accent)" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="100" cy="72" r="3" fill="var(--brand-accent)"/>
      </svg>`,
    photo: `<svg class="focus-illustration" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <circle cx="100" cy="65" r="36" fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.8"/>
        <g class="iris" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4" fill="currentColor" fill-opacity="0.06">
          <path d="M100 33 L128 49 L114 57 L86 57 Z"/>
          <path d="M128 49 L128 81 L114 73 L114 57 Z"/>
          <path d="M128 81 L100 97 L100 81 L114 73 Z"/>
          <path d="M100 97 L72 81 L86 73 L100 81 Z"/>
          <path d="M72 81 L72 49 L86 57 L86 73 Z"/>
          <path d="M72 49 L100 33 L100 49 L86 57 Z"/>
        </g>
        <circle class="iris-core" cx="100" cy="65" r="9" fill="var(--brand-accent)"/>
      </svg>`,
    web: `<svg class="focus-illustration" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <rect x="44" y="26" width="112" height="78" rx="7" fill="currentColor" fill-opacity="0.05"
              stroke="currentColor" stroke-opacity="0.55" stroke-width="1.8"/>
        <path d="M44 44 H156" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4"/>
        <g fill="currentColor" fill-opacity="0.4"><circle cx="54" cy="35" r="2.6"/><circle cx="63" cy="35" r="2.6"/><circle cx="72" cy="35" r="2.6"/></g>
        <g stroke="currentColor" stroke-opacity="0.7" stroke-width="3.4" stroke-linecap="round">
          <line class="wl wl1" x1="58" y1="58" x2="104" y2="58"/>
          <line class="wl wl2" x1="58" y1="70" x2="128" y2="70"/>
          <line class="wl wl3" x1="58" y1="82" x2="92"  y2="82"/>
        </g>
        <g fill="none" stroke="var(--brand-accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M124 86 l8 6 -8 6"/><path d="M138 98 h8"/>
        </g>
      </svg>`
  };


  const hobby = q('[data-hobby]');
  if (hobby && D.hobbies) {
    D.hobbies.forEach((h, i) => {
      // focusPoint_tile / focus-<art> stay on as hooks for about-camera.js
      const tile = el('article', 'card hobby focusPoint_tile focus-' + h.art);
      tile.setAttribute('data-reveal', '');
      tile.style.setProperty('--d', String(i));
      tile.appendChild(el('span', 'card__num', String(i + 1).padStart(2, '0')));
      const art = el('div', 'hobby__art focus-art');
      art.setAttribute('aria-hidden', 'true');
      art.innerHTML = ART[h.art] || '';
      tile.appendChild(art);
      tile.appendChild(el('h3', 't-title', h.title));
      tile.appendChild(copy(el('p', null), h.body));
      hobby.appendChild(tile);
    });
  }

  // ---- the home globe -----------------------------------------------
  const HOOFDDORP = { lon: 4.69, lat: 52.30 };
  if (window.DotGlobe && window.GLOBE_DATA) {
    const home = q('[data-globe="home"]');
    if (home) {
      // starts on the far side, then swings round, so arriving reads as a
      // journey rather than a jump
      const g = window.DotGlobe.create(home, {
        lon: HOOFDDORP.lon + 170, lat: -12, marker: HOOFDDORP, fill: 0.4
      });
      if (g) {
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (still) {
          g.stopSpin(); g.rotation.lon = HOOFDDORP.lon; g.rotation.lat = HOOFDDORP.lat; g.redraw();
        } else {
          onceInView(home, () => {
            g.stopSpin();
            if (!window.gsap) { g.rotation.lon = HOOFDDORP.lon; g.rotation.lat = HOOFDDORP.lat; g.redraw(); return; }
            gsap.to(g.rotation, {
              lon: HOOFDDORP.lon, lat: HOOFDDORP.lat,
              duration: 2.6, ease: 'power3.inOut', onUpdate: g.redraw
            });
          });
        }
      }
    }
  }

  function onceInView(node, fn) {
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: 0.5 });
    io.observe(node);
  }

  // ---- pins measure the page once everything has settled -------------
  // the AirPods pin is the only one left on this page; images settling
  // after layout would otherwise leave it measuring the wrong height
  window.addEventListener('load', () => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
