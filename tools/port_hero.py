"""Ported two standalone hero options (hero-02 big type, hero-07 phone fan) from
the old hero test pages (removed) into the home page: prefixes their class names so nothing clashes with the site's
shared components, and writes assets/css/home-hero.css + assets/js/home-hero.js.
Prints the two section snippets' paths for splicing into index.html.
Kept for reference only: its heroes/ inputs were the old hero test pages (removed),
so it no longer runs as-is."""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SHARED = {'hl', 'is-lit', 'btn', 'btn--ghost', 'site-nav', 'theme-switch', 'no-js', 'wrap', 'label', 'skip'}
KEEP_PREFIX = ('is-', 'hl--', 'site-nav', 'theme-switch')

def parts(path):
    s = path.read_text()
    css = re.search(r'<style>(.*?)</style>', s, re.S).group(1)
    sec = re.search(r'(<section.*?</section>)', s, re.S).group(1)
    js = re.findall(r'<script>(.*?)</script>', s, re.S)[-1]
    return css, sec, js

def port(path, prefix, data_renames):
    css, sec, js = parts(path)
    names = set(re.findall(r'\.(-?[a-zA-Z_][\w-]*)', re.sub(r'url\([^)]*\)|\d+\.\d+', '', css)))
    names = {n for n in names if n not in SHARED and not n.startswith(KEEP_PREFIX)}
    names |= set(re.findall(r'class="([^"]*)"', sec + js) and [t for c in re.findall(r'class="([^"]*)"', sec + js) for t in c.split()]) - SHARED
    names = {n for n in names if not n.startswith(KEEP_PREFIX) and not n.startswith(prefix) and re.fullmatch(r'[a-zA-Z_][\w-]*', n)}
    alt = '|'.join(sorted(map(re.escape, names), key=len, reverse=True))
    sel = re.compile(r'\.(' + alt + r')(?![\w-])')
    # CSS: drop rules aimed at the nav/theme switch, then prefix selectors
    css = re.sub(r'[^{}]*\.(?:site-nav|theme-switch)[^{]*\{[^{}]*\}', '', css)
    css = sel.sub(lambda m: '.' + prefix + m.group(1), css)
    def fix_classattr(m):
        return 'class="' + ' '.join(prefix + t if t in names else t for t in m.group(1).split()) + '"'
    sec = re.sub(r'class="([^"]*)"', fix_classattr, sec)
    # JS: only touch string literals
    def fix_str(m):
        q, body = m.group(1), m.group(2)
        body = sel.sub(lambda k: '.' + prefix + k.group(1), body)
        body = re.sub(r'class="([^"]*)"', fix_classattr, body)
        if body in names: body = prefix + body
        return q + body + q
    js = re.sub(r"(['\"`])((?:\\.|(?!\1).)*?)\1", fix_str, js, flags=re.S)
    js = re.sub(r"(classList\.(?:add|remove|toggle|contains|replace)\()([^)]*)\)", lambda m: m.group(1) + re.sub(r"'([\w-]+)'", lambda k: "'" + (prefix + k.group(1) if k.group(1) in names else k.group(1)) + "'", m.group(2)) + ')', js)
    for a, b in data_renames.items():
        sec = sec.replace(a, b); js = js.replace(a, b); css = css.replace(a, b)
    return css, sec, js

c2, s2, j2 = port(ROOT / 'heroes/hero-02.html', 'bt-', {'data-bigtype': 'data-bt'})
c7, s7, j7 = port(ROOT / 'heroes/hero-07.html', 'pf-', {'data-stage': 'data-pf-stage', 'data-fan': 'data-pf-fan', 'data-scribble': 'data-pf-scribble', 'data-cap': 'data-pf-cap', 'data-dots': 'data-pf-dots', 'data-icons': 'data-pf-icons'})
(ROOT / 'assets/css/home-hero.css').write_text('/* Home hero (big type) + phone-fan section. Ported from the old hero test pages (removed) by tools/port_hero.py */\n' + c2 + '\n/* ---- phone fan ---- */\n' + c7)
(ROOT / 'assets/js/home-hero.js').write_text('// Home hero (big type) + phone-fan section. Ported from the old hero test pages (removed) by tools/port_hero.py\n' + j2 + '\n' + j7)
(ROOT / 'heroes/_hero.part.html').write_text(s2)
(ROOT / 'heroes/_fan.part.html').write_text(s7)
print('ok', len(c2), len(c7))
