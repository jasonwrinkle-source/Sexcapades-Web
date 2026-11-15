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
- Color palette: `["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#a855f7", "#ec4899"]`.
- Pairs $(k, k+3)$ form diametric poles across the center, enabling direct visualization of psychological oppositions.
