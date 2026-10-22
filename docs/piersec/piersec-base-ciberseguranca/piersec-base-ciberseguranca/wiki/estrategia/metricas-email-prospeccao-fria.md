---
tipo: estrategia
data: 2026-10-01
tags: [email, prospeccao, outbound, entregabilidade, metricas, dmarc, piersec]
---

# Prospecção Fria por E-mail: Entregabilidade, Critérios de Parada e Como Ler as Métricas

Aprendizados de método da campanha da Piersec para cartórios (52.594 e-mails, ago a out/2026, ver [[campanha-cartorios-estrategia-e-resultados]]), escritos para servir a qualquer prospecção B2B em lista fria a partir de base pública.

## Antes do primeiro envio

- **Domínio de envio autenticado** com SPF, DKIM e DMARC. Começar com DMARC em `p=none`, ler os relatórios por duas a três semanas e então subir para `p=quarantine`. Uma empresa de segurança que prospecta sem DMARC desmente a própria oferta.
- **Remetente coerente com a assinatura.** Se o corpo diz "Sou Fulano" e é assinado por ele, o nome exibido na caixa de entrada tem de ser o dele; descompasso ali derruba a abertura, que é onde a decisão acontece. O endereço de resposta deve cair numa caixa monitorada por quem assina ou pelo comercial.
- **Higiene da base:** remover endereço malformado, vazio e conta genérica de função; deduplicar (em empate, preferir o registro corporativo e o mais completo).
- **Aquecimento por lotes crescentes.** Domínio sem histórico não pode mandar milhares de e-mails no primeiro dia. Na campanha, os primeiros lotes foram de 150, 150, 250, 250 e 350 contatos, estabilizando entre 400 e 500 por dia útil, com um lote novo por dia e a sequência de cada lote correndo em paralelo. O pico diário planejado ficou perto de 2.100 envios.

## Critérios de parada

Conferir ao fim de cada dia de envio. Se algum indicador chegar a "parar", suspender a entrada de lotes novos e limpar a base antes de retomar; os lotes em curso terminam a sequência.

| Indicador | Verde | Atenção | Parar |
| :-- | :-- | :-- | :-- |
| Rejeição permanente | < 1,5% | 1,5% a 3% | > 3% |
| Reclamação de spam | < 0,05% | 0,05% a 0,1% | > 0,1% |
| Descadastro | < 0,5% | 0,5% a 2% | > 2% |
| Taxa de entrega | > 95% | 90% a 95% | < 90% |

Os limites de rejeição e spam são mais rígidos que a referência genérica de mercado por se tratar de domínio novo em infraestrutura compartilhada. Reclamação de spam é o indicador mais importante: perto de 0,3% o Gmail derruba a reputação do remetente. Numa base de 2.600 contatos, 0,1% são duas ou três pessoas.

## Por que não decidir por abertura

- **Proteção de privacidade do Apple Mail** baixa as imagens do e-mail por proxy assim que a mensagem chega, sem leitura humana. No teste da campanha, um único destinatário gerou duas aberturas, uma humana e outra automática. Quem lê Gmail pelo app nativo do iPhone também dispara o efeito.
- **Scanners de segurança corporativos** abrem e até clicam nos links para inspecioná-los. Na campanha, um único estado concentrou 148 cliques num só e-mail, quase metade do total do período, padrão típico de scanner.
- O efeito não pode ser desligado pelo remetente, e pesa mais quanto maior a parcela de caixa pessoal (77% na base de cartórios).

**O que fazer:**

1. Ler abertura sempre com aberturas automáticas excluídas, quando a ferramenta permitir, e usá-la só para comparar assunto contra assunto dentro do mesmo público.
2. Usar como métrica principal **contato único que clicou** e **conversão** (diagnóstico concluído, resposta, pedido de contato). Para clique, preferir contatos únicos a total de cliques, para reduzir o ruído de scanner.
3. **Nunca usar abertura como regra de saída da sequência.** Se "abriu" tirasse o contato da régua, gente que nunca leu sairia por engano. A saída deve ser por conversão ou descadastro.
4. **Monitorar respostas por fora das métricas.** Resposta direta ("quanto custa?") é o sinal mais forte de compra e não aparece como clique nem como conversão.

## Referências de engajamento observadas (cartórios, 2026)

| Recorte | Abertura | Clique |
| :-- | :-- | :-- |
| Domínio próprio, primeiros lotes (abertura humana) | 14,0% | 1,95% sobre entregues |
| E-mail pessoal, primeiros lotes (abertura humana) | 5,6% | 0,53% sobre entregues |
| Ciclo completo, nacional (abertura bruta) | 4,9% | 0,11% (contatos únicos) |

São referências de um público específico (serventias extrajudiciais, lista fria, marca desconhecida) e de um momento (ago a out/2026), não benchmarks gerais.

Relacionados: [[campanha-cartorios-estrategia-e-resultados]] · [[legitimo-interesse-prospeccao-b2b]] · [[mercado-cartorios-ciberseguranca]]
