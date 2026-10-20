import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

async function main() {
  const server = spawn(process.execPath, ['scripts/preview-pages.mjs'], { stdio: 'pipe' });
  await new Promise(resolve => setTimeout(resolve, 1500));

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CAROL_CHROME_EXECUTABLE || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined)
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://127.0.0.1:4173/carol-componentes-v2/', { waitUntil: 'networkidle' });
  await page.locator('.product-card').first().waitFor();

  // 1. Verify layout order: Fornecedor must be before Famílias
  const titles = await page.$$eval('.filter-title strong', els => els.map(e => e.innerText.trim()));
  console.log('Filter titles order in sidebar:', titles);
  if (titles[0] !== 'Fornecedor' || titles[1] !== 'Famílias') {
    throw new Error(`Expected ['Fornecedor', 'Famílias'], got: ${JSON.stringify(titles)}`);
  }
  console.log('[PASS] Filter order: Fornecedor is at the top, Famílias is below!');

  // 2. Check suppliers list
  const supplierBtns = await page.$$eval('.supplier-filter-title ~ button', btns => 
    btns.filter(b => !b.closest('.families-filter-title') && b.compareDocumentPosition(document.querySelector('.families-filter-title')) & Node.DOCUMENT_POSITION_FOLLOWING)
        .map(b => b.innerText.replace(/\s+/g, ' '))
  );
  console.log('Supplier buttons:', supplierBtns);

  // 3. Test clicking Merkbak
  const mbBtn = page.locator('.supplier-filter-title ~ button').filter({ hasText: 'Merkbak' }).first();
  await mbBtn.click();
  await page.waitForTimeout(300);
  const mbFamilies = await page.$$eval('.families-filter-title ~ button', btns => 
    btns.filter(b => !b.closest('.filter-help'))
        .map(b => b.innerText.replace(/\s+/g, ' '))
  );
  console.log('\nMerkbak Families (dynamic):', mbFamilies);

  // 4. Test clicking Kifix
  const kfBtn = page.locator('.supplier-filter-title ~ button').filter({ hasText: 'Kifix' }).first();
  await kfBtn.click();
  await page.waitForTimeout(300);
  const kfFamilies = await page.$$eval('.families-filter-title ~ button', btns => 
    btns.filter(b => !b.closest('.filter-help'))
        .map(b => b.innerText.replace(/\s+/g, ' '))
  );
  console.log('\nKifix Families (dynamic):', kfFamilies);

  // 5. Test clicking Vibra-Stop
  const vsBtn = page.locator('.supplier-filter-title ~ button').filter({ hasText: 'Vibra-Stop' }).first();
  await vsBtn.click();
  await page.waitForTimeout(300);
  const vsFamilies = await page.$$eval('.families-filter-title ~ button', btns => 
    btns.filter(b => !b.closest('.filter-help'))
        .map(b => b.innerText.replace(/\s+/g, ' '))
  );
  console.log('\nVibra-Stop Families (dynamic):', vsFamilies);

  // 6. Test restoring Todos
  const allBtn = page.locator('.supplier-filter-title ~ button').filter({ hasText: 'Todos os fornecedores' }).first();
  await allBtn.click();
  await page.waitForTimeout(300);

  // Take screenshot
  await page.screenshot({ path: 'public/images/layout-verified.png' });
  console.log('\nScreenshot saved to public/images/layout-verified.png');

  await browser.close();
  server.kill();
  console.log('All tests passed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
