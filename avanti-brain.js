/* Avanti Vessel AI — cérebro do protótipo: atalhos, diário, respostas canônicas e voz.
   Dados do snapshot 25/09/2026 13:40 BRT (telemetria 13:40, motores a 600 rpm). Nada inventado: sem dado → SEM DADOS. */
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

  // Usuário logado (avanti-auth.js): AvantiAuth.nome() devolve quem entrou, manda ao login se a sessão expirou e só dá 'Otto' dentro do editor.
  // 'Otto' aqui só quando avanti-auth.js não está na página.
  function quem() { if (!window.AvantiAuth) return 'Otto'; try { return String(window.AvantiAuth.nome()); } catch (e) { return 'sem sessão'; } }
  function now() { var d = new Date(); var p = function (n) { return (n < 10 ? '0' : '') + n; }; return { d: p(d.getDate()) + '/' + p(d.getMonth() + 1), t: p(d.getHours()) + ':' + p(d.getMinutes()), iso: d.toISOString() }; }
  function loadDiario() { var v = read(K.diario, []); return Array.isArray(v) ? v.filter(function (e) { return e && typeof e.t === 'string'; }) : []; }
  function addDiario(e) { var n = now(); var list = loadDiario(); var entry = Object.assign({ d: n.d, t: n.t, iso: n.iso, sys: 'Diário', tone: 'var(--av-accent, #409cff)', who: quem(), src: 'app · texto' }, e); list.unshift(entry); write(K.diario, list); return entry; }
  function loadExec() { var v = read(K.exec, {}); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function markExec(task) { var m = loadExec(); m[task] = now(); write(K.exec, m); return m; }
  // Desfaz um Executado: relê a lista, tira só essa tarefa e grava (sem a tarefa ou com dado ruim, não grava nada)
  function unmarkExec(task) { var m = loadExec(); if (task != null && Object.prototype.hasOwnProperty.call(m, String(task))) { delete m[String(task)]; write(K.exec, m); } return m; }
  function loadEquipe() { var v = read(K.equipe, null); var o = v && typeof v === 'object' ? v : {}; return { fones: o.fones && typeof o.fones === 'object' && !Array.isArray(o.fones) ? o.fones : {}, convites: Array.isArray(o.convites) ? o.convites.filter(function (c) { return c && typeof c.nome === 'string'; }) : [] }; }
  function saveEquipe(v) { write(K.equipe, v); }
  function loadDocs() { var v = read(K.docs, []); return Array.isArray(v) ? v.filter(function (d) { return d && typeof d.n === 'string'; }) : []; }
  function addDoc(d) { var list = loadDocs(); list.unshift(d); write(K.docs, list); return list; }

  var SNAP = { pos: "22°57,09'S 043°10,23'W", hora: '25/09 13:40', diesel: 'BB 27,6 % · BE 28,8 % (≈ 423 L de 1.500)', dieselHora: 'última leitura com motores ligados · 25/09 13:40' };

  // Frase normalizada com espaço nas pontas (palavra inteira = ' x ').
  function pad(s) { return ' ' + norm(s).replace(/[?!.,;:()"“”]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  var SOS = ['mayday', 'emergenc', 'incendio', ' fogo', 'homem ao mar', ' mob ', ' sos ', 'socorro', 'naufrag', 'caiu no mar', 'caiu ao mar', 'caiu na agua', 'pessoa na agua', 'alguem na agua', 'crianca na agua', 'afogad', 'afogand',
    'afund', 'entrando agua', 'agua entrando', 'entrada de agua', 'alagad', 'alagand', 'inundad', 'inundand', 'abandon', 'colisao', 'colidi', 'abalroa', 'encalh', 'explos',
    'vazamento de combustivel', 'vazando combustivel', 'vazamento de diesel', 'vazando diesel', 'vazamento de gas', 'vazando gas', 'cheiro de combustivel', 'cheiro de diesel', 'cheiro de gas', 'cheiro de queimado'];
  function emergencia(q) { return has(q, SOS) || (has(q, ['fumaca']) && !has(q, ['escap'])); } // fumaça no escapamento é do motor, não SOS
  // Óleo: 1 = queda/alarme relatado (passo a passo); 2 = só pergunta de pressão (SEM LEITURA); 0 = outro assunto.
  // Exige "óleo" na frase (nunca "pressão baixa" sozinha: barômetro, água, chuveiro). Conservador: pressão do óleo sem ser pergunta simples
  // (qual/como/normal/faixa…) já é relato → passo a passo. Porão/vazamento só saem daqui sem pressão/alarme/luz; gerador, só sem "motor".
  var OLEO_QUEDA = / (?:baix|abaixo|cai |caiu|caind|cair|qued|alarm|alert|luz|acend|acesa|sem |zer|perd|despenc|sum|diminu|oscil|vermelh|fora d|nao esta |nao ta |saiu|menor|anormal)/;
  var OLEO_SINAL = / (?:pressao|alarm|alert|luz|acend|acesa)/, OLEO_NEUTRO = / (?:qual|quais|quanto|quanta|como|normal|faixa|alta|alto|ok|esta boa|ta boa|esta bom|ta bom) /;
  var OLEO_TOPICO = /^ (?:e )?(?:a )?pressao d[eo] oleo(?: d[oa]s? motor(?:es)?)?(?: (?:de )?(?:bb|be|bombordo|boreste))? $/;
  function oleo(q) {
    q = q.replace(/ oleo (?:diesel|combustivel)(?= )/g, ' diesel'); // "óleo diesel" é combustível, não óleo do motor
    if (!has(q, [' oleo']) || has(q, ['barometr', 'atmosf', 'hpa', 'pneu', 'hidraul'])) return 0;
    if (!OLEO_SINAL.test(q) && has(q, ['porao', 'vazament', 'vazand', 'pingand'])) return 0; // óleo no porão / vazamento: rota própria
    if (has(q, ['gerador', 'onan']) && !has(q, ['motor'])) return 0; // óleo do gerador: rota do gerador
    var pressao = has(q, ['pressao']);
    if (OLEO_QUEDA.test(q)) return pressao || !has(q, ['troca']) ? 1 : 0;
    if (!pressao) return 0;
    return OLEO_NEUTRO.test(q) || OLEO_TOPICO.test(q) ? 2 : 1;
  }
  // Pedido de registro = comando explícito: imperativo (registre/registra/anote/anota; lance/grave só com "no diário") no começo da frase
  // ou de uma oração (depois de , ; : . ! ?, "por favor" ou "e"); infinitivo só depois de pode/poderia/quero/queria/por favor.
  // No meio, só "… registre no diário …" ou "…, anote aí" no fim, e nunca em pergunta. Não grava: negação antes do verbo ("não registre"),
  // sujeito/modal antes ("vou registrar", "o Lucas registra"), "<verbo>?" solto e pergunta sobre o recurso ("Gravar no diário funciona…?").
  var REG_VERBO = / ((?:(?:avanti|ok|sim|entao|agora|por favor|pode|poderia|quero|queria) (?:\| )?)*)(registre|registra|anote|anota|lance|lanca|grave|grava|registrar|anotar|gravar|lancar)((?: isso| aqui| ai| la)*)( no diario(?: de bordo)?)?(?= )/gi;
  var REG_NEGA = / (?:nao|nunca|jamais|sem)(?: \|)?(?: [a-z]+){0,2} (?:registre|registra|anote|anota|lance|lanca|grave|grava|registrar|anotar|gravar|lancar) /i;
  var REG_SUJEITO = /(?:^| )(?:vou|vamos|vai|tenho que|tem que|temos que|preciso|precisa|precisamos|pediu para|pediu pra|esqueci de|esqueceu de|a gente|ele|ela|eles|elas|eu|o lucas|o otto|o giovanni|lucas|otto|giovanni|eduardo)(?= |$)/i;
  var REG_NOME = /(?:^| )(?:[Oo]s?|[Aa]s?) [A-Z][a-z]/, REG_VOCATIVO = /(?:^|\|) (?:o |a )?(?:lucas|otto|giovanni|eduardo) \|$/i;
  var PERGUNTA = /^ (?:onde|quando|quem|como|qual|quais|quanto|quantos|quantas|o que|oque|que|por que|porque|pq|cade|sera|ja|eu ja|voce|voces) /;
  function querRegistrar(qRaw, q) {
    var raw = String(qRaw || '').slice(0, 2000), pergunta = /\?\s*$/.test(raw), m; // as telas já cortam em 500; teto contra texto enorme
    // sem acento, com a caixa original; pontuação vira fronteira de oração " | "
    var c = ' ' + raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/["“”«»()\[\]]/g, ' ').replace(/\s[-—–]+\s|[,;:.!?…—–]+/g, ' | ').replace(/\s+/g, ' ').trim() + ' ';
    if (REG_NEGA.test(c)) return false; // "não registre", "Não, registre", "nunca anote", "não precisa registrar" (na mesma oração)
    REG_VERBO.lastIndex = 0;
    while ((m = REG_VERBO.exec(c))) {
      var antes = c.slice(0, m.index), verbo = m[2].toLowerCase(), diario = !!m[4], resto = c.slice(m.index + m[0].length);
      var inicio = /^[\s|]*$/.test(antes), duro = /\|$/.test(antes), mole = /(?:^| )(?:e|por favor)$/i.test(antes) || /^por favor/i.test(m[1]);
      var oracao = (antes + ' ' + m[1]).split('|').pop(), cortesia = /(?:pode|poderia|quero|queria|por favor)[\s|]*$/i.test(antes + ' ' + m[1]);
      if (!inicio && !duro && !mole) continue; // verbo no meio da oração: "vou registrar", "Lucas registra", "esqueci de registrar"
      if (REG_SUJEITO.test(oracao) || REG_NOME.test(oracao) || (duro && REG_VOCATIVO.test(antes))) continue;
      if (/r$/.test(verbo) && !cortesia) continue; // "Registrar no diário é obrigatório?", "Vamos registrar…"
      if (!diario && !/^(?:registre|registra|anote|anota|anotar)$/.test(verbo)) continue; // "Grave problema no motor", "Lance a âncora"
      if (!inicio && (pergunta || PERGUNTA.test(q) || (!diario && !/^[\s|]*(?:por favor[\s|]*)*$/i.test(resto)))) continue;
      if (pergunta && (!cortesia || /^[\s|]*$/.test(resto))) continue; // "Anota?", "Registra aí?", "Pode anotar isso?"
      return true;
    }
    return false;
  }
  // Texto do usuário sem o comando ("Registre no diário: X" / "X, anote aí" → X)
  var CMD = '(?:registre|registra|registrar|anote|anota|anotar|lance|lança|lanca|lançar|lancar|grave|grava|gravar)(?![a-zà-ÿ])';
  var LUGAR = '(?:\\s+(?:isso|aqui|aí|ai|por favor))*(?:\\s+(?:no|em)\\s+(?:o\\s+)?di[aá]rio(?:\\s+de\\s+bordo)?)?(?:\\s+(?:isso|aqui|aí|ai|por favor))*';
  var CMD_INI = new RegExp('^[\\s,;:.!—–-]*(?:(?:por favor|pode|poderia|avanti|ok|sim|quero|queria|vamos)[\\s,;:.!—–-]+)*' + CMD + LUGAR + '(?:\\s*[:,;.!—–-]+|\\s+que(?=\\s|$))?\\s*', 'i');
  var CMD_FIM = new RegExp('(?:^|[\\s,;:.!—–-]+)(?:e\\s+)?(?:(?:por favor|pode|poderia|quero|queria)[\\s,]+)*' + CMD + LUGAR + '[\\s.!]*$', 'i');
  var NO_DIARIO = /\s+(?:no|em)\s+(?:o\s+)?di[aá]rio(?:\s+de\s+bordo)?[\s.!?]*$/i, POR_FAVOR_FIM = /[\s,;:—–-]+por favor[\s.!?]*$/i, SOBRA_INI = /^(?:(?:por favor|que)(?:[\s,;:.!—–-]+|$))+/i;
  var DIARIO_INI = /^(?:no|em)\s+(?:o\s+)?di[aá]rio(?:\s+de\s+bordo)?(?:[\s,;:.!—–-]+|$)/i; // "Registre, no diário, a saída" → "a saída"
  // "posição e hora", "posição, hora e rumo", "a posição atual", "o evento" (texto dos próprios avisos do app) = resumo da telemetria,
  // que já traz posição, hora e proa
  var ITEM_RESUMO = '(?:(?:o|a) )?(?:posicao|hora|horario|evento|rumo|proa)(?: (?:atual|de agora|agora|do barco|do evento))?';
  var RESUMO = new RegExp('^(?:(?:o|a|um|uma) )?resumo(?: |$)|^' + ITEM_RESUMO + '(?:(?:,? e |, )' + ITEM_RESUMO + ')*$');
  // "posição e hora do MOB", "posição e hora, homem ao mar": grava o resumo da telemetria junto com as palavras do usuário
  var RESUMO_MAIS = new RegExp('^(?:' + ITEM_RESUMO + '(?:(?:,? e |, )' + ITEM_RESUMO + ')+,? |' + ITEM_RESUMO + ', )(?=[a-z0-9])');
  function resumoMais(nota) { return !!nota && RESUMO_MAIS.test(norm(nota)); }
  function notaDoUsuario(q) {
    var s = String(q || '').replace(/^[\s"“”«»]+|[\s"“”«»]+$/g, ''); // “registre posição e hora” dito entre aspas
    if (!s || norm(s).trim() === CANON.diario) return '';
    s = s.replace(/[\s?]+$/, '').replace(POR_FAVOR_FIM, ''); // "…?" e "…, por favor" no fim
    s = CMD_INI.test(s) ? s.replace(CMD_INI, '').replace(SOBRA_INI, '').replace(DIARIO_INI, '').replace(SOBRA_INI, '').replace(NO_DIARIO, '')
      : s.replace(CMD_FIM, '').replace(POR_FAVOR_FIM, '').replace(NO_DIARIO, ''); // "…, por favor registre" / "posição e hora no diário, registre"
    s = s.replace(/^[\s,;:.!—–"“”«»-]+|[\s,;:—–"“”«»-]+$/g, '');
    if (!s || RESUMO.test(norm(s).replace(/[.!?;:]+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim())) return ''; // "registre o resumo / posição e hora" = atalho
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function A(platform, key) { return (HREF[platform] || HREF.web)[key]; }
  function act(platform, pairs) { return pairs.map(function (p) { return { l: p[0], href: p[1].indexOf('.html') !== -1 || p[1].indexOf('#') === 0 ? p[1] : A(platform, p[1]) }; }); }
  function askHref(platform, q) { return A(platform, 'home') + '#q=' + encodeURIComponent(q); }

  // Passos do SOS: resposta sos e, inteiros, no registro de diário que cita emergência. Chat nunca grava sozinho — só "registre no diário…".
  // Posição do MAYDAY é a do plotter na hora da chamada — o GPS do snapshot é só o último fix.
  var SOS_PASSOS = 'Ordem:\n1. VHF canal 16 · MAYDAY (roteiro com MMSI e a posição lida no plotter)\n2. MOB: segurar SOS/MOB na barra superior do plotter — marca a posição\n3. Incêndio na praça de máquinas: painel Sea-Fire no salão · corta motores · cabo de descarga manual SMAC\n4. EPIRB no flybridge · acionamento manual';
  // Passos da pressão de óleo baixa: resposta oleo e, inteiros, no registro de diário que relata queda/alarme de pressão.
  var OLEO_PASSOS = '1. Reduza para marcha lenta e observe se a pressão sobe.\n2. Compare BB e BE no mesmo giro — só um lado baixo aponta o motor.\n3. Praça de máquinas: vazamento visível, cheiro, nível de óleo (motor parado, 5 min).\n4. Persistindo: desligue o motor afetado, siga com o outro e acione o dealer com estes dados.';
  // Os dois caminhos gravam de fato: o atalho e o comando falado "registre posição e hora" gravam o resumo da telemetria.
  // Base de conhecimento completa (manuais, laudos, notas, histórico) no NotebookLM / Gemini Notebook do Google.
  // O site não consulta o caderno sozinho (o Google não libera essa consulta para cadernos pessoais): quando falta o dado aqui, o chat leva até ele.
  var BASE = { l: 'Base de conhecimento', href: 'https://notebook.google.com/notebook/f8238fa6-ff5e-4cc8-b0f1-e664927a42a6', ext: true };
  var GRAVAR_AGORA = 'Para gravar posição e hora: toque em DIÁRIO DE BORDO ou diga “registre posição e hora”.';
  var ANSWERS = {
    saudacao: function (p) { return { text: 'Olá, ' + quem() + '. ' + (window.AvantiAuth && window.AvantiAuth.frase ? window.AvantiAuth.frase() : 'Onde vamos hoje?') + '\nPosso responder sobre telemetria ao vivo, manutenção, documentos, abastecimento, diário de bordo e os passos de cada equipamento — sempre citando a fonte.', src: 'Snapshot 25/09/2026 13:40 · coletor NMEA online', actions: act(p, [['Console completo', 'console'], ['FAQ de bordo', 'faq']]) }; },
    // Grava as palavras do usuário; sem texto (ou atalho DIÁRIO DE BORDO) grava o resumo da telemetria. commit:false (veio de link) não grava.
    diario: function (p, ctx, q) {
      var n = now(), grava = !ctx || ctx.commit !== false, nota = notaDoUsuario(q);
      var como = 'Para registrar, diga ou digite aqui “registre no diário…” seguido do texto';
      var junto = resumoMais(nota); // nota que pede posição/hora: resumo + nota numa linha só
      if (nota && !junto) {
        var alerta = emergencia(pad(nota)), pressao = oleo(pad(nota)) === 1; // relato de emergência / pressão de óleo: grava a nota e traz os passos
        if (grava) addDiario({ sys: 'Diário', t: nota, who: quem(), src: 'chat · voz/texto' });
        return { text: (grava ? 'Registrado no diário de bordo · ' + n.d + ' ' + n.t + ' · ' + quem() + '\n“' + nota + '”\nLinha nova — nada se apaga.' : 'Não registrado — pedido vindo de link não grava no diário:\n“' + nota + '”\n' + como + '.') + (alerta ? '\nSe a emergência é agora: abra o SOS. ' + SOS_PASSOS : '') + (pressao ? '\nSe a pressão de óleo está baixa agora, verifique nesta ordem:\n' + OLEO_PASSOS : ''), src: 'Fonte: anotação de ' + quem() + ' · diário de bordo do app' + (pressao ? ' · manual Volvo Penta 47707890' : ''), actions: act(p, (alerta ? [['Abrir SOS', 'sos']] : []).concat(pressao ? [['Contatos', 'equipe']] : [], [['Abrir diário', 'diario']])) };
      }
      var t = 'Atracado · Rio de Janeiro · ' + SNAP.pos + ' · SOG 0,0 nós · proa 048° · motores em marcha lenta (600 rpm, neutro) · banco 24 V 27,49 V · vento 12,6 nós de 090° · diesel ' + SNAP.diesel + ' (' + SNAP.dieselHora + ').';
      var al = junto && emergencia(pad(nota)), pr = junto && oleo(pad(nota)) === 1;
      var passos = (al ? '\nSe a emergência é agora: abra o SOS. ' + SOS_PASSOS : '') + (pr ? '\nSe a pressão de óleo está baixa agora, verifique nesta ordem:\n' + OLEO_PASSOS : '');
      var acoes = (al ? [['Abrir SOS', 'sos']] : []).concat(pr ? [['Contatos', 'equipe']] : [], [['Abrir diário', 'diario']]);
      if (grava) addDiario({ sys: 'Navegação', tone: 'var(--av-tele, #5ac8fa)', t: (junto ? nota + ' · resumo de agora: ' : 'Resumo de agora registrado pelo atalho: ') + t, who: quem(), src: junto ? 'chat · voz/texto · telemetria 25/09' : 'atalho · telemetria 25/09' });
      return { text: (grava ? 'Registrado no diário de bordo · ' + n.d + ' ' + n.t + ' · ' + quem() + '\n' + (junto ? '“' + nota + '”\n' : '') + t + '\nLinha nova — nada se apaga.' : 'Não registrado — pedido vindo de link não grava no diário.\n' + (junto ? '“' + nota + '”\n' : '') + 'Resumo de agora: ' + t + '\n' + como + ', ou toque no atalho DIÁRIO DE BORDO.') + passos, src: 'Fonte: telemetria NMEA 25/09 13:40 · DIARIO_BORDO_OPERACIONAL.csv' + (pr ? ' · manual Volvo Penta 47707890' : ''), actions: act(p, acoes) };
    },
    seguro: function (p) { return { text: 'Sim, com duas ressalvas.\n• Condições: vento 12,6 nós de 090° · barômetro 1012 hPa estável · 12 satélites · banco 24 V 27,49 V em flutuação.\n• Diesel ≈ 423 L (BB 27,6 % · BE 28,8 %) → ≈ 18 h a 8,4 nós com reserva de 10 %.\n• Ressalva 1: teste das bombas de porão e alarmes vencido há 100 dias — acione cada bomba no manual antes de largar.\n• Ressalva 2: sem previsão meteorológica carregada (SEM DADOS) — confira Marinha/DHN.\nMotores em marcha lenta (neutro): 600 rpm · óleo 3,8 bar · 37 °C · arrefecimento 49 °C · sem alarmes.', src: 'Fonte: telemetria 25/09 13:40 · agenda preditiva (35 tarefas) · NF-e 002925', actions: act(p, [['Ver manutenção', 'manut'], ['Checklist de saída', askHref(p, 'Checklist de saída')]]) }; },
    destinos: function (p) { return { text: '3 destinos a partir da Marina da Glória, no regime observado (8,4 nós · 20,9 L/h), só ida:\n1. Ilhas Cagarras — ≈ 7 mn · ≈ 50 min · ≈ 17 L\n2. Itaipu / Itacoatiara (Niterói) — ≈ 10 mn · ≈ 1 h 10 · ≈ 25 L\n3. Ilha Grande (Abraão) — ≈ 60 mn · ≈ 7 h · ≈ 150 L; ida e volta ≈ 300 L — cabe nos 423 L com reserva, mas sem margem para gerador e manobra: abastecer antes.\nDistâncias em linha reta pela posição atual — confirme a rota no plotter.', src: 'Fonte: posição GPS 25/09 · consumo observado 14/08–20/09 · tanques 13:40', actions: act(p, [['Autonomia', askHref(p, 'Autonomia')], ['Abastecimento', 'abast']]) }; },
    manutencao: function (p) { return { text: 'Atrasadas (3):\n• Filtros do chiller · Dometic PLC L-3527 — 186 dias (estaleiro)\n• Teste de bombas de porão e alarmes — 100 dias (estaleiro)\n• Tensões e conexões Quick VRS / SBC NRG+ — 1 dia (Lucas)\nPróximas:\n• D-19 · 14/10 — revisão programada do sistema (Lucas + Avanti)\n• D-28 · 23/10 — isolador galvânico · ProMariner FS30/FS60 (Lucas)\n• D-48 · 12/11 — inspeção de casco, anodos e zincos (Eduardo)\nRevisão dos motores: 16/01/2027 (D-113) ou 280 h — faltam 170,0 h.\nFalta registrar: agenda do Seakeeper (zinco/trocador · 3 meses/150 h).', src: 'Fonte: agenda preditiva · 35 tarefas · horímetros 25/09 13:40', actions: act(p, [['Abrir manutenção', 'manut']]) }; },
    autonomia: function (p) { return { text: '≈ 18 h · ≈ 153 mn a 8,4 nós (1.130 rpm · 20,9 L/h), com reserva de 10 %.\nA bordo ≈ 423 L de 1.500 (BB 27,6 % · BE 28,8 %) — ' + SNAP.dieselHora + '.\nEm marcha lenta (5,1 L/h) ≈ 75 h. Consumido desde os 500 L de 14/08: ≈ 186 L até 20/09 (10,2 h de motor + 22,6 h de gerador).', src: 'Fonte: telemetria (taxas dos dois motores 14/08–20/09) · NF-e 002925 — estimativa; a NF é a fonte oficial', actions: act(p, [['Abastecimento', 'abast']]) }; },
    mare: function (p) { return { text: 'SEM DADOS de maré a bordo: nenhuma tábua carregada para a posição atual (Baía de Guanabara · Rio de Janeiro).\nFonte oficial: DHN — Tábua de Marés do Porto do Rio de Janeiro (Ilha Fiscal). Quando a Data Table receber a tábua, esta resposta mostra altura, tendência e próximas preamar e baixa-mar.', src: 'Fonte: nenhuma — dado ausente (regra: sem dado → SEM DADOS)', actions: act(p, [['Registrar pendência', 'diario']]) }; },
    clima: function (p) { return { text: 'Sem previsão carregada (SEM DADOS). Leitura de agora pela estação meteorológica de bordo:\n• vento verdadeiro 12,6 nós de 090°\n• barômetro 1012 hPa · estável\n• externo 24,8 °C · praça de máquinas 22,9 °C · água do mar 22,6 °C\nFonte oficial para a previsão: Marinha do Brasil — Meteoromarinha (DHN).', src: 'Fonte: telemetria NMEA 25/09 13:40', actions: act(p, [['Telemetria', 'console']]) }; },
    canal16: function (p) { return { text: 'VHF canal 16 (156,800 MHz) — socorro, urgência e chamada. Diran atende no canal 67 (24 h).\nMMSI 710400328 · indicativo PV4476 — programados no VHF 315 e no VHF 215 — use qualquer um dos dois.\nRoteiro MAYDAY (só perigo grave e iminente):\nMAYDAY, MAYDAY, MAYDAY — AQUI É AVANTI VESSEL, AVANTI VESSEL, AVANTI VESSEL — MMSI 710400328 — POSIÇÃO — LEIA NO PLOTTER AGORA (último fix ' + SNAP.pos + ' · GPS ' + SNAP.hora + ') — NATUREZA DO PERIGO — Nº DE PESSOAS A BORDO — AUXÍLIO NECESSÁRIO — CÂMBIO.\nUrgência sem perigo de vida: PAN-PAN ×3.', src: 'Fonte: registro EPIRB/MMSI (cert. 67827-001) · protocolo de emergência Avanti · RIPEAM', actions: act(p, [['Abrir SOS', 'sos']]) }; },
    checklist: function (p) { return { text: 'Checklist de saída — do que está catalogado:\n1. Gerador Onan: STOP/Prime 3 s (escorva) → START/Preheat · lâmpada âmbar→verde · partida em 20–60 s.\n2. Estabilizador Seakeeper 6: ligar com AC — 24 min para estabilizar · máx 40 min.\n3. Climatização: Enter habilita · Cool/Heat · setpoint 8–14 °C.\n4. Eletrônicos: plotter ligado · piloto em STBY até sair da marina · AIS transmitindo · VHF no 16.\n5. Bombas de porão: acionamento manual (teste vencido há 100 d).\n6. Diesel BB 28 % · BE 29 % — regra: abastecer antes de 15 % em qualquer tanque.\nAmarração, hidráulica e fechamento: A CONFIRMAR (sem checklist oficial no Drive).', src: 'Fonte: manuais Onan A046J602 · Seakeeper 90403 · Dometic L-3527 · FAQ de eletrônicos · agenda', actions: act(p, [['FAQ de bordo', 'faq']]) }; },
    checklistChegada: function (p) { return { text: 'Checklist de chegada — do que está catalogado:\n1. Estabilizador: desligar ao atracar — 4 h+ até parar totalmente; nunca mexer com o volante girando.\n2. Eletrônicos: piloto em STBY antes de manobrar na marina · plotter e AIS conforme uso.\n3. Gerador Onan: desligar cargas, depois STOP.\n4. Climatização: chiller com lockout de fluxo de 10 s — desligar pelo display.\n5. Fechar a viagem no diário: horas, consumo e custo.\nHidráulica, cuidados e fechamento: A CONFIRMAR (sem checklist oficial no Drive).', src: 'Fonte: manuais Seakeeper 90403 · Onan A046J602 · Dometic L-3527 · FAQ de eletrônicos', actions: act(p, [['Fechar no diário', 'diario']]) }; },
    consumo: function (p) { return { text: 'Consumo observado (telemetria 14/08–20/09):\n• cruzeiro leve — 20,9 L/h (média 1.130 rpm · 8,4 nós)\n• marcha lenta — 5,1 L/h (≤ 900 rpm)\n• gerador — +22,6 h desde 14/08 (280,7 h no horímetro)\nConsumido desde os 500 L: ≈ 186 L até 20/09. Média por abastecimento aparece a partir do 2º registro — só 1 NF em 2026.', src: 'Fonte: telemetria (taxa de combustível dos dois motores) · NF-e 002925', actions: act(p, [['Abastecimento', 'abast']]) }; },
    tanques: function (p) { return { text: 'Tanques agora:\n• água doce 65,1 %\n• águas cinzas 0,0 %\n• águas negras 5,2 %\n• diesel BB 27,6 % · BE 28,8 % (≈ 423 L) — ' + SNAP.dieselHora + '.', src: 'Fonte: telemetria NMEA 25/09 13:40 (diesel 13:40)', actions: act(p, [['Telemetria', 'console']]) }; },
    contatos: function (p) { return { text: 'Acesso total: Otto Licks (proprietário) · Giovanni · Lucas · Amanda.\nApoio: Eduardo (casco · Marina Express) · dealer Volvo Penta (Health Check 47715565) · estaleiro (chiller e porão) · Sr. Dalmo (Tlaloc · estofados) · Posto Marina da Glória (Verana) · Diran no VHF canal 67 (24 h) · Life Safety (EPIRB).\nTelefones: A CADASTRAR em Equipe.', src: 'Fonte: agenda preditiva · diário 14–24/08 · NF-e 002925', actions: act(p, [['Equipe e contatos', 'equipe']]) }; },
    anomalias: function (p) { return { text: 'Pendências abertas (4):\n• Garantia Azimut — vazamento no teto do cockpit · pleito em rascunho desde 15/08\n• Capas dos estofados na Tlaloc · devolução 31/08 a conferir\n• Seakeeper — vigência da garantia estendida · A CONFIRMAR\n• Coletor NMEA — lacuna de 6 h 58 min em 15/08\nAnomalias registradas (3): combustível baixo BB 9,6 % (14/08, resolvido) · Seakeeper sem AC para o spool-up (15/08) · interrupção da telemetria (15/08).', src: 'Fonte: diário de bordo 14–24/08 · nmea_20260815.jsonl', actions: act(p, [['Abrir diário', 'diario']]) }; },
    porao: function (p) { return { text: 'Teste de bombas de porão e alarmes VENCIDO há 100 dias (agenda: estaleiro · ref. diagrama ATL51).\nSem sensor de porão no barramento NMEA — SEM LEITURA.\nAntes de sair: acione cada bomba no manual e confira o alarme; registre o resultado no diário.', src: 'Fonte: agenda preditiva · telemetria (sem sentença de porão)', actions: act(p, [['Manutenção', 'manut']]) }; },
    gerador: function (p) { return { text: 'Gerador Onan MDKDP · 285,6 h (25/09 13:40).\nLigar: STOP/Prime por 3 s (escorva) → START/Preheat · lâmpada âmbar→verde · partida em 20–60 s.\nDesligar: retire as cargas e pressione STOP.', src: 'Fonte: manual Onan A046J602 §3.2 / §4.2.1 · horímetro na telemetria', actions: act(p, [['Passo a passo', 'f4']]) }; },
    posicao: function (p) { return { text: SNAP.pos + ' · atracado · Rio de Janeiro\nSOG 0,0 nós · proa 048° · 12 satélites · posição válida · ' + SNAP.hora + '.', src: 'Fonte: GPS na rede NMEA 2000 · coletor YDWG-02', actions: act(p, [['Telemetria', 'console']]) }; },
    docsvenc: function (p) { return { text: 'Vencem primeiro:\n• FISTEL + licença de estação — 23/01/2027 (D-120) · renovar na ANATEL\n• Licença do VHF 115 — A CONFERIR (fonte divergente)\n• Seakeeper — garantia estendida · vigência A CONFIRMAR\n• Pleito Azimut (teto do cockpit) — A ENVIAR\nEm dia: TIE até 15/01/2031 · homologação ANATEL do VHF 315 (nº 07897-25-01493) até 11/11/2028 · EPIRB SBM até jan/2031 · Health Check 47715565 (16/07/2026).', src: 'Fonte: Drive › Documentos_Legais · agenda preditiva', actions: act(p, [['Documentos', 'docs']]) }; },
    horimetros: function (p) { return { text: 'Horímetros (25/09 13:40 · motores a 600 rpm):\n• motor BB 110,0 h\n• motor BE 106,0 h\n• gerador 285,6 h\nPróxima revisão dos motores: 16/01/2027 (D-113) ou 280 h — faltam 170,0 h; a data vence antes.', src: 'Fonte: telemetria NMEA · agenda preditiva · Health Check 47715565', actions: act(p, [['Manutenção', 'manut']]) }; },
    motores: function (p) { return { text: 'Motores 2 × Volvo Penta D8 / IPS15 — 7 manuais no Drive (Manuais_Equipamentos).\nPasso a passo de partida, joystick, DPS e EVC ainda não confirmado: MANUAL NO DRIVE.\nHorímetros BB 110,0 h · BE 106,0 h · Health Check 47715565 em 16/07/2026 (dealer) · troca de óleo 16/07/2026 (500 h ou 12 meses).', src: 'Fonte: Drive › Manuais_Equipamentos · diário 15/08 · protocolo 47715565', actions: act(p, [['Manutenção', 'manut'], ['FAQ de bordo', 'faq']]) }; },
    estabilizador: function (p) { return { text: 'Seakeeper 6 · ligar só com AC (gerador ou shore power).\n• 24 min para estabilizar · máximo 40 min de spool-up · 4 h+ para parar totalmente.\n• Nunca mexer no equipamento com o volante girando — RPM em ZERO; alarme trava o giro sozinho.\nDisplay em 14/08: 159 h RUN · 119 h SEA · gyro 244.7424. Agenda de zinco/trocador (3 meses/150 h): A REGISTRAR.', src: 'Fonte: Seakeeper Operation Manual 90403 Rev.3 §2.2–2.4 · foto do display 14/08', actions: act(p, [['Passo a passo', 'f2']]) }; },
    climatizacao: function (p) { return { text: 'Chiller Dometic PLC L-3527 · display PGD1:\n• Enter habilita · Cool/Heat · setpoint 8–14 °C\n• alarme após 3 s · lockout de fluxo de 10 s\nFiltros VENCIDOS há 186 dias (estaleiro). Controles de cabine MCGX: A CONFIRMAR.', src: 'Fonte: manual Dometic L-3527 · agenda preditiva', actions: act(p, [['Passo a passo', 'f5']]) }; },
    eletronicos: function (p) { return { text: 'Piloto Reactor: Engatar › Rota · ajuste ±1° / ±10° · STBY para soltar — sempre antes de manobrar na marina · Heading Hold mantém a proa.\nPlotter GPSMAP 8x16 · radar Fantom · AIS 800 · VHF 315 e VHF 215 — 19 respostas prontas no FAQ de eletrônicos.', src: 'Fonte: FAQ de eletrônicos de bordo · manuais no Drive (Manuais_Equipamentos)', actions: act(p, [['FAQ eletrônicos', 'f3']]) }; },
    audio: function (p) { return { text: 'Áudio Fusion MS-RA770 — parear celular, zonas e "sem som": passo a passo ainda não confirmado no manual. MANUAL NO DRIVE.\nQuando confirmado, entra no FAQ de eletrônicos.', src: 'Fonte: Drive › Manuais_Equipamentos (a conferir)', actions: act(p, [['FAQ eletrônicos', 'f3']]) }; },
    dessalinizador: function (p) { return { text: 'SEM DADOS — dessalinizador não catalogado.\nEnvie a foto da etiqueta (modelo e número de série) para eu catalogar, localizar o manual e montar o passo a passo.', src: 'Fonte: nenhuma — pendência do catálogo', actions: act(p, [['Enviar foto', A(p, 'home') + '#mode=foto']]) }; },
    eletrico: function (p) { return { text: 'Banco 24 V: 27,49 V em flutuação · 7 dias entre 27,0 e 28,7 V · 38 h com dados.\nATRASADA 1 dia (venceu 24/09): verificação de tensões e conexões · Quick VRS / SBC NRG+ (Lucas). D-28: isolador galvânico ProMariner FS30/FS60.', src: 'Fonte: telemetria 7 dias · agenda preditiva', actions: act(p, [['Telemetria', 'console']]) }; },
    epirb: function (p) { return { text: 'EPIRB ACR GlobalFix V5 (RLB-44) · Cat I · flybridge · acionamento manual.\nCertificado Life Safety 67827-001 (26/01/2026) · SBM até jan/2031 · bateria até abr/2036 · MMSI 710400328 · indicativo PV4476.', src: 'Fonte: Drive › Documentos_Legais › EPIRB', actions: act(p, [['Documentos', 'docs']]) }; },
    // sos/óleo não gravam nada: pergunta informativa não vira linha permanente. Gravar = atalho DIÁRIO DE BORDO ou "registre posição e hora".
    sos: function (p) { return { text: 'Emergência — abra o SOS. ' + SOS_PASSOS + '\n' + GRAVAR_AGORA, src: 'Fonte: protocolo de emergência Avanti · manual Sea-Fire SMAC · registro EPIRB', actions: act(p, [['Abrir SOS', 'sos'], ['Registrar no diário', 'diario']]) }; },
    oleo: function (p) { return { text: 'Se a pressão de óleo cair abaixo da faixa (manual Volvo Penta 47707890: faixa em operação acima de 1.100 rpm) ou o alarme acender, verifique nesta ordem:\n' + OLEO_PASSOS + '\nNo snapshot de ' + SNAP.hora + ' os motores estão em marcha lenta (600 rpm, neutro): óleo 3,8 bar (BB 376 · BE 382 kPa), sem alarme.\n' + GRAVAR_AGORA, src: 'Fonte: agente Anomalia · faixas do manual Volvo Penta 47707890 · telemetria ' + SNAP.hora, actions: act(p, [['Registrar no diário', 'diario'], ['Contatos', 'equipe']]) }; },
    oleoLeitura: function (p) { return { text: 'Pressão do óleo: 3,8 bar (BB 376 · BE 382 kPa) · 600 rpm em neutro · óleo 37 °C · sem alarme — snapshot de ' + SNAP.hora + '.\nFaixa normal: a do manual Volvo Penta 47707890, em operação acima de 1.100 rpm.\nSe cair abaixo da faixa ou o alarme acender, pergunte “pressão de óleo baixa” para o passo a passo.', src: 'Fonte: telemetria NMEA ' + SNAP.hora + ' · manual Volvo Penta 47707890', actions: act(p, [['Telemetria', 'console'], ['Pressão baixa: o que fazer', askHref(p, 'Pressão de óleo baixa: o que verificar primeiro?')]]) }; },
    ancora: function (p) { return { text: 'Alarme de âncora (FAQ de eletrônicos): raio de 1,5 vez o cabo lançado.\nSem sensor de âncora na rede NMEA — SEM LEITURA do ferro. Posição agora: ' + SNAP.pos + '.', src: 'Fonte: FAQ de eletrônicos de bordo · GPS na rede NMEA 2000', actions: act(p, [['FAQ eletrônicos', 'f3']]) }; },
    manual: function (p) { return { text: 'Manuais catalogados no Drive:\n• Seakeeper 6 — Manuais_Baixados/seakeeper_stabilizer_5-6_operation-manual_en.pdf (90403 Rev.3)\n• Gerador Onan — manual A046J602 (§3.2 partida · §4.2.1)\n• Chiller Dometic — manual PLC L-3527 (display PGD1)\n• Piloto Reactor e GPSMAP 8x16 — Manuais_Equipamentos\n• Motores Volvo Penta D8/IPS15 — 7 manuais em Manuais_Equipamentos (47707890 = operação)\nSem link direto neste protótipo: abrir pelo Drive.', src: 'Fonte: catálogo de manuais · Drive', actions: act(p, [['FAQ de bordo', 'faq']]) }; },
    diarioLer: function (p) {
      var mine = loadDiario();
      var lines = mine.slice(0, 3).map(function (e) { return '• ' + (e.d || '') + ' · ' + (e.sys || 'Diário') + ' — ' + String(e.t || '').slice(0, 110); });
      var fixed = ['• 24/08 · Estofamento — capas dos estofados retiradas pela Tlaloc · previsão 31/08', '• 15/08 · Manutenção — troca de óleo: data corrigida para 16/07/2026', '• 14/08 · Combustível — 500 L · NF-e 002925'];
      return { text: 'Últimos registros do diário de bordo (' + (26 + mine.length) + ' no total · 4 pendências abertas):\n' + lines.concat(fixed).slice(0, 4).join('\n') + '\nPara registrar, diga “registre no diário…” ou toque no atalho DIÁRIO DE BORDO.', src: 'Fonte: DIARIO_BORDO_OPERACIONAL.csv + registros do app', actions: act(p, [['Abrir diário', 'diario']]) };
    },
    fallback: function (p) { return { text: 'Não encontrei esse dado nas fontes de bordo — telemetria, agenda, notas, documentos e manuais catalogados. SEM DADOS.\nA base de conhecimento completa está no NotebookLM (botão abaixo). Posso também registrar como pendência no diário, ou você envia uma foto (etiqueta, tela, nota) para eu identificar.', src: 'Fonte: nenhuma — hierarquia: manual › registro › laudo › diário › foto › nota informal · base completa: NotebookLM', actions: [BASE].concat(act(p, [['Registrar pendência', 'diario'], ['FAQ de bordo', 'faq']])) }; }
  };

  // ——— Telemetria ao vivo (avanti-telemetria.js) ———
  // Com o coletor conectado e a leitura com menos de 10 min, posição, tanques, tempo, baterias e Seakeeper saem da leitura real;
  // sem isso (padrão de hoje), as respostas continuam com o snapshot de 25/09.
  function vivo() { var T = window.AvantiTelemetria; return T && T.atual ? T.atual() : null; }
  function nb(x, d) { return typeof x === 'number' && isFinite(x) ? x.toFixed(d == null ? 1 : d).replace('.', ',') : '—'; }
  function grau3(x) { return typeof x === 'number' ? ('00' + Math.round(((x % 360) + 360) % 360)).slice(-3) + '°' : '—'; }
  var VIVO = {
    posicao: function (v) { var T = window.AvantiTelemetria; return { text: T.posicao(v) + (v.sog_nos < 0.5 ? ' · parado' : '') + '\nSOG ' + nb(v.sog_nos) + ' nós · proa ' + grau3(v.proa_graus) + ' · ' + nb(v.gps_satelites, 0) + ' satélites · profundidade ' + nb(v.profundidade_m) + ' m · ao vivo ' + T.hora(v) + '.' }; },
    tanques: function (v) { return { text: 'Tanques agora:\n• água doce ' + nb(v.tanque_agua_pct) + ' %\n• águas cinzas ' + nb(v.tanque_cinzas_pct) + ' %' + (v.tanque_cinzas_pct > 70 ? ' — atenção: programar esgoto' : '') + '\n• águas negras ' + nb(v.tanque_negras_pct) + ' %' + (v.tanque_negras_pct > 70 ? ' — atenção: programar esgoto' : '') + '\n• diesel: ' + SNAP.diesel + ' — ' + SNAP.dieselHora + '.' }; },
    clima: function (v) { return { text: 'Agora a bordo (ao vivo ' + window.AvantiTelemetria.hora(v) + '):\n• vento verdadeiro ' + nb(v.vento_verdadeiro_nos) + ' nós de ' + grau3(v.vento_verdadeiro_angulo) + '\n• barômetro ' + nb(v.pressao_barometrica_hpa, 0) + ' hPa\n• ar ' + nb(v.temp_ar_externo_c) + ' °C · água ' + nb(v.temp_agua_c) + ' °C\nPrevisão oficial: Marinha do Brasil — Meteoromarinha (DHN).' }; },
    eletrico: function (v, base) { return { text: 'Baterias agora: banco 2 ' + nb(v.bateria_2_tensao_v, 2) + ' V · banco 0 ' + nb(v.bateria_0_tensao_v, 2) + ' V (ao vivo ' + window.AvantiTelemetria.hora(v) + ').\n' + base.text.split('\n').slice(1).join('\n') }; },
    estabilizador: function (v, base) { return { text: 'Seakeeper 6 agora: ' + (v.seakeeper_ativo ? 'LIGADO · volante ' + nb(v.seakeeper_volante_rpm, 0) + ' rpm (' + nb(v.seakeeper_volante_pct, 0) + ' %)' : 'desligado') + ' · ao vivo ' + window.AvantiTelemetria.hora(v) + '.\n' + base.text }; }
  };
  Object.keys(VIVO).forEach(function (k) {
    var pronta = ANSWERS[k]; if (!pronta) return;
    ANSWERS[k] = function (p, ctx, q) {
      var base = pronta(p, ctx, q), v = vivo(); if (!v) return base;
      var r = VIVO[k](v, base);
      return { text: r.text, src: 'Fonte: coletor YDWG-02 · ao vivo ' + window.AvantiTelemetria.hora(v), actions: base.actions };
    };
  });

  var EQUIP = ['seakeeper', 'estabilizador', 'chiller', 'climatiza', 'ar condicionado', 'ar-condicionado', 'dometic', 'mcgx', 'gerador', 'onan', 'piloto', 'plotter', 'radar', 'reactor', 'gpsmap', 'fantom', ' vhf', ' ais ', 'epirb', 'fusion', 'audio', 'dessaliniz', 'bomba', 'porao', 'casco', 'anodo', 'zinco', 'isolador', 'bateria', 'tensao', 'tensoes'];
  function route(qRaw) {
    var q = pad(qRaw);
    if (!q.trim()) return 'saudacao';
    if (querRegistrar(qRaw, q)) return 'diario';
    if (emergencia(q)) return 'sos';
    var ol = oleo(q);
    if (ol) return ol === 1 ? 'oleo' : 'oleoLeitura';
    if (has(q, ['seguro para sair', 'posso sair', 'da pra sair', 'da para sair', 'seguro sair', 'avalie vento', 'sair hoje', 'seguro navegar', 'seguro para navegar', 'posso navegar', 'podemos sair', 'podemos navegar', 'da pra navegar', 'da para navegar'])) return 'seguro';
    if (has(q, ['anomalia', 'pendencia', 'problema aberto', 'tlaloc', 'estofad'])) return 'anomalias';
    if (has(q, ['diario'])) return 'diarioLer';
    if (has(q, [' mare', 'correnteza', 'corrente de mare']) || (has(q, [' corrente']) && !has(q, ['bateria', 'carregador', 'eletric', 'tensao', 'amper', 'alternada', 'continua', 'shore', 'tomada', ' ac ', ' dc ', 'ancora', 'amarra']))) return 'mare';
    if (has(q, [' clima ', 'climatic', 'tempo hoje', ' vento', 'chuva', 'meteor']) || (has(q, ['previsao']) && !has(q, [' revisao', 'manutenc', 'devoluc', 'entrega', 'chegada']))) return 'clima';
    if (has(q, ['para onde', 'destino', 'passeio', 'onde vamos', 'melhor rota', 'rota para', 'rota ate'])) return 'destinos';
    if (has(q, ['checklist de chegada', 'chegada'])) return 'checklistChegada';
    if (has(q, ['checklist', 'check list', ' saida'])) return 'checklist';
    if (has(q, ['autonomia']) || (has(q, ['alcance']) && !has(q, [' vhf', ' radio', 'radar', ' ais ', 'antena', 'sinal', 'wifi', 'wi-fi', 'bluetooth', 'celular']))) return 'autonomia';
    // "Situação e vencimento do documento: NF-e 002925 (500 L)…" é documento: a palavra documento/licença/vencimento vence a do combustível
    if (has(q, ['document', 'licenc', 'vencimento']) && has(q, ['consumo', 'l/h', 'litros por hora', 'abastec', 'diesel', 'combustivel', 'nota fiscal', 'nf-e'])) return 'docsvenc';
    if (has(q, ['consumo', 'l/h', 'litros por hora'])) return 'consumo';
    if (has(q, ['abastec', 'diesel', 'combustivel', 'nota fiscal', 'nf-e'])) return 'autonomia';
    if (has(q, ['tanque', 'agua doce', 'cinzas', 'negras'])) return 'tanques';
    // "próxima revisão" sem equipamento = motores; com equipamento, a rota dele (Seakeeper, chiller, gerador…)
    if (has(q, ['horimetro', 'horas de motor', 'horas do motor', 'horas dos motores']) || (has(q, ['proxima revisao']) && !has(q, EQUIP))) return 'horimetros';
    if (has(q, ['epirb'])) return 'epirb';
    // documento/licença antes do rádio: "Licença do VHF 115" é documento, não MAYDAY
    if (has(q, ['document', 'licenc', 'fistel', 'anatel', ' tie ', 'homolog', 'vencendo', 'certificado', 'garantia'])) return 'docsvenc';
    if (has(q, ['canal 16', ' vhf', ' radio', ' ais ', 'mmsi', ' dsc'])) return 'canal16';
    if (has(q, ['contato', 'telefone', 'equipe', 'giovanni', 'lucas', 'dealer', 'quem chamar', 'eduardo', 'marina'])) return 'contatos';
    if (has(q, ['porao', 'bomba'])) return 'porao';
    if (has(q, ['gerador', 'onan'])) return 'gerador';
    if (has(q, ['quantas horas'])) return 'horimetros';
    if (has(q, ['estabilizador', 'seakeeper'])) return 'estabilizador';
    if (has(q, ['rotacao', 'rotacoes', ' rpm ', 'giro do motor', 'giro dos motores', 'giro de motor'])) return 'motores';
    if (has(q, [' giro', 'giroscop'])) return 'estabilizador';
    if (has(q, ['climatiza', 'chiller', 'ar condicionado', 'ar-condicionado', 'dometic', 'mcgx', 'setpoint'])) return 'climatizacao';
    if (has(q, [' ancora ', 'garrand', 'garrou'])) return 'ancora';
    if (has(q, ['piloto', 'plotter', 'radar', 'gpsmap', 'reactor', 'fantom', 'eletronic', 'autopilot', ' rota ', ' rotas ', 'stby'])) return 'eletronicos';
    if (has(q, ['audio', 'fusion', ' som ', 'bluetooth', 'musica'])) return 'audio';
    if (has(q, ['dessalinizador', 'watermaker', 'water maker'])) return 'dessalinizador';
    if (has(q, ['manual'])) return 'manual';
    // revisão/inspeção de casco, anodos, zincos, isolador → agenda (D-48 / D-28); de bateria/tensões → elétrico (tensões, atrasada) — não é revisão dos motores
    if (has(q, [' revisao', 'inspec'])) {
      if (has(q, ['casco', 'anodo', 'zinco', 'isolador'])) return 'manutencao';
      if (has(q, ['bateria', 'tensao', 'tensoes'])) return 'eletrico';
    }
    if (has(q, ['motor', 'partida', 'volvo', ' ips', 'joystick', ' evc', ' revisao'])) return 'motores';
    if (has(q, ['manutenc', 'vence', 'atrasad', 'agenda', 'tarefa'])) return 'manutencao';
    if (has(q, ['bateria', '24 v', '24v', 'eletric', 'tensao', 'voltagem', 'quick', 'carregador'])) return 'eletrico';
    if (has(q, ['posicao', 'onde estou', 'coordenada', ' gps', ' proa', 'velocidade'])) return 'posicao';
    if (has(q, [' oi ', ' ola ', 'bom dia', 'boa tarde', 'boa noite', 'ajuda', 'o que voce faz'])) return 'saudacao';
    return 'fallback';
  }

  var CANON = {}; ALL.forEach(function (x) { CANON[x.id] = norm(x.q).trim(); });

  // ——— Base de conhecimento de bordo (base-conhecimento.json) ———
  // Trechos técnicos extraídos dos manuais e guias do Drive (sem documentos sensíveis). Quando a resposta pronta não tem o dado,
  // o chat e a voz buscam aqui (BM25 com sinônimos PT/EN) e respondem com o trecho e a fonte. Carrega em segundo plano; funciona offline (cache do SW).
  var KB = { docs: null, carregando: false, df: {}, media: 1 };
  var PARADAS = ' a o e as os um uma uns umas de da do das dos em no na nos nas por para pra com sem se que qual quais quando como onde quanto quantos quantas e ou ao aos a is the of to and in on for with is are be it this that from at by an or eu voce vc me meu minha tem ter tenho ha esta estao fica ser sao era foi faz fazer posso pode sobre mais muito barco embarcacao avanti vessel '.split(' ').reduce(function (m, w) { if (w) m[w] = 1; return m; }, {});
  var SINONIMOS = {
    gerador: ['onan', 'generator', 'mdkdp', 'genset'], estabilizador: ['seakeeper', 'gyro', 'giroscopio', 'stabilizer'], giroscopio: ['seakeeper', 'gyro'],
    piloto: ['autopilot', 'reactor'], automatico: ['autopilot'], oleo: ['oil', 'lubrificante'], filtro: ['filter'], combustivel: ['fuel', 'diesel'], diesel: ['fuel'],
    motor: ['engine', 'd8', 'ips'], motores: ['engine', 'd8', 'ips'], rotor: ['impeller'], impelidor: ['impeller'], bomba: ['pump'], porao: ['bilge'],
    ar: ['dometic', 'climatizacao', 'chiller'], climatizacao: ['dometic', 'chiller', 'air'], condicionado: ['dometic', 'chiller'], incendio: ['fire', 'sea', 'smac'], fogo: ['fire', 'smac'],
    bateria: ['battery', 'baterias'], baterias: ['battery'], ancora: ['anchor', 'windlass', 'molinete'], molinete: ['windlass', 'anchor'], guincho: ['windlass'],
    falha: ['fault', 'erro', 'alarme'], erro: ['fault', 'falha'], alarme: ['alarm', 'falha'], codigo: ['code'], temperatura: ['temperature'], pressao: ['pressure'],
    arrefecimento: ['coolant', 'refrigerante'], refrigerante: ['coolant'], agua: ['water'], zinco: ['anode', 'anodo'], anodo: ['anode', 'zinco'], helice: ['propeller'],
    radar: ['fantom'], plotter: ['gpsmap', 'chartplotter'], som: ['fusion', 'audio'], audio: ['fusion'], radio: ['vhf'], vhf: ['radio', 'dsc'], ligar: ['start', 'partida', 'iniciar'],
    partida: ['start'], desligar: ['stop', 'shutdown', 'parar'], manutencao: ['maintenance', 'service', 'revisao'], revisao: ['service', 'maintenance'], limpeza: ['cleaning'],
    capacidade: ['capacity', 'litros', 'volume'], superaquecer: ['temperatura', 'overheat', 'arrefecimento', 'coolant'], superaquecimento: ['temperatura', 'overheat', 'arrefecimento', 'coolant'], esquentando: ['temperatura', 'arrefecimento'],
    parear: ['emparelhar', 'pairing', 'conectar', 'conectando', 'conexao'], emparelhar: ['pairing', 'bluetooth'], alarm: ['alarme'], lubrificante: ['oil', 'oleo'], tanque: ['tank'], helm: ['leme'], leme: ['steering'], direcao: ['steering']
  };
  function raiz(w) { if (/^\d/.test(w)) return w; w = w.replace(/coes$/, 'cao').replace(/oes$/, 'ao').replace(/aes$/, 'ao'); return w.length > 4 ? w.replace(/(es|s)$/, '') : w; }
  function tokens(t) {
    return norm(t).replace(/[^a-z0-9]+/g, ' ').split(' ').filter(function (w) { return w && !PARADAS[w] && (w.length > 2 || /\d/.test(w)); }).map(raiz);
  }
  function carregaBase() {
    if (KB.docs || KB.carregando || !window.fetch) return;
    KB.carregando = true;
    fetch('./base-conhecimento.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var lista = j && j.trechos; if (!lista || !lista.length) return;
      var soma = 0, df = {};
      lista.forEach(function (d) {
        var sec = d.secao || '', tf = {}, tk = tokens(sec + ' ' + sec + ' ' + sec + ' ' + d.texto + ' ' + (d.fonte || ''));
        d._lista = /invent[aá]rio|cat[aá]logo|[íi]ndice/i.test(d.fonte || '');
        d._en = (' ' + d.texto.toLowerCase() + ' ').split(/\b(?:the|and|with|to|of|is|are|your|from)\b/).length > 6;
        tk.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
        Object.keys(tf).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
        d._tf = tf; d._n = tk.length; soma += tk.length;
      });
      KB.df = df; KB.media = soma / lista.length; KB.docs = lista;
    }).catch(function () {}).then(function () { KB.carregando = false; });
  }
  // Devolve até n trechos { d, nota } ou [] se nada for relevante o bastante.
  var PROCEDIMENTO = /\b(como|o que fazer|procedimento|passo|trocar|troca|ligar|desligar|parear|alarme|falha|codigo|superaquec\w*|oleo|capacidade)\b/;
  function buscaBase(q, n) {
    if (!KB.docs) { carregaBase(); return []; }
    var qs = tokens(q).filter(function (w, k, a) { return a.indexOf(w) === k; });
    if (!qs.length) return [];
    // cada palavra da pergunta vira um grupo (ela + sinônimos); o trecho precisa cobrir a maioria dos grupos
    var grupos = qs.map(function (w) { var g = {}; g[w] = 1; (SINONIMOS[w] || []).forEach(function (x) { x = raiz(x); if (!g[x]) g[x] = 0.6; }); return g; });
    var N = KB.docs.length, k1 = 1.2, b = 0.75, res = [], proc = PROCEDIMENTO.test(' ' + norm(q) + ' ');
    KB.docs.forEach(function (d) {
      var nota = 0, bateu = 0, secao = d._sec || (d._sec = ' ' + tokens(d.secao || '').join(' ') + ' '), naSecao = 0;
      grupos.forEach(function (g) {
        var melhor = 0;
        for (var w in g) {
          var f = d._tf[w]; if (!f) continue;
          var idf = Math.log(1 + (N - KB.df[w] + 0.5) / (KB.df[w] + 0.5));
          melhor = Math.max(melhor, g[w] * idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d._n / KB.media)));
          if (secao.indexOf(' ' + w + ' ') !== -1) naSecao++;
        }
        if (melhor > 0) { bateu++; nota += melhor; }
      });
      if (naSecao >= grupos.length) nota *= 1.6; // o título da seção cobre a pergunta inteira
      if (d._lista && proc) nota *= 0.45;
      if (nota > 0 && bateu >= Math.min(2, grupos.length) && bateu >= Math.ceil(grupos.length * 0.6)) res.push({ d: d, nota: nota });
    });
    res.sort(function (x, y) { return y.nota - x.nota; });
    return res.slice(0, n || 3);
  }
  function citaFonte(d) { return d.fonte + (d.pag ? ', p. ' + d.pag : d.secao ? ' · ' + d.secao : ''); }
  function trechoCurto(t, max) {
    t = String(t || '').replace(/\s+/g, ' ').trim(); max = max || 480;
    if (t.length <= max) return t;
    var c = t.slice(0, max), m = c.match(/^[\s\S]*[.!?;](?=\s)/);
    return (m && m[0].length > max * 0.5 ? m[0] : c.slice(0, c.lastIndexOf(' ')) + '…');
  }
  var GENERICAS = { gerador: 1, motores: 1, audio: 1, estabilizador: 1, eletronicos: 1, climatizacao: 1, dessalinizador: 1, eletrico: 1, porao: 1, ancora: 1, manual: 1, clima: 0 };
  var ESPECIFICA = /\b(como|trocar|troca|substitu\w*|parear|pareamento|conectar|codigo|codigos|alarme|alarmes|erro|falha|falhas|defeito|superaquec\w*|oleo|filtro|impeller|impelidor|rotor|capacidade|litros|pressao|temperatura|onde fica|localiza\w*|procedimento|passo|reset\w*|calibr\w*|configur\w*|limp\w*|intervalo|torque|especifica\w*|viscosidade|bluetooth|dsc|mob|zinco|anodo|fusivel|disjuntor)\b/;
  function respostaBase(q, p) {
    var hits = buscaBase(q, 3); if (!hits.length) return null;
    var h = hits[0].d, outros = hits.slice(1).filter(function (x) { return x.d.fonte !== h.fonte || x.d.pag !== h.pag; });
    var text = trechoCurto(h.texto) + (outros.length ? '\nVeja também: ' + outros.map(function (x) { return citaFonte(x.d); }).join(' · ') : '');
    return { text: text, src: 'Fonte: ' + citaFonte(h) + ' — base de conhecimento de bordo', actions: act(p, [['FAQ de bordo', 'faq']]), ref: citaFonte(h), ingles: !!h._en };
  }
  if (window.requestIdleCallback) requestIdleCallback(carregaBase, { timeout: 4000 }); else setTimeout(carregaBase, 1500);

  function answer(q, ctx) {
    ctx = ctx || {};
    var p = ctx.platform || 'web';
    var key = null;
    if (ctx.id && ANSWERS[ctx.id] && (!String(q || '').trim() || norm(q).trim() === CANON[ctx.id])) key = ctx.id;
    if (!key) key = route(q);
    if (!ANSWERS[key]) key = 'fallback';
    var a;
    try { a = ANSWERS[key](p, ctx, String(q || '').trim()); } catch (e) { key = 'fallback'; a = ANSWERS.fallback(p, ctx); }
    // Sem resposta pronta, ou pergunta específica sobre um equipamento (como, código, óleo, alarme, onde fica…): o trecho do manual vale mais que o resumo genérico.
    if (key === 'fallback' || (GENERICAS[key] && ESPECIFICA.test(' ' + norm(q) + ' '))) { var kb = null; try { kb = respostaBase(q, p); } catch (e) {} if (kb) { a = kb; key = 'base'; } }
    a.key = key;
    return a;
  }

  function answerAttachment(kind, file, ctx) {
    var p = (ctx && ctx.platform) || 'web';
    var name = file && file.name ? file.name : (kind === 'video' ? 'vídeo' : 'foto');
    var kb = file && file.size ? Math.round(file.size / 1024) + ' KB' : '';
    var n = now(), grava = !ctx || ctx.commit !== false, nao = 'não anexei ao diário (pedido vindo de link).';
    if (grava) addDiario({ sys: 'Equipamentos', tone: 'var(--av-accent, #409cff)', t: (kind === 'video' ? 'Vídeo' : 'Foto') + ' anexada pelo chat: ' + name + (kb ? ' (' + kb + ')' : '') + ' — identificação A CONFIRMAR.', who: quem(), src: 'app · ' + kind });
    if (kind === 'video') return { key: 'video', text: 'Vídeo recebido (' + name + (kb ? ' · ' + kb : '') + ') · ' + n.d + ' ' + n.t + '.\nNeste protótipo o som e o comportamento não são analisados automaticamente: ' + (grava ? 'anexei ao diário como anomalia A CONFIRMAR, com a telemetria do instante (motores em marcha lenta · 600 rpm · neutro).' : nao) + '\nDescreva em uma frase o que você viu ou ouviu — respondo com o que verificar primeiro.', src: 'Fonte: anexo · diário de bordo', actions: act(p, [['Abrir diário', 'diario']]) };
    return { key: 'foto', text: 'Foto recebida (' + name + (kb ? ' · ' + kb : '') + ') · ' + n.d + ' ' + n.t + '.\nNeste protótipo a leitura da imagem não é automática: ' + (grava ? 'anexei ao diário como A CONFIRMAR.' : nao) + ' Para etiqueta ou tela de alarme, digite o modelo/código que aparece e eu localizo o manual; para nota fiscal, digite litros e valor e eu registro o abastecimento.', src: 'Fonte: anexo · diário de bordo', actions: act(p, [['Abrir diário', 'diario'], ['Documentos', 'docs']]) };
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
  // ---- Voz (conversa ativa) ----
  // falavel(): texto de tela → português falado. Regras em ordem, guiadas pelas tabelas; sem lookbehind (Safari antigo).
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var HEMI = { N: 'norte', S: 'sul', L: 'leste', E: 'leste', O: 'oeste', W: 'oeste' };
  var LET = 'A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF', MAI = 'A-Z\\u00C0-\\u00D6\\u00D8-\\u00DE'; // letras latinas (em escape: não quebra se o .js vier sem UTF-8)
  // palavra inteira: o grupo 1 guarda o caractere anterior (reposto como $1)
  function rx(core) { return new RegExp('(^|[^' + LET + '\\d])(?:' + core + ')(?![' + LET + '\\d])', 'g'); }
  // unidades — só logo depois de número: [símbolo, singular, plural]; as mais longas primeiro
  var UNID = [
    ['km/h', 'quilômetro por hora', 'quilômetros por hora'], ['L/h', 'litro por hora', 'litros por hora'], ['kWh', 'quilowatt-hora', 'quilowatts-hora'],
    ['kW', 'quilowatt', 'quilowatts'], ['km', 'quilômetro', 'quilômetros'], ['hPa', 'hectopascal', 'hectopascais'], ['MHz', 'megahertz', 'megahertz'],
    ['kHz', 'quilohertz', 'quilohertz'], ['rpm|RPM', 'rotação por minuto', 'rotações por minuto'], ['min', 'minuto', 'minutos'],
    ['mn|NM|MN', 'milha náutica', 'milhas náuticas'], ['kts?|kn|nós', 'nó', 'nós'], ['KB', 'quilobyte', 'quilobytes'], ['MB', 'megabyte', 'megabytes'],
    ['Ah', 'ampère-hora', 'ampères-hora'], ['L', 'litro', 'litros'], ['h', 'hora', 'horas'], ['m', 'metro', 'metros'], ['s', 'segundo', 'segundos'],
    ['d', 'dia', 'dias'], ['V', 'volt', 'volts'], ['W', 'watt', 'watts'], ['A(?!\\s+[' + MAI + ']{2})', 'ampère', 'ampères']
  ].map(function (u) { return { re: new RegExp('(^|[^' + LET + '\\d.,])(\\d+(?:[.,]\\d+)*)\\s?(?:' + u[0] + ')(\\+?)(?![' + LET + '\\d])', 'g'), um: u[1], varios: u[2] }; });
  // siglas e abreviações por extenso (palavra inteira, maiúsculas exatas)
  var SIGLAS = [
    ['NF-e', 'nota fiscal eletrônica'], ['NF', 'nota fiscal'], ['BB', 'bombordo'], ['BE', 'boreste'], ['SOG', 'velocidade sobre o fundo'],
    ['COG', 'rumo sobre o fundo'], ['STBY', 'standby'], ['MOB', 'homem ao mar'], ['AC', 'corrente alternada'], ['DC', 'corrente contínua'],
    ['RPM', 'rotação'], ['PAN-PAN', 'pan pan'], ['[Nn][º°]', 'número'], ['Cat I', 'categoria 1'], ['máx\\.?', 'máximo'], ['mín\\.?', 'mínimo'],
    ['Sr\\.', 'senhor'], ['Sra\\.', 'senhora'], ['ref\\.', 'referência'], ['cert\\.', 'certificado']
  ].map(function (x) { return [rx(x[0]), '$1' + x[1]]; });
  // símbolos → fala ou pausa
  var SIMB = [
    [/Rev\. ?(?=\d)/g, 'revisão '], [/§ ?/g, 'seção '], [/(\d)-(?=\d)/g, '$1 '],
    [/\s*±\s*/g, ' mais ou menos '], [/\s*[≈~]\s*/g, ' cerca de '], [/\s*≤\s*/g, ' até '], [/\s*≥\s*/g, ' pelo menos '],
    [new RegExp('(\\d)\\s*×\\s*(?=[' + LET + '])', 'g'), '$1 '], [/×\s*(\d+)/g, '$1 vezes'], [/\s*×\s*/g, ' vezes '],
    [/\s+\+\s+/g, ' mais '], [/(^|\s)\+(?=\d)/g, '$1mais '], [/\s*%/g, ' por cento'],
    [new RegExp('([' + LET + '])→(?=[' + LET + '])', 'g'), '$1 para '], [/\s*[•·→›|—–=()\[\]]\s*/g, ', '],
    [/\.(pdf|csv|jsonl?|jpe?g|png|mp4|mov|txt)(?![A-Za-z])/gi, function (m, e) { return ' ' + e.toUpperCase(); }], [/(?:\s*_)+\s*/g, ' '],
    [new RegExp('([' + LET + '])\\s*/\\s*(?=\\d)', 'g'), '$1 ou '], [/\s*\/\s*/g, ', ']
  ];
  // MAIÚSCULAS de 4+ letras viram minúsculas (senão o TTS soletra), com as palavrinhas do mesmo trecho; siglas lidas como tal ficam.
  var SIGLA_OK = ' VHF AIS GPS MMSI EPIRB NMEA ANATEL DHN FISTEL TIE GPSMAP SOS SMAC ICRJ ';
  var MIUDAS = ' A O E É AS OS DE DA DO DAS DOS EM NA NO NAS NOS AO AOS À ÀS UM UMA SEM COM POR PARA OU QUE SE SÓ JÁ NÃO HÁ ';
  var CAIXA = new RegExp('(^|[^' + LET + '\\d-])([' + MAI + ']+(?: [' + MAI + ']+)*)(?![' + LET + '\\d-])', 'g');
  function minusculas(s) {
    var grande = function (w) { return w.length >= 4 && /[AEIOUÁÉÍÓÚÂÊÔÃÕÀ]/.test(w) && SIGLA_OK.indexOf(' ' + w + ' ') === -1; };
    return s.replace(CAIXA, function (m, a, run) {
      var ws = run.split(' ');
      if (!ws.some(grande)) return m;
      return a + ws.map(function (w) { return grande(w) || MIUDAS.indexOf(' ' + w + ' ') !== -1 ? w.toLowerCase() : w; }).join(' ');
    });
  }
  var FRACAO = { '1/2': 'meio', '1/3': 'um terço', '2/3': 'dois terços', '1/4': 'um quarto', '3/4': 'três quartos' };
  var DATA_ANTES = new RegExp('(?:^|[^' + LET + '])(?:em|dia|até|ate|desde|de|data|prazo|vence|venceu|vencimento) $', 'i'), DATA_FRACA = new RegExp('(?:^|[^' + LET + '])(?:de|até|ate) $', 'i');
  // fração antes de unidade: 1/2 h → meia hora, 1/2 L → meio litro, 1/2 milha → meia milha, 1/4 L → um quarto de litro, 1/3 hora → um terço de hora
  var FRACAO_UNID = { 'L/h': 'litro por hora', L: 'litro', h: 'hora', mn: 'milha náutica', NM: 'milha náutica', hora: 'hora', milha: 'milha', volta: 'volta', polegada: 'polegada' }, FEM = /^(?:hora|milha|volta|polegada)/;
  var FRACAO_UN = new RegExp('(^|[^\\d\\/,.])([123])\\/([234]) ?(L\\/h|L|h|mn|NM|hora|milha|volta|polegada)(?![' + LET + '\\d\\/])', 'g');
  function hora(h) { return h + (h < 2 ? ' hora' : ' horas'); }
  // Horário: "13:23" → "13 horas e 23 minutos" (":00" → "13 horas"); duração "1 h 10" → "1 hora e 10 minutos".
  function falavel(text) {
    // teto de 4.000 letras (fala longa não trava a tela); espaços repetidos viram um só antes das regras
    var s = String(text == null ? '' : text).slice(0, 4000).replace(/[“”"«»]/g, '').replace(/[\u00a0\t]/g, ' ').replace(/…/g, ', ');
    // linha = frase; marcador de lista no começo da linha some (a quebra já é pausa)
    s = s.split(/\r?\n/).map(function (l) { return l.replace(/^[\s•·→›—–]+/, '').trim(); }).filter(Boolean)
      .map(function (l, i, a) { return i < a.length - 1 && !/[.!?:;,]$/.test(l) ? l + '.' : l; }).join(' ').replace(/\s+/g, ' ');
    // coordenadas 22°57,09'S → 22 graus e 57 vírgula 09 minutos sul
    s = s.replace(/(\d{1,3}) ?° ?(\d{1,2})(?:,(\d+))? ?['′] ?([NSLOEW])(?![A-Za-z])/g, function (m, g, mi, fr, h) {
      g = +g; mi = +mi;
      return g + (g === 1 ? ' grau e ' : ' graus e ') + mi + (fr ? ' vírgula ' + fr + ' minutos ' : mi === 1 ? ' minuto ' : ' minutos ') + HEMI[h];
    }).replace(/(minutos? (?:norte|sul|leste|oeste)) (?=\d)/g, '$1, ');
    // dinheiro R$ 5.480,50 → 5.480 reais e 50 centavos
    s = s.replace(/R\$ ?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{2}))?(?!\d)/g, function (m, r, c) {
      var cv = c ? +c : 0, cent = cv ? cv + (cv === 1 ? ' centavo' : ' centavos') : '';
      return r === '0' && cent ? cent : r + (r === '1' ? ' real' : ' reais') + (cent ? ' e ' + cent : '');
    });
    // intervalos 8–14 / 8-14 → 8 a 14 (hífen só entre números curtos; 07897-25-01493 fica como código); escala 1:50.000 → 1 para 50.000; data + hora ganha "às"
    s = s.replace(/(\d) ?– ?(?=\d)/g, '$1 a ').replace(new RegExp('(^|[^' + LET + '\\d-])(\\d{1,3})-(\\d{1,3})(?![\\d-])', 'g'), '$1$2 a $3')
      .replace(/(^|[^\d:,.])(\d+):(\d{1,3}(?:\.\d{3})+|\d{3,})(?![\d:])/g, '$1$2 para $3').replace(/(\d{1,2}\/\d{1,2}(?:\/\d{4})?) (?=\d{1,2}:\d{2}(?!\d))/g, '$1 às ');
    s = s.replace(FRACAO_UN, function (m, a, d, me, u) {
      var fr = FRACAO[d + '/' + me], nome = FRACAO_UNID[u];
      if (!fr) return m;
      return a + (fr === 'meio' ? (FEM.test(nome) ? 'meia ' : 'meio ') + nome : fr + ' de ' + nome);
    });
    // datas 20/09 → 20 de setembro; 16/07/2026; jan/2031. d/m de um dígito só é data com ano, hora ou palavra de data antes;
    // 1/4 de volta → um quarto de volta; 24/7 → 24 por 7; outro par curto → 5 barra 6. Com palavra de data antes (dia, em, desde, prazo, vence…)
    // fica a data ("dia 1/2 de manhã"); a fração só vence depois de "de"/"até" seguida de " do/da/de " ("até 3/4 do tanque")
    s = s.replace(/(^|[^\d\/])(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?(?![\d\/])/g, function (m, a, d, me, y, i, all) {
      var dd = +d, mm = +me, data = dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12, fr = d.length === 1 && me.length === 1 && FRACAO[d + '/' + me];
      var ctx = (i > 24 ? 'x' : '') + all.slice(Math.max(0, i - 24), i + a.length), antes = DATA_ANTES.test(ctx), depois = all.slice(i + m.length, i + m.length + 12);
      if (!y && !antes && d === '24' && me === '7') return a + '24 por 7';
      if (!y && d.length === 1 && me.length === 1 && !/^ às? \d/.test(depois)) {
        if (fr && /^ d(?:e|o|a|os|as) (?!\d)/.test(depois) && (!antes || DATA_FRACA.test(ctx))) return a + fr;
        if (!antes || !data) return a + (fr || d + ' barra ' + me);
      }
      return data ? a + (dd === 1 ? 'primeiro' : dd) + ' de ' + MESES[mm - 1] + (y ? ' de ' + y : '') : m;
    }).replace(new RegExp('(^|[^' + LET + '])(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/(\\d{4})(?!\\d)', 'gi'), function (m, a, me, y) {
      return a + MESES['janfevmarabrmaijunjulagosetoutnovdez'.indexOf(me.toLowerCase()) / 3] + ' de ' + y;
    });
    // horário 13:23 / 23h01 (nunca razão) e duração 1 h 10 / 6 h 58 min
    s = s.replace(/(^|[^\d:,.])(\d{1,2})(?::|h)(\d{2})(?:min(?![A-Za-z]))?(?![\d:]|\.\d)/g, function (m, a, h, mi) {
      h = +h; mi = +mi;
      return h > 23 || mi > 59 ? m : a + hora(h) + (mi ? ' e ' + mi + (mi === 1 ? ' minuto' : ' minutos') : '');
    }).replace(/ às ([01] hora)(?!s)/g, ' à $1').replace(/(^|[^\d,.])(\d+) ?h ?(\d{1,2})(?: ?min(?![A-Za-z])|(?![\d,.:\/]\d|\d| ?[A-Za-z%°]))/g, function (m, a, h, mi) {
      mi = +mi;
      return a + hora(+h) + (mi ? ' e ' + mi + (mi === 1 ? ' minuto' : ' minutos') : '');
    });
    // graus: 23,8 °C → graus Celsius; proa 046° → 46 graus
    s = s.replace(/(^|[^\d,])(\d+(?:,\d+)?) ?° ?C(?![A-Za-z])/g, function (m, a, n) { return a + n + (n === '1' ? ' grau' : ' graus') + ' Celsius'; })
      .replace(/(^|[^\d,])(\d+)(,\d+)? ?°/g, function (m, a, n, f) { n = +n + (f || ''); return a + n + (n === '1' ? ' grau' : ' graus'); });
    // D-4 (dias até) → D menos 4; MMSI dígito a dígito, como no rádio
    s = s.replace(new RegExp('(^|[^' + LET + '\\d])D-(\\d+)(?!\\d)', 'g'), '$1D menos $2')
      .replace(/MMSI:? ?(\d{9})(?!\d)/g, function (m, n) { return 'MMSI ' + n.split('').join(' '); });
    // decimal sem zeros à direita (34,0 → 34; 156,800 → 156,8), depois unidades, siglas e símbolos
    s = s.replace(/(\d),(\d*?)0+(?!\d)/g, function (m, a, b) { return b ? a + ',' + b : a; });
    UNID.forEach(function (u) { s = s.replace(u.re, function (m, a, n, mais) { return a + n + ' ' + (n === '1' ? u.um : u.varios) + (mais ? ' ou mais' : ''); }); });
    SIGLAS.forEach(function (x) { s = s.replace(x[0], x[1]); });
    s = s.replace(/°/g, ' graus');
    s = s.replace(/\s+/g, ' ');
    SIMB.forEach(function (x) { s = s.replace(x[0], x[1]); });
    s = minusculas(s);
    // 3.2 → 3 ponto 2 (milhar 1.500 fica); 27,49 → 27 vírgula 49
    s = s.replace(/(^|[^\d.])(\d+(?:\.\d+)+)/g, function (m, a, n) { var g = n.split('.'); return a + (g.slice(1).every(function (x) { return x.length === 3; }) ? n : g.join(' ponto ')); })
      .replace(/(\d),(?=\d)/g, '$1 vírgula ');
    // pontuação: um só sinal por pausa (o mais forte), sem ". ." nem ", :"
    return s.replace(/\s+/g, ' ').replace(/\s*([,;:.!?](?:\s*[,;:.!?])*)\s*/g, function (m, p, i, all) {
      if (m.length === 1 && /\d/.test(all.charAt(i - 1)) && /\d/.test(all.charAt(i + 1))) return m;
      return (/[?!]/.test(p) ? p.match(/[?!]/)[0] : p.indexOf('.') !== -1 ? '.' : /[:;]/.test(p) ? p.match(/[:;]/)[0] : ',') + ' ';
    }).replace(/^[\s,;:.!?]+|[\s,;:]+$/g, '');
  }

  // Melhor voz pt-BR: neural/online › Google › Apple premium/enhanced › Luciana/Felipe › qualquer pt-BR › qualquer pt. Nunca outro idioma.
  var VOZ = { v: null, on: null, ruim: {} };
  var VOZ_PREF = [[/natural|neural/i, 600], [/online/i, 550], [/google/i, 500], [/premium/i, 450], [/enhanced|aprimorad|melhorad/i, 400], [/luciana|felipe/i, 300]];
  function notaVoz(v, on) {
    var lang = String(v.lang || '').replace(/_/g, '-').toLowerCase(), nome = String(v.name || ''), id = nome + ' ' + (v.voiceURI || '');
    if (!/^(pt|por)(-|$)/.test(lang) || VOZ.ruim[nome]) return 0;
    var n = /-bra?$/.test(lang) || (/^(pt|por)$/.test(lang) && /bra[sz]il/i.test(nome)) ? 2000 : 1000;
    for (var j = 0; j < VOZ_PREF.length; j++) if (VOZ_PREF[j][0].test(id)) { n += VOZ_PREF[j][1]; break; }
    if (!on && v.localService === false) n -= 700; // sem internet a voz de rede não fala
    if (/eloquence/i.test(v.voiceURI || '') || /^(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i.test(nome)) n -= 50; // vozes-novidade da Apple
    // voz masculina ganha de voz feminina do mesmo nível (natural/online), mas nunca de uma voz bem mais natural
    return n + (/antonio|felipe|donato|fabio|humberto|julio|nicolau|valerio|daniel|ricardo/i.test(nome) ? 120 : 0) + (v.default ? 1 : 0);
  }
  function vozPtBr() {
    var ss = window.speechSynthesis, on = !(window.navigator && window.navigator.onLine === false), lista = [], best = null, nota = 0;
    if (VOZ.v && VOZ.on === on) return VOZ.v;
    try { lista = (ss && ss.getVoices && ss.getVoices()) || []; } catch (e) {}
    for (var j = 0; j < lista.length; j++) { var n = notaVoz(lista[j], on); if (n > nota) { nota = n; best = lista[j]; } }
    VOZ.v = best; VOZ.on = on;
    return best;
  }
  // as vozes chegam depois (Chrome começa com lista vazia): pede já e refaz a escolha quando a lista mudar
  (function () {
    var ss = window.speechSynthesis, zera = function () { VOZ.v = null; };
    if (!ss) return;
    try { ss.getVoices(); if (ss.addEventListener) ss.addEventListener('voiceschanged', zera); else if (!ss.onvoiceschanged) ss.onvoiceschanged = zera; } catch (e) {}
  })();
  // Frases inteiras em blocos de até ~200 letras: prosódia melhor e sem o corte do Chrome em falas longas (~15 s).
  function blocos(s) {
    var MAX = 200, out = [];
    (function junta(partes, sep, nivel) {
      var cur = '';
      partes.forEach(function (p) {
        if (!p) return;
        if (p.length > MAX && nivel < 2) { if (cur) out.push(cur); cur = ''; junta(nivel ? p.split(' ') : p.split(/,\s+/), nivel ? ' ' : ', ', nivel + 1); return; }
        if (cur && (cur + sep + p).length > MAX) { out.push(cur); cur = p; } else cur = cur ? cur + sep + p : p;
      });
      if (cur) out.push(cur);
    })(s.replace(/([.!?;])\s+/g, '$1\n').split('\n'), ' ', 0);
    return out;
  }
  // Vigia de cada bloco a 1x: 95 ms/letra (folga sobre ~85 medidos) + 250 ms/dígito, porque número falado é longo.
  function estimaMs(t) { return Math.min(60000, 2000 + t.length * 95 + (t.match(/\d/g) || []).length * 250); }
  var FALA = { gen: 0, timer: null, vivo: null, fila: [] };
  function calaTimers() { clearTimeout(FALA.timer); clearInterval(FALA.vivo); FALA.timer = FALA.vivo = null; }
  // onEnd dispara uma única vez, depois do último bloco (ou por erro/vigia). Nova fala ou stopSpeaking() trocam a geração: o onEnd antigo nunca dispara.
  // Ditado: escuta até a pessoa parar de falar por `pausa` ms (ou tocar de novo). Junta todos os trechos — o reconhecedor
  // fecha um "resultado final" a cada respiro e, no Android, encerra a cada frase: aqui ele religa sozinho sem perder o texto.
  // o = { pausa, espera (ms sem ouvir nada até desistir), max, parcial(texto), fim(texto), erro(codigo) }. Retorna { parar, cancelar } ou null.
  // Eventos 'avanti-voz' ({ estado: ouvindo | pensando | falando | pulso | livre, texto }) — animação do diamante (avanti-voz.js).
  function evVoz(estado, texto) { try { window.dispatchEvent(new CustomEvent('avanti-voz', { detail: { estado: estado, texto: texto || '' } })); } catch (e) {} }
  var ESCUTA = { rec: null };
  function ditado(o) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return null;
    o = o || {};
    var pausa = o.pausa || 2500, feito = false, texto = '', sessao = '', r = null, t = 0, tMax = 0, ouviu = false, rapidas = 0, ini = 0;
    function atual() { return (texto + ' ' + sessao).replace(/\s+/g, ' ').trim(); }
    // O Chrome do Android devolve resultados acumulados ("você", "você tem", "você tem banco"…): somar tudo repetia palavras.
    // Cada sessão é remontada do zero a partir de todos os resultados, e um trecho que continua o anterior o substitui.
    function junta(lista, seg) {
      var n = norm(seg).replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim(); if (!n) return;
      var ult = lista.length ? norm(lista[lista.length - 1]).replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim() : null;
      if (ult !== null && n.indexOf(ult) === 0) lista[lista.length - 1] = seg.trim();
      else if (ult !== null && ult.indexOf(n) === 0) return;
      else lista.push(seg.trim());
    }
    function arma() { clearTimeout(t); t = setTimeout(function () { fim(); }, ouviu ? pausa : (o.espera || 8000)); }
    function solta() { clearTimeout(t); clearTimeout(tMax); var x = r; r = null; if (x) { try { x.onresult = x.onend = x.onerror = null; x.abort(); } catch (e) {} } }
    function fim() { if (feito) return; feito = true; var txt = atual(); solta(); solto(); evVoz(txt ? 'pensando' : 'livre', txt); if (o.fim) o.fim(txt); }
    function falha(e) { if (feito) return; feito = true; solta(); solto(); evVoz('livre'); if (o.erro) o.erro(e); }
    function solto() { if (ESCUTA.rec === h) ESCUTA.rec = null; }
    function liga() {
      var x = r = new SR(); x.lang = 'pt-BR'; x.continuous = true; x.interimResults = true; x.maxAlternatives = 1; ini = Date.now();
      x.onresult = function (ev) {
        if (x !== r) return;
        var partes = [];
        for (var i = 0; i < ev.results.length; i++) junta(partes, String(ev.results[i][0].transcript || ''));
        sessao = partes.join(' ');
        if (atual()) { ouviu = true; rapidas = 0; }
        if (o.parcial) o.parcial(atual()); evVoz('ouvindo', atual()); arma();
      };
      x.onerror = function (ev) { var e = ev && ev.error; if (x === r && (e === 'not-allowed' || e === 'service-not-allowed' || e === 'audio-capture')) falha(e); };
      x.onend = function () { // fim de sessão do navegador (não da pessoa): guarda o que ouviu e religa
        if (x !== r || feito) return;
        texto = atual(); sessao = '';
        rapidas = Date.now() - ini < 400 ? rapidas + 1 : 0;
        if (rapidas >= 4) { if (ouviu) fim(); else falha('no-speech'); return; }
        try { liga(); } catch (e) { fim(); }
      };
      x.start();
    }
    var h = { parar: fim, cancelar: function () { if (feito) return; feito = true; solta(); solto(); evVoz('livre'); } };
    try { liga(); } catch (e) { return null; }
    arma(); tMax = setTimeout(fim, o.max || 90000);
    ESCUTA.rec = h; evVoz('ouvindo', '');
    return h;
  }
  // Convite: o site não tem servidor — o convite sai pelo WhatsApp (celular) ou e-mail do próprio aparelho, com o link de acesso.
  // contato = celular com DDD (8–15 dígitos; sem +55 assume Brasil) ou e-mail. Retorna { href, canal, contato } ou null se inválido.
  function linkConvite(nome, contato, acesso) {
    var c = String(contato || '').trim(), url = location.href.replace(/[^\/]*$/, '') + 'login.html';
    var msg = 'Olá, ' + nome + '! Você foi convidado(a) para o Avanti Vessel AI — Azimut Atlantis 51 (acesso ' + (acesso || 'total') + ').\nEntre por: ' + url + '\nO usuário e a senha são passados pelo proprietário.';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return { canal: 'e-mail', contato: c, href: 'mailto:' + encodeURIComponent(c) + '?subject=' + encodeURIComponent('Convite · Avanti Vessel AI') + '&body=' + encodeURIComponent(msg) };
    if (!/^\+?[\d ().-]+$/.test(c)) return null;
    var d = c.replace(/\D/g, ''); if (d.length < 10 || d.length > 15) return null;
    if (c.charAt(0) !== '+' && d.length <= 11) d = '55' + d.replace(/^0+/, '');
    return { canal: 'WhatsApp', contato: c, href: 'https://wa.me/' + d + '?text=' + encodeURIComponent(msg) };
  }
  // Voz única do aparelho: apaga a chave/URL de voz em nuvem que versões anteriores guardavam neste aparelho.
  try { localStorage.removeItem('avanti.voz.eleven.v1'); localStorage.removeItem('avanti.voz.nuvem.v1'); } catch (e) {}
  // Legendas do núcleo de voz: o texto original (com siglas e números como na tela), linha a linha.
  function legendas(text) {
    var out = [];
    String(text || '').split(/\n+/).forEach(function (l) { l = l.trim(); if (l) out = out.concat(blocos(l)); });
    return out;
  }
  function speak(text, onEnd) {
    var gen = ++FALA.gen, done = false, ss = window.speechSynthesis, i = 0, atual = null, tentou = {}, voz = null, partes = [], leg = legendas(text);
    var fin = function () { if (done || gen !== FALA.gen) return; done = true; calaTimers(); FALA.fila = []; FALA.pula = null; evVoz('livre'); if (onEnd) onEnd(); };
    var vale = function (u) { return !done && gen === FALA.gen && u === atual; };
    var legenda = function (k, n) { return leg.length ? leg[Math.min(leg.length - 1, Math.floor(k * leg.length / Math.max(1, n)))] : ''; };
    calaTimers(); FALA.fila = [];
    // Tocar no diamante enquanto fala: encerra esta fala como se tivesse terminado (a conversa volta a ouvir).
    FALA.pula = function () { if (done || gen !== FALA.gen) return; try { if (ss) ss.cancel(); } catch (e) {} fin(); };
    function vigia(u, ms) { clearTimeout(FALA.timer); FALA.timer = setTimeout(function () { if (vale(u)) avanca(); }, ms); }
    function avanca() { if (++i >= partes.length) return fin(); try { fala(i); } catch (e) { fin(); } }
    function fala(k) {
      var u = new SpeechSynthesisUtterance(partes[k]), est = estimaMs(partes[k]);
      u.lang = voz && voz.lang ? String(voz.lang).replace(/_/g, '-') : 'pt-BR'; if (voz) u.voice = voz; u.rate = 1;
      u.onstart = function () { if (vale(u)) { vigia(u, est); evVoz('falando', legenda(k, partes.length)); } };
      u.onboundary = function (e) { if (vale(u) && (!e || e.name !== 'sentence')) evVoz('pulso'); };
      u.onend = function () { if (vale(u)) avanca(); };
      u.onerror = function (e) {
        if (!vale(u)) return;
        var err = e && e.error;
        if (err === 'interrupted' || err === 'canceled') return fin(); // cancelada por fora
        if (voz && voz.localService === false && !tentou[k]) { // voz de rede falhou (sem internet): troca de voz e repete o bloco
          tentou[k] = 1; VOZ.ruim[voz.name] = 1; VOZ.v = null; voz = vozPtBr();
          try { return fala(k); } catch (x) { return fin(); }
        }
        avanca();
      };
      atual = u; FALA.fila.push(u); vigia(u, est + 4000);
      evVoz('falando', legenda(k, partes.length));
      ss.speak(u);
    }
    function doAparelho() {
      if (done || gen !== FALA.gen) return false;
      if (!ss || !window.SpeechSynthesisUtterance) { setTimeout(fin, 0); return false; }
      try {
        partes = blocos(falavel(text)); voz = vozPtBr(); i = 0;
        ss.cancel(); if (ss.paused) ss.resume();
        if (!partes.length) { setTimeout(fin, 0); return false; }
        fala(0);
        // keep-alive do Chrome desktop só p/ voz Google de rede (a que corta em ~15 s)
        if (!done && voz && /google/i.test(voz.name) && voz.localService === false && !/android/i.test((window.navigator && window.navigator.userAgent) || ''))
          FALA.vivo = setInterval(function () { try { if (gen === FALA.gen && ss.speaking && !ss.paused) { ss.pause(); ss.resume(); } } catch (e) {} }, 10000);
        return true;
      } catch (e) { calaTimers(); setTimeout(fin, 0); return false; }
    }
    return doAparelho();
  }
  function stopSpeaking() { FALA.gen++; calaTimers(); FALA.fila = []; FALA.pula = null; try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} evVoz('livre'); }
  // Abertura da conversa: curta, sem cerimônia.
  function abertura() { return 'Pode falar.'; }
  // Fala direta: na voz vai só o essencial (a 1ª linha da resposta, sem fontes); o texto completo fica na tela.
  // Emergência (SOS, pressão de óleo) é lida inteira — segurança vem antes da concisão.
  var FALA_INTEIRA = { sos: 1, oleo: 1, epirb: 1 };
  function falaCurta(a) {
    var t = a && typeof a === 'object' ? a.text : a;
    if (a && a.key && FALA_INTEIRA[a.key]) return String(t || '');
    if (a && a.key === 'base' && a.ingles) return 'Está no ' + String(a.ref || 'manual').replace(/, p\. /, ', página ').replace(/ · .*$/, '') + ', em inglês. Mostrei o trecho na tela.';
    var item = function (l) { return l.replace(/^(\d+[.)]|•|-)\s*/, '').replace(/\s*\([^)]*\)/g, '').trim(); };
    var ls = String(t || '').split(/\n+/).map(function (l) { return l.trim(); }).filter(function (l) { return l && !/^fonte\b/i.test(l); });
    var r = (ls[0] || '').replace(/\s*\([^)]*\)/g, ''), extra = [];
    if (/ressalva/i.test(r)) extra = ls.filter(function (l) { return /ressalva\s*\d/i.test(l); }).map(function (l) { return item(l).replace(/^ressalva\s*\d+:\s*/i, '').split(' — ')[0]; });
    else if (/:$/.test(r)) { r = r.replace(/:$/, ''); extra = ls.slice(1, 3).filter(function (l) { return /^(\d+[.)]|•|-)/.test(l); }).map(item); }
    if (extra.length) r = r.replace(/[.]$/, '') + ': ' + extra.join('; ') + '.';
    if (r.length > 220) { var m = r.slice(0, 220).match(/^[\s\S]*[.!?;]/); r = m ? m[0] : r.slice(0, r.lastIndexOf(' ', 220)) + '.'; }
    return r;
  }

  // Controles do overlay de voz (avanti-voz.js)
  function vozEnviar() { if (ESCUTA.rec) ESCUTA.rec.parar(); }
  function pularFala() { if (FALA.pula) FALA.pula(); }
  function vozEncerrar() {
    try { window.dispatchEvent(new CustomEvent('avanti-voz-encerrar')); } catch (e) {} // a tela desliga a conversa e limpa o estado
    var r = ESCUTA.rec; ESCUTA.rec = null; if (r) try { r.cancelar(); } catch (e) {}
    stopSpeaking();
  }

  window.AvantiBrain = { BASE: BASE, buscaBase: buscaBase, carregaBase: carregaBase, DEFAULTS: DEFAULTS, BANK: BANK, ALL: ALL, HREF: HREF, loadShortcuts: loadShortcuts, saveShortcuts: saveShortcuts, resetShortcuts: resetShortcuts, bankFor: bankFor, loadDiario: loadDiario, addDiario: addDiario, loadExec: loadExec, markExec: markExec, unmarkExec: unmarkExec, loadEquipe: loadEquipe, saveEquipe: saveEquipe, loadDocs: loadDocs, addDoc: addDoc, answer: answer, answerAttachment: answerAttachment, quem: quem, route: route, parseHash: parseHash, clearHash: clearHash, recognizer: recognizer, ditado: ditado, linkConvite: linkConvite, speak: speak, stopSpeaking: stopSpeaking, abertura: abertura, falaCurta: falaCurta, vozEnviar: vozEnviar, pularFala: pularFala, vozEncerrar: vozEncerrar, falavel: falavel, voz: vozPtBr, now: now, askHref: askHref };
  try { window.dispatchEvent(new CustomEvent('avanti-brain-ready')); } catch (e) {}
})();
