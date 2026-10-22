---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo SOC-008) sobre o IBM X-Force Threat Intelligence Index 2026
data: 2026-09-25
veredito: validado
validade: dado datado (2025/2026)
tags: [ciberseguranca, ransomware, piersec, soc, benchmark]
---

# Fragmentação do ecossistema de ransomware (X-Force 2026)

Pesquisa do ciclo SOC-008 da série de conteúdo SOC/MDR da Piersec. Fonte primária: [[IBM X-Force Threat Intelligence Index]] 2026, publicado em 02-03-2026.

## O que a fonte diz

O relatório identificou **109 grupos de extorsão e ransomware distintos em atividade em 2025**, contra 73 em 2024, alta de 49% em um ano. A leitura do relatório atribui o crescimento à fragmentação do ecossistema: operadores reutilizaram ferramentas vazadas, reciclaram playbooks prontos e trocaram de identidade para conduzir ataques oportunistas de baixo volume, em vez de operarem sob a bandeira de um grupo grande e centralizado.

Dado adicional do mesmo relatório, coletado e não usado na peça: **exploração de aplicações públicas como vetor de acesso inicial mais comum, com alta de 44% no ano**. Ângulo ainda não coberto pela série, guardado para ciclo futuro.

## Método

Os dois números (109 e 73, alta de 49%) foram conferidos em duas fontes independentes antes de entrar na peça publicada: a página oficial da IBM e uma cobertura secundária (industrialcyber.co). O cruzamento com os ciclos SOC-001 a SOC-007 confirmou que nenhum ciclo anterior tratou do número de grupos de ransomware ativos. Os ângulos anteriores cobriram tempo de detecção e contenção (IBM Cost of a Data Breach), ataques fora do horário comercial (Sophos/CrowdStrike), volume semanal de ataques na América Latina (Check Point), origem da descoberta de incidentes de ransomware (Mandiant M-Trends), consequências da escassez de profissionais (ISC2) e tempo de correção de vulnerabilidade crítica ([[Verizon DBIR]]).

## O que não passou na triagem

- **Queda de concentração dos 10 maiores grupos.** O trecho consultado não traz percentual. Fica como lacuna, não como número.
- **"Fragmentação" como explicação causal fechada.** A contagem de grupos distintos é o dado; fragmentação é a leitura que o relatório faz dela. Contagem maior de identidades também é compatível com melhora na capacidade de atribuição e com troca de nome do mesmo operador, que o próprio relatório cita. A leitura entra como interpretação do publicador, com o nome dele junto.
- **Uso do relatório como juiz neutro do setor.** A IBM vende serviços de segurança, e a conclusão de que o cenário está mais difícil é argumento comercial do publicador. Não invalida a contagem, que está declarada com metodologia e ano-base, e pede que a peça cite a origem em vez de apresentar como consenso do setor.
- **"109" como valor permanente.** Retrato do ano-calendário 2025 comparado a 2024, não tendência contínua. Reconferir contra a próxima edição do X-Force antes de reutilizar em outro ciclo.

Relacionados: [[Panorama de Ameaças Cibernéticas 2026]] · [[IBM X-Force Threat Intelligence Index]] · [[Verizon DBIR]] · [[CISA KEV]] · [[Fadiga de Alertas em SOC]]
