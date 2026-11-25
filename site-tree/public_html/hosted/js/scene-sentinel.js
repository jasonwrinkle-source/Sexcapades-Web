
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

  /* ---------------- GibberWear listener + scene journal (sentinel-1106-0321; metric decoding guide-1106-0847) ----------------
     The watch sends GGWave p=4 (ultrasound fast) chirps: TAP / DBL / HLD,
     plus metric readings E / H / N (Enjoyment / Heat / Endurance). A metric
     payload is the metric letter plus the DISPLAY value, -100 to +100 —
     the number in the chirp IS the number on the watch screen, shown
     as-is with NO conversion (owner ruling 2026-11-06; the old spec
     formula Display = Internal*2 - 100 is dead and must not come back).
     This block captures the microphone with getUserMedia and decodes the
     audio with the vendored ggwave-wasm library (vendor/ggwave.js),
     protocol p=4. Only payloads the decoder actually returns — TAP, DBL,
     HLD, or a valid metric payload — become journal entries; there is no
     fallback guesser.
     Every chirp becomes a journal entry: sub tap + timestamp, then the Dom
     prompt (Way A) attaches the spoken activity and the Dom's own rating.
     No audio is stored; speech transcription uses the Web Speech API. */
  var GW_SUB = {
    TAP: { level: 2, label: "Enjoying", detail: "Tap — enjoying, all good" },
    DBL: { level: 1, label: "Kind of / mixed", detail: "Double-tap — only kind of enjoying it" },
    HLD: { level: 0, label: "Slow down", detail: "Hold — slow down" }
  };
  var GW_METRICS = {
    E: { name: "Enjoyment" },
    H: { name: "Heat" },
    N: { name: "Endurance" }
  };
  function gwParseMetric(txt) {
    var m = /^([EHN])(-?\d{1,3})$/.exec(String(txt || ""));
    if (!m) return null;
    var v = parseInt(m[2], 10);
    if (isNaN(v) || v < -100 || v > 100) return null;
    return { metric: m[1], value: v };
  }
  function gwFmtVal(v) { return (v > 0 ? "+" : "") + String(v); }
  function gwIsMetric(entry) { return !!(entry && entry.metric && GW_METRICS[entry.metric]); }
  function gwSubLevel(entry) {
    if (gwIsMetric(entry)) { var v = +entry.value || 0; return v >= 34 ? 2 : (v <= -34 ? 0 : 1); }
    return gwSubMeta(entry).level;
  }
  function gwEntrySubText(entry) {
    var tag = entry.code + (entry.source === "ble" ? ", Bluetooth" : "") + (entry.profileId ? ", profile " + entry.profileId : ", broadcast (no key)");
    if (gwIsMetric(entry)) return GW_METRICS[entry.metric].name + " " + gwFmtVal(+entry.value || 0) + " [" + tag + "]";
    return gwSubMeta(entry).detail + " [" + tag + "]";
  }
  var GW_DOM_LABELS = ["Not enjoying", "Mixed", "Enjoying", "Loving it"];
  var gwListenBtn = SexcapadesRuntime.DOM.byId("gwListenToggle"),
      gwListenStatus = SexcapadesRuntime.DOM.byId("gwListenStatus"),
      gwDecodeStatus = SexcapadesRuntime.DOM.byId("gwDecodeStatus"),
      gwLiveSub = SexcapadesRuntime.DOM.byId("gwLiveSub"), gwLiveSubTime = SexcapadesRuntime.DOM.byId("gwLiveSubTime"),
      gwLiveDom = SexcapadesRuntime.DOM.byId("gwLiveDom"), gwLiveDomTime = SexcapadesRuntime.DOM.byId("gwLiveDomTime"),
      gwMismatchBanner = SexcapadesRuntime.DOM.byId("gwMismatchBanner"), gwMismatchText = SexcapadesRuntime.DOM.byId("gwMismatchText"),
      gwPrompt = SexcapadesRuntime.DOM.byId("gwDomPrompt"), gwPromptTitle = SexcapadesRuntime.DOM.byId("gwDomPromptTitle"),
      gwSpeakBtn = SexcapadesRuntime.DOM.byId("gwSpeakBtn"), gwActivityInput = SexcapadesRuntime.DOM.byId("gwActivityInput"),
      gwActivitySave = SexcapadesRuntime.DOM.byId("gwActivitySave"), gwSpeechStatus = SexcapadesRuntime.DOM.byId("gwSpeechStatus"),
      gwDomRateBox = SexcapadesRuntime.DOM.byId("gwDomRateBox"),
      gwMetricE = SexcapadesRuntime.DOM.byId("gwMetricE"), gwMetricETime = SexcapadesRuntime.DOM.byId("gwMetricETime"),
      gwMetricH = SexcapadesRuntime.DOM.byId("gwMetricH"), gwMetricHTime = SexcapadesRuntime.DOM.byId("gwMetricHTime"),
      gwMetricN = SexcapadesRuntime.DOM.byId("gwMetricN"), gwMetricNTime = SexcapadesRuntime.DOM.byId("gwMetricNTime"),
      gwAftercareList = SexcapadesRuntime.DOM.byId("gwAftercareList"), gwJournalEmpty = SexcapadesRuntime.DOM.byId("gwJournalEmpty");
  var gwPromptEntryId = null;
  function fmtCT(ts) {
    try { return new Date(ts).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" }) + " CT"; }
    catch (e) { return fmtTimeSec(ts); }
  }
  function gwSubMeta(entry) { return GW_SUB[entry.code] || GW_SUB.TAP; }
  function gwIsMismatch(entry) {
    /* The one approved rule: sub only kind of enjoying it (double-tap)
       AND Dom not enjoying it (rating 0). Nothing else is a mismatch. */
    if (!entry || entry.domEnjoy === null || entry.domEnjoy === undefined) return false;
    return entry.code === "DBL" && entry.domEnjoy === 0;
  }
  function gwAlignment(entry) {
    if (!entry || entry.domEnjoy === null || entry.domEnjoy === undefined) return { tone: "pending", label: "Waiting on Dom rating" };
    if (gwIsMismatch(entry)) return { tone: "mismatch", label: "Mismatch — should have stopped" };
    var sub = gwSubLevel(entry);
    if ((sub === 2 && entry.domEnjoy >= 2) || (sub === 1 && entry.domEnjoy === 2)) return { tone: "aligned", label: "Aligned" };
    if (sub === 2 && entry.domEnjoy === 3) return { tone: "aligned", label: "Aligned" };
    return { tone: "differed", label: "Differed — talk it over" };
  }
  function gwLatest() { for (var i = 0; i < state.journal.length; i++) { if (!gwIsMetric(state.journal[i])) return state.journal[i]; } return null; }
  function gwBeep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!gwBeep.ctx) gwBeep.ctx = new AC();
      var ctx = gwBeep.ctx, t0 = ctx.currentTime;
      [880, 1174].forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(0.0001, t0 + i * 0.16);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + i * 0.16 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.16 + 0.15);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + i * 0.16); o.stop(t0 + i * 0.16 + 0.16);
      });
    } catch (e) { __sxErrLog("gw-beep", e); }
  }
  function gwOnChirp(code, source, profileId) {
    if (!GW_SUB[code]) return;
    var entry = { id: "gw" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), t: nowMs(), code: code, source: source || "watch", profileId: profileId || "", activity: "", sched: (typeof guideCurrentSched === "function" ? guideCurrentSched() : ""), domEnjoy: null, domAt: 0 };
    state.journal.unshift(entry);
    if (state.journal.length > 200) state.journal.length = 200;
    save();
    gwPromptEntryId = entry.id;
    vibrate(code === "HLD" ? [120, 50, 120] : [70, 40, 70]);
    gwBeep();
    renderJournal();
    if (gwSpeechStatus) gwSpeechStatus.textContent = "Heard " + code + " at " + fmtCT(entry.t) + " — Dom, name the activity.";
    if (gwActivityInput) gwActivityInput.focus();
  }
  function gwOnMetric(parsed, rawCode, source, profileId) {
    var entry = { id: "gw" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), t: nowMs(), code: rawCode, metric: parsed.metric, value: parsed.value, source: source || "watch", profileId: profileId || "", activity: "", sched: (typeof guideCurrentSched === "function" ? guideCurrentSched() : ""), domEnjoy: null, domAt: 0 };
    state.journal.unshift(entry);
    if (state.journal.length > 200) state.journal.length = 200;
    save();
    vibrate([50]);
    gwBeep();
    renderJournal();
    if (gwSpeechStatus) gwSpeechStatus.textContent = "Heard " + rawCode + " at " + fmtCT(entry.t) + " — " + GW_METRICS[parsed.metric].name + " " + gwFmtVal(parsed.value) + " (the watch's display value, shown as-is).";
  }
  /* GibberLink addressing (gibberlink-1108-1400): the sender's profile
     KEY prefixes its signals (adam:TAP, adam:E40) and is attributed
     per key, case preserved — the key is the identifier, there is no
     numeric UID. A payload with NO key is a BROADCAST from all watches
     (Jason's backward-compatibility rule, 2026-11-08): unkeyed TAP /
     DBL / HLD, metric readings, and ACK:CFG are processed as broadcast
     on the Broadcast watch card and in the journal — never dropped —
     so un-setup watches and older GibberWear builds keep working.
     ACKs (keyed ACK:<key>:CFG, unkeyed ACK:CFG) confirm a setup send. */
  var gwPendingCfgKey = "", gwPendingCfgTimer = null, gwPendingHeatValue = null;
  function gwOnAck(ackKey, source) {
    var via = source === "ble" ? "Bluetooth" : "ultrasound";
    if (ackKey) {
      gwLinkLog("IN", "ACK:" + ackKey + ":CFG", via);
      if (gwPendingCfgKey && ackKey === gwPendingCfgKey) {
        var confirmedKey = gwPendingCfgKey;
        var pendingHeat = gwPendingHeatValue;
        gwPendingCfgKey = "";
        gwPendingHeatValue = null;
        if (gwPendingCfgTimer) { try { SexcapadesRuntime.TimerManager.clear(gwPendingCfgTimer); } catch (e) {} gwPendingCfgTimer = null; }
        if (typeof pendingHeat === "number" && isFinite(pendingHeat)) {
          gwCfgSetStatus("Setup confirmed by " + confirmedKey + ". Syncing heat in 1.5s…");
          var delayTimer = (window.SexcapadesRuntime && SexcapadesRuntime.TimerManager && SexcapadesRuntime.TimerManager.setTimeout) ? SexcapadesRuntime.TimerManager.setTimeout : setTimeout;
          delayTimer(function () {
            var heatPayload = "HEAT:" + confirmedKey + ":" + Math.max(-100, Math.min(100, Math.round(pendingHeat)));
            gwSendBoth(heatPayload).then(function (hres) {
              gwLinkLog("OUT", heatPayload, hres.ble === true ? "Bluetooth" : "ultrasound");
              gwCfgSetStatus("Setup confirmed and heat synced (" + heatPayload + ") to " + confirmedKey + ".");
              if (gwTransientListen) gwStopListening("", true);
            });
          }, 1500);
        } else {
          gwCfgSetStatus("Setup confirmed — watch " + ackKey + " answered ACK:" + ackKey + ":CFG.");
          if (gwTransientListen) gwStopListening("", true);
        }
      } else if (gwCfgStatusEl) {
        gwCfgSetStatus("Heard ACK:" + ackKey + ":CFG — watch " + ackKey + " confirmed a setup.");
      }
    } else {
      gwLinkLog("IN", "ACK:CFG", via);
      gwBroadcastAckNote = "Setup ACK (ACK:CFG, unkeyed broadcast) heard " + fmtCT(nowMs()) + " — an unkeyed watch confirmed its setup.";
      var bt = SexcapadesRuntime.DOM.byId("gwBroadcastTime");
      if (bt) bt.textContent = gwBroadcastAckNote;
      if (gwPendingCfgKey) gwCfgSetStatus("Heard an unkeyed ACK:CFG (broadcast). The keyed ACK:" + gwPendingCfgKey + ":CFG has not arrived yet — still waiting.");
    }
  }
  var gwBroadcastAckNote = "";
  function gwHandlePayload(txt, source, profileId) {
    var raw = String(txt || "").trim();
    if (!raw) return false;
    var ackm = /^ACK:(?:([A-Za-z0-9][A-Za-z0-9_-]{0,31}):)?CFG$/i.exec(raw);
    if (ackm) { gwOnAck(ackm[1] || "", source); return true; }
    var body = raw, key = profileId || "";
    if (!key) {
      var ci = raw.indexOf(":");
      if (ci > 0) {
        var candKey = raw.slice(0, ci), rest = raw.slice(ci + 1), restUp = rest.toUpperCase();
        if (/^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(candKey) && (GW_SUB[restUp] || gwParseMetric(restUp))) { key = candKey; body = rest; }
      }
    }
    body = String(body || "").trim().toUpperCase();
    if (GW_SUB[body]) { gwOnChirp(body, source, key); return true; }
    var parsed = gwParseMetric(body);
    if (parsed) { gwOnMetric(parsed, body, source, key); return true; }
    return false;
  }
  function gwEntryById(id) {
    for (var i = 0; i < state.journal.length; i++) if (state.journal[i].id === id) return state.journal[i];
    return null;
  }
  function gwRateDom(entry, value) {
    if (!entry) return;
    entry.domEnjoy = value; entry.domAt = nowMs();
    save(); renderJournal();
    if (gwIsMismatch(entry)) vibrate([220, 60, 220, 60, 220]);
  }
  function gwAttachActivity(entry, textValue) {
    if (!entry) return;
    entry.activity = String(textValue || "").trim().slice(0, 120);
    save(); renderJournal();
  }
  function renderJournal() {
    /* sentinel-density-1108-1545: an incoming signal re-renders the journal,
       live view and metrics — capture the sections scroll position and put
       it back afterwards so the view never jumps on a received signal. */
    var secEl = gwSectionsScrollEl(); var secTop = secEl ? secEl.scrollTop : 0;
    var latest = gwLatest();
    if (gwLiveSub) gwLiveSub.textContent = latest ? gwSubMeta(latest).detail : "No taps yet";
    if (gwLiveSubTime) gwLiveSubTime.textContent = latest ? fmtCT(latest.t) + (latest.activity ? " · " + latest.activity : "") : "";
    var domLatest = null;
    for (var i = 0; i < state.journal.length; i++) { if (state.journal[i].domEnjoy !== null && state.journal[i].domEnjoy !== undefined) { domLatest = state.journal[i]; break; } }
    if (gwLiveDom) gwLiveDom.textContent = domLatest ? GW_DOM_LABELS[domLatest.domEnjoy] : "Not rated yet";
    if (gwLiveDomTime) gwLiveDomTime.textContent = domLatest ? fmtCT(domLatest.domAt) + (domLatest.activity ? " · " + domLatest.activity : "") : "";
    [["E", gwMetricE, gwMetricETime], ["H", gwMetricH, gwMetricHTime], ["N", gwMetricN, gwMetricNTime]].forEach(function (cfg) {
      var found = null;
      for (var i = 0; i < state.journal.length; i++) { if (state.journal[i].metric === cfg[0]) { found = state.journal[i]; break; } }
      if (cfg[1]) cfg[1].textContent = found ? gwFmtVal(+found.value || 0) : "—";
      if (cfg[2]) cfg[2].textContent = found ? fmtCT(found.t) : "No reading yet";
    });
    var gwBroadcastLatestEl = SexcapadesRuntime.DOM.byId("gwBroadcastLatest"), gwBroadcastTimeEl = SexcapadesRuntime.DOM.byId("gwBroadcastTime");
    if (gwBroadcastLatestEl) {
      var bFound = null, bCount = 0;
      for (var bi = 0; bi < state.journal.length; bi++) { if (!state.journal[bi].profileId) { bCount++; if (!bFound) bFound = state.journal[bi]; } }
      if (bFound) {
        gwBroadcastLatestEl.textContent = gwIsMetric(bFound) ? (GW_METRICS[bFound.metric].name + " " + gwFmtVal(+bFound.value || 0)) : gwSubMeta(bFound).detail;
        if (gwBroadcastTimeEl) gwBroadcastTimeEl.textContent = fmtCT(bFound.t) + " · " + bCount + " broadcast signal" + (bCount === 1 ? "" : "s") + " this scene — unkeyed, from any watch in the room." + (gwBroadcastAckNote ? " " + gwBroadcastAckNote : "");
      } else {
        gwBroadcastLatestEl.textContent = "No broadcast signals yet";
        if (gwBroadcastTimeEl) gwBroadcastTimeEl.textContent = gwBroadcastAckNote || "Unkeyed signals from any watch in the room land here.";
      }
    }
    var showMismatch = !!(latest && gwIsMismatch(latest));
    if (gwMismatchBanner) gwMismatchBanner.hidden = !showMismatch;
    if (showMismatch && gwMismatchText) gwMismatchText.textContent = "Latest check-in: sub tapped \u201C" + gwSubMeta(latest).label + "\u201D and the Dom rated it \u201C" + GW_DOM_LABELS[latest.domEnjoy] + "\u201D" + (latest.activity ? " during " + latest.activity : "") + ". This activity should stop — check in with each other.";
    var promptEntry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : latest;
    if (gwPrompt) gwPrompt.hidden = !promptEntry;
    if (gwDomRateBox) gwDomRateBox.hidden = !promptEntry;
    if (promptEntry && gwPromptTitle) gwPromptTitle.textContent = "Dom — what activity is this? (" + gwSubMeta(promptEntry).detail + ", " + fmtCT(promptEntry.t) + ")";
    if (promptEntry && gwActivityInput && document.activeElement !== gwActivityInput) gwActivityInput.value = promptEntry.activity || "";
    if (gwDomRateBox && promptEntry) {
      var btns = gwDomRateBox.querySelectorAll("[data-dom-rate]");
      for (var b = 0; b < btns.length; b++) btns[b].setAttribute("aria-pressed", promptEntry.domEnjoy === +btns[b].getAttribute("data-dom-rate") ? "true" : "false");
    }
    if (!gwAftercareList) { if (secEl && secEl.scrollTop !== secTop) secEl.scrollTop = secTop; return; }
    gwAftercareList.innerHTML = "";
    state.journal.forEach(function (entry) {
      var align = gwAlignment(entry);
      var card = document.createElement("div"); card.className = "gw-entry"; card.setAttribute("data-mismatch", gwIsMismatch(entry) ? "true" : "false");
      var head = document.createElement("div"); head.className = "gw-entry-head";
      var title = document.createElement("span"); title.className = "gw-entry-title"; title.textContent = gwIsMetric(entry) ? (GW_METRICS[entry.metric].name + " " + gwFmtVal(+entry.value || 0)) : (entry.activity ? entry.activity : (entry.sched ? entry.sched + " (scheduled)" : "Activity not named yet"));
      var tm = document.createElement("time"); tm.textContent = fmtCT(entry.t);
      head.appendChild(title); head.appendChild(tm); card.appendChild(head);
      var cols = document.createElement("div"); cols.className = "gw-cols";
      var subCol = document.createElement("div"); subCol.className = "gw-col";
      var subLab = document.createElement("span"); subLab.className = "gw-col-label"; subLab.textContent = "Sub (watch)";
      var subVal = document.createElement("span"); subVal.textContent = gwEntrySubText(entry);
      subCol.appendChild(subLab); subCol.appendChild(subVal);
      if (entry.sched && entry.sched !== entry.activity) { var schedVal = document.createElement("span"); schedVal.textContent = "Scheduled then: " + entry.sched; subCol.appendChild(schedVal); }
      var domCol = document.createElement("div"); domCol.className = "gw-col";
      var domLab = document.createElement("span"); domLab.className = "gw-col-label"; domLab.textContent = "Dom";
      var domVal = document.createElement("span"); domVal.textContent = (entry.domEnjoy === null || entry.domEnjoy === undefined) ? "Not rated yet" : ("Enjoyment: " + GW_DOM_LABELS[entry.domEnjoy]);
      domCol.appendChild(domLab); domCol.appendChild(domVal);
      cols.appendChild(subCol); cols.appendChild(domCol); card.appendChild(cols);
      var badge = document.createElement("span"); badge.className = "gw-badge"; badge.setAttribute("data-tone", align.tone); badge.textContent = align.label;
      card.appendChild(badge);
      var rateRow = document.createElement("div"); rateRow.className = "gw-rate-row";
      GW_DOM_LABELS.forEach(function (lab, val) {
        var rb = document.createElement("button"); rb.type = "button"; rb.className = "action-btn gw-rate-btn";
        rb.textContent = lab; rb.setAttribute("data-gw-rate-entry", entry.id); rb.setAttribute("data-dom-rate", String(val));
        rb.setAttribute("aria-pressed", entry.domEnjoy === val ? "true" : "false");
        rateRow.appendChild(rb);
      });
      card.appendChild(rateRow);
      gwAftercareList.appendChild(card);
    });
    if (gwJournalEmpty) gwJournalEmpty.hidden = state.journal.length > 0;
    if (secEl && secEl.scrollTop !== secTop) secEl.scrollTop = secTop;
  }
  if (gwDomRateBox) gwDomRateBox.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-dom-rate]") : null; if (!t) return;
    var entry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : gwLatest();
    gwRateDom(entry, +t.getAttribute("data-dom-rate"));
  });
  if (gwAftercareList) gwAftercareList.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-gw-rate-entry]") : null; if (!t) return;
    gwRateDom(gwEntryById(t.getAttribute("data-gw-rate-entry")), +t.getAttribute("data-dom-rate"));
  });
  if (gwActivitySave) gwActivitySave.addEventListener("click", function () {
    var entry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : gwLatest();
    if (entry && gwActivityInput) { gwAttachActivity(entry, gwActivityInput.value); if (gwSpeechStatus) gwSpeechStatus.textContent = "Activity attached: " + (entry.activity || "(blank)"); }
  });
  /* Speech (Way A): Web Speech API; audio goes to Google, nothing is stored. */
  var gwRecognition = null;
  if (gwSpeakBtn) gwSpeakBtn.addEventListener("click", function () {
    var optIn = SexcapadesRuntime.DOM.byId("gwSpeechOptIn");
    if (!optIn || !optIn.checked) { if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech is off until you tick \u201CSend my voice to Google for transcription\u201D above — your voice goes to Google only after that opt-in. Typing the activity always stays on this device."; if (gwActivityInput) gwActivityInput.focus(); return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech recognition is not available in this browser — type the activity instead. Nothing is recorded either way."; if (gwActivityInput) gwActivityInput.focus(); return; }
    try {
      if (gwRecognition) { try { gwRecognition.stop(); } catch (e) {} }
      gwRecognition = new SR();
      gwRecognition.lang = "en-US"; gwRecognition.interimResults = false; gwRecognition.maxAlternatives = 1;
      gwRecognition.onresult = function (ev) {
        var txt = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : "";
        var entry = gwPromptEntryId ? gwEntryById(gwPromptEntryId) : gwLatest();
        if (entry && txt) { gwAttachActivity(entry, txt); if (gwActivityInput) gwActivityInput.value = entry.activity; if (gwSpeechStatus) gwSpeechStatus.textContent = "Heard: \u201C" + entry.activity + "\u201D — attached to this check-in."; }
      };
      gwRecognition.onerror = function (ev) { if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech did not come through (" + (ev.error || "error") + ") — type the activity instead."; };
      gwRecognition.onend = function () { gwRecognition = null; };
      gwRecognition.start();
      if (gwSpeechStatus) gwSpeechStatus.textContent = "Listening — Dom, say the activity now. (Audio goes to Google for transcription; it is not stored.)";
    } catch (e) { __sxErrLog("gw-speech", e); if (gwSpeechStatus) gwSpeechStatus.textContent = "Speech could not start — type the activity instead."; }
  });
  var gwExportBtn = SexcapadesRuntime.DOM.byId("gwExportBtn"), gwClearBtn = SexcapadesRuntime.DOM.byId("gwClearBtn");
  if (gwExportBtn) gwExportBtn.addEventListener("click", function () {
    var lines = ["Scene Sentinel — scene journal (times in Central)", ""];
    if (state.guide && state.guide.steps && state.guide.steps.length) { lines.push("PLAY GUIDE (Way B) — scheduled steps:"); state.guide.steps.forEach(function (st) { lines.push(guideFmtClock(st.start) + "-" + guideFmtClock(st.end) + " | " + st.activity + (st.note ? " — " + st.note : "")); }); lines.push(""); }
    state.journal.slice().reverse().forEach(function (entry) {
      var align = gwAlignment(entry);
      lines.push(fmtCT(entry.t) + " | Sub: " + gwEntrySubText(entry) + " | Activity: " + (entry.activity || "(not named)") + (entry.sched ? " | Scheduled: " + entry.sched : "") + " | Dom: " + ((entry.domEnjoy === null || entry.domEnjoy === undefined) ? "not rated" : GW_DOM_LABELS[entry.domEnjoy]) + " | " + align.label);
    });
    if (!state.journal.length) lines.push("No check-ins recorded.");
    try {
      var blob = new Blob([lines.join("\n")], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a"); a.href = url; a.download = "scene-journal.txt";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    } catch (e) { __sxErrLog("gw-export", e); }
  });
  if (gwClearBtn) gwClearBtn.addEventListener("click", function () {
    state.journal = []; gwPromptEntryId = null; save(); renderJournal();
    if (gwSpeechStatus) gwSpeechStatus.textContent = "";
  });
  /* Microphone listener: getUserMedia + ggwave-wasm decode (p=4).
     Mic samples stream into ggwave.decode(); a returned payload of TAP,
     DBL or HLD is a check-in. Mic audio is analysed on-device and never
     stored or sent anywhere. */
  var gwAudio = { stream: null, ctx: null, processor: null, on: false };
  var gwLib = null, gwInstance = null, gwLibPromise = null;
  function gwSetStatus(msg) { if (gwListenStatus) gwListenStatus.textContent = msg; }
  function gwEnsureDecoder(sampleRate) {
    if (gwInstance && gwLib) return Promise.resolve(true);
    if (!gwLibPromise) {
      gwLibPromise = new Promise(function (resolve) {
        if (typeof window.ggwave_factory !== "function") { try { gwTxDiag = "ggwave factory missing"; } catch (e) {} resolve(false); return; }
        window.ggwave_factory().then(function (lib) {
          try {
            if (lib.disableLog) lib.disableLog();
            gwLib = lib;
            resolve(true);
          } catch (e) { __sxErrLog("gw-init", e); resolve(false); }
        }).catch(function (e) { __sxErrLog("gw-init", e); resolve(false); });
      });
    }
    return gwLibPromise.then(function (ok) {
      if (!ok || !gwLib) return false;
      try {
        if (gwInstance) { try { gwLib.free(gwInstance); } catch (e) {} gwInstance = null; }
        var params = gwLib.getDefaultParameters();
        params.sampleRateInp = sampleRate;
        params.sampleRateOut = sampleRate;
        gwInstance = gwLib.init(params);
        return !!gwInstance || gwInstance === 0;
      } catch (e) { __sxErrLog("gw-init", e); return false; }
    });
  }
  var gwTransientListen = false;
  function gwStopListening(reason, force) {
    if (!force && gwTransientListen === false && guidePlay.on) return;
    gwTransientListen = false;
    gwAudio.on = false;
    if (gwAudio.processor) { try { gwAudio.processor.disconnect(); } catch (e) {} gwAudio.processor.onaudioprocess = null; gwAudio.processor = null; }
    if (gwAudio.stream) { try { gwAudio.stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} }); } catch (e) {} gwAudio.stream = null; }
    if (gwAudio.ctx) { try { gwAudio.ctx.close(); } catch (e) {} gwAudio.ctx = null; }
    if (gwLib && gwInstance !== null && gwInstance !== undefined) { try { gwLib.free(gwInstance); } catch (e) {} gwInstance = null; }
    if (gwListenBtn) gwListenBtn.textContent = "Start listening";
    if (reason) gwSetStatus(reason);
  }
  function gwStartListening(transientMode) {
    if (gwAudio.on) return Promise.resolve(true);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      gwSetStatus("This browser cannot open the microphone here, so the listener cannot run.");
      return Promise.resolve(false);
    }
    if (transientMode) gwTransientListen = true;
    gwSetStatus("Opening the microphone and loading the ggwave decoder\u2026");
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
      var AC = window.AudioContext || window.webkitAudioContext;
      var ctx = new AC();
      return gwEnsureDecoder(ctx.sampleRate).then(function (ok) {
        if (!ok) {
          try { stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} }); } catch (e) {}
          try { ctx.close(); } catch (e) {}
          gwSetStatus("The ggwave decoder could not load on this device, so the listener cannot run.");
          return false;
        }
        try {
          var src = ctx.createMediaStreamSource(stream);
          var proc = ctx.createScriptProcessor(4096, 1, 1);
          var mute = ctx.createGain(); mute.gain.value = 0;
          proc.onaudioprocess = function (ev) {
            if (!gwAudio.on || !gwLib || gwInstance === null || gwInstance === undefined) return;
            try {
              var input = ev.inputBuffer.getChannelData(0);
              var copy = new Float32Array(input.length); copy.set(input);
              var bytes = new Int8Array(copy.buffer, 0, copy.length * 4);
              var res = gwLib.decode(gwInstance, bytes);
              if (res && res.length) {
                var txt = "";
                for (var i = 0; i < res.length; i++) txt += String.fromCharCode(res[i]);
                txt = txt.trim();
                gwHandlePayload(txt, "watch");
              }
            } catch (e) { __sxErrLog("gw-decode", e); }
          };
          src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
          gwAudio.stream = stream; gwAudio.ctx = ctx; gwAudio.processor = proc; gwAudio.on = true;
          if (gwListenBtn) gwListenBtn.textContent = "Stop listening";
          gwSetStatus("Listening now — the ggwave decoder is live. Tap, double-tap, or hold on the watch and each decoded chirp lands in the journal with its time.");
          if (gwDecodeStatus) gwDecodeStatus.textContent = "Decoder live: ggwave-wasm, protocol p=4 (ultrasound fast) — only decoded TAP / DBL / HLD and metric (E / H / N, -100 to +100, shown as-is) payloads are logged. Mic audio is decoded on-device and never stored or sent anywhere; speech transcription leaves the device to Google only if you opt in for it in the Dom prompt.";
          return true;
        } catch (e) {
          __sxErrLog("gw-listen", e);
          gwStopListening("Microphone opened but the decoder could not start in this browser.", true);
          return false;
        }
      });
    }).catch(function (e) {
      __sxErrLog("gw-mic", e);
      gwSetStatus("Microphone permission was not granted, so the listener cannot hear the watch. Allow microphone access and try again.");
      return false;
    });
  }
  if (gwListenBtn) gwListenBtn.addEventListener("click", function () {
    if (gwAudio.on) {
      gwTransientListen = false;
      gwStopListening("Listener stopped. Chirps are only logged while listening.", true);
      return;
    }
    gwTransientListen = false;
    gwStartListening(false);
  });


  /* ---------------- GibberLink Bluetooth (BLE) transport (ble-1106-1405) ----------------
     A second transport alongside the acoustic GGWave chirps, carrying the
     SAME messages: check-in pulses out ("CHK"), TAP / DBL / HLD and
     E / H / N metric values in, attributed by the sender's short profile
     ID. The user never chooses a transport: where Web Bluetooth exists
     (Chrome on Android) BLE is used once connected, and GGWave stays the
     automatic fallback — and stays live as backup — whenever BLE is
     unavailable (iOS Safari has no Web Bluetooth), permission is denied,
     no device is picked, or the link drops and cannot be re-made.

     === GIBBERLINK BLE SPEC — THE WATCH APP MUST USE THIS SERVICE UUID ===
       Service UUID:  0000FFF0-0000-1000-8000-00805F9B34FB
         (gibberlink-1108-1400: replaces the old 7a1e5b90… service —
         Jason's ruling, following Gemini's spec v1.0. Under the FFF0
         service the phone picks the write characteristic and the
         notify characteristic by property, so their UUIDs are the
         watch app's own choice.)
     The watch advertises the service under a generic name (e.g.
     "GibberLink") — no kink wording anywhere on the watch side.
     Payloads are short UTF-8 text, opaque bytes to the watch:
       watch -> phone: "<key>:TAP" | "<key>:DBL" | "<key>:HLD" |
         "<key>:E<value>" | "<key>:H<value>" | "<key>:N<value>" |
         "ACK:<key>:CFG" — <key> is the sender's profile key (e.g.
         adam); metric values are the watch's display values, -100 to
         +100, sent as-is. A payload with NO key is broadcast (all
         watches) and is never dropped.
       phone -> watch: "CFG:<key>:<timer>" (setup), "CHK:<key>:P" /
         "CHK:<key>:T" (targeted check-in), "CHK:ALL:P" / "CHK:ALL:T"
         (broadcast check-in, explicit ALL signifier), "HEAT:<key>:<value>"
         (heat copied on sync), "CHK" for each play-guide check-in pulse.
         Incoming unkeyed messages are still accepted as broadcast.
     No pairing ceremony: plain Just Works / unencrypted GATT. The
     payloads are meaningless without the profile this phone holds.
     Web Bluetooth needs a user gesture to ask for a device, so the
     connect button below is that gesture; after the first grant, Chrome
     may hand the device back via navigator.bluetooth.getDevices() and
     the link re-forms on its own while a scene is active. On any drop,
     reconnect is attempted automatically while the user still wants the
     link (they have not pressed Disconnect). */
  var GIBBERLINK_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  var gwBleBtn = SexcapadesRuntime.DOM.byId("gwBleToggle"),
      gwBleStatus = SexcapadesRuntime.DOM.byId("gwBleStatus");
  var ble = { device: null, txChar: null, rxChar: null, on: false, want: false, busy: false, attempts: 0, timer: null };
  function bleSupported() {
    try { return !!(navigator && navigator.bluetooth && typeof navigator.bluetooth.requestDevice === "function"); }
    catch (e) { return false; }
  }
  function bleSetStatus(msg) { if (gwBleStatus) gwBleStatus.textContent = msg; }
  function bleSceneActive() {
    return !!((safetyDlg && safetyDlg.open) || guidePlay.on || gwAudio.on);
  }
  function bleUpdateBtn() {
    if (!gwBleBtn) return;
    if (!bleSupported()) { gwBleBtn.disabled = true; gwBleBtn.textContent = "Bluetooth unavailable here"; return; }
    gwBleBtn.disabled = ble.busy;
    gwBleBtn.textContent = ble.on ? "Disconnect Bluetooth watch" : "Connect watch over Bluetooth";
  }
  function bleOnNotify(ev) {
    try {
      var v = ev && ev.target ? ev.target.value : null; if (!v) return;
      var txt = "";
      for (var i = 0; i < v.byteLength; i++) txt += String.fromCharCode(v.getUint8(i));
      txt = txt.trim();
      if (txt) gwHandlePayload(txt, "ble");
    } catch (e) { __sxErrLog("ble-notify", e); }
  }
  function bleAttach(device) {
    ble.busy = true; bleUpdateBtn();
    return device.gatt.connect().then(function (server) {
      return server.getPrimaryService(GIBBERLINK_SERVICE_UUID);
    }).then(function (svc) {
      return svc.getCharacteristics();
    }).then(function (allChars) {
      var tx = null, rx = null;
      (allChars || []).forEach(function (ch) {
        var pr = ch.properties || {};
        if (!tx && (pr.write || pr.writeWithoutResponse)) tx = ch;
        if (!rx && pr.notify) rx = ch;
      });
      if (!tx || !rx) throw new Error("GibberLink characteristics not found");
      return [tx, rx];
    }).then(function (chars) {
      ble.txChar = chars[0]; ble.rxChar = chars[1];
      return ble.rxChar.startNotifications().then(function () {
        ble.rxChar.addEventListener("characteristicvaluechanged", bleOnNotify);
        ble.on = true; ble.busy = false; ble.attempts = 0;
        bleSetStatus("Watch link: Bluetooth connected to " + (device.name || "the GibberWear watch") + " — taps and metrics arrive over BLE, check-in pulses go out over BLE, and GGWave chirps stay live as backup.");
        bleUpdateBtn();
        return true;
      });
    }).catch(function (e) {
      __sxErrLog("ble-connect", e);
      ble.busy = false; ble.on = false; ble.txChar = null; ble.rxChar = null;
      bleUpdateBtn();
      return false;
    });
  }
  function bleScheduleReconnect() {
    if (!ble.want || ble.on || ble.busy || ble.timer) return;
    ble.attempts++;
    var delay = Math.min(3000 * ble.attempts, 15000);
    bleSetStatus("Watch link: Bluetooth dropped — reconnecting in " + Math.round(delay / 1000) + "s (attempt " + ble.attempts + "). GGWave chirps carry the scene meanwhile.");
    ble.timer = setTimeout(function () {
      ble.timer = null;
      if (!ble.want || ble.on || !ble.device) return;
      bleAttach(ble.device).then(function (ok) { if (!ok) bleScheduleReconnect(); });
    }, delay);
  }
  function bleOnDisconnect() {
    ble.on = false; ble.txChar = null; ble.rxChar = null;
    bleUpdateBtn();
    if (ble.want) bleScheduleReconnect();
    else bleSetStatus("Watch link: Bluetooth disconnected — GGWave chirps are the active transport.");
  }
  function bleWireDevice(device) {
    ble.device = device;
    device.addEventListener("gattserverdisconnected", bleOnDisconnect);
  }
  function bleForgetWiring() {
    if (ble.timer) { clearTimeout(ble.timer); ble.timer = null; }
    if (ble.device) { try { ble.device.removeEventListener("gattserverdisconnected", bleOnDisconnect); } catch (e) {} }
  }
  /* Outbound pulse path: resolves true only when the write actually
     completed, null when BLE is not connected (nothing claimed), false
     when a connected write failed. guideFirePulse reports exactly this. */
  function bleSendText(text) {
    if (!ble.on || !ble.txChar) return Promise.resolve(null);
    try {
      var bytes = new TextEncoder().encode(String(text));
      var write = typeof ble.txChar.writeValueWithResponse === "function"
        ? ble.txChar.writeValueWithResponse(bytes)
        : ble.txChar.writeValue(bytes);
      return Promise.resolve(write).then(function () { return true; }).catch(function (e) { __sxErrLog("ble-write", e); return false; });
    } catch (e) { __sxErrLog("ble-write", e); return Promise.resolve(false); }
  }
  function bleMaybeReconnect() {
    /* Silent re-entry while a scene is active: if Chrome still holds a
       permission grant for the watch (getDevices), reconnect without a
       chooser. No grant or no API: nothing happens — the connect button
       (a user gesture) is the way in, exactly as Web Bluetooth requires. */
    if (!bleSupported() || ble.on || ble.busy || !ble.want) return;
    if (!bleSceneActive()) return;
    try {
      if (typeof navigator.bluetooth.getDevices !== "function") return;
      navigator.bluetooth.getDevices().then(function (devices) {
        if (!devices || !devices.length || ble.on || ble.busy) return;
        var dev = ble.device || devices[0];
        if (!ble.device) bleWireDevice(dev);
        bleAttach(dev).then(function (ok) { if (!ok) bleScheduleReconnect(); });
      }).catch(function (e) { __sxErrLog("ble-getdevices", e); });
    } catch (e) { __sxErrLog("ble-getdevices", e); }
  }
  if (gwBleBtn) gwBleBtn.addEventListener("click", function () {
    if (!bleSupported()) {
      bleSetStatus("Watch link: Bluetooth is not available in this browser (iPhone Safari has no Web Bluetooth) — GGWave chirps are the transport, no action needed.");
      return;
    }
    if (ble.on) {
      ble.want = false; bleForgetWiring();
      try { if (ble.device && ble.device.gatt && ble.device.gatt.connected) ble.device.gatt.disconnect(); } catch (e) { __sxErrLog("ble-disconnect", e); }
      ble.on = false; ble.txChar = null; ble.rxChar = null; ble.device = null;
      bleSetStatus("Watch link: Bluetooth disconnected — GGWave chirps are the active transport.");
      bleUpdateBtn();
      return;
    }
    ble.want = true;
    bleSetStatus("Watch link: pick the GibberWear watch in the Bluetooth chooser…");
    navigator.bluetooth.requestDevice({ filters: [{ services: [GIBBERLINK_SERVICE_UUID] }] }).then(function (device) {
      bleWireDevice(device);
      return bleAttach(device);
    }).then(function (ok) {
      if (ok === false) {
        ble.want = false;
        bleSetStatus("Watch link: the watch was picked but the GibberLink service did not answer — staying on GGWave chirps. Check the watch app is advertising the GibberLink service, then try Connect again.");
      }
    }).catch(function (e) {
      /* NotFoundError = chooser closed / no device picked; anything else
         (SecurityError, permission) lands here too. Either way the
         fallback is automatic: GGWave carries the scene, nothing to fix. */
      __sxErrLog("ble-request", e);
      ble.want = false;
      bleSetStatus("Watch link: no Bluetooth watch connected (" + (e && e.name ? e.name : "unavailable") + ") — GGWave chirps are the transport, no action needed.");
      bleUpdateBtn();
    });
  });
  if (!bleSupported()) {
    bleSetStatus("Watch link: Bluetooth is not available in this browser (iPhone Safari has no Web Bluetooth) — GGWave chirps are the transport, no action needed.");
  } else {
    bleSetStatus("Watch link: Bluetooth available but not connected — tap Connect to pair the watch for this scene; until then GGWave chirps are the transport.");
  }
  bleUpdateBtn();

  /* ---------------- GibberLink setup + check-in sender (gibberlink-1108-1400) ----------------
     The phone side of the GibberLink spec as ruled by Jason: the profile
     KEY is the identifier (no provisioned numeric UID; the display name
     is the key for now). Setup sends CFG:<key>:<timer> over ultrasound
     and BLE and waits for the watch's ACK:<key>:CFG (see gwOnAck).
     Check-ins send CHK:<key>:<P|T> to one watch, or CHK:ALL:<P|T> as
     a broadcast every watch answers (explicit ALL signifier on send;
     incoming unkeyed messages still count as broadcast, so older
     unkeyed watches keep working). The same
     setup send is offered from the heat slider for a saved profile
     (a shortcut for those in the know); Scene Sentinel stays its home. */
  var gwCfgKeyEl = SexcapadesRuntime.DOM.byId("gwCfgKey"), gwCfgTimerEl = SexcapadesRuntime.DOM.byId("gwCfgTimer"),
      gwCfgSendBtn = SexcapadesRuntime.DOM.byId("gwCfgSend"), gwCfgStatusEl = SexcapadesRuntime.DOM.byId("gwCfgStatus"),
      gwChkTargetEl = SexcapadesRuntime.DOM.byId("gwChkTarget"), gwChkTypeEl = SexcapadesRuntime.DOM.byId("gwChkType"),
      gwChkSendBtn = SexcapadesRuntime.DOM.byId("gwChkSend"), gwChkStatusEl = SexcapadesRuntime.DOM.byId("gwChkStatus"),
      gwLinkLogEl = SexcapadesRuntime.DOM.byId("gwLinkLog"), gwLinkLogEmptyEl = SexcapadesRuntime.DOM.byId("gwLinkLogEmpty");
  var gwHeatStatusEl = null;
  function gwCfgSetStatus(msg) { if (gwCfgStatusEl) gwCfgStatusEl.textContent = msg; if (gwHeatStatusEl) gwHeatStatusEl.textContent = msg; }
  function gwChkSetStatus(msg) { if (gwChkStatusEl) gwChkStatusEl.textContent = msg; }
  function gwSectionsScrollEl() { try { return document.querySelector("#safetyDialog .safety-sections"); } catch (e) { return null; } }
  function gwLinkLog(dir, payload, via) {
    if (!gwLinkLogEl) return;
    /* sentinel-density-1108-1545: appending to the log must never move the
       dialog's scroll position — only the user's own scrolling does. */
    var sec = gwSectionsScrollEl(); var secTop = sec ? sec.scrollTop : 0;
    var li = document.createElement("li");
    li.textContent = dir + " " + payload + " · " + fmtCT(nowMs()) + (via ? " · " + via : "");
    gwLinkLogEl.insertBefore(li, gwLinkLogEl.firstChild);
    while (gwLinkLogEl.children.length > 50) gwLinkLogEl.removeChild(gwLinkLogEl.lastChild);
    if (gwLinkLogEmptyEl) gwLinkLogEmptyEl.hidden = true;
    if (sec && sec.scrollTop !== secTop) sec.scrollTop = secTop;
  }
  function gwValidKey(k) { return /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(String(k || "")); }
  /* bigbuild-1108-1615 key-name fix: the watch identifier IS the profile
     key (adam, eve) — never the internal "profile-<key>-<surname>" slug.
     Any id or typed value is reduced to the key before it is displayed
     or sent: "profile-eve-vale" -> "eve". */
  function gwKeyFromId(id) {
    var s = String(id || "").trim();
    if (!s) return "";
    var m = /^profile-([A-Za-z0-9]+)(?:-|$)/i.exec(s);
    if (m) return m[1].toLowerCase();
    return s;
  }
  function gwKeyLabel(key) { return key ? key.charAt(0).toUpperCase() + key.slice(1) : key; }
  function gwEnsureChkOption(key) {
    key = gwKeyFromId(key);
    if (!gwChkTargetEl || !gwValidKey(key)) return;
    for (var i = 0; i < gwChkTargetEl.options.length; i++) { if (gwChkTargetEl.options[i].value === key) return; }
    var opt = document.createElement("option"); opt.value = key; opt.textContent = gwKeyLabel(key);
    gwChkTargetEl.appendChild(opt);
  }
  function gwPopulateChkTargets() {
    try { var api = window.Sexcapades2xProfiles; if (api && typeof api.getIds === "function") api.getIds().forEach(function (id) { gwEnsureChkOption(id); }); } catch (e) { __sxErrLog("gw-targets", e); }
    if (gwCfgKeyEl) gwEnsureChkOption(gwCfgKeyEl.value.trim());
  }
  function gwSendBoth(payload) {
    return Promise.all([gwSendPayload(payload), bleSendText(payload)]).then(function (r) { return { chirp: !!r[0], ble: r[1] }; });
  }
  function gwSendCfg(key, timer, heatStatusEl, heatValue) {
    key = gwKeyFromId(key);
    if (!gwValidKey(key)) { gwCfgSetStatus("Enter the watch's profile key first — the short key from the profile (e.g. adam, eve). Letters and digits, no spaces."); return; }
    timer = parseInt(timer, 10); if (isNaN(timer) || timer < 0) timer = 0;
    var payload = "CFG:" + key + ":" + timer;
    gwHeatStatusEl = heatStatusEl || null;
    gwPendingCfgKey = key;
    gwPendingHeatValue = (typeof heatValue === "number" && isFinite(heatValue)) ? heatValue : null;
    if (gwPendingCfgTimer) { try { SexcapadesRuntime.TimerManager.clear(gwPendingCfgTimer); } catch (e) {} gwPendingCfgTimer = null; }

    /* Transmit outgoing CFG first; do NOT arm mic until outgoing sound finishes to avoid acoustic collision */
    gwSendBoth(payload).then(function (res) {
      var via = res.ble === true ? "Bluetooth" : "ultrasound";
      gwLinkLog("OUT", payload, via);
      var msg = "Setup sent (" + payload + ") on " + via + ". Waiting for ACK:" + key + ":CFG…";
      if (!res.chirp && res.ble !== true) msg += " The chirp could not be encoded on this device (" + (gwTxDiag || "unknown reason") + "), so the watch may not have heard it — start the listener or connect Bluetooth, then send again.";
      gwCfgSetStatus(msg);

      /* Arm microphone listener after playback finishes (with a brief 50ms guard) */
      if (!gwAudio.on && (!ble.on || !ble.rxChar)) {
        setTimeout(function () {
          if (gwPendingCfgKey === key) gwStartListening(true);
        }, 50);
      }
    });

    gwPendingCfgTimer = SexcapadesRuntime.TimerManager.setTimeout(function () {
      if (gwPendingCfgKey === key) {
        gwPendingCfgKey = "";
        gwPendingHeatValue = null;
        gwCfgSetStatus("Watch " + key + " didn't acknowledge — check that GibberWear is open, listening, and nearby.");
        if (gwTransientListen) gwStopListening("", true);
      }
    }, 4500);
  }
  if (gwCfgSendBtn) gwCfgSendBtn.addEventListener("click", function () {
    gwSendCfg(gwCfgKeyEl ? gwCfgKeyEl.value : "", gwCfgTimerEl ? gwCfgTimerEl.value : 0, null);
  });
  if (gwCfgKeyEl) gwCfgKeyEl.addEventListener("input", function () { gwEnsureChkOption(gwCfgKeyEl.value.trim()); });
  if (gwChkSendBtn) gwChkSendBtn.addEventListener("click", function () {
    var target = gwKeyFromId(gwChkTargetEl ? gwChkTargetEl.value : "");
    var type = gwChkTypeEl ? gwChkTypeEl.value : "P"; if (type !== "T") type = "P";
    /* bigbuild-1108-1615: broadcast sends carry the explicit ALL signifier
       (CHK:ALL:P / CHK:ALL:T); targeted sends use the key only. Incoming
       unkeyed messages are still treated as broadcast (see gwHandlePayload). */
    var payload = target ? "CHK:" + target + ":" + type : "CHK:ALL:" + type;
    gwSendBoth(payload).then(function (res) {
      gwLinkLog("OUT", payload, res.ble === true ? "Bluetooth" : "ultrasound");
      if (target) gwChkSetStatus("Check-in sent: " + payload + " — only watch " + target + " should answer");
      else gwChkSetStatus("Check-in sent: " + payload + " — broadcast to ALL watches, so every watch in the room should answer.");
    });
  });
  gwPopulateChkTargets();

  /* Heat-slider setup offer (gibberlink-1108-1400): the same CFG send,
     offered inside the heat popover for the profile whose heat is being
     set — but ONLY for a saved profile. The guard: the tab's profile key
     must resolve in the profile store AND be a sample profile, a
     remembered (saved-on-device) profile, or a profile with no unsaved
     changes, and its name must not be the unsaved "New profile" draft.
     When the guard fails the offer stays hidden and nothing is sent. */
  var gwHeatLastKey = "";
  function gwHeatResolveKey() {
    var k = gwHeatLastKey;
    if (!k || !gwValidKey(k)) return "";
    var rawId = k;
    try {
      var api = window.Sexcapades2xProfiles;
      if (!api || typeof api.has !== "function" || !api.has(k)) return "";
      var nm = SexcapadesRuntime.DOM.byId("heatProfileName");
      if (nm && nm.textContent.trim() === "New profile") return "";
      var saved = false;
      if (typeof api.isSample === "function" && api.isSample(k)) saved = true;
      if (!saved && typeof api.isDirty === "function" && !api.isDirty(k)) saved = true;
      if (!saved) { try { var stored = JSON.parse(window.localStorage.getItem("sexcapades_2x_remembered_profiles") || "{}"); if (stored && stored.profiles && stored.profiles[k]) saved = true; } catch (e) {} }
      return saved ? gwKeyFromId(rawId) : "";
    } catch (e) { __sxErrLog("heat-watch-guard", e); return ""; }
  }
  function gwHeatSyncOffer() {
    var offer = SexcapadesRuntime.DOM.byId("heatWatchOffer"); if (!offer) return;
    var pop = SexcapadesRuntime.DOM.byId("heatPopover");
    if (!pop || pop.hidden) { offer.hidden = true; return; }
    var k = gwHeatResolveKey();
    offer.hidden = !k;
    if (k) { var kel = SexcapadesRuntime.DOM.byId("heatWatchKey"); if (kel) kel.textContent = gwKeyLabel(k); offer.setAttribute("data-watch-key", k); }
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-profile-heat]") : null;
    if (t) { gwHeatLastKey = t.getAttribute("data-profile-heat") || ""; try { SexcapadesRuntime.TimerManager.setTimeout(gwHeatSyncOffer, 80); } catch (e) {} }
  }, true);
  var gwHeatPopEl = SexcapadesRuntime.DOM.byId("heatPopover");
  if (gwHeatPopEl && typeof window.MutationObserver === "function") { try { new MutationObserver(function () { gwHeatSyncOffer(); }).observe(gwHeatPopEl, { attributes: true, attributeFilter: ["hidden"] }); } catch (e) { __sxErrLog("heat-watch-observe", e); } }
  var gwHeatSetupBtn = SexcapadesRuntime.DOM.byId("heatWatchSetupBtn");
  if (gwHeatSetupBtn) gwHeatSetupBtn.addEventListener("click", function () {
    var offer = SexcapadesRuntime.DOM.byId("heatWatchOffer");
    var k = offer ? (offer.getAttribute("data-watch-key") || "") : "";
    if (!k) return;
    if (gwCfgKeyEl) gwCfgKeyEl.value = k;
    /* bigbuild-1108-1615 heat-copying: the sync sends the profile's current
       Heat (the slider's live value for this profile) with the setup. */
    var heatEl = SexcapadesRuntime.DOM.byId("heatSlider");
    var heatVal = heatEl ? Number(heatEl.value) : NaN;
    gwSendCfg(k, gwCfgTimerEl ? gwCfgTimerEl.value : 300, SexcapadesRuntime.DOM.byId("heatWatchStatus"), isFinite(heatVal) ? heatVal : null);
  });

  /* ---------------- Play guide Way B: paste-back, Dom playback, GibberLink check-in pulse (guide-1106-0847) ----------------
     The Scene Setter play-guide prompt now requires ONE structured format
     from every AI (see STRUCTURED PLAY GUIDE FORMAT in the Setter prompt):
       [MM:SS-MM:SS] Activity name — guidance for the Dom
     Time codes are elapsed time from scene start (MM:SS or H:MM:SS).
     Activity names come from the fixed set the Setter prompt lists, so
     this parser reads any AI's guide the same way. Queueing a guide builds
     the step timers; while playback runs, the APP holds the clock and
     fires the check-in pulse — the watch is never asked to run a timer
     over GibberLink. Each pulse tries a real GGWave transmit of "CHK"
     (p=4, the same protocol the listener decodes) and always also pulses
     on this device (vibrate + tone + panel flash), and every watch tap or
     metric that lands is stamped with the step scheduled at that moment
     (entry.sched), which is how the journal fills in what was supposed to
     be happening. Playback state is session-only; the queued guide itself
     is saved with the rest of Sentinel's local state. */
  var GUIDE_ACTIVITIES = ["Warm-up","Negotiation check","Bondage","Impact play","Sensation play","Teasing & denial","Oral","Manual stimulation","Penetrative sex","Orgasm control","Roleplay","Service","Worship","Free play","Aftercare","Other"];
  function guideParseClock(tok) {
    var parts = String(tok || "").trim().split(":");
    if (parts.length < 2 || parts.length > 3) return null;
    var nums = [];
    for (var i = 0; i < parts.length; i++) { if (!/^\d{1,3}$/.test(parts[i])) return null; nums.push(parseInt(parts[i], 10)); }
    if (nums.length === 2) return nums[0] * 60 + nums[1];
    return nums[0] * 3600 + nums[1] * 60 + nums[2];
  }
  function guideFmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), r = sec % 60;
    var mm = (h > 0 && m < 10) ? "0" + m : String(m), ss = r < 10 ? "0" + r : String(r);
    return (h > 0 ? h + ":" : "") + mm + ":" + ss;
  }
  function parsePlayGuide(text) {
    var steps = [], skipped = 0, pulseMin = null;
    String(text || "").split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      var cm = /^CHECK-IN\s+EVERY:\s*(\d{1,2})\s*MIN/i.exec(line);
      if (cm) { var pv = parseInt(cm[1], 10); if (pv >= 1 && pv <= 15) pulseMin = pv; return; }
      var m = /^\[?\s*(?:T\s*\+?\s*)?(\d{1,3}:\d{2}(?::\d{2})?)(?:\s*(?:[-–—]|to)\s*(\d{1,3}:\d{2}(?::\d{2})?))?\s*\]?\s*[:\-–—]?\s*(.+)$/i.exec(line);
      if (!m) { skipped++; return; }
      var start = guideParseClock(m[1]), end = m[2] ? guideParseClock(m[2]) : null;
      if (start === null) { skipped++; return; }
      var rest = m[3].trim();
      var activity = rest, note = "";
      var dash = rest.indexOf(" — ");
      if (dash < 0) dash = rest.indexOf(" - ");
      if (dash > 0) { activity = rest.slice(0, dash).trim(); note = rest.slice(dash + 3).trim(); }
      else { var pipe = rest.indexOf("|"); if (pipe > 0) { activity = rest.slice(0, pipe).trim(); note = rest.slice(pipe + 1).trim(); } }
      if (!activity) { skipped++; return; }
      if (end !== null && end <= start) end = null;
      steps.push({ start: start, end: end, activity: activity.slice(0, 80), note: note.slice(0, 300) });
    });
    steps.sort(function (a, b) { return a.start - b.start; });
    for (var i = 0; i < steps.length; i++) { if (steps[i].end === null) steps[i].end = (i + 1 < steps.length) ? steps[i + 1].start : steps[i].start + 300; }
    return { steps: steps, skipped: skipped, pulseMin: pulseMin };
  }
  window.__sxParsePlayGuide = parsePlayGuide;
  var gwGuideInput = SexcapadesRuntime.DOM.byId("gwGuideInput"), gwGuideStatus = SexcapadesRuntime.DOM.byId("gwGuideStatus"),
      gwGuideSteps = SexcapadesRuntime.DOM.byId("gwGuideSteps"), gwGuidePulseSel = SexcapadesRuntime.DOM.byId("gwGuidePulseMin"),
      gwDomPanel = SexcapadesRuntime.DOM.byId("gwDomPanel"),
      gwNowActivity = SexcapadesRuntime.DOM.byId("gwNowActivity"), gwNowNote = SexcapadesRuntime.DOM.byId("gwNowNote"),
      gwNowCount = SexcapadesRuntime.DOM.byId("gwNowCount"), gwNowProgress = SexcapadesRuntime.DOM.byId("gwNowProgress"),
      gwNextActivity = SexcapadesRuntime.DOM.byId("gwNextActivity"), gwNextNote = SexcapadesRuntime.DOM.byId("gwNextNote"),
      gwSceneClock = SexcapadesRuntime.DOM.byId("gwSceneClock"), gwPulseStatus = SexcapadesRuntime.DOM.byId("gwPulseStatus"),
      gwDomList = SexcapadesRuntime.DOM.byId("gwDomList"),
      gwPlayBtn = SexcapadesRuntime.DOM.byId("gwPlayBtn"), gwPauseBtn = SexcapadesRuntime.DOM.byId("gwPauseBtn"), gwStopBtn = SexcapadesRuntime.DOM.byId("gwStopBtn");
  var guidePlay = { on: false, paused: false, startedAt: 0, pausedAt: 0, pausedAccum: 0, stepIdx: -1, nextPulseAt: 0, pulses: 0 };
  function guideElapsedSec() {
    if (!guidePlay.on) return 0;
    var end = guidePlay.paused ? guidePlay.pausedAt : nowMs();
    return Math.max(0, (end - guidePlay.startedAt - guidePlay.pausedAccum) / 1000);
  }
  function guideStepAt(sec) {
    var steps = state.guide.steps;
    for (var i = steps.length - 1; i >= 0; i--) { if (sec >= steps[i].start && sec < steps[i].end) return steps[i]; }
    return null;
  }
  function guideCurrentSched() {
    if (!guidePlay.on || !state.guide.steps.length) return "";
    var st = guideStepAt(guideElapsedSec());
    return st ? st.activity : "";
  }
  var gwTxDiag = "";
  function gwTxText(payload) {
    /* Best-effort real GibberLink transmit: reuse the loaded ggwave lib to
       encode the payload at p=4 and play it. Returns a Promise resolving true
       only when samples have actually finished playing to the audio output;
       anything else resolves false so a status line never claims a chirp
       that did not happen. The stage that failed is kept in gwTxDiag so the
       sender status can name it. */
    return new Promise(function (resolve) {
      try {
        if (!gwLib || typeof gwLib.encode !== "function") { gwTxDiag = "decoder not loaded"; return resolve(false); }
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { gwTxDiag = "Web Audio not available in this browser"; return resolve(false); }
        if (!gwTxText.ctx) gwTxText.ctx = new AC();
        var ctx = gwTxText.ctx;
        if (ctx.state === "suspended") ctx.resume();
        var inst = gwInstance;
        var ownInst = null;
        if (inst === null || inst === undefined) {
          var params = gwLib.getDefaultParameters();
          params.sampleRateInp = ctx.sampleRate; params.sampleRateOut = ctx.sampleRate;
          ownInst = gwLib.init(params); inst = ownInst;
        }
        var samples = gwLib.encode(inst, String(payload), 4, 20);
        if (ownInst !== null && ownInst !== undefined) { try { gwLib.free(ownInst); } catch (e) {} }
        if (!samples || !samples.length) { gwTxDiag = "encode returned no samples"; return resolve(false); }
        /* This ggwave build returns the waveform as an Int8Array of raw
           float32 bytes (a view into the WASM heap), not a Float32Array —
           reinterpret the bytes, or copyToChannel rejects it. */
        var f32;
        if (samples instanceof Float32Array) f32 = samples;
        else if (samples.buffer) f32 = new Float32Array(samples.buffer, samples.byteOffset || 0, Math.floor((samples.byteLength || 0) / 4));
        else f32 = Float32Array.from(samples);
        if (!f32.length) { gwTxDiag = "encode returned no samples"; return resolve(false); }
        var buf = ctx.createBuffer(1, f32.length, ctx.sampleRate);
        buf.copyToChannel(f32, 0);
        var srcNode = ctx.createBufferSource();
        srcNode.buffer = buf;
        srcNode.connect(ctx.destination);
        var durationSec = f32.length / ctx.sampleRate;
        var ended = false;
        function finish() {
          if (ended) return;
          ended = true;
          gwTxDiag = "";
          resolve(true);
        }
        srcNode.onended = finish;
        setTimeout(finish, Math.ceil(durationSec * 1000) + 150);
        srcNode.start();
      } catch (e) {
        __sxErrLog("guide-tx", e);
        gwTxDiag = "error: " + (e && e.message ? e.message : String(e));
        resolve(false);
      }
    });
  }
  function gwSendPayload(payload) {
    /* Ultrasound send for the setup / check-in sender: unlike the guide
       pulse (which only reports a chirp when the listener already loaded
       the decoder), this loads the ggwave lib on demand so a setup can be
       sent without starting the microphone listener first. Resolves true
       only when samples were actually played. */
    if (gwLib) return Promise.resolve(gwTxText(payload));
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return Promise.resolve(false);
    try { if (!gwTxText.ctx) gwTxText.ctx = new AC(); } catch (e) { __sxErrLog("gw-tx-ctx", e); }
    var rate = gwTxText.ctx ? gwTxText.ctx.sampleRate : 48000;
    return gwEnsureDecoder(rate).then(function (ok) { return ok ? gwTxText(payload) : false; });
  }
  function guideTxPulse() {
    return gwTxText("CHK");
  }
  function guideFirePulse(reason) {
    guidePlay.pulses++;
    vibrate([160, 70, 160]);
    gwBeep();
    var sent = false;
    var bleStateVal = null;
    var sched = guideCurrentSched();
    var pulseNo = guidePlay.pulses, firedAt = fmtCT(nowMs());
    function showPulse() {
      if (!gwPulseStatus) return;
      gwPulseStatus.textContent = "Check-in pulse #" + pulseNo + " fired " + firedAt + (reason ? " (" + reason + ")" : "") + (sched ? " — scheduled now: " + sched + "." : ".") + (sent ? " GibberLink chirp \u201CCHK\u201D sent over GGWave p=4." : " Watch chirp not sent (decoder not loaded — Start listening first); this device pulsed instead, and the watch's next tap will be matched to the schedule.") + (bleStateVal === true ? " Check-in pulse \u201CCHK\u201D also written over Bluetooth (GibberLink BLE)." : (bleStateVal === false ? " Bluetooth write failed — the watch may have dropped; reconnect runs automatically and GGWave carries the scene meanwhile." : ""));
    }
    showPulse();
    guideTxPulse().then(function (ok) {
      if (ok) { sent = true; showPulse(); }
    });
    /* Same pulse over BLE when connected (ble-1106-1405): bleSendText
       resolves null when Bluetooth is not connected, so the status line
       only ever claims a Bluetooth send that actually completed. */
    bleSendText("CHK").then(function (bleState) { if (bleState !== null) { bleStateVal = bleState; showPulse(); } });
    if (gwDomPanel) { gwDomPanel.classList.remove("gw-guide-pulse-flash"); void gwDomPanel.offsetWidth; gwDomPanel.classList.add("gw-guide-pulse-flash"); }
  }
  function renderGuide() {
    var g = state.guide;
    if (gwGuideInput && document.activeElement !== gwGuideInput && (!gwGuideInput.value || gwGuideInput.value === (g.text || ""))) gwGuideInput.value = g.text || "";
    if (gwGuidePulseSel && document.activeElement !== gwGuidePulseSel) gwGuidePulseSel.value = String(g.pulseMin || 5);
    if (gwGuideSteps) {
      gwGuideSteps.innerHTML = "";
      g.steps.forEach(function (st) {
        var row = document.createElement("div"); row.className = "gw-guide-step";
        var tm = document.createElement("time"); tm.textContent = guideFmtClock(st.start) + "–" + guideFmtClock(st.end);
        var act = document.createElement("strong"); act.textContent = st.activity;
        var nt = document.createElement("span"); nt.textContent = st.note || "";
        row.appendChild(tm); row.appendChild(act); if (st.note) row.appendChild(nt);
        gwGuideSteps.appendChild(row);
      });
      gwGuideSteps.hidden = !g.steps.length;
    }
    if (gwGuideStatus && !guidePlay.on) {
      gwGuideStatus.textContent = g.steps.length
        ? "Play guide queued: " + g.steps.length + " timed step" + (g.steps.length === 1 ? "" : "s") + ", " + guideFmtClock(g.steps[g.steps.length - 1].end) + " total, check-in pulse every " + g.pulseMin + " min. Press Start playback in the Dom panel when the scene begins."
        : "No play guide queued.";
    }
    if (gwDomPanel) gwDomPanel.hidden = !g.steps.length;
    renderGuidePlayback();
  }
  function renderGuidePlayback() {
    var g = state.guide, steps = g.steps;
    if (!steps.length) return;
    var elapsed = guideElapsedSec();
    var idx = -1;
    for (var i = steps.length - 1; i >= 0; i--) { if (elapsed >= steps[i].start && elapsed < steps[i].end) { idx = i; break; } }
    var cur = idx >= 0 ? steps[idx] : null, nxt = idx + 1 < steps.length ? steps[idx + 1] : null;
    if (gwSceneClock) gwSceneClock.textContent = guideFmtClock(elapsed) + (guidePlay.on ? (guidePlay.paused ? " · paused" : " · playing") : " · not started");
    if (gwNowActivity) gwNowActivity.textContent = !guidePlay.on ? "Queued — press Start playback" : (cur ? cur.activity : (elapsed < steps[0].start ? "Scene starts at " + guideFmtClock(steps[0].start) : "Guide finished"));
    if (gwNowNote) gwNowNote.textContent = cur ? (cur.note || "") : "";
    if (gwNowCount) gwNowCount.textContent = cur && guidePlay.on ? guideFmtClock(cur.end - elapsed) + " left in this step" : "";
    if (gwNowProgress) gwNowProgress.style.width = cur ? Math.min(100, Math.max(0, (elapsed - cur.start) / Math.max(1, cur.end - cur.start) * 100)) + "%" : "0%";
    if (gwNextActivity) gwNextActivity.textContent = nxt ? (guideFmtClock(nxt.start) + " — " + nxt.activity) : "Nothing after this step";
    if (gwNextNote) gwNextNote.textContent = nxt ? (nxt.note || "") : "";
    if (gwPulseStatus && !guidePlay.on) gwPulseStatus.textContent = "Check-in pulse: armed when playback starts — every " + g.pulseMin + " min, plus at every step change. The app holds the timer; the watch holds none.";
    if (gwDomList) {
      gwDomList.innerHTML = "";
      steps.forEach(function (st, i2) {
        var li = document.createElement("li");
        li.textContent = guideFmtClock(st.start) + " " + st.activity;
        if (i2 === idx) li.setAttribute("data-active", "true");
        else if (guidePlay.on && elapsed >= st.end) li.setAttribute("data-done", "true");
        gwDomList.appendChild(li);
      });
    }
    if (gwPlayBtn) gwPlayBtn.disabled = guidePlay.on && !guidePlay.paused;
    if (gwPlayBtn) gwPlayBtn.textContent = guidePlay.paused ? "Resume playback" : "Start playback";
    if (gwPauseBtn) gwPauseBtn.disabled = !guidePlay.on || guidePlay.paused;
    if (gwStopBtn) gwStopBtn.disabled = !guidePlay.on;
  }
  function guideTick() {
    if (!guidePlay.on || guidePlay.paused) return;
    var elapsed = guideElapsedSec();
    var st = guideStepAt(elapsed);
    var idx = st ? state.guide.steps.indexOf(st) : -1;
    if (idx !== guidePlay.stepIdx) {
      var first = guidePlay.stepIdx === -1;
      guidePlay.stepIdx = idx;
      if (!first && st) guideFirePulse("step change — now: " + st.activity);
    }
    if (guidePlay.nextPulseAt && nowMs() >= guidePlay.nextPulseAt) {
      guideFirePulse("scheduled check-in");
      guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
    }
    var last = state.guide.steps[state.guide.steps.length - 1];
    if (last && elapsed >= last.end) {
      guidePlay.on = false; guidePlay.paused = false;
      if (gwGuideStatus) gwGuideStatus.textContent = "Play guide finished — " + state.guide.steps.length + " steps played, " + guidePlay.pulses + " check-in pulses fired. The journal below carries the scheduled activity for every tap.";
      vibrate([200, 80, 200]);
    }
    if (safetyDlg && safetyDlg.open) renderGuidePlayback();
  }
  var gwGuideQueueBtn = SexcapadesRuntime.DOM.byId("gwGuideQueueBtn"), gwGuideClearBtn = SexcapadesRuntime.DOM.byId("gwGuideClearBtn");
  if (gwGuideQueueBtn) gwGuideQueueBtn.addEventListener("click", function () {
    var text = gwGuideInput ? gwGuideInput.value : "";
    var parsed = parsePlayGuide(text);
    if (!parsed.steps.length) {
      if (gwGuideStatus) gwGuideStatus.textContent = "No timed steps found. Each step needs a time code first, like [00:00-05:00] Warm-up — … (Scene Setter's play-guide prompt now asks every AI for exactly this format.)";
      return;
    }
    state.guide.text = text;
    state.guide.steps = parsed.steps;
    state.guide.pulseMin = gwGuidePulseSel ? (+gwGuidePulseSel.value || 5) : 5;
    if (parsed.pulseMin) { var opts = [1, 2, 5, 10, 15], snap = opts[0]; opts.forEach(function (o) { if (Math.abs(o - parsed.pulseMin) < Math.abs(snap - parsed.pulseMin)) snap = o; }); state.guide.pulseMin = snap; if (gwGuidePulseSel) gwGuidePulseSel.value = String(snap); }
    state.guide.queuedAt = nowMs();
    guidePlay.on = false; guidePlay.paused = false; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
    save(); renderGuide();
    if (gwGuideStatus) gwGuideStatus.textContent = "Play guide queued: " + parsed.steps.length + " timed steps" + (parsed.skipped ? " (" + parsed.skipped + " line" + (parsed.skipped === 1 ? "" : "s") + " without a time code skipped)" : "") + ". The Dom play-by-play panel is open below the listener — press Start playback when the scene begins.";
    /* sentinel-density-1108-1545: no scrollIntoView here — queuing a guide must not yank the dialog's scroll position. */
  });
  if (gwGuideClearBtn) gwGuideClearBtn.addEventListener("click", function () {
    state.guide = { text: "", steps: [], pulseMin: state.guide.pulseMin || 5, queuedAt: 0 };
    guidePlay.on = false; guidePlay.paused = false; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
    save(); renderGuide();
  });
  if (gwGuidePulseSel) gwGuidePulseSel.addEventListener("change", function () {
    state.guide.pulseMin = +gwGuidePulseSel.value || 5;
    if (guidePlay.on) guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
    save(); renderGuidePlayback();
  });
  if (gwPlayBtn) gwPlayBtn.addEventListener("click", function () {
    if (guidePlay.paused) {
      guidePlay.pausedAccum += nowMs() - guidePlay.pausedAt;
      guidePlay.paused = false;
      guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
    } else if (!guidePlay.on) {
      guidePlay.on = true; guidePlay.startedAt = nowMs(); guidePlay.pausedAccum = 0; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
      guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
      guideFirePulse("scene start");
    }
    renderGuidePlayback();
  });
  if (gwPauseBtn) gwPauseBtn.addEventListener("click", function () {
    if (!guidePlay.on || guidePlay.paused) return;
    guidePlay.paused = true; guidePlay.pausedAt = nowMs();
    renderGuidePlayback();
  });
  if (gwStopBtn) gwStopBtn.addEventListener("click", function () {
    guidePlay.on = false; guidePlay.paused = false; guidePlay.stepIdx = -1;
    if (gwGuideStatus) gwGuideStatus.textContent = "Playback stopped. The guide stays queued — press Start playback to run it from the top.";
    renderGuidePlayback();
  });


  /* ---------------- Close button + timers ---------------- */
  var closeSafety = SexcapadesRuntime.DOM.byId("closeSafetyButton");
  if (closeSafety) closeSafety.addEventListener("click", function () { closeDialog(safetyDlg); syncBtn(); });

  var lastMissBuzz = 0;
  SexcapadesRuntime.TimerManager.setInterval(function () {
    var ci = state.checkin, n = nowMs(), changed = false;
    if (ci.phase === "running" && ci.nextDue && n >= ci.nextDue) {
      ci.phase = "due"; ci.dueAt = n; changed = true;
      vibrate([180, 80, 180, 80, 180]);
      sentinelNotify('due');
    } else if (ci.phase === "due" && n > ci.dueAt + GRACE_MS) {
      ci.phase = "missed"; changed = true; lastMissBuzz = n;
      vibrate([300, 80, 300]);
      sentinelNotify('missed');
    } else if (ci.phase === "missed" && n - lastMissBuzz > 30000) {
      lastMissBuzz = n; vibrate([200, 60, 200]);
    }
    if (state.post.dueAt && n >= state.post.dueAt && safetyDlg && safetyDlg.open) renderPost();
    guideTick();
    if (changed) save();
    if (safetyDlg && safetyDlg.open && (ci.phase === "running" || ci.phase === "due" || ci.phase === "missed")) renderCheckin();
  }, 500);

  function renderAll() {
    renderSignals(); renderContacts(); hydratePre(); renderCheckin(); renderPost(); renderNotifHint(); renderJournal(); renderGuide();
    gwPopulateChkTargets();
    bleMaybeReconnect();
  }
  window.__sxSentinelRenderAll = renderAll;

  // Link Play Guide playback between Scene Setter and Scene Sentinel
  window.__sxQueueAndPlayGuide = function (text, autoStart) {
    if (text) {
      if (gwGuideInput) gwGuideInput.value = text;
      var parsed = parsePlayGuide(text);
      if (!parsed.steps.length) return false;
      state.guide.text = text;
      state.guide.steps = parsed.steps;
      state.guide.pulseMin = gwGuidePulseSel ? (+gwGuidePulseSel.value || 5) : 5;
      if (parsed.pulseMin) {
        var opts = [1, 2, 5, 10, 15], snap = opts[0];
        opts.forEach(function (o) { if (Math.abs(o - parsed.pulseMin) < Math.abs(snap - parsed.pulseMin)) snap = o; });
        state.guide.pulseMin = snap;
        if (gwGuidePulseSel) gwGuidePulseSel.value = String(snap);
      }
      state.guide.queuedAt = nowMs();
      save();
      renderGuide();
    }
    if (autoStart) {
      if (guidePlay.paused) {
        guidePlay.pausedAccum += nowMs() - guidePlay.pausedAt;
        guidePlay.paused = false;
        guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
      } else if (!guidePlay.on && state.guide.steps.length) {
        guidePlay.on = true; guidePlay.startedAt = nowMs(); guidePlay.pausedAccum = 0; guidePlay.stepIdx = -1; guidePlay.pulses = 0;
        guidePlay.nextPulseAt = nowMs() + state.guide.pulseMin * 60000;
        guideFirePulse("scene start");
      }
      renderGuidePlayback();
    }
    return true;
  };

  window.__sxGetGuidePlayState = function () {
    var curActivity = guideCurrentSched();
    return {
      on: guidePlay.on,
      paused: guidePlay.paused,
      stepIdx: guidePlay.stepIdx,
      steps: state.guide.steps,
      currentActivity: curActivity,
      pulses: guidePlay.pulses,
      elapsedSec: guideElapsedSec(),
      queuedText: state.guide.text || ""
    };
  };

  window.__sxToggleGuidePlay = function () {
    if (guidePlay.on && !guidePlay.paused) {
      if (gwPauseBtn) gwPauseBtn.click();
    } else {
      if (gwPlayBtn) gwPlayBtn.click();
    }
    return guidePlay.on && !guidePlay.paused;
  };

  load();
  hydratePre();
  renderSignals();
  renderContacts();
  renderCheckin();
  renderPost();
  renderJournal();
  renderGuide();
  }
  boot();
})();
});
