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
  var aboutOriginalHTML = null; // captured Sexcapades About copy, for restore

  /* ---- Skin Loading Lifecycle Gate & Guard (2026-11-21) ----
     Provides a deterministic lifecycle gate: window.__SX_WHEN_SKIN_READY(cb).
     - Resolves the boot race where window.__SX_BOOT_SKIN_READY was undefined
       for 1-3s before boot resolved; now initialized immediately as a Promise.
     - Callers can pass a callback cb(skinId) and/or await the returned Promise.
     - When a skin is loaded and idle, callbacks execute immediately.
     - When a skin boot or switch is in-flight, callers are queued and executed
       in order once the layout, terms, and outline finish sync.
     - Fast consecutive switches are generation-guarded via currentSwitchGen so
       stale intermediate fetches cannot overwrite the latest active skin. */
  var skinReadyCallbacks = [];
  var isSkinTransitioning = true;
  var currentSwitchGen = 0;
  var bootReadyResolve = null;
  var bootReadyReject = null;
  var bootReadyPromise = new Promise(function (resolve, reject) {
    bootReadyResolve = resolve;
    bootReadyReject = reject;
  });
  window.__SX_BOOT_SKIN_READY = bootReadyPromise;

  var currentReadyPromise = null;
  var currentResolve = null;

  function markSkinTransitionStart() {
    isSkinTransitioning = true;
    currentReadyPromise = new Promise(function (resolve) {
      currentResolve = resolve;
    });
  }
  markSkinTransitionStart();

  function markSkinTransitionEnd(skinId) {
    isSkinTransitioning = false;
    var resolvedSkin = skinId || activeSkin || "sexcapades";
    activeSkin = resolvedSkin;
    window.__SX_ACTIVE_SKIN = resolvedSkin;
    if (bootReadyResolve) {
      bootReadyResolve(resolvedSkin);
      bootReadyResolve = null;
      bootReadyReject = null;
    }
    if (currentResolve) {
      currentResolve(resolvedSkin);
      currentResolve = null;
    }
    currentReadyPromise = Promise.resolve(resolvedSkin);
    window.__SX_BOOT_SKIN_READY = currentReadyPromise;

    var cbs = skinReadyCallbacks.slice();
    skinReadyCallbacks = [];
    cbs.forEach(function (cb) {
      try {
        cb(resolvedSkin);
      } catch (e) {
        if (typeof console !== "undefined" && console.error) console.error("[FlexcapadesSkins] error in __SX_WHEN_SKIN_READY callback:", e);
      }
    });
  }

  function whenSkinReady(cb) {
    var p = isSkinTransitioning ? currentReadyPromise : Promise.resolve(activeSkin || currentSkinId());
    if (typeof cb === "function") {
      if (isSkinTransitioning) {
        skinReadyCallbacks.push(cb);
      } else {
        try {
          cb(activeSkin || currentSkinId());
        } catch (e) {
          if (typeof console !== "undefined" && console.error) console.error(e);
        }
      }
    }
    return p;
  }

  window.__SX_WHEN_SKIN_READY = whenSkinReady;

  /* Sample profiles live in the skin JSONs (2026-11-16): the loader owns
     window.SEXCAPADES_SAMPLE_PROFILES and mutates it IN PLACE — never
     replaces it — because 06d's Aw() caches the object on first use and
     reads keys from it at click time. Created here so the global always
     exists, even before the first skin JSON arrives. */
  if (!window.SEXCAPADES_SAMPLE_PROFILES || typeof window.SEXCAPADES_SAMPLE_PROFILES !== "object") window.SEXCAPADES_SAMPLE_PROFILES = {};

  /* ---- Local samples (2026-11-18, Jason) ----
     "Add current profile as a local sample" saves the loaded profile on
     this device so it appears in the Samples menu and loads back later —
     a chapter roster: a local Democratic chapter puts its main members'
     Polis profiles in as samples to share amongst the chapter. The sync
     card (QR) stays the transfer piece between devices; this store is
     local-only and never leaves the device. Storage is one localStorage
     key, "sexcapades_local_samples": { v: 1, skins: { <skinId>:
     { <key>: <sample entry> } } } — per-skin, so a Polis sample never
     shows on Sexcapades or any other skin. An entry is shaped exactly
     like a built-in skin-JSON sample (kind "sample", name, count,
     payload) plus local: true, so the existing menu rebuild and the
     existing sample loader in 06d accept it unchanged. Photos are NOT
     carried (the bundle strips them before saving): profile photos are
     data URLs that would eat the ~5MB localStorage quota for a roster.
     Saving a profile whose name already has a local sample on this skin
     UPDATES that entry in place (same key, fresh ratings) instead of
     piling up duplicates. Keys are "local-<time36>-<rand>" — never a
     profile id, so two profiles with the same name still cannot clash
     with a built-in sample key. */
  var LOCAL_SAMPLES_KEY = "sexcapades_local_samples";
  function readLocalSamplesStore() {
    try {
      var raw = localStorage.getItem(LOCAL_SAMPLES_KEY);
      if (!raw) return { v: 1, skins: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.skins || typeof parsed.skins !== "object") return { v: 1, skins: {} };
      return parsed;
    } catch (e) { return { v: 1, skins: {} }; }
  }
  function writeLocalSamplesStore(store) {
    try {
      localStorage.setItem(LOCAL_SAMPLES_KEY, JSON.stringify(store));
      return true;
    } catch (e) { return false; }
  }
  function localSamplesFor(skinId) {
    var store = readLocalSamplesStore();
    var per = store.skins[String(skinId || "sexcapades")] || {};
    var out = {};
    Object.keys(per).forEach(function (k) {
      var entry = per[k];
      if (entry && entry.kind === "sample" && entry.payload && entry.payload.ratings) out[k] = entry;
    });
    return out;
  }
  function currentSkinId() {
    return window.__SX_ACTIVE_SKIN || activeSkin || "sexcapades";
  }
  function mergeLocalSamplesInto(target) {
    var locals = localSamplesFor(currentSkinId());
    Object.keys(locals).forEach(function (k) { target[k] = locals[k]; });
    return locals;
  }
  function refreshSampleMenuWithLocals() {
    var target = window.SEXCAPADES_SAMPLE_PROFILES;
    if (!target || typeof target !== "object") return;
    var cacheEntry = cache[currentSkinId()];
    var skinSamples = (cacheEntry && cacheEntry.samples) || {};
    Object.keys(target).forEach(function (k) { delete target[k]; });
    if (skinSamples && typeof skinSamples === "object") {
      Object.keys(skinSamples).forEach(function (k) { target[k] = skinSamples[k]; });
    }
    mergeLocalSamplesInto(target);
    rebuildSampleMenu(target);
  }
  window.__SX_LOCAL_SAMPLES = {
    list: function (skinId) { return localSamplesFor(skinId || currentSkinId()); },
    save: function (skinId, entry) {
      if (!entry || !entry.name || !entry.payload || !entry.payload.ratings) return null;
      var skin = String(skinId || currentSkinId());
      var store = readLocalSamplesStore();
      if (!store.skins[skin] || typeof store.skins[skin] !== "object") store.skins[skin] = {};
      var per = store.skins[skin];
      var nameKey = String(entry.name).trim().toLowerCase();
      var existingKey = null;
      Object.keys(per).forEach(function (k) {
        if (per[k] && String(per[k].name || "").trim().toLowerCase() === nameKey) existingKey = k;
      });
      var key = existingKey || ("local-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1296).toString(36));
      var updated = Boolean(existingKey);
      var saved = JSON.parse(JSON.stringify(entry));
      saved.local = true;
      per[key] = saved;
      if (!writeLocalSamplesStore(store)) return null;
      if (skin === currentSkinId()) refreshSampleMenuWithLocals();
      return { key: key, updated: updated };
    },
    remove: function (skinId, key) {
      var skin = String(skinId || currentSkinId());
      var store = readLocalSamplesStore();
      var per = store.skins[skin];
      if (!per || !per[key]) return false;
      var name = per[key].name || key;
      delete per[key];
      if (!writeLocalSamplesStore(store)) return false;
      if (skin === currentSkinId()) refreshSampleMenuWithLocals();
      return name;
    },
    refresh: refreshSampleMenuWithLocals
  };

  /* ---- Roster packs (2026-11-22, Jason) ----
     A roster pack is a small JSON file bundling one skin's samples —
     a group's roster (its DMs and top players, each with an authored
     menu blurb) that members load in one step as local samples. Pack
     shape: { format: "flexcapades-roster", version: 1, skin: <skinId>,
     name: <pack name>, samples: [ <sample entries> ] }. Three doors:
     export (the Samples menu downloads the current skin's local samples
     as a pack), file import (the menu reads a pack file), and the
     hosted door — a pack served from /hosted/rosters/<slug>.json loads
     when the app opens with #roster=<slug> in the URL, which is what a
     group puts in a QR code for its members. Hosted packs are the
     Patreon perk: the pack file lives in the site tree (bridged from
     the capades-rosters repo), so a group never distributes files
     itself. Import is name-deduped through the local-samples store, so
     re-importing a pack updates the roster in place. A pack only loads
     on its own skin — ratings keyed to another skin's topics would be
     meaningless here. */
  var ROSTER_FORMAT = "flexcapades-roster";
  function rosterToast(msg) {
    try {
      var el = document.getElementById("sxRosterToast");
      if (!el) {
        el = document.createElement("div");
        el.id = "sxRosterToast";
        el.setAttribute("role", "status");
        el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,480px);background:#14181c;color:#f2f4f6;border:1px solid #3a4550;border-radius:10px;padding:10px 14px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45);";
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.display = "block";
      clearTimeout(rosterToast._t);
      rosterToast._t = setTimeout(function () { el.style.display = "none"; }, 7000);
    } catch (e) { /* a toast must never break the app */ }
  }
  function cleanRosterEntry(raw) {
    if (!raw || typeof raw !== "object") return null;
    var name = String(raw.name || "").trim();
    var payload = raw.payload;
    if (!name || !payload || typeof payload !== "object" || !payload.ratings || typeof payload.ratings !== "object") return null;
    if (!Object.keys(payload.ratings).length) return null;
    var entry = JSON.parse(JSON.stringify(raw));
    entry.kind = "sample";
    entry.name = name;
    delete entry.photo;
    entry.payload.photos = [];
    entry.payload.noFlash = true;
    entry.payload.profileName = entry.payload.profileName || name;
    entry.count = Object.keys(entry.payload.ratings).length;
    if (entry.about) entry.about = String(entry.about).slice(0, 300);
    return entry;
  }
  function importRosterPack(pack, sourceLabel, slug) {
    var api = window.__SX_LOCAL_SAMPLES;
    if (!api || typeof api.save !== "function") { rosterToast("Roster packs are not available right now — reload and try again."); return null; }
    if (!pack || pack.format !== ROSTER_FORMAT || !Array.isArray(pack.samples)) {
      rosterToast("That file is not a roster pack."); return null;
    }
    var skin = currentSkinId();
    if (pack.skin && String(pack.skin) !== skin) {
      rosterToast("That roster is for a different map — open it on its own map to load it."); return null;
    }
    /* Each roster gets its own entry in the add menu (Jason,
       2026-11-22): entries carry roster/rosterKey tags, and
       importing a pack REPLACES that roster's previous copy — a pack
       is the authority on its own membership, so a member dropped
       from the pack leaves the menu. Personal locals, other rosters,
       and the built-in samples are untouched, so a person can carry
       several rosters (several groups) side by side. */
    var rosterName = String(pack.name || slug || "Roster");
    var rosterKey = String(slug || rosterName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "roster";
    var swept = 0;
    var before = api.list(skin) || {};
    Object.keys(before).forEach(function (k) {
      if (before[k] && before[k].rosterKey === rosterKey) { if (api.remove(skin, k)) swept++; }
    });
    var added = 0, skipped = 0;
    pack.samples.forEach(function (raw) {
      var entry = cleanRosterEntry(raw);
      if (!entry) { skipped++; return; }
      entry.roster = rosterName;
      entry.rosterKey = rosterKey;
      var saved = null;
      try { saved = api.save(skin, entry); } catch (e) { saved = null; }
      if (!saved) { skipped++; return; }
      added++;
    });
    if (added) {
      rosterToast("Roster \u201C" + rosterName + "\u201D loaded: " + added + " member" + (added === 1 ? "" : "s") + (swept ? " (replaced the previous copy)" : "") + (skipped ? ", " + skipped + " skipped" : "") + ". Find them under \u201C" + rosterName + "\u201D in the add menu." + (sourceLabel ? " (" + sourceLabel + ")" : ""));
    } else {
      rosterToast("No usable samples in that roster pack" + (skipped ? " — " + skipped + " skipped." : "."));
    }
    return { added: added, swept: swept, skipped: skipped };
  }
  function exportRosterPack() {
    var api = window.__SX_LOCAL_SAMPLES;
    var skin = currentSkinId();
    var locals = (api && typeof api.list === "function") ? (api.list(skin) || {}) : {};
    var samples = Object.keys(locals).map(function (k) {
      var e = JSON.parse(JSON.stringify(locals[k]));
      delete e.local;
      return e;
    });
    if (!samples.length) { rosterToast("No local samples on this map yet — save a profile as a local sample first, then export the roster."); return; }
    var pack = { format: ROSTER_FORMAT, version: 1, skin: skin, name: "", exportedAt: new Date().toISOString(), samples: samples };
    try {
      var blob = new Blob([JSON.stringify(pack, null, 2) + "\n"], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = skin + "-roster.json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      rosterToast("Roster pack downloaded — " + samples.length + " sample" + (samples.length === 1 ? "" : "s") + " for this map.");
    } catch (e) { rosterToast("Could not create the roster pack file."); }
  }
  var rosterFileInput = null;
  function pickRosterFile() {
    if (!rosterFileInput) {
      rosterFileInput = document.createElement("input");
      rosterFileInput.type = "file";
      rosterFileInput.accept = ".json,application/json";
      rosterFileInput.style.display = "none";
      rosterFileInput.addEventListener("change", function () {
        var f = rosterFileInput.files && rosterFileInput.files[0];
        rosterFileInput.value = "";
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          var pack = null;
          try { pack = JSON.parse(String(reader.result || "")); } catch (e) { pack = null; }
          if (!pack) { rosterToast("That file could not be read as a roster pack."); return; }
          importRosterPack(pack, "file");
        };
        reader.readAsText(f);
      });
      document.body.appendChild(rosterFileInput);
    }
    rosterFileInput.click();
  }
  window.__SX_ROSTER = { export: exportRosterPack, importFile: pickRosterFile, importPack: importRosterPack };
  var rosterHashChecked = false;
  function maybeLoadRosterFromHash() {
    if (rosterHashChecked) return;
    var slug = null;
    try {
      var body = (window.location.hash || "").replace(/^#/, "");
      body.split("&").forEach(function (t) {
        if (t.indexOf("roster=") === 0) slug = decodeURIComponent(t.slice(7));
      });
    } catch (e) { slug = null; }
    if (!slug) { rosterHashChecked = true; return; }
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug)) { rosterHashChecked = true; return; }
    rosterHashChecked = true;
    fetch("/hosted/rosters/" + slug + ".json", { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("not found");
      return r.json();
    }).then(function (pack) {
      importRosterPack(pack, "hosted roster", slug);
      try {
        var body = (window.location.hash || "").replace(/^#/, "");
        var kept = body.split("&").filter(function (t) { return t.indexOf("roster=") !== 0; });
        history.replaceState(null, "", window.location.pathname + window.location.search + (kept.length ? "#" + kept.join("&") : ""));
      } catch (e) { /* the token staying is harmless: imports dedupe by name */ }
    }).catch(function () {
      rosterToast("That roster link could not be loaded — the pack may have moved.");
    });
  }

  /* Paint generation (boot-race fix, 2026-11-16): the taxonomy array is
     swapped in place, so a chunked paint already in flight keeps the
     old branch geometry while reading the new taxonomy — and throws on
     the first subcategory branch it reaches. Every swap bumps this
     counter FIRST; the bundle's chunked driver aborts a paint whose
     generation moved (no throw, no pause screen) and the queued
     re-render paints the new skin. */
  function bumpPaintGen() {
    window.__SX_PAINT_GEN = (window.__SX_PAINT_GEN || 0) + 1;
  }

  /* ---- Hostname -> skin (flex.capades.io plan, 2026-11-16) ----
     One shared folder serves every capades.io host, and the app picks
     its skin from the hostname: <prefix>.capades.io loads that skin at
     boot, sexcapades.io (legacy) loads Sexcapades, and flex.capades.io /
     capades.io boot the default skin with the skin menu open (the "no
     skin picked" state). Anything else (localhost, unknown hosts) boots
     Sexcapades, as before. The ?skin= query param (see skinFromUrl)
     wins over the hostname: it carries a skin selection across the
     age-gate round-trip. */
  var HOSTNAME_SKINS = { sex: "sexcapades", polis: "poliscapades", fores: "forescapades", philo: "philoscapades", aesth: "aesthcapades", voca: "vocapades", tech: "techcapades", dharma: "dharmacapades", theori: "theoricapades", praxi: "praxicapades", quanta: "quantacapades", experi: "expericapades", simul: "simulcapades", matter: "mattercapades", chem: "chemcapades", nous: "nouscapades", dance: "dancecapades", quest: "questcapades" };
  var SKIN_IDS = ["sexcapades", "poliscapades", "forescapades", "philoscapades", "aesthcapades", "vocapades", "techcapades", "dharmacapades", "theoricapades", "praxicapades", "quantacapades", "expericapades", "simulcapades", "mattercapades", "chemcapades", "nouscapades", "dancecapades", "questcapades"];

  function skinForHostname(hostname) {
    var host = (hostname || "").toLowerCase();
    if (host === "sexcapades.io" || host === "www.sexcapades.io") return "sexcapades";
    if (host === "flex.capades.io" || host === "capades.io") return "sexcapades";
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
      cfg.keys = ["give"];
      cfg.labels = ["everything"];
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
     JSON. Shared by applySkin (full swap) and the Sexcapades seam below
     (widgets only). Returns the topic count. */
  function registerWidgets(data) {
    var widgets = {};
    var desc = {};
    var poleLines = {};
    var meterTopics = {};
    var communities = {};
    var popularity = {};
    var readings = {};
    var count = 0;
    data.categories.forEach(function (cat) {
      var all = (cat.topics || []).slice();
      (cat.subcategories || []).forEach(function (sub) {
        all = all.concat(sub.topics || []);
      });
      all.forEach(function (t) {
        var wc = widgetConfig(t);
        if (wc) widgets[t.id] = wc;
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
    /* Re-register the sexcapades.json widget configs (same seam as boot):
       without them the 17 higher-pole topics would fall back to the
       generic widgets after a switch-back. Synchronous when the file is
       already cached, async otherwise (the rerender below picks it up). */
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
        if (entry.photo) {
          var img = document.createElement("img");
          img.alt = "";
          img.decoding = "async";
          img.loading = "lazy";
          img.src = entry.photo;
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
    /* Palimpsest stacks (2026-11-22): a sample may carry stack
       fields (stack / stackKey / date) marking it as one dated layer
       of a single profile across time — a party's platforms, a
       creed's documents. Stacked samples never render as flat rows:
       each stack collapses into ONE parent entry, in the Samples
       menu at the position of its first layer and in the add menu
       beside the roster entries, and the parent opens a submenu of
       the layers in date order (see syncStackMenus). */
    var stackGroups = {}, stackOrder = [];
    function stackKeyOf(e) { return e && (e.stackKey || e.stack) ? String(e.stackKey || e.stack) : null; }
    samplesList.forEach(function (key) {
      var e = samples[key];
      if (e && e.rosterKey) {
        if (!e.local && localRosterNames[e.rosterKey] && localRosterNames[e.rosterKey][String(e.name || "").trim().toLowerCase()]) return;
        if (!rosterGroups[e.rosterKey]) { rosterGroups[e.rosterKey] = { name: e.roster || "Roster", keys: [] }; rosterOrder.push(e.rosterKey); }
        rosterGroups[e.rosterKey].keys.push(key);
      } else if (stackKeyOf(e)) {
        var sk = stackKeyOf(e);
        if (!stackGroups[sk]) { stackGroups[sk] = { name: e.stack || "Stack", keys: [] }; stackOrder.push(sk); }
        stackGroups[sk].keys.push(key);
      } else plainSamples.push(key);
    });
    stackOrder.forEach(function (sk) {
      stackGroups[sk].sorted = stackGroups[sk].keys.slice().sort(function (a, b) {
        var va = stackDateValue(samples[a]), vb = stackDateValue(samples[b]);
        return va < vb ? -1 : va > vb ? 1 : 0;
      });
    });
    var stackMenusOk = typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function";
    /* Render the Samples menu with a stack parent interleaved at the
       position of each stack's first layer. Only used when stacks
       exist and the submenu hook is live; otherwise the flat path
       runs exactly as before (and syncStackMenus falls back to
       headed groups, the roster fallback shape). */
    function renderSamplesMenu(withHeadings) {
      var renderedStacks = {};
      if (withHeadings && (plainSamples.length || stackOrder.length)) {
        var label = document.createElement("div");
        label.className = "sample-menu-group";
        label.textContent = "Samples";
        menu.appendChild(label);
      }
      samplesList.forEach(function (key) {
        var e = samples[key];
        if (!e || e.rosterKey) return;
        var sk = stackKeyOf(e);
        if (sk) {
          if (renderedStacks[sk]) return;
          renderedStacks[sk] = true;
          menu.appendChild(ensureStackEls(sk, menu).item);
        } else addGroup(menu, null, [key]);
      });
    }
    if (archMenu) {
      addGroup(archMenu, null, archetypes);
      if (stackOrder.length && stackMenusOk) renderSamplesMenu(false);
      else addGroup(menu, null, plainSamples);
      if (!plainSamples.length && !stackOrder.length) hideSamplesEntry();
      else if (sampleEntry) sampleEntry.hidden = false;
    } else {
      addGroup(menu, "Archetypes", archetypes);
      if (stackOrder.length && stackMenusOk) renderSamplesMenu(true);
      else addGroup(menu, "Samples", plainSamples);
      if (sampleEntry) sampleEntry.hidden = false;
    }
    syncRosterMenus(rosterGroups, rosterOrder, addGroup, menu);
    syncStackMenus(stackGroups, stackOrder, addGroup, menu);
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
     rosterMenuEls pattern. Each stack owns TWO submenus: one opened
     from its add-menu entry, one from its parent row inside the
     Samples menu. Both are wired through 06d's
     __SX_WIRE_SAMPLE_SUBMENU hook and registered on
     window.__SX_SAMPLE_SUBMENUS, so every close/refresh path in 06d
     (Sw, Ew, Ow, Pw) treats them exactly like the roster submenus —
     the 2026-11-22 roster dismiss fix applies to them by
     construction. */
  var stackMenuEls = {};
  function ensureStackEls(sk, samplesMenu) {
    var els = stackMenuEls[sk];
    if (els) return els;
    var addMenu = document.getElementById("profileAddMenu");
    var wire = (typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function") ? window.__SX_WIRE_SAMPLE_SUBMENU : null;
    var entry = document.createElement("button");
    entry.type = "button";
    entry.id = "loadStackChoice-" + sk;
    entry.setAttribute("role", "menuitem");
    entry.setAttribute("aria-haspopup", "menu");
    entry.setAttribute("aria-expanded", "false");
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
    function makeStackMenu(idSuffix) {
      var m = document.createElement("div");
      m.id = "profileStackMenu-" + sk + idSuffix;
      m.className = "profile-add-menu profile-sample-menu";
      m.setAttribute("role", "menu");
      m.hidden = true;
      var back = document.createElement("button");
      back.type = "button";
      back.className = "sample-menu-back";
      back.setAttribute("role", "menuitem");
      back.textContent = "\u2039 Back";
      m.appendChild(back);
      return { menu: m, back: back };
    }
    var fromAdd = makeStackMenu(""), fromSamples = makeStackMenu("-samples");
    var savedChoice = document.getElementById("loadSavedProfileChoice");
    if (addMenu) addMenu.insertBefore(entry, savedChoice || null);
    if (samplesMenu && samplesMenu.parentElement) {
      samplesMenu.parentElement.appendChild(fromAdd.menu);
      samplesMenu.parentElement.appendChild(fromSamples.menu);
    }
    /* Register with 06d's close/refresh paths; __sxTrigger lets Sw
       reset each entry's aria-expanded when it closes the menu. */
    fromAdd.menu.__sxTrigger = entry;
    fromSamples.menu.__sxTrigger = subEntry;
    (window.__SX_SAMPLE_SUBMENUS = window.__SX_SAMPLE_SUBMENUS || []).push(fromAdd.menu, fromSamples.menu);
    if (wire) {
      wire(entry, fromAdd.menu, fromAdd.back);
      wire(subEntry, fromSamples.menu, fromSamples.back);
    }
    els = stackMenuEls[sk] = { entry: entry, menu: fromAdd.menu, item: item, subEntry: subEntry, subStrong: subStrong, subSmall: subSmall, subMenu: fromSamples.menu };
    return els;
  }

  function syncStackMenus(stackGroups, stackOrder, addGroup, samplesMenu) {
    var addMenu = document.getElementById("profileAddMenu");
    var wire = (typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function") ? window.__SX_WIRE_SAMPLE_SUBMENU : null;
    Object.keys(stackMenuEls).forEach(function (sk) {
      if (!stackGroups[sk]) {
        var els = stackMenuEls[sk];
        els.entry.remove();
        els.item.remove();
        els.menu.remove();
        els.subMenu.remove();
        var reg = window.__SX_SAMPLE_SUBMENUS || [];
        [els.menu, els.subMenu].forEach(function (m) {
          var ix = reg.indexOf(m);
          if (ix >= 0) reg.splice(ix, 1);
        });
        delete stackMenuEls[sk];
      }
    });
    if (!wire || !addMenu || !samplesMenu) {
      /* Fallback (no submenu hook): headed groups of layers, in
         date order, inside the Samples menu. */
      stackOrder.forEach(function (sk) { addGroup(samplesMenu, stackGroups[sk].name, stackGroups[sk].sorted); });
      return;
    }
    stackOrder.forEach(function (sk) {
      var group = stackGroups[sk];
      var els = ensureStackEls(sk, samplesMenu);
      els.entry.textContent = group.name + "\u2026";
      els.subStrong.textContent = group.name;
      els.subSmall.textContent = group.sorted.length + " dated layers";
      [els.menu, els.subMenu].forEach(function (m) {
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

  function setBrand(skinId, displayName) {
    var prefix = skinPrefixFor(skinId);
    var dotted = prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1) + ".Capades.IO") : "Sex.Capades.IO";
    var name = dotted;
    var brand = dotted;
    document.title = dotted + (skinId === "sexcapades" ? "" : " — " + (displayName || skinId));
    var btn = document.getElementById("openAppAbout");
    if (btn) btn.textContent = name;
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
    document.querySelectorAll(".sx-brand").forEach(function (b) { b.textContent = name; });
    document.querySelectorAll(".sx-tally-brand").forEach(function (b) { b.textContent = brand; });
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
    debateMS: { sex: "Debate MS", vanilla: "Debate MS" },
    debateKF: { sex: "Debate KF", vanilla: "Debate DF" },
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
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.toggle("sx-has-importers", !!hasImporters);
      document.body.classList.toggle("sx-no-importers", !hasImporters);
    }
    SX_IMPORTER_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (hasImporters) {
          el.disabled = false;
          el.hidden = false;
          if (el.style.display === "none") el.style.display = "";
          if (el.__sxOrigTitle !== undefined) {
            if (el.__sxOrigTitle) el.setAttribute("title", el.__sxOrigTitle);
            else el.removeAttribute("title");
            delete el.__sxOrigTitle;
          }
        } else {
          el.disabled = true;
          el.hidden = true;
          el.style.display = "none";
        }
      });
    });
  }

  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof window.__SX_HAS_IMPORTERS === "boolean") {
        applyImporterGating(window.__SX_HAS_IMPORTERS);
      }
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
    if (layout.settings && typeof layout.settings === "object") {
      try { window.__SEXCAPADES_LAYOUT_DEFAULTS = JSON.parse(JSON.stringify(layout.settings)); } catch (e) { /* keep fallback */ }
    }
    if (urlHasLayoutSettings()) return;
    applySexcapadesLayout(data);
  }

  /* Skin-switch paint flag (2026-11-17): a switch is a fresh boot into
     the new skin, so each paint in the switch paints the full unrated
     map. The flag covers both layers that otherwise hide it: the
     paint's no-profile early return (which would install the "Select a
     profile" placeholder — profiles exist in memory but none is active
     for this skin) and the solver's branch filter (which builds zero
     branches in that same state). One-shot per paint: the paint
     consumes it right after its solve, so no later paint sees it.
     (The boot-chunk arm cannot cover this: a layout import paints
     through the chunked apply path, and the chunk flag makes the arm
     consumer refuse it.) The 10s backstop clears a flag no paint
     consumed (e.g. a layout import that skipped its repaint because
     the settings were unchanged); the generation guard keeps an older
     backstop from clearing a newer switch's flag. */
  var sxSwitchFlagGen = 0;
  function sxArmSwitchPaint() {
    window.__SX_FORCE_UNRATED_TREE = true;
    var g = ++sxSwitchFlagGen;
    setTimeout(function () { if (sxSwitchFlagGen === g) window.__SX_FORCE_UNRATED_TREE = false; }, 10000);
  }

  function loadSkin(skinId, displayName) {
    var thisGen = ++currentSwitchGen;
    markSkinTransitionStart();

    if (skinId === "sexcapades") {
      /* Gate follows the skin (2026-11-16): switching to Sexcapades
         in-app gates when the gate hasn't been passed. On a sex host
         the app's inline gate script already enforced this at boot, so
         the pass is there; on a vanilla host the switch is the first
         gate moment. The gate returns with ?verified=1&skin=sexcapades,
         and the boot below restores the selection. */
      if (!hasGatePass()) {
        redirectToGateForSkin("sexcapades");
        markSkinTransitionEnd(activeSkin || "sexcapades");
        return Promise.resolve("sexcapades");
      }
      /* Skin switch (2026-11-17): clear the old skin's profiles off the
         viewport (kept in memory — they restore on switch-back). */
      if (typeof window.__SX_CLEAR_VIEWPORT_PROFILES === "function") window.__SX_CLEAR_VIEWPORT_PROFILES(activeSkin);
      var sexPromise = cache["sexcapades"]
        ? Promise.resolve(cache["sexcapades"])
        : fetch(SKIN_DIR + "sexcapades.json").then(function (r) {
            if (!r.ok) throw new Error("skin file not found: data/skins/sexcapades.json");
            return r.json();
          }).then(function (data) { cache["sexcapades"] = data; return data; });
      return sexPromise.then(function (data) {
        if (thisGen !== currentSwitchGen) return activeSkin;
        applySkin(data);
        setBrand("sexcapades", data.name || "Sexcapades");
        /* Switch-back restores the remembered Sexcapades profile, if any. */
        if (typeof window.__SX_RESTORE_VIEWPORT_PROFILES === "function") window.__SX_RESTORE_VIEWPORT_PROFILES("sexcapades");
        sxArmSwitchPaint();
        var layoutApplied = applySexcapadesLayout(data);
        if (!layoutApplied) rerender();
        applyTerms("sexcapades", data);
        rebuildOutlineIfOpen();
        markSkinTransitionEnd("sexcapades");
        return "sexcapades";
      }, function (err) {
        window.__SX_FORCE_UNRATED_TREE = false;
        try { rerender(); } catch (_) {}
        if (thisGen === currentSwitchGen) markSkinTransitionEnd(activeSkin || "sexcapades");
        throw err;
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
      if (thisGen !== currentSwitchGen) return activeSkin;
      /* Skin switch (2026-11-17): clear the old skin's profiles off the
         viewport (kept in memory — they restore on switch-back). */
      if (typeof window.__SX_CLEAR_VIEWPORT_PROFILES === "function") window.__SX_CLEAR_VIEWPORT_PROFILES(activeSkin);
      applySkin(data);
      setBrand(skinId, displayName || data.name);
      /* Switch-back restores the remembered profile for this skin, if any. */
      if (typeof window.__SX_RESTORE_VIEWPORT_PROFILES === "function") window.__SX_RESTORE_VIEWPORT_PROFILES(skinId);
      sxArmSwitchPaint();
      var layoutApplied = applyDefaultLayout(data);
      if (!layoutApplied) rerender();
      applyTerms(skinId, data);
      rebuildOutlineIfOpen();
      markSkinTransitionEnd(skinId);
      return skinId;
    }, function (err) {
      if (thisGen === currentSwitchGen) markSkinTransitionEnd(activeSkin || "sexcapades");
      throw err;
    });
  }

  window.FlexcapadesSkins = {
    load: loadSkin,
    active: function () { return activeSkin; },
    whenReady: whenSkinReady,
    isTransitioning: function () { return isSkinTransitioning; }
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
  /* Test hooks: the hostname mapping and the boot-menu decision are
     pure functions of their input, so probes can call them with every
     hostname without DNS. */
  window.__SX_SKIN_FOR_HOSTNAME = skinForHostname;
  window.__SX_BOOT_SHOULD_OPEN_MENU = bootShouldOpenMenu;
  window.__SX_SKIN_FROM_URL = skinFromUrl;
  window.__SX_HAS_GATE_PASS = hasGatePass;
  handleVerifiedParam();
  /* Boot skin: ?skin= (a gate round-trip) wins over the hostname, and
     the hostname wins over the default. A non-Sexcapades boot skin
     loads once the layout hook and the engine are ready (same poll as
     the Sexcapades boot apply — the layout apply needs both); if the
     engine never becomes ready, or the skin file fails to load, the
     Sexcapades seam runs instead so the map still boots. */
  /* Set the PWA manifest for the boot skin immediately (before the
     skin JSON fetch resolves), so the install prompt sees the right
     manifest from the start; applySkin / restoreSexcapades re-assert
     it on every switch, and the failure paths below correct it if the
     boot skin fails to load. */
  setManifestForSkin(skinFromUrl() || skinForHostname(window.location.hostname));
  (function bootSkin() {
    var fromUrl = skinFromUrl();
    var boot = fromUrl || skinForHostname(window.location.hostname);

    /* Immediately fetch skin JSON across network in parallel with data-bootstrap stream loading. */
    var url = SKIN_DIR + boot + ".json";
    var fetchPromise = cache[boot]
      ? Promise.resolve(cache[boot])
      : fetch(url).then(function (r) {
          if (!r.ok) throw new Error("skin file not found: " + url);
          return r.json();
        }).then(function (data) { cache[boot] = data; return data; });

    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      var hook = window.__SEXCAPADES_LAYOUT_TEST;
      var engine = window.FlexcapadesEngine;
      var tl = window.TaxonomyLoader;
      var taxReady = tl && typeof tl.loadTaxonomy === "function" && tl.loadTaxonomy() && Array.isArray(tl.loadTaxonomy().categories);
      if (!hook || typeof hook.importText !== "function" || !engine || !engine.Map || !taxReady) {
        if (tries >= 300) {
          clearInterval(timer);
          if (typeof console !== "undefined" && console.warn) console.warn("[FlexcapadesSkins] boot skin layout not applied: engine not ready");
          registerSexcapadesWidgets();
          setBrand("sexcapades");
          setManifestForSkin("sexcapades");
          if (typeof window.__SX_REBUILD_OUTLINE === "function") window.__SX_REBUILD_OUTLINE();
          try { rerender(); } catch (_) {}
          markSkinTransitionEnd("sexcapades");
        }
        return;
      }
      clearInterval(timer);
      fetchPromise.then(function (data) {
        if (boot !== "sexcapades") {
          applySkin(data);
          setBrand(boot, data.name);
        } else {
          registerWidgets(data);
          setSamples(data.samples, "sexcapades");
          setScribe(data.scribe);
          setSceneSetter(data.sceneSetter);
        }
        sxArmSwitchPaint();
        var layoutApplied = false;
        if (window.__SX_WARM_BOOT_RESTORED) {
          if (data && data.defaultLayout && data.defaultLayout.settings) {
            try {
              window.__SEXCAPADES_LAYOUT_DEFAULTS = JSON.parse(JSON.stringify(data.defaultLayout.settings));
            } catch (_) {}
          }
        } else {
          try {
            if (boot === "sexcapades") {
              layoutApplied = applySexcapadesLayout(data);
            } else {
              layoutApplied = applyDefaultLayout(data);
            }
          } catch (e) {
            layoutApplied = false;
          }
          if (!layoutApplied) {
            rerender();
          }
        }
        applyTerms(boot, data);
        rebuildOutlineIfOpen();
        markSkinTransitionEnd(boot);
        return boot;
      }).catch(function (err) {
        if (typeof console !== "undefined" && console.warn) console.warn("[FlexcapadesSkins] boot skin failed, staying on Sexcapades:", err);
        registerSexcapadesWidgets();
        setBrand("sexcapades");
        setManifestForSkin("sexcapades");
        if (typeof window.__SX_REBUILD_OUTLINE === "function") window.__SX_REBUILD_OUTLINE();
        try { rerender(); } catch (_) {}
        markSkinTransitionEnd("sexcapades");
      });
    }, 25);
  })();
  /* No skin picked (flex.capades.io / capades.io): open the skin menu
     once the menu hook exists (view-nav registers it at boot) and the
     engine is ready, so the boot pull-back can't close it under us.
     Once only, and only when no ?skin= already picked one. */
  (function bootOpenMenu() {
    if (skinFromUrl()) return;
    if (!bootShouldOpenMenu(window.location.hostname)) return;
    var opened = false;
    var timer = setInterval(function () {
      if (opened) { clearInterval(timer); return; }
      var open = window.__SX_OPEN_SKIN_MENU;
      var engine = window.FlexcapadesEngine;
      if (typeof open === "function" && engine && engine.Map) {
        opened = true;
        clearInterval(timer);
        try { open(); } catch (e) { /* menu stays closed */ }
      }
    }, 200);
    setTimeout(function () { clearInterval(timer); }, 30000);
  })();
})();
