import { chromium } from 'playwright';
const b = await chromium.launch({ channel:'chrome' });
const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
for (const [loc,url] of [['en','https://resaleiq.dev/'],['es','https://resaleiq.dev/es']]) {
  await p.goto(url,{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(2500);
  const t = await p.locator('body').innerText();
  console.log(`--- ${loc} rendered ---`);
  console.log('english-note-visible:', /comparables in the sample|not shelf departures/i.test(t));
  console.log('note line:', (t.split('\n').find(l=>/comparab|anuncios|Priced from|Calculado/i.test(l))||'(none)').trim());
  console.log('7d label:', (t.split('\n').find(l=>/\/ 7d/.test(l))||'(none)').trim());
}
await b.close();
