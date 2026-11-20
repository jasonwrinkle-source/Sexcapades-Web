# AI Handover Brief — refreshed 2026-11-19

> **A scratch pad, not a reference.** This brief is the working scratch
> pad for the 2026-11-19 handoff — the ongoing jobs and the state of
> play at the moment of the switch. It is not an ongoing reference:
> expect it to go stale, and look to the BRIEFING_*.md family and the
> project's records for what stands.

**Maintenance rule (Jason, 2026-11-19).** This brief must be modified
whenever an item in it is cleared: when you finish or settle an item
listed here, strike it or mark it settled in this file as part of that
same work, so the pad never again sits carrying dead items. That
strike-at-clearing habit is the double-check against the staleness
that forced the 2026-11-19 audit.

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

**Local build, 2026-11-19.** Steps 1–3 are in the tree: the +1 is
stored beside the poles, seeded from the old derivation, and the
intensity slider writes only that number. Brightness ramps to full at
±100, dims at zero, and negative intensity paints complementary
colors. Scoring now uses that number. Similar roles score straight;
complementary roles score cross. The smaller relevance weights how
much the topic counts, and a shared aversion is marked rather than
listed as something to do.

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
4. **Scoring.** Built 2026-11-19 from the proposal below, after Jason
   called it a good start and defined straight as a similar role and
   cross as a complementary role.

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

### Proposed answers (2026-11-19) — built

The +1 is its own number, seeded from today's derivation so existing
sliders do not jump, and the slider no longer rewrites pole numbers.
Scoring weights a role topic by the smaller relevance and splits
straight (similar role) from cross (complementary role).

1. **Weight, don't gate.** Multiply a topic's contribution by the
   smaller of the two people's |intensity| / 100. A don't-care (0) on
   either side drops that topic out of the match. A gate (ignore the
   topic below some cutoff) throws away a real gradient; a scale keeps
   it.
2. **Straight is a similar role. Cross is a complementary role.**
   Jason, 2026-11-19: for a role widget such as Bull / Hotwife /
   Cuckold, a straight match means both people lean the same role, and
   a cross-match means each is leaning a role that complements the
   other's. Two bulls score high straight and low cross. A bull and a
   hotwife score high cross and low straight. The old collapsed 0.75
   on both registers goes away. The two relevances (each person's
   intensity on the topic) still weight how much that agreement
   counts. The rest of this proposal he called a good start. Built.
   Which other poles are the complement is the widget's stored
   reading (point 6), not "every other pole."
3. **Aversion lives only on the +1.** Pole numbers stay the blend,
   non-negative shares. One sign cannot mean both "against the topic"
   and "the receiving role." Give/receive stays on the two-ended
   slider topics. Belief and vocational maps do not grow a
   give/receive reading on their poles.
4. **Depth Factor stops being sign-blind.** Same-sign intensities
   reinforce; opposite signs cancel. Both +80 → factor 0.8, shared
   enthusiasm. Both −80 → factor 0.8, shared aversion, marked as
   aversion so it does not read as enthusiasm to do the thing. +80
   against −80 → factor 0.
5. **Pole topics join the match and curious lists**, weighted like
   any other topic by the blend agreement and the smaller relevance.
   A pair still scores person to person. A cast of three or more
   scores as one combo: cross is high only when every role has its
   own person (bull, hotwife, and cuckold), and two bulls plus a
   hotwife score low. Straight is high only when every person leans
   the same role. Scribe's pair-detail lists and the four headline
   aggregates stay as they are.
6. **Three operations, stored on the widget.** Circle dot is talk
   with someone on your pole. Bowtie is the commune, and only a
   widget stored as complement treats the other poles as partners.
   Circle minus is the argument with a stored far pole; its rings
   use the same Parlay shape as circle dot, and opposite signs still
   count because the disagreement is the point. A same-pole widget
   has no commune and no feud. An antipodal or trilemma widget has
   no commune; the feud is the named enemy pairs, and a trilemma's
   feud is every pair of its poles. Each of the 170 n-pole widgets
   stores `poleReading` and `poleEnemies`. Two-pole lines are left
   unstamped. Jason, 2026-11-19: on a give-and-receive topic, a
   same-flank split (one person for that flank, the other against
   it) feeds circle minus only. The talk counts a positive
   same-flank product, a shared yes or a shared no, because two
   noes multiply into an agreement. A topic that is only a split
   scores 0 in the talk and stays in the denominator. When one
   flank agrees and the other splits, the talk lights from the
   agreement and the argument lights from the split. Jason,
   2026-11-19, four rulings: a shared no stays a talk. Opposite
   interest on a same pole is the argument, for a pair and for a
   group, and that overlap leaves the talk. The talk ring is drawn
   only when the interest counts, so a zero or a shrug no longer
   fills it from the overlap alone. One-door topics keep the blend,
   with relevance carrying the weight. Two-pole lines stay
   unstamped until a line is named as a feud.

---

## 3. The queue after Job 1

Each item waits for Jason's kickoff; nothing here dispatches itself.

1. ~~**Inline n-pole widgets in Hot List rows**~~ — settled 2026-11-19. The
   Hot List row shows the canvas and a vertical intensity slider. Pole
   numbers sit under the pole names. The popup button, the extra per-pole
   sliders, and the separate number row are gone. The wheel sets intensity.
   A click updates the row and leaves the map paint until the list closes.
   Placard and profile sheet untouched. In the repo on main; not in the
   uploaded 2026-11-19_2046 package.
2. ~~**Plain-English labels for the whole Forescapades map**~~ — settled
   2026-11-19. Jason approved the batch. The 16 jargon topic titles and
   the pole labels in that batch are now the English umbrellas in
   `forescapades.json`. The other topic titles stay. Technical terms
   remain in the hovertip notes. Fores only.
3. ~~**Patrilineal note in a hovertip**~~ — settled 2026-11-19. On
   "Conversion and religious identity" (Fores), the Jewish pole's hovertip
   says traditional halakha is matrilineal, and Reform also recognizes
   patrilineal descent when the child is raised Jewish. No separate
   patrilineal pole. The triad stays one tradition per pole.
4. ~~**One-door topics**~~ — settled 2026-11-19. They keep the blend.
   Relevance carries the weight. No build.
5. **Sexcapades into its own skin file** — ruled 2026-11-17. Plan written
   2026-11-19 below. Not started. The next editor does the move. Snapshot
   first (§4). If the snapshot cannot be taken, stop. Do not run
   `sexcapades-snapshot-v3.sh` (quarantined).

   **What is true today.** `02b-taxonomy-data.js` is the boot catalog:
   18 categories, 381 topics (`id`, `name`, `risk`, and where present
   `give_label`, `receive_label`, `note`, plus subcategories on 7
   categories). `02i-taxonomy-catalog.js` turns that into the live tree
   (`loadTaxonomy`) and then keeps going: display-name map `m`,
   `topicRecords`, `topicLabelById`, `legacyTopicIdByOpaque`. Those are
   not the catalog. Do not delete 02i, and do not read it whole.
   `app/data/skins/sexcapades.json` is not the catalog. It holds the 17
   higher-pole widget topics, plus `samples`, `scribe`, `sceneSetter`,
   `meter`, and `defaultLayout`. `registerSexcapadesWidgets()` registers
   those 17 and does not replace the category array.
   `defaultLayout.positions` repeats topic ids as baked coordinates. A
   walk of every `"id": "t…"` counts those twice. They are layout, not
   topics. Leave `defaultLayout` in place.

   **What done means.** Sexcapades boots from `sexcapades.json` the way
   Fores boots from `forescapades.json`. Topic ids stay `t0002` and up.
   Ratings, imports, and pole readings key off those ids. The outline
   copy stays "400+" and `SEXCAPADES_TOPIC_COUNT` stays 403. Do not
   "correct" 403 to 381. Do not split the bundle. Do not `json.dump` the
   whole skin; the file is large and a reformat hides the real diff.
   Edit `app/data/skins/sexcapades.json` only, then
   `python3 app/data/build-bundle.py` so the hosted copy is the same
   file.

   **How to do it, in order.**
   1. Snapshot. Then stop if it failed.
   2. Script the merge. Do not open 02b or the JSON in the editor.
      Match topics by id. Start from the 17 widget topics already in
      the JSON (keep `poles`, `hovertip`, `widget`, `question`,
      `poleReading`, `poleEnemies`, `archetype`). Fill in every other
      topic from 02b, including subcategory membership. Carry
      `give_label`, `receive_label`, `note`, and `risk`. Emit the shape
      `mergedCategory` already understands: `subcategories[].topics`,
      and `parentTopics` where the category has parents. Keep the JSON's
      other top-level keys byte for byte.
   3. Check the script's output before wiring it: 381 unique topic ids,
      same set as 02b, zero id changes, the 17 widget topics still have
      their poles, `defaultLayout` still present.
   4. Point Sexcapades boot at that file through the same category swap
      the other skins use (`applySkin` / `mergedCategory`), and keep
      widget registration. `restoreSexcapades()` must clone the JSON
      tree, not the old 02b tree, and must still reattach `toString` so
      a Fores round-trip does not paint `[object Object]`.
   5. Leave `m`, `topicRecords`, and `legacyTopicIdByOpaque` alone.
      `m` renames short catalog names for display (`Nylon` →
      `NylonLegs & Feet`). Baking those display names into `name` and
      deleting `m` breaks every `m[name]` lookup. A later pass can retire
      them. This pass does not.
   6. Prove it in the browser, then stop 02b from being the boot source.
      One ordinary give/receive topic still shows both labels. One
      n-pole topic still draws (BDSM archetypes). Switch to Fores and
      back. Hot List rows still show names. Only then is 02b allowed to
      stop feeding `loadTaxonomy`. Do not delete 02i.
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
One correction from the 2026-11-19 audit: the Rowan → Adam file
rename, briefly listed here, is already done (verified on origin) —
no action. A second item was struck as done on the 2026-11-19
settlement recheck: the Scribe "does Generate stream?" question —
streaming was implemented 2026-11-14 (commit `543b174`, Scribe SSE
streaming), so it is settled, not open.

### Carried-over specifics (restored 2026-11-19 after the old-brief audit)

The 2026-11-13 brief carried specifics the 2026-11-19 refresh dropped.
A line-by-line audit (2026-11-19) found the following still live. Full
audit: `~/workspace/scratch/handover-review/AUDIT.md`.

1. **Gate/header unification — undecided, unanswered, not built.** Give
   the gate the app's header view-selector pattern (five views + Scan or
   Import, current view on the button + checkmark, one-line
   descriptions), remove the "Choose where to go" row, keep the age gate
   unchanged; the Docs dropdown stays or folds in (Jason's call); the
   four App-menu links (Examples, Privacy, Contact, Sitemap) move with
   it. Jason's question — "Want me to sketch that header layout, or just
   build it?" — is UNANSWERED. Do NOT dispatch anything on this until
   he decides. Verified still unbuilt 2026-11-19: gate.html carries none
   of the app view-selector markup.
2. **Interim unification — the uniform-node-type build, not started.**
   Categories, subcategories, and kinks become one uniform node type.
   Ruled scope: rating reads with direct-wins precedence per flank; the
   import write path; On Deck proposal source; canonical adaptation
   ruled for marks / heat / veil / match math / Charted; **branch Limit
   beats topic Favorite** (topics under a limited branch are hidden from
   display and from Play matching); depth weighting (2/3)^(maxDepth−depth)
   — topic 1, subcategory 2/3, category 4/9; the roll-up stays a plain
   mean; a branch counts as one rated unit for the veil. Not started.
3. **Importer write/commit defect + acceptance debt.** The import dialog
   claims "loaded with 10 ratings" but the profile does not persist on
   reload — the write/commit path needs diagnosis/fix (Jason's call).
   Importer acceptance is still not passed, the audit content review has
   not run, and Jason's cold-open acceptance is owed. **Not the same
   item as §3.6** (in-session ratings not surfacing after reload): the
   two present similarly and may share a root, but they are distinct
   recorded items — do not conflate them.
4. **Scribe — narration safety-filter block (known issue).** The TTS
   safety filter can block a passage outright, returning no audio stream
   at all (first live sighting 2026-11-13). The editable story text
   helps troubleshoot it. No fix recorded.
5. **GibberWear / Scene Sentinel track.** A separate track, carrying
   its own standing rulings and open items. The GibberLink protocol
   rulings stand: the profile KEY is the identifier;
   `CHK:<profile-key>:<P|T>`; `ALL` = broadcast; a keyless message =
   broadcast on receipt; the BLE UUID. **Watch copy NEVER mentions
   sexcapades.io.** Open: the audible-sounds cause is still unknown
   (Jason, 2026-11-08 — it needs investigation, not guessing), and the
   entertainment idea (a genre map plus a live group enjoyment meter)
   is open, not yet designed or built.

**Unverified carry-overs — state unconfirmed, check before acting:**

- **cloudLabel −30 residual:** a very long font-fitted label can still
  run under the icon by up to iconR−30; no record the 2026-11-18
  label-tightness fix addressed this residual.
- **Jason's eye on "Service & ritual":** the rendered-gap item was
  closed by probe, but no record shows his eye confirming that specific
  label.
- **2228 stamp — settled 2026-11-19.** The stamp was UTC against a
  Chicago clock (16:29 Chicago + 6h = 22:29). `bump-build.py` now
  stamps America/Chicago.
- **Shortcuts view — still unnamed.** The record never names a screen.
  Jason (2026-11-19) asked what it is. Nearest older notes: the clean
  URLs `/quickstart`, `/compare`, `/privacy` were dead until
  `.htaccess` lived in `public_html`; the guide also mentions Notes,
  About Me, and contact shortcuts, and four optional test shortcuts.
  Do not invent a screen. Leave this until he names one, or drop it.
- **KinkTest recheck round 4 — settled 2026-11-19.** Jason: forget it.
- **Fresh-JS re-tests — ran 2026-11-19 on local build
  2026-11-19_1624, awaiting Jason's confirm.** Pagination-reset: Sex
  acts read "3 of 27 shown", Next pass advanced it to "6 of 27 shown",
  a trip to the map and back returned "3 of 27 shown". Pair glance
  with overlay: Adam Peasant + Eve Vale on `#app/compare`; the three
  center rings and the glance tooltip agreed — Hot topics together
  57% / 67, Curiosity? 20% / 24, Not topics 23% / 27.
- **The 7 ambiguous sliders:** still pending Shel. Do not guess.
  Current labels, give first: Nyotaimori "lie as platter / eat from
  body"; Hotwife is not a live topic (leftover "be the hotwife /
  watch"; live row is the triad Bull / Hotwife / Cuckold, t0281, no
  slider); Growth / shrinking has no slider (pole hint big / small,
  both aliases "size contrast"); Size contrast has no slider (pole
  hint plays big / plays small); Surrogacy has no slider (catalog
  already says the carrier gives and the intended parent receives;
  pole hint surrogate / parent); Siblings "be the sister / be the
  brother"; Superheroes "be the hero / be the villain".
- **R9f — still open, checked 2026-11-19.** Not applied. t0051 is
  still "Pain"; t0252 is still "Sadism". The old ruling was rename
  Pain to Sadomasochism, retire t0252, Sadism → give / Masochism →
  receive, Emotional Sadism untouched.
- **Triangle palette — still open, checked 2026-11-19.** Not the
  spec. `sxDrawTriangleWidget` uses barycentric corners red / green /
  blue; the center is the mix, not black, and it does not deepen as
  the pole numbers spread.
- **Version-manifest — settled 2026-11-19.** Present on a packaged
  tree at `/hosted/app-assets/version-manifest.json`. The local 404
  was the file missing from git; the package writes it. Live
  sex.capades.io serves build 2026-11-19_1524 there.
- **z90 census TRUE FIT, re-baseline 12.643×:** the constant's currency
  is unverifiable from the record.
- **Kinkbits message — settled 2026-11-19.** Jason sent it.
- **GibberWear tester count — still open.** Jason 2026-11-19: still
  at 3 of 12, and the 14-day bar is not met.
- **Importer misspelling / Forniphilia — settled 2026-11-19.**
  Forniphilia maps to t0405. Formiphilia and Formicophilia still map
  to t0120 on purpose. No separate misspelling function.
- **Paddle formula — code matches, live flip not run (2026-11-19).**
  `capEnd` is `h + iconR + 6 + tagW/2` with map sliders, else
  `h + iconR`. No `sEnd` floor in the solver. The live flip (crossing
  number moves, no stale second read, placard ratings survive reload)
  has still not been run.
- **Chrome fleet re-run — deferred 2026-11-19.** Jason: remind later,
  and bring an expanded test suite when that reminder comes. Do not
  re-ask as a bare re-run of the old suite.
- **Full 200-test Playwright run — settled 2026-11-19, figure
  obsolete.** The fleet has 12 test/describe lines across six files.
  No KinkTest, pagination, or Glance specs live there.
- **Scribe "use my key" — parked 2026-11-19.** Jason is skipping the
  whole use-my-key thing for now. Possible later perk once there are
  Patreon subscribers. Do not build it.
- **Patreon QA-diary — settled 2026-11-19.** Jason: drop it.

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

### Carried-over standing instructions (restored 2026-11-19)

Restored from the 2026-11-13 brief after the 2026-11-19 audit; grouped.

**Reporting discipline.**

- **Six-hour status rule:** status numbers refresh only on his six-hour
  rule, except when he asks for a status report.
- **Reply discipline:** keep replies short; plain language first; open
  questions: about two, in sentence form.
- **Do not mother him about sleep.**
- **Lane division:** YoBiche stays on the team in the thinking /
  taxonomy / QA-fleet / drafts lane; the build lane belongs to whoever
  holds the saddle (Grok and Cursor from this handoff).

**Hosting and deploy mechanics.**

- **Deploy-folder routing:** deploy-all → the Drive **snapshots**
  folder; individual deploys → **pre-release**. Deploy artifacts do NOT
  belong in the repo — they live in `~/workspace/deploy-output/`.
- **Intermediate build tags:** intermediate builds carry a short tag in
  the About dialog: `<job>-<MMDD>-<HHMM>` (the About stamp itself still
  moves only on deploy/packaging, above).
- **Hosting targets:** LIVE = `quick-host.sh`; QA =
  `package-deploy-qa.sh` → `public_html/qa/`; there is NO promote step —
  QA and live are built separately from the same source. The Drive
  upload is backup only.
- **Localhost refresh:** edit `app/`, then run
  `python3 app/data/build-bundle.py`. That rewrites the served bundle,
  the stylesheet, the shell scripts the page loads, and
  `hosted/app.html` from `app/sexcapades-5.0.html`, keeping the `?v=`
  stamps already on the served page. The modules stay one concatenated
  script so they keep their shared scope. The packagers still only
  build tarballs. qa serves hosted via the symlink.
- **/tmp extraction:** `/tmp` is a 512M tmpfs — never extract deploy
  tars there; extract to `~/workspace` scratch instead.
- **Deletion mechanics:** deletions via `delete_file` are one call per
  file, one approval per file, SEQUENTIAL only (parallel calls race and
  fail "not a fast forward"); flag the per-file approval cost to Jason
  before a batch. Sync local HEAD via mixed reset (fetch first if the
  local repo lacks the new commit object).

**Environment rules.**

- **Artifact-tree write guard:** never shell-edit artifact root files
  (`~/workspace/ts-spaces/<slug>/`); edits go through the artifact tools
  ONLY. Export-copy work — export, rename/move, grep checks, Drive
  upload, packaging on the export copy — is required work and is NOT
  blocked by that restriction.
- **Browser-access limits:** browser file grants cannot open local HTML,
  and Muse storage links are browser-blocked (Chrome org-policy). Do
  NOT dispatch `browser.browse` drives against local export files.
- **Delivery quirks:** Muse storage links don't work for him in chat;
  chat image transfer destroys PNG payloads; re-attaching a rebuilt file
  at the same path can serve the stale version — save rebuilds under a
  NEW filename.
- **Jason's Windows machine:** `python3` is not on PATH there — a
  one-time `~/bin/python3` shim (with its `.bashrc` line) is the fix.
  Tests run via `node node_modules/@playwright/test/cli.js test...`
  (npx in PowerShell never found the local bin on his machine).
- **Glossary additions:** "sesquipedes.io" = sexcapades.io; "Saint
  Sentinel" = Scene Sentinel; "Giverware" = GibberWear; "gallop" =
  Gallup; "Googlebook" = Chromebook; "Sim links" = symlinks; "get
  system" = git system; "contacts window" = context window; "catching"
  = caching; "twinning" = tweening.

**Fleet rules.**

- **Slot cycling:** freed fleet slots divert to Squad 3 split windows as
  they come free — standard fare (standing rule since 2026-11-12).
- **Run-9 do-not-fail list is law for scoring:** small/absent names at
  fit zoom; no pills strip; no separate Compare page; cold load shows
  only "+"; spoke color = the topic's own heat; one "everything" slider
  on one-interest topics (Edge Play excepted — it needs two). Canonical
  text: `AI_FLEET_TESTING_BRIEFING.md`.
- **Fleet how-to:** console errors attach only on failure (fixtures
  console-capture behaviour); S2-01 waits 60s for nodes; the fleet tag
  is `openApp` → `/qa/app.html?verified=1&utm_source=fleet…` and
  baseURL must stay a plain origin; a `BASE_URL` env override exists;
  the config timeout is 120s. Always read `results.json` from the
  committed ref (`git show <sha>:...`), never the working-tree copy.

**Data rules.**

- **Analytics POST only on live hostname** (in addition to the
  never-disabled law above).
- **Stored-ID allocation:** stored IDs are opaque — topics `t####`,
  categories `c0001`–`c0018`, subcategories `s0001`–`s0044`; a new ID
  is max+1.
- **Importer STRICT:** 16 notes per topic, 64 characters per note;
  notes trimmed and deduped; only the three legal annotation values are
  kept; the uuid is stored but never looked up; re-imports mint fresh
  sibling profiles.
- **SVG blanket rule:** compress every SVG to SVGZ, delete the
  original, and point references at the SVGZ. `favicon.svg` is the
  standing exception.
- **Scribe API-key handling:** never paste or read the key to him.
  Gemini keys start with `AIzaSy` and run 39 characters. Clear the
  field, paste fresh with no leading/trailing spaces, save, and check
  the status line.

**People and pointers.**

- **Fred:** friend and fellow nudist, beta prospect — NOT
  drop-everything (corrected 2026-11-08/09). No drop-everything person
  is currently named.
- **Read first:** `~/MEMORY.md` and
  `~/dreams/alignment/derived/ALIGNMENT_SYNTHESIS.md` — the full
  relationship and rulings record.

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
