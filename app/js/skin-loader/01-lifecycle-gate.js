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

