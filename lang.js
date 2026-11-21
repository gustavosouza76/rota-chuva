/* Seletor de idioma (Português / English / Español) usando o Google Tradutor.
   Renderiza em todo elemento com [data-langsel]. A página original é em português. */
(function () {
  "use strict";
  var FLAGS = {
    /* Portugal */
    pt: '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="12" height="20" fill="#046a38"/><rect x="12" width="18" height="20" fill="#da291c"/><circle cx="12" cy="10" r="4.2" fill="#ffe900" stroke="#fff" stroke-width=".6"/><path d="M10.2 8h3.6v3.4a1.8 1.8 0 0 1-3.6 0z" fill="#da291c" stroke="#fff" stroke-width=".5"/></svg>',
    /* Inglaterra (cruz de São Jorge) */
    en: '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#fff"/><rect x="12.5" width="5" height="20" fill="#ce1124"/><rect y="7.5" width="30" height="5" fill="#ce1124"/></svg>',
    /* Espanha */
    es: '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/><rect x="7" y="7.5" width="3.4" height="5" rx=".6" fill="#aa151b" opacity=".85"/></svg>'
  };
  var LANGS = [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" }
  ];

  function current() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z-]+\/([a-z-]+)/i);
    var c = m ? m[1].slice(0, 2) : "pt";
    return c === "en" || c === "es" ? c : "pt";
  }
  function setCookie(v) {
    var host = location.hostname, exp = v ? "" : ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
    var val = v ? "/pt/" + v : "";
    document.cookie = "googtrans=" + val + ";path=/" + exp;
    if (host.indexOf(".") > 0) {
      document.cookie = "googtrans=" + val + ";path=/;domain=" + host + exp;
      document.cookie = "googtrans=" + val + ";path=/;domain=." + host + exp;
    }
  }
  function choose(code) {
    if (code === current()) return;
    setCookie(code === "pt" ? null : code);
    location.reload();
  }

  var css = document.createElement("style");
  css.textContent =
    ".langsel{position:relative;display:inline-block;font:500 14px/1 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".langsel>button{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.1);color:inherit;border:1px solid rgba(255,255,255,.28);border-radius:8px;padding:6px 9px;cursor:pointer}" +
    ".langsel.light>button{background:var(--panel,#fff);color:var(--ink,#1b1f23);border-color:var(--line,#dde0dc);box-shadow:0 2px 8px rgba(0,0,0,.15)}" +
    ".langsel svg{width:22px;height:15px;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.25);flex:none}" +
    ".langsel ul{position:absolute;right:0;top:calc(100% + 6px);z-index:3000;list-style:none;margin:0;padding:4px;background:var(--panel,#fff);color:var(--ink,#1b1f23);border:1px solid var(--line,#dde0dc);border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.22);min-width:160px}" +
    ".langsel li button{box-shadow:none!important;border:0!important;display:flex;width:100%;align-items:center;gap:10px;background:none;border:0;color:inherit;padding:9px 10px;border-radius:7px;cursor:pointer;font:inherit;text-align:left}" +
    ".langsel li button:hover,.langsel li button[aria-checked=true]{background:rgba(127,127,127,.15)}" +
    ".langsel button:focus-visible{outline:2px solid #f2a900;outline-offset:2px}" +
    /* esconde a barra e os balões do Google Tradutor */
    ".goog-te-banner-frame,.skiptranslate>iframe,#goog-gt-tt,.goog-te-balloon-frame,.goog-tooltip,.VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf{display:none!important}" +
    "body{top:0!important;position:static!important}#gt_el{display:none}" +
    "font[style]{background:none!important;box-shadow:none!important}";
  document.head.appendChild(css);

  function render(host) {
    var cur = current(), info = LANGS.filter(function (l) { return l.code === cur; })[0];
    host.classList.add("langsel", "notranslate");
    host.setAttribute("translate", "no");
    host.innerHTML =
      '<button type="button" aria-haspopup="true" aria-expanded="false" aria-label="Idioma / Language / Idioma">' +
      FLAGS[cur] + "<span>" + cur.toUpperCase() + "</span></button>" +
      '<ul role="menu" hidden>' +
      LANGS.map(function (l) {
        return '<li><button type="button" role="menuitemradio" aria-checked="' + (l.code === cur) + '" data-lang="' + l.code + '">' + FLAGS[l.code] + "<span>" + l.label + "</span></button></li>";
      }).join("") + "</ul>";
    var btn = host.querySelector("button"), menu = host.querySelector("ul");
    function close() { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = menu.hidden; menu.hidden = !open; btn.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lang]"); if (!b) return;
      close(); choose(b.getAttribute("data-lang"));
    });
    document.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    if (info) btn.title = info.label;
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-langsel]"), render);
    var el = document.createElement("div"); el.id = "gt_el"; document.body.appendChild(el);
    window.__rcGT = function () {
      try {
        new google.translate.TranslateElement({ pageLanguage: "pt", includedLanguages: "en,es", autoDisplay: false }, "gt_el");
      } catch (e) {}
    };
    if (current() !== "pt") {
      document.documentElement.lang = current();
    }
    var s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=__rcGT";
    s.async = true;
    document.body.appendChild(s);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
