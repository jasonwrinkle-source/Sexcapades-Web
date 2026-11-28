# Whole-Cloth Skin Creation Guide — for a fresh AI

> **For:** a fresh AI (a new account, no prior work on this project) creating a brand-new
> skin from scratch, with full research, in the standardized format, so the Scribe can use it.
> **Lives in:** both the main repo (Sexcapades-Web) and the skins repo (capades-skins).

---

## 0. CLEAN-ROOM WARNING — READ FIRST. DO NOT SKIP.

**Do NOT look at prior work in this repository.**

- Do **NOT** open, read, or copy from any existing skin file (any `*capades.json`),
  any existing research document, or any prior skin in this repo or the main repo.
- Do **NOT** browse the `skins/` directory, the `research/` directory, or any existing
  skin to "see how it is done," to reuse topics, archetypes, wordings, or framings.
- Create this skin **WHOLE-CLOTH from your own knowledge of the domain**. Every topic,
  pole, archetype, sample, and piece of research must be your own original work.
- This repository is the **DELIVERY location** for your finished skin, not source material.
  You are delivering *into* it, not reading *from* it.
- The **only** exception is this guide itself and the schema described in it. Use the
  schema below to shape your output. Do **not** open an existing skin file to check the
  schema — the schema is fully specified here.
- **Why:** a skin must be original. Reading prior work contaminates it — topics, framings,
  and wordings leak across skins. Clean-room creation is the rule, not a suggestion.

If you are tempted to peek at an existing skin "just for the format," re-read the schema
in §2 instead. It is complete. Do not peek.

---

## 1. What you are building

A **skin** is a map of one domain — one way of looking at the world — expressed as
topics a person can rate, plus the profiles (archetypes and samples) that embody
positions on those topics, plus the research that backs the positions.

- A skin covers **one domain** (for example: politics, chemistry, dance, food, faith).
  Pick the domain you were asked for. Do not widen it to cover everything.
- A skin has **topics** (the things a person rates), grouped into **categories** and
  **subcategories**.
- A skin has **archetypes** (the named, emblematic positions — the "ideal types" of the
  domain) and **samples** (concrete example profiles). Archetypes and samples are both
  full profiles with ratings on the skin's topics.
- A skin has a **meter word** (one word that names what the skin measures — for example
  `conviction`, `stake`, `sensibility`). Meter words need **not** be unique across skins;
  reuse is fine.
- A skin has **full research** (§3): the reasons and statistics backing each position,
  so the Scribe can list the backing instead of inventing it.
- A skin is delivered as **one JSON file** plus **one research document** (§6).

A skin is **not** a list of opinions. It is a structured map: every topic has poles
(the distinct positions on it), every archetype/sample has ratings on the topics, and
every position has reasons and statistics behind it in the research.

---

## 2. The standardized skin file format (JSON)

Deliver one JSON file named `<prefix>capades.json` (for example `poliscapades.json`,
`chemcapades.json`). The prefix is short, lowercase, and matches the skin's subdomain.

### 2.1 Top-level keys

| Key | What it is | Required |
|---|---|---|
| `name` | The skin's display name, English (e.g. `"Poliscapades"`). | Yes |
| `skin` | The skin id, lowercase (e.g. `"poliscapades"`). Same as the filename minus `.json`. | Yes |
| `domain` | The domain the skin covers, in plain words (e.g. `"politics"`). | Yes |
| `meter` | The meter word (§1). One word. | Yes |
| `about` | One short paragraph: what this skin is for, in plain words. | Yes |
| `categories` | Array of categories (§2.2). | Yes |
| `samples` | Object keyed by sample id (§2.4). Archetypes live here too (kind `"archetype"`). | Yes |
| `scribe` | The Scribe prompt template (§2.5). | Yes |
| `sceneSetter` | The Scene Setter prompt template (same shape as `scribe`, or a short object with `prompt`). | Yes |
| `defaultLayout` | Saved node positions for the map. **Omit it.** The app computes a layout if absent. Existing skins carry a precomputed one; it is not required for a new skin. | No |

Do not add other top-level keys. Keep the file to this schema.

### 2.2 Categories, subcategories, topics

```
categories: [
  {
    "id": "cat-economy",            // short stable id, lowercase, hyphenated
    "name": "The Economy",          // English name — refer to it by name, never by id, in prose
    "subcategories": [
      {
        "id": "sub-economic-order",
        "name": "The economic order",
        "topics": [ ...topic objects (§2.3)... ]
      }
    ]
  }
]
```

- Use English names for categories, subcategories, and topics. In prose, refer to a
  topic by its English name, never by its id.
- A category may have subcategories, or it may hold `topics` directly. Prefer
  subcategories when a category has more than ~8 topics.
- Aim for a skin of roughly **40–110 topics**. Fewer than 30 is thin; more than 130 is
  unwieldy. (Existing skins range widely; stay in the workable band.)

### 2.3 A topic

Every topic is an object. The required fields are `id`, `name`, `question`, `poles`,
`widget`, `risk`. The rest are strongly recommended.

```json
{
  "id": "xpo0001",
  "name": "Economic Structure",
  "question": "How should the economy be organized — by the state, the market, or the commons?",
  "poles": [
    {"key": "the-state-command-redistribution", "label": "The State (Command & Redistribution)"},
    {"key": "the-market-capital-price-discovery", "label": "The Market (Capital & Price Discovery)"},
    {"key": "the-commons-civil-society-mutual-aid", "label": "The Commons (Civil Society & Mutual Aid)"}
  ],
  "hovertip": {
    "issue": "How should the economy be organized — by the state, the market, or the commons?",
    "poles": [
      {"label": "The State", "text": "Centralized public planning, taxation, and regulation."},
      {"label": "The Market", "text": "Private ownership, free enterprise, and price discovery."},
      {"label": "The Commons", "text": "Peer-to-peer resource pools, cooperatives, and mutual aid."}
    ]
  },
  "glyph": "M3 6h18v12H3V6zm0 4h18m-9-4v12",
  "glyphLabel": "economic order matrix",
  "risk": false,
  "widget": "triangle",
  "source": "RESEARCH.md §3.1.1",
  "communities": [
    {"network": "Reddit", "name": "r/PoliticalDiscussion", "url": "https://www.reddit.com/r/PoliticalDiscussion/"}
  ],
  "archetype": null
}
```

Field notes:

- `id`: short stable id, lowercase. Use a skin prefix (e.g. `xpo` for Polis) plus a
  zero-padded number (`xpo0001`). Do not reuse an id inside a skin.
- `name`: the English name. Short, plain, and distinct within the skin.
- `question`: one plain question the topic asks. This is what the rater answers.
- `poles`: the distinct positions on this topic. **2 poles** (a pair) or **3 poles**
  (a triangle) or **4 poles** (a square/switchbox). Each pole has a `key` (short,
  lowercase, hyphenated, stable) and a `label` (English, with a short parenthetical
  gloss). Pole keys are used in ratings (§4), so keep them stable.
- `hovertip`: the short text shown when a user hovers the topic. `issue` restates the
  question; `poles` gives one plain sentence per pole (`label` + `text`). Keep each
  pole text to one sentence.
- `glyph`: an SVG path string (a small icon for the topic). Keep it simple — a few
  strokes, not a detailed drawing. `glyphLabel` names it in plain words.
- `risk`: `true` only if the topic needs a risk/safety note; otherwise `false`.
- `widget`: the control for this topic. Use `"triangle"` for 3 poles, `"slider"` for
  2 poles, `"switchbox"` for 4 poles (two independent axes). Match the widget to the
  pole count.
- `source`: a pointer into your research document (§3), e.g. `RESEARCH.md §3.1.1`.
  Every topic must cite the research section that backs it.
- `communities`: 0–4 links where people discuss this topic (network, name, url).
  Real links only; omit the field if you have none.
- `archetype`: the id of the archetype that best embodies this topic, or `null`.

### 2.4 Samples and archetypes

`samples` is an **object keyed by sample id** (not an array). Archetypes live in the
same object, with `"kind": "archetype"`. There is no separate `archetypes` key.

```json
"samples": {
  "pol-democrat": {
    "name": "Democratic Party platform",
    "kind": "archetype",
    "count": 110,
    "about": "One or two plain sentences: who/what this is, and what it stands for.",
    "links": [{"label": "Democratic National Committee", "url": "https://democrats.org"}],
    "skin": "poliscapades",
    "stack": "Democratic Party platform",
    "stackKey": "pol-democrat",
    "date": "2024",
    "emblem": "images/emblems/pol-democrat.svg",
    "payload": {
      "app": "sexcapades",
      "version": 16,
      "noFlash": true,
      "profileName": "Democratic Party platform",
      "archetype": "Democratic Party platform",
      "aboutMe": "One or two plain sentences (the profile's own voice).",
      "skin": "poliscapades",
      "ratings": { ... (§4) ... }
    }
  }
}
```

Field notes:

- `kind`: `"archetype"` for an archetype (a named ideal type), `"sample"` for a concrete
  example profile. **A skin needs archetypes.** Aim for at least **6–12 archetypes**
  that span the domain's positions, plus samples as useful.
- `count`: the number of topics this profile rates (it must match the size of
  `payload.ratings`).
- `about` / `aboutMe`: plain prose, no jargon. `about` describes the profile;
  `aboutMe` is in its own voice.
- `emblem`: the path to the emblem SVG, `images/emblems/<sample-id>.svg`. **Always make
  an emblem for every new sample and every new archetype.** The emblem is a simple SVG
  (a glyph, not a portrait). Deliver the SVG file alongside the skin JSON.
- `payload.ratings`: the ratings (§4). This is the core data.
- `links`: 0–3 real links (the profile's home, a source, a community). Omit if none.
- `date`: the year the profile's positions are as of (e.g. `"2024"`). Use a year.

### 2.5 Scribe and Scene Setter prompt templates

`scribed` and `sceneSetter` each carry a `prompt` object with `opening`, `rules`, `rigor`.

```json
"scribe": {
  "genre": "discussion",
  "output": "discussion",
  "explicitness": "none",
  "panel": "discussion",
  "prompt": {
    "opening": "Write an informed discussion between the stances recorded on this map.",
    "rules": [
      "Explore the philosophical principles, practical rationale, trade-offs, and implications of each stance in depth, without introducing unlisted topics.",
      "Attribution is essential: always state clearly who holds which position and with what conviction."
    ],
    "rigor": "At maximum depth, length, and rigor, write at dissertation-defense standard: state each position precisely, raise the strongest objections to each, answer them, and defend the conclusion against a skeptical examiner."
  },
  "phases": []
}
```

- `genre` / `output`: `"discussion"` for a stance/belief skin (politics, philosophy,
  faith, science); `"story"` for an activity/embodied skin (the Scribe then writes a
  story, not a discussion). Match the genre to the domain.
- `opening`: one sentence telling the model what to write. Keep it to the skin's mode.
- `rules`: 3–6 rules. They must include: explore principles/rationale/trade-offs in
  depth; do not introduce unlisted topics; attribute every position to its holder with
  conviction; do not flatten or invert a holder's affirmed stance.
- `rigor`: the depth knob (a sentence describing the standard, e.g. dissertation-defense
  at maximum). The app's Depth slider scales it.
- `sceneSetter`: same shape. Its `opening` should say what a scene is for this skin
  (a guided prompt / a setting for the map's topics).

Do not write the Scribe's output yourself. You are writing the *template* the app
composes into a prompt. The Scribe is indaba (§5).

---

## 3. The FULL research (what it must contain)

Deliver one research document per skin, named `<prefix>-research.md`
(e.g. `polis-research.md`), alongside the skin JSON. This is the research the Scribe
draws on. It must be **grounded** — real reasons and real numbers, not invented ones.

A skin's research runs roughly **13–18 KB of text** (about 4,000 tokens). That is small
on purpose: it is the *backing*, not an encyclopedia. If your draft is far larger,
you are writing too much; if it is far smaller, you are writing too little.

The research document must contain, in order:

### 3.1 Domain framing (short — one section)
- What the domain is, in plain words.
- What the skin's meter word means here (what is being measured).
- What counts as a position in this domain, and what does not.
- The skin's stance: what perspective the skin takes (every skin has one; name it).

### 3.2 Topic rationale (one short paragraph per topic, grouped by category)
For **every** topic in the skin, one short paragraph that says:
- Why this topic is on the map (what it captures that nothing else does).
- What the poles mean (one plain sentence per pole).
- The section reference the topic's `source` field points to (so topic and research
  line up exactly).

### 3.3 Reasons and statistics backing each position (the load-bearing part)
For **every** topic, for **each pole** on it, list:
- **Reasons:** 2–4 plain reasons someone holds this position (the argument, in its
  holders' terms — steelmanned, not caricatured).
- **Statistics:** any real numbers that back it (polls, studies, counts, rates).
  Give the number **and** where it came from (source name + year). If you have no
  reliable statistic for a pole, say so plainly (`No reliable statistic found.`) —
  do **not** invent a number. An invented statistic is worse than none.
- **What would move a holder:** one sentence on what evidence or argument could move
  someone holding this position (this is what lets an indaba work).

This is the part the Scribe uses. Without it, the Scribe can only list positions.
With it, the Scribe can list the *backing* — the reasons and the numbers — which is
what lets a group talk toward consensus.

### 3.4 Archetype research (one short section per archetype)
For **every** archetype, one short section that says:
- Who/what it is, and what it stands for.
- Why it holds the positions it does (the reasons, tied to §3.3).
- What it is receptive to (which other positions it can hear, and why) and what it
  is closed to (and why). This is the receptivity story, in words.
- Its emblem (the SVG file name).

### 3.5 Gap analysis (one short section)
- Which positions in the domain have **no** archetype embodying them (the gaps).
- Which topics, if any, are thin (only one pole well-covered) and what would fill them.
- What you deliberately left out, and why.

### 3.6 Sources
- Every statistic's source (name + year + where to find it).
- Every reason's grounding (the text, author, or tradition it comes from).
- Do not cite a source you did not actually draw on.

**Sizing:** §3.3 is the bulk. §3.1 and §3.5 are short. If the document is much over
25 KB, trim §3.2 and §3.4 (they support; §3.3 carries).

---

## 4. THE RATING GUIDE (read this before rating anything)

This is the contract between your ratings and the scoring engine. Get it wrong and
the archetypes will not behave correctly — in the engine, or in the Scribe.

### 4.1 What to rate, and what is derived — the split

**You rate (inputs):**
- **Advocacy, per pole.** For each topic, for each pole, a number for how strongly
  this profile advocates / stands for that pole.
- **Openness, per topic.** For stance/belief topics, a number (0–100) for how open
  this profile is to the topic at all — how willing it is to hear other positions
  on it.

**You do NOT rate (derived — the engine computes these):**
- **Receptivity.** Derived as `round-half-even(openness × advocacy)`, computed with
  **exact fractions** (`fractions.Fraction` or equivalent), **never** float `round()`.
  Float multiplication breaks round-half-even (e.g. 0.35 × 90 = 31.499999999999996 in
  binary, so float `round()` gives 31 where the exact 31.5 rounds to 32). If you must
  include receptivity values in the JSON, compute them with exact fractions. Do not
  hand-compute them, and do not rate receptivity directly — it is not an input.
- **Intensity.** Derived as the **signed largest-|value| pole** — the strongest pole,
  carrying its sign. Do not set intensity directly. It is computed from the poles.

### 4.2 Scale and sign

- Advocacy per pole: a number. **Positive means for / into it; negative means
  against / averse to it.** Negative numbers are the convention, not a bug.
  Aversion lives **only** on the intensity number's sign — do not encode aversion
  anywhere else.
- Openness: 0–100 (a percentage).
- The rating scale is **-100 to +100**. Use the full range honestly: 80–100 is a
  central/strong stance, 56–79 strong support, 36–55 lighter, 0–35 optional
  curiosity. For a pole the profile rejects, use a negative number of matching
  magnitude.
- **Direction is never contracted.** Do not flip, fold, or normalize the sign of a
  rating. A negative stays negative. The engine's scoring depends on the sign.
- **Coherence over sympathy.** Rate what the profile actually holds, even if it is
  unpopular or unsympathetic. Do not soften a position to make it agreeable.

### 4.3 The rating file format

Ratings live in each sample/archetype's `payload.ratings`, keyed by topic id. For a
stance topic with poles, the format is:

```json
"ratings": {
  "xpo0001": {
    "advocacy": {
      "the-state-command-redistribution": 55,
      "the-market-capital-price-discovery": 10,
      "the-commons-civil-society-mutual-aid": 40,
      "intensity": 55
    },
    "receptivity": {
      "the-state-command-redistribution": 22,
      "the-market-capital-price-discovery": 4,
      "the-commons-civil-society-mutual-aid": 16,
      "intensity": 22
    }
  }
}
```

- `advocacy`: one entry per pole key, plus `intensity` (the signed largest-|value|
  pole — here 55, the largest advocacy pole).
- `receptivity`: one entry per pole key, plus `intensity`. These are the **derived**
  values (openness × advocacy, exact fractions, round-half-even). In this example
  openness is 40, so receptivity is 40% of advocacy (55→22, 10→4, 40→16).
- For an activity/sensation topic (no advocacy/receptivity split), the rating is a
  single per-pole set with an `intensity` (the same signed-largest-pole rule). Use
  the advocacy shape above when the skin is a stance skin; use the single-shape
  when the skin is an activity skin. Do not mix the two shapes inside one skin.
- **Every archetype and every sample gets ratings on every topic in the skin.**
  There are no unrated topics for an archetype/sample. If a profile genuinely has
  no stance on a topic, rate it 0 (no stake) — do not leave it out.

### 4.4 Standing rules for rating (do not break these)

- **Archetypes AND samples ALWAYS get ratings on new/merged topics.** When you add a
  topic, rate every archetype and every sample on it. No exceptions.
- **Always make emblems for any new samples/archetypes** (§2.4). A profile without an
  emblem is incomplete.
- **Meter words need NOT be unique per skin.** Do not invent a new meter word just to
  be different; use the word that fits the domain.
- **Pole topics count in the pair aggregate and are visible to match lists in every
  mode.** Rate pole topics with the same care as any other topic; they are not
  second-class.
- **Surgical updates preserve every existing pole value exactly.** When you change
  one thing, do not re-derive or re-round the rest. (For a fresh skin this means:
  once you have written a rating, do not casually change it — change it only with
  a reason, and record the reason.)
- **Count = len(ratings).** The number of ratings a profile has is the count of
  topics it rates. Keep `count` (§2.4) equal to it.

---

## 5. Scribe-usability (how the research feeds the Scribe)

The Scribe is **indaba** — a meeting to talk and reach consensus — not a debate and
not a dialectic. Do not use those words for it. The Scribe's job is to bring N
profiles together, show each position, name where they meet and where they part, and
pose the open question (what would it take for this group to reach consensus?).

For the Scribe to do that, your skin must give it:

1. **Positions** — the ratings (§4). Without ratings, there is nothing to discuss.
2. **Reasons and statistics backing each position** — §3.3. Without these, the Scribe
   can only list positions. With these, it can list the backing, which is what makes
   the indaba real. **This is the load-bearing requirement.**
3. **Receptivity, in words** — §3.4 (what each archetype is open to, and why). The
   Scribe orders topics by receptivity; your research must say, in words, what each
   archetype can hear and what it cannot.
4. **A Scribe prompt template** — §2.5. Its rules must tell the model to: explore
   principles/rationale/trade-offs in depth; attribute every position to its holder
   with conviction; list the reasons and statistics backing each position (do not
   just list the positions); name the meeting points and the gaps; and close with
   the open question. **Do not** tell it to crown a winner, to hold a debate, or to
   use dialectic. The goal is consensus, not victory.

The Scribe has four operations (Cross/Communion, Straight/Common ground,
Minus/Dialectic-Polylectic, Full arc). You do not implement these. You provide the
research so all four can use it. All four take the same input (topic label +
conviction % + the profile's short receipt), so all four need the reasons/statistics
to come from your research document — they cannot invent them.

---

## 6. Deliverables (what to produce, and where)

Deliver into the skins repo (capades-skins). Do **not** deliver into the main app repo
unless asked.

| File | Location | What it is |
|---|---|---|
| `<prefix>capades.json` | repo root | The skin file (§2). |
| `<prefix>-research.md` | repo root | The full research (§3). |
| `images/emblems/<sample-id>.svg` | (alongside, per §2.4) | One emblem SVG per sample/archetype. Simple glyph, not a portrait. |

Naming: `<prefix>` is lowercase, matches the skin id and the subdomain
(e.g. `polis`, `chem`, `dance`). Keep filenames exactly as shown — no dates, no
version suffixes in the filename.

**Do not** deliver the skin into the app repo, and do **not** edit the app's files.
Your job is the skin + the research. Integration (loading it into the app) is a
separate step, done by the project owner.

---

## 7. Validation checklist (check every box before you deliver)

- [ ] I did **not** open, read, or copy from any existing skin file or research doc.
  (Clean-room, §0.)
- [ ] The skin JSON parses as valid JSON, and has only the top-level keys in §2.1.
- [ ] Every topic has `id`, `name`, `question`, `poles`, `widget`, `risk`, and a
  `source` pointing at §3.
- [ ] Every topic has 2, 3, or 4 poles, and the `widget` matches the pole count.
- [ ] Every archetype and every sample has ratings on **every** topic (§4.4).
- [ ] No rating sets `receptivity` or `intensity` by hand — both are derived (§4.1),
  and any receptivity values present were computed with exact fractions, never float.
- [ ] No negative sign was flipped, folded, or normalized (§4.2).
- [ ] Every sample/archetype has an emblem SVG (§2.4).
- [ ] The research document covers **every** topic (§3.2) and gives reasons +
  statistics (or an explicit "No reliable statistic found.") for **every** pole (§3.3).
- [ ] No statistic is invented. Every number has a source (§3.6).
- [ ] The research is ~13–25 KB. If it is far larger, trim; if far smaller, fill the gaps.
- [ ] The Scribe prompt template (§2.5) asks for reasons/statistics, attribution,
  meeting points, gaps, and the open question — and does **not** ask for a debate,
  a dialectic, or a winner.
- [ ] Filenames are exactly `<prefix>capades.json` and `<prefix>-research.md`.

If a box is unchecked, fix it before delivering. Do not deliver a skin with an
unchecked box and a note saying you will fix it later.

---
*End of Guide 1.*
