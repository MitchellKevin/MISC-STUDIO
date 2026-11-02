// ------------------------------------------------------------------
// Page transition — one accent-blue panel with a single soft curve on its
// leading edge. Clicking an internal link to another page (a root-relative
// path like /about/, not a hash, an external URL or a file under /assets/)
// brings the panel up from the bottom to cover the screen, then navigates;
// the arriving page lifts it away off the top. The curve only exists while
// the panel moves: it starts flat, domes in the middle, settles flat.
//
// The same curtain closes the homepage loader (nomi-studio imports
// pageCurtain). Shared by every page. Imports GSAP from ./gsap.
// ------------------------------------------------------------------
import { gsap } from '@/scripts/shared/gsap';

const FLAG = 'nomi-wave-enter';

// viewBox is 100 x 100 and stretched to the screen, so these are
// percentages. Every shape has the same commands and number count, which
// is what lets GSAP tween the d attribute straight from one to the next.
const COVER: readonly [string, string, string] = [
  'M 0 100 V 100 Q 50 100 100 100 V 100 z', // flat, below the screen
  'M 0 100 V 50 Q 50 0 100 50 V 100 z',     // halfway, middle leading
  'M 0 100 V 0 Q 50 0 100 0 V 100 z',       // flat, covering everything
];
const REVEAL: readonly [string, string, string] = [
  'M 0 0 V 100 Q 50 100 100 100 V 0 z',     // covering everything
  'M 0 0 V 50 Q 50 0 100 50 V 0 z',         // halfway, middle leading
  'M 0 0 V 0 Q 50 0 100 0 V 0 z',           // gone off the top
];

function getCurtain(): HTMLElement {
  let w = document.getElementById('page-wave');
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
function run(shapes: readonly [string, string, string], duration: number, onDone?: () => void): gsap.core.Timeline {
  const w = getCurtain();
  const path = w.querySelector<SVGPathElement>('path');
  path?.setAttribute('d', shapes[0]);
  w.style.display = '';
  gsap.set(w, { visibility: 'visible' });
  return gsap.timeline({ onComplete: onDone })
    .to(path, { attr: { d: shapes[1] }, duration: duration * 0.5, ease: 'power3.in' })
    .to(path, { attr: { d: shapes[2] }, duration: duration * 0.5, ease: 'power3.out' });
}

export const pageCurtain: {
  cover(onDone?: () => void): gsap.core.Timeline;
  reveal(onDone?: () => void): gsap.core.Timeline;
} = {
  cover(onDone) { return run(COVER, 0.8, onDone); },
  reveal(onDone) {
    return run(REVEAL, 0.9, () => {
      gsap.set(getCurtain(), { visibility: 'hidden' });
      if (onDone) onDone();
    });
  },
};

// a cross-page internal link: a root-relative path (not protocol-relative)
// that is not a file under /assets/
function isPageLink(href: string): boolean {
  if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || /^https?:\/\//i.test(href)) return false;
  if (href.charAt(0) !== '/' || href.indexOf('//') === 0) return false;
  if (href.indexOf('/assets/') === 0) return false;
  return true;
}

export function initPageTransition(): void {
  const root = document.documentElement;

  // --- Incoming: if we arrived via a transition, lift the curtain.
  // The home page has its own MISC loader intro, so let that handle it there
  // — unless the intro already played this visit (.intro-seen).
  // reveal() puts the real curtain up fully covering before it returns, so
  // the first-paint stand-in (.curtain-in) can go without a gap between them.
  if (sessionStorage.getItem(FLAG)) {
    sessionStorage.removeItem(FLAG);
    if (!document.getElementById('loader') || root.classList.contains('intro-seen')) {
      pageCurtain.reveal();
    }
  }
  root.classList.remove('curtain-in');

  // --- Outgoing: cover the screen, then navigate.
  let leaving = false;
  const goWithCurtain = (href: string) => {
    if (leaving) return;
    leaving = true;
    pageCurtain.cover(() => {
      sessionStorage.setItem(FLAG, '1');
      window.location.href = href;
    });
  };

  // --- Back button: the browser can restore this page exactly as it was
  // left, with the curtain still covering it. Clear it and allow leaving again.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    const w = document.getElementById('page-wave');
    if (w) gsap.set(w, { visibility: 'hidden' });
  });

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
    if (!a || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (!isPageLink(href)) return; // only cross-page internal links
    e.preventDefault();
    goWithCurtain(href);
  });
}
