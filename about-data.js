// ------------------------------------------------------------------
// EDIT THIS FILE — everything on the about page comes from here, so you
// never have to touch the markup. Anything marked TODO is mine to guess
// and yours to replace.
//
// `road` and `projects` are copied from the homepage so both pages show
// the same thing. Change one, change the other — or say the word and I
// point index.html at this file too.
//
// Photos: drop them in img/about/ and point `photo` at the path. Leave a
// photo empty and the card falls back to a lettermark, so nothing breaks
// while you are still collecting them.
// ------------------------------------------------------------------
window.ABOUT = {

  // ---- Roadmap — same events as the homepage timeline ---------------
  road: [
    { year: '2021', kind: 'Education',     title: 'Technical Computer Science',                where: 'AUAS' },
    { year: '2023', kind: 'Education',     title: 'Communication & Multimedia Design',         where: 'AUAS' },
    { year: '2025', kind: 'Work',          title: 'First UX/UI Internship',                    where: 'Ecocharting' },
    { year: '2025', kind: 'Venture',       title: 'Founded a Software Company',                where: 'Day-to-Day' },
    { year: '2025', kind: 'Certification', title: 'Junior Software Developer Certification',   where: 'Amazon' },
    { year: '2025', kind: 'Work',          title: 'Teaching Assistant, Front-end Development', where: 'AUAS' },
    { year: '2025', kind: 'Certification', title: 'Ethical Hacking with Open Source Tools',    where: 'IBM Specialization' },
    { year: '2025', kind: 'Education',     title: 'Minor Business Law',                        where: 'AUAS' },
    { year: '2026', kind: 'Education',     title: 'Minor Web Design & Development',            where: 'AUAS' },
    { year: '2026', kind: 'Work',          title: 'Front-end Development Internship',          where: 'Build in Amsterdam' }
  ],

  // ---- Projects — same deck as the homepage --------------------------
  projects: [
    { name: 'Scholtes Klusbedrijf', img: 'project-images/scholtes-klusbedrijf.png', link: 'https://mitchellkevin.github.io/scholtes-klusbedrijf/' },
    { name: 'Day-to-Day',           img: 'project-images/d2d.png',                  link: 'https://www.day-to-day.nl/' },
    { name: 'Visdeurbel Datavis.',  img: 'project-images/visdeurbel.png',           link: 'https://vis-b05f.onrender.com/' },
    { name: 'CMD Casino',           img: 'project-images/CMD-casino.png',           link: 'https://wdd-api-scholte.onrender.com/' },
    { name: 'HCD',                  img: 'project-images/HCD.png',                  link: 'https://mitchellkevin.github.io/HCD/' },
    { name: 'Hackathon',            img: 'project-images/hackathon.png',            link: 'https://mitchellkevin.github.io/Space/' },
    { name: 'Mitchopoly',           img: 'project-images/mitchopoly.png',           link: 'https://mitchellkevin.github.io/PersonalInfoSite/' }
  ],

  // ---- The switch — IT on the left, CMD on the right -----------------
  switchPanels: {
    it: {
      heading: 'I could build it.',
      body: 'Two years of systems, algorithms and back-end. I learned to make things work.',
      todo: 'Vul aan: wat deed je omslaan? Eén concreet moment, geen nette samenvatting.'
    },
    cmd: {
      heading: 'I wanted it used.',
      body: 'So I switched. Research, interfaces and the reason behind them — without giving up the part where I build the thing.',
      todo: 'Vul aan: wat leverde de switch je op?'
    }
  },

  // ---- Internship goals (alleen zichtbaar via ?intro) ----------------
  goals: [
    { title: 'TODO: doel 1', body: 'TODO: waarom dit, en waaraan zie je dat je het gehaald hebt?' },
    { title: 'TODO: doel 2', body: 'TODO.' },
    { title: 'TODO: doel 3', body: 'TODO.' }
  ],

  // ---- Hobbies — same animated tiles as the homepage focus points ----
  // `art` picks the illustration: sport | photo | web
  hobbies: [
    { art: 'sport', title: 'Sport',       body: 'TODO: welke sport, en wat haal je eruit?' },
    { art: 'photo', title: 'Photography', body: 'TODO: wat schiet je het liefst?' },
    { art: 'web',   title: 'Web',         body: 'TODO: wat trekt je aan het bouwen zelf?' }
  ],

  // ---- Watches --------------------------------------------------------
  // One photo per watch. Scrolling zooms into the date window and, at the
  // end, the date rolls over a day — the digits are drawn on top of the
  // photo inside a clipped window, the way a real date disc turns.
  //
  // CALIBRATION, once you have the photo: open the page, scroll to the
  // watch, and nudge `date.x/y/w/h` until the patch sits exactly over the
  // aperture. They are percentages of the image, not pixels. Sampling the
  // dial for `bg` and `ink` with the colour picker is the difference
  // between "part of the watch" and "pasted on".
  //
  //   zoom  — how far in the scroll travels
  //   date  — from/to  the two numbers
  //           x, y     centre of the aperture, % of the image
  //           w, h     size of the aperture, % of the image
  //           bg, ink  date disc colour and digit colour
  watches: [
    {
      name: 'Oris Aquis',
      note: 'TODO: waarom deze?',
      // cut off its backdrop by tools/cutout.py — rerun that if you replace
      // the source. 320x524.
      photo: 'img/about/oris-aquis.png',
      zoom: 6,
      // measured off the cutout: the date sits at 6 o'clock, printed straight
      // onto the dial with no aperture, digits 12x20px in a 320x524 image.
      // bg and ink are sampled from the dial either side of the numerals.
      date: {
        from: 10, to: 11,
        x: 46.0, y: 63.7,      // centre of the numerals, % of the image
        w: 4.8, h: 5.0,        // just enough to bury the printed "10"
        radius: 8,
        bg: '#0a0907', ink: '#d1d0ce',
        condense: 0.62         // the dial font is tall and narrow; squeeze
      }                        // Poppins sideways to sit closer to it
    },
    {
      name: 'Hamilton Khaki Field',
      note: 'TODO: waarom deze?',
      // the .avif already carries an alpha channel, so no cutout was needed
      photo: 'hamilton-khaki.avif',
      zoom: 6,
      // This one has no date — it has a power reserve at 9 o'clock, so the
      // thing that moves is that hand running from empty to full.
      //
      // Measured off the 2000x2000 source. The scale marks and the E / 1/2 / F
      // labels sit at radius 72-95, so a disc over the sub-dial would wipe
      // them out. Instead `hide` erases only the real hand — a narrow wedge
      // that fits between two marks — and a drawn hand sweeps over the top.
      //
      //   x, y   the hand's pivot, % of the image
      //   box    size of the overlay, % of the image width
      //   units  the viewBox is in source pixels, so the numbers below are
      //          the ones measured off the photo
      hand: {
        x: 40.4, y: 46.4,
        box: 11,
        hide: 222.4, hideSpread: 7,   // the real hand's angle, and how wide to erase
        from: 120, to: 240,           // E at 120 deg, half at 180, F at 240
        len: 89, hub: 12, reach: 96,
        dial: '#f4f3f0',              // the sub-dial white, to erase with
        ink: '#141414', lume: '#e9d9ae'
      }
    }
  ],

  // ---- Photos on the camera's rear screen -------------------------------
  // TODO: vervang door je eigen fotografie. Dit zijn nu bestaande beelden
  // uit project-images/ zodat je kunt zien of het effect werkt.
  photos: [
    'project-images/visdeurbel.png',
    'project-images/d2d.png',
    'project-images/HCD.png'
  ],

  // ---- Countries visited ----------------------------------------------
  // Names must match the Natural Earth dataset. Get one wrong and about.js
  // says so in the console rather than silently skipping it — run
  // window.ABOUT_COUNTRY_NAMES for the full list.
  // TODO: dit is een gok, vervang door je echte lijst.
  visited: [
    'Netherlands', 'Belgium', 'Germany', 'France',
    'Spain', 'Italy', 'Austria', 'Portugal'
  ]
};
