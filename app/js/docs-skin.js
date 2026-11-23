/* docs-skin.js — skin-aware rendering for the gate-linked docs.
   Architecture (inverted 2026-11-23): SFW Vanilla is the default baseline.
   Documentation renders SFW & Vanilla out-of-the-box.
   Only when skin.isSex is TRUE (on sex.capades.io or sexcapades.io)
   does this script unhide mature [data-sx-sex-only] blocks, hide [data-sx-vanilla-only]
   blocks, and swap in 18+ mature terminology. On all vanilla skins (flex.capades.io,
   fores, nous, polis, etc.), mature content is NEVER exposed. */
(function () {
  "use strict";
  var SKINS = {
    sex: ["Sexcapades", "Sex.Capades.IO"],
    polis: ["Poliscapades", "Polis.Capades.IO"],
    fores: ["Forescapades", "Fores.Capades.IO"],
    philo: ["Philoscapades", "Philo.Capades.IO"],
    aesth: ["Aesthcapades", "Aesth.Capades.IO"],
    voca: ["Vocapades", "Voca.Capades.IO"],
    tech: ["Techcapades", "Tech.Capades.IO"],
    dharma: ["Dharmacapades", "Dharma.Capades.IO"],
    theori: ["Theoricapades", "Theori.Capades.IO"],
    praxi: ["Praxicapades", "Praxi.Capades.IO"],
    quanta: ["Quantacapades", "Quanta.Capades.IO"],
    experi: ["Expericapades", "Experi.Capades.IO"],
    simul: ["Simulcapades", "Simul.Capades.IO"],
    matter: ["Mattercapades", "Matter.Capades.IO"],
    chem: ["Chemcapades", "Chem.Capades.IO"],
    nous: ["Nouscapades", "Nous.Capades.IO"],
    dance: ["Dancecapades", "Dance.Capades.IO"],
    quest: ["Questcapades", "Quest.Capades.IO"]
  };
  function detectSkin() {
    var host = "";
    try { host = window.location.hostname.toLowerCase(); } catch (e) { host = ""; }
    var prefix = "";
    if (/\.capades\.io$/.test(host)) prefix = host.split(".")[0];
    else if (host === "sexcapades.io" || host === "www.sexcapades.io") prefix = "sex";
    var isSkinHost = !!prefix && !!SKINS[prefix];
    var q = null;
    try { q = new URLSearchParams(window.location.search || "").get("skin"); } catch (e) { q = null; }
    if (!isSkinHost && q && SKINS[q]) prefix = q;
    if (!prefix || !SKINS[prefix]) prefix = "sex";
    return prefix;
  }
  var prefix = detectSkin();
  var COMPARE_SKINS = { sex: true, polis: true };
  var skin = {
    prefix: prefix,
    name: SKINS[prefix][0],
    brand: SKINS[prefix][1],
    host: prefix + ".capades.io",
    isSex: prefix === "sex",
    hasCompare: !!COMPARE_SKINS[prefix]
  };
  window.__SX_DOC_SKIN = skin;

  /* Rules for Sexcapades (18+ opt-in swap from vanilla default): */
  var SEX_RULES = [
    ["Flex.Capades.IO", "Sex.Capades.IO"],
    ["Flexcapades.IO", "Sexcapades.IO"],
    ["Flexcapades.io", "sexcapades.io"],
    ["Flexcapades", "Sexcapades"],
    ["flex.capades.io", "sexcapades.io"],
    ["Depth Factor", "Kink Factor"],
    ["Cross match", "Krossmatch"],
    ["Commune DF", "Play KF"],
    ["Commune MS", "Play MS"],
    ["Converse DF", "Parlay KF"],
    ["Converse MS", "Parlay MS"],
    ["questionnaires", "kink tests"],
    ["questionnaire", "kink test"],
    ["Questionnaire", "Kink test"],
    ["topics", "kinks"],
    ["Topics", "Kinks"],
    ["topic", "kink"],
    ["Topic", "Kink"]
  ];

  /* Rules for Vanilla Skins (brand name swap from generic Flexcapades): */
  var VANILLA_RULES = [
    ["Flex.Capades.IO", skin.brand],
    ["Flexcapades.IO", skin.brand],
    ["Flexcapades.io", skin.host],
    ["Flexcapades", skin.name],
    ["flex.capades.io", skin.host],
    ["Sex.Capades.IO", skin.brand],
    ["Sexcapades.IO", skin.brand],
    ["Sexcapades.io", skin.host],
    ["Sexcapades", skin.name],
    ["sexcapades.io", skin.host]
  ];

  var ACTIVE_RULES = skin.isSex ? SEX_RULES : VANILLA_RULES;

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var RES = ACTIVE_RULES.map(function (r) {
    return [new RegExp("\\b" + esc(r[0]) + "\\b", "g"), r[1]];
  });
  function swapText(s) {
    var out = s;
    for (var i = 0; i < RES.length; i++) out = out.replace(RES[i][0], RES[i][1]);
    return out;
  }
  function walk(node) {
    if (node.nodeType === 3) {
      var v = swapText(node.nodeValue);
      if (v !== node.nodeValue) node.nodeValue = v;
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;
    for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
  }
  function apply() {
    if (document.body) {
      if (skin.isSex) document.body.classList.add("is-sex-skin");
      else document.body.classList.add("is-vanilla-skin");
    }
    var titleEl = document.querySelector("title[data-sx-title-vanilla]");
    if (!skin.isSex && titleEl) {
      document.title = swapText(titleEl.getAttribute("data-sx-title-vanilla"));
    } else if (document.title) {
      document.title = swapText(document.title);
    }
    if (document.body) walk(document.body);
    var attrs = ["title", "aria-label", "alt", "placeholder"];
    attrs.forEach(function (attr) {
      var els = document.querySelectorAll("[" + attr + "]");
      for (var i = 0; i < els.length; i++) {
        var v = els[i].getAttribute(attr);
        if (v) {
          var nv = swapText(v);
          if (nv !== v) els[i].setAttribute(attr, nv);
        }
      }
    });
    var metas = document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
    for (var m = 0; m < metas.length; m++) {
      var c = metas[m].getAttribute("content");
      if (c) {
        var nc = swapText(c);
        if (nc !== c) metas[m].setAttribute("content", nc);
      }
    }
    var links = document.querySelectorAll("a[href]");
    for (var l = 0; l < links.length; l++) {
      var h = links[l].getAttribute("href");
      if (!h) continue;
      var nh = h.replace(/^https?:\/\/((www\.)?sexcapades\.io)(\/|$|\?|#)/i, function (_, __, ___, tail) {
        return "https://" + skin.host + (tail || "");
      });
      if (nh !== h) links[l].setAttribute("href", nh);
    }
    var flyerQrs = document.querySelectorAll(".mini-qr");
    for (var qi = 0; qi < flyerQrs.length; qi++) {
      flyerQrs[qi].style.backgroundImage = 'url("/hosted/images/flyer-qr-' + prefix + '.svg")';
    }

    if (skin.isSex) {
      /* On 18+ Sexcapades: unhide sex-only blocks, hide vanilla-only blocks */
      var sexOnly = document.querySelectorAll("[data-sx-sex-only]");
      for (var s = 0; s < sexOnly.length; s++) sexOnly[s].removeAttribute("hidden"), sexOnly[s].style.display = "";
      var vanillaOnly = document.querySelectorAll("[data-sx-vanilla-only]");
      for (var v = 0; v < vanillaOnly.length; v++) vanillaOnly[v].style.display = "none";
    } else {
      /* On SFW Vanilla skins: hide sex-only blocks, unhide vanilla-only blocks */
      var sexOnly = document.querySelectorAll("[data-sx-sex-only]");
      for (var s = 0; s < sexOnly.length; s++) sexOnly[s].style.display = "none";
      var vanillaOnly = document.querySelectorAll("[data-sx-vanilla-only]");
      for (var v = 0; v < vanillaOnly.length; v++) vanillaOnly[v].removeAttribute("hidden"), vanillaOnly[v].style.display = "";
    }

    try {
      var odoDigits = document.querySelectorAll("[id^='odometer-digits']");
      if (odoDigits.length > 0) {
        fetch('/hosted/api/collect.php', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({action: 'get_stats', skin: skin.name.toLowerCase()})
        })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && typeof d.unique_visitors === 'number') {
            var str = String(d.unique_visitors).padStart(6, '0');
            odoDigits.forEach(function (c) {
              c.innerHTML = '';
              for (var i = 0; i < str.length; i++) {
                var dig = document.createElement('div');
                dig.className = 'odometer-digit';
                dig.textContent = str[i];
                c.appendChild(dig);
              }
            });
          }
        }).catch(function () {});
      }
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
