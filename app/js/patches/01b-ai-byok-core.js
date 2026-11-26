// --------------------------------------------------------------------------
// Shared AI BYOK Core Helpers (Scribe & Scene Setter)
// Provides unified provider metadata, localStorage key helpers, model discovery,
// stopwatch UI management, and streaming completions (OpenAI/Grok & Gemini SSE).
// --------------------------------------------------------------------------
var __sxAiByokCore = (function() {
  var PROVIDER_CONFIG = {
    gemini: {
      placeholder: "Paste Gemini API key (AIzaSy...)",
      link: "https://aistudio.google.com/app/apikey",
      linkText: "Get free Google AI Studio key ↗",
      defaultModels: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-pro-latest"],
      fallbackModels: ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-pro-latest", "gemini-flash-latest"]
    },
    grok: {
      placeholder: "Paste xAI Grok API key (xai-...)",
      link: "https://console.x.ai",
      linkText: "Get xAI Grok API key ↗",
      defaultModels: ["grok-2", "grok-2-latest", "grok-beta"],
      endpoint: "https://api.x.ai/v1/chat/completions"
    },
    openai: {
      placeholder: "Paste OpenAI API key (sk-...)",
      link: "https://platform.openai.com/api-keys",
      linkText: "Get OpenAI API key ↗",
      defaultModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
      endpoint: "https://api.openai.com/v1/chat/completions"
    }
  };

  function getActiveProvider(providerSelect) {
    return (providerSelect ? providerSelect.value : "gemini") || "gemini";
  }

  function getProviderDisplayName(provider) {
    if (provider === "grok") return "xAI Grok";
    if (provider === "openai") return "OpenAI";
    return "Google Gemini";
  }

  function getStorageKey(provider) {
    if (provider === "grok") return "sx_grok_byok_api_key";
    if (provider === "openai") return "sx_openai_byok_api_key";
    return "sx_gemini_byok_api_key";
  }

  function getStoredOrInputKey(keyInput, provider) {
    var key = (keyInput ? keyInput.value : "").trim();
    if (!key) {
      try { key = localStorage.getItem(getStorageKey(provider)) || ""; } catch (_) {}
    }
    return key.trim();
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
    return (PROVIDER_CONFIG[provider] && PROVIDER_CONFIG[provider].defaultModels) || [];
  }

  async function populateModelOptions(selectEl, apiKey, provider, opts) {
    if (!selectEl) return;
    if (opts && typeof opts.onBeforePopulate === "function") {
      opts.onBeforePopulate(apiKey, provider);
    }
    var models = await queryAvailableModels(apiKey, provider);
    if (!models || models.length === 0) {
      models = (opts && opts.defaultModels && opts.defaultModels[provider]) ||
               (PROVIDER_CONFIG[provider] && PROVIDER_CONFIG[provider].defaultModels) || [];
    } else if (provider === "gemini") {
      var prefSecond = (opts && opts.preferredSecondGeminiModel) || "gemini-3.8-flash";
      models.sort(function(a, b) {
        if (a === "gemini-flash-latest") return -1;
        if (b === "gemini-flash-latest") return 1;
        if (a === prefSecond) return -1;
        if (b === prefSecond) return 1;
        return 0;
      });
    }
    selectEl.innerHTML = "";
    models.forEach(function(m, idx) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m + (idx === 0 ? " (Recommended)" : "");
      selectEl.appendChild(opt);
    });
  }

  function updateKeyUI(keyStatusEl, provider, hasKey, emptyNounFn) {
    var provName = getProviderDisplayName(provider);
    if (!keyStatusEl) return;
    if (hasKey) {
      keyStatusEl.textContent = provName + " API key saved locally on your device.";
      keyStatusEl.style.color = "#4ade80";
    } else {
      var targetNoun = typeof emptyNounFn === "function" ? emptyNounFn() : (emptyNounFn || "content");
      keyStatusEl.textContent = "Enter your " + provName + " API key to enable direct " + targetNoun + " generation.";
      keyStatusEl.style.color = "#94a3b8";
    }
  }

  function loadSavedKey(ctx) {
    var prov = getActiveProvider(ctx.providerSelect);
    var cfg = PROVIDER_CONFIG[prov] || PROVIDER_CONFIG.gemini;
    if (ctx.keyInput) ctx.keyInput.placeholder = cfg.placeholder;
    if (ctx.getKeyLink) {
      ctx.getKeyLink.href = cfg.link;
      ctx.getKeyLink.textContent = cfg.linkText;
    }
    try {
      var saved = localStorage.getItem(getStorageKey(prov)) || "";
      if (ctx.keyInput) ctx.keyInput.value = saved;
      updateKeyUI(ctx.keyStatus, prov, Boolean(saved), ctx.emptyNoun);
      populateModelOptions(ctx.modelSelect, saved, prov, ctx.modelOpts);
    } catch (_) {}
  }

  function bindKeyControls(ctx) {
    if (ctx.providerSelect) {
      ctx.providerSelect.addEventListener("change", function() {
        loadSavedKey(ctx);
        if (typeof ctx.onStateChange === "function") ctx.onStateChange();
      });
    }
    if (ctx.saveKeyBtn) {
      ctx.saveKeyBtn.addEventListener("click", function() {
        var prov = getActiveProvider(ctx.providerSelect);
        var val = (ctx.keyInput ? ctx.keyInput.value : "").trim();
        if (!val) {
          if (ctx.keyStatus) {
            ctx.keyStatus.textContent = "Please enter an API key first.";
            ctx.keyStatus.style.color = "#f87171";
          }
          return;
        }
        try {
          localStorage.setItem(getStorageKey(prov), val);
          updateKeyUI(ctx.keyStatus, prov, true, ctx.emptyNoun);
          if (ctx.keyStatus) {
            ctx.keyStatus.textContent = "API key saved! Loading models…";
            ctx.keyStatus.style.color = "#4ade80";
          }
          populateModelOptions(ctx.modelSelect, val, prov, ctx.modelOpts).then(function() {
            if (ctx.keyStatus) {
              ctx.keyStatus.textContent = "API key verified & ready!";
              ctx.keyStatus.style.color = "#4ade80";
            }
          });
          if (typeof ctx.onStateChange === "function") ctx.onStateChange();
        } catch (err) {
          if (ctx.keyStatus) {
            ctx.keyStatus.textContent = "Failed to save key to browser storage.";
            ctx.keyStatus.style.color = "#f87171";
          }
        }
      });
    }
    if (ctx.clearKeyBtn) {
      ctx.clearKeyBtn.addEventListener("click", function() {
        var prov = getActiveProvider(ctx.providerSelect);
        try { localStorage.removeItem(getStorageKey(prov)); } catch (_) {}
        if (ctx.keyInput) ctx.keyInput.value = "";
        updateKeyUI(ctx.keyStatus, prov, false, ctx.emptyNoun);
        populateModelOptions(ctx.modelSelect, "", prov, ctx.modelOpts);
        if (ctx.keyStatus) {
          ctx.keyStatus.textContent = "API key removed from this device.";
          ctx.keyStatus.style.color = "#94a3b8";
        }
        if (typeof ctx.onStateChange === "function") ctx.onStateChange();
      });
    }
  }

  function startStopwatch(statusEl, stopwatchId, timeSpanId) {
    var start = Date.now();
    var swEl = document.getElementById(stopwatchId);
    var swTime = document.getElementById(timeSpanId);
    if (!swEl && statusEl && statusEl.parentNode) {
      swEl = document.createElement("span");
      swEl.id = stopwatchId;
      swEl.style.cssText = "display:inline-flex;align-items:center;gap:4px;font-family:monospace;font-size:12px;font-weight:700;color:#facc15;background:rgba(15,23,42,0.85);padding:2px 8px;border-radius:4px;border:1px solid rgba(250,204,21,0.4);margin-left:8px;";
      swEl.innerHTML = '⏱️ <span id="' + timeSpanId + '">00:00</span>';
      statusEl.parentNode.insertBefore(swEl, statusEl.nextSibling);
      swTime = document.getElementById(timeSpanId);
    }
    if (swEl) swEl.style.display = "inline-flex";
    var timer = setInterval(function() {
      var elapsedSec = Math.floor((Date.now() - start) / 1000);
      var mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
      var ss = String(elapsedSec % 60).padStart(2, "0");
      if (swTime) swTime.textContent = mm + ":" + ss;
    }, 200);
    return {
      stop: function() {
        if (timer) { clearInterval(timer); timer = null; }
        var finalSec = Math.floor((Date.now() - start) / 1000);
        var fMm = String(Math.floor(finalSec / 60)).padStart(2, "0");
        var fSs = String(finalSec % 60).padStart(2, "0");
        if (swTime) swTime.textContent = fMm + ":" + fSs;
        return finalSec;
      }
    };
  }

  function createStreamChunkHandler(opts) {
    var state = { totalText: "" };
    return {
      state: state,
      onStreamChunk: function(chunk) {
        if (!chunk) return;
        state.totalText += chunk;
        if (opts.textEl) {
          opts.textEl.value = state.totalText;
          opts.textEl.scrollTop = opts.textEl.scrollHeight;
        }
        var wc = (state.totalText.trim().match(/\S+/g) || []).length;
        if (opts.statusEl) {
          var prefix = typeof opts.streamingPrefix === "function" ? opts.streamingPrefix() : (opts.streamingPrefix || "Streaming (");
          opts.statusEl.textContent = prefix + wc + " words)…";
        }
        if (typeof opts.onChunk === "function") {
          opts.onChunk(chunk, state.totalText);
        }
      }
    };
  }

  async function streamTextGeneration(params) {
    var prov = params.provider;
    var apiKey = params.apiKey;
    var model = params.model;
    var systemPrompt = params.systemPrompt;
    var fullPrompt = params.fullPrompt;
    var temperature = params.temperature != null ? params.temperature : 0.7;
    var maxTokens = params.maxTokens;
    var signal = params.signal;
    var statusEl = params.statusEl;
    var logPrefix = params.logPrefix || "AI BYOK";
    var onStreamChunk = params.onStreamChunk;
    var onClearTimeout = params.onClearTimeout;
    var hitTokenLimit = false;
    var totalText = "";

    if (prov === "grok" || prov === "openai") {
      var chatEndpoint = PROVIDER_CONFIG[prov].endpoint;
      console.log("[" + logPrefix + " " + prov.toUpperCase() + "] Sending streaming request to:", chatEndpoint);

      if (statusEl && params.writingPrefix) {
        statusEl.textContent = params.writingPrefix + prov.toUpperCase() + " (" + model + ")…";
      }

      var bodyObj = {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullPrompt }
        ],
        temperature: temperature,
        stream: true
      };
      if (maxTokens) bodyObj.max_tokens = Math.min(16384, maxTokens);

      var response = await fetch(chatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify(bodyObj),
        signal: signal
      });

      if (typeof onClearTimeout === "function") onClearTimeout();

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
                if (delta) {
                  totalText += delta;
                  if (onStreamChunk) onStreamChunk(delta);
                }
                var fr = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].finish_reason;
                if (fr === "length") {
                  hitTokenLimit = true;
                  if (statusEl) statusEl.textContent = "Stopped at the token budget — the output was cut short at the length limit.";
                }
              } catch (_) {}
            }
          }
        }
      } else {
        var fallbackJson = await response.json();
        if (fallbackJson.choices && fallbackJson.choices[0] && fallbackJson.choices[0].message) {
          totalText = fallbackJson.choices[0].message.content || "";
        }
        if (fallbackJson.choices && fallbackJson.choices[0] && fallbackJson.choices[0].finish_reason === "length") {
          hitTokenLimit = true;
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
          temperature: temperature,
          topP: 0.95
        }
      };
      if (systemPrompt && params.useGeminiSystemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemPrompt }] };
      }
      if (maxTokens) {
        payload.generationConfig.maxOutputTokens = Math.min(8192, maxTokens);
      }

      var effectiveModel = model;
      if (!effectiveModel || effectiveModel === "gemini-2.0-flash" || effectiveModel === "gemini-flash-latest") {
        effectiveModel = "gemini-3.8-flash";
      }
      var fallbackModels = [effectiveModel].concat(PROVIDER_CONFIG.gemini.fallbackModels);
      fallbackModels = fallbackModels.filter(function(item, pos) { return fallbackModels.indexOf(item) === pos; });

      var streamedSuccessfully = false;
      var lastErrorMsg = "";

      for (var mIdx = 0; mIdx < fallbackModels.length; mIdx++) {
        var currentAttemptModel = fallbackModels[mIdx];
        var streamEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(currentAttemptModel) + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
        console.log("[" + logPrefix + " Gemini BYOK] Attempting (" + (mIdx + 1) + "/" + fallbackModels.length + ") streaming with model:", currentAttemptModel);

        if (statusEl) {
          statusEl.textContent = "Connecting stream to " + currentAttemptModel + "…";
        }

        try {
          var gResp = await fetch(streamEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: signal
          });

          console.log("[" + logPrefix + " Gemini BYOK] Response status for " + currentAttemptModel + ":", gResp.status);

          if (!gResp.ok) {
            var responseText = await gResp.text();
            var gParsed = null;
            try { gParsed = JSON.parse(responseText); } catch (_) {}
            var gErrMsg = gParsed && gParsed.error && gParsed.error.message ? gParsed.error.message : ("HTTP " + gResp.status);
            lastErrorMsg = gErrMsg;

            if ((gResp.status === 503 || gResp.status === 404) && mIdx < fallbackModels.length - 1) {
              console.warn("[" + logPrefix + " Gemini BYOK] Model " + currentAttemptModel + " unavailable (" + gResp.status + "). Retrying with " + fallbackModels[mIdx + 1] + "…");
              continue;
            }
            throw new Error(gErrMsg);
          }

          if (typeof onClearTimeout === "function") onClearTimeout();

          if (gResp.body && gResp.body.getReader) {
            var gReader = gResp.body.getReader();
            var gDecoder = new TextDecoder();
            var gSseBuf = "";
            for (;;) {
              var gStep = await gReader.read();
              if (gStep.done) break;
              gSseBuf += gDecoder.decode(gStep.value, { stream: true });
              var gLines = gSseBuf.split("\n");
              gSseBuf = gLines.pop();
              for (var gi = 0; gi < gLines.length; gi++) {
                var gl = gLines[gi].trim();
                if (gl.indexOf("data: ") === 0) {
                  var gDataStr = gl.slice(6).trim();
                  if (gDataStr === "[DONE]") break;
                  try {
                    var chunkJson = JSON.parse(gDataStr);
                    if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].content && chunkJson.candidates[0].content.parts) {
                      var partText = chunkJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
                      if (partText) {
                        totalText += partText;
                        if (onStreamChunk) onStreamChunk(partText);
                      }
                    }
                    if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].finishReason === "SAFETY") {
                      if (statusEl) statusEl.textContent = "Generation halted: triggered safety filter.";
                    }
                    if (chunkJson.candidates && chunkJson.candidates[0] && chunkJson.candidates[0].finishReason === "MAX_TOKENS") {
                      hitTokenLimit = true;
                      if (statusEl) statusEl.textContent = "Stopped at the token budget — the output was cut short at the length limit.";
                    }
                  } catch (_) {}
                }
              }
            }
            streamedSuccessfully = true;
            break;
          } else {
            var resText = await gResp.text();
            var fullJson = JSON.parse(resText);
            if (fullJson.candidates && fullJson.candidates[0] && fullJson.candidates[0].content && fullJson.candidates[0].content.parts) {
              totalText = fullJson.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
            }
            if (fullJson.candidates && fullJson.candidates[0] && fullJson.candidates[0].finishReason === "MAX_TOKENS") {
              hitTokenLimit = true;
            }
            streamedSuccessfully = true;
            break;
          }
        } catch (attemptErr) {
          if (attemptErr.name === "AbortError") throw attemptErr;
          if (mIdx < fallbackModels.length - 1) {
            console.warn("[" + logPrefix + " Gemini BYOK] Attempt failed: " + attemptErr.message + ". Trying fallback model…");
            continue;
          }
          throw attemptErr;
        }
      }

      if (typeof onClearTimeout === "function") onClearTimeout();
      if (!streamedSuccessfully && !totalText) {
        throw new Error(lastErrorMsg || (params.emptyErrorMsg || "Failed to generate content across available models."));
      }
    }

    return { totalText: totalText, hitTokenLimit: hitTokenLimit };
  }

  return {
    PROVIDER_CONFIG: PROVIDER_CONFIG,
    getActiveProvider: getActiveProvider,
    getProviderDisplayName: getProviderDisplayName,
    getStorageKey: getStorageKey,
    getStoredOrInputKey: getStoredOrInputKey,
    queryAvailableModels: queryAvailableModels,
    populateModelOptions: populateModelOptions,
    updateKeyUI: updateKeyUI,
    loadSavedKey: loadSavedKey,
    bindKeyControls: bindKeyControls,
    startStopwatch: startStopwatch,
    createStreamChunkHandler: createStreamChunkHandler,
    streamTextGeneration: streamTextGeneration
  };
})();
window.__sxAiByokCore = __sxAiByokCore;
