---
tipo: peca
formato: artigo
ciclo: "0004"
data: 2026-07-01
fonte: "[[ciclo-0004-credenciais-reutilizadas]]"
tags: [ciberseguranca, credenciais, credential-stuffing, identidade, mfa, piersec]
---

# Se as credenciais da sua empresa já estão à venda, quanto tempo até alguém perceber?

> O ciclo teve duas versões das peças; esta é a final (v2).

Na madrugada de 20 de junho, o sistema "Defesa Civil Alerta" disparou cerca de dez notificações falsas com a palavra "misantropia" para os celulares de aproximadamente **30 milhões de pessoas** em sete estados e no Distrito Federal. O episódio ganhou as manchetes pela imagem surreal de alertas de catástrofe chegando sem catástrofe alguma. Mas o que deveria ter chamado a atenção dos gestores não foi o susto: foi a simplicidade do método. Segundo o [TI Inside](https://tiinside.com.br/23/06/2026/ataque-ao-alerta-da-defesa-civil-expoe-risco-das-credenciais-roubadas/), o invasor não explorou uma falha inédita de software. Ele usou credenciais antigas, já vazadas em incidentes anteriores, testadas em massa contra um sistema que não exigia múltiplo fator de autenticação.

A técnica tem nome: **credential stuffing**. E ela revela uma verdade desconfortável para qualquer empresa brasileira. O ataque mais provável contra a sua organização não vai começar com um gênio quebrando a sua defesa. Vai começar com um login válido, que já circula à venda, entrando pela porta da frente.

## O vetor de risco mudou de endereço

Durante duas décadas, a segurança corporativa foi construída em torno do perímetro. Firewall, antivírus, filtros de borda: a lógica era manter o atacante do lado de fora. O problema é que o atacante deixou de arrombar a porta. Hoje ele chega com a chave. De acordo com o [Data Breach Investigations Report da Verizon](https://pushsecurity.com/blog/verizon-dbir-2026-review), credenciais roubadas figuram entre os principais vetores iniciais de violação, e **88% dos ataques básicos a aplicações web envolvem credenciais roubadas**. Não é uma falha exótica. É a rotina.

O combustível dessa rotina é o comportamento humano previsível. A mesma pesquisa da Verizon aponta que cerca de **quatro em cada dez usuários corporativos reutilizaram uma senha que já havia sido exposta** em algum vazamento. Quando uma credencial vaza no serviço A, ela vira uma chave-mestra para os serviços B, C e D onde a mesma pessoa repetiu a senha. O atacante não precisa adivinhar. Ele automatiza a tentativa com bilhões de combinações vazadas, e espera o acesso que já era legítimo se abrir.

## O que os números revelam além do óbvio

Entre todos os números, o tempo é o dado mais revelador. Segundo o [relatório Cost of a Data Breach da IBM](https://www.ibm.com/reports/data-breach), uma violação iniciada por credenciais comprometidas leva em média **246 dias** para ser identificada e contida. São mais de oito meses em que o invasor circula usando um login legítimo, indistinguível de um funcionário real, porque para o sistema ele é um funcionário real.

Esse é o ponto que separa organizações maduras das demais. O problema está na falta de visibilidade sobre um risco que já mora dentro de casa. Nenhuma ferramenta adicional resolve o que ninguém está observando. A empresa não sabe que as credenciais de seus colaboradores já estão à venda no submundo criminoso, e não observa como esses acessos estão sendo usados. O custo dessa cegueira é mensurável: a IBM calcula em **USD 4,67 milhões** a violação média que começa por uma credencial comprometida. No caso da Defesa Civil, as falhas apontadas pela imprensa foram exatamente essas: ausência de autenticação multifator, inexistência de política de rotação de senhas para os cerca de 600 usuários autorizados e nenhum monitoramento capaz de detectar, em tempo real, o uso anômalo de credenciais.

## Por que isso é decisão de board, não de TI

O contexto brasileiro torna a conta mais pesada. A América Latina se tornou **a região mais atacada do mundo**, com uma média de cerca de 3.149 ataques semanais por organização e crescimento de 53% em um ano, segundo dados da Check Point Research divulgados pela [Dark Reading](https://www.darkreading.com/cyber-risk/surging-cyberattacks-latin-america-riskiest-region). Dentro desse cenário, o Brasil concentra cerca de **46,9% dos ataques de ransomware** da região, conforme o levantamento da [SOCRadar](https://socradar.io/blog/top-cyber-threat-actors-targeting-brazil/). E há uma ponte direta entre os dois temas: 73% das vítimas de ransomware tiveram um vazamento de credenciais ou infecção por infostealer no ano anterior ao ataque. A credencial exposta hoje é a porta do sequestro de dados amanhã.

Traduzido para a linguagem do negócio, isso significa três exposições simultâneas. Há a exposição operacional, com a interrupção de sistemas críticos. Há a exposição financeira, no valor da violação e na resposta ao incidente. E há a exposição regulatória, porque um acesso indevido a dados pessoais aciona as obrigações da LGPD e a responsabilidade da organização perante a ANPD. Nenhuma delas é problema exclusivo do time técnico. Todas chegam à mesa da diretoria.

## Como as organizações maduras tratam a identidade

Empresas com postura de segurança madura pararam de tratar identidade como configuração e passaram a tratá-la como estrutura de decisão. Isso se traduz em três frentes concretas:

- **Autenticação multifator como padrão**, não como exceção reservada a sistemas críticos. Um login válido deixa de ser suficiente para entrar.
- **Revisão e rotação de acessos**, com privilégio mínimo e retirada disciplinada de credenciais antigas, ociosas ou amplas demais.
- **Monitoramento contínuo de identidade**, capaz de detectar o uso anômalo de uma credencial e sinalizar quando dados de acesso da empresa aparecem em vazamentos externos.

Quem responde bem a um incidente se distingue pela visibilidade, e raramente pelo tamanho do investimento. Ver a credencial exposta antes do atacante usá-la, e ver o uso indevido no momento em que ele acontece, encurta a janela de 246 dias para horas. É nesse ponto que a [Piersec](http://www.piersec.com.br) atua ao lado das organizações: dando visibilidade sobre a exposição digital que já existe e monitorando o acesso antes que o uso legítimo de uma credencial roubada se transforme em incidente.

## A pergunta que fica

O ataque à Defesa Civil foi constrangedor justamente por ser banal. Não exigiu talento, exigiu apenas que ninguém estivesse olhando. A maioria das empresas brasileiras tem hoje o mesmo conjunto de lacunas: senhas reutilizadas que já vazaram, acessos que ninguém revisa e nenhum sinal que dispare quando um login legítimo faz algo que um funcionário legítimo jamais faria. A questão que todo gestor deveria levar para a próxima reunião de diretoria é simples e incômoda. Se as credenciais da sua empresa já estão à venda agora, quanto tempo levaria até alguém perceber que elas foram usadas?

Fichamento do ciclo: [[ciclo-0004-credenciais-reutilizadas]]
