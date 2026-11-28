/* docs-skin.js — skin-aware rendering for gate-linked docs, quick starts, and how-it-works.
   Architecture (inverted 2026-11-23): SFW Vanilla is the default baseline.
   Documentation renders SFW & Vanilla out-of-the-box.
   Only when skin.isSex is TRUE (on sex.capades.io or sexcapades.io)
   does this script unhide mature [data-sx-sex-only] blocks, hide [data-sx-vanilla-only]
   blocks, and swap in 18+ mature terminology. On all vanilla skins (flex.capades.io,
   fores, nous, polis, etc.), mature content is NEVER exposed.

   Each skin carries authoritative topic counts, category counts, subcategories,
   meter definitions, pole roles, and domain descriptions to populate Quick Start
   and How It Works pages dynamically.
*/
(function () {
  "use strict";

  var SKIN_CATALOG = {
  "sex": {
    "id": "sexcapades",
    "prefix": "sex",
    "name": "Sexcapades",
    "brand": "Sex.Capades.IO",
    "desc": "kink & sexuality (18+)",
    "domain": "Intimacy, Eroticism, BDSM, Power Exchange & Relational Geometries",
    "about": "Sexcapades is an interactive hypermap for rating and visualizing what you want in bed \u2014 power exchange, bondage, sensation, roleplay, the acts and positions themselves \u2014 and comparing your desires with another person's, give and receive, on the same picture. Build a personal profile, see where you meet and where you part, use Scribe to draft the story you'd live, and Scene Setter to plan the scene \u2014 all in the same shared vocabulary.",
    "aboutSummary": "Intimacy, eroticism, BDSM, power exchange, and relational geometries.",
    "meter": "interest",
    "type": "activity",
    "poles": [
      "give",
      "receive"
    ],
    "topicTerm": "kink",
    "topicsTerm": "kinks",
    "cats": 18,
    "catsWithSub": 16,
    "subcats": 72,
    "topics": 382,
    "archetypes": 36,
    "firstLadder": 24,
    "firstLadderMins": 7,
    "coreTotal": 59,
    "deeperTotal": 109
  },
  "flex": {
    "id": "flexcapades",
    "prefix": "flex",
    "name": "Flexcapades",
    "brand": "Flex.Capades.IO",
    "desc": "how you use Flexcapades, and how you want it to grow",
    "domain": "flex.capades.io",
    "about": "How you use Flexcapades, and how you want it to grow: the features and flows of the app itself, rated by the stake you have in each \u2014 plus the open questions the project is still deciding, where the room gets its say.",
    "aboutSummary": "How you use Flexcapades, and how you want it to grow: the features and flows of the app itself, and live project decisions.",
    "meter": "stake",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 7,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 32,
    "archetypes": 7,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 21,
    "deeperTotal": 0
  },
  "polis": {
    "id": "poliscapades",
    "prefix": "polis",
    "name": "Poliscapades",
    "brand": "Polis.Capades.IO",
    "desc": "politics, economics, and governance",
    "domain": "Political Economy, Civic Allocation & Governance",
    "about": "Poliscapades is an interactive hypermap for rating and visualizing where you stand on the questions that run a country \u2014 the economy, health and care, who holds power \u2014 and comparing your positions with another person's, stance by stance, on the same picture. Build a personal profile, see where you meet and where you part, use Scribe to draft the case you'd make, and Scene Setter to plan the conversation \u2014 all in the same shared vocabulary.",
    "aboutSummary": "Where you stand on the questions that run a country: the economy, healthcare, power, and civil rights.",
    "meter": "conviction",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "stance",
    "topicsTerm": "civic & economic stances",
    "cats": 8,
    "catsWithSub": 7,
    "subcats": 21,
    "topics": 110,
    "archetypes": 20,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 24,
    "deeperTotal": 48
  },
  "fores": {
    "id": "forescapades",
    "prefix": "fores",
    "name": "Forescapades",
    "brand": "Fores.Capades.IO",
    "desc": "religion \u2014 Abrahamic faiths",
    "domain": "The Abrahamic Faiths \u2014 Judaism, Christianity, and Islam",
    "about": "Forescapades is an interactive hypermap for rating and visualizing what you believe about God, scripture, and the life of faith \u2014 and comparing your convictions with another person's, belief by belief, on the same picture. Build a personal profile, see where your faiths meet and where they part, use Scribe to write out what you hold true, and Scene Setter to plan a conversation about what matters most \u2014 all in the same shared vocabulary.",
    "aboutSummary": "What you believe about God, scripture, and the life of faith across Judaism, Christianity, and Islam.",
    "meter": "belief",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "question",
    "topicsTerm": "convictions & beliefs",
    "cats": 7,
    "catsWithSub": 6,
    "subcats": 22,
    "topics": 118,
    "archetypes": 17,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 21,
    "deeperTotal": 42
  },
  "chem": {
    "id": "chemcapades",
    "prefix": "chem",
    "name": "Chemcapades",
    "brand": "Chem.Capades.IO",
    "desc": "chemistry",
    "domain": "Chemistry \u2014 the Science of Matter",
    "about": "Chemcapades is an interactive hypermap for rating and visualizing how molecules combine \u2014 what things are made of, how they change, and what they can become \u2014 and comparing your chemistry with another person's, reaction by reaction, on the same picture. Build a personal profile, see where your chemistry meets and where it parts, use Scribe to write the synthesis you'd run, and Scene Setter to plan the work at the bench \u2014 all in the same shared vocabulary.",
    "aboutSummary": "How molecules combine, what things are made of, and how chemical reactions transform the material world.",
    "meter": "understanding",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 8,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 76,
    "archetypes": 13,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 24,
    "deeperTotal": 46
  },
  "aesth": {
    "id": "aesthcapades",
    "prefix": "aesth",
    "name": "Aesthcapades",
    "brand": "Aesth.Capades.IO",
    "desc": "aesthetics & taste",
    "domain": "Aesthetics \u2014 Taste Preferences & Judgments of Beauty",
    "about": "Aesthcapades is an interactive hypermap for rating and visualizing what moves you \u2014 the art, music, stories, and flavors you love, and the taste you trust \u2014 and comparing your sensibility with another person's, liking by liking, on the same picture. Build a personal profile, see where your tastes meet and where they part, use Scribe to write the review you'd give, and Scene Setter to plan what to see, hear, and taste together \u2014 all in the same shared vocabulary.",
    "aboutSummary": "What moves you: the art, music, stories, flavors you love, and the taste you trust.",
    "meter": "taste",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 7,
    "catsWithSub": 1,
    "subcats": 3,
    "topics": 50,
    "archetypes": 8,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 21,
    "deeperTotal": 0
  },
  "experi": {
    "id": "expericapades",
    "prefix": "experi",
    "name": "Expericapades",
    "brand": "Experi.Capades.IO",
    "desc": "experimental physics",
    "domain": "Experimental Physics \u2014 the world of the detector, the ultra-high vacuum chamber, the cryogenic dilution refrigerator, and the particle collider",
    "about": "Expericapades is an interactive hypermap for rating and visualizing how experiments should be run \u2014 what counts as evidence, how sure is sure enough, and what a good discovery takes \u2014 and comparing your standards with another person's, judgment by judgment, on the same picture. Build a personal profile, see where your standards meet and where they part, use Scribe to write the experiment you'd run, and Scene Setter to plan the collaboration that runs it \u2014 all in the same shared vocabulary.",
    "aboutSummary": "How experiments should be run: evidence, proof standards, detector limits, and the work of discovery.",
    "meter": "experience",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 73,
    "archetypes": 11,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 18,
    "deeperTotal": 34
  },
  "dharma": {
    "id": "dharmacapades",
    "prefix": "dharma",
    "name": "Dharmacapades",
    "brand": "Dharma.Capades.IO",
    "desc": "eastern religions",
    "domain": "Eastern Religions \u2014 Dharmic & Taoic Traditions",
    "about": "Dharmacapades is an interactive hypermap for rating and visualizing how you walk the path \u2014 practice, conduct, liberation, and what you hold sacred \u2014 and comparing your way with another person's, step by step, on the same picture. Build a personal profile, see where your paths meet and where they part, use Scribe to write the practice you'd keep, and Scene Setter to plan a conversation about the way forward \u2014 all in the same shared vocabulary.",
    "aboutSummary": "How you walk the path: practice, conduct, liberation, and what you hold sacred across Dharmic traditions.",
    "meter": "practice",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 43,
    "archetypes": 11,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 18,
    "deeperTotal": 0
  },
  "matter": {
    "id": "mattercapades",
    "prefix": "matter",
    "name": "Mattercapades",
    "brand": "Matter.Capades.IO",
    "desc": "applied physics",
    "domain": "Applied Physics \u2014 Materials & Quantum Technologies",
    "about": "Mattercapades is an interactive hypermap for rating and visualizing where you stand on the stuff the world is made of and the energy that moves it \u2014 materials, power, and what to build with them \u2014 and comparing your positions with another person's, choice by choice, on the same picture. Build a personal profile, see where your choices meet and where they part, use Scribe to write up the build you'd back, and Scene Setter to plan how it gets made \u2014 all in the same shared vocabulary.",
    "aboutSummary": "Where you stand on the stuff of the world: materials, power, energy, and what to build with them.",
    "meter": "understanding",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 72,
    "archetypes": 16,
    "firstLadder": 10,
    "firstLadderMins": 4,
    "coreTotal": 18,
    "deeperTotal": 36
  },
  "philo": {
    "id": "philoscapades",
    "prefix": "philo",
    "name": "Philoscapades",
    "brand": "Philo.Capades.IO",
    "desc": "philosophy",
    "domain": "Philosophy \u2014 Human Intellectual Commitments, Metaphysical Worldviews & Normative Frameworks",
    "about": "Philoscapades is an interactive hypermap for rating and visualizing where you stand on the oldest questions \u2014 what is true, what is real, what is right \u2014 and comparing your positions with another person's, claim by claim, on the same picture. Build a personal profile, see where your thinking meets and where it parts, use Scribe to set out the argument you'd make, and Scene Setter to plan a conversation that goes deep \u2014 all in the same shared vocabulary.",
    "aboutSummary": "Where you stand on the oldest questions: truth, reality, metaphysics, and ethics.",
    "meter": "position",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 29,
    "archetypes": 8,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 17,
    "deeperTotal": 0
  },
  "praxi": {
    "id": "praxicapades",
    "prefix": "praxi",
    "name": "Praxicapades",
    "brand": "Praxi.Capades.IO",
    "desc": "applied mathematics",
    "domain": "Applied Mathematics \u2014 how you model the world, how you compute, and what you value in applied work",
    "about": "Praxicapades is an interactive hypermap for rating and visualizing how you model the world \u2014 what you compute, what you trust, and how you know a model is good \u2014 and comparing your practice with another person's, method by method, on the same picture. Build a personal profile, see where your methods meet and where they part, use Scribe to write the model you'd build, and Scene Setter to plan the review that tests it \u2014 all in the same shared vocabulary.",
    "aboutSummary": "How you model the world: computation, numerical methods, simulation fidelity, and applied math.",
    "meter": "practice",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 75,
    "archetypes": 13,
    "firstLadder": 7,
    "firstLadderMins": 3,
    "coreTotal": 18,
    "deeperTotal": 36
  },
  "quanta": {
    "id": "quantacapades",
    "prefix": "quanta",
    "name": "Quantacapades",
    "brand": "Quanta.Capades.IO",
    "desc": "theoretical physics",
    "domain": "Theoretical Physics \u2014 the pen-and-paper, blackboard, and chalk world where mathematical structure attempts to unveil the foundational architecture of physical reality",
    "about": "Quantacapades is an interactive hypermap for rating and visualizing where you stand on the strangeness at the bottom of things \u2014 what the quantum world is, how the universe began, what emerges from it \u2014 and comparing your positions with another person's, interpretation by interpretation, on the same picture. Build a personal profile, see where your physics meets and where it parts, use Scribe to write the universe you'd argue for, and Scene Setter to plan the conversation that tests it \u2014 all in the same shared vocabulary.",
    "aboutSummary": "Where you stand on the quantum world: foundational reality, quantum interpretations, and cosmic origins.",
    "meter": "understanding",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 70,
    "archetypes": 15,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 18,
    "deeperTotal": 36
  },
  "simul": {
    "id": "simulcapades",
    "prefix": "simul",
    "name": "Simulcapades",
    "brand": "Simul.Capades.IO",
    "desc": "computational physics",
    "domain": "Computational Physics \u2014 the Computer as a Virtual Laboratory",
    "about": "Simulcapades is an interactive hypermap for rating and visualizing what you trust about copies of the world \u2014 what a simulation can show, where it lies, and when it's real enough \u2014 and comparing your trust with another person's, claim by claim, on the same picture. Build a personal profile, see where your trust meets and where it parts, use Scribe to write the simulation you'd build, and Scene Setter to plan the check that proves it \u2014 all in the same shared vocabulary.",
    "aboutSummary": "What you trust about copies of the world: simulation fidelity, virtual labs, and computational limits.",
    "meter": "stance",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 80,
    "archetypes": 16,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 18,
    "deeperTotal": 36
  },
  "tech": {
    "id": "techcapades",
    "prefix": "tech",
    "name": "Techcapades",
    "brand": "Tech.Capades.IO",
    "desc": "technology",
    "domain": "Technology & Digital Life \u2014 AI, Privacy & Living with the Machines",
    "about": "Techcapades is an interactive hypermap for rating and visualizing where you stand on the machines we're building \u2014 intelligence, privacy, attention, and who they serve \u2014 and comparing your positions with another person's, stance by stance, on the same picture. Build a personal profile, see where you meet and where you part, use Scribe to write the future you'd want, and Scene Setter to plan the conversation about what to build next \u2014 all in the same shared vocabulary.",
    "aboutSummary": "Where you stand on the machines we build: artificial intelligence, privacy, attention, and technology ethics.",
    "meter": "stance",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 40,
    "archetypes": 6,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 18,
    "deeperTotal": 0
  },
  "theori": {
    "id": "theoricapades",
    "prefix": "theori",
    "name": "Theoricapades",
    "brand": "Theori.Capades.IO",
    "desc": "pure mathematics",
    "domain": "Pure & Theoretical Mathematics \u2014 what math is, what makes it true, and how you live as a mathematician",
    "about": "Theoricapades is an interactive hypermap for rating and visualizing where you stand on the foundations of mathematics \u2014 what is true, what counts as proof, what is beautiful \u2014 and comparing your positions with another person's, claim by claim, on the same picture. Build a personal profile, see where your mathematics meets and where it parts, use Scribe to set out the proof you'd give, and Scene Setter to plan the conversation that settles it \u2014 all in the same shared vocabulary.",
    "aboutSummary": "Where you stand on the foundations of mathematics: truth, rigorous proof, and mathematical beauty.",
    "meter": "position",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 74,
    "archetypes": 18,
    "firstLadder": 7,
    "firstLadderMins": 3,
    "coreTotal": 18,
    "deeperTotal": 36
  },
  "voca": {
    "id": "vocapades",
    "prefix": "voca",
    "name": "Vocapades",
    "brand": "Voca.Capades.IO",
    "desc": "vocation & work",
    "domain": "Work & Vocation \u2014 Career, Calling & the Meaning of Work",
    "about": "Vocapades is an interactive hypermap for rating and visualizing what work means to you \u2014 purpose, ambition, security, and where you draw the line \u2014 and comparing your stance with another person's, value by value, on the same picture. Build a personal profile, see where your working lives meet and where they part, use Scribe to write out the working life you'd choose, and Scene Setter to plan the talk about what comes next \u2014 all in the same shared vocabulary.",
    "aboutSummary": "What work means to you: purpose, ambition, security, and the shape of a vocation.",
    "meter": "inclination",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 6,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 34,
    "archetypes": 7,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 18,
    "deeperTotal": 0
  },
  "nous": {
    "id": "nouscapades",
    "prefix": "nous",
    "name": "Nouscapades",
    "brand": "Nous.Capades.IO",
    "desc": "what counts as a mind",
    "domain": "Consciousness \u2014 Minds, Selves and Novel Beings at Every Scale",
    "about": "Nouscapades maps where you stand on the questions Michael Levin's work forces open: minds without brains, selves nested inside selves, and beings \u2014 anthrobots grown from ordinary human cells \u2014 that are neither organism nor machine in any settled sense. Rate your conviction on each question and watch the shape of your philosophy of mind appear: how far down cognition goes, how large a self can be, and who gets counted.",
    "aboutSummary": "What counts as a mind: consciousness, cognition without brains, and intelligence at every scale.",
    "meter": "conviction",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "question",
    "topicsTerm": "theories & questions of mind",
    "cats": 8,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 55,
    "archetypes": 7,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 24,
    "deeperTotal": 0
  },
  "bio": {
    "id": "biocapades",
    "prefix": "bio",
    "name": "Biocapades",
    "brand": "Bio.Capades.IO",
    "desc": "life itself",
    "domain": "Life \u2014 Evolution, Genes and What It Is to Be Alive",
    "about": "Biocapades maps where you stand on the life sciences: what drives evolution, how much of a life the genome scripts, where the boundary of life runs, and what we may do with the tools that now edit it. Biology bridges hard empirical theory and sharp bioethical choices \u2014 and deep controversies often hinge on which level of organization, gene, organism, lineage, or biosphere, you treat as primary.",
    "aboutSummary": "What drives evolution, how the genome scripts life, and the boundaries of living systems.",
    "meter": "perspective",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 8,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 46,
    "archetypes": 6,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 24,
    "deeperTotal": 0
  },
  "lingua": {
    "id": "linguacapades",
    "prefix": "lingua",
    "name": "Linguacapades",
    "brand": "Lingua.Capades.IO",
    "desc": "the tongues we think in",
    "domain": "lingua.capades.io",
    "about": "Linguacapades maps where you stand on language: who sets its rules, what your dialect says about you, whether your words shape your thoughts, and what is happening to the world's tongues. Positions everyone holds and almost no one has ever stated \u2014 until they compare maps.",
    "aboutSummary": "Where you stand on language: grammar rules, dialect, linguistic relativity, and the world tongues.",
    "meter": "sensibility",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 7,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 40,
    "archetypes": 5,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 21,
    "deeperTotal": 0
  },
  "fast": {
    "id": "fastcapades",
    "prefix": "fast",
    "name": "Fastcapades",
    "brand": "Fast.Capades.IO",
    "desc": "the discipline of not eating",
    "domain": "fast.capades.io",
    "about": "Fasting in practice and theory: religious observance, metabolic health, protocols, physiology debates, refeeding, and the interior and social life of voluntary abstention.",
    "aboutSummary": "Fasting in practice and theory: protocols, metabolic health, refeeding, and voluntary abstention.",
    "meter": "discipline",
    "type": "stance",
    "poles": [
      "advocacy",
      "receptivity"
    ],
    "topicTerm": "topic",
    "topicsTerm": "topics",
    "cats": 7,
    "catsWithSub": 0,
    "subcats": 0,
    "topics": 33,
    "archetypes": 5,
    "firstLadder": 6,
    "firstLadderMins": 2,
    "coreTotal": 21,
    "deeperTotal": 0
  },
  "dance": {
    "id": "dancecapades",
    "prefix": "dance",
    "name": "Dancecapades",
    "brand": "Dance.Capades.IO",
    "desc": "lead, follow, and move together",
    "domain": "Partner Dance \u2014 Leading, Following, and the Social Floor",
    "about": "Dancecapades maps how you dance with other people: the dances you love, the side of the hold you live on, and the social floor you move through. Rate each dance as the lead and as the follow \u2014 the two are never averaged \u2014 and the map can price the only question a social floor really asks: who should dance with whom, and to what. Cross reads your lead against a partner\u2019s follow; circle minus finds the splits \u2014 two leads, one tempo \u2014 before the music does.",
    "aboutSummary": "Leading, following, and the social dance floor.",
    "meter": "groove",
    "type": "activity",
    "poles": [
      "lead",
      "follow"
    ],
    "topicTerm": "dance",
    "topicsTerm": "partner dances",
    "cats": 9,
    "catsWithSub": 6,
    "subcats": 15,
    "topics": 86,
    "archetypes": 10,
    "firstLadder": 8,
    "firstLadderMins": 3,
    "coreTotal": 27,
    "deeperTotal": 54
  },
  "quest": {
    "id": "questcapades",
    "prefix": "quest",
    "name": "Questcapades",
    "brand": "Quest.Capades.IO",
    "desc": "the tales a table tells",
    "domain": "Tabletop Roleplay \u2014 Systems, Stories, and the Tables That Tell Them",
    "about": "Questcapades maps how you play tabletop roleplaying games: the seat you take, the systems and worlds you love, and the habits you bring to the table. Rate each game as the one who runs it and the one who plays in it, and the map can price the hobby\u2019s oldest problem \u2014 assembling a table that works. Circle minus writes the session-zero agenda: the splits over dice, death, and tone, found before the first roll instead of after the first fight.",
    "aboutSummary": "Tabletop roleplay systems, playstyles, and table culture.",
    "meter": "fun",
    "type": "activity",
    "poles": [
      "run (GM)",
      "play"
    ],
    "topicTerm": "game",
    "topicsTerm": "tabletop RPG systems & styles",
    "cats": 8,
    "catsWithSub": 4,
    "subcats": 12,
    "topics": 82,
    "archetypes": 12,
    "firstLadder": 10,
    "firstLadderMins": 3,
    "coreTotal": 24,
    "deeperTotal": 48
  }
};

  function detectSkin() {
    var host = "";
    try { host = window.location.hostname.toLowerCase(); } catch (e) { host = ""; }
    var cleanHost = host.replace(/^www\./, "");
    var prefix = "";
    if (/\.capades\.io$/.test(cleanHost)) prefix = cleanHost.split(".")[0];
    else if (cleanHost === "sexcapades.io") prefix = "sex";
    var isSkinHost = !!prefix && !!SKIN_CATALOG[prefix];
    var q = null;
    try { q = new URLSearchParams(window.location.search || "").get("skin"); } catch (e) { q = null; }
    if (q) q = q.toLowerCase();
    if (!isSkinHost && q && SKIN_CATALOG[q]) prefix = q;
    if (!prefix || !SKIN_CATALOG[prefix]) prefix = "flex";
    return prefix;
  }

  var prefix = detectSkin();
  var rawSkin = SKIN_CATALOG[prefix] || SKIN_CATALOG.flex;
  var COMPARE_SKINS = { sex: true, polis: true };

  var skin = {
    id: rawSkin.id,
    prefix: prefix,
    name: rawSkin.name,
    brand: rawSkin.brand,
    desc: rawSkin.desc,
    domain: rawSkin.domain,
    about: rawSkin.about,
    aboutSummary: rawSkin.aboutSummary,
    meter: rawSkin.meter,
    type: rawSkin.type,
    poles: rawSkin.poles,
    topicTerm: rawSkin.topicTerm,
    topicsTerm: rawSkin.topicsTerm,
    cats: rawSkin.cats,
    catsWithSub: rawSkin.catsWithSub,
    subcats: rawSkin.subcats,
    topics: rawSkin.topics,
    archetypes: rawSkin.archetypes || 0,
    firstLadder: rawSkin.firstLadder || 0,
    firstLadderMins: rawSkin.firstLadderMins || 0,
    coreTotal: rawSkin.coreTotal || 0,
    deeperTotal: rawSkin.deeperTotal || 0,
    host: prefix + ".capades.io",
    isSex: prefix === "sex",
    hasCompare: !!COMPARE_SKINS[prefix]
  };
  window.__SX_DOC_SKIN = skin;

  /* Rules for Sexcapades (18+ opt-in swap from vanilla default): */
  var SEX_RULES = [
    ["Flex.Capades.IO", "Sex.Capades.IO"],
    ["Flexcapades.IO", "Sexcapades.IO"],
    ["Flexcapades.io", "sexcapades.io"],
    ["Flexcapades", "Sexcapades"],
    ["flex.capades.io", "sexcapades.io"],
    ["Depth Factor", "Kink Factor"],
    ["Cross match", "Krossmatch"],
    ["Commune DF", "Play KF"],
    ["Commune MS", "Play MS"],
    ["Converse DF", "Parlay KF"],
    ["Converse MS", "Parlay MS"],
    ["questionnaires", "kink tests"],
    ["questionnaire", "kink test"],
    ["Questionnaire", "Kink test"],
    ["topics", "kinks"],
    ["Topics", "Kinks"],
    ["topic", "kink"],
    ["Topic", "Kink"]
  ];

  /* Rules for Vanilla Skins (brand name swap from generic Flexcapades): */
  var VANILLA_RULES = [
    ["Flex.Capades.IO", skin.brand],
    ["Flexcapades.IO", skin.brand],
    ["Flexcapades.io", skin.host],
    ["Flexcapades", skin.name],
    ["flex.capades.io", skin.host],
    ["Sex.Capades.IO", skin.brand],
    ["Sex.capades.io", skin.brand],
    ["sex.capades.io", skin.host],
    ["Sexcapades.IO", skin.brand],
    ["Sexcapades.io", skin.host],
    ["Sexcapades", skin.name],
    ["sexcapades.io", skin.host]
  ];

  var ACTIVE_RULES = skin.isSex ? SEX_RULES : VANILLA_RULES;

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var RES = ACTIVE_RULES.map(function (r) {
    return [new RegExp("\\b" + esc(r[0]) + "\\b", "g"), r[1]];
  });
  function swapText(s) {
    var out = s;
    for (var i = 0; i < RES.length; i++) out = out.replace(RES[i][0], RES[i][1]);
    return out;
  }
  function walk(node) {
    if (node.nodeType === 3) {
      var v = swapText(node.nodeValue);
      if (v !== node.nodeValue) node.nodeValue = v;
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;
    for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
  }

  function formatEstMins(mins) {
    var m = Math.max(1, Math.round(mins));
    if (m < 60) return "~" + m + " min";
    var hrs = (m / 60).toFixed(1).replace(/\.0$/, "");
    return "~" + hrs + " hr" + (m >= 90 ? "s" : "");
  }

  function getLadderRungText(s) {
    var c = s.cats;
    var t = s.topics;
    var flN = s.firstLadder || Math.min(t, 6);
    var flM = s.firstLadderMins || Math.max(1, Math.round(flN / 3));
    var coreN = s.coreTotal || Math.min(3 * c, t);
    var deeperN = s.deeperTotal || 0;
    var parts = [
      "Phase 1 (First Ladder) is " + flN + " topics (" + formatEstMins(flM) + ")",
      "Phase 2 (Core Map, balanced round-robin to 3/category) reaches " + coreN + " topics (" + formatEstMins(coreN / 3) + ")"
    ];
    if (deeperN > coreN && deeperN < t) {
      parts.push("Phase 3 (Deeper, 6/category) reaches " + deeperN + " topics (" + formatEstMins(deeperN / 3) + ")");
    }
    parts.push("the full " + t + "-topic map takes " + formatEstMins(t / 3));
    return "Guided Ladder milestones: " + parts.join("; ") + ".";
  }

  function renderProfilePhases(s) {
    var section = document.getElementById("profile-phases");
    if (!section) return;

    var c = s.cats;
    var t = s.topics;
    var arch = s.archetypes || 0;
    var flN = s.firstLadder || Math.min(t, 6);
    var flM = s.firstLadderMins || Math.max(1, Math.round(flN / 3));
    var pass1 = s.coreTotal || Math.min(3 * c, t);
    var pass1M = Math.max(1, Math.round(pass1 / 3));
    var pass2 = s.deeperTotal || 0;
    var hasPass2 = pass2 > pass1 && pass2 < t;
    var pass2M = Math.max(1, Math.round(pass2 / 3));
    var fullM = Math.max(1, Math.round(t / 3));
    var factorName = s.isSex ? "Kink Factor" : "Personal Depth Factor";
    var archPhrase = arch > 1 ? ("all " + arch + " headline archetypes") : "the map’s archetypes";
    var partnerWord = s.prefix === "dance" ? "dance partner" : s.prefix === "quest" ? "table" : "partner";

    var ledeEl = document.getElementById("phases-lede");
    if (ledeEl) {
      ledeEl.textContent = "You don’t need to rate all " + t + " topics in one sitting. Guided Ladder feeds topics in real phases—matching the ticks on the phase-aware progress bar—so every minute unlocks a sharper profile.";
    }

    var phases = [
      {
        num: "Phase 01",
        tag: "First Ladder",
        metric: flN + " topics · " + formatEstMins(flM),
        title: "First archetype projection",
        body: "Rate the top " + flN + " topics—picked by the greedy orthogonal ladder to separate " + archPhrase + " in the fewest steps. Enough for your first “Which archetype am I?” projection."
      },
      {
        num: "Phase 02",
        tag: "3/cat · round-robin",
        metric: pass1 + " topics total · " + formatEstMins(pass1M),
        title: "Accurate projection & core map",
        body: "Branch round-robin draws the sharpest pole splits (fault lines) across all " + c + " categories until every branch has at least 3 topics. Locks in an accurate archetype projection and a balanced map ready to compare with a " + partnerWord + "."
      }
    ];

    if (hasPass2) {
      phases.push({
        num: "Phase 03",
        tag: "6/cat · round-robin",
        metric: pass2 + " topics total · " + formatEstMins(pass2M),
        title: "Deeper resolution",
        body: "Continues round-robin across all " + c + " categories to 6 per branch—surfacing secondary fault lines so Scribe, Scene Setter, and group sync capture nuance beyond headline agreement."
      });
    }

    phases.push({
      num: hasPass2 ? "Phase 04" : "Phase 03",
      tag: "Full map",
      metric: t + " topics · " + formatEstMins(fullM),
      title: "Complete map",
      body: "Every " + s.topicTerm + " on the map rated down through the popularity and alphabetical tail—maximum " + factorName + " and zero blind spots in " + partnerWord + " overlays."
    });

    var grid = document.getElementById("phases-grid");
    if (grid) {
      grid.classList.toggle("is-four", phases.length === 4);
      grid.classList.toggle("is-three", phases.length === 3);
      grid.innerHTML = phases.map(function (p) {
        return '<article class="phase-card">' +
          '<div class="phase-head">' +
            '<span class="phase-num">' + p.num + '</span>' +
            '<span class="phase-tag">' + p.tag + '</span>' +
          '</div>' +
          '<h3>' + p.title + '</h3>' +
          '<p class="phase-metric">' + p.metric + '</p>' +
          '<p class="phase-body">' + p.body + '</p>' +
        '</article>';
      }).join("");
    }

    var cascadeList = document.getElementById("cascade-list");
    if (cascadeList) {
      var tiers = [
        {
          rank: "01",
          name: "Greedy orthogonal first ladder",
          detail: "Top " + flN + " topics chosen to maximize separation between the closest pair of headline archetypes."
        },
        {
          rank: "02",
          name: "Branch round-robin pole splits",
          detail: "Balances all " + c + " categories evenly (to 3/cat" + (hasPass2 ? ", then 6/cat" : "") + "), drawing each branch’s sharpest archetype fault lines first."
        },
        {
          rank: "03",
          name: "Popularity",
          detail: "Remaining topics ordered globally by community rating volume so widely relevant ones surface first."
        },
        {
          rank: "04",
          name: "Alphabetical",
          detail: "Deterministic tie-breaker for the long tail so rows never jump while you rate."
        }
      ];
      cascadeList.innerHTML = tiers.map(function (tier) {
        return '<li class="cascade-step">' +
          '<span class="cascade-rank">' + tier.rank + '</span>' +
          '<div class="cascade-copy"><strong>' + tier.name + '</strong> — ' + tier.detail + '</div>' +
        '</li>';
      }).join("");
    }
  }

  function skinHowItWorks(s) {
    if (!document.querySelector(".chain") || !document.querySelector(".heart")) return;

    // Page Title & Meta
    document.title = "How " + s.name + " Works";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      if (s.isSex) {
        metaDesc.setAttribute("content", "See how Sexcapades maps 365 kinks across 18 categories, turns private preferences into a visual map, and helps you compare and plan play.");
      } else {
        metaDesc.setAttribute("content", "See how " + s.name + " maps " + s.topics + " " + s.topicsTerm + " across " + s.cats + " categories, turns ratings into a visual hypermap, and compares stances for constructive dialogue.");
      }
    }

    // Header & Intro
    var titleEl = document.getElementById("page-title") || document.querySelector("h1");
    if (titleEl) titleEl.textContent = "How " + s.name + " works";

    var introP = document.querySelector(".intro p");
    if (introP) {
      if (s.isSex) {
        introP.textContent = "Map what you want across 365 kinks in 18 categories, compare privately, and turn the overlap into something you can explore together.";
      } else {
        var subStr = s.subcats ? (" and " + s.subcats + " subcategories") : "";
        var poleStr = s.type === "activity" ? (s.poles[0] + " and " + s.poles[1]) : (s.poles[0] + " and " + s.poles[1] + " on a scale of " + s.meter);
        introP.textContent = s.name + " maps " + s.topics + " " + s.topicsTerm + " across " + s.cats + " categories" + subStr + ". " + s.aboutSummary + " Rate your " + poleStr + ", compare privately, and turn the overlap into constructive dialogue.";
      }
    }

    // Step 02: Profile
    var step2Els = document.querySelectorAll(".chain .step:nth-child(2) p");
    var step2Text = "";
    if (s.isSex) {
      step2Text = "Rate give and receive across 365 kinks—or import KinkTest, FetLife, and more.";
    } else if (s.type === "activity") {
      step2Text = "Rate " + s.poles[0] + " and " + s.poles[1] + " across " + s.topics + " " + s.topicsTerm + " in " + s.cats + " categories.";
    } else {
      step2Text = "Rate " + s.poles[0] + " and " + s.poles[1] + " across " + s.topics + " topics in " + s.cats + " categories on a scale of " + s.meter + ".";
    }
    step2Els.forEach(function (p) { p.textContent = step2Text; });

    // Step 05: Stories & Dialectics / Story & play
    var step5H2s = document.querySelectorAll(".chain .step:nth-child(5) h2");
    var step5Ps = document.querySelectorAll(".chain .step:nth-child(5) p");
    var step5Title = "";
    var step5Desc = "";
    if (s.isSex) {
      step5Title = "Story & play";
      step5Desc = "Scribe turns your map into stories; Scene Setter helps you plan and negotiate play.";
    } else if (s.prefix === "dance") {
      step5Title = "Floor & music";
      step5Desc = "Scribe reflects on your floor style; Scene Setter helps plan partner tempos and dances.";
    } else if (s.prefix === "quest") {
      step5Title = "Campaign & session zero";
      step5Desc = "Scribe turns your map into campaign hooks; Scene Setter drafts a session-zero agreement on death, tone, and table rules.";
    } else if (s.prefix === "flex") {
      step5Title = "Roadmap & consensus";
      step5Desc = "Scribe drafts feature proposals and community feedback; Scene Setter helps align on Flexcapades roadmap priorities.";
    } else {
      step5Title = "Stories & dialectics";
      step5Desc = "Scribe turns your map into arguments and perspectives; Scene Setter helps you plan structured discussions and find consensus.";
    }
    step5H2s.forEach(function (h2) { h2.textContent = step5Title; });
    step5Ps.forEach(function (p) { p.textContent = step5Desc; });

    // Heart / Compare hook copy
    var hookPs = document.querySelectorAll(".hook-copy p");
    if (hookPs.length >= 3) {
      hookPs[1].innerHTML = "Bring them together when you’re ready. <span class=\"sx-brand-name\">" + s.name + "</span> highlights the overlap and quiets everything else.";
      var hook3Els = document.querySelectorAll(".hook-copy p:nth-child(3), .hook-copy p[data-sx-sex-only], .hook-copy p[data-sx-vanilla-only]");
      var hook3Html = "";
      if (s.isSex) {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where one person’s give meets the other’s receive. That’s where the conversation starts.";
      } else if (s.prefix === "dance") {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where one person’s lead meets the other’s follow. That’s where the dance begins.";
      } else if (s.prefix === "quest") {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where one person’s game to run meets another’s game to play. That’s where the table forms.";
      } else {
        hook3Html = "<strong>Green branches are mutual territory</strong>—where your positions and receptivity align on shared " + s.meter + ". That’s where the conversation starts.";
      }
      hook3Els.forEach(function (el) { el.innerHTML = hook3Html; });
    }

    // Enter CTA button
    var enterBtn = document.querySelector(".enter");
    if (enterBtn) {
      enterBtn.textContent = "Try it — enter " + s.name;
      enterBtn.setAttribute("href", "https://" + s.host + "/");
    }
  }

  function skinQuickstart(s) {
    if (!document.querySelector(".steps-section")) return;

    var pass1 = s.coreTotal || Math.min(3 * s.cats, s.topics);
    var estMins = Math.max(1, Math.round(pass1 / 3));
    var flN = s.firstLadder || Math.min(s.topics, 6);
    var flM = s.firstLadderMins || Math.max(1, Math.round(flN / 3));

    // Title & Meta
    document.title = s.name + " Quick Start";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Get started with " + s.name + ": rate the top " + flN + " topics (~" + flM + " min) for your first archetype projection, or " + pass1 + " balanced topics (~" + estMins + " min) for a partner-ready core map.");
    }

    // Hero Section
    var introTitle = document.getElementById("intro-title");
    if (introTitle) introTitle.textContent = "Find what clicks—in about " + estMins + " minutes.";
    var timeEl = document.querySelector(".time");
    if (timeEl) timeEl.textContent = "~" + flM + "m first projection · ~" + estMins + "m core map";

    // Hero Lede
    var ledes = document.querySelectorAll(".lede");
    var subcatStr = s.subcats ? (" (" + s.subcats + " subcategories)") : "";
    var ledeHtml = "";
    if (s.isSex) {
      ledeHtml = "<strong>Sexcapades maps " + s.topics + " kinks across " + s.cats + " categories.</strong> You rate each one for giving and for receiving; when a partner rates theirs, the app overlays your two maps and colors every topic by how you match.";
    } else if (s.prefix === "dance") {
      ledeHtml = "<strong>Dancecapades maps " + s.topics + " partner dances across " + s.cats + " categories" + subcatStr + ".</strong> You rate each dance for leading and for following; when a dance partner rates theirs, the app overlays your two maps and colors every dance by your mutual groove and lead/follow fit.";
    } else if (s.prefix === "quest") {
      ledeHtml = "<strong>Questcapades maps " + s.topics + " tabletop roleplaying games and styles across " + s.cats + " categories.</strong> You rate each game for running (GMing) and for playing; when your table rates theirs, the app overlays your maps and highlights the systems where GM appetite meets player desire.";
    } else if (s.prefix === "flex") {
      ledeHtml = "<strong>Flexcapades maps " + s.topics + " topics across " + s.cats + " categories.</strong> How you use Flexcapades, and how you want it to grow: you rate each feature and open question on your stake in it; when a partner or team member rates theirs, the app overlays your two maps and colors every topic by how you match.";
    } else {
      ledeHtml = "<strong>" + s.name + " maps " + s.topics + " " + s.topicsTerm + " across " + s.cats + " categories" + subcatStr + ".</strong> " + s.aboutSummary + " You rate each " + s.topicTerm + " on your " + s.poles[0] + " and " + s.poles[1] + "; when a partner rates theirs, the app overlays your two maps and colors every topic by how you match.";
    }
    ledes.forEach(function (l) { l.innerHTML = ledeHtml; });

    // Step 1: Hot list hierarchy & modes
    var hierHtml = "";
    if (s.subcats > 0) {
      hierHtml = "In By Category view, " + s.catsWithSub + " of the " + s.cats + " categories split into subcategories (" + s.subcats + " in total). Tap any heading (<strong>›</strong>) to expand all of its topics in place.";
    } else {
      hierHtml = "In By Category view, all " + s.cats + " categories are flat lists for rapid browsing. Tap any heading (<strong>›</strong>) to expand all of its topics in place.";
    }
    var step1HierEls = document.querySelectorAll(".steps .step:nth-child(1) p[data-sx-sex-only], .steps .step:nth-child(1) p[data-sx-vanilla-only]");
    if (step1HierEls.length > 0) {
      step1HierEls.forEach(function (el) { el.innerHTML = hierHtml; });
    } else {
      var step1Ps = document.querySelectorAll(".steps .step:nth-child(1) p");
      if (step1Ps.length >= 2) step1Ps[1].innerHTML = hierHtml;
    }

    // Step 2: Rating sliders & Guided Ladder phases
    var sliderHtml = "";
    if (s.isSex) {
      sliderHtml = "Every topic has two sliders: <strong>give</strong> sits above the topic’s line, <strong>receive</strong> below it. Drag either one to set how much you want that side of it — the scale runs from Not Interested through Curious about to Want to do, and you can also flag a topic Hard Limit or Fantasy-only.";
    } else if (s.prefix === "dance") {
      sliderHtml = "Every dance has two sliders: <strong>lead</strong> sits above the dance’s line, <strong>follow</strong> below it. Drag either one to rate your appetite for that role — the scale runs from Not Interested through Curious to Passionate, with flags for hard boundaries.";
    } else if (s.prefix === "quest") {
      sliderHtml = "Every game has two sliders: <strong>run (GM)</strong> sits above the line, <strong>play</strong> below it. Drag either one to rate your appetite for running or playing that system — the scale runs from Not Interested through Curious to Passionate.";
    } else {
      sliderHtml = "Every topic has two sliders: <strong>advocacy</strong> sits above the line (your conviction or push for it), <strong>receptivity</strong> below it (your openness to others who hold it). Drag either one on a scale of " + s.meter + " — from Not Interested through Curious to Strongly held, with flags for firm limits.";
    }
    var step2TargetPs = document.querySelectorAll(".steps .step:nth-child(2) p[data-sx-sex-only], .steps .step:nth-child(2) p[data-sx-vanilla-only]");
    if (step2TargetPs.length > 0) {
      step2TargetPs.forEach(function (p) { p.innerHTML = sliderHtml; });
    } else {
      var step2Ps = document.querySelectorAll(".steps .step:nth-child(2) p");
      if (step2Ps.length >= 1) step2Ps[0].innerHTML = sliderHtml;
    }

    var step2FirstLi = document.getElementById("step2-first-ladder");
    if (step2FirstLi) {
      step2FirstLi.innerHTML = "<strong>Phase 1 — First Ladder (" + flN + " topics · " + formatEstMins(flM) + "):</strong> start with the top greedy-orthogonal topics to unlock your first archetype projection.";
    }

    var almostAll = (pass1 >= Math.round(s.topics * 0.7)) ? " (covering most of the map!)" : "";
    var coverageText = "<strong>Phase 2 — Core map (" + pass1 + " topics total · " + formatEstMins(estMins) + "):</strong> branch round-robin balances all " + s.cats + " categories (3 per category)" + almostAll + " for an accurate archetype projection and partner comparison.";
    var step2CoverageLis = document.querySelectorAll(".steps .step:nth-child(2) ul li[data-sx-sex-only], .steps .step:nth-child(2) ul li[data-sx-vanilla-only]");
    if (step2CoverageLis.length > 0) {
      step2CoverageLis.forEach(function (li) { li.innerHTML = coverageText; });
    } else {
      var step2Lis = document.querySelectorAll(".steps .step:nth-child(2) ul li");
      if (step2Lis.length >= 2) step2Lis[1].innerHTML = coverageText;
    }

    // Profile phases & 4-tier Hot List cascade
    renderProfilePhases(s);

    // Step 3: Compare with partner
    var step3CompareEls = document.querySelectorAll(".steps .step:nth-child(3) p[data-sx-sex-only], .steps .step:nth-child(3) p[data-sx-vanilla-only]");
    var compareHtml = "";
    if (s.isSex) {
      compareHtml = "Import a partner’s hypermap (step 1) and the app combines both profiles into one: each cross-pairing is scored by fit — your give against their receive, and their give against your receive — and colored by the result. Solo? Scribe generates stories and play guides from just your profile.";
    } else if (s.prefix === "dance") {
      compareHtml = "Import a dance partner’s hypermap (step 1) and the app combines both profiles into one: each dance is scored by fit — your lead against their follow, and their lead against your follow — and colored by the result. Solo? Scribe generates floor profiles and playlist suggestions.";
    } else if (s.prefix === "quest") {
      compareHtml = "Import a player's or GM's hypermap (step 1) and the app combines table profiles: matching who wants to run what with who wants to play what. Solo? Scribe generates campaign hooks and adventure seeds.";
    } else {
      compareHtml = "Import a partner or colleague’s hypermap (step 1) and the app combines both profiles: each topic is scored by mutual fit — your advocacy against their receptivity, and their advocacy against yours — and colored by the result. Solo? Scribe generates an informed dialectic from just your profile.";
    }
    if (step3CompareEls.length > 0) {
      step3CompareEls.forEach(function (el) { el.innerHTML = compareHtml; });
    } else {
      var step3P = document.querySelector(".steps .step:nth-child(3) p");
      if (step3P) step3P.innerHTML = compareHtml;
    }

    // Normalization tip ("Did you know?")
    var normP = document.querySelector(".normalization-tip p:last-child");
    if (normP) {
      if (s.isSex) {
        normP.innerHTML = "Every topic has an About button. It shows how common that kink is and links to Reddit, FetLife, and Discord communities for it.";
      } else {
        normP.innerHTML = "Every topic has an About button. It provides background context, references, and definitions for that specific " + s.topicTerm + ".";
      }
    }

    // Quick tips (Ladder rungs)
    var quickTipsLis = document.querySelectorAll(".quick-tips ul li");
    if (quickTipsLis.length >= 1) {
      quickTipsLis[0].textContent = getLadderRungText(s);
    }

    // Payoff Intro
    var payoffPs = document.querySelectorAll(".payoff-intro p");
    var payoffText = "";
    if (s.isSex) {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into a story or scene prompt, and Scene Setter turns two profiles into a plan for negotiating play. Scene Sentinel adds check-in timers and emergency contacts to help keep play safer.";
    } else if (s.prefix === "dance") {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into dance and floor reflections, and Scene Setter turns two profiles into a dance partnership plan for tempos, styles, and floor rotation.";
    } else if (s.prefix === "quest") {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into campaign pitches and adventure prompts, and Scene Setter turns multiple profiles into a session-zero agreement on death, tone, and table rules.";
    } else if (s.prefix === "flex") {
      payoffText = "Your saved ratings feed two tools: Scribe drafts feature proposals and community feedback, and Scene Setter turns two profiles into an alignment map on Flexcapades roadmap priorities.";
    } else {
      payoffText = "Your saved ratings feed two tools: Scribe turns a profile into an informed dialectic or manifesto, and Scene Setter turns two profiles into a structured discussion agreement on where you agree, disagree, and explore together.";
    }
    payoffPs.forEach(function (p) { p.textContent = payoffText; });

    // Output examples · Scene Setter
    var setterH3s = document.querySelectorAll(".output-examples .output-example:nth-child(2) h3");
    var setterUls = document.querySelectorAll(".output-examples .output-example:nth-child(2) ul");
    var setterTitle = "";
    var setterItemsHtml = "";
    if (s.isSex) {
      setterTitle = "A scene you can actually use";
      setterItemsHtml = "<li>Choose a safeword and agree on the pace before you begin.</li><li>Start with the strongest shared interest from both maps.</li><li>Pause for a check-in before raising the intensity.</li>";
    } else if (s.prefix === "dance") {
      setterTitle = "A dance partnership you can take to the floor";
      setterItemsHtml = "<li>Agree on tempos and styles before you step onto the floor.</li><li>Start with the strongest shared dance from both maps.</li><li>Check in on comfort and lead/follow connection between songs.</li>";
    } else if (s.prefix === "quest") {
      setterTitle = "A session-zero agreement for your table";
      setterItemsHtml = "<li>Agree on lethality, tone, and system rules before rolling characters.</li><li>Start with the strongest shared game interest from the table.</li><li>Check in on player boundaries and campaign pacing.</li>";
    } else if (s.prefix === "flex") {
      setterTitle = "A feature roadmap consensus";
      setterItemsHtml = "<li>Identify shared high-stake priorities across both profiles.</li><li>Surface the open design splits where opinions diverge.</li><li>Focus discussion on resolving key architectural tradeoffs.</li>";
    } else {
      setterTitle = "A discussion agreement you can actually use";
      setterItemsHtml = "<li>Agree on ground rules and terms before you begin.</li><li>Start with the strongest shared conviction from both maps.</li><li>Pause for reflection before moving to a harder controversy.</li>";
    }
    setterH3s.forEach(function (h3) { h3.textContent = setterTitle; });
    setterUls.forEach(function (ul) { ul.innerHTML = setterItemsHtml; });

    // More section
    var moreH2 = document.querySelector(".more h2");
    if (moreH2) moreH2.textContent = "More " + s.name;

    // Glossary mention in footer
    var glossaryLink = document.querySelector('footer a[href*="glossary.html"]');
    if (glossaryLink) {
      glossaryLink.textContent = s.name + " Glossary";
    }
  }

  function apply() {
    if (document.body) {
      if (skin.isSex) document.body.classList.add("is-sex-skin");
      else document.body.classList.add("is-vanilla-skin");
    }
    var titleEl = document.querySelector("title[data-sx-title-vanilla]");
    if (!skin.isSex && titleEl) {
      document.title = swapText(titleEl.getAttribute("data-sx-title-vanilla"));
    } else if (document.title) {
      document.title = swapText(document.title);
    }
    if (document.body) walk(document.body);
    var attrs = ["title", "aria-label", "alt", "placeholder"];
    attrs.forEach(function (attr) {
      var els = document.querySelectorAll("[" + attr + "]");
      for (var i = 0; i < els.length; i++) {
        var v = els[i].getAttribute(attr);
        if (v) {
          var nv = swapText(v);
          if (nv !== v) els[i].setAttribute(attr, nv);
        }
      }
    });
    var metas = document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
    for (var m = 0; m < metas.length; m++) {
      var c = metas[m].getAttribute("content");
      if (c) {
        var nc = swapText(c);
        if (nc !== c) metas[m].setAttribute("content", nc);
      }
    }
    var links = document.querySelectorAll("a[href]");
    for (var l = 0; l < links.length; l++) {
      var h = links[l].getAttribute("href");
      if (!h) continue;
      var nh = h.replace(/^https?:\/\/((www\.)?(sexcapades\.io|sex\.capades\.io))(\/|$|\?|#)/i, function (_, __, ___, ____, tail) {
        return "https://" + skin.host + (tail || "");
      });
      if (nh !== h) links[l].setAttribute("href", nh);
    }
    var flyerQrs = document.querySelectorAll(".mini-qr");
    for (var qi = 0; qi < flyerQrs.length; qi++) {
      flyerQrs[qi].style.backgroundImage = 'url("/hosted/images/flyer-qr-' + prefix + '.svg")';
    }

    if (skin.isSex) {
      /* On 18+ Sexcapades: unhide sex-only blocks, hide vanilla-only blocks */
      var sexOnly = document.querySelectorAll("[data-sx-sex-only]");
      for (var s = 0; s < sexOnly.length; s++) sexOnly[s].removeAttribute("hidden"), sexOnly[s].style.display = "";
      var vanillaOnly = document.querySelectorAll("[data-sx-vanilla-only]");
      for (var v = 0; v < vanillaOnly.length; v++) vanillaOnly[v].style.display = "none";
    } else {
      /* On SFW Vanilla skins: hide sex-only blocks, unhide vanilla-only blocks */
      var sexOnly = document.querySelectorAll("[data-sx-sex-only]");
      for (var s = 0; s < sexOnly.length; s++) sexOnly[s].style.display = "none";
      var vanillaOnly = document.querySelectorAll("[data-sx-vanilla-only]");
      for (var v = 0; v < vanillaOnly.length; v++) vanillaOnly[v].removeAttribute("hidden"), vanillaOnly[v].style.display = "";
    }

    // Apply deep page-specific skinning for Quickstart & How-It-Works
    skinHowItWorks(skin);
    skinQuickstart(skin);

    try {
      var odoDigits = document.querySelectorAll("[id^='odometer-digits']");
      if (odoDigits.length > 0) {
        fetch("/hosted/api/collect.php", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({action: "get_stats", skin: skin.name.toLowerCase()})
        })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && typeof d.unique_visitors === "number") {
            var str = String(d.unique_visitors).padStart(6, "0");
            odoDigits.forEach(function (c) {
              c.innerHTML = "";
              for (var i = 0; i < str.length; i++) {
                var dig = document.createElement("div");
                dig.className = "odometer-digit";
                dig.textContent = str[i];
                c.appendChild(dig);
              }
            });
          }
        }).catch(function () {});
      }
    } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
