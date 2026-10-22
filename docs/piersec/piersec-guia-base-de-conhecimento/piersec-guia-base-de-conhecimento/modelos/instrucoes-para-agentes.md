# Instruções para colar nos agentes e nos roteiros

Troque `<CAMINHO-DA-BASE>` pelo caminho do vault visto da pasta onde o agente roda (ex.: `../piersec-base/`).

---

## 1. Bloco comum: vai em TODOS os agentes

Cole no fim do arquivo de instrução de cada agente.

```markdown
## Base de conhecimento (obrigatório)

**Antes de produzir:**
1. Leia `<CAMINHO-DA-BASE>/index.md`. Veja a seção 📥 Recém-depositado e a 🎯 Rota por tarefa que bate com o seu trabalho.
2. Leia só as páginas indicadas na rota (nunca a base inteira).
3. Número que for usar: se a base já tem, use o da base com a fonte do fichamento. Se você achou outro número para a mesma coisa, não escolha em silêncio: use o da base, deposite o novo e sinalize a contradição.
4. Página com `validade` vencida não é citada sem reconferir a fonte primária.
5. Leve a ressalva junto com o número ("O que não passou na triagem").
6. Registre no front matter do que produzir: `consultou_base: ["Página A", "Página B"]` ou `consultou_base: nenhuma`.

**Ao terminar:**
7. Se o trabalho gerou algo que vale além desta peça (número novo com fonte, lição com mecanismo, padrão de reprovação, resultado contra hipótese), grave um arquivo em `<CAMINHO-DA-BASE>/raw/` no formato de `deposito-raw.md`, com nome `AAAA-MM-DD--<pesquisa|aprendizado>--<tema>.md`.
8. Acrescente uma linha na seção 📥 Recém-depositado do `index.md`.
9. Nunca deposite dado de pessoa, cliente, contrato, credencial ou ambiente de cliente. Caso real, só anonimizado.
10. Não edite páginas da `wiki/` nem arquivos de `raw/processados/`: isso é da rotina de ingest.
```

---

## 2. Complemento por agente

Cole logo abaixo do bloco comum, conforme o papel.

**Pesquisa (inbound e SOC/MDR)**
```markdown
- Antes de buscar na web, liste as fontes da base sobre o tema e os ângulos já usados. Procure só o que é novo ou o que venceu.
- Para cada número novo, deposite um arquivo de pesquisa com fonte primária, URL, data, amostra e o que não se confirmou. Número só de imprensa, sem fonte primária, entra como "não verificável".
- Pendências do lint na fila de pautas têm prioridade sobre tema novo quando a validade venceu.
```

**Curadoria social**
```markdown
- Ao minerar tema do backlog, cruze com os aprendizados de formato e com as fontes já usadas no social.
- Deposite os temas descartados com o motivo, para ninguém reminerar.
```

**Redator**
```markdown
- Leia o conceito do tema e os aprendizados de voz e formato antes de escrever.
- Se o revisor ou um sócio corrigir algo que já foi corrigido antes, deposite como aprendizado de redação.
```

**Revisor**
```markdown
- Antes de revisar, leia os aprendizados de aprovação (o que os sócios já recusaram) e aplique como checklist.
- Toda reprovação com causa que pode se repetir vira aprendizado, com o exemplo antes e depois.
- Confira se todo número da peça está na base ou num depósito novo com fonte. Número sem rastro reprova.
```

**Designer**
```markdown
- Leia os aprendizados visuais antes de gerar arte.
- Deposite o padrão que funcionou ou falhou (composição, paleta, prompt), sem nome de ferramenta paga nem custo.
```

**Social media / agendamento**
```markdown
- Leia os aprendizados de horário e canal antes de agendar.
- Quando houver métrica do post, deposite o resultado por formato e horário, em números agregados.
```

**Estrategista de campanhas**
```markdown
- Leia os conceitos do segmento e os aprendizados de campanhas anteriores.
- Antes do disparo, deposite a hipótese da campanha: o que se espera, com que número, e por quê. Ligue ao conceito do segmento em `conceitos_relacionados`.
```

**Listas e segmentação**
```markdown
- Leia os aprendizados de segmento.
- Deposite só o padrão (porte, região, tipo de organização que respondeu). Nenhum nome, e-mail ou empresa identificável.
```

**Disparo**
```markdown
- Leia os aprendizados de entregabilidade antes de disparar.
- Incidente de entrega vira aprendizado com causa e correção, sem endereço de ninguém.
```

**Analista / dashboard**
```markdown
- Antes de analisar, procure na base a hipótese depositada pelo estrategista para esta campanha.
- Deposite o resultado contra a hipótese: confirmou, refutou ou inconclusivo, com os números agregados e o tamanho da amostra. Use o mesmo `conceitos_relacionados` da hipótese, para o ingest ligar os dois.
```

---

## 3. Encaixe nos roteiros das rotinas

### Ciclo de inbound e ciclo de social (segunda)

Primeiro passo do roteiro:
```markdown
0. BASE: leia `<CAMINHO-DA-BASE>/index.md` (fila 📥 e rota "Pauta ou peça de conteúdo"). Cheque a fila de pautas: pendência de reconferência aberta pelo lint vem antes de tema novo quando a validade venceu.
```
Último passo do roteiro:
```markdown
N. BASE: confirme que cada peça tem `consultou_base` e que o ciclo depositou pelo menos um arquivo em `raw/` (pesquisa nova ou aprendizado). Liste os depósitos na resposta final.
```
No ciclo de social, troque "herde a pesquisa do ciclo de inbound pela pasta do ciclo" por "herde a pesquisa do inbound pela base (fila 📥 e fichamentos), e use a pasta do ciclo só para as peças".

### Trilha SOC/MDR (sexta)

Substitua "releia as últimas 8 linhas do histórico para não repetir" por:
```markdown
Consulte na base as fontes de SOC/MDR e os ângulos já usados (todo o histórico, não só 8 semanas). Descarte ângulo ou dado repetido. Deposite o número novo como pesquisa.
```

### Campanhas

Na abertura da campanha:
```markdown
0. BASE: estrategista lê a rota "Campanha por segmento" e deposita a hipótese antes do disparo.
```
No fechamento:
```markdown
N. BASE: analista deposita o resultado contra a hipótese, com o mesmo `conceitos_relacionados`.
```
