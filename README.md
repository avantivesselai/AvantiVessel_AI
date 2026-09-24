# Avanti Vessel AI

Cérebro operacional da **Azimut Atlantis 51 · Avanti Vessel**: chat com a embarcação, console de telemetria e manutenção, FAQ de bordo e SOS. Tem versão **web** (computador e tablet) e versão **app** (celular).

- **Abrir:** https://avantivesselai.github.io/AvantiVessel_AI/
- **Todas as telas:** https://avantivesselai.github.io/AvantiVessel_AI/?v=lista
- **Manual de uso:** https://avantivesselai.github.io/AvantiVessel_AI/Manual-Avanti-Vessel-AI.dc.html

> É um protótipo navegável. Os números vêm do snapshot de 20/09/2026 às 23:01 (a telemetria é das 13:23). Nada é inventado: quando falta o dado, a tela mostra **SEM DADOS**.

## Como abrir

| Endereço | O que abre |
|---|---|
| `/` | Detecta o aparelho: celular abre o app, computador ou tablet abre a web |
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
- **Atalhos:** perguntas prontas, enviadas com um toque. Dá para editar, reordenar, criar e remover (até 8).
- **Console:** telemetria ao vivo e histórico, gestão, manutenção (com o botão Executado), documentos, abastecimento, diário de bordo e equipe.
- **FAQ de bordo:** passo a passo por equipamento: gerador, climatização, estabilizador e eletrônicos.
- **SOS:** canal 16 com roteiro MAYDAY, homem ao mar (MOB), incêndio e EPIRB. Está em todas as telas.
- **Tema claro/escuro:** botão sol/lua ao lado do avatar.

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

- `Manual-Avanti-Vessel-AI`: apresentação de uso, com 19 slides.
- `D-Botoes`: especificação dos botões.

## Dados e privacidade

- **O site é público.** Quem tiver o link vê todas as telas, incluindo registro, MMSI e posição do snapshot.
- **O que você edita fica salvo no navegador** (localStorage): atalhos, diário, tarefas executadas, documentos enviados, equipe, blocos e tema.
  - Não sincroniza entre aparelhos nem entre pessoas.
  - Limpar os dados do navegador apaga tudo isso.
- **Fotos, vídeos e PDFs enviados não saem do aparelho.** Cada um vira uma linha A CONFERIR no diário.

## Requisitos

- **Internet na primeira visita:** a biblioteca da interface e a fonte vêm de servidores externos. Depois disso, as telas já abertas funcionam sem internet.
- **Voz:** funciona no Chrome, Edge ou Safari, com permissão de microfone. O Firefox não reconhece voz.
- **Navegador:** uma versão atual do Chrome, Edge, Safari ou Firefox.

## Estrutura

```
index.html              entrada: detecta o aparelho e lista as telas
*.dc.html               37 telas (web e app)
support.js              motor que monta as telas
avanti-brain.js         respostas do chat, atalhos, diário e voz
avanti-theme.js         tema claro/escuro e botão sol/lua
avanti-app.js           configuração de app, ajuste à janela, cache offline
deck-stage.js           apresentação do manual
manifest.webmanifest    app instalável
sw.js                   cache offline
assets/                 logo e ícones
.nojekyll               publica os arquivos exatamente como estão
```

## Publicar e atualizar

1. Em **Settings › Pages › Deploy from a branch**, escolha `main` e `/ (root)` e clique em **Save**.
2. Para atualizar, gere um pacote novo, descompacte e envie os arquivos para a raiz com **Add file › Upload files**. Arquivos com o mesmo nome são substituídos.
3. A nova versão entra no ar em 1 a 2 minutos. Se o celular ainda mostrar a anterior, feche e abra o app de novo.

---

Azimut Atlantis 51 · registro 3813927725 · casco 51BR153
