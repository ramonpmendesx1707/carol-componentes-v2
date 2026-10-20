# V2 — Catálogo preparado para reconstrução — 19/10/2026

## PDFs 2026 e início da coleta contínua Vibra-Stop — 20/10/2026

- Base Elevada Kifix: desenho técnico JPG público de alta resolução incorporado à galeria e à aba técnica; removido o documento restrito que antes levava ao site do fornecedor. A V2 agora oculta materiais não armazenados localmente, sem expor links diretos de fonte na aba. Vídeos públicos aparecem em player integrado no detalhe, inclusive o MP4 Vibra-Stop, sem botão externo.
- Identificadores Vibra-Stop passam a incluir a família quando o mesmo `model` existe em linhas diferentes; a colisão “Sem Chapa” foi reparada e a Mola Simples recolhida separadamente. Um modelo com tabela fora do padrão segue `blocked` para análise; nenhum item em revisão foi publicado.
- Ramon definiu que os PDFs são sempre a autoridade técnica sobre o site. A ordem obrigatória é coletar todos os modelos do fornecedor, depois confrontar os PDFs e alterar somente os campos necessários. A edição pública de agosto/2026 do catálogo de molas é a revisão mais recente; a cópia recebida de abril/2026 permanece guardada.
- Coleta Vibra-Stop avançou além dos três primeiros modelos, mantendo cada ficha, foto original, documento, vídeo oficial e snapshot no estágio `needs_review`, sem alterar o catálogo público. Contagens e próxima URL estão no ledger. Corrigido o extrator de descrições para que não inclua tabela e rodapé quando uma família não tiver todos os rótulos; fichas já coletadas foram regeneradas a partir do snapshot bruto.
- Dois catálogos atualizados Vibra-Stop recebidos, preservados em `public/downloads/suppliers/vibra-stop/2026/` e registrados com SHA-256 e páginas em `data/harvest/supplier-documents.json`. Manual vivo agora exige confronto de todos os produtos com catálogos/datasheets após terminar cada fornecedor, com resolução documentada de divergências e preservação da foto original quando não houver imagem nova.
- O PDF de molas atualmente público no fabricante difere do anexo recebido apesar de ambos indicarem “Edição 2026”: a revisão pública com criação em agosto modifica as páginas 26 e 31, incluindo dimensões da Mola Sísmica Plus. Ambas as cópias ficaram preservadas; a revisão pública foi marcada como candidata preferencial, sujeita à conferência por código. O catálogo geral enviado é idêntico ao público por SHA-256.
- Corrigida a descrição do piloto Tradicional com Chapa: a edição 2026 distingue o modelo de chapa do modelo de dois furos. Ficha e catálogo 2026 vinculados no detalhe.
- Coleta real retomável iniciada pela Vibra-Stop: Malha de Aço (5 referências), Sem Chapa (6) e Chapa + 2 Furos (3) baixados com fotografias, imagens técnicas e fichas PDF. Permanecem em `needs_review` e fora da listagem ativa até conferência. A Malha de Aço tem divergência entre catálogo 2026 (malha galvanizada), ficha 2025 (inox 304) e texto genérico do site (borracha); não foi inventada especificação definitiva.
- Site V2 do ChatGPT passou a acesso público por decisão do proprietário. A correção da página inicial foi publicada na versão 4; a raiz e a API responderam HTTP 200, e a navegação desktop/móvel dos 4 pilotos foi testada também no GitHub Pages. A V1 permanece congelada.

## Pilotos técnicos e continuidade de coleta — 20/10/2026

- Quatro produtos-piloto coletados e preparados para a V2: Vibra-Stop Tradicional com Chapa (6 referências, ficha PDF, fotos/aplicação/instalação, vídeo oficial por link), Merkbak V2R sem alma (6 medidas, duas imagens, três abas), Kifix Base Elevada (9 referências e 3 imagens; ZIP de desenhos requer login) e Carolfix Anel de Retenção para Eixo Liso (24 códigos da página 18 do PDF).
- Catálogo ativo passa a 4 produtos/45 referências, sem preços ou prazos de fornecedores. Filtro por fornecedor, dados técnicos dimensionais, documentos e aba de vídeo no detalhe. Hero deixa de depender dos IDs arquivados da V1. Regra de duplicação: fornecedor prevalece; Carolfix só entra quando exclusiva.
- Imagens originais locais por produto, manifesto de arquivos com origem/hash, mapa de 148 sementes e fila retomável. Manual vivo `01 ORIENTAÇÕES PARA NOVAS IA's.md` para Codex/Antigravity em Ubuntu + Playwright. Vídeo Vibra-Stop de ~140 MB não foi hospedado no Git; desenho Kifix restrito não foi baixado. Anomalia `d3=45,6` da referência Carolfix 525.160 pendente de revisão técnica.
- API D1 da V2 migra somente o estado inicial vazio e intocado para os pilotos, sem sobrescrever revisão administrativa. TypeScript, builds Pages/Worker e navegação Playwright 390/1440 px validados.

- Catálogo de 50 produtos/290 medidas da V1 arquivado em `data/archive/catalog-v1.json`, fora da listagem ativa, com restauração assistida por `scripts/catalog-restore.mjs`.
- Catálogo ativo iniciado vazio. API da V2 passa a usar estado próprio `catalog_v2` e o frontend aponta para o Site V2; nenhuma leitura ou gravação de catálogo usa o Site original.
- TypeScript, build GitHub Pages e build Worker passaram. O acervo antigo e os arquivos técnicos permanecem disponíveis no histórico Git e no arquivo de backup.

# V2 — Base independente — 19/10/2026

- Projeto duplicado a partir da versão 2.7.0 para uma nova linha de evolução, preservando o site anterior sem alterações.
- Novo repositório e GitHub Pages em `carol-componentes-v2`, com prefixo estático próprio.
- Novo projeto de hospedagem no ChatGPT Sites, sem reutilizar a identidade de publicação do site congelado.
- TypeScript e build estático validados antes da primeira publicação da V2.

# 2.7.0 — Identidade oficial em todo o primeiro site — 10/10/2026

- Azul-marinho, dourado e superfícies claras no catálogo, produto, diálogos, validação, privacidade e administração.
- Contraste de texto e foco revistos; verde reservado a WhatsApp e estados semânticos.
- Novo título de contato: “Encontre a solução para sua indústria.”
- Metadados de navegador e web app alinhados à identidade. Recursos e segundo site preservados.

## 2.6.0 — 2026-10-07
Logo oficial no cabeçalho, rodapé, favicon ICO e ícones iOS/PWA. Reset administrativo por segredo versionado no servidor, revogando sessões antigas uma vez; troca inicial opcional.

## 2.4.0 — 2026-10-06
- Corrige o reconhecimento de caminhos de imagens recebidas da API após o transform do Pages, inclusive fotos técnicas em descrições. Regressão verificada com imagens realmente carregadas.
## 2.5.0 — 2026-10-07
Produtos salvos entram no contador superior e na seleção enviada ao WhatsApp/e-mail. Uma referência já especificada não é duplicada pelo favorito. Medidas ausentes são sinalizadas; quantidades e remoção funcionam na seleção. Ícone de salvar com contraste e preenchimento visíveis. Validação em navegador com persistência e payload de contato interceptado, sem envio real.

- Marca Componentes Industriais na mesma linha; remove a repetição acima do título; CTA Chamar no WhatsApp e assinatura discreta do autor.
- Administração: botões de ação alinhados, galeria de até 10 fotos, seleção/remoção de principal, categorias existentes e cadastro de nova categoria.
- Endereço gerado automaticamente por nome, com sufixo para duplicidade; produtos existentes mantêm o endereço ao editar.
- Galeria de miniaturas no produto público; ícones de tela inicial iOS/Android, manifest standalone e nome curto Carol.
- Testes: home/produto/admin com dados de API, cadastro com duas fotos em R2 local, marca e responsividade 320/390/768/1024/1440.

## 2.3.0 — 2026-10-06
- Timeline vinculada à própria linha, progressão reversível de 1984 a 2026 e traço mais espesso; remoção da nota visível solicitada.
- Marca capitalizada, CTA WhatsApp verde, ícone de comparação em colunas e catálogo visual maior.
- Navegação Pages interna; validação externa removida.
- Administração autenticada, catálogo D1 compartilhado, CRUD, 12 destaques, Excel completo, prévia de substituição e snapshots.
- Consulta OpenCNPJ e mensagens empresariais formatadas; e-mail condicionado ao provedor configurado.
- Foto PBF recuperada da origem; registro em data/image-recovery-v23.json.

# Histórico

## 2.2.0 — 06/10/2026
História em QUATRO marcos cronológicos (1984/2000/2014/2026), frase de impacto e alinhamento superior; substitui completamente os três passos comerciais. Datas intermediárias propostas, conforme autorização, identificadas para validação. Logos sociais ampliados e links corrigidos. Localização apenas Nosso ponto de encontro. Carrossel compacto com cinco marcas, pausa acessível e catálogos/seleções ilustrativas. Treze logos individuais de pagamento. Contatos/horários físicos e virtuais com novo domínio, único WhatsApp Joinville. Comparação vertical móvel em cartões, foco/abertura de produto preservados. Corrigido overflow em 320 px.

Segundo alvo de build para GitHub Pages, reutilizando interface/dados/assets, com base de URL e 404 SPA; frete local estimado e contato com rascunho no dispositivo, sem e-mail/D1. Workflow de publicação, scripts de prévia, AGENTS.md, handoff detalhado e manual de domínio/continuidade. Arquitetura Worker/Sites preservada. TypeScript/build estático e navegação/layout móvel passaram; publicação depende da configuração/audiência autorizada no GitHub.


## 2.1.0 — 06/10/2026
Volante com entrada de rotação após carregar a imagem, giro de 155° no hover e maior resposta à rolagem. Apoiar/Fixar com zoom que preserva clique. Efeitos desativados quando há preferência por redução de movimento.

Sobre reescrito com base no institucional antigo e continuidade de direção informada pelo usuário, sem transportar os números de estoque/clientes do grupo anterior para a nova empresa. Comparação com botão nomeado/estado selecionado, instruções expansíveis e barra orientando selecionar a segunda peça.

CNPJ e telefone formatados durante digitação e colagem; validação junto ao campo ao completar e ao sair; submissão bloqueada em caso inválido. Telefone validado no cliente e servidor por DDD e estrutura de fixo/celular; não verifica titularidade ou existência da linha. CNPJ preserva suporte alfanumérico e verifica dígitos, sem consulta cadastral.

WhatsApp com símbolo reconhecível e botão verde. Seção exclusiva de redes com três canais reais/indicados: Instagram Joinville, Facebook compartilhado do histórico e LinkedIn Joinville. Publicações não disponíveis na consulta não foram inventadas ou apresentadas como feed.

TypeScript, integração e testes em navegador passaram; máscaras, campos inválidos, colagem internacional, fixo, comparação, animações, clique/zoom, móvel e redução de movimento verificados.

## 2.0.0 — 06/10/2026
Nova direção Movimento e proximidade: verde mineral, abertura assimétrica e imagens integradas ao fundo. Movimento de peças e linha do percurso ligados à rolagem, cabeçalho compacto, progresso de leitura e navegação ativa. Painel de mapa inspirado na organização do RFK com alcance nacional.

Busca passa a mostrar resultados no próprio lugar; produto abre sobre o contexto e preserva busca/filtros/posição. URLs completas continuam acessíveis. Corrigido posicionamento de diálogos e camadas de contato sobre produto. Texto de contato simplificado para Continuar no WhatsApp; encaminhamento após registro, com CNPJ e telefone obrigatórios. E-mail continua sem disparo real, conforme decisão do usuário.

Validado em navegador desktop e móvel: teclado na busca, variante/cotação, abertura/fechamento, rolagem preservada, navegação ativa, animação, mapa, formulário, único WhatsApp e redução de movimento. Zero exceções no navegador. Integração de catálogo/rotas/PDF/frete/contato/feedback passou.
## 1.0.0 — 06/10/2026
Primeira direção Precisão industrial: catálogo, cotação, favoritos, comparação, frete demonstrativo, contato obrigatório CNPJ/telefone, PDF atualizado, mapa e validação autenticada. Exclusivamente Joinville e único WhatsApp. E-mail demonstrativo conforme confirmação. Roadmap e infraestrutura documentados. Segunda variação visual ainda não implementada.

## Versionamento
Patch para correções; minor para funcionalidades e refinamentos relevantes; major para mudanças de arquitetura/operação. Cada entrega documenta problema, comportamento, validação e limitações. Branch curta por melhoria, commits descritivos, tag por entrega. Preservar primeira direção ao implementar a segunda.
