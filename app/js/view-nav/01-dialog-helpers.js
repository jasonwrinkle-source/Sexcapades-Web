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
