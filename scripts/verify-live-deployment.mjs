import { chromium } from 'playwright';

async function verifyLive() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navegando para https://ramonpmendesx1707.github.io/carol-componentes-v2/ ...');
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const response = await page.goto('https://ramonpmendesx1707.github.io/carol-componentes-v2/', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Status HTTP:', response.status());

  await page.waitForSelector('.filters', { timeout: 15000 });

  const titles = await page.$$eval('.filters .filter-title', els => els.map(e => e.textContent?.trim()));
  console.log('Títulos dos filtros na barra lateral:', titles);

  const filterButtons = await page.$$eval('.filters button', buttons => 
    buttons.map(b => b.textContent?.trim()).filter(Boolean)
  );
  console.log('Botões no topo (Fornecedor):', filterButtons.slice(0, 7));

  const cardCount = await page.$$eval('.product-card', cards => cards.length);
  console.log('Produtos visíveis na página 1:', cardCount);

  // Click on Merkbak
  console.log('Clicando em Merkbak...');
  const merkbakBtn = await page.locator('button:has-text("Merkbak")').first();
  await merkbakBtn.click();
  await page.waitForTimeout(1000);

  const merkbakFamilies = await page.$$eval('.families-filter-title ~ button', buttons => 
    buttons.map(b => b.textContent?.trim()).filter(Boolean)
  );
  console.log('Famílias exibidas após selecionar Merkbak:', merkbakFamilies.slice(0, 18));

  // Click on Kifix
  console.log('Clicando em Kifix...');
  const kifixBtn = await page.locator('button:has-text("Kifix")').first();
  await kifixBtn.click();
  await page.waitForTimeout(1000);

  const kifixFamilies = await page.$$eval('.families-filter-title ~ button', buttons => 
    buttons.map(b => b.textContent?.trim()).filter(Boolean)
  );
  console.log('Famílias exibidas após selecionar Kifix:', kifixFamilies.slice(0, 15));

  // Click on Vibra-Stop
  console.log('Clicando em Vibra-Stop...');
  const vibraBtn = await page.locator('button:has-text("Vibra-Stop")').first();
  await vibraBtn.click();
  await page.waitForTimeout(1000);

  const vibraFamilies = await page.$$eval('.families-filter-title ~ button', buttons => 
    buttons.map(b => b.textContent?.trim()).filter(Boolean)
  );
  console.log('Famílias exibidas após selecionar Vibra-Stop:', vibraFamilies.slice(0, 10));

  await page.screenshot({ path: 'public/downloads/live-verification.png', fullPage: false });
  console.log('Screenshot salva com sucesso em public/downloads/live-verification.png');

  if (consoleErrors.length > 0) {
    console.log('Avisos/Erros de console:', consoleErrors);
  } else {
    console.log('Zero erros no console!');
  }

  await browser.close();
}

verifyLive().catch(err => {
  console.error('Falha na verificação ao vivo:', err);
  process.exit(1);
});
