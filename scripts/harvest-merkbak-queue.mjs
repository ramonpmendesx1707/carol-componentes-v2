/**
 * Automated harvest for Merkbak WooCommerce catalog.
 * Follows the guidelines in 01 ORIENTAÇÕES PARA NOVAS IA's.md:
 * - High resolution original images downloaded to public/images/products/merkbak/<slug>/
 * - Zero prices, zero delivery times, zero commercial promises
 * - Technical attributes from #tab-informacoes and variations
 * - Raw snapshots, manifests, and product JSONs saved
 * - Queue and status.json updated per category and product
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
  const productUrls = new Set();
  let currentUrl = categoryUrl;
  let pageNum = 1;

  while (currentUrl) {
    console.log(`  -> Lendo página ${pageNum}: ${currentUrl}`);
    const $ = await fetchHtml(currentUrl);

    $('a[href*="/produto/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const u = new URL(href, currentUrl);
          // Only actual product URLs
          if (u.pathname.startsWith('/produto/') && !u.pathname.includes('/categoria-produto/')) {
            productUrls.add(u.origin + u.pathname);
          }
        } catch {}
      }
    });

    // Check pagination next
    const nextLink = $('a.next.page-numbers, .woocommerce-pagination a.next').attr('href');
    if (nextLink && nextLink !== currentUrl) {
      currentUrl = new URL(nextLink, currentUrl).href;
      pageNum++;
    } else {
      break;
    }
  }

  return [...productUrls];
}

async function harvestProduct(prodUrl, categoryName, categorySlug, ids) {
  const $ = await fetchHtml(prodUrl);
  const rawTitle = clean($('h1.product_title').first().text());
  if (!rawTitle) throw new Error(`Produto sem título: ${prodUrl}`);
  const name = rawTitle.replace(/\s*\/Merkbak.*$/i, '').replace(/\s*–\s*.*Merkbak.*$/i, '').trim();

  const slug = `merkbak-${slugify(name)}`;
  const folder = `images/products/merkbak/${slug.replace(/^merkbak-/, '')}`;

  // Extract attributes from #tab-informacoes
  const attributes = [];
  let summary = '';
  let description = '';

  $('#tab-informacoes tr').each((_, row) => {
    const cells = $(row).find('td, th').map((_, e) => clean($(e).text())).get();
    if (cells.length >= 2) {
      const attrName = clean(cells[0]);
      const attrVal = clean(cells[1]);
      if (!/^PESO$/i.test(attrName) && attrVal) {
        attributes.push({ name: attrName, value: attrVal });
      }
    }
  });

  const appAttr = attributes.find(a => /APLICAÇÃO/i.test(a.name));
  const matAttr = attributes.find(a => /MATERIAL/i.test(a.name));
  const infoAttr = attributes.find(a => /INFORMAÇÕES ADICIONAIS/i.test(a.name));

  summary = clean(appAttr?.value || infoAttr?.value || matAttr?.value || name);
  description = `<p>${escapeHtml(summary)}</p>`;
  if (matAttr) description += `<p><strong>Material:</strong> ${escapeHtml(matAttr.value)}</p>`;
  if (infoAttr && infoAttr !== appAttr) description += `<p><strong>Informações adicionais:</strong> ${escapeHtml(infoAttr.value)}</p>`;

  // Variations from <select> options or data-product_variations
  let variationOptions = $('select[name*="attribute"] option').map((_, e) => clean($(e).attr('value') || $(e).text())).get().filter(v => v && !v.includes('Escolha uma opção'));

  // If no variation select, check if simple product
  const variations = [];
  if (variationOptions.length > 0) {
    for (const opt of variationOptions) {
      variations.push({
        id: ids.nextVariantId++,
        sku: opt,
        label: opt,
        attributes: [{ name: 'Medida / Referência', value: opt }],
        weight: '',
        dimensions: '',
        image: null
      });
    }
  } else {
    // Single variant
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

  // Gallery images (high resolution)
  const galleryLinks = [];
  $('.woocommerce-product-gallery__image a, .woocommerce-product-gallery img').each((_, el) => {
    const src = $(el).attr('href') || $(el).attr('data-large_image') || $(el).attr('src');
    if (src && !src.includes('150x150') && !src.includes('300x300')) {
      const fullUrl = new URL(src, prodUrl).href;
      if (!galleryLinks.includes(fullUrl)) galleryLinks.push(fullUrl);
    }
  });

  const downloadedAssets = [];
  const productImages = [];

  for (let i = 0; i < galleryLinks.length; i++) {
    const imgUrl = galleryLinks[i];
    const ext = extname(new URL(imgUrl).pathname).toLowerCase() || '.png';
    const relPath = `${folder}/${i + 1}${ext}`;
    try {
      const asset = await saveAsset(imgUrl, relPath);
      downloadedAssets.push(asset);
      productImages.push(asset.path);
    } catch (e) {
      console.warn(`    [!] Falha ao baixar imagem ${imgUrl}: ${e.message}`);
    }
  }

  const primaryImage = productImages[0] || '/images/photo-pending.svg';

  // Categories
  const categories = [
    { id: 202, name: categoryName, slug: categorySlug }
  ];

  const product = {
    id: ids.nextProductId++,
    slug,
    name,
    sku: name.split(/\s*[–—-]\s*/)[0].trim() || name,
    brand: 'Merkbak',
    supplier: 'Merkbak',
    sourceUrl: prodUrl,
    type: 'product',
    summary,
    description,
    categories,
    image: primaryImage,
    images: productImages,
    attributes,
    weight: '',
    dimensions: '',
    variations,
    documents: [],
    videos: [],
    technicalSections: [
      { title: 'Informações do fabricante', items: attributes },
      ...(variations.length > 1 ? [{ title: 'Medidas disponíveis', items: variations.map(v => ({ name: 'Medida', value: v.label })) }] : [])
    ],
    homepage: false
  };

  const productFile = `data/harvest/products/${slug}.json`;
  const manifestFile = `data/harvest/manifests/${slug}.json`;
  const rawFile = `data/harvest/raw/merkbak/${slug}.json`;

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
      attributesCount: attributes.length
    }
  });

  return { slug, product, productFile, manifestFile, rawFile, variationsCount: variations.length, photosCount: productImages.length };
}

async function main() {
  const queue = await readJson('data/harvest/queue.json');
  const ledger = await readJson('data/harvest/status.json');
  const catalog = await readJson('data/catalog.json');

  // Compute next IDs
  const existingProducts = [...catalog.products];
  const harvestedFiles = await readFile(at('data/harvest/status.json'), 'utf8');
  let nextProductId = Math.max(200004, ...existingProducts.map(p => p.id)) + 1;
  let nextVariantId = Math.max(240024, ...existingProducts.flatMap(p => p.variations.map(v => v.id))) + 1;

  const ids = { nextProductId, nextVariantId };

  const pendingCategories = Object.entries(queue.items).filter(
    ([_, item]) => item.supplier === 'merkbak' && ['pending', 'in_progress'].includes(item.status)
  );

  console.log(`Iniciando colheita Merkbak: ${pendingCategories.length} categorias pendentes.`);

  const harvestedUrls = new Set(
    Object.values(ledger.products || {}).map(p => p.sourceUrl).filter(Boolean)
  );
  for (const p of catalog.products) {
    if (p.sourceUrl) harvestedUrls.add(p.sourceUrl);
  }

  for (const [id, item] of pendingCategories) {
    console.log(`\n======================================================`);
    console.log(`Processando Categoria: ${item.name} (${item.url})`);
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
        console.log(`     ✓ Salvo: ${result.slug} (${result.variationsCount} vars, ${result.photosCount} fotos)`);
      }

      item.status = 'complete';
      item.updatedAt = now();
      item.note = `${item.processedProductUrls.length} produtos coletados integralmente com fotos e fichas técnicas.`;
      await writeJson('data/harvest/queue.json', queue);
      console.log(`Categoria ${item.name} FINALIZADA com sucesso!`);
    } catch (err) {
      console.error(`Erro na categoria ${item.name}:`, err);
      item.status = 'blocked';
      item.note = String(err);
      item.updatedAt = now();
      await writeJson('data/harvest/queue.json', queue);
    }
  }

  console.log('\n======================================================');
  console.log('Varredura Merkbak concluída!');
}

main().catch(console.error);
