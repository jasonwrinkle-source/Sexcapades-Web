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
  var countEl = SexcapadesRuntime.DOM.byId("fetlifeMapCount");
  var tableBody = SexcapadesRuntime.DOM.byId("fetlifeMapTableBody");

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


/* ---- consolidated observers (a11y, titles, timer auto-pause) ---- */
__sxInit(function () {
(function() {
  function syncTabTitles() {
    document.querySelectorAll('.profile-tab-button').forEach(function(btn) {
      var label = btn.querySelector('[data-profile-label]');
      var name = label ? (label.textContent || '').trim() : (btn.textContent || '').trim();
      if (name) btn.title = name;
    });
  }
  function syncTimerLabel() {
    var btn = document.querySelector('.outline-timer-toggle');
    if (!btn) return;
    if (btn.classList.contains('is-paused')) {
      btn.setAttribute('aria-label', 'Timer paused — tab was hidden. Tap to resume.');
      btn.title = 'Paused — tab hidden (auto-pause). Tap to resume.';
    } else {
      btn.setAttribute('aria-label', 'Pause timer');
      btn.title = '';
    }
  }
  function enhanceA11y() {
    document.querySelectorAll('[data-category-toggle], .branch-toggle, [data-branch-toggle]').forEach(function(btn) {
      var name = btn.getAttribute('data-category-name') || btn.getAttribute('data-branch-name') ||
                 (btn.textContent || '').trim().split('\n')[0];
      if (name && !/category|branch/i.test(btn.getAttribute('aria-label') || '')) {
        var cur = btn.getAttribute('aria-label') || 'Toggle';
        btn.setAttribute('aria-label', cur + ' — ' + name + ' category');
      }
    });
    document.querySelectorAll('.outline-category-title, [data-outline-category]').forEach(function(el) {
      if (!el.getAttribute('role') && !/^H[1-6]$/.test(el.tagName)) {
        el.setAttribute('role', 'heading');
        el.setAttribute('aria-level', '2');
      }
    });
  }
  function syncAll() { syncTabTitles(); syncTimerLabel(); enhanceA11y(); }
  new MutationObserver(syncAll).observe(document.body, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['class']
  });
  syncAll();
})();
});


/* ---- unified title bar & branding links ---- */
__sxInit(function () {
(function () {
  function boot() {
    var btn = SexcapadesRuntime.DOM.byId("mapListViewButton");
    if (btn && btn.parentNode) {
      var h1 = btn.parentNode.querySelector("h1");
      if (h1 && h1.parentNode === btn.parentNode) btn.parentNode.insertBefore(h1, btn);
    }
    var src = SexcapadesRuntime.DOM.byId("reviewLink");
    if (src) {
      Array.prototype.slice.call(document.querySelectorAll("[data-guide-slot]")).forEach(function (slot) {
        var clone = src.cloneNode(true);
        clone.removeAttribute("id");
        Array.prototype.slice.call(clone.querySelectorAll("[id]")).forEach(function (n) { n.removeAttribute("id"); });
        var svg = clone.querySelector("svg");
        if (svg) {
          svg.removeAttribute("tabindex");
          svg.removeAttribute("role");
          Array.prototype.slice.call(svg.querySelectorAll(".horizon-ring-hit")).forEach(function (p) { p.parentNode.removeChild(p); });
        }
        slot.appendChild(clone);
      });
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-open-about]")).forEach(function (b) {
      b.addEventListener("click", function () {
        var o = SexcapadesRuntime.DOM.byId("openAppAbout");
        if (o) o.click();
      });
    });
  }
  boot();
})();
});


/* ---- guide qmark gestures (1-tap Guide, 2-taps About, 5-taps Easter egg) ---- */
__sxInit(function () {
(function () {
  var link = document.getElementById("reviewLink");
  if (!link) return;
  var WINDOW_MS = 400;
  var count = 0;
  var timer = null;
  function reset() {
    count = 0;
    if (timer) { clearTimeout(timer); timer = null; }
  }
  function openGuide() { window.open(link.href, "_blank", "noopener"); }
  function openAbout() {
    var o = document.getElementById("openAppAbout");
    if (o) o.click();
  }
  function openEasterEgg() {
    var egg = document.querySelector(".easter-egg");
    if (egg) { egg.click(); return; }
    window.open("https://linktr.ee/SkewedViewBlue", "_blank", "noopener");
  }
  function resolveGesture() {
    var n = count;
    reset();
    if (n === 1) openGuide();
    else if (n === 2) openAbout();
  }
  link.addEventListener("click", function (event) {
    event.preventDefault();
    count += 1;
    if (count >= 5) {
      reset();
      openEasterEgg();
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(resolveGesture, WINDOW_MS);
  });
})();
});


/* ---- list view glow ---- */
__sxInit(function () {
(function() {
  function init() {
    var btn = SexcapadesRuntime.DOM.byId("mapListViewButton"), tabs = SexcapadesRuntime.DOM.byId("profileTabs");
    if (!btn || !tabs) return;
    var seen = false;
    function hasProfiles() { return Boolean(tabs.querySelector(".profile-tab")); }
    function sync() { btn.classList.toggle("list-view-glow", !seen && !hasProfiles()); }
    function stop() { if (seen) return; seen = true; btn.classList.remove("list-view-glow"); }
    btn.addEventListener("pointerenter", stop);
    btn.addEventListener("focus", stop);
    btn.addEventListener("click", stop);
    new MutationObserver(sync).observe(tabs, { childList: true, subtree: true });
    sync();
  }
  init();
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
