// Quick QA: loads a page at desktop + phone width, reports JS errors, failed
// requests and sideways overflow, and runs any page-specific checks.
//   node tools/qa.mjs http://localhost:4321/projects/birth-hood.html [outdir]
import puppeteer from 'puppeteer-core';
const [url, out] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  const issues = [];
  p.on('pageerror', e => issues.push('JS ' + e.message));
  p.on('response', r => r.status() >= 400 && issues.push(r.status() + ' ' + r.url()));
  await p.goto(url, { waitUntil: 'networkidle2' });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow > 0) issues.push(`sideways overflow ${overflow}px`);
  if (await p.$('[data-quiz]')) {
    for (let i = 0; i < 5; i++) { await p.click('[data-quiz] .quiz-option'); await new Promise(r => setTimeout(r, 150)); }
    const result = await p.$eval('[data-quiz]', el => el.querySelector('.quiz-result-name')?.textContent);
    console.log(`  quiz (always first answer) -> ${result}`);
    if (out) { await p.$eval('[data-quiz]', el => el.scrollIntoView({ block: 'center' })); await (await p.$('[data-quiz]')).screenshot({ path: `${out}/qa-quiz-${name}.png` }); }
  }
  if (out && name === 'phone') {
    for (const sel of ['.cs-hero', '.parade']) {
      await p.$eval(sel, el => el.scrollIntoView({ block: 'start' }));
      await new Promise(r => setTimeout(r, 2500));
      await (await p.$(sel)).screenshot({ path: `${out}/qa-${sel.slice(1)}-phone.png` });
    }
  }
  console.log(`${issues.length ? '✗' : '✓'} ${name}`); issues.forEach(i => console.log('   ' + i));
  await p.close();
}
await b.close();
