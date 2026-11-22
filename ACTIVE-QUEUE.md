# Active Work Queue

> **Working Scratchpad.** This file tracks in-flight jobs, queued items, and
> open investigations. It is designed to be updated, struck through, and pruned
> frequently as tasks clear.
>
> For permanent architecture, standing engineering laws, model rules, and
> repository protocols, refer to [**`AI-Handover-Brief.md`**](file:///home/jason/Sexcapades-Web/AI-Handover-Brief.md).

**Maintenance rule (Jason, 2026-11-19).** When you finish or settle an item listed
here, strike it (`~~...~~`) or mark it settled as part of that same work. Prune
settled batches periodically so this list reflects only live items.

---

## 1. Active Priority Queue

Each item waits for Jason's kickoff; nothing here dispatches itself.

1. ~~**Gate / Header Unification:**~~ Settled 2026-11-22.
   - Unified gate top navigation bar with the app header's view selector pattern (Hypermap, Hot List, Scene Setter, Scene Sentinel, Scribe, and Scan or Import).
   - Folded auxiliary links (Privacy, Methodology, Sitemap, TaxoPolemics) into the unified Docs dropdown.
   - Preserved age gate flow and responsive layout.

2. ~~**Uniform Node Type — Phase 4 (Layout Editor Integration & Recursive Engine):**~~ Settled 2026-11-21.
   - Unified `branchOverrides`, `subcatOverrides`, and `kinkOverrides` into a depth-agnostic `nodeOverrides[nodeId]` schema in `layout-editor.js` with bidirectional syncing and legacy fallback.
   - Added multi-generation live crossing counting in `__sxCrossingMeasure` (`byDepth`, `byGen`, `byNode`, `subclouds`, `generations`).
   - Implemented Arbitrary $N$-Depth Recursive Hierarchy & Unified Node Engine (`sxNodeRecord`, `sxNodeAncestorIds`, `sxNodeChildrenIds`, `sxNodeRollup` with $(2/3)^{D_{\max}-d}$ depth-weighting and per-flank direct wins, full ancestor limit cascade across matching/negotiation/outline, and recursive subtree collection `wi`).
   - *Phase 4 (N-Depth Scaling Law, Map-Paint Decomposition & Unified Node Engine) now fully complete.*

3. **Shel's Sync-Card Fit:**
   - Waiting on Shel's fresh complete profile copy (handle: `BothInches`).
   - When it arrives, measure her exact card payload against sync-card tiers (fit order 2 → 3 → 5 codes; the 4-code tier is unreachable and stays in code).
   - *Constraint:* No multi-card design is authorized until this measurement exists.

4. **Fetish Harvest, Then Analytics Reset:**
   - Harvest first: unmapped-fetishes script exports its ranked report from live DB (`~/domains/capades-data/`).
   - Fix the harvest script pointer from old `~/domains/sexcapades-data/` to `~/domains/capades-data/`.
   - *Constraint:* The counters reset only after Jason confirms the harvest export is verified.

5. ~~**Scribe — Narration Safety-Filter Block:**~~ Settled 2026-11-22.
   - Identified root cause: Gemini TTS safety filters block sexual/explicit passages server-side and return empty audio chunks or safety finish reasons.
   - Implemented automatic non-crashing fallback: live sentence stream catches filter rejections and falls back to local `SpeechSynthesis`, and the unary whole-clip flow cascades through alternative TTS endpoints before cleanly engaging `SpeechSynthesis` so narration never stalls.

6. **GibberWear / Scene Sentinel Track:**
   - Separate track carrying its own standing rulings.
   - Protocol rulings stand: profile KEY is identifier; `CHK:<profile-key>:<P|T>`; `ALL` = broadcast; keyless message = broadcast on receipt; BLE UUID.
   - **Watch copy NEVER mentions sexcapades.io.**
   - *Open:* Investigate audible-sounds cause (Jason, 2026-11-08: needs investigation, not guessing); entertainment idea (genre map + live group enjoyment meter) open.

7. ~~**Operation Maps — Pseudo-Profiles (Spec Part 2):**~~ Settled 2026-11-22.
   - Operations (⋈, ⊙, ⊖) yield first-class pseudo-profile objects storing a recipe, operation name, source profile IDs, and ratings fingerprint; automatically recomputed on source staleness; strictly non-editable and non-rateable.
   - Renders on the skin's neutral atlas layout: topic node discs carry both parties' holdings (split disc with left/right party ratings or $N$-wedge group pie); spokes carry the operation's per-topic values (Cross: crossed fit per flank; Straight: likeness; Circle Minus: split depth × joint relevance feud heatmap).
   - *Spec Part 2 complete; foundation laid for item 8.*

8. ~~**Scribe — Operation Chooser / Full Arc (Spec Part 3):**~~ Settled 2026-11-22.
   - Scribe dialog gains an operation choice for multi-profile writings: Communion (⋈), Common ground (⊙), Dialectic / Polylectic (⊖), or Full arc (⋈⊙⊖).
   - Dynamically labels Dialectic for 2 parties, Polylectic for 3+ parties (ruled 2026-11-22); defaults to Full arc for vanilla discussions (ruled 2026-11-22) and Communion for Sexcapades.
   - Dialectic / Polylectic selection ranks by debate register feud depth × joint relevance; prompt framing steelmans each side, pinpoints the receipt-level crux, and allows honest impasse without manufacturing artificial agreement; boundary rules never leak agreement limitations into Dialectic framing.
   - Full arc structures writing into 3 distinct movements (Communion → Common Ground → Dialectic/Polylectic) with de-duplication cross-referencing. Attribution is never flattened across any operation.

9. ~~**Advocacy / Receptivity (Spec Part 1):**~~ Settled 2026-11-22.
   - Stance skins' pole topics decompose into two placements: Advocacy (distribution of arguing over the poles) and Receptivity (distribution of hearing — not a stance), each with its own signed intensity; never contracted; unrated means absent from all math.
   - Dual-slider & canvas widget: filled disc = Advocacy puck (●), open ring = Receptivity puck (○), each coloured by its own intensity with dynamic brightness/complement ramps; dual intensity sliders with thumb glyphs (disc / ring); wheel over a puck strictly scoped to $d \le 18$ px hover; mode entry by touching/sliding either slider or tapping either puck on canvas; unplaced ring rests as dashed ghost ring at centroid with first-tap placement.
   - Integrated across all 7 polygon widgets (Triangle simplex, Political Compass, Tetrad, Pentad, Hexad, Heptad, and Octad) with active deformation solid vs inactive dashed contour and centroid pucks.
   - Operations integration: Cross (⋈) deliberative teaching/persuasion channels ($A_{\text{adv}} \times B_{\text{rec}}$ and $B_{\text{adv}} \times A_{\text{rec}}$) stored on `deliberative = { AtoB, BtoA }`; Straight (⊙) allied advocacy ($A_{\text{adv}} \times B_{\text{adv}}$) and mutual openness ($A_{\text{rec}} \times B_{\text{rec}}$); Circle Minus (⊖) unreceptivity feud signal amplification where strong advocacy and absent/negative receptivity heightens debate register ranking. Sexcapades topics untouched.
   - Migration & persistence: `vt[profileId][topicId].advocacy` and `.receptivity` with legacy top-level mirroring; existing profiles seed Advocacy from flat blend + intensity, Receptivity starts unrated (`receptivityKnown = false`); archetype samples cleanly unrated for receptivity without dirtiness.


---

## 2. Open Carry-Overs & Backlog

Items to verify or address when relevant to their subsystem:

- **`cloudLabel -30` Residual:** A very long font-fitted label can still run under the icon by up to `iconR - 30`. Check if 2026-11-18 label tightness fully resolved this in practice.
- **The 7 Ambiguous Sliders (pending Shel):**
  - Sliders with text: Nyotaimori ("lie as platter / eat from body"), Siblings ("be the sister / be the brother"), Superheroes ("be the hero / be the villain").
  - Topics without sliders (pole hints only): Growth / shrinking, Size contrast, Surrogacy, Hotwife (live row is Bull / Hotwife / Cuckold triad `t0281`).
- **R9f — Sadomasochism Reorganization:** Not applied. `t0051` is still "Pain"; `t0252` is still "Sadism". Standing ruling: rename Pain to Sadomasochism, retire `t0252` (Sadism → give / Masochism → receive). Emotional Sadism untouched.
- **Triangle Palette:** Barycentric corners currently use red / green / blue; center is the mix, not black, and does not deepen as pole numbers spread. Check if spec adjustment is desired.
- **GibberWear Tester Count:** Currently at 3 of 12; 14-day testing bar pending.
- **Paddle Formula Live Flip:** `capEnd` matches; live flip verification check (crossing numbers move, placard ratings survive reload) open.
- **Shortcuts View:** Leave until named by Jason (do not invent a screen).
