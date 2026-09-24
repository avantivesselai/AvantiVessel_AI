/* Avanti Vessel AI — publicação (GitHub Pages · app instalável).
   1) Garante as metas de app em toda prancheta (viewport, manifest, ícones, iOS).
   2) No site publicado (janela de topo): ajusta a prancheta à janela —
      celular = ocupa a largura da tela (rola se precisar); computador/tablet = cabe inteira, centralizada.
   3) Registra o service worker só em *.github.io (abre offline depois da 1ª visita).
   Dentro do editor (iframe) só faz o passo 1. */
(function () {
  if (window.__avantiApp) return; window.__avantiApp = true;
  var d = document, head = d.head || d.documentElement;
  var ua = navigator.userAgent || '';
  var iOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function meta(name, content, overwrite) {
    var m = d.querySelector('meta[name="' + name + '"]');
    if (m && !overwrite) return;
    if (!m) { m = d.createElement('meta'); m.setAttribute('name', name); head.appendChild(m); }
    m.setAttribute('content', content);
  }
  function link(rel, href, type) {
    if (d.querySelector('link[rel="' + rel + '"]')) return;
    var l = d.createElement('link'); l.rel = rel; l.href = href; if (type) l.type = type; head.appendChild(l);
  }
  // iOS: maximum-scale evita o zoom automático ao tocar em campos (o gesto de pinça continua funcionando).
  meta('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover' + (iOS ? ', maximum-scale=1' : ''), true);
  meta('theme-color', d.documentElement.getAttribute('data-avanti-tema') === 'claro' ? '#f2f4f7' : '#05070b');
  meta('apple-mobile-web-app-capable', 'yes');
  meta('mobile-web-app-capable', 'yes');
  meta('apple-mobile-web-app-status-bar-style', 'black');
  meta('apple-mobile-web-app-title', 'Avanti');
  link('manifest', './manifest.webmanifest');
  link('icon', './assets/favicon_64.png', 'image/png');
  link('apple-touch-icon', './assets/apple-touch-icon.png');

  var topWin = true; try { topWin = window.top === window.self; } catch (e) { topWin = false; }
  if (!topWin) return;

  // Celular abrindo uma tela web → vai para a tela equivalente do app.
  // Respeita a escolha "Sempre web" (index.html?v=web) e quem veio da lista de telas (?v=lista).
  (function () {
    var K = 'avanti.plataforma.v1';
    var pick = null, lista = false;
    try { pick = localStorage.getItem(K); lista = sessionStorage.getItem('avanti.lista') === '1'; } catch (e) {}
    var v = new URLSearchParams(location.search).get('v');
    if (v === 'web' || v === 'app') { pick = v; try { localStorage.setItem(K, v); } catch (e) {} }
    if (pick === 'web' || lista) return;
    var APP = {
      'Main': 'H2-Home-Mobile', 'A1-Ponte-Web': 'A2-Ponte-Mobile', 'B1-Carta-Web': 'B2-Carta-Mobile', 'C1-Leme-Web': 'C2-Leme-Mobile',
      'F1-FAQ-Hub-Web': 'F1-FAQ-Hub', 'F2-FAQ-Estabilizador-Web': 'F2-FAQ-Estabilizador', 'F3-FAQ-Piloto-Web': 'F3-FAQ-Piloto',
      'F4-FAQ-Gerador-Web': 'F4-FAQ-Gerador', 'F5-FAQ-Climatizacao-Web': 'F5-FAQ-Climatizacao',
      'G1-Documentos-Web': 'G1-Documentos-Mobile', 'G2-Abastecimento-Web': 'G2-Abastecimento-Mobile', 'G3-Diario-Web': 'G3-Diario-Mobile',
      'G4-Equipe-Web': 'G4-Equipe-Mobile', 'H3-Atalhos-Editar-Web': 'H3-Atalhos-Editar', 'S1-SOS-Web': 'S2-SOS-Mobile'
    };
    var m = location.pathname.match(/([^\/]+)\.dc\.html$/);
    var alvo = m && APP[safe(m[1])];
    if (!alvo) return;
    if (pick !== 'app') {
      var uad = navigator.userAgentData;
      var mobileUA = uad && typeof uad.mobile === 'boolean' ? uad.mobile : /Android.+Mobile|iPhone|iPod|Windows Phone|IEMobile|Opera Mini/i.test(ua);
      var shortSide = Math.min(screen.width || 9999, screen.height || 9999);
      var coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
      if (!(mobileUA || (coarse && shortSide < 600))) return;
    }
    location.replace(alvo + '.dc.html' + location.hash);
    function safe(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
  })();

  if ('serviceWorker' in navigator && /\.github\.io$/i.test(location.hostname)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); });
  }

  var raf = 0;
  function art() {
    var c = d.querySelectorAll('[style*="width: 1440px"],[style*="width: 390px"],[style*="width: 2380px"]');
    for (var i = 0; i < c.length; i++) {
      var s = c[i].style;
      if (/px$/.test(s.width) && parseFloat(s.height) >= 600) return c[i];
    }
    return null;
  }
  function fit() {
    raf = 0;
    if (d.querySelector('deck-stage')) return; // a apresentação escala sozinha
    var el = art(); if (!el) return;
    var W = parseFloat(el.style.width), H = parseFloat(el.style.height);
    var de = d.documentElement;
    var vw = de.clientWidth || window.innerWidth, vh = de.clientHeight || window.innerHeight;
    var phone = W <= 430 && vw < 600;
    var z = phone ? vw / W : Math.min(vw / W, vh / H);
    z = Math.max(0.25, Math.min(z, 2));
    if (Math.abs(z - 1) < 0.005) z = 1;
    var zs = z === 1 ? '' : String(Math.round(z * 1000) / 1000);
    if (el.style.zoom !== zs) el.style.zoom = zs;
    var mt = phone ? 0 : Math.max(0, Math.floor((vh - H * z) / 2));
    var mts = mt ? (mt / z).toFixed(2) + 'px' : '';
    if (el.style.marginTop !== mts) el.style.marginTop = mts;
    if (el.style.marginLeft !== 'auto') { el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(fit); }
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  function start() {
    schedule();
    if (window.MutationObserver) new MutationObserver(schedule).observe(d.body, { childList: true, subtree: true });
  }
  if (d.body) start(); else d.addEventListener('DOMContentLoaded', start);
})();
