# AI Briefing: Interactive Rating Widgets & Multi-Polar Coordinate Systems

## 1. Overview
The Taxopolemics engine models human desire, role affinity, and ideological orientation as a continuous multi-polar landscape. Rather than forcing all concepts into flat linear sliders, the engine assigns each topic its geometrically and psychologically optimal rating widget.

Every widget operates across two primary interaction surfaces:
1. **The Topic Placard**: Displayed in the sidebar / inspector when a topic is selected on the hypermap.
2. **The Hot List Pop-up Dialog (`#hotListWidgetDialog`)**: Modal dialog invoked from search results, hot list items, or outline rows.

---

## 2. The 1-Pole Monopole Slider (`"monopole-slider"`)

### Applicable Topics
Solitary acts, self-contained experiences, and non-relational desires (e.g. Solo Masturbation, Voyeurism / People-Watching, Reading Erotica, Introspection).

### Geometry & Coordinates
- Single linear slider:
  $$V \in [-100, +100]$$
- Visual scale:
  - $V < 0$: Red limit / active aversion ($-100$ = hard red limit).
  - $V = 0$: Neutral / unrated.
  - $V > 0$: Green interest / passion ($+100$ = peak enthusiasm).

---

## 3. The 2D Role Switch-Box (`"xy-switchbox"`)

### Applicable Topics
Interactive, relational, or role-differentiated activities where Giving and Receiving are interdependent psychological orientations (e.g. Bondage, Impact, Oral, Pegging, Praise, Humiliation).

### Cartesian Plane & Quadrant Topology
- **Horizontal Axis ($X \in [-100, +100]$)**: Give / Active / Top
- **Vertical Axis ($Y \in [-100, +100]$)**: Receive / Receptive / Bottom
- **Canvas Mapping**:
  $$\begin{aligned}
  p_x &= c_x + \left(\frac{X}{100}\right) \cdot r \\
  p_y &= c_y - \left(\frac{Y}{100}\right) \cdot r \quad (\text{inverted screen } Y)
  \end{aligned}$$
- **The Four Quadrants**:
  - **Quadrant I ($+X, +Y$)**: *Versatile Switch* (Enjoys both giving and receiving; tint: `rgba(34, 197, 94, 0.12)`).
  - **Quadrant II ($-X, +Y$)**: *Dedicated Bottom / Receiver* (Green receive, red give limit; tint: `rgba(59, 130, 246, 0.10)`).
  - **Quadrant III ($-X, -Y$)**: *Hard Red Limit* (Mutual aversion to both roles; tint: `rgba(239, 68, 68, 0.12)`).
  - **Quadrant IV ($+X, -Y$)**: *Dedicated Top / Giver* (Green give, red receive limit; tint: `rgba(234, 179, 8, 0.10)`).
- **The Switch Diagonal ($Y = X$)**:
  Dashed diagonal axis representing balanced versatile inclination ($G = R$).
- **Deadband Snap**:
  If the pointer drops within 6px of the center origin $(c_x, c_y)$, coordinates snap cleanly to $(0, 0)$.
- **Bijective Transition Mapping**:
  $$\text{Give} = X, \quad \text{Receive} = Y$$
  Zero transformation distortion, preserving 100% data fidelity with existing profile stores.
- **Donor / Acceptor Role Pairs (ruled 2026-11-15):** the switch-box is not limited to give/receive orientations. It also covers donor/acceptor role pairs — Lewis acid / Lewis base, nucleophile / electrophile, oxidising agent / reducing agent — where a reagent or chemist can act exclusively as one, act as an amphoteric "switch" (the $Y = X$ diagonal), or avoid both (the Hard Red Limit quadrant). Jason ruled Gemini's donor/acceptor reinterpretation is fine (2026-11-15); no existing Chemcapades topic is a donor/acceptor dyad yet, so this applies to future topics.

---

## 4. The 3-Pole Triad Widgets

### 1. Barycentric Simplex Triangle (`"triangle"`)
Used for **Type I: Closed Role Allocations** where three roles form a closed triad and the user's posture is a relative mixture (e.g. *Bull / Hotwife / Cuckold*, *Vixen / Stag / Cuckquean*, *Top / Side / Bottom*).
- **Equilateral Vertices**:
  - Vertex 0 (South-West): $V_0 = (c_x - r \cos(\pi/6), c_y + r \sin(\pi/6))$ — Red
  - Vertex 1 (North): $V_1 = (c_x, c_y - r)$ — Green
  - Vertex 2 (South-East): $V_2 = (c_x + r \cos(\pi/6), c_y + r \sin(\pi/6))$ — Blue
- **Barycentric Decomposition**:
  Any pointer point $P(x, y)$ decomposes into weights $(w_0, w_1, w_2)$ such that:
  $$w_0 + w_1 + w_2 = 1, \quad w_i \ge 0$$
- **Intensity Modulation**:
  An accompanying intensity slider $I \in [-100, +100]$ scales the final pole ratings:
  $$R_i = \text{round}(w_i \cdot I)$$

### 2. Trilinear Independent Sliders (`"trilinear-sliders"`)
Used for **Type II: Multi-Affinity Triads** where the three poles are independent psychological drives that can simultaneously be maxed or zeroed (e.g. *Primal / Sensual / Humiliation*, *Sensation / Power / Intimacy*, *Edging / Ruined / Forced*).
- Three independent sliders for Pole 1, Pole 2, and Pole 3, each with range $[-100, +100]$.

### 3. Linear 3-Pole Spectrum (`"trilinear-line"`) — CANONICAL (2026-11-15)
Used for **LINE triads**, where the middle pole sits *between* two extremes on a single axis and a triangle gives two degrees of freedom the user does not need (e.g. Health insurance system — keep and fix the ACA in the middle; Teaching vs Research vs Teacher-Scholar; the Chemical Bond — Pattern-Realism between Strict Realism and Instrumentalism).
- **Geometry:** one horizontal linear track $V \in [-100, +100]$; three labelled stops (left extreme $-100$, middle pole at $0$ with a distinct notch, right extreme $+100$); gradient blending the two extreme pole colours through the middle pole's colour at $0$.
- **Interaction:** drag a thumb or tap a stop; **snap to $0$ within ~6px** (the same deadband as the switch-box) so the middle pole is easy to hit exactly.
- **Storage:** ONE scalar $V \in [-100, +100]$. Derived weights: $w_{mid} = 1 - |V|/100$, $w_{plus} = \max(V,0)/100$, $w_{minus} = \max(-V,0)/100$ — always sum to $1$, interconvertible with triangle storage.
- **Cannot express (by design):** "I like all three" or "I hate the middle but like both extremes" — those need `"triangle"` or `"trilinear-sliders"`.
- **Conviction as a per-topic option:** the plain single scalar suffices for most LINE triads. On topics where $0$ must distinguish a committed middle from indifference (Chemcapades 1.1 Chemical Bond, 5.2 Lab Safety; Expericapades Detector Design, Collaboration), a second vertical Conviction/Engagement slider may be added per-topic — it is an option, not a default second axis.
- **Canonicalisation basis (2026-11-15 cross-skin fit review):** 37 existing LINE topics across 9 skins currently forced into `"triangle"` are misrepresented by it — Forescapades' 16 line triads, Chemcapades' 5, plus fits in Sexcapades, Philoscapades, Theoricapades, Praxicapades, Vocapades, Techcapades, Expericapades, and Mattercapades. **Do not assign `"triangle"` to a line triad.** Tag LINE / TRIANGLE / NON-BLEND first, then assign the widget.

### 4. Discrete Selector with Conviction (`"triad-commit"`) — CANONICAL (2026-11-15)
Used for **NON-BLEND triads that are mutually exclusive commitments**, where blending is incoherent — a discrete pick, not a mixture (e.g. Group 3 Periodic Table membership — Sc–Y–La–Ac vs Sc–Y–Lu–Lr vs split; confessional affiliation; which scripture / holy day / path; Cosmic Origin — Big Bang vs Cyclic vs Steady State; a relationship's structure — Monogamy vs Polyamory vs Relationship Anarchy).
- **Geometry:** three discrete pill/card nodes; selecting one locks out the others (zero blending), paired with a $[-100, +100]$ conviction/rejection bar so a user can also mark "Hard Rejection" of a specific camp.
- **Storage:** the chosen pole plus a conviction scalar $C \in [-100, +100]$ ($+100$ = committed, $-100$ = hard rejection of the unchosen camps).
- **Cannot express (by design):** blends or partial allocations — a 40/60 monogamy–polyamory blend is incoherent as a structure, and a 33/33/33 bedrock blend erects mathematics on no foundation at all.
- **Canonicalisation basis (2026-11-15 cross-skin fit review):** 16 existing discrete-commitment topics across 6 skins currently on `"triangle"` are misrepresented by blending. **Do not use `"triangle"` or `"trilinear-sliders"` for a pick-one triad.** Near-miss guard: Rodrik's Trilemma explicitly permits choosing *two* of three, and foundherentism is a real blend — those stay on `"triangle"` / `"trilinear-sliders"`.

---

## 5. The 4-Pole Tetrad Widgets

### 1. Diamond Radar Deformation Polygon (`"diamond"`)
Used for 4-pole distributions (e.g. *Orgasm Dynamics*, *Intimacy Geometries*, *Kink Motivations*).
- **Orthogonal Vertices**:
  - North: $V_0 = (c_x, c_y - r \cdot s_0)$ — `#22c55e` (Green)
  - East: $V_1 = (c_x + r \cdot s_1, c_y)$ — `#eab308` (Yellow)
  - South: $V_2 = (c_x, c_y + r \cdot s_2)$ — `#ef4444` (Red)
  - West: $V_3 = (c_x - r \cdot s_3, c_y)$ — `#3b82f6` (Blue)
  where $s_i = |R_i| / 100$.
- The resulting quad deformation polygon fills with dynamic color reflecting the dominant pole.

### 2. 2D Political / Conceptual Compass (`"quad-compass"`)
Cartesian 2D pad with two orthogonal bipolar axes (e.g. Authoritarian $\leftrightarrow$ Libertarian on $Y$, Left $\leftrightarrow$ Right on $X$).

### 3. Quad Sliders (`"quad-sliders"`)
Four independent linear sliders for multi-role power distributions (e.g. *Master, Mistress, Slave, Pet*).

### 4. 3D Tetrahedron / Barycentric Simplex (`"tetrahedron"`) — CANONICAL (2026-11-15)
Used for **4-pole zero-sum blends**, where four options compete for a fixed budget that must sum to $1$ (e.g. the BDSM Authority & Archetype Matrix — allocating role-identity across Master / Mistress / Slave / Pet; the Great Quantum Interpretations Quartet — credence across four mutually exclusive accounts of reality; the Four Purusharthas — dividing a finite life among four aims; which quantum-computing platform will win — win-probability sums to $1$).
- **Geometry:** the true 3D generalisation of `"triangle"`. Four vertices with weights $(w_0, w_1, w_2, w_3)$ summing to $1$, rendered as a rotatable isometric/perspective tetrahedron with a 2D shadow projection, plus an accompanying intensity slider $I \in [-100, +100]$: $R_i = \text{round}(w_i \cdot I)$.
- **Why it matters:** `"diamond"`, `"quad-compass"`, and `"quad-sliders"` cannot enforce a closed zero-sum budget across four competing options — the diamond wrongly allows all four poles at 100% at once.
- **Near-miss guard:** not every 4-pole topic on `"diamond"` is a budget. Sector niches endorsable all at once (Chemcapades Energy Storage — batteries for grid *and* hydrogen for steelmaking), independent affinities (Schein's Career Anchors are ordinal, not a budget), and methods that combine (ab initio MD) stay on `"diamond"` / `"quad-sliders"` / `"ranked-stack"`. Forcing weights to sum to $1$ manufactures trade-offs the topic does not contain.
- **Canonicalisation basis (2026-11-15 cross-skin fit review):** 6 genuine closed-budget allocations across 4 skins.

---

## 6. The 5-Pole Pentad Radar (`"star-radar"`)

### Applicable Topics
Five-dimensional sensory palettes, love languages, and archetype spaces (e.g. *Thermal, Tactile, Vibrational, Olfactory/Taste, Auditory/Verbal*).

### Geometry
- Regular pentagon vertices at angles $\theta_k = -\frac{\pi}{2} + k \cdot \frac{2\pi}{5}$ for $k \in \{0, 1, 2, 3, 4\}$.
- Color palette: `["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#a855f7"]`.
- Deformed polygon traces $V_k = (c_x + r s_k \cos\theta_k, c_y + r s_k \sin\theta_k)$.

---

## 7. The 6-Pole Hexad Radar (`"hexad-radar"`)

### Applicable Topics
Six-pole love styles (Lee's Eros, Ludus, Storge, Pragma, Mania, Agape), impact modalities (Sting, Thud, Thermal, Clamp, Deprivation, Overload), and orgasm topographies.

### Geometry & Diametric Opposition
- Regular hexagon vertices at angles $\theta_k = -\frac{\pi}{2} + k \cdot \frac{2\pi}{6}$ for $k \in \{0, 1, 2, 3, 4, 5\}$.
- Color palette: `["#22c55e", "#06b6d4", "#6366f1", "#ef4444", "#f97316", "#eab308"]`.
- Pairs $(k, k+3)$ form diametric poles across the center, enabling direct visualization of psychological oppositions.

---

## 8. The 7-Pole Heptad Radar (`"heptad-radar"`)

### Applicable Topics
Complete multi-dimensional systems where seven irreducible poles define the complete phenomenological space:
1. **BDSM Archetype Spectrum (`t0423`)**:
   `[Sovereign, Caregiver, Primal, Sadist, Brat, Switch, Slave]`
2. **Somatosensory Modalities (`t0424`)**:
   `[Tactile, Thermal, Impact, Electric, Olfactory, Acoustic, Vestibular]`
3. **Sternberg's Relational Spectrum (`t0425`)**:
   `[Liking, Infatuation, Empty, Romantic, Companionate, Fatuous, Consummate]`
4. **Philoscapades: Seven Classical Branches (`topic-seven-branches-philosophy`)**:
   `[Metaphysics, Epistemology, Ethics, Political, Aesthetics, Logic, Mind]`
5. **Poliscapades: Seven Pillars of Governance (`topic-seven-pillars-governance`)**:
   `[Sovereign Authority, Rule of Law, Economic Equality, Civil Liberties, Welfare Safety, Ecological Stewardship, Geopolitical Autonomy]`
6. **Forescapades: Seven Subtle Energy Chakras (`topic-seven-chakras`)**:
   `[Muladhara, Svadhisthana, Manipura, Anahata, Vishuddha, Ajna, Sahasrara]`

### Geometry & Heptagonal Deformation Polygon
- Regular heptagon vertices at angles:
  $$\theta_k = -\frac{\pi}{2} + k \cdot \frac{2\pi}{7}, \quad k \in \{0, 1, 2, 3, 4, 5, 6\}$$
- Spectral 7-color palette:
  `["#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"]`
  *(Green, Cyan, Blue, Indigo, Purple, Pink, Orange)*.
- Deformed polygon traces:
  $$V_k = \left(c_x + r \cdot \frac{|R_k|}{100} \cos\theta_k, \; c_y + r \cdot \frac{|R_k|}{100} \sin\theta_k\right)$$
- Radial concentric guide rings at 25%, 50%, 75%, and 100% capacity.
- Real-time dragging of individual vertex handles along their respective radial rays.
- Scroll-wheel scaling ($scale = (100 \pm \Delta) / 100$) and master intensity slider.

### Elimination and Migration of Subsumed Lower-Pole Topics
When 7-pole topics are activated, lower-pole approximations are eliminated from the taxonomy catalog and migrated deterministically:

| 7-Pole Heptad Topic | Subsumed Lower-Pole Topics | Migration Transformation Vector |
| :--- | :--- | :--- |
| **`t0423` BDSM Archetypes** | `t0009` (FemDom, 2P)<br>`t0010` (D/s, 2P)<br>`t0012` (Brats, 2P)<br>`t0014` (Switching, 1P)<br>`t0015` (Male Authority, 2P)<br>`t0413` (Power Matrix, 4P)<br>`t0419` (BDSM Archetypes, 5P) | `give` $\to$ Sovereign / Master;<br>`receive` $\to$ Submissive / Slave;<br>Brat $\to$ Brat / Rebel;<br>Switch $\to$ Switch / Fluid;<br>Primal $\to$ Primal / Hunter;<br>Nurturer $\to$ Caregiver. |
| **`t0424` Somatosensory Modalities** | `t0102` (Texture Contrast, 2P)<br>`t0103` (Sensory Deprivation, 2P)<br>`t0104` (Sensory Overload, 2P)<br>`t0105` (ASMR & Whispering, 2P)<br>`t0109` (Scent, 2P)<br>`t0417` (Sensory Palette, 5P)<br>`t0421` (Impact Modalities, 6P) | Texture $\to$ Tactile;<br>Ice/Wax $\to$ Thermal;<br>Sting/Thud $\to$ Impact;<br>Tens/Wand $\to$ Electric;<br>Scent $\to$ Olfactory;<br>ASMR/Sound $\to$ Acoustic;<br>Deprivation/Overload $\to$ Vestibular. |
| **`t0425` Relational Spectrum** | `t0011` (Romantic Surrender, 2P)<br>`t0008` (Ongoing Dynamics, 2P)<br>`t0013` (24/7 Lifestyle, 2P) | Intimacy $\to$ Liking;<br>Passion $\to$ Infatuation;<br>Contract/Duty $\to$ Empty;<br>Ongoing Dynamics $\to$ Companionate;<br>24/7 Dynamic $\to$ Consummate. |

---

## 9. 8-Pole Topics & The Octad Deformation Polygon Widget ($\Delta^7$)

### 9.1 Mathematical Specification & Geometry
- **Vertices**: 8 radial poles situated on a regular octagon with uniform angular separation $\Delta\theta = \frac{2\pi}{8} = \frac{\pi}{4} = 45^\circ$:
  $$\theta_k = -\frac{\pi}{2} + k \cdot \frac{\pi}{4}, \quad k \in \{0, 1, 2, 3, 4, 5, 6, 7\}$$
  $$\mathbf{V}_k = \left( c_x + r \cos\theta_k, \; c_y + r \sin\theta_k \right)$$
- **Antipodal Diametric Symmetry**: Unlike odd-numbered polygons (triad, pentad, heptad), the regular octagon has 4 pairs of exact opposite poles passing through the center origin:
  $$(P_0 \leftrightarrow P_4), \quad (P_1 \leftrightarrow P_5), \quad (P_2 \leftrightarrow P_6), \quad (P_3 \leftrightarrow P_7)$$
- **8-Spectral Color Palette**:
  `["#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"]`
- **Deformation Area**:
  $$\text{Area} = \frac{1}{2} \sum_{k=0}^{7} \left( x_k y_{k+1} - x_{k+1} y_k \right), \quad \text{where } \mathbf{P}_k = \mathbf{C} + s_k (\mathbf{V}_k - \mathbf{C})$$

### 9.2 Lower-Pole Subsumption & Migration Path from Base 1,2-Pole Systems
When 8-pole octads are activated, legacy 1-pole and 2-pole topics are subsumed and eliminated from the active taxonomy, with backward compatibility migrated directly from the base 1,2-pole system:

| 8-Pole Octad Topic | Subsumed Base 1,2-Pole Topics | Migration Transformation Vector |
| :--- | :--- | :--- |
| **`t0426` Restraint & Containment Octad** | `t0022` (Rope bondage, 2P)<br>`t0025` (Cuffs, 2P)<br>`t0029` (Bondage tape, 2P)<br>`t0032` (Mummification, 2P)<br>`t0034` (Blindfold, 2P)<br>`t0037` (Caging, 2P)<br>`t0038` (Encasement, 2P)<br>`t0039` (Sleepsacks, 2P)<br>`t0040` (Immobilization, 2P)<br>`t0043` (Suspension, 2P)<br>`t0050` (Bondage art, 1P) | `t0022` $\to$ `rope`;<br>`t0050` $\to$ `shibari`;<br>`t0025` $\to$ `cuffs`;<br>`t0029` $\to$ `tape`;<br>`t0032`/`t0039` $\to$ `mummification`;<br>`t0034` $\to$ `blindfold`;<br>`t0037`/`t0038`/`t0040` $\to$ `caging`;<br>`t0043` $\to$ `suspension`. |
| **`t0427` Anatomical Focus & Somatic Worship Octad** | `t0201` (Hands, 2P)<br>`t0202` (Hands & gloves, 2P)<br>`t0203`/`t0204` (Hair / Long hair, 2P)<br>`t0208`/`t0209` (Facial hair / Beards, 2P)<br>`t0210`/`t0211` (Body / Pubic hair, 2P)<br>`t0213` (Feet, 2P)<br>`t0218` (Buttocks, 2P)<br>`t0220` (Breasts, 2P)<br>`t0222` (Pregnancy focus, 2P)<br>`t0231` (Muscles, 2P) | `t0213` $\to$ `feet`;<br>`t0201`/`t0202` $\to$ `hands`;<br>`t0220` $\to$ `breasts`;<br>`t0218` $\to$ `glutes`;<br>`t0231` $\to$ `muscles`;<br>`t0203`/`t0204` $\to$ `hair`;<br>`t0208`/`t0210`/`t0211` $\to$ `bodyhair`;<br>`t0222` $\to$ `pregnancy`. |
| **`topic-eight-covenants-abrahamic` Forescapades Abrahamic Octad** | Foreskin / Covenant of Flesh vs. Pauline Grace; Halakha vs. Gospel; Orthodox Christology vs. Tawhid; Kabbalah vs. Sufism. | Brit Milah $\leftrightarrow$ Gospel;<br>Halakha $\leftrightarrow$ Sacrament;<br>Kabbalah $\leftrightarrow$ Tasawwuf;<br>Tawhid $\leftrightarrow$ Christology. |

---

## 10. Summary of Polarity Simplices in Taxopolemics

| Polarity | Name | Simplex | Canvas Widget | Mathematical Structure |
| :---: | :---: | :---: | :---: | :---: |
| 1-Pole | Monopole | $\Delta^0$ | Linear Amplitude Slider | Scalar magnitude $[0, 100]$ |
| 2-Pole | Binary Dyad | $\Delta^1$ | 2D XY Switch-Box / Dual Sliders | Cartesian phase space $[-100, 100]^2$ |
| 3-Pole | Triad | $\Delta^2$ | Barycentric Triangle | Trilinear weights $\sum w_i = 1$ |
| 4-Pole | Tetrad | $\Delta^3$ | Orthogonal Diamond Deformation Polygon | 4-Quadrant polar tensor |
| 5-Pole | Pentad | $\Delta^4$ | Regular Pentagram Multi-Affinity Web | Star polygon $(\Delta\theta = 72^\circ)$ |
| 6-Pole | Hexad | $\Delta^5$ | Diametric Regular Hexagon Circumplex | 3 Antipodal axes $(\Delta\theta = 60^\circ)$ |
| 7-Pole | Heptad | $\Delta^6$ | Regular Heptagon Radar | Irreducible 7-ray cyclic $(\Delta\theta \approx 51.43^\circ)$ |
| 8-Pole | Octad | $\Delta^7$ | Regular Octagon Deformation Polygon | 4 Antipodal pairs, 3-bit hypercube $(\Delta\theta = 45^\circ)$ |
| 3-Pole (LINE) | Line Triad | $\Delta^2$ | Linear Track (`"trilinear-line"`) | Single scalar $V \in [-100, +100]$, middle pole at $0$ |
| 3-Pole (Discrete) | Discrete Triad | $\Delta^2$ | Exclusive Cards (`"triad-commit"`) | Pick-one + conviction $C \in [-100, +100]$ |
| 4-Pole (Zero-sum) | Tetrad | $\Delta^3$ | Tetrahedron (`"tetrahedron"`) | Weights sum to $1$, 3D simplex |
| Beyond $N$-Pole | Conditional | — | Decision Tree (`"decision-tree"`) | Root split gating child sub-poles |
| Beyond $N$-Pole | Parameter | — | Phase Diagram (`"phase-diagram"`) | 2D parameter space, boundaries + triple point |

---

## 11. Beyond-$N$-Pole Widgets — CANONICAL (2026-11-15)

Standard $N$-pole widgets assume a debate consists of $N$ static, co-equal vertices around a center. Some topics violate that assumption. Two Beyond-$N$-Pole widgets earned canonical status in the 2026-11-15 cross-skin fit review; the rest are deferred (see §11.3).

### 11.1 Hierarchical Tree / Nested Conditional (`"decision-tree"`)
Used where **a root split gates child sub-poles** — rating a child without answering the root is incoherent (e.g. Free Will — root binary "is determinism true?" then the compatibility question, yielding exactly the four leaves; Mind-Body — "one substance or two?" unlocks monist children vs the dualist leaf; the Divine's Four Quadrants — "do gods exist?" unlocks Personal/Impersonal Theism only if yes; Lee's Love Styles — the 3 secondaries are pairwise combos of the 3 primaries, so rating a secondary without its two primaries is incoherent; Sternberg's Matrix — all 7 poles are the 7 non-empty subsets of three binary components, and a three-question binary tree generates exactly these poles).
- **Geometry:** a primary binary split at the root that unlocks secondary sub-poles only on the chosen branch.
- **Caveat (Chemcapades Reductionism):** the Roadmap's child labels do not map 1:1 onto the actual poles, and Pluralism is a meta-stance that refuses the root split — it needs a third root option. Child labels must be derived from the topic's actual poles, not invented.
- **Near-miss guard:** a linear ladder is not a tree (Forescapades PaRDeS — Peshat→Sod is a ladder, not a branching tree); parallel alternatives are not children (Philoscapades Seven Theories of Truth — six substantive theories are parallel, not children of one branch).
- **Canonicalisation basis:** 9 fits across 4 skins.

### 11.2 2D Continuous Phase Diagram (`"phase-diagram"`)
Used where **a stance depends on a parameter** — the disagreement is literally a boundary in that parameter's space (e.g. Thermodynamic vs Kinetic Control — textbook temperature-dependent: high $T$ → thermodynamic product, low $T$ → kinetic product; Dark Matter Identity — the MOND pole applies only below the acceleration threshold $a_0$; Grand Unification vs EFT — the right theory depends on energy scale; Fiscal & Monetary Policy — the correct regime depends on macro conditions, unemployment × inflation).
- **Geometry:** borrowed from physical chemistry ($P$–$T$ or composition–temperature diagrams). The user draws or drags phase boundaries (coexistence curves) and a triple point across a 2D parameter space, shading which regions belong to which paradigm — capturing conditional truth ("I am a thermodynamicist at high $T$, a kineticist at low $T$").
- **Storage:** the boundary positions and the triple point in the parameter space, plus the region-to-pole assignment.
- **Generalises beyond triads:** several fits are dipoles — a single global slider forces a false stance where the truth is regime-conditional.
- **Near-miss guard:** complementary toolkits with no parameter threshold are not phase diagrams (Chemcapades Supramolecular — no threshold or triple point); a pursue-vs-deploy strategy is not a boundary map (Mattercapades Superconductors); one parameter with no second axis or triple point is not a diagram (Simulcapades Continuum vs Discrete).
- **Canonicalisation basis:** 8 fits across 3 skins.

### 11.3 Deferred — NOT canonical (2026-11-15 fit review)
These were proposed in the Chemcapades Roadmap but do not earn canonical status yet. Do not assign them to topics until a fit is established.
- **`"window-gauge"` / `"bandpass-slider"` (Two-Limit Range / Window Gauge):** exactly 1 fit in all 15 skins — Chemcapades 2.3 The End of the Periodic Table (Island of Stability bounded between nuclear instability and relativistic breakdown). The fit is exact and it closes a real gap, but it is a single-topic widget today. Build only if the schema's goal is zero unquoted gaps, or when a second two-limit topic appears. Near-miss: Techcapades Transhumanism — its extremes are legitimate stances, not failure thresholds; it is a LINE, not a window.
- **`"ranked-stack"` (Ranked-Order / Tier-List Stack):** 2 genuine fits — Vocapades Four Career Anchors (Schein's model is ordinal by definition) and Expericapades Three Frontiers of Empirical Physics (an ordinal funding priority, with the Red Line ruling a frontier out as a dead end). Deferrable — build only if more priority topics appear. Near-misses: Chemcapades Green Chemistry (genuinely 2D — ranking flattens it) and Publication Culture (multi-affinity — forced ranking contradicts it).
- **`"causal-loop"` / `"cycle-flow"` (Directed Causal / Cycle Graph):** 1 fit — Chemcapades 3.2 Computational vs Wet-Bench (the question is literally directional: "Does theory lead the bench, or the bench lead theory?"), with a node-mapping caveat (Theory has no separate pole; the Loop pole *is* the structure). Defer — build only if more loop topics are specified.
- **`"constellation-graph"` (Force-Directed Network / Constellation Canvas):** 0 fits anywhere in the 15 skins. Do not build for current topics; keep as a speculative future widget only if a genuinely relational topic is ever specified. The Roadmap's claimed use case (Origins of Life / RNA World / Metabolism-First / etc.) names poles that belong to no topic in any briefing.


