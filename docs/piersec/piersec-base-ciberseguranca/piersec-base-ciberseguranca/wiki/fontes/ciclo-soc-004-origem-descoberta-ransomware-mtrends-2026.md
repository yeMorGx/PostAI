---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo SOC-004)
data: 2026-08-28
veredito: validado
validade: dado datado (investigações de 2025; publicação mar/2026)
link: https://services.google.com/fh/files/misc/m-trends-2026-executive-edition-en.pdf
tags: [ciberseguranca, soc, mdr, mandiant, ransomware, tempo-de-permanencia, piersec]
---

# Mandiant M-Trends 2026: em 44% dos Casos de Ransomware, Quem Avisou a Empresa Foi o Próprio Atacante

Quarto ciclo da série SOC/MDR da Piersec (post estático patrocinado de 28/08/2026). Ângulo: a origem da descoberta, ou seja, quem avisou a empresa de que ela tinha sido invadida. Fonte: Mandiant (Google Cloud), *M-Trends 2026, Executive Edition*, publicado em 23/03/2026, com base em mais de 500 mil horas de resposta a incidentes conduzidas entre 01/01/2025 e 31/12/2025. Números conferidos por leitura direta do PDF oficial (página do relatório: https://cloud.google.com/blog/topics/threat-intelligence/m-trends-2026).

## Números que passaram na triagem

- Nos casos de **ransomware**: o próprio adversário notificou a vítima em **44%** das vezes; a identificação foi interna em **41%**; aviso de terceiro em **15%** (Mandiant, M-Trends 2026).
- No conjunto de **todas as investigações de 2025**: **52%** de detecção interna (ante 43% em 2024), **34%** de notificação externa (ante 43%) e **14%** de aviso do próprio adversário (mesma fonte).
- **Tempo mediano global de permanência** do invasor: **14 dias** em 2025, ante **11 dias** em 2024 (mesma fonte).

## O que não passou na triagem / ressalvas

- **Viés de amostra:** a base é de casos em que a Mandiant foi chamada para responder. Empresas que contratam resposta a incidente desse porte não representam o mercado médio, e a proporção de ransomware com aviso do atacante reflete essa carteira.
- **Sem recorte Brasil:** os números são globais.
- A peça publicada descreve o aviso externo como "autoridade, CERT ou parceiro". É uma explicação editorial do que é notificação externa, não um detalhamento trazido pela fonte.

## Peças publicadas

- [[soc-004-legenda-ransomware-descoberto-pelo-atacante]]

Relacionados: [[Panorama de Ameaças Cibernéticas 2026]] · [[Fadiga de Alertas em SOC]]
