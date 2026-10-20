import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.CAROL_PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CAROL_CHROME_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const base=process.env.CAROL_TEST_URL||'http://127.0.0.1:4173/carol-componentes-v2/';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
await page.route('**/api/catalog',r=>r.fulfill({json:{products:catalog.products,revision:1}}));
await page.route('**/api/manage/**',r=>r.fulfill({json:r.request().url().endsWith('/login')?{token:'qa-only',mustChange:false}:{products:catalog.products,revision:1}}));
fs.mkdirSync('work',{recursive:true});
const reports=[];
async function audit(name){
 const bad=await page.evaluate(()=>{
  const lum=c=>{const v=c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722};
  const parse=s=>(s.match(/[\d.]+/g)||[]).map(Number);
  const result=[];
  for(const el of document.querySelectorAll('body *')){
   if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||!el.checkVisibility()||el.closest('button:disabled, [aria-hidden=true]'))continue;
   const cs=getComputedStyle(el);if(Number(cs.opacity)<1)continue;
   let bg=[255,255,255],node=el,found=false;
   while(node){const s=getComputedStyle(node);const c=parse(s.backgroundColor);if(s.backgroundImage!=='none'){found=false;break}if(c.length>=3&&(c.length===3||c[3]===1)){bg=c;found=true;break}if(c[3]>0&&c[3]<1){found=false;break}node=node.parentElement}
   if(!found)continue;
   const fg=parse(cs.color);const ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05);
   const large=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&parseInt(cs.fontWeight)>=700);
   if(ratio<(large?3:4.5))result.push({text:el.textContent.trim().slice(0,65),selector:el.tagName+'.'+el.className,color:cs.color,bg,ratio:Number(ratio.toFixed(2))});
  }return result;
 });reports.push({name,contrastFailures:bad});
}
await page.goto(base,{waitUntil:'networkidle'});await audit('home');await page.screenshot({path:'work/theme-home.png'});
await page.locator('.footer').scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.locator('.official-logo img').evaluate(img=>img.decode());await page.screenshot({path:'work/theme-footer.png'});
await page.locator('.product-card .text-action').first().click();await page.locator('.product-explorer').waitFor();await audit('product');await page.screenshot({path:'work/theme-product.png'});await page.getByRole('button',{name:'Fechar produto',exact:true}).click();
await page.getByRole('button',{name:'Iniciar contato pelo WhatsApp',exact:true}).click();await page.getByRole('heading',{name:'Encontre a solução para sua indústria.',exact:true}).waitFor();await audit('contact');await page.screenshot({path:'work/theme-contact.png'});await page.keyboard.press('Escape');
await page.getByRole('button',{name:'Privacidade',exact:true}).click();await audit('privacy');await page.keyboard.press('Escape');
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width===390){await page.goto(base);await page.screenshot({path:'work/theme-mobile.png'});}}
await page.goto(base+'admin/',{waitUntil:'networkidle'});await audit('admin-login');await page.getByLabel('Senha',{exact:true}).fill('qa-only');await page.getByRole('button',{name:'Entrar na administração'}).click();await page.getByRole('button',{name:'Incluir Produto'}).waitFor();await audit('admin-catalog');await page.screenshot({path:'work/theme-admin.png'});await page.getByRole('button',{name:'Incluir Produto'}).click();await audit('admin-editor');await page.screenshot({path:'work/theme-editor.png'});
fs.writeFileSync('work/theme-audit.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports.map(r=>({...r,contrastFailures:[...new Map(r.contrastFailures.map(x=>[x.text,x])).values()]})),null,2));await browser.close();
assert.equal(reports.flatMap(r=>r.contrastFailures).length,0,'Visible text contrast failures');
