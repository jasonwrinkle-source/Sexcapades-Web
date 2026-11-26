(function () {
  "use strict";
  if (!window.SexcapadesRuntime) {
    var byIdCache = new Map();
    var oneCache = new Map();
    var allCache = new Map();
    var getById = document.getElementById.bind(document);
    var queryOne = document.querySelector.bind(document);
    var queryAll = document.querySelectorAll.bind(document);
    var dynamicSelectorRe = /(?:dialog\[open\]|#profileTabs|data-check|data-leniency-trigger|:(?:active|checked|disabled|focus|focus-within|hover|not|open|target))/;
    var DOM = {
      byId: function (id) {
        var key = String(id);
        var el = byIdCache.get(key);
        if (el && el.isConnected && el.id === key) return el;
        el = getById(key);
        if (el) {
          byIdCache.set(key, el);
        } else if (window.__SX_ALLOW_DOM_FALLBACK) {
          el = document.createElement("div");
          el.id = key;
          el.setAttribute("data-test-stub", "true");
          el.appendChild(document.createElement("span"));
          var container = document.getElementById("sxHarnessMockContainer") || document.body || document.documentElement;
          container.appendChild(el);
          byIdCache.set(key, el);
        } else {
          byIdCache.delete(key);
        }
        return el;
      },
      one: function (selector) {
        var key = String(selector);
        var cacheable = !dynamicSelectorRe.test(key);
        var el = cacheable ? oneCache.get(key) : null;
        if (el && el.isConnected && el.matches(key)) return el;
        el = queryOne(key);
        if (!el && window.__SX_ALLOW_DOM_FALLBACK) {
          if (key.charAt(0) === "#" && !/[ .>+~:[\]]/.test(key.slice(1))) {
            el = DOM.byId(key.slice(1));
          } else {
            el = document.createElement("div");
            el.setAttribute("data-test-stub-query", key);
            el.appendChild(document.createElement("span"));
            var container = document.getElementById("sxHarnessMockContainer") || document.body || document.documentElement;
            container.appendChild(el);
          }
        }
        if (cacheable && el) oneCache.set(key, el);
        return el;
      },
      all: function (selector) {
        var key = String(selector);
        var cacheable = !dynamicSelectorRe.test(key);
        var list = cacheable ? allCache.get(key) : null;
        if (list && list.every(function (el) { return el.isConnected && el.matches(key); })) return list;
        list = Array.from(queryAll(key));
        if (cacheable) allCache.set(key, list);
        return list;
      },
      invalidate: function () { oneCache.clear(); allCache.clear(); },
      clear: function () { byIdCache.clear(); oneCache.clear(); allCache.clear(); }
    };
    var nativeTimers = {
      setTimeout: window.setTimeout.bind(window),
      setInterval: window.setInterval.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
      clearInterval: window.clearInterval.bind(window),
      requestAnimationFrame: window.requestAnimationFrame.bind(window),
      cancelAnimationFrame: window.cancelAnimationFrame.bind(window)
    };
    var activeTimers = new Map();
    var TimerManager = {
      register: function (id, kind) {
        activeTimers.set(id, kind === "interval" ? "interval" : kind === "raf" ? "raf" : "timeout");
        return id;
      },
      setTimeout: function (fn, delay) {
        var args = Array.prototype.slice.call(arguments, 2);
        var id = nativeTimers.setTimeout(function () { activeTimers.delete(id); fn.apply(window, args); }, delay);
        return TimerManager.register(id, "timeout");
      },
      setInterval: function (fn, delay) {
        var args = Array.prototype.slice.call(arguments, 2);
        var id = nativeTimers.setInterval(function () { fn.apply(window, args); }, delay);
        return TimerManager.register(id, "interval");
      },
      requestAnimationFrame: function (fn) {
        var id = nativeTimers.requestAnimationFrame(function (ts) { activeTimers.delete(id); fn(ts); });
        return TimerManager.register(id, "raf");
      },
      clear: function (id) {
        if (id != null) {
          var kind = activeTimers.get(id);
          if (kind === "interval") nativeTimers.clearInterval(id);
          else if (kind === "raf") nativeTimers.cancelAnimationFrame(id);
          else nativeTimers.clearTimeout(id);
          activeTimers.delete(id);
        }
      },
      clearAll: function () {
        activeTimers.forEach(function (kind, id) {
          if (kind === "interval") nativeTimers.clearInterval(id);
          else if (kind === "raf") nativeTimers.cancelAnimationFrame(id);
          else nativeTimers.clearTimeout(id);
        });
        activeTimers.clear();
      },
      size: function () { return activeTimers.size; }
    };
    window.addEventListener("pagehide", function () { TimerManager.clearAll(); DOM.clear(); });
    window.SexcapadesRuntime = Object.freeze({
      DOM: DOM,
      TimerManager: TimerManager,
      setHTML: function (target, html) {
        if (!target) throw new TypeError("setHTML requires a target element.");
        target.innerHTML = String(html == null ? "" : html);
        Array.from(target.querySelectorAll('script,iframe,object,embed,base,meta[http-equiv="refresh"]')).forEach(function (el) { el.remove(); });
        Array.from(target.querySelectorAll("*")).forEach(function (el) {
          Array.from(el.attributes || []).forEach(function (attr) {
            var name = attr.name.toLowerCase();
            var val = attr.value;
            var badScheme = (name === "href" || name === "src" || name === "xlink:href" || name === "formaction") && /^\s*(?:javascript|vbscript):/i.test(String(val || ""));
            var badStyle = name === "style" && /(?:expression\s*\(|url\s*\(\s*['"]?\s*(?:javascript|vbscript):|@import)/i.test(val);
            if (name.slice(0, 2) === "on" || name === "srcdoc" || badScheme || badStyle) {
              el.removeAttribute(attr.name);
            }
          });
        });
        DOM.invalidate();
        return target;
      }
    });
  }
  window.TaxoPolemicsRuntime = window.SexcapadesRuntime;
  window.FlexcapadesRuntime = window.SexcapadesRuntime;
})();

window.__loadScriptOnce = (function () {
  var loaded = {};
  return function (url) {
    if (!loaded[url]) {
      loaded[url] = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = url;
        s.onload = function () { resolve(); };
        s.onerror = function () { delete loaded[url]; reject(new Error("Could not load " + url)); };
        document.head.appendChild(s);
      });
    }
    return loaded[url];
  };
})();
window.__loadQrScanner = function () {
  return window.__loadScriptOnce("https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js");
};
window.__loadPdfLibs = function () {
  var base = (location.pathname.indexOf("/hosted/") === 0 || !location.pathname.endsWith(".html")) ? "/hosted/app-assets/" : "";
  return window.__loadScriptOnce(base + "vendor/jspdf.umd.min.js").then(function () {
    return window.__loadScriptOnce(base + "vendor/svg2pdf.umd.min.js");
  });
};
