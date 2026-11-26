        /* Live monopole seed. This re-seed runs after sxSyncRoleLabels, so it
           is the set Ge() consults. It does not match sexcapades.json
           type:"single" (37 of these ids are not type single; 22 type-single
           ids are absent). Rebuilding Ue from the JSON would change widgets. */
        const Ue = new Set([ "t0002", "t0007", "t0008", "t0102", "t0106", "t0107", "t0108", "t0140", "topic-vampires-gothic", "topic-historical-fantasy", "t0377", "t0378", "t0379", "t0380", "t0382", "t0383", "t0384", "t0317", "t0318", "t0319", "t0320", "t0321", "t0322", "t0323", "t0278", "t0279", "t0280", "t0282", "t0258", "t0361", "t0366", "t0396", "t0397", "t0399", "t0401", "t0402", "t0403", "t0269", "t0048", "t0132", "t0143", "t0144", "t0147", "t0148", "t0195", "t0217", "t0219", "t0228", "t0229", "t0230", "t0232", "t0233", "t0259", "t0290", "t0303" ]);
        function sxWidgetConfig(e, t = sxActiveProfileId()) {
            const n = (at[t] || {})[e], i = n && n.parentId || e;
            /* Flexcapades skin registry: the loaded skin's widget configs,
               including Sexcapades, which boots from sexcapades.json.
               Consulted first. */
            const sw = window.__SX_SKIN_WIDGETS;
            if (sw) { const w = sw[e] || sw[i]; if (w) return w; }
            // 4-Pole Tetrad Topics
            // Forescapades 4-Pole Placeholders
            if (e === "topic-metaphysical-reality" || i === "topic-metaphysical-reality") {
                return {
                    single: !1,
                    tetrad: !0,
                    widget: "diamond",
                    archetype: "diamond", // Type II: Multi-Affinity Distribution
                    keys: [ "materialism", "idealism", "pantheism", "dualism" ],
                    labels: [ "Materialism", "Idealism (Non-Dual)", "Pantheism", "Transcendent Dualism" ]
                };
            }
            if (e === "topic-spiritual-practice" || i === "topic-spiritual-practice") {
                return {
                    single: !1,
                    tetrad: !0,
                    widget: "diamond",
                    archetype: "diamond", // Type II: Multi-Affinity Distribution
                    keys: [ "inquiry", "devotion", "action", "asceticism" ],
                    labels: [ "Contemplative Inquiry", "Emotional Devotion", "Ritual / Social Action", "Ascetic Discipline" ]
                };
            }
            // 5-Pole Pentad Topics
            // Forescapades 5-Pole Placeholders
            if (e === "topic-elemental-balance" || i === "topic-elemental-balance") {
                return {
                    single: !1,
                    pentad: !0,
                    widget: "star-radar",
                    archetype: "star", // Type II: Multi-Affinity Distribution
                    keys: [ "earth", "water", "fire", "air", "aether" ],
                    labels: [ "Earth (Body & Form)", "Water (Flow & Emotion)", "Fire (Will & Energy)", "Air (Mind & Breath)", "Aether (Spirit & Void)" ]
                };
            }
            // 6-Pole Hexad Topics
            // Forescapades 6-Pole Placeholders
            if (e === "topic-six-yogas" || i === "topic-six-yogas") {
                return {
                    single: !1,
                    hexad: !0,
                    widget: "hexad-radar",
                    archetype: "hexad",
                    keys: [ "bhakti", "jnana", "karma", "raja", "kundalini", "tantra" ],
                    labels: [ "Bhakti (Devotion)", "Jnana (Self-Inquiry)", "Karma (Sacred Action)", "Raja (Meditation)", "Kundalini (Prana)", "Tantra (Matter Integration)" ]
                };
            }
            // 7-Pole Heptad Topics
            // Philoscapades 7-Pole Heptad
            if (e === "topic-seven-branches-philosophy" || i === "topic-seven-branches-philosophy") {
                return {
                    single: !1,
                    heptad: !0,
                    widget: "heptad-radar",
                    archetype: "heptad",
                    keys: [ "metaphysics", "epistemology", "ethics", "political", "aesthetics", "logic", "mind" ],
                    labels: [ "Metaphysics (Reality)", "Epistemology (Truth)", "Ethics (Value & Good)", "Political (Power & Justice)", "Aesthetics (Beauty & Art)", "Logic (Validity & Reason)", "Mind (Consciousness & Soul)" ]
                };
            }
            // Poliscapades 7-Pole Heptad
            if (e === "topic-seven-pillars-governance" || i === "topic-seven-pillars-governance") {
                return {
                    single: !1,
                    heptad: !0,
                    widget: "heptad-radar",
                    archetype: "heptad",
                    keys: [ "sovereignty", "ruleoflaw", "distribution", "civilrights", "welfare", "environment", "foreign" ],
                    labels: [ "Sovereign Authority", "Rule of Law", "Economic Equality", "Civil Liberties", "Social Welfare Safety", "Ecological Stewardship", "Geopolitical Autonomy" ]
                };
            }
            // 8-Pole Octad Topics
            // Sexcapades 8-Pole Physical Restraint & Containment Octad
            // Sexcapades 8-Pole Somatosensory & Anatomical Worship Octad
            // Poliscapades 8-Pole Governance Regimes Octad
            if (e === "topic-eight-governance-regimes" || e === "topic-governance-octad" || i === "topic-eight-governance-regimes" || i === "topic-governance-octad") {
                return {
                    single: !1,
                    octad: !0,
                    widget: "octad-radar",
                    archetype: "octad",
                    keys: [ "monarchy", "theocracy", "oligarchy", "liberal_dem", "social_dem", "fascism", "state_communism", "anarchism" ],
                    labels: [ "Feudal Monarchy", "Theocracy", "Oligarchy / Plutocracy", "Liberal Democracy", "Social Democracy", "Fascist Corporatism", "State Marxist-Leninism", "Anarcho-Syndicalism" ]
                };
            }
            // Psycho-Evolutionary 8-Pole Circuits of Consciousness Octad (Leary & Wilson)
            if (e === "topic-eight-circuits-consciousness" || e === "topic-eight-circuits" || i === "topic-eight-circuits-consciousness" || i === "topic-eight-circuits") {
                return {
                    single: !1,
                    octad: !0,
                    widget: "octad-radar",
                    archetype: "octad",
                    keys: [ "biosurvival", "emotional", "symbolic", "sociosexual", "neurosomatic", "metaprogramming", "morphogenetic", "quantum" ],
                    labels: [ "Oral Bio-Survival", "Anal Territorial", "Semantic-Symbolic", "Socio-Sexual", "Neurosomatic", "Metaprogramming", "Morphogenetic", "Non-Local Quantum" ]
                };
            }
            // Cognitive 8-Pole Jungian Functions Octad
            if (e === "topic-jungian-eight-functions" || e === "topic-jungian-functions" || i === "topic-jungian-eight-functions" || i === "topic-jungian-functions") {
                return {
                    single: !1,
                    octad: !0,
                    widget: "octad-radar",
                    archetype: "octad",
                    keys: [ "te", "ti", "fe", "fi", "se", "si", "ne", "ni" ],
                    labels: [ "Te (Extraverted Thinking)", "Ti (Introverted Thinking)", "Fe (Extraverted Feeling)", "Fi (Introverted Feeling)", "Se (Extraverted Sensing)", "Si (Introverted Sensing)", "Ne (Extraverted Intuition)", "Ni (Introverted Intuition)" ]
                };
            }
            // Aesthcapades 6-Pole Music Genres Hexad
            if (e === "topic-music-genres-hexad" || i === "topic-music-genres-hexad") {
                return {
                    single: !1,
                    hexad: !0,
                    widget: "hexad-radar",
                    archetype: "hexad",
                    keys: [ "rock", "pop", "classical", "jazz", "electronic", "hiphop" ],
                    labels: [ "Rock / Alternative", "Pop / Mainstream", "Classical / Traditional", "Jazz / Improvisation", "Electronic / Ambient", "Hip-Hop / Urban" ]
                };
            }
            // Vocapades 6-Pole Work Sectors Hexad
            if (e === "topic-work-sectors-hexad" || i === "topic-work-sectors-hexad") {
                return {
                    single: !1,
                    hexad: !0,
                    widget: "hexad-radar",
                    archetype: "hexad",
                    keys: [ "tech", "healthcare", "creative", "trades", "public_service", "finance" ],
                    labels: [ "Technology & Engineering", "Healthcare & Caregiving", "Creative Arts & Media", "Skilled Trades & Labor", "Public Service & Education", "Finance & Commerce" ]
                };
            }
            // Aesthcapades 5-Pole Art Movements Pentad
            if (e === "topic-art-movements-pentad" || i === "topic-art-movements-pentad") {
                return {
                    single: !1,
                    pentad: !0,
                    widget: "star-radar",
                    archetype: "star",
                    keys: [ "realism", "impressionism", "modernism", "postmodernism", "conceptual" ],
                    labels: [ "Realism / Figurative", "Impressionism", "Modernism / Avant-Garde", "Postmodernism", "Conceptual Art" ]
                };
            }
            // Vocapades 4-Pole Leadership Styles Tetrad
            if (e === "topic-leadership-styles-tetrad" || i === "topic-leadership-styles-tetrad") {
                return {
                    single: !1,
                    tetrad: !0,
                    widget: "diamond",
                    archetype: "diamond",
                    keys: [ "autocratic", "democratic", "servant", "transformational" ],
                    labels: [ "Autocratic (Command & Control)", "Democratic (Consensus & Input)", "Servant (Empowerment & Support)", "Transformational (Inspiration & Vision)" ]
                };
            }
            // Techcapades 4-Pole Tech Ethics Quartet Tetrad
            if (e === "topic-tech-ethics-quartet" || e === "topic-tech-ethics" || i === "topic-tech-ethics-quartet" || i === "topic-tech-ethics") {
                return {
                    single: !1,
                    tetrad: !0,
                    widget: "diamond",
                    archetype: "diamond",
                    keys: [ "utilitarian", "deontological", "virtue", "care" ],
                    labels: [ "Utilitarian (Net Flourishing)", "Deontological (Duty & Rights)", "Virtue Ethics (Character & Craft)", "Care Ethics (Relational Attunement)" ]
                };
            }
            // The topic's own give/receive labels win. A parent id in the
            // single-slider set must not collapse Edge Play (or any other
            // give/receive topic) to one "everything" slider.
            if (We[e] && !Ue.has(e)) return {
                single: !1,
                widget: "xy-switchbox",
                keys: [ "give", "receive" ],
                labels: We[e]
            };
            return Ue.has(i) ? {
                single: !0,
                widget: "monopole-slider",
                keys: [ "give" ],
                labels: [ "everything" ]
            } : {
                single: !1,
                widget: "xy-switchbox",
                keys: [ "give", "receive" ],
                labels: We[i] || [ "give", "receive" ]
            };
        }
        h.forEach(e => Object.entries(e.topicDetails || {}).forEach(([name, t]) => {
            if ("single" === t.type) {
                try {
                    const tid = sxResolveTopicId(name);
                    if (tid) Ue.add(tid);
                } catch (_) {}
            }
        }));
