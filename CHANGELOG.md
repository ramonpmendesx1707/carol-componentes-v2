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
