/* docs-skin.js — skin-aware rendering for the gate-linked docs.
   The docs are written for Sexcapades and read as-is on the Sexcapades
   skin. On a vanilla skin this script (loaded synchronously in <head>)
   detects the skin from the hostname (or ?skin= on non-skin hosts, for
   localhost testing — ?skin= can NEVER override a sex host, same rule
   as the gate) and, on DOMContentLoaded:
   - swaps the brand (Sexcapades / Sexcapades.IO / Sex.Capades.IO /
     sexcapades.io) for the skin's name, dotted brand, and host;
   - swaps the ruled vanilla terms (Kink Factor -> Depth Factor,
     Krossmatch -> Cross match, Play/Parlay scores, kink -> topic and
     its compounds) in visible text nodes only — never inside
     <script>/<style>, never in attributes except the listed ones;
   - hides [data-sx-sex-only] blocks and shows [data-sx-vanilla-only]
     blocks (the no-JS default hides vanilla-only via a <style> rule,
     so Sexcapades renders correctly with JS off);
   - rewrites sexcapades.io hosts in <a> hrefs to the skin's host, so
     doc links stay on the skin. <link>/favicon/asset hrefs, mailto:,
     and fragment-only links are left alone.
   Feature names that stay the same on every skin (Cast is retired and
   documented as such; Scribe, Scene Setter, Scene Sentinel, Net,
   Hot List) are NOT swapped. "Play" is deliberately NOT in the
   table: in docs it is usually the audio play button ("Play the
   verse"), a topic name ("Nipple Play"), or the Scene Setter output
   ("Play Guides") — those are handled per-doc with sex-only /
   vanilla-only blocks instead.
   window.__SX_DOC_SKIN is set synchronously so the privacy/guide
   inline age-gate scripts (end of body) can check it: the age
   overlay only ever shows on the Sexcapades skin. */
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
    nous: ["Nouscapades", "Nous.Capades.IO"]
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
  /* Skins with comparison data — the only skins whose gate shows the
     Compare link and whose compare page has content. Sexcapades has the
     kink-test comparison table; Poliscapades has the political-affiliation
     comparisons (the party-platform archetypes). Every other skin has no
     comparison data: its gate hides the link and its compare page redirects
     to the gate. (Jason, 2026-11-17.) */
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
  if (skin.isSex) {
    /* Sexcapades renders as written; just make sure no vanilla-only
       block ever shows (the <style> rule already hides them). */
    document.addEventListener("DOMContentLoaded", function () {
      var els = document.querySelectorAll("[data-sx-vanilla-only]");
      for (var i = 0; i < els.length; i++) els[i].style.display = "none";
    });
    return;
  }
  /* Vanilla: longest first, whole-word, case-sensitive. "Sexcapades.IO"
     before "Sexcapades" (it contains it); "Sexcapades.io" before
     "Sexcapades" for the same reason. */
  var RULES = [
    ["Sex.Capades.IO", skin.brand],
    ["Sexcapades.IO", skin.brand],
    ["Sexcapades.io", skin.host],
    ["Sexcapades", skin.name],
    ["sexcapades.io", skin.host],
    ["Kink Factor", "Depth Factor"],
    ["Krossmatch", "Cross match"],
    ["Play KF", "Commune DF"],
    ["Play MS", "Commune MS"],
    ["Parlay KF", "Converse DF"],
    ["Parlay MS", "Converse MS"],
    ["kink categories", "categories"],
    ["Kink categories", "Categories"],
    ["kink lines", "topic lines"],
    ["Kink lines", "Topic lines"],
    ["kink map", "hypermap"],
    ["Kink map", "Hypermap"],
    ["kink maps", "hypermaps"],
    ["Kink maps", "Hypermaps"],
    ["kink tests", "questionnaires"],
    ["kink test", "questionnaire"],
    ["Kink test", "Questionnaire"],
    ["kink profile", "profile"],
    ["Kink profile", "Profile"],
    ["kink ratings", "ratings"],
    ["Kink ratings", "Ratings"],
    ["kink preferences", "preferences"],
    ["Kink preferences", "Preferences"],
    ["kink topics", "topics"],
    ["Kink topics", "Topics"],
    ["kinks", "topics"],
    ["Kinks", "Topics"],
    ["kink", "topic"],
    ["Kink", "Topic"]
  ];
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var RES = RULES.map(function (r) {
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
    /* Visible text: whole document body plus <title>. A <title> may
       carry data-sx-title-vanilla with a full vanilla replacement
       (used when the Sexcapades title names things that have no
       vanilla equivalent, e.g. the compare page's competitors). */
    var titleEl = document.querySelector("title[data-sx-title-vanilla]");
    if (titleEl) {
      /* The override goes through the same brand swap, so it can name
         the skin ("Compare — Sexcapades" -> "Compare — Quantacapades"). */
      document.title = swapText(titleEl.getAttribute("data-sx-title-vanilla"));
    } else if (document.title) {
      document.title = swapText(document.title);
    }
    if (document.body) walk(document.body);
    /* User-facing attributes: tooltips, labels, alt text. */
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
    /* Meta descriptions/titles (browser-visible; crawlers see the
       static Sexcapades copy — flagged, not fixable from here). */
    var metas = document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
    for (var m = 0; m < metas.length; m++) {
      var c = metas[m].getAttribute("content");
      if (c) {
        var nc = swapText(c);
        if (nc !== c) metas[m].setAttribute("content", nc);
      }
    }
    /* Doc links stay on the skin: rewrite the sexcapades.io host in
       <a> hrefs only (not <link>/favicon/assets, not mailto:). */
    var links = document.querySelectorAll("a[href]");
    for (var l = 0; l < links.length; l++) {
      var h = links[l].getAttribute("href");
      if (!h) continue;
      var nh = h.replace(/^https?:\/\/((www\.)?sexcapades\.io)(\/|$|\?|#)/i, function (_, __, ___, tail) {
        return "https://" + skin.host + (tail || "");
      });
      if (nh !== h) links[l].setAttribute("href", nh);
    }
    /* Tear-off QR codes (flyer only): the flyer ships one static
       Sexcapades QR picture as its default, which is correct on the
       Sexcapades skin. On a vanilla skin, point every tear-off QR at
       this skin's pre-generated picture, so a scan lands on the skin's
       own list view instead of Sexcapades. */
    var flyerQrs = document.querySelectorAll(".mini-qr");
    for (var qi = 0; qi < flyerQrs.length; qi++) {
      flyerQrs[qi].style.backgroundImage = 'url("/hosted/images/flyer-qr-' + prefix + '.svg")';
    }
    /* Sex-only blocks hide; vanilla-only blocks show (dropping the
       attribute lifts the no-JS <style> rule, restoring natural
       display for blocks and inline spans alike). */
    var sexOnly = document.querySelectorAll("[data-sx-sex-only]");
    for (var s = 0; s < sexOnly.length; s++) sexOnly[s].style.display = "none";
    var vanillaOnly = document.querySelectorAll("[data-sx-vanilla-only]");
    for (var v = 0; v < vanillaOnly.length; v++) vanillaOnly[v].removeAttribute("data-sx-vanilla-only");

    /* Per-skin visitor odometer fetch (2026-11-22): query stats for the active skin. */
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

