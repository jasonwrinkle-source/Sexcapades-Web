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

## 5. UI / UX Design Guidelines for Future 4-Pole Widgets

When engineering the interactive widget for 4-pole topics (Tetrads), developers should observe the following specifications:
1. **Interactive Planar Projection**:
   - Rather than rendering a complex 3D rotating tetrahedron on a 2D canvas, the 4 poles should be mapped as a **Square Quad-Placard** (or 2D circle with 4 orthogonal poles at N, S, E, W), where the interior represents the projection of $\Delta^3$.
2. **Four Color Quadrants**:
   - Pole 1: Cyan / Blue ($\#0284c7$)
   - Pole 2: Emerald / Green ($\#10b981$)
   - Pole 3: Amber / Yellow ($\#f59e0b$)
   - Pole 4: Crimson / Red ($\#ef4444$)
3. **Midline & Radius Indicators**:
   - A central reticle shows the barycentric centroid $(\frac{1}{4}, \frac{1}{4}, \frac{1}{4}, \frac{1}{4})$.
   - The puck's vector offset indicates the primary tilt, while distance from the center reflects polarization versus balance.
4. **Independent Intensity Slider**:
   - Just like the Triad widget, an adjacent vertical slider or mouse-wheel controls the total intensity $\mu \in [0, 100]$ (e.g. how much this dynamic matters to the user overall).

---

## 6. Integration Checklist for Next Engineering Phase
- [x] Barycentric 2D Triangle Canvas implemented for Triads in `03e-map-paint.js`.
- [x] Tangent orientation on Hypermap spokes implemented in `02f-spoke-geometry.js`.
- [x] Scribe narration speed control ($0.75\times$ to $1.5\times$) wired to Web Audio and SpeechSynthesis.
- [ ] Implement `TetradWidget` class for 4-pole square barycentric projection.
- [ ] Migrate candidate topics (`Power Matrix`, `Orgasm Dynamic`, `Political Compass`) to 4-pole catalog schema.
- [ ] Extend Krossmatch contraction parser to compute tensor outer products over $\mathbb{R}^4$.
