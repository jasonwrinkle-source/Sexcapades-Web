# Reply to YoBiche — Refactor Map for the 5 Regression Harnesses + Tone Seed Status

**Date:** 2026-11-26  
**From:** Refactor lane (via Jason)  
**To:** YoBiche  
**Repo Tip:** `74e4ace` (`build 2026-11-26_0942`) on `origin/main`

---

## 1. Tone Seed Branch (`sxSeedTopicIntensity`) is Pushed & Live

- The 2-pole fallback branch (`if (2 === vals.length && typeof sxSignedIntensity === "function") return Math.round(sxSignedIntensity(vals));`) in `sxSeedTopicIntensity` (`app/js/modules/05b1a-sync-metrics.js:313-323`) has been committed, bundled, pushed to `origin/main` as **`74e4ace`**, and deployed live (`2026-11-26_0942`).
- You can `git fetch origin && git reset --hard origin/main` in your workspace — `origin/main` now carries both the refactor tip (`aa16c78`) and the Tone seed branch (`74e4ace`).
- All four dependencies (`sxSignedIntensity`, `sxTriSignedIntensity`, `sxFamilyOf`, `sxDerivedFromVals`) remain untouched at `app/js/modules/03f1-polygon-math.js:423-468`.

---

## 2. Exact Update Map for the 5 Regression Harnesses in `~/workspace/scratch/`

In Stage 3 (`bf68cfc`) and the placement-write extraction (`eb0de3e`), three large modules were split into ordered sub-modules in `app/data/build-bundle.py`:

- `02o-ratings-scales.js` → **`02o-ratings-scales.js`** + **`02o1-node-engine.js`** + **`02o2-stance-scales.js`**
- `03e-history-clipboard-marks.js` → **`03e-history-clipboard-marks.js`** + **`03e1-mark-dialog.js`** + **`03e2-custom-nodes-Batch.js`**
- `03f1-polygon-math.js` → **`03f1-polygon-math.js`** + **`03f1-placement-write.js`** + **`03f1a-tri-tetrad-widgets.js`** + **`03f1b-compass-pentad-widgets.js`**

Here is the exact fix for each of the 5 harnesses:

### A. `~/workspace/scratch/cross-slider-harness.js` (37 passed, 5 failed)
- **Cause:** Stage 4 (`6acbc96`) renamed the minified 2-letter functions `To` and `Fo` inside `app/js/modules/03e1-mark-dialog.js`.
- **Update:**
  - Rename `To` → **`sxStoreFlankRating`** (`app/js/modules/03e1-mark-dialog.js:469`).
  - Rename `Fo` → **`sxClearTopicRating`** (`app/js/modules/03e1-mark-dialog.js:526`).
  - If the harness reads `03e-history-clipboard-marks.js`, point it at **`app/js/modules/03e1-mark-dialog.js`** (and also load **`app/js/modules/03f1-placement-write.js`** if testing dual-placement mirroring via `sxWritePlacement`).
- **Behavior check:** Parameter signatures `(e, t, n, i = !0, a = null)` and `(e, t, n = !0, i = null)` are identical. In commit `9baa6ec`, `sxStoreFlankRating` also mirrors flat pole/line writes on a dual topic into the `"advocacy"` (or `"give"` on classic n-pole) placement via `sxWritePlacement` when `sxWritePlacement` and `sxDualPlacements` are present in scope.

---

### B. `~/workspace/scratch/taper-fix-harness.js` (`ReferenceError: sxInterestColor is not defined`)
- **Cause:** `INTEREST_STOPS` and `sxInterestColor` moved from `02o-ratings-scales.js` into **`app/js/modules/02o2-stance-scales.js`** (lines 1–15).
- **Update:**
  - Load **`app/js/modules/02o2-stance-scales.js`** alongside `02o-ratings-scales.js` (or concatenate `02o-ratings-scales.js` + `02o1-node-engine.js` + `02o2-stance-scales.js` whenever a harness wants the full `02o` scope).
- **Behavior check:** Zero behavioral change to `INTEREST_STOPS` or `sxInterestColor`.

---

### C. `~/workspace/scratch/cross-slider-stance-harness.js` (`marker not found: function sxIsStanceSkin() {`)
- **Cause:** `sxIsStanceSkin` was **not** renamed — its declaration is still `function sxIsStanceSkin() {`, moved from `02o-ratings-scales.js` to **`app/js/modules/02o1-node-engine.js:392-402`**. Meanwhile:
  - `sxTopicPoles`, `sxPlacementIntensity`, `sxPlacementMirrors`, and `sxDecodeTopicStance` are in **`app/js/modules/02o2-stance-scales.js:211-493`**.
  - `sxPersistIntensity`, `sxDualPlacements`, `sxWritePlacement`, `sxPersistAdvocacyReceptivity`, `sxStorePolygon`, and `sxClearAdvocacyReceptivity` are in **`app/js/modules/03f1-placement-write.js:1-215`**.
- **Update:**
  - Read `function sxIsStanceSkin() {` from **`app/js/modules/02o1-node-engine.js`**.
  - Read `sxTopicPoles` / `sxPlacementIntensity` / `sxPlacementMirrors` / `sxDecodeTopicStance` from **`app/js/modules/02o2-stance-scales.js`**.
  - Read `sxWritePlacement` / `sxPersistAdvocacyReceptivity` / `sxClearAdvocacyReceptivity` / `sxDualPlacements` from **`app/js/modules/03f1-placement-write.js`**.
- **Behavior check (intentional change in `9baa6ec`):**
  - In `sxDecodeTopicStance` (`app/js/modules/02o2-stance-scales.js:355` and `:406`), `const primary = hasAdv ? n.advocacy : n.receptivity;` was changed to **`const primary = hasAdv ? n.advocacy : null;`** (and on classic n-pole, `const primary = hasGivePl ? n.give : null;`).
  - Why: Advocacy is mirrored onto the flat record on write via `sxWritePlacement`, and receptivity stays strictly on `res.receptivity` — a receptivity-only record no longer promotes receptivity into the primary/flat line (`res.line` / flat `res[poleKey]`). If any assertion in `cross-slider-stance-harness.js` expects a receptivity-only write to populate flat `res.line` or flat `res[k]`, update that assertion to read `res.receptivity.line` / `res.receptivity[k]` / `res.receptivityIntensity`.

---

### D. `~/workspace/scratch/harness-unify-row-cross.js` (`marker not found: function sxPlacementIntensity(p) {`)
- **Cause:**
  - `function sxPlacementIntensity(p) {` and `function sxPlacementMirrors(res) {` moved from `02o-ratings-scales.js` to **`app/js/modules/02o2-stance-scales.js:264-285`**.
  - The placement write functions (`sxPersistIntensity`, `sxDualPlacements`, `sxWritePlacement`, `sxPersistAdvocacyReceptivity`, `sxStorePolygon`, `sxClearAdvocacyReceptivity`) moved from `03f1-polygon-math.js` to **`app/js/modules/03f1-placement-write.js:1-215`**.
  - `To` / `Fo` in `03e1-mark-dialog.js` are now `sxStoreFlankRating` / `sxClearTopicRating`.
- **Update:**
  - Point the `02o` file loader at **`app/js/modules/02o2-stance-scales.js`** (or concatenate `02o-ratings-scales.js` + `02o1-node-engine.js` + `02o2-stance-scales.js`).
  - Point the `03f1` placement-write loader at **`app/js/modules/03f1-placement-write.js`**.
  - Point any `03e` rating-store loader at **`app/js/modules/03e1-mark-dialog.js`** (`sxStoreFlankRating` / `sxClearTopicRating`).
- **Behavior check:** `sxPersistAdvocacyReceptivity(topicId, mode, values, intensity, profileId)` is preserved in `03f1-placement-write.js:103-107` as a thin wrapper around `sxWritePlacement(topicId, mode, value, profileId)`. Note the `9baa6ec` receptivity-only read change described in **C** above.

---

### E. `~/workspace/scratch/harness-a-wheel-10x.js` ("exactly four n-pole wheel step sites exist" — found 3 instead of 4)
- **Cause:** All 4 wheel-step sites (`const step = (evt.shiftKey ? 50 : 10) * (evt.deltaY < 0 ? 1 : -1);`) still exist unchanged, but Stage 3 (`bf68cfc`) split `03f1-polygon-math.js` into `03f1-polygon-math.js`, `03f1a-tri-tetrad-widgets.js`, and `03f1b-compass-pentad-widgets.js`, moving the 4th site into `03f1b-compass-pentad-widgets.js`.
- **Exact 4 sites on `74e4ace`:**
  1. `app/js/modules/03f-polygon-widgets.js:455` (placard n-pole radar wheel handler)
  2. `app/js/modules/03f-polygon-widgets.js:695` (Hot List n-pole cell wheel handler)
  3. `app/js/modules/03f1-polygon-math.js:1069` (first-ring polygon canvas wheel handler)
  4. `app/js/modules/03f1b-compass-pentad-widgets.js:126` (placard triad/compass/pentad wheel handler)
- **Update:** Add **`app/js/modules/03f1a-tri-tetrad-widgets.js`** and **`app/js/modules/03f1b-compass-pentad-widgets.js`** to the list of files scanned by `harness-a-wheel-10x.js`.
- **Behavior check:** Zero behavioral change across all 4 sites.
