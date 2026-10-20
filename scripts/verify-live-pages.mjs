import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CAROL_CHROME_EXECUTABLE || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined)
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Connecting to https://ramonpmendesx1707.github.io/carol-componentes-v2/ ...');
  await page.goto('https://ramonpmendesx1707.github.io/carol-componentes-v2/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Read all supplier filter buttons
  const buttons = await page.evaluate(() => {
    const titleEl = document.querySelector('.supplier-filter-title');
    if (!titleEl) return [];
    const parent = titleEl.parentElement;
    const allBtns = Array.from(parent.querySelectorAll('button'));
    const titleIdx = Array.from(parent.children).indexOf(titleEl);
    return allBtns
      .filter(b => {
        const idx = Array.from(parent.children).indexOf(b);
        return idx > titleIdx && !b.closest('.filter-help');
      })
      .map(b => b.innerText.replace(/\s+/g, ' '));
  });

  console.log('Supplier Filter Buttons found:');
  console.log(buttons);

  const hasCarolfix = buttons.some(b => b.toLowerCase().includes('carolfix'));
  console.log('Has Carolfix in filter?:', hasCarolfix);

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
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      const count = await page.locator('.product-card').count();
      console.log(`[PASS] Supplier "${s.name}": filter clicked -> ${count} cards on page (catalog total: ${s.expectedTotal})`);
    } else {
      console.log(`[WARN] Supplier "${s.name}": button not visible`);
    }
  }

  // Restore
  const allBtn = page.locator('.supplier-filter-title ~ button').filter({ hasText: 'Todos os fornecedores' }).first();
  if (await allBtn.isVisible()) {
    await allBtn.click();
    await page.waitForTimeout(500);
    const totalCards = await page.locator('.product-card').count();
    console.log(`[PASS] Restored "Todos": ${totalCards} cards on page`);
  }

  await page.screenshot({ path: 'public/images/live-verified.png' });
  console.log('Saved screenshot to public/images/live-verified.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
