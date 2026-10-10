"""Builds the landing pages in projects/ (web/graphic design in Birmingham, web design in Leicester,
and the UK-wide freelance page).
Run from the repo root:  python3 tools/landing.py
The price cards are copied from the home page (index.html): change prices there, then re-run this. WEB / GFX below only feed the structured data for Google, so keep them in step."""
import json, html
BASE = 'https://johnpbell7.github.io/JB-Design-Agency/'
EMAIL = 'jb.designagency89@gmail.com'
PHONE = '07428 728780'          # shown on the page
PHONE_INTL = '+447428728780'    # for tel:/sms:/WhatsApp links
NAV = open('tools/landing-nav.html').read()

# ===== PRICES (placeholders, to be confirmed by John) =====
WEB = [('One-page website', '£500', 'A shop window for your business: who you are, what you do, and an easy way to get in touch. No logins or back end to look after.', ['Designed for phones first', 'Small changes, quoted up front', 'Add your own editor, £150']),
       ('Small business website', '£1,200', 'Separate pages for your services, about, work and contact, with a layout that grows with your business.', ['Up to 5 pages', 'Extra pages from £100', 'Set up for Google']),
       ('Small online shop', '£1,800', 'A Shopify shop for independents, with clear product pages and a quick checkout. For bigger stores I design every page for your developer to build.', ['Shopify set-up', 'Product and collection pages', 'Big stores: designs for your developer'])]
GFX = [('Logo design', '£300', 'A logo that works on a van, a sign, a social profile and a favicon, with a few routes to choose from.', ['Three first ideas', 'Colour and mono versions', 'All file types']),
       ('Brand identity', '£500', 'A logo plus the colours, fonts and simple rules that keep everything looking like you.', ['Logo and variations', 'Colours and fonts', 'One-page brand guide']),
       ('Print design', '£45/page', 'Brochures, business cards, flyers, signage and large format, designed and sent to print ready. Brochures are priced per page, so you only pay for what you need.', ['Brochures from £45 a page', 'Business cards, flyers and leaflets', 'Banners, signs and site boards', 'Printing arranged for you'])]
CARE = 'Hosting from £10 a month. Website care from £40 a month, with hosting, changes, updates and help when you need it.'

# Towns covered, Leicester down to Birmingham (one honest list, shown on every location page)
AREAS = ['Birmingham', 'Sutton Coldfield', 'Solihull', 'Lichfield', 'Tamworth', 'Atherstone', 'Nuneaton', 'Hinckley',
         'Coalville', 'Ashby-de-la-Zouch', 'Loughborough', 'Leicester', 'Mountsorrel', 'Kibworth', 'Market Harborough', 'Melton Mowbray']

# "How it works" steps: one set per page, so the pages don't repeat each other
WEB_STEPS = [('A quick chat', 'You tell me about your business and what the site needs to do, and I send you a fixed quote.'), ('Designs first', 'You see the designs on a laptop and a phone before anything gets built.'),
             ('Built and checked', 'Built, tested on phones and computers, and set up for Google.'), ('Live, and looked after', 'It goes live, with help on hand whenever you need something changing.')]
LEI_STEPS = [('Let’s talk', 'On a call, or in person if you’re nearby. Afterwards you get a fixed quote.'), ('See it before it’s built', 'You see the designs on both a laptop and a phone, so nothing gets built until you’ve had a proper look.'),
             ('Built and tested', 'The site is built, checked on phones and computers, and given the setup Google looks for.'), ('Launch, then support', 'Support carries on once it’s live. If something needs changing, send me a message.')]
GFX_STEPS = [('A quick chat', 'You tell me about your business and who you want to reach, and I send you a fixed quote.'), ('First ideas', 'Usually three different directions, so you have a real choice to react to.'),
             ('Refine it together', 'We take your favourite and work on it until it feels right. Two rounds of changes are included.'), ('Files and print', 'You get every file you need for print and screen, with printing arranged if you want it.')]

WEB_SVCS = [('Small business websites', 'One-page and multi-page sites for trades, cafés, salons, clinics and local services.'), ('Online shops', 'Small Shopify shops for independents. For bigger stores, every page designed and ready for your developer.'),
            ('Set up for Google', 'Fast pages, proper titles and descriptions, and the behind-the-scenes setup (SEO) that Google looks for.'), ('Changes without the hassle', 'A one-page site needs no upkeep: changes are made for you, or add your own editor for £150. Bigger sites come with an editor included.'),
            ('Redesigns', 'If your current site is looking tired, you get a fresher, faster version that keeps the parts that work.'), ('Care and updates', 'Changes, new pages and help after launch, whenever you need it.')]
LEI_SVCS = [('Websites for local businesses', 'For the cafés, salons, clinics, trades and village shops around Leicestershire, from a single page to a full site.'), ('Shopify shops', 'Online shops for independents, set up on Shopify. For a bigger operation, the pages are designed for your developer to build.'),
            ('Found on Google', 'Quick pages and the right setup behind the scenes, so people searching locally for what you do can find you.'), ('Updating your site', 'On a one-pager, changes are made for you, or add your own editor for £150. Bigger sites have an editor built in.'),
            ('Redesigns', 'A fresher, faster version of the site you already have, keeping whatever is working.'), ('Support after launch', 'Help with changes and new pages once you’re live.')]
GFX_SVCS = [('Logo design', 'Logos that work tiny on a phone screen and large on a banner, in colour and in black and white.'), ('Brand identity', 'Colours, fonts and a few simple rules, so everything you put out looks like it comes from the same business.'),
            ('Brochures and reports', 'Well-organised layouts for brochures, annual reports and newsletters that lead the reader to the parts that matter.'), ('Business cards and flyers', 'Business cards, flyers and leaflets for promotions, events and letterbox drops.'),
            ('Large format and signage', 'Shop signs, banners and roller banners, vehicle graphics and site boards.'), ('Packaging and labels', 'Boxes, labels and tins that get noticed on a crowded shelf.')]

W = lambda h, img, alt, n, k: (h, img, alt, n, k)
WORK = {'birth-hood': W('birth-hood.html', 'captures/birth-hood/fold-desktop.webp', 'Birth-hood website', 'Birth-hood', 'Website for a hypnobirthing and doula business in Leicestershire'),
        'patch': W('patch.html', 'captures/patch-agency/fold-desktop.webp', 'PATCH website', 'PATCH', 'Brand and website for a field-marketing agency'),
        'vsl': W('vsl-trade.html', 'captures/vsl-trade/fold-desktop.webp', 'VSL Trade website', 'VSL Trade', 'Trade website for a wholesaler'),
        'gosweet': W('gosweet.html', 'captures/gosweet/fold-desktop.webp', 'GoSweet online shop', 'GoSweet', 'Online shop design'),
        'birdie': W('birdie-blooms.html', 'captures/birdie-blooms/fold-desktop.webp', 'Birdie Blooms website', 'Birdie Blooms', 'Website and brand for a flower studio in Ravenstone and Kibworth'),
        'beetle': W('beetle-eyes.html', 'captures/beetle-eyes/fold-desktop.webp', 'Beetle Eyes Clothing website', 'Beetle Eyes Clothing', 'One-page site for a vintage rail in Mountsorrel'),
        'sccc': W('sccc-heritage.html', 'captures/sccc-heritage/fold-desktop.webp', 'Sutton Coldfield Cricket Club history website', 'SCCC Heritage', 'History website for Sutton Coldfield Cricket Club'),
        'print': W('print.html', 'projects/print/gowling/cover.jpg', 'Gowling WLG report cover', 'Print and brand', 'Reports, newsletters, logos and campaigns'),
        'property': W('property.html', 'projects/property/spreads/sloane-1.jpg', 'Property brochure spread', 'Property marketing', 'Brochures, boards and development identities')}

def prices(items):
    """The same four price cards as the home page, copied from index.html so the prices only live in one place."""
    import re
    home = open('index.html').read()
    row = home[home.index('<div class="hp-cards"'):]
    row = row[:row.index('<div class="hp-dots"')]
    cards = {re.search(r'<h3>(.*?)</h3>', c).group(1): '<a class="hp-card"' + c.rstrip().removesuffix('</div>').rstrip()
             for c in row.split('<a class="hp-card"')[1:]}
    order = ['Logos &amp; branding', 'Print', 'Websites', 'Online shops'] if items is GFX else ['Websites', 'Online shops', 'Logos &amp; branding', 'Print']
    out = '\n'.join(cards[k] for k in order).replace('href="projects/', 'href="')
    return (f'<div class="hp-cards">\n{out}\n</div>'
            '<p class="hp-extras"><span>Two rounds of changes included</span><span>All prices are starting points</span><span>Pay in stages</span><span>Hosting from £10 a month</span><span>Website care from £40 a month</span></p>')

def page(p):
    url = f'{BASE}projects/{p["slug"]}.html'; img = f'{BASE}assets/share/john-bell-websites.jpg'
    t = html.unescape(p['title']); e = lambda x: html.escape(x, quote=True)
    name = p['h1'].replace('<mark class="hl">', '').replace('<mark class="hl hl--pink">', '').replace('<mark class="hl hl--blue">', '').replace('</mark>', '')
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "name": name, "serviceType": p['svc'], "url": url, "description": p['desc'],
         "provider": {"@id": BASE + "#business"},
         "areaServed": p.get('area_ld') or [{"@type": "City", "name": a} for a in AREAS] + [{"@type": "Country", "name": "United Kingdom"}],
         "offers": [{"@type": "Offer", "name": n, "priceCurrency": "GBP", "priceSpecification": {"@type": "PriceSpecification", "minPrice": pr.split('/')[0].replace('£', '').replace(',', ''), "priceCurrency": "GBP"}} for n, pr, _, _ in p['prices']]},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p['faqs']]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE}, {"@type": "ListItem", "position": 2, "name": name.rstrip('.'), "item": url}]}]}
    work = ''.join(f'<a class="lp-card" href="{h}"><img src="../assets/{im}" alt="{alt}" loading="lazy" width="1440" height="900"><span><b>{n}</b>{k}</span></a>' for h, im, alt, n, k in (WORK[k] for k in p['work']))
    areas = ''.join(f'<li>{a}</li>' for a in p.get('areas', AREAS))
    return f'''<!doctype html>
<html lang="en-GB" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{p["title"]}</title>
  <meta name="description" content="{p["desc"]}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="John Bell · Web Designer">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{e(t)}">
  <meta property="og:description" content="{p["desc"]}">
  <meta property="og:image" content="{img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(t)}">
  <meta name="twitter:description" content="{p["desc"]}">
  <meta name="twitter:image" content="{img}">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../assets/favicon-48.png" type="image/png" sizes="48x48">
  <link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
  <link rel="manifest" href="../assets/site.webmanifest">
  <meta name="theme-color" content="#ffffff">
  <script src="../assets/js/theme.js?v=3"></script>
  <link rel="preload" href="../assets/fonts/poppins-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/poppins-700-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../assets/css/fonts.css">
  <link rel="stylesheet" href="../assets/css/base.css?v=4">
  <link rel="stylesheet" href="../assets/css/landing.css?v=2">
  <link rel="stylesheet" href="../assets/css/prices.css?v=8">
  <script type="application/ld+json" data-seo>
{json.dumps(ld, ensure_ascii=False, indent=1)}
  </script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
{NAV}
  <main id="main" class="lp">
    <section class="lp-hero wrap">
      <h1>{p["h1"]}</h1>
      <p class="lp-hero__lede">{p["lede"]}</p>
      <div class="lp-hero__ctas"><a class="btn btn--big btn--keep" href="../index.html#contact">Get a quote <span aria-hidden="true">→</span></a><a class="btn btn--ghost btn--big" href="#prices">See prices</a></div>
      <ul class="lp-facts"><li>14 years in agencies and in-house teams</li><li>{p["fact"]}</li><li>You deal with me, start to finish</li></ul>
    </section>

    <section class="lp-sec wrap lp-intro">
      <h2>{p["intro_h"]}</h2>
      <div>{p["intro"]}</div>
    </section>

    <section class="lp-sec wrap">
      <h2>What I can do for you</h2>
      <div class="lp-svcs">{"".join(f'<div class="lp-svc"><h3>{a}</h3><p>{b}</p></div>' for a, b in p["svcs"])}</div>
    </section>

    <section class="lp-sec lp-sec--grey" id="prices">
      <div class="wrap">
        <h2>{p["price_h"]}</h2>
        <p class="lp-sec__lede">Every project gets a fixed quote after a quick chat, so you know the full price before we start. These are starting points.</p>
        <!-- PRICES: placeholder "from" prices, to be confirmed by John (tools/landing.py) -->
        {prices(p["prices"])}
      </div>
    </section>

    <section class="lp-sec wrap">
      <h2>{p["work_h"]}</h2>
      <div class="lp-work">{work}</div>
      <p class="lp-more"><a href="work.html">See all my work <span aria-hidden="true">→</span></a></p>
    </section>

    <section class="lp-sec wrap">
      <h2>How it works</h2>
      <ol class="lp-steps">{"".join(f"<li><h3>{a}</h3><p>{b}</p></li>" for a, b in p["steps"])}</ol>
    </section>

    <section class="lp-sec wrap lp-areas">
      <h2>{p.get("areas_h", "Areas covered")}</h2>
      <div><p>{p["areas_line"]}</p><ul class="lp-areas__list">{areas}</ul>{f'<p>{p["areas_after"]}</p>' if p.get("areas_after") else ''}</div>
    </section>

    <section class="lp-sec wrap lp-faq">
      <h2>Questions people ask</h2>
      <div>{"".join(f"<details class='lp-faq__q'><summary>{q}</summary><p>{a}</p></details>" for q, a in p["faqs"])}</div>
    </section>

    <section class="lp-cta wrap" id="contact">
      <h2>{p["cta_h"]}</h2>
      <p>Tell me a bit about your business and what you need. I usually reply within a working day.</p>
      <div class="lp-hero__ctas"><a class="btn btn--big btn--keep" href="../index.html#contact">Start a project <span aria-hidden="true">→</span></a><a class="btn btn--ghost btn--big" href="mailto:{EMAIL}">Email me</a></div>
      <div class="contact__reach"><a class="contact__pill" href="tel:{PHONE_INTL}">Call or text {PHONE}</a><a class="contact__pill" href="sms:{PHONE_INTL}">Send a text</a><a class="contact__pill" href="https://wa.me/{PHONE_INTL[1:]}?text=Hi%20John%2C%20I%20found%20you%20through%20your%20website%20and%20I%E2%80%99d%20like%20to%20chat%20about%20a%20project." target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 20.4l1.2-4.1a8.4 8.4 0 1 1 3.3 3.2z"/><path d="M9.2 8.6c-.2 2.9 3.1 6.3 6.2 6.2l.9-1.4-1.9-1-1 .7a4.2 4.2 0 0 1-2.1-2.1l.7-1-1-1.9z" fill="currentColor" stroke="none"/></svg>WhatsApp me</a></div>
      <p class="lp-other">{p["other"]}</p>
    </section>
  </main>

  <footer class="site-foot">
    <div class="wrap">
      <div class="site-foot__grid">
        <div class="sf-brand"><a class="sf-name" href="../index.html">John Bell</a><p>Freelance web and graphic designer. Based in Birmingham, working with businesses across the UK.</p></div>
        <nav class="sf-col" aria-label="Pages"><p class="sf-h">Pages</p><a href="work.html">Work</a><a href="services.html">Services</a><a href="print.html">Print</a><a href="about.html">About</a><a href="../index.html#faq">FAQs</a></nav>
        <div class="sf-col"><p class="sf-h">Get in touch</p><a href="../index.html#contact">Start a project</a><a href="mailto:jb.designagency89@gmail.com">Email</a><a href="tel:+447428728780">07428 728780</a><a class="sf-wa" href="https://wa.me/447428728780?text=Hi%20John%2C%20I%20found%20you%20through%20your%20website%20and%20I%E2%80%99d%20like%20to%20chat%20about%20a%20project." target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 20.4l1.2-4.1a8.4 8.4 0 1 1 3.3 3.2z"/><path d="M9.2 8.6c-.2 2.9 3.1 6.3 6.2 6.2l.9-1.4-1.9-1-1 .7a4.2 4.2 0 0 1-2.1-2.1l.7-1-1-1.9z" fill="currentColor" stroke="none"/></svg>WhatsApp me</a></div>
        <nav class="sf-col" aria-label="Areas"><p class="sf-h">Areas</p><a href="web-designer-birmingham.html">Web design Birmingham</a><a href="graphic-designer-birmingham.html">Graphic design Birmingham</a><a href="web-designer-leicester.html">Web design Leicester</a><a href="freelance-web-designer-uk.html">Across the UK</a></nav>
      </div>
      <div class="site-foot__base"><span>© 2026 John Bell · Designed and built by me</span><span><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></span></div>
    </div>
  </footer>
</body>
</html>
'''

PAGES = [
 dict(slug='web-designer-birmingham', share='john-bell-websites', svc='Web design',
  title='Web Designer in Birmingham · John Bell, Freelance Web Design',
  desc='Freelance web designer in Birmingham. Fast, mobile-friendly websites and Shopify shops for small businesses, designed and built by John Bell. Quotes from £500.',
  h1='Web designer <mark class="hl">in Birmingham.</mark>',
  lede='I design and build websites for independents and small businesses, here in Birmingham and across the UK. Fast sites that work properly on a phone, show up on Google and make it straightforward for people to get in touch.',
  fact='Based in Birmingham, working UK-wide',
  intro_h='A website that earns its keep',
  intro='<p>Most people will find you on their phone, often while they’re in the middle of something else. So every site is designed for phones first, with quick pages and an obvious next step: call, book, buy or send a message.</p><p>I’ve spent 14 years designing for agencies and in-house teams, and now I work directly with business owners. The person you speak to on day one is the same person who designs, builds and launches your site, and who’s still there after launch.</p>',
  svcs=WEB_SVCS, steps=WEB_STEPS, price_h='Web design prices', prices=WEB, work_h='A few of my websites', work=['birth-hood', 'patch', 'vsl', 'sccc'],
  areas_line='I’m based in Birmingham and work with businesses across the West and East Midlands, from Brum and Sutton Coldfield up to Leicester. I also work with businesses anywhere in the UK, by video call and email.',
  faqs=[('How much does a website cost in Birmingham?', 'A one-page website starts from £500, a small business site from £1,200 and a small online shop from £1,800. After a quick chat I send you a fixed quote, so you know the full price before we start.'),
        ('How long does a website take?', 'A small business site usually takes a few weeks from our first chat to going live. Shops and bigger sites take a little longer, and you’ll get a timeline with your quote.'),
        ('Do I need to be in Birmingham?', 'No. I’m happy to meet in person if you’re local, but most of my work happens over video calls and email, so I work with businesses all over the UK.'),
        ('Can I update the website myself?', 'It depends on the site. A one-page site is a shop window with no back end, which keeps it cheaper, faster and more secure. When you need a change, I make it for you, quoted up front, or included on a care plan from £40 a month. If you’d rather do it yourself, I can add an editor to a one-page site for £150. Bigger sites and shops come with one included.'),
        ('Will my website show up on Google?', 'Every site is built to load quickly, work well on phones and include the setup Google looks for. I’ll also help you set up Google Search Console and your Google Business Profile, so you’re not left to work them out alone.')],
  cta_h='Got a website in mind? <mark class="hl">Let’s talk.</mark>',
  other='Need a logo, brand or print as well? See <a href="graphic-designer-birmingham.html">graphic design in Birmingham</a>. In Leicestershire? See <a href="web-designer-leicester.html">web design in Leicester</a>. Elsewhere? See <a href="freelance-web-designer-uk.html">freelance web design across the UK</a>.'),
 dict(slug='graphic-designer-birmingham', share='graphic-designer-birmingham', svc='Graphic design',
  title='Graphic Designer in Birmingham · John Bell, Logos, Branding &amp; Print',
  desc='Freelance graphic designer in Birmingham. Logos, brand identity, brochures, flyers and packaging for small businesses, with 14 years’ agency and in-house experience.',
  h1='Graphic designer <mark class="hl hl--pink">in Birmingham.</mark>',
  lede='Logos, brand identities and print for independents and small businesses in Birmingham and across the UK. Design that holds up wherever it ends up, from the side of a van or a shop sign to a brochure or your website.',
  fact='Based in Birmingham, working UK-wide',
  intro_h='Design that makes you look the part',
  intro='<p>People make up their minds about a business quickly, usually before they’ve read a word. A strong logo, a consistent look and well-made print do a lot of that work for you.</p><p>I’ve spent 14 years designing brands, reports, brochures and campaigns for agencies and in-house teams, for charities, law firms, housebuilders and local trades. Now you can work with me directly, without an agency in between.</p>',
  svcs=GFX_SVCS, steps=GFX_STEPS, price_h='Graphic design prices', prices=GFX, work_h='Some of my design work', work=['print', 'property', 'patch', 'birdie'],
  areas_line='I’m based in Birmingham and work with businesses across the West and East Midlands, from Sutton Coldfield up to Leicester. Anywhere else in the UK works too, by video call and email.',
  faqs=[('How much does a logo cost in Birmingham?', 'Logo design starts from £300 and a full brand identity from £500. Print is priced per page, with brochures from £45 a page. Whatever you need, you get a fixed quote before we start.'),
        ('How many logo ideas will I see?', 'Usually three first ideas. We then take your favourite and refine it together until it’s right, with two rounds of changes included.'),
        ('What files will I get?', 'Everything you need for print and screen: colour, black and white and reversed versions, in vector and image formats, ready for whoever needs them.'),
        ('Can you arrange printing?', 'Yes. I send print-ready files and can recommend a printer, or deal with the printers for you.'),
        ('Do you work outside Birmingham?', 'Yes. I’m based in Birmingham, but I work with businesses all over the UK by video call and email.')],
  cta_h='Need a logo or a brochure? <mark class="hl">Let’s talk.</mark>',
  other='Need a website too? See <a href="web-designer-birmingham.html">web design in Birmingham</a>, or <a href="web-designer-leicester.html">web design in Leicester</a>. Elsewhere in the UK? See <a href="freelance-web-designer-uk.html">working with me remotely</a>.'),
 dict(slug='web-designer-leicester', share='john-bell-websites', svc='Web design',
  title='Web Designer in Leicester &amp; Leicestershire · John Bell',
  desc='Freelance web designer for Leicester and Leicestershire. Websites, online shops and branding for independents, from Loughborough to Market Harborough. From £500.',
  h1='Web designer for <mark class="hl hl--blue">Leicester and Leicestershire.</mark>',
  lede='Websites, online shops and branding for independents and small businesses across Leicestershire. I’ve designed sites for a hypnobirthing practice, a flower studio in Ravenstone and Kibworth and a vintage rail in Mountsorrel, so I know the area and the sort of businesses that make it what it is.',
  fact='Working across Leicestershire, from Birmingham',
  intro_h='Small local businesses, sites that pull their weight',
  intro='<p>Most of my favourite projects are small Leicestershire businesses run by one or two people: a doula and yoga teacher, a one-woman flower studio, a pre-loved clothing rail tucked inside a village shop. Each one needed a site that felt like them, worked properly on a phone and let people book, buy or get in touch without hunting around.</p><p>I’m based in Birmingham, about an hour away, and happy to meet in person around Leicestershire. The rest of the work happens over video calls and email, and it’s me you deal with the whole way through.</p>',
  svcs=LEI_SVCS, steps=LEI_STEPS, price_h='Web design prices', prices=WEB, work_h='Some of my Leicestershire work', work=['birth-hood', 'birdie', 'beetle', 'patch'],
  areas_line='I work with businesses all over Leicestershire and back down the road to Birmingham, including:',
  areas_after='I also work with businesses anywhere in the UK, by video call and email.',
  faqs=[('Do you work with businesses in Leicester?', 'Yes. Several of my clients are Leicestershire businesses, including Birth-hood, Birdie Blooms in Ravenstone and Kibworth, and Beetle Eyes Clothing in Mountsorrel. I’m based in Birmingham and happy to come and meet you in person.'),
        ('How much does a website cost?', 'One-page websites start from £500, small business sites from £1,200 and small online shops from £1,800. Once we’ve talked it through, I send a fixed quote, so you know where you stand before anything starts.'),
        ('Can you help my business show up on Google locally?', 'Yes. Every site loads quickly and has the setup Google looks for, and I’ll help you set up your Google Business Profile so you appear in local searches and on Maps.'),
        ('Can I update the website myself?', 'Yes, if you want to. One-page sites are kept lean with no back end, which makes them cheaper, quicker and more secure, so normally I make the changes for you, quoted up front, or included on a care plan from £40 a month. If you’d prefer to do it yourself, I can add an editor for £150. Bigger sites and shops have one built in.'),
        ('Do you design logos too?', 'I do. I can design your logo and brand, then build the website to match. For Birdie Blooms I drew eight logo ideas alongside the site.')],
  cta_h='Leicestershire business? <mark class="hl">Let’s have a chat.</mark>',
  other='Looking for design in Birmingham? See <a href="web-designer-birmingham.html">web design</a> and <a href="graphic-designer-birmingham.html">graphic design in Birmingham</a>. Elsewhere in the UK? See <a href="freelance-web-designer-uk.html">freelance web design across the UK</a>.'),
 dict(slug='freelance-web-designer-uk', share='john-bell-websites', svc='Web design and graphic design',
  title='Freelance Web Designer UK · Web &amp; Graphic Design · John Bell',
  desc='Freelance web and graphic designer working with businesses across the UK. Websites, Shopify shops, logos and print, run remotely by video call. Quotes from £500.',
  h1='Freelance web designer, <mark class="hl">working across the UK.</mark>',
  lede='I’m John, a freelance web and graphic designer based in Birmingham. I design websites, online shops, logos and print for small businesses anywhere in the UK, with the whole project run over video calls, email and shared screens.',
  fact='Based in Birmingham, working UK-wide',
  intro_h='A remote web designer who’s easy to reach',
  intro='<p>You don’t need a designer down the road. We talk on a video call, I share the designs on screen so you can see them on a laptop and a phone, and everything else happens by email. It’s quick, and it works wherever your business is.</p><p>I’ve spent 14 years designing for agencies and in-house teams. Now I work as a freelance web designer and freelance graphic designer, directly with business owners, so the person on the first call is the one who designs, builds and launches your site, and who’s still there after launch.</p>',
  svcs=[('Small business websites', 'One-page and multi-page sites for trades, cafés, salons, clinics and services, designed for phones first.'), ('Online shops', 'Small Shopify shops for independents. For bigger stores, every page designed and ready for your developer.'),
        ('Logos and branding', 'A logo, colours and fonts that make everything you put out look like it comes from the same business.'), ('Print and brochures', 'Brochures, flyers, business cards and signage, sent print-ready, with printing arranged if you like.'),
        ('Set up for Google', 'Fast pages, proper titles and descriptions, and the behind-the-scenes setup (SEO) that Google looks for.'), ('Care and updates', 'Changes, new pages and help after launch, by email whenever you need it.')],
  steps=[('A video call', 'We talk it through on a video call at a time that suits you, and I send you a fixed quote.'), ('Designs on your screen', 'You see the designs on a shared screen, then get a link to try them on your own laptop and phone.'),
         ('Built and checked', 'Built, tested on phones and computers and set up for Google, with updates by email along the way.'), ('Live, and looked after', 'It goes live, with help a message away whenever you need something changing.')],
  price_h='Web and graphic design prices', prices=WEB + GFX, work_h='A few of my projects', work=['patch', 'sccc', 'birdie', 'gosweet'],
  areas_h='Where I work',
  areas_line='I’m based in Birmingham and work remotely with businesses all over the UK, including:',
  areas=['London', 'Manchester', 'Leeds', 'Bristol', 'Liverpool', 'Sheffield', 'Nottingham', 'Leicester', 'Birmingham', 'Glasgow', 'Edinburgh', 'Cardiff', 'Newcastle', 'Belfast', 'Southampton', 'Norwich'],
  areas_after='…and everywhere in between.',
  area_ld=[{"@type": "Country", "name": "United Kingdom"}],
  faqs=[('Can you work with me if I’m not in Birmingham?', 'Yes. I’m based in Birmingham, but my projects run over video calls and email, so it makes no difference where in the UK your business is.'),
        ('How do remote projects work?', 'We start with a video call, then I send you a fixed quote. I share the designs on screen and by link so you can see them on your own laptop and phone, and we keep in touch by email while I build. Nothing goes live until you’re happy with it.'),
        ('Do we ever meet in person?', 'Usually there’s no need, as video calls and shared screens cover everything from the first chat to the final checks. If you’re within reach of Birmingham and would like to meet, I’m happy to.'),
        ('How much does it cost?', 'One-page websites start from £500, small business sites from £1,200 and small online shops from £1,800. Logos start from £300, brand identities from £500 and print from £45 a page. You get a fixed quote before we start.'),
        ('How long does it take?', 'Most small business sites take a few weeks from our first call to going live. Shops and bigger sites take longer, and you’ll get a timeline with your quote.')],
  cta_h='Wherever you are, <mark class="hl">let’s talk.</mark>',
  other='Local to the Midlands? See <a href="web-designer-birmingham.html">web design in Birmingham</a>, <a href="graphic-designer-birmingham.html">graphic design in Birmingham</a> or <a href="web-designer-leicester.html">web design in Leicester</a>.'),
]

if __name__ == '__main__':
    for p in PAGES:
        open(f'projects/{p["slug"]}.html', 'w').write(page(p))
        print('wrote', p['slug'])
