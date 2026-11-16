/* ---- Flexcapades skin loader (prototype) ----
   Loads a skin's taxonomy JSON at runtime, swaps it into the live
   TaxonomyLoader categories array (the array the map paint reads), and
   re-renders the map. Sexcapades is the default; restoring it splices
   back a deep clone taken before the first swap.
   Skin data: app/data/skins/<skin>.json, fetched relative to the app
   page (works in source, hosted, and QA trees after the bundle sync).
   Every skin carries a defaultLayout section (its layout settings plus
   its baked solved positions, embedded in the skin file itself — the
   ONLY place layouts live).
   After a skin loads and re-renders, the loader applies it through
   the layout editor's import path; Sexcapades, the default skin, gets
   the same treatment at boot (once the editor and engine are ready)
   and on switch-back. A skin without one keeps its current behavior.
   The positions are handed to the bundle before the import, so the
   paint uses the baked geometry instead of solving; the settings
   stay the source of truth for whether the baked geometry is valid.
   The shell's inline layout object is only a pre-fetch fallback: the
   live layout comes from the skin file.
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
      absorb(cat.parentTopics);
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
      var all = (cat.topics || []).slice();
      (cat.subcategories || []).forEach(function (sub) {
        all = all.concat(sub.topics || []);
      });
      all.forEach(function (t) {
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
      bootApplySexcapades(data);
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
    var closeAbout = document.getElementById("closeAppAbout");
    if (closeAbout) closeAbout.setAttribute("aria-label", "Close About " + name);
    document.querySelectorAll(".sx-brand").forEach(function (b) { b.textContent = name; });
  }

  /* ---- Domain-terms skinning (first i18n step, 2026-11-15) ----
     The shell's adult/kink-flavored words swap per skin: Sexcapades
     keeps them, every other skin gets the vanilla equivalents Jason
     ruled (Krossmatch -> Cross match, Kink Factor -> Depth Factor,
     Play -> Commune, Parlay -> Converse). The table lives HERE, in the
     loader — the mappings are the same for every non-Sexcapades skin,
     so one table beats fourteen copies, and the loader already owns
     brand swapping (setBrand) with the same Sexcapades-special-case
     shape. A skin JSON may override individual keys with a `terms`
     object and may declare `importers: true` if it ever gains
     questionnaire importers (none do today — only Sexcapades has any).
     Two layers apply the terms:
     (1) the bundle renders labels through window.__SX_TERMS (resolved
     here on every skin load) — see sxTerm() in 05b-scribe.js — so
     fresh paints come out right;
     (2) applyTerms() rewrites the live DOM on every switch, fixing
     surfaces rendered before the switch that don't repaint (match-tab
     stamp, profile-tab strip buttons) and the static HTML strings
     (horizon intro, Get-ratings summary). Only elements marked with
     data-sx-term="<key>,<key>" are rewritten, key by key, whole-word
     only — unmarked text (topic names, songbook "Play the verse",
     descriptions) is never touched. Each rewrite first undoes the
     vanilla forms back to the Sexcapades forms, then applies the new
     skin's terms, so switches in either direction (and between two
     non-Sexcapades skins) land exactly; the element's own key list
     disambiguates the shared vanilla word ("Converse" undoes to
     "Parlay" or "Conversation" according to which key the element
     lists). Longest form first, so "Play KF" wins over "Play".
     NOT skinned, by Jason's word or for lack of a ruled equivalent:
     bowtie, circle-dot, Hot List, On Deck (ruled fine as-is); "Straight
     Talk" (the circledot tab's label — no ruled mapping for it);
     Charted (a coverage number, not a flavored word); "kink cloud"
     (one layout-editor tooltip, no obvious vanilla name); the map's
     "consenting adult interests" aria-label (description text, left
     alone); the "Syncing Sexcapades Guide" name; Scribe / Scene Setter
     / Scene Sentinel (feature names); "Play guide" (a document name).
     "kink card" needed no change — the UI already says "sync card". */
  var SX_TERM_TABLE = {
    krossmatch: { sex: "Krossmatch", vanilla: "Cross match" },
    kinkFactor: { sex: "Kink Factor", vanilla: "Depth Factor" },
    playMode: { sex: "Play", vanilla: "Commune" },
    parlayMode: { sex: "Parlay", vanilla: "Converse" },
    conversationMode: { sex: "Conversation", vanilla: "Converse" },
    playMS: { sex: "Play MS", vanilla: "Commune MS" },
    playKF: { sex: "Play KF", vanilla: "Commune DF" },
    parlayMS: { sex: "Parlay MS", vanilla: "Converse MS" },
    parlayKF: { sex: "Parlay KF", vanilla: "Converse DF" },
    getRatings: { sex: "Hot list · KinkTest · BDSMtest · Yes / No / Maybe · FetLife", vanilla: "Hot list", exact: true }
  };
  /* The four skin-specific questionnaire importers, wherever they are
     offered: the test-result loader dialog, the profile tab's load
     menu, the profile-details "Get ratings" menu, and the test
     chooser. The shared import mechanism (Scan or Import — sync card /
     QR / exported file) is NOT in this list and stays live on every
     skin. */
  var SX_IMPORTER_SELECTORS = [
    "[data-converter=\"kinktest\"]", "[data-converter=\"checklist\"]",
    "[data-converter=\"fetlife\"]", "[data-converter=\"bdsmtest\"]",
    "[data-profile-converter=\"kinktest\"]", "[data-profile-converter=\"checklist\"]",
    "[data-profile-converter=\"fetlife\"]", "[data-profile-converter=\"bdsmtest\"]",
    "[data-profile-details-converter=\"kinktest\"]", "[data-profile-details-converter=\"checklist\"]",
    "[data-profile-details-converter=\"fetlife\"]", "[data-profile-details-converter=\"bdsmtest\"]",
    "[data-test-choice=\"kinktest\"]", "[data-test-choice=\"checklist\"]"
  ];

  function resolveTerms(skinId, skinData) {
    var terms = {};
    var vanilla = skinId !== "sexcapades";
    Object.keys(SX_TERM_TABLE).forEach(function (key) {
      var row = SX_TERM_TABLE[key];
      var override = skinData && skinData.terms && skinData.terms[key];
      terms[key] = vanilla
        ? (typeof override === "string" && override ? override : row.vanilla)
        : row.sex;
    });
    return terms;
  }

  function sxTermRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* Apply one (from -> to) whole-word replacement list to an element's
     text nodes (so <strong> etc. survive) plus its title, aria-label
     and data-ui-tooltip. A pair whose row is marked exact swaps only
     when a whole text value equals the form exactly — needed where the
     vanilla form is a prefix of the Sexcapades form (Get-ratings
     summary: "Hot list" inside the full feed list), so the undo pass
     can never duplicate the tail. */
  function sxRewriteElementText(el, pairs) {
    function swap(s) {
      var out = s;
      pairs.forEach(function (p) {
        if (p[2]) {
          if (out.trim() === p[0]) out = out.replace(p[0], p[1]);
        } else {
          out = out.replace(new RegExp("\\b" + sxTermRegex(p[0]) + "\\b", "g"), p[1]);
        }
      });
      return out;
    }
    (function walk(node) {
      if (node.nodeType === 3) node.nodeValue = swap(node.nodeValue);
      else if (node.nodeType === 1) for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
    })(el);
    ["title", "aria-label", "data-ui-tooltip"].forEach(function (attr) {
      var v = el.getAttribute(attr);
      if (v !== null) el.setAttribute(attr, swap(v));
    });
  }

  function applyTermsToElement(el, terms) {
    var keys = (el.getAttribute("data-sx-term") || "").split(",").map(function (k) { return k.trim(); }).filter(function (k) { return !!k && SX_TERM_TABLE[k]; });
    if (!keys.length) return;
    /* Longest Sexcapades form first, so "Play KF" wins over "Play"
       and "Commune DF" undoes before "Commune". */
    var ordered = keys.slice().sort(function (a, b) { return SX_TERM_TABLE[b].sex.length - SX_TERM_TABLE[a].sex.length; });
    /* Pass 1: undo any vanilla forms back to the Sexcapades forms. */
    sxRewriteElementText(el, ordered.map(function (key) { return [SX_TERM_TABLE[key].vanilla, SX_TERM_TABLE[key].sex, !!SX_TERM_TABLE[key].exact]; }));
    /* Pass 2: apply the active skin's terms. */
    sxRewriteElementText(el, ordered.map(function (key) { return [SX_TERM_TABLE[key].sex, terms[key], !!SX_TERM_TABLE[key].exact]; }));
  }

  function applyImporterGating(hasImporters) {
    SX_IMPORTER_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (hasImporters) {
          el.disabled = false;
          if (el.__sxOrigTitle !== undefined) {
            if (el.__sxOrigTitle) el.setAttribute("title", el.__sxOrigTitle);
            else el.removeAttribute("title");
            delete el.__sxOrigTitle;
          }
        } else {
          if (!el.disabled) {
            el.__sxOrigTitle = el.getAttribute("title") || "";
            el.setAttribute("title", "Not available for this skin — it has no importers");
          }
          el.disabled = true;
        }
      });
    });
  }

  function applyTerms(skinId, skinData) {
    var terms = resolveTerms(skinId, skinData);
    window.__SX_TERMS = terms;
    var hasImporters = skinId === "sexcapades" || !!(skinData && skinData.importers);
    window.__SX_HAS_IMPORTERS = hasImporters;
    document.querySelectorAll("[data-sx-term]").forEach(function (el) { applyTermsToElement(el, terms); });
    applyImporterGating(hasImporters);
  }

  /* Apply a skin's embedded default layout (defaultLayout in the skin
     JSON), if present, through the layout editor's import path. The
     import validates the settings and repaints the map. On success the
     shipped layout settings also become window.__SEXCAPADES_LAYOUT_DEFAULTS
     (the single source "Reset to defaults" and the editor's baked-base
     helpers read), so a skin's Reset restores that skin's shipped values.
     Missing, invalid, or unapplied layouts are silent no-ops — the skin
     loads with its current behavior. The import entry point is the layout
     editor's __SEXCAPADES_LAYOUT_TEST.importText; if the editor has
     not booted yet, this is a no-op. Returns true when a layout was applied. */
  function applyDefaultLayout(data) {
    var layout = data && data.defaultLayout;
    if (!layout || typeof layout !== "object" || Array.isArray(layout)) return false;
    if (!layout.settings || typeof layout.settings !== "object") return false;
    var hook = window.__SEXCAPADES_LAYOUT_TEST;
    if (!hook || typeof hook.importText !== "function") return false;
    try {
      /* Baked positions (2026-11-15): hand the skin's solved geometry to
         the bundle before the import repaints, so the paint uses it
         instead of solving. The positions stay out of the import payload
         (the import validates settings only). */
      if (layout.positions && typeof layout.positions === "object" && Array.isArray(layout.positions.branches)) {
        window.__SX_BAKED_POSITIONS = layout.positions;
      }
      var payload = { app: layout.app, kind: layout.kind, version: layout.version,
        build: layout.build, exportedAt: layout.exportedAt,
        settings: layout.settings, hash: layout.hash };
      var r = hook.importText(JSON.stringify(payload));
      if (!r || !r.ok) return false;
      window.__SEXCAPADES_LAYOUT_DEFAULTS = JSON.parse(JSON.stringify(layout.settings));
      return true;
    } catch (e) {
      /* keep current behavior on any failure */
      return false;
    }
  }

  /* Personal saved defaults (localStorage "sexcapades-layout-savedDefaults"):
     the same merge the boot script applies — only keys that already exist
     in the base settings are taken, so a stale save can never inject
     unknown settings. Sexcapades only: saved payloads are Sexcapades-shaped,
     so they must never be merged onto another skin's settings. */
  function mergeSavedDefaults(baseSettings) {
    var merged = JSON.parse(JSON.stringify(baseSettings));
    try {
      var raw = window.localStorage ? window.localStorage.getItem("sexcapades-layout-savedDefaults") : "";
      if (raw) {
        var parsed = JSON.parse(raw), saved = parsed && parsed.settings;
        if (saved && typeof saved === "object") {
          Object.keys(saved).forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(baseSettings, key)) merged[key] = saved[key];
          });
        }
      }
    } catch (e) { /* keep the base settings */ }
    return merged;
  }

  /* Sexcapades layout apply: the skin's shipped settings, with the user's
     saved personal defaults merged over them (the boot script's rule),
     through the editor's import path. The shipped settings (unmerged)
     become window.__SEXCAPADES_LAYOUT_DEFAULTS, so "Reset to defaults"
     restores the shipped values and clears the saved copy, exactly as
     before. The stored hash is dropped from the import payload: the
     merged settings no longer match it, and the import path ignores
     the hash anyway. Returns true when applied. */
  function applySexcapadesLayout(data) {
    var layout = data && data.defaultLayout;
    if (!layout || typeof layout !== "object" || Array.isArray(layout)) return false;
    if (!layout.settings || typeof layout.settings !== "object") return false;
    var hook = window.__SEXCAPADES_LAYOUT_TEST;
    if (!hook || typeof hook.importText !== "function") return false;
    try {
      /* Baked positions (2026-11-15): see applyDefaultLayout. */
      if (layout.positions && typeof layout.positions === "object" && Array.isArray(layout.positions.branches)) {
        window.__SX_BAKED_POSITIONS = layout.positions;
      }
      var payload = { app: layout.app, kind: layout.kind, version: layout.version,
        build: layout.build, exportedAt: layout.exportedAt,
        settings: mergeSavedDefaults(layout.settings) };
      var r = hook.importText(JSON.stringify(payload));
      if (!r || !r.ok) return false;
      window.__SEXCAPADES_LAYOUT_DEFAULTS = JSON.parse(JSON.stringify(layout.settings));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* Boot apply: once the editor hook and the map engine are ready, make
     the Sexcapades skin's shipped settings the Reset-to-defaults source
     and apply the skin layout — unless the URL carries explicit layout-*
     params, in which case the shared link's settings win over the skin
     default and the live layout stays as the shell computed it. The map
     may already have painted once with the shell's fallback layout; the
     import repaints with the skin layout, exactly as a skin switch does.
     Polls briefly; if the engine never becomes ready it leaves the
     fallback layout in place (safe degradation, warned on the console). */
  /* URL-layout carve-out (2026-11-15): the boot apply is skipped when the
     URL carries a layout, so a share link wins over the skin's layout.
     But every layout import writes a `layout-solverMidline` token into
     the URL hash (layout-editor writeSolverModeHash — the ONLY layout-*
     token the app itself writes), so after ANY boot or skin load the URL
     carries a layout-* param — and the next reload would skip the skin's
     layout apply entirely, leaving the map on the inline fallback (empty
     overrides, crossings ~17135 on Sexcapades) even though the URL
     carries no settings at all. A solverMidline-only hash is the app's
     own bookkeeping, not a user layout: skip only when the URL carries a
     layout param OTHER than solverMidline. A share link that carries
     real settings params still wins, as before. (Edge case, accepted:
     a solverMidline-only share link loses its solver-mode override to
     the skin's — the solver mode is a transient editor preference, and
     the hash token was written from the skin's own settings in the
     common case, so the values agree.) */
  function urlHasLayoutSettings() {
    try {
      var hash = window.location.hash || "";
      var body = hash.charAt(0) === "#" ? hash.slice(1) : hash;
      if (body) {
        var tokens = body.split("&");
        for (var i = 0; i < tokens.length; i++) {
          var t = tokens[i];
          if (/^layout-/i.test(t) && t.toLowerCase().indexOf("layout-solvermidline=") !== 0) return true;
        }
      }
      var search = window.location.search || "";
      if (search) {
        var q = search.charAt(0) === "?" ? search.slice(1) : search;
        var parts = q.split("&");
        for (var j = 0; j < parts.length; j++) {
          if (/^layout-/i.test(parts[j])) return true;
        }
      }
      return false;
    } catch (e) { return false; }
  }

  function bootApplySexcapades(data) {
    var layout = data && data.defaultLayout;
    if (!layout || typeof layout !== "object") return;
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      var hook = window.__SEXCAPADES_LAYOUT_TEST;
      var engine = window.FlexcapadesEngine;
      if (!hook || typeof hook.importText !== "function" || !engine || !engine.Map) {
        if (tries >= 300) {
          clearInterval(timer);
          if (typeof console !== "undefined" && console.warn) console.warn("[FlexcapadesSkins] boot layout not applied: engine not ready");
        }
        return;
      }
      clearInterval(timer);
      /* Shipped values become the Reset source even when a URL hash wins
         the live layout — Reset restores the skin's shipped values. */
      if (layout.settings && typeof layout.settings === "object") {
        try { window.__SEXCAPADES_LAYOUT_DEFAULTS = JSON.parse(JSON.stringify(layout.settings)); } catch (e) { /* keep fallback */ }
      }
      /* Baked positions (2026-11-15): the apply's own repaint paints the
         baked geometry, so no follow-up re-solve is needed — the old
         boot re-solve trigger (one more render after the paint settled)
         is removed; with baked positions it would only repaint the
         same geometry. The skip uses urlHasLayoutSettings, not the
         __SEXCAPADES_LAYOUT_FROM_URL flag: a solverMidline-only hash
         (written by every import) must not skip the skin's apply. */
      if (!urlHasLayoutSettings()) applySexcapadesLayout(data);
    }, 100);
  }

  function loadSkin(skinId, displayName) {
    if (skinId === "sexcapades") {
      restoreSexcapades();
      setBrand("sexcapades");
      return Promise.resolve(rerender()).then(function () {
        /* Switch-back re-applies the Sexcapades layout (with the user's
           saved defaults merged over it): without this the map would keep
           the previous skin's layout settings. A URL hash layout is a
           boot-time instruction only — an explicit switch selects the
           skin's defaults. A failed fetch leaves the current layout. */
        return sexcapadesData().then(function (data) {
          applySexcapadesLayout(data);
          applyTerms("sexcapades", data);
          return "sexcapades";
        }).catch(function () { applyTerms("sexcapades", null); return "sexcapades"; });
      });
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
      return Promise.resolve(rerender()).then(function () {
        applyDefaultLayout(data);
        applyTerms(skinId, data);
        return skinId;
      });
    });
  }

  window.FlexcapadesSkins = {
    load: loadSkin,
    active: function () { return activeSkin; }
  };

  /* Boot seam: register the sexcapades.json widget configs so the 17
     higher-pole topics get their widgets from the file on a native boot,
     and apply the skin's embedded layout once the editor and engine are
     ready (see bootApplySexcapades). */
  /* The bundle renders through window.__SX_TERMS from the first paint:
     resolve the Sexcapades (identity) terms at loader init so the
     helper in 05b-scribe.js never reads an empty map. */
  window.__SX_TERMS = resolveTerms("sexcapades", null);
  window.__SX_HAS_IMPORTERS = true;
  registerSexcapadesWidgets();
})();
