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
