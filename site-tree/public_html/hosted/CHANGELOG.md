# Sexcapades 2.0 Changelog

Pre-release build history. Each entry is a single-file build (`app-<BUILD>.html`).

## 2026-10-12_1518 (pending)
- Taper bases now follow a circular arc hugging the ring (ant-fucking detail for
  first impression). Base is 5 points along the circle at the anchor radius.
- White inner stripe thickened to 50% (was 30%) for visibility.
- Flare increased to 2.5x base width.

## 2026-10-12_1501
- Restored to 1444 baseline (working tapers + samples). Backing out the 1447–1455 patch
  series that broke taper rendering.

## 2026-10-12_1444
- Tapers finally visible: rewrote split-taper generation to use coordinates directly
  instead of parsing the path string (the regex was failing silently).
- User confirmed seeing give/receive color differentiation on tapers.

## 2026-10-12_1441
- Pre-filled gender/sexuality in all 6 sample profiles (no more edit-profile dialog
  on sample load).

## 2026-10-12_1440
- Narrowed center midline to 35% width (was 50%) so give/receive flanks are more prominent.

## 2026-10-12_1437
- Samples load at last: fixed `sample.name`/`sample.count` to match chooser validation,
  `payload.noFlash: true` on all six.

## 2026-10-12_1432 / 1434 / 1436
- Sample-profile loading attempts (still reported "bundled sample is invalid").

## 2026-10-12_1422
- Embedded 6 synthetic sample profiles inline (Alex/Strict Dom, Jordan/Strict Sub,
  Sam/Gay Top, Casey/Gay Bottom, Riley/Switch, Jason/Rope Bunny).
- Sample chooser labels/counts updated to personality names.

## 2026-10-12 (earlier)
- Three-part line spec implemented: rated lines draw top tapered flank (give color),
  broad uniform center (hanky color or dashed gray), bottom tapered flank (receive color).
- Fresh load: no tapering, broad center line only.
- Center broad midline never tapered; thin 2px midline deprecated.
- Black hanky centers get white visibility outline.

## 2026-10-14_2236
- Subcategory display present in this build (last build with subcategory display before 0317).
- NOTE: Changelog gap from 2026-10-14_0928 to 2026-10-14_2236 — YoBitch failed to update the changelog during snapshot packaging. The snapshot script was writing to the wrong path and using hardcoded stale entries. Fixed 2026-10-15.

## 2026-10-16_0004
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-16_0212
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-17_0301
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-17_0601
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-17_0727
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-18_2042
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-18_2202
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-18_2219
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-18_2244
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-18_2303
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-18_2356
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-19_1858
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-19_2158
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-20_0400
- (no changelog message provided - set CHANGELOG_MSG env var)

## 2026-10-20_0407
- (no changelog message provided - set CHANGELOG_MSG env var)
