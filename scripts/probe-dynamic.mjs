import { chromium } from 'playwright';

const url=process.argv[2]||'https://www.vibra-stop.com.br/produto/linha-tradicional?model=com-chapa&language=pt-BR';
const browser=await chromium.launch({headless:true,executablePath:process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':undefined});
try {
 const page=await browser.newPage({locale:'pt-BR'});
 const responses=[];
 page.on('response',r=>{const address=r.url();if(/api|json|pdf|\.mp4|\.png|youtube/i.test(address))responses.push({status:r.status(),url:address})});
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForTimeout(5000);
 const data=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,13000),images:[...document.querySelectorAll('img')].map(i=>({src:i.currentSrc||i.src,alt:i.alt})).filter(i=>/product|tradicional|chapa/i.test(i.src+' '+i.alt)).slice(0,25),links:[...document.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim().slice(0,60),href:a.href})).filter(a=>/pdf|video|youtu|produto|catalog/i.test(a.href+' '+a.text)).slice(0,35),tables:[...document.querySelectorAll('table')].map(t=>[...t.querySelectorAll('tr')].map(r=>[...r.querySelectorAll('th,td')].map(c=>c.textContent.trim())).slice(0,12)),videos:[...document.querySelectorAll('video,source,iframe')].map(e=>({tag:e.tagName,src:e.src})).filter(e=>e.src),tabs:[...document.querySelectorAll('[role="tab"],button')].map(e=>e.textContent.trim()).filter(s=>/Ficha Técnica|Vídeo|Aplicabilidades|Especificações|Instalação/i.test(s)).slice(0,15)}));
 console.log(JSON.stringify({...data,responses:responses.slice(-50)},null,2));
} finally {await browser.close()}
