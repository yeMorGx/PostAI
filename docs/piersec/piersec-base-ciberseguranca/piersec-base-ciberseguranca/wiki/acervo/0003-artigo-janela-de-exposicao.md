---
tipo: peca
formato: artigo
ciclo: "0003"
data: 2026-06-30
fonte: "[[ciclo-0003-janela-de-exposicao]]"
tags: [ciberseguranca, gestao-de-exposicao, vulnerabilidades, superficie-de-ataque, piersec]
---

# Quanto tempo entre uma falha aparecer e você saber dela? O intervalo que define o risco da sua empresa

Quando uma vulnerabilidade é divulgada publicamente, começa uma corrida. De um lado, o atacante, que precisa de poucos dias para transformar a falha em acesso. Do outro, a empresa, que leva em média **32 dias** para aplicar a correção, segundo o [Data Breach Investigations Report 2025 da Verizon](https://www.verizon.com/business/resources/reports/2025-dbir-data-breach-investigations-report.pdf). Essa diferença de velocidade é a fresta por onde a maioria dos incidentes entra.

A maior parte das empresas já tem tecnologia de sobra. O que falta é cadência. Quem revisa a própria segurança uma ou duas vezes por ano opera num ritmo que não acompanha o de quem ataca. E o Brasil é, hoje, o terreno mais disputado da América Latina: o país concentra **53% de todos os incidentes de cibersegurança da região**, segundo o LATAM Threat Landscape Report 2026 da [SOCRadar](https://socradar.io/resources/report/latam-threat-landscape-report-2026/). Este artigo trata de um intervalo específico, e do que ele revela sobre a maturidade de segurança de uma organização.

## A porta de entrada mudou de lugar

Durante anos, o roubo de credencial foi o vetor dominante de invasão. Isso continua relevante, mas perdeu a exclusividade. O DBIR 2025 da Verizon registrou crescimento de **34% na exploração de vulnerabilidades** como porta de entrada, que já responde por 20% das violações analisadas e ultrapassou o phishing, com 15%. O dado importa porque muda onde a atenção precisa estar.

O alvo preferido passou a ser a borda da rede. Firewalls, concentradores de VPN e dispositivos expostos à internet concentraram a maior parte do crescimento: a participação desses equipamentos como alvo de exploração saltou de 3% para **22%** em um ano, um aumento de quase oito vezes. São justamente os ativos que ficam fora do radar das revisões internas, porque estão na fronteira entre o que a empresa controla e o que ela expõe. A Mandiant chega à mesma conclusão por outro caminho: no relatório [M-Trends 2025](https://cloud.google.com/blog/topics/threat-intelligence/m-trends-2025), exploits foram o vetor inicial de infecção em **33% das investigações de resposta a incidentes**.

## O intervalo que ninguém mede

A maioria das organizações sabe responder quantas ferramentas de segurança possui. Poucas sabem responder quanto tempo passa entre uma falha aparecer na sua superfície de ataque e alguém dentro de casa tomar conhecimento dela. Esse intervalo é o indicador que melhor prevê a gravidade de um incidente.

Os números desenham o tamanho do vão. Pelo lado da correção, a Verizon apurou que apenas **54% das vulnerabilidades de borda** foram totalmente remediadas ao longo do ano, com a mediana de 32 dias já citada. Pelo lado da detecção, o relatório [Cost of a Data Breach 2025 da IBM](https://www.ibm.com/reports/data-breach) mediu **241 dias** como tempo médio para identificar e conter uma violação, o menor patamar em nove anos e ainda assim quase oito meses. Entre o dia em que a falha fica explorável e o dia em que a empresa percebe que foi comprometida, existe um período em que o atacante opera com liberdade. Revisão anual não enxerga esse período. Monitoramento contínuo, sim.

## Por que o custo baixo do Brasil engana

Há um dado brasileiro que costuma ser lido da forma errada. Segundo a IBM, o custo médio de uma violação no Brasil é de **US$ 1,22 milhão**, o mais baixo de todo o conjunto pesquisado. Um gestor desavisado pode interpretar isso como sinal de menor exposição. É o contrário. O valor baixo reflete principalmente a penalização regulatória ainda menor, não a frequência dos ataques, que está entre as mais altas do mundo.

Essa folga tende a desaparecer. À medida que a fiscalização da LGPD amadurece e as sanções deixam de ser exceção, o componente regulatório do custo brasileiro sobe e se aproxima do padrão internacional. Quem dimensiona o risco pelo custo histórico está calibrando a decisão por um número que já começou a mudar. Pesquisas de risco corporativo confirmam a direção: os ciberataques lideram o ranking de ameaças às empresas brasileiras em 2026, e um terço das organizações já registrou perdas de pelo menos US$ 1 milhão nos últimos três anos, segundo levantamento divulgado pela [ITShow](https://itshow.com.br/ciberataques-maior-risco-empresas-brasileiras-2026/).

## O que separa quem responde bem de quem é surpreendido

A diferença entre organizações maduras e organizações expostas raramente está no tamanho do orçamento. Está na forma como tratam a visibilidade. Empresas maduras partem de três perguntas que orientam o dia a dia de segurança:

- **O que está exposto agora?** Quais ativos, serviços e dispositivos estão acessíveis pela internet neste momento, incluindo os que subiram sem passar pela revisão formal.
- **Quanto tempo até sabermos de uma mudança?** O tempo entre uma nova falha surgir na superfície de ataque e a equipe ser avisada.
- **Quanto tempo até agirmos?** O intervalo entre saber e corrigir, que define se a janela do atacante fecha em horas ou permanece aberta por semanas.

Organizações que respondem a essas três perguntas com dados, e não com suposições, conseguem encurtar a janela antes que ela seja explorada. As demais descobrem a resposta pelo incidente, quando o custo de aprender já é alto.

## Segurança como variável de continuidade do negócio

Tudo isso muda a natureza da conversa no nível executivo. Enquanto a segurança for tratada como um projeto com início, meio e fim, ela vai produzir uma fotografia que envelhece no dia seguinte. A superfície de ataque de uma empresa muda toda semana, com cada novo sistema, integração e fornecedor conectado. Uma fotografia anual não acompanha um cenário que se move em dias.

Para o board, a métrica que traduz risco digital em linguagem de negócio é o tempo. Tempo de exposição, tempo de detecção, tempo de resposta. Esses três números dizem mais sobre a resiliência de uma operação do que a lista de ferramentas contratadas. É nesse terreno que a **Piersec** atua, tratando visibilidade da superfície de ataque como processo contínuo, e não como auditoria de calendário.

## Conclusão

O atacante já não precisa de semanas de preparação. Precisa de uma falha exposta e de tempo de sobra antes que alguém perceba. Os dados de 2025 e 2026 mostram que esse tempo, no padrão da maioria das empresas, ainda é generoso demais. A pergunta que define a postura de segurança de uma organização tem a ver com tempo: quanto passa entre uma falha aparecer e a empresa saber dela. Mais do que o número de camadas de proteção contratadas, é esse intervalo que separa quem responde bem de quem é surpreendido. Quem não sabe respondê-lo com um número provavelmente já está dentro da janela.

Fichamento do ciclo: [[ciclo-0003-janela-de-exposicao]]
