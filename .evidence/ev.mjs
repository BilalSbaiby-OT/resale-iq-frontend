import { chromium } from 'playwright';
const b = await chromium.launch({ channel:'chrome' });
const ctx = await b.newContext({viewport:{width:1280,height:900}});
const seen = [];
await ctx.route('**/*', async r => {
  const u = r.request().url();
  if (/track|analytics|event|collect/i.test(u)) seen.push(r.request().method()+' '+u.slice(0,120)+' '+(r.request().postData()||'').slice(0,160));
  await r.continue();
});
const p = await ctx.newPage();
await p.goto('https://resaleiq.dev/',{waitUntil:'networkidle',timeout:60000});
await p.waitForTimeout(3000);
console.log('events seen:', seen.length);
seen.forEach(s=>console.log(' ',s));
await b.close();
