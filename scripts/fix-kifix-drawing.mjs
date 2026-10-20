/** Store the public Kifix schematic locally and remove unavailable drawings from the catalog. */
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const file=relative=>join(root,relative);
const read=async relative=>JSON.parse(await readFile(file(relative),'utf8'));
const write=async(relative,value)=>writeFile(file(relative),JSON.stringify(value,null,2)+'\n');
const sourceUrl='https://www.kifix.com.br/desenhos_produtos/405_desenho_tec_Prancheta_1.jpg';
const local='images/products/kifix/base-elevada/desenho-tecnico.jpg';
const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(45000)});
if(!response.ok)throw Error(`Desenho Kifix HTTP ${response.status}`);
const bytes=Buffer.from(await response.arrayBuffer());
if(bytes.length<10000||bytes[0]!==0xff||bytes[1]!==0xd8)throw Error('O arquivo original não é um JPEG válido.');
await mkdir(dirname(file(`public/${local}`)),{recursive:true});
await writeFile(file(`public/${local}`),bytes);
const asset={path:`/${local}`,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),sourceUrl};
function update(product){
  if(product.slug!=='kifix-base-elevada')throw Error('Produto Kifix esperado não encontrado.');
  product.documents=(product.documents||[]).filter(document=>document.kind!=='restricted');
  product.images=[...(product.images||[]).filter(image=>image!==asset.path),asset.path];
  product.technicalSections=(product.technicalSections||[]).filter(section=>section.title!=='Desenho técnico da Base Elevada');
  product.technicalSections.push({title:'Desenho técnico da Base Elevada',images:[asset.path],note:'Esquema dimensional da família MS BE; confira as medidas da referência selecionada na tabela.'});
}
const catalog=await read('data/catalog.json');
const product=catalog.products.find(item=>item.slug==='kifix-base-elevada');
update(product);await write('data/catalog.json',catalog);
const pilot=await read('data/harvest/products/kifix.json');update(pilot);await write('data/harvest/products/kifix.json',pilot);
const manifest=await read('data/harvest/manifests/kifix.json');manifest.product=pilot;
manifest.assets=(manifest.assets||[]).filter(item=>item.path!==asset.path);manifest.assets.push(asset);
manifest.checks={...manifest.checks,publicSchematic:'downloaded locally',restrictedPerReferenceDrawings:'not shown in V2'};
await write('data/harvest/manifests/kifix.json',manifest);
console.log(JSON.stringify(asset));
