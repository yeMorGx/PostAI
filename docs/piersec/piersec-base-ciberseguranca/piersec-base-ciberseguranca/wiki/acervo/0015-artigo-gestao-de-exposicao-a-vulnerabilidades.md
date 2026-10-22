---
tipo: peca
formato: artigo
ciclo: "0015"
data: 2026-08-31
fonte: "[[exploracao-vulnerabilidades-gestao-exposicao]]"
tags: [ciberseguranca, vulnerabilidades, ctem, gestao-de-exposicao, dbir, lgpd, piersec]
---

# Por que empresas com processos de segurança continuam vazando dados

Em 20 de agosto de 2026, a LATAM Airlines confirmou que um endereço IP externo acessou e consultou dados pessoais de uma parcela dos membros do programa de fidelidade LATAM Pass. Nome completo, data de nascimento, e-mail, telefone, endereço, saldo de milhas e dados parciais de cartão de crédito estavam entre as informações expostas. A companhia notificou a [Autoridade Nacional de Proteção de Dados (ANPD)](https://www.band.com.br/nacional/brasil/latam-confirma-vazamento-de-dados-de-clientes-e-aciona-anpd), bloqueou os endereços suspeitos e corrigiu o código-fonte do sistema que permitiu o acesso.

Na mesma nota em que reconheceu o incidente, a LATAM afirmou manter **"processos contínuos de avaliação e aprimoramento de seus sistemas e controles de proteção de dados"**. A frase não é incomum. É o que praticamente toda empresa de médio e grande porte diz sobre a própria segurança. O que o caso LATAM expõe, além dos dados dos clientes, é a distância entre dizer que um processo é contínuo e operá-lo de fato como tal. Essa distância tem nome, tem dado que a mede, e é ela que decide quem aparece na próxima notícia de vazamento.

## O Problema Que a LATAM Só Descobriu Depois

A LATAM não divulgou como o acesso não autorizado ocorreu tecnicamente, mas o desfecho é revelador: a empresa precisou corrigir o código-fonte do sistema depois de identificar o problema, não antes. Essa sequência, encontrar a falha só depois que ela já foi explorada, deixou de ser exceção no cenário de 2026.

Segundo o [Data Breach Investigations Report (DBIR) 2026 da Verizon](https://www.verizon.com/business/resources/reports/dbir/), a exploração de vulnerabilidades ultrapassou, pela primeira vez na história do relatório, o phishing e o uso indevido de credenciais como principal vetor de acesso inicial em incidentes de segurança. Ela já responde por **31% dos acessos iniciais** registrados, um salto de 55% em relação ao ano anterior, quando respondia por 20%. O motivo não é a falta de ferramentas de varredura. É a velocidade com que uma falha conhecida vira uma exposição explorável, muitas vezes antes de a organização terminar de avaliar o risco que ela representa.

Grande parte das empresas de médio e grande porte já tem algum programa de identificação de vulnerabilidades: scans periódicos, pentests anuais, ferramentas de gestão de patch. O problema raramente está na ausência desses controles. Está no intervalo entre o momento em que uma vulnerabilidade é descoberta e o momento em que ela é corrigida, um intervalo que, segundo o mesmo relatório, está crescendo, não encolhendo. Esse intervalo é onde vive a superfície de ataque real de qualquer organização: as ferramentas continuam apontando falhas, mas falta um processo que decida, entre milhares de alertas, quais delas um atacante conseguiria explorar amanhã.

## O Que os Números de 2026 Revelam

O tempo médio para corrigir uma vulnerabilidade, o chamado *time-to-patch*, subiu de 32 para **43 dias em um ano, alta de 34%**, segundo o mesmo DBIR 2026. É um dado revelador: enquanto os atacantes aceleram, adaptando técnicas de exploração em questão de horas, as organizações estão levando mais tempo para fechar as portas que já sabem estarem abertas.

O recorte brasileiro adiciona uma camada de risco pouco discutida. O relatório [Cost of a Data Breach 2026, da IBM](https://www.ibm.com/reports/data-breach), mostra que o custo médio de um vazamento de dados no Brasil é de **US$ 1,22 milhão por incidente**, o valor mais baixo entre todos os países do estudo. O próprio relatório atribui esse número a salários menores, menos ações judiciais coletivas e sanções regulatórias ainda brandas no país, não a uma segurança mais eficaz. Para o board brasileiro, esse dado deveria soar como alerta, e não como alívio: a conta mais barata reduz a pressão de curto prazo para investir, exatamente no momento em que o vetor de ataque mais comum já é conhecido e mapeável.

Organizações maduras em segurança tratam essa lacuna como métrica operacional, acompanhada semana a semana. Organizações menos maduras a tratam como item de auditoria anual, revisado quando já é tarde para agir sobre ela.

## O Que Está em Jogo Para o Negócio

Para uma empresa como a LATAM, o episódio significa custo de contenção, comunicação obrigatória a clientes e à ANPD, e o risco reputacional de ver o próprio nome associado a uma falha que ela dizia prevenir. Para qualquer outra empresa que armazena dados de clientes, seja em milhas, contratos ou prontuários, o risco é o mesmo, ajustado à escala do negócio.

A Lei Geral de Proteção de Dados não pune automaticamente uma empresa por sofrer um incidente. O artigo 44 da LGPD trata como irregular o tratamento de dados que não oferece a segurança que o titular pode legitimamente esperar, e o artigo 46 exige medidas técnicas e administrativas capazes de proteger os dados contra acesso não autorizado. A diferença entre uma empresa que responde bem a um incidente e uma que enfrenta sanção está, em grande parte, na capacidade de demonstrar que o processo de segurança era, de fato, contínuo, não apenas declarado.

Essa é uma decisão que já não cabe só à área de TI. É uma decisão de continuidade operacional e de exposição regulatória que pertence ao board.

## Da Auditoria Pontual à Gestão Contínua

Em 2022, o Gartner previu que organizações capazes de priorizar vulnerabilidades a partir de um programa contínuo de gestão de exposição, o que a indústria chama de CTEM, teriam até **três vezes menos chance de sofrer uma violação até 2026**. É uma meta, não um resultado fechado, e ainda não existe estudo público que confirme o número agora que o horizonte da previsão chegou. Mas a lógica por trás dela resiste à comprovação: uma vulnerabilidade descoberta e ignorada por 43 dias não é um problema técnico. É uma decisão de risco que alguém, em algum nível da organização, tomou sem perceber que estava tomando.

Organizações maduras tratam a superfície de ataque como algo que muda todo dia, porque muda mesmo: novos sistemas entram em produção, fornecedores mudam, colaboradores trocam de função e de acesso. Segurança contínua, nesse contexto, deixa de ser um conjunto de ferramentas instaladas e passa a ser um processo de decisão constante sobre o que corrigir primeiro, com base no que pode ser explorado agora, não no que aparece mais alto num relatório trimestral.

O vazamento da LATAM não deveria ser lido como um caso isolado de uma companhia aérea. Deveria ser lido como o retrato mais recente de um padrão que o DBIR 2026 já havia descrito em números: a exploração de vulnerabilidades é hoje o caminho mais comum para dentro de qualquer organização, e o tempo que as empresas levam para fechar essas portas está aumentando, não diminuindo.

A pergunta que fica para qualquer gestor não é mais se a empresa tem um programa de segurança. É se esse programa sabe, agora, quais das vulnerabilidades conhecidas um atacante conseguiria explorar hoje, e se alguém está agindo sobre essa resposta antes que ela vire a próxima notícia.

Fichamento do ciclo: [[exploracao-vulnerabilidades-gestao-exposicao]]
