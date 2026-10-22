---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo 0003)
data: 2026-06-30
veredito: parcial
validade: dado datado (jun/2026)
tags: [ciberseguranca, gestao-de-exposicao, vulnerabilidades, superficie-de-ataque, dbir, piersec]
---

# A Janela entre a Falha Exposta e a Detecção (ciclo 0003, jun/2026)

Pesquisa de 30/06/2026. O ciclo trata de uma assimetria de velocidade: o atacante transforma uma vulnerabilidade divulgada em acesso em poucos dias, enquanto a empresa média leva semanas para corrigir e meses para identificar e conter um incidente. A tese é que o risco vem menos da falta de ferramentas e mais da cadência: revisão periódica (auditoria anual, pentest esporádico) não cobre esse intervalo, e a resposta é visibilidade contínua da superfície de ataque. Público: diretoria, TI e risco de empresas médias e grandes no Brasil.

## Números que passaram na triagem

- **Exploração de vulnerabilidades cresceu 34% e é vetor inicial de 20% das violações, acima do phishing (15%); ataques a dispositivos de borda e VPN saltaram de 3% para 22%.** Verizon, Data Breach Investigations Report 2025 (mai/2025). Confirmado em três fontes (relatório, Infosecurity Magazine, Help Net Security).
- **Só 54% das vulnerabilidades de borda foram totalmente corrigidas no ano, com mediana de 32 dias para o patch.** Verizon DBIR 2025.
- **241 dias para identificar e conter uma violação (menor patamar em nove anos); custo médio global de US$ 4,44 milhões.** IBM, Cost of a Data Breach 2025 (ago/2025). Confirmado em ibm.com e cobertura independente.
- **Exploits foram o vetor inicial em 33% das investigações; mediana de dwell time de 11 dias.** Mandiant/Google, M-Trends 2025 (abr/2025).
- **Brasil concentra 53% dos incidentes de cibersegurança da América Latina e 46,94% dos ataques de ransomware da região.** SOCRadar, LATAM Threat Landscape Report 2026.

## O que não passou na triagem / ressalvas

- **SOCRadar (53% / 46,94%)** é número de relatório de marketing de fornecedor: usar sempre com atribuição explícita.
- **Custo médio de violação no Brasil, US$ 1,22 milhão** (o mais baixo do conjunto IBM), veio de cobertura secundária do relatório. A leitura do ciclo é que o valor baixo reflete menor penalização regulatória, não menos ataques; essa interpretação é da pesquisa, não do relatório.
- **Ciberataques lideram o ranking de riscos das empresas brasileiras em 2026; um terço registrou perdas de ao menos US$ 1 milhão em três anos.** ITShow, fonte secundária sem metodologia declarada.
- **"Exploração em 24 a 48 horas"** apareceu só em fonte brasileira secundária e foi descartado em favor dos números primários de Verizon e Mandiant.
- **Dado superado.** O DBIR 2026 subiu a exploração de vulnerabilidades para 31% das violações e a mediana de correção de crítica para 43 dias: ver [[dbir-2026-janela-correcao-vulnerabilidade]]. Os números deste ciclo descrevem a edição 2025.

## Peças publicadas

- [[0003-artigo-janela-de-exposicao]]
- [[0003-newsletter-janela-de-exposicao]]
- [[0003-linkedin-janela-de-exposicao]]

Relacionados: [[Gestão Contínua de Exposição (CTEM)]] · [[Verizon DBIR]] · [[Panorama de Ameaças Cibernéticas 2026]] · [[exploracao-vulnerabilidades-gestao-exposicao]] · [[acervo-pesquisa-piersec]]
