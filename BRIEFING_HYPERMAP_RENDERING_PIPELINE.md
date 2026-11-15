# AI Briefing: The Hypermap Rendering Pipeline & Geometry Engine

## 1. Overview
The **Hypermap** is the visual core of the Taxopolemics engine. It represents a multi-level semantic tree (Categories $\to$ Subcategories $\to$ Topics/Leaves) projected onto an organic radial layout. Rather than drawing sterile, straight line graphs or mechanical mind maps, the engine renders an organic, living "vascular" arborization where topics fan out on flared, bulbous spokes with smooth, naturalistic midline curves.

---

## 2. Coordinate Systems & Projection

### 1. Polar Root Space
- The origin $(0, 0)$ is the Center Node (representing the user or open profile).
- **Categories** fan radially outward at primary sector angles $\theta_c$.
- **Subcategories** branch outward from their parent category nodes.
- **Topics (Leaves)** form the outermost perimeter canopy.

### 2. Camera Transform & Matrix Cache
The viewport camera maintains position $(E_p, A_p)$ and scale $\$_p$.
In GPU-accelerated mode, the camera transform is applied as a CSS hardware matrix on the primary SVG container `#mapTransformGroup`:
$$\mathbf{T} = \begin{bmatrix} \text{ratio} & 0 & d_x \\ 0 & \text{ratio} & d_y \\ 0 & 0 & 1 \end{bmatrix}$$
where:
- $\text{ratio} = \$p / \text{th.scale}$
- $d_x, d_y$ are offset compensations relative to the SVG container viewport center.
On gesture completion (`kh`), the transform commits into the native SVG `transform="translate(Ep, Ap) scale($p)"` attribute, resetting the CSS matrix.

---

## 3. Spoke Geometry & Bulbous Base Tapers

Spoke geometry is computed in [`02f-spoke-geometry.js`](file:///home/jason/Sexcapades-Web/app/js/modules/02f-spoke-geometry.js).

### 1. Gaussian Bell Curve vs. Linear Exponential
Historically, spokes flared linearly or via an exponential taper, which produced thin, needle-like waists near the base and overcrowded fanning near child icons. The engine uses a **Gaussian bell taper**:
$$w(u) = w_{\text{tip}} + (w_{\text{base}} - w_{\text{tip}}) \cdot \exp\left(-\left(\frac{u}{\sigma}\right)^2\right)$$
where:
- $u \in [0, 1]$ is the normalized progress from base ($u = 0$) to tip ($u = 1$).
- $\sigma = 0.72$ defines the plumpness width.
- Spoke base width is scaled: $w_{\text{base}} = 8.5 \cdot e$, capped at $95.8$ map units (`TAPER_BASE_FRACTION: 0.92`).
This provides a broad, bulbous foundation hugging the parent node while narrowing gracefully toward the leaf without crowding the perimeter.

### 2. Flank Path Tracing & Arc Hugging
Each spoke is rendered as two distinct flank paths (top flank and bottom flank):
- **Base Circle Hugging (`b`)**: When the spoke emanates from a circular node (e.g. category icon), the base corners are radially projected onto the disc circumference, and the base boundary is emitted as a circular SVG arc command.
- **Tip Circle Hugging (`bE`)**: At the leaf end, the flank terminates along the boundary circle of the leaf icon, ensuring pixel-perfect geometric contact without overlapping or visual gaps.

---

## 4. Midline Solving & Simulated Annealing Deknotting

### 1. Cubic Bezier Midlines (`03a-midline-solver.js`)
Spoke centerlines are cubic Bezier curves defined by 4 control points:
$$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$$
Control points are oriented along radial unit normals $(n_x, n_y)$ to produce organic curves that bend away from neighboring branches.

### 2. Simulated Annealing Deknotter (`02l-deknotter-session.js`)
When users rate topics or expand branches, spokes can cross. The deknotter executes an asynchronous simulated annealing solver:
- Energy function $E$:
  $$E = \sum_{\text{crossings}} w_{\text{cross}} + \sum_{\text{angular distance}} w_{\text{tension}}$$
- Metropolis criterion:
  $$P(\text{accept}) = \exp\left(-\frac{\Delta E}{T}\right)$$
- The temperature $T$ cools across successive cycles, rotating branch spoke sequences until all planar intersections are eliminated.

---

## 5. Performance Guarantees & Avoiding Layout Thrashing

1. **Camera Motion State (`is-camera-moving`)**:
   When the user drags or zooms the hypermap, the `#conceptMap` element is given the class `is-camera-moving`.
2. **Strict Layout Thrashing Prohibition in `wr()`**:
   In [`03-map-geometry.js`](file:///home/jason/Sexcapades-Web/app/js/modules/03-map-geometry.js), `wr()` performs off-screen culling of direction controls and overlap links.
   - **Crucial Rule**: `wr()` must return immediately while `is-camera-moving` is active.
   - Calling `getBoundingClientRect()` on hundreds of SVG nodes during a 60fps/120fps gesture forces synchronous layout reflows on every single frame, causing severe viewport jank.
3. **Settled Viewport Sweep**:
   Once gesture input ceases, a 130ms debounce triggers `xh()` $\to$ `kh()`, which removes `is-camera-moving` and runs `wr()` exactly once to update visibility and screen-reader accessibility attributes.
