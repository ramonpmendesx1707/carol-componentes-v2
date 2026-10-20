/** Verify every dynamically rendered Vibra-Stop tab against stored originals. Never publish. */
import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const at=relative=>join(root,relative);
const read=async relative=>JSON.parse(await readFile(at(relative),'utf8'));
const write=async(relative,value)=>writeFile(at(relative),JSON.stringify(value,null,2)+'\n');
const normalize=url=>{try{const parsed=new URL(url);return `${parsed.hostname}${decodeURIComponent(parsed.pathname).replaceAll('+',' ').toLowerCase()}`}catch{return url}};
const limit=Math.max(1,Math.min(5,Number(process.argv.find(arg=>arg.startsWith('--limit='))?.split('=')[1]||1)));
const queue=await read('data/harvest/queue.json');
const ledger=await read('data/harvest/status.json');
const candidates=[];
for(const [id,item] of Object.entries(queue.items)){
  if(item.supplier!=='vibra-stop'||item.status!=='needs_review'||!item.manifestFile||!item.rawFile)continue;
  const manifest=await read(item.manifestFile);
  if(!manifest.checks?.tabsVerifiedAt)candidates.push({id,item,manifest});
  if(candidates.length>=limit)break;
}
const browser=await chromium.launch({headless:true,executablePath:process.env.CAROL_CHROME_EXECUTABLE||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':undefined)});
try{
  for(const {id,item,manifest} of candidates){
    const page=await browser.newPage({locale:'pt-BR'});
    try{
      await new Promise(resolve=>setTimeout(resolve,1100));
      const response=await page.goto(item.url,{waitUntil:'domcontentloaded',timeout:45000});
      if(!response?.ok())throw Error(`HTTP ${response?.status()}`);
      await page.locator('.product-tabs__item a').first().waitFor({timeout:30000});
      const tabs=await page.locator('.product-tabs__item').evaluateAll(items=>items.map(item=>({id:item.getAttribute('data-tab-id'),label:item.textContent.trim()})));
      const snapshots=[];
      for(const tab of tabs){
        await page.locator(`.product-tabs__item[data-tab-id="${tab.id}"] a`).click();
        await page.waitForTimeout(250);
        snapshots.push(await page.locator(`#${tab.id}`).evaluate((element,label)=>({id:element.id,label,text:element.innerText.trim(),images:[...new Set([...element.querySelectorAll('img[src]')].map(image=>image.currentSrc||image.src))],videos:[...new Set([...element.querySelectorAll('video[src],video source[src]')].map(video=>video.src))],tables:[...element.querySelectorAll('table')].map(table=>table.querySelectorAll('tr').length),frames:[...element.querySelectorAll('iframe[src]')].map(frame=>frame.src)}),tab.label));
      }
      const storedAssets=new Set((manifest.assets||[]).map(asset=>normalize(asset.sourceUrl)));
      const missingImages=[...new Set(snapshots.flatMap(tab=>tab.images).filter(url=>url.includes('/assets/product/')&&!storedAssets.has(normalize(url))))];
      const storedVideos=new Set((manifest.product?.videos||[]).map(video=>normalize(video.sourceUrl||video.url)));
      const missingVideos=[...new Set(snapshots.flatMap(tab=>tab.videos).filter(url=>url.includes('/assets/product/')&&!storedVideos.has(normalize(url))))];
      const raw=await read(item.rawFile);raw.tabSnapshots=snapshots;raw.tabsCheckedAt=new Date().toISOString();await write(item.rawFile,raw);
      manifest.checks={...manifest.checks,tabsVerifiedAt:raw.tabsCheckedAt,tabNames:tabs.map(tab=>tab.label),tabMissingImages:missingImages,tabMissingVideos:missingVideos,tabTableRows:snapshots.reduce((sum,tab)=>sum+tab.tables.reduce((a,b)=>a+b,0),0)};
      await write(item.manifestFile,manifest);
      item.tabsCheckedAt=raw.tabsCheckedAt;item.note=missingImages.length||missingVideos.length?`Abas verificadas; faltam ${missingImages.length} imagens e ${missingVideos.length} vídeos do DOM.`:'Abas verificadas; confronto final com PDFs ainda pendente.';
      ledger.products[manifest.product.slug].checks={...ledger.products[manifest.product.slug].checks,tabsVerified:tabs.length,tabMissingImages:missingImages.length,tabMissingVideos:missingVideos.length};
      await write('data/harvest/queue.json',queue);await write('data/harvest/status.json',ledger);
      console.log(JSON.stringify({id,tabs:tabs.map(tab=>tab.label),missingImages:missingImages.length,missingVideos:missingVideos.length}));
    }catch(error){item.tabCheckError=String(error);await write('data/harvest/queue.json',queue);console.error(`${id}: ${error}`)}finally{await page.close()}
  }
}finally{await browser.close()}
if(!candidates.length)console.log('Nenhuma ficha Vibra-Stop aguardando verificação de abas.');
