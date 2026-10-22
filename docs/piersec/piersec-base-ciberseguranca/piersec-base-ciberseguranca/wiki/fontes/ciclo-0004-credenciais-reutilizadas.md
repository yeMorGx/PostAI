---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo 0004)
data: 2026-07-01
veredito: parcial
validade: dado datado (jul/2026)
tags: [ciberseguranca, credenciais, credential-stuffing, identidade, mfa, dbir, piersec]
---

# Credenciais Reutilizadas como Vetor de Entrada nº 1: o Caso Defesa Civil (ciclo 0004, jul/2026)

Pesquisa de 01/07/2026. O gancho é a invasão do sistema "Defesa Civil Alerta" em 20/06/2026, feita por credential stuffing (credenciais vazadas em incidentes anteriores testadas em massa), sem nenhuma técnica sofisticada. O ângulo: o vetor de risco saiu do perímetro e foi para a identidade, e a maioria das empresas médias e grandes tem as mesmas lacunas do caso (sem MFA, sem rotação de acesso, sem monitoramento de uso anômalo de credencial). O ciclo teve duas versões das peças; vale a final.

## Números que passaram na triagem

- **Ataque à Defesa Civil: cerca de dez alertas falsos ("misantropia") para aproximadamente 30 milhões de pessoas em sete estados e no DF; falhas apontadas: sem MFA, sem rotação de credenciais para cerca de 600 usuários, sem monitoramento de anomalias.** TI Inside e Itshow (23/06/2026), confirmado também por Gazeta do Povo e Agência Brasil.
- **Violação iniciada por credencial comprometida custa em média US$ 4,67 milhões e leva cerca de 246 dias para ser identificada e contida; custo médio global US$ 4,44 milhões.** IBM, Cost of a Data Breach 2025.
- **América Latina é a região mais atacada do mundo: cerca de 3.149 ataques semanais por organização (mai/2026), +53% em um ano.** Check Point Research, via Dark Reading.
- **Brasil concentra cerca de 46,9% dos ataques de ransomware da América Latina.** SOCRadar, LATAM Cyber Threat Landscape 2026.

## O que não passou na triagem / ressalvas

- **Números do Verizon DBIR por análise de terceiros.** "88% dos ataques básicos a aplicações web envolvem credenciais roubadas" e "cerca de 4 em cada 10 usuários corporativos reutilizaram senha já exposta" vieram de resenhas de fornecedores (Push Security, SpyCloud), não do PDF. A própria pesquisa registra que esses números variam entre as edições 2025 e 2026 do DBIR e que foram usados de forma conservadora.
- **"73% das vítimas de ransomware tiveram infecção por infostealer ou vazamento de credenciais no ano anterior"** é análise da SpyCloud sobre o DBIR 2026, não número do relatório.
- **Mudança na edição 2026.** O DBIR 2026 rebaixou o abuso de credenciais para 13% do acesso inicial, atrás da exploração de vulnerabilidades (31%): ver [[dbir-2026-janela-correcao-vulnerabilidade]]. A frase "vetor de entrada nº 1" deste ciclo não deve ser reusada sem essa ressalva.
- SOCRadar é relatório de fornecedor; usar com atribuição.

## Peças publicadas

- [[0004-artigo-credenciais-reutilizadas]]
- [[0004-newsletter-credenciais-reutilizadas]]
- [[0004-linkedin-credenciais-reutilizadas]]
- [[0004-instagram-credenciais-reutilizadas]]

Relacionados: [[Verizon DBIR]] · [[Identidades Não Humanas]] · [[Panorama de Ameaças Cibernéticas 2026]] · [[acervo-pesquisa-piersec]]
