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

