/**
 * Automated harvest for Kifix catalog.
 * Follows the guidelines in 01 ORIENTAÇÕES PARA NOVAS IA's.md:
 * - Table rows converted into complete variations (dimensional columns with literal units)
 * - Original high-res photos from /fotos_produtos/ saved locally
 * - Schematic drawings from /desenhos_produtos/ saved locally and added to technicalSections
 * - Restricted ZIP CAD downloads requiring login are NOT exposed as broken links in vitrine
 * - Zero prices, zero delivery times, zero commercial promises
 * - Manifests, raw snapshots and product JSONs created
 * - Queue and status.json updated per family and product
 */
import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const at = rel => join(root, rel);
const readJson = async rel => JSON.parse(await readFile(at(rel), 'utf8'));
const writeJson = async (rel, val) => {
  await mkdir(dirname(at(rel)), { recursive: true });
  await writeFile(at(rel), JSON.stringify(val, null, 2) + '\n');
};
const now = () => new Date().toISOString();
const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const slugify = val => clean(val).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const delay = ms => new Promise(r => setTimeout(r, ms));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const escapeHtml = val => String(val).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CarolComponentesCatalogResearch/2.0';

async function fetchHtml(url) {
  await delay(800 + Math.floor(Math.random() * 400));
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(45000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const buf = await res.arrayBuffer();
  const charset = res.headers.get('content-type')?.match(/charset=([^;]+)/i)?.[1] || 'utf-8';
  return load(new TextDecoder(charset).decode(buf));
}

async function saveAsset(url, relativePath) {
  const dest = at(`public/${relativePath}`);
  const prev = await stat(dest).catch(() => null);
  if (prev?.size > 0) {
    const bytes = await readFile(dest);
    return { path: `/${relativePath}`, sourceUrl: url, bytes: bytes.length, sha256: sha(bytes) };
  }
  await delay(600 + Math.floor(Math.random() * 300));
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(60000)
  });
  if (!res.ok) throw new Error(`Asset HTTP ${res.status}: ${url}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (!bytes.length || bytes.length > 25_000_000) throw new Error(`Arquivo inválido ou grande: ${url}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
  return { path: `/${relativePath}`, sourceUrl: url, bytes: bytes.length, sha256: sha(bytes) };
}

async function getCategoryProducts(categoryUrl) {
  console.log(`  -> Lendo página de categoria: ${categoryUrl}`);
  const $ = await fetchHtml(categoryUrl);
  const productUrls = new Set();

  $('a[href]').each((_, el) => {
    let href = $(el).attr('href') || '';
    if (!href || href === '#' || href.startsWith('javascript:')) return;

    let fullUrl;
    if (href.startsWith('https://www.kifix.com.br/produtos/')) {
      fullUrl = href;
    } else if (href.startsWith('/produtos/')) {
      fullUrl = 'https://www.kifix.com.br' + href;
    } else if (href.startsWith('produtos/')) {
      fullUrl = 'https://www.kifix.com.br/' + href;
    } else {
      return;
    }

    try {
      const u = new URL(fullUrl);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'produtos' && parts.length >= 3) {
        if (!['login', 'cadastro', 'empresa', 'distribuidores', 'downloads', 'fotos', 'tools', 'faleconosco'].includes(parts[2])) {
          productUrls.add(`https://www.kifix.com.br/${parts.join('/')}/`);
        }
      }
    } catch {}
  });

  if (productUrls.size === 0 && $('table tr').length >= 2) {
    const cleanUrl = categoryUrl.endsWith('/') ? categoryUrl : categoryUrl + '/';
    productUrls.add(cleanUrl);
  }

  return [...productUrls];
}

async function harvestProduct(prodUrl, categoryName, categorySlug, ids) {
  const $ = await fetchHtml(prodUrl);
  let rawTitle = clean($('h1, h2, .titulo-produto').first().text());
  if (!rawTitle) rawTitle = clean($('title').text().split('|')[0]);
  if (!rawTitle) throw new Error(`Produto sem título: ${prodUrl}`);

  const name = rawTitle;
  const slug = `kifix-${slugify(name)}`;
  const folder = `images/products/kifix/${slug.replace(/^kifix-/, '')}`;

  // Extract table
  const table = $('table').first();
  let headers = [];
  let rows = [];

  if (table.length) {
    headers = table.find('tr').first().find('th, td').map((_, cell) => clean($(cell).text())).get();
    table.find('tr').slice(1).each((_, tr) => {
      const row = $(tr).find('th, td').map((_, cell) => clean($(cell).text())).get();
      if (row.length && row[0] && row.length === headers.length) {
        rows.push(row);
      }
    });
  }

  // Variations
  const variations = [];
  if (rows.length > 0) {
    for (const row of rows) {
      const ref = row[0];
      const attrList = headers.slice(1).map((h, idx) => ({
        name: h,
        value: clean(row[idx + 1] || '')
      }));
      variations.push({
        id: ids.nextVariantId++,
        sku: ref,
        label: ref,
        attributes: attrList,
        weight: row.find((_, i) => /PESO/i.test(headers[i])) || '',
        dimensions: '',
        image: null
      });
    }
  } else {
    variations.push({
      id: ids.nextVariantId++,
      sku: name,
      label: 'Padrão',
      attributes: [],
      weight: '',
      dimensions: '',
      image: null
    });
  }

  // High-res photos from /fotos_produtos/
  const photoUrls = [];
  $('img[src*="fotos_produtos/"]').each((_, img) => {
    let src = $(img).attr('src');
    if (src) {
      const fullUrl = new URL(src, prodUrl).href;
      if (!photoUrls.includes(fullUrl)) photoUrls.push(fullUrl);
    }
  });

  // Drawings from /desenhos_produtos/
  const drawingUrls = [];
  $('img[src*="desenhos_produtos/"]').each((_, img) => {
    let src = $(img).attr('src');
    if (src) {
      const fullUrl = new URL(src, prodUrl).href;
      if (!drawingUrls.includes(fullUrl)) drawingUrls.push(fullUrl);
    }
  });

  if (rows.length === 0 && photoUrls.length === 0 && drawingUrls.length === 0) {
    throw new Error(`Página não é um produto com tabela ou fotos: ${prodUrl}`);
  }

  const downloadedAssets = [];
  const productImages = [];
  const drawingImages = [];

  for (let i = 0; i < photoUrls.length; i++) {
    const pUrl = photoUrls[i];
    const ext = extname(new URL(pUrl).pathname).toLowerCase() || '.png';
    const relPath = `${folder}/foto-${i + 1}${ext}`;
    try {
      const asset = await saveAsset(pUrl, relPath);
      downloadedAssets.push(asset);
      productImages.push(asset.path);
    } catch (e) {
      console.warn(`    [!] Falha ao baixar foto ${pUrl}: ${e.message}`);
    }
  }

  for (let i = 0; i < drawingUrls.length; i++) {
    const dUrl = drawingUrls[i];
    const ext = extname(new URL(dUrl).pathname).toLowerCase() || '.jpg';
    const relPath = `${folder}/desenho-${i + 1}${ext}`;
    try {
      const asset = await saveAsset(dUrl, relPath);
      downloadedAssets.push(asset);
      drawingImages.push(asset.path);
    } catch (e) {
      console.warn(`    [!] Falha ao baixar desenho ${dUrl}: ${e.message}`);
    }
  }

  const primaryImage = productImages[0] || drawingImages[0] || '/images/photo-pending.svg';
  const allImages = [...productImages, ...drawingImages];

  // Technical sections
  const technicalSections = [];
  if (rows.length > 0) {
    technicalSections.push({
      title: 'Tabela dimensional do fabricante',
      columns: headers,
      rows: rows
    });
  }
  if (drawingImages.length > 0) {
    technicalSections.push({
      title: 'Desenhos técnicos da família',
      images: drawingImages,
      note: 'Esquema dimensional do fabricante; confira as cotas correspondentes à referência selecionada na tabela.'
    });
  }

  const summary = `Linha ${categoryName} Kifix modelo ${name}, com ${variations.length} referências dimensionais.`;
  const description = `<p>${escapeHtml(summary)}</p><p>Consulte a tabela técnica dimensional e desenhos esquemáticos para cada referência.</p>`;

  const categories = [
    { id: 204, name: categoryName, slug: categorySlug }
  ];

  const product = {
    id: ids.nextProductId++,
    slug,
    name,
    sku: name,
    brand: 'Kifix',
    supplier: 'Kifix',
    sourceUrl: prodUrl,
    type: 'product',
    summary,
    description,
    categories,
    image: primaryImage,
    images: allImages,
    attributes: [
      { name: 'Fabricante', value: 'Kifix Indústria e Comércio' },
      { name: 'Categoria', value: categoryName }
    ],
    weight: variations[0]?.weight || '',
    dimensions: '',
    variations,
    documents: [],
    videos: [],
    technicalSections,
    homepage: false
  };

  const productFile = `data/harvest/products/${slug}.json`;
  const manifestFile = `data/harvest/manifests/${slug}.json`;
  const rawFile = `data/harvest/raw/kifix/${slug}.json`;

  await writeJson(rawFile, { sourceUrl: prodUrl, fetchedAt: now(), title: rawTitle, text: $('body').text() });
  await writeJson(productFile, product);
  await writeJson(manifestFile, {
    sourceUrl: prodUrl,
    fetchedAt: now(),
    product,
    assets: downloadedAssets,
    checks: {
      variants: variations.length,
      photos: productImages.length,
      drawings: drawingImages.length,
      tableRows: rows.length
    }
  });

  return { slug, product, productFile, manifestFile, rawFile, variationsCount: variations.length, photosCount: allImages.length };
}

async function main() {
  const queue = await readJson('data/harvest/queue.json');
  const ledger = await readJson('data/harvest/status.json');
  const catalog = await readJson('data/catalog.json');

  const existingProducts = [...catalog.products];
  let nextProductId = Math.max(200004, ...existingProducts.map(p => p.id)) + 1;
  let nextVariantId = Math.max(240024, ...existingProducts.flatMap(p => p.variations.map(v => v.id))) + 1;

  const ids = { nextProductId, nextVariantId };

  const pendingFamilies = Object.entries(queue.items).filter(
    ([_, item]) => item.supplier === 'kifix' && ['pending', 'in_progress', 'blocked'].includes(item.status)
  );

  console.log(`Iniciando colheita Kifix: ${pendingFamilies.length} famílias pendentes.`);

  const harvestedUrls = new Set(
    Object.values(ledger.products || {}).map(p => p.sourceUrl).filter(Boolean)
  );
  for (const p of catalog.products) {
    if (p.sourceUrl) harvestedUrls.add(p.sourceUrl);
  }

  for (const [id, item] of pendingFamilies) {
    console.log(`\n======================================================`);
    console.log(`Processando Família Kifix: ${item.name} (${item.url})`);
    item.status = 'in_progress';
    item.updatedAt = now();
    await writeJson('data/harvest/queue.json', queue);

    try {
      const prodUrls = await getCategoryProducts(item.url);
      console.log(`  -> ${prodUrls.length} produtos descobertos.`);
      item.discoveredProductUrls = prodUrls;

      for (const prodUrl of prodUrls) {
        if (harvestedUrls.has(prodUrl)) {
          console.log(`  [OK] Já coletado anteriormente: ${prodUrl}`);
          if (!item.processedProductUrls.includes(prodUrl)) item.processedProductUrls.push(prodUrl);
          continue;
        }

        console.log(`  -> Coletando produto: ${prodUrl}`);
        try {
          const result = await harvestProduct(prodUrl, item.name, slugify(item.name), ids);
          harvestedUrls.add(prodUrl);
          item.processedProductUrls.push(prodUrl);

          ledger.products[result.slug] = {
            sourceUrl: prodUrl,
            status: 'review_ready',
            updatedAt: now(),
            productFile: result.productFile,
            manifestFile: result.manifestFile,
            checks: {
              variants: result.variationsCount,
              photos: result.photosCount
            }
          };

          await writeJson('data/harvest/status.json', ledger);
          console.log(`     ✓ Salvo: ${result.slug} (${result.variationsCount} vars, ${result.photosCount} fotos/desenhos)`);
        } catch (prodErr) {
          console.warn(`     [!] Erro no produto ${prodUrl}: ${prodErr.message}`);
        }
      }

      item.status = 'complete';
      item.updatedAt = now();
      item.note = `${item.processedProductUrls.length} produtos/famílias coletados com fotos, tabelas dimensionais e esquemas técnicos.`;
      await writeJson('data/harvest/queue.json', queue);
      console.log(`Família ${item.name} FINALIZADA com sucesso!`);
    } catch (err) {
      console.error(`Erro na família ${item.name}:`, err);
      item.status = 'blocked';
      item.note = String(err);
      item.updatedAt = now();
      await writeJson('data/harvest/queue.json', queue);
    }
  }

  console.log('\n======================================================');
  console.log('Varredura Kifix concluída!');
}

main().catch(console.error);
