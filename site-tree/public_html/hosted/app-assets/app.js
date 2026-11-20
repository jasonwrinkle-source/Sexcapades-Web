
/* ---- shell shared constants ---- */
/* Small-screen boundary, single source for shell JS: the 620px width
   below which shell layout switches to its narrow form. It is the JS
   form of the CSS @media (max-width:620px) rules (the dominant shell
   breakpoint); CSS cannot read a JS constant, so the two spellings
   must agree by this comment until a CSS/JS boundary token exists.
   The bundle's own 620/700 thresholds (map framing, popovers) are
   bundle-owned and deliberately not routed through this shell
   constant. */
window.__sxSmallScreenMax = 620;


/* ---- module: dialog-helpers ---- */
/* Shared dialog helpers: openDialog/closeDialog were defined once inside
   the old view-nav + Scene Sentinel block and used by both halves. They
   are pure functions of the dialog element passed in — no element lookups
   at definition time — so they are published on window.__sxDialog at parse
   time, before either consumer module boots on DOMContentLoaded. The
   bundle's Wi/Ui helpers delegate to this module (falling back to their
   own identical bodies if it is absent), so every dialog open/close in
   shell and bundle runs this one showModal/fallback implementation.
   Dialog registry (shell-ui single source): dialogIds() scans the live
   DOM for <dialog id="..."> elements, so the registry can never drift
   from the markup the way a hand-kept list would; get/openById/closeById
   are the id-based entry points. Call ids() only after the DOM exists.
   Dialogs created dynamically without an id (e.g. the converter target
   prompt) are opened/closed element-wise through open/close. */
window.__sxDialog = (function () {
  function openDialog(d) {
    if (!d || d.open) return;
    try { if (typeof d.showModal === "function") d.showModal(); else { d.setAttribute("open", ""); d.classList.add("fallback-open"); } }
    catch (e) { d.setAttribute("open", ""); d.classList.add("fallback-open"); }
  }
  function closeDialog(d) {
    if (!d) return;
    try { if (typeof d.close === "function" && d.open) d.close(); else d.removeAttribute("open"); }
    catch (e) { d.removeAttribute("open"); }
    d.classList.remove("fallback-open");
  }
  function getDialog(id) { return id ? document.getElementById(id) : null; }
  function dialogIds() { return Array.prototype.map.call(document.querySelectorAll("dialog[id]"), function (d) { return d.id; }).sort(); }
  function openDialogById(id) { openDialog(getDialog(id)); }
  function closeDialogById(id) { closeDialog(getDialog(id)); }
  return { open: openDialog, close: closeDialog, get: getDialog, ids: dialogIds, openById: openDialogById, closeById: closeDialogById };
})();


/* ---- module: view-nav ---- */
__sxInit(function () {
/* View navigation dropdown: the view selector is the app's main
   navigation — a pull-down menu (not a modal) listing only Sync Map,
   Popularity List, and Scene Sentinel. Every view carries the
   same button naming the current view; clicking it opens the menu under the
   button, arrow keys move through the options, and Enter or a tap selects.
   The bundle's direct-to-list handler on the header button is intercepted
   in the capture phase so the menu always wins. Scribe and Scene Setter
   are NOT menu entries (owner ruling, 2026-10-27; sweep completed by the
   shell-ui stage): they are reached only by clicking their toolbar
   buttons, so they keep the bundle's own gating and open paths; this
   menu only ever leaves them (map / list / safety entries), as do Escape
   and backdrop clicks. Opening Scene Sentinel opens its dialog through the shared
   dialog helpers (window.__sxDialog) and lets the scene-sentinel module
   render it (window.__sxSentinelRenderAll); this module also publishes
   window.__sxOpenSentinel for the notification deep-link. Everything in
   this module runs inside boot(), gated on DOMContentLoaded through the
   shared __sxInit queue: every element lookup and listener attachment
   waits until the DOM exists, so a build pipeline that splits or reorders
   script execution can never make the shared byId helper capture a null
   and crash on addEventListener. Every listener attachment is additionally
   null-guarded. */
(function () {
  function boot() {
  var openDialog = window.__sxDialog.open;
  var closeDialog = window.__sxDialog.close;
  function syncBtn() { if (typeof window.__sxSyncViewButton === "function") window.__sxSyncViewButton(); }

  var menu = SexcapadesRuntime.DOM.byId("viewNavMenu");
  var listDlg = SexcapadesRuntime.DOM.byId("outlineDialog");
  var safetyDlg = SexcapadesRuntime.DOM.byId("safetyDialog");
  var scribeDlg = SexcapadesRuntime.DOM.byId("scribeDialog");
  var scribeChoiceDlg = SexcapadesRuntime.DOM.byId("scribeChoiceDialog");
  var setterDlg = SexcapadesRuntime.DOM.byId("negotiationDialog");
  var menuBtn = null;

  function currentView() {
    if (setterDlg && setterDlg.open) return "setter";
    if ((scribeDlg && scribeDlg.open) || (scribeChoiceDlg && scribeChoiceDlg.open)) return "scribe";
    if (safetyDlg && safetyDlg.open) return "safety";
    if (listDlg && listDlg.open) return "list";
    return "map";
  }
  function closeListViaRoute() {
    if (!listDlg || !listDlg.open) return;
    if (String(location.hash || "") !== "#app/map") location.hash = "#app/map";
    else listDlg.dispatchEvent(new Event("cancel"));
  }
  function clickClose(id) { var b = SexcapadesRuntime.DOM.byId(id); if (b) b.click(); }
  function closeScribe() {
    if (scribeDlg && scribeDlg.open) closeDialog(scribeDlg);
    if (scribeChoiceDlg && scribeChoiceDlg.open) closeDialog(scribeChoiceDlg);
  }
  function closeSetter() {
    if (setterDlg && setterDlg.open) closeDialog(setterDlg);
  }
  function goMap() {
    closeMenu();
    if (safetyDlg && safetyDlg.open) closeDialog(safetyDlg);
    closeScribe();
    closeSetter();
    closeListViaRoute();
    syncBtn();
  }
  function goList() {
    closeMenu();
    if (safetyDlg && safetyDlg.open) closeDialog(safetyDlg);
    closeScribe();
    closeSetter();
    if (listDlg && listDlg.open) { syncBtn(); return; }
    var h = String(location.hash || "");
    if (h === "#app/list" || h === "#app/listview") {
      location.hash = "#app/map";
      SexcapadesRuntime.TimerManager.setTimeout(function () { location.hash = "#app/list"; }, 80);
    } else {
      location.hash = "#app/list";
    }
    syncBtn();
  }
  function goSafety() {
    closeMenu();
    closeScribe();
    closeSetter();
    closeListViaRoute();
    if (safetyDlg && safetyDlg.open) { syncBtn(); return; }
    openDialog(safetyDlg);
    if (window.__sxSentinelNotifInit) window.__sxSentinelNotifInit();
    if (window.__sxSentinelRenderAll) window.__sxSentinelRenderAll();
    syncBtn();
  }
  window.__sxOpenSentinel = goSafety;

  function goSetter() {
    closeMenu();
    if (safetyDlg && safetyDlg.open) closeDialog(safetyDlg);
    closeScribe();
    closeListViaRoute();
    if (setterDlg && setterDlg.open) { syncBtn(); return; }
    var btn = SexcapadesRuntime.DOM.byId("openNegotiation");
    if (btn) btn.click();
    else if (setterDlg) openDialog(setterDlg);
    syncBtn();
  }

  function goScribe() {
    closeMenu();
    if (safetyDlg && safetyDlg.open) closeDialog(safetyDlg);
    closeSetter();
    closeListViaRoute();
    if ((scribeDlg && scribeDlg.open) || (scribeChoiceDlg && scribeChoiceDlg.open)) { syncBtn(); return; }
    var btn = SexcapadesRuntime.DOM.byId("scribeTab");
    if (btn) btn.click();
    else if (scribeChoiceDlg) openDialog(scribeChoiceDlg);
    syncBtn();
  }

  /* Scan or Import is an ACTION, not a view: it opens the import flow
     through the same entry point the Add menu's Scan or Import button
     uses (#importProfileChoice → ww() in 06d-profile-sheet.js), so the
     origin handling (ordinary create-a-profile import, no pair origin)
     is identical. It must never become the "current view": currentView()
     never returns "import", so no checkmark lands on it and
     currentLabel() never renames the button to it. */
  function goImport() {
    closeMenu();
    if (safetyDlg && safetyDlg.open) closeDialog(safetyDlg);
    closeScribe();
    closeSetter();
    closeListViaRoute();
    var btn = SexcapadesRuntime.DOM.byId("importProfileChoice");
    if (btn) btn.click();
    syncBtn();
  }

  function getMultiSelectCount() {
    try {
      if (window.SexcapadesEngine && window.SexcapadesEngine.State) {
        if (typeof window.SexcapadesEngine.State.getMultiSelectCount === "function") {
          return window.SexcapadesEngine.State.getMultiSelectCount();
        }
        if (typeof window.SexcapadesEngine.State.getMultiSelectIds === "function") {
          var ids = window.SexcapadesEngine.State.getMultiSelectIds();
          if (Array.isArray(ids)) return ids.length;
        }
      }
    } catch (e) {}
    var selected = document.querySelectorAll("#profileTabs .profile-tab-button.is-selected, #profileTabs .profile-tab-button.is-multiselected");
    if (selected.length > 0) return selected.length;
    var allTabs = document.querySelectorAll("#profileTabs .profile-tab-button");
    if (allTabs.length === 1) return 1;
    return 0;
  }

  /* -------- View navigation dropdown (pull-down menu, not a modal) -------- */
  function menuItems() {
    return menu ? Array.prototype.slice.call(menu.querySelectorAll("[data-view-target]")) : [];
  }
  function itemEnabled(it) { return !it.classList.contains("is-disabled"); }
  function refreshMenu() {
    var cur = currentView();
    var count = getMultiSelectCount();
    menuItems().forEach(function (it) {
      var v = it.getAttribute("data-view-target");
      /* "import" is an action, not a view: it never carries a checkmark
         (the ✓ comes from aria-checked="true"), and aria-checked is
         invalid on role="menuitem", so leave the attribute off it. */
      if (v !== "import") it.setAttribute("aria-checked", v === cur ? "true" : "false");
      var disabled = false;
      var reason = "";
      if (v === "setter" || v === "safety") {
        if (count < 2) {
          disabled = true;
          reason = "Requires 2 or more profiles in multi-select";
        }
      } else if (v === "scribe") {
        if (count < 1) {
          disabled = true;
          reason = "Requires at least 1 profile in multi-select";
        }
      }
      if (disabled) {
        it.classList.add("is-disabled");
        it.setAttribute("aria-disabled", "true");
        it.setAttribute("title", reason);
      } else {
        it.classList.remove("is-disabled");
        it.removeAttribute("aria-disabled");
        it.removeAttribute("title");
      }
    });
  }
  function positionMenu(btn) {
    var r = btn.getBoundingClientRect();
    menu.style.visibility = "hidden";
    menu.hidden = false;
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.visibility = "";
  }
  function focusItem(it) {
    menuItems().forEach(function (x) {
      x.classList.toggle("is-active", x === it);
      x.tabIndex = x === it ? 0 : -1;
    });
    if (it) { try { it.focus({ preventScroll: true }); } catch (e) { it.focus(); } }
  }
  function openMenu(btn) {
    if (!menu || !btn) return;
    /* Move the menu into the button's dialog (if any) so it stays
       interactive above a modal dialog; on the map it lives in body. */
    var host = btn.closest("dialog") || document.body;
    if (menu.parentNode !== host) host.appendChild(menu);
    menuBtn = btn;
    refreshMenu();
    positionMenu(btn);
    btn.setAttribute("aria-expanded", "true");
    var cur = menu.querySelector('[data-view-target="' + currentView() + '"]');
    var enabled = menuItems().filter(itemEnabled);
    focusItem(cur && itemEnabled(cur) ? cur : enabled[0]);
  }
  function closeMenu(refocus) {
    if (!menu) { menuBtn = null; return; }
    var btn = menuBtn;
    menu.hidden = true;
    menuBtn = null;
    if (menu.parentNode !== document.body) document.body.appendChild(menu);
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
      if (refocus) { try { btn.focus({ preventScroll: true }); } catch (e) { btn.focus(); } }
    }
  }
  function choose(it) {
    if (!it || !itemEnabled(it)) return;
    var btn = menuBtn;
    var v = it.getAttribute("data-view-target");
    if (v === "map") goMap();
    else if (v === "list") goList();
    else if (v === "setter") goSetter();
    else if (v === "safety") goSafety();
    else if (v === "scribe") goScribe();
    else if (v === "import") goImport();
    if (btn && document.contains(btn)) {
      var host = btn.closest("dialog");
      if (!host || !host.open) { try { btn.focus({ preventScroll: true }); } catch (e) { __sxErrLog("focus", e); } }
    }
  }
  if (menu) menu.addEventListener("click", function (ev) {
    var it = ev.target && ev.target.closest ? ev.target.closest("[data-view-target]") : null;
    if (it && menu.contains(it)) choose(it);
  });
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var btn = t.closest(".view-nav-btn");
    if (btn) {
      ev.preventDefault();
      ev.stopPropagation();
      if (menu && !menu.hidden && menuBtn === btn) closeMenu();
      else openMenu(btn);
      return;
    }
    if (menu && !menu.hidden && !t.closest("#viewNavMenu")) closeMenu();
  }, true);
  document.addEventListener("keydown", function (ev) {
    if (menu && !menu.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); closeMenu(true); return; }
      if (ev.key === "Tab") { closeMenu(); return; }
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp" || ev.key === "Home" || ev.key === "End") {
        ev.preventDefault();
        var en = menuItems().filter(itemEnabled);
        if (!en.length) return;
        var active = document.activeElement;
        var idx = active ? en.indexOf(active) : -1;
        var nxt;
        if (ev.key === "Home") nxt = en[0];
        else if (ev.key === "End") nxt = en[en.length - 1];
        else if (idx === -1) nxt = ev.key === "ArrowDown" ? en[0] : en[en.length - 1];
        else nxt = ev.key === "ArrowDown" ? en[(idx + 1) % en.length] : en[(idx - 1 + en.length) % en.length];
        focusItem(nxt);
        return;
      }
      if ((ev.key === "Enter" || ev.key === " ") && document.activeElement && menu.contains(document.activeElement)) {
        ev.preventDefault();
        choose(document.activeElement);
        return;
      }
    } else {
      var b = ev.target && ev.target.closest ? ev.target.closest(".view-nav-btn") : null;
      if (b && (ev.key === "ArrowDown" || ev.key === "ArrowUp")) {
        ev.preventDefault();
        openMenu(b);
      }
    }
  }, true);
  window.addEventListener("resize", function () { closeMenu(); });
  window.addEventListener("scroll", function () { if (menu && !menu.hidden) closeMenu(); }, true);
  }
  boot();
})();
});


/* ---- module: view-nav-labels & list-ondeck (folded from patches) ---- */
__sxInit(function () {
(function () {
  function boot() {
  var listDlg = SexcapadesRuntime.DOM.byId("outlineDialog");
  var safetyDlg = SexcapadesRuntime.DOM.byId("safetyDialog");
  var scribeDlg = SexcapadesRuntime.DOM.byId("scribeDialog");
  var scribeChoiceDlg = SexcapadesRuntime.DOM.byId("scribeChoiceDialog");
  var setterDlg = SexcapadesRuntime.DOM.byId("negotiationDialog");
  function listLabel() {
    try {
      if (typeof window.__sxOnDeckTotal === "function") {
        var tab = document.querySelector('#profileTabs .profile-tab-button[aria-selected="true"][data-view]');
        var pid = tab ? tab.getAttribute("data-view") : "__empty-profile-preview__";
        if (pid && window.__sxOnDeckTotal(pid) > 0) return "On Deck";
      }
    } catch (e) { if (window.__sxErrLog) __sxErrLog("list-label", e); }
    return "Hot List";
  }
  function currentLabel() {
    if (setterDlg && setterDlg.open) return "Scene Setter";
    if ((scribeDlg && scribeDlg.open) || (scribeChoiceDlg && scribeChoiceDlg.open)) return "Scribe";
    if (safetyDlg && safetyDlg.open) return "Scene Sentinel";
    if (listDlg && listDlg.open) return listLabel();
    if (/^#\/?(?:app\/)?compare\/?$/i.test(String(location.hash || ""))) return "Compare";
    return "Hypermap";
  }
  function sync() {
    var label = currentLabel() + " ▾";
    var btns = document.querySelectorAll(".view-nav-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = label;
      btns[i].setAttribute("aria-haspopup", "menu");
      btns[i].removeAttribute("aria-pressed");
    }
  }
  window.__sxSyncViewButton = sync;
  window.__sxCurrentViewLabel = currentLabel;
  window.__sxListLabel = listLabel;
  try {
    if (String(location.hash || '') === '#sentinel') {
      try { history.replaceState(null, '', '#app/map'); } catch (e) { __sxErrLog("sentinel-route", e); }
      setTimeout(function () { if (window.__sxOpenSentinel) window.__sxOpenSentinel(); }, 400);
    }
  } catch (e) { __sxErrLog("sentinel-open", e); }
  window.addEventListener('message', function (ev) {
    try {
      if (ev && ev.data && ev.data.type === 'sexcapades-open-sentinel' && window.__sxOpenSentinel) window.__sxOpenSentinel();
    } catch (e) { __sxErrLog("sentinel-message", e); }
  });
  if (window.MutationObserver) {
    var dlgs = [listDlg, safetyDlg, scribeDlg, scribeChoiceDlg, setterDlg];
    for (var j = 0; j < dlgs.length; j++) {
      if (dlgs[j]) new MutationObserver(sync).observe(dlgs[j], { attributes: true, attributeFilter: ["open"] });
    }
  }
  window.addEventListener("hashchange", sync);
  sync();

  // On Deck list item label following
  var item = document.querySelector('#viewNavMenu [data-view-target="list"]');
  if (item) {
    var queued = false;
    function refreshListLabel() {
      var label = (typeof window.__sxListLabel === "function") ? window.__sxListLabel() : "Hot List";
      if (item.textContent !== label) item.textContent = label;
      if (item.getAttribute("data-tooltip-name") !== label) item.setAttribute("data-tooltip-name", label);
    }
    function refreshSoon() {
      if (queued) return;
      queued = true;
      var tm = window.SexcapadesRuntime && SexcapadesRuntime.TimerManager;
      var raf = (tm && typeof tm.requestAnimationFrame === "function") ? function (cb) { return tm.requestAnimationFrame(cb); } : function (cb) { return window.requestAnimationFrame(cb); };
      raf(function () { queued = false; refreshListLabel(); });
    }
    refreshListLabel();
    var tabs = SexcapadesRuntime.DOM.byId("profileTabs");
    if (tabs && window.MutationObserver) new MutationObserver(refreshSoon).observe(tabs, { childList: true, subtree: true, attributes: true });
    var count = SexcapadesRuntime.DOM.byId("outlineHeaderCount");
    if (count && window.MutationObserver) new MutationObserver(function () {
      refreshSoon();
      if (typeof window.__sxSyncViewButton === "function") window.__sxSyncViewButton();
    }).observe(count, { childList: true, characterData: true, subtree: true });
    document.addEventListener("click", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest(".view-nav-btn")) refreshListLabel();
    }, true);
  }
  }
  boot();
})();
});


/* ---- module: skin-menu (Flexcapades prototype) ---- */
/* Long-press on the app header opens a menu listing the 15 skins, so the
   Flexcapades engine can be tried on without a subdomain or a new domain.
   All 15 skins load for real via window.FlexcapadesSkins
   (app/js/skin-loader.js) — picking a skin swaps its taxonomy in and
   re-renders the map; picking Sexcapades restores the kink map.
   Trigger: pointer hold (~600ms) on the header bar, touch or mouse, OR
   Shift+Click anywhere on the header (see below). Triple-click is GONE:
   counting taps fought the title's own About button (tap 1 opened About
   instantly, so a triple could never complete) and is removed entirely —
   no tap counting anywhere in this module. The hold starts on empty
   header space and on the title button (the secondary trigger kept for
   the title); every other header control keeps working untouched, and
   the hold timer clears on any real movement or scroll so it cannot
   break scrolling. No visible button, hint, or icon. The click that
   ends the long-press is swallowed (capture phase), so the menu opening
   under the pointer can never instantly select an item or close itself.
   Menu closes on item select, outside tap, or Escape. Shift+Click: a
   capture-phase click listener on the header opens the menu at the click
   point when ev.shiftKey is set, and stops the click so the title's
   About handler (or any other header control) never runs. Normal clicks
   pass through untouched. */
__sxInit(function () {
(function () {
  function boot() {
  var LONG_PRESS_MS = 600;
  var MOVE_CANCEL_PX = 12;
  var header = document.querySelector("header.intro");
  var menu = document.getElementById("skinMenu");
  var note = document.getElementById("skinNote");
  if (!header || !menu) return;

  var holdTimer = null;
  var holdPointerId = null;
  var holdX = 0, holdY = 0;
  var holdFired = false;
  var swallowClick = false;
  var noteTimer = null;

  function isInteractive(t) {
    return !!t && !!t.closest && !!t.closest("button, a, input, select, textarea, label, summary, [role='button'], [contenteditable]");
  }
  function menuOpen() { return !menu.hidden; }

  function showNote(text) {
    if (!note) return;
    note.textContent = text;
    note.hidden = false;
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { note.hidden = true; noteTimer = null; }, 5000);
  }
  if (note) note.addEventListener("click", function () {
    note.hidden = true;
    if (noteTimer) { clearTimeout(noteTimer); noteTimer = null; }
  });

  function positionMenu(x, y) {
    menu.style.visibility = "hidden";
    menu.hidden = false;
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    var left = Math.max(8, Math.min(x, window.innerWidth - mw - 8));
    var top = y + 8;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, y - mh - 8);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.visibility = "";
  }
  function openMenu(x, y, swallow) {
    positionMenu(x, y);
    /* Swallow the click that ends this very press: it lands on the menu
       (or outside it) a beat after pointerup, and must neither select
       an item nor close the menu. The flag clears on a zero-delay timer
       scheduled from pointerup, which runs after the click event.
       Only armed when the caller says so (swallow=true, the long-press
       path, where that click is still coming). The triple-click path
       opens from a timer long after the last press ended — no click is
       pending, and arming it would swallow the user's NEXT click, the
       one meant to close the menu. */
    if (swallow) {
      swallowClick = true;
      var clearOnce = function () { setTimeout(function () { swallowClick = false; }, 0); };
      document.addEventListener("pointerup", clearOnce, { once: true });
      document.addEventListener("pointercancel", clearOnce, { once: true });
    }
    var activeSkin = window.FlexcapadesSkins ? window.FlexcapadesSkins.active() : "sexcapades";
    var cur = menu.querySelector('[data-skin="' + activeSkin + '"]') || menu.querySelector('[data-skin="sexcapades"]');
    if (cur) { try { cur.focus({ preventScroll: true }); } catch (e) { cur.focus(); } }
    markCurrent(activeSkin);
  }
  function closeMenu() {
    if (!menuOpen()) return;
    menu.hidden = true;
  }
  /* Programmatic open for the flex.capades.io boot (skin-loader calls
     this once when the hostname picks no skin): opens just below the
     header, centred, with no click to swallow. */
  window.__SX_OPEN_SKIN_MENU = function () {
    var r = header.getBoundingClientRect();
    openMenu(Math.round(r.left + r.width / 2), Math.round(r.bottom), false);
  };
  function skinName(item) {
    var n = item.querySelector(".skin-name");
    return n ? n.textContent.trim() : (item.getAttribute("data-skin") || "That skin");
  }
  function markCurrent(skin) {
    menu.querySelectorAll("[data-skin]").forEach(function (it) {
      it.setAttribute("aria-checked", it.getAttribute("data-skin") === skin ? "true" : "false");
    });
  }
  /* Skin id -> subdomain prefix (2026-11-18, Jason): picking a skin
     from this menu navigates to that skin's subdomain instead of the
     in-app loader.load() switch — a plain page navigation, which
     always works. The map is the inverse of HOSTNAME_SKINS in
     app/js/skin-loader.js (a lookup, NOT a string-strip — stripping
     "capades" gives the wrong prefix for Philoscapades, Vocapades,
     and Expericapades). */
  var SKIN_SUBDOMAIN = { sexcapades: "sex", poliscapades: "polis", forescapades: "fores", philoscapades: "philo", aesthcapades: "aesth", vocapades: "voca", techcapades: "tech", dharmacapades: "dharma", theoricapades: "theori", praxicapades: "praxi", quantacapades: "quanta", expericapades: "experi", simulcapades: "simul", mattercapades: "matter", chemcapades: "chem" };
  function choose(item) {
    if (!item) return;
    var skin = item.getAttribute("data-skin");
    closeMenu();
    var loader = window.FlexcapadesSkins;
    var prefix = SKIN_SUBDOMAIN[skin];
    if (prefix) {
      /* Already on this skin — nothing to do (avoids a pointless reload). */
      if (loader && typeof loader.active === "function" && loader.active() === skin) return;
      window.location.href = "https://" + prefix + ".capades.io/";
      return;
    }
    /* No prefix in the map — fall back to the in-app load. */
    if (skin === "sexcapades") {
      if (loader && loader.active() !== "sexcapades") {
        loader.load("sexcapades").then(function () {
          markCurrent("sexcapades");
          showNote("Back to Sexcapades.");
        }, function (err) {
          showNote("Couldn't restore Sexcapades: " + (err && err.message || err));
        });
      }
      return;
    }
    if (loader) {
      loader.load(skin, skinName(item)).then(function () {
        markCurrent(skin);
        var n = window.__SX_SKIN_TOPIC_COUNT || 0;
        var cats = 0;
        try { cats = window.TaxonomyLoader.loadTaxonomy().categories.length; } catch (e) { cats = 0; }
        showNote(skinName(item) + " loaded — " + n + " topics across " + cats + " categories.");
      }, function (err) {
        showNote("Couldn't load " + skinName(item) + ": " + (err && err.message || err));
      });
      return;
    }
    showNote(skinName(item) + " isn't loaded yet — its taxonomy lives in a briefing document, not in the app. Only Sexcapades is live today.");
  }
  menu.addEventListener("click", function (ev) {
    var it = ev.target && ev.target.closest ? ev.target.closest("[data-skin]") : null;
    if (it && menu.contains(it)) choose(it);
  });

  function cancelHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    holdPointerId = null;
    holdFired = false;
  }
  header.addEventListener("pointerdown", function (ev) {
    if (holdPointerId !== null) { cancelHold(); return; }
    /* The title button is interactive, but it is also a hold trigger:
       a hold on it opens the menu exactly like a hold on empty header
       space — same timer, same ending-click swallow, so the title's
       About handler never sees that click. Long-press is the secondary
       trigger beside Shift+Click, and the title is where the finger
       lands. Every other interactive control still opts out of the hold. */
    var onTitle = !!(ev.target && ev.target.closest && ev.target.closest("#openAppAbout"));
    if (isInteractive(ev.target) && !onTitle) return;
    if (ev.button !== undefined && ev.button !== 0) return;
    holdPointerId = ev.pointerId;
    holdX = ev.clientX; holdY = ev.clientY;
    holdFired = false;
    holdTimer = setTimeout(function () {
      holdTimer = null;
      holdFired = true;
      openMenu(holdX, holdY, true);
    }, LONG_PRESS_MS);
  });
  header.addEventListener("pointermove", function (ev) {
    if (holdPointerId === null || ev.pointerId !== holdPointerId) return;
    if (Math.abs(ev.clientX - holdX) > MOVE_CANCEL_PX || Math.abs(ev.clientY - holdY) > MOVE_CANCEL_PX) cancelHold();
  });
  header.addEventListener("pointerup", function (ev) {
    if (holdPointerId !== null && ev.pointerId === holdPointerId) cancelHold();
  });
  header.addEventListener("pointercancel", function (ev) {
    if (holdPointerId !== null && ev.pointerId === holdPointerId) cancelHold();
  });
  /* Shift+Click trigger (replaces triple-click, removed 2026-11-15: tap
     counting fought the title's About button and could never work
     there). A capture-phase click listener on the header: a Shift+Click
     anywhere on the header opens the menu at the click point, with no
     click-swallow armed (nothing is pending after the click). The click
     is stopped here so it never reaches the title's About handler or
     any other header control. Normal clicks (shiftKey false) pass
     through untouched and are never counted — there is no counting
     anywhere now. If the menu is already open, a Shift+Click closes it
     in the document capture listener and reopens it here, so it ends
     open. */
  header.addEventListener("click", function (ev) {
    if (!ev.shiftKey) return;
    ev.stopPropagation();
    ev.preventDefault();
    openMenu(ev.clientX, ev.clientY, false);
  }, true);
  header.addEventListener("contextmenu", function (ev) {
    /* A touch long-press raises contextmenu while the menu is open —
       suppress the browser's own callout so the skin menu owns the
       gesture. Never suppressed when the skin menu is closed. */
    if (menuOpen() || holdFired) ev.preventDefault();
  });
  window.addEventListener("scroll", function () { cancelHold(); if (menuOpen()) closeMenu(); }, true);
  window.addEventListener("blur", cancelHold);
  document.addEventListener("click", function (ev) {
    if (swallowClick) { swallowClick = false; ev.stopPropagation(); return; }
    if (!menuOpen()) return;
    var t = ev.target;
    if (t && t.closest && !t.closest("#skinMenu")) closeMenu();
  }, true);
  document.addEventListener("keydown", function (ev) {
    if (menuOpen() && ev.key === "Escape") { ev.preventDefault(); closeMenu(); }
  }, true);
  window.addEventListener("resize", function () { if (menuOpen()) closeMenu(); });
  }
  boot();
})();
});
__sxInit(function () {
(function () {
  var CODES = { "Power exchange": "POWEREX", "Bondage & restriction": "BONDAGE", "Impact, pain & body modification": "IMPACT", "Sensation & atmosphere": "SENSATN", "Roleplay & identity": "ROLEPLY", "Clothing, materials & objects": "CLOTHNG", "Body focus & appearance": "BODYFOCS", "Psychological dynamics": "PSYCHOL", "Watching, exposure & settings": "WATCHNG", "Partner configurations": "PARTNER", "Sex acts": "SEXACTS", "Positions": "POSITION", "Orgasm & reproductive play": "ORGASM", "Fluids & messy play": "FLUIDS", "Primal & pursuit": "PRIMAL", "Service & ritual": "SERVICE", "Fantasy & transformation": "FANTASY", "Connection & aftercare": "CONNECT" };
  var style = document.createElement("style");
  style.textContent = ".sx-path-line{display:block;color:var(--muted);font-size:11px;line-height:1.3;letter-spacing:.01em;white-space:normal}";
  document.head.appendChild(style);
  function branchTitle(details) {
    var el = details.querySelector(":scope > * > .outline-branch-title");
    return el ? el.textContent.trim() : "";
  }
  function pathFor(row) {
    var label = row.querySelector(".outline-topic-label");
    if (!label) return "";
    var name = label.textContent.trim();
    if (!name) return "";
    var titles = [], n = row.parentElement;
    while (n && n.id !== "outlineDialog") {
      if (n.matches && n.matches("details.outline-branch")) {
        var tt = branchTitle(n);
        if (tt && tt !== name) titles.unshift(CODES[tt] || tt);
      }
      n = n.parentElement;
    }
    titles.push(name);
    return titles.join("\u203a");
  }
  function applyRow(row) {
    var path = pathFor(row);
    if (!path) return;
    var label = row.querySelector(".outline-topic-label");
    /* No native title on the topic name (2026-11-19): the name already
       shows the shared description popup on hover, and a browser title
       would arrive ~a second later and overlap it. The path itself
       stays visible as the .sx-path-line under the name. */
    if (label && label.title) label.removeAttribute("title");
    var copy = row.querySelector(".outline-topic-copy");
    if (!copy) return;
    var line = copy.querySelector(":scope > .sx-path-line");
    if (!line) { line = document.createElement("small"); line.className = "sx-path-line"; copy.appendChild(line); }
    if (line.textContent !== path) line.textContent = path;
  }
  function scan(root) {
    (root || document).querySelectorAll(".outline-row").forEach(applyRow);
  }
  var dlg = document.getElementById("outlineDialog");
  if (!dlg) return;
  var pending = null;
  function schedule() {
    if (pending) return;
    pending = setTimeout(function () { pending = null; scan(dlg); }, 80);
  }
  try { new MutationObserver(schedule).observe(dlg, { childList: true, subtree: true }); } catch (e) { __sxErrLog("list-path-observe", e); }
  dlg.addEventListener("toggle", schedule, true);
  scan(dlg);
})();
});

(function(){
  function ready(){
    var panel=document.getElementById("layoutEditor"),close=document.getElementById("layoutEditorClose"),lastCollision="grow";if(!panel)return;document.body.prepend(panel);
    // ============================================================
    // LAYOUT EDITOR - SURFACE INDEX (F5, layout-editor refactor)
    // ------------------------------------------------------------
    // This ready() closure is the layout editor's whole home: the
    // panel that tunes spacing, sizes and per-branch / per-topic
    // overrides, runs the Anneal, and draws the on-map measurement
    // numbers. Its full surface:
    //
    // STATE (flat variables - see NAMESPACE DIRECTION below)
    //   panel / close .......... the #layoutEditor element + close btn
    //   ids .................... element-id map for global controls
    //   lastCollision .......... last non-off collision mode
    //   customSpacing .......... stashed Custom spacing values (G4-7)
    //   metricOn, metricId, metricOverlayOn, metricTimer,
    //   metricRun, metricGlobalRun
    //                          ... measurement picker state, the
    //                              500 ms debounce timer, run guards
    //   settlePending, settleTimer, settleArmDeadline, dkReceipt
    //                          ... Anneal settle-watch state + receipt
    //   deknotterRunning, deknotterCancelRequested,
    //   deknotterBusyStart, deknotterBusyTimer ... Anneal run state
    //   editorSyncGuard, liveSyncMuted, liveSyncTimer
    //                          ... cross-window live-sync guards/timer
    //   applyBusyBtn ........... button an in-flight apply marks busy
    //
    // FUNCTIONS, BY JOB
    //   Settings core: config(), collect(), apply(),
    //     stableSettingsString(), sync(), spacingNameFor(),
    //     spacingValuesOf(), copyOverrides()
    //   Single-item actuators: lrActuate() over the LR_ACT table;
    //     the applyBranch* / applyKink* / applySubcat* /
    //     applySpokeAngle wrappers all delegate to it
    //   Apply-to-all arming: lrG3Armed(), lrG3Divert(),
    //     bindForAll(), forallApply() over lrG3ForAllFns
    //   Metrics: the LayoutMetrics registry (register / get),
    //     scheduleMetric(), measureLocals(), calculateGlobal()
    //   Anneal driver: onDeknotterClick(), runDeknotterCascade(),
    //     renderDkReceipt() + the dkFmt* formatters, and the settle
    //     watch (noteSettlePending / settleTick / onSettleLanded)
    //   Cross-window live sync: scheduleLiveSync(),
    //     collectEditorState(), applyEditorState(); exposed to the
    //     shell as window.__SEXCAPADES_LAYOUT_UI, with the test hook
    //     window.__SEXCAPADES_LAYOUT_TEST at the end of this script
    //   Panel chrome: open(), shut(), setLayoutFullscreen(), the
    //     branch-order / collision menus, le-capsule + tilt-drawer
    //     controls, coalesceSlider()
    //
    // NAMED MODULES - the editor's newer homes
    //   LR_ACT ............... table-driven actuator rows (Edit 1):
    //                          one row per single-item control,
    //                          carrying its element ids, override
    //                          store, scope and divert level
    //   MetricNumbersView .... on-map numbers: state + the single
    //                          render path (Edit 2)
    //   MetricGeometry ....... shared map-geometry helpers (Edit 2):
    //                          world frame, node positions, boxes
    //   lrG3ForAllFns ........ apply-to-all batch closures keyed by
    //                          group|level|control (Edit 1, F2)
    //
    // NAMESPACE DIRECTION: new editor machinery goes in named
    // modules like the three above. The legacy flat globals stay
    // flat until a separately-authorized migration: cross-window
    // live sync and other shell code reach these variables and
    // functions by name (applyEditorState replays a received state
    // into them; __SEXCAPADES_LAYOUT_UI / __SEXCAPADES_LAYOUT_TEST
    // expose them), so moving them is high-churn. F5 is therefore
    // PARTIAL by design: this index + direction only; the full
    // migration is deferred, not done.
    // ============================================================
    var ids={stagger:"layoutStagger",expandAll:"layoutExpandAll",crossmin:"layoutCrossmin",nudge:"layoutNudge",showRelations:"layoutShowRelations",propFan:"layoutPropFan",subcatOrder:"layoutSubcatOrder",staggerDensity:"layoutStaggerDensity",spokeLen:"layoutSpokeLen",subLen:"layoutSubLen",pad:"layoutPad",repulsion:"layoutRepulsion",fontScale:"layoutFontScale",centerRingScale:"layoutCenterRingScale",leafOvergrowth:"layoutLeafOvergrowth",autoShrinkFactor:"layoutAutoShrinkFactor",subcatCloudShrinkFactor:"layoutSubcatCloudShrinkFactor",repulsionEnabled:"layoutRepulsionEnabled",staticMap:"layoutStaticMap",animations:"layoutAnimations",mapSliders:"layoutMapSliders",collisionEnabled:"layoutCollisionEnabled"},bundles=window.__SEXCAPADES_LAYOUT_BUNDLES||{compact:{spokeLen:2.34,subLen:1.02,pad:1.19,repulsion:0},airy:{spokeLen:2.6,subLen:1.2,pad:1.4,repulsion:0},print:{spokeLen:2.08,subLen:0.9,pad:0.91,repulsion:0}};
    // config(): window.__SEXCAPADES_LAYOUT_API is the primary
    // settings source. The window.__SEXCAPADES_LAYOUT fallback in
    // the next line exists for legacy callers that boot without
    // the API object - documented here (F8); do not remove the
    // fallback without retiring those callers.
    function config(){var c=window.__SEXCAPADES_LAYOUT_API?window.__SEXCAPADES_LAYOUT_API.get():Object.assign({},window.__SEXCAPADES_LAYOUT);if(c.animations===undefined)c.animations=!!(window.__SEXCAPADES_LAYOUT&&window.__SEXCAPADES_LAYOUT.animations);if(c.mapSliders===undefined)c.mapSliders=!!(window.__SEXCAPADES_LAYOUT&&window.__SEXCAPADES_LAYOUT.mapSliders);return c}
    // copyOverrides: shallow-copy each entry. Object-valued entries
    // (branch/subcat/kink overrides, angle offsets) are copied;
    // scalar leaves (the shrink-flag maps are boolean-valued) pass
    // through verbatim — Object.assign({}, true) is {}, which used
    // to fold every armed shrink flag to an empty object on import.
    function copyOverrides(value){var out={};Object.keys(value||{}).forEach(function(key){var v=value[key];out[key]=(v&&typeof v==="object")?Object.assign({},v):v});return out}
    // Override-entry shapes (Rank 8): ONE definition per store, shared by
    // all three apply-entry paths — the single-item actuators (LR_ACT),
    // the apply-to-all batch closures (bindForAll), and the tilt
    // reset/restore handlers. A shape change lands here once and reaches
    // all three; no path re-spells an entry. Branch entries carry length
    // + angle and preserve any other field already on the entry
    // (subScale/kinkScale); a missing or non-positive length falls back
    // to the baked tuned length for the branch, the same fallback the
    // sync readouts use. Kink entries are length-only replacements.
    // Subcategory entries preserve the previous entry and take the
    // patched field. Angle offsets are set-or-delete: zero removes.
    function branchOverrideEntry(prev,patch,name){var entry=Object.assign({},prev||{},patch||{});if(!(Number(entry.length)>0))entry.length=bakedBranchBase(name);if(entry.angle===undefined||entry.angle===null||!patch||!Object.prototype.hasOwnProperty.call(patch,"angle"))entry.angle=Number(prev&&prev.angle)||0;return entry}
    function kinkOverrideEntry(length){return{length:length}}
    function subcatOverrideEntry(prev,patch){return Object.assign({},prev||{},patch||{})}
    function setAngleOffset(store,key,value){if(value)store[key]={angle:value};else delete store[key]}
    // Spacing presets + Custom (Group 4, G4-7): a preset's name is
    // shown only when the four spacing values match that preset's
    // bundle exactly; anything else is Custom. The shipped tuned
    // values (spokeLen 2.6, subLen 1.2, pad 1.4, repulsion 0) are exactly
    // the Airy bundle, so a fresh map boots as Airy. customSpacing stashes
    // the user's tuned values: flipping to a preset never overwrites
    // them, and flipping back to Custom restores them exactly.
    var customSpacing=null;
    function spacingValuesOf(s){if(!s)return null;var v={spokeLen:Number(s.spokeLen),subLen:Number(s.subLen),pad:Number(s.pad),repulsion:Number(s.repulsion)};return (isFinite(v.spokeLen)&&isFinite(v.subLen)&&isFinite(v.pad)&&isFinite(v.repulsion))?v:null}
    function spacingNameFor(v){if(!v)return "custom";var names=Object.keys(bundles);for(var i=0;i<names.length;i++){var b=bundles[names[i]];if(b&&Math.abs(v.spokeLen-b.spokeLen)<1e-9&&Math.abs(v.subLen-b.subLen)<1e-9&&Math.abs(v.pad-b.pad)<1e-9&&Math.abs(v.repulsion-b.repulsion)<1e-9)return names[i]}return "custom"}
    function populateBranches(){var select=document.getElementById("layoutBranch");if(!select||select.options.length>1||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.branches)return;window.__SEXCAPADES_LAYOUT_API.branches().forEach(function(name){var option=document.createElement("option");option.value=name;option.textContent=name;select.appendChild(option)})}
    function populateTargetNodes(){
      var select=document.getElementById("layoutTargetNode");
      var treeMenu=document.getElementById("layoutTargetNodeMenu");
      var tax=taxonomy();
      if(!tax||!tax.categories)return;
      if(select&&select.options.length<=1){
        tax.categories.forEach(function(cat){
          var hasChildren=(cat.topics&&cat.topics.length>0)||(cat.subcategories&&cat.subcategories.length>0);
          if(!hasChildren)return;
          var optgroup=document.createElement("optgroup");
          optgroup.label="Category: "+cat.name;
          var bOpt=document.createElement("option");
          bOpt.value="branch:"+cat.name;
          bOpt.textContent=cat.name+" (Branch)";
          optgroup.appendChild(bOpt);
          (cat.subcategories||[]).forEach(function(sub){
            if(sub.topics&&sub.topics.length>0){
              var sOpt=document.createElement("option");
              sOpt.value="subcat:"+sub.name;
              sOpt.textContent="  └── "+sub.name+" (Sub-group)";
              optgroup.appendChild(sOpt);
            }
          });
          select.appendChild(optgroup);
        });
      }
      if(treeMenu&&!treeMenu.children.length){
        var noneRow=document.createElement("div");
        noneRow.className="le-tree-branch-row";
        var noneBtn=document.createElement("button");
        noneBtn.type="button";
        noneBtn.className="le-tree-node-btn";
        noneBtn.setAttribute("data-node-val","");
        noneBtn.textContent="None (whole map)";
        noneRow.appendChild(noneBtn);
        treeMenu.appendChild(noneRow);

        tax.categories.forEach(function(cat){
          var subs=(cat.subcategories||[]).filter(function(s){return s.topics&&s.topics.length>0});
          var hasChildren=(cat.topics&&cat.topics.length>0)||subs.length>0;
          if(!hasChildren)return;

          var bRow=document.createElement("div");
          bRow.className="le-tree-branch-row";

          if(subs.length>0){
            var tog=document.createElement("button");
            tog.type="button";
            tog.className="le-tree-toggle";
            tog.setAttribute("aria-label","Toggle "+cat.name+" subcategories");
            tog.setAttribute("aria-expanded","false");
            tog.innerHTML='<span class="le-tree-triangle">▶</span>';
            bRow.appendChild(tog);
          } else {
            var sp=document.createElement("span");
            sp.style.cssText="width:28px;flex-shrink:0;";
            bRow.appendChild(sp);
          }

          var bBtn=document.createElement("button");
          bBtn.type="button";
          bBtn.className="le-tree-node-btn";
          bBtn.setAttribute("data-node-val","branch:"+cat.name);
          bBtn.textContent=cat.name;
          bRow.appendChild(bBtn);
          treeMenu.appendChild(bRow);

          if(subs.length>0){
            var cWrap=document.createElement("div");
            cWrap.className="le-tree-children";
            cWrap.hidden=true;
            subs.forEach(function(sub){
              var sRow=document.createElement("div");
              sRow.className="le-tree-branch-row";
              var sBtn=document.createElement("button");
              sBtn.type="button";
              sBtn.className="le-tree-node-btn le-tree-child-btn";
              sBtn.setAttribute("data-node-val","subcat:"+sub.name);
              sBtn.innerHTML='<span style="opacity:0.5;margin-right:2px;">└──</span> '+sub.name;
              sRow.appendChild(sBtn);
              cWrap.appendChild(sRow);
            });
            treeMenu.appendChild(cWrap);

            if(tog){
              tog.addEventListener("click",function(ev){
                ev.stopPropagation();
                var isOpen=!cWrap.hidden;
                cWrap.hidden=isOpen;
                tog.setAttribute("aria-expanded",String(!isOpen));
                var tri=tog.querySelector(".le-tree-triangle");
                if(tri)tri.textContent=isOpen?"▶":"▼";
              });
            }
          }
        });

        treeMenu.addEventListener("click",function(ev){
          var btn=ev.target.closest(".le-tree-node-btn");
          if(!btn)return;
          var val=btn.getAttribute("data-node-val")||"";
          var select=document.getElementById("layoutTargetNode");
          if(select){
            select.value=val;
            select.dispatchEvent(new Event("change"));
          }
          if(typeof closeTargetNodeMenu==="function")closeTargetNodeMenu();
          if(val.indexOf("branch:")===0){
            var bName=val.slice(7);
            if(window.__sxFocusBranch)window.__sxFocusBranch(bName);
          } else if(val.indexOf("subcat:")===0){
            var sName=val.slice(7);
            if(window.__sxFocusNode)window.__sxFocusNode(sName, "");
          }
        });
      }
    }
    function populateKinks(){var select=document.getElementById("layoutKink");if(select.options.length>1||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.topics)return;window.__SEXCAPADES_LAYOUT_API.topics().forEach(function(t){var option=document.createElement("option");option.value=t.id;option.textContent=t.label;select.appendChild(option)})}
    // Spoke angle offsets (Build 2026-10-17_1450): one slider + numeric input
    // per category branch (18). The value is the branch's angular deviation
    // in degrees from its default equispaced position (360/18 = 20 degrees
    // between neighbouring spokes): 0 keeps the default spot, positive
    // rotates the spoke clockwise, negative counterclockwise. It is stored
    // as branchOverrides[name].angle — the same store the per-branch "Fine
    // angle" slider above uses — so both controls stay in sync, the map
    // geometry (which adds the offset to that spoke's base angle only)
    // rotates just that spoke, and the offset rides along in the copied
    // layout-settings hash like every other branch override.
    function spokeSlug(name){return name.replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"")}
    function buildSpokeAngles(){var wrap=document.getElementById("layoutSpokeAngles");if(!wrap||wrap.children.length||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.branches)return;window.__SEXCAPADES_LAYOUT_API.branches().forEach(function(name){var slug=spokeSlug(name),row=document.createElement("div");row.className="layout-editor-spoke-row";row.setAttribute("data-spoke-angle-name",name);var label=document.createElement("label");label.textContent=name;label.htmlFor="layoutSpokeAngle-"+slug;var out=document.createElement("output");out.id="layoutSpokeAngleValue-"+slug;out.setAttribute("for","layoutSpokeAngle-"+slug);out.textContent="0°";var controls=document.createElement("div");controls.className="layout-editor-spoke-controls";var range=document.createElement("input");range.type="range";range.id="layoutSpokeAngle-"+slug;range.min="-20";range.max="20";range.step="1";range.value="0";range.setAttribute("data-spoke-angle-range","");range.setAttribute("data-ui-tooltip","Rotate just this spoke from its default evenly-spaced spot. 0 degrees is default; positive turns clockwise, negative counterclockwise.");range.setAttribute("aria-label",name+" angle offset");var num=document.createElement("input");num.type="number";num.id="layoutSpokeAngleNum-"+slug;num.min="-20";num.max="20";num.step="1";num.value="0";num.setAttribute("data-spoke-angle-number","");num.setAttribute("aria-label",name+" angle offset in degrees");controls.appendChild(range);controls.appendChild(num);row.appendChild(label);row.appendChild(out);row.appendChild(controls);wrap.appendChild(row)})}
    function syncSpokeAngles(c){buildSpokeAngles();var wrap=document.getElementById("layoutSpokeAngles");if(!wrap)return;Array.prototype.forEach.call(wrap.children,function(row){var name=row.getAttribute("data-spoke-angle-name"),entry=name&&c.branchOverrides?c.branchOverrides[name]:null,value=Math.max(-20,Math.min(20,Number(entry&&entry.angle)||0)),range=row.querySelector("[data-spoke-angle-range]"),num=row.querySelector("[data-spoke-angle-number]"),out=row.querySelector("output");if(range&&document.activeElement!==range)range.value=String(value);if(num&&document.activeElement!==num)num.value=String(value);if(out)out.textContent=value.toFixed(0)+"°"})}
    function applySpokeAngle(name,value){lrActuate(LR_ACT.spokeAngle,name,value)}
    // Per-branch spoke scales: the Subcategory spokes and Kink spokes
    // sliders in Per-branch override store their multiplier on the branch's
    // branchOverrides entry (subScale / kinkScale — the layout engine reads
    // only .length/.angle there and ignores the rest) and expand it over the
    // branch's members relative to the baked tuned lengths in
    // __SEXCAPADES_LAYOUT_DEFAULTS, so dragging back to 1.00x restores the
    // tuned per-item lengths exactly. The two sliders write disjoint
    // stores — subcatOverrides[name].length for subcategory spokes;
    // kinkOverrides[id].length for direct kinks plus
    // subcatOverrides[name].cloud (the child-cloud radius) for kinks inside
    // subcategories — so moving one can never affect the other.
    function branchMembers(name){var subs=[],kinks=[],tax=taxonomy(),i;if(tax&&tax.categories)for(i=0;i<tax.categories.length;i++)if(tax.categories[i].name===name){(tax.categories[i].subcategories||[]).forEach(function(s){subs.push(s.name)});break}if(tax&&tax.flatList)tax.flatList.forEach(function(e){if(e.category===name&&e.id)kinks.push(e)});return{subs:subs,kinks:kinks}}
    function bakedSubBase(subName,field){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,e=d&&d.subcatOverrides?d.subcatOverrides[subName]:null,v=e?Number(e[field]):NaN;return v>0?v:1}
    function bakedKinkBase(id){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,e=d&&d.kinkOverrides?d.kinkOverrides[id]:null,v=e?Number(e.length):NaN;return v>0?v:1}
    // Relative length sliders (Batch A fix, Build 2026-10-19_2334): the
    // global "Branch line length", per-branch and per-topic line-length
    // sliders carry a MULTIPLIER of the shipped tuned length (1.00x =
    // tuned, range 0.25x-2x of tuned) instead of an absolute value, so a
    // tuned length above the old 2x ceiling (global 2.6x, branches to
    // 4.86x, topics to 9x) can never be silently clamped or overwritten.
    // Stored lengths stay absolute everywhere; readouts always show the
    // true absolute value.
    function bakedBranchBase(name){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,e=d&&d.branchOverrides?d.branchOverrides[name]:null,v=e?Number(e.length):NaN;return v>0?v:1}
    function bakedSpokeBase(){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,v=d?Number(d.spokeLen):NaN;return v>0?v:1}
    function relClamp(v){v=Number(v);return Number.isFinite(v)?Math.max(.25,Math.min(2,v)):1}
    function fmtLen(v){return String(Math.round((Number(v)||0)*100)/100)+"×"}
    // Per-branch spoke honesty readout (display only; no solver input):
    // "Requested" is the multiplier on the branch-length control — the
    // same relClamp'd value syncBranch writes into #layoutBranchLen.
    // "Effective" is the multiplier actually in force in the applied
    // layout state: the stored absolute length behind the
    // #layoutBranchLenValue button readout (config() via the layout
    // API), divided by the branch's shipped tuned length WITHOUT the
    // control's 0.25x-2x clamp, so a stored length the slider cannot
    // reach is shown rather than hidden, and the effective value is
    // highlighted whenever the two disagree. The overrider lines name
    // what else can move this branch's spoke, each shown only while
    // active: stagger density; this branch's spoke auto-shrink, read
    // from the same stored branchSpokeAutoShrink value the checkbox
    // shows so the two can never disagree; and a collision mode whose
    // base factor re-bases spoke lengths (grow x1.3 / shrink x0.76 /
    // off x0.62 in the solver; "both" applies no base factor).
    function syncBranchHonesty(c){
      var wrap=document.getElementById("layoutBranchHonesty");if(!wrap)return;
      var name=document.getElementById("layoutBranch").value;
      if(!name){wrap.hidden=true;return}
      var base=bakedBranchBase(name),entry=c.branchOverrides?c.branchOverrides[name]:null,stored=(entry&&Number(entry.length))||base;
      var reqOut=document.getElementById("layoutBranchLenRequested"),effOut=document.getElementById("layoutBranchLenEffective");
      var req=relClamp(stored/base),eff=stored/base;
      if(reqOut)reqOut.textContent=req.toFixed(2)+"×";
      if(effOut){effOut.textContent=eff.toFixed(2)+"×";effOut.classList.toggle("is-diverged",Math.abs(eff-req)>0.004)}
      var density=document.getElementById("layoutBranchHonestyDensity");
      if(density)density.hidden=!(c.staggerDensity===undefined?false:Boolean(c.staggerDensity));
      var shrink=document.getElementById("layoutBranchHonestyShrink");
      if(shrink)shrink.hidden=!(c.branchSpokeAutoShrink&&c.branchSpokeAutoShrink[name]===true);
      var colNote=document.getElementById("layoutBranchHonestyCollision"),colMode=document.getElementById("layoutBranchHonestyCollisionMode");
      if(colNote){var mode=String(c.collision||""),rebases=mode==="grow"||mode==="shrink"||mode==="off";colNote.hidden=!rebases;if(rebases&&colMode){var label=mode,colBtn=document.querySelector("[data-collision-mode='"+mode+"']");/* LR-G5: the mode label used to be read from the hidden select's option texts; the visible mode buttons carry the identical label texts */if(colBtn)label=colBtn.textContent;colMode.textContent=label}}
      wrap.hidden=false;
    }
    // DeKnotter button (E6): the One-branch group's compound action.
    // Fires the bundle driver's deknotter.run() for the branch picked
    // in #layoutBranch. The shell never routes the run through
    // collect()/apply(): the driver applies through the bundle API
    // directly, and the editor UI is refreshed with sync() at each
    // phase boundary (via opts.onPhase) so the auto-shrink checkboxes
    // and the honesty readout show the driven arm state truthfully
    // while the run is in flight.
    var deknotterRunning=false,deknotterBusyTimer=null,deknotterBusyStart=0;
    // BACK-OUT CONFIRMATION GATE (ruled 2026-11-01, Jason): ON by
    // default. The toggle (layoutBackoutGateToggle, beside the Anneal
    // status) is a session-only option — it is never written into a
    // saved layout or profile, and every fresh page load starts with
    // it on. When on, runDeknotterCascade hands the bundle
    // opts.onBackoutGate; the bundle calls it only when the category
    // (branch) shrink ladder's per-phase gate trips, BEFORE
    // restoreKept reverts any geometry, and the run waits on the
    // promise below — no timeout — until Jason accepts or rejects.
    // When off, no callback is passed and back-outs behave exactly
    // as they did before the gate existed.
    var annealBackoutGateOn=true,annealBackoutGateResolver=null;
    // SLIM-STRIP PRESENTATION (ruled 2026-11-02, Jason): the gate
    // confirmation opens by default as the same slim bottom-right
    // strip as the ANNEAL-DIAG pauses - code, branch, phase, one
    // short summary line (before -> tripped crossing + tolerance,
    // derived only from the readout values above), Accept and Reject
    // in the strip, transparent backdrop so the map and the tripped
    // cloud stay fully visible. Expand restores the full gate card
    // with every value intact; Minimise folds back. Expand/collapse
    // never resolve the pause promise and change no values; both the
    // strip's and the card's Accept/Reject resolve the gate exactly
    // as before via annealBackoutGateDone.
    function annealBackoutGateSetExpanded(exp){
      var wrap=document.getElementById("layoutBackoutGate");if(!wrap)return;
      wrap.classList.toggle("le-bo-expanded",!!exp);
      if(exp){var card=wrap.querySelector(".le-backout-gate-card");if(card)card.focus()}
      else{var sa=document.getElementById("layoutBackoutGateStripAccept");if(sa)sa.focus()}
    }
    function annealBackoutGateConfirm(info){
      return new Promise(function(resolve){
        var wrap=document.getElementById("layoutBackoutGate"),codeEl=document.getElementById("layoutBackoutGateCode"),factsEl=document.getElementById("layoutBackoutGateFacts");
        if(!wrap||!codeEl||!factsEl){resolve("accept");return}
        annealBackoutGateResolver=resolve;
        codeEl.textContent=String(info&&info.code||"ANNEAL-BO-01");
        factsEl.innerHTML="Branch <b>"+dkEsc(info&&info.branch||"")+"</b> · phase <b>"+dkEsc(info&&info.phase||"")+"</b><br/>Crossing before (last kept) <b>"+dkFmtLead(info?info.crossingBefore:null)+"</b> → after (tripped trial) <b>"+dkFmtLead(info?info.crossingAfter:null)+"</b>"+(info&&Number.isFinite(Number(info.tolerance))?(" · gate tolerance "+dkFmtLead(Number(info.tolerance))):"");
        var sCode=document.getElementById("layoutBackoutGateStripCode");if(sCode)sCode.textContent=String(info&&info.code||"ANNEAL-BO-01");
        var sPhase=document.getElementById("layoutBackoutGateStripPhase");if(sPhase)sPhase.textContent=String(info&&info.branch||"")+(info&&info.phase?(" · "+String(info.phase)):"");
        var sSum=document.getElementById("layoutBackoutGateStripSummary");if(sSum)sSum.textContent="Crossing "+dkFmtLead(info?info.crossingBefore:null)+" → "+dkFmtLead(info?info.crossingAfter:null)+(info&&Number.isFinite(Number(info.tolerance))?(" · tol "+dkFmtLead(Number(info.tolerance))):"");
        wrap.classList.remove("le-bo-expanded");
        wrap.hidden=false;
        document.documentElement.classList.add("le-diag-docked");
        var accB=document.getElementById("layoutBackoutGateAccept"),rejB=document.getElementById("layoutBackoutGateReject");
        if(accB)accB.disabled=false;if(rejB)rejB.disabled=false;
        var sAcc=document.getElementById("layoutBackoutGateStripAccept"),sRej=document.getElementById("layoutBackoutGateStripReject");
        if(sAcc){sAcc.disabled=false;sAcc.focus()}if(sRej)sRej.disabled=false;
      });
    }
    function annealBackoutGateDone(decision){
      var wrap=document.getElementById("layoutBackoutGate");if(wrap){wrap.hidden=true;wrap.classList.remove("le-bo-expanded")}
      document.documentElement.classList.remove("le-diag-docked");
      var res=annealBackoutGateResolver;annealBackoutGateResolver=null;
      if(res)res(decision);
    }
    // ACCEPT-PATH STEP-THROUGH DIAGNOSTICS (ruled 2026-11-01, Jason):
    // session-only toggle (layoutDiagToggle, beside the gate toggle),
    // never written into a saved layout or profile, on by default.
    // When on, runDeknotterCascade hands the bundle opts.onDiagPause;
    // the bundle calls it only on the back-out gate Accept path, at
    // ANNEAL-DIAG-01 (Accept -> restoreKept), ANNEAL-DIAG-02
    // (restoreKept -> closing full paint) and ANNEAL-DIAG-03 (closing
    // full paint -> settle). Each call opens the slim strip below
    // (bottom-right, map fully visible; Expand shows the full readout
    // card, Minimise returns to the strip) and waits on its promise -
    // no timeout can fire while it waits - until Continue is pressed.
    // The strip and card only display the bundle's
    // read-only snapshot; it changes no geometry. When off, no
    // callback is passed and the Accept path runs exactly as before.
    var annealDiagOn=true,annealDiagResolver=null;
    // ON-DEMAND FULL PAINT (ruled 2026-11-01, Jason): session-only
    // toggle (layoutOnDemandPaintToggle, beside the step-through
    // toggle), never written into a saved layout or profile, OFF by
    // default. When on, runDeknotterCascade hands the bundle
    // opts.onDemandFullPaint; the bundle then takes one freeze-replay
    // full paint at the 3rd fit-subcats runPhase commit and every 5th
    // runPhase commit thereafter, logging a stage-stamped snapshot.
    // When off, no flag is passed and runs behave exactly as before.
    var annealOnDemandPaintOn=false;
    // THROW-BRACKET PAINTS (ruled 2026-11-01 23:57 CST, Jason):
    // session-only toggle (layoutThrowBracketToggle, beside the
    // on-demand paint toggle), never written into a saved layout or
    // profile, ON by default for this diagnostic build. When on,
    // runDeknotterCascade hands the bundle opts.throwBracket and
    // opts.onThrowBracketPause (the same slim-strip pause as the
    // step-through diagnostics: the strip opens slim only at the
    // bottom-right, the map stays fully visible behind it, Expand
    // shows the full readout and Minimise folds it back, and neither
    // resolves the pause); the bundle then takes one full paint +
    // painted-geometry snapshot before the first throw
    // (THROW-BEFORE) and one after it (THROW-AFTER). When off, no
    // bracket options are passed and the run is exactly as before.
    var annealThrowBracketOn=true;
    // Slim-strip summary (presentation only): a short derivation of
    // the snapshot's own readout - branch delivered radius and the
    // painted bounding-box size against the viewBox width. It reads
    // the snapshot the bundle already took; it measures nothing new
    // and never replaces the full readout, which still goes to the
    // card, the console and the receipt unchanged.
    function annealDiagSummary(info){
      function num(v){var n=Number(v);return Number.isFinite(n)?String(Math.round(n)):"\u2014"}
      var branch=(info&&null!=info.storedBranchRadius)?num(info.storedBranchRadius):"\u2014";
      var bbox=(info&&info.view&&info.view.bbox)?info.view.bbox:null;
      var vb=(info&&info.view&&info.view.viewBox)?String(info.view.viewBox).trim().split(/\s+/):null;
      var vbW=(vb&&4===vb.length)?vb[2]:null;
      var s="branch "+branch+" \u00b7 bbox "+(bbox?(num(bbox.width)+"\u00d7"+num(bbox.height)):"\u2014");
      if(vbW)s+=" in "+vbW+" viewBox";
      return s;
    }
    function annealDiagSetExpanded(exp){
      var wrap=document.getElementById("layoutDiagGate");if(!wrap)return;
      wrap.classList.toggle("le-diag-expanded",!!exp);
      if(exp){var card=wrap.querySelector(".le-backout-gate-card");if(card)card.focus()}
      else{var sc=document.getElementById("layoutDiagStripContinue");if(sc)sc.focus()}
    }
    function annealDiagPause(info){
      return new Promise(function(resolve){
        var wrap=document.getElementById("layoutDiagGate"),codeEl=document.getElementById("layoutDiagGateCode"),factsEl=document.getElementById("layoutDiagGateFacts");
        if(!wrap||!codeEl||!factsEl){resolve();return}
        annealDiagResolver=resolve;
        codeEl.textContent=String(info&&info.code||"")+" \u00b7 "+String(info&&info.label||"");
        factsEl.textContent=String(info&&info.text||"");
        var sCode=document.getElementById("layoutDiagStripCode");if(sCode)sCode.textContent=String(info&&info.code||"");
        var sPhase=document.getElementById("layoutDiagStripPhase");if(sPhase)sPhase.textContent=String(info&&info.label||"")+(info&&info.phase?(" \u00b7 "+String(info.phase)):"");
        var sSum=document.getElementById("layoutDiagSummary");if(sSum)sSum.textContent=annealDiagSummary(info||{});
        try{console.log("["+String(info&&info.code||"")+"] "+String(info&&info.text||""),info)}catch(e){}
        wrap.classList.remove("le-diag-expanded");
        wrap.hidden=false;
        document.documentElement.classList.add("le-diag-docked");
        var cont=document.getElementById("layoutDiagGateContinue");if(cont)cont.disabled=false;
        var sCont=document.getElementById("layoutDiagStripContinue");if(sCont){sCont.disabled=false;sCont.focus()}
      });
    }
    function annealDiagDone(){
      var wrap=document.getElementById("layoutDiagGate");if(wrap){wrap.hidden=true;wrap.classList.remove("le-diag-expanded")}
      document.documentElement.classList.remove("le-diag-docked");
      var res=annealDiagResolver;annealDiagResolver=null;
      if(res)res();
    }
    (function(){
      var tog=document.getElementById("layoutOnDemandPaintToggle");
      if(tog){annealOnDemandPaintOn=!!tog.checked;tog.addEventListener("change",function(){annealOnDemandPaintOn=!!tog.checked})}
    })();
    (function(){
      var tog=document.getElementById("layoutThrowBracketToggle");
      if(tog){annealThrowBracketOn=!!tog.checked;tog.addEventListener("change",function(){annealThrowBracketOn=!!tog.checked})}
    })();
    (function(){
      var tog=document.getElementById("layoutDiagToggle");
      if(tog){annealDiagOn=!!tog.checked;tog.addEventListener("change",function(){annealDiagOn=!!tog.checked})}
      var cont=document.getElementById("layoutDiagGateContinue");
      if(cont)cont.addEventListener("click",function(){annealDiagDone()});
      var sCont=document.getElementById("layoutDiagStripContinue");
      if(sCont)sCont.addEventListener("click",function(){annealDiagDone()});
      var expBtn=document.getElementById("layoutDiagExpand");
      if(expBtn)expBtn.addEventListener("click",function(){annealDiagSetExpanded(true)});
      var colBtn=document.getElementById("layoutDiagCollapse");
      if(colBtn)colBtn.addEventListener("click",function(){annealDiagSetExpanded(false)});
    })();
    (function(){
      var tog=document.getElementById("layoutBackoutGateToggle");
      if(tog){annealBackoutGateOn=!!tog.checked;tog.addEventListener("change",function(){annealBackoutGateOn=!!tog.checked})}
      var acc=document.getElementById("layoutBackoutGateAccept"),rej=document.getElementById("layoutBackoutGateReject");
      if(acc)acc.addEventListener("click",function(){annealBackoutGateDone("accept")});
      if(rej)rej.addEventListener("click",function(){annealBackoutGateDone("reject")});
      var sAcc=document.getElementById("layoutBackoutGateStripAccept"),sRej=document.getElementById("layoutBackoutGateStripReject");
      if(sAcc)sAcc.addEventListener("click",function(){annealBackoutGateDone("accept")});
      if(sRej)sRej.addEventListener("click",function(){annealBackoutGateDone("reject")});
      var gExp=document.getElementById("layoutBackoutGateExpand");
      if(gExp)gExp.addEventListener("click",function(){annealBackoutGateSetExpanded(true)});
      var gCol=document.getElementById("layoutBackoutGateCollapse");
      if(gCol)gCol.addEventListener("click",function(){annealBackoutGateSetExpanded(false)});
    })();
    // Anneal-all loop state (shell only): the loop driver below runs
    // the existing single-branch cascade once per branch; these two
    // flags let the busy state and the Cancel control span the whole
    // loop instead of a single branch run.
    var deknotterLoopRunning=false,deknotterLoopCancelRequested=false;
    // Q1: mid-phase cancel flag for the running cascade. The Cancel
    // control below sets it; runDeknotterCascade hands the driver a
    // shouldCancel reader over it, and the solver's per-iteration
    // poll (dkSolvePoll in the bundle) stops the phase on it.
    var deknotterCancelRequested=false;
    var dkPhaseLines=[];
    // Receipt disclosure hierarchy (ruled 2026-11-01, Jason): the
    // Anneal receipts render as a pull-down tree of <details> nodes —
    // the run's lead line is the top node's summary (its disclosure
    // triangle), branches and phase lists nest one level under it,
    // each with its own triangle. Open state is kept per node key in
    // dkReceiptOpen so the settle re-render (renderDkReceipt again
    // from onSettleLanded) restores the tree as the reader left it
    // instead of snapping it shut.
    var dkReceiptOpen={};
    function dkReceiptDetails(key,cls,summaryHtml,bodyHtml,defaultOpen){
      var open=Object.prototype.hasOwnProperty.call(dkReceiptOpen,key)?!!dkReceiptOpen[key]:!!defaultOpen;
      return "<details class=\"le-receipt-node "+cls+"\" data-receipt-key=\""+dkEsc(key)+"\""+(open?" open":"")+"><summary><span>"+summaryHtml+"</span></summary><div class=\"le-receipt-body\">"+bodyHtml+"</div></details>";
    }
    function dkReceiptSummaryInner(leadHtml){return String(leadHtml||"").replace(/^<p>/,"").replace(/<\/p>$/,"")}
    (function(){var se=document.getElementById("layoutDeknotterStatus");if(se)se.addEventListener("toggle",function(ev){var d=ev.target;if(d&&d.classList&&d.classList.contains("le-receipt-node")){var k=d.getAttribute("data-receipt-key");if(k)dkReceiptOpen[k]=!!d.open}},true)})();
    function deknotterYield(){return new Promise(function(res){var done=false;function fin(){if(!done){done=true;res()}}if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(fin)});setTimeout(fin,60)})}
    function deknotterGroupEl(){var sec=document.getElementById("layoutSectionSelection");return sec?sec.querySelector(".layout-editor-branch"):null}
    function setDeknotterGroupDisabled(dis){var g=deknotterGroupEl();if(g)Array.prototype.forEach.call(g.querySelectorAll("input,select,button"),function(el){if(el.id==="layoutAnnealBtn"||el.id==="layoutDeknotterCancel")return;el.disabled=!!dis});var btn=document.getElementById("layoutAnnealBtn");if(btn)btn.disabled=true}
    // Anneal scope helpers (shell only): the owning-branch lookups
    // the pickers fall back to when the checklist is empty. The
    // scope resolution itself lives at annealScope() below.
    function annealBranchForSubcat(subName){var tax=taxonomy();if(!tax)return "";var i,j;if(tax.categories)for(i=0;i<tax.categories.length;i++){var subs=tax.categories[i].subcategories||[];for(j=0;j<subs.length;j++)if(subs[j]&&subs[j].name===subName)return tax.categories[i].name}if(tax.flatList)for(i=0;i<tax.flatList.length;i++)if(tax.flatList[i]&&tax.flatList[i].subcategory===subName&&tax.flatList[i].category)return tax.flatList[i].category;return ""}
    function annealBranchForKink(kinkId){var tax=taxonomy();if(!tax)return "";var i;if(tax.flatList)for(i=0;i<tax.flatList.length;i++)if(tax.flatList[i]&&tax.flatList[i].id===kinkId&&tax.flatList[i].category)return tax.flatList[i].category;if(tax.topicById){var en=null;try{en=tax.topicById.get?tax.topicById.get(kinkId):tax.topicById[kinkId]}catch(e){en=null}if(en&&(en.category||en.branch))return en.category||en.branch}return ""}
    // Anneal branch checklist (selections editor): one checkbox row
    // per branch, built once from the branch list (buildSpokeAngles
    // guard pattern — rows are built only while the container is
    // empty, and retried on later syncs until the branch list is
    // available). State lives in the checkboxes themselves: no new
    // persistence, a run never clears it; it survives the panel
    // hiding (DOM hidden, not destroyed) and resets on reload, like
    // the picker value. CROSSING NUMBERS + MAP SYNC (ruled
    // 2026-11-01, Jason): each row also lists its branch's CURRENT
    // crossing number (refreshAnnealCrossings, re-read at every
    // checklist sync from the same __sxCrossingMeasure readout the
    // onset rule and the run-order list use), and selection is in
    // sync with the map both ways — a branch selected on the map
    // is checked off here (checkAnnealBranchFromMap, called from
    // focusEditorOn; checking is additive, a map tap never unchecks
    // a row or clears other picks), and checking a row here selects
    // that branch on the map (the checklist click handler below).
    function buildAnnealChecklist(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap||wrap.children.length||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.branches)return;branchNames().forEach(function(name){var row=document.createElement("button");row.type="button";row.className="le-anneal-opt";row.setAttribute("data-anneal-check","");row.setAttribute("data-value",name);row.setAttribute("aria-selected","false");row.setAttribute("aria-label","Anneal "+name);var nm=document.createElement("span");nm.className="le-anneal-name";nm.textContent=name;row.appendChild(nm);var cr=document.createElement("span");cr.className="le-anneal-cross";cr.setAttribute("data-anneal-cross","");cr.textContent="crossing —";row.appendChild(cr);wrap.appendChild(row)})}
    function refreshAnnealCrossings(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap||!wrap.children.length)return;var clouds=null;try{var m=typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null;clouds=m&&m.clouds?m.clouds:null}catch(e){clouds=null}Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){var name=opt.getAttribute("data-value"),v=clouds?Number(clouds[name]):NaN,el=opt.querySelector("[data-anneal-cross]");if(el)el.textContent=Number.isFinite(v)?("crossing "+dkFmtLead(v)):"crossing —";opt.setAttribute("aria-label","Anneal "+name+(Number.isFinite(v)?(", crossing "+dkFmtLead(v)):""))})}
    function checkAnnealBranchFromMap(branch){if(!branch)return;buildAnnealChecklist();var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;var changed=false;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){if(opt.getAttribute("data-value")===branch&&opt.getAttribute("aria-selected")!=="true"){opt.setAttribute("aria-selected","true");changed=true}});if(changed)syncAnnealChecklist()}
    function annealCheckedBranches(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return[];var checked={};Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){if(opt.getAttribute("aria-selected")==="true")checked[opt.getAttribute("data-value")]=true});return branchNames().filter(function(name){return !!checked[name]})}
    function syncAnnealChecklist(){buildAnnealChecklist();refreshAnnealCrossings();var picked=annealCheckedBranches(),trig=document.getElementById("layoutAnnealTriggerLabel"),note=document.getElementById("layoutAnnealScopeNote");if(trig)trig.textContent=!picked.length?"All branches — whole map":(picked.length===1?picked[0]:picked.length+" branches picked");if(note)note.textContent=!picked.length?"Nothing picked — Anneal runs on the whole map.":(picked.length===1?"Anneal will run on "+picked[0]+" only.":"Anneal will run on the "+picked.length+" picked branches only, in decreasing crossing order, highest crossing first.")}
    function setAnnealChecklist(on){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){opt.setAttribute("aria-selected",String(!!on))});syncDeknotterBtn()}
    // PICKER → CHECKLIST MIRROR (ruled 2026-11-13, Jason): picking a
    // branch in the branch picker checks just that branch in the
    // "Branches to anneal" checklist (all others unchecked), so the
    // list shows what Anneal will run on. Clearing the picker
    // unchecks every row. Scope is unchanged: a one-branch checked
    // list ("selected") runs exactly the same branch the picker
    // alone would ("branch") — annealScope's precedence (a picked
    // list wins over the picker) is untouched.
    function setAnnealChecklistBranch(name){buildAnnealChecklist();var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){opt.setAttribute("aria-selected",String(!!name&&opt.getAttribute("data-value")===name))});syncDeknotterBtn()}
    // Anneal scope resolution (shell only): a non-empty checklist
    // wins EXACTLY — the checked set, in branch-list order, is the
    // loop list and the pickers are ignored for scope (they still
    // drive the branch controls). With the checklist empty, a
    // picked branch wins; with the branch picker empty, a picked
    // sub-group or topic runs its OWNING branch; only when every
    // picker is empty does the whole-map loop run (branch list in
    // taxonomy order, unreordered).
    function annealScope(){var checked=annealCheckedBranches();if(checked.length)return{kind:"selected",branches:checked};var b=document.getElementById("layoutBranch"),bv=b?b.value:"";if(bv)return{kind:"branch",branches:[bv]};var sc=document.getElementById("layoutSubcat"),sv=sc?sc.value:"";if(sv)return{kind:"owning",branches:[annealBranchForSubcat(sv)]};var k=document.getElementById("layoutKink"),kv=k?k.value:"";if(kv)return{kind:"owning",branches:[annealBranchForKink(kv)]};return{kind:"all",branches:branchNames().slice()}}
    function syncDeknotterBtn(){var btn=document.getElementById("layoutAnnealBtn");if(!btn)return;syncAnnealChecklist();var label=document.getElementById("layoutAnnealBtnLabel");if(deknotterRunning||deknotterLoopRunning){btn.disabled=true;return}btn.disabled=false;var scope=annealScope();if(label)label.textContent=scope.kind==="selected"?("Anneal selected ("+scope.branches.length+")"):(scope.kind==="all"?"Anneal all":"Anneal");btn.setAttribute("data-ui-tooltip",scope.kind==="selected"?("Run the Nested Nodal Anneal on the "+scope.branches.length+" picked branch"+(scope.branches.length===1?"":"es")+", one branch at a time"+(scope.branches.length===1?"":", in decreasing crossing order, highest crossing first")+": throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — each branch kept only if its crossing number improves or holds."):(scope.kind==="all"?"Run the Nested Nodal Anneal on every branch, one branch at a time in decreasing crossing order, highest crossing first: throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — each branch kept only if its crossing number improves or holds.":(scope.kind==="owning"?"Run the Nested Nodal Anneal on the branch that owns the current selection: throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — kept only if the branch's crossing area improves or holds.":"Run the Nested Nodal Anneal on the selected branch: throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — kept only if the branch's crossing area improves or holds.")))}
    function startDeknotterBusy(){deknotterBusyStart=Date.now();var btn=document.getElementById("layoutAnnealBtn");if(btn){btn.classList.add("is-busy");btn.setAttribute("aria-busy","true")}document.documentElement.classList.add("deknotter-busy");var el=document.getElementById("layoutDeknotterElapsed");if(el)el.hidden=false;function tick(){if(el)el.textContent=((Date.now()-deknotterBusyStart)/1000).toFixed(1)+"s"}tick();if(deknotterBusyTimer!==null)clearInterval(deknotterBusyTimer);deknotterBusyTimer=setInterval(tick,100)}
    function stopDeknotterBusy(){if(deknotterBusyTimer!==null){clearInterval(deknotterBusyTimer);deknotterBusyTimer=null}var btn=document.getElementById("layoutAnnealBtn");if(btn){btn.classList.remove("is-busy");btn.removeAttribute("aria-busy")}document.documentElement.classList.remove("deknotter-busy");var el=document.getElementById("layoutDeknotterElapsed");if(el)el.hidden=true}
    function dkEsc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
    function dkFmtRatio(v){return v==null||!Number.isFinite(Number(v))?"\u2014":(Math.round(Number(v)*100)/100)+"\u00d7"}
    function dkFmtRange(r){return !r||r.length<2?"\u2014":dkFmtRatio(r[0])+"\u2013"+dkFmtRatio(r[1])}
    function dkFmtCloud(v){return v==null||!Number.isFinite(Number(v))?"\u2014":Number(v).toFixed(1)}
    function dkFmtDelta(v){return v==null||!Number.isFinite(Number(v))?"\u2014":((Number(v)>0?"+":"")+Number(v).toFixed(1))}
    function dkHitSummary(hits){if(!hits||!hits.length)return "no limiter hits";var types={},order=[];hits.forEach(function(h){var ty=h&&h.type?String(h.type):"hit";if(!types[ty])order.push(ty);types[ty]=(types[ty]||0)+1});var parts=order.map(function(ty){return types[ty]>1?(ty+" \u00d7"+types[ty]):ty});return hits.length+" limiter hit"+(hits.length===1?"":"s")+" ("+parts.join(", ")+")"}
    // DeKnotter receipt (S5): the run's end summary is rendered by
    // renderDkReceipt as ONE lead line — cloud name, the crossing
    // number (Q4 decider) before → after with thousands separators,
    // Δ, the word KEPT or REVERTED, elapsed seconds, with the
    // xAreaCross area riding as a labeled secondary — ahead of the
    // per-phase narration lines (dkPhaseLines), which follow after
    // it and never precede it. (M1, 2026-10-29: the xAreaCross area no
    // longer rides as a secondary — area is removed from observation;
    // its receipt segment is commented out in renderDkReceipt below.)
    // While the deferred whole-map settle
    // is still owed (S6), the lead line carries a "settling…" mark
    // instead of presenting its numbers as final; when the settle
    // lands, onSettleLanded re-measures the cloud and the lead
    // line's numbers become the post-settle values.
    function dkFmtLead(v){return v==null||!Number.isFinite(Number(v))?"—":Number(v).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2})}
    function dkFmtLeadDelta(v){if(v==null||!Number.isFinite(Number(v)))return "—";var n=Number(v);if(n===0)return "0";return (n<0?"−":"+")+Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2})}
    function dkFmtAnneal(v){return v==null||!Number.isFinite(Number(v))?"\u2014":String(Math.round(Number(v)*1000)/1000)}
    // Anneal live crossing overlay (2026-10-28; plain-number form
    // 2026-11-01): while a cascade run is active, the annealed cloud's
    // CURRENT crossing number rides on the cloud itself — just the
    // number, in the normal per-cloud numbers-overlay style
    // (.metric-map-num: same size, weight, colour and outline, no box,
    // no label, no phase line), in its own layer inside
    // #mapScene, built on the MetricNumbersView pattern (world anchor
    // via MetricGeometry / the layer CTM, pointer-events:none layer so
    // map taps, drags and the panel's Cancel control are untouched,
    // transform/viewBox observer for pan/zoom). It only ever READS:
    // phase summaries hand it their committed cloud value, and the
    // heartbeat plus the run's own 1 s heartbeat timer hand it a fresh
    // read of window.__sxCrossingMeasure — the same read-only readout
    // behind the crossing metric and the cascade's onset check, keyed
    // by the annealed branch, so the number shown is the same metric
    // the phase lines and the receipt report. It writes no layout
    // state and touches neither the cascade, its phases, its gates,
    // nor its termination; it is removed on the cascade's finally
    // exit path, next to stopDeknotterBusy.
    var AnnealCloudOverlay={
      branch:null,value:null,phase:null,layerEl:null,badgeEl:null,anchor:null,raf:0,observer:null,
      layer:function(){
        var scene=document.getElementById("mapScene");if(!scene)return null;
        if(!AnnealCloudOverlay.layerEl||!AnnealCloudOverlay.layerEl.isConnected){AnnealCloudOverlay.layerEl=document.createElement("div");AnnealCloudOverlay.layerEl.className="anneal-cloud-overlay";AnnealCloudOverlay.layerEl.id="annealCloudOverlay";AnnealCloudOverlay.layerEl.setAttribute("aria-hidden","true");scene.appendChild(AnnealCloudOverlay.layerEl);AnnealCloudOverlay.badgeEl=null}
        return AnnealCloudOverlay.layerEl;
      },
      badge:function(){
        var layer=AnnealCloudOverlay.layer();if(!layer)return null;
        if(!AnnealCloudOverlay.badgeEl||!AnnealCloudOverlay.badgeEl.isConnected){
          var b=document.createElement("span");b.className="metric-map-num anneal-cloud-num";b.id="annealCloudValue";
          b.textContent="\u2014";
          AnnealCloudOverlay.badgeEl=b;layer.appendChild(b);
        }
        return AnnealCloudOverlay.badgeEl;
      },
      readLive:function(){
        try{var m=typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null;var v=m&&m.clouds?Number(m.clouds[AnnealCloudOverlay.branch]):NaN;return Number.isFinite(v)?v:null}catch(e){return null}
      },
      recenter:function(){
        try{
          // While a run is live, the bundle paints the worked
          // branch's SCC capsule approximation from the current
          // solve and publishes its centroid as
          // window.__sxInterimAnchor (world coordinates): the live
          // number rides on THAT — the intermediary stage actually
          // being shown — not on the frozen pre-run DOM cloud,
          // whose centre the fallback below reads.
          var ia=window.__sxInterimAnchor;
          if(ia&&ia.branch===AnnealCloudOverlay.branch&&Number.isFinite(Number(ia.x))&&Number.isFinite(Number(ia.y))){AnnealCloudOverlay.anchor={x:Number(ia.x),y:Number(ia.y)};return}
          var centers=(typeof MetricNumbersView!=="undefined"&&MetricNumbersView&&typeof MetricNumbersView.cloudCenters==="function")?MetricNumbersView.cloudCenters():null;
          var ctr=centers?centers[AnnealCloudOverlay.branch]:null;if(!ctr)return;
          var w=MetricGeometry.screenToWorld(ctr.x,ctr.y);if(w)AnnealCloudOverlay.anchor={x:w.x,y:w.y};
        }catch(e){}
      },
      position:function(){
        var badge=AnnealCloudOverlay.badgeEl,layer=AnnealCloudOverlay.layerEl;
        if(!badge||!badge.isConnected||!layer||!layer.isConnected)return;
        var rect=layer.getBoundingClientRect();if(!(rect.width>0))return;
        var x=rect.width/2,y=46;
        var ml=document.getElementById("mapLayer"),m=null;try{m=ml?ml.getScreenCTM():null}catch(e){}
        if(m&&AnnealCloudOverlay.anchor){try{var p=new DOMPoint(AnnealCloudOverlay.anchor.x,AnnealCloudOverlay.anchor.y).matrixTransform(m);x=p.x-rect.left;y=p.y-rect.top}catch(e){}}
        // Clamp inside the scene: a cloud thrown far out (the throw
        // phase scales the branch 100x) or panned away must never
        // carry its number off-screen — the count stays visible at
        // the scene edge nearest the cloud and follows it back in.
        x=Math.max(28,Math.min(x,Math.max(28,rect.width-28)));
        y=Math.max(14,Math.min(y,Math.max(14,rect.height-14)));
        badge.style.left=x+"px";badge.style.top=y+"px";
      },
      schedulePosition:function(){
        if(AnnealCloudOverlay.raf)return;
        if(typeof requestAnimationFrame!=="function"){AnnealCloudOverlay.position();return}
        AnnealCloudOverlay.raf=requestAnimationFrame(function(){AnnealCloudOverlay.raf=0;AnnealCloudOverlay.position()});
      },
      render:function(){
        var badge=AnnealCloudOverlay.badge();if(!badge)return;
        badge.textContent=AnnealCloudOverlay.value==null?"\u2014":dkFmtLead(AnnealCloudOverlay.value);
        AnnealCloudOverlay.position();
      },
      update:function(value,recenter){
        if(!AnnealCloudOverlay.branch)return;
        if(value!=null&&Number.isFinite(Number(value)))AnnealCloudOverlay.value=Number(value);
        if(recenter)AnnealCloudOverlay.recenter();
        AnnealCloudOverlay.render();
      },
      tick:function(){
        // The run's 1 s cadence (the hbTimer interval): a fresh live
        // read plus a recenter, so the number follows the moving
        // cloud between phase commits without polling any faster
        // than the run already reports its own heartbeat.
        if(!AnnealCloudOverlay.branch)return;
        AnnealCloudOverlay.update(AnnealCloudOverlay.readLive(),true);
      },
      heartbeat:function(){
        // Fired from the solver's per-iteration poll through
        // onHeartbeat, synchronously with a solve on the main
        // thread: refresh the VALUE from the live readout and
        // reposition from the stored anchor only — no DOM geometry
        // walk (cloudCenters) while a solve is running.
        if(!AnnealCloudOverlay.branch)return;
        var v=AnnealCloudOverlay.readLive();
        if(v!=null)AnnealCloudOverlay.value=v;
        AnnealCloudOverlay.render();
      },
      setPhase:function(phase){if(phase)AnnealCloudOverlay.phase=String(phase)}, // phase is tracked for the run only — never shown on the cloud; the overlay is the number alone
      start:function(branch,value){
        AnnealCloudOverlay.branch=branch;AnnealCloudOverlay.value=(value!=null&&Number.isFinite(Number(value)))?Number(value):null;AnnealCloudOverlay.phase=null;AnnealCloudOverlay.anchor=null;
        if(!AnnealCloudOverlay.badge())return;
        AnnealCloudOverlay.recenter();
        AnnealCloudOverlay.render();
        // Pan/zoom tracking: the same observer contract as the
        // metric numbers overlay — viewBox on the svg, transform on
        // the viewport and map layer.
        try{
          AnnealCloudOverlay.stopWatching();
          var obs=new MutationObserver(function(){AnnealCloudOverlay.schedulePosition()});
          AnnealCloudOverlay.observer=obs;
          var svg=document.getElementById("mapSvg");if(svg)obs.observe(svg,{attributes:true,attributeFilter:["viewBox"]});
          ["viewport","mapLayer"].forEach(function(id){var n=document.getElementById(id);if(n)obs.observe(n,{attributes:true,attributeFilter:["transform"]})});
        }catch(e){}
      },
      stopWatching:function(){if(AnnealCloudOverlay.observer){try{AnnealCloudOverlay.observer.disconnect()}catch(e){}AnnealCloudOverlay.observer=null}if(AnnealCloudOverlay.raf){try{cancelAnimationFrame(AnnealCloudOverlay.raf)}catch(e){}AnnealCloudOverlay.raf=0}},
      stop:function(){
        AnnealCloudOverlay.stopWatching();
        AnnealCloudOverlay.branch=null;AnnealCloudOverlay.value=null;AnnealCloudOverlay.phase=null;AnnealCloudOverlay.anchor=null;
        if(AnnealCloudOverlay.badgeEl){AnnealCloudOverlay.badgeEl.remove();AnnealCloudOverlay.badgeEl=null}
        if(AnnealCloudOverlay.layerEl){AnnealCloudOverlay.layerEl.remove();AnnealCloudOverlay.layerEl=null}
      }
    };
    function renderDkReceipt(){
      var statusEl=document.getElementById("layoutDeknotterStatus");
      if(!statusEl||!dkReceipt)return;
      var rc=dkReceipt,lead;
      if(rc.error){
        lead="<p><b>"+dkEsc(rc.name)+" · failed</b> — "+dkEsc(rc.error)+" · controls restored · "+rc.elapsed+"</p>";
      }else if(rc.noreport){
        lead="<p><b>"+dkEsc(rc.name)+" · finished</b> — no run report was returned · "+rc.elapsed+"</p>";
      }else{
        lead="<p><b>"+dkEsc(rc.name)+": crossing "+dkFmtLead(rc.before)+" → "+dkFmtLead(rc.after)+" (Δ "+dkFmtLeadDelta(rc.delta)+") — "+(rc.gate==="kept"?"KEPT":(rc.gate==="ended-at-category-backout"?"ENDED AT CATEGORY BACK-OUT — backed-out state stands":"REVERTED"))+" in "+rc.elapsed+"</b>"+(rc.reason?(" — "+dkEsc(rc.reason)):"")+(rc.coverage?(" · coverage "+rc.coverage):"")+(rc.fitdev!=null?(" · fit deviations "+rc.fitdev):"")+((rc.awaitingSettle&&settlePending)?" — settling…":"")+"</p>";
      }
      var receiptBody="";
      if(rc.diagLines&&rc.diagLines.length)rc.diagLines.forEach(function(t){receiptBody+="<p>Diagnostic step-through: "+dkEsc(t)+"</p>"});
      if(rc.backoutGate)receiptBody+="<p>Back-out gate: <b>REJECTED</b> — code "+dkEsc(rc.backoutGate.code)+" · branch "+dkEsc(rc.backoutGate.branch)+" · phase "+dkEsc(rc.backoutGate.phase||"")+" · crossing before (last kept) "+dkFmtLead(rc.backoutGate.crossingBefore)+" → tripped "+dkFmtLead(rc.backoutGate.crossingAfter)+". The tripped geometry was left standing; the run ended with no growth, final patch, or final gate.</p>";
      if(rc.skipThrow)receiptBody+="<p>Throw skipped — crossing "+dkFmtLead(rc.skipThrow.baseline)+" is below "+dkFmtLead(rc.skipThrow.below)+", so this run shrank the subcategories first and then the category, from the branch's current lengths, instead of throwing.</p>";
      if(rc.throwInfo)receiptBody+="<p>Throw: "+rc.throwInfo+"</p>";
      if(rc.subcatShrink)receiptBody+="<p>Subcategory shrink: "+rc.subcatShrink+"</p>";
      if(rc.witness)receiptBody+="<p>Witness check: "+rc.witness+"</p>";
      if(rc.finalWitness)receiptBody+="<p>Final-step witness: "+rc.finalWitness+"</p>";
      if(rc.paintedWitness)receiptBody+="<p>Painted-geometry witness: "+rc.paintedWitness+"</p>";
      if(rc.anneal)receiptBody+="<p>Anneal settle: E "+dkFmtAnneal(rc.anneal.E_start)+" \u2192 "+dkFmtAnneal(rc.anneal.E_end)+" \u00b7 "+rc.anneal.sweeps+" sweeps \u00b7 "+rc.anneal.uphill_count+" uphill</p>";
      var receiptPhases=dkPhaseLines||[];
      if(receiptPhases.length)receiptBody+=dkReceiptDetails("phases:"+rc.name,"le-receipt-l2","<b>Phases ("+receiptPhases.length+")</b>",receiptPhases.join(""),false);
      if(receiptBody){
        statusEl.innerHTML=dkReceiptDetails("run:"+rc.name,"le-receipt-l1",dkReceiptSummaryInner(lead),receiptBody,true);
      }else{
        statusEl.innerHTML=lead;
      }
    }
    // F8 NAME MAPPING (do not rename the button): the layout editor's
    // "Anneal" BUTTON fires the deep untangler's driver —
    // __SEXCAPADES_LAYOUT_API.deknotter.run(), i.e. the bundle's
    // SX_SOLVER_FACADE.untangle(). The paint-stage annealer is a
    // DIFFERENT engine (the tidier, SX_SOLVER_FACADE.tidy) that runs
    // on every paint with no button involved. Button -> untangler
    // driver; paint -> tidier.
    async function onDeknotterClick(){
      if(deknotterRunning||deknotterLoopRunning)return;
      var scope=annealScope();
      if(scope.kind==="selected"){runAnnealLoop(scope.branches,true);return}
      if(scope.kind==="all"){runAnnealAllLoop(scope.branches);return}
      var name=scope.branches[0];if(!name)return;
      var statusEl=document.getElementById("layoutDeknotterStatus");
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.run!=="function"){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> — the DeKnotter driver is unavailable in this build.</p>";return}
      // Zero-cloud pre-flight (S4): when this cloud's crossing
      // number (Q4: the decider measureCloud reads) is already 0,
      // the cascade has nothing to untie.
      // Say so BEFORE starting it — naming the cloud and that it is
      // already at its floor — and offer the choice: running anyway
      // proceeds with the normal cascade; stopping costs nothing
      // (no state change, no cascade).
      if(typeof dk.measureCloud==="function"){
        var preCloud=null,preOk=false;
        try{preCloud=await dk.measureCloud(name);preOk=preCloud!=null&&Number.isFinite(Number(preCloud))}catch(e){preOk=false}
        if(preOk&&Number(preCloud)===0){
          dkReceipt=null;dkPhaseLines=[];
          if(statusEl){
            statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> is already at its floor — its crossing number is 0, so the DeKnotter has nothing to untie in this cloud. A run would take several seconds and change nothing.</p><p><button class=\"le-anneal-choice\" id=\"layoutDeknotterRunAnyway\" type=\"button\">Run anyway</button><button class=\"le-anneal-choice\" id=\"layoutDeknotterSkip\" type=\"button\">Stop</button></p>";
            var runBtn=document.getElementById("layoutDeknotterRunAnyway"),skipBtn=document.getElementById("layoutDeknotterSkip");
            if(skipBtn)skipBtn.addEventListener("click",function(){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> — DeKnotter stopped: the cloud is already at its floor, and nothing was changed.</p>"});
            if(runBtn)runBtn.addEventListener("click",function(){runDeknotterCascade(name)});
          }
          return;
        }
      }
      runDeknotterCascade(name);
    }
    async function runDeknotterCascade(name,btnProgressLabel){
      if(deknotterRunning)return;
      var statusEl=document.getElementById("layoutDeknotterStatus");
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.run!=="function"){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> \u2014 the DeKnotter driver is unavailable in this build.</p>";return}
      deknotterRunning=true;window.__sxAnnealRunning=true;deknotterCancelRequested=false;
      var startedAt=Date.now(),lines=[],lastCloud=null,beforeCloud=null,report=null,runError=null;
      // Q1 heartbeat state: the phase currently solving (fed by the
      // driver's onHeartbeat hook, driven from the solver's own
      // iteration poll) plus the watchdog that keeps the heartbeat
      // line present and fresh between phase commits, so a slow
      // phase never again reads as a stuck one.
      var hbPhase=null,hbIterations=0,hbTimer=null;
      var cancelBtn=document.getElementById("layoutDeknotterCancel");
      function paintHeartbeat(){
        if(!statusEl)return;
        var p=document.getElementById("layoutDeknotterHeartbeat");
        if(!p){p=document.createElement("p");p.id="layoutDeknotterHeartbeat";statusEl.appendChild(p)}
        var secs=((Date.now()-startedAt)/1000).toFixed(0);
        p.innerHTML="<b>"+dkEsc(name)+" · "+dkEsc(hbPhase||"starting")+"</b> — solving… "+secs+" s elapsed"+(hbIterations?" · "+hbIterations+" iterations":"");
      }
      dkPhaseLines=lines;dkReceipt=null;
      setDeknotterGroupDisabled(true);
      startDeknotterBusy();
      // Run-status label (2026-11-03): while this branch runs, the
      // Anneal button names it — the loop passes a counted label
      // ("Annealing <Branch> · n of total"); a standalone run names
      // the branch alone. Set here, in the synchronous prefix, so
      // the deknotterYield() below paints it before the first phase
      // solve blocks the main thread. syncDeknotterBtn() leaves the
      // label untouched while a run flag is set and restores the
      // idle label when the run ends, so nothing else changes it.
      var annealBtnLabelEl=document.getElementById("layoutAnnealBtnLabel");
      if(annealBtnLabelEl)annealBtnLabelEl.textContent=btnProgressLabel||("Annealing "+name);
      if(cancelBtn){cancelBtn.hidden=false;cancelBtn.disabled=false;cancelBtn.textContent="Cancel anneal"}
      AnnealCloudOverlay.start(name);
      paintHeartbeat();
      hbTimer=setInterval(function(){paintHeartbeat();AnnealCloudOverlay.tick()},1000);
      if(statusEl)statusEl.innerHTML="<p>Running the Nested Nodal DeKnotter on <b>"+dkEsc(name)+"</b>\u2026</p>";
      function renderPhase(summary){
        var req=summary.requestedRatios||{},del=summary.deliveredRatios||{},ranges=summary.deliveredRanges||{},cloudPart="";
        if(summary.cloud!=null&&Number.isFinite(Number(summary.cloud))){
          if(lastCloud!=null)cloudPart=" \u00b7 crossing "+dkFmtCloud(lastCloud)+" \u2192 "+dkFmtCloud(summary.cloud)+" (\u0394 "+dkFmtDelta(Number(summary.cloud)-lastCloud)+")";
          else cloudPart=" \u00b7 crossing "+dkFmtCloud(summary.cloud);
          lastCloud=Number(summary.cloud);
        }
        lines.push("<p><b>"+dkEsc(name)+" \u00b7 "+dkEsc(summary.phase||summary.name||"phase")+"</b> \u2014 requested \u2192 delivered: branch "+dkFmtRatio(req.branch)+" \u2192 "+dkFmtRatio(del.branch)+"; sub-groups "+dkFmtRatio(req.subcatMedian)+" \u2192 "+dkFmtRatio(del.subcatMedian)+" (range "+dkFmtRange(ranges.subcat)+"); topics "+dkFmtRatio(req.kinkMedian)+" \u2192 "+dkFmtRatio(del.kinkMedian)+" (range "+dkFmtRange(ranges.kink)+") \u00b7 "+dkEsc(dkHitSummary(summary.limiterHits))+(summary.fitDeviationCount?(" · fit deviations "+summary.fitDeviationCount):"")+(summary.scoped?(" · scoped: ring "+(Array.isArray(summary.scoped.ring)?summary.scoped.ring.length:0)+" · frozen "+summary.scoped.frozenCount+(summary.scoped.fallback?(" · FALLBACK "+dkEsc(summary.scoped.fallback)):"")):"")+cloudPart+" \u00b7 "+((Date.now()-startedAt)/1000).toFixed(1)+"s</p>");
        if(statusEl)statusEl.innerHTML=lines.join("");
        AnnealCloudOverlay.setPhase(summary.phase||summary.name||null);AnnealCloudOverlay.update(summary.cloud,true);
      }
      try{
        // Yield after setting the busy state and BEFORE calling run(),
        // so the spinner and progress cursor actually paint before the
        // first synchronous phase solve blocks the main thread.
        await deknotterYield();
        try{beforeCloud=await dk.measureCloud(name)}catch(e){beforeCloud=null;__sxErrLog("deknotter-baseline",e)}
        if(beforeCloud!=null&&Number.isFinite(Number(beforeCloud))){lastCloud=Number(beforeCloud);AnnealCloudOverlay.update(beforeCloud,true)}
        report=await dk.run(name,{onBackoutGate:annealBackoutGateOn?function(info){return annealBackoutGateConfirm(info)}:null,onDiagPause:annealDiagOn?function(info){return annealDiagPause(info)}:null,diag00:annealDiagOn,onDemandFullPaint:annealOnDemandPaintOn,throwBracket:annealThrowBracketOn,onThrowBracketPause:annealThrowBracketOn?function(info){return annealDiagPause(info)}:null,onPhase:function(summary){
          try{sync()}catch(e){__sxErrLog("deknotter-phase-sync",e)}
          setDeknotterGroupDisabled(true);
          renderPhase(summary);
        },onHeartbeat:function(hb){
          // Q1: fed from the solver's per-iteration poll while a
          // phase is solving (and once at each phase's start).
          if(hb&&hb.phase)hbPhase=String(hb.phase);
          if(hb&&Number.isFinite(Number(hb.iterations)))hbIterations=Number(hb.iterations);
          paintHeartbeat();
          AnnealCloudOverlay.setPhase(hbPhase);AnnealCloudOverlay.heartbeat();
        },shouldCancel:function(){return deknotterCancelRequested}});
      }catch(e){
        runError=e;__sxErrLog("deknotter-run",e);
      }finally{
        // Busy state, cursor class, aria-busy and the group's disabled
        // states clear on EVERY exit path — success, gate revert, and
        // exception alike.
        deknotterRunning=false;
        window.__sxAnnealRunning=false;
        if(hbTimer){clearInterval(hbTimer);hbTimer=null}
        if(cancelBtn)cancelBtn.hidden=true;
        stopDeknotterBusy();
        AnnealCloudOverlay.stop();
        setDeknotterGroupDisabled(false);
        try{sync()}catch(e){__sxErrLog("deknotter-end-sync",e)}
      }
      // Completion readout: gate result (with reason when reverted)
      // and the branch's crossing number (decider) before \u2192 after \u2192 delta,
      // area labeled secondary alongside. (M1, 2026-10-29: the area
      // fields are commented out below — area leaves observation.)
      // No raw value stands without its delta.
      var elapsed=((Date.now()-startedAt)/1000).toFixed(1)+" s";
      // Receipt (S5): the end summary LEADS with a single result
      // line — cloud name, before \u2192 after, \u0394, KEPT or
      // REVERTED, elapsed — rendered by renderDkReceipt ahead of
      // the per-phase narration, never buried after it.
      if(runError){
        dkReceipt={name:name,error:String(runError&&runError.message||runError),elapsed:elapsed,startedAtMs:startedAt,fresh:true,awaitingSettle:false};
      }else if(report){
        var before=(report.baseline&&report.baseline.first!=null)?Number(report.baseline.first):beforeCloud;
        var after=report.finalCloud!=null?Number(report.finalCloud):null;
        var delta=report.delta!=null?Number(report.delta):(before!=null&&after!=null?after-before:null);
        var subShrinkTxt="";if(report.subcatShrink&&report.subcatShrink.length){var subReached=report.subcatShrink.filter(function(s){return s.outcome==="reached-3x-floor"}),subHeld=report.subcatShrink.filter(function(s){return s.outcome!=="reached-3x-floor"});subShrinkTxt=subReached.length+" of "+report.subcatShrink.length+" subcategories shrunk to the 3× length floor"+(subHeld.length?(" · held: "+subHeld.map(function(s){return dkEsc(s.label)+" ("+dkEsc(String(s.outcome).replace(/-/g," "))+(s.standing!=null?(" at "+Math.round(s.standing)):"")+"; "+(s.from!=null?Math.round(s.from):"—")+" → "+(s.floor!=null?Math.round(s.floor):"—")+")"}).join(", ")):"")}
        var witnessTxt="";if(report.witness){var wv=report.witness;if(wv.verdict==="proven"&&wv.culprit)witnessTxt="PROVEN — the "+dkEsc(wv.culprit.event)+" at "+dkEsc(wv.culprit.phase||"")+" returned "+wv.culprit.subcats.map(function(s){return dkEsc(s)}).join(", ")+" to thrown length all at once, not one step ("+wv.frames.length+" frames, "+wv.events.length+" back-outs checked)";else if(wv.verdict==="ruled-out")witnessTxt="ruled out — "+wv.events.length+" back-out(s) checked frame by frame and none returned a subcategory to its thrown length ("+wv.frames.length+" frames)";else if(wv.verdict==="no-backout-observed")witnessTxt="not settled — no back-out fired in this run ("+wv.frames.length+" frames captured)";else witnessTxt="check did not run"}
        var finalWitnessTxt="";if(report.witness&&report.witness.finalStep){var fs=report.witness.finalStep,fsTr=function(nm){return (fs.transitions||[]).filter(function(t){return t.transition===nm})[0]||null},fsFmt=function(t){return t?t.flung.map(function(f){return dkEsc(f.label)+" "+Math.round(f.before)+" → "+Math.round(f.after)+(f.toThrown?" (thrown "+Math.round(f.thrown)+")":"")}).join(", "):""};if(fs.verdict==="proven"&&fs.culprit){var ct=fsTr(fs.culprit.transition);finalWitnessTxt="PROVEN — the "+dkEsc(fs.culprit.transition==="closing-full-paint"?"closing full paint":"final patch commit")+" flung "+fsFmt(ct)+" back out all at once, past one step — operation: "+dkEsc(fs.operation)}else if(fs.verdict==="held")finalWitnessTxt="held — the final step ("+dkEsc(fs.operation)+") kept every subcategory within one step of its last kept length, through the closing full paint";else if(fs.verdict==="moved-not-wholesale"){var mt=(fs.transitions||[]).filter(function(t){return t.flung.length})[0];finalWitnessTxt="moved, not wholesale — the "+dkEsc(mt?mt.transition:"")+" moved "+fsFmt(mt)+" past one step, but no wholesale fling (operation: "+dkEsc(fs.operation)+")"}else finalWitnessTxt="not observed — the final step ("+dkEsc(fs.operation||"unknown")+") could not be framed in this run"}
        var paintedWitnessTxt="";if(report.witness&&report.witness.painted){var pw=report.witness.painted,pwTr=function(nm){return (pw.transitions||[]).filter(function(t){return t.transition===nm})[0]||null},pwFmt=function(t){return t?t.flung.map(function(f){return dkEsc(f.label)+" "+dkEsc(f.metric)+" "+Math.round(f.before)+" → "+Math.round(f.after)+(f.toThrown?" (thrown "+Math.round(f.thrown)+")":"")}).join(", "):""},pwPair=pw.capturePair?(" · capture pair: "+dkEsc(pw.capturePair.beforeClosingPaint||"—")+" → "+dkEsc(pw.capturePair.afterClosingPaint||"—")+" → "+dkEsc(pw.capturePair.afterSettle||"—")):"",pwDiv=pw.divergence?" · MEASUREMENT DIVERGENCE — painted segment past one step beyond the bookkeeping delivered radius after the same paint; the witness now reads painted geometry":"";if(pw.verdict==="proven"&&pw.culprit){var pct=pwTr(pw.culprit.transition);paintedWitnessTxt="PROVEN — the "+dkEsc(pw.culprit.transition)+" flung "+pwFmt(pct)+" back out all at once, past one step — operation: "+dkEsc(pw.culprit.operation||pw.operation||"")+pwPair+pwDiv}else if(pw.verdict==="held")paintedWitnessTxt="held — painted branch radius, segment and absolute radius kept every subcategory within one step of its last kept length, through the closing full paint and after settle (capture pair spanning the closing paint)"+pwPair+pwDiv;else if(pw.verdict==="moved-not-wholesale"){var pmt=(pw.transitions||[]).filter(function(t){return t.flung.length})[0];paintedWitnessTxt="moved, not wholesale — the "+dkEsc(pmt?pmt.transition:"")+" moved "+pwFmt(pmt)+" past one step, but no wholesale fling — operation: "+dkEsc(pmt?pmt.operation||"":"")+pwPair+pwDiv}else paintedWitnessTxt="not observed — the painted frames could not be captured in this run"+pwPair+pwDiv}
        var throwTxt="";if(report.throwRadii){var tr=report.throwRadii;throwTxt="branch thrown to "+Math.round(tr.branchTarget)+" — "+tr.branchFactor+" × the center avatar radius ("+Math.round(tr.centerRadius)+") from the center · subcategories thrown to a "+Math.round(tr.subcatTarget)+" segment — "+tr.subcatFactor+" × that radius out from the branch node";if(tr.branchLength==null)throwTxt+=" · branch not converted (no pre-run delivered radius — left at its current length)";if(tr.subcatNotConverted&&tr.subcatNotConverted.length)throwTxt+=" · not converted (left at current length): "+tr.subcatNotConverted.map(function(s){return dkEsc(s)}).join(", ")}if(report.throwRepeat&&report.throwRepeat.throws>1){var twr=report.throwRepeat;throwTxt+=" · throw repeated "+(twr.throws-1)+" extra time"+(twr.throws>2?"s":"")+" — crossing "+(twr.before!=null?Math.round(twr.before):"?")+" → "+(twr.finalAfter!=null?Math.round(twr.finalAfter):"?")+(twr.substantial?" (substantial >75% drop reached)":" (still no >75% drop)")}
        dkReceipt={name:name,before:before,after:after,delta:delta,subcatShrink:subShrinkTxt||null,witness:witnessTxt||null,finalWitness:finalWitnessTxt||null,paintedWitness:paintedWitnessTxt||null,throwInfo:throwTxt||null,skipThrow:(report.fineTune&&report.fineTune.active)?{baseline:report.fineTune.baseline,below:report.fineTune.below}:null,gate:report.gate==="kept"?"kept":(report.gate==="ended-at-category-backout"?"ended-at-category-backout":"reverted"),backoutGate:(report.backoutGate&&report.backoutGate.decision==="rejected")?{code:String(report.backoutGate.code||"ANNEAL-BO-01"),branch:report.backoutGate.branch!=null?String(report.backoutGate.branch):name,phase:report.backoutGate.phase!=null?String(report.backoutGate.phase):null,crossingBefore:report.backoutGate.crossingBefore!=null?Number(report.backoutGate.crossingBefore):null,crossingAfter:report.backoutGate.crossingAfter!=null?Number(report.backoutGate.crossingAfter):null}:null,diagLines:(report.diag&&report.diag.length)?report.diag.map(function(d){return String(d&&d.text||d&&d.code||"")}):null,reason:report.reason?String(report.reason):"",aborted:(report.aborted&&report.aborted.kind)?{kind:String(report.aborted.kind),phase:report.aborted.phase!=null?String(report.aborted.phase):null,iterations:report.aborted.iterations||0}:null,coverage:report.coverage?(report.coverage.actedOn+"/"+report.coverage.totalInBranch+" items"):"",fitdev:(report.fitDeviationTotal!=null&&Number.isFinite(Number(report.fitDeviationTotal)))?Number(report.fitDeviationTotal):null,elapsed:elapsed,startedAtMs:startedAt,fresh:true,awaitingSettle:false};
      }else{
        dkReceipt={name:name,noreport:true,elapsed:elapsed,startedAtMs:startedAt,fresh:true,awaitingSettle:false};
      }
      // Q1: an aborted (budget) or cancelled run names itself ahead
      // of the receipt, with the phase's iteration count — the
      // cascade has already restored the pre-run snapshot.
      if(report&&report.aborted){
        if(report.aborted.kind==="budget")lines.push("<p><b>"+dkEsc(name)+" · aborted: phase "+dkEsc(report.aborted.phase||"")+" exceeded budget</b> — 180 s cap · "+report.aborted.iterations+" iterations · snapshot restored</p>");
        else lines.push("<p><b>"+dkEsc(name)+" · cancelled</b> — stopped during phase "+dkEsc(report.aborted.phase||"")+" · "+report.aborted.iterations+" iterations · snapshot restored</p>");
      }
      renderDkReceipt();
      noteSettlePending();
    }
    // Anneal loop driver (shell only, shared by Anneal all and by
    // the checklist subset loop): calls the existing
    // single-branch cascade verbatim once per branch. For a
    // multi-branch run the branches run in decreasing crossing
    // number, highest first: every branch's crossing number is
    // measured ONCE on the layout as it stands at run start, the
    // order is fixed from that snapshot and is never re-sorted
    // mid-run, so later branches see earlier branches' changes but
    // keep their start order. The run order, with each branch's
    // starting crossing number, is shown in the status log at run
    // start and again in the aggregate receipt. A single-branch
    // run keeps the branch-list order and shows no run-order list.
    // Snapshot, baseline, gate, receipt,
    // termination and disarm all stay inside the cascade per branch;
    // the loop adds no whole-map gate on top — each branch is judged
    // on its own gate only. A category back-out or a 180 s budget
    // abort inside a branch CONTINUES to the next branch and is
    // listed in the aggregate receipt; Cancel STOPS the whole loop.
    // The cascade's own busy helpers restart per branch, so the loop
    // re-pins the busy start to the loop's start after each branch
    // begins — the elapsed readout spans the loop, not one branch.
    async function runAnnealLoop(names,subset){
      if(deknotterRunning||deknotterLoopRunning)return;
      var statusEl=document.getElementById("layoutDeknotterStatus");
      var loopTitle=subset?("Anneal selected ("+(names?names.length:0)+")"):"Anneal all";
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.run!=="function"){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(loopTitle)+"</b> — the DeKnotter driver is unavailable in this build.</p>";return}
      if(!names||!names.length){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(loopTitle)+"</b> — no branches have rendered yet. Open the map first, then press "+dkEsc(loopTitle)+".</p>";return}
      deknotterLoopRunning=true;deknotterLoopCancelRequested=false;
      var loopStartedAt=Date.now(),results=[],allLines=[],stoppedByCancel=false;
      var isMultiAnneal=names.length>1,startCrossing={},runOrder=names.slice();
      if(isMultiAnneal){try{var snapCross=typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null;if(snapCross&&snapCross.clouds)names.forEach(function(n){var vCross=Number(snapCross.clouds[n]);startCrossing[n]=Number.isFinite(vCross)?vCross:null})}catch(e){startCrossing={}}}
      function annealRunOrderHtml(){if(!isMultiAnneal)return "";var h="<p><b>Run order \u2014 highest crossing first (crossing measured at run start):</b></p>";runOrder.forEach(function(n,idx){h+="<p>"+(idx+1)+". "+dkEsc(n)+" \u2014 crossing "+dkFmtLead(startCrossing[n])+"</p>"});return h}
      function annealRunOrderDetailsHtml(){if(!isMultiAnneal)return "";var items=runOrder.map(function(n,idx){return "<p>"+(idx+1)+". "+dkEsc(n)+" \u2014 crossing "+dkFmtLead(startCrossing[n])+"</p>"}).join("");return dkReceiptDetails("loop:order","le-receipt-l2","<b>Run order \u2014 highest crossing first ("+runOrder.length+")</b>",items,false)}
      if(isMultiAnneal){
        for(var mi=0;mi<names.length;mi++){if(startCrossing[names[mi]]==null&&typeof dk.measureCloud==="function"){try{var mvCross=await dk.measureCloud(names[mi]);startCrossing[names[mi]]=(mvCross!=null&&Number.isFinite(Number(mvCross)))?Number(mvCross):null}catch(e){startCrossing[names[mi]]=null}}}
        runOrder=names.map(function(n,idx){return{name:n,idx:idx,val:startCrossing[n]}}).sort(function(a,b){var av=a.val==null?-Infinity:a.val,bv=b.val==null?-Infinity:b.val;return bv!==av?bv-av:a.idx-b.idx}).map(function(o){return o.name});
      }
      var loopIntro=isMultiAnneal?(subset?("<p><b>"+dkEsc(loopTitle)+"</b> \u2014 running the "+names.length+" picked branches in decreasing crossing order, highest first. Cancel stops the whole loop.</p>"):("<p><b>Anneal all</b> \u2014 running every branch in decreasing crossing order, highest first ("+names.length+" branches). Cancel stops the whole loop.</p>")):(subset?("<p><b>"+dkEsc(loopTitle)+"</b> — running the "+names.length+" picked branch"+(names.length===1?"":"es")+" in branch order: "+names.map(function(n){return dkEsc(n)}).join(", ")+". Cancel stops the whole loop.</p>"):("<p><b>Anneal all</b> — running every branch in order ("+names.length+" branches). Cancel stops the whole loop.</p>"));
      if(statusEl)statusEl.innerHTML=loopIntro+annealRunOrderHtml();
      for(var i=0;i<runOrder.length;i++){
        if(deknotterLoopCancelRequested){stoppedByCancel=true;break}
        var name=runOrder[i];
        var pending=runDeknotterCascade(name,runOrder.length>1?("Annealing "+name+" \u00b7 "+(i+1)+" of "+runOrder.length):null);
        deknotterBusyStart=loopStartedAt;
        await pending;
        var rc=dkReceipt?{name:dkReceipt.name,before:dkReceipt.before,after:dkReceipt.after,delta:dkReceipt.delta,gate:dkReceipt.gate,backoutGate:dkReceipt.backoutGate||null,reason:dkReceipt.reason,error:dkReceipt.error,noreport:dkReceipt.noreport,aborted:dkReceipt.aborted||null,subcatShrink:dkReceipt.subcatShrink||null,witness:dkReceipt.witness||null,finalWitness:dkReceipt.finalWitness||null,paintedWitness:dkReceipt.paintedWitness||null,throwInfo:dkReceipt.throwInfo||null,skipThrow:dkReceipt.skipThrow||null}:null;
        var linesCopy=(dkPhaseLines||[]).slice();
        for(var li=0;li<linesCopy.length;li++)allLines.push(linesCopy[li]);
        // Cancel/timeout detection reads the cascade's structured
        // abort record (report.aborted, carried onto the receipt
        // above) — never the receipt's display wording, so a
        // rewording of the phase lines cannot misclassify a run.
        var wasCancelled=!!(rc&&rc.aborted&&rc.aborted.kind==="cancel");
        var wasBudget=!!(rc&&rc.aborted&&rc.aborted.kind==="budget");
        results.push({name:name,receipt:rc,cancelled:wasCancelled,budget:wasBudget,lines:linesCopy});
        if(wasCancelled||deknotterLoopCancelRequested){stoppedByCancel=true;break}
      }
      deknotterLoopRunning=false;
      dkReceipt=null;dkPhaseLines=allLines;
      var elapsedTotal=((Date.now()-loopStartedAt)/1000).toFixed(1)+" s";
      var sumB=0,sumA=0,sumD=0,haveSum=false,keptN=0,revertedN=0,backedN=0,budgetN=0,cancelledN=0,failedN=0,branchNodes=[];
      results.forEach(function(r){
        var rc2=r.receipt,gateLabel;
        if(r.cancelled){gateLabel="CANCELLED — snapshot restored";cancelledN++}
        else if(r.budget){gateLabel="BUDGET ABORTED — snapshot restored";budgetN++}
        else if(!rc2){gateLabel="NO REPORT";failedN++}
        else if(rc2.error){gateLabel="FAILED";failedN++}
        else if(rc2.noreport){gateLabel="FINISHED — NO REPORT";failedN++}
        else if(rc2.gate==="kept"){gateLabel="KEPT";keptN++}
        else if(rc2.gate==="ended-at-category-backout"){gateLabel="ENDED AT CATEGORY BACK-OUT — backed-out state stands";backedN++}
        else{gateLabel="REVERTED";revertedN++}
        if(rc2&&Number.isFinite(Number(rc2.before))&&Number.isFinite(Number(rc2.after))){haveSum=true;sumB+=Number(rc2.before);sumA+=Number(rc2.after);sumD+=Number(rc2.delta!=null?rc2.delta:(Number(rc2.after)-Number(rc2.before)))}
        var branchSummary="<b>"+dkEsc(r.name)+": crossing "+dkFmtLead(rc2?rc2.before:null)+" \u2192 "+dkFmtLead(rc2?rc2.after:null)+" (\u0394 "+dkFmtLeadDelta(rc2?rc2.delta:null)+") — "+gateLabel+"</b>"+(rc2&&rc2.backoutGate?(" — back-out gate REJECTED ["+dkEsc(rc2.backoutGate.code)+"] at "+dkEsc(rc2.backoutGate.phase||"")+": crossing "+dkFmtLead(rc2.backoutGate.crossingBefore)+" → tripped "+dkFmtLead(rc2.backoutGate.crossingAfter)+", tripped geometry left standing"):"")+(rc2&&rc2.reason?(" — "+dkEsc(rc2.reason)):"")+(rc2&&rc2.error?(" — "+dkEsc(rc2.error)):"")+(rc2&&rc2.skipThrow?(" · throw skipped (crossing below "+dkFmtLead(rc2.skipThrow.below)+") — shrank the subcategories first, then the category, from current lengths"):"")+(rc2&&rc2.throwInfo?(" · throw: "+rc2.throwInfo):"")+(rc2&&rc2.subcatShrink?(" · subcategory shrink: "+rc2.subcatShrink):"")+(rc2&&rc2.witness?(" · witness: "+rc2.witness):"")+(rc2&&rc2.finalWitness?(" · final-step witness: "+rc2.finalWitness):"")+(rc2&&rc2.paintedWitness?(" · painted-geometry witness: "+rc2.paintedWitness):"");
        var branchBody=(r.lines&&r.lines.length)?r.lines.join(""):"<p>No phase lines were recorded for this branch.</p>";
        branchNodes.push(dkReceiptDetails("loop:branch:"+r.name,"le-receipt-l2",branchSummary,branchBody,false));
      });
      var lead="<p><b>"+dkEsc(loopTitle)+" — "+results.length+" of "+names.length+" branches run · crossing "+(haveSum?(dkFmtLead(sumB)+" \u2192 "+dkFmtLead(sumA)+" (\u0394 "+dkFmtLeadDelta(sumD)+")"):"—")+" · kept "+keptN+" · reverted "+revertedN+" · backed out "+backedN+" · budget-aborted "+budgetN+(cancelledN?(" · cancelled "+cancelledN):"")+(failedN?(" · failed "+failedN):"")+" · "+elapsedTotal+" total</b>"+(stoppedByCancel?" — Cancel stopped the whole loop; branches not yet run were left untouched.":"")+"</p>";
      var loopNote="<p>Loop totals are the sum of the per-branch results; each branch was kept or reverted on its own gate.</p>";
      if(statusEl)statusEl.innerHTML=dkReceiptDetails("loop:"+loopTitle,"le-receipt-l1",dkReceiptSummaryInner(lead),loopNote+annealRunOrderDetailsHtml()+branchNodes.join(""),true);
      try{sync()}catch(e){__sxErrLog("anneal-all-end-sync",e)}
    }
    // Whole-map press entry point: the shared loop driver over the
    // full branch list. The checklist subset press calls
    // runAnnealLoop(names,true) directly, with subset totals only.
    function runAnnealAllLoop(names){return runAnnealLoop(names,false)}
    var deknotterBtnEl=document.getElementById("layoutAnnealBtn");
    if(deknotterBtnEl)deknotterBtnEl.addEventListener("click",function(){onDeknotterClick()});
    // Checklist bindings: ticking a row re-syncs the Anneal button's
    // scope label/tooltip; Select all / Clear set every row at once.
    // Nothing here is cleared by a run (S5). MAP SYNC (ruled
    // 2026-11-01, Jason): checking a row also selects that branch
    // on the map (selectOnMap, the branch picker's own path), so
    // list and map stay in sync both ways — the map-to-list half
    // is checkAnnealBranchFromMap at focusEditorOn above.
    var annealCheckRowsEl=document.getElementById("layoutAnnealChecklistRows");
    if(annealCheckRowsEl)annealCheckRowsEl.addEventListener("click",function(event){var opt=event.target&&event.target.closest?event.target.closest("[data-anneal-check]"):null;if(!opt)return;var nowOn=opt.getAttribute("aria-selected")!=="true";opt.setAttribute("aria-selected",String(nowOn));syncDeknotterBtn();if(nowOn)selectOnMap(opt.getAttribute("data-value"))});
    var annealTriggerEl=document.getElementById("layoutAnnealTrigger"),annealMenuEl=document.getElementById("layoutAnnealMenu");
    function closeAnnealMenu(){if(annealMenuEl){annealMenuEl.hidden=true;annealMenuEl.style.left="";annealMenuEl.style.top=""}if(annealTriggerEl)annealTriggerEl.setAttribute("aria-expanded","false")}
    if(annealTriggerEl&&annealMenuEl){annealTriggerEl.addEventListener("click",function(){if(annealMenuEl.hidden){buildAnnealChecklist();refreshAnnealCrossings();openLeMenu(annealTriggerEl,annealMenuEl,closeBranchOrderMenu)}else closeAnnealMenu()});document.addEventListener("pointerdown",function(event){if(!annealMenuEl.hidden&&!annealMenuEl.contains(event.target)&&event.target!==annealTriggerEl&&!annealTriggerEl.contains(event.target))closeAnnealMenu()});document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!annealMenuEl.hidden){closeAnnealMenu();annealTriggerEl.focus()}})}
    var annealCheckAllEl=document.getElementById("layoutAnnealCheckAll");
    if(annealCheckAllEl)annealCheckAllEl.addEventListener("click",function(){buildAnnealChecklist();setAnnealChecklist(true)});
    var annealCheckClearEl=document.getElementById("layoutAnnealCheckClear");
    if(annealCheckClearEl)annealCheckClearEl.addEventListener("click",function(){setAnnealChecklist(false)});
    // Q1: the busy state's Cancel control — sets the flag the
    // solver's per-iteration poll reads; the run stops mid-phase,
    // restores the snapshot, and reports the cancel.
    var deknotterCancelEl=document.getElementById("layoutDeknotterCancel");
    if(deknotterCancelEl)deknotterCancelEl.addEventListener("click",function(){
      if(!deknotterRunning&&!deknotterLoopRunning)return;
      if(deknotterLoopRunning)deknotterLoopCancelRequested=true;
      deknotterCancelRequested=true;
      deknotterCancelEl.disabled=true;
      deknotterCancelEl.textContent="Cancelling…";
    });
    function syncBranch(c){var select=document.getElementById("layoutBranch"),name=select.value,entry=name&&c.branchOverrides?c.branchOverrides[name]:null,len=document.getElementById("layoutBranchLen"),angle=document.getElementById("layoutBranchAngle");len.disabled=angle.disabled=!name;var curBranchLen=(entry&&Number(entry.length))||bakedBranchBase(name);if(len!==document.activeElement)len.value=String(relClamp(curBranchLen/bakedBranchBase(name)));if(angle!==document.activeElement)angle.value=String(entry&&Number(entry.angle)||0);document.getElementById("layoutBranchLenValue").textContent=fmtLen(curBranchLen);document.getElementById("layoutBranchAngleValue").textContent=Number(angle.value).toFixed(0)+"°";var subLenEl=document.getElementById("layoutBranchSubLen"),kinkLenEl=document.getElementById("layoutBranchKinkLen"),members=name?branchMembers(name):{subs:[],kinks:[]};subLenEl.disabled=!name||!members.subs.length;kinkLenEl.disabled=!name||!members.kinks.length;if(subLenEl!==document.activeElement)subLenEl.value=String(entry&&Number(entry.subScale)||1);if(kinkLenEl!==document.activeElement)kinkLenEl.value=String(entry&&Number(entry.kinkScale)||1);document.getElementById("layoutBranchSubLenValue").textContent=Number(subLenEl.value).toFixed(2)+"×";document.getElementById("layoutBranchKinkLenValue").textContent=Number(kinkLenEl.value).toFixed(2)+"×";/* AUTOFIT (Group 3d): the branch kink-lines control is now the one-shot Autofit button — it has no checked/disabled state to sync and is never disabled for lack of a selection (no selection = whole map). */var branchSpoke=document.getElementById("layoutBranchSpokeAutoShrink");branchSpoke.disabled=!name;branchSpoke.checked=!!(c.branchSpokeAutoShrink&&c.branchSpokeAutoShrink[name]===true);var bph=document.getElementById("layoutBranchPickHint");if(bph)bph.hidden=!!name;var bph2=document.getElementById("layoutBranchPickHint2");if(bph2)bph2.hidden=!!name;var nsh=document.getElementById("layoutBranchNoSubcatsHint");if(nsh)nsh.hidden=!name||!!members.subs.length;syncBranchHonesty(c);syncDeknotterBtn();syncTargetNode(c)}function syncKink(c){var select=document.getElementById("layoutKink"),id=select.value,entry=id&&c.kinkOverrides?c.kinkOverrides[id]:null,aentry=id&&c.kinkAngleOffsets?c.kinkAngleOffsets[id]:null,len=document.getElementById("layoutKinkLen"),ang=document.getElementById("layoutKinkAngle");len.disabled=!id;ang.disabled=!id;var curKinkLen=(entry&&Number(entry.length))||bakedKinkBase(id);if(len!==document.activeElement)len.value=String(relClamp(curKinkLen/bakedKinkBase(id)));document.getElementById("layoutKinkLenValue").textContent=fmtLen(curKinkLen);if(ang!==document.activeElement)ang.value=String(aentry&&Number(aentry.angle)||0);document.getElementById("layoutKinkAngleValue").textContent=Number(ang.value).toFixed(1)+"°";var kph=document.getElementById("layoutKinkPickHint");if(kph)kph.hidden=!!id}
    function populateSubcats(){var select=document.getElementById("layoutSubcat");if(!select||select.options.length>1||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.subcategories)return;try{window.__SEXCAPADES_LAYOUT_API.subcategories().forEach(function(name){var option=document.createElement("option");option.value=name;option.textContent=name;select.appendChild(option)})}catch (e) { __sxErrLog("taxonomy-select", e); }}
    function syncTargetNode(c){
      populateTargetNodes();
      var bSel=document.getElementById("layoutBranch"),sSel=document.getElementById("layoutSubcat"),tn=document.getElementById("layoutTargetNode");
      if(!tn)return;
      var bVal=bSel?bSel.value:"",sVal=sSel?sSel.value:"";
      var pickHint=document.getElementById("layoutNodePickHint");
      var tiltRow=document.getElementById("layoutNodeTiltRow");
      var linesRow=document.getElementById("layoutLinesToChildrenRow");
      var lenLabel=document.getElementById("layoutNodeLenLabel");
      var shrinkLabel=document.getElementById("layoutNodeSpokeAutoShrinkLabel");
      var factorLabel=document.getElementById("layoutNodeShrinkFactorLabel");
      var armSubsLabel=document.getElementById("layoutArmSubsLabel");
      var nodeLen=document.getElementById("layoutNodeLen"),nodeLenNum=document.getElementById("layoutNodeLenNum");
      var nodeSpoke=document.getElementById("layoutNodeSpokeAutoShrink");
      var nodeFactor=document.getElementById("layoutNodeShrinkFactor"),nodeFactorNum=document.getElementById("layoutNodeShrinkFactorNum");
      var targetNodeCurrent=document.getElementById("layoutTargetNodeCurrent");

      if(bVal){
        if(tn!==document.activeElement)tn.value="branch:"+bVal;
        if(targetNodeCurrent)targetNodeCurrent.textContent=bVal;
        if(pickHint)pickHint.hidden=true;
        if(tiltRow)tiltRow.hidden=true;
        if(linesRow)linesRow.hidden=false;
        if(lenLabel)lenLabel.textContent="This branch's line length";
        if(shrinkLabel)shrinkLabel.textContent="Auto-shrink branch spoke";
        if(factorLabel)factorLabel.textContent="Auto-shrink factor — branch spokes";
        if(armSubsLabel)armSubsLabel.textContent="For all subcategories";
        var bLen=document.getElementById("layoutBranchLen");
        if(nodeLen&&bLen&&nodeLen!==document.activeElement){nodeLen.value=bLen.value;nodeLen.disabled=false;}
        if(nodeLenNum&&bLen&&nodeLenNum!==document.activeElement){nodeLenNum.value=bLen.value;nodeLenNum.disabled=false;}
        var bSpoke=document.getElementById("layoutBranchSpokeAutoShrink");
        if(nodeSpoke&&bSpoke){nodeSpoke.checked=bSpoke.checked;nodeSpoke.disabled=false;}
        var bFac=document.getElementById("layoutAutoShrinkFactor");
        if(nodeFactor&&bFac&&nodeFactor!==document.activeElement){nodeFactor.value=bFac.value;}
        if(nodeFactorNum&&bFac&&nodeFactorNum!==document.activeElement){nodeFactorNum.value=bFac.value;}
      }else if(sVal){
        if(tn!==document.activeElement)tn.value="subcat:"+sVal;
        var tax=taxonomy(),pName="";
        if(tax&&tax.categories){
          for(var i=0;i<tax.categories.length;i++){
            var cat=tax.categories[i];
            if(cat.subcategories&&cat.subcategories.some(function(s){return s.name===sVal})){pName=cat.name;break}
          }
        }
        if(targetNodeCurrent)targetNodeCurrent.textContent=pName?(pName+" > "+sVal):sVal;
        if(pickHint)pickHint.hidden=true;
        if(tiltRow)tiltRow.hidden=false;
        if(linesRow)linesRow.hidden=true;
        if(lenLabel)lenLabel.textContent="This sub-group's line length";
        if(shrinkLabel)shrinkLabel.textContent="Auto-shrink sub-group line";
        if(factorLabel)factorLabel.textContent="Sub-group cloud shrink factor";
        if(armSubsLabel)armSubsLabel.textContent="For all subcategories";
        var sLen=document.getElementById("layoutSubcatLen");
        if(nodeLen&&sLen&&nodeLen!==document.activeElement){nodeLen.value=sLen.value;nodeLen.disabled=false;}
        if(nodeLenNum&&sLen&&nodeLenNum!==document.activeElement){nodeLenNum.value=sLen.value;nodeLenNum.disabled=false;}
        var sSpoke=document.getElementById("layoutSubcatSpokeAutoShrink");
        if(nodeSpoke&&sSpoke){nodeSpoke.checked=sSpoke.checked;nodeSpoke.disabled=false;}
        var sFac=document.getElementById("layoutSubcatCloudShrinkFactor");
        if(nodeFactor&&sFac&&nodeFactor!==document.activeElement){nodeFactor.value=sFac.value;}
        if(nodeFactorNum&&sFac&&nodeFactorNum!==document.activeElement){nodeFactorNum.value=sFac.value;}
      }else{
        if(tn!==document.activeElement)tn.value="";
        if(targetNodeCurrent)targetNodeCurrent.textContent="Select a node";
        if(pickHint)pickHint.hidden=false;
        if(nodeLen)nodeLen.disabled=true;
        if(nodeLenNum)nodeLenNum.disabled=true;
        if(nodeSpoke)nodeSpoke.disabled=true;
      }
      var activeVal=tn.value||"";
      var treeMenu=document.getElementById("layoutTargetNodeMenu");
      if(treeMenu){
        treeMenu.querySelectorAll(".le-tree-node-btn").forEach(function(b){
          var isSel=(b.getAttribute("data-node-val")||"")===activeVal;
          b.setAttribute("aria-selected",String(isSel));
          if(isSel&&activeVal.indexOf("subcat:")===0){
            var parentWrap=b.closest(".le-tree-children");
            if(parentWrap){
              parentWrap.hidden=false;
              var row=parentWrap.previousElementSibling;
              if(row){
                var tog=row.querySelector(".le-tree-toggle");
                if(tog){
                  tog.setAttribute("aria-expanded","true");
                  var tri=tog.querySelector(".le-tree-triangle");
                  if(tri)tri.textContent="▼";
                }
              }
            }
          }
        });
      }
    }
    function bindTargetNode(){
      var tn=document.getElementById("layoutTargetNode");
      if(tn&&!tn.dataset.bound){
        tn.dataset.bound="1";
        tn.addEventListener("change",function(){
          var val=this.value;
          var bSel=document.getElementById("layoutBranch"),sSel=document.getElementById("layoutSubcat");
          if(val.indexOf("branch:")===0){
            var bName=val.slice(7);
            if(bSel)bSel.value=bName;
            if(sSel)sSel.value="";
            syncBranch(config());
            syncSubcatAngle(config());
            setFocusKey("branch:"+bName);
            if(window.__sxFocusBranch)window.__sxFocusBranch(bName);
          }else if(val.indexOf("subcat:")===0){
            var sName=val.slice(7);
            if(sSel)sSel.value=sName;
            if(bSel)bSel.value="";
            syncSubcatAngle(config());
            syncBranch(config());
            setFocusKey("subcat:"+sName);
            if(window.__sxFocusNode)window.__sxFocusNode(sName, "");
          }else{
            if(bSel)bSel.value="";
            if(sSel)sSel.value="";
            syncBranch(config());
            syncSubcatAngle(config());
            clearSelectionUI();
          }
        });
      }
      var targetNodeBtn=document.getElementById("layoutTargetNodeBtn");
      var targetNodeMenu=document.getElementById("layoutTargetNodeMenu");
      if(targetNodeBtn&&targetNodeMenu&&!targetNodeBtn.dataset.bound){
        targetNodeBtn.dataset.bound="1";
        targetNodeBtn.addEventListener("click",function(){
          if(targetNodeMenu.hidden){
            openLeMenu(targetNodeBtn,targetNodeMenu,function(){
              closeBranchOrderMenu();
              closeCollisionMenu();
              closeSolverModeMenu();
            });
          }else{
            closeTargetNodeMenu();
          }
        });
        document.addEventListener("pointerdown",function(event){
          if(!targetNodeMenu.hidden&&!targetNodeMenu.contains(event.target)&&event.target!==targetNodeBtn&&!targetNodeBtn.contains(event.target)){
            closeTargetNodeMenu();
          }
        });
        document.addEventListener("keydown",function(event){
          if(event.key==="Escape"&&!targetNodeMenu.hidden){
            closeTargetNodeMenu();
            targetNodeBtn.focus();
          }
        });
      }
      var nodeLen=document.getElementById("layoutNodeLen");
      if(nodeLen&&!nodeLen.dataset.bound){
        nodeLen.dataset.bound="1";
        nodeLen.addEventListener("input",function(){
          var tnVal=document.getElementById("layoutTargetNode")?document.getElementById("layoutTargetNode").value:"";
          if(tnVal.indexOf("branch:")===0){
            var bLen=document.getElementById("layoutBranchLen");
            if(bLen){bLen.value=this.value;applyBranchLen();}
          }else if(tnVal.indexOf("subcat:")===0){
            var sLen=document.getElementById("layoutSubcatLen");
            if(sLen){sLen.value=this.value;applySubcatLen();}
          }
        });
      }
      var nodeSpoke=document.getElementById("layoutNodeSpokeAutoShrink");
      if(nodeSpoke&&!nodeSpoke.dataset.bound){
        nodeSpoke.dataset.bound="1";
        nodeSpoke.addEventListener("change",function(){
          var tnVal=document.getElementById("layoutTargetNode")?document.getElementById("layoutTargetNode").value:"";
          if(tnVal.indexOf("branch:")===0){
            var bSp=document.getElementById("layoutBranchSpokeAutoShrink");
            if(bSp){bSp.checked=this.checked;bSp.dispatchEvent(new Event("change"));}
          }else if(tnVal.indexOf("subcat:")===0){
            var sSp=document.getElementById("layoutSubcatSpokeAutoShrink");
            if(sSp){sSp.checked=this.checked;sSp.dispatchEvent(new Event("change"));}
          }
        });
      }
      var nodeFactor=document.getElementById("layoutNodeShrinkFactor");
      if(nodeFactor&&!nodeFactor.dataset.bound){
        nodeFactor.dataset.bound="1";
        nodeFactor.addEventListener("input",function(){
          var tnVal=document.getElementById("layoutTargetNode")?document.getElementById("layoutTargetNode").value:"";
          if(tnVal.indexOf("branch:")===0){
            var bFac=document.getElementById("layoutAutoShrinkFactor");
            if(bFac){bFac.value=this.value;bFac.dispatchEvent(new Event("input"));bFac.dispatchEvent(new Event("change"));}
          }else if(tnVal.indexOf("subcat:")===0){
            var sFac=document.getElementById("layoutSubcatCloudShrinkFactor");
            if(sFac){sFac.value=this.value;sFac.dispatchEvent(new Event("input"));sFac.dispatchEvent(new Event("change"));}
          }
        });
      }
    }
    function syncSubcatAngle(c){var select=document.getElementById("layoutSubcat"),name=select.value,lentry=name&&c.subcatOverrides?c.subcatOverrides[name]:null,slen=document.getElementById("layoutSubcatLen");slen.disabled=!name;var curSubLen=(lentry&&Number(lentry.length))||bakedSubBase(name,"length");if(slen!==document.activeElement)slen.value=String(relClamp(curSubLen/bakedSubBase(name,"length")));document.getElementById("layoutSubcatLenValue").textContent=fmtLen(curSubLen);var entry=name&&c.subcatAngleOffsets?c.subcatAngleOffsets[name]:null,ang=document.getElementById("layoutSubcatAngle");ang.disabled=!name;if(ang!==document.activeElement)ang.value=String(entry&&Number(entry.angle)||0);document.getElementById("layoutSubcatAngleValue").textContent=Number(ang.value).toFixed(1)+"°";/* AUTOFIT (Group 3d, Q2): the sub-group kink-lines checkbox is removed — its function is covered by the Autofit button, which runs the selected sub-group's owning branch. */var subcatSpoke=document.getElementById("layoutSubcatSpokeAutoShrink");subcatSpoke.disabled=!name;subcatSpoke.checked=!!(c.subcatSpokeAutoShrink&&c.subcatSpokeAutoShrink[name]===true);var armHint=document.getElementById("layoutSubcatShrinkHint");if(armHint)armHint.hidden=!!name;syncTargetNode(c)}
    function sync(){var c=config();populateBranches();populateKinks();populateSubcats();populateTargetNodes();bindTargetNode();syncSubcatAngle(c);["stagger","expandAll","crossmin","nudge","showRelations","propFan","subcatOrder","staggerDensity","repulsionEnabled","staticMap","animations","mapSliders"].forEach(function(key){var el=document.getElementById(ids[key]);if(el)el.checked=c[key]===undefined?false:Boolean(c[key])});if(c.collision&&c.collision!=="off")lastCollision=c.collision;document.getElementById(ids.collisionEnabled).checked=c.collision!=="off";/* LR-G5: no hidden collision select to write — the aria-pressed group write that follows IS the mode state now */document.querySelectorAll("[data-collision-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.collisionMode===(c.collision||"grow")))});syncCollisionAnchor();setSolverMode(c.solverMidline);["subLen","pad","repulsion"].forEach(function(key){var input=document.getElementById(ids[key]),value=Number(c[key]);if(input!==document.activeElement)input.value=String(value);document.getElementById(ids[key]+"Value").textContent=value.toFixed(1)+"×"});var spokeInput=document.getElementById(ids.spokeLen),spokeAbs=Number(c.spokeLen);if(!Number.isFinite(spokeAbs)||spokeAbs<=0)spokeAbs=bakedSpokeBase();if(spokeInput!==document.activeElement)spokeInput.value=String(relClamp(spokeAbs/bakedSpokeBase()));document.getElementById(ids.spokeLen+"Value").textContent=fmtLen(spokeAbs);var fontScaleInput=document.getElementById(ids.fontScale),fontScaleValue=Number(c.fontScale);if(fontScaleInput!==document.activeElement)fontScaleInput.value=String(Number.isFinite(fontScaleValue)?fontScaleValue:1);var fontScaleNumSync=document.getElementById("layoutFontScaleNum");if(fontScaleNumSync&&document.activeElement!==fontScaleNumSync)fontScaleNumSync.value=String(Number.isFinite(fontScaleValue)?fontScaleValue:1);document.getElementById(ids.fontScale+"Value").textContent=(Number.isFinite(fontScaleValue)?fontScaleValue:1).toFixed(2)+"×";var centerRingScaleInput=document.getElementById(ids.centerRingScale),centerRingScaleValue=Number(c.centerRingScale);if(centerRingScaleInput!==document.activeElement)centerRingScaleInput.value=String(Number.isFinite(centerRingScaleValue)?centerRingScaleValue:1);var centerRingScaleNumSync=document.getElementById("layoutCenterRingScaleNum");if(centerRingScaleNumSync&&document.activeElement!==centerRingScaleNumSync)centerRingScaleNumSync.value=String(Number.isFinite(centerRingScaleValue)?centerRingScaleValue:1);document.getElementById(ids.centerRingScale+"Value").textContent=(Number.isFinite(centerRingScaleValue)?centerRingScaleValue:1).toFixed(2)+"×";var leafOvergrowthInput=document.getElementById(ids.leafOvergrowth),leafOvergrowthValue=Number(c.leafOvergrowth);if(!Number.isFinite(leafOvergrowthValue)||leafOvergrowthValue<=0)leafOvergrowthValue=100;if(leafOvergrowthInput&&leafOvergrowthInput!==document.activeElement)leafOvergrowthInput.value=String(leafOvergrowthValue);var leafOvergrowthNumSync=document.getElementById("layoutLeafOvergrowthNum");if(leafOvergrowthNumSync&&document.activeElement!==leafOvergrowthNumSync)leafOvergrowthNumSync.value=String(leafOvergrowthValue);var leafOvergrowthOut=document.getElementById(ids.leafOvergrowth+"Value");if(leafOvergrowthOut)leafOvergrowthOut.textContent=String(Math.round(leafOvergrowthValue))+"%";["autoShrinkFactor","subcatCloudShrinkFactor"].forEach(function(key){var input=document.getElementById(ids[key]),value=Number(c[key]);if(!Number.isFinite(value)||value<=0||value>1)value=.76;if(input&&input!==document.activeElement)input.value=String(value);var out=document.getElementById(ids[key]+"Value");if(out)out.textContent=value.toFixed(2)+"×"});var syncSpacingName=spacingNameFor(spacingValuesOf(c));document.querySelectorAll("[data-layout-spacing]").forEach(function(input){input.checked=input.dataset.layoutSpacing===syncSpacingName});/* LR-G5: the rating used to be read from the hidden mirror button's textContent; it is now read from the checked layoutRating radio itself (same value domain) */var ratingChecked=document.querySelector("[data-layout-rating]:checked"),rating=(ratingChecked&&(ratingChecked.dataset.layoutRating==="rated"||ratingChecked.dataset.layoutRating==="unrated"||ratingChecked.dataset.layoutRating==="all"))?ratingChecked.dataset.layoutRating:"all";document.querySelectorAll("[data-layout-rating]").forEach(function(input){input.checked=input.dataset.layoutRating===rating});document.querySelectorAll("[data-branch-order]").forEach(function(btn){btn.setAttribute("aria-pressed",String(btn.dataset.branchOrder===(c.branchOrder||"landscape-antipodal")))});syncBranchOrderAnchor();document.querySelectorAll(".le-ms-radio").forEach(function(box){Array.prototype.forEach.call(box.querySelectorAll(".le-ms-opt"),function(l){var i=l.querySelector("input");l.classList.toggle("is-current",!!(i&&i.checked))})});document.documentElement.classList.toggle("le-anim-off",!c.animations);syncBranch(c);syncKink(c);syncSpokeAngles(c)}
    function branchOrderSelection(){var pressed=document.querySelector("[data-branch-order][aria-pressed='true']");return pressed?pressed.dataset.branchOrder:(config().branchOrder||"landscape-antipodal")}
    /* LR-G5: collision mode state used to live in a hidden select (former id layoutCollisionMode); it now lives in the visible #layoutCollisionMs button group — the pressed button is the mode. collisionModeValue reads it, setCollisionMode presses a mode, and applyCollisionMode carries the former select change handler's effects verbatim (lastCollision bookkeeping, master-switch sync, apply path). */
    function collisionModeValue(){var b=document.querySelector("[data-collision-mode][aria-pressed='true']");return b?b.dataset.collisionMode:"grow"}
    function setCollisionMode(v){document.querySelectorAll("[data-collision-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.collisionMode===v))})}
    function applyCollisionMode(v){if(v!=="off")lastCollision=v;document.getElementById(ids.collisionEnabled).checked=v!=="off";apply(collect())}
    /* Solver-mode toggle: mirrors the collision pair above. The mode state lives in the live layout model (collect() carries it from config()); setSolverMode presses one option and updates the button label. Hash-only modes (shadow, off, anything not settle/full/legacy/repulsion) show their raw name with a "(hash only)" marker and nothing pressed, so the control never lies about a mode it cannot set. */
    function setSolverMode(v){var norm=v==="repulsion"?"repulsion":(v==="settle"||v==="full"||v==="legacy")?"settle":null;document.querySelectorAll("[data-solver-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(norm!==null&&b.dataset.solverMode===norm))});var cur=document.getElementById("layoutSolverModeCurrent");if(!cur)return;if(norm){var opt=document.querySelector("[data-solver-mode='"+norm+"']");cur.textContent=opt?opt.textContent:norm}else cur.textContent=String(v==null?"":v)+" (hash only)"}
    function writeSolverModeHash(v){try{var hash=window.location.hash||"",body=hash.charAt(0)==="#"?hash.slice(1):hash,tokens=body?body.split("&"):[],found=false;tokens=tokens.map(function(t){if(t.indexOf("layout-solverMidline=")===0){found=true;return "layout-solverMidline="+v}return t});if(!found)tokens.push("layout-solverMidline="+v);history.replaceState(null,"","#"+tokens.join("&"))}catch (error) { __sxErrLog("layout-solver-mode-hash", error); }}
    function applySolverMode(v){var next=collect();next.solverMidline=v;apply(next);writeSolverModeHash(v)}
    function collect(){var c=config(),enabled=document.getElementById(ids.collisionEnabled).checked,mode=collisionModeValue();return{spacing:spacingNameFor({spokeLen:(Number(document.getElementById(ids.spokeLen).value)||1)*bakedSpokeBase(),subLen:Number(document.getElementById(ids.subLen).value),pad:Number(document.getElementById(ids.pad).value),repulsion:Number(document.getElementById(ids.repulsion).value)}),branchOrder:branchOrderSelection(),propFan:document.getElementById(ids.propFan).checked,subcatOrder:document.getElementById(ids.subcatOrder).checked,staggerDensity:document.getElementById(ids.staggerDensity).checked,stagger:document.getElementById(ids.stagger).checked,expandAll:document.getElementById(ids.expandAll).checked,crossmin:document.getElementById(ids.crossmin).checked,nudge:document.getElementById(ids.nudge).checked,showRelations:document.getElementById(ids.showRelations).checked,repulsionEnabled:document.getElementById(ids.repulsionEnabled).checked,staticMap:document.getElementById(ids.staticMap).checked,animations:document.getElementById(ids.animations).checked,mapSliders:Boolean(document.getElementById(ids.mapSliders)&&document.getElementById(ids.mapSliders).checked),collision:enabled?(mode==="off"?lastCollision:mode):"off",spokeLen:(Number(document.getElementById(ids.spokeLen).value)||1)*bakedSpokeBase(),subLen:Number(document.getElementById(ids.subLen).value),pad:Number(document.getElementById(ids.pad).value),repulsion:Number(document.getElementById(ids.repulsion).value),fontScale:Number(document.getElementById(ids.fontScale).value),centerRingScale:Number(document.getElementById(ids.centerRingScale).value),leafOvergrowth:Number(document.getElementById(ids.leafOvergrowth).value),autoShrinkFactor:Number(document.getElementById(ids.autoShrinkFactor).value),subcatCloudShrinkFactor:Number(document.getElementById(ids.subcatCloudShrinkFactor).value),branchOverrides:copyOverrides(c.branchOverrides),subcatOverrides:copyOverrides(c.subcatOverrides||{}),kinkOverrides:copyOverrides(c.kinkOverrides||{}),subcatAngleOffsets:copyOverrides(c.subcatAngleOffsets||{}),kinkAngleOffsets:copyOverrides(c.kinkAngleOffsets||{}),branchSpokeAutoShrink:Object.assign({},c.branchSpokeAutoShrink||{}),subcatSpokeAutoShrink:Object.assign({},c.subcatSpokeAutoShrink||{}),solverMidline:c.solverMidline||(window.__SEXCAPADES_LAYOUT&&window.__SEXCAPADES_LAYOUT.solverMidline)||"off"}}
    // Cross-tab live sync (Build 2026-10-19_1742): every change made in
    // this editor is written (debounced, ~300ms) to localStorage, where
    // other open tabs/windows pick it up via the storage event and
    // update their map live — tune here in one window while the full
    // map follows along in another. The reset path mutes the writer so
    // restoring defaults never broadcasts as a live change.
    var liveSyncTimer=null,liveSyncMuted=false;
    function scheduleLiveSync(){if(liveSyncMuted)return;if(liveSyncTimer)clearTimeout(liveSyncTimer);liveSyncTimer=setTimeout(function(){liveSyncTimer=null;try{window.localStorage&&window.localStorage.setItem("sexcapades-layout-liveSettings",JSON.stringify({build:(document.querySelector('meta[name="sexcapades-build"]') || {}).content || "",exportedAt:new Date().toISOString(),settings:collect(),editor:collectEditorState()}))}catch (error) { __sxErrLog("layout-live-sync", error); }},300)}
    // Editor chrome/metric state (Batch C, Build 2026-10-20_0023): the
    // metric overlay toggle, the metric dropdown selection, the
    // power-user toggle and the fullscreen state ride in the same
    // live-sync payload as the geometry keys, on the same ~300ms
    // debounce, so a change in either window reaches the other.
    // applyEditorState replays a received state into this window's
    // controls: programmatic .checked/.value sets fire no change
    // events, and editorSyncGuard stops setLayoutFullscreen from
    // re-broadcasting a state it just received — no echo loop. Reset
    // to defaults stays muted via liveSyncMuted exactly as before.
    var editorSyncGuard=false;
    function collectEditorState(){var pT=document.getElementById("layoutPowerUser");return{metricOverlayOn:Boolean(metricOverlayOn&&metricId!=="off"),metricId:typeof metricId==="string"?metricId:"off",powerUser:pT?!!pT.checked:panel.classList.contains("le-power"),fullscreen:panel.classList.contains("layout-fullscreen"),customSpacing:customSpacing?spacingValuesOf(customSpacing):null,armScope:(typeof lrG3CollectArmScope==="function"?lrG3CollectArmScope():null)}}
    function applyEditorState(st){if(!st||typeof st!=="object")return;editorSyncGuard=true;try{
      if(typeof st.metricId==="string"&&(st.metricId==="off"||LayoutMetrics.get(st.metricId))){metricId=st.metricId;metricOn=metricId!=="off";if(metricSelect)metricSelect.value=metricId;if(metricButton)metricButton.disabled=!metricOn;stopMetricBusy();clearMetricGlobal();if(metricOn)scheduleMetric();else{metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay()}}
      if(typeof st.metricOverlayOn==="boolean"){metricOverlayOn=Boolean(st.metricOverlayOn&&metricId!=="off");if(metricOverlayToggle)metricOverlayToggle.checked=metricOverlayOn;if(metricOverlayOn){renderMetricOverlayCache();if(metricOn&&metricId!=="off")scheduleMetric()}else clearMetricOverlay()}
      if(st.customSpacing&&typeof st.customSpacing==="object"){var csv=spacingValuesOf(st.customSpacing);if(csv)customSpacing=csv}
      if(typeof st.powerUser==="boolean"){var pT=document.getElementById("layoutPowerUser");if(pT)pT.checked=st.powerUser;panel.classList.toggle("le-power",st.powerUser);panel.querySelectorAll(".le-adv").forEach(function(d){d.open=st.powerUser})}
      if(st.armScope&&typeof lrG3ApplyArmScope==="function")lrG3ApplyArmScope(st.armScope);
      if(typeof st.fullscreen==="boolean")setLayoutFullscreen(st.fullscreen);
    }catch(error){__sxErrLog("layout-editor-sync",error)}editorSyncGuard=false}
    // No-op apply short-circuit (Group 4, G4-2): a layout apply whose
    // settings are identical to the current ones still paid for a
    // full bundle re-solve + repaint — the ~12.9s main-thread block
    // measured for a no-op apply on build 0459. The comparison uses a
    // stable stringify (object keys sorted at every level) over the
    // exact key set collect() produces and config() reports, so
    // override-map key order cannot cause false misses. Identical
    // settings skip only the bundle apply; the font/ring side
    // effects, the editor sync, and every scheduler still run, so
    // nothing observable changes. Any doubt (exception, shape drift)
    // falls back to the full apply.
    function stableSettingsString(value){if(value===null||typeof value!=="object")return JSON.stringify(value);if(Array.isArray(value))return "["+value.map(stableSettingsString).join(",")+"]";return "{"+Object.keys(value).sort().map(function(k){return JSON.stringify(k)+":"+stableSettingsString(value[k])}).join(",")+"}"}
    // Scoped routing (Stage 3, T5): apply() takes an optional
    // scope as its third argument. The eleven per-branch /
    // per-subcategory / per-topic handlers pass one (see
    // scopedScope, defined just above those handlers); every other caller
    // passes none and takes exactly the path this function has
    // always taken. With a scope, the bundle commit goes through
    // API.applyScoped instead of API.apply — the no-op
    // short-circuit above still runs first, so an unchanged
    // commit performs no solve at all, and the font/ring side
    // effects, sync(), and every scheduler below (scores,
    // metric, cross-window live sync) run identically either
    // way. If the bundle has no applyScoped, the commit falls
    // back to the ordinary API.apply.
    // BOOTLOAD-FIX (Q6): Reset busy bookkeeping. The Reset handler names
    // its button here just before calling apply; apply consumes the
    // reference, paints .is-busy when it arms a progress session, and
    // the session completion callback clears it. Other applies name
    // no button; they arm the map stopwatch alone.
    // TIMING CHAIN (F6, layout-editor refactor - documentation
    // only; every name and value below verified against this code):
    //
    //   actuator (lrActuate, or a panel control)
    //     -> apply(next, msg, scope) ......... the central apply
    //          No-op short-circuit: when stableSettingsString(next)
    //          equals stableSettingsString(config()), the bundle
    //          commit is skipped; font/ring side effects, sync()
    //          and every scheduler below still run.
    //          Chunked commit: when a load session is armed via
    //          __sxLoadSessionStart (progress checkpoints), the
    //          commit goes through API.applyChunked(next, scope)
    //          and postApply runs when it resolves; otherwise
    //          API.apply / API.applyScoped runs it synchronously.
    //          postApply(): side effects, sync(), scheduleScores(),
    //          scheduleMetric(), scheduleLiveSync()
    //     -> scheduleMetric() ................ 500 ms debounce
    //          (metricTimer; each new call clearTimeout()s the
    //          pending one, cancelling the older measure)
    //     -> measureLocals() ................. runs ONLY the picked
    //          metric's clouds() walk; stamps run = ++metricRun
    //     -> renderMetricOverlay(clouds) ..... MetricNumbersView.render
    //     -> positionMetricOverlay() ......... MetricNumbersView.position
    //          scheduleOverlayPosition() defers re-positioning to
    //          the next animation frame (MetricNumbersView.raf guard)
    //
    //   Settle path (an Anneal run handing back):
    //     noteSettlePending() arms settleArmDeadline = now + 3000 ms
    //     and starts settleTick on a 400 ms interval -> settleTick()
    //     polls blitSessionActive() (the driver log's blit-session
    //     start/end entries, read through api.anneal) -> when the
    //     session lands, onSettleLanded() calls scheduleMetric()
    //     and re-reads the cloud fresh via dk.measureCloud for the
    //     receipt -> stopSettleWatch() clears the interval.
    //
    //   Slider input: coalesceSlider() coalesces input events to
    //   one handler call per animation frame; a change event cancels
    //   the pending frame and runs the handler immediately.
    //
    //   WHO CANCELS WHOM
    //     - measureLocals' cancelled() guard: a run whose stamp no
    //       longer equals metricRun - or metrics switched off, or
    //       the picker changed - drops its result. Last writer wins.
    //     - metricGlobalRun does the same for Calculate-now runs.
    //     - settleTick stops the settle watch when the blit session
    //       lands, or when now passes settleArmDeadline (3000 ms)
    //       with no landing; a stale dkReceipt is marked not-fresh.
    //     - A pending measureLocals is cancelled by any newer
    //       settings change, via scheduleMetric's clearTimeout.
    var applyBusyBtn=null;
    function apply(next,msg,scope){var btnForApply=applyBusyBtn;applyBusyBtn=null;var skipBundleApply=false;if(next&&window.__SEXCAPADES_LAYOUT_API){try{skipBundleApply=stableSettingsString(next)===stableSettingsString(config())}catch (e) { __sxErrLog("layout-apply-compare", e); }}var mutedAtCall=liveSyncMuted;var chunkArmed=false;/* #9: arm the paintbrush pill for this apply, wired EXPLICITLY to the button this caller named via applyBusyBtn (btnForApply) — never assumed populated. The pill finishes on the SAME signal that clears the button today: the overlay session's onDone on the armed path (so it spans the settle tail through the map-complete gate), or runApply()'s return on the unarmed synchronous path. */var pillToken=null;if(!skipBundleApply&&next&&window.__SEXCAPADES_LAYOUT_API&&typeof window.__sxPillSessionStart==="function"){try{pillToken=window.__sxPillSessionStart({button:btnForApply||null})}catch(e){__sxErrLog("layout-apply-pill-arm",e)}}function pillDone(){if(!pillToken)return;var t=pillToken;pillToken=null;try{window.__sxPillSessionFinish(t)}catch(e){__sxErrLog("layout-apply-pill-finish",e)}}function runApply(){var prevMute=liveSyncMuted;liveSyncMuted=mutedAtCall;function postApply(){if(window.__sxSyncMapFontBase)window.__sxSyncMapFontBase();var ecr=document.querySelector(".empty-center-ring");if(ecr)ecr.setAttribute("r",String(133*(Number(next&&next.centerRingScale)||1)));sync();scheduleScores();scheduleMetric();scheduleLiveSync();liveSyncMuted=prevMute;}if(!skipBundleApply){var layoutApi=window.__SEXCAPADES_LAYOUT_API;if(layoutApi){if(chunkArmed&&layoutApi.applyChunked){layoutApi.applyChunked(next,scope).then(postApply,function(e){__sxErrLog("layout-apply-chunked",e);postApply();});return;}if(scope&&layoutApi.applyScoped)layoutApi.applyScoped(next,scope);else layoutApi.apply(next)}else Object.assign(window.__SEXCAPADES_LAYOUT,next)}postApply();}if(!skipBundleApply&&window.__SEXCAPADES_LAYOUT_API&&typeof window.__sxLoadSessionStart==="function"){var armed=false;try{armed=window.__sxLoadSessionStart({msg:(typeof msg==="string"&&msg)?msg:null,onDone:function(){pillDone();if(btnForApply){btnForApply.classList.remove("is-busy");btnForApply.removeAttribute("aria-busy");}}})}catch(e){__sxErrLog("layout-apply-arm",e)}if(armed){chunkArmed=true;if(btnForApply){btnForApply.classList.add("is-busy");btnForApply.setAttribute("aria-busy","true")}if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(runApply,0)})});else setTimeout(runApply,0);return;}}runApply();pillDone();}
    // Selectable layout metric framework. window.LayoutMetrics is a registry:
    // adding a future metric = LayoutMetrics.register('id',{label,tooltip,compute}).
    // compute(ctx, done, isCancelled): ctx={svg}; done({value,text}) when finished.
    // Heavy metrics MUST chunk via requestIdleCallback and check isCancelled() between chunks.
    // SOLVER-METRICS REFACTOR (F7): MEASUREMENT SUBSTRATES. Every
    // registry entry (and its defs.*.clouds walk) names its substrate:
    // "as rendered" reads the LIVE DRAWING (DOM/SVG geometry) and is
    // only meaningful after a paint; "as last solved" reads the
    // bundle's delivered-geometry registry (dkLastBranches, via
    // window.__sxCrossingMeasure) and reflects the last solve whether
    // or not it has painted. The two can disagree mid-interaction.
    // They are deliberately NOT converged: the drawing metrics need
    // the drawing itself, and the crossing number must not take a
    // repaint dependency — so the substrate is documented per entry
    // instead, on the line above each register() call.
    var LayoutMetrics={defs:{},order:[],register:function(id,def){if(!id||!def||typeof def.compute!=='function')return;def.id=id;if(!this.defs[id])this.order.push(id);this.defs[id]=def;},get:function(id){return this.defs[id]||null;},ids:function(){return this.order.slice();}};
    window.LayoutMetrics=LayoutMetrics;
    // F7 substrate: AS RENDERED — live tap-target boxes in the drawing.
    LayoutMetrics.register('z90',{label:'Zoom needed for tappable buttons',tooltip:'How far you would need to zoom in before almost all of the give/receive buttons are big enough to tap comfortably. Lower is better. At the baked defaults (text 120, centre 90) the measured whole-map reading is 12.6×.',compute:function(ctx,done,isCancelled){var els=document.querySelectorAll(z90Selector()),inv=metricWorldFrame(),fitScale=metricFitScale(),needs=[],i=0;function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}function chunk(){if(isCancelled())return;var end=Math.min(els.length,i+120);for(;i<end;i++){var box=metricTagWorldBox(inv,els[i]);if(!box)continue;needs.push(44/(fitScale*Math.min(box.width,box.height)))}if(i<els.length)defer();else{var v=z90Percentile(needs);done({value:v,text:v.toFixed(1)+'×'})}}defer()}});
    // Spoke collision area (xAreaCross), ported from tune-measure-area.js:
    // sum over proper spoke-spoke crossings of salience =
    // min(t,1-t)*lenA * min(u,1-u)*lenB * sin(theta) — 0 at segment
    // endpoints (root/tip nicks vanish), maximal for mid-segment
    // perpendicular crossings of long spokes. Crossings whose two spokes
    // belong to the same top-level branch are excluded: this is the
    // CROSS-branch clutter number. Sub-threshold salience (< 1 px²) is
    // ignored, matching MIN_X_AREA in the headless tool. Metrics
    // rebuild, Edit 2: measured in WORLD coordinates (the world node
    // walk below), so the px² are world px²; endpoint exclusion is
    // structural (segments sharing an endpoint node never pair).
    function topBranchKey(key){
      if(!key)return null;
      var branches=branchNames(),i,b,bs;
      if(key.indexOf("cat-")===0){var slug=key.slice(4);for(i=0;i<branches.length;i++)if(slugify(branches[i])===slug)return branches[i];return null}
      if(key.indexOf("subcategory-")===0){var rest=key.slice(12);for(i=0;i<branches.length;i++){bs=slugify(branches[i]);if(rest===bs||rest.indexOf(bs+"-")===0)return branches[i]}return null}
      var entry=topicEntry(key);
      if(entry&&entry.category)return entry.category;
      if(key.indexOf("topic-")===0){var trest=key.slice(6);for(i=0;i<branches.length;i++){bs=slugify(branches[i]);if(trest.indexOf(bs+"-")===0)return branches[i]}}
      return null;
    }
    function segMetrics(ax1,ay1,ax2,ay2,bx1,by1,bx2,by2){
      var dxA=ax2-ax1,dyA=ay2-ay1,dxB=bx2-bx1,dyB=by2-by1;
      var lenA=Math.hypot(dxA,dyA),lenB=Math.hypot(dxB,dyB);
      if(lenA<1e-9||lenB<1e-9)return null;
      var d=dxA*dyB-dyA*dxB;
      if(Math.abs(d)<1e-9*lenA*lenB)return null;
      var t=((bx1-ax1)*dyB-(by1-ay1)*dxB)/d;
      var u=((bx1-ax1)*dyA-(by1-ay1)*dxA)/d;
      return{t:t,u:u,lenA:lenA,lenB:lenB,sinTheta:Math.abs(d)/(lenA*lenB)};
    }
    // RESTORED (2026-10-29): the xAreaCross area metric registration is
    // live again per Jason's ruling reversing the dropdown part of #4.
    // Observation only — nothing is decided on this metric; every gate
    // still runs on the crossing number. The graze term inside E is a
    // separate, decision-side use of area and stays untouched.
    // F7 substrate: AS RENDERED — live line geometry in the drawing.
    LayoutMetrics.register('xareacross',{label:'Area where lines cross',tooltip:'Total area covered by lines from different branches crossing over each other. Lower looks cleaner.',compute:function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({value:0,text:"0 px²"});return}
      var np=metricNodePositionsWorld(svg),segs=cloudSegs(np);
      var sum=0,i=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(segs.length,i+16);
        for(;i<end;i++){
          var s=segs[i];
          for(var j=i+1;j<segs.length;j++){
            var t=segs[j];
            if(metricSegsShareNode(s,t))continue;
            var mm=segMetrics(s.a.x,s.a.y,s.b.x,s.b.y,t.a.x,t.a.y,t.b.x,t.b.y);
            if(!mm||mm.t<=0||mm.t>=1||mm.u<=0||mm.u>=1)continue;
            var sal=Math.min(mm.t,1-mm.t)*mm.lenA*Math.min(mm.u,1-mm.u)*mm.lenB*mm.sinTheta;
            if(sal<1)continue;
            if(s.branch!=null&&s.branch===t.branch)continue;
            sum+=sal;
          }
        }
        if(i<segs.length)defer();
        else done({value:sum,text:String(Math.round(sum)).replace(/\B(?=(\d{3})+(?!\d))/g,",")+" px²"});
      }
      defer();
    }});
    // Shared node-position walk for the three metrics added in Build
    // 2026-10-19_1152 (same geometry source as updateScores / xareacross):
    // visible node-group icons in screen space, plus the map center
    // resolved through the layer CTM with a category-centroid fallback.
    function metricNodePositions(svg){return MetricGeometry.nodePositions(svg,false)}
    // World-frame twin of metricNodePositions (Metrics rebuild,
    // Edit 2): the same node enumeration — visible node-group icons,
    // with NO screen-size gate: a node is included whenever its icon
    // element exists — but every position is the icon rect center
    // converted to WORLD coordinates through the inverse layer CTM
    // captured once per call (metricWorldFrame / metricWorldPoint),
    // and the center is the layer-space center itself, exactly
    // {x:900, y:620}. If the CTM is unavailable the positions fall
    // back to the raw icon centers and the center to the category
    // centroid of those positions. metricNodePositions itself stays
    // in screen space: metricCloudCenters' overlay anchors use it.
    function metricNodePositionsWorld(svg){return MetricGeometry.nodePositions(svg,true)}
    function metricSegs(np){
      var segs=[];
      np.keys.forEach(function(k){var pk=parentKeyFor(k),a=pk?np.pos[pk]:(k.indexOf("cat-")===0?np.center:null);if(a&&np.pos[k])segs.push({key:k,parent:pk||null,a:a,b:np.pos[k]})});
      return segs;
    }
    // Structural endpoint sharing between two metric segments: they
    // share an endpoint NODE when their child keys are equal, when
    // one's child key is the other's parent key, or when their
    // parent keys are equal (two null parents are both the world
    // center, so category segments share it). Replaces the old
    // 0.6px same-point epsilon tests in the world-frame metrics.
    function metricSegsShareNode(s,t){return s.key===t.key||s.key===t.parent||t.key===s.parent||s.parent===t.parent}
    // Actual rendered stroke width, in layer/user units, of the
    // spoke drawn for a segment's child key (Metrics rebuild,
    // Edit 2): the child node-group's .topic-stem — the path whose
    // geometry the renderer maintains as exactly this segment, and
    // the element the app itself flags as the spoke — falling back
    // to the .hanky-midline carried by the child's spoke underlay
    // item (or by the group itself when the underlay move did not
    // run). The width is the element's stroke-width VALUE in user
    // units (the stroke-width attribute first, then the computed
    // style) — never a screen-px measurement. 0 when no stroked
    // spoke element is found for the key.
    function metricSpokeWidth(svg,key){
      if(!svg||!key)return 0;
      var el=null,g=svg.querySelector('.node-group[data-layout-key="'+key+'"]');
      if(g)el=g.querySelector(":scope > .topic-stem");
      if(!el){
        var u=svg.querySelector('.spoke-underlay-item[data-spoke-for="'+key+'"]');
        var host=u||g;
        if(host)el=host.querySelector(".hanky-midline");
      }
      if(!el)return 0;
      var w=parseFloat(el.getAttribute("stroke-width"));
      if(!(w>0)){try{w=parseFloat(window.getComputedStyle(el).strokeWidth)}catch(e){w=0}}
      return w>0?w:0;
    }
    function metricPxText(v){return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,",")+" px²"}
    // Length of the part of segment a-b that lies inside rect r
    // (Liang–Barsky parametric clip), in screen pixels.
    function segLenInRect(ax,ay,bx,by,r){
      var dx=bx-ax,dy=by-ay,t0=0,t1=1,i,t;
      var p=[-dx,dx,-dy,dy],q=[ax-r.left,r.right-ax,ay-r.top,r.bottom-ay];
      for(i=0;i<4;i++){
        if(Math.abs(p[i])<1e-9){if(q[i]<0)return 0;continue}
        t=q[i]/p[i];
        if(p[i]<0){if(t>t1)return 0;if(t>t0)t0=t}else{if(t<t0)return 0;if(t<t1)t1=t}
      }
      return t1>t0?(t1-t0)*Math.hypot(dx,dy):0;
    }
    // Label crowding area (Metrics rebuild, Edit 2 — measured in
    // WORLD coordinates): total label-label overlap area (rect-rect
    // intersection of world boxes, pair terms under 0.5 world px²
    // discarded) plus label-spoke overlap (length of spoke inside a
    // label's world box, times that spoke's ACTUAL rendered stroke
    // width in world units; terms under 0.5 world px² discarded).
    // Labels are ALL rendered labels whose id is a visible node key
    // from the world walk — no screen-size admission gate. A label's
    // own spoke (segment child key === label id) is excluded.
    // Chunked over labels via requestIdleCallback.
    // RESTORED (2026-10-29): the labelcrowd registration is live again
    // per Jason's ruling reversing the dropdown part of #4.
    // Observation only — nothing decided on it.
    // F7 substrate: AS RENDERED — live label boxes in the drawing.
    LayoutMetrics.register('labelcrowd',{label:'Crowded labels area',tooltip:'Total area where labels overlap each other or sit on top of lines. Lower is easier to read.',compute:function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({value:0,text:"0 px²"});return}
      var np=metricNodePositionsWorld(svg),segs=metricSegs(np);
      segs.forEach(function(sg){sg.w=metricSpokeWidth(svg,sg.key)});
      var visibleKeys={};np.keys.forEach(function(k){visibleKeys[k]=true});
      var inv=metricWorldFrame(),labels=[],seenLabel={};
      Array.prototype.forEach.call(svg.querySelectorAll(".category-label,.map-label"),function(el){
        var id=el.getAttribute("data-id")||el.getAttribute("data-topic-id");
        if(!id||!visibleKeys[id]||seenLabel[id])return;
        var box=metricWorldBox(inv,el.getBoundingClientRect());if(!box)return;
        seenLabel[id]=true;labels.push({id:id,rect:box});
      });
      var sum=0,li=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(labels.length,li+20),i,j;
        for(i=li;i<end;i++){
          var ra=labels[i].rect;
          for(j=i+1;j<labels.length;j++){
            var rb=labels[j].rect;
            var iw=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
            var ih=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
            if(iw>0&&ih>0){var area=iw*ih;if(area>=0.5)sum+=area}
          }
          for(j=0;j<segs.length;j++){
            var sg=segs[j];if(sg.key===labels[i].id)continue;
            var term=segLenInRect(sg.a.x,sg.a.y,sg.b.x,sg.b.y,ra)*sg.w;
            if(term>=0.5)sum+=term;
          }
        }
        li=end;
        if(li<labels.length)defer();
        else done({value:sum,text:metricPxText(sum)});
      }
      defer();
    }});
    // Overlapping buttons (Metrics rebuild, Edit 1): count pairs of
    // direction controls whose VISIBLE tag boxes (.direction-tag-bg)
    // intersect with positive area in world coordinates — touching
    // edges do not count. A topic's own give and receive are designed
    // adjacency and never count: a pair qualifies only when the two
    // controls' topic ids (data-id) differ. Cross-branch pairs count
    // toward this global total. Chunked over rows via
    // requestIdleCallback.
    // F7 substrate: AS RENDERED — live button boxes in the drawing.
    LayoutMetrics.register('slideroverlap',{label:'Overlapping buttons',tooltip:'How many pairs of give/receive buttons are overlapping right now. Lower is better.',compute:function(ctx,done,isCancelled){
      var items=metricDirectionItems(),count=0,row=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(items.length,row+40),i,j;
        for(i=row;i<end;i++)for(j=i+1;j<items.length;j++){
          if(items[i].id!==items[j].id&&metricBoxesOverlap(items[i].box,items[j].box))count++;
        }
        row=end;
        if(row<items.length)defer();
        else done({value:count,text:String(count).replace(/\B(?=(\d{3})+(?!\d))/g,",")+" pairs"});
      }
      defer();
    }});
    // Minimum arc separation (Metrics rebuild, Edit 3 — replaces the
    // old angle-based 'angulargap'; the registry id stays 'angulargap'
    // because persisted editor state stores it): the tightest spacing
    // between two neighbouring give/receive controls on the same ring,
    // measured along the ring in world (map) units. Population: the
    // direction controls from z90Selector(), each positioned at the
    // center of its visible tag box (.direction-tag-bg) in world
    // coordinates (metricDirectionItems). Each control's hub is its
    // topic's PARENT NODE — the subcategory node when the topic sits
    // under a subcategory, else the category node — resolved through
    // parentKeyFor (the same linkage metricSegs uses); if the parent
    // cannot be resolved, fall back to the topic's category node; if
    // that also fails, skip the control. Hub center = the hub node's
    // world icon center from the world node walk. Per hub: order the
    // controls by bearing atan2(dy,dx) around the hub center; for each
    // cyclically adjacent pair, s = r̄ · Δθ with Δθ the wrap-aware
    // bearing difference in (0, 2π) and r̄ the pair's mean distance
    // from the hub center; the hub's value is the minimum s. Hubs
    // with fewer than 2 controls contribute nothing. Shared by the
    // global compute() and the per-branch clouds() below; returns
    // {hubKey: minArcSep} for qualifying hubs only.
    function metricArcHubMins(items,np){
      var byHub={};
      items.forEach(function(it){
        if(!it.id)return;
        var hubKey=parentKeyFor(it.id);
        if(!hubKey||!np.pos[hubKey]){var br=topBranchKey(it.id);hubKey=br?"cat-"+slugify(br):null}
        if(!hubKey||!np.pos[hubKey])return;
        var cx=(it.box.left+it.box.right)/2,cy=(it.box.top+it.box.bottom)/2;
        (byHub[hubKey]=byHub[hubKey]||[]).push({x:cx,y:cy});
      });
      var mins={};
      Object.keys(byHub).forEach(function(hk){
        var pts=byHub[hk];if(pts.length<2)return;
        var hc=np.pos[hk];
        var arr=pts.map(function(p){var dx=p.x-hc.x,dy=p.y-hc.y;return{a:Math.atan2(dy,dx),r:Math.hypot(dx,dy)}});
        arr.sort(function(x,y){return x.a-y.a});
        var best=null;
        for(var i=0;i<arr.length;i++){
          var q=arr[(i+1)%arr.length];
          var dth=(i+1<arr.length)?q.a-arr[i].a:q.a+2*Math.PI-arr[i].a;
          var s=(arr[i].r+q.r)/2*dth;
          if(best===null||s<best)best=s;
        }
        if(best!==null)mins[hk]=best;
      });
      return mins;
    }
    // F7 substrate: AS RENDERED — live button positions in the drawing.
    LayoutMetrics.register('angulargap',{label:'Tightest control spacing',tooltip:'The tightest spacing between two neighbouring give/receive buttons on the same ring, measured along the ring in map units. Bigger means roomier.',compute:function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      var np=svg?metricNodePositionsWorld(svg):{pos:{},keys:[],center:null};
      var items=metricDirectionItems();
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var mins=metricArcHubMins(items,np),best=null;
        Object.keys(mins).forEach(function(hk){if(best===null||mins[hk]<best)best=mins[hk]});
        if(best===null)done({value:0,text:"–"});
        else{var v=Math.round(best*10)/10;done({value:v,text:v.toFixed(1)+" px"})}
      }
      defer();
    }});
    // Per-cloud (local) metric layer (Build 2026-10-19 — header
    // three-layer readout): each metric may define clouds(ctx, done,
    // isCancelled) returning {cloudName:{value,text}} plus agg
    // ('avg'|'sum'|'min') and aggFmt(v). A cloud is one top-level
    // branch's kink cloud. Locals count within-cloud evidence;
    // cross-cloud crossings/pairs split half/half between the two
    // clouds involved, so the aggregate of locals is its own number,
    // distinct from the true global score in the metric's compute().
    function cloudSegs(np){var segs=metricSegs(np);segs.forEach(function(s){s.branch=topBranchKey(s.key)});return segs}
    // Direction controls (the give/receive sliders) are NOT nested in a
    // .node-group — they render in a flat overlay layer — so resolve a
    // slider's cloud from its own data-id (a topic id) first, falling
    // back to an ancestor node-group key when there is one.
    function cloudOfEl(el){var key=el.getAttribute("data-id");if(key)return topBranchKey(key);var g=el.closest?el.closest(".node-group[data-layout-key]"):null;return g?topBranchKey(g.getAttribute("data-layout-key")):null}
    LayoutMetrics.defs.z90.clouds=function(ctx,done,isCancelled){
      var els=document.querySelectorAll(z90Selector()),inv=metricWorldFrame(),fitScale=metricFitScale(),byCloud={},i=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(els.length,i+120);
        for(;i<end;i++){
          var box=metricTagWorldBox(inv,els[i]);if(!box)continue;
          var c=cloudOfEl(els[i]);
          if(!c)continue;
          (byCloud[c]=byCloud[c]||[]).push(44/(fitScale*Math.min(box.width,box.height)));
        }
        if(i<els.length)defer();
        else{var out={};Object.keys(byCloud).forEach(function(c){var v=z90Percentile(byCloud[c].slice());out[c]={value:v,text:v.toFixed(1)+"×"}});done(out)}
      }
      defer();
    };
    // RESTORED (2026-10-29): the per-cloud xAreaCross walk is live again
    // per Jason's ruling reversing the dropdown part of #4. (The cascade
    // report's secondary readout and deknotter.measureCloudArea in the
    // bundle remain retired — #4 stands there.)
    LayoutMetrics.defs.xareacross.clouds=function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({});return}
      var np=metricNodePositionsWorld(svg),segs=cloudSegs(np),tot={};
      branchNames().forEach(function(name){tot[name]=0});
      function add(c,v){if(c)tot[c]=(tot[c]||0)+v}
      var i=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(segs.length,i+16);
        for(;i<end;i++){
          var s=segs[i];
          for(var j=i+1;j<segs.length;j++){
            var t=segs[j];
            if(metricSegsShareNode(s,t))continue;
            var mm=segMetrics(s.a.x,s.a.y,s.b.x,s.b.y,t.a.x,t.a.y,t.b.x,t.b.y);
            if(!mm||mm.t<=0||mm.t>=1||mm.u<=0||mm.u>=1)continue;
            var sal=Math.min(mm.t,1-mm.t)*mm.lenA*Math.min(mm.u,1-mm.u)*mm.lenB*mm.sinTheta;
            if(sal<1)continue;
            if(s.branch!=null&&s.branch===t.branch)continue;
            if(s.branch&&t.branch){add(s.branch,sal/2);add(t.branch,sal/2)}
            else if(s.branch||t.branch)add(s.branch||t.branch,sal);
          }
        }
        if(i<segs.length)defer();
        else{var out={};Object.keys(tot).forEach(function(c){out[c]={value:tot[c],text:metricPxText(tot[c])}});done(out)}
      }
      defer();
    };
    // RESTORED (2026-10-29): the per-cloud label-crowding walk is live
    // again per Jason's ruling reversing the dropdown part of #4.
    LayoutMetrics.defs.labelcrowd.clouds=function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({});return}
      var np=metricNodePositionsWorld(svg),segs=metricSegs(np);
      segs.forEach(function(sg){sg.w=metricSpokeWidth(svg,sg.key)});
      var visibleKeys={};np.keys.forEach(function(k){visibleKeys[k]=true});
      var inv=metricWorldFrame(),labels=[],seenLabel={};
      Array.prototype.forEach.call(svg.querySelectorAll(".category-label,.map-label"),function(el){
        var id=el.getAttribute("data-id")||el.getAttribute("data-topic-id");
        if(!id||!visibleKeys[id]||seenLabel[id])return;
        var box=metricWorldBox(inv,el.getBoundingClientRect());if(!box)return;
        seenLabel[id]=true;labels.push({id:id,cloud:topBranchKey(id),rect:box});
      });
      var tot={};
      branchNames().forEach(function(name){tot[name]=0});
      function add(c,v){if(c)tot[c]=(tot[c]||0)+v}
      var li=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(labels.length,li+20),i,j;
        for(i=li;i<end;i++){
          var ra=labels[i].rect,ca=labels[i].cloud;
          for(j=i+1;j<labels.length;j++){
            var rb=labels[j].rect;
            var iw=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
            var ih=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
            if(iw>0&&ih>0){var area=iw*ih;if(area>=0.5&&ca&&ca===labels[j].cloud)add(ca,area)}
          }
          for(j=0;j<segs.length;j++){
            var sg=segs[j];if(sg.key===labels[i].id)continue;
            var term=segLenInRect(sg.a.x,sg.a.y,sg.b.x,sg.b.y,ra)*sg.w;
            if(term>=0.5)add(ca,term);
          }
        }
        li=end;
        if(li<labels.length)defer();
        else{var out={};Object.keys(tot).forEach(function(c){out[c]={value:tot[c],text:metricPxText(tot[c])}});done(out)}
      }
      defer();
    };
    LayoutMetrics.defs.slideroverlap.clouds=function(ctx,done,isCancelled){
      var items=metricDirectionItems(),tot={},row=0;
      branchNames().forEach(function(name){tot[name]=0});
      items.forEach(function(p){if(p.branch&&tot[p.branch]===undefined)tot[p.branch]=0});
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(items.length,row+40),i,j;
        for(i=row;i<end;i++)for(j=i+1;j<items.length;j++){
          if(items[i].branch&&items[i].branch===items[j].branch&&items[i].id!==items[j].id&&metricBoxesOverlap(items[i].box,items[j].box))tot[items[i].branch]++;
        }
        row=end;
        if(row<items.length)defer();
        else{var out={};Object.keys(tot).forEach(function(c){out[c]={value:tot[c],text:String(tot[c])}});done(out)}
      }
      defer();
    };
    // Per-branch minimum arc separation: the minimum over the
    // branch's hubs (a hub's branch = topBranchKey of the hub's
    // layout key). A branch with no qualifying hub emits nothing.
    LayoutMetrics.defs.angulargap.clouds=function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      var np=svg?metricNodePositionsWorld(svg):{pos:{},keys:[],center:null};
      var items=metricDirectionItems();
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var mins=metricArcHubMins(items,np),out={};
        Object.keys(mins).forEach(function(hk){
          var br=topBranchKey(hk);if(!br)return;
          if(!out[br]||mins[hk]<out[br].value){var v=Math.round(mins[hk]*10)/10;out[br]={value:mins[hk],text:v.toFixed(1)+" px"}}
        });
        done(out);
      }
      defer();
    };
    // Crossing number (Fleet2 Item2): the SCC v2 hybrid energy E from
    // the Stage 1 anneal port — the crossing term (the chord of a
    // foreign midline inside a topic's Spoke Crossing Capsule, in
    // font-size units) plus the graze term (capsule-overlap area over
    // font squared, for pairs 1–2 font sizes apart) plus the
    // inner-intersection count. The geometry and predicates live in
    // the port; this registration only calls the port's read-only
    // readout (window.__sxCrossingMeasure), which builds the current
    // solved state with the port's own sxSccBuild + sxFullEval and
    // aggregates the port's pair maps per cloud: crossing to the
    // victim topic's cloud, graze split half/half, an inner crossing
    // attributed to both participants' clouds — so the per-cloud
    // values sum to the global E plus the inner count. Dropdown
    // placement: directly after z90 — overlap stays first (and the
    // default selection), z90 second, and this newly designated
    // judged metric ranks ahead of the remaining readability counts.
    function crossingText(v){return String(Math.round(v*100)/100)}
    function crossingReadout(){try{return typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null}catch(e){return null}}
    // F7 substrate: AS LAST SOLVED — delivered-geometry registry via window.__sxCrossingMeasure; no drawing read, no repaint dependency.
    LayoutMetrics.register('crossingnumber',{label:'Crossing number',tooltip:'The hybrid crossing number the map is judged by: foreign lines cutting through each topic\u2019s spoke capsule, plus near-miss graze overlap, plus inner line intersections — all on the SCC v2 geometry, in font-size units. Lower is better.',compute:function(ctx,done,isCancelled){
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){if(isCancelled())return;var m=crossingReadout();if(!m){done({value:0,text:"–"});return}done({value:m.E,text:crossingText(m.E)})}
      defer();
    }});
    LayoutMetrics.defs.crossingnumber.clouds=function(ctx,done,isCancelled){
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){if(isCancelled())return;var m=crossingReadout();if(!m){done({});return}var out={};Object.keys(m.clouds).forEach(function(c){out[c]={value:m.clouds[c],text:crossingText(m.clouds[c])}});done(out)}
      defer();
    };
    // World-frame helpers (Metrics rebuild, Edit 1): the rebuilt
    // metrics measure in map (world) coordinates, never raw screen
    // pixels, so a reading cannot depend on the camera at measure
    // time. metricWorldFrame() captures the inverse of #mapLayer's
    // screen CTM ONCE per measurement run (guarded null like
    // metricScreenToWorld below); metricWorldBox() converts a
    // getBoundingClientRect into a world axis-aligned box by pushing
    // its (left,top) and (right,bottom) corners through that inverse
    // with DOMPoint and taking min/max per axis; metricWorldPoint()
    // is the rect-center point version.
    // F4 (layout-editor refactor): ONE geometry helper set,
    // MetricGeometry, is now the shared home of the world-frame
    // helpers. inverseFrame() is the single #mapLayer screen-transform
    // accessor: the inverse of the layer's screen CTM, or null when
    // the layer is absent, has no CTM, or reading it throws — the
    // guarded-null contract metricWorldFrame and metricScreenToWorld
    // each had. screenToWorld() converts one screen point through
    // that same accessor (its former body fetched and inverted the
    // transform itself; the values in every case, nulls included, are
    // the ones it returned). worldBox / worldPoint / tagWorldBox are
    // the rect converters, directionItems() is the direction-control
    // walk, and nodePositions() is the ONE node-position walk,
    // parameterized by coordinate space: world=false reproduces
    // metricNodePositions (screen space, the icon-size gate, the CTM
    // center with the category-centroid fallback); world=true
    // reproduces metricNodePositionsWorld (no size gate, positions
    // converted through the inverse frame captured once per call with
    // a raw-center fallback, and the layer center {x:900, y:620}
    // itself when the frame exists). No coordinate math changed —
    // only its organization. The pre-refactor global names stay
    // callable as the wrappers beneath the module.
    var MetricGeometry={
      inverseFrame:function(){var layer=document.getElementById("mapLayer");try{var m=layer?layer.getScreenCTM():null;if(m)return m.inverse()}catch(e){}return null},
      screenToWorld:function(x,y){var inv=MetricGeometry.inverseFrame();if(!inv)return null;try{return new DOMPoint(x,y).matrixTransform(inv)}catch(e){}return null},
      worldBox:function(inv,rect){if(!inv||!rect)return null;try{var p1=new DOMPoint(rect.left,rect.top).matrixTransform(inv),p2=new DOMPoint(rect.right,rect.bottom).matrixTransform(inv);var left=Math.min(p1.x,p2.x),right=Math.max(p1.x,p2.x),top=Math.min(p1.y,p2.y),bottom=Math.max(p1.y,p2.y);return{left:left,top:top,right:right,bottom:bottom,width:right-left,height:bottom-top}}catch(e){return null}},
      worldPoint:function(inv,rect){if(!inv||!rect)return null;try{return new DOMPoint(rect.left+rect.width/2,rect.top+rect.height/2).matrixTransform(inv)}catch(e){return null}},
      tagWorldBox:function(inv,el){var tag=el&&el.querySelector?el.querySelector(".direction-tag-bg"):null;if(!tag)return null;var box=MetricGeometry.worldBox(inv,tag.getBoundingClientRect());if(!box||!(box.width>0)||!(box.height>0))return null;return box},
      directionItems:function(){var els=document.querySelectorAll(z90Selector()),inv=MetricGeometry.inverseFrame(),items=[],i;for(i=0;i<els.length;i++){var box=MetricGeometry.tagWorldBox(inv,els[i]);if(!box)continue;items.push({box:box,id:els[i].getAttribute("data-id"),branch:cloudOfEl(els[i])})}return items},
      nodePositions:function(svg,world){
        var inv=world?MetricGeometry.inverseFrame():null,pos={},keys=[];
        Array.prototype.forEach.call(svg.querySelectorAll(".node-group[data-layout-key]:not(.is-hidden)"),function(g){
          var key=g.getAttribute("data-layout-key");if(!key||pos[key])return;
          var icon=g.querySelector(":scope > .branch-icon, :scope > .topic-icon");if(!icon)return;
          var r=icon.getBoundingClientRect();
          if(world){
            var p=inv?MetricGeometry.worldPoint(inv,r):null;
            if(p)pos[key]={x:p.x,y:p.y};
            else pos[key]={x:r.left+r.width/2,y:r.top+r.height/2};
          }else{
            if(!r.width&&!r.height)return;
            pos[key]={x:r.left+r.width/2,y:r.top+r.height/2};
          }
          keys.push(key);
        });
        var center=null;
        if(world){center=inv?{x:900,y:620}:null}
        else{var layer=document.getElementById("mapLayer");try{var m=(layer||svg).getScreenCTM();if(m){var pt=new DOMPoint(900,620).matrixTransform(m);center={x:pt.x,y:pt.y}}}catch(e){}}
        if(!center){var sx=0,sy=0,n=0;keys.forEach(function(k){if(k.indexOf("cat-")===0){sx+=pos[k].x;sy+=pos[k].y;n++}});if(n)center={x:sx/n,y:sy/n}}
        return{pos:pos,keys:keys,center:center};
      }
    };
    function metricWorldFrame(){return MetricGeometry.inverseFrame()}
    function metricWorldBox(inv,rect){return MetricGeometry.worldBox(inv,rect)}
    function metricWorldPoint(inv,rect){return MetricGeometry.worldPoint(inv,rect)}
    // Visible tap surface of a direction control: the world box of
    // its .direction-tag-bg child, or null when the control has no
    // tag element or the box has zero width or height.
    function metricTagWorldBox(inv,el){return MetricGeometry.tagWorldBox(inv,el)}
    // One measurement run over the direction controls (z90Selector):
    // each surviving control's tag world box, its topic id (the
    // data-id attribute cloudOfEl reads) and its branch (cloudOfEl).
    // The world frame is captured once for the whole run.
    function metricDirectionItems(){return MetricGeometry.directionItems()}
    // Positive-area intersection of two world boxes: touching edges
    // (zero overlap width or height) do not count.
    function metricBoxesOverlap(a,b){var iw=Math.min(a.right,b.right)-Math.max(a.left,b.left),ih=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return iw>0&&ih>0}
    // fitScale: screen px per world px at the camera's FIT, not the
    // current camera. Pure read of Ih()'s fit and lh()'s screen
    // factor. Does not call Ih() — that writes the camera and arms a
    // refit. g uses Ih's inputs: #mapLayer bboxes (In), floored at the
    // center disc (900,620, radius 1200 — pr.centerRadius /
    // ea.outerRadius, assigned once), +20 margin, padding 90 at
    // innerWidth<=620 else 44, the 3200x3200 frame (nh), cap 2.18 at
    // innerWidth<=620 else 2.3, and #mapSvg clientWidth/clientHeight
    // (Cn) with innerWidth/innerHeight fallback. Floor is the
    // camera's 1e-9, not 0.05 (census ruled to the true fit,
    // 2026-11-04). The 620 is the bundle's literal, not
    // __sxSmallScreenMax. Screen px per world px then multiplies by
    // lh()'s factor: min(cardWidth/3200, cardHeight/3200) on
    // #mapScene's parent, the map card.
    function metricFitScale(){
      var svg=document.getElementById("mapSvg");
      var layer=document.getElementById("mapLayer");
      var scene=document.getElementById("mapScene");
      var card=scene?scene.parentElement:null;
      var CX=900,CY=620,CR=1200,VBW=3200,VBH=3200;
      var narrow=window.innerWidth<=620;
      var minX=CX-CR,minY=CY-CR,maxX=CX+CR,maxY=CY+CR;
      function acc(el){if(!el)return;try{var b=el.getBBox();if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!(b.width>0)||!(b.height>0))return;if(b.x<minX)minX=b.x;if(b.y<minY)minY=b.y;if(b.x+b.width>maxX)maxX=b.x+b.width;if(b.y+b.height>maxY)maxY=b.y+b.height}catch(e){}}
      if(layer){Array.prototype.forEach.call(layer.querySelectorAll(".node-group:not(.is-hidden)"),acc);acc(layer.querySelector(".center-glance-rings"))}
      var d=Math.max(CR,CX-minX,maxX-CX)+20;
      var u=Math.max(CR,CY-minY,maxY-CY)+20;
      var pad=narrow?90:44;
      var sw=svg&&svg.clientWidth?svg.clientWidth:window.innerWidth;
      var sh=svg&&svg.clientHeight?svg.clientHeight:window.innerHeight;
      var asp=sw>0&&sh>0?sw/sh:1;
      var hw=VBW/2*Math.max(1,asp),hh=VBH/2*Math.max(1,1/asp);
      var g=Math.min((hw-pad)/d,(hh-pad)/u);
      var cam=Math.max(1e-9,Math.min(narrow?2.18:2.3,g));
      var rect=card?card.getBoundingClientRect():null;
      var cw=rect&&rect.width?rect.width:0,chh=rect&&rect.height?rect.height:0;
      var vb=cw>0&&chh>0?Math.min(cw/VBW,chh/VBH):0;
      return cam*vb;
    }
    // z90 population and reading (Metrics rebuild, Edit 1): the
    // give/receive direction controls; per control the need is
    // 44 / (fitScale * min(tag world width, tag world height)) with
    // no clamping, and the reading is the nearest-rank 90th
    // percentile of the needs (1 when there are no needs).
    function z90Selector(){return "#mapSvg .direction-control[data-direction=\"give\"],#mapSvg .direction-control[data-direction=\"receive\"]"}
    function z90Percentile(needs){if(!needs.length)return 1;needs.sort(function(a,b){return a-b});return needs[Math.min(needs.length-1,Math.ceil(needs.length*0.9)-1)]}
    // Metric engine (Batch B, Build 2026-10-19_2353): metrics are OFF by
    // default. The live path is per-branch ("locals") only:
    // scheduleMetric() debounces 500ms after any settings change and
    // runs ONLY the selected metric's clouds() walk, feeding
    // renderMetricOverlay — it never runs the whole-map compute. The
    // whole-map ("global") total runs ONLY from the Calculate now
    // button (calculateGlobal) and is shown at the center node; any
    // later settings change dims it as stale until recalculated.
    var metricOn=false,metricId='off',metricTimer=null,metricRun=0,metricGlobalRun=0;
    function selectedMetricDef(){return metricId==='off'?null:LayoutMetrics.get(metricId)}
    function scheduleMetric(){if(!metricOn||metricId==='off')return;markMetricGlobalStale();if(metricTimer)clearTimeout(metricTimer);metricTimer=setTimeout(measureLocals,500)}
    function measureLocals(){var def=selectedMetricDef();if(!def){clearMetricOverlay();return}var run=++metricRun,cancelled=function(){return run!==metricRun||!metricOn||metricId==='off'};if(typeof def.clouds==="function"){try{def.clouds({svg:document.getElementById("mapSvg")},function(clouds){if(cancelled())return;renderMetricOverlay(clouds||{})},cancelled)}catch(e){clearMetricOverlay()}}else clearMetricOverlay()}
    // Calculate-now busy state (Metrics rebuild, Edit 3): while a
    // global computation is in flight the button shows a spinner
    // (.is-busy CSS), aria-busy="true", and an elapsed-time readout
    // ("Calculating… 0.4s") refreshed every 100ms. Started in
    // calculateGlobal() before def.compute runs; cleared when that
    // run's done callback delivers the result, and on every
    // invalidation path that bumps metricGlobalRun (metric switched,
    // metrics turned off, a newer Calculate now superseding) — those
    // callers invoke stopMetricBusy() themselves.
    var metricBusyTimer=null,metricBusyLabel=null,metricBusyStart=0;
    function startMetricBusy(){
      var btn=document.getElementById("layoutMetricMeasure");if(!btn)return;
      if(metricBusyTimer===null)metricBusyLabel=btn.textContent;
      metricBusyStart=Date.now();
      btn.classList.add("is-busy");btn.setAttribute("aria-busy","true");
      function tick(){btn.textContent="Calculating… "+((Date.now()-metricBusyStart)/1000).toFixed(1)+"s"}
      tick();
      if(metricBusyTimer!==null)clearInterval(metricBusyTimer);
      metricBusyTimer=setInterval(tick,100);
    }
    function stopMetricBusy(){
      if(metricBusyTimer!==null){clearInterval(metricBusyTimer);metricBusyTimer=null}
      var btn=document.getElementById("layoutMetricMeasure");if(!btn)return;
      btn.classList.remove("is-busy");btn.removeAttribute("aria-busy");
      if(metricBusyLabel!==null){btn.textContent=metricBusyLabel;metricBusyLabel=null}
    }
    function calculateGlobal(){var def=selectedMetricDef();if(!def||!metricOn)return;var run=++metricGlobalRun,cancelled=function(){return run!==metricGlobalRun||!metricOn||metricId==='off'};startMetricBusy();if(metricOverlayOn)measureLocals();try{def.compute({svg:document.getElementById("mapSvg")},function(res){if(cancelled())return;stopMetricBusy();showMetricGlobal(res&&res.text!=null?res.text:"–")},cancelled)}catch(e){stopMetricBusy()}}
    var metricSelect=document.getElementById("layoutMetricSelect"),metricButton=document.getElementById("layoutMetricMeasure");
    if(metricSelect)metricSelect.addEventListener("change",function(){metricId=metricSelect.value;metricOn=metricId!=='off';if(metricButton)metricButton.disabled=!metricOn;stopMetricBusy();clearMetricGlobal();if(metricOn){scheduleMetric();if(metricOverlayOn)calculateGlobal()}else{metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay()}scheduleLiveSync()});
    if(metricButton)metricButton.addEventListener("click",function(){if(!metricOn)return;calculateGlobal()});
    // "Show numbers on map" (Build 2026-10-19_1706): a display-only
    // overlay layer inside #mapScene draws each cloud's current metric
    // value as a yellow number centered on the cloud — the annotated-PNG
    // look, live. Cloud centers use the same attribution as the metric
    // walks: direction controls resolved through cloudOfEl (their own
    // data-id), with the cloud's visible node icons (topBranchKey over
    // metricNodePositions) as fallback for clouds with no sliders on
    // screen. Values refresh from measureLocals (which scheduleMetric
    // already drives after every layout change). Anchors are stored in
    // map-layer world coordinates, so pan/zoom — viewBox and transform
    // mutations — repositions the numbers through the layer CTM without
    // re-measuring. The layer is pointer-events:none, so map tap, pan
    // and pinch-zoom are untouched.
    // Q11 AS AMENDED (Layout groups Phase 3): the overlay's shipped
    // default is OFF — the checkbox in the panel markup starts
    // unchecked to match — superseding the printed Q11 (a) and the
    // 2026-10-19 default-ON addendum. Reset to defaults also returns
    // it to OFF (see the layoutReset handler).
    // F3 (layout-editor refactor): the on-map numbers lifecycle now
    // lives in ONE module, MetricNumbersView. It holds the view state
    // — overlay layer element, per-cloud label/anchor records, the
    // center-node total element with its text and stale flag, and the
    // per-cloud cache — and every show / hide / stale / clear /
    // visibility change flows through its single render path (render,
    // renderCache, clear, showGlobal, markStale, clearGlobal and
    // syncGlobal). The scalar editor state it renders from stays in
    // the existing editor variables (metricOn, metricId, metricOverlayOn
    // — still written directly by the picker, the toggle, the Fastest
    // and Reset paths and the cross-window sync, exactly as before);
    // the accessors defined under the module read and write those same
    // variables, so each value still exists exactly once. The 500 ms
    // debounce (scheduleMetric), the metricRun / metricGlobalRun run
    // guards and the settle path's calls into scheduleMetric are
    // unchanged; they reach the view through the wrappers below.
    var metricOverlayOn=false;
    var MetricNumbersView={
      layerEl:null,labels:{},anchors:{},raf:0,
      globalEl:null,totalText:null,stale:false,
    // Last computed per-cloud values (Group 4, G4-1/G4-4): kept so
    // re-enabling the overlay — locally, from another window's sync,
    // or in a late-joining window — repaints instantly from cache and
    // refreshes in the background, instead of waiting on a full
    // re-measure. Keyed by metric id so a stale metric's numbers are
    // never shown for a different one.
      cacheClouds:null,cacheId:null,
      layer:function(){
        var scene=document.getElementById("mapScene");if(!scene)return null;
        var parent=scene.parentElement||scene;
        if(!MetricNumbersView.layerEl||!MetricNumbersView.layerEl.isConnected){MetricNumbersView.layerEl=document.createElement("div");MetricNumbersView.layerEl.className="metric-map-overlay";MetricNumbersView.layerEl.id="metricMapOverlay";MetricNumbersView.layerEl.setAttribute("aria-hidden","true");parent.appendChild(MetricNumbersView.layerEl);MetricNumbersView.labels={};MetricNumbersView.anchors={}}
        return MetricNumbersView.layerEl;
      },
      cloudCenters:function(){
        var sums={},counts={};
        function add(c,x,y){if(!c)return;(sums[c]=sums[c]||{x:0,y:0});sums[c].x+=x;sums[c].y+=y;counts[c]=(counts[c]||0)+1}
        var els=document.querySelectorAll(z90Selector()),i;
        for(i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();if(!(r.width>0||r.height>0))continue;add(cloudOfEl(els[i]),r.left+r.width/2,r.top+r.height/2)}
        var svg=document.getElementById("mapSvg");
        if(svg){var np=metricNodePositions(svg);np.keys.forEach(function(k){var c=topBranchKey(k);if(c&&!sums[c])add(c,np.pos[k].x,np.pos[k].y)})}
        var out={};Object.keys(sums).forEach(function(c){out[c]={x:sums[c].x/counts[c],y:sums[c].y/counts[c]}});
        return out;
      },
      position:function(){
        if(!MetricNumbersView.layerEl||!MetricNumbersView.layerEl.isConnected)return;
        var layer=document.getElementById("mapLayer");if(!layer)return;
        var m=null;try{m=layer.getScreenCTM()}catch(e){}
        if(!m)return;
        var orect=MetricNumbersView.layerEl.getBoundingClientRect();
        Object.keys(MetricNumbersView.labels).forEach(function(c){
          var a=MetricNumbersView.anchors[c],el=MetricNumbersView.labels[c];if(!a||!el)return;
          var p;try{p=new DOMPoint(a.x,a.y).matrixTransform(m)}catch(e){return}
          el.style.left=(p.x-orect.left)+"px";el.style.top=(p.y-orect.top)+"px";
        });
        if(MetricNumbersView.globalEl&&MetricNumbersView.globalEl.isConnected){try{var gp=new DOMPoint(900,620).matrixTransform(m);MetricNumbersView.globalEl.style.left=(gp.x-orect.left)+"px";MetricNumbersView.globalEl.style.top=(gp.y-orect.top)+"px"}catch(e){}}
      },
      schedulePosition:function(){
        if(MetricNumbersView.raf)return;
        MetricNumbersView.raf=requestAnimationFrame(function(){MetricNumbersView.raf=0;MetricNumbersView.position()});
      },
      clearLabels:function(){
        Object.keys(MetricNumbersView.labels).forEach(function(c){if(MetricNumbersView.labels[c])MetricNumbersView.labels[c].remove()});
        MetricNumbersView.labels={};MetricNumbersView.anchors={};
      },
      render:function(clouds){
        if(clouds&&Object.keys(clouds).length){MetricNumbersView.cacheClouds=clouds;MetricNumbersView.cacheId=metricId}
        var layer=MetricNumbersView.layer();if(!layer)return;
        if(!metricOverlayOn){MetricNumbersView.clearLabels();MetricNumbersView.syncGlobal();return}
        var centers=MetricNumbersView.cloudCenters(),seen={};
        Object.keys(clouds||{}).forEach(function(c){
          var ctr=centers[c];if(!ctr)return;
          var w=MetricGeometry.screenToWorld(ctr.x,ctr.y);if(!w)return;
          seen[c]=true;MetricNumbersView.anchors[c]={x:w.x,y:w.y};
          var el=MetricNumbersView.labels[c];
          if(!el||!el.isConnected){el=document.createElement("span");el.className="metric-map-num";MetricNumbersView.labels[c]=el;layer.appendChild(el)}
          el.textContent=clouds[c].text;
        });
        Object.keys(MetricNumbersView.labels).forEach(function(c){if(!seen[c]){MetricNumbersView.labels[c].remove();delete MetricNumbersView.labels[c];delete MetricNumbersView.anchors[c]}});
        MetricNumbersView.syncGlobal();
        MetricNumbersView.position();
      },
      renderCache:function(){
        if(MetricNumbersView.cacheClouds&&MetricNumbersView.cacheId===metricId){MetricNumbersView.render(MetricNumbersView.cacheClouds)}
        else if(metricOn&&metricId!=="off"){scheduleMetric()}
        else{MetricNumbersView.render({})}
      },
      clear:function(){
        MetricNumbersView.clearLabels();
        if(MetricNumbersView.globalEl)MetricNumbersView.globalEl.style.display="none";
      },
      showGlobal:function(text){
        var layer=MetricNumbersView.layer();if(!layer)return;
        if(!MetricNumbersView.globalEl||!MetricNumbersView.globalEl.isConnected){MetricNumbersView.globalEl=document.createElement("span");MetricNumbersView.globalEl.className="metric-map-global";MetricNumbersView.globalEl.id="metricMapGlobal";layer.appendChild(MetricNumbersView.globalEl)}
        MetricNumbersView.totalText=text;
        MetricNumbersView.globalEl.textContent=text;
        MetricNumbersView.stale=false;
        MetricNumbersView.globalEl.classList.remove("is-stale");
        MetricNumbersView.syncGlobal();
        MetricNumbersView.position();
      },
      markStale:function(){
        if(MetricNumbersView.globalEl&&MetricNumbersView.globalEl.isConnected&&MetricNumbersView.globalEl.textContent){MetricNumbersView.globalEl.classList.add("is-stale");MetricNumbersView.stale=true}
      },
      clearGlobal:function(){
        if(MetricNumbersView.globalEl&&MetricNumbersView.globalEl.isConnected)MetricNumbersView.globalEl.remove();
        MetricNumbersView.globalEl=null;MetricNumbersView.totalText=null;MetricNumbersView.stale=false;
      },
      syncGlobal:function(){
        if(!MetricNumbersView.globalEl)return;
        MetricNumbersView.globalEl.style.display=(metricOverlayOn&&MetricNumbersView.totalText)?"":"none";
      }
    };
    Object.defineProperties(MetricNumbersView,{
      on:{get:function(){return metricOverlayOn},set:function(v){metricOverlayOn=!!v}},
      metricId:{get:function(){return metricId}},
      metricOn:{get:function(){return metricOn}},
      clouds:{get:function(){return MetricNumbersView.cacheClouds}}
    });
    // Thin wrappers: every pre-refactor global name stays callable for
    // its existing call sites (the metric engine, the picker and toggle
    // handlers, the cross-window sync, the Fastest and Reset paths);
    // each one delegates to the module's single render path above.
    function renderMetricOverlayCache(){MetricNumbersView.renderCache()}
    function metricScreenToWorld(x,y){return MetricGeometry.screenToWorld(x,y)}
    function positionMetricOverlay(){MetricNumbersView.position()}
    function scheduleOverlayPosition(){MetricNumbersView.schedulePosition()}
    function renderMetricOverlay(clouds){MetricNumbersView.render(clouds)}
    function clearMetricOverlay(){MetricNumbersView.clear()}
    // Whole-map total at the center node (Batch B): a cyan label in the
    // same overlay layer, anchored at the map's center (world 900,620 —
    // the same center metricNodePositions uses) and positioned by
    // positionMetricOverlay, so it tracks pan/zoom like the per-branch
    // numbers and is pointer-events:none with the layer. It appears
    // after Calculate now runs def.compute, or after the measurement
    // selection changes while the overlay is on; any later settings
    // change adds .is-stale (dimmed to 0.45) until the next
    // calculation. Turning metrics off removes it entirely, so a total
    // from another metric never shows as current.
    // OWNERSHIP (map-render refactor, finding 15): this shell inline
    // script is the sole owner of the center-node global total
    // (#metricMapGlobal). The app bundle
    // deliberately does not compute or update it — its render entry
    // (Mr) carries a matching note. The split is documented rather
    // than moved because the display is driven by shell-side overlay
    // state (metricOverlayLabels, metricScreenToWorld, DOMPoint
    // transforms) that the bundle does not own.
    function showMetricGlobal(text){MetricNumbersView.showGlobal(text)}
    function markMetricGlobalStale(){MetricNumbersView.markStale()}
    function clearMetricGlobal(){MetricNumbersView.clearGlobal()}
    var metricOverlayToggle=document.getElementById("layoutMetricOverlay");
    if(metricOverlayToggle)metricOverlayToggle.addEventListener("change",function(){metricOverlayOn=!!metricOverlayToggle.checked;if(metricOverlayOn){renderMetricOverlayCache();if(metricOn&&metricId!=="off")scheduleMetric()}else clearMetricOverlay();scheduleLiveSync()});
    try{var metricOverlayObserver=new MutationObserver(function(){if(metricOverlayOn)scheduleOverlayPosition()});var moSvg=document.getElementById("mapSvg");if(moSvg)metricOverlayObserver.observe(moSvg,{attributes:true,attributeFilter:["viewBox"]});["viewport","mapLayer"].forEach(function(id){var n=document.getElementById(id);if(n)metricOverlayObserver.observe(n,{attributes:true,attributeFilter:["transform"]})})}catch(e){}
    window.addEventListener("resize",function(){if(metricOverlayOn)scheduleOverlayPosition()});
    // Scene-resize tracking (repair, 2026-11-01): the attribute
    // observer above and the window-resize listener cover pan/zoom
    // and browser-window resizes, but the map scene also changes
    // size with NO attribute and NO window resize — the layout
    // panel docking, minimising or going fullscreen, the match
    // stage opening, route changes. The numbers' pixel positions
    // are projected from their stored world anchors through the
    // scene's current fit, so a scene resize left them standing
    // where the clouds used to be (the offset in the report: the
    // panel was minimised between the two screenshots and the
    // numbers never followed the map into its wider frame). A
    // ResizeObserver on the scene re-projects both number layers
    // — the per-cloud metric numbers and the Anneal live number —
    // from their world anchors through the current transform
    // whenever the scene's box changes, so the numbers shift with
    // the map under every mechanism that moves it.
    try{
      if(typeof ResizeObserver==="function"){
        var sxSceneEl=document.getElementById("mapScene");
        if(sxSceneEl){var sxSceneResizeObserver=new ResizeObserver(function(){if(metricOverlayOn)scheduleOverlayPosition();if(AnnealCloudOverlay.branch)AnnealCloudOverlay.schedulePosition()});sxSceneResizeObserver.observe(sxSceneEl)}
      }
    }catch(e){}
    // Metric option tooltips (Build 2026-10-19_1152): one floating tip
    // explains the metric under the pointer — definition first, then
    // intended use (the registry's tooltip strings). The tip is
    // pointer-events:none, hugs the cursor with a 14px offset, flips at
    // viewport edges, follows mousemove, and while an option of the open
    // dropdown is hovered it is pushed clear of the menu zone (the
    // select's rect expanded by the option list's extent) so every
    // option stays visible and clickable/tappable. On touch devices it
    // appears after a 500ms long-press on the select and hides on the
    // next tap elsewhere or when an option is selected.
    var metricTip=document.createElement("div");
    metricTip.className="layout-metric-tip";metricTip.hidden=true;metricTip.setAttribute("role","tooltip");
    document.body.appendChild(metricTip);
    var metricTipFor=null,metricTipX=0,metricTipY=0,metricTipOnOption=false,metricPressTimer=null;
    function metricTipDef(id){return id&&id!=="off"?LayoutMetrics.get(id):null}
    function metricMenuZone(){
      var sr=metricSelect.getBoundingClientRect(),w=sr.width;
      try{var mc=document.createElement("canvas").getContext("2d");mc.font=getComputedStyle(metricSelect).font;Array.prototype.forEach.call(metricSelect.options,function(o){w=Math.max(w,mc.measureText(o.textContent).width+56)})}catch(e){}
      var rows=metricSelect.options.length,rh=34;
      return{left:sr.left-6,right:sr.left+w+6,top:sr.top-rows*rh-6,bottom:sr.bottom+rows*rh+6};
    }
    function placeMetricTip(){
      if(metricTip.hidden||!metricSelect)return;
      var pad=8,tw=metricTip.offsetWidth,th=metricTip.offsetHeight;
      var x=metricTipX+14,y=metricTipY+14;
      if(metricTipOnOption){
        var z=metricMenuZone();
        if(x<z.right&&x+tw>z.left&&y<z.bottom&&y+th>z.top){
          if(z.right+10+tw<=window.innerWidth-pad)x=z.right+10;
          else if(z.left-10-tw>=pad)x=z.left-10-tw;
        }
      }
      var sr2=metricSelect.getBoundingClientRect();
      if(x<sr2.right&&x+tw>sr2.left&&y<sr2.bottom&&y+th>sr2.top){
        if(sr2.bottom+6+th<=window.innerHeight-pad)y=sr2.bottom+6;
        else if(sr2.top-6-th>=pad)y=sr2.top-6-th;
      }
      if(x+tw>window.innerWidth-pad)x=metricTipX-tw-14;
      if(y+th>window.innerHeight-pad)y=metricTipY-th-14;
      x=Math.max(pad,Math.min(x,Math.max(pad,window.innerWidth-tw-pad)));
      y=Math.max(pad,Math.min(y,Math.max(pad,window.innerHeight-th-pad)));
      metricTip.style.left=x+"px";metricTip.style.top=y+"px";
    }
    function showMetricTip(id,x,y,onOption){
      var def=metricTipDef(id);if(!def||!def.tooltip){hideMetricTip();return}
      metricTipFor=id;metricTipX=x;metricTipY=y;metricTipOnOption=!!onOption;
      metricTip.textContent=def.tooltip.replace(" Intended use: ","\nIntended use: ");
      metricTip.hidden=false;placeMetricTip();
    }
    function hideMetricTip(){metricTip.hidden=true;metricTipFor=null;metricTipOnOption=false;if(metricPressTimer){clearTimeout(metricPressTimer);metricPressTimer=null}}
    if(metricSelect){
      metricSelect.addEventListener("mouseover",function(e){var t=e.target,v=(t&&t.tagName==="OPTION")?t.value:metricSelect.value;showMetricTip(v,e.clientX,e.clientY,t&&t.tagName==="OPTION")});
      metricSelect.addEventListener("mousemove",function(e){if(metricTip.hidden)return;metricTipX=e.clientX;metricTipY=e.clientY;var t=e.target;if(t&&t.tagName==="OPTION"){metricTipOnOption=true;if(t.value!==metricTipFor){showMetricTip(t.value,e.clientX,e.clientY,true);return}}placeMetricTip()});
      metricSelect.addEventListener("mouseleave",hideMetricTip);
      metricSelect.addEventListener("change",hideMetricTip);
      metricSelect.addEventListener("blur",hideMetricTip);
      metricSelect.addEventListener("touchstart",function(e){if(metricPressTimer)clearTimeout(metricPressTimer);var tt=e.touches&&e.touches[0];if(!tt)return;var x=tt.clientX,y=tt.clientY;metricPressTimer=setTimeout(function(){metricPressTimer=null;showMetricTip(metricSelect.value,x,y,false)},500)},{passive:true});
      metricSelect.addEventListener("touchend",function(){if(metricPressTimer){clearTimeout(metricPressTimer);metricPressTimer=null}});
      metricSelect.addEventListener("touchmove",function(){if(metricPressTimer){clearTimeout(metricPressTimer);metricPressTimer=null}},{passive:true});
      document.addEventListener("touchstart",function(e){if(!metricTip.hidden&&e.target!==metricSelect)hideMetricTip()},{passive:true});
      document.addEventListener("pointerdown",function(e){if(!metricTip.hidden&&e.target!==metricSelect&&!(e.target&&e.target.tagName==="OPTION"))hideMetricTip()});
    }
    var scoresToggle=document.getElementById("layoutScoresEnabled");
    if(scoresToggle)scoresToggle.addEventListener("change",function(){scoresOn=!!scoresToggle.checked;if(scoresOn){scheduleScores()}else{var cEl=document.getElementById("layoutScoreC"),xEl=document.getElementById("layoutScoreX"),covEl=document.getElementById("layoutScoreCov"),strip=document.getElementById("layoutScores");if(cEl)cEl.textContent="–";if(xEl)xEl.textContent="–";if(covEl)covEl.textContent="–";if(strip)strip.classList.remove("is-clean")}});
    // Context-aware open + live layout scores (Build 2026-10-18_1314).
    // The editor follows the map's current selection: the focused node
    // (is-preview from the topic finder, else the deepest node on the
    // selected-spoke chain) is resolved through the taxonomy to its
    // category / subcategory / kink, and the matching Advanced selects,
    // sliders, and spoke-angle row are pre-set whenever the editor opens
    // or the selection changes while it is open (map spoke taps call
    // selectNode via __SEXCAPADES_LAYOUT_UI).
    function slugify(name){return String(name||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}
    var taxonomyCache=null;
    function taxonomy(){if(taxonomyCache)return taxonomyCache;try{if(window.TaxonomyLoader&&window.TaxonomyLoader.loadTaxonomy)taxonomyCache=window.TaxonomyLoader.loadTaxonomy()}catch (e) { __sxErrLog("taxonomy-loader", e); }return taxonomyCache}
    function topicEntry(id){var tax=taxonomy();if(!tax||!tax.topicById)return null;try{return tax.topicById.get?tax.topicById.get(id):tax.topicById[id]}catch(e){return null}}
    function branchNames(){return (window.__SEXCAPADES_LAYOUT_API&&window.__SEXCAPADES_LAYOUT_API.branches)?window.__SEXCAPADES_LAYOUT_API.branches():[]}
    function selectedNodeKey(svg){
      var prev=svg.querySelector(".node-group.is-preview");
      if(prev&&prev.getAttribute("data-layout-key"))return prev.getAttribute("data-layout-key");
      var best=null,bestLevel=-1;
      Array.prototype.forEach.call(svg.querySelectorAll(".node-group[data-layout-key]"),function(g){
        if(!g.querySelector(".selected-spoke"))return;
        var key=g.getAttribute("data-layout-key"),level=key.indexOf("cat-")===0?0:key.indexOf("subcategory-")===0?1:2;
        if(level>bestLevel){bestLevel=level;best=key}
      });
      // Q3: a branch's selection mark is stamped into its spoke
      // underlay item, never into the hub node group (see the
      // bundle's applySelectionMarking), so a branch-only selection
      // is invisible to the group scan above. Read it from the
      // underlay instead — level 0, so a deeper mark (a selected
      // topic also stamps its branch's underlay) still wins.
      Array.prototype.forEach.call(svg.querySelectorAll(".spoke-underlay-item[data-spoke-for]"),function(u){
        if(bestLevel>=0||!u.querySelector(".selected-spoke"))return;
        best=u.getAttribute("data-spoke-for");bestLevel=0;
      });
      return best;
    }
    function resolveFocus(key){
      if(!key)return null;
      var branches=branchNames(),i,b,bs;
      if(key.indexOf("cat-")===0){var slug=key.slice(4);for(i=0;i<branches.length;i++)if(slugify(branches[i])===slug)return{branch:branches[i]};return null}
      if(key.indexOf("subcategory-")===0){
        var tax=taxonomy();
        if(tax&&tax.categories)for(var c=0;c<tax.categories.length;c++){var cat=tax.categories[c],subs=cat.subcategories||[];for(var s=0;s<subs.length;s++)if("subcategory-"+slugify(cat.name)+"-"+slugify(subs[s].name)===key)return{branch:cat.name,subcat:subs[s].name}}
        var rest=key.slice(12),sel=document.getElementById("layoutSubcat");
        for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(rest.indexOf(bs+"-")===0&&sel){var subSlug=rest.slice(bs.length+1);for(var o=0;o<sel.options.length;o++)if(slugify(sel.options[o].value)===subSlug)return{branch:branches[b],subcat:sel.options[o].value}}}
        return null;
      }
      var entry=topicEntry(key);
      if(entry)return{branch:entry.category,subcat:entry.subcategory||null,kink:key};
      if(key.indexOf("topic-")===0){var trest=key.slice(6);for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(trest.indexOf(bs+"-")===0)return{branch:branches[b]}}}
      var ksel=document.getElementById("layoutKink");
      if(ksel)for(var k=0;k<ksel.options.length;k++)if(ksel.options[k].value===key)return{kink:key};
      return null;
    }
    function setSelectValue(id,value){var sel=document.getElementById(id);if(!sel||!value)return false;for(var i=0;i<sel.options.length;i++)if(sel.options[i].value===value){sel.value=value;return true}return false}
    var lastFocusKey=null,pendingFocusKey=null;
    function focusEditorOn(key){
      var f=resolveFocus(key);if(!f)return false;
      var c=config(),touched=false;
      if(f.branch){try{checkAnnealBranchFromMap(f.branch)}catch(e){__sxErrLog("layout-anneal-map-sync",e)}}
      if(f.branch&&setSelectValue("layoutBranch",f.branch)){syncBranch(c);touched=true}
      if(f.subcat&&setSelectValue("layoutSubcat",f.subcat)){syncSubcatAngle(c);touched=true}
      if(f.kink&&setSelectValue("layoutKink",f.kink)){syncKink(c);touched=true}
      if(touched){
        var sec=document.getElementById("layoutSectionSelection");if(sec)sec.open=true;var sev=document.getElementById("layoutSectionEveryday");if(sev&&f.subcat)sev.open=true;
        if(f.branch){var wrap=document.getElementById("layoutSpokeAngles");if(wrap)Array.prototype.forEach.call(wrap.children,function(row){if(row.getAttribute("data-spoke-angle-name")===f.branch){row.classList.add("layout-editor-row-flash");setTimeout(function(){row.classList.remove("layout-editor-row-flash")},1900);setTimeout(function(){try{row.scrollIntoView({block:"nearest"})}catch (e) { __sxErrLog("scroll-into-view", e); }},80)}})}
      }
      return touched;
    }
    function detectAndFocus(){
      var svg=document.getElementById("mapSvg");if(!svg)return;
      var key=selectedNodeKey(svg);
      if(!key){
        // A selection notification that arrived before the selects
        // had their options (the editor had never been opened, so
        // focusEditorOn could not land it) is retried here — by the
        // time the editor opens, the options exist.
        if(pendingFocusKey){var pk=pendingFocusKey;if(focusEditorOn(pk)){lastFocusKey=pk;pendingFocusKey=null}return}
        // Q3 clear sync: a map-side clear that bypasses the shared
        // clear path (e.g. a topic tap whose toggle collapses the
        // selection away) removes every .selected-spoke mark without
        // calling clearSelectionUI. When the editor was following a
        // map selection, mirror the clear into the three selects so
        // map and editor never disagree. Only the selects are
        // cleared here — the map is already clear, so the API clear
        // path inside clearSelectionUI is not re-entered.
        if(lastFocusKey!==null){lastFocusKey=null;["layoutBranch","layoutSubcat","layoutKink"].forEach(function(id){var sel=document.getElementById(id);if(sel)sel.value=""});var c=config();syncBranch(c);syncKink(c);syncSubcatAngle(c)}
        return;
      }
      if(key===lastFocusKey)return;
      if(focusEditorOn(key)){lastFocusKey=key;pendingFocusKey=null}else pendingFocusKey=key;
    }
    // Q3: a map-side selection is followed even while the panel is
    // closed (the panel.hidden gate that used to sit here is gone),
    // so the next editor open lands on the selected branch. Setting
    // the selects on a hidden panel is inert until it opens.
    function selectNode(key){if(!key)return;if(focusEditorOn(key)){lastFocusKey=key;pendingFocusKey=null}else pendingFocusKey=key}
    window.__sxGetActiveNodeKey=function(){
      var svg=document.getElementById("mapSvg");
      return (svg?selectedNodeKey(svg):null)||lastFocusKey||null;
    };
    // Live scores, computed from the rendered SVG in screen space with the
    // documented methodology: C = label-label overlaps + label-spoke hits
    // (a label's own spoke excluded) + proper spoke-spoke crossings;
    // X = the spoke-spoke crossings alone; Coverage = the content
    // bounding box's share of the viewport area.
    var scoreTimer=0,scoresOn=false;
    function scheduleScores(){if(!scoresOn)return;if(panel.hidden)return;if(scoreTimer)return;scoreTimer=setTimeout(function(){scoreTimer=0;updateScores()},140)}
    function segSeg(p1,p2,p3,p4,proper){
      var d1=(p4.x-p3.x)*(p1.y-p3.y)-(p4.y-p3.y)*(p1.x-p3.x),d2=(p4.x-p3.x)*(p2.y-p3.y)-(p4.y-p3.y)*(p2.x-p3.x),d3=(p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x),d4=(p2.x-p1.x)*(p4.y-p1.y)-(p2.y-p1.y)*(p4.x-p1.x);
      var crossed=((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));
      if(proper)return crossed;
      if(crossed)return true;
      function onSeg(a,b,c){return b.x>=Math.min(a.x,c.x)-0.01&&b.x<=Math.max(a.x,c.x)+0.01&&b.y>=Math.min(a.y,c.y)-0.01&&b.y<=Math.max(a.y,c.y)+0.01}
      return (Math.abs(d1)<0.01&&onSeg(p3,p1,p4))||(Math.abs(d2)<0.01&&onSeg(p3,p2,p4))||(Math.abs(d3)<0.01&&onSeg(p1,p3,p2))||(Math.abs(d4)<0.01&&onSeg(p1,p4,p2));
    }
    function segRect(s,r){
      function inside(p){return p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=r.bottom}
      if(inside(s.a)||inside(s.b))return true;
      var tl={x:r.left,y:r.top},tr={x:r.right,y:r.top},br={x:r.right,y:r.bottom},bl={x:r.left,y:r.bottom};
      return segSeg(s.a,s.b,tl,tr,false)||segSeg(s.a,s.b,tr,br,false)||segSeg(s.a,s.b,br,bl,false)||segSeg(s.a,s.b,bl,tl,false);
    }
    function parentKeyFor(key){
      var branches=branchNames(),b,bs;
      if(key.indexOf("cat-")===0)return null;
      if(key.indexOf("subcategory-")===0){var rest=key.slice(12);for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(rest.indexOf(bs+"-")===0)return "cat-"+bs}return null}
      var entry=topicEntry(key);
      if(entry){if(entry.subcategory)return "subcategory-"+slugify(entry.category)+"-"+slugify(entry.subcategory);return "cat-"+slugify(entry.category)}
      if(key.indexOf("topic-")===0){var trest=key.slice(6);for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(trest.indexOf(bs+"-")===0)return "cat-"+bs}}
      return null;
    }
    function updateScores(){
      var cEl=document.getElementById("layoutScoreC"),xEl=document.getElementById("layoutScoreX"),covEl=document.getElementById("layoutScoreCov"),strip=document.getElementById("layoutScores");
      if(!cEl||!xEl||!covEl)return;
      var svg=document.getElementById("mapSvg");
      if(!svg){cEl.textContent=xEl.textContent=covEl.textContent="–";return}
      try{
        var pos={},keys=[];
        Array.prototype.forEach.call(svg.querySelectorAll(".node-group[data-layout-key]:not(.is-hidden)"),function(g){
          var key=g.getAttribute("data-layout-key");if(!key||pos[key])return;
          var icon=g.querySelector(":scope > .branch-icon, :scope > .topic-icon");if(!icon)return;
          var r=icon.getBoundingClientRect();if(!r.width&&!r.height)return;
          pos[key]={x:r.left+r.width/2,y:r.top+r.height/2};keys.push(key);
        });
        var center=null,layer=document.getElementById("mapLayer");
        try{var m=(layer||svg).getScreenCTM();if(m){var pt=new DOMPoint(900,620).matrixTransform(m);center={x:pt.x,y:pt.y}}}catch (e) { __sxErrLog("screen-ctm", e); }
        if(!center){var sx=0,sy=0,n=0;keys.forEach(function(k){if(k.indexOf("cat-")===0){sx+=pos[k].x;sy+=pos[k].y;n++}});if(n)center={x:sx/n,y:sy/n}}
        var segs=[];
        keys.forEach(function(k){var pk=parentKeyFor(k),a=pk?pos[pk]:(k.indexOf("cat-")===0?center:null);if(a&&pos[k])segs.push({key:k,a:a,b:pos[k]})});
        function samePt(p,q){return Math.abs(p.x-q.x)<0.6&&Math.abs(p.y-q.y)<0.6}
        var X=0,i,j,s,t;
        for(i=0;i<segs.length;i++)for(j=i+1;j<segs.length;j++){s=segs[i];t=segs[j];if(samePt(s.a,t.a)||samePt(s.a,t.b)||samePt(s.b,t.a)||samePt(s.b,t.b))continue;if(segSeg(s.a,s.b,t.a,t.b,true))X++}
        var visibleKeys={};keys.forEach(function(k){visibleKeys[k]=true});
        var labels=[],seenLabel={};
        Array.prototype.forEach.call(svg.querySelectorAll(".category-label,.map-label"),function(el){
          var id=el.getAttribute("data-id")||el.getAttribute("data-topic-id");
          if(!id||!visibleKeys[id]||seenLabel[id])return;
          var r=el.getBoundingClientRect();if(r.width<2||r.height<2)return;
          seenLabel[id]=true;labels.push({id:id,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom}});
        });
        var LL=0,LS=0,a2,b2;
        for(a2=0;a2<labels.length;a2++)for(b2=a2+1;b2<labels.length;b2++){var ra=labels[a2].rect,rb=labels[b2].rect;if(ra.left+1<rb.right-1&&rb.left+1<ra.right-1&&ra.top+1<rb.bottom-1&&rb.top+1<ra.bottom-1)LL++}
        labels.forEach(function(l){segs.forEach(function(sg){if(sg.key!==l.id&&segRect(sg,l.rect))LS++})});
        var C=LL+LS+X,cov=null,sr=svg.getBoundingClientRect();
        if(sr.width>0&&sr.height>0&&(keys.length||labels.length)){
          var minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
          keys.forEach(function(k){var p=pos[k];if(p.x<minX)minX=p.x;if(p.y<minY)minY=p.y;if(p.x>maxX)maxX=p.x;if(p.y>maxY)maxY=p.y});
          labels.forEach(function(l){if(l.rect.left<minX)minX=l.rect.left;if(l.rect.top<minY)minY=l.rect.top;if(l.rect.right>maxX)maxX=l.rect.right;if(l.rect.bottom>maxY)maxY=l.rect.bottom});
          if(isFinite(minX))cov=Math.max(0,Math.min(100,(maxX-minX)*(maxY-minY)/(sr.width*sr.height)*100));
        }
        cEl.textContent=String(C);xEl.textContent=String(X);covEl.textContent=cov===null?"–":cov.toFixed(1)+"%";
        if(strip)strip.classList.toggle("is-clean",C===0&&X===0);
      }catch(err){cEl.textContent=xEl.textContent=covEl.textContent="–"}
    }
    var mapObserver=null;
    function watchMap(){
      var svg=document.getElementById("mapSvg");if(!svg||mapObserver)return;
      try{mapObserver=new MutationObserver(function(){if(!panel.hidden)scheduleScores();detectAndFocus()});mapObserver.observe(svg,{childList:true,subtree:true,attributes:true,attributeFilter:["class","viewBox","transform"]})}catch (e) { __sxErrLog("observer", e); }
    }
    function open(){sync();lastFocusKey=null;panel.hidden=false;setLayoutMinimised(false);detectAndFocus();scheduleScores();scheduleMetric();SexcapadesRuntime.TimerManager.requestAnimationFrame(function(){close.focus({preventScroll:true})})}function shut(){panel.hidden=true;if(stripTimer!==null){SexcapadesRuntime.TimerManager.clear(stripTimer);stripTimer=null}syncPanelDock()}
    // Tooltip card dismissal (Group 4, G4-3): the shared #uiTooltip
    // card is shown by the app on hover/focus and could park over
    // this panel — its trigger keeps focus after a click, so the card
    // stayed up and swallowed later taps (the prime suspect for dead
    // editor toggles after pop-slider use). Now: any completed click
    // inside the editor dismisses it, Escape dismisses it, and while
    // the editor is open it auto-dismisses after ~3.4s even if left
    // alone. Together with the pointer-events:none style rule, the
    // card can never park over the panel or block a control.
    function dismissUiTooltip(){var tip=document.getElementById("uiTooltip");if(tip&&!tip.hidden){tip.hidden=true;var described=document.querySelector("[aria-describedby='uiTooltip']");if(described)described.removeAttribute("aria-describedby")}}
    panel.addEventListener("click",function(){dismissUiTooltip()},true);
    document.addEventListener("keydown",function(event){if(event.key==="Escape")dismissUiTooltip()});
    try{var uiTipEl=document.getElementById("uiTooltip");if(uiTipEl){var uiTipTimer=null;new MutationObserver(function(){if(uiTipTimer){clearTimeout(uiTipTimer);uiTipTimer=null}if(!uiTipEl.hidden&&!panel.hidden)uiTipTimer=setTimeout(dismissUiTooltip,3400)}).observe(uiTipEl,{attributes:true,attributeFilter:["hidden","class","style"]})}}catch (e) { __sxErrLog("ui-tooltip-dismiss", e); }
    window.__SEXCAPADES_LAYOUT_UI={open:open,close:shut,selectNode:selectNode,clearSelection:clearSelectionUI,applyEditorState:applyEditorState,sync:sync};close.addEventListener("click",shut);
    document.addEventListener("keydown",function(event){var k=(event.key||"").toLowerCase();if(event.ctrlKey&&event.shiftKey&&(k==="l"||(event.code&&event.code==="KeyL"))){event.preventDefault();panel.hidden?open():shut()}else if(event.ctrlKey&&event.shiftKey&&(k==="s"||(event.code&&event.code==="KeyS"))){var t=event.target;if(t){var tg=t.tagName;if(tg==="TEXTAREA"||tg==="SELECT"||t.isContentEditable)return;if(tg==="INPUT"){var ty=(t.type||"text").toLowerCase();if(ty==="text"||ty==="search"||ty==="url"||ty==="email"||ty==="password"||ty==="number"||ty==="tel"||ty==="date"||ty==="time"||ty==="datetime-local"||ty==="month"||ty==="week")return}}event.preventDefault();var ms=document.getElementById(ids.mapSliders);if(!ms)return;ms.click()}else if(event.key==="Escape"&&!panel.hidden){event.preventDefault();if(!clearSelectionUI())shut()}});
    document.querySelectorAll("[data-layout-spacing]").forEach(function(input){input.addEventListener("change",function(){if(!input.checked)return;var name=input.dataset.layoutSpacing,next=collect();if(name==="custom"){if(customSpacing)Object.assign(next,customSpacing);next.spacing="custom"}else{if(spacingNameFor(spacingValuesOf(config()))==="custom")customSpacing=spacingValuesOf(config());Object.assign(next,bundles[name],{spacing:name})}apply(next)})});
    document.querySelectorAll("[data-layout-rating]").forEach(function(input){input.addEventListener("change",function(){if(!input.checked)return;/* LR-G5: this handler used to click the hidden mirror button (former id layoutRatedToggle) in a loop until its text matched the chosen value; the bundle now drives global visibility from the radios' own change events and the checked radio IS the rating state — nothing is clicked or read here beyond the editor sync */sync()})});
    // Layout groups Phase 2 (Q8/Q10): selector-button + pop-up menu
    // overlay mechanics, shared by Branch order and Collision mode. Each
    // control is one anchor button at rest showing the current mode; its
    // menu is a fixed-position overlay anchored to the button and
    // viewport-clamped (the capsule positioning precedent), floating
    // above the layout — never in flow, so no option can hide behind a
    // tooltip or read as a static label. The mode state itself is
    // unchanged: the menu options keep their aria-pressed contract, read
    // by branchOrderSelection()/collisionModeValue() and written by
    // sync(), exactly as the retired segmented rows were.
    function positionLeMenu(anchor,menu){
      var r=anchor.getBoundingClientRect(),w=menu.offsetWidth,h=menu.offsetHeight;
      var left=Math.min(Math.max(r.left,8),Math.max(8,window.innerWidth-w-8));
      var top=r.bottom+6;
      if(top+h>window.innerHeight-8)top=r.top-h-6;
      if(top<8)top=Math.max(8,window.innerHeight-h-8);
      menu.style.left=left+"px";menu.style.top=top+"px";
    }
    function syncBranchOrderAnchor(){var cur=document.getElementById("layoutBranchOrderCurrent");if(!cur)return;var pressed=document.querySelector("[data-branch-order][aria-pressed='true']");if(pressed)cur.textContent=pressed.textContent}
    function syncCollisionAnchor(){var cur=document.getElementById("layoutCollisionCurrent");if(!cur)return;var pressed=document.querySelector("[data-collision-mode][aria-pressed='true']");if(pressed)cur.textContent=pressed.textContent}
    function closeBranchOrderMenu(){var menu=document.getElementById("layoutBranchOrderMenu"),btn=document.getElementById("layoutBranchOrderBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function closeCollisionMenu(){var menu=document.getElementById("layoutCollisionMs"),btn=document.getElementById("layoutCollisionBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function closeSolverModeMenu(){var menu=document.getElementById("layoutSolverModeMenu"),btn=document.getElementById("layoutSolverModeBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function closeTargetNodeMenu(){var menu=document.getElementById("layoutTargetNodeMenu"),btn=document.getElementById("layoutTargetNodeBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function openLeMenu(anchor,menu,closeOther){
      if(typeof closeOther==="function")closeOther();
      closeTargetNodeMenu();
      if(typeof closeLePopups==="function")closeLePopups(null);
      menu.hidden=false;
      anchor.setAttribute("aria-expanded","true");
      positionLeMenu(anchor,menu);
    }
    var branchOrderControl=document.querySelector(".branch-order-control");
    var branchOrderBtn=document.getElementById("layoutBranchOrderBtn");
    if(branchOrderControl&&branchOrderBtn){var branchOrderButtons=Array.prototype.slice.call(document.querySelectorAll("[data-branch-order]"));branchOrderButtons.forEach(function(btn){btn.addEventListener("click",function(){branchOrderButtons.forEach(function(b){b.setAttribute("aria-pressed",String(b===btn))});syncBranchOrderAnchor();apply(collect());closeBranchOrderMenu();branchOrderBtn.focus()})});branchOrderBtn.addEventListener("click",function(){if(branchOrderControl.hidden)openLeMenu(branchOrderBtn,branchOrderControl,closeCollisionMenu);else closeBranchOrderMenu()});document.addEventListener("pointerdown",function(event){if(!branchOrderControl.hidden&&!branchOrderControl.contains(event.target)&&event.target!==branchOrderBtn&&!branchOrderBtn.contains(event.target))closeBranchOrderMenu()});document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!branchOrderControl.hidden){closeBranchOrderMenu();branchOrderBtn.focus()}});syncBranchOrderAnchor()}
    // Light path for the two display-only toggles (Group 1): Freeze
    // (staticMap) and relation lines (showRelations) change nothing
    // about geometry, so they must not pay for a full layout apply —
    // one apply of unchanged settings blocked the main thread ~13s and
    // snapped the camera back to fit. Assign the collected settings
    // straight into window.__SEXCAPADES_LAYOUT (the object the app's
    // relations overlay reads), flip the one CSS class each toggle
    // owns on #mapSvg, and run the editor's usual sync/schedulers so
    // scores, metrics, and cross-window live sync still follow. If the
    // layout object is somehow missing, fall back to the full apply.
    function applyDisplayToggle(next,key){
      if(!window.__SEXCAPADES_LAYOUT){apply(next);return}
      Object.assign(window.__SEXCAPADES_LAYOUT,next);
      var svg=document.getElementById("mapSvg");
      if(svg){
        if(key==="staticMap")svg.classList.toggle("is-static",!!next.staticMap);
        else if(key==="showRelations")svg.classList.toggle("relations-off",!next.showRelations);
      }
      sync();scheduleScores();scheduleMetric();scheduleLiveSync();
    }
    ["stagger","expandAll","crossmin","nudge","showRelations","propFan","subcatOrder","staggerDensity","repulsionEnabled","staticMap","animations","mapSliders"].forEach(function(key){var el=document.getElementById(ids[key]);if(el)el.addEventListener("change",function(){if(key==="showRelations"||key==="staticMap")applyDisplayToggle(collect(),key);else apply(collect())})});
    document.getElementById(ids.collisionEnabled).addEventListener("change",function(){var next=collect();if(this.checked&&next.collision==="off")next.collision=lastCollision;apply(next)});
    /* LR-G5: the hidden collision select's change handler (lastCollision bookkeeping, master-switch sync, apply) now lives in applyCollisionMode() beside collect(); the visible mode buttons call it directly — see the #layoutCollisionMs wiring below. */
    // Drag coalescing (Refactor Batch 4): a range slider's input
    // events run their handler at most once per animation frame -
    // the latest event wins, so the final value is what gets
    // applied - instead of one full apply() per input event. A
    // change event on the same slider flushes immediately (pending
    // frame cancelled, handler run once with the final value), so
    // every drag ends in exactly the state the un-coalesced code
    // produced. Discrete controls keep their direct bindings.
    function coalesceSlider(el,handler){if(!el)return;var frame=0,lastEvent=null;el.addEventListener("input",function(event){lastEvent=event;if(frame)return;frame=requestAnimationFrame(function(){frame=0;var e=lastEvent;lastEvent=null;if(e)handler.call(el,e)})});el.addEventListener("change",function(event){if(!frame)return;cancelAnimationFrame(frame);frame=0;lastEvent=null;handler.call(el,event)})}
    ["subLen","pad","repulsion"].forEach(function(key){coalesceSlider(document.getElementById(ids[key]),function(){var out=document.getElementById(ids[key]+"Value");if(out)out.textContent=Number(this.value).toFixed(1)+"×";var next=collect();next.spacing="custom";customSpacing=spacingValuesOf(next);apply(next);this.value=String(next[key]);if(out)out.textContent=Number(this.value).toFixed(1)+"×";scheduleMetric()})});coalesceSlider(document.getElementById(ids.spokeLen),function(){var out=document.getElementById(ids.spokeLen+"Value");if(out)out.textContent=fmtLen(relClamp(this.value)*bakedSpokeBase());var next=collect();next.spacing="custom";customSpacing=spacingValuesOf(next);apply(next);this.value=String(relClamp(next.spokeLen/bakedSpokeBase()));if(out)out.textContent=fmtLen(next.spokeLen);scheduleMetric()});
    /* Armed auto-shrink factors (Build 2026-10-31_1329): the two
       sliders write the EXISTING engine factors — mn.autoShrinkFactor
       (the branch radius chain's armed shrinkFactor) and
       mn.subcatCloudShrinkFactor (the armed subcategory cloud-radius
       factor in the collision passes) — through the ordinary
       collect/apply path, like every other global slider. Shipped
       value 0.76 for both; the engine falls back to 0.76 whenever a
       settings object carries no valid value. They are not spacing
       values, so they never touch the spacing preset state. */
    ["autoShrinkFactor","subcatCloudShrinkFactor"].forEach(function(key){coalesceSlider(document.getElementById(ids[key]),function(){var out=document.getElementById(ids[key]+"Value");if(out)out.textContent=Number(this.value).toFixed(2)+"×";var next=collect();apply(next);this.value=String(next[key]);if(out)out.textContent=Number(this.value).toFixed(2)+"×";scheduleMetric()})});
    /* Q7 — transform-only preview for the Text size (font) knob.
       The knob used to run a full synchronous apply on every drag
       step (~535 ms per step on the 28-topic Alex map; ~6.6 s per
       apply on the general path). Now a drag runs NO apply: each
       step re-scales the map's icon glyphs and labels with transforms
       only — an icon <g> gets an in-place scale composed into its
       baked transform attribute, around the icon's own center (from
       its translate + data-diameter), and each label <text> gets a
       CSS scale about its own box. Nothing else is touched: ratings,
       spokes, positions, anchors, frame and data all stay at the
       baked state, and metrics (xAreaCross, z90) are NOT recomputed
       until the commit apply — the on-map metric overlay deliberately
       keeps showing the baked numbers during preview.
       Divergence from the baked result, exactly: positions do not
       move in preview, while the commit re-solve feeds the new icon
       radius (hub radius = icon diameter x fontScale / 2) into its
       spacing/collision fit, so bigger icons push siblings apart,
       change fan angles and move clouds where the preview simply
       overlaps them. Label and rating-control anchors stay stale
       (the bake re-anchors them to the new hub radius). The frame
       stays stale (the bake re-fits; a large preview can overflow
       the viewport the bake would have re-fitted). What IS exact in
       preview is the icon glyph diameter itself — it scales by
       precisely the font ratio — which is the quantity the icon-law
       trial judges. Spoke starts do not move in preview and do not
       move on a font bake either: spoke start radius scales with
       the CENTER knob, not font.
       On release (the range's change event, also fired by the
       number input's explicit commit) the preview clears and ONE
       commit runs the existing apply() path untouched, Q6 overlay
       and map-complete gate included. Commits coalesce: a commit
       requested while one is in flight only records the latest
       value, and runs when the in-flight commit's overlay session
       ends — applies never stack.
       Icon-law trial: the pop's "Scale icons by: Font | Center"
       toggle steers the preview's icon factor only (Font: icons
       track this knob — the ruled law; Center: icons track the
       center knob, i.e. hold their size while this knob moves).
       It writes no setting and no data; the commit always applies
       the ruled (font) law through the existing path. */
    var fontPv={active:false,base:3,centerBase:3,source:"center",icons:[],labels:[],inFlight:false,pending:null,watchTimer:0,watchTicks:0};
    function fontPvBadge(show){var b=document.getElementById("layoutFontPreviewBadge");if(b)b.hidden=!show}
    function fontPvCapture(){
      fontPv.icons=[];fontPv.labels=[];
      var svg=document.getElementById("mapSvg");if(!svg)return;
      Array.prototype.forEach.call(svg.querySelectorAll(".node-group > .branch-icon, .node-group > .topic-icon"),function(el){
        var dia=Number(el.getAttribute("data-diameter")),orig=el.getAttribute("transform");
        if(!(dia>0)||!orig)return;
        var m=/^translate\(\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)\s*\)$/.exec(orig);
        if(!m)return;
        var r=dia/2;
        fontPv.icons.push({el:el,orig:orig,cx:Number(m[1])+r,cy:Number(m[2])+r,r:r});
      });
      Array.prototype.forEach.call(svg.querySelectorAll(".category-label, .map-label"),function(el){
        fontPv.labels.push({el:el,t:el.style.transform||"",b:el.style.transformBox||"",o:el.style.transformOrigin||""});
        el.style.transformBox="fill-box";el.style.transformOrigin="center";
      });
    }
    function fontPvPaint(v){
      var ratio=v/fontPv.base,i,it;
      var iconK=fontPv.source==="center"?(Number(config().centerRingScale)||fontPv.centerBase)/fontPv.centerBase:ratio;
      for(i=0;i<fontPv.icons.length;i++){it=fontPv.icons[i];it.el.setAttribute("transform","translate("+(it.cx-iconK*it.r).toFixed(2)+" "+(it.cy-iconK*it.r).toFixed(2)+") scale("+iconK+")")}
      for(i=0;i<fontPv.labels.length;i++)fontPv.labels[i].el.style.transform="scale("+ratio+")";
    }
    function fontPvClear(){
      var i,it;
      for(i=0;i<fontPv.icons.length;i++){it=fontPv.icons[i];try{it.el.setAttribute("transform",it.orig)}catch(e){}}
      for(i=0;i<fontPv.labels.length;i++){it=fontPv.labels[i];it.el.style.transform=it.t;it.el.style.transformBox=it.b;it.el.style.transformOrigin=it.o}
      fontPv.icons=[];fontPv.labels=[];fontPv.active=false;fontPvBadge(false);
    }
    function fontPvStep(v){
      if(!fontPv.active){fontPv.base=Number(config().fontScale)||3;fontPv.centerBase=Number(config().centerRingScale)||3;fontPvCapture();fontPv.active=true;fontPvBadge(true)}
      fontPvPaint(v);
    }
    function fontCommitDone(){
      fontPv.inFlight=false;
      if(fontPv.watchTimer){clearInterval(fontPv.watchTimer);fontPv.watchTimer=0}
      var p=fontPv.pending;fontPv.pending=null;
      if(p===null)return;
      var range=document.getElementById(ids.fontScale);
      if(range)range.value=String(p);
      fontCommitRun();
    }
    function fontCommitWatch(){
      // In flight until the commit's Q6 overlay session ends
      // (overlay hidden again — dismissal is gated on map-complete).
      // An apply that never armed finished synchronously inside
      // apply(), so the first tick already sees the overlay hidden.
      // The 120 s cap keeps a stuck session from wedging the knob.
      if(fontPv.watchTimer)clearInterval(fontPv.watchTimer);
      fontPv.watchTicks=0;
      fontPv.watchTimer=setInterval(function(){
        fontPv.watchTicks++;
        var ov=document.getElementById("mapLoadOverlay");
        if(!ov||ov.hidden||fontPv.watchTicks>480)fontCommitDone();
      },250);
    }
    function fontCommitRun(){
      fontPv.inFlight=true;
      try{apply(collect())}catch(e){__sxErrLog("layout-font-preview-commit",e)}
      fontCommitWatch();
    }
    function fontCommit(v){
      if(fontPv.active)fontPvClear();
      if(fontPv.inFlight){fontPv.pending=v;return}
      fontCommitRun();
    }
    (function(){
      var range=document.getElementById(ids.fontScale);if(!range)return;
      var frame=0,lastV=null;
      range.addEventListener("input",function(){
        lastV=Number(range.value)||1;
        var out=document.getElementById("layoutFontScaleValue");
        if(out)out.textContent=lastV.toFixed(2)+"×";
        var num=document.getElementById("layoutFontScaleNum");
        if(num&&document.activeElement!==num)num.value=String(lastV);
        if(frame)return;
        frame=requestAnimationFrame(function(){frame=0;if(lastV!==null)fontPvStep(lastV)});
      });
      range.addEventListener("change",function(){
        if(frame){cancelAnimationFrame(frame);frame=0}
        lastV=null;
        var out=document.getElementById("layoutFontScaleValue");
        if(out)out.textContent=(Number(range.value)||1).toFixed(2)+"×";
        fontCommit(Number(range.value)||1);
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-font-icon-law]"),function(btn){
        btn.addEventListener("click",function(){
          var src=btn.getAttribute("data-font-icon-law")==="center"?"center":"font";
          if(src===fontPv.source)return;
          fontPv.source=src;
          Array.prototype.forEach.call(document.querySelectorAll("[data-font-icon-law]"),function(b){var on=b===btn;b.classList.toggle("is-on",on);b.setAttribute("aria-pressed",String(on))});
          if(fontPv.active){var v=Number(range.value);if(Number.isFinite(v))fontPvPaint(v)}
        });
      });
    })();
    var layoutFontScaleNumEl=document.getElementById("layoutFontScaleNum");if(layoutFontScaleNumEl){var commitFontScaleNum=function(){var range=document.getElementById(ids.fontScale);if(!range)return;var v=Number(layoutFontScaleNumEl.value);if(!Number.isFinite(v)){layoutFontScaleNumEl.value=range.value;return}v=Math.min(Number(range.max)||3,Math.max(Number(range.min)||.5,v));range.value=String(v);layoutFontScaleNumEl.value=String(v);range.dispatchEvent(new Event("input",{bubbles:true}));range.dispatchEvent(new Event("change",{bubbles:true}))};layoutFontScaleNumEl.addEventListener("change",commitFontScaleNum);layoutFontScaleNumEl.addEventListener("keydown",function(event){if(event.key==="Enter"){event.preventDefault();commitFontScaleNum()}})}
    coalesceSlider(document.getElementById(ids.centerRingScale),function(){var v=Number(this.value)||1,out=document.getElementById("layoutCenterRingScaleValue");if(out)out.textContent=v.toFixed(2)+"×";apply(collect());this.value=String(v);if(out)out.textContent=v.toFixed(2)+"×";scheduleMetric()});
    // % spoke length of node name (was % kink leaf overgrowth):
    // one percent of the node name's length drives BOTH the Anneal
    // throw's leaf length and what Autofit delivers. 100% is the minimum
    // and default, framing the node label cleanly with standard hub and
    // leaf badge clearance.
    coalesceSlider(document.getElementById(ids.leafOvergrowth),function(){var v=Math.max(100,Number(this.value)||100),out=document.getElementById("layoutLeafOvergrowthValue");if(out)out.textContent=Math.round(v)+"%";var num=document.getElementById("layoutLeafOvergrowthNum");if(num&&document.activeElement!==num)num.value=String(v);apply(collect());this.value=String(v);if(out)out.textContent=Math.round(v)+"%";scheduleMetric()});
    var layoutLeafOvergrowthNumEl=document.getElementById("layoutLeafOvergrowthNum");if(layoutLeafOvergrowthNumEl){var commitLeafOvergrowthNum=function(){var range=document.getElementById(ids.leafOvergrowth);if(!range)return;var v=Number(layoutLeafOvergrowthNumEl.value);if(!Number.isFinite(v)){layoutLeafOvergrowthNumEl.value=range.value;return}v=Math.min(Number(range.max)||500,Math.max(Number(range.min)||100,v));range.value=String(v);layoutLeafOvergrowthNumEl.value=String(v);range.dispatchEvent(new Event("input",{bubbles:true}));range.dispatchEvent(new Event("change",{bubbles:true}))};layoutLeafOvergrowthNumEl.addEventListener("change",commitLeafOvergrowthNum);layoutLeafOvergrowthNumEl.addEventListener("keydown",function(event){if(event.key==="Enter"){event.preventDefault();commitLeafOvergrowthNum()}})}
    // Bidirectional selection sync (Build 2026-10-18_1401): picking a
    // branch, subcategory, or kink in the Advanced selects also selects
    // that branch on the map (the reverse of map spoke taps following
    // into these selects via selectNode). Programmatic pre-selection
    // from the map sets .value directly and fires no change event, so
    // this cannot loop.
    // Deselect/back (Build 2026-10-19_0543): the one clear path for the
    // editor side. Resets the three Advanced selects (which disables
    // their sliders via the sync functions), forgets the focused node so
    // re-selecting the same spoke re-focuses, and clears the map's
    // selection through the API. Returns whether anything was selected,
    // so Escape can act as Back: clear first, close only when clear.
    // The bundle calls this (via __SEXCAPADES_LAYOUT_UI.clearSelection)
    // when an empty-space tap on the map deselects, keeping both sides
    // in the same state.
    function clearSelectionUI(){var had=lastFocusKey!==null||pendingFocusKey!==null;pendingFocusKey=null;["layoutBranch","layoutSubcat","layoutKink"].forEach(function(id){var sel=document.getElementById(id);if(sel&&sel.value){sel.value="";had=true}});var c=config();syncBranch(c);syncKink(c);syncSubcatAngle(c);lastFocusKey=null;try{var api=window.__SEXCAPADES_LAYOUT_API;if(api&&api.clearSelection&&api.clearSelection())had=true}catch(e){__sxErrLog("layout-clear-selection",e)}return had}
    function selectOnMap(value){try{var api=window.__SEXCAPADES_LAYOUT_API;if(!api)return;if(!value){if(api.clearSelection)api.clearSelection();return}if(api.selectNode)api.selectNode(value)}catch (e) { __sxErrLog("layout-select", e); }}
    document.getElementById("layoutBranch").addEventListener("change",function(){syncBranch(config());setAnnealChecklistBranch(this.value);selectOnMap(this.value)});
    // Scoped routing helpers (Stage 3, T5): the eleven handlers
    // below commit through API.applyScoped with target = the
    // single branch the op belongs to (the scoped solve's
    // granularity is the branch, so subcategory and topic ops
    // resolve their containing branch), policy "contained", and opClass = the
    // handler's own name. (Ring retired, ruled 2026-11-01
    // 01:52, Jason: the bundle's scoped solve no longer
    // computes or honours a ring — every branch but the target,
    // nearest neighbours included, is frozen; the ring code is
    // commented out in the bundle, not deleted.)
    // The state patch each handler builds is
    // unchanged — identical keys and values to the pre-T5 write
    // set. If a branch cannot be resolved, scopedScope returns
    // null and apply() takes the ordinary full path, exactly as
    // before T5.
    function scopedScope(opClass,branch){return branch?{target:[branch],policy:"contained",opClass:opClass}:null}
    function branchOfSubcat(label){var tax=taxonomy();if(tax&&tax.categories)for(var i=0;i<tax.categories.length;i++){var subs=tax.categories[i].subcategories||[];for(var j=0;j<subs.length;j++)if(subs[j].name===label)return tax.categories[i].name}return null}
    function branchOfKink(id){var e=topicEntry(id);return e&&e.category?e.category:null}
    // F1 (layout-editor refactor): ONE table-driven actuator for all 13
    // single-item controls. Each LR_ACT row carries that control's own
    // selection element, value element, readout element, override store,
    // scope resolution, divert level (F2) and its own prepare/mutate/
    // resync steps, copied verbatim from the per-control functions this
    // table replaces — value transforms, clamping and readout formats
    // are deliberately NOT unified across controls. The old function
    // names survive below and at their original sites as thin wrappers
    // delegating here, so every existing call site is untouched.
    // SOLVER-METRICS REFACTOR (F6): ONE parameterized actuator factory
    // for all four self-shrink switch kinds (kind x scope). Every
    // shrink switch writes the ONE tri-state type — explicit true =
    // armed, explicit false = veto, absent = follow the global
    // collision mode — which the bundle reads through its single
    // reader (sxShrinkState). The four LR_ACT shrink entries below
    // are generated by this factory; they were four near-identical
    // hand-written entries. Behavior-preserving unification only:
    // the known flip-but-move-nothing switch defect is a SEPARATE
    // fix job (Group 3d), not diagnosed or fixed here — this
    // unification exists so that fix lands in one place.
    function lrShrinkActuator(kind){
      var branchKind=kind.scope==="branch";
      return {divert:kind.divert,
        guard:function(){var name=document.getElementById(branchKind?"layoutBranch":"layoutSubcat").value;if(!name)return null;return{name:name}},
        prepStores:function(next){next[kind.map]=Object.assign({},next[kind.map]||{})},
        mutate:function(next,c){if(document.getElementById(kind.checkbox).checked){next[kind.map][c.name]=true}else{next[kind.map][c.name]=false}},
        applyMsg:kind.msg,
        scope:function(c){return scopedScope(kind.scopeName,branchKind?c.name:branchOfSubcat(c.name))},
        metric:false};
    }
    var LR_ACT={
      spokeAngle:{divert:null,
        guard:function(a,b){if(!a)return null;return{name:a,value:b}},
        read:function(c){var sOut=document.getElementById("layoutSpokeAngleValue-"+spokeSlug(c.name));if(sOut)sOut.textContent=Math.max(-20,Math.min(20,Number(c.value)||0)).toFixed(0)+"°";c.sOut=sOut},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{angle:Math.max(-20,Math.min(20,Number(c.value)||0))},c.name)},
        applyMsg:"Branch override updated",
        scope:function(c){return scopedScope("applySpokeAngle",c.name)},
        resync:function(next,c){var sRange=document.getElementById("layoutSpokeAngle-"+spokeSlug(c.name));if(sRange)sRange.value=String(next.branchOverrides[c.name].angle);if(c.sOut)c.sOut.textContent=Number(next.branchOverrides[c.name].angle).toFixed(0)+"°"},
        metric:true},
      branchLen:{divert:null,
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var base=bakedBranchBase(c.name),abs=relClamp(document.getElementById("layoutBranchLen").value)*base,lenOut=document.getElementById("layoutBranchLenValue");if(lenOut)lenOut.textContent=fmtLen(abs);c.base=base;c.abs=abs;c.lenOut=lenOut},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{length:c.abs},c.name)},
        applyMsg:"Branch override updated",
        scope:function(c){return scopedScope("applyBranchLen",c.name)},
        resync:function(next,c){var lenEl=document.getElementById("layoutBranchLen");if(lenEl)lenEl.value=String(relClamp(next.branchOverrides[c.name].length/c.base));if(c.lenOut)c.lenOut.textContent=fmtLen(next.branchOverrides[c.name].length)},
        metric:true},
      branchAngle:{divert:null,
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var angOut=document.getElementById("layoutBranchAngleValue");if(angOut)angOut.textContent=Number(document.getElementById("layoutBranchAngle").value).toFixed(0)+"°";c.angOut=angOut},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{angle:Number(document.getElementById("layoutBranchAngle").value)},c.name)},
        applyMsg:"Branch override updated",
        scope:function(c){return scopedScope("applyBranchAngle",c.name)},
        resync:function(next,c){var angEl=document.getElementById("layoutBranchAngle");if(angEl)angEl.value=String(next.branchOverrides[c.name].angle);if(c.angOut)c.angOut.textContent=Number(next.branchOverrides[c.name].angle).toFixed(0)+"°"},
        metric:true},
      branchSpokeAutoShrink:lrShrinkActuator({scope:"branch",map:"branchSpokeAutoShrink",checkbox:"layoutBranchSpokeAutoShrink",divert:null,msg:"Branch spoke auto-shrink updated",scopeName:"applyBranchSpokeAutoShrink"}),
      branchSubLen:{divert:["branch","subs","branchSubLen"],
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var v=Number(document.getElementById("layoutBranchSubLen").value)||1,out=document.getElementById("layoutBranchSubLenValue");if(out)out.textContent=v.toFixed(2)+"×";c.v=v;c.out=out},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{subScale:c.v},c.name);branchMembers(c.name).subs.forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{length:bakedSubBase(s,"length")*c.v})})},
        applyMsg:"Branch subcategory spokes updated",
        scope:function(c){return scopedScope("applyBranchSubLen",c.name)},
        resync:function(next,c){var el=document.getElementById("layoutBranchSubLen");if(el)el.value=String(c.v);if(c.out)c.out.textContent=c.v.toFixed(2)+"×"},
        metric:true},
      branchKinkLen:{divert:["branch","kinks","branchKinkLen"],
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var v=Number(document.getElementById("layoutBranchKinkLen").value)||1,out=document.getElementById("layoutBranchKinkLenValue");if(out)out.textContent=v.toFixed(2)+"×";c.v=v;c.out=out},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.kinkOverrides=copyOverrides(next.kinkOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{kinkScale:c.v},c.name);var members=branchMembers(c.name),cloudSubs={};members.kinks.forEach(function(e){if(e.subcategory){cloudSubs[e.subcategory]=true}else{next.kinkOverrides[e.id]=kinkOverrideEntry(bakedKinkBase(e.id)*c.v)}});Object.keys(cloudSubs).forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{cloud:bakedSubBase(s,"cloud")*c.v})})},
        applyMsg:"Branch kink spokes updated",
        scope:function(c){return scopedScope("applyBranchKinkLen",c.name)},
        resync:function(next,c){var el=document.getElementById("layoutBranchKinkLen");if(el)el.value=String(c.v);if(c.out)c.out.textContent=c.v.toFixed(2)+"×"},
        metric:true},
      kinkLen:{divert:["kink","kinks","kinkLen"],
        guard:function(){var id=document.getElementById("layoutKink").value;if(!id)return null;return{id:id}},
        read:function(c){var base=bakedKinkBase(c.id),abs=relClamp(document.getElementById("layoutKinkLen").value)*base,lenOut=document.getElementById("layoutKinkLenValue");if(lenOut)lenOut.textContent=fmtLen(abs);c.base=base;c.abs=abs;c.lenOut=lenOut},
        prepStores:function(next){next.kinkOverrides=copyOverrides(next.kinkOverrides)},
        mutate:function(next,c){next.kinkOverrides[c.id]=kinkOverrideEntry(c.abs)},
        applyMsg:"Topic override updated",
        scope:function(c){return scopedScope("applyKink",branchOfKink(c.id))},
        resync:function(next,c){var lenEl=document.getElementById("layoutKinkLen");if(lenEl)lenEl.value=String(relClamp(next.kinkOverrides[c.id].length/c.base));if(c.lenOut)c.lenOut.textContent=fmtLen(next.kinkOverrides[c.id].length)},
        metric:true},
      kinkAngle:{divert:["kink","kinks","kinkAngle"],
        guard:function(){var id=document.getElementById("layoutKink").value;if(!id)return null;return{id:id}},
        read:function(c){var angOut=document.getElementById("layoutKinkAngleValue");if(angOut)angOut.textContent=Number(document.getElementById("layoutKinkAngle").value).toFixed(1)+"°";c.angOut=angOut},
        prepStores:function(next){next.kinkAngleOffsets=copyOverrides(next.kinkAngleOffsets)},
        mutate:function(next,c){var av=Number(document.getElementById("layoutKinkAngle").value);c.av=av;setAngleOffset(next.kinkAngleOffsets,c.id,av)},
        applyMsg:"Topic angle updated",
        scope:function(c){return scopedScope("applyKinkAngle",branchOfKink(c.id))},
        resync:function(next,c){var angEl=document.getElementById("layoutKinkAngle");if(angEl)angEl.value=String(c.av);if(c.angOut)c.angOut.textContent=Number(c.av).toFixed(1)+"°"},
        metric:true},
      subcatLen:{divert:["subcat","subs","subcatLen"],
        guard:function(){var name=document.getElementById("layoutSubcat").value;if(!name)return null;return{name:name}},
        read:function(c){var base=bakedSubBase(c.name,"length"),abs=relClamp(document.getElementById("layoutSubcatLen").value)*base,lenOut=document.getElementById("layoutSubcatLenValue");if(lenOut)lenOut.textContent=fmtLen(abs);c.base=base;c.abs=abs;c.lenOut=lenOut},
        prepStores:function(next){next.subcatOverrides=copyOverrides(next.subcatOverrides)},
        mutate:function(next,c){next.subcatOverrides[c.name]=subcatOverrideEntry(next.subcatOverrides[c.name],{length:c.abs})},
        applyMsg:"Subcategory override updated",
        scope:function(c){return scopedScope("applySubcatLen",branchOfSubcat(c.name))},
        resync:function(next,c){var lenEl=document.getElementById("layoutSubcatLen");if(lenEl)lenEl.value=String(relClamp(next.subcatOverrides[c.name].length/c.base));if(c.lenOut)c.lenOut.textContent=fmtLen(next.subcatOverrides[c.name].length)},
        metric:true},
      subcatAngle:{divert:["subcat","subs","subcatAngle"],
        guard:function(){var name=document.getElementById("layoutSubcat").value;if(!name)return null;return{name:name}},
        read:function(c){var angOut=document.getElementById("layoutSubcatAngleValue");if(angOut)angOut.textContent=Number(document.getElementById("layoutSubcatAngle").value).toFixed(1)+"°";c.angOut=angOut},
        prepStores:function(next){next.subcatAngleOffsets=copyOverrides(next.subcatAngleOffsets)},
        mutate:function(next,c){var av=Number(document.getElementById("layoutSubcatAngle").value);c.av=av;setAngleOffset(next.subcatAngleOffsets,c.name,av)},
        applyMsg:"Subcategory angle updated",
        scope:function(c){return scopedScope("applySubcatAngle",branchOfSubcat(c.name))},
        resync:function(next,c){var angEl=document.getElementById("layoutSubcatAngle");if(angEl)angEl.value=String(c.av);if(c.angOut)c.angOut.textContent=Number(c.av).toFixed(1)+"°"},
        metric:true},
      subcatSpokeAutoShrink:lrShrinkActuator({scope:"subcat",map:"subcatSpokeAutoShrink",checkbox:"layoutSubcatSpokeAutoShrink",divert:["subcat","subs","subcatSpokeAutoShrink"],msg:"Subcategory spoke auto-shrink updated",scopeName:"applySubcatSpokeAutoShrink"})
    };
    // The one actuator: guard on selection, consult live level state
    // for the apply-to-all divert (F2), read + preview the value, then
    // collect, copy the control's stores, mutate one field, run the
    // central apply(), re-sync the control, and re-measure where the
    // original control did.
    function lrActuate(d,a,b){
      var c=d.guard(a,b);if(!c)return;
      if(d.divert&&lrG3Divert(d.divert[0],d.divert[1],d.divert[2]))return;
      if(d.read)d.read(c);
      var next=collect();d.prepStores(next);d.mutate(next,c);
      apply(next,d.applyMsg,d.scope(c));
      if(d.resync)d.resync(next,c);
      if(d.metric)scheduleMetric();
    }
    function applyBranchLen(){lrActuate(LR_ACT.branchLen)}
    function applyBranchAngle(){lrActuate(LR_ACT.branchAngle)}
    // G3d completion (Group 4): the four auto-shrink toggles now
    // DISPLAY armed state only — checked exactly when the group's
    // map value is explicit true. A group whose saved state lacks
    // the key (or holds false) shows unticked, so the FIRST click to
    // ON writes explicit true and engages the shrink in one click;
    // previously absence displayed as ticked, so the first click
    // only wrote false and a second OFF->ON flip was needed to arm.
    // Boot geometry is unchanged: no state is written until a click.
    // Auto-shrink arming (Group 3d, Build 2026-10-20_0814; compaction
    // factors added Build 2026-10-20_0853): switching a group's
    // auto-shrink ON now stores an explicit true instead of deleting
    // the entry. The layout engine treats an explicit true as armed:
    // the layout stage applies the shrink-mode compaction factor to
    // that group (clouds 0.74x, spokes 0.76x) in ANY collision mode —
    // so switching on visibly shrinks that cloud on the spot — and the
    // group's shrink moves also stay available in Grow-only mode,
    // whose candidate filter otherwise discards every shrink move
    // before the per-group gates are consulted (which left all four
    // auto-shrink toggles inert at the shipped defaults). false still
    // forbids shrink outright and drops the factor; an untouched
    // group (no entry) keeps following the global collision mode
    // exactly as before.
    // Shrink-cluster busy signal (S3): a click in this cluster used
    // to block for seconds in the synchronous scoped solve with no
    // feedback at all — the check painted only when the handler
    // finally returned. shrinkBusy paints the busy state FIRST:
    // aria-busy="true" on the layout editor region, a progress
    // cursor, and a working state on the toggled control, with the
    // control's pre-click face restored so the new check lands with
    // the work, not with the click. It then yields two animation
    // frames so that state actually renders, and only then runs the
    // unchanged handler; the busy state clears when the solve
    // completes. The solve itself and its results are untouched.
    function shrinkBusy(inputEl,fn){
      return new Promise(function(resolve){
        var region=document.getElementById("layoutEditor");
        var label=inputEl&&inputEl.closest?inputEl.closest("label"):null;
        var target=inputEl?inputEl.checked:null;
        if(inputEl)inputEl.checked=!target;
        if(region)region.setAttribute("aria-busy","true");
        document.documentElement.classList.add("shrink-busy");
        if(label)label.classList.add("is-busy");
        function run(){
          if(inputEl)inputEl.checked=target;
          try{fn()}catch(e){__sxErrLog("shrink-busy",e)}
          if(region)region.removeAttribute("aria-busy");
          document.documentElement.classList.remove("shrink-busy");
          if(label)label.classList.remove("is-busy");
          resolve();
        }
        if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(run,0)})});
        else setTimeout(run,0);
      });
    }
    // Settle honesty (S6): a scoped apply paints at once, but the
    // deferred whole-map settle lands ~20 s later, when the
    // bundle's blit rest-timer ends the session and forces a full
    // repaint — after which displayed values can change. This is
    // presentation only: the shell watches the bundle's own
    // blit-session log entries (a "start" means a settle is owed,
    // the matching "end" means it has landed) and shows
    // "settling…" in the layout status area until it lands. The
    // settle itself is never retimed, triggered, or skipped here.
    var settlePending=false,settleTimer=null,settleArmDeadline=0,dkReceipt=null;
    function blitSessionActive(){
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.log!=="function")return null;
      var log;try{log=dk.log()}catch(e){return null}
      var active=null;
      for(var i=0;i<log.length;i++){var en=log[i];if(en&&en.type==="blit-session")active=en.event==="start"}
      return active;
    }
    function renderSettleUI(){
      var el=document.getElementById("layoutSettleStatus");
      if(el){el.hidden=!settlePending;if(settlePending)el.textContent="settling…"}
      if(dkReceipt)renderDkReceipt();
    }
    function onSettleLanded(){
      scheduleMetric();
      autofitOnSettleLanded();
      if(dkReceipt&&dkReceipt.awaitingSettle){
        dkReceipt.awaitingSettle=false;
        var rc=dkReceipt,api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
        try{var lg=dk&&typeof dk.log==="function"?dk.log():null;if(lg)for(var li=lg.length-1;li>=0;li--){var le=lg[li];if(le&&le.type==="anneal-settle"){rc.anneal={E_start:le.E_start,E_end:le.E_end,sweeps:le.sweeps,uphill_count:le.uphill_count};break}}}catch(e){}
        if(dk&&typeof dk.measureCloud==="function"&&rc.before!=null){
          dk.measureCloud(rc.name).then(function(v){
            if(dkReceipt!==rc)return;
            if(v!=null&&Number.isFinite(Number(v))){rc.after=Number(v);rc.delta=rc.after-rc.before}
            // (The post-settle area re-measure was removed with the
            // area observation, M1 2026-10-29; its commented-out copy
            // was deleted 2026-10-30 — see the bundle's removal record
            // at measureCloud. The receipt below re-renders from the
            // crossing values only.)
            if (rc.startedAtMs) rc.elapsed = ((Date.now()-rc.startedAtMs)/1000).toFixed(1)+" s";
            renderDkReceipt();
          },function(){renderDkReceipt()});
        }else renderDkReceipt();
      }
    }
    function settleTick(){
      var active=blitSessionActive();
      if(active===true){
        if(dkReceipt&&dkReceipt.fresh){dkReceipt.awaitingSettle=true;dkReceipt.fresh=false}
        if(!settlePending){settlePending=true;renderSettleUI()}
        return;
      }
      if(settlePending){settlePending=false;renderSettleUI();onSettleLanded();stopSettleWatch();return}
      if(Date.now()>settleArmDeadline){if(dkReceipt)dkReceipt.fresh=false;autofitDismissUnlanded();stopSettleWatch()}
    }
    function stopSettleWatch(){if(settleTimer){clearInterval(settleTimer);settleTimer=null}}
    function noteSettlePending(){
      settleArmDeadline=Date.now()+3000;
      if(!settleTimer)settleTimer=setInterval(settleTick,400);
      settleTick();
    }
    // F6: ONE parameterized change handler for the four self-shrink
    // switches — kind x scope is carried by each call's actuator.
    function bindShrinkSwitch(checkboxId,applyFn){var el=document.getElementById(checkboxId);if(el)el.addEventListener("change",function(){shrinkBusy(this,applyFn).then(noteSettlePending)})}
    function applyBranchSpokeAutoShrink(){lrActuate(LR_ACT.branchSpokeAutoShrink)}
    coalesceSlider(document.getElementById("layoutBranchLen"),applyBranchLen);coalesceSlider(document.getElementById("layoutBranchAngle"),applyBranchAngle);
    function applyBranchSubLen(){lrActuate(LR_ACT.branchSubLen)}
    function applyBranchKinkLen(){lrActuate(LR_ACT.branchKinkLen)}
    coalesceSlider(document.getElementById("layoutBranchSubLen"),applyBranchSubLen);coalesceSlider(document.getElementById("layoutBranchKinkLen"),applyBranchKinkLen);bindShrinkSwitch("layoutBranchSpokeAutoShrink",applyBranchSpokeAutoShrink);document.getElementById("layoutKink").addEventListener("change",function(){syncKink(config());selectOnMap(this.value)});function applyKink(){lrActuate(LR_ACT.kinkLen)}
    function applyKinkAngle(){lrActuate(LR_ACT.kinkAngle)}
    function applySubcatAngle(){lrActuate(LR_ACT.subcatAngle)}
    // Per-subcategory line length (Batch F, Build 2026-10-20_0135):
    // the same relative pattern Batch A set for per-topic length —
    // the slider carries a multiple of the subcategory's shipped
    // tuned length (1.00x = tuned, range 0.25x-2x), the stored value
    // in subcatOverrides[name].length stays absolute, the readout
    // shows the true absolute value, and the entry's other fields
    // (e.g. cloud) are preserved.
    function applySubcatLen(){lrActuate(LR_ACT.subcatLen)}
    coalesceSlider(document.getElementById("layoutSubcatLen"),applySubcatLen);
    coalesceSlider(document.getElementById("layoutKinkLen"),applyKink);
    coalesceSlider(document.getElementById("layoutKinkAngle"),applyKinkAngle);
    function applySubcatSpokeAutoShrink(){lrActuate(LR_ACT.subcatSpokeAutoShrink)}
    coalesceSlider(document.getElementById("layoutSubcatAngle"),applySubcatAngle);bindShrinkSwitch("layoutSubcatSpokeAutoShrink",applySubcatSpokeAutoShrink);
    // AUTOFIT (Group 3d — ruled 2026-10-28: one-shot BUTTON named
    // Autofit, never a toggle; FITS both directions; scope = the
    // selected branch, else the owning branch of the selected
    // sub-group (Q1 — never a surprise whole-map run), else the
    // whole map). The fit itself is computed by the bundle driver
    // (deknotter.computeAutofitPatch — the shrinkKinksToLabel driver
    // pattern, both directions), accumulated as ONE kink-overrides
    // map and landed through the central apply() exactly once, with
    // applyBusyBtn set so the #9 paintbrush pill and the button mark
    // ride the apply. NO armed flag is read or written (the toggle
    // machinery is not used), NO arm box diverts the press, and
    // nothing re-runs on later builds: a re-press is a fresh press
    // that recomputes from the current rendered state. Settle
    // survival is MEASURED, not assumed: when the deferred settle
    // lands, the fitted spokes are re-measured; drift beyond the fit
    // epsilon earns exactly ONE re-fit computed from the settled
    // state, and the second landing only reports.
    var autofitRunning=false,autofitSettleJob=null,autofitBusyTimer=null,autofitJobWatchTimer=null;
    function autofitStatus(msg){var el=document.getElementById("layoutAutofitStatus");if(!el)return;el.hidden=!msg;el.textContent=msg||""}
    // SETTLING ORPHAN — Shape A (ruled 2026-10-29, one job with the
    // overlay gate failsafe): when a settle wait dismisses WITHOUT a
    // landing — the shell watch expiring at its unchanged 3000 ms
    // deadline with no blit session seen active-then-inactive, or
    // the overlay gate's 120 s failsafe — the pending Autofit job is
    // CLOSED here: the job is dropped, the status is rewritten to
    // say the settle did not land (never cleared as if a landing had
    // happened, never "held through the settle"), and no stale
    // re-fit can run later, because autofitOnSettleLanded() returns
    // at once when no job is open. Drift stays drifted until the
    // user presses Autofit again.
    function autofitDismissUnlanded(){
      if(!autofitSettleJob)return false;
      // Only a job actually awaiting a re-check has a pending
      // status to rewrite: a nothing-moved press already reported
      // its completed "already fits" verdict at press time, and
      // overwriting that with a did-not-land message would be its
      // own false claim. Such a job still closes here, silently.
      var awaiting=!!(autofitSettleJob.awaitingRecheck||autofitSettleJob.refitUsed);
      autofitSettleJob=null;
      if(window.__sxAutofitLast)window.__sxAutofitLast.settled={checked:0,drifted:0,unlanded:true};
      if(awaiting)autofitStatus("Autofit: the settle did not land, so the fit was not re-checked. Press Autofit again to re-check the fit.");
      return true;
    }
    // Gate-failsafe entry point: the overlay gate calls this hook
    // from endFinish() on a failsafe dismiss (see the gate's
    // SETTLING FAILSAFE note). The Autofit BUTTON needs no change
    // for that path, by design: the press rides the central apply()
    // with applyBusyBtn set, so the gate's sessionOnDone clears the
    // button's busy mark (and finishes the #9 pill) on ANY
    // endFinish() dismiss, failsafe included; and autofitWatchBusy
    // independently clears the busy mark once the overlay hides
    // (its 250 ms poll, with its own unchanged 480-tick / 120 s
    // cap). Only the job + status surface needed this hook.
    window.__sxAutofitOnGateDismiss=function(){autofitDismissUnlanded()};
    // JOB WATCHDOG (same job, same Shape A, the brief's 120 s
    // bound): the two dismiss paths above still leave one live
    // configuration uncovered — observed twice in probe drives
    // (2026-10-29): the shell watch SEES a blit session and waits
    // for it to end, but in Repulsion a session ends only on a
    // later paint, while the overlay gate's separate session
    // signal has already landed, so neither the shell expiry
    // (unreachable while a session is pending) nor the gate
    // failsafe (gate not stuck) ever fires, and "Checking…" hangs
    // past 130 s. This watchdog belongs to the Autofit job alone:
    // if the job is still open 120 s after the press — the bound
    // ruling 4 sets for this job's surfaces — it closes under
    // Shape A via autofitDismissUnlanded(). It does not touch the
    // shared shell watch (metrics and the anneal receipt keep
    // their exact behaviour), no settling threshold, and no
    // session mechanism; it only stops polling once the job has
    // closed by any path.
    function autofitArmJobWatch(job){
      if(autofitJobWatchTimer)clearInterval(autofitJobWatchTimer);
      autofitJobWatchTimer=setInterval(function(){
        if(autofitSettleJob!==job){clearInterval(autofitJobWatchTimer);autofitJobWatchTimer=null;return}
        if(Date.now()-(job.createdAt||0)>=120000){clearInterval(autofitJobWatchTimer);autofitJobWatchTimer=null;autofitDismissUnlanded()}
      },400);
    }
    function autofitScopeBranches(){
      var b=document.getElementById("layoutBranch"),bv=b?b.value:"";
      if(bv)return{branches:[bv],scoped:true,label:bv};
      var s=document.getElementById("layoutSubcat"),sv=s?s.value:"";
      if(sv){var ob=branchOfSubcat(sv);if(ob)return{branches:[ob],scoped:true,label:ob+" (the branch that owns "+sv+")"}}
      return{branches:branchNames(),scoped:false,label:"the whole map"};
    }
    function autofitClearBusy(btn){
      if(autofitBusyTimer){clearInterval(autofitBusyTimer);autofitBusyTimer=null}
      if(btn){btn.classList.remove("is-busy");btn.removeAttribute("aria-busy")}
      var region=document.getElementById("layoutEditor");if(region)region.removeAttribute("aria-busy");
      document.documentElement.classList.remove("shrink-busy");
      autofitRunning=false;
    }
    function autofitWatchBusy(btn){
      if(autofitBusyTimer)clearInterval(autofitBusyTimer);
      var ticks=0;
      autofitBusyTimer=setInterval(function(){
        ticks++;
        var ov=document.getElementById("mapLoadOverlay");
        if(!ov||ov.hidden||ticks>480)autofitClearBusy(btn);
      },250);
    }
    function autofitMeasureDrift(dk,branches,fittedKeys){
      var m=dk.autofitMeasure(branches),drifted=0,checked=0,maxDev=0;
      if(!m||!m.ok)return null;
      m.items.forEach(function(it){
        if(!fittedKeys[it.key])return;
        if(null==it.delivered||null==it.target||!(it.target>0))return;
        checked++;
        var dev=Math.abs(it.delivered-it.target)/it.target;
        if(dev>maxDev)maxDev=dev;
        if(dev>0.01)drifted++;
      });
      return{checked:checked,drifted:drifted,maxDev:maxDev};
    }
    function autofitApplyOnce(scope){
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.deknotter;
      var res=dk.computeAutofitPatch(scope.branches);
      if(!res||!res.ok){
        autofitStatus("Autofit could not run for "+scope.label+": "+((res&&res.reason)||"the fit driver is unavailable")+". Nothing was changed.");
        return null;
      }
      var next=collect();
      next.kinkOverrides=res.kinkOverrides;
      applyBusyBtn=document.getElementById("layoutAutofitBtn");
      apply(next,"Autofit: kink spokes fitted",scope.scoped?scopedScope("applyAutofit",scope.branches[0]):null);
      noteSettlePending();
      var fitted={};
      res.items.forEach(function(it){if(!it.held)fitted[it.key]=true});
      return{res:res,fitted:fitted};
    }
    function runAutofit(){
      if(autofitRunning)return;
      var btn=document.getElementById("layoutAutofitBtn");
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.deknotter;
      if(!dk||typeof dk.computeAutofitPatch!=="function"||typeof dk.autofitMeasure!=="function"){autofitStatus("Autofit is unavailable in this build — the fit driver did not load. Nothing was changed.");return}
      if(typeof dk.active==="function"&&dk.active()){autofitStatus("Autofit cannot run while an Anneal run is active. Nothing was changed.");return}
      var scope=autofitScopeBranches();
      if(!scope.branches.length){autofitStatus("Nothing to fit yet — no branches have rendered. Open the map first, then press Autofit.");return}
      autofitRunning=true;
      if(btn){btn.classList.add("is-busy");btn.setAttribute("aria-busy","true")}
      var region=document.getElementById("layoutEditor");if(region)region.setAttribute("aria-busy","true");
      document.documentElement.classList.add("shrink-busy");
      autofitStatus("");
      function run(){
        var started=Date.now(),out=null;
        try{out=autofitApplyOnce(scope)}catch(e){__sxErrLog("autofit",e);autofitStatus("Autofit hit an error while fitting — check the error log. The press was reported, not hidden.")}
        if(!out){autofitClearBusy(btn);return}
        var res=out.res,pressMs=Date.now()-started;
        autofitSettleJob={scope:scope,fitted:out.fitted,refitUsed:false,awaitingRecheck:(res.changed>0||Object.keys(out.fitted).length>0),createdAt:Date.now()};
        autofitArmJobWatch(autofitSettleJob);
        window.__sxAutofitLast={scope:scope.label,branches:scope.branches.slice(),changed:res.changed,shortened:res.shortened,lengthened:res.lengthened,held:res.held,skipped:res.skipped,items:res.items,pressMs:pressMs,settled:null};
        autofitStatus(res.changed?("Autofit fitted "+res.changed+" of "+(res.changed+res.held+res.skipped)+" kink spokes in "+scope.label+" — "+res.shortened+" shortened, "+res.lengthened+" lengthened. Checking the fit again once the map settles…"):("Autofit: every kink spoke in "+scope.label+" already fits ("+res.held+" checked). Nothing moved."));
        autofitWatchBusy(btn);
      }
      if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(run,0)})});
      else setTimeout(run,0);
    }
    // A landing whose re-measure yields no verdict (driver gone,
    // measure failed, or no fitted spoke could be re-measured —
    // observed live 2026-10-29: a whole-map press's job closed
    // silently here and the "Checking…" status hung past 130 s)
    // must not close silently either: a job that was awaiting a
    // re-check gets an honest no-verdict status, never a fake
    // "held" and never a hanging "Checking…".
    function autofitCloseUnverified(job){
      autofitSettleJob=null;
      if(job&&(job.awaitingRecheck||job.refitUsed))autofitStatus("Autofit: the map settled, but the fit could not be re-checked — no fitted spokes could be re-measured. Press Autofit again to re-check the fit.");
    }
    function autofitOnSettleLanded(){
      var job=autofitSettleJob;if(!job)return;
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.deknotter;
      if(!dk||typeof dk.autofitMeasure!=="function"){autofitCloseUnverified(job);return}
      var drift=null;
      try{drift=autofitMeasureDrift(dk,job.scope.branches,job.fitted)}catch(e){__sxErrLog("autofit-settle-measure",e)}
      if(window.__sxAutofitLast)window.__sxAutofitLast.settled=drift;
      if(!drift||!drift.checked){autofitCloseUnverified(job);return}
      if(drift.drifted&&!job.refitUsed){
        job.refitUsed=true;job.awaitingRecheck=true;
        autofitStatus("Autofit: the settle moved "+drift.drifted+" fitted spoke"+(drift.drifted===1?"":"s")+" off their fit lengths — re-fitting once from the settled map…");
        setTimeout(function(){
          if(autofitSettleJob!==job)return;
          var out=null;
          try{out=autofitApplyOnce(job.scope)}catch(e){__sxErrLog("autofit-refit",e)}
          if(out)job.fitted=out.fitted;else autofitCloseUnverified(job);
        },50);
        return;
      }
      autofitSettleJob=null;
      if(drift.drifted)autofitStatus("Autofit: after settling, "+drift.drifted+" of "+drift.checked+" fitted spokes sit off their fit lengths (worst "+(drift.maxDev*100).toFixed(1)+"% off). One automatic re-fit already ran; press Autofit again to re-fit from the current map.");
      else autofitStatus("Autofit held through the settle: all "+drift.checked+" fitted spokes in "+job.scope.label+" are still at their fit lengths.");
    }
    var autofitBtnEl=document.getElementById("layoutAutofitBtn");
    if(autofitBtnEl)autofitBtnEl.addEventListener("click",runAutofit);
    document.getElementById("layoutSubcat").addEventListener("change",function(){syncSubcatAngle(config());selectOnMap(this.value)});
    var spokeAnglesWrap=document.getElementById("layoutSpokeAngles");if(spokeAnglesWrap){var spokeFrame=0,spokePending=null;spokeAnglesWrap.addEventListener("input",function(event){var target=event.target;if(!target||(!target.hasAttribute("data-spoke-angle-range")&&!target.hasAttribute("data-spoke-angle-number")))return;var row=target.closest?target.closest("[data-spoke-angle-name]"):null;if(!row)return;spokePending={name:row.getAttribute("data-spoke-angle-name"),value:target.value};if(spokeFrame)return;spokeFrame=requestAnimationFrame(function(){spokeFrame=0;var p=spokePending;spokePending=null;if(p)applySpokeAngle(p.name,p.value)})});spokeAnglesWrap.addEventListener("change",function(event){var target=event.target;if(!target)return;var isRange=target.hasAttribute("data-spoke-angle-range"),isNum=target.hasAttribute("data-spoke-angle-number");if(!isRange&&!isNum)return;var row=target.closest?target.closest("[data-spoke-angle-name]"):null;if(!row)return;var name=row.getAttribute("data-spoke-angle-name"),had=!!(spokePending&&spokePending.name===name);if(had){spokePending=null;if(spokeFrame){cancelAnimationFrame(spokeFrame);spokeFrame=0}}if(had||isNum)applySpokeAngle(name,target.value)})}
    var spokeAnglesReset=document.getElementById("layoutSpokeAnglesReset");if(spokeAnglesReset)spokeAnglesReset.addEventListener("click",function(){var next=collect();next.branchOverrides=copyOverrides(next.branchOverrides);Object.keys(next.branchOverrides).forEach(function(key){next.branchOverrides[key]=branchOverrideEntry(next.branchOverrides[key],{angle:0},key)});apply(next)});
    // Restore shipped tilts (Group 4, G4-9): "Reset all tilts" zeroes
    // every tilt with no way back; this companion restores the baked
    // tilts from __SEXCAPADES_LAYOUT_DEFAULTS exactly — branch tilt
    // angles (preserving each branch's current length), plus the
    // shipped sub-group and per-topic tilt offset maps wholesale.
    var spokeAnglesRestore=document.getElementById("layoutSpokeAnglesRestore");if(spokeAnglesRestore)spokeAnglesRestore.addEventListener("click",function(){var defaults=window.__SEXCAPADES_LAYOUT_DEFAULTS||{},next=collect();next.branchOverrides=copyOverrides(next.branchOverrides);var shippedAngles={};Object.keys(defaults.branchOverrides||{}).forEach(function(k){var a=defaults.branchOverrides[k]?Number(defaults.branchOverrides[k].angle):NaN;shippedAngles[k]=Number.isFinite(a)?a:0});Object.keys(next.branchOverrides).forEach(function(key){next.branchOverrides[key]=branchOverrideEntry(next.branchOverrides[key],{angle:shippedAngles[key]||0},key)});Object.keys(shippedAngles).forEach(function(key){if(!next.branchOverrides[key])next.branchOverrides[key]=branchOverrideEntry(null,{angle:shippedAngles[key]},key)});next.subcatAngleOffsets=copyOverrides(defaults.subcatAngleOffsets||{});next.kinkAngleOffsets=copyOverrides(defaults.kinkAngleOffsets||{});apply(next)});
    document.getElementById("layoutClearSelection").addEventListener("click",function(){clearSelectionUI()});
    // Fastest performance preset (Batch F, Build 2026-10-20_0135):
    // one click sets the cheapest settings combination — Animations
    // off, the push-apart gate off, Push-apart strength 0, overlap
    // fixing on Grow only, and Measurements off. Grow only is the
    // cheapest collision mode that stays correct for the tuned map:
    // Grow + Shrink runs two adjustment passes, and Off re-bases
    // every spoke length (x0.56-0.62 per its own tooltip), which
    // would redraw the tuned layout — a geometry change, not a
    // setting. The preset goes through collect(), so every override,
    // length, tilt and angle is carried over verbatim; metrics are
    // switched off through the same state the Measurements dropdown
    // and the cross-window replay use, so the change rides the
    // Batch C live-sync payload (collectEditorState reads metricId)
    // like any other editor change.
    var fastestBtn=document.getElementById("layoutFastest");
    if(fastestBtn)fastestBtn.addEventListener("click",function(){
      metricId="off";metricOn=false;if(metricSelect)metricSelect.value="off";if(metricButton)metricButton.disabled=true;stopMetricBusy();clearMetricGlobal();metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay();
      var animEl=document.getElementById(ids.animations);if(animEl)animEl.checked=false;
      var repGate=document.getElementById(ids.repulsionEnabled);if(repGate)repGate.checked=false;
      var repEl=document.getElementById(ids.repulsion);if(repEl)repEl.value="0";
      var colGate=document.getElementById(ids.collisionEnabled);if(colGate)colGate.checked=true;
      setCollisionMode("grow");/* LR-G5: Fastest used to set the hidden select to Grow only; it now presses Grow in the visible group before collect() reads the mode from it */
      lastCollision="grow";
      apply(collect(),"Fastest settings applied");
    });
    document.getElementById("layoutReset").addEventListener("click",function(){var defaults=Object.assign({},window.__SEXCAPADES_LAYOUT_DEFAULTS,{branchOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.branchOverrides||{}),subcatOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.subcatOverrides||{}),kinkOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.kinkOverrides||{})});lastCollision="grow";try{window.localStorage&&window.localStorage.removeItem("sexcapades-layout-branchOrder");window.localStorage&&window.localStorage.removeItem("sexcapades-layout-savedDefaults");window.localStorage&&window.localStorage.removeItem("sexcapades-layout-liveSettings")}catch (error) { __sxErrLog("layout-storage", error); }/* Q11 AS AMENDED (Layout groups Phase 3): Reset also returns Measurements to Off and the on-map numbers overlay to OFF — the same off sequence the Fastest preset and the cross-window replay use, so the dropdown, the Calculate button, the strip's chip state and the overlay checkbox all land together. This supersedes the printed Q11 (a) (overlay to ON). Power user is deliberately not touched: whatever state it is in survives Reset. */metricId="off";metricOn=false;if(metricSelect)metricSelect.value="off";if(metricButton)metricButton.disabled=true;stopMetricBusy();clearMetricGlobal();metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay();syncMetricStrip();metricOverlayOn=false;if(metricOverlayToggle)metricOverlayToggle.checked=false;clearMetricOverlay();applyBusyBtn=document.getElementById("layoutReset");liveSyncMuted=true;apply(defaults,"Defaults restored");liveSyncMuted=false});
    function settingsHash(){var c=collect(),parts=[(bundles[c.spacing]?"layout-spacing="+c.spacing:""),"layout-branchOrder="+(c.branchOrder||"landscape-antipodal"),"layout-propFan="+(c.propFan?1:0),"layout-subcatOrder="+(c.subcatOrder?1:0),"layout-staggerDensity="+(c.staggerDensity?1:0),"layout-stagger="+(c.stagger?1:0),"layout-expandAll="+(c.expandAll?1:0),"layout-collision="+c.collision,"layout-crossmin="+(c.crossmin?1:0),"layout-nudge="+(c.nudge?1:0),"layout-showRelations="+(c.showRelations?1:0),"layout-spokeLen="+c.spokeLen.toFixed(2),"layout-subLen="+c.subLen.toFixed(2),"layout-pad="+c.pad.toFixed(2),"layout-repulsion="+c.repulsion.toFixed(2),"layout-repulsionEnabled="+(c.repulsionEnabled===false?0:1),"layout-staticMap="+(c.staticMap?1:0),"layout-animations="+(c.animations?1:0),"layout-mapSliders="+(c.mapSliders?1:0),"layout-fontScale="+(Number(c.fontScale)||1).toFixed(2),"layout-centerRingScale="+(Number(c.centerRingScale)||1).toFixed(2),"layout-leafOvergrowth="+(Number(c.leafOvergrowth)||300),"layout-autoShrinkFactor="+(Number(c.autoShrinkFactor)||.76).toFixed(2),"layout-subcatCloudShrinkFactor="+(Number(c.subcatCloudShrinkFactor)||.76).toFixed(2)],overrides=c.branchOverrides||{};if(Object.keys(overrides).length){var packed=btoa(unescape(encodeURIComponent(JSON.stringify(overrides)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");parts.push("layout-branches="+packed)}var extraGroups=[["layout-subcatOverrides",c.subcatOverrides],["layout-kinkOverrides",c.kinkOverrides],["layout-subcatAngleOffsets",c.subcatAngleOffsets],["layout-kinkAngleOffsets",c.kinkAngleOffsets],["layout-branchSpokeAutoShrink",c.branchSpokeAutoShrink],["layout-subcatSpokeAutoShrink",c.subcatSpokeAutoShrink]];extraGroups.forEach(function(pair){var obj=pair[1]||{};if(Object.keys(obj).length){parts.push(pair[0]+"="+btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""))}});return "#"+parts.join("&")}
    var layoutCopyStatusTimer=null;function showLayoutCopied(){var status=document.getElementById("layoutCopyStatus");if(!status)return;status.textContent="Link copied";if(layoutCopyStatusTimer)clearTimeout(layoutCopyStatusTimer);layoutCopyStatusTimer=setTimeout(function(){layoutCopyStatusTimer=null;status.textContent=""},2500)}
    function showLayoutCopyFailed(){var status=document.getElementById("layoutCopyStatus");if(!status)return;status.textContent="Couldn't copy — use Export settings instead";if(layoutCopyStatusTimer)clearTimeout(layoutCopyStatusTimer);layoutCopyStatusTimer=setTimeout(function(){layoutCopyStatusTimer=null;status.textContent=""},4000)}
    // Copy layout settings (Group 4, G4-5): the copy must work in ANY
    // editor state, so building the link is guarded (a hashing error
    // reports instead of dying silently), the async clipboard API is
    // attempted first with a synchronous-selection fallback, and every
    // outcome — success or failure — shows feedback in the status span.
    document.getElementById("layoutCopy").addEventListener("click",function(){var settings;try{settings=window.location.href.split("#")[0]+settingsHash()}catch (error) { __sxErrLog("layout-copy-hash", error);showLayoutCopyFailed();return }function fallback(){var area=document.createElement("textarea");area.value=settings;area.setAttribute("readonly","");area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();var ok=false;try{ok=!!document.execCommand("copy")}catch (error) { __sxErrLog("clipboard", error); }area.remove();if(ok)showLayoutCopied();else showLayoutCopyFailed()}if(navigator.clipboard&&navigator.clipboard.writeText){var pending=null;try{pending=navigator.clipboard.writeText(settings)}catch (error) { __sxErrLog("clipboard-write", error); }if(pending&&typeof pending.then==="function")pending.then(showLayoutCopied).catch(function(){fallback()});else fallback()}else fallback()});
    // Reorganization wiring (Build 2026-10-19_1636): popup sliders, popup
    // multi-state toggles, the power-user reveal, For All buttons, and
    // the settings export. A popup slider's button row shows the name
    // and current value; tapping opens the slider inline (closing any
    // other open popup in the editor). A multi-state toggle (.le-ms)
    // shows only its current state until tapped open, like the
    // branch-order picker.
    // LR-G2: capsule sliders (Pattern 2) — a .le-capsule popslider shows
    // only its button (label + value output) at rest; on open, its pop is
    // a fixed-position overlay anchored to the capsule (positionLeCapsule,
    // viewport-clamped), never in layout flow, so the editor's scroll
    // height never changes. Close triggers: range pointer-up/cancel (the
    // gesture ends on release, like the rating sliders — no confirm step),
    // Escape, pointerdown outside the open capsule, re-clicking the
    // capsule, or another popup opening (closeLePopups one-at-a-time).
    // The range inputs, their ids, and the coalesceSlider input wiring
    // are unchanged — this layer is presentation only.
    function positionLeCapsule(wrap,pop){
      var btn=wrap.querySelector(".le-popslider-btn");if(!btn)return;
      var r=btn.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
      var left=Math.min(Math.max(r.left,8),Math.max(8,window.innerWidth-w-8));
      var top=r.bottom+6;
      if(top+h>window.innerHeight-8)top=r.top-h-6;
      if(top<8)top=Math.max(8,window.innerHeight-h-8);
      pop.style.left=left+"px";pop.style.top=top+"px";
    }
    function closeLeCapsule(wrap){
      var pop=wrap.querySelector(".le-popslider-pop"),btn=wrap.querySelector(".le-popslider-btn");
      wrap.classList.remove("is-open");
      if(pop){pop.hidden=true;pop.style.left="";pop.style.top=""}
      if(btn)btn.setAttribute("aria-expanded","false");
    }
    function closeLePopups(except){
      panel.querySelectorAll(".le-popslider.is-open").forEach(function(p){if(p===except)return;if(p.classList.contains("le-capsule")){closeLeCapsule(p);return}p.classList.remove("is-open");var pop=p.querySelector(".le-popslider-pop"),btn=p.querySelector(".le-popslider-btn");if(pop)pop.hidden=true;if(btn)btn.setAttribute("aria-expanded","false")});
      panel.querySelectorAll(".le-ms.is-open").forEach(function(m){if(m!==except)m.classList.remove("is-open")});
    }
    panel.querySelectorAll(".le-popslider-btn").forEach(function(btn){
      btn.addEventListener("click",function(){
        var wrap=btn.closest(".le-popslider");if(!wrap)return;
        var pop=wrap.querySelector(".le-popslider-pop"),willOpen=pop&&pop.hidden;
        closeLePopups(wrap);
        if(pop){pop.hidden=!willOpen;wrap.classList.toggle("is-open",!!willOpen);btn.setAttribute("aria-expanded",String(!!willOpen))}
        // LR-G2: anchor the capsule's overlay to it on open; clear the
        // anchor again on close so no stale fixed position survives.
        if(pop&&wrap.classList.contains("le-capsule")){if(willOpen)positionLeCapsule(wrap,pop);else{pop.style.left="";pop.style.top=""}}
        // Focus the pop's range input on open so arrow keys drive it.
        // The synchronous focus covers the common case; the deferred
        // retry (next frame, once the just-unhidden pop has laid out)
        // re-asserts it if that first call was dropped, but only while
        // the pop is still open and the input is enabled — and never
        // when focus already landed, so the controls that already
        // worked are untouched.
        if(willOpen&&pop){var popRange=pop.querySelector("input[type=range]");if(popRange){popRange.focus();SexcapadesRuntime.TimerManager.requestAnimationFrame(function(){if(!pop.hidden&&wrap.classList.contains("is-open")&&!popRange.disabled&&document.activeElement!==popRange)popRange.focus()})}}
      });
    });
    // LR-G2: capsule close triggers beyond the shared toggle above —
    // releasing the pointer after interacting with the overlay's range
    // ends the gesture and collapses the capsule (live commit already
    // happened through the range's input events during the drag);
    // pointerdown anywhere outside the open capsule dismisses it; and
    // Escape (captured, so it closes the capsule instead of falling
    // through to the editor-level Escape that clears the selection or
    // closes the editor) dismisses it and returns focus to the capsule.
    // Release is observed in the CAPTURE phase at document level, armed
    // by pointerdown on the range: during a range drag this app stops
    // pointerup before the target/bubble phases ever see it (observed
    // live — only window/document capture listeners fire), so a
    // target-phase pointerup listener on the range would never run.
    var leCapsuleGesture=null;
    panel.querySelectorAll(".le-popslider.le-capsule").forEach(function(wrap){
      var pop=wrap.querySelector(".le-popslider-pop");if(!pop)return;
      var range=pop.querySelector("input[type=range]");if(!range)return;
      range.addEventListener("pointerdown",function(){leCapsuleGesture=wrap});
    });
    document.addEventListener("pointerup",function(){
      var wrap=leCapsuleGesture;leCapsuleGesture=null;
      if(wrap&&wrap.classList.contains("is-open"))closeLeCapsule(wrap);
    },true);
    document.addEventListener("pointercancel",function(){
      var wrap=leCapsuleGesture;leCapsuleGesture=null;
      if(wrap&&wrap.classList.contains("is-open"))closeLeCapsule(wrap);
    },true);
    document.addEventListener("pointerdown",function(event){
      var open=panel.querySelector(".le-popslider.le-capsule.is-open");
      if(open&&!open.contains(event.target))closeLeCapsule(open);
    });
    document.addEventListener("keydown",function(event){
      if(event.key!=="Escape")return;
      var open=panel.querySelector(".le-popslider.le-capsule.is-open");
      if(!open)return;
      event.preventDefault();event.stopImmediatePropagation();
      var btn=open.querySelector(".le-popslider-btn");
      closeLeCapsule(open);
      if(btn)btn.focus();
    },true);
    panel.querySelectorAll(".le-ms").forEach(function(box){
      // Layout groups Phase 2 (Q10): the Collision mode group is no
      // longer a .le-ms at all — it is a selector-button + menu overlay
      // wired with the Phase 2 block below — so it never reaches this
      // loop; the id guard stays as a harmless belt-and-braces check.
      if(box.id==="layoutCollisionMs")return;
      box.addEventListener("click",function(){
        if(!box.classList.contains("is-open")){closeLePopups(box);box.classList.add("is-open");return}
        box.classList.remove("is-open");
      });
    });
    document.addEventListener("pointerdown",function(event){if(!panel.contains(event.target))closeLePopups(null)});
    // LR-G5: the collision-mode state lives in the mode group (collect()
    // reads the pressed button as the mode) and applyCollisionMode()
    // carries the former hidden select change handler's effects
    // — lastCollision, the master Collision avoidance switch, and
    // apply() — exactly as before.
    // Layout groups Phase 2 (Q10): the group is now the pop-up menu of a
    // selector-button — the four-pill segmented row is retired. At rest
    // only #layoutCollisionBtn shows, carrying the current mode; tapping
    // it opens the #layoutCollisionMs menu overlay; picking a mode
    // presses it, runs applyCollisionMode(), closes the menu, and
    // returns focus to the button.
    var collisionMs=document.getElementById("layoutCollisionMs");
    var collisionBtn=document.getElementById("layoutCollisionBtn");
    if(collisionMs&&collisionBtn){
      collisionMs.querySelectorAll("[data-collision-mode]").forEach(function(btn){
        btn.addEventListener("click",function(){
          setCollisionMode(btn.dataset.collisionMode);
          syncCollisionAnchor();
          applyCollisionMode(btn.dataset.collisionMode);
          closeCollisionMenu();
          collisionBtn.focus();
        });
      });
      collisionBtn.addEventListener("click",function(){if(collisionMs.hidden)openLeMenu(collisionBtn,collisionMs,closeBranchOrderMenu);else closeCollisionMenu()});
      document.addEventListener("pointerdown",function(event){if(!collisionMs.hidden&&!collisionMs.contains(event.target)&&event.target!==collisionBtn&&!collisionBtn.contains(event.target))closeCollisionMenu()});
      document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!collisionMs.hidden){closeCollisionMenu();collisionBtn.focus()}});
      syncCollisionAnchor();
    }
    // Solver-mode toggle wiring: mirrors the collision selector above.
    // Picking a mode presses it, runs the plain full apply with the
    // picked mode (live model update + repaint under the new mode +
    // cross-tab broadcast), then upserts the layout-solverMidline hash
    // token so a reload keeps the choice. No branch selection is
    // required, and the control sits outside .layout-editor-branch, so
    // it stays live during Anneal runs.
    var solverModeMenu=document.getElementById("layoutSolverModeMenu");
    var solverModeBtn=document.getElementById("layoutSolverModeBtn");
    if(solverModeMenu&&solverModeBtn){
      solverModeMenu.querySelectorAll("[data-solver-mode]").forEach(function(btn){
        btn.addEventListener("click",function(){
          setSolverMode(btn.dataset.solverMode);
          applySolverMode(btn.dataset.solverMode);
          closeSolverModeMenu();
          solverModeBtn.focus();
        });
      });
      solverModeBtn.addEventListener("click",function(){if(solverModeMenu.hidden)openLeMenu(solverModeBtn,solverModeMenu,closeCollisionMenu);else closeSolverModeMenu()});
      document.addEventListener("pointerdown",function(event){if(!solverModeMenu.hidden&&!solverModeMenu.contains(event.target)&&event.target!==solverModeBtn&&!solverModeBtn.contains(event.target))closeSolverModeMenu()});
      document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!solverModeMenu.hidden){closeSolverModeMenu();solverModeBtn.focus()}});
      setSolverMode(config().solverMidline);
    }
    // Layout groups Phase 2 (Q9): every capsule overlay carries an
    // editable number field beside its range, so precision entry
    // survives inside the overlay — range-only would be a capability
    // regression. The field mirrors the range (the value the slider
    // itself holds, in the slider's own units); committing it (change
    // or Enter) clamps to the range's min/max, writes the range, and
    // dispatches input+change so the existing coalesceSlider wiring
    // applies it exactly as a drag would — the layoutFontScaleNum
    // precedent. While the range moves, the field follows it; on
    // capsule open it refreshes value and disabled state from the range.
    panel.querySelectorAll(".le-popslider.le-capsule").forEach(function(wrap){
      var pop=wrap.querySelector(".le-popslider-pop");if(!pop)return;
      var range=pop.querySelector("input[type=range]"),num=pop.querySelector("input.le-capsule-num");if(!range||!num)return;
      function refreshCapsuleNum(){if(document.activeElement!==num)num.value=range.value;num.disabled=range.disabled}
      function commitCapsuleNum(){var v=Number(num.value);if(!Number.isFinite(v)){num.value=range.value;return}var min=Number(range.min),max=Number(range.max);if(Number.isFinite(min))v=Math.max(min,v);if(Number.isFinite(max))v=Math.min(max,v);range.value=String(v);num.value=range.value;range.dispatchEvent(new Event("input",{bubbles:true}));range.dispatchEvent(new Event("change",{bubbles:true}));refreshCapsuleNum()}
      range.addEventListener("input",refreshCapsuleNum);
      range.addEventListener("change",refreshCapsuleNum);
      num.addEventListener("change",commitCapsuleNum);
      num.addEventListener("keydown",function(event){if(event.key==="Enter"){event.preventDefault();commitCapsuleNum()}});
      var capsuleBtn=wrap.querySelector(".le-popslider-btn");if(capsuleBtn)capsuleBtn.addEventListener("click",refreshCapsuleNum);
      refreshCapsuleNum();
    });
    // Power-user toggle: reveal (or collapse) every section's Advanced
    // block at once. Individual Advanced blocks still open on their own.
    var powerToggle=document.getElementById("layoutPowerUser");
    if(powerToggle)powerToggle.addEventListener("change",function(){
      panel.classList.toggle("le-power",!!powerToggle.checked);
      panel.querySelectorAll(".le-adv").forEach(function(d){d.open=!!powerToggle.checked});
      scheduleLiveSync();
    });
    // Fullscreen mode (Build 2026-10-19_1742): the Fullscreen button
    // fills the screen with the editor and switches it to a dense
    // multi-column tuning console (see the .layout-fullscreen styles).
    // It pairs with cross-tab live sync: keep this editor fullscreen in
    // one window and watch the map update live in another. Escape
    // leaves fullscreen; the close button works exactly as before.
    var fullscreenBtn=document.getElementById("layoutFullscreen");
    function setLayoutFullscreen(on){if(on&&panel.classList.contains("layout-minimised"))setLayoutMinimised(false);panel.classList.toggle("layout-fullscreen",!!on);if(fullscreenBtn){fullscreenBtn.setAttribute("aria-label",on?"Exit fullscreen":"Fullscreen");fullscreenBtn.setAttribute("aria-pressed",String(!!on))}if(!editorSyncGuard)scheduleLiveSync();syncPanelDock()}
    if(fullscreenBtn)fullscreenBtn.addEventListener("click",function(){setLayoutFullscreen(!panel.classList.contains("layout-fullscreen"))});
    document.addEventListener("keydown",function(event){if(event.key==="Escape"&&panel.classList.contains("layout-fullscreen")){event.preventDefault();event.stopPropagation();setLayoutFullscreen(false)}},true);
    // Panel minimise + map reframe (repair for the panel blocking the
    // kink cloud mid-Anneal): Minimise collapses the panel to the
    // status strip (#layoutEditorStrip) — display-only; the body is
    // hidden, never rebuilt, so a run in flight is untouched and every
    // receipt is still there on Expand. The strip mirrors the run's
    // own live state (AnnealCloudOverlay branch/value, the busy clock)
    // on a light timer that runs only while minimised, and its Cancel
    // button clicks the run's real Cancel control, so single-branch
    // and Anneal-all cancels behave exactly as from the full panel.
    // syncPanelDock drives the html.le-panel-docked reservation that
    // keeps the working cloud in the open map area while the full
    // panel is up (see the CSS note).
    var minimiseBtn=document.getElementById("layoutEditorMinimise"),expandBtn=document.getElementById("layoutEditorExpand"),stripStatus=document.getElementById("layoutStripStatus"),stripCancel=document.getElementById("layoutStripCancel"),stripTimer=null;
    function syncPanelDock(){var docked=!panel.hidden&&!panel.classList.contains("layout-minimised")&&!panel.classList.contains("layout-fullscreen");document.documentElement.classList.toggle("le-panel-docked",docked)}
    function paintStrip(){
      if(!stripStatus)return;
      var running=deknotterRunning||deknotterLoopRunning;
      if(running){
        var cross=AnnealCloudOverlay.value;
        var secs=deknotterBusyStart?((Date.now()-deknotterBusyStart)/1000).toFixed(1)+"s":"";
        stripStatus.innerHTML="<b>"+dkEsc(AnnealCloudOverlay.branch||"Anneal")+"</b>"+(cross!=null&&Number.isFinite(Number(cross))?" · crossing <span class=\"le-strip-cross\">"+dkEsc(dkFmtLead(Number(cross)))+"</span>":"")+(secs?" · <span class=\"le-strip-elapsed\">"+secs+"</span>":"");
      }else{
        stripStatus.textContent="Layout editor — minimised";
      }
      if(stripCancel){var real=document.getElementById("layoutDeknotterCancel");stripCancel.hidden=!running;if(running&&real){stripCancel.disabled=!!real.disabled;stripCancel.textContent=real.disabled?"Cancelling…":"Cancel anneal"}}
    }
    function setLayoutMinimised(on){
      panel.classList.toggle("layout-minimised",!!on);
      if(minimiseBtn)minimiseBtn.setAttribute("aria-expanded",String(!on));
      if(on){paintStrip();if(stripTimer===null)stripTimer=SexcapadesRuntime.TimerManager.setInterval(paintStrip,250)}
      else if(stripTimer!==null){SexcapadesRuntime.TimerManager.clear(stripTimer);stripTimer=null}
      syncPanelDock();
    }
    if(minimiseBtn)minimiseBtn.addEventListener("click",function(){if(panel.classList.contains("layout-fullscreen"))setLayoutFullscreen(false);setLayoutMinimised(true);if(expandBtn)expandBtn.focus({preventScroll:true})});
    if(expandBtn)expandBtn.addEventListener("click",function(){setLayoutMinimised(false);if(minimiseBtn)minimiseBtn.focus({preventScroll:true})});
    if(stripCancel)stripCancel.addEventListener("click",function(){var real=document.getElementById("layoutDeknotterCancel");if(real&&!real.disabled)real.click()});
    // Layout groups Phase 1 (Q3/Q5): the Tilt-each-branch drawer under
    // the rails, and the Measurements strip's chip state. The tilt
    // block lives in the drawer; its trigger button sits in the
    // Selection section's Advanced area where the block used to live.
    // The strip collapses to a chip (label + picker only) while the
    // measurement is Off, via the le-metric-off class.
    var tiltDrawer=document.getElementById("layoutTiltDrawer");
    var tiltDrawerBtn=document.getElementById("layoutTiltDrawerBtn");
    function setTiltDrawer(open){if(!tiltDrawer)return;tiltDrawer.hidden=!open;if(tiltDrawerBtn)tiltDrawerBtn.setAttribute("aria-expanded",String(!!open))}
    if(tiltDrawerBtn&&tiltDrawer)tiltDrawerBtn.addEventListener("click",function(){setTiltDrawer(tiltDrawer.hidden)});
    var tiltDrawerClose=document.getElementById("layoutTiltDrawerClose");
    if(tiltDrawerClose)tiltDrawerClose.addEventListener("click",function(){setTiltDrawer(false);if(tiltDrawerBtn)tiltDrawerBtn.focus()});
    var metricSection=document.getElementById("layoutMeasureGroup");
    var metricSelect=document.getElementById("layoutMetricSelect");
    function syncMetricStrip(){if(!metricSection||!metricSelect)return;metricSection.classList.toggle("le-metric-off",metricSelect.value==="off");if(panel.classList.contains("layout-fullscreen")){var evSec=document.getElementById("layoutSectionEveryday");if(evSec)evSec.open=true}}
    if(metricSelect)metricSelect.addEventListener("change",syncMetricStrip);
    if(fullscreenBtn)fullscreenBtn.addEventListener("click",syncMetricStrip);
    syncMetricStrip();
    // LR-G3: two-box level-scoped arming. The 12 per-row for-all
    // checkboxes are replaced by level boxes per selection group:
    // branch group and sub-group group carry "For all subcategories"
    // and "For all kinks"; the topic group carries "For all kinks"
    // only. An actuator applies globally at its own level iff the box
    // naming its level is armed in its group; the batch it then runs
    // is the SAME closure the old per-row box drove (bindForAll
    // registers each into lrG3ForAllFns) over the untouched
    // forallApply below. Branch-level actuators (branch line length,
    // Tilt, Auto-shrink branch spoke) have no box in this first pass
    // and always apply to the selected branch only.
    var lrG3ForAllFns={};
    var lrG3ArmBoxes={branch:{subs:"layoutBranchArmSubs",kinks:"layoutBranchArmKinks"},kink:{kinks:"layoutKinkArmKinks"},subcat:{subs:"layoutSubcatArmSubs"}};
    var lrG3EchoRows=[["layoutBranchKinkLen","branch","kinks","· all kinks"],["layoutBranchSubLen","branch","subs","· all subcategories"],["layoutKinkLen","kink","kinks","· all kinks"],["layoutKinkAngle","kink","kinks","· all kinks"],["layoutSubcatLen","subcat","subs","· all subcategories"],["layoutSubcatAngle","subcat","subs","· all subcategories"],["layoutSubcatSpokeAutoShrink","subcat","subs","· all subcategories"]];
    function lrG3Armed(group,level){var g=lrG3ArmBoxes[group],id=g&&g[level],b=id&&document.getElementById(id);return !!(b&&b.checked)}
    // F2: actuators consult live level state directly — no per-row
    // id translation layer. The batch closure is keyed by
    // group|level|control in lrG3ForAllFns (see bindForAll).
    function lrG3Divert(group,level,ctrl){if(!lrG3Armed(group,level))return false;var fn=lrG3ForAllFns[group+"|"+level+"|"+ctrl];if(!fn)return false;function done(){showAppliedAll(group==="branch"?"Applied to all branches.":group==="kink"?"Applied to all topics.":"Applied to all sub-groups.")}var r;try{r=fn()}catch(e){__sxErrLog("layout-forall",e);return true}if(r&&typeof r.then==="function")r.then(done,function(){});else done();return true}
    function lrG3SyncEcho(){lrG3EchoRows.forEach(function(row){var el=document.getElementById(row[0]);if(!el)return;var host=el.closest?el.closest(".le-sel-control"):null;if(!host)return;var echo=host.querySelector(".le-arm-echo");if(!echo){echo=document.createElement("span");echo.className="le-arm-echo";host.appendChild(echo)}echo.textContent=row[3];echo.hidden=!lrG3Armed(row[1],row[2])})}
    function lrG3CollectArmScope(){var out={};Object.keys(lrG3ArmBoxes).forEach(function(g){out[g]={};Object.keys(lrG3ArmBoxes[g]).forEach(function(l){var b=document.getElementById(lrG3ArmBoxes[g][l]);out[g][l]=!!(b&&b.checked)})});return out}
    function lrG3ApplyArmScope(sc){if(!sc||typeof sc!=="object")return;Object.keys(lrG3ArmBoxes).forEach(function(g){var gv=sc[g];if(!gv||typeof gv!=="object")return;Object.keys(lrG3ArmBoxes[g]).forEach(function(l){if(typeof gv[l]==="boolean"){var b=document.getElementById(lrG3ArmBoxes[g][l]);if(b)b.checked=gv[l]}})});lrG3SyncEcho()}
    Object.keys(lrG3ArmBoxes).forEach(function(g){Object.keys(lrG3ArmBoxes[g]).forEach(function(l){var b=document.getElementById(lrG3ArmBoxes[g][l]);if(b)b.addEventListener("change",function(){lrG3SyncEcho();if(!editorSyncGuard)scheduleLiveSync()})})});
    lrG3SyncEcho();
    // For All buttons: push the paired control's current value to every
    // branch / subcategory / topic at once, writing the same override
    // shapes the per-selection handlers write.
    function forallApply(mutator){var next=collect();mutator(next);apply(next);scheduleMetric()}
    function allSubcatNames(){var api=window.__SEXCAPADES_LAYOUT_API;return (api&&api.subcategories)?api.subcategories():[]}
    function allTopicIds(){var api=window.__SEXCAPADES_LAYOUT_API;return ((api&&api.topics)?api.topics():[]).map(function(t){return t.id})}
    var layoutAllStatusTimer=null;function showAppliedAll(message){var status=document.querySelector(".layout-editor-status")||document.getElementById("layoutCopyStatus");if(!status)return;status.textContent=message;if(layoutAllStatusTimer)clearTimeout(layoutAllStatusTimer);layoutAllStatusTimer=setTimeout(function(){layoutAllStatusTimer=null;status.textContent=""},2500)}
    // Apply-to-all display truth (Group 4, G4-10): checking a For-All
    // box propagates the paired control's value to every group AND
    // the box stays ticked — the tick is the record that this value
    // is the one applied to all, so displayed state equals actual
    // state after every click. (The old code unticked the box inside
    // the same task, before the browser could paint it, so clicks
    // engaged propagation while the box never showed checked.)
    // Unticking by hand just clears the record. (F2: arm state lives
    // only in the level boxes — lrG3ArmBoxes, mirrored across windows
    // by lrG3CollectArmScope / lrG3ApplyArmScope. The old per-row
    // disarm calls targeted boxes already removed from the markup,
    // so they never unticked anything; they are deleted, not moved.)
    // F2: bindForAll only registers the batch closure under its
    // group|level|control key. The change-listener attach it used to
    // perform targeted the removed per-row boxes (it found no
    // element) and is deleted with them.
    function bindForAll(group,level,ctrl,fn){lrG3ForAllFns[group+"|"+level+"|"+ctrl]=fn}
    // Rank 8: the branch|branch|branchLen, branch|branch|branchAngle and
    // branch|branch|branchSpokeAutoShrink batch closures are REMOVED, not
    // rewired. Evidence they could never fire: no LR_ACT entry diverts to
    // a branch|branch key, lrG3ArmBoxes has no branch-level box so
    // lrG3Armed("branch","branch") can never be true, bindForAll no
    // longer attaches listeners, and the LR-G3 note above states
    // branch-level actuators always apply to the selected branch only.
    // The seven batches below are the ones a divert can reach.
    bindForAll("branch","subs","branchSubLen",function(){var v=Number(document.getElementById("layoutBranchSubLen").value)||1;forallApply(function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides);branchNames().forEach(function(name){next.branchOverrides[name]=branchOverrideEntry(next.branchOverrides[name],{subScale:v},name);branchMembers(name).subs.forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{length:bakedSubBase(s,"length")*v})})})})});
    bindForAll("branch","kinks","branchKinkLen",function(){var v=Number(document.getElementById("layoutBranchKinkLen").value)||1;forallApply(function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.kinkOverrides=copyOverrides(next.kinkOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides);branchNames().forEach(function(name){next.branchOverrides[name]=branchOverrideEntry(next.branchOverrides[name],{kinkScale:v},name);var members=branchMembers(name),cloudSubs={};members.kinks.forEach(function(e){if(e.subcategory){cloudSubs[e.subcategory]=true}else{next.kinkOverrides[e.id]=kinkOverrideEntry(bakedKinkBase(e.id)*v)}});Object.keys(cloudSubs).forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{cloud:bakedSubBase(s,"cloud")*v})})})})});
    // F6: ONE parameterized for-all handler for the shrink switches
    // (kind x scope x names source). Writes the tri-state type for
    // every name in scope: checked -> explicit true (armed) for all,
    // unchecked -> explicit false (veto) for all.
    function shrinkForAll(kind,level,key,checkboxId,mapKey,namesFn){bindForAll(kind,level,key,function(){var on=document.getElementById(checkboxId).checked;return shrinkBusy(null,function(){forallApply(function(next){next[mapKey]=Object.assign({},next[mapKey]||{});namesFn().forEach(function(name){if(on)next[mapKey][name]=true;else next[mapKey][name]=false})})})})}
    // Rank 8: branch|branch|branchSpokeAutoShrink batch removed — see the
    // note above the live batches; the subcat batch below stays live.
    bindForAll("kink","kinks","kinkLen",function(){var rel=relClamp(document.getElementById("layoutKinkLen").value);forallApply(function(next){next.kinkOverrides=copyOverrides(next.kinkOverrides);allTopicIds().forEach(function(id){next.kinkOverrides[id]=kinkOverrideEntry(rel*bakedKinkBase(id))})})});
    bindForAll("kink","kinks","kinkAngle",function(){var v=Number(document.getElementById("layoutKinkAngle").value);forallApply(function(next){next.kinkAngleOffsets=copyOverrides(next.kinkAngleOffsets);allTopicIds().forEach(function(id){setAngleOffset(next.kinkAngleOffsets,id,v)})})});
    bindForAll("subcat","subs","subcatAngle",function(){var v=Number(document.getElementById("layoutSubcatAngle").value);forallApply(function(next){next.subcatAngleOffsets=copyOverrides(next.subcatAngleOffsets);allSubcatNames().forEach(function(name){setAngleOffset(next.subcatAngleOffsets,name,v)})})});
    bindForAll("subcat","subs","subcatLen",function(){var rel=relClamp(document.getElementById("layoutSubcatLen").value);forallApply(function(next){next.subcatOverrides=copyOverrides(next.subcatOverrides);allSubcatNames().forEach(function(name){next.subcatOverrides[name]=subcatOverrideEntry(next.subcatOverrides[name],{length:rel*bakedSubBase(name,"length")})})})});
    shrinkForAll("subcat","subs","subcatSpokeAutoShrink","layoutSubcatSpokeAutoShrink","subcatSpokeAutoShrink",allSubcatNames);
    // Export settings: download the Layout Editor's current settings
    // (the same object Copy layout settings encodes, plus the hash
    // form) as a JSON file for sharing or safekeeping.
    var exportBtn=document.getElementById("layoutExport");
    if(exportBtn)exportBtn.addEventListener("click",function(){
      var liveBuild=(document.querySelector('meta[name="sexcapades-build"]') || {}).content || "";
      var clickDate=new Date(),pad2=function(n){return (n<10?"0":"")+n},clickStamp=clickDate.getFullYear()+"-"+pad2(clickDate.getMonth()+1)+"-"+pad2(clickDate.getDate())+"_"+pad2(clickDate.getHours())+pad2(clickDate.getMinutes());
      var payload={app:"sexcapades",kind:"layout-settings",version:3,build:liveBuild,exportedAt:new Date().toISOString(),settings:collect(),hash:settingsHash()};
      var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
      var url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="sexcapades-layout-settings-"+clickStamp+".json";
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url)},1500);
    });
    // Load + Paste layout settings: the inbound half of Copy/Export.
    // Load reads a settings JSON file made by Export; Paste takes the
    // same JSON — or the link the Copy button puts on the clipboard —
    // from a dialog. Both routes share one parser/validator:
    // leImportSettingsText returns {ok:true} or {ok:false,error}, and
    // on ANY error nothing is applied, so the current settings are
    // never half-replaced. A valid import is rebuilt key by key (only
    // the keys collect() itself writes are taken, each type-checked —
    // the same allowlist rule the boot saved-defaults merge uses) on
    // top of the current settings, then handed to the ordinary
    // apply(), which repaints the map and re-syncs every control.
    var leBoolKeys=["propFan","subcatOrder","staggerDensity","stagger","expandAll","crossmin","nudge","showRelations","repulsionEnabled","staticMap","animations","mapSliders"];
    var leNumKeys=["spokeLen","subLen","pad","repulsion","fontScale","centerRingScale","leafOvergrowth","autoShrinkFactor","subcatCloudShrinkFactor"];
    var leMapKeys=["branchOverrides","subcatOverrides","kinkOverrides","subcatAngleOffsets","kinkAngleOffsets","branchSpokeAutoShrink","subcatSpokeAutoShrink"];
    function lePlainObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v)}
    function leValidateMap(map){if(!lePlainObject(map))return false;var keys=Object.keys(map);for(var i=0;i<keys.length;i++){var entry=map[keys[i]];if(typeof entry==="boolean")continue;if(typeof entry==="number"){if(!Number.isFinite(entry))return false;continue}if(!lePlainObject(entry))return false;var sub=Object.keys(entry);for(var j=0;j<sub.length;j++){var val=entry[sub[j]];if(typeof val==="boolean")continue;if(typeof val==="number"&&Number.isFinite(val))continue;return false}}return true}
    function leBuildImportedSettings(raw){
      var settings=raw;
      if(lePlainObject(raw)&&lePlainObject(raw.settings)){
        if(raw.app!==undefined&&raw.app!=="sexcapades")return{error:"That isn't a Sexcapades layout-settings export — nothing was applied."};
        if(raw.kind!==undefined&&raw.kind!=="layout-settings")return{error:"That export isn't layout settings — nothing was applied."};
        settings=raw.settings;
      }
      if(!lePlainObject(settings))return{error:"No layout settings found — nothing was applied."};
      var picked={},found=0,key,i;
      for(i=0;i<leBoolKeys.length;i++){key=leBoolKeys[i];if(settings[key]===undefined)continue;if(typeof settings[key]!=="boolean")return{error:"A layout setting has the wrong kind of value — nothing was applied."};picked[key]=settings[key];found++}
      for(i=0;i<leNumKeys.length;i++){key=leNumKeys[i];if(settings[key]===undefined)continue;if(typeof settings[key]!=="number"||!Number.isFinite(settings[key]))return{error:"A layout setting has the wrong kind of value — nothing was applied."};picked[key]=settings[key];found++}
      if(settings.spacing!==undefined){if(typeof settings.spacing!=="string"||!(bundles[settings.spacing]||settings.spacing==="custom"))return{error:"Those settings name a spacing this build doesn't know — nothing was applied."};picked.spacing=settings.spacing;found++}
      if(settings.branchOrder!==undefined){if(typeof settings.branchOrder!=="string"||!settings.branchOrder)return{error:"Those settings are missing their branch order — nothing was applied."};var orderOk=false;document.querySelectorAll("[data-branch-order]").forEach(function(b){if(b.dataset.branchOrder===settings.branchOrder)orderOk=true});if(!orderOk)return{error:"Those settings name a branch order this build doesn't know — nothing was applied."};picked.branchOrder=settings.branchOrder;found++}
      if(settings.collision!==undefined){if(["grow","shrink","both","off"].indexOf(settings.collision)<0)return{error:"Those settings name a collision mode this build doesn't know — nothing was applied."};picked.collision=settings.collision;found++}
      if(settings.solverMidline!==undefined){if(["off","repulsion","settle","full","legacy"].indexOf(settings.solverMidline)<0)return{error:"Those settings name a settle method this build doesn't know — nothing was applied."};picked.solverMidline=settings.solverMidline;found++}
      for(i=0;i<leMapKeys.length;i++){key=leMapKeys[i];if(settings[key]===undefined)continue;if(!leValidateMap(settings[key]))return{error:"A layout setting has the wrong kind of value — nothing was applied."};picked[key]=copyOverrides(settings[key]);found++}
      if(!found)return{error:"No layout settings found — nothing was applied."};
      var next=collect();
      Object.keys(picked).forEach(function(k){next[k]=picked[k]});
      return{settings:next,solverPicked:picked.solverMidline};
    }
    // Inverse of settingsHash() for the Paste route: a copied share
    // link (or a bare #layout-… fragment) decodes back into the same
    // settings object the JSON routes carry. settingsHash() semantics
    // are untouched; this only reads what it writes.
    function leSettingsFromLink(text){
      var hashAt=text.indexOf("#"),hash=hashAt>=0?text.slice(hashAt+1):(text.indexOf("layout-")===0?text:"");
      if(!hash)return null;
      try{hash=decodeURIComponent(hash)}catch (error) { __sxErrLog("layout-import-link-decode", error); }
      var params={};hash.split("&").forEach(function(item){var at=item.indexOf("=");if(at>0)params[item.slice(0,at)]=item.slice(at+1)});
      if(!Object.keys(params).some(function(k){return k.indexOf("layout-")===0}))return null;
      var out={};
      function flag(name,key){if(params[name]!==undefined)out[key]=params[name]==="1"}
      function num(name,key){if(params[name]!==undefined){var v=Number(params[name]);if(!Number.isFinite(v))throw new Error("bad layout number");out[key]=v}}
      if(params["layout-spacing"]!==undefined)out.spacing=params["layout-spacing"];
      if(params["layout-branchOrder"]!==undefined)out.branchOrder=params["layout-branchOrder"];
      if(params["layout-collision"]!==undefined)out.collision=params["layout-collision"];
      if(params["layout-solverMidline"]!==undefined)out.solverMidline=params["layout-solverMidline"];
      flag("layout-propFan","propFan");flag("layout-subcatOrder","subcatOrder");flag("layout-staggerDensity","staggerDensity");flag("layout-stagger","stagger");flag("layout-expandAll","expandAll");flag("layout-crossmin","crossmin");flag("layout-nudge","nudge");flag("layout-showRelations","showRelations");flag("layout-repulsionEnabled","repulsionEnabled");flag("layout-staticMap","staticMap");flag("layout-animations","animations");flag("layout-mapSliders","mapSliders");
      num("layout-spokeLen","spokeLen");num("layout-subLen","subLen");num("layout-pad","pad");num("layout-repulsion","repulsion");num("layout-fontScale","fontScale");num("layout-centerRingScale","centerRingScale");num("layout-leafOvergrowth","leafOvergrowth");num("layout-autoShrinkFactor","autoShrinkFactor");num("layout-subcatCloudShrinkFactor","subcatCloudShrinkFactor");
      var groups=[["layout-branches","branchOverrides"],["layout-subcatOverrides","subcatOverrides"],["layout-kinkOverrides","kinkOverrides"],["layout-subcatAngleOffsets","subcatAngleOffsets"],["layout-kinkAngleOffsets","kinkAngleOffsets"],["layout-branchSpokeAutoShrink","branchSpokeAutoShrink"],["layout-subcatSpokeAutoShrink","subcatSpokeAutoShrink"]];
      groups.forEach(function(pair){if(params[pair[0]]===undefined)return;var packed=params[pair[0]].replace(/-/g,"+").replace(/_/g,"/");while(packed.length%4)packed+="=";out[pair[1]]=JSON.parse(decodeURIComponent(escape(atob(packed))))});
      return out;
    }
    function leImportSettingsText(text,sourceLabel){
      var trimmed=String(text==null?"":text).trim();
      if(!trimmed)return{ok:false,error:"Nothing to apply yet — paste or load the settings first."};
      var built=null;
      try{
        if(trimmed.charAt(0)==="{")built=leBuildImportedSettings(JSON.parse(trimmed));
        else{var fromLink=leSettingsFromLink(trimmed);built=fromLink?leBuildImportedSettings(fromLink):{error:"That doesn't look like layout settings — nothing was applied."}}
      }catch (error) { __sxErrLog("layout-import", error);built={error:"Those settings couldn't be read — nothing was applied."} }
      if(!built||built.error)return{ok:false,error:(built&&built.error)||"Those settings couldn't be read — nothing was applied."};
      apply(built.settings,sourceLabel==="file"?"Settings loaded":"Settings applied");
      if(built.solverPicked!==undefined){try{setSolverMode(built.solverPicked);writeSolverModeHash(built.solverPicked)}catch (error) { __sxErrLog("layout-import-solver", error); }}
      return{ok:true};
    }
    var layoutImportStatusTimer=null;
    function showLayoutImportStatus(message,ms){var status=document.getElementById("layoutCopyStatus");if(!status)return;status.textContent=message;if(layoutImportStatusTimer)clearTimeout(layoutImportStatusTimer);layoutImportStatusTimer=setTimeout(function(){layoutImportStatusTimer=null;status.textContent=""},ms||3500)}
    var loadBtn=document.getElementById("layoutLoad"),loadFile=document.getElementById("layoutLoadFile");
    if(loadBtn&&loadFile){
      loadBtn.addEventListener("click",function(){loadFile.click()});
      loadFile.addEventListener("change",function(){
        var file=loadFile.files&&loadFile.files[0];loadFile.value="";
        if(!file)return;
        function done(text){var r=leImportSettingsText(text,"file");if(r.ok)showLayoutImportStatus("Settings loaded from file");else showLayoutImportStatus(r.error,5000)}
        function readFailed(){showLayoutImportStatus("That file couldn't be read — nothing was applied.",5000)}
        if(typeof file.text==="function")file.text().then(done,readFailed);
        else{var reader=new FileReader();reader.onload=function(){done(String(reader.result||""))};reader.onerror=readFailed;reader.readAsText(file)}
      });
    }
    var pasteBtn=document.getElementById("layoutPaste"),pasteDialog=document.getElementById("layoutPasteDialog"),pasteText=document.getElementById("layoutPasteText"),pasteError=document.getElementById("layoutPasteError");
    function leClosePaste(){if(!pasteDialog)return;if(typeof pasteDialog.close==="function"&&pasteDialog.open)pasteDialog.close();else pasteDialog.removeAttribute("open")}
    if(pasteBtn&&pasteDialog&&pasteText){
      pasteBtn.addEventListener("click",function(){if(pasteError){pasteError.hidden=true;pasteError.textContent=""}if(typeof pasteDialog.showModal==="function"){if(!pasteDialog.open)pasteDialog.showModal()}else pasteDialog.setAttribute("open","");setTimeout(function(){pasteText.focus()},0)});
      var pasteApplyBtn=document.getElementById("layoutPasteApply");
      if(pasteApplyBtn)pasteApplyBtn.addEventListener("click",function(){
        var r=leImportSettingsText(pasteText.value,"paste");
        if(r.ok){leClosePaste();showLayoutImportStatus("Settings pasted and applied")}
        else if(pasteError){pasteError.textContent=r.error;pasteError.hidden=false}
      });
      var pasteCancelBtn=document.getElementById("layoutPasteCancel"),pasteCloseBtn=document.getElementById("layoutPasteClose");
      if(pasteCancelBtn)pasteCancelBtn.addEventListener("click",leClosePaste);
      if(pasteCloseBtn)pasteCloseBtn.addEventListener("click",leClosePaste);
    }
    // Save as defaults (Build 2026-10-19_1742): store the current
    // settings in this browser as the personal defaults; they load
    // automatically on the next visit (see the layout init script).
    // Same payload shape as Export settings. "Reset to defaults"
    // clears the saved copy and returns to the shipped defaults.
    var saveDefaultsBtn=document.getElementById("layoutSaveDefaults");
    if(saveDefaultsBtn)saveDefaultsBtn.addEventListener("click",function(){
      var payload={app:"sexcapades",kind:"layout-settings",version:3,build:(document.querySelector('meta[name="sexcapades-build"]') || {}).content || "",exportedAt:new Date().toISOString(),settings:collect(),hash:settingsHash()};
      var saved=false;
      // Deliberate save (Group 4, G4-6): this button is the ONLY path
      // that persists layout edits across reloads. The write is
      // verified by reading it back before "Saved!" is shown, and the
      // legacy branch-order key is aligned to the saved value so the
      // boot-time branch-order lookup cannot resurrect a different,
      // unsaved pick over the saved layout.
      try{var payloadJson=JSON.stringify(payload);window.localStorage&&window.localStorage.setItem("sexcapades-layout-savedDefaults",payloadJson);window.localStorage&&window.localStorage.setItem("sexcapades-layout-branchOrder",(payload.settings&&payload.settings.branchOrder)||"landscape-antipodal");saved=!!(window.localStorage&&window.localStorage.getItem("sexcapades-layout-savedDefaults")===payloadJson)}catch (error) { __sxErrLog("layout-saved-defaults", error); }
      var original=saveDefaultsBtn.textContent;saveDefaultsBtn.textContent=saved?"Saved!":"Couldn't save";
      setTimeout(function(){saveDefaultsBtn.textContent=original},1600);
    });
    sync();
    (function bootDisplayClasses() {
      var svg = document.getElementById("mapSvg"), c = config();
      if (!svg || !c) return;
      svg.classList.toggle("relations-off", !c.showRelations);
      svg.classList.toggle("is-static", !!c.staticMap);
    })();
    watchMap();
    if(!customSpacing)customSpacing=spacingValuesOf(config());
    // Late-joiner handover (Group 4, G4-1): a window that opens after
    // another window has been tuning adopts the current editor chrome
    // state — metric selection, overlay visibility, power-user,
    // fullscreen, and the Custom spacing stash — from the live-sync
    // key, so overlay state is handed over instead of booting factory
    // editor state. Geometry is NOT taken from the live key: it still
    // comes from the URL hash / saved defaults / shipped defaults
    // exactly as before (Group 4, G4-6 deliberate-save shape).
    try{var liveRaw=window.localStorage&&window.localStorage.getItem("sexcapades-layout-liveSettings");if(liveRaw){var liveParsed=JSON.parse(liveRaw);if(liveParsed&&liveParsed.editor)applyEditorState(liveParsed.editor)}}catch (error) { __sxErrLog("layout-editor-handover", error); }
    window.addEventListener("resize",scheduleScores);
    window.__SEXCAPADES_LAYOUT_TEST={get:function(){return config()},set:function(next){apply(next||{});return config()},defaults:function(){document.getElementById("layoutReset").click();return config()},hash:settingsHash,importText:function(text){return leImportSettingsText(text,"test")},open:open,scores:updateScores,focusNode:focusEditorOn};
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ready):ready();
})();


(function(){
  // Cross-tab live sync receiver (Build 2026-10-19_1742): the Layout
  // Editor writes its settings to localStorage as they change; the
  // storage event fires in every OTHER open tab or window (never in
  // the one that wrote), and the map here applies them live — tune in
  // one window, watch the map follow in the other. This key is never
  // read on page load: live updates only. (Saved personal defaults
  // live under the separate "sexcapades-layout-savedDefaults" key.)
  window.addEventListener("storage",function(e){
    if(!e||e.key!=="sexcapades-layout-liveSettings"||!e.newValue)return;
    try{
      var parsed=JSON.parse(e.newValue),settings=parsed&&parsed.settings;
      if(!settings||typeof settings!=="object")return;
      if(window.__SEXCAPADES_LAYOUT_API&&window.__SEXCAPADES_LAYOUT_API.apply)window.__SEXCAPADES_LAYOUT_API.apply(settings);
      else if(window.__SEXCAPADES_LAYOUT)Object.assign(window.__SEXCAPADES_LAYOUT,settings);
      var lePanel=document.getElementById("layoutEditor");
      if(lePanel&&!lePanel.hidden&&window.__SEXCAPADES_LAYOUT_UI&&window.__SEXCAPADES_LAYOUT_UI.sync)window.__SEXCAPADES_LAYOUT_UI.sync();
      var editorState=parsed&&parsed.editor;
      if(editorState&&typeof editorState==="object"&&window.__SEXCAPADES_LAYOUT_UI&&window.__SEXCAPADES_LAYOUT_UI.applyEditorState)window.__SEXCAPADES_LAYOUT_UI.applyEditorState(editorState);
    }catch (error) { __sxErrLog("layout-live-sync", error); }
  });
})();


// Clear-selection chip wiring: visibility tracks the map's selection
// render state (a .selected-spoke under a node group, or an is-preview
// focus group) through a MutationObserver, independent of the Layout
// Editor panel. Clicking runs the same clear path as the panel's Clear
// selection button (__SEXCAPADES_LAYOUT_UI.clearSelection, which also
// resets the editor selects), falling back to the bundle API.
(function () {
  function boot() {
    var btn = document.getElementById("mapClearSelection");
    var svg = document.getElementById("mapSvg");
    if (!btn || !svg) return;
    function hasSelection() {
      return Boolean(svg.querySelector(".selected-spoke") || svg.querySelector(".node-group.is-preview"));
    }
    var queued = false;
    function sync() {
      if (queued) return;
      queued = true;
      var tm = window.SexcapadesRuntime && window.SexcapadesRuntime.TimerManager;
      var schedule = (tm && typeof tm.requestAnimationFrame === "function")
        ? function (cb) { tm.requestAnimationFrame(cb); }
        : function (cb) { window.requestAnimationFrame(cb); };
      schedule(function () { queued = false; btn.hidden = !hasSelection(); });
    }
    btn.addEventListener("click", function () {
      var done = false;
      try {
        if (window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.clearSelection) done = Boolean(window.__SEXCAPADES_LAYOUT_UI.clearSelection());
      } catch (e) { try { __sxErrLog("map-clear-selection", e); } catch (_) {} }
      if (!done) {
        try {
          if (window.__SEXCAPADES_LAYOUT_API && window.__SEXCAPADES_LAYOUT_API.clearSelection) window.__SEXCAPADES_LAYOUT_API.clearSelection();
        } catch (e) { try { __sxErrLog("map-clear-selection-api", e); } catch (_) {} }
      }
      sync();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (document.querySelector("dialog[open]")) return;
      var panel = document.getElementById("layoutEditor");
      if (panel && !panel.hidden) return;
      var menu = document.getElementById("viewNavMenu");
      if (menu && !menu.hidden) return;
      if (!hasSelection()) return;
      e.preventDefault();
      btn.click();
    });
    if (window.MutationObserver) {
      new MutationObserver(sync).observe(svg, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


// Triple-tap the center node opens the Layout Editor (Build 2026-10-19 —
// restored for touch screens, where Ctrl+Shift+L is unavailable). Three
// taps on the center node's hit area within 1000ms of each other, without
// drifting, trigger the same open() as the keyboard shortcut.
(function () {
  var taps = 0, lastAt = 0, lastX = 0, lastY = 0;
  document.addEventListener("pointerdown", function (e) {
    var t = e.target;
    if (!t || !t.closest || !t.closest(".center-hit,.center-photo,.center-label")) { taps = 0; return; }
    var now = performance.now();
    if (now - lastAt > 1000 || Math.hypot(e.clientX - lastX, e.clientY - lastY) > 32) taps = 0;
    taps++; lastAt = now; lastX = e.clientX; lastY = e.clientY;
    if (taps >= 3) {
      taps = 0;
      try {
        var cardClose = document.getElementById("closeCenterProfileCard");
        if (cardClose && cardClose.offsetParent !== null) cardClose.click();
      } catch (err) { try { __sxErrLog("triple-tap-card", err); } catch (_) {} }
      try {
        if (window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.open) window.__SEXCAPADES_LAYOUT_UI.open();
      } catch (err) { try { __sxErrLog("triple-tap-layout", err); } catch (_) {} }
    }
  }, true);
})();
// Sexcapades Runtime Patches Entry
// Most runtime patches have been folded into modular source files in app/js/modules/
// (01-dispatcher through 09-profile-storage and view-nav.js).
// This file serves as the fallback queue gate and houses client-side Gemini BYOK generation for Scribe.

var __sxInitQueue = window.__sxInitQueue || [];
var __sxInitFlushed = window.__sxInitFlushed || false;
function __sxRunInit(fn) {
  try { fn(); } catch (e) { if (typeof __sxErrLog === "function") __sxErrLog("consolidated-init", e); }
}
var __sxInit = window.__sxInit || function(fn) {
  if (window.__sxInitFlushed) { __sxRunInit(fn); return; }
  __sxInitQueue.push(fn);
};
function __sxFlushInit() {
  if (window.__sxInitFlushed) return;
  window.__sxInitFlushed = true;
  var queue = __sxInitQueue;
  __sxInitQueue = [];
  for (var i = 0; i < queue.length; i++) __sxRunInit(queue[i]);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", __sxFlushInit, { once: true });
} else {
  if (window.SexcapadesRuntime && SexcapadesRuntime.TimerManager) {
    SexcapadesRuntime.TimerManager.setTimeout(__sxFlushInit, 0);
  } else {
    setTimeout(__sxFlushInit, 0);
  }
}

// --------------------------------------------------------------------------
// Scribe AI Story Generator (Gemini BYOK - Bring Your Own Key)
// --------------------------------------------------------------------------
__sxInit(function initScribeGeminiBYOK() {
  var keyInput = document.getElementById("scribeGeminiKey");
  var saveKeyBtn = document.getElementById("scribeSaveKeyBtn");
  var clearKeyBtn = document.getElementById("scribeClearKeyBtn");
  var keyStatus = document.getElementById("scribeKeyStatus");
  var genStoryBtn = document.getElementById("scribeGenerateStoryBtn");
  var stopStoryBtn = document.getElementById("scribeStopStoryBtn");
  var modelSelect = document.getElementById("scribeGeminiModel");
  var storyContainer = document.getElementById("scribeStoryOutputContainer");
  var storyText = document.getElementById("scribeStoryText");
  var storyStatus = document.getElementById("scribeStoryStatus");
  var copyStoryBtn = document.getElementById("scribeCopyStoryBtn");
  var downloadStoryBtn = document.getElementById("scribeDownloadStoryBtn");

  var providerSelect = document.getElementById("scribeAiProvider");
  var getKeyLink = document.getElementById("scribeGetKeyLink");

  function getActiveProvider() {
    return (providerSelect ? providerSelect.value : "gemini") || "gemini";
  }

  function getStorageKey(provider) {
    if (provider === "grok") return "sx_grok_byok_api_key";
    if (provider === "openai") return "sx_openai_byok_api_key";
    return "sx_gemini_byok_api_key";
  }

  var activeAbortController = null;
  var autoNarrateAfterStoryGen = false;

  var PROVIDER_CONFIG = {
    gemini: {
      placeholder: "Paste Gemini API key (AIzaSy...)",
      link: "https://aistudio.google.com/app/apikey",
      linkText: "Get free Google AI Studio key ↗",
      defaultModels: ["gemini-flash-latest", "gemini-3.7-flash", "gemini-pro-latest"]
    },
    grok: {
      placeholder: "Paste xAI Grok API key (xai-...)",
      link: "https://console.x.ai",
      linkText: "Get xAI Grok API key ↗",
      defaultModels: ["grok-2", "grok-2-latest", "grok-beta"]
    },
    openai: {
      placeholder: "Paste OpenAI API key (sk-...)",
      link: "https://platform.openai.com/api-keys",
      linkText: "Get OpenAI API key ↗",
      defaultModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]
    }
  };

  async function queryAvailableModels(apiKey, provider) {
    if (!apiKey) return [];
    if (provider === "gemini") {
      try {
        var res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(apiKey));
        if (!res.ok) return [];
        var data = await res.json();
        if (data && data.models) {
          return data.models.filter(function(m) {
            return m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent");
          }).map(function(m) {
            return m.name.replace(/^models\//, "");
          });
        }
      } catch (_) {}
    }
    return PROVIDER_CONFIG[provider]?.defaultModels || [];
  }

  async function populateTtsModelOptions(apiKey) {
    var select = document.getElementById("scribeNarrateModel");
    if (!select) return;
    var models = [
      "gemini-2.5-pro-preview-tts",
      "gemini-2.5-flash-preview-tts",
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-2.5-flash-tts"
    ];
    if (apiKey) {
      try {
        var lmResp = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(apiKey));
        if (lmResp.ok) {
          var lmData = await lmResp.json();
          if (lmData && lmData.models && Array.isArray(lmData.models)) {
            lmData.models.forEach(function(m) {
              var mName = (m.name || "").replace(/^models\//, "");
              var isGen = m.supportedGenerationMethods && m.supportedGenerationMethods.indexOf("generateContent") !== -1;
              if (isGen && mName.indexOf("-tts") !== -1) {
                if (models.indexOf(mName) === -1) models.push(mName);
              }
            });
          }
        }
      } catch (_) {}
    }
    models.sort(function(a, b) {
      var order = {
        "gemini-2.5-pro-preview-tts": 1,
        "gemini-2.5-flash-preview-tts": 2,
        "gemini-3.8-flash-tts": 3,
        "gemini-2.5-flash-tts": 4,
        "gemini-3.8-flash-lite-tts": 5
      };
      var oa = order[a] || 10, ob = order[b] || 10;
      return oa - ob;
    });
    var savedChoice = "";
    try { savedChoice = localStorage.getItem("sx_scribe_narrate_model") || ""; } catch (_) {}
    select.innerHTML = "";
    models.forEach(function(m) {
      var opt = document.createElement("option");
      opt.value = m;
      var label = m;
      if (m === "gemini-2.5-pro-preview-tts") label = "Gemini 2.5 Pro TTS (Studio Quality)";
      else if (m === "gemini-2.5-flash-preview-tts") label = "Gemini 2.5 Flash TTS (Latest / Clean)";
      else if (m === "gemini-3.8-flash-tts") label = "Gemini 3.8 Flash TTS";
      else if (m === "gemini-3.8-flash-lite-tts") label = "Gemini 3.8 Flash Lite TTS (Fast / Crackles)";
      opt.textContent = label;
      select.appendChild(opt);
    });
    if (savedChoice && models.indexOf(savedChoice) !== -1) {
      select.value = savedChoice;
    } else {
      select.value = "gemini-2.5-pro-preview-tts";
    }
  }

  async function populateModelOptions(apiKey, provider) {
    var select = document.getElementById("scribeGeminiModel");
    if (!select) return;
    if (provider === "gemini") {
      populateTtsModelOptions(apiKey);
    }
    var models = await queryAvailableModels(apiKey, provider);
    if (!models || models.length === 0) {
      models = PROVIDER_CONFIG[provider]?.defaultModels || [];
    } else if (provider === "gemini") {
      models.sort(function(a, b) {
        if (a === "gemini-flash-latest") return -1;
        if (b === "gemini-flash-latest") return 1;
        if (a === "gemini-3.7-flash") return -1;
        if (b === "gemini-3.7-flash") return 1;
        return 0;
      });
    }
    select.innerHTML = "";
    models.forEach(function(m, idx) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m + (idx === 0 ? " (Recommended)" : "");
      select.appendChild(opt);
    });
  }

  function loadSavedKey() {
    var prov = getActiveProvider();
    var cfg = PROVIDER_CONFIG[prov] || PROVIDER_CONFIG.gemini;
    if (keyInput) keyInput.placeholder = cfg.placeholder;
    if (getKeyLink) {
      getKeyLink.href = cfg.link;
      getKeyLink.textContent = cfg.linkText;
    }
    try {
      var saved = localStorage.getItem(getStorageKey(prov)) || "";
      if (keyInput) keyInput.value = saved;
      updateKeyUI(Boolean(saved));
      populateModelOptions(saved, prov);
    } catch (_) {}
  }

  function updateKeyUI(hasKey) {
    var prov = getActiveProvider();
    var provName = prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Google Gemini";
    if (keyStatus) {
      if (hasKey) {
        keyStatus.textContent = provName + " API key saved locally on your device.";
        keyStatus.style.color = "#4ade80";
      } else {
        keyStatus.textContent = "Enter your " + provName + " API key to enable direct " + (window.__SX_SCRIBE && "discussion" === window.__SX_SCRIBE.genre ? "discussion" : "story") + " generation.";
        keyStatus.style.color = "#94a3b8";
      }
    }
  }

  if (providerSelect) {
    providerSelect.addEventListener("change", function() {
      loadSavedKey();
    });
  }

  if (saveKeyBtn) {
    saveKeyBtn.addEventListener("click", function() {
      var prov = getActiveProvider();
      var val = (keyInput ? keyInput.value : "").trim();
      if (!val) {
        if (keyStatus) { keyStatus.textContent = "Please enter an API key first."; keyStatus.style.color = "#f87171"; }
        return;
      }
      try {
        localStorage.setItem(getStorageKey(prov), val);
        updateKeyUI(true);
        if (keyStatus) { keyStatus.textContent = "API key saved! Loading models…"; keyStatus.style.color = "#4ade80"; }
        populateModelOptions(val, prov).then(function() {
          if (keyStatus) { keyStatus.textContent = "API key verified & ready!"; keyStatus.style.color = "#4ade80"; }
        });
      } catch (err) {
        if (keyStatus) { keyStatus.textContent = "Failed to save key to browser storage."; keyStatus.style.color = "#f87171"; }
      }
    });
  }

  if (clearKeyBtn) {
    clearKeyBtn.addEventListener("click", function() {
      var prov = getActiveProvider();
      try {
        localStorage.removeItem(getStorageKey(prov));
      } catch (_) {}
      if (keyInput) keyInput.value = "";
      updateKeyUI(false);
      populateModelOptions("", prov);
      if (keyStatus) { keyStatus.textContent = "API key removed from this device."; keyStatus.style.color = "#94a3b8"; }
    });
  }

  loadSavedKey();

  if (copyStoryBtn) {
    copyStoryBtn.addEventListener("click", async function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyStoryBtn.textContent = "Copied!";
        setTimeout(function() { copyStoryBtn.textContent = "Copy story"; }, 1600);
      } catch (_) {
        if (storyText) {
          storyText.select();
          document.execCommand("copy");
          copyStoryBtn.textContent = "Copied!";
          setTimeout(function() { copyStoryBtn.textContent = "Copy story"; }, 1600);
        }
      }
    });
  }

  if (downloadStoryBtn) {
    downloadStoryBtn.addEventListener("click", function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) return;
      var blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "Sexcapades-Story.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() { URL.revokeObjectURL(url); }, 0);
    });
  }

  if (stopStoryBtn) {
    stopStoryBtn.addEventListener("click", function() {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
        if (storyStatus) storyStatus.textContent = "Generation cancelled.";
        if (genStoryBtn) genStoryBtn.disabled = false;
        stopStoryBtn.hidden = true;
      }
    });
  }

  // Token budget from the Scribe target length (2026-11-17): the model
  // needs enough output tokens to actually reach the target, or it
  // stops early at its own default. The target is read from the
  // dialog inputs (the bundle's module state is not reachable from
  // this file). A blank length on a YoBitch play-guide prompt means
  // the 5-minute default. Words convert at ~1.35 tokens
  // per word; pages ~450 words, paragraphs ~120, chapters ~2500,
  // minutes ~150 (spoken pace). Floored at 512, capped at 32768.
  function scribeTokenBudget(promptText) {
    var wordsPerUnit = { words: 1, paragraphs: 120, pages: 450, chapters: 2500, minutes: 150 };
    var unit = "pages", val = 1, blank = true;
    try {
      var lenEl = document.getElementById("scribePageCount");
      var unitEl = document.getElementById("scribeLengthUnit");
      var raw = lenEl ? String(lenEl.value || "").trim() : "";
      if (unitEl && unitEl.value && wordsPerUnit[unitEl.value]) unit = unitEl.value;
      if (raw) {
        blank = false;
        var nums = raw.match(/\d+(?:\.\d+)?/g) || [];
        var parsed = nums.map(function(n) { return parseFloat(n); }).filter(function(n) { return isFinite(n) && n > 0; });
        if (parsed.length) val = Math.max.apply(null, parsed);
      }
    } catch (_) {}
    if (blank) { val = 5; }
    var words = val * (wordsPerUnit[unit] || 450);
    var singular = unit.replace(/s$/, "");
    return { text: val + " " + (1 === val ? singular : unit), tokens: Math.min(32768, Math.max(512, Math.round(words * 1.35))) };
  }

  if (genStoryBtn) {
    genStoryBtn.addEventListener("click", async function() {
      var promptEl = document.getElementById("scenePromptText");
      var prompt = (promptEl ? promptEl.value : "").trim();
      if (!prompt) {
        alert("Please generate a Scribe prompt first by clicking 'Prompt' above.");
        return;
      }

      var prov = getActiveProvider();
      var apiKey = (keyInput ? keyInput.value : "").trim();
      if (!apiKey) {
        try { apiKey = localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
      }
      if (!apiKey) {
        alert("Please enter and save your " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + " API key to generate " + (window.__SX_SCRIBE && "discussion" === window.__SX_SCRIBE.genre ? "discussions" : "stories") + " directly with AI.");
        if (keyInput) keyInput.focus();
        return;
      }

      var modelSelect = document.getElementById("scribeGeminiModel");
      var modelInput = document.getElementById("scribeGeminiModelInput");
      var model = (modelSelect ? modelSelect.value : "") || (modelInput ? modelInput.value.trim() : "") || (prov === "grok" ? "grok-2" : prov === "openai" ? "gpt-4o" : "gemini-flash-latest");

      if (storyContainer) storyContainer.hidden = false;
      if (storyText) storyText.value = "";
      if (storyStatus) storyStatus.textContent = "Connecting to " + prov.toUpperCase() + " (" + model + ")…";
      if (genStoryBtn) genStoryBtn.disabled = true;
      if (stopStoryBtn) stopStoryBtn.hidden = false;

      try {
        storyContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}

      // Stopwatch Busy Indicator
      var stopwatchStart = Date.now();
      var stopwatchTimer = null;
      var swEl = document.getElementById("scribeStopwatch");
      var swTime = document.getElementById("scribeStopwatchTime");
      if (!swEl && storyStatus && storyStatus.parentNode) {
        swEl = document.createElement("span");
        swEl.id = "scribeStopwatch";
        swEl.style.cssText = "display:inline-flex;align-items:center;gap:4px;font-family:monospace;font-size:12px;font-weight:700;color:#facc15;background:rgba(15,23,42,0.85);padding:2px 8px;border-radius:4px;border:1px solid rgba(250,204,21,0.4);margin-left:8px;";
        swEl.innerHTML = '⏱️ <span id="scribeStopwatchTime">00:00</span>';
        storyStatus.parentNode.insertBefore(swEl, storyStatus.nextSibling);
        swTime = document.getElementById("scribeStopwatchTime");
      }
      if (swEl) swEl.style.display = "inline-flex";
      stopwatchTimer = setInterval(function() {
        var elapsedSec = Math.floor((Date.now() - stopwatchStart) / 1000);
        var mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
        var ss = String(elapsedSec % 60).padStart(2, "0");
        if (swTime) swTime.textContent = mm + ":" + ss;
      }, 200);

      activeAbortController = new AbortController();

      // Ensure request has a realistic completion timeout (120 seconds for long creative writing)
      var fetchTimer = setTimeout(function() {
        if (activeAbortController) {
          activeAbortController.abort();
          if (storyStatus) storyStatus.textContent = "Request timed out after 120 seconds.";
        }
      }, 120000);

      var scribeBudget = scribeTokenBudget(prompt);
      var hitTokenLimit = false;
      var fullPrompt = prompt + "\n\nWrite the complete, immersive narrative scene now as plain text, strictly honoring all character roles, boundaries, and pacing detailed above. Return ONLY plain text prose: do NOT generate code, Python scripts, ReportLab commands, or PDF/file outputs." + "\n\nTarget length: " + scribeBudget.text + ". Do not stop early: keep writing until the full target length is reached.";

      try {
        var totalText = "";

        // If auto-narrate is engaged on "▶ Play" and Gemini audio is selected, spin up live streaming narration
        if (autoNarrateAfterStoryGen) {
          var narrateEng = (narrateEngine ? narrateEngine.value : "gemini") || "gemini";
          var gemKey = (keyInput ? keyInput.value : "").trim();
          if (!gemKey) {
            try { gemKey = localStorage.getItem(getStorageKey("gemini")) || ""; } catch (_) {}
          }
          if (narrateEng === "gemini" && gemKey) {
            resetNarrationState();
            var chosenV = (geminiVoice ? geminiVoice.value : "Aoede") || "Aoede";
            var narrModelEl = document.getElementById("scribeNarrateModel");
            var chosenNarrModel = (narrModelEl && narrModelEl.value) ? narrModelEl.value : "gemini-2.5-pro-preview-tts";
            audioAbortController = new AbortController();
            var myToken = ++narrateGenToken;
            narrateChunksPlayed = 0;
            liveNarrator = createLiveStoryNarrator(gemKey, chosenV, chosenNarrModel, myToken);
            if (narrateStatus) {
              narrateStatus.textContent = "Live narration started (" + chosenNarrModel + ")…";
              narrateStatus.style.color = "#38bdf8";
            }
            if (startNarrateBtn) startNarrateBtn.disabled = true;
            if (stopNarrateBtn) stopNarrateBtn.hidden = false;
            if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
          }
        }

        function onStreamChunk(chunk) {
          if (!chunk) return;
          totalText += chunk;
          if (storyText) {
            storyText.value = totalText;
            storyText.scrollTop = storyText.scrollHeight;
          }
          var wc = (totalText.trim().match(/\S+/g) || []).length;
          if (storyStatus) {
            storyStatus.textContent = "Streaming story (" + wc + " words)…";
          }
          if (liveNarrator) {
            liveNarrator.feed(chunk);
          }
        }

        if (prov === "grok" || prov === "openai") {
          // Standard OpenAI-compatible Chat Completions API with streaming
          var chatEndpoint = prov === "grok" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
          console.log("[Scribe " + prov.toUpperCase() + "] Sending streaming request to:", chatEndpoint);

          if (storyStatus) storyStatus.textContent = "Writing story with " + prov.toUpperCase() + " (" + model + ")…";

          var response = await fetch(chatEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: "You are an expert creative writer specializing in rich, consensual, descriptive adult fiction and Literotica-style narratives." },
                { role: "user", content: fullPrompt }
              ],
              temperature: 0.9,
              max_tokens: scribeBudget.tokens,
              stream: true
            }),
            signal: activeAbortController.signal
          });

          clearTimeout(fetchTimer);

          if (!response.ok) {
            var errJson = null;
            try { errJson = await response.json(); } catch (_) {}
            var errMsg = errJson && errJson.error && errJson.error.message ? errJson.error.message : ("HTTP " + response.status);
            throw new Error(errMsg);
          }

          if (response.body && response.body.getReader) {
            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var sseBuf = "";
            for (;;) {
              var step = await reader.read();
              if (step.done) break;
              sseBuf += decoder.decode(step.value, { stream: true });
              var lines = sseBuf.split("\n");
              sseBuf = lines.pop();
              for (var i = 0; i < lines.length; i++) {
                var l = lines[i].trim();
                if (l.indexOf("data: ") === 0) {
                  var dataStr = l.slice(6).trim();
                  if (dataStr === "[DONE]") break;
                  try {
                    var parsed = JSON.parse(dataStr);
                    var delta = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
                    if (delta) onStreamChunk(delta);
                    var grokFr = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].finish_reason;
                    if (grokFr === "length") {
                      hitTokenLimit = true;
                      if (storyStatus) storyStatus.textContent = "Stopped at the token budget — the output was cut short at the length limit.";
                    }
                  } catch (_) {}
                }
              }
            }
          } else {
            var fallbackJson = await response.json();
            if (fallbackJson.choices && fallbackJson.choices[0] && fallbackJson.choices[0].message) {
              totalText = fallbackJson.choices[0].message.content || "";
            }
            if (fallbackJson.choices && fallbackJson.choices[0] && fallbackJson.choices[0].finish_reason === "length") hitTokenLimit = true;
          }
        } else {
          // Google Gemini API with SSE streaming & fallback cascade
          var payload = {
            contents: [
              {
                role: "user",
                parts: [{ text: fullPrompt }]
              }
            ],
            safetySettings: [
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: {
              temperature: 0.9,
              topP: 0.95,
              maxOutputTokens: scribeBudget.tokens
            }
          };

          var effectiveModel = model;
          if (!effectiveModel || effectiveModel === "gemini-2.0-flash" || effectiveModel === "gemini-flash-latest") {
            effectiveModel = "gemini-3.8-flash";
          }
          var fallbackModels = [effectiveModel, "gemini-3.8-flash", "gemini-2.5-flash", "gemini-pro-latest", "gemini-flash-latest"];
          fallbackModels = fallbackModels.filter(function(item, pos) { return fallbackModels.indexOf(item) === pos; });

          var streamedSuccessfully = false;
          var lastErrorMsg = "";

          for (var mIdx = 0; mIdx < fallbackModels.length; mIdx++) {
            var currentAttemptModel = fallbackModels[mIdx];
            var streamEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(currentAttemptModel) + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
            console.log("[Scribe Gemini BYOK] Attempting (" + (mIdx + 1) + "/" + fallbackModels.length + ") streaming with model:", currentAttemptModel);

            if (storyStatus) {
              storyStatus.textContent = "Connecting stream to " + currentAttemptModel + "…";
            }

            try {
              var response = await fetch(streamEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: activeAbortController.signal
              });

              console.log("[Scribe Gemini BYOK] Response status for " + currentAttemptModel + ":", response.status);

              if (!response.ok) {
                var responseText = await response.text();
                var parsed = null;
                try { parsed = JSON.parse(responseText); } catch (_) {}
                var errMsg = parsed && parsed.error && parsed.error.message ? parsed.error.message : ("HTTP " + response.status);
                lastErrorMsg = errMsg;

                if ((response.status === 503 || response.status === 404) && mIdx < fallbackModels.length - 1) {
                  console.warn("[Scribe Gemini BYOK] Model " + currentAttemptModel + " unavailable (" + response.status + "). Retrying with " + fallbackModels[mIdx + 1] + "…");
                  continue;
                }
                throw new Error(errMsg);
              }

              if (response.body && response.body.getReader) {
                var reader = response.body.getReader();
                var decoder = new TextDecoder();
                var sseBuf = "";
                for (;;) {
                  var step = await reader.read();
                  if (step.done) break;
                  sseBuf += decoder.decode(step.value, { stream: true });
                  var lines = sseBuf.split("\n");
                  sseBuf = lines.pop();
                  for (var i = 0; i < lines.length; i++) {
                    var l = lines[i].trim();
                    if (l.indexOf("data: ") === 0) {
                      var dataStr = l.slice(6).trim();
                      if (dataStr === "[DONE]") break;
                      try {
                        var chunkJson = JSON.parse(dataStr);
                        if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].content && chunkJson.candidates[0].content.parts) {
                          var partText = chunkJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
                          if (partText) onStreamChunk(partText);
                        }
                        if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].finishReason === "SAFETY") {
                          if (storyStatus) storyStatus.textContent = "Generation halted: triggered safety filter.";
                        }
                        if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].finishReason === "MAX_TOKENS") {
                          hitTokenLimit = true;
                          if (storyStatus) storyStatus.textContent = "Stopped at the token budget — the output was cut short at the length limit.";
                        }
                      } catch (_) {}
                    }
                  }
                }
                streamedSuccessfully = true;
                break;
              } else {
                var resText = await response.text();
                var fullJson = JSON.parse(resText);
                if (fullJson.candidates && fullJson.candidates[0] && fullJson.candidates[0].content && fullJson.candidates[0].content.parts) {
                  totalText = fullJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
                }
                if (fullJson.candidates && fullJson.candidates[0] && fullJson.candidates[0].finishReason === "MAX_TOKENS") hitTokenLimit = true;
                streamedSuccessfully = true;
                break;
              }
            } catch (attemptErr) {
              if (attemptErr.name === "AbortError") throw attemptErr;
              if (mIdx < fallbackModels.length - 1) {
                console.warn("[Scribe Gemini BYOK] Attempt failed: " + attemptErr.message + ". Trying fallback model…");
                continue;
              }
              throw attemptErr;
            }
          }

          clearTimeout(fetchTimer);
          if (!streamedSuccessfully && !totalText) {
            throw new Error(lastErrorMsg || "Failed to generate story across available models.");
          }
        }

        if (storyText && !storyText.value) {
          storyText.value = totalText;
          storyText.scrollTop = storyText.scrollHeight;
        }

        if (stopwatchTimer) { clearInterval(stopwatchTimer); stopwatchTimer = null; }
        var finalElapsedSec = Math.floor((Date.now() - stopwatchStart) / 1000);
        var fMm = String(Math.floor(finalElapsedSec / 60)).padStart(2, "0");
        var fSs = String(finalElapsedSec % 60).padStart(2, "0");
        if (swTime) swTime.textContent = fMm + ":" + fSs;

        var wordCount = (totalText.trim().match(/\S+/g) || []).length;
        if (storyStatus) {
          storyStatus.textContent = "Complete! (" + wordCount + " words in " + finalElapsedSec + "s via " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + ")" + (hitTokenLimit ? " — stopped at the token budget; the output was cut short. Raise the target length or regenerate for the full length." : "");
        }

        if (liveNarrator) {
          liveNarrator.finish();
          liveNarrator = null;
        }

        if (autoNarrateAfterStoryGen) {
          autoNarrateAfterStoryGen = false;
          // If live narration was already started, let it finish naturally; otherwise trigger startNarrateBtn
          if (!narratePlaybackMode && startNarrateBtn) {
            setTimeout(function() {
              startNarrateBtn.click();
            }, 300);
          }
        }
      } catch (err) {
        if (liveNarrator) {
          try { liveNarrator.finish(); } catch (_) {}
          liveNarrator = null;
        }
        autoNarrateAfterStoryGen = false;
        if (stopwatchTimer) { clearInterval(stopwatchTimer); stopwatchTimer = null; }
        if (err.name === "AbortError") {
          if (storyStatus) storyStatus.textContent = "Generation stopped by user.";
        } else {
          console.error("[Scribe AI Error]", err);
          if (storyStatus) storyStatus.textContent = "Error: " + err.message;
        }
      } finally {
        if (stopwatchTimer) { clearInterval(stopwatchTimer); stopwatchTimer = null; }
        if (genStoryBtn) genStoryBtn.disabled = false;
        if (stopStoryBtn) stopStoryBtn.hidden = true;
        activeAbortController = null;
        scribeSyncGenerateLabel();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Story Narration (Gemini Audio + Browser SpeechSynthesis fallback)
  // --------------------------------------------------------------------------
  var narrateEngine = document.getElementById("scribeNarrateEngine");
  var geminiVoiceGroup = document.getElementById("scribeGeminiVoiceGroup");
  var geminiVoice = document.getElementById("scribeGeminiVoice");
  var narrateSpeedSelect = document.getElementById("scribeNarrateSpeed");
  var startNarrateBtn = document.getElementById("scribeStartNarrateBtn");
  var pauseNarrateBtn = document.getElementById("scribePauseNarrateBtn");
  var stopNarrateBtn = document.getElementById("scribeStopNarrateBtn");
  var narrateStatus = document.getElementById("scribeNarrateStatus");
  var audioPlayer = document.getElementById("scribeAudioPlayer");

  function getNarrateSpeed() {
    var sp = 1.0;
    if (narrateSpeedSelect) {
      sp = parseFloat(narrateSpeedSelect.value) || 1.0;
    }
    return Math.max(0.5, Math.min(2.5, sp));
  }

  // Live speed adjustment for active audio player or future buffer sources
  if (narrateSpeedSelect) {
    try {
      var savedSpeed = localStorage.getItem("sx_scribe_narrate_speed");
      if (savedSpeed && narrateSpeedSelect.querySelector('option[value="' + savedSpeed + '"]')) {
        narrateSpeedSelect.value = savedSpeed;
      }
    } catch (_) {}
    narrateSpeedSelect.addEventListener("change", function() {
      var sp = getNarrateSpeed();
      try { localStorage.setItem("sx_scribe_narrate_speed", String(sp)); } catch (_) {}
      if (audioPlayer && !audioPlayer.hidden) {
        audioPlayer.playbackRate = sp;
      }
    });
  }

  var browserUtterance = null;
  var audioAbortController = null;

  // --- Streaming Gemini narration (Web Audio queue) ---
  // Gemini TTS can stream audio as it is synthesized (streamGenerateContent
  // returns raw 16-bit PCM chunks, 24 kHz mono). Each chunk is scheduled
  // into a Web Audio queue as it arrives, so playback starts almost
  // immediately instead of waiting for the whole clip. The unary
  // generateContent whole-file path is kept as the fallback.
  var narrateAudioCtx = null;
  var narrateNextStart = 0;
  var narrateChunksPlayed = 0;
  var narratePlaybackMode = null; // "webaudio" | "audioel" | "browser"
  var narrateGenToken = 0;
  var liveNarrator = null;

  function narrateCloseAudioCtx() {
    if (narrateAudioCtx) {
      try { narrateAudioCtx.close(); } catch (_) {}
      narrateAudioCtx = null;
    }
    narrateNextStart = 0;
  }

  function narrateEnsureAudioCtxRunning() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!narrateAudioCtx || narrateAudioCtx.state === "closed") {
        narrateAudioCtx = new AC();
      }
      if (narrateAudioCtx.state === "suspended") {
        narrateAudioCtx.resume();
      }
      try {
        var unlock = narrateAudioCtx.createBuffer(1, 1, 24000);
        var src = narrateAudioCtx.createBufferSource();
        src.buffer = unlock;
        src.connect(narrateAudioCtx.destination);
        src.start(0);
      } catch (_) {}
      return narrateAudioCtx;
    } catch (_) {
      return null;
    }
  }

  // Helper to generate proper audio payload based on model type
  function getAudioPayload(modelName, textToRead, voiceName) {
    var isTts = modelName.indexOf("-tts") !== -1;
    var textContent = isTts
      ? textToRead.slice(0, 4000)
      : ("Read the following text aloud with natural, engaging expressive narration. Do not add introductory or commentary remarks, speak only the exact text provided:\n\n" + textToRead.slice(0, 4000));
    return {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: textContent
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName
            }
          }
        }
      },
      safetySettings: [
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };
  }

  // Live sentence-by-sentence streaming narrator:
  // As story text streams in, buffers complete sentences, sends each to Gemini TTS
  // sequentially, and feeds audio chunks directly into Web Audio without gap.
  function createLiveStoryNarrator(apiKey, voiceName, modelName, token) {
    var buffer = "";
    var sentenceQueue = [];
    var isProcessing = false;
    var isFinished = false;

    async function processQueue() {
      if (isProcessing) return;
      isProcessing = true;
      while (sentenceQueue.length > 0) {
        if (token !== narrateGenToken) { isProcessing = false; return; }
        var sentence = sentenceQueue.shift();
        if (!sentence || !sentence.trim()) continue;

        // Dynamic voice update: read current live selection from dropdown if changed mid-stream
        var currentVoice = (geminiVoice ? geminiVoice.value : voiceName) || voiceName || "Aoede";

        var audioBase = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName);
        var streamEndpoint = audioBase + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
        var audioEndpoint = audioBase + ":generateContent?key=" + encodeURIComponent(apiKey);
        var payload = getAudioPayload(modelName, sentence.trim(), currentVoice);

        try {
          if (narrateStatus) {
            narrateStatus.textContent = "Narrating live (" + modelName + " · " + currentVoice + ")…";
            narrateStatus.style.color = "#4ade80";
          }
          await narrateStreamGeminiAudio(streamEndpoint, payload, audioAbortController ? audioAbortController.signal : null, token);
          narratePlaybackMode = "webaudio";
        } catch (streamErr) {
          if (token !== narrateGenToken) { isProcessing = false; return; }
          console.warn("[Live Story Narrator] Streaming chunk failed, attempting unary:", streamErr.message);
          try {
            await narratePlayGeminiUnary(audioEndpoint, payload, audioAbortController ? audioAbortController.signal : null, modelName);
          } catch (uErr) {
            console.warn("[Live Story Narrator] Unary failed:", uErr.message);
          }
        }
      }
      isProcessing = false;
      if (isFinished && sentenceQueue.length === 0) {
        if (narrateStatus) narrateStatus.textContent = "Finished live narration.";
        if (startNarrateBtn) startNarrateBtn.disabled = false;
      }
    }

    return {
      feed: function(chunkText) {
        if (token !== narrateGenToken) return;
        buffer += chunkText;
        // Split on sentence boundaries: (. ! ? \n\n) followed by whitespace, minimum 60 chars
        var parts = buffer.split(/([.!?]+(?:\s+|\n+)|(?:\r?\n){2,})/);
        if (parts.length > 2) {
          var assembled = "";
          for (var p = 0; p < parts.length - 1; p += 2) {
            var sent = (parts[p] + (parts[p + 1] || "")).trim();
            if (sent) {
              if (assembled.length < 80) {
                assembled += (assembled ? " " : "") + sent;
              } else {
                sentenceQueue.push(assembled);
                assembled = sent;
              }
            }
          }
          if (assembled) {
            if (assembled.length >= 80) {
              sentenceQueue.push(assembled);
              assembled = "";
            }
          }
          buffer = (assembled ? assembled + " " : "") + (parts[parts.length - 1] || "");
          processQueue();
        }
      },
      finish: function() {
        if (token !== narrateGenToken) return;
        isFinished = true;
        if (buffer.trim()) {
          sentenceQueue.push(buffer.trim());
          buffer = "";
        }
        processQueue();
      }
    };
  }

  function narrateQueuePcmChunk(pcmBytes) {
    if (!pcmBytes || pcmBytes.length < 2) return false;
    try {
      if (!narrateAudioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        narrateAudioCtx = new AC();
      }
      if (narrateAudioCtx.state === "suspended") narrateAudioCtx.resume();

      // If the incoming chunk has a 44-byte WAV header, strip it to feed raw PCM
      var offset = 0;
      if (pcmBytes.length > 44 &&
          pcmBytes[0] === 0x52 && pcmBytes[1] === 0x49 && pcmBytes[2] === 0x46 && pcmBytes[3] === 0x46 && // RIFF
          pcmBytes[8] === 0x57 && pcmBytes[9] === 0x41 && pcmBytes[10] === 0x56 && pcmBytes[11] === 0x45) { // WAVE
        offset = 44;
      }
      var pcmData = offset > 0 ? pcmBytes.subarray(offset) : pcmBytes;
      var len = Math.floor(pcmData.length / 2);
      if (len < 1) return false;
      var buf = narrateAudioCtx.createBuffer(1, len, 24000);
      var ch = buf.getChannelData(0);
      var view = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
      for (var i = 0; i < len; i++) ch[i] = view.getInt16(i * 2, true) / 32768;
      var src = narrateAudioCtx.createBufferSource();
      src.buffer = buf;
      var speed = getNarrateSpeed();
      src.playbackRate.value = speed;
      src.connect(narrateAudioCtx.destination);
      var now = narrateAudioCtx.currentTime;
      if (narrateNextStart < now) narrateNextStart = now + 0.05;
      src.start(narrateNextStart);
      narrateNextStart += (buf.duration / speed);
      narrateChunksPlayed++;
      return true;
    } catch (_) { return false; }
  }

  function narrateBase64ToBytes(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  // Reads a streamGenerateContent response and plays each audio chunk as it
  // arrives. Returns the number of chunks queued. Throws if the stream
  // carries no audio at all (caller falls back to the unary whole-clip path).
  async function narrateStreamGeminiAudio(streamEndpoint, payload, signal, myToken) {
    var resp = await fetch(streamEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: signal
    });
    if (!resp.ok) {
      var errObj = null;
      try { errObj = await resp.json(); } catch (_) {}
      var msg = errObj && errObj.error && errObj.error.message ? errObj.error.message : ("HTTP " + resp.status);
      throw new Error(msg);
    }
    if (!resp.body || !resp.body.getReader) throw new Error("Streaming response not supported in this browser.");
    var reader = resp.body.getReader();
    var decoder = new TextDecoder();
    var textBuf = "";
    var consumed = 0;
    var played = 0;
    var pairRe = /"mimeType"\s*:\s*"[^"]*"\s*,\s*"data"\s*:\s*"([A-Za-z0-9+/=]+)"/g;
    var pairRe2 = /"data"\s*:\s*"([A-Za-z0-9+/=]+)"\s*,\s*"mimeType"\s*:\s*"[^"]*"/g;
    var dataRe = /"data"\s*:\s*"([A-Za-z0-9+/=]{200,})"/g;
    for (;;) {
      var step = await reader.read();
      if (step.done) break;
      if (myToken !== narrateGenToken) { try { reader.cancel(); } catch (_) {} return played; }
      textBuf += decoder.decode(step.value, { stream: true });
      var found = false;
      pairRe.lastIndex = consumed;
      var m;
      while ((m = pairRe.exec(textBuf)) !== null) {
        if (myToken !== narrateGenToken) return played;
        if (narrateQueuePcmChunk(narrateBase64ToBytes(m[1]))) played++;
        consumed = pairRe.lastIndex;
        found = true;
      }
      if (!found) {
        pairRe2.lastIndex = consumed;
        while ((m = pairRe2.exec(textBuf)) !== null) {
          if (myToken !== narrateGenToken) return played;
          if (narrateQueuePcmChunk(narrateBase64ToBytes(m[1]))) played++;
          consumed = pairRe2.lastIndex;
          found = true;
        }
      }
      if (!found) {
        dataRe.lastIndex = consumed;
        while ((m = dataRe.exec(textBuf)) !== null) {
          if (myToken !== narrateGenToken) return played;
          if (narrateQueuePcmChunk(narrateBase64ToBytes(m[1]))) played++;
          consumed = dataRe.lastIndex;
        }
      }
      // Keep the buffer bounded on long narrations: drop already-played text.
      if (consumed > 0 && textBuf.length > 131072) { textBuf = textBuf.slice(consumed); consumed = 0; }
    }
    textBuf += decoder.decode();
    pairRe.lastIndex = consumed;
    var tail;
    var tailFound = false;
    while ((tail = pairRe.exec(textBuf)) !== null) {
      if (narrateQueuePcmChunk(narrateBase64ToBytes(tail[1]))) played++;
      consumed = pairRe.lastIndex;
      tailFound = true;
    }
    if (!tailFound) {
      pairRe2.lastIndex = consumed;
      while ((tail = pairRe2.exec(textBuf)) !== null) {
        if (narrateQueuePcmChunk(narrateBase64ToBytes(tail[1]))) played++;
        consumed = pairRe2.lastIndex;
      }
    }
    if (played === 0) throw new Error("Stream returned no audio.");
    return played;
  }

  // Unary whole-clip fallback: one generateContent call, full JSON,
  // base64 PCM wrapped in WAV or native WAV, played via <audio>.
  async function narratePlayGeminiUnary(audioEndpoint, payload, signal, modelName) {
    var resp = await fetch(audioEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: signal
    });
    if (!resp.ok) {
      var errObj = null;
      try { errObj = await resp.json(); } catch (_) {}
      var msg = errObj && errObj.error && errObj.error.message ? errObj.error.message : ("HTTP " + resp.status);
      throw new Error(msg);
    }
    var resultData = await resp.json();
    var audioPart = null;
    if (resultData.candidates && resultData.candidates[0] && resultData.candidates[0].content && resultData.candidates[0].content.parts) {
      for (var pIdx = 0; pIdx < resultData.candidates[0].content.parts.length; pIdx++) {
        var part = resultData.candidates[0].content.parts[pIdx];
        if (part.inlineData && part.inlineData.data) { audioPart = part.inlineData; break; }
      }
    }
    if (!audioPart || !audioPart.data) {
      var reason = "";
      if (resultData.candidates && resultData.candidates[0]) {
        var cand = resultData.candidates[0];
        if (cand.finishReason && cand.finishReason !== "STOP") {
          reason = " (finish reason: " + cand.finishReason + ")";
        }
        if (cand.content && cand.content.parts && cand.content.parts[0] && cand.content.parts[0].text) {
          reason += " (model returned text tokens instead of audio)";
        }
      } else if (resultData.promptFeedback && resultData.promptFeedback.blockReason) {
        reason = " (blocked: " + resultData.promptFeedback.blockReason + ")";
      }
      throw new Error("No audio stream returned" + (modelName ? (" by " + modelName) : "") + reason);
    }
    var bytes = narrateBase64ToBytes(audioPart.data);
    var mimeType = audioPart.mimeType || "audio/wav";
    var isAlreadyWav = bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // "RIFF"
      bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45; // "WAVE"

    var audioBlob;
    if (isAlreadyWav) {
      audioBlob = new Blob([bytes], { type: "audio/wav" });
    } else if (mimeType.indexOf("pcm") !== -1 || mimeType.indexOf("audio/L16") !== -1 || mimeType.indexOf("raw") !== -1) {
      audioBlob = pcmToWavBlob(bytes, 24000);
    } else if (mimeType.indexOf("wav") !== -1) {
      audioBlob = new Blob([bytes], { type: "audio/wav" });
    } else {
      audioBlob = pcmToWavBlob(bytes, 24000);
    }
    var audioUrl = URL.createObjectURL(audioBlob);
    if (audioPlayer) {
      audioPlayer.src = audioUrl;
      audioPlayer.playbackRate = getNarrateSpeed();
      audioPlayer.hidden = false;
      await audioPlayer.play();
    }
    narratePlaybackMode = "audioel";
    return true;
  }

  // Small read-only handle for live verification / diagnostics.
  window.__sxScribeNarrate = {
    chunksPlayed: function() { return narrateChunksPlayed; },
    mode: function() { return narratePlaybackMode; },
    audioState: function() { return narrateAudioCtx ? narrateAudioCtx.state : "none"; }
  };

  function updateNarrateEngineUI() {
    var isGemini = !narrateEngine || narrateEngine.value === "gemini";
    if (geminiVoiceGroup) geminiVoiceGroup.style.display = isGemini ? "flex" : "none";
    var modelGroup = document.getElementById("scribeNarrateModelGroup");
    if (modelGroup) modelGroup.style.display = isGemini ? "flex" : "none";
  }
  if (narrateEngine) narrateEngine.addEventListener("change", updateNarrateEngineUI);
  updateNarrateEngineUI();

  var narrateModelSelect = document.getElementById("scribeNarrateModel");
  if (narrateModelSelect) {
    narrateModelSelect.addEventListener("change", function() {
      try { localStorage.setItem("sx_scribe_narrate_model", narrateModelSelect.value); } catch (_) {}
    });
    try {
      var savedInit = localStorage.getItem("sx_scribe_narrate_model") || "";
      if (savedInit) narrateModelSelect.value = savedInit;
    } catch (_) {}
  }

  function pcmToWavBlob(pcmData, sampleRate) {
    var numChannels = 1;
    var bitsPerSample = 16;
    var byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    var blockAlign = numChannels * (bitsPerSample / 8);
    var dataSize = pcmData.length;
    var header = new ArrayBuffer(44);
    var view = new DataView(header);

    function writeString(offset, str) {
      for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    return new Blob([header, pcmData], { type: "audio/wav" });
  }

  function resetNarrationState(keepCtx) {
    if (liveNarrator) {
      try { liveNarrator.finish(); } catch (_) {}
      liveNarrator = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.hidden = true;
    }
    if (audioAbortController) {
      audioAbortController.abort();
      audioAbortController = null;
    }
    narrateGenToken++;
    if (!keepCtx) {
      narrateCloseAudioCtx();
    } else {
      narrateNextStart = 0;
      narrateChunksPlayed = 0;
    }
    narratePlaybackMode = null;
    if (startNarrateBtn) {
      startNarrateBtn.textContent = "▶ Play Narration";
      startNarrateBtn.disabled = false;
    }
    if (pauseNarrateBtn) pauseNarrateBtn.hidden = true;
    if (stopNarrateBtn) stopNarrateBtn.hidden = true;
    if (narrateStatus) narrateStatus.textContent = "Idle";
  }

  if (stopNarrateBtn) stopNarrateBtn.addEventListener("click", resetNarrationState);

  if (pauseNarrateBtn) {
    pauseNarrateBtn.addEventListener("click", function() {
      if (narrateEngine && narrateEngine.value === "browser" && window.speechSynthesis) {
        if (window.speechSynthesis.speaking) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            pauseNarrateBtn.textContent = "Pause";
            if (narrateStatus) narrateStatus.textContent = "Speaking…";
          } else {
            window.speechSynthesis.pause();
            pauseNarrateBtn.textContent = "Resume";
            if (narrateStatus) narrateStatus.textContent = "Paused";
          }
        }
      } else if (narratePlaybackMode === "webaudio" && narrateAudioCtx) {
        if (narrateAudioCtx.state === "suspended") {
          narrateAudioCtx.resume();
          pauseNarrateBtn.textContent = "Pause";
          if (narrateStatus) narrateStatus.textContent = "Playing Gemini voice…";
        } else {
          narrateAudioCtx.suspend();
          pauseNarrateBtn.textContent = "Resume";
          if (narrateStatus) narrateStatus.textContent = "Paused";
        }
      } else if (audioPlayer) {
        if (audioPlayer.paused) {
          audioPlayer.play();
          pauseNarrateBtn.textContent = "Pause";
          if (narrateStatus) narrateStatus.textContent = "Playing Gemini voice…";
        } else {
          audioPlayer.pause();
          pauseNarrateBtn.textContent = "Resume";
          if (narrateStatus) narrateStatus.textContent = "Paused";
        }
      }
    });
  }

  if (startNarrateBtn) {
    startNarrateBtn.addEventListener("click", async function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) {
        alert("Please generate or enter a story first before narrating.");
        return;
      }

      var engine = (narrateEngine ? narrateEngine.value : "gemini") || "gemini";

      if (engine === "browser") {
        if (!("speechSynthesis" in window)) {
          alert("Your browser does not support local speech synthesis. Please choose Gemini Voice instead.");
          return;
        }
        resetNarrationState();
        browserUtterance = new SpeechSynthesisUtterance(text);
        browserUtterance.rate = getNarrateSpeed() * 0.95;
        browserUtterance.pitch = 1.0;

        browserUtterance.onstart = function() {
          if (narrateStatus) narrateStatus.textContent = "Speaking…";
          if (startNarrateBtn) startNarrateBtn.textContent = "Restart";
          if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
          if (stopNarrateBtn) stopNarrateBtn.hidden = false;
        };
        browserUtterance.onend = function() {
          resetNarrationState();
          if (narrateStatus) narrateStatus.textContent = "Finished narrating.";
        };
        browserUtterance.onerror = function() {
          resetNarrationState();
          if (narrateStatus) narrateStatus.textContent = "Speech error.";
        };

        window.speechSynthesis.speak(browserUtterance);
        return;
      }

      // Gemini AI Studio Voice Output — streaming first, whole-clip fallback.
      var apiKey = (keyInput ? keyInput.value : "").trim();
      if (!apiKey) {
        try { apiKey = localStorage.getItem(getStorageKey("gemini")) || ""; } catch (_) {}
      }
      if (!apiKey) {
        alert("Please enter and save your Gemini API key above to use Gemini voice narration.");
        if (keyInput) keyInput.focus();
        return;
      }

      var chosenVoice = (geminiVoice ? geminiVoice.value : "Aoede") || "Aoede";
      resetNarrationState(true);
      narrateEnsureAudioCtxRunning();

      if (narrateStatus) {
        narrateStatus.textContent = "Generating voice with Gemini (" + chosenVoice + ")…";
        narrateStatus.style.color = "#38bdf8";
      }
      if (startNarrateBtn) startNarrateBtn.disabled = true;
      if (stopNarrateBtn) stopNarrateBtn.hidden = false;

      audioAbortController = new AbortController();
      var myToken = ++narrateGenToken;
      narrateChunksPlayed = 0;

      var narrateModelSelect = document.getElementById("scribeNarrateModel");
      var preferredModel = (narrateModelSelect && narrateModelSelect.value) ? narrateModelSelect.value : "gemini-2.5-pro-preview-tts";
      var ttsFallbackModels = [preferredModel, "gemini-2.5-flash-preview-tts", "gemini-2.5-flash-tts", "gemini-3.8-flash-tts"];
      ttsFallbackModels = ttsFallbackModels.filter(function(m, idx) { return ttsFallbackModels.indexOf(m) === idx; });

      var narrationSucceeded = false;
      var lastAudioErr = null;

      for (var tmIdx = 0; tmIdx < ttsFallbackModels.length; tmIdx++) {
        var chosenAudioModel = ttsFallbackModels[tmIdx];
        var currentPayload = getAudioPayload(chosenAudioModel, text, chosenVoice);
        var audioBase = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(chosenAudioModel);
        var streamEndpoint = audioBase + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
        var audioEndpoint = audioBase + ":generateContent?key=" + encodeURIComponent(apiKey);

        console.log("[Scribe Audio Narration] Selected TTS model (" + (tmIdx + 1) + "/" + ttsFallbackModels.length + "):", chosenAudioModel, "voice:", chosenVoice);
        if (narrateStatus) narrateStatus.textContent = "Connecting voice to " + chosenAudioModel + " (" + chosenVoice + ")…";

        try {
          // 1. Try streaming audio first
          await narrateStreamGeminiAudio(streamEndpoint, currentPayload, audioAbortController.signal, myToken);
          if (myToken !== narrateGenToken) return;
          narratePlaybackMode = "webaudio";
          if (narrateStatus) {
            narrateStatus.textContent = "Playing " + chosenAudioModel + " voice (" + chosenVoice + ", streaming)…";
            narrateStatus.style.color = "#4ade80";
          }
          if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
          if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
          narrationSucceeded = true;
          break;
        } catch (streamErr) {
          if (streamErr.name === "AbortError" || myToken !== narrateGenToken) {
            if (narrateStatus) narrateStatus.textContent = "Narration cancelled.";
            if (startNarrateBtn) startNarrateBtn.disabled = false;
            return;
          }
          if (narrateChunksPlayed > 0) {
            console.warn("[Scribe Audio Narration] Stream ended after " + narrateChunksPlayed + " chunks:", streamErr);
            narratePlaybackMode = "webaudio";
            if (narrateStatus) {
              narrateStatus.textContent = "Playing " + chosenAudioModel + " voice (" + chosenVoice + ", streaming)…";
              narrateStatus.style.color = "#4ade80";
            }
            if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
            if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
            narrationSucceeded = true;
            break;
          } else {
            console.warn("[Scribe Audio Narration] Streaming failed with " + chosenAudioModel + " (" + streamErr.message + "), trying unary whole clip…");

            // 2. Try unary generateContent with the user's chosen model
            try {
              if (narrateStatus) narrateStatus.textContent = "Generating voice with " + chosenAudioModel + " (" + chosenVoice + ")…";
              await narratePlayGeminiUnary(audioEndpoint, currentPayload, audioAbortController.signal, chosenAudioModel);
              if (myToken !== narrateGenToken) return;
              if (narrateStatus) {
                narrateStatus.textContent = "Playing " + chosenAudioModel + " voice (" + chosenVoice + ")…";
                narrateStatus.style.color = "#4ade80";
              }
              if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
              if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
              narrationSucceeded = true;
              break;
            } catch (unaryErr) {
              if (unaryErr.name === "AbortError") {
                if (narrateStatus) narrateStatus.textContent = "Narration cancelled.";
                if (startNarrateBtn) startNarrateBtn.disabled = false;
                return;
              }
              console.warn("[Scribe Audio Narration] Unary failed with " + chosenAudioModel + ":", unaryErr.message);
              lastAudioErr = unaryErr;
            }
          }
        }
      }

      if (!narrationSucceeded) {
        var errText = lastAudioErr ? lastAudioErr.message : "Failed to generate audio stream.";
        console.error("[Scribe Audio Narration Failed]", errText);
        if (narrateStatus) {
          narrateStatus.textContent = "Voice narration failed: " + errText;
          narrateStatus.style.color = "#f87171";
        }
        if (startNarrateBtn) {
          startNarrateBtn.textContent = "▶ Start Narration";
          startNarrateBtn.disabled = false;
        }
        if (stopNarrateBtn) stopNarrateBtn.hidden = true;
        if (pauseNarrateBtn) pauseNarrateBtn.hidden = true;
      }
    });
  }

  // --------------------------------------------------------------------------
  // Scribe compact three-button row (Prompt / Generate / Play).
  // The Prompt button keeps the existing #generateScribePrompt id (new label),
  // so its wiring in 05-compatibility.js is untouched.
  // --------------------------------------------------------------------------
  var scribeGenerateBtn = document.getElementById("scribeGenerateBtn");
  var scribePlayBtn = document.getElementById("scribePlayBtn");
  var scribeAiPanel = document.getElementById("scribeAiPanel");

  function scribeAiSetupReady() {
    var prov = getActiveProvider();
    var key = "";
    try { key = (keyInput ? keyInput.value : "").trim() || localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
    return Boolean(key);
  }

  function scribeSyncGenerateLabel() {
    if (!scribeGenerateBtn) return;
    if (!scribeAiSetupReady()) { scribeGenerateBtn.textContent = "Pick your AI"; return; }
    // Set up: label stays on the compact button only — it just renames to
    // Regenerate once a story exists, never grows into a full-width control.
    var hasStory = storyText && storyText.value && storyText.value.trim().length > 0;
    scribeGenerateBtn.textContent = hasStory ? "↻ Regenerate" : "✨ Generate";
  }

  function scribeOpenAiPanel() {
    if (scribeAiPanel) {
      try { scribeAiPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
    }
    if (keyInput) keyInput.focus();
    scribeSyncGenerateLabel();
  }

  if (scribeGenerateBtn) {
    scribeGenerateBtn.addEventListener("click", function() {
      if (!scribeAiSetupReady()) {
        // Not set up yet: first click opens the AI menu so the user picks
        // a provider and saves a key. The AI panel lives inside
        // #sceneBrief, which is hidden until a prompt exists — so generate
        // the prompt first to reveal the panel, then open it and focus
        // the key field.
        var promptEl0 = document.getElementById("scenePromptText");
        var briefEl0 = document.getElementById("sceneBrief");
        if ((!promptEl0 || !promptEl0.value.trim()) && briefEl0 && briefEl0.hidden) {
          var promptBtn0 = document.getElementById("generateScribePrompt");
          if (promptBtn0) promptBtn0.click();
        }
        scribeOpenAiPanel();
        return;
      }
      // Set up: make sure a prompt exists, then generate through the
      // existing one-click path.
      var promptEl = document.getElementById("scenePromptText");
      if (promptEl && !promptEl.value.trim()) {
        var promptBtn = document.getElementById("generateScribePrompt");
        if (promptBtn) promptBtn.click();
      }
      if (genStoryBtn) genStoryBtn.click();
    });
    // Double-click also generates: when set up, the first click already
    // starts it and the button disables itself, so the second is a no-op.
    scribeGenerateBtn.addEventListener("dblclick", function() {
      if (scribeAiSetupReady() && genStoryBtn && !genStoryBtn.disabled) genStoryBtn.click();
    });
  }

  if (scribePlayBtn) {
    scribePlayBtn.addEventListener("click", function() {
      // Ensure audio context is running synchronously on user click
      narrateEnsureAudioCtxRunning();

      // 1. If currently speaking/narrating, toggle pause/resume
      var isSpeaking = false;
      var isPaused = false;
      if (narratePlaybackMode === "webaudio" && narrateAudioCtx) {
        if (narrateAudioCtx.state === "running") isSpeaking = true;
        else if (narrateAudioCtx.state === "suspended") isPaused = true;
      } else if (audioPlayer && audioPlayer.src && !audioPlayer.hidden) {
        if (!audioPlayer.paused) isSpeaking = true;
        else if (audioPlayer.currentTime > 0 && audioPlayer.currentTime < audioPlayer.duration) isPaused = true;
      } else if (window.speechSynthesis && window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) isPaused = true;
        else isSpeaking = true;
      }

      if (isSpeaking || isPaused) {
        if (pauseNarrateBtn && !pauseNarrateBtn.hidden) {
          pauseNarrateBtn.click();
        } else if (isSpeaking && stopNarrateBtn) {
          stopNarrateBtn.click();
        }
        return;
      }

      // 2. If story generation is already running, mark to narrate when complete
      if (genStoryBtn && genStoryBtn.disabled) {
        autoNarrateAfterStoryGen = true;
        scribePlayBtn.textContent = "⏳ Narrating after generation…";
        return;
      }

      // 3. If story already generated and non-empty, start narration immediately
      var text = (storyText ? storyText.value : "").trim();
      if (text && text.length > 30) {
        if (startNarrateBtn) startNarrateBtn.click();
        return;
      }

      // 4. One-click flow: Generate prompt -> Generate story -> Narrate story
      if (!scribeAiSetupReady()) {
        var promptEl0 = document.getElementById("scenePromptText");
        var briefEl0 = document.getElementById("sceneBrief");
        if ((!promptEl0 || !promptEl0.value.trim()) && briefEl0 && briefEl0.hidden) {
          var promptBtn0 = document.getElementById("generateScribePrompt");
          if (promptBtn0) promptBtn0.click();
        }
        scribeOpenAiPanel();
        alert("Please enter and save your API key in Scribe to generate and narrate stories.");
        return;
      }

      // Make sure prompt exists
      var promptEl = document.getElementById("scenePromptText");
      var promptBtn = document.getElementById("generateScribePrompt");
      if (promptBtn) promptBtn.click();

      // Trigger generation with auto-narration flag
      autoNarrateAfterStoryGen = true;
      scribePlayBtn.textContent = "⏳ Generating…";
      setTimeout(function() {
        if (genStoryBtn && !genStoryBtn.disabled) genStoryBtn.click();
      }, 50);
    });
  }

  function syncScribePlayBtnState() {
    if (!scribePlayBtn) return;
    if (autoNarrateAfterStoryGen) {
      scribePlayBtn.textContent = "⏳ Generating…";
      return;
    }
    var isSpeaking = false;
    var isPaused = false;
    if (narratePlaybackMode === "webaudio" && narrateAudioCtx) {
      if (narrateAudioCtx.state === "running") isSpeaking = true;
      else if (narrateAudioCtx.state === "suspended") isPaused = true;
    } else if (audioPlayer && audioPlayer.src && !audioPlayer.hidden) {
      if (!audioPlayer.paused) isSpeaking = true;
      else if (audioPlayer.currentTime > 0 && audioPlayer.currentTime < audioPlayer.duration) isPaused = true;
    } else if (window.speechSynthesis && window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) isPaused = true;
      else isSpeaking = true;
    }

    if (isSpeaking) {
      scribePlayBtn.textContent = "⏸ Pause";
      scribePlayBtn.style.background = "#eab308";
    } else if (isPaused) {
      scribePlayBtn.textContent = "▶ Resume";
      scribePlayBtn.style.background = "#059669";
    } else {
      scribePlayBtn.textContent = "▶ Play";
      scribePlayBtn.style.background = "";
    }
  }

  setInterval(syncScribePlayBtnState, 500);
  syncScribePlayBtnState();

  // Keep the Generate label in step with the key/provider state.
  if (keyInput) keyInput.addEventListener("input", scribeSyncGenerateLabel);
  if (storyText) storyText.addEventListener("input", scribeSyncGenerateLabel);
  if (saveKeyBtn) saveKeyBtn.addEventListener("click", function() { setTimeout(scribeSyncGenerateLabel, 0); });
  if (clearKeyBtn) clearKeyBtn.addEventListener("click", function() { setTimeout(scribeSyncGenerateLabel, 0); });
  if (providerSelect) providerSelect.addEventListener("change", scribeSyncGenerateLabel);
  if (geminiVoice) {
    geminiVoice.addEventListener("change", function() {
      var newV = geminiVoice.value;
      console.log("[Scribe Audio Narration] Selected voice switched to:", newV);
      if (narrateStatus && (narratePlaybackMode === "webaudio" || liveNarrator)) {
        narrateStatus.textContent = "Voice switched to " + newV + " (active next sentence)…";
        narrateStatus.style.color = "#38bdf8";
      }
    });
  }
  scribeSyncGenerateLabel();

});

// --------------------------------------------------------------------------
// Scene Setter AI Play Guide Generator (BYOK - Bring Your Own Key)
// Mirrors Scribe's compact direct-to-AI treatment without audio narration.
// --------------------------------------------------------------------------
__sxInit(function initSceneSetterAi() {
  var keyInput = document.getElementById("setterGeminiKey");
  var saveKeyBtn = document.getElementById("setterSaveKeyBtn");
  var clearKeyBtn = document.getElementById("setterClearKeyBtn");
  var keyStatus = document.getElementById("setterKeyStatus");
  var genGuideBtn = document.getElementById("setterGeneratePlayGuideBtn");
  var stopGuideBtn = document.getElementById("setterStopPlayGuideBtn");
  var modelSelect = document.getElementById("setterGeminiModel");
  var guideContainer = document.getElementById("setterPlayGuideOutputContainer");
  var guideText = document.getElementById("setterPlayGuideText");
  var guideStatus = document.getElementById("setterPlayGuideStatus");
  var copyGuideBtn = document.getElementById("setterCopyPlayGuideBtn");
  var downloadGuideBtn = document.getElementById("setterDownloadPlayGuideBtn");
  var providerSelect = document.getElementById("setterAiProvider");
  var getKeyLink = document.getElementById("setterGetKeyLink");
  var setterGenerateBtn = document.getElementById("setterGenerateBtn");
  var setterAiPanel = document.getElementById("setterAiPanel");

  // Scene Setter skinning (2026-11-16): on a vanilla stance/belief
  // skin, Scene Setter moderates a discussion (genre "moderation" in
  // window.__SX_SETTER, published by the skin loader); on Sexcapades
  // it is a play checklist (genre "play"). The loader publishes the
  // spec on window, so this closure reads it directly. Named without
  // the sx prefix to avoid colliding with the bundle's
  // sxSetterIsModeration (same check, different scope).
  function setterIsModeration() {
    return !!(window.__SX_SETTER && window.__SX_SETTER.genre === "moderation");
  }

  var activeAbortController = null;

  var PROVIDER_CONFIG = {
    gemini: {
      placeholder: "Paste Gemini API key (AIzaSy...)",
      link: "https://aistudio.google.com/app/apikey",
      linkText: "Get free Google AI Studio key ↗",
      defaultModels: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-pro-latest"]
    },
    grok: {
      placeholder: "Paste xAI Grok API key (xai-...)",
      link: "https://console.x.ai",
      linkText: "Get xAI Grok API key ↗",
      defaultModels: ["grok-2", "grok-2-latest", "grok-beta"]
    },
    openai: {
      placeholder: "Paste OpenAI API key (sk-...)",
      link: "https://platform.openai.com/api-keys",
      linkText: "Get OpenAI API key ↗",
      defaultModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]
    }
  };

  function getActiveProvider() {
    return (providerSelect ? providerSelect.value : "gemini") || "gemini";
  }

  function getStorageKey(provider) {
    if (provider === "grok") return "sx_grok_byok_api_key";
    if (provider === "openai") return "sx_openai_byok_api_key";
    return "sx_gemini_byok_api_key";
  }

  async function queryAvailableModels(apiKey, provider) {
    if (!apiKey) return [];
    if (provider === "gemini") {
      try {
        var res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(apiKey));
        if (!res.ok) return [];
        var data = await res.json();
        if (data && data.models) {
          return data.models.filter(function(m) {
            return m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent");
          }).map(function(m) {
            return m.name.replace(/^models\//, "");
          });
        }
      } catch (_) {}
    }
    return PROVIDER_CONFIG[provider]?.defaultModels || [];
  }

  async function populateModelOptions(apiKey, provider) {
    if (!modelSelect) return;
    var models = await queryAvailableModels(apiKey, provider);
    if (!models || models.length === 0) {
      models = PROVIDER_CONFIG[provider]?.defaultModels || [];
    } else if (provider === "gemini") {
      models.sort(function(a, b) {
        if (a === "gemini-flash-latest") return -1;
        if (b === "gemini-flash-latest") return 1;
        if (a === "gemini-3.8-flash") return -1;
        if (b === "gemini-3.8-flash") return 1;
        return 0;
      });
    }
    modelSelect.innerHTML = "";
    models.forEach(function(m, idx) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m + (idx === 0 ? " (Recommended)" : "");
      modelSelect.appendChild(opt);
    });
  }

  function loadSavedKey() {
    var prov = getActiveProvider();
    var cfg = PROVIDER_CONFIG[prov] || PROVIDER_CONFIG.gemini;
    if (keyInput) keyInput.placeholder = cfg.placeholder;
    if (getKeyLink) {
      getKeyLink.href = cfg.link;
      getKeyLink.textContent = cfg.linkText;
    }
    try {
      var saved = localStorage.getItem(getStorageKey(prov)) || "";
      if (keyInput) keyInput.value = saved;
      updateKeyUI(Boolean(saved));
      populateModelOptions(saved, prov);
    } catch (_) {}
  }

  function updateKeyUI(hasKey) {
    var prov = getActiveProvider();
    var provName = prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Google Gemini";
    if (keyStatus) {
      if (hasKey) {
        keyStatus.textContent = provName + " API key saved locally on your device.";
        keyStatus.style.color = "#4ade80";
      } else {
        keyStatus.textContent = "Enter your " + provName + " API key to enable direct play guide generation.";
        keyStatus.style.color = "#94a3b8";
      }
    }
  }

  function setterAiSetupReady() {
    var prov = getActiveProvider();
    var key = "";
    try { key = (keyInput ? keyInput.value : "").trim() || localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
    return Boolean(key);
  }

  function setterSyncGenerateLabel() {
    if (!setterGenerateBtn) return;
    if (!setterAiSetupReady()) {
      setterGenerateBtn.textContent = "Pick your AI";
      return;
    }
    var hasGuide = guideText && guideText.value && guideText.value.trim().length > 0;
    setterGenerateBtn.textContent = hasGuide ? "↻ Regenerate" : (setterIsModeration() ? "✨ Generate Discussion Plan" : "✨ Generate Play Guide");
  }
  // The skin loader re-syncs this label on every skin switch (the
  // button text is JS-managed, so the loader's copy swap alone would
  // not reach it); the load-time call below covers the first boot.
  window.__sxSetterSyncGenerateLabel = setterSyncGenerateLabel;
  setterSyncGenerateLabel();

  function setterOpenAiPanel() {
    if (setterAiPanel) {
      try { setterAiPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
    }
    if (keyInput) keyInput.focus();
    setterSyncGenerateLabel();
  }

  if (providerSelect) {
    providerSelect.addEventListener("change", function() {
      loadSavedKey();
      setterSyncGenerateLabel();
    });
  }

  if (saveKeyBtn) {
    saveKeyBtn.addEventListener("click", function() {
      var prov = getActiveProvider();
      var val = (keyInput ? keyInput.value : "").trim();
      if (!val) {
        if (keyStatus) { keyStatus.textContent = "Please enter an API key first."; keyStatus.style.color = "#f87171"; }
        return;
      }
      try {
        localStorage.setItem(getStorageKey(prov), val);
        updateKeyUI(true);
        if (keyStatus) { keyStatus.textContent = "API key saved! Loading models…"; keyStatus.style.color = "#4ade80"; }
        populateModelOptions(val, prov).then(function() {
          if (keyStatus) { keyStatus.textContent = "API key verified & ready!"; keyStatus.style.color = "#4ade80"; }
        });
        setterSyncGenerateLabel();
      } catch (err) {
        if (keyStatus) { keyStatus.textContent = "Failed to save key to browser storage."; keyStatus.style.color = "#f87171"; }
      }
    });
  }

  if (clearKeyBtn) {
    clearKeyBtn.addEventListener("click", function() {
      var prov = getActiveProvider();
      try {
        localStorage.removeItem(getStorageKey(prov));
      } catch (_) {}
      if (keyInput) keyInput.value = "";
      updateKeyUI(false);
      populateModelOptions("", prov);
      if (keyStatus) { keyStatus.textContent = "API key removed from this device."; keyStatus.style.color = "#94a3b8"; }
      setterSyncGenerateLabel();
    });
  }

  loadSavedKey();

  if (copyGuideBtn) {
    copyGuideBtn.addEventListener("click", async function() {
      var text = (guideText ? guideText.value : "").trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyGuideBtn.textContent = "Copied!";
        setTimeout(function() { copyGuideBtn.textContent = "Copy play guide"; }, 1600);
      } catch (_) {
        if (guideText) {
          guideText.select();
          document.execCommand("copy");
          copyGuideBtn.textContent = "Copied!";
          setTimeout(function() { copyGuideBtn.textContent = "Copy play guide"; }, 1600);
        }
      }
    });
  }

  if (downloadGuideBtn) {
    downloadGuideBtn.addEventListener("click", function() {
      var text = (guideText ? guideText.value : "").trim();
      if (!text) return;
      var diag = document.getElementById("negotiationDialog");
      var pStr = diag ? diag.dataset.participants || "" : "";
      var ids = pStr.split(",").filter(Boolean);
      var blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "Sexcapades-" + (ids.length ? ids.join("-") : "scene") + "-play-guide.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() { URL.revokeObjectURL(url); }, 0);
    });
  }

  if (stopGuideBtn) {
    stopGuideBtn.addEventListener("click", function() {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
        if (guideStatus) guideStatus.textContent = "Generation cancelled.";
        if (genGuideBtn) genGuideBtn.disabled = false;
        stopGuideBtn.hidden = true;
      }
    });
  }

  if (genGuideBtn) {
    genGuideBtn.addEventListener("click", async function() {
      var ids = typeof window.__sxSetterParticipantIds === "function" ? window.__sxSetterParticipantIds() : [];
      if (!ids || ids.length < 2) {
        var diag = document.getElementById("negotiationDialog");
        var pStr = diag ? diag.dataset.participants || "" : "";
        ids = pStr.split(",").filter(Boolean);
      }

      var prompt = typeof window.__sxPlayGuidePromptText === "function" ? window.__sxPlayGuidePromptText() : "";
      if (!prompt) {
        var panel = document.getElementById("negotiationPanel");
        if (panel && panel.dataset.playGuide) prompt = panel.dataset.playGuide;
      }
      if (!prompt || (!ids || ids.length < 2)) {
        alert("Please select at least two profiles in Scene Setter first.");
        return;
      }

      var prov = getActiveProvider();
      var apiKey = (keyInput ? keyInput.value : "").trim();
      if (!apiKey) {
        try { apiKey = localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
      }
      if (!apiKey) {
        alert("Please enter and save your " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + (setterIsModeration() ? " API key to generate discussion plans directly with AI." : " API key to generate play guides directly with AI."));
        if (keyInput) keyInput.focus();
        return;
      }

      var model = (modelSelect ? modelSelect.value : "") || (prov === "grok" ? "grok-2" : prov === "openai" ? "gpt-4o" : "gemini-flash-latest");

      if (guideContainer) guideContainer.hidden = false;
      if (guideText) guideText.value = "";
      if (guideStatus) guideStatus.textContent = "Connecting to " + prov.toUpperCase() + " (" + model + ")…";
      if (genGuideBtn) genGuideBtn.disabled = true;
      if (stopGuideBtn) stopGuideBtn.hidden = false;

      try {
        guideContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}

      // Stopwatch Busy Indicator
      var stopwatchStart = Date.now();
      var stopwatchTimer = null;
      var swEl = document.getElementById("setterStopwatch");
      var swTime = document.getElementById("setterStopwatchTime");
      if (!swEl && guideStatus && guideStatus.parentNode) {
        swEl = document.createElement("span");
        swEl.id = "setterStopwatch";
        swEl.style.cssText = "display:inline-flex;align-items:center;gap:4px;font-family:monospace;font-size:12px;font-weight:700;color:#facc15;background:rgba(15,23,42,0.85);padding:2px 8px;border-radius:4px;border:1px solid rgba(250,204,21,0.4);margin-left:8px;";
        swEl.innerHTML = '⏱️ <span id="setterStopwatchTime">00:00</span>';
        guideStatus.parentNode.insertBefore(swEl, guideStatus.nextSibling);
        swTime = document.getElementById("setterStopwatchTime");
      }
      if (swEl) swEl.style.display = "inline-flex";
      stopwatchTimer = setInterval(function() {
        var elapsedSec = Math.floor((Date.now() - stopwatchStart) / 1000);
        var mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
        var ss = String(elapsedSec % 60).padStart(2, "0");
        if (swTime) swTime.textContent = mm + ":" + ss;
      }, 200);

      activeAbortController = new AbortController();

      var fetchTimer = setTimeout(function() {
        if (activeAbortController) {
          activeAbortController.abort();
          if (guideStatus) guideStatus.textContent = "Request timed out after 120 seconds.";
        }
      }, 120000);

      var fullPrompt = prompt + (setterIsModeration() ? "\n\nWrite the complete, timed discussion plan now in the EXACT required format specified above, adhering strictly to all ground rules and timecodes." : "\n\nWrite the complete, timed play guide now in the EXACT required format specified above, adhering strictly to all checklist agreements and timecodes.");

      try {
        var totalText = "";

        function onStreamChunk(chunk) {
          if (!chunk) return;
          totalText += chunk;
          if (guideText) {
            guideText.value = totalText;
            guideText.scrollTop = guideText.scrollHeight;
          }
          var wc = (totalText.trim().match(/\S+/g) || []).length;
          if (guideStatus) {
            guideStatus.textContent = (setterIsModeration() ? "Streaming discussion plan (" : "Streaming play guide (") + wc + " words)…";
          }
        }

        if (prov === "grok" || prov === "openai") {
          var chatEndpoint = prov === "grok" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
          console.log("[Scene Setter " + prov.toUpperCase() + "] Sending streaming request to:", chatEndpoint);

          if (guideStatus) guideStatus.textContent = (setterIsModeration() ? "Writing discussion plan with " : "Writing play guide with ") + prov.toUpperCase() + " (" + model + ")…";

          var response = await fetch(chatEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: setterIsModeration() ? "You are an expert discussion moderator who creates structured, balanced, moderated discussion plans." : "You are an expert intimacy and scene coordinator who creates structured, consensual, boundaried BDSM and intimacy play guides." },
                { role: "user", content: fullPrompt }
              ],
              temperature: 0.7,
              stream: true
            }),
            signal: activeAbortController.signal
          });

          clearTimeout(fetchTimer);

          if (!response.ok) {
            var errJson = null;
            try { errJson = await response.json(); } catch (_) {}
            var errMsg = errJson && errJson.error && errJson.error.message ? errJson.error.message : ("HTTP " + response.status);
            throw new Error(errMsg);
          }

          if (response.body && response.body.getReader) {
            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var sseBuf = "";
            for (;;) {
              var step = await reader.read();
              if (step.done) break;
              sseBuf += decoder.decode(step.value, { stream: true });
              var lines = sseBuf.split("\n");
              sseBuf = lines.pop();
              for (var i = 0; i < lines.length; i++) {
                var l = lines[i].trim();
                if (l.indexOf("data: ") === 0) {
                  var dataStr = l.slice(6).trim();
                  if (dataStr === "[DONE]") break;
                  try {
                    var parsed = JSON.parse(dataStr);
                    var delta = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
                    if (delta) onStreamChunk(delta);
                  } catch (_) {}
                }
              }
            }
          } else {
            var fallbackJson = await response.json();
            if (fallbackJson.choices && fallbackJson.choices[0] && fallbackJson.choices[0].message) {
              totalText = fallbackJson.choices[0].message.content || "";
            }
          }
        } else {
          // Google Gemini API with SSE streaming & fallback cascade
          var payload = {
            contents: [
              {
                role: "user",
                parts: [{ text: fullPrompt }]
              }
            ],
            safetySettings: [
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95
            }
          };

          var effectiveModel = model;
          if (!effectiveModel || effectiveModel === "gemini-2.0-flash" || effectiveModel === "gemini-flash-latest") {
            effectiveModel = "gemini-3.8-flash";
          }
          var fallbackModels = [effectiveModel, "gemini-3.8-flash", "gemini-2.5-flash", "gemini-pro-latest", "gemini-flash-latest"];
          fallbackModels = fallbackModels.filter(function(item, pos) { return fallbackModels.indexOf(item) === pos; });

          var streamedSuccessfully = false;
          var lastErrorMsg = "";

          for (var mIdx = 0; mIdx < fallbackModels.length; mIdx++) {
            var currentAttemptModel = fallbackModels[mIdx];
            var streamEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(currentAttemptModel) + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
            console.log("[Scene Setter Gemini BYOK] Attempting (" + (mIdx + 1) + "/" + fallbackModels.length + ") streaming with model:", currentAttemptModel);

            if (guideStatus) {
              guideStatus.textContent = "Connecting stream to " + currentAttemptModel + "…";
            }

            try {
              var response = await fetch(streamEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: activeAbortController.signal
              });

              console.log("[Scene Setter Gemini BYOK] Response status for " + currentAttemptModel + ":", response.status);

              if (!response.ok) {
                var responseText = await response.text();
                var parsed = null;
                try { parsed = JSON.parse(responseText); } catch (_) {}
                var errMsg = parsed && parsed.error && parsed.error.message ? parsed.error.message : ("HTTP " + response.status);
                lastErrorMsg = errMsg;

                if ((response.status === 503 || response.status === 404) && mIdx < fallbackModels.length - 1) {
                  console.warn("[Scene Setter Gemini BYOK] Model " + currentAttemptModel + " unavailable (" + response.status + "). Retrying with " + fallbackModels[mIdx + 1] + "…");
                  continue;
                }
                throw new Error(errMsg);
              }

              if (response.body && response.body.getReader) {
                var reader = response.body.getReader();
                var decoder = new TextDecoder();
                var sseBuf = "";
                for (;;) {
                  var step = await reader.read();
                  if (step.done) break;
                  sseBuf += decoder.decode(step.value, { stream: true });
                  var lines = sseBuf.split("\n");
                  sseBuf = lines.pop();
                  for (var i = 0; i < lines.length; i++) {
                    var l = lines[i].trim();
                    if (l.indexOf("data: ") === 0) {
                      var dataStr = l.slice(6).trim();
                      if (dataStr === "[DONE]") break;
                      try {
                        var chunkJson = JSON.parse(dataStr);
                        if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].content && chunkJson.candidates[0].content.parts) {
                          var partText = chunkJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
                          if (partText) onStreamChunk(partText);
                        }
                        if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].finishReason === "SAFETY") {
                          if (guideStatus) guideStatus.textContent = "Generation halted: triggered safety filter.";
                        }
                      } catch (_) {}
                    }
                  }
                }
                streamedSuccessfully = true;
                break;
              } else {
                var resText = await response.text();
                var fullJson = JSON.parse(resText);
                if (fullJson.candidates && fullJson.candidates[0] && fullJson.candidates[0].content && fullJson.candidates[0].content.parts) {
                  totalText = fullJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
                }
                streamedSuccessfully = true;
                break;
              }
            } catch (attemptErr) {
              if (attemptErr.name === "AbortError") throw attemptErr;
              if (mIdx < fallbackModels.length - 1) {
                console.warn("[Scene Setter Gemini BYOK] Attempt failed: " + attemptErr.message + ". Trying fallback model…");
                continue;
              }
              throw attemptErr;
            }
          }

          clearTimeout(fetchTimer);
          if (!streamedSuccessfully && !totalText) {
            throw new Error(lastErrorMsg || "Failed to generate play guide across available models.");
          }
        }

        if (guideText && !guideText.value) {
          guideText.value = totalText;
          guideText.scrollTop = guideText.scrollHeight;
        }

        if (stopwatchTimer) { clearInterval(stopwatchTimer); stopwatchTimer = null; }
        var finalElapsedSec = Math.floor((Date.now() - stopwatchStart) / 1000);
        var fMm = String(Math.floor(finalElapsedSec / 60)).padStart(2, "0");
        var fSs = String(finalElapsedSec % 60).padStart(2, "0");
        if (swTime) swTime.textContent = fMm + ":" + fSs;

        var wordCount = (totalText.trim().match(/\S+/g) || []).length;
        if (guideStatus) {
          guideStatus.textContent = "Complete! (" + wordCount + " words in " + finalElapsedSec + "s via " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + ")";
        }
      } catch (err) {
        if (stopwatchTimer) { clearInterval(stopwatchTimer); stopwatchTimer = null; }
        if (err.name === "AbortError") {
          if (guideStatus) guideStatus.textContent = "Generation stopped by user.";
        } else {
          console.error("[Scene Setter AI Error]", err);
          if (guideStatus) guideStatus.textContent = "Error: " + (err.message || "Failed to generate play guide.");
        }
      } finally {
        clearTimeout(fetchTimer);
        activeAbortController = null;
        if (genGuideBtn) genGuideBtn.disabled = false;
        if (stopGuideBtn) stopGuideBtn.hidden = true;
        setterSyncGenerateLabel();
      }
    });
  }

  if (setterGenerateBtn) {
    setterGenerateBtn.addEventListener("click", function() {
      if (!setterAiSetupReady()) {
        setterOpenAiPanel();
        return;
      }
      if (genGuideBtn && !genGuideBtn.disabled) genGuideBtn.click();
    });
    setterGenerateBtn.addEventListener("dblclick", function() {
      if (setterAiSetupReady() && genGuideBtn && !genGuideBtn.disabled) genGuideBtn.click();
    });
  }

  if (keyInput) keyInput.addEventListener("input", setterSyncGenerateLabel);
  if (guideText) guideText.addEventListener("input", setterSyncGenerateLabel);
  if (saveKeyBtn) saveKeyBtn.addEventListener("click", function() { setTimeout(setterSyncGenerateLabel, 0); });
  if (clearKeyBtn) clearKeyBtn.addEventListener("click", function() { setTimeout(setterSyncGenerateLabel, 0); });
  if (providerSelect) providerSelect.addEventListener("change", setterSyncGenerateLabel);
  setterSyncGenerateLabel();

  // --------------------------------------------------------------------------
  // Play Guide Playback Linking (Scene Setter <-> Scene Sentinel)
  // --------------------------------------------------------------------------
  function handleSetterPlayToggle() {
    var st = typeof window.__sxGetGuidePlayState === "function" ? window.__sxGetGuidePlayState() : null;
    if (st && st.on) {
      if (typeof window.__sxToggleGuidePlay === "function") {
        window.__sxToggleGuidePlay();
      }
      return;
    }

    var text = (guideText ? guideText.value : "").trim();
    if (!text && st && st.queuedText) {
      text = st.queuedText.trim();
      if (guideText) guideText.value = text;
    }
    if (!text) {
      if (!setterAiSetupReady()) {
        setterOpenAiPanel();
      }
      alert("Please generate or paste a play guide first before starting playback.");
      return;
    }

    if (guideContainer) guideContainer.hidden = false;
    if (typeof window.__sxQueueAndPlayGuide === "function") {
      var ok = window.__sxQueueAndPlayGuide(text, true);
      if (!ok) {
        alert("Could not parse timed activities from play guide. Ensure the guide contains timecodes like [00:00-05:00].");
        return;
      }
    }
  }

  var setterPlayBtn = document.getElementById("setterPlayBtn");
  var playGuidePlayBtn = document.getElementById("setterPlayGuidePlayBtn");
  var openSentinelBtn = document.getElementById("setterOpenSentinelBtn");

  if (setterPlayBtn) setterPlayBtn.addEventListener("click", handleSetterPlayToggle);
  if (playGuidePlayBtn) playGuidePlayBtn.addEventListener("click", handleSetterPlayToggle);

  if (openSentinelBtn) {
    openSentinelBtn.addEventListener("click", function() {
      var diag = document.getElementById("negotiationDialog");
      if (diag && typeof diag.close === "function") {
        try { diag.close(); } catch (_) {}
      }
      if (typeof window.__sxOpenSentinel === "function") {
        window.__sxOpenSentinel();
      }
    });
  }

  function syncSentinelPlayStatus() {
    if (typeof window.__sxGetGuidePlayState !== "function") return;
    var st = window.__sxGetGuidePlayState();
    var sPlayBtn = document.getElementById("setterPlayBtn");
    var pgPlayBtn = document.getElementById("setterPlayGuidePlayBtn");
    var dot = document.getElementById("setterPlayDot");
    var live = document.getElementById("setterLivePlayStatus");

    var mm = String(Math.floor(st.elapsedSec / 60)).padStart(2, "0");
    var ss = String(st.elapsedSec % 60).padStart(2, "0");
    var timeStr = mm + ":" + ss;

    if (st.on && !st.paused) {
      if (sPlayBtn) sPlayBtn.textContent = "⏸ Pause (" + timeStr + ")";
      if (pgPlayBtn) pgPlayBtn.textContent = "⏸ Pause Guide";
      if (dot) {
        dot.style.background = "#22c55e";
        dot.style.boxShadow = "0 0 8px #22c55e";
      }
      if (live) {
        var act = st.currentActivity ? (" • " + st.currentActivity) : "";
        var stepInfo = (st.stepIdx >= 0 && st.steps && st.steps.length) ? (" (Step " + (st.stepIdx + 1) + "/" + st.steps.length + ")") : "";
        live.textContent = (setterIsModeration() ? "Running " : "Playing ") + timeStr + act + stepInfo;
        live.style.color = "#4ade80";
      }
    } else if (st.on && st.paused) {
      if (sPlayBtn) sPlayBtn.textContent = "▶ Resume (" + timeStr + ")";
      if (pgPlayBtn) pgPlayBtn.textContent = "▶ Resume Guide";
      if (dot) {
        dot.style.background = "#facc15";
        dot.style.boxShadow = "0 0 6px #facc15";
      }
      if (live) {
        live.textContent = "Paused at " + timeStr + (st.currentActivity ? (" • " + st.currentActivity) : "");
        live.style.color = "#facc15";
      }
    } else {
      if (sPlayBtn) sPlayBtn.textContent = setterIsModeration() ? "▶ Run" : "▶ Play";
      if (pgPlayBtn) pgPlayBtn.textContent = setterIsModeration() ? "▶ Run in Scene Sentinel" : "▶ Play in Scene Sentinel";
      if (dot) {
        dot.style.background = "#64748b";
        dot.style.boxShadow = "none";
      }
      if (live) {
        live.textContent = setterIsModeration() ? "Scene Sentinel: Ready to run" : "Scene Sentinel: Ready to play";
        live.style.color = "#cbd5e1";
      }
    }
  }

  setInterval(syncSentinelPlayStatus, 500);
  syncSentinelPlayStatus();

  // Watch for external storage updates or dialog opens
  window.addEventListener("storage", function() {
    loadSavedKey();
    setterSyncGenerateLabel();
  });
  var negDialog = document.getElementById("negotiationDialog");
  if (negDialog) {
    negDialog.addEventListener("click", function() {
      setterSyncGenerateLabel();
    });
  }
});


/* ---- module: scene-sentinel ---- */
__sxInit(function () {
/* Scene Sentinel: a top-level view (a dialog, like Popularity List)
   holding the safe signal, check-in timer, emergency contacts, pre-scene
   checklist, and post-scene check-in; all of its data lives in localStorage
   in this browser only. This module was split out of the old combined
   view-nav + Scene Sentinel block with no behavior change: same state key,
   same check-in phases and grace period, same notification and vibrate
   call sites; its timers run through SexcapadesRuntime.TimerManager.
   Everything runs inside boot(), gated on DOMContentLoaded through the
   shared __sxInit queue, and every listener attachment is null-guarded.
   The navigation module opens this dialog; window.__sxSentinelRenderAll
   (published below) is how it asks this module to render after opening,
   and window.__sxSentinelNotifInit is published for it here. */
(function () {
  function boot() {
  var closeDialog = window.__sxDialog.close;
  function syncBtn() { if (typeof window.__sxSyncViewButton === "function") window.__sxSyncViewButton(); }

  var safetyDlg = SexcapadesRuntime.DOM.byId("safetyDialog");
  var LS_KEY = "sexcapades_sentinel_v1";
  var GRACE_MS = 120000;
  function nowMs() { return Date.now(); }
  function fmtTime(ts) {
    try { return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
    catch (e) { return new Date(ts).toLocaleString(); }
  }
  function fmtTimeSec(ts) {
    try { return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" }); }
    catch (e) { return fmtTime(ts); }
  }
  function fmtDur(ms) {
    if (ms < 0) ms = 0;
    var s = Math.ceil(ms / 1000), m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function vibrate(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { __sxErrLog("vibrate", e); } }
  var NOTIF_ASKED_KEY = 'sexcapades_sentinel_notif_asked';
  function notifSupported() {
    try { return ('Notification' in window) && ('serviceWorker' in navigator); } catch (e) { return false; }
  }
  function sentinelNotify(kind) {
    try {
      if (!notifSupported()) return;
      if (Notification.permission !== 'granted') return;
      navigator.serviceWorker.ready.then(function (reg) {
        var isMissed = kind === 'missed';
        var title = isMissed ? 'Scene Sentinel — MISSED CHECK-IN' : 'Scene Sentinel — Check-in due';
        var opts = {
          body: isMissed ? 'Check-in missed! Tap to open Scene Sentinel.' : "Check-in due — tap to confirm you're OK.",
          tag: isMissed ? 'sentinel-missed' : 'sentinel-due',
          icon: '/icons/icon-192.png',
          vibrate: isMissed ? [300, 80, 300, 80, 300] : [180, 80, 180, 80, 180]
        };
        if (isMissed) opts.requireInteraction = true;
        reg.showNotification(title, opts).catch(function (e) { __sxErrLog("notification-show", e); });
      }).catch(function (e) { __sxErrLog("notification-show", e); });
    } catch (e) { __sxErrLog("notification", e); }
  }
  function initNotifPermission() {
    try {
      if (!notifSupported()) return;
      if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
      var asked = false;
      try { asked = localStorage.getItem(NOTIF_ASKED_KEY) === '1'; } catch (e) { __sxErrLog("notif-storage", e); }
      if (asked) return;
      try { localStorage.setItem(NOTIF_ASKED_KEY, '1'); } catch (e) { __sxErrLog("notification-show", e); }
      Notification.requestPermission().catch(function (e) { __sxErrLog("notification-show", e); });
    } catch (e) { __sxErrLog("notification-show", e); }
  }
  window.__sxSentinelNotifInit = initNotifPermission;
  var notifBtn = SexcapadesRuntime.DOM.byId("safetyNotifEnable"), notifHint = SexcapadesRuntime.DOM.byId("safetyNotifHint");
  function renderNotifHint() {
    try {
      if (!notifHint) return;
      if (!notifSupported()) { notifHint.hidden = true; return; }
      if (Notification.permission === 'granted') { notifHint.textContent = 'Check-in alerts enabled — they reach you even with the phone locked.'; return; }
      if (Notification.permission === 'denied') { notifHint.textContent = 'Check-in alerts are blocked in browser settings.'; return; }
    } catch (e) { __sxErrLog("notification", e); }
  }
  if (notifBtn) notifBtn.addEventListener("click", function () {
    try {
      if (!notifSupported()) return;
      try { localStorage.setItem(NOTIF_ASKED_KEY, '1'); } catch (e) { __sxErrLog("notif-storage", e); }
      Notification.requestPermission().then(function () { renderNotifHint(); }).catch(function (e) { __sxErrLog("notification-permission", e); });
    } catch (e) { __sxErrLog("notification-permission", e); }
  });

  /* ---------------- Scene Sentinel state (localStorage) ---------------- */
  function defaultState() {
    return {
      signals: [],
      contacts: [],
      pre: { limits: { c: false, t: "" }, words: { c: false, t: "" }, care: { c: false, t: "" } },
      checkin: { intervalMin: 15, phase: "idle", nextDue: 0, dueAt: 0 },
      post: { dueAt: 0, log: [] },
      journal: [],
      guide: { text: "", steps: [], pulseMin: 5, queuedAt: 0 }
    };
  }
  var state = defaultState();
  function load() {
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      var d = defaultState();
      if (Array.isArray(parsed.signals)) d.signals = parsed.signals;
      if (Array.isArray(parsed.contacts)) d.contacts = parsed.contacts;
      if (parsed.pre) { for (var k in d.pre) { if (parsed.pre[k]) { d.pre[k].c = !!parsed.pre[k].c; d.pre[k].t = String(parsed.pre[k].t || ""); } } }
      if (parsed.checkin) { d.checkin.intervalMin = +parsed.checkin.intervalMin || 15; d.checkin.phase = String(parsed.checkin.phase || "idle"); d.checkin.nextDue = +parsed.checkin.nextDue || 0; d.checkin.dueAt = +parsed.checkin.dueAt || 0; }
      if (parsed.post) { d.post.dueAt = +parsed.post.dueAt || 0; if (Array.isArray(parsed.post.log)) d.post.log = parsed.post.log; }
      if (Array.isArray(parsed.journal)) d.journal = parsed.journal.filter(function (e) { return e && typeof e === "object" && e.code; }).map(function (e) { return { id: String(e.id || ""), t: +e.t || 0, code: String(e.code), metric: e.metric ? String(e.metric) : "", value: (e.value === null || e.value === undefined) ? null : +e.value, source: String(e.source || "watch"), activity: String(e.activity || ""), sched: String(e.sched || ""), domEnjoy: (e.domEnjoy === null || e.domEnjoy === undefined) ? null : +e.domEnjoy, domAt: +e.domAt || 0, profileId: String(e.profileId || "") }; });
      if (parsed.guide && typeof parsed.guide === "object") { d.guide.text = String(parsed.guide.text || ""); d.guide.pulseMin = +parsed.guide.pulseMin || 5; d.guide.queuedAt = +parsed.guide.queuedAt || 0; if (Array.isArray(parsed.guide.steps)) d.guide.steps = parsed.guide.steps.filter(function (st) { return st && isFinite(+st.start); }).map(function (st) { return { start: +st.start, end: (st.end === null || st.end === undefined) ? null : +st.end, activity: String(st.activity || ""), note: String(st.note || "") }; }); }
      state = d;
    } catch (e) { __sxErrLog("sentinel-parse", e); }
  }
  function save() { try { window.localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { __sxErrLog("sentinel-storage", e); } }

  /* ---------------- Safe signal ---------------- */
  var signalBtn = SexcapadesRuntime.DOM.byId("safetySignalButton"), signalMain = SexcapadesRuntime.DOM.byId("safetySignalMain"),
      signalSub = SexcapadesRuntime.DOM.byId("safetySignalSub"), signalLogEl = SexcapadesRuntime.DOM.byId("safetySignalLog"),
      signalEmpty = SexcapadesRuntime.DOM.byId("safetySignalEmpty");
  var SIGNAL_META = {
    checkin: { state: "green", main: "Check-in — all good", label: "Check-in (all good)", vibe: [45] },
    slow: { state: "yellow", main: "Slow down", label: "Slow down", vibe: [80, 40, 80] },
    stop: { state: "red", main: "STOP", label: "Stop", vibe: [220, 60, 220, 60, 220] }
  };
  function fireSignal(kind) {
    var meta = SIGNAL_META[kind]; if (!meta) return;
    var t = nowMs();
    state.signals.unshift({ t: t, kind: kind });
    if (state.signals.length > 100) state.signals.length = 100;
    save();
    if (signalBtn) signalBtn.setAttribute("data-state", meta.state);
    if (signalMain) signalMain.textContent = meta.main;
    if (signalSub) signalSub.textContent = "Logged " + fmtTimeSec(t);
    vibrate(meta.vibe);
    renderSignals();
  }
  function renderSignals() {
    if (!signalLogEl) return;
    signalLogEl.innerHTML = "";
    state.signals.forEach(function (entry) {
      var meta = SIGNAL_META[entry.kind] || SIGNAL_META.checkin;
      var li = document.createElement("li");
      var dot = document.createElement("span"); dot.className = "safety-dot"; dot.setAttribute("data-kind", entry.kind);
      var lab = document.createElement("span"); lab.textContent = meta.label;
      var tm = document.createElement("time"); tm.textContent = fmtTimeSec(entry.t);
      li.appendChild(dot); li.appendChild(lab); li.appendChild(tm);
      signalLogEl.appendChild(li);
    });
    if (signalEmpty) signalEmpty.hidden = state.signals.length > 0;
  }
  if (signalBtn) {
    var holdTimer = 0, holdFired = false, lastTap = 0, tapTimer = 0, lastPointerUp = 0;
    function tapLogic() {
      var n = nowMs();
      if (lastTap && n - lastTap < 350) { lastTap = 0; SexcapadesRuntime.TimerManager.clear(tapTimer); fireSignal("stop"); }
      else { lastTap = n; tapTimer = SexcapadesRuntime.TimerManager.setTimeout(function () { lastTap = 0; fireSignal("checkin"); }, 360); }
    }
    signalBtn.addEventListener("pointerdown", function () {
      holdFired = false;
      SexcapadesRuntime.TimerManager.clear(holdTimer);
      holdTimer = SexcapadesRuntime.TimerManager.setTimeout(function () { holdFired = true; fireSignal("slow"); }, 550);
    });
    signalBtn.addEventListener("pointerup", function () {
      SexcapadesRuntime.TimerManager.clear(holdTimer);
      lastPointerUp = nowMs();
      if (holdFired) { holdFired = false; return; }
      tapLogic();
    });
    signalBtn.addEventListener("pointercancel", function () { SexcapadesRuntime.TimerManager.clear(holdTimer); });
    signalBtn.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
    signalBtn.addEventListener("click", function () {
      if (nowMs() - lastPointerUp < 120) return; /* pointer path already handled it */
      tapLogic();
    });
  }
  var signalClear = SexcapadesRuntime.DOM.byId("safetySignalClear");
  if (signalClear) signalClear.addEventListener("click", function () {
    state.signals = []; save(); renderSignals();
    if (signalBtn) signalBtn.setAttribute("data-state", "idle");
    if (signalMain) signalMain.textContent = "Safe signal";
    if (signalSub) signalSub.textContent = "Tap · hold · double-tap";
  });

  /* ---------------- Emergency contacts ---------------- */
  var contactList = SexcapadesRuntime.DOM.byId("safetyContactList"), contactEmpty = SexcapadesRuntime.DOM.byId("safetyContactEmpty");
  /* tel:/sms: capability detection (Build 2026-10-19_0048): ChromeOS and most
     desktops have no phone dialer or SMS app, and firing a tel:/sms: link
     there crashed/closed the tab on a Chromebook Plus. Only devices whose
     user agent looks like a phone/tablet get tel:/sms: links; on every
     other device NO tel:/sms: link is ever created — the number is shown
     as visible text with a Copy number button instead. */
  var CAN_TEL = (function () {
    try {
      var ua = String(navigator.userAgent || "");
      if (/CrOS/i.test(ua)) return false;
      return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    } catch (e) { __sxErrLog("sentinel-tel-detect", e); return false; }
  })();
  function telHref(phone) { return "tel:" + String(phone || "").replace(/[^+\d]/g, ""); }
  function smsHref(phone) { return "sms:" + String(phone || "").replace(/[^+\d]/g, ""); }
  function copyPhoneNumber(phone, btn) {
    var num = String(phone || "");
    var done = function () {
      if (!btn) return;
      var old = btn.getAttribute("data-copy-label") || "Copy number";
      btn.textContent = "Copied!";
      SexcapadesRuntime.TimerManager.setTimeout(function () { btn.textContent = old; }, 1600);
    };
    var fallback = function () {
      try {
        var ta = document.createElement("textarea");
        ta.value = num; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) { __sxErrLog("sentinel-copy", e); }
        document.body.removeChild(ta);
      } catch (e) { __sxErrLog("sentinel-copy", e); }
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(num).then(done, fallback);
    } else fallback();
  }
  function copyNumberButton(phone, className, label) {
    var b = document.createElement("button");
    b.type = "button"; b.className = className; b.textContent = label;
    b.setAttribute("data-copy-label", label);
    b.addEventListener("click", function () { copyPhoneNumber(phone, b); });
    return b;
  }
  var contactsHint = SexcapadesRuntime.DOM.byId("safetyContactsHint");
  if (contactsHint && !CAN_TEL) contactsHint.textContent = "This device can't place calls or send texts, so each number is shown with a Copy number button — copy it and dial or text from your phone. The first contact is the escalation target for a missed check-in.";
  function contactRow(contact, idx) {
    var li = document.createElement("li");
    var name = document.createElement("span"); name.className = "safety-contact-name"; name.textContent = contact.name;
    var phone = document.createElement("span"); phone.className = "safety-contact-phone"; phone.textContent = contact.phone;
    var actions = document.createElement("span"); actions.className = "safety-contact-actions";
    if (CAN_TEL) {
      var call = document.createElement("a"); call.className = "action-btn safety-mini-btn"; call.href = telHref(contact.phone); call.textContent = "Call";
      var text = document.createElement("a"); text.className = "action-btn safety-mini-btn"; text.href = smsHref(contact.phone); text.textContent = "Text";
      actions.appendChild(call); actions.appendChild(text);
    } else {
      actions.appendChild(copyNumberButton(contact.phone, "action-btn safety-mini-btn", "Copy number"));
    }
    var rm = document.createElement("button"); rm.type = "button"; rm.className = "action-btn safety-mini-btn"; rm.textContent = "Remove"; rm.setAttribute("data-remove-contact", String(idx));
    actions.appendChild(rm);
    li.appendChild(name); li.appendChild(phone); li.appendChild(actions);
    return li;
  }
  function renderContacts() {
    if (!contactList) return;
    contactList.innerHTML = "";
    state.contacts.forEach(function (c, i) { contactList.appendChild(contactRow(c, i)); });
    if (contactEmpty) contactEmpty.hidden = state.contacts.length > 0;
    renderAlertActions();
  }
  if (contactList) contactList.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-remove-contact]") : null;
    if (!t) return;
    var idx = +t.getAttribute("data-remove-contact");
    if (idx >= 0 && idx < state.contacts.length) { state.contacts.splice(idx, 1); save(); renderContacts(); }
  });
  var contactAdd = SexcapadesRuntime.DOM.byId("safetyContactAdd");
  if (contactAdd) contactAdd.addEventListener("click", function () {
    var nameEl = SexcapadesRuntime.DOM.byId("safetyContactName"), phoneEl = SexcapadesRuntime.DOM.byId("safetyContactPhone");
    var name = nameEl ? nameEl.value.trim() : "", phone = phoneEl ? phoneEl.value.trim() : "";
    if (!name || !phone) return;
    state.contacts.push({ name: name, phone: phone });
    save(); renderContacts();
    if (nameEl) nameEl.value = "";
    if (phoneEl) phoneEl.value = "";
  });
  function renderAlertActions() {
    var box = SexcapadesRuntime.DOM.byId("safetyAlertActions"); if (!box) return;
    box.innerHTML = "";
    if (!state.contacts.length) {
      var none = document.createElement("span"); none.textContent = "Add an emergency contact below so a missed check-in has someone to alert.";
      box.appendChild(none); return;
    }
    state.contacts.forEach(function (c) {
      if (CAN_TEL) {
        var call = document.createElement("a"); call.className = "action-btn"; call.href = telHref(c.phone); call.textContent = "Call " + c.name;
        var text = document.createElement("a"); text.className = "action-btn"; text.href = smsHref(c.phone); text.textContent = "Text " + c.name;
        box.appendChild(call); box.appendChild(text);
      } else {
        var lab = document.createElement("span"); lab.textContent = c.name + ": " + c.phone;
        box.appendChild(lab);
        box.appendChild(copyNumberButton(c.phone, "action-btn", "Copy number"));
      }
    });
  }

  /* ---------------- Pre-scene checklist ---------------- */
  var PRE_KEYS = [
    { key: "limits", check: "safetyPreLimitsCheck", text: "safetyPreLimitsText" },
    { key: "words", check: "safetyPreWordsCheck", text: "safetyPreWordsText" },
    { key: "care", check: "safetyPreCareCheck", text: "safetyPreCareText" }
  ];
  function renderPreReady() {
    var el = SexcapadesRuntime.DOM.byId("safetyPreReady"); if (!el) return;
    var all = PRE_KEYS.every(function (p) { return state.pre[p.key].c; });
    el.setAttribute("data-ready", all ? "true" : "false");
    el.textContent = all
      ? "Ready — hard limits reviewed, safe words agreed, aftercare planned."
      : "Not ready yet — confirm all three before the scene starts.";
  }
  function hydratePre() {
    PRE_KEYS.forEach(function (p) {
      var c = SexcapadesRuntime.DOM.byId(p.check), t = SexcapadesRuntime.DOM.byId(p.text);
      if (c) c.checked = !!state.pre[p.key].c;
      if (t) t.value = state.pre[p.key].t || "";
    });
    renderPreReady();
  }
  PRE_KEYS.forEach(function (p) {
    var c = SexcapadesRuntime.DOM.byId(p.check), t = SexcapadesRuntime.DOM.byId(p.text);
    if (c) c.addEventListener("change", function () { state.pre[p.key].c = c.checked; save(); renderPreReady(); });
    if (t) t.addEventListener("input", function () { state.pre[p.key].t = t.value; save(); });
  });

  /* ---------------- Check-in timer ---------------- */
  var checkinToggle = SexcapadesRuntime.DOM.byId("safetyCheckinToggle"), checkinStatus = SexcapadesRuntime.DOM.byId("safetyCheckinStatus"),
      checkinDue = SexcapadesRuntime.DOM.byId("safetyCheckinDue"), checkinMissed = SexcapadesRuntime.DOM.byId("safetyCheckinMissed"),
      checkinInterval = SexcapadesRuntime.DOM.byId("safetyCheckinInterval");
  function renderCheckin() {
    var ci = state.checkin, n = nowMs();
    if (checkinInterval && document.activeElement !== checkinInterval) checkinInterval.value = String(ci.intervalMin);
    if (!checkinStatus) return;
    if (ci.phase === "running") {
      checkinStatus.textContent = "Check-ins running — next check-in in " + fmtDur(ci.nextDue - n) + ".";
      if (checkinToggle) checkinToggle.textContent = "Stop check-ins";
      if (checkinDue) checkinDue.hidden = true;
      if (checkinMissed) checkinMissed.hidden = true;
    } else if (ci.phase === "due") {
      checkinStatus.textContent = "Check-in due — if nobody confirms within " + fmtDur(ci.dueAt + GRACE_MS - n) + ", it escalates to a missed check-in.";
      if (checkinToggle) checkinToggle.textContent = "Stop check-ins";
      if (checkinDue) checkinDue.hidden = false;
      if (checkinMissed) checkinMissed.hidden = true;
    } else if (ci.phase === "missed") {
      checkinStatus.textContent = "A check-in was missed and not confirmed.";
      if (checkinToggle) checkinToggle.textContent = "Stop check-ins";
      if (checkinDue) checkinDue.hidden = true;
      if (checkinMissed) checkinMissed.hidden = false;
    } else {
      checkinStatus.textContent = "Check-ins are off.";
      if (checkinToggle) checkinToggle.textContent = "Start check-ins";
      if (checkinDue) checkinDue.hidden = true;
      if (checkinMissed) checkinMissed.hidden = true;
    }
  }
  function startCheckins() {
    state.checkin.phase = "running";
    state.checkin.nextDue = nowMs() + state.checkin.intervalMin * 60000;
    state.checkin.dueAt = 0;
    save(); renderCheckin();
  }
  function stopCheckins() {
    state.checkin.phase = "idle"; state.checkin.nextDue = 0; state.checkin.dueAt = 0;
    save(); renderCheckin();
  }
  if (checkinToggle) checkinToggle.addEventListener("click", function () {
    if (state.checkin.phase === "idle") startCheckins(); else stopCheckins();
  });
  if (checkinInterval) checkinInterval.addEventListener("change", function () {
    state.checkin.intervalMin = +checkinInterval.value || 15;
    if (state.checkin.phase === "running") state.checkin.nextDue = nowMs() + state.checkin.intervalMin * 60000;
    save(); renderCheckin();
  });
  var checkinOk = SexcapadesRuntime.DOM.byId("safetyCheckinOk"), checkinAck = SexcapadesRuntime.DOM.byId("safetyCheckinAck");
  if (checkinOk) checkinOk.addEventListener("click", startCheckins);
  if (checkinAck) checkinAck.addEventListener("click", startCheckins);

  /* ---------------- Post-scene check-in ---------------- */
  var postStatus = SexcapadesRuntime.DOM.byId("safetyPostStatus"), postMoods = SexcapadesRuntime.DOM.byId("safetyPostMoods"),
      postLogEl = SexcapadesRuntime.DOM.byId("safetyPostLog"), postEmpty = SexcapadesRuntime.DOM.byId("safetyPostEmpty"),
      postPrompt = SexcapadesRuntime.DOM.byId("safetyPostMoodPrompt");
  var postPromptOpen = false;
  function renderPost() {
    if (!postStatus) return;
    var due = state.post.dueAt, n = nowMs();
    if (due && due > n) {
      postStatus.textContent = "Follow-up scheduled for " + fmtTime(due) + ".";
      if (!postPromptOpen && postMoods) postMoods.hidden = true;
    } else if (due && due <= n) {
      postStatus.textContent = "Your post-scene follow-up is due now.";
      if (postMoods) { postMoods.hidden = false; if (postPrompt) postPrompt.textContent = "Your follow-up is due — how are you feeling?"; }
    } else {
      postStatus.textContent = "No follow-up scheduled.";
      if (!postPromptOpen && postMoods) postMoods.hidden = true;
    }
    renderPostLog();
  }
  function renderPostLog() {
    if (!postLogEl) return;
    postLogEl.innerHTML = "";
    state.post.log.forEach(function (entry) {
      var li = document.createElement("li");
      var dot = document.createElement("span"); dot.className = "safety-dot"; dot.setAttribute("data-kind", "mood");
      var lab = document.createElement("span"); lab.textContent = "Feeling: " + entry.mood;
      var tm = document.createElement("time"); tm.textContent = fmtTime(entry.t);
      li.appendChild(dot); li.appendChild(lab); li.appendChild(tm);
      postLogEl.appendChild(li);
    });
    if (postEmpty) postEmpty.hidden = state.post.log.length > 0;
  }
  var postSchedule = SexcapadesRuntime.DOM.byId("safetyPostSchedule");
  if (postSchedule) postSchedule.addEventListener("click", function () {
    var delayEl = SexcapadesRuntime.DOM.byId("safetyPostDelay");
    var mins = delayEl ? (+delayEl.value || 120) : 120;
    state.post.dueAt = nowMs() + mins * 60000;
    postPromptOpen = false;
    save(); renderPost();
  });
  var postNow = SexcapadesRuntime.DOM.byId("safetyPostNow");
  if (postNow) postNow.addEventListener("click", function () {
    postPromptOpen = true;
    if (postMoods) { postMoods.hidden = false; if (postPrompt) postPrompt.textContent = "How are you feeling?"; }
  });
  if (postMoods) postMoods.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-mood]") : null;
    if (!t) return;
    state.post.log.unshift({ t: nowMs(), mood: t.getAttribute("data-mood") });
    if (state.post.log.length > 100) state.post.log.length = 100;
    state.post.dueAt = 0;
    postPromptOpen = false;
    if (postMoods) postMoods.hidden = true;
    save(); renderPost();
  });

  /* ---------------- GibberWear listener + scene journal (sentinel-1106-0321; metric decoding guide-1106-0847) ----------------
     The watch sends GGWave p=4 (ultrasound fast) chirps: TAP / DBL / HLD,
     plus metric readings E / H / N (Enjoyment / Heat / Endurance). A metric
     payload is the metric letter plus the DISPLAY value, -100 to +100 —
     the number in the chirp IS the number on the watch screen, shown
     as-is with NO conversion (owner ruling 2026-11-06; the old spec
     formula Display = Internal*2 - 100 is dead and must not come back).
     This block captures the microphone with getUserMedia and decodes the
     audio with the vendored ggwave-wasm library (data:application/javascript;base64,CnZhciBnZ3dhdmVfZmFjdG9yeSA9ICgoKSA9PiB7CiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDsKICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lOwogIHJldHVybiAoCmZ1bmN0aW9uKGdnd2F2ZV9mYWN0b3J5KSB7CiAgZ2d3YXZlX2ZhY3RvcnkgPSBnZ3dhdmVfZmFjdG9yeSB8fCB7fTsKCnZhciBNb2R1bGU9dHlwZW9mIGdnd2F2ZV9mYWN0b3J5IT09InVuZGVmaW5lZCI/Z2d3YXZlX2ZhY3Rvcnk6e307dmFyIG9iakFzc2lnbj1PYmplY3QuYXNzaWduO3ZhciByZWFkeVByb21pc2VSZXNvbHZlLHJlYWR5UHJvbWlzZVJlamVjdDtNb2R1bGVbInJlYWR5Il09bmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSxyZWplY3Qpe3JlYWR5UHJvbWlzZVJlc29sdmU9cmVzb2x2ZTtyZWFkeVByb21pc2VSZWplY3Q9cmVqZWN0fSk7dmFyIG1vZHVsZU92ZXJyaWRlcz1vYmpBc3NpZ24oe30sTW9kdWxlKTt2YXIgYXJndW1lbnRzXz1bXTt2YXIgdGhpc1Byb2dyYW09Ii4vdGhpcy5wcm9ncmFtIjt2YXIgcXVpdF89KHN0YXR1cyx0b1Rocm93KT0+e3Rocm93IHRvVGhyb3d9O3ZhciBFTlZJUk9OTUVOVF9JU19XRUI9dHlwZW9mIHdpbmRvdz09PSJvYmplY3QiO3ZhciBFTlZJUk9OTUVOVF9JU19XT1JLRVI9dHlwZW9mIGltcG9ydFNjcmlwdHM9PT0iZnVuY3Rpb24iO3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT09Im9iamVjdCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zPT09Im9iamVjdCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGU9PT0ic3RyaW5nIjt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkXyxyZWFkQXN5bmMscmVhZEJpbmFyeSxzZXRXaW5kb3dUaXRsZTtmdW5jdGlvbiBsb2dFeGNlcHRpb25PbkV4aXQoZSl7aWYoZSBpbnN0YW5jZW9mIEV4aXRTdGF0dXMpcmV0dXJuO2xldCB0b0xvZz1lO2VycigiZXhpdGluZyBkdWUgdG8gZXhjZXB0aW9uOiAiK3RvTG9nKX12YXIgZnM7dmFyIG5vZGVQYXRoO3ZhciByZXF1aXJlTm9kZUZTO2lmKEVOVklST05NRU5UX0lTX05PREUpe2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7c2NyaXB0RGlyZWN0b3J5PXJlcXVpcmUoInBhdGgiKS5kaXJuYW1lKHNjcmlwdERpcmVjdG9yeSkrIi8ifWVsc2V7c2NyaXB0RGlyZWN0b3J5PV9fZGlybmFtZSsiLyJ9cmVxdWlyZU5vZGVGUz0oKCk9PntpZighbm9kZVBhdGgpe2ZzPXJlcXVpcmUoImZzIik7bm9kZVBhdGg9cmVxdWlyZSgicGF0aCIpfX0pO3JlYWRfPWZ1bmN0aW9uIHNoZWxsX3JlYWQoZmlsZW5hbWUsYmluYXJ5KXt2YXIgcmV0PXRyeVBhcnNlQXNEYXRhVVJJKGZpbGVuYW1lKTtpZihyZXQpe3JldHVybiBiaW5hcnk/cmV0OnJldC50b1N0cmluZygpfXJlcXVpcmVOb2RlRlMoKTtmaWxlbmFtZT1ub2RlUGF0aFsibm9ybWFsaXplIl0oZmlsZW5hbWUpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsYmluYXJ5P251bGw6InV0ZjgiKX07cmVhZEJpbmFyeT0oZmlsZW5hbWU9Pnt2YXIgcmV0PXJlYWRfKGZpbGVuYW1lLHRydWUpO2lmKCFyZXQuYnVmZmVyKXtyZXQ9bmV3IFVpbnQ4QXJyYXkocmV0KX1yZXR1cm4gcmV0fSk7cmVhZEFzeW5jPSgoZmlsZW5hbWUsb25sb2FkLG9uZXJyb3IpPT57dmFyIHJldD10cnlQYXJzZUFzRGF0YVVSSShmaWxlbmFtZSk7aWYocmV0KXtvbmxvYWQocmV0KX1yZXF1aXJlTm9kZUZTKCk7ZmlsZW5hbWU9bm9kZVBhdGhbIm5vcm1hbGl6ZSJdKGZpbGVuYW1lKTtmcy5yZWFkRmlsZShmaWxlbmFtZSxmdW5jdGlvbihlcnIsZGF0YSl7aWYoZXJyKW9uZXJyb3IoZXJyKTtlbHNlIG9ubG9hZChkYXRhLmJ1ZmZlcil9KX0pO2lmKHByb2Nlc3NbImFyZ3YiXS5sZW5ndGg+MSl7dGhpc1Byb2dyYW09cHJvY2Vzc1siYXJndiJdWzFdLnJlcGxhY2UoL1xcL2csIi8iKX1hcmd1bWVudHNfPXByb2Nlc3NbImFyZ3YiXS5zbGljZSgyKTtwcm9jZXNzWyJvbiJdKCJ1bmNhdWdodEV4Y2VwdGlvbiIsZnVuY3Rpb24oZXgpe2lmKCEoZXggaW5zdGFuY2VvZiBFeGl0U3RhdHVzKSl7dGhyb3cgZXh9fSk7cHJvY2Vzc1sib24iXSgidW5oYW5kbGVkUmVqZWN0aW9uIixmdW5jdGlvbihyZWFzb24pe3Rocm93IHJlYXNvbn0pO3F1aXRfPSgoc3RhdHVzLHRvVGhyb3cpPT57aWYoa2VlcFJ1bnRpbWVBbGl2ZSgpKXtwcm9jZXNzWyJleGl0Q29kZSJdPXN0YXR1czt0aHJvdyB0b1Rocm93fWxvZ0V4Y2VwdGlvbk9uRXhpdCh0b1Rocm93KTtwcm9jZXNzWyJleGl0Il0oc3RhdHVzKX0pO01vZHVsZVsiaW5zcGVjdCJdPWZ1bmN0aW9uKCl7cmV0dXJuIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdIn19ZWxzZSBpZihFTlZJUk9OTUVOVF9JU19XRUJ8fEVOVklST05NRU5UX0lTX1dPUktFUil7aWYoRU5WSVJPTk1FTlRfSVNfV09SS0VSKXtzY3JpcHREaXJlY3Rvcnk9c2VsZi5sb2NhdGlvbi5ocmVmfWVsc2UgaWYodHlwZW9mIGRvY3VtZW50IT09InVuZGVmaW5lZCImJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQpe3NjcmlwdERpcmVjdG9yeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY31pZihfc2NyaXB0RGlyKXtzY3JpcHREaXJlY3Rvcnk9X3NjcmlwdERpcn1pZihzY3JpcHREaXJlY3RvcnkuaW5kZXhPZigiYmxvYjoiKSE9PTApe3NjcmlwdERpcmVjdG9yeT1zY3JpcHREaXJlY3Rvcnkuc3Vic3RyKDAsc2NyaXB0RGlyZWN0b3J5LnJlcGxhY2UoL1s/I10uKi8sIiIpLmxhc3RJbmRleE9mKCIvIikrMSl9ZWxzZXtzY3JpcHREaXJlY3Rvcnk9IiJ9e3JlYWRfPSh1cmw9Pnt0cnl7dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkdFVCIsdXJsLGZhbHNlKTt4aHIuc2VuZChudWxsKTtyZXR1cm4geGhyLnJlc3BvbnNlVGV4dH1jYXRjaChlcnIpe3ZhciBkYXRhPXRyeVBhcnNlQXNEYXRhVVJJKHVybCk7aWYoZGF0YSl7cmV0dXJuIGludEFycmF5VG9TdHJpbmcoZGF0YSl9dGhyb3cgZXJyfX0pO2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7cmVhZEJpbmFyeT0odXJsPT57dHJ5e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7eGhyLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiO3hoci5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheSh4aHIucmVzcG9uc2UpfWNhdGNoKGVycil7dmFyIGRhdGE9dHJ5UGFyc2VBc0RhdGFVUkkodXJsKTtpZihkYXRhKXtyZXR1cm4gZGF0YX10aHJvdyBlcnJ9fSl9cmVhZEFzeW5jPSgodXJsLG9ubG9hZCxvbmVycm9yKT0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCx0cnVlKTt4aHIucmVzcG9uc2VUeXBlPSJhcnJheWJ1ZmZlciI7eGhyLm9ubG9hZD0oKCk9PntpZih4aHIuc3RhdHVzPT0yMDB8fHhoci5zdGF0dXM9PTAmJnhoci5yZXNwb25zZSl7b25sb2FkKHhoci5yZXNwb25zZSk7cmV0dXJufXZhciBkYXRhPXRyeVBhcnNlQXNEYXRhVVJJKHVybCk7aWYoZGF0YSl7b25sb2FkKGRhdGEuYnVmZmVyKTtyZXR1cm59b25lcnJvcigpfSk7eGhyLm9uZXJyb3I9b25lcnJvcjt4aHIuc2VuZChudWxsKX0pfXNldFdpbmRvd1RpdGxlPSh0aXRsZT0+ZG9jdW1lbnQudGl0bGU9dGl0bGUpfWVsc2V7fXZhciBvdXQ9TW9kdWxlWyJwcmludCJdfHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO3ZhciBlcnI9TW9kdWxlWyJwcmludEVyciJdfHxjb25zb2xlLndhcm4uYmluZChjb25zb2xlKTtvYmpBc3NpZ24oTW9kdWxlLG1vZHVsZU92ZXJyaWRlcyk7bW9kdWxlT3ZlcnJpZGVzPW51bGw7aWYoTW9kdWxlWyJhcmd1bWVudHMiXSlhcmd1bWVudHNfPU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKXRoaXNQcm9ncmFtPU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlxdWl0Xz1Nb2R1bGVbInF1aXQiXTt2YXIgdGVtcFJldDA9MDt2YXIgc2V0VGVtcFJldDA9dmFsdWU9Pnt0ZW1wUmV0MD12YWx1ZX07dmFyIHdhc21CaW5hcnk7aWYoTW9kdWxlWyJ3YXNtQmluYXJ5Il0pd2FzbUJpbmFyeT1Nb2R1bGVbIndhc21CaW5hcnkiXTt2YXIgbm9FeGl0UnVudGltZT1Nb2R1bGVbIm5vRXhpdFJ1bnRpbWUiXXx8dHJ1ZTtpZih0eXBlb2YgV2ViQXNzZW1ibHkhPT0ib2JqZWN0Iil7YWJvcnQoIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWQiKX12YXIgd2FzbU1lbW9yeTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEVYSVRTVEFUVVM7ZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbix0ZXh0KXtpZighY29uZGl0aW9uKXthYm9ydCh0ZXh0KX19dmFyIFVURjhEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9PSJ1bmRlZmluZWQiP25ldyBUZXh0RGVjb2RlcigidXRmOCIpOnVuZGVmaW5lZDtmdW5jdGlvbiBVVEY4QXJyYXlUb1N0cmluZyhoZWFwLGlkeCxtYXhCeXRlc1RvUmVhZCl7dmFyIGVuZElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQ7dmFyIGVuZFB0cj1pZHg7d2hpbGUoaGVhcFtlbmRQdHJdJiYhKGVuZFB0cj49ZW5kSWR4KSkrK2VuZFB0cjtpZihlbmRQdHItaWR4PjE2JiZoZWFwLnN1YmFycmF5JiZVVEY4RGVjb2Rlcil7cmV0dXJuIFVURjhEZWNvZGVyLmRlY29kZShoZWFwLnN1YmFycmF5KGlkeCxlbmRQdHIpKX1lbHNle3ZhciBzdHI9IiI7d2hpbGUoaWR4PGVuZFB0cil7dmFyIHUwPWhlYXBbaWR4KytdO2lmKCEodTAmMTI4KSl7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTtjb250aW51ZX12YXIgdTE9aGVhcFtpZHgrK10mNjM7aWYoKHUwJjIyNCk9PTE5Mil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKCh1MCYzMSk8PDZ8dTEpO2NvbnRpbnVlfXZhciB1Mj1oZWFwW2lkeCsrXSY2MztpZigodTAmMjQwKT09MjI0KXt1MD0odTAmMTUpPDwxMnx1MTw8Nnx1Mn1lbHNle3UwPSh1MCY3KTw8MTh8dTE8PDEyfHUyPDw2fGhlYXBbaWR4KytdJjYzfWlmKHUwPDY1NTM2KXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodTApfWVsc2V7dmFyIGNoPXUwLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyl9fX1yZXR1cm4gc3RyfWZ1bmN0aW9uIFVURjhUb1N0cmluZyhwdHIsbWF4Qnl0ZXNUb1JlYWQpe3JldHVybiBwdHI/VVRGOEFycmF5VG9TdHJpbmcoSEVBUFU4LHB0cixtYXhCeXRlc1RvUmVhZCk6IiJ9ZnVuY3Rpb24gc3RyaW5nVG9VVEY4QXJyYXkoc3RyLGhlYXAsb3V0SWR4LG1heEJ5dGVzVG9Xcml0ZSl7aWYoIShtYXhCeXRlc1RvV3JpdGU+MCkpcmV0dXJuIDA7dmFyIHN0YXJ0SWR4PW91dElkeDt2YXIgZW5kSWR4PW91dElkeCttYXhCeXRlc1RvV3JpdGUtMTtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgdT1zdHIuY2hhckNvZGVBdChpKTtpZih1Pj01NTI5NiYmdTw9NTczNDMpe3ZhciB1MT1zdHIuY2hhckNvZGVBdCgrK2kpO3U9NjU1MzYrKCh1JjEwMjMpPDwxMCl8dTEmMTAyM31pZih1PD0xMjcpe2lmKG91dElkeD49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPXV9ZWxzZSBpZih1PD0yMDQ3KXtpZihvdXRJZHgrMT49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTE5Mnx1Pj42O2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfWVsc2UgaWYodTw9NjU1MzUpe2lmKG91dElkeCsyPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjI0fHU+PjEyO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfWVsc2V7aWYob3V0SWR4KzM+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yNDB8dT4+MTg7aGVhcFtvdXRJZHgrK109MTI4fHU+PjEyJjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfX1oZWFwW291dElkeF09MDtyZXR1cm4gb3V0SWR4LXN0YXJ0SWR4fWZ1bmN0aW9uIHN0cmluZ1RvVVRGOChzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl7cmV0dXJuIHN0cmluZ1RvVVRGOEFycmF5KHN0cixIRUFQVTgsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl9ZnVuY3Rpb24gbGVuZ3RoQnl0ZXNVVEY4KHN0cil7dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciB1PXN0ci5jaGFyQ29kZUF0KGkpO2lmKHU+PTU1Mjk2JiZ1PD01NzM0Myl1PTY1NTM2KygodSYxMDIzKTw8MTApfHN0ci5jaGFyQ29kZUF0KCsraSkmMTAyMztpZih1PD0xMjcpKytsZW47ZWxzZSBpZih1PD0yMDQ3KWxlbis9MjtlbHNlIGlmKHU8PTY1NTM1KWxlbis9MztlbHNlIGxlbis9NH1yZXR1cm4gbGVufXZhciBVVEYxNkRlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT09InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGYtMTZsZSIpOnVuZGVmaW5lZDtmdW5jdGlvbiBVVEYxNlRvU3RyaW5nKHB0cixtYXhCeXRlc1RvUmVhZCl7dmFyIGVuZFB0cj1wdHI7dmFyIGlkeD1lbmRQdHI+PjE7dmFyIG1heElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQvMjt3aGlsZSghKGlkeD49bWF4SWR4KSYmSEVBUFUxNltpZHhdKSsraWR4O2VuZFB0cj1pZHg8PDE7aWYoZW5kUHRyLXB0cj4zMiYmVVRGMTZEZWNvZGVyKXtyZXR1cm4gVVRGMTZEZWNvZGVyLmRlY29kZShIRUFQVTguc3ViYXJyYXkocHRyLGVuZFB0cikpfWVsc2V7dmFyIHN0cj0iIjtmb3IodmFyIGk9MDshKGk+PW1heEJ5dGVzVG9SZWFkLzIpOysraSl7dmFyIGNvZGVVbml0PUhFQVAxNltwdHIraSoyPj4xXTtpZihjb2RlVW5pdD09MClicmVhaztzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVVuaXQpfXJldHVybiBzdHJ9fWZ1bmN0aW9uIHN0cmluZ1RvVVRGMTYoc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpe2lmKG1heEJ5dGVzVG9Xcml0ZT09PXVuZGVmaW5lZCl7bWF4Qnl0ZXNUb1dyaXRlPTIxNDc0ODM2NDd9aWYobWF4Qnl0ZXNUb1dyaXRlPDIpcmV0dXJuIDA7bWF4Qnl0ZXNUb1dyaXRlLT0yO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIG51bUNoYXJzVG9Xcml0ZT1tYXhCeXRlc1RvV3JpdGU8c3RyLmxlbmd0aCoyP21heEJ5dGVzVG9Xcml0ZS8yOnN0ci5sZW5ndGg7Zm9yKHZhciBpPTA7aTxudW1DaGFyc1RvV3JpdGU7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7SEVBUDE2W291dFB0cj4+MV09Y29kZVVuaXQ7b3V0UHRyKz0yfUhFQVAxNltvdXRQdHI+PjFdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn1mdW5jdGlvbiBsZW5ndGhCeXRlc1VURjE2KHN0cil7cmV0dXJuIHN0ci5sZW5ndGgqMn1mdW5jdGlvbiBVVEYzMlRvU3RyaW5nKHB0cixtYXhCeXRlc1RvUmVhZCl7dmFyIGk9MDt2YXIgc3RyPSIiO3doaWxlKCEoaT49bWF4Qnl0ZXNUb1JlYWQvNCkpe3ZhciB1dGYzMj1IRUFQMzJbcHRyK2kqND4+Ml07aWYodXRmMzI9PTApYnJlYWs7KytpO2lmKHV0ZjMyPj02NTUzNil7dmFyIGNoPXV0ZjMyLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyl9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodXRmMzIpfX1yZXR1cm4gc3RyfWZ1bmN0aW9uIHN0cmluZ1RvVVRGMzIoc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpe2lmKG1heEJ5dGVzVG9Xcml0ZT09PXVuZGVmaW5lZCl7bWF4Qnl0ZXNUb1dyaXRlPTIxNDc0ODM2NDd9aWYobWF4Qnl0ZXNUb1dyaXRlPDQpcmV0dXJuIDA7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgZW5kUHRyPXN0YXJ0UHRyK21heEJ5dGVzVG9Xcml0ZS00O2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0Myl7dmFyIHRyYWlsU3Vycm9nYXRlPXN0ci5jaGFyQ29kZUF0KCsraSk7Y29kZVVuaXQ9NjU1MzYrKChjb2RlVW5pdCYxMDIzKTw8MTApfHRyYWlsU3Vycm9nYXRlJjEwMjN9SEVBUDMyW291dFB0cj4+Ml09Y29kZVVuaXQ7b3V0UHRyKz00O2lmKG91dFB0cis0PmVuZFB0cilicmVha31IRUFQMzJbb3V0UHRyPj4yXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9ZnVuY3Rpb24gbGVuZ3RoQnl0ZXNVVEYzMihzdHIpe3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpKytpO2xlbis9NH1yZXR1cm4gbGVufWZ1bmN0aW9uIGFsaWduVXAoeCxtdWx0aXBsZSl7aWYoeCVtdWx0aXBsZT4wKXt4Kz1tdWx0aXBsZS14JW11bHRpcGxlfXJldHVybiB4fXZhciBidWZmZXIsSEVBUDgsSEVBUFU4LEhFQVAxNixIRUFQVTE2LEhFQVAzMixIRUFQVTMyLEhFQVBGMzIsSEVBUEY2NDtmdW5jdGlvbiB1cGRhdGVHbG9iYWxCdWZmZXJBbmRWaWV3cyhidWYpe2J1ZmZlcj1idWY7TW9kdWxlWyJIRUFQOCJdPUhFQVA4PW5ldyBJbnQ4QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShidWYpO01vZHVsZVsiSEVBUDMyIl09SEVBUDMyPW5ldyBJbnQzMkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQVTgiXT1IRUFQVTg9bmV3IFVpbnQ4QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShidWYpO01vZHVsZVsiSEVBUFUzMiJdPUhFQVBVMzI9bmV3IFVpbnQzMkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQRjMyIl09SEVBUEYzMj1uZXcgRmxvYXQzMkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGJ1Zil9dmFyIElOSVRJQUxfTUVNT1JZPU1vZHVsZVsiSU5JVElBTF9NRU1PUlkiXXx8MTY3NzcyMTY7dmFyIHdhc21UYWJsZTt2YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO3ZhciBydW50aW1lSW5pdGlhbGl6ZWQ9ZmFsc2U7dmFyIHJ1bnRpbWVLZWVwYWxpdmVDb3VudGVyPTA7ZnVuY3Rpb24ga2VlcFJ1bnRpbWVBbGl2ZSgpe3JldHVybiBub0V4aXRSdW50aW1lfHxydW50aW1lS2VlcGFsaXZlQ291bnRlcj4wfWZ1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpfX1jYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUUFJFUlVOX18pfWZ1bmN0aW9uIGluaXRSdW50aW1lKCl7cnVudGltZUluaXRpYWxpemVkPXRydWU7Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVElOSVRfXyl9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKX19Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBPU1RSVU5fXyl9ZnVuY3Rpb24gYWRkT25QcmVSdW4oY2Ipe19fQVRQUkVSVU5fXy51bnNoaWZ0KGNiKX1mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYil9ZnVuY3Rpb24gYWRkT25Qb3N0UnVuKGNiKXtfX0FUUE9TVFJVTl9fLnVuc2hpZnQoY2IpfXZhciBydW5EZXBlbmRlbmNpZXM9MDt2YXIgcnVuRGVwZW5kZW5jeVdhdGNoZXI9bnVsbDt2YXIgZGVwZW5kZW5jaWVzRnVsZmlsbGVkPW51bGw7ZnVuY3Rpb24gYWRkUnVuRGVwZW5kZW5jeShpZCl7cnVuRGVwZW5kZW5jaWVzKys7aWYoTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0pe01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKHJ1bkRlcGVuZGVuY2llcyl9fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO2lmKE1vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKXtNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXShydW5EZXBlbmRlbmNpZXMpfWlmKHJ1bkRlcGVuZGVuY2llcz09MCl7aWYocnVuRGVwZW5kZW5jeVdhdGNoZXIhPT1udWxsKXtjbGVhckludGVydmFsKHJ1bkRlcGVuZGVuY3lXYXRjaGVyKTtydW5EZXBlbmRlbmN5V2F0Y2hlcj1udWxsfWlmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpfX19TW9kdWxlWyJwcmVsb2FkZWRJbWFnZXMiXT17fTtNb2R1bGVbInByZWxvYWRlZEF1ZGlvcyJdPXt9O2Z1bmN0aW9uIGFib3J0KHdoYXQpe3tpZihNb2R1bGVbIm9uQWJvcnQiXSl7TW9kdWxlWyJvbkFib3J0Il0od2hhdCl9fXdoYXQ9IkFib3J0ZWQoIit3aGF0KyIpIjtlcnIod2hhdCk7QUJPUlQ9dHJ1ZTtFWElUU1RBVFVTPTE7d2hhdCs9Ii4gQnVpbGQgd2l0aCAtcyBBU1NFUlRJT05TPTEgZm9yIG1vcmUgaW5mby4iO3ZhciBlPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3Iod2hhdCk7cmVhZHlQcm9taXNlUmVqZWN0KGUpO3Rocm93IGV9dmFyIGRhdGFVUklQcmVmaXg9ImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCwiO2Z1bmN0aW9uIGlzRGF0YVVSSShmaWxlbmFtZSl7cmV0dXJuIGZpbGVuYW1lLnN0YXJ0c1dpdGgoZGF0YVVSSVByZWZpeCl9ZnVuY3Rpb24gaXNGaWxlVVJJKGZpbGVuYW1lKXtyZXR1cm4gZmlsZW5hbWUuc3RhcnRzV2l0aCgiZmlsZTovLyIpfXZhciB3YXNtQmluYXJ5RmlsZTt3YXNtQmluYXJ5RmlsZT0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LEFHRnpiUUVBQUFBQjVRRWhZQU4vZjM4QVlBRi9BWDlnQVg4QVlBTi9mMzhCZjJBRmYzOS9mMzhBWUFSL2YzOS9BR0FHZjM5L2YzOS9BR0FBQUdBQ2YzOEFZQVYvZjM5L2Z3Ri9ZQUovZndGL1lBTi9mbjhCZm1BRWYzOS9md0YvWUFGOEFYMWdBQUYvWUFGOUFYMWdBWHdCZkdBQ2ZIOEJmR0FHZjN4L2YzOS9BWDlnQ245L2YzOS9mMzkvZjM4QVlBTi9mM3dBWUFkL2YzOS9mMzkvQUdBQ2ZuOEJmMkFEZkh4L0FYeGdBbng4QVh4Z0JYOTlmMzkvQVg5Z0JuOS9mMzkvZndGL1lBSjlmd0YvWUFKOGZ3Ri9ZQWQvZjM5L2YzOS9BWDlnQkg5L2ZuNEFZQU4vZjMwQVlBSi9md0Y5QXAwQkdnRmhBV0VBQUFGaEFXSUFBQUZoQVdNQUJnRmhBV1FBRXdGaEFXVUFCQUZoQVdZQUZBRmhBV2NBQ2dGaEFXZ0FCd0ZoQVdrQUFBRmhBV29BQWdGaEFXc0FBZ0ZoQVd3QURBRmhBVzBBQ0FGaEFXNEFBQUZoQVc4QUJRRmhBWEFBQWdGaEFYRUFCZ0ZoQVhJQUNRRmhBWE1BRlFGaEFYUUFBZ0ZoQVhVQUFRRmhBWFlBQVFGaEFYY0FBd0ZoQVhnQUNBRmhBWGtBQkFGaEFYb0FDQU5yYWdNREFBRUFCQU1DQWdFTkRRNEJBQUVXRHdJUUZ4Z1pCQThSQndZRkFCQURBQXdCQlFjRkF3b0FBQUVhQlJFQkFnQWJIQWtIQUFFREFBa2RDZ0FBSGdRRkJRVURDQUVIQ2hJQkN3RUxBd0VmSUFFQ0FRSUZBQUlDQ0FnQUJ3Y0NBQU1FQ1FZR0JnUUVDUTRFQlFGd0FUUTBCUWNCQVlBQ2dJQUNCZ2tCZndGQnNPM0FBZ3NISVFnQlFRSUFBVUlBUGdGREFRQUJSQUFoQVVVQUp3RkdBR3NCUndCT0FVZ0FmQWs5QVFCQkFRc3pnd0Z5VlU5cWFWVlBZMjVoYlY1c2dnRjdlbmw0ZDNaMWRITnhhR2RtWldSaVh5eEpTVUFzUUN4ZGZZQUJYQ3grZ1FGYkxIOVpXZ3J0dVFScWdRUUJBMzhnQWtHQUJFOEVRQ0FBSUFFZ0FoQVdHaUFBRHdzZ0FDQUNhaUVEQWtBZ0FDQUJjMEVEY1VVRVFBSkFJQUJCQTNGRkJFQWdBQ0VDREFFTElBSkZCRUFnQUNFQ0RBRUxJQUFoQWdOQUlBSWdBUzBBQURvQUFDQUJRUUZxSVFFZ0FrRUJhaUlDUVFOeFJRMEJJQUlnQTBrTkFBc0xBa0FnQTBGOGNTSUVRY0FBU1EwQUlBSWdCRUZBYWlJRlN3MEFBMEFnQWlBQktBSUFOZ0lBSUFJZ0FTZ0NCRFlDQkNBQ0lBRW9BZ2cyQWdnZ0FpQUJLQUlNTmdJTUlBSWdBU2dDRURZQ0VDQUNJQUVvQWhRMkFoUWdBaUFCS0FJWU5nSVlJQUlnQVNnQ0hEWUNIQ0FDSUFFb0FpQTJBaUFnQWlBQktBSWtOZ0lrSUFJZ0FTZ0NLRFlDS0NBQ0lBRW9BaXcyQWl3Z0FpQUJLQUl3TmdJd0lBSWdBU2dDTkRZQ05DQUNJQUVvQWpnMkFqZ2dBaUFCS0FJOE5nSThJQUZCUUdzaEFTQUNRVUJySWdJZ0JVME5BQXNMSUFJZ0JFOE5BUU5BSUFJZ0FTZ0NBRFlDQUNBQlFRUnFJUUVnQWtFRWFpSUNJQVJKRFFBTERBRUxJQU5CQkVrRVFDQUFJUUlNQVFzZ0FDQURRUVJySWdSTEJFQWdBQ0VDREFFTElBQWhBZ05BSUFJZ0FTMEFBRG9BQUNBQ0lBRXRBQUU2QUFFZ0FpQUJMUUFDT2dBQ0lBSWdBUzBBQXpvQUF5QUJRUVJxSVFFZ0FrRUVhaUlDSUFSTkRRQUxDeUFDSUFOSkJFQURRQ0FDSUFFdEFBQTZBQUFnQVVFQmFpRUJJQUpCQVdvaUFpQURSdzBBQ3dzZ0FBdnlBZ0lDZndGK0FrQWdBa1VOQUNBQUlBRTZBQUFnQUNBQ2FpSURRUUZySUFFNkFBQWdBa0VEU1EwQUlBQWdBVG9BQWlBQUlBRTZBQUVnQTBFRGF5QUJPZ0FBSUFOQkFtc2dBVG9BQUNBQ1FRZEpEUUFnQUNBQk9nQURJQU5CQkdzZ0FUb0FBQ0FDUVFsSkRRQWdBRUVBSUFCclFRTnhJZ1JxSWdNZ0FVSC9BWEZCZ1lLRUNHd2lBVFlDQUNBRElBSWdCR3RCZkhFaUJHb2lBa0VFYXlBQk5nSUFJQVJCQ1VrTkFDQURJQUUyQWdnZ0F5QUJOZ0lFSUFKQkNHc2dBVFlDQUNBQ1FReHJJQUUyQWdBZ0JFRVpTUTBBSUFNZ0FUWUNHQ0FESUFFMkFoUWdBeUFCTmdJUUlBTWdBVFlDRENBQ1FSQnJJQUUyQWdBZ0FrRVVheUFCTmdJQUlBSkJHR3NnQVRZQ0FDQUNRUnhySUFFMkFnQWdCQ0FEUVFSeFFSaHlJZ1JySWdKQklFa05BQ0FCclVLQmdJQ0FFSDRoQlNBRElBUnFJUUVEUUNBQklBVTNBeGdnQVNBRk53TVFJQUVnQlRjRENDQUJJQVUzQXdBZ0FVRWdhaUVCSUFKQklHc2lBa0VmU3cwQUN3c2dBQXNqQVFGL0l3QkJFR3NpQXlRQUlBTWdBallDRENBQUlBRWdBaEJDSUFOQkVHb2tBQXN6QVFGL0lBQkJBU0FBR3lFQUFrQURRQ0FBRUNjaUFRMEJRYVR0QUNnQ0FDSUJCRUFnQVJFSEFBd0JDd3NRQndBTElBRUxGd0FnQUMwQUFFRWdjVVVFUUNBQklBSWdBQkE1R2dzTGJ3RUJmeU1BUVlBQ2F5SUZKQUFDUUNBQ0lBTk1EUUFnQkVHQXdBUnhEUUFnQlNBQlFmOEJjU0FDSUFOcklnSkJnQUlnQWtHQUFra2lBUnNRR3hvZ0FVVUVRQU5BSUFBZ0JVR0FBaEFlSUFKQmdBSnJJZ0pCL3dGTERRQUxDeUFBSUFVZ0FoQWVDeUFGUVlBQ2FpUUFDM1FCQVg4Z0FrVUVRQ0FBS0FJRUlBRW9BZ1JHRHdzZ0FDQUJSZ1JBUVFFUEN5QUJLQUlFSWdJdEFBQWhBUUpBSUFBb0FnUWlBeTBBQUNJQVJRMEFJQUFnQVVjTkFBTkFJQUl0QUFFaEFTQURMUUFCSWdCRkRRRWdBa0VCYWlFQ0lBTkJBV29oQXlBQUlBRkdEUUFMQ3lBQUlBRkdDOHdNQVFkL0FrQWdBRVVOQUNBQVFRaHJJZ01nQUVFRWF5Z0NBQ0lCUVhoeElnQnFJUVVDUUNBQlFRRnhEUUFnQVVFRGNVVU5BU0FESUFNb0FnQWlBV3NpQTBIRTZRQW9BZ0JKRFFFZ0FDQUJhaUVBSUFOQnlPa0FLQUlBUndSQUlBRkIvd0ZOQkVBZ0F5Z0NDQ0lDSUFGQkEzWWlCRUVEZEVIYzZRQnFSaG9nQWlBREtBSU1JZ0ZHQkVCQnRPa0FRYlRwQUNnQ0FFRitJQVIzY1RZQ0FBd0RDeUFDSUFFMkFnd2dBU0FDTmdJSURBSUxJQU1vQWhnaEJnSkFJQU1nQXlnQ0RDSUJSd1JBSUFNb0FnZ2lBaUFCTmdJTUlBRWdBallDQ0F3QkN3SkFJQU5CRkdvaUFpZ0NBQ0lFRFFBZ0EwRVFhaUlDS0FJQUlnUU5BRUVBSVFFTUFRc0RRQ0FDSVFjZ0JDSUJRUlJxSWdJb0FnQWlCQTBBSUFGQkVHb2hBaUFCS0FJUUlnUU5BQXNnQjBFQU5nSUFDeUFHUlEwQkFrQWdBeUFES0FJY0lnSkJBblJCNU9zQWFpSUVLQUlBUmdSQUlBUWdBVFlDQUNBQkRRRkJ1T2tBUWJqcEFDZ0NBRUYrSUFKM2NUWUNBQXdEQ3lBR1FSQkJGQ0FHS0FJUUlBTkdHMm9nQVRZQ0FDQUJSUTBDQ3lBQklBWTJBaGdnQXlnQ0VDSUNCRUFnQVNBQ05nSVFJQUlnQVRZQ0dBc2dBeWdDRkNJQ1JRMEJJQUVnQWpZQ0ZDQUNJQUUyQWhnTUFRc2dCU2dDQkNJQlFRTnhRUU5IRFFCQnZPa0FJQUEyQWdBZ0JTQUJRWDV4TmdJRUlBTWdBRUVCY2pZQ0JDQUFJQU5xSUFBMkFnQVBDeUFESUFWUERRQWdCU2dDQkNJQlFRRnhSUTBBQWtBZ0FVRUNjVVVFUUNBRlFjenBBQ2dDQUVZRVFFSE02UUFnQXpZQ0FFSEE2UUJCd09rQUtBSUFJQUJxSWdBMkFnQWdBeUFBUVFGeU5nSUVJQU5CeU9rQUtBSUFSdzBEUWJ6cEFFRUFOZ0lBUWNqcEFFRUFOZ0lBRHdzZ0JVSEk2UUFvQWdCR0JFQkJ5T2tBSUFNMkFnQkJ2T2tBUWJ6cEFDZ0NBQ0FBYWlJQU5nSUFJQU1nQUVFQmNqWUNCQ0FBSUFOcUlBQTJBZ0FQQ3lBQlFYaHhJQUJxSVFBQ1FDQUJRZjhCVFFSQUlBVW9BZ2dpQWlBQlFRTjJJZ1JCQTNSQjNPa0Fha1lhSUFJZ0JTZ0NEQ0lCUmdSQVFiVHBBRUcwNlFBb0FnQkJmaUFFZDNFMkFnQU1BZ3NnQWlBQk5nSU1JQUVnQWpZQ0NBd0JDeUFGS0FJWUlRWUNRQ0FGSUFVb0Fnd2lBVWNFUUNBRktBSUlJZ0pCeE9rQUtBSUFTUm9nQWlBQk5nSU1JQUVnQWpZQ0NBd0JDd0pBSUFWQkZHb2lBaWdDQUNJRURRQWdCVUVRYWlJQ0tBSUFJZ1FOQUVFQUlRRU1BUXNEUUNBQ0lRY2dCQ0lCUVJScUlnSW9BZ0FpQkEwQUlBRkJFR29oQWlBQktBSVFJZ1FOQUFzZ0IwRUFOZ0lBQ3lBR1JRMEFBa0FnQlNBRktBSWNJZ0pCQW5SQjVPc0FhaUlFS0FJQVJnUkFJQVFnQVRZQ0FDQUJEUUZCdU9rQVFianBBQ2dDQUVGK0lBSjNjVFlDQUF3Q0N5QUdRUkJCRkNBR0tBSVFJQVZHRzJvZ0FUWUNBQ0FCUlEwQkN5QUJJQVkyQWhnZ0JTZ0NFQ0lDQkVBZ0FTQUNOZ0lRSUFJZ0FUWUNHQXNnQlNnQ0ZDSUNSUTBBSUFFZ0FqWUNGQ0FDSUFFMkFoZ0xJQU1nQUVFQmNqWUNCQ0FBSUFOcUlBQTJBZ0FnQTBISTZRQW9BZ0JIRFFGQnZPa0FJQUEyQWdBUEN5QUZJQUZCZm5FMkFnUWdBeUFBUVFGeU5nSUVJQUFnQTJvZ0FEWUNBQXNnQUVIL0FVMEVRQ0FBUVFOMklnRkJBM1JCM09rQWFpRUFBbjlCdE9rQUtBSUFJZ0pCQVNBQmRDSUJjVVVFUUVHMDZRQWdBU0FDY2pZQ0FDQUFEQUVMSUFBb0FnZ0xJUUlnQUNBRE5nSUlJQUlnQXpZQ0RDQURJQUEyQWd3Z0F5QUNOZ0lJRHd0Qkh5RUNJQU5DQURjQ0VDQUFRZi8vL3dkTkJFQWdBRUVJZGlJQklBRkJnUDQvYWtFUWRrRUljU0lCZENJQ0lBSkJnT0FmYWtFUWRrRUVjU0lDZENJRUlBUkJnSUFQYWtFUWRrRUNjU0lFZEVFUGRpQUJJQUp5SUFSeWF5SUJRUUYwSUFBZ0FVRVZhblpCQVhGeVFSeHFJUUlMSUFNZ0FqWUNIQ0FDUVFKMFFlVHJBR29oQVFKQUFrQUNRRUc0NlFBb0FnQWlCRUVCSUFKMElnZHhSUVJBUWJqcEFDQUVJQWR5TmdJQUlBRWdBellDQUNBRElBRTJBaGdNQVFzZ0FFRUFRUmtnQWtFQmRtc2dBa0VmUmh0MElRSWdBU2dDQUNFQkEwQWdBU0lFS0FJRVFYaHhJQUJHRFFJZ0FrRWRkaUVCSUFKQkFYUWhBaUFFSUFGQkJIRnFJZ2RCRUdvb0FnQWlBUTBBQ3lBSElBTTJBaEFnQXlBRU5nSVlDeUFESUFNMkFnd2dBeUFETmdJSURBRUxJQVFvQWdnaUFDQUROZ0lNSUFRZ0F6WUNDQ0FEUVFBMkFoZ2dBeUFFTmdJTUlBTWdBRFlDQ0F0QjFPa0FRZFRwQUNnQ0FFRUJheUlBUVg4Z0FCczJBZ0FMQzJvQkEzOGpBRUVRYXlJQkpBQWdBVUVBTmdJTUlBRWdBRFlDQkNBQklBQTJBZ0FnQVNBQVFRRnFOZ0lJSUFFaEFpTUFRUkJySWdNa0FDQURRUWhxSWdBZ0FpZ0NCRFlDQUNBQUtBSUFRUUU2QUFBZ0FpZ0NDRUVCT2dBQUlBTkJFR29rQUNBQlFSQnFKQUFMbGdFQkJIOGpBRUVRYXlJQkpBQWdBVUVBTmdJTUlBRWdBRFlDQkNBQklBQTJBZ0FnQVNBQVFRRnFOZ0lJSUFFaEF5TUFRUkJySWdRa0FDQUVRUWhxSWdBZ0F5Z0NCRFlDQUNBQUtBSUFMUUFBUlFSQUFuOENRQ0FES0FJSUlnSXRBQUFpQUVFQlJ3Ui9JQUJCQW5FTkFTQUNRUUk2QUFCQkFRVkJBQXNNQVFzUUJ3QUxJUUlMSUFSQkVHb2tBQ0FCUVJCcUpBQWdBZ3RMQVFKOElBQWdBS0lpQVNBQW9pSUNJQUVnQWFLaUlBRkVwMFk3aklmTnhqNmlSSFRueXVMNUFDcS9vS0lnQWlBQlJMTDdib2tRRVlFL29rUjNyTXRVVlZYRnY2Q2lJQUNnb0xZTFR3RUJmQ0FBSUFDaUlnQWdBQ0FBb2lJQm9pQUFSR2xRN3VCQ2svaytva1FuSGcvb2g4Qld2NkNpSUFGRVFqb0Y0Vk5WcFQraUlBQkVnVjRNL2YvLzM3K2lSQUFBQUFBQUFQQS9vS0NndGd2T0JBQkI4TjhBTFFBQVJRUkFRZVRmQUVFQU5nSUFRZGpmQUVFQU5nSUFRY3pmQUVFQU5nSUFRY0RmQUVFQU5nSUFRYlRmQUVFQU5nSUFRYWpmQUVFQU5nSUFRWnpmQUVFQU5nSUFRWkRmQUVFQU5nSUFRWVRmQUVFQU5nSUFRZmplQUVFQU5nSUFRZTNmQUVFQU9nQUFRZUhmQUVFQU9nQUFRZFhmQUVFQU9nQUFRY25mQUVFQU9nQUFRYjNmQUVFQU9nQUFRYkhmQUVFQU9nQUFRYVhmQUVFQU9nQUFRWm5mQUVFQU9nQUFRWTNmQUVFQU9nQUFRWUhmQUVFQU9nQUFRZlhlQUVFQU9nQUFRZkxlQUVHRGdvZ0lOZ0VBUWZEZUFFRVlPd0VBUWV6ZUFFSEhDRFlDQUVIbTNnQkJob0tJQ0RZQkFFSGszZ0JCR0RzQkFFSGczZ0JCNmdnMkFnQkIydDRBUVltQ2lBZzJBUUJCMk40QVFSZzdBUUJCMU40QVFmOEtOZ0lBUWM3ZUFFR0Rnb1FJTmdFQVFjemVBRUVZT3dFQVFjamVBRUhVQ0RZQ0FFSEMzZ0JCaG9LRUNEWUJBRUhBM2dCQkdEc0JBRUc4M2dCQjlBZzJBZ0JCdHQ0QVFZbUNoQWcyQVFCQnRONEFRUmc3QVFCQnNONEFRWXNMTmdJQVFhcmVBRUdEaG9RSU5nRUFRYWplQUVIQUFqc0JBRUdrM2dCQnV3ZzJBZ0JCbnQ0QVFZYUdoQWcyQVFCQm5ONEFRY0FDT3dFQVFaamVBRUhoQ0RZQ0FFR1MzZ0JCaVlhRUNEWUJBRUdRM2dCQndBSTdBUUJCak40QVFmUUtOZ0lBUVliZUFFR0Rob1FJTmdFQVFZVGVBRUVvT3dFQVFZRGVBRUhaQ0RZQ0FFSDYzUUJCaG9hRUNEWUJBRUg0M1FCQktEc0JBRUgwM1FCQitRZzJBZ0JCN3QwQVFZbUdoQWcyQVFCQjdOMEFRU2c3QVFCQjZOMEFRWkFMTmdJQVFmRGZBRUVCT2dBQUMwSG8zUUFMalM0QkMzOGpBRUVRYXlJTEpBQUNRQUpBQWtBQ1FBSkFBa0FDUUFKQUFrQUNRQUpBSUFCQjlBRk5CRUJCdE9rQUtBSUFJZ1pCRUNBQVFRdHFRWGh4SUFCQkMwa2JJZ2RCQTNZaUFuWWlBVUVEY1FSQUlBRkJmM05CQVhFZ0Ftb2lBMEVEZENJQlFlVHBBR29vQWdBaUJFRUlhaUVBQWtBZ0JDZ0NDQ0lDSUFGQjNPa0FhaUlCUmdSQVFiVHBBQ0FHUVg0Z0EzZHhOZ0lBREFFTElBSWdBVFlDRENBQklBSTJBZ2dMSUFRZ0EwRURkQ0lCUVFOeU5nSUVJQUVnQkdvaUFTQUJLQUlFUVFGeU5nSUVEQXdMSUFkQnZPa0FLQUlBSWdwTkRRRWdBUVJBQWtCQkFpQUNkQ0lBUVFBZ0FHdHlJQUVnQW5SeElnQkJBQ0FBYTNGQkFXc2lBQ0FBUVF4MlFSQnhJZ0oySWdGQkJYWkJDSEVpQUNBQ2NpQUJJQUIySWdGQkFuWkJCSEVpQUhJZ0FTQUFkaUlCUVFGMlFRSnhJZ0J5SUFFZ0FIWWlBVUVCZGtFQmNTSUFjaUFCSUFCMmFpSURRUU4wSWdCQjVPa0FhaWdDQUNJRUtBSUlJZ0VnQUVIYzZRQnFJZ0JHQkVCQnRPa0FJQVpCZmlBRGQzRWlCallDQUF3QkN5QUJJQUEyQWd3Z0FDQUJOZ0lJQ3lBRVFRaHFJUUFnQkNBSFFRTnlOZ0lFSUFRZ0Iyb2lBaUFEUVFOMElnRWdCMnNpQTBFQmNqWUNCQ0FCSUFScUlBTTJBZ0FnQ2dSQUlBcEJBM1lpQVVFRGRFSGM2UUJxSVFWQnlPa0FLQUlBSVFRQ2Z5QUdRUUVnQVhRaUFYRkZCRUJCdE9rQUlBRWdCbkkyQWdBZ0JRd0JDeUFGS0FJSUN5RUJJQVVnQkRZQ0NDQUJJQVEyQWd3Z0JDQUZOZ0lNSUFRZ0FUWUNDQXRCeU9rQUlBSTJBZ0JCdk9rQUlBTTJBZ0FNREF0QnVPa0FLQUlBSWdsRkRRRWdDVUVBSUFscmNVRUJheUlBSUFCQkRIWkJFSEVpQW5ZaUFVRUZka0VJY1NJQUlBSnlJQUVnQUhZaUFVRUNka0VFY1NJQWNpQUJJQUIySWdGQkFYWkJBbkVpQUhJZ0FTQUFkaUlCUVFGMlFRRnhJZ0J5SUFFZ0FIWnFRUUowUWVUckFHb29BZ0FpQVNnQ0JFRjRjU0FIYXlFRElBRWhBZ05BQWtBZ0FpZ0NFQ0lBUlFSQUlBSW9BaFFpQUVVTkFRc2dBQ2dDQkVGNGNTQUhheUlDSUFNZ0FpQURTU0lDR3lFRElBQWdBU0FDR3lFQklBQWhBZ3dCQ3dzZ0FTZ0NHQ0VJSUFFZ0FTZ0NEQ0lFUndSQUlBRW9BZ2dpQUVIRTZRQW9BZ0JKR2lBQUlBUTJBZ3dnQkNBQU5nSUlEQXNMSUFGQkZHb2lBaWdDQUNJQVJRUkFJQUVvQWhBaUFFVU5BeUFCUVJCcUlRSUxBMEFnQWlFRklBQWlCRUVVYWlJQ0tBSUFJZ0FOQUNBRVFSQnFJUUlnQkNnQ0VDSUFEUUFMSUFWQkFEWUNBQXdLQzBGL0lRY2dBRUcvZjBzTkFDQUFRUXRxSWdCQmVIRWhCMEc0NlFBb0FnQWlDVVVOQUVFQUlBZHJJUU1DUUFKQUFrQUNmMEVBSUFkQmdBSkpEUUFhUVI4Z0IwSC8vLzhIU3cwQUdpQUFRUWgySWdBZ0FFR0EvajlxUVJCMlFRaHhJZ0owSWdBZ0FFR0E0QjlxUVJCMlFRUnhJZ0YwSWdBZ0FFR0FnQTlxUVJCMlFRSnhJZ0IwUVE5MklBRWdBbklnQUhKcklnQkJBWFFnQnlBQVFSVnFka0VCY1hKQkhHb0xJZ1pCQW5SQjVPc0FhaWdDQUNJQ1JRUkFRUUFoQUF3QkMwRUFJUUFnQjBFQVFSa2dCa0VCZG1zZ0JrRWZSaHQwSVFFRFFBSkFJQUlvQWdSQmVIRWdCMnNpQlNBRFR3MEFJQUloQkNBRklnTU5BRUVBSVFNZ0FpRUFEQU1MSUFBZ0FpZ0NGQ0lGSUFVZ0FpQUJRUjEyUVFSeGFpZ0NFQ0lDUmhzZ0FDQUZHeUVBSUFGQkFYUWhBU0FDRFFBTEN5QUFJQVJ5UlFSQVFRQWhCRUVDSUFaMElnQkJBQ0FBYTNJZ0NYRWlBRVVOQXlBQVFRQWdBR3R4UVFGcklnQWdBRUVNZGtFUWNTSUNkaUlCUVFWMlFRaHhJZ0FnQW5JZ0FTQUFkaUlCUVFKMlFRUnhJZ0J5SUFFZ0FIWWlBVUVCZGtFQ2NTSUFjaUFCSUFCMklnRkJBWFpCQVhFaUFISWdBU0FBZG1wQkFuUkI1T3NBYWlnQ0FDRUFDeUFBUlEwQkN3TkFJQUFvQWdSQmVIRWdCMnNpQVNBRFNTRUNJQUVnQXlBQ0d5RURJQUFnQkNBQ0d5RUVJQUFvQWhBaUFRUi9JQUVGSUFBb0FoUUxJZ0FOQUFzTElBUkZEUUFnQTBHODZRQW9BZ0FnQjJ0UERRQWdCQ2dDR0NFR0lBUWdCQ2dDRENJQlJ3UkFJQVFvQWdnaUFFSEU2UUFvQWdCSkdpQUFJQUUyQWd3Z0FTQUFOZ0lJREFrTElBUkJGR29pQWlnQ0FDSUFSUVJBSUFRb0FoQWlBRVVOQXlBRVFSQnFJUUlMQTBBZ0FpRUZJQUFpQVVFVWFpSUNLQUlBSWdBTkFDQUJRUkJxSVFJZ0FTZ0NFQ0lBRFFBTElBVkJBRFlDQUF3SUN5QUhRYnpwQUNnQ0FDSUNUUVJBUWNqcEFDZ0NBQ0VEQWtBZ0FpQUhheUlCUVJCUEJFQkJ2T2tBSUFFMkFnQkJ5T2tBSUFNZ0Iyb2lBRFlDQUNBQUlBRkJBWEkyQWdRZ0FpQURhaUFCTmdJQUlBTWdCMEVEY2pZQ0JBd0JDMEhJNlFCQkFEWUNBRUc4NlFCQkFEWUNBQ0FESUFKQkEzSTJBZ1FnQWlBRGFpSUFJQUFvQWdSQkFYSTJBZ1FMSUFOQkNHb2hBQXdLQ3lBSFFjRHBBQ2dDQUNJSVNRUkFRY0RwQUNBSUlBZHJJZ0UyQWdCQnpPa0FRY3pwQUNnQ0FDSUNJQWRxSWdBMkFnQWdBQ0FCUVFGeU5nSUVJQUlnQjBFRGNqWUNCQ0FDUVFocUlRQU1DZ3RCQUNFQUlBZEJMMm9pQ1FKL1FZenRBQ2dDQUFSQVFaVHRBQ2dDQUF3QkMwR1k3UUJDZnpjQ0FFR1E3UUJDZ0tDQWdJQ0FCRGNDQUVHTTdRQWdDMEVNYWtGd2NVSFlxdFdxQlhNMkFnQkJvTzBBUVFBMkFnQkI4T3dBUVFBMkFnQkJnQ0FMSWdGcUlnWkJBQ0FCYXlJRmNTSUNJQWRORFFsQjdPd0FLQUlBSWdRRVFFSGs3QUFvQWdBaUF5QUNhaUlCSUFOTkRRb2dBU0FFU3cwS0MwSHc3QUF0QUFCQkJIRU5CQUpBQWtCQnpPa0FLQUlBSWdNRVFFSDA3QUFoQUFOQUlBTWdBQ2dDQUNJQlR3UkFJQUVnQUNnQ0JHb2dBMHNOQXdzZ0FDZ0NDQ0lBRFFBTEMwRUFFQ2tpQVVGL1JnMEZJQUloQmtHUTdRQW9BZ0FpQTBFQmF5SUFJQUZ4QkVBZ0FpQUJheUFBSUFGcVFRQWdBMnR4YWlFR0N5QUdJQWRORFFVZ0JrSCsvLy8vQjBzTkJVSHM3QUFvQWdBaUJBUkFRZVRzQUNnQ0FDSURJQVpxSWdBZ0EwME5CaUFBSUFSTERRWUxJQVlRS1NJQUlBRkhEUUVNQndzZ0JpQUlheUFGY1NJR1FmNy8vLzhIU3cwRUlBWVFLU0lCSUFBb0FnQWdBQ2dDQkdwR0RRTWdBU0VBQ3dKQUlBQkJmMFlOQUNBSFFUQnFJQVpORFFCQmxPMEFLQUlBSWdFZ0NTQUdhMnBCQUNBQmEzRWlBVUgrLy8vL0Iwc0VRQ0FBSVFFTUJ3c2dBUkFwUVg5SEJFQWdBU0FHYWlFR0lBQWhBUXdIQzBFQUlBWnJFQ2thREFRTElBQWlBVUYvUncwRkRBTUxRUUFoQkF3SEMwRUFJUUVNQlFzZ0FVRi9SdzBDQzBIdzdBQkI4T3dBS0FJQVFRUnlOZ0lBQ3lBQ1FmNy8vLzhIU3cwQklBSVFLU0VCUVFBUUtTRUFJQUZCZjBZTkFTQUFRWDlHRFFFZ0FDQUJUUTBCSUFBZ0FXc2lCaUFIUVNocVRRMEJDMEhrN0FCQjVPd0FLQUlBSUFacUlnQTJBZ0JCNk93QUtBSUFJQUJKQkVCQjZPd0FJQUEyQWdBTEFrQUNRQUpBUWN6cEFDZ0NBQ0lGQkVCQjlPd0FJUUFEUUNBQklBQW9BZ0FpQXlBQUtBSUVJZ0pxUmcwQ0lBQW9BZ2dpQUEwQUN3d0NDMEhFNlFBb0FnQWlBRUVBSUFBZ0FVMGJSUVJBUWNUcEFDQUJOZ0lBQzBFQUlRQkIrT3dBSUFZMkFnQkI5T3dBSUFFMkFnQkIxT2tBUVg4MkFnQkIyT2tBUVl6dEFDZ0NBRFlDQUVHQTdRQkJBRFlDQUFOQUlBQkJBM1FpQTBIazZRQnFJQU5CM09rQWFpSUNOZ0lBSUFOQjZPa0FhaUFDTmdJQUlBQkJBV29pQUVFZ1J3MEFDMEhBNlFBZ0JrRW9heUlEUVhnZ0FXdEJCM0ZCQUNBQlFRaHFRUWR4R3lJQWF5SUNOZ0lBUWN6cEFDQUFJQUZxSWdBMkFnQWdBQ0FDUVFGeU5nSUVJQUVnQTJwQktEWUNCRUhRNlFCQm5PMEFLQUlBTmdJQURBSUxJQUF0QUF4QkNIRU5BQ0FESUFWTERRQWdBU0FGVFEwQUlBQWdBaUFHYWpZQ0JFSE02UUFnQlVGNElBVnJRUWR4UVFBZ0JVRUlha0VIY1JzaUFHb2lBallDQUVIQTZRQkJ3T2tBS0FJQUlBWnFJZ0VnQUdzaUFEWUNBQ0FDSUFCQkFYSTJBZ1FnQVNBRmFrRW9OZ0lFUWREcEFFR2M3UUFvQWdBMkFnQU1BUXRCeE9rQUtBSUFJQUZMQkVCQnhPa0FJQUUyQWdBTElBRWdCbW9oQWtIMDdBQWhBQUpBQWtBQ1FBSkFBa0FDUUFOQUlBSWdBQ2dDQUVjRVFDQUFLQUlJSWdBTkFRd0NDd3NnQUMwQURFRUljVVVOQVF0QjlPd0FJUUFEUUNBRklBQW9BZ0FpQWs4RVFDQUNJQUFvQWdScUlnUWdCVXNOQXdzZ0FDZ0NDQ0VBREFBTEFBc2dBQ0FCTmdJQUlBQWdBQ2dDQkNBR2FqWUNCQ0FCUVhnZ0FXdEJCM0ZCQUNBQlFRaHFRUWR4RzJvaUNTQUhRUU55TmdJRUlBSkJlQ0FDYTBFSGNVRUFJQUpCQ0dwQkIzRWJhaUlHSUFjZ0NXb2lDR3NoQWlBRklBWkdCRUJCek9rQUlBZzJBZ0JCd09rQVFjRHBBQ2dDQUNBQ2FpSUFOZ0lBSUFnZ0FFRUJjallDQkF3REN5QUdRY2pwQUNnQ0FFWUVRRUhJNlFBZ0NEWUNBRUc4NlFCQnZPa0FLQUlBSUFKcUlnQTJBZ0FnQ0NBQVFRRnlOZ0lFSUFBZ0NHb2dBRFlDQUF3REN5QUdLQUlFSWdCQkEzRkJBVVlFUUNBQVFYaHhJUVVDUUNBQVFmOEJUUVJBSUFZb0FnZ2lBeUFBUVFOMklnQkJBM1JCM09rQWFrWWFJQU1nQmlnQ0RDSUJSZ1JBUWJUcEFFRzA2UUFvQWdCQmZpQUFkM0UyQWdBTUFnc2dBeUFCTmdJTUlBRWdBellDQ0F3QkN5QUdLQUlZSVFjQ1FDQUdJQVlvQWd3aUFVY0VRQ0FHS0FJSUlnQWdBVFlDRENBQklBQTJBZ2dNQVFzQ1FDQUdRUlJxSWdBb0FnQWlBdzBBSUFaQkVHb2lBQ2dDQUNJRERRQkJBQ0VCREFFTEEwQWdBQ0VFSUFNaUFVRVVhaUlBS0FJQUlnTU5BQ0FCUVJCcUlRQWdBU2dDRUNJRERRQUxJQVJCQURZQ0FBc2dCMFVOQUFKQUlBWWdCaWdDSENJRFFRSjBRZVRyQUdvaUFDZ0NBRVlFUUNBQUlBRTJBZ0FnQVEwQlFianBBRUc0NlFBb0FnQkJmaUFEZDNFMkFnQU1BZ3NnQjBFUVFSUWdCeWdDRUNBR1JodHFJQUUyQWdBZ0FVVU5BUXNnQVNBSE5nSVlJQVlvQWhBaUFBUkFJQUVnQURZQ0VDQUFJQUUyQWhnTElBWW9BaFFpQUVVTkFDQUJJQUEyQWhRZ0FDQUJOZ0lZQ3lBRklBWnFJUVlnQWlBRmFpRUNDeUFHSUFZb0FnUkJmbkUyQWdRZ0NDQUNRUUZ5TmdJRUlBSWdDR29nQWpZQ0FDQUNRZjhCVFFSQUlBSkJBM1lpQUVFRGRFSGM2UUJxSVFJQ2YwRzA2UUFvQWdBaUFVRUJJQUIwSWdCeFJRUkFRYlRwQUNBQUlBRnlOZ0lBSUFJTUFRc2dBaWdDQ0FzaEFDQUNJQWcyQWdnZ0FDQUlOZ0lNSUFnZ0FqWUNEQ0FJSUFBMkFnZ01Bd3RCSHlFQUlBSkIvLy8vQjAwRVFDQUNRUWgySWdBZ0FFR0EvajlxUVJCMlFRaHhJZ04wSWdBZ0FFR0E0QjlxUVJCMlFRUnhJZ0YwSWdBZ0FFR0FnQTlxUVJCMlFRSnhJZ0IwUVE5MklBRWdBM0lnQUhKcklnQkJBWFFnQWlBQVFSVnFka0VCY1hKQkhHb2hBQXNnQ0NBQU5nSWNJQWhDQURjQ0VDQUFRUUowUWVUckFHb2hCQUpBUWJqcEFDZ0NBQ0lEUVFFZ0FIUWlBWEZGQkVCQnVPa0FJQUVnQTNJMkFnQWdCQ0FJTmdJQUlBZ2dCRFlDR0F3QkN5QUNRUUJCR1NBQVFRRjJheUFBUVI5R0czUWhBQ0FFS0FJQUlRRURRQ0FCSWdNb0FnUkJlSEVnQWtZTkF5QUFRUjEySVFFZ0FFRUJkQ0VBSUFNZ0FVRUVjV29pQkNnQ0VDSUJEUUFMSUFRZ0NEWUNFQ0FJSUFNMkFoZ0xJQWdnQ0RZQ0RDQUlJQWcyQWdnTUFndEJ3T2tBSUFaQktHc2lBMEY0SUFGclFRZHhRUUFnQVVFSWFrRUhjUnNpQUdzaUFqWUNBRUhNNlFBZ0FDQUJhaUlBTmdJQUlBQWdBa0VCY2pZQ0JDQUJJQU5xUVNnMkFnUkIwT2tBUVp6dEFDZ0NBRFlDQUNBRklBUkJKeUFFYTBFSGNVRUFJQVJCSjJ0QkIzRWJha0V2YXlJQUlBQWdCVUVRYWtrYklnSkJHellDQkNBQ1FmenNBQ2tDQURjQ0VDQUNRZlRzQUNrQ0FEY0NDRUg4N0FBZ0FrRUlhallDQUVINDdBQWdCallDQUVIMDdBQWdBVFlDQUVHQTdRQkJBRFlDQUNBQ1FSaHFJUUFEUUNBQVFRYzJBZ1FnQUVFSWFpRUJJQUJCQkdvaEFDQUJJQVJKRFFBTElBSWdCVVlOQXlBQ0lBSW9BZ1JCZm5FMkFnUWdCU0FDSUFWcklnUkJBWEkyQWdRZ0FpQUVOZ0lBSUFSQi93Rk5CRUFnQkVFRGRpSUFRUU4wUWR6cEFHb2hBZ0ovUWJUcEFDZ0NBQ0lCUVFFZ0FIUWlBSEZGQkVCQnRPa0FJQUFnQVhJMkFnQWdBZ3dCQ3lBQ0tBSUlDeUVBSUFJZ0JUWUNDQ0FBSUFVMkFnd2dCU0FDTmdJTUlBVWdBRFlDQ0F3RUMwRWZJUUFnQlVJQU53SVFJQVJCLy8vL0IwMEVRQ0FFUVFoMklnQWdBRUdBL2o5cVFSQjJRUWh4SWdKMElnQWdBRUdBNEI5cVFSQjJRUVJ4SWdGMElnQWdBRUdBZ0E5cVFSQjJRUUp4SWdCMFFROTJJQUVnQW5JZ0FISnJJZ0JCQVhRZ0JDQUFRUlZxZGtFQmNYSkJIR29oQUFzZ0JTQUFOZ0ljSUFCQkFuUkI1T3NBYWlFREFrQkJ1T2tBS0FJQUlnSkJBU0FBZENJQmNVVUVRRUc0NlFBZ0FTQUNjallDQUNBRElBVTJBZ0FnQlNBRE5nSVlEQUVMSUFSQkFFRVpJQUJCQVhacklBQkJIMFliZENFQUlBTW9BZ0FoQVFOQUlBRWlBaWdDQkVGNGNTQUVSZzBFSUFCQkhYWWhBU0FBUVFGMElRQWdBaUFCUVFSeGFpSURLQUlRSWdFTkFBc2dBeUFGTmdJUUlBVWdBallDR0FzZ0JTQUZOZ0lNSUFVZ0JUWUNDQXdEQ3lBREtBSUlJZ0FnQ0RZQ0RDQURJQWcyQWdnZ0NFRUFOZ0lZSUFnZ0F6WUNEQ0FJSUFBMkFnZ0xJQWxCQ0dvaEFBd0ZDeUFDS0FJSUlnQWdCVFlDRENBQ0lBVTJBZ2dnQlVFQU5nSVlJQVVnQWpZQ0RDQUZJQUEyQWdnTFFjRHBBQ2dDQUNJQUlBZE5EUUJCd09rQUlBQWdCMnNpQVRZQ0FFSE02UUJCek9rQUtBSUFJZ0lnQjJvaUFEWUNBQ0FBSUFGQkFYSTJBZ1FnQWlBSFFRTnlOZ0lFSUFKQkNHb2hBQXdEQzBHSTZBQkJNRFlDQUVFQUlRQU1BZ3NDUUNBR1JRMEFBa0FnQkNnQ0hDSUNRUUowUWVUckFHb2lBQ2dDQUNBRVJnUkFJQUFnQVRZQ0FDQUJEUUZCdU9rQUlBbEJmaUFDZDNFaUNUWUNBQXdDQ3lBR1FSQkJGQ0FHS0FJUUlBUkdHMm9nQVRZQ0FDQUJSUTBCQ3lBQklBWTJBaGdnQkNnQ0VDSUFCRUFnQVNBQU5nSVFJQUFnQVRZQ0dBc2dCQ2dDRkNJQVJRMEFJQUVnQURZQ0ZDQUFJQUUyQWhnTEFrQWdBMEVQVFFSQUlBUWdBeUFIYWlJQVFRTnlOZ0lFSUFBZ0JHb2lBQ0FBS0FJRVFRRnlOZ0lFREFFTElBUWdCMEVEY2pZQ0JDQUVJQWRxSWdVZ0EwRUJjallDQkNBRElBVnFJQU0yQWdBZ0EwSC9BVTBFUUNBRFFRTjJJZ0JCQTNSQjNPa0FhaUVDQW45QnRPa0FLQUlBSWdGQkFTQUFkQ0lBY1VVRVFFRzA2UUFnQUNBQmNqWUNBQ0FDREFFTElBSW9BZ2dMSVFBZ0FpQUZOZ0lJSUFBZ0JUWUNEQ0FGSUFJMkFnd2dCU0FBTmdJSURBRUxRUjhoQUNBRFFmLy8vd2ROQkVBZ0EwRUlkaUlBSUFCQmdQNC9ha0VRZGtFSWNTSUNkQ0lBSUFCQmdPQWZha0VRZGtFRWNTSUJkQ0lBSUFCQmdJQVBha0VRZGtFQ2NTSUFkRUVQZGlBQklBSnlJQUJ5YXlJQVFRRjBJQU1nQUVFVmFuWkJBWEZ5UVJ4cUlRQUxJQVVnQURZQ0hDQUZRZ0EzQWhBZ0FFRUNkRUhrNndCcUlRRUNRQUpBSUFsQkFTQUFkQ0lDY1VVRVFFRzQ2UUFnQWlBSmNqWUNBQ0FCSUFVMkFnQU1BUXNnQTBFQVFSa2dBRUVCZG1zZ0FFRWZSaHQwSVFBZ0FTZ0NBQ0VIQTBBZ0J5SUJLQUlFUVhoeElBTkdEUUlnQUVFZGRpRUNJQUJCQVhRaEFDQUJJQUpCQkhGcUlnSW9BaEFpQncwQUN5QUNJQVUyQWhBTElBVWdBVFlDR0NBRklBVTJBZ3dnQlNBRk5nSUlEQUVMSUFFb0FnZ2lBQ0FGTmdJTUlBRWdCVFlDQ0NBRlFRQTJBaGdnQlNBQk5nSU1JQVVnQURZQ0NBc2dCRUVJYWlFQURBRUxBa0FnQ0VVTkFBSkFJQUVvQWh3aUFrRUNkRUhrNndCcUlnQW9BZ0FnQVVZRVFDQUFJQVEyQWdBZ0JBMEJRYmpwQUNBSlFYNGdBbmR4TmdJQURBSUxJQWhCRUVFVUlBZ29BaEFnQVVZYmFpQUVOZ0lBSUFSRkRRRUxJQVFnQ0RZQ0dDQUJLQUlRSWdBRVFDQUVJQUEyQWhBZ0FDQUVOZ0lZQ3lBQktBSVVJZ0JGRFFBZ0JDQUFOZ0lVSUFBZ0JEWUNHQXNDUUNBRFFROU5CRUFnQVNBRElBZHFJZ0JCQTNJMkFnUWdBQ0FCYWlJQUlBQW9BZ1JCQVhJMkFnUU1BUXNnQVNBSFFRTnlOZ0lFSUFFZ0Iyb2lBaUFEUVFGeU5nSUVJQUlnQTJvZ0F6WUNBQ0FLQkVBZ0NrRURkaUlBUVFOMFFkenBBR29oQlVISTZRQW9BZ0FoQkFKL1FRRWdBSFFpQUNBR2NVVUVRRUcwNlFBZ0FDQUdjallDQUNBRkRBRUxJQVVvQWdnTElRQWdCU0FFTmdJSUlBQWdCRFlDRENBRUlBVTJBZ3dnQkNBQU5nSUlDMEhJNlFBZ0FqWUNBRUc4NlFBZ0F6WUNBQXNnQVVFSWFpRUFDeUFMUVJCcUpBQWdBQXN4QUNBQkFuOGdBaWdDVEVFQVNBUkFJQUFnQVNBQ0VEa01BUXNnQUNBQklBSVFPUXNpQUVZRVFBOExJQUFnQVc0YUMxSUJBbjlCZ05jQUtBSUFJZ0VnQUVFRGFrRjhjU0lDYWlFQUFrQWdBa0VBSUFBZ0FVMGJEUUFnQUQ4QVFSQjBTd1JBSUFBUUZFVU5BUXRCZ05jQUlBQTJBZ0FnQVE4TFFZam9BRUV3TmdJQVFYOExnd0VDQTM4QmZnSkFJQUJDZ0lDQWdCQlVCRUFnQUNFRkRBRUxBMEFnQVVFQmF5SUJJQUFnQUVJS2dDSUZRZ3ArZmFkQk1ISTZBQUFnQUVMLy8vLy9ud0ZXSVFJZ0JTRUFJQUlOQUFzTElBV25JZ0lFUUFOQUlBRkJBV3NpQVNBQ0lBSkJDbTRpQTBFS2JHdEJNSEk2QUFBZ0FrRUpTeUVFSUFNaEFpQUVEUUFMQ3lBQkMrY0NBZ04vQVh3akFFRVFheUlCSkFBQ2ZTQUF2Q0lEUWYvLy8vOEhjU0lDUWRxZnBQb0RUUVJBUXdBQWdEOGdBa0dBZ0lETUEwa05BUm9nQUxzUUpRd0JDeUFDUWRHbjdZTUVUUVJBSUFDN0lRUWdBa0hrbDl1QUJFOEVRRVFZTFVSVSt5RUp3RVFZTFVSVSt5RUpRQ0FEUVFCT0d5QUVvQkFsakF3Q0N5QURRUUJJQkVBZ0JFUVlMVVJVK3lINVA2QVFKQXdDQzBRWUxVUlUreUg1UHlBRW9SQWtEQUVMSUFKQjFlT0lod1JOQkVBZ0FrSGcyNytGQkU4RVFFUVlMVVJVK3lFWndFUVlMVVJVK3lFWlFDQURRUUJPR3lBQXU2QVFKUXdDQ3lBRFFRQklCRUJFMGlFemYzelpFc0FnQUx1aEVDUU1BZ3NnQUx0RTBpRXpmM3paRXNDZ0VDUU1BUXNnQUNBQWt5QUNRWUNBZ1B3SFR3MEFHZ0pBQWtBQ1FBSkFJQUFnQVVFSWFoQkxRUU54RGdNQUFRSURDeUFCS3dNSUVDVU1Bd3NnQVNzRENKb1FKQXdDQ3lBQkt3TUlFQ1dNREFFTElBRXJBd2dRSkFzaEFDQUJRUkJxSkFBZ0FBc0dBQ0FBRUNFTHhRRUJBbjhqQUVFUWF5SUJKQUFDUUNBQXZVSWdpS2RCLy8vLy93ZHhJZ0pCKzhPay93Tk5CRUFnQWtHQWdNRHlBMGtOQVNBQVJBQUFBQUFBQUFBQVFRQVFMaUVBREFFTElBSkJnSURBL3dkUEJFQWdBQ0FBb1NFQURBRUxBa0FDUUFKQUFrQWdBQ0FCRUV4QkEzRU9Bd0FCQWdNTElBRXJBd0FnQVNzRENFRUJFQzRoQUF3REN5QUJLd01BSUFFckF3Z1FMeUVBREFJTElBRXJBd0FnQVNzRENFRUJFQzZhSVFBTUFRc2dBU3NEQUNBQkt3TUlFQythSVFBTElBRkJFR29rQUNBQUM1a0JBUU44SUFBZ0FLSWlBeUFESUFPaW9pQURSSHpWejFvNjJlVTlva1RybkN1SzV1VmF2cUNpSUFNZ0EwUjkvckZYNHgzSFBxSkUxV0hCR2FBQktyK2dva1NtK0JBUkVSR0JQNkNnSVFVZ0F5QUFvaUVFSUFKRkJFQWdCQ0FESUFXaVJFbFZWVlZWVmNXL29LSWdBS0FQQ3lBQUlBTWdBVVFBQUFBQUFBRGdQNklnQlNBRW9xR2lJQUdoSUFSRVNWVlZWVlZWeFQraW9LRUxrZ0VCQTN4RUFBQUFBQUFBOEQ4Z0FDQUFvaUlDUkFBQUFBQUFBT0Evb2lJRG9TSUVSQUFBQUFBQUFQQS9JQVNoSUFPaElBSWdBaUFDSUFKRWtCWExHYUFCK2o2aVJIZFJ3Ulpzd1ZhL29LSkVURlZWVlZWVnBUK2dvaUFDSUFLaUlnTWdBNklnQWlBQ1JOUTRpTDdwK3FpOW9rVEVzYlM5bnU0aFBxQ2lSSzFTbklCUGZwSytvS0tnb2lBQUlBR2lvYUNnQzYwS0F3dC9CbndCZlNNQVFTQnJJZ3NrQUNBTElBQXBBekEzQXhnZ0N5QUFLUU1vTndNUUlBc2dBQ2tESURjRENDQUFJQUFvQWlBZ0FtbzJBaUFnQkFSQUlBSkJRR29oRENBQUtBSVlJUVlnQUNnQ0VDRUpBMEFnQmlBRlFRSjBJZ2RxSUFjZ0NXb2lCeW9DQURnQ0FDQUhJQU1nQlNBTWFrRUNkR29xQWdBNEFnQWdCaUFGUVFGeUlnaEJBblFpQjJvZ0J5QUphaUlIS2dJQU9BSUFJQWNnQXlBSUlBeHFRUUowYWlvQ0FEZ0NBQ0FGUVFKcUlnVkJ3QUJIRFFBTEFrQWdBa0VBVEEwQVFRQWhCU0FDUVFGclFRTlBCRUFnQWtGOGNTRUhBMEFnQlVFQ2RDSUpJQVpxSWdnZ0F5QUphaW9DQURnQ2dBSWdDQ0FESUFsQkJISnFLZ0lBT0FLRUFpQUlJQU1nQ1VFSWNtb3FBZ0E0QW9nQ0lBZ2dBeUFKUVF4eWFpb0NBRGdDakFJZ0JVRUVhaUVGSUExQkJHb2lEU0FIUncwQUN3c2dBa0VEY1NJSVJRMEFBMEFnQlVFQ2RDSUhJQVpxSUFNZ0Iyb3FBZ0E0QW9BQ0lBVkJBV29oQlNBT1FRRnFJZzRnQ0VjTkFBc0xJQVloQXd0RUFBQUFBQUFBOEQ4Z0Fic2lGYU1oRkNBQUtBSWtJUVVnQUNnQ0tDRUdRWDhoQ2dOQUFrQUNRQ0FGSUFaTUJFQWdCU0VHREFFTElBUkZCRUFEUUNBS1FRRnFJZ29nQWs0TkF5QUFJQVpCQVdvaUJqWUNLQ0FGSUFaS0RRQUxJQVVoQmd3QkN3TkFJQXBCQVdvaUNpQUNUZzBDSUFNZ0NrRUNkR29xQWdBaEZpQUFLQUlJSWdZZ0JrRUVha0djQkJBNklBQW9BZ2dnRmpnQ25BUWdBQ0FBS0FJb1FRRnFJZ1UyQWlnZ0JTQUFLQUlrSWdaSURRQUxDeUFBS0FJZ1FVQnJJUWNnQndKL0lBQXJBekFpRTBRQUFBQUFBQUJRUUtBaUVKbEVBQUFBQUFBQTRFRmpCRUFnRUtvTUFRdEJnSUNBZ0hnTElnaElJUVVnQnlBSUlBVWJJUXdDZnlBVFJBQUFBQUFBQUZEQW9FUUFBQUFBQUFEd1A2QWlFSmxFQUFBQUFBQUE0RUZqQkVBZ0VLb01BUXRCZ0lDQWdIZ0xJZzVCQUNBT1FRQktHeUVGUWNBQUlBWnJJUWtDUUNBQlF3QUFnRDlkQkVCRUFBQUFBQUFBQUFBaEVpQUZJQXhPRFFFZ0FDZ0NDQ0VJQTBCRUFBQUFBQUFBQUFBaEVTQUlJQVVnQ1dwQkFuUnFLZ0lBdXlBVElBVzNvWmtpRUVRQUFBQUFBSUJQUUdZRWZFUUFBQUFBQUFBQUFBVWdBQ2dDQUFKL0lCQkVBQUFBQUFBQVFFQ2lJaEdaUkFBQUFBQUFBT0JCWXdSQUlCR3FEQUVMUVlDQWdJQjRDeUlOUVFKMGFpSUhLZ0lFdXlBSEtnSUF1eUlRb1NBUklBMjNvYUlnRUtBTG9pQVNvQ0VTSUFWQkFXb2lCU0FNUncwQUN3d0JDMFFBQUFBQUFBQUFBQ0VTSUFVZ0RFNE5BQ0FBS0FJSUlRZ0RRRVFBQUFBQUFBQUFBQ0VSSUJRZ0NDQUZJQWxxUVFKMGFpb0NBTHVpSUJRZ0V5QUZ0NkdpbVNJUVJBQUFBQUFBZ0U5QVpnUjhSQUFBQUFBQUFBQUFCU0FBS0FJQUFuOGdFRVFBQUFBQUFBQkFRS0lpRVpsRUFBQUFBQUFBNEVGakJFQWdFYW9NQVF0QmdJQ0FnSGdMSWcxQkFuUnFJZ2NxQWdTN0lBY3FBZ0M3SWhDaElCRWdEYmVob2lBUW9BdWlJQktnSVJJZ0JVRUJhaUlGSUF4SERRQUxDeUFFQkVBZ0JDQVBRUUowYWlBU3RqZ0NBQXNnQUNBR05nSW9JQUFnRXlBVm9DSVFPUU13SUFBQ2Z5QVFtVVFBQUFBQUFBRGdRV01FUUNBUXFnd0JDMEdBZ0lDQWVBc2lCVFlDSkNBUFFRRnFJUThnQlNBR1RBMEJBMEFnQ2tFQmFpSUtJQUpPRFFFZ0FDQUVCSDhnQXlBS1FRSjBhaW9DQUNFV0lBQW9BZ2dpQmlBR1FRUnFRWndFRURvZ0FDZ0NDQ0FXT0FLY0JDQUFLQUlrSVFVZ0FDZ0NLQVVnQmd0QkFXb2lCallDS0NBRklBWktEUUFMREFFTEN5QUVSUVJBSUFBZ0N5a0RDRGNESUNBQUlBc3BBeGczQXpBZ0FDQUxLUU1RTndNb0N5QUxRU0JxSkFBZ0R3dEpBUUovSUFBb0FnUWlCVUVJZFNFR0lBQW9BZ0FpQUNBQklBVkJBWEVFZnlBR0lBSW9BZ0JxS0FJQUJTQUdDeUFDYWlBRFFRSWdCVUVDY1JzZ0JDQUFLQUlBS0FJWUVRUUFDLzBDQWdGOEEzOGpBRUVRYXlJQ0pBQUNRQ0FBdkNJRVFmLy8vLzhIY1NJRFFkcWZwUG9EVFFSQUlBTkJnSUNBekFOSkRRRWdBTHNRSkNFQURBRUxJQU5CMGFmdGd3Uk5CRUFnQUxzaEFTQURRZU9YMjRBRVRRUkFJQVJCQUVnRVFDQUJSQmd0UkZUN0lmay9vQkFsakNFQURBTUxJQUZFR0MxRVZQc2grYitnRUNVaEFBd0NDMFFZTFVSVSt5RUp3RVFZTFVSVSt5RUpRQ0FFUVFCT0d5QUJvSm9RSkNFQURBRUxJQU5CMWVPSWh3Uk5CRUFnQUxzaEFTQURRZC9idjRVRVRRUkFJQVJCQUVnRVFDQUJSTkloTTM5ODJSSkFvQkFsSVFBTUF3c2dBVVRTSVROL2ZOa1N3S0FRSll3aEFBd0NDMFFZTFVSVSt5RVp3RVFZTFVSVSt5RVpRQ0FFUVFCT0d5QUJvQkFrSVFBTUFRc2dBMEdBZ0lEOEIwOEVRQ0FBSUFDVElRQU1BUXNDUUFKQUFrQUNRQ0FBSUFKQkNHb1FTMEVEY1E0REFBRUNBd3NnQWlzRENCQWtJUUFNQXdzZ0Fpc0RDQkFsSVFBTUFnc2dBaXNEQ0pvUUpDRUFEQUVMSUFJckF3Z1FKWXdoQUFzZ0FrRVFhaVFBSUFBTHFBRUFBa0FnQVVHQUNFNEVRQ0FBUkFBQUFBQUFBT0Ivb2lFQUlBRkIvdzlKQkVBZ0FVSC9CMnNoQVF3Q0N5QUFSQUFBQUFBQUFPQi9vaUVBSUFGQi9SY2dBVUg5RjBrYlFmNFBheUVCREFFTElBRkJnWGhLRFFBZ0FFUUFBQUFBQUFCZ0E2SWhBQ0FCUWJod1N3UkFJQUZCeVFkcUlRRU1BUXNnQUVRQUFBQUFBQUJnQTZJaEFDQUJRZkJvSUFGQjhHaExHMEdTRDJvaEFRc2dBQ0FCUWY4SGFxMUNOSWEvb2dzRkFCQmdBQXRMQVFKL0lBQW9BZ1FpQmtFSWRTRUhJQUFvQWdBaUFDQUJJQUlnQmtFQmNRUi9JQWNnQXlnQ0FHb29BZ0FGSUFjTElBTnFJQVJCQWlBR1FRSnhHeUFGSUFBb0FnQW9BaFFSQmdBTG1nRUFJQUJCQVRvQU5RSkFJQUFvQWdRZ0FrY05BQ0FBUVFFNkFEUUNRQ0FBS0FJUUlnSkZCRUFnQUVFQk5nSWtJQUFnQXpZQ0dDQUFJQUUyQWhBZ0EwRUJSdzBDSUFBb0FqQkJBVVlOQVF3Q0N5QUJJQUpHQkVBZ0FDZ0NHQ0lDUVFKR0JFQWdBQ0FETmdJWUlBTWhBZ3NnQUNnQ01FRUJSdzBDSUFKQkFVWU5BUXdDQ3lBQUlBQW9BaVJCQVdvMkFpUUxJQUJCQVRvQU5nc0xYUUVCZnlBQUtBSVFJZ05GQkVBZ0FFRUJOZ0lrSUFBZ0FqWUNHQ0FBSUFFMkFoQVBDd0pBSUFFZ0EwWUVRQ0FBS0FJWVFRSkhEUUVnQUNBQ05nSVlEd3NnQUVFQk9nQTJJQUJCQWpZQ0dDQUFJQUFvQWlSQkFXbzJBaVFMQzZ3QkF3RjhBWDRCZnlBQXZTSUNRalNJcDBIL0QzRWlBMEd5Q0UwRWZDQURRZjBIVFFSQUlBQkVBQUFBQUFBQUFBQ2lEd3NDZkNBQUlBQ2FJQUpDQUZrYklnQkVBQUFBQUFBQU1FT2dSQUFBQUFBQUFERERvQ0FBb1NJQlJBQUFBQUFBQU9BL1pBUkFJQUFnQWFCRUFBQUFBQUFBOEwrZ0RBRUxJQUFnQWFBaUFDQUJSQUFBQUFBQUFPQy9aVVVOQUJvZ0FFUUFBQUFBQUFEd1A2QUxJZ0FnQUpvZ0FrSUFXUnNGSUFBTEM4QUJBUU4vQWtBZ0FTQUNLQUlRSWdNRWZ5QURCU0FDRUVnTkFTQUNLQUlRQ3lBQ0tBSVVJZ1ZyU3dSQUlBSWdBQ0FCSUFJb0FpUVJBd0FQQ3dKQUlBSW9BbEJCQUVnRVFFRUFJUU1NQVFzZ0FTRUVBMEFnQkNJRFJRUkFRUUFoQXd3Q0N5QUFJQU5CQVdzaUJHb3RBQUJCQ2tjTkFBc2dBaUFBSUFNZ0FpZ0NKQkVEQUNJRUlBTkpEUUVnQUNBRGFpRUFJQUVnQTJzaEFTQUNLQUlVSVFVTElBVWdBQ0FCRUJvYUlBSWdBaWdDRkNBQmFqWUNGQ0FCSUFOcUlRUUxJQVFMMVFJQkFuOENRQ0FBSUFGR0RRQWdBU0FBSUFKcUlnUnJRUUFnQWtFQmRHdE5CRUFnQUNBQklBSVFHaG9QQ3lBQUlBRnpRUU54SVFNQ1FBSkFJQUFnQVVrRVFDQUREUUlnQUVFRGNVVU5BUU5BSUFKRkRRUWdBQ0FCTFFBQU9nQUFJQUZCQVdvaEFTQUNRUUZySVFJZ0FFRUJhaUlBUVFOeERRQUxEQUVMQWtBZ0F3MEFJQVJCQTNFRVFBTkFJQUpGRFFVZ0FDQUNRUUZySWdKcUlnTWdBU0FDYWkwQUFEb0FBQ0FEUVFOeERRQUxDeUFDUVFOTkRRQURRQ0FBSUFKQkJHc2lBbW9nQVNBQ2FpZ0NBRFlDQUNBQ1FRTkxEUUFMQ3lBQ1JRMENBMEFnQUNBQ1FRRnJJZ0pxSUFFZ0Ftb3RBQUE2QUFBZ0FnMEFDd3dDQ3lBQ1FRTk5EUUFEUUNBQUlBRW9BZ0EyQWdBZ0FVRUVhaUVCSUFCQkJHb2hBQ0FDUVFScklnSkJBMHNOQUFzTElBSkZEUUFEUUNBQUlBRXRBQUE2QUFBZ0FFRUJhaUVBSUFGQkFXb2hBU0FDUVFGcklnSU5BQXNMQzY4dUFROS9JQUFnQUMwQUFTSU1JQUFvQWdScVFRRnFOZ0lRSUFBb0Fod29BZ0FnQUM4QkdHb2dBU0FBTFFBQUloRVFHaG9nQUNBUk9nQVVJQUF0QUFBaUJDQUFLQUljS0FJQUlBQXZBUmhxYWlBQ0lBQXRBQUVpQVJBYUdpQUFJQUVnQkdvaUFqb0FGQ0FBSUFBdEFDQWlBU0FDSUFFZ0FrSC9BWEZMR3lJQk9nQWdJQUFvQWlnb0FnQWdBQzhCSkdvZ0FDZ0NIQ2dDQUNBQUx3RVlhaUFCUWY4QmNSQWFHaUFBSUFFNkFDQWdBRUVBT2dDa0FVRUJJUkFnQUNBQUxRQUJRUUZxT2dCMElBQW9BbndvQWdBZ0FDOEJlR3BCQURvQUFDQUFMUUFCQkVBRFFDQVFRZjhCY1NJS1FRRnJRZjhCYnlFQklBQW9BaHdvQWdBZ0FDOEJHR29pQnkwQUFDRUNBa0FnQUMwQUZDSUlRUUpKRFFBZ0FVSC9BV29nQVNBQlFRQklHMEh3S21vdEFBQWhCa0VCSVFFZ0NFRUJheUlFUVFGeElRVWdDRUVDUndSQUlBUkJmbkVoQ0VFQUlRMERRQ0FCUVFGcUlRUWdBa0gvQVhFaUFnUi9JQVpCOENocUxRQUFJQUpCOENocUxRQUFha0h3S21vdEFBQUZRUUFMSUFFZ0Iyb3RBQUJ6UWY4QmNTSUNCSDhnQmtId0tHb3RBQUFnQWtId0tHb3RBQUJxUWZBcWFpMEFBQVZCQUFzaEFpQUJRUUpxSVFFZ0JDQUhhaTBBQUNBQ2N5RUNJQTFCQW1vaURTQUlSdzBBQ3dzZ0JVVU5BQ0FDUWY4QmNTSUNCSDhnQmtId0tHb3RBQUFnQWtId0tHb3RBQUJxUWZBcWFpMEFBQVZCQUFzZ0FTQUhhaTBBQUhNaEFnc2dBQ2dDZkNnQ0FDQUFMd0Y0YWlBS2FpQUNPZ0FBSUFBdEFBRWdFRUVCYWlJUVFmOEJjVThOQUFzTEFrQUNRQ0FBTFFCMElnUkZEUUFnRENBUmFpRVNJQUFvQW53b0FnQWdBQzhCZUdvaEFrRUFJUUVEUUNBQklBSnFMUUFBUlFSQUlBUWdBVUVCYWlJQlJ3MEJEQUlMQ3lBU1FmOEJjU0lQSVFWQkFDRUJRUUFoQWlBQVFRQTZBRGdDUUNBQUxRQ2tBVVVOQUFOQUlBQW9BcXdCS0FJQUlBQXZBYWdCYWlBQmFpMEFBQ0VJSUFBb0FrQW9BZ0FoQkNBQUlBSkJBV282QURnZ0JDQUFMd0U4YWlBQ1FmOEJjV29nQ0VGL2N5QUZham9BQUNBQlFRRnFJZ0VnQUMwQXBBRlBEUUVnQUMwQU9DRUNEQUFMQUFzZ0FDZ0NpQUVvQWdBZ0FDOEJoQUZxUVFBZ0FDMEFnZ0VRR3hvZ0FDZ0NpQUVvQWdBZ0FDOEJoQUZxSUFBb0Fud29BZ0FnQUM4QmVHcEJBV29nQUMwQWRFRUJheUlDUWY4QmNSQWFHaUFBSUFJNkFJQUJJQUF0QUtRQklnRUVRQU5BSUFKQi93RnhRUUZMQkVCQkFDRUJRUUFnQUNnQ1FDZ0NBQ0FBTHdFOGFpQUphaTBBQUNJQ0lBSkIvd0ZHRzBId0ttb3RBQUFoQ2dOQVFRQWhBaUFBS0FLSUFTZ0NBQ0FBTHdHRUFXb2lCU0FCUWY4QmNXb2lDQzBBQUNJRUJFQWdDa0h3S0dvdEFBQWdCRUh3S0dvdEFBQnFRZkFxYWkwQUFDRUNDeUFJSUFVZ0FVRUJhaUlCUWY4QmNXb3RBQUFnQW5NNkFBQWdBQzBBZ0FFaUFrRUJheUFCUVJoMFFSaDFTZzBBQ3lBQUxRQ2tBU0VCQ3lBSlFRRnFJZ2tnQVVIL0FYRkpEUUFMQzBFQUlSQWdBQzBBcEFFaENTQUFRUUU2QUVRZ0FFRUJPZ0E0SUFCQlFHc29BZ0FvQWdBZ0FDOEJQR3BCQVRvQUFDQUFLQUpNS0FJQUlBQXZBVWhxUVFFNkFBQWdDU0FBTFFBQklnMUhCRUFnQUMwQWdBRWlBU0FOYTBIL0FYRkJBQ0FCSUExTEd5RUdBMEFnQUNnQ2lBRW9BZ0FnQUM4QmhBRnFJZ3dnQmlBT2FpSUtRZjhCY1dvdEFBQWhEU0FBTFFBNElnZEJBazhFUUNBQUtBSkFLQUlBSUFBdkFUeHFJUVZCQVNFQlFRRWhBZ05BUVFBaEN3SkFJQVVnQnlBQ1FYOXpha0gvQVhGcUxRQUFJZ2hGRFFBZ0RDQUtJQUZyUWY4QmNXb3RBQUFpQkVVTkFDQUVRZkFvYWkwQUFDQUlRZkFvYWkwQUFHcEI4Q3BxTFFBQUlRc0xJQUpCQVdvaEFpQUxJQTF6SVEwZ0FVRUJhaUlCSUFkSERRQUxDeUFBS0FKTUtBSUFJUUlnQUNBQUxRQkVJZ0ZCQVdvNkFFUWdBU0FDSUFBdkFVaHFha0VBT2dBQUlBMUIvd0Z4SWdnRVFDQUFMUUJFSWdzZ0FDMEFPQ0lCU3dSQUlBQWdDem9BWENBTlFmOEJjU0VJUVFBaEFnTkFJQUFvQW1Rb0FnQWdBQzhCWUdvZ0Ftb2dBQ2dDVENnQ0FDQUFMd0ZJYWlBQ2FpMEFBQ0lCQkg4Z0NFSHdLR290QUFBZ0FVSHdLR290QUFCcVFmQXFhaTBBQUFWQkFBczZBQUFnQWtFQmFpSUNJQUF0QUVSSkRRQUxJQUFnQUMwQU9DSUJPZ0JFUVFBaEFnSkFJQUVFUUNBSVFmQW9haTBBQUVIL0FYTkI4Q3BxTFFBQUlRUURRQ0FBS0FKTUtBSUFJQUF2QVVocUlBSnFJQUFvQWtBb0FnQWdBQzhCUEdvZ0Ftb3RBQUFpQVFSL0lBUkI4Q2hxTFFBQUlBRkI4Q2hxTFFBQWFrSHdLbW90QUFBRlFRQUxPZ0FBSUFKQkFXb2lBaUFBTFFBNElnRkpEUUFMREFFTFFRQWhBUXNnQUNBQklBQXRBRndpQWlBQklBSkxHeUlCT2dBNElBQW9Ba0FvQWdBZ0FDOEJQR29nQUNnQ1pDZ0NBQ0FBTHdGZ2FpQUJFQm9hSUFBZ0FUb0FPQ0FBTFFCRUlRc0xJQUFnQ3pvQVhFRUFJUUlnQ3dSQUEwQWdBQ2dDWkNnQ0FDQUFMd0ZnYWlBQ2FpQUFLQUpNS0FJQUlBQXZBVWhxSUFKcUxRQUFJZ0VFZnlBSVFmQW9haTBBQUNBQlFmQW9haTBBQUdwQjhDcHFMUUFBQlVFQUN6b0FBQ0FDUVFGcUlnSWdBQzBBUkVrTkFBc2dBQzBBWENFQ0lBQXRBRGdoQVFzZ0FDQUJJQUlnQVVIL0FYRWdBa0gvQVhGTEd5SUNPZ0JvUVFBaEFTQUFLQUp3S0FJQUlBQXZBV3hxUVFBZ0FrSC9BWEVRR3hvZ0FDMEFPQ0lFQkVCQkFDRUNJQVFoQVFOQUlBQW9BbkFvQWdBZ0FDOEJiR29nQUMwQWFDQUNJQUZyYWtIL0FYRnFJQUFvQWtBb0FnQWdBQzhCUEdvZ0Ftb3RBQUE2QUFBZ0FrRUJhaUlDSUFBdEFEZ2lBVWtOQUFzTFFRQWhBaUFBTFFCY0lnc0VRQU5BSUFBb0FuQW9BZ0FnQUM4QmJHb2dBQzBBYUNBQ0lBdHJha0gvQVhGcUlnRWdBUzBBQUNBQUtBSmtLQUlBSUFBdkFXQnFJQUpxTFFBQWN6b0FBQ0FDUVFGcUlnSWdBQzBBWENJTFNRMEFDeUFBTFFBNElRRUxJQUFnQVNBQUxRQm9JZ0lnQVVIL0FYRWdBa3NiSWdFNkFEZ2dBQ2dDUUNnQ0FDQUFMd0U4YWlBQUtBSndLQUlBSUFBdkFXeHFJQUZCL3dGeEVCb2FJQUFnQVRvQU9Bc2dBQzBBQVNJTklBbHJJQTVCQVdvaURrSC9BWEZMRFFBTEN3SkFJQUF0QURnaUNFVUVRRUVBSVFJTUFRc2dBQ2dDUUNnQ0FDQUFMd0U4YWlFRVFRQWhBUU5BSUFFaUFrRUJhaUVCSUFRZ0FrSC9BWEZxTFFBQVJRMEFDd3NnRFNBQ1FYOXpJQWxySUFocVFRRjBJQWxxVHdSQUlBQW9BcUFCS0FJQUlBQXZBWndCYWlBQUtBSkFLQUlBSUFBdkFUeHFJQUpxSUFnZ0Ftc1FHaG9nQUNBQUxRQTRJQUpyT2dDWUFRc2dBQ0FBTFFDWUFTSUVPZ0E0SUFSQkdIUkJnSUNBQ0d0QkdIVWlBVUVBVGdSQVFRQWhDd05BSUFBb0FrQW9BZ0FnQUM4QlBHb2dDMm9nQUNnQ29BRW9BZ0FnQUM4Qm5BRnFJQUZCL3dGeGFpMEFBRG9BQUNBQlFRRnJJUUVnQzBFQmFpSUxJQVJIRFFBTElBQXRBRGdoQkFzZ0FFRUFPZ0N3QVNBUFJRUkFRUUVQQ3lBRUlRRkJBQ0VPQTBBZ0FDZ0NRQ2dDQUNBQUx3RThhaUlHTFFBQUlRSUNRQ0FCUWY4QmNTSUZRUUpKRFFBZ0VFSHdLbW90QUFBaERFRUJJUUVnQlVFQmF5SUlRUUZ4SVFvZ0JVRUNSd1JBSUFoQmZuRWhCVUVBSVEwRFFFRUFJUXNnQVVFQmFpRUlJQUpCL3dGeElnSUVmeUFNUWZBb2FpMEFBQ0FDUWZBb2FpMEFBR3BCOENwcUxRQUFCVUVBQ3lBQklBWnFMUUFBYzBIL0FYRWlBZ1IvSUF4QjhDaHFMUUFBSUFKQjhDaHFMUUFBYWtId0ttb3RBQUFGUVFBTElRSWdBVUVDYWlFQklBWWdDR290QUFBZ0FuTWhBaUFOUVFKcUlnMGdCVWNOQUFzTElBcEZEUUFnQWtIL0FYRWlBZ1IvSUF4QjhDaHFMUUFBSUFKQjhDaHFMUUFBYWtId0ttb3RBQUFGUVFBTElBRWdCbW90QUFCeklRSUxJQUpCL3dGeFJRUkFJQUFvQXJnQktBSUFJUUlnQUNBQUxRQ3dBU0lCUVFGcU9nQ3dBU0FCSUFJZ0FDOEJ0QUZxYWlBU0lBNUJmM05xT2dBQUN5QVBJQkJCQVdvaUVFY0VRQ0FPUVFGcUlRNGdBQzBBT0NFQkRBRUxDMEVCSVFFZ0FDMEFzQUVpQWlBRVFRRnJRZjhCY1VjTkFTQUNSUTBCSUFCQkZHb2hBa0VBSVFFRFFDQUFLQUs0QVNnQ0FDQUFMd0cwQVdvZ0FXb3RBQUFoQlNBQUtBS3NBU2dDQUNFSUlBQWdBQzBBcEFFaUJFRUJham9BcEFFZ0JDQUlJQUF2QWFnQmFtb2dCVG9BQUNBQlFRRnFJZ0VnQUMwQXNBRkpEUUFMSUFJaENFRUFJUUlnQUVHOEFXb2lCQ0FBTFFDa0FUb0FBQ0FBTFFDa0FRUkFBMEFnQUNnQ3hBRW9BZ0FnQUM4QndBRnFJQUpxSUFndEFBQWdBQ2dDckFFb0FnQWdBQzhCcUFGcUlBSnFMUUFBUVg5emFqb0FBQ0FDUVFGcUlnSWdBQzBBcEFGSkRRQUxDMEVBSVFvZ0FDSUJRUUU2QUl3QklBQW9BcFFCS0FJQUlBQXZBWkFCYWtFQk9nQUFJQUJCQWpvQVJDQUFRUUU2QURnZ0JDMEFBQVJBQTBBZ0FTZ0NRQ2dDQUNBQkx3RThha0VCT2dBQUlBRW9Ba3dvQWdBZ0FTOEJTR3BCQUNBRUtBSUlLQUlBSUFRdkFRUnFJQXBxTFFBQUlnSWdBa0gvQVVZYlFmQXFhaTBBQURvQUFDQUJLQUpNS0FJQUlBRXZBVWhxUVFBNkFBRWdBU0FCTFFBNElnVWdBUzBBUkNJQ0lBSWdCVWtiSWdJNkFGd2dBU2dDWkNnQ0FDQUJMd0ZnYWtFQUlBSVFHeHBCQUNFR0lBRXRBRGdpQndSQUEwQWdBU2dDWkNnQ0FDQUJMd0ZnYWlBQkxRQmNJQVlnQjJ0cVFmOEJjV29nQVNnQ1FDZ0NBQ0FCTHdFOGFpQUdhaTBBQURvQUFDQUdRUUZxSWdZZ0FTMEFPQ0lIU1EwQUN3dEJBQ0VHSUFFdEFFUWlCd1JBQTBBZ0FTZ0NaQ2dDQUNBQkx3RmdhaUFCTFFCY0lBWWdCMnRxUWY4QmNXb2lBaUFDTFFBQUlBRW9Ba3dvQWdBZ0FTOEJTR29nQm1vdEFBQnpPZ0FBSUFaQkFXb2lCaUFCTFFCRUlnZEpEUUFMQ3lBQklBRXRBSXdCSUFFdEFGeHFRUUZySWdJNkFHZ2dBU2dDY0NnQ0FDQUJMd0ZzYWtFQUlBSkIvd0Z4RUJzYUlBRXRBSXdCSVFjQ1FDQUJMUUJjSWdWRkRRQkJBQ0VNUVFFaEFpQUhSUVJBUVFBaEJ3d0JDd05BUVFBaEJpQUNRZjhCY1FSL0EwQkJBQ0VIQWtBZ0FTZ0NsQUVvQWdBZ0FTOEJrQUZxSUFacUxRQUFJZ1ZGRFFBZ0FTOEJZQ0FCS0FKa0tBSUFJQXhxYWkwQUFDSUNSUTBBSUFKQjhDaHFMUUFBSUFWQjhDaHFMUUFBYWtId0ttb3RBQUFoQndzZ0FTZ0NjQ2dDQUNBQkx3RnNhaUFHSUF4cVFmOEJjV29pQWlBQ0xRQUFJQWR6T2dBQUlBWkJBV29pQmlBQkxRQ01BU0lIU1EwQUN5QUJMUUJjSVFVZ0J3VkJBQXNoQWlBTVFRRnFJZ3dnQlVrTkFBc0xJQUVnQnlBQkxRQm9JZ0lnQWlBSFNSc2lBam9BakFFZ0FTZ0NsQUVvQWdBZ0FTOEJrQUZxSUFFb0FuQW9BZ0FnQVM4QmJHb2dBa0gvQVhFUUdob2dBU0FDT2dDTUFTQUtRUUZxSWdvZ0JDMEFBRWtOQUFzTElBRkIzQUJxSWdRZ0FTMEFkRG9BQUNBQkxRQjBJZ1ZCR0hSQmdJQ0FDR3RCR0hVaUFrRUFUZ1JBUVFBaENRTkFJQUVvQW1Rb0FnQWdBUzhCWUdvZ0NXb2dBU2dDZkNnQ0FDQUJMd0Y0YWlBQ1FmOEJjV290QUFBNkFBQWdBa0VCYXlFQ0lBbEJBV29pQ1NBRlJ3MEFDd3NnQVMwQWpBRkJBV3RCL3dGeElRWkJBQ0VISUFGQk9Hb2lBaUFFTFFBQUlBQXRBSXdCYWtFQmF5SUJPZ0FBSUFCQlFHc29BZ0FvQWdBZ0FDOEJQR3BCQUNBQlFmOEJjUkFiR2dKQUlBQXRBSXdCSWdwRkRRQWdCQzBBQUVVTkFFRUJJUVVEUUNBRlFmOEJjU0VCUVFBaEJTQUJCRUFEUUNBQUtBSkFLQUlBSUFBdkFUeHFJQVVnQjJwQi93RnhhaUlNQW45QkFDQUVLQUlJS0FJQUlBUXZBUVJxSUFWcUxRQUFJZ3BGRFFBYVFRQWdBQzhCa0FFZ0FDZ0NsQUVvQWdBZ0IycHFMUUFBSWdGRkRRQWFJQUZCOENocUxRQUFJQXBCOENocUxRQUFha0h3S21vdEFBQUxJQXd0QUFCek9nQUFJQVZCQVdvaUJTQUVMUUFBSWdGSkRRQUxJQUF0QUl3QklRb2dBU0VGQ3lBSFFRRnFJZ2NnQ2trTkFBc0xJQUFnQmtFQ2Fqb0FSQ0FBS0FKTUtBSUFJQUF2QVVocVFRQWdBQzBBUmhBYkdpQUFLQUpNS0FJQUlBQXZBVWhxUVFFNkFBQWdBaWdDQ0NnQ0FDQUNMd0VFYWlJRUlBQW9BbkFvQWdBZ0FDOEJiR29pQVVjRVFDQUJJQVFnQWkwQUFCQWFHZ3NnQUNBQ0xRQUFJZ1E2QUdoQkFDRU1JQUl0QUFBaUFTQUFMUUJFSWdWclFRRnFJZ1pCQUVvRVFBTkFBa0FnQUNnQ2NDZ0NBQ0FBTHdGc2FpQU1haTBBQUNJS1JRMEFRUUVoQmlBRlFRSkpEUUFEUUNBQUtBSk1LQUlBSUFBdkFVaHFJQVpxTFFBQUlnUUVRQ0FBS0FKd0tBSUFJQUF2QVd4cUlBWWdER3BCL3dGeGFpSUJJQUV0QUFBZ0NrSHdLR290QUFBZ0JFSHdLR290QUFCcVFmQXFhaTBBQUhNNkFBQWdBQzBBUkNFRkN5QUdRUUZxSWdZZ0JVa05BQXNnQWkwQUFDRUJDeUFNUVFGcUlnd2dBU0FGYTBFQmFpSUdTQTBBQ3lBQUxRQm9JUVFMSUFBb0FuQW9BZ0FnQUM4QmJHb2lBU0FCSUFacUlBUWdCbXNRT2lBQUlBQXRBR2dnQm1zNkFHZ2dBQ0FBTFFCb0lnRTZBTWdCSUFGQkdIUkJnSUNBQ0d0QkdIVWlBa0VBVGdSQVFRQWhDUU5BSUFBb0F0QUJLQUlBSUFBdkFjd0JhaUFKYWlBQUtBSndLQUlBSUFBdkFXeHFJQUpCL3dGeGFpMEFBRG9BQUNBQ1FRRnJJUUlnQ1VFQmFpSUpJQUZIRFFBTEMwRUFJUWtnQUVFQU9nQTRBa0FnQUMwQXZBRkZEUUJCQUNFQ0EwQWdBQ2dDeEFFb0FnQWdBQzhCd0FGcUlBSnFMUUFBSVFRZ0FDZ0NRQ2dDQUNFQklBQWdDVUVCYWpvQU9DQUJJQUF2QVR4cUlBbEIvd0Z4YWlBRVFYOXpRUUFnQkJ0Qi93RnhJZ0ZCL3dGelFRQWdBV3NnQVJ0QjhDcHFMUUFBT2dBQUlBSkJBV29pQWlBQUxRQzhBVThOQVNBQUxRQTRJUWtNQUFzQUMwRUFJUVFnQUNnQ1dDZ0NBQ0FBTHdGVWFrRUFJQUF0QUZJUUd4b2dBQ0FJTFFBQUlnSTZBRkFnQUMwQU9DSVBCRUFEUUNBQUtBSkFLQUlBSUFBdkFUeHFJQVJxTFFBQUlRRkJBQ0VDSUFCQkFEb0FSQ0FCUWZBb2FpMEFBRUgvQVhOQjhDcHFMUUFBSVFkQkFTRUpBa0FnRDBVTkFBTkFJQUlnQkVjRVFBSi9JQUFvQWtBb0FnQWdBQzhCUEdvZ0Ftb3RBQUFpQVFSQUlBRkI4Q2hxTFFBQUlBZEI4Q2hxTFFBQWFrSHdLbW90QUFBTUFRdEJBQXNoQ2lBQUtBSk1LQUlBSVFVZ0FDQUFMUUJFSWdGQkFXbzZBRVFnQVNBRklBQXZBVWhxYWlBS1FRRnpPZ0FBSUFBdEFEZ2hEd3NnQWtFQmFpSUNJQTlKRFFBTElBQXRBRVFpREVVTkFDQUFLQUpNS0FJQUlBQXZBVWhxSVFwQkFDRUNBMEFDZjBFQUlBbEIvd0Z4SWdWRkRRQWFRUUFnQWlBS2FpMEFBQ0lCUlEwQUdpQUJRZkFvYWkwQUFDQUZRZkFvYWkwQUFHcEI4Q3BxTFFBQUN5RUpJQUpCQVdvaUFpQU1SdzBBQ3dzZ0FDZ0NjQ2dDQUNBQUx3RnNhaUlHTFFBQUlRc0NRQ0FBTFFCb0lnVkJBa2tOQUVFQklRSWdCVUVCYXlJQlFRRnhJUXdnQlVFQ1J3UkFJQUZCZm5FaENrRUFJUTREUUVFQUlROGdBa0VCYWlFRklBdEIvd0Z4SWdFRWZ5QUhRZkFvYWkwQUFDQUJRZkFvYWkwQUFHcEI4Q3BxTFFBQUJVRUFDeUFDSUFacUxRQUFjeUlCQkg4Z0IwSHdLR290QUFBZ0FVSHdLR290QUFCcVFmQXFhaTBBQUFWQkFBc2hBU0FDUVFKcUlRSWdCU0FHYWkwQUFDQUJjeUVMSUE1QkFtb2lEaUFLUncwQUN3c2dERVVOQUNBTFFmOEJjU0lCQkg4Z0IwSHdLR290QUFBZ0FVSHdLR290QUFCcVFmQXFhaTBBQUFWQkFBc2dBaUFHYWkwQUFITWhDd3NnQUNnQ3JBRW9BZ0FnQUM4QnFBRnFJQVJxTFFBQUlBQW9BbGdvQWdBZ0FDOEJWR3BxSUF0Qi93RnhJZ0VFZnlBQUtBSkFLQUlBSUFBdkFUeHFJQVJxTFFBQVFmQW9haTBBQUVId0ttb3RBQUJCOENocUxRQUFJQUZCOENocUxRQUFha0h3S21vdEFBQkI4Q2hxTFFBQUlBbEIvd0Z4UWZBb2FpMEFBR3RCL3dGcVFmLy9BM0ZCL3dGd1FmQXFhaTBBQUFWQkFBczZBQUFnQkVFQmFpSUVJQUF0QURnaUQwa05BQXNnQUMwQVVDRUNDeUFBSUFndEFBQWlBU0FDSUFFZ0FrSC9BWEZMR3lJQk9nQWdRUUFoQWlBQUtBSW9LQUlBSUFBdkFTUnFRUUFnQVVIL0FYRVFHeG9nQ0MwQUFDSUpCRUFEUUNBQUtBSW9LQUlBSUFBdkFTUnFJQUF0QUNBZ0FpQUphMnBCL3dGeGFpQUlLQUlJS0FJQUlBZ3ZBUVJxSUFKcUxRQUFPZ0FBSUFKQkFXb2lBaUFJTFFBQUlnbEpEUUFMQ3lBQUxRQlFJZ2tFUUVFQUlRSURRQ0FBS0FJb0tBSUFJQUF2QVNScUlBQXRBQ0FnQWlBSmEycEIvd0Z4YWlJQklBRXRBQUFnQUNnQ1dDZ0NBQ0FBTHdGVWFpQUNhaTBBQUhNNkFBQWdBa0VCYWlJQ0lBQXRBRkFpQ1VrTkFBc0xDeUFBSUJFNkFDQWdBeUFBS0FJb0tBSUFJQUF2QVNScUlCRVFHaHBCQUNFQkN5QUJDNVVFQVFKL1FRRWdBQ3dBQnlJQklBRkJBVW9iUVFFZ0FDMEFDUnNpQVNBQUxBQVRJZ0lnQVNBQ1NCc2dBU0FBTFFBVkd5SUJJQUFzQUI4aUFpQUJJQUpJR3lBQklBQXRBQ0ViSWdFZ0FDd0FLeUlDSUFFZ0FrZ2JJQUVnQUMwQUxSc2lBU0FBTEFBM0lnSWdBU0FDU0JzZ0FTQUFMUUE1R3lJQklBQXNBRU1pQWlBQklBSklHeUFCSUFBdEFFVWJJZ0VnQUN3QVR5SUNJQUVnQWtnYklBRWdBQzBBVVJzaUFTQUFMQUJiSWdJZ0FTQUNTQnNnQVNBQUxRQmRHeUlCSUFBc0FHY2lBaUFCSUFKSUd5QUJJQUF0QUdrYklnRWdBQ3dBY3lJQ0lBRWdBa2diSUFFZ0FDMEFkUnNpQVNBQUxBQi9JZ0lnQVNBQ1NCc2dBU0FBTFFDQkFSc2lBU0FBTEFDTEFTSUNJQUVnQWtnYklBRWdBQzBBalFFYklnRWdBQ3dBbHdFaUFpQUJJQUpJR3lBQklBQXRBSmtCR3lJQklBQXNBS01CSWdJZ0FTQUNTQnNnQVNBQUxRQ2xBUnNpQVNBQUxBQ3ZBU0lDSUFFZ0FrZ2JJQUVnQUMwQXNRRWJJZ0VnQUN3QXV3RWlBaUFCSUFKSUd5QUJJQUF0QUwwQkd5SUJJQUFzQU1jQklnSWdBU0FDU0JzZ0FTQUFMUURKQVJzaUFTQUFMQURUQVNJQ0lBRWdBa2diSUFFZ0FDMEExUUViSWdFZ0FDd0Ezd0VpQWlBQklBSklHeUFCSUFBdEFPRUJHeUlCSUFBc0FPc0JJZ0lnQVNBQ1NCc2dBU0FBTFFEdEFSc2lBU0FBTEFEM0FTSUNJQUVnQWtnYklBRWdBQzBBK1FFYklnRWdBQ3dBZ3dJaUFpQUJJQUpJR3lBQklBQXRBSVVDR3d2R0JnSUlmd1o5QWtBZ0FpZ0NBQ0lJUVFKMElBQk9EUUFnQWtFQk5nSUVJQUlnQUVFQ2RTSUlOZ0lBSUFCQkRFZ05BQ0FEUW9DQWdQd0ROd0lBUVFJaEJDQURJQWhCQVhZaUJrRUNkR29pQlNBR3NrUVlMVVJVK3lIcFB5QUd0Nk8ySWd5VUVDc2lEVGdDQkNBRklBMDRBZ0FnQ0VFR1NRMEFBMEFnQXlBRVFRSjBJZ1ZxSUF3Z0JMS1VJZzBRS3lJT09BSUFJQU1nQlVFRWNtb2dEUkF5SWcwNEFnQWdBeUFJSUFSclFRSjBhaUlGSUE0NEFnUWdCU0FOT0FJQUlBUkJBbW9pQkNBR1NRMEFDeUFJSUFKQkNHb2dBeEJYQ3dKQUlBSW9BZ1FpQmtFQ2RDQUFUZzBBSUFJZ0FFRUNkU0lHTmdJRUlBQkJDRWdOQUVFQklRUWdBeUFJUVFKMGFpSUZJQVpCQVhZaUI3SkVHQzFFVlBzaDZUOGdCN2VqdGlJTWxCQXJJZzA0QWdBZ0JTQUhRUUowYWlBTlF3QUFBRCtVT0FJQUlBWkJCRWtOQUNBSFFRSWdCMEVDU3h0QkFXc2lCMEVCY1NFS0lBQkJHRThFUUNBSFFYNXhJUXRCQUNFSEEwQWdCU0FFUVFKMGFpQU1JQVN5bENJTkVDdERBQUFBUDVRNEFnQWdCU0FHSUFSclFRSjBhaUFORURKREFBQUFQNVE0QWdBZ0JTQUVRUUZxSWdsQkFuUnFJQXdnQ2JLVUlnMFFLME1BQUFBL2xEZ0NBQ0FGSUFZZ0NXdEJBblJxSUEwUU1rTUFBQUEvbERnQ0FDQUVRUUpxSVFRZ0IwRUNhaUlISUF0SERRQUxDeUFLUlEwQUlBVWdCRUVDZEdvZ0RDQUVzcFFpREJBclF3QUFBRCtVT0FJQUlBVWdCaUFFYTBFQ2RHb2dEQkF5UXdBQUFEK1VPQUlBQ3dKQUlBQkJCVTRFUUNBQUlBSkJDR29nQVJCWElBQWdBU0FERUZZZ0JrRUJkQ0FBUVFGMklnVnRJUWNnQUVFRlJnMEJRUUloQkNBRElBaEJBblJxSVFoQkFDRUNBMEFnQVNBRVFRSjBJZ2xxSWdNZ0F5b0NBQ0lNUXdBQUFEOGdDQ0FHSUFJZ0Iyb2lBbXRCQW5ScUtnSUFreUlOSUF3Z0FTQUFJQVJyUVFKMGFpSURLZ0lBa3lJTWxDQUJJQWxCQkhKcUlna3FBZ0FpRGlBREtnSUVraUlQSUFnZ0FrRUNkR29xQWdBaUVKU1RJaEdUT0FJQUlBa2dEaUFOSUErVUlCQWdESlNTSWd5VE9BSUFJQU1nQXlvQ0FDQVJramdDQUNBRElBTXFBZ1FnREpNNEFnUWdCRUVDYWlJRUlBVkpEUUFMREFFTElBQkJCRWNOQUVFRUlBRWdBeEJXQ3lBQklBRXFBZ0FpRENBQktnSUVJZzJUT0FJRUlBRWdEQ0FOa2pnQ0FBdVVDQUVDZjBHa0pVR2xDVUVFUVFBUURrR2tKVUdpRUVFQUVBQkJwQ1ZCMHhWQkFSQUFRYVFsUWVzVlFRSVFBRUdrSlVHMUZrRURFQUJCcENWQnpoWkJCQkFBUWFRbFFjc1hRUVVRQUVIQUpVSHRERUVFUVFBUURrSEFKVUhkRDBFQUVBQkJ3Q1ZCd0E1QkFSQUFRY0FsUWVVTlFRSVFBRUhBSlVIOEQwRURFQUJCd0NWQjNRNUJCQkFBUWNBbFFZVU9RUVVRQUVIQUpVSEREMEVHRUFCQndDVkJxQTVCQnhBQVFjQWxRY29OUVFnUUFFSEFKVUg5RjBFTUVBQkJ3Q1ZCNUJkQkRSQUFRY0FsUWJJWFFRNFFBRUhBSlVHWkYwRVBFQUJCd0NWQmdCZEJFQkFBUWNBbFFlY1dRUkVRQUVIQUpVR2NGa0VTRUFCQndDVkJneFpCRXhBQVFjQWxRYm9WUVJRUUFFSEFKVUdoRlVFVkVBQkJzUTFCbU5FQVJBQUFBQUFBQUFCQUVBVkIrQXhCbU5FQVJBQUFBQUFBQUJCQUVBVkJrUTFCbU5FQVJBQUFBQUFBQUJoQUVBVkJtdzlCbU5FQVJBQUFBQUFBQUNCQUVBVkIvUTVCbU5FQVJBQUFBQUFBQURCQUVBVkIzQ1ZCeFFsQjVDVkJBVUhtSlVFQ0VCQkJCQkFkSWdCQkFEWUNBRUVFRUIwaUFVRUFOZ0lBUWR3bFFaY0xRWmpSQUVIcEpVRURJQUJCbU5FQVFlMGxRUVFnQVJBRFFRUVFIU0lBUVFRMkFnQkJCQkFkSWdGQkJEWUNBRUhjSlVIMUNVSGcwUUJCOGlWQkJTQUFRZURSQUVIMkpVRUdJQUVRQTBFRUVCMGlBRUVJTmdJQVFRUVFIU0lCUVFnMkFnQkIzQ1ZCclFoQjRORUFRZklsUVFVZ0FFSGcwUUJCOWlWQkJpQUJFQU5CQkJBZElnQkJERFlDQUVFRUVCMGlBVUVNTmdJQVFkd2xRWkFNUWVEUkFFSHlKVUVGSUFCQjRORUFRZllsUVFZZ0FSQURRUVFRSFNJQVFSQTJBZ0JCQkJBZElnRkJFRFlDQUVIY0pVR2JERUdZMFFCQjZTVkJBeUFBUVpqUkFFSHRKVUVFSUFFUUEwRUVFQjBpQUVFVU5nSUFRUVFRSFNJQlFSUTJBZ0JCM0NWQjB3eEI0TkVBUWZJbFFRVWdBRUhnMFFCQjlpVkJCaUFCRUFOQkJCQWRJZ0JCR0RZQ0FFRUVFQjBpQVVFWU5nSUFRZHdsUWVVSlFhUWxRZWtsUVFjZ0FFR2tKVUh0SlVFSUlBRVFBMEVFRUIwaUFFRWNOZ0lBUVFRUUhTSUJRUncyQWdCQjNDVkJuUWhCcENWQjZTVkJCeUFBUWFRbFFlMGxRUWdnQVJBRFFRUVFIU0lBUVNBMkFnQkJCQkFkSWdGQklEWUNBRUhjSlVIRkRFR1kwUUJCNlNWQkF5QUFRWmpSQUVIdEpVRUVJQUVRQTBIY0pSQVBRYnNKUVFGQi9DVkJnQ1pCQ1VFS0VBSkJtZ2xCQWtHRUprSHBKVUVMUVF3UUFrR3lERUVDUVl3bVFaUW1RUTFCRGhBQ1FiY01RUVZCd0NaQitDZEJEMEVRRUFKQnZneEJBMEdBS0VHTUtFRVJRUklRQWtHbEMwRUJRWlFvUWVZbFFSTkJGQkFDUWJBTFFRRkJsQ2hCNWlWQkUwRVZFQUpCMHdwQkEwR1lLRUh0SlVFV1FSY1FBa0hDQ2tFRFFaZ29RZTBsUVJaQkdCQUNRY0RaQUVHZ3l3QW9BZ0EyQWdBUVRrR2M2UUJCck9nQU5nSUFRZFRvQUVFcU5nSUFDMUlCQVg4Z0FDZ0NCQ0VFSUFBb0FnQWlBQ0FCQW45QkFDQUNSUTBBR2lBRVFRaDFJZ0VnQkVFQmNVVU5BQm9nQVNBQ0tBSUFhaWdDQUFzZ0Ftb2dBMEVDSUFSQkFuRWJJQUFvQWdBb0Fod1JCUUFMQ2dBZ0FDQUJRUUFRSUF1WkFnQWdBRVVFUUVFQUR3c0Nmd0pBSUFBRWZ5QUJRZjhBVFEwQkFrQkJuT2tBS0FJQUtBSUFSUVJBSUFGQmdIOXhRWUMvQTBZTkF3d0JDeUFCUWY4UFRRUkFJQUFnQVVFL2NVR0FBWEk2QUFFZ0FDQUJRUVoyUWNBQmNqb0FBRUVDREFRTElBRkJnRUJ4UVlEQUEwY2dBVUdBc0FOUGNVVUVRQ0FBSUFGQlAzRkJnQUZ5T2dBQ0lBQWdBVUVNZGtIZ0FYSTZBQUFnQUNBQlFRWjJRVDl4UVlBQmNqb0FBVUVEREFRTElBRkJnSUFFYTBILy96OU5CRUFnQUNBQlFUOXhRWUFCY2pvQUF5QUFJQUZCRW5aQjhBRnlPZ0FBSUFBZ0FVRUdka0UvY1VHQUFYSTZBQUlnQUNBQlFReDJRVDl4UVlBQmNqb0FBVUVFREFRTEMwR0k2QUJCR1RZQ0FFRi9CVUVCQ3d3QkN5QUFJQUU2QUFCQkFRc0xEQUFnQUNBQklBSkJBQkJHQzd3Q0FBSkFBa0FDUUFKQUFrQUNRQUpBQWtBQ1FBSkFBa0FnQVVFSmF3NFNBQWdKQ2dnSkFRSURCQW9KQ2dvSUNRVUdCd3NnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBQ0FCS0FJQU5nSUFEd3NnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBQ0FCTWdFQU53TUFEd3NnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBQ0FCTXdFQU53TUFEd3NnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBQ0FCTUFBQU53TUFEd3NnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBQ0FCTVFBQU53TUFEd3NnQWlBQ0tBSUFRUWRxUVhoeElnRkJDR28yQWdBZ0FDQUJLd01BT1FNQUR3c2dBQ0FDUVFBUkNBQUxEd3NnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBQ0FCTkFJQU53TUFEd3NnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBQ0FCTlFJQU53TUFEd3NnQWlBQ0tBSUFRUWRxUVhoeElnRkJDR28yQWdBZ0FDQUJLUU1BTndNQUMzSUJBMzhnQUNnQ0FDd0FBRUV3YTBFS1R3UkFRUUFQQ3dOQUlBQW9BZ0FoQTBGL0lRRWdBa0hNbWJQbUFFMEVRRUYvSUFNc0FBQkJNR3NpQVNBQ1FRcHNJZ0pxSUFGQi8vLy8vd2NnQW10S0d5RUJDeUFBSUFOQkFXbzJBZ0FnQVNFQ0lBTXNBQUZCTUd0QkNra05BQXNnQWd1akZBSVJmd0YrSXdCQjBBQnJJZ1lrQUNBR0lBRTJBa3dnQmtFM2FpRVZJQVpCT0dvaEUwRUFJUUVDUUFKQUFrQUNRQU5BSUFGQi8vLy8vd2NnRFd0S0RRRWdBU0FOYWlFTklBWW9Ba3dpQ2lFQkFrQUNRQUpBSUFvdEFBQWlDUVJBQTBBQ1FBSkFJQWxCL3dGeElnZEZCRUFnQVNFSkRBRUxJQWRCSlVjTkFTQUJJUWtEUUNBQkxRQUJRU1ZIRFFFZ0JpQUJRUUpxSWdjMkFrd2dDVUVCYWlFSklBRXRBQUloQ3lBSElRRWdDMEVsUmcwQUN3c2dDU0FLYXlJQlFmLy8vLzhISUExckloWktEUWNnQUFSQUlBQWdDaUFCRUI0TElBRU5Ca0YvSVJKQkFTRUhBa0FnQmlnQ1RDSUJMQUFCUVRCclFRcFBEUUFnQVMwQUFrRWtSdzBBSUFFc0FBRkJNR3NoRWtFQklSUkJBeUVIQ3lBR0lBRWdCMm9pQVRZQ1RFRUFJUTRDUUNBQkxBQUFJZ3hCSUdzaUMwRWZTd1JBSUFFaEJ3d0JDeUFCSVFkQkFTQUxkQ0lJUVluUkJIRkZEUUFEUUNBR0lBRkJBV29pQnpZQ1RDQUlJQTV5SVE0Z0FTd0FBU0lNUVNCcklndEJJRThOQVNBSElRRkJBU0FMZENJSVFZblJCSEVOQUFzTEFrQWdERUVxUmdSQUlBWUNmd0pBSUFjc0FBRkJNR3RCQ2s4TkFDQUdLQUpNSWdFdEFBSkJKRWNOQUNBQkxBQUJRUUowSUFScVFjQUJhMEVLTmdJQUlBRXNBQUZCQTNRZ0EycEJnQU5yS0FJQUlROUJBU0VVSUFGQkEyb01BUXNnRkEwR1FRQWhGRUVBSVE4Z0FBUkFJQUlnQWlnQ0FDSUJRUVJxTmdJQUlBRW9BZ0FoRHdzZ0JpZ0NURUVCYWdzaUFUWUNUQ0FQUVFCT0RRRkJBQ0FQYXlFUElBNUJnTUFBY2lFT0RBRUxJQVpCekFCcUVFUWlEMEVBU0EwSUlBWW9Ba3doQVF0QkFDRUhRWDhoQ0FKL1FRQWdBUzBBQUVFdVJ3MEFHaUFCTFFBQlFTcEdCRUFnQmdKL0FrQWdBU3dBQWtFd2EwRUtUdzBBSUFZb0Frd2lBUzBBQTBFa1J3MEFJQUVzQUFKQkFuUWdCR3BCd0FGclFRbzJBZ0FnQVN3QUFrRURkQ0FEYWtHQUEyc29BZ0FoQ0NBQlFRUnFEQUVMSUJRTkJpQUFCSDhnQWlBQ0tBSUFJZ0ZCQkdvMkFnQWdBU2dDQUFWQkFBc2hDQ0FHS0FKTVFRSnFDeUlCTmdKTUlBaEJmM05CSDNZTUFRc2dCaUFCUVFGcU5nSk1JQVpCekFCcUVFUWhDQ0FHS0FKTUlRRkJBUXNoRUFOQUlBY2hFVUVjSVFrZ0FTd0FBRUg3QUd0QlJra05DU0FHSUFGQkFXb2lERFlDVENBQkxBQUFJUWNnRENFQklBY2dFVUU2YkdwQjc4b0FhaTBBQUNJSFFRRnJRUWhKRFFBTEFrQUNRQ0FIUVJ0SEJFQWdCMFVOQ3lBU1FRQk9CRUFnQkNBU1FRSjBhaUFITmdJQUlBWWdBeUFTUVFOMGFpa0RBRGNEUUF3Q0N5QUFSUTBJSUFaQlFHc2dCeUFDRUVNZ0JpZ0NUQ0VNREFJTElCSkJBRTROQ2d0QkFDRUJJQUJGRFFjTElBNUIvLzk3Y1NJTElBNGdEa0dBd0FCeEd5RUhRUUFoRGtHQUNDRVNJQk1oQ1FKQUFrQUNRQUovQWtBQ1FBSkFBa0FDZndKQUFrQUNRQUpBQWtBQ1FBSkFJQXhCQVdzc0FBQWlBVUZmY1NBQklBRkJEM0ZCQTBZYklBRWdFUnNpQVVIWUFHc09JUVFVRkJRVUZCUVVGQTRVRHdZT0RnNFVCaFFVRkJRQ0JRTVVGQWtVQVJRVUJBQUxBa0FnQVVIQkFHc09CdzRVQ3hRT0RnNEFDeUFCUWRNQVJnMEpEQk1MSUFZcEEwQWhGMEdBQ0F3RkMwRUFJUUVDUUFKQUFrQUNRQUpBQWtBQ1FDQVJRZjhCY1E0SUFBRUNBd1FhQlFZYUN5QUdLQUpBSUEwMkFnQU1HUXNnQmlnQ1FDQU5OZ0lBREJnTElBWW9Ba0FnRGF3M0F3QU1Gd3NnQmlnQ1FDQU5Pd0VBREJZTElBWW9Ba0FnRFRvQUFBd1ZDeUFHS0FKQUlBMDJBZ0FNRkFzZ0JpZ0NRQ0FOckRjREFBd1RDeUFJUVFnZ0NFRUlTeHNoQ0NBSFFRaHlJUWRCK0FBaEFRc2dFeUVLSUFGQklIRWhFU0FHS1FOQUloZFFSUVJBQTBBZ0NrRUJheUlLSUJlblFROXhRWURQQUdvdEFBQWdFWEk2QUFBZ0YwSVBWaUVMSUJkQ0JJZ2hGeUFMRFFBTEN5QUdLUU5BVUEwRElBZEJDSEZGRFFNZ0FVRUVka0dBQ0dvaEVrRUNJUTRNQXdzZ0V5RUJJQVlwQTBBaUYxQkZCRUFEUUNBQlFRRnJJZ0VnRjZkQkIzRkJNSEk2QUFBZ0YwSUhWaUVLSUJkQ0E0Z2hGeUFLRFFBTEN5QUJJUW9nQjBFSWNVVU5BaUFJSUJNZ0Ntc2lBVUVCYWlBQklBaElHeUVJREFJTElBWXBBMEFpRjBJQVV3UkFJQVpDQUNBWGZTSVhOd05BUVFFaERrR0FDQXdCQ3lBSFFZQVFjUVJBUVFFaERrR0JDQXdCQzBHQ0NFR0FDQ0FIUVFGeElnNGJDeUVTSUJjZ0V4QXFJUW9MSUJCQkFDQUlRUUJJR3cwT0lBZEIvLzk3Y1NBSElCQWJJUWNDUUNBR0tRTkFJaGRDQUZJTkFDQUlEUUFnRXlJS0lRbEJBQ0VJREF3TElBZ2dGMUFnRXlBS2Eyb2lBU0FCSUFoSUd5RUlEQXNMQW45Qi8vLy8vd2NnQ0NBSVFRQklHeUlKSWd4QkFFY2hFUUpBQWtBQ1FDQUdLQUpBSWdGQm1CZ2dBUnNpQ2lJSEloQkJBM0ZGRFFBZ0RFVU5BQU5BSUJBdEFBQkZEUUlnREVFQmF5SU1RUUJISVJFZ0VFRUJhaUlRUVFOeFJRMEJJQXdOQUFzTElCRkZEUUVMQWtBZ0VDMEFBRVVOQUNBTVFRUkpEUUFEUUNBUUtBSUFJZ0ZCZjNNZ0FVR0Jnb1FJYTNGQmdJR0NoSGh4RFFFZ0VFRUVhaUVRSUF4QkJHc2lERUVEU3cwQUN3c2dERVVOQUFOQUlCQWdFQzBBQUVVTkFob2dFRUVCYWlFUUlBeEJBV3NpREEwQUN3dEJBQXNpQVNBSGF5QUpJQUViSWdFZ0Ntb2hDU0FJUVFCT0JFQWdDeUVISUFFaENBd0xDeUFMSVFjZ0FTRUlJQWt0QUFBTkRRd0tDeUFJQkVBZ0JpZ0NRQXdDQzBFQUlRRWdBRUVnSUE5QkFDQUhFQjhNQWdzZ0JrRUFOZ0lNSUFZZ0Jpa0RRRDRDQ0NBR0lBWkJDR29pQVRZQ1FFRi9JUWdnQVFzaENVRUFJUUVDUUFOQUlBa29BZ0FpQ2tVTkFRSkFJQVpCQkdvZ0NoQkJJZ3RCQUVnaUNnMEFJQXNnQ0NBQmEwc05BQ0FKUVFScUlRa2dDQ0FCSUF0cUlnRkxEUUVNQWdzTElBb05EUXRCUFNFSklBRkJBRWdOQ3lBQVFTQWdEeUFCSUFjUUh5QUJSUVJBUVFBaEFRd0JDMEVBSVFnZ0JpZ0NRQ0VKQTBBZ0NTZ0NBQ0lLUlEwQklBWkJCR29nQ2hCQklnb2dDR29pQ0NBQlN3MEJJQUFnQmtFRWFpQUtFQjRnQ1VFRWFpRUpJQUVnQ0VzTkFBc0xJQUJCSUNBUElBRWdCMEdBd0FCekVCOGdEeUFCSUFFZ0QwZ2JJUUVNQ0FzZ0VFRUFJQWhCQUVnYkRRaEJQU0VKSUFBZ0Jpc0RRQ0FQSUFnZ0J5QUJJQVVSRWdBaUFVRUFUZzBIREFrTElBWWdCaWtEUUR3QU4wRUJJUWdnRlNFS0lBc2hCd3dFQ3lBR0lBRkJBV29pQnpZQ1RDQUJMUUFCSVFrZ0J5RUJEQUFMQUFzZ0FBMEhJQlJGRFFKQkFTRUJBMEFnQkNBQlFRSjBhaWdDQUNJQUJFQWdBeUFCUVFOMGFpQUFJQUlRUTBFQklRMGdBVUVCYWlJQlFRcEhEUUVNQ1FzTFFRRWhEU0FCUVFwUERRY0RRQ0FFSUFGQkFuUnFLQUlBRFFFZ0FVRUJhaUlCUVFwSERRQUxEQWNMUVJ3aENRd0VDeUFKSUFwckloRWdDQ0FJSUJGSUd5SUxRZi8vLy84SElBNXJTZzBDUVQwaENTQUxJQTVxSWdnZ0R5QUlJQTlLR3lJQklCWktEUU1nQUVFZ0lBRWdDQ0FIRUI4Z0FDQVNJQTRRSGlBQVFUQWdBU0FJSUFkQmdJQUVjeEFmSUFCQk1DQUxJQkZCQUJBZklBQWdDaUFSRUI0Z0FFRWdJQUVnQ0NBSFFZREFBSE1RSHd3QkN3dEJBQ0VOREFNTFFUMGhDUXRCaU9nQUlBazJBZ0FMUVg4aERRc2dCa0hRQUdva0FDQU5DN0lDQVFOL0l3QkIwQUZySWdRa0FDQUVJQUkyQXN3QklBUkJvQUZxSWdKQkFFRW9FQnNhSUFRZ0JDZ0N6QUUyQXNnQkFrQkJBQ0FCSUFSQnlBRnFJQVJCMEFCcUlBSWdBeEJGUVFCSURRQWdBQ2dDVEVFQVRpRUZJQUFvQWdBaEFpQUFLQUpJUVFCTUJFQWdBQ0FDUVY5eE5nSUFDd0ovQWtBQ1FDQUFLQUl3UlFSQUlBQkIwQUEyQWpBZ0FFRUFOZ0ljSUFCQ0FEY0RFQ0FBS0FJc0lRWWdBQ0FFTmdJc0RBRUxJQUFvQWhBTkFRdEJmeUFBRUVnTkFSb0xJQUFnQVNBRVFjZ0JhaUFFUWRBQWFpQUVRYUFCYWlBREVFVUxJUUVnQmdSL0lBQkJBRUVBSUFBb0FpUVJBd0FhSUFCQkFEWUNNQ0FBSUFZMkFpd2dBRUVBTmdJY0lBQW9BaFFhSUFCQ0FEY0RFRUVBQlNBQkN4b2dBQ0FBS0FJQUlBSkJJSEZ5TmdJQUlBVkZEUUFMSUFSQjBBRnFKQUFMZmdJQmZ3RitJQUM5SWdOQ05JaW5RZjhQY1NJQ1FmOFBSd1I4SUFKRkJFQWdBU0FBUkFBQUFBQUFBQUFBWVFSL1FRQUZJQUJFQUFBQUFBQUE4RU9pSUFFUVJ5RUFJQUVvQWdCQlFHb0xOZ0lBSUFBUEN5QUJJQUpCL2dkck5nSUFJQU5DLy8vLy8vLy8vNGVBZjROQ2dJQ0FnSUNBZ1BBL2hMOEZJQUFMQzFrQkFYOGdBQ0FBS0FKSUlnRkJBV3NnQVhJMkFrZ2dBQ2dDQUNJQlFRaHhCRUFnQUNBQlFTQnlOZ0lBUVg4UEN5QUFRZ0EzQWdRZ0FDQUFLQUlzSWdFMkFod2dBQ0FCTmdJVUlBQWdBU0FBS0FJd2FqWUNFRUVBQ3dNQUFRc2xBUUYvSXdCQkVHc2lBeVFBSUFNZ0FqWUNEQ0FBSUFFZ0FrRWZFRVlnQTBFUWFpUUFDNVFEQWdOL0Ezd2pBRUVRYXlJREpBQUNRQ0FBdkNJRVFmLy8vLzhIY1NJQ1FkcWZwTzRFVFFSQUlBRWdBTHNpQmlBR1JJUEl5VzB3WCtRL29rUUFBQUFBQUFBNFE2QkVBQUFBQUFBQU9NT2dJZ1ZFQUFBQVVQc2grYitpb0NBRlJHTmlHbUcwRUZHK29xQWlCemtEQUNBSFJBQUFBR0Q3SWVtL1l5RUVBbjhnQlpsRUFBQUFBQUFBNEVGakJFQWdCYW9NQVF0QmdJQ0FnSGdMSVFJZ0JBUkFJQUVnQmlBRlJBQUFBQUFBQVBDL29DSUZSQUFBQUZEN0lmbS9vcUFnQlVSallocGh0QkJSdnFLZ09RTUFJQUpCQVdzaEFnd0NDeUFIUkFBQUFHRDdJZWsvWkVVTkFTQUJJQVlnQlVRQUFBQUFBQUR3UDZBaUJVUUFBQUJRK3lINXY2S2dJQVZFWTJJYVliUVFVYjZpb0RrREFDQUNRUUZxSVFJTUFRc2dBa0dBZ0lEOEIwOEVRQ0FCSUFBZ0FKTzdPUU1BUVFBaEFnd0JDeUFESUFJZ0FrRVhka0dXQVdzaUFrRVhkR3UrdXprRENDQURRUWhxSUFNZ0FrRUJRUUFRVFNFQ0lBTXJBd0FoQlNBRVFRQklCRUFnQVNBRm1qa0RBRUVBSUFKcklRSU1BUXNnQVNBRk9RTUFDeUFEUVJCcUpBQWdBZ3ZaQ2dNRWZBVi9BWDRqQUVFd2F5SUhKQUFDUUFKQUFrQWdBTDBpQzBJZ2lLY2lCa0gvLy8vL0IzRWlDRUg2MUwyQUJFMEVRQ0FHUWYvL1AzRkIrOE1rUmcwQklBaEIvTEtMZ0FSTkJFQWdDMElBV1FSQUlBRWdBRVFBQUVCVSt5SDV2NkFpQUVReFkySWFZYlRRdmFBaUFqa0RBQ0FCSUFBZ0FxRkVNV05pR21HMDBMMmdPUU1JUVFFaEJnd0ZDeUFCSUFCRUFBQkFWUHNoK1QrZ0lnQkVNV05pR21HMDBEMmdJZ0k1QXdBZ0FTQUFJQUtoUkRGallocGh0TkE5b0RrRENFRi9JUVlNQkFzZ0MwSUFXUVJBSUFFZ0FFUUFBRUJVK3lFSndLQWlBRVF4WTJJYVliVGd2YUFpQWprREFDQUJJQUFnQXFGRU1XTmlHbUcwNEwyZ09RTUlRUUloQmd3RUN5QUJJQUJFQUFCQVZQc2hDVUNnSWdCRU1XTmlHbUcwNEQyZ0lnSTVBd0FnQVNBQUlBS2hSREZqWWhwaHRPQTlvRGtEQ0VGK0lRWU1Bd3NnQ0VHN2pQR0FCRTBFUUNBSVFiejcxNEFFVFFSQUlBaEIvTExMZ0FSR0RRSWdDMElBV1FSQUlBRWdBRVFBQURCL2ZOa1N3S0FpQUVUS2xKT25rUTdwdmFBaUFqa0RBQ0FCSUFBZ0FxRkV5cFNUcDVFTzZiMmdPUU1JUVFNaEJnd0ZDeUFCSUFCRUFBQXdmM3paRWtDZ0lnQkV5cFNUcDVFTzZUMmdJZ0k1QXdBZ0FTQUFJQUtoUk1xVWs2ZVJEdWs5b0RrRENFRjlJUVlNQkFzZ0NFSDd3K1NBQkVZTkFTQUxRZ0JaQkVBZ0FTQUFSQUFBUUZUN0lSbkFvQ0lBUkRGallocGh0UEM5b0NJQ09RTUFJQUVnQUNBQ29VUXhZMklhWWJUd3ZhQTVBd2hCQkNFR0RBUUxJQUVnQUVRQUFFQlUreUVaUUtBaUFFUXhZMklhWWJUd1BhQWlBamtEQUNBQklBQWdBcUZFTVdOaUdtRzA4RDJnT1FNSVFYd2hCZ3dEQ3lBSVFmckQ1SWtFU3cwQkN5QUFJQUJFZzhqSmJUQmY1RCtpUkFBQUFBQUFBRGhEb0VRQUFBQUFBQUE0dzZBaUEwUUFBRUJVK3lINXY2S2dJZ0lnQTBReFkySWFZYlRRUGFJaUJLRWlCVVFZTFVSVSt5SHB2Mk1oQ1FKL0lBT1pSQUFBQUFBQUFPQkJZd1JBSUFPcURBRUxRWUNBZ0lCNEN5RUdBa0FnQ1FSQUlBWkJBV3NoQmlBRFJBQUFBQUFBQVBDL29DSURSREZqWWhwaHROQTlvaUVFSUFBZ0EwUUFBRUJVK3lINXY2S2dJUUlNQVFzZ0JVUVlMVVJVK3lIcFAyUkZEUUFnQmtFQmFpRUdJQU5FQUFBQUFBQUE4RCtnSWdORU1XTmlHbUcwMEQyaUlRUWdBQ0FEUkFBQVFGVDdJZm0vb3FBaEFnc2dBU0FDSUFTaElnQTVBd0FDUUNBSVFSUjJJZ2tnQUwxQ05JaW5RZjhQY1d0QkVVZ05BQ0FCSUFJZ0EwUUFBR0FhWWJUUVBhSWlBS0VpQlNBRFJITndBeTZLR2FNN29pQUNJQVdoSUFDaG9TSUVvU0lBT1FNQUlBa2dBTDFDTklpblFmOFBjV3RCTWtnRVFDQUZJUUlNQVFzZ0FTQUZJQU5FQUFBQUxvb1pvenVpSWdDaElnSWdBMFRCU1NBbG1vTjdPYUlnQlNBQ29TQUFvYUVpQktFaUFEa0RBQXNnQVNBQ0lBQ2hJQVNoT1FNSURBRUxJQWhCZ0lEQS93ZFBCRUFnQVNBQUlBQ2hJZ0E1QXdBZ0FTQUFPUU1JUVFBaEJnd0JDeUFMUXYvLy8vLy8vLzhIZzBLQWdJQ0FnSUNBc01FQWhMOGhBRUVBSVFaQkFTRUpBMEFnQjBFUWFpQUdRUU4wYWdKL0lBQ1pSQUFBQUFBQUFPQkJZd1JBSUFDcURBRUxRWUNBZ0lCNEM3Y2lBamtEQUNBQUlBS2hSQUFBQUFBQUFIQkJvaUVBUVFFaEJpQUpRUUZ4SVFwQkFDRUpJQW9OQUFzZ0J5QUFPUU1nQWtBZ0FFUUFBQUFBQUFBQUFHSUVRRUVDSVFZTUFRdEJBU0VKQTBBZ0NTSUdRUUZySVFrZ0IwRVFhaUFHUVFOMGFpc0RBRVFBQUFBQUFBQUFBR0VOQUFzTElBZEJFR29nQnlBSVFSUjJRWllJYXlBR1FRRnFRUUVRVFNFR0lBY3JBd0FoQUNBTFFnQlRCRUFnQVNBQW1qa0RBQ0FCSUFjckF3aWFPUU1JUVFBZ0Jtc2hCZ3dCQ3lBQklBQTVBd0FnQVNBSEt3TUlPUU1JQ3lBSFFUQnFKQUFnQmd1cEVRSURmQkIvSXdCQnNBUnJJZ2trQUNBQ0lBSkJBMnRCR0cwaUNFRUFJQWhCQUVvYkloRkJhR3hxSVF3Z0JFRUNkRUdBTldvb0FnQWlEU0FEUVFGcklndHFRUUJPQkVBZ0F5QU5haUVJSUJFZ0Myc2hBZ05BSUFsQndBSnFJQXBCQTNScUlBSkJBRWdFZkVRQUFBQUFBQUFBQUFVZ0FrRUNkRUdRTldvb0FnQzNDemtEQUNBQ1FRRnFJUUlnQ2tFQmFpSUtJQWhIRFFBTEN5QU1RUmhySVE4Z0RVRUFJQTFCQUVvYklRcEJBQ0VJQTBCRUFBQUFBQUFBQUFBaEJTQURRUUJLQkVBZ0NDQUxhaUVPUVFBaEFnTkFJQUFnQWtFRGRHb3JBd0FnQ1VIQUFtb2dEaUFDYTBFRGRHb3JBd0NpSUFXZ0lRVWdBa0VCYWlJQ0lBTkhEUUFMQ3lBSklBaEJBM1JxSUFVNUF3QWdDQ0FLUmlFQ0lBaEJBV29oQ0NBQ1JRMEFDMEV2SUF4cklSUkJNQ0FNYXlFU0lBeEJHV3NoRlNBTklRZ0NRQU5BSUFrZ0NFRURkR29yQXdBaEJVRUFJUUlnQ0NFS0lBaEJBRXdpRUVVRVFBTkFJQWxCNEFOcUlBSkJBblJxQW44Q2Z5QUZSQUFBQUFBQUFIQStvaUlHbVVRQUFBQUFBQURnUVdNRVFDQUdxZ3dCQzBHQWdJQ0FlQXUzSWdaRUFBQUFBQUFBY01HaUlBV2dJZ1daUkFBQUFBQUFBT0JCWXdSQUlBV3FEQUVMUVlDQWdJQjRDellDQUNBSklBcEJBV3NpQ2tFRGRHb3JBd0FnQnFBaEJTQUNRUUZxSWdJZ0NFY05BQXNMQW44Z0JTQVBFRE1pQlNBRlJBQUFBQUFBQU1BL29weEVBQUFBQUFBQUlNQ2lvQ0lGbVVRQUFBQUFBQURnUVdNRVFDQUZxZ3dCQzBHQWdJQ0FlQXNoRGlBRklBNjNvU0VGQWtBQ1FBSkFBbjhnRDBFQVRDSVdSUVJBSUFoQkFuUWdDV29pQWlBQ0tBTGNBeUlDSUFJZ0VuVWlBaUFTZEdzaUNqWUMzQU1nQWlBT2FpRU9JQW9nRkhVTUFRc2dEdzBCSUFoQkFuUWdDV29vQXR3RFFSZDFDeUlMUVFCTURRSU1BUXRCQWlFTElBVkVBQUFBQUFBQTREOW1EUUJCQUNFTERBRUxRUUFoQWtFQUlRb2dFRVVFUUFOQUlBbEI0QU5xSUFKQkFuUnFJaGNvQWdBaEVFSC8vLzhISVJNQ2Z3SkFJQW9OQUVHQWdJQUlJUk1nRUEwQVFRQU1BUXNnRnlBVElCQnJOZ0lBUVFFTElRb2dBa0VCYWlJQ0lBaEhEUUFMQ3dKQUlCWU5BRUgvLy84RElRSUNRQUpBSUJVT0FnRUFBZ3RCLy8vL0FTRUNDeUFJUVFKMElBbHFJaEFnRUNnQzNBTWdBbkUyQXR3REN5QU9RUUZxSVE0Z0MwRUNSdzBBUkFBQUFBQUFBUEEvSUFXaElRVkJBaUVMSUFwRkRRQWdCVVFBQUFBQUFBRHdQeUFQRURPaElRVUxJQVZFQUFBQUFBQUFBQUJoQkVCQkFDRUtJQWdoQWdKQUlBZ2dEVXdOQUFOQUlBbEI0QU5xSUFKQkFXc2lBa0VDZEdvb0FnQWdDbkloQ2lBQ0lBMUtEUUFMSUFwRkRRQWdEeUVNQTBBZ0RFRVlheUVNSUFsQjRBTnFJQWhCQVdzaUNFRUNkR29vQWdCRkRRQUxEQU1MUVFFaEFnTkFJQUlpQ2tFQmFpRUNJQWxCNEFOcUlBMGdDbXRCQW5ScUtBSUFSUTBBQ3lBSUlBcHFJUW9EUUNBSlFjQUNhaUFESUFocUlndEJBM1JxSUFoQkFXb2lDQ0FSYWtFQ2RFR1FOV29vQWdDM09RTUFRUUFoQWtRQUFBQUFBQUFBQUNFRklBTkJBRW9FUUFOQUlBQWdBa0VEZEdvckF3QWdDVUhBQW1vZ0N5QUNhMEVEZEdvckF3Q2lJQVdnSVFVZ0FrRUJhaUlDSUFOSERRQUxDeUFKSUFoQkEzUnFJQVU1QXdBZ0NDQUtTQTBBQ3lBS0lRZ01BUXNMQWtBZ0JVRVlJQXhyRURNaUJVUUFBQUFBQUFCd1FXWUVRQ0FKUWVBRGFpQUlRUUowYWdKL0FuOGdCVVFBQUFBQUFBQndQcUlpQnBsRUFBQUFBQUFBNEVGakJFQWdCcW9NQVF0QmdJQ0FnSGdMSWdLM1JBQUFBQUFBQUhEQm9pQUZvQ0lGbVVRQUFBQUFBQURnUVdNRVFDQUZxZ3dCQzBHQWdJQ0FlQXMyQWdBZ0NFRUJhaUVJREFFTEFuOGdCWmxFQUFBQUFBQUE0RUZqQkVBZ0Jhb01BUXRCZ0lDQWdIZ0xJUUlnRHlFTUN5QUpRZUFEYWlBSVFRSjBhaUFDTmdJQUMwUUFBQUFBQUFEd1B5QU1FRE1oQlFKQUlBaEJBRWdOQUNBSUlRTURRQ0FKSUFNaUFFRURkR29nQlNBSlFlQURhaUFEUVFKMGFpZ0NBTGVpT1FNQUlBTkJBV3NoQXlBRlJBQUFBQUFBQUhBK29pRUZJQUFOQUFzZ0NFRUFTQTBBSUFnaEFnTkFJQWdnQWlJQWF5RURSQUFBQUFBQUFBQUFJUVZCQUNFQ0EwQUNRQ0FDUVFOMFFlREtBR29yQXdBZ0NTQUFJQUpxUVFOMGFpc0RBS0lnQmFBaEJTQUNJQTFPRFFBZ0FpQURTU0VNSUFKQkFXb2hBaUFNRFFFTEN5QUpRYUFCYWlBRFFRTjBhaUFGT1FNQUlBQkJBV3NoQWlBQVFRQktEUUFMQ3dKQUFrQUNRQUpBQWtBZ0JBNEVBUUlDQUFRTFJBQUFBQUFBQUFBQUlRWUNRQ0FJUVFCTURRQWdDVUdnQVdvZ0NFRURkR29yQXdBaEJTQUlJUUlEUUNBSlFhQUJhaUlESUFKQkEzUnFJQVVnQXlBQ1FRRnJJZ0JCQTNScUlnTXJBd0FpQnlBSElBV2dJZ1dob0RrREFDQURJQVU1QXdBZ0FrRUJTeUVESUFBaEFpQUREUUFMSUFoQkFrZ05BQ0FKUWFBQmFpQUlRUU4wYWlzREFDRUZJQWdoQWdOQUlBbEJvQUZxSWdNZ0FrRURkR29nQlNBRElBSkJBV3NpQUVFRGRHb2lBeXNEQUNJR0lBWWdCYUFpQmFHZ09RTUFJQU1nQlRrREFDQUNRUUpMSVFNZ0FDRUNJQU1OQUF0RUFBQUFBQUFBQUFBaEJpQUlRUUZNRFFBRFFDQUdJQWxCb0FGcUlBaEJBM1JxS3dNQW9DRUdJQWhCQWtvaEFDQUlRUUZySVFnZ0FBMEFDd3NnQ1NzRG9BRWhCU0FMRFFJZ0FTQUZPUU1BSUFrckE2Z0JJUVVnQVNBR09RTVFJQUVnQlRrRENBd0RDMFFBQUFBQUFBQUFBQ0VGSUFoQkFFNEVRQU5BSUFnaUFFRUJheUVJSUFVZ0NVR2dBV29nQUVFRGRHb3JBd0NnSVFVZ0FBMEFDd3NnQVNBRm1pQUZJQXNiT1FNQURBSUxSQUFBQUFBQUFBQUFJUVVnQ0VFQVRnUkFJQWdoQXdOQUlBTWlBRUVCYXlFRElBVWdDVUdnQVdvZ0FFRURkR29yQXdDZ0lRVWdBQTBBQ3dzZ0FTQUZtaUFGSUFzYk9RTUFJQWtyQTZBQklBV2hJUVZCQVNFQ0lBaEJBRW9FUUFOQUlBVWdDVUdnQVdvZ0FrRURkR29yQXdDZ0lRVWdBaUFJUnlFQUlBSkJBV29oQWlBQURRQUxDeUFCSUFXYUlBVWdDeHM1QXdnTUFRc2dBU0FGbWprREFDQUpLd09vQVNFRklBRWdCcG81QXhBZ0FTQUZtamtEQ0FzZ0NVR3dCR29rQUNBT1FRZHhDOTREQUVIRTBBQkI2QXdRR1VIUTBBQkJ2UXBCQVVFQlFRQVFHRUhjMEFCQjRBbEJBVUdBZjBIL0FCQUVRZlRRQUVIWkNVRUJRWUIvUWY4QUVBUkI2TkFBUWRjSlFRRkJBRUgvQVJBRVFZRFJBRUdIQ1VFQ1FZQ0Fma0gvL3dFUUJFR00wUUJCL2doQkFrRUFRZi8vQXhBRVFaalJBRUdXQ1VFRVFZQ0FnSUI0UWYvLy8vOEhFQVJCcE5FQVFZMEpRUVJCQUVGL0VBUkJzTkVBUWNNTFFRUkJnSUNBZ0hoQi8vLy8vd2NRQkVHODBRQkJ1Z3RCQkVFQVFYOFFCRUhJMFFCQnN3bENnSUNBZ0lDQWdJQ0FmMEwvLy8vLy8vLy8vLzhBRUZoQjFORUFRYklKUWdCQ2Z4QllRZURSQUVHZkNVRUVFQTFCN05FQVFhc01RUWdRRFVIZ0owSGlDeEFNUWNndlFmWVRFQXhCb0RCQkJFSElDeEFJUWZ3d1FRSkI3Z3NRQ0VIWU1VRUVRZjBMRUFoQjZDWkI1QW9RRjBHNEprRUFRYkVURUFGQmtESkJBRUdYRkJBQlFiZ3lRUUZCenhNUUFVSGdNa0VDUWNFUUVBRkJpRE5CQTBIZ0VCQUJRYkF6UVFSQmlCRVFBVUhZTTBFRlFhVVJFQUZCZ0RSQkJFRzhGQkFCUWFnMFFRVkIyaFFRQVVHUU1rRUFRWXNTRUFGQnVESkJBVUhxRVJBQlFlQXlRUUpCelJJUUFVR0lNMEVEUWFzU0VBRkJzRE5CQkVHUUV4QUJRZGd6UVFWQjdoSVFBVUhRTkVFR1Fjc1JFQUZCK0RSQkIwR0JGUkFCQ3c4QUlBRWdBQ2dDQUdvZ0FqWUNBQXVWQkFFV2Z5QUFMQUNEQWlJQ0lBQXNBUGNCSWdNZ0FDd0E2d0VpQkNBQUxBRGZBU0lGSUFBc0FOTUJJZ1lnQUN3QXh3RWlCeUFBTEFDN0FTSUlJQUFzQUs4Qklna2dBQ3dBb3dFaUNpQUFMQUNYQVNJTElBQXNBSXNCSWd3Z0FDd0FmeUlOSUFBc0FITWlEaUFBTEFCbklnOGdBQ3dBV3lJUUlBQXNBRThpRVNBQUxBQkRJaElnQUN3QU55SVRJQUFzQUNzaUZDQUFMQUFmSWhVZ0FDd0FFeUlXSUFBc0FBY2lBVUVCSUFGQkFVb2JRUUVnQUMwQUNSc2lBU0FCSUJaSUd5QUJJQUF0QUJVYklnRWdBU0FWU0JzZ0FTQUFMUUFoR3lJQklBRWdGRWdiSUFFZ0FDMEFMUnNpQVNBQklCTklHeUFCSUFBdEFEa2JJZ0VnQVNBU1NCc2dBU0FBTFFCRkd5SUJJQUVnRVVnYklBRWdBQzBBVVJzaUFTQUJJQkJJR3lBQklBQXRBRjBiSWdFZ0FTQVBTQnNnQVNBQUxRQnBHeUlCSUFFZ0RrZ2JJQUVnQUMwQWRSc2lBU0FCSUExSUd5QUJJQUF0QUlFQkd5SUJJQUVnREVnYklBRWdBQzBBalFFYklnRWdBU0FMU0JzZ0FTQUFMUUNaQVJzaUFTQUJJQXBJR3lBQklBQXRBS1VCR3lJQklBRWdDVWdiSUFFZ0FDMEFzUUViSWdFZ0FTQUlTQnNnQVNBQUxRQzlBUnNpQVNBQklBZElHeUFCSUFBdEFNa0JHeUlCSUFFZ0JrZ2JJQUVnQUMwQTFRRWJJZ0VnQVNBRlNCc2dBU0FBTFFEaEFSc2lBU0FCSUFSSUd5QUJJQUF0QU8wQkd5SUJJQUVnQTBnYklBRWdBQzBBK1FFYklnRWdBU0FDU0JzZ0FTQUFMUUNGQWhzTDVCOENCMzhEZkNNQVFTQnJJZ2drQUFKL0FrQWdBQzBBUkVVRVFFR01BU0VIREFFTFFRUWhCU0FBS0FKSUlnZEJCRWdFUUVFQ0lRVkJBUXdDQzBFQUlBZEJEMGtOQVJvTElBZEJCVzVCQVhRaEJVRUFDeUVESUFVZ0Iyb2hCUUpBUWVUZEFDMEFBRUVCY1EwQVFlVGRBQkFqUlEwQVFkemJBQkFtUVlnQ0VCb2FRZVRkQUJBaUMwSGMyd0FRUENBRmFrRUJheUVFQWtCQjJOc0FMUUFBUVFGeERRQkIyTnNBRUNORkRRQkIwTmtBRUNaQmlBSVFHaHBCMk5zQUVDSUxJQVJCME5rQUVEeHRJUWtDUUNBRlFZRUNUZ1JBUVFBaEJFSEEyUUFvQWdBaUFFVU5BU0FJUVlBQ05nSU1JQWdDZjBFQ0lBTU5BQnBCQkNBSFFROUpEUUFhSUFkQkJXNUJBWFFMTmdJSUlBZ2dCellDQkNBSUlBVTJBZ0FnQUVIY0l5QUlFQndNQVFzZ0FDZ0NQQ0FGYWlFRElBRUVRQ0FDS0FJQUlRUWdBQ0FETmdKWUlBQWdBU0FFYWpZQ1ZBc2dBaUFESUFJb0FnQnFRUWRxUVFodFFRTjBJZ00yQWdBZ0FDMEFUQVJBSUFJZ0FDZ0NEQ0lFUVFOMElBRUVmeUFBSUFSQkFYUTJBcGdCSUFBZ0FTQURhallDbEFFZ0FpZ0NBQVVnQXd0cVFRZHFRUWh0UVFOMElnTTJBZ0FDZnlBQUtBSU1RUUp0dDU5RUFBQUFBQUFBQ0VDZ0lncVpSQUFBQUFBQUFPQkJZd1JBSUFxcURBRUxRWUNBZ0lCNEN5RUVJQUlnQVFSL0lBQWdCRFlDb0FFZ0FDQUJJQU5xTmdLY0FTQUNLQUlBQlNBREN5QUVRUUowYWtFSGFrRUliVUVEZENJRE5nSUFJQUFvQWd4QkFtMGhCQ0FDSUFFRWZ5QUFJQVEyQXFnQklBQWdBU0FEYWpZQ3BBRWdBaWdDQUFVZ0F3c2dCRUVDZEdwQkIycEJDRzFCQTNRaUF6WUNBQ0FBS0FJTUlRUWdBaUFCQkg4Z0FDQUVOZ0swQVNBQUlBRWdBMm8yQXJBQklBSW9BZ0FGSUFNTElBUkJBblJxUVFkcVFRaHRRUU4wSWdNMkFnQWdBQ2dDRENJRVFZQUJhaUFFSUFBdEFFNGlCQnNoQmlBQ0lBRUVmeUFBSUFZMkFyd0JJQUFnQVNBRGFqWUN1QUVnQWlnQ0FBVWdBd3NnQmtFQ2RHcEJCMnBCQ0cxQkEzUWlBellDQUNBQUtBSU1JZ1pCQTNRZ0JpQUVHeUVHSUFJZ0FRUi9JQUFnQmpZQ3hBRWdBQ0FCSUFOcU5nTEFBU0FDS0FJQUJTQURDeUFHUVFKMGFrRUhha0VJYlVFRGRDSUdOZ0lBSUFBb0Fnd2hBd0pBSUFRRVFDQURRUU4wSVFRZ0FDZ0NGQ0VEREFFTElBQW9BaFFoQkFzZ0F5QUViQ0VESUFJZ0FRUi9JQUFnQXpZQ3pBRWdBQ0FCSUFacU5nTElBU0FDSUFNZ0FpZ0NBR3BCQjJwQkNHMUJBM1FpQXpZQ0FDQUFJQWRCQVdvMkF0Z0JJQUFnQVNBRGFqWUMxQUVnQWlnQ0FBVWdBeUFHYWtFSGFrRUliVUVEZEFzZ0IycEJDR3BCQ0cxQkEzUWlBellDQUFKQUlBQXRBRVFFUUNBQUtBSklJZ05Cd1FCT0JFQkJBQ0VFUWNEWkFDZ0NBQ0lBUlEwRUlBaEJ3QUEyQWhRZ0NDQUROZ0lRSUFCQmlSOGdDRUVRYWhBY0RBUUxBa0JCNU4wQUxRQUFRUUZ4RFFCQjVOMEFFQ05GRFFCQjNOc0FFQ1pCaUFJUUdocEI1TjBBRUNJTEFuOUI1ZHNBTFFBQUJIOUI0dHNBTEFBQVFlVGJBQ3dBQUd3aUEwRUFJQU5CQUVvYkJVRUFDeUVEUWZIYkFDMEFBQVJBUWU3YkFDd0FBRUh3MndBc0FBQnNJZ1FnQXlBRElBUklHeUVEQzBIOTJ3QXRBQUFFUUVINjJ3QXNBQUJCL05zQUxBQUFiQ0lFSUFNZ0F5QUVTQnNoQXd0Qmlkd0FMUUFBQkVCQmh0d0FMQUFBUVlqY0FDd0FBR3dpQkNBRElBTWdCRWdiSVFNTFFaWGNBQzBBQUFSQVFaTGNBQ3dBQUVHVTNBQXNBQUJzSWdRZ0F5QURJQVJJR3lFREMwR2gzQUF0QUFBRVFFR2UzQUFzQUFCQm9Od0FMQUFBYkNJRUlBTWdBeUFFU0JzaEF3dEJyZHdBTFFBQUJFQkJxdHdBTEFBQVFhemNBQ3dBQUd3aUJDQURJQU1nQkVnYklRTUxRYm5jQUMwQUFBUkFRYmJjQUN3QUFFRzQzQUFzQUFCc0lnUWdBeUFESUFSSUd5RURDMEhGM0FBdEFBQUVRRUhDM0FBc0FBQkJ4TndBTEFBQWJDSUVJQU1nQXlBRVNCc2hBd3RCMGR3QUxRQUFCRUJCenR3QUxBQUFRZERjQUN3QUFHd2lCQ0FESUFNZ0JFZ2JJUU1MUWQzY0FDMEFBQVJBUWRyY0FDd0FBRUhjM0FBc0FBQnNJZ1FnQXlBRElBUklHeUVEQzBIcDNBQXRBQUFFUUVIbTNBQXNBQUJCNk53QUxBQUFiQ0lFSUFNZ0F5QUVTQnNoQXd0Qjlkd0FMUUFBQkVCQjh0d0FMQUFBUWZUY0FDd0FBR3dpQkNBRElBTWdCRWdiSVFNTFFZSGRBQzBBQUFSQVFmN2NBQ3dBQUVHQTNRQXNBQUJzSWdRZ0F5QURJQVJJR3lFREMwR04zUUF0QUFBRVFFR0szUUFzQUFCQmpOMEFMQUFBYkNJRUlBTWdBeUFFU0JzaEF3dEJtZDBBTFFBQUJFQkJsdDBBTEFBQVFaamRBQ3dBQUd3aUJDQURJQU1nQkVnYklRTUxRYVhkQUMwQUFBUkFRYUxkQUN3QUFFR2szUUFzQUFCc0lnUWdBeUFESUFSSUd5RURDMEd4M1FBdEFBQUVRRUd1M1FBc0FBQkJzTjBBTEFBQWJDSUVJQU1nQXlBRVNCc2hBd3RCdmQwQUxRQUFCRUJCdXQwQUxBQUFRYnpkQUN3QUFHd2lCQ0FESUFNZ0JFZ2JJUU1MUWNuZEFDMEFBQVJBUWNiZEFDd0FBRUhJM1FBc0FBQnNJZ1FnQXlBRElBUklHeUVEQzBIVjNRQXRBQUFFUUVIUzNRQXNBQUJCMU4wQUxBQUFiQ0lFSUFNZ0F5QUVTQnNoQXdzZ0EwSGgzUUF0QUFCRkRRQWFRZDdkQUN3QUFFSGczUUFzQUFCc0lnUWdBeUFESUFSSUd3c2dDV3doQXlBQUtBSU1JUVFnQVFSQUlBSW9BZ0FoQmlBQUlBUTJBcUFFSUFBZ0F6WUNuQVFnQUNBQklBWnFOZ0tZQkFzZ0FpQUNLQUlBSUFNZ0JHeHFRUWRxUVFodFFRTjBJZ00yQWdBZ0JVRUJkQ0VGSUFJZ0FRUi9JQUFnQlRZQ3FBUWdBQ0FCSUFOcU5nS2tCQ0FDS0FJQUJTQURDeUFGYWtFSGFrRUliVUVEZERZQ0FBSkFRZVRkQUMwQUFFRUJjUTBBUWVUZEFCQWpSUTBBUWR6YkFCQW1RWWdDRUJvYVFlVGRBQkFpQzBIYzJ3QVFVRUVGZENFRElBRUVRQ0FDS0FJQUlRVWdBQ0FETmdLd0JDQUFJQUVnQldvMkFxd0VDeUFDS0FJQUlRVU1BUXNnQWlBQUtBSU1JZ1ZCRFhRZ0FRUi9JQUFnQlVFTGREWUNrQVFnQUNBQklBTnFOZ0tNQkNBQ0tBSUFCU0FEQzJwQkIycEJDRzFCQTNRaUF6WUNBQ0FBS0FJTUlRVWdBaUFCQkg4Z0FDQUZOZ0w4QXlBQUlBRWdBMm8yQXZnRElBSW9BZ0FGSUFNTElBVkJBblJxUVFkcVFRaHRRUU4wSWdVMkFnQWdBQ2dDRENFRElBRUVRQ0FBSUFNMkFvZ0VJQUJCQkRZQ2hBUWdBQ0FCSUFWcU5nS0FCQ0FDS0FJQUlRVUxJQU5CQkhRaEF3c2dBaUFEUVFkeUlBVnFRUWh0UVFOMElnTTJBZ0FMSUFBdEFFMEVRQUpBUWRqYkFDMEFBRUVCY1EwQVFkamJBQkFqUlEwQVFkRFpBQkFtUVlnQ0VCb2FRZGpiQUJBaUMwSFEyUUFRVUNJRFFRVjBJUVlnQUMwQVQwVUVRQ0FCQkVBZ0FpZ0NBQ0VGSUFBZ0JqWUMwQVFnQUNBQklBVnFOZ0xNQkFzZ0FpQUNLQUlBSUFOQkNIUnFRUWRxUVFodFFRTjBJZ1UyQWdBZ0FpQURRUWQwSWdRZ0FDZ0NEQ0lEYkNBQkJIOGdBQ0FETmdMb0JDQUFJQVkyQXVRRUlBQWdBU0FGYWpZQzRBUWdBaWdDQUFVZ0JRdHFRUWRxUVFodFFRTjBJZ00yQWdBZ0FDZ0NEQ0VGSUFJZ0FRUi9JQUFnQlRZQzNBUWdBQ0FHTmdMWUJDQUFJQUVnQTJvMkF0UUVJQUlvQWdBRklBTUxJQVFnQld4QkIzSnFRUWh0UVFOMElnTTJBZ0FnQUNnQ0RDRUZJQUlnQVFSL0lBQWdCVFlDakFjZ0FDQUJJQU5xTmdLSUJ5QUNLQUlBQlNBREN5QUZRUUowYWtFSGFrRUliVUVEZENJRE5nSUFJQUlnQUNnQ0RDSUZRUU4wSUFFRWZ5QUFJQVZCQVhRMkFwUUhJQUFnQVNBRGFqWUNrQWNnQWlnQ0FBVWdBd3RxUVFkcVFRaHRRUU4wSWdVMkFnQWdBQ2dDRENBQUtBSVliRUVMZENFREFrQWdBVVVFUUNBQ0lBTkJCM0lnQldwQkNHMUJBM1FpQlRZQ0FDQUFLQUlNSVFNTUFRc2dBQ0FETmdLY0J5QUFJQUVnQldvMkFwZ0hJQUlnQWlnQ0FDQURRUWR5YWtFSWJVRURkQ0lETmdJQUlBQWdBU0FEYWpZQ29BY2dBQ0FBS0FJTUlnTkJDM1EyQXFRSElBSW9BZ0FoQlFzZ0FpQUZJQU5CREhScVFRZHFRUWh0UVFOME5nSUFDd0pBSUFBdEFFUUVRRUVBSVFVQ1FFSFkyd0F0QUFCQkFYRU5BRUhZMndBUUkwVU5BRUhRMlFBUUprR0lBaEFhR2tIWTJ3QVFJZ3RCQVNFRUEwQWdCVUVNYkNJRFFkblpBR290QUFBRVFDQURRZGZaQUdvc0FBQkJBWFFnQTBIWTJRQnFMQUFBYlNJRElBUWdBeUFFU2hzaEJBc2dCVUVCYWlJRlFSWkhEUUFMREFFTElBQW9BalFoQkFzZ0FnSi9JQUZGQkVBZ0J5QUNLQUlBYWtFSWFrRUliVUVEZEF3QkN5QUNLQUlBSVFNZ0FDQUhRUUZxTmdMd0JDQUFJQUVnQTJvMkF1d0VJQUlnQnlBQ0tBSUFha0VJYWtFSWJVRURkQ0lETmdJQUlBQWdCallDeUFRZ0FDQUJJQU5xTmdMRUJDQUNLQUlBQ3lBR1FRZHlha0VJYlVFRGRDSUROZ0lBSUFRZ0NXd2dDVUVBSUFSQkFVb2JhaUVGSUFJZ0FRUi9JQUFnQlRZQ3NBY2dBQ0FCSUFOcU5nS3NCeUFDS0FJQUJTQURDeUFGYWtFSGFrRUliVUVEZENJRE5nSUFDd0pBQWtBZ0FDMEFSRVVFUUNBQUtBSThRUUZyUWY4QmNTSUZJQVZCSEd4cVFRUnFJUVVnQWlBQkJIOGdBQ0FGTmdKZ0lBQWdBU0FEYWpZQ1hDQUNLQUlBQlNBREN5QUZha0VIYWtFSWJVRURkQ0lETmdJQUlBQkI1QUJxSVFaQmpBRWhCd3dCQ3lBQVFlUUFhaUVHUVFRaEJTQUFLQUpJSWdkQkJFZ0VRRUVDSVFVTUFnc2dCMEVQU1EwQkN5QUhRUVZ1UVFGMFFmNEJjU0VGQzBFQklRUWdCMEgvQVhGQkEyd2dCVUVCY21vZ0JVRWNiR29oQlNBQ0lBRUVmeUFHSUFVMkFnUWdCaUFCSUFOcU5nSUFJQUlvQWdBRklBTUxJQVZxUVFkcVFRaHRRUU4wTmdJQUlBQXRBRTVGRFFBZ0FpZ0NBQ0VEQWtBZ0FVVUVRQ0FDSUFOQmg4QUFha0VJYlVFRGRFR0hCbXBCQ0cxQkEzUkJod0pxUVFodFFRTjBRWWVBQVdwQkNHMUJBM1EyQWdBTUFRc2dBRUdBRURZQ3ZBY2dBQ0FCSUFOcUlnTTJBcmdISUFJZ0FpZ0NBRUdId0FCcVFRaHRRUU4wSWdVMkFnQWdBRUhBQVRZQ3hBY2dBQ0FCSUFWcU5nTEFCeUFDSUFJb0FnQkJod1pxUVFodFFRTjBJZ1UyQWdBZ0FFSEFBRFlDekFjZ0FDQUJJQVZxSWdjMkFzZ0hJQUlnQWlnQ0FFR0hBbXBCQ0cxQkEzUWlCVFlDQUNBQVFZQWdOZ0xVQnlBQUlBRWdCV28yQXRBSElBSWdBaWdDQUVHSGdBRnFRUWh0UVFOME5nSUFJQU5CZ0lDQS9BTTJBZ0JCQVNFQkEwQWdBYmNpQ2tRWUxVUlUreUVKUUtKRUFBQUFBQUFBb0QraUlnc1FMU0VNSXdCQkVHc2lBaVFBQW53Z0NrUVlMVVJVK3lGWlA2SWlDcjFDSUlpblFmLy8vLzhIY1NJRlFmdkRwUDhEVFFSQVJBQUFBQUFBQVBBL0lBVkJuc0dhOGdOSkRRRWFJQXBFQUFBQUFBQUFBQUFRTHd3QkN5QUtJQXFoSUFWQmdJREEvd2RQRFFBYUFrQUNRQUpBQWtBZ0NpQUNFRXhCQTNFT0F3QUJBZ01MSUFJckF3QWdBaXNEQ0JBdkRBTUxJQUlyQXdBZ0Fpc0RDRUVCRUM2YURBSUxJQUlyQXdBZ0Fpc0RDQkF2bWd3QkN5QUNLd01BSUFJckF3aEJBUkF1Q3lFS0lBSkJFR29rQUNBRElBRkJBblJxSUFwRUFBQUFBQUFBNEQraVJBQUFBQUFBQU9BL29DQU1JQXVqdHJ1aXRqZ0NBQ0FCUVFGcUlnRkJnQkJIRFFBTElBQkNBRGNEMkFjZ0FFSUFOd1BvQnlBQVFnQTNBK0FISUFkQkFDQUFLQUxNQjBFQ2RCQWJHaUFBS0FMQUIwRUFJQUFvQXNRSFFRSjBFQnNhSUFBb0F0QUhRUUFnQUNnQzFBZEJBblFRR3hvTEN5QUlRU0JxSkFBZ0JBdWVCd0VIZnlBQUlBQW9BZ1FnQUMwQUFXcEJBV28yQWhBZ0FDZ0NIQ2dDQUNBQUx3RVlha0VBSUFBdEFCWVFHeG9nQUNnQ0tDZ0NBQ0FBTHdFa2FrRUFJQUF0QUNJUUd4b0NRQ0FBTFFBTkJFQWdBQ2dDTkNnQ0FDQUFMd0V3YWlBQUtBSUlJQUF0QUFGQkFXb2lBMEgvQVhFUUdob2dBQ0FET2dBc0RBRUxJQUFvQWpRb0FnQWdBQzhCTUdwQkFUb0FBQ0FBUVFJNkFEZ2dBRUVCT2dBc0lBQXRBQUVFUUFOQUlBQW9Ba0FvQWdBZ0FDOEJQR3BCQVRvQUFDQUFLQUpBS0FJQUlBQXZBVHhxSUFsQkdIUkJHSFVpQTBIL0FXb2dBeUFEUVFCSUcwSHdLbW90QUFBNkFBRWdBQ0FBTFFBc0lBQXRBRGhxUVFGcklnTTZBRVFnQUNnQ1RDZ0NBQ0FBTHdGSWFrRUFJQU5CL3dGeEVCc2FJQUF0QUN3aEF3SkFJQUF0QURnaUJVVU5BRUVBSVFSQkFTRUlJQU5GQkVCQkFDRUREQUVMQTBCQkFDRUdJQWhCL3dGeEJIOERRRUVBSVFNQ1FDQUFLQUkwS0FJQUlBQXZBVEJxSUFacUxRQUFJZ1ZGRFFBZ0FDOEJQQ0FBS0FKQUtBSUFJQVJxYWkwQUFDSUlSUTBBSUFoQjhDaHFMUUFBSUFWQjhDaHFMUUFBYWtId0ttb3RBQUFoQXdzZ0FDZ0NUQ2dDQUNBQUx3RklhaUFFSUFacVFmOEJjV29pQlNBRkxRQUFJQU56T2dBQUlBWkJBV29pQmlBQUxRQXNJZ05KRFFBTElBQXRBRGdoQlNBREJVRUFDeUVJSUFSQkFXb2lCQ0FGU1EwQUN3c2dBQ0FESUFBdEFFUWlCQ0FESUFSTEd5SURPZ0FzSUFBb0FqUW9BZ0FnQUM4Qk1Hb2dBQ2dDVENnQ0FDQUFMd0ZJYWlBRFFmOEJjUkFhR2lBQUlBTTZBQ3dnQUMwQUFTQUpRUUZxSWdsQkdIUkJHSFZLRFFBTEN5QUFLQUlJSUFBb0FqUW9BZ0FnQUM4Qk1Hb2dBQzBBTEJBYUdpQUFRUUU2QUEwTElBQW9BaHdvQWdBZ0FDOEJHR29nQVNBQUxRQUFJZ01RR2hvZ0FDQURPZ0FVSUFBb0FpZ29BZ0FnQUM4QkpHb2dBU0FBTFFBQUVCb2FJQUFnQUMwQUFTSUJJQUF0QUJScU9nQWdJQUF0QUFBaUF3UkFBMEFDUUNBQUtBSW9LQUlBSUFBdkFTUnFJQWRxTFFBQUlnUkZEUUJCQVNFQklBQXRBQ3hCQWtrTkFBTkFJQUFvQWlnb0FnQWdBQzhCSkdvZ0FTQUhha0gvQVhGcUlnTWdBQ2dDTkNnQ0FDQUFMd0V3YWlBQmFpMEFBQ0lHQkg4Z0JFSHdLR290QUFBZ0JrSHdLR290QUFCcVFmQXFhaTBBQUFWQkFBc2dBeTBBQUhNNkFBQWdBVUVCYWlJQklBQXRBQ3hKRFFBTElBQXRBQUFoQXdzZ0IwRUJhaUlISUFOSkRRQUxJQU1oQnlBQUxRQUJJUUVMSUFJZ0FDZ0NLQ2dDQUNBQUx3RWthaUFIUWY4QmNXb2dBVUgvQVhFUUdob0x6QVlCQTM4akFFSFFBR3NpQlNRQUFrQWdBVUVBU0FSQVFRQWhBa0hBMlFBb0FnQWlBRVVOQVNBRklBRTJBZ0FnQUVIV0lDQUZFQndNQVFzQ1FDQUFMUUJOQkVBQ1FDQUFMUUJFQkg4Z0FDZ0NTQVZCakFFTElnWWdBVTRFUUNBQklRWU1BUXRCd05rQUtBSUFJZ2RGRFFBZ0JTQUdOZ0pFSUFVZ0FUWUNRQ0FIUWNNWklBVkJRR3NRSEFzZ0JFSGxBRThFUUVFQUlRSkJ3TmtBS0FJQUlnQkZEUU1nQlNBRU5nSVFJQUJCcmlFZ0JVRVFhaEFjREFNTElBQkJBRG9BdEFRZ0FDZ0M3QVJCQUNBQUtBTHdCQkFiR2lBQUtBSlVRUUFnQUNnQ1dCQWJHaUFHUVFCTURRRWdBMEVXVHdSQVFRQWhBa0hBMlFBb0FnQWlBRVVOQXlBRklBTTJBakFnQUVIQ0lTQUZRVEJxRUJ3TUF3c2dBQ0FEUVF4c2FpSUJMUUNKQlVVRVFFRUFJUUpCd05rQUtBSUFJZ0JGRFFNZ0JTQUROZ0lnSUFCQml4c2dCVUVnYWhBY0RBTUxJQUF0QUVRaEF3Si9Ba0FnQVMwQWlBVkJBa1lFUUNBREJFQWdBQ0FCS1FLQUJUY0M5QVFnQUNBQktBS0lCVFlDL0FRTUFndEJBQ0VDUWNEWkFDZ0NBQ0lBUlEwRlFkMGJRVHNnQUJBb0RBVUxJQUFnQVNrQ2dBVTNBdlFFSUFBZ0FTZ0NpQVUyQXZ3RUlBWWdBMFVOQVJvTElBQW9Ba2dMSVFFZ0FDQUJOZ0s4QkNBQUlBUzNSQUFBQUFBQUFGbEFvN1k0QXJnRUlBQW9BdXdFSUFFNkFBQkJBQ0VCSUFBb0Fyd0VRUUJLQkVBRFFFRUFJUVFnQVVFQmFpSURJQUFvQXV3RWFpQUJJQVpJQkg4Z0FTQUNhaTBBQUFWQkFBczZBQUFnQUMwQVVBUkFJQUFvQXV3RUlBTnFJZ1FnQkMwQUFDQUJRVDl4UWJBb2FpMEFBSE02QUFBTElBTWlBU0FBS0FLOEJFZ05BQXNMSUFCQkFUb0F0QVFNQVFzZ0FVVU5BRUhBMlFBb0FnQWlBVVVOQUVHS0drSEFBQ0FCRUNnTElBQXRBRXhGQkVCQkFTRUNEQUVMSUFCQkFEc0JiQ0FBUWdBM0FvQUJJQUJDQURjQ2lBRWdBQ2dDc0FGQkFDQUFLQUswQVVFQ2RCQWJHaUFBS0FLNEFVRUFJQUFvQXJ3QlFRSjBFQnNhUVFFaEFnSkFJQUFvQW9RRUlnRkJBRXdOQUNBQUtBS0lCQ0lEUVFCTURRQWdBQ2dDZ0FSQkFDQUJJQU5zUVFKMEVCc2FDeUFBS0FMVUFVRUFJQUFvQXRnQkVCc2FJQUFvQXB3RUlnRkJBRXdOQUNBQUtBS2dCQ0lEUVFCTURRQWdBQ2dDbUFSQkFDQUJJQU5zRUJzYUN5QUZRZEFBYWlRQUlBSUw2MFVERG44SWZRUjhJd0JCTUdzaUVpUUFBa0FnQUVFQ2RFR3cyUUJxS0FJQUlnZEZCRUJCZnlFQlFjRFpBQ2dDQUNJQ1JRMEJJQklnQURZQ0FDQUNRZFljSUJJUUhBd0JDeUFISUFJZ0FTQURJQVFRVTBVRVFFRi9JUUZCd05rQUtBSUFJZ0pGRFFFZ0VpQUFOZ0lnSUFKQm1Sd2dFa0VnYWhBY0RBRUxBa0FDUUFKQUlBWU9BZ0lBQVFzZ0J5MEF0QVFFZnlBSEtBSU1JUUFnQnkwQVRnUi9JQWRCdUFkcUlBY3FBZ2dnQnlvQ0JKVWdBQ0FIS0FLSUIwRUFFREJCQVdvRklBQUxJQWNzQVBvRUlBY3NBUHdFSUFjc0FQc0VJZ0VnQnlnQ1BBSi9RUUlnQnlnQ3ZBUWlBRUVFU0EwQUdrRUVJQUJCRDBrTkFCb2dBRUVGYmtFQmRBc2dBR3BxYWtFQmF5QUJiV3hzSUFjb0FqaEJBWFJxYkFWQkFBc2dCeWdDR0d3aEFRd0NDeUFITFFDMEJFVUVRRUVBSVFFTUFnc2dCeWdDRENFQUlBY3RBRTRFZnlBSFFiZ0hhaUFIS2dJSUlBY3FBZ1NWSUFBZ0J5Z0NpQWRCQUJBd1FRRnFCU0FBQ3lBSExBRDZCQ0FITEFEOEJDQUhMQUQ3QkNJQklBY29BandDZjBFQ0lBY29BcndFSWdCQkJFZ05BQnBCQkNBQVFROUpEUUFhSUFCQkJXNUJBWFFMSUFCcWFtcEJBV3NnQVcxc2JDQUhLQUk0UVFGMGFtd2hBUXdCQ3lNQVFlQUJheUlCSkFBQ1FDQUhMUUJOUlFSQVFRQWhBa0hBMlFBb0FnQWlBMFVOQVVHS0drSEFBQ0FERUNnTUFRc2dCeTBBVGdSQUlBZENBRGNENkFjZ0IwSUFOd1BnQnlBSFFnQTNBOWdISUFjb0FzZ0hRUUFnQnlnQ3pBZEJBblFRR3hvZ0J5Z0N3QWRCQUNBSEtBTEVCMEVDZEJBYkdpQUhLQUxRQjBFQUlBY29BdFFIUVFKMEVCc2FDd0ovUVFJZ0J5Z0N2QVFpQWtFRVNBMEFHa0VFSUFKQkQwa05BQm9nQWtFRmJrRUJkQXNoQ1NBSExBRDdCQ0lESUFjb0Fqd2lCaUFDSUFscWFtcEJBV3NnQTIwaEZDQUhMQUQ4QkNFSUlBY3NBUG9FSVF3Z0J5MEFSRVVFUUNBSEtBSmNJUUlnQVVFQU5nTGNBU0FCUVFBNkFOUUJJQUZCQURZQzBBRWdBVUVBT2dESUFTQUJRUUEyQXNRQklBRkJBRG9BdkFFZ0FVRUFOZ0s0QVNBQlFRQTZBTEFCSUFGQkFEWUNyQUVnQVVFQU9nQ2tBU0FCUVFBMkFxQUJJQUZCQURvQW1BRWdBVUVBTmdLVUFTQUJRUUE2QUl3QklBRkJBRFlDaUFFZ0FVRUFPZ0NBQVNBQlFRQTJBbndnQVVFQU9nQjBJQUZCQURZQ2NDQUJRUUE2QUdnZ0FVRUFOZ0prSUFGQkFEb0FYQ0FCUVFBMkFsZ2dBVUVBT2dCUUlBRkJBRFlDVENBQlFRQTZBRVFnQVVGQWEwRUFOZ0lBSUFGQkFEb0FPQ0FCUVFBMkFqUWdBVUVBT2dBc0lBRkJBRFlDS0NBQlFRQTZBQ0FnQVVFQU5nSWNJQUZCQURvQUZDQUJJQVpCQVdzaUF6b0FBU0FCUVFFNkFBQWdBVUVBT3dFTUlBSkZCRUJCQVNFS0lBTkIvd0Z4SWdJZ0FrRWNiR3BCQkdvUUp5RUNDeUFCUVFBN0FSZ2dBU0FHT2dBV0lBRWdCa0gvQVhFaUN6c0JKQ0FCSUFZNkFDSWdBU0FEUVFGMElnTTZBQzRnQVVFRE9nQTVJQUVnQXpvQU9pQUJJQXRCQVhRaUV6c0JNQ0FCSUJNZ0EwSCtBWEVpQkdvaUV6c0JQQ0FCSUFvNkFBd2dBU0FDTmdJRUlBRWdBallDQ0NBQlFRQTdBUlFnQVVHQUFqc0JJQ0FCUVlBRU93RXNJQUVnQVVFUWFpSUNOZ0ljSUFFZ0FqWUNLQ0FCSUFJMkFqUWdBU0FFSUJOcUlnbzdBVWdnQVNBRE9nQkdJQUVnQmpvQVVpQUJJQU02QUY0Z0FTQURPZ0JxSUFGQkNEb0FkU0FCSUFRZ0Ntb2lCanNCVkNBQklBWWdDMm9pQmpzQllDQUJJQVFnQm1vaUJqc0JiQ0FCSUFRZ0Jtb2lCanNCZUNBQlFZQUlPd0ZFSUFFZ0FqWUNRQ0FCUVFBNkFEZ2dBU0FDTmdKTUlBRkJnQW83QVZBZ0FTQUNOZ0pZSUFGQmdBdzdBVndnQVNBQ05nSmtJQUZCZ0E0N0FXZ2dBU0FDTmdKd0lBRWdBem9BZGlBQklBUWdCbW9pQmpzQmhBRWdBU0FET2dDQ0FTQUJJQU02QUk0QklBRWdBem9BbWdFZ0FVRU1PZ0NsQVNBQklBTTZBS1lCSUFFZ0JDQUdhaUlHT3dHUUFTQUJJQVFnQm1vaUJqc0JuQUVnQVNBRUlBWnFJZ1k3QWFnQklBRkJBRG9BZENBQklBSTJBbndnQVVHQUVqc0JnQUVnQVNBQ05nS0lBU0FCUVlBVU93R01BU0FCSUFJMkFwUUJJQUZCZ0JZN0FaZ0JJQUVnQWpZQ29BRWdBU0FFSUFacUlnWTdBYlFCSUFGQkRUb0FzUUVnQVNBQ05nS3NBU0FCUVFBNkFLUUJJQUVnQXpvQXNnRWdBU0FFSUFacUlnWTdBY0FCSUFGQkRqb0F2UUVnQVNBQ05nSzRBU0FCUVFBNkFMQUJJQUVnQXpvQXZnRWdBU0FFSUFacUlnWTdBY3dCSUFGQkR6b0F5UUVnQVNBQ05nTEVBU0FCUVFBNkFMd0JJQUVnQXpvQXlnRWdBU0FFSUFacU93SFlBU0FCUVJBNkFOVUJJQUVnQWpZQzBBRWdBVUVBT2dESUFTQUJJQU02QU5ZQklBRWdBallDM0FFZ0FVRUFPZ0RVQVNBQklBY29BdXdFSWdJZ0J5Z0NWQ0FDSUFFdEFBQVFHaUFCTFFBQWFoQlNBa0FnQVMwQURFVU5BQ0FCS0FJRUlnSkZEUUFnQWhBaEN5QUhMUUM4QkNFQ0N5QUhLQUprSVFSQkFDRUdJQUZCQURZQzNBRWdBVUVBT2dEVUFTQUJRUUEyQXRBQklBRkJBRG9BeUFFZ0FVRUFOZ0xFQVNBQlFRQTZBTHdCSUFGQkFEWUN1QUVnQVVFQU9nQ3dBU0FCUVFBMkFxd0JJQUZCQURvQXBBRWdBVUVBTmdLZ0FTQUJRUUE2QUpnQklBRkJBRFlDbEFFZ0FVRUFPZ0NNQVNBQlFRQTJBb2dCSUFGQkFEb0FnQUVnQVVFQU5nSjhJQUZCQURvQWRDQUJRUUEyQW5BZ0FVRUFPZ0JvSUFGQkFEWUNaQ0FCUVFBNkFGd2dBVUVBTmdKWUlBRkJBRG9BVUNBQlFRQTJBa3dnQVVFQU9nQkVJQUZCUUd0QkFEWUNBQ0FCUVFBNkFEZ2dBVUVBTmdJMElBRkJBRG9BTENBQlFRQTJBaWdnQVVFQU9nQWdJQUZCQURZQ0hDQUJRUUE2QUJRZ0FTQUpPZ0FCSUFFZ0Fqb0FBQ0FCUVFBN0FRd2dCRVVFUUVFQklRMGdDVUgrQVhFaUEwRWNiQ0FEYWlBQ1FmOEJjVUVEYkdwQkFXb1FKeUVFQ3lBSUlCUnNJQXhzSVJRZ0FVRUFPd0VZSUFFZ0FpQUphaUlMT2dBV0lBRWdDem9BSWlBQklBbEJBWFFpQXpvQUxpQUJRUU02QURrZ0FTQURPZ0E2SUFFZ0MwSC9BWEVpQ1RzQkpDQUJJQWxCQVhRaUFqc0JNQ0FCSUFJZ0EwSCtBWEVpQ21vaUNEc0JQQ0FCSUEwNkFBd2dBU0FFTmdJRUlBRWdCRFlDQ0NBQlFRQTdBUlFnQVVHQUFqc0JJQ0FCUVlBRU93RXNJQUVnQVVFUWFpSUNOZ0ljSUFFZ0FqWUNLQ0FCSUFJMkFqUWdBU0FJSUFwcUlnUTdBVWdnQVNBRE9nQkdJQUVnQ3pvQVVpQUJJQU02QUY0Z0FTQURPZ0JxSUFGQkNEb0FkU0FCSUFRZ0Ntb2lCRHNCVkNBQklBUWdDV29pQkRzQllDQUJJQVFnQ21vaUJEc0JiQ0FCSUFRZ0Ntb2lCRHNCZUNBQlFZQUlPd0ZFSUFFZ0FqWUNRQ0FCUVFBNkFEZ2dBU0FDTmdKTUlBRkJnQW83QVZBZ0FTQUNOZ0pZSUFGQmdBdzdBVndnQVNBQ05nSmtJQUZCZ0E0N0FXZ2dBU0FDTmdKd0lBRWdBem9BZGlBQklBUWdDbW9pQkRzQmhBRWdBU0FET2dDQ0FTQUJJQU02QUk0QklBRWdBem9BbWdFZ0FVRU1PZ0NsQVNBQklBTTZBS1lCSUFFZ0JDQUthaUlFT3dHUUFTQUJJQVFnQ21vaUJEc0JuQUVnQVNBRUlBcHFJZ1E3QWFnQklBRkJBRG9BZENBQklBSTJBbndnQVVHQUVqc0JnQUVnQVNBQ05nS0lBU0FCUVlBVU93R01BU0FCSUFJMkFwUUJJQUZCZ0JZN0FaZ0JJQUVnQWpZQ29BRWdBU0FFSUFwcUlnUTdBYlFCSUFGQkRUb0FzUUVnQVNBQ05nS3NBU0FCUVFBNkFLUUJJQUVnQXpvQXNnRWdBU0FFSUFwcUlnUTdBY0FCSUFGQkRqb0F2UUVnQVNBQ05nSzRBU0FCUVFBNkFMQUJJQUVnQXpvQXZnRWdBU0FFSUFwcUlnUTdBY3dCSUFGQkR6b0F5UUVnQVNBQ05nTEVBU0FCUVFBNkFMd0JJQUVnQXpvQXlnRWdBU0FFSUFwcU93SFlBU0FCUVJBNkFOVUJJQUVnQWpZQzBBRWdBVUVBT2dESUFTQUJJQU02QU5ZQklBRWdBallDM0FFZ0FVRUFPZ0RVQVNBQklBY29BdXdFUVFGcUlnSWdCeWdDVkNBSEtBSThhaUFDSUFFdEFBQVFHaUFCTFFBQWFoQlNJQWRCQURZQ3FBY0NRQ0FITFFDMEJFVU5BQU5BQWtBZ0J5Z0NPQ0lDSUFaS0JFQkJBQ0VDSUFjb0FqUkJBRXdOQVFOQUlBY2dCeWdDcUFjaUEwRUJhallDcUFjZ0F5QUhLQUtzQjJvZ0FrRUJjU0FDUVFGMGNqb0FBQ0FDUVFGcUlnSWdCeWdDTkVnTkFBc01BUXNnQWlBVWFpSURJQVpLQkVBZ0J5d0Erd1FoQkNBSExBRDZCQ0VESUFjb0FzUUVRUUFnQnlnQ3lBUVFHeG9nQmlBQ2F5QURiU0VDSUFjc0FQc0VJZ05CQUV3TkFTQUNJQVJzSVFRQ1FDQUhMQUQ4QkNJQ1FRRkdCRUFnQnlnQ3hBUWhDaUFIS0FKVUlRMUJBQ0VDQTBBZ0NpQUNRUVYwSWdrZ0RTQUNJQVJxYWlJTExRQUFRUTl4Y21wQkFUb0FBQ0FLSUFrZ0N5MEFBRUVFZG5KcVFRRTZBQkFnQWtFQmFpSUNJQU5IRFFBTERBRUxJQWNvQXNRRUlRb2dCeWdDVkNFTklBUWdBbTBpQ1NBQ2JDQUVSd1JBUVFBaEFpQURRUUZIQkVBZ0EwRitjU0VMUVFBaEJBTkFJQW9nQWtFRmRDQU5JQUlnQ1dwcUxRQUFRUVIyY21wQkFUb0FBQ0FLSUFKQkFYSWlDRUVGZENBTklBZ2dDV3BxTFFBQVFRUjJjbXBCQVRvQUFDQUNRUUpxSVFJZ0JFRUNhaUlFSUF0SERRQUxDeUFEUVFGeFJRMEJJQW9nQWtFRmRDQU5JQUlnQ1dwcUxRQUFRUVIyY21wQkFUb0FBQXdCQzBFQUlRSWdBMEVCUndSQUlBTkJmbkVoQzBFQUlRUURRQ0FLSUEwZ0FpQUphbW90QUFCQkQzRWdBa0VGZEhKcVFRRTZBQUFnQ2lBQ1FRRnlJZ2hCQlhRZ0RTQUlJQWxxYWkwQUFFRVBjWEpxUVFFNkFBQWdBa0VDYWlFQ0lBUkJBbW9pQkNBTFJ3MEFDd3NnQTBFQmNVVU5BQ0FLSUEwZ0FpQUphbW90QUFCQkQzRWdBa0VGZEhKcVFRRTZBQUFMUVFBaEFpQURRUUJNRFFFRFFDQUhLQUxFQkNBQ2FpMEFBQVJBSUFjZ0J5Z0NxQWNpQTBFQmFqWUNxQWNnQXlBSEtBS3NCMm9nQWpvQUFDQUhMUUQ3QkNFREN5QUNRUUZxSWdJZ0EwRVlkRUVZZFVFRmRFZ05BQXNNQVFzZ0JpQUNJQU5xVGcwQ1FRQWhBaUFIS0FJMFFRQk1EUUFEUUNBSElBY29BcWdISWdOQkFXbzJBcWdISUFNZ0J5Z0NyQWRxSUFKQkFYRWdBa0VCZEhKQkFYTTZBQUFnQWtFQmFpSUNJQWNvQWpSSURRQUxDeUFITEFEN0JFRUJkQ0FITEFEOEJHMUJBazRFUUNBSElBY29BcWdISWdKQkFXbzJBcWdISUFJZ0J5Z0NyQWRxUWY4Qk9nQUFDeUFHSUFjc0FQb0VhaUVHREFBTEFBc0NmeUFITFFCUFJRUkFBa0FnQnlnQzBBUWlBMEVBVEEwQUlBY3NBUHNFUVFOMHR5RWRJQWNvQXN3RUlRUkJBQ0VDSUFOQkFVY0VRQ0FEUVg1eElRWkJBQ0VLQTBBZ0JDQUNRUU4wYWlBQ3QwUVlMVVJVK3lFSlFLSWdIYU01QXdBZ0JDQUNRUUZ5SWcxQkEzUnFJQTIzUkJndFJGVDdJUWxBb2lBZG96a0RBQ0FDUVFKcUlRSWdDa0VDYWlJS0lBWkhEUUFMQ3lBRFFRRnhSUTBBSUFRZ0FrRURkR29nQXJkRUdDMUVWUHNoQ1VDaUlCMmpPUU1BQ3lBSEtBTElCQ0lOUVFCS0JFQWdCeWdDRENJRFFYNXhJUWtnQTBFQmNTRUxJQWN1QWZnRXNpRVZJQWNvQXN3RUlRaEJBQ0VFQTBBQ1FDQURRUUJNSWd3TkFFUUFBQUFBQUFEd1B5QUhLZ0lrSWhhN295SWZJQllnRlpRZ0J5b0NNQ0FFc3BTU3V5SWdvaUVlSUFnZ0JFRURkR29yQXdBaEhTQUhLQUxVQkNBSEtBTGNCQ0FFYkVFQ2RHb2hCa0VBSVFKQkFDRUtJQU5CQVVjRVFBTkFJQVlnQWtFQ2RHb2dBcmNnQnlvQ0VMdWlSQmd0UkZUN0lSbEFvaUFlb2lBZG9CQXR0amdDQUNBR0lBSkJBWElpRTBFQ2RHb2dFN2NnQnlvQ0VMdWlSQmd0UkZUN0lSbEFvaUFlb2lBZG9CQXR0amdDQUNBQ1FRSnFJUUlnQ2tFQ2FpSUtJQWxIRFFBTEN5QUxCRUFnQmlBQ1FRSjBhaUFDdHlBSEtnSVF1NkpFR0MxRVZQc2hHVUNpSUI2aUlCMmdFQzIyT0FJQUN5QU1EUUFnQnlnQzRBUWdCeWdDNkFRZ0JHeEJBblJxSVFZZ0J5Z0NMTEloRmtFQUlRSURRQ0FHSUFKQkFuUnFJQUszSUFjcUFoQzdva1FZTFVSVSt5RVpRS0lnSHlBZ0lBY3FBaVFnRnBTN29LS2lJQjJnRUMyMk9BSUFJQUpCQVdvaUFpQURSdzBBQ3dzZ0JFRUJhaUlFSUExSERRQUxDMEVBSVEwQ1FDQUhMUUMwQkVVTkFDQUhRYmdIYWlFVElBY3FBZ2dnQnlvQ0JKVWhIQU5BSUFjb0FvZ0hRUUFnQnlnQ2pBZEJBblFRR3hvQ1FBSkFBa0FDUUFKQUFrQWdCeWdDT0NJRUlCRktCRUFnQnlnQ05DSUtRUUJNRFFGQkFDRURBMEFDUUNBRFFRRnhSUVJBSUFjb0F0d0VJUUlnQnlnQzFBUWhDU0FIS0FJTUlnWWdCR3l5SWhkRG1wa1pQcFFoRlFKL0lCZERtcGxaUDVRaUZvdERBQUFBVDEwRVFDQVdxQXdCQzBHQWdJQ0FlQXNoQ0NBR1FRQk1JUXNDZnlBVmkwTUFBQUJQWFFSQUlCV29EQUVMUVlDQWdJQjRDeUVNSUFzTkFTQUdJQkZzSVE4Z0NTQUNJQU5zUVFKMGFpRUxRd0FBZ0Q4Z0ZaVWhHQ0FJc2lFYUlBeXlJUnNnQnlnQ2lBY2hDU0FIS2dLNEJDRVZRUUFoQWdOQUFrQWdHeUFDSUE5cXNpSVdYZ1JBSUFrZ0FrRUNkQ0lJYWlJTUlCVWdDQ0FMYWlvQ0FKUWdHQ0FXbEpRZ0RDb0NBSkk0QWdBTUFRc2dDeUFDUVFKMElnaHFLZ0lBSVJrZ0ZpQWFYZ1JBSUFnZ0NXb2lDQ0FWSUJtVUlCZ2dGeUFXazVTVUlBZ3FBZ0NTT0FJQURBRUxJQWdnQ1dvaUNDQVZJQm1VSUFncUFnQ1NPQUlBQ3lBQ1FRRnFJZ0lnQmtjTkFBc01BUXNnQnlnQzZBUWhBaUFIS0FMZ0JDRUpJQWNvQWd3aUJpQUViTElpRjBPYW1SaytsQ0VWQW44Z0YwT2FtVmsvbENJV2kwTUFBQUJQWFFSQUlCYW9EQUVMUVlDQWdJQjRDeUVJSUFaQkFFd2hDd0ovSUJXTFF3QUFBRTlkQkVBZ0ZhZ01BUXRCZ0lDQWdIZ0xJUXdnQ3cwQUlBWWdFV3doRHlBSklBSWdBMnhCQW5ScUlRdERBQUNBUHlBVmxTRVlJQWl5SVJvZ0RMSWhHeUFIS0FLSUJ5RUpJQWNxQXJnRUlSVkJBQ0VDQTBBQ1FDQWJJQUlnRDJxeUloWmVCRUFnQ1NBQ1FRSjBJZ2hxSWd3Z0ZTQUlJQXRxS2dJQWxDQVlJQmFVbENBTUtnSUFramdDQUF3QkN5QUxJQUpCQW5RaUNHb3FBZ0FoR1NBV0lCcGVCRUFnQ0NBSmFpSUlJQlVnR1pRZ0dDQVhJQmFUbEpRZ0NDb0NBSkk0QWdBTUFRc2dDQ0FKYWlJSUlCVWdHWlFnQ0NvQ0FKSTRBZ0FMSUFKQkFXb2lBaUFHUncwQUN3c2dBMEVCYWlJRElBcEhEUUFMREFFTElBUWdGR29pQWlBUlNnUkFJQWNzQVBzRUlRSWdCeXdBK2dRaEN5QUhLQUxFQkVFQUlBY29Bc2dFRUJzYUlCRWdCR3NpRENBTGJTRUlJQWNzQVBzRUlnTkJBRXdpRHcwQ0lBSWdDR3doQmdKQUlBY3NBUHdFSWdKQkFVWUVRQ0FIS0FMRUJDRUVJQWNvQWxRaENrRUFJUUlEUUNBRUlBSkJCWFFpQ1NBS0lBSWdCbXBxSWc0dEFBQkJEM0Z5YWtFQk9nQUFJQVFnQ1NBT0xRQUFRUVIyY21wQkFUb0FFQ0FDUVFGcUlnSWdBMGNOQUFzTUFRc2dCeWdDeEFRaEJDQUhLQUpVSVFvZ0JpQUNiU0lKSUFKc0lBWkhCRUJCQUNFQ0lBTkJBVWNFUUNBRFFYNXhJUTVCQUNFR0EwQWdCQ0FDUVFWMElBb2dBaUFKYW1vdEFBQkJCSFp5YWtFQk9nQUFJQVFnQWtFQmNpSVFRUVYwSUFvZ0NTQVFhbW90QUFCQkJIWnlha0VCT2dBQUlBSkJBbW9oQWlBR1FRSnFJZ1lnRGtjTkFBc0xJQU5CQVhGRkRRRWdCQ0FDUVFWMElBb2dBaUFKYW1vdEFBQkJCSFp5YWtFQk9nQUFEQUVMUVFBaEFpQURRUUZIQkVBZ0EwRitjU0VPUVFBaEJnTkFJQVFnQ2lBQ0lBbHFhaTBBQUVFUGNTQUNRUVYwY21wQkFUb0FBQ0FFSUFKQkFYSWlFRUVGZENBS0lBa2dFR3BxTFFBQVFROXhjbXBCQVRvQUFDQUNRUUpxSVFJZ0JrRUNhaUlHSUE1SERRQUxDeUFEUVFGeFJRMEFJQVFnQ2lBQ0lBbHFhaTBBQUVFUGNTQUNRUVYwY21wQkFUb0FBQXNnRHcwQ0lBd2dDQ0FMYkdzaENTQURRUVYwSWdKQkFTQUNRUUZLR3lFTUlBY29Bc1FFSVE5QkFDRURRUUFoQ2dOQUFrQWdBeUFQYWkwQUFFVU5BQ0FEUVFGMklRSWdDa0VCYWlFS0lBTkJBWEVFUUNBSEtBTG9CQ0VHSUFjb0F1QUVJUXNnQnlnQ0RDSUVJQWNzQVBvRWJMSWlGME9hbVJrK2xDRVZBbjhnRjBPYW1Way9sQ0lXaTBNQUFBQlBYUVJBSUJhb0RBRUxRWUNBZ0lCNEN5RUlJQVJCQUV3aERnSi9JQldMUXdBQUFFOWRCRUFnRmFnTUFRdEJnSUNBZ0hnTElSQWdEZzBCSUFRZ0NXd2hEaUFMSUFJZ0JteEJBblJxSVF0REFBQ0FQeUFWbFNFWUlBaXlJUm9nRUxJaEd5QUhLQUtJQnlFR0lBY3FBcmdFSVJWQkFDRUNBMEFDUUNBYklBSWdEbXF5SWhaZUJFQWdCaUFDUVFKMElnaHFJaEFnRlNBSUlBdHFLZ0lBbENBWUlCYVVsQ0FRS2dJQWtqZ0NBQXdCQ3lBTElBSkJBblFpQ0dvcUFnQWhHU0FXSUJwZUJFQWdCaUFJYWlJSUlCVWdHWlFnR0NBWElCYVRsSlFnQ0NvQ0FKSTRBZ0FNQVFzZ0JpQUlhaUlJSUJVZ0daUWdDQ29DQUpJNEFnQUxJQUpCQVdvaUFpQUVSdzBBQ3d3QkN5QUhLQUxjQkNFR0lBY29BdFFFSVFzZ0J5Z0NEQ0lFSUFjc0FQb0ViTElpRjBPYW1SaytsQ0VWQW44Z0YwT2FtVmsvbENJV2kwTUFBQUJQWFFSQUlCYW9EQUVMUVlDQWdJQjRDeUVJSUFSQkFFd2hEZ0ovSUJXTFF3QUFBRTlkQkVBZ0ZhZ01BUXRCZ0lDQWdIZ0xJUkFnRGcwQUlBUWdDV3doRGlBTElBSWdCbXhCQW5ScUlRdERBQUNBUHlBVmxTRVlJQWl5SVJvZ0VMSWhHeUFIS0FLSUJ5RUdJQWNxQXJnRUlSVkJBQ0VDQTBBQ1FDQWJJQUlnRG1xeUloWmVCRUFnQmlBQ1FRSjBJZ2hxSWhBZ0ZTQUlJQXRxS2dJQWxDQVlJQmFVbENBUUtnSUFramdDQUF3QkN5QUxJQUpCQW5RaUNHb3FBZ0FoR1NBV0lCcGVCRUFnQmlBSWFpSUlJQlVnR1pRZ0dDQVhJQmFUbEpRZ0NDb0NBSkk0QWdBTUFRc2dCaUFJYWlJSUlCVWdHWlFnQ0NvQ0FKSTRBZ0FMSUFKQkFXb2lBaUFFUncwQUN3c2dBMEVCYWlJRElBeEhEUUFMREFFTElCRWdBaUFFYWs0TkF5QUhLQUkwSWdwQkFFd05BQ0FSSUFKcklRdEJBQ0VEQTBBQ1FDQURRUUZ4UlFSQUlBY29BdWdFSVFJZ0J5Z0M0QVFoQ1NBSEtBSU1JZ1lnQkd5eUloZERtcGtaUHBRaEZRSi9JQmREbXBsWlA1UWlGb3REQUFBQVQxMEVRQ0FXcUF3QkMwR0FnSUNBZUFzaERDQUdRUUJNSVFnQ2Z5QVZpME1BQUFCUFhRUkFJQldvREFFTFFZQ0FnSUI0Q3lFUElBZ05BU0FHSUF0c0lRNGdDU0FDSUFOc1FRSjBhaUVJUXdBQWdEOGdGWlVoR0NBTXNpRWFJQSt5SVJzZ0J5Z0NpQWNoQ1NBSEtnSzRCQ0VWUVFBaEFnTkFBa0FnR3lBQ0lBNXFzaUlXWGdSQUlBa2dBa0VDZENJTWFpSVBJQlVnQ0NBTWFpb0NBSlFnR0NBV2xKUWdEeW9DQUpJNEFnQU1BUXNnQ0NBQ1FRSjBJZ3hxS2dJQUlSa2dGaUFhWGdSQUlBa2dER29pRENBVklCbVVJQmdnRnlBV2s1U1VJQXdxQWdDU09BSUFEQUVMSUFrZ0RHb2lEQ0FWSUJtVUlBd3FBZ0NTT0FJQUN5QUNRUUZxSWdJZ0JrY05BQXNNQVFzZ0J5Z0MzQVFoQWlBSEtBTFVCQ0VKSUFjb0Fnd2lCaUFFYkxJaUYwT2FtUmsrbENFVkFuOGdGME9hbVZrL2xDSVdpME1BQUFCUFhRUkFJQmFvREFFTFFZQ0FnSUI0Q3lFTUlBWkJBRXdoQ0FKL0lCV0xRd0FBQUU5ZEJFQWdGYWdNQVF0QmdJQ0FnSGdMSVE4Z0NBMEFJQVlnQzJ3aERpQUpJQUlnQTJ4QkFuUnFJUWhEQUFDQVB5QVZsU0VZSUF5eUlSb2dEN0loR3lBSEtBS0lCeUVKSUFjcUFyZ0VJUlZCQUNFQ0EwQUNRQ0FiSUFJZ0RtcXlJaFplQkVBZ0NTQUNRUUowSWd4cUlnOGdGU0FJSUF4cUtnSUFsQ0FZSUJhVWxDQVBLZ0lBa2pnQ0FBd0JDeUFJSUFKQkFuUWlER29xQWdBaEdTQVdJQnBlQkVBZ0NTQU1haUlNSUJVZ0daUWdHQ0FYSUJhVGxKUWdEQ29DQUpJNEFnQU1BUXNnQ1NBTWFpSU1JQlVnR1pRZ0RDb0NBSkk0QWdBTElBSkJBV29pQWlBR1J3MEFDd3NnQTBFQmFpSURJQXBIRFFBTEN5QUtRZi8vQTNFTkFRdEJBU0VLQ3dKQUlBY29BZ3dpQTBFQVRBMEFRd0FBZ0Q4Z0NrSC8vd054czVVaEZTQUhLQUtJQnlFS1FRQWhCRUVBSVFJZ0EwRUJhMEVEVHdSQUlBTkJmSEVoQzBFQUlRWURRQ0FLSUFKQkFuUWlDV29pQ0NBVklBZ3FBZ0NVT0FJQUlBb2dDVUVFY21vaUNDQVZJQWdxQWdDVU9BSUFJQW9nQ1VFSWNtb2lDQ0FWSUFncUFnQ1VPQUlBSUFvZ0NVRU1jbW9pQ1NBVklBa3FBZ0NVT0FJQUlBSkJCR29oQWlBR1FRUnFJZ1lnQzBjTkFBc0xJQU5CQTNFaUJrVU5BQU5BSUFvZ0FrRUNkR29pQ1NBVklBa3FBZ0NVT0FJQUlBSkJBV29oQWlBRVFRRnFJZ1FnQmtjTkFBc0xBa0FnQnkwQVRnUkFJQk1nSENBRElBY29Bb2dISUFjb0FwQUhFREFoQXd3QkN5QUhLQUtRQnlBSEtBS0lCeUFIS0FLVUJ5SUNJQWNvQW93SElnUWdBaUFFU0J0QkFuUVFHaG9MSUFOQkFFd2lCZzBDSUFOQkFYRWhDeUFIS0FLZ0J5RUtJQWNvQXBBSElRbEJBQ0VDSUFOQkFVWU5BU0FEUVg1eElRaEJBQ0VFQTBBZ0NpQUNJQTFxUVFGMGFnSi9JQWtnQWtFQ2RHb3FBZ0JEQUFBQVI1UWlGWXREQUFBQVQxMEVRQ0FWcUF3QkMwR0FnSUNBZUFzN0FRQWdDaUFDUVFGeUlnd2dEV3BCQVhScUFuOGdDU0FNUVFKMGFpb0NBRU1BQUFCSGxDSVZpME1BQUFCUFhRUkFJQldvREFFTFFZQ0FnSUI0Q3pzQkFDQUNRUUpxSVFJZ0JFRUNhaUlFSUFoSERRQUxEQUVMSUFkQkFEb0F0QVFNQXdzZ0MwVU5BQ0FLSUFJZ0RXcEJBWFJxQW44Z0NTQUNRUUowYWlvQ0FFTUFBQUJIbENJVmkwTUFBQUJQWFFSQUlCV29EQUVMUVlDQWdJQjRDenNCQUFzQ1FBSi9Ba0FDUUFKQUFrQUNRQUpBQWtBZ0J5Z0NJRUVCYXc0RkFBRUNDQU1JQ3lBR0RRY2dCeWdDbUFjaEJFRUFJUUlnQTBFQlJ3UkFJQU5CZm5FaEJrRUFJUW9EUUNBRUlBSWdEV3BxQW44Z0J5Z0NrQWNnQWtFQ2RHb3FBZ0JEQUFDQVA1SkRBQUFBUTVRaUZVTUFBSUJQWFNBVlF3QUFBQUJnY1FSQUlCV3BEQUVMUVFBTE9nQUFJQVFnQWtFQmNpSUpJQTFxYWdKL0lBY29BcEFISUFsQkFuUnFLZ0lBUXdBQWdEK1NRd0FBQUVPVUloVkRBQUNBVDEwZ0ZVTUFBQUFBWUhFRVFDQVZxUXdCQzBFQUN6b0FBQ0FDUVFKcUlRSWdDa0VDYWlJS0lBWkhEUUFMQ3lBRFFRRnhSUTBISUFRZ0FpQU5hbW9oQkNBSEtBS1FCeUFDUVFKMGFpb0NBRU1BQUlBL2trTUFBQUJEbENJVlF3QUFnRTlkSUJWREFBQUFBR0J4UlEwRElBUWdGYWs2QUFBTUJ3c2dCZzBHSUFjb0FwZ0hJUVJCQUNFQ0lBTkJBVWNFUUNBRFFYNXhJUVpCQUNFS0EwQWdCQ0FDSUExcWFnSi9JQWNvQXBBSElBSkJBblJxS2dJQVF3QUFBRU9VSWhWREFBQ0FUMTBnRlVNQUFBQUFZSEVFUUNBVnFRd0JDMEVBQ3pvQUFDQUVJQUpCQVhJaUNTQU5hbW9DZnlBSEtBS1FCeUFKUVFKMGFpb0NBRU1BQUFCRGxDSVZRd0FBZ0U5ZElCVkRBQUFBQUdCeEJFQWdGYWtNQVF0QkFBczZBQUFnQWtFQ2FpRUNJQXBCQW1vaUNpQUdSdzBBQ3dzZ0EwRUJjVVVOQmlBRUlBSWdEV3BxSVFRZ0J5Z0NrQWNnQWtFQ2RHb3FBZ0JEQUFBQVE1UWlGVU1BQUlCUFhTQVZRd0FBQUFCZ2NVVU5BeUFFSUJXcE9nQUFEQVlMSUFZTkJTQUhLQUtZQnlFR0lBY29BcEFISVFwQkFDRUNJQU5CQVVjRVFDQURRWDV4SVFsQkFDRUVBMEFnQmlBQ0lBMXFRUUYwYWdKL0lBb2dBa0VDZEdvcUFnQkRBQUNBUDVKREFBQUFSNVFpRlVNQUFJQlBYU0FWUXdBQUFBQmdjUVJBSUJXcERBRUxRUUFMT3dFQUlBWWdBa0VCY2lJTElBMXFRUUYwYWdKL0lBb2dDMEVDZEdvcUFnQkRBQUNBUDVKREFBQUFSNVFpRlVNQUFJQlBYU0FWUXdBQUFBQmdjUVJBSUJXcERBRUxRUUFMT3dFQUlBSkJBbW9oQWlBRVFRSnFJZ1FnQ1VjTkFBc0xJQU5CQVhGRkRRVWdCaUFDSUExcVFRRjBhaUVFSUFvZ0FrRUNkR29xQWdCREFBQ0FQNUpEQUFBQVI1UWlGVU1BQUlCUFhTQVZRd0FBQUFCZ2NVVU5BeUFWcVF3RUN5QUdEUVFnQnlnQ21BY2hDaUFIS0FLUUJ5RUpRUUFoQkVFQUlRSWdBMEVCYTBFRFR3UkFJQU5CZkhFaEMwRUFJUVlEUUNBS0lBSWdEV3BCQW5ScUlBa2dBa0VDZEdvcUFnQTRBZ0FnQ2lBQ1FRRnlJZ2dnRFdwQkFuUnFJQWtnQ0VFQ2RHb3FBZ0E0QWdBZ0NpQUNRUUp5SWdnZ0RXcEJBblJxSUFrZ0NFRUNkR29xQWdBNEFnQWdDaUFDUVFOeUlnZ2dEV3BCQW5ScUlBa2dDRUVDZEdvcUFnQTRBZ0FnQWtFRWFpRUNJQVpCQkdvaUJpQUxSdzBBQ3dzZ0EwRURjU0lHUlEwRUEwQWdDaUFDSUExcVFRSjBhaUFKSUFKQkFuUnFLZ0lBT0FJQUlBSkJBV29oQWlBRVFRRnFJZ1FnQmtjTkFBc01CQXNnQkVFQU9nQUFEQU1MSUFSQkFEb0FBQXdDQzBFQUN5RUNJQVFnQWpzQkFBc2dBeUFOYWlFTklCRkJBV29oRVNBSExRQzBCQTBBQ3dzZ0J5QU5OZ0xBQkNBSEtBSVlJQTFzREFFTElBZEJBRG9BdEFSQkFRc2hBaUFCTFFBTVJRMEFJQUVvQWdRaUEwVU5BQ0FERUNFTElBRkI0QUZxSkFBZ0FpSUJSUVJBUVg4aEFVSEEyUUFvQWdBaUFrVU5BU0FTSUFBMkFoQWdBa0h5SENBU1FSQnFFQndNQVF0QkFDRUFBa0FDZndKQUFrQWdCeWdDSUVFQmF3NEZBUUVCQUFFREN5QUhRYUFIYWd3QkN5QUhRWmdIYWdzb0FnQWhBQXNnQlNBQUlBRVFHaG9MSUJKQk1Hb2tBQ0FCQ3cwQUlBRWdBQ2dDQUdvb0FnQUw4UU1DQ1g4TWZVRUNJUU1DUUNBQVFRbElEUUFnQUNBQklBSVFjRUVJSVFNZ0FFRWhTUVJBREFFTFFTQWhCQU5BSUFBZ0F5QUJJQUlRYnlBRUlnTkJBblFpQkNBQVNBMEFDd3NDUUNBQUlBTkJBblJIQkVCQkFDRUFJQU5CQUV3TkFRTkFJQUVnQUVFQ2RDSUNRUVJ5YWlJRktnSUFJUXdnQVNBQUlBTnFRUUowSWdaQkJISnFJZ1FxQWdBaERTQUJJQUpxSWdJZ0Fpb0NBQ0lPSUFFZ0Jtb2lBaW9DQUNJUGtqZ0NBQ0FGSUF3Z0RaSTRBZ0FnQWlBT0lBK1RPQUlBSUFRZ0RDQU5remdDQUNBQVFRSnFJZ0FnQTBnTkFBc01BUXNnQTBFQVRBMEFRUUFoQUFOQUlBRWdBQ0FEYWlJRUlBTnFJZ0pCQW5RaUIwRUVjbW9pQ0NvQ0FDRVFJQUVnQWlBRGFrRUNkQ0lKUVFSeWFpSUtLZ0lBSVJFZ0FTQUFRUUowSWdKQkJISnFJZ3NxQWdBaEVpQUJJQVJCQW5RaUJFRUVjbW9pQlNvQ0FDRVRJQUVnQW1vaUFpQUNLZ0lBSWhRZ0FTQUVhaUlHS2dJQUloV1NJZ3dnQVNBSGFpSUVLZ0lBSWhZZ0FTQUphaUlDS2dJQUloZVNJZzJTT0FJQUlBc2dFaUFUa2lJT0lCQWdFWklpRDVJNEFnQWdCQ0FNSUEyVE9BSUFJQWdnRGlBUGt6Z0NBQ0FHSUJRZ0ZaTWlEQ0FRSUJHVElnMlRPQUlBSUFVZ0VpQVRreUlPSUJZZ0Y1TWlENUk0QWdBZ0FpQU1JQTJTT0FJQUlBb2dEaUFQa3pnQ0FDQUFRUUpxSWdBZ0EwZ05BQXNMQzg0SEF3cC9BWDRCZlNBQlFRQTJBZ0FDUUFKL0FrQWdBRUVKVGdSQVFRRWhDUU5BSUFCQkFYVWhBQUpBSUFraUEwRUFUQTBBUVFBaENVRUFJUVFnQTBFQmEwRURUd1JBSUFOQmZIRWhCa0VBSVFjRFFDQUJJQU1nQkdwQkFuUnFJQUVnQkVFQ2RHb29BZ0FnQUdvMkFnQWdBU0FFUVFGeUlnVWdBMnBCQW5ScUlBRWdCVUVDZEdvb0FnQWdBR28yQWdBZ0FTQUVRUUp5SWdVZ0EycEJBblJxSUFFZ0JVRUNkR29vQWdBZ0FHbzJBZ0FnQVNBRVFRTnlJZ1VnQTJwQkFuUnFJQUVnQlVFQ2RHb29BZ0FnQUdvMkFnQWdCRUVFYWlFRUlBZEJCR29pQnlBR1J3MEFDd3NnQTBFRGNTSUhSUTBBQTBBZ0FTQURJQVJxUVFKMGFpQUJJQVJCQW5ScUtBSUFJQUJxTmdJQUlBUkJBV29oQkNBSlFRRnFJZ2tnQjBjTkFBc0xJQU5CQVhRaENTQURRUVIwSWdjZ0FFZ05BQXNnQTBFQ2RDRUVJQUFnQjBZTkFVRUJJUU1nQ1VFQlRBMERBMEFnQTBFQmRDRUZJQUVnQTBFQ2RHb29BZ0FoQ0VFQUlRQURRQ0FDSUFnZ0FFRUJkR29pREVFQ2RHb2lCeWtDQUNFTklBSWdBU0FBUVFKMGFpZ0NBQ0FGYWlJS1FRSjBhaUlHS2dJRUlRNGdCeUFHS2dJQU9BSUFJQWNnRGpnQ0JDQUdJQTAzQWdBZ0FpQUVJQXhxUVFKMGFpSUhLUUlBSVEwZ0FpQUVJQXBxUVFKMGFpSUdLZ0lBSVE0Z0J5QUdLZ0lFT0FJRUlBY2dEamdDQUNBR0lBMDNBZ0FnQUVFQmFpSUFJQU5IRFFBTElBTkJBV29pQXlBSlJ3MEFDd3dEQ3lBQVFRaEhEUUpCQWlFRVFRRWhDVUVFREFFTElBbEJBRXdOQVNBRFFRTjBDeUVIUVFBaEF3TkFBa0FnQTBVRVFDQUJLQUlBSVFZTUFRc2dBMEVCZENFTUlBRWdBMEVDZEdvb0FnQWhCa0VBSVFBRFFDQUNJQVlnQUVFQmRHb2lDa0VDZEdvaUJTa0NBQ0VOSUFJZ0FTQUFRUUowYWlnQ0FDQU1haUlMUVFKMGFpSUlLZ0lFSVE0Z0JTQUlLZ0lBT0FJQUlBVWdEamdDQkNBSUlBMDNBZ0FnQWlBRUlBcHFJZ3BCQW5ScUlnVXBBZ0FoRFNBQ0lBY2dDMm9pQzBFQ2RHb2lDQ29DQUNFT0lBVWdDQ29DQkRnQ0JDQUZJQTQ0QWdBZ0NDQU5Od0lBSUFJZ0JDQUthaUlLUVFKMGFpSUZLUUlBSVEwZ0FpQUxJQVJySWd0QkFuUnFJZ2dxQWdBaERpQUZJQWdxQWdRNEFnUWdCU0FPT0FJQUlBZ2dEVGNDQUNBQ0lBUWdDbXBCQW5ScUlnVXBBZ0FoRFNBQ0lBY2dDMnBCQW5ScUlnZ3FBZ0FoRGlBRklBZ3FBZ1E0QWdRZ0JTQU9PQUlBSUFnZ0RUY0NBQ0FBUVFGcUlnQWdBMGNOQUFzTElBSWdCaUFESUFscVFRRjBhaUlHUVFKMGFpSUFLUUlBSVEwZ0FpQUVJQVpxUVFKMGFpSUdLZ0lFSVE0Z0FDQUdLZ0lBT0FJQUlBQWdEamdDQkNBR0lBMDNBZ0FnQTBFQmFpSURJQWxIRFFBTEN3c2NBQ0FBSUFGQkNDQUNweUFDUWlDSXB5QURweUFEUWlDSXB4QVNDNjBFQVFOL0lBQWdBU2dDQ0NBRUVDQUVRQUpBSUFFb0FnUWdBa2NOQUNBQktBSWNRUUZHRFFBZ0FTQUROZ0ljQ3c4TEFrQWdBQ0FCS0FJQUlBUVFJQVJBQWtBZ0FpQUJLQUlRUndSQUlBRW9BaFFnQWtjTkFRc2dBMEVCUncwQ0lBRkJBVFlDSUE4TElBRWdBellDSUNBQktBSXNRUVJIQkVBZ0FFRVFhaUlGSUFBb0FneEJBM1JxSVFkQkFDRURJQUVDZndKQUEwQUNRQ0FGSUFkUERRQWdBVUVBT3dFMElBVWdBU0FDSUFKQkFTQUVFRFVnQVMwQU5nMEFBa0FnQVMwQU5VVU5BQ0FCTFFBMEJFQkJBU0VESUFFb0FoaEJBVVlOQkVFQklRWWdBQzBBQ0VFQ2NRMEJEQVFMUVFFaEJpQUFMUUFJUVFGeFJRMERDeUFGUVFocUlRVU1BUXNMUVFRZ0JrVU5BUm9MUVFNTE5nSXNJQU5CQVhFTkFnc2dBU0FDTmdJVUlBRWdBU2dDS0VFQmFqWUNLQ0FCS0FJa1FRRkhEUUVnQVNnQ0dFRUNSdzBCSUFGQkFUb0FOZzhMSUFBb0Fnd2hCU0FBUVJCcUlnWWdBU0FDSUFNZ0JCQXhJQVZCQWtnTkFDQUdJQVZCQTNScUlRWWdBRUVZYWlFRkFrQWdBQ2dDQ0NJQVFRSnhSUVJBSUFFb0FpUkJBVWNOQVFzRFFDQUJMUUEyRFFJZ0JTQUJJQUlnQXlBRUVERWdCVUVJYWlJRklBWkpEUUFMREFFTElBQkJBWEZGQkVBRFFDQUJMUUEyRFFJZ0FTZ0NKRUVCUmcwQ0lBVWdBU0FDSUFNZ0JCQXhJQVZCQ0dvaUJTQUdTUTBBREFJTEFBc0RRQ0FCTFFBMkRRRWdBU2dDSkVFQlJnUkFJQUVvQWhoQkFVWU5BZ3NnQlNBQklBSWdBeUFFRURFZ0JVRUlhaUlGSUFaSkRRQUxDd3RzQVFKL0lBQWdBU2dDQ0VFQUVDQUVRQ0FCSUFJZ0F4QTNEd3NnQUNnQ0RDRUVJQUJCRUdvaUJTQUJJQUlnQXhBL0FrQWdCRUVDU0EwQUlBVWdCRUVEZEdvaEJDQUFRUmhxSVFBRFFDQUFJQUVnQWlBREVEOGdBUzBBTmcwQklBQkJDR29pQUNBRVNRMEFDd3NMTVFBZ0FDQUJLQUlJUVFBUUlBUkFJQUVnQWlBREVEY1BDeUFBS0FJSUlnQWdBU0FDSUFNZ0FDZ0NBQ2dDSEJFRkFBc1lBQ0FBSUFFb0FnaEJBQkFnQkVBZ0FTQUNJQU1RTndzTHVnTUJCWDhqQUVGQWFpSUVKQUFDZjBFQklBQWdBVUVBRUNBTkFCcEJBQ0FCUlEwQUdpTUFRVUJxSWdNa0FDQUJLQUlBSWdWQkJHc29BZ0FoQmlBRlFRaHJLQUlBSVFjZ0EwRUFOZ0lVSUFOQnRNOEFOZ0lRSUFNZ0FUWUNEQ0FEUWVUUEFEWUNDRUVBSVFVZ0EwRVlha0VBUVNjUUd4b2dBU0FIYWlFQkFrQWdCa0hrendCQkFCQWdCRUFnQTBFQk5nSTRJQVlnQTBFSWFpQUJJQUZCQVVFQUlBWW9BZ0FvQWhRUkJnQWdBVUVBSUFNb0FpQkJBVVliSVFVTUFRc2dCaUFEUVFocUlBRkJBVUVBSUFZb0FnQW9BaGdSQkFBQ1FBSkFJQU1vQWl3T0FnQUJBZ3NnQXlnQ0hFRUFJQU1vQWloQkFVWWJRUUFnQXlnQ0pFRUJSaHRCQUNBREtBSXdRUUZHR3lFRkRBRUxJQU1vQWlCQkFVY0VRQ0FES0FJd0RRRWdBeWdDSkVFQlJ3MEJJQU1vQWloQkFVY05BUXNnQXlnQ0dDRUZDeUFEUVVCckpBQkJBQ0FGSWdGRkRRQWFJQVJCQ0dvaUEwRUVja0VBUVRRUUd4b2dCRUVCTmdJNElBUkJmellDRkNBRUlBQTJBaEFnQkNBQk5nSUlJQUVnQXlBQ0tBSUFRUUVnQVNnQ0FDZ0NIQkVGQUNBRUtBSWdJZ0JCQVVZRVFDQUNJQVFvQWhnMkFnQUxJQUJCQVVZTElRQWdCRUZBYXlRQUlBQUxDUUFnQVNBQUVRSUFDd1FBSUFBTEJRQVFCd0FMVkFFQmZ5TUFRVEJySWdJa0FDQUNJQUVvQWlBMkFpZ2dBaUFCS1FJWU53TWdJQUlnQVNrQ0VEY0RHQ0FDSUFFcEFnZzNBeEFnQWlBQktRSUFOd01JSUFKQkNHb2dBQkVCQUNFQUlBSkJNR29rQUNBQUM2MFlBeEovQVh3Q2ZpTUFRYkFFYXlJTEpBQWdDMEVBTmdJc0FrQWdBYjBpR1VJQVV3UkFRUUVoRUVHS0NDRVRJQUdhSWdHOUlSa01BUXNnQkVHQUVIRUVRRUVCSVJCQmpRZ2hFd3dCQzBHUUNFR0xDQ0FFUVFGeEloQWJJUk1nRUVVaEZRc0NRQ0FaUW9DQWdJQ0FnSUQ0L3dDRFFvQ0FnSUNBZ0lENC93QlJCRUFnQUVFZ0lBSWdFRUVEYWlJRElBUkIvLzk3Y1JBZklBQWdFeUFRRUI0Z0FFRzVDa0cvRHlBRlFTQnhJZ1ViUVl3TVFaNFFJQVViSUFFZ0FXSWJRUU1RSGlBQVFTQWdBaUFESUFSQmdNQUFjeEFmSUFJZ0F5QUNJQU5LR3lFSkRBRUxJQXRCRUdvaEVRSkFBbjhDUUNBQklBdEJMR29RUnlJQklBR2dJZ0ZFQUFBQUFBQUFBQUJpQkVBZ0N5QUxLQUlzSWdaQkFXczJBaXdnQlVFZ2NpSU9RZUVBUncwQkRBTUxJQVZCSUhJaURrSGhBRVlOQWlBTEtBSXNJUXBCQmlBRElBTkJBRWdiREFFTElBc2dCa0VkYXlJS05nSXNJQUZFQUFBQUFBQUFzRUdpSVFGQkJpQURJQU5CQUVnYkN5RU1JQXRCTUdvZ0MwSFFBbW9nQ2tFQVNCc2lEU0VIQTBBZ0J3Si9JQUZFQUFBQUFBQUE4RUZqSUFGRUFBQUFBQUFBQUFCbWNRUkFJQUdyREFFTFFRQUxJZ00yQWdBZ0IwRUVhaUVISUFFZ0E3aWhSQUFBQUFCbHpjMUJvaUlCUkFBQUFBQUFBQUFBWWcwQUN3SkFJQXBCQUV3RVFDQUtJUU1nQnlFR0lBMGhDQXdCQ3lBTklRZ2dDaUVEQTBBZ0EwRWRJQU5CSFVrYklRTUNRQ0FIUVFScklnWWdDRWtOQUNBRHJTRWFRZ0FoR1FOQUlBWWdHVUwvLy8vL0Q0TWdCalVDQUNBYWhud2lHU0FaUW9DVTY5d0RnQ0laUW9DVTY5d0RmbjArQWdBZ0JrRUVheUlHSUFoUERRQUxJQm1uSWdaRkRRQWdDRUVFYXlJSUlBWTJBZ0FMQTBBZ0NDQUhJZ1pKQkVBZ0JrRUVheUlIS0FJQVJRMEJDd3NnQ3lBTEtBSXNJQU5ySWdNMkFpd2dCaUVISUFOQkFFb05BQXNMSUF4QkdXcEJDVzRoQnlBRFFRQklCRUFnQjBFQmFpRVBJQTVCNWdCR0lSSURRRUVBSUFOcklnTkJDU0FEUVFsSkd5RUpBa0FnQmlBSVN3UkFRWUNVNjl3RElBbDJJUlJCZnlBSmRFRi9jeUVXUVFBaEF5QUlJUWNEUUNBSElBTWdCeWdDQUNJWElBbDJhallDQUNBV0lCZHhJQlJzSVFNZ0IwRUVhaUlISUFaSkRRQUxJQWdvQWdBaEJ5QURSUTBCSUFZZ0F6WUNBQ0FHUVFScUlRWU1BUXNnQ0NnQ0FDRUhDeUFMSUFzb0Fpd2dDV29pQXpZQ0xDQU5JQWdnQjBWQkFuUnFJZ2dnRWhzaUJ5QVBRUUowYWlBR0lBWWdCMnRCQW5VZ0Qwb2JJUVlnQTBFQVNBMEFDd3RCQUNFREFrQWdCaUFJVFEwQUlBMGdDR3RCQW5WQkNXd2hBMEVLSVFjZ0NDZ0NBQ0lKUVFwSkRRQURRQ0FEUVFGcUlRTWdDU0FIUVFwc0lnZFBEUUFMQ3lBTVFRQWdBeUFPUWVZQVJodHJJQTVCNXdCR0lBeEJBRWR4YXlJSElBWWdEV3RCQW5WQkNXeEJDV3RJQkVCQkJFR2tBaUFLUVFCSUd5QUxhaUFIUVlESUFHb2lDVUVKYlNJUFFRSjBha0hRSDJzaENrRUtJUWNnQ1NBUFFRbHNheUlKUVFkTUJFQURRQ0FIUVFwc0lRY2dDVUVCYWlJSlFRaEhEUUFMQ3dKQUlBb29BZ0FpRWlBU0lBZHVJZzhnQjJ4cklnbEZJQXBCQkdvaUZDQUdSbkVOQUFKQUlBOUJBWEZGQkVCRUFBQUFBQUFBUUVNaEFTQUhRWUNVNjl3RFJ3MEJJQWdnQ2s4TkFTQUtRUVJyTFFBQVFRRnhSUTBCQzBRQkFBQUFBQUJBUXlFQkMwUUFBQUFBQUFEZ1AwUUFBQUFBQUFEd1AwUUFBQUFBQUFENFB5QUdJQlJHRzBRQUFBQUFBQUQ0UHlBSklBZEJBWFlpRkVZYklBa2dGRWtiSVJnQ1FDQVZEUUFnRXkwQUFFRXRSdzBBSUJpYUlSZ2dBWm9oQVFzZ0NpQVNJQWxySWdrMkFnQWdBU0FZb0NBQllRMEFJQW9nQnlBSmFpSUROZ0lBSUFOQmdKVHIzQU5QQkVBRFFDQUtRUUEyQWdBZ0NDQUtRUVJySWdwTEJFQWdDRUVFYXlJSVFRQTJBZ0FMSUFvZ0NpZ0NBRUVCYWlJRE5nSUFJQU5CLzVQcjNBTkxEUUFMQ3lBTklBaHJRUUoxUVFsc0lRTkJDaUVISUFnb0FnQWlDVUVLU1EwQUEwQWdBMEVCYWlFRElBa2dCMEVLYkNJSFR3MEFDd3NnQ2tFRWFpSUhJQVlnQmlBSFN4c2hCZ3NEUUNBR0lnY2dDRTBpQ1VVRVFDQUhRUVJySWdZb0FnQkZEUUVMQ3dKQUlBNUI1d0JIQkVBZ0JFRUljU0VLREFFTElBTkJmM05CZnlBTVFRRWdEQnNpQmlBRFNpQURRWHRLY1NJS0d5QUdhaUVNUVg5QmZpQUtHeUFGYWlFRklBUkJDSEVpQ2cwQVFYY2hCZ0pBSUFrTkFDQUhRUVJyS0FJQUlnNUZEUUJCQ2lFSlFRQWhCaUFPUVFwd0RRQURRQ0FHSWdwQkFXb2hCaUFPSUFsQkNtd2lDWEJGRFFBTElBcEJmM01oQmdzZ0J5QU5hMEVDZFVFSmJDRUpJQVZCWDNGQnhnQkdCRUJCQUNFS0lBd2dCaUFKYWtFSmF5SUdRUUFnQmtFQVNoc2lCaUFHSUF4S0d5RU1EQUVMUVFBaENpQU1JQU1nQ1dvZ0JtcEJDV3NpQmtFQUlBWkJBRW9iSWdZZ0JpQU1TaHNoREF0QmZ5RUpJQXhCL2YvLy93ZEIvdi8vL3djZ0NpQU1jaUlTRzBvTkFTQU1JQkpCQUVkcVFRRnFJUTRDUUNBRlFWOXhJaFZCeGdCR0JFQWdBMEgvLy8vL0J5QU9hMG9OQXlBRFFRQWdBMEVBU2hzaEJnd0JDeUFSSUFNZ0EwRWZkU0lHYWlBR2M2MGdFUkFxSWdaclFRRk1CRUFEUUNBR1FRRnJJZ1pCTURvQUFDQVJJQVpyUVFKSURRQUxDeUFHUVFKcklnOGdCVG9BQUNBR1FRRnJRUzFCS3lBRFFRQklHem9BQUNBUklBOXJJZ1pCLy8vLy93Y2dEbXRLRFFJTElBWWdEbW9pQXlBUVFmLy8vLzhIYzBvTkFTQUFRU0FnQWlBRElCQnFJZ1VnQkJBZklBQWdFeUFRRUI0Z0FFRXdJQUlnQlNBRVFZQ0FCSE1RSHdKQUFrQUNRQ0FWUWNZQVJnUkFJQXRCRUdvaUJrRUljaUVESUFaQkNYSWhDaUFOSUFnZ0NDQU5TeHNpQ1NFSUEwQWdDRFVDQUNBS0VDb2hCZ0pBSUFnZ0NVY0VRQ0FHSUF0QkVHcE5EUUVEUUNBR1FRRnJJZ1pCTURvQUFDQUdJQXRCRUdwTERRQUxEQUVMSUFZZ0NrY05BQ0FMUVRBNkFCZ2dBeUVHQ3lBQUlBWWdDaUFHYXhBZUlBaEJCR29pQ0NBTlRRMEFDeUFTQkVBZ0FFR1dHRUVCRUI0TElBY2dDRTBOQVNBTVFRQk1EUUVEUUNBSU5RSUFJQW9RS2lJR0lBdEJFR3BMQkVBRFFDQUdRUUZySWdaQk1Eb0FBQ0FHSUF0QkVHcExEUUFMQ3lBQUlBWWdERUVKSUF4QkNVZ2JFQjRnREVFSmF5RUdJQWhCQkdvaUNDQUhUdzBESUF4QkNVb2hBeUFHSVF3Z0F3MEFDd3dDQ3dKQUlBeEJBRWdOQUNBSElBaEJCR29nQnlBSVN4c2hDU0FMUVJCcUlnTkJDWEloRFNBRFFRaHlJUU1nQ0NFSEEwQWdEU0FITlFJQUlBMFFLaUlHUmdSQUlBdEJNRG9BR0NBRElRWUxBa0FnQnlBSVJ3UkFJQVlnQzBFUWFrME5BUU5BSUFaQkFXc2lCa0V3T2dBQUlBWWdDMEVRYWtzTkFBc01BUXNnQUNBR1FRRVFIaUFHUVFGcUlRWWdDaUFNY2tVTkFDQUFRWllZUVFFUUhnc2dBQ0FHSUEwZ0Jtc2lCaUFNSUFZZ0RFZ2JFQjRnRENBR2F5RU1JQWRCQkdvaUJ5QUpUdzBCSUF4QkFFNE5BQXNMSUFCQk1DQU1RUkpxUVJKQkFCQWZJQUFnRHlBUklBOXJFQjRNQWdzZ0RDRUdDeUFBUVRBZ0JrRUpha0VKUVFBUUh3c2dBRUVnSUFJZ0JTQUVRWURBQUhNUUh5QUNJQVVnQWlBRlNoc2hDUXdCQ3lBVElBVkJHblJCSDNWQkNYRnFJUXdDUUNBRFFRdExEUUJCRENBRGF5RUdSQUFBQUFBQUFEQkFJUmdEUUNBWVJBQUFBQUFBQURCQW9pRVlJQVpCQVdzaUJnMEFDeUFNTFFBQVFTMUdCRUFnR0NBQm1pQVlvYUNhSVFFTUFRc2dBU0FZb0NBWW9TRUJDeUFSSUFzb0Fpd2lCaUFHUVI5MUlnWnFJQVp6clNBUkVDb2lCa1lFUUNBTFFUQTZBQThnQzBFUGFpRUdDeUFRUVFKeUlRb2dCVUVnY1NFSUlBc29BaXdoQnlBR1FRSnJJZzBnQlVFUGFqb0FBQ0FHUVFGclFTMUJLeUFIUVFCSUd6b0FBQ0FFUVFoeElRWWdDMEVRYWlFSEEwQWdCeUlGQW44Z0FabEVBQUFBQUFBQTRFRmpCRUFnQWFvTUFRdEJnSUNBZ0hnTElnZEJnTThBYWkwQUFDQUljam9BQUNBQklBZTNvVVFBQUFBQUFBQXdRS0loQVFKQUlBVkJBV29pQnlBTFFSQnFhMEVCUncwQUFrQWdCZzBBSUFOQkFFb05BQ0FCUkFBQUFBQUFBQUFBWVEwQkN5QUZRUzQ2QUFFZ0JVRUNhaUVIQ3lBQlJBQUFBQUFBQUFBQVlnMEFDMEYvSVFsQi9mLy8vd2NnQ2lBUklBMXJJZ1ZxSWdacklBTklEUUFnQUVFZ0lBSWdCZ0ovQWtBZ0EwVU5BQ0FISUF0QkVHcHJJZ2hCQW1zZ0EwNE5BQ0FEUVFKcURBRUxJQWNnQzBFUWFtc2lDQXNpQjJvaUF5QUVFQjhnQUNBTUlBb1FIaUFBUVRBZ0FpQURJQVJCZ0lBRWN4QWZJQUFnQzBFUWFpQUlFQjRnQUVFd0lBY2dDR3RCQUVFQUVCOGdBQ0FOSUFVUUhpQUFRU0FnQWlBRElBUkJnTUFBY3hBZklBSWdBeUFDSUFOS0d5RUpDeUFMUWJBRWFpUUFJQWtMVmdFQmZ5TUFRVEJySWdFa0FDQUJRUWhxSUFBUkFnQkJKQkFkSWdBZ0FTZ0NLRFlDSUNBQUlBRXBBeUEzQWhnZ0FDQUJLUU1ZTndJUUlBQWdBU2tERURjQ0NDQUFJQUVwQXdnM0FnQWdBVUV3YWlRQUlBQUxCQUJDQUFzRUFFRUFDMVlCQVg4Z0FDZ0NQQ0VESXdCQkVHc2lBQ1FBSUFNZ0FhY2dBVUlnaUtjZ0FrSC9BWEVnQUVFSWFoQVJJZ0lFZjBHSTZBQWdBallDQUVGL0JVRUFDeUVDSUFBcEF3Z2hBU0FBUVJCcUpBQkNmeUFCSUFJYkMrOENBUWQvSXdCQklHc2lCQ1FBSUFRZ0FDZ0NIQ0lGTmdJUUlBQW9BaFFoQXlBRUlBSTJBaHdnQkNBQk5nSVlJQVFnQXlBRmF5SUJOZ0lVSUFFZ0Ftb2hCVUVDSVFjQ2Z3SkFBa0FnQUNnQ1BDQUVRUkJxSWdGQkFpQUVRUXhxRUFzaUF3Ui9RWWpvQUNBRE5nSUFRWDhGUVFBTFJRUkFBMEFnQlNBRUtBSU1JZ05HRFFJZ0EwRUFTQTBESUFFZ0F5QUJLQUlFSWdoTElnWkJBM1JxSWdrZ0F5QUlRUUFnQmh0cklnZ2dDU2dDQUdvMkFnQWdBVUVNUVFRZ0JodHFJZ2tnQ1NnQ0FDQUlhellDQUNBRklBTnJJUVVnQUNnQ1BDQUJRUWhxSUFFZ0Joc2lBU0FISUFacklnY2dCRUVNYWhBTElnTUVmMEdJNkFBZ0F6WUNBRUYvQlVFQUMwVU5BQXNMSUFWQmYwY05BUXNnQUNBQUtBSXNJZ0UyQWh3Z0FDQUJOZ0lVSUFBZ0FTQUFLQUl3YWpZQ0VDQUNEQUVMSUFCQkFEWUNIQ0FBUWdBM0F4QWdBQ0FBS0FJQVFTQnlOZ0lBUVFBZ0IwRUNSZzBBR2lBQ0lBRW9BZ1JyQ3lFQUlBUkJJR29rQUNBQUN3a0FJQUFvQWp3UUZRc1BBQ0FCSUFBb0FnQnFJQUk0QWdBTERRQWdBU0FBS0FJQWFpb0NBQXVkQVFFRGZ3Si9JQUFvQWdRaUFpRUFBa0FnQWtFRGNRUkFBMEFnQUMwQUFFVU5BaUFBUVFGcUlnQkJBM0VOQUFzTEEwQWdBQ0lCUVFScUlRQWdBU2dDQUNJRFFYOXpJQU5CZ1lLRUNHdHhRWUNCZ29SNGNVVU5BQXNnQVNBQ2F5QURRZjhCY1VVTkFSb0RRQ0FCTFFBQklRTWdBVUVCYWlJQUlRRWdBdzBBQ3dzZ0FDQUNhd3RCQVdvaUFCQW5JZ0VFZnlBQklBSWdBQkFhQlVFQUN3dHRBUU4vSXdCQkVHc2lBaVFBQWtBQ1FDQUFRUU5MRFFBZ0FFRUNkRUd3MlFCcUlnTW9BZ0FpQVVVTkFDQUJLQUx3QnlJQUJFQWdBQkFoQ3lBQkVDRWdBMEVBTmdJQURBRUxRY0RaQUNnQ0FDSUJSUTBBSUFJZ0FEWUNBQ0FCUWNvZElBSVFIQXNnQWtFUWFpUUFDOEVUQXdsL0FuMEJmaU1BUVRCcklnUWtBQUpBQWtCQnNOa0FLQUlBUlFSQVFiRFpBQ0VIREFFTFFiVFpBQ2dDQUVVRVFFRzAyUUFoQjBFQklRZ01BUXRCdU5rQUtBSUFSUVJBUWJqWkFDRUhRUUloQ0F3QkMwRzgyUUFvQWdCRkJFQkJ2TmtBSVFkQkF5RUlEQUVMUVg4aENFSEEyUUFvQWdBaUFFVU5BU0FFUVFRMkFnQWdBRUdSSWlBRUVCd01BUXRCK0FjUUhTRUJJQVFnQUNnQ0FEWUNDQ0FFSUFBcUFnUTRBZ3dnQkNBQUtnSUlPQUlRSUFRZ0FDb0NERGdDRkNBRUlBQW9BaEEyQWhnZ0JDQUFLZ0lVT0FJY0lBUWdBQ2dDR0RZQ0lDQUVJQUFvQWh3MkFpUWdCQ0FBS0FJZ05nSW9JQUZCZnpZQ1NDQUJRUUE2QUVRZ0FVR0FnSUQ4ZXpZQ1FDQUJRbjgzQXpnZ0FVS0FnSUQ4ZXpjRE1DQUJRb0NBZ1B4N053TW9JQUZDZ0lDQWdJQ0FnTUMvZnpjRElDQUJRdi8vLy84UE53TVlJQUZDZ0lDQS9IczNBeEFnQVVLQWdJRDhlemNEQ0NBQlFvQ0FnUHlMZ0lEQXYzODNBd0FnQVVJQU53Q25BU0FCUWdBM0FxQUJJQUZDQURjQ21BRWdBVUlBTndLUUFTQUJRZ0EzQW9nQklBRkNBRGNDZ0FFZ0FVSUFOd0o0SUFGQ0FEY0NjQ0FCUVFBMkF0Z0JJQUZDQURjQzBBRWdBVUlBTndMSUFTQUJRZ0EzQXNBQklBRkNBRGNDdUFFZ0FVSUFOd0t3QVNBQlFRQTJBa3dnQVVFQU9nQlFJQUZDQURjQ1ZDQUJRZ0EzQWx3Z0FVSUFOd0prSUFGQkFEc0JiQ0FCUWZRRGFrRUFRY0VBRUJzYUlBRkNBRGNDdkFRZ0FVSE5tYlB1QXpZQ3VBUWdBVUlBTndMRUJDQUJRZ0EzQXN3RUlBRkNBRGNDMUFRZ0FVSUFOd0xjQkNBQlFnQTNBdVFFSUFGQ0FEY0M3QVFnQVVJQU53S0lCeUFCUWdBM0FwQUhJQUZDQURjQ21BY2dBVUlBTndLZ0J5QUJRZ0EzQXFnSElBRkJBRFlDc0FjZ0FVSUFOd0s0QnlBQlFnQTNBc0FISUFGQ0FEY0N5QWNnQVVJQU53TFFCeUFCUWdBM0F0Z0hJQUZCQURZQzRBY2dBVUlBTndQd0J5QUJRZ0EzQStnSEl3QkJrQUZySWdVa0FDQUJLQUx3QnlJQUJFQWdBQkFoSUFGQ0FEY0Q4QWNMSUFFZ0JDb0NERGdDQUNBQklBUXFBaEE0QWdRZ0FTQUVLZ0lVT0FJSUlBRWdCQ2dDR0NJQU5nSU1JQUZEQUFDQVB5QUFzcFU0QWhBQ1FDQUVLQUlnSWdKQkJrOEVRRUVBSVFCQndOa0FLQUlBSWdORkRRRWdCU0FDTmdLQUFTQURRYnNnSUFWQmdBRnFFQndNQVFzZ0FrRUNkRUh3TG1vb0FnQWhBQXNnQVNBQU5nSVVRUUVoQWlBRUtBSWtJZ01oQUFKQUFrQUNRQUpBQWtBZ0F3NEdCQUFBQVFFQ0F3dEJBU0VBUVFBaEFnd0RDMEVDSVFCQkFDRUNEQUlMUVFRaEFFRUFJUUlNQVF0QkFDRUFRY0RaQUNnQ0FDSUNCRUFnQlNBRE5nSndJQUpCdXlBZ0JVSHdBR29RSENBRUtBSWtJUU1MUVFFaEFnc2dBU0FBTmdJWUlBUW9BaUFoQmlBQklBTTJBaUFnQVNBR05nSWNJQUZCRURZQ05DQUJRUUUyQWl3Z0FTQUJLZ0lJSWdzZ0FTZ0NETEtWSWdvNEFpUWdBU0FLSUFxU09BSXdJQUZEQUFDQVB5QUtsVGdDS0NBQklBUW9BZ2dpQUVFQVRFRUVkRFlDT0NBQlFRQkJBeUFBUVFCS0lna2JOZ0k4SUFRcUFod2hDaUFCSUFBMkFrZ2dBU0FLT0FKQUlBRWdDVG9BUkNBQklBUW9BaWhCL3dGeElnQkJBWFpCQVhFNkFFd2dBU0FBUVFKMlFRRnhPZ0JOSUFFZ0FTb0NBQ0lLSUF0YkJIOGdBU29DQkNBTFhBVkJBUXM2QUU0Z0FTQUFRUVIyUVFGeE9nQlFJQUVnQUVFRGRrRUJjVG9BVHdKQUlBRW9BaFJGQkVCQndOa0FLQUlBSWdCRkRRRWdCU0FHTmdJQUlBQkJpU0FnQlJBY0RBRUxJQUlFUUVIQTJRQW9BZ0FpQUVVTkFTQUZJQU0yQWhBZ0FFSFdIeUFGUVJCcUVCd01BUXNnQkNnQ0dDSUFRWUVJVGdSQVFjRFpBQ2dDQUNJQ1JRMEJJQVZCZ0FnMkFpUWdCU0FBTmdJZ0lBSkJyaDhnQlVFZ2FoQWNEQUVMSUFwREFBQjZSRjBFUUVIQTJRQW9BZ0FpQUVVTkFTQUZRb0NBZ0lDQWdOREh3QUEzQXpnZ0JTQUt1emtETUNBQVFaOFlJQVZCTUdvUVNnd0JDeUFLUXdDQXUwZGVCRUJCd05rQUtBSUFJZ0JGRFFFZ0JVS0FnSUNBZ0lEYys4QUFOd05JSUFVZ0NyczVBMEFnQUVIVUdDQUZRVUJyRUVvTUFRc2dBVUlBTndQd0J5QUJRUUFnQVVIMEIyb2lBQkJSUlFSQVFjRFpBQ2dDQUNJQVJRMEJRWWtaUVRrZ0FCQW9EQUVMQWtBQ2YwRUFJQUVvQXZRSElnTWlBa1VOQUJvZ0FxMGlES2NpQmlBQ1FRRnlRWUNBQkVrTkFCcEJmeUFHSUF4Q0lJaW5Hd3NpQmhBbklnSkZEUUFnQWtFRWF5MEFBRUVEY1VVTkFDQUNRUUFnQmhBYkdnc2dBVUVBTmdMMEJ5QUJJQUkyQXZBSElBRWdBaUFBRUZGRkJFQkJ3TmtBS0FJQUlnSkZEUUVnQlNBQUtBSUFOZ0pnSUFKQjFoNGdCVUhnQUdvUUhBd0JDeUFBS0FJQUlnQWdBMGNFUUVIQTJRQW9BZ0FpQWtVTkFTQUZJQUEyQWxRZ0JTQUROZ0pRSUFKQjdpQWdCVUhRQUdvUUhBd0JDeUFCTFFCTUJFQWdBU0FCS0FJTU5nS1FBU0FCS0FLY0FVRUFOZ0lBSUFGQkFEc0I1QUVnQVVJQU53TGNBU0FCUVJZMkF1Z0JBa0JCNU4wQUxRQUFRUUZ4RFFCQjVOMEFFQ05GRFFCQjNOc0FFQ1pCaUFJUUdocEI1TjBBRUNJTElBRkI3QUZxUWR6YkFFR0lBaEFhSVFBZ0FTQUJLQUlNSWdJZ0FDNEJCQ0lESUFJZ0EwZ2JJQUlnQUMwQUNSc2lBaUFBTGdFUUlnTWdBaUFEU0JzZ0FpQUFMUUFWR3lJQ0lBQXVBUndpQXlBQ0lBTklHeUFDSUFBdEFDRWJJZ0lnQUM0QktDSURJQUlnQTBnYklBSWdBQzBBTFJzaUFpQUFMZ0UwSWdNZ0FpQURTQnNnQWlBQUxRQTVHeUlDSUFCQlFHc3VBUUFpQXlBQ0lBTklHeUFDSUFBdEFFVWJJZ0lnQUM0QlRDSURJQUlnQTBnYklBSWdBQzBBVVJzaUFpQUFMZ0ZZSWdNZ0FpQURTQnNnQWlBQUxRQmRHeUlDSUFBdUFXUWlBeUFDSUFOSUd5QUNJQUF0QUdrYklnSWdBQzRCY0NJRElBSWdBMGdiSUFJZ0FDMEFkUnNpQWlBQUxnRjhJZ01nQWlBRFNCc2dBaUFBTFFDQkFSc2lBaUFBTGdHSUFTSURJQUlnQTBnYklBSWdBQzBBalFFYklnSWdBQzRCbEFFaUF5QUNJQU5JR3lBQ0lBQXRBSmtCR3lJQ0lBQXVBYUFCSWdNZ0FpQURTQnNnQWlBQUxRQ2xBUnNpQWlBQUxnR3NBU0lESUFJZ0EwZ2JJQUlnQUMwQXNRRWJJZ0lnQUM0QnVBRWlBeUFDSUFOSUd5QUNJQUF0QUwwQkd5SUNJQUF1QWNRQklnTWdBaUFEU0JzZ0FpQUFMUURKQVJzaUFpQUFMZ0hRQVNJRElBSWdBMGdiSUFJZ0FDMEExUUViSWdJZ0FDNEIzQUVpQXlBQ0lBTklHeUFDSUFBdEFPRUJHeUlDSUFBdUFlZ0JJZ01nQWlBRFNCc2dBaUFBTFFEdEFSc2lBaUFBTGdIMEFTSURJQUlnQTBnYklBSWdBQzBBK1FFYklnSWdBQzRCZ0FJaUF5QUNJQU5JR3lBQ0lBQXRBSVVDR3pZQ2ZBc2dBUzBBVFFSQUFrQkIyTnNBTFFBQVFRRnhEUUJCMk5zQUVDTkZEUUJCME5rQUVDWkJpQUlRR2hwQjJOc0FFQ0lMSUFGQmdBVnFRZERaQUVHSUFoQWFHZ3NnQVVFQVFZb2xRUUJCQUJCVEdnc2dCVUdRQVdva0FDQUhJQUUyQWdBTElBUkJNR29rQUNBSUN6NEFJQUJCMk5RQUtBSUFOZ0lnSUFCQjBOUUFLUUlBTndJWUlBQkJ5TlFBS1FJQU53SVFJQUJCd05RQUtRSUFOd0lJSUFCQnVOUUFLUUlBTndJQUM1RUxBaFY5REg4Z0FVRUFTZ1JBQTBBZ0FpQUJJQmxxSWgwZ0FXb2lHMEVDZEdvaUdrRUVhaW9DQUNFS0lBSWdBU0FiYWtFQ2RHb2lIa0VFYWlvQ0FDRU1JQUlnR1VFQ2RDSWJRUVJ5YWlJaUtnSUFJUTBnQWlBZFFRSjBhaUlkUVFScUtnSUFJUTRnQWlBYmFpSWJJQnNxQWdBaUR5QWRLZ0lBSWhDU0lnWWdHaW9DQUNJSUlCNHFBZ0FpQ1pJaUI1STRBZ0FnSWlBTklBNlNJZ1VnQ2lBTWtpSUVramdDQUNBYUlBVWdCSk00QWdRZ0dpQUdJQWVUT0FJQUlCMGdEU0FPa3lJR0lBZ2dDWk1pQjVJNEFnUWdIU0FQSUJDVElnVWdDaUFNa3lJRWt6Z0NBQ0FlSUFZZ0I1TTRBZ1FnSGlBRklBU1NPQUlBSUJsQkFtb2lHU0FCU0EwQUN3c2dBVUVDZENJaUlBRkJCV3dpSVVnRVFDQURLZ0lJSVFzZ0lpRVpBMEFnQWlBQklCbHFJaDBnQVdvaUcwRUNkR29pSEVFRWFpb0NBQ0VLSUFJZ0FTQWJha0VDZEdvaUdrRUVhaW9DQUNFTUlBSWdHVUVDZENJYlFRUnlhaUllS2dJQUlRMGdBaUFkUVFKMGFpSWRRUVJxS2dJQUlRNGdBaUFiYWlJYklCc3FBZ0FpRHlBZEtnSUFJaENTSWdnZ0hDb0NBQ0lKSUJvcUFnQWlCcElpQjVJNEFnQWdIaUFOSUE2U0lnVWdDaUFNa2lJRWtqZ0NBQ0FjSUFnZ0I1TTRBZ1FnSENBRUlBV1RPQUlBSUIwZ0N5QU5JQTZUSWdnZ0NTQUdreUlKa2lJRklBOGdFSk1pQmlBS0lBeVRJZ2VUSWdTU2xEZ0NCQ0FkSUFzZ0JDQUZrNVE0QWdBZ0dpQUxJQWtnQ0pNaUJTQUdJQWVTSWdTU2xEZ0NCQ0FhSUFzZ0JTQUVrNVE0QWdBZ0dVRUNhaUlaSUNGSURRQUxDeUFBSUFGQkEzUWlIVW9FUUVFQUlSa2dIU0ViQTBBZ0F5QVpRUUpxSWg1QkFuUnFLZ0lBSVJNZ0dVRUNkQ0FEYWlvQ0RDSVJqQ0VZSUFGQkFFd2lKRVVFUUNBRElCNUJBM1JxSWhrcUFnQWlFaUFSSUJHU0lnUWdHU29DQkNJVWxKTWhGU0FFSUJLVUlCU1RJZ3lNSVEwZ0FTQWJhaUVqSUJTTUlRNGdHeUVaQTBBZ0FpQUJJQmxxSWh3Z0FXb2lHa0VDZEdvaUgwRUVhaW9DQUNFV0lBSWdBU0FhYWtFQ2RHb2lJRUVFYWlvQ0FDRVhJQUlnR1VFQ2RDSWFRUVJ5YWlJaEtnSUFJUXNnQWlBY1FRSjBhaUljUVFScUtnSUFJUW9nQWlBYWFpSWFJQm9xQWdBaUR5QWNLZ0lBSWhDU0lnZ2dIeW9DQUNJSklDQXFBZ0FpQnBJaUI1STRBZ0FnSVNBTElBcVNJZ1VnRmlBWGtpSUVramdDQUNBZklCTWdCU0FFa3lJRmxDQVJJQWdnQjVNaUJKU1NPQUlFSUI4Z0V5QUVsQ0FGSUJpVWtqZ0NBQ0FjSUJJZ0N5QUtreUlJSUFrZ0JwTWlDWklpQlpRZ0ZDQVBJQkNUSWdZZ0ZpQVhreUlIa3lJRWxKSTRBZ1FnSENBU0lBU1VJQVVnRHBTU09BSUFJQ0FnRlNBSUlBbVRJZ1dVSUF3Z0JpQUhraUlFbEpJNEFnUWdJQ0FWSUFTVUlBVWdEWlNTT0FJQUlCbEJBbW9pR1NBalNBMEFDd3NnSkVVRVFDQURJQjVCQTNRaUdVRUljbW9xQWdBaUVTQVRJQk9TSWdRZ0F5QVpRUXh5YWlvQ0FDSVNsSk1oRkNBRUlCR1VJQktUSWdxTUlRd2dHeUFpYWlJWklBRnFJU01nRW93aERTQVRqQ0VPQTBBZ0FpQUJJQmxxSWh3Z0FXb2lHa0VDZEdvaUgwRUVhaW9DQUNFVklBSWdBU0FhYWtFQ2RHb2lJRUVFYWlvQ0FDRVdJQUlnR1VFQ2RDSWFRUVJ5YWlJaEtnSUFJUmNnQWlBY1FRSjBhaUljUVFScUtnSUFJUXNnQWlBYWFpSWFJQm9xQWdBaUR5QWNLZ0lBSWhDU0lnZ2dIeW9DQUNJSklDQXFBZ0FpQnBJaUI1STRBZ0FnSVNBWElBdVNJZ1VnRlNBV2tpSUVramdDQUNBZklCZ2dCU0FFa3lJRmxDQVRJQWdnQjVNaUJKU1NPQUlFSUI4Z0dDQUVsQ0FGSUE2VWtqZ0NBQ0FjSUJFZ0Z5QUxreUlJSUFrZ0JwTWlDWklpQlpRZ0VpQVBJQkNUSWdZZ0ZTQVdreUlIa3lJRWxKSTRBZ1FnSENBUklBU1VJQVVnRFpTU09BSUFJQ0FnRkNBSUlBbVRJZ1dVSUFvZ0JpQUhraUlFbEpJNEFnUWdJQ0FVSUFTVUlBVWdESlNTT0FJQUlCbEJBbW9pR1NBalNBMEFDd3NnSGlFWklCc2dIV29pR3lBQVNBMEFDd3NMNWdnQ0VIMExmeUFCSUFFcUFnUWlCeUFCS2dJTUlnU1NJZ01nQVNvQ0ZDSUlJQUVxQWh3aUJwSWlDWk00QWhRZ0FTQUJLZ0lBSWdvZ0FTb0NDQ0lGa2lJTUlBRXFBaEFpRFNBQktnSVlJZ3VTSWcrVE9BSVFJQUVnQXlBSmtqZ0NCQ0FCSUF3Z0Q1STRBZ0FnQVNBSElBU1RJZ2NnRFNBTGt5SUVremdDSENBQklBb2dCWk1pQXlBSUlBYVRJZ2lTT0FJWUlBRWdCeUFFa2pnQ0RDQUJJQU1nQ0pNNEFnZ2dBaW9DQ0NFSElBRWdBU29DSUNJSklBRXFBaWdpQ3BJaUJTQUJLZ0l3SWd3Z0FTb0NPQ0lOa2lJTGtqZ0NJQ0FCS2dJMElRUWdBU29DUENFRElBRXFBaVFoQ0NBQktnSXNJUVlnQVNBRklBdVRPQUkwSUFFZ0JDQURraUlGSUFnZ0JwSWlDNU00QWpBZ0FTQUxJQVdTT0FJa0lBRWdCeUFNSUEyVElnVWdDQ0FHa3lJSWt5SUdJQWtnQ3BNaUNTQUVJQU9USWdTU0lnT1NsRGdDUENBQklBY2dCaUFEazVRNEFqZ2dBU0FISUFnZ0JaSWlBeUFKSUFTVElnU1NsRGdDTENBQklBY2dCQ0FEazVRNEFpZ2dBRUVSVGdSQVFSQWhHQU5BSUFJZ0UwRUNhaUliUVFOMEloZHFJaFFxQWdBaEF5QVVLZ0lFSVFnZ0FpQWJRUUowYWlvQ0FDRUhJQk5CQW5RZ0Ftb3FBZ3doQkNBQklCaEJBblFpRTBFTWNtb2lGQ29DQUNFR0lBRWdFMEVFY21vaUdTb0NBQ0VKSUFFZ0UwRWNjbW9pR2lvQ0FDRUtJQUVnRTBFVWNtb2lGU29DQUNFRklBRWdFMm9pRmlBV0tnSUFJZ3dnQVNBVFFRaHlhaUlXS2dJQUlnMlNJZ3NnQVNBVFFSQnlhaUljS2dJQUlnOGdBU0FUUVJoeWFpSWRLZ0lBSWhDU0lnNlNPQUlBSUJrZ0NTQUdraUlSSUFVZ0NwSWlFcEk0QWdBZ0hDQUhJQXNnRHBNaUM1UWdCQ0FSSUJLVElnNlVremdDQUNBVklBY2dEcFFnQkNBTGxKSTRBZ0FnRmlBRElBd2dEWk1pRENBRklBcVRJZ3FUSWdXVUlBZ2dDU0FHa3lJR0lBOGdFSk1pQ1pJaURaU1RPQUlBSUJRZ0F5QU5sQ0FJSUFXVWtqZ0NBQ0FkSUFNZ0NDQUVJQVNTSWdXVWt5SU5JQXdnQ3BJaUNwUWdCaUFKa3lJR0lBVWdBNVFnQ0pNaUE1U1RPQUlBSUJvZ0RTQUdsQ0FESUFxVWtqZ0NBQ0FDSUJkQkNISnFLZ0lBSVFNZ0FpQVhRUXh5YWlvQ0FDRUlJQUVnRTBFc2Ntb2lGeW9DQUNFR0lBRWdFMEVrY21vaUZDb0NBQ0VKSUFFZ0UwRThjbW9pR1NvQ0FDRUtJQUVnRTBFMGNtb2lHaW9DQUNFRklBRWdFMEVnY21vaUZTQVZLZ0lBSWd3Z0FTQVRRU2h5YWlJVktnSUFJZzJTSWdzZ0FTQVRRVEJ5YWlJV0tnSUFJZzhnQVNBVFFUaHlhaUlUS2dJQUloQ1NJZzZTT0FJQUlCUWdDU0FHa2lJUklBVWdDcElpRXBJNEFnQWdGaUFFakNBTElBNlRJZ3VVSUFjZ0VTQVNreUlPbEpNNEFnQWdHaUFISUF1VUlBUWdEcFNUT0FJQUlCVWdBeUFNSUEyVElnUWdCU0FLa3lJS2t5SUZsQ0FJSUFrZ0JwTWlCaUFQSUJDVElnbVNJZ3lVa3pnQ0FDQVhJQU1nREpRZ0NDQUZsSkk0QWdBZ0V5QURJQWdnQnlBSGtpSUhsSk1pQlNBRUlBcVNJZ1NVSUFZZ0NaTWlCaUFISUFPVUlBaVRJZ2VVa3pnQ0FDQVpJQVVnQnBRZ0J5QUVsSkk0QWdBZ0d5RVRJQmhCRUdvaUdDQUFTQTBBQ3dzTEd3QkJsTmNBS0FJQUlnQUVRRUdZMXdBZ0FEWUNBQ0FBRUNFTEN3c0FJQUFFUUNBQUVDRUxDejRBQWtCQjJOc0FMUUFBUVFGeERRQkIyTnNBRUNORkRRQkIwTmtBRUNaQmlBSVFHaHBCMk5zQUVDSUxJQUJCREd4QjJka0FhaUFCUVFCSE9nQUFDejRBQWtCQjVOMEFMUUFBUVFGeERRQkI1TjBBRUNORkRRQkIzTnNBRUNaQmlBSVFHaHBCNU4wQUVDSUxJQUJCREd4QjVkc0FhaUFCUVFCSE9nQUFDd3NBSUFFZ0FpQUFFUWdBQ3hBQVFjRFpBRUdneXdBb0FnQTJBZ0FMQ3dCQndOa0FRUUEyQWdBTEJ3QWdBQkVIQUF1alpRTWtmd2w5QW53akFFRVFheUlaSkFBZ0FBSi9JQUlvQWdBZ0FpQUNMUUFMSWdCQkdIUkJHSFZCQUVnaUJ4c2hIU0FDS0FJRUlBQWdCeHNoSGlNQVFSQnJJaUVrQUNBQlFRSjBRYkRaQUdvb0FnQWhCQ01BUVJCckloOGtBQUpBSUFRdEFFeEZCRUJCd05rQUtBSUFJZ0JGRFFGQnl4cEJQeUFBRUNnTUFRc2dCQzBBdEFRRVFFSEEyUUFvQWdBaUFFVU5BVUhvR1VFaElBQVFLQXdCQ3lBRVFiZ0hhaUVsSUFRcUFnQWdCQ29DQ0pVaUxVTUFBSEJDbENFdVF3QUFnRDhnTFpVaEx5QUVLQUtRQVNFQUEwQkJBU0VESUI0Q2Z5QUVMUUJPUlFSQUlBUW9BaFFnQUd3TUFRc2dKU0F2SUFBZ0JDZ0N3QUZCQUJBd1FRUnFJQVFvQWhSc0N5SUFJQUFnSGtzYklocEZEUUVDUUNBRUtBSWNJZ0JCQVd0QkJFOEVRQ0FBUVFWSERRRWdCQ2dDd0FFZ0hTQWFFQm9hREFFTElBUW9Bc2dCSUIwZ0doQWFHZ3NnR2lBRUtBSVVJZ0J1SWhBZ0FHd2dHa2NFUUVIQTJRQW9BZ0FpQWdSQUlCOGdBRFlDQkNBZklCbzJBZ0FnQWtIZUlpQWZFQndMSUFRZ0JDZ0NERFlDa0FFTUFnc0NRQUpBQWtBQ1FBSkFJQVFvQWh4QkFXc09CQUFCQWdNRUN5QVFRUUJNRFFNZ0JDZ0N5QUVoQWlBRUtBTEFBU0VGUVFBaEFDQVFRUUZIQkVBZ0VFRitjU0VJUVFBaEJ3TkFJQVVnQUVFQ2RHb2dBQ0FDYWkwQUFFR0FBV3V5UXdBQUFEeVVPQUlBSUFVZ0FFRUJjaUlNUVFKMGFpQUNJQXhxTFFBQVFZQUJhN0pEQUFBQVBKUTRBZ0FnQUVFQ2FpRUFJQWRCQW1vaUJ5QUlSdzBBQ3dzZ0VFRUJjVVVOQXlBRklBQkJBblJxSUFBZ0Ftb3RBQUJCZ0FGcnNrTUFBQUE4bERnQ0FBd0RDeUFRUVFCTURRSWdCQ2dDeUFFaEFpQUVLQUxBQVNFSVFRQWhCMEVBSVFBZ0VFRUJhMEVEVHdSQUlCQkJmSEVoREVFQUlRVURRQ0FJSUFCQkFuUnFJQUFnQW1vc0FBQ3lRd0FBQUR5VU9BSUFJQWdnQUVFQmNpSUdRUUowYWlBQ0lBWnFMQUFBc2tNQUFBQThsRGdDQUNBSUlBQkJBbklpQmtFQ2RHb2dBaUFHYWl3QUFMSkRBQUFBUEpRNEFnQWdDQ0FBUVFOeUlnWkJBblJxSUFJZ0Jtb3NBQUN5UXdBQUFEeVVPQUlBSUFCQkJHb2hBQ0FGUVFScUlnVWdERWNOQUFzTElCQkJBM0VpQlVVTkFnTkFJQWdnQUVFQ2RHb2dBQ0FDYWl3QUFMSkRBQUFBUEpRNEFnQWdBRUVCYWlFQUlBZEJBV29pQnlBRlJ3MEFDd3dDQ3lBUVFRQk1EUUVnQkNnQ3lBRWhBaUFFS0FMQUFTRUZRUUFoQUNBUVFRRkhCRUFnRUVGK2NTRUlRUUFoQndOQUlBVWdBRUVDZEdvZ0FpQUFRUUYwYWk4QkFFR0FnQUpyc2tNQUFBQTRsRGdDQUNBRklBQkJBWElpREVFQ2RHb2dBaUFNUVFGMGFpOEJBRUdBZ0FKcnNrTUFBQUE0bERnQ0FDQUFRUUpxSVFBZ0IwRUNhaUlISUFoSERRQUxDeUFRUVFGeFJRMEJJQVVnQUVFQ2RHb2dBaUFBUVFGMGFpOEJBRUdBZ0FKcnNrTUFBQUE0bERnQ0FBd0JDeUFRUVFCTURRQWdCQ2dDeUFFaEFpQUVLQUxBQVNFSVFRQWhCMEVBSVFBZ0VFRUJhMEVEVHdSQUlCQkJmSEVoREVFQUlRVURRQ0FJSUFCQkFuUnFJQUlnQUVFQmRHb3VBUUN5UXdBQUFEaVVPQUlBSUFnZ0FFRUJjaUlHUVFKMGFpQUNJQVpCQVhScUxnRUFza01BQUFBNGxEZ0NBQ0FJSUFCQkFuSWlCa0VDZEdvZ0FpQUdRUUYwYWk0QkFMSkRBQUFBT0pRNEFnQWdDQ0FBUVFOeUlnWkJBblJxSUFJZ0JrRUJkR291QVFDeVF3QUFBRGlVT0FJQUlBQkJCR29oQUNBRlFRUnFJZ1VnREVjTkFBc0xJQkJCQTNFaUJVVU5BQU5BSUFnZ0FFRUNkR29nQWlBQVFRRjBhaTRCQUxKREFBQUFPSlE0QWdBZ0FFRUJhaUVBSUFkQkFXb2lCeUFGUncwQUN3c2dCQ2dDRENJQ0lBUW9BcEFCYXlFSEFrQWdCQzBBVGtVRVFDQVFRUUJNRFFFZ0JDZ0N1QUVoQ0NBRUtBTEFBU0VNUVFBaEJVRUFJUUFnRUVFQmEwRURUd1JBSUJCQmZIRWhDa0VBSVFZRFFDQUlJQUFnQjJwQkFuUnFJQXdnQUVFQ2RHb3FBZ0E0QWdBZ0NDQUFRUUZ5SWdrZ0IycEJBblJxSUF3Z0NVRUNkR29xQWdBNEFnQWdDQ0FBUVFKeUlna2dCMnBCQW5ScUlBd2dDVUVDZEdvcUFnQTRBZ0FnQ0NBQVFRTnlJZ2tnQjJwQkFuUnFJQXdnQ1VFQ2RHb3FBZ0E0QWdBZ0FFRUVhaUVBSUFaQkJHb2lCaUFLUncwQUN3c2dFRUVEY1NJR1JRMEJBMEFnQ0NBQUlBZHFRUUowYWlBTUlBQkJBblJxS2dJQU9BSUFJQUJCQVdvaEFDQUZRUUZxSWdVZ0JrY05BQXNNQVFzZ0VFR0FBVXdFUUNBRUlBSTJBcEFCREFNTEFrQWdCQzBBYkEwQUlBUW9BdGdIc2lBdUlBUXFBZ2lVWGtVTkFDQUVRZ0EzQStnSElBUkNBRGNENEFjZ0JFSUFOd1BZQnlBRUtBTElCMEVBSUFRb0Fzd0hRUUowRUJzYUlBUW9Bc0FIUVFBZ0JDZ0N4QWRCQW5RUUd4b2dCQ2dDMEFkQkFDQUVLQUxVQjBFQ2RCQWJHZ3NnSlNBdElCQWdCQ2dDd0FFZ0JDZ0N1QUVnQjBFQ2RHb1FNQ0FIYWlFUUlBUW9BZ3doQWdzZ0FpQVFUQVJBSUFSQkFUb0FyZ0VDUUNBRUxRQkVCRUJCQUNFR1FRQWhDVUVBSVE0akFFR0FBbXNpQlNRQUlBUkJBVG9BclFFZ0JDZ0NuQUVoQUNBRUtBS2tBU0VDSUFRb0Fnd2lCeUFFS0FLVUFTQUVLQUs0QVNBSFFRSjBFQm9nQUNBQ0VEMUJBQ0VDQWtBZ0JDZ0NEQ0lBUVFCTUJFQWdCRUdnQkdvaEdDQUVRWmdFYWlFYkRBRUxJQVFvQXJBQklRY2dCQ2dDbEFFaENDQUFRUUZIQkVBZ0FFRitjU0VNQTBBZ0J5QUNRUUowYWlBSUlBSkJBM1JxSWdNcUFnQWlKeUFubENBREtnSUVJaWNnSjVTU09BSUFJQWNnQWtFQmNpSURRUUowYWlBSUlBTkJBM1JxSWdNcUFnQWlKeUFubENBREtnSUVJaWNnSjVTU09BSUFJQUpCQW1vaEFpQUdRUUpxSWdZZ0RFY05BQXNMSUFCQkFYRUVRQ0FISUFKQkFuUnFJQWdnQWtFRGRHb2lBaW9DQUNJbklDZVVJQUlxQWdRaUp5QW5sSkk0QWdBTFF3QUFBQUFoSndKQUlBQkJCRWdOQUVFQklRSWdBRUVCZGlJTVFRRnJJZ1pCQVhFaEF5QUVLQUo4SVFnZ0JDZ0NzQUVoQnlBTVFRSkhCRUFnQmtGK2NTRUdBMEFnQnlBQ1FRSjBhaUlNSUFjZ0FDQUNhMEVDZEdvcUFnQWdEQ29DQUpJaUtEZ0NBQ0FISUFKQkFXb2lERUVDZEdvaUNpQUhJQUFnREd0QkFuUnFLZ0lBSUFvcUFnQ1NJaWs0QWdBZ0p5QW9JQ2NnS0dBYklDY2dBaUFJVGhzaUp5QXBJQ2NnS1dBYklDY2dDQ0FNVEJzaEp5QUNRUUpxSVFJZ0NVRUNhaUlKSUFaSERRQUxDeUFEUlEwQUlBY2dBa0VDZEdvaURDQUhJQUFnQW10QkFuUnFLZ0lBSUF3cUFnQ1NJaWc0QWdBZ0p5QW9JQ2NnS0dBYklDY2dBaUFJVGhzaEp3c2dCRUdnQkdvaEdDQUVRWmdFYWlFYlFRQWhBaUFBUVFCTURRQkRBQUIvUTBNQUFIOURJQ2VWSUNkREFBQUFBRnNiSVNrRFFDQUVLQUtZQkNBRUtBS2dCQ0FFS0FLVUJHeHFJQUpxQW44Q2ZTQXBJQVFvQXJBQklBSkJBblJxS2dJQWxDSW52Q0lBUVJkMlFmOEJjU0lIUVpVQlRRUkFJQWRCL1FCTkJIMGdKME1BQUFBQWxBVUNmU0FuSUNlTUlBQkJBRTRiSWlkREFBQUFTNUpEQUFBQXk1SWdKNU1pS0VNQUFBQS9YZ1JBSUNjZ0tKSkRBQUNBdjVJTUFRc2dKeUFva2lJbklDaERBQUFBdjE5RkRRQWFJQ2REQUFDQVA1SUxJaWNnSjR3Z0FFRUFUaHNMSVNjTFF3QUFBQUFnSjBNQUFBQUFYdzBBR2tNQUFIOURJQ2REQUFCL1ExNE5BQm9nSndzaUowTUFBSUJQWFNBblF3QUFBQUJnY1FSQUlDZXBEQUVMUVFBTE9nQUFJQUpCQVdvaUFpQUVLQUlNU0EwQUN3c2dCQ0FFS0FLVUJFRUJhaUlBUVFBZ0FDQUVLQUtjQkVnYk5nS1VCQ0FGUVRCcUlRd0RRQUpBQWtBZ0JDQU9RUXhzYWlJSUxRRDFBVVVOQUNBSUxnSHdBU0lpSUFRb0FneEtEUUFnQkNnQ2xBUWdDQ3dBOUFFaUJ3Si9RUUlnQkNnQ1NDSVdRUVJJRFFBYVFRUWdGa0VQU1EwQUdpQVdRUVZ1UVFGMEN5SWNJQlpxSWhFZ0NDd0E4d0VpQW1wQkFXc2dBbTFzSWlBZ0NDd0E4Z0ZzYXlJU1FRQklCRUFnQkNnQ25BUWdFbW9oRWd0QkFDRUFJQVFvQXFRRVFRQWdCQ2dDcUFRUUd4b0NRQ0FnUVFCTUJFQkJBQ0VYUVFBaERRd0JDeUFIUVFGR1FRUjBJU01nQWtFRmRDRW1RUUFoRFVFQUlSY0RRQ0FBSUFnc0FQUUJiMFVFUUNBRUtBS3NCRUVBSUNZUUd4b0xJQUJCQVdvaEJ5QUlMUUR5QVNJS1FSaDBRUmgxSWdOQkFFb0VRQ0FJTFFEekFTRUNRUUFoQmdOQUlBSkJHSFJCR0hWQkFFb0VRQ0FHSUJKcUlBQWdDbXhxSWdKQkFDQUVLQUtjQkNJRElBSWdBMGdiYXlFa1FRQWhDZ05BSUJzb0FnQWdHQ2dDQUNBa2JHb2lEeUFLUVFWMElnTWdJbW9pRTJvaUFpMEFBQ0lKSUFJdEFBRWlDMDFCQWlBSklBc2dDU0FMU3hzaUNTQUNMUUFDSWd0TEloUWJRUU1nQ1NBTElCUWJJZ2tnQWkwQUF5SUxTeUlVRzBFRUlBa2dDeUFVR3lJSklBSXRBQVFpQzBzaUZCdEJCU0FKSUFzZ0ZCc2lDU0FDTFFBRklndExJaFFiUVFZZ0NTQUxJQlFiSWdrZ0FpMEFCaUlMU3lJVUcwRUhJQUl0QUFjaUZTQUpJQXNnRkJzaUNVSC9BWEZKSWdzYlFRZ2dBaTBBQ0NJVUlBa2dGU0FMR3lJSlFmOEJjVWtpQ3h0QkNTQUNMUUFKSWhVZ0NTQVVJQXNiSWdsQi93RnhTU0lMRzBFS0lBSXRBQW9pRkNBSklCVWdDeHNpQ1VIL0FYRkpJZ3NiUVFzZ0FpMEFDeUlWSUFrZ0ZDQUxHeUlKUWY4QmNVa2lDeHRCRENBQ0xRQU1JaFFnQ1NBVklBc2JJZ2xCL3dGeFNTSUxHMEVOSUFJdEFBMGlGU0FKSUJRZ0N4c2lDVUgvQVhGSklnc2JRUTRnQWkwQURpSVVJQWtnRlNBTEd5SUpRZjhCY1VraUN4dEJEeUFDTFFBUElBa2dGQ0FMRzBIL0FYRkpHeUlVSVFJZ0NDd0E5QUVpQ1VFQlJnUkFJQThnRXlBamFtb2lBaTBBQUNJTElBSXRBQUVpRDAxQkFpQUxJQThnQ3lBUFN4c2lDeUFDTFFBQ0lnOUxJaE1iUVFNZ0N5QVBJQk1iSWdzZ0FpMEFBeUlQU3lJVEcwRUVJQXNnRHlBVEd5SUxJQUl0QUFRaUQwc2lFeHRCQlNBTElBOGdFeHNpQ3lBQ0xRQUZJZzlMSWhNYlFRWWdDeUFQSUJNYklnc2dBaTBBQmlJUFN5SVRHMEVISUFJdEFBY2lGU0FMSUE4Z0V4c2lDMEgvQVhGSklnOGJRUWdnQWkwQUNDSVRJQXNnRlNBUEd5SUxRZjhCY1VraUR4dEJDU0FDTFFBSkloVWdDeUFUSUE4YklndEIvd0Z4U1NJUEcwRUtJQUl0QUFvaUV5QUxJQlVnRHhzaUMwSC9BWEZKSWc4YlFRc2dBaTBBQ3lJVklBc2dFeUFQR3lJTFFmOEJjVWtpRHh0QkRDQUNMUUFNSWhNZ0N5QVZJQThiSWd0Qi93RnhTU0lQRzBFTklBSXRBQTBpRlNBTElCTWdEeHNpQzBIL0FYRkpJZzhiUVE0Z0FpMEFEaUlUSUFzZ0ZTQVBHeUlMUWY4QmNVa2lEeHRCRHlBQ0xRQVBJQXNnRXlBUEcwSC9BWEZKR3lFQ0N5QUhJQUFnQ1c4RWZ5QUpCU0FFS0FLc0JDQURJQlJxYWlJSklBa3RBQUJCQVdvNkFBQWdDQ3dBOUFFTGIwVUVRQ0FFS0FLc0JDQURRUkJ5SUFKcWFpSUNJQUl0QUFCQkFXbzZBQUFMSUFwQkFXb2lDaUFJTEFEekFTSUNTQTBBQ3lBSUxRRHlBU0VEQ3lBR1FRRnFJZ1lnQTBFWWRFRVlkU0lLU0EwQUN3c0NRQ0FJTFFEMEFTSUNRUmgwUVJoMUlnTkJBVW9FUUNBQUlBSndSUTBCQ3dKQUFrQWdDQ3dBOHdFaUFrRUFUQVJBUVFBaEN3d0JDMEVBSVF0QkFDRUdRUUFoQ1NBQUlBTnRJQUpCL3dGeGJDQVJUZzBBQTBBZ0NVRUZkQ0lQUVJCeUlTUkJBQ0VDQTBBZ0NDd0E4Z0ZCQW0xQkdIUkJHSFVpQ2lBRUtBS3NCQ0lESUFJZ0QycHFMUUFBU0FSQUlBUW9BcVFFSUFnc0FQTUJJQUFnQ0N3QTlBRnRiQ0FKYWtFQmRHb2dBam9BQUNBSUxBRHlBVUVDYlVFWWRFRVlkU0VLSUFRb0Fxd0VJUU1nQmtFQmFpRUdDeUFESUFJZ0pHcHFMUUFBSUFwS0JFQWdCQ2dDcEFRZ0NDd0E4d0VnQUNBSUxBRDBBVzFzSUFscVFRRjBhaUFDT2dBQklBWkJBV29oQmdzZ0FrRUJhaUlDUVJCSERRQUxJQXRCQW1vaEN5QUpRUUZxSWdrZ0NDd0E4d0VpQWs0TkFpQVJJQUFnQ0N3QTlBRnRJQUpzSUFscVNnMEFDd3dCQzBFQUlRWUxJQXNnRjJvaEZ5QUdJQTFxSVEwTElBY2lBQ0FnUncwQUN3c2dEYmNnRjdkRUFBQUFBQUFBNkQraVl3MEFBbjlCQWlBRUtBSklJZ0JCQkVnTkFCcEJCQ0FBUVE5SkRRQWFJQUJCQlc1QkFYUUxJUUlnQkNnQ1pDRURJQVZCQURZQy9BRWdCVUVBT2dEMEFTQUZRUUEyQXZBQklBVkJBRG9BNkFFZ0JVRUFOZ0xrQVNBRlFRQTZBTndCSUFWQkFEWUMyQUVnQlVFQU9nRFFBU0FGUVFBMkFzd0JJQVZCQURvQXhBRWdCVUVBTmdMQUFTQUZRUUE2QUxnQklBVkJBRFlDdEFFZ0JVRUFPZ0NzQVNBRlFRQTJBcWdCSUFWQkFEb0FvQUVnQlVFQU5nS2NBU0FGUVFBNkFKUUJJQVZCQURZQ2tBRWdCVUVBT2dDSUFTQUZRUUEyQW9RQklBVkJBRG9BZkNBRlFRQTJBbmdnQlVFQU9nQndJQVZCQURZQ2JDQUZRUUE2QUdRZ0JVRUFOZ0pnSUFWQkFEb0FXQ0FGUVFBMkFsUWdCVUVBT2dCTUlBVkJBRFlDU0NBRlFRQTZBRUFnQlVFQU5nSThJQVZCQURvQU5DQUZJQUk2QUNFZ0JTQUFPZ0FnSUFWQkFEc0JMQ0FGSUFNRWYwRUFCU0FDUWY0QmNTSUhJQUJCL3dGeFFRTnNhaUFIUVJ4c2FrRUJhaEFuSVFOQkFRczZBQ3dnQlNBRE5nSWtJQVZCQURzQk9DQUZJQU0yQWlnZ0JTQU1OZ0k4SUFWQkFEc0JOQ0FGSUF3MkFrZ2dCVUdBQWpzQlFDQUZRUU02QUZrZ0JTQU1OZ0pVSUFWQmdBUTdBVXdnQlNBQUlBSnFJZ2M2QURZZ0JTQUhPZ0JDSUFVZ0FrRUJkQ0lBT2dCT0lBVWdBRG9BV2lBRklBZEIvd0Z4SWdZN0FVUWdCU0FHUVFGMElnTTdBVkFnQlNBRElBQkIvZ0Z4SWdKcUlnTTdBVndnQlVHQUNEc0JaQ0FGSUF3MkFtQWdCVUVBT2dCWUlBVWdBRG9BWmlBRklBdzJBbXdnQlVHQUNqc0JjQ0FGSUFjNkFISWdCU0FNTmdKNElBVkJnQXc3QVh3Z0JTQUFPZ0IrSUFVZ0REWUNoQUVnQlVHQURqc0JpQUVnQlNBQU9nQ0tBU0FGSUF3MkFwQUJJQVZCQ0RvQWxRRWdCU0FDSUFOcUlnYzdBV2dnQlNBQ0lBZHFJZ2M3QVhRZ0JTQUdJQWRxSWdjN0FZQUJJQVVnQWlBSGFpSUhPd0dNQVNBRklBSWdCMm9pQnpzQm1BRWdCVUVBT2dDVUFTQUZJQUE2QUpZQklBVWdERFlDbkFFZ0JTQUFPZ0NpQVNBRlFZQVNPd0dnQVNBRklBdzJBcWdCSUFVZ0FEb0FyZ0VnQlVHQUZEc0JyQUVnQlNBTU5nSzBBU0FGSUFBNkFMb0JJQVZCZ0JZN0FiZ0JJQVZCRERvQXhRRWdCU0FNTmdMQUFTQUZJQUE2QU1ZQklBVWdBaUFIYWlJSE93R2tBU0FGSUFJZ0Iyb2lCenNCc0FFZ0JTQUNJQWRxSWdjN0Fid0JJQVVnQWlBSGFpSUhPd0hJQVNBRlFRMDZBTkVCSUFVZ0REWUN6QUVnQlVFQU9nREVBU0FGSUFJZ0Iyb2lCenNCMUFFZ0JTQUFPZ0RTQVNBRlFRNDZBTjBCSUFVZ0REWUMyQUVnQlVFQU9nRFFBU0FGSUFJZ0Iyb2lCenNCNEFFZ0JTQUFPZ0RlQVNBRlFRODZBT2tCSUFVZ0REWUM1QUVnQlVFQU9nRGNBU0FGSUFJZ0Iyb2lCenNCN0FFZ0JTQUFPZ0RxQVNBRklBSWdCMm83QWZnQklBVkJFRG9BOVFFZ0JTQU1OZ0x3QVNBRlFRQTZBT2dCSUFVZ0FEb0E5Z0VnQlNBTU5nTDhBU0FGUVFBNkFQUUJBa0FnRVVFQVRBMEFRUUFoQWlBY1FRRnJRUUFnRm10SEJFQWdFVUYrY1NFQVFRQWhBd05BSUFRb0FsUWdBbW9nQkNnQ3BBUWdBa0VCZEdvaUJ5MEFBVUVFZENBSExRQUFham9BQUNBQ1FRRnlJZ2NnQkNnQ1ZHb2dCQ2dDcEFRZ0IwRUJkR29pQnkwQUFVRUVkQ0FITFFBQWFqb0FBQ0FDUVFKcUlRSWdBMEVDYWlJRElBQkhEUUFMQ3lBUlFRRnhSUTBBSUFRb0FsUWdBbW9nQkNnQ3BBUWdBa0VCZEdvaUFDMEFBVUVFZENBQUxRQUFham9BQUFzZ0JVRWdhaUFFS0FKVUlnQWdBQ0FGTFFBZ2FpQUVLQUxVQVJBN0lnQkZCRUFDUUNBRUxRQlFSUTBBUVFBaEFpQUVLQUpJUVFCTURRQURRQ0FFS0FMVUFTQUNhaUlISUFKQlAzRkJzQ2hxTFFBQUlBY3RBQUJ6T2dBQUlBSkJBV29pQWlBRUtBSklTQTBBQ3dzQ1FFSEEyUUFvQWdBaUFrVU5BQ0FFS0FKSUlRY2dDQ2dDN0FFaEJpQUZJQTQyQWhnZ0JTQUdOZ0lVSUFVZ0J6WUNFQ0FDUWJFaklBVkJFR29RSEVIQTJRQW9BZ0FpQWtVTkFDQUZJQVFvQXRRQk5nSUFJQUpCNHlRZ0JSQWNDeUFFUVFFNkFLd0JJQVFnQkNnQ1NEWUMwQUVnQkNBSUtBTDBBVFlDNUFFZ0JDQUlLUUxzQVRjQzNBRWdCQ0FPTmdMb0FRc0NRQ0FGTFFBc1JRMEFJQVVvQWlRaUFrVU5BQ0FDRUNFTElBQkZEUUVnRGtFQmFpSU9RUlpIRFFJTUFRc2dEa0VCYWlJT1FSWkhEUUVMQ3lBRlFZQUNhaVFBREFFTFFRQWhBaU1BUWFBQ2F5SURKQUFnQkNnQ2dBUWdCQ2dDaUFRaUFDQUVLQUwwQTJ4QkFuUnFJQVFvQXJnQklBQWdCQ2dDdkFFaUJ5QUFJQWRJRzBFQ2RCQWFHaUFFUVFBZ0JDZ0M5QU1pQUVFQmFpQUFRUUpLR3lJQU5nTDBBd0pBSUFBRVFDQUVMUUJzUlEwQkN5QUVRUUU2QUswQklBUW9BdmdEUVFBZ0JDZ0MvQU5CQW5RUUd4b0NRQUpBQWtBQ1FDQUVLQUtFQkNJT1FRQk1CRUFnQkNnQ0RDRUhEQUVMSUFRb0Fnd2lCMEVBVEEwQklBUW9Bb2dFSVJFZ0JDZ0NnQVFoRnlBSFFYeHhJUTBnQjBFRGNTRUpJQVFvQXZnRElRVWdCMEVCYTBFRFNTRVdBMEFnRnlBQ0lCRnNRUUowYWlFSVFRQWhBRUVBSVFaQkFDRUtJQlpGQkVBRFFDQUZJQVpCQW5RaURHb2lDeUFJSUF4cUtnSUFJQXNxQWdDU09BSUFJQVVnREVFRWNpSUxhaUlTSUFnZ0Myb3FBZ0FnRWlvQ0FKSTRBZ0FnQlNBTVFRaHlJZ3RxSWhJZ0NDQUxhaW9DQUNBU0tnSUFramdDQUNBRklBeEJESElpREdvaUN5QUlJQXhxS2dJQUlBc3FBZ0NTT0FJQUlBWkJCR29oQmlBS1FRUnFJZ29nRFVjTkFBc0xJQWtFUUFOQUlBVWdCa0VDZENJTWFpSUtJQWdnREdvcUFnQWdDaW9DQUpJNEFnQWdCa0VCYWlFR0lBQkJBV29pQUNBSlJ3MEFDd3NnQWtFQmFpSUNJQTVIRFFBTEMwRUFJUVlnQjBFQVNnMEJDeUFFS0FMNEF5RUtEQUVMSUFRb0F2Z0RJUW9nQjBFQmEwRURUd1JBSUFkQmZIRWhBa0VBSVE0RFFDQUtJQVpCQW5RaUFHb2lCU0FGS2dJQVF3QUFnRDZVT0FJQUlBb2dBRUVFY21vaUJTQUZLZ0lBUXdBQWdENlVPQUlBSUFvZ0FFRUljbW9pQlNBRktnSUFRd0FBZ0Q2VU9BSUFJQW9nQUVFTWNtb2lBQ0FBS2dJQVF3QUFnRDZVT0FJQUlBWkJCR29oQmlBT1FRUnFJZzRnQWtjTkFBc0xJQWRCQTNFaUFrVU5BRUVBSVFBRFFDQUtJQVpCQW5ScUlnVWdCU29DQUVNQUFJQStsRGdDQUNBR1FRRnFJUVlnQUVFQmFpSUFJQUpIRFFBTEN5QUVLQUtrQVNFQUlBUW9BcHdCSVFJZ0J5QUVLQUtVQVNBS0lBZEJBblFRR2lBQ0lBQVFQU0FFS0FJTUlnSkJBRXdOQUNBRUtBS3dBU0VBSUFRb0FwUUJJUWRCQUNFR0lBSkJBVWNFUUNBQ1FYNXhJUVZCQUNFT0EwQWdBQ0FHUVFKMGFpQUhJQVpCQTNScUlnZ3FBZ0FpSnlBbmxDQUlLZ0lFSWljZ0o1U1NPQUlBSUFBZ0JrRUJjaUlJUVFKMGFpQUhJQWhCQTNScUlnZ3FBZ0FpSnlBbmxDQUlLZ0lFSWljZ0o1U1NPQUlBSUFaQkFtb2hCaUFPUVFKcUlnNGdCVWNOQUFzTElBSkJBWEVFUUNBQUlBWkJBblJxSUFjZ0JrRURkR29pQUNvQ0FDSW5JQ2VVSUFBcUFnUWlKeUFubEpJNEFnQUxJQUpCQkVnTkFFRUJJUVlnQWtFQmRpSUFRUUZySWdWQkFYRWhDQ0FFS0FLd0FTRUhJQUJCQWtjRVFDQUZRWDV4SVFWQkFDRUFBMEFnQnlBR1FRSjBhaUlNSUFjZ0FpQUdhMEVDZEdvcUFnQWdEQ29DQUpJNEFnQWdCeUFHUVFGcUlneEJBblJxSWdvZ0J5QUNJQXhyUVFKMGFpb0NBQ0FLS2dJQWtqZ0NBQ0FHUVFKcUlRWWdBRUVDYWlJQUlBVkhEUUFMQ3lBSVJRMEFJQWNnQmtFQ2RHb2lBQ0FISUFJZ0JtdEJBblJxS2dJQUlBQXFBZ0NTT0FJQUN3SkFJQVFvQW9RQklnQkJBRXdOQUNBRUtBS01CQ0FFS0FJTUlnSWdCQ2dDakFFZ0FHdHNRUUowYWlBRUtBSzRBU0FDUVFKMEVCb2FJQVFnQkNnQ2hBRWlBRUVCYXpZQ2hBRWdBRUVCU2cwQUlBUkJBVG9BYlFzZ0JDMEFiUVJBUWNEWkFDZ0NBQ0lBQkVCQjlTRkJHeUFBRUNnTElBUW9BZ3hCRUcwaEd5QURRZEFBYWlFSlFRQWhGd0pBQWtBRFFBSkFJQVFnRjBFTWJHb2lFUzBBOVFGRkRRQWdFUzBBOUFGQkFrWU5BQ0FFS0FKMElCRXVBZkFCUncwQUlBUW9BckFCUVFBZ0JDZ0N0QUZCQW5RUUd4b2dCQ0FFS0FJNElnQkJCSFFpQWpZQ2lBRWdCQ0FDTmdLQUFTQUFRUUJNRFFBRFFFRUFJUVVnQWlJTVFRRnJJZ0loRGtFQUlRZEJBQ0VXQWtBQ1FBSkFJQXdnQkNnQ2VFRUVkRW9OQUFOQUlBUW9BbGdnQlVFQmFpSUlJQkVzQVBNQmJFd05BU0FFS0FLVUFTQUVLQUtNQkNBT0lCdHNRUUowYWlBRUtBSU1RUUowRUJvYUlBUW9BZ3doQ2dKQUlCRXNBUElCSWlCQkFrZ05BQ0FLUVFCTURRQWdDa0YrY1NFUFFRRWhEU0FLUVFGeElTSWdCQ2dDbEFFaEN5QUVLQUtNQkNFU0EwQWdEVUVFZENBT2FpQWJiQ0VZUVFBaEJrRUFJUUFnQ2tFQlJ3UkFBMEFnQ3lBR1FRSjBhaUljSUJJZ0JpQVlha0VDZEdvcUFnQWdIQ29DQUpJNEFnQWdDeUFHUVFGeUloeEJBblJxSWlNZ0VpQVlJQnhxUVFKMGFpb0NBQ0FqS2dJQWtqZ0NBQ0FHUVFKcUlRWWdBRUVDYWlJQUlBOUhEUUFMQ3lBaUJFQWdDeUFHUVFKMGFpSUFJQklnQmlBWWFrRUNkR29xQWdBZ0FDb0NBSkk0QWdBTElBMUJBV29pRFNBZ1J3MEFDd3NnQ2lBRUtBS1VBU0FFS0FLY0FTQUVLQUtrQVJBOUFrQWdCQ2dDRENJS1FRQk1EUUFnQkNnQ3NBRWhBQ0FFS0FLVUFTRU5RUUFoQmlBS1FRRkhCRUFnQ2tGK2NTRUxRUUFoRGdOQUlBQWdCa0VDZEdvZ0RTQUdRUU4wYWlJU0tnSUFJaWNnSjVRZ0Vpb0NCQ0luSUNlVWtqZ0NBQ0FBSUFaQkFYSWlFa0VDZEdvZ0RTQVNRUU4wYWlJU0tnSUFJaWNnSjVRZ0Vpb0NCQ0luSUNlVWtqZ0NBQ0FHUVFKcUlRWWdEa0VDYWlJT0lBdEhEUUFMQ3lBS1FRRnhCRUFnQUNBR1FRSjBhaUFOSUFaQkEzUnFJZ0FxQWdBaUp5QW5sQ0FBS2dJRUlpY2dKNVNTT0FJQUN5QUtRUVJJRFFCQkFTRUdJQXBCQVhZaUFFRUJheUlOUVFGeElRc2dCQ2dDc0FFaERpQUFRUUpIQkVBZ0RVRitjU0VOUVFBaEFBTkFJQTRnQmtFQ2RHb2lFaUFPSUFvZ0JtdEJBblJxS2dJQUlCSXFBZ0NTT0FJQUlBNGdCa0VCYWlJU1FRSjBhaUlZSUE0Z0NpQVNhMEVDZEdvcUFnQWdHQ29DQUpJNEFnQWdCa0VDYWlFR0lBQkJBbW9pQUNBTlJ3MEFDd3NnQzBVTkFDQU9JQVpCQW5ScUlnQWdEaUFLSUFaclFRSjBhaW9DQUNBQUtnSUFramdDQUF0QkFDRUtRUUFoQUNBUkxBRHpBU0lPUVFCS0JFQURRQUovSUFRcUFpaTdJQVFxQWlRZ0VTNEI4QUd5bEx1aUVEZ2dDa0VFZExlZ0lqQ1pSQUFBQUFBQUFPQkJZd1JBSURDcURBRUxRWUNBZ0lCNEN5RUdRUTlCRGtFTlFReEJDMEVLUVFsQkNFRUhRUVpCQlVFRVFRTkJBaUFFS0FLd0FTQUdRUUowYWlJR0tnSUF1eUl3UkFBQUFBQUFBQUFBSURCRUFBQUFBQUFBQUFCa0d5SXdJQVlxQWdTN0lqRmpJZzBnTVNBd0lBMGJJakFnQmlvQ0NMc2lNV01pRFJzZ01TQXdJQTBiSWpBZ0Jpb0NETHNpTVdNaURSc2dNU0F3SUEwYklqQWdCaW9DRUxzaU1XTWlEUnNnTVNBd0lBMGJJakFnQmlvQ0ZMc2lNV01pRFJzZ01TQXdJQTBiSWpBZ0Jpb0NHTHNpTVdNaURSc2dNU0F3SUEwYklqQWdCaW9DSExzaU1XTWlEUnNnTVNBd0lBMGJJakFnQmlvQ0lMc2lNV01pRFJzZ01TQXdJQTBiSWpBZ0Jpb0NKTHNpTVdNaURSc2dNU0F3SUEwYklqQWdCaW9DS0xzaU1XTWlEUnNnTVNBd0lBMGJJakFnQmlvQ0xMc2lNV01pRFJzZ01TQXdJQTBiSWpBZ0Jpb0NNTHNpTVdNaURSc2dNU0F3SUEwYklqQWdCaW9DTkxzaU1XTWlEUnNnTVNBd0lBMGJJakFnQmlvQ09Mc2lNV01pRFJzZ0Jpb0NQTHNnTVNBd0lBMGJaQnNoQmlBS1FRRnhCSDhnQkNnQ1ZDQUZJQTVzSUFwQkFYWnFhaUFHUVFSMElBQnFPZ0FBUVFBRklBWUxJUUFnQ2tFQmFpSUtJQkVzQVBNQklnNUJBWFJJRFFBTEN5QVdJQVFvQWp3aUFDQUZJQTVzVG5KRkJFQWdCQ2dDWENFR1FRQWhGaUFEUVFBMkFwd0NJQU5CQURvQWxBSWdBMEVBTmdLUUFpQURRUUE2QUlnQ0lBTkJBRFlDaEFJZ0EwRUFPZ0Q4QVNBRFFRQTJBdmdCSUFOQkFEb0E4QUVnQTBFQU5nTHNBU0FEUVFBNkFPUUJJQU5CQURZQzRBRWdBMEVBT2dEWUFTQURRUUEyQXRRQklBTkJBRG9BekFFZ0EwRUFOZ0xJQVNBRFFRQTZBTUFCSUFOQkFEWUN2QUVnQTBFQU9nQzBBU0FEUVFBMkFyQUJJQU5CQURvQXFBRWdBMEVBTmdLa0FTQURRUUE2QUp3QklBTkJBRFlDbUFFZ0EwRUFPZ0NRQVNBRFFRQTJBb3dCSUFOQkFEb0FoQUVnQTBFQU5nS0FBU0FEUVFBNkFIZ2dBMEVBTmdKMElBTkJBRG9BYkNBRFFRQTJBbWdnQTBFQU9nQmdJQU5CQURZQ1hDQURRUUE2QUZRZ0F5QUFRUUZySWdvNkFFRWdBMEVCT2dCQUlBTkJBRHNCVEVFQUlRNGdCa1VFUUVFQklRNGdDa0gvQVhFaUJpQUdRUnhzYWtFRWFoQW5JUVlMSUFNZ0Rqb0FUQ0FESUFZMkFrUWdBMEVBT3dGWUlBTWdCallDU0NBRElBQTZBRllnQXlBSk5nSmNJQU5CQURzQlZDQURJQUE2QUdJZ0F5QUpOZ0pvSUFOQmdBSTdBV0FnQTBFRE9nQjVJQU1nQ1RZQ2RDQURRWUFFT3dGc0lBTWdDa0VCZENJR09nQnVJQU1nQmpvQWVpQURJQUJCL3dGeElnNDdBV1FnQXlBT1FRRjBJZzA3QVhBZ0F5QU5JQVpCL2dGeElncHFJZzA3QVh3Z0EwR0FDRHNCaEFFZ0F5QUpOZ0tBQVNBRFFRQTZBSGdnQXlBR09nQ0dBU0FESUFrMkFvd0JJQU5CZ0FvN0FaQUJJQU1nQURvQWtnRWdBeUFKTmdLWUFTQURRWUFNT3dHY0FTQURJQVk2QUo0QklBTWdDVFlDcEFFZ0EwR0FEanNCcUFFZ0F5QUdPZ0NxQVNBRElBazJBckFCSUFOQkNEb0F0UUVnQXlBS0lBMXFJZ0E3QVlnQklBTWdBQ0FLYWlJQU93R1VBU0FESUFBZ0Rtb2lBRHNCb0FFZ0F5QUFJQXBxSWdBN0Fhd0JJQU1nQUNBS2FpSUFPd0c0QVNBRFFRQTZBTFFCSUFNZ0Jqb0F0Z0VnQXlBSk5nSzhBU0FESUFZNkFNSUJJQU5CZ0JJN0FjQUJJQU1nQ1RZQ3lBRWdBeUFHT2dET0FTQURRWUFVT3dITUFTQURJQWsyQXRRQklBTWdCam9BMmdFZ0EwR0FGanNCMkFFZ0EwRU1PZ0RsQVNBRElBazJBdUFCSUFNZ0Jqb0E1Z0VnQXlBQUlBcHFJZ0E3QWNRQklBTWdBQ0FLYWlJQU93SFFBU0FESUFBZ0Ntb2lBRHNCM0FFZ0F5QUFJQXBxSWdBN0FlZ0JJQU5CRFRvQThRRWdBeUFKTmdMc0FTQURRUUE2QU9RQklBTWdBQ0FLYWlJQU93SDBBU0FESUFZNkFQSUJJQU5CRGpvQS9RRWdBeUFKTmdMNEFTQURRUUE2QVBBQklBTWdBQ0FLYWlJQU93R0FBaUFESUFZNkFQNEJJQU5CRHpvQWlRSWdBeUFKTmdLRUFpQURRUUE2QVB3QklBTWdBQ0FLYWlJQU93R01BaUFESUFZNkFJb0NJQU1nQUNBS2Fqc0JtQUlnQTBFUU9nQ1ZBaUFESUFrMkFwQUNJQU5CQURvQWlBSWdBeUFHT2dDV0FpQURJQWsyQXB3Q0lBTkJBRG9BbEFKQkZ5RUdBa0FnQTBGQWF5QUVLQUpVSWdBZ0FDQURMUUJBYWlBRUtBTFVBUkE3RFFBZ0JDZ0MxQUV0QUFBaUFFRUJhMEgvQVhGQml3RkxEUUFnQkNnQ1BDRUhRUmRCQUNBRUtBSjRJZ1lnRVN3QThnRWdFU3dBOHdFaUNnSi9RUUlnQUVFRVNRMEFHa0VFSUFCQkQwa05BQm9nQUVFRmJrRUJkQXNnQUNBSGFtcHFRUUZySUFwdGJDSUhTQ0FHSUFjZ0JDZ0NPRUVCZEdwS2NpSUhHeUVHSUFkRklSWWdBQ0VIQ3dKQUlBTXRBRXhGRFFBZ0F5Z0NSQ0lBUlEwQUlBQVFJUXNnQmcwQ0lBUW9BandoQUFzQ2YwRUNJQWRCQkVnTkFCcEJCQ0FIUVE5SkRRQWFJQWRCQlc1QkFYUUxJUVlDUUNBV0JFQWdBQ0FIYWlBR2FrRUJhaUFGSUJFc0FQTUJiRWdOQkNBSVFZQUlSZzBFREFFTFFRQWhGaUFJUVlBSVJnMEVDeUFJSWdVZ0VTd0E4Z0ZzUVFSMElBSnFJZzRnQkNnQ2VFRUVkRWdOQUFzTElCWkZEUUVMSUFRb0FtUWhDaUFEUVFBMkFwd0NJQU5CQURvQWxBSWdBMEVBTmdLUUFpQURRUUE2QUlnQ0lBTkJBRFlDaEFJZ0EwRUFPZ0Q4QVNBRFFRQTJBdmdCSUFOQkFEb0E4QUVnQTBFQU5nTHNBU0FEUVFBNkFPUUJJQU5CQURZQzRBRWdBMEVBT2dEWUFTQURRUUEyQXRRQklBTkJBRG9BekFFZ0EwRUFOZ0xJQVNBRFFRQTZBTUFCSUFOQkFEWUN2QUVnQTBFQU9nQzBBU0FEUVFBMkFyQUJJQU5CQURvQXFBRWdBMEVBTmdLa0FTQURRUUE2QUp3QklBTkJBRFlDbUFFZ0EwRUFPZ0NRQVNBRFFRQTJBb3dCSUFOQkFEb0FoQUVnQTBFQU5nS0FBU0FEUVFBNkFIZ2dBMEVBTmdKMElBTkJBRG9BYkNBRFFRQTJBbWdnQTBFQU9nQmdJQU5CQURZQ1hDQURRUUE2QUZRZ0F3Si9RUUlnQjBFRVNBMEFHa0VFSUFkQkQwa05BQm9nQjBFRmJrRUJkQXNpQURvQVFTQURJQWM2QUVBZ0EwRUFPd0ZNSUFNZ0NnUi9RUUFGSUFCQi9nRnhJZ1VnQjBIL0FYRkJBMnhxSUFWQkhHeHFRUUZxRUNjaENrRUJDem9BVENBRElBbzJBa1FnQTBFQU93RllJQU1nQ2pZQ1NDQURJQWsyQWx3Z0EwRUFPd0ZVSUFNZ0NUWUNhQ0FEUVlBQ093RmdJQU5CQXpvQWVTQURJQWsyQW5RZ0EwR0FCRHNCYkNBRElBQWdCMm9pQ0RvQVZpQURJQWc2QUdJZ0F5QUFRUUYwSWdBNkFHNGdBeUFBT2dCNklBTWdDRUgvQVhFaUJqc0JaQ0FESUFaQkFYUWlDanNCY0NBRElBb2dBRUgrQVhFaUJXb2lDanNCZkNBRFFZQUlPd0dFQVNBRElBazJBb0FCSUFOQkFEb0FlQ0FESUFBNkFJWUJJQU1nQ1RZQ2pBRWdBMEdBQ2pzQmtBRWdBeUFJT2dDU0FTQURJQWsyQXBnQklBTkJnQXc3QVp3QklBTWdBRG9BbmdFZ0F5QUpOZ0trQVNBRFFZQU9Pd0dvQVNBRElBQTZBS29CSUFNZ0NUWUNzQUVnQTBFSU9nQzFBU0FESUFVZ0Ntb2lDRHNCaUFFZ0F5QUZJQWhxSWdnN0FaUUJJQU1nQmlBSWFpSUlPd0dnQVNBRElBVWdDR29pQ0RzQnJBRWdBeUFGSUFocUlnZzdBYmdCSUFOQkFEb0F0QUVnQXlBQU9nQzJBU0FESUFrMkFyd0JJQU1nQURvQXdnRWdBMEdBRWpzQndBRWdBeUFKTmdMSUFTQURJQUE2QU00QklBTkJnQlE3QWN3QklBTWdDVFlDMUFFZ0F5QUFPZ0RhQVNBRFFZQVdPd0hZQVNBRFFRdzZBT1VCSUFNZ0NUWUM0QUVnQXlBQU9nRG1BU0FESUFVZ0NHb2lDRHNCeEFFZ0F5QUZJQWhxSWdnN0FkQUJJQU1nQlNBSWFpSUlPd0hjQVNBRElBVWdDR29pQ0RzQjZBRWdBMEVOT2dEeEFTQURJQWsyQXV3QklBTkJBRG9BNUFFZ0F5QUZJQWhxSWdnN0FmUUJJQU1nQURvQThnRWdBMEVPT2dEOUFTQURJQWsyQXZnQklBTkJBRG9BOEFFZ0F5QUZJQWhxSWdnN0FZQUNJQU1nQURvQS9nRWdBMEVQT2dDSkFpQURJQWsyQW9RQ0lBTkJBRG9BL0FFZ0F5QUZJQWhxSWdnN0FZd0NJQU1nQURvQWlnSWdBeUFGSUFocU93R1lBaUFEUVJBNkFKVUNJQU1nQ1RZQ2tBSWdBMEVBT2dDSUFpQURJQUE2QUpZQ0lBTWdDVFlDbkFJZ0EwRUFPZ0NVQWlBRFFVQnJJQVFvQWxRZ0JDZ0NQR29pQUNBQUlBTXRBRUJxSUFRb0F0UUJFRHRGSUFkQkFFcHhJZ0FFUUFKQUlBUXRBRkJGRFFCQkFDRUdJQWRCQVVjRVFDQUhRWDV4SVFWQkFDRUtBMEFnQkNnQzFBRWdCbW9pQ0NBR1FUNXhRYkFvYWkwQUFDQUlMUUFBY3pvQUFDQUdRUUZ5SWdnZ0JDZ0MxQUZxSWc0Z0NFRS9jVUd3S0dvdEFBQWdEaTBBQUhNNkFBQWdCa0VDYWlFR0lBcEJBbW9pQ2lBRlJ3MEFDd3NnQjBFQmNVVU5BQ0FFS0FMVUFTQUdhaUlGSUFaQlAzRkJzQ2hxTFFBQUlBVXRBQUJ6T2dBQUN3SkFRY0RaQUNnQ0FDSUZSUTBBSUJFb0F1d0JJUWdnQXlBWE5nSTRJQU1nQ0RZQ05DQURJQWMyQWpBZ0JVR3hJeUFEUVRCcUVCeEJ3TmtBS0FJQUlnVkZEUUFnQXlBRUtBTFVBVFlDSUNBRlFlTWtJQU5CSUdvUUhBc2dCQ0FITmdMUUFTQUVRUUU2QUt3QklBUWdFU2dDOUFFMkF1UUJJQVFnRVNrQzdBRTNBdHdCSUFRZ0Z6WUM2QUVMQWtBZ0F5MEFURVVOQUNBREtBSkVJZ2RGRFFBZ0J4QWhDeUFBRFFRTElBUWdCQ2dDZ0FGQkFXczJBb0FCSUF4QkFVb05BQXNMSUJkQkFXb2lGMEVXUncwQUN5QUVRUUEyQW93QlFjRFpBQ2dDQUNJQUJFQWdBeUFFS0FMVUFTMEFBRFlDRUNBQVFhVWtJQU5CRUdvUUhBc2dCRUYvTmdLTUFTQUVRWDgyQXRBQkRBRUxJQVJCQURZQ2pBRUxJQVJCQURzQmJDQUVLQUt3QVVFQUlBUW9BclFCUVFKMEVCc2FJQVJCQURZQ2dBRWdCRUVBTmdLSUFRdEJBQ0VGQWtBZ0JDMEFiRVVFUUFOQUFrQWdCQ0FGUVF4c2FpSUFMUUQxQVVVTkFDQUVLQUkwSWdKQkFFb0VRQ0FBTGdId0FiSWhLU0FFS0FJc0lRZ2dCQ29DUUNFcUlBUW9BckFCSVFjZ0JDb0NNQ0VySUFRcUFpUWhMQ0FFS2dJb3V5RXdRUUFoQmlBQ0lRQURRQ0FxSUFjZ0NBSi9JREFnTENBcGxDQXJJQWF5bEpLN29oQTRJakdaUkFBQUFBQUFBT0JCWXdSQUlER3FEQUVMUVlDQWdJQjRDeUlNYWtFQ2RHb3FBZ0NVSVNjZ0J5QU1RUUowYWlvQ0FDRW9Ba0FDUUNBR1FRRnhSUVJBSUNjZ0tHQU5BUXdDQ3lBbklDaGZSUTBCQ3lBQVFRRnJJUUFMSUFaQkFXb2lCaUFDUncwQUN5QUFJQUpIRFFFTElBUWdCRUhzQVdvaUJ5QUZRUXhzYWk0QkJEWUNkQ0FFSUFRb0FuQWlBRUVCYWpZQ2NDQUFRUUJJRFFOQkFDRUFRY0RaQUNnQ0FDSUNCRUJCMnlGQkdTQUNFQ2dMSUFSQkFUb0FiQ0FFS0FMVUFVRUFJQVFvQXRnQkVCc2FJQVFvQWpnaEJVRUFJUVlEUUFKQUlBUWdCa0VNYkdvaUFpMEE5UUZGRFFBZ0Fpd0E5QUVpQ0VFQlNnMEFJQUlzQVBJQklBaHNJZ0lnQUNBQUlBSklHeUVBQ3lBR1FRRnFJZ1pCRmtjTkFBc2dCeEE4SVFJZ0JFRUFOZ0p3SUFSQnhBRWdBbTFCQVdvZ0FHd2dCVUVCZEdvaUFEWUNqQUVnQkNBQU5nSjRJQVFnQURZQ2hBRU1Bd3NnQlVFQmFpSUZRUlpIRFFBTElBUkJBRFlDY0F3QkMwRUJJUUlDUUFKQUEwQUNRQ0FFSUFWQkRHeHFJZ0F0QVBVQkJFQWdCQ2dDTkNJSFFRQk1EUUVnQUM0QjhBR3lJU2tnQkNnQ0xDRU1JQVFxQWtBaEtpQUVLQUt3QVNFSUlBUXFBakFoS3lBRUtnSWtJU3dnQkNvQ0tMc2hNRUVBSVFZZ0J5RUFBMEFnS2lBSUlBd0NmeUF3SUN3Z0taUWdLeUFHc3BTU3U2SVFPQ0l4bVVRQUFBQUFBQURnUVdNRVFDQXhxZ3dCQzBHQWdJQ0FlQXNpQ21wQkFuUnFLZ0lBbENFbklBZ2dDa0VDZEdvcUFnQWhLQUpBQWtBZ0JrRUJjVVVFUUNBbklDaGZEUUVNQWdzZ0p5QW9ZRVVOQVFzZ0FFRUJheUVBQ3lBR1FRRnFJZ1lnQjBjTkFBc2dBQ0FIUmcwQkN5QUZRUlZKSVFJZ0JVRUJhaUlGUVJaSERRRU1BZ3NMSUFJTkFRc2dCRUVBTmdKd0RBRUxJQVFnQkNnQ2NDSUFRUUZxTmdKd0lBQkJBRWdOQUNBRUtBS01BVUVDU0EwQUlBUWdCQ2dDZUNBRUtBS0VBU0lBYTBFQmFpSUNOZ0o0UWNEWkFDZ0NBQ0lIQkVBZ0F5QUNOZ0lFSUFNZ0FEWUNBQ0FIUWFBZUlBTVFIQXNnQkVFQk5nS0VBU0FFUVFBMkFuQUxJQU5Cb0FKcUpBQUxBa0FnRUNBRUtBSU1JZ2hySWd4QkFFd05BQ0FFS0FLNEFTRUNRUUFoQjBFQUlRQWdFQ0FJUVg5emFrRURUd1JBSUF4QmZIRWhCa0VBSVFVRFFDQUNJQUJCQW5ScUlBSWdBQ0FJYWtFQ2RHb3FBZ0E0QWdBZ0FpQUFRUUZ5SWdOQkFuUnFJQUlnQXlBSWFrRUNkR29xQWdBNEFnQWdBaUFBUVFKeUlnTkJBblJxSUFJZ0F5QUlha0VDZEdvcUFnQTRBZ0FnQWlBQVFRTnlJZ05CQW5ScUlBSWdBeUFJYWtFQ2RHb3FBZ0E0QWdBZ0FFRUVhaUVBSUFWQkJHb2lCU0FHUncwQUN3c2dERUVEY1NJRlJRMEFBMEFnQWlBQVFRSjBhaUFDSUFBZ0NHcEJBblJxS2dJQU9BSUFJQUJCQVdvaEFDQUhRUUZxSWdjZ0JVY05BQXNMSUI0Z0dtc2hIaUFhSUIxcUlSMGdCQ0FJSUF4cklnQTJBcEFCREFFTEN5QUVJQUlnRUdzMkFwQUJDeUFmUVJCcUpBQUNRQ0FEUlFSQVFYOGhBRUhBMlFBb0FnQWlBa1VOQVNBaElBRTJBZ0FnQWtHZUhTQWhFQndNQVF0QkFDRUFRY3paQUMwQUFFVUVRRUhFMlFCQ0FEY0NBRUhNMlFCQkFUb0FBQXNnQkNnQzBBRWlBVVVOQUNBRVFRQTJBdEFCUVg4aEFDQUJRWDlHRFFBZ0JDZ0MxQUVoQUVISTJRQWdBVFlDQUVIRTJRQWdBRFlDQUNBQlFRQktCRUJCc05jQUlBQWdBUkFhR2dzZ0FTRUFDeUFoUVJCcUpBQWdBRUVBU2dSQUlCbEJzTmNBTmdJTUlCa2dBRFlDQ0VHNEppQVpRUWhxRUFZTUFRc2dHVUd3MXdBMkFnd2dHVUVBTmdJSVFiZ21JQmxCQ0dvUUJnczJBZ0FnR1VFUWFpUUFDNzBCQVFSL0l3QkJJR3NpQXlRQUlBSW9BZ0FpQkVGd1NRUkFBa0FDUUNBRVFRdFBCRUFnQkVFUWFrRndjU0lHRUIwaEJTQURJQVpCZ0lDQWdIaHlOZ0lRSUFNZ0JUWUNDQ0FESUFRMkFnd01BUXNnQXlBRU9nQVRJQU5CQ0dvaEJTQUVSUTBCQ3lBRklBSkJCR29nQkJBYUdnc2dCQ0FGYWtFQU9nQUFJQU5CR0dvZ0FTQURRUWhxSUFBUkFBQWdBeWdDR0JBS0lBTW9BaGdpQUJBSklBTXNBQk5CQUVnRVFDQURLQUlJRUNFTElBTkJJR29rQUNBQUR3c1FOQUFMb1FRQkIzOGpBRUVRYXlJSUpBQWdBU0FDS0FJQUlBSWdBaTBBQ3lJRlFSaDBRUmgxUVFCSUlnWWJJQUlvQWdRZ0JTQUdHeUFESUFSQkFFRUJFRlFoQlFKQUFrQkJvTmNBTFFBQVFRRnhEUUJCb05jQUVDTkZEUUJCbE5jQVFnQTNBZ0JCbk5jQVFRQTJBZ0FnQlFSQUlBVkJBRWdOQWtHVTF3QWdCUkFkSWdZMkFnQkJuTmNBSUFVZ0Jtb2lDVFlDQUNBR1FRQWdCUkFiR2tHWTF3QWdDVFlDQUF0Qm9OY0FFQ0lMQWtBQ1FDQUZRWmpYQUNnQ0FDSUhRWlRYQUNnQ0FDSUdheUlKU3dSQUlBVWdDV3NpQzBHYzF3QW9BZ0FpQ2lBSGEwMEVRRUdZMXdBZ0N3Ui9JQWRCQUNBTEVCc2dDMm9GSUFjTE5nSUFEQU1MSUFWQkFFZ05BU0FGSUFvZ0Jtc2lCMEVCZENJS0lBVWdDa3NiUWYvLy8vOEhJQWRCLy8vLy93TkpHeUlLRUIwaUJ5QUpha0VBSUFzUUd4b2dDVUVBU2dSQUlBY2dCaUFKRUJvYUMwR2Mxd0FnQnlBS2FqWUNBRUdZMXdBZ0JTQUhhallDQUVHVTF3QWdCellDQUNBR1JRMENJQVlRSVF3Q0N5QUZJQWxQRFFGQm1OY0FJQVVnQm1vMkFnQU1BUXNRTkFBTElBZ2dBU0FDS0FJQUlBSWdBaTBBQ3lJQlFSaDBRUmgxUVFCSUlnWWJJQUlvQWdRZ0FTQUdHeUFESUFSQmxOY0FLQUlBUVFBUVZDSUNOZ0lFSUFnZ0JUWUNBQ01BUVJCcklnRWtBQ0FCSUFnMkFneEI4TlVBUVlvZUlBZ1FRaUFCUVJCcUpBQWdDRUdVMXdBb0FnQTJBZ3dnQ0NBQ05nSUlJQUJCdUNZZ0NFRUlhaEFHTmdJQUlBaEJFR29rQUE4TEVEUUFDeUlCQVg0Z0FTQUNyU0FEclVJZ2hvUWdCQ0FBRVFzQUlnVkNJSWluRUJNZ0JhY0xHZ0FnQUNBQktBSUlJQVVRSUFSQUlBRWdBaUFESUFRUU5nc0xOd0FnQUNBQktBSUlJQVVRSUFSQUlBRWdBaUFESUFRUU5nOExJQUFvQWdnaUFDQUJJQUlnQXlBRUlBVWdBQ2dDQUNnQ0ZCRUdBQXVUQWdFR2Z5QUFJQUVvQWdnZ0JSQWdCRUFnQVNBQ0lBTWdCQkEyRHdzZ0FTMEFOU0VISUFBb0Fnd2hCaUFCUVFBNkFEVWdBUzBBTkNFSUlBRkJBRG9BTkNBQVFSQnFJZ2tnQVNBQ0lBTWdCQ0FGRURVZ0J5QUJMUUExSWdweUlRY2dDQ0FCTFFBMElndHlJUWdDUUNBR1FRSklEUUFnQ1NBR1FRTjBhaUVKSUFCQkdHb2hCZ05BSUFFdEFEWU5BUUpBSUFzRVFDQUJLQUlZUVFGR0RRTWdBQzBBQ0VFQ2NRMEJEQU1MSUFwRkRRQWdBQzBBQ0VFQmNVVU5BZ3NnQVVFQU93RTBJQVlnQVNBQ0lBTWdCQ0FGRURVZ0FTMEFOU0lLSUFkeUlRY2dBUzBBTkNJTElBaHlJUWdnQmtFSWFpSUdJQWxKRFFBTEN5QUJJQWRCL3dGeFFRQkhPZ0ExSUFFZ0NFSC9BWEZCQUVjNkFEUUxwd0VBSUFBZ0FTZ0NDQ0FFRUNBRVFBSkFJQUVvQWdRZ0FrY05BQ0FCS0FJY1FRRkdEUUFnQVNBRE5nSWNDdzhMQWtBZ0FDQUJLQUlBSUFRUUlFVU5BQUpBSUFJZ0FTZ0NFRWNFUUNBQktBSVVJQUpIRFFFTElBTkJBVWNOQVNBQlFRRTJBaUFQQ3lBQklBSTJBaFFnQVNBRE5nSWdJQUVnQVNnQ0tFRUJhallDS0FKQUlBRW9BaVJCQVVjTkFDQUJLQUlZUVFKSERRQWdBVUVCT2dBMkN5QUJRUVEyQWl3TEM0Z0NBQ0FBSUFFb0FnZ2dCQkFnQkVBQ1FDQUJLQUlFSUFKSERRQWdBU2dDSEVFQlJnMEFJQUVnQXpZQ0hBc1BDd0pBSUFBZ0FTZ0NBQ0FFRUNBRVFBSkFJQUlnQVNnQ0VFY0VRQ0FCS0FJVUlBSkhEUUVMSUFOQkFVY05BaUFCUVFFMkFpQVBDeUFCSUFNMkFpQUNRQ0FCS0FJc1FRUkdEUUFnQVVFQU93RTBJQUFvQWdnaUFDQUJJQUlnQWtFQklBUWdBQ2dDQUNnQ0ZCRUdBQ0FCTFFBMUJFQWdBVUVETmdJc0lBRXRBRFJGRFFFTUF3c2dBVUVFTmdJc0N5QUJJQUkyQWhRZ0FTQUJLQUlvUVFGcU5nSW9JQUVvQWlSQkFVY05BU0FCS0FJWVFRSkhEUUVnQVVFQk9nQTJEd3NnQUNnQ0NDSUFJQUVnQWlBRElBUWdBQ2dDQUNnQ0dCRUVBQXNMd1FFQkJIOGpBRUVnYXlJRkpBQWdBaWdDQUNJR1FYQkpCRUFDUUFKQUlBWkJDMDhFUUNBR1FSQnFRWEJ4SWdnUUhTRUhJQVVnQ0VHQWdJQ0FlSEkyQWhBZ0JTQUhOZ0lJSUFVZ0JqWUNEQXdCQ3lBRklBWTZBQk1nQlVFSWFpRUhJQVpGRFFFTElBY2dBa0VFYWlBR0VCb2FDeUFHSUFkcVFRQTZBQUFnQlVFWWFpQUJJQVZCQ0dvZ0F5QUVJQUFSQkFBZ0JTZ0NHQkFLSUFVb0FoZ2lBQkFKSUFVc0FCTkJBRWdFUUNBRktBSUlFQ0VMSUFWQklHb2tBQ0FBRHdzUU5BQUxMUUVCZjBFa0VCMGlBRUlBTndNQUlBQkJBRFlDSUNBQVFnQTNBeGdnQUVJQU53TVFJQUJDQURjRENDQUFDd3U4VEJzQVFZQUlDNklnTFNzZ0lDQXdXREI0QUMwd1dDc3dXQ0F3V0Mwd2VDc3dlQ0F3ZUFCellXMXdiR1ZHYjNKdFlYUlBkWFFBYzJGdGNHeGxVbUYwWlU5MWRBQmJWVjBnUm1GemRHVnpkQUJiVFZSZElFWmhjM1JsYzNRQVcwUlVYU0JHWVhOMFpYTjBBRnRWWFNCR1lYTjBBRnROVkYwZ1JtRnpkQUJiUkZSZElFWmhjM1FBZFc1emFXZHVaV1FnYzJodmNuUUFkVzV6YVdkdVpXUWdhVzUwQUdsdWFYUUFabXh2WVhRQVUyRnRjR3hsUm05eWJXRjBBSFZwYm5RMk5GOTBBR2RsZEVSbFptRjFiSFJRWVhKaGJXVjBaWEp6QUhabFkzUnZjZ0IxYm5OcFoyNWxaQ0JqYUdGeUFITmhiWEJzWlVadmNtMWhkRWx1Y0FCellXMXdiR1ZTWVhSbFNXNXdBRjlmWTNoaFgyZDFZWEprWDJGamNYVnBjbVVnWkdWMFpXTjBaV1FnY21WamRYSnphWFpsSUdsdWFYUnBZV3hwZW1GMGFXOXVBRzVoYmdCaWIyOXNBSFI0Vkc5bloyeGxVSEp2ZEc5amIyd0FjbmhVYjJkbmJHVlFjbTkwYjJOdmJBQmxiWE5qY21sd2RHVnVPanAyWVd3QVcxVmRJRTV2Y20xaGJBQmJUVlJkSUU1dmNtMWhiQUJiUkZSZElFNXZjbTFoYkFCd1lYbHNiMkZrVEdWdVozUm9BR1JwYzJGaWJHVk1iMmNBWlc1aFlteGxURzluQUhWdWMybG5ibVZrSUd4dmJtY0FjM1JrT2pwM2MzUnlhVzVuQUdKaGMybGpYM04wY21sdVp3QnpkR1E2T25OMGNtbHVad0J6ZEdRNk9uVXhObk4wY21sdVp3QnpkR1E2T25Vek1uTjBjbWx1WndCcGJtWUFjMkZ0Y0d4bFVtRjBaUUJ6WVcxd2JHVnpVR1Z5Um5KaGJXVUFaRzkxWW14bEFHWnlaV1VBWlc1amIyUmxBR1JsWTI5a1pRQnZjR1Z5WVhScGJtZE5iMlJsQUhOdmRXNWtUV0Z5YTJWeVZHaHlaWE5vYjJ4a0FIWnZhV1FBVUhKdmRHOWpiMnhKWkFCSFIxZEJWa1ZmVDFCRlVrRlVTVTVIWDAxUFJFVmZWRmdBUjBkWFFWWkZYMDlRUlZKQlZFbE9SMTlOVDBSRlgxSllYMEZPUkY5VVdBQkhSMWRCVmtWZlQxQkZVa0ZVU1U1SFgwMVBSRVZmVWxnQVIwZFhRVlpGWDFCU1QxUlBRMDlNWDBSVVgwWkJVMVJGVTFRQVIwZFhRVlpGWDFCU1QxUlBRMDlNWDBGVlJFbENURVZmUmtGVFZFVlRWQUJIUjFkQlZrVmZVRkpQVkU5RFQweGZWVXhVVWtGVFQxVk9SRjlHUVZOVVJWTlVBRWRIVjBGV1JWOVFVazlVVDBOUFRGOUVWRjlHUVZOVUFFZEhWMEZXUlY5UVVrOVVUME5QVEY5QlZVUkpRa3hGWDBaQlUxUUFSMGRYUVZaRlgxQlNUMVJQUTA5TVgxVk1WRkpCVTA5VlRrUmZSa0ZUVkFCSFIxZEJWa1ZmVDFCRlVrRlVTVTVIWDAxUFJFVmZWVk5GWDBSVFV3QkhSMWRCVmtWZlQxQkZVa0ZVU1U1SFgwMVBSRVZmVkZoZlQwNU1XVjlVVDA1RlV3Qk9RVTRBUjBkWFFWWkZYMUJTVDFSUFEwOU1YMFJVWDA1UFVrMUJUQUJIUjFkQlZrVmZVRkpQVkU5RFQweGZRVlZFU1VKTVJWOU9UMUpOUVV3QVIwZFhRVlpGWDFCU1QxUlBRMDlNWDFWTVZGSkJVMDlWVGtSZlRrOVNUVUZNQUVsT1JnQkhSMWRCVmtWZlUwRk5VRXhGWDBaUFVrMUJWRjlWVGtSRlJrbE9SVVFBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhjMmh2Y25RK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEhWdWMybG5ibVZrSUhOb2IzSjBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHBiblErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQSFZ1YzJsbmJtVmtJR2x1ZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4Wm14dllYUStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BIVnBiblE0WDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEdsdWREaGZkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhkV2x1ZERFMlgzUStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BHbHVkREUyWDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEhWcGJuUXpNbDkwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenhwYm5Rek1sOTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eGphR0Z5UGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYm5OcFoyNWxaQ0JqYUdGeVBnQnpkR1E2T21KaGMybGpYM04wY21sdVp6eDFibk5wWjI1bFpDQmphR0Z5UGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenh6YVdkdVpXUWdZMmhoY2o0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4Ykc5dVp6NEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXNXphV2R1WldRZ2JHOXVaejRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhaRzkxWW14bFBnQkhSMWRCVmtWZlVGSlBWRTlEVDB4ZlExVlRWRTlOWHprQVIwZFhRVlpGWDFCU1QxUlBRMDlNWDBOVlUxUlBUVjg0QUVkSFYwRldSVjlUUVUxUVRFVmZSazlTVFVGVVgxVTRBRWRIVjBGV1JWOVRRVTFRVEVWZlJrOVNUVUZVWDBrNEFFZEhWMEZXUlY5UVVrOVVUME5QVEY5RFZWTlVUMDFmTndCSFIxZEJWa1ZmVUZKUFZFOURUMHhmUTFWVFZFOU5YellBUjBkWFFWWkZYMU5CVFZCTVJWOUdUMUpOUVZSZlZURTJBRWRIVjBGV1JWOVRRVTFRVEVWZlJrOVNUVUZVWDBreE5nQkhSMWRCVmtWZlVGSlBWRTlEVDB4ZlExVlRWRTlOWHpVQVIwZFhRVlpGWDFCU1QxUlBRMDlNWDBOVlUxUlBUVjgwQUVkSFYwRldSVjlRVWs5VVQwTlBURjlEVlZOVVQwMWZNd0JIUjFkQlZrVmZVRkpQVkU5RFQweGZRMVZUVkU5Tlh6SUFSMGRYUVZaRlgxTkJUVkJNUlY5R1QxSk5RVlJmUmpNeUFFZEhWMEZXUlY5UVVrOVVUME5QVEY5RFZWTlVUMDFmTVFCSFIxZEJWa1ZmVUZKUFZFOURUMHhmUTFWVFZFOU5YekFBTGdBb2JuVnNiQ2tBUlhKeWIzSTZJR05oY0hSMWNtVWdjMkZ0Y0d4bElISmhkR1VnS0NWbklFaDZLU0J0ZFhOMElHSmxJRDQ5SUNWbklFaDZDZ0JGY25KdmNqb2dZMkZ3ZEhWeVpTQnpZVzF3YkdVZ2NtRjBaU0FvSldjZ1NIb3BJRzExYzNRZ1ltVWdQRDBnSldjZ1NIb0tBRVZ5Y205eU9pQm1ZV2xzWldRZ2RHOGdZMjl0Y0hWMFpTQjBhR1VnYzJsNlpTQnZaaUIwYUdVZ2NtVnhkV2x5WldRZ2JXVnRiM0o1Q2dCVWNuVnVZMkYwYVc1bklHUmhkR0VnWm5KdmJTQWxaQ0IwYnlBbFpDQmllWFJsY3dvQVEyRnVibTkwSUdSbFkyOWtaU0IzYUdsc1pTQjBjbUZ1YzIxcGRIUnBibWNLQUZSNElHbHpJR1JwYzJGaWJHVmtJQzBnWTJGdWJtOTBJSFJ5WVc1emJXbDBJR1JoZEdFZ2QybDBhQ0IwYUdseklFZEhWMkYyWlNCcGJuTjBZVzVqWlFvQVVuZ2dhWE1nWkdsellXSnNaV1FnTFNCallXNXViM1FnY21WalpXbDJaU0JrWVhSaElIZHBkR2dnZEdocGN5QkhSMWRoZG1VZ2FXNXpkR0Z1WTJVS0FGQnliM1J2WTI5c0lDVmtJR2x6SUc1dmRDQmxibUZpYkdWa0lDMGdiV0ZyWlNCemRYSmxJSFJ2SUdWdVlXSnNaU0JwZENCaVpXWnZjbVVnWTNKbFlYUnBibWNnZEdobElHbHVjM1JoYm1ObENnQk5iMjV2TFhSdmJtVWdjSEp2ZEc5amIyeHpJSGRwZEdnZ2RtRnlhV0ZpYkdVZ2JHVnVaM1JvSUdGeVpTQnViM1FnYzNWd2NHOXlkR1ZrQ2dCR1lXbHNaV1FnZEc4Z2FXNXBkR2xoYkdsNlpTQlVlQ0IwY21GdWMyMXBjM05wYjI0Z1ptOXlJRWRIVjJGMlpTQnBibk4wWVc1alpTQWxaQW9BU1c1MllXeHBaQ0JIUjFkaGRtVWdhVzV6ZEdGdVkyVWdKV1FLQUVaaGFXeGxaQ0IwYnlCbGJtTnZaR1VnWkdGMFlTQXRJRWRIVjJGMlpTQnBibk4wWVc1alpTQWxaQW9BUm1GcGJHVmtJSFJ2SUdSbFkyOWtaU0JrWVhSaElDMGdSMGRYWVhabElHbHVjM1JoYm1ObElDVmtDZ0JHWVdsc1pXUWdkRzhnWm5KbFpTQkhSMWRoZG1VZ2FXNXpkR0Z1WTJVZ0xTQnBiblpoYkdsa0lFZEhWMkYyWlNCcGJuTjBZVzVqWlNCcFpDQWxaQW9BYmlBOUlDVmtMQ0J1UVdOMGRXRnNJRDBnSldRS0FGSmxZMlZwZG1Wa0lHVnVaQ0J0WVhKclpYSXVJRVp5WVcxbGN5QnNaV1owSUQwZ0pXUXNJSEpsWTI5eVpHVmtJRDBnSldRS0FFVnljbTl5T2lCbVlXbHNaV1FnZEc4Z1lXeHNiMk5oZEdVZ2RHaGxJSEpsY1hWcGNtVmtJRzFsYlc5eWVUb2dKV1FLQUVsdWRtRnNhV1FnY0dGNWJHOWhaQ0JzWlc1bmRHZzZJQ1ZrTENCdFlYZzZJQ1ZrQ2dCSmJuWmhiR2xrSUhOaGJYQnNaWE1nY0dWeUlHWnlZVzFsT2lBbFpDd2diV0Y0T2lBbFpBb0FTVzUyWVd4cFpDQnZjaUIxYm5OMWNIQnZjblJsWkNCd2JHRjVZbUZqYXlCellXMXdiR1VnWm05eWJXRjBPaUFsWkFvQVNXNTJZV3hwWkNCdmNpQjFibk4xY0hCdmNuUmxaQ0JqWVhCMGRYSmxJSE5oYlhCc1pTQm1iM0p0WVhRNklDVmtDZ0JKYm5aaGJHbGtJSE5oYlhCc1pTQm1iM0p0WVhRNklDVmtDZ0JPWldkaGRHbDJaU0JrWVhSaElITnBlbVU2SUNWa0NnQkZjbkp2Y2pvZ1ptRnBiR1ZrSUhSdklHRnNiRzlqWVhSbElHMWxiVzl5ZVNBdElHaGxZWEJUYVhwbE1Eb2dKV1FzSUdobFlYQlRhWHBsT2lBbFpBb0FTVzUyWVd4cFpDQjJiMngxYldVNklDVmtDZ0JKYm5aaGJHbGtJSEJ5YjNSdlkyOXNJRWxFT2lBbFpBb0FVbVZqWldsMmFXNW5JSE52ZFc1a0lHUmhkR0VnTGk0dUNnQkJibUZzZVhwcGJtY2dZMkZ3ZEhWeVpXUWdaR0YwWVNBdUxnb0FSbUZwYkdWa0lIUnZJR055WldGMFpTQkhSMWRoZG1VZ2FXNXpkR0Z1WTJVZ0xTQnlaV0ZqYUdWa0lHMWhlR2x0ZFcwZ2JuVnRZbVZ5SUc5bUlHbHVjM1JoYm1ObGN5QW9KV1FwQ2dCR1lXbHNkWEpsSUdSMWNtbHVaeUJqWVhCMGRYSmxJQzBnY0hKdmRtbGtaV1FnWW5sMFpYTWdLQ1ZrS1NCaGNtVWdibTkwSUcxMWJIUnBjR3hsSUc5bUlITmhiWEJzWlNCemFYcGxJQ2dsWkNrS0FFUmxZMjlrWldRZ2JHVnVaM1JvSUQwZ0pXUXNJSEJ5YjNSdlkyOXNJRDBnSnlWekp5QW9KV1FwQ2dCRmNuSnZjam9nZEc5MFlXd2diR1Z1WjNSb0lDVmtJQ2h3WVhsc2IyRmtJQ1ZrSUNzZ1JVTkRJQ1ZrSUdKNWRHVnpLU0JwY3lCMGIyOGdiR0Z5WjJVZ0tDQStJQ1ZrS1FvQVJtRnBiR1ZrSUhSdklHTmhjSFIxY21VZ2MyOTFibVFnWkdGMFlTNGdVR3hsWVhObElIUnllU0JoWjJGcGJpQW9iR1Z1WjNSb0lEMGdKV1FwQ2dCU1pXTmxhWFpsWkNCemIzVnVaQ0JrWVhSaElITjFZMk5sYzNObWRXeHNlVG9nSnlWekp3b0FNVGxuWjNkaGRtVmZVMkZ0Y0d4bFJtOXliV0YwQUFBQUFQd29BQUNMRWdBQU1UZG5aM2RoZG1WZlVISnZkRzlqYjJ4SlpBRDhLQUFBckJJQUFERTNaMmQzWVhabFgxQmhjbUZ0WlhSbGNuTUFTQ2tBQU1nU0FBQnBBSFpwQUdscGFRQjJhV2xwQUdacGFRQjJhV2xtQUFEY0VnQUFhV2tBQUpnb0FBRGNFZ0FBUkNnQUFKZ29BQUIyYVdrQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSlkwVkZBQUJJS1FBQUdCTUFBR2dUQUFDWUtBQUE0Qk1BQU1BU0FBQ1lLQUFBVGpFd1pXMXpZM0pwY0hSbGJqTjJZV3hGQUFCSUtRQUFWQk1BQUU1VGRETmZYekl4TW1KaGMybGpYM04wY21sdVowbGpUbE5mTVRGamFHRnlYM1J5WVdsMGMwbGpSVVZPVTE4NVlXeHNiMk5oZEc5eVNXTkZSVVZGQUU1VGRETmZYekl5TVY5ZlltRnphV05mYzNSeWFXNW5YMk52YlcxdmJrbE1ZakZGUlVVQUFBQUFTQ2tBQUs4VEFBRE1LUUFBY0JNQUFBQUFBQUFCQUFBQTJCTUFBQUFBQUFCcGFXbHBhV2tBQUdnVEFBQ1lLQUFBNEJNQUFHbHBhV2tBQUFBQVJDZ0FBRVFvQUFEQUVnQUFtQ2dBUWJBb0M2Y2lscCswcnh1UjNzVkZkZWd1RHpKS1g3UldsY3QvYWxScVNQSUxlODM3azIwOGQxN0RNMGZBOFhFeU15YzFhRWNmVHF3alFsOEFONlJRYlVna2tYeWhUZ0FBQVJrQ01ockdBOTh6N2h0b3gwc0VaT0FPTkkzdmdSekJhZmpJQ0V4eEJZcGxMK0VrRHlFMWs0N2E4QktDUlIyMXduMXFKL201eVpvSmVFM2tjcVlHdjR0aVp0MHcvZUtZSmJNUWtTS0lOdENVem8rVzI3M3gwaE5jZ3poR1FCNUN0cVBEU0g1dWF6b29WUHFGdWozS1hwdWZDaFY1SzA3VTVheHo4NmRYQjNEQTk0eUFZdzFuU3Q3dE1jWCtHT09sbVhjbXVMUjhFVVNTMlNNZ2lTNDNQOUZibGJ6UHpaQ0hsN0xjL0w1aDhsYlRxeFFxWFo2RVBEbFRSMjFCb2g4dFE5aTNlNlIyeEJkSjdIOE1iL1pzb1R0U0taMVZxdnRnaHJHN3pENWF5MWxmc0p5cG9GRUw5UmJyZW5VczEwK3UxZW5tNTYzb2ROYjA2cWhRV0s4QkFnUUlFQ0JBZ0IwNmRPak5oeE1tVEpndFdyUjE2c21QQXdZTUdEQmd3SjBuVHB3bFNwUTFhdFMxZCs3Qm55TkdqQVVLRkNoUW9GMjZhZEs1Yjk2aFg3NWh3cGt2WHJ4bHlva1BIang0OFAzbjA3dHIxckYvL3VIZm8xdTJjZUxacjBPR0VTSkVpQTBhTkdqUXZXZk9nUjgrZlBqdHg1TTdkdXpGbHpObXpJVVhMbHk0YmRxcFQ1NGhRb1FWS2xTb1Rab3BVcVJWcWttU09YTGsxYmR6NXRHL1k4YVJQMzc4NWRlemUvYngvK1BicTB1V01XTEVsVGR1M0tWWHJrR0NHVEpreUkwSERodzRjT0RkcDFPbVVhSlpzbm55K2UvRG15dFdyRVdLQ1JJa1NKQTlldlQxOS9QNzY4dUxDeFlzV0xCOSt1blBneHMyYk5pdFI0NEJBZ1FJRUNCQWdCMDZkT2pOaHhNbVRKZ3RXclIxNnNtUEF3WU1HREJnd0owblRwd2xTcFExYXRTMWQrN0JueU5HakFVS0ZDaFFvRjI2YWRLNWI5NmhYNzVod3BrdlhyeGx5b2tQSGp4NDhQM24wN3RyMXJGLy91SGZvMXUyY2VMWnIwT0dFU0pFaUEwYU5HalF2V2ZPZ1I4K2ZQanR4NU03ZHV6Rmx6Tm16SVVYTGx5NGJkcXBUNTRoUW9RVktsU29UWm9wVXFSVnFrbVNPWExrMWJkejV0Ry9ZOGFSUDM3ODVkZXplL2J4LytQYnEwdVdNV0xFbFRkdTNLVlhya0dDR1RKa3lJMEhEaHc0Y09EZHAxT21VYUpac25ueStlL0RteXRXckVXS0NSSWtTSkE5ZXZUMTkvUDc2OHVMQ3hZc1dMQjkrdW5QZ3hzMmJOaXRSNDRCQWdBQUFBQUJBQUFBQVFBQUFBSUFBQUFDQUFBQUJBQUFBRTVUZEROZlh6SXhNbUpoYzJsalgzTjBjbWx1WjBsb1RsTmZNVEZqYUdGeVgzUnlZV2wwYzBsb1JVVk9VMTg1WVd4c2IyTmhkRzl5U1doRlJVVkZBQURNS1FBQWlCY0FBQUFBQUFBQkFBQUEyQk1BQUFBQUFBQk9VM1F6WDE4eU1USmlZWE5wWTE5emRISnBibWRKZDA1VFh6RXhZMmhoY2w5MGNtRnBkSE5KZDBWRlRsTmZPV0ZzYkc5allYUnZja2wzUlVWRlJRQUF6Q2tBQU9BWEFBQUFBQUFBQVFBQUFOZ1RBQUFBQUFBQVRsTjBNMTlmTWpFeVltRnphV05mYzNSeWFXNW5TVVJ6VGxOZk1URmphR0Z5WDNSeVlXbDBjMGxFYzBWRlRsTmZPV0ZzYkc5allYUnZja2xFYzBWRlJVVUFBQURNS1FBQU9CZ0FBQUFBQUFBQkFBQUEyQk1BQUFBQUFBQk9VM1F6WDE4eU1USmlZWE5wWTE5emRISnBibWRKUkdsT1UxOHhNV05vWVhKZmRISmhhWFJ6U1VScFJVVk9VMTg1WVd4c2IyTmhkRzl5U1VScFJVVkZSUUFBQU13cEFBQ1VHQUFBQUFBQUFBRUFBQURZRXdBQUFBQUFBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTV0ZGUlFBQVNDa0FBUEFZQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsb1JVVUFBRWdwQUFBWUdRQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEpjMFZGQUFCSUtRQUFRQmtBQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1hSRlJRQUFTQ2tBQUdnWkFBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbHBSVVVBQUVncEFBQ1FHUUFBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKYWtWRkFBQklLUUFBdUJrQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NXeEZSUUFBU0NrQUFPQVpBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGx0UlVVQUFFZ3BBQUFJR2dBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSlprVkZBQUJJS1FBQU1Cb0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTV1JGUlFBQVNDa0FBRmdhQUFBREFBQUFCQUFBQUFRQUFBQUdBQUFBZy9taUFFUk9iZ0Q4S1JVQTBWY25BTjAwOVFCaTI4QUFQSm1WQUVHUVF3QmpVZjRBdTk2ckFMZGh4UUE2YmlRQTBrMUNBRWtHNEFBSjZpNEFISkxSQU9zZC9nQXBzUndBNkQ2bkFQVTFnZ0JFdXk0QW5PbUVBTFFtY0FCQmZsOEExcEU1QUZPRE9RQ2M5RGtBaTErRUFDajV2UUQ0SHpzQTN2K1hBQStZQlFBUkwrOEFDbHFMQUcwZmJRRFBmallBQ2NzbkFFWlB0d0NlWmo4QUxlcGZBTG9uZFFEbDY4Y0FQWHZ4QVBjNUJ3Q1NVb29BKzJ2cUFCK3hYd0FJWFkwQU1BTldBSHY4UmdEd3Eyc0FJTHpQQURiMG1nRGpxUjBBWG1HUkFBZ2I1Z0NGbVdVQW9CUmZBSTFBYUFDQTJQOEFKM05OQUFZR01RREtWaFVBeWFoekFIdmlZQUJyak1BQUdjUkhBTTFud3dBSjZOd0FXWU1xQUl0MnhBQ21ISllBUksvZEFCbFgwUUNsUGdVQUJRZi9BRE4rUHdEQ011Z0FtRS9lQUx0OU1nQW1QY01BSG12dkFKLzRYZ0ExSHpvQWYvTEtBUEdISFFCOGtDRUFhaVI4QU5WdStnQXdMWGNBRlR0REFMVVV4Z0RER1owQXJjVENBQ3hOUVFBTUFGMEFobjFHQU9OeExRQ2J4cG9BTTJJQUFMVFNmQUMwcDVjQU4xWFZBTmMrOWdDakVCZ0FUWGI4QUdTZEtnQncxNnNBWTN6NEFIcXdWd0FYRmVjQXdFbFdBRHZXMlFDbmhEZ0FKQ1BMQU5hS2R3QmFWQ01BQUIrNUFQRUtHd0FaenQ4QW56SC9BR1llYWdDWlYyRUFyUHRIQUg1LzJBQWlaYmNBTXVpSkFPYS9ZQUR2eE0wQWJEWUpBRjAvMUFBVzN0Y0FXRHZlQU42YmtnRFNJaWdBS0lib0FPSllUUURHeWpJQUNPTVdBT0I5eXdBWHdGQUE4eDJuQUJqZ1d3QXVFelFBZ3hKaUFJTklBUUQxamxzQXJiQi9BQjdwOGdCSVNrTUFFR2ZUQUtyZDJBQ3VYMElBYW1IT0FBb29wQURUbWJRQUJxYnlBRngzZndDandvTUFZVHlJQUlwemVBQ3ZqRm9BYjllOUFDMm1Zd0QwdjhzQWpZSHZBQ2JCWndCVnlrVUF5dGsyQUNpbzBnRENZWTBBRXNsM0FBUW1GQUFTUnBzQXhGbkVBTWpGUkFCTnNwRUFBQmZ6QU5SRHJRQXBTZVVBL2RVUUFBQysvQUFlbE13QWNNN3VBQk0rOVFEczhZQUFzK2ZEQU1mNEtBQ1RCWlFBd1hFK0FDNEpzd0FMUmZNQWlCS2NBS3NnZXdBdXRaOEFSNUxDQUhzeUx3QU1WVzBBY3FlUUFHdm5Id0F4eTVZQWVSWktBRUY1NGdEMDM0a0E2SlNYQU9MbWhBQ1pNWmNBaU8xckFGOWZOZ0M3L1E0QVNKcTBBR2VrYkFCeGNrSUFqVjB5QUo4VnVBQzg1UWtBalRFbEFQZDBPUUF3QlJ3QURRd0JBRXNJYUFBczdsZ0FSNnFRQUhUbkFnQzkxaVFBOTMybUFHNUljZ0NmRnU4QWpwU21BTFNSOWdEUlUxRUF6d3J5QUNDWU13RDFTMzRBc21Ob0FOMCtYd0JBWFFNQWhZbC9BRlZTS1FBM1pNQUFiZGdRQURKSU1nQmJUSFVBVG5IVUFFVlViZ0FMQ2NFQUt2VnBBQlJtMVFBbkI1MEFYUVJRQUxRNzJ3RHFkc1VBaC9rWEFFbHJmUUFkSjdvQWxta3BBTWJNckFDdEZGUUFrT0pxQUlqWmlRQXNjbEFBQktTK0FIY0hsQUR6TUhBQUFQd25BT3B4cUFCbXdra0FaT0E5QUpmZGd3Q2pQNWNBUTVUOUFBMkdqQUF4UWQ0QWtqbWRBTjF3akFBWHQrY0FDTjg3QUJVM0t3QmNnS0FBV29DVEFCQVJrZ0FQNk5nQWJJQ3ZBTnYvU3dBNGtBOEFXUmgyQUdLbEZRQmh5N3NBeDRtNUFCQkF2UURTOGdRQVNYVW5BT3UyOWdEYklyc0FDaFNxQUlrbUx3QmtnM1lBQ1RzekFBNlVHZ0JST3FvQUhhUENBSy90cmdCY0poSUFiY0pOQUMxNm5BREFWcGNBQXorREFBbnc5Z0FyUUl3QWJUR1pBRG0wQndBTUlCVUEyTU5iQVBXU3hBREdyVXNBVHNxbEFLYzN6UURtcVRZQXE1S1VBTjFDYUFBWlk5NEFkb3p2QUdpTFVnRDgyemNBcnFHckFOOFZNUUFBcnFFQURQdmFBR1JOWmdEdEJiY0FLV1V3QUZkV3Z3Qkgvem9BYXZtNUFIVys4d0Fvazk4QXE0QXdBR2FNOWdBRXl4VUEraUlHQU5ua0hRQTlzNlFBVnh1UEFEYk5DUUJPUXVrQUU3NmtBRE1qdFFEd3Fob0FUMldvQU5MQnBRQUxQdzhBVzNqTkFDUDVkZ0I3aXdRQWlSZHlBTWFtVXdCdmJ1SUE3K3NBQUp0S1dBREUycmNBcW1hNkFIYlB6d0RSQWgwQXNmRXRBSXlad1FERHJYY0Foa2phQVBkZG9BREdnUFFBclBBdkFOM3NtZ0EvWEx3QTBONXRBSkRISHdBcTI3WUFveVU2QUFDdm1nQ3RVNU1BdGxjRUFDa3R0QUJMZ0g0QTJnZW5BSGFxRGdCN1dhRUFGaElxQU55M0xRRDY1ZjBBaWR2K0FJbSsvUURrZG13QUJxbjhBRDZBY0FDRmJoVUEvWWYvQUNnK0J3Qmhaek1BS2hpR0FFMjk2Z0N6NTY4QWoyMXVBSlZuT1FBeHYxc0FoTmRJQUREZkZnREhMVU1BSldFMUFNbHd6Z0F3eTdnQXYyejlBS1FBb2dBRmJPUUFXdDJnQUNGdlJ3QmlFdElBdVZ5RUFIQmhTUUJyVnVBQW1WSUJBRkJWTndBZTFiY0FNL0hFQUJOdVh3QmRNT1FBaFM2cEFCMnl3d0NoTWpZQUNMZWtBT3F4MUFBVzl5RUFqMm5rQUNmL2R3QU1BNEFBalVBdEFFL05vQUFncFprQXM2TFRBQzlkQ2dDMCtVSUFFZHJMQUgyKzBBQ2IyOEVBcXhlOUFNcWlnUUFJYWx3QUxsVVhBQ2NBVlFCL0ZQQUE0UWVHQUJRTFpBQ1dRWTBBaDc3ZUFOcjlLZ0JySmJZQWU0azBBQVh6L2dDNXY1NEFhR3BQQUVvcXFBQlB4Rm9BTGZpOEFOZGFtQUQweDVVQURVMk5BQ0E2cGdDa1YxOEFGRCt4QUlBNGxRRE1JQUVBY2QyR0FNbmV0Z0MvWVBVQVRXVVJBQUVIYXdDTXNLd0Fzc0RRQUZGVlNBQWUrdzRBbFhMREFLTUdPd0RBUURVQUJ0eDdBT0JGekFCT0tmb0Exc3JJQU9qelFRQjhaTjRBbTJUWUFObStNUUNrbDhNQWQxalVBR25qeFFEdzJoTUF1am84QUVZWVJnQlZkVjhBMHIzMUFHNlN4Z0NzTGwwQURrVHRBQncrUWdCaHhJY0FLZjNwQU9mVzh3QWlmTW9BYjVFMUFBamd4UUQvMTQwQWJtcmlBTEQ5eGdDVENNRUFmRjEwQUd1dHNnRE5icDBBUG5KN0FNWVJhZ0QzejZrQUtYUGZBTFhKdWdDM0FGRUE0cklOQUhTNkpBRGxmV0FBZE5pS0FBMFZMQUNCR0F3QWZtYVVBQUVwRmdDZmVuWUEvZjIrQUZaRjd3RFpmallBN05rVEFJdTZ1UURFbC93QU1hZ25BUEZ1d3dDVXhUWUEyS2hXQUxTb3RRRFB6QTRBRW9rdEFHOVhOQUFzVm9rQW1jN2pBTllndVFCclhxb0FQaXFjQUJGZnpBRDlDMG9BNGZUN0FJNDdiUURpaGl3QTZkU0VBUHkwcVFEdjd0RUFMalhKQUM4NVlRQTRJVVFBRzluSUFJSDhDZ0Q3U21vQUx4ellBRk8waEFCT21Zd0FWQ0xNQUNwVjNBREF4dFlBQ3htV0FCcHd1QUJwbFdRQUpscGdBRDlTN2dCL0VROEE5TFVSQVB6TDlRQTB2QzBBTkx6dUFPaGR6QURkWG1BQVo0NmJBSkl6N3dESkY3Z0FZVmliQU9GWHZBQlJnOFlBMkQ0UUFOMXhTQUF0SE4wQXJ4aWhBQ0VzUmdCWjg5Y0EyWHFZQUo1VXdBQlBodm9BVmdiOEFPVjVyZ0NKSWpZQU9LMGlBR2VUM0FCVjZLb0FnaVk0QU1ybm13QlJEYVFBbVRPeEFLblhEZ0JwQlVnQVpiTHdBSCtJcHdDSVRKY0ErZEUyQUNHU3N3Qjdna29BbU04aEFFQ2YzQURjUjFVQTRYUTZBR2ZyUWdEK25kOEFYdFJmQUh0bnBBQzZySG9BVmZhaUFDdUlJd0JCdWxVQVdXNElBQ0VxaGdBNVI0TUFpZVBtQU9XZTFBQkorMEFBLzFicEFCd1B5Z0RGV1lvQWxQb3JBTlBCeFFBUHhjOEEyMXF1QUVmRmhnQ0ZRMklBSVlZN0FDeDVsQUFRWVljQUtreDdBSUFzR2dCRHZ4SUFpQ2FRQUhnOGlRQ294T1FBNWR0N0FNUTZ3Z0FtOU9vQTkyZUtBQTJTdndCbG95c0FQWk94QUwxOEN3Q2tVZHdBSjkxakFHbmgzUUNhbEJrQXFDbVZBR2pPS0FBSjdiUUFSSjhnQUU2WXlnQndnbU1BZm53akFBKzVNZ0NuOVk0QUZGYm5BQ0h4Q0FDMW5Tb0FiMzVOQUtVWlVRQzErYXNBZ3QvV0FKYmRZUUFXTmdJQXhEcWZBSU9pb1FCeTdXMEFPWTE2QUlLNHFRQnJNbHdBUmlkYkFBQTA3UURTQUhjQS9QUlZBQUZaVFFEZ2NZQUFRZVBLQUFzL1FQc2grVDhBQUFBQUxVUjBQZ0FBQUlDWVJ2ZzhBQUFBWUZITWVEc0FBQUNBZ3h2d09RQUFBRUFnSlhvNEFBQUFnQ0tDNHpZQUFBQUFIZk5wTldBcUFFR3d5d0FMUVJrQUNnQVpHUmtBQUFBQUJRQUFBQUFBQUFrQUFBQUFDd0FBQUFBQUFBQUFHUUFSQ2hrWkdRTUtCd0FCQUFrTEdBQUFDUVlMQUFBTEFBWVpBQUFBR1JrWkFFR0J6QUFMSVE0QUFBQUFBQUFBQUJrQUNnMFpHUmtBRFFBQUFnQUpEZ0FBQUFrQURnQUFEZ0JCdTh3QUN3RU1BRUhIekFBTEZSTUFBQUFBRXdBQUFBQUpEQUFBQUFBQURBQUFEQUJCOWN3QUN3RVFBRUdCelFBTEZROEFBQUFFRHdBQUFBQUpFQUFBQUFBQUVBQUFFQUJCcjgwQUN3RVNBRUc3elFBTEhoRUFBQUFBRVFBQUFBQUpFZ0FBQUFBQUVnQUFFZ0FBR2dBQUFCb2FHZ0JCOHMwQUN3NGFBQUFBR2hvYUFBQUFBQUFBQ1FCQm84NEFDd0VVQUVHdnpnQUxGUmNBQUFBQUZ3QUFBQUFKRkFBQUFBQUFGQUFBRkFCQjNjNEFDd0VXQUVIcHpnQUx6UVVWQUFBQUFCVUFBQUFBQ1JZQUFBQUFBQllBQUJZQUFEQXhNak0wTlRZM09EbEJRa05FUlVaT01UQmZYMk40ZUdGaWFYWXhNVFpmWDNOb2FXMWZkSGx3WlY5cGJtWnZSUUFBQUFCd0tRQUFrQ2NBQURBcUFBQk9NVEJmWDJONGVHRmlhWFl4TVRkZlgyTnNZWE56WDNSNWNHVmZhVzVtYjBVQUFBQndLUUFBd0NjQUFMUW5BQUFBQUFBQU5DZ0FBQ0FBQUFBaEFBQUFJZ0FBQUNNQUFBQWtBQUFBVGpFd1gxOWplSGhoWW1sMk1USXpYMTltZFc1a1lXMWxiblJoYkY5MGVYQmxYMmx1Wm05RkFIQXBBQUFNS0FBQXRDY0FBSFlBQUFENEp3QUFRQ2dBQUdJQUFBRDRKd0FBVENnQUFHTUFBQUQ0SndBQVdDZ0FBR2dBQUFENEp3QUFaQ2dBQUdFQUFBRDRKd0FBY0NnQUFITUFBQUQ0SndBQWZDZ0FBSFFBQUFENEp3QUFpQ2dBQUdrQUFBRDRKd0FBbENnQUFHb0FBQUQ0SndBQW9DZ0FBR3dBQUFENEp3QUFyQ2dBQUcwQUFBRDRKd0FBdUNnQUFIZ0FBQUQ0SndBQXhDZ0FBSGtBQUFENEp3QUEwQ2dBQUdZQUFBRDRKd0FBM0NnQUFHUUFBQUQ0SndBQTZDZ0FBQUFBQUFBMEtRQUFJQUFBQUNVQUFBQWlBQUFBSXdBQUFDWUFBQUJPTVRCZlgyTjRlR0ZpYVhZeE1UWmZYMlZ1ZFcxZmRIbHdaVjlwYm1adlJRQUFBQUJ3S1FBQUVDa0FBTFFuQUFBQUFBQUE1Q2NBQUNBQUFBQW5BQUFBSWdBQUFDTUFBQUFvQUFBQUtRQUFBQ29BQUFBckFBQUFBQUFBQUxncEFBQWdBQUFBTEFBQUFDSUFBQUFqQUFBQUtBQUFBQzBBQUFBdUFBQUFMd0FBQUU0eE1GOWZZM2g0WVdKcGRqRXlNRjlmYzJsZlkyeGhjM05mZEhsd1pWOXBibVp2UlFBQUFBQndLUUFBa0NrQUFPUW5BQUFBQUFBQUZDb0FBQ0FBQUFBd0FBQUFJZ0FBQUNNQUFBQW9BQUFBTVFBQUFESUFBQUF6QUFBQVRqRXdYMTlqZUhoaFltbDJNVEl4WDE5MmJXbGZZMnhoYzNOZmRIbHdaVjlwYm1adlJRQUFBSEFwQUFEc0tRQUE1Q2NBQUZOME9YUjVjR1ZmYVc1bWJ3QUFBQUJJS1FBQUlDb0FRYmpVQUFzcC8vLy8vd0NBTzBjQWdEdEhBSUE3UndBRUFBQUFBRUJBQlFBQUFBVUFBQUFHQUFBQUFBQUFBQVVBUWV6VUFBc0JHZ0JCaE5VQUN3b2JBQUFBSEFBQUFQa3ZBRUdjMVFBTEFRSUFRYXpWQUFzSS8vLy8vLy8vLy84QVFmRFZBQXNCQlFCQi9OVUFDd0VkQUVHVTFnQUxEaHNBQUFBZUFBQUFDREFBQUFBRUFFR3MxZ0FMQVFFQVFieldBQXNGLy8vLy93b0FRWURYQUFzRHNEWlEiO2lmKCFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpKXt3YXNtQmluYXJ5RmlsZT1sb2NhdGVGaWxlKHdhc21CaW5hcnlGaWxlKX1mdW5jdGlvbiBnZXRCaW5hcnkoZmlsZSl7dHJ5e2lmKGZpbGU9PXdhc21CaW5hcnlGaWxlJiZ3YXNtQmluYXJ5KXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkod2FzbUJpbmFyeSl9dmFyIGJpbmFyeT10cnlQYXJzZUFzRGF0YVVSSShmaWxlKTtpZihiaW5hcnkpe3JldHVybiBiaW5hcnl9aWYocmVhZEJpbmFyeSl7cmV0dXJuIHJlYWRCaW5hcnkoZmlsZSl9ZWxzZXt0aHJvdyJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZCJ9fWNhdGNoKGVycil7YWJvcnQoZXJyKX19ZnVuY3Rpb24gZ2V0QmluYXJ5UHJvbWlzZSgpe2lmKCF3YXNtQmluYXJ5JiYoRU5WSVJPTk1FTlRfSVNfV0VCfHxFTlZJUk9OTUVOVF9JU19XT1JLRVIpKXtpZih0eXBlb2YgZmV0Y2g9PT0iZnVuY3Rpb24iJiYhaXNGaWxlVVJJKHdhc21CaW5hcnlGaWxlKSl7cmV0dXJuIGZldGNoKHdhc21CaW5hcnlGaWxlLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7aWYoIXJlc3BvbnNlWyJvayJdKXt0aHJvdyJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICciK3dhc21CaW5hcnlGaWxlKyInIn1yZXR1cm4gcmVzcG9uc2VbImFycmF5QnVmZmVyIl0oKX0pLmNhdGNoKGZ1bmN0aW9uKCl7cmV0dXJuIGdldEJpbmFyeSh3YXNtQmluYXJ5RmlsZSl9KX1lbHNle2lmKHJlYWRBc3luYyl7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtyZWFkQXN5bmMod2FzbUJpbmFyeUZpbGUsZnVuY3Rpb24ocmVzcG9uc2Upe3Jlc29sdmUobmV3IFVpbnQ4QXJyYXkocmVzcG9uc2UpKX0scmVqZWN0KX0pfX19cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKXtyZXR1cm4gZ2V0QmluYXJ5KHdhc21CaW5hcnlGaWxlKX0pfWZ1bmN0aW9uIGNyZWF0ZVdhc20oKXt2YXIgaW5mbz17ImEiOmFzbUxpYnJhcnlBcmd9O2Z1bmN0aW9uIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSxtb2R1bGUpe3ZhciBleHBvcnRzPWluc3RhbmNlLmV4cG9ydHM7TW9kdWxlWyJhc20iXT1leHBvcnRzO3dhc21NZW1vcnk9TW9kdWxlWyJhc20iXVsiQSJdO3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKTt3YXNtVGFibGU9TW9kdWxlWyJhc20iXVsiQyJdO2FkZE9uSW5pdChNb2R1bGVbImFzbSJdWyJCIl0pO3JlbW92ZVJ1bkRlcGVuZGVuY3koIndhc20taW5zdGFudGlhdGUiKX1hZGRSdW5EZXBlbmRlbmN5KCJ3YXNtLWluc3RhbnRpYXRlIik7ZnVuY3Rpb24gcmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQocmVzdWx0KXtyZWNlaXZlSW5zdGFuY2UocmVzdWx0WyJpbnN0YW5jZSJdKX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKHJlY2VpdmVyKXtyZXR1cm4gZ2V0QmluYXJ5UHJvbWlzZSgpLnRoZW4oZnVuY3Rpb24oYmluYXJ5KXtyZXR1cm4gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LGluZm8pfSkudGhlbihmdW5jdGlvbihpbnN0YW5jZSl7cmV0dXJuIGluc3RhbmNlfSkudGhlbihyZWNlaXZlcixmdW5jdGlvbihyZWFzb24pe2VycigiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogIityZWFzb24pO2Fib3J0KHJlYXNvbil9KX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKCl7aWYoIXdhc21CaW5hcnkmJnR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZz09PSJmdW5jdGlvbiImJiFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpJiYhaXNGaWxlVVJJKHdhc21CaW5hcnlGaWxlKSYmdHlwZW9mIGZldGNoPT09ImZ1bmN0aW9uIil7cmV0dXJuIGZldGNoKHdhc21CaW5hcnlGaWxlLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7dmFyIHJlc3VsdD1XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhyZXNwb25zZSxpbmZvKTtyZXR1cm4gcmVzdWx0LnRoZW4ocmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQsZnVuY3Rpb24ocmVhc29uKXtlcnIoIndhc20gc3RyZWFtaW5nIGNvbXBpbGUgZmFpbGVkOiAiK3JlYXNvbik7ZXJyKCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvbiIpO3JldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KX0pfSl9ZWxzZXtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCl9fWlmKE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0pe3RyeXt2YXIgZXhwb3J0cz1Nb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKGluZm8scmVjZWl2ZUluc3RhbmNlKTtyZXR1cm4gZXhwb3J0c31jYXRjaChlKXtlcnIoIk1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6ICIrZSk7cmV0dXJuIGZhbHNlfX1pbnN0YW50aWF0ZUFzeW5jKCkuY2F0Y2gocmVhZHlQcm9taXNlUmVqZWN0KTtyZXR1cm57fX1mdW5jdGlvbiBjYWxsUnVudGltZUNhbGxiYWNrcyhjYWxsYmFja3Mpe3doaWxlKGNhbGxiYWNrcy5sZW5ndGg+MCl7dmFyIGNhbGxiYWNrPWNhbGxiYWNrcy5zaGlmdCgpO2lmKHR5cGVvZiBjYWxsYmFjaz09ImZ1bmN0aW9uIil7Y2FsbGJhY2soTW9kdWxlKTtjb250aW51ZX12YXIgZnVuYz1jYWxsYmFjay5mdW5jO2lmKHR5cGVvZiBmdW5jPT09Im51bWJlciIpe2lmKGNhbGxiYWNrLmFyZz09PXVuZGVmaW5lZCl7Z2V0V2FzbVRhYmxlRW50cnkoZnVuYykoKX1lbHNle2dldFdhc21UYWJsZUVudHJ5KGZ1bmMpKGNhbGxiYWNrLmFyZyl9fWVsc2V7ZnVuYyhjYWxsYmFjay5hcmc9PT11bmRlZmluZWQ/bnVsbDpjYWxsYmFjay5hcmcpfX19dmFyIHdhc21UYWJsZU1pcnJvcj1bXTtmdW5jdGlvbiBnZXRXYXNtVGFibGVFbnRyeShmdW5jUHRyKXt2YXIgZnVuYz13YXNtVGFibGVNaXJyb3JbZnVuY1B0cl07aWYoIWZ1bmMpe2lmKGZ1bmNQdHI+PXdhc21UYWJsZU1pcnJvci5sZW5ndGgpd2FzbVRhYmxlTWlycm9yLmxlbmd0aD1mdW5jUHRyKzE7d2FzbVRhYmxlTWlycm9yW2Z1bmNQdHJdPWZ1bmM9d2FzbVRhYmxlLmdldChmdW5jUHRyKX1yZXR1cm4gZnVuY312YXIgc3RydWN0UmVnaXN0cmF0aW9ucz17fTtmdW5jdGlvbiBydW5EZXN0cnVjdG9ycyhkZXN0cnVjdG9ycyl7d2hpbGUoZGVzdHJ1Y3RvcnMubGVuZ3RoKXt2YXIgcHRyPWRlc3RydWN0b3JzLnBvcCgpO3ZhciBkZWw9ZGVzdHJ1Y3RvcnMucG9wKCk7ZGVsKHB0cil9fWZ1bmN0aW9uIHNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQVTMyW3BvaW50ZXI+PjJdKX12YXIgYXdhaXRpbmdEZXBlbmRlbmNpZXM9e307dmFyIHJlZ2lzdGVyZWRUeXBlcz17fTt2YXIgdHlwZURlcGVuZGVuY2llcz17fTt2YXIgY2hhcl8wPTQ4O3ZhciBjaGFyXzk9NTc7ZnVuY3Rpb24gbWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpe2lmKHVuZGVmaW5lZD09PW5hbWUpe3JldHVybiJfdW5rbm93biJ9bmFtZT1uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05X10vZywiJCIpO3ZhciBmPW5hbWUuY2hhckNvZGVBdCgwKTtpZihmPj1jaGFyXzAmJmY8PWNoYXJfOSl7cmV0dXJuIl8iK25hbWV9ZWxzZXtyZXR1cm4gbmFtZX19ZnVuY3Rpb24gY3JlYXRlTmFtZWRGdW5jdGlvbihuYW1lLGJvZHkpe25hbWU9bWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpO3ZhciBmbj1mdW5jdGlvbigpe3JldHVybiBib2R5LmFwcGx5KHRoaXMsYXJndW1lbnRzKX07dHJ5e09iamVjdC5kZWZpbmVQcm9wZXJ0eShmbiwibmFtZSIse3ZhbHVlOm5hbWV9KX1jYXRjaChlKXt9cmV0dXJuIGZufWZ1bmN0aW9uIGV4dGVuZEVycm9yKGJhc2VFcnJvclR5cGUsZXJyb3JOYW1lKXt2YXIgZXJyb3JDbGFzcz1jcmVhdGVOYW1lZEZ1bmN0aW9uKGVycm9yTmFtZSxmdW5jdGlvbihtZXNzYWdlKXt0aGlzLm5hbWU9ZXJyb3JOYW1lO3RoaXMubWVzc2FnZT1tZXNzYWdlO3ZhciBzdGFjaz1uZXcgRXJyb3IobWVzc2FnZSkuc3RhY2s7aWYoc3RhY2shPT11bmRlZmluZWQpe3RoaXMuc3RhY2s9dGhpcy50b1N0cmluZygpKyJcbiIrc3RhY2sucmVwbGFjZSgvXkVycm9yKDpbXlxuXSopP1xuLywiIil9fSk7ZXJyb3JDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiYXNlRXJyb3JUeXBlLnByb3RvdHlwZSk7ZXJyb3JDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3I9ZXJyb3JDbGFzcztlcnJvckNsYXNzLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe2lmKHRoaXMubWVzc2FnZT09PXVuZGVmaW5lZCl7cmV0dXJuIHRoaXMubmFtZX1lbHNle3JldHVybiB0aGlzLm5hbWUrIjogIit0aGlzLm1lc3NhZ2V9fTtyZXR1cm4gZXJyb3JDbGFzc312YXIgSW50ZXJuYWxFcnJvcj11bmRlZmluZWQ7ZnVuY3Rpb24gdGhyb3dJbnRlcm5hbEVycm9yKG1lc3NhZ2Upe3Rocm93IG5ldyBJbnRlcm5hbEVycm9yKG1lc3NhZ2UpfWZ1bmN0aW9uIHdoZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKG15VHlwZXMsZGVwZW5kZW50VHlwZXMsZ2V0VHlwZUNvbnZlcnRlcnMpe215VHlwZXMuZm9yRWFjaChmdW5jdGlvbih0eXBlKXt0eXBlRGVwZW5kZW5jaWVzW3R5cGVdPWRlcGVuZGVudFR5cGVzfSk7ZnVuY3Rpb24gb25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl7dmFyIG15VHlwZUNvbnZlcnRlcnM9Z2V0VHlwZUNvbnZlcnRlcnModHlwZUNvbnZlcnRlcnMpO2lmKG15VHlwZUNvbnZlcnRlcnMubGVuZ3RoIT09bXlUeXBlcy5sZW5ndGgpe3Rocm93SW50ZXJuYWxFcnJvcigiTWlzbWF0Y2hlZCB0eXBlIGNvbnZlcnRlciBjb3VudCIpfWZvcih2YXIgaT0wO2k8bXlUeXBlcy5sZW5ndGg7KytpKXtyZWdpc3RlclR5cGUobXlUeXBlc1tpXSxteVR5cGVDb252ZXJ0ZXJzW2ldKX19dmFyIHR5cGVDb252ZXJ0ZXJzPW5ldyBBcnJheShkZXBlbmRlbnRUeXBlcy5sZW5ndGgpO3ZhciB1bnJlZ2lzdGVyZWRUeXBlcz1bXTt2YXIgcmVnaXN0ZXJlZD0wO2RlcGVuZGVudFR5cGVzLmZvckVhY2goZnVuY3Rpb24oZHQsaSl7aWYocmVnaXN0ZXJlZFR5cGVzLmhhc093blByb3BlcnR5KGR0KSl7dHlwZUNvbnZlcnRlcnNbaV09cmVnaXN0ZXJlZFR5cGVzW2R0XX1lbHNle3VucmVnaXN0ZXJlZFR5cGVzLnB1c2goZHQpO2lmKCFhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShkdCkpe2F3YWl0aW5nRGVwZW5kZW5jaWVzW2R0XT1bXX1hd2FpdGluZ0RlcGVuZGVuY2llc1tkdF0ucHVzaChmdW5jdGlvbigpe3R5cGVDb252ZXJ0ZXJzW2ldPXJlZ2lzdGVyZWRUeXBlc1tkdF07KytyZWdpc3RlcmVkO2lmKHJlZ2lzdGVyZWQ9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX0pfX0pO2lmKDA9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX1mdW5jdGlvbiBfX2VtYmluZF9maW5hbGl6ZV92YWx1ZV9vYmplY3Qoc3RydWN0VHlwZSl7dmFyIHJlZz1zdHJ1Y3RSZWdpc3RyYXRpb25zW3N0cnVjdFR5cGVdO2RlbGV0ZSBzdHJ1Y3RSZWdpc3RyYXRpb25zW3N0cnVjdFR5cGVdO3ZhciByYXdDb25zdHJ1Y3Rvcj1yZWcucmF3Q29uc3RydWN0b3I7dmFyIHJhd0Rlc3RydWN0b3I9cmVnLnJhd0Rlc3RydWN0b3I7dmFyIGZpZWxkUmVjb3Jkcz1yZWcuZmllbGRzO3ZhciBmaWVsZFR5cGVzPWZpZWxkUmVjb3Jkcy5tYXAoZnVuY3Rpb24oZmllbGQpe3JldHVybiBmaWVsZC5nZXR0ZXJSZXR1cm5UeXBlfSkuY29uY2F0KGZpZWxkUmVjb3Jkcy5tYXAoZnVuY3Rpb24oZmllbGQpe3JldHVybiBmaWVsZC5zZXR0ZXJBcmd1bWVudFR5cGV9KSk7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW3N0cnVjdFR5cGVdLGZpZWxkVHlwZXMsZnVuY3Rpb24oZmllbGRUeXBlcyl7dmFyIGZpZWxkcz17fTtmaWVsZFJlY29yZHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZCxpKXt2YXIgZmllbGROYW1lPWZpZWxkLmZpZWxkTmFtZTt2YXIgZ2V0dGVyUmV0dXJuVHlwZT1maWVsZFR5cGVzW2ldO3ZhciBnZXR0ZXI9ZmllbGQuZ2V0dGVyO3ZhciBnZXR0ZXJDb250ZXh0PWZpZWxkLmdldHRlckNvbnRleHQ7dmFyIHNldHRlckFyZ3VtZW50VHlwZT1maWVsZFR5cGVzW2krZmllbGRSZWNvcmRzLmxlbmd0aF07dmFyIHNldHRlcj1maWVsZC5zZXR0ZXI7dmFyIHNldHRlckNvbnRleHQ9ZmllbGQuc2V0dGVyQ29udGV4dDtmaWVsZHNbZmllbGROYW1lXT17cmVhZDpmdW5jdGlvbihwdHIpe3JldHVybiBnZXR0ZXJSZXR1cm5UeXBlWyJmcm9tV2lyZVR5cGUiXShnZXR0ZXIoZ2V0dGVyQ29udGV4dCxwdHIpKX0sd3JpdGU6ZnVuY3Rpb24ocHRyLG8pe3ZhciBkZXN0cnVjdG9ycz1bXTtzZXR0ZXIoc2V0dGVyQ29udGV4dCxwdHIsc2V0dGVyQXJndW1lbnRUeXBlWyJ0b1dpcmVUeXBlIl0oZGVzdHJ1Y3RvcnMsbykpO3J1bkRlc3RydWN0b3JzKGRlc3RydWN0b3JzKX19fSk7cmV0dXJuW3tuYW1lOnJlZy5uYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHB0cil7dmFyIHJ2PXt9O2Zvcih2YXIgaSBpbiBmaWVsZHMpe3J2W2ldPWZpZWxkc1tpXS5yZWFkKHB0cil9cmF3RGVzdHJ1Y3RvcihwdHIpO3JldHVybiBydn0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLG8pe2Zvcih2YXIgZmllbGROYW1lIGluIGZpZWxkcyl7aWYoIShmaWVsZE5hbWUgaW4gbykpe3Rocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgZmllbGQ6ICAiJytmaWVsZE5hbWUrJyInKX19dmFyIHB0cj1yYXdDb25zdHJ1Y3RvcigpO2ZvcihmaWVsZE5hbWUgaW4gZmllbGRzKXtmaWVsZHNbZmllbGROYW1lXS53cml0ZShwdHIsb1tmaWVsZE5hbWVdKX1pZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2gocmF3RGVzdHJ1Y3RvcixwdHIpfXJldHVybiBwdHJ9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpyYXdEZXN0cnVjdG9yfV19KX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQocHJpbWl0aXZlVHlwZSxuYW1lLHNpemUsbWluUmFuZ2UsbWF4UmFuZ2Upe31mdW5jdGlvbiBnZXRTaGlmdEZyb21TaXplKHNpemUpe3N3aXRjaChzaXplKXtjYXNlIDE6cmV0dXJuIDA7Y2FzZSAyOnJldHVybiAxO2Nhc2UgNDpyZXR1cm4gMjtjYXNlIDg6cmV0dXJuIDM7ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIHR5cGUgc2l6ZTogIitzaXplKX19ZnVuY3Rpb24gZW1iaW5kX2luaXRfY2hhckNvZGVzKCl7dmFyIGNvZGVzPW5ldyBBcnJheSgyNTYpO2Zvcih2YXIgaT0wO2k8MjU2OysraSl7Y29kZXNbaV09U3RyaW5nLmZyb21DaGFyQ29kZShpKX1lbWJpbmRfY2hhckNvZGVzPWNvZGVzfXZhciBlbWJpbmRfY2hhckNvZGVzPXVuZGVmaW5lZDtmdW5jdGlvbiByZWFkTGF0aW4xU3RyaW5nKHB0cil7dmFyIHJldD0iIjt2YXIgYz1wdHI7d2hpbGUoSEVBUFU4W2NdKXtyZXQrPWVtYmluZF9jaGFyQ29kZXNbSEVBUFU4W2MrK11dfXJldHVybiByZXR9dmFyIEJpbmRpbmdFcnJvcj11bmRlZmluZWQ7ZnVuY3Rpb24gdGhyb3dCaW5kaW5nRXJyb3IobWVzc2FnZSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihtZXNzYWdlKX1mdW5jdGlvbiByZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucz17fSl7aWYoISgiYXJnUGFja0FkdmFuY2UiaW4gcmVnaXN0ZXJlZEluc3RhbmNlKSl7dGhyb3cgbmV3IFR5cGVFcnJvcigicmVnaXN0ZXJUeXBlIHJlZ2lzdGVyZWRJbnN0YW5jZSByZXF1aXJlcyBhcmdQYWNrQWR2YW5jZSIpfXZhciBuYW1lPXJlZ2lzdGVyZWRJbnN0YW5jZS5uYW1lO2lmKCFyYXdUeXBlKXt0aHJvd0JpbmRpbmdFcnJvcigndHlwZSAiJytuYW1lKyciIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXInKX1pZihyZWdpc3RlcmVkVHlwZXMuaGFzT3duUHJvcGVydHkocmF3VHlwZSkpe2lmKG9wdGlvbnMuaWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9ucyl7cmV0dXJufWVsc2V7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCByZWdpc3RlciB0eXBlICciK25hbWUrIicgdHdpY2UiKX19cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdPXJlZ2lzdGVyZWRJbnN0YW5jZTtkZWxldGUgdHlwZURlcGVuZGVuY2llc1tyYXdUeXBlXTtpZihhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7dmFyIGNhbGxiYWNrcz1hd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtkZWxldGUgYXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07Y2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24oY2Ipe2NiKCl9KX19ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfYm9vbChyYXdUeXBlLG5hbWUsc2l6ZSx0cnVlVmFsdWUsZmFsc2VWYWx1ZSl7dmFyIHNoaWZ0PWdldFNoaWZ0RnJvbVNpemUoc2l6ZSk7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24od3Qpe3JldHVybiEhd3R9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyxvKXtyZXR1cm4gbz90cnVlVmFsdWU6ZmFsc2VWYWx1ZX0sImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZnVuY3Rpb24ocG9pbnRlcil7dmFyIGhlYXA7aWYoc2l6ZT09PTEpe2hlYXA9SEVBUDh9ZWxzZSBpZihzaXplPT09Mil7aGVhcD1IRUFQMTZ9ZWxzZSBpZihzaXplPT09NCl7aGVhcD1IRUFQMzJ9ZWxzZXt0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIGJvb2xlYW4gdHlwZSBzaXplOiAiK25hbWUpfXJldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShoZWFwW3BvaW50ZXI+PnNoaWZ0XSl9LGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfY29uc3RhbnQobmFtZSx0eXBlLHZhbHVlKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10sW3R5cGVdLGZ1bmN0aW9uKHR5cGUpe3R5cGU9dHlwZVswXTtNb2R1bGVbbmFtZV09dHlwZVsiZnJvbVdpcmVUeXBlIl0odmFsdWUpO3JldHVybltdfSl9dmFyIGVtdmFsX2ZyZWVfbGlzdD1bXTt2YXIgZW12YWxfaGFuZGxlX2FycmF5PVt7fSx7dmFsdWU6dW5kZWZpbmVkfSx7dmFsdWU6bnVsbH0se3ZhbHVlOnRydWV9LHt2YWx1ZTpmYWxzZX1dO2Z1bmN0aW9uIF9fZW12YWxfZGVjcmVmKGhhbmRsZSl7aWYoaGFuZGxlPjQmJjA9PT0tLWVtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdLnJlZmNvdW50KXtlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXT11bmRlZmluZWQ7ZW12YWxfZnJlZV9saXN0LnB1c2goaGFuZGxlKX19ZnVuY3Rpb24gY291bnRfZW12YWxfaGFuZGxlcygpe3ZhciBjb3VudD0wO2Zvcih2YXIgaT01O2k8ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZV9hcnJheVtpXSE9PXVuZGVmaW5lZCl7Kytjb3VudH19cmV0dXJuIGNvdW50fWZ1bmN0aW9uIGdldF9maXJzdF9lbXZhbCgpe2Zvcih2YXIgaT01O2k8ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZV9hcnJheVtpXSE9PXVuZGVmaW5lZCl7cmV0dXJuIGVtdmFsX2hhbmRsZV9hcnJheVtpXX19cmV0dXJuIG51bGx9ZnVuY3Rpb24gaW5pdF9lbXZhbCgpe01vZHVsZVsiY291bnRfZW12YWxfaGFuZGxlcyJdPWNvdW50X2VtdmFsX2hhbmRsZXM7TW9kdWxlWyJnZXRfZmlyc3RfZW12YWwiXT1nZXRfZmlyc3RfZW12YWx9dmFyIEVtdmFsPXt0b1ZhbHVlOmZ1bmN0aW9uKGhhbmRsZSl7aWYoIWhhbmRsZSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCB1c2UgZGVsZXRlZCB2YWwuIGhhbmRsZSA9ICIraGFuZGxlKX1yZXR1cm4gZW12YWxfaGFuZGxlX2FycmF5W2hhbmRsZV0udmFsdWV9LHRvSGFuZGxlOmZ1bmN0aW9uKHZhbHVlKXtzd2l0Y2godmFsdWUpe2Nhc2UgdW5kZWZpbmVkOntyZXR1cm4gMX1jYXNlIG51bGw6e3JldHVybiAyfWNhc2UgdHJ1ZTp7cmV0dXJuIDN9Y2FzZSBmYWxzZTp7cmV0dXJuIDR9ZGVmYXVsdDp7dmFyIGhhbmRsZT1lbXZhbF9mcmVlX2xpc3QubGVuZ3RoP2VtdmFsX2ZyZWVfbGlzdC5wb3AoKTplbXZhbF9oYW5kbGVfYXJyYXkubGVuZ3RoO2VtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdPXtyZWZjb3VudDoxLHZhbHVlOnZhbHVlfTtyZXR1cm4gaGFuZGxlfX19fTtmdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbChyYXdUeXBlLG5hbWUpe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKGhhbmRsZSl7dmFyIHJ2PUVtdmFsLnRvVmFsdWUoaGFuZGxlKTtfX2VtdmFsX2RlY3JlZihoYW5kbGUpO3JldHVybiBydn0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtyZXR1cm4gRW12YWwudG9IYW5kbGUodmFsdWUpfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfWZ1bmN0aW9uIGVuc3VyZU92ZXJsb2FkVGFibGUocHJvdG8sbWV0aG9kTmFtZSxodW1hbk5hbWUpe2lmKHVuZGVmaW5lZD09PXByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUpe3ZhciBwcmV2RnVuYz1wcm90b1ttZXRob2ROYW1lXTtwcm90b1ttZXRob2ROYW1lXT1mdW5jdGlvbigpe2lmKCFwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlLmhhc093blByb3BlcnR5KGFyZ3VtZW50cy5sZW5ndGgpKXt0aHJvd0JpbmRpbmdFcnJvcigiRnVuY3Rpb24gJyIraHVtYW5OYW1lKyInIGNhbGxlZCB3aXRoIGFuIGludmFsaWQgbnVtYmVyIG9mIGFyZ3VtZW50cyAoIithcmd1bWVudHMubGVuZ3RoKyIpIC0gZXhwZWN0cyBvbmUgb2YgKCIrcHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZSsiKSEiKX1yZXR1cm4gcHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVthcmd1bWVudHMubGVuZ3RoXS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGU9W107cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVtwcmV2RnVuYy5hcmdDb3VudF09cHJldkZ1bmN9fWZ1bmN0aW9uIGV4cG9zZVB1YmxpY1N5bWJvbChuYW1lLHZhbHVlLG51bUFyZ3VtZW50cyl7aWYoTW9kdWxlLmhhc093blByb3BlcnR5KG5hbWUpKXtpZih1bmRlZmluZWQ9PT1udW1Bcmd1bWVudHN8fHVuZGVmaW5lZCE9PU1vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlJiZ1bmRlZmluZWQhPT1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZVtudW1Bcmd1bWVudHNdKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHJlZ2lzdGVyIHB1YmxpYyBuYW1lICciK25hbWUrIicgdHdpY2UiKX1lbnN1cmVPdmVybG9hZFRhYmxlKE1vZHVsZSxuYW1lLG5hbWUpO2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShudW1Bcmd1bWVudHMpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHJlZ2lzdGVyIG11bHRpcGxlIG92ZXJsb2FkcyBvZiBhIGZ1bmN0aW9uIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyAoIitudW1Bcmd1bWVudHMrIikhIil9TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXT12YWx1ZX1lbHNle01vZHVsZVtuYW1lXT12YWx1ZTtpZih1bmRlZmluZWQhPT1udW1Bcmd1bWVudHMpe01vZHVsZVtuYW1lXS5udW1Bcmd1bWVudHM9bnVtQXJndW1lbnRzfX19ZnVuY3Rpb24gZW51bVJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2hpZnQsc2lnbmVkKXtzd2l0Y2goc2hpZnQpe2Nhc2UgMDpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7dmFyIGhlYXA9c2lnbmVkP0hFQVA4OkhFQVBVODtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oaGVhcFtwb2ludGVyXSl9O2Nhc2UgMTpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7dmFyIGhlYXA9c2lnbmVkP0hFQVAxNjpIRUFQVTE2O3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShoZWFwW3BvaW50ZXI+PjFdKX07Y2FzZSAyOnJldHVybiBmdW5jdGlvbihwb2ludGVyKXt2YXIgaGVhcD1zaWduZWQ/SEVBUDMyOkhFQVBVMzI7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKGhlYXBbcG9pbnRlcj4+Ml0pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gaW50ZWdlciB0eXBlOiAiK25hbWUpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9lbnVtKHJhd1R5cGUsbmFtZSxzaXplLGlzU2lnbmVkKXt2YXIgc2hpZnQ9Z2V0U2hpZnRGcm9tU2l6ZShzaXplKTtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7ZnVuY3Rpb24gY3Rvcigpe31jdG9yLnZhbHVlcz17fTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLGNvbnN0cnVjdG9yOmN0b3IsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24oYyl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3IudmFsdWVzW2NdfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsYyl7cmV0dXJuIGMudmFsdWV9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmVudW1SZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNoaWZ0LGlzU2lnbmVkKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pO2V4cG9zZVB1YmxpY1N5bWJvbChuYW1lLGN0b3IpfWZ1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGUpe3ZhciBwdHI9X19fZ2V0VHlwZU5hbWUodHlwZSk7dmFyIHJ2PXJlYWRMYXRpbjFTdHJpbmcocHRyKTtfZnJlZShwdHIpO3JldHVybiBydn1mdW5jdGlvbiByZXF1aXJlUmVnaXN0ZXJlZFR5cGUocmF3VHlwZSxodW1hbk5hbWUpe3ZhciBpbXBsPXJlZ2lzdGVyZWRUeXBlc1tyYXdUeXBlXTtpZih1bmRlZmluZWQ9PT1pbXBsKXt0aHJvd0JpbmRpbmdFcnJvcihodW1hbk5hbWUrIiBoYXMgdW5rbm93biB0eXBlICIrZ2V0VHlwZU5hbWUocmF3VHlwZSkpfXJldHVybiBpbXBsfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2VudW1fdmFsdWUocmF3RW51bVR5cGUsbmFtZSxlbnVtVmFsdWUpe3ZhciBlbnVtVHlwZT1yZXF1aXJlUmVnaXN0ZXJlZFR5cGUocmF3RW51bVR5cGUsImVudW0iKTtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIEVudW09ZW51bVR5cGUuY29uc3RydWN0b3I7dmFyIFZhbHVlPU9iamVjdC5jcmVhdGUoZW51bVR5cGUuY29uc3RydWN0b3IucHJvdG90eXBlLHt2YWx1ZTp7dmFsdWU6ZW51bVZhbHVlfSxjb25zdHJ1Y3Rvcjp7dmFsdWU6Y3JlYXRlTmFtZWRGdW5jdGlvbihlbnVtVHlwZS5uYW1lKyJfIituYW1lLGZ1bmN0aW9uKCl7fSl9fSk7RW51bS52YWx1ZXNbZW51bVZhbHVlXT1WYWx1ZTtFbnVtW25hbWVdPVZhbHVlfWZ1bmN0aW9uIGZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCl7c3dpdGNoKHNoaWZ0KXtjYXNlIDI6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQRjMyW3BvaW50ZXI+PjJdKX07Y2FzZSAzOnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEY2NFtwb2ludGVyPj4zXSl9O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biBmbG9hdCB0eXBlOiAiK25hbWUpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdChyYXdUeXBlLG5hbWUsc2l6ZSl7dmFyIHNoaWZ0PWdldFNoaWZ0RnJvbVNpemUoc2l6ZSk7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24odmFsdWUpe3JldHVybiB2YWx1ZX0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtyZXR1cm4gdmFsdWV9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBuZXdfKGNvbnN0cnVjdG9yLGFyZ3VtZW50TGlzdCl7aWYoIShjb25zdHJ1Y3RvciBpbnN0YW5jZW9mIEZ1bmN0aW9uKSl7dGhyb3cgbmV3IFR5cGVFcnJvcigibmV3XyBjYWxsZWQgd2l0aCBjb25zdHJ1Y3RvciB0eXBlICIrdHlwZW9mIGNvbnN0cnVjdG9yKyIgd2hpY2ggaXMgbm90IGEgZnVuY3Rpb24iKX12YXIgZHVtbXk9Y3JlYXRlTmFtZWRGdW5jdGlvbihjb25zdHJ1Y3Rvci5uYW1lfHwidW5rbm93bkZ1bmN0aW9uTmFtZSIsZnVuY3Rpb24oKXt9KTtkdW1teS5wcm90b3R5cGU9Y29uc3RydWN0b3IucHJvdG90eXBlO3ZhciBvYmo9bmV3IGR1bW15O3ZhciByPWNvbnN0cnVjdG9yLmFwcGx5KG9iaixhcmd1bWVudExpc3QpO3JldHVybiByIGluc3RhbmNlb2YgT2JqZWN0P3I6b2JqfWZ1bmN0aW9uIGNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxjbGFzc1R5cGUsY3BwSW52b2tlckZ1bmMsY3BwVGFyZ2V0RnVuYyl7dmFyIGFyZ0NvdW50PWFyZ1R5cGVzLmxlbmd0aDtpZihhcmdDb3VudDwyKXt0aHJvd0JpbmRpbmdFcnJvcigiYXJnVHlwZXMgYXJyYXkgc2l6ZSBtaXNtYXRjaCEgTXVzdCBhdCBsZWFzdCBnZXQgcmV0dXJuIHZhbHVlIGFuZCAndGhpcycgdHlwZXMhIil9dmFyIGlzQ2xhc3NNZXRob2RGdW5jPWFyZ1R5cGVzWzFdIT09bnVsbCYmY2xhc3NUeXBlIT09bnVsbDt2YXIgbmVlZHNEZXN0cnVjdG9yU3RhY2s9ZmFsc2U7Zm9yKHZhciBpPTE7aTxhcmdUeXBlcy5sZW5ndGg7KytpKXtpZihhcmdUeXBlc1tpXSE9PW51bGwmJmFyZ1R5cGVzW2ldLmRlc3RydWN0b3JGdW5jdGlvbj09PXVuZGVmaW5lZCl7bmVlZHNEZXN0cnVjdG9yU3RhY2s9dHJ1ZTticmVha319dmFyIHJldHVybnM9YXJnVHlwZXNbMF0ubmFtZSE9PSJ2b2lkIjt2YXIgYXJnc0xpc3Q9IiI7dmFyIGFyZ3NMaXN0V2lyZWQ9IiI7Zm9yKHZhciBpPTA7aTxhcmdDb3VudC0yOysraSl7YXJnc0xpc3QrPShpIT09MD8iLCAiOiIiKSsiYXJnIitpO2FyZ3NMaXN0V2lyZWQrPShpIT09MD8iLCAiOiIiKSsiYXJnIitpKyJXaXJlZCJ9dmFyIGludm9rZXJGbkJvZHk9InJldHVybiBmdW5jdGlvbiAiK21ha2VMZWdhbEZ1bmN0aW9uTmFtZShodW1hbk5hbWUpKyIoIithcmdzTGlzdCsiKSB7XG4iKyJpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gIisoYXJnQ291bnQtMikrIikge1xuIisidGhyb3dCaW5kaW5nRXJyb3IoJ2Z1bmN0aW9uICIraHVtYW5OYW1lKyIgY2FsbGVkIHdpdGggJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIGFyZ3VtZW50cywgZXhwZWN0ZWQgIisoYXJnQ291bnQtMikrIiBhcmdzIScpO1xuIisifVxuIjtpZihuZWVkc0Rlc3RydWN0b3JTdGFjayl7aW52b2tlckZuQm9keSs9InZhciBkZXN0cnVjdG9ycyA9IFtdO1xuIn12YXIgZHRvclN0YWNrPW5lZWRzRGVzdHJ1Y3RvclN0YWNrPyJkZXN0cnVjdG9ycyI6Im51bGwiO3ZhciBhcmdzMT1bInRocm93QmluZGluZ0Vycm9yIiwiaW52b2tlciIsImZuIiwicnVuRGVzdHJ1Y3RvcnMiLCJyZXRUeXBlIiwiY2xhc3NQYXJhbSJdO3ZhciBhcmdzMj1bdGhyb3dCaW5kaW5nRXJyb3IsY3BwSW52b2tlckZ1bmMsY3BwVGFyZ2V0RnVuYyxydW5EZXN0cnVjdG9ycyxhcmdUeXBlc1swXSxhcmdUeXBlc1sxXV07aWYoaXNDbGFzc01ldGhvZEZ1bmMpe2ludm9rZXJGbkJvZHkrPSJ2YXIgdGhpc1dpcmVkID0gY2xhc3NQYXJhbS50b1dpcmVUeXBlKCIrZHRvclN0YWNrKyIsIHRoaXMpO1xuIn1mb3IodmFyIGk9MDtpPGFyZ0NvdW50LTI7KytpKXtpbnZva2VyRm5Cb2R5Kz0idmFyIGFyZyIraSsiV2lyZWQgPSBhcmdUeXBlIitpKyIudG9XaXJlVHlwZSgiK2R0b3JTdGFjaysiLCBhcmciK2krIik7IC8vICIrYXJnVHlwZXNbaSsyXS5uYW1lKyJcbiI7YXJnczEucHVzaCgiYXJnVHlwZSIraSk7YXJnczIucHVzaChhcmdUeXBlc1tpKzJdKX1pZihpc0NsYXNzTWV0aG9kRnVuYyl7YXJnc0xpc3RXaXJlZD0idGhpc1dpcmVkIisoYXJnc0xpc3RXaXJlZC5sZW5ndGg+MD8iLCAiOiIiKSthcmdzTGlzdFdpcmVkfWludm9rZXJGbkJvZHkrPShyZXR1cm5zPyJ2YXIgcnYgPSAiOiIiKSsiaW52b2tlcihmbiIrKGFyZ3NMaXN0V2lyZWQubGVuZ3RoPjA/IiwgIjoiIikrYXJnc0xpc3RXaXJlZCsiKTtcbiI7aWYobmVlZHNEZXN0cnVjdG9yU3RhY2spe2ludm9rZXJGbkJvZHkrPSJydW5EZXN0cnVjdG9ycyhkZXN0cnVjdG9ycyk7XG4ifWVsc2V7Zm9yKHZhciBpPWlzQ2xhc3NNZXRob2RGdW5jPzE6MjtpPGFyZ1R5cGVzLmxlbmd0aDsrK2kpe3ZhciBwYXJhbU5hbWU9aT09PTE/InRoaXNXaXJlZCI6ImFyZyIrKGktMikrIldpcmVkIjtpZihhcmdUeXBlc1tpXS5kZXN0cnVjdG9yRnVuY3Rpb24hPT1udWxsKXtpbnZva2VyRm5Cb2R5Kz1wYXJhbU5hbWUrIl9kdG9yKCIrcGFyYW1OYW1lKyIpOyAvLyAiK2FyZ1R5cGVzW2ldLm5hbWUrIlxuIjthcmdzMS5wdXNoKHBhcmFtTmFtZSsiX2R0b3IiKTthcmdzMi5wdXNoKGFyZ1R5cGVzW2ldLmRlc3RydWN0b3JGdW5jdGlvbil9fX1pZihyZXR1cm5zKXtpbnZva2VyRm5Cb2R5Kz0idmFyIHJldCA9IHJldFR5cGUuZnJvbVdpcmVUeXBlKHJ2KTtcbiIrInJldHVybiByZXQ7XG4ifWVsc2V7fWludm9rZXJGbkJvZHkrPSJ9XG4iO2FyZ3MxLnB1c2goaW52b2tlckZuQm9keSk7dmFyIGludm9rZXJGdW5jdGlvbj1uZXdfKEZ1bmN0aW9uLGFyZ3MxKS5hcHBseShudWxsLGFyZ3MyKTtyZXR1cm4gaW52b2tlckZ1bmN0aW9ufWZ1bmN0aW9uIGhlYXAzMlZlY3RvclRvQXJyYXkoY291bnQsZmlyc3RFbGVtZW50KXt2YXIgYXJyYXk9W107Zm9yKHZhciBpPTA7aTxjb3VudDtpKyspe2FycmF5LnB1c2goSEVBUDMyWyhmaXJzdEVsZW1lbnQ+PjIpK2ldKX1yZXR1cm4gYXJyYXl9ZnVuY3Rpb24gcmVwbGFjZVB1YmxpY1N5bWJvbChuYW1lLHZhbHVlLG51bUFyZ3VtZW50cyl7aWYoIU1vZHVsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSl7dGhyb3dJbnRlcm5hbEVycm9yKCJSZXBsYWNpbmcgbm9uZXhpc3RhbnQgcHVibGljIHN5bWJvbCIpfWlmKHVuZGVmaW5lZCE9PU1vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlJiZ1bmRlZmluZWQhPT1udW1Bcmd1bWVudHMpe01vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlW251bUFyZ3VtZW50c109dmFsdWV9ZWxzZXtNb2R1bGVbbmFtZV09dmFsdWU7TW9kdWxlW25hbWVdLmFyZ0NvdW50PW51bUFyZ3VtZW50c319ZnVuY3Rpb24gZHluQ2FsbExlZ2FjeShzaWcscHRyLGFyZ3Mpe3ZhciBmPU1vZHVsZVsiZHluQ2FsbF8iK3NpZ107cmV0dXJuIGFyZ3MmJmFyZ3MubGVuZ3RoP2YuYXBwbHkobnVsbCxbcHRyXS5jb25jYXQoYXJncykpOmYuY2FsbChudWxsLHB0cil9ZnVuY3Rpb24gZHluQ2FsbChzaWcscHRyLGFyZ3Mpe2lmKHNpZy5pbmNsdWRlcygiaiIpKXtyZXR1cm4gZHluQ2FsbExlZ2FjeShzaWcscHRyLGFyZ3MpfXJldHVybiBnZXRXYXNtVGFibGVFbnRyeShwdHIpLmFwcGx5KG51bGwsYXJncyl9ZnVuY3Rpb24gZ2V0RHluQ2FsbGVyKHNpZyxwdHIpe3ZhciBhcmdDYWNoZT1bXTtyZXR1cm4gZnVuY3Rpb24oKXthcmdDYWNoZS5sZW5ndGg9YXJndW1lbnRzLmxlbmd0aDtmb3IodmFyIGk9MDtpPGFyZ3VtZW50cy5sZW5ndGg7aSsrKXthcmdDYWNoZVtpXT1hcmd1bWVudHNbaV19cmV0dXJuIGR5bkNhbGwoc2lnLHB0cixhcmdDYWNoZSl9fWZ1bmN0aW9uIGVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKHNpZ25hdHVyZSxyYXdGdW5jdGlvbil7c2lnbmF0dXJlPXJlYWRMYXRpbjFTdHJpbmcoc2lnbmF0dXJlKTtmdW5jdGlvbiBtYWtlRHluQ2FsbGVyKCl7aWYoc2lnbmF0dXJlLmluY2x1ZGVzKCJqIikpe3JldHVybiBnZXREeW5DYWxsZXIoc2lnbmF0dXJlLHJhd0Z1bmN0aW9uKX1yZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkocmF3RnVuY3Rpb24pfXZhciBmcD1tYWtlRHluQ2FsbGVyKCk7aWYodHlwZW9mIGZwIT09ImZ1bmN0aW9uIil7dGhyb3dCaW5kaW5nRXJyb3IoInVua25vd24gZnVuY3Rpb24gcG9pbnRlciB3aXRoIHNpZ25hdHVyZSAiK3NpZ25hdHVyZSsiOiAiK3Jhd0Z1bmN0aW9uKX1yZXR1cm4gZnB9dmFyIFVuYm91bmRUeXBlRXJyb3I9dW5kZWZpbmVkO2Z1bmN0aW9uIHRocm93VW5ib3VuZFR5cGVFcnJvcihtZXNzYWdlLHR5cGVzKXt2YXIgdW5ib3VuZFR5cGVzPVtdO3ZhciBzZWVuPXt9O2Z1bmN0aW9uIHZpc2l0KHR5cGUpe2lmKHNlZW5bdHlwZV0pe3JldHVybn1pZihyZWdpc3RlcmVkVHlwZXNbdHlwZV0pe3JldHVybn1pZih0eXBlRGVwZW5kZW5jaWVzW3R5cGVdKXt0eXBlRGVwZW5kZW5jaWVzW3R5cGVdLmZvckVhY2godmlzaXQpO3JldHVybn11bmJvdW5kVHlwZXMucHVzaCh0eXBlKTtzZWVuW3R5cGVdPXRydWV9dHlwZXMuZm9yRWFjaCh2aXNpdCk7dGhyb3cgbmV3IFVuYm91bmRUeXBlRXJyb3IobWVzc2FnZSsiOiAiK3VuYm91bmRUeXBlcy5tYXAoZ2V0VHlwZU5hbWUpLmpvaW4oWyIsICJdKSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfZnVuY3Rpb24obmFtZSxhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIsc2lnbmF0dXJlLHJhd0ludm9rZXIsZm4pe3ZhciBhcmdUeXBlcz1oZWFwMzJWZWN0b3JUb0FycmF5KGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcik7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3Jhd0ludm9rZXI9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oc2lnbmF0dXJlLHJhd0ludm9rZXIpO2V4cG9zZVB1YmxpY1N5bWJvbChuYW1lLGZ1bmN0aW9uKCl7dGhyb3dVbmJvdW5kVHlwZUVycm9yKCJDYW5ub3QgY2FsbCAiK25hbWUrIiBkdWUgdG8gdW5ib3VuZCB0eXBlcyIsYXJnVHlwZXMpfSxhcmdDb3VudC0xKTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxhcmdUeXBlcyxmdW5jdGlvbihhcmdUeXBlcyl7dmFyIGludm9rZXJBcmdzQXJyYXk9W2FyZ1R5cGVzWzBdLG51bGxdLmNvbmNhdChhcmdUeXBlcy5zbGljZSgxKSk7cmVwbGFjZVB1YmxpY1N5bWJvbChuYW1lLGNyYWZ0SW52b2tlckZ1bmN0aW9uKG5hbWUsaW52b2tlckFyZ3NBcnJheSxudWxsLHJhd0ludm9rZXIsZm4pLGFyZ0NvdW50LTEpO3JldHVybltdfSl9ZnVuY3Rpb24gaW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2hpZnQsc2lnbmVkKXtzd2l0Y2goc2hpZnQpe2Nhc2UgMDpyZXR1cm4gc2lnbmVkP2Z1bmN0aW9uIHJlYWRTOEZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQOFtwb2ludGVyXX06ZnVuY3Rpb24gcmVhZFU4RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEhFQVBVOFtwb2ludGVyXX07Y2FzZSAxOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFMxNkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQMTZbcG9pbnRlcj4+MV19OmZ1bmN0aW9uIHJlYWRVMTZGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gSEVBUFUxNltwb2ludGVyPj4xXX07Y2FzZSAyOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFMzMkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQMzJbcG9pbnRlcj4+Ml19OmZ1bmN0aW9uIHJlYWRVMzJGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gSEVBUFUzMltwb2ludGVyPj4yXX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIGludGVnZXIgdHlwZTogIituYW1lKX19ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcihwcmltaXRpdmVUeXBlLG5hbWUsc2l6ZSxtaW5SYW5nZSxtYXhSYW5nZSl7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO2lmKG1heFJhbmdlPT09LTEpe21heFJhbmdlPTQyOTQ5NjcyOTV9dmFyIHNoaWZ0PWdldFNoaWZ0RnJvbVNpemUoc2l6ZSk7dmFyIGZyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU7aWYobWluUmFuZ2U9PT0wKXt2YXIgYml0c2hpZnQ9MzItOCpzaXplO2Zyb21XaXJlVHlwZT0odmFsdWU9PnZhbHVlPDxiaXRzaGlmdD4+PmJpdHNoaWZ0KX12YXIgaXNVbnNpZ25lZFR5cGU9bmFtZS5pbmNsdWRlcygidW5zaWduZWQiKTt2YXIgY2hlY2tBc3NlcnRpb25zPSh2YWx1ZSx0b1R5cGVOYW1lKT0+e307dmFyIHRvV2lyZVR5cGU7aWYoaXNVbnNpZ25lZFR5cGUpe3RvV2lyZVR5cGU9ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2NoZWNrQXNzZXJ0aW9ucyh2YWx1ZSx0aGlzLm5hbWUpO3JldHVybiB2YWx1ZT4+PjB9fWVsc2V7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlfX1yZWdpc3RlclR5cGUocHJpbWl0aXZlVHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZyb21XaXJlVHlwZSwidG9XaXJlVHlwZSI6dG9XaXJlVHlwZSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjppbnRlZ2VyUmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCxtaW5SYW5nZSE9PTApLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcocmF3VHlwZSxkYXRhVHlwZUluZGV4LG5hbWUpe3ZhciB0eXBlTWFwcGluZz1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXldO3ZhciBUQT10eXBlTWFwcGluZ1tkYXRhVHlwZUluZGV4XTtmdW5jdGlvbiBkZWNvZGVNZW1vcnlWaWV3KGhhbmRsZSl7aGFuZGxlPWhhbmRsZT4+Mjt2YXIgaGVhcD1IRUFQVTMyO3ZhciBzaXplPWhlYXBbaGFuZGxlXTt2YXIgZGF0YT1oZWFwW2hhbmRsZSsxXTtyZXR1cm4gbmV3IFRBKGJ1ZmZlcixkYXRhLHNpemUpfW5hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmRlY29kZU1lbW9yeVZpZXcsImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZGVjb2RlTWVtb3J5Vmlld30se2lnbm9yZUR1cGxpY2F0ZVJlZ2lzdHJhdGlvbnM6dHJ1ZX0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcocmF3VHlwZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIHN0ZFN0cmluZ0lzVVRGOD1uYW1lPT09InN0ZDo6c3RyaW5nIjtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHZhbHVlKXt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBzdHI7aWYoc3RkU3RyaW5nSXNVVEY4KXt2YXIgZGVjb2RlU3RhcnRQdHI9dmFsdWUrNDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9dmFsdWUrNCtpO2lmKGk9PWxlbmd0aHx8SEVBUFU4W2N1cnJlbnRCeXRlUHRyXT09MCl7dmFyIG1heFJlYWQ9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9VVRGOFRvU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWQpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnR9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyKzF9fX1lbHNle3ZhciBhPW5ldyBBcnJheShsZW5ndGgpO2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7YVtpXT1TdHJpbmcuZnJvbUNoYXJDb2RlKEhFQVBVOFt2YWx1ZSs0K2ldKX1zdHI9YS5qb2luKCIiKX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXt2YWx1ZT1uZXcgVWludDhBcnJheSh2YWx1ZSl9dmFyIGdldExlbmd0aDt2YXIgdmFsdWVJc09mVHlwZVN0cmluZz10eXBlb2YgdmFsdWU9PT0ic3RyaW5nIjtpZighKHZhbHVlSXNPZlR5cGVTdHJpbmd8fHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZyIpfWlmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7Z2V0TGVuZ3RoPSgoKT0+bGVuZ3RoQnl0ZXNVVEY4KHZhbHVlKSl9ZWxzZXtnZXRMZW5ndGg9KCgpPT52YWx1ZS5sZW5ndGgpfXZhciBsZW5ndGg9Z2V0TGVuZ3RoKCk7dmFyIHB0cj1fbWFsbG9jKDQrbGVuZ3RoKzEpO0hFQVBVMzJbcHRyPj4yXT1sZW5ndGg7aWYoc3RkU3RyaW5nSXNVVEY4JiZ2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtzdHJpbmdUb1VURjgodmFsdWUscHRyKzQsbGVuZ3RoKzEpfWVsc2V7aWYodmFsdWVJc09mVHlwZVN0cmluZyl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXt2YXIgY2hhckNvZGU9dmFsdWUuY2hhckNvZGVBdChpKTtpZihjaGFyQ29kZT4yNTUpe19mcmVlKHB0cik7dGhyb3dCaW5kaW5nRXJyb3IoIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0cyIpfUhFQVBVOFtwdHIrNCtpXT1jaGFyQ29kZX19ZWxzZXtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe0hFQVBVOFtwdHIrNCtpXT12YWx1ZVtpXX19fWlmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaChfZnJlZSxwdHIpfXJldHVybiBwdHJ9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpmdW5jdGlvbihwdHIpe19mcmVlKHB0cil9fSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcocmF3VHlwZSxjaGFyU2l6ZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGRlY29kZVN0cmluZyxlbmNvZGVTdHJpbmcsZ2V0SGVhcCxsZW5ndGhCeXRlc1VURixzaGlmdDtpZihjaGFyU2l6ZT09PTIpe2RlY29kZVN0cmluZz1VVEYxNlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjE2O2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMTY7Z2V0SGVhcD0oKCk9PkhFQVBVMTYpO3NoaWZ0PTF9ZWxzZSBpZihjaGFyU2l6ZT09PTQpe2RlY29kZVN0cmluZz1VVEYzMlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjMyO2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMzI7Z2V0SGVhcD0oKCk9PkhFQVBVMzIpO3NoaWZ0PTJ9cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih2YWx1ZSl7dmFyIGxlbmd0aD1IRUFQVTMyW3ZhbHVlPj4yXTt2YXIgSEVBUD1nZXRIZWFwKCk7dmFyIHN0cjt2YXIgZGVjb2RlU3RhcnRQdHI9dmFsdWUrNDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9dmFsdWUrNCtpKmNoYXJTaXplO2lmKGk9PWxlbmd0aHx8SEVBUFtjdXJyZW50Qnl0ZVB0cj4+c2hpZnRdPT0wKXt2YXIgbWF4UmVhZEJ5dGVzPWN1cnJlbnRCeXRlUHRyLWRlY29kZVN0YXJ0UHRyO3ZhciBzdHJpbmdTZWdtZW50PWRlY29kZVN0cmluZyhkZWNvZGVTdGFydFB0cixtYXhSZWFkQnl0ZXMpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnR9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyK2NoYXJTaXplfX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtpZighKHR5cGVvZiB2YWx1ZT09PSJzdHJpbmciKSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICIrbmFtZSl9dmFyIGxlbmd0aD1sZW5ndGhCeXRlc1VURih2YWx1ZSk7dmFyIHB0cj1fbWFsbG9jKDQrbGVuZ3RoK2NoYXJTaXplKTtIRUFQVTMyW3B0cj4+Ml09bGVuZ3RoPj5zaGlmdDtlbmNvZGVTdHJpbmcodmFsdWUscHRyKzQsbGVuZ3RoK2NoYXJTaXplKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUscHRyKX1yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246ZnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpfX0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3ZhbHVlX29iamVjdChyYXdUeXBlLG5hbWUsY29uc3RydWN0b3JTaWduYXR1cmUscmF3Q29uc3RydWN0b3IsZGVzdHJ1Y3RvclNpZ25hdHVyZSxyYXdEZXN0cnVjdG9yKXtzdHJ1Y3RSZWdpc3RyYXRpb25zW3Jhd1R5cGVdPXtuYW1lOnJlYWRMYXRpbjFTdHJpbmcobmFtZSkscmF3Q29uc3RydWN0b3I6ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oY29uc3RydWN0b3JTaWduYXR1cmUscmF3Q29uc3RydWN0b3IpLHJhd0Rlc3RydWN0b3I6ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZGVzdHJ1Y3RvclNpZ25hdHVyZSxyYXdEZXN0cnVjdG9yKSxmaWVsZHM6W119fWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3ZhbHVlX29iamVjdF9maWVsZChzdHJ1Y3RUeXBlLGZpZWxkTmFtZSxnZXR0ZXJSZXR1cm5UeXBlLGdldHRlclNpZ25hdHVyZSxnZXR0ZXIsZ2V0dGVyQ29udGV4dCxzZXR0ZXJBcmd1bWVudFR5cGUsc2V0dGVyU2lnbmF0dXJlLHNldHRlcixzZXR0ZXJDb250ZXh0KXtzdHJ1Y3RSZWdpc3RyYXRpb25zW3N0cnVjdFR5cGVdLmZpZWxkcy5wdXNoKHtmaWVsZE5hbWU6cmVhZExhdGluMVN0cmluZyhmaWVsZE5hbWUpLGdldHRlclJldHVyblR5cGU6Z2V0dGVyUmV0dXJuVHlwZSxnZXR0ZXI6ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZ2V0dGVyU2lnbmF0dXJlLGdldHRlciksZ2V0dGVyQ29udGV4dDpnZXR0ZXJDb250ZXh0LHNldHRlckFyZ3VtZW50VHlwZTpzZXR0ZXJBcmd1bWVudFR5cGUsc2V0dGVyOmVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKHNldHRlclNpZ25hdHVyZSxzZXR0ZXIpLHNldHRlckNvbnRleHQ6c2V0dGVyQ29udGV4dH0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQocmF3VHlwZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse2lzVm9pZDp0cnVlLG5hbWU6bmFtZSwiYXJnUGFja0FkdmFuY2UiOjAsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24oKXtyZXR1cm4gdW5kZWZpbmVkfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsbyl7cmV0dXJuIHVuZGVmaW5lZH19KX1mdW5jdGlvbiBfX2VtdmFsX2luY3JlZihoYW5kbGUpe2lmKGhhbmRsZT40KXtlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXS5yZWZjb3VudCs9MX19ZnVuY3Rpb24gX19lbXZhbF90YWtlX3ZhbHVlKHR5cGUsYXJndil7dHlwZT1yZXF1aXJlUmVnaXN0ZXJlZFR5cGUodHlwZSwiX2VtdmFsX3Rha2VfdmFsdWUiKTt2YXIgdj10eXBlWyJyZWFkVmFsdWVGcm9tUG9pbnRlciJdKGFyZ3YpO3JldHVybiBFbXZhbC50b0hhbmRsZSh2KX1mdW5jdGlvbiBfYWJvcnQoKXthYm9ydCgiIil9ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZyhkZXN0LHNyYyxudW0pe0hFQVBVOC5jb3B5V2l0aGluKGRlc3Qsc3JjLHNyYytudW0pfWZ1bmN0aW9uIGVtc2NyaXB0ZW5fcmVhbGxvY19idWZmZXIoc2l6ZSl7dHJ5e3dhc21NZW1vcnkuZ3JvdyhzaXplLWJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTYpO3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKTtyZXR1cm4gMX1jYXRjaChlKXt9fWZ1bmN0aW9uIF9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwKHJlcXVlc3RlZFNpemUpe3ZhciBvbGRTaXplPUhFQVBVOC5sZW5ndGg7cmVxdWVzdGVkU2l6ZT1yZXF1ZXN0ZWRTaXplPj4+MDt2YXIgbWF4SGVhcFNpemU9MjE0NzQ4MzY0ODtpZihyZXF1ZXN0ZWRTaXplPm1heEhlYXBTaXplKXtyZXR1cm4gZmFsc2V9Zm9yKHZhciBjdXREb3duPTE7Y3V0RG93bjw9NDtjdXREb3duKj0yKXt2YXIgb3Zlckdyb3duSGVhcFNpemU9b2xkU2l6ZSooMSsuMi9jdXREb3duKTtvdmVyR3Jvd25IZWFwU2l6ZT1NYXRoLm1pbihvdmVyR3Jvd25IZWFwU2l6ZSxyZXF1ZXN0ZWRTaXplKzEwMDY2MzI5Nik7dmFyIG5ld1NpemU9TWF0aC5taW4obWF4SGVhcFNpemUsYWxpZ25VcChNYXRoLm1heChyZXF1ZXN0ZWRTaXplLG92ZXJHcm93bkhlYXBTaXplKSw2NTUzNikpO3ZhciByZXBsYWNlbWVudD1lbXNjcmlwdGVuX3JlYWxsb2NfYnVmZmVyKG5ld1NpemUpO2lmKHJlcGxhY2VtZW50KXtyZXR1cm4gdHJ1ZX19cmV0dXJuIGZhbHNlfXZhciBTWVNDQUxMUz17bWFwcGluZ3M6e30sYnVmZmVyczpbbnVsbCxbXSxbXV0scHJpbnRDaGFyOmZ1bmN0aW9uKHN0cmVhbSxjdXJyKXt2YXIgYnVmZmVyPVNZU0NBTExTLmJ1ZmZlcnNbc3RyZWFtXTtpZihjdXJyPT09MHx8Y3Vycj09PTEwKXsoc3RyZWFtPT09MT9vdXQ6ZXJyKShVVEY4QXJyYXlUb1N0cmluZyhidWZmZXIsMCkpO2J1ZmZlci5sZW5ndGg9MH1lbHNle2J1ZmZlci5wdXNoKGN1cnIpfX0sdmFyYXJnczp1bmRlZmluZWQsZ2V0OmZ1bmN0aW9uKCl7U1lTQ0FMTFMudmFyYXJncys9NDt2YXIgcmV0PUhFQVAzMltTWVNDQUxMUy52YXJhcmdzLTQ+PjJdO3JldHVybiByZXR9LGdldFN0cjpmdW5jdGlvbihwdHIpe3ZhciByZXQ9VVRGOFRvU3RyaW5nKHB0cik7cmV0dXJuIHJldH0sZ2V0NjQ6ZnVuY3Rpb24obG93LGhpZ2gpe3JldHVybiBsb3d9fTtmdW5jdGlvbiBfZmRfY2xvc2UoZmQpe3JldHVybiAwfWZ1bmN0aW9uIF9mZF9zZWVrKGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsd2hlbmNlLG5ld09mZnNldCl7fWZ1bmN0aW9uIF9mZF93cml0ZShmZCxpb3YsaW92Y250LHBudW0pe3ZhciBudW09MDtmb3IodmFyIGk9MDtpPGlvdmNudDtpKyspe3ZhciBwdHI9SEVBUDMyW2lvdj4+Ml07dmFyIGxlbj1IRUFQMzJbaW92KzQ+PjJdO2lvdis9ODtmb3IodmFyIGo9MDtqPGxlbjtqKyspe1NZU0NBTExTLnByaW50Q2hhcihmZCxIRUFQVThbcHRyK2pdKX1udW0rPWxlbn1IRUFQMzJbcG51bT4+Ml09bnVtO3JldHVybiAwfWZ1bmN0aW9uIF9zZXRUZW1wUmV0MCh2YWwpe3NldFRlbXBSZXQwKHZhbCl9SW50ZXJuYWxFcnJvcj1Nb2R1bGVbIkludGVybmFsRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiSW50ZXJuYWxFcnJvciIpO2VtYmluZF9pbml0X2NoYXJDb2RlcygpO0JpbmRpbmdFcnJvcj1Nb2R1bGVbIkJpbmRpbmdFcnJvciJdPWV4dGVuZEVycm9yKEVycm9yLCJCaW5kaW5nRXJyb3IiKTtpbml0X2VtdmFsKCk7VW5ib3VuZFR5cGVFcnJvcj1Nb2R1bGVbIlVuYm91bmRUeXBlRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiVW5ib3VuZFR5cGVFcnJvciIpO3ZhciBBU1NFUlRJT05TPWZhbHNlO2Z1bmN0aW9uIGludEFycmF5VG9TdHJpbmcoYXJyYXkpe3ZhciByZXQ9W107Zm9yKHZhciBpPTA7aTxhcnJheS5sZW5ndGg7aSsrKXt2YXIgY2hyPWFycmF5W2ldO2lmKGNocj4yNTUpe2lmKEFTU0VSVElPTlMpe2Fzc2VydChmYWxzZSwiQ2hhcmFjdGVyIGNvZGUgIitjaHIrIiAoIitTdHJpbmcuZnJvbUNoYXJDb2RlKGNocikrIikgIGF0IG9mZnNldCAiK2krIiBub3QgaW4gMHgwMC0weEZGLiIpfWNociY9MjU1fXJldC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoY2hyKSl9cmV0dXJuIHJldC5qb2luKCIiKX12YXIgZGVjb2RlQmFzZTY0PXR5cGVvZiBhdG9iPT09ImZ1bmN0aW9uIj9hdG9iOmZ1bmN0aW9uKGlucHV0KXt2YXIga2V5U3RyPSJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPSI7dmFyIG91dHB1dD0iIjt2YXIgY2hyMSxjaHIyLGNocjM7dmFyIGVuYzEsZW5jMixlbmMzLGVuYzQ7dmFyIGk9MDtpbnB1dD1pbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVwrXC9cPV0vZywiIik7ZG97ZW5jMT1rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7ZW5jMj1rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7ZW5jMz1rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7ZW5jND1rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7Y2hyMT1lbmMxPDwyfGVuYzI+PjQ7Y2hyMj0oZW5jMiYxNSk8PDR8ZW5jMz4+MjtjaHIzPShlbmMzJjMpPDw2fGVuYzQ7b3V0cHV0PW91dHB1dCtTdHJpbmcuZnJvbUNoYXJDb2RlKGNocjEpO2lmKGVuYzMhPT02NCl7b3V0cHV0PW91dHB1dCtTdHJpbmcuZnJvbUNoYXJDb2RlKGNocjIpfWlmKGVuYzQhPT02NCl7b3V0cHV0PW91dHB1dCtTdHJpbmcuZnJvbUNoYXJDb2RlKGNocjMpfX13aGlsZShpPGlucHV0Lmxlbmd0aCk7cmV0dXJuIG91dHB1dH07ZnVuY3Rpb24gaW50QXJyYXlGcm9tQmFzZTY0KHMpe2lmKHR5cGVvZiBFTlZJUk9OTUVOVF9JU19OT0RFPT09ImJvb2xlYW4iJiZFTlZJUk9OTUVOVF9JU19OT0RFKXt2YXIgYnVmPUJ1ZmZlci5mcm9tKHMsImJhc2U2NCIpO3JldHVybiBuZXcgVWludDhBcnJheShidWZbImJ1ZmZlciJdLGJ1ZlsiYnl0ZU9mZnNldCJdLGJ1ZlsiYnl0ZUxlbmd0aCJdKX10cnl7dmFyIGRlY29kZWQ9ZGVjb2RlQmFzZTY0KHMpO3ZhciBieXRlcz1uZXcgVWludDhBcnJheShkZWNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkZWNvZGVkLmxlbmd0aDsrK2kpe2J5dGVzW2ldPWRlY29kZWQuY2hhckNvZGVBdChpKX1yZXR1cm4gYnl0ZXN9Y2F0Y2goXyl7dGhyb3cgbmV3IEVycm9yKCJDb252ZXJ0aW5nIGJhc2U2NCBzdHJpbmcgdG8gYnl0ZXMgZmFpbGVkLiIpfX1mdW5jdGlvbiB0cnlQYXJzZUFzRGF0YVVSSShmaWxlbmFtZSl7aWYoIWlzRGF0YVVSSShmaWxlbmFtZSkpe3JldHVybn1yZXR1cm4gaW50QXJyYXlGcm9tQmFzZTY0KGZpbGVuYW1lLnNsaWNlKGRhdGFVUklQcmVmaXgubGVuZ3RoKSl9dmFyIGFzbUxpYnJhcnlBcmc9eyJwIjpfX2VtYmluZF9maW5hbGl6ZV92YWx1ZV9vYmplY3QsInMiOl9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludCwieSI6X19lbWJpbmRfcmVnaXN0ZXJfYm9vbCwiZiI6X19lbWJpbmRfcmVnaXN0ZXJfY29uc3RhbnQsIngiOl9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsLCJvIjpfX2VtYmluZF9yZWdpc3Rlcl9lbnVtLCJhIjpfX2VtYmluZF9yZWdpc3Rlcl9lbnVtX3ZhbHVlLCJuIjpfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdCwiYyI6X19lbWJpbmRfcmVnaXN0ZXJfZnVuY3Rpb24sImUiOl9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXIsImIiOl9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3LCJtIjpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nLCJpIjpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZywicSI6X19lbWJpbmRfcmVnaXN0ZXJfdmFsdWVfb2JqZWN0LCJkIjpfX2VtYmluZF9yZWdpc3Rlcl92YWx1ZV9vYmplY3RfZmllbGQsInoiOl9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQsImoiOl9fZW12YWxfZGVjcmVmLCJrIjpfX2VtdmFsX2luY3JlZiwiZyI6X19lbXZhbF90YWtlX3ZhbHVlLCJoIjpfYWJvcnQsInciOl9lbXNjcmlwdGVuX21lbWNweV9iaWcsInUiOl9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwLCJ2IjpfZmRfY2xvc2UsInIiOl9mZF9zZWVrLCJsIjpfZmRfd3JpdGUsInQiOl9zZXRUZW1wUmV0MH07dmFyIGFzbT1jcmVhdGVXYXNtKCk7dmFyIF9fX3dhc21fY2FsbF9jdG9ycz1Nb2R1bGVbIl9fX3dhc21fY2FsbF9jdG9ycyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX3dhc21fY2FsbF9jdG9ycz1Nb2R1bGVbIl9fX3dhc21fY2FsbF9jdG9ycyJdPU1vZHVsZVsiYXNtIl1bIkIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX2ZyZWU9TW9kdWxlWyJfZnJlZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9mcmVlPU1vZHVsZVsiX2ZyZWUiXT1Nb2R1bGVbImFzbSJdWyJEIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09ZnVuY3Rpb24oKXtyZXR1cm4oX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1Nb2R1bGVbImFzbSJdWyJFIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2dldFR5cGVOYW1lPU1vZHVsZVsiX19fZ2V0VHlwZU5hbWUiXT1mdW5jdGlvbigpe3JldHVybihfX19nZXRUeXBlTmFtZT1Nb2R1bGVbIl9fX2dldFR5cGVOYW1lIl09TW9kdWxlWyJhc20iXVsiRiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzPU1vZHVsZVsiX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2VtYmluZF9yZWdpc3Rlcl9uYXRpdmVfYW5kX2J1aWx0aW5fdHlwZXM9TW9kdWxlWyJfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzIl09TW9kdWxlWyJhc20iXVsiRyJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT1Nb2R1bGVbImFzbSJdWyJIIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGNhbGxlZFJ1bjtmdW5jdGlvbiBFeGl0U3RhdHVzKHN0YXR1cyl7dGhpcy5uYW1lPSJFeGl0U3RhdHVzIjt0aGlzLm1lc3NhZ2U9IlByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoIitzdGF0dXMrIikiO3RoaXMuc3RhdHVzPXN0YXR1c31kZXBlbmRlbmNpZXNGdWxmaWxsZWQ9ZnVuY3Rpb24gcnVuQ2FsbGVyKCl7aWYoIWNhbGxlZFJ1bilydW4oKTtpZighY2FsbGVkUnVuKWRlcGVuZGVuY2llc0Z1bGZpbGxlZD1ydW5DYWxsZXJ9O2Z1bmN0aW9uIHJ1bihhcmdzKXthcmdzPWFyZ3N8fGFyZ3VtZW50c187aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1wcmVSdW4oKTtpZihydW5EZXBlbmRlbmNpZXM+MCl7cmV0dXJufWZ1bmN0aW9uIGRvUnVuKCl7aWYoY2FsbGVkUnVuKXJldHVybjtjYWxsZWRSdW49dHJ1ZTtNb2R1bGVbImNhbGxlZFJ1biJdPXRydWU7aWYoQUJPUlQpcmV0dXJuO2luaXRSdW50aW1lKCk7cmVhZHlQcm9taXNlUmVzb2x2ZShNb2R1bGUpO2lmKE1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSlNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0oKTtwb3N0UnVuKCl9aWYoTW9kdWxlWyJzZXRTdGF0dXMiXSl7TW9kdWxlWyJzZXRTdGF0dXMiXSgiUnVubmluZy4uLiIpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7TW9kdWxlWyJzZXRTdGF0dXMiXSgiIil9LDEpO2RvUnVuKCl9LDEpfWVsc2V7ZG9SdW4oKX19TW9kdWxlWyJydW4iXT1ydW47aWYoTW9kdWxlWyJwcmVJbml0Il0pe2lmKHR5cGVvZiBNb2R1bGVbInByZUluaXQiXT09ImZ1bmN0aW9uIilNb2R1bGVbInByZUluaXQiXT1bTW9kdWxlWyJwcmVJbml0Il1dO3doaWxlKE1vZHVsZVsicHJlSW5pdCJdLmxlbmd0aD4wKXtNb2R1bGVbInByZUluaXQiXS5wb3AoKSgpfX1ydW4oKTsKCgogIHJldHVybiBnZ3dhdmVfZmFjdG9yeS5yZWFkeQp9Cik7Cn0pKCk7CmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpCiAgbW9kdWxlLmV4cG9ydHMgPSBnZ3dhdmVfZmFjdG9yeTsKZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKQogIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7IHJldHVybiBnZ3dhdmVfZmFjdG9yeTsgfSk7CmVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JykKICBleHBvcnRzWyJnZ3dhdmVfZmFjdG9yeSJdID0gZ2d3YXZlX2ZhY3Rvcnk7Cg==),
     protocol p=4. Only payloads the decoder actually returns — TAP, DBL,
     HLD, or a valid metric payload — become journal entries; there is no
     fallback guesser.
     Every chirp becomes a journal entry: sub tap + timestamp, then the Dom
     prompt (Way A) attaches the spoken activity and the Dom's own rating.
     No audio is stored; speech transcription uses the Web Speech API. */
  var GW_SUB = {
    TAP: { level: 2, label: "Enjoying", detail: "Tap — enjoying, all good" },
    DBL: { level: 1, label: "Kind of / mixed", detail: "Double-tap — only kind of enjoying it" },
    HLD: { level: 0, label: "Slow down", detail: "Hold — slow down" }
  };
  var GW_METRICS = {
    E: { name: "Enjoyment" },
    H: { name: "Heat" },
    N: { name: "Endurance" }
  };
  function gwParseMetric(txt) {
    var m = /^([EHN])(-?\d{1,3})$/.exec(String(txt || ""));
    if (!m) return null;
    var v = parseInt(m[2], 10);
    if (isNaN(v) || v < -100 || v > 100) return null;
    return { metric: m[1], value: v };
  }
  function gwFmtVal(v) { return (v > 0 ? "+" : "") + String(v); }
  function gwIsMetric(entry) { return !!(entry && entry.metric && GW_METRICS[entry.metric]); }
  function gwSubLevel(entry) {
    if (gwIsMetric(entry)) { var v = +entry.value || 0; return v >= 34 ? 2 : (v <= -34 ? 0 : 1); }
    return gwSubMeta(entry).level;
  }
  function gwEntrySubText(entry) {
    var tag = entry.code + (entry.source === "ble" ? ", Bluetooth" : "") + (entry.profileId ? ", profile " + entry.profileId : ", broadcast (no key)");
    if (gwIsMetric(entry)) return GW_METRICS[entry.metric].name + " " + gwFmtVal(+entry.value || 0) + " [" + tag + "]";
    return gwSubMeta(entry).detail + " [" + tag + "]";
  }
  var GW_DOM_LABELS = ["Not enjoying", "Mixed", "Enjoying", "Loving it"];
  var gwListenBtn = SexcapadesRuntime.DOM.byId("gwListenToggle"),
      gwListenStatus = SexcapadesRuntime.DOM.byId("gwListenStatus"),
      gwDecodeStatus = SexcapadesRuntime.DOM.byId("gwDecodeStatus"),
      gwLiveSub = SexcapadesRuntime.DOM.byId("gwLiveSub"), gwLiveSubTime = SexcapadesRuntime.DOM.byId("gwLiveSubTime"),
      gwLiveDom = SexcapadesRuntime.DOM.byId("gwLiveDom"), gwLiveDomTime = SexcapadesRuntime.DOM.byId("gwLiveDomTime"),
      gwMismatchBanner = SexcapadesRuntime.DOM.byId("gwMismatchBanner"), gwMismatchText = SexcapadesRuntime.DOM.byId("gwMismatchText"),
      gwPrompt = SexcapadesRuntime.DOM.byId("gwDomPrompt"), gwPromptTitle = SexcapadesRuntime.DOM.byId("gwDomPromptTitle"),
      gwSpeakBtn = SexcapadesRuntime.DOM.byId("gwSpeakBtn"), gwActivityInput = SexcapadesRuntime.DOM.byId("gwActivityInput"),
      gwActivitySave = SexcapadesRuntime.DOM.byId("gwActivitySave"), gwSpeechStatus = SexcapadesRuntime.DOM.byId("gwSpeechStatus"),
      gwDomRateBox = SexcapadesRuntime.DOM.byId("gwDomRateBox"),
      gwMetricE = SexcapadesRuntime.DOM.byId("gwMetricE"), gwMetricETime = SexcapadesRuntime.DOM.byId("gwMetricETime"),
      gwMetricH = SexcapadesRuntime.DOM.byId("gwMetricH"), gwMetricHTime = SexcapadesRuntime.DOM.byId("gwMetricHTime"),
      gwMetricN = SexcapadesRuntime.DOM.byId("gwMetricN"), gwMetricNTime = SexcapadesRuntime.DOM.byId("gwMetricNTime"),
      gwAftercareList = SexcapadesRuntime.DOM.byId("gwAftercareList"), gwJournalEmpty = SexcapadesRuntime.DOM.byId("gwJournalEmpty");
  var gwPromptEntryId = null;
  function fmtCT(ts) {
    try { return new Date(ts).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" }) + " CT"; }
    catch (e) { return fmtTimeSec(ts); }
  }
  function gwSubMeta(entry) { return GW_SUB[entry.code] || GW_SUB.TAP; }
  function gwIsMismatch(entry) {
    /* The one approved rule: sub only kind of enjoying it (double-tap)
       AND Dom not enjoying it (rating 0). Nothing else is a mismatch. */
    if (!entry || entry.domEnjoy === null || entry.domEnjoy === undefined) return false;
    return entry.code === "DBL" && entry.domEnjoy === 0;
  }
  function gwAlignment(entry) {
    if (!entry || entry.domEnjoy === null || entry.domEnjoy === undefined) return { tone: "pending", label: "Waiting on Dom rating" };
    if (gwIsMismatch(entry)) return { tone: "mismatch", label: "Mismatch — should have stopped" };
    var sub = gwSubLevel(entry);
    if ((sub === 2 && entry.domEnjoy >= 2) || (sub === 1 && entry.domEnjoy === 2)) return { tone: "aligned", label: "Aligned" };
    if (sub === 2 && entry.domEnjoy === 3) return { tone: "aligned", label: "Aligned" };
    return { tone: "differed", label: "Differed — talk it over" };
  }
  function gwLatest() { for (var i = 0; i < state.journal.length; i++) { if (!gwIsMetric(state.journal[i])) return state.journal[i]; } return null; }
  function gwBeep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!gwBeep.ctx) gwBeep.ctx = new AC();
      var ctx = gwBeep.ctx, t0 = ctx.currentTime;
      [880, 1174].forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(0.0001, t0 + i * 0.16);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + i * 0.16 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.16 + 0.15);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + i * 0.16); o.stop(t0 + i * 0.16 + 0.16);
      });
    } catch (e) { __sxErrLog("gw-beep", e); }
  }
  function gwOnChirp(code, source, profileId) {
    if (!GW_SUB[code]) return;
    var entry = { id: "gw" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), t: nowMs(), code: code, source: source || "watch", profileId: profileId || "", activity: "", sched: (typeof guideCurrentSched === "function" ? guideCurrentSched() : ""), domEnjoy: null, domAt: 0 };
    state.journal.unshift(entry);
    if (state.journal.length > 200) state.journal.length = 200;
    save();
    gwPromptEntryId = entry.id;
    vibrate(code === "HLD" ? [120, 50, 120] : [70, 40, 70]);
    gwBeep();
    renderJournal();
    if (gwSpeechStatus) gwSpeechStatus.textContent = "Heard " + code + " at " + fmtCT(entry.t) + " — Dom, name the activity.";
    if (gwActivityInput) gwActivityInput.focus();
  }
  function gwOnMetric(parsed, rawCode, source, profileId) {
    var entry = { id: "gw" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), t: nowMs(), code: rawCode, metric: parsed.metric, value: parsed.value, source: source || "watch", profileId: profileId || "", activity: "", sched: (typeof guideCurrentSched === "function" ? guideCurrentSched() : ""), domEnjoy: null, domAt: 0 };
    state.journal.unshift(entry);
    if (state.journal.length > 200) state.journal.length = 200;
    save();
    vibrate([50]);
    gwBeep();
    renderJournal();
    if (gwSpeechStatus) gwSpeechStatus.textContent = "Heard " + rawCode + " at " + fmtCT(entry.t) + " — " + GW_METRICS[parsed.metric].name + " " + gwFmtVal(parsed.value) + " (the watch's display value, shown as-is).";
  }
  /* GibberLink addressing (gibberlink-1108-1400): the sender's profile
     KEY prefixes its signals (adam:TAP, adam:E40) and is attributed
     per key, case preserved — the key is the identifier, there is no
     numeric UID. A payload with NO key is a BROADCAST from all watches
     (Jason's backward-compatibility rule, 2026-11-08): unkeyed TAP /
     DBL / HLD, metric readings, and ACK:CFG are processed as broadcast
     on the Broadcast watch card and in the journal — never dropped —
     so un-setup watches and older GibberWear builds keep working.
     ACKs (keyed ACK:<key>:CFG, unkeyed ACK:CFG) confirm a setup send. */
  var gwPendingCfgKey = "", gwPendingCfgTimer = null, gwPendingHeatValue = null;
  function gwOnAck(ackKey, source) {
    var via = source === "ble" ? "Bluetooth" : "ultrasound";
    if (ackKey) {
      gwLinkLog("IN", "ACK:" + ackKey + ":CFG", via);
      if (gwPendingCfgKey && ackKey === gwPendingCfgKey) {
        var confirmedKey = gwPendingCfgKey;
        var pendingHeat = gwPendingHeatValue;
        gwPendingCfgKey = "";
        gwPendingHeatValue = null;
        if (gwPendingCfgTimer) { try { SexcapadesRuntime.TimerManager.clear(gwPendingCfgTimer); } catch (e) {} gwPendingCfgTimer = null; }
        if (typeof pendingHeat === "number" && isFinite(pendingHeat)) {
          gwCfgSetStatus("Setup confirmed by " + confirmedKey + ". Syncing heat in 1.5s…");
          var delayTimer = (window.SexcapadesRuntime && SexcapadesRuntime.TimerManager && SexcapadesRuntime.TimerManager.setTimeout) ? SexcapadesRuntime.TimerManager.setTimeout : setTimeout;
          delayTimer(function () {
            var heatPayload = "HEAT:" + confirmedKey + ":" + Math.max(-100, Math.min(100, Math.round(pendingHeat)));
            gwSendBoth(heatPayload).then(function (hres) {
              gwLinkLog("OUT", heatPayload, hres.ble === true ? "Bluetooth" : "ultrasound");
              gwCfgSetStatus("Setup confirmed and heat synced (" + heatPayload + ") to " + confirmedKey + ".");
              if (gwTransientListen) gwStopListening("", true);
            });
          }, 1500);
        } else {
          gwCfgSetStatus("Setup confirmed — watch " + ackKey + " answered ACK:" + ackKey + ":CFG.");
          if (gwTransientListen) gwStopListening("", true);
        }
      } else if (gwCfgStatusEl) {
        gwCfgSetStatus("Heard ACK:" + ackKey + ":CFG — watch " + ackKey + " confirmed a setup.");
      }
    } else {
      gwLinkLog("IN", "ACK:CFG", via);
      gwBroadcastAckNote = "Setup ACK (ACK:CFG, unkeyed broadcast) heard " + fmtCT(nowMs()) + " — an unkeyed watch confirmed its setup.";
      var bt = SexcapadesRuntime.DOM.byId("gwBroadcastTime");
      if (bt) bt.textContent = gwBroadcastAckNote;
      if (gwPendingCfgKey) gwCfgSetStatus("Heard an unkeyed ACK:CFG (broadcast). The keyed ACK:" + gwPendingCfgKey + ":CFG has not arrived yet — still waiting.");
    }
  }
  var gwBroadcastAckNote = "";
  function gwHandlePayload(txt, source, profileId) {
    var raw = String(txt || "").trim();
    if (!raw) return false;
    var ackm = /^ACK:(?:([A-Za-z0-9][A-Za-z0-9_-]{0,31}):)?CFG$/i.exec(raw);
    if (ackm) { gwOnAck(ackm[1] || "", source); return true; }
    var body = raw, key = profileId || "";
    if (!key) {
      var ci = raw.indexOf(":");
      if (ci > 0) {
        var candKey = raw.slice(0, ci), rest = raw.slice(ci + 1), restUp = rest.toUpperCase();
        if (/^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(candKey) && (GW_SUB[restUp] || gwParseMetric(restUp))) { key = candKey; body = rest; }
      }
    }
    body = String(body || "").trim().toUpperCase();
    if (GW_SUB[body]) { gwOnChirp(body, source, key); return true; }
    var parsed = gwParseMetric(body);
    if (parsed) { gwOnMetric(parsed, body, source, key); return true; }
    return false;
  }
  function gwEntryById(id) {
    for (var i = 0; i < state.journal.length; i++) if (state.journal[i].id === id) return state.journal[i];
    return null;
  }
  function gwRateDom(entry, value) {
    if (!entry) return;
    entry.domEnjoy = value; entry.domAt = nowMs();
    save(); renderJournal();
    if (gwIsMismatch(entry)) vibrate([220, 60, 220, 60, 220]);
  }
  function gwAttachActivity(entry, textValue) {
    if (!entry) return;
    entry.activity = String(textValue || "").trim().slice(0, 120);
    save(); renderJournal();
  }
  function renderJournal() {
    /* sentinel-density-1108-1545: an incoming signal re-renders the journal,
       live view and metrics — capture the sections scroll position and put
       it back afterwards so the view never jumps on a received signal. */
    var secEl = gwSectionsScrollEl(); var secTop = secEl ? secEl.scrollTop : 0;
    var latest = gwLatest();
    if (gwLiveSub) gwLiveSub.textContent = latest ? gwSubMeta(latest).detail : "No taps yet";
    if (gwLiveSubTime) gwLiveSubTime.textContent = latest ? fmtCT(latest.t) + (latest.activity ? " · " + latest.activity : "") : "";
    var domLatest = null;
    for (var i = 0; i < state.journal.length; i++) { if (state.journal[i].domEnjoy !== null && state.journal[i].domEnjoy !== undefined) { domLatest = state.journal[i]; break; } }
    if (gwLiveDom) gwLiveDom.textContent = domLatest ? GW_DOM_LABELS[domLatest.domEnjoy] : "Not rated yet";
    if (gwLiveDomTime) gwLiveDomTime.textContent = domLatest ? fmtCT(domLatest.domAt) + (domLatest.activity ? " · " + domLatest.activity : "") : "";
    [["E", gwMetricE, gwMetricETime], ["H", gwMetricH, gwMetricHTime], ["N", gwMetricN, gwMetricNTime]].forEach(function (cfg) {
      var found = null;
      for (var i = 0; i < state.journal.length; i++) { if (state.journal[i].metric === cfg[0]) { found = state.journal[i]; break; } }
      if (cfg[1]) cfg[1].textContent = found ? gwFmtVal(+found.value || 0) : "—";
      if (cfg[2]) cfg[2].textContent = found ? fmtCT(found.t) : "No reading yet";
    });
    var gwBroadcastLatestEl = SexcapadesRuntime.DOM.byId("gwBroadcastLatest"), gwBroadcastTimeEl = SexcapadesRuntime.DOM.byId("gwBroadcastTime");
    if (gwBroadcastLatestEl) {
      var bFound = null, bCount = 0;
      for (var bi = 0; bi < state.journal.length; bi++) { if (!state.journal[bi].profileId) { bCount++; if (!bFound) bFound = state.journal[bi]; } }
      if (bFound) {
        gwBroadcastLatestEl.textContent = gwIsMetric(bFound) ? (GW_METRICS[bFound.metric].name + " " + gwFmtVal(+bFound.value || 0)) : gwSubMeta(bFound).detail;
        if (gwBroadcastTimeEl) gwBroadcastTimeEl.textContent = fmtCT(bFound.t) + " · " + bCount + " broadcast signal" + (bCount === 1 ? "" : "s") + " this scene — unkeyed, from any watch in the room." + (gwBroadcastAckNote ? " " + gwBroadcastAckNote : "");
      } else {
        gwBroadcastLatestEl.textContent = "No broadcast signals yet";
        if (gwBroadcastTimeEl) gwBroadcastTimeEl.textContent = gwBroadcastAckNote || "Unkeyed signals from any watch in the room land here.";
      }
    }
    var showMismatch = !!(latest && gwIsMismatch(latest));
    if (gwMismatchBanner) gwMismatchBanner.hidden = !showMismatch;
    if (showMismatch && gwMismatchText) gwMismatchText.textContent = "Latest check-in: sub tapped \u201C" + gwSubMeta(latest).label + "\u201D and the Dom rated it \u201C" + GW_DOM_LABELS[latest.domEnjoy] + "\u201D" + (latest.activity ? " during " + latest.activity : "") + ". This activity should stop — check in with each other.";
    var promptEntry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : latest;
    if (gwPrompt) gwPrompt.hidden = !promptEntry;
    if (gwDomRateBox) gwDomRateBox.hidden = !promptEntry;
    if (promptEntry && gwPromptTitle) gwPromptTitle.textContent = "Dom — what activity is this? (" + gwSubMeta(promptEntry).detail + ", " + fmtCT(promptEntry.t) + ")";
    if (promptEntry && gwActivityInput && document.activeElement !== gwActivityInput) gwActivityInput.value = promptEntry.activity || "";
    if (gwDomRateBox && promptEntry) {
      var btns = gwDomRateBox.querySelectorAll("[data-dom-rate]");
      for (var b = 0; b < btns.length; b++) btns[b].setAttribute("aria-pressed", promptEntry.domEnjoy === +btns[b].getAttribute("data-dom-rate") ? "true" : "false");
    }
    if (!gwAftercareList) { if (secEl && secEl.scrollTop !== secTop) secEl.scrollTop = secTop; return; }
    gwAftercareList.innerHTML = "";
    state.journal.forEach(function (entry) {
      var align = gwAlignment(entry);
      var card = document.createElement("div"); card.className = "gw-entry"; card.setAttribute("data-mismatch", gwIsMismatch(entry) ? "true" : "false");
      var head = document.createElement("div"); head.className = "gw-entry-head";
      var title = document.createElement("span"); title.className = "gw-entry-title"; title.textContent = gwIsMetric(entry) ? (GW_METRICS[entry.metric].name + " " + gwFmtVal(+entry.value || 0)) : (entry.activity ? entry.activity : (entry.sched ? entry.sched + " (scheduled)" : "Activity not named yet"));
      var tm = document.createElement("time"); tm.textContent = fmtCT(entry.t);
      head.appendChild(title); head.appendChild(tm); card.appendChild(head);
      var cols = document.createElement("div"); cols.className = "gw-cols";
      var subCol = document.createElement("div"); subCol.className = "gw-col";
      var subLab = document.createElement("span"); subLab.className = "gw-col-label"; subLab.textContent = "Sub (watch)";
      var subVal = document.createElement("span"); subVal.textContent = gwEntrySubText(entry);
      subCol.appendChild(subLab); subCol.appendChild(subVal);
      if (entry.sched && entry.sched !== entry.activity) { var schedVal = document.createElement("span"); schedVal.textContent = "Scheduled then: " + entry.sched; subCol.appendChild(schedVal); }
      var domCol = document.createElement("div"); domCol.className = "gw-col";
      var domLab = document.createElement("span"); domLab.className = "gw-col-label"; domLab.textContent = "Dom";
      var domVal = document.createElement("span"); domVal.textContent = (entry.domEnjoy === null || entry.domEnjoy === undefined) ? "Not rated yet" : ("Enjoyment: " + GW_DOM_LABELS[entry.domEnjoy]);
      domCol.appendChild(domLab); domCol.appendChild(domVal);
      cols.appendChild(subCol); cols.appendChild(domCol); card.appendChild(cols);
      var badge = document.createElement("span"); badge.className = "gw-badge"; badge.setAttribute("data-tone", align.tone); badge.textContent = align.label;
      card.appendChild(badge);
      var rateRow = document.createElement("div"); rateRow.className = "gw-rate-row";
      GW_DOM_LABELS.forEach(function (lab, val) {
        var rb = document.createElement("button"); rb.type = "button"; rb.className = "action-btn gw-rate-btn";
        rb.textContent = lab; rb.setAttribute("data-gw-rate-entry", entry.id); rb.setAttribute("data-dom-rate", String(val));
        rb.setAttribute("aria-pressed", entry.domEnjoy === val ? "true" : "false");
        rateRow.appendChild(rb);
      });
      card.appendChild(rateRow);
      gwAftercareList.appendChild(card);
    });
    if (gwJournalEmpty) gwJournalEmpty.hidden = state.journal.length > 0;
    if (secEl && secEl.scrollTop !== secTop) secEl.scrollTop = secTop;
  }
  if (gwDomRateBox) gwDomRateBox.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-dom-rate]") : null; if (!t) return;
    var entry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : gwLatest();
    gwRateDom(entry, +t.getAttribute("data-dom-rate"));
  });
  if (gwAftercareList) gwAftercareList.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-gw-rate-entry]") : null; if (!t) return;
    gwRateDom(gwEntryById(t.getAttribute("data-gw-rate-entry")), +t.getAttribute("data-dom-rate"));
  });
  if (gwActivitySave) gwActivitySave.addEventListener("click", function () {
    var entry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : gwLatest();
    if (entry && gwActivityInput) { gwAttachActivity(entry, gwActivityInput.value); if (gwSpeechStatus) gwSpeechStatus.textContent = "Activity attached: " + (entry.activity || "(blank)"); }
  });
  /* Speech (Way A): Web Speech API; audio goes to Google, nothing is stored. */
  var gwRecognition = null;
  if (gwSpeakBtn) gwSpeakBtn.addEventListener("click", function () {
    var optIn = SexcapadesRuntime.DOM.byId("gwSpeechOptIn");
    if (!optIn || !optIn.checked) { if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech is off until you tick \u201CSend my voice to Google for transcription\u201D above — your voice goes to Google only after that opt-in. Typing the activity always stays on this device."; if (gwActivityInput) gwActivityInput.focus(); return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech recognition is not available in this browser — type the activity instead. Nothing is recorded either way."; if (gwActivityInput) gwActivityInput.focus(); return; }
    try {
      if (gwRecognition) { try { gwRecognition.stop(); } catch (e) {} }
      gwRecognition = new SR();
      gwRecognition.lang = "en-US"; gwRecognition.interimResults = false; gwRecognition.maxAlternatives = 1;
      gwRecognition.onresult = function (ev) {
        var txt = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : "";
        var entry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : gwLatest();
        if (entry && txt) { gwAttachActivity(entry, txt); if (gwActivityInput) gwActivityInput.value = entry.activity; if (gwSpeechStatus) gwSpeechStatus.textContent = "Heard: \u201C" + entry.activity + "\u201D — attached to this check-in."; }
      };
      gwRecognition.onerror = function (ev) { if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech did not come through (" + (ev.error || "error") + ") — type the activity instead."; };
      gwRecognition.onend = function () { gwRecognition = null; };
      gwRecognition.start();
      if (gwSpeechStatus) gwSpeechStatus.textContent = "Listening — Dom, say the activity now. (Audio goes to Google for transcription; it is not stored.)";
    } catch (e) { __sxErrLog("gw-speech", e); if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech could not start — type the activity instead."; }
  });
  var gwExportBtn = SexcapadesRuntime.DOM.byId("gwExportBtn"), gwClearBtn = SexcapadesRuntime.DOM.byId("gwClearBtn");
  if (gwExportBtn) gwExportBtn.addEventListener("click", function () {
    var lines = ["Scene Sentinel — scene journal (times in Central)", ""];
    if (state.guide && state.guide.steps && state.guide.steps.length) { lines.push("PLAY GUIDE (Way B) — scheduled steps:"); state.guide.steps.forEach(function (st) { lines.push(guideFmtClock(st.start) + "-" + guideFmtClock(st.end) + " | " + st.activity + (st.note ? " — " + st.note : "")); }); lines.push(""); }
    state.journal.slice().reverse().forEach(function (entry) {
      var align = gwAlignment(entry);
      lines.push(fmtCT(entry.t) + " | Sub: " + gwEntrySubText(entry) + " | Activity: " + (entry.activity || "(not named)") + (entry.sched ? " | Scheduled: " + entry.sched : "") + " | Dom: " + ((entry.domEnjoy === null || entry.domEnjoy === undefined) ? "not rated" : GW_DOM_LABELS[entry.domEnjoy]) + " | " + align.label);
    });
    if (!state.journal.length) lines.push("No check-ins recorded.");
    try {
      var blob = new Blob([lines.join("\n")], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a"); a.href = url; a.download = "scene-journal.txt";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    } catch (e) { __sxErrLog("gw-export", e); }
  });
  if (gwClearBtn) gwClearBtn.addEventListener("click", function () {
    state.journal = []; gwPromptEntryId = null; save(); renderJournal();
    if (gwSpeechStatus) gwSpeechStatus.textContent = "";
  });
  /* Microphone listener: getUserMedia + ggwave-wasm decode (p=4).
     Mic samples stream into ggwave.decode(); a returned payload of TAP,
     DBL or HLD is a check-in. Mic audio is analysed on-device and never
     stored or sent anywhere. */
  var gwAudio = { stream: null, ctx: null, processor: null, on: false };
  var gwLib = null, gwInstance = null, gwLibPromise = null;
  function gwSetStatus(msg) { if (gwListenStatus) gwListenStatus.textContent = msg; }
  function gwEnsureDecoder(sampleRate) {
    if (gwInstance && gwLib) return Promise.resolve(true);
    if (!gwLibPromise) {
      gwLibPromise = new Promise(function (resolve) {
        if (typeof window.ggwave_factory !== "function") { try { gwTxDiag = "ggwave factory missing"; } catch (e) {} resolve(false); return; }
        window.ggwave_factory().then(function (lib) {
          try {
            if (lib.disableLog) lib.disableLog();
            gwLib = lib;
            resolve(true);
          } catch (e) { __sxErrLog("gw-init", e); resolve(false); }
        }).catch(function (e) { __sxErrLog("gw-init", e); resolve(false); });
      });
    }
    return gwLibPromise.then(function (ok) {
      if (!ok || !gwLib) return false;
      try {
        if (gwInstance) { try { gwLib.free(gwInstance); } catch (e) {} gwInstance = null; }
        var params = gwLib.getDefaultParameters();
        params.sampleRateInp = sampleRate;
        params.sampleRateOut = sampleRate;
        gwInstance = gwLib.init(params);
        return !!gwInstance || gwInstance === 0;
      } catch (e) { __sxErrLog("gw-init", e); return false; }
    });
  }
  var gwTransientListen = false;
  function gwStopListening(reason, force) {
    if (!force && gwTransientListen === false && guidePlay.on) return;
    gwTransientListen = false;
    gwAudio.on = false;
    if (gwAudio.processor) { try { gwAudio.processor.disconnect(); } catch (e) {} gwAudio.processor.onaudioprocess = null; gwAudio.processor = null; }
    if (gwAudio.stream) { try { gwAudio.stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} }); } catch (e) {} gwAudio.stream = null; }
    if (gwAudio.ctx) { try { gwAudio.ctx.close(); } catch (e) {} gwAudio.ctx = null; }
    if (gwLib && gwInstance !== null && gwInstance !== undefined) { try { gwLib.free(gwInstance); } catch (e) {} gwInstance = null; }
    if (gwListenBtn) gwListenBtn.textContent = "Start listening";
    if (reason) gwSetStatus(reason);
  }
  function gwStartListening(transientMode) {
    if (gwAudio.on) return Promise.resolve(true);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      gwSetStatus("This browser cannot open the microphone here, so the listener cannot run.");
      return Promise.resolve(false);
    }
    if (transientMode) gwTransientListen = true;
    gwSetStatus("Opening the microphone and loading the ggwave decoder\u2026");
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
      var AC = window.AudioContext || window.webkitAudioContext;
      var ctx = new AC();
      return gwEnsureDecoder(ctx.sampleRate).then(function (ok) {
        if (!ok) {
          try { stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} }); } catch (e) {}
          try { ctx.close(); } catch (e) {}
          gwSetStatus("The ggwave decoder could not load on this device, so the listener cannot run.");
          return false;
        }
        try {
          var src = ctx.createMediaStreamSource(stream);
          var proc = ctx.createScriptProcessor(4096, 1, 1);
          var mute = ctx.createGain(); mute.gain.value = 0;
          proc.onaudioprocess = function (ev) {
            if (!gwAudio.on || !gwLib || gwInstance === null || gwInstance === undefined) return;
            try {
              var input = ev.inputBuffer.getChannelData(0);
              var copy = new Float32Array(input.length); copy.set(input);
              var bytes = new Int8Array(copy.buffer, 0, copy.length * 4);
              var res = gwLib.decode(gwInstance, bytes);
              if (res && res.length) {
                var txt = "";
                for (var i = 0; i < res.length; i++) txt += String.fromCharCode(res[i]);
                txt = txt.trim();
                gwHandlePayload(txt, "watch");
              }
            } catch (e) { __sxErrLog("gw-decode", e); }
          };
          src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
          gwAudio.stream = stream; gwAudio.ctx = ctx; gwAudio.processor = proc; gwAudio.on = true;
          if (gwListenBtn) gwListenBtn.textContent = "Stop listening";
          gwSetStatus("Listening now — the ggwave decoder is live. Tap, double-tap, or hold on the watch and each decoded chirp lands in the journal with its time.");
          if (gwDecodeStatus) gwDecodeStatus.textContent = "Decoder live: ggwave-wasm, protocol p=4 (ultrasound fast) — only decoded TAP / DBL / HLD and metric (E / H / N, -100 to +100, shown as-is) payloads are logged. Mic audio is decoded on-device and never stored or sent anywhere; speech transcription leaves the device to Google only if you opt in for it in the Dom prompt.";
          return true;
        } catch (e) {
          __sxErrLog("gw-listen", e);
          gwStopListening("Microphone opened but the decoder could not start in this browser.", true);
          return false;
        }
      });
    }).catch(function (e) {
      __sxErrLog("gw-mic", e);
      gwSetStatus("Microphone permission was not granted, so the listener cannot hear the watch. Allow microphone access and try again.");
      return false;
    });
  }
  if (gwListenBtn) gwListenBtn.addEventListener("click", function () {
    if (gwAudio.on) {
      gwTransientListen = false;
      gwStopListening("Listener stopped. Chirps are only logged while listening.", true);
      return;
    }
    gwTransientListen = false;
    gwStartListening(false);
  });


  /* ---------------- GibberLink Bluetooth (BLE) transport (ble-1106-1405) ----------------
     A second transport alongside the acoustic GGWave chirps, carrying the
     SAME messages: check-in pulses out ("CHK"), TAP / DBL / HLD and
     E / H / N metric values in, attributed by the sender's short profile
     ID. The user never chooses a transport: where Web Bluetooth exists
     (Chrome on Android) BLE is used once connected, and GGWave stays the
     automatic fallback — and stays live as backup — whenever BLE is
     unavailable (iOS Safari has no Web Bluetooth), permission is denied,
     no device is picked, or the link drops and cannot be re-made.

     === GIBBERLINK BLE SPEC — THE WATCH APP MUST USE THIS SERVICE UUID ===
       Service UUID:  0000FFF0-0000-1000-8000-00805F9B34FB
         (gibberlink-1108-1400: replaces the old 7a1e5b90… service —
         Jason's ruling, following Gemini's spec v1.0. Under the FFF0
         service the phone picks the write characteristic and the
         notify characteristic by property, so their UUIDs are the
         watch app's own choice.)
     The watch advertises the service under a generic name (e.g.
     "GibberLink") — no kink wording anywhere on the watch side.
     Payloads are short UTF-8 text, opaque bytes to the watch:
       watch -> phone: "<key>:TAP" | "<key>:DBL" | "<key>:HLD" |
         "<key>:E<value>" | "<key>:H<value>" | "<key>:N<value>" |
         "ACK:<key>:CFG" — <key> is the sender's profile key (e.g.
         adam); metric values are the watch's display values, -100 to
         +100, sent as-is. A payload with NO key is broadcast (all
         watches) and is never dropped.
       phone -> watch: "CFG:<key>:<timer>" (setup), "CHK:<key>:P" /
         "CHK:<key>:T" (targeted check-in), "CHK:ALL:P" / "CHK:ALL:T"
         (broadcast check-in, explicit ALL signifier), "HEAT:<key>:<value>"
         (heat copied on sync), "CHK" for each play-guide check-in pulse.
         Incoming unkeyed messages are still accepted as broadcast.
     No pairing ceremony: plain Just Works / unencrypted GATT. The
     payloads are meaningless without the profile this phone holds.
     Web Bluetooth needs a user gesture to ask for a device, so the
     connect button below is that gesture; after the first grant, Chrome
     may hand the device back via navigator.bluetooth.getDevices() and
     the link re-forms on its own while a scene is active. On any drop,
     reconnect is attempted automatically while the user still wants the
     link (they have not pressed Disconnect). */
  var GIBBERLINK_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  var gwBleBtn = SexcapadesRuntime.DOM.byId("gwBleToggle"),
      gwBleStatus = SexcapadesRuntime.DOM.byId("gwBleStatus");
  var ble = { device: null, txChar: null, rxChar: null, on: false, want: false, busy: false, attempts: 0, timer: null };
  function bleSupported() {
    try { return !!(navigator && navigator.bluetooth && typeof navigator.bluetooth.requestDevice === "function"); }
    catch (e) { return false; }
  }
  function bleSetStatus(msg) { if (gwBleStatus) gwBleStatus.textContent = msg; }
  function bleSceneActive() {
    return !!((safetyDlg && safetyDlg.open) || guidePlay.on || gwAudio.on);
  }
  function bleUpdateBtn() {
    if (!gwBleBtn) return;
    if (!bleSupported()) { gwBleBtn.disabled = true; gwBleBtn.textContent = "Bluetooth unavailable here"; return; }
    gwBleBtn.disabled = ble.busy;
    gwBleBtn.textContent = ble.on ? "Disconnect Bluetooth watch" : "Connect watch over Bluetooth";
  }
  function bleOnNotify(ev) {
    try {
      var v = ev && ev.target ? ev.target.value : null; if (!v) return;
      var txt = "";
      for (var i = 0; i < v.byteLength; i++) txt += String.fromCharCode(v.getUint8(i));
      txt = txt.trim();
      if (txt) gwHandlePayload(txt, "ble");
    } catch (e) { __sxErrLog("ble-notify", e); }
  }
  function bleAttach(device) {
    ble.busy = true; bleUpdateBtn();
    return device.gatt.connect().then(function (server) {
      return server.getPrimaryService(GIBBERLINK_SERVICE_UUID);
    }).then(function (svc) {
      return svc.getCharacteristics();
    }).then(function (allChars) {
      var tx = null, rx = null;
      (allChars || []).forEach(function (ch) {
        var pr = ch.properties || {};
        if (!tx && (pr.write || pr.writeWithoutResponse)) tx = ch;
        if (!rx && pr.notify) rx = ch;
      });
      if (!tx || !rx) throw new Error("GibberLink characteristics not found");
      return [tx, rx];
    }).then(function (chars) {
      ble.txChar = chars[0]; ble.rxChar = chars[1];
      return ble.rxChar.startNotifications().then(function () {
        ble.rxChar.addEventListener("characteristicvaluechanged", bleOnNotify);
        ble.on = true; ble.busy = false; ble.attempts = 0;
        bleSetStatus("Watch link: Bluetooth connected to " + (device.name || "the GibberWear watch") + " — taps and metrics arrive over BLE, check-in pulses go out over BLE, and GGWave chirps stay live as backup.");
        bleUpdateBtn();
        return true;
      });
    }).catch(function (e) {
      __sxErrLog("ble-connect", e);
      ble.busy = false; ble.on = false; ble.txChar = null; ble.rxChar = null;
      bleUpdateBtn();
      return false;
    });
  }
  function bleScheduleReconnect() {
    if (!ble.want || ble.on || ble.busy || ble.timer) return;
    ble.attempts++;
    var delay = Math.min(3000 * ble.attempts, 15000);
    bleSetStatus("Watch link: Bluetooth dropped — reconnecting in " + Math.round(delay / 1000) + "s (attempt " + ble.attempts + "). GGWave chirps carry the scene meanwhile.");
    ble.timer = setTimeout(function () {
      ble.timer = null;
      if (!ble.want || ble.on || !ble.device) return;
      bleAttach(ble.device).then(function (ok) { if (!ok) bleScheduleReconnect(); });
    }, delay);
  }
  function bleOnDisconnect() {
    ble.on = false; ble.txChar = null; ble.rxChar = null;
    bleUpdateBtn();
    if (ble.want) bleScheduleReconnect();
    else bleSetStatus("Watch link: Bluetooth disconnected — GGWave chirps are the active transport.");
  }
  function bleWireDevice(device) {
    ble.device = device;
    device.addEventListener("gattserverdisconnected", bleOnDisconnect);
  }
  function bleForgetWiring() {
    if (ble.timer) { clearTimeout(ble.timer); ble.timer = null; }
    if (ble.device) { try { ble.device.removeEventListener("gattserverdisconnected", bleOnDisconnect); } catch (e) {} }
  }
  /* Outbound pulse path: resolves true only when the write actually
     completed, null when BLE is not connected (nothing claimed), false
     when a connected write failed. guideFirePulse reports exactly this. */
  function bleSendText(text) {
    if (!ble.on || !ble.txChar) return Promise.resolve(null);
    try {
      var bytes = new TextEncoder().encode(String(text));
      var write = typeof ble.txChar.writeValueWithResponse === "function"
        ? ble.txChar.writeValueWithResponse(bytes)
        : ble.txChar.writeValue(bytes);
      return Promise.resolve(write).then(function () { return true; }).catch(function (e) { __sxErrLog("ble-write", e); return false; });
    } catch (e) { __sxErrLog("ble-write", e); return Promise.resolve(false); }
  }
  function bleMaybeReconnect() {
    /* Silent re-entry while a scene is active: if Chrome still holds a
       permission grant for the watch (getDevices), reconnect without a
       chooser. No grant or no API: nothing happens — the connect button
       (a user gesture) is the way in, exactly as Web Bluetooth requires. */
    if (!bleSupported() || ble.on || ble.busy || !ble.want) return;
    if (!bleSceneActive()) return;
    try {
      if (typeof navigator.bluetooth.getDevices !== "function") return;
      navigator.bluetooth.getDevices().then(function (devices) {
        if (!devices || !devices.length || ble.on || ble.busy) return;
        var dev = ble.device || devices[0];
        if (!ble.device) bleWireDevice(dev);
        bleAttach(dev).then(function (ok) { if (!ok) bleScheduleReconnect(); });
      }).catch(function (e) { __sxErrLog("ble-getdevices", e); });
    } catch (e) { __sxErrLog("ble-getdevices", e); }
  }
  if (gwBleBtn) gwBleBtn.addEventListener("click", function () {
    if (!bleSupported()) {
      bleSetStatus("Watch link: Bluetooth is not available in this browser (iPhone Safari has no Web Bluetooth) — GGWave chirps are the transport, no action needed.");
      return;
    }
    if (ble.on) {
      ble.want = false; bleForgetWiring();
      try { if (ble.device && ble.device.gatt && ble.device.gatt.connected) ble.device.gatt.disconnect(); } catch (e) { __sxErrLog("ble-disconnect", e); }
      ble.on = false; ble.txChar = null; ble.rxChar = null; ble.device = null;
      bleSetStatus("Watch link: Bluetooth disconnected — GGWave chirps are the active transport.");
      bleUpdateBtn();
      return;
    }
    ble.want = true;
    bleSetStatus("Watch link: pick the GibberWear watch in the Bluetooth chooser…");
    navigator.bluetooth.requestDevice({ filters: [{ services: [GIBBERLINK_SERVICE_UUID] }] }).then(function (device) {
      bleWireDevice(device);
      return bleAttach(device);
    }).then(function (ok) {
      if (ok === false) {
        ble.want = false;
        bleSetStatus("Watch link: the watch was picked but the GibberLink service did not answer — staying on GGWave chirps. Check the watch app is advertising the GibberLink service, then try Connect again.");
      }
    }).catch(function (e) {
      /* NotFoundError = chooser closed / no device picked; anything else
         (SecurityError, permission) lands here too. Either way the
         fallback is automatic: GGWave carries the scene, nothing to fix. */
      __sxErrLog("ble-request", e);
      ble.want = false;
      bleSetStatus("Watch link: no Bluetooth watch connected (" + (e && e.name ? e.name : "unavailable") + ") — GGWave chirps are the transport, no action needed.");
      bleUpdateBtn();
    });
  });
  if (!bleSupported()) {
    bleSetStatus("Watch link: Bluetooth is not available in this browser (iPhone Safari has no Web Bluetooth) — GGWave chirps are the transport, no action needed.");
  } else {
    bleSetStatus("Watch link: Bluetooth available but not connected — tap Connect to pair the watch for this scene; until then GGWave chirps are the transport.");
  }
  bleUpdateBtn();

  /* ---------------- GibberLink setup + check-in sender (gibberlink-1108-1400) ----------------
     The phone side of the GibberLink spec as ruled by Jason: the profile
     KEY is the identifier (no provisioned numeric UID; the display name
     is the key for now). Setup sends CFG:<key>:<timer> over ultrasound
     and BLE and waits for the watch's ACK:<key>:CFG (see gwOnAck).
     Check-ins send CHK:<key>:<P|T> to one watch, or CHK:ALL:<P|T> as
     a broadcast every watch answers (explicit ALL signifier on send;
     incoming unkeyed messages still count as broadcast, so older
     unkeyed watches keep working). The same
     setup send is offered from the heat slider for a saved profile
     (a shortcut for those in the know); Scene Sentinel stays its home. */
  var gwCfgKeyEl = SexcapadesRuntime.DOM.byId("gwCfgKey"), gwCfgTimerEl = SexcapadesRuntime.DOM.byId("gwCfgTimer"),
      gwCfgSendBtn = SexcapadesRuntime.DOM.byId("gwCfgSend"), gwCfgStatusEl = SexcapadesRuntime.DOM.byId("gwCfgStatus"),
      gwChkTargetEl = SexcapadesRuntime.DOM.byId("gwChkTarget"), gwChkTypeEl = SexcapadesRuntime.DOM.byId("gwChkType"),
      gwChkSendBtn = SexcapadesRuntime.DOM.byId("gwChkSend"), gwChkStatusEl = SexcapadesRuntime.DOM.byId("gwChkStatus"),
      gwLinkLogEl = SexcapadesRuntime.DOM.byId("gwLinkLog"), gwLinkLogEmptyEl = SexcapadesRuntime.DOM.byId("gwLinkLogEmpty");
  var gwHeatStatusEl = null;
  function gwCfgSetStatus(msg) { if (gwCfgStatusEl) gwCfgStatusEl.textContent = msg; if (gwHeatStatusEl) gwHeatStatusEl.textContent = msg; }
  function gwChkSetStatus(msg) { if (gwChkStatusEl) gwChkStatusEl.textContent = msg; }
  function gwSectionsScrollEl() { try { return document.querySelector("#safetyDialog .safety-sections"); } catch (e) { return null; } }
  function gwLinkLog(dir, payload, via) {
    if (!gwLinkLogEl) return;
    /* sentinel-density-1108-1545: appending to the log must never move the
       dialog's scroll position — only the user's own scrolling does. */
    var sec = gwSectionsScrollEl(); var secTop = sec ? sec.scrollTop : 0;
    var li = document.createElement("li");
    li.textContent = dir + " " + payload + " · " + fmtCT(nowMs()) + (via ? " · " + via : "");
    gwLinkLogEl.insertBefore(li, gwLinkLogEl.firstChild);
    while (gwLinkLogEl.children.length > 50) gwLinkLogEl.removeChild(gwLinkLogEl.lastChild);
    if (gwLinkLogEmptyEl) gwLinkLogEmptyEl.hidden = true;
    if (sec && sec.scrollTop !== secTop) sec.scrollTop = secTop;
  }
  function gwValidKey(k) { return /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(String(k || "")); }
  /* bigbuild-1108-1615 key-name fix: the watch identifier IS the profile
     key (adam, eve) — never the internal "profile-<key>-<surname>" slug.
     Any id or typed value is reduced to the key before it is displayed
     or sent: "profile-eve-vale" -> "eve". */
  function gwKeyFromId(id) {
    var s = String(id || "").trim();
    if (!s) return "";
    var m = /^profile-([A-Za-z0-9]+)(?:-|$)/i.exec(s);
    if (m) return m[1].toLowerCase();
    return s;
  }
  function gwKeyLabel(key) { return key ? key.charAt(0).toUpperCase() + key.slice(1) : key; }
  function gwEnsureChkOption(key) {
    key = gwKeyFromId(key);
    if (!gwChkTargetEl || !gwValidKey(key)) return;
    for (var i = 0; i < gwChkTargetEl.options.length; i++) { if (gwChkTargetEl.options[i].value === key) return; }
    var opt = document.createElement("option"); opt.value = key; opt.textContent = gwKeyLabel(key);
    gwChkTargetEl.appendChild(opt);
  }
  function gwPopulateChkTargets() {
    try { var api = window.Sexcapades2xProfiles; if (api && typeof api.getIds === "function") api.getIds().forEach(function (id) { gwEnsureChkOption(id); }); } catch (e) { __sxErrLog("gw-targets", e); }
    if (gwCfgKeyEl) gwEnsureChkOption(gwCfgKeyEl.value.trim());
  }
  function gwSendBoth(payload) {
    return Promise.all([gwSendPayload(payload), bleSendText(payload)]).then(function (r) { return { chirp: !!r[0], ble: r[1] }; });
  }
  function gwSendCfg(key, timer, heatStatusEl, heatValue) {
    key = gwKeyFromId(key);
    if (!gwValidKey(key)) { gwCfgSetStatus("Enter the watch's profile key first — the short key from the profile (e.g. adam, eve). Letters and digits, no spaces."); return; }
    timer = parseInt(timer, 10); if (isNaN(timer) || timer < 0) timer = 0;
    var payload = "CFG:" + key + ":" + timer;
    gwHeatStatusEl = heatStatusEl || null;
    gwPendingCfgKey = key;
    gwPendingHeatValue = (typeof heatValue === "number" && isFinite(heatValue)) ? heatValue : null;
    if (gwPendingCfgTimer) { try { SexcapadesRuntime.TimerManager.clear(gwPendingCfgTimer); } catch (e) {} gwPendingCfgTimer = null; }

    /* Transmit outgoing CFG first; do NOT arm mic until outgoing sound finishes to avoid acoustic collision */
    gwSendBoth(payload).then(function (res) {
      var via = res.ble === true ? "Bluetooth" : "ultrasound";
      gwLinkLog("OUT", payload, via);
      var msg = "Setup sent (" + payload + ") on " + via + ". Waiting for ACK:" + key + ":CFG…";
      if (!res.chirp && res.ble !== true) msg += " The chirp could not be encoded on this device (" + (gwTxDiag || "unknown reason") + "), so the watch may not have heard it — start the listener or connect Bluetooth, then send again.";
      gwCfgSetStatus(msg);

      /* Arm microphone listener after playback finishes (with a brief 50ms guard) */
      if (!gwAudio.on && (!ble.on || !ble.rxChar)) {
        setTimeout(function () {
          if (gwPendingCfgKey === key) gwStartListening(true);
        }, 50);
      }
    });

    gwPendingCfgTimer = SexcapadesRuntime.TimerManager.setTimeout(function () {
      if (gwPendingCfgKey === key) {
        gwPendingCfgKey = "";
        gwPendingHeatValue = null;
        gwCfgSetStatus("Watch " + key + " didn't acknowledge — check that GibberWear is open, listening, and nearby.");
        if (gwTransientListen) gwStopListening("", true);
      }
    }, 4500);
  }
  if (gwCfgSendBtn) gwCfgSendBtn.addEventListener("click", function () {
    gwSendCfg(gwCfgKeyEl ? gwCfgKeyEl.value : "", gwCfgTimerEl ? gwCfgTimerEl.value : 0, null);
  });
  if (gwCfgKeyEl) gwCfgKeyEl.addEventListener("input", function () { gwEnsureChkOption(gwCfgKeyEl.value.trim()); });
  if (gwChkSendBtn) gwChkSendBtn.addEventListener("click", function () {
    var target = gwKeyFromId(gwChkTargetEl ? gwChkTargetEl.value : "");
    var type = gwChkTypeEl ? gwChkTypeEl.value : "P"; if (type !== "T") type = "P";
    /* bigbuild-1108-1615: broadcast sends carry the explicit ALL signifier
       (CHK:ALL:P / CHK:ALL:T); targeted sends use the key only. Incoming
       unkeyed messages are still treated as broadcast (see gwHandlePayload). */
    var payload = target ? "CHK:" + target + ":" + type : "CHK:ALL:" + type;
    gwSendBoth(payload).then(function (res) {
      gwLinkLog("OUT", payload, res.ble === true ? "Bluetooth" : "ultrasound");
      if (target) gwChkSetStatus("Check-in sent: " + payload + " — only watch " + target + " should answer");
      else gwChkSetStatus("Check-in sent: " + payload + " — broadcast to ALL watches, so every watch in the room should answer.");
    });
  });
  gwPopulateChkTargets();

  /* Heat-slider setup offer (gibberlink-1108-1400): the same CFG send,
     offered inside the heat popover for the profile whose heat is being
     set — but ONLY for a saved profile. The guard: the tab's profile key
     must resolve in the profile store AND be a sample profile, a
     remembered (saved-on-device) profile, or a profile with no unsaved
     changes, and its name must not be the unsaved "New profile" draft.
     When the guard fails the offer stays hidden and nothing is sent. */
  var gwHeatLastKey = "";
  function gwHeatResolveKey() {
    var k = gwHeatLastKey;
    if (!k || !gwValidKey(k)) return "";
    var rawId = k;
    try {
      var api = window.Sexcapades2xProfiles;
      if (!api || typeof api.has !== "function" || !api.has(k)) return "";
      var nm = SexcapadesRuntime.DOM.byId("heatProfileName");
      if (nm && nm.textContent.trim() === "New profile") return "";
      var saved = false;
      if (typeof api.isSample === "function" && api.isSample(k)) saved = true;
      if (!saved && typeof api.isDirty === "function" && !api.isDirty(k)) saved = true;
      if (!saved) { try { var stored = JSON.parse(window.localStorage.getItem("sexcapades_2x_remembered_profiles") || "{}"); if (stored && stored.profiles && stored.profiles[k]) saved = true; } catch (e) {} }
      return saved ? gwKeyFromId(rawId) : "";
    } catch (e) { __sxErrLog("heat-watch-guard", e); return ""; }
  }
  function gwHeatSyncOffer() {
    var offer = SexcapadesRuntime.DOM.byId("heatWatchOffer"); if (!offer) return;
    var pop = SexcapadesRuntime.DOM.byId("heatPopover");
    if (!pop || pop.hidden) { offer.hidden = true; return; }
    var k = gwHeatResolveKey();
    offer.hidden = !k;
    if (k) { var kel = SexcapadesRuntime.DOM.byId("heatWatchKey"); if (kel) kel.textContent = gwKeyLabel(k); offer.setAttribute("data-watch-key", k); }
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-profile-heat]") : null;
    if (t) { gwHeatLastKey = t.getAttribute("data-profile-heat") || ""; try { SexcapadesRuntime.TimerManager.setTimeout(gwHeatSyncOffer, 80); } catch (e) {} }
  }, true);
  var gwHeatPopEl = SexcapadesRuntime.DOM.byId("heatPopover");
  if (gwHeatPopEl && typeof window.MutationObserver === "function") { try { new MutationObserver(function () { gwHeatSyncOffer(); }).observe(gwHeatPopEl, { attributes: true, attributeFilter: ["hidden"] }); } catch (e) { __sxErrLog("heat-watch-observe", e); } }
  var gwHeatSetupBtn = SexcapadesRuntime.DOM.byId("heatWatchSetupBtn");
  if (gwHeatSetupBtn) gwHeatSetupBtn.addEventListener("click", function () {
    var offer = SexcapadesRuntime.DOM.byId("heatWatchOffer");
    var k = offer ? (offer.getAttribute("data-watch-key") || "") : "";
    if (!k) return;
    if (gwCfgKeyEl) gwCfgKeyEl.value = k;
    /* bigbuild-1108-1615 heat-copying: the sync sends the profile's current
       Heat (the slider's live value for this profile) with the setup. */
    var heatEl = SexcapadesRuntime.DOM.byId("heatSlider");
    var heatVal = heatEl ? Number(heatEl.value) : NaN;
    gwSendCfg(k, gwCfgTimerEl ? gwCfgTimerEl.value : 300, SexcapadesRuntime.DOM.byId("heatWatchStatus"), isFinite(heatVal) ? heatVal : null);
  });

  /* ---------------- Play guide Way B: paste-back, Dom playback, GibberLink check-in pulse (guide-1106-0847) ----------------
     The Scene Setter play-guide prompt now requires ONE structured format
     from every AI (see STRUCTURED PLAY GUIDE FORMAT in the Setter prompt):
       [MM:SS-MM:SS] Activity name — guidance for the Dom
     Time codes are elapsed time from scene start (MM:SS or H:MM:SS).
     Activity names come from the fixed set the Setter prompt lists, so
     this parser reads any AI's guide the same way. Queueing a guide builds
     the step timers; while playback runs, the APP holds the clock and
     fires the check-in pulse — the watch is never asked to run a timer
     over GibberLink. Each pulse tries a real GGWave transmit of "CHK"
     (p=4, the same protocol the listener decodes) and always also pulses
     on this device (vibrate + tone + panel flash), and every watch tap or
     metric that lands is stamped with the step scheduled at that moment
     (entry.sched), which is how the journal fills in what was supposed to
     be happening. Playback state is session-only; the queued guide itself
     is saved with the rest of Sentinel's local state. */
  var GUIDE_ACTIVITIES = ["Warm-up","Negotiation check","Bondage","Impact play","Sensation play","Teasing & denial","Oral","Manual stimulation","Penetrative sex","Orgasm control","Roleplay","Service","Worship","Free play","Aftercare","Other"];
  function guideParseClock(tok) {
    var parts = String(tok || "").trim().split(":");
    if (parts.length < 2 || parts.length > 3) return null;
    var nums = [];
    for (var i = 0; i < parts.length; i++) { if (!/^\d{1,3}$/.test(parts[i])) return null; nums.push(parseInt(parts[i], 10)); }
    if (nums.length === 2) return nums[0] * 60 + nums[1];
    return nums[0] * 3600 + nums[1] * 60 + nums[2];
  }
  function guideFmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), r = sec % 60;
    var mm = (h > 0 && m < 10) ? "0" + m : String(m), ss = r < 10 ? "0" + r : String(r);
    return (h > 0 ? h + ":" : "") + mm + ":" + ss;
  }
  function parsePlayGuide(text) {
    var steps = [], skipped = 0, pulseMin = null;
    String(text || "").split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      var cm = /^CHECK-IN\s+EVERY:\s*(\d{1,2})\s*MIN/i.exec(line);
      if (cm) { var pv = parseInt(cm[1], 10); if (pv >= 1 && pv <= 15) pulseMin = pv; return; }
      var m = /^\[?\s*(?:T\s*\+?\s*)?(\d{1,3}:\d{2}(?::\d{2})?)(?:\s*(?:[-–—]|to)\s*(\d{1,3}:\d{2}(?::\d{2})?))?\s*\]?\s*[:\-–—]?\s*(.+)$/i.exec(line);
      if (!m) { skipped++; return; }
      var start = guideParseClock(m[1]), end = m[2] ? guideParseClock(m[2]) : null;
      if (start === null) { skipped++; return; }
      var rest = m[3].trim();
      var activity = rest, note = "";
      var dash = rest.indexOf(" — ");
      if (dash < 0) dash = rest.indexOf(" - ");
      if (dash > 0) { activity = rest.slice(0, dash).trim(); note = rest.slice(dash + 3).trim(); }
      else { var pipe = rest.indexOf("|"); if (pipe > 0) { activity = rest.slice(0, pipe).trim(); note = rest.slice(pipe + 1).trim(); } }
      if (!activity) { skipped++; return; }
      if (end !== null && end <= start) end = null;
      steps.push({ start: start, end: end, activity: activity.slice(0, 80), note: note.slice(0, 300) });
    });
    steps.sort(function (a, b) { return a.start - b.start; });
    for (var i = 0; i < steps.length; i++) { if (steps[i].end === null) steps[i].end = (i + 1 < steps.length) ? steps[i + 1].start : steps[i].start + 300; }
    return { steps: steps, skipped: skipped, pulseMin: pulseMin };
  }
  window.__sxParsePlayGuide = parsePlayGuide;
  var gwGuideInput = SexcapadesRuntime.DOM.byId("gwGuideInput"), gwGuideStatus = SexcapadesRuntime.DOM.byId("gwGuideStatus"),
      gwGuideSteps = SexcapadesRuntime.DOM.byId("gwGuideSteps"), gwGuidePulseSel = SexcapadesRuntime.DOM.byId("gwGuidePulseMin"),
      gwDomPanel = SexcapadesRuntime.DOM.byId("gwDomPanel"),
      gwNowActivity = SexcapadesRuntime.DOM.byId("gwNowActivity"), gwNowNote = SexcapadesRuntime.DOM.byId("gwNowNote"),
      gwNowCount = SexcapadesRuntime.DOM.byId("gwNowCount"), gwNowProgress = SexcapadesRuntime.DOM.byId("gwNowProgress"),
      gwNextActivity = SexcapadesRuntime.DOM.byId("gwNextActivity"), gwNextNote = SexcapadesRuntime.DOM.byId("gwNextNote"),
      gwSceneClock = SexcapadesRuntime.DOM.byId("gwSceneClock"), gwPulseStatus = SexcapadesRuntime.DOM.byId("gwPulseStatus"),
      gwDomList = SexcapadesRuntime.DOM.byId("gwDomList"),
      gwPlayBtn = SexcapadesRuntime.DOM.byId("gwPlayBtn"), gwPauseBtn = SexcapadesRuntime.DOM.byId("gwPauseBtn"), gwStopBtn = SexcapadesRuntime.DOM.byId("gwStopBtn");
  var guidePlay = { on: false, paused: false, startedAt: 0, pausedAt: 0, pausedAccum: 0, stepIdx: -1, nextPulseAt: 0, pulses: 0 };
  function guideElapsedSec() {
    if (!guidePlay.on) return 0;
    var end = guidePlay.paused ? guidePlay.pausedAt : nowMs();
    return Math.max(0, (end - guidePlay.startedAt - guidePlay.pausedAccum) / 1000);
  }
  function guideStepAt(sec) {
    var steps = state.guide.steps;
    for (var i = steps.length - 1; i >= 0; i--) { if (sec >= steps[i].start && sec < steps[i].end) return steps[i]; }
    return null;
  }
  function guideCurrentSched() {
    if (!guidePlay.on || !state.guide.steps.length) return "";
    var st = guideStepAt(guideElapsedSec());
    return st ? st.activity : "";
  }
  var gwTxDiag = "";
  function gwTxText(payload) {
    /* Best-effort real GibberLink transmit: reuse the loaded ggwave lib to
       encode the payload at p=4 and play it. Returns a Promise resolving true
       only when samples have actually finished playing to the audio output;
       anything else resolves false so a status line never claims a chirp
       that did not happen. The stage that failed is kept in gwTxDiag so the
       sender status can name it. */
    return new Promise(function (resolve) {
      try {
        if (!gwLib || typeof gwLib.encode !== "function") { gwTxDiag = "decoder not loaded"; return resolve(false); }
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { gwTxDiag = "Web Audio not available in this browser"; return resolve(false); }
        if (!gwTxText.ctx) gwTxText.ctx = new AC();
        var ctx = gwTxText.ctx;
        if (ctx.state === "suspended") ctx.resume();
        var inst = gwInstance;
        var ownInst = null;
        if (inst === null || inst === undefined) {
          var params = gwLib.getDefaultParameters();
          params.sampleRateInp = ctx.sampleRate; params.sampleRateOut = ctx.sampleRate;
          ownInst = gwLib.init(params); inst = ownInst;
        }
        var samples = gwLib.encode(inst, String(payload), 4, 20);
        if (ownInst !== null && ownInst !== undefined) { try { gwLib.free(ownInst); } catch (e) {} }
        if (!samples || !samples.length) { gwTxDiag = "encode returned no samples"; return resolve(false); }
        /* This ggwave build returns the waveform as an Int8Array of raw
           float32 bytes (a view into the WASM heap), not a Float32Array —
           reinterpret the bytes, or copyToChannel rejects it. */
        var f32;
        if (samples instanceof Float32Array) f32 = samples;
        else if (samples.buffer) f32 = new Float32Array(samples.buffer, samples.byteOffset || 0, Math.floor((samples.byteLength || 0) / 4));
        else f32 = Float32Array.from(samples);
        if (!f32.length) { gwTxDiag = "encode returned no samples"; return resolve(false); }
        var buf = ctx.createBuffer(1, f32.length, ctx.sampleRate);
        buf.copyToChannel(f32, 0);
        var srcNode = ctx.createBufferSource();
        srcNode.buffer = buf;
        srcNode.connect(ctx.destination);
        var durationSec = f32.length / ctx.sampleRate;
        var ended = false;
        function finish() {
          if (ended) return;
          ended = true;
          gwTxDiag = "";
          resolve(true);
        }
        srcNode.onended = finish;
        setTimeout(finish, Math.ceil(durationSec * 1000) + 150);
        srcNode.start();
      } catch (e) {
        __sxErrLog("guide-tx", e);
        gwTxDiag = "error: " + (e && e.message ? e.message : String(e));
        resolve(false);
      }
    });
  }
  function gwSendPayload(payload) {
    /* Ultrasound send for the setup / check-in sender: unlike the guide
       pulse (which only reports a chirp when the listener already loaded
       the decoder), this loads the ggwave lib on demand so a setup can be
       sent without starting the microphone listener first. Resolves true
       only when samples were actually played. */
    if (gwLib) return Promise.resolve(gwTxText(payload));
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return Promise.resolve(false);
    try { if (!gwTxText.ctx) gwTxText.ctx = new AC(); } catch (e) { __sxErrLog("gw-tx-ctx", e); }
    var rate = gwTxText.ctx ? gwTxText.ctx.sampleRate : 48000;
    return gwEnsureDecoder(rate).then(function (ok) { return ok ? gwTxText(payload) : false; });
  }
  function guideTxPulse() {
    return gwTxText("CHK");
  }
  function guideFirePulse(reason) {
    guidePlay.pulses++;
    vibrate([160, 70, 160]);
    gwBeep();
    var sent = false;
    var bleStateVal = null;
    var sched = guideCurrentSched();
    var pulseNo = guidePlay.pulses, firedAt = fmtCT(nowMs());
    function showPulse() {
      if (!gwPulseStatus) return;
      gwPulseStatus.textContent = "Check-in pulse #" + pulseNo + " fired " + firedAt + (reason ? " (" + reason + ")" : "") + (sched ? " — scheduled now: " + sched + "." : ".") + (sent ? " GibberLink chirp \u201CCHK\u201D sent over GGWave p=4." : " Watch chirp not sent (decoder not loaded — Start listening first); this device pulsed instead, and the watch's next tap will be matched to the schedule.") + (bleStateVal === true ? " Check-in pulse \u201CCHK\u201D also written over Bluetooth (GibberLink BLE)." : (bleStateVal === false ? " Bluetooth write failed — the watch may have dropped; reconnect runs automatically and GGWave carries the scene meanwhile." : ""));
    }
    showPulse();
    guideTxPulse().then(function (ok) {
      if (ok) { sent = true; showPulse(); }
    });
    /* Same pulse over BLE when connected (ble-1106-1405): bleSendText
       resolves null when Bluetooth is not connected, so the status line
       only ever claims a Bluetooth send that actually completed. */
    bleSendText("CHK").then(function (bleState) { if (bleState !== null) { bleStateVal = bleState; showPulse(); } });
    if (gwDomPanel) { gwDomPanel.classList.remove("gw-guide-pulse-flash"); void gwDomPanel.offsetWidth; gwDomPanel.classList.add("gw-guide-pulse-flash"); }
  }
  function renderGuide() {
    var g = state.guide;
    if (gwGuideInput && document.activeElement !== gwGuideInput) gwGuideInput.value = g.text || "";
    if (gwGuidePulseSel && document.activeElement !== gwGuidePulseSel) gwGuidePulseSel.value = String(g.pulseMin || 5);
    if (gwGuideSteps) {
      gwGuideSteps.innerHTML = "";
      g.steps.forEach(function (st) {
        var row = document.createElement("div"); row.className = "gw-guide-step";
        var tm = document.createElement("time"); tm.textContent = guideFmtClock(st.start) + "–" + guideFmtClock(st.end);
        var act = document.createElement("strong"); act.textContent = st.activity;
        var nt = document.createElement("span"); nt.textContent = st.note || "";
        row.appendChild(tm); row.appendChild(act); if (st.note) row.appendChild(nt);
        gwGuideSteps.appendChild(row);
      });
      gwGuideSteps.hidden = !g.steps.length;
    }
    if (gwGuideStatus && !guidePlay.on) {
      gwGuideStatus.textContent = g.steps.length
        ? "Play guide queued: " + g.steps.length + " timed step" + (g.steps.length === 1 ? "" : "s") + ", " + guideFmtClock(g.steps[g.steps.length - 1].end) + " total, check-in pulse every " + g.pulseMin + " min. Press Start playback in the Dom panel when the scene begins."
        : "No play guide queued.";
    }
    if (gwDomPanel) gwDomPanel.hidden = !g.steps.length;
    renderGuidePlayback();
  }
  function renderGuidePlayback() {
    var g = state.guide, steps = g.steps;
    if (!steps.length) return;
    var elapsed = guideElapsedSec();
    var idx = -1;
    for (var i = steps.length - 1; i >= 0; i--) { if (elapsed >= steps[i].start && elapsed < steps[i].end) { idx = i; break; } }
    var cur = idx >= 0 ? steps[idx] : null, nxt = idx + 1 < steps.length ? steps[idx + 1] : null;
    if (gwSceneClock) gwSceneClock.textContent = guideFmtClock(elapsed) + (guidePlay.on ? (guidePlay.paused ? " · paused" : " · playing") : " · not started");
    if (gwNowActivity) gwNowActivity.textContent = !guidePlay.on ? "Queued — press Start playback" : (cur ? cur.activity : (elapsed < steps[0].start ? "Scene starts at " + guideFmtClock(steps[0].start) : "Guide finished"));
    if (gwNowNote) gwNowNote.textContent = cur ? (cur.note || "") : "";
    if (gwNowCount) gwNowCount.textContent = cur && guidePlay.on ? guideFmtClock(cur.end - elapsed) + " left in this step" : "";
    if (gwNowProgress) gwNowProgress.style.width = cur ? Math.min(100, Math.max(0, (elapsed - cur.start) / Math.max(1, cur.end - cur.start) * 100)) + "%" : "0%";
    if (gwNextActivity) gwNextActivity.textContent = nxt ? (guideFmtClock(nxt.start) + " — " + nxt.activity) : "Nothing after this step";
    if (gwNextNote) gwNextNote.textContent = nxt ? (nxt.note || "") : "";
    if (gwPulseStatus && !guidePlay.on) gwPulseStatus.textContent = "Check-in pulse: armed when playback starts — every " + g.pulseMin + " min, plus at every step change. The app holds the timer; the watch holds none.";
    if (gwDomList) {
      gwDomList.innerHTML = "";
      steps.forEach(function (st, i2) {
        var li = document.createElement("li");
        li.textContent = guideFmtClock(st.start) + " " + st.activity;
        if (i2 === idx) li.setAttribute("data-active", "true");
        else if (guidePlay.on && elapsed >= st.end) li.setAttribute("data-done", "true");
        gwDomList.appendChild(li);
      });
    }
    if (gwPlayBtn) gwPlayBtn.disabled = guidePlay.on && !guidePlay.paused;
    if (gwPlayBtn) gwPlayBtn.textContent = guidePlay.paused ? "Resume playback" : "Start playback";
    if (gwPauseBtn) gwPauseBtn.disabled = !guidePlay.on || guidePlay.paused;
    if (gwStopBtn) gwStopBtn.disabled = !guidePlay.on;
  }
  function guideTick() {
    if (!guidePlay.on || guidePlay.paused) return;
    var elapsed = guideElapsedSec();
    var st = guideStepAt(elapsed);
    var idx = st ? state.guide.steps.indexOf(st) : -1;
    if (idx !== guidePlay.stepIdx) {
      var first = guidePlay.stepIdx === -1;
      guidePlay.stepIdx = idx;
      if (!first && st) guideFirePulse("step change — now: " + st.activity);
    }
    if (guidePlay.nextPulseAt && nowMs() >= guidePlay.nextPulseAt) {
      guideFirePulse("scheduled check-in");
      guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
    }
    var last = state.guide.steps[state.guide.steps.length - 1];
    if (last && elapsed >= last.end) {
      guidePlay.on = false; guidePlay.paused = false;
      if (gwGuideStatus) gwGuideStatus.textContent = "Play guide finished — " + state.guide.steps.length + " steps played, " + guidePlay.pulses + " check-in pulses fired. The journal below carries the scheduled activity for every tap.";
      vibrate([200, 80, 200]);
    }
    if (safetyDlg && safetyDlg.open) renderGuidePlayback();
  }
  var gwGuideQueueBtn = SexcapadesRuntime.DOM.byId("gwGuideQueueBtn"), gwGuideClearBtn = SexcapadesRuntime.DOM.byId("gwGuideClearBtn");
  if (gwGuideQueueBtn) gwGuideQueueBtn.addEventListener("click", function () {
    var text = gwGuideInput ? gwGuideInput.value : "";
    var parsed = parsePlayGuide(text);
    if (!parsed.steps.length) {
      if (gwGuideStatus) gwGuideStatus.textContent = "No timed steps found. Each step needs a time code first, like [00:00-05:00] Warm-up — … (Scene Setter's play-guide prompt now asks every AI for exactly this format.)";
      return;
    }
    state.guide.text = text;
    state.guide.steps = parsed.steps;
    state.guide.pulseMin = gwGuidePulseSel ? (+gwGuidePulseSel.value || 5) : 5;
    if (parsed.pulseMin) { var opts = [1, 2, 5, 10, 15], snap = opts[0]; opts.forEach(function (o) { if (Math.abs(o - parsed.pulseMin) < Math.abs(snap - parsed.pulseMin)) snap = o; }); state.guide.pulseMin = snap; if (gwGuidePulseSel) gwGuidePulseSel.value = String(snap); }
    state.guide.queuedAt = nowMs();
    guidePlay.on = false; guidePlay.paused = false; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
    save(); renderGuide();
    if (gwGuideStatus) gwGuideStatus.textContent = "Play guide queued: " + parsed.steps.length + " timed steps" + (parsed.skipped ? " (" + parsed.skipped + " line" + (parsed.skipped === 1 ? "" : "s") + " without a time code skipped)" : "") + ". The Dom play-by-play panel is open below the listener — press Start playback when the scene begins.";
    /* sentinel-density-1108-1545: no scrollIntoView here — queuing a guide must not yank the dialog's scroll position. */
  });
  if (gwGuideClearBtn) gwGuideClearBtn.addEventListener("click", function () {
    state.guide = { text: "", steps: [], pulseMin: state.guide.pulseMin || 5, queuedAt: 0 };
    guidePlay.on = false; guidePlay.paused = false; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
    save(); renderGuide();
  });
  if (gwGuidePulseSel) gwGuidePulseSel.addEventListener("change", function () {
    state.guide.pulseMin = +gwGuidePulseSel.value || 5;
    if (guidePlay.on) guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
    save(); renderGuidePlayback();
  });
  if (gwPlayBtn) gwPlayBtn.addEventListener("click", function () {
    if (guidePlay.paused) {
      guidePlay.pausedAccum += nowMs() - guidePlay.pausedAt;
      guidePlay.paused = false;
      guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
    } else if (!guidePlay.on) {
      guidePlay.on = true; guidePlay.startedAt = nowMs(); guidePlay.pausedAccum = 0; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
      guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
      guideFirePulse("scene start");
    }
    renderGuidePlayback();
  });
  if (gwPauseBtn) gwPauseBtn.addEventListener("click", function () {
    if (!guidePlay.on || guidePlay.paused) return;
    guidePlay.paused = true; guidePlay.pausedAt = nowMs();
    renderGuidePlayback();
  });
  if (gwStopBtn) gwStopBtn.addEventListener("click", function () {
    guidePlay.on = false; guidePlay.paused = false; guidePlay.stepIdx = -1;
    if (gwGuideStatus) gwGuideStatus.textContent = "Playback stopped. The guide stays queued — press Start playback to run it from the top.";
    renderGuidePlayback();
  });


  /* ---------------- Close button + timers ---------------- */
  var closeSafety = SexcapadesRuntime.DOM.byId("closeSafetyButton");
  if (closeSafety) closeSafety.addEventListener("click", function () { closeDialog(safetyDlg); syncBtn(); });

  var lastMissBuzz = 0;
  SexcapadesRuntime.TimerManager.setInterval(function () {
    var ci = state.checkin, n = nowMs(), changed = false;
    if (ci.phase === "running" && ci.nextDue && n >= ci.nextDue) {
      ci.phase = "due"; ci.dueAt = n; changed = true;
      vibrate([180, 80, 180, 80, 180]);
      sentinelNotify('due');
    } else if (ci.phase === "due" && n > ci.dueAt + GRACE_MS) {
      ci.phase = "missed"; changed = true; lastMissBuzz = n;
      vibrate([300, 80, 300]);
      sentinelNotify('missed');
    } else if (ci.phase === "missed" && n - lastMissBuzz > 30000) {
      lastMissBuzz = n; vibrate([200, 60, 200]);
    }
    if (state.post.dueAt && n >= state.post.dueAt && safetyDlg && safetyDlg.open) renderPost();
    guideTick();
    if (changed) save();
    if (safetyDlg && safetyDlg.open && (ci.phase === "running" || ci.phase === "due" || ci.phase === "missed")) renderCheckin();
  }, 500);

  function renderAll() {
    renderSignals(); renderContacts(); hydratePre(); renderCheckin(); renderPost(); renderNotifHint(); renderJournal(); renderGuide();
    gwPopulateChkTargets();
    bleMaybeReconnect();
  }
  window.__sxSentinelRenderAll = renderAll;

  // Link Play Guide playback between Scene Setter and Scene Sentinel
  window.__sxQueueAndPlayGuide = function (text, autoStart) {
    if (text) {
      if (gwGuideInput) gwGuideInput.value = text;
      var parsed = parsePlayGuide(text);
      if (!parsed.steps.length) return false;
      state.guide.text = text;
      state.guide.steps = parsed.steps;
      state.guide.pulseMin = gwGuidePulseSel ? (+gwGuidePulseSel.value || 5) : 5;
      if (parsed.pulseMin) {
        var opts = [1, 2, 5, 10, 15], snap = opts[0];
        opts.forEach(function (o) { if (Math.abs(o - parsed.pulseMin) < Math.abs(snap - parsed.pulseMin)) snap = o; });
        state.guide.pulseMin = snap;
        if (gwGuidePulseSel) gwGuidePulseSel.value = String(snap);
      }
      state.guide.queuedAt = nowMs();
      save();
      renderGuide();
    }
    if (autoStart) {
      if (guidePlay.paused) {
        guidePlay.pausedAccum += nowMs() - guidePlay.pausedAt;
        guidePlay.paused = false;
        guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
      } else if (!guidePlay.on && state.guide.steps.length) {
        guidePlay.on = true; guidePlay.startedAt = nowMs(); guidePlay.pausedAccum = 0; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
        guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
        guideFirePulse("scene start");
      }
      renderGuidePlayback();
    }
    return true;
  };

  window.__sxGetGuidePlayState = function () {
    var curActivity = guideCurrentSched();
    return {
      on: guidePlay.on,
      paused: guidePlay.paused,
      stepIdx: guidePlay.stepIdx,
      steps: state.guide.steps,
      currentActivity: curActivity,
      pulses: guidePlay.pulses,
      elapsedSec: guideElapsedSec(),
      queuedText: state.guide.text || ""
    };
  };

  window.__sxToggleGuidePlay = function () {
    if (guidePlay.on && !guidePlay.paused) {
      if (gwPauseBtn) gwPauseBtn.click();
    } else {
      if (gwPlayBtn) gwPlayBtn.click();
    }
    return guidePlay.on && !guidePlay.paused;
  };

  load();
  hydratePre();
  renderSignals();
  renderContacts();
  renderCheckin();
  renderPost();
  renderJournal();
  renderGuide();
  }
  boot();
})();
});
