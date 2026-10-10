"""Prints each real page's heading outline and flags problems.

    python3 tools/check_headings.py          (outline + violations)
    python3 tools/check_headings.py -q       (violations + summary only)

Rules: exactly one <h1>, the h1 comes first, and no skipped levels going down
in document order (h1 -> h3, h2 -> h4). Headings with role="presentation" or
role="none", or inside aria-hidden="true", are ignored.
Pages: index.html, 404.html and projects/*.html (demo sites under assets/ are skipped).
"""
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Outline(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []        # (tag, hidden)
        self.heads = []        # [level, text, line]
        self.cur = None
        self.skip = 0          # inside script/style/template

    def hidden(self):
        return any(h for _, h in self.stack)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style', 'template'):
            self.skip += 1
        if tag in VOID:
            return
        hid = a.get('aria-hidden') == 'true'
        self.stack.append((tag, hid))
        if (len(tag) == 2 and tag[0] == 'h' and tag[1] in '123456' and not self.skip
                and not self.hidden() and a.get('role') not in ('presentation', 'none')):
            self.cur = [int(tag[1]), '', self.getpos()[0], len(self.stack)]

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'template') and self.skip:
            self.skip -= 1
        if tag in VOID:
            return
        # pop to the matching tag (tolerates sloppy nesting)
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                if self.cur and i + 1 <= self.cur[3] and tag == 'h%d' % self.cur[0]:
                    self.heads.append(self.cur[:3])
                    self.cur = None
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.cur is not None and not self.skip:
            self.cur[1] += data


def check(path):
    p = Outline()
    p.feed(path.read_text())
    heads = [(lvl, ' '.join(t.split())[:70], line) for lvl, t, line in p.heads]
    issues = []
    h1s = [h for h in heads if h[0] == 1]
    if len(h1s) != 1:
        issues.append(f'{len(h1s)} <h1> elements (want exactly 1)')
    if heads and heads[0][0] != 1:
        issues.append(f'first heading is h{heads[0][0]} (line {heads[0][2]}), not h1')
    prev = 0
    for lvl, text, line in heads:
        if prev and lvl > prev + 1:
            issues.append(f'skip h{prev} -> h{lvl} at line {line}: "{text}"')
        prev = lvl
    return heads, issues


def main():
    quiet = '-q' in sys.argv
    pages = [ROOT / 'index.html', ROOT / '404.html'] + sorted((ROOT / 'projects').glob('*.html'))
    bad = 0
    for f in pages:
        if not f.exists():
            continue
        heads, issues = check(f)
        rel = f.relative_to(ROOT)
        if not quiet or issues:
            print(f'\n== {rel}  ({len(heads)} headings)')
        if not quiet:
            for lvl, text, line in heads:
                print(f'  {"  " * (lvl - 1)}h{lvl} {text}  [{line}]')
        for i in issues:
            print(f'  !! {i}')
        bad += bool(issues)
    print(f'\n{len(pages)} pages checked, {bad} with violations')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
