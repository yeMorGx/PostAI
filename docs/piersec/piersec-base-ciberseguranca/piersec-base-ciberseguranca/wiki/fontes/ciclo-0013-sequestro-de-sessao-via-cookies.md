---
tipo: fonte
autor: pesquisa própria (Piersec, ciclo 0013)
data: 2026-08-17
veredito: parcial
validade: dado datado (ago/2026)
tags: [ciberseguranca, sequestro-de-sessao, cookies, infostealer, mfa, identidade, piersec]
---

# Sequestro de sessão via roubo de cookies: o Brasil em 2º lugar mundial e o limite do MFA

Pesquisa do ciclo 0013 de conteúdo da Piersec (blog, newsletter e LinkedIn), 17/08/2026. O gancho foi o estudo da NordVPN divulgado em 12/08/2026, que colocou o Brasil em segundo lugar mundial em cookies de sessão roubados. O ângulo é uma lacuna de governança específica: a empresa investiu em senha forte e autenticação multifator, mas o invasor não precisa quebrar nenhuma das duas. Ele rouba a sessão já autenticada e assume a identidade do usuário sem disparar alarme. MFA cobre a porta de entrada; o que acontece depois do login fica sem monitoramento.

## Números que passaram na triagem

Estudo NordVPN Research (Nord Security), coleta de 09/06/2025 a 08/06/2026 em dados de infostealers vendidos em fóruns da dark web e canais no Telegram; lido via CISO Advisor e TI Inside (12/08/2026) e Techlicious e TechNewsWorld (ago/2026):
- 52,4 bilhões de cookies de sessão roubados identificados globalmente em 12 meses.
- Cookies de sessão aparecem 4,6 vezes mais nos dados roubados do que senhas, arquivos e cartões de pagamento somados.
- Brasil em 2º lugar mundial, com 2,83 bilhões de registros, atrás da Índia (4,68 bi) e à frente de EUA (2,43 bi), Indonésia (2,10 bi) e Filipinas (1,93 bi).
- Mais de 96% dos dispositivos infectados analisados tinham software de segurança ativo no momento da infecção.
- Ajustado por população, Uruguai, Peru e Chile lideram a concentração de cookies roubados por habitante na América Latina.
- Contas mais visadas nos registros: Google (11,78 mi), Facebook (8,10 mi) e Microsoft (7,85 mi), plataformas de uso corporativo diário.

**Mecanismo** (NordVPN, blog institucional, 01/10/2025): no sequestro de sessão, o invasor reutiliza uma sessão já autenticada e acessa a conta sem passar pela verificação de MFA, porque o token de sessão já provou a identidade uma vez. O cookie é, na prática, uma chave que já girou na fechadura.

## O que não passou na triagem / ressalvas

- **Estudo primário não acessado diretamente.** A página do estudo da NordVPN retornou conteúdo institucional, não o relatório de dados. Os números foram confirmados de forma consistente em quatro coberturas independentes (duas brasileiras, duas internacionais), o que atende ao critério de cruzamento, mas não substitui a leitura da fonte. Por isso o veredito é parcial.
- **Números conflitantes de um estudo anterior da própria NordVPN.** Portais brasileiros publicaram por volta de mai/2026 outra versão (Brasil em 1º lugar, 7 bilhões de cookies vazados, 550 milhões ainda ativos). Não foi possível reconciliar as duas. As peças usam só os números de ago/2026 (período de coleta explícito e mais fontes corroborando) e não misturam as duas séries.
- **Custo médio de vazamento no Brasil de R$ 7,19 milhões em 2025 (alta de 6,5%)**, atribuído ao IBM Cost of a Data Breach, veio de um blog de mercado, não do relatório da IBM. Serve como contexto, não como pilar do argumento.
- **Fonte com interesse comercial.** A NordVPN vende produto de privacidade e proteção; o estudo é usado pelos números de volume, com essa ressalva.

## O que as peças propõem

Tratar MFA como início, não fim, do programa de identidade: monitorar se credenciais e cookies corporativos aparecem em vazamentos e mercados de dados roubados, detectar uso anômalo de sessão (o mesmo login ativo em dois lugares) e ter processo pronto para revogar sessão e forçar novo login.

## Peças publicadas

- [[0013-artigo-sequestro-de-sessao-via-cookies]]
- [[0013-newsletter-sequestro-de-sessao-via-cookies]]
- [[0013-linkedin-sequestro-de-sessao-via-cookies]]

Relacionados: [[Panorama de Ameaças Cibernéticas 2026]] · [[Gestão Contínua de Exposição (CTEM)]] · [[ciclo-0014-atacantes-autonomos-de-ia]] · [[acervo-pesquisa-piersec]]
