/* ---- Flexcapades skin loader (prototype) ----
   Loads a skin's taxonomy JSON at runtime, swaps it into the live
   TaxonomyLoader categories array (the array the map paint reads), and
   re-renders the map. Sexcapades is the default; restoring it splices
   back a deep clone taken before the first swap.
   Skin data: app/data/skins/<skin>.json, fetched relative to the app
   page (works in source, hosted, and QA trees after the bundle sync).
   Sexcapades itself has a skin file too (sexcapades.json): it carries
   ONLY the 17 higher-pole topics whose widget configs used to live
   hardcoded in the widget picker. The loader registers those configs
   at boot (and on every restore to Sexcapades) WITHOUT swapping the
   categories array — the 02b catalog still supplies everything else.
   The loader is a plain top-level script: it can only see window.* —
   the bundle-side hooks it relies on are the Ge() skin registry
   (window.__SX_SKIN_WIDGETS), the placard description registry
   (window.__SX_SKIN_DESCRIPTIONS), and the outline total
   (window.__SX_SKIN_TOPIC_COUNT). The map vault key does not include
   the skin, so every switch invalidates the vault before re-rendering.
   Popularity/priors are Sexcapades-specific: a loaded skin has none,
   so its branches tie at 0 and fall back to name order. */
(function () {
  "use strict";
  var SKIN_DIR = "data/skins/";
  var SEXCAPADES_TOPIC_COUNT = 403; // the outline copy's total; kept exact
  var cache = {};          // skinId -> parsed skin JSON
  var original = null;     // deep clone of the Sexcapades categories
  var activeSkin = "sexcapades";

  function taxonomyCategories() {
    return window.TaxonomyLoader.loadTaxonomy().categories;
  }

  /* Build one category in the post-overlay (merged) shape the paint reads:
     topics (objects with a non-enumerable toString) + topicDetails keyed
     by topic name. Mirrors TaxonomyLoader's applySubcategoryOverlay for
     a flat skin (Chemcapades has no subcategories). */
  function mergedCategory(cat) {
    var topics = (cat.topics || []).map(function (t) {
      var topic = { id: t.id, name: t.name, risk: !!t.risk };
      if (t.type) topic.type = t.type;
      if (t.give_label) topic.give_label = t.give_label;
      if (t.receive_label) topic.receive_label = t.receive_label;
      if (t.note) topic.note = t.note;
      Object.defineProperty(topic, "toString", {
        value: function () { return this.name; },
        enumerable: false
      });
      return topic;
    });
    var details = {};
    (cat.topics || []).forEach(function (t) {
      var row = {};
      if (t.type) row.type = t.type;
      if (t.give_label) row.give_label = t.give_label;
      if (t.receive_label) row.receive_label = t.receive_label;
      if (t.note) row.note = t.note;
      if (Object.keys(row).length) details[t.name] = row;
    });
    return { id: cat.id, name: cat.name, topics: topics, topicDetails: details };
  }

  /* Ge()-shaped widget config for one skin topic. Pole-count flags mirror
     the Sexcapades Ge() returns (t0281 sets triangle:true beside
     widget:"trilinear-sliders"); the placard switch branches on the
     widget string, so the flags only feed the map-spoke taper paths.
     A LINE triad gets no triangle flag — it is not a triangle. */
  function widgetConfig(topic) {
    var poles = topic.poles || [];
    var keys = poles.map(function (p) { return p.key; });
    var labels = poles.map(function (p) { return p.label; });
    var cfg = {
      single: topic.widget === "monopole-slider",
      widget: topic.widget,
      keys: keys,
      labels: labels
    };
    if (topic.widget === "monopole-slider") {
      cfg.keys = ["give"];
      cfg.labels = ["everything"];
    }
    if (topic.widget === "xy-switchbox") cfg.keys = ["give", "receive"];
    /* LINE triad: one scalar on a single track, stored under the single key
       "line" — NOT under the first pole's key (the bind writes via
       keys[0], and a line position of -100 means "fully the left pole",
       which would read as "against the left pole" under a pole key). The
       three pole labels stay in cfg.labels for the spectrum label. */
    if (topic.widget === "trilinear-line") cfg.keys = ["line"];
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
    var cats = taxonomyCategories();
    if (!original) original = JSON.parse(JSON.stringify(cats));
    var merged = data.categories.map(mergedCategory);
    cats.length = 0;
    merged.forEach(function (c) { cats.push(c); });
    var count = registerWidgets(data);
    window.__SX_SKIN_TOPIC_COUNT = count;
    window.__SX_ACTIVE_SKIN = data.skin;
    activeSkin = data.skin;
    /* Register the new category names in the solver's expanded-branch set,
       or frBuildTree skips every topic as collapsed (bare spokes). */
    if (typeof window.__SX_SKIN_LAYOUT_SYNC === "function") window.__SX_SKIN_LAYOUT_SYNC();
  }

  /* Build the Ge() widget registry + placard descriptions from one skin
     JSON. Shared by applySkin (full swap) and the Sexcapades seam below
     (widgets only). Returns the topic count. */
  function registerWidgets(data) {
    var widgets = {};
    var desc = {};
    var count = 0;
    data.categories.forEach(function (cat) {
      (cat.topics || []).forEach(function (t) {
        widgets[t.id] = widgetConfig(t);
        if (t.hovertip) desc[t.name] = formatHovertip(t);
        count += 1;
      });
    });
    window.__SX_SKIN_WIDGETS = widgets;
    window.__SX_SKIN_DESCRIPTIONS = desc;
    return count;
  }

  /* Sexcapades seam: sexcapades.json carries the 17 higher-pole topics'
     widget configs (formerly hardcoded in the widget picker). Register
     them WITHOUT swapping the categories array — the 02b catalog still
     supplies categories, topics, and the 403 outline total, and the
     active skin stays "sexcapades". The fetch starts at loader init
     (before boot), so the registry is normally populated before the
     first paint; if it lands after boot completed, re-render once so
     any topic painted with the generic fallback gets its real widget. */
  function registerSexcapadesWidgets() {
    var p = cache["sexcapades"]
      ? Promise.resolve(cache["sexcapades"])
      : fetch(SKIN_DIR + "sexcapades.json").then(function (r) {
          if (!r.ok) throw new Error("skin file not found: data/skins/sexcapades.json");
          return r.json();
        }).then(function (data) { cache["sexcapades"] = data; return data; });
    return p.then(function (data) {
      registerWidgets(data);
      var dlg = document.getElementById("sxBootDialog");
      if (window.FlexcapadesEngine && window.FlexcapadesEngine.Map && dlg && dlg.hidden) rerender();
    }).catch(function (err) {
      if (typeof console !== "undefined" && console.warn) console.warn("[FlexcapadesSkins] sexcapades.json not registered:", err);
    });
  }

  function restoreSexcapades() {
    if (!original) return;
    var cats = taxonomyCategories();
    cats.length = 0;
    /* Fresh clones of the pristine snapshot: the paint/solver mutate the
       live tree in place, so restoring the snapshot object itself would
       hand back already-mutated nodes. */
    JSON.parse(JSON.stringify(original)).forEach(function (c) { cats.push(c); });
    window.__SX_SKIN_WIDGETS = {};
    window.__SX_SKIN_DESCRIPTIONS = {};
    window.__SX_SKIN_TOPIC_COUNT = SEXCAPADES_TOPIC_COUNT;
    window.__SX_ACTIVE_SKIN = "sexcapades";
    activeSkin = "sexcapades";
    /* Re-register the sexcapades.json widget configs (same seam as boot):
       without them the 17 higher-pole topics would fall back to the
       generic widgets after a switch-back. Synchronous when the file is
       already cached, async otherwise (the rerender below picks it up). */
    if (cache["sexcapades"]) registerWidgets(cache["sexcapades"]);
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

  function setBrand(skinId, displayName) {
    var name = skinId === "sexcapades" ? "Sexcapades.IO" : displayName;
    document.title = skinId === "sexcapades" ? "Sexcapades.IO" : displayName + " — Flexcapades";
    var btn = document.getElementById("openAppAbout");
    if (btn) btn.textContent = name;
    var about = document.getElementById("appAboutTitle");
    if (about) about.textContent = "About " + name;
    document.querySelectorAll(".sx-brand").forEach(function (b) { b.textContent = name; });
  }

  function loadSkin(skinId, displayName) {
    if (skinId === "sexcapades") {
      restoreSexcapades();
      setBrand("sexcapades");
      return Promise.resolve(rerender()).then(function () { return "sexcapades"; });
    }
    var url = SKIN_DIR + skinId + ".json";
    var p = cache[skinId]
      ? Promise.resolve(cache[skinId])
      : fetch(url).then(function (r) {
          if (!r.ok) throw new Error("skin file not found: " + url);
          return r.json();
        }).then(function (data) { cache[skinId] = data; return data; });
    return p.then(function (data) {
      applySkin(data);
      setBrand(skinId, displayName || data.name);
      return rerender();
    }).then(function () { return skinId; });
  }

  window.FlexcapadesSkins = {
    load: loadSkin,
    active: function () { return activeSkin; }
  };

  /* Boot seam: register the sexcapades.json widget configs so the 17
     higher-pole topics get their widgets from the file on a native boot. */
  registerSexcapadesWidgets();
})();
