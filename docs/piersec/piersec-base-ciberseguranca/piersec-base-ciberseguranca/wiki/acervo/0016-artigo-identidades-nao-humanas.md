---
tipo: peca
formato: artigo
ciclo: "0016"
data: 2026-09-13
fonte: "[[identidades-nao-humanas-lacuna-monitoramento]]"
tags: [ciberseguranca, identidades-nao-humanas, identidade, inteligencia-artificial, governanca, piersec]
---

# O dado que os gestores de segurança precisam ver sobre identidades não humanas

Contas de serviço, chaves de API, tokens de automação e agentes de IA já respondem por 31% dos pontos de entrada usados por atacantes nas empresas, contra 17% de phishing e engenharia social, segundo o [2026 Identity Threat Report](https://www.globenewswire.com/news-release/2026/09/09/3358565/0/en/spycloud-2026-identity-threat-report-finds-non-human-identities-are-now-the-leading-path-into-the-enterprise.html) da SpyCloud, divulgado em setembro. O dado inverte uma hierarquia de risco que orientou anos de investimento em segurança corporativa, concentrado em treinamento de usuário e filtro de e-mail. Enquanto isso, o tipo de credencial que mais cresce como vetor de ataque é também o que recebe menos atenção estruturada dentro das organizações.

A mesma pesquisa revela algo mais incômodo do que a simples existência dessas identidades: a distância entre o que os líderes de segurança acreditam saber sobre elas e o que de fato monitoram. Essa lacuna de confiança é o problema real, mais determinante do que a tecnologia em si. Este artigo mostra por que ela se formou, o que os números indicam sobre maturidade de governança, e por que o Brasil está mais exposto à velocidade dessa mudança do que a média global.

## O ativo que ninguém audita

Identidades de máquina não são um fenômeno novo. O que mudou é a escala e o ritmo de criação. Segundo o relatório [2025 Identity Security Landscape](https://www.cyberark.com/press/machine-identities-outnumber-humans-by-more-than-80-to-1-new-report-exposes-the-exponential-threats-of-fragmented-identity-security/) da CyberArk, identidades de máquina já superam as humanas na proporção de 82 para 1 dentro das empresas. Cada integração nova, cada automação e cada agente de IA conectado a um sistema interno cria uma ou mais credenciais que precisam de dono, prazo de validade e monitoramento contínuo. Na prática, a maioria não recebe nenhum dos três.

O excesso de confiança em ferramentas automatizadas agrava o quadro. Ainda segundo a SpyCloud, 91% das organizações já usam ferramentas ou agentes de IA com acesso a sistemas internos, mas apenas 56% têm governança formal sobre esses privilégios. A diferença entre os dois números é onde o risco se acumula: adoção acelerada, controle que não acompanha o ritmo. O resultado aparece nos incidentes. O mau uso de identidade não humana já é o tipo de evento de identidade mais reportado, presente em 42% dos casos, e 68% das organizações pesquisadas sofreram algum evento de identidade no período analisado, com média de oito eventos cada.

Nada disso depende de um ataque sofisticado. A maior parte dessas identidades problemáticas nasce de decisões operacionais adiadas: a conta de serviço que ninguém desativa quando o projeto termina, a chave de API que nunca é rotacionada porque rotacionar quebraria uma integração mal documentada, o token sem dono definido porque a pessoa que o criou já não está na empresa. É gestão básica de ciclo de vida de credencial, comum a qualquer sistema conectado, com ou sem inteligência artificial envolvida.

## O que os números escondem

O dado mais revelador da pesquisa da SpyCloud está na percepção dos próprios líderes de segurança. **95% das organizações acreditam ter visibilidade adequada** sobre exposições de identidade de máquina e IA. Na prática, **apenas 36% de fato monitoram** essas identidades de forma contínua. A distância entre os dois números mede exatamente a lacuna de confiança que dá título a este artigo: a suposição de que já existe controle onde, na verdade, ele não existe.

Organizações maduras tratam essa lacuna como métrica operacional: acompanham quantas identidades não humanas existem, quantas têm dono definido, e há quanto tempo cada credencial foi rotacionada pela última vez. Organizações imaturas seguem operando com a crença de visibilidade adequada, o que é mais perigoso do que admitir a lacuna, porque remove a pressão para investir em correção.

O recorte brasileiro reduz a margem de tempo para agir. O Brasil é o país das Américas com maior expectativa de crescimento de identidades de agentes de IA nos próximos 12 meses, com projeção de **alta de 113%**, atrás de Israel e Hong Kong no ranking global, segundo o [2026 Identity Security Landscape Report](https://tiinside.com.br/12/05/2026/ataques-ligados-a-identidade-atingem-91-das-empresas-brasileiras/) da Palo Alto Networks. Globalmente, a mesma pesquisa mede identidades de máquina e IA superando funcionários humanos na proporção de 109 para 1. Se a maturidade de governança não acompanhar esse ritmo, o Brasil chega antes ao ponto em que a lacuna de confiança se transforma em incidente.

## O que chega à mesa do board

Uma credencial de máquina comprometida raramente gera o alarme visível de um ataque de phishing bem-sucedido. Seu impacto sobre a continuidade operacional pode ser igual ou maior: uma chave de API com privilégio amplo dá acesso direto a sistemas de produção, bases de dados e integrações críticas, sem passar pelas camadas de controle desenhadas para usuários humanos. Com 68% das organizações já tendo enfrentado algum evento de identidade, e o mau uso de identidade não humana como categoria mais reportada, essa exposição já é parte da rotina operacional das empresas. O mesmo padrão aparece do lado da resposta a incidentes: segundo a [Sophos](https://tiinside.com.br/12/05/2026/ataques-de-identidade-ja-sao-origem-de-67-dos-incidentes-ciberneticos/), 67% dos incidentes investigados pelas equipes de Resposta a Incidentes e MDR da empresa em 2026 têm origem em comprometimento de identidade digital, um número que confirma essa exposição operando dentro das empresas hoje.

Há também exposição regulatória a considerar. Uma credencial de máquina sem controle de acesso definido frequentemente carrega permissão para tocar dado pessoal, o que aproxima o tema de obrigações de proteção de dados já conhecidas pelo board em outros contextos. Para o C-level, uma chave de API é um ativo de acesso equivalente a qualquer credencial humana. Ativos de acesso sem dono, sem prazo e sem monitoramento representam risco de continuidade operacional.

## Governança como estrutura permanente

Segurança de identidade não humana exige tratamento como estrutura de decisão permanente, com dono, orçamento e revisão periódica. A criação de novas credenciais é contínua: cada integração e cada agente de IA adicionado gera identidades novas, o que torna uma auditoria única insuficiente diante do ritmo de criação.

Organizações que respondem bem a um incidente de identidade têm, no momento em que o incidente acontece, inventário atualizado de credenciais, processo de rotação e desativação, e visibilidade sobre qual identidade tem acesso a qual sistema. Essa estrutura prévia pesa mais do que a sofisticação da ferramenta usada na resposta. Esse tipo de estrutura é exatamente o que conecta gestão de exposição digital, controle de acesso e monitoramento contínuo, campo onde a Piersec atua junto a empresas que buscam tratar identidades de máquina com o mesmo rigor já aplicado a identidades humanas.

## A lacuna que precisa fechar antes do incidente

A maioria das empresas confia no próprio monitoramento de identidades não humanas sem ter evidência de que ele funciona. Essa lacuna entre confiança e prática é medível, e os números da SpyCloud mostram que essa distância é generalizada entre as organizações pesquisadas: 95% de confiança declarada contra 36% de monitoramento real.

O Brasil tem menos tempo do que a média global para corrigir essa distância. Com a maior expectativa de crescimento de identidades de agentes de IA das Américas, a pergunta que resta para cada gestor de segurança é se alguém sabe, com precisão, quantas identidades não humanas a organização tem, quem é o dono de cada uma, e desde quando ninguém verifica isso.

Fichamento do ciclo: [[identidades-nao-humanas-lacuna-monitoramento]]
