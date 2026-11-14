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
// Scribe AI Story Generator (Gemini BYOK - Bring Your Own Key)
// --------------------------------------------------------------------------
__sxInit(function initScribeGeminiBYOK() {
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
    return (providerSelect ? providerSelect.value : "gemini") || "gemini";
  }

  function getStorageKey(provider) {
    if (provider === "grok") return "sx_grok_byok_api_key";
    if (provider === "openai") return "sx_openai_byok_api_key";
    return "sx_gemini_byok_api_key";
  }

  var activeAbortController = null;

  var PROVIDER_CONFIG = {
    gemini: {
      placeholder: "Paste Gemini API key (AIzaSy...)",
      link: "https://aistudio.google.com/app/apikey",
      linkText: "Get free Google AI Studio key ↗",
      defaultModels: ["gemini-flash-latest", "gemini-3.7-flash", "gemini-pro-latest"]
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
    var select = document.getElementById("scribeGeminiModel");
    if (!select) return;
    var models = await queryAvailableModels(apiKey, provider);
    if (!models || models.length === 0) {
      models = PROVIDER_CONFIG[provider]?.defaultModels || [];
    } else if (provider === "gemini") {
      models.sort(function(a, b) {
        if (a === "gemini-flash-latest") return -1;
        if (b === "gemini-flash-latest") return 1;
        if (a === "gemini-3.7-flash") return -1;
        if (b === "gemini-3.7-flash") return 1;
        return 0;
      });
    }
    select.innerHTML = "";
    models.forEach(function(m, idx) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m + (idx === 0 ? " (Recommended)" : "");
      select.appendChild(opt);
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
        keyStatus.textContent = "Enter your " + provName + " API key to enable direct story generation.";
        keyStatus.style.color = "#94a3b8";
      }
    }
  }

  if (providerSelect) {
    providerSelect.addEventListener("change", function() {
      loadSavedKey();
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
    });
  }

  loadSavedKey();

  if (copyStoryBtn) {
    copyStoryBtn.addEventListener("click", async function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyStoryBtn.textContent = "Copied!";
        setTimeout(function() { copyStoryBtn.textContent = "Copy story"; }, 1600);
      } catch (_) {
        if (storyText) {
          storyText.select();
          document.execCommand("copy");
          copyStoryBtn.textContent = "Copied!";
          setTimeout(function() { copyStoryBtn.textContent = "Copy story"; }, 1600);
        }
      }
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

  if (genStoryBtn) {
    genStoryBtn.addEventListener("click", async function() {
      var promptEl = document.getElementById("scenePromptText");
      var prompt = (promptEl ? promptEl.value : "").trim();
      if (!prompt) {
        alert("Please generate a Scribe prompt first by clicking 'Prompt' above.");
        return;
      }

      var prov = getActiveProvider();
      var apiKey = (keyInput ? keyInput.value : "").trim();
      if (!apiKey) {
        try { apiKey = localStorage.getItem(getStorageKey(prov)) || ""; } catch (_) {}
      }
      if (!apiKey) {
        alert("Please enter and save your " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + " API key to generate stories directly with AI.");
        if (keyInput) keyInput.focus();
        return;
      }

      var modelSelect = document.getElementById("scribeGeminiModel");
      var modelInput = document.getElementById("scribeGeminiModelInput");
      var model = (modelSelect ? modelSelect.value : "") || (modelInput ? modelInput.value.trim() : "") || (prov === "grok" ? "grok-2" : prov === "openai" ? "gpt-4o" : "gemini-flash-latest");

      if (storyContainer) storyContainer.hidden = false;
      if (storyText) storyText.value = "";
      if (storyStatus) storyStatus.textContent = "Connecting to " + prov.toUpperCase() + " (" + model + ")…";
      if (genStoryBtn) genStoryBtn.disabled = true;
      if (stopStoryBtn) stopStoryBtn.hidden = false;

      try {
        storyContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}

      activeAbortController = new AbortController();

      // Ensure request has a realistic completion timeout (90 seconds for long creative writing)
      var fetchTimer = setTimeout(function() {
        if (activeAbortController) {
          activeAbortController.abort();
          if (storyStatus) storyStatus.textContent = "Request timed out after 90 seconds.";
        }
      }, 90000);

      var fullPrompt = prompt + "\n\nWrite the complete, immersive narrative scene now, strictly honoring all character roles, boundaries, and pacing detailed above.";

      try {
        var totalText = "";

        if (prov === "grok" || prov === "openai") {
          // Standard OpenAI-compatible Chat Completions API
          var chatEndpoint = prov === "grok" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
          console.log("[Scribe " + prov.toUpperCase() + "] Sending request to:", chatEndpoint);

          if (storyStatus) storyStatus.textContent = "Writing story with " + prov.toUpperCase() + " (" + model + ")…";

          var response = await fetch(chatEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: "You are an expert creative writer specializing in rich, consensual, descriptive adult fiction and Literotica-style narratives." },
                { role: "user", content: fullPrompt }
              ],
              temperature: 0.9
            }),
            signal: activeAbortController.signal
          });

          clearTimeout(fetchTimer);
          var resJson = await response.json();
          if (!response.ok) {
            var errMsg = resJson.error && resJson.error.message ? resJson.error.message : ("HTTP " + response.status);
            throw new Error(errMsg);
          }

          if (resJson.choices && resJson.choices[0] && resJson.choices[0].message) {
            totalText = resJson.choices[0].message.content || "";
          }
        } else {
          // Google Gemini API with fallback cascade
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
              temperature: 0.9,
              topP: 0.95
            }
          };

          var fallbackModels = [model, "gemini-3.7-flash", "gemini-3.5-flash", "gemini-pro-latest", "gemini-flash-latest"];
          fallbackModels = fallbackModels.filter(function(item, pos) { return fallbackModels.indexOf(item) === pos; });

          var successfulData = null;
          var lastErrorMsg = "";

          for (var mIdx = 0; mIdx < fallbackModels.length; mIdx++) {
            var currentAttemptModel = fallbackModels[mIdx];
            var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(currentAttemptModel) + ":generateContent?key=" + encodeURIComponent(apiKey);
            console.log("[Scribe Gemini BYOK] Attempting (" + (mIdx + 1) + "/" + fallbackModels.length + ") with model:", currentAttemptModel);

            if (storyStatus) {
              storyStatus.textContent = "Writing story with " + currentAttemptModel + " (takes ~10–20s)…";
            }

            try {
              var response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: activeAbortController.signal
              });

              var responseText = await response.text();
              console.log("[Scribe Gemini BYOK] Response status for " + currentAttemptModel + ":", response.status);

              if (!response.ok) {
                var parsed = null;
                try { parsed = JSON.parse(responseText); } catch (_) {}
                var errMsg = parsed && parsed.error && parsed.error.message ? parsed.error.message : ("HTTP " + response.status);
                lastErrorMsg = errMsg;

                if (response.status === 503 && mIdx < fallbackModels.length - 1) {
                  console.warn("[Scribe Gemini BYOK] Model " + currentAttemptModel + " busy (503). Retrying with " + fallbackModels[mIdx + 1] + "…");
                  continue;
                }
                throw new Error(errMsg);
              }

              successfulData = JSON.parse(responseText);
              break;
            } catch (attemptErr) {
              if (attemptErr.name === "AbortError") throw attemptErr;
              if (mIdx < fallbackModels.length - 1) {
                console.warn("[Scribe Gemini BYOK] Attempt failed: " + attemptErr.message + ". Trying fallback model…");
                continue;
              }
              throw attemptErr;
            }
          }

          clearTimeout(fetchTimer);
          if (!successfulData) throw new Error(lastErrorMsg || "Failed to generate story across available models.");

          var data = successfulData;
          console.log("[Scribe Gemini BYOK] Success! Data received:", data);

          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            totalText = data.candidates[0].content.parts.map(function(p) { return p.text || ""; }).join("");
          }

          if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === "SAFETY") {
            if (storyStatus) storyStatus.textContent = "Generation halted: triggered Gemini safety filter. Try lowering explicitness or switching to Grok.";
          }
        }

        if (storyText) {
          storyText.value = totalText;
          storyText.scrollTop = storyText.scrollHeight;
        }

        var wordCount = (totalText.trim().match(/\S+/g) || []).length;
        if (storyStatus) {
          storyStatus.textContent = "Complete! (" + wordCount + " words generated via " + (prov === "grok" ? "xAI Grok" : prov === "openai" ? "OpenAI" : "Gemini") + ")";
        }
      } catch (err) {
        if (err.name === "AbortError") {
          if (storyStatus) storyStatus.textContent = "Generation stopped by user.";
        } else {
          console.error("[Scribe AI Error]", err);
          if (storyStatus) storyStatus.textContent = "Error: " + err.message;
        }
      } finally {
        if (genStoryBtn) genStoryBtn.disabled = false;
        if (stopStoryBtn) stopStoryBtn.hidden = true;
        activeAbortController = null;
        // A finished story renames the compact button to Regenerate.
        scribeSyncGenerateLabel();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Story Narration (Gemini Audio + Browser SpeechSynthesis fallback)
  // --------------------------------------------------------------------------
  var narrateEngine = document.getElementById("scribeNarrateEngine");
  var geminiVoiceGroup = document.getElementById("scribeGeminiVoiceGroup");
  var geminiVoice = document.getElementById("scribeGeminiVoice");
  var startNarrateBtn = document.getElementById("scribeStartNarrateBtn");
  var pauseNarrateBtn = document.getElementById("scribePauseNarrateBtn");
  var stopNarrateBtn = document.getElementById("scribeStopNarrateBtn");
  var narrateStatus = document.getElementById("scribeNarrateStatus");
  var audioPlayer = document.getElementById("scribeAudioPlayer");

  var browserUtterance = null;
  var audioAbortController = null;

  // --- Streaming Gemini narration (Web Audio queue) ---
  // Gemini TTS can stream audio as it is synthesized (streamGenerateContent
  // returns raw 16-bit PCM chunks, 24 kHz mono). Each chunk is scheduled
  // into a Web Audio queue as it arrives, so playback starts almost
  // immediately instead of waiting for the whole clip. The unary
  // generateContent whole-file path is kept as the fallback.
  var narrateAudioCtx = null;
  var narrateNextStart = 0;
  var narrateChunksPlayed = 0;
  var narratePlaybackMode = null; // "webaudio" | "audioel" | "browser"
  var narrateGenToken = 0;

  function narrateCloseAudioCtx() {
    if (narrateAudioCtx) {
      try { narrateAudioCtx.close(); } catch (_) {}
      narrateAudioCtx = null;
    }
    narrateNextStart = 0;
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
      var len = Math.floor(pcmBytes.length / 2);
      if (len < 1) return false;
      var buf = narrateAudioCtx.createBuffer(1, len, 24000);
      var ch = buf.getChannelData(0);
      var view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
      for (var i = 0; i < len; i++) ch[i] = view.getInt16(i * 2, true) / 32768;
      var src = narrateAudioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(narrateAudioCtx.destination);
      var now = narrateAudioCtx.currentTime;
      if (narrateNextStart < now) narrateNextStart = now + 0.05;
      src.start(narrateNextStart);
      narrateNextStart += buf.duration;
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

  // Reads a streamGenerateContent response and plays each audio chunk as it
  // arrives. Returns the number of chunks queued. Throws if the stream
  // carries no audio at all (caller falls back to the unary whole-clip path).
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
        dataRe.lastIndex = consumed;
        while ((m = dataRe.exec(textBuf)) !== null) {
          if (myToken !== narrateGenToken) return played;
          if (narrateQueuePcmChunk(narrateBase64ToBytes(m[1]))) played++;
          consumed = dataRe.lastIndex;
        }
      }
      // Keep the buffer bounded on long narrations: drop already-played text.
      if (consumed > 0 && textBuf.length > 131072) { textBuf = textBuf.slice(consumed); consumed = 0; }
    }
    textBuf += decoder.decode();
    pairRe.lastIndex = consumed;
    var tail;
    while ((tail = pairRe.exec(textBuf)) !== null) {
      if (narrateQueuePcmChunk(narrateBase64ToBytes(tail[1]))) played++;
      consumed = pairRe.lastIndex;
    }
    if (played === 0) throw new Error("Stream returned no audio.");
    return played;
  }

  // Unary whole-clip fallback: the previous behaviour (one generateContent
  // call, full JSON, base64 PCM wrapped in a WAV, played via <audio>).
  async function narratePlayGeminiUnary(audioEndpoint, payload, signal) {
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
    if (!audioPart || !audioPart.data) throw new Error("No audio stream returned. The text may have triggered safety filtering or model capacity limit.");
    var bytes = narrateBase64ToBytes(audioPart.data);
    var mimeType = audioPart.mimeType || "audio/pcm";
    var audioBlob;
    if (mimeType.indexOf("pcm") !== -1 || mimeType.indexOf("audio/L16") !== -1 || mimeType.indexOf("audio/wav") === -1) {
      audioBlob = pcmToWavBlob(bytes, 24000);
    } else {
      audioBlob = new Blob([bytes], { type: mimeType });
    }
    var audioUrl = URL.createObjectURL(audioBlob);
    if (audioPlayer) {
      audioPlayer.src = audioUrl;
      audioPlayer.hidden = false;
      await audioPlayer.play();
    }
    narratePlaybackMode = "audioel";
    return true;
  }

  // Small read-only handle for live verification / diagnostics.
  window.__sxScribeNarrate = {
    chunksPlayed: function() { return narrateChunksPlayed; },
    mode: function() { return narratePlaybackMode; },
    audioState: function() { return narrateAudioCtx ? narrateAudioCtx.state : "none"; }
  };

  function updateNarrateEngineUI() {
    var isGemini = !narrateEngine || narrateEngine.value === "gemini";
    if (geminiVoiceGroup) geminiVoiceGroup.style.display = isGemini ? "flex" : "none";
  }
  if (narrateEngine) narrateEngine.addEventListener("change", updateNarrateEngineUI);
  updateNarrateEngineUI();

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

  function resetNarrationState() {
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
    narrateCloseAudioCtx();
    narratePlaybackMode = null;
    if (startNarrateBtn) {
      startNarrateBtn.textContent = "▶ Play Narration";
      startNarrateBtn.disabled = false;
    }
    if (pauseNarrateBtn) pauseNarrateBtn.hidden = true;
    if (stopNarrateBtn) stopNarrateBtn.hidden = true;
    if (narrateStatus) narrateStatus.textContent = "Idle";
  }

  if (stopNarrateBtn) stopNarrateBtn.addEventListener("click", resetNarrationState);

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
        browserUtterance.rate = 0.95;
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

      // Gemini AI Studio Voice Output — streaming first, whole-clip fallback.
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
      resetNarrationState();

      if (narrateStatus) narrateStatus.textContent = "Generating voice with Gemini (" + chosenVoice + ")…";
      if (startNarrateBtn) startNarrateBtn.disabled = true;
      if (stopNarrateBtn) stopNarrateBtn.hidden = false;

      audioAbortController = new AbortController();
      var myToken = ++narrateGenToken;
      narrateChunksPlayed = 0;

      var audioModel = (document.getElementById("scribeGeminiModelInput") ? document.getElementById("scribeGeminiModelInput").value.trim() : "") || "gemini-3.8-flash";
      var audioBase = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(audioModel);
      var streamEndpoint = audioBase + ":streamGenerateContent?key=" + encodeURIComponent(apiKey);
      var audioEndpoint = audioBase + ":generateContent?key=" + encodeURIComponent(apiKey);

      var audioPayload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Read the following erotic story aloud with rich emotional pacing, sensual warmth, and expressive drama. Do not add introductory or commentary remarks, only speak the story:\n\n" + text.slice(0, 3500)
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: chosenVoice
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

      try {
        // Streaming first: audio starts playing as it is synthesized.
        if (narrateStatus) narrateStatus.textContent = "Streaming Gemini voice (" + chosenVoice + ")…";
        await narrateStreamGeminiAudio(streamEndpoint, audioPayload, audioAbortController.signal, myToken);
        if (myToken !== narrateGenToken) return;
        narratePlaybackMode = "webaudio";
        if (narrateStatus) narrateStatus.textContent = "Playing Gemini voice (" + chosenVoice + ", streaming)…";
        if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
        if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
      } catch (streamErr) {
        if (streamErr.name === "AbortError" || myToken !== narrateGenToken) {
          if (narrateStatus) narrateStatus.textContent = "Narration cancelled.";
          if (startNarrateBtn) startNarrateBtn.disabled = false;
          return;
        }
        if (narrateChunksPlayed > 0) {
          // Some audio already streamed and is playing; keep it, don't
          // restart from scratch with the whole-clip path.
          console.warn("[Scribe Audio Narration] Stream stopped after " + narrateChunksPlayed + " chunks:", streamErr);
          narratePlaybackMode = "webaudio";
          if (narrateStatus) narrateStatus.textContent = "Playing Gemini voice (" + chosenVoice + ", streaming)…";
          if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
          if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
          return;
        }
        // Nothing streamed yet — fall back to the whole-clip path.
        console.warn("[Scribe Audio Narration] Streaming failed, falling back to whole-clip:", streamErr);
        try {
          if (narrateStatus) narrateStatus.textContent = "Generating voice with Gemini (" + chosenVoice + ")…";
          await narratePlayGeminiUnary(audioEndpoint, audioPayload, audioAbortController.signal);
          if (myToken !== narrateGenToken) return;
          if (narrateStatus) narrateStatus.textContent = "Playing Gemini voice (" + chosenVoice + ")…";
          if (startNarrateBtn) { startNarrateBtn.textContent = "Restart Narration"; startNarrateBtn.disabled = false; }
          if (pauseNarrateBtn) { pauseNarrateBtn.hidden = false; pauseNarrateBtn.textContent = "Pause"; }
        } catch (audioErr) {
          if (audioErr.name === "AbortError") {
            if (narrateStatus) narrateStatus.textContent = "Narration cancelled.";
          } else {
            console.error("[Scribe Audio Narration Error]", audioErr);
            if (narrateStatus) narrateStatus.textContent = "Narration error: " + audioErr.message;
          }
          if (startNarrateBtn) startNarrateBtn.disabled = false;
        }
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
        // Not set up yet: first click opens the AI menu so the user picks
        // a provider and saves a key. The AI panel lives inside
        // #sceneBrief, which is hidden until a prompt exists — so generate
        // the prompt first to reveal the panel, then open it and focus
        // the key field.
        var promptEl0 = document.getElementById("scenePromptText");
        var briefEl0 = document.getElementById("sceneBrief");
        if ((!promptEl0 || !promptEl0.value.trim()) && briefEl0 && briefEl0.hidden) {
          var promptBtn0 = document.getElementById("generateScribePrompt");
          if (promptBtn0) promptBtn0.click();
        }
        scribeOpenAiPanel();
        return;
      }
      // Set up: make sure a prompt exists, then generate through the
      // existing one-click path.
      var promptEl = document.getElementById("scenePromptText");
      if (promptEl && !promptEl.value.trim()) {
        var promptBtn = document.getElementById("generateScribePrompt");
        if (promptBtn) promptBtn.click();
      }
      if (genStoryBtn) genStoryBtn.click();
    });
    // Double-click also generates: when set up, the first click already
    // starts it and the button disables itself, so the second is a no-op.
    scribeGenerateBtn.addEventListener("dblclick", function() {
      if (scribeAiSetupReady() && genStoryBtn && !genStoryBtn.disabled) genStoryBtn.click();
    });
  }

  if (scribePlayBtn) {
    scribePlayBtn.addEventListener("click", function() {
      var text = (storyText ? storyText.value : "").trim();
      if (!text) {
        alert("Please generate a story first, then press Play to hear it.");
        return;
      }
      // Reuse the narration path (streaming Gemini voice, or the engine
      // selected in the narration bar).
      if (startNarrateBtn) startNarrateBtn.click();
    });
  }

  // Keep the Generate label in step with the key/provider state.
  if (keyInput) keyInput.addEventListener("input", scribeSyncGenerateLabel);
  if (storyText) storyText.addEventListener("input", scribeSyncGenerateLabel);
  if (saveKeyBtn) saveKeyBtn.addEventListener("click", function() { setTimeout(scribeSyncGenerateLabel, 0); });
  if (clearKeyBtn) clearKeyBtn.addEventListener("click", function() { setTimeout(scribeSyncGenerateLabel, 0); });
  if (providerSelect) providerSelect.addEventListener("change", scribeSyncGenerateLabel);
  scribeSyncGenerateLabel();

});
