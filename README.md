# Avanti Vessel AI

Cérebro operacional da **Azimut Atlantis 51 · Avanti Vessel**: chat com a embarcação, console de telemetria e manutenção, FAQ de bordo e SOS. Tem versão **web** (computador e tablet) e versão **app** (celular).

- **Abrir:** https://avantivesselai.github.io/AvantiVessel_AI/
- **Todas as telas:** https://avantivesselai.github.io/AvantiVessel_AI/?v=lista
- **Manual de uso:** https://avantivesselai.github.io/AvantiVessel_AI/Manual-Avanti-Vessel-AI.dc.html
- **Guia rápido (PDF, para quem nunca usou):** https://avantivesselai.github.io/AvantiVessel_AI/Guia-Rapido-Avanti-Vessel-AI.pdf

> **Versão 1.4.6 · 26/09/2026** · designed by Wonder BOAT | Wonder HUB.AI

> É um protótipo navegável. Os números vêm da leitura do coletor YDWG-02 de 25/09/2026 às 17:43 (atracado; Seakeeper ligado; motores em marcha lenta até 14:03 e gerador até 14:07, desligados depois; diesel da última leitura com motores ligados, 13:59). Nada é inventado: quando falta o dado, a tela mostra **SEM DADOS**.

## Acesso

Toda tela pede login. Usuários: **Otto**, **Lucas**, **Giovanni** e **Amanda** (a senha é combinada com a equipe; não fica neste repositório).

- **Manter conectado:** o acesso vale 30 dias no aparelho. Sem essa opção, vale 12 horas. Vale para todas as abas; ao vencer com uma tela aberta, ela volta para o login.
- **Sair:** no rodapé de qualquer tela. Encerra a sessão em todas as abas.
- O nome de quem entrou aparece no chat, na saudação, no avatar e nos registros novos do diário.
- Depois de 5 senhas erradas, o login trava por 30 s (o tempo dobra a cada nova tentativa errada, até 15 min). Erros de mais de 1 hora atrás não contam.

> **Limite:** é uma porta de entrada, não proteção real. O site é estático e o repositório é público: quem abrir os arquivos direto no GitHub vê o conteúdo. A senha é guardada só como hash (PBKDF2-SHA-256), mas é curta e pode ser descoberta por tentativa. Para proteger de verdade, o repositório precisa ser privado e o site precisa de login no servidor (ex.: Cloudflare Access).

## Como abrir

| Endereço | O que abre |
|---|---|
| `/` | Pede login e detecta o aparelho: celular abre o app, computador ou tablet abre a web |
| `/?v=app` | Sempre o app neste aparelho |
| `/?v=web` | Sempre a web neste aparelho |
| `/?v=auto` | Volta a detectar o aparelho |
| `/?v=lista` | Lista de todas as telas |

### Instalar no celular

- **iPhone (Safari):** Compartilhar › Adicionar à Tela de Início
- **Android (Chrome):** menu ⋮ › Instalar app

O app abre em tela cheia, com o ícone Avanti. No Android, segurar o ícone mostra atalhos para SOS, Console e Diário.

## O que dá para fazer

- **Chat com o barco:** pergunta por texto, foto, vídeo, voz→texto ou conversa por voz. Cada resposta cita a fonte.
- **Barra do assistente:** a mesma em todas as telas do app, embaixo, abaixo do SOS (campo + TEXTO · VOZ→TEXTO · CONVERSA · FOTO · VÍDEO). Fora do início, leva a pergunta ou o modo para a conversa da tela inicial; no Diário, grava direto no diário.
- **Atalhos:** perguntas prontas, enviadas com um toque. Dá para editar, reordenar, criar e remover (até 8).
- **Console:** telemetria ao vivo e histórico, gestão, manutenção (com o botão Executado), documentos, abastecimento, diário de bordo e equipe.
- **FAQ de bordo:** passo a passo por equipamento: gerador, climatização, estabilizador e eletrônicos.
- **SOS:** canal 16 com roteiro MAYDAY, homem ao mar (MOB), incêndio e EPIRB. Está em todas as telas.
- **Conversa por voz:** botão CONVERSA (ícone do barco com anel girando devagar) em destaque no centro da barra do app. Durante a conversa abre o **núcleo de IA** em tela cheia: anéis graduados girando devagar, espectro discreto que acompanha a voz, hora e posição do barco. Ciano na ESCUTA (mostra a transcrição), acelera no PROCESSANDO e fica azul-elétrico na RESPOSTA (mostra a frase dita). Tocar no núcleo envia a pergunta na hora ou interrompe a resposta; ENCERRAR desliga. O SOS continua no canto. A voz fala só o essencial; o detalhe fica na tela.
- **Cabeçalho ao vivo (início e SOS):** hora local do barco atualizada sozinha · máxima/mínima do dia (modelo ECMWF, o padrão do windy.com) · maré agora (ex.: +0,6m). Tocar abre o windy.com na posição do barco.
- **Saudação:** uma frase marinheira sorteada a cada vez que a página abre (“Terra à vista!”, “À frente e AVANTI!”…).
- **Base de conhecimento:** perguntas técnicas são respondidas com trechos dos manuais (fonte e página); sem resultado, o chat oferece o botão para a base completa no NotebookLM.
- **Tema claro/escuro:** botão sol/lua ao lado do avatar. O SOS do app e o alerta crítico ficam sempre escuros.
- **Guia rápido:** ícone “↓ Guia” no rodapé do início (web e app) baixa o PDF para quem nunca usou; funciona sem internet depois da primeira visita.

## Telas

Todos os arquivos terminam em `.dc.html`.

| Web (1440 × 900) | App (390 × 844) |
|---|---|
| `Main` · Início | `H2-Home-Mobile` · Início |
| `A1-Ponte-Web` · Telemetria | `A2-Ponte-Mobile` · Console · `A3-Ponte-Editar` · editar blocos |
| `B1-Carta-Web` · Gestão | `B2-Carta-Mobile` · Sistemas · `B3-Carta-Resposta` · resposta por voz |
| `C1-Leme-Web` · Manutenção | `C2-Leme-Mobile` · Leme · `C3-Leme-Alerta` · alerta crítico |
| `G1-Documentos-Web` | `G1-Documentos-Mobile` |
| `G2-Abastecimento-Web` | `G2-Abastecimento-Mobile` |
| `G3-Diario-Web` | `G3-Diario-Mobile` |
| `G4-Equipe-Web` | `G4-Equipe-Mobile` |
| `F1-FAQ-Hub-Web` e `F2`–`F5` `-Web` | `F1-FAQ-Hub` e `F2`–`F5` |
| `H3-Atalhos-Editar-Web` | `H3-Atalhos-Editar` |
| `S1-SOS-Web` | `S2-SOS-Mobile` |
| — | `E1-Navegando-Gatilhos` · `E2-Navegando-Sintoma` · modo navegação |

Também há duas pranchetas de apoio:

- `Manual-Avanti-Vessel-AI`: apresentação de uso, com 24 slides (v18 · 26/09/2026).
- `D-Botoes`: especificação dos botões.

E um guia à parte, para imprimir ou mandar a quem nunca usou o app:

- `Guia-Rapido-Avanti-Vessel-AI.pdf`: guia rápido em 9 páginas A4 (entrar, instalar, perguntar ao barco, cores, console, problemas comuns e a página de EMERGÊNCIA para colar a bordo). A fonte é `guia-rapido/Guia-Rapido-Avanti-Vessel-AI.html`.

## Dados e privacidade

- **O site é público.** Quem tiver o link vê todas as telas, incluindo registro, MMSI e a posição do snapshot fixo.
- **O que você edita fica salvo no navegador** (localStorage): atalhos, diário, tarefas executadas, documentos enviados, equipe, blocos, tema e sessão de login.
  - Não sincroniza entre aparelhos nem entre pessoas.
  - Limpar os dados do navegador apaga tudo isso.
- **Fotos, vídeos e PDFs enviados não saem do aparelho.** Cada um vira uma linha A CONFERIR no diário.

## Clima e maré

- **Previsão:** máxima e mínima de hoje do modelo **ECMWF** (o mesmo que o windy.com mostra por padrão), pela API gratuita do Open-Meteo. O windy.com não tem uma API gratuita que um site público possa usar sem expor a chave.
- **Maré:** altura agora em relação ao **nível médio do mar** (Open-Meteo Marine). É um modelo de 8 km, **não é a tábua oficial da DHN** (Ilha Fiscal): serve de referência rápida, não para passar em canal raso.
- Sem internet, mostra a última leitura salva no aparelho; sem nenhuma, mostra “—”.

## Voz

Uma voz só: a melhor voz **masculina** pt-BR do aparelho, gratuita, em velocidade normal. Sem conta, sem chave, sem configuração.

- **Computador:** use o **Microsoft Edge** — traz a voz neural “Antonio (Natural)”, a mais humana disponível de graça.
- **iPhone:** Ajustes › Acessibilidade › Conteúdo Falado › Vozes › Português (Brasil) › baixe o **Felipe** na melhor qualidade.
- **Android:** Ajustes › Conversão de texto em voz › mecanismo **Google** › Português (Brasil) › escolha uma variante masculina.

**Fala direta:** na conversa por voz, o app fala só o essencial (a primeira linha da resposta, sem as fontes); a resposta completa fica na tela. Emergências (SOS, pressão de óleo, EPIRB) são lidas inteiras.

## Base de conhecimento de bordo

`base-conhecimento.json` traz cerca de 1.000 trechos técnicos, com a fonte e a página, extraídos dos manuais e guias do Drive: Azimut (manual do proprietário), Volvo Penta D8/IPS (operação, serviço, falhas, códigos, emergência), Onan, Seakeeper, Dometic, Sea-Fire, Quick, Garmin (Glass Cockpit, VHF/AIS, Reactor, GPSMAP), Fusion, Yacht Devices, inventário, checklist de partida, rota Rio–Angra e registro técnico do EPIRB.

- **Como responde:** quando a resposta pronta não tem o dado, ou a pergunta é específica (como, código, óleo, alarme, onde fica…), o chat e a voz buscam na base e mostram o trecho com a fonte (“Manual de Serviço Gerador Onan MDKDP, p. 40”). Trechos em inglês aparecem na tela; a voz só avisa onde estão.
- **Sem internet:** a base fica no aparelho depois da primeira visita.
- **Nenhum documento sensível:** contratos, notas fiscais, títulos, transferência de propriedade e dados pessoais (nomes de terceiros, CPF/CNPJ, telefones, e-mails, valores) ficaram de fora. A conexão com IA para esses documentos fica para depois, com o site protegido.
- **Lacunas conhecidas:** o Drive entregou só parte de alguns PDFs grandes. Faltam, entre outros, o fim do manual do proprietário Azimut (a partir de Sistemas), a parte final do manual do operador D8/IPS15 (partida em diante vem dos capítulos IPS avulsos), o plano de manutenção D8, a lista de falhas do gerador Onan e as telas de motor/alarmes do Glass Cockpit. O Memorial Descritivo, o “Azimut – Português” e o capítulo de manutenção IPS são digitalizados (sem texto).
- A base completa continua no [NotebookLM](https://notebook.google.com/notebook/f8238fa6-ff5e-4cc8-b0f1-e664927a42a6) (botão no chat quando nada é encontrado).

## Telemetria ao vivo (preparada, desligada)

O coletor YDWG-02 já grava no Drive a cada ~10 s (`snapshot_live_latest.json`, pasta de telemetria). O app está pronto para ler essa leitura, mas **vem desligado**: sem configuração, continua com o snapshot fixo (hoje, a leitura de 25/09 17:43).

**Como fica quando ligado:** posição, tanques (água, cinzas, negras), vento/barômetro/temperaturas, baterias e estado do Seakeeper passam a vir da leitura real (“ao vivo 10:34”), atualizada a cada 30 s. Leitura com mais de 10 min volta ao snapshot. Diesel e horímetros seguem do último registro com motores ligados.

**Por que um intermediário:** o arquivo tem a posição do barco e continua **privado** no Drive. Quem lê é o intermediário `telemetria-worker/` (Cloudflare, grátis), com uma conta de serviço do Google, e só responde a aparelhos com a chave.

**Para ligar (depois da demonstração):**
1. Google Cloud › IAM › Contas de serviço: criar uma conta e gerar uma chave JSON. No Drive, compartilhar `snapshot_live_latest.json` com o e-mail dela (Leitor).
2. Na pasta `telemetria-worker/`: preencher `GOOGLE_SA_EMAIL` no `wrangler.toml`; `npx wrangler secret put GOOGLE_SA_KEY` (a `private_key` do JSON); `npx wrangler secret put CHAVE_APP` (uma chave longa aleatória); `npx wrangler deploy`.
3. Pôr o endereço gerado em `URL_PROXY` no `avanti-telemetria.js` e publicar.
4. Em cada aparelho da equipe, abrir uma vez o app com `#tele=<CHAVE_APP>` no fim do endereço (a chave fica só naquele aparelho e sai do endereço na hora). `#tele=sair` apaga.

> O ideal é fazer junto com o login no servidor (repositório privado ou Cloudflare Access), quando os documentos sensíveis também forem conectados.

## Requisitos

- **Internet na primeira visita:** a biblioteca da interface e a fonte vêm de servidores externos. Depois da primeira visita com internet, todas as telas abrem sem internet (inclusive o SOS).
- **Voz:** funciona no Chrome, Edge ou Safari, com permissão de microfone. O Firefox não reconhece voz.
- **Navegador:** uma versão atual do Chrome, Edge, Safari ou Firefox.

## Estrutura

```
index.html              entrada: detecta o aparelho e lista as telas
login.html              login da equipe
*.dc.html               37 telas (web e app)
support.js              motor que monta as telas
avanti-auth.js          login, usuário logado, versão, rodapé, saudação e cumprimento
avanti-brain.js         respostas do chat, atalhos, diário e voz
avanti-theme.js         tema claro/escuro e botão sol/lua
avanti-app.js           configuração de app, ajuste à janela, cache offline
avanti-clima.js         hora local, previsão do dia e maré no cabeçalho
avanti-voz.js           núcleo de IA da conversa por voz
avanti-barra.js         barra do assistente (<avanti-barra-chat>), igual em todas as telas do app
base-conhecimento.json  trechos técnicos dos manuais (busca do chat e da voz)
avanti-telemetria.js    telemetria ao vivo do coletor (desligada até configurar)
deck-stage.js           apresentação do manual
Guia-Rapido-Avanti-Vessel-AI.pdf  guia rápido para leigo (PDF A4)
guia-rapido/            fonte HTML e imagens do guia rápido
manifest.webmanifest    app instalável
sw.js                   cache offline
telemetria-worker/      intermediário protegido da telemetria (Cloudflare Worker + conta de serviço Google)
assets/                 logo e ícones
.nojekyll               publica os arquivos exatamente como estão
CLAUDE.md               guia do projeto para o Claude (contexto, dados atuais, privacidade)
```

## Versões

A versão aparece no rodapé de todas as telas. Para lançar uma nova, altere `VERSAO` em `avanti-auth.js` e `CACHE` em `sw.js`, e registre aqui.

| Versão | Data | O que mudou |
|---|---|---|
| 1.4.6 | 26/09/2026 | Telemetria ao vivo com cadência automática: navegando, 30 s até 5 nós, 10 s até 12 nós, 5 s acima; atracado, 2 min nos primeiros 30 min, 5 min até 1 h e 10 min depois · cache do proxy cai de 15 s para 4 s (continua desligada até configurar o proxy) |
| 1.4.5 | 26/09/2026 | Barra do assistente igual em todas as telas do app (a mesma da tela inicial: campo “Pergunte ao barco…” + enviar; TEXTO · VOZ→TEXTO · CONVERSA · FOTO · VÍDEO), na base, abaixo do SOS; fora do início, leva a pergunta ou o modo para a conversa da tela inicial; no Diário grava direto · saem a navegação inferior de Sistemas e Equipe, “Falar · mãos no leme”, “Conversa contínua ligada” e os botões soltos de voz/foto · login com os 4 nomes numa linha e sem espaço vazio · manual v19 e guia atualizados |
| 1.4.4 | 26/09/2026 | Dados da leitura do coletor de 25/09 17:43 (atracado; motores 14:03; diesel 28,0/28,8 % ≈ 426 L; gerador 286,1 h; negras 11,9 %) · EPIRB no cockpit principal e Sea-Fire conforme o inventário · sem VHF 115 · barra SOS em todas as telas do app · alerta crítico sem “alarme sonoro” · ícone “Guia” no rodapé do início (web e app) baixa o Guia rápido · ícones que não encolhem · verificação de responsividade e tema em 36 telas × 2 temas × 4 tamanhos |
| 1.4.3 | 25/09/2026 | Manual de uso atualizado (24 slides, dados de 25/09 13:40, login, voz, cabeçalho ao vivo e base de conhecimento) · Guia rápido em PDF para leigo · tanques de diesel 2 × 750 L também na base · homologação ANATEL do VHF 315 (nº 07897-25-01493) · SOS com MMSI/DSC no VHF 315 e no VHF 215 |
| 1.4.2 | 25/09/2026 | CLAUDE.md com o guia do projeto para novas sessões · README revisado |
| 1.4.1 | 25/09/2026 | Dados atualizados com a leitura do coletor de 25/09 13:40 (diesel 27,6/28,8 % ≈ 423 L, horímetros 110/106 h, gerador 285,6 h, tanques, vento, barômetro) · prazos recalculados para 25/09 (3 atrasadas) · cumprimento pelo horário · telemetria ao vivo preparada e desligada |
| 1.4.0 | 25/09/2026 | Base de conhecimento de bordo: ~1.000 trechos técnicos dos manuais do Drive, com fonte e página, usados pelo chat e pela voz (offline) · sem documentos sensíveis |
| 1.3.4 | 25/09/2026 | Ícone do barco Avanti no botão CONVERSA e no centro do núcleo de voz (no lugar do “AI”) · botão CONVERSA com brilho e giro mais suaves |
| 1.3.3 | 25/09/2026 | Núcleo de voz mais discreto (sem varredura nem grade, giros lentos, espectro menor) · tela da voz se ajusta a celulares pequenos (sem o núcleo sobre o texto) · transcrição sem palavras repetidas no Android |
| 1.3.2 | 25/09/2026 | Voz única, masculina e gratuita do aparelho · fala só o essencial (resposta completa na tela; emergências lidas inteiras) · abertura “Pode falar.” · sem ⚙ VOZ, sem ElevenLabs e sem proxy de voz |
| 1.3.1 | 25/09/2026 | Núcleo de IA high-tech no lugar do diamante (tela da conversa e botão central) · ⚙ VOZ: voz carioca do ElevenLabs direto do aparelho · abertura da conversa no jeito carioca · SOS mais sóbrio: só a borda da tela pulsa, botões sólidos e legíveis |
| 1.3.0 | 25/09/2026 | Conversa por voz com diamante animado (pergunta e resposta) · CONVERSA no centro da barra do app · voz do Otto pela nuvem (ElevenLabs, opcional) com voz masculina do aparelho como reserva · hora local ao vivo, máx/mín do dia e maré no cabeçalho · saudação sorteada · SOS com sirene vermelha, luz de alerta e EMERGÊNCIA centralizada (sem “alarme sonoro”) · botão da base NotebookLM no chat |
| 1.2.0 | 25/09/2026 | Voz a 1× · voz→texto e conversa esperam a pessoa terminar de falar · usuária Amanda · convite pela Equipe envia por WhatsApp ou e-mail · tablet em pé e janelas estreitas abrem o app · SOS flutuante no celular quando o SOS da tela fica fora da vista · Equipe web com 4 perfis sem sobreposição |
| 1.1.0 | 24/09/2026 | Login (Otto, Lucas, Giovanni) e nome do usuário no chat e no diário · rodapé com versão e crédito · voz natural a 1,25× lendo unidades e siglas por extenso · celular abre o app mesmo por link direto de tela web · correções da auditoria |
| 1.0.0 | 24/09/2026 | Primeira publicação: 37 telas web e app, chat, console, FAQ e SOS |

## Publicar e atualizar

1. Em **Settings › Pages › Deploy from a branch**, escolha `main` e `/ (root)` e clique em **Save**.
2. Para atualizar, gere um pacote novo, descompacte e envie os arquivos para a raiz com **Add file › Upload files**. Arquivos com o mesmo nome são substituídos.
3. A nova versão entra no ar em 1 a 2 minutos. Se o celular ainda mostrar a anterior, feche e abra o app de novo.

---

Azimut Atlantis 51 · registro 3813927725 · casco 51BR153
