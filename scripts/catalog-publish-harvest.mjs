/** Promote reviewed harvest records to the active static catalog. Never imports a blocked item. */
import {readFile,writeFile,stat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=async relative=>JSON.parse(await readFile(join(root,relative),'utf8'));
const ledger=await read('data/harvest/status.json');
const catalog=await read('data/catalog.json');
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const sourcePriority={carolfix:0,merkbak:1,kifix:1,vibrastop:1};
const additions=[];
for(const [key,entry] of Object.entries(ledger.products)){
 if(!['review_ready','staged','published'].includes(entry.status))continue;
 const product=await read(entry.productFile);
 if(product.price&&Number(product.price)>0)throw Error(`Preço de fornecedor detectado: ${key}`);
 if(/\(at[eé].*dias|embarque|frete gr[aá]tis/i.test(product.summary+' '+product.description))throw Error(`Prazo comercial detectado: ${key}`);
 if(!product.image||!product.categories?.length||!product.variations?.length)throw Error(`Produto incompleto: ${key}`);
 for(const url of [product.image,...product.images,...(product.documents||[]).map(d=>d.url).filter(u=>u.startsWith('/'))]){
  const relative=url.split('#')[0].replace(/^\//,'');if(!(await stat(join(root,'public',relative)).catch(()=>null)))throw Error(`Arquivo local ausente: ${relative}`);
 }
 additions.push(product);
}
const byId=new Map(catalog.products.map(p=>[p.id,p]));for(const product of additions)byId.set(product.id,product);
const byKey=new Map();for(const product of [...byId.values()]){const key=normalize(product.sku||product.name);const prior=byKey.get(key);if(!prior||(sourcePriority[normalize(product.supplier)]||0)>(sourcePriority[normalize(prior.supplier)]||0))byKey.set(key,product)}
catalog.products=[...byKey.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
catalog.categories=[...new Map(catalog.products.flatMap(p=>p.categories).map(c=>[c.id,c])).values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
await writeFile(join(root,'data/catalog.json'),JSON.stringify(catalog,null,2)+'\n');
for(const entry of Object.values(ledger.products))if(entry.status==='review_ready')entry.status='staged';
await writeFile(join(root,'data/harvest/status.json'),JSON.stringify(ledger,null,2)+'\n');
console.log(`Catálogo ativo: ${catalog.products.length} produtos, ${catalog.products.reduce((n,p)=>n+p.variations.length,0)} referências.`);
