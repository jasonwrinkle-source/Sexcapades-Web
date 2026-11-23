# Scratch — Edits Talked Through With Jason, 2026-11-23

YoBiche's write-up for whichever AI takes these edits (Jason's word, 2026-11-23: another AI does them). Everything below came out of the 2026-11-23 sessions. Statuses are marked per item — **do not build anything marked UNRULED.** Jason's kickoff and cold-open rules apply throughout; his eye on his phone is the final verification, ahead of any probe.

**Standing build rules that apply to all of it:** after editing any module under `app/js/modules/`, rebuild the data bundle (`python3 app/data/build-bundle.py`) and grep-verify the new code is IN `app/data/data-bootstrap.js` — the browser loads the bundle, not the modules. Analytics (gate_passed / session_stats to collect.php) is NEVER disabled, gated, or consent-walled. Build numbers and filenames use America/Chicago. Verify behavior in the packaged bundle's real boot, viewport-first — code inspection certifies mechanism, not behavior.

---

## A. Receptivity in Every Score — SETTLED (2026-11-23)

- Receptivity counts in the scores as its own flank/component wherever advocacy counts (advocacy & receptivity intensities collected as distinct flanks in `sxTopicTerms` and single-profile rating counts `cc`/`dc`).

## B. Pair-Topic Tapers Color by Appetite — SETTLED (2026-11-23)

- On Sexcapades pair (two-slider) topics, taper flank colors come from stored appetites (`sxPlacementFlankColors`), not position leanings. Mid-seam color uses unblended flank color (`K || z || B.lineColor`).

## C. Selection Doors + Click-to-Zoom Cleanup — SETTLED (2026-11-23)

- Fixed topic picker and search field option indexing across all skins via dynamic skin-ready taxonomy rebuilding (`rebuildTopicPickerData()`).
- Selection set by deliberate picks (search result / topic picker).
- Click-to-zoom is navigation, not a pick: branch unselects when zoom finishes (`__sxZoomFromNavigation`).

## D. The Cross Slider — GRADUATED & SETTLED (2026-11-23)

- **Graduated into app build 2026-11-23_1619.**
- Placard 2D rating surface uses exact matching puck shapes from hypermap & hot list (Give/Advocacy = solid fill Disc with white stroke, Receive/Receptivity = 8px thick Ring with transparent center).
- Colors ride interest palette from `zi(val)` (gold 0, green +100, red -100).
- Unrated pucks park ghosted at 50% midpoint (`cx, cy`).

## E. Sexcapades Stance-Vocabulary Audit — DROPPED (2026-11-23)

- **Dropped per Jason's order ("forget about E").** Data path and vocabulary remain intact.

---

## Not edits (context only)

- Adam Peasant and Eve Vale were deliberately NOT rated on the three Sexcapades topics added 2026-11-23 (Exclusivity & Openness; Spontaneous sex; Planned & scheduled sex) — Jason rates those himself.
- ACTIVE-QUEUE items 1–4 predate today; see the queue itself.
