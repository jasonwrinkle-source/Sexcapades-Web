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
  if (typeof window.__SX_RENDER_SKIN_MENU === "function") {
    window.__SX_RENDER_SKIN_MENU(menu, window.__SX_ACTIVE_SKIN);
  }

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
  /* Installed window: standalone, fullscreen, window-controls overlay,
     or an iOS home-screen app. A skin pick stays on this origin. A jump
     to another *.capades.io host leaves the manifest scope, and the
     browser draws its address bar over the app. A normal tab still jumps. */
  function sxInstalledApp() {
    try {
      if (window.matchMedia("(display-mode: standalone)").matches) return true;
      if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
      if (window.matchMedia("(display-mode: window-controls-overlay)").matches) return true;
      if (window.navigator.standalone) return true;
    } catch (e) {}
    return false;
  }
  /* Skin id -> subdomain prefix: delegated to window.__SX_SKIN_SUBDOMAIN single source. */
  var SKIN_SUBDOMAIN = (typeof window !== "undefined" && window.__SX_SKIN_SUBDOMAIN) || {};
  function choose(item) {
    if (!item) return;
    var skin = item.getAttribute("data-skin");
    closeMenu();

    var host = "";
    try { host = String(location.hostname || "").toLowerCase(); } catch (e) { host = ""; }
    var isProductionDomain = /\.capades\.io$/.test(host) || host === "sexcapades.io" || host === "www.sexcapades.io";

    if (isProductionDomain && !sxInstalledApp()) {
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
