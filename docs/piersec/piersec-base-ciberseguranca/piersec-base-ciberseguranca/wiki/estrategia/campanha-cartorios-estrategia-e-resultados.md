---
tipo: estrategia
data: 2026-10-01
tags: [ciberseguranca, cartorios, provimento-213, prospeccao, email, outbound, resultados, piersec]
---

# Campanha Cartórios (Provimento 213/243): Estratégia, Sequência de E-mails e Resultados

Campanha de prospecção por e-mail da Piersec para serventias extrajudiciais de todo o Brasil, oferecendo um diagnóstico gratuito de adequação ao Provimento CNJ 213/2026 (com a redação do 243/2026). Rodou de **25/08 a 01/10/2026**, em 27 de 27 estados. Contexto de mercado em [[mercado-cartorios-ciberseguranca]]; base legal em [[legitimo-interesse-prospeccao-b2b]].

## Premissa: lista fria, marca desconhecida

Ninguém na base conhecia a Piersec. Isso definiu o desenho inteiro:

- **Nenhum e-mail pede reunião.** Pedido grande de marca desconhecida é ignorado ou marcado como spam.
- **O primeiro e-mail apresenta a Piersec e entrega valor no mesmo fôlego.**
- **CTA principal único e constante:** o diagnóstico gratuito (autoatendimento, cerca de dois minutos, devolve PDF com o que está em conformidade e o que falta, em ordem de prioridade). CTA secundário: falar com um especialista por WhatsApp, para quem já está decidido.
- **Urgência só a real:** o cronograma do CNJ. Nada de escassez inventada.

## Como a estratégia evoluiu

| Momento | Desenho | Por que mudou |
| :-- | :-- | :-- |
| jul/2026 | 313 cartórios priorizados em blocos por classe (A: prazo vencido, B: prazo no limite, C: antecipação), mais gancho de spoofing para domínios sem DMARC | ponto de partida |
| 10/08/2026 | blocos por classe descontinuados; sequência única de 5 e-mails para toda a base | operação mais simples |
| 13/08/2026 | decisões com o cliente: assinatura pessoal do CEO, Alex Vieira; CTA secundário por WhatsApp; segmentação de envio só por região, com ritmo controlado | reputação de envio e simplicidade |
| ago/2026 | Provimento 243 recontou os prazos: não existe mais "prazo vencido"; toda a copy foi reescrita para o novo cronograma | mudança normativa |
| 24/08/2026 | base ampliada para o país inteiro (11.800 serventias); corpo do e-mail sem nenhuma variável | escala e risco de personalização errada |

**Por que o corpo não usa nome do titular nem do cartório.** O nome do titular envelhece no cadastro público (titular aposentado, serventia sob interino, escrevente lendo a caixa geral) e 6,9% dos registros nem tinham titular cadastrado; abrir com o nome errado denuncia a mala direta. Os nomes de serventia chegavam a 289 caracteres, metade em caixa alta. A saudação ficou "Olá," e o texto usa "seu cartório". A única personalização é a **cidade, no assunto**: o único dado certo para qualquer pessoa que abra, com preenchimento de 100%.

## A sequência (5 e-mails, intervalo de 2 dias úteis)

| # | Função | Ângulo | Peça |
| :-- | :-- | :-- | :-- |
| E1 | apresentação e contexto | o que mudou com os Provimentos 213 e 243 e quando vence a primeira etapa | [[cartorios-email-01-provimento-213-contexto]] |
| E2 | prova | o elo mais fraco vem de terceiros (casos FictorPay e C&M) e o Provimento cobra controle de acesso e trilha de auditoria | [[cartorios-email-02-risco-de-terceiros]] |
| E3 | cronograma | prazos por classe, Dossiê Técnico e consequência disciplinar dita sem drama | [[cartorios-email-03-cronograma-provimento-243]] |
| E4 | autoavaliação | cinco perguntas que só o titular responde | [[cartorios-email-04-checklist-do-titular]] |
| E5 | último toque | resumo em três linhas e porta aberta, sem insistir | [[cartorios-email-05-ultimo-toque]] |

**Regra de saída:** quem concluía o diagnóstico ou pedia contato saía da sequência na hora; quem não fazia nada recebia os cinco e parava. Sem recomeço automático. Recomendação para quem termina o E5 sem clicar: pausar e guardar para reabordagem futura com ângulo novo (nova mudança normativa, caso novo), em vez de nurture contínuo.

**Regras de tom:** consultivo, nunca alarmista; enquadrar sempre como lacuna a fechar, nunca como flagrante ("sem a corregedoria saber" está vetado); risco traduzido em linguagem de gestão, não em jargão técnico.

## Resultados do ciclo (25/08 a 01/10/2026)

| Indicador | Valor |
| :-- | :-- |
| Serventias na base | 11.799, 27 estados |
| E-mails enviados | 52.594 |
| Entregues | 50.813 (96,6%) |
| Aberturas únicas | 2.498 (4,9% dos entregues; inclui pré-carregamento automático) |
| Contatos únicos que clicaram | 54 (0,11% dos entregues) |
| Descadastros | 35 (0,07%) |
| Rejeição permanente (hard bounce) | 0,84% do enviado |
| Reclamação de spam | 0,026% dos entregues |
| Diagnósticos iniciados | 5 |
| Diagnósticos concluídos | 1 |
| Lead por resposta direta ao e-mail | ao menos 1 (pedido de preço, registrado em 04/09) |

Nenhum critério de parada foi atingido no ciclo. A rejeição permanente começou em "atenção" e caiu de forma contínua: **2,87% (04/09) → 1,61% (15/09) → 0,94% (25/09) → 0,84% (01/10)**, à medida que os primeiros envios limparam os endereços mortos.

**Leitura em uma frase:** a entrega e a reputação funcionaram e a mensagem não gerou rejeição (spam e descadastro muito baixos), mas a conversão foi baixa: cerca de 1 diagnóstico concluído para cada 50 mil e-mails entregues.

## O que a campanha ensinou

1. **O gargalo foi a entrada do diagnóstico, não a atração.** No primeiro lote medido em detalhe (SP, 1.516 serventias), cerca de um em cada oito leitores clicou, proporção estável entre sublotes, mas 15 cliques geraram zero conclusões. O caminho até a primeira pergunta tinha dois cliques e uma rolagem, e a segunda tela pedia dados de contato enquanto o e-mail prometia "sem cadastro longo". Promessa do e-mail e primeira tela da página precisam bater.
2. **Caixa corporativa e caixa pessoal se comportam como públicos diferentes.** No lote de SP, serventias com domínio próprio abriram 14,0% (abertura humana) e clicaram 1,95%; as de e-mail pessoal abriram 5,6% e clicaram 0,53%. Domínio próprio abre 2,5 vezes mais e clica 3,7 vezes mais, mas rejeita quase o dobro (4,18% contra 2,17%), porque caixa institucional de cartório "morre" com frequência. Não foi efeito de horário. Como 77% da base nacional é de e-mail pessoal, a média nacional caiu bem abaixo dos primeiros lotes, e comparar estados sem considerar a composição leva à conclusão errada.
3. **Quem responde é o lead mais quente e nenhum indicador automático o captura.** Uma serventia abriu nove vezes, não clicou e respondeu perguntando preço. A caixa de resposta é canal de venda e precisa de dono e prazo de resposta.
4. **Abertura não serve para decidir; clique precisa de cuidado.** Detalhes em [[metricas-email-prospeccao-fria]].
5. **Base pública tem rejeição alta no começo e cai sozinha.** Cadastro oficial mantido pelas próprias serventias traz muitos endereços desatualizados. Validar MX dos domínios antes não resolve: a rejeição é de caixa morta dentro de domínio vivo.

## Ressalvas sobre os números

- **Cliques não são comparáveis entre medições.** Até 04/09 foi contado o total de cliques (300 em 15.492 envios, 2,0%, dos quais 148 num único estado, padrão de scanner de segurança corporativo pré-clicando links). A partir de 15/09 a medição passou a ser contatos únicos que clicaram. O número de referência do ciclo é 54 contatos únicos.
- **Abertura é bruta** (inclui pré-carregamento de privacidade e scanners), salvo onde está escrito "abertura humana".
- Diagnósticos iniciados e concluídos vêm do funil comercial da Piersec em 01/10/2026; negócios fechados depois dessa data não estão aqui.
- Os números de entrega e engajamento foram medidos na plataforma de envio, agregados por estado, no fim do ciclo.

Relacionados: [[mercado-cartorios-ciberseguranca]] · [[metricas-email-prospeccao-fria]] · [[legitimo-interesse-prospeccao-b2b]] · [[regua-abm-fidc-gestoras]]
