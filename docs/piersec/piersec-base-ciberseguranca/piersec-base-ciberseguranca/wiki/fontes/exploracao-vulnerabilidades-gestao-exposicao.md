---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo 015 de blog e newsletter)
data: 2026-08-31
veredito: validado
validade: dado datado (ago/2026)
tags: [ciberseguranca, vulnerabilidades, ctem, dbir, latam, piersec, pesquisa-propria]
---

# Exploração de vulnerabilidades como vetor nº 1 e o checkpoint 2026 do CTEM (ago/2026)

Pesquisa própria da Piersec (ciclo 015 de blog e newsletter), nascida de varredura de atualidade. Cruza o caso LATAM Pass com dados de mercado de 2026 para sustentar conteúdo sobre gestão contínua de exposição a vulnerabilidades. Fontes originais: Band/Estadão Conteúdo, SEGS, Verizon DBIR, watchTowr, Help Net Security, IBM, Vectra AI e 3structure.

## O caso-gancho

Em 20/08/2026 a LATAM Airlines confirmou vazamento de dados de membros do LATAM Pass (nome, nascimento, e-mail, telefone, endereço, número de associado, saldo de milhas e dados parciais de cartão), com acesso por IP externo identificado em julho/2026. Notificou a ANPD e declarou ter corrigido o "código-fonte do sistema", o que indica vulnerabilidade de aplicação, e não senha vazada ou phishing. A mesma nota afirma manter "processos contínuos de avaliação e aprimoramento" de segurança; o contraste entre o processo declarado e o incidente é o argumento. Número de afetados e falha técnica não foram divulgados.

## Números que passaram na triagem

- **Verizon DBIR 2026:** exploração de vulnerabilidades ultrapassou pela primeira vez phishing e credenciais como principal vetor de acesso inicial: 31% dos acessos (alta de 55% sobre os 20% anteriores). Time-to-patch médio subiu de 32 para 43 dias (+34%). Cross-check via watchTowr e Help Net Security.
- **IBM Cost of a Data Breach 2026:** custo médio de vazamento no Brasil é US$ 1,22 milhão, o mais baixo do estudo, atribuído pelo próprio relatório a salários menores, menos ações coletivas e sanções brandas, não a segurança melhor. Custo baixo reduz o incentivo de investir; não é sinal de maturidade.
- **Adoção de CTEM:** só 16% das organizações implementaram operacionalmente, contra 87% de líderes que reconhecem a importância, lacuna de 71 pontos. Adotantes reportam 50% mais visibilidade de superfície de ataque (estudo "The CTEM Divide", 128 profissionais, via The Hacker News, fev/2026; amostra pequena, evidência direcional).

## O que não passou na triagem

- **Previsão do Gartner (2022, horizonte 2026)** de que adotantes de CTEM teriam até 3× menos chance de violação: **não verificável**. O checkpoint de 2026 feito pela Vectra AI confirma que segue "direcionalmente sustentada, mas não validada empiricamente"; nenhum estudo público mediu taxa de violação comparando adotantes e não adotantes. O número 3× não vira afirmação, vira citação com ressalva. Revisitar quando sair estudo comparativo.
- **Causa técnica do incidente LATAM** (IDOR, autenticação quebrada, API exposta): lacuna declarada pela própria fonte, sem especulação.

## Por que fica

O "checkpoint 2026" do Gartner é a citação mais honesta disponível para conteúdo de gestão de exposição, nem hype nem descarte, e serve a qualquer ciclo futuro. Síntese durável em [[Gestão Contínua de Exposição (CTEM)]]; contexto de mercado em [[Panorama de Ameaças Cibernéticas 2026]].
