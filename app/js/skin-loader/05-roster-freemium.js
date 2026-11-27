/* ---- Roster freemium — registration-period model (2026-11-27, Jason) ----
   RULED model (item 44):
   - Free roster creation up to FREE_CAP individuals (intro 10, then 5
     once the app "takes off" — Jason sees it shine at 5+ groups in
     person several times, a qualitative trigger, NOT a metric). The cap
     counts INDIVIDUALS, not profiles: a couple = 2, a single = 1.
     Change FREE_CAP in the config below when the cap drops; rosters
     over the cap when it drops are grandfathered (they stay, can't grow).
   - Registration period: 30 days / $5 SETTLED. A one-off ~$5 purchase
     buys a 30-day window to ADD/REMOVE members on ONE roster. A new
     window can EITHER re-open ADD/REMOVE on an existing roster OR
     create a new 10+ roster. No blockchain, no gas.
   - The window gates MEMBERSHIP (ADD/REMOVE — the creator's job), NOT
     content. Members update their own roster profiles at any time.
     ADD/REMOVE both (not ADD-only).
   - One-time use is preferred (one window = one roster). The window is
     bound to a roster on first use (best-effort client-side: the
     binding lives in localStorage). FALLBACK, if one-time use proves
     too hard to enforce: unlimited creations during the window. The
     binding code below is the one-time-use implementation; relaxing it
     is a one-line change (see sxRosterUseWindow).
   - Verification path: Patreon OAuth (PKCE). Discord Premium Role is
     UNAVAILABLE (capades.io has no Server Shop / Server Products, even
     after Community was enabled). Signed-token flow is NOT built (it
     needs a real-time issuer/bot). The app opens a Patreon login in
     the browser, the user grants permission to see their membership /
     purchases, and the app calls Patreon's API from the browser to
     check the one-off $5 product purchase. All client-side, no server
     login. The app learns the user's Patreon identity (with consent) —
     the privacy policy must disclose this (not written here).
   - DEPENDENCY: the Patreon OAuth app (client ID) and the $5 one-off
     product (product ID) do NOT exist yet. They are placeholders in
     the config below. Jason must create a Patreon OAuth app and a $5
     one-off digital product, then put the real IDs here. Do NOT ship a
     real client secret in the app — PKCE needs no secret.
   Storage: windows live in localStorage key "sexcapades_roster_windows"
   (per device). A window is { id, rosterKey (null until bound),
   createdAt, startsAt (null until first use), expiresAt, patreonUserId,
   productId }. The 30-day clock starts on first use (first add/re-open
   on a roster), and expiresAt = startsAt + 30 days. */

  /* ---- Config: ONE location. Change the cap and the Patreon IDs here. ---- */
  var SX_ROSTER_FREEMIUM_CONFIG = {
    /* Free roster size cap, in INDIVIDUALS. Intro 10; drops to 5 when
       the app takes off (Jason's eye, in person, several times). */
    freeCapIndividuals: 10,
    /* Registration window. */
    windowDays: 30,
    priceUSD: 5,
    /* Patreon OAuth (PKCE). PLACEHOLDERS — replace with the real IDs
       once Jason creates the OAuth app and the $5 one-off product.
       - OAuth app: https://www.patreon.com/portal/registration/register-clients
         (create an app, set the redirect URI to the app page URL below).
       - One-off product: a $5 digital product on the FlexCapadesIO
         Patreon page (the "registration window"). Put its product ID here.
       Do NOT put a client secret anywhere in this file. */
    patreonClientId: "REPLACE_WITH_PATREON_OAUTH_CLIENT_ID",
    patreonProductId: "REPLACE_WITH_PATREON_ONETIME_PRODUCT_ID",
    /* Redirect URI: the app page itself. This exact value must be
       registered in the Patreon OAuth app, or Patreon refuses the login. */
    patreonRedirectUri: "",
    /* Patreon OAuth scopes: identity (who the buyer is) so the app can
       read their memberships/purchases. Adjust if Patreon requires a
       different scope for the one-off purchase check. */
    patreonScopes: "identity identity[email]",
    /* Patreon endpoints. */
    patreonAuthorizeUrl: "https://www.patreon.com/oauth2/authorize",
    patreonTokenUrl: "https://www.patreon.com/api/oauth2/token",
    patreonIdentityUrl: "https://www.patreon.com/api/oauth2/v2/identity"
  };
  function sxRosterFreemiumConfig() {
    var c = SX_ROSTER_FREEMIUM_CONFIG;
    if (!c.patreonRedirectUri) {
      try { c.patreonRedirectUri = window.location.origin + window.location.pathname; } catch (e) { c.patreonRedirectUri = ""; }
    }
    return c;
  }
  function sxRosterFreemiumConfigured() {
    var c = sxRosterFreemiumConfig();
    return Boolean(c.patreonClientId && c.patreonClientId.indexOf("REPLACE_WITH_") !== 0 && c.patreonProductId && c.patreonProductId.indexOf("REPLACE_WITH_") !== 0 && c.patreonRedirectUri);
  }

  var SX_ROSTER_WINDOWS_KEY = "sexcapades_roster_windows";
  var SX_ROSTER_OAUTH_STATE_KEY = "sexcapades_patreon_oauth_state";
  var SX_ROSTER_OAUTH_VERIFIER_KEY = "sexcapades_patreon_oauth_verifier";
  var SX_ROSTER_OAUTH_TOKEN_KEY = "sexcapades_patreon_oauth_token";

  function sxRosterReadWindows() {
    try {
      var raw = localStorage.getItem(SX_ROSTER_WINDOWS_KEY);
      if (!raw) return { v: 1, windows: [] };
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.windows)) return { v: 1, windows: [] };
      return parsed;
    } catch (e) { return { v: 1, windows: [] }; }
  }
  function sxRosterWriteWindows(store) {
    try { localStorage.setItem(SX_ROSTER_WINDOWS_KEY, JSON.stringify(store)); return true; } catch (e) { return false; }
  }
  function sxRosterNow() { return Date.now(); }
  function sxRosterWindowExpired(w, now) {
    if (!w) return true;
    now = now || sxRosterNow();
    return Boolean(w.expiresAt && now >= w.expiresAt);
  }
  function sxRosterWindowActive(w, now) {
    if (!w) return false;
    now = now || sxRosterNow();
    if (!w.startsAt) return true; /* bought but not yet started: still usable */
    return now < (w.expiresAt || 0);
  }
  function sxRosterWindowFor(rosterKey) {
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var found = null;
    store.windows.forEach(function (w) {
      if (w && w.rosterKey === rosterKey && sxRosterWindowActive(w, now)) found = w;
    });
    return found;
  }
  function sxRosterHasWindow(rosterKey) { return Boolean(sxRosterWindowFor(rosterKey)); }
  function sxRosterAvailableWindow() {
    /* An unbound, active window (bought, not yet used on any roster). */
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var found = null;
    store.windows.forEach(function (w) {
      if (w && !w.rosterKey && sxRosterWindowActive(w, now)) found = w;
    });
    return found;
  }
  function sxRosterUseWindow(rosterKey) {
    /* Bind an available window to this roster (one-time use: one window
       = one roster) and start its 30-day clock on first use. Returns
       the window, or null if none is available for this roster.
       FALLBACK (if one-time use proves too hard): relax the binding by
       returning the available window without setting rosterKey — the
       window would then serve any roster for its 30 days. */
    var cfg = sxRosterFreemiumConfig();
    var existing = sxRosterWindowFor(rosterKey);
    if (existing) return existing;
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var win = null;
    store.windows.forEach(function (w) {
      if (!win && w && !w.rosterKey && sxRosterWindowActive(w, now)) win = w;
    });
    if (!win) return null;
    win.rosterKey = String(rosterKey);
    if (!win.startsAt) {
      win.startsAt = now;
      win.expiresAt = now + cfg.windowDays * 24 * 60 * 60 * 1000;
    }
    sxRosterWriteWindows(store);
    return win;
  }
  function sxRosterRecordPurchase(patreonUserId) {
    /* A verified $5 purchase creates a window (unbound, unstarted).
       It binds to a roster and starts its 30-day clock on first use. */
    var cfg = sxRosterFreemiumConfig();
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var win = {
      id: "win-" + now.toString(36) + "-" + Math.floor(Math.random() * 1296).toString(36),
      rosterKey: null,
      createdAt: now,
      startsAt: null,
      expiresAt: null,
      patreonUserId: patreonUserId || null,
      productId: cfg.patreonProductId,
      priceUSD: cfg.priceUSD,
      windowDays: cfg.windowDays
    };
    store.windows.push(win);
    sxRosterWriteWindows(store);
    return win;
  }
  function sxRosterWindowLabel(w) {
    if (!w) return "";
    if (!w.startsAt) return "Registration window ready — 30 days, starts on first use.";
    try {
      var d = new Date(w.expiresAt);
      return "Registration window active until " + d.toLocaleDateString() + ".";
    } catch (e) { return "Registration window active."; }
  }

  /* ---- Counting individuals (the cap counts INDIVIDUALS, not profiles) ----
     A single profile = 1. A couple (a group of 2 individuals) = 2.
     For a live profile id, count leaf (non-group) source individuals
     recursively. For a sample/pack entry, count from its payload:
     a couple entry carries payload.members (an array of two individual
     payloads); anything else counts as 1. */
  function sxRosterLeafCount(profileId, seen) {
    if (!profileId) return 0;
    seen = seen || {};
    if (seen[profileId]) return 0;
    seen[profileId] = true;
    try {
      var rec = (typeof ft !== "undefined" && ft) ? ft[profileId] : null;
      if (rec && rec.kind === "group" && Array.isArray(rec.sourceIds) && rec.sourceIds.length) {
        var total = 0;
        rec.sourceIds.forEach(function (id) { total += sxRosterLeafCount(id, seen); });
        return total;
      }
    } catch (e) { /* fall through: count as a single */ }
    return 1;
  }
  function sxRosterEntryIndividuals(entry) {
    if (!entry || typeof entry !== "object") return 0;
    var payload = entry.payload || {};
    /* A couple entry: payload.members is an array of the individuals. */
    if (Array.isArray(payload.members) && payload.members.length) {
      var n = 0;
      payload.members.forEach(function (m) {
        if (m && Array.isArray(m.members) && m.members.length) n += m.members.length;
        else n += 1;
      });
      return n;
    }
    /* A live group profile saved as a sample: sourceIds name its members. */
    if (Array.isArray(payload.sourceIds) && payload.sourceIds.length) {
      var seen = {};
      var total = 0;
      payload.sourceIds.forEach(function (id) { total += sxRosterLeafCount(id, seen); });
      return total || 1;
    }
    if (entry.kind === "couple" && Array.isArray(entry.members) && entry.members.length) return entry.members.length;
    return 1;
  }
  function sxRosterIndividualCount(skinId, rosterKey) {
    var api = window.__SX_LOCAL_SAMPLES;
    if (!api || typeof api.list !== "function") return 0;
    var list = api.list(skinId || currentSkinId()) || {};
    var total = 0;
    Object.keys(list).forEach(function (k) {
      var e = list[k];
      if (e && e.rosterKey === rosterKey) total += sxRosterEntryIndividuals(e);
    });
    return total;
  }
  function sxRosterIsGrandfathered(skinId, rosterKey) {
    /* A roster over the current free cap: it was built when the cap was
       higher (or with a window). It stays as it is but can't grow. */
    var cfg = sxRosterFreemiumConfig();
    return sxRosterIndividualCount(skinId, rosterKey) > cfg.freeCapIndividuals;
  }

  /* ---- The gate: ADD / REMOVE of roster members ----
     Free roster (at or under the cap): adding up to the cap is free;
     removing is free. Adding beyond the cap needs an active window for
     that roster. Large / grandfathered roster (over the cap): ANY
     membership change (add or remove) needs an active window for that
     roster — its membership is managed through the window. Updating a
     member's own profile (ratings/blurb) is a content update, NOT a
     membership change, and is never gated here (see save() in
     02-samples-rosters.js, which preserves rosterKey on update).
     Returns { allowed, needsWindow, reason }. */
  function sxRosterGate(skinId, rosterKey, newCount) {
    var cfg = sxRosterFreemiumConfig();
    var cap = cfg.freeCapIndividuals;
    var current = sxRosterIndividualCount(skinId, rosterKey);
    if (current > cap) {
      /* Large / grandfathered roster: membership changes need a window. */
      if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
      return { allowed: false, needsWindow: true, reason: "This roster is over the free cap of " + cap + " individuals, so it stays as it is — buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to change its membership." };
    }
    if (newCount <= cap) return { allowed: true, needsWindow: false, reason: "" };
    if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
    return { allowed: false, needsWindow: true, reason: "Adding that would take this roster over the free cap of " + cap + " individuals — buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to add more." };
  }
  function sxRosterGateAdd(skinId, rosterKey, individualsToAdd) {
    var current = sxRosterIndividualCount(skinId, rosterKey);
    return sxRosterGate(skinId, rosterKey, current + (individualsToAdd || 0));
  }
  function sxRosterGateRemove(skinId, rosterKey, individualsToRemove) {
    var current = sxRosterIndividualCount(skinId, rosterKey);
    return sxRosterGate(skinId, rosterKey, current - (individualsToRemove || 0));
  }
  function sxRosterGateImport(skinId, rosterKey, packIndividuals) {
    /* A pack import REPLACES the roster's membership, so the gate is on
       the resulting size (the pack's total individuals). If the roster
       is currently large, any membership change needs a window. */
    var cfg = sxRosterFreemiumConfig();
    var current = sxRosterIndividualCount(skinId, rosterKey);
    if (current > cfg.freeCapIndividuals) {
      if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
      return { allowed: false, needsWindow: true, reason: "This roster is over the free cap of " + cfg.freeCapIndividuals + " individuals, so it stays as it is — buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to change its membership." };
    }
    if (packIndividuals <= cfg.freeCapIndividuals) return { allowed: true, needsWindow: false, reason: "" };
    if (sxRosterHasWindow(rosterKey)) return { allowed: true, needsWindow: false, reason: "" };
    return { allowed: false, needsWindow: true, reason: "That roster pack holds " + packIndividuals + " individuals — over the free cap of " + cfg.freeCapIndividuals + ". Buy a registration window ($" + cfg.priceUSD + " · " + cfg.windowDays + " days) to load it." };
  }

  function sxRosterEnsureGate(skinId, rosterKey, newCount) {
    /* Check the gate; if it is blocked only for want of a window and
       the creator has an available (unbound) window, bind it to this
       roster (one-time use) and re-check. Returns the final gate. */
    var g = sxRosterGate(skinId, rosterKey, newCount);
    if (g.allowed) return g;
    if (g.needsWindow && sxRosterAvailableWindow()) {
      sxRosterUseWindow(rosterKey);
      g = sxRosterGate(skinId, rosterKey, newCount);
    }
    return g;
  }

  /* ---- Patreon OAuth (PKCE) ----
     No client secret in the app. The flow:
     1. startPatreonOAuth(): make a code_verifier + code_challenge
        (SHA-256, base64url), save the verifier + a random state in
        sessionStorage, and send the browser to Patreon's authorize page.
     2. On return the app loads with ?code=...&state=... — the boot
        handler below exchanges the code for an access token (POST to
        the token endpoint with the code_verifier; no secret), then
        checks the purchase and records a window.
     3. checkPatreonPurchase(token): GET the Patreon identity API with
        the token and look for the configured one-off product among the
        buyer's memberships / entitlements. If found, record a window.
     VERIFICATION STEP STILL OWED (needs the real IDs): the exact field
     that carries a one-off product purchase in Patreon's member-facing
     API must be confirmed once the real product exists. The matcher
     below checks the documented membership/entitlement fields; if the
     product does not appear there, the check fails closed (no window)
     and the API response is logged to the console for diagnosis. */
  function sxRosterBase64Url(bytes) {
    var bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    var b64 = (typeof btoa === "function") ? btoa(bin) : "";
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function sxRosterRandomString(len) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    var out = "";
    try {
      var arr = new Uint8Array(len);
      (window.crypto || {}).getRandomValues ? window.crypto.getRandomValues(arr) : null;
      for (var i = 0; i < len; i++) out += chars.charAt(arr[i] % chars.length);
      if (out.length === len) return out;
    } catch (e) { /* fall through to Math.random */ }
    out = "";
    for (var j = 0; j < len; j++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }
  function sxRosterSha256Base64Url(text) {
    try {
      var subtle = window.crypto && window.crypto.subtle;
      if (!subtle) return Promise.resolve(null);
      var data = new TextEncoder().encode(text);
      return subtle.digest("SHA-256", data).then(function (hash) {
        return sxRosterBase64Url(new Uint8Array(hash));
      });
    } catch (e) { return Promise.resolve(null); }
  }
  function sxPatreonStartOAuth() {
    var cfg = sxRosterFreemiumConfig();
    if (!sxRosterFreemiumConfigured()) {
      rosterToast("The registration window isn't for sale yet — the Patreon product still needs to be created. Check back soon.");
      return false;
    }
    var verifier = sxRosterRandomString(64);
    var state = sxRosterRandomString(32);
    try {
      sessionStorage.setItem(SX_ROSTER_OAUTH_VERIFIER_KEY, verifier);
      sessionStorage.setItem(SX_ROSTER_OAUTH_STATE_KEY, state);
    } catch (e) { rosterToast("Your browser would not store the login — try again."); return false; }
    sxRosterSha256Base64Url(verifier).then(function (challenge) {
      if (!challenge) { rosterToast("Your browser can't do the secure login — try a newer browser."); return; }
      var url = cfg.patreonAuthorizeUrl
        + "?response_type=code"
        + "&client_id=" + encodeURIComponent(cfg.patreonClientId)
        + "&redirect_uri=" + encodeURIComponent(cfg.patreonRedirectUri)
        + "&scope=" + encodeURIComponent(cfg.patreonScopes)
        + "&state=" + encodeURIComponent(state)
        + "&code_challenge=" + encodeURIComponent(challenge)
        + "&code_challenge_method=S256";
      window.location.assign(url);
    });
    return true;
  }
  function sxPatreonExchangeCode(code) {
    var cfg = sxRosterFreemiumConfig();
    var verifier = null;
    try { verifier = sessionStorage.getItem(SX_ROSTER_OAUTH_VERIFIER_KEY); } catch (e) { verifier = null; }
    if (!verifier) return Promise.resolve(null);
    var body = "grant_type=authorization_code"
      + "&code=" + encodeURIComponent(code)
      + "&redirect_uri=" + encodeURIComponent(cfg.patreonRedirectUri)
      + "&client_id=" + encodeURIComponent(cfg.patreonClientId)
      + "&code_verifier=" + encodeURIComponent(verifier);
    return fetch(cfg.patreonTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    }).then(function (r) {
      if (!r.ok) throw new Error("token exchange failed");
      return r.json();
    }).then(function (tok) {
      if (!tok || !tok.access_token) return null;
      try { sessionStorage.setItem(SX_ROSTER_OAUTH_TOKEN_KEY, tok.access_token); } catch (e) { /* token kept in memory only */ }
      try {
        sessionStorage.removeItem(SX_ROSTER_OAUTH_VERIFIER_KEY);
        sessionStorage.removeItem(SX_ROSTER_OAUTH_STATE_KEY);
      } catch (e) { /* non-fatal */ }
      return tok.access_token;
    }).catch(function () { return null; });
  }
  function sxPatreonFindPurchase(identityJson) {
    /* Look for the configured one-off product among the buyer's
       memberships / entitlements. Checks the documented member-facing
       fields (currently_entitled_tiers, benefits, and any id that
       equals the product ID). VERIFICATION STEP: confirm the exact
       field once the real product exists — if the product does not
       appear in these fields, this fails closed (no window) and the
       response is logged for diagnosis. */
    var cfg = sxRosterFreemiumConfig();
    var want = String(cfg.patreonProductId || "");
    if (!want || !identityJson || typeof identityJson !== "object") return false;
    var found = false;
    var visit = function (node, depth) {
      if (found || !node || typeof node !== "object" || depth > 6) return;
      if (Array.isArray(node)) { node.forEach(function (x) { visit(x, depth + 1); }); return; }
      Object.keys(node).forEach(function (k) {
        var v = node[k];
        if ((k === "id" || k === "product_id" || k === "productId") && String(v) === want) found = true;
        if (v && typeof v === "object") visit(v, depth + 1);
      });
    };
    visit(identityJson, 0);
    return found;
  }
  function sxPatreonCheckPurchase(accessToken) {
    var cfg = sxRosterFreemiumConfig();
    var url = cfg.patreonIdentityUrl
      + "?include=memberships"
      + "&fields%5Bmember%5D=patron_status,pledge_relationship_start,currently_entitled_tiers"
      + "&fields%5Buser%5D=full_name";
    return fetch(url, { headers: { "Authorization": "Bearer " + accessToken } })
      .then(function (r) {
        if (!r.ok) throw new Error("identity check failed");
        return r.json();
      })
      .then(function (json) {
        var userId = (json && json.data && json.data.id) ? String(json.data.id) : null;
        var bought = sxPatreonFindPurchase(json);
        if (!bought) {
          try { console.log("[roster-freemium] Patreon purchase check: product not found in identity response.", json); } catch (e) { /* log only */ }
        }
        return { bought: bought, userId: userId };
      })
      .catch(function () { return { bought: false, userId: null }; });
  }
  function sxPatreonHandleOAuthReturn() {
    /* Called at boot. If the app loaded with ?code=...&state=... from
       Patreon, verify the state, exchange the code, check the purchase,
       and record a window. Cleans the code out of the URL afterwards. */
    var params = null;
    try { params = new URLSearchParams(window.location.search || ""); } catch (e) { return; }
    var code = params.get("code");
    var state = params.get("state");
    if (!code) return;
    var savedState = null;
    try { savedState = sessionStorage.getItem(SX_ROSTER_OAUTH_STATE_KEY); } catch (e) { savedState = null; }
    if (!state || !savedState || state !== savedState) {
      rosterToast("That Patreon login did not check out — try again.");
      return;
    }
    var cleanUrl = function () {
      try {
        var u = new URL(window.location.href);
        u.searchParams.delete("code");
        u.searchParams.delete("state");
        history.replaceState(null, "", u.pathname + u.search + u.hash);
      } catch (e) { /* the code staying in the URL is harmless: single-use */ }
    };
    sxPatreonExchangeCode(code).then(function (token) {
      cleanUrl();
      if (!token) { rosterToast("Patreon would not confirm that login — try again."); return; }
      return sxPatreonCheckPurchase(token);
    }).then(function (res) {
      if (!res) return;
      if (res.bought) {
        sxRosterRecordPurchase(res.userId);
        rosterToast("Registration window bought — 30 days, starting when you first use it on a roster. Add members or re-open a roster to use it.");
        if (typeof sxRosterRefreshBuyButton === "function") sxRosterRefreshBuyButton();
      } else {
        rosterToast("Patreon did not show that $5 registration window purchase — if you just bought it, wait a moment and try the login again.");
      }
    });
  }

  /* ---- UI: buy button + status (in the add menu, beside Export/Import) ---- */
  function sxRosterBuyButtonEl() { return document.getElementById("rosterWindowChoice"); }
  function sxRosterRefreshBuyButton() {
    var btn = sxRosterBuyButtonEl();
    if (!btn) return;
    var cfg = sxRosterFreemiumConfig();
    var store = sxRosterReadWindows();
    var now = sxRosterNow();
    var active = null, ready = null;
    store.windows.forEach(function (w) {
      if (!w) return;
      if (w.startsAt && sxRosterWindowActive(w, now)) active = w;
      else if (!w.startsAt && sxRosterWindowActive(w, now)) ready = w;
    });
    if (active) btn.textContent = "Registration window: " + sxRosterWindowLabel(active);
    else if (ready) btn.textContent = "Registration window ready — 30 days, starts on first use";
    else btn.textContent = "Get a registration window — $" + cfg.priceUSD + " · " + cfg.windowDays + " days";
    btn.disabled = Boolean(active || ready);
  }
  function sxRosterEnsureBuyButton() {
    var addMenu = document.getElementById("profileAddMenu");
    if (!addMenu || document.getElementById("rosterWindowChoice")) { sxRosterRefreshBuyButton(); return; }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "rosterWindowChoice";
    btn.setAttribute("role", "menuitem");
    btn.addEventListener("click", function () { sxPatreonStartOAuth(); });
    addMenu.appendChild(btn);
    sxRosterRefreshBuyButton();
  }
  function sxRosterBlockedToast(gate) {
    /* The gate blocked a membership change. Show the reason and offer
       the purchase as the way through (a second click starts OAuth). */
    rosterToast(gate.reason + " Tap “Get a registration window” in the add menu to buy one.");
  }

  /* ---- Public API (called from 02-samples-rosters.js, 03-taxonomy-loader-layout.js, 06d3-profile-about.js) ---- */
  window.__SX_ROSTER_FREEMIUM = {
    config: sxRosterFreemiumConfig,
    configured: sxRosterFreemiumConfigured,
    individualsOf: sxRosterEntryIndividuals,
    leafCount: sxRosterLeafCount,
    count: sxRosterIndividualCount,
    isGrandfathered: sxRosterIsGrandfathered,
    gate: sxRosterGate,
    gateAdd: sxRosterGateAdd,
    gateRemove: sxRosterGateRemove,
    gateImport: sxRosterGateImport,
    ensureGate: sxRosterEnsureGate,
    hasWindow: sxRosterHasWindow,
    useWindow: sxRosterUseWindow,
    availableWindow: sxRosterAvailableWindow,
    windowLabel: sxRosterWindowLabel,
    startPurchase: sxPatreonStartOAuth,
    handleOAuthReturn: sxPatreonHandleOAuthReturn,
    ensureBuyButton: sxRosterEnsureBuyButton,
    refreshBuyButton: sxRosterRefreshBuyButton,
    blockedToast: sxRosterBlockedToast
  };

  /* Boot: handle a Patreon OAuth return (if this load came back from
     Patreon with ?code=...) and make sure the buy button exists. */
  try { sxPatreonHandleOAuthReturn(); } catch (e) { /* OAuth return is best-effort */ }
  try { sxRosterEnsureBuyButton(); } catch (e) { /* the menu may not exist yet; refreshSampleMenu rebuilds it */ }
