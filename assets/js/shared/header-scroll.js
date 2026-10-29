// ------------------------------------------------------------------
// Compact header. Once the page has scrolled a little, the header gets
// .is-scrolled and the CSS tucks it into a shorter, narrower bar — on
// desktop only; below 700px the class is set but nothing reacts to it.
// Works for both the main header (.header) and the detail pages'
// (.site-header). No dependencies.
// ------------------------------------------------------------------
(function () {
  var header = document.querySelector('.header, .site-header');
  if (!header) return;
  var THRESHOLD = 40; // px scrolled before it compacts

  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  }
  update(); // a reload halfway down the page starts compact
  window.addEventListener('scroll', update, { passive: true });
})();
