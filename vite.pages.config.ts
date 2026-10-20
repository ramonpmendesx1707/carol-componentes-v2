import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const project=fileURLToPath(new URL('.',import.meta.url));
const base=process.env.CAROL_PAGES_BASE||'/carol-componentes-v2/';
export default defineConfig({root:project+'static',base,publicDir:project+'public',resolve:{alias:{'@':project}},plugins:[{name:'carol-pages-paths',enforce:'pre',transform(source,id){
 if(!/\/(app|lib|data)\//.test(id.replaceAll('\\','/')))return;
 return source.replace(/(["'`])\/(images|downloads|produto)\//g,`$1${base}$2/`).replace(/(["'`])\/#/g,`$1${base}#`).replace(/href="\/"/g,`href="${base}"`).replace(/href="\/(admin|validacao)"/g,`href="${base}$1"`);
 }},react()],build:{outDir:project+'dist-pages',emptyOutDir:true},server:{host:'127.0.0.1',port:4174}});
