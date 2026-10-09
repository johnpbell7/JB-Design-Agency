"""Writes the shared endings onto every project page: "More work" (the next
project first, every other project, and print work) and the contact form.

    python3 tools/case_blocks.py            (every page)
    python3 tools/case_blocks.py about      (just the slugs named)

Each page gets the blocks between <!-- cp:end --> and <!-- /cp:end -->, which
replace the old single "Next project" link the first time it runs. The project
list lives here, so adding a project means one new line in PROJECTS. PATCH is
written to patch.src.html, then tools/build.py makes patch.html.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EMAIL = 'jb.designagency89@gmail.com'

# slug, page, name, tag, brand, desktop capture, phone capture (order = "next" chain)
PROJECTS = [
    ('patch', 'patch.src.html', 'PATCH', 'Brand + website', '#111318', 'patch-agency/fold-desktop.webp', 'patch-agency/home-mobile.webp'),
    ('birth-hood', 'birth-hood.html', 'Birth-hood', 'Website', '#fe7fcc', 'birth-hood/fold-desktop.webp', 'birth-hood/home-mobile.webp'),
    ('gosweet', 'gosweet.html', 'GoSweet', 'Online shop', '#5c2a9d', 'gosweet/fold-desktop.webp', 'gosweet/home-mobile.webp'),
    ('nic-pouches', 'nic-pouches.html', 'Nic Pouches', 'Online shop', '#0070d5', 'nic-pouches/fold-desktop.webp', 'nic-pouches/home-mobile.webp'),
    ('vsl-trade', 'vsl-trade.html', 'VSL Trade', 'Wholesale website', '#0d1110', 'vsl-trade/fold-desktop.webp', 'vsl-trade/home-mobile.webp'),
    ('birdie-blooms', 'birdie-blooms.html', 'Birdie Blooms', 'Brand + website', '#e8879f', 'birdie-blooms/fold-desktop.webp', 'birdie-blooms/home-mobile.webp'),
    ('sccc-heritage', 'sccc-heritage.html', 'SCCC Heritage', 'Club history website', '#8b1538', 'sccc-heritage/fold-desktop.webp', 'sccc-heritage/journey-mobile.webp'),
    ('beetle-eyes', 'beetle-eyes.html', 'Beetle Eyes', 'One-page website', '#1f3a2e', 'beetle-eyes/fold-desktop.webp', '../projects/beetle-eyes/home-mobile.webp'),
]
PRINT_PAGES = [('print', 'print.html'), ('property', 'property.html')]
# Pages that aren't projects but end the same way (all projects, no "Next" label)
OTHER_PAGES = [('about', 'about.html'), ('work', 'work.html')]
# Pages that already show every project, so they end with the contact form only
CONTACT_ONLY = {'work'}


def href(page):
    return 'patch.html' if page == 'patch.src.html' else page


def card(p, next_=False):
    slug, page, name, tag, brand, desk, phone = p
    label = '<span class="cp-card__label">Next project</span>' if next_ else ''
    # a laptop and a phone on the brand colour, like the home page work cards
    devices = (f'<div class="laptop cp-card__laptop"><div class="laptop__lid"><div class="screen"><img src="../assets/captures/{desk}" alt="" loading="lazy"></div></div><div class="laptop__base"></div></div>'
               f'<div class="phone cp-card__phone"><div class="screen"><img src="../assets/captures/{phone}" alt="" loading="lazy"></div></div>')
    return (f'        <a class="cp-card{" cp-card--next" if next_ else ""}" href="{href(page)}" style="--brand:{brand}">\n'
            f'          <div class="cp-card__art">{label}<i class="cp-card__glow" aria-hidden="true"></i>{devices}</div>\n'
            f'          <div class="cp-card__name"><b>{name}</b><span>{tag}</span></div>\n'
            f'        </a>')


def print_card(current):
    if current == 'print':
        return ('        <a class="cp-card cp-card--print" href="property.html">\n'
                '          <div class="cp-card__art"><img src="../assets/projects/property/covers/darley.jpg" alt="" loading="lazy"><img src="../assets/projects/property/covers/swilley.jpg" alt="" loading="lazy"><img src="../assets/projects/property/digbeth-flyer.jpg" alt="" loading="lazy"></div>\n'
                '          <div class="cp-card__name"><b>Property marketing</b><span>Print</span></div>\n'
                '        </a>')
    return ('        <a class="cp-card cp-card--print" href="print.html">\n'
            '          <div class="cp-card__art"><img src="../assets/projects/print/hospital/covers/impact.jpg" alt="" loading="lazy"><img src="../assets/projects/property/covers/swilley.jpg" alt="" loading="lazy"><img src="../assets/projects/print/gowling/cover-flat.jpg" alt="" loading="lazy"></div>\n'
            '          <div class="cp-card__name"><b>Print, brand and motion</b><span>Brochures · logos · film</span></div>\n'
            '        </a>')


def block(current):
    if current in CONTACT_ONLY:
        return f'<!-- cp:end -->\n    {CONTACT}\n    <!-- /cp:end -->'
    ids = [p[0] for p in PROJECTS]
    if current == 'about':
        cards = [card(p) for p in PROJECTS] + [print_card(current)]
        head = 'Here’s some of <mark class="hl">my work.</mark>'
    elif current in ids:
        i = ids.index(current)
        nxt = PROJECTS[(i + 1) % len(PROJECTS)]
        rest = [p for p in PROJECTS if p[0] not in (current, nxt[0])]
        cards = [card(nxt, True)] + [card(p) for p in rest] + [print_card(current)]
        head = 'Other projects <mark class="hl">you might like.</mark>'
    else:
        cards = [card(PROJECTS[0], True)] + [card(p) for p in PROJECTS[1:]] + [print_card(current)]
        head = 'My websites, <mark class="hl">and other work.</mark>'
    return f'''<!-- cp:end -->
    <section class="section wrap" id="more">
      <header class="cp-head"><span class="label">More work</span><h2>{head}</h2></header>
      <div class="cp-more">
{chr(10).join(cards)}
      </div>
    </section>

    {CONTACT}
    <!-- /cp:end -->'''


CONTACT = f'''<section class="contact-band" id="contact">
      <div class="contact wrap">
        <div class="contact__intro">
          <span class="label">Your turn</span>
          <h2>Let’s make something people <mark class="hl">like to use.</mark></h2>
          <p>Tell me a bit about your business and what you need. I usually reply within a working day.</p>
          <a class="contact__email" href="mailto:{EMAIL}">{EMAIL}</a>
        </div>
        <form class="contact__form" data-contact data-to="{EMAIL}" novalidate>
          <fieldset class="chips">
            <legend>What do you need?</legend>
            <label><input type="checkbox" name="need" value="New website"><span>New website</span></label>
            <label><input type="checkbox" name="need" value="Redesign"><span>Redesign</span></label>
            <label><input type="checkbox" name="need" value="Online shop"><span>Online shop</span></label>
            <label><input type="checkbox" name="need" value="Logo and brand"><span>Logo &amp; brand</span></label>
            <label><input type="checkbox" name="need" value="Print"><span>Print</span></label>
          </fieldset>
          <div class="field-row">
            <label class="field"><span>Your name</span><input name="name" autocomplete="name" required></label>
            <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
          </div>
          <label class="field"><span>Tell me about it</span><textarea name="message" rows="4" required></textarea></label>
          <p class="contact__error" role="alert" data-contact-error></p>
          <button class="btn btn--big" type="submit">Send it over <span aria-hidden="true">→</span></button>
          <p class="contact__note">This opens your email app with everything filled in, ready to send.</p>
        </form>
      </div>
    </section>'''


OLD_NEXT = re.compile(r'<section class="section wrap">\s*<a class="next".*?</section>', re.S)
MARKED = re.compile(r'<!-- cp:end -->.*?<!-- /cp:end -->', re.S)


def wire(html):
    """Load case-plus css/js once, and point the footer line at the form."""
    if 'case-plus.css' not in html:
        html = re.sub(r'(<link rel="stylesheet" href="\.\./assets/css/case\.css">)', r'\1\n  <link rel="stylesheet" href="../assets/css/case-plus.css">', html, 1)
    if 'case-plus.js' not in html:
        html = re.sub(r'(<script src="\.\./assets/js/case\.js"></script>)', r'\1\n  <script src="../assets/js/case-plus.js"></script>', html, 1)
    html = html.replace('<p class="site-foot__big"><a href="../index.html#contact">', '<p class="site-foot__big"><a href="#contact">')
    return html


def main():
    import sys
    pages = [(p[0], p[1]) for p in PROJECTS] + PRINT_PAGES + OTHER_PAGES
    only = sys.argv[1:]  # e.g. `python3 tools/case_blocks.py about` writes just that page
    for slug, page in pages:
        if only and slug not in only:
            continue
        f = ROOT / 'projects' / page
        html = f.read_text()
        new = block(slug)
        if MARKED.search(html):
            html = MARKED.sub(lambda m: new, html)
        elif OLD_NEXT.search(html):
            html = OLD_NEXT.sub(lambda m: new, html, 1)
        else:
            html = html.replace('  </main>', f'    {new}\n  </main>', 1)
        f.write_text(wire(html))
        print('wrote', page)


if __name__ == '__main__':
    main()
