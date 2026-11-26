// Sexcapades Runtime Patches Entry
// Most runtime patches have been folded into modular source files in app/js/modules/
// (01-dispatcher through 09-profile-storage and view-nav.js).
// This file serves as the fallback queue gate and houses client-side Gemini BYOK generation for Scribe.

var __sxInitQueue = window.__sxInitQueue || [];
var __sxInitFlushed = window.__sxInitFlushed || false;
function __sxRunInit(fn) {
  try { fn(); } catch (e) { if (typeof __sxErrLog === "function") __sxErrLog("consolidated-init", e); }
}
var __sxInit = window.__sxInit || function(fn) {
  if (window.__sxInitFlushed) { __sxRunInit(fn); return; }
  __sxInitQueue.push(fn);
};
function __sxFlushInit() {
  if (window.__sxInitFlushed) return;
  window.__sxInitFlushed = true;
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

  async function copyTextWithFeedback(text, fallbackInputEl, buttonEl, restoreLabel, copiedLabel, delayMs) {
    if (!text) return false;
    var flashLabel = copiedLabel || "Copied!";
    var restore = restoreLabel || (buttonEl ? buttonEl.textContent : "Copy");
    var waitMs = delayMs || 1600;
    var copied = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (_) {}
    if (!copied && fallbackInputEl && typeof fallbackInputEl.select === "function") {
      try {
        fallbackInputEl.select();
        document.execCommand("copy");
        copied = true;
      } catch (_) {}
    }
    if (copied && buttonEl) {
      buttonEl.textContent = flashLabel;
      setTimeout(function() { buttonEl.textContent = restore; }, waitMs);
    }
    return copied;
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
    streamTextGeneration: streamTextGeneration,
    copyTextWithFeedback: copyTextWithFeedback
  };
})();
window.__sxAiByokCore = __sxAiByokCore;

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

// --------------------------------------------------------------------------
// Scribe Story Narration (Gemini TTS Streaming Audio + SpeechSynthesis fallback)
// Exposes window.__sxScribeNarrate for live/post narration coordination with
// 02a-scribe-story-gen.js and diagnostic verification.
// --------------------------------------------------------------------------
__sxInit(function initScribeTtsNarration() {
  var core = window.__sxAiByokCore;
  var keyInput = document.getElementById("scribeGeminiKey");
  var storyText = document.getElementById("scribeStoryText");
  var narrateEngine = document.getElementById("scribeNarrateEngine");
  var geminiVoiceGroup = document.getElementById("scribeGeminiVoiceGroup");
  var geminiVoice = document.getElementById("scribeGeminiVoice");
  var narrateSpeedSelect = document.getElementById("scribeNarrateSpeed");
  var startNarrateBtn = document.getElementById("scribeStartNarrateBtn");
  var pauseNarrateBtn = document.getElementById("scribePauseNarrateBtn");
  var stopNarrateBtn = document.getElementById("scribeStopNarrateBtn");
  var narrateStatus = document.getElementById("scribeNarrateStatus");
  var audioPlayer = document.getElementById("scribeAudioPlayer");

  function getStorageKey(provider) {
    return core ? core.getStorageKey(provider) : "sx_gemini_byok_api_key";
  }

  async function populateTtsModelOptions(apiKey) {
    var select = document.getElementById("scribeNarrateModel");
    if (!select) return;
    var models = [
      "gemini-2.5-pro-preview-tts",
      "gemini-2.5-flash-preview-tts",
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-2.5-flash-tts"
    ];
    if (apiKey) {
      try {
        var lmResp = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(apiKey));
        if (lmResp.ok) {
          var lmData = await lmResp.json();
          if (lmData && lmData.models && Array.isArray(lmData.models)) {
            lmData.models.forEach(function(m) {
              var mName = (m.name || "").replace(/^models\//, "");
              var isGen = m.supportedGenerationMethods && m.supportedGenerationMethods.indexOf("generateContent") !== -1;
              if (isGen && mName.indexOf("-tts") !== -1) {
                if (models.indexOf(mName) === -1) models.push(mName);
              }
            });
          }
        }
      } catch (_) {}
    }
    models.sort(function(a, b) {
      var order = {
        "gemini-2.5-pro-preview-tts": 1,
        "gemini-2.5-flash-preview-tts": 2,
        "gemini-3.8-flash-tts": 3,
        "gemini-2.5-flash-tts": 4,
        "gemini-3.8-flash-lite-tts": 5
      };
      var oa = order[a] || 10, ob = order[b] || 10;
      return oa - ob;
    });
    var savedChoice = "";
    try { savedChoice = localStorage.getItem("sx_scribe_narrate_model") || ""; } catch (_) {}
    select.innerHTML = "";
    models.forEach(function(m) {
      var opt = document.createElement("option");
      opt.value = m;
      var label = m;
      if (m === "gemini-2.5-pro-preview-tts") label = "Gemini 2.5 Pro TTS (Studio Quality)";
      else if (m === "gemini-2.5-flash-preview-tts") label = "Gemini 2.5 Flash TTS (Latest / Clean)";
      else if (m === "gemini-3.8-flash-tts") label = "Gemini 3.8 Flash TTS";
      else if (m === "gemini-3.8-flash-lite-tts") label = "Gemini 3.8 Flash Lite TTS (Fast / Crackles)";
      opt.textContent = label;
      select.appendChild(opt);
    });
    if (savedChoice && models.indexOf(savedChoice) !== -1) {
      select.value = savedChoice;
    } else {
      select.value = "gemini-2.5-pro-preview-tts";
    }
  }

  function getNarrateSpeed() {
    var sp = 1.0;
    if (narrateSpeedSelect) {
      sp = parseFloat(narrateSpeedSelect.value) || 1.0;
    }
    return Math.max(0.5, Math.min(2.5, sp));
  }

  if (narrateSpeedSelect) {
    try {
      var savedSpeed = localStorage.getItem("sx_scribe_narrate_speed");
      if (savedSpeed && narrateSpeedSelect.querySelector('option[value="' + savedSpeed + '"]')) {
        narrateSpeedSelect.value = savedSpeed;
      }
    } catch (_) {}
    narrateSpeedSelect.addEventListener("change", function() {
      var sp = getNarrateSpeed();
      try { localStorage.setItem("sx_scribe_narrate_speed", String(sp)); } catch (_) {}
      if (audioPlayer && !audioPlayer.hidden) {
        audioPlayer.playbackRate = sp;
      }
    });
  }

  var browserUtterance = null;
  var audioAbortController = null;

  // --- Streaming Gemini narration (Web Audio queue) ---
  var narrateAudioCtx = null;
  var narrateNextStart = 0;
  var narrateChunksPlayed = 0;
  var narratePlaybackMode = null; // "webaudio" | "audioel" | "browser"
  var narrateGenToken = 0;
  var liveNarrator = null;

  function narrateCloseAudioCtx() {
    if (narrateAudioCtx) {
      try { narrateAudioCtx.close(); } catch (_) {}
      narrateAudioCtx = null;
    }
    narrateNextStart = 0;
  }

  function narrateEnsureAudioCtxRunning() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!narrateAudioCtx || narrateAudioCtx.state === "closed") {
        narrateAudioCtx = new AC();
      }
      if (narrateAudioCtx.state === "suspended") {
        narrateAudioCtx.resume();
      }
      try {
        var unlock = narrateAudioCtx.createBuffer(1, 1, 24000);
        var src = narrateAudioCtx.createBufferSource();
        src.buffer = unlock;
        src.connect(narrateAudioCtx.destination);
        src.start(0);
      } catch (_) {}
      return narrateAudioCtx;
    } catch (_) {
      return null;
    }
  }

  function getAudioPayload(modelName, textToRead, voiceName) {
    var isTts = modelName.indexOf("-tts") !== -1;
    var textContent = isTts
      ? textToRead.slice(0, 4000)
      : ("Read the following text aloud with natural, engaging expressive narration. Do not add introductory or commentary remarks, speak only the exact text provided:\n\n" + textToRead.slice(0, 4000));
    return {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: textContent
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName
            }
          }
        }
      },
      safetySettings: [
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };
  }

  function createLiveStoryNarrator(apiKey, voiceName, modelName, token) {
    var buffer = "";
    var sentenceQueue = [];
    var isProcessing = false;
    var isFinished = false;

    async function processQueue() {
      if (isProcessing) return;
      isProcessing = true;
      while (sentenceQueue.length > 0) {
        if (token !== narrateGenToken) { isProcessing = false; return; }
        var sentence = sentenceQueue.shift();
        if (!sentence || !sentence.trim()) continue;

        var currentVoice = (geminiVoice ? geminiVoice.value : voiceName) || voiceName || "Aoede";

        var audioBase = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName);
        var streamEndpoint = audioBase + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
        var audioEndpoint = audioBase + ":generateContent?key=" + encodeURIComponent(apiKey);
        var payload = getAudioPayload(modelName, sentence.trim(), currentVoice);

        try {
          if (narrateStatus) {
            narrateStatus.textContent = "Narrating live (" + modelName + " · " + currentVoice + ")…";
            narrateStatus.style.color = "#4ade80";
          }
          await narrateStreamGeminiAudio(streamEndpoint, payload, audioAbortController ? audioAbortController.signal : null, token);
          narratePlaybackMode = "webaudio";
        } catch (streamErr) {
          if (token !== narrateGenToken) { isProcessing = false; return; }
          console.warn("[Live Story Narrator] Streaming chunk failed, attempting unary:", streamErr.message);
          try {
            await narratePlayGeminiUnary(audioEndpoint, payload, audioAbortController ? audioAbortController.signal : null, modelName);
          } catch (uErr) {
            if (token !== narrateGenToken) { isProcessing = false; return; }
            console.warn("[Live Story Narrator] Unary failed:", uErr.message);
            if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== "undefined") {
              try {
                await new Promise(function(resolve) {
                  var utt = new SpeechSynthesisUtterance(sentence.trim());
                  utt.rate = typeof getNarrateSpeed === "function" ? getNarrateSpeed() : 1.0;
                  utt.onend = function() { resolve(); };
                  utt.onerror = function() { resolve(); };
                  window.speechSynthesis.speak(utt);
                });
              } catch (_) {}
            }
          }
        }
      }
      isProcessing = false;
      if (isFinished && sentenceQueue.length === 0) {
        if (narrateStatus) narrateStatus.textContent = "Finished live narration.";
        if (startNarrateBtn) startNarrateBtn.disabled = false;
      }
    }

    return {
      feed: function(chunkText) {
        if (token !== narrateGenToken) return;
        buffer += chunkText;
        var parts = buffer.split(/([.!?]+(?:\s+|\n+)|(?:\r?\n){2,})/);
        if (parts.length > 2) {
          var assembled = "";
          for (var p = 0; p < parts.length - 1; p += 2) {
            var sent = (parts[p] + (parts[p + 1] || "")).trim();
            if (sent) {
              if (assembled.length < 80) {
                assembled += (assembled ? " " : "") + sent;
              } else {
                sentenceQueue.push(assembled);
                assembled = sent;
              }
            }
          }
          if (assembled) {
            if (assembled.length >= 80) {
              sentenceQueue.push(assembled);
              assembled = "";
            }
          }
          buffer = (assembled ? assembled + " " : "") + (parts[parts.length - 1] || "");
          processQueue();
        }
      },
      finish: function() {
        if (token !== narrateGenToken) return;
        isFinished = true;
        if (buffer.trim()) {
          sentenceQueue.push(buffer.trim());
          buffer = "";
        }
        processQueue();
      }
    };
  }

  function narrateQueuePcmChunk(pcmBytes) {
    if (!pcmBytes || pcmBytes.length < 2) return false;
    try {
      if (!narrateAudioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        narrateAudioCtx = new AC();
      }
      if (narrateAudioCtx.state === "suspended") narrateAudioCtx.resume();

      var offset = 0;
      if (pcmBytes.length > 44 &&
          pcmBytes[0] === 0x52 && pcmBytes[1] === 0x49 && pcmBytes[2] === 0x46 && pcmBytes[3] === 0x46 &&
          pcmBytes[8] === 0x57 && pcmBytes[9] === 0x41 && pcmBytes[10] === 0x56 && pcmBytes[11] === 0x45) {
        offset = 44;
      }
      var pcmData = offset > 0 ? pcmBytes.subarray(offset) : pcmBytes;
      var len = Math.floor(pcmData.length / 2);
      if (len < 1) return false;
      var buf = narrateAudioCtx.createBuffer(1, len, 24000);
      var ch = buf.getChannelData(0);
      var view = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
      for (var i = 0; i < len; i++) ch[i] = view.getInt16(i * 2, true) / 32768;
      var src = narrateAudioCtx.createBufferSource();
      src.buffer = buf;
      var speed = getNarrateSpeed();
      src.playbackRate.value = speed;
      src.connect(narrateAudioCtx.destination);
      var now = narrateAudioCtx.currentTime;
      if (narrateNextStart < now) narrateNextStart = now + 0.05;
      src.start(narrateNextStart);
      narrateNextStart += (buf.duration / speed);
      narrateChunksPlayed++;
      return true;
    } catch (_) { return false; }
  }

  function narrateBase64ToBytes(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function narrateStreamGeminiAudio(streamEndpoint, payload, signal, myToken) {
    var resp = await fetch(streamEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: signal
    });
    if (!resp.ok) {
      var errObj = null;
      try { errObj = await resp.json(); } catch (_) {}
      var msg = errObj && errObj.error && errObj.error.message ? errObj.error.message : ("HTTP " + resp.status);
      throw new Error(msg);
    }
    if (!resp.body || !resp.body.getReader) throw new Error("Streaming response not supported in this browser.");
    var reader = resp.body.getReader();
    var decoder = new TextDecoder();
    var textBuf = "";
    var consumed = 0;
    var played = 0;
    var pairRe = /"mimeType"\s*:\s*"[^"]*"\s*,\s*"data"\s*:\s*"([A-Za-z0-9+/=]+)"/g;
    var pairRe2 = /"data"\s*:\s*"([A-Za-z0-9+/=]+)"\s*,\s*"mimeType"\s*:\s*"[^"]*"/g;
    var dataRe = /"data"\s*:\s*"([A-Za-z0-9+/=]{200,})"/g;
    for (;;) {
      var step = await reader.read();
      if (step.done) break;
      if (myToken !== narrateGenToken) { try { reader.cancel(); } catch (_) {} return played; }
      textBuf += decoder.decode(step.value, { stream: true });
      var found = false;
      pairRe.lastIndex = consumed;
      var m;
      while ((m = pairRe.exec(textBuf)) !== null) {
        if (myToken !== narrateGenToken) return played;
        if (narrateQueuePcmChunk(narrateBase64ToBytes(m[1]))) played++;
        consumed = pairRe.lastIndex;
        found = true;
      }
      if (!found) {
        pairRe2.lastIndex = consumed;
        while ((m = pairRe2.exec(textBuf)) !== null) {
          if (myToken !== narrateGenToken) return played;
          if (narrateQueuePcmChunk(narrateBase64ToBytes(m[1]))) played++;
          consumed = pairRe2.lastIndex;
          found = true;
        }
      }
      if (!found) {
        dataRe.lastIndex = consumed;
        while ((m = dataRe.exec(textBuf)) !== null) {
          if (myToken !== narrateGenToken) return played;
          if (narrateQueuePcmChunk(narrateBase64ToBytes(m[1]))) played++;
          consumed = dataRe.lastIndex;
        }
      }
      if (consumed > 0 && textBuf.length > 131072) { textBuf = textBuf.slice(consumed); consumed = 0; }
    }
    textBuf += decoder.decode();
    pairRe.lastIndex = consumed;
    var tail;
    var tailFound = false;
    while ((tail = pairRe.exec(textBuf)) !== null) {
      if (narrateQueuePcmChunk(narrateBase64ToBytes(tail[1]))) played++;
      consumed = pairRe.lastIndex;
      tailFound = true;
    }
    if (!tailFound) {
      pairRe2.lastIndex = consumed;
      while ((tail = pairRe2.exec(textBuf)) !== null) {
        if (narrateQueuePcmChunk(narrateBase64ToBytes(tail[1]))) played++;
        consumed = pairRe2.lastIndex;
      }
    }
    if (played === 0) throw new Error("Stream returned no audio.");
    return played;
  }

  async function narratePlayGeminiUnary(audioEndpoint, payload, signal, modelName) {
    var resp = await fetch(audioEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: signal
    });
    if (!resp.ok) {
      var errObj = null;
      try { errObj = await resp.json(); } catch (_) {}
      var msg = errObj && errObj.error && errObj.error.message ? errObj.error.message : ("HTTP " + resp.status);
      throw new Error(msg);
    }
    var resultData = await resp.json();
    var audioPart = null;
    if (resultData.candidates && resultData.candidates[0] && resultData.candidates[0].content && resultData.candidates[0].content.parts) {
      for (var pIdx = 0; pIdx < resultData.candidates[0].content.parts.length; pIdx++) {
        var part = resultData.candidates[0].content.parts[pIdx];
        if (part.inlineData && part.inlineData.data) { audioPart = part.inlineData; break; }
      }
    }
    if (!audioPart || !audioPart.data) {
      var reason = "";
      if (resultData.candidates && resultData.candidates[0]) {
        var cand = resultData.candidates[0];
        if (cand.finishReason && cand.finishReason !== "STOP") {
          reason = " (finish reason: " + cand.finishReason + ")";
        }
        if (cand.content && cand.content.parts && cand.content.parts[0] && cand.content.parts[0].text) {
          reason += " (model returned text tokens instead of audio)";
        }
      } else if (resultData.promptFeedback && resultData.promptFeedback.blockReason) {
        reason = " (blocked: " + resultData.promptFeedback.blockReason + ")";
      }
      throw new Error("No audio stream returned" + (modelName ? (" by " + modelName) : "") + reason);
    }
    var bytes = narrateBase64ToBytes(audioPart.data);
    var mimeType = audioPart.mimeType || "audio/wav";
    var isAlreadyWav = bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45;

    var audioBlob;
    if (isAlreadyWav) {
      audioBlob = new Blob([bytes], { type: "audio/wav" });
    } else if (mimeType.indexOf("pcm") !== -1 || mimeType.indexOf("audio/L16") !== -1 || mimeType.indexOf("raw") !== -1) {
      audioBlob = pcmToWavBlob(bytes, 24000);
    } else if (mimeType.indexOf("wav") !== -1) {
      audioBlob = new Blob([bytes], { type: "audio/wav" });
    } else {
      audioBlob = pcmToWavBlob(bytes, 24000);
    }
    var audioUrl = URL.createObjectURL(audioBlob);
    if (audioPlayer) {
      audioPlayer.src = audioUrl;
      audioPlayer.playbackRate = getNarrateSpeed();
      audioPlayer.hidden = false;
      await audioPlayer.play();
    }
    narratePlaybackMode = "audioel";
    return true;
  }

  function updateNarrateEngineUI() {
    var isGemini = !narrateEngine || narrateEngine.value === "gemini";
    if (geminiVoiceGroup) geminiVoiceGroup.style.display = isGemini ? "flex" : "none";
    var modelGroup = document.getElementById("scribeNarrateModelGroup");
    if (modelGroup) modelGroup.style.display = isGemini ? "flex" : "none";
  }
  if (narrateEngine) narrateEngine.addEventListener("change", updateNarrateEngineUI);
  updateNarrateEngineUI();

  var narrateModelSelect = document.getElementById("scribeNarrateModel");
  if (narrateModelSelect) {
    narrateModelSelect.addEventListener("change", function() {
      try { localStorage.setItem("sx_scribe_narrate_model", narrateModelSelect.value); } catch (_) {}
    });
    try {
      var savedInit = localStorage.getItem("sx_scribe_narrate_model") || "";
      if (savedInit) narrateModelSelect.value = savedInit;
    } catch (_) {}
  }

  function pcmToWavBlob(pcmData, sampleRate) {
    var numChannels = 1;
    var bitsPerSample = 16;
    var byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    var blockAlign = numChannels * (bitsPerSample / 8);
    var dataSize = pcmData.length;
    var header = new ArrayBuffer(44);
    var view = new DataView(header);

    function writeString(offset, str) {
      for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    return new Blob([header, pcmData], { type: "audio/wav" });
  }

  function resetNarrationState(keepCtx) {
    if (liveNarrator) {
      try { liveNarrator.finish(); } catch (_) {}
      liveNarrator = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.hidden = true;
    }
    if (audioAbortController) {
      audioAbortController.abort();
      audioAbortController = null;
    }
    narrateGenToken++;
    if (!keepCtx) {
      narrateCloseAudioCtx();
    } else {
      narrateNextStart = 0;
      narrateChunksPlayed = 0;
    }
    narratePlaybackMode = null;
    if (startNarrateBtn) {
      startNarrateBtn.textContent = "▶ Play Narration";
      startNarrateBtn.disabled = false;
    }
    if (pauseNarrateBtn) pauseNarrateBtn.hidden = true;
    if (stopNarrateBtn) stopNarrateBtn.hidden = true;
    if (narrateStatus) narrateStatus.textContent = "Idle";
  }

  if (stopNarrateBtn) stopNarrateBtn.addEventListener("click", function() { resetNarrationState(false); });

  if (pauseNarrateBtn) {
    pauseNarrateBtn.addEventListener("click", function() {
      if (narrateEngine && narrateEngine.value === "browser" && window.speechSynthesis) {
        if (window.speechSynthesis.speaking) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            pauseNarrateBtn.textContent = "Pause";
            if (narrateStatus) narrateStatus.textContent = "Speaking…";
          } else {
            window.speechSynthesis.pause();
            pauseNarrateBtn.textContent = "Resume";
            if (narrateStatus) narrateStatus.textContent = "Paused";
          }
        }
      } else if (narratePlaybackMode === "webaudio" && narrateAudioCtx) {
        if (narrateAudioCtx.state === "suspended") {
          narrateAudioCtx.resume();
          pauseNarrateBtn.textContent = "Pause";
          if (narrateStatus) narrateStatus.textContent = "Playing Gemini voice…";
        } else {
          narrateAudioCtx.suspend();
          pauseNarrateBtn.textContent = "Resume";
          if (narrateStatus) narrateStatus.textContent = "Paused";
        }
      } else if (audioPlayer) {
        if (audioPlayer.paused) {
          audioPlayer.play();
          pauseNarrateBtn.textContent = "Pause";
          if (narrateStatus) narrateStatus.textContent = "Playing Gemini voice…";
        } else {
          audioPlayer.pause();
          pauseNarrateBtn.textContent = "Resume";
          if (narrateStatus) narrateStatus.textContent = "Paused";
        }
      }
    });
  }

  if (startNarrateBtn) {
    startNarrateBtn.addEventListener("click", async function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) {
        alert("Please generate or enter a story first before narrating.");
        return;
      }

      var engine = (narrateEngine ? narrateEngine.value : "gemini") || "gemini";

      if (engine === "browser") {
        if (!("speechSynthesis" in window)) {
          alert("Your browser does not support local speech synthesis. Please choose Gemini Voice instead.");
          return;
        }
        resetNarrationState();
        browserUtterance = new SpeechSynthesisUtterance(text);
        browserUtterance.rate = getNarrateSpeed() * 0.95;
        browserUtterance.pitch = 1.0;

        browserUtterance.onstart = function() {
          if (narrateStatus) narrateStatus.textContent = "Speaking…";
          if (startNarrateBtn) startNarrateBtn.textContent = "Restart";
          if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
          if (stopNarrateBtn) stopNarrateBtn.hidden = false;
        };
        browserUtterance.onend = function() {
          resetNarrationState();
          if (narrateStatus) narrateStatus.textContent = "Finished narrating.";
        };
        browserUtterance.onerror = function() {
          resetNarrationState();
          if (narrateStatus) narrateStatus.textContent = "Speech error.";
        };

        window.speechSynthesis.speak(browserUtterance);
        return;
      }

      var apiKey = (keyInput ? keyInput.value : "").trim();
      if (!apiKey) {
        try { apiKey = localStorage.getItem(getStorageKey("gemini")) || ""; } catch (_) {}
      }
      if (!apiKey) {
        alert("Please enter and save your Gemini API key above to use Gemini voice narration.");
        if (keyInput) keyInput.focus();
        return;
      }

      var chosenVoice = (geminiVoice ? geminiVoice.value : "Aoede") || "Aoede";
      resetNarrationState(true);
      narrateEnsureAudioCtxRunning();

      if (narrateStatus) {
        narrateStatus.textContent = "Generating voice with Gemini (" + chosenVoice + ")…";
        narrateStatus.style.color = "#38bdf8";
      }
      if (startNarrateBtn) startNarrateBtn.disabled = true;
      if (stopNarrateBtn) stopNarrateBtn.hidden = false;

      audioAbortController = new AbortController();
      var myToken = ++narrateGenToken;
      narrateChunksPlayed = 0;

      var narrateModelEl = document.getElementById("scribeNarrateModel");
      var preferredModel = (narrateModelEl && narrateModelEl.value) ? narrateModelEl.value : "gemini-2.5-pro-preview-tts";
      var ttsFallbackModels = [preferredModel, "gemini-2.5-flash-preview-tts", "gemini-2.5-flash-tts", "gemini-3.8-flash-tts"];
      ttsFallbackModels = ttsFallbackModels.filter(function(m, idx) { return ttsFallbackModels.indexOf(m) === idx; });

      var narrationSucceeded = false;
      var lastAudioErr = null;

      for (var tmIdx = 0; tmIdx < ttsFallbackModels.length; tmIdx++) {
        var chosenAudioModel = ttsFallbackModels[tmIdx];
        var currentPayload = getAudioPayload(chosenAudioModel, text, chosenVoice);
        var audioBase = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(chosenAudioModel);
        var streamEndpoint = audioBase + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(apiKey);
        var audioEndpoint = audioBase + ":generateContent?key=" + encodeURIComponent(apiKey);

        console.log("[Scribe Audio Narration] Selected TTS model (" + (tmIdx + 1) + "/" + ttsFallbackModels.length + "):", chosenAudioModel, "voice:", chosenVoice);
        if (narrateStatus) narrateStatus.textContent = "Connecting voice to " + chosenAudioModel + " (" + chosenVoice + ")…";

        try {
          await narrateStreamGeminiAudio(streamEndpoint, currentPayload, audioAbortController.signal, myToken);
          if (myToken !== narrateGenToken) return;
          narratePlaybackMode = "webaudio";
          if (narrateStatus) {
            narrateStatus.textContent = "Playing " + chosenAudioModel + " voice (" + chosenVoice + ", streaming)…";
            narrateStatus.style.color = "#4ade80";
          }
          if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
          if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
          narrationSucceeded = true;
          break;
        } catch (streamErr) {
          if (streamErr.name === "AbortError" || myToken !== narrateGenToken) {
            if (narrateStatus) narrateStatus.textContent = "Narration cancelled.";
            if (startNarrateBtn) startNarrateBtn.disabled = false;
            return;
          }
          if (narrateChunksPlayed > 0) {
            console.warn("[Scribe Audio Narration] Stream ended after " + narrateChunksPlayed + " chunks:", streamErr);
            narratePlaybackMode = "webaudio";
            if (narrateStatus) {
              narrateStatus.textContent = "Playing " + chosenAudioModel + " voice (" + chosenVoice + ", streaming)…";
              narrateStatus.style.color = "#4ade80";
            }
            if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
            if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
            narrationSucceeded = true;
            break;
          } else {
            console.warn("[Scribe Audio Narration] Streaming failed with " + chosenAudioModel + " (" + streamErr.message + "), trying unary whole clip…");

            try {
              if (narrateStatus) narrateStatus.textContent = "Generating voice with " + chosenAudioModel + " (" + chosenVoice + ")…";
              await narratePlayGeminiUnary(audioEndpoint, currentPayload, audioAbortController.signal, chosenAudioModel);
              if (myToken !== narrateGenToken) return;
              if (narrateStatus) {
                narrateStatus.textContent = "Playing " + chosenAudioModel + " voice (" + chosenVoice + ")…";
                narrateStatus.style.color = "#4ade80";
              }
              if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
              if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
              narrationSucceeded = true;
              break;
            } catch (unaryErr) {
              if (unaryErr.name === "AbortError") {
                if (narrateStatus) narrateStatus.textContent = "Narration cancelled.";
                if (startNarrateBtn) startNarrateBtn.disabled = false;
                return;
              }
              console.warn("[Scribe Audio Narration] Unary failed with " + chosenAudioModel + ":", unaryErr.message);
              lastAudioErr = unaryErr;
            }
          }
        }
      }

      if (!narrationSucceeded) {
        var errText = lastAudioErr ? lastAudioErr.message : "Failed to generate audio stream.";
        console.warn("[Scribe Audio Narration] Cloud TTS blocked or failed (" + errText + "), attempting SpeechSynthesis fallback…");
        if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== "undefined") {
          try {
            if (narrateStatus) {
              narrateStatus.textContent = "Narrating with local device speech…";
              narrateStatus.style.color = "#4ade80";
            }
            var uttAll = new SpeechSynthesisUtterance(text);
            uttAll.rate = getNarrateSpeed();
            uttAll.onend = function() {
              if (narrateStatus) narrateStatus.textContent = "Narration finished.";
              if (startNarrateBtn) { startNarrateBtn.textContent = "▶ Start Narration"; startNarrateBtn.disabled = false; }
              if (stopNarrateBtn) stopNarrateBtn.hidden = true;
            };
            uttAll.onerror = function() {
              if (narrateStatus) {
                narrateStatus.textContent = "Voice narration failed: " + errText;
                narrateStatus.style.color = "#f87171";
              }
              if (startNarrateBtn) { startNarrateBtn.textContent = "▶ Start Narration"; startNarrateBtn.disabled = false; }
            };
            window.speechSynthesis.speak(uttAll);
            narrationSucceeded = true;
            if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
            if (stopNarrateBtn) stopNarrateBtn.hidden = false;
          } catch (synthErr) {
            console.error("[Scribe SpeechSynthesis fallback failed]", synthErr);
          }
        }
        if (!narrationSucceeded) {
          console.error("[Scribe Audio Narration Failed]", errText);
          if (narrateStatus) {
            narrateStatus.textContent = "Voice narration failed: " + errText;
            narrateStatus.style.color = "#f87171";
          }
          if (startNarrateBtn) {
            startNarrateBtn.textContent = "▶ Start Narration";
            startNarrateBtn.disabled = false;
          }
          if (stopNarrateBtn) stopNarrateBtn.hidden = true;
          if (pauseNarrateBtn) pauseNarrateBtn.hidden = true;
        }
      }
    });
  }

  if (geminiVoice) {
    geminiVoice.addEventListener("change", function() {
      var newV = geminiVoice.value;
      console.log("[Scribe Audio Narration] Selected voice switched to:", newV);
      if (narrateStatus && (narratePlaybackMode === "webaudio" || liveNarrator)) {
        narrateStatus.textContent = "Voice switched to " + newV + " (active next sentence)…";
        narrateStatus.style.color = "#38bdf8";
      }
    });
  }

  function getPlaybackState() {
    var isSpeaking = false;
    var isPaused = false;
    if (narratePlaybackMode === "webaudio" && narrateAudioCtx) {
      if (narrateAudioCtx.state === "running") isSpeaking = true;
      else if (narrateAudioCtx.state === "suspended") isPaused = true;
    } else if (audioPlayer && audioPlayer.src && !audioPlayer.hidden) {
      if (!audioPlayer.paused) isSpeaking = true;
      else if (audioPlayer.currentTime > 0 && audioPlayer.currentTime < audioPlayer.duration) isPaused = true;
    } else if (window.speechSynthesis && window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) isPaused = true;
      else isSpeaking = true;
    }
    return { isSpeaking: isSpeaking, isPaused: isPaused };
  }

  function beginLiveSession(gemKey) {
    var narrateEng = (narrateEngine ? narrateEngine.value : "gemini") || "gemini";
    if (narrateEng !== "gemini" || !gemKey) return false;
    resetNarrationState();
    var chosenV = (geminiVoice ? geminiVoice.value : "Aoede") || "Aoede";
    var narrModelEl = document.getElementById("scribeNarrateModel");
    var chosenNarrModel = (narrModelEl && narrModelEl.value) ? narrModelEl.value : "gemini-2.5-pro-preview-tts";
    audioAbortController = new AbortController();
    var myToken = ++narrateGenToken;
    narrateChunksPlayed = 0;
    liveNarrator = createLiveStoryNarrator(gemKey, chosenV, chosenNarrModel, myToken);
    if (narrateStatus) {
      narrateStatus.textContent = "Live narration started (" + chosenNarrModel + ")…";
      narrateStatus.style.color = "#38bdf8";
    }
    if (startNarrateBtn) startNarrateBtn.disabled = true;
    if (stopNarrateBtn) stopNarrateBtn.hidden = false;
    if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
    return true;
  }

  function feedLiveChunk(chunk) {
    if (liveNarrator) liveNarrator.feed(chunk);
  }

  function finishLiveSession() {
    if (liveNarrator) {
      try { liveNarrator.finish(); } catch (_) {}
      liveNarrator = null;
    }
  }

  // Diagnostic + cross-module narration coordination handle
  window.__sxScribeNarrate = {
    chunksPlayed: function() { return narrateChunksPlayed; },
    mode: function() { return narratePlaybackMode; },
    audioState: function() { return narrateAudioCtx ? narrateAudioCtx.state : "none"; },
    populateTtsModelOptions: populateTtsModelOptions,
    ensureAudioCtxRunning: narrateEnsureAudioCtxRunning,
    getPlaybackState: getPlaybackState,
    beginLiveSession: beginLiveSession,
    feedLiveChunk: feedLiveChunk,
    finishLiveSession: finishLiveSession,
    resetNarrationState: resetNarrationState
  };

  // If Gemini key is already saved when TTS module initializes, populate TTS models immediately
  try {
    var initGemKey = (keyInput ? keyInput.value : "").trim() || localStorage.getItem(getStorageKey("gemini")) || "";
    populateTtsModelOptions(initGemKey);
  } catch (_) {}
});

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
    onStateChange: function() { setterSyncGenerateLabel(); }
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
