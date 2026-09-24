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
