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

## Lançar versão
Alterar `VERSAO` em `avanti-auth.js`, `CACHE` em `sw.js` e a tabela de versões no `README.md`. Arquivo novo usado offline → adicionar em `CORE` do `sw.js`.

## Dados atuais
- Snapshot fixo nas telas e no chat: **coletor YDWG-02 · 25/09/2026 13:40** (motores em marcha lenta, gerador e Seakeeper ligados).
  Diesel 27,6/28,8 % (≈ 423 L de 1.500; tanque 0 = BB, 1 = BE — a confirmar), horímetros 110/106 h, gerador 285,6 h.
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
- SOS e FAQ de eletrônicos: MMSI/DSC (botão DISTRESS) no VHF 315 e no VHF 215 — qualquer um dos dois serve (definido pelo Otto em 25/09).
- Base de conhecimento incompleta: fim do manual Azimut, plano de manutenção D8, falhas do Onan, alarmes do Glass Cockpit; PDFs escaneados sem texto.
- Consumo "≈ 186 L desde 14/08" marcado "até 20/09" (não recalculado).

## Testes locais
Sem internet para CDN: baixar react/react-dom 18.3.1 e @babel/standalone 7.29.0 com `npm pack` e servir via rota do Playwright
(Chromium em /opt/pw-browsers). Injetar sessão: localStorage `avanti.sessao.v1 = {u:'otto', em, exp}`. Verificar as 37 telas sem erro de script.
