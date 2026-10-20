/** Rebuild descriptive sections of unpublished Vibra-Stop products from saved raw text. */
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const path=relative=>join(root,relative);
const read=async relative=>JSON.parse(await readFile(path(relative),'utf8'));
const write=async(relative,value)=>writeFile(path(relative),JSON.stringify(value,null,2)+'\n');
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function section(text,start){
  const a=text.indexOf(start);
  if(a<0)return '';
  const tail=text.slice(a+start.length);
  const stop=tail.search(/\n(?:CAPACIDADE[^\n]*:|COMPOSIÇÃO:|TIPO DE MATERIAL:|PARAFUSO:|FICHA TÉCNICA|VÍDEO|APLICABILIDADES|ESPECIFICAÇÕES|INSTALAÇÃO)(?:\n|$)/);
  return clean(stop<0?tail.slice(0,400):tail.slice(0,stop));
}
const queue=await read('data/harvest/queue.json');
for(const item of Object.values(queue.items)){
  if(item.supplier!=='vibra-stop'||item.status!=='needs_review'||!item.productFile||!item.rawFile)continue;
  const product=await read(item.productFile);
  const raw=await read(item.rawFile);
  const applications=section(raw.text,'APLICAÇÕES:');
  const composition=section(raw.text,'COMPOSIÇÃO:');
  const materials=section(raw.text,'TIPO DE MATERIAL:');
  product.summary=applications||product.name;
  product.description=`<p>${escapeHtml(product.summary)}</p>`;
  product.attributes=[['Composição',composition],['Materiais informados',materials]].filter(([,value])=>value).map(([name,value])=>({name,value}));
  await write(item.productFile,product);
  if(item.manifestFile){const manifest=await read(item.manifestFile);manifest.product=product;await write(item.manifestFile,manifest)}
  console.log(`${product.slug}: ${product.summary.length} caracteres`);
}
