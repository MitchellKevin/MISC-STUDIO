// ------------------------------------------------------------------
// Ambient music. On by default — but no browser will play unmuted audio
// before the visitor has interacted with the page, so "on" means the
// control reads as on from load and the track fades in on the first
// click, key press or tap. The choice is remembered after that.
//
// The 5.7MB track is preload="none", so nothing downloads until it is
// actually going to play.
//
// Two states are tracked separately on purpose: `intent` is what the
// user wants, `playing` is what the audio element is actually doing.
// They differ for the whole stretch between load and first gesture, and
// conflating them means a visitor whose first click IS the mute button
// gets the music started by the very gesture meant to stop it.
//
// Credit is required by the Bensound licence and lives in the footer.
// ------------------------------------------------------------------
(function () {
  var KEY = 'misc-sound';
  var SRC = 'bensound-moonlightdrive.mp3';
  var VOLUME = 0.32;
  var FADE = 900;              // ms, both directions

  var audio = null;
  var fadeTimer = null;
  var intent = 'on';           // default; overridden by a stored choice
  var playing = false;
  var armed = false;

  function getAudio() {
    if (audio) return audio;
    audio = document.createElement('audio');
    audio.src = SRC;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0;
    document.body.appendChild(audio);
    return audio;
  }

  // linear ramp — the Web Audio API would be smoother but this needs no
  // context juggling and the ear cannot tell over 900ms
  function fadeTo(target, done) {
    var a = getAudio();
    var from = a.volume;
    var start = performance.now();
    clearInterval(fadeTimer);
    fadeTimer = setInterval(function () {
      var t = Math.min(1, (performance.now() - start) / FADE);
      a.volume = from + (target - from) * t;
      if (t === 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 25);
  }

  function paint(btn) {
    btn.setAttribute('aria-pressed', intent === 'on' ? 'true' : 'false');
    btn.setAttribute('aria-label', intent === 'on' ? 'Mute ambient music' : 'Play ambient music');
  }

  // returns a promise for whether the browser actually let it through
  function play() {
    var p = getAudio().play();
    if (!p || !p.then) return Promise.resolve(false);
    return p.then(function () { playing = true; fadeTo(VOLUME); return true; },
                  function () { return false; });
  }

  function silence() {
    playing = false;
    fadeTo(0, function () { if (audio) audio.pause(); });
  }

  // wait for the first gesture anywhere, then try again
  function arm() {
    if (armed) return;
    armed = true;
    var go = function () {
      document.removeEventListener('pointerdown', go, true);
      document.removeEventListener('keydown', go, true);
      document.removeEventListener('touchstart', go, true);
      if (!armed || intent !== 'on') return;   // muted again before we got here
      armed = false;
      play();
    };
    // capture phase so this runs even if something calls stopPropagation
    document.addEventListener('pointerdown', go, true);
    document.addEventListener('keydown', go, true);
    document.addEventListener('touchstart', go, true);
  }

  function build() {
    var menu = document.querySelector('.header-menu');
    if (!menu || document.querySelector('.sound-toggle')) return null;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sound-toggle';
    btn.innerHTML = '<i></i><i></i><i></i><i></i>';

    var li = document.createElement('li');
    li.className = 'header-menu__item sound-toggle-item';
    li.appendChild(btn);

    // sits before the theme switch if that one is already in place
    var themeItem = menu.querySelector('.theme-toggle-item');
    if (themeItem) menu.insertBefore(li, themeItem);
    else menu.appendChild(li);
    return btn;
  }

  function init() {
    var btn = build();
    if (!btn) return;

    try { intent = localStorage.getItem(KEY) === 'off' ? 'off' : 'on'; } catch (e) {}
    paint(btn);

    btn.addEventListener('click', function () {
      intent = intent === 'on' ? 'off' : 'on';
      try { localStorage.setItem(KEY, intent); } catch (e) {}
      paint(btn);

      if (intent === 'off') {
        armed = false;           // cancels a pending first-gesture start
        if (playing) silence();
        return;
      }
      play().then(function (ok) { if (!ok) arm(); });
    });

    if (intent === 'on') {
      play().then(function (ok) { if (!ok) arm(); });
    }

    // don't keep playing into a tab nobody is looking at
    document.addEventListener('visibilitychange', function () {
      if (!playing || !audio) return;
      if (document.hidden) audio.pause();
      else audio.play().catch(function () {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
