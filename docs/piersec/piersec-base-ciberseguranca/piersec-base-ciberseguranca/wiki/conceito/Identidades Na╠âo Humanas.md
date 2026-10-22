---
tipo: conceito
criado: 2026-09-17
fontes:
  - "[[identidades-nao-humanas-lacuna-monitoramento]]"
tags: [ciberseguranca, identidade, nhi, agentes-ia, piersec]
validade: dado datado (set/2026)
---

# Identidades Não Humanas

Identidade não humana (NHI, non-human identity) é toda credencial que autentica um processo em vez de uma pessoa: conta de serviço, chave de API, token de automação, credencial de agente de IA, certificado de máquina. A categoria existia há muito como detalhe de infraestrutura e virou superfície de ataque de primeira linha em 2026.

**A inversão medida.** Segundo o 2026 Identity Threat Report da SpyCloud (survey de 750 profissionais em empresas de 500 ou mais funcionários), credencial não humana comprometida responde por 31% dos pontos de entrada usados por atacantes, contra 17% de phishing e engenharia social. É a primeira vez na série que esse tipo de credencial passa phishing.

**A lacuna que dá o argumento comercial.** 95% das organizações acreditam ter visibilidade adequada sobre exposições de identidade de máquina e de IA. 36% monitoram de forma contínua. O mesmo descompasso aparece na governança: 91% já rodam ferramenta ou agente de IA com acesso a sistema interno, 56% têm governança formal sobre esse privilégio. A política declarada não é o controle operante.

**Escala do problema.** Identidades de máquina superam as humanas dentro das empresas na proporção de 82 para 1 (CyberArk) a 109 para 1 (Palo Alto Networks). Mau uso de NHI é hoje o evento de identidade mais reportado (42% dos casos), e 68% das organizações pesquisadas já viveram algum, com média de 8 eventos cada.

**Recorte Brasil.** O país lidera as Américas na expectativa de crescimento de identidades de agentes de IA nos próximos 12 meses, com projeção de alta de 113%, atrás apenas de Israel e Hong Kong no ranking global (Palo Alto Networks, via TI Inside). O dado vem de cobertura de imprensa sobre relatório internacional; não existe, até set/2026, relatório brasileiro primário sobre o tema.

**A ressalva que muda o discurso.** Os dados não sustentam a tese de que agentes de IA sejam, em si, mais arriscados que conta de serviço tradicional: as pesquisas tratam as categorias juntas e não quebram incidente por subtipo. O que aparece em todas as fontes é gestão básica de ciclo de vida de credencial, com conta sem dono, chave sem rotação e token sem responsável. Vender isso como problema de segurança de IA é ampliar o que o dado diz; vender como problema de inventário e rotação de credencial é o que ele sustenta.

Fichamento com fontes e níveis de confiança: [[identidades-nao-humanas-lacuna-monitoramento]]. Contexto de mercado em [[Panorama de Ameaças Cibernéticas 2026]].

Relacionados: [[Gestão Contínua de Exposição (CTEM)]] · [[Fraude por Deepfake Corporativo]]
