import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist-pages'),base=process.env.CAROL_PAGES_BASE||'/carol-componentes-v2/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.woff2':'font/woff2'};
createServer((req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!pathname.startsWith(base)){res.writeHead(404);return res.end()};let file=resolve(root,pathname.slice(base.length)||'index.html');if(!file.startsWith(root+sep)){res.writeHead(403);return res.end()};if(!existsSync(file)||statSync(file).isDirectory()){if(extname(file)){res.writeHead(404);return res.end()};file=resolve(root,'index.html')};res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(readFileSync(file))}catch{res.writeHead(500);res.end()}}).listen(4173,'127.0.0.1',()=>console.log(`Pages preview: http://127.0.0.1:4173${base}`));
