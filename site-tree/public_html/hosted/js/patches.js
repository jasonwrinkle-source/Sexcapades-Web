// Sexcapades Runtime Patches Entry
// Most runtime patches have been folded into modular source files in app/js/modules/
// (01-dispatcher through 09-profile-storage and view-nav.js).
// This file serves as the fallback queue gate.

var __sxInitQueue = [];
var __sxInitFlushed = false;
function __sxRunInit(fn) {
  try { fn(); } catch (e) { if (typeof __sxErrLog === "function") __sxErrLog("consolidated-init", e); }
}
function __sxInit(fn) {
  if (__sxInitFlushed) { __sxRunInit(fn); return; }
  __sxInitQueue.push(fn);
}
function __sxFlushInit() {
  if (__sxInitFlushed) return;
  __sxInitFlushed = true;
  var queue = __sxInitQueue;
  __sxInitQueue = [];
  for (var i = 0; i < queue.length; i++) __sxRunInit(queue[i]);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", __sxFlushInit, { once: true });
} else {
  if (window.SexcapadesRuntime && SexcapadesRuntime.TimerManager) {
    SexcapadesRuntime.TimerManager.setTimeout(__sxFlushInit, 0);
  } else {
    setTimeout(__sxFlushInit, 0);
  }
}
