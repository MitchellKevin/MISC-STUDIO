// ------------------------------------------------------------------
// Page transition — one accent-blue panel with a single soft curve on its
// leading edge. Clicking an internal link to another .html page brings
// the panel up from the bottom to cover the screen, then navigates; the
// arriving page lifts it away off the top. The curve only exists while
// the panel moves: it starts flat, domes in the middle, settles flat.
//
// The same curtain closes the homepage loader (nomi-studio.js uses
// window.pageCurtain). Shared by every page. Requires GSAP.
// ------------------------------------------------------------------
(function () {
  var root = document.documentElement;
  // without GSAP there is no curtain to hand over to — uncover the page now
  if (!window.gsap) { root.classList.remove('curtain-in'); return; }
  var FLAG = 'nomi-wave-enter';

  // viewBox is 100 x 100 and stretched to the screen, so these are
  // percentages. Every shape has the same commands and number count, which
  // is what lets GSAP tween the d attribute straight from one to the next.
  var COVER = [
    'M 0 100 V 100 Q 50 100 100 100 V 100 z', // flat, below the screen
    'M 0 100 V 50 Q 50 0 100 50 V 100 z',     // halfway, middle leading
    'M 0 100 V 0 Q 50 0 100 0 V 100 z'        // flat, covering everything
  ];
  var REVEAL = [
    'M 0 0 V 100 Q 50 100 100 100 V 0 z',     // covering everything
    'M 0 0 V 50 Q 50 0 100 50 V 0 z',         // halfway, middle leading
    'M 0 0 V 0 Q 50 0 100 0 V 0 z'            // gone off the top
  ];

  function getCurtain() {
    var w = document.getElementById('page-wave');
    if (!w) {
      w = document.createElement('div');
      w.id = 'page-wave';
      w.className = 'loader-wave';
      w.setAttribute('aria-hidden', 'true');
      w.innerHTML = '<svg class="loader-wave__svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path></path></svg>';
      document.body.appendChild(w);
    }
    return w;
  }

  // in: ease into the dome; out: ease out of it, so the edge never stops
  function run(shapes, duration, onDone) {
    var w = getCurtain();
    var path = w.querySelector('path');
    path.setAttribute('d', shapes[0]);
    w.style.display = '';
    gsap.set(w, { visibility: 'visible' });
    return gsap.timeline({ onComplete: onDone })
      .to(path, { attr: { d: shapes[1] }, duration: duration * 0.5, ease: 'power3.in' })
      .to(path, { attr: { d: shapes[2] }, duration: duration * 0.5, ease: 'power3.out' });
  }

  window.pageCurtain = {
    cover: function (onDone) { return run(COVER, 0.8, onDone); },
    reveal: function (onDone) {
      return run(REVEAL, 0.9, function () {
        gsap.set(getCurtain(), { visibility: 'hidden' });
        if (onDone) onDone();
      });
    }
  };

  // --- Incoming: if we arrived via a transition, lift the curtain.
  // The home page has its own MISC loader intro, so let that handle it there
  // — unless the intro already played this visit (.intro-seen).
  // reveal() puts the real curtain up fully covering before it returns, so
  // the first-paint stand-in (.curtain-in) can go without a gap between them.
  if (sessionStorage.getItem(FLAG)) {
    sessionStorage.removeItem(FLAG);
    if (!document.getElementById('loader') || root.classList.contains('intro-seen')) {
      window.pageCurtain.reveal();
    }
  }
  root.classList.remove('curtain-in');

  // --- Outgoing: cover the screen, then navigate.
  var leaving = false;
  function goWithCurtain(href) {
    if (leaving) return;
    leaving = true;
    window.pageCurtain.cover(function () {
      sessionStorage.setItem(FLAG, '1');
      window.location.href = href;
    });
  }

  // --- Back button: the browser can restore this page exactly as it was
  // left, with the curtain still covering it. Clear it and allow leaving again.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    leaving = false;
    var w = document.getElementById('page-wave');
    if (w) gsap.set(w, { visibility: 'hidden' });
  });

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || /^https?:\/\//i.test(href)) return;
    if (!/\.html(\?|#|$)/.test(href)) return; // only cross-page .html links
    e.preventDefault();
    goWithCurtain(href);
  });
})();
