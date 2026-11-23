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

## D. The Cross Slider — design iterated live; app build UNRULED

Reference implementation: the Muse artifact **`cross-slider-mockup`**, iterated against Jason's finger through six builds on 2026-11-23. Jason has NOT yet ruled it into the app — if he graduates it, build to this spec:

- **Anatomy:** a pair topic (give/receive; by extension advocacy/receptivity) is TWO lines, not four sliders. One puck per line. The puck is a point on a cross: horizontal position = leaning; vertical offset = appetite. At rest the puck sits on the line wearing its appetite as color.
- **Gesture:** two-axis drag on the puck with axis locking — along the track sets leaning, perpendicular sets appetite (up = appetite, the line itself = zero, down = aversion). Tap-the-puck arms the mode (the stance mode-entry grammar). Mouse wheel works on desktop. The placard keeps its exact fine-tune sliders, synced both ways.
- **Overlay rule (Jason):** the two lines sit CLOSE together. The appetite arm unfolds as a small floating overlay card centered on the puck — it overdraws whatever is beneath it, including the other line — and folds away on release. It NEVER reserves layout space; panels never grow or resize to fit it.
- **Shapes (Jason):** the giving/advocacy flank is a DISC — solid interest color wall-to-wall, no center element of any kind. The receiving/receptivity flank is a RING — a noticeably thick colored rim (8px at puck size in the mockup) around a genuinely TRANSPARENT center (the line/panel shows through; a dark-filled center reads as a puck in its own right and is wrong). Same shapes for pucks, fine-tune thumbs, readout markers, and map node glyphs.
- **Color:** appetite rides the app's own interest palette (from `02o-ratings-scales.js`: zero #d7bd55 gold, +100 #3da874 green, −100 #bd4f51 red, RGB-interpolated, saturating at 100). The unfolded arm wears the rating-rail gradient as its scale legend. Slider TRACKS carry NO tint at all (Jason: gone completely) — color lives only on the pucks/thumbs.
- **Unrate (Jason's pre-existing app behavior, preserved):** each line has a short, always-visible faded dashed run-off past BOTH ends, marked "off". The puck visibly travels into the run-off, greys, and shows a "Release to unrate" cue; releasing there clears that flank to unrated. Dragging back onto the line before release cancels. Vertical drags — including below the line into aversion — NEVER unrate. An unrated flank's puck parks ghosted in charcoal at the **50 mark** (the midpoint of its own line — never at an end; −100 is a real rating). Dragging the parked puck along the line rates it again.
- **Pointer hardening (learned the hard way):** on Jason's phone webview the original pointer-capture implementation failed ASYMMETRICALLY — the puck clamped at the lean-in end and the release didn't commit at the lean-out end — while passing every Chromium test. The mockup's fix: window-level capture-phase move/up/cancel listeners for the drag's duration, try/catch around setPointerCapture, lostpointercapture treated as release, non-passive touchmove preventDefault while dragging. Verification must be DRIVEN drags (real pointer sequences, mouse and touch widths), reported per end: travel, cue, commit, parked-at-center — plus a control release on the line still rating normally.
- **Hypermap:** no popup-within-popup. On the map surface the widget stays folded (puck at leaning, wearing its color; readout chips under the existing zoom gate unchanged). The cross unfolds only inside the single popup panel / the placard.
- **Why it exists:** four pulls (give leaning, receive leaning, give appetite, receive appetite) on two lines; also bears on the z90 action-count test (rating one n-pole topic in fewer than 7 actions, counting advocacy, receptivity, and both intensities).

## E. Sexcapades Stance-Vocabulary Audit — UNRULED candidate, do not build

- Jason (2026-11-23): "I think I've contaminated the Sexcapades map with extra data… it is supposed to be about the role the person takes and the situation. Not how much they would talk about it."
- Verified the same day: the DATA is not contaminated — sex profiles carry give/receive only; the sex placard writes nothing else; only give/receive score there. The perceived contamination is the shared widget/placard machinery and its vocabulary making the sex rating surface feel like the conversation maps'.
- Candidate follow-through (needs Jason's word): audit sex-map surfaces and copy for stance vocabulary that leaked (advocacy/receptivity phrasing), strip it; numbers unchanged.

---

## Not edits (context only)

- Adam Peasant and Eve Vale were deliberately NOT rated on the three Sexcapades topics added 2026-11-23 (Exclusivity & Openness; Spontaneous sex; Planned & scheduled sex) — Jason rates those himself.
- ACTIVE-QUEUE items 1–4 predate today; see the queue itself.
