# Active Work Queue

> **Working Scratchpad.** This file tracks in-flight jobs, queued items, and
> open investigations. It is designed to be updated, struck through, and pruned
> frequently as tasks clear.
>
> For permanent architecture, standing engineering laws, model rules, and
> repository protocols, refer to [**`AI-Handover-Brief.md`**](file:///home/jason/Sexcapades-Web/AI-Handover-Brief.md).

**Maintenance rule (Jason, 2026-11-19).** When you finish or settle an item listed
here, strike it (`~~...~~`) or mark it settled as part of that same work. Prune
settled batches periodically so this list reflects only live items. (Pruned
2026-11-23: all settled items through the refactoring roadmap cleared; record
lives in git history, daily logs, and MEMORY.md.)

---

## 1. Active Priority Queue

Each item waits for Jason's kickoff; nothing here dispatches itself.

1. **Shel's Sync-Card Fit:**
   - Waiting on Shel's fresh complete profile copy (handle: `BothInches`).
   - When it arrives, measure her exact card payload against sync-card tiers (fit order 2 → 3 → 5 codes; the 4-code tier is unreachable and stays in code).
   - *Constraint:* No multi-card design is authorized until this measurement exists.

2. **Fetish Harvest, Then Analytics Reset:**
   - Harvest first: unmapped-fetishes script (`site-tree/harvest_unmapped.sh`) exports its ranked report from live DB (`~/domains/capades-data/flexcapades_data.db`).
   - Harvest script pointer configured to `~/domains/capades-data/flexcapades_data.db` (and Top 10 preview wired into `site-tree/get_stats.sh`).
   - *Constraint:* The counters reset only after Jason confirms the harvest export is verified.

3. **GibberWear / Scene Sentinel Track:**
   - Separate track carrying its own standing rulings.
   - Protocol rulings stand: profile KEY is identifier; `CHK:<profile-key>:<P|T>`; `ALL` = broadcast; keyless message = broadcast on receipt; BLE UUID.
   - **Watch copy NEVER mentions sexcapades.io.**
   - *Open:* Investigate audible-sounds cause (Jason, 2026-11-08: needs investigation, not guessing); entertainment idea (genre map + live group enjoyment meter) open.


4. **~~Per-Topic Glyphs for the Vanilla Skins (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-25).**
   - Ruled by Jason 2026-11-23: topic-icon inheritance ships first (topics wear their category's glyph; the generic star dies). After that, author a distinct, relevant glyph for EVERY topic on the vanilla skins, skin by skin, Nous first.
   - One commit per skin. A topic's glyph replaces the inherited category glyph for that topic only; categories keep theirs.
   - **All 20 Vanilla Skins Completed & Verified:** All 896 topics across all 20 vanilla skins have distinct, domain-relevant 24x24 SVG vector glyphs (`glyph` + `glyphLabel`), 0 category glyph collisions, 0 intra-skin duplicates, synced to hosted bundle, committed individually and pushed to `origin/main` (`087584d`, live deploy `bbb277f`).

5. **~~Promote Scribe, Scene Setter, Hot List & Scene Sentinel from dialogs to views (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-24).**
   - Ruled by Jason 2026-11-24: all four stop being modal windows and become views of the app under the same app header — the header (brand title, "?" docs, music button) is always present, so the skin picker, docs, and About are always reachable from them with no special cases.
   - Why: the switch-views menu already calls them views and lists them beside Hypermap, but they are built as `<dialog>` elements with their own titlebars floating over the map (Scene Setter `#negotiationDialog`, Scribe `#scribeChoiceDialog`, Hot List `#outlineDialog`, Scene Sentinel `#safetyDialog`). That mismatch is what forced the dialog-host workarounds in the view menu and skin menu, and what left the picker unreachable from inside them once the hidden triggers were removed.
   - Scope: the openers (`#openNegotiation`, `#scribeTab`, `#openSentinel`, the Hot List entry) and the view routers (`goSetter`, `goScribe`, `goList`, `goSafety` in `view-nav.js`) switch to showing a view section and hiding the map, instead of opening a modal. Each view keeps its own ▾ switch button (already present: `#negotiationViewButton`, `#scribeChoiceViewButton`, `#outlineMapViewButton`, `#safetyViewButton`); return is through the ▾ menu, Hypermap listed there like any other view.
   - *Ruled behavior — half-written work waits:* navigating away from Scribe, Scene Setter, Hot List, or Scene Sentinel and back restores the in-progress content exactly as left — no unsaved-changes prompt, no discard, no reset. State persists across view switches (hide/show, not destroy, or explicit save/restore — behavior is the contract, mechanism is the builder's call).
   - *Ruled behavior — map survives the round trip:* scroll, zoom, and selection on the Hypermap are preserved when leaving for any of these views and coming back. Verify, don't assume.
   - *Constraint — gating unchanged:* setter/safety still require 2+ profiles in multi-select, scribe still 1+ (already enforced by `refreshMenu` disabling the entries — keep it).
   - *Constraint — dialog-host workarounds:* the view menu's and skin menu's "move the menu into the open dialog" hosting exists only because these views were dialogs. Retire it for these four; keep the mechanism only if some other dialog still hosts a view-switch button — builder to check, not assume.
   - *Verification:* rebuild the data bundle after any module edit and grep-confirm the new code is IN the bundle; boot the packaged app in a real browser and confirm (a) each of the four opens as a view under the app header, (b) tap on the brand title opens the picker from inside each, (c) a half-written Scribe draft and a half-built Scene Setter agreement survive a round trip to the map and back byte-for-byte, (d) map scroll/zoom/selection survive the same round trip.
   - *Standing laws:* analytics NEVER disabled (gate_passed/session_stats to collect.php always collected, no opt-out); build timestamps America/Chicago; one builder at a time on the app artifact; timing table in the dispatch brief.
   - Implementation: converted `#outlineDialog`, `#safetyDialog`, `#negotiationDialog`, `#scribeChoiceDialog`, and `#scribeDialog` from `<dialog>` elements to `<section class="sx-app-view" hidden>` inside `<main class="shell">` below `header.intro`; updated `window.__sxDialog` in `view-nav.js` to toggle `open`/`hidden` and `document.body.dataset.sxView` while retiring dialog-host reparenting for `#viewNavMenu` and `#skinMenu`/`#skinNote`; preserved in-progress Scribe drafts, Scene Setter agreements (`reuseExistingPanel`), Hot List DOM/scroll/search/timer (`canResumeView`, `sxOutlinePausedByViewSwitch`), Scene Sentinel inputs (`hydratePre`, `renderGuide`), and Hypermap zoom/pan/multi-select across view round-trips.

6. **~~Heat slider vanilla extremes — Burning / Withdrawn (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-24).**
   - Ruled by Jason 2026-11-24: the heat slider (range −100 to +100, centre "Neutral · 0") wears one vanilla pair on every skin except Sexcapades: **Burning / Withdrawn**. Sexcapades keeps **Horndog / Turned off**. First ruled "Burning / Cold", then refined the same hour: the pair must convey urgency of discourse at the high end and frigidness/introversion at the low end — "Cold" says frigid but not introverted, so the low end is **Withdrawn**. The per-skin extremes table (21 pairs, proposed 2026-11-23) was rejected — too cluttery, complicates the guide.
   - Implementation: added `heatMax` (`Horndog` / `Burning`) and `heatMin` (`Turned off` / `Withdrawn`) to `SX_TERM_TABLE` in `skin-loader.js` and `sxTerm()` in `05b1-sync-compute.js`; wired `sxHeatZone()`, `#heatPopover` scale labels, `#heatValue`, and profile tab heat buttons with `data-sx-term`.

7. **~~Pair view goes fully live — veils, heat, and match lists follow the sources (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-24).**
   - Ruled by Jason 2026-11-24 19:43: veils and heat move the pair view too, and match lists go live too. SUPERSEDES the 2026-11-04 ruling ("a group profile does not update with members' veils or heats") and the 2026-10-27 owner ruling ("source-profile changes never move an existing match tab" — snapshot-source).
   - Mechanism (builder's call on the details): the source fingerprint (`sxComputeProfileFingerprint`, 05b1-sync-compute.js:1981) currently covers ratings + annotations + fantasy/tried flags only — extend it to cover veil state (`vpt`/`vht`) and heat (`sxcv.heat` per source) so a veil or heat change triggers `Rd` on the next map paint; `Rd` already reads the current heats when it recomputes. For the match lists: `sxRefreshGroupOwn` (05-compatibility.js) currently recomputes from the pair's own stored snapshots with source edits explicitly unread — change it to re-read the live source profiles, the same way `Rd` does.
   - *Ruled — Group Heat (Jason, 2026-11-24 19:45):* the pair's flame is the LOWER of the two members' heats. The pair never runs hotter than its cooler member. *Veil — RULED DROPPED (Jason, 2026-11-24 19:52):* the group veil goes, asymmetry and all — the pair tab shows the flame only, no veil control. His reasoning: the per-person veils already do all the gating, and displaying a group veil would either say almost nothing (open person's level) or reveal too much (closed person's level, and guardedness is itself private). *Edge case noted (19:59):* a couple that only "plays together" can be stranded by group matching, which plays to the largest number and can leave one out — a group veil might be appropriate there. Open whether the veil is the right instrument (it hides what's shown) or whether "don't split us" is a matching rule (what gets recommended), which a veil alone can't enforce. **REINSTATED (20:03):** the drop is superseded — the group veil comes back as the hiding part, set independently (the pair's outward veil is its own level; the couple may be less open to others than to each other), and the couple is treated as a UNIT in matching (don't split us). The play-together case is common, not an edge case. **Nested-live build in order:** refresh walks the tree inner-first — recompute inner groups before outer ones, so a member's change reaches a nested pair without visiting the inner pair first.
   - Implementation: extended `sxComputeProfileFingerprint()` to include veil state (`vht`/`vpt`), heat (`sxHeatDisplayFor`), and recursive inner source fingerprints; updated `sxEnsurePseudoProfileCurrent()` and `sxRefreshGroupOwn()` to walk the group tree inner-first and recompute from live source profiles and live heats/veils; changed `sxGroupHeatDefault()` to take `Math.min` (lower) of the live member heats; enabled independent group outward veil (`Ma`, `Ia`, `sxTopicPassesVeil`, `Mv`) while treating nested pair/group profiles as units in matching.

8. **~~flex.capades.io shows NSFW links to sex.capades.io docs and views — vanilla guard breach (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-25, commit `53d8376`).**
   - Reported by Jason 2026-11-25 02:15, live on flex.capades.io.
   - Implementation: added `flex`, `bio`, `lingua`, `fast` to `SKINS` in `app/js/docs-skin.js` (synced byte-identically to `hosted/app-assets/docs-skin.js` and `hosted/js/docs-skin.js` via `build-bundle.py`); changed unknown-host fallback from `"sex"` to `"flex"` (fail vanilla, never sex); added `Sex.capades.io`/`sex.capades.io` to `VANILLA_RULES` and extended href rewrite to cover `sex.capades.io` and `www.sex.capades.io`; loaded `docs-skin.js` and guarded sex-only links in `sitemap.html` and `hosted/guides.html`; neutralized `picker.html` kink wording; hid `#gateCompareLinkItem` on `flex`/picker in `gate.js`/`gate.html`; updated `skinForHostname` (`skin-catalog.js`, `skin-loader.js`, `02a-taxonomy-models.js`) and inline title bootstrap (`app/sexcapades-5.0.html` / `hosted/app.html`) so `flex.capades.io` defaults to vanilla (`poliscapades`) with `Flex.Capades.IO` title (never `"Flexcapades - Sex.Capades.IO"`).

9. **~~Custom give/receive wordings GONE from Sexcapades (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-25, commit `40ea47f`).**
   - Reported by Jason 2026-11-25 02:15: the placard/map showed generic Give/Receive everywhere instead of custom per-topic wording.
   - Implementation: updated both `We` builders (`02g-definitions-ratings.js`, `02i-taxonomy-catalog.js`) to deep-walk `cat.topics`, `cat.parentTopics`, `sub.topics`, and `sub.parentTopics` via `sxSyncRoleLabels()`; hooked `sxSyncRoleLabels()` into `window.__SX_SKIN_LAYOUT_SYNC()` (`03e-map-paint.js`) so `We` (all 188 `give_receive` entries, e.g. `t0023` Scarf bondage `["bind", "be bound"]`, `t0051` Sadomasochism `["Sadism", "Masochism"]`, `t0021` Pro Domme `["be the domme", "submit to a domme"]`) and `Ue` (all `single` topics while preserving the 55 hardcoded exclusions) populate after `sexcapades.json` loads post-Phase-5; also included `parentTopics` in `registerWidgets()` (`skin-loader.js`). Rebuilt and verified across all bundle copies; zero skin JSON files modified.

10. **~~Placard pair topics: ONLY the cross slider — remove the duplicated sliders (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-25, commit `091bcc3`).**
    - Ruled by Jason 2026-11-25 02:21: placard pair-topic section keeps only the "Cross Slider" header, Clear button, and `#markCrossSliderHost`.
    - Implementation: removed `#markCrossFine` (4 fine-tune sliders) and `#markSwitchboxReadout` (4 stat chips) from `app/sexcapades-5.0.html` and synced `site-tree/public_html/hosted/app.html`; removed fine-tune listeners and `sxSyncCrossFineAndReadout()` (plus its calls) from `03e1-mark-dialog.js`; guarded `sxSyncLinearIntensities()` with `crossActive` so both `#markSwitchboxIntensityBox` and `#markLinearIntensityBox` stay hidden whenever the cross slider is active while preserving intensity boxes for linear sliders and n-pole widgets, and keeping the hot-list compact cross slider untouched. Rebuilt and verified across all HTML and bundle copies.

11. **Fores: add Sumerian religion as a worldview archetype (another AI's lane — Grok/Cursor or Gemini; AFTER Gemini's icon pass):**
   - Ruled by Jason 2026-11-25 02:49: Sumerian religion joins Fores as a worldview archetype — sourced from the Sumerian texts IN GENERAL, not just Gilgamesh: the Eridu Genesis flood (Ziusudra — the flood source itself, older than Gilgamesh's retelling), Enki and Enlil (Enlil sends the flood, Enki warns), the Anunnaki (the divine assembly), Inanna, the me (divine decrees/law), Kur (the afterlife). NOT the figure Gilgamesh; the religion as a worldview.
   - Why it earns its place: the flood story is the direct ancestor of the Noah story every Abrahamic stack on the map carries — shared DNA, not a garnish. It would be the oldest voice on the map by over a thousand years (oldest layer now is Maimonides, 1190).
   - Scope note: the corpus crosses into Babylon (Standard Babylonian Gilgamesh, Enuma Elish survive through Babylonian copies) — the entry is Mesopotamian in scope even if named Sumerian. Name the entry "Sumerian Religion" (key `for-sumerian`, following the `for-<slug>` pattern); exact display name is the builder's call with Jason's veto.
   - Line-drawing (Jason's ruling context): admitted on the flood-ancestry principle. Egypt has a thinner version of the same claim (Exodus setting, wisdom literature, Akhenaten) — a hearing, not a seat; separate decision, not compelled by this one. The Vedas are NOT part of this door — living scripture, a separate Eastern-traditions question. The map is curated, not complete; Sumerian in does not compel Egypt in.
   - Build: add one entry to the `samples` dict in `app/data/skins/forescapades.json` (BOTH copies: app + hosted), same shape as the three personas (`for-traditionalist-guardian` etc.): `{name, count: 100, about, links, payload: {app: "sexcapades", version, noFlash: true, profileName, archetype, aboutMe, ratings: {<all 100 topics>}}, skin: "forescapades", kind: "archetype", emblem: "images/emblems/for-sumerian.svg"}`. Ratings follow the sample formula (receptivity = round-half-even(openness × advocacy) per pole; each placement's intensity = its signed largest-|value| pole). Ratings are a scholarly RECONSTRUCTION of the Sumerian worldview, not a confession — flag that in the `about` text. Emblem required (standing law) — motif is the builder's call (cuneiform, Anunnaki star, Enki's waters are candidates), Jason's veto stands. Do NOT touch skin files until Gemini's icon pass is done — sequence this build after it.
   - *Verification:* the entry loads in the app's Archetypes menu; all 100 topics rated (no missing keys); emblem renders; boot the packaged app and open the archetype's map.
   - *Standing laws:* analytics NEVER disabled; build timestamps America/Chicago; one builder at a time on the app artifact; timing table in the dispatch brief.

---

## 2. Open Carry-Overs & Backlog

Items to verify or address when relevant to their subsystem:

- **Cold-Open Acceptance:** Owed on the whole 2026-11-21/22 stack (axis conversions, circle-minus measure, operations/Scribe/advocacy builds, the palimpsest, the Sadomasochism reorganization, and the icon repair when it lands). Jason's eye is the settlement.
- **`cloudLabel -30` Residual:** A very long font-fitted label can still run under the icon by up to `iconR - 30`. Check if 2026-11-18 label tightness fully resolved this in practice.
- **The 7 Ambiguous Sliders (pending Shel):**
  - Sliders with text: Nyotaimori ("lie as platter / eat from body"), Siblings ("be the sister / be the brother"), Superheroes ("be the hero / be the villain").
  - Topics without sliders (pole hints only): Growth / shrinking, Size contrast, Surrogacy, Hotwife (live row is Bull / Hotwife / Cuckold triad `t0281`).
- **Triangle Palette:** Barycentric corners currently use red / green / blue; center is the mix, not black, and does not deepen as pole numbers spread. Check if spec adjustment is desired.
- **GibberWear Tester Count:** Currently at 3 of 12; 14-day testing bar pending.
- **Paddle Formula Live Flip:** `capEnd` matches; live flip verification check (crossing numbers move, placard ratings survive reload) open.
- **Shortcuts View:** Leave until named by Jason (do not invent a screen).
- **z90 Bet — Action-Count Run:** Settlement instrument replaced 2026-11-22: the bet settles if rating one n-pole topic on the un-tangled map takes fewer than 7 actions (counting advocacy, receptivity, and intensities). A counted run of the real rating flow is still owed.
- **~~Stance-Skin Taper Labels:~~** ~~Spoke stem aria/tooltip labels still derive from give/receive and read "Unrated" on stance skins (follow-up to the 2026-11-22 advocacy/receptivity tapers).~~ **Settled 2026-11-23:** Spoke stems and `va`/`$a`/`Jn` now resolve to Advocacy/Receptivity with correct intensity ratings on stance skins and placement intensities on n-pole topics.
- **Sample Flags (second looks done 2026-11-23):** Sunni Predestination + Grace — CORRECTED 2026-11-23 (both all-zeros defects restored from the 933 layer profile; Jason approved, including the Grace extension). Lutheran faith-formed-by-love −80 — STANDS: the sample is confessional by its own stated basis (Augsburg Confession; LCMS declined the Joint Declaration), so −80 is coherent, not an error; moving it to the 1999 layer's −30 would be a basis change, and would drag the Reformed sample (also −80) with it.
