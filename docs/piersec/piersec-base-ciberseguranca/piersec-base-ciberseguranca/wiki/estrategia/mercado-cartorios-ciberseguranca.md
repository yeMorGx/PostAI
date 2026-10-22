---
tipo: estrategia
data: 2026-08-24
tags: [ciberseguranca, cartorios, extrajudicial, provimento-213, provimento-243, cnj, regulacao, mercado, piersec]
---

# Mercado de Cartórios: Segurança da Informação Virou Obrigação (Provimentos CNJ 213 e 243/2026)

Pesquisa comercial da Piersec sobre as serventias extrajudiciais como mercado de cibersegurança. A pesquisa de base foi fechada em 06/07/2026 e a parte normativa foi revista em 24/08/2026, depois que o Provimento 243 alterou o 213. A tese em uma linha: segurança digital deixou de ser escolha do cartório e passou a ser exigência com regra escrita, prazo e responsabilidade pessoal do titular.

## A regra: Provimento CNJ 213/2026

Publicado pelo CNJ em **20/02/2026**, em vigor desde 23/02/2026, revogou o Provimento 74/2018. Em linguagem de gestão, o cartório passa a ter de:

- manter **política de segurança da informação** escrita e aprovada;
- dar **login individual** a cada funcionário, com segundo fator de autenticação (MFA); senha compartilhada fica proibida;
- fazer **backup** automático, guardado em outro local e **testado** (restaurado, não só gerado);
- ter **plano de continuidade**, com tempo de retomada e perda máxima de dados definidos;
- manter **antivírus, firewall e proteção de rede** em funcionamento;
- guardar **registro de acesso e atividade** dos sistemas por pelo menos 5 anos;
- **comunicar ao CNJ em até 72 horas** incidente grave.

O cumprimento é declarado item a item no sistema público **Justiça Aberta**; declarar o que não foi feito configura falsa declaração.

## A revisão: Provimento CNJ 243/2026

Publicado em **21/07/2026**, alterou o 213 e recontou os prazos, com vigência 30 dias após a publicação (agosto de 2026). Pontos que importam:

| Item | Como ficou |
| :-- | :-- |
| Enquadramento | por arrecadação bruta semestral, excluídos os valores repassados a terceiros (muitas serventias mudaram de classe) |
| Prazo da Etapa 1 | 180 dias (Classe 3), 240 dias (Classe 2), 300 dias (Classe 1), contados da vigência |
| Conclusão total | 24, 30 e 36 meses, na mesma ordem |
| Primeiros vencimentos | primeiro semestre de 2027 (entre fevereiro e junho, conforme a classe) |
| Comprovação | Dossiê Técnico obrigatório; Classe 1 pode apresentar relatório simplificado |
| Requisitos não flexibilizáveis | cópias de segurança, integridade e autenticidade dos atos, controle de acesso e trilha de auditoria |
| Sistemas sem suporte do fabricante | proibição gradual de uso |

**Consequência do descumprimento.** O Provimento não cria multa própria. O descumprimento injustificado, quando caracterizada negligência ou omissão relevante do titular, pode abrir procedimento administrativo disciplinar, com as penalidades da Lei 8.935/94 (de repreensão a perda da delegação). A responsabilidade é **pessoal do delegatário**, não da serventia nem do fornecedor do sistema, ponto que muitos titulares assumem ao contrário.

**Histórico útil (texto original do 213, superado pelo 243).** O 213 dividia as serventias em três classes por receita semestral (Classe 3 acima de R$ 500 mil; Classe 2 de R$ 100 mil a R$ 500 mil; Classe 1 até R$ 100 mil), com a primeira fase vencendo em 23/05, 22/07 e 21/09/2026. Material produzido antes de agosto de 2026 que fale em "prazo vencido" para a Classe 3 está desatualizado.

## Tamanho do mercado

- O Brasil tem **mais de 12 mil cartórios** (estimativas entre 13 e 14 mil), todos sujeitos ao Provimento.
- A classe de cada serventia é **informação pública** (Justiça Aberta), o que permite priorizar prospecção por prazo e por porte antes de qualquer contato.
- Um levantamento nacional a partir do Cadastro Nacional de Serventias do CNJ (ago/2026) chegou a 13.710 registros e **11.800 endereços de e-mail únicos** em 27 UFs. Concentração: MG 22%, SP 13%, PR 10%, RS 7%; os demais estados abaixo de 6% cada.
- **77% dos endereços oficiais informados pelas serventias são de provedor pessoal** (Gmail, Hotmail, Yahoo); só 2.640 dos 11.800 usam domínio próprio. É um sinal de baixa maturidade digital e pesa na estratégia de contato (ver [[metricas-email-prospeccao-fria]]).
- A adequação completa leva de 24 a 36 meses, o que favorece relação contínua em vez de serviço pontual.

## Dores e gatilhos de compra

1. **Prazo com data.** A urgência é real e normativa; não precisa ser fabricada.
2. **Responsabilidade pessoal do titular.** Argumento forte, desde que dito sem tom de ameaça.
3. **Acesso de terceiros.** Cartório depende de sistema de registro, certificadora, contabilidade e suporte de TI, quase sempre com algum acesso a sistemas internos. Controle de acesso e trilha de auditoria estão entre os requisitos não flexibilizáveis. Base conceitual em [[0008-artigo-risco-de-terceiros]].
4. **Backup que nunca foi restaurado.** O Provimento exige capacidade de restaurar, não só de gerar cópia.
5. **Sistema sem suporte do fabricante**, agora com proibição gradual.
6. **Falsificação de e-mail.** Parte relevante das serventias com domínio próprio não tem SPF/DMARC configurado, o que permite enviar e-mail se passando pelo cartório.
7. **Caso concreto.** Já houve cartório (Caldas Novas/GO) com o sistema inteiro sequestrado em ataque (relato de fornecedor de software do setor, não de fonte oficial), e ataques a órgãos públicos pararam serviços municipais.

## Concorrência

Pelo menos nove empresas já vendiam "adequação ao 213" em julho de 2026 (entre elas DPOnet, CartórioTech, MKNod e SN Informática). A maioria entrega **documentação de conformidade** ou é o próprio fornecedor do sistema do cartório. O espaço aberto é o de **segurança operacional** (monitoramento, defesa ativa, resposta a incidente): documento na gaveta não impede sequestro de sistema.

## Oferta que encaixa

Escada usada pela Piersec:

1. **Isca:** diagnóstico gratuito de adequação ao Provimento (gaps por etapa, plano de ação 30/60/90 dias, relatório para o titular).
2. **Adequação:** EDR, pentest e gestão de vulnerabilidade.
3. **Recorrência:** SOC gerenciado ao longo do roteiro de 24 a 36 meses.

Como essa tese foi levada ao mercado e o que ela rendeu: [[campanha-cartorios-estrategia-e-resultados]].

## Ressalvas

- Os detalhes do Provimento 243 (prazos, enquadramento, Dossiê Técnico, consequência disciplinar) foram registrados em 24/08/2026 como "conferidos nas fontes oficiais", mas a lista de fontes da pesquisa não traz o link do 243. Conferir no portal de atos do CNJ antes de citar.
- "Mais de 94% dos registros de imóveis digitalizados" constava da pesquisa sem fonte nomeada: não usar sem verificar.
- A proporção de serventias sem SPF/DMARC veio de checagem pública de DNS feita pela Piersec sobre a base própria; a contagem registrada (2.749 serventias de domínio próprio com risco alto) não bate com o total de domínios próprios após deduplicação (2.640), provavelmente por ter sido feita antes da deduplicação. Usar apenas como indicação qualitativa.
- Dados datados (jul a ago/2026). Nova alteração normativa do CNJ invalida a tabela de prazos.

## Fontes

- [Provimento 213/2026, texto oficial (Atos CNJ)](https://atos.cnj.jus.br/atos/detalhar/6734)
- [Guia prático de conformidade, ANOREG-RJ](https://www.anoregrj.com.br/guia-pratico-prov-213-2026/)
- [Enquadramento por classe e receita, CNB-MG](https://cnbmg.org.br/provimento-n-213-2026-sugestao-de-readequacao-dos-criterios-de-enquadramento-das-serventias-extrajudiciais-nas-classes-e-dilacao-do-prazo-para-cumprimento-das-etapas-previstas/)
- [ANOREG/BR, novos padrões de tecnologia e segurança](https://www.anoreg.org.br/site/provimento-no-213-cnj-estabelece-novos-padroes-de-tecnologia-e-seguranca-para-os-cartorios-brasileiros-revogando-o-provimento-no-74-cnj/)
- [Justiça Aberta, CNJ](https://www.cnj.jus.br/corregedoriacnj/justica-aberta/)
- [Caso de ataque a cartório, Siplan](https://siplan.com.br/blog/invasoes-de-sistemas-nos-cartorios-extrajudiciais-como-garantir-a-seguranca-de-dados/)
- [Ransomware no Brasil 2025, WeLiveSecurity](https://www.welivesecurity.com/pt/ransomware/ransomware-brasil-2025-evolucao-ameaca/)
- [Concorrência: DPOnet](https://dponet.com.br/lgpd-para-cartorio/) · [CartórioTech](https://cartoriotec.com.br/)

Relacionados: [[campanha-cartorios-estrategia-e-resultados]] · [[legitimo-interesse-prospeccao-b2b]] · [[mercado-fidc-e-gestoras-ciberseguranca]] · [[Panorama de Ameaças Cibernéticas 2026]]
