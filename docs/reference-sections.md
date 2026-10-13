# Seções do HTML de referência

Implementadas em 13 de outubro de 2026, com componentes HeroUI v3 e o acesso autenticado existente.

Após ajuste solicitado pelo usuário, os componentes usam a aparência nativa do HeroUI: cartões com `Card.Title` e `Card.Description`, badges com cores semânticas de `Chip`, botões e links com variantes da biblioteca e tabelas sem sobrescritas de borda, preenchimento ou tipografia. O CSS de referência mantém a organização das telas e as prévias das artes. Os tokens padrão de campos, superfícies, sombras e arredondamento foram restaurados; a cor de destaque da aplicação permanece azul.

| Seção | Rota | Conteúdo |
| --- | --- | --- |
| Visão geral | `/dashboard` | Resumo e trilho de 11 etapas da Piersec |
| Ciclo da semana | `/cycle` | Preparar, produzir, aprovar e entregar; cinco peças |
| Pacote de entrega | `/delivery` | Abas por canal, prévias, textos copiáveis e instruções de publicação |
| Identidade da empresa | `/identity` | Logos, cores, banco, documentos, regras, conflito e conexões |
| Painel do cliente | `/client-dashboard` | Períodos, indicadores, gráfico e resultados por canal |

A Piersec continua sendo a única empresa. As outras empresas fictícias do HTML não viraram workspaces. A gestão da equipe e os rascunhos reais continuam disponíveis no rodapé da navegação.

## Demonstração

As cinco telas reproduzem os dados de exemplo do HTML, incluindo a semana de 5 a 11 de outubro de 2026. Não exibem métricas ao vivo, aprovações reais ou conexões efetivas. O seletor Equipe/Cliente altera apenas a apresentação; não muda as permissões da conta.

Funcionam localmente: filtros, abas, cópia para a área de transferência, variações visuais, escolha de banco, registro simulado de publicação, resolução do conflito, inclusão manual de regra e seleção de arquivos. O estado da simulação de publicação é compartilhado entre o pacote e o ciclo durante a sessão da interface. Arquivos selecionados ficam no navegador; não são enviados nem analisados.

O HTML fornece quatro prévias de lâminas, sem imagens finais de sete lâminas. Os botões de download e releitura informam essa limitação; não simulam uma exportação nem uma chamada à OpenAI.

## Origem dos dados

`scripts/import-reference-data.mjs` lê o HTML original sem modificá-lo e usa a AST do TypeScript para extrair apenas constantes literais. Nenhum script embutido no arquivo de referência é executado. O resultado fica em `src/features/reference/reference-data.json`.

Checagem de tipos: `pnpm typecheck`, concluída sem erros. Nenhum teste automatizado foi adicionado ou executado nesta etapa.
