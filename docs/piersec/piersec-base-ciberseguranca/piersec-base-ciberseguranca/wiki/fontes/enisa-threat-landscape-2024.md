---
tipo: fonte
autor: ENISA (Agência da União Europeia para a Cibersegurança)
data: 2024-09-17
veredito: validado
validade: dado datado (jul/2023 a jun/2024)
tags: [ciberseguranca, enisa, panorama-de-ameacas, ransomware, ddos, vulnerabilidades, engenharia-social, uniao-europeia, piersec]
---

# ENISA Threat Landscape 2024: DDoS e Ransomware Seguem no Topo, com 11.079 Incidentes Observados

Relatório anual da ENISA, 12ª edição, publicado em setembro de 2024. **Período dos dados: julho de 2023 a junho de 2024.** Base: incidentes públicos coletados pela própria agência (fontes abertas e inteligência de ameaças da ENISA) mais revisão de literatura, pela metodologia CTL publicada em 2022. Foco na União Europeia, com recortes globais. Público declarado: decisores estratégicos e de política pública, com interesse também para a comunidade técnica. Licença CC BY 4.0 (reuso permitido com crédito à ENISA e indicação de alterações).

Este fichamento é a própria fonte primária, lida diretamente no PDF. **Convenção de página:** os números de página abaixo são os impressos no rodapé do relatório (a página do arquivo PDF é a impressa + 1).

## As oito ameaças principais

Ransomware; malware; engenharia social; ameaças contra dados; ameaças contra disponibilidade (DDoS); manipulação de informação e interferência (FIMI); ataques à cadeia de suprimentos (tratados de forma transversal, sem capítulo próprio nesta edição). Ransomware e DDoS somaram mais da metade dos eventos analisados, seguidos de ameaças contra dados (p. 7-9). O relatório também analisa quatro categorias de atores: ligados a Estados, cibercrime e hacker-de-aluguel, atores ofensivos do setor privado e hacktivistas (p. 4).

## Números que passaram na triagem

**Dados próprios da ENISA (período jul/2023 a jun/2024):**

- **11.079 incidentes observados**, dos quais 322 atingiram dois ou mais Estados-membros da UE (p. 12).
- **Setores mais visados:** administração pública (19% dos eventos), transporte (11%) e finanças (9%) (p. 4).
- **DDoS por setor:** administração pública 33% dos eventos de DDoS, transporte 21%, bancos 12%, infraestrutura digital 6% (p. 15).
- **Ransomware por setor:** serviços empresariais 18%, indústria 17%, saúde 8%; o relatório descreve o alvo como indiscriminado (p. 15).
- **Ameaças contra dados por alvo:** público geral 15%, administração pública 12%, infraestrutura digital 10%, finanças 9%, serviços empresariais 8% (p. 15).
- **Ransomware estabilizado em patamar alto:** cerca de 1.000 vítimas reivindicadas por trimestre em sites de vazamento no 2º trimestre de 2024 (p. 45). LockBit respondeu por quase metade dos incidentes reportados, e manteve atividade mesmo após a operação policial de fevereiro de 2024 (p. 47).
- **Hacktivismo na UE:** cerca de 3.662 incidentes, quase todos ligados à guerra entre Rússia e Ucrânia (p. 31).
- **Vulnerabilidades:** 33.524 registradas no NIST NVD de jul/2023 a jul/2024, contra 24.690 no período anterior (p. 35). Das 19.754 com severidade codificada, 9,3% críticas e 21,8% altas (p. 10 e 36). 76,29% das vulnerabilidades com vetor informado são exploráveis pela rede (p. 38).
- **[[CISA KEV]]:** 123 vulnerabilidades publicadas no período entraram no catálogo, que somava 1.131 no total (p. 35 e 41).

**Tendências qualitativas destacadas pela ENISA (p. 10-11):** técnicas de evasão "living off the land" e uso de serviços legítimos de nuvem (Slack, Telegram) para disfarçar comando e controle; alta acentuada de comprometimento de e-mail corporativo (BEC); extorsão usando como alavanca os prazos de notificação regulatória; criminosos usando IA generativa para redigir golpes e gerar scripts maliciosos; infostealers como peça central da cadeia de ataque; aproximação entre hacktivistas e atores estatais; ataque à cadeia de suprimentos por engenharia social (backdoor no XZ Utils, mar/2024); DDoS-de-aluguel ao alcance de atacantes sem habilidade.

## Números de terceiros citados pela ENISA

Lidos no relatório, mas a origem é outra fonte; para uso em peça, cite a fonte original e, se possível, confira nela.

- **Deepfake corporativo:** empresa multinacional perdeu mais de US$ 25 milhões quando atacantes usaram deepfake para se passar por executivos numa videochamada (caso Arup, via CNN) (p. 29). Ver [[Fraude por Deepfake Corporativo]].
- **Engenharia social:** phishing e pretexting respondem por 73% das violações de engenharia social (Verizon) (p. 63). Custo médio de violação com BEC como vetor inicial: US$ 4,67 milhões (IBM, 2023) (p. 64). Mandiant: exploit foi o vetor inicial mais comum em 2023 (38% das intrusões), com phishing caindo para 17% (p. 64).
- **Tempo de detecção:** média de 277 dias para identificar e conter uma violação (IBM) (p. 71).
- **Dados na nuvem:** 82% das violações envolveram dado armazenado em nuvem (IBM, citado pela ENISA) (p. 74).
- **Trojans bancários móveis:** crescimento de 200% ano a ano nas famílias de malware, de 10 para 29 (p. 59). A ENISA cita uma notícia da Help Net Security, não o estudo original: não use sem conferir na pesquisa de origem.
- **DDoS:** média de 1.700 ataques por dia segundo a Microsoft (p. 80); 4,5 milhões de ataques DDoS no 1º trimestre de 2024, alta de 50% ano a ano (Cloudflare) (p. 81).

## Ressalvas

- **Recorte europeu.** A contagem de incidentes e as fatias por setor são da coleta da ENISA com foco na UE. Não há corte Brasil ou América Latina; usar esses percentuais como retrato do mercado brasileiro é extrapolação.
- **Base em fontes abertas.** O próprio relatório avisa que alta de eventos reportados não prova alta real de ataques: pode refletir atenção da mídia ou reivindicações de atacantes sem impacto real (p. 11). Sites de vazamento passaram a ser considerados pouco confiáveis após a operação contra o LockBit (p. 10).
- **Período diferente das outras fontes.** A ENISA usa julho a junho; muitas fontes que ela cita usam o ano civil (p. 7).
- **Dado de 2024.** Para 2026, use como linha de base histórica, não como retrato atual; os números mais recentes da base estão em [[Panorama de Ameaças Cibernéticas 2026]].

## Uso na peça

Útil como fonte institucional europeia e neutra (não é fornecedor) para três argumentos: ransomware e DDoS como ameaças persistentes; o volume de vulnerabilidades crescendo mais rápido que a capacidade de correção (33,5 mil no ano, das quais 123 com exploração ativa comprovada), que reforça a priorização por KEV em [[Gestão Contínua de Exposição (CTEM)]]; e a chegada do deepfake à fraude corporativa.

Relacionados: [[Panorama de Ameaças Cibernéticas 2026]] · [[CISA KEV]] · [[Gestão Contínua de Exposição (CTEM)]] · [[Fraude por Deepfake Corporativo]] · [[Verizon DBIR]] · [[IBM X-Force Threat Intelligence Index]]

Anexo: [ENISA Threat Landscape 2024 (PDF)](../../anexos/enisa-threat-landscape-2024.pdf)
