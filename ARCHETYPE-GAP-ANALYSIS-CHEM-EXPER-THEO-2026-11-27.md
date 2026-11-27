# Archetype Gap Analysis — Re-Run on the Three Landed Seven-Skins Builds (Chem, Exper, Theo)

**Date:** 2026-11-27
**Coordinator:** gap re-run coordinator (read-only). Analysts: one per skin (Chem, Exper, Theo), run in parallel ~07:12–07:18 CST.
**Built skins read:** `app/data/skins/chemcapades.json` (74 topics, 12 samples), `app/data/skins/expericapades.json` (72 topics, 11 samples), `app/data/skins/theoricapades.json` (70 topics, 17 samples) — as built by items 29/30/31 (commits 8269302 / 416445c / 760c324), local tree synced to origin.
**Compared against:** first analysis `ARCHETYPE-GAP-ANALYSIS-2026-11-26.md` (110 gaps across 21 skins) and the seven-skins spec `SEVEN-SKINS-ADDS-2026-11-27.md`. Gemini's research `seven-skins-research.md` used as citation source only.
**Method:** same as the first analysis. Archetype/sample positions read from their ACTUAL ratings in the built JSONs (full per-topic data), never one-line stance summaries. Per topic, per pole, spread = max − min advocacy across samples; spread ≥ 100 is a fault line. A fault line is covered when a topic asks it, a gap when two or more archetypes genuinely disagree on a question no topic asks. New topics never asked = new-topic gaps; poles an archetype needs but a topic lacks = missing-pole gaps. Topics by English name, never by ID. Receptivity = round-half-even(openness × advocacy) with EXACT `fractions.Fraction` arithmetic, never float round(). Intensity = signed largest-|value| pole; negative intensities are the convention, not a bug.
**No JSON was written, pushed, or committed by this analysis. No ratings proposed. Read-only throughout.**

## The question (Jason's framing, 2026-11-27)

This re-run is a DIFFERENT nature from "did the old gaps close." Its primary question is: **did the Gemini research topics and archetypes OPEN new gaps?** — fault lines where the (now enriched) archetypes split that NO topic covers, and missing poles on the new topics. Secondarily, confirm whether the original gaps for these three skins are now covered.

## Headline counts

| | Chem | Exper | Theo | Total |
|---|---|---|---|---|
| Topics / samples as built | 74 / 12 | 72 / 11 | 70 / 17 | 216 / 40 |
| New topics / poles / archetypes from the research | 33 / 7 / 7 | 40 / 2 / 7 | 36 / 2 / 11 | 109 / 11 / 25 |
| Fault lines found (spread ≥ 100) | 29 | 28 | 63 | 120 |
| Fault lines covered | 29 | 28 | 59 | 116 |
| **NEW gaps opened by the research** | **2** | **4** | **4** | **10** |
| — of which new-topic gaps | 1 | 1 | 4 | 6 |
| — of which missing-pole gaps | 1 (3 poles) | 3 | 0 | 4 |
| **Original 2026-11-26 gaps now covered** | **3 of 3** | **1 of 1** | **3 of 3** | **7 of 7** |
| Missing poles on the NEW topics | 0 | 1 (G4) | 0 | 1 |
| New misstatements flagged (not gaps) | 2 | 1 firm + 1 soft | 2 | 5 firm + 1 soft |

**Counting note.** Chem and Exper count fault lines per (topic, pole) row; Theo counts per topic-question (one topic = one fault line when its max pole spread ≥ 100) and reports the per-pole figure alongside (132 of 199 pole-cells ≥ 100). Gap counts are consistent across all three (one gap = one unasked question or one missing pole-set), so the headline gap total (10) is comparable. Fault-line totals are not directly comparable across the two counting rules, and neither is comparable to the first analysis's looser counts — the first report's Chem "35" and Exper "26" are not reproducible under the strict spread-≥100 rule (Chem ~13, Exper 20 on the original samples). The honest comparison is on gaps: **7 original gaps → 0 remaining, + 10 new gaps**.

**Answer to Jason's question in one line:** yes, the research opened new gaps — **10** across the three skins — but the build covered the research remarkably completely (109/109 new topics, 11/11 missing poles landed). Six of the ten are fresh findings; four are downstream of conflict rulings Jason already made (the skin's version stands — recorded, re-open only on his word). The bigger story is not missing topics but **missing ratings** (see Cross-cutting §5).

---

## 1 — CHEMCAPADES (74 topics, 12 samples)

### (a) Original gaps: 3 of 3 covered

- **C1 — Dual-Use Responsibility, missing "Keep open" pole — COVERED.** The topic is now a trilinear line: Restrict publication / Guardrail AI generators / Keep open (transparency as safety). Keep-open is championed by Green Reformer 85, Industrial Process Pragmatist 85, Total Synthesis Architect 75, Physical-Organic Mechanist 75, Medicinal Chemist 75. Note: the build added a middle pole the spec did not list — Guardrail AI generators (Green 70, Process 70) — a genuine third position, not a gap.
- **C2 — Five Branches, missing Green + Supramolecular poles — COVERED.** The Branches of Chemistry is now a 7-pole star-radar including Green Chemistry and Supramolecular Chemistry. Green Reformer rates Green Chemistry 90 (its top branch); Supramolecular & Systems Chemist rates Supramolecular Chemistry 85 (its top branch).
- **C3 — Critical elements / scarcity — COVERED.** The topic Critical elements exists as a trilinear line with exactly the three proposed poles (Design / Supply / Geopolitical). Spreads are modest (60/50/35) — the question is asked, every archetype holds a position.
- **Misstatement M1 — FIXED.** Green Reformer now rates Biochemistry / Chemical Biology 60 (was 80), behind Green Chemistry 90; the Chemical Biologist holds the Biochemistry centre at 90.

### (b) New gaps opened by the research: 2

#### G1 — Chemistry's identity has no mission poles (MISSING POLES, biggest new gap)

**Fault line in plain words:** what *mission* defines chemistry — creating new matter, explaining how matter behaves, measuring what matter is, or scaling transformations to industrial size? The four mission answers split the enriched archetypes, but the identity topic only asks what *role* chemistry plays among the sciences, so three of the four missions have no pole to stand on.

**The archetypes on each side.** Creating New Matter is covered (Creative / Inventive Science: Architect 90, Green 70, Process 70). Explaining Structure & Reactivity has no pole — Mechanist's top identity pole is The Central Science 75, Reductionist's Central 70 / Dissolving Boundaries 70, Ultrafast's Central 70 / Dissolving Boundaries 70. Measuring Composition has no pole — Ultrafast's top identity poles are Central 70 / Dissolving Boundaries 70; the Purist's top is A Service / Enabling Discipline 80 (its measuring mission shows only elsewhere: Analytical Chemistry branch 95, Structure proof 90). Scaling Industrial Transformation has no pole — Process's top identity pole is A Service / Enabling Discipline 80, with Creative / Inventive 70 (its scaling mission shows only on Good chemistry 90 / Chemistry's purpose Applied 85).

**Primary citation:** Gemini, `seven-skins-research.md`, CH-05 "The Core Identity of Chemistry" (quad-compass: Creating New Matter | Explaining Structure & Reactivity | Measuring Composition | Scaling Industrial Transformation). Spec: `SEVEN-SKINS-ADDS-2026-11-27.md`, Conflict 3.
**Suggested geometry:** keep the quad-compass with Gemini's four mission poles — either as a re-pole of Chemistry's identity or as a second, companion topic.
**Status — ruled conflict, re-open only on Jason's word.** This is Conflict 3, the one conflict the build left unresolved: Jason ruled the skin's role framing (role among the sciences) over Gemini's mission framing. The mission poles are missing *by ruling*, not by oversight. The fault line is genuine (the archetypes split on mission), but adding the poles revisits his ruling.

#### G2 — Human Craftsmanship vs. Automated & ML-Driven Labs as ONE two-axis question (NEW TOPIC, secondary)

**Fault line in plain words:** should chemistry be done by human hands guided by mechanistic understanding, or by robots guided by machine learning — and what about the two mixed combinations (a human steering ML, a robot running mechanistic hypotheses)? Each axis splits the archetypes, but the *combination* is never asked.

**The archetypes on each side.** Human↔robot: Lab method / Hands-On spread 115 — Architect / Mechanist / Medicinal 85, ML Chemist −30; Automated: ML 90, Architect / Mechanist / Medicinal 20. Mechanistic↔ML: Discovery method / Black-Box High-Throughput Empiricism spread 115 — ML 85, Architect −30, Mechanist −25. The quadrants are not asked: a robot running *mechanistic* hypotheses, and a human steering *ML/Bayesian* search, have no topic. The tell is Catalyst Discovery Mode's middle pole Mechanism-Guided Screening — rated 15 max, 0 for nine archetypes: a pole with no champion because the joint question is never asked properly.

**Primary citation:** Gemini, CH-25 "Human Craftsmanship vs. Automated & ML-Driven Labs" (xy-switchbox: human↔robot × mechanistic↔ML). Spec: COVERED note — "distributed: covered across Lab method + Experimentation + Discovery method; her two-axis switchbox structure is reproduced nowhere as a single topic."
**Suggested geometry:** xy-switchbox exactly as Gemini drew CH-25 (X: Human Bench Craft ↔ Robotic Automation; Y: Mechanistic Hypothesis ↔ ML/Bayesian Optimization).
**Status — fresh finding.** Secondary priority (both axes are covered separately), but the only place the self-driving-lab question can be asked as one question.

### (c) Missing poles on the new topics: 0

Every stance in the seven new archetypes' research profiles maps to a pole on a built topic. The reverse problem holds instead: **25 poles on new topics have no champion** (max ≤ 20), five with max exactly 0 — a ratings problem (§5), not a taxonomy problem.

### (d) Headline counts (Chem)

29 fault lines (pole-spread ≥ 100) on 21 of 74 topics, 29/29 covered; only 7 of 29 genuinely two-sided (the rest are single-champion vs. a lone opponent or the 0-floor — the thin-rating artifact). Enrichment opened 4 new ≥100 fault lines on old topics (Discovery method / Black-Box HTE 90→115; Total synthesis / Mount Everest 80→110; Chemistry's purpose / Pure 70→100; Lab method / Hands-On 55→115) — all covered. New gaps: 2 (1 new-topic + 1 missing-pole). Original gaps: 3/3 covered. M1 fixed. Receptivity verified: **0 mismatches / 3,624** with exact Fraction round-half-even. Only 6 negative stored intensities, all correct per convention.

### (e) Misstatements flagged (Chem, not gaps)

- **Architect 0 on Discrete Molecular Precision** (Molecular Complexes vs. Extended Solid-State Networks). The pole's values: Supramolecular −60, Reticular −60, everyone else 0 — including the Retrosynthetic Total Synthesis Architect, who rates Covalent Architecture 90 and Mount Everest 90. The discrete-molecule side has no champion at all. Probable rating omission.
- **Reticular −60 on Closed-Loop Chemical Depolymerization** (Solving the Plastics Crisis). Values: Green 85, Process 15, Reticular −60, everyone else 0. Nothing in the research anchors the Reticular Builder against depolymerization. Probable rating error (or needs a cited reason).

### (f) Rating completeness (Chem — the dominant finding)

New topics were rated for 1–3 archetypes each and left at 0 for the rest: **857 of 1,092 new-topic advocacy values are exactly 0 (78.5%)** vs. 35 of 1,728 (2.0%) on old topics. The ML Chemist has the fewest new-topic ratings (12/94) — the archetype whose identity is most tied to the new topics. 9 of 23 new trilinear middles sit token at 15. Mechanisms was re-poled to Gemini's poles but re-rated for only 4 archetypes (24 zeros). Green Chemistry Priority Profile is rated by Green alone. A full rating pass would move most new-topic spreads. Full per-pole tables in the analyst file `gap-rerun-chem-2026-11-27.md`.

---

## 2 — EXPERICAPADES (72 topics, 11 samples)

### (a) Original gap: 1 of 1 covered

- **E1 — Big Science funding — COVERED.** The topic Big Science funding exists (trilinear-line, Mission & Discovery Strategy) with exactly the proposed poles: Fund generously / Fund sparingly / Fund differently (shared, international). Real three-way split: Fund sparingly spread 125 (Tabletop, Metrologist, Detector, AMO, Scanning at 85; Collider, Purist, Accelerator at −40); Fund generously spread 115 (Collider 95, Cosmic 65; Tabletop, Metrologist at −20). **Timing nuance:** E1 was NOT closed by the seven-skins build — it landed between the 2026-11-26 gap report (31-topic skin) and the spec (which already read a 32-topic skin containing it). Item 30's contribution was rating the 7 new archetypes on it.

### (b) New gaps opened by the research: 4

#### G1 — Precision vs. intensity: the merged pole hides two different camps (MISSING POLE, The Three Frontiers) — CARRIED CONFLICT #1

**Fault line in plain words:** where does discovery-per-dollar lie — in measuring tiny shifts to 18 digits on a bench, or in flooding detectors with intense beams? The precision camp and the intensity camp are different people with different machines, but the skin makes them share one pole, so a high rating on that pole can mean either thing.

**The archetypes on each side.** Gemini's triangle (EX-06) splits them into Highest-Energy Colliders | Ultra-Precision Tabletop & Clocks | High-Intensity Rare-Process Beams; the built triangle merges the last two into The Intensity & Precision Frontier. Precision camp: Quantum Metrologist, Tabletop Virtuoso, AMO Artist (all anchor Ultra-Precision high). Intensity camp: Deep-Underground Hunter, Accelerator Architect (both anchor High-Intensity high). On the merged pole: Tabletop 95, Metrologist 90, AMO 60 *and* Accelerator 55, Underground 45 all rate middling-high, for opposite reasons (pole spread only 75 — the split is invisible to the spread rule precisely because both camps pile onto the same pole).

**Primary citation:** spec conflict #1; research EX-06 (Weinberg 1993; DeMille, Doyle & Sushkov 2017, *Science*).
**Suggested geometry:** 4-pole quad-compass or diamond: Energy | Precision | Intensity | Cosmic.
**Status — carried conflict, re-open only on Jason's word.** Jason ruled the skin's version stands (Three Frontiers not rebuilt).

#### G2 — "Report 2σ–3σ tensions early" has no pole (MISSING POLE, Discovery standard) — CARRIED CONFLICT #4, BIGGEST NEW GAP

**Fault line in plain words:** when an experiment sees a 2–3σ bump, should it publish the tension now so independent teams can check it, or sit on it until it clears the ironclad 5σ bar? One archetype's whole stance is "report it early"; the topic gives it no pole to say that.

**The archetypes on each side.** For early reporting — the Discovery-Driven Anomaly Hunter, by a coherent rated pattern: Strict 5-Sigma Dogma −30 (the only negative of the 11), Hybrid standard −15 (again the only negative), Bayesian Evidential Weight 85 (highest), Null as Frustrating Stagnation 70 (the only positive), Anomaly status Systematics −20 against Signal 85, Anomaly reaction Treat as New-Physics Lead 90. For the ironclad bar — the Blind-Analysis Statistical Purist (Strict 5σ 90, Hybrid 55) and the Big Science Collider Physicist (Strict 5σ 85). The middle (context-scaled / hybrid) is covered (Hybrid standard spread 105).

**Primary citation:** spec conflict #4; research EX-17 Discovery Threshold Discipline (Lyons 2013; Cousins 2017). This is the "reporting-threshold topic" the item-30 DONE record notes was NOT added.
**Suggested geometry:** keep the trilinear-line but swap the Bayesian Evidential Weight pole for Report 2σ–3σ Tensions Early (the Bayesian position already exists as a pole on Statistical Inference Paradigm); or expand to a 4-pole diamond.
**Status — carried conflict, re-open only on Jason's word.** Jason ruled the skin's version stands (Discovery standard not rebuilt). Biggest gap because it is the only one where a coherent, rated archetype stance has no pole at all to express itself.

#### G3 — Where ML sits in the pipeline: cut-based vs. BDT vs. end-to-end deep learning (NEW TOPIC, reframing of Machine learning) — CARRIED CONFLICT #5

**Fault line in plain words:** should machine learning stay as transparent cuts on physical quantities, live as interpretable classifiers on calibrated features, or run end-to-end on raw detector hits? The skin asks only how much you *trust* ML — it never asks *where* ML sits — so the two camps who disagree about placement have no way to disagree.

**The archetypes on each side.** The research anchors both sides of EX-21: the Big Science Collider Strategist anchors high on Interpretable Validated BDTs/ML *and* End-to-End Deep Learning on Raw Hits, while the Blind-Analysis Statistical Purist anchors high on Physics-Explicit Cut-Based. In the built skin, the Machine learning topic (Trust / Selective verification / Verify) shows no split at all (spreads 55–60) — the Collider Physicist and the Purist rate it near-identically, though the research puts them on opposite sides of the placement question.

**Primary citation:** spec conflict #5; research EX-21 (Guest, Cranmer & Whiteson 2018; Karagiorgi et al. 2022).
**Suggested geometry:** new topic, trilinear-line, her EX-21 poles verbatim, in Data, Noise & Standards of Discovery — a separate topic, not a rebuild of Machine learning (which asks trust, a different question).
**Status — carried conflict, re-open only on Jason's word.** Jason ruled the skin's version stands (Machine learning not rebuilt).

#### G4 — "No new flagship" has no pole (MISSING POLE, Next Flagship Collider: Precision Lepton vs. Discovery Hadron vs. Muon) — SECONDARY, FRESH FINDING

**Fault line in plain words:** the triangle asks *which* flagship collider comes after the High-Luminosity LHC — but five archetypes' answer is *none of them*. As built, "oppose all flagships" and "no opinion" are indistinguishable: both read as 0/0/0.

**The archetypes on each side.** The triangle's three poles are rated by exactly one archetype: the Accelerator & Beam-Physics Architect (75/85/70 — it likes all three). The other 10 of 11 rate 0/0/0. Meanwhile the "no flagship" side is real and rated *elsewhere*: on Big Science funding, Tabletop 85, Metrologist 85, Detector 85, AMO 85, Scanning 85 rate Fund sparingly. Their position is expressed on those topics, so the *whether* half is covered — which is why this gap is secondary: what is missing is only the ability to refuse the triangle's premise on the triangle itself.

**Primary citation:** spec §(a) item 35 (Next Flagship Collider; European Strategy 2020; P5 2023) + Big Science funding ratings. No research citation for the "none" pole itself — inferred from the built ratings, flagged as such.
**Suggested geometry:** add a fourth pole, No New Flagship — Invest in Small Science, and take the triangle to a diamond / quad-compass.
**Status — fresh finding.** The only one of Exper's four gaps that is not a carried conflict.

### (c) Missing poles on the new topics: 1 (G4)

Checked all 40 new topics pole-by-pole against the 11 samples' ratings: exactly one missing pole on a new topic — G4. The other 39 new topics' pole sets cover every position their archetypes take. The two spec missing poles were both fixed and verified: Error is now a three-pole line with Matched Stat-Syst Balance in the middle; Laboratory Extremes is now a six-pole hexad-radar including Seismic & Vibration Isolation.

### (d) Headline counts (Exper)

28 fault lines (pole-rows, spread ≥ 100) across 15 topics, 28/28 covered. New fault lines created by the 7 research archetypes: +8 pole-rows across 4 topics (Image Tradition, Local In-House Labs, Commissioning, Blind Analysis, Error) — all covered. New gaps: 4 (3 missing-pole + 1 new-topic); of these, 3 are carried conflicts (G1, G2, G3) and 1 is secondary (G4). Original gap E1 covered. Receptivity: **11 mismatches / 2,274** — all in the two original samples (exp-tabletop, exp-cosmic), all on old topics, all exact-.5 cases where the stored value is the float-rounding artifact (85 × 0.7 stored 59 vs. exact 60). The 7 new archetypes have zero mismatches. Advocacy intensity verified 747/747; exactly 1 negative intensity (the convention).

### (e) Misstatements flagged (Exper, not gaps)

- **M1 (firm, minor, arithmetic):** 11 stored receptivity cells off by 1 from exact Fraction round-half-even, all pre-existing in the two original samples (same failure mode the 2026-11-26 receptivity lesson records for dharma-confucian). Fix is mechanical (recompute those cells with Fraction arithmetic); advocacy untouched.
- **M2 (soft flag):** the Anomaly Hunter is Bayesian on one topic (Bayesian Evidential Weight 85 on Discovery standard, highest of the 11) but 0 on the next (Bayesian Posteriors & Priors 0 on Statistical Inference Paradigm — the Bayesian pole there has no champion at all, max 15).

### (f) Rating completeness (Exper)

**7 of the 40 new topics are dead** (all 11 archetypes rate 0 on every pole) — 6 unanchored in the research itself, 1 a build drop (Experimental Troubleshooting Ethos: the research anchors the Detector Builder HIGH on EX-23, but the built JSON has it at 0/0 — the only dead topic where a research-assigned position was dropped). New-topic ratings are template-thin (1,114 of ~2,300 pole-ratings exactly 0). Theorist relationship / Workplace / Shift Work now rated by the 7 new archetypes but still blank for the 4 originals — and the new ratings show consensus, no splits. Anomaly reaction silent for 6/7 new archetypes; Electric Fields pole silent for all 7 new. Full detail in the analyst file `gap-rerun-exper-2026-11-27.md`.

---

## 3 — THEORICAPADES (70 topics, 17 samples)

### (a) Original gaps: 3 of 3 covered

- **T1 — Can mathematics be revised? — COVERED** by "Can mathematics be revised?" (Foundations & Ontology, trilinear-line). Revisable spread 182 (Formalism +92 / Hardy–Gödel −90); Not revisable 150 (Hardy–Gödel +95 / Constructivist-HoTT −55); revisable-in-form middle held by Structuralism +88, Grothendieck +85, Langlands +80. All 17 samples rate it.
- **T2 — How do we know mathematical truths? — COVERED** by "How do we know mathematical truths?" (Foundations & Ontology, diamond). Intuition spread 135 (Arnoldian +95 / Formalism −40); Construction 125 (Constructivist-HoTT +95 / Hardy–Gödel −30); Pattern recognition 85; Proof 60 (Lean-Verifier +95 — every sample rates Proof ≥ +35: proof is the consensus route; the split is over whether intuition, pattern, or construction *also* count).
- **T3 — One true mathematics or many? — COVERED** by "One true mathematics or many?" (Foundations & Ontology, trilinear-line). Many mathematics spread 180 (Formalism +90 / Hardy–Gödel −90); One true mathematics 150 (Hardy–Gödel +95 / Constructivist-HoTT −55); one-structure middle held by Grothendieck +90, Structuralism +88, Langlands +85. All 17 samples rate it.
- **Misstatement M1 — FIXED.** Foundations of Mathematics now has 6 poles including Quine–Putnam Indispensability (spread 140; Quine–Putnam sample +80, previously forced onto Structuralism +60).
- **Timing note:** the three covering topics (xth0032–xth0034) were already in the skin when the spec was written — covered by the earlier gap-build, not by the item-31 build. They are verified covered in the as-built JSON. They still lack `question` / `source` / `communities` fields (the only three topics in the skin missing them).

### (b) New gaps opened by the research: 4 (all new-topic, 0 missing-pole)

#### G-T1 — What do Gödel's incompleteness theorems mean? (NEW TOPIC, trilinear-line, Foundations & Ontology) — BIGGEST NEW GAP

**Fault line in plain words:** "Gödel proved no consistent system can prove all its own truths. Does that change what mathematics is — or is it just a technical limit?"

**The archetypes on each side.** Four incompatible readings, visible in built ratings on neighbouring topics: **Truth outruns proof — incompleteness vindicates realism** (Hardy–Gödel, Platonism: Not revisable +95, Classical Logic +95, Discovered +95). **The game continues inside systems** (Formalism: Revisable +92, Formalism +95, Freeze Core Foundations at ZFC +50). **No surprise — truth just is provability with a witness** (Constructivist-HoTT: Construction +95, Constructive Logic +95, Potential infinity +90). **A technical limit — adopt stronger systems and machine-check them** (Lean-Verifier: Future Standard for All Research Proofs +95, Ironclad Logical Certitude +95, Computer Proof Accept +95 / Reject −90). The research invokes incompleteness only as the motive for adopting stronger axioms (TH-09 hovertip) and in the Unique-V hovertip — the *meaning* of incompleteness itself is never asked. Adopting New Axioms asks *which* axioms to adopt, not what incompleteness means; Can mathematics be revised? asks whether truths change, not whether truth outruns proof.

**Primary citations:** K. Gödel (1931); K. Gödel (1947), "What Is Cantor's Continuum Problem?"; E. Nagel & J. R. Newman (1958), *Gödel's Proof*; T. Franzen (2005), *Gödel's Theorem*.
**Suggested geometry:** trilinear-line. Poles: Truth outruns proof (realist vindication) / A technical limit on any one system — work goes on (stronger systems, machine checking) / No surprise: truth is provability with a witness. Placement: Foundations & Ontology, next to Adopting New Axioms Beyond ZFC.
**Status — fresh finding.**

#### G-T2 — What makes a problem worth working on? (NEW TOPIC, diamond, Method & Style)

**Fault line in plain words:** "You have years of your life. Which problems deserve them — the crisp ones, the fertile ones, the beautiful ones, or the physical ones?"

**The archetypes on each side.** **Crisp & elementary** (Erdős–Gowers, Probabilistic Combinatorialist: Brevity & Economy +95, Shocking Twist +95, Elementary Accessibility +90, Conjecture Solver +95). **Fertile & theory-forcing** (Grothendieck, Langlands: Theory Builder +95, Generating New Methods +95, Grand Unification +95, Rising Sea +95 — and they rate each other's poles negatively: Grothendieck Conjecture Solver −75; Erdős–Gowers Theory Builder −80). **Beautiful & serious** (Hardy–Gödel: Proud Inutility +95, Applied −95 — Hardy's *A Mathematician's Apology* criterion). **Physically & geometrically grounded** (Arnoldian, Geometric Topologist: Physical Symbiosis +95, Visual +95, Concrete & Geometric Intuition First +95). Conjecture orientation asks *how* you work; Values and Results ask what you value in *outputs* — none asks what makes a problem worth picking up.

**Primary citations:** G. H. Hardy (1940), *A Mathematician's Apology*; W. T. Gowers (2000), "The Two Cultures of Mathematics"; A. Grothendieck (1986), *Récoltes et Semailles*; Erdős problem culture.
**Suggested geometry:** diamond (4 poles, one per criterion). Placement: Method & Style, next to Conjecture orientation.
**Status — fresh finding.**

#### G-T3 — Authorship & credit in collaboration (NEW TOPIC, trilinear-line, The Mathematical Life)

**Fault line in plain words:** "When five — or five hundred — mathematicians prove something together, who gets the credit, and how?"

**The archetypes on each side.** **Alphabetical & egalitarian** (Erdős–Gowers, Probabilistic Combinatorialist: Hyper-Collaborative +95, Massively Open Polymath +90, Diamond-Open Overlay Journals +95). **Contribution-tracked** (Lean-Verifier: Massively Open Polymath +95, Co-Creative Discovery Partner +90 — the Mathlib norm: credit tracked by version control). **Single-author ownership** (Grothendieck: Ascetic Monastic Solitude +85, Polish forever +90, Publish quickly −70; Hardy–Gödel: Polymath −35, the only negative Polymath rating). Social mode asks *how* you collaborate, not who gets named — Erdős–Gowers (alphabetical) and Lean-Verifier (contribution-tracked) both rate Massively Open Polymath +90/+95 while holding opposite credit norms.

**Primary citations:** Erdős alphabetical authorship convention; T. Gowers & M. Nielsen (2009), "Massively Collaborative Mathematics," *Nature*; Mathlib community contribution norms. (The research mentions credit exactly once, as a side-effect — TH-15.)
**Suggested geometry:** trilinear-line. Poles: Alphabetical & egalitarian (Erdős) / Contribution-tracked (Mathlib / Polymath) / Single-author ownership (monograph). Placement: The Mathematical Life, next to Social mode.
**Status — fresh finding.**

#### G-T4 — Do you trust the published literature? (NEW TOPIC, trilinear-line, Proof & Verification)

**Fault line in plain words:** "How much of what's already published do you actually believe?"

**The archetypes on each side.** **Systematically unreliable until formalized** (Lean-Verifier — aboutMe verbatim: "Human refereeing missed gaps in landmark proofs for decades." Distraction from Creative Discovery −95 / Future Standard +95, Refereeing Duty +95, Computer Proof Accept +95 / Reject −90). **Broadly reliable — the refereed canon endures** (Hardy–Gödel, Platonism: Not revisable +95, Computer Proof Reject +75, Future Standard −35). **Trust, but audit the landmarks** (Grothendieck, Structuralism, Quine–Putnam: Human Conceptual Understanding +85, Refereeing Duty +80, Computer Proof Accept-with-audit +65). **Trust the community to sort it out** (Arnoldian: Trust (Intuition) +90, Bold Speculative Synthesis +90 / Publish Only Complete Proofs −75). Every related topic asks what to do *going forward* — none asks the backward-looking assessment. The ABC-conjecture case the research itself cites (TH-33) *is* a trust-in-literature case, and no topic asks it.

**Primary citations:** T. C. Hales (2008); M. B. Nathanson (2008), "Desperately Seeking Mathematical Truth," *Notices AMS*; P. Scholze & J. Stix (2018), "Why *abc* Is Still a Conjecture"; Lean-Verifier aboutMe, built JSON.
**Suggested geometry:** trilinear-line. Poles: Broadly reliable — trust the refereed canon / Trust, but audit the landmarks case by case / Systematically unreliable until formalized. Placement: Proof & Verification, next to Refereeing Duty & Verification of Ultra-Long Proofs.
**Status — fresh finding.**

### (c) Missing poles on the new topics: 0

All 142 research stance anchors audited against built ratings — **142/142 expressed**. The two spec missing poles both landed and both split (Finitism & Ultrafinitism on Infinity, spread 140; Massively Open Polymath on Social mode, spread 130). One observation, not a gap: the Finitism & Ultrafinitism pole has no champion (highest rating Intuitionism +45; no ultrafinitist persona among the 17 samples).

### (d) Headline counts (Theo)

63 fault lines total (59 covered + 4 gaps, per-topic-question counting). 59 of 70 topics split at spread ≥ 100 (27 old + 32 new); 21 topics pushed over the threshold by the 11 new archetypes alone. Per-pole: 132 of 199 (topic, pole) cells spread ≥ 100. New gaps: 4 (all new-topic, 0 missing-pole). Original gaps: 3/3 covered. M1 fixed. Receptivity verified: **0 mismatches / 3,276** with exact Fraction arithmetic. Intensity convention holds (18 cross-sign ties all break positive — a consistent, unrecorded convention). Rating completeness: 8 unrated cells (4 originals × Output + Academic life, 13/17 raters each; down from 12). The three T1/T2/T3 topics lack `question` / `source` / `communities` fields.

### (e) Misstatements flagged (Theo, not gaps)

- **M-T1 (firm):** the Set-Theoretic Logician rates Unique True Universe +75 **and** Full Set-Theoretic Multiverse +85 — the research's Woodin/Hamkins wings merged into one sample. Fix direction (for Jason's ruling): split the sample into a Woodin-wing and a Hamkins-wing persona, or re-rate this one sample to one wing.
- **M-T2 (firm, one word):** "Intrinsic Conceptual Justification ONLY" contradicts the Gödelian both-and stance (Hardy–Gödel +85 intrinsic / +80 extrinsic). Suggested fix: drop "Only" from the pole label.

---

## 4 — Cross-cutting findings

### 4.1 Fresh gaps vs. carried conflicts

Of the 10 new gaps, **6 are fresh findings** (Chem G2, Exper G4, Theo G-T1–G-T4) and **4 are downstream of conflict rulings Jason already made** (Chem G1 — Conflict 3, identity, role framing ruled over mission framing; Exper G1/G2/G3 — Conflicts #1/#4/#5, skin's version ruled to stand). The four ruled ones are recorded as genuine fault lines that remain unasked — not as fresh build proposals. Re-open only on Jason's word.

### 4.2 The dominant finding is rating completeness, not taxonomy

The builds added the topics and poles but rated them thinly:

| | Chem | Exper | Theo |
|---|---|---|---|
| New-topic advocacy values exactly 0 | 857 / 1,092 (**78.5%**) | 1,114 / ~2,300 pole-ratings (~48%) | — (8 unrated cells total) |
| Dead new topics (all samples 0 on every pole) | — | **7 of 40** | 0 |
| Unrated cells | Mechanisms re-rated for 4/12 only; Green Priority Profile rated by Green alone | Theorist relationship / Workplace / Shift Work blank for 4 originals; Anomaly reaction silent for 6/7 new; Electric Fields pole silent for all 7 new | 8 (4 originals × Output + Academic life) |

Chem and Exper's new topics are mostly single-champion spikes against a 0-floor, not real splits (Chem: only 7 of 29 fault lines genuinely two-sided). A full rating pass on the new topics would move most spreads — in both directions — and could surface fault lines the zeros currently hide. **No new-gap claim in this report depends on a zero** (G1/G2/G-T1–G-T4 rest on research profiles plus nonzero ratings). This is the back-ratings job the sequence already anticipates (reliable-inference back-ratings on gap topics and unrated cells, only where inference is solid).

### 4.3 Receptivity arithmetic — verified, with one pre-existing defect

| | Cells checked | Mismatches |
|---|---|---|
| Chem | 3,624 | **0** |
| Exper | 2,274 | **11** (all pre-existing, in the 2 original samples, exact-.5 float-rounding artifact: 85 × 0.7 stored 59 vs. exact 60) |
| Theo | 3,276 | **0** |
| **Total** | **9,174** | **11** |

All 11 mismatches predate the seven-skins build (Exper originals only). The 25 new archetypes' receptivity values have zero mismatches. The Exper fix is mechanical (recompute those 11 cells with exact Fraction arithmetic); advocacy is untouched. Negative intensities are the convention everywhere (Chem 6, Exper 1, Theo 28) — no "fix" owed. Intensity = signed largest-|value| pole verified (Exper 747/747; Theo 1,099 dict ratings, 18 cross-sign ties all breaking positive — a consistent, unrecorded convention worth writing down).

### 4.4 What the enrichment did

The new archetypes sharply raised discriminating power. Theo: topics splitting at ≥ 100 went from 38 (old 6) to 59 (all 17), with 21 pushed over by the new archetypes alone. Exper: +8 pole-rows across 4 topics from the 7 new archetypes, all covered. Chem: 4 new ≥100 fault lines on old topics, all covered. The new gaps are the price of that enrichment — questions that only become visible once the new personae are juxtaposed (Gödel's meaning, problem choice, credit, trust in the literature, the mission of chemistry, the two-axis lab, the early-reporting pole, ML placement, the flagship refusal).

### 4.5 Caveats and process notes

- **Research-file ref.** The task specified capades-skins commit `f688876` for `seven-skins-research.md`. That ref did not resolve through the GitHub read tool for the Chem or Exper analyst ("could not resolve ref as a branch or a tag"), so both fetched the file at ref `main` (SHA `210dd70…`, 5,011 lines). Its Chem (CH-01–CH-52) and Exper (EX-01–EX-52) sections match the spec's numbering and pole wording exactly. The Theo analyst read the research from a local per-skin copy (`~/workspace/scratch/seven-skins/theo.md`, TH-01–TH-52). The spec (`SEVEN-SKINS-ADDS-2026-11-27.md`) is the authority for anything contested; citations above come from the spec and the research as read.
- **Counting.** See the counting note under Headline counts. Gap counts are the honest comparison, not fault-line totals.
- **The first analysis's fault-line totals are not reproducible** under the strict spread-≥100 rule (Chem 35 claimed, ~13 reproducible on the original 5; Exper 26 claimed, 20 reproducible on the original 4; Theo 17 was a judgment count). This does not invalidate the first report's gaps (all 7 original gaps here verified covered) — it only means fault-line totals should not be compared across runs.
- **E1 timing (Exper).** Big Science funding predates the seven-skins build; item 30's contribution was rating the 7 new archetypes on it. **T1/T2/T3 timing (Theo).** Same pattern — covered by the earlier gap-build, verified covered in the as-built JSON.
- **Per-skin analyst files** (full detail, fault-line tables, anchor-map passes): `~/workspace/scratch/gap-rerun-chem-2026-11-27.md`, `~/workspace/scratch/gap-rerun-exper-2026-11-27.md`, `~/workspace/scratch/gap-rerun-theo-2026-11-27.md`.

## 5 — Timing table

| Worker | Work | Elapsed |
|---|---|---|
| Coordinator (groundwork) | Tree sync + pull, built-JSON counts, original-gap extraction (Theo/Chem/Exper), spec section pointers, sample lists, research-file check | ~5 min (07:07–07:12 CST) |
| Chem analyst | Full re-run on chemcapades.json (74 topics, 12 samples); 29 fault lines, 2 new gaps, 3/3 originals covered; receptivity 0/3,624 | ~5 min analysis (07:12–07:16 CST) |
| Theo analyst | Full re-run on theoricapades.json (70 topics, 17 samples); 63 fault lines, 4 new gaps, 3/3 originals covered; receptivity 0/3,276 | ~5 min analysis (07:12–07:17 CST) |
| Exper analyst | Full re-run on expericapades.json (72 topics, 11 samples); 28 fault lines, 4 new gaps, 1/1 original covered; receptivity 11/2,274 (pre-existing) | ~6 min analysis (07:12–07:18 CST) |
| Coordinator (synthesis) | Read all three analyst files, synthesized this report, wrote scratch + repo-root copies, committed locally, verified by read-back | ~12 min (07:18–07:30 CST) |
| **Total** | | **~33 min** (07:07–07:30 CST) |

*End of report. Read-only analysis; no files in the repo were modified except the addition of this report file itself (committed locally, not pushed).*
