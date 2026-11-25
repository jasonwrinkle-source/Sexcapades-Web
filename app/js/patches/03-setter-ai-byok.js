// --------------------------------------------------------------------------
// Scene Setter AI Play Guide Generator (BYOK - Bring Your Own Key)
// Mirrors Scribe's compact direct-to-AI treatment without audio narration.
// --------------------------------------------------------------------------
__sxInit(function initSceneSetterAi() {
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

  // Scene Setter skinning (2026-11-16): on a vanilla stance/belief
  // skin, Scene Setter moderates a discussion (genre "moderation" in
  // window.__SX_SETTER, published by the skin loader); on Sexcapades
  // it is a play checklist (genre "play"). The loader publishes the
  // spec on window, so this closure reads it directly. Named without
  // the sx prefix to avoid colliding with the bundle's
  // sxSetterIsModeration (same check, different scope).
  function setterIsModeration() {
    return !!(window.__SX_SETTER && window.__SX_SETTER.genre === "moderation");
  }

  var activeAbortController = null;

  var PROVIDER_CONFIG = {
    gemini: {
      placeholder: "Paste Gemini API key (AIzaSy...)",
      link: "https://aistudio.google.com/app/apikey",
      linkText: "Get free Google AI Studio key ↗",
      defaultModels: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-pro-latest"]
    },
    grok: {
      placeholder: "Paste xAI Grok API key (xai-...)",
      link: "https://console.x.ai",
      linkText: "Get xAI Grok API key ↗",
      defaultModels: ["grok-2", "grok-2-latest", "grok-beta"]
    },
    openai: {
      placeholder: "Paste OpenAI API key (sk-...)",
      link: "https://platform.openai.com/api-keys",
      linkText: "Get OpenAI API key ↗",
      defaultModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]
    }
  };

  function getActiveProvider() {
    return (providerSelect ? providerSelect.value : "gemini") || "gemini";
  }

  function getStorageKey(provider) {
    if (provider === "grok") return "sx_grok_byok_api_key";
    if (provider === "openai") return "sx_openai_byok_api_key";
    return "sx_gemini_byok_api_key";
  }

  async function queryAvailableModels(apiKey, provider) {
    if (!apiKey) return [];
    if (provider === "gemini") {
      try {
        var res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(apiKey));
        if (!res.ok) return [];
        var data = await res.json();
        if (data && data.models) {
          return data.models.filter(function(m) {
            return m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent");
          }).map(function(m) {
            return m.name.replace(/^models\//, "");
          });
        }
      } catch (_) {}
    }
    return PROVIDER_CONFIG[provider]?.defaultModels || [];
  }

  async function populateModelOptions(apiKey, provider) {
    if (!modelSelect) return;
    var models = await queryAvailableModels(apiKey, provider);
    if (!models || models.length === 0) {
      models = PROVIDER_CONFIG[provider]?.defaultModels || [];
    } else if (provider === "gemini") {
      models.sort(function(a, b) {
        if (a === "gemini-flash-latest") return -1;
        if (b === "gemini-flash-latest") return 1;
        if (a === "gemini-3.8-flash") return -1;
        if (b === "gemini-3.8-flash") return 1;
        return 0;
      });
    }
    modelSelect.innerHTML = "";
    models.forEach(function(m, idx) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m + (idx === 0 ? " (Recommended)" : "");
      modelSelect.appendChild(opt);
    });
  }

  function loadSavedKey() {
    var prov = getActiveProvider();
    var cfg = PROVIDER_CONFIG[prov] || PROVIDER_CONFIG.gemini;
    if (keyInput) keyInput.placeholder = cfg.placeholder;
    if (getKeyLink) {
      getKeyLink.href = cfg.link;
      getKeyLink.textContent = cfg.linkText;
    }
    try {
      var saved = localStorage.getItem(getStorageKey(prov)) || "";
      if (keyInput) keyInput.value = saved;
      updateKeyUI(Boolean(saved));
      populateModelOptions(saved, prov);
    } catch (_) {}
  }

  function updateKeyUI(hasKey) {
    var prov = getActiveProvider();
    var provName = prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Google Gemini";
    if (keyStatus) {
      if (hasKey) {
        keyStatus.textContent = provName + " API key saved locally on your device.";
        keyStatus.style.color = "#4ade80";
      } else {
        keyStatus.textContent = "Enter your " + provName + " API key to enable direct play guide generation.";
        keyStatus.style.color = "#94a3b8";
      }
    }
  }

  function setterAiSetupReady() {
    var prov = getActiveProvider();
    var key = "";
    try { key = (keyInput ? keyInput.value : "").trim() || localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
    return Boolean(key);
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
  // The skin loader re-syncs this label on every skin switch (the
  // button text is JS-managed, so the loader's copy swap alone would
  // not reach it); the load-time call below covers the first boot.
  window.__sxSetterSyncGenerateLabel = setterSyncGenerateLabel;
  setterSyncGenerateLabel();

  function setterOpenAiPanel() {
    if (setterAiPanel) {
      try { setterAiPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (_) {}
    }
    if (keyInput) keyInput.focus();
    setterSyncGenerateLabel();
  }

  if (providerSelect) {
    providerSelect.addEventListener("change", function() {
      loadSavedKey();
      setterSyncGenerateLabel();
    });
  }

  if (saveKeyBtn) {
    saveKeyBtn.addEventListener("click", function() {
      var prov = getActiveProvider();
      var val = (keyInput ? keyInput.value : "").trim();
      if (!val) {
        if (keyStatus) { keyStatus.textContent = "Please enter an API key first."; keyStatus.style.color = "#f87171"; }
        return;
      }
      try {
        localStorage.setItem(getStorageKey(prov), val);
        updateKeyUI(true);
        if (keyStatus) { keyStatus.textContent = "API key saved! Loading models…"; keyStatus.style.color = "#4ade80"; }
        populateModelOptions(val, prov).then(function() {
          if (keyStatus) { keyStatus.textContent = "API key verified & ready!"; keyStatus.style.color = "#4ade80"; }
        });
        setterSyncGenerateLabel();
      } catch (err) {
        if (keyStatus) { keyStatus.textContent = "Failed to save key to browser storage."; keyStatus.style.color = "#f87171"; }
      }
    });
  }

  if (clearKeyBtn) {
    clearKeyBtn.addEventListener("click", function() {
      var prov = getActiveProvider();
      try {
        localStorage.removeItem(getStorageKey(prov));
      } catch (_) {}
      if (keyInput) keyInput.value = "";
      updateKeyUI(false);
      populateModelOptions("", prov);
      if (keyStatus) { keyStatus.textContent = "API key removed from this device."; keyStatus.style.color = "#94a3b8"; }
      setterSyncGenerateLabel();
    });
  }

  loadSavedKey();

  if (copyGuideBtn) {
    copyGuideBtn.addEventListener("click", async function() {
      var text = (guideText ? guideText.value : "").trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyGuideBtn.textContent = "Copied!";
        setTimeout(function() { copyGuideBtn.textContent = "Copy play guide"; }, 1600);
      } catch (_) {
        if (guideText) {
          guideText.select();
          document.execCommand("copy");
          copyGuideBtn.textContent = "Copied!";
          setTimeout(function() { copyGuideBtn.textContent = "Copy play guide"; }, 1600);
        }
      }
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
      var apiKey = (keyInput ? keyInput.value : "").trim();
      if (!apiKey) {
        try { apiKey = localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
      }
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

      // Stopwatch Busy Indicator
      var stopwatchStart = Date.now();
      var stopwatchTimer = null;
      var swEl = document.getElementById("setterStopwatch");
      var swTime = document.getElementById("setterStopwatchTime");
      if (!swEl && guideStatus && guideStatus.parentNode) {
        swEl = document.createElement("span");
        swEl.id = "setterStopwatch";
        swEl.style.cssText = "display:inline-flex;align-items:center;gap:4px;font-family:monospace;font-size:12px;font-weight:700;color:#facc15;background:rgba(15,23,42,0.85);padding:2px 8px;border-radius:4px;border:1px solid rgba(250,204,21,0.4);margin-left:8px;";
        swEl.innerHTML = '⏱️ <span id="setterStopwatchTime">00:00</span>';
        guideStatus.parentNode.insertBefore(swEl, guideStatus.nextSibling);
        swTime = document.getElementById("setterStopwatchTime");
      }
      if (swEl) swEl.style.display = "inline-flex";
      stopwatchTimer = setInterval(function() {
        var elapsedSec = Math.floor((Date.now() - stopwatchStart) / 1000);
        var mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
        var ss = String(elapsedSec % 60).padStart(2, "0");
        if (swTime) swTime.textContent = mm + ":" + ss;
      }, 200);

      activeAbortController = new AbortController();

      var fetchTimer = setTimeout(function() {
        if (activeAbortController) {
          activeAbortController.abort();
          if (guideStatus) guideStatus.textContent = "Request timed out after 120 seconds.";
        }
      }, 120000);

      var fullPrompt = prompt + (setterIsModeration() ? "\n\nWrite the complete, timed discussion plan now in the EXACT required format specified above, adhering strictly to all ground rules and timecodes." : "\n\nWrite the complete, timed play guide now in the EXACT required format specified above, adhering strictly to all checklist agreements and timecodes.");

      try {
        var totalText = "";

        function onStreamChunk(chunk) {
          if (!chunk) return;
          totalText += chunk;
          if (guideText) {
            guideText.value = totalText;
            guideText.scrollTop = guideText.scrollHeight;
          }
          var wc = (totalText.trim().match(/\S+/g) || []).length;
          if (guideStatus) {
            guideStatus.textContent = (setterIsModeration() ? "Streaming discussion plan (" : "Streaming play guide (") + wc + " words)…";
          }
        }

        if (prov === "grok" || prov === "openai") {
          var chatEndpoint = prov === "grok" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
          console.log("[Scene Setter " + prov.toUpperCase() + "] Sending streaming request to:", chatEndpoint);

          if (guideStatus) guideStatus.textContent = (setterIsModeration() ? "Writing discussion plan with " : "Writing play guide with ") + prov.toUpperCase() + " (" + model + ")…";

          var response = await fetch(chatEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: setterIsModeration() ? "You are an expert discussion moderator who creates structured, balanced, moderated discussion plans." : "You are an expert intimacy and scene coordinator who creates structured, consensual, boundaried BDSM and intimacy play guides." },
                { role: "user", content: fullPrompt }
              ],
              temperature: 0.7,
              stream: true
            }),
            signal: activeAbortController.signal
          });

          clearTimeout(fetchTimer);

          if (!response.ok) {
            var errJson = null;
            try { errJson = await response.json(); } catch (_) {}
            var errMsg = errJson && errJson.error && errJson.error.message ? errJson.error.message : ("HTTP " + response.status);
            throw new Error(errMsg);
          }

          if (response.body && response.body.getReader) {
            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var sseBuf = "";
            for (;;) {
              var step = await reader.read();
              if (step.done) break;
              sseBuf += decoder.decode(step.value, { stream: true });
              var lines = sseBuf.split("\n");
              sseBuf = lines.pop();
              for (var i = 0; i < lines.length; i++) {
                var l = lines[i].trim();
                if (l.indexOf("data: ") === 0) {
                  var dataStr = l.slice(6).trim();
                  if (dataStr === "[DONE]") break;
                  try {
                    var parsed = JSON.parse(dataStr);
                    var delta = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
                    if (delta) onStreamChunk(delta);
                  } catch (_) {}
                }
              }
            }
          } else {
            var fallbackJson = await response.json();
            if (fallbackJson.choices && fallbackJson.choices[0] && fallbackJson.choices[0].message) {
              totalText = fallbackJson.choices[0].message.content || "";
            }
          }
        } else {
          // Google Gemini API with SSE streaming & fallback cascade
          var payload = {
            contents: [
              {
                role: "user",
                parts: [{ text: fullPrompt }]
              }
            ],
            safetySettings: [
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95
            }
          };

          var effectiveModel = model;
          if (!effectiveModel || effectiveModel === "gemini-2.0-flash" || effectiveModel === "gemini-flash-latest") {
            effectiveModel = "gemini-3.8-flash";
          }
          var fallbackModels = [effectiveModel, "gemini-3.8-flash", "gemini-2.5-flash", "gemini-pro-latest", "gemini-flash-latest"];
          fallbackModels = fallbackModels.filter(function(item, pos) { return fallbackModels.indexOf(item) === pos; });

          var streamedSuccessfully = false;
          var lastErrorMsg = "";

          for (var mIdx = 0; mIdx < fallbackModels.length; mIdx++) {
            var currentAttemptModel = fallbackModels[mIdx];
            var streamEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(currentAttemptModel) + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
            console.log("[Scene Setter Gemini BYOK] Attempting (" + (mIdx + 1) + "/" + fallbackModels.length + ") streaming with model:", currentAttemptModel);

            if (guideStatus) {
              guideStatus.textContent = "Connecting stream to " + currentAttemptModel + "…";
            }

            try {
              var response = await fetch(streamEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: activeAbortController.signal
              });

              console.log("[Scene Setter Gemini BYOK] Response status for " + currentAttemptModel + ":", response.status);

              if (!response.ok) {
                var responseText = await response.text();
                var parsed = null;
                try { parsed = JSON.parse(responseText); } catch (_) {}
                var errMsg = parsed && parsed.error && parsed.error.message ? parsed.error.message : ("HTTP " + response.status);
                lastErrorMsg = errMsg;

                if ((response.status === 503 || response.status === 404) && mIdx < fallbackModels.length - 1) {
                  console.warn("[Scene Setter Gemini BYOK] Model " + currentAttemptModel + " unavailable (" + response.status + "). Retrying with " + fallbackModels[mIdx + 1] + "…");
                  continue;
                }
                throw new Error(errMsg);
              }

              if (response.body && response.body.getReader) {
                var reader = response.body.getReader();
                var decoder = new TextDecoder();
                var sseBuf = "";
                for (;;) {
                  var step = await reader.read();
                  if (step.done) break;
                  sseBuf += decoder.decode(step.value, { stream: true });
                  var lines = sseBuf.split("\n");
                  sseBuf = lines.pop();
                  for (var i = 0; i < lines.length; i++) {
                    var l = lines[i].trim();
                    if (l.indexOf("data: ") === 0) {
                      var dataStr = l.slice(6).trim();
                      if (dataStr === "[DONE]") break;
                      try {
                        var chunkJson = JSON.parse(dataStr);
                        if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].content && chunkJson.candidates[0].content.parts) {
                          var partText = chunkJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
                          if (partText) onStreamChunk(partText);
                        }
                        if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].finishReason === "SAFETY") {
                          if (guideStatus) guideStatus.textContent = "Generation halted: triggered safety filter.";
                        }
                      } catch (_) {}
                    }
                  }
                }
                streamedSuccessfully = true;
                break;
              } else {
                var resText = await response.text();
                var fullJson = JSON.parse(resText);
                if (fullJson.candidates && fullJson.candidates[0] && fullJson.candidates[0].content && fullJson.candidates[0].content.parts) {
                  totalText = fullJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
                }
                streamedSuccessfully = true;
                break;
              }
            } catch (attemptErr) {
              if (attemptErr.name === "AbortError") throw attemptErr;
              if (mIdx < fallbackModels.length - 1) {
                console.warn("[Scene Setter Gemini BYOK] Attempt failed: " + attemptErr.message + ". Trying fallback model…");
                continue;
              }
              throw attemptErr;
            }
          }

          clearTimeout(fetchTimer);
          if (!streamedSuccessfully && !totalText) {
            throw new Error(lastErrorMsg || "Failed to generate play guide across available models.");
          }
        }

        if (guideText && !guideText.value) {
          guideText.value = totalText;
          guideText.scrollTop = guideText.scrollHeight;
        }

        if (stopwatchTimer) { clearInterval(stopwatchTimer); stopwatchTimer = null; }
        var finalElapsedSec = Math.floor((Date.now() - stopwatchStart) / 1000);
        var fMm = String(Math.floor(finalElapsedSec / 60)).padStart(2, "0");
        var fSs = String(finalElapsedSec % 60).padStart(2, "0");
        if (swTime) swTime.textContent = fMm + ":" + fSs;

        var wordCount = (totalText.trim().match(/\S+/g) || []).length;
        if (guideStatus) {
          guideStatus.textContent = "Complete! (" + wordCount + " words in " + finalElapsedSec + "s via " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + ")";
        }
      } catch (err) {
        if (stopwatchTimer) { clearInterval(stopwatchTimer); stopwatchTimer = null; }
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

  // Watch for external storage updates or dialog opens
  window.addEventListener("storage", function() {
    loadSavedKey();
    setterSyncGenerateLabel();
  });
  var negDialog = document.getElementById("negotiationDialog");
  if (negDialog) {
    negDialog.addEventListener("click", function() {
      setterSyncGenerateLabel();
    });
  }
});

