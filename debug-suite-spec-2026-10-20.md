# Debug Suite Spec — Viewport-Behavioral Verification

**Issued:** 2026-10-20, by Jason's direct order, after the staticMap saga.
**Supersedes:** the implicit method of the 2026-10-19 layout-editor debug fleet.

## Why this spec exists

The 2026-10-19 debug fleet certified layout-editor controls by inspecting code paths
("gates verified at 10+ sites") while the app booted with the map frozen
(`staticMap: true` baked in as a "fastest default"). A frozen viewport cannot exhibit
behavior, so every viewport-mediated claim in that report was certified without ever
being observed. Two shipped defects passed straight through: the frozen-map default
itself, and relation lines that ignore their toggle at the center node.

## The standing definition

**"Debug the site" means: check the viewport for what actually renders and how it
actually behaves.** A control is verified only when its effect has been *observed*
in the live viewport, driven by real input, under the state a real user runs.
Code inspection may explain a finding; it never substitutes for one.

## Method rules (binding on every debug agent)

1. **Real input only.** Drive the UI with genuine input events — click, drag,
   wheel, keyboard, touch emulation. A claim resting on reading a handler, a flag,
   or a class name is not a verification; label it UNVERIFIED or omit it.
2. **Every claim carries an observation.** Before/after values: view transform,
   computed style, element counts, visibility, measured sizes, described
   screenshots. "It works" without an observation is not a result.
3. **Declare your test condition** in the report header: build number, bundle
   path, browser + version, viewport size(s), profile state (fresh unless
   stated), Freeze state, zoom levels visited.
4. **Defaults are product surface.** On a fresh profile, record what a first-time
   user actually gets for every default in scope — defaults are audited as
   product decisions, not mechanisms.
5. **Two zoom levels minimum for map-surface claims:** fit view AND zoomed into
   the center node. The center is where the last fleet's blind spot lived.
6. **"Nothing happened" is a FAIL with the observation attached** — never a
   pass, never silence.
7. **Read-only.** No artifact edits, no packaging, no deploys. Findings go in
   the report file only.
8. **Responsiveness is in scope.** If a control lags, hangs, re-renders the
   world, or moves the user's viewport uninvited (recenter/refit), that is a
   finding with the observed behavior described.

## Report format

- Header: test conditions per rule 3, plus total elapsed time.
- One row per control: **Control | Expected (per its label/tooltip) | Observed |
  Verdict (PASS / FAIL / UNVERIFIABLE) | Evidence.**
- Closing section: defects ranked by user impact, each with the exact observation
  that proves it.

## Scope of the 2026-10-20 run

The **layout editor**, every control, partitioned into 8 tester areas:

1. Editor chrome: open/close paths, sections, scrolling, Fullscreen mode,
   power-user gating.
2. Display controls: Topics shown, Text size, Center circle size, Advanced
   toggles (Show relations — at fit AND zoomed center, both states; Freeze).
3. Branch/topic controls: selection, per-branch overrides, subcategory controls.
4. Metrics: on/off, dropdown, on-map numbers, Calculate-now global, live locals,
   center-node total, cross-window overlay sync.
5. Layout knobs: branch order modes, propFan, subcatOrder, stagger,
   expand-all, collision modes.
6. Bundles, URL params, copy/paste layout payloads, cross-window live sync.
7. Sliders: lengths per generation/subcategory, drag behavior, apply-to-all
   checkboxes, apply side-effects (incl. viewport recentering).
8. Touch & small viewports: editor at phone/tablet/Chromebook widths, touch
   targets, tooltip interference, editor responsiveness under touch.

Whole-app debugging under this spec is a separate future order.

## Baseline condition for this run

Build 2026-10-20_0403, the packaged deploy bundle exactly as shipped. Fresh
profile. Because build 0403 ships with Freeze ON (the defect under repair), the
working baseline is: open the editor and uncheck "Freeze the map" so the
viewport is live — and record the frozen fresh-boot default as the first
observation in every report.
