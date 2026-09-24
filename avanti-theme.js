/* Avanti Vessel AI — tema claro/escuro.
   Toda cor das telas usa var(--av-*, <cor do tema escuro>). Escuro = sem variáveis (fallback exato).
   Claro = as variáveis abaixo no :root. Preferência por usuário em localStorage (avanti.tema.v1). */
(function () {
  if (window.AvantiTheme) return;
  var KEY = 'avanti.tema.v1';
  var LIGHT = {
    '--av-bg': '#f2f4f7', '--av-bg-rgb': '242,244,247', '--av-bar': '#e8ecf1', '--av-bar-rgb': '232,236,241',
    '--av-card': '#ffffff', '--av-card-rgb': '255,255,255', '--av-card2-rgb': '244,246,249', '--av-card3-rgb': '255,255,255',
    '--av-elev': '#eef1f5', '--av-row': '#f4f6f9', '--av-modal': '#ffffff',
    '--av-line': '#d8dde5', '--av-line2': '#c3cad4', '--av-dash': '#97a0ad', '--av-track': '#e1e5ec',
    '--av-ink': '#0c1320', '--av-ink2': '#344052', '--av-ink2-rgb': '52,64,82', '--av-ink3': '#465163', '--av-ink3-rgb': '70,81,99',
    '--av-ink4': '#5a6474', '--av-ph': '#7d8796', '--av-greet': '#5a6474', '--av-hi': '#0c1320', '--av-hl-rgb': '12,19,32',
    '--av-wm-top': '#0c1320', '--av-wm-bot': '#7d8796', '--av-plat': '#6b7482', '--av-plat-rgb': '84,94,110',
    '--av-accent': '#1a6bd1', '--av-accent-rgb': '26,107,209', '--av-accent-hi': '#3b86e8', '--av-accent-soft': '#1a5fb8',
    '--av-link-hover': '#0f55ad', '--av-on-accent': '#ffffff', '--av-on-accent2': '#dbe9ff',
    '--av-ok': '#12804a', '--av-ok-rgb': '18,128,74', '--av-warn': '#9c5a00', '--av-warn-rgb': '156,90,0',
    '--av-crit': '#c42a20', '--av-crit-rgb': '196,42,32', '--av-crit-fill': '#c42a20', '--av-critfill-rgb': '196,42,32',
    '--av-tele': '#06789f', '--av-tele-rgb': '6,120,159',
    '--av-shadow-rgb': '22,32,50', '--av-shadow-k': '0.28', '--av-logo-filter': 'invert(1) brightness(0.2)'
  };
  function get() { try { return localStorage.getItem(KEY) === 'claro' ? 'claro' : 'escuro'; } catch (e) { return 'escuro'; } }
  function apply(t) {
    var r = document.documentElement; if (!r) return;
    for (var k in LIGHT) { if (t === 'claro') r.style.setProperty(k, LIGHT[k]); else r.style.removeProperty(k); }
    r.setAttribute('data-avanti-tema', t);
    r.style.colorScheme = t === 'claro' ? 'light' : 'dark';
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute('content', t === 'claro' ? '#f2f4f7' : '#05070b');
    try { window.dispatchEvent(new CustomEvent('avanti-tema', { detail: t })); } catch (e) {}
  }
  function set(t) { t = t === 'claro' ? 'claro' : 'escuro'; try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); }
  function toggle() { set(get() === 'claro' ? 'escuro' : 'claro'); }
  window.addEventListener('storage', function (e) { if (!e || e.key === KEY || e.key === null) apply(get()); });
  window.AvantiTheme = { KEY: KEY, get: get, set: set, toggle: toggle, apply: apply };
  apply(get());

  var SUN = 'M12 4v2 M12 18v2 M4 12h2 M18 12h2 M6.3 6.3l1.4 1.4 M16.3 16.3l1.4 1.4 M6.3 17.7l1.4-1.4 M16.3 7.7l1.4-1.4 M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z';
  var MOON = 'M19.5 14.2A7.6 7.6 0 0 1 9.8 4.5a7.6 7.6 0 1 0 9.7 9.7z';
  if (!window.customElements || customElements.get('avanti-theme-toggle')) return;
  var NS = 'http://www.w3.org/2000/svg';
  customElements.define('avanti-theme-toggle', class extends HTMLElement {
    connectedCallback() {
      if (!this._b) this.build();
      this._on = this.render.bind(this);
      window.addEventListener('avanti-tema', this._on);
      this.render();
    }
    disconnectedCallback() { window.removeEventListener('avanti-tema', this._on); }
    build() {
      var size = Math.max(24, parseInt(this.getAttribute('size') || '40', 10) || 40);
      var hit = Math.max(size, 44), pad = (hit - size) / 2;
      this.style.cssText = 'display:inline-flex;flex-shrink:0;width:' + size + 'px;height:' + size + 'px;';
      var b = document.createElement('button');
      b.type = 'button';
      b.style.cssText = 'width:' + hit + 'px;height:' + hit + 'px;margin:-' + pad + 'px;padding:0;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;font:inherit;';
      var c = document.createElement('span');
      c.style.cssText = 'box-sizing:border-box;width:' + size + 'px;height:' + size + 'px;border-radius:50%;border:1px solid var(--av-line, #1d2229);background:var(--av-card, #0f131a);color:var(--av-ink2, #aeb6c2);display:flex;align-items:center;justify-content:center;transition:border-color .25s, color .25s, transform .25s;';
      var svg = document.createElementNS(NS, 'svg'); var ic = Math.round(size * 0.46);
      svg.setAttribute('width', ic); svg.setAttribute('height', ic); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('aria-hidden', 'true');
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.8'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(p); c.appendChild(svg); b.appendChild(c); this.appendChild(b);
      b.addEventListener('click', function () { toggle(); });
      b.addEventListener('mouseenter', function () { c.style.borderColor = 'rgba(var(--av-plat-rgb, 217,222,230), 0.55)'; c.style.color = 'var(--av-ink, #e9edf2)'; });
      b.addEventListener('mouseleave', function () { c.style.borderColor = 'var(--av-line, #1d2229)'; c.style.color = 'var(--av-ink2, #aeb6c2)'; });
      b.addEventListener('focus', function () { c.style.borderColor = 'var(--av-accent, #409cff)'; });
      b.addEventListener('blur', function () { c.style.borderColor = 'var(--av-line, #1d2229)'; });
      this._b = b; this._p = p;
    }
    render() {
      var claro = get() === 'claro';
      this._p.setAttribute('d', claro ? MOON : SUN);
      this._b.setAttribute('aria-pressed', claro ? 'true' : 'false');
      this._b.setAttribute('aria-label', claro ? 'Tema claro ativo — mudar para escuro' : 'Tema escuro ativo — mudar para claro');
      this._b.title = claro ? 'Tema escuro' : 'Tema claro';
    }
  });
})();
