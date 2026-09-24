/* Avanti Vessel AI — cérebro do protótipo: atalhos, diário, respostas canônicas e voz.
   Dados do snapshot 20/09/2026 23:01 BRT (telemetria 13:23, motores a 600 rpm). Nada inventado: sem dado → SEM DADOS. */
(function () {
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  var has = function (q, list) { return list.some(function (k) { return q.indexOf(k) !== -1; }); };

  var HREF = {
    web: { home: 'Main.dc.html', console: 'A1-Ponte-Web.dc.html', gestao: 'B1-Carta-Web.dc.html', manut: 'C1-Leme-Web.dc.html', docs: 'G1-Documentos-Web.dc.html', abast: 'G2-Abastecimento-Web.dc.html', diario: 'G3-Diario-Web.dc.html', equipe: 'G4-Equipe-Web.dc.html', faq: 'F1-FAQ-Hub-Web.dc.html', f2: 'F2-FAQ-Estabilizador-Web.dc.html', f3: 'F3-FAQ-Piloto-Web.dc.html', f4: 'F4-FAQ-Gerador-Web.dc.html', f5: 'F5-FAQ-Climatizacao-Web.dc.html', sos: 'S1-SOS-Web.dc.html', atalhos: 'H3-Atalhos-Editar-Web.dc.html' },
    app: { home: 'H2-Home-Mobile.dc.html', console: 'A2-Ponte-Mobile.dc.html', gestao: 'B2-Carta-Mobile.dc.html', manut: 'C2-Leme-Mobile.dc.html', docs: 'G1-Documentos-Mobile.dc.html', abast: 'G2-Abastecimento-Mobile.dc.html', diario: 'G3-Diario-Mobile.dc.html', equipe: 'G4-Equipe-Mobile.dc.html', faq: 'F1-FAQ-Hub.dc.html', f2: 'F2-FAQ-Estabilizador.dc.html', f3: 'F3-FAQ-Piloto.dc.html', f4: 'F4-FAQ-Gerador.dc.html', f5: 'F5-FAQ-Climatizacao.dc.html', sos: 'S2-SOS-Mobile.dc.html', atalhos: 'H3-Atalhos-Editar.dc.html' }
  };

  var DEFAULTS = [
    { id: 'diario', l: 'DIÁRIO DE BORDO', q: 'Registre no diário o resumo da navegação de agora e confirme.' },
    { id: 'seguro', l: 'SEGURO PARA SAIR?', q: 'Avalie vento, mar, motores e pendências — sim ou não, e por quê.' },
    { id: 'destinos', l: 'PARA ONDE VAMOS HOJE?', q: '3 destinos saindo daqui, com distância, tempo e diesel.' },
    { id: 'manutencao', l: 'PRÓXIMAS MANUTENÇÕES', q: 'O que vence primeiro, o que está atrasado, o que falta registrar.' },
    { id: 'autonomia', l: 'AUTONOMIA', q: 'Autonomia com reserva de 10% pelas horas desde os 500 L.' },
    { id: 'mare', l: 'MARÉ AGORA', q: 'Maré e corrente agora e nas próximas 6 h na posição atual.' }
  ];
  var BANK = [
    { id: 'clima', l: 'CLIMA', q: 'Clima e vento agora e nas próximas horas na posição atual.' },
    { id: 'canal16', l: 'CANAL 16', q: 'Roteiro de chamada no VHF canal 16 com os dados do barco.' },
    { id: 'checklist', l: 'CHECKLIST DE SAÍDA', q: 'Checklist de saída com o que está catalogado a bordo.' },
    { id: 'consumo', l: 'CONSUMO', q: 'Consumo de diesel observado por regime e desde o último abastecimento.' },
    { id: 'tanques', l: 'TANQUES', q: 'Nível de todos os tanques agora.' },
    { id: 'contatos', l: 'CONTATOS', q: 'Equipe, dealer, marina e prestadores — quem chamar.' },
    { id: 'anomalias', l: 'ANOMALIAS ABERTAS', q: 'Anomalias registradas e pendências abertas no diário.' },
    { id: 'porao', l: 'PORÃO', q: 'Situação das bombas de porão e do teste mensal.' },
    { id: 'gerador', l: 'GERADOR', q: 'Como ligar e desligar o gerador e quantas horas ele tem.' },
    { id: 'posicao', l: 'POSIÇÃO AGORA', q: 'Posição, proa e velocidade agora.' },
    { id: 'docsvenc', l: 'DOCUMENTOS VENCENDO', q: 'Quais documentos e licenças vencem primeiro.' },
    { id: 'horimetros', l: 'HORÍMETROS', q: 'Horas dos motores e do gerador e a próxima revisão.' }
  ];
  var ALL = DEFAULTS.concat(BANK);

  var K = { atalhos: 'avanti.atalhos.v1', diario: 'avanti.diario.v1', equipe: 'avanti.equipe.v1', exec: 'avanti.executado.v1', docs: 'avanti.docs.v1' };
  function read(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  function cleanShortcut(x) { return x && typeof x.l === 'string' && typeof x.q === 'string' && x.l.trim() && x.q.trim() ? { id: String(x.id || ('custom-' + Math.random().toString(36).slice(2, 8))), l: x.l.trim().slice(0, 28), q: x.q.trim().slice(0, 240) } : null; }
  function loadShortcuts() {
    var v = read(K.atalhos, null);
    if (Array.isArray(v)) {
      var seen = {}; var list = v.map(cleanShortcut).filter(function (x) { if (!x || seen[x.id]) return false; seen[x.id] = 1; return true; }).slice(0, 8);
      if (list.length || !v.length) return list;
    }
    return DEFAULTS.map(function (x) { return Object.assign({}, x); });
  }
  function saveShortcuts(list) { write(K.atalhos, list); }
  function resetShortcuts() { try { localStorage.removeItem(K.atalhos); } catch (e) {} return loadShortcuts(); }
  function bankFor(list) { var ids = list.map(function (x) { return x.id; }); return ALL.filter(function (x) { return ids.indexOf(x.id) === -1; }); }

  function now() { var d = new Date(); var p = function (n) { return (n < 10 ? '0' : '') + n; }; return { d: p(d.getDate()) + '/' + p(d.getMonth() + 1), t: p(d.getHours()) + ':' + p(d.getMinutes()), iso: d.toISOString() }; }
  function loadDiario() { var v = read(K.diario, []); return Array.isArray(v) ? v.filter(function (e) { return e && typeof e.t === 'string'; }) : []; }
  function addDiario(e) { var n = now(); var list = loadDiario(); var entry = Object.assign({ d: n.d, t: n.t, iso: n.iso, sys: 'Diário', tone: 'var(--av-accent, #409cff)', who: 'Otto', src: 'app · texto' }, e); list.unshift(entry); write(K.diario, list); return entry; }
  function loadExec() { var v = read(K.exec, {}); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function markExec(task) { var m = loadExec(); m[task] = now(); write(K.exec, m); return m; }
  function loadEquipe() { var v = read(K.equipe, null); var o = v && typeof v === 'object' ? v : {}; return { fones: o.fones && typeof o.fones === 'object' && !Array.isArray(o.fones) ? o.fones : {}, convites: Array.isArray(o.convites) ? o.convites.filter(function (c) { return c && typeof c.nome === 'string'; }) : [] }; }
  function saveEquipe(v) { write(K.equipe, v); }
  function loadDocs() { var v = read(K.docs, []); return Array.isArray(v) ? v.filter(function (d) { return d && typeof d.n === 'string'; }) : []; }
  function addDoc(d) { var list = loadDocs(); list.unshift(d); write(K.docs, list); return list; }

  var SNAP = { pos: "22°57,09'S 043°10,23'W", hora: '20/09 23:01', diesel: 'BB 34,0 % · BE 34,8 % (≈ 516 L de 1.500)', dieselHora: 'última leitura com motores ligados · 20/09 13:23' };

  function A(platform, key) { return (HREF[platform] || HREF.web)[key]; }
  function act(platform, pairs) { return pairs.map(function (p) { return { l: p[0], href: p[1].indexOf('.html') !== -1 || p[1].indexOf('#') === 0 ? p[1] : A(platform, p[1]) }; }); }
  function askHref(platform, q) { return A(platform, 'home') + '#q=' + encodeURIComponent(q); }

  var ANSWERS = {
    saudacao: function (p) { return { text: 'Olá, Otto. Onde vamos hoje?\nPosso responder sobre telemetria ao vivo, manutenção, documentos, abastecimento, diário de bordo e os passos de cada equipamento — sempre citando a fonte.', src: 'Snapshot 20/09/2026 23:01 · coletor NMEA online', actions: act(p, [['Console completo', 'console'], ['FAQ de bordo', 'faq']]) }; },
    diario: function (p, ctx) {
      var n = now();
      var t = 'Atracado · Rio de Janeiro · ' + SNAP.pos + ' · SOG 0,0 nós · proa 046° · motores desligados · banco 24 V 27,49 V · vento 5,3 nós de 025° · diesel ' + SNAP.diesel + ' (' + SNAP.dieselHora + ').';
      if (ctx && ctx.commit !== false) addDiario({ sys: 'Navegação', tone: 'var(--av-tele, #5ac8fa)', t: 'Resumo de agora registrado pelo atalho: ' + t, who: 'Otto', src: 'atalho · telemetria 20/09' });
      return { text: 'Registrado no diário de bordo · ' + n.d + ' ' + n.t + ' · Otto\n' + t + '\nLinha nova — nada se apaga.', src: 'Fonte: telemetria NMEA 20/09 23:01 · DIARIO_BORDO_OPERACIONAL.csv', actions: act(p, [['Abrir diário', 'diario']]) };
    },
    seguro: function (p) { return { text: 'Sim, com duas ressalvas.\n• Condições: vento 5,3 nós de 025° · barômetro 1014 hPa estável · 9 satélites · banco 24 V 27,49 V em flutuação.\n• Diesel ≈ 516 L (BB 34,0 % · BE 34,8 %) → ≈ 22 h a 8,4 nós com reserva de 10 %.\n• Ressalva 1: teste das bombas de porão e alarmes vencido há 95 dias — acione cada bomba no manual antes de largar.\n• Ressalva 2: sem previsão meteorológica carregada (SEM DADOS) — confira Marinha/DHN.\nMotores desligados: RPM, óleo e temperatura só aparecem após a partida.', src: 'Fonte: telemetria 20/09 23:01 · agenda preditiva (35 tarefas) · NF-e 002925', actions: act(p, [['Ver manutenção', 'manut'], ['Checklist de saída', askHref(p, 'Checklist de saída')]]) }; },
    destinos: function (p) { return { text: '3 destinos a partir da Marina da Glória, no regime observado (8,4 nós · 20,9 L/h), só ida:\n1. Ilhas Cagarras — ≈ 7 mn · ≈ 50 min · ≈ 17 L\n2. Itaipu / Itacoatiara (Niterói) — ≈ 10 mn · ≈ 1 h 10 · ≈ 25 L\n3. Ilha Grande (Abraão) — ≈ 60 mn · ≈ 7 h · ≈ 150 L; ida e volta ≈ 300 L — cabe nos 516 L com reserva, mas sem margem para gerador e manobra: abastecer antes.\nDistâncias em linha reta pela posição atual — confirme a rota no plotter.', src: 'Fonte: posição GPS 20/09 · consumo observado 14/08–20/09 · tanques 13:23', actions: act(p, [['Autonomia', askHref(p, 'Autonomia')], ['Abastecimento', 'abast']]) }; },
    manutencao: function (p) { return { text: 'Atrasadas (2):\n• Filtros do chiller · Dometic PLC L-3527 — 181 dias (estaleiro)\n• Teste de bombas de porão e alarmes — 95 dias (estaleiro)\nPróximas:\n• D-4 · 24/09 — tensões e conexões · Quick VRS / SBC NRG+ (Lucas)\n• D-24 · 14/10 — revisão programada do sistema (Lucas + Avanti)\n• D-33 · 23/10 — isolador galvânico · ProMariner FS30/FS60 (Lucas)\n• D-53 · 12/11 — inspeção de casco, anodos e zincos (Eduardo)\nRevisão dos motores: 16/01/2027 (D-117) ou 280 h — faltam 173,0 h.\nFalta registrar: agenda do Seakeeper (zinco/trocador · 3 meses/150 h).', src: 'Fonte: agenda preditiva · 35 tarefas · horímetros 20/09 13:23', actions: act(p, [['Abrir manutenção', 'manut']]) }; },
    autonomia: function (p) { return { text: '≈ 22 h · ≈ 185 mn a 8,4 nós (1.130 rpm · 20,9 L/h), com reserva de 10 %.\nA bordo ≈ 516 L de 1.500 (BB 34,0 % · BE 34,8 %) — ' + SNAP.dieselHora + '.\nEm marcha lenta (5,1 L/h) ≈ 91 h. Consumido desde os 500 L de 14/08: ≈ 186 L (10,2 h de motor + 22,6 h de gerador).', src: 'Fonte: telemetria (taxas dos dois motores 14/08–20/09) · NF-e 002925 — estimativa; a NF é a fonte oficial', actions: act(p, [['Abastecimento', 'abast']]) }; },
    mare: function (p) { return { text: 'SEM DADOS de maré a bordo: nenhuma tábua carregada para a posição atual (Baía de Guanabara · Rio de Janeiro).\nFonte oficial: DHN — Tábua de Marés do Porto do Rio de Janeiro (Ilha Fiscal). Quando a Data Table receber a tábua, esta resposta mostra altura, tendência e próximas preamar e baixa-mar.', src: 'Fonte: nenhuma — dado ausente (regra: sem dado → SEM DADOS)', actions: act(p, [['Registrar pendência', 'diario']]) }; },
    clima: function (p) { return { text: 'Sem previsão carregada (SEM DADOS). Leitura de agora pela estação meteorológica de bordo:\n• vento verdadeiro 5,3 nós de 025°\n• barômetro 1014 hPa · estável\n• externo 23,8 °C · praça de máquinas 24,5 °C\nFonte oficial para a previsão: Marinha do Brasil — Meteoromarinha (DHN).', src: 'Fonte: telemetria NMEA 20/09 23:01', actions: act(p, [['Telemetria', 'console']]) }; },
    canal16: function (p) { return { text: 'VHF canal 16 (156,800 MHz) — socorro, urgência e chamada. Diran atende no canal 67 (24 h).\nMMSI 710400328 · indicativo PV4476 — programados no VHF 215.\nRoteiro MAYDAY (só perigo grave e iminente):\nMAYDAY, MAYDAY, MAYDAY — AQUI É AVANTI VESSEL, AVANTI VESSEL, AVANTI VESSEL — MMSI 710400328 — POSIÇÃO ' + SNAP.pos + ' — NATUREZA DO PERIGO — Nº DE PESSOAS A BORDO — AUXÍLIO NECESSÁRIO — CÂMBIO.\nUrgência sem perigo de vida: PAN-PAN ×3.', src: 'Fonte: registro EPIRB/MMSI (cert. 67827-001) · protocolo de emergência Avanti · RIPEAM', actions: act(p, [['Abrir SOS', 'sos']]) }; },
    checklist: function (p) { return { text: 'Checklist de saída — do que está catalogado:\n1. Gerador Onan: STOP/Prime 3 s (escorva) → START/Preheat · lâmpada âmbar→verde · partida em 20–60 s.\n2. Estabilizador Seakeeper 6: ligar com AC — 24 min para estabilizar · máx 40 min.\n3. Climatização: Enter habilita · Cool/Heat · setpoint 8–14 °C.\n4. Eletrônicos: plotter ligado · piloto em STBY até sair da marina · AIS transmitindo · VHF no 16.\n5. Bombas de porão: acionamento manual (teste vencido há 95 d).\n6. Diesel BB 34 % · BE 35 % — regra: abastecer antes de 15 % em qualquer tanque.\nAmarração, hidráulica e fechamento: A CONFIRMAR (sem checklist oficial no Drive).', src: 'Fonte: manuais Onan A046J602 · Seakeeper 90403 · Dometic L-3527 · FAQ de eletrônicos · agenda', actions: act(p, [['FAQ de bordo', 'faq']]) }; },
    checklistChegada: function (p) { return { text: 'Checklist de chegada — do que está catalogado:\n1. Estabilizador: desligar ao atracar — 4 h+ até parar totalmente; nunca mexer com o volante girando.\n2. Eletrônicos: piloto em STBY antes de manobrar na marina · plotter e AIS conforme uso.\n3. Gerador Onan: desligar cargas, depois STOP.\n4. Climatização: chiller com lockout de fluxo de 10 s — desligar pelo display.\n5. Fechar a viagem no diário: horas, consumo e custo.\nHidráulica, cuidados e fechamento: A CONFIRMAR (sem checklist oficial no Drive).', src: 'Fonte: manuais Seakeeper 90403 · Onan A046J602 · Dometic L-3527 · FAQ de eletrônicos', actions: act(p, [['Fechar no diário', 'diario']]) }; },
    consumo: function (p) { return { text: 'Consumo observado (telemetria 14/08–20/09):\n• cruzeiro leve — 20,9 L/h (média 1.130 rpm · 8,4 nós)\n• marcha lenta — 5,1 L/h (≤ 900 rpm)\n• gerador — +22,6 h desde 14/08 (280,7 h no horímetro)\nConsumido desde os 500 L: ≈ 186 L. Média por abastecimento aparece a partir do 2º registro — só 1 NF em 2026.', src: 'Fonte: telemetria (taxa de combustível dos dois motores) · NF-e 002925', actions: act(p, [['Abastecimento', 'abast']]) }; },
    tanques: function (p) { return { text: 'Tanques agora:\n• água doce 50,5 %\n• águas cinzas 70,8 % — atenção: programar esgoto\n• águas negras 32,7 %\n• diesel BB 34,0 % · BE 34,8 % (≈ 516 L) — ' + SNAP.dieselHora + '.', src: 'Fonte: telemetria NMEA 20/09 23:01 (diesel 13:23)', actions: act(p, [['Telemetria', 'console']]) }; },
    contatos: function (p) { return { text: 'Acesso total: Otto Licks (proprietário) · Giovanni · Lucas.\nApoio: Eduardo (casco · Marina Express) · dealer Volvo Penta (Health Check 47715565) · estaleiro (chiller e porão) · Sr. Dalmo (Tlaloc · estofados) · Posto Marina da Glória (Verana) · Diran no VHF canal 67 (24 h) · Life Safety (EPIRB).\nTelefones: A CADASTRAR em Equipe.', src: 'Fonte: agenda preditiva · diário 14–24/08 · NF-e 002925', actions: act(p, [['Equipe e contatos', 'equipe']]) }; },
    anomalias: function (p) { return { text: 'Pendências abertas (4):\n• Garantia Azimut — vazamento no teto do cockpit · pleito em rascunho desde 15/08\n• Capas dos estofados na Tlaloc · devolução 31/08 a conferir\n• Seakeeper — vigência da garantia estendida · A CONFIRMAR\n• Coletor NMEA — lacuna de 6 h 58 min em 15/08\nAnomalias registradas (3): combustível baixo BB 9,6 % (14/08, resolvido) · Seakeeper sem AC para o spool-up (15/08) · interrupção da telemetria (15/08).', src: 'Fonte: diário de bordo 14–24/08 · nmea_20260815.jsonl', actions: act(p, [['Abrir diário', 'diario']]) }; },
    porao: function (p) { return { text: 'Teste de bombas de porão e alarmes VENCIDO há 95 dias (agenda: estaleiro · ref. diagrama ATL51).\nSem sensor de porão no barramento NMEA — SEM LEITURA.\nAntes de sair: acione cada bomba no manual e confira o alarme; registre o resultado no diário.', src: 'Fonte: agenda preditiva · telemetria (sem sentença de porão)', actions: act(p, [['Manutenção', 'manut']]) }; },
    gerador: function (p) { return { text: 'Gerador Onan MDKDP · 280,7 h (20/09 13:23).\nLigar: STOP/Prime por 3 s (escorva) → START/Preheat · lâmpada âmbar→verde · partida em 20–60 s.\nDesligar: retire as cargas e pressione STOP.', src: 'Fonte: manual Onan A046J602 §3.2 / §4.2.1 · horímetro na telemetria', actions: act(p, [['Passo a passo', 'f4']]) }; },
    posicao: function (p) { return { text: SNAP.pos + ' · atracado · Rio de Janeiro\nSOG 0,0 nós · proa 046° · 9 satélites · posição válida · ' + SNAP.hora + '.', src: 'Fonte: GPS na rede NMEA 2000 · coletor YDWG-02', actions: act(p, [['Telemetria', 'console']]) }; },
    docsvenc: function (p) { return { text: 'Vencem primeiro:\n• FISTEL + licença de estação — 23/01/2027 (D-124) · renovar na ANATEL\n• Licença do VHF 115 — A CONFERIR (fonte divergente)\n• Seakeeper — garantia estendida · vigência A CONFIRMAR\n• Pleito Azimut (teto do cockpit) — A ENVIAR\nEm dia: TIE até 15/01/2031 · homologações VHF 215 e 315 até 11/11/2028 · EPIRB SBM até jan/2031 · Health Check 47715565 (16/07/2026).', src: 'Fonte: Drive › Documentos_Legais · agenda preditiva', actions: act(p, [['Documentos', 'docs']]) }; },
    horimetros: function (p) { return { text: 'Horímetros (20/09 13:23 · motores a 600 rpm):\n• motor BB 107,0 h\n• motor BE 103,0 h\n• gerador 280,7 h\nPróxima revisão dos motores: 16/01/2027 (D-117) ou 280 h — faltam 173,0 h; a data vence antes.', src: 'Fonte: telemetria NMEA · agenda preditiva · Health Check 47715565', actions: act(p, [['Manutenção', 'manut']]) }; },
    motores: function (p) { return { text: 'Motores 2 × Volvo Penta D8 / IPS15 — 7 manuais no Drive (Manuais_Equipamentos).\nPasso a passo de partida, joystick, DPS e EVC ainda não confirmado: MANUAL NO DRIVE.\nHorímetros BB 107,0 h · BE 103,0 h · Health Check 47715565 em 16/07/2026 (dealer) · troca de óleo 16/07/2026 (500 h ou 12 meses).', src: 'Fonte: Drive › Manuais_Equipamentos · diário 15/08 · protocolo 47715565', actions: act(p, [['Manutenção', 'manut'], ['FAQ de bordo', 'faq']]) }; },
    estabilizador: function (p) { return { text: 'Seakeeper 6 · ligar só com AC (gerador ou shore power).\n• 24 min para estabilizar · máximo 40 min de spool-up · 4 h+ para parar totalmente.\n• Nunca mexer no equipamento com o volante girando — RPM em ZERO; alarme trava o giro sozinho.\nDisplay em 14/08: 159 h RUN · 119 h SEA · gyro 244.7424. Agenda de zinco/trocador (3 meses/150 h): A REGISTRAR.', src: 'Fonte: Seakeeper Operation Manual 90403 Rev.3 §2.2–2.4 · foto do display 14/08', actions: act(p, [['Passo a passo', 'f2']]) }; },
    climatizacao: function (p) { return { text: 'Chiller Dometic PLC L-3527 · display PGD1:\n• Enter habilita · Cool/Heat · setpoint 8–14 °C\n• alarme após 3 s · lockout de fluxo de 10 s\nFiltros VENCIDOS há 181 dias (estaleiro). Controles de cabine MCGX: A CONFIRMAR.', src: 'Fonte: manual Dometic L-3527 · agenda preditiva', actions: act(p, [['Passo a passo', 'f5']]) }; },
    eletronicos: function (p) { return { text: 'Piloto Reactor: Engatar › Rota · ajuste ±1° / ±10° · STBY para soltar — sempre antes de manobrar na marina · Heading Hold mantém a proa.\nPlotter GPSMAP 8x16 · radar Fantom · AIS 800 · VHF 215 — 19 respostas prontas no FAQ de eletrônicos.', src: 'Fonte: FAQ de eletrônicos de bordo · manuais no Drive (Manuais_Equipamentos)', actions: act(p, [['FAQ eletrônicos', 'f3']]) }; },
    audio: function (p) { return { text: 'Áudio Fusion MS-RA770 — parear celular, zonas e "sem som": passo a passo ainda não confirmado no manual. MANUAL NO DRIVE.\nQuando confirmado, entra no FAQ de eletrônicos.', src: 'Fonte: Drive › Manuais_Equipamentos (a conferir)', actions: act(p, [['FAQ eletrônicos', 'f3']]) }; },
    dessalinizador: function (p) { return { text: 'SEM DADOS — dessalinizador não catalogado.\nEnvie a foto da etiqueta (modelo e número de série) para eu catalogar, localizar o manual e montar o passo a passo.', src: 'Fonte: nenhuma — pendência do catálogo', actions: act(p, [['Enviar foto', A(p, 'home') + '#mode=foto']]) }; },
    eletrico: function (p) { return { text: 'Banco 24 V: 27,49 V em flutuação · 7 dias entre 27,0 e 28,7 V · 38 h com dados.\nD-4 (24/09): verificação de tensões e conexões · Quick VRS / SBC NRG+ (Lucas). D-33: isolador galvânico ProMariner FS30/FS60.', src: 'Fonte: telemetria 7 dias · agenda preditiva', actions: act(p, [['Telemetria', 'console']]) }; },
    epirb: function (p) { return { text: 'EPIRB ACR GlobalFix V5 (RLB-44) · Cat I · flybridge · acionamento manual.\nCertificado Life Safety 67827-001 (26/01/2026) · SBM até jan/2031 · bateria até abr/2036 · MMSI 710400328 · indicativo PV4476.', src: 'Fonte: Drive › Documentos_Legais › EPIRB', actions: act(p, [['Documentos', 'docs']]) }; },
    sos: function (p) { return { text: 'Emergência — abra o SOS. Ordem:\n1. VHF canal 16 · MAYDAY (roteiro com MMSI e posição)\n2. MOB: segurar SOS/MOB na barra superior do plotter — marca a posição\n3. Incêndio na praça de máquinas: painel Sea-Fire no salão · corta motores · cabo de descarga manual SMAC\n4. EPIRB no flybridge · acionamento manual\nPosição e hora são gravadas no diário.', src: 'Fonte: protocolo de emergência Avanti · manual Sea-Fire SMAC · registro EPIRB', actions: act(p, [['Abrir SOS', 'sos']]) }; },
    oleo: function (p) { return { text: 'Pressão de óleo abaixo da faixa (manual 47707890: faixa em operação acima de 1.100 rpm). Verifique nesta ordem:\n1. Reduza para marcha lenta e observe se a pressão sobe.\n2. Compare BB e BE no mesmo giro — só um lado baixo aponta o motor.\n3. Praça de máquinas: vazamento visível, cheiro, nível de óleo (motor parado, 5 min).\n4. Persistindo: desligue o motor afetado, siga com o outro e acione o dealer com estes dados.\nEvento gravado no diário de bordo.', src: 'Fonte: agente Anomalia · faixas do manual Volvo Penta 47707890', actions: act(p, [['Contatos', 'equipe']]) }; },
    manual: function (p) { return { text: 'Manuais catalogados no Drive:\n• Seakeeper 6 — Manuais_Baixados/seakeeper_stabilizer_5-6_operation-manual_en.pdf (90403 Rev.3)\n• Gerador Onan — manual A046J602 (§3.2 partida · §4.2.1)\n• Chiller Dometic — manual PLC L-3527 (display PGD1)\n• Piloto Reactor e GPSMAP 8x16 — Manuais_Equipamentos\n• Motores Volvo Penta D8/IPS15 — 7 manuais em Manuais_Equipamentos (47707890 = operação)\nSem link direto neste protótipo: abrir pelo Drive.', src: 'Fonte: catálogo de manuais · Drive', actions: act(p, [['FAQ de bordo', 'faq']]) }; },
    diarioLer: function (p) {
      var mine = loadDiario();
      var lines = mine.slice(0, 3).map(function (e) { return '• ' + (e.d || '') + ' · ' + (e.sys || 'Diário') + ' — ' + String(e.t || '').slice(0, 110); });
      var fixed = ['• 24/08 · Estofamento — capas dos estofados retiradas pela Tlaloc · previsão 31/08', '• 15/08 · Manutenção — troca de óleo: data corrigida para 16/07/2026', '• 14/08 · Combustível — 500 L · NF-e 002925'];
      return { text: 'Últimos registros do diário de bordo (' + (26 + mine.length) + ' no total · 4 pendências abertas):\n' + lines.concat(fixed).slice(0, 4).join('\n') + '\nPara registrar, diga “registre no diário…” ou toque no atalho DIÁRIO DE BORDO.', src: 'Fonte: DIARIO_BORDO_OPERACIONAL.csv + registros do app', actions: act(p, [['Abrir diário', 'diario']]) };
    },
    fallback: function (p) { return { text: 'Não encontrei esse dado nas fontes de bordo — telemetria, agenda, notas, documentos e manuais catalogados. SEM DADOS.\nPosso registrar como pendência no diário, ou você envia uma foto (etiqueta, tela, nota) para eu identificar.', src: 'Fonte: nenhuma — hierarquia: manual › registro › laudo › diário › foto › nota informal', actions: act(p, [['Registrar pendência', 'diario'], ['FAQ de bordo', 'faq']]) }; }
  };

  function route(qRaw) {
    var q = ' ' + norm(qRaw).replace(/[?!.,;:()"“”]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    if (!q.trim()) return 'saudacao';
    if (has(q, ['mayday', 'emergenc', 'incendio', ' fogo', 'homem ao mar', ' mob ', ' sos ', 'socorro', 'naufrag'])) return 'sos';
    if (has(q, ['pressao de oleo', 'oleo baixo', 'pressao baixa'])) return 'oleo';
    if (has(q, ['registre', ' anote', ' anotar', 'registrar no diario', 'lance no diario', 'lancar no diario'])) return 'diario';
    if (has(q, ['seguro para sair', 'posso sair', 'da pra sair', 'seguro sair', 'avalie vento', 'sair hoje'])) return 'seguro';
    if (has(q, ['anomalia', 'pendencia', 'problema aberto'])) return 'anomalias';
    if (has(q, ['diario'])) return 'diarioLer';
    if (has(q, [' mare', 'corrente'])) return 'mare';
    if (has(q, ['clima', 'previsao', 'tempo hoje', 'vento', 'chuva', 'meteor'])) return 'clima';
    if (has(q, ['para onde', 'destino', 'passeio', 'onde vamos'])) return 'destinos';
    if (has(q, ['checklist de chegada', 'chegada'])) return 'checklistChegada';
    if (has(q, ['checklist', 'check list', ' saida'])) return 'checklist';
    if (has(q, ['autonomia', 'alcance'])) return 'autonomia';
    if (has(q, ['consumo', 'l/h', 'litros por hora'])) return 'consumo';
    if (has(q, ['abastec', 'diesel', 'combustivel', 'nota fiscal', 'nf-e'])) return 'autonomia';
    if (has(q, ['tanque', 'agua doce', 'cinzas', 'negras'])) return 'tanques';
    if (has(q, ['horimetro', 'horas de motor', 'horas do motor', 'horas dos motores'])) return 'horimetros';
    if (has(q, ['epirb'])) return 'epirb';
    if (has(q, ['canal 16', ' vhf', ' radio', ' ais ', 'mmsi', ' dsc'])) return 'canal16';
    if (has(q, ['document', 'licenc', 'fistel', 'anatel', ' tie ', 'homolog', 'vencendo', 'certificado', 'garantia'])) return 'docsvenc';
    if (has(q, ['contato', 'telefone', 'equipe', 'giovanni', 'lucas', 'dealer', 'quem chamar', 'eduardo', 'marina'])) return 'contatos';
    if (has(q, ['porao', 'bomba'])) return 'porao';
    if (has(q, ['gerador', 'onan'])) return 'gerador';
    if (has(q, ['quantas horas'])) return 'horimetros';
    if (has(q, ['estabilizador', 'seakeeper', ' giro'])) return 'estabilizador';
    if (has(q, ['climatiza', 'chiller', 'ar condicionado', 'ar-condicionado', 'dometic', 'mcgx', 'setpoint'])) return 'climatizacao';
    if (has(q, ['piloto', 'plotter', 'radar', 'gpsmap', 'reactor', 'fantom', 'eletronic', 'autopilot', ' rota', 'stby'])) return 'eletronicos';
    if (has(q, ['audio', 'fusion', ' som ', 'bluetooth', 'musica'])) return 'audio';
    if (has(q, ['dessalinizador', 'watermaker', 'water maker'])) return 'dessalinizador';
    if (has(q, ['manual'])) return 'manual';
    if (has(q, ['motor', 'partida', 'volvo', ' ips', 'joystick', ' evc', 'revisao'])) return 'motores';
    if (has(q, ['manutenc', 'vence', 'atrasad', 'agenda', 'tarefa'])) return 'manutencao';
    if (has(q, ['bateria', '24 v', '24v', 'eletric', 'tensao', 'voltagem', 'quick', 'carregador'])) return 'eletrico';
    if (has(q, ['posicao', 'onde estou', 'coordenada', ' gps', ' proa', 'velocidade'])) return 'posicao';
    if (has(q, [' oi ', ' ola ', 'bom dia', 'boa tarde', 'boa noite', 'ajuda', 'o que voce faz'])) return 'saudacao';
    return 'fallback';
  }

  var CANON = {}; ALL.forEach(function (x) { CANON[x.id] = norm(x.q).trim(); });
  function answer(q, ctx) {
    ctx = ctx || {};
    var p = ctx.platform || 'web';
    var key = null;
    if (ctx.id && ANSWERS[ctx.id] && (!String(q || '').trim() || norm(q).trim() === CANON[ctx.id])) key = ctx.id;
    if (!key) key = route(q);
    if (!ANSWERS[key]) key = 'fallback';
    var a;
    try { a = ANSWERS[key](p, ctx); } catch (e) { key = 'fallback'; a = ANSWERS.fallback(p, ctx); }
    a.key = key;
    return a;
  }

  function answerAttachment(kind, file, ctx) {
    var p = (ctx && ctx.platform) || 'web';
    var name = file && file.name ? file.name : (kind === 'video' ? 'vídeo' : 'foto');
    var kb = file && file.size ? Math.round(file.size / 1024) + ' KB' : '';
    var n = now();
    addDiario({ sys: 'Equipamentos', tone: 'var(--av-accent, #409cff)', t: (kind === 'video' ? 'Vídeo' : 'Foto') + ' anexada pelo chat: ' + name + (kb ? ' (' + kb + ')' : '') + ' — identificação A CONFIRMAR.', who: 'Otto', src: 'app · ' + kind });
    if (kind === 'video') return { key: 'video', text: 'Vídeo recebido (' + name + (kb ? ' · ' + kb : '') + ') · ' + n.d + ' ' + n.t + '.\nNeste protótipo o som e o comportamento não são analisados automaticamente: anexei ao diário como anomalia A CONFIRMAR, com a telemetria do instante (motores desligados · sem leitura de RPM).\nDescreva em uma frase o que você viu ou ouviu — respondo com o que verificar primeiro.', src: 'Fonte: anexo · diário de bordo', actions: act(p, [['Abrir diário', 'diario']]) };
    return { key: 'foto', text: 'Foto recebida (' + name + (kb ? ' · ' + kb : '') + ') · ' + n.d + ' ' + n.t + '.\nNeste protótipo a leitura da imagem não é automática: anexei ao diário como A CONFIRMAR. Para etiqueta ou tela de alarme, digite o modelo/código que aparece e eu localizo o manual; para nota fiscal, digite litros e valor e eu registro o abastecimento.', src: 'Fonte: anexo · diário de bordo', actions: act(p, [['Abrir diário', 'diario'], ['Documentos', 'docs']]) };
  }

  function safeDecode(s) { try { return decodeURIComponent(String(s).replace(/\+/g, '%20')); } catch (e) { return String(s); } }
  function parseHash() {
    var raw = (location.hash || '').replace(/^#/, '');
    var out = {};
    if (!raw) return out;
    raw.split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) out[safeDecode(kv.slice(0, i))] = safeDecode(kv.slice(i + 1));
      else if (kv) out[safeDecode(kv)] = true;
    });
    if (typeof out.q === 'string') out.q = out.q.slice(0, 500); else delete out.q;
    return out;
  }
  function clearHash() { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }

  function recognizer(opts) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    var r = new SR();
    r.lang = 'pt-BR'; r.interimResults = true; r.continuous = !!(opts && opts.continuous); r.maxAlternatives = 1;
    return r;
  }
  function speak(text, onEnd) {
    var done = false; var fin = function () { if (!done) { done = true; if (onEnd) onEnd(); } };
    if (!('speechSynthesis' in window)) { setTimeout(fin, 0); return false; }
    try {
      var u = new SpeechSynthesisUtterance(String(text).replace(/[•·→]/g, ', ').replace(/\n/g, '. '));
      u.lang = 'pt-BR'; u.rate = 1.02; u.onend = fin; u.onerror = fin;
      if (onEnd) setTimeout(fin, Math.min(60000, 1800 + String(text).length * 85));
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); return true;
    } catch (e) { setTimeout(fin, 0); return false; }
  }
  function stopSpeaking() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }

  window.AvantiBrain = { DEFAULTS: DEFAULTS, BANK: BANK, ALL: ALL, HREF: HREF, loadShortcuts: loadShortcuts, saveShortcuts: saveShortcuts, resetShortcuts: resetShortcuts, bankFor: bankFor, loadDiario: loadDiario, addDiario: addDiario, loadExec: loadExec, markExec: markExec, loadEquipe: loadEquipe, saveEquipe: saveEquipe, loadDocs: loadDocs, addDoc: addDoc, answer: answer, answerAttachment: answerAttachment, route: route, parseHash: parseHash, clearHash: clearHash, recognizer: recognizer, speak: speak, stopSpeaking: stopSpeaking, now: now, askHref: askHref };
  try { window.dispatchEvent(new CustomEvent('avanti-brain-ready')); } catch (e) {}
})();
