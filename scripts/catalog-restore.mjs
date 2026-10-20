import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const archive=resolve(root,'data/archive/catalog-v1.json');
const active=resolve(root,'data/catalog.json');
const action=process.argv[2];

if(action==='--archive-v1'){
 if(existsSync(archive))throw Error('O arquivo V1 já existe; nada foi substituído.');
 const raw=execFileSync('git',['show','bc264b9a3057aeb31bd79163b47f3f558d2d14da:data/catalog.json'],{cwd:root,maxBuffer:20_000_000});
 const data=JSON.parse(raw.toString('utf8'));
 if(data.products?.length!==50)throw Error('O catálogo de origem não tem os 50 produtos esperados.');
 mkdirSync(dirname(archive),{recursive:true});
 writeFileSync(archive,raw);
 console.log(`Arquivado: ${data.products.length} produtos em ${archive}`);
}else if(action==='--from-v1'){
 const current=JSON.parse(readFileSync(active,'utf8'));
 if(current.products?.length)throw Error('O catálogo ativo não está vazio; faça cópia e revisão antes de substituir.');
 const raw=readFileSync(archive);
 const data=JSON.parse(raw.toString('utf8'));
 if(data.products?.length!==50)throw Error('O backup V1 não passou na conferência.');
 writeFileSync(active,raw);
 console.log(`Restaurados ${data.products.length} produtos em ${active}. Revise o diff antes de publicar.`);
}else{
 console.error('Uso: node scripts/catalog-restore.mjs --archive-v1 | --from-v1');
 process.exitCode=2;
}
