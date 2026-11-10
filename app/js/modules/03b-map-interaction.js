/* ---- module: map-interaction (folded from patches.js) ---- */

/* ---- drag-vs-tap disambiguation ---- */
__sxInit(function () {
// A pointerup >10px from its pointerdown suppresses the subsequent click,
// so panning across the center hub no longer pops the rating dialog.
(function() {
  var downX = 0, downY = 0, downT = 0, suppress = false;
  document.addEventListener('pointerdown', function(e) {
    downX = e.clientX; downY = e.clientY; downT = Date.now(); suppress = false;
  }, true);
  document.addEventListener('pointerup', function(e) {
    var dx = e.clientX - downX, dy = e.clientY - downY;
    suppress = (dx * dx + dy * dy) > 100; /* 10px squared */
  }, true);
  document.addEventListener('click', function(e) {
    if (suppress) { e.stopPropagation(); e.preventDefault(); suppress = false; }
  }, true);
})();
});


/* ---- map-touch-selection-guard ---- */
__sxInit(function () {
// Pixel touch lockup guard: refuse selection / drag / context-menu takeovers
// that start on the SVG map and clear any selection that already exists.
(function() {
  function inMap(e) {
    var t = e && e.target;
    return !!(t && t.closest && t.closest("#mapSvg"));
  }
  function clearSelection() {
    try {
      var s = window.getSelection && window.getSelection();
      if (s && !s.isCollapsed) s.removeAllRanges();
    } catch (err) { if (typeof __sxErrLog === "function") __sxErrLog("map-selection-clear", err); }
  }
  document.addEventListener("selectstart", function(e) { if (inMap(e)) e.preventDefault(); }, true);
  document.addEventListener("dragstart", function(e) { if (inMap(e)) e.preventDefault(); }, true);
  document.addEventListener("contextmenu", function(e) { if (inMap(e)) e.preventDefault(); }, true);
  document.addEventListener("pointerdown", function(e) { if (inMap(e)) clearSelection(); }, true);
  document.addEventListener("touchstart", function(e) { if (inMap(e)) clearSelection(); }, { capture: true, passive: true });
})();
});


/* ---- map-selection-dim ---- */
__sxInit(function () {
// Branch selection dimming: when a branch is selected (.selected-spoke),
// dim everything else so the selection stands out.
(function() {
  var svg = document.getElementById("mapSvg");
  if (!svg) return;
  var queued = false;
  function syncSelectionDim() {
    var spokes = svg.querySelectorAll(".selected-spoke"), i;
    if (!spokes.length) {
      svg.classList.remove("has-selection");
      var stale = svg.querySelectorAll(".sel-keep");
      for (i = 0; i < stale.length; i++) stale[i].classList.remove("sel-keep");
      return;
    }
    svg.classList.add("has-selection");
    var keep = [];
    for (i = 0; i < spokes.length; i++) {
      var g = spokes[i].closest ? spokes[i].closest(".node-group") : null;
      if (!g) continue;
      if (keep.indexOf(g) === -1) keep.push(g);
      var key = g.getAttribute("data-layout-key");
      if (key) {
        var u = svg.querySelector('.spoke-underlay-item[data-spoke-for="' + key + '"]');
        if (u && keep.indexOf(u) === -1) keep.push(u);
      }
    }
    var marked = svg.querySelectorAll(".sel-keep");
    for (i = 0; i < marked.length; i++) {
      if (keep.indexOf(marked[i]) === -1) marked[i].classList.remove("sel-keep");
    }
    for (i = 0; i < keep.length; i++) keep[i].classList.add("sel-keep");
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function() { queued = false; syncSelectionDim(); });
  }
  new MutationObserver(schedule).observe(svg, { childList: true, subtree: true });
  syncSelectionDim();
})();
});


/* ---- map detail toggle ---- */
__sxInit(function () {
(function() {
  function init() {
    var control = document.querySelector(".detail-control");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-detail-level]"));
    if (control && buttons.length) {
      var close = function() { control.classList.remove("is-open"); };
      buttons.forEach(function(btn) {
        btn.addEventListener("click", function() {
          if (!control.classList.contains("is-open") && btn.getAttribute("aria-pressed") === "true") {
            control.classList.add("is-open");
            return;
          }
          buttons.forEach(function(b) { b.setAttribute("aria-pressed", String(b === btn)); });
          if (typeof window.__SEXCAPADES_SET_MAP_DETAIL === "function") {
            window.__SEXCAPADES_SET_MAP_DETAIL(btn.getAttribute("data-detail-level"));
          }
          close();
        });
      });
      document.addEventListener("pointerdown", function(e) { if (!control.contains(e.target)) close(); });
      document.addEventListener("keydown", function(e) { if (e.key === "Escape") close(); });
    }
  }
  init();
})();
});


/* ---- relations overlay & routing ---- */
__sxInit(function () {
(function() {
  "use strict";
  var svg = document.getElementById("mapSvg");
  if (!svg) return;
  var ARC_R_BASE = 1356.91;
  function sxRaf(fn) {
    var tm = window.SexcapadesRuntime && SexcapadesRuntime.TimerManager;
    if (tm && typeof tm.requestAnimationFrame === "function") return tm.requestAnimationFrame(fn);
    return window.requestAnimationFrame(fn);
  }
  function anchorLinks() {
    var layer = svg.querySelector(".common-overlap-layer");
    if (!layer) return;
    var scale = (typeof window.__sxLayoutCenterRingScale === "number" && window.__sxLayoutCenterRingScale > 0) ? window.__sxLayoutCenterRingScale : 1;
    var arcR = ARC_R_BASE * scale;
    var hits = layer.querySelectorAll(".relation-hit");
    for (var i = 0; i < hits.length; i++) {
      var hit = hits[i];
      var fromKey = hit.getAttribute("data-from"), toKey = hit.getAttribute("data-to");
      if (!fromKey || !toKey) continue;
      var fromG = svg.querySelector('.node-group[data-layout-key="' + fromKey + '"]');
      var toG = svg.querySelector('.node-group[data-layout-key="' + toKey + '"]');
      if (!fromG || !toG) continue;
      var fx = Number(fromG.getAttribute("data-label-x") || fromG.getAttribute("data-anchor-x"));
      var fy = Number(fromG.getAttribute("data-label-y") || fromG.getAttribute("data-anchor-y"));
      var tx = Number(toG.getAttribute("data-label-x") || toG.getAttribute("data-anchor-x"));
      var ty = Number(toG.getAttribute("data-label-y") || toG.getAttribute("data-anchor-y"));
      if (!isFinite(fx) || !isFinite(fy) || !isFinite(tx) || !isFinite(ty)) continue;
      var d = Math.sqrt((tx - fx) * (tx - fx) + (ty - fy) * (ty - fy));
      if (d <= 0) continue;
      var rNear = Math.min(Math.sqrt(fx * fx + fy * fy), Math.sqrt(tx * tx + ty * ty));
      var rArc = Math.max(arcR, rNear * 0.55);
      var mx = (fx + tx) / 2, my = (fy + ty) / 2;
      var mLen = Math.sqrt(mx * mx + my * my);
      if (mLen > 0) { mx = (mx / mLen) * rArc; my = (my / mLen) * rArc; }
      var pathD = "M" + fx.toFixed(2) + "," + fy.toFixed(2) + " Q" + mx.toFixed(2) + "," + my.toFixed(2) + " " + tx.toFixed(2) + "," + ty.toFixed(2);
      hit.setAttribute("d", pathD);
      var visiblePath = hit.previousElementSibling;
      if (visiblePath && visiblePath.classList.contains("relation-line")) visiblePath.setAttribute("d", pathD);
    }
  }
  function clearFocus() {
    svg.classList.remove("relation-focused");
    var marked = svg.querySelectorAll(".relation-focus-keep");
    for (var i = 0; i < marked.length; i++) marked[i].classList.remove("relation-focus-keep");
  }
  function applyFocus(hit) {
    if (!hit) return;
    clearFocus();
    svg.classList.add("relation-focused");
    var fromKey = hit.getAttribute("data-from"), toKey = hit.getAttribute("data-to");
    [fromKey, toKey].forEach(function(k) {
      if (!k) return;
      var g = svg.querySelector('.node-group[data-layout-key="' + k + '"]');
      if (g) {
        g.classList.add("relation-focus-keep");
        var branch = g.closest(".branch-group") || g;
        branch.classList.add("relation-focus-keep");
        var underlays = svg.querySelectorAll('.spoke-underlay-item[data-spoke-for="' + k + '"]');
        for (var j = 0; j < underlays.length; j++) underlays[j].classList.add("relation-focus-keep");
      }
    });
    hit.classList.add("relation-focus-keep");
    if (hit.previousElementSibling) hit.previousElementSibling.classList.add("relation-focus-keep");
  }
  function init() {
    anchorLinks();
    new MutationObserver(function() { sxRaf(anchorLinks); }).observe(svg, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-layout-key"] });
    document.addEventListener("click", function(ev) {
      var hit = ev.target && ev.target.closest ? ev.target.closest(".relation-hit") : null;
      if (hit) { sxRaf(function() { sxRaf(function() { applyFocus(hit); }); }); return; }
      if (svg.classList.contains("relation-focused")) {
        var t = ev.target;
        if (t === svg || (t.closest && !t.closest(".node-group") && !t.closest(".direction-control") && !t.closest(".common-overlap-layer"))) clearFocus();
      }
    }, true);
    document.addEventListener("keydown", function(ev) {
      if (ev.key === "Escape") { clearFocus(); return; }
      if ((ev.key === "Enter" || ev.key === " ") && ev.target && ev.target.closest && ev.target.closest(".relation-hit")) {
        var h = ev.target.closest(".relation-hit");
        sxRaf(function() { sxRaf(function() { applyFocus(h); }); });
      }
    }, true);
  }
  init();
})();
});
