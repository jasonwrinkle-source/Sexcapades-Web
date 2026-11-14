/* ---- module: ui-wiring (folded from patches.js) ---- */

var SX_SHELL_COLLECT_URL = 'https://sexcapades.io/hosted/api/collect.php';
function sxShellOnLiveHost() {
  return location.hostname === 'sexcapades.io' || location.hostname === 'www.sexcapades.io';
}

/* ---- visitor-counter ---- */
__sxInit(function () {
(function() {
  function counterElements() {
    return document.querySelectorAll('#appAboutDialog .about-visitor-count');
  }

  function renderUnavailable() {
    counterElements().forEach(function(el) {
      el.replaceChildren();
      el.textContent = '—';
      el.classList.add('is-unavailable');
      el.setAttribute('aria-label', 'Site visitors unavailable');
      el.title = 'Visitor count unavailable';
    });
  }

  function renderCount(value) {
    var number = Number(value);
    if (!Number.isFinite(number) || number < 0) throw new Error('Invalid visitor count');
    var digits = String(Math.floor(number)).padStart(6, '0');
    counterElements().forEach(function(el) {
      var fragment = document.createDocumentFragment();
      digits.split('').forEach(function(ch) {
        var digit = document.createElement('span');
        digit.className = 'odo-digit';
        digit.textContent = ch;
        fragment.appendChild(digit);
      });
      el.replaceChildren(fragment);
      el.classList.remove('is-unavailable');
      el.setAttribute('aria-label', number + ' site visitors');
      el.removeAttribute('title');
    });
  }

  function fetchCount() {
    fetch(SX_SHELL_COLLECT_URL + '?action=get_stats')
      .then(function(response) {
        if (!response.ok) throw new Error('Visitor count request failed');
        return response.json();
      })
      .then(function(data) {
        renderCount(data && data.unique_visitors);
      })
      .catch(function() {
        renderUnavailable();
      });
  }

  function initCounter() {
    var about = SexcapadesRuntime.DOM.byId('appAboutDialog');
    if (!about || about.querySelector('.about-visitor-count')) return;

    var wrap = document.createElement('div');
    wrap.className = 'about-counter-wrap';
    var label = document.createElement('div');
    label.className = 'about-counter-label';
    label.textContent = 'Site visitors';
    var count = document.createElement('div');
    count.className = 'about-visitor-count is-unavailable';
    count.setAttribute('role', 'status');
    count.setAttribute('aria-live', 'polite');
    count.setAttribute('aria-label', 'Site visitors unavailable');
    count.title = 'Visitor count unavailable';
    count.textContent = '—';
    wrap.appendChild(label);
    wrap.appendChild(count);
    about.appendChild(wrap);

    var requested = false;
    function requestWhenOpen() {
      if (requested || !about.open) return;
      requested = true;
      fetchCount();
      observer.disconnect();
    }
    var observer = new MutationObserver(requestWhenOpen);
    observer.observe(about, {attributes: true, attributeFilter: ['open']});
    requestWhenOpen();
  }

  initCounter();
})();
});


/* ---- survey-consent ---- */
__sxInit(function () {
(function() {
  var surveyOptedIn = true;
  window.__sxSurveyOptedIn = function(){ return surveyOptedIn; };
  function applySurveyConsent(){
    document.querySelectorAll('[data-survey-consent]').forEach(function(control){ control.checked = surveyOptedIn; });
  }
  function wireSurveyConsent(control){
    if (control.__sxSurveyWired) { control.checked = surveyOptedIn; return; }
    control.__sxSurveyWired = true;
    control.checked = surveyOptedIn;
    control.addEventListener('change', function(){ surveyOptedIn = control.checked; applySurveyConsent(); });
  }
  function initSurveyConsent(){
    document.querySelectorAll('[data-survey-consent]').forEach(wireSurveyConsent);
    if (window.MutationObserver && document.body) {
      new MutationObserver(function(records){
        records.forEach(function(record){
          record.addedNodes.forEach(function(node){
            if (node.nodeType !== 1) return;
            if (window.SVGElement && node instanceof window.SVGElement) return;
            if (node.matches && node.matches('[data-survey-consent]')) wireSurveyConsent(node);
            if (node.querySelectorAll) node.querySelectorAll('[data-survey-consent]').forEach(wireSurveyConsent);
          });
        });
      }).observe(document.body, {childList: true, subtree: true});
    }
  }
  initSurveyConsent();
})();
});


/* ---- unmapped-fetish-share ---- */
__sxInit(function () {
(function() {
  var row = SexcapadesRuntime.DOM.byId('unmappedShareRow');
  var box = SexcapadesRuntime.DOM.byId('shareUnmappedFetishes');
  var preview = SexcapadesRuntime.DOM.byId('converterPreview');
  var guide = SexcapadesRuntime.DOM.byId('fetlifeGuide');
  var apply = SexcapadesRuntime.DOM.byId('applyConverter');
  if (!row || !box || !preview || !apply) return;
  function syncVisibility(){
    var fetlifeMode = !!(guide && !guide.hidden);
    var hasUnmapped = !!(window.__sxUnmappedShare && window.__sxUnmappedShare.length);
    row.hidden = !(fetlifeMode && !preview.hidden && hasUnmapped);
    var labelSpan = row.querySelector('span');
    var dlgTitle = SexcapadesRuntime.DOM.byId('converterTitle');
    var isBdsm = !!(dlgTitle && /bdsmtest/i.test(dlgTitle.textContent || ''));
    if (labelSpan) {
      labelSpan.textContent = isBdsm
        ? 'Help improve imports by sharing unmatched role names anonymously'
        : 'Help improve imports by sharing unmatched fetish names anonymously';
    }
    if (row.title) {
      row.title = isBdsm
        ? 'Sharing unmatched role names helps us improve the importer so it can handle more role lists.'
        : 'Sharing unmatched fetish names helps us improve the importer so it can handle more\'s fetish lists.';
    }
  }
  function observe(el){
    if (el && window.MutationObserver) new MutationObserver(syncVisibility).observe(el, {attributes: true, attributeFilter: ['hidden']});
  }
  observe(preview);
  observe(guide);
  document.addEventListener('click', function(){ setTimeout(syncVisibility, 0); }, true);
  syncVisibility();
  var sentFor = null;
  apply.addEventListener('click', function(){
    if (!box.checked || row.hidden) return;
    if (!sxShellOnLiveHost()) return;
    var items = window.__sxUnmappedShare;
    if (!items || !items.length || sentFor === items) return;
    sentFor = items;
    var seen = {}, payload = [];
    items.forEach(function(item){
      if (!item || !item.fetish_name) return;
      var type = item.list_type === 'curious' ? 'curious' : 'into';
      var key = String(item.fetish_name).toLowerCase() + '|' + type;
      if (seen[key]) return;
      seen[key] = true;
      payload.push({name: item.fetish_name, list_type: type});
    });
    if (!payload.length) return;
    var uuid = '';
    try { uuid = typeof window.__sxAnonUuid === 'function' ? String(window.__sxAnonUuid() || '') : ''; } catch (e) { if (typeof __sxErrLog === "function") __sxErrLog("anon-uuid", e); }
    try {
      fetch(SX_SHELL_COLLECT_URL + '?action=unmapped', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'unmapped', uuid: uuid, fetishes: payload}),
        keepalive: true
      }).catch(function (e) { if (typeof __sxErrLog === "function") __sxErrLog("analytics-beacon", e); });
    } catch (e) { if (typeof __sxErrLog === "function") __sxErrLog("analytics-beacon", e); }
  });
})();
});


/* ---- scribe-gate ---- */
__sxInit(function () {
(function() {
  function ratingCount(){
    var counter = SexcapadesRuntime.DOM.byId('ratedCount');
    if(!counter) return 0;
    var match = String(counter.textContent || '').replace(/,/g, '').match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
  function syncScribeGate(){
    var hasRatings = ratingCount() > 0;
    var tabs = SexcapadesRuntime.DOM.byId('profileTabs');
    var hasTab = tabs && tabs.querySelector('.profile-tab-button,button');
    var show = hasRatings || !!hasTab;
    var zone = document.querySelector('.scribe-zone');
    var separator = document.querySelector('.scribe-separator');
    if(zone) zone.hidden = !show;
    if(separator) separator.hidden = !show;
  }
  function initScribeGate(){
    var counter = SexcapadesRuntime.DOM.byId('ratedCount');
    syncScribeGate();
    if(counter) new MutationObserver(syncScribeGate).observe(counter, {childList: true, characterData: true, subtree: true});
  }
  initScribeGate();
})();
});


/* ---- sentinel-toolbar-gate ---- */
__sxInit(function () {
(function() {
  var sentinelBtn = document.getElementById('openSentinel');
  var setterBtn = document.getElementById('openNegotiation');
  if(!sentinelBtn) return;
  function syncSentinelGate(){
    if(setterBtn) sentinelBtn.hidden = !!setterBtn.hidden;
  }
  sentinelBtn.addEventListener('click', function() {
    if(window.__sxOpenSentinel) window.__sxOpenSentinel();
  });
  syncSentinelGate();
  if(setterBtn && typeof MutationObserver === "function"){
    new MutationObserver(syncSentinelGate).observe(setterBtn, {attributes: true, attributeFilter: ["hidden"]});
  }
  var tabs = document.getElementById('profileTabs');
  if(tabs && typeof MutationObserver === "function"){
    new MutationObserver(function(){ try{ setTimeout(syncSentinelGate, 0); } catch(e){ syncSentinelGate(); } }).observe(tabs, {childList: true, subtree: true});
  }
})();
});


/* ---- take-test & source tooltip wiring ---- */
__sxInit(function () {
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
(function () {
  var dlg = SexcapadesRuntime.DOM.byId("fetlifeMapDialog");
  if (!dlg) return;
  var chooseEl = SexcapadesRuntime.DOM.byId("fetlifeMapChoose");
  var searchEl = SexcapadesRuntime.DOM.byId("fetlifeMapSearch");
  var resultEl = SexcapadesRuntime.DOM.byId("fetlifeMapResult");
  var addRowEl = SexcapadesRuntime.DOM.byId("fetlifeMapAddRow");
  var countEl = SexcapadesRuntime.DOM.byId("fetlifeMapCount");
  var tableBody = SexcapadesRuntime.DOM.byId("fetlifeMapRows");

  function openEditor() { window.__sxDialog.open(dlg); renderTable(); }
  function closeEditor() { window.__sxDialog.close(dlg); }

  var openBtn = SexcapadesRuntime.DOM.byId("openFetlifeMap");
  if (openBtn) openBtn.addEventListener("click", openEditor);
  var closeBtn = SexcapadesRuntime.DOM.byId("closeFetlifeMap");
  if (closeBtn) closeBtn.addEventListener("click", closeEditor);

  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey && ev.shiftKey && (ev.key === "M" || ev.key === "m")) {
      ev.preventDefault();
      if (dlg.open) closeEditor(); else openEditor();
    }
  });

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

  function renderTable() {
    if (!window.__fetlifeMap || !tableBody) return;
    var rows = window.__fetlifeMap.rows();
    var q = (searchEl ? searchEl.value : "").trim().toLowerCase();
    var qn = norm(q);
    var rowsHtml = [];
    var visible = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (q) {
        var hay = (r.name + " " + r.label + " " + r.path + " " + r.key).toLowerCase();
        if (hay.indexOf(q) === -1 && (!qn || norm(hay).indexOf(qn) === -1)) continue;
      }
      visible++;
      var side = r.direction === "give" ? "give only" : r.direction === "receive" ? "receive only" : "give + receive";
      rowsHtml.push('<tr data-flkey="' + esc(r.key) + '"><td>' + esc(r.name) + '</td><td>' + esc(r.label) + '<br><small>' + esc(r.path) + '</small></td><td>' + side + '</td><td><button type="button" class="action-btn fetlife-map-edit-btn" data-flkey="' + esc(r.key) + '" data-flname="' + esc(r.name) + '">Edit</button></td></tr>');
    }
    tableBody.innerHTML = rowsHtml.join("");
    if (countEl) countEl.textContent = visible + " of " + rows.length + " mappings";
  }

  var highlightedRow = null;
  function clearRowHighlight() {
    if (highlightedRow) { highlightedRow.style.background = ""; highlightedRow = null; }
  }
  function highlightRow(key) {
    if (!tableBody || !key) return;
    clearRowHighlight();
    var trs = tableBody.rows;
    for (var i = 0; i < trs.length; i++) {
      if (trs[i].getAttribute("data-flkey") === key) {
        highlightedRow = trs[i];
        highlightedRow.style.background = "rgba(0, 229, 255, 0.18)";
        highlightedRow.scrollIntoView({ block: "nearest" });
        return;
      }
    }
  }

  if (searchEl) searchEl.addEventListener("input", renderTable);

  // Edit button in a row: put that fetish name in the chooser and run the
  // lookup, so the result line shows where it lands.
  if (tableBody) tableBody.addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest(".fetlife-map-edit-btn") : null;
    if (!btn || !chooseEl) return;
    chooseEl.value = btn.getAttribute("data-flname") || "";
    runChooser();
    chooseEl.focus();
  });

  // "Find a FetLife fetish" chooser: look the typed name up with the
  // importer's own resolution and show where it lands, then filter the
  // table to the matching row(s).
  function runChooser() {
    if (!window.__fetlifeMap) return;
    var term = (chooseEl ? chooseEl.value : "").trim();
    if (!term) {
      if (resultEl) resultEl.hidden = true;
      if (addRowEl) addRowEl.hidden = true;
      clearRowHighlight();
      if (searchEl) searchEl.value = "";
      renderTable();
      return;
    }
    var hit = null;
    try { hit = window.__fetlifeMap.lookup(term); } catch (e) { hit = null; }
    if (!hit) {
      // Fallback: the importer's exact resolution is space-sensitive, so
      // a spaceless typed name ("bootlicking") does not match the key
      // "boot licking" even though the row is in the table. Match the
      // table row by normalized name/key so it still lands.
      var rows = window.__fetlifeMap.rows();
      var tn = norm(term);
      for (var i = 0; i < rows.length; i++) {
        if (norm(rows[i].name) === tn || norm(rows[i].key) === tn) {
          hit = { key: rows[i].key, id: rows[i].id, label: rows[i].label, path: rows[i].path, kind: rows[i].kind, child: null, direction: rows[i].direction, uncertain: rows[i].uncertain, broad: false, pattern: false };
          break;
        }
      }
    }
    if (!hit) {
      if (resultEl) {
        resultEl.hidden = false;
        resultEl.textContent = 'No mapping for "' + term + '".';
      }
      if (addRowEl) addRowEl.hidden = true;
    } else {
      if (addRowEl) addRowEl.hidden = true;
      if (resultEl) {
        resultEl.hidden = false;
        var text = '"' + term + '" \u2192 ' + hit.label + ' (' + hit.kind + ')';
        if (hit.path) text += ' \u2014 ' + hit.path;
        if (hit.child) text += ' \u00b7 ' + hit.child;
        if (hit.broad) text += ' (broad match)';
        if (hit.pattern) text += ' (pattern match)';
        resultEl.textContent = text;
      }
    }
    if (searchEl) searchEl.value = term;
    renderTable();
    if (hit && hit.key) highlightRow(hit.key);
    else clearRowHighlight();
  }

  if (chooseEl) chooseEl.addEventListener("input", runChooser);

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
