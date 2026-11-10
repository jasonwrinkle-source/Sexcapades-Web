
/* AVATAR-MUSIC — Lane A (app) player.
   Clicking the avatar plays the current display's verse. Audio lives at fixed
   hosted addresses and is never embedded; a missing file is a quiet no-op that
   falls through to the avatar's pre-music job (the guide door) where it had
   one. One shared audio element; display resolved at click time; changing
   displays stops playback. */
(function () {
  "use strict";
  /* The songbook module is read at USE time, never captured at parse:
     SB() re-reads window.SX_SONGBOOK on every call (avatar click, cue
     run), so a module that arrives after this block parses is picked up
     as soon as it lands. */
  function SB() {
    if (window.SX_SONGBOOK && !window.SX_SONGBOOK._localBase) {
      window.SX_SONGBOOK._localBase = true;
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        window.SX_SONGBOOK.BASE = "/hosted/assets/audio/";
      }
    }
    return window.SX_SONGBOOK;
  }
  /* Song addresses, bank, tag, and skip spellings come from the shared
     module (hosted/assets/sx-songbook.js). DEVIATION (app only): the
     shared six-surface contract loads the module synchronously directly
     before each surface's player block; the app instead loads it with
     the async attribute — so it neither blocks parsing nor delays
     DOMContentLoaded — and reads it lazily via SB() above. That async +
     lazy-read pairing is the blessed app pattern; the other surfaces
     keep the synchronous contract. If the module is absent at use time,
     playback falls through to the avatar's guide door (GAP behavior)
     and cueing stays inert — no errors.
     TAG policy lives in the module header: bump only on file replacement. */

  /* Display -> verse table. Slugs now carry foldered paths —
     <collection>/<style-folder>/<file>.mp3 under the shared module's BASE;
     slug:null rows are GAPs with no determined path (no verse; avatar inert
     there unless a fallback exists). The verse slugs here are keyed views
     of the shared bank's verse section (harness-proven: every non-null
     TABLE slug is in the bank; the bank's verse section is these slugs
     plus verse-sync-cards-fractal, which has no app row). Match-tab rows
     are LIVE (match-bowtie is wired through the active match tab;
     match-circledot is a GAP by design — song 2 undetermined). Ring-listing
     rows remain RESERVED: no ring-display markup exists yet, only this
     player's query. */
  var TABLE = {
    "hypermap":        { slug: "the-explainer/e1/verse-hypermap.mp3", label: "Hypermap" },
    "popularity":      { slug: "the-explainer/e1/verse-popularity-on-deck.mp3", label: "Popularity List" },
    "profile":         { slug: "the-explainer/e1/verse-profile-imports-quick-start.mp3", label: "Profile" },
    "profile-import":  { slug: "the-explainer/e1/verse-profile-imports-quick-start.mp3", label: "Profile and imports" },
    "pair-compare":    { slug: "the-explainer/e1/verse-cast-compare.mp3", label: "Compare" },
    "group-compare":   { slug: null, label: "Group compare" },
    "scribe":          { slug: "the-explainer/e1/verse-writers.mp3", label: "Scribe" },
    "scene-setter":    { slug: "the-explainer/e1/verse-writers.mp3", label: "Scene Setter" },
    "scene-sentinel":  { slug: null, label: "Scene Sentinel" },
    "layout-editor":   { slug: null, label: "Layout editor" },
    "about":           { slug: "the-explainer/e1/explainer-fixed-cut.mp3", label: "About" },
    /* match-bowtie live via the active match tab; match-circledot GAP by design; ring rows still reserved */
    "match-bowtie":    { slug: "the-explainer/e1/verse-cast-compare.mp3", label: "Krossmatch" },
    "match-circledot": { slug: null, label: "Straight Talk" },
    "ring-hot-topics": { slug: null, label: "Hot Topics" },
    "ring-curiosity":  { slug: null, label: "Curiosity?" },
    "ring-not-topics": { slug: null, label: "Not topics" }
  };
  window.SX_AVATAR_MUSIC_TABLE = TABLE;

  var audio = null;
  var activeBtn = null;   /* button owning the current attempt/playback */
  var attemptSeq = 0;     /* guards async error paths per attempt */
  var statusEl = null;
  var slotAnchors = {};   /* slot button -> its own guide anchor (fallback) */

  function announce(msg) {
    if (!statusEl) {
      statusEl = document.createElement("span");
      statusEl.className = "sx-avatar-music-sr";
      statusEl.setAttribute("aria-live", "polite");
      statusEl.id = "sxAvatarMusicStatus";
      document.body.appendChild(statusEl);
    }
    statusEl.textContent = msg;
  }

  function rowLabel(key) {
    var row = TABLE[key];
    return row ? row.label : "this display";
  }

  function setBtnIdle(btn) {
    if (!btn) return;
    btn.classList.remove("is-playing");
    btn.classList.remove("is-loading");
    btn.setAttribute("aria-pressed", "false");
    var key = btn.getAttribute("data-sx-music-key") || currentDisplayKey();
    btn.setAttribute("aria-label", "Play the verse for the " + rowLabel(key));
  }

  function haltAudio() {
    if (!audio) return;
    try { audio.pause(); } catch (e) {}
    try { audio.removeAttribute("src"); audio.load(); } catch (e) {}
    audio.removeAttribute("data-sx-attempt");
  }

  function stopPlayback() {
    attemptSeq++;
    haltAudio();
    if (activeBtn) { var b = activeBtn; activeBtn = null; setBtnIdle(b); }
    announce("Stopped");
  }

  function fallbackFor(btn) {
    if (btn.getAttribute("data-sx-music-fallback") !== "guide") return;
    var anchor = slotAnchors[btn.getAttribute("data-sx-slot-id") || ""] || null;
    if (!anchor) anchor = document.getElementById("reviewLink");
    if (anchor) anchor.click();
  }

  function failAttempt(seq) {
    if (seq !== attemptSeq || !activeBtn) return;
    var btn = activeBtn;
    activeBtn = null;
    attemptSeq++;
    haltAudio();
    setBtnIdle(btn);
    announce("No verse yet for the " + rowLabel(btn.getAttribute("data-sx-music-key") || currentDisplayKey()));
    fallbackFor(btn);
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("ended", function () { stopPlayback(); });
    audio.addEventListener("playing", function () {
      if (activeBtn && activeBtn.classList.contains("is-loading")) {
        activeBtn.classList.remove("is-loading");
        activeBtn.classList.add("is-playing");
      }
    });
    audio.addEventListener("error", function () {
      var a = audio.getAttribute("data-sx-attempt");
      if (a) failAttempt(parseInt(a, 10));
    });
    return audio;
  }

  function playFor(btn, key) {
    var row = TABLE[key];
    stopPlayback();
    btn.setAttribute("data-sx-music-key", key);
    if (!row || !row.slug) { fallbackFor(btn); return; } /* GAP: inert or fallback */
    if (!SB()) { fallbackFor(btn); return; } /* module absent at use time: GAP behavior */
    var seq = ++attemptSeq;
    activeBtn = btn;
    var a = ensureAudio();
    a.setAttribute("data-sx-attempt", String(seq));
    btn.classList.add("is-loading");
    btn.setAttribute("aria-pressed", "true");
    btn.setAttribute("aria-label", "Stop the verse for the " + row.label);
    a.src = SB().songUrl(row.slug);
    var p = null;
    try { p = a.play(); } catch (e) { failAttempt(seq); return; }
    if (p && typeof p.then === "function") {
      p.then(function () {
        if (seq !== attemptSeq || activeBtn !== btn) return;
        btn.classList.remove("is-loading");
        btn.classList.add("is-playing");
        announce("Playing: " + row.label + " verse");
      }, function () { failAttempt(seq); });
    } else {
      btn.classList.remove("is-loading");
      btn.classList.add("is-playing");
    }
  }

  function onAvatarClick(btn, keyFn) {
    if (activeBtn === btn) { stopPlayback(); return; }
    playFor(btn, keyFn());
  }

  /* ---- display resolution (at click time) ---- */
  function dialogOpen(id) {
    var d = document.getElementById(id);
    return !!(d && d.open);
  }
  /* DISPLAY_REGISTRY — the one screen registry (finding 3). It drives the
     precedence choice (currentDisplayKey), the per-screen buttons (SLOT_KEYS
     is derived from it below), and the stop-on-change view-button list.
     Order is load-bearing and matches the old if-chain exactly.
     F8 OPEN QUESTION, left unchanged: profile screens resolve a header song
     but have no per-screen button (slot:false below) — intentional or
     oversight is not on record, so do NOT add profile slot entries. */
  var DISPLAY_REGISTRY = [
    { dialogs: ["scribeDialog", "scribeChoiceDialog"], key: "scribe", slot: true },
    { dialogs: ["negotiationDialog"], key: "scene-setter", slot: true },
    { dialogs: ["safetyDialog"], key: "scene-sentinel", slot: true },
    { dialogs: ["profileDetailsDialog", "profileAboutDialog"], key: "profile", slot: false },
    { dialogs: ["profileImportDialog", "fetlifeMapDialog", "converterDialog", "testChooserDialog", "importResultDialog"], key: "profile-import", slot: false },
    { dialogs: ["outlineDialog"], key: "popularity", slot: true },
    { layoutEditor: true, key: "layout-editor", slot: false },
    { ring: true, key: "ring", slot: false },
    { matchTab: true, key: "match", slot: false }
  ];
  /* Stop-on-change view buttons: the stop-only input of the registry (the
     dialog/tab/editor watchers in watchDisplayChanges are generic). */
  var DISPLAY_STOP_BUTTONS = ["mapListViewButton", "outlineMapViewButton", "safetyViewButton",
    "negotiationViewButton", "scribeViewButton", "scribeChoiceViewButton"];
  function currentDisplayKey() {
    for (var i = 0; i < DISPLAY_REGISTRY.length; i++) {
      var entry = DISPLAY_REGISTRY[i];
      if (entry.dialogs) {
        for (var j = 0; j < entry.dialogs.length; j++) {
          if (dialogOpen(entry.dialogs[j])) return entry.key;
        }
      } else if (entry.layoutEditor) {
        var le = document.getElementById("layoutEditor");
        if (le && !le.hidden) return "layout-editor";
      } else if (entry.ring) {
        var ringListing = null;
        Array.prototype.forEach.call(document.querySelectorAll("#sxMatchStage [data-sx-ring-display]"), function (el) {
          var root = el.closest(".sx-match-root");
          if (!ringListing && root && !root.hidden) ringListing = el;
        });
        if (ringListing) return "ring-" + ringListing.getAttribute("data-sx-ring-display");
      } else if (entry.matchTab) {
        var matchTab = document.querySelector("#profileTabs .sx-match-tab.is-active");
        if (matchTab) return matchTab.getAttribute("data-sx-match-kind") === "circledot" ? "match-circledot" : "match-bowtie";
      }
    }
    return "hypermap";
  }

  function refreshHeaderLabel() {
    var btn = document.getElementById("sxAvatarMusicBtn");
    if (btn && activeBtn !== btn) {
      btn.setAttribute("data-sx-music-key", currentDisplayKey());
      setBtnIdle(btn);
    }
  }

  /* ---- stop on display change ---- */
  function watchDisplayChanges() {
    var stop = function () { if (activeBtn) stopPlayback(); refreshHeaderLabel(); };
    Array.prototype.forEach.call(document.querySelectorAll("dialog"), function (d) {
      new MutationObserver(stop).observe(d, { attributes: true, attributeFilter: ["open"] });
    });
    var tabs = document.getElementById("profileTabs");
    if (tabs) new MutationObserver(stop).observe(tabs, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["class", "aria-selected", "aria-pressed"]
    });
    var le = document.getElementById("layoutEditor");
    if (le) new MutationObserver(stop).observe(le, { attributes: true, attributeFilter: ["hidden"] });
    DISPLAY_STOP_BUTTONS.forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener("click", stop, true);
    });
  }

  /* ---- slot avatars (per-view title bars) ---- */
  /* SLOT_KEYS is DERIVED from the registry (slot:true entries only), never
     hand-written. It must equal the old literal exactly: outlineDialog →
     popularity, safetyDialog → scene-sentinel, negotiationDialog →
     scene-setter, scribeChoiceDialog/scribeDialog → scribe. No profile
     entries (finding 8, left alone). */
  var SLOT_KEYS = {};
  DISPLAY_REGISTRY.forEach(function (entry) {
    if (entry.slot && entry.dialogs) {
      entry.dialogs.forEach(function (id) { SLOT_KEYS[id] = entry.key; });
    }
  });
  var slotCount = 0;
  function wireSlot(slot) {
    if (slot.getAttribute("data-sx-music-wired")) return;
    var anchor = slot.querySelector("a.review-callout");
    if (!anchor) return; /* clone not landed yet; the observer retries */
    var dlg = slot.closest("dialog");
    var key = dlg ? SLOT_KEYS[dlg.id] : null;
    if (!key) return;
    var headerBtn = document.getElementById("sxAvatarMusicBtn");
    var headerImg = headerBtn ? headerBtn.querySelector("img") : null;
    if (!headerImg) return;
    slot.setAttribute("data-sx-music-wired", "1");
    var slotId = "slot" + (++slotCount);
    var wrap = document.createElement("span");
    wrap.className = "guide-avatar-wrap";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-music-btn sx-slot-avatar";
    btn.setAttribute("data-sx-music-key", key);
    btn.setAttribute("data-sx-music-fallback", "guide");
    btn.setAttribute("data-sx-slot-id", slotId);
    btn.setAttribute("aria-pressed", "false");
    btn.appendChild(headerImg.cloneNode(true));
    wrap.appendChild(btn);
    slot.insertBefore(wrap, anchor);
    slotAnchors[slotId] = anchor;
    btn.addEventListener("click", function () { onAvatarClick(btn, function () { return key; }); });
    setBtnIdle(btn);
  }

  function wire() {
    var headerBtn = document.getElementById("sxAvatarMusicBtn");
    if (headerBtn && !headerBtn.getAttribute("data-sx-music-wired")) {
      headerBtn.setAttribute("data-sx-music-wired", "1");
      headerBtn.setAttribute("data-sx-music-fallback", "guide");
      headerBtn.addEventListener("click", function () { onAvatarClick(headerBtn, currentDisplayKey); });
      setBtnIdle(headerBtn);
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-guide-slot]"), wireSlot);
    refreshHeaderLabel();
  }

  /* ---- background songbook cueing (cache warm only) ----
     Warms the browser HTTP cache for the songbook bank so a later tap on
     the avatar can start from cache. Never touches the audio element,
     never plays, never renders UI. Runs once per page load, after load,
     at idle, and stands down on constrained connections or once playback
     has started. State is exposed read-only as SX_AVATAR_MUSIC.cue. */
  var cue = { queued: [], warmed: [], skipped: [], done: false };
  var cueStarted = false;

  function cueOrderedPaths() {
    if (!SB()) return [];
    var row = TABLE[currentDisplayKey()];
    return SB().orderedOwnFirst([row && row.slug]);
  }

  function runCue() {
    if (!SB()) { cue.queued = []; cue.done = true; return; }
    var urls = cueOrderedPaths().map(function (path) {
      return SB().songUrl(path);
    });
    cue.queued = urls.slice();
    function finish() { cue.done = true; }
    if (typeof fetch !== "function") {
      urls.forEach(function (u) { cue.skipped.push({ url: u, reason: SB().SKIP.NO_FETCH }); });
      finish();
      return;
    }
    var conn = navigator.connection;
    if (conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g")) {
      urls.forEach(function (u) { cue.skipped.push({ url: u, reason: SB().SKIP.CONNECTION }); });
      finish();
      return;
    }
    var i = 0;
    function step() {
      if (i >= urls.length) { finish(); return; }
      if (activeBtn) {
        for (; i < urls.length; i++) cue.skipped.push({ url: urls[i], reason: SB().SKIP.ABORTED });
        finish();
        return;
      }
      var url = urls[i++];
      fetch(url).then(function (res) {
        if (!res || !res.ok) {
          cue.skipped.push({ url: url, reason: SB().SKIP.HTTP });
          step();
          return;
        }
        return res.arrayBuffer().then(function () {
          cue.warmed.push(url);
          step();
        }, function () {
          cue.skipped.push({ url: url, reason: SB().SKIP.BODY });
          step();
        });
      }, function () {
        cue.skipped.push({ url: url, reason: SB().SKIP.FETCH });
        step();
      });
    }
    step();
  }

  function scheduleCue() {
    if (cueStarted) return;
    cueStarted = true;
    var afterLoad = function () {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(runCue, { timeout: 5000 });
      } else {
        setTimeout(runCue, 1500);
      }
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad);
  }

  function boot() {
    wire();
    watchDisplayChanges();
    scheduleCue();
    new MutationObserver(function () { wire(); }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* Inspection surface for verification probes (read-only state + table). */
  window.SX_AVATAR_MUSIC = {
    table: TABLE,
    cue: cue,
    currentDisplayKey: currentDisplayKey,
    stop: stopPlayback,
    state: function () {
      return { active: !!activeBtn,
               key: activeBtn ? activeBtn.getAttribute("data-sx-music-key") : null,
               src: audio ? (audio.getAttribute("src") || null) : null,
               paused: audio ? audio.paused : true,
               currentTime: audio ? audio.currentTime : 0,
               readyState: audio ? audio.readyState : 0 };
    }
  };
})();

