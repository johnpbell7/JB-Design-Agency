#!/usr/bin/env node
// Joins the home page's style sheets into one file, in the order the page used to load them,
// so a phone downloads one file before the first paint instead of eight. Looks identical.
// Run it after changing any of these files:  node tools/bundle-home-css.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const css = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'css');
const parts = ['fonts', 'base', 'case', 'home', 'prices', 'home-hero', 'about', 'type'];
const out = parts.map(p => `/* ===== ${p}.css ===== */\n` + fs.readFileSync(path.join(css, p + '.css'), 'utf8').trim()).join('\n\n');
fs.writeFileSync(path.join(css, 'home.bundle.css'),
  `/* Made by tools/bundle-home-css.mjs from ${parts.map(p => p + '.css').join(', ')}. Edit those, then run it again. */\n\n${out}\n`);
console.log(`home.bundle.css: ${parts.length} files, ${Math.round(out.length / 1024)} KB`);
