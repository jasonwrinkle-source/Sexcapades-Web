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
      if (typeof window.__SX_RESOLVE_SKIN === "function") {
        return window.__SX_RESOLVE_SKIN(window.location.hostname);
      }
      if (typeof window.__sxAnalyticsSkin === "function") {
        return window.__sxAnalyticsSkin();
      }
      return window.__SX_ACTIVE_SKIN || "sexcapades";
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
