# Simulcapades: Computational Physics Taxonomy
*Taxopolemics Engine Specification Briefing for Autonomous Agents & Computational Physicists*

**Engine:** Taxopolemics (Multi-Pole Dialectical Hypermap Engine)  
**Skin:** Simulcapades (Computational Physics)  
**Author:** Antigravity (AI Assistant) & Principal Investigator Jason Mark Wrinkle  
**Status:** Draft, independent specification, prepared for synthesis with YoBiche's proposals.  

---

## 1. Abstract & Scope

**Simulcapades** maps human positions on computational physics — the recognized "third pillar" of modern science standing between analytic theory and laboratory experiment. When differential equations cannot be solved in closed form and physical regimes are too extreme, too microscopic, or too vast to measure directly, the computer becomes a virtual laboratory.

In general tech discourse, scientific simulation is frequently confused with ordinary software development or cloud computing. In computational physics, however, code is an epistemic instrument designed to obey fundamental conservation laws, maintain symplectic phase space geometries, and resolve non-linear physics across orders of magnitude in length and time:
- Its core currency is the **physically verified, convergent simulation trajectory**.
- Its central conflicts revolve around **fidelity vs. speed, ab initio first principles vs. empirical surrogate potentials, numerical method selection, and the philosophical problem of simulation trust**.

**Scope boundaries:**
- *Simulcapades* is about computational physics algorithms, simulation trust, and physical modeling.
- It brushes *Techcapades* on high-performance computing (HPC) and hardware architectures, but focuses strictly on physics simulations rather than consumer software, cloud services, or corporate IT.
- It is distinct from *Quantacapades* (pen-and-paper theory) and *Expericapades* (laboratory hardware and real-world detectors).

---

## 2. Taxonomic Architecture & Rating Widget Assignments

### Category 1: The Epistemology of Simulation & Scientific Trust

#### 1.1 The Epistemic Status of Simulation (3-Pole Triad $\Delta^2$)
*What is a computer simulation in the philosophy of science?*
- **Poles:**
  - `Pole 0 (Apex - Blue #3b82f6)`: **Virtual Experiment** — A simulation is a synthetic laboratory; you set up the physical environment, run the code, and observe emergent data like an experimentalist.
  - `Pole 1 (Base Right - Green #22c55e)`: **Extended Theory / Numerical Calculation** — A simulation is simply an automated numerical evaluator of existing analytic theory; it contains no new physics beyond the input equations.
  - `Pole 2 (Base Left - Purple #8b5cf6)`: **Autonomous Epistemic Instrument** — Simulation is an entirely distinct third mode of knowledge creation that accesses complex, multi-scale emergent phenomena unreachable by either pure mathematics or laboratory instruments.
- **Question:** What is the philosophical status of a physics simulation?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget (`"triangle"`).

#### 1.2 Fidelity vs. Speed: The Central Simulation Dilemma (2-Pole Dipole)
- **Poles:** **Maximum Physical Fidelity** (Double/quad precision, all electron shells, full quantum electrodynamics, zero empirical fudge factors; willing to wait 6 months on a supercomputer) ↔ **High-Throughput Speed & Scalability** (Coarse-grained approximations, GPU parallelism, real-time interactive parameter exploration; "good enough" physics at 100x the speed)
- **Question:** Do you prioritize uncompromising physical fidelity or high-throughput computational speed?
- **Optimal Widget:** Dipole Slider.

#### 1.3 Validation: Comparison to Physical Experiment vs. Mathematical Verification (2-Pole Dipole)
- **Poles:** **Empirical Validation First** (A simulation is meaningless unless its output curves match physical laboratory measurements within experimental error bars) ↔ **Internal Code Verification First** (The supreme test is mathematical: proving grid convergence, asymptotic order of accuracy, and exact conservation of energy, momentum, and symplectic structure)
- **Question:** Is a simulation validated by matching lab data or by mathematical convergence?
- **Optimal Widget:** Dipole Slider.

#### 1.4 The Simulation Trust Paradox: "Nobody Believes the Simulation" (2-Pole Dipole)
*Reflecting the famous lab proverb: "Everyone believes the experiment except the experimentalist; nobody believes the simulation except the simulator."*
- **Poles:** **Bold Simulation Confidence** (Trust the computational output as ground truth; modern simulations are often cleaner and less prone to systematic errors than real-world noise) ↔ **Permanent Self-Skepticism** (Never trust a simulation fully; discretization errors, floating-point roundoff, and unmodeled boundary artifacts are always lurking)
- **Question:** How much inherent trust do you place in simulation results?
- **Optimal Widget:** Dipole Slider.

---

### Category 2: Core Computational Physics Methods

#### 2.1 The Computational Physics Methods Quartet (4-Pole Tetrad $\Delta^3$)
*The four dominant algorithmic paradigms for simulating physical matter and fields.*
- **Poles:**
  - `North (Blue #3b82f6)`: **Electronic Structure & Ab Initio Quantum** — Density Functional Theory (DFT), Quantum Monte Carlo, Hartree-Fock, coupled-cluster methods for electrons and orbitals.
  - `East (Emerald #10b981)`: **Classical & Molecular Dynamics (MD)** — Newtonian particle equations of motion, force fields, Lennard-Jones, N-body astrophysics, coarse-grained biomolecules.
  - `South (Red #ef4444)`: **Mesh & Continuum Solvers** — Computational Fluid Dynamics (CFD), magnetohydrodynamics (MHD), Finite Element Analysis (FEA), Particle-In-Cell (PIC) for plasmas.
  - `West (Amber #f59e0b)`: **Statistical & Stochastic Monte Carlo** — Lattice gauge theory, Markov Chain Monte Carlo (MCMC), cluster algorithms (Wolff, Swendsen-Wang), simulated annealing.
- **Question:** Which computational physics methodology is your primary weapon?
- **Optimal Widget:** Orthogonal Diamond Deformation Polygon (`"diamond"`).

#### 2.2 Potential Formulation: First-Principles Quantum vs. Empirical Potentials (2-Pole Dipole)
- **Poles:** **Ab Initio Quantum Purity (DFT)** (Calculate electronic forces directly from Schrödinger/Kohn-Sham equations; zero fitted parameters; limited to thousands of atoms) ↔ **Empirical Classical Potentials** (Embedded Atom Method, Tersoff, ReaxFF; fitted to bulk properties; capable of simulating billions of atoms)
- **Question:** Do you calculate forces from first principles or fit empirical potential functions?
- **Optimal Widget:** Dipole Slider.

#### 2.3 Classical Numerical Simulation vs. Quantum Simulators (2-Pole Dipole)
- **Poles:** **Classical Supercomputing Algorithms** (Tensor networks, DMRG, Quantum Monte Carlo on classical exascale clusters) ↔ **Quantum Hardware / Analog Simulators** (Mapping the Hamiltonian directly onto neutral atom arrays, superconducting qubits, or Rydberg quantum simulators)
- **Question:** Will strongly correlated quantum systems be solved by classical algorithms or quantum hardware?
- **Optimal Widget:** Dipole Slider.

---

### Category 3: Scale Bridging, Discretization & Time Evolution

#### 3.1 Multi-Scale Bridging: Direct Concurrent Coupling vs. Hierarchical Parameter Hand-Off (2-Pole Dipole)
- **Poles:** **Direct Concurrent Multi-Scale** (Simultaneously embedding quantum QM/MM zones inside classical MD, coupled directly to continuum finite element boundaries in a single code run) ↔ **Hierarchical Parameter Hand-Off** (Run quantum simulations offline to compute material constants, pass them up to molecular dynamics, extract viscosity/elasticity, and feed them into a separate macro CFD code)
- **Question:** Do you couple multi-scale models concurrently or pass parameters hierarchically?
- **Optimal Widget:** Dipole Slider.

#### 3.2 Time Integration: Symplectic Geometric Conservation vs. High-Order Adaptive Stepping (2-Pole Dipole)
- **Poles:** **Symplectic Integrators (Geometric Mechanics)** (Verlet, leapfrog, Ruth algorithms; exact conservation of phase space volume and bounded Hamiltonian energy over billions of orbits) ↔ **High-Order Adaptive Steppers** (Runge-Kutta-Fehlberg, Bulirsch-Stoer; adaptive time steps that minimize local truncation error at every moment)
- **Question:** Do you prioritize symplectic geometric conservation or high-order adaptive accuracy?
- **Optimal Widget:** Dipole Slider.

#### 3.3 Spatial Discretization: Structured Grids vs. Unstructured Meshes vs. Mesh-Free Particles (3-Pole Triad $\Delta^2$)
- **Poles:**
  - `Pole 0 (Apex - Blue #3b82f6)`: **Structured Uniform Grids & Spectral Methods** — Cartesian grids, Fast Fourier Transforms, uniform spacing; maximum computational efficiency and spectral accuracy.
  - `Pole 1 (Base Right - Green #22c55e)`: **Unstructured Adaptive Meshes (AMR)** — Tetrahedral/hexahedral meshes, octrees, zooming in on shock fronts and boundary layers where physics happens.
  - `Pole 2 (Base Left - Amber #f59e0b)`: **Mesh-Free Particle Methods** — Smoothed Particle Hydrodynamics (SPH), vortex methods; no mesh connectivity, immune to mesh tangling during explosive deformation.
- **Question:** How do you discretize physical space?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget (`"triangle"`).

---

### Category 4: The Machine, The Code & Supercomputing Architecture

#### 4.1 Compute Infrastructure: National Exascale Supercomputers vs. Dedicated Local Workstations (2-Pole Dipole)
- **Poles:** **National Leadership Supercomputers** (Frontier, Aurora, Summit; 100,000+ nodes, massive MPI scaling, rigorous grant allocation proposals and queue waits) ↔ **Local Dedicated Workstations / Clusters** (Local 8-GPU servers under your desk; instant turnaround, interactive debugging, zero grant bureaucracy)
- **Question:** Do you run on national exascale supercomputers or dedicated local hardware?
- **Optimal Widget:** Dipole Slider.

#### 4.2 Processor Architecture: Massive CPU Cores vs. GPU Stream Accelerators (2-Pole Dipole)
- **Poles:** **Massive CPU Clusters** (Huge RAM per core, deep cache hierarchies, complex branch prediction, pure OpenMP/MPI parallelism) ↔ **Dense GPU / Tensor Accelerators** (Thousands of CUDA/HIP cores, massive memory bandwidth, SIMD lockstep parallelism, porting physics to GPU kernels)
- **Question:** Is your physics algorithm better suited for high-memory CPUs or dense streaming GPUs?
- **Optimal Widget:** Dipole Slider.

#### 4.3 Scientific Software Craft: Battle-Tested Legacy Fortran vs. Modern Composable Julia/Python (2-Pole Dipole)
- **Poles:** **Battle-Tested Fortran/C Codebases** (Millions of lines written over 40 years, hyper-optimized BLAS/LAPACK, reliable, immovable institutional code) ↔ **Modern Composable High-Level Stacks** (Julia, Python/JAX, differentiable physics engines, auto-differentiation, high-level expressive abstractions)
- **Question:** Do you build upon 40-year-old Fortran monoliths or modern modular scientific languages?
- **Optimal Widget:** Dipole Slider.

---

### Category 5: AI & Physics-Informed Machine Learning

#### 5.1 Physics-Informed Neural Networks (PINNs) vs. Traditional Numerical Solvers (2-Pole Dipole)
- **Poles:** **AI & Neural Operators (PINNs/FNO)** (Train neural networks on physics loss functions; instantaneous surrogate inference, mesh-free, solves inverse problems effortlessly) ↔ **Traditional Numerical Analysis (FEM/FVM)** (Strictly mathematically verified error bounds, exact conservation laws, no hallucinated physics, guaranteed stability)
- **Question:** Will deep learning neural operators replace traditional numerical solvers?
- **Optimal Widget:** Dipole Slider.

#### 5.2 Machine Learning Interatomic Potentials (MLIPs) Stance (2-Pole Dipole)
- **Poles:** **MLIP Enthusiast** (Neural network potentials like MACE, NequIP, and ANI achieve near-DFT quantum accuracy at classical molecular dynamics speed; the holy grail is here) ↔ **MLIP Skeptic** (Machine learning potentials fail unpredictably outside their training manifold; dangerous and untrustworthy for unexpected phase transitions or extreme pressures)
- **Question:** Do you trust machine-learned interatomic potentials for new physics discovery?
- **Optimal Widget:** Dipole Slider.

---

### Category 6: The Computational Life & Code Culture

#### 6.1 Code Openness & Reproducibility: Fully Open Repositories vs. Competitive Protection (2-Pole Dipole)
- **Poles:** **Radical Open-Source Science** (Publishing all solver code, input decks, random seeds, and raw trajectory data on GitHub/Zenodo with Docker containers for 100% reproduction) ↔ **Protected Competitive Advantage** (Keeping custom in-house physics algorithms proprietary until all papers and grants are extracted)
- **Question:** Should simulation source code and input decks be fully open upon publication?
- **Optimal Widget:** Dipole Slider.

#### 6.2 Identity: Physicist Who Writes Code vs. Software Engineer Doing Physics (2-Pole Dipole)
- **Poles:** **Physicist First** (Code is just an incidental vehicle to understand the physics; quick-and-dirty scripts are fine if the physical insight is sound) ↔ **Research Software Engineer (RSE)** (Code quality, unit testing, continuous integration, version control, and memory safety are as crucial as the physical equations)
- **Question:** Do you view yourself primarily as a physicist who codes, or as a scientific software engineer?
- **Optimal Widget:** Dipole Slider.

---

## 3. Pole-Count Summary

| Poles | Count | Topics |
|-------|-------|--------|
| 1-pole (monopole) | 0 | — |
| 2-pole (dipole) | 15 | 1.2, 1.3, 1.4, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2 |
| 3-pole (triad) | 2 | 1.1 (Epistemic Status of Simulation), 3.3 (Spatial Discretization) |
| 4-pole (tetrad) | 1 | 2.1 (The Computational Physics Methods Quartet) |
| 5-pole (pentad) | 0 | — |
| 6-pole (hexad) | 0 | — |
| 7-pole (heptad) | 0 | — |
| 8-pole (octad) | 0 | — |

**Total: 6 categories, 18 topics.**

---

## 4. Higher-Pole Candidates (Awaiting Ruling)

- **The Grand Simulation Challenges (8-Pole Octad $\Delta^7$)**:
  *Ab Initio Nucleosynthesis (Lattice QCD), Whole-Cell Molecular Dynamics (Billion-Atom), Tokamak Plasma Turbulence (Gyrokinetics), Core-Collapse Supernova Simulation, Global Climate Multi-Scale Dynamics, Quantum Spin Liquid Ground States, Asteroid Impact Planetary Defense, Gravitational Wave Binary Neutron Star Mergers.*
  - Question: Which monumental computational simulation challenge commands your deepest professional obsession?
- **Six Numerical Pathologies & Instabilities (6-Pole Hexad $\Delta^5$)**:
  *Courant-Friedrichs-Lewy (CFL) Violation, Numerical Dissipation & Diffusion, Floating-Point Catastrophic Cancellation, Mesh Tangling / Hourglassing, Fermion Sign Problem, Stiff Differential Equation Divergence.*

---

## 5. Open Questions for the Principal Investigator

1. Does the distinction between Simulcapades and Mattercapades remain clear in the materials modeling topics?
2. Should the Grand Simulation Challenges octad candidate be incorporated as a flagship 8-pole topic in Category 1?
3. Does 1.1 (The Epistemic Status of Simulation) capture the ongoing philosophical debate among computational researchers?
