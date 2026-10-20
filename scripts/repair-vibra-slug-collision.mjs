/** One-time recovery: two families use model=sem-chapa. Re-fetch the spring separately. */
import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=async file=>JSON.parse(await readFile(join(root,file),'utf8'));
const write=async(file,value)=>writeFile(join(root,file),JSON.stringify(value,null,2)+'\n');
const committed=file=>JSON.parse(execFileSync('git',['show',`HEAD:${file}`],{cwd:root,encoding:'utf8'}));
const files=['data/harvest/products/vibra-stop-sem-chapa.json','data/harvest/manifests/vibra-stop-sem-chapa.json','data/harvest/raw/vibra-stop/vibra-stop-sem-chapa.json'];
for(const file of files)await write(file,committed(file));
const queue=await read('data/harvest/queue.json');
const ledger=await read('data/harvest/status.json');
const previousQueue=committed('data/harvest/queue.json');
const previousLedger=committed('data/harvest/status.json');
const traditional=Object.values(queue.items).find(item=>item.supplier==='vibra-stop'&&item.url.includes('linha-tradicional?model=sem-chapa'));
const spring=Object.values(queue.items).find(item=>item.supplier==='vibra-stop'&&item.url.includes('linha-mola-simples?model=sem-chapa'));
if(!traditional||!spring)throw Error('Itens da colisão não encontrados.');
Object.assign(traditional,Object.values(previousQueue.items).find(item=>item.url===traditional.url));
spring.status='blocked';spring.note='Colisão de nome curto: recolher com slug composto vibra-stop-mola-simples-sem-chapa via --retry=ID.';
spring.productFile=undefined;spring.manifestFile=undefined;spring.rawFile=undefined;
spring.discoveredProductUrls=[];spring.processedProductUrls=[];
ledger.products['vibra-stop-sem-chapa']=previousLedger.products['vibra-stop-sem-chapa'];
await write('data/harvest/queue.json',queue);
await write('data/harvest/status.json',ledger);
console.log('Família Tradicional restaurada; Mola Simples marcada para coleta isolada.');
