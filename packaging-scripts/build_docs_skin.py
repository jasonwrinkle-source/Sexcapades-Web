import json, os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
skins_dir = os.path.join(ROOT_DIR, "site-tree", "public_html", "hosted", "data", "skins")

prefixes = [
    ("sexcapades", "sex"), ("flexcapades", "flex"), ("poliscapades", "polis"), ("forescapades", "fores"),
    ("chemcapades", "chem"), ("aesthcapades", "aesth"), ("expericapades", "experi"), ("dharmacapades", "dharma"),
    ("mattercapades", "matter"), ("philoscapades", "philo"), ("praxicapades", "praxi"), ("quantacapades", "quanta"),
    ("simulcapades", "simul"), ("techcapades", "tech"), ("theoricapades", "theori"), ("vocapades", "voca"),
    ("nouscapades", "nous"), ("biocapades", "bio"), ("linguacapades", "lingua"), ("fastcapades", "fast"),
    ("dancecapades", "dance"), ("questcapades", "quest")
]

catalog = {}

for sid, pfx in prefixes:
    path = os.path.join(skins_dir, f"{sid}.json")
    with open(path, "r", encoding="utf-8") as fp:
        d = json.load(fp)
    name = d.get("name") or sid.capitalize()
    domain = d.get("domain") or ""
    about = d.get("about") or ""
    meter = d.get("meter") or "interest"

    cats = d.get("categories", [])
    cat_count = len(cats)
    subcat_count = 0
    topic_count = 0
    cats_with_sub = 0
    for c in cats:
        subs = c.get("subcategories", [])
        if subs:
            cats_with_sub += 1
            subcat_count += len(subs)
            for s in subs:
                topic_count += len(s.get("topics", []))
        else:
            topic_count += len(c.get("topics", []))

    if sid == "sexcapades":
        poles = ["give", "receive"]
        topic_term = "kink"
        topics_term = "kinks"
        desc = "kink & sexuality (18+)"
        about_summary = "Intimacy, eroticism, BDSM, power exchange, and relational geometries."
    elif sid == "dancecapades":
        poles = ["lead", "follow"]
        topic_term = "dance"
        topics_term = "partner dances"
        desc = "lead, follow, and move together"
        about_summary = "Leading, following, and the social dance floor."
    elif sid == "questcapades":
        poles = ["run (GM)", "play"]
        topic_term = "game"
        topics_term = "tabletop RPG systems & styles"
        desc = "the tales a table tells"
        about_summary = "Tabletop roleplay systems, playstyles, and table culture."
    elif sid == "flexcapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "how you use Flexcapades, and how you want it to grow"
        about_summary = "How you use Flexcapades, and how you want it to grow: the features and flows of the app itself, and live project decisions."
    elif sid == "poliscapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "stance"
        topics_term = "civic & economic stances"
        desc = "politics, economics, and governance"
        about_summary = "Where you stand on the questions that run a country: the economy, healthcare, power, and civil rights."
    elif sid == "forescapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "question"
        topics_term = "convictions & beliefs"
        desc = "religion — Abrahamic faiths"
        about_summary = "What you believe about God, scripture, and the life of faith across Judaism, Christianity, and Islam."
    elif sid == "chemcapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "chemistry"
        about_summary = "How molecules combine, what things are made of, and how chemical reactions transform the material world."
    elif sid == "aesthcapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "aesthetics & taste"
        about_summary = "What moves you: the art, music, stories, flavors you love, and the taste you trust."
    elif sid == "expericapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "experimental physics"
        about_summary = "How experiments should be run: evidence, proof standards, detector limits, and the work of discovery."
    elif sid == "dharmacapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "eastern religions"
        about_summary = "How you walk the path: practice, conduct, liberation, and what you hold sacred across Dharmic traditions."
    elif sid == "mattercapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "applied physics"
        about_summary = "Where you stand on the stuff of the world: materials, power, energy, and what to build with them."
    elif sid == "philoscapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "philosophy"
        about_summary = "Where you stand on the oldest questions: truth, reality, metaphysics, and ethics."
    elif sid == "praxicapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "applied mathematics"
        about_summary = "How you model the world: computation, numerical methods, simulation fidelity, and applied math."
    elif sid == "quantacapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "theoretical physics"
        about_summary = "Where you stand on the quantum world: foundational reality, quantum interpretations, and cosmic origins."
    elif sid == "simulcapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "computational physics"
        about_summary = "What you trust about copies of the world: simulation fidelity, virtual labs, and computational limits."
    elif sid == "techcapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "technology"
        about_summary = "Where you stand on the machines we build: artificial intelligence, privacy, attention, and technology ethics."
    elif sid == "theoricapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "pure mathematics"
        about_summary = "Where you stand on the foundations of mathematics: truth, rigorous proof, and mathematical beauty."
    elif sid == "vocapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "vocation & work"
        about_summary = "What work means to you: purpose, ambition, security, and the shape of a vocation."
    elif sid == "nouscapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "question"
        topics_term = "theories & questions of mind"
        desc = "what counts as a mind"
        about_summary = "What counts as a mind: consciousness, cognition without brains, and intelligence at every scale."
    elif sid == "biocapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "life itself"
        about_summary = "What drives evolution, how the genome scripts life, and the boundaries of living systems."
    elif sid == "linguacapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "the tongues we think in"
        about_summary = "Where you stand on language: grammar rules, dialect, linguistic relativity, and the world tongues."
    elif sid == "fastcapades":
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = "the discipline of not eating"
        about_summary = "Fasting in practice and theory: protocols, metabolic health, refeeding, and voluntary abstention."
    else:
        poles = ["advocacy", "receptivity"]
        topic_term = "topic"
        topics_term = "topics"
        desc = domain
        about_summary = about[:120].strip() if about else domain

    catalog[pfx] = {
        "id": sid,
        "prefix": pfx,
        "name": name,
        "brand": f"{pfx.capitalize()}.Capades.IO",
        "desc": desc,
        "domain": domain,
        "about": about or about_summary,
        "aboutSummary": about_summary,
        "meter": meter,
        "type": "activity" if sid in ("sexcapades", "dancecapades", "questcapades") else "stance",
        "poles": poles,
        "topicTerm": topic_term,
        "topicsTerm": topics_term,
        "cats": cat_count,
        "catsWithSub": cats_with_sub,
        "subcats": subcat_count,
        "topics": topic_count
    }

catalog_json_str = json.dumps(catalog, indent=2)

js_content = """/* docs-skin.js — skin-aware rendering for gate-linked docs, quick starts, and how-it-works.
   Architecture (inverted 2026-11-23): SFW Vanilla is the default baseline.
   Documentation renders SFW & Vanilla out-of-the-box.
   Only when skin.isSex is TRUE (on sex.capades.io or sexcapades.io)
   does this script unhide mature [data-sx-sex-only] blocks, hide [data-sx-vanilla-only]
   blocks, and swap in 18+ mature terminology. On all vanilla skins (flex.capades.io,
   fores, nous, polis, etc.), mature content is NEVER exposed.

   Each skin carries authoritative topic counts, category counts, subcategories,
   meter definitions, pole roles, and domain descriptions to populate Quick Start
   and How It Works pages dynamically.
*/
(function () {
  "use strict";

  var SKIN_CATALOG = """ + catalog_json_str + """;

  function detectSkin() {
    var host = "";
    try { host = window.location.hostname.toLowerCase(); } catch (e) { host = ""; }
    var cleanHost = host.replace(/^www\\./, "");
    var prefix = "";
    if (/\\.capades\\.io$/.test(cleanHost)) prefix = cleanHost.split(".")[0];
    else if (cleanHost === "sexcapades.io") prefix = "sex";
    var isSkinHost = !!prefix && !!SKIN_CATALOG[prefix];
    var q = null;
    try { q = new URLSearchParams(window.location.search || "").get("skin"); } catch (e) { q = null; }
    if (q) q = q.toLowerCase();
    if (!isSkinHost && q && SKIN_CATALOG[q]) prefix = q;
    if (!prefix || !SKIN_CATALOG[prefix]) prefix = "flex";
    return prefix;
  }

  var prefix = detectSkin();
  var rawSkin = SKIN_CATALOG[prefix] || SKIN_CATALOG.flex;
  var COMPARE_SKINS = { sex: true, polis: true };

  var skin = {
    id: rawSkin.id,
    prefix: prefix,
    name: rawSkin.name,
    brand: rawSkin.brand,
    desc: rawSkin.desc,
    domain: rawSkin.domain,
    about: rawSkin.about,
    aboutSummary: rawSkin.aboutSummary,
    meter: rawSkin.meter,
    type: rawSkin.type,
    poles: rawSkin.poles,
    topicTerm: rawSkin.topicTerm,
    topicsTerm: rawSkin.topicsTerm,
    cats: rawSkin.cats,
    catsWithSub: rawSkin.catsWithSub,
    subcats: rawSkin.subcats,
    topics: rawSkin.topics,
    host: prefix + ".capades.io",
    isSex: prefix === "sex",
    hasCompare: !!COMPARE_SKINS[prefix]
  };
  window.__SX_DOC_SKIN = skin;

  /* Rules for Sexcapades (18+ opt-in swap from vanilla default): */
  var SEX_RULES = [
    ["Flex.Capades.IO", "Sex.Capades.IO"],
    ["Flexcapades.IO", "Sexcapades.IO"],
    ["Flexcapades.io", "sexcapades.io"],
    ["Flexcapades", "Sexcapades"],
    ["flex.capades.io", "sexcapades.io"],
    ["Depth Factor", "Kink Factor"],
    ["Cross match", "Krossmatch"],
    ["Commune DF", "Play KF"],
    ["Commune MS", "Play MS"],
    ["Converse DF", "Parlay KF"],
    ["Converse MS", "Parlay MS"],
    ["questionnaires", "kink tests"],
    ["questionnaire", "kink test"],
    ["Questionnaire", "Kink test"],
    ["topics", "kinks"],
    ["Topics", "Kinks"],
    ["topic", "kink"],
    ["Topic", "Kink"]
  ];

  /* Rules for Vanilla Skins (brand name swap from generic Flexcapades): */
  var VANILLA_RULES = [
    ["Flex.Capades.IO", skin.brand],
    ["Flexcapades.IO", skin.brand],
    ["Flexcapades.io", skin.host],
    ["Flexcapades", skin.name],
    ["flex.capades.io", skin.host],
    ["Sex.Capades.IO", skin.brand],
    ["Sex.capades.io", skin.brand],
    ["sex.capades.io", skin.host],
    ["Sexcapades.IO", skin.brand],
    ["Sexcapades.io", skin.host],
    ["Sexcapades", skin.name],
    ["sexcapades.io", skin.host]
  ];

  var ACTIVE_RULES = skin.isSex ? SEX_RULES : VANILLA_RULES;

  function esc(s) { return s.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"); }
  var RES = ACTIVE_RULES.map(function (r) {
    return [new RegExp("\\\\b" + esc(r[0]) + "\\\\b", "g"), r[1]];
  });
  function swapText(s) {
    var out = s;
    for (var i = 0; i < RES.length; i++) out = out.replace(RES[i][0], RES[i][1]);
    return out;
  }
  function walk(node) {
    if (node.nodeType === 3) {
      var v = swapText(node.nodeValue);
      if (v !== node.nodeValue) node.nodeValue = v;
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;
    for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
  }

  function getLadderRungText(s) {
    var c = s.cats;
    var t = s.topics;
    if (s.isSex) {
      return "Each extra rung adds 3 topics to every category: 3 per category is 54 topics (~20 min), 6 is 108 (~40 min), 9 is 162 (~1 hr), 12 is 216 (~80 min), 15 is 270 (~100 min), 18 is 324 (~2 hrs), 21 covers the full 365-topic map in about 2.5 hours.";
    }
    var rungs = [3, 6, 9, 12, 15, 18, 21];
    var parts = [];
    for (var i = 0; i < rungs.length; i++) {
      var r = rungs[i];
      var count = r * c;
      if (count < t) {
        var mins = Math.max(5, Math.round(count * 0.38));
        var timeStr = mins < 60 ? ("~" + mins + " min") : ("~" + (mins / 60).toFixed(1).replace(/\\.0$/, "") + " hr" + (mins >= 90 ? "s" : ""));
        parts.push(r + " per category is " + count + " topics (" + timeStr + ")");
      } else {
        var fullMins = Math.max(8, Math.round(t * 0.38));
        var fullTimeStr = fullMins < 60 ? ("~" + fullMins + " min") : ("~" + (fullMins / 60).toFixed(1).replace(/\\.0$/, "") + " hr" + (fullMins >= 90 ? "s" : ""));
        parts.push("covering all " + t + " topics takes about " + fullTimeStr);
        break;
      }
    }
    if (parts.length <= 1) {
      return "Rating all " + t + " topics across its " + c + " categories takes about " + Math.max(8, Math.round(t * 0.38)) + " minutes in total.";
    }
    return "Each extra rung adds up to 3 topics to every category: " + parts.join(", ") + ".";
  }

  function skinHowItWorks(s) {
    if (!document.querySelector(".chain") || !document.querySelector(".heart")) return;

    // Page Title & Meta
    document.title = "How " + s.name + " Works";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      if (s.isSex) {
        metaDesc.setAttribute("content", "See how Sexcapades maps 365 kinks across 18 categories, turns private preferences into a visual map, and helps you compare and plan play.");
      } else {
        metaDesc.setAttribute("content", "See how " + s.name + " maps " + s.topics + " " + s.topicsTerm + " across " + s.cats + " categories, turns ratings into a visual hypermap, and compares stances for constructive dialogue.");
      }
    }

    // Header & Intro
    var titleEl = document.getElementById("page-title") || document.querySelector("h1");
    if (titleEl) titleEl.textContent = "How " + s.name + " works";

    var introP = document.querySelector(".intro p");
    if (introP) {
      if (s.isSex) {
        introP.textContent = "Map what you want across 365 kinks in 18 categories, compare privately, and turn the overlap into something you can explore together.";
      } else {
        var subStr = s.subcats ? (" and " + s.subcats + " subcategories") : "";
        var poleStr = s.type === "activity" ? (s.poles[0] + " and " + s.poles[1]) : (s.poles[0] + " and " + s.poles[1] + " on a scale of " + s.meter);
        introP.textContent = s.name + " maps " + s.topics + " " + s.topicsTerm + " across " + s.cats + " categories" + subStr + ". " + s.aboutSummary + " Rate your " + poleStr + ", compare privately, and turn the overlap into constructive dialogue.";
      }
    }

    // Step 02: Profile
    var step2Els = document.querySelectorAll(".chain .step:nth-child(2) p");
    var step2Text = "";
    if (s.isSex) {
      step2Text = "Rate give and receive across 365 kinks—or import KinkTest, FetLife, and more.";
    } else if (s.type === "activity") {
      step2Text = "Rate " + s.poles[0] + " and " + s.poles[1] + " across " + s.topics + " " + s.topicsTerm + " in " + s.cats + " categories.";
    } else {
      step2Text = "Rate " + s.poles[0] + " and " + s.poles[1] + " across " + s.topics + " topics in " + s.cats + " categories on a scale of " + s.meter + ".";
    }
    step2Els.forEach(function (p) { p.textContent = step2Text; });

    // Step 05: Stories & Dialectics / Story & play
    var step5H2s = document.querySelectorAll(".chain .step:nth-child(5) h2");
    var step5Ps = document.querySelectorAll(".chain .step:nth-child(5) p");
    var step5Title = "";
    var step5Desc = "";
    if (s.isSex) {
      step5Title = "Story & play";
      step5Desc = "Scribe turns your map into stories; Scene Setter helps you plan and negotiate play.";
    } else if (s.prefix === "dance") {
      step5Title = "Floor & music";
      step5Desc = "Scribe reflects on your floor style; Scene Setter helps plan partner tempos and dances.";
    } else if (s.prefix === "quest") {
      step5Title = "Campaign & session zero";
      step5Desc = "Scribe turns your map into campaign hooks; Scene Setter drafts a session-zero agreement on death, tone, and table rules.";
    } else if (s.prefix === "flex") {
      step5Title = "Roadmap & consensus";
      step5Desc = "Scribe drafts feature proposals and community feedback; Scene Setter helps align on Flexcapades roadmap priorities.";
    } else {
      step5Title = "Stories & dialectics";
      step5Desc = "Scribe turns your map into arguments and perspectives; Scene Setter helps you plan structured discussions and find consensus.";
    }
    step5H2s.forEach(function (h2) { h2.textContent = step5Title; });
    step5Ps.forEach(function (p) { p.textContent = step5Desc; });

    // Heart / Compare hook copy
    var hookPs = document.querySelectorAll(".hook-copy p");
    if (hookPs.length >= 3) {
      hookPs[1].innerHTML = "Bring them together when you’re ready. <span class=\\"sx-brand-name\\">" + s.name + "</span> highlights the overlap and quiets everything else.";
      var hook3Els = document.querySelectorAll(".hook-copy p:nth-child(3), .hook-copy p[data-sx-sex-only], .hook-copy p[data-sx-vanilla-only]");
      var hook3Html = "";
      if (s.isSex) {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where one person’s give meets the other’s receive. That’s where the conversation starts.";
      } else if (s.prefix === "dance") {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where one person’s lead meets the other’s follow. That’s where the dance begins.";
      } else if (s.prefix === "quest") {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where one person’s game to run meets another’s game to play. That’s where the table forms.";
      } else {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where your positions and receptivity align on shared " + s.meter + ". That’s where the conversation starts.";
      }
      hook3Els.forEach(function (el) { el.innerHTML = hook3Html; });
    }

    // Enter CTA button
    var enterBtn = document.querySelector(".enter");
    if (enterBtn) {
      enterBtn.textContent = "Try it — enter " + s.name;
      enterBtn.setAttribute("href", "https://" + s.host + "/");
    }
  }

  function skinQuickstart(s) {
    if (!document.querySelector(".steps-section")) return;

    var estMins = Math.max(8, Math.round(s.cats * 3 / 2.7));

    // Title & Meta
    document.title = s.name + " Quick Start";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Get started with " + s.name + " in about " + estMins + " minutes: rate 3 " + s.topicsTerm + " per category in the Hot list, then compare your hypermap with a partner.");
    }

    // Hero Section
    var introTitle = document.getElementById("intro-title");
    if (introTitle) introTitle.textContent = "Find what clicks—in about " + estMins + " minutes.";
    var timeEl = document.querySelector(".time");
    if (timeEl) timeEl.textContent = "~" + estMins + " minutes";

    // Hero Lede
    var ledes = document.querySelectorAll(".lede");
    var subcatStr = s.subcats ? (" (" + s.subcats + " subcategories)") : "";
    var ledeHtml = "";
    if (s.isSex) {
      ledeHtml = "<strong>Sexcapades maps 365 kinks across 18 categories.</strong> You rate each one for giving and for receiving; when a partner rates theirs, the app overlays your two maps and colors every topic by how you match.";
    } else if (s.prefix === "dance") {
      ledeHtml = "<strong>Dancecapades maps 82 partner dances across 9 categories (6 subcategories).</strong> You rate each dance for leading and for following; when a dance partner rates theirs, the app overlays your two maps and colors every dance by your mutual groove and lead/follow fit.";
    } else if (s.prefix === "quest") {
      ledeHtml = "<strong>Questcapades maps 79 tabletop roleplaying games and styles across 8 categories.</strong> You rate each game for running (GMing) and for playing; when your table rates theirs, the app overlays your maps and highlights the systems where GM appetite meets player desire.";
    } else if (s.prefix === "flex") {
      ledeHtml = "<strong>Flexcapades maps 29 topics across 7 categories.</strong> How you use Flexcapades, and how you want it to grow: you rate each feature and open question on your stake in it; when a partner or team member rates theirs, the app overlays your two maps and colors every topic by how you match.";
    } else {
      ledeHtml = "<strong>" + s.name + " maps " + s.topics + " " + s.topicsTerm + " across " + s.cats + " categories" + subcatStr + ".</strong> " + s.aboutSummary + " You rate each " + s.topicTerm + " on your " + s.poles[0] + " and " + s.poles[1] + "; when a partner rates theirs, the app overlays your two maps and colors every topic by how you match.";
    }
    ledes.forEach(function (l) { l.innerHTML = ledeHtml; });

    // Step 1: Hot list hierarchy
    var hierHtml = "";
    if (s.subcats > 0) {
      hierHtml = s.catsWithSub + " of the " + s.cats + " categories split into subcategories (" + s.subcats + " in total). A <strong>›</strong> beside a name means it is collapsed; tap it and the arrow turns down (<strong>⌄</strong>) as its contents expand in place.";
    } else {
      hierHtml = "All " + s.cats + " categories are flat lists without subcategories for direct, rapid scanning. A <strong>›</strong> beside a category name collapses or expands its topics in place.";
    }
    var step1HierEls = document.querySelectorAll(".steps .step:nth-child(1) p[data-sx-sex-only], .steps .step:nth-child(1) p[data-sx-vanilla-only]");
    if (step1HierEls.length > 0) {
      step1HierEls.forEach(function (el) { el.innerHTML = hierHtml; });
    } else {
      var step1Ps = document.querySelectorAll(".steps .step:nth-child(1) p");
      if (step1Ps.length >= 2) step1Ps[1].innerHTML = hierHtml;
    }

    // Step 2: Rating sliders & Coverage
    var sliderHtml = "";
    if (s.isSex) {
      sliderHtml = "Every topic has two sliders: <strong>give</strong> sits above the topic’s line, <strong>receive</strong> below it. Drag either one to set how much you want that side of it — the scale runs from Not Interested through Curious about to Want to do, and you can also flag a topic Hard Limit or Fantasy-only.";
    } else if (s.prefix === "dance") {
      sliderHtml = "Every dance has two sliders: <strong>lead</strong> sits above the dance’s line, <strong>follow</strong> below it. Drag either one to rate your appetite for that role — the scale runs from Not Interested through Curious to Passionate, with flags for hard boundaries.";
    } else if (s.prefix === "quest") {
      sliderHtml = "Every game has two sliders: <strong>run (GM)</strong> sits above the line, <strong>play</strong> below it. Drag either one to rate your appetite for running or playing that system — the scale runs from Not Interested through Curious to Passionate.";
    } else {
      sliderHtml = "Every topic has two sliders: <strong>advocacy</strong> sits above the line (your conviction or push for it), <strong>receptivity</strong> below it (your openness to others who hold it). Drag either one on a scale of " + s.meter + " — from Not Interested through Curious to Strongly held, with flags for firm limits.";
    }
    var step2TargetPs = document.querySelectorAll(".steps .step:nth-child(2) p[data-sx-sex-only], .steps .step:nth-child(2) p[data-sx-vanilla-only]");
    if (step2TargetPs.length > 0) {
      step2TargetPs.forEach(function (p) { p.innerHTML = sliderHtml; });
    } else {
      var step2Ps = document.querySelectorAll(".steps .step:nth-child(2) p");
      if (step2Ps.length >= 1) step2Ps[0].innerHTML = sliderHtml;
    }

    var almostAll = (3 * s.cats >= s.topics) ? " (covering almost the entire map!)" : "";
    var coverageText = "Stopping at 3 per category covers all " + s.cats + " categories — " + (3 * s.cats) + " topics in about " + estMins + " minutes" + almostAll + ".";
    var step2CoverageLis = document.querySelectorAll(".steps .step:nth-child(2) ul li[data-sx-sex-only], .steps .step:nth-child(2) ul li[data-sx-vanilla-only]");
    if (step2CoverageLis.length > 0) {
      step2CoverageLis.forEach(function (li) { li.innerHTML = coverageText; });
    } else {
      var step2Lis = document.querySelectorAll(".steps .step:nth-child(2) ul li");
      if (step2Lis.length >= 2) step2Lis[step2Lis.length - 1].innerHTML = coverageText;
    }

    // Step 3: Compare with partner
    var step3CompareEls = document.querySelectorAll(".steps .step:nth-child(3) p[data-sx-sex-only], .steps .step:nth-child(3) p[data-sx-vanilla-only]");
    var compareHtml = "";
    if (s.isSex) {
      compareHtml = "Import a partner’s hypermap (step 1) and the app combines both profiles into one: each cross-pairing is scored by fit — your give against their receive, and their give against your receive — and colored by the result. Solo? Scribe generates stories and play guides from just your profile.";
    } else if (s.prefix === "dance") {
      compareHtml = "Import a dance partner’s hypermap (step 1) and the app combines both profiles into one: each dance is scored by fit — your lead against their follow, and their lead against your follow — and colored by the result. Solo? Scribe generates floor profiles and playlist suggestions.";
    } else if (s.prefix === "quest") {
      compareHtml = "Import a player's or GM's hypermap (step 1) and the app combines table profiles: matching who wants to run what with who wants to play what. Solo? Scribe generates campaign hooks and adventure seeds.";
    } else {
      compareHtml = "Import a partner or colleague’s hypermap (step 1) and the app combines both profiles: each topic is scored by mutual fit — your advocacy against their receptivity, and their advocacy against yours — and colored by the result. Solo? Scribe generates an informed dialectic from just your profile.";
    }
    if (step3CompareEls.length > 0) {
      step3CompareEls.forEach(function (el) { el.innerHTML = compareHtml; });
    } else {
      var step3P = document.querySelector(".steps .step:nth-child(3) p");
      if (step3P) step3P.innerHTML = compareHtml;
    }

    // Normalization tip ("Did you know?")
    var normP = document.querySelector(".normalization-tip p:last-child");
    if (normP) {
      if (s.isSex) {
        normP.innerHTML = "Every topic has an About button. It shows how common that kink is and links to Reddit, FetLife, and Discord communities for it.";
      } else {
        normP.innerHTML = "Every topic has an About button. It provides background context, references, and definitions for that specific " + s.topicTerm + ".";
      }
    }

    // Quick tips (Ladder rungs)
    var quickTipsLis = document.querySelectorAll(".quick-tips ul li");
    if (quickTipsLis.length >= 1) {
      quickTipsLis[0].textContent = getLadderRungText(s);
    }

    // Payoff Intro
    var payoffPs = document.querySelectorAll(".payoff-intro p");
    var payoffText = "";
    if (s.isSex) {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into a story or scene prompt, and Scene Setter turns two profiles into a plan for negotiating play. Scene Sentinel adds check-in timers and emergency contacts to help keep play safer.";
    } else if (s.prefix === "dance") {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into dance and floor reflections, and Scene Setter turns two profiles into a dance partnership plan for tempos, styles, and floor rotation.";
    } else if (s.prefix === "quest") {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into campaign pitches and adventure prompts, and Scene Setter turns multiple profiles into a session-zero agreement on death, tone, and table rules.";
    } else if (s.prefix === "flex") {
      payoffText = "Your saved ratings feed two tools: Scribe drafts feature proposals and community feedback, and Scene Setter turns two profiles into an alignment map on Flexcapades roadmap priorities.";
    } else {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into an informed dialectic or manifesto, and Scene Setter turns two profiles into a structured discussion agreement on where you agree, disagree, and explore together.";
    }
    payoffPs.forEach(function (p) { p.textContent = payoffText; });

    // Output examples · Scene Setter
    var setterH3s = document.querySelectorAll(".output-examples .output-example:nth-child(2) h3");
    var setterUls = document.querySelectorAll(".output-examples .output-example:nth-child(2) ul");
    var setterTitle = "";
    var setterItemsHtml = "";
    if (s.isSex) {
      setterTitle = "A scene you can actually use";
      setterItemsHtml = "<li>Choose a safeword and agree on the pace before you begin.</li><li>Start with the strongest shared interest from both maps.</li><li>Pause for a check-in before raising the intensity.</li>";
    } else if (s.prefix === "dance") {
      setterTitle = "A dance partnership you can take to the floor";
      setterItemsHtml = "<li>Agree on tempos and styles before you step onto the floor.</li><li>Start with the strongest shared dance from both maps.</li><li>Check in on comfort and lead/follow connection between songs.</li>";
    } else if (s.prefix === "quest") {
      setterTitle = "A session-zero agreement for your table";
      setterItemsHtml = "<li>Agree on lethality, tone, and system rules before rolling characters.</li><li>Start with the strongest shared game interest from the table.</li><li>Check in on player boundaries and campaign pacing.</li>";
    } else if (s.prefix === "flex") {
      setterTitle = "A feature roadmap consensus";
      setterItemsHtml = "<li>Identify shared high-stake priorities across both profiles.</li><li>Surface the open design splits where opinions diverge.</li><li>Focus discussion on resolving key architectural tradeoffs.</li>";
    } else {
      setterTitle = "A discussion agreement you can actually use";
      setterItemsHtml = "<li>Agree on ground rules and terms before you begin.</li><li>Start with the strongest shared conviction from both maps.</li><li>Pause for reflection before moving to a harder controversy.</li>";
    }
    setterH3s.forEach(function (h3) { h3.textContent = setterTitle; });
    setterUls.forEach(function (ul) { ul.innerHTML = setterItemsHtml; });

    // More section
    var moreH2 = document.querySelector(".more h2");
    if (moreH2) moreH2.textContent = "More " + s.name;

    // Glossary mention in footer
    var glossaryLink = document.querySelector('footer a[href*="glossary.html"]');
    if (glossaryLink) {
      glossaryLink.textContent = s.name + " Glossary";
    }
  }

  function apply() {
    if (document.body) {
      if (skin.isSex) document.body.classList.add("is-sex-skin");
      else document.body.classList.add("is-vanilla-skin");
    }
    var titleEl = document.querySelector("title[data-sx-title-vanilla]");
    if (!skin.isSex && titleEl) {
      document.title = swapText(titleEl.getAttribute("data-sx-title-vanilla"));
    } else if (document.title) {
      document.title = swapText(document.title);
    }
    if (document.body) walk(document.body);
    var attrs = ["title", "aria-label", "alt", "placeholder"];
    attrs.forEach(function (attr) {
      var els = document.querySelectorAll("[" + attr + "]");
      for (var i = 0; i < els.length; i++) {
        var v = els[i].getAttribute(attr);
        if (v) {
          var nv = swapText(v);
          if (nv !== v) els[i].setAttribute(attr, nv);
        }
      }
    });
    var metas = document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
    for (var m = 0; m < metas.length; m++) {
      var c = metas[m].getAttribute("content");
      if (c) {
        var nc = swapText(c);
        if (nc !== c) metas[m].setAttribute("content", nc);
      }
    }
    var links = document.querySelectorAll("a[href]");
    for (var l = 0; l < links.length; l++) {
      var h = links[l].getAttribute("href");
      if (!h) continue;
      var nh = h.replace(/^https?:\\/\\/((www\\.)?(sexcapades\\.io|sex\\.capades\\.io))(\\/|$|\\?|#)/i, function (_, __, ___, ____, tail) {
        return "https://" + skin.host + (tail || "");
      });
      if (nh !== h) links[l].setAttribute("href", nh);
    }
    var flyerQrs = document.querySelectorAll(".mini-qr");
    for (var qi = 0; qi < flyerQrs.length; qi++) {
      flyerQrs[qi].style.backgroundImage = 'url("/hosted/images/flyer-qr-' + prefix + '.svg")';
    }

    if (skin.isSex) {
      /* On 18+ Sexcapades: unhide sex-only blocks, hide vanilla-only blocks */
      var sexOnly = document.querySelectorAll("[data-sx-sex-only]");
      for (var s = 0; s < sexOnly.length; s++) sexOnly[s].removeAttribute("hidden"), sexOnly[s].style.display = "";
      var vanillaOnly = document.querySelectorAll("[data-sx-vanilla-only]");
      for (var v = 0; v < vanillaOnly.length; v++) vanillaOnly[v].style.display = "none";
    } else {
      /* On SFW Vanilla skins: hide sex-only blocks, unhide vanilla-only blocks */
      var sexOnly = document.querySelectorAll("[data-sx-sex-only]");
      for (var s = 0; s < sexOnly.length; s++) sexOnly[s].style.display = "none";
      var vanillaOnly = document.querySelectorAll("[data-sx-vanilla-only]");
      for (var v = 0; v < vanillaOnly.length; v++) vanillaOnly[v].removeAttribute("hidden"), vanillaOnly[v].style.display = "";
    }

    // Apply deep page-specific skinning for Quickstart & How-It-Works
    skinHowItWorks(skin);
    skinQuickstart(skin);

    try {
      var odoDigits = document.querySelectorAll("[id^='odometer-digits']");
      if (odoDigits.length > 0) {
        fetch("/hosted/api/collect.php", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({action: "get_stats", skin: skin.name.toLowerCase()})
        })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && typeof d.unique_visitors === "number") {
            var str = String(d.unique_visitors).padStart(6, "0");
            odoDigits.forEach(function (c) {
              c.innerHTML = "";
              for (var i = 0; i < str.length; i++) {
                var dig = document.createElement("div");
                dig.className = "odometer-digit";
                dig.textContent = str[i];
                c.appendChild(dig);
              }
            });
          }
        }).catch(function () {});
      }
    } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
"""

with open("app/js/docs-skin.js", "w", encoding="utf-8") as fp:
    fp.write(js_content)

print("Wrote app/js/docs-skin.js successfully!")
