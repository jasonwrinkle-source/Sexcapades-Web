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
   Sexcapades boots from sexcapades.json the same way every other skin
   boots from its file. 02b-taxonomy-data.js is an empty stub
   (TAXONOMY_CATEGORIES = []), so applySkin is the only source of
   categories. A failed boot fetch falls back to registerSexcapadesWidgets,
   which fills widgets, samples, scribe, and setter without a category swap.
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
  var SEXCAPADES_TOPIC_COUNT = 403; // placeholder until registerWidgets counts sexcapades.json
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
      /* (d) A member updating their own roster profile stays in the
         roster: preserve the existing entry's roster tags on update,
         so the update is a content change, not a membership change.
         Updating a member's own profile is never gated. */
      if (existingKey && per[existingKey]) {
        if (!saved.rosterKey && per[existingKey].rosterKey) saved.rosterKey = per[existingKey].rosterKey;
        if (!saved.roster && per[existingKey].roster) saved.roster = per[existingKey].roster;
      }
      /* (a) Adding a NEW member to a roster is a membership change:
         gate it on the free cap / an active registration window.
         Updating an existing member (same name) is a content change
         and is never gated. Personal samples (no rosterKey) are never
         gated — the cap is on roster membership, not on saving a
         profile. */
      if (!existingKey && saved.rosterKey) {
        var frSave = window.__SX_ROSTER_FREEMIUM;
        if (frSave && typeof frSave.ensureGate === "function" && typeof frSave.individualsOf === "function" && typeof frSave.count === "function") {
          var addN = frSave.individualsOf(saved);
          var gSave = frSave.ensureGate(skin, String(saved.rosterKey), frSave.count(skin, String(saved.rosterKey)) + addN);
          if (!gSave.allowed) {
            if (typeof frSave.blockedToast === "function") frSave.blockedToast(gSave);
            return null;
          }
        }
      }
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
  function rosterToast(msg, link) {
    /* msg is plain text; link (optional) is {href, text} and is rendered
       as a real anchor (DOM-built, never innerHTML) after the message.
       A toast that carries a link does NOT auto-hide — it stays until
       the user taps it (the toast dismisses on tap, including on the
       link itself, which still opens Patreon in a new tab). */
    try {
      var el = document.getElementById("sxRosterToast");
      if (!el) {
        el = document.createElement("div");
        el.id = "sxRosterToast";
        el.setAttribute("role", "status");
        el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,480px);background:#14181c;color:#f2f4f6;border:1px solid #3a4550;border-radius:10px;padding:10px 14px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45);";
        /* Tap to dismiss: the only dismiss path for a link toast (which
           never auto-hides); harmless on a plain toast, which also
           still auto-hides after 7s. */
        el.addEventListener("click", function () {
          try { clearTimeout(rosterToast._t); } catch (_) {}
          el.style.display = "none";
        });
        document.body.appendChild(el);
      }
      el.textContent = msg;
      if (link && link.href) {
        var a = document.createElement("a");
        a.href = link.href;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = link.text || link.href;
        a.style.color = "#a8d8ff";
        a.style.textDecoration = "underline";
        el.appendChild(document.createTextNode(" "));
        el.appendChild(a);
      }
      el.style.display = "block";
      clearTimeout(rosterToast._t);
      if (!link || !link.href) {
        rosterToast._t = setTimeout(function () { el.style.display = "none"; }, 7000);
      }
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
    /* (a) Importing a pack REPLACES the roster's membership, so the
       gate is on the resulting size (the pack's total individuals).
       A pack over the free cap needs an active registration window
       for this roster; a large / grandfathered roster needs a window
       for any membership change. */
    var frImp = window.__SX_ROSTER_FREEMIUM;
    if (frImp && typeof frImp.ensureGate === "function" && typeof frImp.individualsOf === "function") {
      var packN = 0;
      pack.samples.forEach(function (raw) {
        var e0 = cleanRosterEntry(raw);
        if (e0) packN += frImp.individualsOf(e0);
      });
      var gImp = frImp.ensureGate(skin, rosterKey, packN);
      if (!gImp.allowed) {
        if (typeof frImp.blockedToast === "function") frImp.blockedToast(gImp);
        return null;
      }
    }
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
      a.download = (function () {
        /* Download filename (2026-11-27): {RosterName}-{SkinShort}.roster,
           e.g. "Friday Knights-Quest.roster". The skin short name is the
           catalog prefix (quest/sex/polis, …), capitalized — NOT
           sxSkinDownloadPrefix(), which returns the full "Questcapades".
           Sanitized the same way sxExportFileNames sanitizes a profile
           name (illegal filename chars -> space, whitespace -> "-").
           The pack JSON's name field itself is untouched. */
        var skinShort = (function () {
          var prefix = (window.__SX_SKIN_SUBDOMAIN && window.__SX_SKIN_SUBDOMAIN[skin]) || "";
          if (!prefix) prefix = String(skin || "sexcapades").replace(/capades$/, "") || "sex";
          return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        })();
        var safeName = String((pack.name && String(pack.name).trim()) || "Roster")
          .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, "-").replace(/^-+|-+$/g, "") || "Roster";
        return safeName + "-" + skinShort + ".roster";
      })();
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
      rosterFileInput.accept = ".roster,.json,application/json";
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
    if (typeof window !== "undefined" && typeof window.__SX_SKIN_FROM_URL === "function" && window.__SX_SKIN_FROM_URL !== skinFromUrl) {
      return window.__SX_SKIN_FROM_URL();
    }
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
    var research = {};
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
        /* Research backing (Polis Scribe wiring, 2026-11-28): per-topic
           reasons/statistics from the skin topic's `research` field
           ({poleKey: {reasons, statistic, move}}). The Scribe reads it
           to ground each stance's reasons in the prompt; skins whose
           topics carry no research simply register nothing. */
        if (t.research) research[t.id] = t.research;
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
    window.__SX_TOPIC_RESEARCH = research;
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

  /* Research lookup. __SX_RESEARCH_FOR_TOPIC returns the topic's
     research map ({poleKey: {reasons, statistic, move}}) from the
     skin JSON's topic `research` field, or null. The Scribe reads
     it to ground each stance's reasons and statistics in the
     prompt; a topic (or skin) without research returns null and
     the Scribe adds nothing. */
  window.__SX_RESEARCH_FOR_TOPIC = function (topicId) {
    var reg = window.__SX_TOPIC_RESEARCH;
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
          var yearBadge = emblemYearBadgeText(entry);
          if (yearBadge) {
            /* Palimpsest year badge (2026-11-28): the year as a small
               inset number on the shared emblem (the emblem file is
               shared across dated layers, so the year is drawn here). */
            var wrap = document.createElement("span");
            wrap.className = "sx-emblem-wrap";
            wrap.appendChild(img);
            var badge = document.createElement("span");
            badge.className = "sx-emblem-year-badge";
            badge.setAttribute("aria-hidden", "true");
            badge.textContent = yearBadge;
            wrap.appendChild(badge);
            btn.appendChild(wrap);
          } else {
            btn.appendChild(img);
          }
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

  /* Palimpsest year badge (2026-11-28): dated samples (dated layers
     of one archetype) share ONE emblem file, so the year is drawn by
     the app as a small inset number on top of the shared emblem.
     Returns the badge text or "" (no badge). A plain 4-digit year
     shows as 2 digits ("08", "12", "20"); a non-plain date (a range
     or longer string) shows its full text if it fits (up to 4
     characters). "present" and undated samples get no badge.
     Exposed on window so the map center and profile sheet (which
     live in the app bundle, a separate file) reuse the same rule. */
  function emblemYearBadgeText(entry) {
    var d = entry && entry.date != null ? String(entry.date).trim() : "";
    if (!d || d.toLowerCase() === "present") return "";
    if (/^\d{4}$/.test(d)) return d.slice(2);
    return d.length <= 4 ? d : "";
  }
  if (typeof window !== "undefined") window.__SX_EMBLEM_YEAR_TEXT = emblemYearBadgeText;


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
    /* Registration window (item 44): the buy/status button lives in
       the freemium module; ensure it here so it survives menu rebuilds. */
    if (typeof window.__SX_ROSTER_FREEMIUM === "object" && typeof window.__SX_ROSTER_FREEMIUM.ensureBuyButton === "function") window.__SX_ROSTER_FREEMIUM.ensureBuyButton();
    if (!addMenu || document.getElementById("exportRosterChoice")) return;
    /* Create a roster from all loaded profiles (2026-11-27, Jason):
       one action instead of the per-profile About flow. The builder
       lives in 06d (it needs the loaded-profile tables), exposed as
       window.sxCreateRosterFromLoaded; the guard covers an older
       bundle where it does not exist yet. */
    [["exportRosterChoice", "Export roster pack", exportRosterPack], ["importRosterChoice", "Import roster pack", pickRosterFile], ["createRosterFromLoadedChoice", "Create roster from loaded profiles", function () {
      if (typeof window.sxCreateRosterFromLoaded === "function") window.sxCreateRosterFromLoaded();
      else rosterToast("Creating a roster from loaded profiles is not available right now — reload and try again.");
    }]].forEach(function (spec) {
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
     here on every skin load) — see sxTerm() in 05b1-sync-compute.js — so
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
    getRatings: { sex: "Hot list · KinkTest · BDSMtest · Yes / No / Maybe · FetLife", vanilla: "Hot list", exact: true },
    heatMax: { sex: "Horndog", vanilla: "Burning" },
    heatMin: { sex: "Turned off", vanilla: "Withdrawn" }
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
  /* One layout import. Sexcapades passes mergeSaved so the user's
     localStorage defaults overlay the shipped settings. The unmerged
     shipped settings become Reset-to-defaults either way. Other skins
     pass mergeSaved false: a saved payload is Sexcapades-shaped and
     must not land on another skin. */
  function applySkinLayout(data, mergeSaved) {
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
      var settings = mergeSaved ? mergeSavedDefaults(layout.settings) : layout.settings;
      var payload = { app: layout.app, kind: layout.kind, version: layout.version,
        build: layout.build, exportedAt: layout.exportedAt,
        settings: settings };
      if (!mergeSaved) payload.hash = layout.hash;
      var r = hook.importText(JSON.stringify(payload));
      if (!r || !r.ok) return false;
      window.__SEXCAPADES_LAYOUT_DEFAULTS = JSON.parse(JSON.stringify(layout.settings));
      return true;
    } catch (e) {
      /* keep current behavior on any failure */
      return false;
    }
  }
  function applyDefaultLayout(data) {
    return applySkinLayout(data, false);
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

  /* Sexcapades merges saved defaults and drops the stored hash. */
  function applySexcapadesLayout(data) {
    return applySkinLayout(data, true);
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

  /* Boot: applySkin loads the boot skin's categories from its JSON
     once the editor and engine are ready (see bootSkin). The terms
     below are the Sexcapades identity set until that apply lands. */
  /* The bundle renders through window.__SX_TERMS from the first paint:
     resolve the Sexcapades (identity) terms at loader init so the
     helper in 05b1-sync-compute.js never reads an empty map. */
  window.__SX_TERMS = resolveTerms("sexcapades", null);
  window.__SX_HAS_IMPORTERS = true;
  /* Test hooks: the hostname mapping and the boot-menu decision are
     pure functions of their input, so probes can call them with every
     hostname without DNS. */
  if (!window.__SX_SKIN_FOR_HOSTNAME || window.__SX_SKIN_FOR_HOSTNAME === skinForHostname) window.__SX_SKIN_FOR_HOSTNAME = skinForHostname;
  window.__SX_BOOT_SHOULD_OPEN_MENU = bootShouldOpenMenu;
  if (!window.__SX_SKIN_FROM_URL) window.__SX_SKIN_FROM_URL = skinFromUrl;
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
  var bootSkinTarget = (typeof window.__SX_TARGET_SKIN === "function")
    ? window.__SX_TARGET_SKIN(window.location.hostname)
    : (skinFromUrl() || skinForHostname(window.location.hostname));
  setManifestForSkin(bootSkinTarget);
  (function bootSkin() {
    var boot = bootSkinTarget;

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
        /* applySkin must run for the native Sexcapades boot too: since
           Phase 5 emptied the 02b catalog (TAXONOMY_CATEGORIES = []),
           this swap is the ONLY source of categories on a Sexcapades
           boot — the widgets-only seam leaves the taxonomy empty and
           the map paints nothing but the center node. (Regression from
           the 2026-11-22 double-render fix, which special-cased the
           native boot out of this call.) */
        applySkin(data);
        setBrand(boot, data.name);
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
/* ---- Roster freemium — registration-period model (2026-11-27, Jason) ----
   RULED model (item 44):
   - Free roster creation up to 5 individuals (RULED 2026-11-27 — free
     is 5 from the start; supersedes "intro 10, then 5 once it takes
     off"). 5 is the size of a real conversation (around a table, five
     people can actually talk; more than 5 is a different challenge).
     The cap counts INDIVIDUALS, not profiles: a couple = 2, a single
     = 1. A 10-way dynamic is free only via two 5-person rosters (the
     friction of managing two rosters is the deterrent); the $5 window
     buys a single roster over 5.
   - Registration period: 30 days / $5 SETTLED. A one-off ~$5 purchase
     buys a 30-day window to ADD/REMOVE members on ONE roster. A new
     window can EITHER re-open ADD/REMOVE on an existing roster OR
     create a new 10+ roster. No blockchain, no gas.
   - The window gates MEMBERSHIP (ADD/REMOVE — the creator's job), NOT
     content. Members update their own roster profiles at any time.
     ADD/REMOVE both (not ADD-only).
   - One-time use is preferred (one window = one roster). The window is
     bound to a roster on first use (best-effort client-side: the
     binding lives in localStorage). FALLBACK, if one-time use proves
     too hard to enforce: unlimited creations during the window. The
     binding code below is the one-time-use implementation; relaxing it
     is a one-line change (see sxRosterUseWindow).
   - Verification path: Patreon OAuth (PKCE). Discord Premium Role is
     UNAVAILABLE (capades.io has no Server Shop / Server Products, even
     after Community was enabled). Signed-token flow is NOT built (it
     needs a real-time issuer/bot). The app opens a Patreon login in
     the browser, the user grants permission to see their membership /
     purchases, and the app calls Patreon's API from the browser to
     check the one-off $5 product purchase. All client-side, no server
     login. The app learns the user's Patreon identity (with consent) —
     the privacy policy must disclose this (not written here).
   - Patreon IDs (LIVE 2026-11-27): OAuth app "Capades Roster"
     (client ID in the config below; manage at
     patreon.com/portal/registration/register-clients) and the $5
     one-off product "Roster Registration Window (30 days)" (product
     ID 176571871; live in the Shop at
     patreon.com/c/flexcapadesio/shop). Do NOT ship a real client
     secret in the app — PKCE needs no secret.
   Storage: windows live in localStorage key "sexcapades_roster_windows"
   (per device). A window is { id, rosterKey (null until bound),
   createdAt, startsAt (null until first use), expiresAt, patreonUserId,
   productId }. The 30-day clock starts on first use (first add/re-open
   on a roster), and expiresAt = startsAt + 30 days. */

  /* rosterToast (2026-11-27): this module runs at top level, AFTER the
     shared IIFE (01 opens it, 04 closes it) that holds 02's rosterToast,
     so 02's is out of scope here and every call threw ReferenceError —
     swallowed silently by the boot catch, which is why the OAuth return
     showed no message at all. This is the same implementation as 02's,
     so the freemium's messages actually show. */
  function rosterToast(msg, link) {
    /* msg is plain text; link (optional) is {href, text} and is rendered
       as a real anchor (DOM-built, never innerHTML) after the message.
       A toast that carries a link does NOT auto-hide — it stays until
       the user taps it (the toast dismisses on tap, including on the
       link itself, which still opens Patreon in a new tab). */
    try {
      var el = document.getElementById("sxRosterToast");
      if (!el) {
        el = document.createElement("div");
        el.id = "sxRosterToast";
        el.setAttribute("role", "status");
        el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,480px);background:#14181c;color:#f2f4f6;border:1px solid #3a4550;border-radius:10px;padding:10px 14px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45);";
        /* Tap to dismiss: the only dismiss path for a link toast (which
           never auto-hides); harmless on a plain toast, which also
           still auto-hides after 7s. */
        el.addEventListener("click", function () {
          try { clearTimeout(rosterToast._t); } catch (_) {}
          el.style.display = "none";
        });
        document.body.appendChild(el);
      }
      el.textContent = msg;
      if (link && link.href) {
        var a = document.createElement("a");
        a.href = link.href;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = link.text || link.href;
        a.style.color = "#a8d8ff";
        a.style.textDecoration = "underline";
        el.appendChild(document.createTextNode(" "));
        el.appendChild(a);
      }
      el.style.display = "block";
      clearTimeout(rosterToast._t);
      if (!link || !link.href) {
        rosterToast._t = setTimeout(function () { el.style.display = "none"; }, 7000);
      }
    } catch (e) { /* a toast must never break the app */ }
  }

  /* ---- Config: ONE location. Change the cap and the Patreon IDs here. ---- */
  var SX_ROSTER_FREEMIUM_CONFIG = {
    /* Free roster size cap, in INDIVIDUALS. 5 from the start (RULED
       2026-11-27): 5 is the size of a real conversation — around a
       table, five people can actually talk; more than 5 is a different
       kind of challenge. A 10-way dynamic is free only via two 5-person
       rosters (the friction of managing two rosters is the deterrent);
       the $5 window buys a single roster over 5 (one roster, any size). */
    freeCapIndividuals: 5,
    /* Registration window. */
    windowDays: 30,
    priceUSD: 5,
    /* Patreon OAuth (PKCE). Real IDs (live 2026-11-27).
       - OAuth app "Capades Roster": https://www.patreon.com/portal/registration/register-clients
         Redirect URIs registered (26, as of 2026-11-27 — the app page
         itself is the redirect, and Patreon needs an exact match per
         host, so EVERY skin subdomain needs its own listing):
         3 roots: https://flex.capades.io/ , https://sex.capades.io/ , https://capades.io/
         23 app pages (/hosted/app.html on each): capades.io + all 22
         skin subdomains (dance, quest, sex, aesth, bio, chem, dharma,
         experi, fast, fores, lingua, matter, flex, nous, philo, polis,
         praxi, quanta, simul, tech, theori, voca). A new skin subdomain
         needs its app-page URI added here AND on Patreon. The legacy
         bare sexcapades.io is NOT registered (struck 2026-11-27).
         (the app page URL below must match one of them).
       - One-off product "Roster Registration Window (30 days)", $5:
         https://www.patreon.com/posts/roster-window-30-176571871
         (live in the Shop; product ID 176571871).
       Do NOT put a client secret anywhere in this file. */
    patreonClientId: "MYH16SFh3pcPlxr9wx7y9R7e_XlUDUx7JNs0Q8SAmDe9XeDRGJ9f5kCxMS0AqFVm",
    patreonProductId: "176571871",
    /* Direct link to buy the $5 window (the first step of the two-step
       flow, 2026-11-27): the add-menu buy link and the purchase-framed
       error toasts all point here. */
    patreonProductUrl: "https://www.patreon.com/posts/roster-window-30-176571871",
    /* Redirect URI: the app page itself. This exact value must be
       registered in the Patreon OAuth app, or Patreon refuses the login. */
    patreonRedirectUri: "",
    /* Patreon OAuth scopes: identity (who the buyer is) so the app can
       read their memberships/purchases. Adjust if Patreon requires a
       different scope for the one-off purchase check. */
    patreonScopes: "identity identity[email]",
    /* Patreon endpoints. */
    patreonAuthorizeUrl: "https://www.patreon.com/oauth2/authorize",
    patreonTokenUrl: "https://www.patreon.com/api/oauth2/token",
    patreonIdentityUrl: "https://www.patreon.com/api/oauth2/v2/identity"
  };
  function sxRosterFreemiumConfig() {
    var c = SX_ROSTER_FREEMIUM_CONFIG;
    if (!c.patreonRedirectUri) {
      try { c.patreonRedirectUri = window.location.origin + window.location.pathname; } catch (e) { c.patreonRedirectUri = ""; }
    }
    return c;
  }
  function sxRosterFreemiumConfigured() {
    var c = sxRosterFreemiumConfig();
    return Boolean(c.patreonClientId && c.patreonClientId.indexOf("REPLACE_WITH_") !== 0 && c.patreonProductId && c.patreonProductId.indexOf("REPLACE_WITH_") !== 0 && c.patreonRedirectUri);
  }

  var SX_ROSTER_WINDOWS_KEY = "sexcapades_roster_windows";
  var SX_ROSTER_OAUTH_STATE_KEY = "sexcapades_patreon_oauth_state";
  var SX_ROSTER_OAUTH_VERIFIER_KEY = "sexcapades_patreon_oauth_verifier";
  var SX_ROSTER_OAUTH_TOKEN_KEY = "sexcapades_patreon_oauth_token";

  function sxRosterReadWindows() {
    try {
      var raw = localStorage.getItem(SX_ROSTER_WINDOWS_KEY);
      if (!raw) return { v: 1, windows: [] };
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.windows)) return { v: 1, windows: [] };
      return parsed;
    } catch (e) { return { v: 1, windows: [] }; }
  }
  function sxRosterWriteWindows(store) {
    try { localStorage.setItem(SX_ROSTER_WINDOWS_KEY, JSON.stringify(store)); return true; } catch (e) { return false; }
  }
  function sxRosterNow() { return Date.now(); }
  function sxRosterWindowExpired(w, now) {
    if (!w) return true;
    now = now || sxRosterNow();
    return Boolean(w.expiresAt && now >= w.expiresAt);
  }
  function sxRosterWindowActive(w, now) {
    if (!w) return false;
    now = now || sxRosterNow();
    if (!w.startsAt) return true; /* bought but not yet started: still usable */
    return now < (w.expiresAt || 0);
  }
  function sxRosterWindowFor(rosterKey) {
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var found = null;
    store.windows.forEach(function (w) {
      if (w && w.rosterKey === rosterKey && sxRosterWindowActive(w, now)) found = w;
    });
    return found;
  }
  function sxRosterHasWindow(rosterKey) { return Boolean(sxRosterWindowFor(rosterKey)); }
  function sxRosterAvailableWindow() {
    /* An unbound, active window (bought, not yet used on any roster). */
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var found = null;
    store.windows.forEach(function (w) {
      if (w && !w.rosterKey && sxRosterWindowActive(w, now)) found = w;
    });
    return found;
  }
  function sxRosterUseWindow(rosterKey) {
    /* Bind an available window to this roster (one-time use: one window
       = one roster) and start its 30-day clock on first use. Returns
       the window, or null if none is available for this roster.
       FALLBACK (if one-time use proves too hard): relax the binding by
       returning the available window without setting rosterKey — the
       window would then serve any roster for its 30 days. */
    var cfg = sxRosterFreemiumConfig();
    var existing = sxRosterWindowFor(rosterKey);
    if (existing) return existing;
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var win = null;
    store.windows.forEach(function (w) {
      if (!win && w && !w.rosterKey && sxRosterWindowActive(w, now)) win = w;
    });
    if (!win) return null;
    win.rosterKey = String(rosterKey);
    if (!win.startsAt) {
      win.startsAt = now;
      win.expiresAt = now + cfg.windowDays * 24 * 60 * 60 * 1000;
    }
    sxRosterWriteWindows(store);
    return win;
  }
  function sxRosterRecordPurchase(patreonUserId) {
    /* A verified $5 purchase creates a window (unbound, unstarted).
       It binds to a roster and starts its 30-day clock on first use. */
    var cfg = sxRosterFreemiumConfig();
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var win = {
      id: "win-" + now.toString(36) + "-" + Math.floor(Math.random() * 1296).toString(36),
      rosterKey: null,
      createdAt: now,
      startsAt: null,
      expiresAt: null,
      patreonUserId: patreonUserId || null,
      productId: cfg.patreonProductId,
      priceUSD: cfg.priceUSD,
      windowDays: cfg.windowDays
    };
    store.windows.push(win);
    sxRosterWriteWindows(store);
    return win;
  }
  function sxRosterWindowLabel(w) {
    if (!w) return "";
    if (!w.startsAt) return "Registration window ready — 30 days, starts on first use.";
    try {
      var d = new Date(w.expiresAt);
      return "Registration window active until " + d.toLocaleDateString() + ".";
    } catch (e) { return "Registration window active."; }
  }

  /* ---- Counting individuals (the cap counts INDIVIDUALS, not profiles) ----
     A single profile = 1. A couple (a group of 2 individuals) = 2.
     For a live profile id, count leaf (non-group) source individuals
     recursively. For a sample/pack entry, count from its payload:
     a couple entry carries payload.members (an array of two individual
     payloads); anything else counts as 1. */
  function sxRosterLeafCount(profileId, seen) {
    if (!profileId) return 0;
    seen = seen || {};
    if (seen[profileId]) return 0;
    seen[profileId] = true;
    try {
      var rec = (typeof ft !== "undefined" && ft) ? ft[profileId] : null;
      if (rec && rec.kind === "group" && Array.isArray(rec.sourceIds) && rec.sourceIds.length) {
        var total = 0;
        rec.sourceIds.forEach(function (id) { total += sxRosterLeafCount(id, seen); });
        return total;
      }
    } catch (e) { /* fall through: count as a single */ }
    return 1;
  }
  function sxRosterEntryIndividuals(entry) {
    if (!entry || typeof entry !== "object") return 0;
    var payload = entry.payload || {};
    /* A couple entry: payload.members is an array of the individuals. */
    if (Array.isArray(payload.members) && payload.members.length) {
      var n = 0;
      payload.members.forEach(function (m) {
        if (m && Array.isArray(m.members) && m.members.length) n += m.members.length;
        else n += 1;
      });
      return n;
    }
    /* A live group profile saved as a sample: sourceIds name its members. */
    if (Array.isArray(payload.sourceIds) && payload.sourceIds.length) {
      var seen = {};
      var total = 0;
      payload.sourceIds.forEach(function (id) { total += sxRosterLeafCount(id, seen); });
      return total || 1;
    }
    if (entry.kind === "couple" && Array.isArray(entry.members) && entry.members.length) return entry.members.length;
    return 1;
  }
  function sxRosterIndividualCount(skinId, rosterKey) {
    var api = window.__SX_LOCAL_SAMPLES;
    if (!api || typeof api.list !== "function") return 0;
    var list = api.list(skinId || currentSkinId()) || {};
    var total = 0;
    Object.keys(list).forEach(function (k) {
      var e = list[k];
      if (e && e.rosterKey === rosterKey) total += sxRosterEntryIndividuals(e);
    });
    return total;
  }
  function sxRosterIsGrandfathered(skinId, rosterKey) {
    /* A roster over the current free cap: it was built when the cap was
       higher (or with a window). It stays as it is but can't grow. */
    var cfg = sxRosterFreemiumConfig();
    return sxRosterIndividualCount(skinId, rosterKey) > cfg.freeCapIndividuals;
  }

  /* ---- The gate: ADD / REMOVE of roster members ----
     Free roster (at or under the cap): adding up to the cap is free;
     removing is free. Adding beyond the cap needs an active window for
     that roster. Large / grandfathered roster (over the cap): ANY
     membership change (add or remove) needs an active window for that
     roster — its membership is managed through the window. Updating a
     member's own profile (ratings/blurb) is a content update, NOT a
     membership change, and is never gated here (see save() in
     02-samples-rosters.js, which preserves rosterKey on update).
     Returns { allowed, needsWindow, reason }. */
  function sxRosterGate(skinId, rosterKey, newCount) {
    var cfg = sxRosterFreemiumConfig();
    var cap = cfg.freeCapIndividuals;
    var current = sxRosterIndividualCount(skinId, rosterKey);
    if (current > cap) {
      /* Large / grandfathered roster: membership changes need a window. */
      if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
      return { allowed: false, needsWindow: true, reason: "This roster is over the free cap of " + cap + " individuals, so it stays as it is — buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to change its membership." };
    }
    if (newCount <= cap) return { allowed: true, needsWindow: false, reason: "" };
    if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
    return { allowed: false, needsWindow: true, reason: "Adding that would take this roster over the free cap of " + cap + " individuals — buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to add more." };
  }
  function sxRosterGateAdd(skinId, rosterKey, individualsToAdd) {
    var current = sxRosterIndividualCount(skinId, rosterKey);
    return sxRosterGate(skinId, rosterKey, current + (individualsToAdd || 0));
  }
  function sxRosterGateRemove(skinId, rosterKey, individualsToRemove) {
    var current = sxRosterIndividualCount(skinId, rosterKey);
    return sxRosterGate(skinId, rosterKey, current - (individualsToRemove || 0));
  }
  function sxRosterGateImport(skinId, rosterKey, packIndividuals) {
    /* A pack import REPLACES the roster's membership, so the gate is on
       the resulting size (the pack's total individuals). If the roster
       is currently large, any membership change needs a window. */
    var cfg = sxRosterFreemiumConfig();
    var current = sxRosterIndividualCount(skinId, rosterKey);
    if (current > cfg.freeCapIndividuals) {
      if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
      return { allowed: false, needsWindow: true, reason: "This roster is over the free cap of " + cfg.freeCapIndividuals + " individuals, so it stays as it is — buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to change its membership." };
    }
    if (packIndividuals <= cfg.freeCapIndividuals) return { allowed: true, needsWindow: false, reason: "" };
    if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
    return { allowed: false, needsWindow: true, reason: "That roster pack holds " + packIndividuals + " individuals — over the free cap of " + cfg.freeCapIndividuals + ". Buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to load it." };
  }

  function sxRosterEnsureGate(skinId, rosterKey, newCount) {
    /* Check the gate; if it is blocked only for want of a window and
       the creator has an available (unbound) window, bind it to this
       roster (one-time use) and re-check. Returns the final gate. */
    var g = sxRosterGate(skinId, rosterKey, newCount);
    if (g.allowed) return g;
    if (g.needsWindow && sxRosterAvailableWindow()) {
      sxRosterUseWindow(rosterKey);
      g = sxRosterGate(skinId, rosterKey, newCount);
    }
    return g;
  }

  /* ---- Patreon OAuth (PKCE) ----
     No client secret in the app. The flow:
     1. startPatreonOAuth(): make a code_verifier + code_challenge
        (SHA-256, base64url), save the verifier + a random state in
        sessionStorage, and send the browser to Patreon's authorize page.
     2. On return the app loads with ?code=...&state=... — the boot
        handler below exchanges the code for an access token (POST to
        the token endpoint with the code_verifier; no secret), then
        checks the purchase and records a window.
     3. checkPatreonPurchase(token): GET the Patreon identity API with
        the token and look for the configured one-off product among the
        buyer's memberships / entitlements. If found, record a window.
     VERIFICATION STEP STILL OWED (needs the real IDs): the exact field
     that carries a one-off product purchase in Patreon's member-facing
     API must be confirmed once the real product exists. The matcher
     below checks the documented membership/entitlement fields; if the
     product does not appear there, the check fails closed (no window)
     and the API response is logged to the console for diagnosis. */
  function sxRosterBase64Url(bytes) {
    var bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    var b64 = (typeof btoa === "function") ? btoa(bin) : "";
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function sxRosterRandomString(len) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    var out = "";
    try {
      var arr = new Uint8Array(len);
      (window.crypto || {}).getRandomValues ? window.crypto.getRandomValues(arr) : null;
      for (var i = 0; i < len; i++) out += chars.charAt(arr[i] % chars.length);
      if (out.length === len) return out;
    } catch (e) { /* fall through to Math.random */ }
    out = "";
    for (var j = 0; j < len; j++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }
  function sxRosterSha256Base64Url(text) {
    try {
      var subtle = window.crypto && window.crypto.subtle;
      if (!subtle) return Promise.resolve(null);
      var data = new TextEncoder().encode(text);
      return subtle.digest("SHA-256", data).then(function (hash) {
        return sxRosterBase64Url(new Uint8Array(hash));
      });
    } catch (e) { return Promise.resolve(null); }
  }
  function sxPatreonStartOAuth() {
    var cfg = sxRosterFreemiumConfig();
    if (!sxRosterFreemiumConfigured()) {
      rosterToast("The registration window isn't for sale yet — the Patreon product still needs to be created. Check back soon.");
      return false;
    }
    var verifier = sxRosterRandomString(64);
    var state = sxRosterRandomString(32);
    try {
      sessionStorage.setItem(SX_ROSTER_OAUTH_VERIFIER_KEY, verifier);
      sessionStorage.setItem(SX_ROSTER_OAUTH_STATE_KEY, state);
    } catch (e) { rosterToast("Your browser would not store the login — try again."); return false; }
    sxRosterSha256Base64Url(verifier).then(function (challenge) {
      if (!challenge) { rosterToast("Your browser can't do the secure login — try a newer browser."); return; }
      var url = cfg.patreonAuthorizeUrl
        + "?response_type=code"
        + "&client_id=" + encodeURIComponent(cfg.patreonClientId)
        + "&redirect_uri=" + encodeURIComponent(cfg.patreonRedirectUri)
        + "&scope=" + encodeURIComponent(cfg.patreonScopes)
        + "&state=" + encodeURIComponent(state)
        + "&code_challenge=" + encodeURIComponent(challenge)
        + "&code_challenge_method=S256";
      window.location.assign(url);
    });
    return true;
  }
  function sxPatreonExchangeCode(code) {
    var cfg = sxRosterFreemiumConfig();
    var verifier = null;
    try { verifier = sessionStorage.getItem(SX_ROSTER_OAUTH_VERIFIER_KEY); } catch (e) { verifier = null; }
    if (!verifier) return Promise.resolve(null);
    var body = "grant_type=authorization_code"
      + "&code=" + encodeURIComponent(code)
      + "&redirect_uri=" + encodeURIComponent(cfg.patreonRedirectUri)
      + "&client_id=" + encodeURIComponent(cfg.patreonClientId)
      + "&code_verifier=" + encodeURIComponent(verifier);
    return fetch(cfg.patreonTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    }).then(function (r) {
      if (!r.ok) throw new Error("token exchange failed");
      return r.json();
    }).then(function (tok) {
      if (!tok || !tok.access_token) return null;
      try { sessionStorage.setItem(SX_ROSTER_OAUTH_TOKEN_KEY, tok.access_token); } catch (e) { /* token kept in memory only */ }
      try {
        sessionStorage.removeItem(SX_ROSTER_OAUTH_VERIFIER_KEY);
        sessionStorage.removeItem(SX_ROSTER_OAUTH_STATE_KEY);
      } catch (e) { /* non-fatal */ }
      return tok.access_token;
    }).catch(function () { return null; });
  }
  function sxPatreonFindPurchase(identityJson) {
    /* Look for the configured one-off product among the buyer's
       memberships / entitlements. Checks the documented member-facing
       fields (currently_entitled_tiers, benefits, and any id that
       equals the product ID). VERIFICATION STEP: confirm the exact
       field once the real product exists — if the product does not
       appear in these fields, this fails closed (no window) and the
       response is logged for diagnosis. */
    var cfg = sxRosterFreemiumConfig();
    var want = String(cfg.patreonProductId || "");
    if (!want || !identityJson || typeof identityJson !== "object") return false;
    var found = false;
    var visit = function (node, depth) {
      if (found || !node || typeof node !== "object" || depth > 6) return;
      if (Array.isArray(node)) { node.forEach(function (x) { visit(x, depth + 1); }); return; }
      Object.keys(node).forEach(function (k) {
        var v = node[k];
        if ((k === "id" || k === "product_id" || k === "productId") && String(v) === want) found = true;
        if (v && typeof v === "object") visit(v, depth + 1);
      });
    };
    visit(identityJson, 0);
    return found;
  }
  function sxPatreonCheckPurchase(accessToken) {
    var cfg = sxRosterFreemiumConfig();
    var url = cfg.patreonIdentityUrl
      + "?include=memberships"
      + "&fields%5Bmember%5D=patron_status,pledge_relationship_start,currently_entitled_tiers"
      + "&fields%5Buser%5D=full_name";
    return fetch(url, { headers: { "Authorization": "Bearer " + accessToken } })
      .then(function (r) {
        if (!r.ok) throw new Error("identity check failed");
        return r.json();
      })
      .then(function (json) {
        var userId = (json && json.data && json.data.id) ? String(json.data.id) : null;
        var bought = sxPatreonFindPurchase(json);
        if (!bought) {
          try { console.log("[roster-freemium] Patreon purchase check: product not found in identity response.", json); } catch (e) { /* log only */ }
        }
        return { bought: bought, userId: userId };
      })
      .catch(function () { return { bought: false, userId: null }; });
  }
  /* The buy link for the two-step flow (2026-11-27): the purchase-framed
     error toasts point here so the user can buy the $5 window on
     Patreon, then come back and verify. */
  function sxRosterBuyLink() {
    var cfg = sxRosterFreemiumConfig();
    return { href: cfg.patreonProductUrl || "https://www.patreon.com/posts/roster-window-30-176571871", text: "Buy the $5 window on Patreon" };
  }
  function sxPatreonHandleOAuthReturn() {
    /* Called at boot. If the app loaded with ?code=...&state=... from
       Patreon, verify the state, exchange the code, check the purchase,
       and record a window. Cleans the code out of the URL afterwards. */
    var params = null;
    try { params = new URLSearchParams(window.location.search || ""); } catch (e) { return; }
    var code = params.get("code");
    var state = params.get("state");
    if (!code) return;
    var savedState = null;
    try { savedState = sessionStorage.getItem(SX_ROSTER_OAUTH_STATE_KEY); } catch (e) { savedState = null; }
    if (!state || !savedState || state !== savedState) {
      rosterToast("That Patreon login did not confirm a $5 registration window purchase. Buy the $5 window on Patreon first, then try again.", sxRosterBuyLink());
      return;
    }
    var cleanUrl = function () {
      try {
        var u = new URL(window.location.href);
        u.searchParams.delete("code");
        u.searchParams.delete("state");
        history.replaceState(null, "", u.pathname + u.search + u.hash);
      } catch (e) { /* the code staying in the URL is harmless: single-use */ }
    };
    sxPatreonExchangeCode(code).then(function (token) {
      cleanUrl();
      if (!token) { rosterToast("Patreon would not confirm a $5 registration window purchase for that login. Buy the $5 window on Patreon first, then try again.", sxRosterBuyLink()); return; }
      return sxPatreonCheckPurchase(token);
    }).then(function (res) {
      if (!res) return;
      if (res.bought) {
        sxRosterRecordPurchase(res.userId);
        rosterToast("Registration window bought — 30 days, starting when you first use it on a roster. Add members or re-open a roster to use it.");
        if (typeof sxRosterRefreshBuyButton === "function") sxRosterRefreshBuyButton();
      } else {
        rosterToast("Patreon did not show that $5 registration window purchase. If you just bought it, wait a moment and try the login again — or buy the $5 window on Patreon first.", sxRosterBuyLink());
      }
    });
  }

  /* ---- UI: buy link + verify submenu (two-step, 2026-11-27, Jason) ----
     The add menu carries a split row: the buy link itself (an anchor to
     the Patreon product) plus a "Verify…" toggle that opens a drill-in
     submenu with "Verify my purchase" (the OAuth check). Buying comes
     first, verifying second — the old single button ran the OAuth check
     before the user had bought anything, which read backwards. The row
     is a grid item in #profileAddMenu; the submenu is a sibling of the
     add menu (like the roster submenus) and is registered in
     window.__SX_SAMPLE_SUBMENUS so 06d's close/refresh paths treat it
     like the others. The row is destroyed by menu rebuilds, so ensure
     drops the orphaned submenu too and recreates the pair fresh — the
     wire hook then binds exactly once per element pair. */
  function sxRosterBuyButtonEl() { return document.getElementById("rosterWindowChoice"); }
  function sxRosterVerifyToggleEl() { return document.getElementById("rosterWindowVerifyToggle"); }
  function sxRosterWindowMenuEl() { return document.getElementById("rosterWindowMenu"); }
  function sxRosterWindowMenuBackEl() { return document.getElementById("rosterWindowMenuBack"); }
  function sxRosterRemoveRosterWindowMenu(menu) {
    menu = menu || sxRosterWindowMenuEl();
    if (!menu) return;
    var reg = window.__SX_SAMPLE_SUBMENUS || [];
    var ix = reg.indexOf(menu);
    if (ix >= 0) reg.splice(ix, 1);
    if (menu.parentElement) menu.remove();
  }
  function sxRosterWireRosterWindowMenu() {
    var toggle = sxRosterVerifyToggleEl();
    var menu = sxRosterWindowMenuEl();
    var back = sxRosterWindowMenuBackEl();
    if (!toggle || !menu || menu.__sxRosterWired) return;
    var wire = (typeof window.__SX_WIRE_SAMPLE_SUBMENU === "function") ? window.__SX_WIRE_SAMPLE_SUBMENU : null;
    if (!wire) return;
    menu.__sxTrigger = toggle;
    wire(toggle, menu, back);
    menu.__sxRosterWired = true;
  }
  function sxRosterRefreshBuyButton() {
    var link = sxRosterBuyButtonEl();
    if (!link) return;
    var toggle = sxRosterVerifyToggleEl();
    var verifyBtn = document.getElementById("rosterWindowVerify");
    var cfg = sxRosterFreemiumConfig();
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var active = null, ready = null;
    store.windows.forEach(function (w) {
      if (!w) return;
      if (w.startsAt && sxRosterWindowActive(w, now)) active = w;
      else if (!w.startsAt && sxRosterWindowActive(w, now)) ready = w;
    });
    var label, disabled;
    if (active) { label = "Registration window: " + sxRosterWindowLabel(active); disabled = true; }
    else if (ready) { label = "Registration window ready — 30 days, starts on first use"; disabled = true; }
    else { label = "Buy a registration window — $" + cfg.priceUSD + " · " + cfg.windowDays + " days"; disabled = false; }
    link.textContent = label;
    if (disabled) { link.setAttribute("aria-disabled", "true"); link.classList.add("is-disabled"); }
    else { link.removeAttribute("aria-disabled"); link.classList.remove("is-disabled"); }
    if (toggle) toggle.disabled = disabled;
    if (verifyBtn) verifyBtn.disabled = disabled;
  }
  function sxRosterEnsureBuyButton() {
    var addMenu = document.getElementById("profileAddMenu");
    if (!addMenu) { sxRosterRefreshBuyButton(); return; }
    if (document.getElementById("rosterWindowChoice")) {
      sxRosterWireRosterWindowMenu();
      sxRosterRefreshBuyButton();
      return;
    }
    /* The row was destroyed by a menu rebuild. Drop the orphaned
       submenu too (its trigger is gone) so the pair is recreated
       fresh with exactly-once wiring. */
    sxRosterRemoveRosterWindowMenu();
    var cfg = sxRosterFreemiumConfig();
    var productUrl = cfg.patreonProductUrl || "https://www.patreon.com/posts/roster-window-30-176571871";
    var row = document.createElement("div");
    row.id = "rosterWindowRow";
    row.className = "roster-window-row";
    var link = document.createElement("a");
    link.id = "rosterWindowChoice";
    link.className = "roster-window-buy";
    link.setAttribute("role", "menuitem");
    link.href = productUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.addEventListener("click", function (e) {
      if (link.getAttribute("aria-disabled") === "true") e.preventDefault();
    });
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "rosterWindowVerifyToggle";
    toggle.className = "roster-window-verify-toggle";
    toggle.setAttribute("role", "menuitem");
    toggle.setAttribute("aria-haspopup", "menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Verify…";
    row.appendChild(link);
    row.appendChild(toggle);
    addMenu.appendChild(row);
    /* Drill-in submenu: "Verify my purchase" (the OAuth check). */
    var menu = document.createElement("div");
    menu.id = "rosterWindowMenu";
    menu.className = "profile-add-menu profile-sample-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Registration window");
    menu.hidden = true;
    var back = document.createElement("button");
    back.type = "button";
    back.id = "rosterWindowMenuBack";
    back.className = "sample-menu-back";
    back.setAttribute("role", "menuitem");
    back.textContent = "‹ Back";
    menu.appendChild(back);
    var verify = document.createElement("button");
    verify.type = "button";
    verify.id = "rosterWindowVerify";
    verify.setAttribute("role", "menuitem");
    verify.textContent = "Verify my purchase";
    verify.addEventListener("click", function () { sxPatreonStartOAuth(); });
    menu.appendChild(verify);
    if (addMenu.parentElement) addMenu.parentElement.appendChild(menu);
    else document.body.appendChild(menu);
    menu.__sxTrigger = toggle;
    (window.__SX_SAMPLE_SUBMENUS = window.__SX_SAMPLE_SUBMENUS || []).push(menu);
    sxRosterWireRosterWindowMenu();
    sxRosterRefreshBuyButton();
  }
  function sxRosterBlockedToast(gate) {
    /* The gate blocked a membership change. Show the reason and offer
       the purchase as the way through (a second click starts OAuth). */
    rosterToast(gate.reason + " Open “Buy a registration window” in the add menu — buy it on Patreon, then choose “Verify my purchase” there.");
  }

  /* ---- Public API (called from 02-samples-rosters.js, 03-taxonomy-loader-layout.js, 06d3-profile-about.js) ---- */
  window.__SX_ROSTER_FREEMIUM = {
    config: sxRosterFreemiumConfig,
    configured: sxRosterFreemiumConfigured,
    individualsOf: sxRosterEntryIndividuals,
    leafCount: sxRosterLeafCount,
    count: sxRosterIndividualCount,
    isGrandfathered: sxRosterIsGrandfathered,
    gate: sxRosterGate,
    gateAdd: sxRosterGateAdd,
    gateRemove: sxRosterGateRemove,
    gateImport: sxRosterGateImport,
    ensureGate: sxRosterEnsureGate,
    hasWindow: sxRosterHasWindow,
    useWindow: sxRosterUseWindow,
    availableWindow: sxRosterAvailableWindow,
    windowLabel: sxRosterWindowLabel,
    startPurchase: sxPatreonStartOAuth,
    handleOAuthReturn: sxPatreonHandleOAuthReturn,
    ensureBuyButton: sxRosterEnsureBuyButton,
    refreshBuyButton: sxRosterRefreshBuyButton,
    blockedToast: sxRosterBlockedToast
  };

  /* Boot: handle a Patreon OAuth return (if this load came back from
     Patreon with ?code=...) and make sure the buy button exists. */
  try { sxPatreonHandleOAuthReturn(); } catch (e) { try { console.error("[roster-freemium] OAuth return handler failed:", e); } catch (_) { /* best-effort: never break boot */ } }
  try { sxRosterEnsureBuyButton(); } catch (e) { /* the menu may not exist yet; refreshSampleMenu rebuilds it */ }
