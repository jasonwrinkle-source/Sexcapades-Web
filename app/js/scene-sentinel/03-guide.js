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
