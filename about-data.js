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

  // ---- Section copy ---------------------------------------------------
  // Keyed by the section's data-copy attribute in about.html. A string that
  // still starts with TODO or "Vul aan" is rendered as a note instead of as
  // body text, so an unfinished line is obvious on the page.
  copy: {
    home: {
      body: 'Fifteen minutes from Amsterdam, ten from Schiphol. Close enough '
          + 'to the city to be in it whenever I want, far enough out to have '
          + 'had room to make things.',
      todo: ''
    },
    watch: {
      body: 'The dial below is live: the hands are drawn over the photograph '
          + 'and run on your own clock.',
      todo: 'Vul aan: waarom horloges?'
    }
  },

  // ---- Roadmap — same events as the homepage timeline ---------------
  road: [
    { year: '2021', kind: ' Education',     title: 'Technical Computer Science',                where: 'AUAS' },
    { year: '2023', kind: ' Education',     title: 'Communication & Multimedia Design',         where: 'AUAS' },
    { year: '2025', kind: ' Work',          title: 'First UX/UI Internship',                    where: 'Ecocharting' },
    { year: '2025', kind: ' Venture',       title: 'Founded a Software Company',                where: 'Day-to-Day' },
    { year: '2025', kind: ' Certification', title: 'Junior Software Developer Certification',   where: 'Amazon' },
    { year: '2025', kind: ' Work',          title: 'Teaching Assistant, Front-end Development', where: 'AUAS' },
    { year: '2025', kind: ' Certification', title: 'Ethical Hacking with Open Source Tools',    where: 'IBM Specialization' },
    { year: '2025', kind: ' Education',     title: 'Minor Business Law',                        where: 'AUAS' },
    { year: '2026', kind: ' Education',     title: 'Minor Web Design & Development',            where: 'AUAS' },
    { year: '2026', kind: ' Work',          title: 'Front-end Development Internship',          where: 'Build in Amsterdam' }
  ],

  // ---- Projects — same deck as the homepage --------------------------
  projects: [
    // { name: 'Scholtes Klusbedrijf', img: 'project-images/scholtes-klusbedrijf.png', link: 'https://mitchellkevin.github.io/scholtes-klusbedrijf/' },
    // { name: 'Day-to-Day',           img: 'project-images/d2d.png',                  link: 'https://www.day-to-day.nl/' },
    { name: 'Visdeurbel Datavis.',  img: 'project-images/visdeurbel.png',           link: 'https://vis-b05f.onrender.com/' },
    { name: 'CMD Casino',           img: 'project-images/CMD-casino.png',           link: 'https://wdd-api-scholte.onrender.com/' },
    // { name: 'HCD',                  img: 'project-images/HCD.png',                  link: 'https://mitchellkevin.github.io/HCD/' },
    { name: 'Hackathon',            img: 'project-images/hackathon.png',            link: 'https://mitchellkevin.github.io/Space/' },
    { name: 'Mitchopoly',           img: 'project-images/mitchopoly.png',           link: 'https://mitchellkevin.github.io/PersonalInfoSite/' }
  ],

  // ---- The switch — IT on the left, CMD on the right -----------------
  switchPanels: {
    it: {
      heading: 'I could build.',
      body: 'Two years of embedded systems, algorithms and building automation programs. I learned to make things work.',
      todo: 'Java, C, Python'
    },
    cmd: {
      heading: 'I wanted to create.',
      body: 'So I switched. Research, UX and design thinking',
      todo: 'HTML, CSS, JavaScript, MERN, Figma'
    }
  },

  // ---- Internship goals (alleen zichtbaar via ?intro) ----------------
  goals: [
    { title: 'Goal 1: GSAP Animations', body: 'GSAP Animations are a powerful way to create engaging web experiences. I want to learn how to use them effectively in my projects.' },
    { title: 'Goal 2: 3D Modelling', body: '3D Modelling is an exciting field that allows for the creation of immersive experiences. I want to learn how to create and manipulate 3D models for use in web applications.' },
    { title: 'Goal 3: Accessibility Best Practices', body: 'Accessibility is crucial for creating inclusive web experiences. I want to learn how to implement best practices in my projects.' }
  ],

  // ---- Hobbies — same animated tiles as the homepage focus points ----
  // `art` picks the illustration: sport | photo | web
  hobbies: [
    { art: 'sport', title: 'Sport',       body: 'I like running and enjoy working out in my home gym. But pretty much down for almost any sporting activity.' },
    { art: 'photo', title: 'Photography', body: 'I enjoy capturing moments in nature and architecture, but don\'t do it as much as I would love to.' },
    { art: 'web',   title: 'Web',         body: 'I love building websites and working with hardware to advance my creativity and skills.' }
  ],

  // ---- Cars ------------------------------------------------------------
  // Optimised copies live in models/cars/ — 46MB of source became 6.5MB.
  // Only the selected one is fetched.
  cars: [
    { name: 'Mercedes SLS AMG', year: '2010',
      file: 'models/cars/2010_mercedes_sls_amg.glb',
      note: 'TODO: waarom deze? Wat vind je eraan?' },
    // This one is modelled facing the other way — spin corrects it so the
    // animation can treat every car the same. Check a new car by looking at
    // which end faces you when it parks; a LaFerrari is easy to misread,
    // its tail is pointier than its nose.
    { name: 'Ferrari LaFerrari', year: '2013',
      file: 'models/cars/2013_ferrari_laferrari.glb', spin: 180,
      note: 'TODO.' },
    { name: 'BMW M5', year: '2018',
      file: 'models/cars/2018_bmw_m5.glb',
      note: 'TODO.' }
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
