---
tipo: estrategia
data: 2026-08-25
tags: [lgpd, legitimo-interesse, prospeccao, email, b2b, anpd, conformidade, piersec]
---

# Legítimo Interesse (LGPD) para Prospecção B2B por E-mail: Como a Piersec Fez a Avaliação

Modelo de avaliação de legítimo interesse elaborado pela Piersec em 25/08/2026, **antes** de iniciar o tratamento, para a campanha de prospecção junto a serventias extrajudiciais ([[campanha-cartorios-estrategia-e-resultados]]). Segue a orientação da ANPD de que a avaliação seja prévia e documentada, e serve de roteiro para qualquer prospecção B2B a partir de base pública. Não é parecer jurídico.

**Base legal invocada:** art. 7º, IX (legítimo interesse), combinado com o art. 7º, §3º (dado tornado público pelo próprio titular), da Lei 13.709/2018. Revisão anual, ou antes se a finalidade mudar.

## 1. Descrição do tratamento

- **Origem:** Cadastro Nacional de Serventias do CNJ, base pública na qual cada serventia informa e mantém o próprio canal oficial de contato. Nenhum dado comprado, extraído de terceiro ou enriquecido.
- **Dados:** e-mail informado como canal oficial, nome do titular quando consta, denominação da serventia, município, UF, número do CNS e telefone.
- **O que não há:** dado sensível (art. 5º, II), dado de criança ou adolescente, decisão automatizada com efeito jurídico. O diagnóstico oferecido depende de respostas voluntárias.
- **Volume:** cerca de 11.800 registros, enviados em lotes ao longo de cerca de três meses.

## 2. Finalidade

Apresentar às serventias um serviço de segurança da informação diretamente ligado a uma obrigação normativa que já recai sobre elas (Provimentos CNJ 213 e 243/2026, ver [[mercado-cartorios-ciberseguranca]]). Finalidade lícita, específica e explícita, declarada no rodapé de cada mensagem.

## 3. Teste de necessidade

Existe meio menos invasivo de chegar ao mesmo fim?

- **Mídia paga ou orgânica** não alcança de forma útil o titular de uma serventia específica, sujeito a um prazo específico.
- **Telefone** é mais intrusivo, interrompe o atendimento e não deixa o destinatário decidir se quer se informar.
- **Correspondência física** trata os mesmos dados com custo maior e sem mecanismo imediato de oposição.
- **E-mail** é o canal que a própria serventia declarou como oficial e o único que leva no corpo a oposição em um clique.

Minimização: sem coleta adicional, sem cruzamento com outras bases, sem retenção além do período da comunicação.

## 4. Balanceamento

- **Interesse do controlador:** legítimo e concreto, apresentar serviço próprio e pertinente a um público profissional, numa janela definida por norma.
- **Expectativa do titular:** o endereço foi informado a cadastro público justamente para servir de canal oficial; é razoável esperar ali comunicação profissional ligada à atividade extrajudicial.
- **Impacto:** baixo. Poucas mensagens, remetente identificado, recusa imediata, sem perfil comportamental, sem transferência a terceiros, sem efeito jurídico ou econômico adverso.
- **Ponto de atenção reconhecido:** boa parte dos endereços do cadastro é de provedor pessoal (Gmail, Hotmail, Yahoo), ainda que declarada como canal institucional. A fronteira entre dado profissional e pessoal fica menos nítida, e por isso as salvaguardas valem igualmente para todos os destinatários.
- **Conclusão:** o interesse legítimo não é superado pelos direitos e liberdades dos titulares, **desde que** as salvaguardas abaixo sejam cumpridas integralmente.

## 5. Salvaguardas (condição de validade)

1. Identificação completa do controlador em toda mensagem (razão social, CNPJ, endereço físico).
2. Declaração da origem do dado e da base legal no rodapé. Modelo usado: *"Você recebeu este e-mail porque o endereço consta no Cadastro Nacional de Serventias do CNJ como canal oficial da serventia. Escrevemos com finalidade de prospecção comercial de serviço relacionado à atividade extrajudicial, com base em legítimo interesse (art. 7º, IX, LGPD)."*
3. Oposição em um clique, visível, com efeito imediato e sem justificativa; cabeçalho de descadastro de lista ativo.
4. Frequência limitada e com fim: no máximo cinco mensagens por destinatário, sem recomeço automático.
5. Saída antecipada: quem faz o diagnóstico deixa de receber as mensagens restantes.
6. Sem compartilhamento, venda, cessão ou uso para outra finalidade.
7. Sem enriquecimento por fontes externas.
8. Isolamento: a base prospectada fica separada da newsletter e da base de clientes.
9. Higienização prévia (duplicados e inválidos removidos).
10. Critérios de interrupção: suspender se a reclamação de spam passar de 0,1% ou a rejeição permanente passar de 3%, sinais de que a comunicação não está sendo bem recebida (ver [[metricas-email-prospeccao-fria]]).

## 6. Direitos do titular e retenção

Os direitos do art. 18 (confirmação, acesso, correção, anonimização, bloqueio, eliminação, oposição) são exercidos por um canal indicado na mensagem. Oposição é atendida de imediato, pelo link, por resposta ao e-mail ou pelo canal direto, sem contrapartida. Encerrada a sequência sem interesse, o registro é eliminado ou mantido só em lista de supressão, para impedir novo contato.

## O que a avaliação não cobre

A conformidade com a LGPD não implica conformidade com os **termos de uso da plataforma de envio**. Provedores de e-mail marketing costumam exigir consentimento prévio e explícito dos destinatários, requisito contratual mais restritivo que o legítimo interesse. São questões independentes; o risco contratual é uma decisão de negócio à parte.

## Como reaproveitar

Para outro público B2B (por exemplo, gestoras de crédito a partir de cadastro público da CVM, ver [[regua-abm-fidc-gestoras]]), refazer as quatro partes com os dados do caso: origem pública e quem a mantém, finalidade ligada a obrigação ou atividade do destinatário, comparação com canais alternativos e salvaguardas. A justificativa do §3º só vale quando o dado foi tornado público pelo próprio titular.

Relacionados: [[campanha-cartorios-estrategia-e-resultados]] · [[metricas-email-prospeccao-fria]] · [[0007-artigo-anpd-agencia-reguladora]]
