/* ---- module: profile-storage (folded from patches.js) ---- */

__sxInit(function () {
(function () {
  var storageKey = "sexcapades_2x_remembered_profiles";
  var rememberEnabled = false;
  var saveTimer = null;

  function checkbox() {
    return SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x");
  }

  function profilesApi() {
    return window.Sexcapades2xProfiles || null;
  }

  function readStoredProfiles() {
    try {
      var stored = localStorage.getItem(storageKey);
      return stored && JSON.parse(stored).profiles || {};
    } catch (error) {
      if (typeof __sxErrLog === "function") __sxErrLog("profile-storage", error);
      return {};
    }
  }

  function flushStoredProfiles() {
    if (saveTimer) {
      try { SexcapadesRuntime.TimerManager.clear(saveTimer); } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("timer-clear", error); }
      saveTimer = null;
    }
    try { localStorage.removeItem(storageKey); } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("profile-storage", error); }
  }

  function showSaveError() {
    rememberEnabled = false;
    var control = checkbox();
    if (control) control.checked = false;
    if (SexcapadesRuntime.DOM.byId("rememberProfilesSaveError")) return;

    var banner = document.createElement("aside");
    banner.id = "rememberProfilesSaveError";
    banner.setAttribute("role", "alert");
    banner.setAttribute("aria-live", "assertive");
    banner.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483647;width:min(680px,calc(100vw - 24px));box-sizing:border-box;background:#4b171b;color:#fff;border:2px solid #ff9a9a;border-radius:10px;padding:16px 48px 16px 18px;box-shadow:0 12px 36px rgba(0,0,0,.58);font:600 16px/1.45 'Source Sans 3',system-ui,sans-serif;";

    var title = document.createElement("strong");
    title.style.cssText = "display:block;font-size:20px;margin-bottom:4px;";
    title.textContent = "Profiles were not saved";
    var message = document.createElement("span");
    message.textContent = "This browser could not store them on this device. Keep this tab open and export your profiles before leaving, or free browser storage and turn Remember on again.";
    var close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss save error");
    close.textContent = "×";
    close.style.cssText = "position:absolute;top:8px;right:10px;border:0;background:transparent;color:#fff;font:700 28px/1 system-ui,sans-serif;cursor:pointer;padding:4px 8px;";
    close.addEventListener("click", function () { banner.remove(); });

    banner.appendChild(title);
    banner.appendChild(message);
    banner.appendChild(close);
    document.body.appendChild(banner);
    close.focus({ preventScroll: true });
  }

  function showRestoreError(failedCount) {
    rememberEnabled = false;
    var control = checkbox();
    if (control) control.checked = false;
    if (SexcapadesRuntime.DOM.byId("rememberProfilesRestoreError")) return;

    var banner = document.createElement("aside");
    banner.id = "rememberProfilesRestoreError";
    banner.setAttribute("role", "alert");
    banner.setAttribute("aria-live", "assertive");
    banner.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483647;width:min(680px,calc(100vw - 24px));box-sizing:border-box;background:#4b171b;color:#fff;border:2px solid #ff9a9a;border-radius:10px;padding:16px 48px 16px 18px;box-shadow:0 12px 36px rgba(0,0,0,.58);font:600 16px/1.45 'Source Sans 3',system-ui,sans-serif;";

    var title = document.createElement("strong");
    title.style.cssText = "display:block;font-size:20px;margin-bottom:4px;";
    title.textContent = "Saved profiles could not be restored";
    var message = document.createElement("span");
    message.textContent = failedCount + (failedCount === 1 ? " saved profile" : " saved profiles") + " on this device could not be restored. Nothing was deleted. Check the error log for the detail, and keep any open profiles exported before leaving.";
    var close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss restore error");
    close.textContent = "×";
    close.style.cssText = "position:absolute;top:8px;right:10px;border:0;background:transparent;color:#fff;font:700 28px/1 system-ui,sans-serif;cursor:pointer;padding:4px 8px;";
    close.addEventListener("click", function () { banner.remove(); });

    banner.appendChild(title);
    banner.appendChild(message);
    banner.appendChild(close);
    document.body.appendChild(banner);
    close.focus({ preventScroll: true });
  }

  function writeStoredProfiles(profiles) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        v: 1,
        savedAt: Date.now(),
        profiles: profiles
      }));
      return true;
    } catch (error) {
      showSaveError();
      return false;
    }
  }

  function saveNow() {
    if (!rememberEnabled) return false;
    var api = profilesApi();
    if (!api) return false;

    try {
      var storedValue = localStorage.getItem(storageKey);
      var storedProfiles = storedValue && JSON.parse(storedValue).profiles || {};
      var currentProfiles = api.getAll();
      var changed = false;
      var savedAt = Date.now();

      Object.keys(storedProfiles).forEach(function (profileId) {
        if (!Object.prototype.hasOwnProperty.call(currentProfiles, profileId)) {
          delete storedProfiles[profileId];
          changed = true;
        }
      });

      Object.keys(currentProfiles).forEach(function (profileId) {
        var profile = currentProfiles[profileId];
        var isSample = Boolean(profile && profile.sampleProfile === true || api.isSample && api.isSample(profileId));
        if (isSample && api.isDirty && !api.isDirty(profileId)) return;
        try {
          var serialized = JSON.stringify(profile);
          var existing = storedProfiles[profileId];
          if (!existing || JSON.stringify(existing.data) !== serialized) {
            storedProfiles[profileId] = { data: JSON.parse(serialized), savedAt: savedAt };
            changed = true;
          }
        } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("profile-parse", error); }
      });

      return !changed || writeStoredProfiles(storedProfiles);
    } catch (error) {
      showSaveError();
      return false;
    }
  }

  window.Sexcapades2xRememberProfiles = {
    saveNow: saveNow,
    flush: flushStoredProfiles,
    isEnabled: function () {
      var control = checkbox();
      return Boolean(rememberEnabled && control && control.checked);
    }
  };

  function loadStoredProfiles() {
    var api = profilesApi();
    if (!api || !api.importData) {
      if (typeof __sxErrLog === "function") __sxErrLog("profile-import", new Error("Stored profiles could not be restored: the profile store is unavailable."));
      showRestoreError(1);
      return 0;
    }
    var storedProfiles = readStoredProfiles();
    var loaded = 0;
    var failed = 0;
    try {
      var rawStored = localStorage.getItem(storageKey);
      if (rawStored) JSON.parse(rawStored);
    } catch (error) {
      if (typeof __sxErrLog === "function") __sxErrLog("profile-storage", error);
      failed++;
    }
    Object.keys(storedProfiles).forEach(function (profileId) {
      var entry = storedProfiles[profileId];
      var data = entry && typeof entry === "object" && "data" in entry ? entry.data : entry;
      if (!data) {
        failed++;
        if (typeof __sxErrLog === "function") __sxErrLog("profile-import", new Error("Stored profile " + profileId + " has no data to restore."));
        return;
      }
      try {
        if (api.has(profileId)) return;
        if (api.importData(profileId, data)) {
          loaded++;
        } else {
          failed++;
          if (typeof __sxErrLog === "function") __sxErrLog("profile-import", new Error("Stored profile " + profileId + " could not be restored (importData returned false)."));
        }
      } catch (error) {
        failed++;
        if (typeof __sxErrLog === "function") __sxErrLog("profile-import", error);
      }
    });
    if (failed) showRestoreError(failed);
    return loaded;
  }

  function savedMenuEl() { return SexcapadesRuntime.DOM.byId("profileSavedMenu"); }
  function savedChoiceEl() { return SexcapadesRuntime.DOM.byId("loadSavedProfileChoice"); }

  function savedProfileName(entry) {
    var data = entry && typeof entry === "object" && "data" in entry ? entry.data : entry;
    var name = data && typeof data.profileName === "string" ? data.profileName.trim() : "";
    return name && !/^unknown$/i.test(name) ? name : "Untitled profile";
  }

  function syncSavedMenu() {
    var choice = savedChoiceEl();
    if (!choice) return;
    var stored = readStoredProfiles();
    var ids = Object.keys(stored);
    choice.disabled = ids.length === 0;
    choice.setAttribute("aria-disabled", String(ids.length === 0));
    var rows = SexcapadesRuntime.DOM.byId("profileSavedRows");
    if (!rows) return;
    rows.textContent = "";
    var api = profilesApi();
    ids.forEach(function (profileId) {
      var name = savedProfileName(stored[profileId]);
      var loaded = Boolean(api && api.has && api.has(profileId));
      var row = document.createElement("div");
      row.className = "saved-profile-row";
      var load = document.createElement("button");
      load.type = "button";
      load.className = "saved-profile-choice";
      load.setAttribute("role", "menuitem");
      load.dataset.savedProfile = profileId;
      load.disabled = loaded;
      load.setAttribute("aria-disabled", String(loaded));
      var strong = document.createElement("strong");
      strong.textContent = name;
      var small = document.createElement("small");
      small.textContent = loaded ? "Loaded" : "Saved on this device";
      load.appendChild(strong);
      load.appendChild(small);
      load.addEventListener("click", function () { loadOneSavedProfile(profileId); });
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "saved-profile-remove";
      remove.textContent = "✕";
      remove.setAttribute("aria-label", "Remove " + name + " from this device");
      remove.title = "Remove from this device";
      remove.addEventListener("click", function () { removeOneSavedProfile(profileId); });
      row.appendChild(load);
      row.appendChild(remove);
      rows.appendChild(row);
    });
  }

  function closeSavedMenu() {
    var menu = savedMenuEl();
    if (menu) {
      menu.hidden = true;
      menu.classList.remove("is-submenu");
    }
    var choice = savedChoiceEl();
    if (choice) choice.setAttribute("aria-expanded", "false");
  }

  function openSavedMenu() {
    var addMenu = SexcapadesRuntime.DOM.byId("profileAddMenu");
    var choice = savedChoiceEl();
    var menu = savedMenuEl();
    if (!addMenu || addMenu.hidden || !choice || !menu || choice.disabled) return;
    syncSavedMenu();
    if (choice.disabled) return;
    var sampleMenu = SexcapadesRuntime.DOM.byId("profileSampleMenu");
    if (sampleMenu) sampleMenu.hidden = true;
    var sampleChoice = SexcapadesRuntime.DOM.byId("loadSampleProfileChoice");
    if (sampleChoice) sampleChoice.setAttribute("aria-expanded", "false");
    menu.hidden = false;
    menu.classList.add("is-submenu");
    choice.setAttribute("aria-expanded", "true");
    var addButton = document.querySelector("[data-add-profile]");
    if (addButton) addButton.setAttribute("aria-expanded", "true");
    var rect = choice.getBoundingClientRect();
    var width = menu.offsetWidth;
    var height = menu.offsetHeight;
    var left, top;
    if (window.innerWidth <= (window.__sxSmallScreenMax || 620)) {
      left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left));
      var below = rect.bottom + 6;
      var above = rect.top - height - 6;
      top = below + height <= window.innerHeight - 8 ? below : above >= 8 ? above : Math.max(8, window.innerHeight - height - 8);
    } else {
      left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right + 6));
      top = Math.max(8, Math.min(window.innerHeight - height - 8, rect.top));
    }
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    var first = menu.querySelector(".saved-profile-choice:not(:disabled)");
    if (first) first.focus({ preventScroll: true });
  }

  function loadOneSavedProfile(profileId) {
    var api = profilesApi();
    if (!api || !api.importData) return;
    var stored = readStoredProfiles();
    var entry = stored[profileId];
    if (!entry) { syncSavedMenu(); return; }
    var data = entry && typeof entry === "object" && "data" in entry ? entry.data : entry;
    if (!data) return;
    var result = null;
    try {
      result = api.importData(profileId, data, {autoSelect: !0});
    } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("profile-import", error); }
    closeSavedMenu();
    var addMenu = SexcapadesRuntime.DOM.byId("profileAddMenu");
    if (addMenu) addMenu.hidden = true;
    var addButton = document.querySelector("[data-add-profile]");
    if (addButton) addButton.setAttribute("aria-expanded", "false");
    if (!result) {
      if (typeof __sxErrLog === "function") __sxErrLog("profile-import", new Error("Saved profile " + profileId + " could not be loaded (importData returned false)."));
      return;
    }
    var loadedId = typeof result === "string" ? result : profileId;
    var tab = document.querySelector('[data-view="' + loadedId + '"]');
    if (tab) tab.click();
    syncSavedMenu();
  }

  function removeOneSavedProfile(profileId) {
    var stored = readStoredProfiles();
    if (!Object.prototype.hasOwnProperty.call(stored, profileId)) return;
    delete stored[profileId];
    try {
      if (Object.keys(stored).length) {
        localStorage.setItem(storageKey, JSON.stringify({ v: 1, savedAt: Date.now(), profiles: stored }));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("profile-storage", error); }
    syncSavedMenu();
    if (!Object.keys(readStoredProfiles()).length) closeSavedMenu();
  }

  function setupSavedMenu() {
    var choice = savedChoiceEl();
    if (!choice) return;
    syncSavedMenu();
    var hoverTimer = 0;
    function clearHover() {
      if (hoverTimer) {
        try { SexcapadesRuntime.TimerManager.clear(hoverTimer); } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("timer-clear", error); }
        hoverTimer = 0;
      }
    }
    function scheduleClose() {
      clearHover();
      hoverTimer = SexcapadesRuntime.TimerManager.setTimeout(function () {
        var menu = savedMenuEl();
        var addMenu = SexcapadesRuntime.DOM.byId("profileAddMenu");
        if (menu && !menu.matches(":hover") && !(addMenu && addMenu.matches(":hover"))) closeSavedMenu();
      }, 180);
    }
    choice.addEventListener("pointerenter", function () { clearHover(); openSavedMenu(); });
    choice.addEventListener("focus", function () { openSavedMenu(); });
    choice.addEventListener("click", function (event) { event.preventDefault(); openSavedMenu(); });
    var sampleChoice = SexcapadesRuntime.DOM.byId("loadSampleProfileChoice");
    if (sampleChoice) {
      sampleChoice.addEventListener("pointerenter", closeSavedMenu);
      sampleChoice.addEventListener("focus", closeSavedMenu);
      sampleChoice.addEventListener("click", closeSavedMenu);
    }
    var addMenu = SexcapadesRuntime.DOM.byId("profileAddMenu");
    if (addMenu) {
      addMenu.addEventListener("pointerleave", scheduleClose);
      addMenu.addEventListener("pointerenter", clearHover);
      if (window.MutationObserver) {
        new MutationObserver(function () { if (!addMenu.hidden) syncSavedMenu(); }).observe(addMenu, { attributes: true, attributeFilter: ["hidden"] });
      }
    }
    var menu = savedMenuEl();
    if (menu) {
      menu.addEventListener("pointerleave", scheduleClose);
      menu.addEventListener("pointerenter", clearHover);
    }
    var back = SexcapadesRuntime.DOM.byId("backToProfileAddMenuFromSaved");
    if (back) {
      back.addEventListener("click", function () {
        closeSavedMenu();
        choice.focus({ preventScroll: true });
      });
    }
    var addButton = document.querySelector("[data-add-profile]");
    if (addButton) {
      addButton.addEventListener("click", function () {
        var menuNow = savedMenuEl();
        if (menuNow && !menuNow.hidden) closeSavedMenu();
        syncSavedMenu();
      });
    }
    window.addEventListener("pointerdown", function (event) {
      var menuNow = savedMenuEl();
      if (!menuNow || menuNow.hidden) return;
      var addMenuNow = SexcapadesRuntime.DOM.byId("profileAddMenu");
      if (menuNow.contains(event.target) || addMenuNow && addMenuNow.contains(event.target) || event.target.closest && event.target.closest("[data-add-profile]")) return;
      closeSavedMenu();
    }, true);
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSavedMenu();
    });
  }

  function init() {
    var control = checkbox();
    if (!control) return;
    control.checked = false;
    control.addEventListener("change", function () {
      rememberEnabled = control.checked;
      if (rememberEnabled) {
        loadStoredProfiles();
        saveNow();
      } else {
        try { localStorage.removeItem(storageKey); } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("profile-storage", error); }
        if (saveTimer) {
          try { SexcapadesRuntime.TimerManager.clear(saveTimer); } catch (error) { if (typeof __sxErrLog === "function") __sxErrLog("timer-clear", error); }
          saveTimer = null;
        }
      }
    });
    var flushButton = SexcapadesRuntime.DOM.byId("flushProfilesBtn2x");
    if (flushButton) {
      flushButton.addEventListener("click", function () {
        flushStoredProfiles();
        rememberEnabled = false;
        control.checked = false;
      });
    }
    window.addEventListener("beforeunload", saveNow);

    var previousCount = -1;
    SexcapadesRuntime.TimerManager.setInterval(function () {
      if (!rememberEnabled) return;
      var api = profilesApi();
      if (!api) return;
      var count = api.getIds().length;
      if (count !== previousCount) {
        previousCount = count;
        if (saveTimer) SexcapadesRuntime.TimerManager.clear(saveTimer);
        saveTimer = SexcapadesRuntime.TimerManager.setTimeout(saveNow, 800);
      }
    }, 2000);

    SexcapadesRuntime.TimerManager.setTimeout(function () {
      if (rememberEnabled) return;
      var count = Object.keys(readStoredProfiles()).length;
      if (count > 0 && !SexcapadesRuntime.DOM.byId("rememberProfilesPrompt")) {
        var prompt = document.createElement("div");
        prompt.id = "rememberProfilesPrompt";
        prompt.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:1000;background:var(--paper-2,#222);border:1px solid var(--line-strong,#555);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);font-size:14px;";
        var message = document.createElement("span");
        message.textContent = "Found " + count + " saved profile" + (count === 1 ? "" : "s") + ". Restore " + (count === 1 ? "it" : "each one") + " as " + (count === 1 ? "a separate profile tab?" : "separate profile tabs?");
        var load = document.createElement("button");
        load.textContent = count === 1 ? "Restore profile" : "Restore profiles";
        load.style.cssText = "padding:6px 14px;border-radius:6px;border:1px solid var(--line-strong);background:var(--accent,#4a9);color:#fff;cursor:pointer;font-weight:600;";
        load.onclick = function () {
          var remember = checkbox();
          if (remember) {
            remember.checked = true;
            remember.dispatchEvent(new Event("change"));
          }
          prompt.remove();
        };
        var dismiss = document.createElement("button");
        dismiss.textContent = "✕";
        dismiss.setAttribute("aria-label", "Dismiss");
        dismiss.style.cssText = "padding:4px 8px;border:0;background:transparent;cursor:pointer;opacity:.6;font-size:16px;";
        dismiss.onclick = function () { prompt.remove(); };
        prompt.appendChild(message);
        prompt.appendChild(load);
        prompt.appendChild(dismiss);
        document.body.appendChild(prompt);
        SexcapadesRuntime.TimerManager.setTimeout(function () {
          if (prompt.parentNode) prompt.remove();
        }, 30000);
      }
    }, 2000);
  }

  setupSavedMenu();
  init();
})();
});
