---
tipo: estrategia
data: 2026-08-10
tags: [fidc, gestoras, credito-estruturado, abm, outbound, email, linkedin, prospeccao, piersec]
---

# Régua ABM para Gestoras de FIDC e Casas de Crédito: Estratégia e Modelo dos 3 Toques

Desenho de abordagem 1:1 da Piersec para gestoras de crédito estruturado, FIDCs e casas de situações especiais, fechado em agosto de 2026. Mesma lógica de fundo da campanha de cartórios ([[campanha-cartorios-estrategia-e-resultados]]: lista fria, prova antes de pedir reunião, CTA de baixo atrito), adaptada a um público pequeno e sofisticado. Contexto de mercado em [[mercado-fidc-e-gestoras-ciberseguranca]].

**Status:** modelo pronto, com campos a preencher. Não há registro de envio nem de resultado; tratar como hipótese, não como prática validada.

## Por que é diferente da frente de cartórios

| | Cartórios | Gestoras de crédito |
| :-- | :-- | :-- |
| Volume | milhares, mesma copy para a base | dezenas por mês, qualificadas |
| Método | sequência automática | outbound comercial 1:1, enviado à mão pelo comercial |
| Canais | e-mail | e-mail e LinkedIn do decisor, no mesmo dia |
| Toques | 5 | 3 |
| Personalização | só cidade no assunto | porte e segmento reais da gestora |
| CTA | diagnóstico primeiro, contato como alternativa | os dois desde o primeiro toque: o decisor decide rápido se vale conversar |

## Segmentação

- **Tier 1:** pares diretos do perfil-alvo (crédito estruturado e special situations), com contato e decisor identificados. Primeira leva.
- **Tier 2:** demais gestoras de grande e médio porte, excluídos bancos e DTVMs; entram conforme o decisor é identificado.
- **Corte transversal:** quando checagem pública mostrar domínio sem SPF/DMARC, abrir o primeiro toque pelo achado técnico.

## Cadência e ângulos

| Toque | Quando | Ângulo |
| :-- | :-- | :-- |
| 1 | D0 | risco de fornecedor, com casos reais |
| 2 | +2 dias úteis | obrigação regulatória (CVM 175, CMN 4.893): segurança como item de auditoria e due diligence |
| 3 | +2 dias úteis | oferta direta do diagnóstico e fechamento sem pressão |

Máximo de três toques por conta; depois, pausa. Uma versão anterior usava intervalos de 4 e 5 dias e foi encurtada para o mesmo ritmo da régua de cartórios.

**Sinais que tiram a conta da régua e viram conversa:** resposta ao e-mail (mesmo "me conta mais"), resposta no LinkedIn após aceitar a conexão, clique no diagnóstico. **Métrica que mais importa:** reunião agendada, dado o ticket. Acompanhar também resposta por toque, aceite de conexão e cliques. Registrar cada toque e resposta em CRM.

**Tom:** consultivo, enquadrado como lacuna, nunca como flagrante ("sem o board saber" está vetado). Pode usar o vocabulário de CVM e CMN sem simplificar demais.

## Modelo dos 3 toques

Campos a preencher: `[Nome do decisor]`, `[Nome da gestora]`, `[Nome do remetente]`, `[LINK DIAGNÓSTICO]`, `[LINK FALAR COM EQUIPE]`. Rodapé em todos os e-mails: identificação da Piersec com CNPJ, declaração de que o contato usa dado público de identificação da empresa para prospecção de serviço relevante à gestão de crédito, e link de descadastro (ver [[legitimo-interesse-prospeccao-b2b]]).

### Toque 1: risco de fornecedor

**Assunto (testar):** "Sobre a segurança de fornecedor da [Nome da gestora]" ou "Um risco que não aparece no seu radar de crédito".

> Olá [Nome do decisor],
>
> Sou [Nome do remetente], da Piersec, cibersegurança focada em gestoras de crédito e special situations.
>
> Em outubro de 2025, a FictorPay teve uma credencial de um sistema terceirizado vazada, e o prejuízo passou de R$26 milhões. Meses antes, a C&M Software sofreu um ataque que impactou operações ligadas a mais de R$500 milhões. Em nenhum dos dois casos a falha começou dentro da própria operação, começou em um fornecedor ou sistema terceiro.
>
> Para uma gestora como a [Nome da gestora], esse tipo de exposição pesa duas vezes: no risco operacional e na confiança de quem cede carteira ou investe no fundo.
>
> Preparamos um diagnóstico gratuito de exposição técnica e de governança em segurança, direcionado a gestoras de crédito. Leva poucos minutos e devolve um relatório objetivo.
>
> [Fazer o diagnóstico gratuito] · [Falar com a equipe da Piersec]

**LinkedIn (conexão, mesmo dia):** "Olá [Nome do decisor], tudo bem? Trabalho com cibersegurança focada em gestoras de crédito e special situations na Piersec. Te mandei um e-mail agora com um caso real que acho relevante pro seu contexto. Vamos nos conectar?"

### Toque 2: obrigação regulatória

**Assunto:** "CVM 175 e a integridade do dado de crédito na [Nome da gestora]".

> Olá [Nome do decisor],
>
> Retomando o contato: a CVM 175, no Anexo II, trata a integridade e a titularidade do dado de crédito como responsabilidade direta da gestora, não como algo terceirizável sem controle. Some a isso a CMN 4.893, que cobra política formal de segurança da informação de instituições financeiras e equiparadas.
>
> Na prática, segurança da informação deixou de ser "boa prática" e virou item de auditoria e de due diligence de investidor.
>
> O diagnóstico que mencionei mostra onde a [Nome da gestora] está hoje em relação a esses pontos, com prioridade do que resolver primeiro.
>
> [Fazer o diagnóstico gratuito] · [Falar com a equipe da Piersec]

**LinkedIn (se aceitou):** "[Nome do decisor], te mandei mais um e-mail hoje, dessa vez sobre CVM 175 e CMN 4.893. Isso tem entrado cada vez mais nas conversas de due diligence com investidor. Faz sentido pra vocês?"

### Toque 3: oferta direta

**Assunto:** "Fecho por aqui: diagnóstico gratuito pra [Nome da gestora]".

> Olá [Nome do decisor],
>
> Esse é meu último contato por enquanto. Resumindo: risco de fornecedor é real e mensurável (casos C&M e FictorPay), e virou também item formal de compliance (CVM 175, CMN 4.893).
>
> O diagnóstico gratuito responde, em poucos minutos, onde a [Nome da gestora] está hoje nos dois pontos.
>
> [Fazer o diagnóstico gratuito]
>
> Se não for o momento, sem problema. Fico à disposição quando fizer sentido.

**LinkedIn (final):** "[Nome do decisor], esse é meu último toque por aqui. Deixo o link do diagnóstico gratuito disponível. Qualquer coisa, sigo à disposição."

### Variações

- **Tier 2:** trocar a apresentação por "cibersegurança focada no mercado de crédito estruturado e recebíveis", para não citar special situations a quem não é desse subsegmento.
- **Domínio sem DMARC:** abrir o toque 1 com "Rodamos uma checagem pública no domínio da [Nome da gestora] e identificamos ausência de proteção DMARC. Isso significa que qualquer pessoa pode enviar e-mails se passando pela empresa."

## Ressalvas

- No modelo original o caso C&M aparecia como "ataque de ransomware"; aqui ficou "ataque", porque o vetor não foi conferido em fonte primária (ver [[mercado-fidc-e-gestoras-ciberseguranca]]).
- Ficou em aberto se os nomes FictorPay e C&M deveriam ser citados diretamente a esse público (que pode conhecer os casos) ou mantidos genéricos.

Relacionados: [[mercado-fidc-e-gestoras-ciberseguranca]] · [[campanha-cartorios-estrategia-e-resultados]] · [[legitimo-interesse-prospeccao-b2b]] · [[0008-artigo-risco-de-terceiros]]
