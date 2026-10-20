// Public API origin; credentials are stored only by the server.
export const API_ORIGIN=(import.meta.env as unknown as Record<string,string>).VITE_CAROL_API_ORIGIN||'https://carol-componentes-v2.safc-conceicao87.chatgpt.site';
export async function apiFetch(path:string,init:RequestInit={}){
 const r=await fetch(new URL(path,API_ORIGIN),{...init,credentials:'omit'});
 if(r.ok&&(path==='/api/catalog'||path==='/api/manage/catalog')){
  const data=await r.json() as {products:Record<string,unknown>[]};
  const base=location.pathname.startsWith('/carol-componentes-v2/')?'/carol-componentes-v2/':'/';
  // Build the canonical prefix without an asset literal: the Pages transform
  // must never rewrite the prefix used to recognize API payloads.
  const prefixes=['images','downloads','videos'];
  const asset=(v:string)=>{const canonical=v.replace(/^\/carol-componentes-v2\/(images|downloads|videos)\//,'/$1/');return prefixes.some(folder=>canonical.startsWith('/'+folder+'/'))?base+canonical.slice(1):canonical};
  const fix=(v:unknown):unknown=>typeof v==='string'?(v.includes('<')?v.replace(/(src=["'])(\/(?:carol-componentes-v2\/)?(?:images|downloads|videos)\/[^"']+)(["'])/g,(_,a,url,z)=>a+asset(url)+z):asset(v)):Array.isArray(v)?v.map(fix):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,fix(x)])):v;
  return Response.json(fix(data),{status:r.status,headers:r.headers});
 }
 return r;
}
