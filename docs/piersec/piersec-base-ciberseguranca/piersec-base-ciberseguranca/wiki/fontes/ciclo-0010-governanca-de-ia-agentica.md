---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo 0010)
data: 2026-08-03
veredito: parcial
validade: dado datado (ago/2026)
tags: [ciberseguranca, inteligencia-artificial, ia-agentica, governanca, identidades-nao-humanas, lgpd, piersec]
---

# Governança de IA agêntica: a adoção corre à frente do controle de acesso

Pesquisa do ciclo 0010 de conteúdo da Piersec (blog, newsletter e LinkedIn), 03/08/2026. A pauta nasceu de uma dor que a direção da Piersec vinha ouvindo em conversas com clientes da área: empresas empurrando a adoção de IA de cima para baixo, com o time de tecnologia e segurança recebendo o mandato sem estrutura de governança, inventário de identidades ou controle de escopo. É o movimento complementar ao ciclo 0009 (shadow AI, uso não sancionado de baixo para cima); nenhum dado se repete entre os dois.

O ângulo é de lacuna, não de flagrante: a adoção correu à frente da governança, e o time de tecnologia aparece como quem sustenta o risco, não como quem falhou. A saída proposta é dizer "sim, com controle" em vez de travar a adoção.

## Números que passaram na triagem

**Ritmo de adoção contra maturidade de governança** (Deloitte, State of AI in the Enterprise 2026, 3.235 líderes em 24 países, 115 brasileiros; página da Deloitte Brasil conferida em 03/08/2026):
- 95% das empresas brasileiras planejam adotar IA agêntica em até dois anos (97% no global).
- 27% das brasileiras dizem ter modelo de governança maduro (21% no global).
- 82% das brasileiras já liberam IA para ao menos 20% dos profissionais (85% no global).
- 58% das brasileiras implementaram no máximo 20% dos seus projetos piloto.

**O risco está no acesso concedido** (2026 CISO AI Risk Report, Cybersecurity Insiders, 235 CISOs, CIOs e líderes seniores de segurança nos EUA e Reino Unido; lido via cobertura do IT Forum):
- 71% das organizações já permitem que sistemas de IA acessem aplicações centrais (CRM, ERP); só 16% governam esse acesso de forma eficaz.
- 92% não têm visão completa das identidades de IA em operação.
- 95% duvidam que detectariam ou conteriam um uso indevido.
- 86% não têm regras específicas aplicadas.
- 5% se consideram preparadas para conter um agente de IA comprometido.
- 60% ainda gerenciam identidades de IA com modelos pensados para pessoas (login, sessão, senha).
- Prioridade declarada: 73% investiriam primeiro em descoberta e inventário de identidades de workloads e APIs; 68% em monitoramento contínuo.

**Velocidade de adoção no Brasil** (Cetic.br / NIC.br, TIC Empresas 2025, 16ª edição, 4.174 empresas, divulgada em jun/2026):
- Adoção de IA nas empresas brasileiras passou de 13% (2024) para 17% (2025); entre as grandes (mais de 250 funcionários), de 38% para 50%.
- 80% adquiriram software pronto e 60% contrataram fornecedor externo para desenvolver ou adaptar soluções: boa parte das decisões de acesso a dados chega embutida em produto de terceiro.

**Enquadramento de mercado** (Gartner, tendências de cibersegurança 2026, via Security Leaders): gestão de identidade e acesso está entre os seis temas que definem o setor em 2026; a proliferação de agentes não humanos amplia a superfície de risco. Oscar Isaka, analista diretor sênior do Gartner, recomenda abordagem baseada em risco, com escopo de ação definido por agente e detecção de violação de limite, e observa que gerenciar acessos de máquina duplica a complexidade da gestão de identidades.

**Referência normativa:** ISO/IEC 42001, sistema de gestão de IA auditável (papéis, avaliação de risco, ciclo de melhoria).

## O que não passou na triagem / ressalvas

- **Fonte secundária em dois pilares.** Os números do CISO AI Risk Report e a posição do Gartner foram lidos em cobertura de imprensa (IT Forum e Security Leaders), não no relatório original. As URLs foram conferidas; o documento primário, não. Por isso o veredito é parcial.
- **Recorte geográfico do CISO AI Risk Report.** A amostra é de EUA e Reino Unido. Usar os 71%/16% como retrato do mercado brasileiro é extrapolação; o dado brasileiro deste ciclo é o da Deloitte e o do Cetic.br.
- **Duas bases diferentes de "adoção".** Os 95% da Deloitte são intenção de adotar IA agêntica em dois anos; os 50% do Cetic.br são uso efetivo de IA (qualquer tipo) nas grandes empresas. Não somar nem comparar diretamente.

## A sequência proposta nas peças

Inventário antes de política; escopo definido por agente, com privilégio mínimo e prazo de validade; dono humano nomeado para cada identidade de IA; monitoramento contínuo com revogação automática. A ordem segue a prioridade declarada pelos próprios CISOs (73% inventário primeiro). Mecanismo em [[Identidades Não Humanas]] e [[Gestão Contínua de Exposição (CTEM)]].

## Peças publicadas

- [[0010-artigo-governanca-de-ia-agentica]]
- [[0010-newsletter-governanca-de-ia-agentica]]
- [[0010-linkedin-governanca-de-ia-agentica]]

Relacionados: [[Identidades Não Humanas]] · [[Panorama de Ameaças Cibernéticas 2026]] · [[Gestão Contínua de Exposição (CTEM)]] · [[identidades-nao-humanas-lacuna-monitoramento]] · [[acervo-pesquisa-piersec]]
