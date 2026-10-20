import { readFileSync, writeFileSync } from 'node:fs';

const catalogPath = 'data/catalog.json';
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

// 1. Merkbak Category Mapping
function getMerkbakFamily(p) {
  const name = p.name.toUpperCase();
  const slug = p.slug.toLowerCase();
  
  // Note: Check volantes before cabos because some volantes have 'cabo giratório'
  if (slug.includes('volante') || name.includes('VOLANTE') || name.startsWith('V2R') || name.startsWith('V3R') || name.startsWith('VCB') || name.startsWith('VF')) return 'Volantes';
  if (slug.includes('alavanca') || name.startsWith('ATF') || name.startsWith('ATM')) return 'Alavancas';
  if (slug.includes('botao') || name.startsWith('BPF') || name.startsWith('BTM')) return 'Botões';
  if (slug.includes('bucha') || name.startsWith('BR')) return 'Buchas para rolamento';
  if (slug.includes('chave') || name.startsWith('CHF')) return 'Chaves de Fecho';
  if (slug.includes('dobradica') || name.startsWith('DP')) return 'Dobradiças';
  if (slug.includes('engrenagem') || name.startsWith('EN')) return 'Engrenagens';
  if (slug.includes('esfera') || name.startsWith('EP')) return 'Esferas de Baquelite';
  if (slug.includes('knob') || name.startsWith('KF') || name.startsWith('KM') || name.startsWith('KR') || name.startsWith('KTF') || name.startsWith('KTM')) return 'Knobs';
  if (slug.includes('macaneta') || name.startsWith('MBF') || name.startsWith('MBM')) return 'Maçanetas';
  if (slug.includes('manipulo') || name.startsWith('M3PF') || name.startsWith('MSF') || name.startsWith('MSM') || name.startsWith('MTF') || name.startsWith('MTM')) return 'Manípulos';
  if (slug.includes('manivela') || name.startsWith('MCG')) return 'Manivelas';
  if (slug.includes('nivelador') || name.startsWith('PNA') || name.startsWith('PNM') || name.startsWith('PNZ')) return 'Pés Niveladores';
  if (slug.includes('puxador') || name.startsWith('PBT') || name.startsWith('PRF')) return 'Puxadores';
  if (slug.includes('visor') || name.startsWith('VOS') || name.startsWith('VOT')) return 'Visores de Óleo';
  if (slug.includes('cabo') || name.startsWith('CAF') || name.startsWith('CAN') || name.startsWith('CAP') || name.startsWith('CB') || name.startsWith('CE') || name.startsWith('CEP') || name.startsWith('CES') || name.startsWith('CGA') || name.startsWith('CGC') || name.startsWith('CO') || name.startsWith('CPA') || name.startsWith('CR') || name.startsWith('CRP') || name.startsWith('CST')) return 'Cabos';
  
  return 'Componentes Plásticos';
}

// 2. Kifix Category Mapping
function getKifixFamily(p) {
  const name = p.name.toUpperCase();
  const slug = p.slug.toLowerCase();
  
  if (slug.includes('morsa')) return 'Morsas de aperto rápido';
  if (slug.includes('ponteira')) return 'Ponteiras e mordentes';
  if (slug.includes('alicate') || name.includes('ALICATE') || name.startsWith('KFA-') || name === 'KF-325') return 'Alicates de fixação';
  if (slug.includes('indexador') || slug.includes('posicionador') || name.startsWith('KFPI') || name.startsWith('KFPS')) return 'Posicionadores e indexadores';
  if (slug.includes('mesa-de-solda') || slug.includes('base-') || slug.includes('adaptador') || name.startsWith('KFRL') || slug.includes('fuso-rapido')) return 'Mesas de solda e fusos';
  if (slug.includes('manipulo') || slug.includes('puxador') || slug.includes('dobradica') || slug.includes('alca') || slug.includes('trinco') || name.startsWith('KFM-') || name === 'KF-AL' || name.startsWith('KFD-') || name === 'PUXADOR' || name.startsWith('KFT-10/14')) return 'Manípulos, puxadores e fechos';
  if (slug.includes('sargento') || slug.includes('tipo-c') || name.startsWith('KFC') || name.startsWith('KFS-')) return 'Grampos C e sargentos';
  if (slug.includes('pneumatico') || name.includes('_P') || slug.includes('-p-') || name.startsWith('KFP-') || slug.includes('718-db-rtt')) return 'Grampos pneumáticos';
  if (slug.includes('tensor') || name.includes('CT') || name.startsWith('KF-033') || name.startsWith('KF-063') || name.startsWith('KF-133') || name === 'KF-300' || name.startsWith('KF-310') || name.startsWith('KF-330') || name.startsWith('KF-375') || name.startsWith('KF-423') || name === 'KF-430' || name === 'KF-473' || name === 'KF-505 TR' || name.startsWith('KFC1') || name.startsWith('KFT-') || name.startsWith('KFTB-') || slug.includes('233-d-gr') || slug.includes('compressor') || slug.includes('fixacao-dupla') || name.includes('035 34') || name.includes('686 D')) return 'Grampos tensores';
  if (slug.includes('torpedo') || name.startsWith('KF-005') || name.startsWith('KF-007') || name.startsWith('KF-052 AL') || name.startsWith('KF-057') || name.startsWith('KF-061') || name.startsWith('KF-305') || name.startsWith('KFKT-') || slug.includes('bases-l')) return 'Grampos torpedo';
  if (slug.includes('horizontal') || slug.includes('reforcados') || name.startsWith('KF-102') || name.startsWith('KF-105') || name.startsWith('KF-106') || name.startsWith('KF-312') || name.startsWith('KF-511') || name.startsWith('KF-515') || name.startsWith('KF-531') || name === 'KF-947') return 'Grampos horizontais';
  if (slug.includes('vertical') || name.startsWith('KF-01/') || name.startsWith('KF-010') || name.startsWith('KF-017') || name.startsWith('KF-03/05 JD') || name.startsWith('KF-05 JD') || name.startsWith('KF-066') || name.startsWith('KF-111 TBL') || name.startsWith('KF-211') || name === 'KF-631' || name === 'KF-718' || name.startsWith('KF-725') || name.startsWith('KFU-') || name === 'KFTB') return 'Grampos verticais';
  
  return 'Grampos de fixação';
}

// 3. Vibra-Stop Category Mapping
function getVibraStopFamily(p) {
  const name = p.name.toUpperCase();
  const slug = p.slug.toLowerCase();
  
  if (slug.includes('base-')) return 'Bases antivibratórias';
  if (slug.includes('pendural') || slug.includes('hvac')) return 'Pendurais e amortecedores HVAC';
  if (slug.includes('batente') || slug.includes('bat')) return 'Batentes industriais';
  if (slug.includes('coxim')) return 'Coxins amortecedores';
  if (slug.includes('calco') || slug.includes('ventosa') || slug.includes('arruela') || slug.includes('tubulacao')) return 'Calços, ventosas e arruelas';
  if (slug.includes('mola') || name.includes('MOLA')) return 'Amortecedores de mola';
  return 'Amortecedores de borracha';
}

// 4. Normas e Fabricantes Reais
function getNormasFamily(p) {
  const s = p.supplier || p.brand;
  const slug = p.slug.toLowerCase();
  if (s === 'HCH') {
    if (slug.includes('mancais')) return 'Mancais industriais';
    return 'Rolamentos de esferas';
  }
  if (s === 'Seeger-Orbis') {
    if (slug.includes('molas-prato')) return 'Molas prato';
    return 'Anéis de retenção';
  }
  if (s === 'Padrão DIN') {
    if (slug.includes('pinos') || slug.includes('puncoes')) return 'Pinos e punções DIN';
    if (slug.includes('porcas') || slug.includes('arruelas')) return 'Porcas e arruelas DIN';
    if (slug.includes('olhal')) return 'Olhais de suspensão DIN';
  }
  return 'Normas industriais';
}

let nextCatId = 500;
const catMap = new Map();
function getCatObj(name) {
  if (!catMap.has(name)) {
    const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    catMap.set(name, { id: nextCatId++, name, slug });
  }
  return catMap.get(name);
}

// Process all products
for (const p of catalog.products) {
  const s = p.supplier || p.brand;
  let family = '';
  if (s === 'Merkbak') family = getMerkbakFamily(p);
  else if (s === 'Kifix') family = getKifixFamily(p);
  else if (s === 'Vibra-Stop') family = getVibraStopFamily(p);
  else family = getNormasFamily(p);
  
  const catObj = getCatObj(family);
  p.categories = [catObj];
  p.section = family;
}

// Rebuild catalog.categories
catalog.categories = Array.from(catMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log('Successfully updated catalog with standardized families!');
console.log('Total categories:', catalog.categories.length);
console.log('Categories summary:');
for (const cat of catalog.categories) {
  const count = catalog.products.filter(p => p.categories.some(c => c.name === cat.name)).length;
  console.log(`- ${cat.name}: ${count} produtos`);
}
