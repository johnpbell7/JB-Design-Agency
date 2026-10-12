"""Builds the guides in projects/ (how much a website costs, logo or website first, how long a site takes, Shopify or a website).
Run from the repo root:  python3 tools/guides.py
Prices quoted in the guides match the home page cards (index.html). If prices change there, change them here too."""
import json, html, sys
sys.path.insert(0, 'tools')
from landing import BASE, EMAIL, PHONE, PHONE_INTL, NAV
from footer import footer_cols

PUBLISHED = '2026-10-12'

def page(g):
    url = f'{BASE}projects/{g["slug"]}.html'; img = f'{BASE}assets/share/john-bell-websites.jpg'
    e = lambda x: html.escape(x, quote=True)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": g['h1_text'], "description": g['desc'], "url": url, "mainEntityOfPage": url, "image": img,
         "datePublished": PUBLISHED, "dateModified": g.get('modified', PUBLISHED), "inLanguage": "en-GB",
         "author": {"@id": BASE + "#john"}, "publisher": {"@id": BASE + "#business"}},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": html.unescape(a)}} for q, a in g['faqs']]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
                                                         {"@type": "ListItem", "position": 2, "name": g['crumb'], "item": url}]}]}
    cols = footer_cols(False)
    wa = f'https://wa.me/{PHONE_INTL[1:]}?text=Hi%20John%2C%20I%20found%20you%20through%20your%20website%20and%20I%E2%80%99d%20like%20to%20chat%20about%20a%20project.'
    wa_svg = '<svg viewBox="0 0 24 24" width="{s}" height="{s}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 20.4l1.2-4.1a8.4 8.4 0 1 1 3.3 3.2z"/><path d="M9.2 8.6c-.2 2.9 3.1 6.3 6.2 6.2l.9-1.4-1.9-1-1 .7a4.2 4.2 0 0 1-2.1-2.1l.7-1-1-1.9z" fill="currentColor" stroke="none"/></svg>'
    return f'''<!doctype html>
<html lang="en-GB" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{g["title"]}</title>
  <meta name="description" content="{g["desc"]}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="John Bell · Web Designer">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{e(html.unescape(g["title"]))}">
  <meta property="og:description" content="{g["desc"]}">
  <meta property="og:image" content="{img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="article:published_time" content="{PUBLISHED}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(html.unescape(g["title"]))}">
  <meta name="twitter:description" content="{g["desc"]}">
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
  <link rel="stylesheet" href="../assets/css/base.css?v=6">
  <link rel="stylesheet" href="../assets/css/landing.css?v=2">
  <link rel="stylesheet" href="../assets/css/guide.css?v=1">
  <script type="application/ld+json" data-seo>
{json.dumps(ld, ensure_ascii=False, indent=1)}
  </script>
  <link rel="stylesheet" href="../assets/css/type.css?v=5">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
{NAV}
  <main id="main" class="lp guide">
    <article>
      <header class="lp-hero wrap guide__head">
        <p class="guide__kicker">Guide · {g["read"]} min read</p>
        <h1>{g["h1"]}</h1>
        <p class="lp-hero__lede">{g["lede"]}</p>
        <p class="guide__by">By John Bell, freelance web and graphic designer in Birmingham · <time datetime="{g.get('modified', PUBLISHED)}">October 2026</time></p>
      </header>
      <div class="wrap guide__body">
        <aside class="guide__short"><p class="guide__short-h">The short answer</p>{g["short"]}</aside>
        {g["body"]}
      </div>
    </article>

    <section class="lp-sec wrap lp-faq">
      <h2>Questions people ask</h2>
      <div>{"".join(f"<details class='lp-faq__q'><summary>{q}</summary><p>{a}</p></details>" for q, a in g["faqs"])}</div>
    </section>

    <section class="lp-cta wrap" id="contact">
      <h2>{g["cta_h"]}</h2>
      <p>Tell me a bit about your business and what you need, and I’ll send you a fixed quote. I usually reply within a working day.</p>
      <div class="lp-hero__ctas"><a class="btn btn--big btn--keep" href="../index.html#contact">Start a project <span aria-hidden="true">→</span></a><a class="btn btn--ghost btn--big" href="mailto:{EMAIL}">Email me</a></div>
      <div class="contact__reach"><a class="contact__pill" href="tel:{PHONE_INTL}">Call or text {PHONE}</a><a class="contact__pill" href="sms:{PHONE_INTL}">Send a text</a><a class="contact__pill" href="{wa}" target="_blank" rel="noopener">{wa_svg.format(s=16)}WhatsApp me</a></div>
      <p class="lp-other">{g["other"]}</p>
    </section>
  </main>

  <footer class="site-foot">
    <div class="wrap">
      <div class="site-foot__grid">
        <div class="sf-brand"><a class="sf-name" href="../index.html">John Bell</a><p>Freelance web and graphic designer. Based in Birmingham, working with businesses across the UK.</p></div>
        {cols["Pages"]}
        <div class="sf-col"><p class="sf-h">Get in touch</p><a href="../index.html#contact">Start a project</a><a href="mailto:{EMAIL}">Email</a><a href="tel:{PHONE_INTL}">{PHONE}</a><a class="sf-wa" href="{wa}" target="_blank" rel="noopener">{wa_svg.format(s=17)}WhatsApp me</a></div>
        {cols["Areas"]}
        {cols["Guides"]}
      </div>
      <div class="site-foot__base"><span>© 2026 John Bell · Designed and built by me</span><span><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></span></div>
    </div>
  </footer>
</body>
</html>
'''

def table(head, rows):
    return ('<div class="guide__table"><table><thead><tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr></thead><tbody>'
            + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table></div>')

GUIDES = [
 dict(slug='how-much-does-a-website-cost', crumb='How much does a website cost?', read=6,
  title='How Much Does a Website Cost in the UK? (2026 Guide) · John Bell',
  desc='What a small business website really costs in the UK in 2026: DIY, freelancer and agency prices, what changes the price, and the running costs after launch.',
  h1='How much does a website <mark class="hl">cost in 2026?</mark>', h1_text='How much does a website cost in 2026?',
  lede='The honest answer to the question every small business asks first, with real prices, what pushes them up or down, and what you’ll pay once the site is live.',
  short='<p>For a small UK business, a professionally designed website usually costs <b>£500 to £3,000</b> with a freelancer, and <b>£3,000 to £15,000 or more</b> with an agency. A small online shop starts at around <b>£1,800</b>. After launch, expect about <b>£10 to £50 a month</b> for hosting, your domain and help with changes.</p>',
  body='''
        <h2>The three ways to get a website</h2>
        <p>Most small businesses choose between doing it themselves, hiring a freelancer or hiring an agency. Each has its place.</p>
''' + table(['Option', 'Typical cost', 'Good for'], [
    ['Website builder (Wix, Squarespace)', '£10–£40 a month, plus your time', 'Testing an idea on a tight budget, if you enjoy doing it yourself'],
    ['Freelance web designer', '£500–£3,000', 'Most small businesses: a proper site, one person from start to finish'],
    ['Agency', '£3,000–£15,000+', 'Larger firms needing a team, complex systems or ongoing campaigns']]) + '''
        <p>Website builders look cheap, but the monthly fee never stops, and the real cost is the evenings you spend on it. A freelancer usually costs less than an agency because there’s no account manager or office to pay for. You speak to the person who actually designs and builds your site.</p>

        <h2>What I charge</h2>
        <p>These are my starting prices. Every project gets a fixed quote after a quick chat, so you know the full price before anything starts.</p>
''' + table(['Website', 'From', 'What you get'], [
    ['Small website', '£500', 'A one-page shop window: who you are, what you do and how to get in touch'],
    ['Medium website', '£900', 'Five pages or more: services, about, work, contact'],
    ['Large website', '£1,500', 'Ten pages or more, with an editor so you can change it yourself'],
    ['Small online shop', '£1,800', 'A Shopify shop with product pages, payments and delivery set up'],
    ['Logo + small website', '£700', 'Both together, saving £100']]) + '''
        <p>Extra pages are £100 each. Search pages for your main services and towns are included, and so are two rounds of amends.</p>

        <h2>What makes a website cost more</h2>
        <ul>
          <li><b>Number of pages.</b> Each page needs designing, writing and testing on phones.</li>
          <li><b>Who writes the words.</b> If you supply the text and photos, it costs less. Writing it from scratch takes time.</li>
          <li><b>Editing it yourself.</b> A site you can update needs an editor built in, which adds to the build.</li>
          <li><b>Bookings, forms and payments.</b> Taking bookings or payments online adds set-up and testing.</li>
          <li><b>Selling products.</b> Shops need product pages, stock, delivery and payments, so they start higher.</li>
          <li><b>Branding.</b> If you don’t have a logo yet, it’s worth doing it alongside the site (see <a href="logo-or-website-first.html">logo or website first?</a>).</li>
        </ul>

        <h2>Running costs after launch</h2>
''' + table(['Cost', 'Roughly', 'Notes'], [
    ['Domain name', '£10–£20 a year', 'Your web address, registered in your name'],
    ['Hosting', 'From £10 a month', 'Keeps the site online, fast and secure'],
    ['Care plan', 'From £40 a month', 'Hosting, updates and changes when you need them'],
    ['Shopify (shops only)', 'From around £25 a month', 'Plus card fees on each sale. Check Shopify’s current prices']]) + '''
        <p>A simple one-page site with no back end needs almost no upkeep. When you need a change, I make it for you, quoted up front, or it’s included on a care plan.</p>

        <h2>Questions to ask any web designer</h2>
        <ul>
          <li>Is the price fixed, and what exactly is included?</li>
          <li>How many rounds of changes do I get?</li>
          <li>Who owns the site and the domain once it’s paid for?</li>
          <li>What will I pay each month or year after launch?</li>
          <li>Will it work well on phones, and is it set up for Google?</li>
        </ul>
        <p>Whoever you choose, you should get clear answers to all five before you pay a deposit.</p>
''',
  faqs=[('How much does a small business website cost in the UK?', 'With a freelancer, usually £500 to £3,000 depending on pages and features. My small websites start from £500, five pages or more from £900, and ten or more from £1,500.'),
        ('How much does an online shop cost?', 'A small Shopify shop starts from around £1,800 to design and set up, plus Shopify’s monthly fee and card fees on each sale.'),
        ('Are there monthly costs?', 'Yes: a domain (about £10–£20 a year) and hosting (from £10 a month). A care plan from £40 a month covers hosting, updates and changes.'),
        ('Do I pay everything up front?', 'No. I usually take a 50% deposit to start and the rest when the site goes live.')],
  cta_h='Want a fixed price for your site? <mark class="hl">Let’s talk.</mark>',
  other='Next: <a href="how-long-does-a-website-take.html">how long a website takes</a>, or see <a href="web-designer-birmingham.html">web design in Birmingham</a>.'),

 dict(slug='logo-or-website-first', crumb='Do I need a logo before a website?', read=4,
  title='Do I Need a Logo Before a Website? · John Bell',
  desc='Should you get a logo before your website? When it matters, when it doesn’t, and why doing both together usually saves time and money.',
  h1='Do I need a logo <mark class="hl hl--pink">before a website?</mark>', h1_text='Do I need a logo before a website?',
  lede='It’s one of the first questions new businesses ask. Here’s when a logo should come first, when you can start without one, and why doing both together often works out best.',
  short='<p><b>Ideally, yes</b>, or at least at the same time. Your logo sets the colours, fonts and feel that the website is built around. If you start the site first, you’ll often end up changing it once the logo arrives. Doing both together is usually quicker and cheaper.</p>',
  body='''
        <h2>Why the logo usually comes first</h2>
        <p>A website isn’t just your logo in the top corner. Its colours, fonts, buttons and even the style of the photos all come from your brand. When the logo is settled, the website design follows naturally, and everything you make afterwards (signs, cards, social posts) matches.</p>
        <p>If the website is designed first, the logo has to fit around it. That often means compromises, or going back and changing the site once you’ve chosen the logo.</p>

        <h2>When you can start without one</h2>
        <ul>
          <li><b>You need to be online this week.</b> A simple, clean site with your business name set in a good font is far better than nothing. You can add a logo later.</li>
          <li><b>You’re testing an idea.</b> If you’re not sure the business will run, a smart name-only site keeps costs down.</li>
          <li><b>Your name is the brand.</b> Consultants, therapists and tradespeople often do well with a well-set name rather than a symbol.</li>
        </ul>

        <h2>Doing both together</h2>
        <p>This is what most of my clients choose. We start with the logo, agree it, then design the site around it, all in one project with one person. You avoid paying twice for the same thinking, and everything is ready together.</p>
''' + table(['Option', 'From'], [['Logo design', '£300'], ['Brand identity (logo, colours, fonts, guide)', '£500'], ['Small website', '£500'], ['Logo + small website', '£700 (save £100)']]) + '''
        <p>For Birdie Blooms, a flower studio, I drew eight logo ideas, then designed the website around the one they chose. You can <a href="birdie-blooms.html">see the project here</a>.</p>

        <h2>What to have ready before either</h2>
        <ul>
          <li>Your business name, and how you want it written</li>
          <li>Two or three businesses whose look you like (in any industry)</li>
          <li>Who your customers are, and what they should feel when they find you</li>
          <li>Anything you’re attached to already: a colour, a symbol, an old sign</li>
        </ul>
''',
  faqs=[('Can I add a logo to my website later?', 'Yes. A logo can always be added later, but if it changes your colours and fonts, parts of the site may need restyling to match.'),
        ('How much does a logo and website cost together?', 'A logo and small website together start from £700, which saves £100 on doing them separately.'),
        ('Can you design a logo from my rough idea?', 'Yes. Bring a sketch, a photo or just a description. You’ll see a few options, then we refine your favourite with two rounds of amends included.')],
  cta_h='Need a logo, a website, or both? <mark class="hl">Let’s talk.</mark>',
  other='See <a href="graphic-designer-birmingham.html">logo and graphic design</a>, or read <a href="how-much-does-a-website-cost.html">how much a website costs</a>.'),

 dict(slug='how-long-does-a-website-take', crumb='How long does a website take?', read=4,
  title='How Long Does It Take to Build a Website? · John Bell',
  desc='How long a small business website takes to build, from about a week for a small site to four weeks or more for a shop, and how to get yours live sooner.',
  h1='How long does a website <mark class="hl hl--blue">take to build?</mark>', h1_text='How long does it take to build a website?',
  lede='Realistic timings for small business websites and shops, what happens at each stage, and the one thing that holds most projects up.',
  short='<p>A small website usually takes <b>about a week</b> from the first chat to going live. A medium site takes <b>2 to 3 weeks</b>, and a larger site or online shop <b>4 weeks or more</b>. The biggest factor isn’t the build: it’s how quickly the words and photos are ready.</p>',
  body='''
        <h2>Typical timings</h2>
''' + table(['Project', 'Usually takes'], [['Small website (one page)', 'About 1 week'], ['Medium website (5+ pages)', '2–3 weeks'], ['Large website (10+ pages)', '4+ weeks'], ['Small online shop', '4+ weeks'], ['Logo design', '3–4 days']]) + '''
        <p>You’ll get a timeline with your quote, so you know what to expect before you commit. <b>Need it sooner? A fast turnaround can be requested:</b> tell me your date when you get in touch and I’ll say honestly if it’s doable.</p>

        <h2>What happens, step by step</h2>
        <ol>
          <li><b>A quick chat and a quote</b> (a day or two). We talk through what you need, and I send a fixed price and timeline.</li>
          <li><b>Designs</b> (a few days). You see the site on a laptop and a phone before anything is built.</li>
          <li><b>Changes</b> (a day or two). Two rounds of amends are included.</li>
          <li><b>Build and test</b> (a few days for a small site, longer for bigger ones). The site is built and tested on phones and computers, and set up for Google.</li>
          <li><b>Launch</b> (a day). It goes live on your domain, and I’m on hand for anything that needs tweaking.</li>
        </ol>

        <h2>What slows a website down</h2>
        <p>In my experience, it’s rarely the design or the build. It’s waiting for content: the words for each page, photos, prices and the details only you know. The second most common delay is a long chain of decision-makers.</p>

        <h2>How to get your site live sooner</h2>
        <ul>
          <li>Write your page text early, even rough notes. I can tidy it up.</li>
          <li>Gather photos of your work, your team and your premises.</li>
          <li>Decide who signs off the design, and keep it to one or two people.</li>
          <li>Have your domain login to hand (or let me register one in your name).</li>
          <li>Start with a smaller site and add pages after launch.</li>
        </ul>
''',
  faqs=[('Can you build a website in a week?', 'Yes, usually, for a small site where the words and photos are ready. If you have a deadline, a fast turnaround can be requested for bigger sites too: tell me the date and I’ll say honestly what’s possible.'),
        ('What do I need to provide?', 'The words for each page (or notes I can work from), photos, your logo if you have one, and access to your domain if you already own it.'),
        ('Can I make changes after launch?', 'Yes. Send me what needs changing and I’ll quote it up front, or it’s included on a care plan from £40 a month.')],
  cta_h='Got a deadline? <mark class="hl">Let’s talk.</mark>',
  other='Read <a href="how-much-does-a-website-cost.html">how much a website costs</a>, or see <a href="web-designer-birmingham.html">web design in Birmingham</a>.'),

 dict(slug='shopify-or-website', crumb='Shopify or a normal website?', read=5,
  title='Shopify or a Normal Website? Which to Choose · John Bell',
  desc='Do you need a Shopify shop or a normal website? A plain guide for small businesses: what each is for, what they cost, and how to choose.',
  h1='Shopify or a <mark class="hl hl--green">normal website?</mark>', h1_text='Shopify or a normal website?',
  lede='If you sell something, it’s easy to assume you need an online shop. Often you do, but sometimes a normal website with a booking form or a payment link does the job for far less.',
  short='<p>If you sell <b>products</b> online, with stock, delivery and lots of orders, use <b>Shopify</b>. If you sell <b>services</b> (appointments, quotes, projects), a <b>normal website</b> with a contact or booking form is simpler and cheaper. Only a few products? A normal site with payment links can be enough to start.</p>',
  body='''
        <h2>The quick way to decide</h2>
''' + table(['If you…', 'You probably need'], [
    ['Sell physical products to the public and post them out', 'Shopify'],
    ['Sell more than about 10 products, or have sizes and colours', 'Shopify'],
    ['Sell services, appointments or one-off projects', 'A normal website'],
    ['Want people to call, book or ask for a quote', 'A normal website'],
    ['Sell a handful of products or vouchers', 'A normal website with payment links (start here, move to Shopify later)'],
    ['Sell to trade customers on account', 'A trade website with registration, or a Shopify B2B set-up']]) + '''

        <h2>What Shopify is good at</h2>
        <ul>
          <li>Product pages, stock, sizes and colours, all easy to manage yourself</li>
          <li>Secure checkout, card payments, Apple Pay and Google Pay</li>
          <li>Delivery rates, discount codes, gift cards and order emails</li>
          <li>An app on your phone to see and fulfil orders</li>
        </ul>
        <p>The trade-off is cost: Shopify charges a monthly fee (from around £25 on its Basic plan; check their current prices) plus card fees on each sale, and paid apps can add up.</p>

        <h2>What a normal website is good at</h2>
        <ul>
          <li>Explaining what you do and why people should choose you</li>
          <li>Getting enquiries: calls, quote requests, bookings and WhatsApp messages</li>
          <li>Showing your work, reviews and prices</li>
          <li>Low running costs, often just hosting from £10 a month</li>
        </ul>

        <h2>What each costs with me</h2>
''' + table(['', 'From', 'Then each month'], [['Small website', '£500', 'Hosting from £10'], ['Medium website', '£900', 'Hosting from £10'], ['Small Shopify shop', '£1,800', 'Shopify’s fee and card fees'], ['Shop refresh (existing Shopify)', '£950', 'No change']]) + '''
        <p>Bigger stores with hundreds of products often have their own developer. For those, I design every page for the developer to build (from £900).</p>

        <h2>Start small, grow later</h2>
        <p>Many businesses start with a normal website and a few payment links, then move to Shopify once orders pick up. Your domain, branding and Google rankings come with you, so nothing is wasted.</p>
''',
  faqs=[('Is Shopify worth it for a small business?', 'Yes, if you sell products online regularly. For a service business, or only a few products, a normal website is usually cheaper and simpler.'),
        ('Can I take payments on a normal website?', 'Yes. Payment links or a simple checkout can take card payments for a few products, deposits or vouchers without a full shop.'),
        ('Can you move my shop to Shopify?', 'Yes. I can design and set up a new Shopify shop or refresh an existing one, and help move your products across.')],
  cta_h='Not sure which you need? <mark class="hl">Ask me.</mark>',
  other='See <a href="gosweet.html">an online shop I designed</a>, or read <a href="how-much-does-a-website-cost.html">how much a website costs</a>.'),
]

if __name__ == '__main__':
    for g in GUIDES:
        open(f'projects/{g["slug"]}.html', 'w').write(page(g))
        print('wrote', g['slug'])
