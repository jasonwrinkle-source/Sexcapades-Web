# Research Check/Create Guide — based on a given structure

> **For:** an AI given a research structure (a template) and asked to either **check**
> existing research against it, or **create** research that follows it.
> **Lives in:** both the main repo (Sexcapades-Web) and the skins repo (capades-skins).
> **Companion:** `FRESH-AI-WHOLE-CLOTH-SKIN-GUIDE.md` (the whole-cloth skin guide).
> The structure below is the same one that guide's §3 defines. Do not invent a
> different structure.

---

## 0. The two tasks (do not confuse them)

This guide covers **two** distinct tasks. Say which one you are doing before you start.

- **CHECK:** you are given existing research and a structure. You verify whether the
  research follows the structure, and you report what is missing, wrong, or
  non-conforming. You do **not** rewrite the research (unless asked to). You produce
  a check report.
- **CREATE:** you are given a structure and a skin (its topics, archetypes, and
  samples). You write research that follows the structure, for that skin. You produce
  a research document.

A CHECK that finds gaps does not automatically become a CREATE. If you are asked to
check, check. If you are asked to create, create. If you are asked to do both, check
first, then create to fill the gaps the check found — and say so.

---

## 1. The given structure (the standardized research format)

The research document for a skin is named `<prefix>-research.md` and has these
sections, **in this order**. This is the structure. Do not reorder, rename, or omit
a section. If a section has nothing to say, write that explicitly (e.g. "No gaps
found.") — do not delete the section.

### 1.1 §1 Domain framing (short)
- What the domain is, in plain words.
- What the skin's meter word means here.
- What counts as a position in this domain, and what does not.
- The skin's stance (the perspective the skin takes — name it).

### 1.2 §2 Topic rationale (one short paragraph per topic, grouped by category)
- For **every** topic: why it is on the map, and what its poles mean (one plain
  sentence per pole).
- Grouped by the skin's categories, in the skin's category order.

### 1.3 §3 Reasons and statistics backing each position (the load-bearing section)
- For **every** topic, for **each pole**: 2–4 plain reasons (steelmanned, in the
  holders' terms), plus any real statistics (number + source name + year), plus
  one sentence on what would move a holder.
- If no reliable statistic exists for a pole, write `No reliable statistic found.`
  Do **not** invent a number.

### 1.4 §4 Archetype research (one short section per archetype)
- Who/what the archetype is and what it stands for.
- Why it holds its positions (tied to §3).
- What it is receptive to (and why) and what it is closed to (and why).
- Its emblem file name.

### 1.5 §5 Gap analysis (short)
- Positions with no archetype embodying them.
- Topics that are thin, and what would fill them.
- What was deliberately left out, and why.

### 1.6 §6 Sources
- Every statistic's source (name + year + where to find it).
- Every reason's grounding (text, author, or tradition).
- Do not cite a source you did not actually draw on.

**Sizing:** a skin's research runs roughly **13–18 KB** (about 4,000 tokens); up to
~25 KB is acceptable. §3 is the bulk. §1 and §5 are short.

**Clean-room note for CREATE:** you **must** read the skin you are researching
(its topics, poles, archetypes, and ratings) — you cannot write research for a skin
you have not read. But do **not** copy from other skins' research documents. Each
skin's research is its own. Do not import another skin's framings, reasons, or
wordings. (For whole-cloth skin creation — making a new skin from scratch — the
stricter rule applies: do not look at any prior skin at all. See the whole-cloth
guide §0. This guide is for research on a *given* skin, so reading that skin is
required, not forbidden.)

---

## 2. How to CHECK research (against the given structure)

Work through the list in order. For each item, record **pass**, **fail**, or
**partial**, with the evidence (a quote or a line reference). Do not give a bare
verdict without evidence.

### 2.1 Structure check
- [ ] The document has all six sections (§1–§6), in order, with those headings.
- [ ] No section is missing, renamed, or merged into another.
- [ ] The filename is exactly `<prefix>-research.md`.

### 2.2 Coverage check
- [ ] §2 covers **every** topic in the skin (compare against the skin JSON's topic
  list — count them; the counts must match).
- [ ] §3 covers **every** topic and **every** pole on each topic (no pole skipped).
- [ ] §4 covers **every** archetype in the skin (compare against the skin JSON's
  `samples` with kind `"archetype"` — counts must match).
- [ ] §5 exists and names gaps (or explicitly says "No gaps found.").

### 2.3 Reasons and statistics check (§3 — the load-bearing section)
- [ ] Every pole has 2–4 reasons, written in the holders' terms (steelmanned, not
  caricatured). Flag any reason that is a straw man or a dismissal.
- [ ] Every statistic has a number **and** a source (name + year). Flag any number
  with no source, or a source with no number.
- [ ] No statistic is invented. Spot-check at least three statistics against their
  cited source (or note that you could not verify them, and why). An invented
  statistic is a **fail** of the whole document, not a minor note.
- [ ] Every pole has a "what would move a holder" sentence. Flag any pole missing it.
- [ ] Poles with no reliable statistic say so explicitly (`No reliable statistic
  found.`) rather than leaving the statistic blank or inventing one.

### 2.4 Archetype check (§4)
- [ ] Each archetype's "why it holds its positions" ties back to §3 (it cites the
  reasons, not just restates the positions).
- [ ] Each archetype names what it is receptive to **and** what it is closed to,
  with a why for each. Flag any archetype that only lists positions.
- [ ] Each archetype's emblem file name is given and matches an actual emblem file.

### 2.5 Sources check (§6)
- [ ] Every statistic cited in §3 appears in §6 (no orphan statistics).
- [ ] Every source in §6 is actually drawn on in the document (no padding).
- [ ] No source is cited that the author did not use.

### 2.6 Sizing check
- [ ] The document is roughly 13–25 KB. If it is far larger, flag bloat (usually
  §2 or §4 overwritten). If far smaller, flag thinness (usually §3 under-filled).

### 2.7 The check report (what to deliver)
Deliver a short report (not a rewrite) with:
1. **Verdict:** pass / fail / partial (one word, plus one sentence).
2. **Per-section findings:** for each of §1–§6, pass/fail/partial with evidence.
3. **Missing coverage:** the topics/poles/archetypes not covered, by name.
4. **Invented or unsourced numbers:** list each one, with the line.
5. **What to fix, in order:** the fixes, most load-bearing first (§3 gaps before
   §1 wording).

Do not rewrite the research in the check report. Report; do not repair (unless
explicitly asked to do both).

---

## 3. How to CREATE research (following the given structure)

You are given a skin (its JSON: topics, poles, archetypes, samples, ratings) and
the structure in §1. Write the research document for that skin.

### 3.1 Before you write
- Read the skin JSON fully: every topic, every pole, every archetype, every sample,
  and the ratings. You cannot write research for a skin you have not read.
- Read the skin's meter word and domain framing (from the skin JSON's `about` and
  `meter`). The research must match the skin's own stance, not import another's.
- Do **not** open other skins' research documents. (See the clean-room note in §1.)

### 3.2 Write in order (§1 → §6)
- **§1 first.** Settle the domain framing and the skin's stance before you write
  any topic rationale. If you cannot state the stance in one sentence, stop — you
  do not understand the skin well enough yet.
- **§2 next.** One short paragraph per topic, in the skin's category order. Keep each
  paragraph to 3–5 sentences. Do not write §2 as a list of definitions; say why the
  topic is on the map.
- **§3 next (the bulk).** For each topic, for each pole: the reasons (2–4, in the
  holders' terms), the statistics (real numbers with sources, or an explicit "No
  reliable statistic found."), and what would move a holder. Work topic by topic,
  pole by pole. Do not skip a pole because it is unpopular.
- **§4 next.** One short section per archetype. Tie every "why it holds this
  position" back to §3. Name receptivity and closedness, with whys.
- **§5 next.** Name the gaps honestly. If a position has no archetype, say so. If
  you left something out deliberately, say what and why.
- **§6 last.** List every source you actually used. Do not pad the list.

### 3.3 Rules for creating (do not break these)
- **Do not invent a statistic.** If you do not have a real number from a real
  source, write `No reliable statistic found.` An invented number is worse than none.
- **Steelmanned, not caricatured.** Every position's reasons must be written as its
  holders would write them. If you cannot state a position's case fairly, you do
  not understand it — go read more before you write it.
- **Attribute.** Every reason belongs to a holder. Do not write unattributed
  "some people think" — name whose position it is (the pole, the archetype).
- **Scribe-usable.** The Scribe lists reasons and statistics per position. So write
  §3 so it can be lifted directly: reasons as a short list, statistics as
  number + source. Do not bury the reasons in flowing prose the Scribe cannot lift.
- **Sizing.** Aim for 13–18 KB. If you are over 25 KB, you are overwriting §2 or §4.
  Trim there, not in §3.
- **Sources.** Every number has a source (name + year). Every source was actually used.

### 3.4 What to deliver
- One file: `<prefix>-research.md`, in the skins repo root.
- Nothing else. Do not deliver a rewritten skin JSON, and do not edit the app's files.
  (If the check found the skin JSON itself is wrong — a missing topic, a wrong pole —
  report that in the check report; do not silently fix the skin while writing research.)

---

## 4. File format and location (standardized)

| File | Location | What it is |
|---|---|---|
| `<prefix>-research.md` | skins repo root | The research document (§1 structure). |
| `<prefix>capades.json` | skins repo root | The skin file (see the whole-cloth guide §2). |
| Check report | (delivered in chat / as a file alongside, named `<prefix>-research-check.md`) | The check report (§2.7). Only when asked to check. |

Naming: `<prefix>` is lowercase and matches the skin id (e.g. `polis`, `chem`).
Keep filenames exactly as shown — no dates, no version suffixes.

---

## 5. Validation checklist (for CREATE; for CHECK, use §2)

- [ ] The document has all six sections, in order (§1).
- [ ] §2 covers every topic; §3 covers every topic and every pole; §4 covers every
  archetype.
- [ ] Every pole has 2–4 steelmanned reasons and a "what would move a holder" sentence.
- [ ] Every statistic has a number and a source; no statistic is invented; poles with
  no statistic say so explicitly.
- [ ] §4 ties each archetype's "why" back to §3 and names receptivity and closedness.
- [ ] §6 lists every source actually used, and no source that was not used.
- [ ] The document is ~13–25 KB.
- [ ] I did not copy from another skin's research document.

If a box is unchecked, fix it before delivering.

---
*End of Guide 2.*
