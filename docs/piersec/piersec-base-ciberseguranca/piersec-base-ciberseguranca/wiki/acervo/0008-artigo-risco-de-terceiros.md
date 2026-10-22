---
tipo: peca
formato: artigo
ciclo: "0008"
data: 2026-07-20
fonte: "[[ciclo-0008-risco-de-terceiros]]"
tags: [ciberseguranca, risco-de-terceiros, cadeia-de-suprimentos, governanca, piersec]
---

# Quando a segurança do seu fornecedor vira o seu problema

Em 2025, **22,5% de todas as violações de segurança registradas no mundo tiveram origem em um terceiro**, segundo o relatório *Ataques à cadeia de suprimentos* da Cipher, divisão de cibersegurança do Grupo Prosegur ([Revista Segurança Eletrônica](https://revistasegurancaeletronica.com.br/ciberataques-a-cadeia-de-suprimentos-dobram-no-ultimo-ano-e-geram-prejuizo-global-de-us-532-bilhoes/)). É o dobro do índice do ano anterior. O número diz algo desconfortável para quem investiu em segurança: quase um quarto dos incidentes não começou dentro da empresa atacada, começou em um fornecedor, um prestador de serviço ou uma integração de sistema conectada ao ambiente.

Esse dado reposiciona o problema. A superfície de ataque de uma organização deixou de coincidir com o seu perímetro. Ela se estende por toda a rede de parceiros que têm acesso, dados ou conexão com os sistemas internos. Este artigo trata de uma parte da exposição que a maioria dos comitês de segurança ainda mede mal: **o risco que a empresa não controla diretamente, mas herda de quem conecta ao próprio ambiente**.

## A superfície de ataque não termina no seu perímetro

A maior parte do orçamento de segurança de uma empresa protege o que ela enxerga: seus servidores, seus endpoints, seus acessos, sua rede. O ponto cego aparece quando essa mesma empresa abre portas para dezenas de fornecedores. Um sistema de folha de pagamento com integração via API. Um prestador de manutenção com credencial de acesso remoto. Uma plataforma de terceiro que armazena dados de clientes. Cada uma dessas conexões estende a superfície de ataque para dentro de uma organização que a empresa não audita, não monitora e frequentemente nem mapeia.

O relatório da Cipher registra que **os ciberataques à cadeia de suprimentos dobraram em 2025** e passaram a gerar um custo global de **US$ 53,2 bilhões por ano**. O setor manufatureiro concentrou o crescimento mais agudo, com alta de 61% no período, acompanhado de tecnologia e varejo, todos setores altamente interconectados. A lógica do atacante é simples: em vez de enfrentar a segurança madura de uma empresa grande, ele entra pelo fornecedor menor, com menos controles, que já tem uma porta aberta para dentro do alvo.

A falha de governança mais comum é tratar o fornecedor como um problema resolvido no momento da contratação. A avaliação de segurança acontece uma vez, na assinatura do contrato, e nunca mais é revisada. O acesso concedido permanece ativo por anos, mesmo depois que o projeto terminou. Ninguém mantém um inventário de quem está conectado, com qual privilégio e desde quando. A exposição se acumula em silêncio.

## O que os números revelam além do óbvio

Dois dados do relatório da Cipher, lidos juntos, contam a história completa. O primeiro é o volume: **mais de um terço das grandes empresas já foi impactado por um incidente originado na cadeia de suprimentos** ([Security Leaders](https://securityleaders.com.br/cadeia-de-suprimentos-mais-de-um-terco-das-grandes-empresas-ja-foram-impactadas/)). O segundo é o tempo: uma violação que começa em um terceiro leva, em média, **254 dias para ser detectada e contida**. São quase oito meses em que o atacante circula por um caminho que a empresa nem sabia que precisava vigiar.

Esse intervalo de detecção é o dado mais revelador. Ele mostra que o problema não é apenas a entrada pelo fornecedor, é a cegueira que se segue. A organização não monitora o comportamento das conexões de terceiros com o mesmo rigor que aplica aos próprios acessos, então o comprometimento passa despercebido por meses. Quando a empresa descobre, o dano operacional, financeiro e reputacional já está consolidado.

A distância entre organizações maduras e imaturas nesse tema é grande. A empresa madura sabe exatamente quantos terceiros têm acesso ao seu ambiente, com que nível de privilégio e por qual prazo. A imatura descobre essa lista pela primeira vez durante a investigação de um incidente. No Brasil, onde a violação média já custa **R$ 7,19 milhões** segundo o relatório Cost of a Data Breach 2025 da IBM ([ABES](https://abes.org.br/en/relatorio-da-ibm-custo-medio-de-uma-violacao-de-dados-no-brasil-atinge-r-719-milhoes/)), essa diferença de preparo se traduz diretamente em prejuízo.

## O impacto chega ao board, não fica na TI

Um incidente originado na cadeia de suprimentos atinge a organização nos mesmos pontos que qualquer outro ataque grave: interrompe a operação, expõe dados de clientes, aciona obrigações regulatórias sob a LGPD e abala a confiança do mercado. A diferença é a origem. Quando a causa raiz está em um fornecedor, a empresa ainda responde pelo dano perante seus clientes e perante a ANPD, mesmo que a falha técnica tenha acontecido fora dela. A responsabilidade pelos dados não se transfere junto com o serviço terceirizado.

O mercado brasileiro já percebeu o tamanho da exposição. Segundo o estudo global *Supply chain reaction* da Kaspersky, **76% das empresas brasileiras se dizem dispostas a investir na segurança dos próprios fornecedores** para reduzir o risco que herdam, um índice acima da média global de 69% ([Kaspersky](https://www.kaspersky.com.br/about/press-releases/crescimento-dos-ciberataques-leva-empresas-brasileiras-a-adotarem-centros-especializados-de-seguranca)). A disposição existe. O que falta na maioria das organizações é o processo que transforma essa intenção em controle real.

## Governança de terceiros é decisão da alta gestão

Transferir o risco para uma cláusula de SLA no contrato não reduz a exposição operacional da empresa. O documento protege juridicamente, mas não impede o atacante de usar o acesso do fornecedor. Organizações maduras tratam o risco de terceiros como uma disciplina contínua de governança, com dono claro na alta gestão, e a sustentam sobre três perguntas que precisam ter resposta a qualquer momento:

- **Quem está conectado ao nosso ambiente?** Um inventário vivo de todos os terceiros com acesso, dados ou integração, atualizado quando entram e quando saem.
- **Com qual privilégio e por quanto tempo?** Acesso mínimo necessário, com prazo definido e revisão periódica, sem credenciais permanentes esquecidas.
- **Estamos monitorando o comportamento dessas conexões?** Visibilidade contínua sobre o que os acessos de terceiros fazem dentro do ambiente, para reduzir os 254 dias de detecção a uma fração disso.

Essas respostas separam a empresa que atravessa um incidente de fornecedor como um evento controlado da que o descobre tarde demais. É o mesmo princípio de maturidade que vale para a segurança interna, agora aplicado à superfície estendida. Na Piersec, esse trabalho começa por dar à organização visibilidade sobre a própria exposição, incluindo o risco que ela herda de quem conecta ao ambiente.

## A pergunta que fica

A segurança de uma organização é tão forte quanto o elo mais frágil da sua cadeia. Uma empresa pode ter controle de acesso rigoroso, monitoramento contínuo e um plano de resposta bem testado, e ainda ser comprometida pela porta de um parceiro com maturidade baixa. Enquanto o risco de terceiros for tratado como assunto de contrato, e não de governança, essa porta permanece aberta. A pergunta para a alta gestão é direta: **a sua empresa sabe, agora, quantos terceiros têm acesso ao seu ambiente e o que eles estão fazendo lá dentro?**

Fichamento do ciclo: [[ciclo-0008-risco-de-terceiros]]
