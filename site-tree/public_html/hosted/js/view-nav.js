
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
   Trigger: pointer hold (~600ms) on the header bar, touch or mouse.
   It never fires on a normal tap/click, never on a press that starts on
   an interactive control (buttons, links, inputs — every header control
   keeps working), and the hold timer clears on any real movement or
   scroll so it cannot break scrolling. No visible button, hint, or icon.
   The click that ends the long-press is swallowed (capture phase), so
   the menu opening under the pointer can never instantly select an item
   or close itself. Menu closes on item select, outside tap, or Escape. */
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
  function openMenu(x, y) {
    positionMenu(x, y);
    /* Swallow the click that ends this very press: it lands on the menu
       (or outside it) a beat after pointerup, and must neither select
       an item nor close the menu. The flag clears on a zero-delay timer
       scheduled from pointerup, which runs after the click event. */
    swallowClick = true;
    var clearOnce = function () { setTimeout(function () { swallowClick = false; }, 0); };
    document.addEventListener("pointerup", clearOnce, { once: true });
    document.addEventListener("pointercancel", clearOnce, { once: true });
    var activeSkin = window.FlexcapadesSkins ? window.FlexcapadesSkins.active() : "sexcapades";
    var cur = menu.querySelector('[data-skin="' + activeSkin + '"]') || menu.querySelector('[data-skin="sexcapades"]');
    if (cur) { try { cur.focus({ preventScroll: true }); } catch (e) { cur.focus(); } }
  }
  function closeMenu() {
    if (!menuOpen()) return;
    menu.hidden = true;
  }
  function skinName(item) {
    var n = item.querySelector(".skin-name");
    return n ? n.textContent.trim() : (item.getAttribute("data-skin") || "That skin");
  }
  function markCurrent(skin) {
    menu.querySelectorAll("[data-skin]").forEach(function (it) {
      it.setAttribute("aria-checked", it.getAttribute("data-skin") === skin ? "true" : "false");
    });
  }
  function choose(item) {
    if (!item) return;
    var skin = item.getAttribute("data-skin");
    closeMenu();
    var loader = window.FlexcapadesSkins;
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
    if (isInteractive(ev.target)) return;
    if (ev.button !== undefined && ev.button !== 0) return;
    holdPointerId = ev.pointerId;
    holdX = ev.clientX; holdY = ev.clientY;
    holdFired = false;
    holdTimer = setTimeout(function () {
      holdTimer = null;
      holdFired = true;
      openMenu(holdX, holdY);
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
    if (label && label.title !== path) label.title = path;
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
