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


