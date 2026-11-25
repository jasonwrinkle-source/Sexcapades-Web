
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
  var VIEW_IDS = {
    outlineDialog: "list",
    safetyDialog: "safety",
    negotiationDialog: "setter",
    scribeChoiceDialog: "scribe",
    scribeDialog: "scribe"
  };
  function isViewEl(d) {
    return !!(d && d.id && VIEW_IDS[d.id]);
  }
  function ensureViewOpenProp(d) {
    if (!d || d.__sxViewOpenWired) return;
    if (typeof HTMLDialogElement !== "undefined" && d instanceof HTMLDialogElement) return;
    d.__sxViewOpenWired = true;
    try {
      Object.defineProperty(d, "open", {
        configurable: true,
        enumerable: true,
        get: function () { return d.hasAttribute("open") && !d.hidden; },
        set: function (v) { if (v) openDialog(d); else closeDialog(d); }
      });
    } catch (e) {}
  }
  function syncActiveViewAttr() {
    var active = "map";
    var order = ["negotiationDialog", "scribeChoiceDialog", "scribeDialog", "safetyDialog", "outlineDialog"];
    for (var i = 0; i < order.length; i++) {
      var el = document.getElementById(order[i]);
      if (el) {
        ensureViewOpenProp(el);
        if (el.hasAttribute("open") && !el.hidden) {
          active = VIEW_IDS[order[i]];
          break;
        }
      }
    }
    if (document.body) {
      if (active === "map") {
        delete document.body.dataset.sxView;
      } else {
        document.body.dataset.sxView = active;
      }
    }
  }
  function openDialog(d) {
    if (!d) return;
    if (isViewEl(d)) {
      ensureViewOpenProp(d);
      if (d.hasAttribute("open") && !d.hidden) { syncActiveViewAttr(); return; }
      d.hidden = false;
      d.setAttribute("open", "");
      d.classList.add("fallback-open");
      syncActiveViewAttr();
      if (typeof window.__sxSyncViewButton === "function") window.__sxSyncViewButton();
      return;
    }
    if (d.open) return;
    try { if (typeof d.showModal === "function") d.showModal(); else { d.setAttribute("open", ""); d.classList.add("fallback-open"); } }
    catch (e) { d.setAttribute("open", ""); d.classList.add("fallback-open"); }
  }
  function closeDialog(d) {
    if (!d) return;
    if (isViewEl(d)) {
      ensureViewOpenProp(d);
      d.removeAttribute("open");
      d.hidden = true;
      d.classList.remove("fallback-open");
      syncActiveViewAttr();
      if (typeof window.__sxSyncViewButton === "function") window.__sxSyncViewButton();
      return;
    }
    try { if (typeof d.close === "function" && d.open) d.close(); else d.removeAttribute("open"); }
    catch (e) { d.removeAttribute("open"); }
    d.classList.remove("fallback-open");
  }
  function getDialog(id) {
    var el = id ? document.getElementById(id) : null;
    if (el && isViewEl(el)) ensureViewOpenProp(el);
    return el;
  }
  function dialogIds() { return Array.prototype.map.call(document.querySelectorAll("dialog[id], .sx-app-view[id]"), function (d) { return d.id; }).sort(); }
  function openDialogById(id) { openDialog(getDialog(id)); }
  function closeDialogById(id) { closeDialog(getDialog(id)); }
  return { open: openDialog, close: closeDialog, get: getDialog, ids: dialogIds, openById: openDialogById, closeById: closeDialogById, isView: isViewEl, syncView: syncActiveViewAttr };
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
  var listDlg = window.__sxDialog.get("outlineDialog");
  var safetyDlg = window.__sxDialog.get("safetyDialog");
  var scribeDlg = window.__sxDialog.get("scribeDialog");
  var scribeChoiceDlg = window.__sxDialog.get("scribeChoiceDialog");
  var setterDlg = window.__sxDialog.get("negotiationDialog");
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
    if (menu.parentNode !== document.body) document.body.appendChild(menu);
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
      try { btn.focus({ preventScroll: true }); } catch (e) { __sxErrLog("focus", e); }
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
/* The skin picker opens from the brand title: a single click on the
   *capades name drops the menu down (double click opens About instead),
   so the Flexcapades engine can be tried on without a subdomain or a
   new domain. All skins load for real via window.FlexcapadesSkins
   (app/js/skin-loader.js) — picking a skin swaps its taxonomy in and
   re-renders the map; picking Sexcapades restores the kink map.
   Shift+Click is GONE too (2026-11-24, Jason's word): no hidden
   trigger opens the picker — tap opens it, double-tap opens About.
   Triple-click is GONE:
   counting taps fought the title's own About button and is removed
   entirely — no tap counting anywhere in this module. The long-press
   hold is GONE too (2026-11-24, Jason's word): the picker already
   opens on a tap, so there is no need for a hold to summon it. No
   visible button, hint, or icon for the picker beyond the title
   itself. Menu closes on item select, outside tap, or Escape. */
__sxInit(function () {
(function () {
  function boot() {
  var header = document.querySelector("header.intro");
  var menu = document.getElementById("skinMenu");
  var note = document.getElementById("skinNote");
  if (!header || !menu) return;

  var noteTimer = null;

  function menuOpen() { return !menu.hidden; }

  function showNote(text) {
    if (!note) return;
    if (note.parentNode !== document.body) document.body.appendChild(note);
    note.textContent = text;
    note.hidden = false;
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(function () {
      note.hidden = true;
      noteTimer = null;
    }, 5000);
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
  function openMenu(x, y, targetEl) {
    if (menu.parentNode !== document.body) document.body.appendChild(menu);

    var activeSkin = window.FlexcapadesSkins ? window.FlexcapadesSkins.active() : "sexcapades";
    if (typeof window.__SX_RENDER_SKIN_MENU === "function") {
      window.__SX_RENDER_SKIN_MENU(menu, activeSkin);
    }

    if (targetEl && isBrandTitle(targetEl) && targetEl.getBoundingClientRect) {
      var r = targetEl.getBoundingClientRect();
      x = r.left;
      y = r.bottom;
    }

    positionMenu(x, y);
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
    openMenu(Math.round(r.left + r.width / 2), Math.round(r.bottom));
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
  /* Skin id -> subdomain prefix: delegated to window.__SX_SKIN_SUBDOMAIN single source. */
  var SKIN_SUBDOMAIN = (typeof window !== "undefined" && window.__SX_SKIN_SUBDOMAIN) || { sexcapades: "sex", poliscapades: "polis", forescapades: "fores", philoscapades: "philo", aesthcapades: "aesth", vocapades: "voca", techcapades: "tech", dharmacapades: "dharma", theori: "theoricapades", praxi: "praxicapades", quantacapades: "quanta", expericapades: "experi", simulcapades: "simul", mattercapades: "matter", chemcapades: "chem", nouscapades: "nous", biocapades: "bio", linguacapades: "lingua", fastcapades: "fast", metacapades: "meta", dancecapades: "dance", questcapades: "quest" };
  function choose(item) {
    if (!item) return;
    var skin = item.getAttribute("data-skin");
    closeMenu();

    var host = "";
    try { host = String(location.hostname || "").toLowerCase(); } catch (e) { host = ""; }
    var isProductionDomain = /\.capades\.io$/.test(host) || host === "sexcapades.io" || host === "www.sexcapades.io";

    if (isProductionDomain) {
      /* Production deployment: navigate cleanly to the dedicated subdomain URL */
      var prefix = (typeof window !== "undefined" && typeof window.__SX_SKIN_PREFIX_FOR === "function")
        ? window.__SX_SKIN_PREFIX_FOR(skin)
        : (SKIN_SUBDOMAIN[skin] || "sex");
      var targetHost = prefix + ".capades.io";
      if (host !== targetHost) {
        var pagePath = window.location.pathname || "/hosted/app.html";
        window.location.href = "https://" + targetHost + pagePath + (window.location.hash || "");
        return;
      }
    }

    /* Local dev, localhost, file://, staging, or QA: use in-place runtime skin loading */
    var loader = window.FlexcapadesSkins;
    if (loader && typeof loader.load === "function") {
      loader.load(skin, skinName(item)).then(function () {
        markCurrent(skin);
        var n = window.__SX_SKIN_TOPIC_COUNT || 0;
        var cats = 0;
        try { cats = window.TaxonomyLoader.loadTaxonomy().categories.length; } catch (e) { cats = 0; }
        showNote(skinName(item) + " loaded — " + n + " topics across " + cats + " categories.");
        try {
          var u = new URL(window.location.href);
          u.searchParams.set("skin", skin);
          window.history.replaceState(null, "", u.pathname + u.search + u.hash);
        } catch (_) {}
      }, function (err) {
        showNote("Couldn't load " + skinName(item) + ": " + (err && err.message || err));
      });
      return;
    }
    try {
      var u = new URL(window.location.href);
      u.searchParams.set("skin", skin);
      window.location.href = u.pathname + u.search + u.hash;
    } catch (_) {
      window.location.href = "?skin=" + encodeURIComponent(skin);
    }
  }
  menu.addEventListener("click", function (ev) {
    var it = ev.target && ev.target.closest ? ev.target.closest("[data-skin]") : null;
    if (it && menu.contains(it)) choose(it);
  });

  function isBrandTitle(el) {
    return !!(el && el.closest && el.closest("#openAppAbout, .app-title-button, [data-open-about], .sx-brand"));
  }

  var brandClickTimer = null;
  var BRAND_DBLCLICK_DELAY = 220;

  function triggerAppAbout() {
    var dlg = document.getElementById("appAboutDialog");
    if (!dlg) return;
    if (window.__sxDialog && window.__sxDialog.open) {
      window.__sxDialog.open(dlg);
    } else if (typeof dlg.showModal === "function") {
      if (!dlg.open) dlg.showModal();
    } else {
      dlg.setAttribute("open", "");
      dlg.classList.add("fallback-open");
    }
    var closeBtn = document.getElementById("closeAppAbout");
    if (closeBtn) requestAnimationFrame(function () { closeBtn.focus(); });
  }

  /* Brand title click swap (2026-11-22):
     Single click on *capades brand title drops down / toggles the skin picker menu.
     Double click on *capades brand title opens the About dialog.
     Captured on document so normal click listeners on #openAppAbout / [data-open-about]
     do not immediately open the About dialog on single click. */
  document.addEventListener("click", function (ev) {
    if (ev.shiftKey) return;
    var t = ev.target;
    var hit = t && isBrandTitle(t) ? t.closest("#openAppAbout, .app-title-button, [data-open-about], .sx-brand") : null;
    if (!hit) return;

    ev.stopImmediatePropagation();
    ev.preventDefault();

    if (ev.detail >= 2) {
      if (brandClickTimer) {
        clearTimeout(brandClickTimer);
        brandClickTimer = null;
      }
      if (menuOpen()) closeMenu();
      triggerAppAbout();
      return;
    }

    if (brandClickTimer) clearTimeout(brandClickTimer);
    var clickX = ev.clientX, clickY = ev.clientY;
    var targetEl = hit;
    brandClickTimer = setTimeout(function () {
      brandClickTimer = null;
      if (menuOpen()) {
        closeMenu();
      } else {
        openMenu(clickX, clickY, targetEl);
      }
    }, BRAND_DBLCLICK_DELAY);
  }, true);

  document.addEventListener("dblclick", function (ev) {
    var t = ev.target;
    var hit = t && isBrandTitle(t) ? t.closest("#openAppAbout, .app-title-button, [data-open-about], .sx-brand") : null;
    if (!hit) return;
    ev.stopImmediatePropagation();
    ev.preventDefault();
    if (brandClickTimer) {
      clearTimeout(brandClickTimer);
      brandClickTimer = null;
    }
    if (menuOpen()) closeMenu();
    triggerAppAbout();
  }, true);

  document.addEventListener("contextmenu", function (ev) {
    /* A touch long-press raises contextmenu while the menu is open —
       suppress the browser's own callout so the skin menu owns the
       gesture. Never suppressed when the skin menu is closed. */
    if (menuOpen()) ev.preventDefault();
  });
  window.addEventListener("scroll", function () { if (menuOpen()) closeMenu(); }, true);
  document.addEventListener("click", function (ev) {
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

/* ---- module: app-docs-dropdown ----
   App banner "?" review callout toggles a skin-aware documentation menu.
   Includes submenu flyouts for Glossary and FAQ, skin-aware link routing,
   and hiding Compare on skins that don't support it. */
__sxInit(function () {
(function () {
  function boot() {
    var trigger = document.getElementById("reviewLink");
    var docsMenu = document.getElementById("appDocsMenu");
    if (!trigger || !docsMenu) return;

    var glossaryTrigger = document.getElementById("appDocsGlossaryTrigger");
    var glossaryFlyout = document.getElementById("appDocsGlossaryFlyout");
    var faqTrigger = document.getElementById("appDocsFaqTrigger");
    var faqFlyout = document.getElementById("appDocsFaqFlyout");
    var compareItem = document.getElementById("appCompareLinkItem");
    var openFlyoutEl = null;
    var openFlyoutTrigger = null;

    function detectActiveSkin() {
      if (window.__SX_ACTIVE_SKIN) return window.__SX_ACTIVE_SKIN;
      var host = "";
      try { host = window.location.hostname.toLowerCase(); } catch (e) { host = ""; }
      if (host.indexOf("polis") !== -1) return "poliscapades";
      if (host.indexOf("fores") !== -1) return "forescapades";
      var q = "";
      try { q = new URLSearchParams(window.location.search || "").get("skin"); } catch (e) { q = ""; }
      if (q) return q;
      return "sexcapades";
    }

    function updateSkinLinks(skinId) {
      var id = String(skinId || detectActiveSkin()).toLowerCase();
      var isPolis = id.indexOf("polis") !== -1;
      var isSex = id.indexOf("sex") !== -1;
      if (compareItem) {
        if (!isSex && !isPolis) {
          compareItem.style.display = "none";
        } else {
          compareItem.style.display = "";
          if (isPolis) compareItem.setAttribute("href", "/compare");
          else compareItem.setAttribute("href", "/hosted/compare.html");
        }
      }
      try {
        var sp = new URLSearchParams(window.location.search || "").get("skin");
        if (sp) {
          var links = docsMenu.querySelectorAll("a[href^='/hosted/'], a[href^='/']");
          links.forEach(function (a) {
            var href = a.getAttribute("href");
            if (href && href.indexOf("skin=") === -1) {
              var joiner = href.indexOf("?") === -1 ? "?" : "&";
              a.setAttribute("href", href + joiner + "skin=" + encodeURIComponent(sp));
            }
          });
          if (glossaryFlyout) {
            glossaryFlyout.querySelectorAll("a").forEach(function (a) {
              var href = a.getAttribute("href");
              if (href && href.indexOf("skin=") === -1) {
                var hashIdx = href.indexOf("#");
                var base = hashIdx === -1 ? href : href.slice(0, hashIdx);
                var frag = hashIdx === -1 ? "" : href.slice(hashIdx);
                var joiner = base.indexOf("?") === -1 ? "?" : "&";
                a.setAttribute("href", base + joiner + "skin=" + encodeURIComponent(sp) + frag);
              }
            });
          }
          if (faqFlyout) {
            faqFlyout.querySelectorAll("a").forEach(function (a) {
              var href = a.getAttribute("href");
              if (href && href.indexOf("skin=") === -1) {
                var hashIdx = href.indexOf("#");
                var base = hashIdx === -1 ? href : href.slice(0, hashIdx);
                var frag = hashIdx === -1 ? "" : href.slice(hashIdx);
                var joiner = base.indexOf("?") === -1 ? "?" : "&";
                a.setAttribute("href", base + joiner + "skin=" + encodeURIComponent(sp) + frag);
              }
            });
          }
        }
      } catch (e) {}
    }

    if (window.__SX_WHEN_SKIN_READY) {
      window.__SX_WHEN_SKIN_READY(updateSkinLinks);
    } else {
      updateSkinLinks();
    }

    function positionDocsMenu() {
      var r = trigger.getBoundingClientRect();
      docsMenu.style.visibility = "hidden";
      docsMenu.hidden = false;
      var mw = docsMenu.offsetWidth;
      var mh = docsMenu.offsetHeight;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var left = r.right - mw;
      if (left < 8) left = 8;
      if (left + mw > vw - 8) left = Math.max(8, vw - mw - 8);
      var top = r.bottom + 6;
      if (top + mh > vh - 8) top = Math.max(8, r.top - mh - 6);
      docsMenu.style.left = left + "px";
      docsMenu.style.top = top + "px";
      docsMenu.style.visibility = "";
    }

    function positionFlyout(trig, flyout) {
      var row = trig.getBoundingClientRect();
      var menu = docsMenu.getBoundingClientRect();
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      flyout.style.visibility = "hidden";
      flyout.hidden = false;
      var fw = flyout.offsetWidth;
      var fh = flyout.offsetHeight;
      var left = menu.left - fw - 4;
      if (left < 8) left = menu.right + 4;
      if (left + fw > vw - 8 && left < 8) {
        left = Math.max(8, (vw - fw) / 2);
      }
      var top = row.top;
      if (top + fh > vh - 8) top = Math.max(8, vh - fh - 8);
      flyout.style.left = left + "px";
      flyout.style.top = top + "px";
      flyout.style.visibility = "";
    }

    function closeFlyout(refocus) {
      if (!openFlyoutEl) return;
      var trig = openFlyoutTrigger;
      openFlyoutEl.hidden = true;
      if (trig) trig.setAttribute("aria-expanded", "false");
      openFlyoutEl = null;
      openFlyoutTrigger = null;
      if (refocus && trig) trig.focus();
    }

    function openFlyout(trig, flyout) {
      if (openFlyoutEl === flyout) { closeFlyout(false); return; }
      closeFlyout(false);
      flyout.hidden = false;
      trig.setAttribute("aria-expanded", "true");
      openFlyoutEl = flyout;
      openFlyoutTrigger = trig;
      positionFlyout(trig, flyout);
      var first = flyout.querySelector("a, button");
      if (first) first.focus();
    }

    function wireSubmenu(trig, flyout) {
      if (!trig || !flyout) return;
      trig.addEventListener("click", function (ev) {
        ev.stopPropagation();
        openFlyout(trig, flyout);
      });
      trig.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
          ev.preventDefault();
          openFlyout(trig, flyout);
        }
      });
      flyout.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" || ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
          ev.preventDefault();
          ev.stopPropagation();
          closeFlyout(true);
        }
      });
    }

    wireSubmenu(glossaryTrigger, glossaryFlyout);
    wireSubmenu(faqTrigger, faqFlyout);

    function closeDocsMenu(refocus) {
      closeFlyout(false);
      docsMenu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (refocus) { try { trigger.focus(); } catch (e) {} }
    }

    function openDocsMenu() {
      updateSkinLinks();
      docsMenu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      positionDocsMenu();
      var first = docsMenu.querySelector("a, button");
      if (first) first.focus();
    }

    trigger.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (docsMenu.hidden) openDocsMenu();
      else closeDocsMenu();
    });

    trigger.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        if (docsMenu.hidden) openDocsMenu();
      }
    });

    document.addEventListener("click", function (ev) {
      if (docsMenu.hidden) return;
      var t = ev.target;
      if (t && (trigger.contains(t) || docsMenu.contains(t) || (openFlyoutEl && openFlyoutEl.contains(t)))) return;
      closeDocsMenu();
    }, true);

    document.addEventListener("keydown", function (ev) {
      if (docsMenu.hidden) return;
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeDocsMenu(true);
      }
    }, true);

    window.addEventListener("resize", function () {
      if (!docsMenu.hidden) closeDocsMenu();
    });
    window.addEventListener("scroll", function () {
      if (!docsMenu.hidden) closeDocsMenu();
    }, true);
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
