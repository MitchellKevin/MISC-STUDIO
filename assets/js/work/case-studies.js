// ------------------------------------------------------------------
// Case studies — the content behind case-study.html?project=<slug>.
//
// Every project card on the homepage (and the about page) links to
// detail-pages/work/case-study.html?project=<slug>, and that page reads
// its entry from here. Add a project by adding an entry, then point a
// .work-card in index.html at the same slug.
//
// Image paths are from the site root (same as index.html uses), so
// 'assets/img/projects/d2d.webp', not '../../assets/img/projects/d2d.webp'.
//
//   image    the shot that grows to fill the screen as you scroll, and is
//            shown again in full further down
//   gallery  optional: images that drift past the hero (four look best).
//            Leave it out and the hero is just the shot.
//   facts    the small label / value grid next to the intro
//   story    the three chapters under the full shot
//
// The copy below is a first draft written from the project names and
// the roadmap. Swap in the real story.
// ------------------------------------------------------------------
window.CASE_STUDIES = [
  {
    slug: 'scholtes-klusbedrijf',
    title: 'Scholtes Klusbedrijf',
    label: 'Client website',
    intro: 'A website for a local handyman business: what they do, the work they have done, and a quick way to ask for a quote.',
    image: 'assets/img/projects/scholtes-klusbedrijf.webp',
    live: 'https://mitchellkevin.github.io/scholtes-klusbedrijf/',
    facts: [
      { label: 'Type', value: 'Business website' },
      { label: 'Role', value: 'Design & development' },
      { label: 'Built with', value: 'HTML, CSS, JavaScript' },
    ],
    story: [
      { heading: 'The brief', body: 'A small business that mostly got work through word of mouth needed a place to send people: one page that explains the services and makes getting in touch easy.' },
      { heading: 'The approach', body: 'I kept the structure short and the calls to action obvious, and built it as a light static site so it loads fast on a phone in the middle of a job.' },
      { heading: 'The result', body: 'A clear, quick site the business can point every new customer to.' },
    ],
  },
  {
    slug: 'day-to-day',
    title: 'Day-to-Day',
    label: 'Venture',
    intro: 'The website for Day-to-Day, the software company I founded in 2025.',
    image: 'assets/img/projects/d2d.webp',
    live: 'https://www.day-to-day.nl/',
    facts: [
      { label: 'Year', value: '2025' },
      { label: 'Role', value: 'Founder, design & development' },
      { label: 'Type', value: 'Company website' },
    ],
    story: [
      { heading: 'The brief', body: 'A new company needs to explain what it does in a few seconds, and look like it can be trusted with someone else’s product.' },
      { heading: 'The approach', body: 'I designed and built the site myself, starting from the services and the people we wanted to reach, then letting the visual identity follow.' },
      { heading: 'The result', body: 'The front door of the company: where clients land, and where the work gets shown.' },
    ],
  },
  {
    slug: 'visdeurbel',
    title: 'Visdeurbel Datavis.',
    label: 'Data visualisation',
    intro: 'A data visualisation of the fish that ring the Utrecht fish doorbell: which species pass the lock, and when.',
    image: 'assets/img/projects/visdeurbel.webp',
    live: 'https://vis-b05f.onrender.com/',
    gallery: [
      { src: 'assets/img/projects/visdeurbel/schetsen-1.jpeg', alt: 'Early sketches for the visualisation' },
      { src: 'assets/img/projects/visdeurbel/canal-wall.jpg', alt: 'The canal wall at the lock' },
      { src: 'assets/img/projects/visdeurbel/schetsen-2.jpeg', alt: 'Sketches of the layout' },
      { src: 'assets/img/projects/visdeurbel/schetsen-3.jpeg', alt: 'Sketches of the fish species' },
    ],
    facts: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Concept, design & development' },
      { label: 'Type', value: 'Data visualisation' },
    ],
    story: [
      { heading: 'The brief', body: 'Thousands of people watch the fish doorbell camera and press the button for the lock keeper. The question was what all those sightings say once you put them together.' },
      { heading: 'The approach', body: 'I started on paper, sketching how species and seasons could share one view, then built it in the browser with the real data.' },
      { heading: 'The result', body: 'An interactive piece that lets you browse the species and see the pattern behind the sightings.' },
    ],
  },
  {
    // TODO: placeholder — add the live URL and the real copy.
    slug: 'ai-academy',
    title: 'AI Academy',
    label: 'Project',
    intro: 'AI Academy — case study coming soon.',
    image: 'assets/img/projects/ai-academy-salessite.jpg',
    facts: [
      { label: 'Role', value: 'Design & development' },
    ],
    story: [
      { heading: 'The brief', body: 'Coming soon.' },
      { heading: 'The approach', body: 'Coming soon.' },
      { heading: 'The result', body: 'Coming soon.' },
    ],
  },
  {
    slug: 'sron',
    title: 'SRON',
    label: 'Hackathon',
    intro: 'A space-themed site designed and built in the few days of a hackathon.',
    image: 'assets/img/projects/hackathon.webp',
    live: 'https://mitchellkevin.github.io/Space/',
    facts: [
      { label: 'Theme', value: 'Space' },
      { label: 'Role', value: 'Design & development' },
      { label: 'Timeframe', value: 'Hackathon' },
    ],
    story: [
      { heading: 'The brief', body: 'A theme, a deadline, and a working result at the end of it.' },
      { heading: 'The approach', body: 'Pick one idea early, cut everything that does not serve it, and get it running before making it pretty.' },
      { heading: 'The result', body: 'A finished, live site, built under time pressure.' },
    ],
  },
];
