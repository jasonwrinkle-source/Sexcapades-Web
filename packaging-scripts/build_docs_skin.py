import json, math, os

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


def _extract_hot_list_poles(val):
    if val is None:
        return None
    if isinstance(val, (int, float)) and not isinstance(val, bool) and math.isfinite(val):
        return {"_scalar": float(val)}
    if not isinstance(val, dict):
        return None
    if "advocacy" in val:
        adv = val["advocacy"]
        if isinstance(adv, (int, float)) and not isinstance(adv, bool) and math.isfinite(adv):
            return {"_scalar": float(adv)}
        if isinstance(adv, dict):
            poles = {
                k: float(v)
                for k, v in adv.items()
                if k not in ("intensity", "known", "mode")
                and isinstance(v, (int, float))
                and not isinstance(v, bool)
                and math.isfinite(v)
            }
            return poles if poles else None
        return None
    poles = {
        k: float(v)
        for k, v in val.items()
        if k not in ("intensity", "receptivity", "known", "mode")
        and isinstance(v, (int, float))
        and not isinstance(v, bool)
        and math.isfinite(v)
    }
    return poles if poles else None


def _layer_val(entry):
    d = str(entry.get("date") or "").strip()
    if d.lower() == "present":
        return float("inf")
    try:
        return float(d)
    except ValueError:
        return float("-inf")


def _compute_first_ladder(samples):
    """Exact Python mirror of sxGetHotListCache() in 03d0-outline-state.js.
    Returns (headline_archetype_count, first_ladder_count, first_ladder_est_mins)."""
    if not isinstance(samples, dict):
        return (0, 0, 0)
    by_topic = {}
    for _, s in samples.items():
        if not isinstance(s, dict) or s.get("local"):
            continue
        ratings = (s.get("payload") or {}).get("ratings")
        if not isinstance(ratings, dict):
            continue
        for tid, rv in ratings.items():
            poles = _extract_hot_list_poles(rv)
            if not poles:
                continue
            tm = by_topic.setdefault(tid, {})
            for pk, pv in poles.items():
                st = tm.get(pk)
                if st is None:
                    tm[pk] = [pv, pv, 1]
                else:
                    if pv < st[0]:
                        st[0] = pv
                    if pv > st[1]:
                        st[1] = pv
                    st[2] += 1

    fault_map = {}
    for tid, tm in by_topic.items():
        sm = 0.0
        cnt = 0
        mx = -1.0
        for st in tm.values():
            if st[2] >= 2:
                r = st[1] - st[0]
                sm += r
                cnt += 1
                if r > mx:
                    mx = r
        if cnt > 0:
            fault_map[tid] = (sm / cnt, mx, cnt)

    stack_groups = {}
    stack_order = []
    headline_keys = []
    for k, entry in samples.items():
        if not isinstance(entry, dict) or entry.get("local"):
            continue
        ratings = (entry.get("payload") or {}).get("ratings")
        if not isinstance(ratings, dict):
            continue
        sk = entry.get("stackKey") or entry.get("stack")
        if sk:
            if sk not in stack_groups:
                stack_groups[sk] = []
                stack_order.append(sk)
            stack_groups[sk].append(k)
        elif entry.get("kind") != "sample":
            headline_keys.append(k)
    for sk in stack_order:
        grp = stack_groups[sk]
        top_key = grp[0]
        for gk in grp[1:]:
            if _layer_val(samples[gk]) > _layer_val(samples[top_key]):
                top_key = gk
        headline_keys.append(top_key)

    n_arch = len(headline_keys)
    if n_arch < 2:
        return (n_arch, 0, 0)

    arch_ratings = [samples[k]["payload"]["ratings"] for k in headline_keys]
    cand_tids = sorted(fault_map.keys(), key=lambda tid: (-fault_map[tid][0], -fault_map[tid][1], tid))
    pairs = [(i, j) for i in range(n_arch) for j in range(i + 1, n_arch)]
    pair_count = len(pairs)

    active = []
    for tid in cand_tids:
        raws = []
        pk_set = set()
        rated_cnt = 0
        for a in range(n_arch):
            p = _extract_hot_list_poles(arch_ratings[a].get(tid))
            raws.append(p)
            if p:
                rated_cnt += 1
                pk_set.update(p.keys())
        if rated_cnt < 2 or not pk_set:
            continue
        pks = list(pk_set)
        klen = len(pks)
        row = []
        for ia, ib in pairs:
            va, vb = raws[ia], raws[ib]
            if not va or not vb:
                row.append(-1.0)
            else:
                row.append(sum(abs(va.get(pk, 0.0) - vb.get(pk, 0.0)) for pk in pks))
        is_multi = not (klen <= 1 or (klen == 2 and "give" in pk_set and "receive" in pk_set))
        active.append((tid, row, klen, is_multi))

    t_count = len(active)
    min_floor = min(t_count, 6)
    max_cap = min(t_count, 24)
    used = [False] * t_count
    cum_sum = [0.0] * pair_count
    cum_poles = [0] * pair_count
    ladder_count = 0
    est_sec = 0

    ladder_ids = []
    for _ in range(max_cap):
        best_t = -1
        best_obj = -1e18
        for t in range(t_count):
            if used[t]:
                continue
            _, row, kl, _ = active[t]
            mn = 1e9
            soft = 0.0
            for p in range(pair_count):
                d = row[p]
                s = cum_sum[p]
                c = cum_poles[p]
                if d >= 0:
                    s += d
                    c += kl
                snr = (s / math.sqrt(c)) if c > 0 else 0.0
                if snr < mn:
                    mn = snr
                soft -= math.exp(-snr / 25.0)
            obj = mn * 100.0 + soft
            if obj > best_obj:
                best_obj = obj
                best_t = t
        if best_t < 0:
            break
        used[best_t] = True
        ladder_count += 1
        tid, row, kl, is_multi = active[best_t]
        ladder_ids.append(tid)
        est_sec += 25 if is_multi else 15
        min_snr = 1e9
        for p in range(pair_count):
            if row[p] >= 0:
                cum_sum[p] += row[p]
                cum_poles[p] += kl
            snr = (cum_sum[p] / math.sqrt(cum_poles[p])) if cum_poles[p] > 0 else 0.0
            if snr < min_snr:
                min_snr = snr
        if ladder_count >= min_floor and min_snr >= 75.0:
            break

    est_min = max(1, round(est_sec / 60.0)) if ladder_count else 0
    return (n_arch, ladder_count, est_min, ladder_ids)


def _compute_brr_totals(cats, ladder_ids, total_topics):
    """Exact mirror of Phase 2 (BRR to 3/cat) and Phase 3 (BRR to 6/cat) cumulative totals."""
    used = set()
    topic_branch = {}
    branch_counts = {}
    branch_totals = {}
    for c in cats:
        bname = c.get("name") or ""
        branch_counts[bname] = 0
        tids = []
        for t in (c.get("topics") or []) + (c.get("parentTopics") or []):
            tid = t.get("id") if isinstance(t, dict) else None
            if tid and tid not in topic_branch:
                topic_branch[tid] = bname
                tids.append(tid)
        for s in (c.get("subcategories") or []):
            for t in (s.get("topics") or []) + (s.get("parentTopics") or []):
                tid = t.get("id") if isinstance(t, dict) else None
                if tid and tid not in topic_branch:
                    topic_branch[tid] = bname
                    tids.append(tid)
        branch_totals[bname] = len(tids)

    p1 = 0
    for tid in ladder_ids:
        if tid in topic_branch and tid not in used:
            used.add(tid)
            branch_counts[topic_branch[tid]] += 1
            p1 += 1

    # Phase 2: BRR to 3 per category
    p2_added = 0
    for bname, tot in branch_totals.items():
        need = max(0, min(3, tot) - branch_counts[bname])
        branch_counts[bname] += need
        p2_added += need
    core_cum = p1 + p2_added

    # Phase 3: BRR to 6 per category on non-compact maps
    n_cats = len(cats)
    allow_p3 = n_cats > 0 and (6 * n_cats <= int(total_topics * 0.8)) and (core_cum < int(total_topics * 0.8))
    deeper_cum = 0
    if allow_p3:
        p3_added = 0
        for bname, tot in branch_totals.items():
            need = max(0, min(6, tot) - branch_counts[bname])
            branch_counts[bname] += need
            p3_added += need
        if p3_added > 0:
            deeper_cum = core_cum + p3_added

    return (core_cum, deeper_cum)


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
        topic_count += len(c.get("topics", [])) + len(c.get("parentTopics", []))
        subs = c.get("subcategories", [])
        if subs:
            cats_with_sub += 1
            subcat_count += len(subs)
            for s in subs:
                topic_count += len(s.get("topics", [])) + len(s.get("parentTopics", []))

    arch_count, first_ladder_count, first_ladder_mins, ladder_ids = _compute_first_ladder(d.get("samples", {}))
    core_total, deeper_total = _compute_brr_totals(cats, ladder_ids, topic_count)

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
        "topics": topic_count,
        "archetypes": arch_count,
        "firstLadder": first_ladder_count,
        "firstLadderMins": first_ladder_mins,
        "coreTotal": core_total,
        "deeperTotal": deeper_total
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
    archetypes: rawSkin.archetypes || 0,
    firstLadder: rawSkin.firstLadder || 0,
    firstLadderMins: rawSkin.firstLadderMins || 0,
    coreTotal: rawSkin.coreTotal || 0,
    deeperTotal: rawSkin.deeperTotal || 0,
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

  function formatEstMins(mins) {
    var m = Math.max(1, Math.round(mins));
    if (m < 60) return "~" + m + " min";
    var hrs = (m / 60).toFixed(1).replace(/\\.0$/, "");
    return "~" + hrs + " hr" + (m >= 90 ? "s" : "");
  }

  function getLadderRungText(s) {
    var c = s.cats;
    var t = s.topics;
    var flN = s.firstLadder || Math.min(t, 6);
    var flM = s.firstLadderMins || Math.max(1, Math.round(flN / 3));
    var coreN = s.coreTotal || Math.min(3 * c, t);
    var deeperN = s.deeperTotal || 0;
    var parts = [
      "Phase 1 (First Ladder) is " + flN + " topics (" + formatEstMins(flM) + ")",
      "Phase 2 (Core Map, balanced round-robin to 3/category) reaches " + coreN + " topics (" + formatEstMins(coreN / 3) + ")"
    ];
    if (deeperN > coreN && deeperN < t) {
      parts.push("Phase 3 (Deeper, 6/category) reaches " + deeperN + " topics (" + formatEstMins(deeperN / 3) + ")");
    }
    parts.push("the full " + t + "-topic map takes " + formatEstMins(t / 3));
    return "Guided Ladder milestones: " + parts.join("; ") + ".";
  }

  function renderProfilePhases(s) {
    var section = document.getElementById("profile-phases");
    if (!section) return;

    var c = s.cats;
    var t = s.topics;
    var arch = s.archetypes || 0;
    var flN = s.firstLadder || Math.min(t, 6);
    var flM = s.firstLadderMins || Math.max(1, Math.round(flN / 3));
    var pass1 = s.coreTotal || Math.min(3 * c, t);
    var pass1M = Math.max(1, Math.round(pass1 / 3));
    var pass2 = s.deeperTotal || 0;
    var hasPass2 = pass2 > pass1 && pass2 < t;
    var pass2M = Math.max(1, Math.round(pass2 / 3));
    var fullM = Math.max(1, Math.round(t / 3));
    var factorName = s.isSex ? "Kink Factor" : "Personal Depth Factor";
    var archPhrase = arch > 1 ? ("all " + arch + " headline archetypes") : "the map’s archetypes";
    var partnerWord = s.prefix === "dance" ? "dance partner" : s.prefix === "quest" ? "table" : "partner";

    var ledeEl = document.getElementById("phases-lede");
    if (ledeEl) {
      ledeEl.textContent = "You don’t need to rate all " + t + " topics in one sitting. Guided Ladder feeds topics in real phases—matching the ticks on the phase-aware progress bar—so every minute unlocks a sharper profile.";
    }

    var phases = [
      {
        num: "Phase 01",
        tag: "First Ladder",
        metric: flN + " topics · " + formatEstMins(flM),
        title: "First archetype projection",
        body: "Rate the top " + flN + " topics—picked by the greedy orthogonal ladder to separate " + archPhrase + " in the fewest steps. Enough for your first “Which archetype am I?” projection."
      },
      {
        num: "Phase 02",
        tag: "3/cat · round-robin",
        metric: pass1 + " topics total · " + formatEstMins(pass1M),
        title: "Accurate projection & core map",
        body: "Branch round-robin draws the sharpest pole splits (fault lines) across all " + c + " categories until every branch has at least 3 topics. Locks in an accurate archetype projection and a balanced map ready to compare with a " + partnerWord + "."
      }
    ];

    if (hasPass2) {
      phases.push({
        num: "Phase 03",
        tag: "6/cat · round-robin",
        metric: pass2 + " topics total · " + formatEstMins(pass2M),
        title: "Deeper resolution",
        body: "Continues round-robin across all " + c + " categories to 6 per branch—surfacing secondary fault lines so Scribe, Scene Setter, and group sync capture nuance beyond headline agreement."
      });
    }

    phases.push({
      num: hasPass2 ? "Phase 04" : "Phase 03",
      tag: "Full map",
      metric: t + " topics · " + formatEstMins(fullM),
      title: "Complete map",
      body: "Every " + s.topicTerm + " on the map rated down through the popularity and alphabetical tail—maximum " + factorName + " and zero blind spots in " + partnerWord + " overlays."
    });

    var grid = document.getElementById("phases-grid");
    if (grid) {
      grid.classList.toggle("is-four", phases.length === 4);
      grid.classList.toggle("is-three", phases.length === 3);
      grid.innerHTML = phases.map(function (p) {
        return '<article class="phase-card">' +
          '<div class="phase-head">' +
            '<span class="phase-num">' + p.num + '</span>' +
            '<span class="phase-tag">' + p.tag + '</span>' +
          '</div>' +
          '<h3>' + p.title + '</h3>' +
          '<p class="phase-metric">' + p.metric + '</p>' +
          '<p class="phase-body">' + p.body + '</p>' +
        '</article>';
      }).join("");
    }

    var cascadeList = document.getElementById("cascade-list");
    if (cascadeList) {
      var tiers = [
        {
          rank: "01",
          name: "Greedy orthogonal first ladder",
          detail: "Top " + flN + " topics chosen to maximize separation between the closest pair of headline archetypes."
        },
        {
          rank: "02",
          name: "Branch round-robin pole splits",
          detail: "Balances all " + c + " categories evenly (to 3/cat" + (hasPass2 ? ", then 6/cat" : "") + "), drawing each branch’s sharpest archetype fault lines first."
        },
        {
          rank: "03",
          name: "Popularity",
          detail: "Remaining topics ordered globally by community rating volume so widely relevant ones surface first."
        },
        {
          rank: "04",
          name: "Alphabetical",
          detail: "Deterministic tie-breaker for the long tail so rows never jump while you rate."
        }
      ];
      cascadeList.innerHTML = tiers.map(function (tier) {
        return '<li class="cascade-step">' +
          '<span class="cascade-rank">' + tier.rank + '</span>' +
          '<div class="cascade-copy"><strong>' + tier.name + '</strong> — ' + tier.detail + '</div>' +
        '</li>';
      }).join("");
    }
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

    var pass1 = s.coreTotal || Math.min(3 * s.cats, s.topics);
    var estMins = Math.max(1, Math.round(pass1 / 3));
    var flN = s.firstLadder || Math.min(s.topics, 6);
    var flM = s.firstLadderMins || Math.max(1, Math.round(flN / 3));

    // Title & Meta
    document.title = s.name + " Quick Start";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Get started with " + s.name + ": rate the top " + flN + " topics (~" + flM + " min) for your first archetype projection, or " + pass1 + " balanced topics (~" + estMins + " min) for a partner-ready core map.");
    }

    // Hero Section
    var introTitle = document.getElementById("intro-title");
    if (introTitle) introTitle.textContent = "Find what clicks—in about " + estMins + " minutes.";
    var timeEl = document.querySelector(".time");
    if (timeEl) timeEl.textContent = "~" + flM + "m first projection · ~" + estMins + "m core map";

    // Hero Lede
    var ledes = document.querySelectorAll(".lede");
    var subcatStr = s.subcats ? (" (" + s.subcats + " subcategories)") : "";
    var ledeHtml = "";
    if (s.isSex) {
      ledeHtml = "<strong>Sexcapades maps " + s.topics + " kinks across " + s.cats + " categories.</strong> You rate each one for giving and for receiving; when a partner rates theirs, the app overlays your two maps and colors every topic by how you match.";
    } else if (s.prefix === "dance") {
      ledeHtml = "<strong>Dancecapades maps " + s.topics + " partner dances across " + s.cats + " categories" + subcatStr + ".</strong> You rate each dance for leading and for following; when a dance partner rates theirs, the app overlays your two maps and colors every dance by your mutual groove and lead/follow fit.";
    } else if (s.prefix === "quest") {
      ledeHtml = "<strong>Questcapades maps " + s.topics + " tabletop roleplaying games and styles across " + s.cats + " categories.</strong> You rate each game for running (GMing) and for playing; when your table rates theirs, the app overlays your maps and highlights the systems where GM appetite meets player desire.";
    } else if (s.prefix === "flex") {
      ledeHtml = "<strong>Flexcapades maps " + s.topics + " topics across " + s.cats + " categories.</strong> How you use Flexcapades, and how you want it to grow: you rate each feature and open question on your stake in it; when a partner or team member rates theirs, the app overlays your two maps and colors every topic by how you match.";
    } else {
      ledeHtml = "<strong>" + s.name + " maps " + s.topics + " " + s.topicsTerm + " across " + s.cats + " categories" + subcatStr + ".</strong> " + s.aboutSummary + " You rate each " + s.topicTerm + " on your " + s.poles[0] + " and " + s.poles[1] + "; when a partner rates theirs, the app overlays your two maps and colors every topic by how you match.";
    }
    ledes.forEach(function (l) { l.innerHTML = ledeHtml; });

    // Step 1: Hot list hierarchy & modes
    var hierHtml = "";
    if (s.subcats > 0) {
      hierHtml = "In By Category view, " + s.catsWithSub + " of the " + s.cats + " categories split into subcategories (" + s.subcats + " in total). Tap any heading (<strong>›</strong>) to expand all of its topics in place.";
    } else {
      hierHtml = "In By Category view, all " + s.cats + " categories are flat lists for rapid browsing. Tap any heading (<strong>›</strong>) to expand all of its topics in place.";
    }
    var step1HierEls = document.querySelectorAll(".steps .step:nth-child(1) p[data-sx-sex-only], .steps .step:nth-child(1) p[data-sx-vanilla-only]");
    if (step1HierEls.length > 0) {
      step1HierEls.forEach(function (el) { el.innerHTML = hierHtml; });
    } else {
      var step1Ps = document.querySelectorAll(".steps .step:nth-child(1) p");
      if (step1Ps.length >= 2) step1Ps[1].innerHTML = hierHtml;
    }

    // Step 2: Rating sliders & Guided Ladder phases
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

    var step2FirstLi = document.getElementById("step2-first-ladder");
    if (step2FirstLi) {
      step2FirstLi.innerHTML = "<strong>Phase 1 — First Ladder (" + flN + " topics · " + formatEstMins(flM) + "):</strong> start with the top greedy-orthogonal topics to unlock your first archetype projection.";
    }

    var almostAll = (pass1 >= Math.round(s.topics * 0.7)) ? " (covering most of the map!)" : "";
    var coverageText = "<strong>Phase 2 — Core map (" + pass1 + " topics total · " + formatEstMins(estMins) + "):</strong> branch round-robin balances all " + s.cats + " categories (3 per category)" + almostAll + " for an accurate archetype projection and partner comparison.";
    var step2CoverageLis = document.querySelectorAll(".steps .step:nth-child(2) ul li[data-sx-sex-only], .steps .step:nth-child(2) ul li[data-sx-vanilla-only]");
    if (step2CoverageLis.length > 0) {
      step2CoverageLis.forEach(function (li) { li.innerHTML = coverageText; });
    } else {
      var step2Lis = document.querySelectorAll(".steps .step:nth-child(2) ul li");
      if (step2Lis.length >= 2) step2Lis[1].innerHTML = coverageText;
    }

    // Profile phases & 4-tier Hot List cascade
    renderProfilePhases(s);

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
