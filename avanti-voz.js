/* Avanti Vessel AI — núcleo de voz (HUD do cérebro da embarcação).
   Escuta os eventos 'avanti-voz' que o avanti-brain.js emite e mostra, por cima da tela, o núcleo da IA:
   anéis graduados girando, espectro radial que acompanha a voz, varredura de radar e a marca AI no centro.
   - ESCUTA (pergunta): ciano; o espectro sobe a cada trecho reconhecido; mostra a transcrição.
   - PROCESSANDO: anéis aceleram e a varredura gira rápido enquanto a resposta é montada.
   - RESPOSTA: azul-elétrico com núcleo branco; o espectro acompanha a fala; mostra a frase dita.
   Tocar no núcleo: escuta → envia agora; resposta → interrompe e volta a ouvir. ENCERRAR (ou Esc) desliga.
   ⚙ VOZ: chave e Voice ID do ElevenLabs guardados só neste aparelho (voz masculina carioca). SOS sempre no canto. */
(function () {
  if (window.AvantiVoz) return;
  var d = document, raiz = null, el = {}, estado = 'livre', some = 0, raf = 0, energia = 0, t0 = 0, barras = [];
  var reduz = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var N = 72, R0 = 84; // barras do espectro e raio onde começam
  var COR = {
    ouvindo: { g: '53,224,255', rot: 'ESCUTA ATIVA', modo: 'MODO · ESCUTA', dica: 'TOQUE NO NÚCLEO PARA ENVIAR' },
    pensando: { g: '150,140,255', rot: 'PROCESSANDO', modo: 'MODO · ANÁLISE', dica: '' },
    falando: { g: '64,156,255', rot: 'AVANTI VESSEL AI', modo: 'MODO · RESPOSTA', dica: 'TOQUE NO NÚCLEO PARA INTERROMPER' }
  };
  var MONO = 'ui-monospace,"SF Mono",Menlo,Consolas,monospace';

  var CSS = [
    '.avz{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:max(20px,env(safe-area-inset-top)) 18px max(22px,env(safe-area-inset-bottom));box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#e9f6ff;opacity:0;pointer-events:none;transition:opacity .25s ease;-webkit-tap-highlight-color:transparent;--avz-g:53,224,255}',
    '.avz.on{opacity:1;pointer-events:auto}',
    // fundo: quase preto, grade técnica e brilho da cor do estado
    '.avz-fundo{position:absolute;inset:0;background:radial-gradient(ellipse 60% 45% at 50% 44%,rgba(var(--avz-g),0.16) 0%,rgba(var(--avz-g),0) 70%),linear-gradient(rgba(var(--avz-g),0.05) 1px,transparent 1px) 0 0/100% 32px,linear-gradient(90deg,rgba(var(--avz-g),0.05) 1px,transparent 1px) 0 0/32px 100%,rgba(3,6,10,0.94);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}',
    '.avz-scan{position:absolute;left:0;right:0;height:120px;top:-120px;background:linear-gradient(180deg,rgba(var(--avz-g),0) 0%,rgba(var(--avz-g),0.07) 85%,rgba(var(--avz-g),0.22) 100%);animation:avzScan 5s linear infinite;pointer-events:none}',
    '@keyframes avzScan{to{transform:translateY(calc(100vh + 120px))}}',
    // leituras nos cantos (dados reais do barco + nível do sinal de voz)
    '.avz-hud{position:absolute;font:600 10px/1.55 ' + MONO + ';letter-spacing:0.12em;color:rgba(var(--avz-g),0.8);pointer-events:none;white-space:nowrap}',
    '.avz-hud b{color:#fff;font-weight:700}',
    '.avz-tl{top:max(66px,calc(env(safe-area-inset-top) + 58px));left:18px}.avz-tr{top:max(66px,calc(env(safe-area-inset-top) + 58px));right:18px;text-align:right}',
    '.avz-palco{position:relative;width:min(78vmin,360px);height:min(78vmin,360px);flex-shrink:0}',
    '.avz-palco svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.avz-canto{position:absolute;width:22px;height:22px;border:solid rgba(var(--avz-g),0.7);pointer-events:none}',
    '.avz-c1{top:-6px;left:-6px;border-width:2px 0 0 2px}.avz-c2{top:-6px;right:-6px;border-width:2px 2px 0 0}.avz-c3{bottom:-6px;left:-6px;border-width:0 0 2px 2px}.avz-c4{bottom:-6px;right:-6px;border-width:0 2px 2px 0}',
    '.avz-gira{transform-box:view-box;transform-origin:150px 150px}',
    '.avz-r1{animation:avzRoda 60s linear infinite}.avz-r2{animation:avzRoda 14s linear infinite reverse}.avz-r3{animation:avzRoda 9s linear infinite}.avz-radar{animation:avzRoda 3.2s linear infinite}',
    '.avz.pensando .avz-r2{animation-duration:2.4s}.avz.pensando .avz-r3{animation-duration:1.4s}.avz.pensando .avz-radar{animation-duration:0.9s}',
    '@keyframes avzRoda{to{transform:rotate(360deg)}}',
    '.avz-nucleo{transform-box:view-box;transform-origin:150px 150px;transform:scale(calc(0.94 + var(--avz-e,0) * 0.14))}',
    '.avz-btn{position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;border:0;padding:0;background:transparent;border-radius:50%;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent}',
    '.avz-btn:focus-visible{box-shadow:0 0 0 2px rgba(var(--avz-g),0.9)}',
    '.avz-rot{position:relative;font:800 12px/1 ' + MONO + ';letter-spacing:0.3em;color:rgb(var(--avz-g));text-shadow:0 0 14px rgba(var(--avz-g),0.8);min-height:14px;display:flex;align-items:center;gap:10px}',
    '.avz-rot:before,.avz-rot:after{content:"";width:34px;height:1px;background:linear-gradient(90deg,rgba(var(--avz-g),0),rgba(var(--avz-g),0.9))}.avz-rot:after{transform:scaleX(-1)}',
    '.avz-txt{position:relative;max-width:min(580px,92vw);min-height:3em;font-size:clamp(15px,2.1vw,19px);line-height:1.5;text-align:center;color:#f2f8ff;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}',
    '.avz-txt.vazio{color:rgba(var(--avz-g),0.6);font-family:' + MONO + ';font-size:13px;letter-spacing:0.08em}',
    '.avz-dica{position:relative;font:700 10px/1 ' + MONO + ';letter-spacing:0.2em;color:rgba(233,246,255,0.5);min-height:12px}',
    '.avz-acoes{position:relative;display:flex;gap:10px}',
    '.avz-fim,.avz-cfg{height:48px;padding:0 22px;border-radius:12px;border:1px solid rgba(var(--avz-g),0.45);background:rgba(var(--avz-g),0.08);color:#e9f6ff;font:800 12px/1 ' + MONO + ';letter-spacing:0.2em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}',
    '.avz-fim:hover,.avz-fim:focus-visible,.avz-cfg:hover,.avz-cfg:focus-visible{border-color:rgb(var(--avz-g));box-shadow:0 0 18px rgba(var(--avz-g),0.35);outline:none}',
    '.avz-cfg{padding:0 16px}',
    '.avz-sos{position:absolute;top:max(14px,env(safe-area-inset-top));left:16px;height:40px;padding:0 16px;border-radius:12px;background:#d32f27;color:#fff;font:800 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;letter-spacing:0.1em;display:flex;align-items:center;text-decoration:none;box-shadow:0 0 0 3px rgba(255,59,48,0.25)}',
    // painel de configuração da voz
    '.avzp{position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(3,6,10,0.86);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
    '.avzp.on{display:flex}',
    '.avzp-box{width:min(440px,100%);box-sizing:border-box;padding:22px;border-radius:16px;background:#0b1118;border:1px solid rgba(53,224,255,0.4);box-shadow:0 0 40px rgba(53,224,255,0.15);color:#e9f6ff;display:flex;flex-direction:column;gap:12px}',
    '.avzp h2{margin:0;font:800 13px/1.2 ' + MONO + ';letter-spacing:0.22em;color:#35e0ff}',
    '.avzp p{margin:0;font-size:13px;line-height:1.5;color:#9fb3c4}',
    '.avzp label{display:flex;flex-direction:column;gap:6px;font:700 10px/1 ' + MONO + ';letter-spacing:0.16em;color:#9fb3c4}',
    '.avzp input{height:44px;box-sizing:border-box;padding:0 12px;border-radius:10px;border:1px solid #243140;background:#05090e;color:#fff;font:15px ' + MONO + ';outline:none}',
    '.avzp input:focus{border-color:#35e0ff}',
    '.avzp-b{display:flex;gap:8px;flex-wrap:wrap}',
    '.avzp-b button{flex:1 1 auto;height:44px;padding:0 14px;border-radius:10px;border:1px solid #243140;background:#0f1822;color:#e9f6ff;font:800 11px/1 ' + MONO + ';letter-spacing:0.14em;cursor:pointer}',
    '.avzp-b button.pri{background:#35e0ff;border-color:#35e0ff;color:#03131a}',
    '.avzp-st{min-height:16px;font:700 11px/1.4 ' + MONO + ';letter-spacing:0.06em;color:#35e0ff}',
    '@media (prefers-reduced-motion: reduce){.avz-scan{display:none}.avz-r1,.avz-r2,.avz-r3{animation:none}.avz-radar{animation-duration:8s}}'
  ].join('\n');

  // Marca "AI" da Avanti (mesmo desenho do logotipo) no centro do núcleo.
  var AI = 'M0 100 L46 0 L69 0 L115 100 L89 100 L58 27 L36 76 L58 76 L58 100 Z M129 0 L156 0 L156 100 L129 100 Z';
  function arco(r, a0, a1) {
    var p = function (a) { var t = (a - 90) * Math.PI / 180; return (150 + r * Math.cos(t)).toFixed(2) + ' ' + (150 + r * Math.sin(t)).toFixed(2); };
    return 'M' + p(a0) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p(a1);
  }
  function svg() {
    var s = '<svg viewBox="0 0 300 300" aria-hidden="true"><defs>' +
      '<radialGradient id="avzNuc"><stop offset="0" stop-color="#fff" stop-opacity="0.95"/><stop offset="0.35" style="stop-color:rgb(var(--avz-g))" stop-opacity="0.75"/><stop offset="1" style="stop-color:rgb(var(--avz-g))" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="avzVar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:rgb(var(--avz-g))" stop-opacity="0"/><stop offset="1" style="stop-color:rgb(var(--avz-g))" stop-opacity="0.55"/></linearGradient></defs>';
    // anel externo graduado (72 marcas, maiores a cada 30°) — gira devagar
    s += '<g class="avz-gira avz-r1" style="stroke:rgba(var(--avz-g),0.55)">';
    for (var i = 0; i < 120; i++) { var a = i * 3, m = i % 10 === 0, t = (a - 90) * Math.PI / 180, r1 = 146, r2 = m ? 136 : 141;
      s += '<line x1="' + (150 + r1 * Math.cos(t)).toFixed(2) + '" y1="' + (150 + r1 * Math.sin(t)).toFixed(2) + '" x2="' + (150 + r2 * Math.cos(t)).toFixed(2) + '" y2="' + (150 + r2 * Math.sin(t)).toFixed(2) + '" stroke-width="' + (m ? 1.6 : 0.8) + '"/>'; }
    s += '</g><circle cx="150" cy="150" r="148.5" fill="none" style="stroke:rgba(var(--avz-g),0.25)" stroke-width="0.8"/>';
    // anel de segmentos (gira ao contrário)
    s += '<g class="avz-gira avz-r2" fill="none" stroke-linecap="round" style="stroke:rgb(var(--avz-g))">' +
      '<path d="' + arco(126, 10, 70) + '" stroke-width="3"/><path d="' + arco(126, 130, 150) + '" stroke-width="3" opacity="0.6"/>' +
      '<path d="' + arco(126, 190, 280) + '" stroke-width="3"/><path d="' + arco(126, 300, 330) + '" stroke-width="3" opacity="0.6"/>' +
      '<path d="' + arco(119, 40, 160) + '" stroke-width="1" opacity="0.5"/><path d="' + arco(119, 220, 340) + '" stroke-width="1" opacity="0.5"/></g>';
    // varredura de radar
    s += '<g class="avz-gira avz-radar"><path d="M150 150 L150 34 A116 116 0 0 1 232 68 Z" fill="url(#avzVar)" opacity="0.55"/><line x1="150" y1="150" x2="232" y2="68" style="stroke:rgb(var(--avz-g))" stroke-width="1.2" opacity="0.9"/></g>';
    // espectro radial (barras montadas no JS)
    s += '<g class="avz-esp" stroke-linecap="round" style="stroke:rgb(var(--avz-g))"></g>';
    // anel interno tracejado
    s += '<g class="avz-gira avz-r3"><circle cx="150" cy="150" r="76" fill="none" style="stroke:rgba(var(--avz-g),0.7)" stroke-width="1.2" stroke-dasharray="2 5"/></g>';
    // núcleo + marca AI
    s += '<g class="avz-nucleo"><circle cx="150" cy="150" r="70" fill="url(#avzNuc)" opacity="0.55"/>' +
      '<circle cx="150" cy="150" r="54" fill="rgba(3,8,14,0.85)" style="stroke:rgb(var(--avz-g))" stroke-width="1.6"/>' +
      '<circle cx="150" cy="150" r="47" fill="none" style="stroke:rgba(var(--avz-g),0.35)" stroke-width="0.8"/>' +
      '<path d="' + AI + '" transform="translate(119.2 130) scale(0.395)" fill="#fff" style="filter:drop-shadow(0 0 6px rgb(var(--avz-g)))"/></g>';
    return s + '</svg>';
  }

  function monta() {
    if (raiz) return;
    var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
    raiz = d.createElement('div'); raiz.className = 'avz'; raiz.setAttribute('role', 'dialog'); raiz.setAttribute('aria-label', 'Conversa por voz'); raiz.setAttribute('aria-hidden', 'true');
    raiz.innerHTML = '<div class="avz-fundo"></div><div class="avz-scan"></div>' +
      '<a class="avz-sos" aria-label="SOS — emergência">SOS</a>' +
      '<div class="avz-hud avz-tl">AVANTI · NÚCLEO IA<br><span class="avz-modo"></span><br>SINAL <b class="avz-sinal">000</b></div>' +
      '<div class="avz-hud avz-tr"><b class="avz-hora">--:--</b><br>22°57,09\'S<br>043°10,23\'W</div>' +
      '<div class="avz-palco"><span class="avz-canto avz-c1"></span><span class="avz-canto avz-c2"></span><span class="avz-canto avz-c3"></span><span class="avz-canto avz-c4"></span>' + svg() +
      '<button type="button" class="avz-btn"></button></div>' +
      '<div class="avz-rot" aria-live="polite"></div><div class="avz-txt"></div><div class="avz-dica"></div>' +
      '<div class="avz-acoes"><button type="button" class="avz-fim"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>ENCERRAR</button>' +
      '<button type="button" class="avz-cfg" aria-label="Configurar a voz">⚙ VOZ</button></div>';
    d.body.appendChild(raiz);
    el = { btn: raiz.querySelector('.avz-btn'), rot: raiz.querySelector('.avz-rot'), txt: raiz.querySelector('.avz-txt'), dica: raiz.querySelector('.avz-dica'), fim: raiz.querySelector('.avz-fim'), cfg: raiz.querySelector('.avz-cfg'), sos: raiz.querySelector('.avz-sos'), modo: raiz.querySelector('.avz-modo'), sinal: raiz.querySelector('.avz-sinal'), hora: raiz.querySelector('.avz-hora') };
    // espectro: N barras saindo do anel interno
    var g = raiz.querySelector('.avz-esp'), NS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < N; i++) {
      var t = (i * 360 / N - 90) * Math.PI / 180, ln = d.createElementNS(NS, 'line'), c = Math.cos(t), sn = Math.sin(t);
      ln.setAttribute('x1', (150 + R0 * c).toFixed(2)); ln.setAttribute('y1', (150 + R0 * sn).toFixed(2));
      ln.setAttribute('stroke-width', '2.2'); g.appendChild(ln); barras.push({ el: ln, c: c, s: sn });
    }
    el.btn.addEventListener('click', function () {
      var B = window.AvantiBrain; if (!B) return;
      if (estado === 'ouvindo' && B.vozEnviar) B.vozEnviar();
      else if (estado === 'falando' && B.pularFala) B.pularFala();
    });
    el.fim.addEventListener('click', encerrar);
    el.cfg.addEventListener('click', function () { encerrar(); config(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && raiz.classList.contains('on')) encerrar(); });
  }
  function encerrar() { var B = window.AvantiBrain; if (B && B.vozEncerrar) B.vozEncerrar(); esconde(); }

  function pinta(e) {
    var c = COR[e]; if (!c) return;
    raiz.style.setProperty('--avz-g', c.g);
    raiz.classList.toggle('pensando', e === 'pensando');
    el.rot.textContent = c.rot; el.dica.textContent = c.dica; el.modo.textContent = c.modo;
    el.btn.setAttribute('aria-label', e === 'ouvindo' ? 'Terminei de falar — enviar agora' : e === 'falando' ? 'Interromper a resposta e falar' : 'Processando');
  }
  function texto(t, vazio) { el.txt.textContent = t || vazio || ''; el.txt.classList.toggle('vazio', !t); }
  function mostra() {
    clearTimeout(some); some = 0;
    if (raiz.classList.contains('on')) return;
    var sos = d.querySelector('#dc-root a[href*="SOS-"]') || d.querySelector('a[href*="SOS-"]:not(.avz-sos)');
    el.sos.href = sos ? sos.getAttribute('href') : (innerWidth < 600 ? 'S2-SOS-Mobile.dc.html' : 'S1-SOS-Web.dc.html');
    el.hora.textContent = window.AvantiClima ? window.AvantiClima.hora() : new Date().toTimeString().slice(0, 5);
    raiz.classList.add('on'); raiz.setAttribute('aria-hidden', 'false');
    t0 = performance.now();
    if (!raf) raf = requestAnimationFrame(quadro);
  }
  function esconde() {
    clearTimeout(some); some = 0; estado = 'livre';
    if (!raiz) return;
    raiz.classList.remove('on'); raiz.setAttribute('aria-hidden', 'true');
    if (raiz.contains(d.activeElement)) try { d.activeElement.blur(); } catch (e) {}
  }
  // Energia 0–1: cai sozinha; sobe com cada trecho ouvido/palavra falada. Na resposta, uma oscilação imita o ritmo da fala.
  function quadro(ts) {
    raf = 0;
    if (!raiz.classList.contains('on')) { energia = 0; return; }
    var t = (ts - t0) / 1000, base = 0.08 + 0.04 * Math.sin(t * 2.1);
    if (estado === 'falando') base = 0.3 + 0.45 * Math.abs(Math.sin(t * 8.3)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 2.9 + 1.3)));
    else if (estado === 'pensando') base = 0.2 + 0.08 * Math.sin(t * 6);
    if (reduz) base = Math.min(base, 0.25);
    energia = Math.max(base, energia * 0.9);
    raiz.style.setProperty('--avz-e', energia.toFixed(3));
    for (var i = 0; i < N; i++) {
      var k = Math.min(i, N - i), // espelhado: simétrico dos dois lados
        ruido = 0.5 + 0.5 * Math.sin(t * 7.1 + k * 0.55) * Math.sin(t * 3.3 + k * 1.37),
        len = 3 + energia * 44 * (0.3 + 0.7 * ruido), b = barras[i];
      if (estado === 'pensando') len = 3 + 16 * Math.max(0, Math.sin(t * 9 - i * 0.35));
      b.el.setAttribute('x2', (150 + (R0 + len) * b.c).toFixed(1)); b.el.setAttribute('y2', (150 + (R0 + len) * b.s).toFixed(1));
      b.el.setAttribute('stroke-opacity', (0.35 + Math.min(0.65, len / 40)).toFixed(2));
    }
    var sn = String(Math.round(energia * 100)); el.sinal.textContent = ('00' + sn).slice(-3);
    raf = requestAnimationFrame(quadro);
  }
  function pulso(forca) { energia = Math.min(1, energia + (forca || 0.5)); }

  // ——— ⚙ VOZ: ElevenLabs direto deste aparelho (chave fica só aqui, no navegador) ———
  var painel = null;
  function config() {
    var B = window.AvantiBrain;
    if (!painel) {
      painel = d.createElement('div'); painel.className = 'avzp'; painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-label', 'Configurar a voz');
      if (!raiz) monta();
      painel.innerHTML = '<div class="avzp-box"><h2>VOZ DO NÚCLEO · ELEVENLABS</h2>' +
        '<p>Voz masculina carioca: no ElevenLabs, abra a <b>Voice Library</b>, busque “carioca”, adicione a voz em <b>My Voices</b> e copie o <b>Voice ID</b>. A chave fica guardada só neste aparelho. Sem chave, o app usa a melhor voz masculina do aparelho.</p>' +
        '<label>CHAVE DA API (xi-api-key)<input class="avzp-k" type="password" autocomplete="off" spellcheck="false" placeholder="sk_…"></label>' +
        '<label>VOICE ID<input class="avzp-v" autocomplete="off" spellcheck="false" placeholder="ex.: 21m00Tcm4TlvDq8ikWAM"></label>' +
        '<div class="avzp-st" aria-live="polite"></div>' +
        '<div class="avzp-b"><button type="button" class="pri avzp-s">SALVAR E TESTAR</button><button type="button" class="avzp-x">REMOVER</button><button type="button" class="avzp-f">FECHAR</button></div></div>';
      d.body.appendChild(painel);
      var st = painel.querySelector('.avzp-st'), k = painel.querySelector('.avzp-k'), v = painel.querySelector('.avzp-v');
      painel.querySelector('.avzp-f').addEventListener('click', function () { painel.classList.remove('on'); });
      painel.addEventListener('click', function (e) { if (e.target === painel) painel.classList.remove('on'); });
      painel.querySelector('.avzp-x').addEventListener('click', function () { if (B && B.vozEleven) B.vozEleven(null); k.value = ''; v.value = ''; st.textContent = 'Removida. Usando a voz do aparelho.'; });
      painel.querySelector('.avzp-s').addEventListener('click', function () {
        if (!k.value.trim() || !/^[A-Za-z0-9]{10,40}$/.test(v.value.trim())) { st.textContent = 'Preencha a chave e um Voice ID válido.'; return; }
        B.vozEleven({ chave: k.value.trim(), voz: v.value.trim() });
        st.textContent = 'Testando…';
        B.speak('Fala, Otto! Aqui é o Avanti. Tô na escuta, pode mandar.', function () {});
        setTimeout(function () { st.textContent = B.vozStatus ? B.vozStatus() : 'Salvo.'; }, 4500);
      });
    }
    var c = B && B.vozEleven ? B.vozEleven() : null;
    painel.querySelector('.avzp-k').value = c ? c.chave : ''; painel.querySelector('.avzp-v').value = c ? c.voz : '';
    painel.querySelector('.avzp-st').textContent = c ? 'Voz do ElevenLabs ativa neste aparelho.' : '';
    painel.classList.add('on');
  }

  window.addEventListener('avanti-voz', function (ev) {
    var x = (ev && ev.detail) || {}, e = x.estado;
    if (!d.body) return;
    monta();
    if (e === 'pulso') { pulso(0.35); return; }
    if (e === 'livre') { // some com atraso: na conversa o microfone religa logo depois e o overlay não pisca
      if (!some && raiz.classList.contains('on')) some = setTimeout(esconde, 900);
      return;
    }
    if (!COR[e]) return;
    var novo = e !== estado; estado = e;
    if (novo) pinta(e);
    if (e === 'ouvindo') { texto(x.texto, 'AGUARDANDO COMANDO DE VOZ…'); if (x.texto) pulso(0.55); }
    else if (e === 'pensando') { texto(x.texto || '', 'CRUZANDO TELEMETRIA · AGENDA · DOCUMENTOS…'); mostra(); some = setTimeout(esconde, 2500); return; } // sem resposta falada (voz→texto): some sozinho
    else if (e === 'falando') { texto(x.texto, ''); pulso(0.4); }
    mostra();
  });
  window.addEventListener('pagehide', esconde);

  window.AvantiVoz = { esconde: esconde, config: config };
})();
