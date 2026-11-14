# Mathematical Contractions of Two Profiles in Taxopolemics
*Tensor Algebra, Geometric Mechanics & Relational Metrics for Multi-Pole State Spaces*

**Engine:** Taxopolemics  
**Document:** Mathematical Specification Briefing for Autonomous Agents, Econometricians & Modelers  
**Author:** Antigravity (AI Assistant) & Principal Investigator Jason Mark Wrinkle  
**Status:** Canonical Mathematical Specification  

---

## 1. Mathematical Formalism of Profile State Vectors

Let a Taxopolemics profile $A$ be represented as a composite state vector $\mathbf{u}_A \in \mathcal{V}$, where $\mathcal{V}$ is the direct sum of topic subspaces across the entire active taxonomy $\mathcal{T}$:

$$\mathcal{V} = \bigoplus_{t \in \mathcal{T}} \mathcal{V}_t$$

For each topic $t$ with $n$ poles, the local state vector $\mathbf{u}_{A,t} = (u_{A,t,1}, u_{A,t,2}, \dots, u_{A,t,n})^T$ belongs to:
- **Monopoles ($n=1$)**: $\mathcal{V}_t = [0, 100]$
- **Dipoles ($n=2$)**: $\mathcal{V}_t = [0, 100]^2$ (Give, Receive)
- **$n$-Pole Simplices ($n \ge 3$)**: $\mathcal{V}_t = \Delta^{n-1} \times [0, 100]$, where barycentric weights $\sum_{i=1}^n \lambda_i = 1$ and overall intensity $I \in [0, 100]$, such that $u_{A,t,i} = I \cdot \lambda_i$.

When two agents $A$ and $B$ interact, their compatibility, friction, and systemic dynamics are computed via **tensor contractions** of their state vectors $\mathbf{u}_A$ and $\mathbf{u}_B$.

---

## 2. The Canonical Pair: Straight Match vs. Cross Match

### 2.1 Straight Match (Resonance, Homophily, Identity Alignment)

**Conceptual Meaning:** "Do we share the same values, desires, and ideological worldview?" In politics, this is ideological alignment; in philosophy, shared axioms; in kink, mutual affinity for an environment or shared identity.

**Mathematical Formulation:**  
For a given topic $t$, the Straight Match contraction $S_t(A, B)$ combines normalized directional cosine similarity with an intensity gap penalty:

$$S_t(A, B) = \underbrace{\left( \frac{\mathbf{u}_{A,t} \cdot \mathbf{u}_{B,t}}{\|\mathbf{u}_{A,t}\|_2 \|\mathbf{u}_{B,t}\|_2 + \epsilon} \right)}_{\text{Directional Collinearity}} \cdot \underbrace{\left( 1 - \frac{|\|\mathbf{u}_{A,t}\|_1 - \|\mathbf{u}_{B,t}\|_1|}{n \cdot 100} \right)}_{\text{Intensity Congruence}}$$

Across the full taxonomy with topic weights $w_t$:

$$S(A, B) = \frac{\sum_{t \in \mathcal{T}} w_t S_t(A, B)}{\sum_{t \in \mathcal{T}} w_t}$$

- **Range:** $[0, 1]$ (or expressed as a percentage $0\% - 100\%$).
- **Properties:** Symmetric ($S(A, B) = S(B, A)$), maximized when $\mathbf{u}_A = \mathbf{u}_B$.

---

### 2.2 Cross Match (Complementarity, Heterophily, Role-Exchange Coupling)

**Conceptual Meaning:** "Do our opposing or interlocking roles satisfy each other?" In power exchange, a Top desires a Bottom; in economics, a buyer seeks a seller; in dialectics, thesis seeks antithesis.

**Mathematical Formulation:**  
Cross Match is a **bilinear tensor contraction** parameterized by a topic-specific coupling tensor $\mathbf{C}_t \in \mathbb{R}^{n \times n}$:

$$K_t(A, B) = \frac{\mathbf{u}_{A,t}^T \mathbf{C}_t \mathbf{u}_{B,t}}{\max(\mathbf{u}_{A,t}^T \mathbf{C}_t \mathbf{u}_{B,t})}$$

#### Structure of Coupling Tensor $\mathbf{C}_t$:
1. **For 2-Pole Give/Receive Dipoles:**
   $$\mathbf{C}_{\text{dipole}} = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$$
   Yielding:
   $$\mathbf{u}_{A}^T \mathbf{C} \mathbf{u}_{B} = u_{A,\text{give}} \cdot u_{B,\text{receive}} + u_{A,\text{receive}} \cdot u_{B,\text{give}}$$
2. **For 3-Pole Triads ($\Delta^2$):**
   - In cyclic triads (Rock-Paper-Scissors / Dominance Rings):
     $$\mathbf{C}_{\text{cyclic}} = \begin{bmatrix} 0 & 1 & 0 \\ 0 & 0 & 1 \\ 1 & 0 & 0 \end{bmatrix}$$
   - In complementary dual-pole pairing (e.g. Top/Bottom with Side as self-coupling):
     $$\mathbf{C}_{\text{switch}} = \begin{bmatrix} 0 & 1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 1 \end{bmatrix}$$
3. **For 4-Pole Tetrads ($\Delta^3$):**
   - For diametric pairs (North $\leftrightarrow$ South, East $\leftrightarrow$ West):
     $$\mathbf{C}_{\text{diametric}} = \begin{bmatrix} 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \\ 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{bmatrix}$$
   - For Master/Mistress/Slave/Pet (`t0413`), coupling pairs Authority (North/East) with Surrender (South/West).

---

## 3. Novel Mathematical Contractions Beyond Straight and Cross

Straight and Cross matches sample only collinearity and specific off-diagonal couplings. The Taxopolemics engine introduces several higher-order 2-profile contractions:

```
                            [ STATE SPACE CONTRACTIONS ]
                                         │
     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
     │                   │                               │                   │
[ORTHOGONALITY]   [ASYMMETRIC ENCLOSURE]        [FRICTION GRADIENT]  [TORQUE / CHIRALITY]
  Blind-Spot          Dominance / Scope           Tension Points        Dynamic Drift
```

---

### 3.1 Orthogonality & The Blind-Spot Contraction $\mathcal{B}(A, B)$

**Conceptual Meaning:** "Where do we live in completely disconnected universes?" This measures mutual indifference and non-overlapping interest spaces. Unlike antipodal opposition (which generates intense friction), orthogonality represents total epistemic or erotic silence.

**Mathematical Formulation:**

$$\mathcal{B}_t(A, B) = 1 - \frac{|\mathbf{u}_{A,t} \cdot \mathbf{u}_{B,t}|}{\|\mathbf{u}_{A,t}\|_2 \|\mathbf{u}_{B,t}\|_2 + \epsilon} \cdot \left( \frac{\min(\|\mathbf{u}_{A,t}\|_1, \|\mathbf{u}_{B,t}\|_1)}{\max(\|\mathbf{u}_{A,t}\|_1, \|\mathbf{u}_{B,t}\|_1) + \epsilon} \right)$$

- When $\mathbf{u}_{A,t} \perp \mathbf{u}_{B,t}$, $\mathcal{B}_t(A, B) \to 1$ (Maximum Blind-Spot).
- **Application:** Identifies unshared conversational terrain where one party is intensely passionate and the other is entirely oblivious.

---

### 3.2 Asymmetric Enclosure / Subsumption / Dominance Index $\mathcal{E}(A \subseteq B)$

**Conceptual Meaning:** "Does Person B encompass everything Person A desires, while possessing vast territories that Person A cannot reach?"

This is fundamentally **asymmetric** ($\mathcal{E}(A \subseteq B) \neq \mathcal{E}(B \subseteq A)$).

**Mathematical Formulation (Fuzzy Set Subsumption):**

$$\mathcal{E}(A \subseteq B) = \frac{\sum_{t \in \mathcal{T}} \sum_{i=1}^{n_t} \min(u_{A,t,i}, u_{B,t,i})}{\sum_{t \in \mathcal{T}} \sum_{i=1}^{n_t} u_{A,t,i} + \epsilon}$$

- If $\mathcal{E}(A \subseteq B) = 1.0$ and $\mathcal{E}(B \subseteq A) = 0.35$:
  - Person A feels completely held, understood, and matched by Person B.
  - Person B feels constrained, bored, or under-stimulated by Person A's narrow bandwidth.
- **Application:** Vital for mentorship dynamics, Master/Slave capacity modeling, and philosophical mastery.

---

### 3.3 Friction Gradient Tensor & Crisis Potential $\mathcal{F}(A, B)$

**Conceptual Meaning:** Where will this pair violently collide? Friction is not merely difference; it occurs when **both agents have high intensity** in **diametrically opposing or mutually exclusive poles**.

**Mathematical Formulation:**  
Let $\mathbf{D}_t \in \mathbb{R}^{n \times n}$ be the *Antagonism Matrix* of topic $t$ (where $D_{ij} = 1$ if poles $i$ and $j$ are mutually destructive/incompatible, and $0$ otherwise).

$$\mathcal{F}_t(A, B) = \mathbf{u}_{A,t}^T \mathbf{D}_t \mathbf{u}_{B,t}$$

The localized component-wise friction vector $\mathbf{f}_t$ is:

$$f_{t,k} = \left( \frac{u_{A,t,k} + u_{B,t,k}}{2} \right) \cdot \sum_{j \neq k} D_{kj} u_{A,t,k} u_{B,t,j}$$

- **Application:** In Poliscapades, pinpoints irreconcilable culture-war flashpoints; in Sexcapades, flags non-negotiable hard limit violations (e.g. one partner requires 24/7 total ownership while the other demands relationship anarchy).

---

### 3.4 Phase Angle & Interpersonal Dynamic Torque $\boldsymbol{\tau}(A, B)$

**Conceptual Meaning:** In asymmetric or non-equilibrium dyads, one person's movement induces rotational drift in the other. This measures the *chirality* (handedness) of relational momentum.

**Mathematical Formulation:**  
Represented via the wedge product (exterior algebra) or skew-symmetric tensor contraction:

$$\boldsymbol{\tau}_t(A, B) = \mathbf{u}_{A,t} \wedge \mathbf{u}_{B,t} = \mathbf{u}_{A,t} \mathbf{u}_{B,t}^T - \mathbf{u}_{B,t} \mathbf{u}_{A,t}^T$$

The scalar magnitude of dynamic torque in 2D projection:

$$\tau_t = u_{A,1} u_{B,2} - u_{A,2} u_{B,1}$$

- If $\tau > 0$: Agent A exerts clockwise entrainment over Agent B.
- If $\tau < 0$: Agent B exerts counter-clockwise entrainment over Agent A.
- If $\tau = 0$: Dyad is in static colinear balance (no rotational drift).

---

### 3.5 Information-Theoretic Jensen-Shannon Divergence $\mathcal{JSD}(A \parallel B)$

**Conceptual Meaning:** Treats normalized multi-pole allocations as probability mass distributions $\mathbf{p}_A, \mathbf{p}_B \in \Delta^{n-1}$.

$$\mathcal{M} = \frac{1}{2}(\mathbf{p}_A + \mathbf{p}_B)$$

$$\mathcal{JSD}(\mathbf{p}_A \parallel \mathbf{p}_B) = \frac{1}{2} D_{\text{KL}}(\mathbf{p}_A \parallel \mathcal{M}) + \frac{1}{2} D_{\text{KL}}(\mathbf{p}_B \parallel \mathcal{M})$$

Where $D_{\text{KL}}(\mathbf{p} \parallel \mathbf{q}) = \sum_i p_i \ln\left(\frac{p_i}{q_i}\right)$.

- **Properties:** Bounded in $[0, \ln 2]$, symmetric, and its square root $\sqrt{\mathcal{JSD}}$ is a true metric obeying the triangle inequality.
- **Application:** Rigorous clustering of profiles into cultural or erotic tribes.

---

## 4. Summary Matrix of 2-Profile Contractions

| Contraction Metric | Tensor Operation | Symmetry | Relational Meaning |
| :--- | :--- | :--- | :--- |
| **Straight Match** | $\frac{\mathbf{u}_A \cdot \mathbf{u}_B}{\|\mathbf{u}_A\| \|\mathbf{u}_B\|}$ | Symmetric | Shared worldview / resonance |
| **Cross Match** | $\mathbf{u}_A^T \mathbf{C} \mathbf{u}_B$ | Bilinear / Configurable | Complementary role fulfillment |
| **Blind-Spot Index** | $1 - \frac{|\mathbf{u}_A \cdot \mathbf{u}_B|}{\|\mathbf{u}_A\| \|\mathbf{u}_B\|}$ | Symmetric | Total mutual indifference / silence |
| **Enclosure Index** | $\frac{\sum \min(u_A, u_B)}{\sum u_A}$ | **Asymmetric** | Subsumption / capacity dominance |
| **Friction Gradient** | $\mathbf{u}_A^T \mathbf{D} \mathbf{u}_B$ | Symmetric / Antagonistic | Destructive collision & boundary clash |
| **Dynamic Torque** | $\mathbf{u}_A \wedge \mathbf{u}_B$ | **Anti-symmetric** ($\tau_{AB} = -\tau_{BA}$) | Directional entrainment & drift |
| **Jensen-Shannon** | $\mathcal{JSD}(\mathbf{p}_A \parallel \mathbf{p}_B)$ | Metric Symmetric | Information distance between distributions |
