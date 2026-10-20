import {chromium} from 'playwright';
const base=process.env.CAROL_TEST_URL||'http://127.0.0.1:4173/carol-componentes-v2/';
const browser=await chromium.launch({headless:true,executablePath:process.env.CAROL_CHROME_EXECUTABLE||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':undefined)});
try {
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',error=>errors.push(String(error)));
  await page.goto(base,{waitUntil:'domcontentloaded'});try{await page.locator('.product-card').first().waitFor({timeout:15000})}catch(error){console.error((await page.locator('body').innerText()).slice(0,1800),errors);throw error}
  const cardCount=await page.locator('.catalog-results .product-card').count();if(cardCount!==4)throw Error(`Esperava 4 cards, encontrei ${cardCount} em ${width}px.`);
  await page.locator('aside.filters button').filter({hasText:'Kifix'}).click();if(await page.locator('.catalog-results .product-card').count()!==1)throw Error('Filtro Kifix falhou.');
  await page.locator('.catalog-results .product-card').first().getByText('Ver componente').click();await page.getByRole('tab',{name:'Dados técnicos'}).click();if(!await page.getByText('Tabela dimensional do fabricante').isVisible())throw Error('Tabela técnica Kifix ausente.');
  await page.getByRole('tab',{name:'Materiais técnicos'}).click();if(!await page.getByText('login exigido pelo fabricante').isVisible())throw Error('Restrição de desenho Kifix ausente.');
  if(errors.length)throw Error(`Erros de navegador: ${errors.join('; ')}`);
  console.log(`${width}px: 4 produtos, filtro e abas Kifix OK`);await page.close();
 }
 const page=await browser.newPage();await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('.product-card').first().waitFor();await page.locator('aside.filters button').filter({hasText:'Vibra-Stop'}).click();await page.locator('.catalog-results .product-card').first().getByText('Ver componente').click();await page.getByRole('tab',{name:'Vídeo'}).click();if(!await page.getByText('Assistir no site do fabricante').isVisible())throw Error('Link de vídeo Vibra ausente.');const broken=await page.locator('.detail-image img').evaluate(img=>img.naturalWidth===0);if(broken)throw Error('Imagem Vibra quebrada.');console.log('Vibra-Stop: vídeo de origem e imagem OK');await page.close();
}finally{await browser.close()}
