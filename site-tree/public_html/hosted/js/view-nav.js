
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
    openDialog(safetyDlg);
    if (window.__sxSentinelNotifInit) window.__sxSentinelNotifInit();
    if (window.__sxSentinelRenderAll) window.__sxSentinelRenderAll();
    syncBtn();
  }
  window.__sxOpenSentinel = goSafety;
  /* Pull-down doors for Scribe and Scene Setter REMOVED (owner ruling,
     2026-10-27): the pull-down needs no multi-select context, so it
     cannot be a valid doorway into either — the Scribe button and the
     Scene Setter button are the only doorways. Leaving either view
     still works from this menu (map / list / safety entries remain),
     as do Escape and backdrop clicks. */

  /* -------- View navigation dropdown (pull-down menu, not a modal) -------- */
  function menuItems() {
    return menu ? Array.prototype.slice.call(menu.querySelectorAll("[data-view-target]")) : [];
  }
  function itemEnabled(it) { return !it.classList.contains("is-disabled"); }
  function refreshMenu() {
    /* Shell-ui sweep (2026-10-27): the menu carries only map / list /
       safety items. The former scribe / setter entries are gone, and
       with them their disable-when-the-toolbar-button-is-hidden
       branches and hint text — that dead routing is removed, so no
       item in this menu is ever disabled; refresh only syncs the
       current-view check mark and clears any stale disabled state. */
    var cur = currentView();
    menuItems().forEach(function (it) {
      var v = it.getAttribute("data-view-target");
      it.setAttribute("aria-checked", v === cur ? "true" : "false");
      it.classList.remove("is-disabled");
      it.removeAttribute("aria-disabled");
      it.removeAttribute("title");
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
    else if (v === "safety") goSafety();
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
