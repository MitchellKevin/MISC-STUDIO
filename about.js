// ------------------------------------------------------------------
// About page. Builds every section from about-data.js, then hands the
// timeline and the project deck to the same components the homepage
// uses (timeline.js / showcase.js).
//
// Order matters at the bottom of this file: ScrollTrigger has to build
// pinned triggers top-to-bottom, and on this page the timeline sits
// ABOVE the showcase — the opposite of the homepage. So initTimeline()
// goes first here and second there.
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

  // ---- internship section is opt-in --------------------------------
  const intro = /(^|[?&])intro(=|&|$)/.test(location.search);
  document.querySelectorAll('[data-intro-only]').forEach(s => {
    if (intro) s.removeAttribute('hidden');
    else s.remove();
  });

  // ---- 3 · roadmap — homepage timeline markup ----------------------
  const road = q('[data-road]');
  if (road && D.road) {
    D.road.forEach((r, i) => {
      // events alternate above and below the road, same as the homepage
      const li = el('li', 'tlev tlev--' + (i % 2 === 0 ? 'above' : 'below'));
      li.dataset.i = i;
      const dot = el('span', 'tlev__dot'); dot.setAttribute('aria-hidden', 'true');
      const stem = el('span', 'tlev__stem'); stem.setAttribute('aria-hidden', 'true');
      const card = el('div', 'tlev__card');
      card.appendChild(el('span', 'tlev__year', r.year));
      card.appendChild(el('span', 'tlev__type', r.kind));
      card.appendChild(el('span', 'tlev__what', r.title));
      card.appendChild(el('span', 'tlev__where', r.where));
      li.appendChild(dot); li.appendChild(stem); li.appendChild(card);
      road.appendChild(li);
    });
  }

  // ---- 5 · projects — homepage showcase markup ---------------------
  const work = q('[data-work]');
  if (work && D.projects) {
    D.projects.forEach(p => {
      const a = el('a', 'work-card');
      a.href = p.link || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', p.name + ', view project');
      const img = el('img');
      img.src = p.img || '';
      img.alt = p.name;
      const meta = el('span', 'work-card__meta', p.name + ' ');
      meta.appendChild(el('span', 'showcase__arrow', '↗'));
      a.appendChild(img); a.appendChild(meta);
      work.appendChild(a);
    });
    const total = q('#work-total');
    if (total) total.textContent = String(D.projects.length).padStart(2, '0');
  }

  // ---- 4 · the IT → CMD switch -------------------------------------
  const panels = D.switchPanels || {};
  ['it', 'cmd'].forEach(side => {
    const host = q('[data-panel="' + side + '"]');
    const c = panels[side];
    if (!host || !c) return;
    host.appendChild(el('h2', 'abs__heading', c.heading));
    const p = el('p', 'abs__body', c.body);
    if (c.todo) p.appendChild(el('em', 'ab__todo', c.todo));
    host.appendChild(p);
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

  // ---- 6 · goals ---------------------------------------------------
  const goals = q('[data-goals]');
  if (goals && D.goals) {
    D.goals.forEach((g, i) => {
      const li = el('li', 'ab__goal');
      li.appendChild(el('span', 'ab__goal-num', String(i + 1).padStart(2, '0')));
      const b = el('div');
      b.appendChild(el('h3', 'ab__goal-title', g.title));
      b.appendChild(el('p', 'ab__goal-body', g.body));
      li.appendChild(b);
      goals.appendChild(li);
    });
  }

  // ---- 7 · hobbies — homepage focus tiles --------------------------
  // Same viewBox and stroke weights as the focus illustrations, so these
  // sit next to them without looking like a different set.
  const ART = {
    sport: `<svg class="focus-illustration" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <g fill="none" stroke="#9a9a9a" stroke-width="1.8" stroke-linecap="round">
          <path d="M92 22h16"/><path d="M100 22v8"/>
          <circle cx="100" cy="72" r="34"/>
        </g>
        <circle cx="100" cy="72" r="30" fill="#9a9a9a" fill-opacity="0.05"/>
        <g stroke="#7a7a7a" stroke-width="1.3" stroke-linecap="round">
          <path d="M100 44v5"/><path d="M128 72h-5"/><path d="M100 100v-5"/><path d="M72 72h5"/>
        </g>
        <line class="sw-hand" x1="100" y1="72" x2="100" y2="48"
              stroke="#e8e8e8" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="100" cy="72" r="3" fill="#c8c8c8"/>
      </svg>`,
    photo: `<svg class="focus-illustration" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <circle cx="100" cy="65" r="36" fill="none" stroke="#9a9a9a" stroke-width="1.8"/>
        <g class="iris" stroke="#7a7a7a" stroke-width="1.4" fill="#9a9a9a" fill-opacity="0.07">
          <path d="M100 33 L128 49 L114 57 L86 57 Z"/>
          <path d="M128 49 L128 81 L114 73 L114 57 Z"/>
          <path d="M128 81 L100 97 L100 81 L114 73 Z"/>
          <path d="M100 97 L72 81 L86 73 L100 81 Z"/>
          <path d="M72 81 L72 49 L86 57 L86 73 Z"/>
          <path d="M72 49 L100 33 L100 49 L86 57 Z"/>
        </g>
        <circle class="iris-core" cx="100" cy="65" r="9" fill="#e8e8e8" fill-opacity="0.85"/>
      </svg>`,
    web: `<svg class="focus-illustration" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <rect x="44" y="26" width="112" height="78" rx="7" fill="#9a9a9a" fill-opacity="0.05"
              stroke="#9a9a9a" stroke-width="1.8"/>
        <path d="M44 44 H156" stroke="#9a9a9a" stroke-width="1.4"/>
        <g fill="#7a7a7a"><circle cx="54" cy="35" r="2.6"/><circle cx="63" cy="35" r="2.6"/><circle cx="72" cy="35" r="2.6"/></g>
        <g stroke="#c8c8c8" stroke-width="3.4" stroke-linecap="round">
          <line class="wl wl1" x1="58" y1="58" x2="104" y2="58"/>
          <line class="wl wl2" x1="58" y1="70" x2="128" y2="70"/>
          <line class="wl wl3" x1="58" y1="82" x2="92"  y2="82"/>
        </g>
        <g fill="none" stroke="#e8e8e8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M124 86 l8 6 -8 6"/><path d="M138 98 h8"/>
        </g>
      </svg>`
  };

  const hobby = q('[data-hobby]');
  if (hobby && D.hobbies) {
    D.hobbies.forEach(h => {
      const tile = el('div', 'focusPoint_tile focus-' + h.art);
      const art = el('div', 'focus-art');
      art.setAttribute('aria-hidden', 'true');
      art.innerHTML = ART[h.art] || '';
      tile.appendChild(art);
      tile.appendChild(el('h3', null, h.title));
      tile.appendChild(el('p', null, h.body));
      hobby.appendChild(tile);
    });
    // the homepage observer only watches #focusPoints, so this page needs
    // its own to trigger the same reveal
    const tiles = hobby.querySelectorAll('.focusPoint_tile');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        if (!entries[0].isIntersecting) return;
        tiles.forEach(t => t.classList.add('animate'));
        obs.disconnect();
      }, { threshold: 0.2 });
      io.observe(hobby);
    } else {
      tiles.forEach(t => t.classList.add('animate'));
    }
  }

  // ---- 8 · watches — one stage, a menu picks which watch -----------
  // Scroll drives a zoom towards the date. Everything smears with speed
  // except the date itself, which a radial mask keeps sharp; at the end the
  // date rolls over a day. One photo per watch is all that is needed — the
  // new digits are drawn on top.
  const watchHost = q('[data-watch]');
  let watchApi = null;
  if (watchHost && D.watches && D.watches.length) {
    const frame = el('div', 'wz__frame');
    const plate = el('div', 'wz__plate');
    const blur  = el('img', 'wz__photo wz__photo--blur');
    const sharp = el('img', 'wz__photo wz__photo--sharp');
    blur.alt = ''; sharp.alt = '';
    const win  = el('div', 'wz__date');
    // the power-reserve overlay: one wedge that erases the real hand, and a
    // drawn hand that sweeps over the sub-dial
    const NS = 'http://www.w3.org/2000/svg';
    const hand = document.createElementNS(NS, 'svg');
    hand.setAttribute('class', 'wz__hand');
    hand.setAttribute('aria-hidden', 'true');
    const hErase = document.createElementNS(NS, 'path');
    const hGroup = document.createElementNS(NS, 'g');
    const hNeedle = document.createElementNS(NS, 'path');
    const hTip = document.createElementNS(NS, 'path');
    hGroup.appendChild(hNeedle); hGroup.appendChild(hTip);
    hand.appendChild(hErase); hand.appendChild(hGroup);
    const roll = el('div', 'wz__roll');
    const cellA = el('span'), cellB = el('span');
    const digA = el('i'), digB = el('i');
    cellA.appendChild(digA); cellB.appendChild(digB);
    roll.appendChild(cellA); roll.appendChild(cellB);
    win.appendChild(roll);
    plate.appendChild(blur); plate.appendChild(sharp); plate.appendChild(win); plate.appendChild(hand);
    frame.appendChild(plate);

    const cap = el('div', 'wz__cap');
    const capName = el('h3', 'wz__name');
    const capNote = el('p', 'wz__note');
    cap.appendChild(capName); cap.appendChild(capNote);

    const menu = el('nav', 'wz-menu');
    menu.setAttribute('aria-label', 'Pick a watch');

    watchHost.className = 'wz';
    watchHost.appendChild(frame);
    watchHost.appendChild(cap);
    watchHost.appendChild(menu);

    let cur = 0;
    const show = (i) => {
      const w = D.watches[i] || {};
      const d = w.date || {};
      cur = i;
      capName.textContent = w.name || '';
      capNote.textContent = w.note || '';

      if (w.photo) {
        blur.src = w.photo; sharp.src = w.photo;
        plate.classList.remove('is-empty');
        // both layers are absolutely positioned, so the plate has no size of
        // its own — it has to take the photo's aspect ratio, and everything
        // placed inside in % depends on that being right
        const fit = () => {
          if (sharp.naturalWidth) {
            plate.style.aspectRatio = sharp.naturalWidth + ' / ' + sharp.naturalHeight;
          }
        };
        sharp.complete ? fit() : sharp.addEventListener('load', fit, { once: true });
      } else {
        blur.removeAttribute('src'); sharp.removeAttribute('src');
        plate.style.aspectRatio = '';
        plate.classList.add('is-empty');
      }

      const h = w.hand;
      // a watch declares EITHER a date to roll or a hand to sweep
      win.style.display = h ? 'none' : '';
      hand.style.display = h ? '' : 'none';
      if (h) {
        const half = 110;                            // viewBox half-size, source px
        hand.setAttribute('viewBox', (-half) + ' ' + (-half) + ' ' + (half * 2) + ' ' + (half * 2));
        hand.style.left = h.x + '%';
        hand.style.top = h.y + '%';
        hand.style.width = h.box + '%';
        const rad = a => a * Math.PI / 180;
        const arc = (a0, a1, r0, r1) => {
          const p = (a, r) => (Math.cos(rad(a)) * r).toFixed(2) + ' ' + (Math.sin(rad(a)) * r).toFixed(2);
          return 'M' + p(a0, r0) + ' L' + p(a0, r1) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + p(a1, r1) +
                 ' L' + p(a1, r0) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + p(a0, r0) + ' Z';
        };
        hErase.setAttribute('d', arc(h.hide - h.hideSpread, h.hide + h.hideSpread, h.hub, h.reach));
        hErase.setAttribute('fill', h.dial || '#f4f3f0');
        // drawn pointing along +x; the group's rotation sets the reading
        hNeedle.setAttribute('d', 'M0 -2.6 L' + (h.len - 16) + ' -1.6 L' + (h.len - 16) + ' 1.6 L0 2.6 Z');
        hNeedle.setAttribute('fill', h.ink || '#141414');
        hTip.setAttribute('d', 'M' + (h.len - 17) + ' -3.4 L' + h.len + ' 0 L' + (h.len - 17) + ' 3.4 Z');
        hTip.setAttribute('fill', h.lume || '#e9d9ae');
        hTip.setAttribute('stroke', h.ink || '#141414');
        hTip.setAttribute('stroke-width', '1.2');
      }

      const dx = h ? h.x : (d.x == null ? 50 : d.x), dy = h ? h.y : (d.y == null ? 50 : d.y);
      const dw = d.w || 5, dh = d.h || 5;
      // the zoom pivots on the plate, not the frame, so the date stays put
      // however the plate is placed in the viewport
      plate.style.transformOrigin = dx + '% ' + dy + '%';
      plate.style.setProperty('--fx', dx + '%');
      plate.style.setProperty('--fy', dy + '%');

      win.style.left = dx + '%'; win.style.top = dy + '%';
      win.style.width = dw + '%'; win.style.height = dh + '%';
      win.style.borderRadius = (d.radius || 8) + '%';
      win.style.background = d.bg || '#111';
      win.style.color = d.ink || '#eee';
      digA.textContent = String(d.from == null ? '' : d.from);
      digB.textContent = String(d.to == null ? '' : d.to);
      // watch dial digits are far narrower than any web font; squeezing
      // Poppins sideways gets close enough not to jar at full zoom
      const c = d.condense ? 'scaleX(' + d.condense + ')' : '';
      digA.style.transform = c; digB.style.transform = c;

      [].slice.call(menu.children).forEach((b, j) => {
        b.classList.toggle('is-on', j === i);
        b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      if (watchApi) watchApi.apply();
    };

    D.watches.forEach((w, i) => {
      const b = el('button', 'wz-menu__item', w.name || ('Watch ' + (i + 1)));
      b.type = 'button';
      b.addEventListener('click', () => show(i));
      menu.appendChild(b);
    });
    show(0);

    watchApi = {
      stage: watchHost, plate: plate, blur: blur, roll: roll, cap: cap, hand: hGroup,
      progress: 0,
      zoom: () => (D.watches[cur] || {}).zoom || 6,
      apply() {
        const p = this.progress;
        const scale = 1 + (this.zoom() - 1) * p;
        this.plate.style.transform = 'scale(' + scale + ')';
        // the CSS blur is rasterised before the ancestor scale multiplies it,
        // so a small value here becomes a big smear on screen
        this.blur.style.filter = 'blur(' + (p * p * 1.6) + 'px)';
        // shrink the sharp window as the plate grows, so the area that stays
        // in focus keeps roughly the same size on screen
        this.plate.style.setProperty('--fr', (11 / scale) + '%');
        this.cap.style.opacity = p < 0.22 ? String(1 - p / 0.22) : '0';
        const t = p < 0.72 ? 0 : Math.min(1, (p - 0.72) / 0.12);
        this.roll.style.transform = 'translateY(' + (-50 * t) + '%)';
        // the power reserve winds up over a longer stretch than the date
        // flips — it is a fill, not a snap
        const hw = (D.watches[cur] || {}).hand;
        if (hw && this.hand) {
          const u = p < 0.35 ? 0 : Math.min(1, (p - 0.35) / 0.5);
          const eased = u * u * (3 - 2 * u);
          this.hand.setAttribute('transform',
            'rotate(' + (hw.from + (hw.to - hw.from) * eased).toFixed(2) + ')');
        }
      }
    };
    watchApi.apply();
  }

  function initWatchZoom() {
    if (!window.ScrollTrigger || !watchApi) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      watchApi.progress = 1; watchApi.apply();
      return;
    }
    ScrollTrigger.create({
      trigger: watchApi.stage,
      start: 'top top',
      end: '+=' + window.innerHeight * 1.8,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => { watchApi.progress = self.progress; watchApi.apply(); }
    });
  }

  // ---- 2 + 9 · the globes ------------------------------------------
  const HOOFDDORP = { lon: 4.69, lat: 52.30 };
  if (window.DotGlobe && window.GLOBE_DATA) {
    window.ABOUT_COUNTRY_NAMES = window.GLOBE_DATA.countries;   // for typo hunting

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

    const world = q('[data-globe="visited"]');
    if (world) {
      const g = window.DotGlobe.create(world, { lon: 10, lat: 25, fill: 0.4 });
      if (g) {
        const missing = g.setVisited(D.visited);
        if (missing.length) {
          console.warn('[about] not in the dataset, so not lit up:', missing,
            '\nRun window.ABOUT_COUNTRY_NAMES for the full list of valid names.');
        }
        const n = q('[data-visited-count]');
        if (n) n.textContent = (D.visited || []).length - missing.length;
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

  // ---- countries list ----------------------------------------------
  const list = q('[data-countries]');
  if (list && D.visited) {
    D.visited.slice().sort().forEach(c => list.appendChild(el('li', 'ab__country', c)));
  }

  // ---- hand the built markup to the shared components ---------------
  // Pinned triggers have to be created top-to-bottom, so this follows the
  // page's own order: timeline, then showcase, then the watch stages.
  if (window.initTimeline) window.initTimeline();
  if (window.initShowcase) window.initShowcase();
  initWatchZoom();

  // project thumbnails settle after layout; without this the pins measure
  // against the wrong page height
  window.addEventListener('load', () => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
