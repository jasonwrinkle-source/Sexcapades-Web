/* ---- module: ui-wiring (folded from patches.js) ---- */

/* ---- take-test & source tooltip wiring ---- */
__sxInit(function () {
// Build 2026-10-17_0449 — Take-test / source wiring: (1) hover/focus tooltips
// for every [data-source-name] control (the relabeled Take KinkTest /
// Import BDSM test / Take Yes-No/Maybe / Import FetLife fetishes buttons and
// the take-test dropdown items) showing a clickable link to the source
// site; (2) open/close behavior for the profile dialog's take-test
// dropdown, whose items launch their flows through the existing
// [data-profile-details-converter] handlers.
(function () {
  var tip = SexcapadesRuntime.DOM.byId("sourceTip");
  var tipName = SexcapadesRuntime.DOM.byId("sourceTipName");
  var tipNote = SexcapadesRuntime.DOM.byId("sourceTipNote");
  var tipLink = SexcapadesRuntime.DOM.byId("sourceTipLink");
  var anchor = null, hideTimer = 0;
  function cancelHide() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; } }
  function hideTip() { cancelHide(); anchor = null; if (tip) tip.hidden = true; }
  function scheduleHide() { cancelHide(); hideTimer = setTimeout(hideTip, 300); }
  function showTip(el) {
    if (!tip || !el) return;
    cancelHide();
    anchor = el;
    tipName.textContent = el.getAttribute("data-source-name") || "";
    tipNote.textContent = el.getAttribute("data-source-note") || "";
    var url = el.getAttribute("data-source-url") || "";
    if (url) {
      tipLink.hidden = false;
      tipLink.href = url;
      tipLink.textContent = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    } else {
      tipLink.hidden = true;
      tipLink.removeAttribute("href");
      tipLink.textContent = "";
    }
    var host = el.closest("dialog") || document.body;
    if (tip.parentNode !== host) host.appendChild(tip);
    tip.hidden = false;
    var r = el.getBoundingClientRect();
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = r.right + 12;
    if (left + tw > window.innerWidth - 8) left = Math.max(8, r.left - tw - 12);
    var top = r.top + (r.height - th) / 2;
    top = Math.max(8, Math.min(window.innerHeight - th - 8, top));
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  document.addEventListener("mouseover", function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("[data-source-name]") : null;
    if (el) { showTip(el); return; }
    if (tip && ev.target && tip.contains(ev.target)) cancelHide();
  });
  document.addEventListener("mouseout", function (ev) {
    if (!anchor) return;
    var to = ev.relatedTarget;
    if (to && (anchor.contains(to) || (tip && tip.contains(to)))) return;
    if (ev.target && (anchor.contains(ev.target) || (tip && tip.contains(ev.target)))) scheduleHide();
  });
  document.addEventListener("focusin", function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("[data-source-name]") : null;
    if (el) showTip(el);
  });
  document.addEventListener("focusout", function (ev) {
    if (!anchor) return;
    var to = ev.relatedTarget;
    if (to && (anchor.contains(to) || (tip && tip.contains(to)))) return;
    scheduleHide();
  });
  var sourceTfEl = null, sourceTfUntil = 0, sourceTfBlock = null;
  document.addEventListener("pointerdown", function (ev) {
    if (ev.pointerType === "mouse") return;
    var el = ev.target && ev.target.closest ? ev.target.closest("[data-source-name][data-tooltip-tap-first]") : null;
    if (!el) return;
    var now = performance.now();
    if (sourceTfEl === el && now < sourceTfUntil) { sourceTfEl = null; sourceTfUntil = 0; sourceTfBlock = null; hideTip(); return; }
    sourceTfEl = el; sourceTfUntil = now + 3200; sourceTfBlock = el; showTip(el);
    ev.preventDefault(); ev.stopImmediatePropagation();
  }, true);
  document.addEventListener("click", function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("[data-source-name][data-tooltip-tap-first]") : null;
    if (el && sourceTfBlock === el) { sourceTfBlock = null; ev.preventDefault(); ev.stopImmediatePropagation(); }
  }, true);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") hideTip(); });
  if (tip) {
    tip.addEventListener("mouseenter", cancelHide);
    tip.addEventListener("mouseleave", scheduleHide);
  }
  var toggle = SexcapadesRuntime.DOM.byId("takeTestToggle");
  var menu = SexcapadesRuntime.DOM.byId("takeTestMenu");
  function closeMenu() {
    if (menu) menu.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var willOpen = menu.hidden;
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
    menu.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-profile-details-converter]")) closeMenu();
    });
    document.addEventListener("click", function (ev) {
      if (!menu.hidden && !(ev.target && ev.target.closest && ev.target.closest("#takeTestDropdown"))) closeMenu();
    });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeMenu(); });
  }
})();
});


/* ---- references dialog wiring ---- */
__sxInit(function () {
// External References wiring: open references dialog from [data-open-references] or #references
(function () {
  var dlg = SexcapadesRuntime.DOM.byId("referencesDialog");
  function openRefs() { window.__sxDialog.open(dlg); }
  function closeRefs() { window.__sxDialog.close(dlg); }
  var closeBtn = SexcapadesRuntime.DOM.byId("closeReferences");
  if (closeBtn) closeBtn.addEventListener("click", closeRefs);
  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target : null;
    if (!t) return;
    var opener = t.closest("[data-open-references]");
    if (opener) { ev.preventDefault(); openRefs(); }
    var conv = t.closest("[data-converter],[data-import-converter],[data-profile-details-converter]");
    var det = SexcapadesRuntime.DOM.byId("fetlifeHowDetails");
    if (conv && det) {
      var kind = conv.getAttribute("data-converter") || conv.getAttribute("data-import-converter") || conv.getAttribute("data-profile-details-converter");
      det.hidden = kind !== "fetlife";
    }
  });
  function checkHash() { if (/#\/?references\/?$/i.test(window.location.hash || "")) openRefs(); }
  window.addEventListener("hashchange", checkHash);
  checkHash();
})();
});


/* ---- fetlife mapping editor ---- */
__sxInit(function () {
// Build 2026-10-18_1658 — FetLife mapping EDITOR.
(function () {
  var dlg = SexcapadesRuntime.DOM.byId("fetlifeMapDialog");
  if (!dlg) return;
  var chooseEl = SexcapadesRuntime.DOM.byId("fetlifeMapChoose");
  var searchEl = SexcapadesRuntime.DOM.byId("fetlifeMapSearch");
  var resultEl = SexcapadesRuntime.DOM.byId("fetlifeMapResult");
  var addRowEl = SexcapadesRuntime.DOM.byId("fetlifeMapAddRow");
  var filterBtn = SexcapadesRuntime.DOM.byId("fetlifeMapFilter");
  var countEl = SexcapadesRuntime.DOM.byId("fetlifeMapCount");
  var tableBody = SexcapadesRuntime.DOM.byId("fetlifeMapTableBody");
  var resetBtn = SexcapadesRuntime.DOM.byId("fetlifeMapResetBtn");
  var downloadBtn = SexcapadesRuntime.DOM.byId("fetlifeMapDownloadBtn");
  var editedCountEl = SexcapadesRuntime.DOM.byId("fetlifeMapEditedCount");

  function openEditor() { window.__sxDialog.open(dlg); renderTable(); }
  function closeEditor() { window.__sxDialog.close(dlg); }

  var openBtn = SexcapadesRuntime.DOM.byId("openFetlifeMapEditor");
  if (openBtn) openBtn.addEventListener("click", openEditor);
  var closeBtn = SexcapadesRuntime.DOM.byId("closeFetlifeMap");
  if (closeBtn) closeBtn.addEventListener("click", closeEditor);

  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey && ev.shiftKey && (ev.key === "M" || ev.key === "m")) {
      ev.preventDefault();
      if (dlg.open) closeEditor(); else openEditor();
    }
  });

  function renderTable() {
    if (!window.__fetlifeMap || !tableBody) return;
    var map = window.__fetlifeMap();
    var keys = Object.keys(map).sort();
    var q = (searchEl ? searchEl.value : "").trim().toLowerCase();
    var rowsHtml = [];
    var visible = 0;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], v = map[k];
      if (q && !k.toLowerCase().includes(q) && !String(v).toLowerCase().includes(q)) continue;
      visible++;
      rowsHtml.push('<tr><td>' + k + '</td><td>' + v + '</td></tr>');
    }
    tableBody.innerHTML = rowsHtml.join("");
    if (countEl) countEl.textContent = visible + " of " + keys.length + " mappings";
  }

  if (searchEl) searchEl.addEventListener("input", renderTable);

  var row = SexcapadesRuntime.DOM.byId("fetlifeMapRow");
  var guide = SexcapadesRuntime.DOM.byId("fetlifeGuide");
  function syncRow() { if (row && guide) row.hidden = guide.hidden; }
  if (guide && window.MutationObserver) new MutationObserver(syncRow).observe(guide, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("click", function () { setTimeout(syncRow, 0); }, true);
  syncRow();
})();
});


/* ---- crash diagnostics display ---- */
__sxInit(function () {
(function () {
  function showErr(err, source) {
    try {
      var msgEl = document.getElementById("mapSafeMessage");
      if (msgEl) {
        var pre = document.getElementById("sxCrashDump");
        if (!pre) {
          pre = document.createElement("pre");
          pre.id = "sxCrashDump";
          pre.style.cssText = "text-align:left;font-size:11px;color:#ff8080;background:#151515;padding:10px;border-radius:6px;max-height:260px;overflow:auto;margin:12px auto;max-width:800px;white-space:pre-wrap;border:1px solid #444;";
          msgEl.parentNode.insertBefore(pre, msgEl.nextSibling);
        }
        var text = (err && (err.stack || err.message)) || String(err);
        pre.textContent = "[" + source + "] " + text;
      }
    } catch (_) {}
  }
  var origErr = console.error;
  console.error = function () {
    origErr.apply(console, arguments);
    if (arguments[0] === "Map paused safely." && arguments[1]) {
      showErr(arguments[1], "MapRenderError");
    }
  };
  window.addEventListener("error", function (e) {
    showErr(e.error || e.message, "WindowError");
  });
})();
});
