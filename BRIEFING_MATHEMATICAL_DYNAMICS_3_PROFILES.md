# Mathematical Dynamics of Three Profiles in Taxopolemics
*Rank-3 Tensor Contractions, Triadic Synergies & Emergent 3-Body Mechanics*

**Engine:** Taxopolemics  
**Document:** Mathematical Specification Briefing for Autonomous Agents, Network Theorists & Polycule Modelers  
**Author:** Antigravity (AI Assistant) & Principal Investigator Jason Mark Wrinkle  
**Status:** Canonical Mathematical Specification  

---

## 1. Abstract & The Triadic Threshold

In network sociology (Simmel, 1902), group dynamics undergo an irreversible qualitative leap when transitioning from a dyad (2 agents) to a triad (3 agents). A dyad is fragile: if one party withdraws, the relationship ceases to exist. A triad introduces **structural mediation**, **coalition formation**, **cyclic closure**, and **non-pairwise emergent interactions**.

In mathematical physics and quantum information, tripartite systems exhibit genuine 3-way entanglement (such as GHZ states) that cannot be factored into products of 2-body density matrices.

Similarly, within the **Taxopolemics** engine, **three-profile dynamics cannot be reduced to the sum of three pairwise contractions**:

$$\Phi(A, B, C) \neq \Phi(A, B) + \Phi(B, C) + \Phi(C, A)$$

This briefing establishes the formal mathematics of genuine 3-profile contractions and relational tensors.

---

## 2. Mathematical Formalism: Rank-3 Tensor Contractions

Let three agents have profile vectors $\mathbf{u}_A, \mathbf{u}_B, \mathbf{u}_C \in \mathcal{V}$. For any given topic $t$ with $n$ poles, their joint triadic interaction is governed by a **Rank-3 Hyper-Tensor** $\mathbf{\Gamma}_t \in \mathbb{R}^{n \times n \times n}$:

$$\mathcal{T}_t(A, B, C) = \sum_{i=1}^n \sum_{j=1}^n \sum_{k=1}^n \Gamma_{t,ijk} \, u_{A,i} \, u_{B,j} \, u_{C,k}$$

```
                          u_C (Agent C)
                              ▲
                             /
                            /
                           /
          u_A (Agent A) ───┼───► Γ_ijk (Interaction Hyper-Tensor)
                          /
                         /
                        ▼
                   u_B (Agent B)
```

### 2.1 Symmetry Classes of $\mathbf{\Gamma}_{t,ijk}$

The algebraic properties of $\mathbf{\Gamma}$ govern the qualitative nature of the tripartite dynamic:

1. **Fully Symmetric Tensor ($\Gamma_{ijk} = \Gamma_{\sigma(i)\sigma(j)\sigma(k)}$ for all permutations $\sigma \in S_3$):**
   - **Triadic Synergy / Collective Resonance**: The interaction depends purely on the joint presence of all three agents, invariant to who plays which role.
   - Example: Collective intellectual breakthrough, group ecstatic trance, harmonious 3-party civic coalition.

2. **Alternating / Skew-Symmetric Tensor ($\Gamma_{ijk} = \text{sgn}(\sigma) \Gamma_{\sigma(i)\sigma(j)\sigma(k)}$):**
   - **Cyclic Dominance / Relational Vorticity**: Non-transitive hierarchies (e.g. Rock-Paper-Scissors dynamics).
   - $\Gamma_{123} = +1, \Gamma_{213} = -1$.
   - Example: Intimate cyclic polycules where A commands B, B commands C, and C commands A.

3. **Partially Symmetric / Keystone Tensor ($\Gamma_{ijk} = \Gamma_{jik} \neq \Gamma_{ikj}$):**
   - Agents A and B are exchangeable peers, while Agent C acts as a distinct **catalytic mediator** or apex anchor.

---

## 3. Four Canonical 3-Profile Dynamics

```
                           [ 3-PROFILE DYNAMICS ]
                                      │
     ┌──────────────────┬─────────────┴─────────────┬──────────────────┐
     │                  │                           │                  │
[KEYSTONE INDEX]  [CYCLIC VORTICITY]          [TRIADIC VOLUME]   [EXCLUSION GRADIENT]
  Mediation/Glue    Non-Transitive Flow        Common Ground       Odd-One-Out
```

---

### 3.1 The Keystone / Mediator Index $\mathcal{K}(C \mid A, B)$

**Conceptual Meaning:** "Is Person C the indispensable bridge holding Persons A and B together?"

In many triads (polycules, diplomatic summits, corporate leadership troikas), two agents $A$ and $B$ have low direct compatibility or severe ideological opposition. Person $C$ shares high affinity with both, stabilizing the system. If $C$ is removed, the dyad $(A, B)$ instantly fractures.

**Mathematical Formulation:**

$$\mathcal{K}_t(C \mid A, B) = S_t(A, C) \cdot S_t(C, B) \cdot \left[ 1 - S_t(A, B) \right] \cdot \left( \frac{\|\mathbf{u}_{C,t}\|_1}{100} \right)$$

Where $S_t(\cdot, \cdot)$ is the Straight Match resonance score in $[0, 1]$.

- When $S(A, B) = 0$ (A and B cannot communicate) while $S(A, C) = 1$ and $S(C, B) = 1$:
  $$\mathcal{K}(C \mid A, B) = 1.0 \quad \text{(Maximum Keystone Criticality)}$$
- When $S(A, B) = 1$ (A and B already agree on everything):
  $$\mathcal{K}(C \mid A, B) = 0.0 \quad \text{(Person C is structurally redundant)}$$

**Application:** Identifies the single point of failure in polycules and diplomatic coalitions.

---

### 3.2 Cyclic Triad Closure & Structural Balance $\mathcal{W}(A \to B \to C \to A)$

**Conceptual Meaning:** "Does energy flow cyclically and stably around the loop without dissipating?"

In Heider's Structural Balance Theory, triads seek psychological balance (the product of relationship signs $\prod s_{ij} > 0$). In continuous Taxopolemics state space, we compute the **line integral of relational force** around the closed loop:

$$\mathcal{W}(A, B, C) = \oint_{\Delta} \mathbf{F} \cdot d\mathbf{r} = K(A, B) \cdot K(B, C) \cdot K(C, A)$$

Where $K(X, Y)$ is the Cross-Match complementary coupling between consecutive agents.

#### Chirality & Vorticity Vector:
The directed rotational curl around the triad in pole space is given by:

$$\boldsymbol{\Omega} = \mathbf{u}_A \times \mathbf{u}_B + \mathbf{u}_B \times \mathbf{u}_C + \mathbf{u}_C \times \mathbf{u}_A$$

- **$\|\boldsymbol{\Omega}\| > 0$**: High rotational momentum. The triad functions as a continuous self-regenerating engine of desire or dialectic (e.g. Sensation $\to$ Power $\to$ Intimacy loop).
- **$\|\boldsymbol{\Omega}\| \approx 0$**: Static balance or opposing friction that locks the triad in immobility.

---

### 3.3 Geometric Convex Hull Dispersion & Common Ground Core

When three profiles interact, two geometric volumes characterize their group cohesion:

```
                  u_A
                  ▲
                 / \
                /   \
               /  *  \  ◄── Conv(u_A, u_B, u_C): Total Collective Repertoire
              / u_core\
             ▼─────────▼
           u_B         u_C
```

#### 3.3.1 The Common Ground Core $\mathbf{u}_{\text{core}}$:
The point-wise infimum of all three agents across every pole:

$$u_{\text{core}, t, k} = \min\left( u_{A,t,k}, \, u_{B,t,k}, \, u_{C,t,k} \right)$$

$$\text{Core Volume} = \sum_{t \in \mathcal{T}} \|\mathbf{u}_{\text{core}, t}\|_1$$

- **Meaning:** The safe, unanimous activity space where all three agents participate with zero compromise.

#### 3.3.2 The Repertoire Convex Hull $\mathcal{V}_{\text{hull}}$:
The geometric volume spanned by the convex hull $\text{Conv}(\mathbf{u}_A, \mathbf{u}_B, \mathbf{u}_C)$ in $\mathbb{R}^n$:

$$\text{Repertoire Area}_t = \frac{1}{2} \left\| (\mathbf{u}_B - \mathbf{u}_A) \times (\mathbf{u}_C - \mathbf{u}_A) \right\|$$

- **Meaning:** The total breadth of experience accessible to the group. A high repertoire with a healthy core represents the ideal high-performing polycule or multidisciplinary research committee.

---

### 3.4 The Odd-One-Out / Triadic Exclusion Gradient $\Xi(C \mid A, B)$

**Conceptual Meaning:** "Are two members forming an exclusive dyad that structurally isolates the third?"

In human groups, jealousy, feeling sidelined, or epistemic alienation occurs when the internal distance between two members is drastically smaller than their distance to the third.

**Mathematical Formulation:**  
Let $d(X, Y) = \|\mathbf{u}_X - \mathbf{u}_Y\|_2$ be the Euclidean distance in state space.

$$\Xi(C \mid A, B) = \frac{d(A, C) + d(B, C)}{2 \cdot d(A, B) + \epsilon}$$

- **$\Xi(C) \gg 1.0$**: **Severe Exclusion**. $A$ and $B$ are tightly clustered together ($d(A, B)$ is small), while $C$ is distant. $C$ is effectively an alienated outsider.
- **$\Xi(C) \approx 1.0$**: **Equilateral Triad**. All three members are equidistant from each other ($d(AB) \approx d(BC) \approx d(CA)$). Maximum egalitarian balance.
- **$\Xi(C) \ll 1.0$**: $C$ sits directly in between $A$ and $B$, acting as the central nexus.

---

## 4. Summary Matrix of 3-Profile Dynamics

| Metric | Mathematical Form | Domain | Diagnostic Function |
| :--- | :--- | :--- | :--- |
| **Trilinear Synergy** | $\sum \Gamma_{ijk} u_{Ai} u_{Bj} u_{Ck}$ | Tripartite Tensor | Emergent 3-way collective resonance |
| **Keystone Index** | $S(AC) S(CB) [1 - S(AB)]$ | $[0, 1]$ | Indispensability of Agent C as mediator |
| **Cyclic Vorticity** | $\oint_{\Delta} K \cdot dr$ | Directed Cycle | Rotational momentum & non-transitive flow |
| **Common Ground Core** | $\min(u_A, u_B, u_C)$ | Vector Space | Unanimous zero-friction overlap zone |
| **Hull Repertoire** | $\frac{1}{2} \|(u_B - u_A) \times (u_C - u_A)\|$ | Volume Measure | Total collective diversity of the triad |
| **Exclusion Gradient** | $\frac{d(AC) + d(BC)}{2 d(AB)}$ | Ratio $[0, \infty)$ | Risk of third-party alienation / odd-one-out |
