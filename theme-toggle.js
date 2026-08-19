// ------------------------------------------------------------------
// Black / white switch. The split-circle button in the header flips
// data-theme on <html>; every colour in nomi-studio.css comes from a
// token, so that one attribute swaps the whole site.
//
// The wave is not a curtain. document.startViewTransition() leaves the
// outgoing theme painted on top of the incoming one, and the CSS masks
// that top layer with the logo's crest and slides it down — so the
// theme genuinely changes behind the wave as it travels.
//
// The no-flash read of localStorage lives inline in each page's <head>,
// because it has to run before first paint.
// ------------------------------------------------------------------
(function () {
  var KEY = 'misc-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function apply(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    // the particle canvas paints itself, so it has to be told
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  function label(btn, theme) {
    var next = theme === 'light' ? 'dark' : 'light';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  // the main pages hang the nav off a <ul.header-menu>, the detail pages off a
  // <nav.site-header__nav> — the button goes last in either
  function build() {
    if (document.querySelector('.theme-toggle')) return null;
    var menu = document.querySelector('.header-menu');
    var nav = menu || document.querySelector('.site-header__nav');
    if (!nav) return null;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML = '<span class="theme-toggle__disc" aria-hidden="true"></span>';

    if (menu) {
      var li = document.createElement('li');
      li.className = 'header-menu__item theme-toggle-item';
      li.appendChild(btn);
      menu.appendChild(li);
    } else {
      nav.appendChild(btn);
    }
    return btn;
  }

  function init() {
    var btn = build();
    if (!btn) return;
    label(btn, current());

    btn.addEventListener('click', function () {
      var next = current() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      label(btn, next);

      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || reduced) { apply(next); return; }

      root.classList.add('theme-sweep');
      var vt = document.startViewTransition(function () { apply(next); });
      vt.finished.then(clear, clear);
      function clear() { root.classList.remove('theme-sweep'); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
