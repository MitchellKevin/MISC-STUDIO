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
//            Leave it out and the hero is just the shot. A shot can add
//            video: 'assets/video/….mp4' to play a short muted loop, with
//            src as its poster (and the still for reduced motion).
//   theme    the project's own colours for its hero and accent, taken
//            from its palette: { surface: 'void' | 'light', bg, deep, glow,
//            accent, onAccent } — bg is the hero's ground, deep and glow
//            tint it, accent replaces the site blue across the page, and
//            onAccent is the text colour that sits on the accent
//   facts    the small label / value grid at the top of the story
//   story    the three chapters under the full shot
//
// Optional deeper sections, shown under the story only when present
// (see day-to-day-secure for a full example):
//   decisions  [{ label, heading, body, quote: { text, translation }, image, video, alt }]
//              text beside a screenshot, sides alternating; with video the
//              screenshot becomes a muted loop and image is its poster
//   system     { heading, body, colors: [{ name, hex }], fonts: [{ name, use }] }
//   structure  { heading, body, steps: [{ title, text }] }  numbered, in order
//   build      { heading, body, notes: [{ title, text }] }
//   figures    { heading, items: [{ value, unit, label }] }  big numbers
//
// The copy below is a first draft written from the project names and
// the roadmap. Swap in the real story.
// ------------------------------------------------------------------
window.CASE_STUDIES = [
  {
    slug: 'scholtes-klusbedrijf',
    title: 'Scholtes Klusbedrijf',
    label: 'Client website',
    intro: 'The website for Scholtes Klusbedrijf, a new handyman business in Hoofddorp. It is built as a technical drawing, because every job starts as a plan, and it has to win the first customers without any past work to show.',
    image: 'assets/img/projects/scholtes-klusbedrijf.webp',
    theme: { surface: 'void', bg: '#0D2B4A', deep: '#081D33', glow: '#7FD3FF', accent: '#FFB020', onAccent: '#081D33' },
    live: 'https://mitchellkevin.github.io/scholtes-klusbedrijf/',
    gallery: [
      { src: 'assets/img/projects/scholtes-klusbedrijf/mobile.webp', alt: 'The homepage on a phone, with the house below the headline' },
      { src: 'assets/img/projects/scholtes-klusbedrijf/flight.webp', video: 'assets/video/projects/scholtes-klusbedrijf/flight.mp4', alt: 'The work order folding up three times and flying off as a paper plane' },
      { src: 'assets/img/projects/scholtes-klusbedrijf/stamp.webp', video: 'assets/video/projects/scholtes-klusbedrijf/stamp.mp4', alt: 'The “Onderweg” stamp landing on the confirmation' },
      { src: 'assets/img/projects/scholtes-klusbedrijf/intro-offer.webp', alt: 'The block with the introductory offer for the first customers' },
    ],
    facts: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Design, copy & development' },
      { label: 'Audience', value: 'Homeowners around Hoofddorp' },
      { label: 'Built with', value: 'HTML, CSS, SVG, GSAP, d3' },
    ],
    story: [
      { heading: 'The brief', body: 'Dennis Scholte spent more than fifteen years as head of a technical department, responsible for everything that could break and everything that had to be made. In 2026 that turned into a handyman business of their own in Hoofddorp. The site had to bring in the first customers.' },
      { heading: 'The constraints', body: 'A brand-new business has none of the usual proof: no photos of finished jobs, no reviews, no list of clients. The people it serves are homeowners in the Haarlemmermeer with four questions: can you do this job, do you come to me, what will it cost, and how do I ask? The site had to answer all four and still look trustworthy, without inventing proof.' },
      { heading: 'The approach', body: 'I built the whole site as one technical drawing: a blueprint grid, an exploded drawing of a house, dimension lines, spec codes on every service and a title block in the footer. It is the strongest thing the business has, someone who plans the job before picking up a tool. The copy is plain Dutch in the first person, because the customer deals with one person. The decisions below show how that played out.' },
    ],

    decisions: [
      {
        label: 'The hero',
        heading: 'The house is the menu.',
        body: 'The hero is an exploded drawing of a house: the garden, the ground floor, the first floor and the roof lifted apart, with pins between them like an assembly drawing. Six cards point at the part of the house each service covers, from the bathroom for plumbing to the fence for the garden. Hover a card and that part of the house lights up in safety yellow; click it and the page jumps to the service. On load, the layers drop into place one by one.',
        quote: { text: 'Van tekening naar werk.', translation: 'From drawing to work.' },
        image: 'assets/img/projects/scholtes-klusbedrijf/hero-house.webp',
        video: 'assets/video/projects/scholtes-klusbedrijf/hero-house.mp4',
        alt: 'The exploded house assembling layer by layer, then three service cards lighting up their part of the house',
      },
      {
        label: 'Services',
        heading: 'A service list that reads like a spec sheet.',
        body: 'Six services in a grid, each with a code from SVC-001 to SVC-006, one line of plain text and a tool drawn in thin lines. It reads like a parts list on a drawing, which says “organised” before anyone reads a word. The range runs from a dripping tap to a full renovation, and a line underneath invites anything that is not on the list.',
        quote: { text: 'Alles wat blijft liggen, pak ik op.', translation: 'Everything that keeps getting put off, I pick up.' },
        image: 'assets/img/projects/scholtes-klusbedrijf/services.webp',
        video: 'assets/video/projects/scholtes-klusbedrijf/services.mp4',
        alt: 'The services grid with codes SVC-001 to SVC-006, each card lighting up as the cursor passes',
      },
      {
        label: 'For a first customer',
        heading: 'New as a business, not new to the trade.',
        body: 'There are no past jobs to show, so the site says so and leans on what is true: fifteen years of experience, free advice at home and an introductory rate for the first customers. The four-step process ends each step with a stamp, such as “no surprises” and “delivered means cleaned up”, so the customer knows what happens before they ask.',
        quote: { text: 'Nieuw als ondernemer, niet nieuw in het vak.', translation: 'New as a business owner, not new to the trade.' },
        image: 'assets/img/projects/scholtes-klusbedrijf/process.webp',
        alt: 'The four steps from request to finished job, each with a stamp',
      },
      {
        label: 'Service area',
        heading: 'Answer “do you come to me?” at a glance.',
        body: 'A d3 radar puts Hoofddorp in the centre with rings at 5, 10 and 15 kilometres, and eight nearby towns placed by their real direction and distance. The rings grow in, the towns appear one by one and a sweep line turns, like a radar screen. Next to it, the towns are listed as tags, and a dashed circle says that further away is open to discussion.',
        quote: { text: 'Snel ter plaatse in de regio.', translation: 'Quickly on site in the region.' },
        image: 'assets/img/projects/scholtes-klusbedrijf/area.webp',
        video: 'assets/video/projects/scholtes-klusbedrijf/area.mp4',
        alt: 'The radar map around Hoofddorp drawing itself: rings grow, towns appear and the sweep line turns',
      },
      {
        label: 'The quote request',
        heading: 'Asking for a quote is filling in a work order.',
        body: 'The contact form is a numbered work order, with the type of job picked from the same six services. When it is sent, the order folds in half three times, turns into a paper plane and flies off along a dashed route marked “Destination: Hoofddorp”, and a stamp lands on the confirmation. Behind the animation the request really goes out, to a form service or as a ready-made email. If sending fails, the card says so and keeps everything filled in.',
        quote: { text: 'Beschrijf kort wat er moet gebeuren. Je hoort binnen 24 uur van me.', translation: 'Describe briefly what needs doing. You’ll hear from me within 24 hours.' },
        image: 'assets/img/projects/scholtes-klusbedrijf/work-order.webp',
        video: 'assets/video/projects/scholtes-klusbedrijf/work-order.mp4',
        alt: 'The filled-in work order being sent: it folds up, flies off as a paper plane and the confirmation is stamped',
      },
    ],

    system: {
      heading: 'Blueprint blue, chalk white and one safety yellow.',
      body: 'The palette comes from the drawing table and the building site. A deep blueprint blue is the paper, chalk white and cyan are the lines, and safety yellow, the colour of tape measures and site signs, carries every action, every highlight and the part of the house you point at. A muted steel blue softens the second half of the headline.',
      colors: [
        { name: 'Blueprint', hex: '#0D2B4A' },
        { name: 'Deep blue', hex: '#081D33' },
        { name: 'Chalk', hex: '#EAF2FA' },
        { name: 'Line cyan', hex: '#7FD3FF' },
        { name: 'Safety yellow', hex: '#FFB020' },
        { name: 'Steel', hex: '#9FB4C7' },
        { name: 'Muted steel', hex: '#6F8CA8' },
      ],
      fonts: [
        { name: 'Big Shoulders Display', use: 'Headings, condensed like signage on a site' },
        { name: 'Space Grotesk', use: 'Body text' },
        { name: 'JetBrains Mono', use: 'Spec codes, labels and the title block' },
        { name: 'Caveat', use: 'The handwritten caption on the photo' },
      ],
    },

    structure: {
      heading: 'Eight sections, in the order a homeowner asks.',
      body: 'Can you do it, how does it work, who are you, do you come to me, and how do I ask? The page answers in that order and ends at the form.',
      steps: [
        { title: 'Hero', text: 'The promise, the exploded house with the six services, and two buttons: request a quote or see the services.' },
        { title: 'Services', text: 'Six services as a spec sheet, from small repairs to renovation.' },
        { title: 'Process', text: 'Four steps from request to finished job, each with its stamp.' },
        { title: 'About', text: 'Who will show up at the door: fifteen years of technical work, no team in between.' },
        { title: 'Intro offer', text: 'New business, experienced hands: free advice and an introductory rate.' },
        { title: 'Service area', text: 'The radar around Hoofddorp, with a 15 km radius and the towns as tags.' },
        { title: 'Questions', text: 'Six short answers about price, small jobs, the area and who does the work.' },
        { title: 'Work order', text: 'The form, the three next steps and a direct email for anyone who would rather write.' },
      ],
    },

    build: {
      heading: 'Three files and no build step.',
      body: 'The site is one HTML file, one stylesheet and one script, with GSAP and d3 loaded from a CDN. That keeps it cheap to host, easy to hand over and quick to change while the business finds its feet.',
      notes: [
        { title: 'A drawing that is generated', text: 'The exploded house comes from a small Python script with an isometric projection. Every wall, bed and fence post is a 3D box that becomes three shaded faces, painted back to front. Change a size, run it again, and every face and leader line follows.' },
        { title: 'A fold you can follow', text: 'On send, the filled-in form is copied into slices that hinge in 3D, with crease shadows, three folds in a row. The folded packet is swapped for an SVG plane that flies along a curved GSAP motion path while its wings flutter.' },
        { title: 'A radar from real distances', text: 'The towns are placed by direction and distance from Hoofddorp, at a fixed scale of 14 pixels per kilometre. The map draws itself once it scrolls into view.' },
        { title: 'Contact details in one place', text: 'Phone, email, Chamber of Commerce number and the form address live in one settings object. Anything left empty stays hidden, so the site never shows a placeholder number.' },
        { title: 'Motion with an off switch', text: 'Visitors who prefer reduced motion get the house already assembled, visible sections, a still map and the confirmation straight away instead of the paper plane.' },
        { title: 'Works without the extras', text: 'If a script from the CDN fails to load, every section stays visible and the work order still sends. Only the animation is lost.' },
      ],
    },

    figures: {
      heading: 'One page that does the job of a portfolio.',
      items: [
        { value: '6', label: 'Services, from a dripping tap to a renovation' },
        { value: '4', unit: 'layers', label: 'From garden to roof in the exploded house' },
        { value: '3', unit: 'folds', label: 'From work order to paper plane' },
        { value: '0', label: 'Build steps: one HTML, CSS and JS file' },
      ],
    },
  },
  // {
  //   slug: 'day-to-day',
  //   title: 'Day-to-Day',
  //   label: 'Venture',
  //   intro: 'The website for Day-to-Day, the software company I founded in 2025.',
  //   image: 'assets/img/projects/d2d.webp',
  //   live: 'https://www.day-to-day.nl/',
  //   facts: [
  //     { label: 'Year', value: '2025' },
  //     { label: 'Role', value: 'Founder, design & development' },
  //     { label: 'Type', value: 'Company website' },
  //   ],
  //   story: [
  //     { heading: 'The brief', body: 'A new company needs to explain what it does in a few seconds, and look like it can be trusted with someone else’s product.' },
  //     { heading: 'The approach', body: 'I designed and built the site myself, starting from the services and the people we wanted to reach, then letting the visual identity follow.' },
  //     { heading: 'The result', body: 'The front door of the company: where clients land, and where the work gets shown.' },
  //   ],
  // },
  {
    // TODO: add `live:` once the sales site has its public address.
    slug: 'day-to-day-secure',
    title: 'day-to-day secure',
    label: 'Sales site',
    intro: 'The sales site for day-to-day secure, the website scanner from my company Day-to-Day. It sells security, EU-rules and uptime monitoring to web agencies, and shows the real product from the first scroll.',
    image: 'assets/img/projects/day-to-day-secure.webp',
    theme: { surface: 'void', bg: '#000000', deep: '#121216', glow: '#0022FF', accent: '#0022FF', onAccent: '#FFFFFF' },
    gallery: [
      { src: 'assets/img/projects/day-to-day-secure/mobile.webp', video: 'assets/video/projects/day-to-day-secure/mobile.mp4', alt: 'On a phone: the headline comes in, then the page scrolls down to the real mobile dashboard counting up' },
      { src: 'assets/img/projects/day-to-day-secure/agency.webp', video: 'assets/video/projects/day-to-day-secure/agency.mp4', alt: 'The nine agency features fading up as the page scrolls' },
      { src: 'assets/img/projects/day-to-day-secure/check-wordpress.webp', alt: 'Check card for software and WordPress, with its check IDs' },
      { src: 'assets/img/projects/day-to-day-secure/check-privacy.webp', alt: 'EU check card for privacy and cookies, with its check IDs' },
    ],
    facts: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Design, copy & development' },
      { label: 'Audience', value: 'Dutch web agencies' },
      { label: 'Built with', value: 'Next.js, SCSS, d3, Framer Motion' },
    ],
    story: [
      { heading: 'The brief', body: 'day-to-day secure checks websites for the security mistakes that most often lead to a leak, and keeps every client site in one dashboard. Since the second version it also checks EU rules, from accessibility to cookies, and watches whether each site is up. It is sold to web agencies, and each agency has three people to convince: the developer who fixes things, the project manager who plans the work, and the client who pays. Most security marketing talks to the first and scares the other two.' },
      { heading: 'The constraints', body: 'No jargon: the product turns HTTP headers and cookie flags into a grade from A to F, and the site had to read as easily for a bakery owner as for a backend developer. Visibly careful: the deep scan actively tests sites, so the site had to look precise and restrained. And one address: the sales page lives on the app’s own homepage, inside its strict security policy.' },
      { heading: 'The approach', body: 'I built the page around evidence instead of claims. Every visual is the product itself or a sample of its output, clearly labelled as a sample. The copy is plain Dutch, and each section is written for one of the three readers. When the platform grew, the second version gave EU rules, monitoring and the agency tools the same treatment, without making the page any louder. The decisions below show how that played out.' },
    ],

    decisions: [
      {
        label: 'The hero',
        heading: 'Show the real product first.',
        body: 'The hero renders the actual dashboard, built from the app’s own components and filled with demo data. The headline comes in first; as you scroll, the dashboard tilts up flat, its numbers count up and its charts draw in. On a phone it switches to the real mobile layout.',
        quote: { text: 'Vind de lekken voordat een ander het doet.', translation: 'Find the leaks before someone else does.' },
        image: 'assets/img/projects/day-to-day-secure/dashboard.webp',
        video: 'assets/video/projects/day-to-day-secure/dashboard.mp4',
        alt: 'The headline coming in, then the dashboard tilting up flat as the page scrolls, its numbers counting up',
      },
      {
        label: 'For developers',
        heading: 'Every finding comes with its fix.',
        body: 'Developers are won over by detail. Each sample finding names the risk in one sentence and shows the exact configuration line for their platform, with tabs for Nginx, Vercel, Next.js and Cloudflare. Check IDs stay in mono, as they appear in the tool, and one click turns a finding into a task in Jira, Trello, Asana or GitHub.',
        quote: { text: 'Niet alleen wat er mis is, maar hoe je het oplost.', translation: 'Not just what’s wrong, but how to fix it.' },
        image: 'assets/img/projects/day-to-day-secure/fix.webp',
        alt: 'A sample finding with the fix for each platform',
      },
      {
        label: 'For project managers and clients',
        heading: 'One report everyone understands.',
        body: 'The sample report leads with a single grade and a short to-do list in everyday language, including roughly how long each fix takes. It comes in the agency’s own house style, in Dutch or English, and lands in the client’s inbox every month without anyone sending it. Further down, a three-column strip shows what the developer, the project manager and the client each get from the same scan.',
        quote: { text: 'Een rapport dat iedereen begrijpt.', translation: 'A report everyone understands.' },
        image: 'assets/img/projects/day-to-day-secure/report.webp',
        alt: 'The sample client report with grade B and two to-dos',
      },
      {
        label: 'EU rules',
        heading: 'Secure, and by the rules.',
        body: 'The second version added seventeen checks for EU rules: accessibility under the European Accessibility Act, trackers and cookies set before consent, and the business details a Dutch site has to show. Each area gets its own score, apart from the security grade, and the card says plainly what it is: an automatic indication, not a legal review. That honesty is the selling point, because it starts the conversation an agency wants to have with its client.',
        quote: { text: 'Niet alleen veilig, maar ook volgens de regels.', translation: 'Not just secure, but by the rules.' },
        image: 'assets/img/projects/day-to-day-secure/compliance.webp',
        alt: 'The EU-rules card with a score for accessibility, privacy and business details',
      },
      {
        label: 'Monitoring',
        heading: 'Sell the phone call that never comes.',
        body: 'Every client site is checked every five minutes, and certificates and domain names are watched before they expire. The card shows each site as a row of thirty checks, green until one is not, with the warnings in the same orange as the product. One picture of a calm Monday morning sells the Pro plan better than a list of features.',
        quote: { text: 'Weet het eerder dan je klant.', translation: 'Know before your client does.' },
        image: 'assets/img/projects/day-to-day-secure/monitoring.webp',
        alt: 'The monitoring card: four client sites with their uptime, one offline, and two certificates about to expire',
      },
      {
        label: 'For the careful buyer',
        heading: 'Make restraint visible.',
        body: 'The deep scan is the premium feature and the riskiest one, because it actively tests a site for SQL injection, XSS and twelve other attack classes. Instead of hiding that, the page shows the safeguards: the owner types the domain to confirm, tests run one class at a time, and a footer line spells out the limits.',
        quote: { text: 'Ga verder dan wat zichtbaar is.', translation: 'Go beyond what you can see.' },
        image: 'assets/img/projects/day-to-day-secure/deep-scan.webp',
        alt: 'The deep scan card with the owner’s confirmation',
      },
      {
        label: 'For the agency owner',
        heading: 'Proof as a picture.',
        body: 'Agencies buy results they can show their clients. A d3 dumbbell chart plots each client site’s score at the first scan and today, over the same grade bands the scanner uses: A from 90, B from 75, C from 60, D from 40. When it scrolls into view the dots slide from then to now, and hovering a site shows both grades and how many problems were fixed. It is marked as demo data, and its weakest sites match the dashboard in the hero.',
        quote: { text: 'Laat zien wat je werk oplevert.', translation: 'Show what your work delivers.' },
        image: 'assets/img/projects/day-to-day-secure/score-chart.webp',
        video: 'assets/video/projects/day-to-day-secure/score-chart.mp4',
        alt: 'The before-and-after chart drawing in, then a cursor reading three client sites',
      },
      {
        label: 'Pricing',
        heading: 'Pay per site, not per seat.',
        body: 'Agencies think in client sites, so the price does too. A slider asks how many sites you manage and works out the monthly total for every plan as you drag; past one site, the single-site Starter plan steps back. Starter is €5 a month for one site, Pro €15 and Bureau €25 per site, with the whole team included.',
        quote: { text: 'Betaal per site, niet per stoel.', translation: 'Pay per site, not per seat.' },
        image: 'assets/img/projects/day-to-day-secure/pricing.webp',
        video: 'assets/video/projects/day-to-day-secure/pricing.mp4',
        alt: 'The pricing slider dragged from 10 sites down to 1 and up to 50, the monthly totals following',
      },
    ],

    system: {
      heading: 'Black ground, one signal blue, and a traffic light.',
      body: 'The site is dark-only, so the dashboard previews sit on it naturally. A single saturated blue carries every action and highlight. Green, orange and red are kept for status alone, so a colour always means the same thing on the site as it does in the product.',
      colors: [
        { name: 'Ground', hex: '#000000' },
        { name: 'Surface', hex: '#0A0A0C' },
        { name: 'Signal blue', hex: '#0022FF' },
        { name: 'Blue ink', hex: '#8090FF' },
        { name: 'Pass', hex: '#3CCF7A' },
        { name: 'Warning', hex: '#F0A43A' },
        { name: 'Problem', hex: '#F06B6B' },
      ],
      fonts: [
        { name: 'Inter', use: 'Headings and body text' },
        { name: 'Geist Mono', use: 'Check IDs, code and labels' },
      ],
    },

    structure: {
      heading: 'Ten sections, in the order a buyer asks questions.',
      body: 'What is it, does it cover my clients’ sites, what will my client see, and what does it cost? Each section answers the next question.',
      steps: [
        { title: 'Hero', text: 'The headline, then the live dashboard tilting into view.' },
        { title: 'Platform', text: 'Three promises: passive and safe, any stack, all client sites in one view.' },
        { title: 'Features', text: 'Fixes for developers, reports for clients, EU rules, monitoring and the deep scan.' },
        { title: 'Checks', text: 'All 28 security checks in six groups and 17 EU checks in three, with their real IDs.' },
        { title: 'For agencies', text: 'Nine tools for running client sites: house style, monthly reports, team roles, tasks and status pages.' },
        { title: 'Stack', text: 'A logo marquee of the platforms each fix is written for.' },
        { title: 'Reporting', text: 'One scan, three readers, and the before-and-after chart.' },
        { title: 'In figures', text: '45 checks, 14 attack classes, 5 minutes between uptime checks, €5 for a first site.' },
        { title: 'Pricing', text: 'A slider that works out the monthly price per site, and three plans.' },
        { title: 'Close', text: 'Add your first client site and see where it stands.' },
      ],
    },

    build: {
      heading: 'A security product’s site has to pass its own scan.',
      body: 'I built the page inside the product’s Next.js app instead of on a separate site builder. That kept one address and one deploy, kept the app’s strict security headers, and let the hero reuse the real dashboard components.',
      notes: [
        { title: 'One address for both', text: 'Logged-out visitors get the sales page on the homepage; logged-in users get their overview at the same URL. Only the homepage is indexed.' },
        { title: 'The real dashboard, scaled', text: 'The hero renders the app’s own components at a desktop, tablet or phone width, then scales them to fit. Phones see the real mobile layout.' },
        { title: 'Strict content policy', text: 'A per-request nonce CSP, fonts served from the same origin, and zero requests to third parties.' },
        { title: 'Isolated theme', text: 'The dark sales-page colours are scoped to one root element, so the app’s light and dark themes and the sales page never affect each other.' },
        { title: 'Two languages', text: 'The app and the client reports switch between Dutch and English, and the page’s navigation follows. The sales copy itself stays Dutch, for its Dutch audience.' },
        { title: 'Accessible by default', text: 'Decorative previews are inert and hidden from screen readers. Chart tooltips are built from text, never from markup, and the chart can be read as a table.' },
        { title: 'Motion with an off switch', text: 'Numbers count up and charts draw in once, when they scroll into view, and sections fade up with pure CSS scroll timelines. All of it stays still for visitors who prefer reduced motion.' },
      ],
    },

    figures: {
      heading: 'Launched in two days, rebuilt for the bigger platform five days later.',
      items: [
        { value: '2', unit: 'days', label: 'From first commit to a responsive launch, 11 to 12 November 2026' },
        { value: '45', label: 'Checks shown on the page, security and EU rules' },
        { value: '10', label: 'Sections, each answering one buyer question' },
        { value: '0', label: 'Third-party requests on page load' },
      ],
    },
  },
  {
    slug: 'visdeurbel',
    title: 'Visdeurbel Datavis.',
    label: 'Data visualisation',
    intro: 'A scrolling data story for the Visdeurbel, Utrecht’s fish doorbell. It turns one month of rings, visitors and fish into an aquarium, a sonar, a cloud of languages and a set of bubbles. The page was built by a team of four; these are my chapters.',
    image: 'assets/img/projects/visdeurbel.webp',
    theme: { surface: 'void', bg: '#01463C', deep: '#01302A', glow: '#1EACB0', accent: '#C0A8FF', onAccent: '#01463C' },
    live: 'https://vis-b05f.onrender.com/',
    gallery: [
      { src: 'assets/img/projects/visdeurbel/mobile.webp', video: 'assets/video/projects/visdeurbel/mobile.mp4', alt: 'The aquarium chapter on a phone: a tap scares the fish, and the catfish and eel are switched off and on again' },
      { src: 'assets/img/projects/visdeurbel/schetsen-1.jpeg', alt: 'First sketches: swimming fish, bubbles per species and a rotating sonar' },
      { src: 'assets/img/projects/visdeurbel/mobile-radar.webp', video: 'assets/video/projects/visdeurbel/mobile-radar.mp4', alt: 'The sonar chapter on a phone, with the time slider dragged through the weeks while the pings glide' },
      { src: 'assets/img/projects/visdeurbel/languages.webp', alt: 'The word for fish in every visitor language, sized by visitors' },
    ],
    facts: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Concept, design & development of five chapters' },
      { label: 'Client', value: 'Studio MOAN, for the CMD final project' },
      { label: 'Built with', value: 'React, D3, GSAP, Python' },
    ],
    story: [
      { heading: 'The brief', body: 'The Visdeurbel is a live underwater camera at a lock in Utrecht. When viewers see a fish waiting, they ring the bell and the lock keeper lets it through. For our final project at CMD Amsterdam, Studio MOAN asked a team of four students to show what all those rings say once you put them together, on one scrolling page.' },
      { heading: 'The constraints', body: 'One month of the doorbell is a 288 MB event log, far too big for a browser. The audience is the same people who watch the camera for fun, so the page had to feel playful, not like a dashboard. And the log records that a fish was reported, not which fish. The rings, countries, languages and hours are real; the split per species is an illustrative estimate scaled to the real number of reports.' },
      { heading: 'The approach', body: 'I started on paper with swimming fish, bubbles per species and a rotating sonar, then built each idea as a chapter that draws itself as you scroll into it. I prototyped more than ten chapters, from a ring calendar to a tide wave and a pond that replays a week, and cut them back to five that each answer one question. The decisions below show how that played out.' },
    ],

    decisions: [
      {
        label: 'The opener',
        heading: 'Start with numbers anyone can repeat.',
        body: 'Before any chart, a carousel of eight facts reads the dataset and turns it into sentences with the key number in purple: how often the bell rang, how many people rang it, the most fanatic ringer, the busiest hour. A question-mark button opens a one-line note on where each number comes from, so the claims stay checkable without cluttering the slide.',
        quote: { text: 'De Visdeurbel in cijfers.', translation: 'The fish doorbell in numbers.' },
        image: 'assets/img/projects/visdeurbel/facts.webp',
        video: 'assets/video/projects/visdeurbel/facts.mp4',
        alt: 'The facts carousel stepping through its slides, with the source note opened under 33,748 people pressing the button 49,736 times',
      },
      {
        label: 'The aquarium',
        heading: 'Make the total feel alive.',
        body: 'Nobody can picture 49,736 reports, so the aquarium shows a sample of 80 fish, with each species getting its share of the real total. Size follows the cube root of weight, so a catfish is big without filling the tank. Chips switch species on and off, hovering names a fish and its length, and a click sends a ripple through the water that scares nearby fish away.',
        quote: { text: 'Dit is hoe 49.736 waarnemingen er ongeveer uitzien.', translation: 'This is roughly what 49,736 sightings look like.' },
        image: 'assets/img/projects/visdeurbel/aquarium.webp',
        video: 'assets/video/projects/visdeurbel/aquarium.mp4',
        alt: 'The aquarium: hovering names a catfish, a click scares the fish apart, and two species are filtered out and back in',
      },
      {
        label: 'The sonar',
        heading: 'A radar for what is under the lock.',
        body: 'Each species is a ping on a sonar, and the more often it was seen, the closer it sits to the centre. A sweep line lights the pings as it passes. A slider steps through the month week by week, and the pings glide in and out as their counts change. The layout is seeded, so the same species is always in the same direction and you can follow it through time.',
        quote: { text: 'Wat zwemt er onder de sluis?', translation: 'What is swimming under the lock?' },
        image: 'assets/img/projects/visdeurbel/radar.webp',
        video: 'assets/video/projects/visdeurbel/radar.mp4',
        alt: 'The sonar: the slider steps through the weeks as the pings glide, and the bleak is highlighted at 505 sightings in week 3',
      },
      {
        label: 'The languages',
        heading: 'Every visitor’s language, as its word for fish.',
        body: 'The doorbell has a worldwide audience, and the browser language shows it. Each language appears as its own word for fish, sized by the number of visitors, from Fish, Ryba and Fisch down to 魚 and Kala. A force simulation lets the words drift together without overlapping, and hovering one shows its exact count and share.',
        quote: { text: 'De sluis spreekt vele talen tegelijk.', translation: 'The lock speaks many languages at once.' },
        image: 'assets/img/projects/visdeurbel/languages.webp',
        video: 'assets/video/projects/visdeurbel/languages.mp4',
        alt: 'The word for fish in 26 languages drifting into place, with English, Polish, German and Japanese hovered for their visitor counts',
      },
      {
        label: 'The bubbles',
        heading: 'Count, weight, or both.',
        body: 'The last chapter packs every species into a bubble and asks a better question than “which fish is most common?”. Switch between number of sightings, weight per fish and biomass, and the bubbles resize and slide to their new places. On biomass, a handful of catfish outweighs a whole school of roach.',
        quote: { text: 'Elke soort, een eigen bel.', translation: 'Every species, a bubble of its own.' },
        image: 'assets/img/projects/visdeurbel/net.webp',
        video: 'assets/video/projects/visdeurbel/net.mp4',
        alt: 'The bubbles resizing from count to weight per fish and back to biomass, where the catfish is the largest bubble',
      },
    ],

    system: {
      heading: 'The Visdeurbel’s own colours, under water.',
      body: 'The chapters use the existing Visdeurbel identity from Studio MOAN’s design file, so the page feels like part of the doorbell site. Deep green carries the text, purple marks every key number, and each chapter gets its own background, joined by drifting waves like on visdeurbel.nl. Scrolling down feels like moving through layers of water.',
      colors: [
        { name: 'Dark green', hex: '#01463C' },
        { name: 'Teal', hex: '#1EACB0' },
        { name: 'Purple', hex: '#C0A8FF' },
        { name: 'Bell purple', hex: '#9B74FF' },
        { name: 'Pink', hex: '#FF80B9' },
        { name: 'Gold', hex: '#F0AF00' },
        { name: 'Light gold', hex: '#F8E7CD' },
        { name: 'Off-white', hex: '#FDF7EF' },
      ],
      fonts: [
        { name: 'Bricolage Grotesque', use: 'Headings, key numbers and the language cloud' },
        { name: 'PT Sans', use: 'Body text, labels and tooltips' },
      ],
    },

    structure: {
      heading: 'Five chapters, from the big number to the single fish.',
      body: 'The chapters go from the whole picture to the detail: how big is it, what does it look like, what lives there, who is watching, and what does it weigh?',
      steps: [
        { title: 'In numbers', text: 'Eight facts about one month of the doorbell, each with its source.' },
        { title: 'Aquarium', text: '80 fish in proportion to the real reports, with filters and a scare effect.' },
        { title: 'Sonar', text: 'Twelve species as pings, with a slider through the weeks.' },
        { title: 'Languages', text: 'The word for fish in 26 languages, sized by visitors.' },
        { title: 'Bubbles', text: 'Every species by count, weight per fish or biomass.' },
      ],
    },

    build: {
      heading: '288 MB of events, 40 KB in the browser.',
      body: 'The page is a React app with Vite. The chapters are drawn with D3 on SVG and canvas, and GSAP drives the guide fish. A Python script does the heavy work before anything reaches the browser.',
      notes: [
        { title: 'Count before the browser', text: 'A Python script reads the raw event log line by line and counts everything the chapters need, by country, language, hour and day. Each period becomes a JSON file of about 40 KB.' },
        { title: 'Draw on arrival', text: 'Each chapter registers a draw function under its section id. One IntersectionObserver calls it the first time the section scrolls into view, and canvas animations pause again when they leave it.' },
        { title: 'One switch for every chapter', text: 'A Week, Month and Year switch cancels every running animation and observer, clears the chapters and loads the other dataset, after which each chapter redraws as you reach it. The full year is too big to load, so the year view is an estimate built from the month.' },
        { title: 'A guide that swims along', text: 'A small perch follows you down the page. Every frame it finds the chart nearest the middle of the screen and circles it, with the angle tied to your scroll position. When no chart is in view, it bobs in the corner.' },
        { title: 'One image per species', text: 'Each fish is a single greyscale photo, tinted per pixel in its species colour on an offscreen canvas and cached, so the aquarium draws 80 fish every frame without loading 80 images.' },
        { title: 'Accessible and calm', text: 'Every ping, bubble and word can be reached with the keyboard and has a spoken label, and summaries update in live regions. With reduced motion, the guide fish stays away, the simulations settle at once and the transitions are skipped.' },
      ],
    },

    figures: {
      heading: 'One month of the doorbell, in five chapters.',
      items: [
        { value: '49.7', unit: 'K', label: 'Rings, from 18 April to 18 May 2026' },
        { value: '159', label: 'Countries watching the camera' },
        { value: '26', label: 'Visitor languages in the cloud' },
        { value: '40', unit: 'KB', label: 'Of data in the browser, down from 288 MB of raw events' },
      ],
    },
  },
  {
    // TODO: add `live:` once the site has its public address.
    slug: 'ai-academy',
    title: 'AI Academy',
    label: 'Sales site',
    intro: 'The sales site for AI Academy, a learning platform that teaches design and development teams to work with AI. It gives the team lead, the manager and the privacy officer each their reason to say yes.',
    image: 'assets/img/projects/ai-academy-salessite.webp',
    theme: { surface: 'light', bg: '#F3F6FB', deep: '#E8EEFC', glow: '#FFFFFF', accent: '#1D4ED8', onAccent: '#FFFFFF' },
    gallery: [
      { src: 'assets/img/projects/ai-academy/mobile-home.webp', alt: 'The homepage on a phone' },
      { src: 'assets/img/projects/ai-academy/calculator.webp', alt: 'The seat calculator on the pricing page' },
      { src: 'assets/img/projects/ai-academy/help.webp', alt: 'The help centre with search and topics' },
      { src: 'assets/img/projects/ai-academy/mobile-demo.webp', alt: 'The demo request form on a phone' },
    ],
    facts: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Design, copy & development' },
      { label: 'Audience', value: 'Dutch design and development teams' },
      { label: 'Built with', value: 'Next.js, SCSS, MongoDB' },
    ],
    story: [
      { heading: 'The brief', body: 'AI Academy teaches whole teams to work with AI. Everyone starts with the shared course AI 101, then designers move on to UI/UX Design and developers to Software Development. Chapters take 20 to 30 minutes and end in an exam and a certificate anyone can verify. The site had to sell that to teams, not to individuals.' },
      { heading: 'The constraints', body: 'The person who finds the site is rarely the one who signs. A team lead gets interested, L&D wants to know what they will be able to see, and in a Dutch organisation the privacy officer has a say before anything with “AI” in its name goes live. All three had to find their answer without being pushed into a sales call first.' },
      { heading: 'The approach', body: 'I built the site around three things: show the real product, put the price where anyone can work it out, and keep every promise small and specific. The copy is plain Dutch throughout, including the legal pages. The decisions below show how that played out.' },
    ],

    decisions: [
      {
        label: 'The hero',
        heading: 'The product is the picture.',
        body: 'There are no stock photos or blurred mock-ups. Next to the headline sits a small version of the learner’s dashboard, built in HTML and CSS from the app’s own design tokens, with a streak, points, the next chapter and an earned certificate. The example figures are fixed in code, so the marketing site can never show real user data.',
        quote: { text: 'Leer je team effectief en verantwoord werken met AI.', translation: 'Teach your team to work with AI effectively and responsibly.' },
        image: 'assets/img/projects/ai-academy/hero.webp',
        alt: 'The homepage hero with the dashboard preview',
      },
      {
        label: 'For the team lead',
        heading: 'Every feature shows itself.',
        body: 'The feature grid gives each card its own small piece of interface: a prompt with feedback, a question to the AI tutor, team progress bars, a certificate check and the two single sign-on options. The practice environment gets the wide card, because practising with real AI is what sets the product apart from a video course.',
        quote: { text: 'Geen losse video’s, maar een platform waarin je leest, oefent en laat zien wat je kunt.', translation: 'Not loose videos, but a platform where you read, practise and show what you can do.' },
        image: 'assets/img/projects/ai-academy/features.webp',
        alt: 'The feature grid with small product previews',
      },
      {
        label: 'For managers and L&D',
        heading: 'The buyer gets a section of their own.',
        body: 'Managers usually hold the budget, so the homepage shows them the team view: who is done, who is on track and who is behind, a deadline, and a toast confirming that a reminder went out in Slack. Status is shown as a coloured label, so the table reads at a glance.',
        quote: { text: 'Zie hoe je team groeit, zonder spreadsheets.', translation: 'See your team grow, without spreadsheets.' },
        image: 'assets/img/projects/ai-academy/managers.webp',
        alt: 'The manager section with a team progress table',
      },
      {
        label: 'Pricing',
        heading: 'A price anyone can work out alone.',
        body: 'There are three plans and one price per user per month, with every learning path included. A toggle switches to yearly billing at 20% off, and prices are shown without VAT, the way Dutch businesses compare them. Below the plans, a seat calculator answers the question a team lead will be asked first: what will it cost for our team? It also warns when a team is too big for the chosen plan.',
        quote: { text: 'Eén prijs per gebruiker, alle leerpaden inbegrepen.', translation: 'One price per user, all learning paths included.' },
        image: 'assets/img/projects/ai-academy/pricing.webp',
        alt: 'The pricing page with Starter, Team and Enterprise',
      },
      {
        label: 'The demo request',
        heading: 'Say exactly what happens next.',
        body: 'The form asks for a work address, team size and role, and politely turns away Gmail and other free addresses so the team knows which organisation is asking. A plan picked on the pricing page is filled in already. Beside the form, three numbered steps spell out what follows: a reply within one working day, a 30-minute demo, and 14 days free without a credit card.',
        quote: { text: 'Geen verkooppraatje aan de telefoon.', translation: 'No sales pitch over the phone.' },
        image: 'assets/img/projects/ai-academy/demo.webp',
        alt: 'The demo request form with the three next steps',
      },
    ],

    system: {
      heading: 'A calm, light interface with one blue for action.',
      body: 'The sales site and the learning app share one set of tokens and one component kit, so someone who books a demo sees the same interface on the other side. One deep blue carries every action. Status colours come from the same muted range, so nothing shouts.',
      colors: [
        { name: 'Ink', hex: '#0F172A' },
        { name: 'Body', hex: '#334155' },
        { name: 'Canvas', hex: '#F3F6FB' },
        { name: 'Brand blue', hex: '#1D4ED8' },
        { name: 'Blue soft', hex: '#E8EEFC' },
        { name: 'Success', hex: '#15803D' },
        { name: 'Warning', hex: '#B45309' },
      ],
      fonts: [
        { name: 'Instrument Sans', use: 'Headings, body text and the interface' },
        { name: 'JetBrains Mono', use: 'Prompts and certificate numbers' },
      ],
    },

    structure: {
      heading: 'Eight pages, each with one job.',
      body: 'The homepage makes the case, and the other pages answer the questions that come after it: what does it cost, how do we start, and what happens to our data?',
      steps: [
        { title: 'Home', text: 'The learning paths, the product, the manager view and the questions people ask most.' },
        { title: 'Pricing', text: 'Three plans, the seat calculator, a full comparison and billing questions.' },
        { title: 'Demo', text: 'A short form and the three steps that follow.' },
        { title: 'Help centre', text: '11 articles in 5 topics, with search that ignores accents. Press “/” to jump to it.' },
        { title: 'Privacy', text: 'What is stored, where, and for how long.' },
        { title: 'Terms', text: 'The terms and conditions, in the same plain Dutch.' },
        { title: 'Cookies', text: 'Only necessary cookies until the visitor chooses. The site asks again after a year.' },
        { title: 'Accessibility', text: 'The WCAG 2.1 AA status, including the parts that do not meet it yet.' },
      ],
    },

    build: {
      heading: 'Part of the product, not a separate site.',
      body: 'The sales site lives in the same Next.js app as the learning platform. That keeps one design system and one deploy, and lets the product previews reuse the app’s real tokens.',
      notes: [
        { title: 'Previews in HTML and CSS', text: 'Every product image is markup, so it stays sharp at any size and has one clear description for screen readers.' },
        { title: 'Pricing from one source', text: 'The plan cards, the comparison table and the calculator all read the same plan data, so a price changes in one place.' },
        { title: 'Protected forms', text: 'The demo form, help feedback and cookie log are rate limited per IP address, with five demo requests an hour.' },
        { title: 'Security headers', text: 'A content security policy, HSTS and frame blocking cover the whole domain, sales pages included.' },
        { title: 'Consent on record', text: 'Each cookie choice is logged on the server and stays valid for twelve months.' },
        { title: 'No borrowed proof', text: 'The logo wall and testimonials are built but switched off. They go live when there are real customers to name.' },
      ],
    },

    figures: {
      heading: 'A complete sales site, not just a homepage.',
      items: [
        { value: '8', label: 'Pages, from homepage to accessibility statement' },
        { value: '11', label: 'Help articles, in 5 topics' },
        { value: '3', label: 'Plans, one price per user' },
        { value: '0', label: 'Real user data in the product previews' },
      ],
    },
  },
  {
    slug: 'sron',
    title: 'SRON',
    label: 'Hackathon',
    intro: 'A one-page site for NEBULA-Xplorer, an X-ray space telescope from SRON, the Netherlands Institute for Space Research. Made in a hackathon week, it turns a spacecraft spec sheet into a live Earth, a 3D satellite you can take apart, and data anyone can read.',
    image: 'assets/img/projects/sron.webp',
    theme: { surface: 'void', bg: '#030915', deep: '#000000', glow: '#EB5D34', accent: '#EB5D34', onAccent: '#030915' },
    // live: 'https://mitchellkevin.github.io/Space/',
    gallery: [
      { src: 'assets/img/projects/sron/mobile.webp', video: 'assets/video/projects/sron/mobile.mp4', alt: 'The hero on a phone: the text fades in and the Earth rises from the bottom' },
      { src: 'assets/img/projects/sron/stats.webp', alt: 'The key figures: 5 years, 161 kg, 10 concentrators, 89 W' },
      { src: 'assets/img/projects/sron/mobile-satellite.webp', video: 'assets/video/projects/sron/mobile-satellite.mp4', alt: 'The satellite turning by itself on a phone while its hotspots are tapped open one by one' },
      { src: 'assets/img/projects/sron/experts.webp', alt: 'The team section with the SRON experts' },
    ],
    facts: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Design, 3D & development' },
      { label: 'Client', value: 'SRON, during a hackathon' },
      { label: 'Built with', value: 'HTML, CSS, JavaScript, three.js, Blender' },
    ],
    story: [
      { heading: 'The brief', body: 'NEBULA-Xplorer is a compact X-ray telescope built under SRON’s NEBULA program by students from fourteen Dutch institutions. It will study binary star systems from low-Earth orbit. The hackathon asked for a website that presents the mission, built in one week from 23 to 29 March 2026.' },
      { heading: 'The constraints', body: 'The source material is an engineering document: ΔV budgets, arcseconds of pointing accuracy, Wolter-type concentrators and an 89 W power draw. The site had to stay true to those numbers and still make sense to someone who has never heard of an X-ray telescope, and it had to feel like space without turning into a screensaver.' },
      { heading: 'The approach', body: 'I led with things you can see before numbers you have to read: first the Earth the telescope will orbit, then the satellite itself, then the spec sheet. The look is dark and technical: one clean sans for reading, mono only for data, and one orange for everything that matters. The decisions below show how that played out.' },
    ],

    decisions: [
      {
        label: 'The hero',
        heading: 'A live Earth instead of a stock photo.',
        body: 'The hero is a three.js Earth, turned so Europe and the Netherlands, home of SRON, face the viewer. On load the camera flies in from deep space, the globe turns slowly and can be dragged around, and the strip along the bottom ticks the UTC time, sidereal time and Earth’s axial tilt every second.',
        quote: { text: 'A compact X-ray space telescope studying binary star systems from low-Earth orbit.' },
        image: 'assets/img/projects/sron/earth.webp',
        video: 'assets/video/projects/sron/earth.mp4',
        alt: 'The camera flying in from deep space until the three.js Earth fills the bottom of the hero, Europe facing the viewer',
      },
      {
        label: 'The spacecraft',
        heading: 'Let people take the satellite apart.',
        body: 'I modelled the satellite in Blender and load it into the page, where you can drag it around. Five hotspots are pinned to its parts: the X-ray instrument, solar arrays, propulsion, communications and attitude control. Each one opens a short plain-language note, and hotspots on the far side of the model dim so you only reach for what you can see.',
        quote: { text: 'Rotate the model and select a hotspot to see what each part does.' },
        image: 'assets/img/projects/sron/satellite.webp',
        video: 'assets/video/projects/sron/satellite.mp4',
        alt: 'The 3D satellite being dragged around, then the X-ray instrument and solar array hotspots opening their notes',
      },
      {
        label: 'The engineering',
        heading: 'Hard numbers, laid out like a spec sheet.',
        body: 'Six subsystem cards each carry a code (AOCS, PROP, PWR, COMM, THM, C&DH), one paragraph and two key specs. The figures stay exact, down to 26.97 m/s of ΔV, because this audience notices when numbers are rounded off. Mono figures and thin rules make it read like a data sheet, not a brochure.',
        quote: { text: 'Spacecraft subsystems.' },
        image: 'assets/img/projects/sron/subsystems.webp',
        alt: 'The grid of six spacecraft subsystem cards',
      },
      {
        label: 'The mission',
        heading: 'Explain the telescope before the specs.',
        body: 'Before any numbers, two short paragraphs say what the telescope is for and why it is small: a 0.8 m focal length, short enough to ride a Falcon 9 rideshare. Next to them, four numbered features name the parts that make that possible.',
        quote: { text: 'Compact X-ray space telescope.' },
        image: 'assets/img/projects/sron/about.webp',
        alt: 'The mission section with the introduction and four numbered features',
      },
      {
        label: 'The layout',
        heading: 'The Earth as a horizon, below the text.',
        body: 'With the globe behind the headline, the two fought for attention. Now the Earth rises from the bottom of the screen like a horizon seen from orbit, and the script measures where the text ends so the globe always starts just below it, on any screen. On touch screens the 3D scenes are display-only, so they never trap the page’s scrolling, and the satellite turns slowly by itself while you tap its hotspots.',
        quote: { text: 'Explore the mission.' },
        image: 'assets/img/projects/sron/mobile.webp',
        video: 'assets/video/projects/sron/mobile.mp4',
        alt: 'The hero on a phone, with the Earth rising as a horizon below the text',
      },
    ],

    system: {
      heading: 'Deep space, ice white and one SRON orange.',
      body: 'Black is the sky and a deep navy marks the raised sections. Text is a cool ice white. SRON’s orange carries every action and highlight, and a single green is kept for the live dot in the data strip.',
      colors: [
        { name: 'Space', hex: '#000000' },
        { name: 'Deep', hex: '#030915' },
        { name: 'Ice', hex: '#E8F4FF' },
        { name: 'SRON orange', hex: '#EB5D34' },
        { name: 'Live', hex: '#64FEAD' },
      ],
      fonts: [
        { name: 'Space Grotesk', use: 'Headings, body text and big numbers' },
        { name: 'DM Mono', use: 'Small labels, spec values and live data' },
      ],
    },

    structure: {
      heading: 'Eight sections, from orbit down to the people.',
      body: 'The page starts with the planet and zooms in: the mission, the spacecraft, its parts, then the people and partners behind it.',
      steps: [
        { title: 'Hero', text: 'The live Earth, the mission in one line and a strip of real-time data.' },
        { title: 'Key figures', text: 'Lifetime, mass, concentrators and power, in four big numbers.' },
        { title: 'Mission', text: 'What the telescope is for and the four parts that make it work.' },
        { title: 'Spacecraft', text: 'The 3D satellite with five hotspots.' },
        { title: 'Subsystems', text: 'Six cards that read like a spec sheet.' },
        { title: 'Team', text: 'The SRON experts and the student team behind the mission.' },
        { title: 'Partners', text: 'The institutions involved, in a slow scrolling strip.' },
        { title: 'Footer', text: 'Links to SRON, its missions and internships, and both locations.' },
      ],
    },

    build: {
      heading: 'Plain HTML, CSS and JavaScript, one file per feature.',
      body: 'No framework and no build step. Each feature has its own stylesheet and script, all colours, fonts and spacing come from one token file, and three.js loads from a CDN.',
      notes: [
        { title: 'Real astronomy', text: 'Sidereal time and Earth’s axial tilt are calculated from the current date. They fill the live data strip, and the tilt also angles the globe.' },
        { title: 'Render only when needed', text: 'The satellite only redraws while it moves, and neither 3D scene renders while it is off screen.' },
        { title: 'Load the model late', text: 'The satellite model and its 3D scene are only set up once the viewer is about to scroll into view.' },
        { title: 'Stars drawn once', text: 'The star field is painted once onto a single canvas and only redrawn when the window changes size.' },
        { title: 'Made for touch', text: 'On phones the 3D scenes are display-only, so they never block scrolling, and the hotspots are large enough to tap.' },
        { title: 'Motion with an off switch', text: 'Visitors who prefer reduced motion get the content without scroll reveals, scrolling strips or the spinning globe.' },
      ],
    },

    figures: {
      heading: 'One week, from blank page to a live mission site.',
      items: [
        { value: '7', unit: 'days', label: 'The hackathon, 23 to 29 March 2026' },
        { value: '5', label: 'Hotspots on the 3D satellite' },
        { value: '6', label: 'Subsystems, each with two key specs' },
        { value: '0', label: 'Frames rendered while a 3D scene is off screen' },
      ],
    },
  },
  {
    // TODO: add `live:` once the repo and the sales site have their public address.
    slug: 'agentic-office',
    title: 'Agentic Office',
    label: 'Source-available',
    intro: 'A source-available app that shows every Claude Code session on your machine as a robot in a 3D office building, and the one-screen sales site that launches it. I built both: the product reads Claude Code’s own transcripts on your machine, and the site sells it with a single robot that acts out the same states.',
    image: 'assets/img/projects/agentic-office.webp',
    theme: { surface: 'void', bg: '#0B0D12', deep: '#08090C', glow: '#E07A3C', accent: '#F2B766', onAccent: '#1C0E03' },
    gallery: [
      { src: 'assets/img/projects/agentic-office/mobile.webp', video: 'assets/video/projects/agentic-office/mobile.mp4', alt: 'The sales site on a phone: a tap on the face makes the robot smile, then the dock button steps it through working and needs you' },
      { src: 'assets/img/projects/agentic-office/state-working.webp', video: 'assets/video/projects/agentic-office/working.mp4', alt: 'The robot working: lines being typed under its cyan eyes while the bubble ticks through tool calls' },
      { src: 'assets/img/projects/agentic-office/night.webp', video: 'assets/video/projects/agentic-office/night.mp4', alt: 'The office building at night in the app, with lit windows, traffic and a tag per department' },
      { src: 'assets/img/projects/agentic-office/state-turn.webp', alt: 'The robot smiling in blue: “Done. What’s next?”' },
    ],
    facts: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Product, design & development' },
      { label: 'Audience', value: 'Developers who run several Claude Code sessions' },
      { label: 'Built with', value: 'Node.js, plain WebGL2, HTML, CSS, SVG' },
    ],
    story: [
      { heading: 'The brief', body: 'Once you run more than one Claude Code agent, you run more than one terminal, and the agent that is waiting for your approval is the one you miss. Agentic Office makes every session visible at a glance: who is working, who needs you and what they are doing. It is free to use and its code is open to read, so it also needed a launch page that gets a developer from “what is this?” to a running office in one command.' },
      { heading: 'The constraints', body: 'The app reads people’s coding sessions, so nothing could leave their machine: no accounts, no telemetry, no outbound requests and no npm dependencies to trust. It had to run anywhere with Node 20 and a browser. The sales site had the opposite problem: explain a 3D app in a single screen, without a scroll, a screenshot wall or a feature list.' },
      { heading: 'The approach', body: 'I gave every session a body. Each project is a building, each department a glass floor, and each session a robot at a desk whose eyes and antenna show its state. The sales site uses the same idea at full size: one big robot that follows your cursor and acts out the four states, next to the command that installs it. The decisions below show how that played out.' },
    ],

    decisions: [
      {
        label: 'The product',
        heading: 'A building per project, a robot per session.',
        body: 'You start outside, looking at a small city with traffic, street trees and a sky that follows your clock. In the middle stands the office: a lobby, a glass-walled floor per department and a sign on the roof. Every floor carries a tag with live dots for agents that are working or need you, so you can read the whole building before you step inside.',
        image: 'assets/img/projects/agentic-office/building.webp',
        video: 'assets/video/projects/agentic-office/flyin.mp4',
        alt: 'The building in the app, then a click on Development: the camera flies in and cuts away the glass and the floors above',
      },
      {
        label: 'Status',
        heading: 'Read the room, not the logs.',
        body: 'Pick a floor and the camera flies in while the glass and the floors above are cut away. A robot typing at a glowing monitor is working, with the current tool call in its speech bubble. One standing up and waving with a red ! needs you. On a git floor, desks are grouped per branch, and departments can work as a team: a robot finishes its turn, rides the glass lift and hands the work to the next floor.',
        image: 'assets/img/projects/agentic-office/floor.webp',
        video: 'assets/video/projects/agentic-office/floor.mp4',
        alt: 'Inside the Development floor: robots typing and walking between desks, one waving with a red ! while its tool calls change',
      },
      {
        label: 'Control',
        heading: 'Click a robot to see what it is doing.',
        body: 'A click opens the robot’s side panel: every step it took, the conversation, the files it changed, the tokens it used and anything waiting for approval. You can give it its next task from the same panel, or hire a new robot onto any floor. With the optional hooks installed, permission prompts land in an Approvals drawer, so you allow or deny them without hunting for the right terminal.',
        image: 'assets/img/projects/agentic-office/panel.webp',
        video: 'assets/video/projects/agentic-office/panel.mp4',
        alt: 'A click on the robot that needs you opens its side panel with its steps, then the Conversation tab',
      },
      {
        label: 'The sales site',
        heading: 'One screen, one robot, one command.',
        body: 'The launch page is exactly one screen high. A two-line headline, then the git clone command with a copy button, then a large robot drawn in SVG that follows your cursor. A small dock at the bottom holds the rest: a menu with three short panels about the robots, the office and privacy, a coffee button, and Watch demo. There is nothing to scroll past, because the one thing to do is clone it.',
        quote: { text: 'We’ve watched agents scroll by before. This time we built them an office.' },
        image: 'assets/img/projects/agentic-office/sales-hero.webp',
        video: 'assets/video/projects/agentic-office/hero.mp4',
        alt: 'The one-screen sales site: the robot’s head follows the cursor around the page, then a tap on its face makes it smile and hop',
      },
      {
        label: 'The robot',
        heading: 'The mascot acts out the product.',
        body: 'The robot button in the dock steps through the same states the app shows, in the same colours: working in cyan, with tool calls ticking by in its speech bubble; needs you in red, with a flashing ! and a nervous shake; your turn in blue, with a smile and a hop; and idle in grey, slumped with a drifting zzz. Tap its face and it smiles, but not while it is busy, asking for approval or asleep.',
        quote: { text: 'Allow Bash: npm test?' },
        image: 'assets/img/projects/agentic-office/state-needs.webp',
        video: 'assets/video/projects/agentic-office/states.mp4',
        alt: 'The dock button stepping the robot through working, needs you, your turn and idle, each with its own face, colour and bubble',
      },
      {
        label: 'The demo',
        heading: 'Show the real thing, one click away.',
        body: 'Watch demo opens the recorded walkthrough of the app over the page. The page behind it shrinks a little, dims and blurs, so the video seems to float in front. Escape, the close button or a click outside closes it, and the video pauses.',
        image: 'assets/img/projects/agentic-office/demo.webp',
        video: 'assets/video/projects/agentic-office/demo.mp4',
        alt: 'Watch demo opens the walkthrough over the blurred page, the video plays, and the close button brings the page back',
      },
    ],

    system: {
      heading: 'Night ink, one warm amber, and the product’s status colours.',
      body: 'The robot’s orange paint sets the palette: a dark ink background with an amber glow behind the head, amber for every action and a warm gradient on the second line of the headline. The robot’s LEDs borrow the app’s status colours, so cyan, red and blue mean the same thing on the site as they do in the office.',
      colors: [
        { name: 'Night ink', hex: '#0B0D12' },
        { name: 'Cream', hex: '#F4F1EC' },
        { name: 'Amber', hex: '#F2B766' },
        { name: 'Burnt orange', hex: '#E07A3C' },
        { name: 'Working', hex: '#4DF2D8' },
        { name: 'Needs you', hex: '#FF5A5F' },
        { name: 'Your turn', hex: '#7FB2FF' },
      ],
      fonts: [
        { name: 'System sans (SF Pro Display)', use: 'The headline and body text, with no web fonts to load' },
        { name: 'System mono (SF Mono)', use: 'The clone command, buttons, labels and the robot’s speech bubble' },
      ],
    },

    structure: {
      heading: 'One screen, from the promise down to the product.',
      body: 'The sales site has no sections to scroll through. It reads top to bottom in four layers, and everything else opens on top of it.',
      steps: [
        { title: 'Headline', text: 'Two lines: what was wrong before, and what this is.' },
        { title: 'Clone command', text: 'The git clone line with a copy button, and the one command that starts it.' },
        { title: 'Robot', text: 'Follows your cursor, smiles when you tap it and acts out the four states.' },
        { title: 'Dock', text: 'The state button, the menu, the coffee button and Watch demo.' },
        { title: 'Panels', text: 'The robots, the office and privacy, each in a few lines, above the dock.' },
        { title: 'Demo', text: 'The walkthrough video in an overlay over the blurred page.' },
      ],
    },

    build: {
      heading: 'No framework on either side.',
      body: 'The app is a small Node server and a hand-written WebGL2 renderer. The sales site is one HTML file, one stylesheet and one script. Neither installs a single package.',
      notes: [
        { title: 'A renderer of its own', text: 'The 3D office runs on about 650 lines of plain WebGL2, with HDR, 4× MSAA, soft shadows, bloom and ACES tone mapping. Every model, from the robots to the parked cars, is built in code from boxes, spheres and cylinders.' },
        { title: 'Read-only by default', text: 'The app reads Claude Code’s transcripts without changing them and only listens on your own machine. Hooks are optional and add exact status and browser approvals.' },
        { title: 'A face on an LED mesh', text: 'The robot’s face is drawn once and masked by a grid, so its eyes light whole cells as they move. A blurred copy underneath lights up the wires around them.' },
        { title: '3D from parallax', text: 'The sales robot is flat SVG. Its screen and eyes move further toward the cursor than its ears and the back of its head, which reads as the head turning, without WebGL on the page.' },
        { title: 'Strict content policy', text: 'The sales site loads nothing from anywhere else: no web fonts, no CDN and no trackers, enforced by a content security policy.' },
        { title: 'Motion with an off switch', text: 'With reduced motion, the background stops drifting, the entrance animations are skipped and the robot only moves when you do.' },
        { title: 'A demo mode to show it off', text: 'Adding ?demo=1 runs simulated agents, approvals and a team run, so the app can be shown, filmed or screenshotted without exposing real work. The app shots in this case study come from it.' },
        { title: 'Free to use, not to resell', text: 'The app is source-available under the Functional Source License. Anyone may use it, also at work, and read or change the code, but nobody may sell it or ship a competing copy. Two years after each release, that version also becomes MIT.' },
      ],
    },

    figures: {
      heading: 'Everything on your machine, everything on one screen.',
      items: [
        { value: '0', label: 'npm dependencies in the app' },
        { value: '0', label: 'Outbound requests, accounts or telemetry' },
        { value: '4', unit: 'states', label: 'The same on the sales site as in the office' },
        { value: '1', unit: 'screen', label: 'The whole sales site, with no scroll' },
      ],
    },
  },
];
