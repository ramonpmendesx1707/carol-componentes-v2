import { load } from 'cheerio';

const urls = [
  'https://www.vibra-stop.com.br/produto/linha-tradicional?model=com-chapa&language=pt-BR',
  'https://merkbak.com.br/produto/volante-dois-raios-sem-alma-de-ferro/',
  'https://www.kifix.com.br/produtos/adaptadores-para-mesas-de-sold/base-elevada/',
  'https://carolfix.com.br/',
];
for (const url of urls.filter(item=>!process.argv[2]||item.includes(process.argv[2]))) {
  try {
    const response = await fetch(url, {headers: {'user-agent': 'Mozilla/5.0 (compatible; CarolComponentesCatalogResearch/1.0)'}});
    const body = await response.arrayBuffer();
    const html = new TextDecoder(response.headers.get('content-type')?.match(/charset=([^;]+)/i)?.[1]||'utf-8').decode(body);
    const $ = load(html);
    const absolute = value => {try{return new URL(value,url).href}catch{return value}};
    const links = $('a[href]').map((_, el) => ({text:$(el).text().replace(/\s+/g,' ').trim().slice(0,100),url:absolute($(el).attr('href'))})).get();
    const images = $('img').map((_,el)=>({alt:$(el).attr('alt'),src:absolute($(el).attr('data-src')||$(el).attr('src')),srcset:$(el).attr('srcset')})).get();
    const data = {url,status:response.status,title:$('title').text(),headings:$('h1,h2,h3').map((_,e)=>$(e).text().replace(/\s+/g,' ').trim()).get().slice(0,40),links:links.filter(x=>/\.pdf|\.zip|\.mp4|youtu|vimeo|produto|catalog|download|desenho/i.test(x.url+' '+x.text)).slice(0,70),images:images.slice(0,25),tabs:$('[role=tab],.tabs a,.woocommerce-tabs a').map((_,e)=>$(e).text().trim()).get(),tables:$('table').length,htmlSize:html.length};
    if (process.argv.includes('--compact')) {
      data.links=links.filter(x=>/\.pdf|\.zip|\.mp4|youtu|vimeo|download|desenho/i.test(x.url+' '+x.text)).slice(0,20);
      data.images=images.filter(x=>/fotos_produtos|fotos_detalhes|uploads/i.test(x.src)).slice(0,30);
      data.mediaAttributes=$('[data-src],[data-image],video,iframe,a[href$=".zip"],a[href$=".pdf"]').map((_,e)=>({tag:e.tagName,html:$(e).toString().slice(0,600)})).get().filter(x=>/fotos_produtos|fotos_detalhes|\.zip|\.pdf|youtu|vimeo/i.test(x.html)).slice(0,20);
      data.tables=$('table').map((_,table)=>({headers:$(table).find('th').map((_,cell)=>$(cell).text().trim()).get().slice(0,20),rows:$(table).find('tr').slice(0,4).map((_,row)=>$(row).find('td').map((_,cell)=>$(cell).text().replace(/\s+/g,' ').trim()).get()).get()})).get();
      data.bodyText=$('main,.product,.product_detail,.conteudo').first().text().replace(/\s+/g,' ').trim().slice(0,4000);
      data.selectors={gallery:$('.woocommerce-product-gallery__image a').map((_,e)=>$(e).attr('href')).get(),options:$('select[name*="attribute"] option').map((_,e)=>({value:$(e).attr('value'),text:$(e).text()})).get(),sections:['#tab-description','#tab-additional_information','#tab-informacoes'].map(s=>({id:s,html:$(s).html()?.slice(0,3000)}))};
    }
    console.log(JSON.stringify(data,null,2));
  } catch(error) {console.error(url,String(error))}
}
