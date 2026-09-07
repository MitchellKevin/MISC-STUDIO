// ------------------------------------------------------------------
// The hero Polaroid, turned by the cursor.
//
// The pointer is tracked across the WHOLE hero section, not just the
// photo. Tilting only while you are directly over a small card means you
// have to find it before it does anything; driven by the section, the
// photo is already turning towards you as you arrive, which is what makes
// it read as an object sitting in the page rather than a hover effect.
//
// Nothing here writes a transform string. JS only sets the angles as
// custom properties and about.css composes them, so the resting tilt and
// the responsive sizing stay in one place.
//
// The values are eased towards the pointer rather than tracking it
// exactly: a card that snaps to the cursor feels like a mouse-follower,
// one that lags slightly feels like it has weight.
// ------------------------------------------------------------------
(function () {
  const card = document.querySelector('[data-polaroid]');
  const stage = document.querySelector('[data-polaroid-stage]');
  if (!card || !stage) return;

  // a photo that pitches about on its own is exactly what this setting is
  // for — the print keeps its resting tilt and simply stays put
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // the hero is the sensing area; the stage is the fallback if the markup
  // is ever moved somewhere without one
  const zone = card.closest('.ab') || stage;

  const TILT = 13;      // degrees of pitch/yaw at the far edge of the hero
  const SHIFT = 0.055;  // rem the photo slides inside its frame, for depth
  const EASE = 0.1;     // how hard the card chases the pointer, 0–1
  const REST = 0.0005;  // below this the loop stops rather than idling

  // -1 … 1 across the zone, plus how "engaged" the card is: the angles ease
  // back to flat when the cursor leaves, instead of freezing mid-turn
  const to = { x: 0, y: 0, on: 0 };
  const at = { x: 0, y: 0, on: 0 };
  let raf = 0;

  const clamp = n => (n < -1 ? -1 : n > 1 ? 1 : n);

  function point(e) {
    // touch and pen get nothing: on a touchscreen the "pointer" is a tap,
    // and a card that lurches on every tap is just noise
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const r = zone.getBoundingClientRect();
    if (!r.width || !r.height) return;
    to.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
    to.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
    to.on = 1;
    run();
  }

  function release() {
    to.x = 0;
    to.y = 0;
    to.on = 0;
    run();
  }

  function frame() {
    at.x += (to.x - at.x) * EASE;
    at.y += (to.y - at.y) * EASE;
    at.on += (to.on - at.on) * EASE;

    const s = card.style;
    // pointer right turns the card's right edge away, so it reads as
    // looking towards the cursor rather than leaning away from it
    s.setProperty('--pol-ry', (at.x * TILT).toFixed(2) + 'deg');
    s.setProperty('--pol-rx', (-at.y * TILT).toFixed(2) + 'deg');
    // the print slides against the turn — parallax is what stops the card
    // looking like a flat image with a rotation on it
    s.setProperty('--pol-px', (-at.x * SHIFT).toFixed(4) + 'rem');
    s.setProperty('--pol-py', (-at.y * SHIFT).toFixed(4) + 'rem');
    // the shadow falls the other way from the light, and deepens as the
    // card lifts towards the cursor
    s.setProperty('--pol-sx', (-at.x * 0.16).toFixed(4) + 'rem');
    s.setProperty('--pol-sy', (0.28 + at.on * 0.1).toFixed(4) + 'rem');
    s.setProperty('--pol-lift', (at.on * -0.05).toFixed(4) + 'rem');
    // the sheen sweeps across the print as it turns
    s.setProperty('--pol-sheen-x', (50 + at.x * 55).toFixed(1) + '%');
    s.setProperty('--pol-sheen-o', (at.on * 0.55).toFixed(3));

    const still = Math.abs(to.x - at.x) < REST &&
                  Math.abs(to.y - at.y) < REST &&
                  Math.abs(to.on - at.on) < REST;
    if (still) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }

  function run() { if (!raf) raf = requestAnimationFrame(frame); }

  zone.addEventListener('pointermove', point);
  zone.addEventListener('pointerleave', release);
  // scrolling the hero away leaves the card mid-turn otherwise: the cursor
  // never crosses the edge, so pointerleave never fires
  window.addEventListener('blur', release);
})();
