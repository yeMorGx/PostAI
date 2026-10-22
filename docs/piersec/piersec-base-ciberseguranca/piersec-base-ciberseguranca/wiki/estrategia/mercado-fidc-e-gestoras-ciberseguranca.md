---
tipo: estrategia
data: 2026-07-06
tags: [ciberseguranca, fidc, gestoras, credito-estruturado, special-situations, cvm-175, cmn-4893, anbima, regulacao, mercado, piersec]
---

# Mercado de FIDCs, Gestoras e Casas de Crédito: Segurança Cobrada por Várias Regras ao Mesmo Tempo

Pesquisa comercial da Piersec, fechada em 06/07/2026, sobre gestoras de FIDC, casas de crédito estruturado e de situações especiais (compra de carteiras inadimplentes, antecipação de recebíveis, financiamento a empresas em dificuldade) como mercado de cibersegurança. A frente foi desenhada a partir do perfil de uma casa de crédito e situações especiais de porte nacional. Diferente dos cartórios, que têm uma regra só ([[mercado-cartorios-ciberseguranca]]), esse setor é apertado por várias exigências simultâneas, de reguladores diferentes.

## Por que o setor atrai ataque

Duas coisas juntas: **muito dinheiro passando pelos sistemas** e **muito dado financeiro de terceiros** (quem deve, quanto e para quem). A integração crescente com registradoras, bancos e cedentes multiplica as portas de entrada.

## As regras que pesam

| Regra | O que cobra, em linguagem de gestão | Alcance |
| :-- | :-- | :-- |
| **Resolução CVM 175** (Anexo II, FIDC; orientada pelo Ofício-Circular 8/2025) | que o dado dos direitos creditórios adquiridos seja verdadeiro, íntegro e de titularidade comprovada, como responsabilidade da gestora | direto sobre gestoras de FIDC |
| **Resolução CMN 4.893** | política de segurança cibernética, controle de acesso, monitoramento de ameaças e relatório anual de testes | obrigatória para instituições financeiras; para quem não é obrigado, virou o padrão que bancos, cedentes e investidores cobram em due diligence |
| **Duplicata escritural** (cronograma 2026 a 2027) | duplicatas 100% eletrônicas e registradas em sistemas oficiais | obriga conexão a novos sistemas externos: cada integração é uma nova porta a proteger |
| **Guia de Cibersegurança ANBIMA** (4ª edição, dez/2025) | referência de organização da segurança no mercado de capitais | não é lei, mas falar a língua dele dá autoridade imediata |
| **LGPD** | proteção do dado pessoal de devedores e cedentes, com dever de comunicar incidente | transversal |

A leitura comercial: segurança da informação deixou de ser "boa prática" e virou **item de auditoria e de due diligence de investidor**.

## Tamanho do mercado

- Indústria de FIDCs perto de **R$ 741 bilhões** em ativos sob gestão em dez/2025 (dados ANBIMA, via ADVFN); o documento de pesquisa arredonda para "cerca de R$ 800 bilhões", número que a fonte citada não sustenta.
- Mercado de venda de carteiras inadimplentes: **R$ 34 bilhões cedidos em 2025** (Recovery, via Kontapar).
- Base pública mapeada pela Piersec a partir de dados da CVM: **501 gestoras de crédito**, das quais 21 eram bancos ou DTVMs e foram retiradas do alvo. O restante foi dividido em Tier 1 (pares diretos do perfil de referência, crédito estruturado e special situations) e Tier 2 (grande e médio porte).
- Leitura de jul/2026: na frente de crédito o mercado de fornecedores de segurança "ainda está começando a se mexer", vantagem para quem chega cedo.

## As provas de que a dor é real

- **C&M Software, junho de 2025:** desvio de cerca de **R$ 500 milhões**, tratado na imprensa como o maior ataque da história do sistema financeiro brasileiro. Segundo a pesquisa, a entrada se deu por um fornecedor de software que conecta instituições ao sistema financeiro (ver ressalvas).
- **FictorPay, outubro de 2025:** prejuízo de **R$ 26 milhões** a partir de credencial vazada de sistema terceirizado.

Nos dois casos a falha não nasceu na operação da empresa atingida. É o argumento de **risco de terceiros** (ver [[0008-artigo-risco-de-terceiros]]).

## Perfil do decisor

Sócio, CRO, head de risco, compliance ou TI. Entende de risco e compliance melhor que o titular de cartório: não é preciso simplificar CVM e CMN, mas também não convém provar erudição técnica no primeiro contato. Decide rápido se vale conversar, prefere contato por indicação e reunião, e costuma responder mais no LinkedIn do que na caixa corporativa.

## Oferta que encaixa

1. **Isca:** Diagnóstico de Segurança para Casas de Crédito: exposição técnica (e-mail, domínio, certificado) e lacunas de governança, com foco em acessos, integrações externas e evidência para investidor e auditor.
2. **Núcleo:** SOC gerenciado mais programa de GRC (políticas, gestão de risco, evidências para auditoria e investidores).

Ângulos que sustentam a abordagem: risco de fornecedor (casos acima), integridade do dado de crédito como obrigação (CVM 175), evidência para quem investe na gestora (CMN 4.893) e, quando houver, achado técnico público (domínio sem SPF/DMARC). A régua de contato está em [[regua-abm-fidc-gestoras]].

## Ressalvas

- "Desvios por ataque acima de R$ 1,7 bilhão no setor financeiro desde 2024" e "ativos estressados acima de R$ 500 bilhões" constavam da pesquisa sem fonte nomeada: não usar sem verificar.
- O vetor do caso C&M aparece descrito de dois jeitos no material (entrada por fornecedor de software, na pesquisa; ataque de ransomware, na copy). A descrição não foi conferida em fonte primária nesta exportação; ao citar, ficar no fato comum (valor, data, origem em terceiro).
- Não há registro de que a régua para esta frente tenha sido disparada nem de resultado medido. Tudo aqui é tese de mercado, não aprendizado de campo.
- Dados datados (2025 a jul/2026).

## Fontes

- [Indústria de FIDCs supera R$ 741 bi, ADVFN/ANBIMA](https://br.advfn.com/jornal/2025/12/industria-de-fidcs-cresce-e-supera-r-741-bilhoes-em-ativos-sob-gestao)
- [FIDCs ampliam base de investidores, ANBIMA](https://www.anbima.com.br/pt_br/noticias/fidcs-ampliam-base-de-investidores-com-destaque-para-o-varejo.htm)
- [CVM orienta sobre a Resolução 175 (FIDC), Ofício-Circular 8/2025](https://www.gov.br/cvm/pt-br/assuntos/noticias/2025/area-tecnica-da-cvm-orienta-sobre-anexos-normativos-a-resolucao-cvm-175-relacionados-a-fidc-fii-e-fiagro)
- [Mercado de carteiras inadimplentes fecha 2025 com R$ 34 bi, Kontapar/Recovery](https://kontapar.com.br/noticias/artigos/2026/02/12/mercado-de-venda-de-carteiras-inadimplentes-encerra-2025-com-r-34-bilhoes-cedidos-segundo-a-recovery/)
- [Duplicata escritural, cronograma 2026 a 2027](https://antecipafacil.com.br/artigo/duplicata-escritural-guia-definitivo-2026)
- [Resolução CMN 4.893, guia (fonte secundária)](https://secoffice.com.br/blog/resolucao-cmn-4-893-guia-completo-sobre-seguranca-cibernetica-para-instituicoes-financeiras/)
- [Guia ANBIMA de Cibersegurança, 4ª edição](https://www.anbima.com.br/pt_br/noticias/quarta-edicao-do-guia-de-ciberseguranca-fortalece-a-seguranca-digital-do-mercado-de-capitais.htm)
- [Ataque à C&M Software, IstoÉ Dinheiro](https://istoedinheiro.com.br/hacker-cibernetica-ataque-brasil)
- [Ataque à FictorPay, TechTudo](https://www.techtudo.com.br/noticias/2025/10/ataque-hacker-desvia-r-26-milhoes-entenda-caso-contra-fintech-brasileira-edsoftwares.ghtml)

Relacionados: [[regua-abm-fidc-gestoras]] · [[mercado-cartorios-ciberseguranca]] · [[legitimo-interesse-prospeccao-b2b]] · [[Panorama de Ameaças Cibernéticas 2026]]
