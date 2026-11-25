
/* ---- module: scene-sentinel ---- */
__sxInit(function () {
/* Scene Sentinel: a top-level view (a dialog, like Popularity List)
   holding the safe signal, check-in timer, emergency contacts, pre-scene
   checklist, and post-scene check-in; all of its data lives in localStorage
   in this browser only. This module was split out of the old combined
   view-nav + Scene Sentinel block with no behavior change: same state key,
   same check-in phases and grace period, same notification and vibrate
   call sites; its timers run through SexcapadesRuntime.TimerManager.
   Everything runs inside boot(), gated on DOMContentLoaded through the
   shared __sxInit queue, and every listener attachment is null-guarded.
   The navigation module opens this dialog; window.__sxSentinelRenderAll
   (published below) is how it asks this module to render after opening,
   and window.__sxSentinelNotifInit is published for it here. */
(function () {
  function boot() {
  var closeDialog = window.__sxDialog.close;
  function syncBtn() { if (typeof window.__sxSyncViewButton === "function") window.__sxSyncViewButton(); }

  var safetyDlg = SexcapadesRuntime.DOM.byId("safetyDialog");
  var LS_KEY = "sexcapades_sentinel_v1";
  var GRACE_MS = 120000;
  function nowMs() { return Date.now(); }
  function fmtTime(ts) {
    try { return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
    catch (e) { return new Date(ts).toLocaleString(); }
  }
  function fmtTimeSec(ts) {
    try { return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" }); }
    catch (e) { return fmtTime(ts); }
  }
  function fmtDur(ms) {
    if (ms < 0) ms = 0;
    var s = Math.ceil(ms / 1000), m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function vibrate(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { __sxErrLog("vibrate", e); } }
  var NOTIF_ASKED_KEY = 'sexcapades_sentinel_notif_asked';
  function notifSupported() {
    try { return ('Notification' in window) && ('serviceWorker' in navigator); } catch (e) { return false; }
  }
  function sentinelNotify(kind) {
    try {
      if (!notifSupported()) return;
      if (Notification.permission !== 'granted') return;
      navigator.serviceWorker.ready.then(function (reg) {
        var isMissed = kind === 'missed';
        var title = isMissed ? 'Scene Sentinel — MISSED CHECK-IN' : 'Scene Sentinel — Check-in due';
        var opts = {
          body: isMissed ? 'Check-in missed! Tap to open Scene Sentinel.' : "Check-in due — tap to confirm you're OK.",
          tag: isMissed ? 'sentinel-missed' : 'sentinel-due',
          icon: '/icons/icon-192.png',
          vibrate: isMissed ? [300, 80, 300, 80, 300] : [180, 80, 180, 80, 180]
        };
        if (isMissed) opts.requireInteraction = true;
        reg.showNotification(title, opts).catch(function (e) { __sxErrLog("notification-show", e); });
      }).catch(function (e) { __sxErrLog("notification-show", e); });
    } catch (e) { __sxErrLog("notification", e); }
  }
  function initNotifPermission() {
    try {
      if (!notifSupported()) return;
      if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
      var asked = false;
      try { asked = localStorage.getItem(NOTIF_ASKED_KEY) === '1'; } catch (e) { __sxErrLog("notif-storage", e); }
      if (asked) return;
      try { localStorage.setItem(NOTIF_ASKED_KEY, '1'); } catch (e) { __sxErrLog("notification-show", e); }
      Notification.requestPermission().catch(function (e) { __sxErrLog("notification-show", e); });
    } catch (e) { __sxErrLog("notification-show", e); }
  }
  window.__sxSentinelNotifInit = initNotifPermission;
  var notifBtn = SexcapadesRuntime.DOM.byId("safetyNotifEnable"), notifHint = SexcapadesRuntime.DOM.byId("safetyNotifHint");
  function renderNotifHint() {
    try {
      if (!notifHint) return;
      if (!notifSupported()) { notifHint.hidden = true; return; }
      if (Notification.permission === 'granted') { notifHint.textContent = 'Check-in alerts enabled — they reach you even with the phone locked.'; return; }
      if (Notification.permission === 'denied') { notifHint.textContent = 'Check-in alerts are blocked in browser settings.'; return; }
    } catch (e) { __sxErrLog("notification", e); }
  }
  if (notifBtn) notifBtn.addEventListener("click", function () {
    try {
      if (!notifSupported()) return;
      try { localStorage.setItem(NOTIF_ASKED_KEY, '1'); } catch (e) { __sxErrLog("notif-storage", e); }
      Notification.requestPermission().then(function () { renderNotifHint(); }).catch(function (e) { __sxErrLog("notification-permission", e); });
    } catch (e) { __sxErrLog("notification-permission", e); }
  });

  /* ---------------- Scene Sentinel state (localStorage) ---------------- */
  function defaultState() {
    return {
      signals: [],
      contacts: [],
      pre: { limits: { c: false, t: "" }, words: { c: false, t: "" }, care: { c: false, t: "" } },
      checkin: { intervalMin: 15, phase: "idle", nextDue: 0, dueAt: 0 },
      post: { dueAt: 0, log: [] },
      journal: [],
      guide: { text: "", steps: [], pulseMin: 5, queuedAt: 0 }
    };
  }
  var state = defaultState();
  function load() {
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      var d = defaultState();
      if (Array.isArray(parsed.signals)) d.signals = parsed.signals;
      if (Array.isArray(parsed.contacts)) d.contacts = parsed.contacts;
      if (parsed.pre) { for (var k in d.pre) { if (parsed.pre[k]) { d.pre[k].c = !!parsed.pre[k].c; d.pre[k].t = String(parsed.pre[k].t || ""); } } }
      if (parsed.checkin) { d.checkin.intervalMin = +parsed.checkin.intervalMin || 15; d.checkin.phase = String(parsed.checkin.phase || "idle"); d.checkin.nextDue = +parsed.checkin.nextDue || 0; d.checkin.dueAt = +parsed.checkin.dueAt || 0; }
      if (parsed.post) { d.post.dueAt = +parsed.post.dueAt || 0; if (Array.isArray(parsed.post.log)) d.post.log = parsed.post.log; }
      if (Array.isArray(parsed.journal)) d.journal = parsed.journal.filter(function (e) { return e && typeof e === "object" && e.code; }).map(function (e) { return { id: String(e.id || ""), t: +e.t || 0, code: String(e.code), metric: e.metric ? String(e.metric) : "", value: (e.value === null || e.value === undefined) ? null : +e.value, source: String(e.source || "watch"), activity: String(e.activity || ""), sched: String(e.sched || ""), domEnjoy: (e.domEnjoy === null || e.domEnjoy === undefined) ? null : +e.domEnjoy, domAt: +e.domAt || 0, profileId: String(e.profileId || "") }; });
      if (parsed.guide && typeof parsed.guide === "object") { d.guide.text = String(parsed.guide.text || ""); d.guide.pulseMin = +parsed.guide.pulseMin || 5; d.guide.queuedAt = +parsed.guide.queuedAt || 0; if (Array.isArray(parsed.guide.steps)) d.guide.steps = parsed.guide.steps.filter(function (st) { return st && isFinite(+st.start); }).map(function (st) { return { start: +st.start, end: (st.end === null || st.end === undefined) ? null : +st.end, activity: String(st.activity || ""), note: String(st.note || "") }; }); }
      state = d;
    } catch (e) { __sxErrLog("sentinel-parse", e); }
  }
  function save() { try { window.localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { __sxErrLog("sentinel-storage", e); } }

  /* ---------------- Safe signal ---------------- */
  var signalBtn = SexcapadesRuntime.DOM.byId("safetySignalButton"), signalMain = SexcapadesRuntime.DOM.byId("safetySignalMain"),
      signalSub = SexcapadesRuntime.DOM.byId("safetySignalSub"), signalLogEl = SexcapadesRuntime.DOM.byId("safetySignalLog"),
      signalEmpty = SexcapadesRuntime.DOM.byId("safetySignalEmpty");
  var SIGNAL_META = {
    checkin: { state: "green", main: "Check-in — all good", label: "Check-in (all good)", vibe: [45] },
    slow: { state: "yellow", main: "Slow down", label: "Slow down", vibe: [80, 40, 80] },
    stop: { state: "red", main: "STOP", label: "Stop", vibe: [220, 60, 220, 60, 220] }
  };
  function fireSignal(kind) {
    var meta = SIGNAL_META[kind]; if (!meta) return;
    var t = nowMs();
    state.signals.unshift({ t: t, kind: kind });
    if (state.signals.length > 100) state.signals.length = 100;
    save();
    if (signalBtn) signalBtn.setAttribute("data-state", meta.state);
    if (signalMain) signalMain.textContent = meta.main;
    if (signalSub) signalSub.textContent = "Logged " + fmtTimeSec(t);
    vibrate(meta.vibe);
    renderSignals();
  }
  function renderSignals() {
    if (!signalLogEl) return;
    signalLogEl.innerHTML = "";
    state.signals.forEach(function (entry) {
      var meta = SIGNAL_META[entry.kind] || SIGNAL_META.checkin;
      var li = document.createElement("li");
      var dot = document.createElement("span"); dot.className = "safety-dot"; dot.setAttribute("data-kind", entry.kind);
      var lab = document.createElement("span"); lab.textContent = meta.label;
      var tm = document.createElement("time"); tm.textContent = fmtTimeSec(entry.t);
      li.appendChild(dot); li.appendChild(lab); li.appendChild(tm);
      signalLogEl.appendChild(li);
    });
    if (signalEmpty) signalEmpty.hidden = state.signals.length > 0;
  }
  if (signalBtn) {
    var holdTimer = 0, holdFired = false, lastTap = 0, tapTimer = 0, lastPointerUp = 0;
    function tapLogic() {
      var n = nowMs();
      if (lastTap && n - lastTap < 350) { lastTap = 0; SexcapadesRuntime.TimerManager.clear(tapTimer); fireSignal("stop"); }
      else { lastTap = n; tapTimer = SexcapadesRuntime.TimerManager.setTimeout(function () { lastTap = 0; fireSignal("checkin"); }, 360); }
    }
    signalBtn.addEventListener("pointerdown", function () {
      holdFired = false;
      SexcapadesRuntime.TimerManager.clear(holdTimer);
      holdTimer = SexcapadesRuntime.TimerManager.setTimeout(function () { holdFired = true; fireSignal("slow"); }, 550);
    });
    signalBtn.addEventListener("pointerup", function () {
      SexcapadesRuntime.TimerManager.clear(holdTimer);
      lastPointerUp = nowMs();
      if (holdFired) { holdFired = false; return; }
      tapLogic();
    });
    signalBtn.addEventListener("pointercancel", function () { SexcapadesRuntime.TimerManager.clear(holdTimer); });
    signalBtn.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
    signalBtn.addEventListener("click", function () {
      if (nowMs() - lastPointerUp < 120) return; /* pointer path already handled it */
      tapLogic();
    });
  }
  var signalClear = SexcapadesRuntime.DOM.byId("safetySignalClear");
  if (signalClear) signalClear.addEventListener("click", function () {
    state.signals = []; save(); renderSignals();
    if (signalBtn) signalBtn.setAttribute("data-state", "idle");
    if (signalMain) signalMain.textContent = "Safe signal";
    if (signalSub) signalSub.textContent = "Tap · hold · double-tap";
  });

  /* ---------------- Emergency contacts ---------------- */
  var contactList = SexcapadesRuntime.DOM.byId("safetyContactList"), contactEmpty = SexcapadesRuntime.DOM.byId("safetyContactEmpty");
  /* tel:/sms: capability detection (Build 2026-10-19_0048): ChromeOS and most
     desktops have no phone dialer or SMS app, and firing a tel:/sms: link
     there crashed/closed the tab on a Chromebook Plus. Only devices whose
     user agent looks like a phone/tablet get tel:/sms: links; on every
     other device NO tel:/sms: link is ever created — the number is shown
     as visible text with a Copy number button instead. */
  var CAN_TEL = (function () {
    try {
      var ua = String(navigator.userAgent || "");
      if (/CrOS/i.test(ua)) return false;
      return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    } catch (e) { __sxErrLog("sentinel-tel-detect", e); return false; }
  })();
  function telHref(phone) { return "tel:" + String(phone || "").replace(/[^+\d]/g, ""); }
  function smsHref(phone) { return "sms:" + String(phone || "").replace(/[^+\d]/g, ""); }
  function copyPhoneNumber(phone, btn) {
    var num = String(phone || "");
    var done = function () {
      if (!btn) return;
      var old = btn.getAttribute("data-copy-label") || "Copy number";
      btn.textContent = "Copied!";
      SexcapadesRuntime.TimerManager.setTimeout(function () { btn.textContent = old; }, 1600);
    };
    var fallback = function () {
      try {
        var ta = document.createElement("textarea");
        ta.value = num; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) { __sxErrLog("sentinel-copy", e); }
        document.body.removeChild(ta);
      } catch (e) { __sxErrLog("sentinel-copy", e); }
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(num).then(done, fallback);
    } else fallback();
  }
  function copyNumberButton(phone, className, label) {
    var b = document.createElement("button");
    b.type = "button"; b.className = className; b.textContent = label;
    b.setAttribute("data-copy-label", label);
    b.addEventListener("click", function () { copyPhoneNumber(phone, b); });
    return b;
  }
  var contactsHint = SexcapadesRuntime.DOM.byId("safetyContactsHint");
  if (contactsHint && !CAN_TEL) contactsHint.textContent = "This device can't place calls or send texts, so each number is shown with a Copy number button — copy it and dial or text from your phone. The first contact is the escalation target for a missed check-in.";
  function contactRow(contact, idx) {
    var li = document.createElement("li");
    var name = document.createElement("span"); name.className = "safety-contact-name"; name.textContent = contact.name;
    var phone = document.createElement("span"); phone.className = "safety-contact-phone"; phone.textContent = contact.phone;
    var actions = document.createElement("span"); actions.className = "safety-contact-actions";
    if (CAN_TEL) {
      var call = document.createElement("a"); call.className = "action-btn safety-mini-btn"; call.href = telHref(contact.phone); call.textContent = "Call";
      var text = document.createElement("a"); text.className = "action-btn safety-mini-btn"; text.href = smsHref(contact.phone); text.textContent = "Text";
      actions.appendChild(call); actions.appendChild(text);
    } else {
      actions.appendChild(copyNumberButton(contact.phone, "action-btn safety-mini-btn", "Copy number"));
    }
    var rm = document.createElement("button"); rm.type = "button"; rm.className = "action-btn safety-mini-btn"; rm.textContent = "Remove"; rm.setAttribute("data-remove-contact", String(idx));
    actions.appendChild(rm);
    li.appendChild(name); li.appendChild(phone); li.appendChild(actions);
    return li;
  }
  function renderContacts() {
    if (!contactList) return;
    contactList.innerHTML = "";
    state.contacts.forEach(function (c, i) { contactList.appendChild(contactRow(c, i)); });
    if (contactEmpty) contactEmpty.hidden = state.contacts.length > 0;
    renderAlertActions();
  }
  if (contactList) contactList.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-remove-contact]") : null;
    if (!t) return;
    var idx = +t.getAttribute("data-remove-contact");
    if (idx >= 0 && idx < state.contacts.length) { state.contacts.splice(idx, 1); save(); renderContacts(); }
  });
  var contactAdd = SexcapadesRuntime.DOM.byId("safetyContactAdd");
  if (contactAdd) contactAdd.addEventListener("click", function () {
    var nameEl = SexcapadesRuntime.DOM.byId("safetyContactName"), phoneEl = SexcapadesRuntime.DOM.byId("safetyContactPhone");
    var name = nameEl ? nameEl.value.trim() : "", phone = phoneEl ? phoneEl.value.trim() : "";
    if (!name || !phone) return;
    state.contacts.push({ name: name, phone: phone });
    save(); renderContacts();
    if (nameEl) nameEl.value = "";
    if (phoneEl) phoneEl.value = "";
  });
  function renderAlertActions() {
    var box = SexcapadesRuntime.DOM.byId("safetyAlertActions"); if (!box) return;
    box.innerHTML = "";
    if (!state.contacts.length) {
      var none = document.createElement("span"); none.textContent = "Add an emergency contact below so a missed check-in has someone to alert.";
      box.appendChild(none); return;
    }
    state.contacts.forEach(function (c) {
      if (CAN_TEL) {
        var call = document.createElement("a"); call.className = "action-btn"; call.href = telHref(c.phone); call.textContent = "Call " + c.name;
        var text = document.createElement("a"); text.className = "action-btn"; text.href = smsHref(c.phone); text.textContent = "Text " + c.name;
        box.appendChild(call); box.appendChild(text);
      } else {
        var lab = document.createElement("span"); lab.textContent = c.name + ": " + c.phone;
        box.appendChild(lab);
        box.appendChild(copyNumberButton(c.phone, "action-btn", "Copy number"));
      }
    });
  }

  /* ---------------- Pre-scene checklist ---------------- */
  var PRE_KEYS = [
    { key: "limits", check: "safetyPreLimitsCheck", text: "safetyPreLimitsText" },
    { key: "words", check: "safetyPreWordsCheck", text: "safetyPreWordsText" },
    { key: "care", check: "safetyPreCareCheck", text: "safetyPreCareText" }
  ];
  function renderPreReady() {
    var el = SexcapadesRuntime.DOM.byId("safetyPreReady"); if (!el) return;
    var all = PRE_KEYS.every(function (p) { return state.pre[p.key].c; });
    el.setAttribute("data-ready", all ? "true" : "false");
    el.textContent = all
      ? "Ready — hard limits reviewed, safe words agreed, aftercare planned."
      : "Not ready yet — confirm all three before the scene starts.";
  }
  function hydratePre() {
    PRE_KEYS.forEach(function (p) {
      var c = SexcapadesRuntime.DOM.byId(p.check), t = SexcapadesRuntime.DOM.byId(p.text);
      if (c) c.checked = !!state.pre[p.key].c;
      if (t && document.activeElement !== t) t.value = state.pre[p.key].t || "";
    });
    renderPreReady();
  }
  PRE_KEYS.forEach(function (p) {
    var c = SexcapadesRuntime.DOM.byId(p.check), t = SexcapadesRuntime.DOM.byId(p.text);
    if (c) c.addEventListener("change", function () { state.pre[p.key].c = c.checked; save(); renderPreReady(); });
    if (t) t.addEventListener("input", function () { state.pre[p.key].t = t.value; save(); });
  });

  /* ---------------- Check-in timer ---------------- */
  var checkinToggle = SexcapadesRuntime.DOM.byId("safetyCheckinToggle"), checkinStatus = SexcapadesRuntime.DOM.byId("safetyCheckinStatus"),
      checkinDue = SexcapadesRuntime.DOM.byId("safetyCheckinDue"), checkinMissed = SexcapadesRuntime.DOM.byId("safetyCheckinMissed"),
      checkinInterval = SexcapadesRuntime.DOM.byId("safetyCheckinInterval");
  function renderCheckin() {
    var ci = state.checkin, n = nowMs();
    if (checkinInterval && document.activeElement !== checkinInterval) checkinInterval.value = String(ci.intervalMin);
    if (!checkinStatus) return;
    if (ci.phase === "running") {
      checkinStatus.textContent = "Check-ins running — next check-in in " + fmtDur(ci.nextDue - n) + ".";
      if (checkinToggle) checkinToggle.textContent = "Stop check-ins";
      if (checkinDue) checkinDue.hidden = true;
      if (checkinMissed) checkinMissed.hidden = true;
    } else if (ci.phase === "due") {
      checkinStatus.textContent = "Check-in due — if nobody confirms within " + fmtDur(ci.dueAt + GRACE_MS - n) + ", it escalates to a missed check-in.";
      if (checkinToggle) checkinToggle.textContent = "Stop check-ins";
      if (checkinDue) checkinDue.hidden = false;
      if (checkinMissed) checkinMissed.hidden = true;
    } else if (ci.phase === "missed") {
      checkinStatus.textContent = "A check-in was missed and not confirmed.";
      if (checkinToggle) checkinToggle.textContent = "Stop check-ins";
      if (checkinDue) checkinDue.hidden = true;
      if (checkinMissed) checkinMissed.hidden = false;
    } else {
      checkinStatus.textContent = "Check-ins are off.";
      if (checkinToggle) checkinToggle.textContent = "Start check-ins";
      if (checkinDue) checkinDue.hidden = true;
      if (checkinMissed) checkinMissed.hidden = true;
    }
  }
  function startCheckins() {
    state.checkin.phase = "running";
    state.checkin.nextDue = nowMs() + state.checkin.intervalMin * 60000;
    state.checkin.dueAt = 0;
    save(); renderCheckin();
  }
  function stopCheckins() {
    state.checkin.phase = "idle"; state.checkin.nextDue = 0; state.checkin.dueAt = 0;
    save(); renderCheckin();
  }
  if (checkinToggle) checkinToggle.addEventListener("click", function () {
    if (state.checkin.phase === "idle") startCheckins(); else stopCheckins();
  });
  if (checkinInterval) checkinInterval.addEventListener("change", function () {
    state.checkin.intervalMin = +checkinInterval.value || 15;
    if (state.checkin.phase === "running") state.checkin.nextDue = nowMs() + state.checkin.intervalMin * 60000;
    save(); renderCheckin();
  });
  var checkinOk = SexcapadesRuntime.DOM.byId("safetyCheckinOk"), checkinAck = SexcapadesRuntime.DOM.byId("safetyCheckinAck");
  if (checkinOk) checkinOk.addEventListener("click", startCheckins);
  if (checkinAck) checkinAck.addEventListener("click", startCheckins);

  /* ---------------- Post-scene check-in ---------------- */
  var postStatus = SexcapadesRuntime.DOM.byId("safetyPostStatus"), postMoods = SexcapadesRuntime.DOM.byId("safetyPostMoods"),
      postLogEl = SexcapadesRuntime.DOM.byId("safetyPostLog"), postEmpty = SexcapadesRuntime.DOM.byId("safetyPostEmpty"),
      postPrompt = SexcapadesRuntime.DOM.byId("safetyPostMoodPrompt");
  var postPromptOpen = false;
  function renderPost() {
    if (!postStatus) return;
    var due = state.post.dueAt, n = nowMs();
    if (due && due > n) {
      postStatus.textContent = "Follow-up scheduled for " + fmtTime(due) + ".";
      if (!postPromptOpen && postMoods) postMoods.hidden = true;
    } else if (due && due <= n) {
      postStatus.textContent = "Your post-scene follow-up is due now.";
      if (postMoods) { postMoods.hidden = false; if (postPrompt) postPrompt.textContent = "Your follow-up is due — how are you feeling?"; }
    } else {
      postStatus.textContent = "No follow-up scheduled.";
      if (!postPromptOpen && postMoods) postMoods.hidden = true;
    }
    renderPostLog();
  }
  function renderPostLog() {
    if (!postLogEl) return;
    postLogEl.innerHTML = "";
    state.post.log.forEach(function (entry) {
      var li = document.createElement("li");
      var dot = document.createElement("span"); dot.className = "safety-dot"; dot.setAttribute("data-kind", "mood");
      var lab = document.createElement("span"); lab.textContent = "Feeling: " + entry.mood;
      var tm = document.createElement("time"); tm.textContent = fmtTime(entry.t);
      li.appendChild(dot); li.appendChild(lab); li.appendChild(tm);
      postLogEl.appendChild(li);
    });
    if (postEmpty) postEmpty.hidden = state.post.log.length > 0;
  }
  var postSchedule = SexcapadesRuntime.DOM.byId("safetyPostSchedule");
  if (postSchedule) postSchedule.addEventListener("click", function () {
    var delayEl = SexcapadesRuntime.DOM.byId("safetyPostDelay");
    var mins = delayEl ? (+delayEl.value || 120) : 120;
    state.post.dueAt = nowMs() + mins * 60000;
    postPromptOpen = false;
    save(); renderPost();
  });
  var postNow = SexcapadesRuntime.DOM.byId("safetyPostNow");
  if (postNow) postNow.addEventListener("click", function () {
    postPromptOpen = true;
    if (postMoods) { postMoods.hidden = false; if (postPrompt) postPrompt.textContent = "How are you feeling?"; }
  });
  if (postMoods) postMoods.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-mood]") : null;
    if (!t) return;
    state.post.log.unshift({ t: nowMs(), mood: t.getAttribute("data-mood") });
    if (state.post.log.length > 100) state.post.log.length = 100;
    state.post.dueAt = 0;
    postPromptOpen = false;
    if (postMoods) postMoods.hidden = true;
    save(); renderPost();
  });

