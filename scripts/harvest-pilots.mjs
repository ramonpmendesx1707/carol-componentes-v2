/** Four audited catalog examples. Safe to re-run; does not crawl beyond these source pages. */
import {load} from 'cheerio';
import {chromium} from 'playwright';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const path=relative=>join(root,relative);
const publicPath=relative=>path('public/'+relative);
const now=()=>new Date().toISOString();
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const absolute=(src,base)=>new URL(src,base).href;
const category=(id,name,slug)=>({id,name,slug});
const attr=(name,value)=>({name:clean(name),value:clean(value)});
const variant=(id,label,attributes=[],weight='',dimensions='',image=null)=>({id,sku:label,label,attributes,weight,dimensions,image});
const pilotUrls={
 vibra:'https://www.vibra-stop.com.br/produto/linha-tradicional?model=com-chapa&language=pt-BR',
 merkbak:'https://merkbak.com.br/produto/volante-dois-raios-sem-alma-de-ferro/',
 kifix:'https://www.kifix.com.br/produtos/adaptadores-para-mesas-de-sold/base-elevada/',
 carolfix:'https://carolfix.com.br/wp-content/uploads/2021/03/Catalogo-Carolfix-1.pdf',
};
const ledgerPath=path('data/harvest/status.json');
const ledger=JSON.parse(await readFile(ledgerPath,'utf8').catch(()=>'{"schema":1,"products":{}}'));
const requested=process.argv.find(a=>a.startsWith('--supplier='))?.split('=')[1];
if(requested&&!pilotUrls[requested])throw Error('Fornecedor desconhecido.');
const tasks=requested?[requested]:Object.keys(pilotUrls);

async function document(url){const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 CarolComponentesCatalogResearch/1.0'},signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(`${response.status} ${url}`);const body=await response.arrayBuffer();const charset=response.headers.get('content-type')?.match(/charset=([^;]+)/i)?.[1]||'utf-8';return load(new TextDecoder(charset).decode(body));}
async function asset(url,relative,{maxBytes=35_000_000,optional=false}={}){
 const target=publicPath(relative);
 try {const old=await stat(target).catch(()=>null);if(old?.size>0)return {path:'/'+relative,bytes:old.size,sha256:createHash('sha256').update(await readFile(target)).digest('hex'),sourceUrl:url};
 const response=await fetch(url,{signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error(`HTTP ${response.status}`);const length=Number(response.headers.get('content-length')||0);if(length>maxBytes)throw Error(`Arquivo grande (${length} bytes)`);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>maxBytes)throw Error(`Arquivo grande (${bytes.length} bytes)`);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);return {path:'/'+relative,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),sourceUrl:url};
 }catch(error){if(optional)return {sourceUrl:url,status:'link-only',reason:String(error)};throw error}
}
function base(id,slug,name,supplier,sourceUrl,categories){return {id,slug,name,sku:'',brand:supplier,supplier,sourceUrl,type:'product',summary:'',description:'',categories,image:'/images/photo-pending.svg',images:[],attributes:[],weight:'',dimensions:'',variations:[],documents:[],videos:[],technicalSections:[],homepage:true};}
async function vibra(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.CAROL_CHROME_EXECUTABLE||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':undefined)});
 let captured;
 try {const page=await browser.newPage({locale:'pt-BR'});await page.goto(pilotUrls.vibra,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForFunction(()=>document.body.innerText.includes('FICHA TÉCNICA'),{timeout:30000});await page.waitForTimeout(2000);captured=await page.evaluate(()=>({title:document.title,text:document.body.innerText,images:[...document.querySelectorAll('img')].map(i=>i.currentSrc||i.src).filter(x=>/assets\/product\/(images|applicabilities|installations)\//.test(x)),table:[...document.querySelectorAll('table')].map(t=>[...t.querySelectorAll('tr')].map(r=>[...r.querySelectorAll('th,td')].map(c=>c.textContent.trim()))).find(rows=>rows[0]?.includes('Referência')),video:[...document.querySelectorAll('video source')].map(x=>x.src).find(Boolean),pdf:[...document.querySelectorAll('iframe')].map(x=>x.src).find(x=>x.includes('/datasheets/'))}));}finally{await browser.close()}
 if(!captured.table||captured.table.length<4)throw Error('Tabela Vibra-Stop ausente.');
 const p=base(200001,'vibra-stop-tradicional-com-chapa','Amortecedor Tradicional com Chapa','Vibra-Stop',pilotUrls.vibra,[category(201,'Amortecedores de vibração','amortecedores-de-vibracao')]);p.sku='Tradicional CC';p.summary='Amortecedor com chapa para fixação no piso por dois chumbadores, destinado a equipamentos industriais.';p.description='<p>Aplicações citadas pelo fabricante: grupos geradores, politrizes, britadeiras, chillers e máquinas de lavar.</p>';p.attributes=[attr('Composição','Ferro nodular, borracha natural e aço carbono zincado'),attr('Materiais informados','Aço inox e ferro nodular'),attr('Capacidade estática/dinâmica geral','50 a 200 kgf / 200 a 800 kgf')];
 const headings=captured.table[0],units=captured.table[1]||[];p.variations=captured.table.slice(2).filter(row=>row[0]).map((row,index)=>variant(210001+index,clean(row[0]),headings.slice(1).map((h,i)=>attr(`${h}${units[i+1]?` (${units[i+1]})`:''}`,row[i+1]))));
 p.technicalSections=[{title:'Ficha técnica dimensional',columns:headings,rows:captured.table.slice(2)}];
 const urls=[...new Set(captured.images)];const media=[];for(let i=0;i<urls.length;i++){const url=urls[i],kind=url.includes('/applicabilities/')?'aplicacao':url.includes('/installations/')?'instalacao':'foto';media.push(await asset(url,`images/products/vibra-stop/tradicional-com-chapa/${kind}-${i+1}.png`));}
 p.images=media.filter(m=>m.path&&m.path.includes('/foto-')).map(m=>m.path);p.image=p.images[0]||p.image;p.technicalSections.push({title:'Aplicabilidades e instalação',images:media.filter(m=>m.path&&!m.path.includes('/foto-')).map(m=>m.path)});
 const pdfUrl='https://www.vibra-stop.com.br/assets/product/datasheets/Vibra-Stop%20-%20Com%20Chapa.pdf';const pdf=await asset(pdfUrl,'downloads/products/vibra-stop/tradicional-com-chapa/ficha-tecnica.pdf');p.documents=[{title:'Ficha técnica oficial',url:pdf.path,sourceUrl:pdfUrl,kind:'pdf'}];
 if(captured.video){const remote=await asset(captured.video,'videos/products/vibra-stop/tradicional-com-chapa/treinamento.mp4',{maxBytes:95_000_000,optional:true});p.videos=[{title:'Vídeo de treinamento Vibra-Stop',url:remote.path||captured.video,sourceUrl:captured.video,hosted:!!remote.path,reason:remote.reason||''}];}
 return {product:p,assets:[...media,pdf],checks:{tabs:['Ficha técnica','Vídeo','Aplicabilidades','Especificações','Instalação'],variants:p.variations.length,videoHosted:p.videos[0]?.hosted||false}};
}
async function merkbak(){
 const $=await document(pilotUrls.merkbak);const title=clean($('h1.product_title').first().text()).replace(/\s*\/Merkbak.*$/i,'');if(!title)throw Error('Produto Merkbak sem título.');const p=base(200002,'merkbak-volante-dois-raios-sem-alma','Volante Dois Raios sem Alma de Ferro','Merkbak',pilotUrls.merkbak,[category(202,'Volantes','volantes'),category(203,'Plásticos','plasticos')]);p.sku='V2R S/ALMA';p.summary='Volante de dois raios, revestido em nylon reforçado com fibra de vidro e cubo de ferro fundido.';
 const info=$('#tab-informacoes tr').map((_,row)=>{const cells=$(row).find('td').map((_,e)=>clean($(e).text())).get();return cells.length>=2?attr(cells[0],cells[1]):null}).get();p.attributes=info.filter(a=>!/^PESO$/i.test(a.name));p.description='<p>'+p.attributes.filter(a=>/APLICAÇÃO|INFORMAÇÕES ADICIONAIS/i.test(a.name)).map(a=>`${a.name}: ${a.value}`).join(' ')+'</p>';
 const options=$('select[name*="attribute"] option').map((_,e)=>clean($(e).attr('value'))).get().filter(Boolean);p.variations=options.map((label,i)=>variant(220001+i,label));
 const gallery=[...new Set($('.woocommerce-product-gallery__image a').map((_,a)=>$(a).attr('href')).get().filter(Boolean))];const media=[];for(let i=0;i<gallery.length;i++){const url=absolute(gallery[i],pilotUrls.merkbak);media.push(await asset(url,`images/products/merkbak/volante-dois-raios-sem-alma/${i+1}.png`));}p.images=media.map(m=>m.path);p.image=p.images[0]||p.image;
 p.technicalSections=[{title:'Informações do fabricante',items:info},{title:'Medidas disponíveis',items:options.map(value=>attr('Medida',value))}];
 return {product:p,assets:media,checks:{tabs:['Descrição','Informação adicional','INFORMAÇÕES'],variants:options.length,pdfs:0,videos:0}};
}
async function kifix(){
 const $=await document(pilotUrls.kifix);const p=base(200003,'kifix-base-elevada','Base Elevada para Mesa de Solda','Kifix',pilotUrls.kifix,[category(204,'Adaptadores para mesas de solda','adaptadores-para-mesas-de-solda')]);p.sku='MS BE / KF-532/528';p.summary='Base elevada para adaptar grampos à mesa de solda. Referências com diferentes diâmetros e alturas.';p.description='<p>Dimensões e desenhos técnicos por referência, conforme tabela oficial Kifix.</p>';
 const table=$('table').first();const headers=table.find('tr').first().find('th,td').map((_,e)=>clean($(e).text())).get();const values=table.find('tr').slice(1).toArray().map(row=>$(row).find('th,td').map((_,cell)=>clean($(cell).text())).get()).filter(cols=>cols.length>=12);if(values.length<9)throw Error('Tabela Kifix incompleta.');
 p.variations=values.map((row,i)=>variant(230001+i,row[0],headers.slice(1).map((h,j)=>attr(h,row[j+1])),row.at(-1)||''));p.technicalSections=[{title:'Tabela dimensional do fabricante',columns:headers,rows:values}];
 const gallery=[...new Set($('img[src*="fotos_produtos/"]').map((_,img)=>absolute($(img).attr('src'),pilotUrls.kifix)).get())];const media=[];for(let i=0;i<gallery.length;i++)media.push(await asset(gallery[i],`images/products/kifix/base-elevada/${i+1}.png`));p.images=media.map(m=>m.path);p.image=p.images[0]||p.image;
 p.documents=[{title:'Desenhos por referência (login exigido pelo fabricante)',url:pilotUrls.kifix,sourceUrl:pilotUrls.kifix,kind:'restricted',note:'Não contornar o login; solicitar o arquivo ao fornecedor.'}];
 return {product:p,assets:media,checks:{variants:p.variations.length,drawings:'restrito a usuário autenticado',rows:values.length}};
}
async function carolfix(){
 // This product is in CarolFix's own 60-page technical catalog, not its 50 Merkbak WooCommerce entries.
 const p=base(200004,'carolfix-anel-retencao-eixo-liso','Anel de Retenção para Eixo Liso','Carolfix',pilotUrls.carolfix,[category(205,'Anéis de retenção','aneis-de-retencao')]);p.sku='Série 525';p.summary='Anel de retenção para eixo liso; 24 referências dimensionais no catálogo técnico Carolfix, página 18.';p.description='<p>Série especial com dimensões d1, e, d3, d4, número de dentes, X e capacidade axial informadas na página 18 do catálogo.</p>';
 const rows=[
 ['525.015','1,5','0,25','1,4','6','3','1,5','10'],['525.020','2','0,25','1,85','6,5','3','1,5','15'],['525.030','3','0,25','2,8','8','4','1,5','20'],['525.035','3,5','0,4','3,3','8,2','4','2','21'],['525.040','4','0,25','3,8','9','4','2','22'],['525.050','5','0,25','4,8','10','4','2','23'],['525.060','6','0,25','5,8','11','4','2,5','24'],['525.070','7','0,25','6,8','12','4','2,5','25'],['525.080','8','0,25','7,75','13','4','2,5','25'],['525.090','9','0,3','8,75','14','6','2,5','30'],['525.100','10','0,3','9,75','16','6','3','32'],['525.120','12','0,3','11,7','18','6','3','35'],['525.140','14','0,3','13,7','20,5','6','3','40'],['525.150','15','0,5','14,6','23','8','3','60'],['525.160','16','0,4','45,6','24,5','8','3','70'],['525.170','17','0,5','16,6','26','8','3,5','80'],['525.180','18','0,4','17,6','27','8','3,5','85'],['525.190','19','0,5','18,6','28','8','3,5','90'],['525.200','20','0,5','19,5','29','8','3,5','95'],['525.220','22','0,5','21,5','31','8','3,5','100'],['525.230','23','0,5','22,5','31,5','8','4','105'],['525.250','25','0,5','24,5','34','8','4','110'],['525.280','28','0,5','27,5','37','8','4','120'],['525.300','30','0,5','29,5','40','8','4','130']];
 const headers=['Código','d1 (mm)','e (mm)','d3 (mm)','d4 (mm)','Nº de dentes','X (mm)','Capacidade axial (kgf)'];p.variations=rows.map((row,i)=>variant(240001+i,row[0],headers.slice(1).map((h,j)=>attr(h,row[j+1]))));p.technicalSections=[{title:'Página 18 — anel de retenção para eixo liso',columns:headers,rows,note:'Fonte apresenta d3=45,6 para 525.160; valor mantido sem correção e sinalizado para revisão técnica.'}];
 p.documents=[{title:'Catálogo técnico Carolfix, página 18',url:'/downloads/catalogo-carol-componentes.pdf#page=18',sourceUrl:pilotUrls.carolfix,kind:'pdf'}];p.attributes=[attr('Origem','Catálogo Carolfix, edição histórica, página 18'),attr('Pendência de validação','Conferir d3 da referência 525.160 com a equipe técnica')];
 const existing=publicPath('images/products/carolfix/anel-retencao-eixo-liso/visual-pagina-18.png');const rendered=await stat(existing).catch(()=>null);if(rendered?.size){p.image='/images/products/carolfix/anel-retencao-eixo-liso/visual-pagina-18.png';p.images=[p.image];}
 return {product:p,assets:rendered?[{path:p.image,bytes:rendered.size,sourceUrl:pilotUrls.carolfix}]:[],checks:{variants:rows.length,source:'PDF página 18',anomaly:'525.160 d3=45,6 — revisão pendente'}};
}
const handlers={vibra,merkbak,kifix,carolfix};
for(const key of tasks){
 const entry=ledger.products[key]||{};entry.sourceUrl=pilotUrls[key];entry.status='in_progress';entry.startedAt=entry.startedAt||now();ledger.products[key]=entry;await mkdir(dirname(ledgerPath),{recursive:true});await writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
 try{const result=await handlers[key]();const productPath=path(`data/harvest/products/${key}.json`);await mkdir(dirname(productPath),{recursive:true});await writeFile(productPath,JSON.stringify(result.product,null,2)+'\n');const manifestPath=path(`data/harvest/manifests/${key}.json`);await mkdir(dirname(manifestPath),{recursive:true});await writeFile(manifestPath,JSON.stringify({sourceUrl:pilotUrls[key],fetchedAt:now(),...result},null,2)+'\n');Object.assign(entry,{status:'review_ready',updatedAt:now(),productFile:`data/harvest/products/${key}.json`,manifestFile:`data/harvest/manifests/${key}.json`,checks:result.checks,error:null});console.log(`${key}: ${result.product.variations.length} variantes; ${result.assets.length} arquivos`)}catch(error){Object.assign(entry,{status:'blocked',updatedAt:now(),error:String(error)});console.error(`${key}: ${error}`)}await writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
}
