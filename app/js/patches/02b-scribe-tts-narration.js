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
