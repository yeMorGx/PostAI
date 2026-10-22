---
tipo: conceito
criado: 2026-09-19
fontes:
  - "[[soc-fadiga-alertas-microsoft-omdia-2026]]"
tags: [ciberseguranca, soc, mdr, fadiga-de-alertas, siem, triagem, piersec]
validade: dado de campo de 2025, publicado em fev/2026
---

# Fadiga de Alertas em SOC

Fadiga de alertas é o estado em que o volume de sinal que chega a um Security Operations Center passa da capacidade de triagem, e a consequência deixa de ser cansaço e passa a ser alerta não investigado. O mecanismo tem duas partes que se somam: a proporção de ruído no que chega, e o custo de reconstruir contexto para cada item que alguém decide olhar.

## O que está medido

Levantamento da Omdia encomendado pela Microsoft (N=300, empresas de 750+ funcionários nos EUA, Reino Unido, Austrália e Nova Zelândia, campo em jun–jul/2025, publicado em fev/2026):

- 46% dos alertas são falso-positivo, e 42% nunca chegam a ser investigados.
- Analistas pivotam por 10,9 consoles em média para reconstruir o contexto de um incidente.
- Só cerca de 59% das ferramentas empurram dado para o SIEM, e 66% dos SOCs perdem 20% da semana em agregação e correlação.
- 91% dos líderes relataram ao menos um incidente sério de negócio no ano, mais da metade com cinco ou mais.

Números e ressalvas em [[soc-fadiga-alertas-microsoft-omdia-2026]].

## Mecanismo

A fragmentação de ferramentas é a causa que aparece medida. Cada produto de segurança gera fila própria, e quase metade dessas filas não chega ao SIEM, então o contexto de um incidente fica espalhado por consoles que ninguém correlaciona automaticamente. O analista paga esse custo por item, e o custo por item é o que fixa quantos itens cabem no dia. O resto da fila fica sem triagem, e a proporção alta de falso-positivo garante que a fila seja em boa parte ruído, o que corrói a disposição de investigar o próximo item.

Quando a lista supera a capacidade de atendimento, a ordem em que os itens aparecem decide o que é atendido, e o que fica para trás não emite sintoma próprio. Vale para SOC e vale para qualquer fila humana alimentada por sinalização automática.

## Limites de leitura

O dado é de empresa grande em mercado maduro e não se transporta para o Brasil nem para PME sem outra fonte. O estudo não separa publicamente SOC interno de MDR terceirizado nos percentuais, então os 46% e os 42% valem no agregado. E o patrocinador vende plataforma unificada, o que dá à conclusão "unifique as ferramentas" o estatuto de argumento do fornecedor, não de achado independente. A fragmentação está medida; o remédio, não.

Relacionados: [[Panorama de Ameaças Cibernéticas 2026]] · [[Gestão Contínua de Exposição (CTEM)]] · [[Identidades Não Humanas]] · [[Verizon DBIR]]
