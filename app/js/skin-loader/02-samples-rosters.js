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

