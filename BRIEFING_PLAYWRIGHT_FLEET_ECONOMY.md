# Playwright Fleet Economy: Token-Saving Video Review and Analytics Shielding
*AI Briefing for Autonomous Agents & the Principal Investigator*

**Subject:** Playwright fleet — two economy tricks (video frame-diff review; fleet utm tag)
**Author:** YoBiche (Yolanda Biche) & Principal Investigator Jason Mark Wrinkle
**Status:** Reference — both tricks built and proven in prototype; the utm-tag fix is in the repo, the video pipeline is a prototype awaiting a verdict on wider use.
**Date:** 2026-11-15

---

## 1. Why this briefing exists

The fleet is the heaviest token draw YoBiche has. Two tricks cut that cost without cutting coverage, and both were at risk of being lost — neither had a standalone write-up; both lived only in conversation and daily memory notes. This briefing records them in one place so they survive.

---

## 2. Trick 1 — Frame-diff video review: agents read diffs, not live browsers

### 2.1 The idea (Jason, 2026-11-13)

Record Playwright running the testing protocols on video, then have a team of Muse agents review the video instead of driving browsers live. The point is token economy: a live-driving squad session is two hours of screenshot-plus-reasoning turns; a video review is a handful of images.

### 2.2 The pipeline

Four stages, each one cutting the image count before an agent ever sees it:

1. **Record.** Playwright records the test run on video. The fleet config already records video on failure (`video: "retain-on-failure"`); the prototype ran with `video: "on"`.
2. **Sample every 15th frame.** Jason's call — "I would guess every 15th frame would be plenty." At 25 fps that is roughly a frame every half second, enough to see the map render, move, and settle, or catch a failure. A total-frame cap applies too — even every 15th frame can be overkill for a short check.
3. **ffmpeg frame-differencing.** Two filters do the "only send if different" work:
   - `mpdecimate` drops any frame that is a near-duplicate of the one before it, so a frozen or settled screen collapses to one frame.
   - `select` with scene detection catches the bigger jumps.
   After this stage, only frames where something actually changed survive.
4. **Graphical diff (gdiff) over the survivors.** Jason's addition — "a graphical diff would REALLY focus on just the changes." The diff pre-computes the change itself: instead of handing the agent two full frames and making it hold both in mind and hunt for what moved, it gets the diff image directly — changed pixels highlighted in red on black, tracing the actual shapes of what moved.

The reviewer agent then judges the check from the diff images plus the first and last full frames only — a handful of images instead of a live-driving session.

### 2.3 Prototype results (S2-01, 2026-11-13)

Built and run the same day Jason proposed it. Prototype files live at `~/workspace/scratch/anneal-timing/video-proto/`:

- **Config:** `playwright.config.video-proto.js` (video "on", output outside the repo, chromium-1243 via absolute executablePath).
- **Recording:** `video.webm`, 247K, 15.12s, 800×554 @ 25fps, served from the snapshot on port 8001.
- **Sampling:** every 15th frame → 26 frames.
- **Diff script:** `frame_diff.py` (Pillow ImageChops; a pixel counts changed if any channel differs by >12).
- **Threshold tuning:** at the first threshold (0.05% of pixels) 23/26 frames survived — a pulsing element churns ~300–400 px/frame, above that floor — so the threshold was raised to 0.2%, keeping **6 frames: the baseline plus 5 diffs** (f_002 99.7% changed = massive initial paint; f_003 0.23%; f_022 0.29%; f_023 5.7% = the big late change; f_024 0.53%). **20 near-identical frames dropped.**
- **Diff images:** `diffs/` (changed pixels red on black).
- **Reviewer agent dispatched** to judge S2-01 from the 5 diff images + first/last full frames only (7 images) and report whether the diffs alone sufficed and the image count vs live-driving cost — **result pending at the time; no verdict recorded yet.**

### 2.4 Tool survey (2026-11-13)

The programmatic graphical-diff options:

- **ImageMagick `compare`** (CLI, highlights differing pixels red + prints changed-pixel count).
- **Python Pillow / ImageChops** (`ImageChops.difference`, pixel subtraction) — what the prototype used.
- **odiff** (fast standalone CLI built for visual regression).

The rest of the surveyed results (Diffchecker, Ybug, Img2Go, theimgapp, MaxAI, Easy Image Compare, Oxford Image Compare) are manual browser/desktop tools, not pipeline-suitable. On this VM neither ImageMagick nor odiff is installed; **Pillow 10.2.0 + numpy are available and were used.**

The prototype's Pillow/ImageChops diff does **not** box regions — it highlights the exact changed pixels in red on black, tracing actual shapes (header bar, viewport outline, error text/buttons in f_023). Some surveyed tools (e.g. Ybug) do draw bounding boxes; this implementation does not.

### 2.5 What the diff did and did not pick up

- **On animation:** the diff did NOT pick up animation frames in S2-01 — because there was no map animation to pick up. After the initial paint, the only per-frame change was a small pulsing cluster (~200–1,000 px per sampled frame, the loading/boot indicator), then the error panel appeared, then the screen went fully static. Had nodes been settling/annealing, the diff would have shown large red regions sweeping the map area frame after frame.
- **Gdiff on animation — TESTED (2026-11-13 ~13:57 CST):** a 44s standalone recording (74 sampled frames, every 15th) → gdiff kept 48 frames (sustained 0.2–0.7% changes + big renders, one ~50% of screen) — **motion IS picked up**. BUT the motion captured was the loading progress + a portrait photo filling the viewport, NOT node animation: the viewport sits zoomed in on the centre portrait even though 1336 nodes are in the DOM (nodes off-screen). A true node-animation gdiff test still needs a video where the nodes are actually visible and moving.

### 2.6 The limitation — when it pays and when it does not

Video review is **only a targeted win, not a fleet-wide replacement.** The fleet is already split the cheap way: Playwright does the mechanical checks and hands back cheap text results, and the squads only do the behavioral audit. Video review trades live driving's screenshot-plus-reasoning turns for frame-reading — and frames are images that cost tokens. A minute at 1 fps is ~60 images, so **long clips can cost MORE than the session they replace.** It pays only for short, sparse clips of genuinely motion-dependent checks (anneal animation, flicker, transitions).

And one hard limit: **diffs alone can't tell a rendered map from an error panel, so full frames stay.** The review set is always the diffs plus the first and last full frames — the full frames are what let the reviewer see what the screen actually is, not just what changed.

---

## 3. Trick 2 — Fleet utm tag: keep test traffic out of the visitor count

### 3.1 The problem (Jason, 2026-11-12 ~21:33 CST)

`get_stats` in `collect.php` counted DISTINCT uuid across ALL events with no filter. Every fleet launch gets a fresh anonymous UUID, and QA and live share the same SQLite DB, so the single global "Site visitors" count is what the fleet inflates — **~413 (Nov 8) to ~2941 (Nov 12 evening), most of that fleet.**

### 3.2 The fix (landed in repo, commit 8272172, 2026-11-12 ~21:50 CST)

`get_stats` in `site-tree/public_html/hosted/api/collect.php` now excludes `utm_source LIKE 'fleet%'` from all four counts (unique_visitors, gate_passed, quickstart_started, quickstart_completed). Verified byte-for-byte.

**Collection itself is unchanged** — events are still collected, just tagged — so the analytics-never-disabled law is intact, and fleet traffic can still be counted separately.

The mechanism uses what already existed: the app already reads `utm_source` from the URL into sessionStorage and sends it with every event, and the events table already has a `utm_source` column. So fleet loads the app with `?utm_source=fleet` and the count query excludes that source.

### 3.3 The tag rule

The base fleet briefing (`AI_FLEET_TESTING_BRIEFING.md`) now **REQUIRES every fleet load to carry `?utm_source=fleet`.**

The Playwright fleet tag (commit e66704e): `openApp` → `/qa/app.html?verified=1&utm_source=fleet${hash}`.

### 3.4 The catch — future only

It stops future inflation only. The ~2,500 fleet UUIDs already in the DB carry an empty `utm_source` and are indistinguishable from real visitors, so they cannot be cleanly removed retroactively — a reset would lose real history too.

### 3.5 Deploy and outstanding item

The change is in the repo (main); it reaches the live `collect.php` with the next deploy-all.

**Still owed:** Jason adds `?utm_source=fleet` to the Playwright base URL before his next run — tracked item `goal_42a478232bb4` ("Playwright fleet tag"). Remind him when Playwright comes up or when the focused chrome+edge re-run is asked for.

---

## 4. Quick reference

| Trick | What it saves | How | Where it lives |
|---|---|---|---|
| Frame-diff video review | Tokens — agents read ~7 images instead of driving a live browser for two hours | Every 15th frame → ffmpeg `mpdecimate`/`select` → gdiff (changed pixels red on black) → reviewer judges diffs + first/last full frames | Prototype: `~/workspace/scratch/anneal-timing/video-proto/` |
| Fleet utm tag | Visitor-count accuracy — fleet traffic excluded from the public count | Every fleet load carries `?utm_source=fleet`; `get_stats` excludes `utm_source LIKE 'fleet%'` | Repo commit 8272172; briefing rule in `AI_FLEET_TESTING_BRIEFING.md` |
