"""Keeps the footer's link columns the same on every page (Pages, Web design in, Guides).
Run from the repo root after adding a page or guide:  python3 tools/footer.py
Change the lists below, not the pages. landing.py and guides.py call footer_cols() for the pages they build."""
import glob, re

PAGES = [('Work', 'work.html'), ('Services', 'services.html'), ('Graphic design', 'graphic-designer-birmingham.html'), ('Print', 'print.html'), ('About', 'about.html')]
AREAS = [('Birmingham', 'web-designer-birmingham.html'), ('Sutton Coldfield', 'web-designer-sutton-coldfield.html'), ('Solihull', 'web-designer-solihull.html'),
         ('Wolverhampton', 'web-designer-wolverhampton.html'), ('Coventry', 'web-designer-coventry.html'), ('Leicester', 'web-designer-leicester.html'), ('Across the UK', 'freelance-web-designer-uk.html')]
GUIDES = [('What a website costs', 'how-much-does-a-website-cost.html'), ('Logo or website first?', 'logo-or-website-first.html'),
          ('How long a website takes', 'how-long-does-a-website-take.html'), ('Shopify or a website?', 'shopify-or-website.html')]

def footer_cols(at_root=False):
    """The three link columns. at_root: the page is index.html (links go into projects/)."""
    pre = 'projects/' if at_root else ''
    faq = '#faq' if at_root else '../index.html#faq'
    links = lambda items: ''.join(f'<a href="{pre}{h}">{t}</a>' for t, h in items)
    return {
        'Pages': f'<nav class="sf-col" aria-label="Pages"><p class="sf-h">Pages</p>{links(PAGES)}<a href="{faq}">FAQs</a></nav>',
        'Areas': f'<nav class="sf-col" aria-label="Areas"><p class="sf-h">Web design in</p>{links(AREAS)}</nav>',
        'Guides': f'<nav class="sf-col" aria-label="Guides"><p class="sf-h">Guides</p>{links(GUIDES)}</nav>',
    }

def fix(html, at_root):
    cols = footer_cols(at_root)
    html = re.sub(r'<nav class="sf-col" aria-label="Pages">.*?</nav>', lambda m: cols['Pages'], html, count=1, flags=re.S)
    html = re.sub(r'\s*<nav class="sf-col" aria-label="Guides">.*?</nav>', '', html, flags=re.S)
    html = re.sub(r'(\s*)<nav class="sf-col" aria-label="Areas">.*?</nav>', lambda m: m.group(1) + cols['Areas'] + m.group(1) + cols['Guides'], html, count=1, flags=re.S)
    return html

if __name__ == '__main__':
    changed = 0
    for f in ['index.html'] + sorted(glob.glob('projects/*.html')):
        old = open(f).read()
        if 'class="sf-col"' not in old: continue
        new = fix(old, f == 'index.html')
        if new != old: open(f, 'w').write(new); changed += 1
    print(f'footer updated on {changed} page(s)')
