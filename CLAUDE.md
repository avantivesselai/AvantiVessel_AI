# Avanti Vessel AI — guia para o Claude

Cérebro operacional da **Azimut Atlantis 51 · Avanti Vessel** (registro 3813927725, casco 51BR153, proprietário Otto Licks).
Site estático no GitHub Pages: https://avantivesselai.github.io/AvantiVessel_AI/ (publica a partir da `main`, raiz).

## Como falar com o usuário
- Português do Brasil, direto, primeira linha = a resposta. Emergência (SOS, óleo, incêndio, MOB, EPIRB) ignora concisão.
- Nunca inventar dado: sem fonte → "SEM DADOS". Citar fabricante/modelo e a fonte.
- Merge na `main` só quando o usuário pedir (publica o site na hora). Trabalhar em branch `claude/...`.

## Estrutura
- `*.dc.html` — 37 telas (web 1440×900 e app 390×844). Formato "design canvas": HTML com `{{…}}`, `<sc-if>`, `<sc-for>`,
  `<x-import component-from-global-scope="…">` e um `<script type="text/x-dc">` com `class Component extends DCLogic` (React via `support.js`).
- `avanti-brain.js` — respostas do chat (ANSWERS por chave + `route()`), atalhos, diário, voz (`ditado`, `speak`, `falaCurta`),
  busca na base (`buscaBase`, BM25 PT/EN) e telemetria ao vivo (`VIVO`, desligada).
- `avanti-auth.js` — login (hash PBKDF2), `VERSAO`, rodapé, `<avanti-usuario>`, `<avanti-saudacao>` (frase sorteada), `<avanti-periodo>` (Bom dia/tarde/noite).
- `avanti-clima.js` — `<avanti-hora-clima>`: hora America/Sao_Paulo, máx/mín ECMWF e maré (Open-Meteo).
- `avanti-voz.js` — overlay "núcleo de IA" da conversa por voz (eventos `avanti-voz`); ícone do barco no centro.
- `avanti-telemetria.js` + `telemetria-worker/` — telemetria ao vivo do coletor, **desligada** (`URL_PROXY` vazio).
- `base-conhecimento.json` — ~1.000 trechos técnicos dos manuais do Drive (sem documentos sensíveis).
- `sw.js` (cache offline, lista CORE), `avanti-app.js` (ajuste à janela, SOS flutuante), `avanti-theme.js` (tema).
- `Manual-Avanti-Vessel-AI.dc.html` — apresentação (24 slides, v17). `Guia-Rapido-Avanti-Vessel-AI.pdf` — guia para leigo (9 p. A4),
  gerado com Playwright (`page.pdf`, A4, printBackground) a partir de `guia-rapido/Guia-Rapido-Avanti-Vessel-AI.html` (imagens em `guia-rapido/img/`, tema claro).
  Mudou dado no app → atualizar os dois e regerar o PDF.

## Lançar versão
Alterar `VERSAO` em `avanti-auth.js`, `CACHE` em `sw.js` e a tabela de versões no `README.md`. Arquivo novo usado offline → adicionar em `CORE` do `sw.js`.

## Dados atuais
- Snapshot fixo nas telas e no chat: **coletor YDWG-02 · 25/09/2026 17:43** (sessão auto_20260925_1407; atracado o tempo todo; Seakeeper ligado;
  motores em marcha lenta até 14:03 e gerador até 14:07, desligados depois — motor mostra a última leitura com hora, nunca zero).
  Ambiente 17:43: SOG 0,1 nó · proa 050° · vento 1,8 nó de 044° · 1012 hPa · ar 22,5 °C · mar 21,8 °C · praça 21,8 °C · 30 satélites ·
  banco 24 V 27,88 V (instância 0) · água 65,1 % · cinzas 0,0 % · negras 11,9 %. Motores 14:03: 599 rpm, óleo 2,7/2,8 bar, 63/61 °C, arrefec. 76/74 °C.
  Diesel 28,0/28,8 % às 13:59 (≈ 426 L de 1.500; tanque 0 = BB, 1 = BE — a confirmar), horímetros 110/106 h, gerador 286,1 h (14:07).
- Prazos contados a partir de 25/09: 3 atrasadas (filtros chiller 186 d, bombas de porão 100 d, tensões Quick VRS/SBC NRG+ 1 d).
- Para atualizar de novo: ler no Drive `snapshot_live_latest.json` (id 121HD_KA7kYyAUUqrkJtUAscIco885dOy) e `nmea_AAAAMMDD.jsonl`
  (pasta 1fNzGteLcutM6Rmh9i-lKQmAHRs9CVSnj); status da sessão em `auto_*.status.json` (pasta 1PckSdHu5k9DRSSoZh5nZYpk3QQVAR8fL).
  Trocar os valores em todas as telas + `avanti-brain.js` e recalcular prazos (D-n) e derivados (litros, autonomia = L × 0,9 ÷ 20,9 L/h a 8,4 nós).

## Privacidade (repositório e site são públicos)
- Nunca publicar: contratos, notas fiscais, título/transferência de propriedade, CPF/CNPJ, telefones, e-mails, valores, nomes de terceiros,
  chaves de API, link público do arquivo de telemetria (tem a posição do barco).
- Documentos sensíveis + IA (Gemini/NotebookLM) + telemetria ao vivo: só depois de login no servidor (repo privado ou Cloudflare Access).

## Pendências conhecidas
- Resolvido em 25/09 (definido pelo Otto): tanque diesel 2×750 L = 1.500 L em todo o app e na base; homologação ANATEL = VHF 315 nº 07897-25-01493 (série 7007957, até 11/11/2028), uma linha só em Documentos (5 válidos).
- EPIRB no cockpit principal, à direita (não há flybridge na Atlantis 51); Sea-Fire conforme o inventário (automático por temperatura, alavanca manual no console à direita do piloto); não há VHF 115 a bordo; barra SOS em todas as telas do app (definido pelo Otto em 25/09).
- SOS e FAQ de eletrônicos: MMSI/DSC (botão DISTRESS) no VHF 315 e no VHF 215 — qualquer um dos dois serve (definido pelo Otto em 25/09).
- Base de conhecimento incompleta: fim do manual Azimut, plano de manutenção D8, falhas do Onan, alarmes do Glass Cockpit; PDFs escaneados sem texto.
- Consumo "≈ 186 L desde 14/08" marcado "até 20/09" (não recalculado).

## Testes locais
Sem internet para CDN: baixar react/react-dom 18.3.1 e @babel/standalone 7.29.0 com `npm pack` e servir via rota do Playwright
(Chromium em /opt/pw-browsers). Injetar sessão: localStorage `avanti.sessao.v1 = {u:'otto', em, exp}`. Verificar as 37 telas sem erro de script.
