// ------------------------------------------------------------------
// Page transition — the same blue wave used after the loading screen.
// Clicking an internal link to another .html page sweeps the wave up to
// cover the screen, then navigates; the arriving page sweeps it away.
// Shared by the main page and all detail pages. Requires GSAP.
// ------------------------------------------------------------------
(function () {
  if (!window.gsap) return;
  var FLAG = 'nomi-wave-enter';
  var WAVE_HTML = `<svg class="loader-wave__svg" viewBox="0 0 1440 1520" preserveAspectRatio="none">
      <path fill="#3a3a3a" d="M0.0 101.4 L30.0 118.0 L60.0 129.6 L90.0 134.8 L120.0 132.9 L150.0 124.1 L180.0 109.5 L210.0 91.2 L240.0 71.3 L270.0 52.6 L300.0 37.5 L330.0 27.9 L360.0 25.0 L390.0 29.3 L420.0 40.2 L450.0 56.3 L480.0 75.4 L510.0 95.2 L540.0 112.9 L570.0 126.4 L600.0 133.9 L630.0 134.3 L660.0 127.7 L690.0 114.9 L720.0 97.6 L750.0 77.9 L780.0 58.6 L810.0 42.0 L840.0 30.4 L870.0 25.2 L900.0 27.1 L930.0 35.9 L960.0 50.5 L990.0 68.8 L1020.0 88.7 L1050.0 107.4 L1080.0 122.5 L1110.0 132.1 L1140.0 135.0 L1170.0 130.7 L1200.0 119.8 L1230.0 103.7 L1260.0 84.6 L1290.0 64.8 L1320.0 47.1 L1350.0 33.6 L1380.0 26.1 L1410.0 25.7 L1440.0 32.3 L1440.0 1407.1 L1410.0 1408.6 L1380.0 1415.3 L1350.0 1426.4 L1320.0 1440.7 L1290.0 1456.6 L1260.0 1472.4 L1230.0 1486.2 L1200.0 1496.5 L1170.0 1502.1 L1140.0 1502.5 L1110.0 1497.5 L1080.0 1487.8 L1050.0 1474.3 L1020.0 1458.7 L990.0 1442.7 L960.0 1428.1 L930.0 1416.5 L900.0 1409.2 L870.0 1407.0 L840.0 1410.3 L810.0 1418.5 L780.0 1430.9 L750.0 1445.9 L720.0 1462.0 L690.0 1477.3 L660.0 1490.1 L630.0 1498.9 L600.0 1502.9 L570.0 1501.4 L540.0 1494.7 L510.0 1483.6 L480.0 1469.3 L450.0 1453.4 L420.0 1437.6 L390.0 1423.8 L360.0 1413.5 L330.0 1407.9 L300.0 1407.5 L270.0 1412.5 L240.0 1422.2 L210.0 1435.7 L180.0 1451.3 L150.0 1467.3 L120.0 1481.9 L90.0 1493.5 L60.0 1500.8 L30.0 1503.0 L0.0 1499.7 Z"></path>
      <path fill="#1c1c1c" d="M0.0 240.3 L30.0 246.8 L60.0 244.0 L90.0 232.1 L120.0 213.1 L150.0 189.8 L180.0 165.8 L210.0 144.7 L240.0 129.7 L270.0 123.2 L300.0 126.0 L330.0 137.9 L360.0 156.9 L390.0 180.2 L420.0 204.2 L450.0 225.3 L480.0 240.3 L510.0 246.8 L540.0 244.0 L570.0 232.1 L600.0 213.1 L630.0 189.8 L660.0 165.8 L690.0 144.7 L720.0 129.7 L750.0 123.2 L780.0 126.0 L810.0 137.9 L840.0 156.9 L870.0 180.2 L900.0 204.2 L930.0 225.3 L960.0 240.3 L990.0 246.8 L1020.0 244.0 L1050.0 232.1 L1080.0 213.1 L1110.0 189.8 L1140.0 165.8 L1170.0 144.7 L1200.0 129.7 L1230.0 123.2 L1260.0 126.0 L1290.0 137.9 L1320.0 156.9 L1350.0 180.2 L1380.0 204.2 L1410.0 225.3 L1440.0 240.3 L1440.0 1305.2 L1410.0 1300.1 L1380.0 1302.8 L1350.0 1312.8 L1320.0 1329.1 L1290.0 1349.3 L1260.0 1370.9 L1230.0 1391.1 L1200.0 1407.3 L1170.0 1417.3 L1140.0 1419.9 L1110.0 1414.7 L1080.0 1402.3 L1050.0 1384.5 L1020.0 1363.5 L990.0 1342.0 L960.0 1322.9 L930.0 1308.6 L900.0 1301.0 L870.0 1301.0 L840.0 1308.7 L810.0 1323.1 L780.0 1342.3 L750.0 1363.7 L720.0 1384.7 L690.0 1402.5 L660.0 1414.8 L630.0 1419.9 L600.0 1417.2 L570.0 1407.2 L540.0 1390.9 L510.0 1370.7 L480.0 1349.1 L450.0 1328.9 L420.0 1312.7 L390.0 1302.7 L360.0 1300.1 L330.0 1305.3 L300.0 1317.7 L270.0 1335.5 L240.0 1356.5 L210.0 1378.0 L180.0 1397.1 L150.0 1411.4 L120.0 1419.0 L90.0 1419.0 L60.0 1411.3 L30.0 1396.9 L0.0 1377.7 Z"></path>
    </svg>`;

  function getWave() {
    var w = document.getElementById('page-wave');
    if (!w) {
      w = document.createElement('div');
      w.id = 'page-wave';
      w.className = 'loader-wave';
      w.setAttribute('aria-hidden', 'true');
      w.style.visibility = 'hidden';
      w.innerHTML = WAVE_HTML;
      document.body.appendChild(w);
    }
    return w;
  }

  // --- Incoming: if we arrived via a transition, sweep the wave away.
  // The home page has its own MINO loader intro, so let that handle it there.
  if (sessionStorage.getItem(FLAG)) {
    sessionStorage.removeItem(FLAG);
    if (!document.getElementById('loader')) {
      var wIn = getWave();
      var pIn = wIn.querySelector('.loader-wave__svg');
      gsap.set(wIn, { visibility: 'visible' });
      gsap.set(pIn, { yPercent: -18 });
      gsap.to(pIn, { yPercent: -100, duration: 0.9, ease: 'power2.inOut',
        onComplete: function () { wIn.style.display = 'none'; } });
    }
  }

  // --- Outgoing: cover the screen, then navigate.
  var leaving = false;
  function goWithWave(href) {
    if (leaving) return;
    leaving = true;
    var w = getWave();
    var p = w.querySelector('.loader-wave__svg');
    gsap.set(w, { visibility: 'visible' });
    gsap.set(p, { yPercent: 100 });
    gsap.to(p, { yPercent: -18, duration: 0.7, ease: 'power2.in',
      onComplete: function () { sessionStorage.setItem(FLAG, '1'); window.location.href = href; } });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || /^https?:\/\//i.test(href)) return;
    if (!/\.html(\?|#|$)/.test(href)) return; // only cross-page .html links
    e.preventDefault();
    goWithWave(href);
  });
})();
