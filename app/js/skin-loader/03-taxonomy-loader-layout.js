  /* ---- Hostname -> skin (flex.capades.io plan, 2026-11-16) ----
     One shared folder serves every capades.io host, and the app picks
     its skin from the hostname: <prefix>.capades.io loads that skin at
     boot, sexcapades.io (legacy) loads Sexcapades, and flex.capades.io /
     capades.io boot the default skin (Flexcapades) with the skin menu open (the "no
     skin picked" state). Anything else (localhost, unknown hosts) boots
     Sexcapades, as before. The ?skin= query param (see skinFromUrl)
     wins over the hostname: it carries a skin selection across the
     age-gate round-trip. */
  var HOSTNAME_SKINS = (typeof window !== "undefined" && window.__SX_HOSTNAME_SKINS) || {};
  var SKIN_IDS = (typeof window !== "undefined" && window.__SX_SKIN_IDS) || [];

  function skinForHostname(hostname) {
    if (typeof window !== "undefined" && typeof window.__SX_SKIN_FOR_HOSTNAME === "function" && window.__SX_SKIN_FOR_HOSTNAME !== skinForHostname) {
      return window.__SX_SKIN_FOR_HOSTNAME(hostname);
    }
    var host = (hostname || "").toLowerCase();
    if (host === "sexcapades.io" || host === "www.sexcapades.io") return "sexcapades";
    if (host === "flex.capades.io" || host === "www.flex.capades.io" || host === "capades.io" || host === "www.capades.io") return "flexcapades";
    var prefix = /\.capades\.io$/.test(host) ? host.split(".")[0] : "";
    if (prefix && HOSTNAME_SKINS[prefix]) return HOSTNAME_SKINS[prefix];
    return "sexcapades";
  }
  /* Inverse of HOSTNAME_SKINS: the subdomain prefix for a skin id
     ("quantacapades" -> "quanta", "philoscapades" -> "philo",
     "vocapades" -> "voca"). A lookup, NOT a string-strip — stripping
     "capades" off the coined name gives the wrong prefix for
     Philoscapades ("philos") and Vocapades ("vo"). Exposed on window
     alongside __SX_ACTIVE_SKIN so the pitch-pitcher can name the
     specific skin's dotted domain. Unknown ids fall back to "sex",
     mirroring skinForHostname's unknown-host default. */
  function skinPrefixFor(skinId) {
    if (typeof window !== "undefined" && typeof window.__SX_SKIN_PREFIX_FOR === "function" && window.__SX_SKIN_PREFIX_FOR !== skinPrefixFor) {
      return window.__SX_SKIN_PREFIX_FOR(skinId);
    }
    var id = String(skinId || "");
    for (var p in HOSTNAME_SKINS) {
      if (HOSTNAME_SKINS[p] === id) return p;
    }
    return "sex";
  }
  /* Per-skin PWA manifest (2026-11-18, rainbow build): each skin
     installs under its own name with its own icon. The manifest files
     live at /manifests/<prefix>.json (new filenames, so no stale-cache
     serving — the shared /icons/icon-*.png URLs are cached per-origin
     for 7 days and precached cache-first by the service worker). The
     app's static <link> points at the shared Flex manifest; this swaps
     it to the active skin's manifest on boot and on every skin switch,
     and swaps the apple-touch-icon the same way. A missing link or an
     unknown skin falls back to the shared manifest (Flex). The icon
     URLs in the manifests carry ?v=<build> (stamped at packaging);
     the apple-touch-icon swap is unstamped (new filename, first fetch
     is fresh — a future icon change needs a stamp; follow-up). */
  function setManifestForSkin(skinId) {
    var prefix = skinPrefixFor(skinId);
    try {
      var link = document.querySelector('link[rel="manifest"]');
      if (link) link.setAttribute("href", "/manifests/" + prefix + ".json");
    } catch (e) { /* keep the shared manifest */ }
    try {
      var touch = document.querySelector('link[rel="apple-touch-icon"]');
      if (touch) touch.setAttribute("href", "/icons/skins/" + prefix + "-apple-touch.png");
    } catch (e) { /* keep the shared apple-touch-icon */ }
  }
  function bootShouldOpenMenu(hostname) {
    var host = (hostname || "").toLowerCase();
    return host === "flex.capades.io" || host === "capades.io";
  }
  function skinFromUrl() {
    try {
      var q = new URLSearchParams(window.location.search || "");
      var s = q.get("skin");
      if (s && SKIN_IDS.indexOf(s) !== -1) return s;
    } catch (e) { /* no skin param */ }
    return null;
  }

  /* Gate-pass predicate, mirroring the gate page's hasPreviousGatePass
     (gate.html): the stored flag, the gate cookie, or a minted UUID.
     The app's inline gate script checks only the stored flag at boot;
     the gate itself accepts all three, so the switch-time check below
     accepts all three too — otherwise a visitor the gate would wave
     straight through gets gated twice. */
  function hasGatePass() {
    try {
      if (document.cookie.split(";").some(function (p) { return p.trim() === "sexcapades_age_verified=1"; })) return true;
    } catch (e) { /* no cookie */ }
    try {
      if (window.localStorage.getItem("sexcapades_age_verified") === "true") return true;
      if (window.localStorage.getItem("sexcapades_uuid")) return true;
    } catch (e) { /* no storage */ }
    if (window.__SEXCAPADES_MEMORY_ONLY) return true;
    return false;
  }

  /* Honor a ?verified=1 gate return on hosts where the app's inline
     gate script returns early (non-sex hosts): store the pass and clean
     the gate params, keeping any ?skin= for the boot below. On a sex
     host the inline script already did this, so this is a no-op there. */
  function handleVerifiedParam() {
    try {
      var q = new URLSearchParams(window.location.search || "");
      if (q.get("verified") !== "1") return;
      try { window.localStorage.setItem("sexcapades_age_verified", "true"); } catch (e) { window.__SEXCAPADES_MEMORY_ONLY = true; }
      q.delete("verified");
      q.delete("gate_attempt");
      var clean = window.location.pathname + (q.toString() ? "?" + q.toString() : "") + (window.location.hash || "");
      try { window.history.replaceState(null, "", clean); } catch (e) { /* keep URL */ }
    } catch (e) { /* no verified param */ }
  }

  /* Gate URL next to the app page (app/gate.html, hosted/gate.html,
     qa/gate.html — same directory in every tree), so the redirect works
     in the source, hosted, and QA trees alike. */
  function gateUrl(returnUrl) {
    var path = window.location.pathname || "/hosted/app.html";
    var dir = path.replace(/\/[^/]*$/, "/");
    return dir + "gate.html?return=" + encodeURIComponent(returnUrl);
  }
  function redirectToGateForSkin(skinId) {
    var params = new URLSearchParams(window.location.search || "");
    params.set("verified", "1");
    params.set("gate_attempt", "1");
    params.set("skin", skinId);
    var returnUrl = window.location.origin + window.location.pathname + "?" + params.toString() + (window.location.hash || "");
    window.location.replace(gateUrl(returnUrl));
  }

  function taxonomyCategories() {
    if (window.TaxonomyLoader && typeof window.TaxonomyLoader.loadTaxonomy === "function") {
      var tax = window.TaxonomyLoader.loadTaxonomy();
      if (tax && Array.isArray(tax.categories)) return tax.categories;
    }
    return [];
  }

  /* Build one category in the post-overlay (merged) shape the paint reads:
     topics (objects with a non-enumerable toString) + topicDetails keyed
     by topic name. Mirrors TaxonomyLoader's applySubcategoryOverlay:
     a category with subcategories keeps them (each with its own topics)
     and topics stays the flat list (parentTopics first, then subcategory
     topics in order). A flat category (no subcategories) is unchanged. */
  function mergedTopic(t) {
    var topic = { id: t.id, name: t.name, risk: !!t.risk };
    if (t.type) topic.type = t.type;
    if (t.give_label) topic.give_label = t.give_label;
    if (t.receive_label) topic.receive_label = t.receive_label;
    if (t.note) topic.note = t.note;
    if (t.poleReading) topic.poleReading = t.poleReading;
    if (Array.isArray(t.poleEnemies)) topic.poleEnemies = t.poleEnemies;
    Object.defineProperty(topic, "toString", {
      value: function () { return this.name; },
      enumerable: false
    });
    return topic;
  }
  function topicDetailRow(t) {
    var row = {};
    if (t.type) row.type = t.type;
    if (t.give_label) row.give_label = t.give_label;
    if (t.receive_label) row.receive_label = t.receive_label;
    if (t.note) row.note = t.note;
    return row;
  }
  function mergedCategory(cat) {
    var topics = [];
    var details = {};
    function absorb(list) {
      (list || []).forEach(function (t) {
        topics.push(mergedTopic(t));
        var row = topicDetailRow(t);
        if (Object.keys(row).length) details[t.name] = row;
      });
    }
    var out = { id: cat.id, name: cat.name };
    var subs = cat.subcategories || [];
    if (subs.length) {
      if (Array.isArray(cat.parentTopics) && cat.parentTopics.length > 0) {
        var pbefore = topics.length;
        absorb(cat.parentTopics);
        out.parentTopics = topics.slice(pbefore);
      }
      out.subcategories = subs.map(function (sub) {
        var before = topics.length;
        absorb(sub.topics);
        return { id: sub.id, name: sub.name, topics: topics.slice(before) };
      });
    } else {
      absorb(cat.topics);
    }
    out.topics = topics;
    out.topicDetails = details;
    return out;
  }

  /* Ge()-shaped widget config for one skin topic. Pole-count flags mirror
     the Sexcapades Ge() returns (t0281 sets triangle:true beside
     widget:"trilinear-sliders"); the placard switch branches on the
     widget string, so the flags only feed the map-spoke taper paths.
     A LINE triad gets no triangle flag — it is not a triangle. */
  function widgetConfig(topic) {
    if (!topic || (!topic.widget && (!topic.poles || !topic.poles.length))) {
      return null;
    }
    var poles = topic.poles || [];
    var keys = poles.map(function (p) { return p.key; });
    var labels = poles.map(function (p) { return p.label; });
    var cfg = {
      single: topic.widget === "monopole-slider",
      widget: topic.widget || (poles.length === 1 ? "monopole-slider" : "xy-switchbox"),
      keys: keys.length ? keys : ["give", "receive"],
      labels: labels.length ? labels : ["give", "receive"]
    };
    if (topic.widget === "monopole-slider") {
      cfg.poleKeys = keys;
      cfg.keys = ["give"];
      cfg.labels = labels.length ? labels : ["everything"];
    }
    if (topic.widget === "xy-switchbox") {
      if (!cfg.keys || !cfg.keys.length) cfg.keys = ["give", "receive"];
      if (!cfg.labels || !cfg.labels.length) cfg.labels = ["give", "receive"];
    }
    /* LINE triad: one scalar on a single track, stored under the single key
       "line" — NOT under the first pole's key (the bind writes via
       keys[0], and a line position of -100 means "fully the left pole",
       which would read as "against the left pole" under a pole key). The
       three pole labels stay in cfg.labels for the spectrum label. */
    if (topic.widget === "trilinear-line") cfg.keys = ["line"];
    /* T1: compass axis captions come from the topic (xpo0004 carries
       ["Economic", "Authority"]); a compass topic without axes draws no
       captions rather than a wrong hardcoded pair. */
    if (topic.axes) cfg.axes = topic.axes.slice();
    /* T8: a LINE triad stores one scalar under "line", but its three pole
       labels still need their pole keys for per-pole hovertips. */
    if (topic.widget === "trilinear-line") cfg.poleKeys = keys;
    if (topic.archetype) cfg.archetype = topic.archetype;
    if (topic.widget !== "trilinear-line") {
      if (poles.length === 3) cfg.triangle = true;
      if (poles.length === 4) cfg.tetrad = true;
      if (poles.length === 5) cfg.pentad = true;
      if (poles.length === 6) cfg.hexad = true;
      if (poles.length === 7) cfg.heptad = true;
      if (poles.length === 8) cfg.octad = true;
    }
    return cfg;
  }

  /* Hovertip text (Issue + one line per pole), the same text the briefing
     carries verbatim. Used as the placard About text for skin topics. */
  function formatHovertip(t) {
    var lines = [t.hovertip.issue];
    (t.hovertip.poles || []).forEach(function (p) {
      lines.push(p.label + " — " + p.text);
    });
    return lines.join("\n");
  }

  function applySkin(data) {
    bumpPaintGen();
    var cats = taxonomyCategories();
    if (!original) original = JSON.parse(JSON.stringify(cats));
    var merged = data.categories.map(mergedCategory);
    cats.length = 0;
    merged.forEach(function (c) { cats.push(c); });
    var count = registerWidgets(data);
    window.__SX_SKIN_TOPIC_COUNT = count;
    window.__SX_ACTIVE_SKIN = data.skin;
    window.__SX_SKIN_PREFIX = skinPrefixFor(data.skin);
    setManifestForSkin(data.skin);
    activeSkin = data.skin;
    setAboutDescription(data.name, data.about);
    setSamples(data.samples, data.skin);
    setScribe(data.scribe);
    setSceneSetter(data.sceneSetter);
    if (data.popularity) window.__SEXCAPADES_POPULARITY_DATA = data.popularity;
    if (data.prevalence) window.__SEXCAPADES_PREVALENCE = data.prevalence;
    /* Register the new category names in the solver's expanded-branch set,
       or frBuildTree skips every topic as collapsed (bare spokes). */
    if (typeof window.__SX_SKIN_LAYOUT_SYNC === "function") window.__SX_SKIN_LAYOUT_SYNC();
  }

  /* Build the Ge() widget registry + placard descriptions from one skin
     JSON. Shared by applySkin and the Sexcapades restore path.
     Returns the topic count. */
  function registerWidgets(data) {
    var widgets = {};
    var desc = {};
    var poleLines = {};
    var meterTopics = {};
    var communities = {};
    var popularity = {};
    var readings = {};
    var topicGlyphs = {};
    var count = 0;
    data.categories.forEach(function (cat) {
      var all = (cat.topics || []).concat(cat.parentTopics || []);
      (cat.subcategories || []).forEach(function (sub) {
        all = all.concat(sub.topics || [], sub.parentTopics || []);
      });
      all.forEach(function (t) {
        var wc = widgetConfig(t);
        if (wc) widgets[t.id] = wc;
        if (t.glyph) {
          var gEntry = t.glyphLabel ? { glyph: t.glyph, label: t.glyphLabel } : t.glyph;
          topicGlyphs[cat.name + "\0" + t.name] = gEntry;
          if (t.label && t.label !== t.name) topicGlyphs[cat.name + "\0" + t.label] = gEntry;
          if (t.id) topicGlyphs[t.id] = gEntry;
        }
        if (t.hovertip) desc[t.name] = formatHovertip(t);
        /* Widget approachability: per-pole hovertip lines ("Label — text"),
           keyed by topic id then pole key; the placard attaches them to the
           readout spans (seam A) and the canvas hover hit-test (seam B). */
        if (t.hovertip && t.hovertip.poles) {
          var lines = {};
          var topicPoles = t.poles || [];
          (t.hovertip.poles || []).forEach(function (p, i) {
            /* Hovertip pole entries carry {label, text} only — the key
               lives on the topic's own poles[i] (same order). */
            var k = (topicPoles[i] && topicPoles[i].key) || p.key;
            if (k) lines[k] = p.label + " — " + p.text;
          });
          poleLines[t.id] = lines;
        }
        if (t.meter) meterTopics[t.id] = t.meter;
        /* Community + popularity (vanilla skins): per-topic communities
           and Polis popularity scores live on the skin topic objects.
           Published as registries keyed by topic id for the placard. */
        if (t.communities && t.communities.length) communities[t.id] = t.communities;
        if (t.popularity) popularity[t.id] = t.popularity;
        if (t.poleReading) readings[t.id] = { reading: t.poleReading, enemies: t.poleEnemies || [] };
        count += 1;
      });
    });
    window.__SX_SKIN_WIDGETS = widgets;
    window.__SX_SKIN_DESCRIPTIONS = desc;
    window.__SX_POLE_LINES = poleLines;
    window.__SX_METER = { default: data.meter || null, topics: meterTopics };
    window.__SX_SKIN_COMMUNITIES = communities;
    window.__SX_SKIN_POPULARITY = popularity;
    window.__SX_POLE_READINGS = readings;
    window.__SX_SKIN_TOPIC_GLYPHS = topicGlyphs;
    return count;
  }

  /* Widget approachability lookups. __SX_POLE_LINE_FOR returns one pole's
     "Label — text" line, or null. __SX_METER_FOR_TOPIC returns the topic's
     meter word, else its skin's default word, else null. */
  window.__SX_POLE_LINE_FOR = function (topicId, key) {
    var reg = window.__SX_POLE_LINES;
    if (reg && reg[topicId] && reg[topicId][key]) return reg[topicId][key];
    return null;
  };
  window.__SX_METER_FOR_TOPIC = function (topicId) {
    var m = window.__SX_METER;
    if (!m) return null;
    if (topicId && m.topics && m.topics[topicId]) return m.topics[topicId];
    return m.default || null;
  };

  /* Community + popularity lookups. __SX_COMMUNITIES_FOR_TOPIC returns
     the topic's community list, or null. __SX_POPULARITY_FOR_TOPIC
     returns the topic's popularity object, or null. Both read the
     registries registerWidgets builds from the active skin's topics. */
  window.__SX_COMMUNITIES_FOR_TOPIC = function (topicId) {
    var reg = window.__SX_SKIN_COMMUNITIES;
    if (reg && reg[topicId]) return reg[topicId];
    return null;
  };
  window.__SX_POPULARITY_FOR_TOPIC = function (topicId) {
    var reg = window.__SX_SKIN_POPULARITY;
    if (reg && reg[topicId]) return reg[topicId];
    return null;
  };

  /* Sexcapades fetch shared by restore and the failed-boot fallback.
     applySkin is the normal boot path and is the only category source.
     registerSexcapadesWidgets fills widgets, samples, scribe, and setter
     when that swap cannot run. It does not supply categories. */
  /* Fetch sexcapades.json (cached after the first load). Shared by the
     boot seam and the switch-back path. */
  function sexcapadesData() {
    if (cache["sexcapades"]) return Promise.resolve(cache["sexcapades"]);
    return fetch(SKIN_DIR + "sexcapades.json").then(function (r) {
      if (!r.ok) throw new Error("skin file not found: data/skins/sexcapades.json");
      return r.json();
    }).then(function (data) { cache["sexcapades"] = data; return data; });
  }

  function registerSexcapadesWidgets() {
    return sexcapadesData().then(function (data) {
      registerWidgets(data);
      setSamples(data.samples, "sexcapades");
      setScribe(data.scribe);
      setSceneSetter(data.sceneSetter);
    }).catch(function (err) {
      if (typeof console !== "undefined" && console.warn) console.warn("[FlexcapadesSkins] sexcapades.json not registered:", err);
    });
  }

  function restoreSexcapades() {
    bumpPaintGen();
    var cats = taxonomyCategories();
    cats.length = 0;
    var sexData = cache["sexcapades"];
    if (sexData && Array.isArray(sexData.categories)) {
      var merged = sexData.categories.map(mergedCategory);
      merged.forEach(function (c) { cats.push(c); });
    } else if (original) {
      JSON.parse(JSON.stringify(original)).forEach(function (c) { cats.push(c); });
    }
    /* The JSON round-trip above strips the non-enumerable toString the
       boot overlay attached to every topic object (and that mergedTopic
       attaches for vanilla skins): a bare topic object stringifies as
       "[object Object]". The outline, map, and match surfaces all
       coerce topic objects to strings (row labels, path lines, note
       captions, aria-labels), so without it every Hot List row reads
       "[object Object]" after a skin round-trip (1,143 occurrences:
       381 rows x label + path line + note caption, plus thousands
       more in aria-labels/titles). Re-attach the same name coercion
       to every topic object in the restored tree — flat list,
       subcategory lists, and parent lists (the JSON clone duplicates
       shared references, so walk all three; the Set skips repeats). */
    var sxRestoredTopics = new Set();
    function sxReattachTopicToString(list) {
      (list || []).forEach(function (t) {
        if (!t || typeof t !== "object" || sxRestoredTopics.has(t)) return;
        sxRestoredTopics.add(t);
        Object.defineProperty(t, "toString", {
          value: function () { return this.name; },
          enumerable: false
        });
      });
    }
    cats.forEach(function (c) {
      sxReattachTopicToString(c.topics);
      sxReattachTopicToString(c.parentTopics);
      (c.subcategories || []).forEach(function (sub) { sxReattachTopicToString(sub.topics); });
    });
    window.__SX_SKIN_WIDGETS = {};
    window.__SX_SKIN_DESCRIPTIONS = {};
    window.__SX_SKIN_TOPIC_COUNT = SEXCAPADES_TOPIC_COUNT;
    window.__SX_ACTIVE_SKIN = "sexcapades";
    window.__SX_SKIN_PREFIX = "sex";
    setManifestForSkin("sexcapades");
    activeSkin = "sexcapades";
    setAboutDescription("Sex.Capades.IO", null);
    /* Re-register widgets from the cached sexcapades.json. Synchronous
       when the file is already cached, async otherwise. registerWidgets
       replaces the placeholder topic count. */
    if (cache["sexcapades"]) { registerWidgets(cache["sexcapades"]); setSamples(cache["sexcapades"].samples); setScribe(cache["sexcapades"].scribe); setSceneSetter(cache["sexcapades"].sceneSetter); }
    else registerSexcapadesWidgets();
    /* Re-register the Sexcapades category names in the solver's
       expanded-branch set (same reason as in applySkin). */
    if (typeof window.__SX_SKIN_LAYOUT_SYNC === "function") window.__SX_SKIN_LAYOUT_SYNC();
  }

  function rerender() {
    var E = window.FlexcapadesEngine;
    if (E && E.Map) {
      E.Map.invalidateVault();
      var p = E.Map.render({ animate: false, forceRepaint: true });
      /* Re-fit the camera to the new map once the paint has landed — a
         plain render keeps the old zoom, which would leave the smaller
         Chem map tiny (or the restored Sexcapades map cropped). */
      return Promise.resolve(p).then(function () {
        if (typeof window.__SX_SKIN_REFIT === "function") window.__SX_SKIN_REFIT();
      });
    }
    return null;
  }

  /* Rebuild the open Hot List after a skin swap (2026-11-18, gate →
     Hot List defect): rerender() above repaints only the map, so a
     Hot List built at boot from the Sexcapades taxonomy — the
     #app/list boot route runs before this loader swaps the boot skin
     in — kept Sexcapades topics after the skin loaded. The bundle's
     __SX_REBUILD_OUTLINE hook (03d-outline.js) rebuilds the open
     dialog from the current taxonomy; a no-op when it is closed, and
     guarded here so an older bundle without the hook still loads
     skins fine. Called at the end of both loadSkin paths, after the
     layout apply, so the list rebuilds exactly once per swap. */
  function rebuildOutlineIfOpen() {
    try {
      if (typeof window.__SX_REBUILD_OUTLINE === "function") window.__SX_REBUILD_OUTLINE();
      /* The tick marks live in the header, not the topic rows, so they
         move even when the list itself is closed. */
      if (typeof window.__SX_SYNC_OUTLINE_LADDER === "function") window.__SX_SYNC_OUTLINE_LADDER();
    } catch (e) { /* the list keeps its pre-swap rows; the map is unaffected */ }
  }

  function setAboutDescription(displayName, aboutText) {
    /* Per-skin About description (2026-11-16): the skin JSON's `about`
       field holds the full description as the user reads it (name
       included). Render it with the name inside the .sx-brand span so
       setBrand keeps swapping the name on later switches; when a skin
       has no `about` field, restore the captured Sexcapades original
       (the static HTML copy — Sexcapades keeps its text unchanged). */
    var el = document.getElementById("appAboutDescription");
    if (!el) return;
    if (aboutOriginalHTML === null) aboutOriginalHTML = el.innerHTML;
    if (aboutText && typeof aboutText === "string") {
      var name = displayName || "";
      var tail = aboutText;
      if (name && tail.indexOf(name) === 0) tail = tail.slice(name.length);
      el.innerHTML = "";
      var span = document.createElement("span");
      span.className = "sx-brand";
      span.textContent = name;
      el.appendChild(span);
      el.appendChild(document.createTextNode(tail));
    } else if (aboutOriginalHTML) {
      el.innerHTML = aboutOriginalHTML;
    }
  }

  function setSamples(samples, skinId) {
    /* Per-skin archetypes and samples (2026-11-16): the skin JSON's
       `samples` section is the single source (the old inline
       __EMBEDDED_SAMPLE_PROFILES block is deleted from the entrypoints).
       Each entry carries a `kind` at the sample level — "archetype" or
       "sample" (Adam/Eve are samples; everything else is an archetype;
       entries with no kind default to archetype, so the fourteen
       vanilla skins need no kind field). The kind lives on the sample
       entry, NOT inside the import payload, so it never reaches the
       profile store. The object is mutated IN PLACE — never replaced —
       because 06d's Aw() caches the object on first use and reads keys
       from it at click time; replacing it would leave the cached
       promise pointing at the old set. Called under the same
       paint-generation bump as the taxonomy swap (the caller bumps
       first): the samples swap rides the same generation, so no second
       mid-paint swap can reintroduce the race the boot-race fix closed.
       A skin with no `samples` section leaves the menu empty — honest,
       not stale. Local samples (2026-11-18) merge in after the skin's
       own: only the ACTIVE skin's locals, so a Polis sample never shows
       on another skin. The rebuild reads the merged set, so locals show
       alongside the built-ins. */
    var target = window.SEXCAPADES_SAMPLE_PROFILES;
    if (!target || typeof target !== "object") { window.SEXCAPADES_SAMPLE_PROFILES = {}; target = window.SEXCAPADES_SAMPLE_PROFILES; }
    Object.keys(target).forEach(function (k) { delete target[k]; });
    var curSkin = skinId || currentSkinId();
    if (samples && typeof samples === "object") {
      Object.keys(samples).forEach(function (k) {
        var s = samples[k];
        if (s && typeof s === "object") {
          s.skin = s.skin || curSkin;
          if (s.payload && typeof s.payload === "object") {
            s.payload.skin = s.payload.skin || curSkin;
          }
        }
        target[k] = s;
      });
    }
    mergeLocalSamplesInto(target);
    rebuildSampleMenu(target);
    maybeLoadRosterFromHash();
  }

  var scribePanelOriginal = null;
  function setScribe(scribe) {
    /* Per-skin Scribe contract (2026-11-16): the skin JSON's `scribe`
       section is the single source for Scribe's genre and copy.
       Sexcapades keeps its erotic-story contract (genre "story");
       every vanilla skin is a stance/belief map, so Scribe writes an
       informed discussion between the stances (genre "discussion"),
       with the Explicitness slider relabeled as depth/rigor. The spec
       is exposed on window.__SX_SCRIBE for the prompt composer, the
       panel setter, and the Generate handler. The loader also swaps
       the panel's static copy at boot (setScribePanel), so the dialog
       reads in the active skin's genre before it is ever opened; the
       open handler (05-compatibility) re-applies the same strings
       with the single/multi cast form. A skin with no `scribe`
       section leaves the Sexcapades copy in place — honest, not stale. */
    window.__SX_SCRIBE = (scribe && typeof scribe === "object") ? scribe : null;
    setScribePanel(window.__SX_SCRIBE);
  }

  function setScribePanel(spec, isMulti) {
    /* Boot-time swap of the Scribe panel's static copy. The Sexcapades
       originals are captured on first call and restored whenever the
       active spec is a story (or absent), so switching back from a
       vanilla skin puts the erotic copy back byte-for-byte. The
       mode/intro lines take their SINGLE- or MULTI-profile form from
       the isMulti flag; the boot call passes none (single), and the
       dialog's open handler (05-compatibility Qd) re-applies with the
       cast's real form. The explicitness output label is re-rendered
       from the slider's current value, so a mid-value slider reads
       "4 · Rigorous" on a vanilla skin, not the stale Sexcapades
       level name. Exposed as window.__SX_SET_SCRIBE_PANEL so the
       open handler can re-apply the same swap. */
    var el = function (id) { return document.getElementById(id); };
    var mode = el("scribeModeDescription"), intro = el("scribeChoiceIntro"),
        detailsLabel = el("scribeDetailsLabel"), details = el("scribeDetails"),
        detailsHelp = el("scribeDetailsHelp"), lengthHelp = el("scribePageCountHelp"),
        summary = el("scribeModeSummary"), phasesLegend = el("scribePhasesLegend"),
        warmup = el("scribePhaseWarmupLabel"), main = el("scribePhaseMainLabel"),
        cooldown = el("scribePhaseCooldownLabel"), phasesHelp = el("scribePhasesHelp"),
        expLegend = el("scribeExplicitnessLegend"), expLevels = el("scribeExplicitnessLevels"),
        expOut = el("scribeExplicitnessLabel"), expSlider = el("scribeExplicitness"),
        expHelp = el("scribeExplicitnessHelp"), briefIntro = el("sceneBriefIntro"),
        cooldownStyle = el("scribePhaseCooldownStyle"),
        viewSwitchTip = el("mapListViewButton"), scribeTabTip = el("scribeTab"),
        scribeNavTip = el("scribeViewNavItem");
    if (!mode && !intro && !details) return;
    if (!scribePanelOriginal) {
      scribePanelOriginal = {
        mode: mode ? mode.textContent : "",
        intro: intro ? intro.textContent : "",
        detailsLabel: detailsLabel ? detailsLabel.innerHTML : "",
        detailsPlaceholder: details ? details.placeholder : "",
        detailsHelp: detailsHelp ? detailsHelp.textContent : "",
        lengthHelp: lengthHelp ? lengthHelp.textContent : "",
        summary: summary ? summary.textContent : "",
        phasesLegend: phasesLegend ? phasesLegend.textContent : "",
        warmup: warmup ? warmup.textContent : "",
        main: main ? main.textContent : "",
        cooldown: cooldown ? cooldown.textContent : "",
        phasesHelp: phasesHelp ? phasesHelp.textContent : "",
        expLegend: expLegend ? expLegend.textContent : "",
        expLevels: expLevels ? expLevels.innerHTML : "",
        expOut: expOut ? expOut.textContent : "",
        expSliderLabel: expSlider ? expSlider.getAttribute("aria-label") : "",
        expHelp: expHelp ? expHelp.textContent : "",
        briefIntro: briefIntro ? briefIntro.textContent : "",
        cooldownStyle: cooldownStyle ? cooldownStyle.innerHTML : "",
        viewSwitchTip: viewSwitchTip ? viewSwitchTip.getAttribute("data-ui-tooltip") : "",
        scribeTabTip: scribeTabTip ? scribeTabTip.getAttribute("data-ui-tooltip") : "",
        scribeNavTip: scribeNavTip ? scribeNavTip.getAttribute("data-ui-tooltip") : ""
      };
    }
    var o = scribePanelOriginal;
    var isDiscussion = !!(spec && spec.genre === "discussion");
    var p = (spec && spec.panel) || null,
        ph = (spec && spec.phases) || null,
        ex = (spec && spec.explicitness) || null;
    var text = function (node, value) { if (node) node.textContent = value; };
    // The mode/intro lines come from the spec's panel for BOTH genres
    // (the Sexcapades JSON carries the exact single/multi strings the
    // old setter used verbatim); the captured HTML originals are only
    // the fallback when a skin carries no `scribe` section at all.
    // (The HTML's static mode/intro text is a generic placeholder and
    // is NOT what the setter used to display — restoring it on
    // Sexcapades would regress the single/multi wording.)
    text(mode, p ? (isMulti && p.modeMulti ? p.modeMulti : p.modeSingle || o.mode) : o.mode);
    text(intro, p ? (isMulti && p.introMulti ? p.introMulti : p.introSingle || o.intro) : o.intro);
    if (detailsLabel) detailsLabel.innerHTML = isDiscussion ? "Discussion details <small>Optional</small>" : o.detailsLabel;
    if (details) details.placeholder = isDiscussion && p && p.detailsPlaceholder ? p.detailsPlaceholder : o.detailsPlaceholder;
    text(detailsHelp, isDiscussion && p && p.detailsHelp ? p.detailsHelp : o.detailsHelp);
    text(lengthHelp, isDiscussion && p && p.lengthHelp ? p.lengthHelp : o.lengthHelp);
    text(summary, isDiscussion && p && p.summary ? p.summary : o.summary);
    text(phasesLegend, isDiscussion && ph && ph.legend ? ph.legend : o.phasesLegend);
    text(warmup, isDiscussion && ph && ph.warmup ? ph.warmup : o.warmup);
    text(main, isDiscussion && ph && ph.main ? ph.main : o.main);
    text(cooldown, isDiscussion && ph && ph.cooldown ? ph.cooldown : o.cooldown);
    text(phasesHelp, isDiscussion && ph && ph.help ? ph.help : o.phasesHelp);
    text(expLegend, isDiscussion && ex && ex.label ? ex.label : o.expLegend);
    text(expHelp, isDiscussion && ex && ex.help ? ex.help : o.expHelp);
    text(briefIntro, isDiscussion && p && p.downloadIntro ? p.downloadIntro : o.briefIntro);
    // The three Scribe tooltips outside the dialog (view switch, Scribe
    // tab, view-nav item) carry the same Literotica copy; swap them
    // with the discussion wording on vanilla skins.
    var tip = function (node, value) { if (node) node.setAttribute("data-ui-tooltip", value); };
    tip(viewSwitchTip, isDiscussion ? "Switch views: Hypermap for the visual hypermap, Hot List for rating topic by topic, Scene Setter for a moderated discussion plan, Scene Sentinel for safe signals, check-in timers, and emergency contacts, or Scribe for an informed discussion between the recorded stances." : o.viewSwitchTip);
    tip(scribeTabTip, isDiscussion ? "Write an informed discussion between the recorded stances from one profile, or from a multi-select." : o.scribeTabTip);
    tip(scribeNavTip, isDiscussion ? "Generate an informed discussion between the recorded stances, based on selected profiles." : o.scribeNavTip);
    if (expLevels) {
      if (isDiscussion && ex && ex.levels) {
        expLevels.innerHTML = ex.levels.map(function (lv, i) {
          return "<span>" + (i + 1) + " · " + lv + "</span>";
        }).join("");
      } else expLevels.innerHTML = o.expLevels;
    }
    if (cooldownStyle) {
      if (isDiscussion && ph && ph.cooldownStyles) {
        cooldownStyle.innerHTML = ph.cooldownStyles.map(function (st, i) {
          return "<option" + (i === 0 ? " selected=\"\"" : "") + " value=\"" + st + "\">" + st + "</option>";
        }).join("");
      } else cooldownStyle.innerHTML = o.cooldownStyle;
    }
    if (expSlider) expSlider.setAttribute("aria-label", isDiscussion && ex && ex.label ? ex.label + " level" : o.expSliderLabel);
    if (expOut) {
      if (isDiscussion && ex && ex.levels && expSlider) {
        var v = Math.max(1, Math.min(5, parseInt(expSlider.value, 10) || 1));
        expOut.textContent = v + " · " + ex.levels[v - 1];
      } else expOut.textContent = o.expOut;
    }
  }
  // The open handler (05-compatibility Qd) re-applies this swap with
  // the cast's real single/multi form.
  window.__SX_SET_SCRIBE_PANEL = setScribePanel;

  var sceneSetterPanelOriginal = null;
  function setSceneSetter(sceneSetter) {
    /* Per-skin Scene Setter contract (2026-11-16): the skin JSON's
       `sceneSetter` section is the single source for Scene Setter's
       genre and copy. Sexcapades keeps its play-checklist contract
       (genre "play"); every vanilla skin is a stance/belief map, so
       Scene Setter moderates a discussion between the stances (genre
       "moderation"), with the play guide becoming a discussion plan
       and the negotiation guide becoming a discussion agreement. The
       spec is exposed on window.__SX_SETTER for the prompt composer,
       the panel setter, and the Generate handler. The loader also
       swaps the panel's static copy at boot (setSceneSetterPanel), so
       the dialog reads in the active skin's genre before it is ever
       opened. A skin with no `sceneSetter` section leaves the
       Sexcapades copy in place — honest, not stale. The subtitle is
       NOT swapped here: the dialog's open handler (06d) sets it with
       the participants' names plus the spec's subtitleSuffix. The
       Play buttons and the Generate label are NOT swapped here either:
       patches.js rewrites them on a 500ms sync (syncSentinelPlayStatus
       / setterSyncGenerateLabel), so they branch on the spec there. */
    window.__SX_SETTER = (sceneSetter && typeof sceneSetter === "object") ? sceneSetter : null;
    setSceneSetterPanel(window.__SX_SETTER);
  }

  function setSceneSetterPanel(spec) {
    /* Boot-time swap of the Scene Setter panel's static copy. The
       Sexcapades originals are captured on first call and restored
       whenever the active spec is a play guide (or absent), so
       switching back from a vanilla skin puts the play-checklist copy
       back byte-for-byte. The view-switch tooltip is NOT swapped here:
       setScribePanel owns it (it names both Scribe and Scene Setter)
       and already carries the moderated-discussion wording on vanilla
       skins. Exposed as window.__SX_SET_SETTER_PANEL so the dialog's
       open handler can re-apply the same swap. */
    var el = function (id) { return document.getElementById(id); };
    var detailsLabel = el("setterDetailsLabel"), details = el("setterDetails"),
        detailsHelp = el("setterDetailsHelp"),
        playGuideLegend = el("setterPlayGuideLegend"), playGuideHelp = el("setterLengthHelp"),
        negotiationLegend = el("setterNegotiationLegend"), negotiationHelp = el("setterNegotiationLengthHelp"),
        phasesLegend = el("setterPhasesLegend"),
        warmup = el("setterPhaseWarmupLabel"), main = el("setterPhaseMainLabel"),
        cooldown = el("setterPhaseCooldownLabel"), phasesHelp = el("setterPhasesHelp"),
        cooldownStyle = el("setterPhaseCooldownStyle"),
        outputsTitle = el("setterOutputsTitle"), outputsIntro = el("setterOutputsIntro"),
        negotiationTitle = el("negotiationGuideOutputTitle"), negotiationDesc = el("negotiationGuideOutputDesc"),
        playGuideTitle = el("playGuideOutputTitle"), playGuideDesc = el("playGuideOutputDesc"),
        copyNegotiation = el("copyNegotiationGuide"), downloadNegotiation = el("downloadNegotiationGuide"),
        copyPlayGuide = el("copyNegotiation"), downloadPlayGuide = el("downloadPlayGuide"),
        aiNote = el("setterAiNote"), playGuideText = el("setterPlayGuideText"),
        openNegotiation = el("openNegotiation"), viewNav = el("setterViewNavItem"),
        legendRow = el("legendSceneSetterRow");
    if (!details && !playGuideLegend && !negotiationTitle) return;
    if (!sceneSetterPanelOriginal) {
      sceneSetterPanelOriginal = {
        detailsLabel: detailsLabel ? detailsLabel.innerHTML : "",
        detailsPlaceholder: details ? details.placeholder : "",
        detailsHelp: detailsHelp ? detailsHelp.textContent : "",
        playGuideLegend: playGuideLegend ? playGuideLegend.textContent : "",
        playGuideHelp: playGuideHelp ? playGuideHelp.textContent : "",
        negotiationLegend: negotiationLegend ? negotiationLegend.textContent : "",
        negotiationHelp: negotiationHelp ? negotiationHelp.textContent : "",
        phasesLegend: phasesLegend ? phasesLegend.textContent : "",
        warmup: warmup ? warmup.textContent : "",
        main: main ? main.textContent : "",
        cooldown: cooldown ? cooldown.textContent : "",
        phasesHelp: phasesHelp ? phasesHelp.textContent : "",
        cooldownStyle: cooldownStyle ? cooldownStyle.innerHTML : "",
        outputsTitle: outputsTitle ? outputsTitle.textContent : "",
        outputsIntro: outputsIntro ? outputsIntro.textContent : "",
        negotiationTitle: negotiationTitle ? negotiationTitle.textContent : "",
        negotiationDesc: negotiationDesc ? negotiationDesc.innerHTML : "",
        playGuideTitle: playGuideTitle ? playGuideTitle.textContent : "",
        playGuideDesc: playGuideDesc ? playGuideDesc.innerHTML : "",
        copyNegotiation: copyNegotiation ? copyNegotiation.textContent : "",
        downloadNegotiation: downloadNegotiation ? downloadNegotiation.textContent : "",
        copyPlayGuide: copyPlayGuide ? copyPlayGuide.textContent : "",
        downloadPlayGuide: downloadPlayGuide ? downloadPlayGuide.textContent : "",
        aiNote: aiNote ? aiNote.innerHTML : "",
        playGuideTextPlaceholder: playGuideText ? playGuideText.placeholder : "",
        openNegotiationTip: openNegotiation ? openNegotiation.getAttribute("data-ui-tooltip") : "",
        viewNavTip: viewNav ? viewNav.getAttribute("data-ui-tooltip") : "",
        legendRow: legendRow ? legendRow.innerHTML : ""
      };
    }
    var o = sceneSetterPanelOriginal;
    var isModeration = !!(spec && spec.genre === "moderation");
    var p = (spec && spec.panel) || null,
        ph = (spec && spec.phases) || null;
    var text = function (node, value) { if (node) node.textContent = value; };
    var html = function (node, value) { if (node) node.innerHTML = value; };
    if (detailsLabel) detailsLabel.innerHTML = isModeration && p && p.detailsLabel ? p.detailsLabel : o.detailsLabel;
    if (details) details.placeholder = isModeration && p && p.detailsPlaceholder ? p.detailsPlaceholder : o.detailsPlaceholder;
    text(detailsHelp, isModeration && p && p.detailsHelp ? p.detailsHelp : o.detailsHelp);
    text(playGuideLegend, isModeration && p && p.playGuideLegend ? p.playGuideLegend : o.playGuideLegend);
    text(playGuideHelp, isModeration && p && p.playGuideHelp ? p.playGuideHelp : o.playGuideHelp);
    text(negotiationLegend, isModeration && p && p.negotiationLegend ? p.negotiationLegend : o.negotiationLegend);
    text(negotiationHelp, isModeration && p && p.negotiationHelp ? p.negotiationHelp : o.negotiationHelp);
    text(phasesLegend, isModeration && ph && ph.legend ? ph.legend : o.phasesLegend);
    text(warmup, isModeration && ph && ph.warmup ? ph.warmup : o.warmup);
    text(main, isModeration && ph && ph.main ? ph.main : o.main);
    text(cooldown, isModeration && ph && ph.cooldown ? ph.cooldown : o.cooldown);
    text(phasesHelp, isModeration && ph && ph.help ? ph.help : o.phasesHelp);
    text(outputsTitle, isModeration && p && p.outputsTitle ? p.outputsTitle : o.outputsTitle);
    text(outputsIntro, isModeration && p && p.outputsIntro ? p.outputsIntro : o.outputsIntro);
    text(negotiationTitle, isModeration && p && p.negotiationTitle ? p.negotiationTitle : o.negotiationTitle);
    html(negotiationDesc, isModeration && p && p.negotiationDesc ? p.negotiationDesc : o.negotiationDesc);
    text(playGuideTitle, isModeration && p && p.playGuideTitle ? p.playGuideTitle : o.playGuideTitle);
    html(playGuideDesc, isModeration && p && p.playGuideDesc ? p.playGuideDesc : o.playGuideDesc);
    text(copyNegotiation, isModeration && p && p.copyNegotiationGuide ? p.copyNegotiationGuide : o.copyNegotiation);
    text(downloadNegotiation, isModeration && p && p.downloadNegotiationGuide ? p.downloadNegotiationGuide : o.downloadNegotiation);
    text(copyPlayGuide, isModeration && p && p.copyPlayGuide ? p.copyPlayGuide : o.copyPlayGuide);
    text(downloadPlayGuide, isModeration && p && p.downloadPlayGuide ? p.downloadPlayGuide : o.downloadPlayGuide);
    html(aiNote, isModeration && p && p.aiNote ? p.aiNote : o.aiNote);
    if (playGuideText) playGuideText.placeholder = isModeration && p && p.playGuideTextPlaceholder ? p.playGuideTextPlaceholder : o.playGuideTextPlaceholder;
    var tip = function (node, value) { if (node) node.setAttribute("data-ui-tooltip", value); };
    tip(openNegotiation, isModeration && p && p.openNegotiationTip ? p.openNegotiationTip : o.openNegotiationTip);
    tip(viewNav, isModeration && p && p.viewNavTip ? p.viewNavTip : o.viewNavTip);
    html(legendRow, isModeration && p && p.legendRow ? p.legendRow : o.legendRow);
    if (cooldownStyle) {
      if (isModeration && ph && ph.cooldownStyles) {
        cooldownStyle.innerHTML = ph.cooldownStyles.map(function (st, i) {
          return "<option" + (i === 0 ? " selected=\"\"" : "") + " value=\"" + st + "\">" + st + "</option>";
        }).join("");
      } else cooldownStyle.innerHTML = o.cooldownStyle;
    }
    // The Generate button's label is JS-managed by patches.js
    // (setterSyncGenerateLabel), so the copy swap above does not
    // reach it — re-sync it here on every skin switch. patches.js
    // loads before this file and exposes the sync on window; the
    // guard covers a boot where it has not run yet.
    if (typeof window.__sxSetterSyncGenerateLabel === "function") window.__sxSetterSyncGenerateLabel();
  }
  window.__SX_SET_SETTER_PANEL = setSceneSetterPanel;

  function rebuildSampleMenu(samples) {
    /* Rebuild the archetypes and samples menus from the active skin's
       samples — two separate submenus (Jason, 2026-11-18): archetype
       entries go into #profileArchetypeMenu, sample entries
       (kind === "sample") ONLY into #profileSampleMenu, so the Samples
       menu never shows archetypes. Each menu IS its group now, so no
       in-menu headings. The Samples entry/submenu shows ONLY when the
       skin has samples (Jason, 2026-11-18 — Sexcapades, Adam/Eve, for
       now; there are no samples yet for other maps, so on vanilla
       skins the entry does not show). The rebuild runs per skin (boot
       and every skin switch), so each skin's Archetypes menu holds
       that skin's own archetypes (Sexcapades 18; vanilla skins 4–8
       each). The static HTML buttons are the Sexcapades set (the
       parse-time fallback); every skin-set rebuilds them. The click
       handler in 06d is delegated on each menu element and matches
       [data-sample-profile], and Ew() re-queries the buttons on every
       open, so rebuilt buttons behave exactly like the static ones.
       The <strong> is the archetype label (the profile's name IS its
       archetype) or the sample's name (Adam Peasant, Eve Vale — real
       people, not archetypes). An <img> is included only when the
       sample carries a photo (Adam/Eve only — archetypes have none;
       Mw() resolves null without one and the load skips photos). If
       #profileArchetypeMenu is absent (older HTML), fall back to the
       old single-menu layout with both labeled groups in
       #profileSampleMenu — and the Samples entry stays, since it is
       the only way to reach the archetypes there. */
    var menu = document.getElementById("profileSampleMenu");
    var archMenu = document.getElementById("profileArchetypeMenu");
    var sampleEntry = document.getElementById("loadSampleProfileChoice");
    if (!menu) return;
    menu.querySelectorAll(".sample-profile-choice, .sample-profile-item, .sample-menu-group").forEach(function (b) { b.remove(); });
    if (archMenu) archMenu.querySelectorAll(".sample-profile-choice, .sample-profile-item, .sample-menu-group").forEach(function (b) { b.remove(); });
    function hideSamplesEntry() {
      if (sampleEntry) { sampleEntry.hidden = true; sampleEntry.setAttribute("aria-expanded", "false"); }
      if (!menu.hidden) { menu.hidden = true; menu.classList.remove("is-submenu"); }
    }
    if (!samples || typeof samples !== "object") { if (archMenu) hideSamplesEntry(); return; }
    var archetypes = [], samplesList = [];
    Object.keys(samples).forEach(function (key) {
      var entry = samples[key];
      if (!entry || !entry.payload || !entry.payload.ratings) return;
      if (entry.kind === "sample") samplesList.push(key);
      else archetypes.push(key);
    });
    function addGroup(target, heading, keys) {
      if (!keys.length) return;
      if (heading) {
        var label = document.createElement("div");
        label.className = "sample-menu-group";
        label.textContent = heading;
        target.appendChild(label);
      }
      keys.forEach(function (key) {
        var entry = samples[key];
        var count = entry.count || Object.keys(entry.payload.ratings).length;
        var item = document.createElement("div");
        item.className = "sample-profile-item";
        var btn = document.createElement("button");
        btn.className = "sample-profile-choice";
        btn.type = "button";
        btn.setAttribute("role", "menuitem");
        btn.setAttribute("data-sample-profile", key);
        var isArchetype = entry.kind !== "sample";
        btn.setAttribute("data-sample-name", entry.name || key);
        btn.setAttribute("data-sample-count", String(count));
        btn.setAttribute("data-sample-skin", entry.skin || (entry.payload && entry.payload.skin) || currentSkinId());
        if (entry.photo || entry.emblem) {
          var img = document.createElement("img");
          img.alt = "";
          img.decoding = "async";
          img.loading = "lazy";
          img.src = entry.photo || entry.emblem;
          btn.appendChild(img);
        }
        var strong = document.createElement("strong");
        strong.textContent = entry.name || key;
        btn.appendChild(strong);
        if (isArchetype) {
          /* Archetypes (2026-11-21, Jason): list just the name with the
             description contained in a hover tip (data-ui-tooltip).
             No inline topic count, no inline about paragraphs, no inline links. */
          if (entry.about) {
            btn.setAttribute("data-ui-tooltip", entry.about);
            btn.setAttribute("data-tooltip-name", entry.name || key);
            btn.setAttribute("data-tooltip-definition", entry.about);
            btn.setAttribute("data-tooltip-tap-first", "");
          }
        } else {
          var small = document.createElement("small");
          small.textContent = count + " rated topics";
          btn.appendChild(small);
          /* Samples (2026-11-22, Jason): the about rides in the same
             hover tip archetypes use, not an inline paragraph. */
          if (entry.about) {
            btn.setAttribute("data-ui-tooltip", entry.about);
            btn.setAttribute("data-tooltip-name", entry.name || key);
            btn.setAttribute("data-tooltip-definition", entry.about);
            btn.setAttribute("data-tooltip-tap-first", "");
          }
        }
        item.appendChild(btn);
        /* Local sample (2026-11-18): a Remove button under the load
           button, so a chapter roster doesn't accumulate junk. It sits
           OUTSIDE the load <button> (a button inside a button is
           invalid HTML) and carries its own data key; the click handler
           lives in 06d next to the sample loader, which also owns the
           toast. */
        if (entry.local) {
          var removeBtn = document.createElement("button");
          removeBtn.className = "sample-local-remove";
          removeBtn.type = "button";
          removeBtn.setAttribute("data-remove-local-sample", key);
          removeBtn.setAttribute("aria-label", "Remove " + (entry.name || key) + " from local samples");
          removeBtn.textContent = "Remove from samples";
          item.appendChild(removeBtn);
        }
        /* Abouts live in the hover tip for BOTH kinds now (samples joined
           archetypes 2026-11-22, Jason); only samples render inline links. */
        if (!isArchetype && entry.links && entry.links.length) {
          var links = document.createElement("div");
          links.className = "sample-profile-links";
          entry.links.forEach(function (l) {
            if (!l || !l.url) return;
            var a = document.createElement("a");
            a.href = l.url;
            a.textContent = l.label || l.url;
            a.target = "_blank";
            a.rel = "noopener";
            links.appendChild(a);
          });
          if (links.childNodes.length) item.appendChild(links);
        }
        target.appendChild(item);
      });
    }
    /* Roster entries (2026-11-22, Jason's ruling): each roster gets
       its OWN entry in the add menu, beside Archetypes and Samples —
       not a heading inside the Samples menu. A user carries at most a
       few rosters, so the main menu stays short, and each roster's
       submenu holds only its members. Membership comes from the
       roster tag on an entry, whether the entry is built into the
       skin (the Friday Knights ship as Questcapades' demo roster) or
       imported as a local pack; an imported member shadows a built-in
       of the same name in the same roster (the fresher copy wins).
       The menus are created here and wired through 06d's
       __SX_WIRE_SAMPLE_SUBMENU hook, so they behave exactly like the
       static submenus; without the hook (older bundle), rosters fall
       back to headed groups inside the Samples menu. */
    var plainSamples = [], rosterGroups = {}, rosterOrder = [], localRosterNames = {};
    samplesList.forEach(function (key) {
      var e = samples[key];
      if (e && e.rosterKey && e.local) {
        (localRosterNames[e.rosterKey] = localRosterNames[e.rosterKey] || {})[String(e.name || "").trim().toLowerCase()] = true;
      }
    });
    /* Palimpsest stacks (2026-11-22; kind-agnostic the same night,
       Jason's ruling that stacked entries are archetypes, not
       samples): an entry of EITHER kind may carry stack fields
       (stack / stackKey / date) marking it as one dated layer of a
       single profile across time — a party's platforms, a creed's
       documents. Stacked entries never render as flat rows: each
       stack collapses into ONE parent entry in the menu matching
       its members' kind (archetype stacks in the Archetypes menu,
       sample stacks in the Samples menu) at the position of its
       first layer within that kind's ordering; the parent opens a
       submenu of the layers in date order (see syncStackMenus).
       Stacks get NO add-menu entry of their own (Jason, 2026-11-22:
       they live only under Archetypes/Samples — the dual listing
       as loadStackChoice rows in the add menu was removed). A
       stack's kind is its first layer's kind — a stack's layers
       all share one. */
    var plainArchetypes = [];
    var stackGroups = {}, stackOrder = [], archStackOrder = [], sampleStackOrder = [];
    function stackKeyOf(e) { return e && (e.stackKey || e.stack) ? String(e.stackKey || e.stack) : null; }
    function noteStack(key, e) {
      var sk = stackKeyOf(e);
      if (!sk) return false;
      if (!stackGroups[sk]) {
        stackGroups[sk] = { name: e.stack || "Stack", keys: [], kind: e.kind === "sample" ? "sample" : "archetype" };
        stackOrder.push(sk);
        (stackGroups[sk].kind === "sample" ? sampleStackOrder : archStackOrder).push(sk);
      }
      stackGroups[sk].keys.push(key);
      return true;
    }
    samplesList.forEach(function (key) {
      var e = samples[key];
      if (e && e.rosterKey) {
        if (!e.local && localRosterNames[e.rosterKey] && localRosterNames[e.rosterKey][String(e.name || "").trim().toLowerCase()]) return;
        if (!rosterGroups[e.rosterKey]) { rosterGroups[e.rosterKey] = { name: e.roster || "Roster", keys: [] }; rosterOrder.push(e.rosterKey); }
        rosterGroups[e.rosterKey].keys.push(key);
      } else if (!noteStack(key, e)) plainSamples.push(key);
    });
    archetypes.forEach(function (key) {
      if (!noteStack(key, samples[key])) plainArchetypes.push(key);
    });
    stackOrder.forEach(function (sk) {
      stackGroups[sk].sorted = stackGroups[sk].keys.slice().sort(function (a, b) {
        var va = stackDateValue(samples[a]), vb = stackDateValue(samples[b]);
        return va < vb ? -1 : va > vb ? 1 : 0;
      });
    });
    var stackMenusOk = typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function";
    /* Render one kind's menu with a stack parent interleaved at the
       position of each stack's first layer within that kind's
       ordering. Only used when that kind has stacks and the submenu
       hook is live; otherwise the flat path runs exactly as before
       (and syncStackMenus falls back to headed groups in the
       kind-appropriate menu, the roster fallback shape). */
    function renderKindMenu(target, keys, withHeadings, heading) {
      var renderedStacks = {};
      if (withHeadings && keys.some(function (k) { var e = samples[k]; return e && !e.rosterKey; })) {
        var label = document.createElement("div");
        label.className = "sample-menu-group";
        label.textContent = heading;
        target.appendChild(label);
      }
      keys.forEach(function (key) {
        var e = samples[key];
        if (!e || e.rosterKey) return;
        var sk = stackKeyOf(e);
        if (sk) {
          if (renderedStacks[sk]) return;
          renderedStacks[sk] = true;
          target.appendChild(ensureStackEls(sk, target).item);
        } else addGroup(target, null, [key]);
      });
    }
    if (archMenu) {
      if (archStackOrder.length && stackMenusOk) renderKindMenu(archMenu, archetypes, false, null);
      else addGroup(archMenu, null, plainArchetypes);
      if (sampleStackOrder.length && stackMenusOk) renderKindMenu(menu, samplesList, false, null);
      else addGroup(menu, null, plainSamples);
      /* The Samples entry hides when the skin has no sample-kind
         entries at all (Polis/Fores after the archetype ruling);
         with samples present, the previous rule stands — the entry
         shows only when the Samples menu has plain rows or stack
         parents of its own (roster-only skins keep it hidden, their
         rosters living in the add menu). */
      if (!samplesList.length) hideSamplesEntry();
      else if (!plainSamples.length && !sampleStackOrder.length) hideSamplesEntry();
      else if (sampleEntry) sampleEntry.hidden = false;
    } else {
      if (archStackOrder.length && stackMenusOk) renderKindMenu(menu, archetypes, true, "Archetypes");
      else addGroup(menu, "Archetypes", archetypes);
      if (sampleStackOrder.length && stackMenusOk) renderKindMenu(menu, samplesList, true, "Samples");
      else addGroup(menu, "Samples", plainSamples);
      if (sampleEntry) sampleEntry.hidden = false;
    }
    syncRosterMenus(rosterGroups, rosterOrder, addGroup, menu);
    syncStackMenus(stackGroups, stackOrder, addGroup, menu, archMenu);
    ensureRosterAddActions();
  }

  /* Roster submenu elements, created by rebuildSampleMenu and kept in
     this registry across rebuilds (keyed by roster key). Vanished
     rosters (skin switch, roster replaced away) lose their elements. */
  var rosterMenuEls = {};
  function syncRosterMenus(rosterGroups, rosterOrder, addGroup, samplesMenu) {
    var addMenu = document.getElementById("profileAddMenu");
    var wire = (typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function") ? window.__SX_WIRE_SAMPLE_SUBMENU : null;
    Object.keys(rosterMenuEls).forEach(function (rk) {
      if (!rosterGroups[rk]) {
        rosterMenuEls[rk].entry.remove();
        rosterMenuEls[rk].menu.remove();
        var reg = window.__SX_SAMPLE_SUBMENUS || [];
        var ix = reg.indexOf(rosterMenuEls[rk].menu);
        if (ix >= 0) reg.splice(ix, 1);
        delete rosterMenuEls[rk];
      }
    });
    if (!wire || !addMenu || !samplesMenu) {
      /* Fallback (older bundle): headed groups inside the Samples menu. */
      rosterOrder.forEach(function (rk) { addGroup(samplesMenu, rosterGroups[rk].name, rosterGroups[rk].keys); });
      return;
    }
    var savedChoice = document.getElementById("loadSavedProfileChoice");
    rosterOrder.forEach(function (rk) {
      var group = rosterGroups[rk];
      var els = rosterMenuEls[rk];
      if (!els) {
        var entry = document.createElement("button");
        entry.type = "button";
        entry.id = "loadRosterChoice-" + rk;
        entry.setAttribute("role", "menuitem");
        entry.setAttribute("aria-haspopup", "menu");
        entry.setAttribute("aria-expanded", "false");
        var rmenu = document.createElement("div");
        rmenu.id = "profileRosterMenu-" + rk;
        rmenu.className = "profile-add-menu profile-sample-menu";
        rmenu.setAttribute("role", "menu");
        rmenu.hidden = true;
        var back = document.createElement("button");
        back.type = "button";
        back.className = "sample-menu-back";
        back.setAttribute("role", "menuitem");
        back.textContent = "\u2039 Back";
        rmenu.appendChild(back);
        addMenu.insertBefore(entry, savedChoice || null);
        samplesMenu.parentElement.appendChild(rmenu);
        /* Register with 06d's close/refresh paths (Sw, Ew, Ow, Pw all
           consult window.__SX_SAMPLE_SUBMENUS); __sxTrigger lets Sw
           reset this entry's aria-expanded when it closes the menu. */
        rmenu.__sxTrigger = entry;
        (window.__SX_SAMPLE_SUBMENUS = window.__SX_SAMPLE_SUBMENUS || []).push(rmenu);
        wire(entry, rmenu, back);
        els = rosterMenuEls[rk] = { entry: entry, menu: rmenu };
      }
      els.entry.textContent = group.name + "\u2026";
      els.menu.setAttribute("aria-label", group.name);
      els.menu.querySelectorAll(".sample-profile-choice, .sample-profile-item, .sample-menu-group").forEach(function (b) { b.remove(); });
      addGroup(els.menu, null, group.keys);
    });
  }
  /* A layer's date sort value: numeric years ascending, "present"
     (the stack's current layer) always last. */
  function stackDateValue(entry) {
    var d = entry && entry.date != null ? String(entry.date).trim() : "";
    if (!d || d.toLowerCase() === "present") return Infinity;
    var n = parseFloat(d);
    return isNaN(n) ? Infinity : n;
  }

  /* Stack submenu elements, created by rebuildSampleMenu and kept
     in this registry across rebuilds (keyed by stack key) — the
     rosterMenuEls pattern. Each stack owns ONE submenu, opened from
     its parent row inside its kind's menu (Archetypes or Samples);
     stacks have no add-menu entry (Jason, 2026-11-22: they live
     only under Archetypes/Samples). The submenu is wired through
     06d's __SX_WIRE_SAMPLE_SUBMENU hook and registered on
     window.__SX_SAMPLE_SUBMENUS, so every close/refresh path in 06d
     (Sw, Ew, Ow, Pw) treats it exactly like the roster submenus —
     the 2026-11-22 roster dismiss fix applies to it by
     construction. */
  var stackMenuEls = {};
  function ensureStackEls(sk, samplesMenu) {
    var els = stackMenuEls[sk];
    if (els) return els;
    var wire = (typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function") ? window.__SX_WIRE_SAMPLE_SUBMENU : null;
    var item = document.createElement("div");
    item.className = "sample-profile-item";
    var subEntry = document.createElement("button");
    subEntry.type = "button";
    /* NOT .sample-profile-choice: rebuildSampleMenu's cleanup
       removes every matching element in the Samples menu one by
       one, which would strip this button out of its (also removed,
       then re-appended) wrapper item. With only .sample-stack-choice
       (styled like a sample choice in app.css), the wrapper alone
       matches, leaves intact, and is re-appended with the button
       still inside. */
    subEntry.className = "sample-stack-choice";
    subEntry.setAttribute("role", "menuitem");
    subEntry.setAttribute("aria-haspopup", "menu");
    subEntry.setAttribute("aria-expanded", "false");
    var subStrong = document.createElement("strong");
    var subSmall = document.createElement("small");
    subEntry.appendChild(subStrong);
    subEntry.appendChild(subSmall);
    item.appendChild(subEntry);
    var subMenu = document.createElement("div");
    subMenu.id = "profileStackMenu-" + sk;
    subMenu.className = "profile-add-menu profile-sample-menu";
    subMenu.setAttribute("role", "menu");
    subMenu.hidden = true;
    var back = document.createElement("button");
    back.type = "button";
    back.className = "sample-menu-back";
    back.setAttribute("role", "menuitem");
    back.textContent = "\u2039 Back";
    subMenu.appendChild(back);
    if (samplesMenu && samplesMenu.parentElement) {
      samplesMenu.parentElement.appendChild(subMenu);
    }
    /* Register with 06d's close/refresh paths; __sxTrigger lets Sw
       reset the parent row's aria-expanded when it closes the menu. */
    subMenu.__sxTrigger = subEntry;
    (window.__SX_SAMPLE_SUBMENUS = window.__SX_SAMPLE_SUBMENUS || []).push(subMenu);
    if (wire) wire(subEntry, subMenu, back);
    els = stackMenuEls[sk] = { item: item, subEntry: subEntry, subStrong: subStrong, subSmall: subSmall, subMenu: subMenu };
    return els;
  }

  function syncStackMenus(stackGroups, stackOrder, addGroup, samplesMenu, archMenu) {
    var wire = (typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function") ? window.__SX_WIRE_SAMPLE_SUBMENU : null;
    Object.keys(stackMenuEls).forEach(function (sk) {
      if (!stackGroups[sk]) {
        var els = stackMenuEls[sk];
        els.item.remove();
        els.subMenu.remove();
        var reg = window.__SX_SAMPLE_SUBMENUS || [];
        [els.subMenu].forEach(function (m) {
          var ix = reg.indexOf(m);
          if (ix >= 0) reg.splice(ix, 1);
        });
        delete stackMenuEls[sk];
      }
    });
    if (!wire || !samplesMenu) {
      /* Fallback (no submenu hook): headed groups of layers, in
         date order, inside the menu matching each stack's kind —
         the Samples menu for sample stacks, the Archetypes menu
         for archetype stacks (the Samples menu again when the
         shell has no separate Archetypes menu). */
      stackOrder.forEach(function (sk) {
        var g = stackGroups[sk];
        addGroup(g.kind === "sample" ? samplesMenu : (archMenu || samplesMenu), g.name, g.sorted);
      });
      return;
    }
    stackOrder.forEach(function (sk) {
      var group = stackGroups[sk];
      var els = ensureStackEls(sk, samplesMenu);
      els.subStrong.textContent = group.name;
      els.subSmall.textContent = group.sorted.length + " dated layers";
      [els.subMenu].forEach(function (m) {
        m.setAttribute("aria-label", group.name);
        m.querySelectorAll(".sample-profile-choice, .sample-profile-item, .sample-menu-group").forEach(function (b) { b.remove(); });
        addGroup(m, null, group.sorted);
        /* Load whole stack: every layer as its own profile tab, in
           date order, through the same sample-load path a layer
           click uses (06d's __SX_LOAD_SAMPLES hook, which runs the
           menu-click loader once per layer, in order). */
        var item = document.createElement("div");
        item.className = "sample-profile-item";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sample-profile-choice sample-stack-load-all";
        btn.setAttribute("role", "menuitem");
        var strong = document.createElement("strong");
        strong.textContent = "Load whole stack";
        var small = document.createElement("small");
        small.textContent = group.sorted.length + " layers \u00b7 oldest first";
        btn.appendChild(strong);
        btn.appendChild(small);
        btn.addEventListener("click", function () {
          if (typeof window.__SX_LOAD_SAMPLES === "function") window.__SX_LOAD_SAMPLES(m, group.sorted);
          else group.sorted.forEach(function (k) {
            var b = m.querySelector('[data-sample-profile="' + k + '"]');
            if (b && !b.disabled) b.click();
          });
        });
        item.appendChild(btn);
        m.appendChild(item);
      });
    });
  }

  /* Export/Import roster pack live in the add menu itself (2026-11-22):
     they add profiles, they are reachable even on a map whose Samples
     entry is hidden, and they never need a submenu. Created once. */
  function ensureRosterAddActions() {
    var addMenu = document.getElementById("profileAddMenu");
    if (!addMenu || document.getElementById("exportRosterChoice")) return;
    [["exportRosterChoice", "Export roster pack", exportRosterPack], ["importRosterChoice", "Import roster pack", pickRosterFile]].forEach(function (spec) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = spec[0];
      btn.setAttribute("role", "menuitem");
      btn.textContent = spec[1];
      btn.addEventListener("click", spec[2]);
      addMenu.appendChild(btn);
    });
  }

  /* Brand text comes in two forms (Jason's ruling, 2026-11-23): the
     full dotted domain ("Sex.Capades.IO") and a compact form — the
     skin's short name plus "*" standing in for "capades" ("Sex*",
     "Polis*") — for narrow headers. Title-bar brand buttons carry
     both forms in .sx-brand-full / .sx-brand-compact spans and the
     CSS width swap picks which one shows, so a resize needs no
     re-render; this only keeps both spans' text current. A brand
     element without the spans (the About copy's inline span, the
     gate's own span) still gets the full name as plain text. */
  function applyBrandText(el, full, compact) {
    var f = el.querySelector(".sx-brand-full");
    var c = el.querySelector(".sx-brand-compact");
    if (f || c) {
      if (f) f.textContent = full;
      if (c) c.textContent = compact;
    } else {
      el.textContent = full;
    }
  }

  function setBrand(skinId, displayName) {
    var prefix = skinPrefixFor(skinId);
    var cap = prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1)) : "";
    var dotted = cap ? (cap + ".Capades.IO") : "Sex.Capades.IO";
    var compact = cap ? (cap + "*") : "*";
    var name = dotted;
    var brand = dotted;
    document.title = dotted + (skinId === "sexcapades" ? "" : " — " + (displayName || skinId));
    var btn = document.getElementById("openAppAbout");
    if (btn) applyBrandText(btn, name, compact);
    var about = document.getElementById("appAboutTitle");
    if (about) {
      about.textContent = "";
      about.appendChild(document.createTextNode("About "));
      var nameSpan = document.createElement("span");
      nameSpan.className = "sx-about-name";
      nameSpan.textContent = name;
      about.appendChild(nameSpan);
    }
    var closeAbout = document.getElementById("closeAppAbout");
    if (closeAbout) closeAbout.setAttribute("aria-label", "Close About " + name);
    document.querySelectorAll(".sx-brand").forEach(function (b) { applyBrandText(b, name, compact); });
    document.querySelectorAll(".sx-tally-brand").forEach(function (b) { b.textContent = brand; });
  }

