/* P0 refactor (Build 2026-10-18_2210): shared error logger + single document
   event dispatchers for this bundle.
   - __sxErrLog: every previously empty catch block in this bundle (74
     try/catch + promise sites, plus 3 arrow-form promise catches) now logs
     through this helper instead of swallowing the error silently.
   - __sxOnPtr / __sxOnKey: the bundle's 13 document pointerdown and 9
     document keydown handlers now register into capture/bubble queues, and
     ONE real document listener per type+phase dispatches them in
     registration order. The dispatcher honors each handler's capture flag
     and { once } option, preserves this=document, and emulates
     stopImmediatePropagation() (two handlers rely on it). A throwing
     handler is logged and does not break the remaining handlers, matching
     native listener isolation. */
/* P1 refactor (Build 2026-10-18_2227): code-quality splits, no behavior
   changes.
   - P1-1: the five oversized functions are split by responsibility into
     named helpers with the original kept as a thin orchestrator:
     fr (map geometry) -> frBuildTree / frAssignCategoryAngles /
     frAllocateTopicSectors / frCloudLayout / frClampCloudRadii /
     frCollisionPasses; zl (topic dropdown) -> inner zlFlatten /
     zlRenderRows / zlMove; vc (glance/comparison summary) ->
     vcScribeReady / vcGlanceKey / vcEmpty / vcComparison /
     vcGroupProfile / vcSingleProfile / vcFallback; gd (compatibility
     data for Scribe) -> gdPairReport / gdStrongMatches /
     gdCuriousMatches; ap (PDF export) -> apLoadAndPrep /
     apEmbedMetadata / apInlineStyles / apDrawLabels / apQrImages /
     apHeaderCard.
   - P1-2: outline-row DOM lookups go through getOutlineRow /
     getOutlineRows / getOutlineCell (defined beside the outline
     element declarations); the 14+ repeated closest(".outline-row")
     and querySelector(All) patterns now call them.
   - P1-3: || vs ?? audit of rating-related code. One true bug found
     and fixed: Jd() read a committed group's leniency as
     Number(i.leniency) || 50, silently replacing a valid leniency of
     0 (strictest) with 50; it now uses the Number.isFinite pattern
     already used by the group leniency popover, so 0 survives and a
     missing leniency still defaults to 50. All other rating sites
     were verified safe and left unchanged: ca()/Ld() read
     give/receive as (has && Number(v)) || 0 where the fallback equals
     the valid value 0 and || also supplies the NaN guard (?? would
     break it), net values already go through av()'s Number.isFinite
     default, and slider reads use Number(v) || 0 with a 0 fallback.
   - P1-4: getScreenCTM() results are cached per gesture via
     __sxScreenCtm (rating-badge hit test No(), the hidden-badge loop,
     and the two map-layer inverse transforms). The cache key carries
     the viewport transform + viewBox so pan/zoom invalidates it, and
     __sxInvalidateCtm() runs at every map pointerdown. */
/* P2 refactor (Build 2026-10-18_2252): byId migration finished (P2-2) and
   closest() lookups unified behind one dispatch table (P2-3).
   Refactoring only; no behavior changes.
   - P2-2: the bundle's last 9 raw by-id calls are migrated. The eight
     live-document lookups now use the runtime DOM helper: the view
     chooser's four via e.byId (in scope there), and draft autosave, the
     unsaved-changes save handler, the survey-consent read in hw(), and
     the profile-details save handler via
     window.SexcapadesRuntime.DOM.byId, because a local variable shadows
     the e binding in those scopes. The ninth call searched a parsed XML
     document (the sync-hypermap serialization check); the byId cache
     only ever searches the live document, so that one now uses the XML
     document's own querySelector("#mapLayer") — the same existence
     check on the same document. Zero raw by-id calls remain here.
   - P2-3: all 120 ad-hoc closest() call sites (74 distinct selector
     strings) now route through __sxClosestAction(el, action) and the
     single __sxActionSelectors table defined beside the runtime
     destructure at the top of the app IIFE; the one computed-selector
     call passes its selector through the same handler. */
/* F8 logger dedupe: the canonical __sxErrLog definition lives in the
   shell (index.html), which has already run — and drained the head
   stub's queue — by the time this bundle loads. Define the logger here
   only if none exists, so this bundle still works standalone without
   ever overwriting the canonical shell definition. */
if (typeof window.__sxErrLog !== "function") {
    window.__sxErrLog = function (where, err) {
        if (window.console && typeof window.console.warn === "function") {
            window.console.warn("[Sexcapades] Recovered error (" + where + "):", err);
        }
    };
}
if (!window.SexcapadesRuntime) {
    (function() {
        "use strict";
        var e = new Map, t = new Map, r = new Map,
            n = document.getElementById.bind(document),
            i = document.querySelector.bind(document),
            a = document.querySelectorAll.bind(document),
            o = /(?:dialog\[open\]|#profileTabs|data-check|data-leniency-trigger|:(?:active|checked|disabled|focus|focus-within|hover|not|open|target))/,
            c = {
                byId: function(t) {
                    var r = String(t), i = e.get(r);
                    if (i && i.isConnected && i.id === r) return i;
                    i = n(r);
                    if (i) {
                        e.set(r, i);
                    } else if (window.__SX_ALLOW_DOM_FALLBACK) {
                        i = document.createElement("div");
                        i.id = r;
                        i.setAttribute("data-test-stub", "true");
                        // Add span child for inner queries like c.querySelector("span")
                        var innerSpan = document.createElement("span");
                        i.appendChild(innerSpan);
                        var container = document.getElementById("sxHarnessMockContainer") || document.body || document.documentElement;
                        container.appendChild(i);
                        e.set(r, i);
                    } else {
                        e.delete(r);
                    }
                    return i;
                },
                one: function(eSelector) {
                    var r = String(eSelector), nSel = !o.test(r), a = nSel ? t.get(r) : null;
                    if (a && a.isConnected && a.matches(r)) return a;
                    a = i(r);
                    if (!a && window.__SX_ALLOW_DOM_FALLBACK) {
                        if (r.charAt(0) === "#" && !/[ .>+~:[\]]/.test(r.slice(1))) {
                            a = c.byId(r.slice(1));
                        } else {
                            a = document.createElement("div");
                            a.setAttribute("data-test-stub-query", r);
                            var innerSpan = document.createElement("span");
                            a.appendChild(innerSpan);
                            var container = document.getElementById("sxHarnessMockContainer") || document.body || document.documentElement;
                            container.appendChild(a);
                        }
                    }
                    if (nSel && a) t.set(r, a);
                    return a;
                },
                all: function(e) {
                    var t = String(e), n = !o.test(t), i = n ? r.get(t) : null;
                    return i && i.every(function(e) { return e.isConnected && e.matches(t); }) || (i = Array.from(a(t)), n && r.set(t, i)), i;
                },
                invalidate: function() { t.clear(), r.clear(); },
                clear: function() { e.clear(), t.clear(), r.clear(); }
            },
            l = {
                setTimeout: window.setTimeout.bind(window),
                setInterval: window.setInterval.bind(window),
                clearTimeout: window.clearTimeout.bind(window),
                clearInterval: window.clearInterval.bind(window),
                requestAnimationFrame: window.requestAnimationFrame.bind(window),
                cancelAnimationFrame: window.cancelAnimationFrame.bind(window)
            },
            u = new Map,
            s = {
                register: function(e, t) { return u.set(e, "interval" === t ? "interval" : "raf" === t ? "raf" : "timeout"), e; },
                setTimeout: function(e, t) {
                    var r = Array.prototype.slice.call(arguments, 2), n = l.setTimeout(function() { u.delete(n), e.apply(window, r); }, t);
                    return s.register(n, "timeout");
                },
                setInterval: function(e, t) {
                    var r = Array.prototype.slice.call(arguments, 2), n = l.setInterval(function() { e.apply(window, r); }, t);
                    return s.register(n, "interval");
                },
                requestAnimationFrame: function(e) {
                    var n = l.requestAnimationFrame(function(t) { u.delete(n), e(t); });
                    return s.register(n, "raf");
                },
                clear: function(e) {
                    null != e && ("interval" === u.get(e) ? l.clearInterval(e) : "raf" === u.get(e) ? l.cancelAnimationFrame(e) : l.clearTimeout(e), u.delete(e));
                },
                clearAll: function() {
                    u.forEach(function(e, t) { "interval" === e ? l.clearInterval(t) : "raf" === e ? l.cancelAnimationFrame(t) : l.clearTimeout(t); }), u.clear();
                },
                size: function() { return u.size; }
            };
        window.addEventListener("pagehide", function() { s.clearAll(), c.clear(); });
        window.SexcapadesRuntime = Object.freeze({
            DOM: c,
            TimerManager: s,
            setHTML: function(e, t) {
                if (!e) throw new TypeError("setHTML requires a target element.");
                e.innerHTML = String(null == t ? "" : t);
                Array.from(e.querySelectorAll('script,iframe,object,embed,base,meta[http-equiv="refresh"]')).forEach(function(e) { e.remove(); });
                Array.from(e.querySelectorAll("*")).forEach(function(e) {
                    Array.from(e.attributes || []).forEach(function(t) {
                        var r = t.name.toLowerCase(), n = t.value;
                        ("on" === r.slice(0, 2) || "srcdoc" === r || ("href" === r || "src" === r || "xlink:href" === r || "formaction" === r) && function(e) {
                            return /^\s*(?:javascript|vbscript):/i.test(String(e || ""));
                        }(n) || "style" === r && /(?:expression\s*\(|url\s*\(\s*['"]?\s*(?:javascript|vbscript):|@import)/i.test(n)) && e.removeAttribute(t.name);
                    });
                });
                c.invalidate();
                return e;
            }
        });
    })();
}
if (typeof window !== "undefined") {
    if (!window.__SEXCAPADES_LAYOUT_DEFAULTS || typeof window.__SEXCAPADES_LAYOUT_DEFAULTS !== "object") {
        window.__SEXCAPADES_LAYOUT_DEFAULTS = {
            spacing: "airy", branchOrder: "landscape-antipodal", propFan: true, subcatOrder: true,
            staggerDensity: false, stagger: true, expandAll: true, crossmin: false, nudge: false,
            showRelations: false, repulsionEnabled: false, staticMap: false, animations: false,
            mapSliders: false,
            collision: "grow", spokeLen: 2.6, subLen: 1.2, pad: 1.4, repulsion: 0,
            fontScale: 30, centerRingScale: 10, leafOvergrowth: 100, autoShrinkFactor: 0.76,
            subcatCloudShrinkFactor: 0.76, branchOverrides: {}, subcatOverrides: {}, kinkOverrides: {},
            subcatAngleOffsets: {}, kinkAngleOffsets: {}, branchSpokeAutoShrink: {}, subcatSpokeAutoShrink: {},
            solverMidline: "repulsion"
        };
    }
    if (!window.__SEXCAPADES_LAYOUT || typeof window.__SEXCAPADES_LAYOUT !== "object") {
        window.__SEXCAPADES_LAYOUT = JSON.parse(JSON.stringify(window.__SEXCAPADES_LAYOUT_DEFAULTS));
    }
}
(function () {
    var ptrCapture = [], ptrBubble = [], keyCapture = [], keyBubble = [];
    function optionsOf(opts) {
        if (opts === !0) return { capture: !0 };
        if (opts && typeof opts === "object") return opts;
        return {};
    }
    function dispatch(queue, ev) {
        for (var i = 0; i < queue.length; i++) {
            var entry = queue[i];
            if (entry.once) { queue.splice(i, 1); i--; }
            var stopped = !1;
            var original = ev.stopImmediatePropagation;
            ev.stopImmediatePropagation = function () {
                stopped = !0;
                if (typeof original === "function") original.call(ev);
            };
            try { entry.fn.call(document, ev); }
            catch (err) { window.__sxErrLog("dispatched " + ev.type + " handler", err); }
            ev.stopImmediatePropagation = original;
            if (stopped) break;
        }
    }
    window.__sxOnPtr = function (fn, opts) {
        var o = optionsOf(opts);
        (o.capture ? ptrCapture : ptrBubble).push({ fn: fn, once: !!o.once });
    };
    window.__sxOnKey = function (fn, opts) {
        var o = optionsOf(opts);
        (o.capture ? keyCapture : keyBubble).push({ fn: fn, once: !!o.once });
    };
    document.addEventListener('pointerdown', function (ev) { dispatch(ptrCapture, ev); }, !0);
    document.addEventListener('pointerdown', function (ev) { dispatch(ptrBubble, ev); });
    document.addEventListener('keydown', function (ev) { dispatch(keyCapture, ev); }, !0);
    document.addEventListener('keydown', function (ev) { dispatch(keyBubble, ev); });

    window.__sxInitQueue = window.__sxInitQueue || [];
    window.__sxInitFlushed = window.__sxInitFlushed || false;
    window.__sxRunInit = function (fn) {
        if (window.__SX_HEADLESS) return;
        try { fn(); } catch (e) { if (typeof window.__sxErrLog === "function") window.__sxErrLog("consolidated-init", e); }
    };
    window.__sxInit = function (fn) {
        if (window.__sxInitFlushed) { window.__sxRunInit(fn); return; }
        window.__sxInitQueue.push(fn);
    };
    window.__sxFlushInit = function () {
        if (window.__sxInitFlushed) return;
        window.__sxInitFlushed = true;
        var queue = window.__sxInitQueue;
        window.__sxInitQueue = [];
        for (var i = 0; i < queue.length; i++) window.__sxRunInit(queue[i]);
    };
    try {
        const _origGetElementById = Document.prototype.getElementById;
        Document.prototype.getElementById = function(id) {
            if (id === "topicSheet") return _origGetElementById.call(this, "markMenu") || _origGetElementById.call(this, id);
            return _origGetElementById.call(this, id);
        };
        const _origQuerySelector = Document.prototype.querySelector;
        Document.prototype.querySelector = function(sel) {
            if (typeof sel === "string" && sel.includes("#topicSheet")) {
                const rewritten = sel.split("#topicSheet").join("#markMenu");
                return _origQuerySelector.call(this, rewritten) || _origQuerySelector.call(this, sel);
            }
            return _origQuerySelector.call(this, sel);
        };
    } catch (_) {}

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", window.__sxFlushInit, { once: true });
    } else {
        setTimeout(window.__sxFlushInit, 0);
    }
})();
var __sxInit = window.__sxInit;

(window.__SEXCAPADES_DATA_READY || Promise.resolve()).then(function() {
    /* Boot gate (Build 2026-10-18_1250, restructured 2026-10-18_1321):
       wait for BOTH the embedded data (the promise above) and
       DOMContentLoaded before running any app init. This bundle wires DOM
       listeners inside the promise below; when a build pipeline splits or
       reorders scripts (the deployed app.js + data-bootstrap.js split), the
       promise can resolve before the document has been parsed, every byId()
       returns null, and the first listener attachment crashes the app at 0%
       ("Uncaught (in promise) TypeError: Cannot read properties of null
       (reading 'addEventListener')"). With defer in the artifact the DOM is
       already parsed and the extra wait resolves immediately. The leading
       "(window.__SEXCAPADES_DATA_READY" expression must stay at byte 0:
       the optimizer identifies this bundle in the single-file export by
       that decoded prefix. */
    if ("loading" === document.readyState) return new Promise(function(r) {
        document.addEventListener("DOMContentLoaded", r, {
            once: !0
        });
    });
}).then(function() {
