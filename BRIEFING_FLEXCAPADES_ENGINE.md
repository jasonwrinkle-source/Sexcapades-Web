# Master AI Briefing: The Flexcapades / Taxopolemics Engine

## 1. Executive Summary & Core Mission
**Flexcapades** (historically named *Sexcapades*, and generalized as the **Taxopolemics Engine**) is an open-source, client-side, zero-backend architectural framework designed to map complex, subjective human affinities, relational roles, philosophical stances, and ideological tensions into an intuitive, interactive, and organic 2D/hyperbolic spatial visualization called the **Hypermap**.

Unlike traditional flat questionnaires or reductive personality rubrics, Taxopolemics models human desire and ideological posture as a continuous multi-polar landscape. It features:
1. **Dynamic N-Pole Polarities**: Seamless support for 1-pole monopoles, 2-pole dipoles, 3-pole triads, 4-pole tetrads, 5-pole pentads, and 6-pole hexads.
2. **Organic Spoke Geometry**: Branching hierarchical arborization with Gaussian bulbous base tapers, bezier curved midlines, and simulated annealing deknotters that eliminate spoke crossings.
3. **Multi-Profile Relational Dynamics**: Deterministic tensor contractions between two or three profiles (Straight Match, Cross Match, Friction/Tension, Triadic Scaffolding, Dynamic Triangulation).
4. **Pluggable Skin Taxonomies**: Completely domain-agnostic taxonomy architecture, powering Sexcapades (erotic/relational), Philoscapades (epistemic/metaphysical), Poliscapades (civic/economic), and Forescapades (spiritual/yogic).
5. **Private, Ephemeral, and Local**: 100% client-side execution; state is stored in memory, IndexedDB/localStorage, or exported as portable cryptographic JSON strings, QR audio packets (ggwave), or printable PDFs.

---

## 2. System Architecture & Bundle Pipeline

The engine consists of **38 modular ES JavaScript files** located in `app/js/modules/`, which are compiled into a unified runtime bundle `app/data/data-bootstrap.js` via `python3 app/data/build-bundle.py`.

```
app/js/modules/
├── 01-dispatcher.js             # Event emitter, global event loop & notifications
├── 02a-taxonomy-models.js        # Data structures for taxonomy nodes, branches & leaves
├── 02b-taxonomy-data.js          # Core static taxonomy definitions & topic trees
├── 02c-layout-solver.js          # Radial hypermap position solver & angle distributor
├── 02d-selection-marking.js      # Selection states, multi-select & leaf highlighting
├── 02e-font-ladder.js            # Dynamic typography scaling & label fitting
├── 02f-spoke-geometry.js         # Bulbous tapers, curve offsets & spoke boundary paths
├── 02g-definitions-ratings.js    # Metric definitions, ratings constants & scales
├── 02h-inner-opener.js           # Subcategory expansion & accordion physics
├── 02i-taxonomy-catalog.js       # Dynamic catalog, topic shape resolver (Ge) & metadata
├── 02j-profile-state.js          # Active profile records (ca, To, Fo) & profile switching
├── 02k-compare-dials.js          # Cross-profile comparison dials & overlap metrics
├── 02l-deknotter-session.js      # Simulated annealing deknotter & spoke crossing minimization
├── 02m-fit-targets.js            # Viewport bounding box fitting & camera zoom bounds
├── 02n-deknotter-cascade.js      # Multi-level branch untangling & collision hulls
├── 02o-ratings-scales.js         # Color ramps, rating levels & intensity quantization
├── 02p-spoke-selection.js        # Spoke hit-testing, selection halos & outline rendering
├── 02-taxonomy-core.js           # Taxonomy navigation, breadcrumbs & node traversal
├── 03a-midline-solver.js         # Curved spoke centerline solver & anchor tangents
├── 03b-map-interaction.js        # Pointer gesture dispatcher, long-press & touch tracking
├── 03c-map-vault.js              # Offscreen DOM caching & blit fragment preservation
├── 03d-outline.js                # Search index, Hot List drawer & topic text matching
├── 03e-map-paint.js              # SVG/Canvas rendering, placard widgets & hot list dialog
├── 03-map-geometry.js            # Coordinate transforms, camera clipping & projection
├── 04-topic-picker.js            # Fast search bar, group filtering & keyboard navigation
├── 05a-sync-engine.js            # Peer-to-peer sync, session handshake & diff patching
├── 05b-scribe.js                 # Gemini AI narrative generator & story synthesis
├── 05c-share-qr.js               # Sound (ggwave) & QR code profile sharing
├── 05-compatibility.js           # Straight & Cross match tensor engines, pair matrix
├── 06a-export-renderers.js       # Text, CSV & image profile export formatting
├── 06b-fetlife-importer.js       # Third-party fetish parser & alias normalizer
├── 06c-converter-pipeline.js     # Questionnaire parser (KinkTest, Yes/No/Maybe, BDSMTest)
├── 06d-profile-sheet.js          # Profile overview sheet, about modal & photo management
├── 06e-kinktest-routes.js        # Guided test routing & interactive question trees
├── 06-pdf-exporter.js            # Vector PDF engine, camera wheel/pan & gesture tracking
├── 07-header-hug.js              # Responsive header, banner alerts & breadcrumb pinning
├── 08-ui-wiring.js               # DOM listeners, dialog management & accessibility
└── 09-profile-storage.js         # IndexedDB / localStorage persistence & auto-save
```

### The Build Cycle
```bash
# 1. Modify ES modules in app/js/modules/
# 2. Rebuild the single unified bootstrap bundle:
python3 app/data/build-bundle.py
# 3. Verify JavaScript syntax without execution:
node --check app/data/data-bootstrap.js
```
The python script strips ES import/export statements, stitches the files in dependency order, and mirrors the output to `site-tree/public_html/hosted/` and `site-tree/public_html/qa/`.

---

## 3. Data Models & Core State Registry

### 1. Topic Shapes (`Ge(id)`)
Every topic in the hypermap has a geometric shape resolved by `Ge(topicId)` in [`02i-taxonomy-catalog.js`](file:///home/jason/Sexcapades-Web/app/js/modules/02i-taxonomy-catalog.js):
- `keys`: Array of pole keys (e.g. `["give", "receive"]` or `["bull", "hotwife", "cuckold"]`).
- `labels`: Array of human-readable pole titles.
- `widget`: Explicit widget identifier:
  - `"xy-switchbox"`: 2D Cartesian Role Switch-Box (Default for interactive 2-pole topics).
  - `"linear-sliders"`: Dual independent linear sliders ($[-100, 100]$).
  - `"monopole-slider"`: Single intensity slider (for solitary/self-contained topics).
  - `"triangle"`: Barycentric equilateral triangle simplex.
  - `"trilinear-sliders"`: 3 independent linear sliders.
  - `"diamond"`: 4-pole orthogonal diamond radar polygon.
  - `"quad-sliders"`: 4 independent linear sliders.
  - `"quad-compass"`: 4-quadrant Cartesian compass.
  - `"star-radar"`: 5-pole regular pentagon radar.
  - `"hexad-radar"`: 6-pole regular hexagon radar.

### 2. Profile Rating Store (`wt`, `ca`, `To`, `Fo`)
- `wt`: In-memory dictionary of loaded profiles: `{ [profileId]: { id, name, ratings, ... } }`.
- `ca(topicId, profileId)`: Retrieves the rating record for a topic in a profile. Returns an object with values for each pole key, plus `<key>Known: boolean`.
- `To(topicId, key, value, commit, profileId)`: Writes a rating for a specific pole of a topic into the active profile.
- `Fo(topicId, key, commit, profileId)`: Clears a rating for a pole, restoring it to unrated.

---

## 4. The N-Pole Rating Continuum & The 2D Role Switch-Box

### 1. The 2D XY Switch-Box for 2-Pole Topics
For 2-pole relational topics, traditional UI relied on two linear sliders (Give and Receive). However, in human dynamics, giving and receiving are deeply entangled psychological orientations. The engine defaults to the **2D Cartesian Role Switch-Box**:
- **Horizontal Axis ($X \in [-100, +100]$)**: Give ($X < 0$ = Limit/Refusal, $X > 0$ = Passion/Top).
- **Vertical Axis ($Y \in [-100, +100]$)**: Receive ($Y < 0$ = Limit/Refusal, $Y > 0$ = Passion/Bottom).
- **The Four Quadrants**:
  - **Quadrant I ($+X, +Y$)**: *Versatile Switch* (Loves giving and receiving; double green).
  - **Quadrant II ($-X, +Y$)**: *Dedicated Bottom / Receiver* (Green receive, red give limit).
  - **Quadrant III ($-X, -Y$)**: *Hard Red Limit* (Mutual boundary/avoidance).
  - **Quadrant IV ($+X, -Y$)**: *Dedicated Top / Giver* (Green give, red receive limit).
- **The Switch Diagonal ($Y = X$)**: Symmetry guide representing balanced versatile engagement.
- **Bijective Transition Mapping**:
  $$\begin{aligned}
  X &= \text{Give} \in [-100, 100] \\
  Y &= \text{Receive} \in [-100, 100]
  \end{aligned}$$
  Because $X$ and $Y$ map directly to `give` and `receive` with zero transformation loss, profiles remain 100% backward and forward compatible. Users can flip between 2D Switch-Box and Sliders via the placard toggle button at any time without data desynchronization.

### 2. Triads, Tetrads, Pentads, and Hexads
- **Triads (3-Pole)**:
  - *Barycentric Simplex (`"triangle"`)*: For zero-sum or relative role mixtures where sum of weights is normalized (e.g. Bull / Hotwife / Cuckold, Top / Side / Bottom).
  - *Trilinear Sliders (`"trilinear-sliders"`)*: For independent triadic appetites that can each be maximum without trade-off (e.g. Primal / Sensual / Humiliation).
- **Tetrads (4-Pole)**:
  - *Diamond Radar (`"diamond"`)*: Polar deformation polygon on North, East, South, West vertices (Green, Yellow, Red, Blue).
  - *Quad Compass (`"quad-compass"`)*: 2D Cartesian compass (e.g. Authoritarian/Libertarian vs Left/Right).
- **Pentads (5-Pole)**:
  - *Star Radar (`"star-radar"`)*: Regular pentagonal radar web for 5-sensory or 5-love-language dimensions.
- **Hexads (6-Pole)**:
  - *Hexad Radar (`"hexad-radar"`)*: Regular hexagonal radar web for 6 archetypes or diametric pairings (e.g. Lee's 6 Love Styles).

---

## 5. Viewport & Rendering Pipeline Performance Guarantees

The hypermap canvas renders hundreds of nodes, curved midlines, and bulbous spokes simultaneously. Maintaining 60fps/120fps camera pan and zoom requires strict adherence to the following performance invariants:

1. **Camera Movement Flag (`is-camera-moving`)**:
   During active user panning, dragging, or wheel zooming, the map SVG root `#conceptMap` is tagged with `.is-camera-moving`.
2. **Layout Thrashing Prohibition**:
   In [`03-map-geometry.js`](file:///home/jason/Sexcapades-Web/app/js/modules/03-map-geometry.js), the function `wr()` performs off-screen culling. **CRITICAL**: While `is-camera-moving` is present, `wr()` MUST return early. Never call `element.getBoundingClientRect()` inside a `requestAnimationFrame` loop on hundreds of nodes per frame; doing so triggers synchronous layout reflow and creates severe viewport stutter.
3. **Settle Reconciliation (`kh`)**:
   When camera gestures cease, `xh()` invokes `kh()` after a 130ms debounce window. At this point, `is-camera-moving` is removed, and a single layout sweep reconciles element visibility and accessibility attributes.

---

## 6. Scribe AI & Live Voice Synthesis

The **Scribe** module ([`05b-scribe.js`](file:///home/jason/Sexcapades-Web/app/js/modules/05b-scribe.js) and [`patches.js`](file:///home/jason/Sexcapades-Web/app/js/patches.js)) turns profile ratings into bespoke erotic stories or philosophical dialogues using Google Gemini:
- **Explicitness Dial (1–5)**: Controls narrative tone from romantic innuendo (1) to explicit anatomical play (5), with tick marks aligned with slider steps.
- **Synchronous AudioContext Unlock**: Audio contexts are primed synchronously on user tap/click (`narrateEnsureAudioCtxRunning`), unlocking Web Audio autoplay across iOS and Android browsers.
- **Dynamic Mid-Stream Voice Switching**: The narration queue reads the user's selected Gemini voice dynamically per sentence chunk, allowing voices to change mid-story without restarting playback.

---

## 7. Related AI Architectural Briefings

To explore specific subsystems in depth, refer to the sibling briefing papers in the repository:
- **Mathematical Contractions (2 Profiles)**: [`BRIEFING_MATHEMATICAL_CONTRACTIONS_2_PROFILES.md`](file:///home/jason/Sexcapades-Web/BRIEFING_MATHEMATICAL_CONTRACTIONS_2_PROFILES.md)
- **Mathematical Dynamics (3 Profiles)**: [`BRIEFING_MATHEMATICAL_DYNAMICS_3_PROFILES.md`](file:///home/jason/Sexcapades-Web/BRIEFING_MATHEMATICAL_DYNAMICS_3_PROFILES.md)
- **Hypermap Rendering & Spoke Geometry**: [`BRIEFING_HYPERMAP_RENDERING_PIPELINE.md`](file:///home/jason/Sexcapades-Web/BRIEFING_HYPERMAP_RENDERING_PIPELINE.md)
- **Interactive Rating Widgets Specification**: [`BRIEFING_INTERACTIVE_RATING_WIDGETS.md`](file:///home/jason/Sexcapades-Web/BRIEFING_INTERACTIVE_RATING_WIDGETS.md)
- **Taxonomy Skins**:
  - Erotic / Relational: [`BRIEFING_SEXCAPADES_TAXONOMY.md`](file:///home/jason/Sexcapades-Web/BRIEFING_SEXCAPADES_TAXONOMY.md)
  - Epistemic / Metaphysical: [`BRIEFING_PHILOSCAPADES_TAXONOMY.md`](file:///home/jason/Sexcapades-Web/BRIEFING_PHILOSCAPADES_TAXONOMY.md)
  - Civic / Ideological: [`BRIEFING_POLISCAPADES_TAXONOMY.md`](file:///home/jason/Sexcapades-Web/BRIEFING_POLISCAPADES_TAXONOMY.md)
  - Spiritual / Contemplative: [`BRIEFING_FORESCAPADES_TAXONOMY.md`](file:///home/jason/Sexcapades-Web/BRIEFING_FORESCAPADES_TAXONOMY.md)
