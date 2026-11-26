// --------------------------------------------------------------------------
// Scribe AI Story Generator (Gemini / Grok / OpenAI BYOK - Bring Your Own Key)
// Uses shared helpers from 01b-ai-byok-core.js (__sxAiByokCore) and connects
// with 02b-scribe-tts-narration.js (__sxScribeNarrate) for live/post narration.
// --------------------------------------------------------------------------
__sxInit(function initScribeGeminiBYOK() {
  var core = window.__sxAiByokCore;
  var keyInput = document.getElementById("scribeGeminiKey");
  var saveKeyBtn = document.getElementById("scribeSaveKeyBtn");
  var clearKeyBtn = document.getElementById("scribeClearKeyBtn");
  var keyStatus = document.getElementById("scribeKeyStatus");
  var genStoryBtn = document.getElementById("scribeGenerateStoryBtn");
  var stopStoryBtn = document.getElementById("scribeStopStoryBtn");
  var modelSelect = document.getElementById("scribeGeminiModel");
  var storyContainer = document.getElementById("scribeStoryOutputContainer");
  var storyText = document.getElementById("scribeStoryText");
  var storyStatus = document.getElementById("scribeStoryStatus");
  var copyStoryBtn = document.getElementById("scribeCopyStoryBtn");
  var downloadStoryBtn = document.getElementById("scribeDownloadStoryBtn");

  var providerSelect = document.getElementById("scribeAiProvider");
  var getKeyLink = document.getElementById("scribeGetKeyLink");

  function getActiveProvider() {
    return core.getActiveProvider(providerSelect);
  }

  function getStorageKey(provider) {
    return core.getStorageKey(provider);
  }

  var activeAbortController = null;
  var autoNarrateAfterStoryGen = false;

  var scribeModelOpts = {
    preferredSecondGeminiModel: "gemini-3.7-flash",
    defaultModels: {
      gemini: ["gemini-flash-latest", "gemini-3.7-flash", "gemini-pro-latest"],
      grok: ["grok-2", "grok-2-latest", "grok-beta"],
      openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]
    },
    onBeforePopulate: function(apiKey, provider) {
      if (provider === "gemini" && window.__sxScribeNarrate && typeof window.__sxScribeNarrate.populateTtsModelOptions === "function") {
        window.__sxScribeNarrate.populateTtsModelOptions(apiKey);
      }
    }
  };

  function scribeTargetNoun() {
    return window.__SX_SCRIBE && "discussion" === window.__SX_SCRIBE.genre ? "discussion" : "story";
  }

  var keyCtx = {
    providerSelect: providerSelect,
    keyInput: keyInput,
    saveKeyBtn: saveKeyBtn,
    clearKeyBtn: clearKeyBtn,
    keyStatus: keyStatus,
    getKeyLink: getKeyLink,
    modelSelect: modelSelect,
    emptyNoun: scribeTargetNoun,
    modelOpts: scribeModelOpts
  };

  function loadSavedKey() {
    core.loadSavedKey(keyCtx);
  }

  core.bindKeyControls(keyCtx);
  loadSavedKey();

  if (copyStoryBtn) {
    copyStoryBtn.addEventListener("click", async function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) return;
      await core.copyTextWithFeedback(text, storyText, copyStoryBtn, "Copy story");
    });
  }

  if (downloadStoryBtn) {
    downloadStoryBtn.addEventListener("click", function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) return;
      var blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "Sexcapades-Story.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() { URL.revokeObjectURL(url); }, 0);
    });
  }

  if (stopStoryBtn) {
    stopStoryBtn.addEventListener("click", function() {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
        if (storyStatus) storyStatus.textContent = "Generation cancelled.";
        if (genStoryBtn) genStoryBtn.disabled = false;
        stopStoryBtn.hidden = true;
      }
    });
  }

  function scribeTokenBudget() {
    var wordsPerUnit = { words: 1, paragraphs: 150, pages: 500, chapters: 2500, minutes: 160 };
    var unit = "paragraphs", val = 5, blank = true;
    try {
      var lenEl = document.getElementById("scribePageCount");
      var unitEl = document.getElementById("scribeLengthUnit");
      var raw = lenEl ? String(lenEl.value || "").trim() : "";
      if (unitEl && unitEl.value && wordsPerUnit[unitEl.value]) unit = unitEl.value;
      if (raw) {
        blank = false;
        var nums = raw.match(/\d+(?:\.\d+)?/g) || [];
        var parsed = nums.map(function(n) { return parseFloat(n); }).filter(function(n) { return isFinite(n) && n > 0; });
        if (parsed.length) val = Math.max.apply(null, parsed);
      }
    } catch (_) {}
    if (blank) { val = 5; }
    var words = val * (wordsPerUnit[unit] || 150);
    var singular = unit.replace(/s$/, "");
    return {
      unit: unit,
      val: val,
      words: words,
      text: val + " " + (1 === val ? singular : unit),
      tokens: Math.min(32768, Math.max(8192, Math.round(words * 4)))
    };
  }

  if (genStoryBtn) {
    genStoryBtn.addEventListener("click", async function() {
      var promptEl = document.getElementById("scenePromptText");
      var prompt = (promptEl ? promptEl.value : "").trim();
      if (!prompt) {
        alert("Please generate a Scribe prompt first by clicking 'Prompt' above.");
        return;
      }

      var prov = getActiveProvider();
      var apiKey = core.getStoredOrInputKey(keyInput, prov);
      if (!apiKey) {
        alert("Please enter and save your " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + " API key to generate " + (window.__SX_SCRIBE && "discussion" === window.__SX_SCRIBE.genre ? "discussions" : "stories") + " directly with AI.");
        if (keyInput) keyInput.focus();
        return;
      }

      var modelSelectEl = document.getElementById("scribeGeminiModel");
      var modelInput = document.getElementById("scribeGeminiModelInput");
      var model = (modelSelectEl ? modelSelectEl.value : "") || (modelInput ? modelInput.value.trim() : "") || (prov === "grok" ? "grok-2" : prov === "openai" ? "gpt-4o" : "gemini-flash-latest");

      if (storyContainer) storyContainer.hidden = false;
      if (storyText) storyText.value = "";
      if (storyStatus) storyStatus.textContent = "Connecting to " + prov.toUpperCase() + " (" + model + ")…";
      if (genStoryBtn) genStoryBtn.disabled = true;
      if (stopStoryBtn) stopStoryBtn.hidden = false;

      try {
        storyContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}

      var stopwatch = core.startStopwatch(storyStatus, "scribeStopwatch", "scribeStopwatchTime");
      activeAbortController = new AbortController();

      var fetchTimer = setTimeout(function() {
        if (activeAbortController) {
          activeAbortController.abort();
          if (storyStatus) storyStatus.textContent = "Request timed out after 120 seconds.";
        }
      }, 120000);

      var isDisc = Boolean(window.__SX_SCRIBE && "discussion" === window.__SX_SCRIBE.genre);
      var systemPrompt = isDisc
        ? "You are an expert essayist, philosopher, and analytical discussion moderator specializing in deeply thoughtful, balanced, and intellectually rigorous discourse between differing viewpoints."
        : "You are an expert creative writer specializing in rich, consensual, descriptive adult fiction and Literotica-style narratives.";

      var scribeBudget = scribeTokenBudget(prompt);
      var fullPrompt = prompt + (isDisc
        ? ("\n\nWrite the complete, comprehensive, and intellectually rigorous discussion now as plain text. Return ONLY plain text prose: do NOT generate code, Python scripts, ReportLab commands, or meta commentary." +
           "\n\nTarget length: approximately " + scribeBudget.text + " (around " + scribeBudget.words + " words total). Each paragraph must be rich, substantive, and fully developed across multiple sentences, thoroughly examining the principles, objections, and implications. Do not output brief or one-sentence paragraphs. Do not stop early: keep writing until the full target length is reached.")
        : ("\n\nWrite the complete, immersive narrative scene now as plain text, strictly honoring all character roles, boundaries, and pacing detailed above. Return ONLY plain text prose: do NOT generate code, Python scripts, ReportLab commands, or PDF/file outputs." +
           "\n\nTarget length: " + scribeBudget.text + ". Do not stop early: keep writing until the full target length is reached."));

      var narrateBridge = window.__sxScribeNarrate;

      try {
        if (autoNarrateAfterStoryGen && narrateBridge && typeof narrateBridge.beginLiveSession === "function") {
          var gemKey = core.getStoredOrInputKey(keyInput, "gemini");
          narrateBridge.beginLiveSession(gemKey);
        }

        var chunkHandler = core.createStreamChunkHandler({
          textEl: storyText,
          statusEl: storyStatus,
          streamingPrefix: function() { return isDisc ? "Streaming discussion (" : "Streaming story ("; },
          onChunk: function(chunk) {
            if (narrateBridge && typeof narrateBridge.feedLiveChunk === "function") {
              narrateBridge.feedLiveChunk(chunk);
            }
          }
        });

        var result = await core.streamTextGeneration({
          provider: prov,
          apiKey: apiKey,
          model: model,
          systemPrompt: systemPrompt,
          fullPrompt: fullPrompt,
          temperature: 0.9,
          maxTokens: scribeBudget.tokens,
          useGeminiSystemInstruction: true,
          signal: activeAbortController.signal,
          statusEl: storyStatus,
          logPrefix: "Scribe",
          writingPrefix: isDisc ? "Writing discussion with " : "Writing story with ",
          emptyErrorMsg: "Failed to generate story across available models.",
          onStreamChunk: chunkHandler.onStreamChunk,
          onClearTimeout: function() { clearTimeout(fetchTimer); }
        });

        var totalText = chunkHandler.state.totalText || result.totalText || "";
        var hitTokenLimit = result.hitTokenLimit;

        if (storyText && !storyText.value) {
          storyText.value = totalText;
          storyText.scrollTop = storyText.scrollHeight;
        }

        var finalElapsedSec = stopwatch.stop();
        var wordCount = (totalText.trim().match(/\S+/g) || []).length;
        if (storyStatus) {
          storyStatus.textContent = "Complete! (" + wordCount + " words in " + finalElapsedSec + "s via " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + ")" + (hitTokenLimit ? " — stopped at the token budget; the output was cut short. Raise the target length or regenerate for the full length." : "");
        }

        if (narrateBridge && typeof narrateBridge.finishLiveSession === "function") {
          narrateBridge.finishLiveSession();
        }

        if (autoNarrateAfterStoryGen) {
          autoNarrateAfterStoryGen = false;
          var startNarrateBtn = document.getElementById("scribeStartNarrateBtn");
          var mode = narrateBridge && typeof narrateBridge.mode === "function" ? narrateBridge.mode() : null;
          if (!mode && startNarrateBtn) {
            setTimeout(function() {
              startNarrateBtn.click();
            }, 300);
          }
        }
      } catch (err) {
        if (narrateBridge && typeof narrateBridge.finishLiveSession === "function") {
          try { narrateBridge.finishLiveSession(); } catch (_) {}
        }
        autoNarrateAfterStoryGen = false;
        stopwatch.stop();
        if (err.name === "AbortError") {
          if (storyStatus) storyStatus.textContent = "Generation stopped by user.";
        } else {
          console.error("[Scribe AI Error]", err);
          if (storyStatus) storyStatus.textContent = "Error: " + err.message;
        }
      } finally {
        stopwatch.stop();
        if (genStoryBtn) genStoryBtn.disabled = false;
        if (stopStoryBtn) stopStoryBtn.hidden = true;
        activeAbortController = null;
        scribeSyncGenerateLabel();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Scribe compact three-button row (Prompt / Generate / Play).
  // The Prompt button keeps the existing #generateScribePrompt id (new label),
  // so its wiring in 05-compatibility.js is untouched.
  // --------------------------------------------------------------------------
  var scribeGenerateBtn = document.getElementById("scribeGenerateBtn");
  var scribePlayBtn = document.getElementById("scribePlayBtn");
  var scribeAiPanel = document.getElementById("scribeAiPanel");

  function scribeAiSetupReady() {
    var prov = getActiveProvider();
    var key = "";
    try { key = (keyInput ? keyInput.value : "").trim() || localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
    return Boolean(key);
  }

  function scribeSyncGenerateLabel() {
    if (!scribeGenerateBtn) return;
    if (!scribeAiSetupReady()) { scribeGenerateBtn.textContent = "Pick your AI"; return; }
    // Set up: label stays on the compact button only — it just renames to
    // Regenerate once a story exists, never grows into a full-width control.
    var hasStory = storyText && storyText.value && storyText.value.trim().length > 0;
    scribeGenerateBtn.textContent = hasStory ? "↻ Regenerate" : "✨ Generate";
  }

  function scribeOpenAiPanel() {
    if (scribeAiPanel) {
      try { scribeAiPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
    }
    if (keyInput) keyInput.focus();
    scribeSyncGenerateLabel();
  }

  if (scribeGenerateBtn) {
    scribeGenerateBtn.addEventListener("click", function() {
      if (!scribeAiSetupReady()) {
        var promptEl0 = document.getElementById("scenePromptText");
        var briefEl0 = document.getElementById("sceneBrief");
        if ((!promptEl0 || !promptEl0.value.trim()) && briefEl0 && briefEl0.hidden) {
          var promptBtn0 = document.getElementById("generateScribePrompt");
          if (promptBtn0) promptBtn0.click();
        }
        scribeOpenAiPanel();
        return;
      }
      var promptEl = document.getElementById("scenePromptText");
      if (promptEl && !promptEl.value.trim()) {
        var promptBtn = document.getElementById("generateScribePrompt");
        if (promptBtn) promptBtn.click();
      }
      if (genStoryBtn) genStoryBtn.click();
    });
    scribeGenerateBtn.addEventListener("dblclick", function() {
      if (scribeAiSetupReady() && genStoryBtn && !genStoryBtn.disabled) genStoryBtn.click();
    });
  }

  if (scribePlayBtn) {
    scribePlayBtn.addEventListener("click", function() {
      var narrateBridge = window.__sxScribeNarrate;
      if (narrateBridge && typeof narrateBridge.ensureAudioCtxRunning === "function") {
        narrateBridge.ensureAudioCtxRunning();
      }

      // 1. If currently speaking/narrating, toggle pause/resume
      var playbackState = narrateBridge && typeof narrateBridge.getPlaybackState === "function"
        ? narrateBridge.getPlaybackState()
        : { isSpeaking: false, isPaused: false };

      if (playbackState.isSpeaking || playbackState.isPaused) {
        var pauseNarrateBtn = document.getElementById("scribePauseNarrateBtn");
        var stopNarrateBtn = document.getElementById("scribeStopNarrateBtn");
        if (pauseNarrateBtn && !pauseNarrateBtn.hidden) {
          pauseNarrateBtn.click();
        } else if (playbackState.isSpeaking && stopNarrateBtn) {
          stopNarrateBtn.click();
        }
        return;
      }

      // 2. If story generation is already running, mark to narrate when complete
      if (genStoryBtn && genStoryBtn.disabled) {
        autoNarrateAfterStoryGen = true;
        scribePlayBtn.textContent = "⏳ Narrating after generation…";
        return;
      }

      // 3. If story already generated and non-empty, start narration immediately
      var text = (storyText ? storyText.value : "").trim();
      if (text && text.length > 30) {
        var startNarrateBtn = document.getElementById("scribeStartNarrateBtn");
        if (startNarrateBtn) startNarrateBtn.click();
        return;
      }

      // 4. One-click flow: Generate prompt -> Generate story -> Narrate story
      if (!scribeAiSetupReady()) {
        var promptEl0 = document.getElementById("scenePromptText");
        var briefEl0 = document.getElementById("sceneBrief");
        if ((!promptEl0 || !promptEl0.value.trim()) && briefEl0 && briefEl0.hidden) {
          var promptBtn0 = document.getElementById("generateScribePrompt");
          if (promptBtn0) promptBtn0.click();
        }
        scribeOpenAiPanel();
        alert("Please enter and save your API key in Scribe to generate and narrate stories.");
        return;
      }

      var promptBtn = document.getElementById("generateScribePrompt");
      if (promptBtn) promptBtn.click();

      autoNarrateAfterStoryGen = true;
      scribePlayBtn.textContent = "⏳ Generating…";
      setTimeout(function() {
        if (genStoryBtn && !genStoryBtn.disabled) genStoryBtn.click();
      }, 50);
    });
  }

  function syncScribePlayBtnState() {
    if (!scribePlayBtn) return;
    if (autoNarrateAfterStoryGen) {
      scribePlayBtn.textContent = "⏳ Generating…";
      return;
    }
    var narrateBridge = window.__sxScribeNarrate;
    var playbackState = narrateBridge && typeof narrateBridge.getPlaybackState === "function"
      ? narrateBridge.getPlaybackState()
      : { isSpeaking: false, isPaused: false };

    if (playbackState.isSpeaking) {
      scribePlayBtn.textContent = "⏸ Pause";
      scribePlayBtn.style.background = "#eab308";
    } else if (playbackState.isPaused) {
      scribePlayBtn.textContent = "▶ Resume";
      scribePlayBtn.style.background = "#059669";
    } else {
      scribePlayBtn.textContent = "▶ Play";
      scribePlayBtn.style.background = "";
    }
  }

  setInterval(syncScribePlayBtnState, 500);
  syncScribePlayBtnState();

  // Keep the Generate label in step with the key/provider state.
  if (keyInput) keyInput.addEventListener("input", scribeSyncGenerateLabel);
  if (storyText) storyText.addEventListener("input", scribeSyncGenerateLabel);
  if (saveKeyBtn) saveKeyBtn.addEventListener("click", function() { setTimeout(scribeSyncGenerateLabel, 0); });
  if (clearKeyBtn) clearKeyBtn.addEventListener("click", function() { setTimeout(scribeSyncGenerateLabel, 0); });
  if (providerSelect) providerSelect.addEventListener("change", scribeSyncGenerateLabel);
  scribeSyncGenerateLabel();
});
