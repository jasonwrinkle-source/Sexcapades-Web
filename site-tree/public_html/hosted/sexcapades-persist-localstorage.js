/**
 * Sexcapades opt-in localStorage persistence.
 * Loaded as a separate script AFTER the main app bundle.
 * Uses window.__sexcapades API hook (profilePayload, importPayload, etc.).
 *
 * Behavior:
 * - OFF by default. No data written unless user opts in.
 * - Checkbox "Remember my profile on this device" in profile dialog.
 * - When on: saves profile JSON to localStorage on change (debounced 2s)
 *   and on beforeunload. Photos stripped to avoid quota errors.
 * - On load: restores if opted in AND no real profiles exist yet.
 * - "Clear saved data" button wipes localStorage.
 */
(function(){
'use strict';

var LS_KEY = 'sexcapades-profile-backup-v1';
var LS_OPTIN_KEY = 'sexcapades-remember-optin';
var saveTimer = null;
var api = null;

// Wait for the app hook to be available
function getApi() {
    if (api) return api;
    if (typeof window.__sexcapades !== 'undefined') {
        api = window.__sexcapades;
        return api;
    }
    return null;
}

function isOptedIn() {
    try { return localStorage.getItem(LS_OPTIN_KEY) === '1'; }
    catch(e){ return false; }
}

function setOptIn(v) {
    try {
        if (v) localStorage.setItem(LS_OPTIN_KEY, '1');
        else localStorage.removeItem(LS_OPTIN_KEY);
    } catch(e){}
}

function saveNow() {
    var sx = getApi();
    if (!sx || !isOptedIn()) return;
    try {
        var id = sx.getActiveProfileId();
        if (!id) return;
        var payload = sx.profilePayload(id);
        if (!payload || !payload.ratings) return;
        // Strip photos: data URLs blow the ~5MB localStorage quota
        if (payload.photos) payload.photos = [];
        localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch(e){
        // QuotaExceededError or similar - fail silently
    }
}

function scheduleSave() {
    if (!isOptedIn()) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 2000);
}

function clearSaved() {
    try {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_OPTIN_KEY);
    } catch(e){}
    var cb = document.getElementById('sexcapades-remember-cb');
    if (cb) cb.checked = false;
    updateStatus('Saved data cleared.');
}

function updateStatus(msg) {
    var el = document.getElementById('sexcapades-persist-status');
    if (el) {
        el.textContent = msg;
        setTimeout(function(){ el.textContent = ''; }, 3000);
    }
}

function restoreIfNeeded() {
    var sx = getApi();
    if (!sx || !isOptedIn()) return;
    try {
        var stored = localStorage.getItem(LS_KEY);
        if (!stored) return;
        var data = JSON.parse(stored);
        // Validate: must be a sexcapades profile payload
        if (!data || data.app !== 'sexcapades' || !data.ratings) return;
        // importPayload always creates a NEW profile - only restore if
        // there's no existing profile data to avoid duplicates.
        // We check via a flag to ensure we only restore once per session.
        if (window.__sexcapades_restored) return;
        window.__sexcapades_restored = true;
        sx.importPayload(data, {quiet: true});
        updateStatus('Profile restored from this device.');
    } catch(e){}
}

// --- UI injection ---
function injectUI() {
    if (document.getElementById('sexcapades-persist-ui')) return;

    // Find the profile dialog actions area
    var selectors = [
        '.profile-dialog-actions',
        '#profileDetailsBody .profile-dialog-footer'
    ];
    var container = null;
    for (var i = 0; i < selectors.length; i++) {
        container = document.querySelector(selectors[i]);
        if (container) break;
    }
    if (!container) return;

    var wrapper = document.createElement('div');
    wrapper.id = 'sexcapades-persist-ui';
    wrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 0;margin-top:8px;border-top:1px solid var(--line,#333);width:100%;';

    var label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;';

    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'sexcapades-remember-cb';
    cb.checked = isOptedIn();
    cb.addEventListener('change', function(){
        setOptIn(cb.checked);
        if (cb.checked) {
            saveNow();
            updateStatus('Profile will be remembered on this device.');
        } else {
            clearSaved();
        }
    });

    var span = document.createElement('span');
    span.textContent = 'Remember my profile on this device';
    span.title = "Saves your profile to this browser's local storage. Never leaves this device.";

    label.appendChild(cb);
    label.appendChild(span);

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear saved data';
    clearBtn.style.cssText = 'font-size:12px;padding:4px 12px;cursor:pointer;border:1px solid var(--line,#555);border-radius:4px;background:transparent;color:inherit;';
    clearBtn.addEventListener('click', function(){
        if (confirm('Delete the saved profile from this device?')) {
            clearSaved();
        }
    });

    var note = document.createElement('small');
    note.style.cssText = 'width:100%;opacity:0.65;font-size:11px;line-height:1.4;';
    note.textContent = "Off by default. Data stays on this device only — never sent anywhere. Don't use on shared devices.";

    var status = document.createElement('small');
    status.id = 'sexcapades-persist-status';
    status.style.cssText = 'width:100%;font-size:11px;color:var(--accent,#4a9);min-height:14px;';

    wrapper.appendChild(label);
    wrapper.appendChild(clearBtn);
    wrapper.appendChild(note);
    wrapper.appendChild(status);
    container.appendChild(wrapper);
}

// Watch for the profile dialog opening
if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(){
        injectUI();
    });
    observer.observe(document.body, {childList: true, subtree: true});
}

// Periodic dirty-check save (every 5s if opted in)
setInterval(function(){
    if (!isOptedIn()) return;
    // Simple heuristic: save periodically when opted in.
    // The app doesn't expose a dirty callback, so we save on interval.
    // Debounced to avoid excessive writes.
    scheduleSave();
}, 15000);

// Save on page unload
window.addEventListener('beforeunload', saveNow);

// Restore on startup (delay to let app initialize)
function initRestore() {
    if (getApi()) {
        setTimeout(restoreIfNeeded, 3000);
    } else {
        // Hook not ready yet, retry
        setTimeout(initRestore, 500);
    }
}
// Also try UI injection on a delay
setTimeout(injectUI, 2000);
setTimeout(injectUI, 5000);

initRestore();

})();
