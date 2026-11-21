/* ---- inline block 1 (document order) ---- */

      /* GATE APP HEADER — About dialog + avatar music.
         Self-contained; does not import the app bundle. The verse is the
         app's hypermap verse (avatar-music.js TABLE "hypermap"). The mp3s
         are not in the repo yet (Jason adds them from his machine), so a
         missing file is a quiet no-op: the button returns to idle, no
         crash, no console error storm. */
      (function () {
        "use strict";
        var VERSE_URL = "/hosted/assets/audio/the-explainer/e1/verse-hypermap.mp3";
        var VERSE_LABEL = "Hypermap";

        /* ---- About dialog ---- */
        var aboutBtn = document.getElementById("gateAppAboutBtn");
        var aboutDlg = document.getElementById("gateAboutDialog");
        var aboutClose = document.getElementById("gateCloseAbout");
        if (aboutBtn && aboutDlg && aboutDlg.showModal) {
          aboutBtn.addEventListener("click", function () { aboutDlg.showModal(); });
        }
        if (aboutClose && aboutDlg) {
          aboutClose.addEventListener("click", function () { aboutDlg.close(); });
        }
        if (aboutDlg) {
          aboutDlg.addEventListener("click", function (e) {
            if (e.target === aboutDlg) aboutDlg.close();
          });
        }

        /* ---- Avatar music (play/stop) ---- */
        var btn = document.getElementById("gateAvatarMusicBtn");
        var audio = null;
        var seq = 0;
        var warned = false;

        function setIdle() {
          if (!btn) return;
          btn.classList.remove("is-playing");
          btn.classList.remove("is-loading");
          btn.setAttribute("aria-pressed", "false");
          btn.setAttribute("aria-label", "Play the verse for the " + VERSE_LABEL);
        }
        function setPlaying() {
          if (!btn) return;
          btn.classList.remove("is-loading");
          btn.classList.add("is-playing");
          btn.setAttribute("aria-pressed", "true");
          btn.setAttribute("aria-label", "Stop the verse for the " + VERSE_LABEL);
        }
        function ensureAudio() {
          if (audio) return audio;
          audio = new Audio();
          audio.preload = "none";
          audio.addEventListener("ended", function () { setIdle(); });
          audio.addEventListener("playing", function () { setPlaying(); });
          audio.addEventListener("error", function () {
            /* One quiet warn per attempt at most; never an error storm.
               Also pause the element so its state matches the idle button. */
            try { audio.pause(); } catch (e) {}
            if (!warned) { warned = true; console.warn("Gate music: verse audio could not be loaded (" + VERSE_URL + ")"); }
            setIdle();
          });
          return audio;
        }
        function playVerse() {
          if (!btn) return;
          if (btn.classList.contains("is-playing") || btn.classList.contains("is-loading")) return;
          warned = false;
          var mySeq = ++seq;
          var a = ensureAudio();
          btn.classList.add("is-loading");
          btn.setAttribute("aria-pressed", "true");
          btn.setAttribute("aria-label", "Stop the verse for the " + VERSE_LABEL);
          try { a.src = VERSE_URL; } catch (e) { setIdle(); return; }
          var p = null;
          try { p = a.play(); } catch (e) { setIdle(); return; }
          if (p && typeof p.then === "function") {
            p.then(function () {
              if (mySeq !== seq) return;
              setPlaying();
            }, function () {
              if (mySeq !== seq) return;
              setIdle();
            });
          } else {
            setPlaying();
          }
        }
        function stopVerse() {
          seq++;
          if (audio) { try { audio.pause(); } catch (e) {} }
          setIdle();
        }
        function toggleVerse() {
          if (!btn) return;
          if (btn.classList.contains("is-playing") || btn.classList.contains("is-loading")) stopVerse();
          else playVerse();
        }
        if (btn) btn.addEventListener("click", toggleVerse);
        setIdle();

        /* Auto-play on Enter: called from the Enter click handler (a user
           gesture, so autoplay-with-sound is allowed). Only starts when
           nothing is playing. */
        window.sxGateMusicAutoPlay = function () { playVerse(); };
        window.sxGateMusicState = function () {
          return { playing: !!(btn && btn.classList.contains("is-playing")),
                   loading: !!(btn && btn.classList.contains("is-loading")),
                   src: audio ? (audio.getAttribute("src") || null) : null,
                   paused: audio ? audio.paused : true,
                   readyState: audio ? audio.readyState : 0 };
        };
      })();
    
/* ---- inline block 2 (document order) ---- */

      (function () {
        var funnelEndpoint = '/hosted/api/collect.php';
        var incomingSearchParams = new URLSearchParams(window.location.search);
        var incomingUtmSource = incomingSearchParams.get('utm_source') || '';
        var isFlyerReferral = incomingSearchParams.get('src') === 'flyer';
        var ageGate = document.getElementById('ageGate');
        var destinationMenu = document.getElementById('destinationMenu');
        var enterButton = document.getElementById('enterButton');
        var appViewTrigger = document.getElementById('appViewTrigger');
        var appViewMenu = document.getElementById('appViewMenu');

        try {
          window.sessionStorage.setItem('sexcapades_utm_source', incomingUtmSource);
        } catch (storageError) {
          // Continue without persistence when browser storage is unavailable.
        }

        function createBrowserUuid() {
          if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
          }

          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
            var randomValue = Math.random() * 16 | 0;
            var replacement = character === 'x' ? randomValue : (randomValue & 3 | 8);
            return replacement.toString(16);
          });
        }

        function getBrowserUuid() {
          var browserUuid = '';

          try {
            browserUuid = window.localStorage.getItem('sexcapades_uuid') || '';
            if (!browserUuid) {
              browserUuid = createBrowserUuid();
              window.localStorage.setItem('sexcapades_uuid', browserUuid);
            }
          } catch (storageError) {
            browserUuid = createBrowserUuid();
          }

          return browserUuid;
        }

        function getStoredUtmSource() {
          try {
            return window.sessionStorage.getItem('sexcapades_utm_source') || '';
          } catch (storageError) {
            return incomingUtmSource;
          }
        }

        /* Per-skin analytics (2026-11-18): the gate-passed event carries
           the current skin id. Resolved from the gate's own skin prefix
           (hostname, with the ?skin= override — see the GATE_SKINS block
           below; this function runs after that block, so the prefix is
           set), falling back to the hostname directly so the field is
           never missing. A vanilla skin sends no gate-passed event at
           all (no gate to pass), so in practice this is "sexcapades";
           the field is here so the record is complete and the bundle's
           gate-passed event and this one share the same shape. */
        var GATE_SKIN_IDS = { sex: "sexcapades", polis: "poliscapades", fores: "forescapades", philo: "philoscapades", aesth: "aesthcapades", voca: "vocapades", tech: "techcapades", dharma: "dharmacapades", theori: "theoricapades", praxi: "praxicapades", quanta: "quantacapades", experi: "expericapades", simul: "simulcapades", matter: "mattercapades", chem: "chemcapades", nous: "nouscapades" };
        function gateAnalyticsSkin() {
          try {
            if (typeof gateSkinPrefix === "string" && GATE_SKIN_IDS[gateSkinPrefix]) return GATE_SKIN_IDS[gateSkinPrefix];
            var host = window.location.hostname.toLowerCase();
            if (host === "sexcapades.io" || host === "www.sexcapades.io") return "sexcapades";
            if (/\.capades\.io$/.test(host) && GATE_SKIN_IDS[host.split(".")[0]]) return GATE_SKIN_IDS[host.split(".")[0]];
          } catch (e) { /* default below */ }
          return "sexcapades";
        }

        function sendGatePassedEvent() {
          var payload = JSON.stringify({
            action: 'event',
            uuid: getBrowserUuid(),
            event_type: 'gate_passed',
            utm_source: getStoredUtmSource(),
            skin: gateAnalyticsSkin()
          });

          if (navigator.sendBeacon) {
            try {
              if (navigator.sendBeacon(funnelEndpoint, new Blob([payload], { type: 'application/json' }))) return;
            } catch (beaconError) {
              // Fall through to a keepalive fetch.
            }
          }

          fetch(funnelEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          }).catch(function () {
            // Tracking must never interrupt navigation.
          });
        }

        var destinationUrls = {
          app: '/hosted/app.html',
          guide: '/hosted/guide.html',
          flyer: '/hosted/flyer.html',
          faq: '/hosted/faq.html',
          quickstart: '/hosted/quickstart.html',
          'how-it-works': '/hosted/how-it-works.html'
        };

        // Guide sections: a guide deep link may name a section after the
        // page (guide/scene-sentinel), and a bare section hashtag
        // (scene-sentinel) is a guide section too. The section is a single
        // safe anchor (letters, digits, hyphens); guide.html itself ignores
        // unknown anchors and shows the contents page, so this cannot
        // misdirect — the URL stays on one of our own hosts, and the gate still
        // runs first before any of these destinations are followed.
        var guideSectionPattern = /^[a-z0-9][a-z0-9_-]*$/i;

        function getDeepLinkDestination() {
          var fragment = window.location.hash.slice(1);
          var segments;
          var page;
          var subroute;

          if (!fragment || fragment.indexOf('#') !== -1) return '';

          segments = fragment.split('/');
          page = segments.shift().toLowerCase();

          // A bare section hashtag is a guide section (e.g. #scene-sentinel
          // opens the Sentinel section of the guide after the gate passes).
          if (!Object.prototype.hasOwnProperty.call(destinationUrls, page)) {
            if (segments.length) return '';
            if (!guideSectionPattern.test(page)) return '';
            return destinationUrls.guide + '#' + page;
          }
          if (!segments.length) return destinationUrls[page];

          if (page === 'guide') {
            subroute = segments.join('/');
            if (!guideSectionPattern.test(subroute)) return '';
            return destinationUrls.guide + '#' + subroute;
          }

          if (page !== 'app') return '';

          subroute = segments.join('/');
          if (!/^[a-z0-9][a-z0-9/_-]*$/i.test(subroute)) return '';

          return destinationUrls.app + '#app/' + subroute;
        }

        // The app bounces unverified visitors here with ?return=<the app URL
        // they came from>. Honor it after verification, but only for same-site
        // HTTPS URLs and never back to this gate page itself, so the parameter
        // can't be abused as an open redirect or restart the loop.
        function getReturnDestination() {
          var raw;
          var parsed;

          try {
            raw = new URLSearchParams(window.location.search).get('return');
          } catch (searchError) {
            return '';
          }

          if (!raw) return '';

          try {
            // The app sends a same-site path (`/qa/app.html?...`), not an
            // absolute URL. Resolve that against this page before the
            // host check; an unbased URL() rejects every relative return.
            parsed = new URL(raw, window.location.origin);
          } catch (parseError) {
            return '';
          }

          // A same-origin return stays put, including http://localhost.
          // Anything else must be https on one of our hosts, so the
          // parameter can't be abused as an open redirect.
          var sameOrigin = parsed.origin === window.location.origin;
          if (!sameOrigin && parsed.protocol !== 'https:') return '';
          if (!sameOrigin && parsed.hostname !== 'sexcapades.io' && parsed.hostname !== 'www.sexcapades.io' && !/(^|\.)capades\.io$/i.test(parsed.hostname)) return '';
          if (parsed.username || parsed.password) return '';
          if (/\/gate\.html$/i.test(parsed.pathname) || parsed.pathname === '/hosted/gate.html') return '';

          return parsed.href;
        }

        function markAgeVerified() {
          try {
            window.localStorage.setItem('sexcapades_age_verified', 'true');
            window.localStorage.setItem('sexcapades_age_verified_at', new Date().toISOString());
          } catch (storageError) {
            // Storage can be unavailable (private mode); the cookie below still remembers this visit's pass.
          }

          try {
            // Both an Expires date and Max-Age: some browsers/webviews drop a
            // cookie that carries only one of the two lifetime attributes.
            var cookieValue = 'sexcapades_age_verified=1' +
              '; Expires=' + new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString() +
              '; Max-Age=31536000; Path=/; SameSite=Lax';
            // Share the pass between the apex domain and www (and any other
            // subdomain): a host-only cookie set on one is invisible to the other.
            if (/(^|\.)sexcapades\.io$/i.test(window.location.hostname)) {
              cookieValue += '; Domain=sexcapades.io';
            }
            if (window.location.protocol === 'https:') cookieValue += '; Secure';
            document.cookie = cookieValue;
          } catch (cookieError) {
            // Cookies can be unavailable too; the gate still works for this visit.
          }
        }

        function hasAgeVerifiedCookie() {
          try {
            return document.cookie.split(';').some(function (part) {
              return part.trim() === 'sexcapades_age_verified=1';
            });
          } catch (cookieError) {
            return false;
          }
        }

        function hasPreviousGatePass() {
          if (hasAgeVerifiedCookie()) return true;

          try {
            return window.localStorage.getItem('sexcapades_age_verified') === 'true' ||
              Boolean(window.localStorage.getItem('sexcapades_uuid'));
          } catch (storageError) {
            return false;
          }
        }

        function revealDestinations() {
          ageGate.classList.add('is-confirmed');
          ageGate.removeAttribute('aria-labelledby');
          ageGate.setAttribute('aria-label', isVanillaSkinGate ? (GATE_SKINS[gateSkinPrefix][0] + ' destinations') : 'Sexcapades destinations');
          destinationMenu.classList.add('is-visible');
          destinationMenu.setAttribute('aria-hidden', 'false');
          enterButton.setAttribute('aria-expanded', 'true');
        }


        // Skin-aware gate (consolidated gate, 2026-11-17): this page is the
        // front door for every skin, not just Sexcapades. The skin is read
        // from the hostname prefix. A ?skin= override applies on every host
        // except a sex host — it can never override the age gate — including
        // flex, localhost, and a vanilla skin host, so a site-relative picker
        // link stays on the origin you are already browsing. A vanilla skin
        // has no age gate: the init flow below
        // reveals the destinations straight away, no verification is
        // recorded and no gate-passed event is sent, because there is no
        // gate to pass. A sex host runs the age gate as before. Any other
        // host (localhost, unknown) with no ?return= is sent to the picker.
        var GATE_SKINS = {
          sex: ["Sexcapades", "Sex.Capades.IO"],
          polis: ["Poliscapades", "Polis.Capades.IO"],
          fores: ["Forescapades", "Fores.Capades.IO"],
          philo: ["Philoscapades", "Philo.Capades.IO"],
          aesth: ["Aesthcapades", "Aesth.Capades.IO"],
          voca: ["Vocapades", "Voca.Capades.IO"],
          tech: ["Techcapades", "Tech.Capades.IO"],
          dharma: ["Dharmacapades", "Dharma.Capades.IO"],
          theori: ["Theoricapades", "Theori.Capades.IO"],
          praxi: ["Praxicapades", "Praxi.Capades.IO"],
          quanta: ["Quantacapades", "Quanta.Capades.IO"],
          experi: ["Expericapades", "Experi.Capades.IO"],
          simul: ["Simulcapades", "Simul.Capades.IO"],
          matter: ["Mattercapades", "Matter.Capades.IO"],
          chem: ["Chemcapades", "Chem.Capades.IO"],
          nous: ["Nouscapades", "Nous.Capades.IO"]
        };
        var gateSkinPrefix = "";
        try {
          var gateHost = window.location.hostname.toLowerCase();
          if (/\.capades\.io$/.test(gateHost)) gateSkinPrefix = gateHost.split(".")[0];
          else if (gateHost === "sexcapades.io" || gateHost === "www.sexcapades.io") gateSkinPrefix = "sex";
        } catch (e) { gateSkinPrefix = ""; }
        if (gateSkinPrefix !== "sex") {
          try {
            var skinParam = new URLSearchParams(window.location.search).get("skin");
            if (skinParam && GATE_SKINS[skinParam.toLowerCase()]) gateSkinPrefix = skinParam.toLowerCase();
          } catch (e) { /* no override; fall through to the picker redirect */ }
        }
        var isVanillaSkinGate = !!(gateSkinPrefix && GATE_SKINS[gateSkinPrefix] && gateSkinPrefix !== "sex");
        if (isVanillaSkinGate) {
          var skinName = GATE_SKINS[gateSkinPrefix][0];
          var skinBrand = GATE_SKINS[gateSkinPrefix][1];
          try { document.title = skinBrand; } catch (e) { /* title stays */ }
          var siteTitle = document.querySelector(".site-title");
          if (siteTitle) siteTitle.textContent = skinName;
          var headerNote = document.querySelector(".site-header-note");
          if (headerNote) headerNote.style.display = "none";
          var aboutBtn = document.getElementById("gateAppAboutBtn");
          if (aboutBtn) aboutBtn.textContent = skinBrand;
          destinationMenu.setAttribute("aria-label", skinName + " destinations");
          // About dialog skinning (2026-11-18): the dialog is static
          // Sexcapades copy in the HTML, like the app About. Skin it at
          // runtime the same way the app does — title from the skin
          // brand, description from the skin JSON's `about` field. The
          // tally brand swaps to Flex.Capades.IO on vanilla (the app's
          // rule). The sex gate never runs this branch, so its copy is
          // unchanged by construction.
          var gateAboutTitle = document.getElementById("gateAboutTitle");
          if (gateAboutTitle) gateAboutTitle.textContent = "About " + skinBrand;
          var gateCloseAbout = document.getElementById("gateCloseAbout");
          if (gateCloseAbout) gateCloseAbout.setAttribute("aria-label", "Close About " + skinBrand);
          document.querySelectorAll(".sx-tally-brand").forEach(function (b) { b.textContent = "Flex.Capades.IO"; });
          // Description: fetch the skin JSON (same relative path the app
          // uses from /hosted/) and write its `about` field, the skin
          // name in a leading .sx-brand span. Any failure — fetch error
          // or no `about` field — leaves the hardcoded Sexcapades copy.
          (function () {
            var descEl = document.getElementById("gateAboutDescription");
            if (!descEl) return;
            var skinId = skinName.toLowerCase();
            fetch("data/skins/" + skinId + ".json").then(function (r) {
              if (!r.ok) throw new Error("skin file not found: data/skins/" + skinId + ".json");
              return r.json();
            }).then(function (data) {
              var aboutText = data && typeof data.about === "string" ? data.about : "";
              if (!aboutText) return;
              var tail = aboutText;
              if (tail.indexOf(skinName) === 0) tail = tail.slice(skinName.length);
              descEl.innerHTML = "";
              var nameSpan = document.createElement("span");
              nameSpan.className = "sx-brand";
              nameSpan.textContent = skinName;
              descEl.appendChild(nameSpan);
              descEl.appendChild(document.createTextNode(tail));
            }).catch(function () { /* keep the static Sexcapades copy */ });
          })();
          // The compare page exists only for skins with comparison data
          // (Sexcapades and Poliscapades). Hide the gate's Compare link
          // on every other skin. (Jason, 2026-11-17.)
          if (gateSkinPrefix !== "polis") {
            var compareItem = document.getElementById("gateCompareLinkItem");
            if (compareItem) compareItem.style.display = "none";
          }
        } else if (gateSkinPrefix !== "sex") {
          var hasReturn = false;
          try { hasReturn = !!new URLSearchParams(window.location.search).get("return"); } catch (e) { hasReturn = false; }
          if (!hasReturn) window.location.replace("/picker.html");
        }

        // When this host does not already name the skin (flex, localhost,
        // or a different vanilla subdomain), carry it onto the app links.
        // The app's ?skin= value is the full id (aesthcapades), which is
        // the gate's display name lowercased. A sex host already selects
        // Sexcapades, so its links stay bare.
        (function stampSkinOnAppLinks() {
          if (!gateSkinPrefix || !GATE_SKINS[gateSkinPrefix]) return;
          var host = "";
          try { host = window.location.hostname.toLowerCase(); } catch (e) { host = ""; }
          var hostPrefix = "";
          if (host === "sexcapades.io" || host === "www.sexcapades.io" || host === "sex.capades.io" || host === "www.sex.capades.io") hostPrefix = "sex";
          else if (/\.capades\.io$/.test(host)) hostPrefix = host.split(".")[0];
          if (hostPrefix === gateSkinPrefix) return;
          var q = "skin=" + encodeURIComponent(GATE_SKINS[gateSkinPrefix][0].toLowerCase());
          destinationUrls.app = "/hosted/app.html?" + q;
          document.querySelectorAll('a[href*="/hosted/app.html"]').forEach(function (a) {
            var href = a.getAttribute("href") || "";
            var hash = "";
            var i = href.indexOf("#");
            if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
            if (href.indexOf("skin=") === -1) href += (href.indexOf("?") >= 0 ? "&" : "?") + q;
            a.setAttribute("href", href + hash);
          });
        })();

        var initialDeepLinkDestination = getDeepLinkDestination();
        var previousGatePass = hasPreviousGatePass();

        // A vanilla skin has no age gate: the gate page is the skin's front
        // door, so the destinations open straight away. No verification is
        // recorded and no gate-passed event is sent — there is no gate to pass.
        if (isVanillaSkinGate) revealDestinations();

        // Self-heal: if either store kept the pass, rewrite both. A returning
        // visitor whose cookie survived but whose localStorage was cleared (or
        // the reverse) would otherwise lose the gate skip the next time the
        // surviving store is cleared too.
        if (previousGatePass) markAgeVerified();

        // A returning visitor bounced here by the app carries a return URL
        // with verified=1: send them straight back before any other branch.
        if (previousGatePass) {
          var returnDestination = getReturnDestination();
          if (returnDestination) {
            window.location.replace(returnDestination);
            return;
          }
        }

        if (initialDeepLinkDestination && previousGatePass) {
          window.location.replace(initialDeepLinkDestination);
          return;
        }

        // Returning verified visitors skip the confirmation panel entirely:
        // flyer referrals go straight to Quick Start (same as clicking Enter),
        // everyone else lands on the destination menu.
        if (previousGatePass) {
          if (isFlyerReferral) {
            window.location.replace(destinationUrls.quickstart);
            return;
          }

          revealDestinations();
        }

        enterButton.addEventListener('click', function () {
          var deepLinkDestination = getDeepLinkDestination();

          markAgeVerified();
          sendGatePassedEvent();

          var returnDestination = getReturnDestination();
          if (returnDestination) {
            window.location.assign(returnDestination);
            return;
          }

          if (deepLinkDestination) {
            window.location.assign(deepLinkDestination);
            return;
          }

          if (isFlyerReferral) {
            window.location.assign(destinationUrls.quickstart);
            return;
          }

          if (window.sxGateMusicAutoPlay) window.sxGateMusicAutoPlay();
          revealDestinations();
          var nextStop = destinationMenu.querySelector('#appViewTrigger, a, button');
          if (nextStop) nextStop.focus();
        });

        // App view pull-down menu: anchored to the "App" button, drops
        // down from it, closes on outside click and on Escape. Entries are
        // plain links, so choosing one navigates exactly as before.
        if (appViewTrigger && appViewMenu) {
          var appViewItems = Array.prototype.slice.call(appViewMenu.querySelectorAll('a'));

          function closeAppViewMenu() {
            appViewMenu.hidden = true;
            appViewTrigger.setAttribute('aria-expanded', 'false');
          }

          function openAppViewMenu() {
            appViewMenu.hidden = false;
            appViewTrigger.setAttribute('aria-expanded', 'true');
          }

          appViewTrigger.addEventListener('click', function () {
            if (appViewMenu.hidden) openAppViewMenu();
            else closeAppViewMenu();
          });

          // Keyboard: ArrowDown/ArrowUp on the trigger opens the menu and
          // moves focus into it; arrows then move between items (wrapping),
          // and Escape closes the menu and returns focus to the trigger.
          appViewTrigger.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            if (appViewMenu.hidden) openAppViewMenu();
            var item = event.key === 'ArrowDown' ? appViewItems[0] : appViewItems[appViewItems.length - 1];
            if (item) item.focus();
          });

          appViewMenu.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
              closeAppViewMenu();
              appViewTrigger.focus();
              return;
            }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            var index = appViewItems.indexOf(document.activeElement);
            if (event.key === 'ArrowDown') {
              index = index < 0 ? 0 : (index + 1) % appViewItems.length;
            } else {
              index = index < 0 ? appViewItems.length - 1 : (index - 1 + appViewItems.length) % appViewItems.length;
            }
            if (appViewItems[index]) appViewItems[index].focus();
          });

          document.addEventListener('click', function (event) {
            if (!appViewMenu.hidden &&
                !appViewMenu.contains(event.target) &&
                !appViewTrigger.contains(event.target)) {
              closeAppViewMenu();
            }
          });

          document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !appViewMenu.hidden) {
              closeAppViewMenu();
              appViewTrigger.focus();
            }
          });
        }


        // Also wire docsViewMenu in destination header
        (function() {
          var docsTrigger = document.getElementById('docsViewTrigger');
          var docsMenu = document.getElementById('docsViewMenu');
          if (!docsTrigger || !docsMenu) return;
          var glossaryTrigger = document.getElementById('docsGlossaryTrigger');
          var glossaryFlyout = document.getElementById('docsGlossaryFlyout');
          var faqTrigger = document.getElementById('docsFaqTrigger');
          var faqFlyout = document.getElementById('docsFaqFlyout');
          var openFlyoutEl = null;
          var openFlyoutTrigger = null;
          var items = Array.prototype.slice.call(docsMenu.querySelectorAll('a, .docs-submenu-trigger'));
          // Flyouts live outside the scrolling Docs menu (position: fixed,
          // placed by script) so the menu's overflow cannot clip them.
          function positionFlyout(trigger, flyout) {
            var row = trigger.getBoundingClientRect();
            var menu = docsMenu.getBoundingClientRect();
            var vw = window.innerWidth;
            var vh = window.innerHeight;
            var fw = flyout.offsetWidth;
            var fh = flyout.offsetHeight;
            var left = menu.right + 4;
            var top = row.top;
            // Flip to the left when there is no room on the right.
            if (left + fw > vw - 8) left = menu.left - fw - 4;
            // Narrow screen: no room on either side — put the flyout
            // below the Docs menu, same width, so the menu stays visible
            // and its other rows stay reachable.
            if (left < 8 || left + fw > vw - 8) {
              left = Math.min(menu.left, vw - menu.width - 8);
              left = Math.max(8, left);
              top = menu.bottom + 4;
              flyout.style.width = menu.width + 'px';
              fw = flyout.offsetWidth;
              fh = flyout.offsetHeight;
            } else {
              flyout.style.width = '';
            }
            // Keep the flyout inside the viewport vertically.
            if (top + fh > vh - 8) top = Math.max(8, vh - fh - 8);
            flyout.style.left = Math.max(8, left) + 'px';
            flyout.style.top = top + 'px';
          }
          function closeFlyout(focusTrigger) {
            if (!openFlyoutEl) return;
            var trigger = openFlyoutTrigger;
            openFlyoutEl.hidden = true;
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            openFlyoutEl = null;
            openFlyoutTrigger = null;
            if (focusTrigger && trigger) trigger.focus();
          }
          function openFlyout(trigger, flyout) {
            if (openFlyoutEl === flyout) { closeFlyout(false); return; }
            closeFlyout(false);
            flyout.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
            openFlyoutEl = flyout;
            openFlyoutTrigger = trigger;
            positionFlyout(trigger, flyout);
            var first = flyout.querySelector('a');
            if (first) first.focus();
          }
          function repositionOpenFlyout() {
            if (openFlyoutEl && openFlyoutTrigger) positionFlyout(openFlyoutTrigger, openFlyoutEl);
          }
          function wireSubmenu(trigger, flyout) {
            if (!trigger || !flyout) return;
            trigger.addEventListener('click', function(e) {
              e.stopPropagation();
              openFlyout(trigger, flyout);
            });
            trigger.addEventListener('keydown', function(e) {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                openFlyout(trigger, flyout);
              }
            });
            flyout.addEventListener('keydown', function(e) {
              if (e.key === 'Escape' || e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                closeFlyout(true);
              }
            });
          }
          wireSubmenu(glossaryTrigger, glossaryFlyout);
          wireSubmenu(faqTrigger, faqFlyout);
          docsMenu.addEventListener('scroll', repositionOpenFlyout);
          window.addEventListener('resize', repositionOpenFlyout);
          function closeDocs() {
            closeFlyout(false);
            docsMenu.hidden = true;
            docsTrigger.setAttribute('aria-expanded', 'false');
          }
          function openDocs() {
            docsMenu.hidden = false;
            docsTrigger.setAttribute('aria-expanded', 'true');
          }
          docsTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (docsMenu.hidden) openDocs();
            else closeDocs();
          });
          docsTrigger.addEventListener('keydown', function(e) {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            e.preventDefault();
            if (docsMenu.hidden) openDocs();
            var item = e.key === 'ArrowDown' ? items[0] : items[items.length - 1];
            if (item) item.focus();
          });
          document.addEventListener('click', function(e) {
            if (!docsMenu.hidden && !docsMenu.contains(e.target) && !docsTrigger.contains(e.target)
                && !(openFlyoutEl && openFlyoutEl.contains(e.target))) {
              closeDocs();
            }
          });
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !docsMenu.hidden) {
              closeDocs();
              docsTrigger.focus();
            }
          });
        })();

      }());
    
/* ---- inline block 3 (document order) ---- */

(function(){var c=document.getElementById('odometer-digits-GATE');if(!c)return;
function render(n){try{var s=String(n).padStart(6,'0');c.innerHTML='';for(var i=0;i<s.length;i++){var d=document.createElement('div');d.className='odometer-digit';d.textContent=s[i];c.appendChild(d);}}catch(e){}}
try{
fetch('/hosted/api/collect.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'get_stats'})}).then(function(r){return r.json();}).then(function(d){render((d&&d.unique_visitors)||0);}).catch(function(){render(0);});
}catch(e){render(0);}})();
