---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo SOC-006)
data: 2026-09-11
veredito: validado
validade: dado datado (mai/2026)
tags: [ciberseguranca, dbir, verizon, vulnerabilidades, cisa-kev, piersec, soc]
---

# Verizon DBIR 2026: Exploração de Vulnerabilidade Vira Vetor nº 1 e a Mediana de Correção Sobe para 43 Dias

Pesquisa primária do ciclo SOC-006 (série de conteúdo SOC/MDR da Piersec). Método declarado e verificável: busca web para levantar candidatos, depois leitura direta do PDF do relatório para confirmar cada número, sem usar número de blog de fornecedor. O [[Verizon DBIR]] 2026 cobre nov/2024 a out/2025, com mais de 31 mil incidentes e mais de 22 mil violações confirmadas.

## Achados que passaram na triagem

**Inversão do vetor de acesso inicial.** Exploração de vulnerabilidades é o vetor mais comum pela primeira vez nos 19 anos do relatório: 31% das violações, contra 20% na edição anterior. Abuso de credenciais, antigo líder, caiu para 13%.

**Correção do que já é explorado piorou.** Apenas 26% das vulnerabilidades do catálogo [[CISA KEV]] foram totalmente corrigidas pelas organizações em 2025, contra 38% no ano anterior. A mediana para resolução completa de vulnerabilidade crítica subiu de 32 para 43 dias, e no caso mediano as organizações tinham 50% mais vulnerabilidades críticas na fila do que no ano anterior.

**Ransomware.** Presente em 48% das violações, contra 44% antes; 69% das vítimas não pagaram.

**O que esta rodada acrescentou.** Os dois números de cabeceira (31% e 43 dias) já constavam em [[exploracao-vulnerabilidades-gestao-exposicao]], levantados em cobertura secundária. Esta rodada confirmou os dois na fonte primária e acrescentou três números novos: a queda do abuso de credenciais para 13%, a piora da correção de KEV de 38% para 26%, e o crescimento de 50% na fila mediana de vulnerabilidades críticas.

## Uso na peça

O argumento de SOC/MDR sai da janela de exposição: entre a vulnerabilidade conhecida e a correção completa há semanas em que a única proteção é detectar e conter a tentativa de exploração. O enquadramento evita prometer correção instantânea, que é inviável, e posiciona o monitoramento contínuo como cobertura do intervalo. Mecanismo em [[Gestão Contínua de Exposição (CTEM)]].

## O que não passou na triagem

- **Recorte por porte e por região, ausente na fonte.** O relatório não separa tempo de correção por tamanho de empresa nem por geografia, e não existe corte Brasil ou LatAm para os 43 dias. Qualquer uso dessa mediana como retrato do mercado brasileiro é extrapolação.
- **Custo de SOC interno contra MDR: não verificável.** Único achado até agora é blog de fornecedor, descartado pelo mesmo critério do método.
- **Gartner sobre agentes de IA em SOC: não verificável.** Nota de 09-09-2026 na Help Net Security, não confirmada na fonte primária. Pendente de conferência.

## Ângulos já cobertos na série SOC/MDR

Tempo de detecção e contenção (IBM), ataques fora do horário (Sophos e CrowdStrike), volume LatAm (Check Point), origem da descoberta (Mandiant), escassez de especialistas (ISC2), e este (Verizon).

Relacionados: [[Panorama de Ameaças Cibernéticas 2026]] · [[Gestão Contínua de Exposição (CTEM)]] · [[Verizon DBIR]] · [[CISA KEV]]
