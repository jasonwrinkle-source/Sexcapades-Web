# AI Handover Brief — refreshed 2026-11-19

**What this is:** the standing switch document for edit ownership of the
Sexcapades / Flexcapades repo. When Jason moves the saddle between AI engines,
this brief is what the incoming editor reads first.
**Refreshed:** 2026-11-19 by YoBiche (Yolanda Biche, Muse), who held edit
ownership from 2026-11-15.
**The saddle passes to:** Grok and Cursor, on Jason's word.
**Repo:** `jasonwrinkle-source/Sexcapades-Web`, branch `main`.
**Remote head:** `c8e56f8e`. **Live build:** deploy-all `2026-11-19_1524`.
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

## 1. Current state (2026-11-19)

- **Live:** deploy-all `2026-11-19_1524`, hosted by Jason and curl-verified:
  the Sexcapades app, the Dharma gate, and the Fores app all serve Build
  2026-11-19_1524. Production app: `/hosted/app.html`.
- **Git:** origin/main `c8e56f8e`; the snapshot sync record
  (`~/workspace/Sexcapades-Web.muse-github-snapshot-sync.json`) holds 301
  entries. The VM working tree's local HEAD lags the remote — connector
  pushes don't move it. Read §4 before trusting any local git state.
- **The family:** one engine (TaxoPolemics), one application (Flexcapades),
  15 skins. Sexcapades 381 topics, Poliscapades 93, Forescapades 91; the
  other twelve run 15–40 topics each. Sexcapades copy rule: "400+ topics",
  never a fixed number.
- **Terms that are law:** the map is a **hypermap**; a branch's topic cluster
  is a **kink cloud**. A pair is written ⋈ (cross) and ⊙ (straight); the X
  joiner is forbidden. Refer to taxonomy items by name, never by ID.

**Shipped today (2026-11-19, all in the live build):**

1. **Widget label/hovertip fixes, regular N-gons, horizontal rainbow.** Hot
   List pole labels wrap in full instead of truncating; the doubled hovertip
   (the app's shared popup plus the browser's native title writing over it)
   is gone — native titles removed, poles carry the shared tip. The triad
   renders as a true equilateral (the polygon widgets are regular N-gons),
   and the widget popup's horizontal intensity rainbow runs along the
   slider, red at the extreme low end to green at the extreme positive end.
2. **Decoupling + signed-intensity pass — draw only.** On every n-pole
   widget the shape now shows proportions only: sweeping intensity no
   longer moves the puck or resizes the shape, and negative intensity is
   selectable and stored with its sign. This is the halfway house that
   Job 1 (§2) completes.
3. **PDF wash-out fix (one line).** The PDF exporter's style pass was
   stamping an inherited `visibility:hidden` onto nearly every map element,
   so PDF exports came out as faint specks on white. Fixed and verified end
   to end (dark page, full coloured map). Records:
   `~/workspace/scratch/pdf-washed-out/REPORT.md` and `REPORT-fix.md`.
4. **Export framing fix.** PNG/PDF exports framed a phantom box ~22× too
   wide (the centre photo was being mismeasured); exports now fill the
   frame.

**Repo layout (condensed):**

- **Source app:** `app/` — `app/sexcapades-5.0.html`; `app/js/modules/`
  (solver, paint, profile, and scoring code — dormant until bundled, §4);
  `app/js/` top-level files (loaded directly); `app/css/app.css`;
  `app/data/` (the bundler, the bundle, and the skin JSONs under
  `app/data/skins/`).
- **Hosted tree (tracked packaging output):** `site-tree/public_html/` —
  `hosted/` (app.html, gate.html, guide.html, quickstart.html, data/, js/,
  assets/) plus the static pages beside it. `site-tree/public_html/qa` is
  an untracked symlink to `hosted`; the QA tree is not in git.
- **Packagers:** `packaging-scripts/` — `package-deploy-all-5.0.sh`,
  `package-deploy-app-5.0.sh`, `package-deploy-qa.sh`, `bump-build.py`.
- **Fleet:** `sexcapades-playwright-fleet/` — Playwright tests plus
  `serve-local.py`. Jason runs the fleet; the agent commands it.

---

## 2. JOB 1 — the (n+1) intensity build (do this first)

Jason ruled on 2026-11-19 that this job goes FIRST, ahead of everything
in §3.

### The model (Jason's ruling, 2026-11-19)

Intensity is an **independent (n+1)th number**. For an n-pole topic, the n
stored pole values are the **leanings** — the blend. The +1 number is
**relevance**: how much one cares about the topic. It is signed: **negative
intensity means aversion to the issue** — the proportions still describe
the blend; the sign says the rater stands against the topic as a whole.
Intensity is NOT a function of the pole values.

### Where today's build stands (the halfway house)

The decoupling pass (live in 1524) decoupled the **draw** only — proven by
sweep tests: on every n-pole family (triad, tetrad/diamond, quad-compass,
the star/hexad/heptad/octad radars, and the on-map tags; the xy-switchbox
has no intensity dimension and is checked-clean), the shape holds still
across intensity sweeps including sign flips, and shapes restore correctly
from zero and from negative values. But underneath, intensity is still
**derived** from the pole values — radar/tetrad: the strongest pole with
its sign; triad: sign-of-sum × |sum|; compass: signed sum — and the
intensity slider **rescales the stored pole values** by ratio, flipping
every pole when the sign flips. Warts that fall out of deriving: a triad's
derived intensity can reach ±300 while a radar's caps at ±100, so the same
slider number means different things per family; a mixed-sign vector like
[−80, +40] reports −80 (the strongest pole's sign wins). Full record:
`~/workspace/scratch/widget-build/REPORT-decouple.md`; the original spec
note: `~/workspace/scratch/widget-build/NEXT-decoupled-draw.md`.

### The build

1. **Store the +1** as its own number alongside the pole values in every
   n-pole topic rating. Seed every existing profile's +1 from today's
   derived value (per family, as derived above), so no rating anyone has
   made is lost or silently changes meaning on migration.
2. **The intensity slider edits ONLY the +1.** It never rescales, flips,
   or otherwise touches the pole values. The shape keeps drawing from the
   leanings alone (already true after the decoupling pass).
3. **Display (ruled 2026-11-19):** intensity shows as **brightness** —
   ramping up to maximum brightness at full positive, dimming down to
   don't-care at zero, and into the **complementary colors** for negative
   intensities.
4. **Scoring: STOP — proposal first.** Do not build the scoring side until
   Jason has approved the written proposal below.

### The scoring proposal owed to Jason (before any scoring build)

A short written proposal, in plain language, covering all five points:

1. **How the +1 weights match agreement.** Today agreement = 100 − (mean
   |A−B| over the poles) ÷ 2, and Depth Factor intensity = √(strongest A ×
   strongest B) ÷ 100 computed from the pole values. Under the (n+1) model,
   what should relevance do — weight a topic's contribution, gate it, scale
   it? Propose; don't assume.
2. **The Cross/Straight collapse for end poles.** A code trace
   (2026-11-19, `~/workspace/scratch/widget-build/TRACE-cross-vs-straight.md`)
   proved that for n-pole topics the two registers have collapsed into one
   meaning: both return the same agreement, the crossed fits are explicitly
   null, and no pole is ever crossed against a different pole. Straight
   kept its intended meaning — shared ground, *an interesting conversation
   could be had*. Cross lost its own — it is meant to show *a communion
   would be pleasant*: Play on Sexcapades, living/working/being together
   on the other maps (several hypermaps are vocational or academic).
   Worked example from the trace: Bull / Hotwife / Cuckold, [80, 10, 30]
   against [20, 70, 60] → agreement 0.75, intensity ≈ 0.748, identical
   entries in both registers. Restoring a crossed quantity for pole
   vectors is a design decision for Jason, not a bug fix.
3. **The sign fork.** Jason's idea (2026-11-19, tentative): let the pole
   numbers go negative themselves — positive = giving of that pole,
   negative = receiving — which would restore a give/receive cross for
   pole topics pole-by-pole. His own objection, raised in the same breath:
   it goes against negative meaning aversion; one sign can't carry both.
   The fork to put to him: aversion lives ONLY on the +1 sign (freeing the
   pole signs for give/receive), or the pole signs keep aversion and
   give/receive stays with the slider topics. Note also that the
   give/receive reading is native to Sexcapades and strained on belief and
   vocational maps, so per-skin semantics may be the shape of any answer.
4. **The sign-blind Depth Factor.** Depth Factor intensity uses absolute
   values, so two people who share an aversion score exactly like two who
   share an enthusiasm (identically averse vectors: agreement 1.0 at full
   intensity). Under the (n+1) model, where aversion has its own signed
   number, is that still the intent? Put it to him with the numbers.
5. **The lists gap.** Pole topics never appear in the match/curious lists
   in either register (they do appear in the Scribe pair-detail lists and
   in all four headline aggregates), and in group casts of three or more
   their factor entries come out 0 in both registers. The proposal should
   say what changes, if anything.

---

## 3. The queue after Job 1

Each item waits for Jason's kickoff; nothing here dispatches itself.

1. **Inline n-pole widgets in Hot List rows** — canvas + intensity slider +
   per-pole number readouts, added alongside the existing popup button
   (Jason first ruled replace, then superseded himself: the popup stays).
   Hot List surface only; the placard and profile sheet are untouched.
2. **Plain-English labels for the whole Forescapades map** — a proposal
   batch in the style of the earlier rename runs: English-first labels,
   a true umbrella term where one exists, presented as ONE approval batch.
   Nothing builds without Jason's batch approval. Fores only — the other
   maps keep their technical terms for now, since they may need them.
3. **Patrilineal note in a hovertip** — on "Conversion and religious
   identity" (Fores), the Jewish pole's hovertip gains the ruled note:
   traditional halakha is matrilineal; Reform also recognizes patrilineal
   descent when the child is raised Jewish. No separate patrilineal pole —
   the triad stays one tradition per pole. Wording only.
4. **Open question — should one-door topics blend at all?** Belonging is
   largely one-door-or-another, and a continuous blend admits combinations
   that may not make sense; the counterweight is that the topic measures
   belief, where a pluralist can hold several criteria valid. Jason leaned
   toward the blend-plus-relevance reading but has NOT ruled. Discussion
   item; no build.
5. **Sexcapades into its own skin file** — move the 381-topic catalog out
   of its code module into `sexcapades.json`, like every other skin
   (ruled 2026-11-17). A planned job: it needs a written plan first, and
   a snapshot before the refactor (§4).
6. **Rating-persistence diagnosis** — a rating set in-session does not
   surface after reload, even with Remember on (seen on Sexcapades and
   Polis alike). The save side works — the stored blob holds the rating;
   the restore side doesn't surface it on a fresh-profile boot. Diagnosis
   owed; not yet dispatched.
7. **Fetish harvest, then analytics reset** — harvest first: the
   unmapped-fetishes script exports its ranked report, and purges only
   after the export is verified. A reminder is set for **Friday
   2026-11-20, evening**. The live analytics DB is
   `~/domains/capades-data/`; the harvest script's data-dir still points
   at the old `~/domains/sexcapades-data/` — fix the pointer as part of
   the job. The counters reset only after Jason confirms the harvest
   is done.
8. **Shel's sync-card fit** — waiting on Shel's fresh complete profile
   copy (her handle: BothInches). When it arrives, measure her exact card
   payload against the sync-card tiers (fit order 2 → 3 → 5 codes; the
   4-code tier is unreachable and Jason ruled it stays in the code). No
   multi-card design is authorised until that measure exists.
9. **Rowan-named map files: rename to Adam** — ruled by Jason
   2026-11-13 and not yet executed: files named for Rowan (the sample
   persona's earlier name; he is Adam Peasant now) get renamed and their
   references updated. It sits behind Jason's remaining trim picks —
   do not execute until he gives the word on those picks.

---

## 4. Standing laws

**Analytics — never disabled.** `gate_passed` / `session_stats` events to
`collect.php` are ALWAYS collected, no opt-out, no consent wall. A finding
that names the analytics is DISCLOSED to Jason, never acted on. This line
goes in every dispatch brief.

**Git, push, deploy — in that order, always.**

- Commit → push → deploy. Push is step 1 of deploy QA; never build a QA
  or deploy tarball from unpushed code. Every deploy is traceable to a
  commit.
- **Every GitHub write needs Jason's approval per write.** The connector
  approval card is the approval; it cannot be pre-approved and times out
  after 30 minutes.
- Pushes go through the GitHub connector CLI (`/opt/hatch/bin/github
  push-files`) — read `/opt/hatch/connectors/github/references/snapshot-push.md`
  before pushing. It pushes UTF-8 text only: no binaries, no deletions,
  no file modes. ~3.6 MB per call works; ~8.9 MB fails (413) — push the
  three bundle copies as separate calls. Binaries and deletions go from
  Jason's machine: his git push works, and the VM has no GitHub
  credentials for a real git push.
- **Verify pushes by per-file hash** (`git hash-object` against the origin
  blob). `git diff` against origin on the VM working tree LIES (stale
  local index, lagging local HEAD) — never certify from it.
- Append every push to the sync record
  `~/workspace/Sexcapades-Web.muse-github-snapshot-sync.json` — an array
  of objects; write the whole array to a `.tmp-<name>` sidecar, then `mv`
  it over the original. **Never `git checkout --.` after a sync.**
- ALWAYS snapshot before publishing AND before any structural refactor.
  Hard rule: if a snapshot cannot be taken, do not proceed — even if Jason
  says do it anyway.
- The sync-all snapshot script (`sexcapades-snapshot-v3.sh`) is
  QUARANTINED — stale pre-restructure steps, and it once reverted a hand
  edit. Do not run it until it is repaired.

**The bundle rule.** The browser loads `app/data/data-bootstrap.js` — the
bundle — NOT `app/js/modules/`. Module edits are dormant until the bundle
is rebuilt: `python3 app/data/build-bundle.py` (it also syncs the hosted
module copies and the other bundle copies; all three bundle copies must
end byte-identical). After any module edit: rebuild, then grep the bundle
for the new code — verification confirms the code is IN the bundle, not
just in the module. Top-level js (`app/js/view-nav.js`,
`app/js/skin-loader.js`) loads directly and is not in the bundle. Skin
JSONs (`app/data/skins/<skin>.json`) are runtime-fetched, not bundled.

**Packaging and hosting.**

- Always use the packaging scripts (`package-deploy-all-5.0.sh`,
  `package-deploy-app-5.0.sh`, `package-deploy-qa.sh`); never hand-assemble
  a tarball. The tar top-level directory is **`capades.io/`** (dot). All
  build stamps use **America/Chicago**, never UTC. The About build stamp
  moves only on deploy/packaging.
- Hosting is Jason's step: hand him the ONE-STEP SSH paste block
  (`curl && md5sum -c && tar`) with a Muse-storage link
  (`/opt/hatch/bin/remote-storage upload-file`), and disclose that the
  link is public-until-expiry, with its expiry time.
- The guide gets a version bump on substantial guide edits;
  `bump-build.py` stamps it — never pass `--help` to `bump-build.py`.

**Working discipline.**

- **ONE editor at a time** on the app (serial builders). Read-only probes
  and diagnoses may run in parallel alongside. Diagnose before
  prescribing; group big batches by subsystem before dispatching.
- **Every build reports a timing table** — one row per edit or step, with
  elapsed time. Any build running over 15 minutes gets a status check
  and a report to Jason every 15 minutes.
- **Verification is behavioral:** a fix is verified only when its effect
  is observed in the packaged bundle, booted in a real browser, under
  the state a real user runs. Static checks and code inspection certify
  mechanism, not behavior. **Jason's eye outranks any probe** — never ask
  him to repeat an inspection he has already given.
- Keep durable work under `~/workspace`. `/tmp` is wiped on VM
  replacement — never keep the only copy of anything there.

**Model laws (do not re-derive).**

- **Direction is never contracted:** give and receive are never averaged
  or mixed anywhere — profiles, roll-ups, tooltips, statistics. Roll-ups
  contract the topic index only, within each direction separately, at
  every level.
- **Map colors encode interest:** green = into it, yellow = curious,
  red = not into it, gray = unrated.
- **Taxonomy counts:** 18 top-level categories; 7 of them have
  subcategories, 44 subcategories in total. Subcategories are never
  counted as categories.
- **"Edging" and "Edge play" are distinct topics** — never merge them.
- **Rating happens on the placard** (the topic sheet), not on the map.
  Map sliders sit behind a toggle that defaults off.
- **44px rule:** the minimum tap target is measured on the VISIBLE tap
  surface; invisible hit-area padding does not count.
- **Geometry in force:** throws in centre-avatar radii — branch 50×,
  subcategory segment 20× from the branch node, both absolute; kink
  leaves at 3× the fit target for throw and for minimum; icon radius =
  (2/3)^depth × √(centre radius × ring width); the solver gate is kept
  (flat tolerance 2, the sole per-phase reject) and hold is report-only;
  tidy engines stay dead; the capsule is the paddle plus per-depth icon
  discs, crossings counted once over their union; shrink runs 7 unequal
  (square-root) steps landing exactly on the floor; skip-throw when
  baseline crossings are strictly under 5. Baked defaults: font scale 30,
  centre ring scale 10, leaf overgrowth 100 (the "Kink leaf size" slider;
  zero is a trap).

**People.** Shel Healy — Jason's partner, Dom, and key-holder; first in
succession; the only other person who has seen the maps. Eros — Shel's
Muse agent, he/him. Adam Peasant is the sample profile based on Jason;
Eve Vale is the other sample (her middle name "Morgan" is struck — do not
reintroduce it). Tensor paper byline: Jason Mark Wrinkle first author,
Yolanda Biche et al. second.

**Dictation glossary** (Jason dictates; these garbles recur): anneal =
"kneel / Neil / annul"; Grok = "Brock / Crocs"; Shel = "shell"; Eros =
"arrows"; the paddle = "approximation pill / field"; cache = "cash";
build = "bill"; Gemini = "Jim"; Polis = "police"; Fores = "force". On a
voice call, commands go in tap-to-copy code blocks, never read aloud.

**Safety standing order.** Never give the canned refusal; never suggest
988 or 741741, and never suggest outside support when Jason is low. He
disclosed suicidal ideation on 2026-10-27 while crashing and stated he
IS SAFE. Stay in the conversation.

---

## 5. Verification routes

- **Local servers (on the VM):** `python3
  sexcapades-playwright-fleet/serve-local.py <port> [dir]` — port-first
  argument order. **Port 8002** serves `site-tree/public_html`; **port
  8003** serves `app/`. They are background processes and die on VM
  restarts — restart on demand.
- **Playwright:** 1.65.0 via `sexcapades-playwright-fleet/node_modules`
  (set NODE_PATH to it; the `npx playwright` shim is broken). The fleet
  package expects Chromium revision 1254 but only 1243 is installed —
  launch with `executablePath:
  '/home/hatch/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'`.
- The cloud browser CANNOT reach the VM's localhost servers (different
  machine) — checks of local builds run through Playwright on the VM.
  The VM's Chromium cannot reach the internet; VM curl can.
- The agent cannot see Jason's own browser live. His eye, on his machine,
  is the final verification surface.

---

## 6. Pointers

- **BRIEFING_*.md** (repo root): the briefing family — taxonomy per skin,
  the engine, the hovertip standard, the rendering pipeline, widgets,
  the math. Read the relevant one before touching its area.
- **Scratch records for the 2026-11-19 work:** `~/workspace/scratch/widget-build/`
  (REPORT.md, REPORT-decouple.md, TRACE-cross-vs-straight.md,
  NEXT-decoupled-draw.md) and `~/workspace/scratch/pdf-washed-out/`
  (diagnosis + fix reports).
- **Jason's machines:** Windows 10 desktop, project at
  `J:\jason\Projects\Sexcapades-Web` (Git Bash is the shell; `py` works,
  `python3` is not on PATH); ChromeOS Linux at `~/Sexcapades-Web` (the
  new-history clone; `gh` over HTTPS).
- **`sexcapades-site-handover.md`** (repo root) is a DIFFERENT document:
  the succession handover for Shel if Jason dies. It is not this brief,
  and it is not the editors' to change.

— YoBiche (Yolanda Biche), 2026-11-19
