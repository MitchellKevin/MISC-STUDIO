// ------------------------------------------------------------------
// EDIT THIS FILE — everything on the about page comes from here, so you
// never have to touch the markup. Anything marked TODO is mine to guess
// and yours to replace.
//
// `road` and `projects` are copied from the homepage so both pages show
// the same thing. Change one, change the other — or say the word and I
// point index.html at this file too.
//
// Photos: drop them in assets/img/about/ and point `photo` at the path. Leave a
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
    // links go to the case study; the live URLs are in assets/js/work/case-studies.js
    // { name: 'Scholtes Klusbedrijf', img: 'assets/img/projects/scholtes-klusbedrijf.webp', link: 'detail-pages/work/case-study.html?project=scholtes-klusbedrijf' },
    // { name: 'Day-to-Day',           img: 'assets/img/projects/d2d.webp',                  link: 'detail-pages/work/case-study.html?project=day-to-day' },
    { name: 'Visdeurbel Datavis.',  img: 'assets/img/projects/visdeurbel.webp',           link: 'detail-pages/work/case-study.html?project=visdeurbel' },
    { name: 'CMD Casino',           img: 'assets/img/projects/CMD-casino.webp',           link: 'detail-pages/work/case-study.html?project=cmd-casino' },
    // { name: 'HCD',                  img: 'assets/img/projects/HCD.webp',                  link: 'detail-pages/work/case-study.html?project=hcd' },
    { name: 'Hackathon',            img: 'assets/img/projects/hackathon.webp',            link: 'detail-pages/work/case-study.html?project=hackathon' },
    { name: 'Mitchopoly',           img: 'assets/img/projects/mitchopoly.webp',           link: 'detail-pages/work/case-study.html?project=mitchopoly' }
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

  // ---- Photos on the camera's rear screen -------------------------------
  // TODO: vervang door je eigen fotografie. Dit zijn nu bestaande beelden
  // uit assets/img/projects/ zodat je kunt zien of het effect werkt.
  photos: [
    'assets/img/projects/visdeurbel.webp',
    'assets/img/projects/d2d.webp',
    'assets/img/projects/HCD.webp'
  ]
};
