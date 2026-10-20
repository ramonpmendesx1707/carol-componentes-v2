/** Persistent category/model queue shared by Codex and Antigravity. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const queuePath=join(root,'data/harvest/queue.json');
const command=process.argv[2]||'next';
const queue=JSON.parse(await readFile(queuePath,'utf8').catch(()=>'{"schema":1,"items":{}}'));
const save=async()=>{await mkdir(dirname(queuePath),{recursive:true});await writeFile(queuePath,JSON.stringify(queue,null,2)+'\n')};
if(command==='init'){
 const sources=JSON.parse(await readFile(join(root,'data/harvest/sources.json'),'utf8'));
 for(const [supplier,info] of Object.entries(sources.suppliers))for(const seed of info.categories){if(!seed.url)continue;const id=supplier+'-'+createHash('sha256').update(seed.url).digest('hex').slice(0,12);queue.items[id]||={supplier,kind:supplier==='vibra-stop'?'model':'category',name:seed.name,url:seed.url,status:'pending',page:1,cursor:null,discoveredProductUrls:[],processedProductUrls:[],updatedAt:new Date().toISOString(),note:''};}
 const pilot='https://www.vibra-stop.com.br/produto/linha-tradicional?model=com-chapa&language=pt-BR';for(const item of Object.values(queue.items))if(item.url===pilot){item.status='complete';item.discoveredProductUrls=[pilot];item.processedProductUrls=[pilot];item.note='Piloto publicado; revalidar se a fonte mudar.';}
 await save();console.log(`Fila pronta: ${Object.keys(queue.items).length} sementes`);
}else if(command==='next'){
 const items=Object.entries(queue.items).filter(([,x])=>['in_progress','pending','blocked','needs_review'].includes(x.status));const ordered=items.sort((a,b)=>({in_progress:0,pending:1,needs_review:2,blocked:3})[a[1].status]-({in_progress:0,pending:1,needs_review:2,blocked:3})[b[1].status]);console.log(JSON.stringify(ordered.slice(0,10).map(([id,x])=>({id,...x})),null,2));
}else if(['claim','complete','block'].includes(command)){
 const id=process.argv[3],item=queue.items[id];if(!item)throw Error('ID não encontrado.');
 if(command==='complete'&&(!item.discoveredProductUrls.length||item.discoveredProductUrls.some(url=>!item.processedProductUrls.includes(url))))throw Error('Não conclua categoria sem URLs descobertas e processadas.');
 item.status=command==='claim'?'in_progress':command==='complete'?'complete':'blocked';item.updatedAt=new Date().toISOString();if(command==='block')item.note=process.argv.slice(4).join(' ')||item.note;await save();console.log(`${id}: ${item.status}`);
}else throw Error('Use init, next, claim ID, complete ID ou block ID motivo.');
