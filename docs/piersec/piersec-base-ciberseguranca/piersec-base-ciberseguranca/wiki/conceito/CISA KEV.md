---
tipo: conceito
criado: 2026-09-17
fontes:
  - "[[dbir-2026-janela-correcao-vulnerabilidade]]"
tags: [ciberseguranca, vulnerabilidades, cisa, kev, piersec]
---

# CISA KEV

O catálogo Known Exploited Vulnerabilities, mantido pela CISA (agência de cibersegurança dos Estados Unidos), lista as vulnerabilidades com exploração ativa comprovada. Ele existe para resolver um problema de priorização: o volume de CVEs publicadas por ano é grande o bastante para inviabilizar correção completa, e o KEV separa o subconjunto que atacantes estão usando de fato.

**Por que importa como argumento.** Uma vulnerabilidade no KEV não é risco teórico, é risco em uso. Isso torna a taxa de correção do catálogo uma métrica de disciplina de defesa mais honesta que qualquer contagem geral de patches aplicados.

**O número que sustenta a tese comercial.** Segundo o [[Verizon DBIR]] 2026, apenas 26% das vulnerabilidades do KEV foram totalmente corrigidas pelas organizações em 2025, contra 38% no ano anterior. Três quartos do que se sabe estar sendo explorado seguiu aberto, e a proporção piorou. Combinado com a mediana de 43 dias para resolução completa de vulnerabilidade crítica, é o dado que define a janela de exposição usada em [[Gestão Contínua de Exposição (CTEM)]].

Relacionados: [[Verizon DBIR]] · [[Gestão Contínua de Exposição (CTEM)]] · [[Panorama de Ameaças Cibernéticas 2026]] · [[dbir-2026-janela-correcao-vulnerabilidade]]
