---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo 016 de blog e newsletter)
data: 2026-09-13
veredito: parcial
validade: dado datado (set/2026)
tags: [ciberseguranca, identidade, nhi, agentes-ia, spycloud, piersec]
---

# Identidades Não Humanas Superam Phishing como Porta de Entrada, e o Monitoramento Não Acompanha (SpyCloud, 2026)

Levantamento do ciclo 016 de blog e newsletter da Piersec (13-09-2026). Fonte central: o 2026 Identity Threat Report da SpyCloud, divulgado em 09-09-2026, com survey de 750 líderes e praticantes de segurança em empresas de 500 ou mais funcionários.

## Achados que passaram na triagem

**Confiança alta, lida na fonte primária (comunicado e relatório da SpyCloud).** Identidades não humanas comprometidas, que incluem contas de serviço, chaves de API, tokens de automação e agentes de IA, respondem por 31% dos pontos de entrada usados por atacantes, contra 17% de phishing e engenharia social. É a primeira vez que esse tipo de credencial ultrapassa phishing como vetor primário nessa série.

O achado mais forte é a distância entre confiança declarada e prática: 95% das organizações acreditam ter visibilidade adequada sobre exposições de identidade de máquina e de IA, e 36% de fato monitoram de forma contínua. O mesmo padrão aparece na governança de acesso: 91% já usam ferramentas ou agentes de IA com acesso a sistemas internos, e 56% têm governança formal sobre esses privilégios. Mau uso de identidade não humana é hoje o tipo de evento de identidade mais reportado (42% dos casos), e 68% das organizações pesquisadas já sofreram algum evento desse tipo, com média de 8 eventos cada.

**Confiança média-alta, convergência de fontes sem leitura primária completa.** A CyberArk (2025 Identity Security Landscape, 2.600 tomadores de decisão via Vanson Bourne) mede identidades de máquina superando as humanas na proporção de 82 para 1. A Palo Alto Networks (2026 Identity Security Landscape Report, via cobertura do TI Inside de 12-05-2026) mede 109 para 1 globalmente e traz o recorte brasileiro: o país lidera as Américas na expectativa de crescimento de identidades de agentes de IA nos próximos 12 meses, com projeção de alta de 113%, atrás apenas de Israel e Hong Kong no ranking global. As duas foram confirmadas por múltiplas buscas e cobertura jornalística brasileira original, sem leitura direta do relatório primário completo.

## O que não passou na triagem

- **Sophos, 67% dos incidentes com origem em comprometimento de identidade: fonte única.** Aparece só na cobertura do TI Inside, sem relatório primário lido. Fica como dado de reforço, nunca de abertura, e essa é a razão do veredito `parcial` desta fonte.
- **Ausência de dado brasileiro nativo: lacuna aberta.** Até 13-09-2026 não foi encontrado relatório brasileiro primário (CERT.br, ANPD, associações setoriais) medindo identidades não humanas ou agentes de IA no mercado local. Os dois recortes de Brasil disponíveis vêm de cobertura de imprensa sobre relatório internacional. Vale investigar antes do próximo ciclo que toque o tema.
- **Risco específico de agentes de IA: não separável nos dados.** Os números não permitem afirmar que agentes de IA autônomos sejam, por si só, mais arriscados que contas de serviço e chaves de API tradicionais. A SpyCloud trata as duas categorias juntas como identidades não humanas, sem quebrar incidentes por subtipo. A maior parte do problema descrito nas fontes é gestão básica de ciclo de vida de credencial: conta sem dono, chave sem rotação, token sem responsável.

Relacionados: [[Identidades Não Humanas]] · [[Panorama de Ameaças Cibernéticas 2026]] · [[Gestão Contínua de Exposição (CTEM)]]
