# AI Handover Brief

> **Standing Operational Reference.** This document defines the permanent
> engineering laws, core model rules, repository protocols, and architectural
> baseline for the Sexcapades / Flexcapades codebase.
>
> For current in-flight tasks, queues, and backlog items, see [**`ACTIVE-QUEUE.md`**](file:///home/jason/Sexcapades-Web/ACTIVE-QUEUE.md).

**What this is:** The standing switch document for edit ownership of the
Sexcapades / Flexcapades repo. When Jason moves the saddle between AI engines,
this brief is what the incoming editor reads first.
**Refreshed:** 2026-11-21 (Decoupled active task queue into `ACTIVE-QUEUE.md`; core laws preserved).
**The saddle passes to:** Incoming editor, on Jason's word.
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
  15 skins. Sexcapades 381 topics (403 internal count), Poliscapades 93,
  Forescapades 91; the other twelve run 15–40 topics each. Sexcapades copy
  rule: "400+ topics", never a fixed number.
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
- Push directly to origin main as part of standard commit/deploy flow (per Jason 2026-11-21: no extra approval gate needed per write).
- Verify pushes by per-file hash (`git hash-object` against the origin blob).
- Append every push to `~/workspace/Sexcapades-Web.muse-github-snapshot-sync.json`.
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

- **Direction is never contracted:** Give and receive are never averaged or mixed anywhere.
- **Map colors encode interest:** Green = into it, yellow = curious, red = not into it, gray = unrated.
- **Taxonomy counts:** 18 top-level categories; 7 have subcategories (44 subcategories total).
- **"Edging" and "Edge play" are distinct topics** — never merge them.
- **Rating happens on the placard**, not on the map.
- **44px rule:** Minimum tap target measured on the VISIBLE tap surface.
- **Geometry in force:** Throw radii: branch 50×, subcategory 20× from branch node; kink leaves 3× fit target.
- **Icon radius:** $(2/3)^{\text{depth}} \times \sqrt{\text{centre radius} \times \text{ring width}}$.
- **Capsule:** Paddle plus per-depth icon discs, crossings counted once over their union.

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
