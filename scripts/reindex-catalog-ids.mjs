/**
 * Re-index all harvested products and variants to guarantee clean, collision-free IDs across all suppliers.
 * - Vibra-Stop: 200001 - 200099 (variants 210001+)
 * - Merkbak:    201001 - 201099 (variants 220001+)
 * - Kifix:      202001 - 202199 (variants 230001+)
 * - Carolfix:   203001 - 203099 (variants 240001+)
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const at = rel => join(root, rel);
const readJson = async rel => JSON.parse(await readFile(at(rel), 'utf8'));
const writeJson = async (rel, val) => writeFile(at(rel), JSON.stringify(val, null, 2) + '\n');

async function main() {
  const dir = at('data/harvest/products');
  const files = (await readdir(dir)).filter(f => f.endsWith('.json')).sort();

  let vibraProdId = 200001;
  let vibraVarId = 210001;

  let merkbakProdId = 201001;
  let merkbakVarId = 220001;

  let kifixProdId = 202001;
  let kifixVarId = 230001;

  let carolfixProdId = 203001;
  let carolfixVarId = 240001;

  let updated = 0;

  for (const f of files) {
    const filePath = `data/harvest/products/${f}`;
    const p = await readJson(filePath);
    const supp = (p.supplier || '').toLowerCase();

    if (supp.includes('vibra')) {
      p.id = vibraProdId++;
      for (const v of p.variations || []) v.id = vibraVarId++;
    } else if (supp.includes('merkbak')) {
      p.id = merkbakProdId++;
      for (const v of p.variations || []) v.id = merkbakVarId++;
    } else if (supp.includes('kifix')) {
      p.id = kifixProdId++;
      for (const v of p.variations || []) v.id = kifixVarId++;
    } else if (supp.includes('carolfix')) {
      p.id = carolfixProdId++;
      for (const v of p.variations || []) v.id = carolfixVarId++;
    }

    await writeJson(filePath, p);

    // Also update manifest if exists
    const manifestPath = `data/harvest/manifests/${f}`;
    try {
      const m = await readJson(manifestPath);
      m.product = p;
      await writeJson(manifestPath, m);
    } catch {}

    updated++;
  }

  console.log(`Re-indexação concluída: ${updated} arquivos com IDs únicos!`);
  console.log(`- Vibra-Stop: ${vibraProdId - 200001} produtos, ${vibraVarId - 210001} variantes`);
  console.log(`- Merkbak:    ${merkbakProdId - 201001} produtos, ${merkbakVarId - 220001} variantes`);
  console.log(`- Kifix:      ${kifixProdId - 202001} produtos, ${kifixVarId - 230001} variantes`);
  console.log(`- Carolfix:   ${carolfixProdId - 203001} produtos, ${carolfixVarId - 240001} variantes`);
}

main().catch(console.error);
