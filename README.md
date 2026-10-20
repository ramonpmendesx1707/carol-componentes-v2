> Versão 2.7.0: identidade azul-marinho e dourado baseada na logo oficial. Veja docs/IDENTIDADE-V27.md.

> Versão atual 2.4.0: imagens da API corrigidas, administração com várias fotos/categorias/endereço automático e ícone de tela inicial com nome Carol. Veja CHANGELOG.md e docs/ADMINISTRACAO.md.

> Atualização v2.3.0: consulte [administração e integrações](docs/ADMINISTRACAO.md) para o backend compartilhado, autenticação, Excel, CNPJ e e-mail. As limitações antigas de catálogo exclusivamente estático foram substituídas pela arquitetura descrita nesse documento.

# Carol Componentes V2

> Catálogo V2 em reconstrução: 50 exemplos antigos estão preservados em `data/archive/catalog-v1.json` e fora da busca. O catálogo ativo contém 4 pilotos técnicos de Vibra-Stop, Merkbak, Kifix e Carolfix (45 referências). A coleta do restante **ainda não está concluída**. A Vibra-Stop é o fornecedor em processamento: três modelos adicionais já foram coletados com fotos e PDFs originais, mas estão em revisão, fora da listagem pública. Os dois catálogos Vibra-Stop edição 2026 foram registrados para confronto técnico posterior. Para continuar de onde parou, leia [01 ORIENTAÇÕES PARA NOVAS IA's.md](01%20ORIENTA%C3%87%C3%95ES%20PARA%20NOVAS%20IA%27s.md) e `data/harvest/status.json`.

Publicação GitHub Pages: https://ramonpmendesx1707.github.io/carol-componentes-v2/ . Esta V2 é uma evolução independente; o projeto `carol-componentes` original permanece congelado. Publicação automática via Actions; verificar execução para estado atual.

Versão 2.2 — **Movimento e proximidade**. Identidade azul-marinho e dourado, superfícies claras e composição mecânica que responde à rolagem. Atendimento em Joinville com envio para todo o Brasil. Barlow e Source Sans; marca tipográfica provisória. A primeira proposta permanece no histórico/tag v1.0.0.

## Comece aqui (humano ou IA)

- [Guia completo para outra IA](docs/HANDOFF-IA.md)
- [Instalação, GitHub Pages e domínio oficial](DEPLOY_MANUAL.md)
- [Regras de continuidade](AGENTS.md)

`npm run install:ci` instala o lockfile. `npm run build:pages` gera a publicação estática em dist-pages; `npm run preview:pages` abre a prévia no prefixo /carol-componentes-v2/. `npm run build` mantém o alvo Worker/Sites. Não são builds intercambiáveis. O pacote estático funciona sem a máquina do autor ou plugin Codex.

A seção institucional agora é uma linha do tempo de **quatro marcos históricos/propostos**, com avanço na rolagem; os três passos comerciais foram removidos. Carrossel de marcas, pagamentos e contatos completos integrados.

## Funcionalidades
Catálogo técnico ativo com fornecedores separados, busca, grade/lista, filtros de família e fornecedor, medidas, informação adicional, tabelas técnicas, anexos, vídeo quando disponível, comparação de três peças, favoritos e cotação persistidos no dispositivo. PDF técnico histórico de 60 páginas com nova identidade, mapa de Joinville e área autenticada de pedidos de melhoria. O acervo antigo de 50 produtos/290 variantes pertence somente ao backup da V1.

O contato exige CNPJ válido e telefone com DDD; registra a solicitação antes de abrir WhatsApp preenchido, exclusivamente **5547996180088**. O usuário confirmou que **e-mail permanece demonstrativo**. Destinatário futuro: ramonpmendesx@gmail.com. A interface não afirma envio real. Não há checkout, pagamentos, estoque real ou CAD fictício. Frete e prazos são explicitamente simulados. Preço zero na origem é apresentado sob consulta.

O domínio carolcomponentes.com.br faz parte da identidade; compra, DNS e correio não foram alterados. O mesmo Site de homologação no ChatGPT Pages/Sites está atualmente público; esta entrega preserva essa configuração.

Busca com resultados no próprio campo, navegação que acompanha a seção e painel de produto que preserva filtros e rolagem. Linha animada explica selecionar, cotar e receber. Mapa em painel com atendimento local e alcance nacional. Respeita redução de movimento. Volante animado na chegada/hover, comparação guiada, contatos com máscaras e validação por campo, WhatsApp identificado e canais sociais.

## Documentação
- [Institucional e redes](docs/SOCIAL-AND-ABOUT.md)
- [Direção visual 2](docs/DESIGN-V2.md)
- [Evidências de validação](docs/RELEASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Infraestrutura e correio](docs/INFRASTRUCTURE.md)
- [Referências de mercado](docs/COMPETITORS.md)
- [Origem dos dados](docs/DATA.md)
- [Validação](docs/VALIDATION.md)
- [Histórico](CHANGELOG.md)

## Desenvolvimento
React, TypeScript, Vinext, Cloudflare Worker e D1. Node 22.13+. Instalar com npm run install:ci; desenvolver com npm run dev; gerar migrações com npm run db:generate; verificar com npx tsc --noEmit; construir com npm run build. No Windows com problema de lançador, usar node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run dev.

O manifesto .openai/hosting.json identifica o mesmo Site para próximas alterações. Preservar o plugin Sites no Vite. Favoritos/rascunhos são locais; pedidos de melhoria têm autenticação ChatGPT e persistência D1. Não versionar credenciais, transcrição privada, dados pessoais capturados, dependências ou estado do banco.

## Continuidade
Registrar melhoria em /validacao e voltar à conversa com a área, página e comportamento esperado. O registro não executa alterações automaticamente. Cada entrega deve atualizar CHANGELOG, validar recursos e publicar nova versão do mesmo Site. GitHub privado é o histórico de código independente; remoto Sites publica a aplicação.

## Seleção integrada de produtos
Salvos e linhas de cotação são combinados por lib/selection.ts. O contador superior abre a seleção completa; todos os botões de contato incluem essa seleção na mensagem. Favorito sem medida é enviado como “Medida a definir”. Linhas com medida têm prioridade sobre o favorito do mesmo produto. A persistência continua local, separada em cada site. Mensagens não são enviadas automaticamente pelo WhatsApp.

## Identidade oficial e acesso administrativo — 2.6.0
Logo fornecida pela empresa em 07/10/2026, preservada em public/images/brand/. Símbolo no cabeçalho e ícones; assinatura completa no rodapé com superfície do próprio tema. O primeiro site usa a identidade azul-marinho e dourado; Órbita mantém sua paleta independente. Usuário atual admin; senha configurada apenas no servidor, sem troca inicial obrigatória por solicitação do proprietário. ADMIN_BOOTSTRAP é JSON secreto {username, hash, revision, mustChange}; hash usa salt:PBKDF2-SHA256, 100000 iterações. Uma nova revision aplica o reset uma única vez e revoga sessões/tentativas anteriores. Republicar com a mesma revision não redefine a senha nem derruba sessões novas. Nunca incluir o segredo ou senha em Git/VITE_.
