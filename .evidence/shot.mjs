import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const out = process.argv[2] || '.evidence/landing';
const tag = process.argv[3] || 'before';
for (const [name, w, h] of [['desktop',1280,900],['mobile',390,844]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:2 });
  for (const [loc, url] of [['en','https://resaleiq.dev/'],['es','https://resaleiq.dev/es']]) {
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil:'networkidle', timeout:60000 }).catch(e=>console.log('nav',e.message));
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${tag}-${loc}-${name}-fold.png` });
    console.log('shot', tag, loc, name);
    await p.close();
  }
  await ctx.close();
}
await b.close();
