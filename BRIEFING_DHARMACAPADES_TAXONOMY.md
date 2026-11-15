# Dharmacapades: Eastern Religions Taxonomy
*Taxopolemics Engine Specification Briefing for Autonomous Agents & Modelers*

**Engine:** Taxopolemics (Multi-Pole Dialectical Hypermap Engine)  
**Skin:** Dharmacapades (Eastern Religions — Dharmic & Taoic Traditions)  
**Author:** YoBiche (Yolanda Biche) & Principal Investigator Jason Mark Wrinkle  
**Status:** Draft — First pass, awaiting the Principal Investigator's feedback. Not canonical.  

---

## 1. Abstract & Scope

**Dharmacapades** maps human positions on the Eastern religions — Hinduism, Buddhism, Jainism, Sikhism (the Dharmic traditions), Taoism and Confucianism (the Taoic / Chinese traditions), and the shared practices that run through them (yoga, tantra, kundalini, meditation). In traditional surveys, Eastern religions are collapsed into a single checkbox ("Eastern") or reduced to a stereotype (meditation, incense, gurus).

Under the **Taxopolemics** engine, Eastern religious positions are mapped to their natural geometric degrees of freedom: from **1-Pole scalars** (absolute affinity), to **2-Pole dialectical dipoles** (Atman vs. Anatta; Sudden vs. Gradual enlightenment), to higher-order **Triads (3-Pole $\Delta^2$)**, **Tetrads (4-Pole $\Delta^3$)**, **Pentads (5-Pole $\Delta^4$)**, **Hexads (6-Pole $\Delta^5$)**, **Heptads (7-Pole $\Delta^6$)**, and **Octads (8-Pole $\Delta^7$)**.

**Engine cap:** the engine goes to **8 poles and caps there** — monopole through octad. The cap is a human limit, not a technical one: people cannot hold more than about eight positions in mind at once (Jason, 2026-11-14).

**Scope note — a companion to Forescapades, not a replacement.** Forescapades is the world-religions skin; it already covers some Eastern topics (Trimurti, the Three Gunas, the Five Mahabhutas, the Six Classical Yogas) as part of its broad survey. Dharmacapades goes deep on the Dharmic and Taoic traditions, treating them from within — the positions, the practices, the arguments that only make sense inside these traditions. **Eastern Orthodox Christianity belongs in Forescapades, not here** — it is Christian, part of the Abrahamic scope, and "Eastern" in the geographic sense only (Jason, 2026-11-14).

**Scope note — Buddhism, religion or philosophy?** Some say Buddhism is more a philosophy than a religion, and the honest answer is that it is both — and neither, depending on who you ask and which form you mean. Dharmacapades does not force the question. It treats Buddhism as a lived Dharmic tradition (practice, liberation, community, ethics) and lets the ambiguity itself be a position: topic 1.4 asks how *you* see Buddhism — religion, philosophy, or way of life. Philoscapades covers Buddhist philosophy (emptiness, dependent origination, the nature of mind) where it overlaps. The two skins complement each other; a person can rate Buddhist philosophy in Philoscapades and Buddhist practice in Dharmacapades, and the 1.4 topic records which frame they hold.

**Name note:** "Dharmacapades" from *Dharma* — the central concept across Hinduism, Buddhism, Jainism, and Sikhism (cosmic order, duty, teaching), with the Dao as its parallel "Way" in Taoism. Alternatives considered: Eastcapades (simple but vague, and risks confusion with Eastern Orthodox), Waycapades (poetic but vague). Dharma is the most precise umbrella term for the traditions this skin covers.

---

## 2. Taxonomic Architecture & Rating Widget Assignments

### Category 1: Dharma & The Way

#### 1.1 Dharma vs Dao (2-Pole Dipole)
- **Poles:** Dharma (duty, cosmic order, teaching) ↔ Dao (the Way, natural flow)
- **Question:** How is the world ordered — by duty and teaching, or by the Way that cannot be named?
- **Optimal Widget:** Dipole slider.

#### 1.2 Karma: Literal vs Psychological (2-Pole Dipole)
- **Poles:** Literal (karma as a real mechanism of rebirth) ↔ Psychological (karma as an ethical principle — actions shape character)
- **Question:** How do you understand karma?
- **Optimal Widget:** Dipole slider.

#### 1.3 Samsara: Escape vs Engage vs Accept (3-Pole Triad $\Delta^2$)
- **Poles:**
  - `Pole 0 (Apex)`: **Escape** — Samsara is suffering; the point is to get out (moksha, nirvana).
  - `Pole 1 (Base Right)`: **Engage** — Stay in the cycle to help others (the bodhisattva vow).
  - `Pole 2 (Base Left)`: **Accept** — Samsara is fine; live well within it.
- **Question:** What do you do about the cycle of rebirth?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget.

#### 1.4 Buddhism: Religion vs Philosophy vs Way of Life (3-Pole Triad $\Delta^2$)
- **Poles:**
  - `Pole 0 (Apex)`: **Religion** — Devotion, ritual, sangha, rebirth; Buddhism is a religion.
  - `Pole 1 (Base Right)`: **Philosophy** — Reason, analysis, ethics; no god needed; Buddhism is a philosophy.
  - `Pole 2 (Base Left)`: **Way of Life** — Practice, meditation, living well; neither religion nor philosophy.
- **Question:** What is Buddhism to you?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget.
- **Note:** This topic exists because the question has no settled answer. It records the rater's frame rather than forcing one.

### Category 2: Liberation & Enlightenment

#### 2.1 Moksha vs Nirvana vs Union with the Dao (3-Pole Triad $\Delta^2$)
- **Poles:**
  - `Pole 0 (Apex)`: **Moksha** — Hindu liberation; union with Brahman, the self realized.
  - `Pole 1 (Base Right)`: **Nirvana** — Buddhist cessation; extinction of craving, the end of suffering.
  - `Pole 2 (Base Left)`: **Union with the Dao** — Taoist return; becoming one with the Way.
- **Question:** What is liberation?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget.

#### 2.2 Sudden vs Gradual Enlightenment (2-Pole Dipole)
- **Poles:** Sudden (instant awakening, Zen satori) ↔ Gradual (slow cultivation, step by step)
- **Question:** Does awakening come all at once, or piece by piece?
- **Optimal Widget:** Dipole slider.

#### 2.3 Self vs No-Self (2-Pole Dipole)
- **Poles:** Atman (eternal self, Hindu) ↔ Anatta (no-self, Buddhist)
- **Question:** Is there a self, or isn't there? The core metaphysical divide.
- **Optimal Widget:** Dipole slider.

### Category 3: Practice & Discipline

#### 3.1 Yoga: Physical vs Spiritual (2-Pole Dipole)
- **Poles:** Physical exercise ↔ Spiritual discipline
- **Question:** How do you practice yoga — as a workout, or as a path?
- **Optimal Widget:** Dipole slider.

#### 3.2 Meditation: Concentration vs Insight (2-Pole Dipole)
- **Poles:** Samatha (concentration, calm) ↔ Vipassana (insight, seeing clearly)
- **Question:** Do you meditate to calm the mind, or to see through it?
- **Optimal Widget:** Dipole slider.

#### 3.3 Tantra: Left-hand vs Right-hand (2-Pole Dipole)
- **Poles:** Left-hand (transgressive, embraces the forbidden) ↔ Right-hand (orthodox, symbolic)
- **Question:** Which tantra — the one that breaks the rules, or the one that works within them?
- **Optimal Widget:** Dipole slider.

#### 3.4 Kundalini (1-Pole Monopole)
- **Pole:** Kundalini engagement, 0–100.
- **Question:** How central is kundalini — the coiled energy, the awakening — to your practice?
- **Optimal Widget:** Monopole slider.

#### 3.5 The Noble Eightfold Path (8-Pole Octad $\Delta^7$)
- **Poles (in the traditional order, grouped by the three sections):**
  - `Pole 0 (Red #ef4444)`: **Right View** (Wisdom) — Seeing things as they are.
  - `Pole 1 (Orange #f97316)`: **Right Intention** (Wisdom) — Resolve, renunciation, goodwill.
  - `Pole 2 (Yellow #eab308)`: **Right Speech** (Ethics) — Truthful, kind, useful speech.
  - `Pole 3 (Green #22c55e)`: **Right Action** (Ethics) — Acting without harm.
  - `Pole 4 (Teal #14b8a6)`: **Right Livelihood** (Ethics) — Earning a living without harm.
  - `Pole 5 (Blue #3b82f6)`: **Right Effort** (Meditation) — Cultivating wholesome states, abandoning unwholesome ones.
  - `Pole 6 (Indigo #6366f1)`: **Right Mindfulness** (Meditation) — Clear awareness of body, feeling, mind.
  - `Pole 7 (Purple #a855f7)`: **Right Concentration** (Meditation) — Deep absorption, jhana.
- **Question:** How much do you emphasize each limb of the Path?
- **Optimal Widget:** Octad / 8-axis radial wheel. The fourth canonical octad in the Flexcapades family and the foundational anchor for Dharmacapades. (Correction, 2026-11-15: this was first described as "the first octad in any skin" — in fact the engine already has three production octads wired into the taxonomy catalog: t0426 Physical Restraint & Containment, t0427 Anatomical Focus & Somatosensory Worship, and the Epistemological Octad in Philoscapades. The Eightfold Path is the fourth.)
- **Note:** The three sections (Wisdom: View + Intention; Ethics: Speech + Action + Livelihood; Meditation: Effort + Mindfulness + Concentration) structure the ring — adjacent poles within a section are closest.

### Category 4: Deity & The Divine

#### 4.1 Theism vs Non-theism (2-Pole Dipole)
- **Poles:** Personal gods (Hindu devas, devotional theism) ↔ Non-theistic (Buddhist, no creator god)
- **Question:** Are there gods, or isn't there anyone up there?
- **Optimal Widget:** Dipole slider.

#### 4.2 Brahman: Personal vs Impersonal (2-Pole Dipole)
- **Poles:** Saguna (personal, with attributes) ↔ Nirguna (impersonal, without attributes)
- **Question:** How do you conceive the ultimate — as a person, or as a principle?
- **Optimal Widget:** Dipole slider.

#### 4.3 Buddha: Historical vs Cosmic vs Buddha-nature (3-Pole Triad $\Delta^2$)
- **Poles:**
  - `Pole 0 (Apex)`: **Historical Buddha** — Siddhartha, a man who woke up.
  - `Pole 1 (Base Right)`: **Cosmic Buddha** — Eternal, universal, always present.
  - `Pole 2 (Base Left)`: **Buddha-nature** — Everyone is Buddha already; awakening is remembering.
- **Question:** Who — or what — is the Buddha?
- **Optimal Widget:** Barycentric Equilateral Triangle Widget.

### Category 5: Ethics & Conduct

#### 5.1 Ahimsa (2-Pole Dipole)
- **Poles:** Strict ahimsa (absolute non-violence) ↔ Flexible ahimsa (pragmatic, contextual)
- **Question:** How strictly do you hold non-violence?
- **Optimal Widget:** Dipole slider.

#### 5.2 Precepts: Rules vs Guidelines (2-Pole Dipole)
- **Poles:** Strict rules ↔ Flexible guidelines
- **Question:** Are the ethical precepts commandments, or compass points?
- **Optimal Widget:** Dipole slider.

#### 5.3 Compassion vs Wisdom (2-Pole Dipole)
- **Poles:** Karuna (compassion) ↔ Prajna (wisdom)
- **Question:** The two wings of the bodhisattva path — which do you emphasize?
- **Optimal Widget:** Dipole slider.

### Category 6: Community & Lineage

#### 6.1 Guru: Essential vs Optional (2-Pole Dipole)
- **Poles:** Essential (you need a teacher) ↔ Optional (you can find the way alone)
- **Question:** Do you need a guru?
- **Optimal Widget:** Dipole slider.

#### 6.2 Sangha: Monastic vs Lay (2-Pole Dipole)
- **Poles:** Monastic (renounce, join the sangha) ↔ Lay (practice in the world)
- **Question:** Where do you practice — in the monastery, or in the marketplace?
- **Optimal Widget:** Dipole slider.

#### 6.3 Tradition: Orthodox vs Eclectic (2-Pole Dipole)
- **Poles:** Follow one lineage strictly ↔ Mix traditions freely
- **Question:** Do you stay in one school, or borrow across them?
- **Optimal Widget:** Dipole slider.

---

## 3. Pole-Count Summary

| Poles | Count | Topics |
|-------|-------|--------|
| 1-pole (monopole) | 1 | 3.4 |
| 2-pole (dipole) | 15 | 1.1, 1.2, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3 |
| 3-pole (triad) | 4 | 1.3, 1.4, 2.1, 4.3 |
| 4-pole (tetrad) | 0 | — |
| 5-pole (pentad) | 0 | — |
| 6-pole (hexad) | 0 | — |
| 7-pole (heptad) | 0 | — |
| 8-pole (octad) | 1 | 3.5 |

**Total: 6 categories, 21 topics.**

## 4. Higher-Pole Candidates (not yet specified)

- **The Three Gunas** (triad): Sattva / Rajas / Tamas. Already in Forescapades as a topic; a Dharmacapades version would go deeper (how the gunas shape your temperament and practice). Needs a ruling on whether to duplicate or cross-reference.
- **The Five Mahabhutas** (pentad): Earth / Water / Fire / Air / Ether. Already in Forescapades; same duplication question as the Gunas.
- **The Six Classical Yogas** (hexad): Raja / Jnana / Bhakti / Karma / Hatha / Tantra. Already in Forescapades; a Dharmacapades version would treat them as paths you commit to, not just concepts. Needs a ruling on duplication vs. cross-reference.

## 5. Open Questions for the Principal Investigator

1. Is "Dharmacapades" the name, or do you want Eastcapades, Waycapades, or something else?
2. Is the scope right — Dharmic plus Taoic, with Eastern Orthodox explicitly in Forescapades?
3. Does 1.4 (Buddhism as Religion / Philosophy / Way of Life) handle the ambiguity well, or does it need a different approach?
4. The Forescapades overlaps (Gunas, Mahabhutas, Yogas) — duplicate them here in depth, or cross-reference Forescapades?
5. Are the dipole/triad assignments right, or do any of these want a different pole count?
