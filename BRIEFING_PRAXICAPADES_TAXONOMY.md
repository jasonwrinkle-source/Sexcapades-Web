# Praxicapades: Applied Mathematics Taxonomy
*Taxopolemics Engine Specification Briefing for Autonomous Agents & Applied Modelers*

**Engine:** Taxopolemics (Multi-Pole Dialectical Hypermap Engine)  
**Skin:** Praxicapades (Applied Mathematics)  
**Author:** YoBiche (Yolanda Biche) & Antigravity (AI Assistant) & Principal Investigator Jason Mark Wrinkle  
**Status:** Draft — Synthesized from YoBiche's Modelcapades and Gemini's Dynamicapades, awaiting the Principal Investigator's feedback. Not canonical.  

---

## 1. Abstract & Scope

**Praxicapades** maps human positions on applied mathematics — how you model the world, how you compute, what you value in applied work, where you apply it, how you handle uncertainty, and how you live as an applied mathematician. In traditional surveys, applied math is collapsed into crude single-axis binaries (e.g. Theory vs. Practice) or reduced to a list of applications.

Under the **Taxopolemics** engine, applied-mathematical positions are mapped to their natural geometric degrees of freedom: from **1-Pole scalars** (absolute affinity), to **2-Pole dialectical dipoles** (Deterministic vs. Stochastic; Analytic vs. Numerical), to higher-order **Triads (3-Pole $\Delta^2$)**, **Tetrads (4-Pole $\Delta^3$)**, **Pentads (5-Pole $\Delta^4$)**, **Hexads (6-Pole $\Delta^5$)**, **Heptads (7-Pole $\Delta^6$)**, and **Octads (8-Pole $\Delta^7$)**.

**Engine cap:** the engine goes to **8 poles and caps there** — monopole through octad. The cap is a human limit, not a technical one: people cannot hold more than about eight positions in mind at once (Jason, 2026-11-14).

**Scope note:** Praxicapades is the applied math skin, paired with Theoricapades (pure & theoretical mathematics) — the two are different cultures with different values, and a single skin would dilute both. The pure/applied divide is itself a topic in this skin (3.2). Praxicapades brushes Techcapades (computation, data, AI) and Vocapades (engineering careers, industry vs academia); this skin goes deeper into the specifically mathematical positions — how you model, how you solve, how you handle uncertainty. The audience is narrower than the other skins — applied mathematicians, engineers, data scientists, and math-adjacent people — but the positions are real and passionate, and for collaborators they determine whether you can work together.

**Name note:** The name is **Praxicapades** — from Greek *praxis* (purposeful action, practical application). It is Jason's pick, forming the classical *theoria* / *praxis* pair with Theoricapades (contemplation vs. action, theory vs. practice). It supersedes **Modelcapades** (YoBiche's, tentative — "model" suffers from acute linguistic ambiguity outside the mathematical sciences: fashion runway models, 3D CGI assets, database schemas, ML checkpoints) and **Dynamicapades** (Gemini's flagship recommendation, from Greek *dynamis*, power/force/change — vibrant and kinetic, but Praxicapades is the stronger philosophical twin). Gemini herself proposed Praxicapades as the strongest philosophical twin to Theoricapades in her Dynamicapades briefing.

---

## 2. Taxonomic Architecture & Rating Widget Assignments

### Category 1: The Art of Modeling

#### 1.1 Levins' Grand Model Trilemma (3-Pole Triad $\Delta^2$)
*Richard Levins' canonical 1966 formulation: No mathematical model can simultaneously maximize all three virtues.*
- **Poles:**
  - `Pole 0 (Apex - Green #22c55e)`: **Generality** — The model captures the universal behavior of an entire class of systems (e.g. Lotka-Volterra, Kuramoto oscillators, Ising model). It sacrifices bespoke empirical precision for broad explanatory power.
  - `Pole 1 (Base Right - Blue #3b82f6)`: **Realism** — The model faithfully incorporates every known physical, chemical, or biological mechanism. It sacrifices simplicity and analytical tractability for structural fidelity.
  - `Pole 2 (Base Left - Amber #f59e0b)`: **Precision** — The model is calibrated to achieve exact quantitative numerical fit to specific experimental time-series. It sacrifices generalizability for localized predictive accuracy.
- **Question:** Which vertex of the modeling trilemma do you prioritize when building a model?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget (`"triangle"`).

- **Hovertip:** **Levins' Grand Model Trilemma** [TRIANGLE]
  - Issue: Which vertex of the modeling trilemma do you prioritize when building a model?
  - Generality — Captures universal behavior of a whole class of systems; sacrifices precision.
  - Realism — Faithfully incorporates every known mechanism; sacrifices simplicity.
  - Precision — Exact quantitative fit to specific data; sacrifices generalizability.

#### 1.2 Deterministic vs Stochastic (2-Pole Dipole)
- **Poles:** Deterministic (the world is predictable; given the inputs, the outputs follow) ↔ Stochastic (the world is random; you model distributions, not certainties)
- **Question:** Is the world predictable or random?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Deterministic vs Stochastic**
  - Issue: Is the world predictable or random?
  - Deterministic — Given the inputs, the outputs follow.
  - Stochastic — You model distributions, not certainties.

#### 1.3 Continuous vs Discrete Models (2-Pole Dipole)
- **Poles:** Continuous (differential equations, flows, fields) ↔ Discrete (difference equations, networks, agents)
- **Question:** Do you model with continuous flows or discrete systems?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Continuous vs Discrete Models**
  - Issue: Do you model with continuous flows or discrete systems?
  - Continuous — Differential equations, flows, fields.
  - Discrete — Difference equations, networks, agents.

#### 1.4 Modeling Philosophy: First-Principles Physics vs. Data-Driven Empirical Surrogates (2-Pole Dipole)
- **Poles:** **Deductive First Principles** (Conservation of mass, momentum, energy; physical conservation laws; white-box equations) ↔ **Inductive Data-Driven Surrogates** (Physics-informed neural networks, Fourier neural operators, polynomial chaos expansions, black-box empirical fits)
- **Question:** Should models be derived from conservation laws or learned from data?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Modeling Philosophy: First-Principles Physics vs. Data-Driven Empirical Surrogates**
  - Issue: Should models be derived from conservation laws or learned from data?
  - Deductive First Principles — Conservation laws; white-box equations.
  - Inductive Data-Driven Surrogates — Neural networks, empirical fits; black-box.

#### 1.5 Linearity Stance: Linearized Tractability vs. Nonlinear Realism (2-Pole Dipole)
- **Poles:** **Linear Approximations** (Superposition, eigenvalue spectra, Fourier modes, closed-form perturbation expansions) ↔ **Nonlinear Reality** (Bifurcations, strange attractors, solitons, chaos, limit cycles)
- **Question:** Do you trust linear approximations or insist on full nonlinear dynamics?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Linearity Stance: Linearized Tractability vs. Nonlinear Realism**
  - Issue: Do you trust linear approximations or insist on full nonlinear dynamics?
  - Linear Approximations — Superposition, eigenvalue spectra, closed-form perturbation.
  - Nonlinear Reality — Bifurcations, strange attractors, solitons, chaos.

### Category 2: Computation & Method

#### 2.1 The Computational Architecture Quartet (4-Pole Tetrad $\Delta^3$)
*The four dominant algorithmic paradigms for simulating continuous reality.*
- **Poles:**
  - `North (#3b82f6 - Blue)`: **Grid & Mesh PDE Solvers** — Finite Element Method (FEM), Finite Volume Method (FVM), adaptive mesh refinement, spectral methods.
  - `East (#10b981 - Green)`: **Particle & Monte Carlo Methods** — Molecular dynamics, Smoothed Particle Hydrodynamics (SPH), Markov Chain Monte Carlo, direct stochastic simulation.
  - `South (#ef4444 - Red)`: **Discrete Networks & Agent Simulators** — Complex network graphs, kinetic Monte Carlo, agent-based multi-scale frameworks.
  - `West (#8b5cf6 - Purple)`: **Neural Operators & AI Surrogates** — DeepONets, Fourier Neural Operators (FNO), transformer-based PDE emulators.
- **Question:** Which computational architecture is your native weapon?
- **Optimal Widget:** Orthogonal Diamond Deformation Polygon (`"diamond"`).

- **Hovertip:** **The Computational Architecture Quartet** [TETRAD — simplex]
  - Issue: Which computational architecture is your native weapon?
  - Grid & Mesh PDE Solvers — FEM, FVM, adaptive mesh refinement, spectral methods.
  - Particle & Monte Carlo Methods — Molecular dynamics, SPH, MCMC, stochastic simulation.
  - Discrete Networks & Agent Simulators — Complex networks, kinetic Monte Carlo, agent-based frameworks.
  - Neural Operators & AI Surrogates — DeepONets, Fourier Neural Operators, PDE emulators.

#### 2.2 Analytic vs Numerical (2-Pole Dipole)
- **Poles:** Analytic (solve exactly; closed form, pen and paper) ↔ Numerical (approximate; algorithms, computers, floating point)
- **Question:** Do you solve exactly or approximate?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Analytic vs Numerical**
  - Issue: Do you solve exactly or approximate?
  - Analytic — Solve exactly; closed form, pen and paper.
  - Numerical — Approximate; algorithms, computers, floating point.

#### 2.3 Simulation vs Theory (2-Pole Dipole)
- **Poles:** Simulation (run it and see; Monte Carlo, agent-based, computational experiments) ↔ Theory (prove it; the math tells you what happens)
- **Question:** Do you trust simulations or theory?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Simulation vs Theory**
  - Issue: Do you trust simulations or theory?
  - Simulation — Run it and see; computational experiments.
  - Theory — Prove it; the math tells you what happens.

#### 2.4 Optimization: Exact vs Heuristic (2-Pole Dipole)
- **Poles:** Exact (find the true optimum; global, guaranteed) ↔ Heuristic (find a good-enough solution; fast, practical, approximate)
- **Question:** Do you find the optimum or a good-enough answer?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Optimization: Exact vs Heuristic**
  - Issue: Do you find the optimum or a good-enough answer?
  - Exact — The true optimum; global, guaranteed.
  - Heuristic — Good-enough; fast, practical, approximate.

### Category 3: Domains & Arenas

#### 3.1 The Applied Domain Star (5-Pole Pentad $\Delta^4$)
*The five epic theaters of real-world applied mathematical investigation.*
- **Poles:**
  - `Pole 0 (Blue #3b82f6)`: **Physical Continua & Geophysical Fluids** — Navier-Stokes, atmospheric turbulence, geophysics, plasma fusion, celestial orbits, acoustics.
  - `Pole 1 (Emerald #10b981)`: **Biological, Ecological & Epidemic Dynamics** — Morphogenesis, SIR models, gene regulatory networks, neuroscience, ecological equilibria.
  - `Pole 2 (Amber #f59e0b)`: **Economic, Financial & Game Theoretic Flows** — Stochastic calculus, Black-Scholes, algorithmic auction theory, macro equilibria, systemic risk.
  - `Pole 3 (Orange #f97316)`: **Engineering, Control & Cybernetics** — Optimal control, Kalman filtering, robotics, model predictive control (MPC), signal processing.
  - `Pole 4 (Violet #8b5cf6)`: **Information, Tensors & Machine Intelligence** — Compressed sensing, low-rank tensor decomposition, graph algorithms, high-dimensional probability.
- **Question:** Which domain calls for your mathematical application?
- **Optimal Widget:** Pentad Radial Star Widget (`"star-radar"`).

- **Hovertip:** **The Applied Domain Star** [PENTAD — simplex]
  - Issue: Which domain calls for your mathematical application?
  - Physical Continua & Geophysical Fluids — Navier-Stokes, turbulence, geophysics, plasma.
  - Biological, Ecological & Epidemic Dynamics — Morphogenesis, SIR models, neuroscience.
  - Economic, Financial & Game Theoretic Flows — Stochastic calculus, Black-Scholes, systemic risk.
  - Engineering, Control & Cybernetics — Optimal control, Kalman filtering, robotics, MPC.
  - Information, Tensors & Machine Intelligence — Compressed sensing, tensor decomposition, graph algorithms.

#### 3.2 Pure vs Applied (2-Pole Dipole)
- **Poles:** Pure (math for its own sake) ↔ Applied (math for what it does)
- **Question:** The skin-defining divide — where do you stand, from the applied side?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Pure vs Applied**
  - Issue: The skin-defining divide — where do you stand, from the applied side?
  - Pure — Math for its own sake.
  - Applied — Math for what it does.

#### 3.3 Interdisciplinary vs Domain-Specific (2-Pole Dipole)
- **Poles:** Interdisciplinary (work across fields; borrow methods, cross boundaries) ↔ Domain-Specific (deep in one field; master its methods, its literature, its problems)
- **Question:** Do you work across fields or deep in one?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Interdisciplinary vs Domain-Specific**
  - Issue: Do you work across fields or deep in one?
  - Interdisciplinary — Borrow methods, cross boundaries.
  - Domain-Specific — Deep in one field; master its methods and literature.

### Category 4: Uncertainty & Data

#### 4.1 The Epistemic Uncertainty Quartet (4-Pole Tetrad $\Delta^3$)
*How applied mathematicians categorize what they do not know.*
- **Poles:**
  - `North (#3b82f6 - Blue)`: **Aleatoric Uncertainty** — Inherent, irreducible randomness in physical systems (thermal noise, quantum fluctuations, stochastic wind gusts).
  - `East (#10b981 - Green)`: **Epistemic Parameter Uncertainty** — Inexact measurement of physical coefficients (viscosity, friction, reaction rates); reducible with more sensors.
  - `South (#ef4444 - Red)`: **Structural Model Misspecification** — The equations themselves are wrong; unmodeled physics, invalid boundary assumptions, omitted variables.
  - `West (#8b5cf6 - Purple)`: **Knightian Ambiguity / Extreme Regimes** — Fat-tailed black swans, unknown regime shifts, unquantifiable existential surprises.
- **Question:** What is the primary source of uncertainty in your models?
- **Optimal Widget:** Orthogonal Diamond Deformation Polygon (`"diamond"`).

- **Hovertip:** **The Epistemic Uncertainty Quartet** [TETRAD — simplex]
  - Issue: What is the primary source of uncertainty in your models?
  - Aleatoric Uncertainty — Inherent, irreducible randomness (thermal noise, quantum fluctuations).
  - Epistemic Parameter Uncertainty — Inexact coefficients; reducible with more sensors.
  - Structural Model Misspecification — The equations themselves are wrong; unmodeled physics.
  - Knightian Ambiguity — Fat-tailed black swans, regime shifts, unquantifiable surprises.

#### 4.2 The Inverse Problem & Data Assimilation Spectrum (3-Pole Triad $\Delta^2$)
*The directionality of information flow between equations and observations.*
- **Poles:**
  - `Pole 0 (Apex - Teal #14b8a6)`: **Forward Simulation** — Given initial conditions and known equations, calculate the future state trajectory.
  - `Pole 1 (Base Right - Indigo #6366f1)`: **Real-Time Data Assimilation** — Continuous Bayesian updating; blending streaming noisy sensor data with the simulation trajectory (Kalman filters, 4D-Var).
  - `Pole 2 (Base Left - Rose #f43f5e)`: **Inverse Problem & Parameter Identification** — Inferring hidden internal physics or spatial source terms from sparse, noisy boundary measurements (regularized ill-posed problems).
- **Question:** Where does your work live on the simulation-inversion spectrum?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget (`"triangle"`).

- **Hovertip:** **The Inverse Problem & Data Assimilation Spectrum** [LINE]
  - Issue: Where does your work live on the simulation-inversion spectrum?
  - Forward Simulation — Given equations and initial conditions, calculate the future.
  - Real-Time Data Assimilation — Continuous Bayesian updating; blending sensor data with simulation.
  - Inverse Problem & Parameter Identification — Infer hidden physics from sparse, noisy measurements.

#### 4.3 Statistical Philosophy: Bayesian vs. Frequentist in Applied Modeling (2-Pole Dipole)
- **Poles:** **Bayesian Updating** (Priors, posterior distributions, MCMC, belief propagation; quantifying subjective parameter confidence) ↔ **Frequentist / Objective Likelihood** (Confidence intervals, hypothesis testing, asymptotic sampling distributions; objective physical frequencies)
- **Question:** How do you formulate probabilities in your models?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Statistical Philosophy: Bayesian vs. Frequentist in Applied Modeling**
  - Issue: How do you formulate probabilities in your models?
  - Bayesian Updating — Priors, posteriors, MCMC; quantifying subjective confidence.
  - Frequentist / Objective Likelihood — Confidence intervals, hypothesis testing, objective frequencies.

#### 4.4 Big Data vs Small Data (2-Pole Dipole)
- **Poles:** Big Data (more data; let the data speak; machine learning, scale) ↔ Small Data (better models; careful design; insight over volume)
- **Question:** More data or better models?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Big Data vs Small Data**
  - Issue: More data or better models?
  - Big Data — More data; let the data speak; machine learning, scale.
  - Small Data — Better models; careful design; insight over volume.

### Category 5: Rigor & Validation

#### 5.1 Rigorous Proof vs. Pragmatic Utility (2-Pole Dipole)
*The defining cultural battle inside applied mathematics departments.*
- **Poles:** **Pure Rigor (Analysis of PDEs)** (Applied math requires rigorous proof: Sobolev spaces, existence, uniqueness, regularity, well-posedness) ↔ **Pragmatic Engineering Utility** ("If the plane flies, the simulation converges, and the bridge stands, the model is valid; proofs are a luxury")
- **Question:** Does applied math require rigorous mathematical proofs or working solutions?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Rigorous Proof vs. Pragmatic Utility**
  - Issue: Does applied math require rigorous proofs or working solutions?
  - Pure Rigor — Sobolev spaces, existence, uniqueness, well-posedness.
  - Pragmatic Engineering Utility — If the plane flies and the bridge stands, the model is valid.

#### 5.2 Elegance vs Effectiveness (2-Pole Dipole)
- **Poles:** Elegance (a beautiful model; clean, spare, insightful) ↔ Effectiveness (an effective model; it predicts, it controls, it delivers)
- **Question:** Do you value a beautiful model or an effective one?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Elegance vs Effectiveness**
  - Issue: Do you value a beautiful model or an effective one?
  - Elegance — A beautiful model; clean, spare, insightful.
  - Effectiveness — An effective model; it predicts, it controls, it delivers.

#### 5.3 General vs Specific (2-Pole Dipole)
- **Poles:** General (a theory that covers many problems; reusable, abstract) ↔ Specific (a solution tailored to one problem; bespoke, concrete)
- **Question:** Do you build general theories or problem-specific solutions?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **General vs Specific**
  - Issue: Do you build general theories or problem-specific solutions?
  - General — A theory covering many problems; reusable, abstract.
  - Specific — A solution tailored to one problem; bespoke, concrete.

#### 5.4 Model Complexity: Occam's Parsimony vs. Multi-Physics Maximalism (2-Pole Dipole)
- **Poles:** **Occam's Minimalist Toy Model** (A 2-variable ODE that reveals the essential qualitative bifurcation mechanism; minimal assumptions) ↔ **Multi-Physics High-Fidelity Ensemble** (A 50-million variable coupled simulation incorporating chemistry, thermal transfer, and mechanics)
- **Question:** Do you prefer illuminating toy models or high-fidelity simulation ensembles?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Model Complexity: Occam's Parsimony vs. Multi-Physics Maximalism**
  - Issue: Do you prefer illuminating toy models or high-fidelity simulation ensembles?
  - Occam's Minimalist Toy Model — A 2-variable ODE revealing the essential mechanism.
  - Multi-Physics High-Fidelity Ensemble — A 50-million variable coupled simulation.

#### 5.5 Goal: Mechanistic Explanation vs. Predictive Accuracy (2-Pole Dipole)
- **Poles:** **Mechanistic Understanding** (Explain *why* the phenomenon occurs; uncover causality, feedback loops, and structural dynamics) ↔ **Predictive Supremacy** (Accurately forecast what will happen next; the mechanism matters less than minimizing mean squared error)
- **Question:** Do you model to understand mechanisms or to forecast outcomes?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Goal: Mechanistic Explanation vs. Predictive Accuracy**
  - Issue: Do you model to understand mechanisms or to forecast outcomes?
  - Mechanistic Understanding — Explain why; uncover causality and feedback loops.
  - Predictive Supremacy — Forecast what happens next; minimize error.

### Category 6: The Applied Life

#### 6.1 Habitat: Industrial Supercomputing vs. Academic Freedom (2-Pole Dipole)
- **Poles:** **Industry, National Labs & Tech Giants** (Massive compute clusters, real-world mission deadlines, proprietary data, concrete societal impact) ↔ **University Academia** (Curiosity-driven research, teaching, open publishing, NSF grants, academic prestige)
- **Question:** Where do you deploy your applied mathematics?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Habitat: Industrial Supercomputing vs. Academic Freedom**
  - Issue: Where do you deploy your applied mathematics?
  - Industry, National Labs & Tech Giants — Massive compute, real deadlines, concrete impact.
  - University Academia — Curiosity-driven research, teaching, open publishing.

#### 6.2 Collaboration vs Solitude (2-Pole Dipole)
- **Poles:** Collaboration (work with domain experts; the team solves it) ↔ Solitude (work alone; the math is yours)
- **Question:** Do you work with domain experts or alone?
- **Optimal Widget:** Dipole slider.

- **Hovertip:** **Collaboration vs Solitude**
  - Issue: Do you work with domain experts or alone?
  - Collaboration — Work with domain experts; the team solves it.
  - Solitude — Work alone; the math is yours.

#### 6.3 The Computational Craft: Low-Level Performance vs. Rapid Prototyping (2-Pole Dipole)
- **Poles:** **High-Performance Systems Craft** (C++, Fortran, Rust, CUDA kernels, memory alignment, MPI parallel clusters) ↔ **Rapid High-Level Prototyping** (Python, Julia, MATLAB, NumPy, interactive Jupyter notebooks)
- **Question:** How do you write your numerical code?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **The Computational Craft: Low-Level Performance vs. Rapid Prototyping**
  - Issue: How do you write your numerical code?
  - High-Performance Systems Craft — C++, Fortran, CUDA, MPI clusters.
  - Rapid High-Level Prototyping — Python, Julia, MATLAB, Jupyter notebooks.

#### 6.4 Interdisciplinary Role: Domain Bridge-Builder vs. Methodological Core (2-Pole Dipole)
- **Poles:** **The Interdisciplinary Bridge** (Immersed in biology, climate, or finance; learning domain jargon, translating domain questions into math) ↔ **Methodological Core** (Staying purely in applied math; inventing general algorithms, numerical schemes, and solvers for others to apply)
- **Question:** Are you an interdisciplinary bridge or a pure algorithm specialist?
- **Optimal Widget:** Dipole Slider.

- **Hovertip:** **Interdisciplinary Role: Domain Bridge-Builder vs. Methodological Core**
  - Issue: Are you an interdisciplinary bridge or a pure algorithm specialist?
  - The Interdisciplinary Bridge — Immersed in a domain; translating questions into math.
  - Methodological Core — Inventing general algorithms and solvers for others to apply.

#### 6.5 Impact vs Publication (2-Pole Dipole)
- **Poles:** Impact (real-world change; the model ships, the system improves) ↔ Publication (academic papers; the literature, the citations, the record)
- **Question:** Do you value real-world impact or academic publication?
- **Optimal Widget:** Dipole slider.

---

- **Hovertip:** **Impact vs Publication**
  - Issue: Do you value real-world impact or academic publication?
  - Impact — Real-world change; the model ships, the system improves.
  - Publication — Academic papers; the literature, the citations, the record.

## 3. Pole-Count Summary

| Poles | Count | Topics |
|-------|-------|--------|
| 1-pole (monopole) | 0 | — |
| 2-pole (dipole) | 21 | 1.2, 1.3, 1.4, 1.5, 2.2, 2.3, 2.4, 3.2, 3.3, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5 |
| 3-pole (triad) | 2 | 1.1, 4.2 |
| 4-pole (tetrad) | 2 | 2.1, 4.1 |
| 5-pole (pentad) | 1 | 3.1 |
| 6-pole (hexad) | 0 | — |
| 7-pole (heptad) | 0 | — |
| 8-pole (octad) | 0 | — |

**Total: 6 categories, 26 topics.**

## 4. Higher-Pole Candidates (not yet specified)

- **The Modeling Spectrum** (pentad, from Modelcapades): Deterministic / Stochastic / Chaotic / Quantum / Agent-Based. The ways the world can behave, as a multi-pole topic. Needs a ruling on whether world-behavior is a position or just a fact.
- **Statistical Paradigms** (tetrad, from Modelcapades): Bayesian / Frequentist / Likelihoodist / Fiducial. The philosophies of statistics, as a multi-pole topic. Needs a ruling on whether these are positions or just methods.
- **Famous Applied Problems** (octad, from Modelcapades): Navier-Stokes / Turbulence / Climate Modeling / Protein Folding / Fusion / Cryptography / Traffic Flow / Epidemic Control. The great applied challenges, as an 8-pole topic (which ones do you care about?). Needs a ruling on whether problems are positions or just interests.
- **The Grand Applied Challenges** (octad, from Dynamicapades): Turbulence Closure (Navier-Stokes), Fusion Plasma Stability (Tokamak), Climate Feedback Sensitivity, Protein Folding Kinetics, Quantum Decoherence Modeling, Algorithmic Market Crash Contagion, Epidemic Herd Immunity Thresholds, Brain Connectome Dynamics.
  - Question: Which grand challenge problem commands your deepest intellectual dedication?
- **Six Classical Solver Families** (hexad, from Dynamicapades): Runge-Kutta / ODE Steppers, Krylov Subspace Methods (GMRES/CG), Fast Fourier Transforms (FFT), Fast Multipole Methods (FMM), Simplex / Interior-Point Optimization, Monte Carlo Importance Sampling.

## 5. Open Questions for the Principal Investigator

1. Is the scope right — applied math as one skin, with pure as a separate skin (Theoricapades)?
2. Does 3.1 (Domain Star) stay a pentad, or should more domains join (hexad)?
3. Are the dipole assignments right, or do any of these want a different pole count?
4. Do the higher-pole candidates belong, or are they a different kind of thing?
