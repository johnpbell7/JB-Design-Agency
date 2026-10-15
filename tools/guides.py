"""Builds the guides in projects/ (how much a website costs, logo or website first, how long a site takes, Shopify or a website,
how much a logo costs, Wix or Squarespace vs a web designer, getting on Google, what a small business website should include).
Each guide can set its own published date ('published'); 'modified' defaults to it.
Run from the repo root:  python3 tools/guides.py
Prices quoted in the guides match the home page cards (index.html). If prices change there, change them here too."""
import json, html, sys, datetime
sys.path.insert(0, 'tools')
from landing import BASE, EMAIL, PHONE, PHONE_INTL, NAV
from footer import footer_cols

PUBLISHED = '2026-10-12'

def page(g):
    url = f'{BASE}projects/{g["slug"]}.html'; img = f'{BASE}assets/share/guides.jpg'
    pub = g.get('published', PUBLISHED); mod = g.get('modified', pub)
    e = lambda x: html.escape(x, quote=True)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": g['h1_text'], "description": g['desc'], "url": url, "mainEntityOfPage": url, "image": img,
         "datePublished": pub, "dateModified": mod, "inLanguage": "en-GB",
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
  <meta property="og:site_name" content="JB Design Agency">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{e(html.unescape(g["title"]))}">
  <meta property="og:description" content="{g["desc"]}">
  <meta property="og:image" content="{img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="JB Design Agency guides: plain-English answers for small businesses on websites, logos, costs and getting found on Google">
  <meta property="article:published_time" content="{pub}">
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
        <p class="guide__by">By John Bell, freelance web and graphic designer in Birmingham · <time datetime="{mod}">{datetime.date.fromisoformat(mod).strftime('%B %Y')}</time></p>
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
        <div class="sf-brand"><a class="sf-name" href="../index.html">JB Design Agency</a><p>Web design, branding, print &amp; everything in between. Freelance, based in Birmingham, working with businesses across the UK.</p></div>
        {cols["Pages"]}
        <div class="sf-col"><p class="sf-h">Get in touch</p><a href="../index.html#contact">Start a project</a><a href="mailto:{EMAIL}">Email</a><a href="tel:{PHONE_INTL}">{PHONE}</a><a class="sf-wa" href="{wa}" target="_blank" rel="noopener">{wa_svg.format(s=17)}WhatsApp me</a></div>
        {cols["Areas"]}
        {cols["Guides"]}
      </div>
      <div class="site-foot__base"><span>© 2026 JB Design Agency</span><span><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></span></div>
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
  title='How Much Does a Website Cost? (UK 2026) · JB Design Agency',
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
  other='Next: <a href="how-long-does-a-website-take.html">how long a website takes</a>, <a href="wix-squarespace-or-web-designer.html">Wix or Squarespace vs a web designer</a>, or see <a href="web-designer-birmingham.html">web design in Birmingham</a>.'),

 dict(slug='logo-or-website-first', crumb='Do I need a logo before a website?', read=4,
  title='Do I Need a Logo Before a Website? · JB Design Agency',
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
  other='See <a href="graphic-designer-birmingham.html">logo and graphic design</a>, or read <a href="how-much-does-a-logo-cost.html">how much a logo costs</a>.'),

 dict(slug='how-long-does-a-website-take', crumb='How long does a website take?', read=4,
  title='How Long Does It Take to Build a Website? · JB Design Agency',
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
  other='Read <a href="what-should-a-small-business-website-include.html">what a website should include</a>, or see <a href="web-designer-birmingham.html">web design in Birmingham</a>.'),

 dict(slug='shopify-or-website', crumb='Shopify or a normal website?', read=5,
  title='Shopify or a Normal Website? Which to Choose · JB Design Agency',
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
  other='See <a href="gosweet.html">an online shop I designed</a>, or read <a href="how-much-does-a-website-cost.html">how much a website costs</a> and <a href="how-to-get-your-business-on-google.html">how to get on Google</a>.'),
 dict(slug='how-much-does-a-logo-cost', crumb='How much does a logo cost?', read=6, published='2026-10-14',
  title='How Much Does a Logo Cost in the UK? · JB Design Agency',
  desc='What a logo really costs a UK small business: logo makers, freelancers and agencies compared, what you should get, and when a cheap logo costs you more.',
  h1='How much does a logo <mark class="hl hl--blue">cost in the UK?</mark>', h1_text='How much does a logo cost in the UK?',
  lede='Logo prices run from free to five figures. Here’s what each price actually buys you, what a small business really needs, and what I charge.',
  short='<p>For a small UK business, a logo from a freelance designer typically costs <b>£250 to £1,500</b>. Agencies usually start at around <b>£2,000</b> and go well beyond that for a full brand. Logo makers and cheap online gigs cost under £100, but you often pay twice. My logos start from <b>£300</b>, and a brand identity (logo, colours, fonts and a guide) from <b>£500</b>.</p>',
  body='''
        <h2>Logo prices at a glance</h2>
        <p>These are typical UK ranges, not fixed rules. Prices vary a lot from one designer to the next, so treat them as a guide.</p>
''' + table(['Option', 'Typical cost', 'What you get'], [
    ['Logo maker or AI tool', 'Free to about £50', 'A quick mark built from shapes and templates that anyone else can use too'],
    ['Cheap online gig', 'About £10 to £150', 'Fast and cheap, but often a template, few files and little thought about your business'],
    ['Freelance designer', '£250 to £1,500', 'One person who learns about your business, a few options, amends and a full set of files'],
    ['Branding agency', '£2,000 to £10,000+', 'Research, a team and a full brand system, usually for bigger firms']]) + '''
        <p>A freelancer usually costs less than an agency because you’re paying for one person’s time, not a team and an office. For most small businesses, that’s the right level: a proper logo, made for you, without paying for research you don’t need.</p>

        <h2>What I charge</h2>
        <p>These are my starting prices. You get a fixed quote after a quick chat, so you know the full price before anything starts.</p>
''' + table(['Service', 'From', 'What you get'], [
    ['Logo design', '£300', 'Options to choose from, every file supplied'],
    ['Brand identity', '£500', 'Your logo plus colours, fonts and a one-page brand guide'],
    ['Logo + small website', '£700', 'Both together, saving £100']]) + '''
        <p>Every logo comes in colour and black and white versions, with all the files you need for print and screen. Two rounds of amends are included. I take a 50% deposit to start and the rest when the files are handed over.</p>

        <h2>What you should get for your money</h2>
        <p>Whoever you choose, a proper logo should come with more than one picture file. Check you’ll get:</p>
        <ul>
          <li><b>A few options to choose from</b>, not one design take it or leave it.</li>
          <li><b>Rounds of changes</b>, agreed up front, so you know how many tweaks are included.</li>
          <li><b>Colour, black and white versions</b>, for printing on a van, a T-shirt or a one-colour stamp.</li>
          <li><b>Files for every job:</b> SVG, PDF and EPS for printers and sign makers, and transparent PNGs for your website and social media.</li>
          <li><b>A version that works small</b>, such as a social profile picture or the little icon in a browser tab.</li>
          <li><b>Ownership.</b> Ask who owns it once it’s paid for. With me, you own the final design once you’ve paid in full.</li>
        </ul>

        <h2>Logo or brand identity?</h2>
        <p>A logo is the mark itself. A brand identity is the logo plus the colours, fonts and a few simple rules for using them. The rules matter more than people expect. They mean your sign maker, your printer and whoever builds your website all get the same colours and fonts, so everything looks like it came from one business.</p>
        <p>If you’re just starting out, a logo on its own is fine. If you’ll be ordering signs, uniforms, printed work and a website in the next year, the brand identity is worth the extra.</p>

        <h2>Cheap logo or a proper one?</h2>
        <p>I’m not going to pretend a £20 logo is always a mistake. If you’re testing an idea and might not carry on, a cheap logo can do the job for a while. The problems usually show up later:</p>
        <ul>
          <li><b>It isn’t really yours.</b> Logos built from templates can look very like other businesses, sometimes in your own trade.</li>
          <li><b>The files run out.</b> A small JPG looks fine on Facebook, then goes blurry on a shop sign or a van.</li>
          <li><b>It doesn’t work small or in one colour.</b> Fine detail and gradients disappear on a business card or an embroidered polo shirt.</li>
          <li><b>You pay twice.</b> Once for the cheap logo, then again to have it redrawn or replaced when the business grows.</li>
        </ul>
        <p>A logo goes on everything you make for years. Spread over that time, the difference between cheap and proper is small.</p>

        <h2>What changes the price</h2>
        <ul>
          <li><b>How many ideas you see.</b> More first ideas take more time.</li>
          <li><b>Extra versions</b>, such as a stacked version, a short icon or a version for a round badge.</li>
          <li><b>A brand guide</b> with your colours and fonts set out properly.</li>
          <li><b>Everything that comes next:</b> business cards, flyers, signs and social templates. Print starts from £45 a page, and business cards and flyers from £60.</li>
          <li><b>A tight deadline</b>, or a long chain of people who need to agree.</li>
        </ul>

        <h2>How it works with me</h2>
        <ol>
          <li><b>A quick chat</b> about your business, your customers and any looks you like. You get a fixed quote.</li>
          <li><b>First ideas.</b> A few different directions, shown on things like a sign, a card and a phone screen, so you can picture them in use.</li>
          <li><b>Refine your favourite.</b> Two rounds of amends are included.</li>
          <li><b>Your files.</b> Every version and format, ready for print and screen.</li>
        </ol>
        <p>For <a href="birdie-blooms.html">Birdie Blooms</a>, a flower studio, I drew eight logo ideas before we settled on one, then built the website around it. For <a href="patch.html">PATCH</a>, the brand went on to uniforms, print and a car wrap. You can see more on my <a href="graphic-designer-birmingham.html">logo and graphic design page</a>.</p>
        <p>I’m based in Birmingham and work with businesses in <a href="web-designer-sutton-coldfield.html">Sutton Coldfield</a>, <a href="web-designer-solihull.html">Solihull</a>, <a href="web-designer-coventry.html">Coventry</a> and <a href="freelance-web-designer-uk.html">across the UK</a>, by video call and email.</p>
''',
  faqs=[('How much should a small business pay for a logo?', 'With a freelance designer, typically £250 to £1,500. My logos start from £300, and a brand identity with colours, fonts and a guide from £500.'),
        ('Why are some logos only £20?', 'They’re usually made from templates in very little time, with only a few files and no real thought about your business. That can be fine for testing an idea, but you often end up paying again later.'),
        ('Do I own my logo?', 'You should, so always ask before you pay. With me, you own the final design once you’ve paid in full.'),
        ('How long does a logo take?', 'Usually three to four days for the design, plus however long you need to choose and send your changes.'),
        ('What files will I get?', 'Colour and black and white versions as SVG, PDF and EPS for printers and sign makers, and transparent PNGs for your website and social media.'),
        ('Can you redraw a logo I already have?', 'Yes. If you only have a blurry JPG, I can redraw it as clean artwork and give you a full set of files, quoted up front.')],
  cta_h='Need a logo that lasts? <mark class="hl">Let’s talk.</mark>',
  other='Read <a href="logo-or-website-first.html">logo or website first?</a>, or see <a href="services.html#branding">logos and branding</a>.'),

 dict(slug='wix-squarespace-or-web-designer', crumb='Wix or Squarespace vs a web designer', read=5, published='2026-10-14',
  title='Wix or Squarespace vs a Web Designer · JB Design Agency',
  desc='Should you build your own site on Wix or Squarespace, or hire a web designer? An honest look at the costs, the time and what suits a small business.',
  h1='Wix or Squarespace vs <mark class="hl hl--pink">a web designer</mark>', h1_text='Wix or Squarespace vs a web designer',
  lede='I build websites for a living, so you might expect me to say never use a website builder. That isn’t my answer. Here’s when they make sense, and when they cost you more than they save.',
  short='<p>If you have more time than money and enjoy doing it yourself, <b>Wix or Squarespace</b> can get you online for typically <b>£10 to £40 a month</b>. If you rely on your website for work and would rather spend your evenings on the business, a <b>freelance web designer</b> usually costs <b>£500 to £3,000</b> once, plus hosting. My websites start from <b>£500</b>.</p>',
  body='''
        <h2>What website builders are good at</h2>
        <ul>
          <li><b>A low start.</b> No big bill up front, just a monthly fee.</li>
          <li><b>Speed.</b> Pick a template and you can have something live in a weekend.</li>
          <li><b>Edit it yourself.</b> Change words and photos whenever you like.</li>
          <li><b>Everything in one place.</b> Hosting, security and updates are handled for you.</li>
          <li><b>Add-ons</b> for bookings, shops and email lists, if you’re on the right plan.</li>
        </ul>
        <p>For someone testing an idea, or a hobby that might become a business, that’s a good deal.</p>

        <h2>Where they fall short</h2>
        <ul>
          <li><b>Your time is the real cost.</b> Choosing, writing, resizing photos and fiddling with layouts on a phone takes far longer than most people expect.</li>
          <li><b>A good template isn’t a good website.</b> Templates look great with the designer’s photos and words. Filled with your own, often in a hurry, they rarely look the same.</li>
          <li><b>You still have to write it.</b> The builder gives you boxes. It doesn’t tell you what to put in them to get people to call.</li>
          <li><b>The fee never stops.</b> The features most businesses need, like your own web address without adverts, or taking bookings, usually sit on the paid plans, and the price tends to go up as you add things.</li>
          <li><b>It’s hard to leave.</b> You can’t simply pick up a Wix or Squarespace site and move it somewhere else. If you leave, the design usually has to be rebuilt.</li>
          <li><b>Google set-up is down to you.</b> The tools are there, but page titles, descriptions and pages for your towns only help if someone fills them in properly.</li>
        </ul>

        <h2>What a web designer gives you</h2>
        <p>A designer’s job isn’t only to make it look nice. It’s to work out what your customers need to see, in what order, so they get in touch. With me, that means:</p>
        <ul>
          <li>A site designed around your business, not a template you’ve squeezed yourself into</li>
          <li>Pages laid out to lead to a call, a quote request or a booking</li>
          <li>Designed for phones first, and built to load quickly</li>
          <li>Set up for Google from day one, with search pages for your main services and towns included</li>
          <li>Help with your words, so you’re not staring at a blank page</li>
          <li>Someone to message when something needs changing</li>
        </ul>

        <h2>What each costs over three years</h2>
        <p>Comparing a monthly fee with a one-off price is tricky, so here it is over three years. Your domain is extra either way, usually £10 to £20 a year.</p>
''' + table(['', 'Up front', 'Over three years'], [
    ['Wix or Squarespace', 'Nothing, or very little', 'Typically £360 to £1,440 in fees, plus your time'],
    ['Small website with me', 'From £500', 'From about £860 with hosting at £10 a month'],
    ['Medium website with me', 'From £900', 'From about £1,260 with hosting at £10 a month']]) + '''
        <p>Check the builders’ own websites for their current prices, as plans change. The gap is often smaller than people think, and the hours you’d have spent building it yourself aren’t in the table.</p>

        <h2>Which should you choose?</h2>
        <p><b>A website builder is a good fit if:</b></p>
        <ul>
          <li>You’re testing an idea and might not carry on</li>
          <li>Your budget is very tight right now</li>
          <li>You enjoy design and have the time to do it well</li>
          <li>Most of your work comes from word of mouth, and the site is just somewhere to point people</li>
        </ul>
        <p><b>A web designer is a better fit if:</b></p>
        <ul>
          <li>You want the website to bring in new enquiries, not just sit there</li>
          <li>You’re up against local competitors on Google</li>
          <li>Your time is worth more spent on paying work</li>
          <li>You want the site to match your logo and the rest of your brand</li>
        </ul>

        <h2>Changing it yourself</h2>
        <p>The main reason people choose a builder is to make changes themselves. You can have that with a designer too. A one-page site needs no logins at all: send me what needs changing and I’ll do it, quoted up front, or included on a care plan from £40 a month. If you’d rather do it yourself, I can add an editor, quoted to suit the site, and large sites from £1,500 come with one included.</p>

        <h2>Already on Wix or Squarespace?</h2>
        <p>That’s fine. Plenty of my clients started that way. When you’re ready, I can design a proper site, keep the words and photos that work, and move everything across carefully so your customers can still find you. Your domain can usually come with you. If you’re in <a href="web-designer-birmingham.html">Birmingham</a>, <a href="web-designer-wolverhampton.html">Wolverhampton</a>, <a href="web-designer-leicester.html">Leicester</a> or <a href="freelance-web-designer-uk.html">anywhere else in the UK</a>, we can talk it through on a call.</p>
''',
  faqs=[('Is Wix good enough for a small business?', 'It can be, especially if you’re starting out, have time to do it well and your work mostly comes from word of mouth. If you need the site to win new customers from Google, a designed site usually does more.'),
        ('Is Squarespace better than Wix?', 'Both are solid. Squarespace’s templates are cleaner and stricter, while Wix lets you move things anywhere, which also makes it easier to end up with a messy page. Try both and pick the one you find easier.'),
        ('Can a Wix or Squarespace site rank on Google?', 'Yes, it can. What matters most is the words on the page, a page for each service and area, proper titles and descriptions, speed on phones and good reviews, not which tool built it.'),
        ('Can you move my Wix site to a proper website?', 'Yes. I design a new site, keep the words and photos that work, and move everything across carefully. Your domain can usually come with you.'),
        ('How much does a web designer cost compared with Wix?', 'Wix and Squarespace typically cost £10 to £40 a month. My websites start from £500, plus hosting from £10 a month. Over three years the gap is often smaller than people expect.')],
  cta_h='Ready to stop fiddling with templates? <mark class="hl">Let’s talk.</mark>',
  other='Read <a href="how-much-does-a-website-cost.html">how much a website costs</a>, or see <a href="services.html#websites">websites</a>.'),

 dict(slug='how-to-get-your-business-on-google', crumb='How to get your business on Google', read=6, published='2026-10-14',
  title='How to Get Your Small Business on Google · JB Design Agency',
  desc='How to get your small business on Google and Google Maps: a free Business Profile, reviews, a proper website and local pages, in plain, practical steps.',
  h1='How to get your business <mark class="hl hl--green">on Google</mark>', h1_text='How to get your small business on Google',
  lede='Being on Google isn’t magic, and it doesn’t need to cost a fortune. These are the steps I take for my own business and my clients’, in the order that makes the most difference.',
  short='<p>Start with a free <b>Google Business Profile</b>: it’s what puts you on Google Maps and in the local results. Then <b>ask happy customers for reviews</b>, keep your name, address and phone number the same everywhere, and give Google a <b>proper website</b> with a page for each main service and the areas you cover.</p>',
  body='''
        <h2>1. Set up your Google Business Profile</h2>
        <p>This is the box that appears on the right of Google, or at the top on a phone, with your hours, reviews, photos and a map. It’s free, and for a local business it’s the single most useful thing you can do.</p>
        <ol>
          <li>Search for “Google Business Profile” and sign in with a Google account.</li>
          <li>Search for your business name. If it’s already listed, claim it. If not, add it.</li>
          <li>Choose your main category carefully. Pick the one that best describes what you do, such as “Window cleaning service” or “Florist”.</li>
          <li>If customers come to you, add your address. If you go to them, you can hide your address and list the areas you cover instead.</li>
          <li>Verify it. Google will ask you to prove the business is yours, and the way it does this varies, so follow its steps.</li>
        </ol>
        <p>Then fill in everything: opening hours, phone number, website, services, a short description in plain English and plenty of real photos of your work, your team and your van or premises.</p>

        <h2>2. Get reviews, and reply to them</h2>
        <p>Reviews help people choose you, and they help Google decide who to show. The trick is to ask at the right moment: just after a job has gone well.</p>
        <ul>
          <li>Your profile gives you a link that goes straight to the review box. Send it by text or WhatsApp.</li>
          <li>Ask every happy customer, not just your favourites. A steady trickle looks better than a sudden burst.</li>
          <li>Reply to every review, good or bad, politely and briefly.</li>
          <li>Never pay for reviews, offer discounts for them or write your own. It’s against Google’s rules and can get reviews removed.</li>
        </ul>

        <h2>3. Keep your details the same everywhere</h2>
        <p>Your business name, address and phone number should read exactly the same on your website, your Google profile, Facebook and any directories you’re listed on, such as Yell or a trade site. Small differences, like an old phone number or a different spelling, can confuse Google about which listing is really you.</p>
        <p>Use your real business name on your profile, too. Adding extra words like “Best Plumber Birmingham” is against Google’s guidelines and can get your listing suspended.</p>

        <h2>4. Have a proper website</h2>
        <p>A Google profile gets you on the map. A website gives Google something to read about what you do and where, and gives customers a reason to choose you over the next listing. A Facebook page helps, but it isn’t a replacement: you don’t control it, and it says very little to Google.</p>
        <p>The website doesn’t need to be big. It needs to be clear, quick on a phone, and say plainly what you do and where you do it. Each page should have its own title and description, the words a customer would actually search for, and an easy way to get in touch. There’s more on that in <a href="what-should-a-small-business-website-include.html">what a small business website should include</a>.</p>

        <h2>5. Add a page for each service and area</h2>
        <p>People search for a service and a place: “electrician Solihull”, “wedding florist Leicester”. One home page can’t answer every one of those well. A page for each main service, and for the main towns you cover, gives Google a clear match for each search.</p>
        <p>The catch: each page has to be genuinely useful and different. Copying one page and swapping the town name is something Google looks out for and tends to ignore. Mention real jobs you’ve done there, the areas you cover and how you work locally. You can see how I do it for my own business on my pages for <a href="web-designer-birmingham.html">Birmingham</a>, <a href="web-designer-solihull.html">Solihull</a>, <a href="web-designer-coventry.html">Coventry</a> and <a href="web-designer-leicester.html">Leicester</a>.</p>

        <h2>6. Tell Google about your site</h2>
        <p>Google Search Console is a free tool from Google. Add your website, send it your sitemap (a list of your pages), and Google will tell you which pages it has found, any problems it has spotted and which searches people used to find you. It takes about ten minutes to set up, and it’s the best way to see what’s working.</p>

        <h2>7. Keep it alive</h2>
        <ul>
          <li>Add new photos of your work to your profile every few weeks.</li>
          <li>Update your hours for bank holidays and Christmas.</li>
          <li>Answer the questions customers ask you on your website, as new pages or guides.</li>
          <li>Keep asking for reviews.</li>
        </ul>

        <h2>What not to spend money on</h2>
        <ul>
          <li><b>“Guaranteed page one” calls and emails.</b> Nobody can guarantee a position on Google. Google says so itself.</li>
          <li><b>Paying to be listed in dozens of directories.</b> A few good, accurate listings beat lots of poor ones.</li>
          <li><b>Buying reviews or followers.</b> It risks your profile and fools nobody for long.</li>
        </ul>

        <h2>How long does it take?</h2>
        <p>Once your profile is verified, it can start showing within days, though sometimes it takes longer. A new website and its pages usually take weeks to a few months to settle into the results. It’s steady work, not a switch.</p>

        <h2>Where I can help</h2>
        <p>Every <a href="services.html#websites">website I build</a> is set up for Google from the start: proper titles and descriptions, tidy headings, fast pages and search pages for your main services and towns, included in the price. I’ll also help you set up your Google Business Profile so you show up on Maps.</p>
''',
  faqs=[('Is a Google Business Profile free?', 'Yes. Setting up and keeping a Google Business Profile is free. You only pay if you choose to run Google adverts, which is separate.'),
        ('Do I need a website to be on Google?', 'Not to appear on Google Maps: a Business Profile does that on its own. But a website gives Google much more to go on, helps you show up for more searches, and gives customers a reason to choose you.'),
        ('Can I be on Google Maps without a shop?', 'Yes. If you go to your customers, you can hide your address and list the towns and areas you cover instead.'),
        ('How do I get more Google reviews?', 'Ask straight after a job goes well, and send the review link from your profile by text or WhatsApp. Ask every happy customer, and reply to every review.'),
        ('Why isn’t my business showing on Google?', 'The usual reasons are an unverified profile, a new website Google hasn’t found yet, no pages about your service or town, or details that don’t match across the web. Search Console will show you what Google has found.'),
        ('Can you guarantee I’ll be top of Google?', 'No, and be wary of anyone who says they can. What I can do is set your site up properly, so you have the best chance of being found.')],
  cta_h='Want to be found on Google? <mark class="hl">Let’s talk.</mark>',
  other='Read <a href="what-should-a-small-business-website-include.html">what a website should include</a>, or see <a href="services.html#websites">websites</a>.'),

 dict(slug='what-should-a-small-business-website-include', crumb='What should a small business website include?', read=5, published='2026-10-14',
  title='What Should a Small Business Website Include?',
  desc='What a small business website needs: the pages, a clear way to get in touch, reasons to trust you, speed on phones and the legal bits, in plain English.',
  h1='What should a small business website <mark class="hl hl--orange">include?</mark>', h1_text='What should a small business website include?',
  lede='Most small business websites don’t need to be big. They need to answer a few questions quickly and make it easy to get in touch. Here’s what to include, and what to leave out.',
  short='<p>At the very least: a clear line saying <b>what you do and where</b>, your <b>main services</b>, <b>proof you’re good</b> (reviews and photos of real work), and an <b>easy way to get in touch</b> from every page. It must work well on a phone and load quickly. Most small businesses need five pages or fewer to start.</p>',
  body='''
        <h2>The pages most small businesses need</h2>
''' + table(['Page', 'What it’s for'], [
    ['Home', 'Says what you do, where, and why you, then points people to the next step'],
    ['Services', 'What you offer, who it’s for and roughly what it costs. One page per main service if you have a few'],
    ['About', 'The person or people behind the business. Customers like to know who they’re dealing with'],
    ['Work or gallery', 'Photos of real jobs, before and afters, or a few short case studies'],
    ['Contact', 'Phone, email, a short form, your hours and the areas you cover'],
    ['Privacy policy', 'Needed if your site collects any details, such as through a contact form']]) + '''
        <p>A one-page site can cover all of this in sections, and for many trades and local services that’s plenty. My small websites start from £500, and sites with five pages or more from £900. Reviews don’t need a page of their own: they work better spread across the pages where people are making up their minds.</p>

        <h2>The top of the home page</h2>
        <p>Most people decide in a few seconds whether they’re in the right place. The first screen, before anyone scrolls, should tell them:</p>
        <ul>
          <li><b>What you do</b>, in the words a customer would use, not a slogan</li>
          <li><b>Where you do it</b>, if you’re a local business</li>
          <li><b>What to do next</b>, with one clear button: call, get a quote or book</li>
        </ul>
        <p>A real photo of you, your work or your premises does more than any stock picture. Skip “Welcome to our website”: everyone knows where they are.</p>

        <h2>Make it easy to get in touch</h2>
        <ul>
          <li>Put your phone number in the header and the footer, and make it tap to call on a phone.</li>
          <li>Offer more than one way: phone, email, a short form and WhatsApp if you use it.</li>
          <li>Keep the form short: name, how to reach them and a message is usually enough.</li>
          <li>Say when you’ll reply, your opening hours and the areas you cover.</li>
          <li>End every page with a clear next step, so nobody has to hunt for it.</li>
        </ul>

        <h2>Give people reasons to trust you</h2>
        <p>Someone finding you on Google doesn’t know you yet. Your site has to do the job a recommendation from a friend would do.</p>
        <ul>
          <li><b>Reviews</b> with real first names and places, ideally copied from your Google profile</li>
          <li><b>Photos of real work</b>, your team and your van or premises</li>
          <li><b>Prices</b>, or at least “from” prices, so people know you’re in their range</li>
          <li><b>Qualifications, memberships and insurance</b>, where they matter in your trade</li>
          <li><b>A real name and face</b> on the about page</li>
        </ul>
        <p>Showing prices is the one people worry about most. In my experience, it puts off very few good customers and saves you a lot of calls from people who were never going to book.</p>

        <h2>Built for phones, and quick</h2>
        <p>For most local businesses, most visitors arrive on a phone, often in a hurry. So the site should be designed for a small screen first: text big enough to read, buttons big enough to tap, and nothing that needs pinching or zooming.</p>
        <p>Speed matters just as much. Large photos are the usual reason a small site is slow, so they should be resized and compressed before they go up. You can test any page for free with Google’s PageSpeed Insights.</p>

        <h2>Set up for Google</h2>
        <ul>
          <li>Every page has its own title and description, written for the person searching</li>
          <li>One main heading per page that says what the page is about</li>
          <li>A page for each main service and the main towns you cover</li>
          <li>A link to and from your Google Business Profile</li>
          <li>A sitemap, sent to Google through Search Console</li>
        </ul>
        <p>There’s a step-by-step version in <a href="how-to-get-your-business-on-google.html">how to get your business on Google</a>.</p>

        <h2>The legal bits</h2>
        <ul>
          <li><b>A privacy policy</b> if you collect any personal details, including through a contact form.</li>
          <li><b>A cookie notice</b> if you use cookies for tracking or adverts. The ICO’s website explains what you need.</li>
          <li><b>Your company details</b> if you’re a limited company: the full company name, number and registered office address.</li>
          <li><b>Delivery, returns and terms</b> if you sell online.</li>
        </ul>
        <p>This is a general guide, not legal advice, so check anything you’re unsure about.</p>

        <h2>What you can leave out</h2>
        <ul>
          <li><b>A blog you won’t keep up.</b> An empty news page from three years ago looks worse than none. A few useful guides that answer real questions are better.</li>
          <li><b>Sliders and auto-playing video</b>, which slow the page down and are mostly ignored.</li>
          <li><b>Lots of thin pages</b> that each say very little. Fewer, better pages win.</li>
          <li><b>Social media feeds</b> that slow the site and send people off it.</li>
        </ul>
        <p>For a good example of a small site done simply, see the <a href="beetle-eyes.html">one-page site for Beetle Eyes Clothing</a>, a vintage rail in Mountsorrel. For a bigger one, see <a href="birth-hood.html">Birth-hood</a>, a hypnobirthing and doula business in Leicestershire. I work with businesses in <a href="web-designer-birmingham.html">Birmingham</a>, <a href="web-designer-sutton-coldfield.html">Sutton Coldfield</a> and <a href="freelance-web-designer-uk.html">across the UK</a>.</p>
''',
  faqs=[('How many pages does a small business website need?', 'Often five or fewer: home, services, about, work and contact, plus a privacy policy. Many trades and local services do well with a single page split into sections.'),
        ('Should I put prices on my website?', 'Usually, yes, even if it’s only “from” prices. It helps people decide you’re in their range and cuts down on calls from people who were never going to book.'),
        ('Do I need a blog?', 'No. A few useful guides that answer your customers’ real questions are worth more than a blog you don’t keep up.'),
        ('Do I need a privacy policy?', 'If your site collects any personal details, such as through a contact form, you need to tell people what you do with them. A short, plain privacy policy covers it.'),
        ('What’s the most important thing on a small business website?', 'A clear line saying what you do and where, and an easy way to get in touch. Everything else supports those two.')],
  cta_h='Want a website that does all this? <mark class="hl">Let’s talk.</mark>',
  other='Read <a href="how-much-does-a-website-cost.html">how much a website costs</a>, or see <a href="services.html#websites">websites</a>.'),
]

if __name__ == '__main__':
    for g in GUIDES:
        open(f'projects/{g["slug"]}.html', 'w').write(page(g))
        print('wrote', g['slug'])
