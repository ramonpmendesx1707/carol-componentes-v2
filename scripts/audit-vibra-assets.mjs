/** Offline integrity gate for the complete Vibra-Stop first-pass harvest. */
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=async relative=>JSON.parse(await readFile(join(root,relative),'utf8'));
const queue=await read('data/harvest/queue.json');
const items=Object.values(queue.items).filter(item=>item.supplier==='vibra-stop'&&item.status==='needs_review');
const errors=[],ids=new Set(),variantIds=new Set();
let photos=0,technicalImages=0,pdfs=0,variants=0,bytes=0;
for(const item of items){
  try{
    const product=await read(item.productFile),manifest=await read(item.manifestFile),raw=await read(item.rawFile);
    if(product.sourceUrl!==item.url||manifest.sourceUrl!==item.url||raw.sourceUrl!==item.url)errors.push(`${product.slug}: origem inconsistente`);
    if(ids.has(product.id))errors.push(`${product.slug}: ID repetido`);ids.add(product.id);
    if(!item.tabsCheckedAt||!manifest.checks?.tabsVerifiedAt)errors.push(`${product.slug}: abas sem conferência`);
    if(manifest.checks?.tabMissingImages?.length||manifest.checks?.tabMissingVideos?.length)errors.push(`${product.slug}: mídia de aba faltante`);
    if(!product.variations?.length||product.variations.length!==manifest.checks?.tableRows)errors.push(`${product.slug}: referências não conferem`);
    if(/SOBRE NÓS|NEWSLETTER|FICHA TÉCNICA/.test(product.summary||''))errors.push(`${product.slug}: descrição contaminada`);
    for(const variant of product.variations){if(variantIds.has(variant.id))errors.push(`${product.slug}: ID de referência repetido`);variantIds.add(variant.id)}
    variants+=product.variations.length;photos+=product.images.length;
    technicalImages+=product.technicalSections?.flatMap(section=>section.images||[]).length||0;
    pdfs+=product.documents?.filter(document=>document.kind==='pdf').length||0;
    for(const asset of manifest.assets||[]){
      const data=await readFile(join(root,'public',asset.path.slice(1)));
      const hash=createHash('sha256').update(data).digest('hex');
      if(data.length!==asset.bytes||hash!==asset.sha256)errors.push(`${product.slug}: hash/tamanho divergente ${asset.path}`);
      if(asset.path.endsWith('.pdf')&&!data.subarray(0,5).equals(Buffer.from('%PDF-')))errors.push(`${product.slug}: PDF inválido ${asset.path}`);
      if(asset.path.includes('/foto-')&&data.length<10000)errors.push(`${product.slug}: foto pequena ${asset.path}`);
      bytes+=data.length;
    }
  }catch(error){errors.push(`${item.name}: ${error}`)}
}
const summary={products:items.length,variants,photos,technicalImages,pdfs,totalAssetMiB:Number((bytes/1048576).toFixed(1)),errors};
console.log(JSON.stringify(summary,null,2));
if(errors.length)process.exitCode=1;
