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


4. **Per-Topic Glyphs for the Vanilla Skins (another AI's lane — Grok/Cursor):**
   - Ruled by Jason 2026-11-23: topic-icon inheritance ships first (topics wear their category's glyph; the generic star dies). After that, author a distinct, relevant glyph for EVERY topic on the vanilla skins, skin by skin, Nous first.
   - One commit per skin. A topic's glyph replaces the inherited category glyph for that topic only; categories keep theirs.
   - **Nouscapades per-topic glyphs:** DONE (2026-11-23). All 39 topics assigned distinct, relevant 16x16 vector glyphs.

5. **Promote Scribe, Scene Setter, Hot List & Scene Sentinel from dialogs to views (another AI's lane — Grok/Cursor):**
   - Ruled by Jason 2026-11-24: all four stop being modal windows and become views of the app under the same app header — the header (brand title, "?" docs, music button) is always present, so the skin picker, docs, and About are always reachable from them with no special cases.
   - Why: the switch-views menu already calls them views and lists them beside Hypermap, but they are built as `<dialog>` elements with their own titlebars floating over the map (Scene Setter `#negotiationDialog`, Scribe `#scribeChoiceDialog`, Hot List `#outlineDialog`, Scene Sentinel `#safetyDialog`). That mismatch is what forced the dialog-host workarounds in the view menu and skin menu, and what left the picker unreachable from inside them once the hidden triggers were removed.
   - Scope: the openers (`#openNegotiation`, `#scribeTab`, `#openSentinel`, the Hot List entry) and the view routers (`goSetter`, `goScribe`, `goList`, `goSafety` in `view-nav.js`) switch to showing a view section and hiding the map, instead of opening a modal. Each view keeps its own ▾ switch button (already present: `#negotiationViewButton`, `#scribeChoiceViewButton`, `#outlineMapViewButton`, `#safetyViewButton`); return is through the ▾ menu, Hypermap listed there like any other view.
   - *Ruled behavior — half-written work waits:* navigating away from Scribe, Scene Setter, Hot List, or Scene Sentinel and back restores the in-progress content exactly as left — no unsaved-changes prompt, no discard, no reset. State persists across view switches (hide/show, not destroy, or explicit save/restore — behavior is the contract, mechanism is the builder's call).
   - *Ruled behavior — map survives the round trip:* scroll, zoom, and selection on the Hypermap are preserved when leaving for any of these views and coming back. Verify, don't assume.
   - *Constraint — gating unchanged:* setter/safety still require 2+ profiles in multi-select, scribe still 1+ (already enforced by `refreshMenu` disabling the entries — keep it).
   - *Constraint — dialog-host workarounds:* the view menu's and skin menu's "move the menu into the open dialog" hosting exists only because these views were dialogs. Retire it for these four; keep the mechanism only if some other dialog still hosts a view-switch button — builder to check, not assume.
   - *Verification:* rebuild the data bundle after any module edit and grep-confirm the new code is IN the bundle; boot the packaged app in a real browser and confirm (a) each of the four opens as a view under the app header, (b) tap on the brand title opens the picker from inside each, (c) a half-written Scribe draft and a half-built Scene Setter agreement survive a round trip to the map and back byte-for-byte, (d) map scroll/zoom/selection survive the same round trip.
   - *Standing laws:* analytics NEVER disabled (gate_passed/session_stats to collect.php always collected, no opt-out); build timestamps America/Chicago; one builder at a time on the app artifact; timing table in the dispatch brief.

6. **~~Heat slider vanilla extremes — Burning / Withdrawn (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-24).**
   - Ruled by Jason 2026-11-24: the heat slider (range −100 to +100, centre "Neutral · 0") wears one vanilla pair on every skin except Sexcapades: **Burning / Withdrawn**. Sexcapades keeps **Horndog / Turned off**. First ruled "Burning / Cold", then refined the same hour: the pair must convey urgency of discourse at the high end and frigidness/introversion at the low end — "Cold" says frigid but not introverted, so the low end is **Withdrawn**. The per-skin extremes table (21 pairs, proposed 2026-11-23) was rejected — too cluttery, complicates the guide.
   - Implementation: added `heatMax` (`Horndog` / `Burning`) and `heatMin` (`Turned off` / `Withdrawn`) to `SX_TERM_TABLE` in `skin-loader.js` and `sxTerm()` in `05b1-sync-compute.js`; wired `sxHeatZone()`, `#heatPopover` scale labels, `#heatValue`, and profile tab heat buttons with `data-sx-term`.

7. **Pair view goes fully live — veils, heat, and match lists follow the sources (another AI's lane — Grok/Cursor):**
   - Ruled by Jason 2026-11-24 19:43: veils and heat move the pair view too, and match lists go live too. SUPERSEDES the 2026-11-04 ruling ("a group profile does not update with members' veils or heats") and the 2026-10-27 owner ruling ("source-profile changes never move an existing match tab" — snapshot-source).
   - Mechanism (builder's call on the details): the source fingerprint (`sxComputeProfileFingerprint`, 05b1-sync-compute.js:1981) currently covers ratings + annotations + fantasy/tried flags only — extend it to cover veil state (`vpt`/`vht`) and heat (`sxcv.heat` per source) so a veil or heat change triggers `Rd` on the next map paint; `Rd` already reads the current heats when it recomputes. For the match lists: `sxRefreshGroupOwn` (05-compatibility.js) currently recomputes from the pair's own stored snapshots with source edits explicitly unread — change it to re-read the live source profiles, the same way `Rd` does.
   - *Ruled — Group Heat (Jason, 2026-11-24 19:45):* the pair's flame is the LOWER of the two members' heats. The pair never runs hotter than its cooler member. *Veil — RULED DROPPED (Jason, 2026-11-24 19:52):* the group veil goes, asymmetry and all — the pair tab shows the flame only, no veil control. His reasoning: the per-person veils already do all the gating, and displaying a group veil would either say almost nothing (open person's level) or reveal too much (closed person's level, and guardedness is itself private). *Edge case noted (19:59):* a couple that only "plays together" can be stranded by group matching, which plays to the largest number and can leave one out — a group veil might be appropriate there. Open whether the veil is the right instrument (it hides what's shown) or whether "don't split us" is a matching rule (what gets recommended), which a veil alone can't enforce. **REINSTATED (20:03):** the drop is superseded — the group veil comes back as the hiding part, set independently (the pair's outward veil is its own level; the couple may be less open to others than to each other), and the couple is treated as a UNIT in matching (don't split us). The play-together case is common, not an edge case. **Nested-live build in order:** refresh walks the tree inner-first — recompute inner groups before outer ones, so a member's change reaches a nested pair without visiting the inner pair first.
   - *Verification:* rebuild the data bundle after any module edit and grep-confirm the new code is IN the bundle; boot the packaged app, change a member's veil, heat, and a rating in turn, and confirm the pair map AND the match lists update without re-minting the pair.
   - *Standing laws:* analytics NEVER disabled (gate_passed/session_stats to collect.php always collected, no opt-out); build timestamps America/Chicago; one builder at a time on the app artifact; timing table in the dispatch brief.

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
