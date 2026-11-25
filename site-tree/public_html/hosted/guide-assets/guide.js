/* ---- inline block 1 (document order) ---- */

    function showGuidePage(n, targetId) {
      document.querySelectorAll('.guide-page').forEach(function(p) {
        p.style.display = (p.getAttribute('data-page') == n) ? '' : 'none';
      });

      if (targetId) {
        window.requestAnimationFrame(function() {
          var target = document.getElementById(targetId);
          if (target) target.scrollIntoView({block:'start'});
          else window.scrollTo(0, 0);
        });
      } else {
        window.scrollTo(0, 0);
      }
    }

    function goToTOC() {
      showGuidePage(1, 'contents-title');
    }

    document.addEventListener('DOMContentLoaded', function() {
      var aboutTrigger = document.querySelector('.guide-about-trigger');
      var aboutDialog = document.getElementById('guide-about-dialog');
      var aboutClose = document.querySelector('.about-dialog-close');
      if (aboutTrigger && aboutDialog && aboutClose) {
        aboutTrigger.addEventListener('click', function() { aboutDialog.showModal(); });
        aboutClose.addEventListener('click', function() { aboutDialog.close(); });
        aboutDialog.addEventListener('click', function(event) {
          if (event.target === aboutDialog) aboutDialog.close();
        });
      }

      var mapCaptionTip = document.querySelector('.map-caption-tip');
      var mapTooltip = document.getElementById('mind-map-tooltip');
      if (mapCaptionTip && mapTooltip) {
        function showMapTooltip() { mapTooltip.hidden = false; }
        function hideMapTooltip() { mapTooltip.hidden = true; }
        mapCaptionTip.addEventListener('pointerenter', showMapTooltip);
        mapCaptionTip.addEventListener('pointerleave', function() {
          if (!mapCaptionTip.contains(document.activeElement)) hideMapTooltip();
        });
        mapCaptionTip.addEventListener('focusin', showMapTooltip);
        mapCaptionTip.addEventListener('focusout', function(event) {
          if (!mapCaptionTip.contains(event.relatedTarget)) hideMapTooltip();
        });
        mapCaptionTip.addEventListener('click', function(event) {
          if (!event.target.closest('a')) showMapTooltip();
        });
        document.addEventListener('pointerdown', function(event) {
          if (!mapCaptionTip.contains(event.target)) hideMapTooltip();
        });
      }

      // Browser-specific sample map formats: Firefox renders the interactive
      // SVGZ hypermap inline; other browsers get a low-res PNG thumbnail that
      // upgrades to the hi-res PNG inside the enlarge lightbox.
      // Per-skin map files: the Sexcapades guide shows the restored
      // originals (Adam's map lives with the canonical sample maps);
      // every other skin's guide shows that skin's own unrated map and
      // its flagship sample's map, captured from the app itself.
      var docSkin = window.__SX_DOC_SKIN || { prefix: 'sex' };
      var skinPrefix = docSkin.prefix || 'sex';
      var SKIN_FACTS = {
        polis:  { topics: 93, sample: 'Democratic Party platform' },
        fores:  { topics: 91, sample: 'Catholic creed' },
        philo:  { topics: 15, sample: 'Empiricism' },
        aesth:  { topics: 31, sample: 'Classicism' },
        voca:   { topics: 21, sample: 'The Purpose-Driven Calling' },
        tech:   { topics: 20, sample: 'The Accelerationist' },
        dharma: { topics: 28, sample: 'Theravada Buddhism' },
        theori: { topics: 31, sample: 'Formalism' },
        praxi:  { topics: 26, sample: 'The Bayesian' },
        quanta: { topics: 30, sample: 'Copenhagen interpretation' },
        experi: { topics: 31, sample: 'The Big Science Collider Physicist' },
        simul:  { topics: 29, sample: 'The Simulation Optimist' },
        matter: { topics: 29, sample: 'The Nuclear Advocate' },
        chem:   { topics: 40, sample: 'The Organic Chemist' },
        nous:   { topics: 39, sample: 'The Brain Chauvinist' },
        dance:  { topics: 73, sample: 'The Waltz Romantic' },
        quest:  { topics: 71, sample: 'The Forever GM' }
      };
      var MAP_FILES;
      if (skinPrefix === 'sex' || !SKIN_FACTS[skinPrefix]) {
        MAP_FILES = {
          unrated: { svgz: '/hosted/guide-assets/unrated-map.svgz', lowres: '/hosted/guide-assets/unrated-map-thumb.png', hires: '/hosted/guide-assets/unrated-map-full.png' },
          adam: { svgz: '/hosted/assets/sample-maps/adam-map.svgz', lowres: '/hosted/assets/sample-maps/adam-map-lowres.png', hires: '/hosted/assets/sample-maps/adam-map-hires.png' }
        };
      } else {
        MAP_FILES = {
          unrated: { svgz: null, lowres: '/hosted/guide-assets/maps/' + skinPrefix + '-unrated-thumb.png', hires: '/hosted/guide-assets/maps/' + skinPrefix + '-unrated-full.png' },
          adam: { svgz: null, lowres: '/hosted/guide-assets/maps/' + skinPrefix + '-sample-thumb.png', hires: '/hosted/guide-assets/maps/' + skinPrefix + '-sample-full.png' }
        };
      }
      var isFirefox = /firefox|fxios/i.test(navigator.userAgent);
      function resolveMapImage(mapImg) {
        var mapFiles = MAP_FILES[mapImg.getAttribute('data-map-key')];
        if (!mapFiles) return;
        if (isFirefox && mapFiles.svgz) mapImg.src = mapFiles.svgz;
        else if (mapImg.getAttribute('data-map-role') === 'full') mapImg.src = mapFiles.hires;
        else mapImg.src = mapFiles.lowres;
      }

      // Per-skin dressing: the QR codes point at this skin, the showcase
      // figures' links follow this skin's map files, and the captions name
      // this skin's topic count and sample.
      var guideQrImg = document.querySelector('img.guide-qr');
      if (guideQrImg) guideQrImg.src = '/hosted/guide-assets/qr/' + skinPrefix + '-guide.png';
      var appQrImg = document.querySelector('img.app-qr');
      if (appQrImg) appQrImg.src = '/hosted/guide-assets/qr/' + skinPrefix + '-app.png';
      document.querySelectorAll('figure').forEach(function(fig) {
        var figImg = fig.querySelector('img[data-map-key]');
        if (!figImg) return;
        var figFiles = MAP_FILES[figImg.getAttribute('data-map-key')];
        if (!figFiles) return;
        var openLink = fig.querySelector('figcaption a:not(.map-svgz-download)');
        if (openLink) openLink.setAttribute('href', figFiles.hires);
        var dlLink = fig.querySelector('a.map-svgz-download');
        if (dlLink) {
          if (figFiles.svgz) dlLink.setAttribute('href', figFiles.svgz);
          else {
            dlLink.style.display = 'none';
            var sep = dlLink.previousSibling;
            if (sep && sep.nodeType === 3 && sep.textContent.indexOf('\u00b7') !== -1) sep.textContent = '';
          }
        }
      });
      var skinFacts = SKIN_FACTS[skinPrefix];
      if (skinFacts) {
        document.querySelectorAll('img[data-map-key="unrated"]').forEach(function(uImg) {
          uImg.alt = uImg.alt.replace('404-topic', skinFacts.topics + '-topic');
        });
        var unratedThumb = document.querySelector('img[data-map-key="unrated"][data-map-role="thumb"]');
        var unratedFig = unratedThumb ? unratedThumb.closest('figure') : null;
        var capTip = unratedFig ? unratedFig.querySelector('.map-caption-tip') : null;
        if (capTip) capTip.childNodes.forEach(function(node) {
          if (node.nodeType === 3) node.textContent = node.textContent.replace('404-topic', skinFacts.topics + '-topic');
        });
        var adamThumb = document.querySelector('img[data-map-key="adam"][data-map-role="thumb"]');
        var adamFig = adamThumb ? adamThumb.closest('figure') : null;
        if (adamFig) {
          var trigger = adamFig.querySelector('.map-dialog-trigger');
          if (trigger) trigger.setAttribute('aria-label', trigger.getAttribute('aria-label').replace('Adam\u2019s', skinFacts.sample + '\u2019s'));
          var cap = adamFig.querySelector('figcaption');
          if (cap) cap.childNodes.forEach(function(node) {
            if (node.nodeType === 3) node.textContent = node.textContent.replace('Adam\u2019s rated sync hypermap', skinFacts.sample + '\u2019s rated sync hypermap');
          });
        }
        var adamDialog = document.getElementById('adam-map-lightbox');
        if (adamDialog) adamDialog.setAttribute('aria-label', adamDialog.getAttribute('aria-label').replace('Adam rated', skinFacts.sample + ' rated'));
      }
      document.querySelectorAll('img[data-map-key][data-map-role="thumb"]').forEach(resolveMapImage);

      document.querySelectorAll('.map-dialog-trigger').forEach(function(mapTrigger) {
        var mapDialog = document.getElementById(mapTrigger.getAttribute('data-map-dialog'));
        if (!mapDialog) return;
        var mapClose = mapDialog.querySelector('.map-lightbox-close');
        mapTrigger.addEventListener('click', function() {
          var fullMapImg = mapDialog.querySelector('img[data-map-key][data-map-role="full"]');
          if (fullMapImg && !fullMapImg.hasAttribute('data-map-resolved')) {
            resolveMapImage(fullMapImg);
            fullMapImg.setAttribute('data-map-resolved', '');
          }
          if (!mapDialog.open) mapDialog.showModal();
        });
        if (mapClose) mapClose.addEventListener('click', function() { mapDialog.close(); });
        mapDialog.addEventListener('click', function(event) {
          if (event.target === mapDialog) mapDialog.close();
        });
      });

      var hankyImage = document.querySelector('.hanky-page-content img');
      var hankyZoomIn = document.querySelector('.hanky-zoom-in');
      var hankyZoomOut = document.querySelector('.hanky-zoom-out');
      var hankyZoom = 100;
      function setHankyZoom(value) {
        hankyZoom = Math.max(100, Math.min(250, value));
        hankyImage.style.width = hankyZoom + '%';
        hankyZoomOut.disabled = hankyZoom === 100;
        hankyZoomIn.disabled = hankyZoom === 250;
      }
      if (hankyImage && hankyZoomIn && hankyZoomOut) {
        hankyZoomIn.addEventListener('click', function() { setHankyZoom(hankyZoom + 25); });
        hankyZoomOut.addEventListener('click', function() { setHankyZoom(hankyZoom - 25); });
        setHankyZoom(100);
      }

      var anchorToPage = {
        'contents':1,
        'contents-title':1,
        'find-your-people':'community',
        'find-your-people-title':'community',
        'system-requirements':2,
        'system-requirements-title':2,
        'see-it-in-action':3,
        'see-it-in-action-title':3,
        'first-look-title':3,
        'flex-gate':3,
        'first-run-onboarding':4,
        'first-run-onboarding-title':4,
        'flex-quickstart':4,
        'five-minute-solo-story':5,
        'five-minute-solo-story-title':5,
        'tests-and-imports':6,
        'tests-and-imports-title':6,
        'step-1-title':6,
        'flex-roster-packs':6,
        'flex-sync-cards':6,
        'create-a-profile':7,
        'create-a-profile-title':7,
        'step-2-title':7,
        'flex-profiles':7,
        'rate-the-map':8,
        'rate-the-map-title':8,
        'step-3-title':8,
        'flex-where-you-rate':8,
        'flex-cross-slider':8,
        'flex-leaning-and-appetite':8,
        'flex-heat':11,
        'flex-intensity':8,
        'flex-veil':8,
        'flex-hot-list':8,
        'youre-not-alone':8,
        'youre-not-alone-title':8,
        'hanky-code':9,
        'hanky-code-title':9,
        'hanky-dialog-title':9,
        'select-with-net':10,
        'select-with-net-title':10,
        'step-4-title':10,
        'flex-pair-views':10,
        'flex-groups':10,
        'flex-shared-appetite':10,
        'flex-palimpsest':10,
        'flex-what-minus-is-for':10,
        'generate-a-scene':11,
        'generate-a-scene-title':11,
        'step-5-title':11,
        'flex-scene-setter':11,
        'flex-scribe':11,
        'scene-sentinel':'sentinel',
        'scene-sentinel-title':'sentinel',
        'share-and-export':12,
        'share-and-export-title':12,
        'step-6-title':12,
        'sharing-and-export':12,
        'low-resolution-export':12,
        'flex-privacy':12,
        'colophon':13,
        'colophon-title':13,
        'flex-analytics':13
      };

      function hashTarget() {
        var rawHash = window.location.hash.replace(/^#/, '');
        if (!rawHash) return '';
        try { rawHash = decodeURIComponent(rawHash); } catch (error) {}
        var candidates = rawHash.split('#');
        for (var index = candidates.length - 1; index >= 0; index -= 1) {
          if (anchorToPage[candidates[index]]) return candidates[index];
        }
        return '';
      }

      function renderHashRoute() {
        var target = hashTarget();
        if (target) showGuidePage(anchorToPage[target], target);
        else showGuidePage(1);
      }

      document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        var target = decodeURIComponent(link.getAttribute('href').slice(1));
        var pageNumber = anchorToPage[target];
        if (!pageNumber) return;
        link.addEventListener('click', function(event) {
          event.preventDefault();
          var routeTarget = link.classList.contains('toc-target') ? 'contents-title' : target;
          var nextHash = '#' + encodeURIComponent(routeTarget);
          if (window.location.hash === nextHash) renderHashRoute();
          else window.location.hash = nextHash;
        });
      });

      window.addEventListener('hashchange', renderHashRoute);
      renderHashRoute();
    });
  
/* ---- inline block 2 (document order) ---- */

    (function () {
      var counter = document.querySelector('.guide-view-counter');
      if (!counter) return;
      var number = counter.querySelector('.guide-view-counter-number');
      var storageKey = 'sexcapades_visitor_uuid';
      var uuid = '';
      try { uuid = localStorage.getItem(storageKey) || ''; } catch (error) {}
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
        uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0;
              var v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
        try { localStorage.setItem(storageKey, uuid); } catch (error) {}
      }
      fetch('counter.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
        body:'uuid=' + encodeURIComponent(uuid),
        cache:'no-store',
        credentials:'same-origin'
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Counter unavailable');
          return response.json();
        })
        .then(function (data) {
          if (data && typeof data.visitors === 'number') {
            number.textContent = data.visitors.toLocaleString();
          }
        })
        .catch(function () {});
    })();
  
/* ---- inline block 3 (document order) ---- */

(function(){var c=document.getElementById('odometer-digits-GUIDE');if(!c)return;
function render(n){try{var s=String(n).padStart(6,'0');c.innerHTML='';for(var i=0;i<s.length;i++){var d=document.createElement('div');d.className='odometer-digit';d.textContent=s[i];c.appendChild(d);}}catch(e){}}
try{
fetch('/hosted/api/collect.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'get_stats'})}).then(function(r){return r.json();}).then(function(d){render((d&&d.unique_visitors)||0);}).catch(function(){render(0);});
}catch(e){render(0);}})();
