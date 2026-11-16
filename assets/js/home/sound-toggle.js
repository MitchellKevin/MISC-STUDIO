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
  var SRC = 'assets/audio/bensound-moonlightdrive.mp3';
  var VOLUME = 0.32;
  var FADE = 900;              // ms, both directions

  var audio = null;
  var fadeTimer = null;
  var intent = 'on';           // default; overridden by a stored choice
  var playing = false;
  var sounding = false;        // the audio element is really playing right now
  var armed = false;

  function getAudio() {
    if (audio) return audio;
    audio = document.createElement('audio');
    // a page that sits deeper in the tree passes its own path on the button
    var marked = document.querySelector('[data-sound-toggle][data-src]');
    audio.src = marked ? marked.getAttribute('data-src') : SRC;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0;
    // the bars dance only while sound is actually coming out (the switch can
    // read "on" long before the first gesture lets the browser play)
    audio.addEventListener('playing', function () { sounding = true; paint(); announce(); });
    audio.addEventListener('pause', function () { sounding = false; paint(); announce(); });
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

  // Other parts of the page can follow the music (the "Love" equalizer on
  // the about page): window.miscSound.sounding, and a soundchange event.
  window.miscSound = { sounding: false };
  function announce() {
    window.miscSound.sounding = sounding;
    window.dispatchEvent(new CustomEvent('soundchange', { detail: { sounding: sounding } }));
  }

  // A button reads as on only while the music is really playing. Before the
  // first gesture the music is "on" but silent, and showing it as on there
  // made the first click on a play button mute it instead.
  var buttons = [];
  function paint() {
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? 'Mute ambient music' : 'Play ambient music');
      btn.classList.toggle('is-sounding', sounding);
    });
  }

  // returns a promise for whether the browser actually let it through
  function play() {
    var p = getAudio().play();
    if (!p || !p.then) return Promise.resolve(false);
    return p.then(function () { playing = true; armed = false; fadeTo(VOLUME); paint(); return true; },
                  function () { return false; });
  }

  function silence() {
    playing = false;
    paint();
    fadeTo(0, function () { if (audio) audio.pause(); });
  }

  // wait for the first gesture anywhere, then try again
  function arm() {
    if (armed) return;
    armed = true;
    var go = function (e) {
      // a gesture on a sound button is that button's to handle (its click
      // decides on or off); starting the music here first would let the
      // click read it as playing and mute it straight away
      if (e && e.target && e.target.closest && e.target.closest('[data-sound-toggle]')) return;
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

    // sits before the theme switch if that one is already in place, and
    // before the About icon either way
    var next = menu.querySelector('.theme-toggle-item') || menu.querySelector('.header-icon-item');
    menu.insertBefore(li, next);
    return btn;
  }

  function init() {
    // the redesigned header ships its own buttons (one in the bar, one in the
    // menu); older pages still get one injected into .header-menu
    buttons = Array.prototype.slice.call(document.querySelectorAll('[data-sound-toggle]'));
    if (!buttons.length) {
      var built = build();
      if (built) buttons = [built];
    }
    if (!buttons.length) return;

    try { intent = localStorage.getItem(KEY) === 'off' ? 'off' : 'on'; } catch (e) {}
    paint();

    // A click turns on what isn't playing and turns off what is — judged by
    // what you can hear, not by the stored choice
    var toggle = function () {
      intent = playing ? 'off' : 'on';
      try { localStorage.setItem(KEY, intent); } catch (e) {}
      paint();

      if (intent === 'off') {
        armed = false;           // cancels a pending first-gesture start
        if (playing) silence();
        return;
      }
      play().then(function (ok) { if (!ok) arm(); });
    };
    buttons.forEach(function (btn) { btn.addEventListener('click', toggle); });

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
