(function(){
  // Cross-tab live sync receiver (Build 2026-10-19_1742)
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

// Clear-selection chip wiring
(function () {
  function boot() {
    var btn = document.getElementById("mapClearSelection");
    var svg = document.getElementById("mapSvg");
    if (!btn || !svg) return;
    function hasSelection() {
      return Boolean(svg.querySelector(".selected-spoke") || svg.querySelector(".node-group.is-preview") || svg.querySelector(".node-group.is-dim") || svg.classList.contains("relation-focused"));
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
  window.addEventListener("pageshow", function (ev) {
    var input = document.getElementById("searchInput");
    var picker = document.getElementById("topicPicker");
    var term = "";
    try { term = window.SexcapadesEngine && SexcapadesEngine.State && SexcapadesEngine.State.getSearchTerm() || ""; } catch (e) {}
    if (ev.persisted && window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.clearSelection) {
      window.__SEXCAPADES_LAYOUT_UI.clearSelection();
      return;
    }
    if (!term) {
      if (input && input.value) input.value = "";
      if (picker && picker.value) picker.value = "";
    }
  });
})();

// Triple-tap the center node opens the Layout Editor
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
