# Hovertip Standard for Taxopolemics Skins — Draft

**Status:** Working standard — approved by Jason 2026-11-15; Hovertip lines being written into the skin briefings per this format. (Origin: the Forescapades ruling, 2026-11-11 — each topic's Issue line plus stance endpoints.)
**Author:** YoBiche (Yolanda Biche) & Principal Investigator Jason Mark Wrinkle

## 1. What a hovertip is

Every topic node shows a hovertip on hover (on the map) and in list view. The hovertip tells a user, at a glance, what the topic is about and what the stances on it are — before they rate anything.

## 2. Format

A hovertip has exactly two parts:

1. **Issue (one line):** the question at stake, phrased as the topic's question. Taken from the topic's Core Question, tightened to one line.
2. **Poles (one line each):** each pole's name plus a one-line stance description, taken from the briefing's pole text.

Example (dyad):

> **Reductionism vs Emergence**
> Issue: Is chemistry just applied physics, or does it have its own autonomous level?
> - Reductionism — Chemistry reduces to quantum mechanics; apparent autonomy is computational intractability.
> - Emergence — Novel chemical properties genuinely emerge and are absent in the underlying physics.

Example (LINE triad — the tag is shown):

> **Teaching vs Research vs Teacher-Scholar** [LINE]
> Issue: What should a chemist's career centre on?
> - Teaching — The classroom is the work; research serves it.
> - Research — Discovery is the work; teaching serves it.
> - Teacher-Scholar — Both equally; the two feed each other.

Example (TRIANGLE triad — the tag is shown):

> **The Reality of the Chemical Bond** [TRIANGLE]
> Issue: When a chemist draws a line between two atoms, is it a physical feature or a shorthand?
> - Realist — Bonds are real, localized physical entities.
> - Instrumentalist — Bonds are useful bookkeeping fictions.
> - Emergentist — Bonds are real emergent relational patterns.

## 3. Rules

- **Issue is one line.** If the Core Question needs more than one line, tighten it; do not paste a paragraph.
- **One line per pole.** The pole descriptions in the briefings are already roughly one line each; trim where they run long.
- **Show the triad tag.** LINE, TRIANGLE, or NON-BLEND appears in brackets after the topic name, so the user can see what kind of choice they're making before they touch the widget.
- **Show the tag for 4+ pole topics too (Jason, 2026-11-15).** The pole-count name appears in brackets after the topic name — [TETRAD], [PENTAD], [HEXAD], [HEPTAD], [OCTAD] — with the archetype appended after an em dash where the briefing specifies one (e.g. [TETRAD — simplex], [PENTAD — multi-affinity]). The count alone does not say whether the poles are a budget or independent affinities, and the user needs to see that before rating.
- **Higher poles (4–8):** same pattern — Issue plus one line per pole, with the tag above. Keep each pole line short; a 7-pole hovertip is long but still scannable because it is a list, not prose.
- **Scannable at a glance.** A hovertip is read in passing, not studied. Issue plus pole lines, no extra exposition.
- **No duplication of the widget.** The hovertip describes the topic and stances; it does not explain how the widget works.

## 4. Sexcapades exception

Sexcapades topics are activities, not debates — there are no poles to list. A Sexcapades hovertip is:

- Topic name plus a one-line description of the activity.
- A give/receive hint (the two directions the topic can be rated in).

It does not follow the Issue-plus-poles format, because there is no Issue to state.

## 5. Where the hovertip lives

- **The standard is defined here** (and, once approved, belongs in `BRIEFING_INTERACTIVE_RATING_WIDGETS.md` as the hovertip section).
- **Each skin briefing gains a `Hovertip:` line per topic**, written out verbatim in the format above, so the app can ingest it without composition logic at runtime. The Hovertip line is composed from the topic's existing Core Question and pole descriptions — it adds no new taxonomy, only a presentation form.
- **Forescapades note:** the earlier ruling ("each topic's Issue line plus stance endpoints") is this standard's origin. Forescapades briefings do not currently contain Issue lines — adding `Hovertip:` lines to Forescapades satisfies that ruling.

## 6. Work owed (not in this draft)

- Writing `Hovertip:` lines for all 15 skins (hundreds of topics). This is mechanical once the format is approved — a per-skin pass, not a redesign.
- The app side (Gemini's lane): render the `Hovertip:` text on node hover and in list view.
