// --------------------------------------------------------------------------
// Scene Setter AI Play Guide Generator (BYOK - Bring Your Own Key)
// Mirrors Scribe's compact direct-to-AI treatment without audio narration.
// Uses shared helpers from 01b-ai-byok-core.js (__sxAiByokCore).
// --------------------------------------------------------------------------
__sxInit(function initSceneSetterAi() {
  var core = window.__sxAiByokCore;
  var keyInput = document.getElementById("setterGeminiKey");
  var saveKeyBtn = document.getElementById("setterSaveKeyBtn");
  var clearKeyBtn = document.getElementById("setterClearKeyBtn");
  var keyStatus = document.getElementById("setterKeyStatus");
  var genGuideBtn = document.getElementById("setterGeneratePlayGuideBtn");
  var stopGuideBtn = document.getElementById("setterStopPlayGuideBtn");
  var modelSelect = document.getElementById("setterGeminiModel");
  var guideContainer = document.getElementById("setterPlayGuideOutputContainer");
  var guideText = document.getElementById("setterPlayGuideText");
  var guideStatus = document.getElementById("setterPlayGuideStatus");
  var copyGuideBtn = document.getElementById("setterCopyPlayGuideBtn");
  var downloadGuideBtn = document.getElementById("setterDownloadPlayGuideBtn");
  var providerSelect = document.getElementById("setterAiProvider");
  var getKeyLink = document.getElementById("setterGetKeyLink");
  var setterGenerateBtn = document.getElementById("setterGenerateBtn");
  var setterAiPanel = document.getElementById("setterAiPanel");

  function setterIsModeration() {
    return !!(window.__SX_SETTER && window.__SX_SETTER.genre === "moderation");
  }

  var activeAbortController = null;

  function getActiveProvider() {
    return core.getActiveProvider(providerSelect);
  }

  function getStorageKey(provider) {
    return core.getStorageKey(provider);
  }

  function queryAvailableModels(apiKey, provider) {
    return core.queryAvailableModels(apiKey, provider);
  }

  function populateModelOptions(apiKey, provider) {
    return core.populateModelOptions(modelSelect, apiKey, provider, {
      preferredSecondGeminiModel: "gemini-3.8-flash"
    });
  }

  function updateKeyUI(hasKey) {
    core.updateKeyUI(keyStatus, getActiveProvider(), hasKey, "play guide");
  }

  var keyCtx = {
    providerSelect: providerSelect,
    keyInput: keyInput,
    saveKeyBtn: saveKeyBtn,
    clearKeyBtn: clearKeyBtn,
    keyStatus: keyStatus,
    getKeyLink: getKeyLink,
    modelSelect: modelSelect,
    emptyNoun: "play guide",
    modelOpts: { preferredSecondGeminiModel: "gemini-3.8-flash" },
    onStateChange: function() { setterSyncGenerateLabel(); negGuideRefreshKeyUILight(); }
  };

  function loadSavedKey() {
    core.loadSavedKey(keyCtx);
  }

  function setterAiSetupReady() {
    return Boolean(core.getStoredOrInputKey(keyInput, getActiveProvider()));
  }

  function setterSyncGenerateLabel() {
    if (!setterGenerateBtn) return;
    if (!setterAiSetupReady()) {
      setterGenerateBtn.textContent = "Pick your AI";
      return;
    }
    var hasGuide = guideText && guideText.value && guideText.value.trim().length > 0;
    setterGenerateBtn.textContent = hasGuide ? "↻ Regenerate" : (setterIsModeration() ? "✨ Generate Discussion Plan" : "✨ Generate Play Guide");
  }
  window.__sxSetterSyncGenerateLabel = setterSyncGenerateLabel;
  setterSyncGenerateLabel();

  function setterOpenAiPanel() {
    if (setterAiPanel) {
      try { setterAiPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
    }
    if (keyInput) keyInput.focus();
    setterSyncGenerateLabel();
  }

  core.bindKeyControls(keyCtx);
  loadSavedKey();

  if (copyGuideBtn) {
    copyGuideBtn.addEventListener("click", async function() {
      var text = (guideText ? guideText.value : "").trim();
      if (!text) return;
      await core.copyTextWithFeedback(text, guideText, copyGuideBtn, "Copy play guide");
    });
  }

  if (downloadGuideBtn) {
    downloadGuideBtn.addEventListener("click", function() {
      var text = (guideText ? guideText.value : "").trim();
      if (!text) return;
      var diag = document.getElementById("negotiationDialog");
      var pStr = diag ? diag.dataset.participants || "" : "";
      var ids = pStr.split(",").filter(Boolean);
      var blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "Sexcapades-" + (ids.length ? ids.join("-") : "scene") + "-play-guide.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() { URL.revokeObjectURL(url); }, 0);
    });
  }

  if (stopGuideBtn) {
    stopGuideBtn.addEventListener("click", function() {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
        if (guideStatus) guideStatus.textContent = "Generation cancelled.";
        if (genGuideBtn) genGuideBtn.disabled = false;
        stopGuideBtn.hidden = true;
      }
    });
  }

  if (genGuideBtn) {
    genGuideBtn.addEventListener("click", async function() {
      var ids = typeof window.__sxSetterParticipantIds === "function" ? window.__sxSetterParticipantIds() : [];
      if (!ids || ids.length < 2) {
        var diag = document.getElementById("negotiationDialog");
        var pStr = diag ? diag.dataset.participants || "" : "";
        ids = pStr.split(",").filter(Boolean);
      }

      var prompt = typeof window.__sxPlayGuidePromptText === "function" ? window.__sxPlayGuidePromptText() : "";
      if (!prompt) {
        var panel = document.getElementById("negotiationPanel");
        if (panel && panel.dataset.playGuide) prompt = panel.dataset.playGuide;
      }
      if (!prompt || (!ids || ids.length < 2)) {
        alert("Please select at least two profiles in Scene Setter first.");
        return;
      }

      var prov = getActiveProvider();
      var apiKey = core.getStoredOrInputKey(keyInput, prov);
      if (!apiKey) {
        alert("Please enter and save your " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + (setterIsModeration() ? " API key to generate discussion plans directly with AI." : " API key to generate play guides directly with AI."));
        if (keyInput) keyInput.focus();
        return;
      }

      var model = (modelSelect ? modelSelect.value : "") || (prov === "grok" ? "grok-2" : prov === "openai" ? "gpt-4o" : "gemini-flash-latest");

      if (guideContainer) guideContainer.hidden = false;
      if (guideText) guideText.value = "";
      if (guideStatus) guideStatus.textContent = "Connecting to " + prov.toUpperCase() + " (" + model + ")…";
      if (genGuideBtn) genGuideBtn.disabled = true;
      if (stopGuideBtn) stopGuideBtn.hidden = false;

      try {
        guideContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}

      var stopwatch = core.startStopwatch(guideStatus, "setterStopwatch", "setterStopwatchTime");
      activeAbortController = new AbortController();

      var fetchTimer = setTimeout(function() {
        if (activeAbortController) {
          activeAbortController.abort();
          if (guideStatus) guideStatus.textContent = "Request timed out after 120 seconds.";
        }
      }, 120000);

      var isMod = setterIsModeration();
      var fullPrompt = prompt + (isMod
        ? "\n\nWrite the complete, timed discussion plan now in the EXACT required format specified above, adhering strictly to all ground rules and timecodes."
        : "\n\nWrite the complete, timed play guide now in the EXACT required format specified above, adhering strictly to all checklist agreements and timecodes.");
      var systemPrompt = isMod
        ? "You are an expert discussion moderator who creates structured, balanced, moderated discussion plans."
        : "You are an expert intimacy and scene coordinator who creates structured, consensual, boundaried BDSM and intimacy play guides.";

      var chunkHandler = core.createStreamChunkHandler({
        textEl: guideText,
        statusEl: guideStatus,
        streamingPrefix: function() { return isMod ? "Streaming discussion plan (" : "Streaming play guide ("; }
      });

      try {
        var result = await core.streamTextGeneration({
          provider: prov,
          apiKey: apiKey,
          model: model,
          systemPrompt: systemPrompt,
          fullPrompt: fullPrompt,
          temperature: 0.7,
          useGeminiSystemInstruction: false,
          signal: activeAbortController.signal,
          statusEl: guideStatus,
          logPrefix: "Scene Setter",
          writingPrefix: isMod ? "Writing discussion plan with " : "Writing play guide with ",
          emptyErrorMsg: "Failed to generate play guide across available models.",
          onStreamChunk: chunkHandler.onStreamChunk,
          onClearTimeout: function() { clearTimeout(fetchTimer); }
        });

        var totalText = chunkHandler.state.totalText || result.totalText || "";
        if (guideText && !guideText.value) {
          guideText.value = totalText;
          guideText.scrollTop = guideText.scrollHeight;
        }

        var finalElapsedSec = stopwatch.stop();
        var wordCount = (totalText.trim().match(/\S+/g) || []).length;
        if (guideStatus) {
          guideStatus.textContent = "Complete! (" + wordCount + " words in " + finalElapsedSec + "s via " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + ")";
        }
      } catch (err) {
        stopwatch.stop();
        if (err.name === "AbortError") {
          if (guideStatus) guideStatus.textContent = "Generation stopped by user.";
        } else {
          console.error("[Scene Setter AI Error]", err);
          if (guideStatus) guideStatus.textContent = "Error: " + (err.message || "Failed to generate play guide.");
        }
      } finally {
        clearTimeout(fetchTimer);
        activeAbortController = null;
        if (genGuideBtn) genGuideBtn.disabled = false;
        if (stopGuideBtn) stopGuideBtn.hidden = true;
        setterSyncGenerateLabel();
      }
    });
  }

  if (setterGenerateBtn) {
    setterGenerateBtn.addEventListener("click", function() {
      if (!setterAiSetupReady()) {
        setterOpenAiPanel();
        return;
      }
      if (genGuideBtn && !genGuideBtn.disabled) genGuideBtn.click();
    });
    setterGenerateBtn.addEventListener("dblclick", function() {
      if (setterAiSetupReady() && genGuideBtn && !genGuideBtn.disabled) genGuideBtn.click();
    });
  }

  if (keyInput) keyInput.addEventListener("input", setterSyncGenerateLabel);
  if (guideText) guideText.addEventListener("input", setterSyncGenerateLabel);
  if (saveKeyBtn) saveKeyBtn.addEventListener("click", function() { setTimeout(setterSyncGenerateLabel, 0); });
  if (clearKeyBtn) clearKeyBtn.addEventListener("click", function() { setTimeout(setterSyncGenerateLabel, 0); });
  if (providerSelect) providerSelect.addEventListener("change", setterSyncGenerateLabel);
  setterSyncGenerateLabel();

  // --------------------------------------------------------------------------
  // Play Guide Playback Linking (Scene Setter <-> Scene Sentinel)
  // --------------------------------------------------------------------------
  function handleSetterPlayToggle() {
    var st = typeof window.__sxGetGuidePlayState === "function" ? window.__sxGetGuidePlayState() : null;
    if (st && st.on) {
      if (typeof window.__sxToggleGuidePlay === "function") {
        window.__sxToggleGuidePlay();
      }
      return;
    }

    var text = (guideText ? guideText.value : "").trim();
    if (!text && st && st.queuedText) {
      text = st.queuedText.trim();
      if (guideText) guideText.value = text;
    }
    if (!text) {
      if (!setterAiSetupReady()) {
        setterOpenAiPanel();
      }
      alert("Please generate or paste a play guide first before starting playback.");
      return;
    }

    if (guideContainer) guideContainer.hidden = false;
    if (typeof window.__sxQueueAndPlayGuide === "function") {
      var ok = window.__sxQueueAndPlayGuide(text, true);
      if (!ok) {
        alert("Could not parse timed activities from play guide. Ensure the guide contains timecodes like [00:00-05:00].");
        return;
      }
    }
  }

  var setterPlayBtn = document.getElementById("setterPlayBtn");
  var playGuidePlayBtn = document.getElementById("setterPlayGuidePlayBtn");
  var openSentinelBtn = document.getElementById("setterOpenSentinelBtn");

  if (setterPlayBtn) setterPlayBtn.addEventListener("click", handleSetterPlayToggle);
  if (playGuidePlayBtn) playGuidePlayBtn.addEventListener("click", handleSetterPlayToggle);

  if (openSentinelBtn) {
    openSentinelBtn.addEventListener("click", function() {
      var diag = document.getElementById("negotiationDialog");
      if (diag && typeof diag.close === "function") {
        try { diag.close(); } catch (_) {}
      }
      if (typeof window.__sxOpenSentinel === "function") {
        window.__sxOpenSentinel();
      }
    });
  }

  function syncSentinelPlayStatus() {
    if (typeof window.__sxGetGuidePlayState !== "function") return;
    var st = window.__sxGetGuidePlayState();
    var sPlayBtn = document.getElementById("setterPlayBtn");
    var pgPlayBtn = document.getElementById("setterPlayGuidePlayBtn");
    var dot = document.getElementById("setterPlayDot");
    var live = document.getElementById("setterLivePlayStatus");

    var mm = String(Math.floor(st.elapsedSec / 60)).padStart(2, "0");
    var ss = String(st.elapsedSec % 60).padStart(2, "0");
    var timeStr = mm + ":" + ss;

    if (st.on && !st.paused) {
      if (sPlayBtn) sPlayBtn.textContent = "⏸ Pause (" + timeStr + ")";
      if (pgPlayBtn) pgPlayBtn.textContent = "⏸ Pause Guide";
      if (dot) {
        dot.style.background = "#22c55e";
        dot.style.boxShadow = "0 0 8px #22c55e";
      }
      if (live) {
        var act = st.currentActivity ? (" • " + st.currentActivity) : "";
        var stepInfo = (st.stepIdx >= 0 && st.steps && st.steps.length) ? (" (Step " + (st.stepIdx + 1) + "/" + st.steps.length + ")") : "";
        live.textContent = (setterIsModeration() ? "Running " : "Playing ") + timeStr + act + stepInfo;
        live.style.color = "#4ade80";
      }
    } else if (st.on && st.paused) {
      if (sPlayBtn) sPlayBtn.textContent = "▶ Resume (" + timeStr + ")";
      if (pgPlayBtn) pgPlayBtn.textContent = "▶ Resume Guide";
      if (dot) {
        dot.style.background = "#facc15";
        dot.style.boxShadow = "0 0 6px #facc15";
      }
      if (live) {
        live.textContent = "Paused at " + timeStr + (st.currentActivity ? (" • " + st.currentActivity) : "");
        live.style.color = "#facc15";
      }
    } else {
      if (sPlayBtn) sPlayBtn.textContent = setterIsModeration() ? "▶ Run" : "▶ Play";
      if (pgPlayBtn) pgPlayBtn.textContent = setterIsModeration() ? "▶ Run in Scene Sentinel" : "▶ Play in Scene Sentinel";
      if (dot) {
        dot.style.background = "#64748b";
        dot.style.boxShadow = "none";
      }
      if (live) {
        live.textContent = setterIsModeration() ? "Scene Sentinel: Ready to run" : "Scene Sentinel: Ready to play";
        live.style.color = "#cbd5e1";
      }
    }
  }

  setInterval(syncSentinelPlayStatus, 500);
  syncSentinelPlayStatus();

  // --------------------------------------------------------------------------
  // Negotiation Guide BYOK: discussion plan + readable version (queue item 54)
  // Mirrors the play guide BYOK panel, sharing the same saved API key
  // (same localStorage keys) and the same provider/model defaults.
  // Tone split (Jason, 2026-11-28): the written guide and the readable
  // version are the binding record - DRY AND PRECISE. The discussion
  // plan is the conversation - warm and playful is allowed there, the
  // pre-scene interview agenda - but its limits, safewords and stop
  // signals stay crisp and unambiguous.
  // --------------------------------------------------------------------------
  var negGuideKeyInput = document.getElementById("negGuideGeminiKey");
  var negGuideSaveKeyBtn = document.getElementById("negGuideSaveKeyBtn");
  var negGuideClearKeyBtn = document.getElementById("negGuideClearKeyBtn");
  var negGuideKeyStatus = document.getElementById("negGuideKeyStatus");
  var negGuideGenBtn = document.getElementById("negGuideGenerateBtn");
  var negGuideStopBtn = document.getElementById("negGuideStopBtn");
  var negGuideModelSelect = document.getElementById("negGuideGeminiModel");
  var negGuideContainer = document.getElementById("negGuideOutputContainer");
  var negGuideText = document.getElementById("negGuideOutputText");
  var negGuideStatus = document.getElementById("negGuideStatus");
  var negGuideCopyBtn = document.getElementById("negGuideCopyBtn");
  var negGuideDownloadBtn = document.getElementById("negGuideDownloadBtn");
  var negGuideProviderSelect = document.getElementById("negGuideAiProvider");
  var negGuideGetKeyLink = document.getElementById("negGuideGetKeyLink");
  var negGuideModePlanBtn = document.getElementById("negGuideModePlanBtn");
  var negGuideModeReadableBtn = document.getElementById("negGuideModeReadableBtn");
  var negGuideSigSection = document.getElementById("negGuideSignatureSection");
  var negGuidePlanSigSection = document.getElementById("negGuidePlanSignatureSection");

  var negGuideMode = "plan";
  var negGuideOutputs = { plan: "", readable: "" };
  var negGuideOutputKind = "";
  var negGuideAbortController = null;
  var negGuideLastSigNames = "";
  var negGuideLastGuideText = "";
  var negGuidePlanSigNames = "";
  var negGuideLastPlanText = "";
  var negGuideSigState = {};
  var negGuidePlanSigState = {};

  function negGuideGetActiveProvider() {
    return core.getActiveProvider(negGuideProviderSelect);
  }
  function negGuideSetupReady() {
    return Boolean(core.getStoredOrInputKey(negGuideKeyInput, negGuideGetActiveProvider()));
  }
  // Lightweight cross-panel key refresh (no model fetch): fill an empty
  // key input from storage and update the status line. Used so a key
  // saved in one panel shows as saved in the other without clobbering
  // a half-typed key or spamming the model list.
  function negGuideRefreshKeyUILight() {
    if (!negGuideKeyInput || !negGuideKeyStatus) return;
    try {
      var prov = negGuideGetActiveProvider();
      var stored = localStorage.getItem(core.getStorageKey(prov)) || "";
      if (!negGuideKeyInput.value) negGuideKeyInput.value = stored;
      core.updateKeyUI(negGuideKeyStatus, prov, Boolean(stored), "discussion plan");
    } catch (_) {}
  }
  function playRefreshKeyUILight() {
    if (!keyInput || !keyStatus) return;
    try {
      var prov = getActiveProvider();
      var stored = localStorage.getItem(core.getStorageKey(prov)) || "";
      if (!keyInput.value) keyInput.value = stored;
      core.updateKeyUI(keyStatus, prov, Boolean(stored), "play guide");
    } catch (_) {}
  }
  function negGuideLoadSavedKey() {
    core.loadSavedKey(negGuideKeyCtx);
  }
  var negGuideKeyCtx = {
    providerSelect: negGuideProviderSelect,
    keyInput: negGuideKeyInput,
    saveKeyBtn: negGuideSaveKeyBtn,
    clearKeyBtn: negGuideClearKeyBtn,
    keyStatus: negGuideKeyStatus,
    getKeyLink: negGuideGetKeyLink,
    modelSelect: negGuideModelSelect,
    emptyNoun: "discussion plan",
    modelOpts: { preferredSecondGeminiModel: "gemini-3.8-flash" },
    onStateChange: function() { negGuideSyncGenerateLabel(); playRefreshKeyUILight(); }
  };

  function negGuideSyncGenerateLabel() {
    if (!negGuideGenBtn) return;
    if (!negGuideSetupReady()) {
      negGuideGenBtn.textContent = "Pick your AI";
      return;
    }
    negGuideGenBtn.textContent = negGuideMode === "readable" ? "📄 Generate Readable Version with AI" : "✨ Generate Discussion Plan with AI";
  }
  function negGuideSetMode(mode) {
    negGuideMode = (mode === "readable") ? "readable" : "plan";
    negGuideOutputKind = negGuideMode;
    if (negGuideModePlanBtn) {
      negGuideModePlanBtn.setAttribute("aria-pressed", negGuideMode === "plan" ? "true" : "false");
      if (negGuideModePlanBtn.classList) negGuideModePlanBtn.classList.toggle("primary", negGuideMode === "plan");
    }
    if (negGuideModeReadableBtn) {
      negGuideModeReadableBtn.setAttribute("aria-pressed", negGuideMode === "readable" ? "true" : "false");
      if (negGuideModeReadableBtn.classList) negGuideModeReadableBtn.classList.toggle("primary", negGuideMode === "readable");
    }
    if (negGuideText) {
      negGuideText.value = negGuideOutputs[negGuideMode] || "";
      negGuideText.scrollTop = negGuideText.scrollHeight;
    }
    if (negGuideContainer) negGuideContainer.hidden = !(negGuideOutputs[negGuideMode] && negGuideOutputs[negGuideMode].trim());
    if (negGuideStatus) {
      negGuideStatus.textContent = (negGuideOutputs[negGuideMode] && negGuideOutputs[negGuideMode].trim())
        ? ((negGuideMode === "readable" ? "Readable version" : "Discussion plan") + " — shown above. Generate again to replace it.")
        : "Ready";
    }
    if (negGuidePlanSigSection) {
      negGuidePlanSigSection.hidden = !(negGuideMode === "plan" && negGuideOutputs.plan && negGuideOutputs.plan.trim());
    }
    negGuideSyncGenerateLabel();
  }

  function negGuideParticipantIds() {
    var ids = typeof window.__sxSetterParticipantIds === "function" ? window.__sxSetterParticipantIds() : [];
    if (!ids || ids.length < 2) {
      var diag = document.getElementById("negotiationDialog");
      var pStr = diag ? diag.dataset.participants || "" : "";
      ids = pStr.split(",").filter(Boolean);
    }
    return ids || [];
  }
  function negGuideParticipantNames() {
    var panel = document.getElementById("negotiationPanel");
    var guide = panel ? (panel.dataset.negotiationGuide || "") : "";
    if (!guide) return [];
    var lines = guide.split("\n");
    if (lines.length < 2) return [];
    var first = (lines[0] || "").trim();
    if (first !== "NEGOTIATION GUIDE" && first !== "DISCUSSION AGREEMENT") return [];
    return lines[1].split(" + ").map(function(s) { return s.trim(); }).filter(Boolean);
  }
  function negGuideSkinPrefix() {
    var key = String(window.__SX_ACTIVE_SKIN || "sexcapades");
    var base = key.replace(/capades$/, "");
    return base.charAt(0).toUpperCase() + base.slice(1) + "capades";
  }

  if (negGuideModePlanBtn) negGuideModePlanBtn.addEventListener("click", function() { negGuideSetMode("plan"); });
  if (negGuideModeReadableBtn) negGuideModeReadableBtn.addEventListener("click", function() { negGuideSetMode("readable"); });

  if (negGuideCopyBtn) {
    negGuideCopyBtn.addEventListener("click", async function() {
      var text = (negGuideText ? negGuideText.value : "").trim();
      if (!text) return;
      await core.copyTextWithFeedback(text, negGuideText, negGuideCopyBtn, "Copy");
    });
  }

  if (negGuideDownloadBtn) {
    negGuideDownloadBtn.addEventListener("click", function() {
      var text = (negGuideText ? negGuideText.value : "").trim();
      if (!text) return;
      var ids = negGuideParticipantIds();
      var suffix = negGuideOutputKind === "readable"
        ? (setterIsModeration() ? "readable-discussion-agreement" : "readable-negotiation-guide")
        : "discussion-plan";
      var blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = negGuideSkinPrefix() + "-" + (ids.length ? ids.join("-") : "scene") + "-" + suffix + ".txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() { URL.revokeObjectURL(url); }, 0);
    });
  }

  if (negGuideStopBtn) {
    negGuideStopBtn.addEventListener("click", function() {
      if (negGuideAbortController) {
        negGuideAbortController.abort();
        negGuideAbortController = null;
        if (negGuideStatus) negGuideStatus.textContent = "Generation cancelled.";
        if (negGuideGenBtn) negGuideGenBtn.disabled = false;
        negGuideStopBtn.hidden = true;
      }
    });
  }

  if (negGuideGenBtn) {
    negGuideGenBtn.addEventListener("click", async function() {
      var ids = negGuideParticipantIds();
      var kind = negGuideMode;
      var prompt = "";
      if (kind === "readable") {
        prompt = typeof window.__sxNegotiationReadablePromptText === "function" ? window.__sxNegotiationReadablePromptText() : "";
      } else {
        prompt = typeof window.__sxNegotiationDiscussionPlanPromptText === "function" ? window.__sxNegotiationDiscussionPlanPromptText() : "";
      }
      if (!prompt) {
        var panel = document.getElementById("negotiationPanel");
        if (panel && panel.dataset.negotiationGuide) prompt = panel.dataset.negotiationGuide;
      }
      if (!prompt || !ids || ids.length < 2) {
        alert("Please select at least two profiles in Scene Setter first.");
        return;
      }
      var prov = negGuideGetActiveProvider();
      var apiKey = core.getStoredOrInputKey(negGuideKeyInput, prov);
      if (!apiKey) {
        if (negGuideStatus) negGuideStatus.textContent = "Enter and save your API key first.";
        if (negGuideKeyInput) negGuideKeyInput.focus();
        return;
      }
      var model = (negGuideModelSelect ? negGuideModelSelect.value : "") || (prov === "grok" ? "grok-2" : prov === "openai" ? "gpt-4o" : "gemini-flash-latest");
      var isMod = setterIsModeration();
      var kindLabel = kind === "readable" ? "readable version" : "discussion plan";
      if (negGuideContainer) negGuideContainer.hidden = false;
      if (negGuideText) negGuideText.value = "";
      if (negGuideStatus) negGuideStatus.textContent = "Connecting to " + prov.toUpperCase() + " (" + model + ")…";
      if (negGuideGenBtn) negGuideGenBtn.disabled = true;
      if (negGuideStopBtn) negGuideStopBtn.hidden = false;
      // A fresh generation replaces the stored output and its signatures.
      negGuideOutputs[kind] = "";
      negGuideOutputKind = kind;
      if (kind === "plan" && negGuidePlanSigSection) {
        negGuidePlanSigSection.hidden = true;
        negGuidePlanSigSection.innerHTML = "";
        negGuidePlanSigNames = "";
        negGuidePlanSigState = {};
      }
      try { negGuideContainer.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
      var stopwatch = core.startStopwatch(negGuideStatus, "negGuideStopwatch", "negGuideStopwatchTime");
      negGuideAbortController = new AbortController();
      var fetchTimer = setTimeout(function() {
        if (negGuideAbortController) {
          negGuideAbortController.abort();
          if (negGuideStatus) negGuideStatus.textContent = "Request timed out after 120 seconds.";
        }
      }, 120000);
      var fullPrompt = prompt + (kind === "readable"
        ? "\n\nWrite the complete readable version now, dry and precise, faithful to the agreement above."
        : "\n\nWrite the complete, timed discussion plan now in the EXACT required format specified above, adhering strictly to the agreement and its limits.");
      var systemPrompt = kind === "readable"
        ? "You are an expert at writing clear, precise, plain-language agreements. Write dry and precise: no playful or spicy language, no softening of limits, no invented terms."
        : (isMod
          ? "You are an expert discussion moderator who creates structured, balanced, moderated discussion plans."
          : "You are an expert negotiation facilitator who writes warm, clear discussion plans for a consensual negotiation conversation. Keep every limit, safeword, and stop signal crisp and unambiguous, exactly as agreed.");
      var chunkHandler = core.createStreamChunkHandler({
        textEl: negGuideText,
        statusEl: negGuideStatus,
        streamingPrefix: function() { return kind === "readable" ? "Streaming readable version (" : "Streaming discussion plan ("; }
      });
      try {
        var result = await core.streamTextGeneration({
          provider: prov,
          apiKey: apiKey,
          model: model,
          systemPrompt: systemPrompt,
          fullPrompt: fullPrompt,
          temperature: 0.7,
          useGeminiSystemInstruction: false,
          signal: negGuideAbortController.signal,
          statusEl: negGuideStatus,
          logPrefix: "Negotiation Guide",
          writingPrefix: kind === "readable" ? "Writing readable version with " : "Writing discussion plan with ",
          emptyErrorMsg: "Failed to generate " + kindLabel + " across available models.",
          onStreamChunk: chunkHandler.onStreamChunk,
          onClearTimeout: function() { clearTimeout(fetchTimer); }
        });
        var totalText = chunkHandler.state.totalText || result.totalText || "";
        if (negGuideText && !negGuideText.value) {
          negGuideText.value = totalText;
          negGuideText.scrollTop = negGuideText.scrollHeight;
        }
        negGuideOutputs[kind] = totalText;
        var finalElapsedSec = stopwatch.stop();
        var wordCount = (totalText.trim().match(/\S+/g) || []).length;
        if (negGuideStatus) {
          negGuideStatus.textContent = "Complete! (" + wordCount + " words in " + finalElapsedSec + "s via " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + ")";
        }
        if (kind === "plan") refreshNegGuidePlanSignatures();
      } catch (err) {
        stopwatch.stop();
        if (err.name === "AbortError") {
          if (negGuideStatus) negGuideStatus.textContent = "Generation stopped by user.";
        } else {
          console.error("[Negotiation Guide AI Error]", err);
          if (negGuideStatus) negGuideStatus.textContent = "Error: " + (err.message || ("Failed to generate " + kindLabel + "."));
        }
      } finally {
        clearTimeout(fetchTimer);
        negGuideAbortController = null;
        if (negGuideGenBtn) negGuideGenBtn.disabled = false;
        if (negGuideStopBtn) negGuideStopBtn.hidden = true;
        negGuideSyncGenerateLabel();
      }
    });
  }

  if (negGuideKeyInput) negGuideKeyInput.addEventListener("input", negGuideSyncGenerateLabel);
  if (negGuideText) negGuideText.addEventListener("input", function() {
    if (negGuideOutputKind) negGuideOutputs[negGuideOutputKind] = negGuideText.value;
    // Editing the discussion plan text after signing voids its signatures.
    if (negGuideOutputKind === "plan" && Object.keys(negGuidePlanSigState).length && negGuideText.value !== negGuideLastPlanText) {
      Object.keys(negGuidePlanSigState).forEach(function(n) { delete negGuidePlanSigState[n]; });
      refreshNegGuidePlanSignatures();
    }
    negGuideSyncGenerateLabel();
  });
  if (negGuideSaveKeyBtn) negGuideSaveKeyBtn.addEventListener("click", function() { setTimeout(negGuideSyncGenerateLabel, 0); });
  if (negGuideClearKeyBtn) negGuideClearKeyBtn.addEventListener("click", function() { setTimeout(negGuideSyncGenerateLabel, 0); });
  if (negGuideProviderSelect) negGuideProviderSelect.addEventListener("change", negGuideSyncGenerateLabel);

  // --------------------------------------------------------------------------
  // E-signature forms (queue item 54): a typed-name signature per
  // participant, with a date. The signed text is the dry, precise
  // written guide — nothing signed is warmed up. The form records
  // agreement; it does not assert legal enforceability. A signature
  // applies to the exact text that was current when it was made: if
  // the agreement or plan text changes afterwards, the signatures
  // are cleared and the participants sign the updated version.
  // --------------------------------------------------------------------------
  function negGuideSignatureStatement(isPlan) {
    if (isPlan) return "By signing, I confirm I have read this discussion plan and agree to follow it as the plan for our conversation.";
    return setterIsModeration()
      ? "By signing, I confirm I have read this discussion agreement and agree to its terms and ground rules."
      : "By signing, I confirm I have read this negotiation guide and agree to its terms, limits, and safewords.";
  }
  function negGuideTodayISO() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  function negGuideNowStamp() {
    var d = new Date();
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }
  function negGuideCaptureSigInputs(container) {
    var prev = {};
    if (!container) return prev;
    var rows = container.querySelectorAll("[data-sig-row]");
    rows.forEach(function(row) {
      var name = row.getAttribute("data-sig-row") || "";
      var typed = row.querySelector("[data-sig-typed]");
      var date = row.querySelector("[data-sig-date]");
      if (name) prev[name] = { typed: typed ? typed.value : "", date: date ? date.value : "" };
    });
    return prev;
  }
  function renderNegGuideSignatureBlock(container, opts) {
    if (!container) return;
    var names = opts.names || [];
    var state = opts.state || {};
    var prev = negGuideCaptureSigInputs(container);
    container.innerHTML = "";
    var title = document.createElement("h4");
    title.textContent = opts.title;
    title.style.cssText = "margin: 0 0 6px 0; color: #e2e8f0; font-size: 14px; font-weight: 700;";
    container.appendChild(title);
    var stmt = document.createElement("p");
    stmt.textContent = opts.statement;
    stmt.style.cssText = "font-size: 12px; color: #cbd5e1; margin: 0 0 10px 0;";
    container.appendChild(stmt);
    if (!names.length) {
      var empty = document.createElement("p");
      empty.textContent = "Select two profiles in Scene Setter to sign.";
      empty.style.cssText = "font-size: 12px; color: #94a3b8; margin: 0;";
      container.appendChild(empty);
      return;
    }
    var list = document.createElement("div");
    list.style.cssText = "display: flex; flex-direction: column; gap: 8px;";
    names.forEach(function(name) {
      var signed = state[name] || null;
      var row = document.createElement("div");
      row.setAttribute("data-sig-row", name);
      row.style.cssText = "display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 8px 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 6px;";
      var who = document.createElement("span");
      who.textContent = name;
      who.style.cssText = "font-size: 13px; font-weight: 600; color: #f8fafc; min-width: 90px;";
      row.appendChild(who);
      if (signed) {
        var done = document.createElement("span");
        done.textContent = "Signed ✓ " + signed.typed + " · " + signed.date + " · " + signed.stamp;
        done.style.cssText = "font-size: 12px; color: #4ade80; flex: 1;";
        row.appendChild(done);
        var undo = document.createElement("button");
        undo.type = "button";
        undo.textContent = "Undo";
        undo.className = "action-btn";
        undo.style.cssText = "padding: 4px 10px; font-size: 12px;";
        undo.addEventListener("click", function() {
          delete state[name];
          renderNegGuideSignatureBlock(container, opts);
        });
        row.appendChild(undo);
      } else {
        var typedInput = document.createElement("input");
        typedInput.type = "text";
        typedInput.setAttribute("data-sig-typed", "");
        typedInput.placeholder = "Type full name to sign";
        typedInput.value = (prev[name] && prev[name].typed) || "";
        typedInput.autocomplete = "off";
        typedInput.style.cssText = "flex: 1 1 160px; min-width: 140px; padding: 6px 10px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f8fafc; font-size: 13px;";
        row.appendChild(typedInput);
        var dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.setAttribute("data-sig-date", "");
        dateInput.value = (prev[name] && prev[name].date) || negGuideTodayISO();
        dateInput.style.cssText = "padding: 6px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f8fafc; font-size: 13px;";
        row.appendChild(dateInput);
        var signBtn = document.createElement("button");
        signBtn.type = "button";
        signBtn.textContent = "Sign";
        signBtn.className = "action-btn primary";
        signBtn.style.cssText = "padding: 6px 14px; font-size: 13px;";
        signBtn.addEventListener("click", function() {
          var typed = (typedInput.value || "").trim();
          if (!typed) {
            typedInput.focus();
            if (opts.statusEl) opts.statusEl.textContent = "Type your full name to sign.";
            return;
          }
          state[name] = { typed: typed, date: dateInput.value || negGuideTodayISO(), stamp: negGuideNowStamp() };
          renderNegGuideSignatureBlock(container, opts);
        });
        row.appendChild(signBtn);
      }
      list.appendChild(row);
    });
    container.appendChild(list);
    var allSigned = names.length > 0 && names.every(function(n) { return Boolean(state[n]); });
    var foot = document.createElement("div");
    foot.style.cssText = "display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 10px;";
    if (allSigned) {
      var banner = document.createElement("span");
      banner.textContent = "Signed — all participants.";
      banner.style.cssText = "font-size: 12px; font-weight: 700; color: #4ade80;";
      foot.appendChild(banner);
    }
    var dlBtn = document.createElement("button");
    dlBtn.type = "button";
    dlBtn.textContent = opts.downloadLabel;
    dlBtn.className = "action-btn primary";
    dlBtn.style.cssText = "padding: 6px 12px; font-size: 12px;";
    dlBtn.disabled = !allSigned;
    dlBtn.style.opacity = allSigned ? "1" : "0.5";
    dlBtn.addEventListener("click", function() {
      var text = (typeof opts.getDocText === "function" ? opts.getDocText() : "") || "";
      if (!text.trim()) return;
      var sigLines = names.map(function(n) {
        var s = state[n];
        return s ? (s.typed + " — signed " + s.date + " " + s.stamp) : (n + " — not signed");
      });
      var full = text.trim() + "\n\nSIGNATURES\n" + opts.statement + "\n" + sigLines.join("\n") + "\nThis form records agreement; it does not assert legal enforceability.\n";
      var blob = new Blob([full], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = opts.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() { URL.revokeObjectURL(url); }, 0);
      if (opts.statusEl) opts.statusEl.textContent = "Signed document downloaded.";
    });
    foot.appendChild(dlBtn);
    var note = document.createElement("span");
    note.textContent = "This form records agreement; it does not assert legal enforceability.";
    note.style.cssText = "font-size: 11px; color: #94a3b8;";
    foot.appendChild(note);
    container.appendChild(foot);
  }
  function negGuideSignedFilename(suffix) {
    var ids = negGuideParticipantIds();
    return negGuideSkinPrefix() + "-" + (ids.length ? ids.join("-") : "scene") + "-" + suffix + ".txt";
  }
  function refreshNegGuideSignatures() {
    if (!negGuideSigSection) return;
    var names = negGuideParticipantNames();
    var panel = document.getElementById("negotiationPanel");
    var guideText = panel ? (panel.dataset.negotiationGuide || "") : "";
    var key = names.join(" + ");
    var docChanged = guideText !== negGuideLastGuideText;
    if (key === negGuideLastSigNames && !docChanged && negGuideSigSection.children.length) return;
    negGuideLastSigNames = key;
    if (docChanged) {
      // The agreement text changed — earlier signatures no longer apply.
      Object.keys(negGuideSigState).forEach(function(n) { delete negGuideSigState[n]; });
      negGuideLastGuideText = guideText;
    }
    Object.keys(negGuideSigState).forEach(function(n) {
      if (names.indexOf(n) < 0) delete negGuideSigState[n];
    });
    renderNegGuideSignatureBlock(negGuideSigSection, {
      title: setterIsModeration() ? "Sign the discussion agreement" : "Sign the negotiation guide",
      statement: negGuideSignatureStatement(false),
      names: names,
      getDocText: function() {
        var p = document.getElementById("negotiationPanel");
        return p ? (p.dataset.negotiationGuide || "") : "";
      },
      filename: negGuideSignedFilename(setterIsModeration() ? "signed-discussion-agreement" : "signed-negotiation-guide"),
      downloadLabel: setterIsModeration() ? "Download signed discussion agreement" : "Download signed negotiation guide",
      state: negGuideSigState,
      statusEl: document.getElementById("negotiationGuideStatus")
    });
  }
  function refreshNegGuidePlanSignatures() {
    if (!negGuidePlanSigSection) return;
    var names = negGuideParticipantNames();
    var planText = negGuideOutputs.plan || "";
    if (!planText.trim() || !names.length) {
      negGuidePlanSigSection.hidden = true;
      return;
    }
    if (planText !== negGuideLastPlanText) {
      // The plan text changed — earlier signatures no longer apply.
      Object.keys(negGuidePlanSigState).forEach(function(n) { delete negGuidePlanSigState[n]; });
      negGuideLastPlanText = planText;
    }
    var key = names.join(" + ");
    if (key === negGuidePlanSigNames && negGuidePlanSigSection.children.length && !negGuidePlanSigSection.hidden) return;
    negGuidePlanSigNames = key;
    Object.keys(negGuidePlanSigState).forEach(function(n) {
      if (names.indexOf(n) < 0) delete negGuidePlanSigState[n];
    });
    negGuidePlanSigSection.hidden = false;
    renderNegGuideSignatureBlock(negGuidePlanSigSection, {
      title: "Sign the discussion plan",
      statement: negGuideSignatureStatement(true),
      names: names,
      getDocText: function() { return negGuideOutputs.plan || ""; },
      filename: negGuideSignedFilename("signed-discussion-plan"),
      downloadLabel: "Download signed discussion plan",
      state: negGuidePlanSigState,
      statusEl: negGuideStatus
    });
  }

  // Negotiation guide panel init: default provider to the play guide
  // panel's provider, then load the shared saved key.
  try {
    if (negGuideProviderSelect && providerSelect) negGuideProviderSelect.value = providerSelect.value;
  } catch (_) {}
  core.bindKeyControls(negGuideKeyCtx);
  negGuideLoadSavedKey();
  try {
    if (negGuideModelSelect && modelSelect && modelSelect.value) {
      for (var nmi = 0; nmi < negGuideModelSelect.options.length; nmi++) {
        if (negGuideModelSelect.options[nmi].value === modelSelect.value) { negGuideModelSelect.value = modelSelect.value; break; }
      }
    }
  } catch (_) {}
  negGuideSetMode("plan");
  refreshNegGuideSignatures();
  setInterval(function() { refreshNegGuideSignatures(); }, 1000);

  window.addEventListener("storage", function() {
    loadSavedKey();
    setterSyncGenerateLabel();
    negGuideLoadSavedKey();
    negGuideSyncGenerateLabel();
  });
  var negDialog = document.getElementById("negotiationDialog");
  if (negDialog) {
    negDialog.addEventListener("click", function() {
      setterSyncGenerateLabel();
      refreshNegGuideSignatures();
    });
  }
});
