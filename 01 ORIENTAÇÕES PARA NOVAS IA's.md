# 01 — ORIENTAÇÕES PARA NOVAS IA's · Carol Componentes V2

> **Arquivo vivo e coordenador da coleta.** Atualize este documento, `data/harvest/status.json`, os manifestos e o `CHANGELOG.md` a cada lote. Última revisão: 20/10/2026. A V1 (`carol-componentes`) deve permanecer congelada. Trabalhe **somente** no repositório `carol-componentes-v2`.

## Objetivo e decisões irrevogáveis até nova ordem de Ramon

Construir um catálogo técnico completo de **todos os produtos de todas as categorias** da Vibra-Stop, Merkbak e Kifix. Carolfix entra **somente quando a peça não existir em nenhuma dessas fontes prioritárias**. Um mesmo item aparece uma única vez na V2, atribuído ao fornecedor de origem. A interface deve oferecer filtro de **Fornecedor** além da família/categoria. Não importar preço, prazo, frete, estoque, promoções, avaliações de compradores ou promessas comerciais. A Carol Componentes informa suas próprias condições na cotação. Não inventar SKU, dimensão, material, imagem, PDF, vídeo ou aplicação ausentes na fonte; registrar `não informado`/pendência.

Nunca usar a foto de outra família como ilustração do item. O piloto Carolfix mostra por quê: na página 18 do PDF, as fotos superiores pertencem a **outros anéis**; a série 525 para eixo liso tem tabela, mas não uma foto específica. A imagem pública do piloto é um recorte de alta resolução da **tabela correta**, não uma fotografia de produto.

## Estado exato para continuar

- Catálogo V1: 50 itens/290 variantes preservados em `data/archive/catalog-v1.json`. `node scripts/catalog-restore.mjs --from-v1` apenas restaura quando o catálogo ativo estiver vazio; **não execute** na coleta nova. Ver `data/archive/README.md`.
- Catálogo V2 Concluído: **228 produtos ativos e 2.362 referências técnicas** unificados em `data/catalog.json`. Distribuição por fabricante:
  * **Kifix**: 98 produtos / 629 variantes (grampos manuais, pneumáticos, adaptadores de solda, morsas, indexadores e acessórios).
  * **Vibra-Stop**: 65 produtos / 405 variantes (amortecedores de borracha, molas de aço, bases de inércia, coxins e calços).
  * **Merkbak**: 49 produtos / 308 variantes (volantes, manípulos, alavancas, puxadores, dobradiças, knobs e visores de óleo).
  * **Carolfix**: 16 produtos / 1.020 variantes (produtos técnicos exclusivos do catálogo de 60 páginas: anéis de retenção DIN 471/472/6799/525, rolamentos, mancais UCPA/UCT/UCFL, porcas KM / arruelas MB, pinos DIN 1481/7/1530 e molas prato DIN 2093). Itens de catálogo revendidos foram mantidos no fornecedor original (Merkbak/Kifix), sem duplicação.
- Estado mestre: `data/harvest/status.json` registra todos os 230 produtos com estado `published`. Fila `data/harvest/queue.json` (148 sementes: 71 Vibra-Stop, 18 Merkbak, 29 Kifix, 30 Carolfix) está 100% processada.
- Reconciliação documental: Concluída em `data/harvest/reconciliations/vibra-stop-2026.json`. Os catálogos de 2026 prevaleceram sobre o site (ex: malha galvanizada na Malha de Aço; De na Mola VIP Tração; dimensões de caixa/chapa na Mola Sísmica Plus).
- IDs estruturados e particionados sem colisão:
  * Vibra-Stop: IDs 200001+ / variantes 210001+
  * Merkbak: IDs 201001+ / variantes 220001+
  * Kifix: IDs 202001+ / variantes 230001+
  * Normas e Fabricantes Reais (HCH, Seeger-Orbis, Padrão DIN - originários do catálogo de normas): IDs 203001+ / variantes 240001+ (distribuidora Carolfix 100% eliminada dos fornecedores)
- Ambos os alvos de build (`npm run build:pages` e `npm run build`) e TypeScript (`npx tsc --noEmit`) validados com 0 erros.

## Ambiente Ubuntu 24.04 / Antigravity (Gemini Flash ou qualquer IA)

O projeto requer Node >=22.13 (preferencialmente 24), npm, Git, Chromium do Playwright e Poppler/Python para PDFs. No clone da V2, leia primeiro `AGENTS.md`, `README.md`, `docs/HANDOFF-IA.md`, este arquivo e `data/harvest/status.json`. Comandos:

```bash
node --version
npm run install:ci
npx playwright install chromium
sudo apt-get install -y poppler-utils
python3 -m pip install --user pdfplumber
node scripts/discover-suppliers.mjs
node scripts/harvest-queue.mjs init
node scripts/harvest-queue.mjs next
node scripts/harvest-pilots.mjs --supplier=merkbak
npx tsc --noEmit
npm run build:pages
npm run build
```

Se o servidor já fornece Playwright/Chromium, use `CAROL_CHROME_EXECUTABLE=/caminho/do/chromium` quando necessário. Não coloque cookies, senhas, dados pessoais ou tokens em Git, comando gravado ou relatório. O código deve funcionar em Linux com caminhos de `node:path`/`fileURLToPath`, não apenas em Windows. `npm run install:ci` deve continuar preservando `package-lock.json`; se falhar, investigar antes de usar instalação divergente.

## Fluxo por lote — obrigatório e retomável

1. Atualize o checkout e leia `git status --short`. Nunca sobrescreva trabalho não salvo de outro agente. Use branch curta por lote; uma única IA é dona de uma ficha por vez. Antes de iniciar, anote `sourceUrl`, fornecedor, categoria, `status:in_progress`, horário e executor em `data/harvest/status.json`; faça commit da reivindicação se haverá troca de turno.
2. Comece pelas sementes em `data/harvest/sources.json`; percorra **cada categoria**, todas as páginas de paginação e todos os produtos. Deduplique URLs canônicas. Use sitemaps públicos como conferência, não como prova de completude: compare contagens por categoria, cards versus links visitados, variantes e páginas; registre discrepâncias. Guarde fila/cursor por categoria no ledger. Não marque categoria `complete` sem duas passagens de reconciliação.
3. Leia `robots.txt`, termos e respostas de erro; acesso público apenas, baixo ritmo (padrão 1 requisição/segundo por host, concorrência 1, jitter, backoff para 429/5xx), sem burlar CAPTCHA, login, bloqueio ou controles de download. Se ficar restrito, registre `blocked` com URL e motivo. Não insistir com parâmetros desproporcionais em API. Capturar somente dados do produto.
4. Abra a página de produto em Playwright quando o HTML inicial não trouxer os dados. Aguarde elemento semântico/tabela renderizada; não use só `networkidle` em páginas com anúncios. Percorra **todas as abas** e variantes, e capture tabelas, notas, unidades, materiais, aplicações, instalação, downloads, vídeo e galerias. Não reutilize preço/prazo presentes na página. Faça uma ficha por família quando a fonte usa uma página com tabela de várias referências (Vibra/Kifix/Carolfix), com `variations[]` completas; não crie duplicatas artificiais por tamanho.
5. Para cada foto, use o link original da galeria em resolução máxima (`href` ou maior `srcset`, nunca thumbnail 150/300 px), descarregue para `public/images/products/<fornecedor>/<slug>/`, confirme HTTP 200, tipo real, dimensões e SHA-256; não inclua logo/site, item relacionado ou foto de categoria. Varra também **galerias separadas de desenho técnico** (na Kifix, `/desenhos_produtos/`, além de `/fotos_produtos/`); acrescente o desenho público à galeria e/ou a `technicalSections[].images`, com a atribuição correta. Imagens de aplicação/instalação vão para `technicalSections[].images`. Registre fonte de cada arquivo em `data/harvest/manifests/<chave>.json`. Para PDF/ZIP público, armazene em `public/downloads/products/<fornecedor>/<slug>/` se viável e registre origem/hash. Recurso restrito permanece só no manifesto interno com motivo, **não em `documents` público nem como link direto ao fornecedor**.
6. Vídeo: procure `<video><source>`, link MP4 e players oficiais nas abas. Se download e hospedagem forem tecnicamente/contratualmente viáveis e tamanho aceitável para ambos os destinos, salve em `public/videos/products/<fornecedor>/<slug>/` e `hosted:true`. Caso contrário `hosted:false`, URL oficial e motivo. **Não** embutir player de propaganda, vídeo de item relacionado ou gravação sem autorização. Não converter 140 MB em commit Git comum.
7. Monte `data/harvest/products/<chave>.json` conforme `lib/catalog.ts`: `id` estável/único, `slug` único, `supplier`, `sourceUrl`, `brand`, `sku`, `categories`, `summary`, `description` sem preço/prazo, `attributes`, `variations` com unidades/atributos específicos, `images`, `documents`, `videos`, `technicalSections`. IDs do piloto são 200001–200004 e variantes 210001–240024; futuros IDs devem ser alocados no ledger com busca de colisão, sem reciclar ID de produto diferente. `price` deve ser ausente ou 0; só Carol poderá definir política futura. Nunca copiar HTML ativo/JavaScript da fonte.
8. Faça revisão humana/visual: compare cada tab e linha de tabela com a página, confirme foto correta, unidades, acentos e links locais. Teste largura 320/390/768/1440, busca, filtros de categoria/fornecedor, detalhe, vídeo, PDF, cotação e teclado. Ficha incompleta fica `blocked` ou `needs_review`, não `published`. Anote exceções no manifesto (como 525.160) e não silencie erros.
9. Marque `review_ready` somente depois da revisão. Promova por `node scripts/catalog-publish-harvest.mjs` (ou rotina geral equivalente) com conferência automática de arquivos, preço e deduplicação. Rode `npx tsc --noEmit`, `npm run build:pages` e `npm run build`; verifique V2 GitHub Pages e ChatGPT Site. Atualize `CHANGELOG.md`, commit/push da V2, aguarde deploy e registre URL/commit/data no ledger. **Nenhuma publicação altera a V1.**
10. Ao terminar o turno, deixe no topo do ledger `lastHandoff` com commit, `nextSourceUrl`, categoria, página/cursor, último SKU, contagens por estado e impedimentos. O próximo agente deve começar por `in_progress` ou `blocked` resolvível, não revarrer desde o início. Se outro agente avançou, faça `git pull` e reconcilie por `sourceUrl`/SKU antes de adicionar.

## Catálogos e datasheets novos — segunda passagem obrigatória por fornecedor

Esta regra vale **sempre que Ramon enviar um PDF novo** e também para os dois arquivos Vibra-Stop 2026 já recebidos. O site do fabricante pode estar desatualizado. Termine primeiro a coleta de todas as páginas/modelos do fornecedor; em seguida faça uma **passagem completa de confronto documental antes de considerar aquele fornecedor concluído**. Não use somente o PDF para dispensar produtos ainda não visitados no site.

1. Guarde o PDF original, sem recompactar, em `public/downloads/suppliers/<fornecedor>/<ano>/<nome-estavel>.pdf`; calcule SHA-256, tamanho, páginas, título/edição impressa, data de recebimento e origem (fornecida por Ramon ou URL oficial). Registre em `data/harvest/supplier-documents.json`. Se chegar nova edição, mantenha a anterior em diretório de ano/edição própria: nada de sobrescrever silenciosamente. Confirme se a publicação pública do PDF fornecido é adequada antes de expor documento que seja confidencial; se houver indicação de sigilo, guarde em área privada fora de `public/` e não envie ao GitHub.
2. Extraia texto e tabelas com `pdfplumber`/Poppler; se a página for imagem, aplique OCR e **revise visualmente**. Construa um índice por página, família, referência/SKU e edição. O texto extraído destes PDFs Vibra-Stop traz caracteres de acento corrompidos em alguns trechos: não publique OCR/texto cru sem conferir no PDF renderizado. Preserve unidades, vírgulas decimais, símbolos de rosca, notas de rodapé e códigos literais.
3. Vincule cada linha do PDF à ficha do site por código/referência exata; nome parecido **não prova equivalência**. Compare campo a campo (material, dimensões, carga, rosca, aplicação, instalação, variantes, notas) e grave um relatório versionado por documento em `data/harvest/reconciliations/<fornecedor>-<ano>.json`, com `productSlug`, `reference`, `field`, `siteValue`, `pdfValue`, `chosenValue`, `reason`, `pdfPage`, `reviewStatus`. Registre também códigos só no PDF, só no site, renomeados e retirados. Os ausentes do catálogo **não são excluídos automaticamente**; exigem revisão.
4. **Regra definitiva de Ramon (20/10/2026): o PDF do fornecedor prevalece sempre sobre o site**, inclusive sobre ficha técnica HTML e dados já raspados. A aplicação ocorre **somente depois que a coleta completa daquele fornecedor terminar**; então altere apenas os campos em que o PDF trouxer informação diferente/mais atual. Entre PDFs conflitantes, use a edição/revisão **mais recente e específica da referência** (verifique data/revisão no próprio conteúdo e o histórico documental; não use `LastWriteTime` do download). Para as duas cópias 2026 de molas Vibra-Stop, a revisão oficial de agosto/2026 prevalece nos campos alterados das páginas 26 e 31; guarde a cópia de abril enviada por Ramon para auditoria. Se dois PDFs da mesma data divergirem ou o código não puder ser ligado à referência com segurança, marque `needs_review` e peça decisão; **nunca use o site para desempatar contra um PDF**. Para dados comerciais, a única autoridade futura será a Carol; nunca importar preço, prazo, frete, estoque ou avaliações.
5. Imagens: se o PDF atualizado trouxer nova foto claramente vinculada à referência, compare e atualize a galeria após revisão de qualidade. Se não trouxer foto nova, **mantenha a imagem original em alta resolução coletada do site**. Não substitua foto por miniatura de PDF nem por imagem de outra família. Desenhos técnicos do PDF podem entrar em `technicalSections[].images` separadamente.
6. Após revisão, atualize `data/harvest/products/`, `data/catalog.json`, manifestos e links na aba Documentos; teste cada referência alterada. Só marque `supplierReconciliation:complete` no ledger quando a contagem de fichas/referências do site e das páginas pertinentes do PDF estiver reconciliada, com pendências explicitadas. Publique e valide os dois destinos V2; registre commit, data e contagens no `lastHandoff`.

Para a Vibra-Stop, `catalogo-de-produtos.pdf` cobre as famílias gerais e a Linha Tradicional com Chapa aparece na página 5; as duas revisões de `catalogo-molas` cobrem as linhas de mola. **Execute o confronto total após terminar as 71 sementes de modelo e a reconciliação das categorias reais**, inclusive produtos adicionais descobertos. Para as páginas de mola 26 e 31, comece pela cópia pública de agosto/2026 e valide cada referência visualmente; preserve a cópia enviada pelo usuário como histórico. `data/harvest/supplier-documents.json` continua com `pending_full_supplier_crawl` até esse marco. A adição futura de PDF de outro fornecedor segue exatamente este processo.

Estados permitidos: `pending` → `in_progress` → `review_ready` → `staged` (já em `data/catalog.json`, ainda não confirmado externamente) → `published` (dois destinos conferidos); `blocked` e `needs_review` nunca entram em produção. `published` não significa estoque/entrega. Registre `sourceCheckedAt` para rechecagem periódica, sem sobrescrever alterações comerciais da Carol. O ledger não deve conter fotos em base64, PDFs, senhas ou dados de clientes.

## Receita específica por fonte (aprovada pelos pilotos)

### Vibra-Stop

É uma aplicação dinâmica: o HTML inicial não contém o produto. Use Playwright na URL `/produto/...?...`, aguarde `document.body.innerText.includes('FICHA TÉCNICA')` e inspecione DOM renderizado. No piloto apareceram abas **Ficha Técnica, Vídeo, Aplicabilidades, Especificações, Instalação**, seis linhas de referência (Mac, Mini, Standard, Intermediário, Super, Mega), três fotos originais, duas imagens de aplicação, uma de instalação, PDF técnico direto e MP4. A ficha técnica está em `assets/product/datasheets/`; fotos em `assets/product/images/`; mídias de aplicação e instalação em diretórios próprios. A página faz chamadas de dados, mas a tabela renderizada foi suficiente; não use consultas sem limite apropriado. Sementes de modelo estão em `sources.json`; cada `?model=` deve ser tratado como possível produto distinto. Cada aba pode mudar imagem, PDF e vídeo: conferir após interação.

### Merkbak

WooCommerce. As categorias estão em `/categoria-produto/`; a página `/loja-2/` ajuda a conferir paginação. Em produto, use `h1.product_title`, galeria `.woocommerce-product-gallery__image a[href]` (original, não miniatura), `<select name*=attribute> option` para medidas e abas `#tab-description`, `#tab-additional_information`, `#tab-informacoes`. A aba **INFORMAÇÕES** traz material, acabamento, aplicação e notas; descrição pode estar vazia. Variações da loja podem conter peso/dimensões por opção: conferir `data-product_variations` sem importar preço. No piloto havia 6 medidas e 2 imagens, nenhum PDF/vídeo específico. A loja Carolfix repete Merkbak: a ficha Merkbak é a canônica.

### Kifix

Categorias em `/produtos/<família>/`; uma página de produto/família pode ter tabela com muitas referências. A tabela inclui **Referência, A, A1, A2, B, C, D, E, F, G, H, J, L e Peso**, unidades mistas no cabeçalho; mantenha a unidade literal por coluna e não trate dimensão da peça como dimensão de envio. Na **Base Elevada** há 9 referências, três fotos PNG originais em `/fotos_produtos/` **e um desenho técnico JPG público em `/desenhos_produtos/`**, armazenado localmente na V2. O clique de ZIP por referência abre modal exigindo conta/login; não contorne autenticação e **não mostre botão/link externo de material técnico inexistente na V2**. O catálogo geral PDF público (`/catalogo/`) é fonte auxiliar, não substitui tabela.

### Carolfix

A loja `/loja/` e suas 30 categorias são fontes de descoberta, mas os 50 produtos cadastrados lá no piloto histórico são Merkbak — verifique origem e descarte duplicatas. Produtos exclusivamente Carolfix podem aparecer **apenas no catálogo PDF de 60 páginas**; use o índice e depois `pdfplumber`/Poppler para extrair tabelas e revisar visualmente a página. O piloto série 525 “Anel de Retenção para Eixo Liso” está na **página 18**, 24 códigos. Não confundir com DIN 6799 e DIN 5417, que dividem a mesma folha. Registre PDF inteiro apenas uma vez e associe `#page=18`; recorte da tabela serve como visual técnico, marcado como tal. Dados históricos de 2016 pedem confirmação técnica antes de promessa de disponibilidade. Para qualquer novo item Carolfix, antes de publicar pesquise nome, código e família nos outros 3 fornecedores; se houver equivalente idêntico, mantenha só fornecedor.

## Checklist de aceite por produto

- [ ] URL canônica, fornecedor, categoria, código e título conferidos; dedupe feita.
- [ ] Todas as abas, linhas de tabela, variantes, unidades e notas técnicas conferidas visualmente.
- [ ] Foto(s) originais corretas, alta resolução quando a origem oferece, hashes e caminhos locais; mídia de aplicação separada.
- [ ] PDF, ZIP, CAD e vídeo: arquivo local ou motivo objetivo para somente link/restrição; links abrem.
- [ ] Zero preço, prazo, frete, estoque ou avaliação importados da fonte.
- [ ] JSON válido e sem HTML ativo, IDs/slugs exclusivos; estado no ledger e manifesto atualizados.
- [ ] TypeScript, os dois builds e navegação real V2 verificados antes de marcar `published`.

## Publicação, propriedade e não regressão

GitHub V2: `https://github.com/ramonpmendesx1707/carol-componentes-v2`; Pages V2: `https://ramonpmendesx1707.github.io/carol-componentes-v2/`; Site V2: `https://carol-componentes-v2.safc-conceicao87.chatgpt.site/`. O Pages estático usa catálogo do build; o Worker/Site pode ter D1 próprio. **Não** publicar um JSON novo no GitHub e assumir automaticamente que um D1 já existente foi substituído. Validar `/api/catalog` da V2 e sincronizar/migrar apenas com backup e revisão. Nunca apontar a API para o Site V1. A conta comercial continua usando exclusivamente o WhatsApp `5547996180088`.

Para encerrar um turno: registre o que foi **de fato publicado** versus apenas coletado/testado; atualize as pendências abaixo. Próxima IA deve ler este estado antes de operar.

### Pendências abertas

1. Escalar dos quatro pilotos para todas as páginas de todas as categorias, com fila paginada e reconciliação; o script atual não é crawler completo.
2. Confirmar tecnicamente o valor `d3` da referência Carolfix 525.160.
3. Obter autorização/acesso legítimo se a Carol precisar hospedar ZIPs Kifix restritos; até lá, link de origem e solicitação.
4. Definir hospedagem adequada/licença para MP4 Vibra-Stop de ~140 MB, caso se queira cópia própria.
5. Verificar publicação e sincronismo do catálogo V2 nos dois destinos a cada lote; registrar commit/deploy no ledger.
