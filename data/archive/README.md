# Catálogo congelado da V1

`catalog-v1.json` preserva os 50 produtos e 290 medidas copiados do projeto original. Ele não é carregado pela V2. As imagens correspondentes continuam em `public/images/catalog/` e o PDF histórico em `public/downloads/`.

Para restaurar futuramente, execute o script `node scripts/catalog-restore.mjs --from-v1` numa cópia de trabalho limpa, revise o diff e publique a nova versão nos dois destinos. Nunca restaure diretamente no projeto `carol-componentes` congelado.

Base do arquivo: commit `bc264b9a3057aeb31bd79163b47f3f558d2d14da` do repositório original. Guarde também a revisão do banco D1 separadamente: o arquivo JSON não contém registros privados, fotos adicionadas pelo gestor ao R2 ou segredos.
