---
tipo: peca
formato: artigo
ciclo: "0010"
data: 2026-08-03
fonte: "[[ciclo-0010-governanca-de-ia-agentica]]"
tags: [ciberseguranca, inteligencia-artificial, ia-agentica, governanca, identidades-nao-humanas, lgpd, piersec]
---

# A empresa vai adotar IA agêntica em dois anos. A governança acompanha esse prazo?

Noventa e cinco por cento das empresas brasileiras planejam adotar IA agêntica em até dois anos. **Vinte e sete por cento afirmam ter um modelo de governança maduro para acompanhar essa adoção.** Os dois números vêm do mesmo levantamento, a edição 2026 do [State of AI in the Enterprise, da Deloitte](https://www.deloitte.com/br/pt/about/press-room/state-of-ai-2026.html), que ouviu 3.235 líderes de negócios e tecnologia em 24 países, incluindo 115 brasileiros.

A distância entre esses dois percentuais descreve a conversa que hoje ocupa a maior parte dos times de tecnologia e segurança das empresas brasileiras. A decisão de adotar IA foi tomada, tem prazo e tem patrocínio executivo. A estrutura para governar o que essas ferramentas acessam ainda está sendo construída, geralmente depois que o acesso já foi concedido. Este artigo trata do que precisa estar de pé antes de ampliar a adoção, e de por que o controle de acesso ocupa o centro dessa discussão.

## A decisão já foi tomada em outra sala

O padrão se repete em empresas de portes e setores diferentes. A diretoria define que a companhia precisa operar com IA, estabelece um prazo curto, e a área de tecnologia recebe a tarefa de viabilizar. O time de segurança entra na conversa depois, quando a ferramenta já foi contratada e as primeiras integrações estão em produção. O gestor que levanta a questão do controle costuma ser lido como obstáculo ao projeto.

Os dados brasileiros ajudam a dimensionar a velocidade. Segundo a [pesquisa TIC Empresas 2025, do Cetic.br](https://cetic.br/pt/noticia/uso-de-inteligencia-artificial-por-empresas-brasileiras-avanca-e-atinge-17-aponta-pesquisa-do-cetic-br/), divulgada em junho de 2026, a adoção de IA entre as grandes empresas brasileiras **saltou de 38% para 50% em um único ano**. O mesmo estudo mostra como essa adoção acontece: 80% das empresas adquiriram software pronto para uso e 60% contrataram fornecedores externos para desenvolver ou adaptar soluções. Na prática, boa parte das decisões de arquitetura e de acesso a dados chega embutida em produtos de terceiros.

A pressão por escala completa o quadro. O levantamento da Deloitte aponta que 82% das organizações brasileiras já liberam o uso de IA para pelo menos 20% de seus profissionais, enquanto **58% conseguiram implementar no máximo 20% de seus projetos piloto**. A cobrança executiva dos próximos trimestres será justamente por converter piloto em operação. Cada projeto que sai do piloto amplia acessos, integrações e volume de dados em circulação.

## O risco se concentra no acesso concedido

A discussão sobre segurança em IA costuma girar em torno de qual modelo usar e de onde os dados são processados. Os números apontam para outro lugar. O [2026 CISO AI Risk Report](https://itforum.com.br/noticias/identidades-ia-ja-tem-acesso-critico-empresas/), da Cybersecurity Insiders, que ouviu 235 CISOs, CIOs e líderes seniores de segurança nos Estados Unidos e no Reino Unido, mostra que **71% das organizações já permitem que sistemas de IA acessem aplicações centrais do negócio, como CRM e ERP. Apenas 16% afirmam governar esse acesso de forma eficaz.**

A lacuna de visibilidade é ainda mais larga. O mesmo estudo indica que 92% das empresas não têm visão completa das identidades de IA em operação e 95% duvidam que conseguiriam detectar ou conter um uso indevido. Apenas 5% se consideram preparadas para conter um agente de IA comprometido. Há também um problema de instrumento: 60% das organizações ainda tentam gerenciar identidades de IA com modelos pensados para pessoas, baseados em login, sessão e senha, quando esses agentes exigem controle por API, limitação de escopo, gestão de tokens e fiscalização em tempo de execução.

O diagnóstico converge com o que o Gartner colocou entre os seis temas que definem a cibersegurança em 2026. Em [análise publicada pelo Security Leaders](https://securityleaders.com.br/ia-agentica-coloca-gestao-de-identidades-no-centro-do-risco-cibernetico-em-2026/), Oscar Isaka, analista diretor sênior da consultoria, observa que gerenciar acessos de máquina duplica a complexidade da gestão de identidades, especialmente em ambientes de nuvem, e que a própria definição de quem responde por esse tipo de acesso ainda é uma dúvida aberta nas organizações.

## O que isso significa para o negócio

Um agente com credencial válida e escopo amplo se comporta como um funcionário sênior que nunca tira férias, opera em velocidade de máquina e não aparece nos relatórios de acesso. Quando algo dá errado, a empresa precisa responder três perguntas em pouco tempo: o que foi acessado, por qual autorização e desde quando. Sem inventário, essa resposta demora, e a demora é o fator que mais encarece qualquer incidente.

Há ainda o componente regulatório. A LGPD alcança o dado pessoal independentemente da tecnologia que o processou, e a ANPD passou a operar como agência reguladora em 2026, com estrutura ampliada de fiscalização. A responsabilidade pelo tratamento permanece com a empresa contratante, mesmo quando o processamento acontece dentro de uma ferramenta de terceiro. Para o board, isso posiciona a governança de IA no mesmo patamar de qualquer decisão que gere exposição contratual e regulatória.

## A sequência que permite dizer sim com controle

Travar a adoção raramente é uma opção disponível ao gestor de tecnologia. O caminho praticável é transformar o mandato de IA em um programa com etapas verificáveis. Os próprios líderes de segurança ouvidos pela Cybersecurity Insiders indicam por onde começar: **73% investiriam primeiro em descoberta e inventário de identidades de workloads e APIs, e 68% em monitoramento contínuo**. A ordem que organizações mais maduras seguem é consistente:

- **Inventário antes de política.** Levantar quais ferramentas e agentes já operam, com quais credenciais e sobre quais bases de dados. Política escrita sobre um ambiente desconhecido não produz controle.
- **Escopo definido por agente.** Cada agente recebe limites explícitos de sistema, dado e ação, com privilégio mínimo e prazo de validade, mais um critério claro de quando um limite foi violado.
- **Dono nomeado.** Toda identidade de IA tem um responsável humano que aprova, revisa e responde por ela, do mesmo modo que se faz com contas privilegiadas.
- **Monitoramento contínuo e revogação automática.** Acompanhar comportamento em tempo de execução e retirar acesso que perdeu propósito, sem depender de revisão manual trimestral.

Para as empresas que precisam demonstrar essa estrutura a clientes, auditores ou reguladores, a [ISO/IEC 42001](https://www.iso.org/standard/42001) oferece um sistema de gestão de IA auditável, com papéis, avaliação de risco e ciclo de melhoria já formalizados. O Gartner recomenda uma abordagem baseada em risco, investindo onde as lacunas são maiores e automatizando o que for possível, de modo a permitir inovação sem abrir mão do controle sobre ativos críticos.

## O argumento que o board entende

A pressão por adoção de IA continuará crescendo, e ela tem razões legítimas de negócio. O que muda a conversa é a capacidade de o gestor de tecnologia chegar à mesa com um plano executável. **Quando a resposta é "sim, nesta ordem, com estes controles e neste prazo", o time de segurança passa a ocupar a posição de quem sustenta o cronograma de adoção.**

Vale começar pela pergunta mais simples e mais desconfortável: quantas identidades de IA operam hoje na sua empresa, o que cada uma acessa e quem autorizou. Se a resposta exigir uma semana de apuração, o inventário é o primeiro projeto, e ele precede qualquer decisão sobre ferramenta. Na Piersec, esse mapeamento de exposição é o ponto de partida de qualquer diagnóstico de maturidade.

Fichamento do ciclo: [[ciclo-0010-governanca-de-ia-agentica]]
