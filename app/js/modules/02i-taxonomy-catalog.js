        /* ================= TaxonomyLoader module — BEGIN ================= */
        /* ================================================================
           TaxonomyLoader — the 403-topic taxonomy as a validated data
           module. (Refactor Step 4, Build 2026-10-18_0912: the taxonomy data
           that used to be defined inline at the top of this bundle —
           the 18-category topic lists with their per-topic details,
           the subcategory overlay for the 7 categories that have
           subcategories, the display-name map, and the stable catalog
           records — now lives in this module, delimited by the
           BEGIN/END markers and exposed as window.TaxonomyLoader.)

           The data literals below are byte-identical to the previous
           inline definitions; only their ownership moved. The merge
           the app used to run inline (apply the subcategory overlay,
           rebuild each overlaid category's topic list as parent topics
           + subcategory topics, rekey topicDetails through the
           display-name map) now runs inside loadTaxonomy(), with the
           same operations in the same order, over a deep clone of the
           stored data — so the category tree the app receives is
           identical in shape and content, and repeated loadTaxonomy()
           calls return the same cached tree the app has always
           mutated in place.

           Catalog identity: topic IDs are opaque (t0002…t0404),
           assigned once and stored in TAXONOMY_TOPIC_RECORDS; they are
           never derived from labels, hierarchy, or array order. New
           catalog topics must receive max(existing numeric ID) + 1
           and keep that ID permanently.

           API:
             loadTaxonomy() -> {categories, topicById, topicByName,
               flatList} — categories is the merged category tree in
               the app's long-standing shape ({name, risk?, topics,
               topicDetails, subcategories?, parentTopics?});
               flatList entries are {id, name, category,
               subcategory|null, risk, details} in canonical order
               (categories in file order, topics in each category's
               merged order); topicById / topicByName are Maps to the
               same entry objects.
             validate() -> {valid, counts, errors} — schema checks:
               required fields present, topic IDs unique across all
               topics, every topic has exactly one catalog record and
               vice versa, subcategory/parent topics all belong to
               their category (no orphans), and counts exactly
               403 topics / 18 categories / 44 subcategories.
             topicRecords / subcategoryOverlay / displayNames — the
               frozen data tables, for existing readers.
           ================================================================ */
        const TaxonomyLoader = (() => {
            /** Expected taxonomy size: 18 categories, 44 subcategories, 403 topics. */
            const EXPECTED_COUNTS = Object.freeze({
                categories: 18,
                subcategories: 44,
                topics: 403
            });
            /**
             * The 18 top-level categories: topic name lists plus
             * per-topic details (give/receive labels, FetLife
             * popularity counts, notes), exactly as authored.
             */
                        // TAXONOMY_CATEGORIES loaded from 02b-taxonomy-data.js
            // Derived at load from the category tree. Not an authored table.
            function topicName(value) {
                return value && "object" == typeof value ? String(value.name || "") : String(value || "");
            }
            function deriveTopicRecords(categories) {
                const out = {};
                categories.forEach(cat => {
                    const list = cat.subcategories && cat.subcategories.length
                        ? (cat.parentTopics || []).concat(cat.subcategories.flatMap(sub => sub.topics || []))
                        : (cat.topics || []);
                    list.forEach(topic => {
                        const name = topicName(topic);
                        out[name] = { id: topic.id, risk: topic.risk === true };
                    });
                });
                return Object.freeze(out);
            }
            function deriveSubcategoryOverlay(categories) {
                const out = {};
                categories.forEach(cat => {
                    if (!cat.subcategories || !cat.subcategories.length) return;
                    out[cat.name] = {
                        subcategories: cat.subcategories.map(sub => ({
                            id: sub.id,
                            name: sub.name,
                            topics: (sub.topics || []).map(topicName)
                        })),
                        parentTopics: (cat.parentTopics || []).map(topicName)
                    };
                });
                return Object.freeze(out);
            }
            
            /**
             * Display-name map: internal topic name -> display name
             * used as the topicDetails key in the authored category
             * data (e.g. "Nylon" -> "NylonLegs & Feet").
             */
            const TAXONOMY_DISPLAY_NAMES = Object.freeze({
            Nylon: "NylonLegs & Feet",
            "Costume masks": "Masks & hoods",
            "Hand spanking": "Spanking",
            Feet: "Feet & footwear",
            Toes: "Toes and Feet",
            "Age play": "Age play between adults",
            Caregiver: "Caregiver roles (adults)",
            "Teacher/student": "Teacher / student roleplay",
            "Doctor/nurse": "Doctor/Nurse Play",
            Medical: "Medical Play",
            "Owner/property": "Owner & property",
            Kidnapping: "Captivity / kidnapping",
            "CNC fantasy": "Consensual non-consent fantasy",
            Damsels: "Damsels In Distress",
            Pet: "Pet play",
            Puppy: "Puppy play",
            Pony: "Pony Play",
            Piggy: "Piggy Play",
            "1950s": "1950s Household",
            Historical: "Historical fantasy",
            Victorian: "Victorian Lifestyles",
            Vampires: "Vampires & gothic",
            Siblings: "Sister/Brother Roleplay",
            Cuffs: "Cuffs & straps",
            Spreaders: "Spreaders & bars",
            Medieval: "Medieval Devices",
            "Bondage tape": "Bondage Tape",
            "Duct tape": "Duct Tape",
            "Cling film": "Cling Film",
            Tape: "Tape & wrapping",
            Blindfold: "Blindfolded restraint",
            Caging: "Caging/Confinement",
            Encasement: "Encasement Fetish",
            Crucifixion: "Crucifixion Play",
            Furniture: "Furniture restraint",
            "Breast bondage": "Breast Bondage",
            "Anal hooks": "Anal Hooks",
            "Self-bondage": "Self-Bondage",
            "Bondage art": "Bondage Art",
            "Mouth fingering": "Fingering mouths",
            "Road head": "Road Head",
            Training: "Anal Training",
            Fingering: "Anal fingering",
            "Anal fisting": "Anal fisting",
            "Mutual masturbation": "Mutual Masturbation",
            "Nipple play": "Nipple Play",
            Machines: "Fucking Machines",
            Stretching: "Vaginal Stretching",
            Fisting: "Vaginal fisting",
            Pumping: "Vacuum pumping",
            Urethral: "Urethral Fucking",
            "Female humiliation": "Female Humiliation",
            "SPH humiliation": "small penis humiliation",
            Hypnosis: "Hypnosis & mind-control fantasy",
            "Mind fucks": "Mind Fucks",
            "Mental bondage": "Mental Bondage",
            Praise: "Praise (in scene)"
        });
            /**
             * Stable catalog records: topic name -> {id, risk}. The
             * id is the topic's permanent opaque ID; risk marks
             * higher-risk practices needing specialized knowledge and
             * explicit negotiation.
             */
            const TAXONOMY_TOPIC_RECORDS = deriveTopicRecords(TAXONOMY_CATEGORIES);
            /** Cached loadTaxonomy() result; built once, then shared. */
            let taxonomyCache = null;
            /**
             * Deep-clone plain JSON-shaped taxonomy data so the stored
             * literals are never mutated by the merge.
             * @param {*} value - JSON-shaped value (the taxonomy data
             *   contains only strings, numbers, booleans, arrays and
             *   plain objects).
             * @returns {*} An independent deep copy of value.
             */
            function cloneTaxonomyData(value) {
                return JSON.parse(JSON.stringify(value));
            }
            /**
             * Apply the subcategory overlay to one category, in place:
             * attach subcategories and parentTopics, rebuild the topic
             * list as parent topics followed by subcategory topics,
             * and rekey topicDetails from display names back to
             * internal topic names. Identical operations, in the
             * identical order, to the pre-refactor inline merge.
             * @param {Object} category - A cloned category object.
             * @returns {void}
             */
            function applySubcategoryOverlay(category) {
                const parents = category.parentTopics || [];
                const subs = category.subcategories || [];
                if (subs.length) category.topics = parents.concat(subs.flatMap(sub => sub.topics || []));
                if (!(subs.length) && category.topicDetails && Object.keys(category.topicDetails).length) {
                    (category.topics || []).forEach(topic => {
                        if (!topic || "object" != typeof topic) return;
                        Object.defineProperty(topic, "toString", { value() { return this.name; }, enumerable: false });
                    });
                    return;
                }
                const details = {};
                (category.topics || []).forEach(topic => {
                    const name = topicName(topic);
                    if (!topic || "object" != typeof topic || !name) return;
                    const row = {};
                    Object.keys(topic).forEach(key => {
                        if (key === "name" || key === "id" || key === "risk") return;
                        row[key] = topic[key];
                    });
                    if (Object.keys(row).length) details[name] = row;
                });
                category.topicDetails = details;
                (category.topics || []).forEach(topic => {
                    if (!topic || "object" != typeof topic || topic.toString && topic.toString() === topic.name) return;
                    Object.defineProperty(topic, "toString", { value() { return this.name; }, enumerable: false });
                });
            }
            function loadTaxonomy() {
                if (taxonomyCache) return taxonomyCache;
                const categories = cloneTaxonomyData(TAXONOMY_CATEGORIES);
                categories.forEach(applySubcategoryOverlay);
                const topicById = new Map, topicByName = new Map, flatList = [];
                categories.forEach(category => {
                    const subcategoryByTopic = new Map;
                    (category.subcategories || []).forEach(sub => (sub.topics || []).forEach(topic => subcategoryByTopic.set(topicName(topic), sub.name)));
                    category.topics.forEach(topic => {
                        const name = topicName(topic);
                        const record = topic && "object" == typeof topic ? topic : (TAXONOMY_TOPIC_RECORDS[name] || {});
                        const entry = {
                            id: record.id || null,
                            name: name,
                            category: category.name,
                            subcategory: subcategoryByTopic.get(name) || null,
                            risk: record.risk === true,
                            details: (category.topicDetails || {})[name] || null
                        };
                        flatList.push(entry);
                        if (record.id) topicById.set(record.id, entry);
                        topicByName.set(name, entry);
                    });
                });
                return taxonomyCache = {
                    categories: categories,
                    topicById: topicById,
                    topicByName: topicByName,
                    flatList: flatList
                };
            }
            /**
             * Validate the stored tree. Topics are objects; names, order,
             * ids, and risk still have to satisfy the same counts.
             */
            function validate(taxonomy) {
                const data = taxonomy || loadTaxonomy();
                const errors = [];
                const counts = { categories: data.categories.length, subcategories: 0, topics: 0 };
                const seenIds = new Set(), seenNames = new Set();
                data.categories.forEach(category => {
                    if (!category || typeof category.name !== "string" || !category.name) {
                        errors.push("A category is missing its name.");
                    }
                    if (!Array.isArray(category.topics)) {
                        errors.push(`Category "${category && category.name}" has no topics array.`);
                        return;
                    }
                    counts.topics += category.topics.length;
                    const inCategory = new Set();
                    category.topics.forEach(topic => {
                        const name = topicName(topic);
                        if (typeof name !== "string" || !name) {
                            errors.push(`Category "${category.name}" contains a topic with no name.`);
                        }
                        if (inCategory.has(name)) {
                            errors.push(`Topic "${name}" appears twice in category "${category.name}".`);
                        }
                        inCategory.add(name);
                        if (seenNames.has(name)) {
                            errors.push(`Topic "${name}" appears in more than one category.`);
                        }
                        seenNames.add(name);
                        const record = topic && "object" == typeof topic && topic.id ? { id: topic.id, risk: topic.risk === true } : TAXONOMY_TOPIC_RECORDS[name];
                        if (!record) {
                            errors.push(`Topic "${name}" has no catalog record (missing ID).`);
                            return;
                        }
                        if (!/^t\d{4}$/.test(record.id || "")) {
                            errors.push(`Topic "${name}" has a malformed ID "${record.id}".`);
                        }
                        if (seenIds.has(record.id)) {
                            errors.push(`Topic ID "${record.id}" is assigned to more than one topic.`);
                        }
                        seenIds.add(record.id);
                        if (typeof record.risk !== "boolean") {
                            errors.push(`Topic "${name}" record is missing its risk flag.`);
                        }
                    });
                    (category.subcategories || []).forEach(sub => {
                        counts.subcategories++;
                        if (!sub.name) {
                            errors.push(`Category "${category.name}" has a subcategory with no name.`);
                        }
                        if (!sub.id) {
                            errors.push(`Category "${category.name}" subcategory "${sub.name}" has no stored id.`);
                        }
                        (sub.topics || []).forEach(topic => {
                            const name = topicName(topic);
                            if (!inCategory.has(name)) {
                                errors.push(`Subcategory "${sub.name}" topic "${name}" is not in category "${category.name}" (orphaned topic).`);
                            }
                        });
                    });
                    (category.parentTopics || []).forEach(topic => {
                        const name = topicName(topic);
                        if (!inCategory.has(name)) {
                            errors.push(`Parent topic "${name}" is not in category "${category.name}" (orphaned topic).`);
                        }
                    });
                });
                Object.keys(TAXONOMY_TOPIC_RECORDS).forEach(name => {
                    if (!seenNames.has(name)) {
                        errors.push(`Catalog record "${name}" (${TAXONOMY_TOPIC_RECORDS[name].id}) matches no taxonomy topic (orphaned record).`);
                    }
                });
                if (data.flatList.length !== counts.topics) {
                    errors.push(`flatList holds ${data.flatList.length} topics but the categories hold ${counts.topics}.`);
                }
                if (data.topicById.size !== seenIds.size) {
                    errors.push("topicById size does not match the number of unique topic IDs.");
                }
                if (counts.categories !== EXPECTED_COUNTS.categories) {
                    errors.push(`Expected ${EXPECTED_COUNTS.categories} categories, found ${counts.categories}.`);
                }
                if (counts.subcategories !== EXPECTED_COUNTS.subcategories) {
                    errors.push(`Expected ${EXPECTED_COUNTS.subcategories} subcategories, found ${counts.subcategories}.`);
                }
                if (counts.topics !== EXPECTED_COUNTS.topics) {
                    errors.push(`Expected ${EXPECTED_COUNTS.topics} topics, found ${counts.topics}.`);
                }
                return { valid: errors.length === 0, counts: counts, errors: errors };
            }
            return Object.freeze({
                EXPECTED_COUNTS: EXPECTED_COUNTS,
                loadTaxonomy: loadTaxonomy,
                validate: validate,
                topicRecords: TAXONOMY_TOPIC_RECORDS,
                subcategoryOverlay: deriveSubcategoryOverlay(TAXONOMY_CATEGORIES),
                displayNames: TAXONOMY_DISPLAY_NAMES
            });
        })();
        window.TaxonomyLoader = TaxonomyLoader;
        /* ================= TaxonomyLoader module — END ================= */
        // Taxonomy data lives in the TaxonomyLoader module above; h is the
        // loader's merged category tree (identical shape and content to the
        // previous inline definition), and g / m remain as aliases of the
        // loader's frozen subcategory overlay and display-name map.
        const h = TaxonomyLoader.loadTaxonomy().categories, g = TaxonomyLoader.subcategoryOverlay, m = TaxonomyLoader.displayNames;
        // Stable catalog identity. IDs are assigned once and stored here; they are never
        // derived from labels, hierarchy, or array order. New catalog topics must receive
        // max(existing numeric ID) + 1 and keep that ID permanently.
        const topicRecords = TaxonomyLoader.topicRecords, topicIdByLabel = Object.freeze(Object.fromEntries(Object.entries(topicRecords).map(([e, t]) => [ e, t.id ]))), topicLabelById = Object.freeze(Object.fromEntries(Object.entries(topicRecords).map(([e, t]) => [ t.id, e ]))), legacyTopicIdByOpaque = Object.freeze({
            "t0002": "topic-protocols-rules",
            "t0003": "topic-collars-symbols",
            "t0004": "topic-reward-correction",
            "t0005": "topic-discipline",
            "t0006": "topic-begging",
            "t0007": "topic-scene-based-roles",
            "t0008": "topic-ongoing-dynamics",
            "t0009": "topic-femdom",
            "t0010": "topic-d-s",
            "t0011": "topic-ordered-to-masturbate",
            "t0012": "topic-brats",
            "t0013": "topic-24-7",
            "t0014": "topic-switching",
            "t0015": "topic-male-authority",
            "t0016": "topic-behavior-modification",
            "t0017": "topic-female-supremacy",
            "t0018": "topic-play-punishment",
            "t0019": "topic-bathroom-use-control",
            "t0020": "topic-domestic-discipline",
            "t0021": "topic-pro-domme",
            "t0022": "topic-rope-bondage",
            "t0023": "topic-scarf-bondage",
            "t0024": "topic-hair-bondage",
            "t0025": "topic-cuffs",
            "t0026": "topic-spreaders",
            "t0027": "topic-medieval",
            "t0028": "topic-armbinders",
            "t0029": "topic-bondage-tape",
            "t0030": "topic-duct-tape",
            "t0031": "topic-cling-film",
            "t0032": "topic-mummification",
            "t0033": "topic-tape",
            "t0034": "topic-blindfold",
            "t0035": "topic-gags",
            "t0036": "topic-speech-restriction",
            "t0037": "topic-caging",
            "t0038": "topic-encasement",
            "t0039": "topic-sleepsacks",
            "t0040": "topic-immobilization",
            "t0041": "topic-crucifixion",
            "t0042": "topic-furniture",
            "t0043": "topic-suspension-bondage",
            "t0044": "topic-predicament-bondage",
            "t0045": "topic-escape-play",
            "t0046": "topic-breast-bondage",
            "t0047": "topic-anal-hooks",
            "t0048": "topic-self-bondage",
            "t0049": "topic-waterbondage",
            "t0050": "topic-bondage-art",
            "t0051": "topic-pain",
            "t0052": "topic-corporal-punishment",
            "t0053": "topic-impact-play",
            "t0054": "topic-percussion-play",
            "t0055": "topic-pressure-points",
            "t0056": "topic-hand-spanking",
            "t0057": "topic-otk-spanking",
            "t0058": "topic-breast-spanking",
            "t0059": "topic-clit-spanking",
            "t0060": "topic-pussy-spanking",
            "t0061": "topic-tit-slapping",
            "t0062": "topic-flogging",
            "t0063": "topic-fire-flogging",
            "t0064": "topic-whips",
            "t0065": "topic-belt-whippings",
            "t0066": "topic-breast-whipping",
            "t0067": "topic-caning",
            "t0068": "topic-riding-crops",
            "t0069": "topic-paddles-straps",
            "t0070": "topic-clamps",
            "t0071": "topic-clothespins",
            "t0072": "topic-pinching",
            "t0073": "topic-cutting",
            "t0074": "topic-needle-play",
            "t0075": "topic-corset-piercing",
            "t0076": "topic-scarification",
            "t0077": "topic-staples",
            "t0078": "topic-fish-hooks",
            "t0079": "topic-flesh-hooks",
            "t0080": "topic-cell-popping",
            "t0081": "topic-ball-kicking",
            "t0082": "topic-ballbusting",
            "t0083": "topic-cock-slapping",
            "t0084": "topic-cock-and-ball-torture",
            "t0085": "topic-fire-play",
            "t0086": "topic-knife-play",
            "t0087": "topic-waterboarding",
            "t0088": "topic-figging",
            "t0089": "topic-sounding",
            "t0090": "topic-trampling",
            "t0091": "topic-kicking",
            "t0092": "topic-bastinado",
            "t0093": "topic-hair-pulling",
            "t0094": "topic-abrasion-play",
            "t0095": "topic-bruises",
            "t0096": "topic-heavy-marking",
            "t0097": "topic-extreme-endurance",
            "t0098": "topic-wax-temperature",
            "t0099": "topic-ice-cool-touch",
            "t0100": "topic-tickling",
            "t0101": "topic-electrical-play",
            "t0102": "topic-texture-contrast",
            "t0103": "topic-sensory-deprivation",
            "t0104": "topic-sensory-overload",
            "t0105": "topic-asmr-whispering",
            "t0106": "topic-music-sound",
            "t0107": "topic-mirrors",
            "t0108": "topic-low-light",
            "t0109": "topic-scent",
            "t0110": "topic-tantra-energy-play",
            "t0111": "topic-violet-wand",
            "t0112": "topic-wartenberg-pinwheels",
            "t0113": "topic-panty-sniffing",
            "t0114": "topic-tens-unit",
            "t0115": "topic-smothering",
            "t0116": "topic-cupping",
            "t0117": "topic-auralism",
            "t0118": "topic-vampire-gloves",
            "t0119": "topic-smoking",
            "t0120": "topic-formiphilia",
            "t0121": "topic-abdl",
            "t0122": "topic-ddlg",
            "t0123": "topic-age-play",
            "t0124": "topic-infantilism",
            "t0125": "topic-caregiver",
            "t0126": "topic-mommy-girl",
            "t0127": "topic-authority-roles",
            "t0128": "topic-teacher-student",
            "t0129": "topic-doctor-nurse",
            "t0130": "topic-medical",
            "t0131": "topic-owner-property",
            "t0132": "topic-gor",
            "t0133": "topic-kidnapping",
            "t0134": "topic-cnc-fantasy",
            "t0135": "topic-damsels",
            "t0136": "topic-pet",
            "t0137": "topic-puppy",
            "t0138": "topic-pony",
            "t0139": "topic-piggy",
            "t0140": "topic-creature-fantasy",
            "t0141": "topic-1950s",
            "t0142": "topic-historical",
            "t0143": "topic-pirates",
            "t0144": "topic-victorian",
            "t0145": "topic-superheroes",
            "t0146": "topic-vampires",
            "t0147": "topic-clowns",
            "t0148": "topic-robots",
            "t0149": "topic-dollification",
            "t0150": "topic-librarians",
            "t0151": "topic-siblings",
            "t0152": "topic-latex-rubber",
            "t0153": "topic-leather",
            "t0154": "topic-pvc",
            "t0155": "topic-vinyl",
            "t0156": "topic-metal",
            "t0157": "topic-satin",
            "t0158": "topic-silk",
            "t0159": "topic-velvet",
            "t0160": "topic-lace",
            "t0161": "topic-denim",
            "t0162": "topic-fur",
            "t0163": "topic-lycra-spandex",
            "t0164": "topic-nylon",
            "t0165": "topic-boot",
            "t0166": "topic-heels-boots",
            "t0167": "topic-high-heels",
            "t0168": "topic-pumps",
            "t0169": "topic-retifism",
            "t0170": "topic-knee-high-socks",
            "t0171": "topic-socks",
            "t0172": "topic-business-suits",
            "t0173": "topic-military",
            "t0174": "topic-military-uniforms",
            "t0175": "topic-schoolgirl-uniform",
            "t0176": "topic-uniforms",
            "t0177": "topic-cosplay",
            "t0178": "topic-costume-transformation",
            "t0179": "topic-geisha",
            "t0180": "topic-steampunk",
            "t0181": "topic-lingerie-stockings",
            "t0182": "topic-fishnets",
            "t0183": "topic-pantyhose-stockings",
            "t0184": "topic-corsets",
            "t0185": "topic-diapers",
            "t0186": "topic-sissy-panties",
            "t0187": "topic-petticoats",
            "t0188": "topic-skirts",
            "t0189": "topic-gas-masks",
            "t0190": "topic-hoods",
            "t0191": "topic-costume-masks",
            "t0192": "topic-glasses",
            "t0193": "topic-anal-beads",
            "t0194": "topic-glass-dildos",
            "t0195": "topic-inflatables",
            "t0196": "topic-harnesses",
            "t0197": "topic-gloves",
            "t0198": "topic-chaps",
            "t0199": "topic-kilts",
            "t0200": "topic-zentai",
            "t0201": "topic-hands",
            "t0202": "topic-hands-gloves",
            "t0203": "topic-hair",
            "t0204": "topic-long-hair",
            "t0205": "topic-pigtails",
            "t0206": "topic-bald-girls",
            "t0207": "topic-head-shaving",
            "t0208": "topic-facial-hair",
            "t0209": "topic-beards",
            "t0210": "topic-body-hair",
            "t0211": "topic-pubic-hair",
            "t0212": "topic-depilation",
            "t0213": "topic-feet",
            "t0214": "topic-toes",
            "t0215": "topic-foot-worship",
            "t0216": "topic-boot-worship",
            "t0217": "topic-legs",
            "t0218": "topic-buttocks",
            "t0219": "topic-big-tits",
            "t0220": "topic-breasts",
            "t0221": "topic-large-labia",
            "t0222": "topic-pregnancy-focus",
            "t0223": "topic-makeup",
            "t0224": "topic-lipstick",
            "t0225": "topic-freckles",
            "t0226": "topic-armpits",
            "t0227": "topic-braces",
            "t0228": "topic-tongues",
            "t0229": "topic-bbw",
            "t0230": "topic-bbc",
            "t0231": "topic-muscles",
            "t0232": "topic-older-men",
            "t0233": "topic-older-women",
            "t0234": "topic-size-contrast",
            "t0235": "topic-uncut-cock",
            "t0236": "topic-body-modification",
            "t0237": "topic-body-worship",
            "t0238": "topic-muscle-worship",
            "t0239": "topic-degradation",
            "t0240": "topic-humiliation-language",
            "t0241": "topic-female-humiliation",
            "t0242": "topic-sph-humiliation",
            "t0243": "topic-objectification",
            "t0244": "topic-fear",
            "t0245": "topic-fear-play",
            "t0246": "topic-interrogation",
            "t0247": "topic-military-interrogation",
            "t0248": "topic-hypnosis",
            "t0249": "topic-mind-fucks",
            "t0250": "topic-mental-bondage",
            "t0251": "topic-emotional-sadism",
            "t0252": "topic-sadism",
            "t0253": "topic-affectionate-cruelty",
            "t0254": "topic-crying",
            "t0255": "topic-dacryphilia",
            "t0256": "topic-tears",
            "t0257": "topic-tearing-off-clothing",
            "t0258": "topic-anticipation-suspense",
            "t0259": "topic-trust",
            "t0260": "topic-attention",
            "t0261": "topic-blushing",
            "t0262": "topic-confession-secrets",
            "t0263": "topic-dirty-talk",
            "t0264": "topic-praise",
            "t0265": "topic-graphoerotica",
            "t0266": "topic-watching-being-watched",
            "t0267": "topic-private-photo-video",
            "t0268": "topic-performance-for-a-partner",
            "t0269": "topic-public-outdoor-play",
            "t0270": "topic-exhibition-voyeurism",
            "t0271": "topic-sexting",
            "t0272": "topic-burlesque",
            "t0273": "topic-sex-in-the-cemetery",
            "t0274": "topic-pin-ups",
            "t0275": "topic-fetish-models",
            "t0276": "topic-vintage-porn",
            "t0277": "topic-bellydancing",
            "t0278": "topic-threesomes",
            "t0279": "topic-group-encounters",
            "t0280": "topic-swinging",
            "t0281": "topic-cuckold-hotwife",
            "t0282": "topic-polyamory-with-kink",
            "t0283": "topic-group-service",
            "t0284": "topic-gangbang",
            "t0285": "topic-age-gap",
            "t0286": "topic-fmf-threesomes",
            "t0287": "topic-interracial-sex",
            "t0288": "topic-hotwife",
            "t0289": "topic-cuckold-humiliation",
            "t0290": "topic-morning-sex",
            "t0291": "topic-oral-sex",
            "t0292": "topic-facefucking",
            "t0293": "topic-facesitting",
            "t0294": "topic-rimming",
            "t0295": "topic-mouth-fingering",
            "t0296": "topic-road-head",
            "t0297": "topic-anal-sex",
            "t0298": "topic-training",
            "t0299": "topic-fingering",
            "t0300": "topic-anal-fisting",
            "t0301": "topic-pegging",
            "t0302": "topic-handjobs",
            "t0303": "topic-mutual-masturbation",
            "t0304": "topic-vaginal-fingering",
            "t0305": "topic-nipple-play",
            "t0306": "topic-penetration",
            "t0307": "topic-machines",
            "t0308": "topic-large-objects",
            "t0309": "topic-stretching",
            "t0310": "topic-fisting",
            "t0311": "topic-pumping",
            "t0312": "topic-urethral",
            "t0313": "topic-catheters",
            "t0314": "topic-facials",
            "t0315": "topic-creampies",
            "t0316": "topic-squirting",
            "t0317": "topic-69",
            "t0318": "topic-cowgirl",
            "t0319": "topic-doggystyle",
            "t0320": "topic-missionary",
            "t0321": "topic-reverse-cowgirl",
            "t0322": "topic-spooning",
            "t0323": "topic-standing-up",
            "t0324": "topic-queening",
            "t0325": "topic-gorean-slave-positions",
            "t0326": "topic-orgasm-control",
            "t0327": "topic-orgasm-denial",
            "t0328": "topic-chastity",
            "t0329": "topic-edging",
            "t0330": "topic-teasing",
            "t0331": "topic-breeding-pregnancy-fantasy",
            "t0332": "topic-surrogacy-fantasy",
            "t0333": "topic-oviposition-fantasy",
            "t0334": "topic-edge-play",
            "t0335": "topic-cock-milking",
            "t0336": "topic-tease-denial",
            "t0337": "topic-anal-chastity",
            "t0338": "topic-watersports",
            "t0339": "topic-lactation",
            "t0340": "topic-blood-play",
            "t0341": "topic-spit",
            "t0342": "topic-enemas",
            "t0343": "topic-breastfeeding",
            "t0344": "topic-creampie-cleanup",
            "t0345": "topic-toilet-slave",
            "t0346": "topic-liquor",
            "t0347": "topic-douching",
            "t0348": "topic-nyotaimori",
            "t0349": "topic-chocolate",
            "t0350": "topic-klismaphilia",
            "t0351": "topic-hunter-prey",
            "t0352": "topic-chase-scenes",
            "t0353": "topic-wrestling-struggle",
            "t0354": "topic-biting-scratching",
            "t0355": "topic-being-overpowered",
            "t0356": "topic-manhandling",
            "t0357": "topic-pursuit-take-down-capture",
            "t0358": "topic-primal",
            "t0359": "topic-acts-of-service",
            "t0360": "topic-domestic-service",
            "t0361": "topic-formal-etiquette",
            "t0362": "topic-grooming-rituals",
            "t0363": "topic-dressing-a-partner",
            "t0364": "topic-permission-rituals",
            "t0365": "topic-daily-tasks",
            "t0366": "topic-ceremonial-scenes",
            "t0367": "topic-spiritual-play",
            "t0368": "topic-foot-massage",
            "t0369": "topic-domestic-servitude",
            "t0370": "topic-french-maids",
            "t0371": "topic-maid",
            "t0372": "topic-crawling",
            "t0373": "topic-boot-blacking",
            "t0374": "topic-religious-play",
            "t0375": "topic-romantic-surrender",
            "t0376": "topic-seduction-scenarios",
            "t0377": "topic-strangers-fantasy",
            "t0378": "topic-secret-identity",
            "t0379": "topic-mythical-creatures",
            "t0380": "topic-aliens",
            "t0381": "topic-growth-shrinking-fantasy",
            "t0382": "topic-body-swapping-fantasy",
            "t0383": "topic-furry-transformation-fantasy",
            "t0384": "topic-gender-play",
            "t0385": "topic-crossdressing",
            "t0386": "topic-sissification",
            "t0387": "topic-celebrity-fantasy",
            "t0388": "topic-erotic-literature",
            "t0389": "topic-anime",
            "t0390": "topic-hentai",
            "t0391": "topic-writing-erotica",
            "t0392": "topic-transvestism",
            "t0393": "topic-androgyny",
            "t0394": "topic-butches",
            "t0395": "topic-psycholagny",
            "t0396": "topic-verbal-check-ins",
            "t0397": "topic-cuddling-touch",
            "t0398": "topic-food-hydration",
            "t0399": "topic-quiet-decompression",
            "t0400": "topic-praise-aftercare",
            "t0401": "topic-post-scene-review",
            "t0402": "topic-space-solitude",
            "t0403": "topic-next-day-check-in",
            "t0404": "topic-affection"
});
        // TAXONOMY_VERSION (E4a, slug-gap design-away, 2026-10-22): the
        // version identifier of the topic catalog above (403 topics, IDs
        // t0001-t0404). Every exported profile file carries it as its
        // top-level "taxonomyVersion", so a future reader knows which
        // catalog the file's topic ids and "topicNames" labels were
        // written against. Bump it whenever the catalog's topic set or a
        // topic's meaning changes.
        const TAXONOMY_VERSION = "2026-10-22";
        h.forEach(e => {
            e.topicDetails = e.topicDetails || {};
            e.topics.forEach(t => {
                const name = sxName(t);
                const n = t && "object" == typeof t && t.id ? { id: t.id, risk: t.risk === true } : topicRecords[name];
                if (!n || !n.id) throw new Error(`Missing stored topic record for "${name}". Assign the next permanent opaque ID before building.`);
                e.topicDetails[name] = Object.assign({}, e.topicDetails[name] || {}, n);
            });
        });
        window.__SEXCAPADES_TOPIC_CATALOG = Object.freeze({
            count: Object.keys(topicRecords).length,
            maxId: "t0404",
            idForLabel: e => topicIdByLabel[String(e || "")] || null,
            labelForId: e => topicLabelById[String(e || "")] || null
        });
        const f = Object.freeze([ "Orgasm & reproductive play", "Power exchange", "Service & ritual", "Connection & aftercare", "Psychological dynamics", "Primal & pursuit", "Impact, pain & body modification", "Bondage & restriction", "Sensation & atmosphere", "Body focus & appearance", "Clothing, materials & objects", "Roleplay & identity", "Fantasy & transformation", "Watching, exposure & settings", "Partner configurations", "Positions", "Sex acts", "Fluids & messy play" ]), y = new Map;
        f.forEach((e, t) => {
            h.some(t => t.name === e) && y.set(e, t);
        }), h.forEach(e => {
            y.has(e.name) || y.set(e.name, y.size);
        });
        const b = h.map(e => ({
            name: e.name,
            topics: e.topics.slice()
        })), v = window.__SEXCAPADES_PREVALENCE && "object" == typeof window.__SEXCAPADES_PREVALENCE ? window.__SEXCAPADES_PREVALENCE : {}, w = Object.keys(v).length ? v : V("prevalenceData"), k = window.__SEXCAPADES_POPULARITY_DATA && "object" == typeof window.__SEXCAPADES_POPULARITY_DATA ? window.__SEXCAPADES_POPULARITY_DATA : {}, x = Object.keys(k).length ? k : V("popularityData"), S = Object.freeze({
            joyal: 1516,
            lehmiller: 4175
        }), $ = e => Math.max(0, Number(e) || 0), E = e => Math.log1p(Math.max(0, Number(e) || 0));
        function A(e) {
            return Math.max(0, Math.min(1, e));
        }
        const C = e => {
            const t = Number(e);
            return Number.isFinite(t) ? A(t / 100) : null;
        }, M = e => String(e || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim(), I = Object.freeze({
            "Gender Play": [ "Genderplay" ],
            "Doctor/Nurse Play": [ "Doctor / nurse roleplay" ],
            Clamps: [ "Clamps and Clips" ],
            "Lycra/Spandex": [ "Spandex" ],
            "Suspension Bondage": [ "Suspension" ],
            "Hunter / prey": [ "Predator/prey" ],
            "Biting & scratching": [ "Scratch & bite play" ],
            "Wax & temperature": [ "Wax" ],
            "Electrical Play": [ "Electro sensation" ],
            Cutting: [ "artistic cutting", "decorative cutting" ],
            "Needle Play": [ "Needles & piercing", "Play Piercing", "Piercings" ],
            "Rope bondage": [ "Japanese bondage", "Hojojutsu", "Hemp Rope", "Decorative rope" ],
            Corsets: [ "Corsetry", "Corset Training", "Corset Cinching" ],
            "Body Modification": [ "Tattoos", "Tattoo & body modification focus" ],
            "Spiritual play": [ "Sex Magick", "Sacred Sexuality", "Spiritual BDSM" ],
            "Vintage Porn": [ "Victorian Pornography" ],
            Depilation: [ "Depilation/Shaving" ],
            Smoking: [ "Cigars" ]
        }), P = x.fetlife?.values || {}, L = x.fetlife?.aliases || {}, T = x.survey?.values || {}, F = new Map(Object.entries(P).map(([e, t]) => [ M(e), Number(t) ]));
        /* ===== Community snapshot check-before-accepting (Rank 3, 2026-10-30) =====
           A community snapshot is a frozen bundle of aggregated community
           rating counts per topic: the embedded survey block in
           popularityData (x.survey) and, when a host injects one, the
           window.__SEXCAPADES_COMMUNITY_POPULARITY override read by
           sxCommunityVal below. Either presentation is ONE O6 source
           (the "community" entry in q). Before either is accepted into
           the aggregate, this gate verifies (a) provenance, using only
           the fields the snapshot format already carries — generation
           (captured, as on the survey/reddit blocks and the popularity
           bundle itself) and identity (sampleSize, as on the survey
           block, or source, as on the prevalence entries) — and
           (b) that it does not include failed imports, using only the
           failed-import accounting the format already carries: a
           snapshot-level failed-import count, or a per-topic entry
           flagged as a failed import. No new snapshot format, no
           signature, and no new provenance field is invented here.
           Outcomes: an empty snapshot (the shipped state: no values)
           is nothing to accept and warns about nothing; a snapshot
           whose provenance is missing/unverifiable, or that carries a
           snapshot-level failed-import count, is refused whole — the
           community source then contributes nothing, exactly as if no
           snapshot had been supplied, and a visible banner states the
           reason; a snapshot whose only failed imports are separable
           per-topic entries is accepted with those entries excluded
           and a visible banner naming what was excluded. A sound
           snapshot is accepted with its values object passed through
           untouched: no count, weight, prior, or kinkiness math below
           changes. Nothing previously excluded is re-included: a
           refused or excluded entry never reaches H. The banner follows
           the existing boot-restore/save-error pattern in the shell
           (role="alert" aside, dismiss button, detail in the message),
           and the check result is exposed on
           window.__sxCommunitySnapshot for inspection. The gate runs
           once per snapshot (once for the embedded block; once per
           distinct override object, and again whenever an override
           object's gate-relevant content changes in place, so a
           snapshot injected or mutated after load is still checked
           before its next read). */
        function sxSnapHasText(v) {
            return ("string" == typeof v && v.trim().length > 0) || Number.isFinite(v);
        }
        function sxSnapFailedTotal(obj) {
            if (!obj || "object" != typeof obj) return { count: 0, field: null };
            const fields = [ "failedImports", "failedImportCount", "failedSubmissions", "failedCount", "importFailures" ];
            for (let k = 0; k < fields.length; k++) {
                const v = obj[fields[k]];
                const n = Array.isArray(v) ? v.length : Number(v);
                if (Number.isFinite(n) && n > 0) return { count: n, field: fields[k] };
            }
            return { count: 0, field: null };
        }
        function sxSnapEntryFailed(v) {
            return !!(v && "object" == typeof v && (v.failed === !0 || v.importFailed === !0 || v.failedImport === !0 || "failed" === v.status || "failed" === v.importStatus));
        }
        function sxSnapProvenanceMissing(prov) {
            const missing = [];
            if (!sxSnapHasText(prov && prov.captured)) missing.push("generation date (captured)");
            if (!(Number.isFinite(Number(prov && prov.sampleSize)) && Number(prov.sampleSize) > 0) && !sxSnapHasText(prov && prov.source)) missing.push("identity (sampleSize or source)");
            return missing;
        }
        function sxGateCommunitySnapshot(kind, values, prov, failedSrc) {
            const keys = values && "object" == typeof values ? Object.keys(values) : [];
            const base = { kind, status: "empty", accepted: !1, values: null, reasons: [], excluded: [], failedCount: 0, topicCount: 0 };
            if (!keys.length) return base;
            const failed = sxSnapFailedTotal(failedSrc || prov || {});
            const missing = sxSnapProvenanceMissing(prov);
            const excluded = [], kept = {};
            keys.forEach(k => { if (sxSnapEntryFailed(values[k])) excluded.push(k); else kept[k] = values[k]; });
            const reasons = [];
            if (failed.count > 0) reasons.push("includes " + failed.count + " failed import" + (1 === failed.count ? "" : "s") + " (" + failed.field + ") — failed-import submissions are excluded from O6, so the snapshot was not accepted");
            if (missing.length) reasons.push("missing provenance: " + missing.join("; ") + " — the snapshot could not be verified, so it was not accepted");
            if (excluded.length && !Object.keys(kept).length) reasons.push("every topic entry (" + excluded.length + ") is flagged as a failed import — the snapshot was not accepted");
            if (reasons.length) return Object.assign({}, base, { status: "refused", failedCount: failed.count, excluded, reasons });
            if (excluded.length) return Object.assign({}, base, { status: "accepted-excluded", accepted: !0, values: kept, topicCount: Object.keys(kept).length, excluded, reasons: [ "excluded " + excluded.length + " failed-import topic" + (1 === excluded.length ? "" : "s") + ": " + excluded.join(", ") ] });
            return Object.assign({}, base, { status: "accepted", accepted: !0, values, topicCount: keys.length });
        }
        function sxSnapshotBannerId(kind) {
            return "sxCommunitySnapshotWarning-" + String(kind || "snapshot").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        }
        function sxShowCommunitySnapshotWarning(title, message, kind) {
            try {
                if (typeof __sxErrLog === "function") __sxErrLog("community-snapshot", new Error(title + ": " + message));
                if (!document || !document.body) return;
                const prev = document.getElementById(sxSnapshotBannerId(kind));
                if (prev) {
                    const msg = prev.querySelector("[data-sx-snapshot-message]");
                    if (msg) msg.textContent = message;
                    const head = prev.querySelector("[data-sx-snapshot-title]");
                    if (head) head.textContent = title;
                    return;
                }
                const banner = document.createElement("aside");
                banner.id = sxSnapshotBannerId(kind);
                banner.setAttribute("role", "alert");
                banner.setAttribute("aria-live", "assertive");
                banner.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483647;width:min(680px,calc(100vw - 24px));box-sizing:border-box;background:#4b171b;color:#fff;border:2px solid #ff9a9a;border-radius:10px;padding:16px 48px 16px 18px;box-shadow:0 12px 36px rgba(0,0,0,.58);font:600 16px/1.45 'Source Sans 3',system-ui,sans-serif;";
                const head = document.createElement("strong");
                head.setAttribute("data-sx-snapshot-title", "");
                head.style.cssText = "display:block;font-size:20px;margin-bottom:4px;";
                head.textContent = title;
                const body = document.createElement("span");
                body.setAttribute("data-sx-snapshot-message", "");
                body.textContent = message;
                const close = document.createElement("button");
                close.type = "button";
                close.setAttribute("aria-label", "Dismiss community snapshot warning");
                close.textContent = "×";
                close.style.cssText = "position:absolute;top:8px;right:10px;border:0;background:transparent;color:#fff;font:700 28px/1 system-ui,sans-serif;cursor:pointer;padding:4px 8px;";
                close.addEventListener("click", function () { banner.remove(); });
                banner.appendChild(head);
                banner.appendChild(body);
                banner.appendChild(close);
                document.body.appendChild(banner);
                close.focus({ preventScroll: !0 });
            } catch (err) { if (typeof __sxErrLog === "function") __sxErrLog("community-snapshot-warning", err); }
        }
        function sxReportCommunitySnapshot(result) {
            if (!result) return;
            // One banner per snapshot kind, so the embedded and override
            // reports never overwrite each other; a kind whose latest
            // result is clean (accepted/empty) has its own banner
            // removed, so a stale refusal cannot outlive a re-gate.
            if ("refused" === result.status) sxShowCommunitySnapshotWarning("Community snapshot not accepted", "The community snapshot (" + result.kind + ") was not accepted into the community aggregate. " + result.reasons.join(" ") + " Community counts fall back to the other O6 sources and priors; nothing from this snapshot was used.", result.kind);
            else if ("accepted-excluded" === result.status) sxShowCommunitySnapshotWarning("Community snapshot accepted with exclusions", "The community snapshot (" + result.kind + ") was accepted with exclusions. " + result.reasons.join(" ") + " All other topics from the snapshot were used unchanged.", result.kind);
            else try { const el = document && document.getElementById(sxSnapshotBannerId(result.kind)); if (el) el.remove(); } catch (err) { if (typeof __sxErrLog === "function") __sxErrLog("community-snapshot-warning", err); }
        }
        const sxCommunitySnapshotStatus = { embedded: null, override: null };
        window.__sxCommunitySnapshot = sxCommunitySnapshotStatus;
        const sxEmbeddedSnapshot = sxGateCommunitySnapshot("embedded survey", T, { captured: (x.survey && x.survey.captured) || x.captured, sampleSize: x.survey && x.survey.sampleSize, source: x.survey && x.survey.source }, x.survey || {});
        sxCommunitySnapshotStatus.embedded = sxEmbeddedSnapshot;
        sxReportCommunitySnapshot(sxEmbeddedSnapshot);
        const sxSurveyValues = sxEmbeddedSnapshot.accepted && sxEmbeddedSnapshot.values ? sxEmbeddedSnapshot.values : {};
        const sxOverrideReserved = [ "captured", "sampleSize", "source", "confidence", "failedImports", "failedImportCount", "failedSubmissions", "failedCount", "importFailures" ];
        let sxOverrideCache = { ref: null, fingerprint: null, result: null };
        function sxOverrideFingerprint(g) {
            // Gate-relevant content only: provenance, failed-import
            // accounting, the topic-key set, and each entry's value,
            // sampleSize, and failed flags. A snapshot mutated in place
            // changes this fingerprint and is re-gated; an untouched
            // snapshot keeps its cached result.
            const parts = [ String(g.captured || ""), String(g.sampleSize || ""), String(g.source || ""), String(g.failedImports || ""), String(g.failedImportCount || ""), String(g.failedSubmissions || ""), String(g.failedCount || ""), Array.isArray(g.importFailures) ? g.importFailures.length : String(g.importFailures || "") ];
            const values = g.values && "object" == typeof g.values && !Array.isArray(g.values) ? g.values : g;
            Object.keys(values).sort().forEach(k => {
                if (sxOverrideReserved.indexOf(k) >= 0 && values === g) return;
                const v = values[k];
                parts.push(k + "=" + (v && "object" == typeof v ? [ v.value, v.sampleSize, v.failed, v.importFailed, v.failedImport, v.status, v.importStatus ].join(",") : String(v)));
            });
            return parts.join("|");
        }
        function sxCheckedOverrideSnapshot(g) {
            const fingerprint = sxOverrideFingerprint(g);
            if (sxOverrideCache.ref === g && sxOverrideCache.fingerprint === fingerprint) return sxOverrideCache.result;
            let values = g, prov = { captured: g.captured, sampleSize: g.sampleSize, source: g.source };
            if (g.values && "object" == typeof g.values && !Array.isArray(g.values)) values = g.values;
            else {
                const plain = {};
                Object.keys(g).forEach(k => { if (sxOverrideReserved.indexOf(k) < 0) plain[k] = g[k]; });
                values = plain;
            }
            const result = sxGateCommunitySnapshot("override", values, prov, g);
            sxCommunitySnapshotStatus.override = result;
            sxReportCommunitySnapshot(result);
            sxOverrideCache = { ref: g, fingerprint, result };
            return result;
        }
        function N(e, t = e => e) {
            const n = e.map(Number).filter(Number.isFinite).map(t);
            return n.length ? {
                min: Math.min(...n),
                max: Math.max(...n)
            } : {
                min: 0,
                max: 0
            };
        }
        const _ = e => Math.log1p(Math.max(0, Number(e) || 0)), D = N(Object.values(P), _), R = N(Object.values(sxSurveyValues).map(e => "object" == typeof e ? e.value : e));
        function O(e, t, n = e => e) {
            const i = Number(e);
            if (!Number.isFinite(i)) return null;
            const a = n(i), r = t.max - t.min;
            return r > 0 ? A((a - t.min) / r) : .5;
        }
        function B(e) {
            const t = F.get(M(e)), n = function(e, t) {
                const n = (e || []).map(e => t.get(M(e).replace(/^r /, ""))).filter(Number.isFinite);
                return n.length ? Math.max(...n) : null;
            }([ ...L[e] || [], ...I[e] || [] ], F), i = [ t, n ].filter(Number.isFinite);
            return i.length ? Math.max(...i) : null;
        }
        function j(e) {
            const t = [ e, ...I[e] || [] ].map(e => sxSurveyValues[e]).filter(e => null != e).sort((e, t) => Number(("object" == typeof t ? t.value : t) || 0) - Number(("object" == typeof e ? e.value : e) || 0))[0];
            if (null == t) return null;
            const n = "object" == typeof t ? Object.assign({}, t) : {
                value: t
            };
            return n.sampleSize = Math.max(0, Number(n.sampleSize) || Number(x.survey?.sampleSize) || 0), 
            n;
        }
        /* ===== O6 aggregated popularity (ruled 2026-10-29 17:11-17:30) =====
           Popularity = prevalence, aggregated per topic over ONLY the sources
           that have data for that topic (ignore-missing, ruled 17:30), weights
           renormalised over the present sources. Source weight = ln(sample
           size or count) x representativeness factor: anchors (Joyal 2015
           n=1,516; Lehmiller 2018 n=4,175) at 1.0, discounted sources
           (FetLife, Reddit, community ratings/survey merged into ONE source)
           at 0.5. Literature priors are provisional: the existing ordinal
           prior bands (PRIORS table, 403 topics) mapped to band centres and
           carried at a log-scale weight on the same scale as the data
           (ruled 2026-10-29): prior weight = 0.5 x ln(5) ≈ 0.80, factor
           0.5 like the discounted sources, replacing the fixed weight 5 —
           so a topic with no source data
           at all falls back to its prior alone, and a FetLife-only topic
           reads about 10% prior share, not 41%. Failed-import submissions are
           excluded entirely (import-engine maintenance only). Kinkiness =
           1 - popularity. This aggregate IS the Popularity List sort key
           (H below), replacing the old raw-size-weighted H. */
        const SX_O6_PRIORS = {"byId":{"t0002":0.35,"t0003":0.35,"t0004":0.35,"t0005":0.55,"t0006":0.55,"t0007":0.35,"t0008":0.35,"t0009":0.55,"t0010":0.55,"t0011":0.55,"t0012":0.55,"t0013":0.55,"t0014":0.55,"t0015":0.35,"t0016":0.35,"t0017":0.35,"t0018":0.35,"t0019":0.35,"t0020":0.35,"t0021":0.175,"t0022":0.55,"t0023":0.35,"t0024":0.175,"t0025":0.55,"t0026":0.35,"t0027":0.175,"t0028":0.35,"t0029":0.35,"t0030":0.35,"t0031":0.175,"t0032":0.35,"t0033":0.35,"t0034":0.55,"t0035":0.35,"t0036":0.35,"t0037":0.55,"t0038":0.175,"t0039":0.095,"t0040":0.35,"t0041":0.095,"t0042":0.35,"t0043":0.35,"t0044":0.35,"t0045":0.175,"t0046":0.35,"t0047":0.55,"t0048":0.35,"t0049":0.175,"t0050":0.35,"t0051":0.55,"t0052":0.35,"t0053":0.55,"t0054":0.095,"t0055":0.175,"t0056":0.55,"t0057":0.35,"t0058":0.55,"t0059":0.55,"t0060":0.55,"t0061":0.35,"t0062":0.55,"t0063":0.175,"t0064":0.55,"t0065":0.35,"t0066":0.35,"t0067":0.35,"t0068":0.35,"t0069":0.35,"t0070":0.35,"t0071":0.35,"t0072":0.35,"t0073":0.35,"t0074":0.35,"t0075":0.175,"t0076":0.175,"t0077":0.095,"t0078":0.095,"t0079":0.095,"t0080":0.03,"t0081":0.175,"t0082":0.35,"t0083":0.35,"t0084":0.55,"t0085":0.35,"t0086":0.35,"t0087":0.175,"t0088":0.175,"t0089":0.175,"t0090":0.175,"t0091":0.175,"t0092":0.175,"t0093":0.55,"t0094":0.175,"t0095":0.55,"t0096":0.35,"t0097":0.175,"t0098":0.35,"t0099":0.35,"t0100":0.55,"t0101":0.55,"t0102":0.35,"t0103":0.55,"t0104":0.35,"t0105":0.35,"t0106":0.35,"t0107":0.35,"t0108":0.35,"t0109":0.35,"t0110":0.35,"t0111":0.35,"t0112":0.35,"t0113":0.35,"t0114":0.35,"t0115":0.35,"t0116":0.175,"t0117":0.175,"t0118":0.175,"t0119":0.175,"t0120":0.03,"t0121":0.35,"t0122":0.35,"t0123":0.35,"t0124":0.175,"t0125":0.35,"t0126":0.35,"t0127":0.55,"t0128":0.55,"t0129":0.55,"t0130":0.35,"t0131":0.55,"t0132":0.095,"t0133":0.35,"t0134":0.35,"t0135":0.35,"t0136":0.35,"t0137":0.35,"t0138":0.175,"t0139":0.175,"t0140":0.35,"t0141":0.35,"t0142":0.35,"t0143":0.175,"t0144":0.175,"t0145":0.175,"t0146":0.35,"t0147":0.175,"t0148":0.095,"t0149":0.35,"t0150":0.35,"t0151":0.35,"t0152":0.55,"t0153":0.55,"t0154":0.175,"t0155":0.175,"t0156":0.175,"t0157":0.35,"t0158":0.35,"t0159":0.175,"t0160":0.55,"t0161":0.095,"t0162":0.175,"t0163":0.35,"t0164":0.35,"t0165":0.175,"t0166":0.55,"t0167":0.55,"t0168":0.35,"t0169":0.095,"t0170":0.55,"t0171":0.175,"t0172":0.35,"t0173":0.175,"t0174":0.35,"t0175":0.55,"t0176":0.35,"t0177":0.55,"t0178":0.35,"t0179":0.175,"t0180":0.175,"t0181":0.55,"t0182":0.55,"t0183":0.55,"t0184":0.55,"t0185":0.35,"t0186":0.35,"t0187":0.175,"t0188":0.55,"t0189":0.175,"t0190":0.35,"t0191":0.35,"t0192":0.35,"t0193":0.35,"t0194":0.35,"t0195":0.175,"t0196":0.35,"t0197":0.35,"t0198":0.095,"t0199":0.35,"t0200":0.095,"t0201":0.35,"t0202":0.35,"t0203":0.175,"t0204":0.35,"t0205":0.55,"t0206":0.175,"t0207":0.175,"t0208":0.35,"t0209":0.35,"t0210":0.35,"t0211":0.35,"t0212":0.35,"t0213":0.55,"t0214":0.35,"t0215":0.55,"t0216":0.35,"t0217":0.35,"t0218":0.55,"t0219":0.55,"t0220":0.55,"t0221":0.35,"t0222":0.35,"t0223":0.35,"t0224":0.35,"t0225":0.35,"t0226":0.35,"t0227":0.175,"t0228":0.35,"t0229":0.55,"t0230":0.35,"t0231":0.35,"t0232":0.35,"t0233":0.55,"t0234":0.35,"t0235":0.35,"t0236":0.35,"t0237":0.35,"t0238":0.175,"t0239":0.35,"t0240":0.35,"t0241":0.35,"t0242":0.35,"t0243":0.35,"t0244":0.35,"t0245":0.35,"t0246":0.35,"t0247":0.175,"t0248":0.35,"t0249":0.35,"t0250":0.35,"t0251":0.35,"t0252":0.55,"t0253":0.35,"t0254":0.35,"t0255":0.175,"t0256":0.35,"t0257":0.55,"t0258":0.35,"t0259":0.55,"t0260":0.55,"t0261":0.35,"t0262":0.35,"t0263":0.55,"t0264":0.55,"t0265":0.03,"t0266":0.55,"t0267":0.35,"t0268":0.35,"t0269":0.55,"t0270":0.55,"t0271":0.55,"t0272":0.55,"t0273":0.35,"t0274":0.35,"t0275":0.35,"t0276":0.35,"t0277":0.35,"t0278":0.55,"t0279":0.35,"t0280":0.35,"t0281":0.55,"t0282":0.35,"t0283":0.175,"t0284":0.55,"t0285":0.35,"t0286":0.55,"t0287":0.55,"t0288":0.55,"t0289":0.35,"t0290":0.55,"t0291":0.55,"t0292":0.35,"t0293":0.55,"t0294":0.55,"t0295":0.35,"t0296":0.55,"t0297":0.55,"t0298":0.55,"t0299":0.35,"t0300":0.175,"t0301":0.35,"t0302":0.55,"t0303":0.55,"t0304":0.55,"t0305":0.55,"t0306":0.55,"t0307":0.55,"t0308":0.175,"t0309":0.35,"t0310":0.35,"t0311":0.35,"t0312":0.175,"t0313":0.175,"t0314":0.35,"t0315":0.55,"t0316":0.55,"t0317":0.55,"t0318":0.55,"t0319":0.55,"t0320":0.55,"t0321":0.55,"t0322":0.55,"t0323":0.35,"t0324":0.35,"t0325":0.175,"t0326":0.55,"t0327":0.55,"t0328":0.55,"t0329":0.55,"t0330":0.55,"t0331":0.55,"t0332":0.175,"t0333":0.095,"t0334":0.55,"t0335":0.55,"t0336":0.55,"t0337":0.175,"t0338":0.175,"t0339":0.35,"t0340":0.175,"t0341":0.35,"t0342":0.55,"t0343":0.35,"t0344":0.35,"t0345":0.35,"t0346":0.35,"t0347":0.175,"t0348":0.095,"t0349":0.35,"t0350":0.095,"t0351":0.35,"t0352":0.35,"t0353":0.35,"t0354":0.55,"t0355":0.55,"t0356":0.35,"t0357":0.35,"t0358":0.35,"t0359":0.55,"t0360":0.35,"t0361":0.35,"t0362":0.35,"t0363":0.35,"t0364":0.35,"t0365":0.35,"t0366":0.35,"t0367":0.175,"t0368":0.55,"t0369":0.35,"t0370":0.35,"t0371":0.35,"t0372":0.35,"t0373":0.095,"t0374":0.175,"t0375":0.55,"t0376":0.55,"t0377":0.55,"t0378":0.35,"t0379":0.35,"t0380":0.35,"t0381":0.175,"t0382":0.175,"t0383":0.175,"t0384":0.35,"t0385":0.175,"t0386":0.35,"t0387":0.55,"t0388":0.55,"t0389":0.35,"t0390":0.35,"t0391":0.35,"t0392":0.35,"t0393":0.35,"t0394":0.175,"t0395":0.095,"t0396":0.55,"t0397":0.55,"t0398":0.55,"t0399":0.35,"t0400":0.35,"t0401":0.35,"t0402":0.35,"t0403":0.35,"t0404":0.55},"byLabel":{"protocols and rules":0.35,"collars and symbols":0.35,"reward and correction":0.35,"discipline":0.55,"begging":0.55,"scene based roles":0.35,"ongoing dynamics":0.35,"femdom":0.55,"d s":0.55,"ordered to masturbate":0.55,"brats":0.55,"24 7":0.55,"switching":0.55,"male authority":0.35,"behavior modification":0.35,"female supremacy":0.35,"play punishment":0.35,"bathroom use control":0.35,"domestic discipline":0.35,"pro domme":0.175,"rope bondage":0.55,"scarf bondage":0.35,"hair bondage":0.175,"cuffs and straps":0.55,"cuffs":0.55,"spreaders and bars":0.35,"spreaders":0.35,"medieval devices":0.175,"armbinders":0.35,"bondage tape":0.35,"duct tape":0.35,"cling film":0.175,"mummification":0.35,"tape and wrapping":0.35,"tape":0.35,"blindfolded restraint":0.55,"blindfold":0.55,"gags":0.35,"speech restriction":0.35,"caging confinement":0.55,"caging":0.55,"encasement fetish":0.175,"encasement":0.175,"sleepsacks":0.095,"immobilization":0.35,"crucifixion play":0.095,"crucifixion":0.095,"furniture restraint":0.35,"furniture":0.35,"suspension bondage":0.35,"predicament bondage":0.35,"escape play":0.175,"breast bondage":0.35,"anal hooks":0.55,"self bondage":0.35,"waterbondage":0.175,"bondage art":0.35,"pain":0.55,"corporal punishment":0.35,"impact play":0.55,"percussion play":0.095,"pressure points":0.175,"spanking":0.55,"hand spanking":0.55,"otk spanking":0.35,"breast spanking":0.55,"clit spanking":0.55,"pussy spanking":0.55,"tit slapping":0.35,"flogging":0.55,"fire flogging":0.175,"whips":0.55,"belt whippings":0.35,"breast whipping":0.35,"caning":0.35,"riding crops":0.35,"paddles and straps":0.35,"clamps":0.35,"clothespins":0.35,"pinching":0.35,"cutting":0.35,"needle play":0.35,"corset piercing":0.175,"scarification":0.175,"staples":0.095,"fish hooks":0.095,"flesh hooks":0.095,"cell popping":0.03,"ball kicking":0.175,"ballbusting":0.35,"cock slapping":0.35,"cock and ball torture":0.55,"fire play":0.35,"knife play":0.35,"waterboarding":0.175,"figging":0.175,"sounding":0.175,"trampling":0.175,"kicking":0.175,"bastinado":0.175,"hair pulling":0.55,"abrasion play":0.175,"bruises":0.55,"heavy marking":0.35,"extreme endurance":0.175,"wax and temperature":0.35,"ice and cool touch":0.35,"tickling":0.55,"electrical play":0.55,"texture contrast":0.35,"sensory deprivation":0.55,"sensory overload":0.35,"asmr and whispering":0.35,"music and sound":0.35,"mirrors":0.35,"low light":0.35,"scent":0.35,"tantra energy play":0.35,"violet wand":0.35,"wartenberg pinwheels":0.35,"panty sniffing":0.35,"tens unit":0.35,"smothering":0.35,"cupping":0.175,"auralism":0.175,"vampire gloves":0.175,"smoking":0.175,"formiphilia":0.03,"abdl":0.35,"ddlg":0.35,"age play between adults":0.35,"age play":0.35,"infantilism":0.175,"caregiver roles adults":0.35,"caregiver":0.35,"mommy girl":0.35,"authority roles":0.55,"teacher student roleplay":0.55,"teacher student":0.55,"doctor nurse play":0.55,"doctor nurse":0.55,"medical play":0.35,"owner and property":0.55,"owner property":0.55,"gor":0.095,"captivity kidnapping":0.35,"kidnapping":0.35,"consensual non consent fantasy":0.35,"cnc fantasy":0.35,"damsels in distress":0.35,"damsels":0.35,"pet play":0.35,"pet":0.35,"puppy play":0.35,"puppy":0.35,"pony play":0.175,"piggy play":0.175,"creature fantasy":0.35,"1950s household":0.35,"1950s":0.35,"historical fantasy":0.35,"historical":0.35,"pirates":0.175,"victorian lifestyles":0.175,"victorian":0.175,"superheroes":0.175,"vampires and gothic":0.35,"vampires":0.35,"clowns":0.175,"robots":0.095,"dollification":0.35,"librarians":0.35,"sister brother roleplay":0.35,"siblings":0.35,"latex and rubber":0.55,"leather":0.55,"pvc":0.175,"vinyl":0.175,"metal":0.175,"satin":0.35,"silk":0.35,"velvet":0.175,"lace":0.55,"denim":0.095,"fur":0.175,"lycra spandex":0.35,"nylonlegs and feet":0.35,"nylon":0.35,"boot":0.175,"heels and boots":0.55,"high heels":0.55,"pumps":0.35,"retifism":0.095,"knee high socks":0.55,"socks":0.175,"business suits":0.35,"military":0.175,"military uniforms":0.35,"schoolgirl uniform":0.55,"uniforms":0.35,"cosplay":0.55,"costume transformation":0.35,"geisha":0.175,"steampunk":0.175,"lingerie and stockings":0.55,"fishnets":0.55,"pantyhose stockings":0.55,"corsets":0.55,"diapers":0.35,"sissy panties":0.35,"petticoats":0.175,"skirts":0.55,"gas masks":0.175,"hoods":0.35,"masks and hoods":0.35,"costume masks":0.35,"glasses":0.35,"anal beads":0.35,"glass dildos":0.35,"inflatables":0.175,"harnesses":0.35,"gloves":0.35,"chaps":0.095,"kilts":0.35,"zentai":0.095,"hands":0.35,"hands and gloves":0.35,"hair":0.175,"long hair":0.35,"pigtails":0.55,"bald girls":0.175,"head shaving":0.175,"facial hair":0.35,"beards":0.35,"body hair":0.35,"pubic hair":0.35,"depilation":0.35,"feet and footwear":0.55,"feet":0.55,"toes and feet":0.35,"toes":0.35,"foot worship":0.55,"boot worship":0.35,"legs":0.35,"buttocks":0.55,"big tits":0.55,"breasts":0.55,"large labia":0.35,"pregnancy focus":0.35,"makeup":0.35,"lipstick":0.35,"freckles":0.35,"armpits":0.35,"braces":0.175,"tongues":0.35,"bbw":0.55,"bbc":0.35,"muscles":0.35,"older men":0.35,"older women":0.55,"size contrast":0.35,"uncut cock":0.35,"body modification":0.35,"body worship":0.35,"muscle worship":0.175,"degradation":0.35,"humiliation language":0.35,"female humiliation":0.35,"small penis humiliation":0.35,"sph humiliation":0.35,"objectification":0.35,"fear":0.35,"fear play":0.35,"interrogation":0.35,"military interrogation":0.175,"hypnosis and mind control fantasy":0.35,"hypnosis":0.35,"mind fucks":0.35,"mental bondage":0.35,"emotional sadism":0.35,"sadism":0.55,"affectionate cruelty":0.35,"crying":0.35,"dacryphilia":0.175,"tears":0.35,"tearing off clothing":0.55,"anticipation and suspense":0.35,"trust":0.55,"attention":0.55,"blushing":0.35,"confession and secrets":0.35,"dirty talk":0.55,"praise in scene":0.55,"praise":0.55,"graphoerotica":0.03,"watching and being watched":0.55,"private photo and video":0.35,"performance for a partner":0.35,"public and outdoor play":0.55,"exhibition voyeurism":0.55,"sexting":0.55,"burlesque":0.55,"sex in the cemetery":0.35,"pin ups":0.35,"fetish models":0.35,"vintage porn":0.35,"bellydancing":0.35,"threesomes":0.55,"group encounters":0.35,"swinging":0.35,"cuckold hotwife":0.55,"polyamory with kink":0.35,"group service":0.175,"gangbang":0.55,"age gap":0.35,"fmf threesomes":0.55,"interracial sex":0.55,"hotwife":0.55,"cuckold humiliation":0.35,"morning sex":0.55,"oral sex":0.55,"facefucking":0.35,"facesitting":0.55,"rimming":0.55,"fingering mouths":0.35,"mouth fingering":0.35,"road head":0.55,"anal sex":0.55,"anal training":0.55,"anal fingering":0.35,"anal fisting":0.175,"pegging":0.35,"handjobs":0.55,"mutual masturbation":0.55,"vaginal fingering":0.55,"nipple play":0.55,"penetration":0.55,"fucking machines":0.55,"large objects":0.175,"vaginal stretching":0.35,"vaginal fisting":0.35,"fisting":0.35,"vacuum pumping":0.35,"urethral fucking":0.175,"catheters":0.175,"facials":0.35,"creampies":0.55,"squirting":0.55,"69":0.55,"cowgirl":0.55,"doggystyle":0.55,"missionary":0.55,"reverse cowgirl":0.55,"spooning":0.55,"standing up":0.35,"queening":0.35,"gorean slave positions":0.175,"orgasm control":0.55,"orgasm denial":0.55,"chastity":0.55,"edging":0.55,"teasing":0.55,"breeding pregnancy fantasy":0.55,"surrogacy fantasy":0.175,"oviposition fantasy":0.095,"edge play":0.55,"cock milking":0.55,"tease and denial":0.55,"anal chastity":0.175,"watersports":0.175,"lactation":0.35,"blood play":0.175,"spit":0.35,"enemas":0.55,"breastfeeding":0.35,"creampie cleanup":0.35,"toilet slave":0.35,"liquor":0.35,"douching":0.175,"nyotaimori":0.095,"chocolate":0.35,"klismaphilia":0.095,"hunter prey":0.35,"chase scenes":0.35,"wrestling and struggle":0.35,"biting and scratching":0.55,"being overpowered":0.55,"manhandling":0.35,"pursuit take down and capture":0.35,"primal":0.35,"acts of service":0.55,"domestic service":0.35,"formal etiquette":0.35,"grooming rituals":0.35,"dressing a partner":0.35,"permission rituals":0.35,"daily tasks":0.35,"ceremonial scenes":0.35,"spiritual play":0.175,"foot massage":0.55,"domestic servitude":0.35,"french maids":0.35,"maid":0.35,"crawling":0.35,"boot blacking":0.095,"religious play":0.175,"romantic surrender":0.55,"seduction scenarios":0.55,"strangers fantasy":0.55,"secret identity":0.35,"mythical creatures":0.35,"aliens":0.35,"growth shrinking fantasy":0.175,"body swapping fantasy":0.175,"furry transformation fantasy":0.175,"gender play":0.35,"crossdressing":0.175,"sissification":0.35,"celebrity fantasy":0.55,"erotic literature":0.55,"anime":0.35,"hentai":0.35,"writing erotica":0.35,"transvestism":0.35,"androgyny":0.35,"butches":0.175,"psycholagny":0.095,"verbal check ins":0.55,"cuddling and touch":0.55,"food and hydration":0.55,"quiet decompression":0.35,"praise aftercare":0.35,"post scene review":0.35,"space and solitude":0.35,"next day check in":0.35,"affection":0.55}};
        const SX_O6_PRIOR_W = .5 * Math.log(5), SX_O6_LN_JOYAL = Math.log(1516), SX_O6_LN_LEHMILLER = Math.log(4175);
        function sxO6Prior(e) {
            // Prior resolved by topic id first: the label table misses
            // topics whose catalog label has no byLabel entry (e.g.
            // "Medieval"), while byId holds a prior for every topic.
            // Label lookup below is the fallback for non-catalog labels.
            const id = topicIdByLabel[String(e || "")];
            if (id) { const byId = SX_O6_PRIORS.byId[id]; if (Number.isFinite(byId)) return byId; }
            const v = SX_O6_PRIORS.byLabel[M(e)];
            if (Number.isFinite(v)) return v;
            const alts = I[e] || [];
            for (let k = 0; k < alts.length; k++) { const w = SX_O6_PRIORS.byLabel[M(alts[k])]; if (Number.isFinite(w)) return w; }
            return null;
        }
        const SX_REDDIT_VALUES = (x.reddit && x.reddit.values) || {}, SX_REDDIT_RANGE = N(Object.values(SX_REDDIT_VALUES).map(v => "object" == typeof v ? v.value : v));
        function sxRedditVal(e) {
            const t = [ e, ...I[e] || [] ].map(k => SX_REDDIT_VALUES[k]).filter(v => null != v).sort((a, b) => Number(("object" == typeof b ? b.value : b) || 0) - Number(("object" == typeof a ? a.value : a) || 0))[0];
            if (null == t) return null;
            const n = "object" == typeof t ? Object.assign({}, t) : { value: t };
            return n.sampleSize = Math.max(0, Number(n.sampleSize) || Number(x.reddit && x.reddit.sampleSize) || 0), n;
        }
        function sxCommunityVal(e) {
            const g = window.__SEXCAPADES_COMMUNITY_POPULARITY;
            if (g && "object" == typeof g) {
                const checked = sxCheckedOverrideSnapshot(g);
                if (checked && checked.accepted && checked.values) {
                    const t = [ e, ...I[e] || [] ].map(k => checked.values[k]).filter(v => null != v)[0];
                    if (null != t) { const n = "object" == typeof t ? Object.assign({}, t) : { value: t }; n.sampleSize = Math.max(0, Number(n.sampleSize) || 0); return n; }
                }
            }
            return j(e);
        }
        const q = Object.freeze([ {
            id: "fetlife",
            value: e => B(e),
            normalize: e => O(e, D, _),
            weight: e => .5 * E(e)
        }, {
            id: "joyal",
            value: e => ho(e, "joyal"),
            normalize: e => C(e && e.pct),
            weight: e => e ? SX_O6_LN_JOYAL : 0
        }, {
            id: "lehmiller",
            value: e => ho(e, "lehmiller"),
            normalize: e => C(e && e.pct),
            weight: e => e ? SX_O6_LN_LEHMILLER : 0
        }, {
            id: "reddit",
            value: e => sxRedditVal(e),
            normalize: e => O(e && e.value, SX_REDDIT_RANGE),
            weight: e => .5 * Math.log(Math.max(1, Number(e && e.sampleSize) || Number(e && e.value) || 0))
        }, {
            id: "community",
            value: e => sxCommunityVal(e),
            normalize: e => O(e && e.value, R),
            weight: e => .5 * Math.log(Math.max(1, Number(e && e.sampleSize) || 0))
        }, {
            id: "priors",
            value: e => sxO6Prior(e),
            normalize: e => Number.isFinite(e) ? A(e) : null,
            weight: () => SX_O6_PRIOR_W
        } ]);
        function H(e) {
            let t = 0, n = 0;
            return q.forEach(i => {
                const a = i.value(e);
                if (null == a) return;
                const r = i.normalize(a);
                if (!Number.isFinite(r)) return;
                const o = Math.max(0, Number(i.weight(a, e)) || 0);
                o && (t += r * o, n += o);
            }), n ? t / n : null;
        }
        /* ===== Zero-weight silent drop (Rank 4, 2026-10-30) =====
           A Reddit or community sample of size 1 or less weighs
           0.5 x ln(max(1, size)) = 0 in q, so it contributes nothing
           to H — and nothing said so. The weight formula itself is
           already continuous in the sample size (ln(1) = 0, rising
           gradually: 0.35 at 2, 0.55 at 3, 0.69 at 4, 1.15 at 10),
           so the 1-to-2 step is integer granularity, not a formula
           discontinuity; no weight is changed here and no new
           formula is invented, because keeping the size-2-and-above
           weights exactly as they are and the size-1 weight at zero
           pins the formula. What changes is visibility: this helper
           mirrors H's own decision (value present, normalisation
           finite, weight zero, effective size <= 1) and names the
           source and topic, and popularitySourceStats appends its
           notes to the single-topic breakdown (mark menu and
           tooltip) so a too-small sample is stated, not silent. */
        function sxO6TooSmallNotes(idOrLabel) {
            const label = topicLabelById[String(idOrLabel || "")] || String(idOrLabel || "");
            const notes = [];
            [ "reddit", "community" ].forEach(id => {
                const src = q.find(s => s.id === id);
                if (!src) return;
                const raw = src.value(label);
                if (null == raw) return;
                const entry = raw && "object" == typeof raw ? raw : { value: raw };
                if (!Number.isFinite(src.normalize(entry))) return;
                if (Math.max(0, Number(src.weight(entry, label)) || 0) > 0) return;
                const size = "reddit" === id ? Math.max(0, Number(entry.sampleSize) || Number(entry.value) || 0) : Math.max(0, Number(entry.sampleSize) || 0);
                if (size > 1) return;
                notes.push({ source: "reddit" === id ? "Reddit" : "Community", topic: label, sampleSize: size, weight: 0 });
            });
            return notes;
        }
        /* O6 score storage: the aggregate lives in memory only, computed by H
           on demand from the embedded source blocks (prevalenceData /
           popularityData) plus the priors table above; it recomputes on page
           load (the taxonomy sort below runs H over every topic) and whenever
           a caller re-reads it. There is no persisted copy and no background
           sync. Kinkiness is derived from the same value: 1 - popularity. */
        /* ONE popularity reader (Rank 1, 2026-10-30): every popularity /
           kinkiness read goes through sxTopicPopularity, by topic id
           with label as fallback. The aggregate itself is H (O6 sources
           and weights unchanged); the id path resolves the label from
           the catalog, so the prior inside H is the byId prior (see
           sxO6Prior). A label passed directly falls back to H(label).
           Kinkiness is 1 - popularity, from the same value. */
        function sxTopicPopularity(idOrLabel, labelFallback) {
            const key = String(idOrLabel || "");
            const lb = topicLabelById[key];
            if (lb) {
                const p = H(lb);
                if (null != p) return p;
                const pr = SX_O6_PRIORS.byId[key];
                return Number.isFinite(pr) ? pr : null;
            }
            if (labelFallback) return H(labelFallback);
            return H(key);
        }
        function sxTopicKinkiness(idOrLabel, labelFallback) {
            const p = sxTopicPopularity(idOrLabel, labelFallback);
            return null == p ? null : 1 - p;
        }
        window.__sxO6 = {
            popularity: sxTopicPopularity,
            kinkiness: sxTopicKinkiness,
            popularityById: sxTopicPopularity,
            kinkinessById: sxTopicKinkiness,
            tooSmallNotes: sxO6TooSmallNotes,
            communitySnapshot: sxCommunitySnapshotStatus
        };
        function W(e, t) {
            const n = Number.isFinite(e.score), i = Number.isFinite(t.score);
            return n !== i ? n ? -1 : 1 : n && i && e.score !== t.score ? t.score - e.score : String(e.label).localeCompare(String(t.label)) || e.index - t.index;
        }
        function U(e, t, n) {
            const i = n || (e => e?.label || e);
            return e.map((e, n) => ({
                value: e,
                index: n,
                score: t(e),
                label: i(e)
            })).sort(W).map(e => e.value);
        }
        function G(e, t) {
            return U(e, t);
        }
        function K(e) {
            const t = (e || []).map(H).filter(Number.isFinite);
            return t.length ? t.reduce((e, t) => e + t, 0) / t.length : null;
        }
        function z(e) {
            return K((e.topics || []).map(sxName));
        }
        function V(t) {
            try {
                return JSON.parse(e.byId(t)?.textContent || "{}");
            } catch (e) {
                return {};
            }
        }
        h.forEach(e => {
            e.topics = U(e.topics, e => sxTopicPopularity(topicIdByLabel[sxName(e)] || sxName(e)));
        }), h.splice(0, h.length, ...U(h, z, e => e.name));
        const Y = V("fetlifeGroupMappingData"), X = V("redditGroupMappingData"), Z = V("discordGroupMappingData"), Q = Object.keys(Y).length ? Y : window.__SEXCAPADES_FETLIFE_GROUPS && "object" == typeof window.__SEXCAPADES_FETLIFE_GROUPS ? window.__SEXCAPADES_FETLIFE_GROUPS : {}, J = Object.keys(X).length ? X : window.__SEXCAPADES_REDDIT_GROUPS && "object" == typeof window.__SEXCAPADES_REDDIT_GROUPS ? window.__SEXCAPADES_REDDIT_GROUPS : {}, ee = Object.keys(Z).length ? Z : window.__SEXCAPADES_DISCORD_GROUPS && "object" == typeof window.__SEXCAPADES_DISCORD_GROUPS ? window.__SEXCAPADES_DISCORD_GROUPS : {}, te = (() => {
            try {
                const t = JSON.parse(e.byId("communityCompletionTimeData")?.textContent || "{}"), n = e => Number.isFinite(Number(e)) && Number(e) > 0 ? Number(e) : null, i = e => Number.isFinite(Number(e)) && Number(e) >= 0 ? Number(e) : null;
                return {
                    median: n(t.median),
                    mean: n(t.mean),
                    sd: i(t.sd),
                    n: n(t.n)
                };
            } catch (e) {
                return {
                    median: null,
                    mean: null,
                    sd: null,
                    n: null
                };
            }
        })();
        function ne(e) {
            const t = Math.round(10 * e) / 10;
            return Number.isInteger(t) ? String(t) : t.toFixed(1);
        }
        !function() {
            const t = null !== te.median && null !== te.mean && null !== te.sd && null !== te.n;
            e.all("[data-list-rate-estimate-headline]").forEach(e => {
                e.textContent = t ? `Most explorers finish in ~${ne(te.median)} minutes. Pause anytime — partial profiles still make a functional hypermap.` : "Most people finish in less than an hour. Pause anytime — partial profiles still make a functional hypermap.";
            }), e.all("[data-list-rate-estimate-detail]").forEach(e => {
                e.hidden = !t, e.textContent = t ? `average ${ne(te.mean)} ± ${ne(te.sd)} min from ${Math.round(te.n)} explorers` : "";
            });
        }();
        const ie = {
            "decorative rope": "Shibari",
            "japanese-inspired bondage": "Shibari",
            "suspension bondage": "Suspension",
            "cuffs & straps": "Bondage",
            "spreader bars": "Bondage",
            "tape wrapping": "Bondage",
            mummification: "Bondage",
            "furniture restraint": "Bondage",
            "blindfolded restraint": "Bondage",
            "escape / immobilization": "Bondage",
            "paddles & straps": "Impact play",
            "riding crops": "Impact play",
            canes: "Caning",
            "switches & implements": "Impact play",
            "needle / piercing play": "Needle play",
            "heavy marking": "Cutting",
            "wax & temperature play": "Wax play",
            "ice & cold play": "Ice play",
            electrostimulation: "Sensation play",
            "sensory deprivation": "Sensation play",
            "sensory overload": "Sensation play",
            "feathers & light touch": "Sensation play",
            "soundscapes & music": "Sensation play",
            "massage & oils": "Massage",
            "dominant role": "Dominance",
            "submissive role": "Submission",
            slave: "Master/slave",
            "owner & property": "Master/slave",
            "caregiver & little roles": "Age play",
            "age play between adults": "Age play",
            "pet handler": "Pet play",
            "puppy play": "Puppy play",
            "pony play": "Pony Play",
            "doctor / patient": "Doctor/nurse",
            "teacher / student": "Teacher/student",
            "boss / employee": "Boss/secretary",
            "captivity scenarios": "Kidnapping",
            "consensual non-consent": "CNC",
            "interrogation scenes": "Interrogation",
            "police roleplay": "Police",
            "military roleplay": "Military",
            "religious roleplay": "Religious",
            "historical roleplay": "Historical",
            "latex & rubber": "Latex",
            "lingerie & stockings": "Lingerie",
            uniforms: "Uniform",
            "heels & boots": "Boots",
            diapers: "Diapers",
            "feet & footwear": "Feet",
            "muscle worship": "Worship",
            buttocks: "Ass worship",
            genderplay: "Feminization",
            sissification: "Sissy",
            "humiliation language": "Humiliation",
            "mindfucks & uncertainty": "Fear Play",
            objectification: "Objectification",
            degradation: "Degradation",
            "fear play": "Fear Play",
            begging: "Begging",
            "watching & being watched": "Voyeurism",
            "performance for a partner": "Exhibitionism",
            "public / outdoor exposure": "Exhibitionism",
            "exhibition / voyeurism": "Exhibitionism",
            threesomes: "Threesome",
            "group encounters": "Threesome",
            "cuckold / hotwife": "Hotwife",
            "polyamory with kink": "Polyamory",
            "anal fingering": "Anal play",
            rimming: "Anal play",
            "anal beads & plugs": "Anal play",
            "vaginal fisting": "Fisting",
            "anal fisting": "Fisting",
            facesitting: "Ass worship",
            "chastity devices": "Chastity",
            "orgasm control": "Cum control",
            "cum eating instructions": "CEI",
            "jerk-off instruction": "JOI",
            "foot worship": "Foot worship",
            "body worship": "Body worship",
            "blood play": "Blood play",
            watersports: "Watersports",
            "scat play": "Scat",
            "spiritual play": "Religious",
            "mythical creatures": "Fantasy",
            aliens: "Sci-fi",
            "furry transformation fantasy": "Furry",
            crossdressing: "Crossdressing"
        };
        function re(e) {
            const t = Array.isArray(e) ? e : [], n = new Set;
            return t.map(e => {
                if (!e || "object" != typeof e) return null;
                const t = String(e.url || "").trim(), i = String(e.name || "").trim(), a = String(e.scope || "Global").trim(), r = Number(e.tier) || 1;
                return /^https:\/\//i.test(t) && i && !n.has(t) ? (n.add(t), {
                    url: t,
                    name: i,
                    scope: a,
                    tier: r
                }) : null;
            }).filter(Boolean);
        }
        const oe = {
            fetlife: Q,
            reddit: J,
            discord: ee
        };
        function ce(e, t) {
            const n = oe[t];
            return n && Object.prototype.hasOwnProperty.call(n, e) ? re(n[e]) : [];
        }
        function de(e, t) {
            return ce(e, t)[0] || null;
        }
        const ue = [ [ "Power exchange", "Psychological dynamics" ], [ "Power exchange", "Service & ritual" ], [ "Power exchange", "Roleplay & identity" ], [ "Bondage & restriction", "Impact, pain & body modification" ], [ "Bondage & restriction", "Sensation & atmosphere" ], [ "Impact, pain & body modification", "Primal & pursuit" ], [ "Impact, pain & body modification", "Connection & aftercare" ], [ "Sensation & atmosphere", "Clothing, materials & objects" ], [ "Sensation & atmosphere", "Body focus & appearance" ], [ "Roleplay & identity", "Fantasy & transformation" ], [ "Roleplay & identity", "Clothing, materials & objects" ], [ "Clothing, materials & objects", "Body focus & appearance" ], [ "Psychological dynamics", "Primal & pursuit" ], [ "Psychological dynamics", "Connection & aftercare" ], [ "Watching, exposure & settings", "Partner configurations" ], [ "Watching, exposure & settings", "Clothing, materials & objects" ], [ "Partner configurations", "Sex acts" ], [ "Partner configurations", "Fantasy & transformation" ], [ "Sex acts", "Positions" ], [ "Sex acts", "Orgasm & reproductive play" ], [ "Sex acts", "Fluids & messy play" ], [ "Orgasm & reproductive play", "Fluids & messy play" ], [ "Primal & pursuit", "Fantasy & transformation" ], [ "Service & ritual", "Connection & aftercare" ] ];
        function pe(e) {
            const t = new Set, n = [];
            return (e || []).forEach(e => {
                if (!e || e.length < 2 || !e[0] || !e[1] || e[0] === e[1]) return;
                const i = [ String(e[0]), String(e[1]) ].sort().join("\0");
                t.has(i) || (t.add(i), n.push(e));
            }), n;
        }
        const he = [ [ "t0281", "t0240" ] ], ge = {
            "Power exchange": {
                color: "#ef806e",
                glyph: '<path class="icon-glyph" d="M5 17 7 8l5 5 5-5 2 9Z M7 20h10"/>'
            },
            "Bondage & restriction": {
                color: "#ee925f",
                glyph: '<path class="icon-glyph" d="M9.5 14.5 7 17a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4-.2 M14.5 9.5 17 7a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 .2 M8.5 15.5l7-7"/>'
            },
            "Impact, pain & body modification": {
                color: "#e5a45e",
                glyph: '<path class="icon-glyph" d="M12 2l2.2 6.1L20 5.6l-3.4 5.3 5.4 3.3-6.3.5.9 6.3-4.6-4.3L7.4 21l.9-6.3-6.3-.5 5.4-3.3L4 5.6l5.8 2.5Z"/>'
            },
            "Sensation & atmosphere": {
                color: "#d7c15c",
                glyph: '<path class="icon-glyph" d="M3 12c3-6 5 6 8 0s5 6 10 0"/>'
            },
            "Roleplay & identity": {
                color: "#a8c766",
                glyph: '<path class="icon-glyph" d="M4 7c4-2 6 1 8 1s4-3 8-1v6c0 5-4 8-8 8s-8-3-8-8Zm3 4h2m6 0h2m-8 5c2 1 4 1 6 0"/>'
            },
            "Clothing, materials & objects": {
                color: "#82c66e",
                glyph: '<path class="icon-glyph" d="M9 5a3 3 0 1 1 5 2l-1 1 8 6H3l8-6 M3 14v4h18v-4"/>'
            },
            "Body focus & appearance": {
                color: "#55c48a",
                glyph: '<path class="icon-glyph" d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 21v-5a6 6 0 0 1 12 0v5 M9 13l3 3 3-3"/>'
            },
            "Psychological dynamics": {
                color: "#55c4a8",
                glyph: '<path class="icon-glyph" d="M9 4a4 4 0 0 0-3 6 4 4 0 0 0 1 7 4 4 0 0 0 5 3V6a3 3 0 0 0-3-2Zm6 0a4 4 0 0 1 3 6 4 4 0 0 1-1 7 4 4 0 0 1-5 3 M7 10h3m4 3h3"/>'
            },
            "Watching, exposure & settings": {
                color: "#59beca",
                glyph: '<path class="icon-glyph" d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle class="icon-glyph" cx="12" cy="12" r="2.5"/>'
            },
            "Partner configurations": {
                color: "#5ab0da",
                glyph: '<path class="icon-glyph" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 21v-4a5 5 0 0 1 10 0v4m-2-7a5 5 0 0 1 10 3v4"/>'
            },
            "Sex acts": {
                color: "#6ca8df",
                glyph: '<path class="icon-glyph" d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-3l1 1 1-1a4 4 0 0 1 7 3Z"/>'
            },
            Positions: {
                color: "#809cdf",
                glyph: '<path class="icon-glyph" d="M5 7h12m0 0-3-3m3 3-3 3M19 17H7m0 0 3-3m-3 3 3 3"/>'
            },
            "Orgasm & reproductive play": {
                color: "#9a91df",
                glyph: '<path class="icon-glyph" d="M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3 3m8 8 3 3m0-14-3 3M8 16l-3 3"/><circle class="icon-glyph" cx="12" cy="12" r="3"/>'
            },
            "Fluids & messy play": {
                color: "#b188dd",
                glyph: '<path class="icon-glyph" d="M12 3S6 10 6 15a6 6 0 0 0 12 0c0-5-6-12-6-12Z M9 16c.5 1.5 1.5 2 3 2"/>'
            },
            "Primal & pursuit": {
                color: "#c985d2",
                glyph: '<path class="icon-glyph" d="M8 11c-3 0-4-4-2-5s4 2 4 4m6 1c3 0 4-4 2-5s-4 2-4 4M12 9c-2 0-5 5-5 8 0 2 2 3 5 1 3 2 5 1 5-1 0-3-3-8-5-8Z"/>'
            },
            "Service & ritual": {
                color: "#da7dbd",
                glyph: '<path class="icon-glyph" d="M6 16h12M8 16v-3a4 4 0 0 1 8 0v3m-9 4h10M12 4v3"/>'
            },
            "Fantasy & transformation": {
                color: "#e17da6",
                glyph: '<path class="icon-glyph" d="m5 19 10-10m-8 8 2 2m5-14 1.5 3L19 9l-3 1.5L15 14l-1.5-3L10 9.5 13 8Z"/>'
            },
            "Connection & aftercare": {
                color: "#ea7f8b",
                glyph: '<path class="icon-glyph" d="M12 20S4 15 4 9a4 4 0 0 1 7-3l1 1 1-1a4 4 0 0 1 7 3c0 6-8 11-8 11Z M8 13h2l1-3 2 6 1-3h2"/>'
            }
        }, me = e => `<path class="icon-glyph" d="${e}"/>`, fe = (e, t, n) => `<circle class="icon-glyph" cx="${e}" cy="${t}" r="${n}"/>`, ye = {
            compass: me("M8 2v12M2 8h12m-4-2-2 2-2 2 2-2Z"),
            checklist: me("M3 3h10v10H3Zm2 3 1 1 2-2m-3 5 1 1 2-2m2-3h2m-2 4h2"),
            key: me("M9 5a3 3 0 1 1-2 5l-4 4m2-2 1 1m1-3 1 1"),
            ring: fe(8, 8, 4) + me("M8 1v3m0 8v3"),
            medal: me("M5 2l3 4 3-4m-6 0h6M8 6l1.5 3 3.5.5-2.5 2.5.5 3-3-1.5L5 15l.5-3-2.5-2.5L6.5 9Z"),
            scale: me("M8 2v12M4 4h8M3 5 1 9h4L3 5Zm10 0-2 9h4l-2-9M5 14h6"),
            hands: me("M2 10c2-2 3-1 4 1l2 2 2-2c1-2 2-3 4-1M4 6v4m3-6v7m5-5v4"),
            stage: me("M2 4h12v9H2Zm0 3h12M5 4l2 3m3-3 2 3"),
            infinity: me("M2 8c2-4 4-4 6 0s4 4 6 0-4-4-6 0-4 4-6 0Z"),
            coil: me("M3 12c0-7 10-8 10-3 0 4-7 4-7 1 0-2 4-3 7-1"),
            bow: me("M8 7C5 2 1 3 3 7c-2 4 2 5 5 1 3 4 7 3 5-1 2-4-2-5-5 0Zm0 1-2 6m2-6 2 6"),
            knot: me("M3 5c3-3 7 3 10 0M3 11c3 3 7-3 10 0M5 3l6 10m0-10L5 13"),
            cuffs: fe(5, 8, 3) + fe(11, 8, 3) + me("M8 8h0"),
            spreader: me("M2 8h12M4 5v6m8-6v6"),
            tape: fe(7, 8, 5) + fe(7, 8, 2) + me("m11 11 3 3"),
            mouth: me("M2 8c3-3 9-3 12 0-3 4-9 4-12 0Zm3 0h6"),
            cocoon: me("M8 1c4 3 4 11 0 14-4-3-4-11 0-14Zm-3 4 6 2m-6 2 6 2"),
            chair: me("M4 2v7h8V5m-8 4v5m8-5v5M3 12h10"),
            blindfold: me("M2 6c4-2 8-2 12 0v4c-4 2-8 2-12 0Zm2 2h2m4 0h2"),
            lock: me("M4 7h8v7H4Zm2 0V5a2 2 0 0 1 4 0v2m-2 3v1.5"),
            hand: me("M4 8V4m2 4V2m2 6V3m2 5V5m0 1c3-2 4 0 2 3l-2 4H6c-2-1-3-3-3-5V6"),
            paddle: me("M3 3c2-2 6 2 4 4l-2 2Zm3 5 7 6"),
            tassel: me("M4 2c7 2 7 6 2 7m0 0 1 5m0-5 3 5m-4-5-2 5"),
            cane: me("M11 4c0-3 4-3 4 0M11 4 5 14"),
            crop: me("M3 13 11 5m0 0 2-3 2 2-3 2m-8 4 2 2m-3 1c-2-1-2-3 0-3"),
            lash: me("M3 3c8 1 11 6 4 11m0 0 1-4m-1 4 4-1"),
            clamp: me("M3 4h3l2 4 2-4h3M5 4v8m6-8v8M3 12h3m4 0h3"),
            claw: me("M3 4c0 5 2 7 3 9M8 3c-1 5 0 7 1 10m4-9c-2 4-2 6-1 9"),
            comb: me("M3 3h10v4H3Zm2 4v6m2-6v5m2-5v6m2-6v5"),
            needle: me("M3 13 12 4m0 0 2-2m-2 2 2 2M4 11l2 2"),
            target: fe(8, 8, 5) + fe(8, 8, 2) + me("M8 1v2m0 10v2"),
            shield: me("M8 2 13 4v4c0 3-2 5-5 6-3-1-5-3-5-6V4Zm-2 6 2 2 3-4"),
            flame: me("M8 14c-4-2-4-6-1-9 0 3 2 2 2-3 4 4 5 8-1 12Zm0 0c-2-1-2-3 0-5 2 2 2 4 0 5"),
            snow: me("M8 1v14M2 4l12 8M14 4 2 12M5 2l3 2 3-2m-6 12 3-2 3 2"),
            feather: me("M3 14C3 7 7 2 14 2c0 7-5 11-11 12Zm2-3 6-6M5 8h4m-2 2v-4"),
            bolt: me("M9 1 4 9h4l-1 6 5-8H8Z"),
            stripes: me("M2 4h12M2 8h12M2 12h12m-9-9v2m3 2v2m3 2v2"),
            muted: me("M3 6h3l3-3v10l-3-3H3Zm8 0 3 4m0-4-3 4"),
            burst: me("M8 1v4m0 6v4M1 8h4m6 0h4M3 3l3 3m4 4 3 3m0-10-3 3M6 10l-3 3"),
            whisper: me("M2 5c4-3 8-3 12 0M4 8c3-2 5-2 8 0m-6 3h4"),
            note: me("M6 3v8m0-6 7-2v7M3 13a3 2 0 1 0 3-2m4 1a3 2 0 1 0 3-2"),
            mirror: me("M4 2h8v11H4Zm2 3 4-1m-4 4 4-1M8 13v2"),
            moon: me("M11 2a6 6 0 1 0 3 10 6 6 0 0 1-3-10Z"),
            perfume: me("M6 2h4v3H6Zm-2 5h8v7H4Zm5 2c2 0 3 1 3 2"),
            energy: me("M8 1v14M5 4c0-2 6-2 6 0s-6 2-6 4 6 2 6 4-6 2-6 4") + fe(8, 4, 1) + fe(8, 8, 1) + fe(8, 12, 1),
            badge: me("M8 2 10 5l4 1-2 3 .5 4-4-.5L5 14l-1-4-2-3 4-2Z"),
            cradle: me("M3 7c1 5 9 5 10 0M2 7h12M5 12l-1 2m7-2 1 2"),
            clock: fe(8, 8, 5) + me("M8 5v3l2 2"),
            paw: me("M5 7C3 7 2.5 4.5 4 4s2.5 1 2.5 2.5m4.5.5c2 0 2.5-2.5 1-3s-2.5 1-2.5 2.5M8 6.5c-1.5 0-3.5 3.2-3.5 5 0 1.5 1.5 2 3.5.5 2 1.5 3.5 1 3.5-.5 0-1.8-2-5-3.5-5Z"),
            horse: me("M4 13V6l4-4 4 3-1 8H7m-3-7L2 3m10 2 2-2M7 7h1"),
            dog: me("M4 5 2 2v7c0 4 3 5 6 5s6-1 6-5V2l-2 3M6 8h0m4 0h0m-4 3h4"),
            house: me("M2 8 8 2l6 6v6H9v-4H7v4H2Z"),
            cross: me("M6 2h4v4h4v4h-4v4H6v-4H2V6h4Z"),
            book: me("M2 3h5c1 0 1 1 1 2v9c0-1-1-2-2-2H2Zm12 0H9c-1 0-1 1-1 2v9c0-1 1-2 2-2h4Z"),
            cage: me("M3 3h10v11H3Zm3 0v11m4-11v11M2 6h12"),
            consent: me("M3 9l3 3 7-8M2 4h5m4 8h3"),
            horns: me("M3 3c0 4 2 6 5 6s5-2 5-6m-9 9c2 2 6 2 8 0M6 7 4 4m6 3 2-3"),
            fangs: me("M3 5c3 2 7 2 10 0l-2 8-3-3-3 3Z"),
            scroll: me("M4 2h8v12H4c-3 0-3-4 0-4h8M5 5h5M5 8h4"),
            hide: me("M3 4 6 2l2 2 2-2 3 2-1 4 1 4-4 2-2-2-4 2-2-4 1-4Z"),
            droplet: me("M8 2S4 7 4 10a4 4 0 0 0 8 0c0-3-4-8-4-8Z"),
            stocking: me("M6 2h5v7c0 3-2 5-5 5H3v-3h3Z"),
            uniform: me("M4 3 7 2l1 3 1-3 3 1 2 3-2 2v6H4V8L2 6Z"),
            heel: me("M3 3h6c0 5 2 7 5 8v3H8v-2H3Z"),
            hood: me("M8 2c4 1 6 5 5 11H3C2 7 4 3 8 2Zm-3 7h2m2 0h2"),
            harness: me("M3 3l10 10M13 3 3 13M4 8h8M8 4v8"),
            diaper: me("M3 4h10l-2 9H5Zm0 2 4 3m6-3-4 3"),
            fork: me("M4 2v5m2-5v5M4 5h2v9m5-12v12m0-5h3"),
            fur: me("M2 12 5 3l2 5 2-6 2 6 3-5-1 10Z"),
            beads: me("M2 8c3-6 9-6 12 0") + fe(4, 6, 1) + fe(8, 4, 1) + fe(12, 6, 1) + fe(8, 12, 1),
            pump: me("M3 13V6h7v7M5 6V3h3v3m2 2 3-3m0 0v5m0 0 2 2"),
            shower: me("M3 6c0-4 6-4 6 0m0 0h4M7 9v1m3-1v2m3-2v1M6 13v1m4-1v1"),
            hanger: me("M6 3.5a2 2 0 1 1 3.5 1.3L9 5.5 14 9H2l5-3.5M2 9v2.5h12V9"),
            foot: me("M5 14c-3-2-1-7 1-9 2-3 5-1 4 2-1 4 4 4 3 6-2 2-6 2-8 1"),
            glove: me("M4 9V4m2 5V2m2 7V3m2 6V4m0 2c3-2 4 1 2 3l-2 4H6c-2-1-3-2-3-4"),
            chest: fe(6, 8, 3) + fe(10, 8, 3) + me("M3 12c3 2 7 2 10 0"),
            curves: me("M4 3c5 0 3 10 8 10M12 3C7 3 9 13 4 13"),
            resize: me("M2 5V2h3M2 2l4 4m8-1V2h-3m3 0-4 4M2 11v3h3m-3 0 4-4m8 1v3h-3m3 0-4-4"),
            muscle: me("M4 10c2-4 2-6 4-7v4c3-2 6 0 6 3 0 4-4 5-8 4-3-1-4-3-2-4Z"),
            tattoo: me("M8 3c5 0 5 8 0 8-4 0-4-5-1-5 3 0 3 8-3 8"),
            belly: me("M8 2c4 3 5 9 2 12M8 2C4 5 3 11 6 14M5 9h6"),
            star: me("M8 2l1.8 3.8L14 7l-3 2.8.8 4.2L8 12l-3.8 2 .8-4.2L2 7l4.2-1.2Z"),
            downTalk: me("M2 3h12v8H8l-3 3v-3H2Zm3 3h6M5 8h4"),
            shards: me("M8 2 6 7 2 8l4 2-1 4 3-2 3 2-1-4 4-2-4-1Z"),
            speech: me("M2 3h12v8H7l-3.5 2v-2H2Zm3 3h6m-6 2h4"),
            cube: me("m8 2 5 3v6l-5 3-5-3V5Zm-5 3 5 3 5-3M8 8v6"),
            pendulum: me("M3 2h10M8 2v5") + fe(8, 10, 3),
            eye: me("M1 8C4 4 12 4 15 8C12 12 4 12 1 8Z") + fe(8, 8, 1.6),
            question: me("M5 5c0-4 7-4 7 0 0 3-4 2-4 5m0 3h0"),
            hourglass: me("M4 2h8M4 14h8M5 2c0 4 2 4 3 6-1 2-3 2-3 6m6-12c0 4-2 4-3 6 1 2 3 2 3 6"),
            keyhole: fe(8, 6, 3) + me("m7 9-1 5h4L9 9"),
            watch: me("M2 8C5 4 11 4 16 8C11 12 5 12 2 8Zm7-4v8"),
            partnerEye: me("M1 7C4 4 12 4 15 7C12 10 4 10 1 7Z") + fe(8, 7, 1.5) + me("M5 13h6"),
            camera: me("M2 5h3l1-2h4l1 2h3v8H2Z") + fe(8, 9, 2.3),
            video: me("M2 4h9v8H2Zm9 3 3-2v6l-3-2Z"),
            spotlight: me("M6 2h4l2 5-4 7-4-7Zm-2 5h8M2 14h12"),
            tree: me("M8 2 3 9h3l-2 3h4v3h2v-3h3l-2-3h2Z"),
            pin: me("M8 14S4 9 4 6a4 4 0 0 1 8 0c0 3-4 8-4 8Z") + fe(8, 6, 1.5),
            curtains: me("M2 2h12M4 3c0 6-2 9-2 11h4V3m6 0c0 6 2 9 2 11h-4V3"),
            binocular: me("M3 5h3l1 3v4H2Zm10 0h-3L9 8v4h5ZM7 8h2"),
            split: me("M8 14 3 9c-4-4 2-8 5-4 3-4 9 0 5 4Zm0-9v9"),
            trio: me("M3 13v-2a3 3 0 0 1 6 0v2m-3-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4m4 6v-2a3 3 0 0 1 4-3m-2-2a2 2 0 1 0 0-4"),
            crowd: me("M2 13c0-4 3-5 6-3 3-2 6-1 6 3M4 7a2 2 0 1 1 0-4m4 5a2 2 0 1 1 0-4m4 3a2 2 0 1 1 0-4"),
            swap: me("M2 5h9m0 0L9 3m2 2L9 7m5 4H5m0 0 2-2m-2 2 2 2"),
            stag: me("M4 13V6L2 3m2 3 3-3m5 10V6l2-3m-2 3-3-3M6 9h4"),
            triangle: me("M8 2 14 13H2Zm0 3v5m0 2h0"),
            knot3: fe(8, 5, 3) + fe(5, 10, 3) + fe(11, 10, 3),
            tray: me("M2 11h12M4 11c0-5 8-5 8 0M8 4V2m-5 12h10"),
            many: me("M2 13c0-3 2-4 4-4s4 1 4 4m0 0c0-3 2-4 4-4M6 7a2 2 0 1 0 0-4m6 4a2 2 0 1 0 0-4"),
            homeHeart: me("M2 8 8 2l6 6v6H2Z M8 12S5 10 5 8c0-2 2-2 3-1 1-1 3-1 3 1 0 2-3 4-3 4Z"),
            finger: me("M6 13V5c0-2 3-2 3 0v4l2-1c2 0 3 2 2 4l-2 2H8Z"),
            tongue: me("M3 6c3 3 7 3 10 0M6 9v2c0 4 5 4 5 0V9"),
            cream: me("M3 12c0-3 2-4 4-4-1-3 4-5 4-1 3 1 3 5 0 6Z"),
            arrowMouth: me("M2 8c3-3 7-3 10 0-3 3-7 3-10 0Zm8-5 4 5-4 5"),
            splash: me("M8 2v4m-5 1 3 2m7-2-3 2M5 13c1-3 5-3 6 0"),
            mouthHand: me("M2 6c3-2 7-2 10 0-3 3-7 3-10 0m10 6c2-3 4-2 3 1l-1 2"),
            fist: me("M4 9V5m2 4V3m2 6V4m2 5V5m0 1c3-1 4 1 2 4l-2 4H6L3 10"),
            fistLock: me("M3 8h10v6H3Zm2 0V6a3 3 0 0 1 6 0v2M8 11h0"),
            handMotion: me("M3 12c2-5 5-7 9-8m-1-2 2 2-2 2M4 8l2 2-2 2"),
            strap: me("M3 4h10v3H3Zm2 3v7m6-7v7"),
            patHeart: me("M8 14S3 11 3 7c0-3 4-4 5-1 1-3 5-2 5 1 0 4-5 7-5 7Zm-6-1 4-3"),
            spray: me("M4 12c2-5 6-5 8 0M8 2v3M3 4l2 2m8-2-2 2"),
            enter: me("M3 3h7v3h3v4h-3v3H3Zm2 5h6M8 6l3 2-3 2"),
            dial: fe(8, 8, 5) + me("M8 8l3-3M8 2v2m4 1 1-1"),
            barred: me("M3 2h10v12H3Zm0 4h10m-7-4v12m4-12v12"),
            edge: me("M2 11c3-6 9-6 12 0M4 8v4m4-6v6m4-4v4"),
            lure: me("M2 5c4-3 8-3 12 0M5 8c2-2 4-2 6 0M8 10v4"),
            seed: me("M8 14V8c0-4 4-5 6-5 0 4-2 6-6 5C4 8 2 6 2 3c4 0 6 2 6 5"),
            egg: me("M8 2c3 0 5 6 5 9 0 4-10 4-10 0 0-3 2-9 5-9Z"),
            water: me("M2 10c2-3 4 3 6 0s4 3 6 0M8 2S5 6 5 8"),
            drops: me("M5 3S2 7 2 9a3 3 0 0 0 6 0c0-2-3-6-3-6Zm7 4s-2 3-2 4a2 2 0 0 0 4 0c0-1-2-4-2-4Z"),
            bowl: me("M2 8h12c0 4-3 6-6 6s-6-2-6-6Zm3-3c1-2 2 2 3 0s2 2 3 0"),
            bowArrow: me("M3 2c5 3 5 9 0 12M4 8h10m-3-3 3 3-3 3"),
            chase: me("M2 11c3-6 7-6 12 0M3 5h3m2-2h3m1 2h2"),
            wrestle: me("M5 5a2 2 0 1 0 0-4m6 4a2 2 0 1 0 0-4M2 14l3-6 3 3 3-3 3 6M5 8l3-2 3 2"),
            calendar: me("M3 3h10v11H3Zm0 4h10M5 1v4m6-4v4M6 10l2 2 3-3"),
            candle: me("M5 6h6v8H5Zm3-5c2 2 2 3 0 5-2-2-2-3 0-5"),
            lotus: me("M8 13c-4-1-6-4-6-7 3 0 5 1 6 4 1-3 3-6 6-7 1 4 0 7-3 9 2-1 4-1 6 0-1 4-4 7-9 7Z"),
            rose: me("M8 8c-5-1-4-6 0-5 4-1 5 4 0 5Zm0 0v6m0-3-3-1m3 2 3-2"),
            stranger: me("M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 14c0-4 10-4 10 0M4 6h8"),
            ufo: me("M3 8c1-4 9-4 10 0m-11 0h12c0 4-12 4-12 0M6 5c0-3 4-3 4 0"),
            swapBody: me("M4 4h8m0 0-2-2m2 2-2 2M12 12H4m0 0 2-2m-2 2 2 2M5 7v2m6-2v2"),
            ribbon: me("M5 2h6v5l-3 2-3-2Zm1 6-2 6 4-2 4 2-2-6"),
            hug: me("M5 6a2 2 0 1 0 0-4m6 4a2 2 0 1 0 0-4M2 13c1-5 4-6 6-2 2-4 5-3 6 2M4 8l4 4 4-4"),
            cloud: me("M4 12c-4 0-3-6 1-6 1-5 8-4 8 1 4 0 4 5 0 5Z"),
            chat: me("M2 3h12v8H7l-3.5 2v-2H2Zm3 3h6m-6 2h4"),
            cup: me("M3 5h8v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Zm8 1h2c2 0 2 4 0 4h-2"),
            bed: me("M2 6h12v7M3 13V4h4v4h7M3 9h11"),
            standing: me("M6 3a2 2 0 1 0 0-2m5 2a2 2 0 1 0 0-2M6 5v5l-2 4m2-4 2 4m3-9v5l-2 4m2-4 2 4M7 7h3"),
            heart: me("M14 5.5c0 4-6 7.5-6 7.5S2 9.5 2 5.5a3 3 0 0 1 5-2L8 4l1-1a3 3 0 0 1 5 2.5Z"),
            arrows: me("M2 5h9m0 0L9 3m2 2L9 7m3 4H5m0 0 2-2m-2 2 2 2")
        }, be = {
            "Power exchange": [ "compass", "checklist", "ring", "medal", "scale", "hands", "stage", "infinity" ],
            "Bondage & restriction": [ "coil", "bow", "knot", "cuffs", "spreader", "tape", "mouth", "cocoon", "chair", "blindfold", "key", "lock" ],
            "Impact, pain & body modification": [ "hand", "paddle", "tassel", "cane", "crop", "lash", "clamp", "claw", "comb", "needle", "target", "shield" ],
            "Sensation & atmosphere": [ "flame", "snow", "feather", "bolt", "stripes", "muted", "burst", "whisper", "note", "mirror", "moon", "perfume", "energy" ],
            "Roleplay & identity": [ "badge", "cradle", "clock", "paw", "horse", "dog", "house", "cross", "book", "cage", "consent", "horns", "fangs", "scroll" ],
            "Clothing, materials & objects": [ "hide", "droplet", "stocking", "uniform", "heel", "hood", "harness", "diaper", "fork", "fur", "beads", "pump", "shower", "ribbon" ],
            "Body focus & appearance": [ "foot", "glove", "comb", "chest", "curves", "hands", "resize", "muscle", "tattoo", "belly" ],
            "Psychological dynamics": [ "star", "downTalk", "shards", "speech", "cube", "pendulum", "eye", "question", "hourglass", "keyhole" ],
            "Watching, exposure & settings": [ "watch", "camera", "spotlight", "tree", "curtains" ],
            "Partner configurations": [ "trio", "crowd", "swap", "stag", "knot3", "tray", "many", "clock" ],
            "Sex acts": [ "finger", "tongue", "cream", "arrowMouth", "chair", "splash", "mouthHand", "fist", "fistLock", "handMotion", "strap", "spray", "glove", "ring", "mouth", "enter" ],
            Positions: [ "knot3", "horse", "dog", "bed", "swap", "hug", "standing" ],
            "Orgasm & reproductive play": [ "dial", "barred", "lock", "edge", "lure", "seed", "cradle", "egg" ],
            "Fluids & messy play": [ "water", "cradle", "target", "drops" ],
            "Primal & pursuit": [ "bowArrow", "chase", "wrestle", "claw" ],
            "Service & ritual": [ "hands", "house", "checklist", "comb", "hanger", "key", "calendar", "candle", "lotus" ],
            "Fantasy & transformation": [ "heart", "rose", "stranger", "keyhole", "horns", "ufo", "resize", "swapBody", "paw", "arrows", "hanger", "ribbon", "star" ],
            "Connection & aftercare": [ "chat", "hug", "cup", "cloud", "star", "checklist", "moon", "calendar" ]
        }, ve = new Map;
        b.forEach(e => e.topics.forEach((t, n) => ve.set(e.name + "\0" + t, (be[e.name] || [])[n] || "star")));
        const we = {
            "Power exchange": "crown",
            "Bondage & restriction": "chain links",
            "Impact, pain & body modification": "paddle",
            "Sensation & atmosphere": "wave",
            "Roleplay & identity": "mask",
            "Clothing, materials & objects": "hanger",
            "Body focus & appearance": "person",
            "Psychological dynamics": "brain",
            "Watching, exposure & settings": "eye",
            "Partner configurations": "two people",
            "Sex acts": "heart",
            Positions: "opposing arrows",
            "Orgasm & reproductive play": "burst",
            "Fluids & messy play": "droplet",
            "Primal & pursuit": "paw",
            "Service & ritual": "service bell",
            "Fantasy & transformation": "wand and spark",
            "Connection & aftercare": "heart and pulse"
        }, ke = {
            downTalk: "speech bubble",
            partnerEye: "eye and partner",
            arrowMouth: "arrow and mouth",
            mouthHand: "mouth and hand",
            fistLock: "locked fist",
            handMotion: "moving hand",
            patHeart: "hand and heart",
            bowArrow: "bow and arrow",
            homeHeart: "home and heart",
            swapBody: "swapping figures",
            knot3: "three linked circles",
            many: "group of people",
            cream: "cream swirl",
            enter: "entering arrow",
            barred: "barred frame",
            edge: "rising arcs",
            lure: "rippled lines",
            seed: "sprouting seed",
            drops: "two droplets",
            watch: "watching eye",
            hide: "animal hide",
            curves: "body curves",
            resize: "expanding arrows",
            downTalk: "speech bubble",
            keyhole: "keyhole",
            split: "split heart",
            cradle: "cradle",
            standing: "two standing figures",
            arrows: "crossing arrows",
            energy: "energy flow",
            lotus: "lotus"
        };
        function xe(e) {
            return ke[e] || e.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\d+/g, "").trim();
        }
        const Se = {
            black: "black",
            darkBlue: "dark blue",
            lightBlue: "light blue",
            red: "red",
            grey: "gray",
            yellow: "yellow",
            brown: "brown",
            purple: "purple",
            orange: "orange",
            white: "white",
            pink: "pink",
            green: "green",
            hunterGreen: "hunter green",
            neutral: "neutral gray",
            noCode: "dark charcoal"
        };
        function $e(e, t, n, i, a) {
            const r = [ `${"Category" === e.kind ? we[e.branch] || "branch symbol" : xe(t.key)}: ${"Category" === e.kind ? "branch" : "topic"} symbol for ${e.label}.` ], o = Se[i.key] || "hanky";
            t && t.glyphFallback && r.push("The star symbol is shown because no symbol is assigned here.");
            return "Category" === e.kind ? r.push("noCode" === i.key ? "Dark-charcoal icon: no children have a hanky code." : `${o} icon: predominant hanky color among coded child topics${i.mixed ? "; dashed spoke means the coded children vary widely" : ""}.`) : r.push("noCode" === i.key ? "Dark-charcoal icon: this topic has no hanky code." : `${o} icon: this topic’s hanky-code color.`), 
            r.push(null === n ? "Spoke color follows the hanky code; a dashed charcoal spoke means no code." : "Green-to-yellow-to-red spoke: current rating colors."), 
            "favorite" === a ? r.push("★ marks a Favorite.") : "notinterested" === a ? r.push("⊘ marks Not Interested: not for this person, but not a hard boundary.") : "limit" === a && r.push("× marks a hard Limit."), 
            e.risk && r.push("* marks a higher-risk practice needing specialized knowledge and explicit negotiation."), 
            r.join(" ");
        }
        
        const Ee = Object.freeze({
            Materials: "stripes",
            Footwear: "heel",
            "Uniforms & costumes": "uniform",
            "Lingerie & hosiery": "stocking",
            Undergarments: "ribbon",
            "Masks & headwear": "hood",
            "Objects/toys": "beads",
            "Hand spanking": "hand",
            "Flexible implements": "tassel",
            "Rigid implements": "paddle",
            "Clamps & pinching": "clamp",
            "Cutting & piercing": "needle",
            "Genital pain": "target",
            Extreme: "flame",
            "Head hair": "comb",
            "Facial & body hair": "fur",
            "Lower body": "foot",
            Torso: "chest",
            Face: "mirror",
            "Body type": "curves",
            Worship: "hands",
            "Caregiver & little roles": "cradle",
            Authority: "badge",
            Captivity: "cage",
            Animal: "paw",
            "Historical & fantasy": "scroll",
            "Flexible ties": "coil",
            Restraints: "cuffs",
            "Tape & wrapping": "tape",
            Sensory: "blindfold",
            Confinement: "cocoon",
            "Challenge bondage": "hourglass",
            Specialty: "harness",
            Oral: "mouth",
            Anal: "ring",
            Manual: "finger",
            Insertion: "enter",
            Fluids: "droplet",
            Humiliation: "downTalk",
            Intimidation: "horns",
            "Mind control": "pendulum",
            Emotional: "heart",
            Vulnerability: "keyhole",
            Verbal: "speech"
        });
        function Ae(e, t) {
            const n = Ee[e] || "star", _glyphFallback = !(e in Ee) || !(n in ye), i = ge[t] || {};
            const c = h.find(c => c.name === t), s = c && (c.subcategories || []).find(s => s.name === e), p = s ? fpSub(s.topics, t) : null;
            if (p) return {
                glyph: ye[n] || ye.star,
                glyphFallback: _glyphFallback,
                accent: "",
                color: p.color,
                lineColor: p.lineColor || p.color,
                labelColor: p.labelColor || p.color,
                labelStroke: p.labelStroke,
                hankyKey: p.key,
                key: n,
                mixed: p.mixed
            };
            const fallbackColor = i.color || Ga.NO_CODE_COLOR;
            return {
                glyph: ye[n] || ye.star,
                glyphFallback: _glyphFallback,
                accent: "",
                color: fallbackColor,
                lineColor: fallbackColor,
                labelColor: fallbackColor,
                labelStroke: "#151816",
                hankyKey: (Ne.get(t) || {}).key || "subcategory",
                key: n
            };
        }
        // Glyph-map integrity (map-render refactor, finding 13): the
        // ye glyph dictionary is the single source for glyph names.
        // Every value in the be branch-glyph lists and the Ee
        // subcategory-glyph map must exist in it, and Ee must cover
        // every subcategory in the taxonomy and no other name, so a
        // typo in any table fails loudly at boot instead of silently
        // falling back to the "star" glyph at render time.
        for (const _subName of Object.keys(Ee)) {
            if (!(Ee[_subName] in ye)) throw new Error(`Sexcapades glyph check: subcategory "${_subName}" maps to glyph "${Ee[_subName]}", which is missing from the ye glyph dictionary`);
        }
        for (const _branchName of Object.keys(be)) {
            for (const _glyphName of be[_branchName]) {
                if (!(_glyphName in ye)) throw new Error(`Sexcapades glyph check: branch "${_branchName}" lists glyph "${_glyphName}", which is missing from the ye glyph dictionary`);
            }
        }
        const _glyphSubNames = new Set;
        h.forEach(_cat => (_cat.subcategories || []).forEach(_sub => _glyphSubNames.add(_sub.name)));
        for (const _subName of _glyphSubNames) {
            if (!(_subName in Ee)) throw new Error(`Sexcapades glyph check: subcategory "${_subName}" has no entry in the Ee subcategory-glyph map and would fall back to the star glyph`);
        }
        for (const _subName of Object.keys(Ee)) {
            if (!_glyphSubNames.has(_subName)) throw new Error(`Sexcapades glyph check: Ee maps "${_subName}", which is not a subcategory in the taxonomy`);
        }
        function fpSub(topics, branch) {
            const t = new Map;
            let n = 0;
            if ((topics || []).forEach(i => {
                const a = Le(i, branch).key;
                "noCode" !== a && (n += 1, t.set(a, (t.get(a) || 0) + 1));
            }), !n) return null;
            const i = Math.max(...t.values()), a = Array.from(t.entries()).filter(([, e]) => e === i).map(([e]) => e), r = Me[branch], o = r && a.includes(r) ? r : a[0], s = 1 !== a.length || i / n < .5;
            return {
                key: o,
                ...(Ce[o] || Ce.neutral),
                mixed: s
            };
        }
        const Ce = {
            black: {
                color: "#111514",
                labelStroke: "#dce1dd"
            },
            darkBlue: {
                color: "#2f6fd3",
                labelStroke: "#18202b"
            },
            lightBlue: {
                color: "#69bdf0",
                labelStroke: "#17242c"
            },
            red: {
                color: "#e55252",
                labelStroke: "#2b1718"
            },
            grey: {
                color: "#929a96",
                labelStroke: "#1c211e"
            },
            yellow: {
                color: "#f0cf3f",
                labelStroke: "#2e2812"
            },
            brown: {
                color: "#a86a3e",
                labelStroke: "#251a14"
            },
            purple: {
                color: "#ad62d4",
                labelStroke: "#241629"
            },
            orange: {
                color: "#ed8a2c",
                labelStroke: "#2a1d12"
            },
            white: {
                color: "#f2f0e8",
                labelStroke: "#242925"
            },
            pink: {
                color: "#ed7db7",
                labelStroke: "#2a1822"
            },
            green: {
                color: "#4cba73",
                labelStroke: "#17261d"
            },
            hunterGreen: {
                color: "#28734d",
                labelStroke: "#d9e1dc"
            },
            neutral: {
                color: "#aeb5b0",
                labelStroke: "#1b201d"
            }
        }, Me = {
            "Power exchange": "hunterGreen",
            "Bondage & restriction": "grey",
            "Impact, pain & body modification": "black",
            "Service & ritual": "green"
        }, Ie = new Map;
        Object.entries({
            black: [ "Wax & temperature", "Electrical Play", "Sensory overload", "Consensual non-consent fantasy", "Fear Play", "Interrogation", "Blood play", "Wrestling & struggle", "Biting & scratching" ],
            darkBlue: [ "Anal beads", "Anal fingering", "Rimming", "Anal sex" ],
            lightBlue: [ "Facefucking", "Facesitting", "Facials", "Fingering mouths", "Oral sex" ],
            red: [ "Vaginal fisting", "Anal fisting" ],
            grey: [ "Sensory deprivation", "Captivity / kidnapping" ],
            yellow: [ "Watersports" ],
            brown: [],
            purple: [ "Needle Play", "Body Modification" ],
            orange: [ "Penetration" ],
            white: [ "Handjobs" ],
            pink: [ "Pumps", "Pegging" ],
            green: [ "Group service", "Spiritual play" ],
            hunterGreen: [ "Authority roles", "Caregiver roles (adults)", "Age play between adults", "Pet play", "Pony Play", "Puppy play", "Owner & property", "Doctor/Nurse Play", "Teacher / student roleplay", "Hunter / prey" ],
            neutral: [ "Tantra / energy play" ]
        }).forEach(([e, t]) => t.forEach(t => Ie.set(t, e)));
        const Pe = {
            key: "noCode",
            color: "#232726",
            lineColor: "#78817e",
            labelColor: "#aeb5b0",
            labelStroke: "#1b201d"
        };
        function Le(e, t) {
            const n = Ie.get(e) || Me[t];
            if (!n) return {
                ...Pe
            };
            const i = Ce[n] || Ce.neutral;
            return {
                key: n,
                color: i.color,
                lineColor: i.lineColor || i.color,
                labelColor: i.labelColor || i.color,
                labelStroke: i.labelStroke
            };
        }
        function Te(e) {
            const t = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(e || "");
            if (!t) return e;
            const n = t.slice(1).map(e => parseInt(e, 16)), i = e => {
                const t = e / 255;
                return t <= .04045 ? t / 12.92 : Math.pow((t + .055) / 1.055, 2.4);
            };
            if (.2126 * i(n[0]) + .7152 * i(n[1]) + .0722 * i(n[2]) >= .22) return e;
            let a = 0, r = 1;
            for (let e = 0; e < 12; e++) {
                const e = (a + r) / 2, t = n.map(t => Math.round(t + (255 - t) * e));
                .2126 * i(t[0]) + .7152 * i(t[1]) + .0722 * i(t[2]) < .22 ? a = e : r = e;
            }
            return `#${n.map(e => Math.round(e + (255 - e) * r)).map(e => e.toString(16).padStart(2, "0")).join("")}`;
        }
        function Fe(e) {
            const t = new Map;
            let n = 0;
            if (e.topics.forEach(i => {
                const a = Le(i, e.name).key;
                "noCode" !== a && (n += 1, t.set(a, (t.get(a) || 0) + 1));
            }), !n) return {
                ...Pe,
                codedChildren: 0,
                predominantCount: 0,
                mixed: !1
            };
            const i = Math.max(...t.values()), a = Array.from(t.entries()).filter(([, e]) => e === i).map(([e]) => e), r = Me[e.name], o = r && a.includes(r) ? r : a[0], s = 1 !== a.length || i / n < .5;
            return {
                key: o,
                ...Ce[o] || Ce.neutral,
                codedChildren: n,
                predominantCount: i,
                mixed: s
            };
        }
        const Ne = new Map;
        h.forEach(e => {
            const t = ge[e.name], n = Fe(e);
            Ne.set(e.name, n), t && (t.color = n.color, t.hankyKey = n.key, t.hankyMixed = n.mixed);
        });
        const _e = new Map;
        let De = 0;
        function Re(e) {
            const t = 16, n = e % t, i = (7 * Math.floor(e / t) + n + 5) % t, a = (n + 10 + e % 3) % t, r = (e, n = 6.15) => {
                const i = -Math.PI / 2 + e / t * Math.PI * 2;
                return [ 8 + Math.cos(i) * n, 8 + Math.sin(i) * n ];
            }, o = r(n), s = r(i), l = r(a, 5.55), c = r((n + 1) % t, 6.45), d = r((n + 2) % t, 6.15);
            return `<circle class="icon-accent" cx="${o[0].toFixed(2)}" cy="${o[1].toFixed(2)}" r=".66"/><path class="icon-accent-stroke" d="M ${s[0].toFixed(2)} ${s[1].toFixed(2)} l ${(.28 * (8 - s[0])).toFixed(2)} ${(.28 * (8 - s[1])).toFixed(2)}"/><path class="icon-detail" d="M ${o[0].toFixed(2)} ${o[1].toFixed(2)} Q ${c[0].toFixed(2)} ${c[1].toFixed(2)} ${d[0].toFixed(2)} ${d[1].toFixed(2)} M ${l[0].toFixed(2)} ${l[1].toFixed(2)} l ${(.16 * (8 - l[0])).toFixed(2)} ${(.16 * (8 - l[1])).toFixed(2)}"/><circle class="icon-detail-dot" cx="${l[0].toFixed(2)}" cy="${l[1].toFixed(2)}" r=".34"/>`;
        }
        function Oe(e, t) {
            const _veKey = t + "\0" + e, n = ve.get(_veKey) || "star", _glyphFallback = !ve.has(_veKey) || !(n in ye), i = _e.get(_veKey) || 0, a = Le(e, t);
            return {
                glyph: ye[n] || ye.star,
                glyphFallback: _glyphFallback,
                accent: "",
                color: a.color,
                lineColor: a.lineColor,
                labelColor: a.labelColor,
                labelStroke: a.labelStroke,
                hankyKey: a.key,
                key: n
            };
        }
        h.forEach(e => e.topics.forEach(t => _e.set(e.name + "\0" + t, De++)));
        const Be = {
            aella: {
                label: "Aella Big Kink Survey",
                url: "https://github.com/austeane/aella-survey-site/blob/HEAD/data/Big%20Kink%20Survey%20(970k%20cleaned).md"
            },
            kinktest: {
                label: "KinkTest list",
                url: "https://kinktest.org/list-of-kinks-the-definitions-of-most-commonpopular-kinks.html"
            },
            checklist: {
                label: "Yes / No / Maybe checklist",
                url: "https://www.scribd.com/document/879070084/Yes-No-Maybe-Kink-List"
            }
        }, je = {
            "Power exchange": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Ways partners may negotiate authority, obedience, rules, symbols, rewards, and discipline."
            },
            "Bondage & restriction": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Restraining movement or access with rope, cuffs, wrapping, furniture, gags, or related methods."
            },
            "Impact, pain & body modification": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Impact, pain, marking, or body-modification interests. These topics call for specialized knowledge and explicit risk discussion."
            },
            "Sensation & atmosphere": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Changing touch, temperature, sound, light, texture, or sensory input to shape an experience."
            },
            "Roleplay & identity": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Consensual adult roles, characters, and scenarios used to explore identity, authority, care, or fantasy."
            },
            "Clothing, materials & objects": {
                sources: [ "aella", "kinktest" ],
                description: "Interest centered on particular garments, materials, toys, or objects and how they look, feel, or are used."
            },
            "Body focus & appearance": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Attraction or attention focused on a body part, body type, appearance state, scent, or form of adornment."
            },
            "Psychological dynamics": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Verbal, emotional, and imaginative dynamics such as praise, humiliation, suspense, fear, or altered-control fantasy."
            },
            "Watching, exposure & settings": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Consensual interests involving being seen, watching, recording privately, performing, or using a particular setting."
            },
            "Partner configurations": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Interests involving more than two people or a negotiated non-monogamous configuration."
            },
            "Sex acts": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Specific sexual activities. Give and receive can be rated independently wherever direction matters."
            },
            Positions: {
                sources: [ "aella" ],
                description: "Positions listed in the Aella survey instrument, treated here as separate prompts for discussion."
            },
            "Orgasm & reproductive play": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Interests involving arousal timing, orgasm, or consensual reproductive fantasy rather than an assumption of real-world intent."
            },
            "Fluids & messy play": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Body-fluid or messy-play interests. Boundaries, barriers, hygiene, and specific risks should be discussed explicitly."
            },
            "Primal & pursuit": {
                sources: [ "checklist" ],
                description: "Instinctive or pursuit-focused play such as negotiated chasing, wrestling, hunter/prey roles, biting, or scratching."
            },
            "Service & ritual": {
                sources: [ "checklist" ],
                description: "Structured service, etiquette, permission, grooming, tasks, and ceremonies within a negotiated dynamic."
            },
            "Fantasy & transformation": {
                sources: [ "aella", "kinktest", "checklist" ],
                description: "Fictional narratives, creatures, identity play, and imagined changes in body, scale, or form."
            },
            "Connection & aftercare": {
                sources: [ "checklist" ],
                description: "Ways partners reconnect, recover, reflect, and care for one another during and after an experience."
            }
        }, qe = {
            "Protocols & rules": "Agreed rules that shape how someone speaks, dresses, asks permission, completes tasks, or behaves in a power-exchange relationship or scene.",
            "Ownership language": "Calling someone “mine,” “owned,” “property,” or similar words to make the power exchange feel possessive and real while both people are choosing the dynamic.",
            "Collars & symbols": "Wearing a collar, ring, bracelet, tag, or other item that represents a dominant/submissive bond, a role, or a commitment.",
            "Reward & correction": "The person in charge rewards wanted behavior and corrects behavior that breaks the agreed rules, using attention, privileges, tasks, or other consequences.",
            Discipline: "One person enforces agreed rules by assigning consequences such as extra tasks, loss of privileges, scolding, or physical punishment.",
            Begging: "One person pleads for touch, sex, permission, release, or another desired thing while the other decides whether and when to grant it.",
            "Scene-based roles": "Taking dominant and submissive roles for a particular sexual or kink scene, then ending those roles when the scene is over.",
            "Ongoing dynamics": "Keeping a power exchange active beyond individual scenes, so agreed authority, service, rules, or rituals continue through everyday life.",
            "Rope bondage": "Tying someone with rope to limit movement, hold a pose, create pressure, or make the restraint itself part of the erotic experience.",
            "Decorative rope": "One partner gives the rope — ties decorative knots, patterns, and lines on the body — while the other receives it: is tied and wears the rope, mainly for how it looks and feels rather than to be immobilized.",
            "Japanese bondage": "A rope-bondage style influenced by Japanese kinbaku or shibari, using deliberate patterns, tension, positions, and often a strong visual or emotional focus.",
            "Cuffs & straps": "Fastening wrists, ankles, thighs, or other body parts with cuffs or straps so movement is restricted or controlled.",
            "Spreaders & bars": "Attaching the wrists, ankles, or legs to a rigid bar that keeps them held apart and makes closing or pulling them together difficult.",
            "Tape & wrapping": "Using bondage tape, plastic wrap, or another wrapping material around part of the body to hold limbs together or create a tight, enclosed feeling.",
            Gags: "Putting a gag in or over someone’s mouth to limit speech, change their sounds, or emphasize helplessness and control.",
            Mummification: "Wrapping most of someone’s body in plastic wrap, tape, cloth, or bandages until they are tightly enclosed and largely unable to move.",
            "Furniture restraint": "Securing someone to a bed, bench, chair, frame, cage, or purpose-built piece of bondage furniture so the object holds their position.",
            "Blindfolded restraint": "Restraining someone while their eyes are covered, combining limited movement with not being able to see what is coming.",
            "Escape play": "Tying or locking someone up and making the struggle to get free part of the scene, whether escape is genuinely possible or only roleplayed.",
            Immobilization: "Restraining someone so thoroughly that they can move very little or not at all, often by fixing several limbs or the whole body in place.",
            Spanking: "Striking someone’s buttocks with an open hand for sting, heat, sound, movement, punishment, or added intensity during sex.",
            "Paddles & straps": "Hitting the buttocks or other fleshy areas with a flat paddle or flexible strap, producing anything from a broad thud to a sharp sting.",
            Flogging: "Swinging a multi-tailed flogger against the body in repeated strokes that can feel soft and rhythmic or heavy and painful.",
            Caning: "Striking the body with a thin, rigid cane that delivers a narrow, sharp sensation and can leave distinct lines.",
            "Riding crops": "Striking with a short, semi-rigid riding crop, using its narrow shaft or leather flap to create precise, sharp stings and focused impacts.",
            Whips: "Striking with a flexible whip—often a single-tail—whose traveling loop and fast-moving tip can produce a sharp crack, sting, or narrow line.",
            Clamps: "Clipping adjustable or spring-loaded clamps onto nipples, genitals, or other pinched skin to create steady pressure and pain.",
            "Hair pulling": "Gripping and pulling someone’s hair during a scene or sexual activity to guide their head, add pain, intensify control, or create a firm physical hold.",
            "Needles & piercing": "Putting sterile needles through or into the skin, or making temporary or permanent piercings, as the focus of the scene.",
            Sounding: "Urethral sounding is the insertion of smooth metal or silicone rods into the urethra for sexual stimulation. It is a higher-risk practice requiring sterile technique, specialized knowledge, appropriate lubrication, and explicit negotiation.",
            "Heavy marking": "Hitting, biting, scratching, suctioning, or otherwise working the skin hard enough to leave bruises, welts, scratches, or other visible marks.",
            "Extreme endurance": "One partner endures intense pain, difficult positions, repeated impact, or prolonged stimulation while the other pushes their agreed physical or mental limits.",
            "Wax & temperature": "Dripping warm wax onto skin or using controlled heat and cold to create sudden temperature sensations across the body.",
            "Ice & cool touch": "Running ice, chilled metal, cold hands, or cool air over the skin, sometimes alternating it with warmth or sexual touch.",
            Tickling: "Touching sensitive areas lightly or rapidly to make someone squirm, laugh, lose composure, or struggle against restraint.",
            "Electrical Play": "Applying controlled electrical pulses with an E-stim device or violet wand so the body feels tingling, tapping, pulsing, or sharper shocks.",
            "Texture contrast": "Moving very different materials—such as fur, leather, metal, rope, feathers, or rough fabric—across the skin to emphasize how each feels.",
            "Sensory deprivation": "Removing or reducing sight, sound, movement, or touch so someone has less information and becomes more focused on the sensations that remain.",
            "Sensory overload": "Giving many strong sensations at once—such as noise, light, touch, vibration, pain, or sexual stimulation—until it becomes deliberately overwhelming.",
            "ASMR & whispering": "Using close whispers, soft mouth sounds, breath, scratching, or other quiet repetitive sounds to create tingles, calm, or erotic intimacy.",
            "Music & sound": "Using music, voices, rhythms, sound effects, or deliberate silence to set the pace and emotional tone of a scene.",
            Mirrors: "Positioning mirrors so someone can watch themselves or their partner during sex, bondage, dressing, or another scene.",
            "Low light": "Using dim lamps, candles, darkness, or shadows to change what can be seen and make the scene feel private, suspenseful, or intimate.",
            Scent: "One partner gives a scent — wears perfume, leather, sweat, incense — the other receives it: smells, breathes it in.",
            "Tantra / energy play": "Using tantric or energy-focused practices—such as synchronized breathing, sustained eye contact, slow touch, visualization, pelvic-floor control, meditation, and the deliberate circulation or exchange of felt energy—to build embodied presence, arousal, intimacy, or altered states within a kink scene.",
            "Spiritual play": "Treating consensual sexuality or kink as an intentional spiritual or devotional practice through ceremony, invocation, vows, offerings, sex magic, or symbolic roles, with the meaning and boundaries negotiated by everyone involved.",
            "Authority roles": "Roleplaying a power-unequal relationship such as boss/employee, officer/civilian, or ruler/subject, with one adult giving orders and the other obeying.",
            "Caregiver roles (adults)": "One adult plays a nurturing, protective, or supervisory caregiver and the other adult plays the person being looked after.",
            "Age play between adults": "Adults roleplay being different ages or use age-coded behavior, clothes, speech, or rules; every person involved is an adult regardless of the role.",
            "Pet play": "One adult takes on the behavior and status of a pet while another acts as owner, handler, trainer, or companion.",
            "Pony Play": "A form of pet play in which someone acts like a pony through posture, tack, pulling a cart, dressage-style movement, or training.",
            "Puppy play": "A form of pet play in which someone acts like a puppy through crawling, barking, playing, wearing pup gear, or responding to a handler.",
            "Owner & property": "One partner takes the owner role — calling the other “mine,” setting agreed rules, or directing their service and display — while the other takes the property role: is claimed, kept, and used within the chosen dynamic.",
            "Doctor/Nurse Play": "Adults act out a medical exam or treatment, with one playing a doctor or nurse and the other playing the patient.",
            "Teacher / student roleplay": "Adults act out a classroom or tutoring dynamic in which a teacher gives lessons, tests, rules, praise, or punishment to an adult student.",
            "Captivity / kidnapping": "One partner captures the other — abducts, restrains, transports, confines, or guards them in roleplay — while the other is captured and acts unable to leave; all real participants agreed to the scene.",
            "Consensual non-consent fantasy": "Adults agree in advance to act out resistance, force, or refusal as part of a scene, even though the real encounter is chosen and controlled by them.",
            "Creature fantasy": "Roleplaying sex or intimacy with a fictional nonhuman creature, or pretending that one participant is such a creature.",
            "Vampires & gothic": "Using vampire roles, biting, blood imagery, dark clothing, candlelight, crypts, or other gothic elements as the erotic fantasy.",
            "Historical fantasy": "Roleplaying adults in another time period—such as a royal court, pirate ship, manor, or wartime setting—with period-inspired roles and clothing.",
            Leather: "Wearing, touching, smelling, or using leather clothing and gear such as harnesses, boots, gloves, straps, or jackets as part of attraction or play.",
            "Latex & rubber": "Wearing tight latex or rubber clothing, or enjoying its shine, smell, pressure, squeak, and slick feel against the body.",
            "Lingerie & stockings": "Wearing or admiring bras, panties, corsets, garters, stockings, and similar garments as part of dressing up, teasing, or sex.",
            Uniforms: "Wearing a recognizable work, military, school-style, service, or authority uniform to create a look or support a roleplay.",
            "Heels & boots": "Wearing, touching, admiring, or being controlled with high heels, tall boots, or heavy footwear as the focus of attraction or a scene.",
            "Masks & hoods": "Covering part or all of the face or head to hide identity, change appearance, restrict sight or sound, or create a depersonalized feeling.",
            Harnesses: "Wearing straps fitted around the chest, hips, thighs, or genitals for appearance, attachment points, restraint, or holding a toy.",
            Diapers: "Adults wear, use, change, or are placed in diapers as part of regression, caregiving, humiliation, comfort, or bodily-control play.",
            "Food / messy play": "Putting edible food on bodies, feeding each other, eating from the body, or smearing and pouring foods such as cream, syrup, cake, or fruit so taste and mess become part of sexual play.",
            Fur: "Wearing, touching, or rubbing real or faux fur because its softness, warmth, animal association, or appearance is arousing.",
            "Anal beads": "Inserting a connected string of beads into the anus and pulling them out slowly or during orgasm for a sequence of stretching sensations.",
            Pumps: "Using a vacuum pump on nipples, the penis, vulva, clitoris, or other tissue to draw in blood, create swelling, and increase sensitivity.",
            Showerheads: "Using a handheld or directed stream of water against the genitals or other sensitive areas for pressure and stimulation.",
            "Costume transformation": "One partner gives a costume — dresses the other in clothing, a wig, makeup, prosthetics, or accessories — while the other receives it: is dressed and transformed into a character or type of person.",
            "Feet & footwear": "Focusing attraction or sexual attention on bare feet, toes, socks, shoes, or boots through looking, touching, licking, smelling, or worship.",
            "Hands & gloves": "Focusing attraction on hands, fingers, nails, or gloves through watching, touching, kissing, sucking, or having them used during sex.",
            Hair: "Focusing attraction on the look, smell, texture, length, styling, or handling of someone’s hair.",
            Breasts: "Focusing sexual attention on breasts or nipples through looking, touching, sucking, squeezing, rubbing, or using them during sex.",
            Buttocks: "Focusing sexual attention on someone’s ass through looking, touching, squeezing, licking, spanking, or penetration.",
            "Body worship": "Lavishly kissing, licking, touching, praising, or serving someone’s body—or a chosen part of it—as if it deserves devotion.",
            "Size contrast": "Making a difference in height, weight, strength, penis size, or imagined scale central to the attraction or power dynamic.",
            "Muscle Worship": "Admiring, touching, kissing, flexing for, or verbally praising a muscular body as the focus of the scene.",
            "Tattoo & body modification focus": "Being attracted to tattoos, piercings, scars, stretched ears, implants, or other deliberate changes to someone’s body.",
            "Pregnancy focus": "Finding a pregnant body, rounded belly, lactation, or the physical idea of pregnancy sexually compelling.",
            "Scent & sweat": "Enjoying the smell or taste of a partner’s natural body odor and sweat, often after exercise or sex.",
            "Praise (in scene)": "Using sincere compliments, affectionate worship, and enthusiastic approval during play to make someone feel desired, cherished, or exceptionally good.",
            "Humiliation language": "Using agreed insulting, embarrassing, or belittling words to make someone feel exposed, small, dirty, or controlled during play.",
            Degradation: "Treating someone in an agreed demeaning way through words, posture, tasks, object-like use, mess, or denial of status.",
            "Dirty talk": "Speaking explicitly about bodies, sex acts, desires, commands, or fantasies during flirting, sex, or a scene.",
            Objectification: "Treating a person as a body part, toy, piece of furniture, display item, or tool for someone else’s pleasure within the roleplay.",
            "Hypnosis & mind-control fantasy": "Using hypnotic language, triggers, repetition, or roleplay to create the fantasy that someone’s thoughts or actions are being controlled.",
            "Fear Play": "Creating a controlled feeling of danger, dread, or helplessness through threats, darkness, weapons as props, pursuit, or not knowing what comes next.",
            Interrogation: "One person questions another under pressure, using commands, restraint, threats, or discomfort while the other resists or gives up information in character.",
            "Anticipation & suspense": "Delaying or hiding what will happen next so waiting, uncertainty, and mounting tension become part of the arousal.",
            "Confession & secrets": "One person gives a secret — reveals desires, fantasies, embarrassing thoughts — while the other receives it: listens, questions, or commands.",
            "Watching & being watched": "One partner watches the other undress, masturbate, have sex, or perform another intimate act; the watched partner knows and agrees to the audience.",
            "Private photo & video": "Taking, posing for, or recording intimate photos or video meant to stay within the participants’ agreed private audience.",
            "Performance for a partner": "Stripping, masturbating, dancing, posing, or performing a sexual act mainly for a partner who is watching.",
            "Public & outdoor play": "Having sex or doing kink outdoors in a secluded place, or doing something discreet in public — such as hidden touch or remote-toy play — for the thrill of almost being noticed without involving nonconsenting people.",
            "Exhibition / voyeurism": "One partner exhibits — exposes their body or performs sexual activity for an audience — while the other watches; any enacted “secret” watching is roleplayed by consenting adults.",
            "Cuckold / hotwife fantasy": "Fantasizing that one partner has sex with someone else while the other knows, watches, hears details, or experiences jealousy and arousal.",
            Threesomes: "Sexual activity involving three adults at the same time, in whatever combination of genders and roles they choose.",
            "Group encounters": "Sexual or kink activity involving more than three adults, with attention moving among several people or scenes.",
            Swinging: "Couples consensually have sex with other people or couples, together or separately, usually as recreational partner swapping rather than a romantic relationship.",
            "Cuckold / hotwife": "A relationship, fantasy, or scene in which one partner has sex with someone else while the other knows, encourages, watches, hears details, joins in, or eroticizes jealousy, denial, submission, or humiliation.",
            "Polyamory with kink": "Maintaining multiple consensual romantic or sexual relationships while also sharing BDSM roles, scenes, rules, or power dynamics.",
            "Group service": "Service is given and received: one side gives service to the group, the other receives it.",
            Gangbang: "One partner receives a gangbang — is the sexual focus of several adults — the others give it.",
            Hotwifing: "A married or partnered woman has sex with other people with her partner’s knowledge and encouragement, usually without humiliation being required.",
            "Anal fingering": "Putting one or more fingers into the anus and moving, curling, or pressing them to stimulate the anus, rectum, or prostate.",
            Rimming: "Licking, kissing, or using the tongue on and around someone’s anus.",
            Creampies: "Ejaculating semen inside a vagina or anus and leaving it there, or roleplaying that act with a toy or simulated fluid.",
            Facefucking: "Thrusting a penis or strap-on in and out of someone’s mouth with the penetrating partner controlling much of the pace and depth.",
            Facesitting: "Sitting or lowering the vulva, anus, or clothed crotch over someone’s face so they use their mouth and tongue from underneath.",
            Facials: "Ejaculating semen onto a consenting partner's face, where the placement, visual display, mess, taste, or power dynamic is part of the sexual act.",
            "Fingering mouths": "Putting one or more fingers into someone’s mouth for them to lick or suck, or to control how their mouth opens and moves.",
            "Vaginal fisting": "Slowly inserting the whole hand, usually with fingers gathered together, into the vagina for intense fullness and stretching.",
            "Anal fisting": "Slowly inserting the whole hand, usually with fingers gathered together, into the anus and rectum for intense fullness and stretching.",
            "Hair pulling during sex": "Gripping and pulling a partner’s hair during sexual activity to guide their head, add pain, or intensify control.",
            Handjobs: "Stroking, squeezing, or rubbing a penis with a hand to create sexual pleasure and often orgasm.",
            Pegging: "A woman wears a strap-on dildo and fucks a partner anally with it; a man or nonbinary person can wear the strap-on and do the same thing.",
            "Spanking during sex": "Slapping someone’s buttocks with an open hand while fucking, oral sex, or other sexual activity is happening.",
            Squirting: "One partner squirts — expels fluid through the urethra during arousal or orgasm — while the other makes them squirt through stimulation and may use the fluid as part of the scene.",
            "Vaginal fingering": "Putting one or more fingers into the vagina and moving, curling, or pressing them to stimulate the vaginal walls, G-spot area, or cervix.",
            "Anal sex": "Putting a penis, strap-on, dildo, or other penetrative toy into someone’s anus and thrusting or moving it there.",
            "Oral sex": "Using the mouth, lips, and tongue to stimulate a penis, vulva, or anus.",
            Penetration: "Putting a penis, fingers, fist, dildo, strap-on, or another toy inside the vagina or anus and moving or holding it there.",
            69: "Two people perform oral sex on each other at the same time, with each person’s mouth at the other’s genitals.",
            Cowgirl: "One person lies down while the receiving partner straddles them facing forward and controls the motion during vaginal or anal penetration.",
            Doggystyle: "The receiving partner is on hands and knees or bent forward while the penetrating partner enters from behind.",
            Missionary: "The receiving partner lies on their back while the penetrating partner faces them from above or between their legs.",
            "Reverse cowgirl": "One person lies down while the receiving partner straddles them facing away and controls the motion during penetration.",
            Spooning: "Both partners lie on their sides facing the same direction while the partner behind penetrates, rubs, or reaches around the partner in front.",
            "Standing up": "Partners have sex while one or both are standing, using a wall, furniture, lifting, or balance to hold the position.",
            "Orgasm control": "One person decides when, how, or whether another person may orgasm, often using commands, pacing, stopping, or permission.",
            "Orgasm denial": "Keeping someone aroused while deliberately preventing orgasm for a set time, a scene, or an ongoing dynamic.",
            Chastity: "Restricting access to someone’s genitals or sexual release, often with a wearable device, while a partner controls when it may be removed.",
            Edging: "Bringing someone close to orgasm, backing off before they climax, and repeating the cycle to prolong arousal.",
            Teasing: "Building desire with partial touch, exposure, words, or near-contact while deliberately delaying the stimulation or release the person wants.",
            "Breeding / pregnancy fantasy": "One partner impregnates — gives sperm by ejaculating inside and gives the pregnancy — while the other is impregnated: receives the sperm and is or becomes pregnant in the fantasy, whether or not pregnancy is actually possible or intended.",
            "Surrogacy fantasy": "One partner gives the surrogacy — carries the pregnancy for the other — the other receives it: the intended parent.",
            "Oviposition fantasy": "One partner gives eggs — lays them — the other receives them, in a fictional fantasy often involving toys, inflation, or imagined creatures.",
            Watersports: "Urinating on a partner, being urinated on, watching someone urinate, or otherwise making urine part of sexual play.",
            Lactation: "One partner gives breast milk — expresses it — the other receives it: sucks, licks, drinks.",
            "Squirt play": "Using fluid released during squirting as part of sex, including watching it, feeling it on bodies, or deliberately making a mess with it.",
            "Blood play": "Making, seeing, tasting, or using blood during a scene, often through controlled cutting, needles, or an existing menstrual flow.",
            Spit: "Spitting on a partner’s face, body, or genitals, spitting into their mouth, making them spit, or being spat on as a consensual act of humiliation, possession, intimacy, or messy play.",
            "Age gap": "Sexual or romantic attraction centered on a substantial age difference between two legally adult partners, whether the person is drawn to being the older or the younger partner. Unlike age play, the age difference is real rather than an acted role.",
            "Celebrity fantasy": "Imagining sexual or romantic contact with a real celebrity or other famous public figure. The fantasy centers on that person’s public identity and remains separate from any expectation of real-world access or consent.",
            "Messy food play": "Smearing, pouring, sitting in, or covering bodies with foods such as cream, syrup, cake, or fruit, then touching, licking, or having sex in the mess.",
            "Hunter / prey": "One partner hunts — tracks, chases, catches, pins, or claims — while the other is hunted: runs, hides, resists, struggles, or is caught, often with raw growling, grabbing, biting, or rough sex.",
            "Chase scenes": "One partner gives the chase — pursues — the other receives it: is chased, caught.",
            "Wrestling & struggle": "One partner gives the fight or struggle — initiates the grappling, pinning, or contest for position — while the other receives it: engages, resists, and physically struggles back.",
            "Biting & scratching": "Using teeth and fingernails on the body to create marks, pain, pressure, or an animalistic feeling.",
            "Acts of service": "Doing useful or pleasing things for someone—such as preparing gear, bringing drinks, cleaning, or following instructions—as an expression of devotion or submission.",
            "Domestic service": "Cooking, cleaning, laundry, errands, and other household work are performed for a partner as part of an agreed service dynamic.",
            "Formal etiquette": "Following prescribed manners, titles, posture, speech, dress, or rituals to show respect and reinforce roles.",
            "Grooming rituals": "Bathing, shaving, brushing hair, applying lotion, dressing, or otherwise caring for a partner’s body in a structured way.",
            "Dressing a partner": "Choosing and putting clothes, lingerie, uniforms, gear, or accessories on someone else as an act of control, care, display, or service.",
            "Permission rituals": "Permission is given and received: one person asks for and receives permission (to speak, touch, sit, eat, orgasm, leave), the other gives it.",
            "Daily tasks": "Assigning recurring chores, exercises, messages, journaling, or acts of service that someone completes as part of the dynamic.",
            "Ceremonial scenes": "Using deliberate steps, symbols, spoken words, clothing, positions, or objects to make a scene feel like a formal ritual.",
            "Spiritual play": "Practicing sacred sexuality or ritualized kink as an intentional spiritual or devotional act, using elements such as ceremony, prayer or invocation, vows, offerings, sex magic, symbolic roles, and states of surrender, devotion, transformation, or communion; the sacred meaning is part of what participants are doing, not just decorative atmosphere.",
            "Romantic surrender": "One person willingly gives themselves over emotionally and physically to a trusted partner, with devotion and being claimed as the heart of the fantasy.",
            "Seduction scenarios": "One partner gives the seduction — tempts, pursues, or gradually wins the other over — while the other receives it: is courted, enticed, and gives in to sex or a role.",
            "Strangers fantasy": "Pretending not to know each other, meeting as strangers, and letting attraction lead to an anonymous-feeling encounter.",
            "Secret identity": "Roleplaying that someone has a hidden name, job, power, costume, or double life that is revealed or used during the scene.",
            "Mythical creatures": "Roleplaying gods, demons, angels, elves, merfolk, werewolves, or other beings from myth and fantasy in an erotic scenario.",
            Aliens: "Roleplaying an encounter with extraterrestrials, often involving abduction, examination, unfamiliar anatomy, or first contact.",
            "Growth / shrinking fantasy": "Imagining or roleplaying that one person becomes enormous or tiny, changing who can overpower, hold, worship, or use whom.",
            "Body-swapping fantasy": "Imagining that two people exchange bodies and then explore the unfamiliar body, identity, or relationships from the other person’s perspective.",
            "Furry transformation fantasy": "Imagining or roleplaying a person changing into an anthropomorphic animal, often with fur, paws, ears, a muzzle, tail, or animal instincts.",
            "Gender Play": "Playing with a different gender role, name, presentation, body fantasy, or set of expectations as part of erotic exploration.",
            Crossdressing: "Wearing clothes, lingerie, makeup, or accessories culturally associated with another gender because the transformation or presentation is exciting.",
            Sissification: "One partner gives the sissification — feminizes the other through clothing, names, posture, tasks, or roles — while the other receives it: is sissified.",
            "Kidnapping fantasy (consensual)": "Adults agree to roleplay that one person is abducted, restrained, transported, or held captive while acting as though the capture is against their will.",
            "Verbal check-ins": "Pausing or checking in with words during a scene to ask how someone feels, whether the intensity is right, and whether they want to continue or change anything.",
            "Cuddling & touch": "Holding, stroking, kissing, or lying close together after a scene to help the body settle and restore affectionate connection.",
            "Food & hydration": "Offering water, electrolytes, snacks, or a meal after intense play so participants can recover physically.",
            "Quiet decompression": "Sitting or lying somewhere calm with low stimulation while breathing, resting, and letting the intensity of the scene fade.",
            "Praise (aftercare)": "Telling someone after an intense or vulnerable scene that they did well, are cared for, are not being judged, and are emotionally safe.",
            "Post-scene review": "Talking after the scene about what felt good, what did not, any surprises, and what each person would keep or change next time.",
            "Space & solitude": "Giving someone time alone after a scene because quiet privacy, rather than touch or conversation, is what helps them recover.",
            "Next-day check-in": "Contacting each other the following day to ask about emotions, soreness, marks, regrets, needs, and how the experience feels in hindsight.",
            "Needle Play": "Using sterile needles to pierce or decorate the skin during a scene, including temporary play piercing, arranged needle patterns, and an erotic focus on piercings; it requires specialized training, sterile technique, sharps handling, and explicit negotiation.",
            "Rope bondage": "Tying someone with rope to restrain movement, hold a pose, create pressure, or make the rope itself part of the erotic experience, including decorative ties, hemp rope, Japanese shibari or kinbaku, and historically inspired hojojutsu forms.",
            Corsets: "Wearing, admiring, lacing, cinching, or progressively training with a corset because the garment, the transformed silhouette, the pressure, or the act of being tightly laced is erotic.",
            "Body Modification": "Erotic interest in tattoos, piercings, scarification, implants, or other deliberate changes to the body, including having modifications, admiring them on others, or making their creation part of a negotiated scene.",
            "Vintage Porn": "Erotic interest in pornography from an earlier era or made in an antique style, including Victorian erotic imagery, vintage magazines, films, photography, costumes, and period aesthetics.",
            Primal: "Instinctive, animalistic play centered on raw movement and emotion, such as growling, chasing, wrestling, biting, scratching, pinning, or rough sex within negotiated limits.",
            Smoking: "Erotic interest in a person smoking or in the sight, smell, taste, ritual, or control of smoke and smoking items such as cigarettes or cigars; everyone present should consent to smoke exposure.",
            "Religious Play": "Consensual adult roleplay that eroticizes religious authority, confession, worship, ritual, blasphemy, clergy roles, or sacred and profane imagery without implying anyone's real beliefs are available for use without consent.",
            "Mental Bondage": "Restraining someone through commands, rules, expectations, hypnosis-style suggestion, or the understanding that they must remain still, rather than through physical restraints.",
            "Affectionate Cruelty": "Combining deliberately harsh treatment—such as pain, humiliation, denial, or strict control—with tenderness, praise, reassurance, or loving attention so cruelty and care are felt together.",
            Pirates: "Erotic roleplay involving adult pirates, captains, crews, captives, treasure, ships, costumes, mutiny, or swashbuckling power struggles, with any capture or coercion agreed in advance.",
            Clowns: "Erotic attraction to clown makeup, costumes, performance, exaggerated characters, or clown roleplay, which may involve humor, embarrassment, transformation, or controlled fear.",
            Robots: "Erotic robot or cyborg roleplay involving mechanical movement, programmed behavior, remote control, commands, obedience, transformation, or attraction to artificial bodies.",
            Formicophilia: "Erotic arousal from the sensation or idea of insects crawling on the body; any real-animal contact needs careful attention to bites, stings, allergies, hygiene, and the welfare of the animals.",
            Forniphilia: "Erotic arousal from being used as furniture — a human table, chair, footstool, or stand — or from using a consenting partner that way; weight, balance, breathing, circulation, and how long someone can safely hold a position all need care.",
            Graphoerotica: "Writing or drawing words, names, instructions, ownership marks, symbols, or pictures on a consenting person's skin for decoration, humiliation, objectification, or a feeling of being claimed.",
            Bellydancing: "Erotic interest in performing or watching belly dance, especially its hip, torso, and abdominal movements, costumes, rhythm, display, and the focused attention between performer and viewer.",
            Chocolate: "Using chocolate as part of erotic food play by feeding, tasting, smearing, drizzling, licking, or covering skin with it, with allergies, temperature, cleanup, and where it is safe to place food discussed first.",
            Librarians: "Erotic roleplay built around an adult librarian and patron, using books, research, enforced quiet, rules, overdue consequences, authority, or a reserved public persona that changes in private.",
            Inflatables: "Erotic interest in inflatable objects or the process of inflation, including their size, pressure, texture, sound, buoyancy, body contact, sitting or riding, or controlled deflation.",
            "Cell Popping": "A permanent body-modification practice in which a heated sterile needle or similar tool makes small dot burns in the skin, often arranged as a pattern; it carries burn, infection, and scarring risks and requires specialized knowledge and explicit consent.",
            FemDom: "A woman takes the dominant role, directing, controlling, disciplining, or using a consenting submissive partner in a scene or ongoing power exchange.",
            "D/s": "Dominance and submission is a negotiated power exchange in which one person exercises agreed authority and another willingly submits to it.",
            "Ordered To Masturbate": "A dominant tells a submissive when, where, or how to masturbate, may watch or direct the technique, and may control whether orgasm is allowed.",
            Brats: "A brat playfully resists, teases, talks back, or breaks minor agreed rules to provoke attention, correction, or a contest of wills with a dominant.",
            "24/7": "A power-exchange relationship in which agreed dominant and submissive roles remain active throughout daily life rather than only during individual scenes.",
            Switching: "A switch enjoys both dominant and submissive roles and may change roles between partners, between scenes, or within the same encounter.",
            "Male Authority": "An adult man takes an authority role and gives orders, sets rules, or directs a consenting partner who chooses to submit to him.",
            "Behavior Modification": "Using agreed rewards, consequences, routines, and repetition to encourage or discourage specific behaviors within a power-exchange relationship.",
            "Female Supremacy": "A negotiated dynamic or fantasy in which women are treated as superior and hold authority over consenting partners who accept subordinate roles.",
            "Play Punishment": "A consensual punishment performed for erotic enjoyment, such as a spanking, scolding, task, or denied privilege, rather than to correct a genuine offense.",
            "Bathroom Use Control": "One person controls when or how another may use the toilet, including requiring permission, waiting, scheduled access, or supervised use within agreed limits.",
            "Domestic Discipline": "Partners agree that one has authority to enforce household or relationship rules through consequences such as lectures, chores, loss of privileges, or spanking.",
            "Pro Domme": "A professional dominatrix provides paid, negotiated BDSM services such as bondage, discipline, humiliation, or fetish play, typically without promising conventional sexual intercourse.",
            "Caging/Confinement": "Placing someone in a cage, crate, cell, closet, or other enclosed space so their movement and ability to leave are controlled for the scene.",
            "Anal Hooks": "A curved hook is inserted into the anus and may be attached to rope or another restraint to control posture or create pressure; it requires careful, informed use.",
            "Breast Bondage": "Rope, straps, bands, or tape are tied around or across the breasts to compress, lift, separate, display, or restrict them.",
            "Suspension Bondage": "Rope or specialized gear supports some or all of a restrained person's body above the floor, making load placement and trained rigging essential.",
            "Bondage Art": "Creating or appreciating visually elaborate restraint, especially decorative rope patterns and posed bodies, where composition and appearance are central to the experience.",
            "Bondage Tape": "Special tape that sticks to itself rather than skin is wrapped around limbs or the body to restrict movement, bind body parts together, or create encasement.",
            "Predicament Bondage": "A person is restrained so avoiding discomfort in one position causes discomfort elsewhere, forcing them to choose between limited, difficult options.",
            "Duct Tape": "Using duct tape to bind, wrap, gag, or immobilize someone; because it adheres strongly, skin, hair, circulation, breathing, and safe removal require particular care.",
            "Speech restriction": "Limiting someone's ability or permission to speak through a gag, commands, required phrases, silence rules, or consequences for talking.",
            "Self-Bondage": "A person restrains themself for erotic pleasure without a partner physically present, making reliable release methods and emergency planning especially important.",
            Armbinders: "A sleeve, leather device, or rigid restraint holds both arms together behind the back, often from wrists toward elbows, sharply limiting upper-body movement.",
            "Scarf bondage": "Using scarves or other soft fabric to tie wrists, ankles, limbs, or the body, combining restraint with the fabric's texture and appearance.",
            "Medieval Devices": "Using replicas or fantasies of stocks, pillories, racks, cages, shackles, or other historical restraint and punishment devices in consensual adult play.",
            "Hair Bondage": "A person's hair is braided, tied, or attached to rope, furniture, or another restraint so head position or movement is controlled through the hair.",
            Waterbondage: "Bondage performed in, near, or with water, such as restraining someone in a bath or under controlled spray; breathing, slipping, and rapid release are critical concerns.",
            "Encasement Fetish": "Erotic enjoyment of being tightly enclosed, or enclosing someone, in latex, fabric, plastic, a sleepsack, vacuum bed, or another full-body covering.",
            "Cling Film": "Wrapping parts of the body in household plastic film to compress, immobilize, or create a smooth enclosed appearance while keeping breathing and circulation unobstructed.",
            "Crucifixion Play": "A consenting adult is restrained with arms extended on a cross-shaped frame or in a cruciform position, emphasizing exposure, endurance, symbolism, or helplessness.",
            Sleepsacks: "A close-fitting fabric, leather, latex, or rubber sack encloses most of the body and limits limb movement while leaving planned access and a safe airway.",
            Pain: "Giving or receiving deliberately controlled physical discomfort because the sting, ache, intensity, endorphin response, or power exchange is erotically satisfying.",
            "Clit Spanking": "Striking the external clitoris or vulva with fingers or a small implement to create sharp, focused genital sensation, with intensity kept carefully controlled.",
            Sadism: "Erotic enjoyment of consensually causing pain, humiliation, fear, or intense sensation to a partner who has chosen to receive it.",
            "Impact Play": "Striking the body with hands or implements such as paddles, floggers, canes, straps, or whips to create pain, sound, marks, rhythm, or submission.",
            Bruises: "Finding bruises erotically appealing, whether from receiving them, giving carefully negotiated impact that creates them, or admiring existing marks on a partner.",
            "Cock and Ball Torture": "Applying controlled pain or pressure to the penis and testicles through squeezing, slapping, binding, stretching, impact, clamps, or specialized devices.",
            "Breast Spanking": "Striking the breasts with an open hand or suitable implement to create sting, thud, movement, redness, or a sense of rough handling.",
            "Pussy Spanking": "Striking the external vulva or pubic mound with a hand or suitable implement to create focused sting, heat, or humiliation.",
            "Knife Play": "Using a knife as a negotiated prop against or near the body for fear, control, sensation, clothing removal, or symbolic threat without unplanned cutting.",
            "Tit Slapping": "Slapping the breasts with an open hand so they sting, move, redden, or feel roughly handled during a scene or sexual activity.",
            "Belt Whippings": "Striking a partner with the flat or end portion of a belt to create a broad thud, sharper sting, lines, or punishment imagery.",
            Pinching: "Squeezing skin between fingers, nails, clips, or another tool to create localized pressure or pain on nipples, thighs, genitals, or other body areas.",
            "OTK Spanking": "One adult lies or bends over another person's lap while their buttocks are spanked, combining impact with restraint, exposure, and punishment imagery.",
            "Cock Slapping": "Striking a penis with an open hand or fingers to create sharp genital sensation, humiliation, or rough sexual play within carefully agreed intensity.",
            "Corporal Punishment": "Using physical punishment such as spanking, caning, strapping, or paddling within a negotiated authority role or disciplinary scene.",
            Clothespins: "Clipping clothespins onto nipples, genitals, or folds of skin to create sustained pinching pressure and a sharper sensation when they are removed.",
            "Fire Play": "Passing controlled flame near or briefly over prepared skin, or using burning materials under trained conditions, to create heat, fear, and visual intensity.",
            "Breast Whipping": "Striking the breasts with a whip or flexible implement to create focused sting, movement, redness, or marks; it is more intense than ordinary breast slapping.",
            Ballbusting: "Kicking, kneeing, squeezing, slapping, or otherwise inflicting negotiated pain on the testicles as the central focus of a scene.",
            Cutting: "Making deliberate shallow cuts in the skin as part of a negotiated scene, sometimes for blood, pain, marks, or design; it carries infection, scarring, and injury risks.",
            "Pressure points": "Pressing specific sensitive areas, nerves, or muscle junctions with fingers or tools to create concentrated pain, control movement, or compel a response.",
            Figging: "Inserting peeled fresh ginger into the anus or vagina so its oils create a strong warming or burning sensation that intensifies with muscle movement.",
            "Ball Kicking": "Kicking or tapping the testicles at a negotiated intensity for pain, vulnerability, shock, or submission, with substantial injury risk at higher force.",
            Scarification: "Creating intentional permanent scars through cutting, abrasion, or branding so the healing pattern becomes body art; this requires professional-grade knowledge and care.",
            Trampling: "Standing, stepping, or walking on a partner's body, ranging from light barefoot pressure to carefully distributed weight with footwear.",
            Waterboarding: "Simulating drowning by restraining a person and applying water over the face or airway; even consensual versions are exceptionally high risk and require specialized expertise.",
            "Corset Piercing": "Placing temporary surface piercings in two parallel rows and lacing ribbon through them to create the appearance of a corset on the skin.",
            Kicking: "Striking a consenting partner with the foot or lower leg to create impact, pain, fear, or rough-treatment dynamics while avoiding vulnerable organs and joints.",
            "Fire Flogging": "Using a specialized flogger with burning fuel on its falls so controlled flame contacts or passes near the body, combining impact and heat in advanced fire play.",
            Bastinado: "Striking the soles of the feet with a cane, rod, strap, or similar implement, producing concentrated pain in a sensitive area.",
            "Abrasion Play": "Rubbing, scraping, or scratching the skin with rough materials, brushes, fingernails, or textured tools to create raw, burning, or prickling sensation.",
            "Flesh Hooks": "Sterile hooks are pierced through skin and may support tension, weights, or suspension; this invasive practice requires expert technique, infection control, and emergency planning.",
            Staples: "Applying sterile skin staples as temporary body decoration, restraint points, or pain stimulus during advanced play, with medical-grade technique and removal required.",
            "Percussion Play": "Rhythmically tapping or drumming on the body with hands, fingers, padded tools, or massage percussion to create vibration, impact, and a trance-like cadence.",
            "Fish Hooks": "Using fishhook-shaped objects as piercing jewelry, skin attachments, or threatening props; actual piercing requires sterile, barbless equipment and expert handling.",
            "Violet Wand": "A violet wand passes high-voltage, low-current electricity through glass electrodes to create visible sparks and sensations ranging from soft tingling to sharp static bites.",
            "Wartenberg Pinwheels": "Rolling a small wheel of radiating metal pins across the skin to create a line of prickling, scratching, or sharply focused sensations.",
            "Panty-Sniffing": "Smelling worn underwear because the garment, a partner's body scent, and the intimacy or humiliation associated with it are sexually arousing.",
            "Tens Unit": "Using a TENS-style electrical stimulation unit with adhesive electrodes to send controlled pulses through muscles or skin as an erotic sensation.",
            Smothering: "Covering or pressing over someone's mouth and nose with a hand, body part, pillow, or material to create breath restriction or helplessness; it is high risk.",
            Cupping: "Placing suction cups on the body to pull skin and tissue upward, creating pressure, warmth, temporary circular marks, and heightened sensitivity.",
            Auralism: "Sexual arousal centered on sound, such as moans, dirty talk, breathing, commands, whispers, impact noises, or the sounds of sexual activity.",
            "Vampire gloves": "Leather or fabric gloves fitted with short metal points are stroked, dragged, or tapped over skin to create fine scratching and prickling sensations.",
            "1950s Household": "Adults roleplay an idealized mid-century household in which one partner acts as the authoritative head and another as the obedient homemaker, often with strict gendered rules.",
            DDlg: "Daddy Dom/little girl is an adult caregiver and age-play dynamic in which one partner takes a protective or authoritative daddy role and another adult takes a little-girl role.",
            "Medical Play": "Adults roleplay examinations or procedures using medical roles, instruments, positioning, exposure, restraint, or clinical language for erotic effect.",
            Dollification: "Transforming or treating a consenting adult like a doll through makeup, clothing, fixed poses, restricted movement, display, objectification, or commands to remain still.",
            "Mommy/girl": "Two adults use a caregiver and age-play dynamic in which one takes a nurturing or controlling mommy role and the other takes a younger-coded girl role.",
            "Sister/Brother Roleplay": "Consenting adults pretend to be siblings and eroticize the fictional taboo or familiarity; the scenario does not imply a real family relationship.",
            "Damsels In Distress": "An adult roleplays being captured, trapped, tied up, threatened, or waiting to be rescued, while another plays the captor, villain, or rescuer.",
            ABDL: "Adult baby/diaper lover interests include adults wearing or using diapers, receiving caregiving, regressing into a baby-like role, or enjoying diapers apart from age play.",
            Superheroes: "Adults roleplay heroes, villains, sidekicks, rescues, captures, secret identities, superpowers, costumes, and comic-book struggles in an erotic scenario.",
            "Victorian Lifestyles": "Erotic roleplay inspired by idealized Victorian dress, manners, class hierarchy, household service, courtship, discipline, or strict social roles.",
            "Piggy Play": "A form of pet or humiliation play in which an adult acts like a pig through crawling, snorting, eating from a bowl, wearing gear, or being called pig-related names.",
            Infantilism: "An adult adopts baby-like behavior, clothing, speech, dependence, or caregiving needs for comfort or erotic roleplay; all participants remain adults.",
            Gor: "Roleplay based on the fictional world of John Norman's Gor novels, commonly involving highly structured master/slave roles, ritualized positions, service, and ownership fantasy.",
            "High Heels": "Wearing or admiring high-heeled shoes because their shape, sound, posture, height, or association with display and authority is sexually exciting.",
            "Pantyhose/Stockings": "Wearing, touching, smelling, or admiring pantyhose and stockings for their sheer appearance, tight fit, texture, or association with legs and lingerie.",
            Fishnets: "Wearing or admiring fishnet stockings, bodysuits, or sleeves because the open mesh frames the skin and creates a distinctive texture and erotic look.",
            Skirts: "Wearing, lifting, looking under, or admiring skirts because of their movement, exposure potential, gendered presentation, or access to the body beneath.",
            "Schoolgirl Uniform": "Adults wear or admire a school-inspired uniform such as a pleated skirt, blouse, tie, or knee socks as a costume for adult roleplay.",
            Cosplay: "Dressing as a fictional character and bringing that character's appearance, personality, powers, or relationships into erotic play or attraction.",
            Lace: "Wearing, touching, or admiring lace because its delicate pattern, transparency, texture, and association with lingerie or formal clothing are arousing.",
            "Knee High Socks": "Wearing or admiring socks that rise to the knee because they frame the legs, create a uniform-like look, or add a soft fabric texture.",
            "Glass Dildos": "Using a smooth, nonporous dildo made of body-safe glass for vaginal or anal penetration, firm pressure, curved stimulation, or carefully controlled temperature play.",
            Glasses: "Wearing or admiring eyeglasses because they shape the face, suggest a particular persona, or form part of an intellectual, strict, shy, or professional look.",
            "Business Suits": "Wearing or admiring tailored suits, shirts, ties, skirts, and formal office clothing because they convey polish, status, professionalism, or authority.",
            "Military Uniforms": "Wearing or admiring military-style uniforms because their structure, insignia, boots, discipline, and association with rank or authority are erotically compelling.",
            "NylonLegs & Feet": "Focusing on legs and feet covered in nylon stockings or pantyhose, including their sheen, scent, texture, compression, and appearance through the fabric.",
            "Sissy Panties": "A consenting adult wears feminine-coded panties as part of feminization, sissification, humiliation, gender play, or simply enjoyment of the garment.",
            Silk: "Wearing, touching, rubbing, or being bound with silk because its smooth, cool, lightweight texture and glossy appearance are sexually appealing.",
            Hoods: "Wearing or placing a hood over the head to alter identity, appearance, sight, sound, or a sense of enclosure, objectification, and control.",
            Gloves: "Wearing, touching, or admiring gloves made of leather, latex, lace, fabric, or another material because of their look, feel, scent, or role-based meaning.",
            "Lycra/Spandex": "Wearing or admiring tight stretch garments that cling to the body, emphasize its shape, and create smooth compression and a slick athletic appearance.",
            Kilts: "Wearing or admiring kilts because of their pleats, cultural or masculine associations, bare-leg styling, movement, and potential access beneath the garment.",
            Satin: "Wearing, touching, or rubbing satin because its glossy surface, fluid drape, and smooth sliding feel against skin are erotically appealing.",
            "Gas Masks": "Wearing or admiring gas masks for their industrial appearance, hidden identity, breathing sounds, enclosed feeling, or dystopian roleplay; filters must not obstruct safe breathing.",
            PVC: "Wearing or admiring shiny polyvinyl clothing because it tightly shapes the body and has a slick, glossy, sometimes squeaking surface.",
            Socks: "Wearing, touching, smelling, or admiring socks because of their fabric, warmth, association with feet, signs of wear, or particular style.",
            Military: "Erotic interest in military aesthetics such as uniforms, boots, rank, drills, discipline, command structures, barracks, or adult soldier roleplay.",
            Steampunk: "Wearing or admiring Victorian-industrial costumes with corsets, goggles, brass, leather, gears, and imagined machinery as part of erotic fantasy or roleplay.",
            Geisha: "Adult costume roleplay inspired by the stylized dress, makeup, music, and hospitality arts associated with geisha, without treating a real culture as automatic sexual consent.",
            Boot: "Wearing, touching, smelling, licking, polishing, or admiring a boot because of its material, shape, authority symbolism, or connection to the wearer's body.",
            Velvet: "Wearing, stroking, or rubbing velvet because its dense soft pile changes direction under the hand and creates a rich visual and tactile sensation.",
            Metal: "Wearing, touching, or being restrained with metal clothing, jewelry, chains, armor, or hardware because of its weight, coldness, hardness, sound, or appearance.",
            Vinyl: "Wearing or admiring glossy vinyl clothing because it clings to the body and has a smooth, shiny, artificial surface associated with fetish fashion.",
            Petticoats: "Wearing or admiring layered petticoats because their volume, rustle, softness, vintage femininity, and effect on a skirt's shape are arousing.",
            Zentai: "Wearing or admiring a skin-tight full-body suit that covers the limbs, torso, and often the head, creating total-body color, smoothness, anonymity, or enclosure.",
            Denim: "Wearing, touching, smelling, or admiring denim because of its rugged texture, tight fit, seams, worn appearance, or association with jeans and workwear.",
            Chaps: "Wearing or admiring leather or fabric leg coverings that leave the buttocks or crotch partly exposed, often evoking cowboys, bikers, or leather culture.",
            Retifism: "A shoe fetish in which footwear itself, especially its shape, material, smell, wearing, handling, or the feet associated with it, is a primary source of arousal.",
            "Big Tits": "Sexual attraction focused on large breasts, including their size, weight, movement, cleavage, appearance, and how they feel or are used during sex.",
            "Older Women": "Sexual or romantic attraction to adult women who are older than the admirer, with age, maturity, appearance, experience, or authority forming part of the appeal.",
            BBW: "Attraction to big beautiful women, generally meaning larger or fat adult women whose body size, curves, softness, weight, or confidence is celebrated.",
            "Foot Worship": "Kissing, licking, massaging, smelling, praising, or serving a partner's feet as objects of devotion, submission, or sexual focus.",
            Pigtails: "Attraction to hair worn in two tied sections because of its movement, symmetry, playfulness, or use as handles during consensual play between adults.",
            Lipstick: "Wearing or admiring lipstick because of its color, gloss, scent, application ritual, feminine presentation, kiss marks, or smearing during sexual activity.",
            Legs: "Sexual attraction focused on the shape, length, muscle, skin, movement, or presentation of legs, including looking, touching, kissing, or being wrapped by them.",
            Tongues: "Sexual attraction focused on tongues, including watching them move, licking, kissing, sucking, oral sex, or being deliberately shown a tongue.",
            Makeup: "Wearing, applying, watching, or admiring cosmetics because they transform the face or body, create a persona, or become smeared during play.",
            "Long Hair": "Attraction to long hair because of its appearance, scent, texture, movement, styling, or how it can be touched, wrapped, pulled, or draped over the body.",
            Freckles: "Sexual or aesthetic attraction to freckles on the face or body, including looking at, tracing, kissing, or praising the marked skin.",
            BBC: "A porn-derived racialized fantasy centered on a Black man's supposedly large penis; it can reduce people to race and anatomy, so real partners should define the language and boundaries they welcome.",
            "Older Men": "Sexual or romantic attraction to adult men who are older than the admirer, with age, maturity, appearance, experience, or authority forming part of the appeal.",
            "Uncut Cock": "Sexual attraction focused on an uncircumcised penis, including the foreskin's appearance, movement, texture, scent, and role in masturbation or oral sex.",
            "Toes and Feet": "Sexual attraction focused on bare feet and toes through looking, touching, licking, sucking, smelling, massaging, trampling, or having them used during sex.",
            Muscles: "Sexual attraction focused on muscular size, definition, strength, flexing, movement, or the feeling of a powerful body during touch and sex.",
            Beards: "Sexual attraction focused on facial hair, including its appearance, texture, scent, masculinity, grooming, or sensation against skin during kissing or oral sex.",
            "Pubic Hair": "Sexual attraction focused on pubic hair, including its natural appearance, texture, scent, grooming style, or sensation against the face and body.",
            "Boot Worship": "Kissing, licking, kneeling before, polishing, smelling, or otherwise serving a partner's boots as an expression of fetish, reverence, humiliation, or submission.",
            "Large Labia": "Sexual attraction focused on prominent inner or outer labia, including their shape, size, movement, appearance, and sensation during touch or oral sex.",
            Depilation: "Removing body or pubic hair from oneself or a partner by shaving, waxing, or another method, with the grooming process or smooth result forming part of the erotic interest.",
            "Facial Hair": "Sexual attraction focused on beards, mustaches, stubble, or other facial hair because of its look, texture, scent, grooming, or sensation against skin.",
            Armpits: "Sexual attraction focused on armpits through looking, smelling, licking, touching, hair, sweat, or the vulnerability of exposed underarms.",
            "Body Hair": "Sexual attraction focused on hair on the chest, back, arms, legs, abdomen, or other body areas because of its look, texture, scent, or naturalness.",
            Hands: "Sexual attraction focused on hands, fingers, nails, veins, strength, movement, or the ways hands touch, restrain, penetrate, or perform skilled actions.",
            "Bald Girls": "Attraction to adult women with shaved or naturally bald heads, with the smooth scalp, exposed facial features, appearance, or transformation forming part of the appeal.",
            Braces: "Attraction to dental braces on an adult, including their metallic appearance, effect on a smile, texture, or association with a particular style or transformation.",
            "Head Shaving": "Shaving one's own or a partner's head, with the transformation, surrender of appearance control, sound of clippers, exposed scalp, or smooth result providing the erotic charge.",
            "Tearing off Clothing": "Ripping, cutting, or forcefully pulling clothes from a consenting partner to create urgency, destruction, exposure, and the feeling of being overcome.",
            Trust: "The erotic or emotional intensity that comes from knowingly placing vulnerability, control, safety, or secrets in a partner's hands and having that responsibility honored.",
            Attention: "One person becomes the deliberate focus of another's gaze, praise, service, questions, touch, or sexual effort, or gives that concentrated attention to a partner.",
            "Mind Fucks": "Using suggestion, staged events, uncertainty, deception within agreed limits, or psychological pressure to make a partner temporarily question what is happening or what will happen next.",
            "Female Humiliation": "Humiliating a consenting woman through agreed words, exposure, objectification, tasks, or treatment that targets her role or presentation as female.",
            Crying: "Making, watching, or experiencing tears during consensual play because of intense emotion, pain, relief, humiliation, catharsis, or surrender.",
            "small penis humiliation": "Using agreed teasing, insults, comparison, denial, or exposure focused on a penis being small, often to create embarrassment, submission, or erotic inadequacy.",
            Fear: "Erotic arousal from feeling scared or from frightening a consenting partner through suspense, threats, pursuit, intimidating props, darkness, or controlled uncertainty.",
            Tears: "Finding tears themselves erotically or emotionally compelling, whether they result from pain, overwhelm, humiliation, relief, joy, or catharsis in a consensual scene.",
            Blushing: "Arousal from causing, noticing, or experiencing visible embarrassment and flushed skin through attention, compliments, exposure, teasing, or explicit conversation.",
            "Emotional Sadism": "Deriving erotic satisfaction from consensually causing emotional discomfort such as embarrassment, jealousy, shame, helplessness, or tears within clearly negotiated limits.",
            Dacryphilia: "Sexual arousal centered on tears or crying, including making a partner cry consensually, being made to cry, or watching and comforting someone who cries during play.",
            "Military Interrogation": "Adults roleplay a military captor questioning a prisoner using rank, commands, restraint, threats, or simulated pressure, with coercive elements agreed in advance.",
            Sexting: "Exchanging sexually explicit messages, fantasies, commands, photos, audio, or video by phone or online to flirt, direct play, or share arousal at a distance.",
            Burlesque: "Performing or watching a theatrical striptease that uses costume, dance, humor, posing, and gradual reveal rather than simply removing clothes quickly.",
            "Sex in the cemetery": "Consensual sexual activity or roleplay set in a cemetery for its taboo, gothic, death-related, or outdoor atmosphere, while respecting laws, privacy, and gravesites.",
            "Pin-Ups": "Attraction to stylized glamour images or poses inspired by classic pin-up art, often featuring playful expressions, retro clothing, stockings, and deliberate display.",
            "Fetish Models": "Attraction to adults who pose in fetish clothing or scenes, such as latex, leather, bondage, heels, or BDSM imagery, whether in photos, video, or live performance.",
            "FMF threesomes": "Sex involving three adults—two women and one man—at the same time, with activities and attention arranged according to everyone's individual interests and boundaries.",
            "Interracial Sex": "Sex between consenting adults of different racial identities, where the difference may be part of the attraction without making racial stereotypes or slurs automatic.",
            Hotwife: "A partnered woman has sex with other people with her partner's knowledge and encouragement, while the partner may watch, hear details, participate, or simply enjoy her freedom.",
            "Cuckold Humiliation": "A consenting partner is erotically humiliated about their partner having sex with someone else, often through comparison, denial, teasing, watching, or being assigned a subordinate role.",
            "Mutual Masturbation": "Two or more people masturbate themselves while together, often watching, touching, talking to, or matching the pace of the others without necessarily having penetrative sex.",
            "Morning Sex": "Sexual activity soon after waking, often emphasizing sleepy intimacy, spontaneous arousal, natural body scent, or beginning the day with touch and orgasm.",
            "Anal Training": "Gradually preparing the anus to comfortably accept fingers, plugs, toys, a penis, or larger objects through repeated relaxation, lubrication, controlled stretching, and increasing sizes.",
            "Fucking Machines": "Motorized devices move a dildo or other attachment in repeated thrusts while a person controls the speed, depth, angle, or restraint of the partner receiving it.",
            "Nipple Play": "Stimulating nipples and surrounding breast or chest tissue through rubbing, sucking, licking, pinching, twisting, vibration, clamps, temperature, or impact.",
            "Road Head": "One adult performs oral sex on another in a vehicle, commonly while it is parked or traveling; involving the driver creates severe distraction and public-exposure risks.",
            "Vaginal Stretching": "Gradually widening the vagina with fingers, toys, fists, or increasingly large objects to create fullness, accommodate insertion, or enjoy the stretching sensation.",
            "Vacuum pumping": "Placing a cylinder or cup over genitals or other tissue and removing air to create suction, swelling, increased blood flow, and heightened sensitivity.",
            "Large objects": "Vaginal or anal penetration with objects notably larger than usual fingers, penises, or toys, emphasizing fullness and stretching through slow, prepared insertion.",
            "Urethral Fucking": "Repeated penetration or movement inside the urethra with a sound, plug, catheter-like toy, or other purpose-made instrument; it is invasive and medically high risk.",
            Catheters: "Inserting a sterile tube through the urethra into the bladder for medical-themed play, control of urination, or internal sensation; improper use can cause serious injury or infection.",
            Queening: "A person sits or kneels over a partner's face, usually presenting the vulva for oral sex and using posture or body weight to emphasize dominance.",
            "Gorean Slave Positions": "A submissive adopts formal poses described in Gor-inspired roleplay to display the body, await orders, present for service, or demonstrate obedience to a master.",
            "Edge Play": "An umbrella term for activities near a person's physical, emotional, or social limits, where consequences or uncertainty may be unusually serious and require advanced negotiation.",
            "Cock Milking": "Stimulating a penis or prostate to extract semen or produce orgasm, often with the receiving person restrained, controlled, repeatedly drained, or treated like a source of fluid.",
            "Tease & Denial": "Bringing someone toward sexual release with touch, toys, words, or display and then withholding, interrupting, or delaying the stimulation or orgasm they want.",
            "Anal Chastity": "Restricting anal access or penetration through rules, plugs, locks, or wearable devices while another person controls when the anus may be used or left empty.",
            Enemas: "Introducing liquid into the rectum through a nozzle or tube and then expelling it, whether for preparation, fullness, cleansing ritual, control, or humiliation play.",
            Breastfeeding: "One adult sucks milk directly from another adult's breast or chest, combining lactation with feeding, nurturing, intimacy, service, or erotic mouth-to-nipple contact.",
            "Creampie Cleanup": "Licking, sucking, wiping, or otherwise removing semen from a partner's vagina, anus, body, or another person's genitals after internal ejaculation.",
            "Toilet slave": "A submissive role in which an adult is used for urine, feces, spitting, cleanup, or toilet-related service and humiliation within explicitly negotiated boundaries.",
            Liquor: "Using the taste, smell, ritual, or imagery of alcohol in erotic play, such as feeding drinks or pouring liquor on skin; intoxication can undermine valid consent.",
            Douching: "Flushing the vagina or rectum with liquid as preparation, cleansing ritual, control, or fetish activity; unnecessary or harsh solutions can irritate tissue and disrupt healthy flora.",
            Nyotaimori: "Serving sushi or other food from the body of a reclining, usually nude adult model, making display, stillness, service, and eating from skin part of the scene.",
            Klismaphilia: "Sexual arousal from enemas, including giving or receiving rectal fluid, holding it, expelling it, watching the process, or eroticizing the medical and control aspects.",
            "Being Overpowered": "A consenting person is physically dominated, pinned, restrained, lifted, or forced into position so they can feel another person's superior strength and control.",
            Manhandling: "Grabbing, moving, pinning, carrying, throwing onto furniture, or forcefully repositioning a consenting partner to create roughness and physical control.",
            "Pursuit, Take-Down & Capture": "One adult chases another, catches them, brings them to the ground or restrains them, and claims them within a negotiated predator-and-prey scenario.",
            "Foot Massage": "Rubbing, kneading, pressing, and handling a partner's feet to provide pleasure, care, service, relaxation, or erotic attention to the feet.",
            "Domestic Servitude": "A submissive performs ongoing household labor such as cooking, cleaning, laundry, organization, and errands as service to a dominant partner.",
            "French Maids": "An adult wears a stylized maid costume and performs cleaning, serving, obedience, flirtation, or punishment roleplay for a partner acting as employer or guest.",
            Maid: "An adult takes a domestic servant role by cleaning, dressing in maid attire, following household orders, serving refreshments, or being inspected and corrected.",
            Crawling: "A consenting adult moves on hands and knees at another person's command, often to express submission, animal roleplay, exposure, service, or reduced status.",
            "Boot Blacking": "Cleaning, conditioning, polishing, and shining a partner's leather boots as skilled service, fetish handling, ritual devotion, or a formal part of leather culture.",
            "Erotic Literature": "Reading or listening to sexually explicit fiction for arousal, fantasy, self-discovery, shared entertainment, or ideas for consensual play.",
            Anime: "Erotic interest in the visual style, characters, costumes, scenarios, or fan culture of Japanese animation, whether through adult characters, art, cosplay, or roleplay.",
            Hentai: "Sexually explicit drawn or animated material in a Japanese comics or animation style, featuring fictional characters and acts intended for adult audiences.",
            "Writing Erotica": "Creating sexually explicit fiction, scenes, dialogue, or fantasies for personal arousal, creative expression, a partner, or an audience.",
            Transvestism: "An older term for erotic cross-dressing: wearing clothing associated with another gender because the presentation, transformation, or fabric itself is sexually exciting.",
            Androgyny: "Attraction to or enjoyment of a presentation that blends or obscures conventionally masculine and feminine traits through body, clothing, hair, voice, or manner.",
            Butches: "Attraction to butch adults whose gender presentation emphasizes masculinity, toughness, confidence, style, or roles associated with butch identity.",
            Psycholagny: "Sexual arousal generated primarily by thoughts, fantasies, memories, words, or imagined scenarios rather than by direct physical stimulation.",
            Affection: "Giving or receiving warm emotional and physical care through kissing, cuddling, praise, reassurance, tenderness, and loving attention before, during, or after play."
        }, He = {
            "Power exchange": [ "authority", "authority" ],
            "Bondage & restriction": [ "restraint", "restraint" ],
            "Impact, pain & body modification": [ "impact or pain", "impact or pain" ],
            "Sensation & atmosphere": [ "sensation", "sensation" ],
            "Roleplay & identity": [ "role or scenario", "role or scenario" ],
            "Clothing, materials & objects": [ "garment, material, or object", "garment, material, or object" ],
            "Body focus & appearance": [ "attention or admiration", "attention or admiration" ],
            "Psychological dynamics": [ "words or psychological pressure", "words or psychological pressure" ],
            "Watching, exposure & settings": [ "attention or a view", "attention or a view" ],
            "Partner configurations": [ "partner arrangement", "partner arrangement" ],
            "Sex acts": [ "sexual act", "sexual act" ],
            Positions: [ "sexual position", "sexual position" ],
            "Orgasm & reproductive play": [ "orgasm control or reproductive fantasy", "orgasm control or reproductive fantasy" ],
            "Fluids & messy play": [ "body fluid or mess", "body fluid or mess" ],
            "Primal & pursuit": [ "the chase", "the chase" ],
            "Service & ritual": [ "service or ritual", "service or ritual" ],
            "Fantasy & transformation": [ "fantasy or transformation", "fantasy or transformation" ],
            "Connection & aftercare": [ "care or reassurance", "care or reassurance" ],
            "Collars & symbols": [ "collar or symbol", "collar or symbol" ],
            "Reward & correction": [ "reward or correction", "being rewarded or corrected" ],
            Discipline: [ "discipline or consequence", "being disciplined or facing consequences" ],
            Begging: [ "plea or request", "decision or permission" ],
            "Rope bondage": [ "rope restraint", "rope restraint" ],
            "Decorative rope": [ "decorative rope", "decorative rope" ],
            "Japanese bondage": [ "kinbaku or shibari rope", "kinbaku or shibari rope" ],
            "Cuffs & straps": [ "cuff or strap restraint", "cuff or strap restraint" ],
            "Spreaders & bars": [ "spreader-bar restraint", "spreader-bar restraint" ],
            "Tape & wrapping": [ "tape or wrapping restraint", "tape or wrapping restraint" ],
            Gags: [ "gag", "gag" ],
            Mummification: [ "full-body wrapping", "full-body wrapping" ],
            "Furniture restraint": [ "furniture restraint", "furniture restraint" ],
            "Blindfolded restraint": [ "blindfolded restraint", "blindfolded restraint" ],
            "Escape play": [ "escape challenge", "escape attempt" ],
            Immobilization: [ "immobilization", "immobilization" ],
            Spanking: [ "open-hand impact", "open-hand impact" ],
            "Paddles & straps": [ "paddle or strap impact", "paddle or strap impact" ],
            Flogging: [ "flogger strokes", "flogger strokes" ],
            Caning: [ "cane strikes", "cane strikes" ],
            "Riding crops": [ "riding-crop strikes", "riding-crop strikes" ],
            Whips: [ "whip strikes", "whip strikes" ],
            Clamps: [ "clamp pressure", "clamp pressure" ],
            "Hair pulling": [ "hair pulling", "having your hair pulled" ],
            "Needle Play": [ "needles or piercing", "needles or piercing" ],
            Sounding: [ "urethral sound", "urethral sound" ],
            "Heavy marking": [ "marks", "marks" ],
            "Extreme endurance": [ "intense challenge", "intense pain or stimulation" ],
            "Wax & temperature": [ "heat or cold", "heat or cold" ],
            "Ice & cool touch": [ "cold touch", "cold touch" ],
            Tickling: [ "tickling", "being tickled" ],
            "Electrical Play": [ "electrical stimulation", "electrical stimulation" ],
            "Sensory deprivation": [ "reduced sensory input", "reduced sensory input" ],
            "Sensory overload": [ "intense sensory input", "intense sensory input" ],
            "ASMR & whispering": [ "whispers or ASMR sounds", "whispers or ASMR sounds" ],
            Scent: [ "scent", "scent" ],
            "Tantra / energy play": [ "tantric practice or energy work", "tantric practice or energy work" ],
            "Authority roles": [ "authority", "authority" ],
            "Caregiver roles (adults)": [ "care or supervision", "care or supervision" ],
            "Age play between adults": [ "older role", "younger role" ],
            "Pet play": [ "pet role", "handling or ownership" ],
            "Pony Play": [ "pony role", "training or handling" ],
            "Puppy play": [ "pup role", "training or handling" ],
            "Owner & property": [ "ownership", "ownership" ],
            "Doctor/Nurse Play": [ "medical roleplay", "medical roleplay" ],
            "Teacher / student roleplay": [ "lesson or authority", "lesson or authority" ],
            "Captivity / kidnapping": [ "capture", "capture or confinement" ],
            "Consensual non-consent fantasy": [ "overpowering a partner (in fantasy)", "being overpowered (in fantasy)" ],
            "Captivity / kidnapping": [ "capturing & holding a partner captive", "being captured & held captive" ],
            Leather: [ "leather", "leather" ],
            "Latex & rubber": [ "latex or rubber", "latex or rubber" ],
            "Lingerie & stockings": [ "lingerie or stockings", "lingerie or stockings" ],
            Uniforms: [ "uniform", "uniform" ],
            "Heels & boots": [ "heels or boots", "heels or boots" ],
            "Masks & hoods": [ "mask or hood", "mask or hood" ],
            Harnesses: [ "harness", "harness" ],
            Diapers: [ "diaper", "diaper" ],
            "Food / messy play": [ "food or mess", "food or mess" ],
            Fur: [ "fur", "fur" ],
            "Anal beads": [ "anal beads", "anal beads" ],
            Pumps: [ "vacuum pumping", "vacuum pumping" ],
            Showerheads: [ "water stimulation", "water stimulation" ],
            "Costume transformation": [ "costume", "costume" ],
            "Feet & footwear": [ "attention to feet or footwear", "attention to feet or footwear" ],
            "Hands & gloves": [ "attention to hands or gloves", "attention to hands or gloves" ],
            Hair: [ "attention to hair", "attention to hair" ],
            Breasts: [ "attention to breasts or nipples", "attention to breasts or nipples" ],
            Buttocks: [ "attention to buttocks", "attention to buttocks" ],
            "Body worship": [ "body worship", "body worship" ],
            "Muscle Worship": [ "muscle worship", "muscle worship" ],
            "Body Modification": [ "tattoo or body modification", "tattoo or body modification" ],
            "Praise (in scene)": [ "praise", "praise" ],
            "Humiliation language": [ "humiliating words", "humiliating words aimed at you" ],
            Degradation: [ "degrading treatment", "being degraded" ],
            "Dirty talk": [ "explicit words", "explicit words" ],
            Objectification: [ "treating a partner as an object", "being treated as an object" ],
            "Hypnosis & mind-control fantasy": [ "hypnotic suggestions or control", "being hypnotized or mind-controlled (in fantasy)" ],
            "Fear Play": [ "scaring a partner", "being frightened" ],
            Interrogation: [ "questions & pressure", "being questioned under pressure" ],
            "Confession & secrets": [ "a partner's confession or secrets", "confessing your own secrets" ],
            "Watching & being watched": [ "attention or a view", "attention or a view" ],
            "Private photo & video": [ "intimate image or video", "intimate image or video" ],
            "Performance for a partner": [ "sexual performance", "sexual performance" ],
            "Exhibition / voyeurism": [ "performance or exposure", "performance or exposure" ],
            "Cuckold / hotwife": [ "outside-partner sex", "knowledge, details, or a view of outside-partner sex" ],
            "Group service": [ "serving a group", "being served by a group" ],
            Gangbang: [ "participating in a gangbang", "being the focus of a gangbang" ],
            "Age gap": [ "older partner", "younger partner" ],
            "Anal fingering": [ "fingers", "fingers in the anus" ],
            Rimming: [ "mouth and tongue", "oral stimulation of the anus" ],
            Creampies: [ "semen", "semen inside" ],
            Facefucking: [ "oral penetration", "penis or strap-on in the mouth" ],
            Facesitting: [ "genitals, anus, or crotch", "genitals, anus, or body weight on the face" ],
            Facials: [ "semen", "semen on the face" ],
            "Fingering mouths": [ "fingers", "fingers in the mouth" ],
            "Vaginal fisting": [ "hand", "hand in the vagina" ],
            "Anal fisting": [ "hand", "hand in the anus or rectum" ],
            Handjobs: [ "hand stimulation", "hand stimulation of the penis" ],
            Pegging: [ "strap-on penetration", "strap-on in the anus" ],
            Squirting: [ "squirt fluid", "stimulation that causes squirting" ],
            "Vaginal fingering": [ "fingers", "fingers in the vagina" ],
            "Anal sex": [ "anal penetration", "penis, strap-on, or toy in the anus" ],
            "Oral sex": [ "oral stimulation", "mouth and tongue on the genitals or anus" ],
            Penetration: [ "penetration", "penis, fingers, fist, or toy inside" ],
            "Orgasm control": [ "orgasm permission or control", "having your orgasms controlled" ],
            "Orgasm denial": [ "orgasm denial", "denied orgasm" ],
            Chastity: [ "chastity control", "restricted access or release" ],
            Edging: [ "near-orgasm stimulation", "near-orgasm stimulation" ],
            Teasing: [ "teasing stimulation", "teasing stimulation" ],
            "Breeding / pregnancy fantasy": [ "sperm", "sperm or pregnancy" ],
            "Surrogacy fantasy": [ "pregnancy", "pregnancy carried by a surrogate" ],
            "Oviposition fantasy": [ "eggs", "eggs" ],
            Watersports: [ "urine", "urine" ],
            Lactation: [ "breast milk", "breast milk" ],
            "Blood play": [ "blood", "blood" ],
            Spit: [ "saliva", "saliva" ],
            "Hunter / prey": [ "the hunt — pursuing & catching your prey", "being hunted, chased & caught" ],
            "Chase scenes": [ "pursuing & catching", "being pursued & caught" ],
            "Wrestling & struggle": [ "grappling & pinning", "being grappled & pinned" ],
            "Biting & scratching": [ "bites & scratches", "bites & scratches on your skin" ],
            "Acts of service": [ "service", "service" ],
            "Domestic service": [ "household work", "household work" ],
            "Grooming rituals": [ "grooming or bodily care", "grooming or bodily care" ],
            "Dressing a partner": [ "clothes, lingerie, or gear", "clothes, lingerie, or gear" ],
            "Permission rituals": [ "permission", "permission" ],
            "Daily tasks": [ "task", "task" ],
            "Spiritual play": [ "sacred ritual or spiritual experience", "sacred ritual or spiritual experience" ],
            "Romantic surrender": [ "surrender or devotion", "surrender or devotion" ],
            "Seduction scenarios": [ "seduction", "seduction" ],
            "Growth / shrinking fantasy": [ "size contrast", "size contrast" ],
            Crossdressing: [ "gendered clothing or presentation", "gendered clothing or presentation" ],
            "Celebrity fantasy": [ "celebrity fantasy", "celebrity fantasy" ],
            Sissification: [ "feminizing a partner", "being feminized" ],
            "Food & hydration": [ "food or drink", "food or drink" ],
            "Praise (aftercare)": [ "praise or reassurance", "praise or reassurance" ]
        }, We = {
            "cat-power-exchange": [ "dom", "sub" ],
            "cat-bondage-restriction": [ "restrains", "restrained" ],
            "cat-impact-pain-body-modification": [ "applies", "receives" ],
            "cat-sensation-atmosphere": [ "stimulates", "experiences" ],
            "cat-roleplay-identity": [ "leads", "follows" ],
            "cat-clothing-materials-objects": [ "admires", "wears / uses" ],
            "cat-body-focus-appearance": [ "displays", "admires" ],
            "cat-psychological-dynamics": [ "influences", "experiences" ],
            "cat-watching-exposure-settings": [ "watches", "is watched" ],
            "cat-partner-configurations": [ "arranges", "joins" ],
            "cat-sex-acts": [ "performs", "receives" ],
            "cat-positions": [ "initiates", "joins" ],
            "cat-orgasm-reproductive-play": [ "controls", "is controlled" ],
            "cat-fluids-messy-play": [ "releases / uses", "receives" ],
            "cat-primal-pursuit": [ "hunter", "prey" ],
            "cat-service-ritual": [ "serves", "is served" ],
            "cat-fantasy-transformation": [ "transforms", "is transformed" ],
            "cat-connection-aftercare": [ "cares", "is cared for" ],
            "t0006": [ "grants", "begs" ],
            "t0003": [ "wears", "admires" ],
            "topic-gangbang-fantasy": [ "fucks in group", "is fucked by group" ],
            "t0045": [ "captures", "escapes" ],
            "t0097": [ "pushes", "endures" ],
            "t0127": [ "authority", "subordinate" ],
            "topic-caregiver-roles-adults": [ "caregiver", "little" ],
            "topic-age-play-between-adults": [ "plays older", "plays younger" ],
            "topic-pet-play": [ "handler", "pet" ],
            "topic-pony-play": [ "trainer", "pony" ],
            "topic-puppy-play": [ "handler", "pup" ],
            "t0131": [ "owner", "property" ],
            "topic-doctor-nurse-play": [ "clinician", "patient" ],
            "topic-teacher-student-roleplay": [ "teacher", "student" ],
            "topic-captivity-kidnapping": [ "captures", "is captured" ],
            "topic-consensual-non-consent-fantasy": [ "overpowers", "is overpowered" ],
            "t0153": [ "wears", "admires" ],
            "t0152": [ "wears", "admires" ],
            "t0181": [ "wears", "admires" ],
            "t0176": [ "wears", "admires" ],
            "t0166": [ "wears", "admires" ],
            "topic-masks-hoods": [ "admires", "wears" ],
            "t0196": [ "wears", "admires" ],
            "t0185": [ "admires", "wears" ],
            "t0162": [ "admires", "wears" ],
            "t0236": [ "is modified", "admires" ],
            "t0237": [ "worships", "is worshipped" ],
            "t0220": [ "worships", "is worshipped" ],
            "topic-feet-footwear": [ "worships", "is worshipped" ],
            "t0222": [ "adores", "is adored" ],
            "t0234": [ "plays big", "plays small" ],
            "t0266": [ "watches", "is watched" ],
            "t0270": [ "exhibits", "watches" ],
            "t0316": [ "makes squirt", "squirts" ],
            "t0328": [ "locks", "is locked" ],
            "t0332": [ "surrogate", "parent" ],
            "t0351": [ "hunter", "prey" ],
            "t0352": [ "chase (be the chaser)", "be chased" ],
            "t0353": [ "wrestle down", "be wrestled down" ],
            "t0354": [ "bite & scratch", "be bitten & scratched" ],
            "t0381": [ "big", "small" ],
            "t0385": [ "wears", "admires" ],
            "t0375": [ "accepts", "surrenders" ]
        };
        h.forEach(cat => (cat.topics || []).forEach(topic => {
            if (!topic || "give_receive" !== topic.type) return;
            const n = Wn(topic);
            We[n] = [ topic.give_label, topic.receive_label ];
        }));
        const Ue = new Set([ "t0002", "t0007", "t0008", "t0102", "t0106", "t0107", "t0108", "t0140", "topic-vampires-gothic", "topic-historical-fantasy", "t0377", "t0378", "t0379", "t0380", "t0382", "t0383", "t0384", "t0317", "t0318", "t0319", "t0320", "t0321", "t0322", "t0323", "t0278", "t0279", "t0280", "t0282", "t0258", "t0361", "t0366", "t0396", "t0397", "t0399", "t0401", "t0402", "t0403", "t0269" ]);
        function Ge(e, t = Vi()) {
            const n = (at[t] || {})[e], i = n && n.parentId || e;
            // The topic's own give/receive labels win. A parent id in the
            // single-slider set must not collapse Edge Play (or any other
            // give/receive topic) to one "everything" slider.
            if (We[e] && !Ue.has(e)) return {
                single: !1,
                keys: [ "give", "receive" ],
                labels: We[e]
            };
            return Ue.has(i) ? {
                single: !0,
                keys: [ "give" ],
                labels: [ "everything" ]
            } : {
                single: !1,
                keys: [ "give", "receive" ],
                labels: We[i] || [ "give", "receive" ]
            };
        }
        h.forEach(e => Object.entries(e.topicDetails || {}).forEach(([e, t]) => {
            "single" === t.type && Ue.add(Wn(e));
        }));
