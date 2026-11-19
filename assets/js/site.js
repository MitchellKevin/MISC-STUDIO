// ------------------------------------------------------------------
// site.js — the behaviour every page shares in the redesign.
// No dependencies; each block bails out quietly when its markup is not
// on the page, so the same file runs everywhere.
// ------------------------------------------------------------------
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // MARK: Menu — a native <dialog>, so focus trapping, Esc and the top
  // layer come for free. Clicking the dimmed area or a link closes it.
  const menu = document.querySelector('[data-menu]');
  const openers = document.querySelectorAll('[data-menu-open]');
  if (menu && menu.showModal) {
    const setExpanded = (v) => openers.forEach((b) => b.setAttribute('aria-expanded', String(v)));
    openers.forEach((btn) => btn.addEventListener('click', () => {
      menu.showModal();
      setExpanded(true);
    }));
    menu.addEventListener('close', () => setExpanded(false));
    menu.addEventListener('click', (e) => {
      if (e.target === menu || e.target.closest('[data-menu-close]') || e.target.closest('a')) menu.close();
    });
  }

  // MARK: Local time in the hero and footer ("14:05 in Amsterdam")
  const clocks = document.querySelectorAll('[data-local-time]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' });
    const tick = () => clocks.forEach((el) => { el.textContent = fmt.format(new Date()); });
    tick();
    setInterval(tick, 15000);
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // MARK: Reveal on scroll — elements fade up once, the first time they
  // come into view. Without IntersectionObserver everything just shows.
  const revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (!('IntersectionObserver' in window) || reduced) {
      revealables.forEach((el) => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
      revealables.forEach((el) => io.observe(el));
    }
  }

  // MARK: Process rail — fills as the steps scroll through the middle of
  // the screen, and lights each step's dot once the line has passed it.
  const process = document.querySelector('[data-process]');
  if (process) {
    const steps = Array.from(process.querySelectorAll('.step'));
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = process.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top of the row reaches 85% down the screen, 1 when its
      // bottom reaches 45% — the whole sweep happens while it is readable
      const start = vh * 0.85;
      const end = vh * 0.45;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      process.style.setProperty('--progress', p.toFixed(3));
      steps.forEach((step, i) => step.classList.toggle('is-passed', p >= (i + 0.5) / steps.length));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // MARK: Contact — services are multi-select, but "Not sure yet" is
  // exclusive: ticking it clears and locks the others.
  const serviceChecks = Array.from(document.querySelectorAll('.cservice input[name="service"]'));
  const notSure = document.querySelector('.cservice input[value="not-sure"]');
  if (serviceChecks.length && notSure) {
    const syncLock = () => {
      serviceChecks.forEach((cb) => { if (cb !== notSure) cb.disabled = notSure.checked; });
    };
    serviceChecks.forEach((cb) => cb.addEventListener('change', () => {
      if (cb === notSure && cb.checked) serviceChecks.forEach((o) => { if (o !== notSure) o.checked = false; });
      else if (cb.checked) notSure.checked = false;
      syncLock();
    }));
  }

  // MARK: Work orbit — claim the pinned section's full height right away
  // (work-orbit.js, a module, may still be downloading three.js), so the
  // page below it never shifts and menu links / #hash jumps land right.
  const orbit = document.querySelector('[data-orbit]');
  if (orbit && !reduced) {
    try {
      const c = document.createElement('canvas');
      if (c.getContext('webgl2') || c.getContext('webgl')) orbit.classList.add('is-orbit');
    } catch (e) { /* no WebGL: the plain grid stays */ }
  }

  // MARK: Intro — html[data-intro] was set before first paint (first visit
  // only). "loading" while the glass loader plays; "go" once it hands over,
  // which starts the shutters and the hero. window.miscIntro resolves then.
  const root = document.documentElement;
  const introDelay = root.hasAttribute('data-intro') ? 1050 : 0;
  let introGo;
  window.miscIntro = new Promise((resolve) => { introGo = resolve; });
  const startShutters = () => {
    root.setAttribute('data-intro', 'go');
    introGo();
    setTimeout(() => {
      const intro = document.querySelector('.intro');
      if (intro) intro.remove();
    }, 2400);
  };
  const loaderEl = document.getElementById('loader');
  if (!introDelay) {
    if (loaderEl) loaderEl.remove();
    introGo();
  } else {
    try { sessionStorage.setItem('misc-intro-seen', '1'); } catch (e) {}
  }

  // MARK: Smooth scroll (Lenis). Optional: without the CDN script, or with
  // reduced motion, the page scrolls natively and everything else still works.
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.miscLenis = lenis;
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (menu) {
      menu.addEventListener('close', () => lenis.start());
      openers.forEach((b) => b.addEventListener('click', () => lenis.stop()));
    }
  }
  // MARK: Loading screen — the logo forms out of a drop of glass
  // (glass-reveal.js), then slides left while MISC / STUDIO comes out from
  // behind it, holds, and hands over to the shutters.
  if (introDelay && loaderEl) {
    if (lenis) lenis.stop();
    const stage = loaderEl.querySelector('.loader__stage');
    const lockup = loaderEl.querySelector('.loader__lockup');
    const words = loaderEl.querySelector('.loader__words');
    const ease = 'cubic-bezier(.65, 0, .35, 1)';
    let reveal = null;
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      startShutters();
      loaderEl.classList.add('is-leaving');
      setTimeout(() => {
        if (reveal) reveal.dispose();
        loaderEl.remove();
        if (lenis) lenis.start();
      }, 460);
    };
    // icon + name end up centred together, scaled down to fit a narrow screen
    const showName = () => {
      const tile = 2 * parseFloat(getComputedStyle(stage).getPropertyValue('--glass-icon-half') || '90');
      const width = tile + lockup.offsetWidth;
      const scale = Math.min(1, (window.innerWidth * 0.86) / width);
      stage.animate(
        [{ transform: 'none' }, { transform: `translateX(${(-scale * (width - tile)) / 2}px) scale(${scale})` }],
        { duration: 1100, easing: ease, fill: 'forwards' });
      words.animate(
        [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
        { duration: 1100, delay: 100, easing: ease, fill: 'forwards' });
      setTimeout(dismiss, 1200 + 1100);
    };
    if (window.playGlassReveal) {
      reveal = window.playGlassReveal(stage, {
        logo: 'assets/img/brand/logo-mark.png',
        background: '#141414',
        onDone: () => setTimeout(showName, 300),
      });
    }
    if (!reveal) {
      // no WebGL2: the plain icon, then the same slide. Its plate fills ~69%
      // of the image, which sets the words' size.
      const fallback = loaderEl.querySelector('.loader__fallback');
      if (fallback) {
        fallback.hidden = false;
        stage.style.setProperty('--glass-icon-half', fallback.getBoundingClientRect().width * 0.345 + 'px');
      }
      setTimeout(showName, 800);
    }
    setTimeout(dismiss, 10000); // safety net
  }

  // same-page anchors glide (Lenis) or smooth-scroll (native CSS)
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = url.hash === '#top' ? document.body : document.getElementById(url.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    const go = () => {
      // the menu pauses Lenis while it is open, and a paused Lenis ignores
      // scrollTo — so wake it first, or a menu link would go nowhere
      if (lenis) {
        lenis.start();
        lenis.scrollTo(target === document.body ? 0 : target, { offset: 0 });
      }
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', url.hash);
    };
    // a link inside the menu: let the dialog close (and Lenis restart) first
    if (menu && menu.open) requestAnimationFrame(go); else go();
  });

  // Arriving with a #hash from another page: once everything has loaded
  // (pinned sections have their final heights), land on it properly.
  if (location.hash && location.hash.length > 1) {
    window.addEventListener('load', () => {
      const t = document.getElementById(location.hash.slice(1));
      if (!t) return;
      setTimeout(() => {
        if (lenis) { lenis.start(); lenis.scrollTo(t, { immediate: true }); } else t.scrollIntoView();
      }, 50);
    });
  }

  // MARK: Menu highlight — one soft pill that glides to whichever link is
  // hovered or focused, instead of every link lighting up on its own
  const linkList = document.querySelector('.menu__links');
  if (linkList) {
    const hl = document.createElement('span');
    hl.className = 'menu__highlight';
    hl.setAttribute('aria-hidden', 'true');
    linkList.prepend(hl);
    const moveTo = (a) => {
      hl.style.transform = `translateY(${a.offsetTop}px)`;
      hl.style.height = `${a.offsetHeight}px`;
      hl.style.opacity = '1';
    };
    linkList.querySelectorAll('a').forEach((a) => {
      a.addEventListener('pointerenter', () => moveTo(a));
      a.addEventListener('focus', () => moveTo(a));
    });
    linkList.addEventListener('pointerleave', () => { hl.style.opacity = '0'; });
    linkList.addEventListener('focusout', (e) => { if (!linkList.contains(e.relatedTarget)) hl.style.opacity = '0'; });
  }

  // MARK: Scroll-linked effects, all driven from one rAF'd scroll handler
  const scrollers = [];
  let scrollQueued = false;
  const runScrollers = () => {
    scrollQueued = false;
    const vh = window.innerHeight;
    scrollers.forEach((fn) => fn(vh));
  };
  const queueScroll = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(runScrollers); } };

  // Wordmark turn: as the hero scrolls away, each letter of the giant
  // wordmark slides up and out while its twin rises in from below, a little
  // later per letter.
  const turnOut = document.querySelector('.wordmark__word[data-turn="out"]');
  const turnIn = document.querySelector('.wordmark__word[data-turn="in"]');
  if (turnOut && turnIn && !reduced) {
    const outs = Array.from(turnOut.children);
    const ins = Array.from(turnIn.children);
    scrollers.push((vh) => {
      const reach = vh * 1.0;          // slower: the turn runs over a full screen of scroll
      // the turn waits for a short first stretch of scroll
      const y = window.scrollY - vh * 0.1;
      outs.forEach((el, i) => {
        const start = reach * i * 0.04;
        const end = reach * (0.55 + i * 0.04);
        const t = Math.min(1, Math.max(0, (y - start) / (end - start)));
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        el.style.setProperty('--t', eased.toFixed(4));
        ins[i].style.setProperty('--t', eased.toFixed(4));
      });
    });
  }

  // Parallax: images drift a few percent against the scroll
  const parallax = Array.from(document.querySelectorAll('[data-parallax]'));
  if (parallax.length && !reduced) {
    scrollers.push((vh) => {
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        // -1 when the box enters at the bottom, 1 when it leaves at the top
        const p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        el.style.setProperty('--py', `${(p * 5).toFixed(2)}%`);
      });
    });
  }

  // Statement: words light up in reading order as the paragraph moves
  // through the screen
  document.querySelectorAll('[data-sweep]').forEach((el) => {
    const words = [];
    const wrap = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'w' + (node.classList && node.classList.contains('accent') ? ' w--accent' : '');
            w.textContent = part;
            words.push(w);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          wrap(child);
        }
      });
    };
    wrap(el);
    if (reduced) { words.forEach((w) => w.classList.add('is-lit')); return; }
    scrollers.push((vh) => {
      const r = el.getBoundingClientRect();
      const start = vh * 0.85;
      const end = vh * 0.35;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    });
  });

  if (scrollers.length) {
    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', queueScroll);
    runScrollers();
  }

  // MARK: Rolling digits — each digit becomes a reel 0–9 that spins to its
  // value the first time the number comes into view
  const tickers = document.querySelectorAll('[data-ticker]');
  if (tickers.length) {
    const build = (el) => {
      const text = el.textContent;
      el.textContent = '';
      el.classList.add('ticker');
      const src = document.createElement('span');
      src.className = 'ticker__src';
      src.textContent = text;
      const vis = document.createElement('span');
      vis.className = 'ticker__vis';
      vis.setAttribute('aria-hidden', 'true');
      let d = 0;
      for (const ch of text) {
        if (/\d/.test(ch)) {
          const col = document.createElement('span');
          col.className = 'ticker__col';
          const reel = document.createElement('span');
          reel.className = 'ticker__reel';
          // a full turn plus the value, so even a 0 visibly rolls
          const n = 10 + Number(ch);
          reel.style.setProperty('--n', n);
          reel.style.setProperty('--i', d++);
          for (let k = 0; k <= n; k++) {
            const s = document.createElement('span');
            s.textContent = k % 10;
            reel.appendChild(s);
          }
          col.appendChild(reel);
          vis.appendChild(col);
        } else {
          const s = document.createElement('span');
          s.textContent = ch;
          vis.appendChild(s);
        }
      }
      el.append(src, vis);
    };
    tickers.forEach((el) => {
      if (reduced) return;
      build(el);
      const roll = () => (el.closest('.hero') ? window.miscIntro : Promise.resolve())
        .then(() => setTimeout(() => el.classList.add('is-rolled'), el.closest('.hero') ? introDelay + 350 : 150));
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          if (!entries[0].isIntersecting) return;
          io.disconnect();
          roll();
        }, { threshold: 0.6 });
        io.observe(el);
      } else {
        roll();
      }
    });
  }

  // MARK: Mark the menu entry for the section in view
  const menuLinks = Array.from(document.querySelectorAll('.menu__links a[href^="#"]'));
  if (menuLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(menuLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    // a section counts as "here" while it crosses the middle of the screen;
    // between tracked sections (contact, footer) no entry is marked
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = byId.get(entry.target.id);
        if (link) link.classList.toggle('is-here', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // MARK: Cursor halo — the seam's dissolve (hero-particles.js), worn
  // round the pointer and dragged behind it. The pointer drops a stamp
  // every few px of travel; each stamp is a soft disc that shrinks and
  // weakens as it ages. Cells on the 4px grid take the strongest stamp
  // over them, minus a fixed per-cell threshold, so the head is dense and
  // the tail thins out into single 2px dots before it disappears. White
  // with mix-blend-mode: difference, so one canvas stays faint on every
  // surface. The loop sleeps once the last stamp has aged out.
  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;mix-blend-mode:difference';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const G = 4;          // the site's dot grid
    const R = 40;         // radius of a fresh stamp, in px
    const LIFE = 750;     // ms a stamp takes to dissolve — the trail's length
    const STEP = 6;       // px of travel between stamps
    const MAX = 90;       // stamps kept at most
    const ALPHA = 0.22;   // strength — keep it a whisper
    const rand = (x, y) => {
      const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    let dpr = 1;
    let cols = 0, rows = 0;
    let field = new Float32Array(0);   // strongest stamp per grid cell
    const touched = [];                // cells written this frame
    const stamps = [];
    let last = null;
    let running = false;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      cols = Math.ceil(window.innerWidth / G) + 1;
      rows = Math.ceil(window.innerHeight / G) + 1;
      field = new Float32Array(cols * rows);
    };
    resize();
    window.addEventListener('resize', resize);

    const frame = (now) => {
      while (stamps.length && now - stamps[0].born >= LIFE) stamps.shift();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (!stamps.length) { running = false; return; }

      // splat every stamp into the grid, keeping the max per cell
      for (const st of stamps) {
        const k = 1 - (now - st.born) / LIFE;
        const r = R * (0.3 + 0.7 * k);
        const s = k * k;
        const c0 = Math.max(0, Math.floor((st.x - r) / G));
        const c1 = Math.min(cols - 1, Math.floor((st.x + r) / G));
        const r0 = Math.max(0, Math.floor((st.y - r) / G));
        const r1 = Math.min(rows - 1, Math.floor((st.y + r) / G));
        for (let cy = r0; cy <= r1; cy++) {
          for (let cx = c0; cx <= c1; cx++) {
            const d = Math.hypot(cx * G + G / 2 - st.x, cy * G + G / 2 - st.y) / r;
            if (d >= 1) continue;
            const v = s * (1 - d);
            const i = cy * cols + cx;
            if (field[i] === 0) touched.push(i);
            if (v > field[i]) field[i] = v;
          }
        }
      }

      // same recipe as the seam: falloff minus a per-cell threshold
      ctx.globalAlpha = ALPHA;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      for (const i of touched) {
        const cx = (i % cols) * G;
        const cy = Math.floor(i / cols) * G;
        const v = field[i] * 1.35 - rand(cx, cy) * 0.6;
        field[i] = 0;
        if (v <= 0) continue;
        const s = v >= 0.7 ? 3 : 2;
        ctx.rect(cx, cy, s, s);
      }
      touched.length = 0;
      ctx.fill();
      requestAnimationFrame(frame);
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      if (!last) {
        last = { x, y };
        stamps.push({ x, y, born: now });
      } else {
        // lay stamps evenly along the path, so a fast flick stays unbroken
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const n = Math.floor(dist / STEP);
        for (let s = 1; s <= n; s++) {
          const f = (s * STEP) / dist;
          stamps.push({ x: last.x + dx * f, y: last.y + dy * f, born: now });
        }
        if (n) last = stamps[stamps.length - 1];
      }
      // a resting pointer keeps its head fresh, then lets it dissolve
      const head = stamps[stamps.length - 1];
      if (head) head.born = now;
      if (stamps.length > MAX) stamps.splice(0, stamps.length - MAX);
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { last = null; });
  }
})();
