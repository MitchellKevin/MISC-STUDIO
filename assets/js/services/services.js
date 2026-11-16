// ------------------------------------------------------------------
// Service detail pages. Reveals, the menu and the process rail come from
// site.js; this only drives the overview copy, which inks in paragraph by
// paragraph as it scrolls through the screen (services.css reads --p).
// No dependencies.
// ------------------------------------------------------------------
(() => {
  const paras = Array.from(document.querySelectorAll('.fill-text'));
  if (!paras.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    paras.forEach((p) => p.style.setProperty('--p', '1'));
    return;
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    paras.forEach((p) => {
      const r = p.getBoundingClientRect();
      // 0 while the paragraph's top is below 85% of the screen, 1 once its
      // bottom has risen past 55%
      const start = vh * 0.85;
      const end = vh * 0.55;
      const t = (start - r.top) / (start - end + r.height);
      p.style.setProperty('--p', Math.min(1, Math.max(0, t)).toFixed(3));
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// ------------------------------------------------------------------
// Hero tile in 3D. The flat service tile (icon-tile in the HTML) is
// rebuilt as an object: the tile is a slab with thickness (stacked layers
// behind its face), the icon floats on its own layer in front of it, and
// a glare sits on the face. The whole thing turns to face the pointer
// anywhere in the hero, eased, and settles back when the pointer leaves.
// Without JS the flat tile stays; with reduced motion it stays still.
// ------------------------------------------------------------------
(() => {
  const hero = document.querySelector('.page-hero');
  const tile = hero && hero.querySelector('.page-hero__art .icon-tile');
  if (!tile) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // build: wrapper > [depth layers…, face (the tile), glyph]
  const obj = document.createElement('div');
  obj.className = 'icon-3d';
  tile.before(obj);
  const DEPTH = 12;                                   // slices of thickness
  for (let i = DEPTH; i >= 1; i--) {
    const slice = document.createElement('span');
    slice.className = 'icon-3d__slice';
    slice.style.setProperty('--i', i);
    obj.appendChild(slice);
  }
  obj.appendChild(tile);
  tile.classList.add('icon-3d__face');
  const glare = document.createElement('span');
  glare.className = 'icon-3d__glare';
  tile.appendChild(glare);
  const svg = tile.querySelector('svg');
  if (svg) {
    const glyph = document.createElement('div');
    glyph.className = 'icon-3d__glyph';
    glyph.appendChild(svg);
    obj.appendChild(glyph);
  }
  if (reduced) return;

  const MAX_X = 16;   // deg, tilting up / down
  const MAX_Y = 22;   // deg, turning left / right
  const target = { x: 0, y: 0, gx: 30, gy: 20 };
  const cur = { x: 0, y: 0, gx: 30, gy: 20 };
  let raf = 0;

  const frame = () => {
    raf = 0;
    let moving = false;
    for (const k of ['x', 'y', 'gx', 'gy']) {
      const d = target[k] - cur[k];
      cur[k] += d * 0.09;
      if (Math.abs(d) > 0.02) moving = true;
    }
    obj.style.setProperty('--rx', `${cur.x.toFixed(2)}deg`);
    obj.style.setProperty('--ry', `${cur.y.toFixed(2)}deg`);
    obj.style.setProperty('--gx', `${cur.gx.toFixed(1)}%`);
    obj.style.setProperty('--gy', `${cur.gy.toFixed(1)}%`);
    // the icon's shadow falls away from the light, i.e. against the turn
    obj.style.setProperty('--sx', `${(-cur.y * 0.9).toFixed(1)}px`);
    obj.style.setProperty('--sy', `${(16 + cur.x * 0.9).toFixed(1)}px`);
    if (moving) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = obj.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    // where the pointer is, from the tile's centre, as a share of the hero
    const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (h.width / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (h.height / 2)));
    target.y = nx * MAX_Y;
    target.x = -ny * MAX_X;
    target.gx = 50 + nx * 45;
    target.gy = 50 + ny * 45;
    wake();
  });
  hero.addEventListener('pointerleave', () => {
    target.x = 0; target.y = 0; target.gx = 30; target.gy = 20;
    wake();
  });
})();
