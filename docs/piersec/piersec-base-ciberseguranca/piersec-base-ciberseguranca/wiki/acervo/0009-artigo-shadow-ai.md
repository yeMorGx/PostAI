---
tipo: peca
formato: artigo
ciclo: "0009"
data: 2026-07-27
fonte: "[[ciclo-0009-shadow-ai]]"
tags: [ciberseguranca, shadow-ai, inteligencia-artificial, governanca, lgpd, piersec]
---

# Shadow AI: o que acontece quando a empresa não define os processos com IA

Uma em cada cinco organizações que sofreram violação de dados tinha um fator em comum, segundo o relatório [Cost of a Data Breach, da IBM](https://www.ibm.com/reports/data-breach): o uso de inteligência artificial não sancionada, a chamada **shadow AI**. São ferramentas de IA que funcionários adotaram por conta própria, sem aprovação formal, sem supervisão da segurança e, na maioria dos casos, sem que a empresa soubesse da sua existência. O mesmo relatório calculou o preço dessa invisibilidade: violações com shadow AI como fator custam, em média, **US$ 670 mil a mais** que uma violação típica.

Enquanto boa parte das empresas brasileiras ainda discute se e como vai adotar IA generativa, os seus times já decidiram. A questão que este artigo examina é o que acontece quando essa adoção corre por fora da governança, e o que separa as organizações que transformaram o fenômeno em risco gerenciado daquelas que só vão descobri-lo no incidente.

## Quando a adoção corre à frente da governança

Shadow AI costuma nascer de boa intenção: de um funcionário produtivo que cola um contrato no ChatGPT para resumir cláusulas, de um desenvolvedor que envia código-fonte a um assistente para depurar mais rápido, de um analista comercial que sobe a lista de clientes para gerar segmentações. Cada um desses gestos envia dados corporativos, muitas vezes dados pessoais de clientes e colaboradores, para provedores externos que operam fora de qualquer contrato, política ou controle de acesso da empresa.

O relatório da IBM mostra que essa lacuna é estrutural: **63% das organizações violadas não tinham política de governança de IA**, e apenas 37% mantinham algum processo de aprovação ou supervisão sobre as ferramentas em uso. Análises do mesmo estudo, como a compilada pela [DeepStrike](https://deepstrike.io/blog/cost-of-a-data-breach), indicam que 97% dos incidentes envolvendo IA ocorreram em ambientes sem controle de acesso adequado sobre esses sistemas. O padrão se repete: a ferramenta importa menos que a ausência de processo em torno dela.

Há ainda um agravante silencioso. Muitas empresas acreditam que resolveram o tema ao bloquear os domínios mais conhecidos ou publicar um comunicado interno proibindo o uso. Pesquisas de mercado sobre comportamento de funcionários indicam que boa parte seguiria usando as ferramentas mesmo diante da proibição, migrando para o celular pessoal ou para serviços menos conhecidos. A proibição sem governança apenas transfere o uso para onde a segurança não enxerga.

## O que os números revelam

O custo adicional de US$ 670 mil por violação tem explicação operacional. Dados espalhados em ferramentas não inventariadas ampliam a **superfície de ataque** e alongam o ciclo de resposta: a equipe demora mais para descobrir o que vazou, por onde e desde quando, porque o vetor sequer constava no mapa de ativos. Detecção tardia é, historicamente, o fator que mais encarece incidentes na série do estudo da IBM.

O recorte brasileiro torna a conta mais sensível. O custo médio de uma violação de dados no Brasil alcançou **R$ 7,19 milhões**, com alta anual de 6,5%, segundo o [recorte nacional do estudo da IBM](https://inteligenciabrasil.seg.br/blog/custo-vazamento-dados-2026-impactos/). E julho de 2026 ofereceu um lembrete oportuno de como sistemas fora do radar central produzem exposição: os episódios envolvendo [iFood e Smart Fit](https://noticiassjc.com.br/vazamentos-de-dados-acendem-alerta-para-empresas-sobre-riscos-de-ciberseguranca/), com cerca de 1,2 milhão de cadastros expostos no primeiro caso e uma catraca conectada como porta de entrada no segundo, mostraram que o risco mora justamente nas plataformas de apoio que ninguém trata como críticas. Shadow AI pertence a essa mesma família: ativos reais, invisíveis ao inventário.

## O impacto além da conta do incidente

Para o negócio, as consequências se acumulam em três frentes. Na frente regulatória, a LGPD alcança o dado pessoal independentemente da ferramenta em que ele foi inserido: cliente colado em prompt de IA pública é tratamento de dado pessoal, com todos os deveres que isso implica perante a ANPD. Na frente contratual, cláusulas de confidencialidade com clientes e parceiros são violadas no momento em que a informação entra em um serviço externo não autorizado. Na frente reputacional, a empresa que descobre o vazamento pela imprensa perde a chance de conduzir a narrativa e a confiança que sustenta a relação comercial.

Para o C-level, o dado da IBM redefine a pauta. A discussão sobre adoção de IA ganhou uma etapa anterior: mapear o uso que já existe. Decidir política para uma realidade desconhecida é decidir no escuro.

## Governar antes de proibir

Organizações com maturidade de segurança tratam shadow AI como tratam qualquer exposição digital: primeiro visibilidade, depois política, depois controle contínuo. Na prática, isso significa inventariar o uso real de IA na organização, definir quais ferramentas são sancionadas e para quais categorias de dados, estabelecer controle de acesso e registro sobre esse uso, e treinar as equipes no que pode e no que compromete a empresa. A política funciona quando oferece um caminho aprovado que seja tão conveniente quanto o atalho.

Três perguntas resumem o exercício que o board deveria conduzir agora:

- **Quem já usa IA na empresa?** Inclui áreas de negócio, terceiros e ferramentas embutidas em software que o time nem percebe como IA.
- **Com quais dados?** Dado público, dado interno, dado pessoal e segredo de negócio exigem tratamentos diferentes.
- **Sob qual controle?** Política publicada, ferramenta sancionada, monitoramento contínuo e resposta definida para desvios.

Empresas que respondem bem a incidentes compartilham um traço: conheciam o próprio ambiente antes do problema. As que respondem mal costumam descobrir o ambiente durante a crise, ao custo que o relatório da IBM já quantificou.

## O que fica para o gestor

Shadow AI é o retrato atual de um padrão antigo: a tecnologia entra pela operação e a governança chega depois, quando chega. O dado novo é que agora existe preço público para esse atraso, medido em relatório de referência. A visibilidade sobre o uso real de IA virou parte da **postura de segurança** de qualquer empresa, e é o tipo de mapeamento de exposição digital que a Piersec conduz em seus diagnósticos. A pergunta que fica: se o incidente acontecesse hoje, sua empresa descobriria pela equipe de segurança ou pela imprensa?

Fichamento do ciclo: [[ciclo-0009-shadow-ai]]
