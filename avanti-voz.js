/* Avanti Vessel AI — animação da conversa por voz: o "glow diamond".
   Escuta os eventos 'avanti-voz' que o avanti-brain.js emite e mostra um diamante que brilha por cima da tela:
   - OUVINDO (pergunta): azul, pulsa a cada trecho reconhecido e solta anéis; mostra o que está sendo transcrito.
   - PENSANDO: gira no próprio eixo enquanto a resposta é montada.
   - FALANDO (resposta): branco-platina, brilho que acompanha a fala; mostra a frase que está sendo dita.
   Tocar no diamante: ouvindo → envia agora; falando → interrompe e volta a ouvir. ENCERRAR (ou Esc) desliga a conversa.
   O SOS da tela continua a um toque: o botão SOS fica no canto do overlay. */
(function () {
  if (window.AvantiVoz) return;
  var d = document, raiz = null, el = {}, estado = 'livre', some = 0, raf = 0, energia = 0, ultAnel = 0, t0 = 0;
  var reduz = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var COR = {
    ouvindo: { a: '#6cc8ff', b: '#2f7df0', c: '#082a6b', g: '64,156,255', rot: 'OUVINDO', dica: 'TOQUE NO DIAMANTE PARA ENVIAR' },
    pensando: { a: '#b7a8ff', b: '#6a6ff5', c: '#1f1760', g: '124,131,255', rot: 'PENSANDO', dica: '' },
    falando: { a: '#ffffff', b: '#d6e9ff', c: '#5d7899', g: '214,233,255', rot: 'AVANTI VESSEL AI', dica: 'TOQUE NO DIAMANTE PARA INTERROMPER' }
  };

  var CSS = [
    '.avz{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:max(20px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom));box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--av-ink,#e9edf2);opacity:0;pointer-events:none;transition:opacity .28s ease;-webkit-tap-highlight-color:transparent}',
    '.avz.on{opacity:1;pointer-events:auto}',
    '.avz-fundo{position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% 42%,rgba(var(--avz-g),0.16) 0%,rgba(var(--avz-g),0) 70%),rgba(var(--av-bg-rgb,5,7,11),0.84);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);transition:background .5s}',
    '.avz-palco{position:relative;width:min(62vmin,300px);height:min(62vmin,300px);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.avz-halo{position:absolute;inset:-18%;border-radius:50%;background:radial-gradient(circle,rgba(var(--avz-g),0.75) 0%,rgba(var(--avz-g),0.28) 32%,rgba(var(--avz-g),0) 66%);opacity:calc(0.30 + var(--avz-e,0) * 0.70);transform:scale(calc(0.82 + var(--avz-e,0) * 0.34));will-change:transform,opacity}',
    '.avz-anel{position:absolute;left:50%;top:50%;width:62%;height:62%;margin:-31% 0 0 -31%;border-radius:50%;border:2px solid rgba(var(--avz-g),0.75);box-shadow:0 0 18px rgba(var(--avz-g),0.6);animation:avzAnel 1.5s cubic-bezier(.2,.7,.3,1) forwards;pointer-events:none}',
    '@keyframes avzAnel{0%{transform:scale(0.7);opacity:0.9}100%{transform:scale(1.9);opacity:0}}',
    '.avz-btn{position:relative;width:64%;height:64%;border:0;padding:0;margin:0;background:transparent;cursor:pointer;border-radius:30%;outline:none;-webkit-tap-highlight-color:transparent}',
    '.avz-btn:focus-visible{box-shadow:0 0 0 3px rgba(var(--avz-g),0.9)}',
    '.avz-flutua{position:absolute;inset:0;animation:avzFlutua 4.2s ease-in-out infinite}',
    '@keyframes avzFlutua{0%,100%{transform:translateY(-3%)}50%{transform:translateY(3%)}}',
    '.avz-gema{position:absolute;inset:0;transform:scale(calc(1 + var(--avz-e,0) * 0.07));transition:transform .08s linear;filter:drop-shadow(0 0 10px rgba(var(--avz-g),0.85)) drop-shadow(0 0 28px rgba(var(--avz-g),0.55))}',
    '.avz-gira{position:absolute;inset:0;transform-style:preserve-3d}',
    '.avz.pensando .avz-gira{animation:avzGira 1.6s cubic-bezier(.45,.05,.55,.95) infinite}',
    '@keyframes avzGira{0%{transform:perspective(600px) rotateY(0deg)}100%{transform:perspective(600px) rotateY(360deg)}}',
    '.avz-gema svg{width:100%;height:100%;display:block;overflow:visible}',
    '.avz-luz{opacity:0;animation:avzLuz 2.6s ease-in-out infinite;mix-blend-mode:screen}',
    '@keyframes avzLuz{0%,32%,100%{opacity:0}42%{opacity:0.7}56%{opacity:0}}',
    '.avz-brilho{animation:avzVarre 3.2s cubic-bezier(.5,0,.3,1) infinite}',
    '@keyframes avzVarre{0%{transform:translateX(-160px) skewX(-18deg)}55%,100%{transform:translateX(260px) skewX(-18deg)}}',
    '.avz-estrela{position:absolute;width:9%;height:9%;animation:avzEstrela 2.2s ease-in-out infinite;pointer-events:none}',
    '@keyframes avzEstrela{0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(90deg);opacity:1}}',
    '.avz-rot{position:relative;font-size:11px;font-weight:800;letter-spacing:0.22em;color:rgb(var(--avz-g));text-shadow:0 0 12px rgba(var(--avz-g),0.6);min-height:14px}',
    '.avz-txt{position:relative;max-width:min(560px,92vw);min-height:3.2em;font-size:clamp(15px,2.2vw,19px);line-height:1.5;text-align:center;color:var(--av-ink,#e9edf2);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}',
    '.avz-txt.vazio{color:var(--av-ink4,#7d8796);font-style:italic}',
    '.avz-dica{position:relative;font-size:10px;font-weight:700;letter-spacing:0.16em;color:var(--av-ink4,#7d8796);min-height:12px}',
    '.avz-fim{position:relative;height:48px;min-width:176px;padding:0 24px;border-radius:14px;border:1px solid rgba(var(--av-hl-rgb,255,255,255),0.18);background:rgba(var(--av-card-rgb,15,19,26),0.9);color:var(--av-ink,#e9edf2);font-family:inherit;font-size:12px;font-weight:800;line-height:1;letter-spacing:0.18em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}',
    '.avz-fim:hover,.avz-fim:focus-visible{border-color:rgba(var(--avz-g),0.8);outline:none}',
    '.avz-sos{position:absolute;top:max(14px,env(safe-area-inset-top));left:16px;height:40px;padding:0 14px;border-radius:12px;background:var(--av-crit-fill,#d32f27);color:#fff;font-family:inherit;font-size:13px;font-weight:800;line-height:1;letter-spacing:0.1em;display:flex;align-items:center;text-decoration:none;box-shadow:0 0 0 3px rgba(255,59,48,0.25)}',
    '@media (prefers-reduced-motion: reduce){.avz-flutua,.avz-luz,.avz-brilho,.avz-estrela{animation:none}.avz.pensando .avz-gira{animation-duration:4s}.avz-anel{display:none}}'
  ].join('\n');

  // Gema vista de lado: mesa, coroa (5 facetas) e pavilhão (4 facetas) até a culaça.
  var FACETAS = [
    ['60,40 20,80 60,80', 'a', 0.95], ['60,40 60,80 100,80', 'b', 0.75], ['60,40 140,40 100,80', 'a', 1],
    ['140,40 100,80 140,80', 'b', 0.8], ['140,40 180,80 140,80', 'a', 0.9],
    ['20,80 60,80 100,182', 'b', 0.95], ['60,80 100,80 100,182', 'c', 0.9], ['100,80 140,80 100,182', 'b', 0.7], ['140,80 180,80 100,182', 'c', 0.95]
  ];
  var CONTORNO = '60,40 140,40 180,80 100,182 20,80';
  function svg() {
    var s = '<svg viewBox="0 0 200 200" aria-hidden="true"><defs>' +
      '<linearGradient id="avzGa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" style="stop-color:var(--avz-a)"/></linearGradient>' +
      '<linearGradient id="avzGb" x1="1" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--avz-a)"/><stop offset="1" style="stop-color:var(--avz-b)"/></linearGradient>' +
      '<linearGradient id="avzGc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--avz-b)"/><stop offset="1" style="stop-color:var(--avz-c)"/></linearGradient>' +
      '<linearGradient id="avzGv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="avzCorte"><polygon points="' + CONTORNO + '"/></clipPath></defs>';
    FACETAS.forEach(function (f) { s += '<polygon points="' + f[0] + '" fill="url(#avzG' + f[1] + ')" fill-opacity="' + f[2] + '"/>'; });
    // lampejos: facetas que acendem uma de cada vez
    FACETAS.forEach(function (f, i) { s += '<polygon class="avz-luz" points="' + f[0] + '" fill="#fff" style="animation-delay:-' + ((i * 0.83) % 2.6).toFixed(2) + 's"/>'; });
    s += '<g clip-path="url(#avzCorte)"><rect class="avz-brilho" x="0" y="20" width="60" height="180" fill="url(#avzGv)"/></g>';
    s += '<g fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.4" stroke-linejoin="round"><polygon points="' + CONTORNO + '"/>' +
      '<path d="M20 80H180 M60 40L60 80 M140 40L140 80 M60 40L100 80L140 40 M20 80L60 40 M180 80L140 40 M60 80L100 182L140 80 M100 80L100 182"/></g>';
    return s + '</svg>';
  }
  var ESTRELA = '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><path d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0z" fill="#fff"/></svg>';

  function monta() {
    if (raiz) return;
    var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
    raiz = d.createElement('div'); raiz.className = 'avz'; raiz.setAttribute('role', 'dialog'); raiz.setAttribute('aria-label', 'Conversa por voz'); raiz.setAttribute('aria-hidden', 'true');
    raiz.innerHTML = '<div class="avz-fundo"></div>' +
      '<a class="avz-sos" aria-label="SOS — emergência">SOS</a>' +
      '<div class="avz-palco"><div class="avz-halo"></div><span class="avz-aneis"></span>' +
      '<button type="button" class="avz-btn"><span class="avz-flutua"><span class="avz-gira"><span class="avz-gema">' + svg() + '</span></span></span></button>' +
      '<span class="avz-estrela" style="left:12%;top:18%;animation-delay:.2s">' + ESTRELA + '</span>' +
      '<span class="avz-estrela" style="right:10%;top:30%;animation-delay:1.1s">' + ESTRELA + '</span>' +
      '<span class="avz-estrela" style="left:20%;bottom:14%;animation-delay:1.7s">' + ESTRELA + '</span></div>' +
      '<div class="avz-rot" aria-live="polite"></div><div class="avz-txt"></div><div class="avz-dica"></div>' +
      '<button type="button" class="avz-fim"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>ENCERRAR</button>';
    d.body.appendChild(raiz);
    el = { btn: raiz.querySelector('.avz-btn'), rot: raiz.querySelector('.avz-rot'), txt: raiz.querySelector('.avz-txt'), dica: raiz.querySelector('.avz-dica'), aneis: raiz.querySelector('.avz-aneis'), fim: raiz.querySelector('.avz-fim'), sos: raiz.querySelector('.avz-sos') };
    el.btn.addEventListener('click', function () {
      var B = window.AvantiBrain; if (!B) return;
      if (estado === 'ouvindo' && B.vozEnviar) B.vozEnviar();
      else if (estado === 'falando' && B.pularFala) B.pularFala();
    });
    el.fim.addEventListener('click', encerrar);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && raiz.classList.contains('on')) encerrar(); });
  }
  function encerrar() { var B = window.AvantiBrain; if (B && B.vozEncerrar) B.vozEncerrar(); esconde(); }

  function pinta(e) {
    var c = COR[e]; if (!c) return;
    raiz.style.setProperty('--avz-a', c.a); raiz.style.setProperty('--avz-b', c.b); raiz.style.setProperty('--avz-c', c.c); raiz.style.setProperty('--avz-g', c.g);
    raiz.classList.toggle('pensando', e === 'pensando');
    el.rot.textContent = c.rot; el.dica.textContent = c.dica;
    el.btn.setAttribute('aria-label', e === 'ouvindo' ? 'Terminei de falar — enviar agora' : e === 'falando' ? 'Interromper a resposta e falar' : 'Pensando');
  }
  function texto(t, vazio) {
    el.txt.textContent = t || vazio || '';
    el.txt.classList.toggle('vazio', !t);
  }
  function mostra() {
    clearTimeout(some); some = 0;
    if (raiz.classList.contains('on')) return;
    var sos = d.querySelector('#dc-root a[href*="SOS-"]') || d.querySelector('a[href*="SOS-"]:not(.avz-sos)');
    el.sos.href = sos ? sos.getAttribute('href') : (innerWidth < 600 ? 'S2-SOS-Mobile.dc.html' : 'S1-SOS-Web.dc.html');
    raiz.classList.add('on'); raiz.setAttribute('aria-hidden', 'false');
    t0 = performance.now();
    if (!raf) raf = requestAnimationFrame(quadro);
  }
  function esconde() {
    clearTimeout(some); some = 0; estado = 'livre';
    if (!raiz) return;
    raiz.classList.remove('on'); raiz.setAttribute('aria-hidden', 'true');
    // Esconder já não devolve o foco: se ele estava no overlay, volta para o corpo da página.
    if (raiz.contains(d.activeElement)) try { d.activeElement.blur(); } catch (e) {}
  }
  function anel() {
    if (reduz) return;
    var agora = performance.now(); if (agora - ultAnel < 220) return; ultAnel = agora;
    var a = d.createElement('span'); a.className = 'avz-anel';
    a.addEventListener('animationend', function () { a.remove(); });
    el.aneis.appendChild(a);
    while (el.aneis.children.length > 4) el.aneis.firstChild.remove();
  }
  // Energia 0–1: cai sozinha; sobe com cada trecho ouvido/palavra falada. Falando, uma oscilação imita o ritmo da fala.
  function quadro(ts) {
    raf = 0;
    if (!raiz.classList.contains('on')) { energia = 0; raiz.style.setProperty('--avz-e', '0'); return; }
    var t = (ts - t0) / 1000, base = 0.12 + 0.06 * Math.sin(t * 2.1);
    if (estado === 'falando') base = 0.32 + 0.42 * Math.abs(Math.sin(t * 8.3)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 2.9 + 1.3)));
    else if (estado === 'pensando') base = 0.25 + 0.1 * Math.sin(t * 5);
    if (reduz) base = Math.min(base, 0.3);
    energia = Math.max(base, energia * 0.9);
    raiz.style.setProperty('--avz-e', energia.toFixed(3));
    raf = requestAnimationFrame(quadro);
  }
  function pulso(forca) { energia = Math.min(1, energia + (forca || 0.5)); if (estado === 'ouvindo') anel(); }

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
    if (e === 'ouvindo') { texto(x.texto, 'Pode falar…'); if (x.texto) pulso(0.55); }
    else if (e === 'pensando') { texto(x.texto || '', 'Consultando telemetria · agenda · documentos…'); mostra(); some = setTimeout(esconde, 2500); return; } // sem resposta falada (voz→texto): some sozinho
    else if (e === 'falando') { texto(x.texto, ''); pulso(0.4); }
    mostra();
  });
  // Trocou de tela ou a aba sumiu: nada de overlay preso.
  window.addEventListener('pagehide', esconde);

  window.AvantiVoz = { esconde: esconde };
})();
