# Hero options brief (shared by every option)

Goal: the home page hero for John Bell's portfolio, which exists to WIN FREELANCE WORK
(small businesses: shops, cafés, salons, trades, property, florists, local services).
In 3 seconds a visitor must get: who John is, what he does (designs AND builds websites,
shops and brands), that he's available, and how to start ("Start a project").

House style (mandatory): white page, Poppins, grey clean accents, highlighter-pen marks
(<mark class="hl"> from assets/css/base.css; yellow/pink/blue/orange) on key words.
Clean, approachable and fun. Light + dark mode must both work (base.css tokens; include
assets/js/theme.js in <head>). Must look great at 1440×900 AND 390×844.

John has rejected: thin wavy squiggle lines/doodle lines, a "Designed & built by me" sticky
note, a self-building wireframe browser, a 3D laptop with 3D objects ("not me"), boxed
"fixed blocks", messy/cluttered compositions, a hero that's just a slideshow of screenshots.
John likes: real product cards from his work (GoSweet, Nic Pouches) floating, laptop+phone
device mockups, big bold headline type with highlighter, a thick see-through highlighter
SCRIBBLE behind imagery (marker colouring-in, not thin lines), polaroids, smooth GSAP motion.

Real assets you can use (all under the project root):
- Captures: assets/captures/<slug>/fold-desktop.webp, home-desktop.webp, home-mobile.webp
  (slugs: patch-agency, birth-hood, gosweet, nic-pouches, vsl-trade, birdie-blooms,
  sccc-heritage, beetle-eyes). Product cards: assets/captures/gosweet/card-desktop.webp,
  assets/captures/nic-pouches/card-desktop.webp, wallet: assets/captures/gosweet/wallet-desktop.webp.
- Photos: assets/projects/birth-hood/*.jpg (polaroid-friendly), assets/projects/beetle-eyes/*.jpg,
  assets/projects/patch/*.webp|jpg (brand mockups), assets/projects/property/*.jpg (print),
  assets/projects/patch/patch-a.svg (lime sticker mark).
- Case studies to link: projects/<slug>.html (patch, birth-hood, gosweet, nic-pouches,
  vsl-trade, birdie-blooms, sccc-heritage, beetle-eyes, property).
- John's illustrated character doesn't exist yet: if a direction needs him, use a clean
  placeholder (e.g. a neutral rounded silhouette card labelled "Your photo / illustration here").

Technical: each option is ONE standalone file heroes/hero-NN.html that links
../assets/css/base.css, Google Fonts Poppins, ../assets/js/theme.js, GSAP 3.12.5 from cdnjs
(+ ScrollTrigger if needed). Put option-specific CSS/JS inline in the file. Copy the nav
markup from index.html (fix relative links with ../). Hero only: one full-viewport section
(min-height 100dvh) + a small strip below so it doesn't feel cut off. No edits to any other
files. Label the option at the top of the file in an HTML comment: number, name, one-line idea.
Respect prefers-reduced-motion. Keep text realistic (no lorem ipsum, no invented clients/stats).

QA: `node tools/qa.mjs http://localhost:4321/heroes/hero-NN.html` must pass desktop+phone.
Screenshot it: `node tools/tour.mjs http://localhost:4321/heroes/hero-NN.html <out> light ".hero@0"`
(give your hero section class="hero"), also dark, and at phone width (see tools/qa.mjs for a
390px puppeteer setup), into /private/tmp/claude-502/-Users-johnB-Documents-Web-John-Bell-Portfolio/eea2c326-0d95-4ebd-a92f-c96606cf8b87/scratchpad/heroes/.
Look at the screenshots critically like an art director and iterate until it's genuinely
high quality. Report: what the option is, why it would win clients, and its best moment.
