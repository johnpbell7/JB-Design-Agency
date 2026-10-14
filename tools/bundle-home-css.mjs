#!/usr/bin/env node
// Joins the home page's style sheets into one file, in the order the page used to load them,
// so a phone downloads one file before the first paint instead of eight. Looks identical.
// It also copies assets/js/theme.js into index.html (between the theme markers), saving the phone another wait.
// Run it after changing any of these files or theme.js:  node tools/bundle-home-css.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const css = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'css');
const parts = ['fonts', 'base', 'case', 'home', 'prices', 'home-hero', 'about', 'type'];
const out = parts.map(p => `/* ===== ${p}.css ===== */\n` + fs.readFileSync(path.join(css, p + '.css'), 'utf8').trim()).join('\n\n');
fs.writeFileSync(path.join(css, 'home.bundle.css'),
  `/* Made by tools/bundle-home-css.mjs from ${parts.map(p => p + '.css').join(', ')}. Edit those, then run it again. */\n\n${out}\n`);
console.log(`home.bundle.css: ${parts.length} files, ${Math.round(out.length / 1024)} KB`);

// theme.js, inline in the home page's <head>
const site = path.join(css, '..', '..');
const home = path.join(site, 'index.html');
const js = fs.readFileSync(path.join(site, 'assets', 'js', 'theme.js'), 'utf8').trim();
if (js.includes('</script')) throw new Error('theme.js contains </script>, which would break the inline copy');
let html = fs.readFileSync(home, 'utf8');
const re = /<!-- theme\.js inline: start -->[\s\S]*?<!-- theme\.js inline: end -->/;
if (!re.test(html)) throw new Error('No theme.js markers in index.html');
html = html.replace(re, () => `<!-- theme.js inline: start -->\n  <script>/* copy of assets/js/theme.js, made by tools/bundle-home-css.mjs */\n${js}\n</script>\n  <!-- theme.js inline: end -->`);
fs.writeFileSync(home, html);
console.log('theme.js copied into index.html');
