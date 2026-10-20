import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CAROL_CHROME_EXECUTABLE || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined)
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Connecting to https://ramonpmendesx1707.github.io/carol-componentes-v2/ ...');
  await page.goto('https://ramonpmendesx1707.github.io/carol-componentes-v2/', { waitUntil: 'domcontentloaded' });
  await page.locator('.product-card').first().waitFor({ timeout: 15000 });

  const suppliers = [
    { name: 'HCH', expectedTotal: 4 },
    { name: 'Kifix', expectedTotal: 98 },
    { name: 'Merkbak', expectedTotal: 49 },
    { name: 'Padrão DIN', expectedTotal: 7 },
    { name: 'Seeger-Orbis', expectedTotal: 5 },
    { name: 'Vibra-Stop', expectedTotal: 65 }
  ];

  for (const s of suppliers) {
    const btn = page.locator('.supplier-filter-title ~ button').filter({ hasText: s.name }).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(300);
    const count = await page.locator('.product-card').count();
    console.log(`[PASS] Supplier "${s.name}": ${count} cards on page (supplier total: ${s.expectedTotal})`);
  }

  // Restore to Todos
  const allBtn = page.locator('.supplier-filter-title ~ button').filter({ hasText: 'Todos os fornecedores' }).first();
  await allBtn.scrollIntoViewIfNeeded();
  await allBtn.click();
  await page.waitForTimeout(300);
  const totalCards = await page.locator('.product-card').count();
  console.log(`[PASS] All suppliers restored: ${totalCards} cards on page`);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
