/** Resume the Vibra-Stop model queue one public model at a time. Never auto-publish. */
import {chromium} from 'playwright';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,stat,readdir} from 'node:fs/promises';
import {dirname,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const at=relative=>join(root,relative);
const read=async relative=>JSON.parse(await readFile(at(relative),'utf8'));
const write=async(relative,value)=>{await mkdir(dirname(at(relative)),{recursive:true});await writeFile(at(relative),JSON.stringify(value,null,2)+'\n')};
const now=()=>new Date().toISOString();
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const slugify=value=>clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const limit=Math.max(1,Math.min(5,Number(process.argv.find(arg=>arg.startsWith('--limit='))?.split('=')[1]||1)));
const retryId=process.argv.find(arg=>arg.startsWith('--retry='))?.split('=')[1];
const queue=await read('data/harvest/queue.json');
const ledger=await read('data/harvest/status.json');
const catalog=await read('data/catalog.json');
const completed=new Set(catalog.products.map(p=>p.sourceUrl));
const pending=Object.entries(queue.items).filter(([id,item])=>item.supplier==='vibra-stop'&&(retryId?id===retryId&&item.status==='blocked':item.status==='pending')&&!completed.has(item.url)).slice(0,limit);
const robots=await fetch('https://www.vibra-stop.com.br/robots.txt',{signal:AbortSignal.timeout(20000)});
if(!robots.ok)throw Error(`robots.txt: HTTP ${robots.status}`);
if(/^Disallow:\s*\/produto(?:\s|$)/im.test(await robots.text()))throw Error('robots.txt restringe /produto.');
const harvested=[];
for(const file of await readdir(at('data/harvest/products'))){if(file.endsWith('.json'))harvested.push(await read(`data/harvest/products/${file}`))}
const existing=[...catalog.products,...harvested];
let nextProductId=Math.max(200004,...existing.map(p=>p.id))+1;
let nextVariantId=Math.max(240024,...existing.flatMap(p=>p.variations.map(v=>v.id)))+1;
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const browser=await chromium.launch({headless:true,executablePath:process.env.CAROL_CHROME_EXECUTABLE||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':undefined)});

async function saveAsset(url,relative){
  if(new URL(url).hostname!=='www.vibra-stop.com.br')throw Error(`Host de arquivo inesperado: ${url}`);
  const destination=at(`public/${relative}`);
  const previous=await stat(destination).catch(()=>null);
  if(previous?.size>0){const bytes=await readFile(destination);return {path:`/${relative}`,sourceUrl:url,bytes:bytes.length,sha256:sha(bytes)}}
  await delay(1000+Math.floor(Math.random()*300));
  const response=await fetch(url,{signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw Error(`Arquivo HTTP ${response.status}: ${url}`);
  const expected=Number(response.headers.get('content-length')||0);
  if(expected>30_000_000)throw Error(`Arquivo maior que 30 MB: ${url}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(!bytes.length||bytes.length>30_000_000)throw Error(`Arquivo vazio ou grande: ${url}`);
  const type=response.headers.get('content-type')||'';
  if(!/image\/|application\/pdf|octet-stream/i.test(type))throw Error(`Tipo de arquivo inesperado ${type}: ${url}`);
  await mkdir(dirname(destination),{recursive:true});await writeFile(destination,bytes);
  return {path:`/${relative}`,sourceUrl:url,bytes:bytes.length,sha256:sha(bytes),contentType:type};
}
function section(text,start,end){const a=text.indexOf(start);if(a<0)return '';const b=end?text.indexOf(end,a+start.length):-1;return clean(text.slice(a+start.length,b<0?undefined:b));}
async function collect(id,item){
  item.status='in_progress';item.updatedAt=now();await write('data/harvest/queue.json',queue);
  const page=await browser.newPage({locale:'pt-BR'});
  const observedPdfs=new Set();
  page.on('response',response=>{try{const url=new URL(response.url());if(url.pathname.startsWith('/assets/product/datasheets/')&&url.pathname.toLowerCase().endsWith('.pdf')&&response.ok())observedPdfs.add(url.href)}catch{}});
  try{
    await delay(1000+Math.floor(Math.random()*300));
    const response=await page.goto(item.url,{waitUntil:'domcontentloaded',timeout:45000});
    if(!response?.ok())throw Error(`Página HTTP ${response?.status()}`);
    await page.waitForFunction(()=>document.body.innerText.includes('FICHA TÉCNICA'),{timeout:30000});
    await page.locator('table').first().waitFor({timeout:30000});
    await page.waitForTimeout(1200);
    const captured=await page.evaluate(()=>({
      title:document.title,
      text:document.body.innerText,
      images:[...new Set([...document.querySelectorAll('img')].map(image=>image.currentSrc||image.src).filter(src=>/\/assets\/product\/(images|applicabilities|installations)\//.test(src)))],
      tables:[...document.querySelectorAll('table')].map(table=>[...table.querySelectorAll('tr')].map(row=>[...row.querySelectorAll('th,td')].map(cell=>cell.textContent.trim()))),
      frames:[...document.querySelectorAll('iframe[src]')].map(frame=>frame.src).filter(src=>src.startsWith('https://www.vibra-stop.com.br/')),
      videos:[...document.querySelectorAll('video source[src]')].map(source=>source.src).filter(src=>src.startsWith('https://www.vibra-stop.com.br/')),
      headings:[...document.querySelectorAll('h1,h2,h3')].map(heading=>heading.textContent.trim()).filter(Boolean)
    }));
    const rows=captured.tables.find(table=>table[0]?.[0]==='Referência');
    if(!rows||rows.length<3||rows[2].length<3)throw Error('Tabela técnica ausente ou incompleta.');
    const model=new URL(item.url).searchParams.get('model');
    if(!model)throw Error('Modelo sem identificador de URL.');
    const slug=`vibra-stop-${slugify(model)}`;
    const folder=`images/products/vibra-stop/${slugify(model)}`;
    const title=clean(captured.headings.find(value=>value.startsWith('Vibra-Stop'))||captured.title);
    const applications=section(captured.text,'APLICAÇÕES:','CAPACIDADE ESTÁTICA/DINÂMICA:');
    const composition=section(captured.text,'COMPOSIÇÃO:','TIPO DE MATERIAL:');
    const materials=section(captured.text,'TIPO DE MATERIAL:','PARAFUSO:');
    const heads=rows[0],units=rows[1]||[];
    const columns=heads.map((head,index)=>clean(`${head}${index&&units[index]?` (${units[index]})`:''}`));
    const dataRows=rows.slice(2).filter(row=>row[0]&&row.length===heads.length);
    if(!dataRows.length)throw Error('Nenhuma referência dimensional completa.');
    const images=[],technicalImages=[],assets=[];
    for(const [index,url] of captured.images.entries()){
      const kind=url.includes('/images/')?'foto':url.includes('/applicabilities/')?'aplicacao':'instalacao';
      const ext=extname(new URL(url).pathname).toLowerCase()||'.png';
      const asset=await saveAsset(url,`${folder}/${kind}-${index+1}${ext}`);
      assets.push(asset);(kind==='foto'?images:technicalImages).push(asset.path);
    }
    if(!images.length)throw Error('Sem fotografia original para este modelo.');
    const documents=[];
    for(const frame of captured.frames){
      const raw=new URL(frame).searchParams.get('file');
      if(raw&&raw.includes('/assets/product/datasheets/'))observedPdfs.add(new URL(raw,item.url).href);
    }
    const seenPdfs=new Set();
    for(const source of observedPdfs){
      const canonical=decodeURIComponent(new URL(source).pathname).replaceAll('+',' ').toLowerCase();
      if(seenPdfs.has(canonical))continue;
      seenPdfs.add(canonical);
      const asset=await saveAsset(source,`downloads/products/vibra-stop/${slugify(model)}/ficha-tecnica.pdf`);
      assets.push(asset);documents.push({title:'Ficha técnica oficial',url:asset.path,sourceUrl:source,kind:'pdf'});
    }
    if(!documents.length)throw Error('Ficha técnica PDF não localizada.');
    const videos=[...new Set(captured.videos)].filter(url=>url.startsWith('https://www.vibra-stop.com.br/')).map(url=>({title:'Vídeo apresentado pelo fabricante',url,sourceUrl:url,hosted:false,reason:'Vídeo remoto grande; evitar arquivo único acima do limite do repositório.'}));
    const product={id:nextProductId++,slug,name:title,sku:item.name,brand:'Vibra-Stop',supplier:'Vibra-Stop',sourceUrl:item.url,type:'product',summary:applications||title,description:`<p>${escapeHtml(applications||title)}</p>`,categories:[{id:201,name:'Amortecedores de vibração',slug:'amortecedores-de-vibracao'}],image:images[0],images,attributes:[...[['Composição',composition],['Materiais informados',materials]].filter(([,value])=>value).map(([name,value])=>({name,value}))],weight:'',dimensions:'',variations:dataRows.map(row=>({id:nextVariantId++,sku:clean(row[0]),label:clean(row[0]),attributes:columns.slice(1).map((name,index)=>({name,value:clean(row[index+1])})),weight:'',dimensions:'',image:null})),documents,videos,technicalSections:[{title:'Ficha técnica dimensional',columns,rows:dataRows},{title:'Aplicabilidades e instalação',images:technicalImages}],homepage:false};
    const productFile=`data/harvest/products/${slug}.json`;
    const manifestFile=`data/harvest/manifests/${slug}.json`;
    const rawFile=`data/harvest/raw/vibra-stop/${slug}.json`;
    await write(rawFile,{sourceUrl:item.url,fetchedAt:now(),...captured});
    await write(productFile,product);
    await write(manifestFile,{sourceUrl:item.url,fetchedAt:now(),product,assets,checks:{model,tableRows:dataRows.length,photos:images.length,technicalImages:technicalImages.length,pdfs:documents.length,videos:videos.length,manualReviewRequired:true}});
    item.status='needs_review';item.updatedAt=now();item.discoveredProductUrls=[item.url];item.processedProductUrls=[];item.productFile=productFile;item.manifestFile=manifestFile;item.rawFile=rawFile;item.note='Coletado integralmente do DOM público e mídias originais; revisão de todas as abas/tabela pendente antes da publicação.';
    ledger.products[slug]={sourceUrl:item.url,status:'needs_review',updatedAt:now(),productFile,manifestFile,checks:{variants:product.variations.length,photos:images.length,pdfs:documents.length,videos:videos.length}};
    ledger.lastHandoff={...ledger.lastHandoff,updatedAt:now(),nextQueueId:id,nextSourceUrl:item.url,nextAction:`Revisar ${productFile} contra ${item.url} e PDFs; depois marcar review_ready/publicar ou registrar divergências.`};
    await write('data/harvest/queue.json',queue);await write('data/harvest/status.json',ledger);
    console.log(JSON.stringify({id,status:item.status,productFile,variants:product.variations.length,photos:images.length,pdfs:documents.length,videos:videos.length}));
  }catch(error){item.status='blocked';item.note=String(error);item.updatedAt=now();await write('data/harvest/queue.json',queue);console.error(`${id}: ${error}`)}finally{await page.close()}
}
try{for(const [id,item] of pending)await collect(id,item)}finally{await browser.close()}
if(!pending.length)console.log('Nenhum modelo Vibra-Stop pendente na fila.');
