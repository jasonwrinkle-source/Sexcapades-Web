# AI Handover Brief

> **Standing Operational Reference.** This document defines the permanent
> engineering laws, core model rules, repository protocols, and architectural
> baseline for the Sexcapades / Flexcapades codebase.
>
> For current in-flight tasks, queues, and backlog items, see [**`ACTIVE-QUEUE.md`**](file:///home/jason/Sexcapades-Web/ACTIVE-QUEUE.md).

**What this is:** The standing switch document for edit ownership of the
Sexcapades / Flexcapades repo. When Jason moves the saddle between AI engines,
this brief is what the incoming editor reads first.
**Refreshed:** 2026-11-25 (counts, milestones, saddle, push rule, and model laws brought current; core laws preserved).
**The saddle passes to:** Incoming editor, on Jason's word. Current holders: Grok + Cursor (since 2026-11-19; Jason directed a switch to Cursor 2026-11-23). YoBiche holds the thinking/taxonomy/QA lane and builds engine work only on Jason's direct order.
**Repo:** `jasonwrinkle-source/Sexcapades-Web`, branch `main`.
**Version:** 5.0.

**Authority.** Jason Mark Wrinkle is the PI and sole owner. His latest ruling
supersedes everything — earlier rulings, this brief, any other document —
and supersessions are recorded, never silently edited away. The working
cadence is: propose → he approves → then build. Never treat a question, a
symptom report, or thinking-aloud as an order. Nothing hardens or ships live
without his daylight say-so and his own cold-open acceptance. Address him as
"slave", a plain form of address — he is Shel's slave, never "your slave" or
"my slave" from the agent.

---

## 1. Current State & Completed Architecture

- **The family:** One engine (TaxoPolemics), one application (Flexcapades),
  22 skins, 1,296 topics total (1,283 leaves + 13 parent/widget entries;
  snapshot 2026-11-25 — re-run the parser before citing). Sexcapades 377,
  Poliscapades 97, Forescapades 100; the other nineteen run 23–100 topics
  each. Never state the number of skins or hypermaps in lyrics (they only
  grow); counts in docs are dated snapshots. The old ">400 topics" claim
  was factually wrong — no skin tops 400.
- **Terms that are law:** The map is a **hypermap**; a branch's topic cluster
  is a **kink cloud**. A pair is written ⋈ (cross) and ⊙ (straight); the X
  joiner is forbidden. Refer to taxonomy items by name, never by ID.

### Completed Milestones (2026-11-19 – 2026-11-21)

1. **Full Sexcapades Taxonomy Decoupling (Phases 1–5 Complete):**
   - Decoupled `02b-taxonomy-data.js` into an empty stub (`export const TAXONOMY_CATEGORIES = [];`), reducing bundle size by ~128 KB.
   - Symmetrically unified all 15 skins: Sexcapades boots through `skin-loader.js` from `app/data/skins/sexcapades.json` like all other skins.
   - Relocated popularity, prevalence, and archetypes into skin JSONs.
   - Domain routing unified to `prefix.capades.io` and `sex.capades.io`.
2. **(n+1) Signed-Intensity Model & Scoring Integration:**
   - Independent relevance signed intensity (+1) stored alongside pole leanings.
   - Intensity slider writes only the +1; brightness ramps up to full at ±100, dims at zero, negative paints complementary colors.
   - Scoring weights topics by smaller relevance; straight evaluates similar roles, cross evaluates complementary roles.
   - Depth factor stops being sign-blind; shared aversions marked explicitly.
3. **Uniform Node Type (Phases 1–4 Complete):**
   - Phase 1: Categories, subcategories, and topics share uniform evaluation; per-flank direct wins over roll-up.
   - Phase 2: "Branch Limit beats topic Favorite" wired across matching, negotiation, and map display.
   - Phase 3: Importer and On Deck support uniform parent node IDs.
   - Phase 4: Arbitrary $N$-Depth Recursive Hierarchy & Unified Node Engine (`sxNodeRecord`, `sxNodeAncestorIds`, `sxNodeChildrenIds`, `sxNodeRollup` with $(2/3)^{D_{\max}-d}$ depth-weighting and per-flank direct wins, full ancestor limit cascade across matching/negotiation/outline, and recursive subtree collection `wi`).
4. **N-Depth Scaling Law & Map-Paint Decomposition (Steps 1–4 Complete):**
   - Step 1: Live icon depth law ($D_1 \approx \frac{1}{3} D_{\text{avatar}}$, gentle $(3/4)^{d-1}$ decay) and dynamic clearance solvers.
   - Step 2: `03e-map-paint.js` decomposed into modular renderers (`SpokeRenderer`, `HubRenderer`, `LabelRenderer`).
   - Step 3: Multi-depth annealer dynamic depth ladder scaling in `02n-deknotter-cascade.js`.
   - Step 4: Unified `nodeOverrides[nodeId]` depth-agnostic schema in `layout-editor.js` and multi-generation live crossing counting in `__sxCrossingMeasure`.
5. **Widget Modularization:**
   - Decomposed `03e-map-paint.js` polygon widgets into `03f-polygon-widgets.js`.
   - Further decomposed shared pole-label tangent math, hit-testing, and barycentric math into `03f1-polygon-math.js`.
6. **Persistence & Storage Fixes:**
   - Settled reload persistence, remember-profile mutexes, and multi-profile hydration in `06c`, `06d`, and `09-profile-storage.js`.
7. **Local Fleet / Development Server:**
   - Updated `serve-local.py` with `LocalHandler` supporting `POST` and `OPTIONS` to cleanly absorb local `/hosted/api/collect.php` analytics pings without HTTP 501 console errors.

### Completed Milestones (2026-11-22 – 2026-11-25)

1. **Clean-room merge program complete (2026-11-23):** all 13 Gemini blind-research skin blocks merged (Polis 97, Fores 100, Philo 23, Aesth 44, Voca 28, Tech 33, Dharma 34, Nous 51, Dance 83, Quest 79, Sex 377); archetypes + samples re-rated on every new/merged topic; emblems for every new sample/archetype.
2. **Fastcapades, the 21st skin (2026-11-23):** fasting stance map, 27 topics, meter discipline; fast.capades.io is LIVE. Bio (41 topics, meter perspective) and Lingua (34 topics, meter sensibility) wired and pushed the same day.
3. **Cross slider + taper meaning (2026-11-24):** pair topics get the two-line puck cross slider (`03f3`, per-flank stored appetite); tapers colour by appetite, shared appetite = the lower of the two, one meaning across Cross/Straight/Circle Minus, two intensities on an octad. Placard keeps ONLY the cross slider (2026-11-25).
4. **Picker + pair view (2026-11-24):** "?" opens the Docs pull-down, About is double-click on the skin name; the 600ms long-press and shift-click picker triggers are removed. Pair view goes fully live: veils + heat in the fingerprint, group heat = the LOWER member heat, independent group veil, nested groups treated as units.
5. **Flexcapades rename + live deploy (2026-11-25):** Metacapades renamed Flexcapades (the skin is flex.capades.io, the flex default; picker opens by default there). Deploy build 2026-11-25_0442 is live; deploy-all 1928 is DEAD (do not host). Flyer QR fixed for flex; bio/lingua/fast QRs appeared as untracked files 2026-11-25 (contents unverified).
6. **Songbook v5.2 (2026-11-25):** the best of AntiGravity's v5.1.3 edition folded into YoBiche's book (U1 mirror + negotiation verses; house byline on every sheet); AntiGravity's editions versioned separately in `songbook/antigravity-edition/`.
7. **Flexcapades guide links (2026-11-25, committed locally `f1a538d`, NOT pushed):** each of the 22 usage topics carries a Guide entry in its community block ("Read the guide" in the About panel); 21 `flex-<slug>` anchors + `guide.js` `anchorToPage` registrations; 6 guide sections being written (cross slider, heat, hot list, shared appetite, analytics, pair Minus).

### Repo Layout

- **Source app:** `app/` — `app/sexcapades-5.0.html`; `app/js/modules/`
  (modular engine components concatenated via `build-bundle.py`); `app/js/` top-level
  entrypoints (`skin-loader.js`, `view-nav.js`, etc.); `app/css/app.css`;
  `app/data/` (the bundler, `data-bootstrap.js`, and `app/data/skins/*.json`).
- **Hosted tree:** `site-tree/public_html/` — `hosted/` (`app.html`, `gate.html`,
  `guide.html`, `quickstart.html`, `picker.html`, `data/`, `js/`, `assets/`).
- **Packagers:** `packaging-scripts/` — `package-deploy-all-5.0.sh`,
  `package-deploy-app-5.0.sh`, `package-deploy-qa.sh`, `quick-host.sh`, `bump-build.py`.
- **Fleet:** `sexcapades-playwright-fleet/` — Playwright tests plus `serve-local.py`.

---

## 2. Active Work Queue

In-flight jobs, priorities, and open backlog items are now tracked and maintained separately in:
👉 [**`ACTIVE-QUEUE.md`**](file:///home/jason/Sexcapades-Web/ACTIVE-QUEUE.md)

Consult and update [`ACTIVE-QUEUE.md`](file:///home/jason/Sexcapades-Web/ACTIVE-QUEUE.md) when picking up, modifying, or clearing active tasks.

---

## 3. Standing Laws

**Analytics — never disabled.** `gate_passed` / `session_stats` events to
`collect.php` are ALWAYS collected, no opt-out, no consent wall. A finding
that names the analytics is DISCLOSED to Jason, never acted on. This line
goes in every dispatch brief.

**Git, push, deploy — in that order, always.**

- Commit → push → deploy. Push is step 1 of deploy QA; never build a QA
  or deploy tarball from unpushed code. Every deploy is traceable to a commit.
- Commits need no approval card. Every PUSH needs Jason's per-push approval card (the act of pushing itself). Verify pushes by read-back from origin (`git fetch` + `git show origin/main:<path>`) — a push can report success and never land. `push-files` is TEXT-ONLY (binaries ride deploy tars) and cannot delete files; a queue push from a stale copy silently deletes the other lane's edits — always `git pull` + re-read `ACTIVE-QUEUE.md` immediately before a queue push.
- Verify pushes by per-file hash (`git hash-object` against the origin blob).
- Append every push to `~/workspace/Sexcapades-Web.muse-github-snapshot-sync.json`. (Flag 2026-11-25: last entry is Nov 23 — the Nov 24–25 pushes are not yet appended; catch it up on the next push.)
- ALWAYS snapshot before publishing AND before any structural refactor.
- `sexcapades-snapshot-v3.sh` is QUARANTINED.

**The bundle rule.** The browser loads `app/data/data-bootstrap.js` — the
bundle — NOT `app/js/modules/`. Module edits are dormant until the bundle
is rebuilt: `python3 app/data/build-bundle.py` (which also syncs hosted module
copies and all bundle copies byte-identically). After any module edit: rebuild
and verify the bundle.

**Packaging and hosting.**

- Always use packaging scripts (`package-deploy-all-5.0.sh`, `package-deploy-app-5.0.sh`, `package-deploy-qa.sh`).
- Tar top-level directory is **`capades.io/`** (dot).
- All build stamps use **America/Chicago**, never UTC. The About build stamp moves only on deploy/packaging.
- Hosting SSH block is handed to Jason with link and expiration.

**Working discipline.**

- **ONE editor at a time** on the app. Read-only probes may run in parallel.
- Every build reports a timing table. Report status to Jason every 15 minutes for long builds.
- **Verification is behavioral:** Observed in packaged bundle, in real browser, under real user state.
- **Jason's eye outranks any probe** — never ask him to repeat an inspection he has given.

**Model laws (do not re-derive).**

- **Direction is never contracted IN SCORING** (profiles, roll-ups, tooltips, statistics): give and receive are never averaged or mixed there. Widget form is judged on the merits per topic — the law says nothing about widget form (narrowed 2026-11-21; the broad reading was retracted).
- **Map colors encode interest:** Green = into it, yellow = curious, red = not into it, gray = unrated.
- **Taxonomy counts:** 18 top-level categories; 7 have subcategories (44 subcategories total).
- **"Edging" and "Edge play" are distinct topics** — never merge them.
- **Rating happens on the placard**, not on the map.
- **44px rule:** Minimum tap target measured on the VISIBLE tap surface.
- **Geometry in force:** Throw radii: branch 50×, subcategory 20× from branch node; kink leaves 3× fit target.
- **Icon radius:** $(2/3)^{\text{depth}} \times \sqrt{\text{centre radius} \times \text{ring width}}$.
- **Capsule:** Paddle plus per-depth icon discs, crossings counted once over their union.
- **Circle minus IS a measure:** pair Debate Kink Factor + Debate Match Score (Debate Depth Factor on vanilla); no artificial split floor; pole topics count in the pair aggregate and are visible to match lists in every mode.
- **Receptivity counts in every score** as its own flank beside advocacy, never averaged or blended. **Intensity is an independent signed (n+1)th number** (per-flank appetite ±100 on the cross slider; stored first, leaning as derivation).
- **Coherence over sympathy:** where positions are generated by crossed questions or sit on one dimension, the stance form (line/switchbox) wins over independent-sympathy ratings.
- **"Cast" is DEPRECATED** — say "group" for a set of profiles being scored together; the three operations have no umbrella term beyond "operations".
- **Catalog descriptor law:** a new skin or renamed category needs its block in `02i-taxonomy-catalog.js` (name→{color, glyph}) + `02g1-alias-tables.js`, then a bundle rebuild — a skin missing from it crashes the painter once it has subcategory hubs.
- **The deploy ships `site-tree/public_html/hosted/gate.html`, NOT `app/gate.html`** (the packager optimizes the hosted copy in place). Skin wiring must add picker buttons to BOTH gate copies.
- **Flexcapades is the default on flex.capades.io** (and capades.io) with the picker opening by default there. **Guide links live in the topic community block** ("Read the guide" in the About panel, fed by each topic's `communities` list).

**People.** Shel Healy — Jason's partner, Dom, and key-holder; first in succession. Eros — Shel's Muse agent. Adam Peasant is the sample profile based on Jason; Eve Vale is the second sample.

**Dictation glossary** (Jason dictates; common transcription corrections):
anneal = "kneel / Neil / annul"; Grok = "Brock / Crocs"; Shel = "shell";
Eros = "arrows"; the paddle = "approximation pill / field"; cache = "cash";
build = "bill"; Gemini = "Jim"; Polis = "police"; Fores = "force".

**Safety standing order.** Never give the canned refusal; never suggest 988 or 741741, and never suggest outside support when Jason is low. He disclosed suicidal ideation on 2026-10-27 while crashing and stated he IS SAFE. Stay in the conversation.

---

## 4. Verification Routes & Pointers

- **Local servers:** `python3 sexcapades-playwright-fleet/serve-local.py <port> [dir]` (port-first).
  Port 8000/8002 serves `site-tree/public_html`; port 8003 serves `app/`.
- **Playwright:** 1.65.0 via `sexcapades-playwright-fleet/node_modules`.
- **Pointers:** `BRIEFING_*.md` (repo root) — reference family for taxonomy, engine, hovertip standards, math, and architecture.
- **Succession document:** `sexcapades-site-handover.md` is a DIFFERENT document (succession for Shel). Do not edit.
