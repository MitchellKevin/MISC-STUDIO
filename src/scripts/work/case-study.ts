// ------------------------------------------------------------------
// Case study page — fills /detail-pages/work/case-study/ with one project
// from case-studies.ts (picked by ?project=<slug>) and runs its scroll
// animations. Imports gsap + ScrollTrigger (already registered) from
// ../shared/gsap.
//
// Plain-JS take on the "SmoothScrollHero" React component (framer-motion):
//   - the project shot sits as a card under the title and grows to fill
//     the screen as you scroll, then scrolls away with the overview under it
//   - a project's gallery, if it has one, drifts past at its own speeds
//   - everything below rises in as it enters the view
// Its Lenis smooth scrolling is left out: the rest of the site scrolls
// natively, and a case study should not feel different under the wheel.
// ------------------------------------------------------------------
import { gsap } from '@/scripts/shared/gsap';
import { CASE_STUDIES, type CaseStudy } from '@/scripts/work/case-studies';

// where each gallery shot starts and ends its drift, in px (repeats every 4)
const PARALLAX: readonly (readonly [number, number])[] = [[-200, 200], [200, -250], [-200, 200], [0, -500]];

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string | null, text?: string | null): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

export function initCaseStudy(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const studies = CASE_STUDIES;
  const current = studies.findIndex(
    (s) => s.slug === new URLSearchParams(location.search).get('project')
  );

  if (current === -1) {
    // unknown or missing project: back to the work list
    location.replace('/#showcase');
  } else {
    const project = studies[current];
    render(project, studies[(current + 1) % studies.length]);
    animate(!!(project.gallery && project.gallery.length), prefersReduced);
  }
}

// MARK: Render
function render(project: CaseStudy, next: CaseStudy): void {
  const slot = <T extends Element = HTMLElement>(name: string) => document.querySelector<T>(`[data-cs="${name}"]`);

  document.title = `${project.title} — Case study — MISC STUDIO`;

  const title = slot('title');
  const label = slot('label');
  const intro = slot('intro');
  const live = slot<HTMLAnchorElement>('live');
  const facts = document.querySelector<HTMLElement>('[data-cs-facts]');
  const story = document.querySelector<HTMLElement>('[data-cs-story]');
  const nextLink = slot<HTMLAnchorElement>('next');
  const nextTitle = slot('next-title');
  const nextImage = slot<HTMLImageElement>('next-image');
  const gallery = document.querySelector<HTMLElement>('[data-cs-gallery]');
  if (!title || !label || !intro || !live || !facts || !story || !nextLink || !nextTitle || !nextImage || !gallery) return;

  title.textContent = project.title;
  label.textContent = `Case study — ${project.label || 'Project'}`;
  intro.textContent = project.intro || '';

  // the hero shot and its blurred backdrop
  document.querySelectorAll<HTMLImageElement>('[data-cs="image"]').forEach((img) => {
    img.src = project.image;
    if (!img.hasAttribute('aria-hidden')) img.alt = project.title;
  });

  if (project.live) live.href = project.live;
  else live.remove();

  (project.facts || []).forEach((fact) => {
    const row = el('div');
    row.append(el('dt', null, fact.label), el('dd', null, fact.value));
    facts.appendChild(row);
  });

  (project.story || []).forEach((chapter, i) => {
    const item = el('article', 'cs-chapter');
    item.append(
      el('span', 'cs-chapter__num', String(i + 1).padStart(2, '0')),
      el('h3', 'cs-chapter__heading', chapter.heading),
      el('p', 'cs-chapter__body', chapter.body)
    );
    story.appendChild(item);
  });

  nextLink.href = `/detail-pages/work/case-study/?project=${next.slug}`;
  nextLink.setAttribute('aria-label', `Next project: ${next.title}`);
  nextTitle.textContent = next.title;
  nextImage.src = next.image;

  (project.gallery || []).forEach((shot) => {
    const figure = el('figure', 'cs-shot');
    const frame = el('div', 'cs-shot__frame');
    const img = el('img');
    img.src = shot.src;
    img.alt = shot.alt || '';
    frame.appendChild(img);
    figure.appendChild(frame);
    gallery.appendChild(figure);
  });
  gallery.hidden = !gallery.children.length;
}

// MARK: Animate
function animate(hasGallery: boolean, prefersReduced: boolean): void {
  const hero = document.querySelector<HTMLElement>('.cs-hero');
  const sticky = document.querySelector<HTMLElement>('.cs-hero__sticky');
  if (!hero) return;

  // px of scroll the card takes to fill the screen. Longer with a gallery,
  // so its shots have room to drift past. Without motion there is nothing
  // to scroll through, so the hero is just one screen.
  const range = prefersReduced ? 0 : hasGallery ? 1500 : 1000;
  hero.style.minHeight = `calc(${range}px + 100vh)`;

  // a tween driven straight by the page scroll between two px positions
  const scrub = (target: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, start: number, end: number) =>
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
    gsap.utils.toArray<HTMLElement>('.cs-shot').forEach((shot, i) => {
      const [from, to] = PARALLAX[i % PARALLAX.length];
      const offset = (n: number) => (n < 0 ? '-=' : '+=') + Math.abs(n);
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
  const reveal = (target: string | Element) =>
    gsap.from(target, {
      y: prefersReduced ? 0 : 40,
      autoAlpha: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: { trigger: target, start: 'top 88%' },
    });

  const targets: (string | Element)[] = [
    '.cs-overview .section-label',
    '.cs-overview__title',
    ...document.querySelectorAll('.cs-meta > div'),
    '.cs-overview .btn',
    '.cs-story .section-label',
    ...document.querySelectorAll('.cs-chapter'),
    '.detail-cta__inner',
    '.cs-next__card',
  ];
  targets.forEach((target) => {
    if (typeof target !== 'string' || document.querySelector(target)) reveal(target);
  });
}
