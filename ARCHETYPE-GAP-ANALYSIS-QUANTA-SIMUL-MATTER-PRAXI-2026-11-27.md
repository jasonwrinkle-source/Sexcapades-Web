# Archetype Gap Analysis Re-Run — Quanta, Simul, Matter, Praxi (2026-11-27)

- **Date:** 2026-11-27 (America/Chicago CST)
- **Scope:** Post-seven-skins gap-analysis re-run across the remaining four science skins — **Quanta** (`quantacapades.json`), **Simul** (`simulcapades.json`), **Matter** (`mattercapades.json`), and **Praxi** (`praxicapades.json`) — AFTER items 32–35 landed in `app/data/skins/` and `site-tree/public_html/hosted/data/skins/`.
- **Compliance:** **Strictly read-only on all skin JSONs.** Zero edits were made to any skin file. Every finding, rating vector, receptivity cell, and intensity value below was verified directly against the built JSONs on `main` (HEAD `4c60b44`).
- **Methodology:** Same audit protocol as the 2026-11-26 baseline (`ARCHETYPE-GAP-ANALYSIS-2026-11-26.md`) and the 2026-11-27 Chem/Exper/Theo re-run (`ARCHETYPE-GAP-ANALYSIS-CHEM-EXPER-THEO-2026-11-27.md`):
  1. Structural parity check (`app/data/skins/*.json` vs. `site-tree/public_html/hosted/data/skins/*.json`), pole-key completeness, and unrated-topic audit.
  2. Exact rational receptivity check (`round(Fraction(advocacy) * Fraction(openness))`, Python round-half-even) and signed largest-`|value|` intensity convention audit across every rated cell.
  3. Substantive archetype consistency audit: checking whether the **newly added archetypes** (37 new personae across the four skins) expose **brand-new fault lines**, **boilerplate rating stamps**, **closest-pair collisions**, **contradictory pole labels**, or **unchampioned poles**.
  4. Strict separation of **fresh gaps** from **gaps downstream of conflict rulings** Jason already made in `SEVEN-SKINS-ADDS-2026-11-27.md` (marked **"re-open only on Jason's word"**).
- **Independent-eye note (Jason, 2026-11-27 09:23):** This pass was executed single-lane directly against the built JSONs and research corpus (no ChatGPT session/API is wired into this IDE workspace). If Jason wants a second model family as an independent auditor before queuing the follow-up fix/build items (or ahead of the Dec 2 full audit), this report's tables and the four built JSONs are structured for drop-in ChatGPT cross-checking.

---

## Executive Summary & Headline Totals

All four built skins are **byte-identical** between `app/data/skins/` and `site-tree/public_html/hosted/data/skins/`, with **0 missing pole keys** and **0 extra/stale pole keys** inside rated topics. Every original 2026-11-26 gap across all four skins was structurally added in items 32–35 — **except Simul S1–S6 were severely compromised by a 10/10 boilerplate copy-paste rating stamp on all 10 new archetypes**, plus a mechanical float-rounding bug in `sim-pragmatist` and a signed-intensity sign bug in Quanta.

| Skin | Topics | Samples (Orig + New) | Orig. 2026-11-26 Gaps | Fresh Gaps | Downstream-of-Conflict Gaps | Firm Misstatements / Mechanical Bugs | Soft Flags | Biggest Gap |
|---|---:|---:|---|---:|---:|---|---|---|
| **Quanta** | 67 | 14 (6 + 8) | 6/6 **CLOSED** (Q1–Q3, M1–M3) | **4** (`G-Q1`–`G-Q4`) | **1** (`C-Q1`, secondary) | **1 firm mechanical** (`M-Q1`: 21 signed-intensity bugs / 42 values) | **2** (`M-Q2` legacy zeros on *Singularities*/*Symmetry*; `M-Q3` "Only" on *EFT vs. UV*) | **`G-Q1` (fresh):** *Ontology of QFT: Particles vs. Fields vs. Local Operator Algebras vs. On-Shell Amplitudes* |
| **Simul** | 77 | 15 (5 + 10) | 6/6 topics added (S1–S6), **compromised by M-S2 stamp** | **4** (`G-S1`–`G-S4`) | **0** (all 3 rulings clean) | **3 firm** (`M-S1`: 45 `sim-pragmatist` receptivity mismatches [4 old + 41 new]; `M-S2`: 10/10 boilerplate stamp on S1–S6; `M-S3`: `sim-pragmatist` `[0,0,0]` on S1) | **2** (`M-S4` *Fast Multipole vs. FFT* 10/15 double-extreme line; 3 unchampioned poles) | **`M-S2` + `G-S1` (fresh):** Un-stamp S1–S6 across all 10 new archetypes AND add *Agnostic / Metaphysically Irrelevant* pole to *Are we living in a computer simulation?* |
| **Matter** | 70 | 16 (5 + 11) | 4/4 **CLOSED** (Ma1–Ma3, M1) | **3** (`G-Ma2`–`G-Ma4`) | **1** (`G-Ma1`, Conflict #3 — **re-open only on Jason's word**) | **3 firm** (`M-Ma1`: 4 pre-existing `mat-pragmatist` receptivity mismatches; `M-Ma2`: *Fusion* 5-pole radar keeps `"Pursue both"` spoke + double-counts MCF; `M-Ma3`: `"Fascinating Basic Physics Only"` contradicts champions) | **2** (*Baseload* 5/16 double-extreme line; *Expectations* `"Hype"` unchampioned at max 20) | **`G-Ma1` (downstream of Conflict #3):** Split *Photonic & Silicon Spin Qubits* on *Quantum Computing Hardware* (`G-Ma2` *Autonomous Self-Driving Labs vs. Artisanal Synthesis* is biggest fresh gap) |
| **Praxi** | 72 | 13 (5 + 8) | 1/1 **CLOSED** (Pr1) | **4** (`G-P1`–`G-P4`) | **1** (`C-P1`, minor/mitigated) | **3 firm** (`M-P1`: 8 pre-existing `pra-simulation-first` receptivity mismatches; `M-P2`: `"Only"` wording contradictions on *Convex Guarantees* and *Open Benchmark Competitions*; `M-P3`: `"Both toolkits"` binary-line artifact on 4-pole *Statistics* diamond) | **1** (*Spatial Statistics* 8/13 double-extreme line; 0 unchampioned poles!) | **`G-P1` (fresh):** *Multiple Testing & Selective Inference Discipline* (paired with `G-P3` separating closest pair `pra-convex-control` ↔ `pra-game-or`, mean diff 7.2) |

**Totals across the 4 skins:**
- **15 fresh gaps** (`4` Quanta, `4` Simul, `3` Matter, `4` Praxi) + **3 downstream-of-conflict notes** (`1` major in Matter Conflict #3; `2` secondary/minor in Quanta Conflict #7 and Praxi Conflict #2 — all "re-open only on Jason's word").
- **10 firm misstatements / mechanical defects** (`57` exact-Fraction receptivity off-by-1 cells: `0` Quanta, `45` Simul, `4` Matter, `8` Praxi; `21` signed-intensity bugs / `42` stored values in Quanta; `60` boilerplate-stamped topic cells across Simul S1–S6; `1` all-zeros misstatement in Simul; `1` broken 5-spoke label/taxonomy on Matter *Fusion*; `3` `"Only"` pole-label contradictions across Matter & Praxi; `1` `"Both toolkits"` diamond label artifact in Praxi).

---

## §1 Quanta (`quantacapades.json` — 67 topics, 14 samples)

**Samples (6 pre-existing + 8 new):**
- Pre-existing (6): `quanta-copenhagen`, `quanta-many-worlds`, `quanta-bohm`, `quanta-qbism`, `quanta-grw`, `quanta-relational`.
- New (8): `quanta-string-unifier` (String-Holographic Unifier), `quanta-relativist` (Background-Independent Relativist), `quanta-emergentist-eft` (Andersonian Emergentist & EFT Realist), `quanta-phenomenologist` (Empirical Phenomenologist & Anti-Speculation Skeptic), `quanta-amplitudes-bootstrap` (On-Shell Amplitudes & Conformal Bootstrap Formalist), `quanta-axiomatic-aqft` (Axiomatic & Algebraic QFT Mathematician), `quanta-mathematical-relativist` (Classical & Mathematical Relativist), `quanta-qthermo-chaos` (Quantum-Thermodynamics & Many-Body Chaos Theorist).

**Closest archetype pairs (mean |pole diff| across shared topics):**
1. `quanta-string-unifier` ↔ `quanta-amplitudes-bootstrap`: **15.0**
2. `quanta-relational` ↔ `quanta-relativist`: **17.1**
3. `quanta-bohm` ↔ `quanta-grw`: **21.0**

### §1(a) Original 2026-11-26 Gaps & Misstatements — Status

All six original Quanta findings (Q1–Q3, M1–M3) are **CLOSED**:
- **Q1 — *What counts as an observer?* (`xqu0031`, `diamond`) — CLOSED.** Four sharp poles (*Classical apparatus*, *Any physical system*, *The agent*, *No privileged observer*) separate `quanta-copenhagen` (90 classical), `quanta-relational` (90) & `quanta-relativist` (95 any physical system), `quanta-qbism` (92 agent), and `quanta-many-worlds` (92 no privileged observer).
- **Q2 — *Where does quantum probability come from?* (`xqu0032`, `diamond`) — CLOSED.** Four poles (*Fundamental (Born rule)*, *Emergent (branching)*, *Subjective (belief)*, *Objective (collapse)*) cleanly separate Copenhagen (90), Many-Worlds (92), QBism (94), and GRW (92). *(Minor note: Bohmian mechanics derives probability from initial quantum-equilibrium typicality rather than any of the four poles, so `quanta-bohm` lands at `[-20, -45, 30, -65]`, inherited from 2026-11-26.)*
- **Q3 — *Can your interpretation be tested?* (`xqu0033`, `trilinear-line`) — CLOSED.** Separates GRW (95) & Empirical Phenomenologist (90) on *Yes, testable* from Many-Worlds (90) & Copenhagen (75) on *No, not in principle* and QBism (90) on *The question is misposed*.
- **M1 & M2 — *Quantum Interpretations* (`xqu0001`, expanded to 6-pole `star-radar`) — CLOSED.** QBism (95), RQM (95), and GRW (90) now each have dedicated spokes alongside Copenhagen (95), Many-Worlds (95), and Bohm (95).
- **M3 — *Bell's theorem* (`xqu0005`, expanded to 4-pole `diamond` adding *Local branching*) — CLOSED.** Many-Worlds now rates *Local branching* +80 and *Superdeterminism / Retrocausality* −60 (String-Holographic Unifier +75, Amplitudes/Bootstrap +55).
- **Inherited pre-existing unrated topics (not new):** The four original pre-2026-11-26 samples (`copenhagen`, `many-worlds`, `bohm`, `qbism`) still leave 5 older topics unrated (`62/67`): *The Quantum Gravity Crossroads*, *Supersymmetry (SUSY) Stance*, *Theorist's method*, *Research focus*, and *Working style*. All 10 newer samples rate `67/67`.

### §1(b) Fresh Gaps Opened by Enriched Archetypes & Research

#### `G-Q1` (BIGGEST QUANTA GAP — Fresh, New Topic) — *Ontology of Quantum Field Theory: Particles, Fields, Operator Algebras, or On-Shell Amplitudes?*
- **Why this is a real fault line:** Quanta now contains four major theoretical-physics camps whose deepest disagreement is **what a quantum field theory fundamentally IS** — yet no topic asks it. *Local Lagrangians vs. On-Shell S-Matrix & Bootstrap* (`xqu0056`) asks a *calculational formalism* question (Lagrangians vs. on-shell amplitudes), and *The Axiomatic QFT Mandate* (`xqu0059`) asks *rigor vs. heuristic pragmatism* — leaving the **ontological question** of QFT unasked.
- **How the enriched archetypes split on it (evidence from built ratings):**
  - *Nets of Local von Neumann Algebras:* `quanta-axiomatic-aqft` (Haag–Kastler local algebras; rates *Local Lagrangians* only 35 vs. *Complementary* 65, *On-Shell* 55 on `xqu0056`, and champions rigorous algebraic nets).
  - *On-Shell S-Matrix & Positive Geometry (Fields Are Redundant Gauge Artifacts):* `quanta-amplitudes-bootstrap` (*Local Lagrangians* −80, *On-Shell* +95 on `xqu0056`).
  - *Effective Quantum Fields / Excitations on a Cutoff:* `quanta-emergentist-eft` (*EFT Is All Empirical Physics Needs* 90 on `xqu0057`), `quanta-phenomenologist` (95 EFT), `quanta-qthermo-chaos`.
  - *Primitive Particle / Flash / Wavefunction Ontology:* `quanta-bohm` (*Local Lagrangians* 60, Bohmian particle trajectories), `quanta-grw` (mass-density / flash ontology).
- **Proposed topic:**
  - **Name:** *Ontology of Quantum Field Theory*
  - **Prompt:** *At bottom, what are the fundamental entities of a quantum field theory — particles, continuous fields, nets of local operator algebras, or on-shell scattering amplitudes?*
  - **Geometry:** `diamond` (4 poles)
  - **Category:** *Quantum Field Theory & Renormalization* (or *Foundations & Interpretation*, next to *Local Lagrangians vs. On-Shell S-Matrix & Bootstrap*)
  - **Poles:**
    1. *Effective Quantum Fields*
    2. *Nets of Local Operator Algebras*
    3. *On-Shell Scattering Amplitudes*
    4. *Primitive Particles or Flashes*
  - **Citations:** Haag (1992), *Local Quantum Physics*; Weinberg (1995), *The Quantum Theory of Fields*, Vol. 1; Wallace (2006), *In Defence of Naiveté: The Conceptual Status of Lagrangian QFT*; Fraser (2008/2009), *Quantum Field Theory: Underdetermination, Inconsistency, and Idealization*; Arkani-Hamed & Trnka (2014), *The Amplituhedron*.

#### `G-Q2` (Fresh, New Topic — Closest-Pair Separator) — *UV Completion Strategy: Unique String/M-Theory Architecture vs. Model-Independent Bootstrap & Positivity Bounds*
- **Why this is a real fault line:** The closest pair in Quanta is `quanta-string-unifier` ↔ `quanta-amplitudes-bootstrap` (mean diff **15.0**). On *Effective Field Theory vs. UV Completion* (`xqu0057`), BOTH sit high on *EFT + Swampland UV–IR Constraints* (String-Unifier 90, Amplitudes/Bootstrap 95) and *Only Complete UV Theory Satisfies* (String-Unifier 95, Amplitudes/Bootstrap 75). What actually divides them in modern HEP theory is **how to constrain UV physics**: build a concrete explicit UV completion (String/M-Theory, explicit compactifications, dualities) versus carving out the allowed space of consistent theories model-independently from unitarity, causality, analyticity, and crossing symmetry (S-matrix bootstrap / EFT positivity bounds — without assuming strings are unique).
- **How the enriched archetypes split:**
  - *Concrete Explicit UV Theory (String/M-Theory or LQG):* `quanta-string-unifier`, `quanta-relativist`.
  - *Model-Independent Bootstrap & Positivity Bounds:* `quanta-amplitudes-bootstrap`, `quanta-axiomatic-aqft`.
  - *Bottom-Up Empirical EFT (Let Experiments Dictate UV):* `quanta-emergentist-eft`, `quanta-phenomenologist`.
- **Proposed topic:**
  - **Name:** *Carving Out UV Physics: Explicit Models vs. Bootstrap Axioms*
  - **Prompt:** *Should quantum-gravity and high-energy theory construct explicit UV-complete models, carve out theory space via model-independent bootstrap/positivity axioms, or wait for bottom-up experimental data?*
  - **Geometry:** `triangle` (3 poles)
  - **Category:** *Quantum Field Theory & Renormalization* (next to *Effective Field Theory vs. UV Completion*)
  - **Poles:**
    1. *Explicit UV-Complete Models*
    2. *Model-Independent Bootstrap & Positivity Bounds*
    3. *Bottom-Up Experimental Guidance*
  - **Citations:** Adams, Arkani-Hamed, Dubovsky, Nicolis & Rattazzi (2006), *Causality, Analyticity and an IR Obstruction to UV Completion*; Poland, Rychkov & Vichi (2019), *The Conformal Bootstrap*; de Rham et al. (2022), *Snowmass White Paper: UV Constraints on IR Physics*.

#### `G-Q3` (Fresh, New Topic) — *Cosmological Initial Conditions & the Measure Problem*
- **Why this is a real fault line:** Quanta has *Arrow of time* (`xqu0017`, thermodynamic/entropic arrow) and *Cosmic Inflation vs. Bouncing Cosmology* (`xqu0048`), but **zero topic on cosmological initial conditions & the eternal-inflation measure problem** — which is a signature fault line for `quanta-mathematical-relativist` (Penrose's Weyl Curvature Hypothesis), `quanta-string-unifier` / `quanta-many-worlds` (eternal inflation + landscape measure), `quanta-qthermo-chaos` (Boltzmann typicality / Past Hypothesis), and `quanta-phenomenologist` (brute empirical boundary condition).
- **Proposed topic:**
  - **Name:** *Cosmological Initial Conditions & the Measure Problem*
  - **Prompt:** *Why did the universe start in an extraordinarily low-entropy state — a fundamental initial-condition law (like Weyl curvature), eternal-inflation multiverse selection, dynamical bounce/quantum-gravity typicality, or a brute empirical fact?*
  - **Geometry:** `diamond` (4 poles)
  - **Category:** *Cosmology & Spacetime* (next to *Arrow of time*)
  - **Poles:**
    1. *Fundamental Initial Law (Weyl Curvature / No-Boundary)*
    2. *Eternal-Inflation Multiverse Measure*
    3. *Dynamical Bounce or Typicality Mechanism*
    4. *Brute Empirical Boundary Condition*
  - **Citations:** Penrose (1979), *Singularities and Time-Asymmetry*; Hartle & Hawking (1983); Guth (2007), *Eternal Inflation and Its Implications*; Albert (2000) / Carroll (2010), *Past Hypothesis*.

#### `G-Q4` (Fresh, Secondary — Archetype Coverage Gap) — *Unchampioned Modified-Gravity / Superdeterminist Wing*
- **Audit finding:** Three active physics poles in Quanta have **max advocacy ≤ 25** across all 14 samples, all topped by `quanta-phenomenologist`:
  - *Bell's theorem* (`xqu0005`): *Superdeterminism / Retrocausality* — max **25** (`quanta-phenomenologist`), min **−75**.
  - *Beyond General Relativity: Modified Gravity Landscape* (`xqu0046`): *Scalar-Tensor, Massive & Torsion Extensions* — max **20** (`quanta-phenomenologist`), min **−65**.
  - *The Cosmological Constant Trilemma* (`xqu0015`): *Modified Cosmic Gravity* — max **25** (`quanta-phenomenologist`), min **−60**.
  *(The other two poles with max ≤ 25 are historically dead or instrumentalist relics: *Steady State* on `xqu0012` at max −55, and *Technical Recipe for Removing Infinities* on `xqu0051` at max 25 from `quanta-copenhagen`.)*
- **Note:** This is NOT a missing topic — the poles exist cleanly. It is a **sample/archetype coverage gap**: if Jason wants a champion for the MOND / modified-gravity / superdeterminist heterodox wing (Milgrom, Hossenfelder, 't Hooft cellular automaton), adding one heterodox archetype (or checking whether `quanta-phenomenologist` was intentionally meant to stay agnostic on modified gravity) would populate all three poles simultaneously. Secondary priority.

### §1(c) Downstream of Conflict Rulings (Quanta — 12 conflicts; re-open ONLY on Jason's word)

- **`C-Q1` (Secondary — Conflict #7, *Beauty* `xqu0025`):** Jason ruled to keep the skin's 2-slider (*Aesthetic & Structural Beauty (Dirac)* vs. *Strict Falsifiability (Popper)*) over Gemini's QU-17 (*Beauty Actively Misleads Physics* | *Heuristic Servant to Experiment* | *Deep Elegance Reliably Guides Discovery*). In the built ratings, `quanta-axiomatic-aqft` (75 Dirac / 65 Popper) and `quanta-mathematical-relativist` (75 / 75) rate BOTH high, while `quanta-phenomenologist` (−85 / +95) captures the Hossenfelder anti-beauty pole via negative Dirac. Because negative Dirac already expresses "beauty misleads," this is **minor/secondary** — **re-open only on Jason's word**.
- All other 11 Quanta conflict rulings (including Conflict #10 *Cosmological Constant* 5-pole union and Conflict #12 *Singularities* 5-pole union) preserved every distinct pole cleanly, aside from the legacy zero-fill artifact noted in `M-Q2` below.

### §1(d) Misstatements, Mechanical Audits & Soft Flags (Quanta)

#### `M-Q1` (FIRM, mechanical — 21 signed-intensity convention violations = 42 stored values)
- **Exact-Fraction receptivity:** **0 mismatches** across all 14 samples!
- **Signed-intensity convention violation:** The pre-existing Quanta samples follow the signed largest-`|value|` convention for `intensity` (`16` negative `advocacy.intensity` cells across the 6 original samples — e.g., `quanta-grw` on *Bell's theorem* has `local-branching = -80` and `adv.intensity = -80`; `quanta-bohm` on *Where does quantum probability come from?* has `objective-collapse = -65` and `adv.intensity = -65`). However, **21 newly written cells in item 32** across **10 samples** stored unsigned `+max(|v|)` instead of signed `-max(|v|)` whenever the largest-magnitude pole rating was negative (flipping BOTH `advocacy.intensity` and `receptivity.intensity` — **42 values total**):

| Sample | Topic (ID) | Stored `adv.int` / `rec.int` | Expected `adv.int` / `rec.int` | Driving Negative Pole (Value) |
|---|---|---:|---:|---|
| `quanta-bohm` | *The Cosmological Constant Trilemma* (`xqu0015`) | `40` / `22` | `-40` / `-22` | `anthropic-multiverse` (`-40`) |
| `quanta-bohm` | *Reconstructing Quantum Theory from Operational Axioms* (`xqu0037`) | `45` / `25` | `-45` / `-25` | `operational-information-axioms-explain-why-qm` (`-45`) |
| `quanta-grw` | *Reconstructing Quantum Theory from Operational Axioms* (`xqu0037`) | `40` / `22` | `-40` / `-22` | `operational-information-axioms-explain-why-qm` (`-40`) |
| `quanta-relational` | *Supersymmetry (SUSY) Stance* (`xqu0008`) | `70` / `38` | `-70` / `-38` | `still-essential-symmetry-of-physics` (`-70`) |
| `quanta-relational` | *AdS/CFT & Holography Beyond Anti-de Sitter* (`xqu0041`) | `55` / `30` | `-55` / `-30` | `universal-principle-of-real-quantum-gravity` (`-55`) |
| `quanta-relational` | *Quantum Complexity as Physical Geometry* (`xqu0043`) | `45` / `25` | `-45` / `-25` | `circuit-complexity-drives-spacetime-growth` (`-45`) |
| `quanta-string-unifier` | *Cosmic origin* (`xqu0012`) | `75` / `41` | `-75` / `-41` | `steady-state` (`-75`) |
| `quanta-emergentist-eft` | *Supersymmetry (SUSY) Stance* (`xqu0008`) | `60` / `33` | `-60` / `-33` | `still-essential-symmetry-of-physics` (`-60`) |
| `quanta-phenomenologist` | *Quantum Interpretations* (`xqu0001`) | `75` / `41` | `-75` / `-41` | `many-worlds-everettian` (`-75`) |
| `quanta-phenomenologist` | *Bell's theorem* (`xqu0005`) | `60` / `33` | `-60` / `-33` | `local-branching` (`-60`) |
| `quanta-phenomenologist` | *The Quantum Gravity Crossroads* (`xqu0006`) | `90` / `50` | `-90` / `-50` | `string-m-theory` (`-90`) |
| `quanta-phenomenologist` | *The Cosmological Constant Trilemma* (`xqu0015`) | `95` / `52` | `-95` / `-52` | `anthropic-multiverse` (`-95`) |
| `quanta-phenomenologist` | *Where does quantum probability come from?* (`xqu0032`) | `65` / `36` | `-65` / `-36` | `emergent-branching` (`-65`) |
| `quanta-amplitudes-bootstrap` | *Quantum Interpretations* (`xqu0001`) | `55` / `30` | `-55` / `-30` | `grw-objective-collapse` (`-55`) |
| `quanta-amplitudes-bootstrap` | *Cosmic origin* (`xqu0012`) | `70` / `38` | `-70` / `-38` | `steady-state` (`-70`) |
| `quanta-amplitudes-bootstrap` | *Where does quantum probability come from?* (`xqu0032`) | `60` / `33` | `-60` / `-33` | `objective-collapse` (`-60`) |
| `quanta-axiomatic-aqft` | *Bell's theorem* (`xqu0005`) | `60` / `33` | `-60` / `-33` | `superdeterminism-retrocausality` (`-60`) |
| `quanta-axiomatic-aqft` | *Cosmic origin* (`xqu0012`) | `65` / `36` | `-65` / `-36` | `steady-state` (`-65`) |
| `quanta-mathematical-relativist` | *Bell's theorem* (`xqu0005`) | `40` / `22` | `-40` / `-22` | `local-branching` (`-40`) |
| `quanta-mathematical-relativist` | *Cosmic origin* (`xqu0012`) | `75` / `41` | `-75` / `-41` | `steady-state` (`-75`) |
| `quanta-qthermo-chaos` | *Bell's theorem* (`xqu0005`) | `55` / `30` | `-55` / `-30` | `superdeterminism-retrocausality` (`-55`) |

*(Note: verify whether the app's renderer expects signed `intensity` or unsigned `|intensity|` before flipping — Simul and Matter have 0 negative intensities while Quanta has 16 and Praxi has 5. Either standardize all 21 cells to signed to match Quanta's existing 16 cells, or confirm the canonical intensity sign convention across all skins.)*

#### `M-Q2` (Soft flag — legacy zero-fill on *Singularities* `xqu0009` and *Symmetry* `xqu0022`)
- On *Singularities* (`xqu0009`, expanded from a 3-pole line to a 5-pole `star-radar`), five pre-existing samples (`copenhagen`, `many-worlds`, `qbism`, `grw`, `relational`) still carry legacy `[0, 100, ..., 0]` on the three original poles (`Quantum Bounce = 0`, `Finite density = 100`, `Physical Singularity = 0`), while all 8 new archetypes have differentiated ratings on `Quantum Bounce` and `Physical Singularity`. Note also that *Finite density* is a generic outcome rather than a distinct mechanism alongside *Quantum Bounce*, *No-Boundary/Tunneling*, and *Pre-Geometric Phase*.
- On *Symmetry* (`xqu0022`, pre-existing), `quanta-copenhagen` and `quanta-qbism` still carry `[0, 0]` (`intensity = 0`), untouched by item 32.

#### `M-Q3` (Soft flag — absolute wording on *Effective Field Theory vs. UV Completion* `xqu0057`)
- Pole 3 is labeled **`Only Complete UV Theory Satisfies`**, yet `quanta-string-unifier` rates *EFT + Swampland UV–IR Constraints* **90** AND *Only Complete UV Theory Satisfies* **95**, and `quanta-amplitudes-bootstrap` rates them **95** and **75**. Dropping `"Only"` → *Complete UV Theory Required* removes the wording tension cleanly without changing any ratings.

---

## §2 Simul (`simulcapades.json` — 77 topics, 15 samples)

**Samples (5 pre-existing + 10 new):**
- Pre-existing (5): `sim-optimist`, `sim-skeptic`, `sim-pragmatist`, `sim-purist`, `sim-it-from-bit`.
- New (10): `sim-structure-analyst` (Structure-Preserving Numerical Analyst), `sim-exascale-hpc` (Exascale HPC & Bare-Metal Engineer), `sim-multiscale-builder` (Multiscale & Hierarchical Model Builder), `sim-sciml-pioneer` (SciML & Differentiable-Physics Pioneer), `sim-vv-uq-auditor` (V&V / UQ Verification Auditor), `sim-open-rse` (Open-Science Research Software Craftsman), `sim-fast-nla-maestro` (Fast-Algorithm & Numerical Linear Algebra Maestro), `sim-astro-plasma` (Astrophysical & Plasma Kinetic Simulator), `sim-data-assimilation` (Data-Assimilation & Earth-System Forecaster), `sim-md-free-energy` (Molecular-Dynamics & Free-Energy Mechanist).

**Closest archetype pairs (mean |pole diff| across shared topics):**
1. `sim-multiscale-builder` ↔ `sim-open-rse`: **12.5**
2. `sim-multiscale-builder` ↔ `sim-md-free-energy`: **13.6**
3. `sim-structure-analyst` ↔ `sim-vv-uq-auditor`: **16.6**

### §2(a) Original 2026-11-26 Gaps S1–S6 — Status

All six original Simul gap topics (`xsi0030`–`xsi0035`) were added in *The Epistemology of Simulation*:
- **S1:** *Are we living in a computer simulation?* (`xsi0030`)
- **S2:** *Is the universe a computation?* (`xsi0031`)
- **S3:** *Can a simulated mind be conscious?* (`xsi0032`)
- **S4:** *Looking for glitches* (`xsi0033`)
- **S5:** *Ethics of simulated minds* (`xsi0034`)
- **S6:** *Determinism underneath* (`xsi0035`)

**However, S1–S6 are NOT cleanly closed in practice** because of two firm misstatements (`M-S2` and `M-S3` below):
1. All **10 new archetypes** were stamped with the **exact same copy-pasted rating vectors** on all six S1–S6 topics (`60` identical topic-sample cells), producing direct internal self-contradictions.
2. `sim-pragmatist` rates `[0, 0, 0]` (`intensity = 0`) on S1 (*Are we living in a computer simulation?*) because there is no agnostic/pragmatic pole.

All 15 samples rate `77/77` topics (0 unrated topics across the entire skin!).

### §2(b) Fresh Gaps Opened by Enriched Archetypes & Research

#### `G-S1` (BIGGEST SIMUL GAP, paired with `M-S2` — Fresh, Missing Pole) — *Add "Agnostic / Metaphysically Irrelevant" Pole to "Are we living in a computer simulation?" (`xsi0030`)*
- **Why this is a real fault line:** Today `xsi0030` is a 3-pole `trilinear-line` (*Ancestor simulation* | *It from bit* | *Base reality*). Both `sim-pragmatist` (whose `about` explicitly states it *"sidesteps whether we are simulated and asks what the simulation framing is good for"*, leaving it stranded at `[0, 0, 0]`) and several working computational scientists (`sim-open-rse`, `sim-vv-uq-auditor`, `sim-exascale-hpc`) do not hold a strong metaphysical commitment to base reality vs. simulation — they treat the metaphysical simulation hypothesis as **operationally unfalsifiable and irrelevant to scientific computing**.
- **Proposed change:**
  - **Topic:** *Are we living in a computer simulation?* (`xsi0030`, *The Epistemology of Simulation*)
  - **Geometry:** Upgrade `trilinear-line` → `diamond` (4 poles)
  - **New pole:** *Agnostic / Metaphysically Irrelevant* (alongside *Ancestor simulation*, *It from bit*, *Base reality*)
  - **Citations:** Bostrom (2003); Chalmers (2022), *Reality+*; Hossenfelder (2021), *The Simulation Hypothesis Is Pseudoscience*.

#### `G-S2` (Fresh, New Topic) — *Commercial Proprietary CAE Suites vs. Community Open-Source HPC Codes vs. In-House Bespoke Solvers*
- **Why this is a real fault line:** On *Code Openness* (`xsi0025`), *Protected Competitive Advantage* is unchampioned (max **20**, `sim-skeptic`; min **−95**). Meanwhile *Flagship Community Codes vs. Bespoke Research Scripts* (`xsi0074`) only contrasts community open-source flagships (LAMMPS, OpenFOAM, VASP) against bespoke research scripts — completely omitting the huge **commercial certified CAE/multiphysics ecosystem** (ANSYS, Abaqus, COMSOL, Schrödinger, Gaussian) where regulatory QA certification, vendor liability, and turnkey industrial workflows compete with open-source community codes.
- **How the enriched archetypes split:**
  - *Community Open-Source Flagships:* `sim-open-rse` (*Code Openness* open-source 95, proprietary −95), `sim-md-free-energy`, `sim-astro-plasma`.
  - *Certified Commercial / Turnkey Suites (QA & Liability):* `sim-pragmatist`, `sim-vv-uq-auditor` (differentiated on auditability vs. vendor certification), `sim-skeptic`.
  - *Bespoke Hardware-Tuned Research Codes:* `sim-exascale-hpc`, `sim-fast-nla-maestro`, `sim-structure-analyst`.
- **Proposed topic:**
  - **Name:** *Software Ecosystem: Commercial Certified Suites vs. Open Community Flagships vs. Bespoke Codes*
  - **Prompt:** *When engineering or scientific stakes are high, should teams rely on vendor-certified commercial suites, open-source community flagships, or custom in-house solvers?*
  - **Geometry:** `triangle` (3 poles)
  - **Category:** *Software, Hardware & Research Craft* (next to *Flagship Community Codes vs. Bespoke Research Scripts*)
  - **Poles:**
    1. *Certified Commercial Suites (ANSYS / COMSOL / Schrödinger)*
    2. *Open-Source Community Flagships*
    3. *Custom In-House Research Solvers*
  - **Citations:** Oberkampf & Roy (2010), *Verification and Validation in Scientific Computing*; ASME V&V 10/20 standards; Katz et al. (2021), *Research Software Engineering*.

#### `G-S3` (Fresh, New Topic) — *ML Surrogate & MLIP Out-of-Distribution Guardrails (Active Learning vs. Physics Fallback vs. Reject Surrogates)*
- **Why this is a real fault line:** Simul now has strong SciML and atomistic archetypes (`sim-sciml-pioneer`, `sim-md-free-energy`, `sim-data-assimilation`, `sim-vv-uq-auditor`, `sim-structure-analyst`, `sim-multiscale-builder`). *Machine-Learned Interatomic Potentials* (`xsi0021`) asks enthusiasm vs. skepticism, and *Trusting Simulations in Unobserved Regimes* (`xsi0038`) asks extrapolating physical models — **neither asks how to guard an ML surrogate or MLIP when a live simulation leaves its training distribution** (the #1 practical failure mode in modern SciML/MLIP deployment: unphysical bond breaking, energy blow-ups, silent hallucination).
- **Proposed topic:**
  - **Name:** *ML Surrogate Out-of-Distribution Guardrails*
  - **Prompt:** *When a machine-learned surrogate or interatomic potential drifts outside its training distribution, how should a production simulation respond?*
  - **Geometry:** `diamond` (4 poles)
  - **Category:** *Scientific Machine Learning & Surrogates* (next to *MLIPs* / *Hard Symmetry Constraints*)
  - **Poles:**
    1. *Active Learning & On-the-Fly First-Principles Retraining*
    2. *Automatic Fallback to Exact Physics Solver*
    3. *Hard Conservation & Conformal-UQ Hard-Stop*
    4. *Do Not Deploy Black-Box Surrogates Out-of-Sample*
  - **Citations:** Behler (2015/2021); Vandermause et al. (2020), *On-the-Fly Active Learning of Interpretable Bayesian Force Fields*; Musil et al. (2021); Fu et al. (2023), *Forces Are Not Enough: Benchmark and Critical Evaluation for Machine Learning Force Fields*.

#### `G-S4` (Fresh, New Topic) — *Forward Virtual Prototyping vs. Adjoint & Differentiable Inverse Design*
- **Why this is a real fault line:** *Differentiable Physics & Automatic Differentiation* (`xsi0061`) is a `monopole-slider` (range −20..95) and *Data Assimilation Paradigm* (`xsi0050`) is meteorology-specific (4D-Var vs. EnKF). No topic asks the overarching computational-science workflow fault line: **is simulation primarily a forward "virtual wind tunnel" for exploring high-fidelity physics, or an inner differentiable/adjoint loop driving automated inverse design and parameter discovery?**
- **How the enriched archetypes split:** `sim-sciml-pioneer` (AD 95) & `sim-data-assimilation` (4D-Var 85) & `sim-fast-nla-maestro` (adjoint solvers) vs. `sim-astro-plasma` & `sim-exascale-hpc` (forward hero simulations) vs. `sim-multiscale-builder` & `sim-vv-uq-auditor` (outer-loop UQ / ensemble exploration).
- **Proposed topic:**
  - **Name:** *Forward Exploration vs. Adjoint Inverse Design*
  - **Prompt:** *Is a flagship simulator primarily built for forward high-fidelity physical exploration, outer-loop ensemble UQ & optimization, or end-to-end adjoint/differentiable inverse design?*
  - **Geometry:** `triangle` (3 poles)
  - **Category:** *Numerical Methods & Algorithms* (or *Scientific Machine Learning & Surrogates*)
  - **Poles:**
    1. *Forward High-Fidelity Physical Exploration*
    2. *Outer-Loop Ensemble & Derivative-Free UQ*
    3. *End-to-End Adjoint & Differentiable Inverse Design*
  - **Citations:** Jameson (1988), *Aerodynamic Design via Control Theory*; Giles & Pierce (2000), *An Introduction to the Adjoint Approach to Design*; Thuerey et al. (2021), *Physics-Based Deep Learning*.

### §2(c) Downstream of Conflict Rulings (Simul — 3 conflicts)

**None to reopen.** All three Simul conflict rulings landed cleanly:
- Conflict #1 (*The Three Pillars* `xsi0001`): replacing *Autonomous Instrument* with *Distinct Third Pillar of Science* works coherently (`sim-it-from-bit` maps cleanly at 90).
- Conflict #2 (*Computational Methods* `xsi0007`): upgraded to 5-pole `star-radar` keeping BOTH *Ab Initio Quantum* and *Discrete-Event & Agent-Based* — zero pole loss.
- Conflict #3 (*Integration* `xsi0013`): keeping 2-pole `linear-sliders` handles the six new archetypes that rate ≥65 on both *Symplectic Integrators* and *High-Order Adaptive Steppers* cleanly because `linear-sliders` is non-exclusive.

### §2(d) Misstatements, Mechanical Audits & Soft Flags (Simul)

#### `M-S1` (FIRM, mechanical — 45 exact-Fraction receptivity mismatches in `sim-pragmatist`, openness `0.70`)
- All 14 other samples have **0** receptivity mismatches.
- `sim-pragmatist` (`openness = 0.70`) has **45** cells off by 1 due to IEEE-754 float multiplication (`85 * 0.70 = 59.49999999999999` → `59` instead of exact `Fraction` round-half-even `60`; `45 * 0.70 = 31.499999999999996` → `31` instead of `32`): **4 pre-existing cells** (`xsi0028` *Starting point* `implementation` + `intensity`, `xsi0029` *Role* `research-software-engineer` + `intensity`) plus **41 brand-new cells** introduced in item 33 across 24 topics:
  - `adv = 45` (`stored 31 → exact 32`, 11 cells): `xsi0007` (`discrete-event-and-agent-based`), `xsi0044` (`lagrangian-smoothed-particle-hydrodynamics`), `xsi0045` (`sparse-grid-and-low-rank-vlasov`), `xsi0046` (`cataloged-lattice-kinetic-monte-carlo`), `xsi0048` (`stochastic-monte-carlo-transport`), `xsi0049` (`non-equilibrium-jarzynski-crooks-pulling`), `xsi0051` (`intrusive-projection-pod-reduced-basis`), `xsi0057` (`fast-multipole-fmm-and-h-matrices`), `xsi0064` (`ride-the-exascale-gpu-wave`), `xsi0068` (`quantitative-predictive-certification`), `xsi0077` (`minimal-toy-code-capturing-essence`).
  - `adv = 85` (`stored 59 → exact 60`, 34 cells = 17 pole + `intensity` pairs): `xsi0028` (`implementation`), `xsi0029` (`research-software-engineer`), `xsi0037` (`transparent-documented-calibration`), `xsi0038` (`physics-bounded-extrapolation-with-uq`), `xsi0039` (`valuable-when-closed-loop-and-uq-calibrated`), `xsi0050` (`hybrid-ensemble-variational-4denvar`), `xsi0051` (`operator-inference-physics-preserving-rom`), `xsi0053` (`imex-operator-splitting`), `xsi0054` (`mixed-precision-with-fp64-accumulation`), `xsi0055` (`preconditioned-hybrid-solvers`), `xsi0062` (`pragmatic-inductive-biases`), `xsi0063` (`powerful-catalyst-needing-physical-integration`), `xsi0064` (`algorithm-hardware-co-design`), `xsi0065` (`performance-portable-abstractions`), `xsi0067` (`unit-tests-and-mesh-convergence`), `xsi0073` (`self-describing-standard-formats`), `xsi0076` (`pragmatic-flops-per-watt-efficiency`).

#### `M-S2` (FIRM, substantive — 10/10 boilerplate copy-paste rating stamp on ALL SIX S1–S6 topics `xsi0030`–`xsi0035`)
Every single one of the **10 new Simul archetypes** (`sim-structure-analyst`, `sim-exascale-hpc`, `sim-multiscale-builder`, `sim-sciml-pioneer`, `sim-vv-uq-auditor`, `sim-open-rse`, `sim-fast-nla-maestro`, `sim-astro-plasma`, `sim-data-assimilation`, `sim-md-free-energy`) carries the **identical hardcoded advocacy vector** on all six epistemology-of-simulation topics:

| Topic (ID) | Hardcoded Vector Stamped on All 10 New Archetypes | Concrete Internal Self-Contradiction |
|---|---|---|
| *Are we living in a computer simulation?* (`xsi0030`) | `[-65, 10, 80]` | Erases distinction between computational-universe sympathizers (e.g., `sim-sciml-pioneer`, `sim-astro-plasma`) and strict base-reality realists (`sim-vv-uq-auditor`, `sim-md-free-energy`). |
| *Is the universe a computation?* (`xsi0031`) | `[-35, 75, 35]` | Stamps `sim-md-free-energy` and `sim-astro-plasma` (physical matter realists) identically with `sim-fast-nla-maestro` and `sim-sciml-pioneer`. |
| *Can a simulated mind be conscious?* (`xsi0032`) | `[25, 45, -15]` | Gives `sim-sciml-pioneer` (AI/neural architectures) the exact same tepid `[25, 45, -15]` as `sim-exascale-hpc` and `sim-vv-uq-auditor`. |
| *Looking for glitches* (`xsi0033`) | `[-75, 15, 85]` | Identical across all 10 archetypes. |
| *Ethics of simulated minds* (`xsi0034`) | `[35, 55, -20]` | Identical across all 10 archetypes. |
| *Determinism underneath* (`xsi0035`) | `[15, 55, 25]` | **Direct contradiction with *Predictability* (`xsi0011`):** `sim-structure-analyst` rates *Predictability* `Deterministic +70, Stochastic -25` (symplectic deterministic physics) yet gets stamped `fully-deterministic +15, random-at-bottom +25` (preferring random-at-bottom over deterministic!). Meanwhile `sim-data-assimilation` rates *Predictability* `Deterministic -35, Stochastic +85` yet receives the exact same `[15, 55, 25]` vector! |

**Required fix:** Re-rate all 10 new archetypes individually on `xsi0030`–`xsi0035` grounded in each archetype's actual `about`, *Predictability* (`xsi0011`), and *SciML* stances, using exact `Fraction` receptivity.

#### `M-S3` (FIRM, substantive — `sim-pragmatist` `[0, 0, 0]` on *Are we living in a computer simulation?* `xsi0030`)
- `sim-pragmatist` rates `[0, 0, 0]` (`intensity = 0`) on `xsi0030`, making it look unrated/indifferent rather than actively agnostic/pragmatist. Resolved cleanly by `G-S1` (adding *Agnostic / Metaphysically Irrelevant* pole).

#### `M-S4` (Soft flags — geometry & unchampioned poles)
- **Double-extreme line ratings on *Fast Multipole & Hierarchical H-Matrices vs. FFT / Particle-Mesh* (`xsi0057`, `trilinear-line`):** **10 of 15** archetypes rate `≥ 65` on BOTH endpoints (`fft-and-particle-mesh-ewald` and `fast-multipole-fmm-and-h-matrices` — e.g., `sim-fast-nla-maestro` `[75, ..., 95]`, `sim-md-free-energy` `[95, ..., 75]`). Because FFT/PME dominates periodic boxes while FMM/Tree dominates open/clustered geometries, a `linear-sliders` or `triangle` geometry fits the actual complementarity better than an opposing `trilinear-line`.
- **Three unchampioned poles (`max ≤ 25`):** *Protected Competitive Advantage* on *Code Openness* (`xsi0025`, max 20 — addressed by `G-S2`), *Physical Sanity Checks Suffice* on *Formal Code Verification Discipline* (`xsi0067`, max 25, `sim-optimist`), and *Deterministic Best-Estimate Point Runs* on *Uncertainty Quantification (UQ) Rigor* (`xsi0069`, max 15, `sim-exascale-hpc`).

---

## §3 Matter (`mattercapades.json` — 70 topics, 16 samples)

**Samples (5 pre-existing + 11 new):**
- Pre-existing (5): `mat-nuclear`, `mat-renewables`, `mat-fusion`, `mat-quantum`, `mat-pragmatist`.
- New (11): `mat-bell-labs` (Bell-Labs Pasteur's-Quadrant Physicist), `mat-crystal-grower` (Quantum-Materials Explorer & Crystal Grower), `mat-ftqc-architect` (Fault-Tolerant Quantum Hardware Architect), `mat-silicon-realist` (Silicon & Packaging Realist), `mat-materials-genome` (Materials-Genome & Autonomous-Discovery Pioneer), `mat-energy-decarbonizer` (Energy-Systems & Fusion Decarbonizer), `mat-biophys-soft-matter` (Quantitative Biophysicist & Soft-Matter Architect), `mat-photonics-engineer` (Integrated Photonics & Nanophotonics Engineer), `mat-spintronics-ferroic` (Spintronics & Ferroic Device Physicist), `mat-structural-metallurgist` (Structural Metallurgist & Extreme-Materials Engineer), `mat-medical-physicist` (Clinical & Translational Medical Physicist).

**Closest archetype pairs (mean |pole diff| across shared topics):**
1. `mat-bell-labs` ↔ `mat-spintronics-ferroic`: **9.1**
2. `mat-bell-labs` ↔ `mat-materials-genome`: **10.0**
3. `mat-energy-decarbonizer` ↔ `mat-structural-metallurgist`: **10.0**

### §3(a) Original 2026-11-26 Gaps & Misstatements — Status

All four original Matter findings (Ma1–Ma3, M1) are **CLOSED**:
- **Ma1 & M1 — *Baseload* (`xma0014`) — CLOSED.** Added *Distributed solar + storage*; `mat-renewables` now rates `[-75, -75, +80]` (resolving the 2026-11-26 all-negative misstatement M1). *(See soft structural note `M-Ma4` on the middle pole *Centralized grid*.)*
- **Ma2 — *More is different* (`xma0030`, `trilinear-line`) — CLOSED.** Cleanly splits `mat-fusion` (70) & `mat-nuclear` (65) on *Reduction* vs. `mat-crystal-grower` (90) & `mat-biophys-soft-matter` (85) on *Real and irreducible* vs. `mat-bell-labs` (85) & `mat-materials-genome` (85) on *Real but grounded*.
- **Ma3 — *Nuclear waste, safety, and proliferation* (`xma0031`, `trilinear-line`) — CLOSED.** Cleanly splits `mat-nuclear` (90), `mat-energy-decarbonizer` (85), `mat-structural-metallurgist` (85) on *Manageable* vs. `mat-renewables` (85) on *Unmanageable* vs. `mat-biophys-soft-matter` (65) on *Proliferation is the real risk*.
- **Inherited pre-existing unrated topic (not new):** The five original samples still leave `xma0025` *Imaging* unrated (`69/70`). All 11 new archetypes rate `70/70`.

### §3(b) Fresh Gaps Opened by Enriched Archetypes & Research

#### `G-Ma2` (BIGGEST FRESH MATTER GAP — New Topic) — *Human Artisanal Synthesis Craft vs. Self-Driving Autonomous Laboratories*
- **Why this is a real fault line:** *Materials discovery* (`xma0002`) asks *Rational Computational Design* vs. *Design-build loop* vs. *Edisonian Empirical Synthesis* — i.e., **theory vs. trial-and-error**. It does NOT ask the burning 2023–2026 experimental-materials debate: **closed-loop robotic "self-driving" autonomous synthesis labs (A-Lab, robotic powder/wet-lab automation + active learning) vs. human-in-the-loop assisted synthesis vs. artisanal human furnace/crystal-growth craft** (where human intuition catches subtle phase impurities, crucible reactions, and unexpected metastable phases that robotic labs misidentify).
- **How the enriched archetypes split (also helps separate closest pair `mat-bell-labs` ↔ `mat-materials-genome`, mean diff 10.0):**
  - *Self-Driving Autonomous Labs:* `mat-materials-genome` (*Rational Computational Design* 95, *Edisonian* −55 on `xma0002`).
  - *Human-in-the-Loop Co-Piloted Synthesis:* `mat-bell-labs`, `mat-spintronics-ferroic`, `mat-photonics-engineer`, `mat-silicon-realist`.
  - *Artisanal Human Crystal-Growth Craft:* `mat-crystal-grower` (*Edisonian* 95, *Rational Computational* −40), `mat-structural-metallurgist` (*Edisonian* 60).
- **Proposed topic:**
  - **Name:** *Autonomous Self-Driving Labs vs. Artisanal Synthesis Craft*
  - **Prompt:** *Should next-generation materials synthesis be driven by closed-loop robotic self-driving labs, human-guided automated workflows, or hands-on artisanal experimental craftsmanship?*
  - **Geometry:** `trilinear-line` (3 poles)
  - **Category:** *Materials Discovery & Condensed Matter* (next to *Materials discovery*)
  - **Poles:**
    1. *Closed-Loop Self-Driving Robotic Labs*
    2. *Human-in-the-Loop Assisted Automation*
    3. *Artisanal Hands-On Experimental Craft*
  - **Citations:** Szymanski et al. (2023), *An Autonomous Laboratory for the Accelerated Synthesis of Novel Materials* (*Nature*); Leeman et al. (2024), *Challenges in High-Throughput Inorganic Material Prediction and Autonomous Synthesis* (*PRX Energy*); Canfield (2019), *New Materials Physics* (*Rep. Prog. Phys.*).

#### `G-Ma3` (Fresh, Missing Pole or New Topic) — *3D Chiplets & Advanced Packaging on Silicon vs. Monolithic Scaling vs. Exotic Post-CMOS Materials*
- **Why this is a real fault line:** *Semiconductors* (`xma0022`, `diamond`) jumps directly from *Dimensional Silicon Scaling (Moore's Law)* to *Beyond-Silicon Heterogeneous Integration* and *Domain-Specific & Neuromorphic Hardware*, with *Scale silicon, integrate beyond* as a generic bridge — leaving **3D Heterogeneous Chiplet Packaging (CoWoS, Foveros, hybrid bonding, backside power delivery on silicon)** without its own pole! That is the signature thesis of `mat-silicon-realist` (named *The Silicon & Packaging Realist*, forced onto *Scale silicon, integrate beyond* 100 and *Dimensional Scaling* 85 while `mat-photonics-engineer` [90/90] and `mat-spintronics-ferroic` [75/95] pile onto *Beyond-Silicon*).
- **Proposed fix:** Either upgrade *Semiconductors* (`xma0022`) to a 5-pole `star-radar` adding *Advanced 3D Packaging & Chiplets*, OR add a dedicated `trilinear-line` topic (*Post-Moore Scaling Path: Advanced 3D Packaging & Chiplets vs. Hybrid Co-Packaged Optics/Memory vs. Exotic Post-CMOS Devices*) in *Semiconductors, Photonics & Spintronics*.
- **Citations:** Lau (2022), *Recent Advances and Trends in Advanced Packaging*; IEEE IRDS More-than-Moore & Packaging roadmaps; Shalf (2020), *The Future of Computing Beyond Moore's Law*.

#### `G-Ma4` (Fresh, New Topic) — *Nuclear Fission Reactor Architecture: Gen-III+ Gigawatt vs. Small Modular Reactors (SMRs) vs. Gen-IV Breeders & Molten-Salt*
- **Why this is a real fault line:** Matter gives dedicated technology-choice topics to *Fusion* (`xma0013`, 5 spokes), *Grid-Scale Batteries* (`xma0053`), *Photovoltaics* (`xma0054`), *Hydrogen* (`xma0055`), and *Direct Air Capture* (`xma0058`) — yet **Nuclear Fission has ZERO architecture-choice topic**, despite three archetypes engaging fission engineering deeply (`mat-nuclear`, `mat-structural-metallurgist` [ODS steels & radiation-tolerant alloys], `mat-energy-decarbonizer` [bankable LCOE deployment], plus `mat-renewables` opposing new fission).
- **Proposed topic:**
  - **Name:** *Nuclear Fission Architecture: Gen-III+ vs. SMRs vs. Gen-IV Breeders*
  - **Prompt:** *If nuclear fission scales for decarbonization, should investment back standardized Gen-III+ gigawatt reactors, factory-built Small Modular Reactors (SMRs), or Gen-IV fast-breeder / molten-salt concepts?*
  - **Geometry:** `triangle` (3 poles)
  - **Category:** *Energy, Fusion & Decarbonization* (next to *Nuclear waste, safety, and proliferation* / *Fusion*)
  - **Poles:**
    1. *Standardized Gen-III+ Gigawatt Fleets*
    2. *Factory-Built Small Modular Reactors (SMRs)*
    3. *Gen-IV Fast-Breeder & Molten-Salt Reactors*
  - **Citations:** MIT Energy Initiative (2018), *The Future of Nuclear Energy in a Carbon-Constrained World*; Lovering, Yip & Nordhaus (2016), *Historical Construction Costs of Global Nuclear Power Reactors*; IAEA Gen-IV Technology Roadmap.

### §3(c) Downstream of Conflict Rulings (Matter — 5 conflicts; re-open ONLY on Jason's word)

#### `G-Ma1` (BIGGEST MATTER GAP — DOWNSTREAM OF CONFLICT #3; **re-open ONLY on Jason's word**) — *Photonic Qubits & Silicon Spin Qubits Merged Into One Spoke on Quantum Computing Hardware (`xma0008`)*
- **What happened in Conflict #3:** Jason ruled to preserve *Topological Qubits* on the 5-pole `star-radar` (*Quantum Computing Hardware*, `xma0008`), which required merging **Photonic Quantum Information** and **Silicon Spin Qubits** into a single composite spoke: `Photonic & Silicon Spin Qubits` (key `photonic-quantum-information`).
- **Why the built ratings prove a real collision:** Three totally distinct Matter archetypes are forced onto that ONE merged spoke:
  - `mat-photonics-engineer` rates it **95** (room-temperature optical waveguides, fusion-based photonic computing, integrated silicon nitride / TFLN).
  - `mat-silicon-realist` rates it **75** (CMOS foundry silicon quantum dots at millikelvin temperatures — completely unrelated to photonic qubits!).
  - `mat-spintronics-ferroic` rates it **75** (electron-spin coherence in isotopically purified Si/SiGe — again spin physics, not photonics!).
  - Meanwhile `mat-ftqc-architect` (55) has sharply different fault-tolerance assessments for linear-optical photon-loss thresholds vs. dense Si-spin 2D arrays, which the merged spoke cannot express.
- **Proposed resolution (if Jason gives the word to supersede Conflict #3):** Expand *Quantum Computing Hardware* (`xma0008`) from a 5-pole `star-radar` to a **6-pole `star-radar`** (matching Quanta's 6-pole *Quantum Interpretations* and *The Quantum Gravity Crossroads*) splitting spoke #4 into:
  - *Photonic Quantum Computing*
  - *Silicon Spin Qubits*
  while keeping *Superconducting Circuits*, *Trapped Ions*, *Neutral Atom Arrays*, and *Topological Qubits* intact.
- **Citations:** Bartolucci et al. (2023), *Fusion-Based Quantum Computation* (PsiQuantum); Kane (1998) / Veldhorst et al. (2015) / Burkard et al. (2023), *Semiconductor Spin Qubits* (*Rev. Mod. Phys.*).
- **Other Matter conflict rulings (#1 *Superconductors*, #2 *2D materials*, #4 *Biophysics*, #5 *Triumph*):** All four landed cleanly with no urgent reopen needed. *(Note: on Conflict #1 *Superconductors* `xma0019`, *Extreme-Pressure Hydrides* peaks at 45 [`mat-materials-genome`] and goes down to −80 [`mat-silicon-realist`], which accurately reflects the post-2023 field skepticism rather than a missing pole.)*

### §3(d) Misstatements, Mechanical Audits & Soft Flags (Matter)

#### `M-Ma1` (FIRM, mechanical — 4 pre-existing exact-Fraction receptivity mismatches in `mat-pragmatist`, openness `0.70`)
- All 11 new archetypes and all newly-written cells of originals have **0** receptivity mismatches.
- `mat-pragmatist` (`openness = 0.70`) carries **4 pre-existing** float-rounding mismatches (`85 * 0.70 = 59.5` → `59` vs. exact `60`):
  - `xma0016` (*Optimization*): `cost` (`adv=85, stored=59, exact=60`) and `intensity` (`adv=85, stored=59, exact=60`).
  - `xma0028` (*Intellectual property*): `commercial-patents-spin-out-startups` (`adv=85, stored=59, exact=60`) and `intensity` (`adv=85, stored=59, exact=60`).

#### `M-Ma2` (FIRM, structural/label defect — *Fusion* `xma0013` keeps `"Pursue both"` on a 5-spoke radar + double-counts MCF)
- When *Fusion* (`xma0013`) was upgraded from a 3-pole `trilinear-line` (`Magnetic Confinement Fusion (MCF)` | `Pursue both` | `Inertial Confinement Fusion (ICF)`) to a 5-pole `star-radar` adding `Compact High-Field HTS Tokamaks` and `3D Stellarators`, the old binary-line midpoint **`Pursue both`** was left verbatim as spoke #2!
- Two concrete bugs result:
  1. **"Pursue both"** is grammatically broken on a 5-spoke radar (both of what?).
  2. **Taxonomy double-counting:** *Compact High-Field HTS Tokamaks* and *3D Stellarators* ARE magnetic confinement fusion (MCF) concepts — causing `mat-fusion` to rate MCF 85, Compact HTS 90, Stellarators 80, and `mat-energy-decarbonizer` to rate MCF 65, Compact HTS 95, Stellarators 85.
- **Surgical fix:** Relabel spoke #1 *Magnetic Confinement Fusion (MCF)* → *Large Public Tokamaks (ITER / DEMO)* and spoke #2 *Pursue both* → *Multi-Concept Portfolio Diversity* (or replace spoke #2 with *Alternative & Magneto-Inertial Concepts (FRC / Z-Pinch)* if Jason prefers 5 distinct physics tracks; relabeling spoke #2 to *Multi-Concept Portfolio Diversity* preserves all 16 existing ratings!).

#### `M-Ma3` (FIRM, wording contradiction — `"Fascinating Basic Physics Only"` on *Topological Qubits & Majorana Zero Modes* `xma0044`)
- Just like Theo `M-T2` (*Intrinsic Conceptual Justification ONLY*), pole #2 of `xma0044` is labeled **`Fascinating Basic Physics Only`**, yet its top champions rate BOTH pole #2 AND pole #3 (*Best Long-Term Hardware Protection*) positively:
  - `mat-crystal-grower`: **90** (*Basic Physics Only*) AND **55** (*Best Long-Term Hardware Protection*)
  - `mat-bell-labs`: **80** AND **50**
  - `mat-quantum`: **65** AND **75**
  - `mat-spintronics-ferroic`: **75** AND **45**
- **Surgical fix (label only, zero rating changes):** Drop `"Only"` → *Fascinating Basic Physics First* (or *Valuable Basic Condensed-Matter Physics*).
- *(Soft wording audit — 4 other `"Only"` / `"Strictly"` poles in Matter do NOT show direct rating contradictions, but worth noting for consistency: `xma0049` *Cryo-Logic Strictly for Quantum & Exascale*, `xma0050` *Niche RF Microwave Filters Only*, `xma0055` *Hydrogen Strictly for Hard-to-Abate Sectors*, `xma0066` *Equilibrium Ground-State Materials Only*.)*

#### `M-Ma4` (Soft flags — *Baseload* middle pole & *Expectations* `"Hype"`)
- **Double-extreme line ratings on *Baseload* (`xma0014`):** Five new archetypes (`mat-bell-labs` `[65,75,60]`, `mat-materials-genome` `[60,65,75]`, `mat-energy-decarbonizer` `[80,80,85]`, `mat-spintronics-ferroic` `[60,70,60]`, `mat-medical-physicist` `[60,70,65]`) rate `≥ 60` on BOTH endpoints (*Nuclear & fusion source* and *Distributed solar + storage*), because the middle pole is labeled *Centralized grid* (a grid topology) rather than a *Firm Clean + Renewables Hybrid Grid*.
- **Unchampioned pole (`max ≤ 25`):** `xma0011` (*Expectations*) has *Hype* at max **20** (`mat-pragmatist`, min **−85**) because "Hype" is a pejorative strawman rather than *Bold Visionary Moonshot Advocacy*.

---

## §4 Praxi (`praxicapades.json` — 72 topics, 13 samples)

**Samples (5 pre-existing + 8 new):**
- Pre-existing (5): `pra-bayesian`, `pra-frequentist`, `pra-first-principles`, `pra-simulation-first`, `pra-engineer`.
- New (8): `pra-breimanite` (Breimanite Predictive & Common-Task Empiricist), `pra-causal-architect` (Causal-Inference Architect), `pra-convex-control` (Convex Optimization & Control Strategist), `pra-complexity-risk` (Complexity, Fat-Tail & Societal-Risk Modeler), `pra-trial-methodologist` (Experimental-Design & Clinical-Trial Methodologist), `pra-game-or` (Game Theorist & Operations-Research Optimizer), `pra-info-signal` (Information Theorist & High-Dimensional Signal Analyst), `pra-prob-forecaster` (Spatial, Time-Series & Probabilistic Forecaster).

**Closest archetype pairs (mean |pole diff| across shared topics):**
1. `pra-convex-control` ↔ `pra-game-or`: **7.2** *(tightest pair across ALL FOUR skins!)*
2. `pra-causal-architect` ↔ `pra-trial-methodologist`: **8.8**
3. `pra-convex-control` ↔ `pra-info-signal`: **11.1**

### §4(a) Original 2026-11-26 Gap Pr1 — Status

- **Pr1 — *Significance testing* (`xpr0027`, upgraded to 5-pole `star-radar`) — CLOSED.** Adding *Tighten Threshold (p < 0.005)* and *Switch to Bayes Factors & Posteriors* cleanly separates `pra-frequentist` (90 gatekeeper / 75 tighten / −60 Bayes), `pra-bayesian` (95 Bayes / −30 gatekeeper), `pra-trial-methodologist` (85 useful / 70 tighten / 75 Bayes), and `pra-complexity-risk` (70 broken / 85 useful). Notably, Praxi now has **0 unchampioned poles** (`max ≤ 25`) across all 72 topics!
- **Inherited pre-existing unrated topics (not new):** The five original samples still leave 3 older topics unrated (`69/72`): *Social Working Style* (`xpr0023`), *Computational craft* (`xpr0024`), and *Interdisciplinary role* (`xpr0025`). All 8 new archetypes rate `72/72`.

### §4(b) Fresh Gaps Opened by Enriched Archetypes & Research

#### `G-P1` (BIGGEST PRAXI GAP — Fresh, New Topic) — *Multiple Testing & Selective Inference Discipline (FWER vs. FDR vs. Hierarchical Partial Pooling vs. Held-Out Validation)*
- **Why this is a real fault line:** Across modern applied statistics, biostatistics, genomics, and high-dimensional signal processing, **how you handle multiplicity and post-selection inference** is one of the sharpest daily fault lines — and NO topic in Praxi asks it (*Significance testing* `xpr0027` asks the single-test p-value debate; *Replication Crisis* `xpr0065` asks preregistration vs. exploratory science).
- **How the enriched archetypes split sharply:**
  - *Strict Family-Wise Error Rate (FWER / Bonferroni / Confirmatory Gatekeeping):* `pra-trial-methodologist` (FDA/ICH E9 confirmatory clinical trials), `pra-frequentist`.
  - *False Discovery Rate (Benjamini–Hochberg FDR) & Knockoffs / Selective Inference:* `pra-info-signal` (high-dimensional feature selection), `pra-causal-architect`.
  - *Hierarchical Bayesian Partial Pooling (Shrink Estimates Instead of Adjusting p-Values):* `pra-bayesian`, `pra-prob-forecaster`.
  - *Out-of-Sample Held-Out Validation / Common Task Error:* `pra-breimanite`, `pra-engineer`, `pra-simulation-first`.
- **Proposed topic:**
  - **Name:** *Multiple Testing & Selective Inference Discipline*
  - **Prompt:** *When testing hundreds or thousands of hypotheses or selecting features from data, how should false discoveries be controlled?*
  - **Geometry:** `diamond` (4 poles)
  - **Category:** *Uncertainty, Inference & Causal Reasoning* (next to *Significance testing*)
  - **Poles:**
    1. *Strict Family-Wise Error Control (FWER)*
    2. *False Discovery Rate & Selective Inference (FDR / Knockoffs)*
    3. *Hierarchical Bayesian Partial Pooling*
    4. *Held-Out Validation & Predictive Error*
  - **Citations:** Benjamini & Hochberg (1995), *Controlling the False Discovery Rate*; Gelman, Hill & Yajima (2012), *Why We (Usually) Don't Have to Worry About Multiple Comparisons*; Barber & Candès (2015), *Controlling the False Discovery Rate via Knockoffs*; ICH E9(R1) clinical-trial multiplicity guidelines.

#### `G-P2` (Fresh, New Topic) — *Computational Posterior & Likelihood Inference: Exact MCMC vs. Variational/Laplace Approximation vs. Likelihood-Free Simulation-Based Inference (SBI/ABC)*
- **Why this is a real fault line:** Praxi has *Statistics* (`xpr0015`, paradigm) and *Prior Philosophy* (`xpr0051`), but **ZERO topic on computational inference when posteriors or likelihoods are intractable** — a core day-to-day battleground among the enriched archetypes.
- **How the enriched archetypes split:**
  - *Exact Asymptotically Unbiased MCMC (HMC / NUTS):* `pra-bayesian`, `pra-trial-methodologist`.
  - *Fast Deterministic Approximation (Variational Inference / Laplace / INLA):* `pra-prob-forecaster` (INLA 95 on `xpr0047`), `pra-engineer`, `pra-breimanite`.
  - *Likelihood-Free Simulation-Based Inference (ABC / Neural Posterior Estimation):* `pra-simulation-first`, `pra-complexity-risk`.
- **Proposed topic:**
  - **Name:** *Intractable Posteriors: MCMC vs. Variational/Laplace vs. Simulation-Based Inference*
  - **Prompt:** *When an exact analytical posterior is intractable, which computational inference strategy should you trust?*
  - **Geometry:** `triangle` (3 poles)
  - **Category:** *Computation, Optimization & Control* (or *Uncertainty, Inference & Causal Reasoning*)
  - **Poles:**
    1. *Asymptotically Exact MCMC (HMC / NUTS)*
    2. *Fast Variational & Laplace / INLA Approximations*
    3. *Likelihood-Free Simulation-Based Inference (ABC / Neural SBI)*
  - **Citations:** Hoffman & Gelman (2014), *The No-U-Turn Sampler*; Blei, Kucukelbir & McAuliffe (2017), *Variational Inference: A Review for Statisticians*; Cranmer, Brehmer & Louppe (2020), *The Frontier of Simulation-Based Inference* (*PNAS*).

#### `G-P3` (Fresh, New Topic — Closest-Pair Separator across ALL 4 Skins!) — *Strategic Adaptive Agents vs. Fixed Plant Dynamics (Goodhart's Law & the Lucas Critique)*
- **Why this is a real fault line:** **`pra-convex-control` ↔ `pra-game-or` have a mean pole difference of only `7.2`** across all 72 topics — the closest pair in any of the four skins! Both love convex relaxations, mathematical guarantees, operations optimization, and *Optimal Decision & Control* (both rate 100 on `xpr0029`). What fundamentally separates a **control theorist** from a **game theorist / mechanism designer** is **whether the system you optimize reacts strategically to your policy**:
  - In classical/robust control (`pra-convex-control`, `pra-first-principles`), the plant obeys fixed (or bounded-disturbance) physical dynamics.
  - In mechanism design and strategic OR (`pra-game-or`, `pra-complexity-risk`), agents best-respond to your decision rule — triggering **Goodhart's Law / the Lucas Critique**, so incentive compatibility dominates plant stability.
  - Meanwhile in statistical/ML deployment (`pra-breimanite`, `pra-causal-architect`), performative prediction & distribution shift bridge the gap.
- **Proposed topic:**
  - **Name:** *Fixed Plant Dynamics vs. Strategic Adaptive Agents (Lucas Critique)*
  - **Prompt:** *When deploying an optimal policy or model, should you primarily model fixed physical/statistical dynamics, adversarial worst-case disturbances, or strategic agents who game your policy?*
  - **Geometry:** `triangle` (3 poles)
  - **Category:** *Computation, Optimization & Control* (next to *Rational Nash Equilibrium vs. Behavioral & Bounded-Rationality Modeling*)
  - **Poles:**
    1. *Fixed Physical Dynamics & Feedback Stability*
    2. *Adversarial & Distribution-Shift Robustness*
    3. *Strategic Incentive Compatibility (Beat Goodhart / Lucas)*
  - **Citations:** Lucas (1976), *Econometric Policy Evaluation: A Critique*; Goodhart (1975); Hurwicz / Maskin / Myerson Mechanism Design; Perdomo et al. (2020), *Performative Prediction*; Doyle, Francis & Tannenbaum (1992), *Feedback Control Theory*.

#### `G-P4` (Fresh, Secondary — Missing Pole on *Significance testing* `xpr0027`) — *"Replace with Effect Sizes & Estimation Intervals" (The New Statistics)*
- Flagged as an open candidate in `SEVEN-SKINS-ADDS-2026-11-27.md` §ADDS(b). Today *Significance testing* (`xpr0027`) is a 5-pole `star-radar`: *The standard (gatekeeper)*, *Broken (abandon it)*, *Useful but limited*, *Tighten Threshold (p < 0.005)*, and *Switch to Bayes Factors & Posteriors*. Cumming's **"New Statistics"** (abandon dichotomous hypothesis testing in favor of **effect sizes + confidence/compatibility intervals**) is distinct from both *Useful but limited* (retains p-values) and *Switch to Bayes Factors* (still hypothesis-testing / Bayes-factor framing). Expanding `xpr0027` to a 6-pole `star-radar` adding *Effect Sizes & Estimation Intervals* gives `pra-causal-architect`, `pra-trial-methodologist`, and `pra-prob-forecaster` their exact estimation-first voice. Secondary priority.
- **Citations:** Cumming (2014), *The New Statistics: Why and How*; Amrhein, Greenland & McShane (2019), *Scientists Rise Up Against Statistical Significance* (*Nature*).

### §4(c) Downstream of Conflict Rulings (Praxi — 4 conflicts; re-open ONLY on Jason's word)

- **`C-P1` (Minor / mitigated — Conflict #2, *Modeling goal* `xpr0021`):** Jason kept the skin's `trilinear-line` (*Mechanistic Understanding* | *Understanding through prediction* | *Predictive Supremacy*) over Gemini's independent `linear-sliders` (*Explain vs. Predict*, Shmueli 2010). Because Praxi ALSO gained *Purpose of Modeling Compass* (`xpr0029`, `diamond` with independent spokes for *Accurate Out-of-Sample Forecast*, *Mechanistic Insight & Explanation*, *Optimal Decision & Control*, *Stress-Testing*), the orthogonal space is already well-covered (`pra-prob-forecaster` rates 100 Forecast / 65 Mechanistic on `xpr0029` while rating `[35, 90, 85]` on `xpr0021`). **No urgent reopen needed — re-open only on Jason's word.**
- Conflicts #1 (*The Computational Architecture Quartet*), #3 (*Model complexity*), and #4 (*Statistics*) were resolved cleanly (aside from the `"Both toolkits"` label cleanup in `M-P3` below).

### §4(d) Misstatements, Mechanical Audits & Soft Flags (Praxi)

#### `M-P1` (FIRM, mechanical — 8 pre-existing exact-Fraction receptivity mismatches in `pra-simulation-first`, openness `0.70`)
- All 12 other samples (including all 8 new archetypes) have **0** receptivity mismatches.
- `pra-simulation-first` (`openness = 0.70`) carries **8 pre-existing** float-rounding mismatches (`85 * 0.70 = 59.5` → `59` vs. exact `60`):
  - `xpr0006` (*The Computational Architecture Quartet*): `neural-operators-ai-surrogates` + `intensity` (`adv=85, stored=59, exact=60`).
  - `xpr0016` (*Data*): `big-data` + `intensity` (`adv=85, stored=59, exact=60`).
  - `xpr0018` (*Values*): `effectiveness` + `intensity` (`adv=85, stored=59, exact=60`).
  - `xpr0021` (*Modeling goal*): `predictive-supremacy` + `intensity` (`adv=85, stored=59, exact=60`).

#### `M-P2` (FIRM, wording contradictions — `"Only"` pole labels on `xpr0036` and `xpr0068`)
Same pattern as Theo `M-T2` (*Intrinsic Conceptual Justification ONLY*) — two Praxi poles use `"Only"` while their top champions simultaneously endorse the neighboring pole at 80–90:
1. ***Convex Guarantees vs. Non-Convex Empirical Power* (`xpr0036`, pole #1):** Labeled **`Formulate Convex Problems Only`**, yet its top four champions all rate pole #2 (*Convex Relaxations + Local Refinement*) **80–85**: `pra-convex-control` (`95 / 80`), `pra-game-or` (`85 / 85`), `pra-info-signal` (`85 / 85`), `pra-first-principles` (`75 / 80`). **Fix (label only):** Drop `"Only"` → *Formulate Convex Problems First*.
2. ***Open Benchmark Competitions vs. Real-World Deployment Validation* (`xpr0068`, pole #3):** Labeled **`Live Deployment & Decision Outcomes Only`**, yet its top four champions all rate pole #2 (*Rotating Blind & Real-World Audits*) **85–90**: `pra-complexity-risk` (`85 / 95`), `pra-trial-methodologist` (`85 / 90`), `pra-engineer` (`85 / 90`), `pra-causal-architect` (`90 / 85`). **Fix (label only):** Drop `"Only"` → *Live Deployment & Decision Outcomes First*.

#### `M-P3` (FIRM, label artifact — `"Both toolkits"` on 4-pole *Statistics* diamond `xpr0015`)
- When Conflict #4 upgraded *Statistics* (`xpr0015`) from a 3-pole line to a 4-pole `diamond` adding *Pure Likelihood*, the old binary-line midpoint **`Both toolkits`** remained verbatim alongside *Bayesian Updating*, *Frequentist / Objective Likelihood*, and *Pure Likelihood*. "Both toolkits" is grammatically a 2-paradigm artifact on a 3-paradigm diamond.
- **Surgical fix (label only, zero rating changes):** Rename *Both toolkits* → *Pragmatic Pluralism*.

#### `M-P4` (Soft flag — *Spatial Statistics & Geostatistics* `xpr0047` double-extreme line)
- On *Spatial Statistics & Geostatistics: Kriging/GPs vs. SPDE Mesh Models* (`xpr0047`, `trilinear-line`), **8 of 13** archetypes rate `≥ 60` on BOTH endpoints (`exact-gp-kriging` and `spde-inla-meshes`), led by `pra-prob-forecaster` at `[70, 95, 95]`. Exact GPs (small-$N$) and SPDE/INLA (large-$N$ Markovian Matérn fields) are regime-complementary rather than opposing philosophies; a `triangle` or `linear-sliders` fits cleanly if revisited.

---

## §5 Cross-Cutting Action Matrix (Proposed Next Queue Items)

Organized cleanly by class so Jason can approve/rule each bucket independently (mirroring items 38–40 for Chem/Exper/Theo):

### Bucket A — Firm Misstatements & Mechanical Fixes (Zero Conflict Rulings Touched)
1. **Quanta `M-Q1` (mechanical):** Fix the **21 signed-intensity cells** (`42` stored values across 10 samples) to match Quanta's signed largest-`|value|` convention (or confirm global intensity sign law first). Optional cleanup: `M-Q3` drop `"Only"` on `xqu0057`.
2. **Simul `M-S1` + `M-S2` (mechanical + substantive — HIGHEST PRIORITY):**
   - Fix **45** `sim-pragmatist` (`openness = 0.70`) exact-`Fraction` receptivity cells (`4` pre-existing + `41` new).
   - **Un-stamp `xsi0030`–`xsi0035` (S1–S6):** replace the 10/10 copy-pasted boilerplate vectors across all 10 new archetypes with genuine archetype-specific ratings consistent with *Predictability* (`xsi0011`) and each archetype's `about`.
3. **Matter `M-Ma1` + `M-Ma2` + `M-Ma3` (mechanical + labels):**
   - Fix **4** pre-existing `mat-pragmatist` exact-`Fraction` receptivity cells (`xma0016`, `xma0028`).
   - Fix *Fusion* (`xma0013`) spoke #1 (`Large Public Tokamaks (ITER / DEMO)`) and spoke #2 (`Multi-Concept Portfolio Diversity`, replacing `"Pursue both"`).
   - Drop `"Only"` on `xma0044` (*Fascinating Basic Physics First*).
4. **Praxi `M-P1` + `M-P2` + `M-P3` (mechanical + labels):**
   - Fix **8** pre-existing `pra-simulation-first` exact-`Fraction` receptivity cells (`xpr0006`, `xpr0016`, `xpr0018`, `xpr0021`).
   - Drop `"Only"` on `xpr0036` (*Formulate Convex Problems First*) and `xpr0068` (*Live Deployment & Decision Outcomes First*).
   - Rename `"Both toolkits"` → *Pragmatic Pluralism* on `xpr0015` (*Statistics*).

### Bucket B — Fresh Gaps (Primary Candidates for Build Queue)
- **Quanta (3 primary + 1 secondary):** `G-Q1` *Ontology of Quantum Field Theory* (`diamond`, BIGGEST Quanta gap), `G-Q2` *Carving Out UV Physics: Explicit Models vs. Bootstrap Axioms* (`triangle`), `G-Q3` *Cosmological Initial Conditions & the Measure Problem* (`diamond`); secondary `G-Q4` heterodox modified-gravity / superdeterminist champion.
- **Simul (4 primary):** `G-S1` add *Agnostic / Metaphysically Irrelevant* pole to *Are we living in a computer simulation?* (`xsi0030` → `diamond`, fixes `M-S3`), `G-S2` *Commercial Certified Suites vs. Open Community Flagships vs. Bespoke Codes* (`triangle`), `G-S3` *ML Surrogate Out-of-Distribution Guardrails* (`diamond`), `G-S4` *Forward Exploration vs. Adjoint Inverse Design* (`triangle`).
- **Matter (3 primary):** `G-Ma2` *Autonomous Self-Driving Labs vs. Artisanal Synthesis Craft* (`trilinear-line`, BIGGEST fresh Matter gap), `G-Ma3` *Advanced 3D Packaging & Chiplets* (new pole on `xma0022` or companion topic), `G-Ma4` *Nuclear Fission Architecture: Gen-III+ vs. SMRs vs. Gen-IV Breeders* (`triangle`).
- **Praxi (3 primary + 1 secondary):** `G-P1` *Multiple Testing & Selective Inference Discipline* (`diamond`, BIGGEST Praxi gap), `G-P2` *Intractable Posteriors: MCMC vs. Variational/Laplace vs. SBI* (`triangle`), `G-P3` *Fixed Plant Dynamics vs. Strategic Adaptive Agents (Lucas Critique)* (`triangle`, separates `pra-convex-control` ↔ `pra-game-or` at 7.2 diff); secondary `G-P4` add *Effect Sizes & Estimation Intervals* spoke to *Significance testing* (`xpr0027` → 6-pole radar).

### Bucket C — Downstream of Conflict Rulings (Re-Open ONLY on Jason's Word)
- **Matter `G-Ma1` (MAJOR — supersedes Conflict #3):** Expand *Quantum Computing Hardware* (`xma0008`) from 5-pole to 6-pole `star-radar`, splitting *Photonic & Silicon Spin Qubits* into *Photonic Quantum Computing* and *Silicon Spin Qubits*.
- **Quanta `C-Q1` (secondary — Conflict #7, *Beauty*):** Keep unless Jason wants explicit Hossenfelder "beauty misleads" 3-pole framing.
- **Praxi `C-P1` (minor/mitigated — Conflict #2, *Modeling goal*):** Keep unless Jason wants Shmueli's orthogonal 2-slider alongside `xpr0029`.
