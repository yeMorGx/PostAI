---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo SOC-007)
data: 2026-09-18
veredito: validado
validade: dado datado (fev/2026; campo de jun–jul/2025)
link: https://www.microsoft.com/en-us/security/blog/2026/02/17/unify-now-or-pay-later-new-research-exposes-the-operational-cost-of-a-fragmented-soc/
tags: [ciberseguranca, soc, mdr, fadiga-de-alertas, siem, piersec, pesquisa-propria]
---

# Fadiga de alertas em SOC: "State of the SOC: Unify Now or Pay Later" (Microsoft/Omdia, fev/2026)

Pesquisa própria da Piersec, ciclo SOC-007 da série de conteúdo SOC/MDR (18/09/2026). O tema (volume e qualidade de alerta) ainda não aparecia nas 8 semanas anteriores da série, que já tinham coberto tempo de detecção e contenção, ataques fora do horário comercial, volume de ataques na América Latina, origem da descoberta de incidentes, escassez de mão de obra e tempo de correção de vulnerabilidade.

**Estudo:** Omdia, encomendado pela Microsoft. Survey com N=300 profissionais de segurança, empresas de médio porte e grandes (750+ funcionários), Estados Unidos, Reino Unido, Austrália e Nova Zelândia. Campo de 25/06/2025 a 23/07/2025, publicação em 17/02/2026. Objeto medido: o custo operacional de SOCs fragmentados, com múltiplas ferramentas desconectadas.

## Números que passaram na triagem

Reconferidos por leitura direta do post original da Microsoft:

- **46%** dos alertas são falso-positivo.
- **42%** dos alertas nunca chegam a ser investigados.
- Analistas pivotam por **10,9 consoles** em média para reconstruir o contexto de um único incidente.
- **91%** dos líderes de segurança relataram ao menos um incidente sério de negócio no último ano, e mais da metade teve cinco ou mais.

A mesma leitura trouxe dois números adicionais que sustentam o mesmo mecanismo:

- Apenas cerca de **59%** das ferramentas empurram dado para o SIEM.
- **66%** dos SOCs perdem 20% da semana em agregação e correlação de dados.

## O que não passou na triagem

- **"Ferramenta sozinha não resolve, falta capacidade humana de triagem":** retórica de venda. O ângulo editorial é legítimo e o estudo é real, mas o que ele mede é o custo da fragmentação de ferramentas, não a eficácia de analista humano 24/7 como solução. A tese conecta com a proposta de valor do serviço de SOC/MDR e serve como argumento, sem virar afirmação sustentada pela fonte. O próprio estudo é patrocinado por um fornecedor cujo produto é a plataforma unificada, o que dá à conclusão "unifique" o mesmo estatuto.
- **Recorte de mercado:** não verificável para o Brasil e para PME. A amostra é de empresa grande em mercado maduro, e a pesquisa não oferece dado equivalente para o mercado brasileiro. Usar 46% e 42% como números do Brasil seria extrapolação.
- **Segmentação SOC interno x MDR terceirizado:** lacuna declarada. O resumo público não detalha se os 46% e os 42% separam operação própria de operação contratada, então a leitura fica no agregado.
- **Idade do campo:** os dados são de junho e julho de 2025, publicados em fevereiro de 2026 e citados em setembro de 2026.

## Por que fica

É o primeiro dado do acervo sobre volume e qualidade de alerta, e fecha uma lacuna que até aqui cobria detecção, correção e escassez de pessoal, sem tocar no que chega à mesa do analista. Síntese durável em [[Fadiga de Alertas em SOC]]; contexto de mercado em [[Panorama de Ameaças Cibernéticas 2026]].

Uso: post estático da série SOC/MDR (SOC-007, 18/09/2026), ângulo "sinal demais, atenção de menos".
