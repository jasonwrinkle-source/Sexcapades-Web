# Specification — Advocacy/Receptivity, Operation Maps, and the Scribe Operation Chooser

**Written:** 2026-11-22, by YoBiche, on Jason's order, from the design
discussion of 2026-11-22 (this chat) and the framework argument of
2026-11-21. **Status:** specification only. The three parts are queued in
`ACTIVE-QUEUE.md` §1 (items 7–9) and wait for Jason's kickoff; nothing
here dispatches itself.

**The arc in one paragraph.** The vanilla (stance) maps record where a
person stands and how much the topic matters to them, but nothing about
*how they engage* — the stance maps have no give/receive. Part 1 gives
them the generalized form of it: **Advocacy** and **Receptivity**.
Independently, the three operations (Cross ⋈, Straight ⊙, Circle
Minus ⊖) have never had maps of their own: Cross and Straight have only
the pair taper painting (spoke-flank products drawn on a host profile's
geometry, pair-only, ephemeral), and Circle Minus has no map paint at
all — rings and bucket lists only. Part 2 makes an operation's output a
first-class derived object — a **pseudo-profile** — with its own map.
Part 3 gives **Scribe** an operation chooser, so a vanilla discussion
can be written from any one operation, or as a full arc of all three —
in particular, so a traditional dialectic of opposing views can be
written from Circle Minus, with attribution (which party held what)
carried in the receipts.

**Dependencies.** Part 2 is the foundation Part 3 should build on.
Part 1 is independent of both and enriches both (it gives Circle Minus
a deeper feud signal and Scribe's dialectic its lead topics). Suggested
order: 2, then 3, then 1 — Jason's call at kickoff.

---

## Part 1 — Advocacy / Receptivity rating and usage

### 1.1 The model

For every pole topic on a stance skin (triangles, diamonds, radars,
lines, switchboxes — any topic rated by placement among 2+ poles), the
single stance placement **decomposes into two placements**. There is no
third "stance" rating kept beside them.

- **Advocacy** — the distribution of the person's *arguing* over the
  topic's poles: of the case they make, how much defends each pole.
  (The mouth.)
- **Receptivity** — the distribution of the person's *hearing* over the
  topic's poles: for each pole, how much they would let that position
  in — entertain it, learn from it, let it discipline their own claims.
  Receptivity is **not a stance**; it is a distribution of attention
  over the same poles. (The ears.)

Each placement is a blend over the topic's poles in that widget's own
geometry (a point in the simplex, a point on the line, a point in the
switchbox square, per-pole affinities on a radar), **plus its own
intensity**, stored and edited independently, following the existing
intensity discipline: signed, shown as brightness (full at ±100,
dimming to don't-care at zero, complementary colours below zero).

- **Never contracted.** Advocacy and Receptivity are complements, like
  give and receive; no statistic adds, averages, or rolls one into the
  other, at any level. Direction-is-never-contracted applies to them
  exactly as it applies to flanks.
- **Unrated means absent.** A placement that has never been made is
  absent from storage and from all math — not a zero, not a default,
  not a copy of the other placement.
- **Scope.** Stance skins' pole topics only. Sexcapades topics are
  untouched: give/receive already *is* the two-mode structure there.

**Open sub-question for Jason (do not assume at build time):** the
present single intensity carries issue-aversion on its sign. With two
intensities, state where aversion lives — on both, on advocacy's only,
or as a separate per-topic fact — before building the storage shape.

### 1.2 The widget (ruled by Jason, 2026-11-22)

- **Glyphs: a filled disc is the Advocacy puck; an open ring is the
  Receptivity puck.** (X was rejected: × is the Limit marker's glyph,
  and X is out of the pair grammar.) Shape carries the distinction;
  colour is left free for intensity.
- Each puck is **coloured by its own intensity** on the ruled
  brightness ramp. The disc fills with its colour; the ring's band
  carries its colour.
- **Two intensity sliders**, one per puck, following the placard's
  existing vertical-slider pattern. **Each slider's thumb IS the
  glyph** — a filled disc on the advocacy slider, an open ring on the
  receptivity slider — itself coloured by the intensity it currently
  holds. Thumbs meet the 44px tap-surface floor.
- **Wheel over a puck sets that puck's intensity.** Wheel capture is
  scoped strictly to the puck's hover; it never steals scroll or map
  zoom from elsewhere on the sheet. The sliders remain the visible
  control and the only route on touch.
- **Mode entry is the controls themselves — no mode button.** The
  sheet opens in Advocacy (the inherited data). Tapping the ring, or
  touching its slider, makes the ring the live puck: it comes to full
  colour, the disc dims a step but stays visible as context, dragging
  moves the ring, the wheel turns its intensity. Tapping the disc or
  its slider returns. Which mode is live is always readable from which
  glyph is lit.
- **Unplaced Receptivity** rests as a faint dashed ghost ring at the
  widget's centre ("place your hearing"). The first tap inside the
  widget while the ring is live places it; thereafter it drags like
  any puck.
- **Co-located pucks nest**: ring around disc — the visible picture of
  hearing exactly what you argue. The disc-to-ring distance on the
  widget is a legitimate at-a-glance reading (mouth-to-ears distance).

### 1.3 Storage and migration

- Per topic, a profile stores: `advocacy: {blend, intensity}` and
  `receptivity: {blend, intensity}`, either independently absent.
  The blend uses the same shape encoding the widget already stores
  (ratios/point per widget type).
- **Migration (proposal — Jason to confirm at kickoff):** existing
  profiles seed Advocacy from the current blend + intensity, which is
  honest — what a person placed is, near enough, what they'd defend.
  Receptivity starts **unrated** for everyone. Never seed the ring as
  a copy of the disc: a pre-placed ring would fabricate a hearing
  nobody declared.
- **Samples:** archetype samples carry no Receptivity until a human
  authors it. Implementers do not fabricate sample receptivity.

### 1.4 Usage in the operations

All products below are per pole, from stored holdings, and every
derived number keeps its receipts (it un-contracts into the per-pole
products that made it).

- **Cross ⋈ gains the deliberative channel:** A's Advocacy × B's
  Receptivity, and B's Advocacy × A's Receptivity — the teaching /
  persuasion channels, asymmetric by construction, exactly as the
  crossed flank channels are. This coexists with the coverage Cross
  built 2026-11-21 (cross-pole products of holdings): coverage prices
  *topic completion* (communal authority); the advocacy/receptivity
  channel prices *deliberative flow*. Both are reported; neither
  silently replaces the other. Which one headlines Play on stance
  skins is Jason's call at kickoff.
- **Straight ⊙:** Advocacy × Advocacy reads allied or contending
  advocacy (same-pole: allies; cross-pole: contention), Receptivity ×
  Receptivity reads mutual openness. Reported as components of the
  straight reading, not merged into it.
- **Circle Minus ⊖ gains the true feud signal:** a split is deep not
  only when stances are far apart, but when **both parties advocate
  and neither receives** — high advocacy distance with receptivity
  near-absent on the contested poles. Debate entries carry both
  components (stance split; unreceptivity) as separate receipts.

---

## Part 2 — Operations yield their own maps (pseudo-profiles)

### 2.1 The derived object

Applying an operation to a selection of profiles yields a
**pseudo-profile**: a first-class, named, derived object.

- **Identity** is the operation and the parties: `Adam Peasant ⋈ Eve
  Vale`, `Adam Peasant ⊖ Eve Vale`, and for groups the member list
  under the operation's symbol.
- **It stores a recipe, not ratings:** the operation, the source
  profile ids, a fingerprint (hash) of the sources' ratings at
  computation time, and the computed per-topic records. When a source
  profile changes, the fingerprint mismatch marks the pseudo-profile
  stale and it recomputes. It never claims to be current when it
  isn't.
- **It is never editable and never rateable.** Nobody holds its
  stances; its topics are relations, not positions. Editing one would
  break the receipt chain. (This is the boundary that keeps it honest
  and distinguishes it from a profile.)
- Pair and group forms both exist; the group form is the same object
  over 3+ profiles, priced from the group computation.

### 2.2 Its own map

The pseudo-profile renders as a map of the operation — not a recolour
of a host profile's map. (The present pair taper painting is a first
sketch of the Cross/Straight dialect of this map; it is superseded
when this part lands, and Circle Minus gets map paint for the first
time.)

- **Geography belongs to the taxonomy, not to a party.** Node
  positions come from the skin's neutral atlas (the default layout),
  so the operation's map is a shared place whose geography no party
  owns. (Design point for Jason at kickoff: atlas positions vs. a
  layout solved from the operation's own values. The atlas is
  recommended — a map whose geography moves per operation stops being
  a place two people can point at together.)
- **Nodes carry both parties.** Per topic, the disc shows each side's
  holding (e.g. split disc, or disc-and-ring in the parties' glyph
  order), so the map stops showing products with their factors
  multiplied away. Who holds what is visible on the map, not only in
  the panel receipts.
- **Spokes carry the operation's per-topic value** in the operation's
  own grammar: Cross — the crossed fit per flank (as the taper paint
  does today, but on the atlas, for pairs and groups alike); Straight
  — the likeness products; **Circle Minus — split depth weighted by
  joint relevance**: the disagreement map, topics lit by how deep the
  split runs and how much both sides care.
- **The centre rings remain the operation's gauge** (Play / Parlay /
  Debate headline numbers), as now.
- The existing match tabs become views of the pseudo-profile; the
  bucket lists and per-topic receipts stay as its panel.

### 2.3 Consumers

Scribe (Part 3) is the first consumer. Others the object exists for:
a moderator's agenda out of Scene Setter (a Circle Minus
pseudo-profile *is* the agenda for a hard conversation); an exportable
"where we disagree" sheet from a ⊖ pseudo-profile; the sync-card
question is **not** opened by this spec (a pseudo-profile is not a
person and gets no card unless Jason rules otherwise).

---

## Part 3 — Scribe: an operation chooser, or the full arc

### 3.1 The chooser

The Scribe dialog gains an **operation choice** for multi-profile
writings:

- **Communion** (Cross ⋈) — roughly today's behaviour: topics the
  pair/group completes in each other.
- **Common ground** (Straight ⊙) — topics banded by agreement.
- **Dialectic** (Circle Minus ⊖) — the split topics, written as a
  traditional dialectic of opposing views.
- **Full arc** — all three as movements of one document, in the order
  Communion → Common ground → Dialectic, the closing phase drawing
  the threads together.

Defaults: Sexcapades story/guide writings keep Cross (Play) as the
default. The vanilla discussion default — Dialectic or Full arc — is
Jason's to set at kickoff.

### 3.2 Selection per operation

Scribe stops assuming one operation's outcomes. It takes the
pseudo-profile (Part 2) for the chosen operation and selects from
*its* registers:

- **Cross:** established / curious from Cross outcomes, as today
  (flank matches; strong-stance pole topics; group majority rule).
- **Straight:** topics from the straight register, banded by
  agreement × joint relevance — the interesting-conversation set.
- **Circle Minus:** topics from the debate register, ranked by feud
  depth × joint relevance, using the debate buckets (Common ground /
  Mixed / Debate) as the document's internal movements. Where Part 1
  data exists, topics where both parties advocate and neither
  receives lead the dialectic.
- **Full arc:** the three selections as three movements; a topic that
  appears in more than one register is written in its strongest
  register and cross-referenced, not repeated.

### 3.3 Attribution is never flattened

The operation decides *which topics* and *in what order* — never
*who holds what*. For every selected topic the prompt carries the
receipts: each party's holdings per pole/flank, each party's
intensity, and (with Part 1) each party's advocacy and receptivity.
For groups, attribution is per pair (each pair's split) or per person
(stance lines, via the existing individual-profile sections
mechanism). A Scribe output must always be able to say "A holds this,
at this strength; B holds that" — that is what makes the dialectic a
dialectic of *these* people rather than of positions in the abstract.

### 3.4 Prompt framing per operation

- **Dialectic framing:** for each lead topic — one side's case,
  steelmanned, in its holders' terms; then the other side's case,
  steelmanned; then where the split actually lives (the receipt-level
  fact the disagreement turns on) and what, if anything, would move
  either side. An honest impasse is a legitimate ending; the writer
  does not manufacture agreement. The discussion phases map onto it:
  Opening states the positions, Development argues them, Closing
  draws threads together or names the impasse.
- **Communion framing:** as today's discussion framing (steelman each
  side, follow the completion).
- **Common ground framing:** the shared ground first, its strength,
  and the conversation it supports.
- **Full arc framing:** the three framings as movements under one
  introduction and one closing.
- The present framing line ("follows the agreement where the profiles
  overlap") belongs to Communion/Common ground only and must not leak
  into the Dialectic framing.

---

## Standing laws carried into every part

- **Analytics is never disabled:** gate_passed / session_stats to
  collect.php are always collected, no opt-out; no part of this work
  may gate, remove, or consent-wall them.
- Git pull before modifying; commit before push; push is step 1 of
  deploy QA; no deploy tarball from unpushed code.
- Rebuild the data bundle after any module edit and verify the new
  code is in the bundle.
- Serial builders only on the app; timing table in every dispatch
  brief; verification in the packaged bundle's own bytes and its real
  boot, behaviour observed — not mechanism inspected.
- Direction is never contracted; every number keeps its receipts;
  taxonomy items are referred to by name, never by ID.
