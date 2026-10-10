"""Builds the location landing pages in projects/ (web/graphic design in Birmingham, web design in Leicester).
Run from the repo root:  python3 tools/landing.py
Prices are placeholder "from" prices: change them in WEB / GFX / CARE below, re-run, and update the home page tiles."""
import json, html
BASE = 'https://johnpbell7.github.io/JB-Design-Agency/'
EMAIL = 'jb.designagency89@gmail.com'
NAV = open('tools/landing-nav.html').read()

# ===== PRICES (placeholders, to be confirmed by John) =====
WEB = [('One-page website', '£500', 'A shop window for your business: who you are, what you do, and an easy way to get in touch. No logins or back end to look after.', ['Designed for phones first', 'Changes by me, from £35', 'Add your own editor, £150']),
       ('Small business website', '£1,200', 'Separate pages for your services, about, work and contact, with a layout that grows with your business.', ['Up to 5 pages', 'Extra pages from £100', 'Set up for Google']),
       ('Small online shop', '£1,800', 'A Shopify shop for independents, with clear product pages and a quick checkout. For bigger stores I design every page for your developer to build.', ['Shopify set-up', 'Product and collection pages', 'Big stores: designs for your developer'])]
GFX = [('Logo design', '£300', 'A logo that works on a van, a sign, a social profile and a favicon, with a few routes to choose from.', ['Three first ideas', 'Colour and mono versions', 'All file types']),
       ('Brand identity', '£750', 'A logo plus the colours, fonts and simple rules that keep everything looking like you.', ['Logo and variations', 'Colours and fonts', 'One-page brand guide']),
       ('Print design', '£45/page', 'Brochures, business cards, flyers, signage and large format, designed and sent to print ready. Brochures are priced per page, so you only pay for what you need.', ['Brochures from £45 a page', 'Business cards, flyers and leaflets', 'Banners, signs and site boards', 'Printing arranged for you'])]
CARE = 'Website care from £40 a month: changes, updates and help when you need it. Small jobs £35 an hour.'

# Towns covered, Leicester down to Birmingham (one honest list, shown on every location page)
AREAS = ['Birmingham', 'Sutton Coldfield', 'Solihull', 'Lichfield', 'Tamworth', 'Atherstone', 'Nuneaton', 'Hinckley',
         'Coalville', 'Ashby-de-la-Zouch', 'Loughborough', 'Leicester', 'Mountsorrel', 'Kibworth', 'Market Harborough', 'Melton Mowbray']

STEPS = [('A quick chat', 'We talk about your business, then I send you a fixed quote.'), ('Design first', 'You see the designs on a computer and a phone before anything is built.'),
         ('Built and checked', 'I build it, test it on phones and computers, and set it up for Google.'), ('Live, and looked after', 'It goes live, and I’m still around if you need anything after.')]

WEB_SVCS = [('Small business websites', 'One-page and multi-page sites for trades, cafés, salons, clinics and local services.'), ('Online shops', 'Small Shopify shops for independents. For bigger stores, I design every page and hand it to your developer.'),
            ('Set up for Google', 'Fast pages, proper titles and descriptions, and the behind-the-scenes setup Google looks for (SEO).'), ('Easy to update', 'One-page sites need no upkeep: I make changes for you, or add an editor for £150. Bigger sites come with an editor included.'),
            ('Redesigns', 'A fresh, faster version of the site you have, keeping what works.'), ('Care and updates', 'Changes, new pages and help whenever you need it after launch.')]
GFX_SVCS = [('Logo design', 'Logos that work small and large, in colour and black and white, on screen and in print.'), ('Brand identity', 'Colours, fonts and simple rules that keep everything looking like you.'),
            ('Brochures and reports', 'Clear, well-organised layouts for brochures, annual reports and newsletters.'), ('Business cards and flyers', 'Business cards, flyers and leaflets for promotions, events and door-to-door.'),
            ('Large format and signage', 'Shop signs, banners, roller banners, vehicle graphics, site boards and packaging.'), ('Packaging and labels', 'Boxes, labels and tins that stand out on the shelf.')]

W = lambda h, img, alt, n, k: (h, img, alt, n, k)
WORK = {'birth-hood': W('birth-hood.html', 'captures/birth-hood/fold-desktop.webp', 'Birth-hood website', 'Birth-hood', 'Website for a hypnobirthing and doula business in Leicestershire'),
        'patch': W('patch.html', 'captures/patch-agency/fold-desktop.webp', 'PATCH website', 'PATCH', 'Brand and website for a field-marketing agency'),
        'vsl': W('vsl-trade.html', 'captures/vsl-trade/fold-desktop.webp', 'VSL Trade website', 'VSL Trade', 'Trade website for a wholesaler'),
        'gosweet': W('gosweet.html', 'captures/gosweet/fold-desktop.webp', 'GoSweet online shop', 'GoSweet', 'Online shop redesign'),
        'birdie': W('birdie-blooms.html', 'captures/birdie-blooms/fold-desktop.webp', 'Birdie Blooms website', 'Birdie Blooms', 'Website and brand for a flower studio in Ravenstone and Kibworth'),
        'beetle': W('beetle-eyes.html', 'captures/beetle-eyes/fold-desktop.webp', 'Beetle Eyes Clothing website', 'Beetle Eyes Clothing', 'One-page site for a vintage rail in Mountsorrel'),
        'sccc': W('sccc-heritage.html', 'captures/sccc-heritage/fold-desktop.webp', 'Sutton Coldfield Cricket Club history website', 'SCCC Heritage', 'History website for Sutton Coldfield Cricket Club'),
        'print': W('print.html', 'projects/print/gowling/cover.jpg', 'Gowling WLG report cover', 'Print and brand', 'Reports, newsletters, logos and campaigns'),
        'property': W('property.html', 'projects/property/spreads/sloane-1.jpg', 'Property brochure spread', 'Property marketing', 'Brochures, boards and development identities')}

def prices(items):
    cards = ''.join(f'<article class="lp-price"><h3>{n}</h3><p class="lp-price__from"><span>from</span> {p.split('/')[0]}{'<em>/' + p.split('/')[1] + '</em>' if '/' in p else ''}</p><p>{d}</p><ul>{"".join(f"<li>{x}</li>" for x in l)}</ul></article>' for n, p, d, l in items)
    return f'<div class="lp-prices">{cards}</div><p class="lp-prices__note">{CARE}</p>'

def page(p):
    url = f'{BASE}projects/{p["slug"]}.html'; img = f'{BASE}assets/share/{p["share"]}.jpg'
    t = html.unescape(p['title']); e = lambda x: html.escape(x, quote=True)
    name = p['h1'].replace('<mark class="hl">', '').replace('<mark class="hl hl--pink">', '').replace('<mark class="hl hl--blue">', '').replace('</mark>', '')
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "name": name, "serviceType": p['svc'], "url": url, "description": p['desc'],
         "provider": {"@type": "ProfessionalService", "@id": BASE + "#business", "name": "John Bell · Graphic & Web Designer", "url": BASE},
         "areaServed": [{"@type": "City", "name": a} for a in AREAS] + [{"@type": "Country", "name": "United Kingdom"}],
         "offers": [{"@type": "Offer", "name": n, "priceCurrency": "GBP", "priceSpecification": {"@type": "PriceSpecification", "minPrice": pr.split('/')[0].replace('£', '').replace(',', ''), "priceCurrency": "GBP"}} for n, pr, _, _ in p['prices']]},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p['faqs']]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE}, {"@type": "ListItem", "position": 2, "name": name.rstrip('.'), "item": url}]}]}
    work = ''.join(f'<a class="lp-card" href="{h}"><img src="../assets/{im}" alt="{alt}" loading="lazy" width="1440" height="900"><span><b>{n}</b>{k}</span></a>' for h, im, alt, n, k in (WORK[k] for k in p['work']))
    areas = ''.join(f'<li>{a}</li>' for a in AREAS)
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
  <script src="../assets/js/theme.js"></script>
  <link rel="preload" href="../assets/fonts/poppins-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/poppins-700-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../assets/css/fonts.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/landing.css">
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
      <ol class="lp-steps">{"".join(f"<li><h3>{a}</h3><p>{b}</p></li>" for a, b in STEPS)}</ol>
    </section>

    <section class="lp-sec wrap lp-areas">
      <h2>Areas I cover</h2>
      <div><p>{p["areas_line"]}</p><ul class="lp-areas__list">{areas}</ul></div>
    </section>

    <section class="lp-sec wrap lp-faq">
      <h2>Questions people ask</h2>
      <div>{"".join(f"<details class='lp-faq__q'><summary>{q}</summary><p>{a}</p></details>" for q, a in p["faqs"])}</div>
    </section>

    <section class="lp-cta wrap" id="contact">
      <h2>Let’s make something <mark class="hl">people like to use.</mark></h2>
      <p>Tell me a bit about your business and what you need. I usually reply within a working day.</p>
      <div class="lp-hero__ctas"><a class="btn btn--big btn--keep" href="../index.html#contact">Start a project <span aria-hidden="true">→</span></a><a class="btn btn--ghost btn--big" href="mailto:{EMAIL}">Email me</a></div>
      <p class="lp-other">{p["other"]}</p>
    </section>
  </main>

  <footer class="site-foot">
    <div class="wrap">
      <div class="site-foot__row">
        <span>© 2026 John Bell · Designed and built by me</span>
        <nav aria-label="Footer"><a href="work.html">Work</a><a href="about.html">About</a><a href="../index.html#faq">FAQs</a><a href="mailto:{EMAIL}">Email</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="web-designer-birmingham.html">Web design Birmingham</a><a href="graphic-designer-birmingham.html">Graphic design Birmingham</a><a href="web-designer-leicester.html">Web design Leicester</a></nav>
      </div>
    </div>
  </footer>
</body>
</html>
'''

PAGES = [
 dict(slug='web-designer-birmingham', share='web-designer-birmingham', svc='Web design',
  title='Web Designer in Birmingham · John Bell, Freelance Web Design',
  desc='Freelance web designer in Birmingham. Fast, mobile-friendly websites and Shopify shops for small businesses, designed and built by John Bell, with fixed quotes from £500.',
  h1='Web designer <mark class="hl">in Birmingham.</mark>',
  lede='I design and build websites for independents and small businesses in Birmingham and across the UK. Clear, fast sites that work well on a phone, show up on Google and make it easy for people to get in touch.',
  fact='Based in Birmingham, working UK-wide',
  intro_h='A website that does its job',
  intro='<p>Most people will find you on their phone, often in a hurry. So I design every site for phones first, keep pages quick to load, and make the next step obvious: call, book, buy or send a message.</p><p>I’ve spent 14 years designing for agencies and in-house teams, and now I work directly with business owners. You talk to the person designing and building your site, from the first chat to launch day and after.</p>',
  svcs=WEB_SVCS, price_h='Web design prices', prices=WEB, work_h='Some of my websites', work=['birth-hood', 'patch', 'vsl', 'sccc'],
  areas_line='I’m based in Birmingham and work with businesses across the West Midlands and the East Midlands, from Birmingham and Sutton Coldfield up to Leicester. Further afield is no problem: most projects run on video calls and email.',
  faqs=[('How much does a website cost in Birmingham?', 'A one-page website starts from £500, a small business site from £1,200 and a small online shop from £1,800. After a quick chat I send a fixed quote, so you know the full price before we start.'),
        ('How long does a website take?', 'A small business site usually takes a few weeks from our first chat to going live. Shops and bigger sites take longer. You’ll get a timeline with your quote.'),
        ('Do I need to be in Birmingham?', 'No. I’m based in Birmingham and happy to meet locally, but most of my work happens over video calls and email, so I work with businesses all over the UK.'),
        ('Can I update the website myself?', 'It depends on the site. A one-page site is a shop window with no back end, which keeps it cheaper, faster and more secure; when you need a change, I make it for you, from £35 or from £40 a month on a care plan. Rather do it yourself? I can add an easy editor to a one-page site for £150. Bigger sites and shops come with one included.'),
        ('Will my website show up on Google?', 'Every site is built to load quickly, work well on phones and include the setup Google looks for. I’ll also help you set up Google Search Console and your Google Business Profile.')],
  other='Need a logo, brand or print as well? See <a href="graphic-designer-birmingham.html">graphic design in Birmingham</a>. In Leicestershire? See <a href="web-designer-leicester.html">web design in Leicester</a>.'),
 dict(slug='graphic-designer-birmingham', share='graphic-designer-birmingham', svc='Graphic design',
  title='Graphic Designer in Birmingham · John Bell, Logos, Branding &amp; Print',
  desc='Freelance graphic designer in Birmingham. Logo design, brand identity, brochures, flyers and packaging for small businesses, by John Bell, with 14 years’ agency and in-house experience.',
  h1='Graphic designer <mark class="hl hl--pink">in Birmingham.</mark>',
  lede='Logos, brand identities and print for independents and small businesses in Birmingham and across the UK. Design that looks right everywhere it goes, from a van and a shop sign to a brochure and your website.',
  fact='Based in Birmingham, working UK-wide',
  intro_h='Design that makes you look the part',
  intro='<p>People decide quickly whether a business looks trustworthy. A clear logo, a consistent look and well-made print do a lot of that work for you, before anyone has read a word.</p><p>I’ve spent 14 years designing brands, reports, brochures and campaigns for agencies and in-house teams, for charities, law firms, housebuilders and local trades. Now you can work with me directly.</p>',
  svcs=GFX_SVCS, price_h='Graphic design prices', prices=GFX, work_h='Some of my design work', work=['print', 'property', 'patch', 'birdie'],
  areas_line='I’m based in Birmingham and work with businesses across the West Midlands and the East Midlands, from Birmingham and Sutton Coldfield up to Leicester, and all over the UK by video call and email.',
  faqs=[('How much does a logo cost in Birmingham?', 'Logo design starts from £300, and a full brand identity from £750. Print is priced per page, with brochures from £45 a page. You get a fixed quote before we start.'),
        ('How many logo ideas will I see?', 'Usually three first ideas, then we refine your favourite together until it’s right.'),
        ('What files will I get?', 'Everything you need for print and screen: colour, black and white and reversed versions in vector and image formats.'),
        ('Can you arrange printing?', 'Yes. I send print-ready files and can recommend printers or deal with them for you.'),
        ('Do you work outside Birmingham?', 'Yes. I’m based in Birmingham, but I work with businesses all over the UK by video call and email.')],
  other='Need a website too? See <a href="web-designer-birmingham.html">web design in Birmingham</a>, or <a href="web-designer-leicester.html">web design in Leicester</a>.'),
 dict(slug='web-designer-leicester', share='web-designer-leicester', svc='Web design',
  title='Web Designer in Leicester &amp; Leicestershire · John Bell',
  desc='Freelance web designer for Leicester and Leicestershire businesses. Websites, online shops and branding for independents, from Loughborough and Coalville to Hinckley and Market Harborough. Fixed quotes from £500.',
  h1='Web designer for <mark class="hl hl--blue">Leicester and Leicestershire.</mark>',
  lede='Websites, online shops and branding for independents and small businesses across Leicestershire. I’ve designed sites for a hypnobirthing practice, a flower studio in Ravenstone and Kibworth and a vintage rail in Mountsorrel, so I know the area and the kind of businesses that make it.',
  fact='Working across Leicestershire, from Birmingham',
  intro_h='Local businesses, sites that work hard',
  intro='<p>Most of my favourite projects are small Leicestershire businesses run by one or two people: a doula and yoga teacher, a one-woman flower studio, a pre-loved clothing rail inside a village shop. Each needed a site that looked like them, worked well on a phone and made it easy to book, buy or get in touch.</p><p>I’m based in Birmingham, about an hour away, and happy to meet in person around Leicestershire. The rest of the work happens over video calls and email, and you deal with me the whole way through.</p>',
  svcs=WEB_SVCS, price_h='Web design prices', prices=WEB, work_h='Some of my Leicestershire work', work=['birth-hood', 'birdie', 'beetle', 'patch'],
  areas_line='I work with businesses right across Leicestershire and down to Birmingham, including:',
  faqs=[('Do you work with businesses in Leicester?', 'Yes. Several of my clients are in Leicestershire, including Birth-hood, Birdie Blooms in Ravenstone and Kibworth, and Beetle Eyes Clothing in Mountsorrel. I’m based in Birmingham and happy to meet in person.'),
        ('How much does a website cost?', 'A one-page website starts from £500, a small business site from £1,200 and a small online shop from £1,800. After a quick chat I send a fixed quote, so you know the full price before we start.'),
        ('Can you help my business show up on Google locally?', 'Yes. Every site is built to load quickly and include the setup Google looks for, and I’ll help you set up your Google Business Profile so you show up in local searches and on Maps.'),
        ('Can I update the website myself?', 'It depends on the site. A one-page site is a shop window with no back end, which keeps it cheaper, faster and more secure; when you need a change, I make it for you, from £35 or from £40 a month on a care plan. Rather do it yourself? I can add an easy editor to a one-page site for £150. Bigger sites and shops come with one included.'),
        ('Do you design logos too?', 'Yes. I can design your logo and brand, then build the site to match. For Birdie Blooms I drew eight logo ideas alongside the website.')],
  other='Looking for design in Birmingham? See <a href="web-designer-birmingham.html">web design</a> and <a href="graphic-designer-birmingham.html">graphic design in Birmingham</a>.'),
]

if __name__ == '__main__':
    for p in PAGES:
        open(f'projects/{p["slug"]}.html', 'w').write(page(p))
        print('wrote', p['slug'])
