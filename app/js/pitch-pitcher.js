/* PITCH PITCHER — the third writer (alongside Scribe and Scene Setter).
   Spec: pitch-pitcher-spec-2026-10-20.md. Generation rule (ruled
   2026-10-20): no AI-server API, no self-hosted AI server — a template
   bank authored once (assets/pitch-pitcher-bank.js, bank v1.1) is
   slot-filled deterministically from the pitcher's own profile data.
   Same inputs always produce the same pitch; "Another version" is the
   only step that advances the bone index, and it does so explicitly.

   Placement (firmed 2026-10-27): alongside the existing opener in the
   profile details dialog. The opener button and its dialog are
   untouched; this module only mirrors the opener button's visibility
   onto its own button and reads profile data through the app's public
   surfaces (Sexcapades2xProfiles, __SEXCAPADES_TOPIC_CATALOG,
   TaxonomyLoader, __SEXCAPADES_PROFILE_SESSION__).

   Rails (spec): the pitch is generated FOR the pitcher and copied BY
   them — never auto-posted. Hard limits and not-interested topics are
   never pitch content. No contact details ever appear in the text.
   The living-bank phone-home / paste-back intake is the spec's later
   layer (its munch cut is writer pane + core bank + selectors, no
   phone-home, no intake), so this build ships the prompt packet the
   user can take to their own AI, and no intake. */
(function () {
  "use strict";

  var SITE = "https://sexcapades.io";
  var BUCKET_LABELS = {
    1: "Service & care", 2: "Sensation", 3: "Power exchange · giving",
    4: "Power exchange · receiving", 5: "Bondage & restraint",
    6: "Watching & exposure", 7: "Newcomer", 8: "Broad explorer"
  };
  /* Category -> persona bucket (spec bank buckets 1-6; Power exchange
     splits 3/4 by the pitcher's dominant direction within it). */
  var BUCKET_BY_CATEGORY = {
    "Service & ritual": 1, "Connection & aftercare": 1,
    "Sensation & atmosphere": 2, "Impact, pain & body modification": 2,
    "Sex acts": 2, "Body focus & appearance": 2, "Positions": 2,
    "Fluids & messy play": 2, "Orgasm & reproductive play": 2,
    "Bondage & restriction": 5, "Clothing, materials & objects": 5,
    "Watching, exposure & settings": 6, "Fantasy & transformation": 6,
    "Roleplay & identity": 6, "Partner configurations": 6,
    "Psychological dynamics": 3, "Primal & pursuit": 3
  };

  function byId(id) { return document.getElementById(id); }
  function bank() { return window.__SX_PITCHER_BANK || null; }

  function openDlg(d) {
    var h = window.__sxDialog;
    if (h && h.open) return void h.open(d);
    if (d && !d.open) {
      try { d.showModal(); }
      catch (e) { d.setAttribute("open", ""); d.classList.add("fallback-open"); }
    }
  }
  function closeDlg(d) {
    var h = window.__sxDialog;
    if (h && h.close) return void h.close(d);
    if (d) {
      try { if (d.open) d.close(); } catch (e) { /* noop */ }
      d.removeAttribute("open"); d.classList.remove("fallback-open");
    }
  }

  /* The details dialog's profile. The dialog only ever opens for the
     profile whose tab is on screen, so: match the dialog's displayed
     profile name against the exported profiles first, then fall back
     to the app's active profile id — the same target the opener uses. */
  function resolveProfile() {
    var api = window.Sexcapades2xProfiles;
    if (!api || !api.getIds || !api.exportFullProfile) return null;
    var ids = [];
    try { ids = api.getIds() || []; } catch (e) { ids = []; }
    function exp(id) {
      try { return api.exportFullProfile(id); } catch (e) { return null; }
    }
    var wanted = "";
    var dlg = byId("profileDetailsDialog");
    if (dlg) {
      var p = dlg.querySelector(".dialog-head p");
      if (p && /^Profile:\s*/.test(p.textContent || "")) {
        wanted = (p.textContent || "").replace(/^Profile:\s*/, "").trim();
      }
    }
    if (!wanted) {
      var nf = byId("profileDetailsName");
      if (nf) wanted = (nf.value || "").trim();
    }
    if (wanted) {
      for (var i = 0; i < ids.length; i++) {
        var pr = exp(ids[i]);
        if (pr && pr.profileName === wanted) return { id: ids[i], profile: pr };
      }
    }
    var active = null;
    try {
      active = window.__sexcapades && window.__sexcapades.getActiveProfileId
        ? window.__sexcapades.getActiveProfileId() : null;
    } catch (e) { active = null; }
    if (active && ids.indexOf(active) >= 0) {
      var pa = exp(active);
      if (pa) return { id: active, profile: pa };
    }
    return null;
  }

  function topicLabel(id) {
    var c = window.__SEXCAPADES_TOPIC_CATALOG;
    return (c && c.labelForId) ? (c.labelForId(id) || null) : null;
  }
  function topicCategory(id) {
    try {
      var tax = window.TaxonomyLoader && window.TaxonomyLoader.loadTaxonomy();
      var rec = tax && tax.topicById && tax.topicById.get ? tax.topicById.get(id) : null;
      return rec ? (rec.category || rec.branch || null) : null;
    } catch (e) { return null; }
  }

  /* Slot derivation from the pitcher's own exported profile.
     Score per topic mirrors the app's own writer-side reading:
     a favorite mark counts 100; otherwise the max of the known
     give/receive ratings. Hard limits and not-interested marks are
     excluded before any ranking — they are never pitch content. */
  function deriveSlots(profile, lookingFor, oneLiner) {
    var ratings = (profile && profile.ratings) || {};
    var annotations = (profile && profile.annotations) || {};
    var rows = [];
    Object.keys(ratings).forEach(function (id) {
      if (id.indexOf("cat-") === 0) return;
      var mark = annotations[id];
      if (mark === "limit" || mark === "notinterested") return;
      var v = ratings[id], score = null, give = null, receive = null;
      if (typeof v === "number" && isFinite(v)) { score = v; give = v; receive = v; }
      else if (v && typeof v === "object") {
        var vals = [];
        if (isFinite(Number(v.give))) { give = Number(v.give); vals.push(give); }
        if (isFinite(Number(v.receive))) { receive = Number(v.receive); vals.push(receive); }
        if (vals.length) score = Math.max.apply(null, vals);
      }
      if (mark === "favorite") score = 100;
      if (score === null) return;
      var label = topicLabel(id);
      if (!label) return;
      rows.push({ id: id, label: label, score: score, give: give, receive: receive, category: topicCategory(id) });
    });
    function byScoreDesc(a, b) {
      return (b.score - a.score) || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
    }
    var strengths = rows.filter(function (r) { return r.score > 35; }).sort(byScoreDesc);
    var curiosities = rows.filter(function (r) { return r.score >= 0 && r.score <= 35; }).sort(byScoreDesc);
    var cats = {};
    rows.forEach(function (r) { if (r.category) cats[r.category] = true; });
    var catCount = Object.keys(cats).length;

    var bucket;
    if (!strengths.length || rows.length < 8) bucket = 7;
    else if (catCount >= 8) bucket = 8;
    else {
      var pool = strengths.length ? strengths : rows;
      var catScore = {}, catGive = {}, catReceive = {};
      pool.forEach(function (r) {
        if (!r.category) return;
        catScore[r.category] = (catScore[r.category] || 0) + Math.max(0, r.score);
        if (r.give !== null) catGive[r.category] = (catGive[r.category] || 0) + Math.max(0, r.give);
        if (r.receive !== null) catReceive[r.category] = (catReceive[r.category] || 0) + Math.max(0, r.receive);
      });
      var domCat = null, domVal = -1;
      Object.keys(catScore).sort().forEach(function (c) {
        if (catScore[c] > domVal) { domVal = catScore[c]; domCat = c; }
      });
      if (domCat === "Power exchange") {
        bucket = (catGive[domCat] || 0) >= (catReceive[domCat] || 0) ? 3 : 4;
      } else {
        bucket = BUCKET_BY_CATEGORY[domCat] || 8;
      }
    }

    var breadth;
    if (rows.length < 8) breadth = "mostly open doors so far";
    else if (catCount >= 8) breadth = "a wide map across many categories";
    else if (catCount <= 3) breadth = "a few deep specialties";
    else breadth = "several branches lit, a few still open";

    var roles = (profile && profile.roles) || [];
    var roleWords = "";
    if (roles.length) {
      var r0 = String(roles[0] || "").trim();
      if (r0) roleWords = r0.charAt(0).toLowerCase() + r0.slice(1);
    }

    return {
      bucket: bucket,
      slots: {
        top_strength: strengths.length ? strengths[0].label : "",
        second_strength: strengths.length > 1 ? strengths[1].label : "",
        top_curiosity: curiosities.length ? curiosities[0].label : "",
        breadth: breadth,
        role_words: roleWords,
        looking_for: lookingFor || "",
        compare_line: "Compare hypermaps with me: " + SITE,
        one_liner: oneLiner || ""
      },
      ratedCount: rows.length,
      strengthCount: strengths.length
    };
  }

  /* Seam rule (from the bank adjudication): slot values are supplied
     in the forms the bones expect, and a clause whose slots are ALL
     empty is dropped whole rather than filled blank — that is what
     keeps "Looking for {looking_for} who…" or "{role_words} energy,
     mostly." from tearing when a profile has no such value. The
     compare line is never dropped. */
  function clauseKept(clause, slots) {
    var names = (clause.match(/\{[^}]+\}/g) || []).map(function (x) { return x.slice(1, -1); });
    if (!names.length) return true;
    return names.some(function (n) { return !!slots[n]; });
  }
  function fillBone(bone, slots) {
    var sentences = String(bone).split(/(?<=\.)\s+/);
    var out = [];
    sentences.forEach(function (s) {
      var clauses = s.split(/;\s*|,\s*(?=(?:and\s+|then\s+|next\s+|followed by\s+)?\{)/);
      var kept = clauses.filter(function (c) {
        return clauseKept(c, slots) || c.indexOf("{compare_line}") >= 0;
      });
      if (kept.length) {
        var joined = kept.join(", ");
        /* If the dropped clause carried the sentence's final period,
           re-attach it so the kept clause ends as a sentence. */
        if (/\.$/.test(s) && !/\.$/.test(joined)) joined += ".";
        out.push(joined);
      }
    });
    var text = out.join(" ");
    text = text.replace(/\{([a-z_]+)\}/g, function (m, name) {
      return Object.prototype.hasOwnProperty.call(slots, name) ? String(slots[name] || "") : "";
    });
    /* Trailing-connector trim for a slot filled empty at a kept
       clause's end ("…are X and ." -> "…are X."). Only connectors
       stranded directly before punctuation are removed, so a bone's
       own sentence-final words ("…is next.") survive untouched. */
    text = text
      .replace(/\s+(and|or|with|then)\s*([.;])/g, "$2")
      .replace(/\s+([,.;:])/g, "$1")
      .replace(/,\s*\./g, ".")
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+|\s+$/g, "");
    return text;
  }

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  var state = { variantOffset: 0, lastKey: "", profileId: null, profileName: "" };

  function currentInputs() {
    return {
      kind: (byId("ppKind") || {}).value || "broadcast",
      type: (byId("ppType") || {}).value || "Gestured",
      tone: (byId("ppTone") || {}).value || "sincere",
      lookingFor: ((byId("ppLookingFor") || {}).value || "").trim(),
      name: ((byId("ppName") || {}).value || "").trim(),
      words: ((byId("ppWords") || {}).value || "").trim()
    };
  }

  function generate() {
    var out = byId("ppMessage"), status = byId("ppStatus"), note = byId("ppNote");
    if (!out) return;
    var b = bank();
    if (!b) { out.value = ""; if (status) status.textContent = "The pitch template bank did not load."; return; }
    var resolved = resolveProfile();
    if (!resolved) {
      out.value = "";
      if (status) status.textContent = "This dialog is not showing a profile, so there is no profile to build a pitch from.";
      return;
    }
    state.profileId = resolved.id;
    state.profileName = resolved.profile.profileName || "Profile";
    var inp = currentInputs();
    var derived = deriveSlots(resolved.profile, inp.lookingFor, inp.words);
    /* Bank keys carry the tone capitalized (Magnetic-Playful-1-1 style);
       the tone selector's values are lowercase. */
    var toneKey = inp.tone.charAt(0).toUpperCase() + inp.tone.slice(1);
    var key = inp.type + "|" + toneKey + "|" + derived.bucket;
    var bones = b[key] || [];
    if (!bones.length) { out.value = ""; if (status) status.textContent = "No pitch bones for that combination yet."; return; }
    var sig = [resolved.id, inp.kind, inp.type, inp.tone, derived.bucket,
      derived.slots.top_strength, derived.slots.second_strength,
      derived.slots.top_curiosity, inp.lookingFor, inp.name, inp.words].join("|");
    if (sig !== state.lastKey) { state.lastKey = sig; state.variantOffset = 0; }
    var idx = (hashStr(sig) + state.variantOffset) % bones.length;
    var text = fillBone(bones[idx], derived.slots);
    if (inp.kind === "opener") {
      if (inp.name) {
        var first = text.charAt(0);
        var lowered = /^I\b/.test(text) ? text : (first.toLowerCase() + text.slice(1));
        text = "Hi " + inp.name + " — " + lowered;
      }
    }
    out.value = text;
    if (status) status.textContent = "";
    if (note) {
      note.textContent = "Built from " + state.profileName + "'s map · " +
        BUCKET_LABELS[derived.bucket] + " · " + derived.ratedCount + " rated topics" +
        (derived.strengthCount ? "" : " · rate a few topics green to name strengths outright") +
        ". Copy it and post it yourself — nothing is sent anywhere.";
    }
  }

  function promptPacket() {
    var resolved = resolveProfile();
    var name = resolved && resolved.profile ? (resolved.profile.profileName || "me") : "me";
    var derived = resolved ? deriveSlots(resolved.profile, "", "") : null;
    var bucketLabel = derived ? BUCKET_LABELS[derived.bucket] : "";
    return [
      "You are writing a personal pitch suite for " + name + ", a user of Sexcapades.IO (a kink hypermap tool).",
      "Write 6 short pitches (40-90 words each is too long — aim for 2-4 sentences) in three registers: Magnetic (names top interests outright, for kink-native rooms), Gestured (hints without naming, for semi-public rooms), and SFW (pitches the communication tool only, no kink content).",
      "Write each pitch TWICE: first the filled version with the person's specifics, then the slot form with placeholders restored, using exactly these slots: {top_strength} {second_strength} {top_curiosity} {breadth} {role_words} {looking_for} {compare_line} {one_liner}.",
      derived ? ("The person's current map reads as: " + bucketLabel + "; top strength: " + (derived.slots.top_strength || "(none yet)") + "; second strength: " + (derived.slots.second_strength || "(none yet)") + "; top curiosity: " + (derived.slots.top_curiosity || "(none yet)") + ".") : "The person has no rated map yet; write from the words they give you.",
      "Rules: never mention hard limits or anything the person is not into; never include contact details; the filled version is theirs to post, the slot form is what they may paste back into Sexcapades to grow the shared template bank."
    ].join("\n\n");
  }

  async function copyText(text, statusEl, okMsg) {
    var ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text); ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) {
      var ta = byId("ppMessage");
      if (ta) {
        try { ta.focus(); ta.select(); ok = document.execCommand("copy"); } catch (e) { ok = false; }
      }
    }
    if (statusEl) statusEl.textContent = ok ? okMsg : "Could not copy. Select the text and copy it manually.";
    return ok;
  }

  function syncKindRows() {
    var kind = (byId("ppKind") || {}).value || "broadcast";
    var row = byId("ppNameRow");
    if (row) row.hidden = kind !== "opener";
  }

  /* Pitch type default (provisional, spec open item): the spec rules
     that the default is read off the person's Veil setting, with the
     mapping itself not yet specified — so the middle register,
     Gestured, is the standing default and the pitcher overrides per
     pitch with the selector. Tone likewise defaults to sincere. */
  function init() {
    var btn = byId("openPitchPitcher");
    var openerBtn = byId("openOpener");
    var dlg = byId("pitchPitcherDialog");
    if (!btn || !dlg) return;

    if (openerBtn && window.MutationObserver) {
      var sync = function () { btn.hidden = openerBtn.hidden; };
      new MutationObserver(sync).observe(openerBtn, { attributes: true, attributeFilter: ["hidden"] });
      sync();
    }

    btn.addEventListener("click", function () {
      var details = byId("profileDetailsDialog");
      if (details && details.open) closeDlg(details);
      state.variantOffset = 0; state.lastKey = "";
      syncKindRows();
      openDlg(dlg);
      generate();
    });
    var closeBtn = byId("closePitchPitcher");
    if (closeBtn) closeBtn.addEventListener("click", function () { closeDlg(dlg); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(dlg); });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeDlg(dlg); });

    ["ppKind", "ppType", "ppTone"].forEach(function (id) {
      var el = byId(id);
      if (el) el.addEventListener("change", function () { syncKindRows(); generate(); });
    });
    ["ppLookingFor", "ppName", "ppWords"].forEach(function (id) {
      var el = byId(id);
      if (el) el.addEventListener("input", function () { generate(); });
    });
    var gen = byId("ppGenerate");
    if (gen) gen.addEventListener("click", function () { state.variantOffset = 0; state.lastKey = ""; generate(); });
    var next = byId("ppNext");
    if (next) next.addEventListener("click", function () { state.variantOffset += 1; generate(); });
    var copy = byId("ppCopy");
    if (copy) copy.addEventListener("click", function () {
      copyText((byId("ppMessage") || {}).value || "", byId("ppStatus"), "Pitch copied. Paste it wherever you pitch.");
    });
    var packet = byId("ppPacket");
    if (packet) packet.addEventListener("click", function () {
      var st = byId("ppStatus");
      var txt = promptPacket();
      var out = byId("ppMessage");
      if (out) out.value = txt;
      if (st) st.textContent = "Prompt packet shown above — copy it to your own AI, then paste the slot-form pitches back here later.";
      copyText(txt, st, "Prompt packet copied. Take it to your own AI to grow your pitch suite.");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else { init(); }
})();
