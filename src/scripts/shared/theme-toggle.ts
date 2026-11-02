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
type Theme = 'light' | 'dark';

const KEY = 'misc-theme';

export function initThemeToggle(): void {
  const root = document.documentElement;

  const current = (): Theme => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  const apply = (theme: Theme) => {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    // the particle canvas paints itself, so it has to be told
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  };

  const label = (btn: HTMLButtonElement, theme: Theme) => {
    const next = theme === 'light' ? 'dark' : 'light';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  };

  // the main pages hang the nav off a <ul.header-menu>, the detail pages off a
  // <nav.site-header__nav> — the button goes last in either, except for the
  // About icon, which stays after it
  const build = (): HTMLButtonElement | null => {
    if (document.querySelector('.theme-toggle')) return null;
    const menu = document.querySelector<HTMLElement>('.header-menu');
    const nav = menu || document.querySelector<HTMLElement>('.site-header__nav');
    if (!nav) return null;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML = '<span class="theme-toggle__disc" aria-hidden="true"></span>';

    // the About icon stays at the far end, so the switch goes in before it
    if (menu) {
      const li = document.createElement('li');
      li.className = 'header-menu__item theme-toggle-item';
      li.appendChild(btn);
      menu.insertBefore(li, menu.querySelector('.header-icon-item'));
    } else {
      nav.insertBefore(btn, nav.querySelector('.header-btn'));
    }
    return btn;
  };

  const btn = build();
  if (!btn) return;
  label(btn, current());

  btn.addEventListener('click', () => {
    const next: Theme = current() === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked: the switch still works */ }
    label(btn, next);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduced) { apply(next); return; }

    const clear = () => { root.classList.remove('theme-sweep'); };
    root.classList.add('theme-sweep');
    const vt = document.startViewTransition(() => { apply(next); });
    vt.finished.then(clear, clear);
  });
}
