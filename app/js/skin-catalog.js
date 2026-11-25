/* ---- Flexcapades Skin Catalog (Single Source of Truth) ----
   Defines the authoritative catalog of all 22 hypermap skins:
   - 3 Activity Maps (dancecapades, questcapades, sexcapades)
   - 19 Stance Maps (aesth, bio, chem, dharma, experi, fast, fores, lingua, matter,
     meta, nous, philo, polis, praxi, quanta, simul, tech, theori, voca)
   Provides unified resolution for hostnames, subdomains, preload links,
   initial tab title painting, analytics skin tagging, and menu rendering.
*/
(function () {
  "use strict";

  var SKINS = {
    // Activity Maps (alphabetical)
    dancecapades: { id: "dancecapades", prefix: "dance", name: "Dancecapades", desc: "lead, follow, and move together", type: "activity" },
    questcapades: { id: "questcapades", prefix: "quest", name: "Questcapades", desc: "the tales a table tells", type: "activity" },
    sexcapades: { id: "sexcapades", prefix: "sex", name: "Sexcapades", desc: "kink & sexuality (18+)", type: "activity", isAdult: true },
    // Stance Maps (alphabetical)
    aesthcapades: { id: "aesthcapades", prefix: "aesth", name: "Aesthcapades", desc: "aesthetics & taste", type: "stance" },
    biocapades: { id: "biocapades", prefix: "bio", name: "Biocapades", desc: "life itself", type: "stance" },
    chemcapades: { id: "chemcapades", prefix: "chem", name: "Chemcapades", desc: "chemistry", type: "stance" },
    dharmacapades: { id: "dharmacapades", prefix: "dharma", name: "Dharmacapades", desc: "eastern religions", type: "stance" },
    expericapades: { id: "expericapades", prefix: "experi", name: "Expericapades", desc: "experimental physics", type: "stance" },
    fastcapades: { id: "fastcapades", prefix: "fast", name: "Fastcapades", desc: "the discipline of not eating", type: "stance" },
    forescapades: { id: "forescapades", prefix: "fores", name: "Forescapades", desc: "religion — Abrahamic faiths", type: "stance" },
    linguacapades: { id: "linguacapades", prefix: "lingua", name: "Linguacapades", desc: "the tongues we think in", type: "stance" },
    mattercapades: { id: "mattercapades", prefix: "matter", name: "Mattercapades", desc: "applied physics", type: "stance" },
    flexcapades: { id: "flexcapades", prefix: "flex", name: "Flexcapades", desc: "how you use Flexcapades, and how you want it to grow", type: "stance" },
    nouscapades: { id: "nouscapades", prefix: "nous", name: "Nouscapades", desc: "what counts as a mind", type: "stance" },
    philoscapades: { id: "philoscapades", prefix: "philo", name: "Philoscapades", desc: "philosophy", type: "stance" },
    poliscapades: { id: "poliscapades", prefix: "polis", name: "Poliscapades", desc: "politics", type: "stance" },
    praxicapades: { id: "praxicapades", prefix: "praxi", name: "Praxicapades", desc: "applied mathematics", type: "stance" },
    quantacapades: { id: "quantacapades", prefix: "quanta", name: "Quantacapades", desc: "theoretical physics", type: "stance" },
    simulcapades: { id: "simulcapades", prefix: "simul", name: "Simulcapades", desc: "computational physics", type: "stance" },
    techcapades: { id: "techcapades", prefix: "tech", name: "Techcapades", desc: "technology", type: "stance" },
    theoricapades: { id: "theoricapades", prefix: "theori", name: "Theoricapades", desc: "pure mathematics", type: "stance" },
    vocapades: { id: "vocapades", prefix: "voca", name: "Vocapades", desc: "vocation & work", type: "stance" }
  };

  var HOSTNAME_TO_SKIN = {};
  var SKIN_TO_PREFIX = {};
  var SKIN_IDS = [];
  var GATE_SKINS = {};

  for (var id in SKINS) {
    if (Object.prototype.hasOwnProperty.call(SKINS, id)) {
      var item = SKINS[id];
      HOSTNAME_TO_SKIN[item.prefix] = id;
      SKIN_TO_PREFIX[id] = item.prefix;
      SKIN_IDS.push(id);
      GATE_SKINS[item.prefix] = [
        item.name,
        item.prefix.charAt(0).toUpperCase() + item.prefix.slice(1) + ".Capades.IO"
      ];
    }
  }

  function skinForHostname(hostname) {
    var host = (hostname || (typeof location !== "undefined" ? location.hostname : "") || "").toLowerCase();
    if (host === "sexcapades.io" || host === "www.sexcapades.io") return "sexcapades";
    if (host === "flex.capades.io" || host === "www.flex.capades.io" || host === "capades.io" || host === "www.capades.io") return "flexcapades";
    var prefix = /\.capades\.io$/.test(host) ? host.split(".")[0] : "";
    if (prefix && HOSTNAME_TO_SKIN[prefix]) return HOSTNAME_TO_SKIN[prefix];
    return "sexcapades";
  }

  function skinPrefixFor(skinId) {
    var sid = String(skinId || "");
    if (SKIN_TO_PREFIX[sid]) return SKIN_TO_PREFIX[sid];
    return "sex";
  }

  function skinFromUrl() {
    try {
      if (typeof location === "undefined") return null;
      var q = new URLSearchParams(location.search || "").get("skin");
      if (q && SKINS[q]) return q;
    } catch (_) {}
    return null;
  }

  function activeOrDefaultSkin() {
    return (typeof window !== "undefined" && window.__SX_ACTIVE_SKIN) || skinFromUrl() || skinForHostname();
  }

  // Dynamic DOM renderer for .skin-menu (Activity vs Stance, alphabetical)
  function renderSkinMenu(menuEl, currentActiveSkin) {
    if (!menuEl) return;
    var active = currentActiveSkin || activeOrDefaultSkin();
    var html = [];

    html.push('<div class="skin-menu-section-header" role="presentation">Activity Maps</div>');
    SKIN_IDS.forEach(function (sid) {
      var s = SKINS[sid];
      if (s.type !== "activity") return;
      var isCur = (sid === active);
      html.push('<button aria-checked="' + (isCur ? "true" : "false") + '" class="view-nav-item' + (isCur ? " is-current" : "") + '" data-skin="' + s.id + '" role="menuitemradio" type="button"><span class="skin-label"><span class="skin-name">' + s.name + '</span><span class="skin-desc">' + s.desc + '</span></span></button>');
    });

    html.push('<div class="view-nav-divider skin-menu-divider" aria-hidden="true"></div>');

    html.push('<div class="skin-menu-section-header" role="presentation">Stance Maps</div>');
    SKIN_IDS.forEach(function (sid) {
      var s = SKINS[sid];
      if (s.type !== "stance") return;
      var isCur = (sid === active);
      html.push('<button aria-checked="' + (isCur ? "true" : "false") + '" class="view-nav-item' + (isCur ? " is-current" : "") + '" data-skin="' + s.id + '" role="menuitemradio" type="button"><span class="skin-label"><span class="skin-name">' + s.name + '</span><span class="skin-desc">' + s.desc + '</span></span></button>');
    });

    menuEl.innerHTML = html.join("");
  }

  // Tab title setter: sets the document title before first paint to eliminate tab flash
  function setInitialTabTitle() {
    try {
      if (typeof document === "undefined") return;
      var sid = skinFromUrl() || skinForHostname();
      var s = SKINS[sid];
      if (!s) return;
      var p = s.prefix;
      var domain = p.charAt(0).toUpperCase() + p.slice(1) + ".Capades.IO";
      if (sid === "sexcapades") {
        document.title = "Sex.Capades.IO";
      } else {
        document.title = domain + " \u2014 " + s.name;
      }
    } catch (_) {}
  }

  // Preload link injector: injects link rel="preload" for non-default skin taxonomy
  function injectPreloadLink() {
    try {
      if (typeof document === "undefined") return;
      var host = (location.hostname || "").toLowerCase();
      var sid = skinFromUrl() || (/\.capades\.io$/.test(host) ? HOSTNAME_TO_SKIN[host.split(".")[0]] : null);
      if (sid && sid !== "sexcapades") {
        var l = document.createElement("link");
        l.rel = "preload";
        l.as = "fetch";
        l.href = "data/skins/" + sid + ".json";
        l.crossOrigin = "anonymous";
        document.head.appendChild(l);
      }
    } catch (_) {}
  }

  // Export onto window
  if (typeof window !== "undefined") {
    window.__SX_SKINS = SKINS;
    window.__SX_SKIN_IDS = SKIN_IDS;
    window.__SX_HOSTNAME_SKINS = HOSTNAME_TO_SKIN;
    window.__SX_SKIN_SUBDOMAIN = SKIN_TO_PREFIX;
    window.__SX_GATE_SKINS = GATE_SKINS;
    window.__SX_SKIN_FOR_HOSTNAME = skinForHostname;
    window.__SX_SKIN_PREFIX_FOR = skinPrefixFor;
    window.__SX_SKIN_FROM_URL = skinFromUrl;
    window.__SX_RENDER_SKIN_MENU = renderSkinMenu;
    window.__SX_SET_INITIAL_TITLE = setInitialTabTitle;
    window.__SX_INJECT_PRELOAD = injectPreloadLink;
  }
})();
