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


4. **~~Per-Topic Glyphs for the Vanilla Skins (another AI's lane — Grok/Cursor / Gemini):~~** **DONE (2026-11-25).**
   - Ruled by Jason 2026-11-23: topic-icon inheritance ships first, followed by distinct vector glyphs for every topic across the vanilla skins.
   - Result: 100% glyph coverage across all vanilla skins (aesthcapades 44/44, biocapades 41/41, chemcapades 40/40, dancecapades 82/82, dharmacapades 34/34, expericapades 31/31, fastcapades 27/27, forescapades 100/100, linguacapades 34/34, mattercapades 29/29, nouscapades 51/51, philoscapades 23/23, poliscapades 97/97, praxicapades 26/26, quantacapades 30/30, questcapades 79/79, sexcapades 365/365, simulcapades 29/29, techcapades 33/33, theoricapades 31/31, vocapades 28/28). Only the newly minted Flexcapades (meta skin) awaits a glyph pass.

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
8. **~~flex.capades.io shows NSFW links to sex.capades.io docs and views — vanilla guard breach (another AI's lane — Grok/Cursor):~~** **DONE & ACCEPTED (2026-11-25).**
   - Implemented in `53d8376`: docs-skin.js defaults to Flexcapades, bio/lingua/fast/flex added to SKINS, sex.capades.io links rewritten, sitemap/guides/picker + flex app title guarded.
   - Cold-open accepted by Jason 2026-11-25.

9. **~~Custom give/receive wordings GONE from Sexcapades (another AI's lane — Grok/Cursor):~~** **DONE (2026-11-25).**
   - Fixed in both `We` builders (`02g:702`, `02i:2574`) to walk subcategories and parent topics.
   - Audited and assigned domain-specific labels across all remaining 77 generic fallback topics in Sexcapades (`b125618`); 0 generic G/R topics remain.

10. **Placard pair topics: ONLY the cross slider — remove the duplicated sliders (another AI's lane — Grok/Cursor):**
   - Ruled by Jason 2026-11-25 02:21 (screenshot `workspace/user/media_library/image/image-9c443667.png`): the placard's pair-topic section shows the cross slider AND four fine-tune sliders AND two vertical intensity sliders AND four stat chips — the same four numbers (give/receive leaning + appetite) written out several ways. The placard only needs the new cross widget, the way the hot-list popup already has it (compact cross slider only, no sliders, no chips).
   - What stays: the "Cross Slider" header + Clear button + `#markCrossSliderHost` (the two `sxCreateCrossSlider` instances, 03e1-mark-dialog.js:1050-1058). Puck position is the leaning, puck color is the appetite, the numeric bubble shows numbers while dragging — that is the whole rating control.
   - What goes, in BOTH app HTML copies (`app/sexcapades-5.0.html` and `site-tree/public_html/hosted/app.html`, same lines): `#markCrossFine` (fine-tune sliders markCrossFineGiveLean/GiveApp/RecvLean/RecvApp + outputs, ~3158-3163); `#markSwitchboxReadout` (four stat chips markCrossGiveLeanVal/GiveAppVal/RecvLeanVal/RecvAppVal, ~3176-3181); `#markSwitchboxIntensityBox` (vertical Adv/Rec intensity sliders) — must stay hidden whenever the cross slider is the active control, since it duplicates appetite; same for `#markLinearIntensityBox` if it can show on a pair topic.
   - JS (`app/js/modules/03e1-mark-dialog.js`): remove the fine-tune binding (the `fine` array + input/change listeners in `sxBindCrossSliderPlacard`, ~1059-1085) and the fine/readout sync (`sxSyncCrossFineAndReadout`, ~1087+, including its calls from `sxCrossPlacardWrite` — the cross slider component's own render shows the state). In `sxSyncLinearIntensities` (~1169), keep both intensity boxes hidden when the cross slider is the active control. The intensity boxes serve other widget families (linear sliders, switchbox on stance skins, n-pole) and must stay for those; the removal is scoped to pair topics only. The `#markRatings` linear sliders are in a different wrap already hidden for pair topics (`setOnlyWrap(switchboxWrap)`) — no change needed there. The `.xs-fine` / `.xs-readout` CSS in both HTML files may stay (harmless) or be pruned — builder's call.
   - Note: the four fine-tune sliders + stat readout were part of the cross-slider build itself (c7a6512, per the mockup spec) — this ruling supersedes that part of the mockup. The hot-list popup compact variant is the reference design (already cross-slider-only).
   - *Verification:* rebuild the data bundle after any module edit and grep-confirm the new code is IN the bundle; boot the packaged app, open a pair topic's placard, confirm ONLY the cross slider shows (no fine-tune sliders, no vertical intensity sliders, no stat chips); drag a puck and confirm the rating still writes and survives reload; confirm the hot-list popup is unchanged; confirm non-pair topics (linear sliders, switchbox on stance skins, n-pole) still show their intensity boxes.
   - *Standing laws:* analytics NEVER disabled; build timestamps America/Chicago; one builder at a time on the app artifact; timing table in the dispatch brief.

11. **~~Fores: add Sumerian religion as a worldview archetype (another AI's lane — Grok/Cursor or Gemini; AFTER Gemini's icon pass):~~** **DONE (2026-11-25, commit `028ed1b`).**
    - Ruled by Jason 2026-11-25 02:49: Sumerian religion joins Fores as a worldview archetype (`for-sumerian`, "Sumerian Religion"), Mesopotamian in corpus scope (Eridu Genesis / Ziusudra flood, Atrahasis, Enki and Enlil, Anunnaki divine assembly, Inanna, the *me*, Enheduanna, Enuma Elish, Gilgamesh, and Kur).
    - Implementation: added `for-sumerian` to `samples` in both `app/data/skins/forescapades.json` and `site-tree/public_html/hosted/data/skins/forescapades.json` (100/100 topics rated, `openness = 0.50` with exact `round-half-even` receptivity and signed largest-`|value|` intensity, scholarly reconstruction flagged in `about`, Oxford ETCSL link); created 512×512 Dingir star + Abzu waters emblem SVG (`for-sumerian.svg`) across `app/images/emblems/`, `hosted/images/emblems/`, and `hosted/app-assets/images/emblems/`. Evaluated `@TheAncientSealUS` / `D56BjN1DfZM` ("The Sumerian Tablets Explain the Antichrist") and excluded its speculative/conspiratorial claims in favor of primary Assyriological sources.

12. **~~Sexcapades: audit & assign custom G/R labels across remaining 77 generic topics + unify Footwear labels:~~** **DONE (2026-11-25, commit `b125618`, live deploy `5660613`).**
    - Queued by Jason 2026-11-25 03:55.
    - Scope: audited all 77 generic fallback topics across Sexcapades (16 in Sex acts, 9 in Roleplay & identity, 8 in Impact/pain/body mod, 7 in Psychological dynamics, 7 in Service & ritual, 5 in Orgasm & reproductive play, 4 in Sensation & atmosphere, 4 in Clothing/materials/objects, plus 17 across the remaining 7 categories) and assigned domain-specific `give_label` / `receive_label` pairs (or `type: "single"` for `t0430` Exclusivity & Openness).
    - Unified all 6 Footwear topics (`t0166` Heels & boots, `t0167` High Heels, `t0168` Pumps, `t0169` Retifism, `t0170` Knee High Socks, `t0171` Socks) onto the consistent `wears` / `admires` convention.
    - Result: `0` generic G/R topics remain in Sexcapades (`265` custom G/R in JSON + `22` in legacy `We`, `73` single, `17` widgets = `377` total). Synced across app and hosted `sexcapades.json`, verified live on Hostinger.

13. **~~Flexcapades — the meta skin, default home of flex.capades.io:~~** **DONE (2026-11-25, built by YoBiche on Jason's direct order "you build the skin").**
   - Ruled by Jason 2026-11-25 04:12: the meta skin (a Flexcapades about Flexcapades) is what flex.capades.io shows when a visitor looks for the hypermap or hot list — instead of Sexcapades. It hosts there, and it uniquely opens its picker menu by default, so the visitor lands on the meta map with the full skin list open in front of them. Reframed 04:14: FIRST about the usage of flex.capades.io — how you use the thing — with the advisory board as the smaller second wing.
   - Implementation: new skin `app/data/skins/flexcapades.json` (BOTH copies) — 29 topics across 7 flat categories, meter **stake** (covers both wings: your stake in a feature is how much you lean on it, your stake in a decision is how much you care); usage wing (Rating, Comparing, Planning the night, Keeping it, Guarding it, Learning it) + advisory wing (Shaping it, the live open questions); each usage topic's hovertip explains the feature, so the map IS the manual; 6 role archetypes (the Lawgiver, the Witness, the Builder, the Tester, the Munch Regular, the Lurker), each rated 29/29 via the sample formula + magenta (#d946ef) emblems in all three dirs; scribe/sceneSetter deep-copied verbatim from Nous (Fast precedent). Wiring per the Fastcapades precedent (15dcee0): catalog/loader/view-nav/02a/03d registrations, 02i+02g1 descriptor blocks (7 categories, distinct colors + pictograms), gate + both shells + picker menus, sitemap line, per-skin manifest + icons (flex.json + flex-192/512/apple-touch — the multicolor hub — already existed as the flex site identity from Nov 22, so the meta- duplicates were removed, not renamed). The flex default moved Poliscapades → Flexcapades in skin-loader.js:426, 02a:341, skin-catalog.js:59 (item 8's fix 53d8376 had set the interim default to Polis). Bundle rebuilt + node --check on the bundle; routing harness verified flex.capades.io, capades.io → flexcapades and sexcapades.io → sexcapades; boot menu still opens on flex.
   - **RENAMED Metacapades → Flexcapades (Jason, 2026-11-25 04:52: "I don't think they need be distinct"):** skin id `metacapades` → `flexcapades`, name, domain `meta.capades.io` → `flex.capades.io`, topic ids `xmeNNNN` → `xflNNNN`, category ids `xmecNN` → `xflcNN`, emblems + manifest + icons renamed; hosted gate updated. Stale `metacapades*` files completely purged locally, from git, and from Hostinger remote (`2026-11-25`).
   - Correction to the item as first written: its routing description (02a:340, flex → sexcapades) was stale before the build started — the other lane's item-8 fix had already moved the flex default to Polis. The three default sites are skin-loader.js:426, 02a:341, skin-catalog.js:59.
   - Still owed: per-topic glyphs (Gemini's glyph pass, item 4). Live cold-open acceptance on flex.capades.io. (meta.capades.io registration is MOOT after the rename — no separate domain; the docs-skin.js "meta" entry is likewise moot — no meta skin.)
   - *Standing laws:* analytics NEVER disabled; build timestamps America/Chicago; one builder at a time on the app artifact; timing table in the dispatch brief.

---

## 2. Open Carry-Overs & Backlog

Items to verify or address when relevant to their subsystem:

- **~~Cold-Open Acceptance:~~** **Settled & accepted by Jason (2026-11-25).**
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
