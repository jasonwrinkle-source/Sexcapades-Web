# Mathematical Formalization of 1-, 2-, 3-, and 4-Pole Topics in Hypermap Taxonomies
*A Theoretical and Algorithmic Briefing for Multi-Pole Rating Systems in Sexcapades, Poliscapades, and Forescapades*

**Author:** Antigravity (AI Assistant) & Principal Investigator Jason Mark Wrinkle  
**Status:** Architecture Specification & Reference Briefing  
**Target Audience:** Autonomous Agents, Mathematical Modelers, and System Engineers

---

## 1. Abstract & Executive Summary

The Sexcapades hypermap engine models individual psychological orientations, sexual preferences, ideological tenets, and theological stances across three domain skins:
1. **Sexcapades** (Kink, intimacy, and erotic dynamics)
2. **Poliscapades** (Governance, economics, and political philosophy)
3. **Forescapades** (Theology, metaphysics, and ritual practice)

Traditionally, preference spaces in relational profiling are reduced to:
- **Monopole (1-Pole / Scalar)**: Absolute affinity or personal resonance ($r \in [0, 100]$ or $[-100, +100]$) without directional differentiation.
- **Dipole (2-Pole / Give-Receive Vector)**: Paired complementary channels $(g, r) \in [-100, +100]^2$, where giving ($g$) and receiving ($r$) represent orthogonal directions that are never summed or collapsed.

However, certain real-world dynamics, relational arrangements, and multi-faceted roles cannot be embedded into 1- or 2-pole structures without severe distortion or artificial decomposition. This brief formalizes **Triads (3-Pole Simplex)** and **Tetrads (4-Pole Simplex)**, outlines their barycentric geometry, details how inter-profile similarity and tensor contractions are calculated, and identifies specific natural candidates across all three taxonomies for 4-pole implementation.

---

## 2. Geometric & Algebraic Classification of Pole Structures

| Structure | Geometric Domain | Degrees of Freedom | Independent Variables | Canonical Example |
| :--- | :--- | :--- | :--- | :--- |
| **1-Pole (Monopole)** | 1D Interval: $x \in [-100, +100]$ | 1 | $x$ | Affection, Solo Masturbation, Aesthetics |
| **2-Pole (Dipole)** | 2D Product: $(g, r) \in [-100, +100]^2$ | 2 | $g$ (give), $r$ (receive) | Spanking, Oral Sex, Collar / Leash |
| **3-Pole (Triad)** | 2-Simplex $\Delta^2 \times I$: $(w_1, w_2, w_3, \mu)$ | $2 + 1 = 3$ | Barycentric $(w_1, w_2, w_3)$ + Intensity $\mu$ | Bull / Hotwife / Cuckold; Top / Side / Bottom |
| **4-Pole (Tetrad)** | 3-Simplex $\Delta^3 \times I$: $(w_1, w_2, w_3, w_4, \mu)$ | $3 + 1 = 4$ | Barycentric $(w_1, w_2, w_3, w_4)$ + Intensity $\mu$ | D/s + M/s Matrix; Political Compass + Praxis |

### 2.1 The Monopole (1-Pole / Scalar)
- **Geometry**: Line segment $[-100, +100]$ or $[0, 100]$.
- **Usage**: Used strictly when the topic has no directional complementarity or role duality. E.g., `Switching`, `Bondage art`, `Affection`.
- **Contraction**: Resemblance is simply product or distance $|x_A - x_B|$.

### 2.2 The Dipole (2-Pole / Directed Channels)
- **Geometry**: 2D Cartesian box $[-100, +100]^2$.
- **Crucial Rule**: *Direction is never contracted.* Giving ($g$) and receiving ($r$) are distinct channels.
- **Krossmatch ($\bowtie$)**: Channel 1 pairs $g_A$ with $r_B$; Channel 2 pairs $r_A$ with $g_B$.
- **Contraction**: Live flow is bounded by the weaker participant: $\min(|g_A|, |r_B|)$ with sign determined by compatibility route tables.

### 2.3 The Triad (3-Pole / 2-Simplex)
- **Geometry**: Equilateral triangle $\Delta^2 = \{ (w_1, w_2, w_3) \in [0,1]^3 \mid \sum_{i=1}^3 w_i = 1 \}$ combined with an independent scalar intensity/affinity $\mu \in [0, 100]$.
- **Puck Position**: Inside the triangle, coordinates correspond to barycentric weights $(w_1, w_2, w_3)$.
- **Midline Display**: The distance from the base tangent to the apex radial represents the pole distribution.
- **Three Fundamental Types of Triad Nodes**:
  1. **Relational / Role Triads (Dynamic Allocation)**:
     - *Example*: Bull / Hotwife / Cuckold, Vixen / Stag / Cuckquean.
     - *Semantics*: Captures identity or desired role within a triad dynamic.
  2. **Stylistic / Experiential Triads (Modality Distribution)**:
     - *Example*: Primal vs. Sensual vs. Humiliation; Tantric vs. Frantic vs. Trance.
     - *Semantics*: Expresses how an experience should feel or what sensations dominate.
  3. **Structural / Ethical Triads (Framework Preference)**:
     - *Example*: Monogamy vs. Polyamory vs. Relationship Anarchy.
     - *Semantics*: Boundary and structural preferences.

### 2.4 The Tetrad (4-Pole / 3-Simplex)
- **Geometry**: Regular tetrahedron $\Delta^3 = \{ (w_1, w_2, w_3, w_4) \in [0,1]^4 \mid \sum_{i=1}^4 w_i = 1 \}$ scaled by total intensity $\mu \in [0, 100]$.
- **When to Use a 4-Pole Widget**:
  1. When a concept is defined by two intersecting, non-separable binary axes (e.g., Active/Passive $\times$ Dominant/Submissive).
  2. When four distinct, mutually complementary roles form a closed ecological cycle.
  3. When an ideology or dynamic spans a 2D quadrant plane where pure extremes exist at four orthogonal poles.

---

## 3. Mathematical Scoring & Tensor Contractions for Simplex Topics

### 3.1 Profile Vector Representation
For an $n$-pole topic ($n \in \{3, 4\}$), an individual's rating vector is represented as:
$$\vec{v} = \mu \begin{pmatrix} w_1 \\ \vdots \\ w_n \end{pmatrix}, \quad \text{where } \mu \in [0, 100] \text{ and } \sum_{i=1}^n w_i = 1, \; w_i \ge 0$$

### 3.2 Similarity & Compatibility Scoring
When comparing Person $A$ and Person $B$ on an $n$-pole topic, two distinct questions are asked:

#### 1. Peer Resemblance (Straight Talk $\odot$)
Measures identity alignment and peer likeness.
$$\text{Resemblance}(\vec{v}_A, \vec{v}_B) = \frac{\mu_A \mu_B}{100} \cdot \left( 1 - \frac{1}{2} \sum_{i=1}^n |w_{A,i} - w_{B,i}| \right)$$
- If both participants desire the exact same role distribution, the barycentric overlap is 1.0, and the score is the product of their intensities.
- If they sit at opposite pure vertices (e.g., Person A is 100% Bull and Person B is 100% Cuckold), the resemblance is 0.

#### 2. Relational Fit / Play Fit (Krossmatch $\bowtie$)
In role-based triads/tetrads, compatibility is **not** resemblance; it is **complementarity**.
Complementarity is governed by a role-coupling matrix $\mathbf{C} \in \mathbb{R}^{n \times n}$:
$$\text{Fit}(\vec{v}_A, \vec{v}_B) = \min(\mu_A, \mu_B) \cdot \left( \vec{w}_A^T \mathbf{C} \vec{w}_B \right)$$

For example, in the **Bull / Hotwife / Cuckold** Triad ($B, H, C$):
$$\mathbf{C} = \begin{pmatrix} 0 & 1 & 0.8 \\ 1 & 0 & 1 \\ 0.8 & 1 & 0 \end{pmatrix}$$
- Bull $\leftrightarrow$ Hotwife coupling = 1.0
- Hotwife $\leftrightarrow$ Cuckold coupling = 1.0
- Bull $\leftrightarrow$ Cuckold coupling = 0.8 (eroticized voyeurism/cuckoldry dynamic)
- Bull $\leftrightarrow$ Bull coupling = 0.0 (unless cuckold tag-team is marked)

---

## 4. Comprehensive Taxonomy Audit: 4-Pole Candidates

Across the three domains, multiple topics currently compressed into give/receive sliders or split awkwardly across subcategories are **naturally 4-pole tetrads**.

### 4.1 Sexcapades (Kink & Erotic Dynamics)

1. **The Power Matrix (Master / Mistress / Slave / Pet)**
   - *Current representation*: Split between `t0010` (D/s), `t0009` (FemDom), and `t0015` (Male Authority).
   - *Natural 4-Pole Structure*:
     - **Pole 1 (Formal Dominant / Master)**: Structure, protocol, commands.
     - **Pole 2 (Sensual Dominant / Nurturer)**: Care, aftercare, sensual control.
     - **Pole 3 (Devotional Submissive / Service)**: Domestic service, task execution.
     - **Pole 4 (Primal / Brat / Rebel)**: Defiance, testing limits, playful friction.

2. **Orgasm & Climax Dynamic (Spill / Deny / Delay / Force)**
   - *Current representation*: `t0411` (Edging/Ruined/Forced) is a triad; missing the active orgasm release spectrum.
   - *Natural 4-Pole Structure*:
     - **Pole 1: Ruined / Denied Orgasm** (psychological torment/chastity).
     - **Pole 2: Extended Edging / Plateaus** (sustained arousal waves).
     - **Pole 3: Forced / Overstimulation** (post-orgasmic continuation).
     - **Pole 4: Explosive / Cathartic Climax** (uninhibited synchronized release).

3. **Multi-Party Intimacy Geometry (Swinger / Cuckold / Poly / Monogamish)**
   - *Natural 4-Pole Structure*:
     - **Pole 1: Voyeur / Compersion (Cuckold / Cuckquean)**: Eroticized partner sharing with power differential.
     - **Pole 2: Parallel / Ethical Non-Monogamy (Swinging / Free Love)**: Equal recreational exchange.
     - **Pole 3: Hierarchical Polyamory (Primary / Secondary)**: Deep romantic bonds with structured anchors.
     - **Pole 4: Relationship Anarchy**: Total rejection of hierarchies and pre-set relationship ladders.

4. **Kink Motivation Quartet (Escape / Connection / Catharsis / Transgression)**
   - *Natural 4-Pole Structure*:
     - **Pole 1: Escape / Decompression** (mindlessness, trance, dropping executive function).
     - **Pole 2: Deep Connection / Union** (radical vulnerability, emotional fusion).
     - **Pole 3: Somatic Catharsis** (endorphin rush, screaming, physical intensity).
     - **Pole 4: Transgression / Taboo** (forbidden thrills, breaking social scripts).

---

### 4.2 Poliscapades (Politics & Governance)

1. **The Classical Political Compass (Nolan Chart as a Tetrad)**
   - *Current representation*: Awkward 1-pole left/right or authoritarian/libertarian sliders.
   - *Natural 4-Pole Structure*:
     - **Pole 1: Authoritarian Left (State Socialism / Planned Centralization)**.
     - **Pole 2: Authoritarian Right (National Conservatism / Hierarchy & Tradition)**.
     - **Pole 3: Libertarian Left (Anarcho-Syndicalism / Mutual Aid / Horizontal Solidarity)**.
     - **Pole 4: Libertarian Right (Free Market Capitalism / Privatism / Sovereign Individual)**.
   - *Why 4-pole is better*: Participants rarely fit pure binaries; individuals distribute their affinity with a barycentric weight across all four quadrants.

2. **The Decision-Making Ecology (Consensus / Technocracy / Direct Democracy / Sovereign Mandate)**
   - *Natural 4-Pole Structure*:
     - **Pole 1: Consensus-Seeking** (universal agreement before action).
     - **Pole 2: Majoritarian Direct Democracy** (referendums, popular will).
     - **Pole 3: Technocratic / Meritocratic Expertise** (evidence-based bureaucratic governance).
     - **Pole 4: Executive Sovereign Mandate** (rapid, singular crisis leadership).

---

### 4.3 Forescapades (Theology & Metaphysics)

1. **Metaphysical Reality (Materialism / Idealism / Pantheism / Dualism)**
   - *Natural 4-Pole Structure*:
     - **Pole 1: Pure Materialism / Physicalism** (all reality is matter/energy; consciousness is emergent).
     - **Pole 2: Objective Idealism / Non-Duality** (consciousness/Brahman/God is the primary ground).
     - **Pole 3: Pantheism / Animism** (divinity is immanent throughout all natural forms).
     - **Pole 4: Transcendent Dualism** (unbridgeable chasm between Creator and Creation).

2. **Spiritual Practice Quadrant (Contemplation / Devotion / Ritual Action / Asceticism)**
   - *Natural 4-Pole Structure*:
     - **Pole 1: Jnana / Contemplative Inquiry** (meditation, philosophical deconstruction, silent sitting).
     - **Pole 2: Bhakti / Emotional Devotion** (prayer, ecstasy, singing, surrender to the divine).
     - **Pole 3: Karma / Ritual & Community Action** (sacraments, liturgy, charity, moral obedience).
     - **Pole 4: Tapas / Asceticism & Discipline** (fasting, vigils, denial of bodily impulses).

---

## 5. UI / UX Design Taxonomy & Speculation for Multi-Pole Widgets

Choosing the appropriate rating widget depends directly on the **mathematical nature** and **psychological semantics** of the topic:

### 5.1 The Three Structural Archetypes of Multi-Pole Topics

| Archetype | Semantics | Sum Constraint | Ideal UI Widget | Candidate Topics |
| :--- | :--- | :--- | :--- | :--- |
| **Type I: Closed Role Allocation (Zero-Sum Simplex)** | Pure identity / mutually exclusive role allocation within a single encounter. | $\sum w_i = 1$ (Hard Simplex) | **Barycentric Simplex (Triangle $\Delta^2$ / Isometric Pyramid $\Delta^3$)** | Bull/Hotwife/Cuckold (`t0281`), Top/Bottom/Side (`t0407`), Power Matrix Master/Mistress/Slave/Pet (`t0413`) |
| **Type II: Multi-Affinity Distribution (Non-Zero-Sum Mass)** | Modalities, sensations, or motives where a user can have independent, bimodal, or concurrent high resonance. | Independent $w_i \in [0, 100]$ (Kite Area) | **Radar / Diamond Deformation Polygon (Concept B-alt2)** | Kink Motivation (`t0416`), Orgasm Dynamics (`t0414`), Intimacy Geometry (`t0415`), Political Compass |
| **Type III: Geometric / Quadrant Continuum** | Orthogonal 2D axes with continuous spatial polarization (e.g. Left/Right $\times$ Auth/Lib). | Coordinate pair $(x, y) \in [-100, 100]^2$ + overall intensity | **Bounded Planar Quad (Concept A)** | Political Compass Quadrant, Decision Ecology |

### 5.2 Deep Dive into Concept B-alt2: The Radar / Diamond Deformation Polygon
For both Triads (3-pole) and Tetrads (4-pole), the **Deformation Polygon** provides decisive advantages over single-point pucks:
1. **Solves the "Fake Neutrality" Fallacy**:
   - In a barycentric triangle or square, placing a puck at the exact centroid gives coordinates $(\frac{1}{3}, \frac{1}{3}, \frac{1}{3})$ or $(\frac{1}{4}, \frac{1}{4}, \frac{1}{4}, \frac{1}{4})$.
   - On a single-point map, this is ambiguous: Does the user *love all poles equally* (omni-enthusiast), or are they *completely indifferent to all of them* (apathetic)?
   - In **Concept B-alt2**, an indifferent user has a collapsed point at the center (area $\approx 0$). An omni-enthusiast pulls all vertices outward to form a maximal full diamond or equilateral triangle.
2. **Allows True Bimodal Orientations**:
   - A user who loves *both* Ruined Orgasms AND Explosive Cathartic Climaxes, but dislikes Edging, can deform the diamond along the North-South axis while keeping East-West retracted to 0. A single 2D interior point cannot express this without sitting on the unwanted middle axes.
3. **Application to Triads**:
   - For experiential triads like `t0408` (Sensual / Primal / Humiliation) or `t0412` (Tantric / Frantic / Trance), pulling 3 radial vertices to shape a dynamic 3-sided kite allows users to rate multi-faceted desires without sacrificing intensity resolution.

### 5.3 Deep Dive into Concept C: The Isometric Pyramid (True 3-Simplex $\Delta^3$)
- **Purity and Precision**:
  - When 4 roles represent a closed zero-sum dynamic (e.g., in a 4-way scene where one must commit a distribution of their capacity between Master, Mistress, Slave, and Pet), an isometric 3D wireframe pyramid projected into 2D canvas offers geometric fidelity.
  - The puck is dragged in 3D perspective, or adjusted via a primary base triangle with an elevation/apex slider.

---

## 6. Migration Strategy: Orthogonal Projection for Existing Profiles

When transitioning an existing topic from a legacy 2-pole $(g, r)$ schema to a 4-pole tetrad $(P_1, P_2, P_3, P_4)$, the **Orthogonal Projection Migration** is employed:
$$\begin{pmatrix} P_1 \\ P_2 \end{pmatrix} = \text{proj}_{\text{give}}(g), \quad \begin{pmatrix} P_3 \\ P_4 \end{pmatrix} = \text{proj}_{\text{receive}}(r)$$
- **Give Channel Mapping**: The legacy `give` value initializes the proactive/initiatory poles ($P_1, P_2$). For example, in the Power Matrix, `give` populates *Master* and *Mistress*.
- **Receive Channel Mapping**: The legacy `receive` value initializes the receptive/responsive poles ($P_3, P_4$). In the Power Matrix, `receive` populates *Slave* and *Pet/Brat*.
- **Integrity Guarantee**: Profiles imported from legacy versions retain their directional intensity without data loss or unrated degradation.

---

## 7. Integration Status
- [x] Barycentric 2D Triangle Canvas implemented for Triads in `03e-map-paint.js`.
- [x] Tangent orientation on Hypermap spokes implemented in `02f-spoke-geometry.js`.
- [x] Scribe narration speed control ($0.75\times$ to $1.5\times$) wired to Web Audio and SpeechSynthesis.
- [x] 4-Pole Tetrad candidate placeholders registered in `02b-taxonomy-data.js` (`t0413`, `t0414`, `t0415`, `t0416`).
- [x] Tetrad shape definitions registered in `02i-taxonomy-catalog.js`.
- [x] Orthogonal projection migration added to `06c-converter-pipeline.js`.
- [x] Radar/Diamond Deformation Polygon (Concept B-alt2) widget implemented for Tetrads with user-specified orthogonal vertex palette:
  - **North**: Emerald Green (`#22c55e`)
  - **East**: Amber Yellow (`#eab308`)
  - **South**: Crimson Red (`#ef4444`)
  - **West**: Cobalt Blue (`#3b82f6`)
- [x] 4-Pole Hypermap spoke geometry rendering deformed diamond SVG with color-coded vertices and labels.
- [x] 5-Pole Pentad star deformation widget implemented with 5 radial axes, mouse-wheel intensity scaling, and dynamic dragging.
- [x] 5-Pole Hypermap spoke geometry rendering deformed pentagon/star SVG on the hypermap.
- [x] Placard and hypermap interaction bindings unified with touch and pointer event normalization.
- [x] Zoomed node selection bug resolved in `06-pdf-exporter.js` (preventing clicks from falling through to canvas pan).
- [x] Comprehensive guide documentation updated in `guide.html` across all environments (`app/`, `hosted/`, `qa/`).
- [x] 6-Pole Hexad radar deformation polygon widget implemented with 6-color diametric complementary palette:
  - **Pole 0 (North)**: Emerald Green (`#22c55e`)
  - **Pole 1 (North-East)**: Cyan Sky (`#06b6d4`)
  - **Pole 2 (South-East)**: Indigo Blue (`#6366f1`)
  - **Pole 3 (South)**: Crimson Red (`#ef4444`)
  - **Pole 4 (South-West)**: Amber Orange (`#f97316`)
  - **Pole 5 (North-West)**: Canary Yellow (`#eab308`)
- [x] 6-Pole Hypermap spoke geometry rendering deformed regular hexagon SVG with radial guide spokes, vertex circles, and labels.
- [x] Hot List interactive widget pop-up window (`hotListWidgetDialog`) implemented across all multi-pole topics (Triads, Tetrads, Pentads, Hexads) with live profile synchronization.
- [x] Elimination & migration of superseded lower-pole approximations (`t0410` $\to$ `t0415`, `t0411` $\to$ `t0414` / `t0422`).

---

## 8. 5-Pole Pentad Topics ($\Delta^4$ Simplex & 5-Axis Star Matrix)

### 8.1 Geometric & Interaction Architecture
The Pentad models a 4-simplex $\Delta^4$ projected into a 2D regular 5-star / pentagon space. The five radial axes emanate from the centroid $(x_0, y_0)$ at equiangular intervals:
$$\theta_k = \frac{2\pi k}{5} - \frac{\pi}{2}, \quad k \in \{0, 1, 2, 3, 4\}$$
Each vertex position is defined by:
$$V_k = \left( x_0 + \frac{r_k}{100} R \cos\theta_k, \; y_0 + \frac{r_k}{100} R \sin\theta_k \right), \quad r_k \in [0, 100]$$

#### Canonical 5-Pole Chromatic Palette:
- **Pole 0 (Apex / Top)**: Purple (`#a855f7`)
- **Pole 1 (Top-Right)**: Cyan (`#06b6d4`)
- **Pole 2 (Bottom-Right)**: Amber (`#f59e0b`)
- **Pole 3 (Bottom-Left)**: Red (`#ef4444`)
- **Pole 4 (Top-Left)**: Emerald (`#22c55e`)

### 8.2 Taxonomic Discovery & Grounding

#### 1. Sexcapades
1. **`t0417` Somatosensory Palette (5 Sensory Receptors)**:
   - *Thermal* (ice, fire, wax, liquid temperature shock).
   - *Vibro-Tactile* (sonic waves, low-frequency rumble, motorized oscillation).
   - *Deep Pressure* (weighted blankets, compression, heavy bondage, joint holds).
   - *Sharp / Cutaneous* (pinwheels, claws, cane edge, flogger tips).
   - *Ischemic / Clamp* (clothespins, suction cups, tourniquets, breast clamps).
2. **`t0418` Erotic Intimacy Languages (5 Channels of Connection)**:
   - *Physical Touch & Somatic Attunement* (skin hunger, breath synchronization).
   - *Verbal Worship & Erotic Affirmation* (dirty talk, praise, commands, whispering).
   - *Devotional Service & Protocols* (serving tea, massage, foot washing, obedience).
   - *Playful Chaos & Game Playing* (teasing, bratting, laughter, wrestling).
   - *Sacramental Presence & Eye Gazing* (unbroken eye contact, tantric stillness).
3. **`t0419` BDSM Archetype Spectrum**:
   - *The Primal* (instinct, growling, biting, raw biological drive).
   - *The Sadomasochist* (endorphin processing, pain transformation, physical edge play).
   - *The Rope Artist / Rigger* (aesthetic suspension, geometric entanglement, tactile craft).
   - *The Caregiver / Daddy-Mommy Dom* (hyper-nurturance, rules for emotional safety).
   - *The Protocol Master / High Dom* (etiquette, formal obedience, linguistic precision).

#### 2. Poliscapades
- **Five Pillars of Civic Allocation**:
  - *Infrastructure & Transit* (roads, rail, energy grid, water security).
  - *Social Welfare & Universal Healthcare* (safety nets, housing, public health).
  - *Public Safety & Rule of Law* (courts, civil defense, restorative justice).
  - *Ecological Restoration & Climate Transition* (rewilding, decarbonization).
  - *Culture, Education & Research* (universities, scientific exploration, arts).

#### 3. Forescapades
- **The Five Elemental Currents (Tattva / Classical Pentad)**:
  - *Prithvi (Earth)*: Stability, bodily ground, physical manifest form.
  - *Apas (Water)*: Emotional flow, fluidity, subconscious depth.
  - *Agni (Fire)*: Will, illumination, metabolic transformation, kundalini heat.
  - *Vayu (Air)*: Intellect, prana/breath, movement, abstract ideation.
  - *Akasha (Aether / Space)*: Pure vacuum, non-local awareness, primordial field.

---

## 9. 6-Pole Hexad Topics ($\Delta^5$ Simplex & Hexagonal Ring Deformation)

### 9.1 Geometric & Structural Foundation
The Hexad represents the 5-simplex $\Delta^5$ or an equilateral hexagonal ring. The 6 poles emanate from the center at $60^\circ$ offsets:
$$\theta_k = \frac{k\pi}{3} - \frac{\pi}{2}, \quad k \in \{0, 1, 2, 3, 4, 5\}$$
Hexagonal topology is unique because it supports **three pairs of opposed dualities** as well as **two interlocking triads** (e.g. Star of David / Hexagram configuration).

```
          [Pole 0: North]
             /       \
[Pole 5: NW]           [Pole 1: NE]
     |                      |
[Pole 4: SW]           [Pole 2: SE]
             \       /
          [Pole 3: South]
```

### 9.2 In-Depth Taxonomic Audit: Latent 6-Pole Topics

Across all three taxonomies, specific archetypes and clinical frameworks naturally resolve into 6-pole hexads:

#### 1. Sexcapades (Erotics & Relationship Typology)
1. **Lee’s Six Erotic Love Styles (The Hexagon of Eros)**:
   - Grounded in John Alan Lee's canonical socio-psychological framework (*Colours of Love*), love orientations are composed of three primary styles and three secondary compounds:
     - **Pole 0: Eros (Sensual / Passionate)**: Romantic, immediate physical chemistry, aesthetic intoxication.
     - **Pole 1: Ludus (Playful / Game-Playing)**: Uncommitted flirtation, autonomous conquest, zero expectation of permanence.
     - **Pole 2: Storge (Companionate / Friendship-First)**: Slow-growing, stable, enduring affection built on deep mutual trust.
     - **Pole 3: Pragma (Practical / Realistic)**: Rational matchmaking, shared life goals, financial and logistical alignment.
     - **Pole 4: Mania (Obsessive / Volatile)**: Rollercoaster emotional intensity, possessiveness, deep craving for reassurance.
     - **Pole 5: Agape (Altruistic / Unconditional)**: Selfless, devotional love focused entirely on the partner's thriving.
   - *Why 6-pole is optimal*: Traditional 1- or 2-pole scales flatten these distinct vectors; a hexad polygon lets a user see their multi-modal love signature at a glance.

2. **Somatosensory Impact Modalities**:
   - In sensation and impact play, users do not just rate "spanking give/receive"; they respond to six distinct biological and tissue-depth stimuli:
     - **Pole 0: Sting (Surface Cutaneous)**: Sharp, burning skin sensation (canes, thin leather, riding crops).
     - **Pole 1: Thud (Deep Muscle / Skeletal)**: Heavy, reverberating blunt pressure (paddles, thick suede, flat hands).
     - **Pole 2: Thermal (Thermoreceptive)**: Hot wax, ice melting, warm stones, alternating hot/cold sensations.
     - **Pole 3: Clamp & Crush (Ischemic Nociception)**: Sustained focal pressure, blood-flow restriction, clothespins.
     - **Pole 4: Sensory Deprivation (Extinction)**: Blindfolds, earplugs, hoods, total sensory isolation.
     - **Pole 5: Sensory Overload (Saturation)**: Multi-flogger rhythms, loud music, strobe, continuous overwhelming input.

3. **Orgasm & Climax Topography**:
   - The neurological and somatic pathways of human climax form six distinct operational modes:
     - **Pole 0: External Cutaneous (Clitoral / Penile Glans)**: High-speed, intense localized neural firing.
     - **Pole 1: Deep Internal Pelvic (G-Spot, A-Spot, Prostate)**: Radiating, muscular contractions, diffuse warmth.
     - **Pole 2: Cervical / Uterine / Base Trance**: Deep, dropping, parasympathetic trance states and emotional release.
     - **Pole 3: Anal / Sphincteric Pulse**: Involuntary rhythmic pelvic-floor waves and neurological surges.
     - **Pole 4: Whole-Body Somatic Wave**: Generalized shaking, shivering, non-genital muscular orgasmic ripples.
     - **Pole 5: Psychic / Cognitive Tantric Climax**: Breathwork and mental-energy orgasm without physical contact.

#### 2. Poliscapades (Political Economy & Ideology)
1. **The Hexagonal Political Matrix**:
   - Transcends the simplistic 2D Nolan Chart by incorporating communitarian and technocratic axes:
     - **Pole 0: Free-Market Capitalism**: Deregulation, price discovery, capital accumulation, private property.
     - **Pole 1: Democratic Socialism**: Public ownership of commons, worker cooperatives, universal healthcare.
     - **Pole 2: Technocratic Meritocracy**: Governance by scientific evidence, specialized civil service, optimization.
     - **Pole 3: Communitarian Localism**: Decentralized direct democracy, regional autonomy, mutual aid leagues.
     - **Pole 4: Authoritarian State Order**: Strong centralized executive, national cohesion, civic discipline.
     - **Pole 5: Libertarian Voluntaryism**: Absolute individual sovereignty, non-aggression principle, contract law.

2. **Six Pillars of Planetary Stewardship**:
   - Energy Sovereignty, Biodiversity & Rewilding, Food/Agrarian Commons, Freshwater Security, Atmosphere & Carbon Balance, Oceanic Integrity.

#### 3. Forescapades (Metaphysics, Mysticism & Yoga)
1. **The Six Classical Pathways of Mystical Practice (Six Yogas)**:
   - **Pole 0: Bhakti Yoga (Heart / Devotion)**: Chanting, worship, surrender, intense emotional dissolution in the divine.
   - **Pole 1: Jnana Yoga (Mind / Self-Inquiry)**: Neti-neti ("not this, not that"), philosophical deconstruction of the ego.
   - **Pole 2: Karma Yoga (Right Action / Sacred Service)**: Action without attachment to fruits, seva, moral duty in the world.
   - **Pole 3: Raja Yoga (Meditation / Ashtanga)**: Patanjali's eight limbs, dhyana, samadhi, stillness of the mind-stuff (*citta-vritti*).
   - **Pole 4: Kundalini & Laya Yoga (Prana & Energy Body)**: Breathwork, kriya, chakra activation, energetic mobilization.
   - **Pole 5: Tantra & Deity Yoga (Sacred Matter Integration)**: Non-rejection of the world, ritual embodiment, divinization of all phenomena.

2. **The Six Spheres of Afterlife & Eschatology**:
   - Annihilationism/Material Extinction, Eternal Heavenly Union, Reincarnation/Samsara, Ancestral Spirit World, Universal Restoration (Apocatastasis), Purgative Evolution.

---

## 10. Unified Mathematical Scoring & Tensor Contractions across $N$-Pole Spaces ($1 \le N \le 6$)

### 10.1 Generalized Vector Formulation
Let any topic mark in an $N$-pole space be represented as an $N$-dimensional vector:
$$\mathbf{r} = (r_0, r_1, \dots, r_{N-1})^T \in [0, 100]^N$$
- **Scalar Affinity / Intensity ($\mu$)**:
  $$\mu = \max_{0 \le k < N} r_k \in [0, 100]$$
- **Normalized Directional Weight Vector ($\mathbf{w}$)**:
  $$\mathbf{w} = \begin{cases} \frac{\mathbf{r}}{\sum_{k=0}^{N-1} r_k}, & \text{if } \sum r_k > 0 \\ \left(\frac{1}{N}, \dots, \frac{1}{N}\right)^T, & \text{if } \sum r_k = 0 \end{cases}$$

### 10.2 Peer Resemblance Metric (Straight Talk $\odot$)
Measures the alignment of two individuals $\mathbf{u}, \mathbf{v} \in [0, 100]^N$:
$$\text{Resemblance}(\mathbf{u}, \mathbf{v}) = \cos(\mathbf{u}, \mathbf{v}) \cdot \left( 1 - \frac{\|\mathbf{u} - \mathbf{v}\|_1}{N \cdot 100} \right) \cdot \frac{\mu_u \cdot \mu_v}{10^4}$$
Where:
- $\cos(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$ evaluates angular directional parity.
- $\frac{\|\mathbf{u} - \mathbf{v}\|_1}{N \cdot 100} = \frac{1}{N \cdot 100} \sum_{k=0}^{N-1} |u_k - v_k|$ penalizes per-pole absolute difference.
- $\frac{\mu_u \cdot \mu_v}{10^4}$ scales by mutual intensity.

### 10.3 Complementary Play Fit Metric (Krossmatch $\bowtie$)
In role-based topics (where pole $i$ desires counterpart pole $j$), compatibility is given by a tensor contraction against a topological coupling matrix $\mathbf{C} \in [-1, 1]^{N \times N}$:
$$\text{Krossmatch}(\mathbf{u}, \mathbf{v}) = \frac{1}{100} \sum_{i=0}^{N-1} \sum_{j=0}^{N-1} u_i \cdot C_{ij} \cdot v_j$$

#### Coupling Matrix Topologies:
1. **Self-Complementary (Resemblance Dominant, e.g. Experiential Topics)**:
   $$C_{ij} = \delta_{ij} = \begin{cases} 1, & i = j \\ 0, & i \ne j \end{cases}$$
2. **Opposed Pairs (Diametric Duality in 4-Pole and 6-Pole spaces)**:
   $$C_{i, (i + N/2) \bmod N} = 1, \quad C_{ii} = 0$$
3. **Cyclic Directed Coupling (e.g. Bull $\to$ Hotwife $\to$ Cuckold)**:
   $$C_{i, (i+1) \bmod N} = 1, \quad C_{(i+1) \bmod N, i} = \gamma$$

### 10.4 Comparative Dimensionality Matrix ($1 \le N \le 6$)

| Poles ($N$) | Geometric Simplex | UI Control Surface | Degrees of Freedom | Primary Semantic Domain |
| :---: | :---: | :---: | :---: | :---: |
| **1 (Monopole)** | $\mathbb{R}^1$ Interval $[0, 100]$ | Single Slider / Dial | 1 | Universal Affinity, Solo Practice, Aesthetic |
| **2 (Dipole)** | $\mathbb{R}^2$ Directed $[0, 100]^2$ | Dual Give/Receive Sliders | 2 | Asymmetric Physical Interaction (Give vs. Receive) |
| **3 (Triad)** | $\Delta^2 \times I$ | Barycentric Triangle / Radial Trine | 3 | Tripartite Roles, Three-Tone Experiential Modalities |
| **4 (Tetrad)** | $\Delta^3 \times I$ | Radar Diamond Polygon (Concept B-alt2) | 4 | Two Intersecting Binary Axes, Power Matrix, Orgasm Modes |
| **5 (Pentad)** | $\Delta^4 \times I$ | 5-Axis Star Matrix / Pentagon | 5 | Sensory Receptor Palette, Intimacy Languages, Elemental |
| **6 (Hexad)** | $\Delta^5 \times I$ | Hexagonal Ring Deformation Polygon | 6 | Love Styles (Eros), Impact Depth Spectrum, 6 Yogas |

