    !function() {
        "use strict";
        const {DOM: e, TimerManager: t, setHTML: n} = window.SexcapadesRuntime, i = [ "Hard Limit (×): HARD EXCLUDE the topic. Never mention it—not as action, dialogue, a tease, suggestion, fantasy, setup, backstory, or background detail.", "Not Interested (⊘): HARD EXCLUDE the topic exactly like a Hard Limit. Never mention it—not as action, dialogue, a tease, suggestion, fantasy, setup, backstory, or background detail.", "Favorite (★): PRIORITIZE the topic prominently over unmarked topics while obeying ratings, give/receive roles, shared-ground limits, and consent." ], a = [ "Fantasy-only (☁): INCLUDE only as a clearly imagined fantasy, dream, or internal thought; make clear it is imagined, not real-world play or willingness.", "Already Tried (✓): REFERENCE as past experience (for example, “they’d done this before”) without inventing details or assuming current consent." ], r = [ "Fantasy-only (☁): EXCLUDE entirely from practical play guides; never schedule, suggest, tease, or describe it as real-world play.", "Already Tried (✓): REFERENCE as past experience (for example, “Since you’ve tried X, you might…”) while confirming current consent and avoiding invented details." ], o = new Set;
        /* P2 refactor (Build 2026-10-18_2252): unified closest() dispatch (P2-3).
           Every ancestor lookup in this bundle now routes through the single
           __sxClosestAction(el, action) handler below; the selector strings
           that used to be scattered across 120 call sites live once in the
           __sxActionSelectors dispatch table, keyed by action name. A name
           missing from the table is passed through as a raw selector (the
           export hidden-badge sweep passes a computed one), so behavior at
           every former call site is unchanged. */
        const __sxActionSelectors = {
            directionControl: ".direction-control",
            nodeGroup: ".node-group",
            outlineDescTriggerRich: ".outline-description-trigger[data-outline-description]",
            outlineDirection: "[data-outline-direction]",
            uiTooltip: "[data-ui-tooltip]",
            viewButton: "button[data-view]",
            centerHit: ".center-hit",
            outlineDescTrigger: ".outline-description-trigger",
            addProfile: "[data-add-profile]",
            genderValue: "[data-gender-value]",
            sexualityValue: "[data-sexuality-value]",
            roleValue: "[data-role-value]",
            outlineRow: ".outline-row",
            glancePracticeIcon: ".glance-tooltip-practice-icon[data-popularity-tooltip]",
            summaryAncestor: "summary",
            tooltipTapFirst: "[data-tooltip-tap-first]",
            profileNameInput: "[data-profile-name-input]",
            profileVeil: "[data-profile-veil]",
            profileHeat: "[data-profile-heat]",
            profileLoad: "[data-profile-load]",
            introBlock: ".intro",
            glanceNode: "[data-glance-node]",
            hiddenState: ".is-hidden",
            interactiveAncestor: "dialog,button,input,textarea,select,.profile-add-menu,.mark-menu,.glance-tooltip",
            centerBranchToggle: "[data-center-branch-toggle]",
            relationHit: ".common-overlap-link.relation-hit",
            secondGenRatingControls: ".second-gen-rating-controls-only",
            markNoteField: ".mark-note-field",
            openLocalCommunities: "[data-open-local-communities]",
            markMeta: ".mark-meta",
            outlineRating: ".outline-rating",
            outlineSubcategoryDisclosure: ".outline-subcategory-disclosure,.glance-tooltip-practice-icon",
            outlineTooltipSource: ".outline-branch-disclosure[data-outline-disclosure-tooltip],.outline-description-trigger[data-outline-description],.glance-tooltip-practice-icon[data-popularity-tooltip],.outline-rating[data-rating-tooltip]",
            outlineBranchDisclosure: ".outline-branch-disclosure[data-outline-disclosure-tooltip]",
            outlineSubcategory: ".outline-subcategory",
            outlineBranch: ".outline-branch",
            outlineNoteInput: "[data-outline-note-input]",
            outlineNote: "[data-outline-note]",
            outlineMarkFlag: "[data-outline-mark],[data-outline-flag]",
            uiTooltipHover: "[data-ui-tooltip]:not([data-tooltip-tap-first]):not([data-tooltip-hover-only])",
            saveProfile: "[data-save-profile]",
            closeProfile: "[data-close-profile]",
            topicDropdownOption: ".topic-dropdown-option",
            topicTreeToggle: ".topic-tree-toggle",
            searchLabel: "label.search",
            topicPicker: ".topic-picker",
            linkOrButton: "a,button",
            glanceSource: "[data-glance-source]",
            glanceSourceFull: "[data-glance-source],[data-center-glance-index],.stat-number",
            scenePhase: ".scene-phase",
            novelAiField: ".novel-ai-field",
            ratingHitAny: ".direction-hit,.rating-track-hit.active-rating,.rating-clear-hit",
            centerGlanceRingHit: ".center-glance-ring-hit",
            hiddenCountBadge: ".hidden-count-badge",
            directionHit: ".direction-hit",
            curveEditHandle: ".curve-edit-handle",
            conceptHit: ".concept-hit",
            mapLabelHit: ".category-toggle-hit,.category-label,.map-label,.concept-hit,.topic-stem,.branch-icon,.topic-icon",
            ratingTrackHit: ".rating-track-hit",
            ratingClearHit: ".rating-clear-hit",
            categoryLabel: ".category-label",
            mapCard: ".map-card",
            exportPhoto: "[data-export-photo]",
            lowresPhoto: "[data-lowres-photo]",
            profileInfo: "[data-profile-info], [data-profile-info-popover]",
            sampleProfile: "[data-sample-profile]",
            removePhoto: "[data-remove-photo]",
            movePhoto: "[data-move-photo]",
            adjustPhoto: "[data-adjust-photo]",
            ktNav: "[data-kt-nav]",
            testIndex: "[data-test-index]",
            testNote: "[data-test-note]",
            testChoiceGroup: ".test-choice-group"
        };
        function __sxClosestAction(el, action) {
            if (!el || "function" != typeof el.closest) return null;
            const sel = Object.prototype.hasOwnProperty.call(__sxActionSelectors, action) ? __sxActionSelectors[action] : action;
            return el.closest(sel);
        }
        let s = "";
        function l() {
            if (globalThis.crypto && "function" == typeof globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
            const e = new Uint8Array(16);
            if (globalThis.crypto && "function" == typeof globalThis.crypto.getRandomValues) globalThis.crypto.getRandomValues(e); else for (let t = 0; t < e.length; t++) e[t] = Math.floor(256 * Math.random());
            return e[6] = 15 & e[6] | 64, e[8] = 63 & e[8] | 128, Array.from(e, (e, t) => `${4 === t || 6 === t || 8 === t || 10 === t ? "-" : ""}${e.toString(16).padStart(2, "0")}`).join("");
        }
        const makeProfileUuid = l;
        function c() {
            return s || (s = makeProfileUuid()), s;
        }
        window.__sxAnonUuid = c;
        const d = function() {
            let e = "";
            try {
                e = new URLSearchParams(location.search).get("utm_source") || "";
            } catch (e) { __sxErrLog("utm-source", e); }
            try {
                e ? sessionStorage.setItem("sexcapades_utm_source", e) : e = sessionStorage.getItem("sexcapades_utm_source") || "";
            } catch (e) { __sxErrLog("utm-source", e); }
            return e.slice(0, 120);
        }();
        /* Canonical collect endpoint for the bundle layer. The shell
           layer (index.html) cannot see this closure, so it keeps its
           own mirror constant, SX_SHELL_COLLECT_URL, with the same
           value; keep the two in sync. */
        const SX_COLLECT_URL = "https://sexcapades.io/hosted/api/collect.php";
        async function u(e) {
            const t = await fetch(SX_COLLECT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(e),
                keepalive: !0
            });
            if (!t.ok) throw new Error(`Collection endpoint returned ${t.status}.`);
            return t;
        }
        /* Analytics policy (ruled): navigation analytics — the
           gate_passed and session_stats events sent from this module —
           are ALWAYS collected; there is no opt-out for them, so the
           send sites below are unconditional. Survey contribution is
           separately opt-out and is not governed here. (F8: this comment
           replaces the former gate function, which read a stored opt-out
           key that nothing ever wrote and consulted an override hook
           that nothing ever set, so it always answered yes in practice;
           the always-on behavior is unchanged, now stated plainly.) */
        /* Shared analytics send path (F3): hostname guard, sessionStorage
           dedup under the caller-supplied key, in-flight guard, POST via
           the raw helper u(), the sent marker written ONLY on success
           (a failed send stays unmarked and can retry on a later call),
           and log-on-failure. Every bundle analytics event — generic
           events via p() and session_stats via bs() — goes through here.
           The survey sender (hw) is NOT routed through this path: its
           sends are user-consented data contributions, not analytics
           events, and it is deliberately not hostname-guarded. */
        /* STANDING OWNER LAW — DO NOT DISABLE: this send path is the
           owner's own analytics (gate_passed / session_stats to
           collect.php, anonymous UUID + utm_source) and is ALWAYS
           collected with no opt-out, per the owner's standing ruling.
           No builder, editor, or audit/security correction may disable,
           remove, gate, consent-wall, or early-return this function or
           any of its call sites. A finding that names this path must be
           DISCLOSED to the owner, never acted on. Restored 2026-11-01
           after a builder disabled it without authorization. */
        function sxSendAnalytics(e, t) {
            if ("sexcapades.io" !== location.hostname && "www.sexcapades.io" !== location.hostname) return;
            try {
                if ("sent" === sessionStorage.getItem(t)) return;
            } catch (e) { __sxErrLog("storage", e); }
            o.has(t) || (o.add(t), u(e).then(() => {
                try {
                    sessionStorage.setItem(t, "sent");
                } catch (e) { __sxErrLog("storage", e); }
            }).catch((e) => { __sxErrLog("storage", e); }).finally(() => o.delete(t)));
        }
        function p(e) {
            sxSendAnalytics({
                action: "event",
                uuid: c(),
                event_type: e,
                utm_source: d
            }, `sexcapades_event_${e}`);
        }
        // GATE-PASSED SIGNAL (marked by the shell-ui stage, 2026-10-27):
        // this single line is the app's gate-passed signal. It fires once
        // when this module loads — which only happens after the age gate
        // has been passed — and records that fact as a navigation
        // analytics event (always collected, no opt-out; see the policy
        // note above). Do not move, wrap, gate, or delete this line
        // without an owner ruling.
        p("gate_passed");
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
        const Ke = new Set;
        function ze(e, t) {
            return new Proxy(t, {
                deleteProperty: (t, n) => (console.error(`Blocked an unexpected ${e} deletion for ${String(n)}.`), 
                !0)
            });
        }
        const Ve = window.__SEXCAPADES_PROFILE_SESSION__ || (window.__SEXCAPADES_PROFILE_SESSION__ = {
            profileRecords: {},
            profileNameRecords: {},
            ratingSources: {},
            annotations: {},
            fantasyOnly: {},
            alreadyTried: {},
            profileNotes: {},
            profileAbout: {},
            profileTerms: {},
            importedChildren: {},
            profileGenders: {},
            profilePronouns: {},
            profileSexualities: {},
            profileRoles: {},
            profileAges: {},
            profileLocations: {},
            profilePhotos: {},
            profileContacts: {},
            profileVeils: {},
            profileVeilEnabled: {},
            loaderStates: {},
            profileCompletionTimes: {},
            profileComparisons: {},
            profileDirty: {},
            profileUuids: {},
            profileSampleFlags: {},
            droppedKeys: {},
            curveBends: {}
        }), {profileRecords: Ye, profileNameRecords: Xe, ratingSources: Ze, annotations: Qe, fantasyOnly: Je, alreadyTried: et, profileNotes: tt, profileAbout: nt, profileTerms: it, importedChildren: at, profileGenders: rt, profilePronouns: pz = {}, profileSexualities: ot, profileRoles: st, profileAges: lt, profileLocations: ct, profilePhotos: dt, profileContacts: ut, profileVeils: vpt, profileVeilEnabled: vht, loaderStates: gt, profileCompletionTimes: mt, profileComparisons: ft, profileDirty: yt, profileUuids: profileUuids, profileSampleFlags: sampleProfileFlags, droppedKeys: droppedKeyRecords, curveBends: bt} = Ve, vt = ze("profile", Ye), wt = ze("profile name", Xe), kt = {
            outline: "List rating",
            kinktest: "KinkTest.co.uk",
            checklist: "Yes / No / Maybe"
        };
        function xt(e) {
            const t = Math.max(0, Math.floor(Number(e) || 0)), n = Math.floor(t / 60), i = t % 60;
            return `${String(n).padStart(2, "0")}:${String(i).padStart(2, "0")}`;
        }
        function St(e) {
            const t = {};
            return e && "object" == typeof e ? (Object.keys(kt).forEach(n => {
                const i = e[n];
                if (!i || "object" != typeof i) return;
                const a = Math.max(0, Math.min(86400, Math.floor(Number(i.durationSeconds) || 0))), r = Number.isNaN(Date.parse(i.completedAt)) ? "" : new Date(i.completedAt).toISOString(), o = Math.max(0, Math.floor(Number(i.count) || 0)), s = Math.max(o, Math.floor(Number(i.total) || 0)), l = "outline" === n && Boolean(i.timerRan || a > 0);
                r && (t[n] = {
                    durationSeconds: a,
                    completedAt: r,
                    count: o,
                    total: s,
                    ...l ? {
                        timerRan: !0
                    } : {}
                });
            }), t) : t;
        }
        function $t(e, t, n, i, a, r = {}) {
            vt[e] && kt[t] && ((mt[e] || (mt[e] = {}))[t] = {
                durationSeconds: Math.max(0, Math.floor(Number(n) || 0)),
                completedAt: (new Date).toISOString(),
                count: Math.max(0, Math.floor(Number(i) || 0)),
                total: Math.max(0, Math.floor(Number(a) || 0)),
                ..."outline" === t && r.timerRan ? {
                    timerRan: !0
                } : {}
            }, zt(e));
        }
        const Et = "__empty-profile-preview__", At = {};
        Ze[Et] = {}, Qe[Et] = {}, Je[Et] = {}, et[Et] = {}, tt[Et] = {}, at[Et] = {};
        let Ct = !1, Mt = null, It = null, Pt = "all", Lt = null, Tt = "", Nt = null, Dt = null, Rt = !1, Ot = "all", Bt = !0;
        let sxSelEditorMirrored = null;

        // Phase 2: Semantic state aliases and runtime state bridge
        const sxProfileRatings = vt;
        const sxProfileNames = wt;
        const sxProfileAnnotations = Qe;
        const sxProfileComparisons = ft;
        const sxProfileDirty = yt;
        const sxRatingSources = Ze;
        const sxFantasyOnly = Je;
        const sxAlreadyTried = et;
        const sxProfileNotes = tt;
        const sxImportedChildren = at;
        const sxProfileVeils = vpt;
        const sxProfileVeilEnabled = vht;
        const sxProfileTimes = mt;

        function sxGetActiveProfileId() { return Mt; }
        function sxSetActiveProfileId(id) { Mt = id; }
        function sxGetSelectedTopicId() { return Lt; }
        function sxSetSelectedTopicId(id) { Lt = id; }
        function sxGetSearchTerm() { return Tt; }
        function sxSetSearchTerm(term) { Tt = term; }
        function sxGetCategoryFilter() { return Pt; }
        function sxSetCategoryFilter(f) { Pt = f; }

        window.SexcapadesRuntime = window.SexcapadesRuntime || {};
        window.SexcapadesRuntime.State = {
            getActiveProfileId: sxGetActiveProfileId,
            setActiveProfileId: sxSetActiveProfileId,
            getSelectedTopicId: sxGetSelectedTopicId,
            setSelectedTopicId: sxSetSelectedTopicId,
            getSearchTerm: sxGetSearchTerm,
            setSearchTerm: sxSetSearchTerm,
            getCategoryFilter: sxGetCategoryFilter,
            setCategoryFilter: sxSetCategoryFilter,
            getRatings: (id) => (id ? vt[id] : vt),
            getNames: (id) => (id ? wt[id] : wt),
            getVeils: (id) => (id ? vpt[id] : vpt),
            getVeilEnabled: (id) => (id ? vht[id] : vht),
            getComparisons: (id) => (id ? ft[id] : ft),
            getDirty: (id) => (id ? yt[id] : yt),
            getNotes: (id) => (id ? tt[id] : tt),
            raw: {
                ratings: vt,
                names: wt,
                annotations: Qe,
                comparisons: ft,
                dirty: yt,
                sources: Ze,
                alreadyTried: et,
                notes: tt,
                importedChildren: at,
                veils: vpt,
                veilEnabled: vht,
                times: mt
            }
        };
        function jt() {
            return Mt && yt[Mt] ? Mt : Object.keys(yt).find(e => vt[e] && yt[e]) || null;
        }
        let qt = !1, Ht = null, Wt = !1;
        const draftRatings = Object.create(null), draftSaveTimers = Object.create(null);
        function cloneProfileData(e) {
            try {
                return JSON.parse(JSON.stringify(e));
            } catch (e) {
                return null;
            }
        }
        function queueDraftAutosave(e) {
            e && vt[e] && (draftRatings[e] = cloneProfileData(vt[e]) || {}, draftSaveTimers[e] && t.clear(draftSaveTimers[e]), 
            draftSaveTimers[e] = t.setTimeout(() => {
                delete draftSaveTimers[e];
                const n = window.SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x"), i = window.Sexcapades2xRememberProfiles;
                n && n.checked && i && "function" == typeof i.saveNow && i.saveNow() && Vt(e);
            }, 500));
        }
        function Ut(e) {
            !qt && jt() && (e.preventDefault(), e.returnValue = !0);
        }
        function Gt() {
            const e = Boolean(jt());
            document.documentElement.classList.toggle("has-unsaved-changes", e), document.body.classList.toggle("has-unsaved-changes", e), 
            e && !Wt ? (window.addEventListener("beforeunload", Ut), Wt = !0) : !e && Wt && (window.removeEventListener("beforeunload", Ut), 
            Wt = !1);
        }
        function Kt(t) {
            const n = e.byId("profileTabs");
            if (!n) return;
            const i = Array.from(n.querySelectorAll("button[data-view]")).find(e => e.dataset.view === t);
            if (!i) return;
            let a = i.querySelector(".profile-tab-dirty"), r = (i.getAttribute("aria-label") || "").replace(", unsaved changes", "");
            yt[t] ? (a || (a = document.createElement("sup"), a.className = "profile-tab-dirty", 
            a.setAttribute("aria-hidden", "true"), a.textContent = "*", i.appendChild(a)), i.setAttribute("aria-label", `${r}, unsaved changes`)) : (a && a.remove(), 
            i.setAttribute("aria-label", r));
        }
        function zt(e) {
            e && vt[e] && (yt[e] = !0, queueDraftAutosave(e), Gt(), Kt(e), sxRefreshGroupOwn(e));
        }
        function Vt(e) {
            e && delete yt[e], e && delete draftRatings[e], e && draftSaveTimers[e] && (t.clear(draftSaveTimers[e]), delete draftSaveTimers[e]), 
            Gt(), e && Kt(e);
        }
        let sxGroupLeniency = 50, sxWriterLeniency = 50, sxCompareIds = [], Qt = null, Jt = () => {};
        // Last PURE pair computation per group id (blocker stage,
        // 2026-10-27): the tag-free baseline Rd and sxRefreshGroupOwn
        // diff the pair's live map against. In memory only — declared
        // here, beside the other compare state, so every edit path
        // (zt included) can read it safely.
        const sxPairBase = {};
        const en = new Set, tn = {}, nn = [ "#63c2c8", "#e27786", "#d7bd55", "#8c96df", "#63c796", "#ef9a55", "#cc7fc6", "#79a9cf" ];
        let an = !1;
        // Profiles-data F1: SX_PROFILE_FIELDS is the ONE canonical list of
        // the per-profile data lists (the raw session-state objects keyed
        // by profile id; Ye/Xe are the raw objects behind the vt/wt
        // proxies). Create (import + dialog), edit, close, and the
        // importData re-key move all enumerate THIS list — no lifecycle
        // path keeps a hand-written enumeration of its own. Members, in
        // order: ratings (Ye), rating sources (Ze), name (Xe), uuid
        // (profileUuids), sample flag (sampleProfileFlags), gender (rt),
        // pronouns (pz), sexuality (ot), roles (st), age (lt), location
        // (ct), photos (dt), contact (ut), about (nt), terms (it), veil
        // (vpt), veil-enabled (vht), imported children (at), loader state
        // (gt), completion times (mt), annotations (Qe), fantasy-only
        // (Je), already-tried (et), notes (tt), per-profile colors (tn),
        // comparisons (ft), dirty flags (yt). The legacy nets lists
        // (pt/ht, profileNets/profileNetEnabled) were removed in Fix 1,
        // item 5: no code ever wrote or read an entry in either.
        // Deliberately NOT on this list: droppedKeyRecords — the import
        // path's dropped-key records are import-path behavior, so the
        // import create writes them itself and close/move carry them as
        // documented path extras; and curveBends (bt), whose keys are
        // map-node ids, not profile ids.
        const SX_PROFILE_FIELDS = [ Ye, Ze, Xe, profileUuids, sampleProfileFlags, rt, pz, ot, st, lt, ct, dt, ut, nt, it, vpt, vht, at, gt, mt, Qe, Je, et, tt, tn, ft, yt ];
        // The object-valued subset of SX_PROFILE_FIELDS that the create
        // paths initialize to {} for a fresh profile: ratings, rating
        // sources, annotations, fantasy-only, already-tried, notes,
        // imported children, loader state, completion times.
        const SX_PROFILE_RECORD_LISTS = [ Ye, Ze, Qe, Je, et, tt, at, gt, mt ];
        // SOLVER-METRICS REFACTOR (F2): the layout dials are SINGLE-
        // SOURCED. The shell's early script builds the live dials
        // (window.__SEXCAPADES_LAYOUT) from its baked defaults plus
        // hash / saved overrides, and publishes those same baked
        // defaults as window.__SEXCAPADES_LAYOUT_DEFAULTS. This bundle
        // used to carry a second, hand-maintained fallback literal
        // whose branch lengths had drifted from the shell's (2.7 where
        // the shell governs 4.86, 1.5 where it governs 2.4, whole
        // branches and per-topic lengths missing) — a silent trap:
        // remove the shell object and the map quietly rearranged
        // itself. The fallback below is GENERATED from the single
        // source instead: a deep clone of the shell defaults (a clone,
        // so bundle-side mutation of mn never pollutes the pristine
        // defaults the editor's Reset reads). If neither object
        // exists, the bundle was loaded without its shell — fail
        // loudly rather than lay out a differently-shaped map.
        function sxGeneratedFallbackDials() {
            const src = window.__SEXCAPADES_LAYOUT_DEFAULTS;
            if (!src || "object" != typeof src) throw new Error("layout dials: window.__SEXCAPADES_LAYOUT is absent and the __SEXCAPADES_LAYOUT_DEFAULTS single source is unavailable — the bundle must load after the shell's early layout script");
            return JSON.parse(JSON.stringify(src));
        }
        // SOLVER-METRICS REFACTOR (F6): the ONE tri-state type behind
        // every self-shrink switch. A shrink-map value means:
        //   explicit true  -> "armed"  (the group may shrink itself)
        //   explicit false -> "veto"   (the group must not shrink)
        //   absent / other -> "follow" (follow the global collision
        //                              mode)
        // sxShrinkState(map, key) is the single reader — geometry
        // gates ask it instead of spelling === true / === false at
        // each site. The shell's switches write exactly these three
        // states through ONE parameterized handler (kind x scope):
        // lrShrinkActuator + bindShrinkSwitch + bindShrinkForAll in
        // the layout editor. (The known flip-but-move-nothing switch
        // defect is a SEPARATE fix job, Group 3d — this unification
        // deliberately does not diagnose or fix it; it only makes
        // that fix land in one place.)
        function sxShrinkState(map, key) {
            if (!map) return "follow";
            const v = map[key];
            return v === !0 ? "armed" : v === !1 ? "veto" : "follow";
        }
        // Armed auto-shrink factors (surfaced in the Layout Editor,
        // Build 2026-10-31_1329): the two shipped 0.76 compaction
        // factors — the branch spoke shrinkFactor in the branch
        // radius chain and the subcategory cloud-radius factor in
        // frCollisionPasses — are read through this one reader so
        // the editor's two sliders write the EXISTING factors and
        // nothing else. A settings value that is absent, non-finite,
        // or outside (0, 1] falls back to the shipped 0.76, so an
        // untouched map renders exactly as before. The tri-state is
        // untouched: this reader is only consulted where the state
        // is already "armed".
        function sxArmedFactor(v) {
            const n = Number(v);
            return Number.isFinite(n) && n > 0 && n <= 1 ? n : .76;
        }
        const rn = new Set, on = new Set, sn = new Map, ln = {}, cn = {}, dn = {}, un = new Map, pn = {}, hn = {}, gn = new Set, mn = window.__SEXCAPADES_LAYOUT || sxGeneratedFallbackDials();
        // DeKnotter run context (E1): module-scoped state behind the
        // dedicated driver API at __SEXCAPADES_LAYOUT_API.deknotter. While
        // a context is active, deknotter.applyPhase validates every
        // branch/subcategory/kink length override in a phase patch as a
        // ratio against the item's baked base (the same bases the layout
        // editor's honesty readout uses) and rejects the whole patch when
        // any ratio is non-finite or outside 0 < ratio <= cap. The solver
        // consults dkCtx in exactly two places: frClampCloudRadii (throw
        // phase neighbor-cap relief for the active branch only) and
        // rr.optimizeSpokeLengths (change logging for the active branch).
        // With no context active, nothing here alters ordinary behavior.
        let dkCtx = null;
        const dkLog = [];
        // ANNEAL REPORT TEST HOOK (permanent diagnostic surface,
        // added 2026-11-03): sxPublishAnnealReport mirrors the
        // latest deknotter.run() outcome onto three read-only
        // surfaces, so a harness that can observe the DOM but
        // cannot evaluate JavaScript in the page can still
        // capture a full run receipt: (1) an inert
        // <script type="application/json" id="sx-anneal-report">
        // node holding {runId, pending, finishedAt, report,
        // dkLog}; (2) window.__sxAnnealReport, the report
        // snapshot; (3) window.__sxDkLog, the dkLog snapshot
        // capped at the last 200 entries; (4) a hidden
        // off-screen <div id="sx-anneal-report-text"> in
        // document.body holding the identical JSON snapshot
        // string as surface (1) — DOM observation channels
        // that exclude script elements can still read a
        // div's text. deknotter.run() calls
        // it at run start (pending true, previous report kept)
        // and when the run promise settles (pending false,
        // finishedAt set, report = the resolved report, whole —
        // no fields picked or added). The snapshot is a
        // JSON-safe deep copy: the replacer drops functions and
        // undefined values and cuts circular references (shared
        // non-circular references are copied in full); if a copy
        // still fails, an error marker is written instead. The
        // whole body is guarded — a hook failure can never
        // affect a run — and the promise returned to the caller
        // is the cascade's own, untouched. Nothing here changes
        // solver behaviour, paint, or the report itself.
        let sxAnnealRunSeq = 0, sxAnnealLastReport = null;
        function sxPublishAnnealReport(report, pending) {
            try {
                if (pending) sxAnnealRunSeq++; else sxAnnealLastReport = report || null;
                const copy = value => {
                    const ancestors = [];
                    return JSON.parse(JSON.stringify(value, function(k, v) {
                        if ("function" == typeof v || "undefined" == typeof v) return undefined;
                        if (v && "object" == typeof v) {
                            while (ancestors.length && ancestors[ancestors.length - 1] !== this) ancestors.pop();
                            if (ancestors.indexOf(v) >= 0) return undefined;
                            ancestors.push(v);
                        }
                        return v;
                    }));
                };
                const snap = { runId: sxAnnealRunSeq, pending: !!pending, finishedAt: pending ? null : new Date().toISOString(), report: null, dkLog: [] };
                try {
                    snap.report = copy(sxAnnealLastReport);
                } catch (e) {
                    snap.report = { __sxHookError: String(e && e.message || e) };
                }
                try {
                    snap.dkLog = copy(dkLog.slice(-200));
                } catch (e) {
                    snap.dkLog = [];
                }
                window.__sxAnnealReport = snap.report;
                window.__sxDkLog = snap.dkLog;
                const snapText = JSON.stringify(snap);
                let node = document.getElementById("sx-anneal-report");
                if (!node) {
                    node = document.createElement("script");
                    node.type = "application/json";
                    node.id = "sx-anneal-report";
                    (document.head || document.documentElement).appendChild(node);
                }
                node.textContent = snapText;
                // DIV MIRROR (permanent diagnostic surface): the
                // identical snapshot string in an off-screen div,
                // because observation channels that exclude
                // script elements can still read a div's text.
                // Hidden with the page's skip-link pattern
                // (position:absolute; left:-9999px) — never
                // display:none, visibility:hidden, or
                // aria-hidden, which could drop it from the
                // observation channel it exists to serve.
                // Recreated if missing; inside the same guarded
                // try as every other surface, so it can never
                // affect a run.
                let mirror = document.getElementById("sx-anneal-report-text");
                if (!mirror) {
                    mirror = document.createElement("div");
                    mirror.id = "sx-anneal-report-text";
                    mirror.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;";
                    (document.body || document.documentElement).appendChild(mirror);
                }
                mirror.textContent = snapText;
            } catch (e) {}
        }
        // Q1 run observability (Phase Q1): per-phase wall-clock
        // budget for a DeKnotter run context. A single phase may run
        // at most this long; past it, dkSolvePoll throws a budget
        // error that unwinds the cascade into its snapshot restore.
        const DK_PHASE_BUDGET_MS = 180000;
        // SOLVER-METRICS REFACTOR (F9): ONE named constants block for the
        // untangler / optimizer magic numbers that used to sit inline at
        // their use sites. TRANSCRIPTION ONLY — every value below is the
        // exact literal it replaces; nothing was redesigned. (The
        // paint-stage tidier's anneal constants were already gathered as
        // the SX_STEP_R / SX_T0 / SX_SWEEPS / SX_SEED block beside
        // sxSolverMode; they stay there — see the F3 facade note.)
        // PER-PHASE GATE (Phase 4, 2026-11-04): the only stop.
        // Tolerance is flat GATE_TOL (2). The larger-of-1-and-
        // 10%-of-previous form is removed. The onset margin and
        // the fine-tune margin are deleted; no selector remains.
        const SX_SCORE = {
            REGRESSION_TOL: .01,
            // Throw (RE-RULED 2026-11-01, Jason — supersedes
            // the 2026-10-31 x25 / x15 factors and the kink
            // throw factor): the throw is now measured in
            // center-avatar circle radii — the branch is thrown
            // out to 50 times that radius and the subcategories
            // to 20 times that radius (Jason first said 10 for
            // the subcategories and corrected it to 20 the same
            // day; 20 is the ruled value). The factors count
            // center-avatar radii in world units — the branch's
            // distance from the center, and the subcategory's
            // segment out from its branch node — and stepThrow
            // converts them into override lengths through the
            // pre-run delivered radii; they are NOT multiples
            // of the baked base (the direct-factor reading threw
            // tens of times too far: diagnosis c17e4775,
            // confirmed 2026-11-01; the radius is the center
            // avatar disc radius the Center ring scale slider
            // sets, settled by Jason 2026-11-01 04:56 CST). The individual
            // kink leaves are NOT thrown by a radii factor at all:
            // they autofit to THREE TIMES their kink (fit) length
            // — the full fit length: name + neighbour pitch +
            // icon + clearance (dkComputeFitTarget) — see
            // stepThrow's throwFitCap, which GOVERNS the kink
            // throw length instead of merely capping it, and
            // LEAF_FIT_FACTOR below, which carries the multiple.
            // THROW_KINK survives only as the fallback
            // multiple of the baked kink base for a kink whose
            // fit target cannot be computed, and it is 3 for
            // the same reason (RE-RULED 2026-11-02 16:59 CST,
            // Jason, reversing the same day's 13:11 1x ruling
            // for kink leaves only and superseding it; the 1
            // briefly stood between the 2026-11-01 value 3 and
            // this restoration): three times the kink
            // length itself is the kink throw, by fit or by
            // base. These factors are ceilings on the THROW only —
            // they are not growth-ladder step sizes; the growth
            // ladder is a separate phase (GROWTH_* below:
            // 1.25x steps to a 3x cumulative cap) and is never
            // conflated with them.
            THROW_BRANCH: 50,
            THROW_SUBCAT: 20,
            THROW_KINK: 3, // SUPERSEDED 2026-11-03 as a read value: the throw's baked-base fallback multiple is now sxLeafOvergrowthFactor() (the "% kink leaf overgrowth" slider); 3 remains the fallback percent's equivalent (300%).
            // LEAF FIT MULTIPLE (RE-RULED 2026-11-02 16:59 CST,
            // Jason — leaves only, reversing the 13:11 1x leaf
            // ruling): the kink-leaf throw length AND the
            // kink-leaf minimum are both THREE TIMES the full
            // fit target at the current font size — the whole
            // fit width tripled (dkComputeFitTarget's target:
            // kink name + neighbour pitch + icon + clearance +
            // padding, as that function composes them), not 3x
            // the name alone. Kinks have no shrink ladder of
            // their own — they keep their thrown, fit-capped
            // lengths — so the throwFitCap multiple IS the leaf
            // minimum as well as the leaf throw. This factor is
            // read ONLY at the leaf throwFitCap site; category
            // and subcategory throws (50x / 20x above) and their
            // 1x floors (SHRINK_FLOOR_FACTOR below) are
            // unchanged, and no other floor reader reads this.
            LEAF_FIT_FACTOR: 3, // SUPERSEDED 2026-11-03 as a read value: the throwFitCap multiple is now sxLeafOvergrowthFactor() (the "% kink leaf overgrowth" slider, default 300%); kept as the documented historical multiple.
            // SHRINK FLOORS (ruled 2026-11-01, Jason — supersedes
            // the 1x own-length floors: the 2026-11-01 01:44
            // subcategory name-length floor and the 2026-10-29
            // kink-name-length branch floor): when Anneal shrinks,
            // every level's floor is ONE TIMES that level's own
            // length (RE-RULED 2026-11-02, Jason, superseding
            // the 2026-11-01 3x floors) — subcategories
            // shrink to 1x the subcategory length (1x name
            // length on the fit lever, the fit-derived floor on
            // the override lever), and categories/branches
            // shrink to a floor of 1x the category length (1x
            // the label-fit floor). (Kink leaves are the one
            // exception to this shared factor: their throw and
            // minimum are 3x the full fit target under
            // LEAF_FIT_FACTOR above, re-ruled 2026-11-02 16:59
            // CST; this shared factor's readers are the
            // subcategory and category floors only.) All other shrink rules
            // stand (square-root steps — ruled 2026-11-02, Jason,
            // superseding the 10% steps named here before — one at
            // a time, per-phase gate stop (flat 2; the
            // more-than-three onset margin is deleted), per-subcategory back-out, skip-throw-under-5
            // shrinking from current lengths).
            SHRINK_FLOOR_FACTOR: 1,
            GATE_TOL: 2,
            // FINE-TUNE SKIP-THROW (ruled 2026-10-29; skip re-ruled
            // 2026-11-01): a branch whose pre-run crossing number is
            // STRICTLY below FINE_TUNE_BELOW (zero included) skips the
            // throw and shrinks from its current lengths. This number
            // is a path choice, not a stop. The onset margin (3) and
            // the fine-tune margin (live value 3; the earlier
            // more-than-one stop was already gone) were deleted
            // Phase 4, 2026-11-04. The per-phase gate above is the
            // only stop.
            FINE_TUNE_BELOW: 5,
            // THROW REPEAT (ruled 2026-11-06, Jason): short kink
            // names get trapped in local minima on the baked
            // defaults because the throw — a multiple of the kink
            // length, derived from the centre ring radius — does
            // not throw them out far enough to clear. After the
            // throw, if the branch's crossing number has NOT
            // dropped by MORE than THROW_REPEAT_DROP (75%) from
            // the run baseline (report.baseline.first, the same
            // own-cloud composition the fine-tune decision
            // reads), the throw is repeated — up to
            // THROW_REPEAT_MAX_EXTRA (3) extra times, four
            // throws total — stopping early as soon as one throw
            // achieves the more-than-75% drop. The throw itself
            // is unchanged: same stepThrow, same 50x / 20x radii
            // targets, same 3x kink-leaf fit length; only the
            // repetition is new (stepThrowRepeated, beside
            // stepThrow). A run on the fine-tune skip-throw path
            // never throws, so it never repeats.
            THROW_REPEAT_DROP: .75,
            THROW_REPEAT_MAX_EXTRA: 3,
            OPTIMIZER_MAX_PASSES: 96,
            // Growth (ruled 2026-10-28; the 2026-10-31 single-step
            // 1.20x / 50x-cap reading was the throw correction
            // misapplied to this ladder and is reverted the same
            // day): scoped same-branch growth in the cascade — step
            // factor per kept growth step, max kept steps per grown
            // level (branch, subcategory), cumulative cap as a
            // TARGET (the step that would exceed it clips to
            // exactly the cap and is gated like the rest), and the
            // dominance threshold: a cloud grows only when
            // same-branch pairs contribute more than this share of
            // its standing E. This ladder (1.25x steps to 3x) is a
            // separate phase from the throw above and carries no
            // part of the throw's caps.
            GROWTH_STEP: 1.25,
            GROWTH_MAX_STEPS: 5,
            GROWTH_CAP: 3,
            GROWTH_DOMINANCE: .5,
            // BAKE GATE (ruled 2026-10-29, M4): the bake decision's
            // limit on the TOTAL crossing number (this cloud plus
            // every neighbor cloud, combined) — passes only when
            // its increase is strictly less than this. Replaces the
            // retired combined-area check (combined area delta <=
            // 10). Reported for the bake decision; it never gates
            // the run itself. Single source: dkBakeGate below is
            // the only reader, called at both run endings.
            BAKE_GATE_LIMIT: 5
        };
        // Q1: polled once per optimiser iteration while a DeKnotter
        // context is active (inert otherwise — dkCtx is null for
        // every ordinary solve). Three duties, in order: (1) honour
        // the run's cancel flag, throwing a marked cancel error;
        // (2) enforce the per-phase wall-clock budget, throwing a
        // marked budget error carrying the phase's iteration count;
        // (3) fire the run's heartbeat hook at most every 2 s of
        // solve time, so a slow phase stays distinguishable from a
        // stuck one. The thrown errors are the cascade's ordinary
        // failure path: snapshot restored, gate "reverted", reason
        // reported — no new unwind machinery.
        function dkSolvePoll() {
            if (!dkCtx) return;
            dkCtx.iterCount = (dkCtx.iterCount || 0) + 1;
            const ctl = dkCtx.control, now = Date.now();
            if (ctl && "function" == typeof ctl.shouldCancel && ctl.shouldCancel()) {
                const err = new Error("cancelled: phase '" + (dkCtx.phase || "") + "' stopped by user after " + dkCtx.iterCount + " iterations");
                throw err.dkCancelled = !0, err.phase = dkCtx.phase, err.iterations = dkCtx.iterCount, err;
            }
            if (dkCtx.phaseStartedAt && now - dkCtx.phaseStartedAt > DK_PHASE_BUDGET_MS) {
                const err = new Error("aborted: phase '" + (dkCtx.phase || "") + "' exceeded budget (" + Math.round(DK_PHASE_BUDGET_MS / 1e3) + " s) after " + dkCtx.iterCount + " iterations");
                throw err.dkBudget = !0, err.phase = dkCtx.phase, err.iterations = dkCtx.iterCount, err;
            }
            if (ctl && "function" == typeof ctl.onHeartbeat && now - (dkCtx.lastBeatAt || 0) >= 2e3) {
                dkCtx.lastBeatAt = now;
                try {
                    ctl.onHeartbeat({ phase: dkCtx.phase, phaseElapsedMs: dkCtx.phaseStartedAt ? now - dkCtx.phaseStartedAt : 0, iterations: dkCtx.iterCount });
                } catch (e) {}
            }
        }
        // Scoped-solve context (Stage 3, T2): module-scoped state behind
        // __SEXCAPADES_LAYOUT_API.applyScoped, following the dkCtx
        // precedent above. While a context is active, it is consulted
        // in exactly three places: the post-solve subLen scale in fr()
        // (frozen branches are skipped, so the scale applies only
        // inside the recompute set), the solve-completion freeze
        // replay in fr() (frozen branches' solved geometry and
        // _spokeAdjust20 are restored verbatim from the pre-patch
        // capture the context carries, and the delivered-geometry
        // registry is merged so frozen items keep their pre-solve
        // entries), and the post-paint settle search in Ar() (a
        // frozen node is seated at exactly its captured delivered
        // center and the search never runs for it; its shapes still
        // accumulate as obstacles). The coupling-channel passes
        // (frClampCloudRadii, rr.optimizeSpokeLengths,
        // rr.applyExpansionRelief) do NOT consult it yet — T3
        // disciplines those; T2's guarantee comes from
        // capture/restore/merge alone. With no context active,
        // nothing here alters ordinary behavior. The context is set
        // and cleared only by applyScoped (try/finally).
        //
        // T3 (coupling-channel discipline): the context is now also
        // consulted by the three coupling passes and by Ar()'s
        // paint. frClampCloudRadii evaluates caps only for
        // recompute-set branches (frozen caps skipped, counted in
        // dropped.clamp). rr.optimizeSpokeLengths never applies a
        // candidate delta to a frozen branch (suppressed, counted in
        // dropped.optimiser; pairs with both branches frozen are
        // skipped during candidate enumeration), and the
        // _spokeAdjust20 reset in fr() exempts frozen branches so
        // their captured adjustments persist into the solve.
        // rr.applyExpansionRelief / cascadeReliefPass suppress any
        // relief candidate whose source or target branch is frozen
        // (counted in dropped.relief, appended to boundaryLog as
        // {channel:"relief", source, target, pass}); under scope
        // policy "fallback" the first such event sets ctx.r6Abort —
        // the relief channel stops at its next seam and applyScoped
        // discards the scoped result for an ordinary full apply,
        // declared as fallback "R6: boundary pressure" (Mr() swallows
        // render exceptions into its paused state, so the abort is a
        // flag, never a throw). Ar() retains frozen branches'
        // .node-group DOM elements across its rebuild (scoped
        // paint). applyScoped declines to scope at all when
        // mn.crossmin is on (fallback "crossmin-on").
        let scCtx = null;
        // T3 relief boundary event: count the suppression, append
        // the boundaryLog entry (carrying the caller's op class when
        // the scope provided one), and — under the "fallback"
        // policy — raise the R6 abort flag on the first event.
        // Optimiser and clamp suppressions never come through here:
        // only relief boundary events can trigger R6.
        function scReliefBoundary(ctx, source, target, pass) {
            ctx.dropped.relief++;
            const entry = {
                channel: "relief",
                source: source,
                target: target,
                pass: pass
            };
            null != ctx.opClass && (entry.opClass = ctx.opClass), ctx.boundaryLog.push(entry), "fallback" === ctx.policy && (ctx.r6Abort = !0);
        }
        function scSectorFrozen(sec) {
            return Boolean(scCtx && sec && sec.entry && sec.entry.branch && scCtx.frozenBranches.has(sec.entry.branch.name));
        }
        function scSectorName(sec) {
            return sec && sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
        }
        // Blit session (P3): during a burst of scoped paints with
        // animations OFF (the shipped default; read as !!mn.animations,
        // the same flag P2 gates on), the frozen complement renders as
        // ONE world-space raster image instead of live vector elements,
        // while the live zone (target ∪ ring branches) stays fully
        // vector and the relations layer and the center stay live
        // vector above the raster. Rest state is always a full
        // pure-vector paint. The P1 segment machinery (scSeg &c.) is
        // Ar-function-scope, so the session keeps its own module-scope
        // state here and its own collection code (same selectors, same
        // in-group-first-then-stacks piece semantics). The session is
        // scoped and ephemeral, and rendering only: the vault and the
        // image never enter saved state (snapshot/restore and
        // layout-state collect() are DOM-independent), and every exit
        // goes through an ordinary paint whose top-of-paint clear
        // removes both artifacts.
        //   START: the first scoped paint of a burst runs as a normal
        //     P1 segment paint; when it completes, the frozen
        //     complement is snapshotted from the resulting full-vector
        //     DOM and rasterized asynchronously; when the raster is
        //     ready, the frozen segments are vaulted and the image is
        //     swapped in (blitSwapFromDOM).
        //   CONTINUE: subsequent scoped paints with the SAME frozen
        //     set keep the image in place; the frozen segments are
        //     captured (found in the vault, already assembled) but
        //     NOT built and NOT spliced into the visible flow; at the
        //     end of the paint the vault is rebuilt from the captures.
        //   END (the ending paint is an ordinary segment/full paint):
        //     any non-scoped paint; a scoped paint whose frozen set
        //     differs from the session's; or 20 s with no further paint
        //     (a timer armed by each blit paint forces an ordinary
        //     full repaint via Mr()). A stale async raster completion
        //     never swaps into an ended session (token/sequence guard
        //     in blitRasterize / blitRasterDone).
        // F6: blitSigActive is the stable completion signal the
        // shell's rebuild gate reads through
        // deknotter.blitSessionActive(). It mirrors the gate's old
        // last-blit-session-entry log verdict exactly (a boolean —
        // NOT a depth counter: a superseded session's held "end" is
        // dropped, never pushed, so ends do not pair with starts),
        // maintained at every site that pushes, removes, or clears
        // such an entry: blitStartSession (start), blitEndSession
        // (end), the settle guard's flushEnd (the held end, when it
        // LANDS — never while merely held) and restore stand-down
        // (start removed by splice), and deknotter.begin's log
        // clear.
        let blitSess = null, blitTokenSeq = 0, blitSigActive = !1;
        const BLIT_NS = "http://www.w3.org/2000/svg", BLIT_XLINK = "http://www.w3.org/1999/xlink";
        function blitSameFrozen(a, b) {
            if (!a || !b || a.size !== b.size) return !1;
            for (const n of a) if (!b.has(n)) return !1;
            return !0;
        }
        // On-screen scale: screen px per world unit, from the live
        // SVG's bounding rect and the camera state (th.scale) — the
        // world rect is 3200 units on a side and the viewBox fit is
        // min(rect) / 3200, scaled by the camera.
        function blitScaleNow() {
            try {
                const r = Cn.getBoundingClientRect(), s = Math.min(r.width, r.height) / 3200 * (th && Number(th.scale) || 1);
                return Number.isFinite(s) && s > 0 ? Math.max(1, Math.min(4, s)) : 1;
            } catch (_) {
                return 1;
            }
        }
        function blitArmTimer(sess) {
            // Settle replacement v1: in repulsion mode the deferred
            // 20-second settle timer is deleted — no timer is armed,
            // and the blit session ends on non-scoped paints instead
            // (the paint-top gate). Every other mode keeps the timer
            // exactly as shipped, so the rollback value restores
            // today's behaviour with no code change.
            if ("repulsion" === sxSolverModeQuiet()) {
                sess.timer && clearTimeout(sess.timer), sess.timer = null;
                // AUTOFIT SESSION-ENDING EXIT (ruled 2026-11-01,
                // Jason): a session started (or continued) by an
                // Autofit scoped apply carries autofitExit (marked
                // in blitPaintEnd from the paint's opClass) and gets
                // its own exit here, on a zero timer so it fires as
                // soon as the Autofit paint has completed: the
                // session ends through blitAutofitExit instead of
                // waiting for a later, unrelated paint (the hang:
                // in Repulsion no timer was armed at all, so the
                // vault/raster, the overlay gate, the settle watch
                // and the Autofit job all waited on a paint only a
                // profile open/close — or some other non-scoped
                // repaint — ever supplied). Sessions of every other
                // scoped apply are untouched: no exit is scheduled,
                // exactly as shipped.
                if (sess.autofitExit && !sess.exitTimer) sess.exitTimer = setTimeout(() => {
                    sess.exitTimer = null, blitAutofitExit(sess);
                }, 0);
                return;
            }
            sess.timer && clearTimeout(sess.timer), sess.timer = setTimeout(() => {
                if (blitSess !== sess) return;
                // Mode-toggle hardening: a timer armed under Settle
                // must not run its guard settle after a flip to
                // Repulsion - bail at fire time on the live mode.
                // The session itself still ends via the paint-top
                // gate, exactly as sessions do in Repulsion.
                if ("repulsion" === sxSolverModeQuiet()) return;
                // Settle guard (see sgRunSettleGuard below): the
                // expiry now runs the settle under the guard's
                // improve-or-hold gate instead of ending the session
                // blind. Re-entrancy is fail-open — if a guard run
                // is already in flight, this settle takes the exact
                // legacy path rather than queue behind it, so a
                // settle is never lost or delayed indefinitely.
                if (sgInFlight) {
                    blitEndSession();
                    try {
                        Mr({
                            animate: !1,
                            forceRepaint: !0
                        });
                    } catch (_) {
                        __sxErrLog("layout-blit-timer", _);
                    }
                    return;
                }
                sgInFlight = !0, sgRunSettleGuard(sess, dkLog.length).then(() => {
                    sgInFlight = !1;
                }, e => {
                    sgInFlight = !1;
                    try {
                        __sxErrLog("layout-settle-guard", e);
                    } catch (_) {}
                });
            }, 2e4);
        }
        // The Autofit session-ending exit itself (see blitArmTimer's
        // Repulsion branch): run the session's settle NOW, through
        // the same guarded settle the rest-timer runs in every other
        // mode — pre-capture, teardown, the non-scoped full repaint
        // (Mr forceRepaint: the same repaint a profile load lands,
        // whose paint-top gate is what used to end these sessions
        // by accident), post-measure, and restore — so the deferred
        // "end" entry lands and the shell's gate, settle watch and
        // Autofit re-check all observe the landing together. Any
        // guard failure funnels into sgRunSettleGuard's own
        // fail-open legacy settle (blitEndSession + the same full
        // repaint), so the session always ends. Fail-open here too,
        // mirroring the timer's re-entrancy rule: a guard run
        // already in flight means this exit takes the legacy path
        // rather than queue behind it. A mode flip away from
        // Repulsion since the arm hands the session back to
        // blitArmTimer, which arms the ordinary rest-timer.
        function blitAutofitExit(sess) {
            if (blitSess !== sess) return;
            if ("repulsion" !== sxSolverModeQuiet()) return void blitArmTimer(sess);
            if (sgInFlight) {
                blitEndSession();
                try {
                    Mr({
                        animate: !1,
                        forceRepaint: !0
                    });
                } catch (_) {
                    __sxErrLog("layout-blit-autofit-exit", _);
                }
                return;
            }
            sgInFlight = !0, sgRunSettleGuard(sess, dkLog.length).then(() => {
                sgInFlight = !1;
            }, e => {
                sgInFlight = !1;
                try {
                    __sxErrLog("layout-settle-guard", e);
                } catch (_) {}
            });
        }
        function blitStripArtifacts() {
            try {
                In.querySelectorAll(":scope > .sx-blit-vault, :scope > .sx-blit-raster").forEach(el => el.remove());
            } catch (_) {}
        }
        function blitEndSession() {
            const sess = blitSess;
            if (!sess) return;
            blitSess = null, sess.timer && clearTimeout(sess.timer), sess.exitTimer && clearTimeout(sess.exitTimer), sess.exitTimer = null, sess.rasterUrl && URL.revokeObjectURL(sess.rasterUrl), 
            blitStripArtifacts(), dkLog.push({
                type: "blit-session",
                event: "end",
                frozen: sess.frozenCount
            }), blitSigActive = !1;
        }
        // Settle guard (owner's ruling, Soul Review #18 pick A,
        // 2026-10-22): the DeKnotter's improve-or-hold gate lifted
        // onto the deferred settle. The blit rest-timer used to end
        // its session and force a full repaint blind — the repaint
        // re-solves every cloud and could hand back overlap the
        // DeKnotter had just won (the surrender case: one cascade's
        // cloud went 113,597.96 -> 366,946.33 when its settle
        // landed, and the map total went 227,195.92 -> 1,425,792.45).
        // The guard makes every settle overlap-non-increasing, per
        // cloud, by construction: it captures the delivered centers
        // and the per-cloud xAreaCross BEFORE the settle repaint,
        // repaints, measures again, and re-seats any cloud the
        // repaint regressed at its pre-settle delivered centers via
        // the scoped-paint centers mechanism (the T2 freeze
        // machinery with every branch frozen and none recomputed).
        // Restore paints replay regressed clouds from the pre-settle
        // captured solve, never the repaint's own solved state.
        // Pre-settle centers are captured from the RENDERED
        // geometry, not dataset values: for vault-resident branches
        // the data-layout-x/y attributes hold rest-era values
        // throughout a blit session while the rendered icons sit
        // displaced, so a dataset capture restores the very
        // surrender the guard exists to prevent. The capture reads
        // each icon through its OWN SVG geometry chain — local
        // center composed with the element's own getCTM(), which
        // composes every ancestor transform including the vault's —
        // never a screen rect divided by the layer's CTM: a
        // vault-resident element's rect carries positioning the
        // layer's CTM does not account for, and seating clouds from
        // those rects painted eleven previously-clear clouds at
        // garbage positions (post-settle total 3,929,558,661
        // against the unguarded settle's 1,425,792). The conversion
        // is cross-checked at runtime against the dataset centers
        // of every non-vault element (known-fresh): a deviation
        // over 1.0 world units distrusts the conversion globally
        // and the capture falls back to the dataset read, recorded
        // as captureSource in the guard's log entry ("rendered" on
        // the success path, "dataset-fallback" otherwise).
        // Improve-or-hold applies to the guard too: it may fail
        // its per-cloud objective, but it may not leave the map
        // worse than the settle it replaced. If restore rounds ran
        // and the final total nevertheless exceeds the post-repaint
        // total, the restore is discarded for one plain legacy
        // settle repaint and the log entry is marked bailed.
        // The blit-session "end" entry is deferred until the guard
        // has completely finished — post-measure plus any restore —
        // so the shell's settle-landed detection and the DeKnotter
        // receipt read post-guard geometry, never mid-guard
        // geometry. Fail-open throughout: any guard failure falls
        // back to the exact legacy settle and logs through
        // __sxErrLog("layout-settle-guard", e); the settle is never
        // lost, delayed indefinitely, or left dangling.
        let sgInFlight = !1, sgHoldBlitStart = !1, sgCaptureSource = "rendered";
        // Every branch name the guard freezes and measures: the same
        // universe applyScoped scopes over, taken from the last
        // solve's branch list (dkLastBranches) unioned with the qn
        // registry the last paint built.
        function sgAllBranchNames() {
            const names = new Set;
            (dkLastBranches || []).forEach(sec => {
                const n = sec && sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
                n && names.add(n);
            });
            for (const k in qn) {
                const info = qn[k];
                info && info.branch && names.add(info.branch);
            }
            return names;
        }
        // The crossingnumber clouds walk (Q4: the same walk
        // measureCloud awaits — the guard now watches the crossing
        // number, not the xAreaCross area), keeping EVERY branch's
        // value instead of one: missing or non-finite values read
        // as 0, exactly as measureCloud treats them. Rejects when
        // the walk is unavailable — the caller treats that as
        // fail-open.
        // SOLVER-METRICS REFACTOR (F1): ONE layout-score readout helper.
        // The settle guard's whole-map scorer (sgMeasureClouds below),
        // the driver API's whole-map scorer (deknotter.measureCloudsAll)
        // and its single-branch scorer (deknotter.measureCloud) were
        // three word-for-word copies of this walk — same done-guard,
        // same "missing or non-finite value reads as zero" loop —
        // differing only in the error string. They now delegate here,
        // parameterized by branch-or-all: branch === null resolves the
        // whole-map {name: value} object; a branch name resolves that
        // branch's value alone. The single backend is the shell
        // registry's crossingnumber clouds walk, whose implementation
        // is the native solved-geometry readout (sxCrossingMeasure,
        // exposed as window.__sxCrossingMeasure; its per-cloud
        // attribution comments stay with that code — F10). errLabel
        // keeps each caller's historical error string verbatim.
        function sxCrossingCloudsReadout(branch, errLabel) {
            return new Promise((resolve, reject) => {
                try {
                    const defs = window.LayoutMetrics && window.LayoutMetrics.defs, def = defs && defs.crossingnumber;
                    if (!def || "function" != typeof def.clouds) return void reject(new Error(errLabel));
                    let done = !1;
                    def.clouds({
                        svg: document.getElementById("mapSvg")
                    }, clouds => {
                        if (done) return;
                        done = !0;
                        if (null === branch) {
                            const out = {};
                            if (clouds) for (const k of Object.keys(clouds)) {
                                const v = clouds[k] ? Number(clouds[k].value) : NaN;
                                out[k] = Number.isFinite(v) ? v : 0;
                            }
                            resolve(out);
                        } else {
                            const entry = clouds ? clouds[branch] : null, value = entry ? Number(entry.value) : NaN;
                            resolve(Number.isFinite(value) ? value : 0);
                        }
                    }, () => !1);
                } catch (e) {
                    reject(e);
                }
            });
        }
        function sgMeasureClouds() {
            return sxCrossingCloudsReadout(null, "settle guard: LayoutMetrics.defs.crossingnumber.clouds is unavailable");
        }
        // Clouds the settle made worse: post above pre by more than
        // the 0.01 tolerance, over the union of both key sets. Q4:
        // the tolerance is the same number, now in dimensionless
        // crossing-number units — any genuine crossing increase
        // flags; sub-0.01 float noise does not.
        function sgRegressed(pre, post) {
            const keys = new Set([ ...Object.keys(pre), ...Object.keys(post) ]), out = [];
            return keys.forEach(k => {
                const a = null != pre[k] ? pre[k] : 0, b = null != post[k] ? post[k] : 0;
                b > a + SX_SCORE.REGRESSION_TOL && out.push(k);
            }), out;
        }
        // A measure's map total: the sum of its per-cloud values.
        function sgCloudTotal(values) {
            let t = 0;
            for (const k in values) t += Number(values[k]) || 0;
            return t;
        }
        // The guard's pre-settle centers, read from the RENDERED
        // geometry: every [data-layout-key] element present under
        // the map layer — live-zone keys as live elements, frozen
        // keys as the vault's rendered elements, each seen exactly
        // once — contributes its icon's rendered center, converted
        // through the icon's OWN SVG geometry chain: the icon's
        // local center (its data-diameter midpoint — the disc the
        // paint centers on the node — with the getBBox centre as
        // the equivalent when no diameter is recorded) composed
        // with the element's own getCTM(), which composes every
        // ancestor SVG transform, the vault's included, and then
        // with the inverse of the layer's own getCTM(), landing in
        // the map's world frame (the frame dataset.layoutX/layoutY
        // and scCtx.centers values live in). A screen rect divided
        // by the layer's screen CTM is NOT used for any element:
        // for vault-resident elements the rect carries the vault's
        // own positioning, which that conversion does not account
        // for, so rect-derived centers seated vault clouds at
        // garbage positions. Branch membership filters through the
        // qn registry exactly as scCaptureDeliveredCenters filters;
        // the resulting Map has the identical shape (key -> {x, y}).
        // Dataset values are read only as the check and the
        // fallback: they are stale for vault-resident branches
        // during a blit session (see the header note).
        // Validation: the dataset center of every element NOT
        // inside .sx-blit-vault is known-fresh, so a converted
        // center deviating from it by more than 1.0 world units
        // distrusts the conversion GLOBALLY — the rendered capture
        // is abandoned for the dataset capture
        // (scCaptureDeliveredCenters over all branches) and
        // sgCaptureSource records "dataset-fallback" for the
        // guard's log entry ("rendered" on the success path). Per
        // key, an element whose conversion throws or yields a
        // non-finite or geometry-less result falls back to that
        // key's dataset value; a key missing from both sources
        // stays absent. Fail-open: when the layer CTM is
        // unavailable, or the read throws, the capture falls back
        // to the dataset read.
        function sgCaptureRenderedCenters(frozen) {
            sgCaptureSource = "rendered";
            try {
                const layerCTM = In.getCTM(), inv = layerCTM && layerCTM.inverse();
                if (!inv) return sgCaptureSource = "dataset-fallback", scCaptureDeliveredCenters(frozen);
                const centers = new Map;
                let distrusted = !1;
                return In.querySelectorAll("[data-layout-key]").forEach(el => {
                    const key = el.dataset.layoutKey, info = qn[key];
                    if (!info || !info.branch || !frozen.has(info.branch)) return;
                    const dx = Number(el.dataset.layoutX), dy = Number(el.dataset.layoutY), hasData = Number.isFinite(dx) && Number.isFinite(dy);
                    let p = null;
                    try {
                        const icon = el.querySelector(":scope > .branch-icon, :scope > .topic-icon");
                        if (!icon) throw new Error("settle guard: rendered capture found no icon for a delivered key");
                        const dia = Number(icon.dataset.diameter), bb = icon.getBBox();
                        if (!bb || !(bb.width > 0) || !(bb.height > 0)) throw new Error("settle guard: rendered capture found no icon geometry");
                        const lc = dia > 0 ? {
                            x: dia / 2,
                            y: dia / 2
                        } : {
                            x: bb.x + bb.width / 2,
                            y: bb.y + bb.height / 2
                        }, ctm = icon.getCTM();
                        if (!ctm) throw new Error("settle guard: rendered capture found no icon CTM");
                        p = new DOMPoint(lc.x, lc.y).matrixTransform(ctm).matrixTransform(inv), 
                        p && Number.isFinite(p.x) && Number.isFinite(p.y) || (p = null);
                    } catch (e) {
                        p = null;
                    }
                    if (p) centers.set(key, {
                        x: p.x,
                        y: p.y
                    }), hasData && !el.closest(".sx-blit-vault") && Math.hypot(p.x - dx, p.y - dy) > 1 && (distrusted = !0); else if (hasData) centers.set(key, {
                        x: dx,
                        y: dy
                    });
                }), distrusted ? (sgCaptureSource = "dataset-fallback", scCaptureDeliveredCenters(frozen)) : centers;
            } catch (e) {
                return __sxErrLog("layout-settle-guard", e), sgCaptureSource = "dataset-fallback", scCaptureDeliveredCenters(frozen);
            }
        }
        // The selective restore centers: the current delivered
        // centers, with every key belonging to a regressed branch
        // (branch membership via the qn registry) replaced by its
        // pre-settle delivered center. Keys missing from the
        // pre-settle capture keep their current value.
        function sgSelectiveCenters(preCenters, postCenters, regressedSet) {
            const centers = new Map(postCenters);
            return postCenters.forEach((v, key) => {
                const info = qn[key];
                info && info.branch && regressedSet.has(info.branch) && preCenters.has(key) && centers.set(key, preCenters.get(key));
            }), centers;
        }
        // The selective restore capture: a per-branch merge of
        // the pre-settle capture (preCapture) and a fresh capture
        // of the current (post-repaint) solved state. A regressed
        // branch's entries — in BOTH the branches map and the
        // baseStates map — come from preCapture, so its freeze
        // replay restores the pre-settle solve; every other
        // branch's entries come from the fresh capture, exactly as
        // a restore-time capture behaved before. (BaseStates keys
        // carry their branch name in the second "|"-separated
        // segment, the same keying scCaptureFrozen applies.)
        function sgMergedCapture(preCapture, regressedSet, allNames) {
            const fresh = scCaptureFrozen(allNames), merged = {
                branches: new Map,
                baseStates: new Map
            };
            return fresh.branches.forEach((v, k) => {
                regressedSet.has(k) || merged.branches.set(k, v);
            }), preCapture.branches.forEach((v, k) => {
                regressedSet.has(k) && merged.branches.set(k, v);
            }), fresh.baseStates.forEach((v, k) => {
                const seg = String(k).split("|"), bname = seg.length > 1 ? seg[1] : null;
                bname && !regressedSet.has(bname) && merged.baseStates.set(k, v);
            }), preCapture.baseStates.forEach((v, k) => {
                const seg = String(k).split("|"), bname = seg.length > 1 ? seg[1] : null;
                bname && regressedSet.has(bname) && merged.baseStates.set(k, v);
            }), merged;
        }
        // One restore paint: a scoped paint context with the same
        // shape applyScoped builds — nothing targeted, nothing in
        // the ring, nothing recomputed, every branch frozen — whose
        // centers map seats each frozen topic/child node exactly
        // (the T2 guard in Ar) while the freeze replay restores the
        // solved tree held in the caller-supplied capture. The
        // paint must leave NO blit session behind and arm NO timer:
        // blitPaintEnd's session start is held off for the paint,
        // and any session that nevertheless stands afterwards is
        // torn down synchronously, its "start" entry removed, so
        // the log never gains a session that outlives the guard run.
        function sgRestorePaint(centers, allNames, capture) {
            const frozen = new Set(allNames), ctx = {
                targetBranches: new Set,
                ringBranches: new Set,
                recomputeBranches: new Set,
                frozenBranches: frozen,
                boundaryLog: [],
                dropped: {
                    optimiser: 0,
                    relief: 0,
                    clamp: 0
                },
                fallback: null,
                policy: "contained",
                opClass: "settle-guard",
                reliefPass: 0,
                r6Abort: !1,
                capture: capture,
                centers: centers
            };
            scCtx = ctx, sgHoldBlitStart = !0;
            try {
                Mr({
                    animate: !1,
                    forceRepaint: !0
                });
            } finally {
                scCtx = null, sgHoldBlitStart = !1;
            }
            if (blitSess) {
                const s2 = blitSess;
                blitSess = null, s2.timer && clearTimeout(s2.timer), s2.rasterUrl && URL.revokeObjectURL(s2.rasterUrl), 
                blitStripArtifacts();
                for (let i = dkLog.length - 1; i >= 0; i--) {
                    const en = dkLog[i];
                    if (en && "blit-session" === en.type && "start" === en.event) {
                        dkLog.splice(i, 1);
                        break;
                    }
                }
                // F6: the removed "start" never gains an "end", so
                // the signal reverts to the new last blit-session
                // entry — exactly the verdict the gate's log scan
                // produced over the spliced log.
                blitSigActive = !1;
                for (let i = dkLog.length - 1; i >= 0; i--) {
                    const en = dkLog[i];
                    if (en && "blit-session" === en.type) {
                        blitSigActive = "start" === en.event;
                        break;
                    }
                }
            }
        }
        // The guarded settle itself, run from blitArmTimer's expiry
        // with the log length marked at run start (for the deferred
        // end decision in step 5). Never rejects: every failure is
        // funnelled into the fail-open paths below.
        async function sgRunSettleGuard(sess, logMark) {
            let pendingEnd = null, pre = null, post = null, final = null, regressed = [], rounds = 0, aborted = !1, bailed = !1, baselineSource = "live";
            const newerStartSeen = () => {
                for (let i = logMark; i < dkLog.length; i++) {
                    const en = dkLog[i];
                    if (en && "blit-session" === en.type && "start" === en.event) return !0;
                }
                return !1;
            }, flushEnd = () => {
                // The deferred end lands only when no newer session
                // has started since this guard run began — a live
                // session's own end closes the log instead.
                if (!pendingEnd || newerStartSeen()) return;
                const en = pendingEnd;
                pendingEnd = null, dkLog.push(en), blitSigActive = !1;
            };
            try {
                // 1. Pre-capture, the blit session still active:
                // capture every branch's centers FIRST, while the
                // vault still stands — the rendered read
                // (sgCaptureRenderedCenters) sees live and
                // vault-resident elements alike; then strip the
                // artifacts (the same call blitEndSession makes)
                // before the pre-settle solved-state capture
                // (preCapture) and the pre-settle per-cloud
                // overlap measure, which read as before.
                const allNames = sgAllBranchNames();
                if (!allNames.size) throw new Error("settle guard: no delivered branches to guard");
                const preCenters = sgCaptureRenderedCenters(allNames);
                blitStripArtifacts();
                const preCapture = scCaptureFrozen(allNames);
                const sessBaseline = sess && sess.preBaseline ? await sess.preBaseline : null;
                if (sessBaseline) pre = sessBaseline, baselineSource = "pre-session"; else pre = await sgMeasureClouds();
                if (blitSess !== sess) {
                    // The session ended (or was replaced) while the
                    // pre-measure ran — its own end entry already
                    // closed it. Stand down without touching the
                    // replacement session, and never restore.
                    aborted = !0, post = final = await sgMeasureClouds().catch(() => pre);
                } else {
                    // 2. Settle repaint: tear the session down
                    // exactly as blitEndSession does, but hold the
                    // "end" entry as pendingEnd instead of pushing
                    // it — it lands in step 5, after the guard has
                    // completely finished.
                    pendingEnd = {
                        type: "blit-session",
                        event: "end",
                        frozen: sess.frozenCount
                    }, blitSess = null, sess.timer && clearTimeout(sess.timer), sess.rasterUrl && URL.revokeObjectURL(sess.rasterUrl), 
                    blitStripArtifacts();
                    try {
                        Mr({
                            animate: !1,
                            forceRepaint: !0
                        });
                    } catch (_) {
                        __sxErrLog("layout-blit-timer", _);
                    }
                    // 3. Post-measure: which clouds did the settle
                    // repaint make worse?
                    post = await sgMeasureClouds(), final = post, regressed = sgRegressed(pre, post);
                    // 4. Restore, only when some cloud regressed:
                    // up to two selective rounds (regressed clouds
                    // re-seated at their pre-settle centers, every
                    // other node at its current center), then — if a
                    // cloud is still above its pre-settle value —
                    // one full restore paint seating every node at
                    // its pre-settle delivered center. Before every
                    // round, abort if a live edit has taken the map
                    // over (a new blit session, an active scope):
                    // the guard never fights a live edit.
                    let reg = regressed;
                    while (reg.length && rounds < 2) {
                        if (blitSess || scCtx) {
                            aborted = !0;
                            break;
                        }
                        const regSet = new Set(reg);
                        sgRestorePaint(sgSelectiveCenters(preCenters, scCaptureDeliveredCenters(allNames), regSet), allNames, sgMergedCapture(preCapture, regSet, allNames)), 
                        rounds++, final = await sgMeasureClouds(), reg = sgRegressed(pre, final);
                    }
                    if (!aborted && reg.length) if (blitSess || scCtx) aborted = !0; else sgRestorePaint(preCenters, allNames, preCapture), 
                    rounds++, final = await sgMeasureClouds();
                    // 4b. The brake: improve-or-hold applies to the
                    // guard too — it may fail its per-cloud
                    // objective, but it may not leave the map worse
                    // than the settle it replaced. If restore rounds
                    // ran and the final total nevertheless exceeds
                    // the post-repaint total, discard the restore:
                    // run ONE plain legacy settle repaint (no
                    // scoped context — the session is already torn
                    // down), re-measure, and keep the re-measured
                    // values as final. The log entry is marked
                    // bailed; regressed/rounds/pre/post still
                    // describe the original regression and attempts.
                    if (!aborted && rounds > 0 && sgCloudTotal(final) > sgCloudTotal(post)) {
                        bailed = !0;
                        try {
                            Mr({
                                animate: !1,
                                forceRepaint: !0
                            });
                        } catch (_) {
                            __sxErrLog("layout-blit-timer", _);
                        }
                        final = await sgMeasureClouds().catch(() => final);
                    }
                }
                // 5. Log the guard's own receipt, then land the
                // deferred end (unless a newer session superseded
                // it). With no regression the guard is transparent:
                // no restore paint ran, and the only change from the
                // legacy settle is that the end entry lands after
                // the post-measure instead of before the repaint —
                // the settle has not landed until it has been
                // checked.
                // Q4: every watched cloud's crossing numbers ride
                // on the entry as a per-cloud report (pre / post /
                // final). They are reported for visibility; the
                // guard's decisions remain exactly the per-cloud
                // epsilon test in sgRegressed over the same maps —
                // no neighbor or total comparison gates anything
                // beyond the pre-existing total-based brake above.
                const sgReported = {};
                [ pre, post, final ].forEach(m => {
                    if (m) for (const k of Object.keys(m)) sgReported[k] || (sgReported[k] = { pre: null, post: null, final: null });
                });
                if (pre) for (const k of Object.keys(pre)) sgReported[k].pre = pre[k];
                if (post) for (const k of Object.keys(post)) sgReported[k].post = post[k];
                if (final) for (const k of Object.keys(final)) sgReported[k].final = final[k];
                const sgEntry = {
                    type: "settle-guard",
                    metric: "crossingnumber",
                    regressed: regressed.slice(),
                    rounds: rounds,
                    aborted: aborted,
                    captureSource: sgCaptureSource,
                    baselineSource: baselineSource,
                    pre: pre,
                    post: post,
                    final: final,
                    reportedClouds: sgReported
                };
                bailed && (sgEntry.bailed = !0), dkLog.push(sgEntry), flushEnd();
            } catch (e) {
                __sxErrLog("layout-settle-guard", e);
                // Fail-open. Before the teardown, nothing has been
                // touched that the legacy settle would not touch:
                // run it exactly. After the teardown, the settle
                // repaint already landed — just land the held end
                // entry so the settle is never lost.
                if (!pendingEnd && blitSess === sess) try {
                    blitEndSession();
                    try {
                        Mr({
                            animate: !1,
                            forceRepaint: !0
                        });
                    } catch (mErr) {
                        __sxErrLog("layout-blit-timer", mErr);
                    }
                } catch (_) {
                    __sxErrLog("layout-settle-guard", _);
                } else flushEnd();
            }
        }
        // Paint-top gate (start of Ar): a non-scoped paint, or a
        // scoped paint whose frozen set differs from the session's,
        // ends the session before the paint runs — the paint is then
        // an ordinary segment/full paint and its clear removes the
        // artifacts. Boundary-log entries are not an end condition:
        // under a contained scope they are suppressed coupling
        // candidates that do not change frozen geometry.
        function blitPaintGate() {
            if (!blitSess) return;
            if (!scCtx || !blitSameFrozen(scCtx.frozenBranches, blitSess.frozen)) blitEndSession();
        }
        // Snapshot: clone the layer element and remove everything
        // belonging to the live zone — groups whose keys are live;
        // label-stack items containing a label whose data-id is
        // live; control-stack items containing controls whose
        // data-id is live; spoke-underlay items whose data-spoke-for
        // is live; overlay children whose data-id is live — plus the
        // relations layers and the center content (both stay live in
        // the real DOM). Live keys = every group key whose branch
        // (per the qn registry the just-finished paint built) is NOT
        // in the session's frozen set. What remains is the frozen
        // complement with a genuine hole where the live zone was.
        function blitSnapshot(sess) {
            const clone = In.cloneNode(!0), live = new Set;
            clone.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => {
                const info = qn[el.dataset.layoutKey];
                (info && sess.frozen.has(info.branch)) || live.add(el.dataset.layoutKey);
            }), clone.querySelectorAll(".layout-exit-clone, .sx-blit-vault, .sx-blit-raster").forEach(el => el.remove()), 
            clone.querySelectorAll(".node-group[data-layout-key]").forEach(el => {
                live.has(el.dataset.layoutKey) && el.remove();
            }), clone.querySelectorAll(".common-overlap-layer, .branch-relation-layer").forEach(el => el.remove()), 
            Array.from(clone.children).forEach(el => {
                (el.hasAttribute("data-empty-profile-map") || el.querySelector && el.querySelector(".center-hit, .center-glance-rings")) && el.remove();
            }), clone.querySelectorAll(".center-glance-rings").forEach(el => el.remove());
            const ls = clone.querySelector(":scope > .map-label-stack");
            ls && Array.from(ls.children).forEach(item => {
                const lab = item.querySelector(".category-label[data-id], .map-label[data-id]");
                lab && live.has(lab.dataset.id) && item.remove();
            });
            const cs = clone.querySelector(":scope > .direction-control-stack");
            cs && Array.from(cs.children).forEach(item => {
                Array.from(item.querySelectorAll(".direction-control[data-id]")).some(c => live.has(c.dataset.id)) && item.remove();
            });
            const un = clone.querySelector(":scope > .spoke-underlay");
            un && un.querySelectorAll(".spoke-underlay-item[data-spoke-for]").forEach(item => {
                live.has(item.dataset.spokeFor) && item.remove();
            });
            const ov = clone.querySelector(".node-interaction-overlay");
            ov && ov.querySelectorAll("[data-id]").forEach(el => {
                live.has(el.dataset.id) && el.remove();
            });
            // Serialize: the cloned layer's children, wrapped in a
            // <g> reproducing the layer's own transform if it has one.
            const ser = new XMLSerializer, tf = In.getAttribute("transform");
            let body = Array.from(clone.childNodes).map(n => ser.serializeToString(n)).join("");
            return tf && (body = `<g transform="${tf}">${body}</g>`), body;
        }
        // The serialized snapshot document: an <svg> wrapper over
        // the world rect the camera code uses, a <style> whose text
        // is the concatenation of the document's own <style>
        // elements (an image-loaded SVG is style-isolated, so the
        // map's class styling travels with it), then the snapshot
        // body. Width/height carry the rasterization scale.
        function blitSvgString(sess, scale) {
            const side = Math.max(1, Math.round(3200 * scale)), css = sess.css.replace(/&/g, "&amp;").replace(/</g, "&lt;");
            return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-700 -980 3200 3200" width="${side}" height="${side}"><style>${css}</style>${sess.svgBody}</svg>`;
        }
        function blitStartSession(frozenSet) {
            const sess = {
                token: ++blitTokenSeq,
                frozen: new Set(frozenSet),
                frozenCount: frozenSet.size,
                css: Array.from(document.querySelectorAll("style")).map(s => s.textContent || "").join("\n"),
                svgBody: "",
                svg: "",
                scale: 0,
                rasterUrl: null,
                rasterReady: !1,
                swapped: !1,
                rseq: 0,
                order: [],
                orderIx: new Map,
                frozenKeys: [],
                records: new Map,
                flushIx: 0,
                timer: 0,
                autofitExit: !1,
                exitTimer: 0
            };
            sess.svgBody = blitSnapshot(sess), sess.scale = blitScaleNow(), sess.svg = blitSvgString(sess, sess.scale), 
            In.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => sess.order.push(el.dataset.layoutKey)), 
            sess.order.forEach((k, ix) => sess.orderIx.set(k, ix)), sess.frozenKeys = sess.order.filter(k => {
                const info = qn[k];
                return info && sess.frozen.has(info.branch);
            }), blitSess = sess, dkLog.push({
                type: "blit-session",
                event: "start",
                frozen: sess.frozenCount
            }), blitSigActive = !0, blitArmTimer(sess), blitRasterize(sess, sess.scale);
            sess.preBaseline = sgMeasureClouds().catch(() => null);
        }
        // Asynchronous rasterization: load the serialized SVG via a
        // blob URL into an Image, draw it to a canvas at `scale` px
        // per world unit (canvas at most 6400 px on a side), and
        // keep the canvas blob URL as the raster source.
        function blitRasterize(sess, scale) {
            const rseq = ++sess.rseq, svgStr = blitSvgString(sess, scale);
            let blobUrl = null;
            try {
                blobUrl = URL.createObjectURL(new Blob([ svgStr ], {
                    type: "image/svg+xml;charset=utf-8"
                }));
            } catch (_) {
                return void blitRasterFailed(sess);
            }
            const img = new Image;
            img.onload = () => {
                URL.revokeObjectURL(blobUrl);
                if (blitSess !== sess || sess.rseq !== rseq) return;
                try {
                    const side = Math.max(1, Math.min(6400, Math.round(3200 * scale))), cv = document.createElement("canvas");
                    cv.width = side, cv.height = side, cv.getContext("2d").drawImage(img, 0, 0, side, side), 
                    cv.toBlob(b => {
                        if (blitSess !== sess || sess.rseq !== rseq) return;
                        b ? blitRasterDone(sess, URL.createObjectURL(b), scale, svgStr) : blitRasterFailed(sess);
                    }, "image/png");
                } catch (_) {
                    blitRasterFailed(sess);
                }
            }, img.onerror = () => {
                URL.revokeObjectURL(blobUrl), blitSess === sess && sess.rseq === rseq && blitRasterFailed(sess);
            }, img.src = blobUrl;
        }
        function blitRasterFailed(sess) {
            // With no raster at all the session can never swap in:
            // end it (paints stay ordinary P1 segment paints). A
            // failed RE-rasterize keeps the current raster instead.
            if (blitSess === sess && !sess.rasterUrl) blitEndSession();
        }
        function blitRasterDone(sess, url, scale, svgStr) {
            if (blitSess !== sess) return void URL.revokeObjectURL(url);
            const old = sess.rasterUrl;
            sess.rasterUrl = url, sess.rasterReady = !0, sess.scale = scale, sess.svg = svgStr, 
            old && old !== url && URL.revokeObjectURL(old);
            if (sess.swapped) {
                const el = In.querySelector(":scope > .sx-blit-raster");
                el && (el.setAttribute("href", url), el.setAttributeNS(BLIT_XLINK, "xlink:href", url));
            } else try {
                blitSwapFromDOM(sess);
            } catch (_) {
                __sxErrLog("layout-blit-swap", _), blitStripArtifacts(), blitEndSession();
            }
        }
        // The blit module's own stack indexes and per-key piece
        // collection: the same single-pass indexes and the same
        // in-group-first-then-stacks semantics as P1's capture — a
        // segment's pieces are found whether they currently live in
        // the extraction stacks or inside its (vaulted) group.
        function blitIndexStacks() {
            const ix = {
                labelStack: In.querySelector(":scope > .map-label-stack"),
                ctrlStack: In.querySelector(":scope > .direction-control-stack"),
                underlay: In.querySelector(":scope > .spoke-underlay"),
                overlay: In.querySelector(".node-interaction-overlay"),
                label: new Map,
                controls: new Map,
                stems: new Map,
                badge: new Map
            };
            return ix.labelStack && ix.labelStack.querySelectorAll(".category-label[data-id], .map-label[data-id]").forEach(el => {
                const id = el.dataset.id;
                id && !ix.label.has(id) && ix.label.set(id, el);
            }), ix.ctrlStack && ix.ctrlStack.querySelectorAll(".direction-control[data-id]").forEach(el => {
                const id = el.dataset.id;
                if (!id) return;
                const arr = ix.controls.get(id);
                arr ? arr.push(el) : ix.controls.set(id, [ el ]);
            }), ix.underlay && ix.underlay.querySelectorAll(".spoke-underlay-item[data-spoke-for]").forEach(el => {
                const id = el.dataset.spokeFor;
                id && !ix.stems.has(id) && ix.stems.set(id, el);
            }), ix.overlay && ix.overlay.querySelectorAll(".hidden-count-badge[data-id]").forEach(el => {
                const id = el.dataset.id;
                id && !ix.badge.has(id) && ix.badge.set(id, el);
            }), ix;
        }
        function blitPieces(key, el, ix) {
            const seg = {
                label: null,
                controls: [],
                stems: [],
                badge: null
            };
            let found = el.querySelector(":scope > .category-label, :scope > .map-label");
            if (found) seg.label = found; else if (ix.labelStack && (found = ix.label.get(key))) seg.label = found;
            const inControls = Array.from(el.querySelectorAll(":scope > .direction-control")), stackControls = ix.ctrlStack ? ix.controls.get(key) || [] : [];
            inControls.length && (seg.controls = inControls), stackControls.length && (seg.controls = seg.controls.concat(stackControls));
            const inStems = Array.from(el.querySelectorAll(vr)).filter(c => !(__sxClosestAction(c, "directionControl") || __sxClosestAction(c, "secondGenRatingControls") || c.classList.contains("visual-rail") && c.classList.contains("rating-rail")));
            if (!inStems.length && ix.underlay) {
                const item = ix.stems.get(key);
                item && item.children.length && (seg.stems = Array.from(item.children));
            }
            return found = el.querySelector(":scope > .hidden-count-badge"), found ? seg.badge = found : ix.overlay && (found = ix.badge.get(key)) && (seg.badge = found), 
            seg;
        }
        function blitAssemble(seg, el) {
            seg.stems.forEach(p => {
                p && p.parentNode !== el && el.appendChild(p);
            }), seg.controls.forEach(p => {
                p && p.parentNode !== el && el.appendChild(p);
            }), seg.label && seg.label.parentNode !== el && el.appendChild(seg.label), 
            seg.badge && seg.badge.parentNode !== el && el.appendChild(seg.badge);
        }
        // Settle-pass obstacle records, computed at swap time from
        // the then-current settled DOM: per frozen group, exactly
        // the shapes the settle pass itself would push for that
        // group, as plain data — icon box (center = the group's
        // data-layout-x/y, size = its icon's data-diameter); one box
        // per direction control (center = baseCx/baseCy + the
        // translate parsed from its settled transform, width/height
        // exactly as the pass computes them including the
        // active-control 320x40 special case via the Nt comparison,
        // angle = rotate + baseAngle); label box (center = the
        // group's data-label-x/y, width = max(24, the label's
        // getComputedTextLength()), height 30 for a category label
        // else 22, angle = the concept path's first-segment
        // direction). A group the pass would skip (hidden, no
        // label, no usable concept path) records null.
        function blitBuildRecords(sess) {
            const ix = blitIndexStacks();
            sess.frozenKeys.forEach(key => {
                const el = In.querySelector(`.node-group[data-layout-key="${CSS.escape(key)}"]:not(.layout-exit-clone)`);
                if (!el || el.classList.contains("is-hidden")) return void sess.records.set(key, null);
                const seg = blitPieces(key, el, ix), label = seg.label;
                if (!label) return void sess.records.set(key, null);
                const textPath = label.querySelector("textPath"), href = textPath && textPath.getAttribute("href"), pathId = label.dataset.pathId || href && href.slice(1), path = pathId && document.getElementById(pathId);
                let plen = 0;
                try {
                    plen = path ? path.getTotalLength() : 0;
                } catch (_) {
                    plen = 0;
                }
                if (!path || !plen) return void sess.records.set(key, null);
                const icon = el.querySelector(".branch-icon,.topic-icon"), dia = Number(icon && icon.dataset.diameter) || 0, lx = Number.parseFloat(el.dataset.layoutX), ly = Number.parseFloat(el.dataset.layoutY), rec = {
                    icon: dia && Number.isFinite(lx) && Number.isFinite(ly) ? {
                        x: lx,
                        y: ly,
                        size: dia
                    } : null,
                    controls: [],
                    label: null
                };
                seg.controls.forEach(c => {
                    const scale = Number(c.dataset.controlScale) || 1, active = Boolean(Nt && Nt.id === key && Nt.direction === c.dataset.direction), baseCx = Number(c.dataset.baseCx), baseCy = Number(c.dataset.baseCy), baseAngle = Number(c.dataset.baseAngle) || 0, m = /translate\((-?[\d.]+)[ ,]+(-?[\d.]+)\)\s*rotate\((-?[\d.]+)/.exec(c.getAttribute("transform") || "");
                    rec.controls.push({
                        x: (Number.isFinite(baseCx) ? baseCx : 0) + (m ? Number(m[1]) : 0),
                        y: (Number.isFinite(baseCy) ? baseCy : 0) + (m ? Number(m[2]) : 0),
                        w: active ? 320 * scale : Number(c.dataset.tagWidth) || 48,
                        h: active ? 40 * scale : Number(c.dataset.tagHeight) || 20,
                        angle: (m ? Number(m[3]) : 0) + baseAngle
                    });
                });
                const labelX = Number.parseFloat(el.dataset.labelX), labelY = Number.parseFloat(el.dataset.labelY);
                if (Number.isFinite(labelX) && Number.isFinite(labelY)) {
                    const f = path.getPointAtLength(0), y = path.getPointAtLength(Math.min(1, plen));
                    rec.label = {
                        x: labelX,
                        y: labelY,
                        w: Math.max(24, label.getComputedTextLength()),
                        h: label.classList.contains("category-label") ? 30 : 22,
                        angle: 180 * Math.atan2(y.y - f.y, y.x - f.x) / Math.PI
                    };
                }
                sess.records.set(key, rec);
            });
        }
        // Settle-pass obstacle continuity: flush the recorded
        // frozen shapes into the pass's obstacle array via the
        // pass's own oriented-box helper, at their branch-order
        // positions — before each live group, every frozen record
        // that precedes it in the captured group order; after the
        // group loop (beforeKey = null), the rest.
        function blitFlushObstacles(sess, r, o, beforeKey) {
            const limit = null == beforeKey ? Infinity : sess.orderIx.has(beforeKey) ? sess.orderIx.get(beforeKey) : -1;
            while (sess.flushIx < sess.frozenKeys.length) {
                const key = sess.frozenKeys[sess.flushIx];
                if (null != beforeKey && !(sess.orderIx.get(key) < limit)) break;
                sess.flushIx++;
                const rec = sess.records.get(key);
                if (!rec) continue;
                rec.icon && r.push(o(rec.icon.x, rec.icon.y, rec.icon.size, rec.icon.size));
                for (const c of rec.controls) r.push(o(c.x, c.y, c.w, c.h, c.angle));
                rec.label && r.push(o(rec.label.x, rec.label.y, rec.label.w, rec.label.h, rec.label.angle));
            }
        }
        function blitInsertArtifacts(sess, vault) {
            const img = document.createElementNS(BLIT_NS, "image");
            img.setAttribute("class", "sx-blit-raster"), img.setAttribute("aria-hidden", "true"), 
            img.setAttribute("x", "-700"), img.setAttribute("y", "-980"), img.setAttribute("width", "3200"), img.setAttribute("height", "3200"), 
            img.setAttribute("href", sess.rasterUrl), img.setAttributeNS(BLIT_XLINK, "xlink:href", sess.rasterUrl);
            const under = In.querySelector(":scope > .spoke-underlay");
            under ? In.insertBefore(img, under) : In.firstElementChild ? In.insertBefore(img, In.firstElementChild) : In.appendChild(img), 
            In.appendChild(vault);
        }
        // First swap, from the current full-vector settled DOM (the
        // raster-ready callback, or the end of a pending paint):
        // obstacle records are computed first, while the settled DOM
        // is intact; then each frozen segment is assembled into its
        // group exactly as P1's splice assembles it, deep-cloned
        // into the vault in branch order, and the original removed
        // from the visible flow; stack/underlay items the assembly
        // emptied and the frozen overlay hits go with it.
        function blitSwapFromDOM(sess) {
            if (!sess.rasterUrl || sess.swapped) return;
            blitBuildRecords(sess);
            const ix = blitIndexStacks(), vault = document.createElementNS(BLIT_NS, "g");
            vault.setAttribute("class", "sx-blit-vault"), vault.setAttribute("display", "none"), 
            sess.frozenKeys.forEach(key => {
                const el = In.querySelector(`.node-group[data-layout-key="${CSS.escape(key)}"]:not(.layout-exit-clone)`);
                if (!el) return;
                blitAssemble(blitPieces(key, el, ix), el), vault.appendChild(el.cloneNode(!0)), el.remove();
            }), ix.labelStack && Array.from(ix.labelStack.children).forEach(item => {
                item.childNodes.length || item.remove();
            }), ix.ctrlStack && Array.from(ix.ctrlStack.children).forEach(item => {
                item.childNodes.length || item.remove();
            }), ix.underlay && Array.from(ix.underlay.children).forEach(item => {
                item.childNodes.length || item.remove();
            }), ix.overlay && Array.from(ix.overlay.querySelectorAll("[data-id]")).forEach(n => {
                sess.frozenKeys.indexOf(n.dataset.id) >= 0 && n.remove();
            }), blitInsertArtifacts(sess, vault), sess.swapped = !0;
        }
        // End-of-paint artifact step for a continuing live session:
        // rebuild the vault from this paint's captured segments
        // (their pieces were found in the previous vault, already
        // assembled) and re-insert the raster image. The paint's own
        // passes never see the vault: the top-of-paint clear removed
        // it before any pass ran, and it is attached only now.
        function blitVaultFromCaptures(sess, scKeep, scSeg) {
            const vault = document.createElementNS(BLIT_NS, "g");
            vault.setAttribute("class", "sx-blit-vault"), vault.setAttribute("display", "none"), 
            sess.frozenKeys.forEach(key => {
                const seg = scSeg.get(key), el = scKeep.get(key);
                if (!seg || !el) return;
                blitAssemble(seg, el), vault.appendChild(el.cloneNode(!0));
            }), blitInsertArtifacts(sess, vault);
        }
        // End-of-paint session step, called from the end of Ar
        // (where the T3 restore block sits) with the paint's T3/P1
        // captures: start a session after a burst's first scoped
        // paint, or run the continuing paint's vault/image step
        // and re-arm the timer. Boundary-log entries do NOT gate
        // the session: under a contained scope they are suppressed
        // coupling candidates that by Stage 3's containment
        // construction do not change frozen geometry (moved-outside
        // = 0), so they cannot make the frozen-complement raster
        // stale.
        function blitPaintEnd(scKeep, scSeg) {
            const sess = blitSess;
            if (!scCtx) return;
            // AUTOFIT EXIT mark: an Autofit scoped apply (opClass
            // "applyAutofit", set by the editor's scopedScope) marks
            // the session its paint starts or continues, so
            // blitArmTimer's Repulsion branch can schedule that
            // session's own ending exit (see there). No other
            // opClass marks a session.
            const autofitPaint = "applyAutofit" === scCtx.opClass;
            if (!sess) {
                // Settle guard: a guard restore paint runs with
                // every branch frozen and must leave no session (and
                // no rest-timer) behind — session starts are held
                // off for the duration of the guard's paints.
                if (sgHoldBlitStart) return;
                // First scoped paint of a burst — it ran as a normal
                // P1 segment paint. Never start when animations are
                // on or when nothing is frozen.
                if (!!mn.animations || !scCtx.frozenBranches.size) return;
                blitStartSession(scCtx.frozenBranches);
                // Mark + re-arm: blitStartSession armed the timer
                // before the mark existed; the re-arm is what
                // schedules the exit in Repulsion mode (in every
                // other mode it re-arms the same rest-timer, exactly
                // as a continuing paint's re-arm does).
                if (autofitPaint && blitSess) blitSess.autofitExit = !0, blitArmTimer(blitSess);
                return;
            }
            if (sess.swapped) {
                if (!scSeg || !scKeep) return void blitEndSession();
                blitVaultFromCaptures(sess, scKeep, scSeg);
            } else if (sess.rasterReady) try {
                blitSwapFromDOM(sess);
            } catch (_) {
                return void (__sxErrLog("layout-blit-swap", _), blitStripArtifacts(), blitEndSession());
            }
            autofitPaint && (sess.autofitExit = !0), blitSess === sess && blitArmTimer(sess);
        }
        // Camera settle hook, run at the END of kh() — after any
        // mode downgrade has re-set the viewBox and after the final
        // transform commit: if a blit session is active and the
        // settled on-screen scale differs from the session's raster
        // scale by more than 25%, re-rasterize from the stored SVG
        // string at the new scale; the in-DOM image's href swaps
        // when the new raster is ready (blitRasterDone).
        function blitCameraHook() {
            const sess = blitSess;
            if (!sess || !sess.svgBody) return;
            const s = blitScaleNow();
            if (sess.scale && Math.abs(s - sess.scale) / sess.scale <= .25) return;
            blitRasterize(sess, s);
        }
        // DeKnotter base-state registry (E3): the most recent
        // _radialBase20 capture per stable item identity, refreshed by
        // rr.resolveRadialSiblings at every resolver entry and read back
        // through deknotter.baseState(). Keyed by stable identity —
        // never by wrapper object — because wrappers are rebuilt on
        // every fr() run while identities persist across solves.
        const dkBaseStates = new Map;
        // Bundle-side equivalents of the editor shell's bakedBranchBase /
        // bakedSubBase(name, "length") / bakedKinkBase: read the same
        // __SEXCAPADES_LAYOUT_DEFAULTS object, same fallback of 1.
        function dkBakedBranchBase(name) {
            const d = window.__SEXCAPADES_LAYOUT_DEFAULTS, e = d && d.branchOverrides ? d.branchOverrides[name] : null, v = e ? Number(e.length) : NaN;
            return v > 0 ? v : 1;
        }
        function dkBakedSubBase(name) {
            const d = window.__SEXCAPADES_LAYOUT_DEFAULTS, e = d && d.subcatOverrides ? d.subcatOverrides[name] : null, v = e ? Number(e.length) : NaN;
            return v > 0 ? v : 1;
        }
        function dkBakedKinkBase(id) {
            const d = window.__SEXCAPADES_LAYOUT_DEFAULTS, e = d && d.kinkOverrides ? d.kinkOverrides[id] : null, v = e ? Number(e.length) : NaN;
            return v > 0 ? v : 1;
        }
        // Validate one phase patch: for every length override at the
        // branch, subcategory, and kink levels compute ratio = stored /
        // bakedBase and collect the per-level ratios plus every failure.
        function dkValidatePhasePatch(patch, cap) {
            const ratios = { branch: {}, subcat: {}, kink: {} }, failures = [];
            const check = (map, level, baseFn) => {
                if (!map || "object" != typeof map) return;
                Object.keys(map).forEach(key => {
                    const entry = map[key];
                    if (!entry || "object" != typeof entry || !Object.prototype.hasOwnProperty.call(entry, "length")) return;
                    const base = baseFn(key), ratio = Number(entry.length) / base;
                    ratios[level][key] = ratio, (Number.isFinite(ratio) && ratio > 0 && ratio <= cap) || failures.push({
                        level: level,
                        key: key,
                        value: entry.length,
                        ratio: ratio,
                        cap: cap,
                        base: base
                    });
                });
            };
            if (patch) {
                check(patch.branchOverrides, "branch", dkBakedBranchBase);
                check(patch.subcatOverrides, "subcat", dkBakedSubBase);
                check(patch.kinkOverrides, "kink", dkBakedKinkBase);
            }
            return { ratios: ratios, failures: failures };
        }
        // DeKnotter snapshot helpers (E2): API.get() returns container
        // copies whose per-entry objects are the SAME references as live
        // state, so a gate snapshot needs a true deep clone. Override and
        // angle maps are cloned per entry (one level per entry suffices —
        // entry fields are primitives); the two spoke auto-shrink arm maps hold
        // booleans, so a container copy is a true copy; scalars go by
        // value. The clone shares no object references with its source,
        // in either direction.
        const dkEntryMaps = { branchOverrides: 1, subcatOverrides: 1, kinkOverrides: 1, subcatAngleOffsets: 1, kinkAngleOffsets: 1 };
        const dkArmMaps = { branchSpokeAutoShrink: 1, subcatSpokeAutoShrink: 1 };
        function dkCloneEntryMap(value) {
            const out = {};
            if (!value || "object" != typeof value) return out;
            return Object.keys(value).forEach(key => {
                const entry = value[key];
                out[key] = entry && "object" == typeof entry ? Object.assign({}, entry) : entry;
            }), out;
        }
        // F8 naming note: this "snapshot" is the LAYOUT-SETTINGS
        // snapshot — a deep clone of the dials object (layout state
        // only). It is NOT the sharing section's profile/data
        // snapshot; the two share a word, not a mechanism. Every
        // layout-side snapshot()/restore() (driver API, untangler)
        // means THIS one.
        function dkDeepCloneLayout(state) {
            const out = {};
            if (!state || "object" != typeof state) return out;
            return Object.keys(state).forEach(key => {
                const value = state[key];
                out[key] = dkEntryMaps[key] ? dkCloneEntryMap(value) : dkArmMaps[key] ? value && "object" == typeof value ? Object.assign({}, value) : value : value;
            }), out;
        }
        // Canonical stable stringify (E2): keys sorted at every level, so
        // two layout states can be compared for exact equality as strings.
        function dkStableStringify(value) {
            if (null === value || "object" != typeof value) {
                const s = JSON.stringify(value);
                return void 0 === s ? "null" : s;
            }
            return Array.isArray(value) ? "[" + value.map(dkStableStringify).join(",") + "]" : "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + dkStableStringify(value[key])).join(",") + "}";
        }
        // Fit-target registry (E4): target radii in final rendered
        // units, keyed by the same stable item identity as the
        // base-state registry above ('topic|<branch>|<topicId>',
        // 'subcat|<branch>|<label>', 'child|<branch>|<label>|<topicId>').
        // dkFitRevision increments on every registration change and
        // feeds the resolver signature (see dkRadialBaseInfo) through
        // dkFitTargetFor, so arming, retargeting, or clearing an item
        // invalidates its captured _radialBase20 and the next solve
        // recaptures under the new governing state; on disarm the fit
        // fields leave the signature and the item returns to legacy
        // behavior.
        const dkFitRegistry = new Map;
        let dkFitRevision = 0;
        // The most recent solve's branch sectors, kept so the driver
        // can enumerate the currently rendered items of a branch (fit
        // arming and fit reporting) by stable identity.
        let dkLastBranches = null;
        // Fit-target accessor (E3 contract, E4 wiring): the ONE read
        // point for fit state. Returns null ("no fit") for an unarmed
        // item, else { target, revision } for the item's stable key.
        // The signature and floor rules that consume it are unchanged
        // from E3: a fit-armed item's resolver floor IS its target.
        function dkFitTargetFor(key) {
            return dkFitRegistry.has(key) ? {
                target: dkFitRegistry.get(key),
                revision: dkFitRevision
            } : null;
        }
        // Convenience for solver sites that hold an item wrapper rather
        // than a key: the item's fit target, or null when unarmed. The
        // empty-registry fast path keeps every legacy solve path free of
        // per-item key work while no fit is registered, so non-fit
        // behavior (and cost) is unchanged.
        function dkFitTargetValueFor(item) {
            if (!dkFitRegistry.size) return null;
            const fit = dkFitTargetFor(dkRadialBaseInfo(item).key);
            return fit ? fit.target : null;
        }
        function dkSigNum(value) {
            const n = Number(value);
            return Number.isFinite(n) ? String(n) : "-";
        }
        function dkSigLen(map, key) {
            const entry = map ? map[key] : null;
            return entry && "object" == typeof entry ? dkSigNum(entry.length) : "-";
        }
        function dkSigArm(map, key) {
            const value = map ? map[key] : void 0;
            return !0 === value ? "1" : !1 === value ? "0" : "-";
        }
        // Stable identity + governing signature for one radial-resolver
        // item wrapper (E3, ASSESSMENT §2.4). Identity: branch name +
        // topic ID for gen-2 topics, branch name + subcategory label for
        // subcategory nodes, branch name + subcategory label + child
        // topic ID for subcategory children. The signature adds the
        // item's governing length overrides (branch / subcategory / kink,
        // as applicable), its group's auto-shrink arm/gate values, the
        // collision mode, the shared layout scalars the resolver's
        // geometry depends on (spokeLen / subLen / pad / repulsion /
        // fontScale), and — only when a fit target is registered for the
        // item — the fit target value and the fit-registry revision, so
        // a target change invalidates the captured base too. On disarm
        // the fit fields leave the key, the signature changes, and the
        // next resolver entry recaptures from the then-current
        // cloudRadius: the return to legacy behavior.
        function dkRadialBaseInfo(item) {
            let key = "item|" + String(item && item.label || ""), branch = "", subLabel = null, kinkId = null;
            if (item && item.child) {
                branch = String(item.branchName || item.child.branch || ""), subLabel = item.parentTopic ? String(item.parentTopic.label || "") : "", kinkId = null != item.child.id ? item.child.id : null, key = "child|" + branch + "|" + subLabel + "|" + String(null != item.child.id ? item.child.id : item.label || "");
            } else if (item && item.topic) {
                branch = String(item.branchName || ""), item.topic.isSubcategory ? (subLabel = String(item.topic.label || ""), key = "subcat|" + branch + "|" + subLabel) : (kinkId = null != item.topic.id ? item.topic.id : null, key = "topic|" + branch + "|" + String(null != item.topic.id ? item.topic.id : item.topic.label || ""));
            }
            const fit = dkFitTargetFor(key), fitTarget = null == fit ? NaN : Number(fit.target), parts = [ key, "bo=" + dkSigLen(mn.branchOverrides, branch), "so=" + (null != subLabel ? dkSigLen(mn.subcatOverrides, subLabel) : "-"), "ko=" + (null != kinkId ? dkSigLen(mn.kinkOverrides, kinkId) : "-"), "bsa=" + dkSigArm(mn.branchSpokeAutoShrink, branch), "ssa=" + (null != subLabel ? dkSigArm(mn.subcatSpokeAutoShrink, subLabel) : "-"), "cm=" + (null != mn.collision ? String(mn.collision) : "-"), "sl=" + dkSigNum(mn.spokeLen), "ul=" + dkSigNum(mn.subLen), "pd=" + dkSigNum(mn.pad), "rp=" + dkSigNum(mn.repulsion), "fs=" + dkSigNum(Number(mn.fontScale) || 1), "cs=" + dkSigNum(Number(mn.centerRingScale) || 1), Number.isFinite(fitTarget) ? "fit=" + dkSigNum(fitTarget) + "@" + dkSigNum(fit.revision) : "fit=-" ];
            return {
                key: key,
                sig: parts.join("|"),
                fit: Number.isFinite(fitTarget) ? fitTarget : null
            };
        }
        // Fit-target derivation (E4): a target is a MEASURED length —
        // the item's own label measured at its actual render font, plus
        // hub clearance and control/icon allowances, reusing the same
        // measurement primitives the solver already trusts (Za.measure
        // and the allowances inside rr.topicElementRadius). There is
        // deliberately no fixed shrink factor: every allowance is a
        // rendered length at the live font scale (mapFontScale), so a
        // target derived at fontScale 2 is twice the target derived at
        // fontScale 1 for the same item among the same siblings.
        function dkFitElementRadius(label, isSubcat, isChild) {
            const fs = mapFontScale(), iconR = sxIconRadius(isSubcat ? 2 : isChild ? 3 : 2), padRep = (Number(mn.pad) || 0) * (Number(mn.repulsion) || 0) * (mn.repulsionEnabled === !1 ? 0 : 1);
            let labelW = 0;
            try {
                labelW = Za.measure(label || "", isChild && !isSubcat ? sxFontCoef(3) : sxFontCoef(2));
            } catch (e) { __sxErrLog("layout-measure", e); }
            return Math.max(iconR + rr.ELEMENT_CLEARANCE * padRep * fs, iconR + rr.CONTROL_STATION * fs, labelW * fs / 2 + 34 * padRep * fs);
        }
        // The target for one item: far enough from its hub that its own
        // element clears the hub icon, and far enough out that its
        // element exactly meets each angular neighbor's element at the
        // sibling pitch the most recent solve delivered (the tighter
        // neighbor governs). Siblings carry { label, isSubcat, angle }.
        function dkFitComputeTarget(label, isSubcat, isChild, sibs, selfIdx) {
            const E = dkFitElementRadius(label, isSubcat, isChild), hubR = sxIconRadius(isChild ? 2 : 1);
            let target = hubR + E;
            const order = sibs.map((s, i) => i).sort((a, b) => sibs[a].angle - sibs[b].angle), pos = order.indexOf(selfIdx);
            return [ pos - 1, pos + 1 ].forEach(p => {
                if (p < 0 || p >= order.length) return;
                const nb = sibs[order[p]];
                let d = Math.abs(Math.atan2(Math.sin(nb.angle - sibs[selfIdx].angle), Math.cos(nb.angle - sibs[selfIdx].angle)));
                if (d < 1e-6 || d >= Math.PI) return;
                const need = (E + dkFitElementRadius(nb.label, nb.isSubcat, isChild && !nb.isSubcat)) / (2 * Math.sin(d / 2));
                Number.isFinite(need) && need > target && (target = need);
            }), Number.isFinite(target) && target > 0 ? target : null;
        }
        function dkFitFindRendered(key) {
            if (!dkLastBranches) return null;
            for (const b of dkLastBranches) {
                const topics = b.topics || [];
                for (const t of topics) {
                    if (dkRadialBaseInfo(t).key === key) return { wrapper: t, siblings: topics, isChild: !1 };
                    if (t.topic && t.topic.isSubcategory && t.children) for (const c of t.children) if (dkRadialBaseInfo(c).key === key) return { wrapper: c, siblings: t.children, isChild: !0 };
                }
            }
            return null;
        }
        // The currently rendered items of one branch — gen-2 topics,
        // subcategory nodes, and subcategory children — as wrappers
        // from the most recent solve.
        function dkFitBranchItems(branchName) {
            const out = [];
            if (!dkLastBranches) return out;
            const sector = dkLastBranches.find(b => b.entry && b.entry.branch && b.entry.branch.name === branchName);
            if (!sector) return out;
            return (sector.topics || []).forEach(t => {
                out.push(t), t.topic && t.topic.isSubcategory && (t.children || []).forEach(c => out.push(c));
            }), out;
        }
        function dkComputeFitTarget(key) {
            const rendered = dkFitFindRendered(key);
            let label = null, isSubcat = !1, isChild = !1, sibs = null, selfIdx = -1;
            if (rendered) {
                const w = rendered.wrapper;
                rendered.isChild ? (label = w.child ? w.child.label : w.label, isChild = !0) : (label = w.topic ? w.topic.label : w.label, isSubcat = !!(w.topic && w.topic.isSubcategory)), sibs = rendered.siblings.map(s => ({
                    label: s.topic ? s.topic.label : s.child ? s.child.label : s.label,
                    isSubcat: !!(s.topic && s.topic.isSubcategory),
                    angle: Number(s.cloudAngle) || 0
                })), selfIdx = rendered.siblings.indexOf(w);
            } else {
                const parts = String(key || "").split("|"), branch = h.find(b => b.name === parts[1]);
                if (!branch) return null;
                if ("topic" === parts[0] || "subcat" === parts[0]) {
                    const gen2 = branch.subcategories && branch.subcategories.length ? (branch.parentTopics || []).map(l => ({ label: l, isSubcat: !1 })).concat(branch.subcategories.map(s => ({ label: s.name, isSubcat: !0 }))) : (branch.topics || []).map(l => ({ label: l, isSubcat: !1 }));
                    "subcat" === parts[0] ? (label = parts[2], isSubcat = !0, selfIdx = gen2.findIndex(s => s.isSubcat && s.label === label)) : (label = topicLabelById[parts[2]] || null, selfIdx = gen2.findIndex(s => !s.isSubcat && s.label === label));
                    if (null == label || selfIdx < 0) return null;
                    const step = gen2.length ? er.spread / gen2.length : 0;
                    sibs = gen2.map((s, i) => ({ label: s.label, isSubcat: s.isSubcat, angle: i * step }));
                } else if ("child" === parts[0]) {
                    const sub = (branch.subcategories || []).find(s => s.name === parts[2]);
                    if (!sub) return null;
                    label = topicLabelById[parts[3]] || null, isChild = !0;
                    if (null == label) return null;
                    const labels = sub.topics || [];
                    if ((selfIdx = labels.indexOf(label)) < 0) return null;
                    const angles = rr.childFanAngles(0, labels.length, rr.stepForRadius(rr.cloudRadiusFor(labels.length)));
                    sibs = labels.map((l, i) => ({ label: l, isSubcat: !1, angle: Number(angles[i]) || 0 }));
                } else return null;
            }
            return null == label || !sibs || selfIdx < 0 ? null : dkFitComputeTarget(label, isSubcat, isChild, sibs, selfIdx);
        }
        // Refresh one item's delivered cloudRadius in the base-state
        // registry at solve end (E4). Only identities the resolver has
        // already captured gain a delivered field, so baseState()'s
        // unknown-key behavior is unchanged.
        // NAME-LENGTH FIT TARGET (ruled 2026-11-01 01:44, Jason):
        // a subcategory's shrink floor is the length of its own
        // name — hub clearance plus its own label's element
        // radius, with NO neighbour-pitch term. dkFitComputeTarget
        // takes the max of this base and each neighbour's pitch
        // need, so in a crowded fan the neighbour term can sit at
        // or above the thrown radius, and a ladder floored there
        // holds at the thrown length without ever attempting a
        // step down (the long unshrunk subcategory branches of
        // the 2026-11-01 inspection). The name target is that
        // computation's base component alone: the item's own fit
        // length, reachable from the thrown length.
        function dkNameFitTarget(label, isSubcat, isChild) {
            if (null == label) return null;
            const E = dkFitElementRadius(label, isSubcat, isChild), hubR = sxIconRadius(isChild ? 2 : 1), target = hubR + E;
            return Number.isFinite(target) && target > 0 ? target : null;
        }
        function dkNameFitTargetForKey(key) {
            const rendered = dkFitFindRendered(key);
            if (rendered) {
                const w = rendered.wrapper;
                return rendered.isChild ? dkNameFitTarget(w.child ? w.child.label : w.label, !1, !0) : dkNameFitTarget(w.topic ? w.topic.label : w.label, !!(w.topic && w.topic.isSubcategory), !1);
            }
            const parts = String(key || "").split("|");
            if ("subcat" === parts[0]) return dkNameFitTarget(parts[2], !0, !1);
            if ("topic" === parts[0]) return dkNameFitTarget(topicLabelById[parts[2]] || null, !1, !1);
            if ("child" === parts[0]) return dkNameFitTarget(topicLabelById[parts[3]] || null, !1, !0);
            return null;
        }
        function dkRecordDelivered(item) {
            if (!item || !Number.isFinite(item.cloudRadius)) return;
            const key = dkRadialBaseInfo(item).key, prev = dkBaseStates.get(key);
            prev && dkBaseStates.set(key, {
                base: prev.base,
                sig: prev.sig,
                delivered: item.cloudRadius
            });
        }
        // Scoped-solve capture (Stage 3, T2): snapshot everything the
        // freeze replay needs for the frozen branches, taken from the
        // last solved tree (dkLastBranches — the delivered truth the
        // bundle retains) BEFORE the patch is applied. Per frozen
        // branch: the sector's angle / topicCloudRadius /
        // topicCloudRadiusBase, the taxonomy branch's _spokeAdjust20,
        // and per rendered node — keyed by the node's data-layout-key
        // (branch catId, topic id, child id) — the wrapper fields the
        // paint path derives its position from (cloudAngle /
        // cloudRadius / angle / cloudIndex / childCloudRadius), at
        // full internal precision. Plus every delivered-geometry
        // registry entry (dkBaseStates) belonging to a frozen branch's
        // items, for the post-solve registry merge.
        function scCaptureFrozen(frozen) {
            const cap = { branches: new Map, baseStates: new Map };
            (dkLastBranches || []).forEach(sec => {
                const bname = sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
                if (!bname || !frozen.has(bname) || cap.branches.has(bname)) return;
                const b = {
                    angle: sec.angle,
                    topicCloudRadius: sec.topicCloudRadius,
                    topicCloudRadiusBase: sec.topicCloudRadiusBase,
                    spokeAdjust: Number(sec.entry.branch._spokeAdjust20) || 0,
                    topics: new Map
                };
                (sec.topics || []).forEach(t => {
                    if (!t.topic || null == t.topic.id) return;
                    const tc = {
                        cloudAngle: t.cloudAngle,
                        cloudRadius: t.cloudRadius,
                        angle: t.angle,
                        cloudIndex: t.cloudIndex,
                        childCloudRadius: t.childCloudRadius,
                        children: new Map
                    };
                    (t.children || []).forEach(ch => {
                        if (!ch.child || null == ch.child.id) return;
                        tc.children.set(String(ch.child.id), {
                            cloudAngle: ch.cloudAngle,
                            cloudRadius: ch.cloudRadius,
                            angle: ch.angle,
                            childCloudRadius: ch.childCloudRadius
                        });
                    }), b.topics.set(String(t.topic.id), tc);
                }), cap.branches.set(bname, b);
            });
            return dkBaseStates.forEach((v, k) => {
                const seg = String(k).split("|");
                seg.length > 1 && frozen.has(seg[1]) && cap.baseStates.set(k, {
                    base: v.base,
                    sig: v.sig,
                    delivered: v.delivered
                });
            }), cap;
        }
        // Scoped-solve delivered centers (Stage 3, T2): the currently
        // rendered data-layout-x/y of every frozen branch's nodes,
        // read from the live DOM before the patch is applied, keyed
        // by data-layout-key (branch membership via the qn registry
        // the last paint built). The post-paint settle pass in Ar()
        // seats a frozen node at exactly this center (see the settle
        // search guard there): the solved-tree replay alone cannot
        // reproduce a delivered position the settle search itself
        // produced, because that search is a global, DOM-ordered
        // pass over rendered label/control geometry.
        function scCaptureDeliveredCenters(frozen, opts) {
            const centers = new Map;
            if (opts && opts.paintComposition) {
                // CORRECT-SOURCE CAPTURE (ruled 2026-11-01, per
                // CENTRE-CAPTURE-DIAGNOSIS.md): the Anneal closing
                // paint's centres, composed from the solve registry
                // (dkLastBranches — at this call the restored-kept
                // solve) with the PAINT'S OWN seating arithmetic.
                // Never the solver-model length (rr.renderedSpokeLength
                // inflates every spoke by the layout multipliers and
                // the collision factor the paint never applies) and
                // never the pre-run page centres. Hub: rr.branchAnchor
                // — centre + sector angle x yr(branch), the point Ar
                // seats the category icon at. Topic: the delivered
                // radius Ar finalizes at its draw site —
                // topicSpokeEstimate over (cloudRadius ||
                // topicCloudRadius), the subcategory hub floor via
                // hubSpokeLength, then exactly ONE length override
                // (subcatOverrides by label / kinkOverrides by id;
                // the composition dkDeliveredItemRadius mirrors) —
                // placed along cloudAngle; Ar routes that endpoint
                // through Ya, whose icon point is the endpoint
                // itself. Child: Ar's static-child composition —
                // (cloudRadius || parent childCloudRadius || 270) x
                // the child's kink multiplier, extended by Ar's
                // label-clearance loop — placed along cloudAngle
                // from the parent's composed centre. The per-item
                // fields consumed (registry cloudRadius / cloudAngle
                // and the override multiplier applied, with the
                // composed centre) ride on the returned map as
                // captureFields, for the DIAG-03 readout.
                const fields = new Map;
                try {
                    (dkLastBranches || []).forEach(sec => {
                        if (!sec || !sec.entry || !sec.entry.branch || !frozen.has(sec.entry.branch.name)) return;
                        const bname = sec.entry.branch.name, anchor = rr.branchAnchor(sec);
                        if (!anchor || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) return;
                        sec.entry.catId && centers.set(sec.entry.catId, {
                            x: anchor.x,
                            y: anchor.y
                        }), (sec.topics || []).forEach(t => {
                            if (!t || !t.topic || null == t.topic.id) return;
                            const label = t.topic.label || "", isSub = !!t.topic.isSubcategory, est = Za.topicSpokeEstimate(label, t.cloudRadius || sec.topicCloudRadius);
                            let h = est.spokeLength;
                            if (isSub) h = Math.max(h, pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96, sxSpokeBase(t.cloudCount)), h = Za.hubSpokeLength(label, est.fontSize, h, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                            const ov = isSub ? mn.subcatOverrides && mn.subcatOverrides[label] : mn.kinkOverrides && mn.kinkOverrides[t.topic.id], mul = ov && Number(ov.length) > 0 ? Number(ov.length) : 1;
                            h = h * mul;
                            const tp = {
                                x: anchor.x + Math.cos(t.cloudAngle) * h,
                                y: anchor.y + Math.sin(t.cloudAngle) * h
                            };
                            if (!Number.isFinite(tp.x) || !Number.isFinite(tp.y)) return;
                            centers.set(t.topic.id, tp), fields.set(String(t.topic.id), {
                                kind: isSub ? "subcat" : "topic",
                                branch: bname,
                                label: label,
                                cloudRadius: null == t.cloudRadius ? null : Number(t.cloudRadius),
                                cloudAngle: null == t.cloudAngle ? null : Number(t.cloudAngle),
                                override: mul,
                                radius: Math.round(100 * h) / 100,
                                centre: {
                                    x: Math.round(100 * tp.x) / 100,
                                    y: Math.round(100 * tp.y) / 100
                                }
                            }), (t.children || []).forEach(ch => {
                                if (!ch || !ch.child || null == ch.child.id || !ch.child.isStaticTopic) return;
                                const ko = mn.kinkOverrides && mn.kinkOverrides[ch.child.id], kmul = ko && Number(ko.length) > 0 ? Number(ko.length) : 1;
                                let r = (ch.cloudRadius || t.childCloudRadius || 270) * kmul;
                                r = sxLabelClearance(r, ch.child.label);
                                const cp = {
                                    x: tp.x + Math.cos(ch.cloudAngle) * r,
                                    y: tp.y + Math.sin(ch.cloudAngle) * r
                                };
                                if (!Number.isFinite(cp.x) || !Number.isFinite(cp.y)) return;
                                centers.set(ch.child.id, cp), fields.set(String(ch.child.id), {
                                    kind: "child",
                                    branch: bname,
                                    label: ch.child.label || "",
                                    cloudRadius: null == ch.cloudRadius ? null : Number(ch.cloudRadius),
                                    cloudAngle: null == ch.cloudAngle ? null : Number(ch.cloudAngle),
                                    override: kmul,
                                    radius: Math.round(100 * r) / 100,
                                    centre: {
                                        x: Math.round(100 * cp.x) / 100,
                                        y: Math.round(100 * cp.y) / 100
                                    }
                                });
                            });
                        });
                    });
                } catch (_) { __sxErrLog("layout-scoped-centers", _); }
                return centers.captureFields = fields, centers;
            }
            if (dkCtx) {
                // Interim (capsule-only paint, 2026-10-31): while an
                // Anneal run is live the full map is not repainted, so
                // frozen centres are taken from the solve registry
                // (dkLastBranches) in the solver's own position model
                // — rr.branchAnchor for the category node,
                // rr.topicPosition for topics, hub + cloudAngle /
                // cloudRadius for children (the arithmetic
                // rr._lineEndpoint uses) — never from the last full
                // paint's DOM positions.
                try {
                    (dkLastBranches || []).forEach(sec => {
                        if (!sec || !sec.entry || !sec.entry.branch || !frozen.has(sec.entry.branch.name)) return;
                        const anchor = rr.branchAnchor(sec);
                        anchor && Number.isFinite(anchor.x) && Number.isFinite(anchor.y) && sec.entry.catId && centers.set(sec.entry.catId, {
                            x: anchor.x,
                            y: anchor.y
                        }), (sec.topics || []).forEach(t => {
                            if (!t || !t.topic) return;
                            const tp = rr.topicPosition(sec, t, anchor);
                            tp && Number.isFinite(tp.x) && Number.isFinite(tp.y) && centers.set(t.topic.id, {
                                x: tp.x,
                                y: tp.y
                            }), (t.children || []).forEach(ch => {
                                if (!ch || !ch.child) return;
                                const cr = ch.cloudRadius || 0;
                                centers.set(ch.child.id, {
                                    x: tp.x + Math.cos(ch.cloudAngle) * cr,
                                    y: tp.y + Math.sin(ch.cloudAngle) * cr
                                });
                            });
                        });
                    });
                } catch (_) { __sxErrLog("layout-scoped-centers", _); }
                return centers;
            }
            try {
                In.querySelectorAll("[data-layout-key]").forEach(el => {
                    const key = el.dataset.layoutKey, info = qn[key];
                    info && info.branch && frozen.has(info.branch) && centers.set(key, {
                        x: Number(el.dataset.layoutX),
                        y: Number(el.dataset.layoutY)
                    });
                });
            } catch (_) { __sxErrLog("layout-scoped-centers", _); }
            return centers;
        }
        // Scoped-solve ring-auto (Stage 3, T5): the declared ring
        // for a target set, computed from PRE-OP delivered geometry
        // only — the branch centres the last paint delivered (the
        // category nodes' data-layout-x/y, the same delivered
        // centres scCaptureDeliveredCenters reads) — following the
        // §2.3 formula the T4 containment matrix was proved
        // RETIRED (ruled 2026-11-01 01:52, Jason): no live caller
        // remains — applyScoped no longer computes or honours a
        // ring (see the commented-out ring lines there). Kept in
        // the code, not deleted, per the comment-out rule.
        // against: ring(B) = {angular neighbours of B, branches in
        // centre-angle order around the map centre (900, 620)}
        // ∪ {branches whose nearest other centre is B} ∪ {the
        // branch that is B's own nearest other centre}; for a
        // multi-branch target the ring is the union over targets,
        // minus the targets themselves. Called by applyScoped
        // before the patch applies, only when the caller omitted
        // scope.ring; an explicit ring is never recomputed.
        // RING COMPUTATION COMMENTED OUT (ruled 2026-11-01 01:53,
        // Jason: "throw out" = comment out, never delete): the
        // whole auto-ring computation — angular neighbours,
        // nearest-neighbour, reverse-nearest — stands below as
        // comment, with its call site in applyScoped. Nothing in
        // the live code calls it.
        // function scComputeAutoRing(targetSet, names) {
//             const ring = new Set;
//             try {
//                 const centers = new Map;
//                 if (dkCtx) {
//                     // Interim (capsule-only paint, 2026-10-31): while
//                     // an Anneal run is live the full map is not
//                     // repainted, so category centres come from the
//                     // solve registry (dkLastBranches) through the
//                     // solver's own anchor arithmetic.
//                     // rr.branchAnchor(sector) is exactly the point
//                     // the paint writes as the category node's
//                     // data-layout-x/y (Xa(angle, yr(branch)) in the
//                     // draw loop), and category nodes are never moved
//                     // by the settle search, so these are the same
//                     // values the DOM read returned — taken from the
//                     // approximation instead of the last full paint.
//                     (dkLastBranches || []).forEach(sec => {
//                         if (!sec || !sec.entry || !sec.entry.branch) return;
//                         const bn = sec.entry.branch.name;
//                         if (centers.has(bn)) return;
//                         const a = rr.branchAnchor(sec);
//                         a && Number.isFinite(a.x) && Number.isFinite(a.y) && centers.set(bn, {
//                             x: a.x,
//                             y: a.y
//                         });
//                     });
//                 } else In.querySelectorAll("[data-layout-key]").forEach(el => {
//                     const info = qn[el.dataset.layoutKey];
//                     if (info && "Category" === info.kind && info.branch && !centers.has(info.branch)) {
//                         const x = Number(el.dataset.layoutX), y = Number(el.dataset.layoutY);
//                         Number.isFinite(x) && Number.isFinite(y) && centers.set(info.branch, {
//                             x: x,
//                             y: y
//                         });
//                     }
//                 });
//                 const ordered = names.filter(n => centers.has(n)).sort((a, b) => Math.atan2(centers.get(a).y - 620, centers.get(a).x - 900) - Math.atan2(centers.get(b).y - 620, centers.get(b).x - 900)), nearest = new Map;
//                 centers.forEach((c, X) => {
//                     let best = null, bestD = Infinity;
//                     centers.forEach((o, Y) => {
//                         if (Y === X) return;
//                         const d = (o.x - c.x) * (o.x - c.x) + (o.y - c.y) * (o.y - c.y);
//                         d < bestD && (bestD = d, best = Y);
//                     }), null !== best && nearest.set(X, best);
//                 }), targetSet.forEach(B => {
//                     const i = ordered.indexOf(B);
//                     if (i >= 0 && ordered.length > 2) ring.add(ordered[(i + ordered.length - 1) % ordered.length]), ring.add(ordered[(i + 1) % ordered.length]);
//                     const n = nearest.get(B);
//                     n && ring.add(n);
//                 }), nearest.forEach((n, X) => {
//                     targetSet.has(n) && ring.add(X);
//                 });
//             } catch (_) { __sxErrLog("layout-scoped-ring", _); }
//             return targetSet.forEach(B => ring.delete(B)), Array.from(ring);
//         }
        // Scoped-solve freeze replay (Stage 3, T2): run inside fr() at
        // solve completion, after the delivered-registry refresh,
        // before paint reads the tree. Restores every frozen branch's
        // solved geometry and _spokeAdjust20 verbatim from the capture,
        // so the paint path re-derives the frozen nodes'
        // data-layout-x/y strings identically to the pre-op render;
        // then merges the delivered-geometry registry — entries for
        // recompute-set items keep this solve's refresh, entries for
        // frozen items are retained from the pre-solve snapshot
        // (frozen entries the solve created are dropped, frozen
        // entries it overwrote or resolved away are put back). Every
        // frozen branch's replay is recorded in the context's
        // boundaryLog.
        function scRestoreFrozen(sectors, ctx) {
            const cap = ctx.capture;
            if (!cap) return;
            sectors.forEach(sec => {
                const bname = sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
                if (!bname || !ctx.frozenBranches.has(bname)) return;
                const b = cap.branches.get(bname);
                if (!b) return void ctx.boundaryLog.push({
                    type: "freeze-miss",
                    branch: bname
                });
                sec.angle = b.angle, sec.topicCloudRadius = b.topicCloudRadius, sec.topicCloudRadiusBase = b.topicCloudRadiusBase, sec.entry.branch._spokeAdjust20 = b.spokeAdjust;
                let nodes = 1;
                (sec.topics || []).forEach(t => {
                    if (!t.topic || null == t.topic.id) return;
                    const tc = b.topics.get(String(t.topic.id));
                    if (!tc) return;
                    t.cloudAngle = tc.cloudAngle, t.cloudRadius = tc.cloudRadius, t.angle = tc.angle, t.cloudIndex = tc.cloudIndex, t.childCloudRadius = tc.childCloudRadius, nodes++;
                    (t.children || []).forEach(ch => {
                        if (!ch.child || null == ch.child.id) return;
                        const cc = tc.children.get(String(ch.child.id));
                        cc && (ch.cloudAngle = cc.cloudAngle, ch.cloudRadius = cc.cloudRadius, ch.angle = cc.angle, ch.childCloudRadius = cc.childCloudRadius, nodes++);
                    });
                }), ctx.boundaryLog.push({
                    type: "freeze-replay",
                    branch: bname,
                    nodes: nodes,
                    spokeAdjust: b.spokeAdjust
                });
            });
            const drop = [];
            dkBaseStates.forEach((v, k) => {
                const seg = String(k).split("|");
                seg.length > 1 && ctx.frozenBranches.has(seg[1]) && !cap.baseStates.has(k) && drop.push(k);
            }), drop.forEach(k => dkBaseStates.delete(k)), cap.baseStates.forEach((v, k) => {
                dkBaseStates.set(k, {
                    base: v.base,
                    sig: v.sig,
                    delivered: v.delivered
                });
            });
        }
        // DeKnotter cascade driver (E5, ASSESSMENT §3.4, §3.7, §5.6,
        // §5.8, §5.11): one full run for one branch, driven entirely
        // through the bundle layout API — never the editor shell's
        // collect()/apply — so no intermediate state is broadcast to
        // other windows mid-run. Sequence: subcategory-label check →
        // precondition staging → snapshot + double baseline → throw
        // (branch x50, subcategories x20, kinks autofit to
        // three times their kink (fit) length — full cascade
        // armed, ONE applyPhase commit) →
        // FINE-TUNE (ruled 2026-10-29): when the
        // cascade baseline (measured twice, above) is strictly below
        // 5, zero included, the throw is SKIPPED — a staging-and-
        // arming commit lands the throw's staged values and full
        // arming minus its length changes, the shrink ladders run
        // from the branch's current lengths under the per-phase
        // gate only (flat GATE_TOL 2; the fine-tune margin and the
        // onset margin were deleted Phase 4, 2026-11-04 — the
        // skip-throw under 5 is unchanged), and the branch ladder
        // descends to a
        // label-fit floor instead of stopping at the pre-run length
        // → ruled shrink sequence (Jason,
        // 2026-10-24 adjustment: subcategory nodes first, then the
        // branch itself, each level descending a square-root-step ladder of
        // committed sub-solves toward its label-fit floor under the
        // per-phase gate (flat 2) — a level's ladder halts when that
        // gate trips, and the cascade proceeds to the
        // next level; there is NO kink shrink stage in the cascade —
        // kinks keep their thrown autofit room (3x the kink
        // length, 2026-11-01); the kink shrink to
        // label length is a separate one-time driver normalization,
        // deknotter.shrinkKinksToLabel) → scoped same-branch GROWTH
        // (ruled 2026-10-28: grow-branch then grow-subcats ratio
        // patches, dominance-gated, laddered at 1.25x steps to a 3x
        // cumulative target — see stepGrowth in dkRunCascade) → a
        // CONSTRUCTED final patch (§3.7: arm maps and staged values
        // back to their exact pre-run values, the onset-held length
        // overrides carried into per-item length overrides exactly
        // as they stand after the ladders, fit registrations
        // cleared) → the
        // E2 gate on the branch's own-cloud crossing number (Q4:
        // repointed from the local xAreaCross area, which is now
        // reported secondary only), exact-float improve-or-hold.
        // Q2 adds a per-phase gate on the same record.cloud
        // readout; its trip consequence is back-up-a-step (ruled
        // 2026-10-28, all phases): the tripping step is discarded,
        // the last-kept phase snapshot is restored, that level's
        // ladder stops, and the cascade continues — only the final
        // gate still reverts a whole run. Any other failure or
        // exception restores the
        // pre-run snapshot through restore() and verifies the restore
        // canonically; every exit path ends the run context and
        // leaves the branch's fit registry empty.
        function dkMedian(values) {
            if (!values.length) return null;
            const sorted = values.slice().sort((a, b) => a - b), mid = sorted.length >> 1;
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }
        function dkRange(values) {
            return values.length ? [ Math.min.apply(null, values), Math.max.apply(null, values) ] : null;
        }
        // Q2 staged shrink ladder (Phase Q2): the cascade's fit
        // movement descends in small steps, never in one chop from a
        // thrown radius to the label-fit floor. SHRINK STEP (ruled
        // 2026-11-02, Jason — supersedes the 2026-11-01 uniform
        // 10%-of-current step): the steps are UNEQUAL, large at
        // first then small toward the end, with each step's size in
        // proportion to the SQUARE ROOT of the steps remaining at
        // that step (the first step is weighted sqrt(N), the next
        // sqrt(N-1), …, the last sqrt(1)). The step count is FIXED
        // at DK_SHRINK_STEPS_FIXED = 7 for every descent, so the
        // largest step is sqrt(7) ≈ 2.65 times the smallest and the
        // final stage lands exactly on the floor: a 100 → 30 descent
        // drops about 14, 13, 12, 10, 9, 7, 5. Logarithmic steps
        // were considered and REJECTED in the same ruling — no
        // logarithmic option exists here. This one computation is
        // shared by the subcategory ladder and the branch ladder,
        // on the normal (throw) path and on the skip-throw-under-5
        // path alike. An item already at or below its floor never
        // grows — it holds.
        const DK_SHRINK_STEPS_FIXED = 7, DK_LADDER_MAX_STAGES = 512;
        function dkLadderSteps(from, to) {
            if (!Number.isFinite(from) || !Number.isFinite(to) || !(from > to) || !(to > 0)) return 0;
            return DK_SHRINK_STEPS_FIXED;
        }
        function dkLadderValue(from, to, stage, stages) {
            if (!Number.isFinite(from) || !Number.isFinite(to) || !(from > to)) return from;
            const n = Number.isFinite(stages) && stages > 0 ? Math.floor(stages) : DK_SHRINK_STEPS_FIXED, s = Number.isFinite(stage) ? Math.floor(stage) : 0;
            if (s <= 0) return from;
            if (s >= n) return to;
            let total = 0, cum = 0;
            for (let r = 1; r <= n; r++) total += Math.sqrt(r);
            for (let i = 0; i < s; i++) cum += Math.sqrt(n - i);
            return from - (from - to) * (cum / total);
        }
        // Q2: one phase record's fit-deviation count, out of its
        // limiter-hit slice — surfaced per phase and totalled into
        // the run report so the receipt lead can carry it.
        function dkFitDeviationCount(entries) {
            let n = 0;
            return (entries || []).forEach(e => {
                e && "fit-deviation" === e.type && n++;
            }), n;
        }
        // One rendered item's delivered radius: the distance from its
        // hub at which the draw path places the item, recomputed with
        // the draw path's own arithmetic (topicSpokeEstimate,
        // subcategory hub floors via hubSpokeLength, per-item
        // length-override multipliers; children ride Ar's drawn
        // radius — solved radius times their kink multiplier,
        // extended by Ar's label-clearance loop, as Ar paints it).
        // A phase's
        // delivered ratio is post-phase delivered ÷ pre-run delivered
        // on this same measure.
        function dkDeliveredItemRadius(item) {
            if (!item) return NaN;
            if (item.child) {
                const ko = mn.kinkOverrides && item.child.id ? mn.kinkOverrides[item.child.id] : null;
                // ONE GEOMETRY SOURCE (divergence fix, 2026-11-02):
                // the delivered radius of a static child is the
                // radius Ar's paint actually draws — the solved
                // radius (with the parent's childCloudRadius
                // fallback Ar uses) times the kink multiplier,
                // extended by Ar's label-clearance loop when the
                // spoke is too short for its label. This reading
                // used the unextended solved radius, so the
                // ladders and receipts stepped on lengths the
                // paint never drew.
                let r = (Number(item.cloudRadius) || Number(item.childCloudRadius) || 270) * (ko && Number(ko.length) > 0 ? Number(ko.length) : 1);
                r = sxLabelClearance(r, item.child.label);
                return r;
            }
            const t = item.topic;
            if (!t) return NaN;
            const est = Za.topicSpokeEstimate(t.label || "", Number(item.cloudRadius) || 0);
            let h = est.spokeLength;
            if (t.isSubcategory) {
                h = Math.max(h, pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96, sxSpokeBase(item.cloudCount)), h = Za.hubSpokeLength(t.label || "", est.fontSize, h, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                const so = mn.subcatOverrides && mn.subcatOverrides[t.label];
                return h * (so && Number(so.length) > 0 ? Number(so.length) : 1);
            }
            const ko = mn.kinkOverrides && t.id ? mn.kinkOverrides[t.id] : null;
            return h * (ko && Number(ko.length) > 0 ? Number(ko.length) : 1);
        }
        // Delivered radii for every currently rendered item of one
        // branch, keyed by stable identity, plus the branch's own
        // delivered spoke radius (yr() on the taxonomy branch object,
        // whose _spokeAdjust20 the last solve left in place).
        function dkDeliveredRadii(branchName) {
            const items = {};
            dkFitBranchItems(branchName).forEach(w => {
                items[dkRadialBaseInfo(w).key] = dkDeliveredItemRadius(w);
            });
            const branchObj = h.find(b => b.name === branchName);
            return { items: items, branch: branchObj ? yr(branchObj) : NaN };
        }
        // Taxonomy facts for one branch: its subcategory labels, the
        // topic IDs of every kink in it (gen-2 topics and subcategory
        // children alike — entry.topics is the full union), and the
        // total item count (topics + subcategory hubs) that the
        // coverage record compares the rendered/acted-on count to.
        function dkBranchTaxonomy(branchName) {
            const entry = h.find(b => b.name === branchName);
            if (!entry) return null;
            const subLabels = (entry.subcategories || []).map(s => s.name), kinkIds = [];
            return (entry.topics || []).forEach(l => {
                const id = topicIdByLabel[sxName(l)] || (l && l.id);
                null != id && kinkIds.push(id);
            }), { entry: entry, subLabels: subLabels, kinkIds: kinkIds, total: (entry.topics || []).length + subLabels.length };
        }
        // SOLVER-METRICS REFACTOR (F4): dkRunCascade is a thin
        // orchestrator over named phase steps — stepLabelCheck,
        // stepPreconditions, stepBaseline, the shared phase runner
        // (runPhase), stepThrow, stepOnsetSetup, stepShrinkLadders,
        // stepGrowth, stepFinalPatch, then the final gate in the orchestrator.
        // Each step closes over the shared run state (report above
        // all) and returns its piece; the phase order and the
        // phase-boundary yields inside runPhase are unchanged, so
        // the busy readout still paints between phases.
        function dkBakeGate(report) {
            try {
                const sumNb = o => o ? Object.keys(o).reduce((a, k) => a + (Number(o[k]) || 0), 0) : 0;
                const bkBase = (Number(report.baseline.first) || 0) + sumNb(report.neighbors.baseline), bkFin = (Number(report.finalCloud) || 0) + sumNb(report.neighbors.final);
                report.bakeGate = { metric: "crossingnumber-total", baseline: bkBase, final: bkFin, delta: bkFin - bkBase, limit: SX_SCORE.BAKE_GATE_LIMIT, pass: bkFin - bkBase < SX_SCORE.BAKE_GATE_LIMIT };
            } catch (e) { report.bakeGate = null; }
        }
        function tallyFitDev(report) {
            return report.phases.reduce((s, p) => s + (p && p.fitDeviationCount || 0), 0);
        }
        function clearBranchFit(dk, name) {
            Object.keys(dk.fitTargets()).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && dk.clearFitTarget(k);
            });
        }
        function diagRound(v) {
            return null == v || !Number.isFinite(Number(v)) ? null : Math.round(100 * Number(v)) / 100;
        }
        function diagCameraText(cam, label) {
            return label + ": scale " + (cam && null != cam.scale ? cam.scale : "\u2014") + " \u00b7 translate " + (cam && null != cam.tx ? cam.tx : "\u2014") + ", " + (cam && null != cam.ty ? cam.ty : "\u2014");
        }
        function yieldNow() {
            return new Promise(r => { let done = false; const fin = () => { if (!done) { done = true; r(); } }; requestAnimationFrame(() => requestAnimationFrame(fin)); setTimeout(fin, 60); });
        }
        let lastKeptSnapshot;
        function captureKept(dk, refreshKeptFit, name) {
            lastKeptSnapshot = dk.snapshot(), refreshKeptFit(dk, name);
        }
        let witnessFrameSeq;
        let witnessLastFrame;
        function witnessFrame(event, phase, radii, witnessSubs, name, report, dk) {
            const frame = { i: witnessFrameSeq++, event: event, phase: phase || null, subs: witnessSubs(radii || dkDeliveredRadii(name), dk) };
            return witnessLastFrame = frame, report.witness.frames.length < 600 && report.witness.frames.push(frame), dkLog.push({ type: "witness-frame", event: event, phase: frame.phase, subs: frame.subs }), frame;
        }
        function witnessRestore(event, phase, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP) {
            const before = witnessLastFrame, after = witnessFrame(event, phase, null, witnessSubs, name, report, dk);
            return witnessJudge(event, phase, witnessTrippingLabel, before, after, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report);
        }
        let lastKeptFit;
        function refreshKeptFit(dk, name) {
            const fit = {}, all = dk.fitTargets();
            Object.keys(all).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && (fit[k] = all[k]);
            }), lastKeptFit = fit;
        }
        function witnessSubs(radii, dk) {
            const subs = {}, snap = dk.snapshot(), ov = snap && snap.subcatOverrides ? snap.subcatOverrides : {};
            return Object.keys(radii && radii.items || {}).forEach(k => {
                if ("subcat" !== k.split("|")[0]) return;
                const label = k.split("|")[2], d = radii.items[k];
                subs[label] = { d: Number.isFinite(d) ? Math.round(d * 1e4) / 1e4 : null, o: ov[label] && Number(ov[label].length) > 0 ? Number(ov[label].length) : null };
            }), subs;
        }
        function witnessPaintedFrame(stage, operation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg) {
            try {
                const g = dkPaintedGeometry(stage, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                g.operation = operation || null;
                dkLog.push({ type: "witness-painted-frame", stage: stage, operation: g.operation, source: g.source, blitActive: g.blitActive, subs: g.subs });
                return g;
            } catch (e) { return null; }
        }
        function diagClosingLines(snap) {
            if (!snap.closingPaint) return [];
            const cp = snap.closingPaint, lines = [ "closing-paint mode: " + cp.mode ];
            lines.push(cp.scopedPaint ? "closing-paint scoped-paint: retained " + cp.scopedPaint.retained + " / captured " + cp.scopedPaint.captured + " / diverged " + cp.scopedPaint.diverged : "closing-paint scoped-paint: no entry");
            lines.push("closing-paint segment-timing: " + (cp.segmentTiming ? "present" : "absent"));
            lines.push(diagCameraText(snap.camera, "camera at DIAG-03"));
            return lines;
        }
        async function diagPause(code, label, extra, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields) {
            if (!diagAcceptCtx || !opts || "function" != typeof opts.onDiagPause) return;
            const snap = diagSnapshot(code, label, extra, name, tax, diagAcceptCtx, diagCaptureFields);
            (report.diag || (report.diag = [])).push(snap);
            dkLog.push({ type: "anneal-diag", code: code, phase: snap.phase, branch: name, text: snap.text });
            try { console.log("[" + code + "] " + snap.text, snap); } catch (e) {}
            try { await opts.onDiagPause(snap); } catch (e) {}
        }
        let throwBracketBefore;
        async function throwBracketPoint(code, throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report) {
            const stamp = code + ":first-throw";
            const label = "THROW-BEFORE" === code ? "pre-throw full paint \u2192 stepThrow" : "stepThrow \u2192 post-throw full paint";
            const paintInfo = await throwBracketFullPaint(stamp, name, dkPaintedNodeCentre, tax);
            const snap = throwBracketSnapshot(code, label, stamp, paintInfo, name, tax, report);
            if ("THROW-BEFORE" === code) throwBracketBefore = snap;
            if (opts && "function" == typeof opts.onThrowBracketPause) { try { await opts.onThrowBracketPause(snap); } catch (e) {} }
            return snap;
        }
        let mark;
        async function stepFineTuneArm(snapshot, staged, name, tax, runPhase, report, opts, dk, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            mark = dkLog.length;
            const armPatch = dkDeepCloneLayout(snapshot);
            staged.forEach(s => {
                armPatch[s.key] = s.to;
            }), armPatch.branchSpokeAutoShrink[name] = !0, tax.subLabels.forEach(l => {
                armPatch.subcatSpokeAutoShrink[l] = !0;
            }), await runPhase("fine-tune-arm", armPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP), report.fineTune.armPhase = "fine-tune-arm";
            }
        function diagText(snap) {
            const f = v => null == v ? "\u2014" : String(v);
            let t = snap.code + " \u00b7 " + snap.label + " \u00b7 branch " + snap.branch + " \u00b7 phase " + f(snap.phase) + " \u00b7 crossing last-kept " + f(diagRound(snap.crossingBefore)) + " \u2192 tripped " + f(diagRound(snap.crossingAfter)) + " \u00b7 branch delivered radius " + f(snap.storedBranchRadius);
            Object.keys(snap.paintedSubs).forEach(l => { const ps = snap.paintedSubs[l]; t += " \u00b7 " + l + ": seg " + f(ps.seg) + " / abs " + f(ps.absR) + " (stored " + f(snap.storedSubs[l]) + ")"; });
            t += " \u00b7 viewBox " + f(snap.view.viewBox) + " \u00b7 transform " + f(snap.view.sceneTransform || snap.view.transform) + " \u00b7 bbox " + (snap.view.bbox ? snap.view.bbox.x + "," + snap.view.bbox.y + " " + snap.view.bbox.width + "\u00d7" + snap.view.bbox.height : "\u2014") + " \u00b7 " + snap.atChicago + " America/Chicago";
            if (snap.closingLines && snap.closingLines.length) t += "\n" + snap.closingLines.join("\n");
            if (snap.captureLines && snap.captureLines.length) t += "\n" + snap.captureLines.join("\n");
            if (snap.hubLines && snap.hubLines.length) t += "\n" + snap.hubLines.join("\n");
            return t;
        }
        function witnessFinalJudge(transition, beforeFrame, afterFrame, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) {
            if (!beforeFrame || !afterFrame) return null;
            const flung = [];
            Object.keys(afterFrame.subs).forEach(label => {
                const b = beforeFrame.subs[label], a = afterFrame.subs[label], t = witnessThrown ? witnessThrown[label] : null;
                if (!b || !a || null == b.d || null == a.d || !(b.d > 0)) return;
                a.d > b.d * WITNESS_ONE_STEP && flung.push({ label: label, before: b.d, after: a.d, thrown: t && null != t.d ? t.d : null, overrideBefore: b.o, overrideAfter: a.o, toThrown: !!(t && null != t.d && t.d > 0 && a.d >= t.d * (1 - WITNESS_EPS)) });
            });
            const rec = { transition: transition, flung: flung, wholesale: flung.length > 1 || flung.some(f => f.toThrown) };
            return dkLog.push(Object.assign({ type: "witness-final-transition" }, rec)), rec;
        }
        function diagCaptureView() {
            const view = { viewBox: null, transform: null, sceneTransform: null, bbox: null };
            try {
                const svg = document.getElementById("mapSvg"), scene = document.getElementById("mapScene"), layer = document.getElementById("mapLayer");
                if (svg) { view.viewBox = svg.getAttribute("viewBox"); view.transform = svg.getAttribute("transform"); }
                if (scene) view.sceneTransform = scene.getAttribute("transform");
                const bbEl = layer || scene;
                if (bbEl && "function" == typeof bbEl.getBBox) { const bb = bbEl.getBBox(); view.bbox = { x: diagRound(bb.x), y: diagRound(bb.y), width: diagRound(bb.width), height: diagRound(bb.height) }; }
            } catch (e) {}
            return view;
        }
        function witnessJudge(event, phase, trippingLabel, beforeFrame, afterFrame, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report) {
            if (!witnessThrown || !beforeFrame || !afterFrame) return null;
            const wholesale = [], steppedBack = [];
            Object.keys(afterFrame.subs).forEach(label => {
                const b = beforeFrame.subs[label], a = afterFrame.subs[label], t = witnessThrown[label];
                if (!b || !a || !t || null == b.d || null == a.d || null == t.d || !(t.d > 0) || !(b.d < t.d * (1 - WITNESS_EPS))) return;
                const isTrip = null != trippingLabel && label === trippingLabel;
                if (a.d >= t.d * (1 - WITNESS_EPS)) (isTrip && a.d <= b.d * WITNESS_ONE_STEP ? steppedBack : wholesale).push({ label: label, before: b.d, after: a.d, thrown: t.d }); else a.d > b.d * (isTrip ? WITNESS_ONE_STEP : 1.005) && steppedBack.push({ label: label, before: b.d, after: a.d, thrown: t.d });
            });
            const rec = { event: event, phase: phase || null, tripping: trippingLabel || null, wholesale: wholesale, steppedBack: steppedBack, wholesaleDiscard: wholesale.some(w => w.label !== trippingLabel) || wholesale.length > 1 };
            return report.witness.events.push(rec), dkLog.push(Object.assign({ type: "witness-event" }, rec)), rec;
        }
        function dkPaintedGeometry(stage, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg) {
            const centre = { x: pr.centerX, y: pr.centerY };
            const branchKey = catId(name), branchPt = dkPaintedNodeCentre(branchKey);
            const subs = {};
            tax.subLabels.forEach(l => {
                const key = Un(name, l), pt = dkPaintedNodeCentre(key);
                if (!pt || !branchPt) { subs[l] = { branchR: null, seg: null, absR: null, stemSeg: dkPaintedStemSeg(key), source: pt ? pt.source : "missing" }; return; }
                const r2 = v => Math.round(v * 100) / 100;
                subs[l] = { branchR: r2(Math.hypot(branchPt.x - centre.x, branchPt.y - centre.y)), seg: r2(Math.hypot(pt.x - branchPt.x, pt.y - branchPt.y)), absR: r2(Math.hypot(pt.x - centre.x, pt.y - centre.y)), stemSeg: dkPaintedStemSeg(key), source: pt.source, x: r2(pt.x), y: r2(pt.y) };
            });
            return { stage: stage || null, centre: centre, branchPt: branchPt ? { x: Math.round(branchPt.x * 100) / 100, y: Math.round(branchPt.y * 100) / 100, source: branchPt.source } : null, subs: subs, blitActive: !!blitSess, source: branchPt ? branchPt.source : "missing" };
        }
        function stepLabelCheck() {
            // (1) LABEL CHECK (§5.11): subcategory state maps are
            // keyed by BARE label, so a label borne by two branches is
            // armed in both by any per-branch cascade. Checked across
            // the whole taxonomy; duplicates are reported, and the run
            // may still proceed on that understanding.
            const labelCounts = {};
            h.forEach(b => (b.subcategories || []).forEach(s => {
                labelCounts[s.name] = (labelCounts[s.name] || 0) + 1;
            }));
            const duplicates = Object.keys(labelCounts).filter(l => labelCounts[l] > 1).sort();
                return duplicates;
            }
        function diagCamera() {
            const cam = { scale: null, tx: null, ty: null };
            try {
                if ("number" == typeof $p && Number.isFinite($p)) cam.scale = $p;
                if ("number" == typeof Ep && Number.isFinite(Ep)) cam.tx = Ep;
                if ("number" == typeof Ap && Number.isFinite(Ap)) cam.ty = Ap;
            } catch (e) {}
            if (null == cam.scale || null == cam.tx || null == cam.ty) try {
                const vp = document.getElementById("viewport"), tr = vp ? vp.getAttribute("transform") : null, m = tr ? /translate\(\s*([-\d.eE+]+)[ ,]+([-\d.eE+]+)\s*\)\s*scale\(\s*([-\d.eE+]+)\s*\)/.exec(tr) : null;
                if (m) { if (null == cam.tx) cam.tx = Number(m[1]); if (null == cam.ty) cam.ty = Number(m[2]); if (null == cam.scale) cam.scale = Number(m[3]); }
            } catch (e) {}
            return { scale: diagRound(cam.scale), tx: diagRound(cam.tx), ty: diagRound(cam.ty) };
        }
        function restoreKept(forFinal, dk, snapshot, name) {
            dk.restore(lastKeptSnapshot || snapshot);
            // The final phase deliberately cleared this
            // branch's fit registrations before committing;
            // a backed-up final restores the kept LAYOUT
            // only and never re-arms what the final patch
            // disarmed. Every other phase restores its kept
            // fit registrations with its layout.
            if (!forFinal && lastKeptFit) {
                clearBranchFit(dk, name);
                Object.keys(lastKeptFit).forEach(k => dk.setFitTarget(k, lastKeptFit[k]));
            }
        }
        function diagHubIdentity(name) {
            const out = { matches: 0, exitClone: null, hasTextPath: null };
            try {
                const key = catId(name), all = document.querySelectorAll('[data-layout-key="' + key + '"]');
                out.matches = all.length;
                const grp = document.querySelector('[data-layout-key="' + key + '"]');
                if (grp) {
                    out.exitClone = grp.classList.contains("layout-exit-clone");
                    const lab = grp.querySelector(".category-label");
                    out.hasTextPath = !!(lab && lab.querySelector("textPath"));
                }
            } catch (e) {}
            return out;
        }
        function stepPreconditions(api, report) {
            // (2) PRECONDITIONS (§5.6): the choreography assumes
            // collision mode 'grow', staggerDensity off (it makes
            // yr() ignore the branch length override entirely),
            // and the branch fully rendered (expandAll). A
            // violated value is STAGED: recorded here, written by
            // the throw commit below, covered by the pre-run
            // snapshot taken next, and restored by the final
            // patch or by a revert. Never proceeded on silently.
            const before = api.get(), staged = [];
            "grow" !== before.collision && staged.push({ key: "collision", from: before.collision, to: "grow" }), !1 !== before.staggerDensity && staged.push({ key: "staggerDensity", from: before.staggerDensity, to: !1 }), !0 !== before.expandAll && staged.push({ key: "expandAll", from: before.expandAll, to: !0 });
            report.preconditionsStaged = staged;
                return staged;
            }
        function witnessPaintedJudge(transition, operation, beforeG, afterG, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) {
            if (!beforeG || !afterG) return null;
            const flung = [];
            Object.keys(afterG.subs || {}).forEach(label => {
                const b = beforeG.subs[label], a = afterG.subs[label], t = witnessThrown ? witnessThrown[label] : null;
                if (!b || !a) return;
                [ "seg", "absR", "branchR" ].forEach(metric => {
                    const bv = b[metric], av = a[metric];
                    if (null == bv || null == av || !(bv > 0)) return;
                    av > bv * WITNESS_ONE_STEP && flung.push({ label: label, metric: metric, before: bv, after: av, thrown: "seg" === metric && t && null != t.d ? t.d : null, toThrown: "seg" === metric && !!(t && null != t.d && t.d > 0 && av >= t.d * (1 - WITNESS_EPS)) });
                });
            });
            const segFlung = flung.filter(f => "seg" === f.metric || "absR" === f.metric);
            const rec = { transition: transition, operation: operation || null, flung: flung, wholesale: segFlung.length > 1 || flung.some(f => f.toThrown) };
            return dkLog.push(Object.assign({ type: "witness-painted-transition" }, rec)), rec;
        }
        function dkPaintedStemSeg(key) {
            // Painted stem cross-check: the subcategory group's
            // own stem / hit path is emitted as M <parent point>
            // L <child point>; its endpoint distance is the
            // segment as actually drawn, independent of node
            // centres. Tapered bands are bands, not centrelines,
            // so they are not parsed here.
            try {
                const el = In.querySelector('.node-group[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)');
                if (!el) return null;
                const path = el.querySelector(":scope > .topic-stem, :scope > .concept-hit");
                const d = path && path.getAttribute("d");
                if (!d) return null;
                const nums = (String(d).match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number).filter(Number.isFinite);
                if (nums.length < 4) return null;
                const x1 = nums[0], y1 = nums[1], x2 = nums[nums.length - 2], y2 = nums[nums.length - 1];
                const len = Math.hypot(x2 - x1, y2 - y1);
                return Number.isFinite(len) && len > 0 ? Math.round(len * 100) / 100 : null;
            } catch (e) { return null; }
        }
        async function throwBracketFullPaint(stamp, name, dkPaintedNodeCentre, tax) {
            let preHub = null;
            try { const pre = dkPaintedGeometry("throwbracket-pre:" + stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); preHub = pre ? pre.branchPt : null; } catch (e) {}
            let mode = "skipped-no-capture";
            try {
                const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (cap && cap.branches && cap.branches.size && centres && centres.size) {
                    mode = "freeze-replay";
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-throwbracket-paint-blit-end", e); }
                    scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres }, sgHoldBlitStart = !0;
                    let paintRes = null;
                    try { paintRes = Mr({ animate: !1, forceRepaint: !0, __sxDiagFullPaint: !0 }); } catch (e) { __sxErrLog("layout-throwbracket-paint", e); } finally { scCtx = null, sgHoldBlitStart = !1; }
                    try {
                        if (paintRes && "function" == typeof paintRes.then) await Promise.race([ paintRes, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-throwbracket-paint-blit-end", e); }
                }
            } catch (e) { try { scCtx = null, sgHoldBlitStart = !1; } catch (_) {} }
            return { mode: mode, prePaintHubSeat: preHub };
        }
        function diagRegistrySnapshot(stamp, ordinal, phaseName, patch, record, now, prevCloud, dk, name, tax, report) {
            const fit = (() => { try { return dk.fitTargets(); } catch (e) { return {}; } })();
            let sec = null;
            try { sec = (dkLastBranches || []).find(s => s && s.entry && s.entry.branch && s.entry.branch.name === name) || null; } catch (e) {}
            const rows = [];
            tax.subLabels.forEach(l => {
                const key = "subcat|" + name + "|" + l;
                let solveR = null;
                try { const t = sec && (sec.topics || []).find(t => t && t.topic && t.topic.isSubcategory && t.topic.label === l); if (t && null != t.cloudRadius) solveR = diagRound(t.cloudRadius); } catch (e) {}
                const ovW = patch && patch.subcatOverrides && patch.subcatOverrides[l] && null != patch.subcatOverrides[l].length ? diagRound(patch.subcatOverrides[l].length) : mn.subcatOverrides && mn.subcatOverrides[l] && null != mn.subcatOverrides[l].length ? diagRound(mn.subcatOverrides[l].length) : null;
                rows.push({ key: key, label: l, fitTargetSet: null != fit[key] ? diagRound(fit[key]) : null, overrideWritten: ovW, solveRadius: solveR, deliveredRadius: diagRound(now && now.items ? now.items[key] : null), composedSegment: diagRound(now && now.items ? now.items[key] : null) });
            });
            const gateTol = null != prevCloud && null != record.cloud && Number.isFinite(prevCloud) && Number.isFinite(record.cloud) ? SX_SCORE.GATE_TOL : null;
            const gate = { prev: diagRound(prevCloud), cloud: diagRound(record.cloud), tolerance: diagRound(gateTol), threshold: null != gateTol && null != prevCloud ? diagRound(prevCloud + gateTol) : null, verdict: null == gateTol || null == record.cloud ? "n/a" : record.cloud > prevCloud + gateTol ? "trip" : "pass" };
            let onsetReading = null;
            try { const m = "function" == typeof window.__sxCrossingMeasure ? window.__sxCrossingMeasure() : null, v = m && m.clouds ? Number(m.clouds[name]) : NaN; onsetReading = Number.isFinite(v) ? diagRound(v) : null; } catch (e) {}
            const onsetBase = report.onset && null != report.onset.baseline ? report.onset.baseline : null;
            const onset = { baseline: diagRound(onsetBase), reading: onsetReading, margin: null, verdict: "n/a" };
            const entry = { type: "registry-snapshot", stageStamp: stamp, runPhaseOrdinal: ordinal, phase: phaseName, branch: name, cloud: diagRound(record.cloud), gate: gate, onset: onset, subs: rows };
            record.registrySnapshot = entry, (report.registrySnapshots || (report.registrySnapshots = [])).push(entry), dkLog.push(entry);
            return entry;
        }
        async function diagOnDemandPaint(stamp, paintOrdinal, phaseName, name, dkPaintedNodeCentre, tax, report) {
            let preHub = null;
            try { const pre = dkPaintedGeometry("ondemand-pre:" + stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); preHub = pre ? pre.branchPt : null; } catch (e) {}
            let mode = "skipped-no-capture";
            try {
                const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (cap && cap.branches && cap.branches.size && centres && centres.size) {
                    mode = "freeze-replay";
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-ondemand-paint-blit-end", e); }
                    scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres }, sgHoldBlitStart = !0;
                    let paintRes = null;
                    try { paintRes = Mr({ animate: !1, forceRepaint: !0, __sxDiagFullPaint: !0 }); } catch (e) { __sxErrLog("layout-ondemand-paint", e); } finally { scCtx = null, sgHoldBlitStart = !1; }
                    try {
                        if (paintRes && "function" == typeof paintRes.then) await Promise.race([ paintRes, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-ondemand-paint-blit-end", e); }
                }
            } catch (e) { try { scCtx = null, sgHoldBlitStart = !1; } catch (_) {} }
            let painted = null;
            try { painted = dkPaintedGeometry("ondemand:" + stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) {}
            const stored = dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera(), subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { subs[l] = { seg: painted.subs[l].seg, absR: painted.subs[l].absR, stored: diagRound(stored.items ? stored.items["subcat|" + name + "|" + l] : null) }; });
            const rec = { type: "ondemand-full-paint", stageStamp: stamp, runPhaseOrdinal: paintOrdinal, phase: phaseName, branch: name, mode: mode, opClass: "anneal-closing-paint", bbox: view.bbox, viewBox: view.viewBox, storedBranchRadius: diagRound(stored.branch), paintedBranchPt: painted ? painted.branchPt : null, branchRadius: painted && painted.branchPt ? diagRound(Math.hypot(painted.branchPt.x - pr.centerX, painted.branchPt.y - pr.centerY)) : null, subs: subs, prePaintHubSeat: preHub, camera: cam, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            (report.onDemandPaints || (report.onDemandPaints = [])).push(rec), dkLog.push(rec);
            try { console.log("[ANNEAL-ONDEMAND-PAINT] " + stamp + " \u00b7 " + phaseName + " \u00b7 mode " + mode + " \u00b7 bbox " + (view.bbox ? view.bbox.width + "\u00d7" + view.bbox.height : "\u2014"), rec); } catch (e) {}
            return rec;
        }
        let snapshot;
        async function stepBaseline(dk, report, name) {
            snapshot = dk.snapshot();
            report.baseline.first = await dk.measureCloud(name), report.baseline.second = await dk.measureCloud(name), report.baseline.variance = Math.abs(report.baseline.first - report.baseline.second);
            // STAGED SCORING (ruled 2026-11-02, Jason): the SAME
            // pre-run geometry also measured under the shrink-stage
            // composition (same-branch plus radial neighbours), so
            // the final gate — which judges after the switch —
            // compares like with like: descent and judge agree at
            // every stage. baseline.first above stays the run-start
            // (same-branch-only) value the per-phase gate chain and
            // the fine-tune decision read.
            try {
                const adjBase = sxCrossingStagedCloud(name, !0);
                null != adjBase && Number.isFinite(adjBase) && (report.baseline.adjacentFirst = adjBase, report.stagedScoring.baselineAdjacent = adjBase);
            } catch (e) {}
            // Q4: every NEIGHBOR cloud's crossing number at
            // baseline, reported-not-gated (the annealed branch
            // itself is excluded; its values are
            // baseline/finalCloud). The baseline's former
            // secondary xAreaCross readout was removed with the
            // area observation (M1); its commented-out copy was
            // deleted with the rest in 2026-10-30.
            try {
                const allBase = await dk.measureCloudsAll(), nb = {};
                Object.keys(allBase).forEach(k => {
                    k !== name && (nb[k] = allBase[k]);
                }), report.neighbors.baseline = nb;
            } catch (e) {}
            const preDelivered = dkDeliveredRadii(name);
            report.coverage.actedOn = Object.keys(preDelivered.items).length;
                return preDelivered;
            }
        function dkPaintedNodeCentre(key) {
            // Painted sources ONLY: the icon's rendered centre
            // through its own CTM chain, or the node's painted
            // stem endpoint. data-layout-x/y is NEVER
            // substituted — elsewhere in this bundle those
            // attributes are documented as holding rest-era
            // values for vault-resident branches, so a dataset
            // read could report stale positions as if painted.
            // When neither painted source reads, the node is
            // missing and its frame records not-observed for
            // that node (the judge skips null metrics).
            try {
                const el = In.querySelector('.node-group[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)') || In.querySelector('[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)');
                if (!el) return null;
                try {
                    const icon = el.querySelector(":scope > .branch-icon, :scope > .topic-icon");
                    const layerCTM = In.getCTM(), inv = layerCTM && layerCTM.inverse();
                    if (icon && inv) {
                        const dia = Number(icon.dataset.diameter), bb = icon.getBBox();
                        if (bb && bb.width > 0 && bb.height > 0) {
                            const lc = dia > 0 ? { x: dia / 2, y: dia / 2 } : { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }, ctm = icon.getCTM();
                            if (ctm) {
                                const p = new DOMPoint(lc.x, lc.y).matrixTransform(ctm).matrixTransform(inv);
                                if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return { x: p.x, y: p.y, source: "rendered-ctm" };
                            }
                        }
                    }
                } catch (e) {}
                try {
                    const path = el.querySelector(":scope > .topic-stem, :scope > .concept-hit");
                    const d = path && path.getAttribute("d");
                    if (d) {
                        const nums = (String(d).match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number).filter(Number.isFinite);
                        if (nums.length >= 4) {
                            const ex = nums[nums.length - 2], ey = nums[nums.length - 1];
                            if (Number.isFinite(ex) && Number.isFinite(ey)) return { x: ex, y: ey, source: "stem-endpoint" };
                        }
                    }
                } catch (e) {}
                return null;
            } catch (e) { return null; }
        }
        function diag00Capture(pre, name, tax, report) {
            const stamp = "ANNEAL-DIAG-00:pre-run:ord-0", r2 = diagRound;
            const painted = (() => { try { return dkPaintedGeometry(stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { return null; } })();
            const stored = pre || dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera();
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = r2(stored.items[k]); });
            const branches = [];
            h.forEach(b => {
                const btax = dkBranchTaxonomy(b.name), pt = (() => { try { return dkPaintedNodeCentre(catId(b.name)); } catch (e) { return null; } })(), pts = [], bsubs = {};
                if (pt) pts.push(pt);
                (btax ? btax.subLabels : []).forEach(l => { const sp = (() => { try { return dkPaintedNodeCentre(Un(b.name, l)); } catch (e) { return null; } })(); if (sp) { pts.push(sp); bsubs[l] = { x: r2(sp.x), y: r2(sp.y), absR: r2(Math.hypot(sp.x - pr.centerX, sp.y - pr.centerY)) }; } });
                let bb = null;
                if (pts.length) { const xs = pts.map(p => p.x), ys = pts.map(p => p.y); bb = { x: r2(Math.min.apply(null, xs)), y: r2(Math.min.apply(null, ys)), width: r2(Math.max.apply(null, xs) - Math.min.apply(null, xs)), height: r2(Math.max.apply(null, ys) - Math.min.apply(null, ys)) }; }
                branches.push({ branch: b.name, hubPt: pt ? { x: r2(pt.x), y: r2(pt.y), source: pt.source } : null, hubRadius: pt ? r2(Math.hypot(pt.x - pr.centerX, pt.y - pr.centerY)) : null, nodeCentreBBox: bb, subs: bsubs });
            });
            let fieldCount = 0; const perBranchCounts = {}, captureItems = {}, captureLines = [];
            try {
                const allNames = new Set(h.map(b => b.name)), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (centres && centres.captureFields) {
                    fieldCount = centres.captureFields.size;
                    centres.captureFields.forEach((fld, k) => { if (fld && fld.branch) perBranchCounts[fld.branch] = (perBranchCounts[fld.branch] || 0) + 1; if (fld && fld.branch === name) captureItems[k] = fld; });
                }
            } catch (e) {}
            captureLines.push("capture fields at DIAG-00 (paintComposition, all branches): " + (fieldCount ? fieldCount + " items captured \u00b7 " + Object.keys(captureItems).length + " on this branch \u00b7 per-branch " + Object.keys(perBranchCounts).map(bn => bn + " " + perBranchCounts[bn]).join(", ") : "unavailable"));
            Object.keys(subs).forEach(l => {
                const f = Object.keys(captureItems).map(k => captureItems[k]).find(v => v && "subcat" === v.kind && v.label === l), cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5);
                f && captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
            });
            const snapOverrides = snapshot ? { branch: snapshot.branchOverrides || null, subcat: snapshot.subcatOverrides || null, kinkCount: snapshot.kinkOverrides ? Object.keys(snapshot.kinkOverrides).length : 0, kink: snapshot.kinkOverrides || null } : null;
            const provLine = "pre-run override provenance: branch override length " + (snapOverrides && snapOverrides.branch && snapOverrides.branch[name] && null != snapOverrides.branch[name].length ? snapOverrides.branch[name].length : "\u2014") + " \u00b7 subcat overrides " + (snapOverrides && snapOverrides.subcat ? tax.subLabels.map(l => l + " " + (snapOverrides.subcat[l] && null != snapOverrides.subcat[l].length ? snapOverrides.subcat[l].length : "\u2014")).join(", ") : "\u2014") + " \u00b7 kink override entries " + (snapOverrides ? snapOverrides.kinkCount : "\u2014") + " \u00b7 preDelivered branch " + r2(stored.branch);
            const hid = diagHubIdentity(name), hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
            const snap = { code: "ANNEAL-DIAG-00", label: "pre-run painted-geometry snapshot \u2014 saved layout, before the cascade", stage: stamp, branch: name, phase: null, crossingBefore: null, crossingAfter: null, storedBranchRadius: r2(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: view, camera: cam, branches: branches, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, captureItems: captureItems, snapshotOverrides: snapOverrides, preDelivered: { branch: r2(stored.branch), items: stored.items || {} }, hubIdentity: hid, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.captureLines = captureLines;
            snap.hubLines = [ "painted hub (paintedBranchPt): " + (snap.paintedBranchPt ? hf(snap.paintedBranchPt.x) + ", " + hf(snap.paintedBranchPt.y) + " \u00b7 radius " + hubR(snap.paintedBranchPt) + " \u00b7 source " + (snap.paintedBranchPt.source || "\u2014") : "\u2014"), "hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") ];
            snap.extraLines = [ "per-branch bbox decomposition (node centres, stage " + stamp + "): " + branches.map(b => b.branch + " hub radius " + (null != b.hubRadius ? b.hubRadius : "\u2014") + " \u00b7 centre extent " + (b.nodeCentreBBox ? b.nodeCentreBBox.width + "\u00d7" + b.nodeCentreBBox.height + " @ " + b.nodeCentreBBox.x + "," + b.nodeCentreBBox.y : "\u2014")).join(" \u00b7 "), provLine, diagCameraText(cam, "camera at DIAG-00") ];
            snap.text = diagText(snap) + "\n" + snap.extraLines.join("\n") + "\n" + captureLines.join("\n") + "\n" + snap.hubLines.join("\n");
            (report.diag || (report.diag = [])).push(snap), report.diag00 = snap;
            dkLog.push({ type: "anneal-diag", code: "ANNEAL-DIAG-00", stage: stamp, phase: null, branch: name, text: snap.text });
            dkLog.push({ type: "diag00-snapshot", stage: stamp, branch: name, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, branches: branches, view: view, camera: cam });
            try { console.log("[ANNEAL-DIAG-00] " + snap.text, snap); } catch (e) {}
            return snap;
        }
        function throwBracketSnapshot(code, label, stamp, paintInfo, name, tax, report) {
            const r2 = diagRound, hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
            const painted = (() => { try { return dkPaintedGeometry(stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { return null; } })();
            const stored = dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera();
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = r2(stored.items[k]); });
            const branches = [];
            h.forEach(b => {
                const btax = dkBranchTaxonomy(b.name), pt = (() => { try { return dkPaintedNodeCentre(catId(b.name)); } catch (e) { return null; } })(), pts = [], bsubs = {};
                if (pt) pts.push(pt);
                (btax ? btax.subLabels : []).forEach(l => { const sp = (() => { try { return dkPaintedNodeCentre(Un(b.name, l)); } catch (e) { return null; } })(); if (sp) { pts.push(sp); bsubs[l] = { x: r2(sp.x), y: r2(sp.y), absR: r2(Math.hypot(sp.x - pr.centerX, sp.y - pr.centerY)) }; } });
                let bb = null;
                if (pts.length) { const xs = pts.map(p => p.x), ys = pts.map(p => p.y); bb = { x: r2(Math.min.apply(null, xs)), y: r2(Math.min.apply(null, ys)), width: r2(Math.max.apply(null, xs) - Math.min.apply(null, xs)), height: r2(Math.max.apply(null, ys) - Math.min.apply(null, ys)) }; }
                branches.push({ branch: b.name, hubPt: pt ? { x: r2(pt.x), y: r2(pt.y), source: pt.source } : null, hubRadius: pt ? r2(Math.hypot(pt.x - pr.centerX, pt.y - pr.centerY)) : null, nodeCentreBBox: bb, subs: bsubs });
            });
            let fieldCount = 0; const perBranchCounts = {}, captureItems = {}, captureLines = [];
            try {
                const allNames = new Set(h.map(b => b.name)), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (centres && centres.captureFields) {
                    fieldCount = centres.captureFields.size;
                    centres.captureFields.forEach((fld, k) => { if (fld && fld.branch) perBranchCounts[fld.branch] = (perBranchCounts[fld.branch] || 0) + 1; if (fld && fld.branch === name) captureItems[k] = fld; });
                }
            } catch (e) {}
            captureLines.push("capture fields at " + code + " (paintComposition, all branches): " + (fieldCount ? fieldCount + " items captured \u00b7 " + Object.keys(captureItems).length + " on this branch \u00b7 per-branch " + Object.keys(perBranchCounts).map(bn => bn + " " + perBranchCounts[bn]).join(", ") : "unavailable"));
            Object.keys(subs).forEach(l => {
                const f = Object.keys(captureItems).map(k => captureItems[k]).find(v => v && "subcat" === v.kind && v.label === l), cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5);
                f && captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
            });
            const snapOverrides = snapshot ? { branch: snapshot.branchOverrides || null, subcat: snapshot.subcatOverrides || null, kinkCount: snapshot.kinkOverrides ? Object.keys(snapshot.kinkOverrides).length : 0 } : null;
            const liveOv = { branch: mn.branchOverrides && mn.branchOverrides[name] && null != mn.branchOverrides[name].length ? r2(mn.branchOverrides[name].length) : null, subcat: {} };
            tax.subLabels.forEach(l => { liveOv.subcat[l] = mn.subcatOverrides && mn.subcatOverrides[l] && null != mn.subcatOverrides[l].length ? r2(mn.subcatOverrides[l].length) : null; });
            const provLine = code + " override provenance: pre-run (snapshot) branch override length " + (snapOverrides && snapOverrides.branch && snapOverrides.branch[name] && null != snapOverrides.branch[name].length ? snapOverrides.branch[name].length : "\u2014") + " \u00b7 pre-run subcat overrides " + (snapOverrides && snapOverrides.subcat ? tax.subLabels.map(l => l + " " + (snapOverrides.subcat[l] && null != snapOverrides.subcat[l].length ? snapOverrides.subcat[l].length : "\u2014")).join(", ") : "\u2014") + " \u00b7 live branch override length at " + code + " " + hf(liveOv.branch) + " \u00b7 live subcat overrides " + tax.subLabels.map(l => l + " " + hf(liveOv.subcat[l])).join(", ");
            let R = null;
            try { R = eaBase.photoRadius * centerRingScale(); } catch (e) {}
            const tr = report.throwRadii, throwLines = [];
            if ("THROW-BEFORE" === code) throwLines.push("throw inputs (pre-throw, read-only): center-avatar radius " + hf(R) + " \u00b7 branch target " + hf(null != R ? R * SX_SCORE.THROW_BRANCH : null) + " (" + SX_SCORE.THROW_BRANCH + "\u00d7R delivered from centre) \u00b7 subcat target " + hf(null != R ? R * SX_SCORE.THROW_SUBCAT : null) + " (" + SX_SCORE.THROW_SUBCAT + "\u00d7R delivered segment from branch node) \u00b7 delivered before: branch " + hf(stored.branch) + " \u00b7 subcat stored " + tax.subLabels.map(l => l + " " + hf(storedSubs[l])).join(", "));
            else throwLines.push("throw inputs (committed by stepThrow): center-avatar radius " + hf(tr ? tr.centerRadius : R) + " \u00b7 branch target " + hf(tr ? tr.branchTarget : null) + " \u00b7 subcat target " + hf(tr ? tr.subcatTarget : null) + " \u00b7 override lengths committed: branch " + hf(tr ? tr.branchLength : null) + " \u00b7 subcats " + (tr ? tax.subLabels.map(l => l + " " + hf(tr.subcatLengths ? tr.subcatLengths[l] : null)).join(", ") : "\u2014") + " \u00b7 not converted: " + (tr && tr.subcatNotConverted && tr.subcatNotConverted.length ? tr.subcatNotConverted.join(", ") : "none") + " \u00b7 delivered after: branch " + hf(stored.branch) + " \u00b7 subcat stored " + tax.subLabels.map(l => l + " " + hf(storedSubs[l])).join(", "));
            const deltaLines = [];
            let deltas = null;
            if ("THROW-AFTER" === code && throwBracketBefore) {
                const b = throwBracketBefore, dSubs = {};
                Object.keys(subs).forEach(l => { const bs = b.paintedSubs ? b.paintedSubs[l] : null; if (bs) dSubs[l] = { segBefore: bs.seg, segAfter: subs[l].seg, segDelta: null != bs.seg && null != subs[l].seg ? r2(subs[l].seg - bs.seg) : null, absBefore: bs.absR, absAfter: subs[l].absR, absDelta: null != bs.absR && null != subs[l].absR ? r2(subs[l].absR - bs.absR) : null }; });
                deltas = { branchRadiusBefore: b.storedBranchRadius, branchRadiusAfter: r2(stored.branch), branchRadiusDelta: null != b.storedBranchRadius ? r2(stored.branch - b.storedBranchRadius) : null, subs: dSubs };
                deltaLines.push("throw effect (THROW-AFTER \u2212 THROW-BEFORE): branch delivered radius " + hf(b.storedBranchRadius) + " \u2192 " + hf(stored.branch) + " (\u0394 " + hf(deltas.branchRadiusDelta) + ")" + Object.keys(dSubs).map(l => " \u00b7 " + l + ": seg " + hf(dSubs[l].segBefore) + " \u2192 " + hf(dSubs[l].segAfter) + " (\u0394 " + hf(dSubs[l].segDelta) + ") / abs " + hf(dSubs[l].absBefore) + " \u2192 " + hf(dSubs[l].absAfter) + " (\u0394 " + hf(dSubs[l].absDelta) + ")").join(""));
            }
            const hid = diagHubIdentity(name);
            const hubLines = [ "painted hub (paintedBranchPt): " + (painted && painted.branchPt ? hf(painted.branchPt.x) + ", " + hf(painted.branchPt.y) + " \u00b7 radius " + hubR(painted.branchPt) + " \u00b7 source " + (painted.branchPt.source || "\u2014") : "\u2014"), "hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") ];
            const snap = { code: code, label: label, stage: stamp, branch: name, phase: null, crossingBefore: null, crossingAfter: null, storedBranchRadius: r2(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: view, camera: cam, branches: branches, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, captureItems: captureItems, snapshotOverrides: snapOverrides, liveOverrides: liveOv, hubIdentity: hid, paintMode: paintInfo ? paintInfo.mode : null, prePaintHubSeat: paintInfo ? paintInfo.prePaintHubSeat : null, throwRadii: tr || null, deltas: deltas, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.extraLines = [ "per-branch bbox decomposition (node centres, stage " + stamp + "): " + branches.map(b => b.branch + " hub radius " + (null != b.hubRadius ? b.hubRadius : "\u2014") + " \u00b7 centre extent " + (b.nodeCentreBBox ? b.nodeCentreBBox.width + "\u00d7" + b.nodeCentreBBox.height + " @ " + b.nodeCentreBBox.x + "," + b.nodeCentreBBox.y : "\u2014")).join(" \u00b7 "), provLine, diagCameraText(cam, "camera at " + code), "bracket paint mode: " + snap.paintMode + " \u00b7 opClass anneal-closing-paint" ];
            snap.captureLines = captureLines, snap.hubLines = hubLines, snap.throwLines = throwLines, snap.deltaLines = deltaLines;
            snap.text = diagText(snap) + "\n" + snap.extraLines.join("\n") + "\n" + throwLines.join("\n") + (deltaLines.length ? "\n" + deltaLines.join("\n") : "");
            (report.diag || (report.diag = [])).push(snap), (report.throwBracket || (report.throwBracket = {}))["THROW-BEFORE" === code ? "before" : "after"] = snap;
            dkLog.push({ type: "anneal-diag", code: code, stage: stamp, phase: null, branch: name, text: snap.text });
            dkLog.push({ type: "throw-bracket", code: code, stage: stamp, branch: name, paintMode: snap.paintMode, storedBranchRadius: snap.storedBranchRadius, paintedBranchPt: snap.paintedBranchPt, subs: subs, storedSubs: storedSubs, branches: branches, view: view, camera: cam, throwRadii: tr || null, deltas: deltas });
            try { console.log("[" + code + "] " + snap.text, snap); } catch (e) {}
            return snap;
        }
        let diagPrePaintHub;
        function diagSnapshot(code, label, extra, name, tax, diagAcceptCtx, diagCaptureFields) {
            const stored = dkDeliveredRadii(name);
            let painted = null;
            try { painted = dkPaintedGeometry("diag:" + code, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { painted = null; }
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = diagRound(stored.items[k]); });
            const snap = { code: code, label: label, branch: name, phase: diagAcceptCtx ? diagAcceptCtx.phase : null, crossingBefore: diagAcceptCtx ? diagAcceptCtx.crossingBefore : null, crossingAfter: diagAcceptCtx ? diagAcceptCtx.crossingAfter : null, storedBranchRadius: diagRound(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: diagCaptureView(), atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.closingPaint = null, snap.camera = null, snap.closingLines = [];
            // CAPTURE FIELDS (diagnostic-only, ruled
            // 2026-11-01, per CENTRE-CAPTURE-DIAGNOSIS.md):
            // at DIAG-03, carry the closing-paint capture's
            // per-item fields for this branch — registry
            // cloudRadius / cloudAngle and the override
            // multiplier as held at the capture moment, with
            // the composed radius and centre — plus each
            // subcategory's painted measurement source
            // (already on paintedSubs above), so the next
            // live drive can close the per-item spread
            // between the capture-time sectors and the
            // closing solve's sectors. Read-only.
            snap.captureItems = null, snap.captureLines = [];
            if ("ANNEAL-DIAG-03" === code) {
                const cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5), items = {};
                if (diagCaptureFields) diagCaptureFields.forEach((fld, k) => { fld && fld.branch === name && (items[k] = fld); });
                snap.captureItems = items;
                // The summary line is unconditional at
                // DIAG-03: a missing or empty capture is
                // stated, never silent.
                snap.captureLines.push("capture fields at the capture moment: " + (diagCaptureFields ? diagCaptureFields.size + " items captured \u00b7 " + Object.keys(items).length + " on this branch" : "unavailable"));
                Object.keys(subs).forEach(l => {
                    const f = Object.keys(items).map(k => items[k]).find(v => v && "subcat" === v.kind && v.label === l);
                    f && snap.captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
                });
            }
            // HUB LOGGING (diagnostic-only, ruled 2026-11-01,
            // per HUB-SIDE-DIAGNOSIS.md): the painted hub seat
            // (paintedBranchPt — on the snapshot object all
            // along, printed in no strip), the pre-paint hub
            // seat stashed at DIAG-02, the hub group's
            // label-path length and data-icon-distance-
            // override as they stand at this pause, and the
            // closing solve's sector angle with its yr()
            // inputs — so the hub seat is attributable on the
            // next live drive. Read-only.
            snap.hubSeat = null, snap.hubLines = [];
            try {
                const hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
                if ("ANNEAL-DIAG-02" === code && painted && painted.branchPt) diagPrePaintHub = painted.branchPt;
                let pathLen = null, iconOv = null;
                try {
                    const grp = document.querySelector('[data-layout-key="' + catId(name) + '"]'), lab = grp && grp.querySelector(".category-label"), pel = lab && lab.dataset.pathId ? document.getElementById(lab.dataset.pathId) : null;
                    if (pel && "function" == typeof pel.getTotalLength) pathLen = pel.getTotalLength();
                    if (grp) iconOv = grp.dataset.iconDistanceOverride;
                } catch (e) {}
                let secInfo = null;
                try {
                    const sec = (dkLastBranches || []).find(s => s && s.entry && s.entry.branch && s.entry.branch.name === name);
                    if (sec) {
                        const anch = rr.branchAnchor(sec), bov = mn.branchOverrides && mn.branchOverrides[name];
                        secInfo = { angle: diagRound(sec.angle), overrideLength: bov && null != bov.length ? diagRound(bov.length) : null, spokeAdjust: diagRound(Number(sec.entry.branch._spokeAdjust20) || 0), anchorRadius: anch ? diagRound(Math.hypot(anch.x - pr.centerX, anch.y - pr.centerY)) : null };
                    }
                } catch (e) {}
                snap.hubSeat = { painted: snap.paintedBranchPt, prePaint: diagPrePaintHub, labelPathLength: diagRound(pathLen), iconDistanceOverride: null == iconOv ? null : iconOv, sector: secInfo };
                snap.hubLines.push("painted hub (paintedBranchPt): " + (snap.paintedBranchPt ? hf(snap.paintedBranchPt.x) + ", " + hf(snap.paintedBranchPt.y) + " \u00b7 radius " + hubR(snap.paintedBranchPt) + " \u00b7 source " + (snap.paintedBranchPt.source || "\u2014") : "\u2014"));
                snap.hubLines.push("pre-paint hub seat (at DIAG-02): " + (diagPrePaintHub ? hf(diagPrePaintHub.x) + ", " + hf(diagPrePaintHub.y) + " \u00b7 radius " + hubR(diagPrePaintHub) : "\u2014"));
                snap.hubLines.push("hub label path: length " + hf(pathLen) + " \u00b7 data-icon-distance-override " + (null == iconOv ? "\u2014" : iconOv));
                try { const hid = diagHubIdentity(name); snap.hubIdentity = hid; snap.hubLines.push("hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") + " \u00b7 settle scCenterPt-vs-presnap delta \u2014 (settle-internal; not readable at this pause)"); } catch (e) {}
                snap.hubLines.push("closing solve sector: angle " + (secInfo ? hf(secInfo.angle) : "\u2014") + " \u00b7 yr inputs: branch override " + (secInfo ? hf(secInfo.overrideLength) : "\u2014") + " \u00b7 _spokeAdjust20 " + (secInfo ? hf(secInfo.spokeAdjust) : "\u2014") + " \u00b7 anchor radius " + (secInfo ? hf(secInfo.anchorRadius) : "\u2014"));
            } catch (e) {}
            if (extra) {
                snap.closingPaint = { mode: String(extra.mode || "ordinary"), scopedPaint: extra.scopedPaint ? { retained: extra.scopedPaint.retained, captured: extra.scopedPaint.captured, diverged: extra.scopedPaint.diverged } : null, segmentTiming: !!extra.segmentTiming };
                snap.camera = diagCamera();
                snap.closingLines = diagClosingLines(snap);
            }
            snap.text = diagText(snap);
            return snap;
        }
        function stepOnsetSetup(name, fineTuneActive, report) {
            // COLLISION-ONSET RULE (Jason, 2026-10-24): the
            // shrink ladders below run "until colliding", judged
            // on the branch cloud's hybrid crossing number. The
            // BASELINE is that number in the THROWN state,
            // captured here — immediately after the throw commit,
            // before any shrink stage — and held for the whole
            // run. The readout is the metric dropdown's own
            // computation (window.__sxCrossingMeasure, the port
            // readout behind defs.crossingnumber.clouds), keyed
            // by branch name; it is a read-only measurement for
            // the onset rule ONLY and never feeds any gate
            // readout. Null when the readout is unavailable —
            // onset then never trips this run.
            const onsetCrossing = () => {
                try {
                    const m = "function" == typeof window.__sxCrossingMeasure ? window.__sxCrossingMeasure() : null, v = m && m.clouds ? Number(m.clouds[name]) : NaN;
                    return Number.isFinite(v) ? v : null;
                } catch (e) {
                    return null;
                }
            };
            // Skip path: there is no thrown state, so the recorded
            // baseline is the pre-run cascade baseline
            // (report.baseline.first). Phase 4 (2026-11-04): that
            // baseline is report-only. The fine-tune margin and the
            // onset margin are deleted; neither stops a ladder.
            const onsetBaseline = fineTuneActive ? (Number.isFinite(report.baseline.first) ? report.baseline.first : null) : onsetCrossing();
            fineTuneActive ? dkLog.push({ type: "fine-tune-baseline", branch: name, baseline: onsetBaseline }) : (report.onset.baseline = onsetBaseline, dkLog.push({ type: "onset-baseline", branch: name, baseline: onsetBaseline }));
            // Phase 4 (2026-11-04): no margin test. The onset
            // margin and the fine-tune margin are deleted, and the
            // stop-rule selector is gone. This check never stops a
            // ladder. The per-phase gate (SX_SCORE.GATE_TOL, flat 2)
            // inside runPhase is the only stop.
            const onsetCheck = () => !1;
                return onsetCheck;
            }
        async function stepGrowth(report, dk, name, prevPhaseCloud, opts, runPhase, tax, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            report.growth = { dominance: null, factors: [], branchSteps: 0, subcatSteps: 0, skipped: null };
            let standing = null, excluded = null;
            try { standing = await dk.measureCloud(name); } catch (e) { standing = prevPhaseCloud; }
            try {
                const xm = "function" == typeof window.__sxCrossingMeasureExcluded ? window.__sxCrossingMeasureExcluded() : null, v = xm && xm.clouds ? Number(xm.clouds[name]) : NaN;
                excluded = Number.isFinite(v) ? v : null;
            } catch (e) { excluded = null; }
            if (null == standing || null == excluded || !(standing > 0)) {
                report.growth.skipped = null != standing && null != excluded && 0 === standing ? "standing-zero-nothing-to-relieve" : "dominance-unmeasurable", dkLog.push({ type: "growth-skip", branch: name, reason: report.growth.skipped, standing: standing, excluded: excluded });
                return;
            }
            const sameBranch = standing - excluded, share = sameBranch / standing;
            report.growth.dominance = { standing: standing, excluded: excluded, sameBranch: sameBranch, share: share, threshold: SX_SCORE.GROWTH_DOMINANCE }, dkLog.push({ type: "growth-dominance", branch: name, standing: standing, excluded: excluded, sameBranch: sameBranch, share: share, threshold: SX_SCORE.GROWTH_DOMINANCE });
            if (!(share > SX_SCORE.GROWTH_DOMINANCE)) {
                report.growth.skipped = "same-branch-share-not-dominant";
                return;
            }
            // Test-only hook (opts._testGrowthStepFactor): a
            // multiplier on the ladder's step factors, used by
            // the acceptance harness to force an overshooting
            // growth step and prove the back-up. Not part of
            // any production run.
            const testFactor = opts && Number.isFinite(Number(opts._testGrowthStepFactor)) && Number(opts._testGrowthStepFactor) > 0 ? Number(opts._testGrowthStepFactor) : 1, factors = [];
            {
                let f = 1;
                for (let j = 0; j < SX_SCORE.GROWTH_MAX_STEPS; j++) f *= SX_SCORE.GROWTH_STEP, factors.push(Math.min(f, SX_SCORE.GROWTH_CAP) * testFactor);
            }
            report.growth.factors = factors.slice();
            const growthBase = dkDeliveredRadii(name);
            const annotateGrowth = (phaseName, factor) => {
                const rec = report.phases[report.phases.length - 1];
                if (!rec || rec.name !== phaseName) return;
                const nowD = dkDeliveredRadii(name), sR = [], kR = [];
                Object.keys(nowD.items).forEach(k => {
                    const pre = growthBase.items[k], cur = nowD.items[k];
                    if (!(pre > 0) || !Number.isFinite(cur)) return;
                    "subcat" === k.split("|")[0] ? sR.push(cur / pre) : kR.push(cur / pre);
                }), rec.growth = { factor: factor, deliveredBranch: growthBase.branch > 0 && Number.isFinite(nowD.branch) ? nowD.branch / growthBase.branch : null, deliveredSubcatMedian: dkMedian(sR), deliveredKinkMedian: dkMedian(kR) };
            };
            // Branch level: direct length patches on the
            // branch override, the fit-branch ladder's lever.
            const branchBase = dkBakedBranchBase(name), bSnap = dk.snapshot(), bEntry = (bSnap.branchOverrides || {})[name], branchLen0 = bEntry && Number(bEntry.length) > 0 ? Number(bEntry.length) : branchBase, branchHeadroom = 200 / (branchLen0 / branchBase);
            let lastBranchEff = 1;
            for (let j = 0; j < factors.length; j++) {
                const eff = Math.min(factors[j], branchHeadroom);
                if (!(eff > lastBranchEff + 1e-12)) {
                    report.growth.branchCappedByValidation = !0;
                    break;
                }
                const patch = dk.snapshot();
                patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: branchLen0 * eff }), mark = dkLog.length;
                const res = await runPhase("grow-branch-" + (j + 1), patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                annotateGrowth("grow-branch-" + (j + 1), factors[j]), lastBranchEff = eff;
                if (res && res.dkPhaseTripped) break;
                report.growth.branchSteps++;
            }
            // Subcategory level: length patches on every
            // subcategory override of this branch, with the
            // subcategories' fit targets raised by the same
            // factor — the ladder's lever — so the solve
            // delivers the grown radii the final patch then
            // carries through the overrides.
            if (tax.subLabels.length) {
                const sSnap = dk.snapshot(), subLen0 = {}, subBase = {}, subApplied = {};
                tax.subLabels.forEach(l => {
                    const e0 = (sSnap.subcatOverrides || {})[l];
                    subBase[l] = dkBakedSubBase(l), subLen0[l] = e0 && Number(e0.length) > 0 ? Number(e0.length) : subBase[l], subApplied[l] = subLen0[l];
                });
                const fitAll = dk.fitTargets(), subFit0 = {};
                Object.keys(fitAll).forEach(k => {
                    const p = k.split("|");
                    "subcat" === p[0] && p[1] === name && (subFit0[k] = fitAll[k]);
                });
                for (let j = 0; j < factors.length; j++) {
                    let advances = !1;
                    const patch = dk.snapshot();
                    tax.subLabels.forEach(l => {
                        const eff = Math.min(subLen0[l] * factors[j], subBase[l] * 200);
                        eff > subApplied[l] + 1e-12 && (advances = !0), patch.subcatOverrides[l] = Object.assign({}, patch.subcatOverrides[l], { length: eff });
                    });
                    if (!advances) {
                        report.growth.subcatCappedByValidation = !0;
                        break;
                    }
                    Object.keys(subFit0).forEach(k => dk.setFitTarget(k, subFit0[k] * factors[j])), mark = dkLog.length;
                    const res = await runPhase("grow-subcats-" + (j + 1), patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                    tax.subLabels.forEach(l => {
                        const pe = (patch.subcatOverrides || {})[l];
                        pe && Number.isFinite(Number(pe.length)) && (subApplied[l] = Number(pe.length));
                    }), annotateGrowth("grow-subcats-" + (j + 1), factors[j]);
                    if (res && res.dkPhaseTripped) break;
                    report.growth.subcatSteps++;
                }
            } else report.growth.subcatSkipped = "no-subcategories";
            }
        let witnessFinalLastKept;
        let witnessFinalOperation;
        let witnessFinalBefore;
        let witnessPaintedBefore;
        let witnessFinalTripped;
        let witnessFinalAfter;
        let witnessPaintedAfter;
        async function stepFinalPatch(dk, name, opts, report, tax, runPhase, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, diagCaptureFields, witnessTrippingLabel) {
            // (6) FINAL PATCH (§3.7, rewire A — Jason,
            // 2026-10-24): built on the pre-run snapshot, so
            // (a) all four arm maps return to their exact
            // pre-run values and (b) staged precondition values
            // return to pre-run. (c) Each fit item's length
            // override is carried into the patch EXACTLY as it
            // stands in the post-ladder state — no
            // delivered-radius factor multiplication (the
            // growth phase that supplied those factors is
            // removed, with the fit-target recompute whose only
            // consumer it was): a level whose ladder ran to its
            // final stage stands at its restored pre-run
            // length; a level held by onset stands at its held
            // length — in particular the branch override is NOT
            // forced back to its pre-run snapshot value when
            // the branch ladder onset-held above it; and kink
            // overrides stand at their thrown autofit values
            // (3x the kink length), the
            // room this run exists to keep. An entry the
            // post-ladder state lacks is dropped from the patch
            // rather than revived from the snapshot. (d) The
            // branch's fit registrations are cleared before the
            // commit, so the final solve — and the gate
            // measurement after it — runs on the true kept
            // state, unarmed.
            const finalPatch = dkDeepCloneLayout(snapshot), heldState = dk.snapshot();
            Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name).forEach(k => {
                const p = k.split("|");
                if ("subcat" === p[0]) {
                    const cur = heldState.subcatOverrides ? heldState.subcatOverrides[p[2]] : null;
                    cur ? finalPatch.subcatOverrides[p[2]] = Object.assign({}, cur) : delete finalPatch.subcatOverrides[p[2]];
                } else {
                    const id = "child" === p[0] ? p[3] : p[2], cur = heldState.kinkOverrides ? heldState.kinkOverrides[id] : null;
                    cur ? finalPatch.kinkOverrides[id] = Object.assign({}, cur) : delete finalPatch.kinkOverrides[id];
                }
            });
            const heldBranch = heldState.branchOverrides ? heldState.branchOverrides[name] : null;
            heldBranch ? finalPatch.branchOverrides[name] = Object.assign({}, heldBranch) : delete finalPatch.branchOverrides[name];
            // Test-only hook (opts._testFinalPatch): an object
            // merged into the final patch just before it is
            // applied — map values merge per key, scalars
            // replace. The acceptance harness uses it to force a
            // gate failure and prove the full revert. Not part of
            // any production run.
            if (opts && opts._testFinalPatch && "object" == typeof opts._testFinalPatch) Object.keys(opts._testFinalPatch).forEach(k => {
                const tv = opts._testFinalPatch[k];
                if (tv && "object" == typeof tv && !Array.isArray(tv) && finalPatch[k] && "object" == typeof finalPatch[k]) {
                    const merged = {};
                    Object.keys(finalPatch[k]).forEach(ek => {
                        merged[ek] = finalPatch[k][ek];
                    }), Object.keys(tv).forEach(ek => {
                        const ev = tv[ek];
                        merged[ek] = ev && "object" == typeof ev ? Object.assign({}, ev) : ev;
                    }), finalPatch[k] = merged;
                } else finalPatch[k] = tv;
            });
            clearBranchFit(dk, name), mark = dkLog.length;
            const wBeforeFinal = witnessLastFrame;
            // FINAL-STEP WITNESS (extension): name this run's
            // final-step operation and bracket its commit —
            // the last kept phase stands in wBeforeFinal, a
            // fresh frame lands immediately before the commit,
            // and one immediately after it.
            witnessFinalLastKept = wBeforeFinal, witnessFinalOperation = "final patch (pre-run snapshot rebuilt with held lengths carried through, branch fit cleared, committed as the 'final' phase)", witnessFinalBefore = witnessFrame("final-step-before", "final", null, witnessSubs, name, report, dk);
            witnessPaintedBefore = witnessPaintedFrame("before-final-step", witnessFinalOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            const finalRes = await runPhase("final", finalPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
            // STAGED SCORING: finalCloud is judged under the
            // shrink-stage composition; report.delta stays the
            // receipt's displayed difference (final minus the
            // displayed run-start baseline.first), and the gate's
            // judged change rides separately as gateDelta against
            // gateBaseline (set at the gate below from
            // baseline.adjacentFirst, the neighbour-inclusive
            // baseline captured on the pre-run geometry).
            report.finalCloud = await dk.measureCloud(name), report.delta = report.finalCloud - report.baseline.first, report.gateDelta = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.finalCloud - report.baseline.adjacentFirst : report.delta;
            witnessFinalTripped = !!(finalRes && finalRes.dkPhaseTripped), witnessFinalTripped && (witnessFinalOperation += " — the final phase gate-tripped and backed up to the last kept state");
            witnessFinalAfter = witnessFrame("final-step-after", "final", null, witnessSubs, name, report, dk);
            witnessPaintedAfter = witnessPaintedFrame("after-final-step", witnessFinalOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            witnessJudge("final-patch", "final", null, wBeforeFinal, witnessLastFrame, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report);
            // Q4: the final SECONDARY area (reported only), the
            // neighbor clouds' final crossing numbers
            // (reported-not-gated — measured BEFORE the gate
            // below runs, so a reverted run still reports the
            // kept-state candidates it judged), and the PLATEAU
            // record: the plateau copy fires ONLY at crossing
            // exactly 0 — an area improvement with crossing
            // still non-zero never fires it.
            try {
                const allFin = await dk.measureCloudsAll(), nf = {};
                Object.keys(allFin).forEach(k => {
                    k !== name && (nf[k] = allFin[k]);
                }), report.neighbors.final = nf;
            } catch (e) {}
            // Bake gate (M4): dkBakeGate above, the single
            // computation shared by both run endings.
            dkBakeGate(report);
            report.plateau = { metric: "crossingnumber", finalCrossing: report.finalCloud, copyFired: 0 === report.finalCloud };
            // Q2: the run's total fit-deviation count rides on
            // the report so the receipt lead can surface it.
            report.fitDeviationTotal = tallyFitDev(report);
            }
        async function stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // (4) THROW: one commit. The branch is thrown to a
            // delivered distance of 50 center-avatar radii
            // from the center and every subcategory to a
            // delivered segment of 20 radii out from its
            // branch node (the 2026-11-01 center-avatar-radii
            // re-ruling; the subcategory factor is the
            // corrected 20, not the first-said 10; the radii
            // are converted to override lengths below, after
            // the throwFitCap block), every kink autofit to three times its
            // kink (fit) length — 3x (re-ruled 2026-11-02
            // 16:59 CST, Jason; throwFitCap below governs,
            // no kink throw factor caps it),
            // any staged
            // precondition
            // values, and the FULL cascade armed in the same
            // patch — both spoke arm maps, overwriting inherited
            // explicit-false vetoes (restored later from the
            // snapshot).
            mark = dkLog.length;
            // THROW TOPIC AUTOFIT (re-ruled 2026-11-01, Jason —
            // supersedes the 2026-10-31 throw topic cap): in
            // the throw, the kink leaves are not thrown by a
            // radii factor; each one autofits to THREE TIMES
            // its kink length — its fit length x
            // LEAF_FIT_FACTOR (3, re-ruled 2026-11-02 16:59
            // CST, Jason, reversing the same day's 13:11 1x
            // leaf ruling; the shared SHRINK_FLOOR_FACTOR is
            // NOT read here — it stays 1 for the subcategory
            // and category floors only). The value computed here IS the thrown
            // kink length (it governed only as a min-cap
            // against the old THROW_KINK factor before this
            // re-ruling). The fit
            // length in override units is converted from the
            // item's label-fit target (rendered units) through
            // its pre-run delivered radius, exactly as the
            // kink shrink-to-label driver converts its targets
            // (afterLength = curLen x target / delivered), with
            // curLen the pre-run (snapshot) length. The
            // smallest cap across an id's items governs; an
            // item with no computable fit target caps nothing.
            const throwFitCap = {};
            try {
                dkFitBranchItems(name).forEach(w => {
                    const info = dkRadialBaseInfo(w), kind = info.key.split("|")[0];
                    if ("topic" !== kind && "child" !== kind) return;
                    const id = "child" === kind ? (w.child ? w.child.id : null) : (w.topic ? w.topic.id : null);
                    if (null == id) return;
                    const target = dkComputeFitTarget(info.key), delivered = dkDeliveredItemRadius(w), cur = snapshot.kinkOverrides ? snapshot.kinkOverrides[id] : null, curLen = cur && Number(cur.length) > 0 ? Number(cur.length) : 1;
                    if (null == target || !(target > 0) || !Number.isFinite(delivered) || !(delivered > 0)) return;
                    const capLen = curLen * target * sxLeafOvergrowthFactor() / delivered;
                    Number.isFinite(capLen) && capLen > 0 && (null == throwFitCap[id] || capLen < throwFitCap[id]) && (throwFitCap[id] = capLen);
                });
            } catch (e) {}
            // THROW RADII CONVERSION (fix, 2026-11-01, Jason —
            // definition settled 04:56 CST after diagnosis
            // c17e4775 CONFIRMED the over-extension): the
            // THROW_BRANCH / THROW_SUBCAT factors count
            // CENTER-AVATAR RADII in world units, not multiples
            // of the baked base. The old code set the branch
            // override to bakedBase x 50 and each subcategory
            // override to bakedBase x 20; a baked base is itself
            // a large multiplier (Bondage ≈ 29.9), so the
            // delivered throw landed tens of times past the
            // ruled distance. The radius R is the center
            // avatar's own circle: the avatar disc radius the
            // Center ring scale slider (mn.centerRingScale —
            // the slider next to the text / font slider) sets,
            // eaBase.photoRadius x centerRingScale(), the same
            // value refreshCenterRing() leaves in ea.photoRadius
            // on every render; it is the fundamental scale of
            // the center avatar. The branch node is thrown to a
            // DELIVERED distance of THROW_BRANCH x R from the
            // center; each subcategory is thrown to a DELIVERED
            // segment of THROW_SUBCAT x R out from its branch
            // node. World targets convert into override lengths
            // with the kink delivered-radius pattern the
            // throwFitCap above already uses (afterLength =
            // curLen x target / delivered), with curLen the
            // pre-run (snapshot) length and delivered the
            // pre-run delivered radius (preDelivered: yr() for
            // the branch, the hub spoke x override for a
            // subcategory segment). An item with no positive
            // pre-run delivered radius is NOT thrown at all:
            // its override is never written, so it keeps its
            // pre-run length, and it is recorded in
            // report.throwRadii as not converted (the old
            // baked-base multiple is never a fallback — it was
            // the over-extension being fixed). The conversion
            // is recorded on report.throwRadii (fields added
            // only) and in the run log.
            const throwCenterRadius = eaBase.photoRadius * centerRingScale();
            const throwBranchTarget = throwCenterRadius * SX_SCORE.THROW_BRANCH;
            const throwSubcatTarget = throwCenterRadius * SX_SCORE.THROW_SUBCAT;
            const throwConvert = (curLen, delivered, target) => sxLenConvert(curLen, delivered, target);
            const branchCurEntry = snapshot && snapshot.branchOverrides
                ? snapshot.branchOverrides[name] : null;
            const branchCurLen = branchCurEntry && Number(branchCurEntry.length) > 0
                ? Number(branchCurEntry.length) : 1;
            const throwBranchRaw = throwConvert(branchCurLen,
                preDelivered ? preDelivered.branch : NaN, throwBranchTarget);
            const throwBranchLen = Number.isFinite(throwBranchRaw) && throwBranchRaw > 0
                ? throwBranchRaw : null;
            const throwSubcatLens = {}, throwSubcatSkipped = [];
            tax.subLabels.forEach(l => {
                const curEntry = snapshot && snapshot.subcatOverrides
                    ? snapshot.subcatOverrides[l] : null;
                const curLen = curEntry && Number(curEntry.length) > 0
                    ? Number(curEntry.length) : 1;
                const delivered = preDelivered && preDelivered.items
                    ? preDelivered.items["subcat|" + name + "|" + l] : NaN;
                const len = throwConvert(curLen, delivered, throwSubcatTarget);
                if (Number.isFinite(len) && len > 0) throwSubcatLens[l] = len;
                else throwSubcatSkipped.push(l);
            });
            report.throwRadii = {
                centerRadius: throwCenterRadius,
                branchFactor: SX_SCORE.THROW_BRANCH,
                subcatFactor: SX_SCORE.THROW_SUBCAT,
                branchTarget: throwBranchTarget,
                subcatTarget: throwSubcatTarget,
                branchLength: throwBranchLen,
                subcatLengths: throwSubcatLens,
                subcatNotConverted: throwSubcatSkipped
            };
            dkLog.push({
                type: "throw-radii", branch: name,
                centerRadius: throwCenterRadius,
                branchTarget: throwBranchTarget,
                subcatTarget: throwSubcatTarget,
                branchLength: throwBranchLen,
                subcatLengths: throwSubcatLens,
                subcatNotConverted: throwSubcatSkipped
            });
            const throwPatch = dkDeepCloneLayout(snapshot);
            staged.forEach(s => {
                throwPatch[s.key] = s.to;
            });
            // A level whose conversion failed is NOT thrown:
            // its override is simply never written here, so
            // the snapshot clone keeps its pre-run length.
            if (null != throwBranchLen)
                throwPatch.branchOverrides[name] = Object.assign({},
                    throwPatch.branchOverrides[name], { length: throwBranchLen });
            tax.subLabels.forEach(l => {
                if (null != throwSubcatLens[l])
                    throwPatch.subcatOverrides[l] = Object.assign({},
                        throwPatch.subcatOverrides[l], { length: throwSubcatLens[l] });
            });
            tax.kinkIds.forEach(id => {
                // Kink leaves autofit to 3x the kink length
                // (2026-11-02 16:59 CST re-ruling): the fit cap IS the
                // thrown length; the THROW_KINK multiple of
                // the baked base (also 3) is only the fallback
                // for a kink with no computable fit target.
                const fitCapLen = throwFitCap[id];
                throwPatch.kinkOverrides[id] = Object.assign({}, throwPatch.kinkOverrides[id], { length: null != fitCapLen && Number.isFinite(fitCapLen) ? fitCapLen : dkBakedKinkBase(id) * sxLeafOvergrowthFactor() });
            });
            throwPatch.branchSpokeAutoShrink[name] = !0;
            tax.subLabels.forEach(l => {
                throwPatch.subcatSpokeAutoShrink[l] = !0;
            });
            await runPhase("throw", throwPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
            }
        async function stepThrowRepeated(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // THROW REPEAT (ruled 2026-11-06, Jason): the throw
            // step as it exists (stepThrow above — same targets,
            // same factors, nothing about it changed), repeated
            // when it does not clear. The crossing number BEFORE
            // is the run baseline (report.baseline.first,
            // measured twice in stepBaseline under the same
            // own-cloud composition measureCloud reads here —
            // the staged-scoring switch to same-plus-adjacent
            // happens later, at shrink-stage entry, so every
            // reading in this loop is like-for-like). After each
            // throw the standing crossing number is measured
            // fresh; the drop is (before - after) / before. A
            // drop of MORE than SX_SCORE.THROW_REPEAT_DROP
            // (75%) is substantial and stops the repetition;
            // otherwise the throw runs again, up to
            // SX_SCORE.THROW_REPEAT_MAX_EXTRA (3) extra times —
            // four throws total. A throw whose phase gate trips
            // and backs up leaves the last kept geometry
            // standing, and the fresh measurement reads that
            // standing geometry, so a backed-up repeat simply
            // shows no further drop. An unmeasurable crossing
            // (before or after not a positive finite number)
            // cannot be judged, so the loop stops after that
            // throw rather than repeating blind. Every check is
            // recorded in dkLog and on report.throwRepeat
            // (fields added only) for the receipt.
            const throwBefore = report.baseline && Number.isFinite(report.baseline.first) ? report.baseline.first : null;
            const throwRec = { before: throwBefore, attempts: [], throws: 0, substantial: !1, finalAfter: null };
            report.throwRepeat = throwRec;
            for (let attempt = 1; attempt <= 1 + SX_SCORE.THROW_REPEAT_MAX_EXTRA; attempt++) {
                await stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                throwRec.throws = attempt;
                let after = null;
                try { after = await dk.measureCloud(name); } catch (e) { after = null; }
                const drop = null != throwRec.before && throwRec.before > 0 && null != after && Number.isFinite(after) ? (throwRec.before - after) / throwRec.before : null;
                const substantial = null != drop && drop > SX_SCORE.THROW_REPEAT_DROP;
                throwRec.attempts.push({ attempt: attempt, after: after, drop: drop, substantial: substantial });
                throwRec.finalAfter = after, throwRec.substantial = substantial;
                dkLog.push({ type: "throw-repeat-check", branch: name, attempt: attempt, before: throwRec.before, after: after, drop: drop, substantial: substantial });
                if (substantial || null == drop) break;
            }
            if (throwRec.throws > 1) dkLog.push({ type: "throw-repeat", branch: name, throws: throwRec.throws, before: throwRec.before, after: throwRec.finalAfter, substantial: throwRec.substantial });
        }
        let diagPhaseOrdinal;
        let diagPaintCount;
        let diagFitSubcatsCount;
        let diagPaintBase;
        let diagAcceptCtx;
        let prevPhaseCloud;
        let witnessThrown;
        let witnessPaintedLastKept;
        async function runPhase(phaseName, patch, logStart, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // E6: yield at the phase boundary BEFORE the phase's
            // synchronous apply, so UI state set before the call
            // (busy spinner, readout, driven-control refresh) can
            // paint between phases.
            await yieldNow();
            // Q1: heartbeat at the phase's start, so the
            // readout names the phase being solved from its
            // first moment, not only once it commits.
            if (opts && "function" == typeof opts.onHeartbeat) {
                try {
                    opts.onHeartbeat({ phase: phaseName, phaseElapsedMs: 0, iterations: 0 });
                } catch (e) {}
            }
            const res = dk.applyPhase(patch, phaseName);
            if (!res || !res.ok) throw new Error("phase '" + phaseName + "' rejected by ratio validation" + (res && res.rejected ? ": " + JSON.stringify(res.rejected) : ""));
            await yieldNow();
            const entries = dkLog.slice(logStart), phaseEntry = entries.find(e => "phase" === e.type && e.phase === phaseName), ratios = phaseEntry ? phaseEntry.ratios : { branch: {}, subcat: {}, kink: {} }, now = dkDeliveredRadii(name), subRatios = [], kinkRatios = [];
            Object.keys(now.items).forEach(k => {
                const pre = preDelivered.items[k], cur = now.items[k];
                if (!(pre > 0) || !Number.isFinite(cur)) return;
                "subcat" === k.split("|")[0] ? subRatios.push(cur / pre) : kinkRatios.push(cur / pre);
            });
            const record = {
                name: phaseName,
                requestedRatios: {
                    branch: null != ratios.branch[name] ? ratios.branch[name] : null,
                    subcatMedian: dkMedian(tax.subLabels.map(l => ratios.subcat[l]).filter(v => null != v)),
                    kinkMedian: dkMedian(tax.kinkIds.map(id => ratios.kink[id]).filter(v => null != v))
                },
                deliveredRatios: {
                    branch: preDelivered.branch > 0 && Number.isFinite(now.branch) ? now.branch / preDelivered.branch : null,
                    subcatMedian: dkMedian(subRatios),
                    kinkMedian: dkMedian(kinkRatios)
                },
                deliveredRanges: { subcat: dkRange(subRatios), kink: dkRange(kinkRatios) },
                limiterHits: entries.filter(e => "phase" !== e.type),
                // STAGED SCORING (ruled 2026-11-02, Jason):
                // the scoring stage this phase's cloud was
                // judged under — false until the whole run
                // enters its shrink stage, true from the
                // first shrink phase on.
                stagedAdjacent: !!(sxAnnealStageCtx && sxAnnealStageCtx.adjacent),
                cloud: null
            };
            // Q2: this phase's fit-deviation count, broken
            // out of the limiter hits so it can be surfaced
            // per phase and in the receipt lead.
            record.fitDeviationCount = dkFitDeviationCount(record.limiterHits);
            // Cascade containment (Stage 3, T6): the phase
            // commit's scoped outcome — declared ring,
            // frozen count, dropped counters, boundary
            // count, or the declared fallback when a commit
            // ran unscoped — rides in the phase record
            // beside the limiter hits. (The full boundary
            // log stays in dkLog's "scoped-apply" entry,
            // which the limiter-hit slice above carries.)
            record.scoped = res && res.scoped ? {
                scoped: res.scoped.scoped,
                ring: res.scoped.ring,
                frozenCount: res.scoped.frozenCount,
                dropped: res.scoped.dropped,
                boundaryCount: (res.scoped.boundaryLog || []).length,
                fallback: res.scoped.fallback
            } : null;
            // E6: the phase's running cloud value, when the
            // metric hook can supply it. Q4: record.cloud is
            // the DECIDER — the branch's own-cloud crossing
            // number via the repointed measureCloud readout.
            // (The phase's former xAreaCross ride-along was
            // removed from observation with the area metric,
            // M1 2026-10-29; its commented-out copy was deleted
            // in 2026-10-30.)
            try { record.cloud = await dk.measureCloud(name); } catch (e) { record.cloud = null; }
            report.phases.push(record);
            // DIAG-00 / REGISTRY / ON-DEMAND PAINT (ruled
            // 2026-11-01, Jason): the registry snapshot logs
            // here — after the commit and the cloud
            // measurement, BEFORE the gate decision below,
            // so tripped stages are snapshotted too — and
            // the on-demand full paint fires here on its
            // exact trigger: the 3rd runPhase commit of the
            // fit-subcats ladder, and every 5th runPhase
            // commit thereafter counting across ALL ladders
            // (throw excluded; the count is the runPhase
            // ordinal, not a per-node stage number), painted
            // after commit/measurement and before the gate
            // decision, tripped stages included. The registry
            // snapshot is measurement only; the paint is
            // gated by opts.onDemandFullPaint (session-only,
            // default OFF) and changes no decision input.
            diagPhaseOrdinal += 1;
            const diagStamp = "runPhase-" + diagPhaseOrdinal + ":" + phaseName;
            if (opts && opts.diag00) { try { diagRegistrySnapshot(diagStamp, diagPhaseOrdinal, phaseName, patch, record, now, prevPhaseCloud, dk, name, tax, report); } catch (e) {} }
            if ("throw" !== phaseName) {
                diagPaintCount += 1;
                let diagTrigger = !1;
                if (/^fit-subcats-\d+$/.test(phaseName)) { diagFitSubcatsCount += 1; if (3 === diagFitSubcatsCount) { diagTrigger = !0, diagPaintBase = diagPaintCount; } } else if (null != diagPaintBase && diagPaintCount > diagPaintBase && 0 === (diagPaintCount - diagPaintBase) % 5) diagTrigger = !0;
                if (diagTrigger && opts && opts.onDemandFullPaint) { try { await diagOnDemandPaint(diagStamp, diagPaintCount, phaseName, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
            }
            // E6: opts.onPhase fires after the phase commits,
            // with the phase's summary (phase name, requested /
            // delivered ratios, limiter hits, running cloud).
            // A throwing callback is logged, never fatal.
            if (opts && "function" == typeof opts.onPhase) {
                try {
                    await opts.onPhase({ phase: record.name, name: record.name, branch: name, requestedRatios: record.requestedRatios, deliveredRatios: record.deliveredRatios, deliveredRanges: record.deliveredRanges, limiterHits: record.limiterHits, cloud: record.cloud, fitDeviationCount: record.fitDeviationCount, scoped: record.scoped || null });
                } catch (e) {
                    dkLog.push({ type: "onphase-error", phase: record.name, message: String(e && e.message || e) });
                }
            }
            // Q2 PER-PHASE GATE, trip consequence ruled
            // 2026-10-28 (BACK-UP-A-STEP, all phases): this
            // phase's cloud metric against the previous kept
            // phase's (the baseline for the first phase), on
            // the existing record.cloud readout. A regression
            // beyond tolerance — flat GATE_TOL (2) — no longer unwinds the run:
            // the tripping step is discarded, the last-kept
            // phase snapshot is restored (the pre-run
            // snapshot only if nothing has committed yet),
            // and the caller stops that level's ladder while
            // the cascade continues to the next level. The
            // trip and its back-up are recorded on the phase
            // record and the report (tripped ratios, restored
            // ratios, backed-up flag); the final
            // improve-or-hold gate below still judges the
            // end state exactly as before and is the only
            // whole-run revert left.
            if (null != prevPhaseCloud && null != record.cloud && Number.isFinite(prevPhaseCloud) && Number.isFinite(record.cloud)) {
                const gateTol = SX_SCORE.GATE_TOL;
                if (record.cloud > prevPhaseCloud + gateTol) {
                    const trippedRatios = { requested: record.requestedRatios, delivered: record.deliveredRatios };
                    // BACK-OUT CONFIRMATION GATE (ruled 2026-11-01,
                    // Jason): when the shell supplies
                    // opts.onBackoutGate, a trip in THIS branch
                    // (category) shrink ladder — phase fit-branch-*
                    // only; subcategory / kink / growth / final
                    // trips never reach this gate — PAUSES here,
                    // BEFORE restoreKept reverts any geometry, and
                    // asks. The tripped trial geometry stands on
                    // screen while the confirmation is open; the
                    // phase budget is only polled inside a phase's
                    // iterations, so no timeout can fire while the
                    // run waits. The gate info carries a code
                    // naming this exact check in code (runPhase's
                    // per-phase gate trip, ahead of restoreKept),
                    // the branch, the phase, and the crossing
                    // before (last kept) and after (tripped).
                    // ACCEPT (or no gate supplied, or the gate
                    // callback failing): exactly today's path —
                    // restoreKept below reverts to the last kept
                    // shape and the caller ends the run as a
                    // category back-out. REJECT: restoreKept is
                    // NOT called — the tripped trial geometry is
                    // left standing — and the returned marker
                    // (dkGateRejected) makes the caller end the
                    // run on the rejection, with no growth, no
                    // final patch and no final gate after it.
                    let gateCode = null, gateDecision = null;
                    if (/^fit-branch-\d+$/.test(phaseName) && opts && "function" == typeof opts.onBackoutGate) {
                        gateCode = "ANNEAL-BO-01 · runPhase per-phase gate → restoreKept · " + phaseName;
                        try { gateDecision = await opts.onBackoutGate({ code: gateCode, branch: name, phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol }); } catch (e) { gateDecision = null; }
                        dkLog.push({ type: "backout-gate", phase: phaseName, code: gateCode, decision: "reject" === gateDecision ? "rejected" : "accepted", prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol });
                        report.backoutGate = { code: gateCode, branch: name, phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol, decision: "reject" === gateDecision ? "rejected" : "accepted" };
                    }
                    if (gateCode && "reject" !== gateDecision) {
                        diagAcceptCtx = { phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol };
                        await diagPause("ANNEAL-DIAG-01", "Accept \u2192 restoreKept", undefined, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                    }
                    if ("reject" === gateDecision) {
                        record.phaseGate = { prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !1, gated: !0, decision: "rejected", code: gateCode, trippedRatios: trippedRatios }, report.phaseGate = { phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !1, gated: !0, decision: "rejected", code: gateCode, trippedRatios: trippedRatios };
                        const standingNow = dkDeliveredRadii(name);
                        standingNow.dkPhaseTripped = !0, standingNow.dkGateRejected = !0;
                        return standingNow;
                    }
                    restoreKept("final" === phaseName, dk, snapshot, name);
                    await diagPause("ANNEAL-DIAG-02", "restoreKept \u2192 closing full paint", undefined, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                    const restoredNow = dkDeliveredRadii(name), rSub = [], rKink = [];
                    Object.keys(restoredNow.items).forEach(k => {
                        const pre = preDelivered.items[k], cur = restoredNow.items[k];
                        if (!(pre > 0) || !Number.isFinite(cur)) return;
                        "subcat" === k.split("|")[0] ? rSub.push(cur / pre) : rKink.push(cur / pre);
                    });
                    const restoredRatios = {
                        branch: preDelivered.branch > 0 && Number.isFinite(restoredNow.branch) ? restoredNow.branch / preDelivered.branch : null,
                        subcatMedian: dkMedian(rSub),
                        kinkMedian: dkMedian(rKink)
                    };
                    let restoredCloud = null;
                    try { restoredCloud = await dk.measureCloud(name); } catch (e) { restoredCloud = null; }
                    record.phaseGate = { prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !0, trippedRatios: trippedRatios, restoredRatios: restoredRatios, restoredCloud: restoredCloud }, report.phaseGate = { phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !0, trippedRatios: trippedRatios, restoredRatios: restoredRatios, restoredCloud: restoredCloud };
                    dkLog.push({ type: "phase-gate-backup", phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, restoredCloud: restoredCloud });
                    witnessRestore("gate-backup-restored", phaseName, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                    restoredNow.dkPhaseTripped = !0;
                    return restoredNow;
                }
            }
            null != record.cloud && Number.isFinite(record.cloud) && (prevPhaseCloud = record.cloud);
            captureKept(dk, refreshKeptFit, name);
            const wFrame = witnessFrame("phase-kept", phaseName, now, witnessSubs, name, report, dk);
            "throw" === phaseName && (witnessThrown = wFrame.subs);
            // PAINTED-GEOMETRY WITNESS: the last kept phase's
            // painted capture. During the run the full-map
            // DOM still holds the last full paint (interim
            // commits paint only the capsule approximation),
            // so this frame records the painted domain as it
            // stands at this phase — the divergence between
            // it and the bookkeeping frame above is itself
            // recorded, and the decisive painted frames are
            // the closing-paint and settle frames in the
            // finally block.
            witnessPaintedLastKept = witnessPaintedFrame("last-kept:" + phaseName, "phase commit '" + phaseName + "' kept (interim capsule domain; full-map DOM holds the last full paint)", dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            return now;
        }
        let witnessTrippingLabel;
        async function stepShrinkLadders(name, report, dk, fineTuneActive, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, opts, tax, diagCaptureFields, onsetCheck) {
            // STAGED SCORING SWITCH (ruled 2026-11-02, Jason): this
            // step IS the whole run's shrink stage — the single
            // run-level entry point every run passes through after
            // the throw (or the fine-tune arming), on the normal
            // path and the skip-throw path alike. Entering it flips
            // the run's judged score from same-branch-only to
            // same-plus-adjacent (radial neighbours), and the
            // per-phase gate's reference is RE-BASED on the current
            // (last-kept) geometry under the new composition, so
            // the first shrink phase is judged against the same
            // composition it is scored under — descent and judge
            // agree across the switch. Every later judged read in
            // the run (shrink phases, back-out restored readings,
            // the final patch's measurement and the final gate)
            // uses the new composition through measureCloud.
            if (sxAnnealStageCtx && sxAnnealStageCtx.branch === name) {
                sxAnnealStageCtx.adjacent = !0, report.stagedScoring.adjacentFromPhase = "fit-subcats-1";
                dkLog.push({ type: "staged-scoring-switch", branch: name, stage: "same-plus-adjacent", at: "shrink-stage-entry" });
                try {
                    const rebased = await dk.measureCloud(name);
                    null != rebased && Number.isFinite(rebased) && (prevPhaseCloud = rebased, report.stagedScoring.rebasedAtShrinkEntry = rebased);
                } catch (e) {}
            }
            // (5) RULED SHRINK SEQUENCE (Jason, 2026-10-24
            // adjustment — supersedes the 08:05 order and every
            // earlier ordering; one-at-a-time step-down added
            // 2026-10-31, Jason). After the throw, shrink in
            // exactly this order: (1) the subcategory nodes
            // step down ONE AT A TIME within the branch, each
            // in geometric fashion down to THREE TIMES its
            // kink length (3x its fit target —
            // SHRINK_FLOOR_FACTOR, ruled 2026-11-01, Jason)
            // or until collisions start, in
            // which case it backs up a step and the next node
            // takes its turn; (2) the same step-down process
            // is then repeated for the category — the main
            // branch steps down geometrically to its floor,
            // backing up a step when collisions start. There
            // is NO kink shrink stage: kinks keep their thrown,
            // fit-capped lengths (the fit cap at 3x the kink
            // length since the 2026-11-01 ruling), and no code
            // here restores kink overrides to pre-run lengths.
            // Each ladder descends in square-root steps
            // (dkLadderSteps / dkLadderValue — step sizes in
            // proportion to the square root of the steps
            // remaining, largest first, fixed count landing
            // exactly on the floor; ruled 2026-11-02, Jason),
            // one committed sub-solve per stage,
            // stopping at its floor OR at collision onset (see
            // the onset rule above), whichever comes first.
            // Fit targets are FLOORS, not ceilings: every item
            // is first PINNED at its thrown radius, and only
            // its own ladder's stages advance it, so no stage
            // can chop a later node early or grow an item up
            // to a floor computed at thrown geometry. A node
            // whose ladder runs to its final stage also
            // restores its own length override at that stage
            // (an entry the snapshot lacks is removed) — the
            // old shorten commit's job, distributed per node;
            // for subcategories the restored value is the
            // fit-derived floor, not the pre-run snapshot
            // value (lever unification, ruled 2026-11-01
            // 20:25, Jason — see runLadder and the
            // fit-subcats restore below); the branch
            // ladder in step (2) IS the branch level's
            // restore, taken in log stages rather than one
            // commit. A node held by onset backs up a stage
            // (step-four ruling, 2026-10-31 — see onsetBackUp
            // below), so the lengths of the stage before the
            // tripping one stand. (On the skip-throw path
            // under 5 this back-up now applies too — re-ruled
            // 2026-11-01, Jason; see onsetBackUp's call sites
            // in the ladders below.) The cascade stays armed throughout.
            const restoreLen = (map, key, snapMap) => {
                null != snapMap && Object.prototype.hasOwnProperty.call(snapMap, key) ? map[key] = Object.assign({}, snapMap[key]) : delete map[key];
            };
            dk.armFitForBranch(name);
            const fullFitTargets = {}, stageFrom = {}, fitNow = dk.fitTargets();
            Object.keys(fitNow).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && (fullFitTargets[k] = fitNow[k]);
            }), dkFitBranchItems(name).forEach(w => {
                const k = dkRadialBaseInfo(w).key;
                Number.isFinite(w.cloudRadius) && (stageFrom[k] = w.cloudRadius);
            }), Object.keys(fullFitTargets).forEach(k => {
                Number.isFinite(stageFrom[k]) && dk.setFitTarget(k, stageFrom[k]);
            });
            // Back-up-a-step fit coherence: the armed + pinned
            // registry above is the fit state the first ladder
            // stage builds on, so it becomes the kept fit state
            // paired with the post-throw kept layout — a first
            // stage trip then restores a registry the rest of
            // the cascade (and the final patch's carry) can
            // still read, not the empty pre-arming one.
            refreshKeptFit(dk, name);
            // STEP-FOUR BACK-UP (ruled 2026-10-31, Jason): in
            // the shrink step, when collisions start — the
            // onset hold trips — the stage backs up a stage:
            // the last-kept state from BEFORE the tripping
            // stage is restored (layout and fit registrations
            // together), the ladder stops, and the cascade
            // proceeds from the backed-up state. This applies
            // to BOTH levels — the subcategory ladder and the
            // category (branch) ladder. It replaces the older
            // onset rule under which the tripping stage's
            // commit stood. The fine-tune skip path was
            // formerly excepted (its tripping commit stood);
            // the 2026-11-01 skip-throw re-ruling removed
            // that exception — the ladders call this on the
            // skip path too, so a subcategory back-out backs
            // up a step there exactly as here. An onset
            // back-up is NOT a category back-out: it never
            // sets branchBackedOut and never ends the run.
            const onsetBackUp = async (levelName, stage, keptBefore) => {
                lastKeptSnapshot = keptBefore.snap, lastKeptFit = keptBefore.fit, restoreKept(!1, dk, snapshot, name);
                let restoredCloud = null;
                try { restoredCloud = await dk.measureCloud(name); } catch (e) { restoredCloud = null; }
                null != restoredCloud && Number.isFinite(restoredCloud) && (prevPhaseCloud = restoredCloud);
                const holdsArr = fineTuneActive ? report.fineTune.holds : report.onset.holds, lastHold = holdsArr[holdsArr.length - 1];
                lastHold && (lastHold.backedUp = !0, lastHold.restoredCloud = restoredCloud);
                const rec = report.phases[report.phases.length - 1];
                rec && rec.onsetHold && (rec.onsetHold.backedUp = !0, rec.onsetHold.restoredCloud = restoredCloud);
                rec && rec.fineTuneHold && (rec.fineTuneHold.backedUp = !0, rec.fineTuneHold.restoredCloud = restoredCloud);
                witnessRestore("onset-backup-restored", levelName + "-" + stage, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                dkLog.push({ type: "onset-backup", level: levelName, stage: stage, restoredCloud: restoredCloud });
            };
            const runLadder = async (levelName, keys, restore, floors) => {
                if (!keys.length) return;
                // ONE AT A TIME (ruled 2026-10-31, Jason): the
                // level's nodes step down one at a time, not
                // in lockstep — each node descends its own
                // ladder in square-root steps (dkLadderSteps /
                // dkLadderValue, one
                // committed sub-solve per stage) all the way
                // down to its floor — for subcategories, THREE
                // TIMES its own length (SHRINK_FLOOR_FACTOR,
                // ruled 2026-11-01, Jason) — before the next
                // node starts. When collisions
                // start on a node's ladder — the onset hold
                // trips — that node backs up a step
                // (onsetBackUp, the step-four ruling) and its
                // ladder stops; the next node then takes its
                // turn from the backed-up state. A per-phase
                // gate trip likewise ends only that node's
                // ladder. At a node's final stage its own
                // length override is restored to its pre-run
                // snapshot value (restore(patch, k) below).
                let stageNo = 0;
                for (const k of keys) {
                    const floorFor = floors && null != floors[k] ? floors[k] : fullFitTargets[k], isSub = "subcat" === k.split("|")[0], subLabel = isSub ? k.split("|")[2] : null;
                    let outcome = null, stagesRun = 0;
                    // 3X-FLOOR ATTEMPT PRE-CHECK (repair,
                    // 2026-11-01; floors re-ruled to 3x the same
                    // day; override floor unified with the fit
                    // floor 2026-11-01 20:25, Jason): a
                    // subcategory is held without
                    // a ladder only when BOTH of its levers are
                    // already at their floors — its fit radius
                    // at or below THREE TIMES its name length
                    // AND its length override at or below the
                    // fit-derived floor (oFloorFor below: that
                    // same 3x name-length fit floor converted
                    // into override units).
                    // A node with no thrown radius and no
                    // override to step down is likewise recorded,
                    // never passed over in silence.
                    const curSnap0 = isSub ? dk.snapshot() : null, thrownEntry = curSnap0 && curSnap0.subcatOverrides ? curSnap0.subcatOverrides[subLabel] : null, thrownLen = thrownEntry && Number(thrownEntry.length) > 0 ? Number(thrownEntry.length) : NaN, preEntry = isSub && snapshot.subcatOverrides ? snapshot.subcatOverrides[subLabel] : null, preLen = preEntry && Number(preEntry.length) > 0 ? Number(preEntry.length) : (isSub ? dkBakedSubBase(subLabel || "") : NaN), fitSteps = Number.isFinite(stageFrom[k]) && Number.isFinite(floorFor) && floorFor < stageFrom[k] ? dkLadderSteps(stageFrom[k], floorFor) : 0;
                    // LEVER UNIFICATION (ruled 2026-11-01
                    // 20:25 CST, Jason): the fit lever and the
                    // override lever do the same job and are
                    // now the same thing — ONE floor, the
                    // fit-length floor (floorFor: THREE TIMES
                    // the name length), drives both. The
                    // override's floor is DERIVED from that
                    // fit floor through the item's pre-run
                    // delivered radius, exactly as the branch
                    // ladder's floor and the kink
                    // shrink-to-label driver convert a
                    // rendered fit target into an override
                    // length (afterLength = curLen x target /
                    // delivered, with curLen the pre-run
                    // length — preLen here — and delivered
                    // the pre-run delivered segment,
                    // preDelivered.items[k] here). The
                    // override lever's old separate floor —
                    // THREE TIMES the pre-run length — is
                    // retired for subcategories: with the
                    // paint following the override
                    // (segment = pre-override length x
                    // override, floored at 430 in drawH /
                    // capture), that separate floor stopped
                    // the painted segment at 430 x 3 x the
                    // pre-run length no matter how far the
                    // fit target descended. Derived from the
                    // fit floor instead, the override descends
                    // in lockstep with the fit target, and at
                    // the floor the painted segment stands at
                    // the fit-derived length (the fit floor
                    // itself, through the paint's own
                    // pre-override length). When the
                    // conversion inputs are not all finite
                    // and positive the derived floor is NaN
                    // and the override ladder does not run
                    // for that node (the fit ladder still
                    // does); every rendered subcategory has a
                    // pre-run delivered radius, so this is a
                    // guard, not an expected path.
                    const oFloorFor = isSub && Number.isFinite(preLen) && preLen > 0 && Number.isFinite(floorFor) && floorFor > 0 && preDelivered && preDelivered.items && Number.isFinite(Number(preDelivered.items[k])) && Number(preDelivered.items[k]) > 0 ? preLen * floorFor / Number(preDelivered.items[k]) : NaN, oSteps = Number.isFinite(thrownLen) && Number.isFinite(oFloorFor) && thrownLen > oFloorFor ? dkLadderSteps(thrownLen, oFloorFor) : 0;
                    if (isSub && floors) {
                        if (!Number.isFinite(stageFrom[k]) && oSteps <= 0) outcome = "no-thrown-radius"; else if (!Number.isFinite(floorFor) && oSteps <= 0) outcome = "no-floor-target"; else if (fitSteps <= 0 && oSteps <= 0) outcome = "held-at-1x-floor";
                    }
                    if (!outcome) {
                    const fitStages = Math.min(DK_LADDER_MAX_STAGES, fitSteps), oStages = Math.min(DK_LADDER_MAX_STAGES, oSteps), stages = Math.max(fitStages, oStages);
                    // ONE LEVER, ONE LADDER (repair,
                    // 2026-11-01; unified 2026-11-01 20:25,
                    // Jason): a subcategory's DRAWN spoke is
                    // its fit radius stepped out by its length
                    // override (renderedSpokeLength multiplies
                    // by the override), so the fit ladder alone
                    // barely moves the visible spoke — the
                    // override is the thrown length (x20 at the
                    // throw). Each stage therefore steps BOTH
                    // writings on their own square-root-step
                    // ladders (dkLadderSteps / dkLadderValue),
                    // in lockstep, toward the ONE floor: the
                    // fit target down to THREE TIMES the NAME
                    // length (SHRINK_FLOOR_FACTOR, ruled
                    // 2026-11-01, Jason), the override down to
                    // oFloorFor — that same fit floor derived
                    // into override units through the item's
                    // pre-run delivered radius (see the
                    // derivation at oFloorFor above) — the
                    // longer ladder setting the stage count
                    // and the shorter holding at its floor
                    // once reached. Before the 2026-11-01
                    // repair the override moved only in the
                    // final stage's restore jump, so a node
                    // held before its final stage (onset or
                    // gate) kept its full thrown override and
                    // stood visibly unshrunk — the long
                    // subcategory branches of the 2026-11-01
                    // inspection. Now a held node stands at
                    // its last kept step, one step above the
                    // tripping stage after the back-up.
                    for (let j = 1; j <= stages; j++) {
                        const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                        witnessTrippingLabel = isSub ? subLabel : null;
                        if (fitSteps > 0) dk.setFitTarget(k, dkLadderValue(stageFrom[k], floorFor, Math.min(j, Math.max(1, fitStages)), Math.max(1, fitSteps)));
                        const patch = dk.snapshot();
                        if (isSub && oSteps > 0 && patch.subcatOverrides) patch.subcatOverrides[subLabel] = Object.assign({}, patch.subcatOverrides[subLabel], { length: dkLadderValue(thrownLen, oFloorFor, Math.min(j, Math.max(1, oStages)), Math.max(1, oSteps)) });
                        j === stages && restore && restore(patch, k), mark = dkLog.length, stageNo += 1, stagesRun = j;
                        const ladderRes = await runPhase(levelName + "-" + stageNo, patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                        // A gate trip AT the final stage is the ruled
                        // completion: the node descended its whole
                        // ladder and stands at its last kept step.
                        // Only a trip before the final stage
                        // leaves the node held above its floor.
                        if (ladderRes && ladderRes.dkPhaseTripped) { outcome = j >= stages ? "reached-1x-floor" : "held-gate"; break; }
                        // Phase 4 (2026-11-04): onsetCheck is a no-op.
                        // The onset and fine-tune margins are deleted.
                        // Only the per-phase gate above rejects a stage.
                        onsetCheck(levelName, stageNo);
                    }
                    if (isSub && floors && !outcome) outcome = "reached-1x-floor";
                    }
                    if (isSub && floors) {
                        // The record reports the OVERRIDE
                        // writing — the thrown length that
                        // actually renders (thrown x20 down to
                        // oFloorFor, the fit-derived floor) —
                        // with the fit lever's 3x name target
                        // kept alongside as fitFloor. (Before
                        // the 2026-11-01 20:25 unification the
                        // reported floor was the override's own
                        // separate 3x pre-run floor.)
                        const rec = { key: k, label: subLabel || k, from: Number.isFinite(thrownLen) ? thrownLen : (Number.isFinite(stageFrom[k]) ? stageFrom[k] : null), floor: Number.isFinite(oFloorFor) ? oFloorFor : (Number.isFinite(floorFor) ? floorFor : null), fitFrom: Number.isFinite(stageFrom[k]) ? stageFrom[k] : null, fitFloor: Number.isFinite(floorFor) ? floorFor : null, stages: stagesRun, outcome: outcome || "reached-1x-floor", standing: (outcome && 0 === outcome.indexOf("held") && Number.isFinite(thrownLen) && oSteps > 0) ? dkLadderValue(thrownLen, oFloorFor, Math.max(0, stagesRun - 1), Math.max(1, oSteps)) : (Number.isFinite(thrownLen) ? thrownLen : null) };
                        report.subcatShrink.push(rec), dkLog.push(Object.assign({ type: "subcat-shrink-attempt" }, rec));
                    }
                }
            };
            const ladderKeys = Object.keys(fullFitTargets).filter(k => Number.isFinite(stageFrom[k]));
            // EVERY RENDERED SUBCATEGORY IS ATTEMPTED (repair,
            // ruled 2026-11-01 01:44, Jason): the attempt list
            // is built from the branch's rendered subcategory
            // items, not only from the fit keys that happened
            // to arm — a subcategory whose fit target could not
            // be computed still gets a 3x-length floor and a
            // recorded attempt in runLadder, so no rendered
            // subcategory can pass through the cascade
            // unattempted and unrecorded. The floor for this
            // level is THREE TIMES the NAME length
            // (dkNameFitTargetForKey x SHRINK_FLOOR_FACTOR,
            // ruled 2026-11-01, Jason — superseding the 1x
            // name-length floor of 2026-11-01 01:44), not the
            // neighbour-pitch fit target in
            // fullFitTargets: in a crowded fan that target can
            // sit at or above the thrown radius and hold the
            // node at its thrown length. A subcategory that
            // never armed is pinned at its thrown radius here,
            // exactly as the armed items are pinned above, so
            // its ladder's first stage has a starting target.
            const subcatKeys = [], subcatFloors = {};
            dkFitBranchItems(name).forEach(w => {
                if (!w.topic || !w.topic.isSubcategory) return;
                const k = dkRadialBaseInfo(w).key;
                if (subcatKeys.indexOf(k) >= 0) return;
                subcatKeys.push(k);
                const nt = dkNameFitTargetForKey(k);
                // SUBCATEGORY FIT FLOOR = 3 x the subcategory
                // name length (SHRINK_FLOOR_FACTOR) — this is
                // the floorFor endpoint the fit ladder in
                // runLadder descends to via dkLadderSteps /
                // dkLadderValue(stageFrom[k], floorFor, ...).
                const subcatFitFloor1x = null != nt && Number.isFinite(nt) ? nt * SX_SCORE.SHRINK_FLOOR_FACTOR : (null != fullFitTargets[k] && Number.isFinite(fullFitTargets[k]) ? fullFitTargets[k] * SX_SCORE.SHRINK_FLOOR_FACTOR : fullFitTargets[k]);
                subcatFloors[k] = subcatFitFloor1x;
                if (null == fullFitTargets[k] && Number.isFinite(stageFrom[k])) dk.setFitTarget(k, stageFrom[k]), fullFitTargets[k] = stageFrom[k];
            });
            // Ruled step (1) (one at a time, ruled 2026-10-31,
            // Jason): the subcategory nodes step down FIRST,
            // one at a time — each node descends its own
            // geometric ladder to its 3x floor (three times
            // its own length — SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason) before the next node starts,
            // onset-held: when collisions start on a node's
            // ladder it backs up a step (onsetBackUp inside
            // runLadder) and the next node takes its turn.
            // Kinks have no ladder at all — they keep their
            // thrown, fit-capped lengths (cap at 3x the kink
            // length). The final-stage restore below stands
            // the override at the FIT-DERIVED floor — the
            // node's 3x name-length fit floor (subcatFloors)
            // converted through its pre-run delivered
            // radius with the snapshot entry's length (or
            // the baked base when the snapshot carries
            // none) as curLen — the same derived value the
            // ladder's last stage writes (lever
            // unification, ruled 2026-11-01 20:25, Jason;
            // it replaces the restore's former THREE TIMES
            // the pre-run length, the override lever's old
            // separate floor). When the conversion inputs
            // are unavailable for a node the former 3x
            // pre-run value stands as the guard fallback.
            await runLadder("fit-subcats", subcatKeys, (patch, k) => { const l = k.split("|")[2]; if (null != l) { const se = snapshot.subcatOverrides ? snapshot.subcatOverrides[l] : null, sb = se && Number(se.length) > 0 ? Number(se.length) : dkBakedSubBase(l); const ff = subcatFloors ? subcatFloors[k] : null, pd = preDelivered && preDelivered.items ? Number(preDelivered.items[k]) : NaN, derived = sxLenConvert(sb, pd, ff); patch.subcatOverrides[l] = Object.assign({}, se || {}, { length: Number.isFinite(derived) && derived > 0 ? derived : sb * SX_SCORE.SHRINK_FLOOR_FACTOR }); } }, subcatFloors);
            // Ruled step (2): the branch's own length override
            // descends geometrically from its thrown length to
            // its pre-run length (the baked base when the
            // snapshot carries no override for it), onset-held:
            // a stage whose commit trips onset is the branch
            // ladder's last. (Step-four back-up, ruled
            // 2026-10-31: that stage now backs up a stage —
            // the previous stage's length stands and the
            // final patch below carries THAT through. Before
            // this ruling the tripping stage's length stood.)
            // TERMINATION FLAG (ruled 2026-10-28, Jason 23:43,
            // scope confirmed 23:49): a per-phase GATE trip in
            // THIS branch (category) ladder — a back-out, where
            // runPhase discarded the tripping stage and restored
            // the last-kept snapshot — is reported to the caller
            // as branchBackedOut, and the caller ENDS the run on
            // it (no growth, no final patch, no final gate; the
            // backed-out state stands). An ONSET hold in this
            // ladder is NOT a back-out (the tripping commit
            // stands, nothing is restored) and never sets this
            // flag; a subcategory-ladder back-out never sets it
            // either — runLadder's trips stay inside that level
            // and the cascade proceeds to this ladder as before.
            let branchBackedOut = !1, branchGateRejected = !1;
            const branchCur = (dk.snapshot().branchOverrides || {})[name], branchSnap = snapshot.branchOverrides ? snapshot.branchOverrides[name] : null;
            let branchFrom = branchCur ? Number(branchCur.length) : NaN, branchTo = branchSnap && Number(branchSnap.length) > 0 ? Number(branchSnap.length) : dkBakedBranchBase(name);
            // BRANCH LABEL-FIT FLOOR (first ruled 2026-10-29
            // 04:57 for the fine-tune skip path; generalized to
            // every run 2026-10-31, Jason): the ladder descends
            // toward the pre-run length by default, but Jason's
            // shrink rule is that it tries to shrink all the way
            // to the length of the category name — so this floor
            // now applies on every run, not only when the branch
            // starts at its pre-run length. The floor is
            // label-fit TIMES THREE (SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason — superseding the 1x floor):
            // three times the length of the branch's longest
            // kink name, from the existing label-fit mechanism
            // (dkComputeFitTarget — the item's own label measured
            // at its actual render font, font-relative). UNITS,
            // flagged as the ruling requires: fit targets are
            // RENDERED lengths in map units, while a branch
            // length override is a dimensionless multiplier on
            // the branch's delivered radius (yr) — the code's
            // units genuinely differ, so the floor converts
            // through the pre-run delivered branch radius exactly
            // as the existing kink shrink-to-label driver
            // converts its targets (afterLength = curLen x
            // target / delivered), with curLen the PRE-RUN length
            // (branchTo's value here, before the floor lowers
            // it). The governing item is the branch item with
            // the largest label-fit target: the branch spoke must
            // stay long enough that that kink's label still fits.
            // At 1x this floor could sit at or above the
            // pre-run length and the ladder then simply did
            // not run; at 3x the floor is the level's target
            // wherever it lands — the ladder descends to it
            // from the thrown length, and a branch standing
            // below it is set to it by the single-step path
            // below, exactly as the old pre-run target was.
            // The
            // descent still stops before the floor whenever
            // collisions start: the onset rule holds the level
            // when the cloud's crossing number rises (the
            // readout counts every crossing involving the
            // cloud's spokes — same-branch or foreign, any type
            // of collision), and a per-phase gate trip backs out
            // one step and ends the run per the termination
            // ruling above.
            {
                try {
                    let ftTarget = null, ftLabel = null;
                    dkFitBranchItems(name).forEach(w => {
                        const t = dkComputeFitTarget(dkRadialBaseInfo(w).key);
                        if (null != t && Number.isFinite(t) && (null == ftTarget || t > ftTarget)) {
                            ftTarget = t, ftLabel = w.child ? w.child.label : w.topic ? w.topic.label : w.label;
                        }
                    });
                    const ftCurLen = branchTo, ftDelivered = preDelivered.branch;
                    if (null != ftTarget && Number.isFinite(ftDelivered) && ftDelivered > 0 && ftCurLen > 0) {
                        // CATEGORY FLOOR = 3 x the category
                        // (label-fit) length: the 1x floor
                        // converted as before, times
                        // SHRINK_FLOOR_FACTOR. This ftFloor
                        // becomes branchTo below — the endpoint
                        // the branch ladder descends to via
                        // dkLadderSteps(branchFrom, branchTo) /
                        // dkLadderValue(branchFrom, branchTo, ...).
                        const ftFloor1x = ftCurLen * ftTarget / ftDelivered;
                        const ftFloor = ftFloor1x * SX_SCORE.SHRINK_FLOOR_FACTOR;
                        report.fineTune.branchFloor = { label: ftLabel || null, targetMapUnits: ftTarget, deliveredBranchMapUnits: ftDelivered, preRunLength: ftCurLen, floorLength: ftFloor, floorFactor: SX_SCORE.SHRINK_FLOOR_FACTOR };
                        dkLog.push({ type: "fine-tune-branch-floor", branch: name, label: ftLabel || null, target: ftTarget, delivered: ftDelivered, floorLength: ftFloor, floorFactor: SX_SCORE.SHRINK_FLOOR_FACTOR });
                        Number.isFinite(branchFrom) || (branchFrom = ftCurLen), ftFloor > 0 && (branchTo = ftFloor);
                    }
                } catch (e) {}
            }
            // 3X FLOOR FALLBACK (ruled 2026-11-01, Jason):
            // when no label-fit target could be computed
            // above, the category floor is three times the
            // branch's own pre-run length instead — the same
            // 3x rule on the only category length available.
            if (!(report.fineTune && report.fineTune.branchFloor) && Number.isFinite(branchTo) && branchTo > 0) branchTo = branchTo * SX_SCORE.SHRINK_FLOOR_FACTOR;
            if (Number.isFinite(branchFrom) && branchFrom > branchTo) {
                const bStages = Math.min(DK_LADDER_MAX_STAGES, Math.max(1, dkLadderSteps(branchFrom, branchTo)));
                for (let j = 1; j <= bStages; j++) {
                    const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                    witnessTrippingLabel = null;
                    const patch = dk.snapshot();
                    patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: dkLadderValue(branchFrom, branchTo, j, bStages) }), mark = dkLog.length;
                    const branchRes = await runPhase("fit-branch-" + j, patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                    if (branchRes && branchRes.dkPhaseTripped) { branchBackedOut = !0, branchRes.dkGateRejected && (branchGateRejected = !0); break; }
                    // Phase 4 (2026-11-04): onsetCheck is a no-op.
                    // Only the per-phase gate trip above ends this ladder.
                    onsetCheck("fit-branch", j);
                }
            } else if (Number.isFinite(branchFrom) && branchFrom !== branchTo) {
                const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                witnessTrippingLabel = null;
                const patch = dk.snapshot();
                patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: branchTo }), mark = dkLog.length;
                const branchRes1 = await runPhase("fit-branch-1", patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                if (branchRes1 && branchRes1.dkPhaseTripped) branchBackedOut = !0, branchRes1.dkGateRejected && (branchGateRejected = !0); else onsetCheck("fit-branch", 1); // no-op; gate above is the only stop
            }
                return { branchBackedOut: branchBackedOut, gateRejected: branchGateRejected };
            }
        async function dkRunCascade(branchName, opts) {
            const api = window.__SEXCAPADES_LAYOUT_API, dk = api.deknotter, name = null == branchName ? "" : String(branchName), tax = dkBranchTaxonomy(name);
            // F4 STEP 1a — label check (see the §5.11 note inside).
            const duplicates = stepLabelCheck();
            const report = {
                branch: name,
                labelCheck: { unique: !duplicates.length, duplicates: duplicates },
                preconditionsStaged: [],
                coverage: { actedOn: 0, totalInBranch: tax ? tax.total : 0 },
                baseline: { first: null, second: null, variance: null },
                phases: [],
                onset: { baseline: null, holds: [] },
                // FINE-TUNE (ruled 2026-10-29): skip-throw run record
                // — null-filled on a normal (throw) run; on a skip
                // run it carries the decision baseline, the arm
                // phase, the fine-tune holds, and the branch floor.
                fineTune: null,
                // STAGED SCORING (ruled 2026-11-02, Jason): this run's
                // scoring-stage record — the stage in force at run
                // start, the run-level switch point, the adjacent-
                // composition baseline captured on the pre-run
                // geometry for the final gate, and the phase the
                // switch landed in. Fields added only.
                stagedScoring: { stageAtStart: "same-branch-only", switchPoint: "shrink-stage-entry", adjacentFromPhase: null, baselineAdjacent: null },
                growth: null,
                // SUBCAT SHRINK ATTEMPTS (repair, 2026-11-01): one
                // record per rendered subcategory of this branch —
                // thrown radius, 3x length floor, stages run,
                // and the outcome (reached / held and why) — so a
                // run's receipt can prove every subcategory was
                // attempted and name any that was held.
                subcatShrink: [],
                // WITNESS DISCRIMINATOR (ruled 2026-11-01, Jason;
                // scope ruling 04:29 CST): per-subcategory delivered
                // radii captured frame by frame across every
                // back-out / restore of this run, judged ONLY
                // against the eyewitness hypothesis — a back-out
                // discarding per-subcategory shrink gains wholesale
                // (report.witness; helpers below). Fields added
                // only; no H1/H2/H3 fields are recorded.
                witness: { hypothesis: "wholesale-backout-discard", frames: [], events: [], verdict: "not-run", culprit: null, finalStep: null },
                // THROW RADII (conversion fix, 2026-11-01): the
                // throw's center-avatar radius, its world targets,
                // and the override lengths stepThrow converted
                // them into — recorded by stepThrow, null on a
                // skip-throw run. Fields added only.
                throwRadii: null,
                // Q4: the gate's decider is the branch's own-cloud
                // crossing number — baseline/finalCloud/delta below
                // (and every phase record's cloud) carry CROSSING
                // values under their existing names. Neighbor clouds'
                // crossing numbers are reported (baseline + final)
                // under neighbors, flagged reportedNotGated: no
                // neighbor value ever passes or fails this run.
                // The xAreaCross area used to be reported alongside,
                // explicitly secondary, in baseline.areaSecondary /
                // finalAreaSecondary / deltaAreaSecondary; those fields
                // and their measurements were removed with the area
                // observation (2026-10-29, M1) and the commented-out
                // copies were deleted (2026-10-30, paragraph-6
                // solver-metrics edit) so they cannot drift from the
                // live code — see the single record at measureCloud
                // below. In their place the report carries bakeGate
                // (M4): the total crossing number (this cloud plus
                // every neighbor cloud, combined) before -> after,
                // passing only when its increase is strictly less
                // than SX_SCORE.BAKE_GATE_LIMIT — reported for the
                // bake decision; this run's own gates are unchanged.
                metric: { decider: "crossingnumber" },
                neighbors: { reportedNotGated: !0, baseline: null, final: null },
                finalCloud: null,
                delta: null,
                bakeGate: null,
                plateau: null,
                gate: "reverted",
                reason: null
            };
            // BAKE GATE (M4, ruled 2026-10-29): the ONE computation of
            // the bake decision, called at both run endings (the
            // category back-out ending and the final patch) — the
            // limit and the comparison were previously written out
            // twice, once per ending. It sums the total crossing
            // number — this cloud plus every neighbor cloud,
            // combined — before and after, and passes only when the
            // increase is strictly less than
            // SX_SCORE.BAKE_GATE_LIMIT. Reported for the bake
            // decision; it does not gate this run. A failure to
            // compute leaves bakeGate null, exactly as the two
            // inline copies did.
            if (duplicates.length) report.labelCheck.note = "subcategory labels are keyed by bare label: arming a duplicated label arms it in every branch that bears it";
            if (!tax) {
                return report.reason = "unknown branch: " + (name || "(none)"), dkLog.push({ type: "run-report", report: report }), report;
            }
            // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31, Jason):
            // a live blit session at run start is ended BEFORE the
            // context opens, with one ordinary full paint — the
            // session's documented end ("any non-scoped paint") —
            // so its 20 s settle-guard timer can never fire
            // mid-run and fight the cascade's interim solves (the
            // guard's restore paints would replay a pre-session
            // capture over the run's delivered registry). With no
            // session active, nothing extra is painted.
            if (blitSess) {
                try {
                    Mr({
                        animate: !1,
                        forceRepaint: !0
                    });
                } catch (e) { __sxErrLog("layout-anneal-prerun-paint", e); }
            }
            if (!dk.begin({ branch: name, cap: 200, control: { onHeartbeat: opts && "function" == typeof opts.onHeartbeat ? opts.onHeartbeat : null, shouldCancel: opts && "function" == typeof opts.shouldCancel ? opts.shouldCancel : null } })) {
                return report.reason = "a DeKnotter context is already active", dkLog.push({ type: "run-report", report: report }), report;
            }
            snapshot = null;
            // Q2: the run's total fit-deviation count across every
            // phase record so far, for the report (and through it
            // the receipt lead).
            // WITNESS DISCRIMINATOR helpers (ruled 2026-11-01,
            // Jason; scope ruling 04:29 CST): this run investigates
            // ONLY the eyewitness report — the cloud scooches in
            // shortened, hits the collision mark, backs back out,
            // and then ALL subcategories stand back at extreme
            // (thrown) length instead of keeping the shortened
            // lengths of a frame before, as if a back-out threw out
            // every subcategory's shrink gains at once instead of
            // backing out one subcategory one step at a time. The
            // H1/H2/H3 options from diagnosis da3faf43
            // (floor-above-thrown, solve/paint re-expansion,
            // one-at-a-time back-out) are NOT investigated here and
            // no fields are recorded for them. Observational only:
            // frames are read from the delivered-radii readout the
            // phase records already use; nothing here writes layout
            // state, fit state, or any gate input, so the solve,
            // gates, receipts and scoped freeze are unchanged. One
            // frame per kept phase plus one after every restore
            // (per-phase gate back-up, onset back-up,
            // category-back-out disarm, final patch, whole-run
            // revert): a correct one-step back-out restores exactly
            // the last kept frame, so any subcategory a restore
            // moves — above all one it returns to its thrown
            // delivered radius when that subcategory was not the
            // tripping one — is the wholesale discard the witness
            // describes, and witnessJudge names it per event.
            const WITNESS_EPS = .02, WITNESS_ONE_STEP = 1.115;
            witnessLastFrame = null; witnessFrameSeq = 0; witnessThrown = null; witnessTrippingLabel = null;
            // FINAL-STEP WITNESS EXTENSION (ruled 2026-11-01,
            // Jason; refinement 07:30 CST): the eyewitness report
            // refined — the run pulls in almost perfectly until
            // the LAST step, and the last step flings the
            // subcategories back out. The back-out judge above
            // never sees that step: its last frame is the final
            // patch commit and its verdict is computed before the
            // closing full paint. This extension captures one
            // frame further, only around the final step: the
            // last kept phase, immediately before and after the
            // final patch commit, and one frame after the
            // closing full paint (in the finally block, once that
            // paint — settle search included — has run), and
            // judges each of those two transitions on its own:
            // a subcategory that grows past one ladder step
            // (WITNESS_ONE_STEP) across either transition was
            // flung, not stepped; two or more at once, or any
            // one returned to its thrown length, is the
            // wholesale fling the witness describes, and the
            // record names the transition — final patch commit
            // or closing full paint — that did it. Frames are
            // held by direct reference on report.witness
            // .finalStep, so the 600-frame cap on the frames
            // array can never drop them. Observational only,
            // exactly like the judge above: nothing here writes
            // layout state, fit state, or any gate input.
            witnessFinalLastKept = null; witnessFinalBefore = null; witnessFinalAfter = null; witnessFinalOperation = null; witnessFinalTripped = !1;
            // FINAL-STEP WITNESS judge (extension above): one
            // transition of the final step, before-frame against
            // after-frame. There is no tripping subcategory at
            // the final step — nothing there is entitled to move
            // a subcategory outward past one step — so any
            // subcategory that does is recorded as flung, with
            // its before / after delivered radii, the override
            // lengths standing at both frames, and whether it
            // landed back at its thrown delivered radius.
            // PAINTED-GEOMETRY WITNESS EXTENSION (ruled 2026-11-01,
            // Jason, 08:00 CST — painted-geometry witness extension):
            // the final-step witness above reads dkDeliveredRadii —
            // solve/override BOOKKEEPING. Jason's eyewitness report
            // on the Impact run (receipt: final-step witness HELD)
            // is that the subcategories were nevertheless flung back
            // out on the last frame he SAW. Taken at his word, the
            // fling either happens after the frame the bookkeeping
            // witness measures, or the last paint renders
            // differently from the radii it measures — a MEASUREMENT
            // DIVERGENCE the bookkeeping witness cannot see by
            // construction. This extension extends the witness one
            // visual frame further, in the painted domain: it reads
            // the ACTUAL PAINTED SVG GEOMETRY (node positions via
            // each icon's own getCTM chain — the same rendered read
            // the settle guard's sgCaptureRenderedCenters uses —
            // with the painted stem path's endpoints as the only
            // fallback when the CTM read fails; data-layout-x/y is
            // never substituted, and a node neither painted source
            // can read is recorded not-observed), and records, for
            // EVERY subcategory of the run's branch (all 7 on
            // Impact, pain & body modification; generic over any
            // branch — Bondage and Sex acts run through this same
            // code), THREE separate numbers per subcategory:
            //   branchR — centre to branch node (branch delivered
            //             radius, painted);
            //   seg     — branch node to subcategory node
            //             (subcategory segment length, painted);
            //   absR    — centre to subcategory node (absolute
            //             delivered radius, painted).
            // Frames are taken at the last kept phase, immediately
            // before and after the final step, after the closing
            // full paint, and after the next animation frame /
            // settle (the extended frame, awaited in the finally
            // block). The pair of painted captures spanning the
            // closing paint (after-final-step -> after-closing-
            // paint, plus after-settle) is the capture pair the
            // receipt names. Each painted transition is judged on
            // its own and NAMES the exact operation that moved any
            // of the three numbers past one ladder step. FIX for
            // the divergence branch of the ruling: the witness now
            // reads painted geometry, so a post-paint repaint /
            // settle that re-derives painted positions can no
            // longer hide behind bookkeeping that held. No shrink
            // step size, throw factor, floor, or stop rule is
            // touched by this extension; it is observational plus
            // the measurement fix, exactly as ruled.
            witnessPaintedBefore = null; witnessPaintedAfter = null; witnessPaintedLastKept = null; let witnessPaintedAfterPaint = null, witnessPaintedAfterSettle = null;
            // One painted transition judged on its own: any of the
            // three numbers (branchR / seg / absR) growing past one
            // ladder step names the subcategory and the metric; two
            // or more subcategories flung on seg or absR, or any one
            // returned to its thrown segment, is the wholesale
            // fling. The record carries the transition's operation
            // string verbatim, so the receipt names the exact
            // operation that moved the numbers.
                // ACCEPT-PATH STEP-THROUGH DIAGNOSTICS (ruled 2026-11-01,
                // Jason): read-only pauses at three checkpoints on the
                // back-out gate Accept path only - ANNEAL-DIAG-01 after
                // Accept, before restoreKept; ANNEAL-DIAG-02 after
                // restoreKept lands, before the closing full paint;
                // ANNEAL-DIAG-03 after the closing full paint lands,
                // before settle / run end (in the finally block below).
                // Active only when the shell supplies opts.onDiagPause
                // (session-only toggle; absent = no pauses, no cards, no
                // logs, exactly today's behavior). These helpers only
                // READ state - stored delivered radii, painted geometry,
                // and the live SVG view - and never write a length, a
                // delivered radius, a viewBox, or a crossing value.
                diagAcceptCtx = null;
                // Capture-time per-item fields from the closing
                // paint's centre capture (paintComposition branch of
                // scCaptureDeliveredCenters), stashed by the finally
                // block at the capture moment so DIAG-03 can report
                // the registry fields the capture consumed — the
                // closing solve reassigns dkLastBranches, so reading
                // them at pause time would give closing-time values.
                let diagCaptureFields = null;
                // HUB LOGGING (diagnostic-only, ruled 2026-11-01, per
                // HUB-SIDE-DIAGNOSIS.md): the painted hub seat read at
                // DIAG-02 — the last pause before the closing full
                // paint — stashed so DIAG-03 can print the pre-paint
                // hub seat beside the painted hub it ends with, and
                // the hub's movement across the closing paint is
                // attributable. Read-only.
                diagPrePaintHub = null;
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01,
                // Jason): the closing-paint traces the code-locate
                // assessor named as the deciding evidence between the
                // two closing-paint paths - the closing-paint mode,
                // the closing paint's scoped-paint counts, whether
                // its segment-timing entry exists, and the camera
                // state. Read-only: these helpers only READ the live
                // camera variables / the painted viewport transform,
                // and the traces themselves are read off values the
                // run already computed (the finally block's
                // closingPaintMode and the dkLog entries the closing
                // paint itself pushed). Nothing here paints, captures
                // a freeze or a segment, fits, or writes state.
                // HUB-GROUP ELEMENT IDENTITY (diagnostic-only, ruled
                // 2026-11-01, per CLOSING-PAINT-BLOWUP-ASSESSOR-REPORT
                // Q5): which element the hub-group query matches at a
                // capture moment — how many elements carry the hub's
                // layout key, whether the matched one is an exit
                // clone, and whether its category label rides a
                // textPath. Read-only; shared by DIAG-00 and DIAG-03.
                // DIAG-00 + PER-STAGE REGISTRY SNAPSHOT + ON-DEMAND
                // FULL PAINT (ruled 2026-11-01, Jason, per
                // CLOSING-PAINT-BLOWUP-ASSESSOR-REPORT Q3/Q5 and
                // HELD-FLOOR-AND-FULLPAINT-ASSESSOR-REPORT §1.7):
                // three measurement instruments, nothing else.
                // DIAG-00 and the registry snapshots ride the shell's
                // diagnostics option (opts.diag00; session-only,
                // default ON beside the step-through toggle) and are
                // pure reads — no paint, no settle, no state write —
                // so they change no geometry and no run outcome. The
                // on-demand paint rides its own session-only option
                // (opts.onDemandFullPaint, DEFAULT OFF, never written
                // into saved layouts/profiles). Counters for the
                // paint trigger: a run-wide runPhase ordinal, a
                // commit count excluding the throw, and the
                // fit-subcats commit count that arms the +5 series.
                diagPhaseOrdinal = 0; diagPaintCount = 0; diagFitSubcatsCount = 0; diagPaintBase = null;
                // DIAG-00: one painted-geometry snapshot of the saved
                // layout, taken after the baseline step and before
                // the throw / fine-tune arm — the DOM still holds
                // the pre-run full paint and no phase has committed.
                // Same helpers as DIAG-03 (dkPaintedGeometry,
                // diagCaptureView, diagCamera), plus the Q5 fields:
                // per-branch bbox decomposition, the paintComposition
                // capture fields for ALL items including non-target
                // branches, pre-run override provenance, and the
                // hub-group element identity. Stage-stamped
                // "ANNEAL-DIAG-00:pre-run:ord-0" on every capture it
                // takes, so no later baseline reads it as unstamped.
                // PER-STAGE REGISTRY SNAPSHOT (§1.7 columns, zero
                // paint): logged inside runPhase after the commit
                // and the cloud measurement, BEFORE the gate
                // decision, so tripped stages are included. Per
                // subcategory key: the fit target set, the override
                // written, the post-commit solve radius
                // (cloudRadius from the solve registry), the
                // delivered radius — plus the phase's gate threshold
                // and verdict and the onset reading and verdict
                // (report-only; the onset check itself still runs in
                // the ladder exactly as before). Registry reads
                // only: no DOM paint, no repaint, no settle, and no
                // state write beyond the record and the log.
                // ONE ON-DEMAND FULL PAINT (Q3 exact trigger wording,
                // implemented in runPhase): one freeze-replay full
                // paint with the run context live (dkCtx untouched),
                // under the closing-paint opClass so the hub snap
                // fires — if the freeze capture is unavailable the
                // paint does not run at all, never under another
                // opClass — with blit starts held and any standing
                // blit session ended before and after, exactly as
                // the closing paint does. The flag through Mr
                // (__sxDiagFullPaint) and the blit hold are set
                // together, gated by the same toggle. One
                // stage-stamped painted-geometry snapshot is logged
                // per paint. Decision inputs are registry reads, so
                // the paint changes no gate/onset verdict and no
                // run outcome.
                // THROW-BRACKET PAINTS (diagnostic, ruled 2026-11-01
                // 23:57 CST, Jason): measurement ONLY around the first
                // throw. One full paint + one stage-stamped
                // painted-geometry snapshot BEFORE stepThrow runs
                // (THROW-BEFORE) and one AFTER it commits
                // (THROW-AFTER), each followed by a prompt pause on
                // the shell's slim bottom-right strip
                // (opts.onThrowBracketPause; the strip opens slim
                // only, map fully visible behind it). Active only
                // when the shell supplies opts.throwBracket
                // (session-only toggle, default ON for this
                // diagnostic build, never written into saved
                // layouts/profiles); absent/false = no bracket
                // paints, no bracket snapshots, no bracket pauses,
                // no bracket log lines — exactly the pre-edit run.
                // The bracket paint replicates diagOnDemandPaint's
                // discipline exactly: freeze capture +
                // paintComposition centres, the run context live
                // (dkCtx untouched), hub seating only under the
                // closing-paint opClass ("anneal-closing-paint") —
                // if the freeze capture is unavailable the paint
                // does not run at all, never under another opClass —
                // any standing blit session ended before and after,
                // blit starts held for its duration, and the
                // __sxDiagFullPaint flag and the blit hold set
                // together. The snapshot uses the same helpers as
                // DIAG-00/DIAG-03 (dkPaintedGeometry,
                // diagCaptureView, diagCamera, diagHubIdentity,
                // diagText) and the same field list: per-branch bbox
                // decomposition, branch delivered radius,
                // per-subcategory segment / absolute radius / stored
                // radius, hub point + radius, camera state, override
                // provenance — plus the throw's own inputs (centre
                // radius, target radii, delivered radii, committed
                // override lengths from report.throwRadii).
                // stepThrow itself is untouched: nothing here writes
                // a length, an override, a fit target, a view, or
                // any gate/onset decision input, so the throw's
                // effect reads off BEFORE vs AFTER with no other
                // operation in between.
                throwBracketBefore = null;
            try {
                // STAGED SCORING (ruled 2026-11-02, Jason): the run's
                // judged score starts SAME-BRANCH ONLY; the context is
                // cleared in the finally block (dk.end) on every exit.
                sxAnnealStageCtx = { branch: name, adjacent: !1 };
                // F4 STEP 1b — preconditions: stage any violated choreography
                // values (written by the throw, restored by the final patch).
                const staged = stepPreconditions(api, report);
                // (3) SNAPSHOT + BASELINE: the snapshot is the
                // untouched pre-run state (taken before any staging is
                // applied, so a revert restores the user's real values,
                // staged ones included). The baseline is measured
                // TWICE (§5.8) and the observed variance reported.
                // F4 STEP 2 — snapshot + baseline: snapshot the untouched
                // pre-run state, measure the baseline twice (decider +
                // secondary + neighbors), and capture pre-run delivered radii.
                const preDelivered = await stepBaseline(dk, report, name);
                witnessFrame("pre-run", null, preDelivered, witnessSubs, name, report, dk);
                // DIAG-00 (ruled 2026-11-01, Jason): the pre-run
                // painted-geometry snapshot of the saved layout —
                // taken here, after the baseline step (which only
                // measures and takes the untouched snapshot) and
                // before any phase commits: the DOM still holds the
                // pre-run full paint. Read-only; gated on the
                // shell's diagnostics option (opts.diag00).
                if (opts && opts.diag00) { try { diag00Capture(preDelivered, name, tax, report); } catch (e) {} }
                // E6 phase-boundary yield: a double requestAnimationFrame
                // (with a timeout fallback) so busy / readout state set
                // before a phase can paint before the phase's synchronous
                // solve blocks the main thread.
                // One phase = exactly one applyPhase commit. The
                // record is assembled from the phase's own log slice:
                // requested ratios from the phase entry's validated
                // ratios (restricted to this branch's keys), delivered
                // ratios from delivered radii vs the pre-run radii,
                // and every other log entry the phase produced as its
                // limiter hits.
                // Q2 per-phase gate state: the cloud metric the
                // previous phase delivered (the run baseline, for
                // the first phase). After each phase commits, its
                // cloud is compared against this value; a regression
                // beyond tolerance stops the cascade (see the gate
                // at the end of runPhase) instead of carrying a
                // tangle through the remaining phases. The metric is
                // record.cloud — Q4 repointed that readout to the
                // own-cloud crossing number, not this gate: the
                // comparison and its tolerance below are unchanged
                // and now operate on crossing values.
                prevPhaseCloud = Number.isFinite(report.baseline.first) ? report.baseline.first : null;
                // BACK-UP-A-STEP (ruled 2026-10-28, all phases): the
                // cascade retains the last-kept phase snapshot
                // throughout the run — the layout state and this
                // branch's fit registrations as they stood right after
                // the most recent KEPT phase commit (the throw commit
                // counts as a kept state). A per-phase gate trip
                // restores it, discards the tripping step, and stops
                // that level's ladder; earlier kept steps stand and
                // the run continues to the next level from the
                // backed-up state. The pre-run snapshot is the
                // fallback only when no phase has committed yet, and
                // stays the final gate's whole-run restore.
                lastKeptSnapshot = null; lastKeptFit = null;

                // F4: the shared phase-commit step every cascade phase
                // runs through — one applyPhase commit, its record,
                // and the per-phase gate (tolerance SX_SCORE.GATE_TOL,
                // flat 2). The onset margin and the fine-tune margin
                // are deleted.
                mark = dkLog.length;
                // F4 STEP 3 — throw: one commit arming the full cascade at the
                // thrown lengths (factors: SX_SCORE.THROW_*).
                // FINE-TUNE SKIP-THROW DECISION (ruled 2026-10-29,
                // rulings adopted 09:42-09:43): judged HERE — after
                // the baseline step, before the throw — on the
                // CASCADE baseline (report.baseline.first, measured
                // twice in stepBaseline with its variance reported),
                // never on the shell pre-flight's single measure
                // (that measure acts only on exactly zero and is not
                // the fine-tune measure). Baseline STRICTLY below
                // SX_SCORE.FINE_TUNE_BELOW — zero included — takes
                // the skip path; exactly 5 or more throws as before.
                // On the skip path there is no thrown baseline.
                // The fine-tune margin is deleted; FINE_TUNE_BELOW
                // only chooses skip-throw versus throw.
                const fineTuneActive = Number.isFinite(report.baseline.first) && report.baseline.first < SX_SCORE.FINE_TUNE_BELOW;
                report.fineTune = { active: fineTuneActive, baseline: report.baseline.first, below: SX_SCORE.FINE_TUNE_BELOW, margin: null, armPhase: null, holds: [], branchFloor: null };
                fineTuneActive && dkLog.push({ type: "fine-tune-skip-throw", branch: name, baseline: report.baseline.first, below: SX_SCORE.FINE_TUNE_BELOW });
                // FINE-TUNE STAGING-AND-ARMING COMMIT (skip path,
                // ruling 6 — full arming mirroring the throw minus
                // length changes): the throw commit is what normally
                // writes the staged precondition values and arms the
                // full cascade (all four arm maps true, overwriting
                // inherited explicit-false vetoes, restored later
                // from the snapshot). A skip path that never throws
                // must still land that exact staging and arming as
                // its own kept commit, or the shrink solve would run
                // under the wrong choreography and its shrink moves
                // would be filtered out in Grow-only mode. This
                // commit changes NO length override: branch,
                // subcategory and kink lengths stay at their pre-run
                // values, and the shrink ladders below do the moving.
                // THROW-BRACKET (diagnostic, 2026-11-01 23:57 CST):
                // the bracket points wrap the run's throw sequence
                // (the first throw plus any THROW REPEAT re-throws,
                // ruled 2026-11-06), on the throw path only — a skip-throw
                // (fine-tune) run has no throw to bracket. With
                // opts.throwBracket absent/false neither point runs:
                // no bracket paint, snapshot, pause or log line, and
                // stepThrow runs exactly as before.
                if (!fineTuneActive && opts && opts.throwBracket) { try { await throwBracketPoint("THROW-BEFORE", throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
                fineTuneActive ? await stepFineTuneArm(snapshot, staged, name, tax, runPhase, report, opts, dk, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) : await stepThrowRepeated(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                if (!fineTuneActive && opts && opts.throwBracket) { try { await throwBracketPoint("THROW-AFTER", throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
                // WITNESS: on the skip-throw path there is no thrown
                // frame; gains are measured from the standing
                // (fine-tune-arm / pre-run) frame instead.
                witnessThrown || (witnessThrown = witnessLastFrame ? witnessLastFrame.subs : null);
                // F4 STEP 4 — onset setup still records the thrown-state
                // baseline (pre-run baseline on the skip path). Phase 4
                // (2026-11-04): no hold threshold. The onset margin and
                // the fine-tune margin are deleted. The per-phase gate
                // (flat GATE_TOL 2) is the only stop.
                const onsetCheck = stepOnsetSetup(name, fineTuneActive, report);
                // F4 STEP 5 — shrink ladders: subcategory level first, then the
                // branch level. The per-phase gate inside runPhase is the
                // only stop; the onset and fine-tune margins are deleted.
                // EXPLANATION STEP THREE IS COMMENTED OUT (ruled
                // 2026-10-31, Jason): the explanation's step three
                // — a separate geometric step-down stage — and its
                // step four — the shrink — were duplicating each
                // other. There is no separate step-down stage in
                // this cascade and none runs: the
                // step-down IS this shrink stage (these ladders,
                // their square-root-step staging and the per-phase gate),
                // one step-down/shrink stage, not two.
                const shrinkOutcome = await stepShrinkLadders(name, report, dk, fineTuneActive, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, opts, tax, diagCaptureFields, onsetCheck);
                // TERMINATION (ruled 2026-10-28, Jason 23:43, scope
                // confirmed 23:49): when the CATEGORY (branch) shrink
                // ladder backed out, the run ENDS here. Growth
                // (branch, then subcategories), the final patch and
                // the final gate do NOT run; the backed-out
                // (last-kept snapshot) state stands exactly as
                // runPhase restored it, and no final-gate revert
                // check judges it. The report closes the run out on
                // the backed-out state's own measurements — finalCloud
                // / delta (decider) and the secondary area, measured
                // on the state that stands — under its own gate value
                // ("ended-at-category-backout", neither the final
                // gate's "kept" nor its "reverted") with the early
                // end stated plainly in the reason, so the receipt
                // never presents this outcome as a final-gate result.
                // The block then runs the DISARM cleanup (ruled
                // 2026-10-29): the temporary staging the final patch
                // would have taken down is restored there instead —
                // see DISARM ON EARLY END inside the block. The run
                // still ends here; the disarm is not the final patch,
                // runs no phase and no gate, and changes no
                // backed-out length.
                // A subcategory back-out does not reach this block
                // (stepShrinkLadders reports only branch-ladder gate
                // trips), and a run with no category back-out takes
                // the unchanged full cascade below.
                const endedAtCategoryBackout = !!(shrinkOutcome && shrinkOutcome.branchBackedOut);
                // GATE-REJECTED END (ruled 2026-11-01, Jason): the
                // back-out confirmation gate was REJECTED at the trip
                // above, so nothing was reverted — the tripped trial
                // geometry stands. The run still ends here (no growth,
                // no final patch, no final gate), but the disarm
                // restore below is SKIPPED on this ending: a restore
                // re-solves, and the rejected ending must leave the
                // tripped geometry exactly as it stood on screen. The
                // rejection, its gate code and both crossings are
                // recorded on the report (report.backoutGate, set at
                // the trip) and in this reason for the receipt.
                const gateRejectedEnd = !!(shrinkOutcome && shrinkOutcome.gateRejected);
                if (endedAtCategoryBackout) {
                    report.endedEarly = { at: gateRejectedEnd ? "category-shrink-backout-gate-rejected" : "category-shrink-backout", phase: report.phaseGate && report.phaseGate.phase ? report.phaseGate.phase : null, gateRejected: gateRejectedEnd };
                    report.gate = "ended-at-category-backout", report.reason = gateRejectedEnd ? "category shrink back-out REJECTED at gate [" + (report.backoutGate ? report.backoutGate.code : "ANNEAL-BO-01") + "] at " + (report.endedEarly.phase || "fit-branch") + " — crossing " + (report.backoutGate ? Math.round(100 * report.backoutGate.crossingBefore) / 100 : null) + " → " + (report.backoutGate ? Math.round(100 * report.backoutGate.crossingAfter) / 100 : null) + " (tripped); tripped trial geometry left standing, nothing reverted — run ended there; growth, the final patch and the final gate did not run" : "category shrink backed out at " + (report.endedEarly.phase || "fit-branch") + " — run ended there; growth, the final patch and the final gate did not run";
                    dkLog.push({ type: "run-ended-early", at: report.endedEarly.at, phase: report.endedEarly.phase, gateRejected: gateRejectedEnd });
                    try { report.finalCloud = await dk.measureCloud(name); } catch (e) { report.finalCloud = report.phaseGate && null != report.phaseGate.restoredCloud ? report.phaseGate.restoredCloud : prevPhaseCloud; }
                    // STAGED SCORING: finalCloud is measured after
                    // the shrink-stage switch (neighbour-inclusive
                    // composition) while baseline.first is the
                    // run-start (own-cloud-only) value the receipt
                    // displays as the run's start — report.delta is
                    // the displayed pair's difference (final minus
                    // displayed start, one composition story per
                    // receipt line). The GATE's own judged change is
                    // recorded separately as gateDelta against
                    // gateBaseline, the neighbour-inclusive baseline
                    // captured on the pre-run geometry.
                    report.gateBaseline = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.baseline.adjacentFirst : report.baseline.first;
                    report.delta = null != report.finalCloud && null != report.baseline.first ? report.finalCloud - report.baseline.first : null, report.gateDelta = null != report.finalCloud ? report.finalCloud - report.gateBaseline : null;
                    try {
                        const allFinE = await dk.measureCloudsAll(), nfE = {};
                        Object.keys(allFinE).forEach(k => {
                            k !== name && (nfE[k] = allFinE[k]);
                        }), report.neighbors.final = nfE;
                    } catch (e) {}
                    // Bake gate (M4): dkBakeGate above, the single
                    // computation shared by both run endings.
                    dkBakeGate(report);
                    report.plateau = { metric: "crossingnumber", finalCrossing: report.finalCloud, copyFired: 0 === report.finalCloud };
                    report.fitDeviationTotal = tallyFitDev(report);
                    // DISARM ON EARLY END (ruled 2026-10-29, Jason
                    // 02:08): the final patch does not run on this
                    // path, so the cleanup it normally performs —
                    // taking the cascade's temporary staging down —
                    // runs HERE, after the backed-out state's
                    // measurements above are taken, as a plain
                    // restore, NOT as a phase: no "final" phase
                    // record, no runPhase commit, no gate. The
                    // concrete armed/staged state it clears, all of
                    // it written by the throw commit and the shrink
                    // ladders and left standing by restoreKept when
                    // the branch ladder backed out: (1) the two
                    // spoke auto-shrink arm maps at the keys the throw
                    // armed — branchSpokeAutoShrink[name], and for
                    // every subcategory label of this branch
                    // subcatSpokeAutoShrink[label], all set true by
                    // the throw, overwriting any pre-run explicit
                    // false veto; (2) the staged precondition values
                    // (the collision / staggerDensity / expandAll
                    // entries recorded in `staged`, applied by the
                    // throw commit); (3) this branch's fit-target
                    // registrations in dkFitRegistry (armed by
                    // armFitForBranch, retargeted per ladder stage,
                    // and restored with the kept layout by
                    // restoreKept; the final patch clears them via
                    // clearBranchFit before its commit and the
                    // gate-revert catch clears them too — only this
                    // early-end path left them armed). The disarm
                    // patch is the CURRENT (backed-out) state with
                    // only (1) and (2) overwritten from the pre-run
                    // snapshot — an arm key the snapshot lacks is
                    // deleted, exactly restoring its absence — so
                    // every length override (branch / subcat /
                    // kink) and every other field stands exactly as
                    // backed out. (3) is NOT cleared before the
                    // restore (DISARM FIX, ruled 2026-11-01, Jason):
                    // the compact kept shape lives in those fit
                    // targets — an unarmed re-solve starts every
                    // subcategory at the branch base radius and the
                    // locked "grow" collision never pulls it back
                    // down, so clearing first handed the closing
                    // paint the thrown lengths instead of the kept
                    // ones. The kept registrations (lastKeptFit, the
                    // pair restoreKept re-arms) are re-armed before
                    // the restore, so its solve runs armed and
                    // reproduces the backed-out geometry; (3) is
                    // then cleared AFTER the restore, so the post-run
                    // state this cleanup leaves is exactly as
                    // disarmed as before. A disarm failure is
                    // recorded on the report and never thrown: the
                    // early end and its backed-out state stand
                    // regardless.
                    if (gateRejectedEnd) {
                        report.disarm = { skipped: "backout-gate-rejected — tripped geometry left exactly as it stood" }, dkLog.push({ type: "run-disarm-skipped", at: "category-shrink-backout-gate-rejected" });
                    } else try {
                        const disarmPatch = dk.snapshot(), disarmLensBefore = dk.canonical({ branchOverrides: disarmPatch.branchOverrides, subcatOverrides: disarmPatch.subcatOverrides, kinkOverrides: disarmPatch.kinkOverrides }), restoreArmKey = (patchMap, snapMap, key) => {
                            if (!patchMap) return;
                            null != snapMap && Object.prototype.hasOwnProperty.call(snapMap, key) ? patchMap[key] = snapMap[key] : delete patchMap[key];
                        };
                        restoreArmKey(disarmPatch.branchSpokeAutoShrink, snapshot.branchSpokeAutoShrink, name), tax.subLabels.forEach(l => {
                            restoreArmKey(disarmPatch.subcatSpokeAutoShrink, snapshot.subcatSpokeAutoShrink, l);
                        }), staged.forEach(s => {
                            disarmPatch[s.key] = snapshot[s.key];
                        });
                        const fitKeysBeforeDisarm = Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name);
                        // DISARM FIX (see the block comment above):
                        // re-arm the kept fit registrations before
                        // the restore so its solve runs armed, then
                        // clear them after it — clearing a target
                        // solves nothing itself, so the armed solve's
                        // delivered geometry stands into the closing
                        // paint's capture while the post-run fit
                        // state is still fully cleared. With no kept
                        // fit on record, fall back to the original
                        // unarmed order.
                        if (lastKeptFit) {
                            clearBranchFit(dk, name);
                            Object.keys(lastKeptFit).forEach(k => dk.setFitTarget(k, lastKeptFit[k]));
                        } else clearBranchFit(dk, name);
                        dk.restore(disarmPatch), clearBranchFit(dk, name);
                        const disarmStateAfter = api.get(), fitKeysAfterDisarm = Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name);
                        report.disarm = { armsRestored: [ "branchSpokeAutoShrink", "subcatSpokeAutoShrink" ], preconditionsRestored: staged.map(s => s.key), fitTargetsCleared: fitKeysBeforeDisarm.length, fitTargetsArmedForSolve: lastKeptFit ? Object.keys(lastKeptFit).length : 0, fitTargetsRemaining: fitKeysAfterDisarm.length, lengthsUnchanged: dk.canonical({ branchOverrides: disarmStateAfter.branchOverrides, subcatOverrides: disarmStateAfter.subcatOverrides, kinkOverrides: disarmStateAfter.kinkOverrides }) === disarmLensBefore };
                        dkLog.push({ type: "run-disarm", at: "category-shrink-backout", fitTargetsCleared: fitKeysBeforeDisarm.length, fitTargetsArmedForSolve: report.disarm.fitTargetsArmedForSolve, fitTargetsRemaining: fitKeysAfterDisarm.length, preconditionsRestored: report.disarm.preconditionsRestored.slice(), lengthsUnchanged: report.disarm.lengthsUnchanged });
                        witnessRestore("disarm-restored", "category-shrink-backout", witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                    } catch (disarmErr) {
                        report.disarm = { error: String(disarmErr && disarmErr.message || disarmErr) }, dkLog.push({ type: "run-disarm-error", at: "category-shrink-backout", message: report.disarm.error });
                    }
                }
                // F4 STEP 5b — growth: scoped same-branch growth
                // (ruled 2026-10-28), after the shrink ladders and
                // before the final patch. Growth arrives ONLY as
                // cascade ratio patches through runPhase — the
                // relaxation engines still never grow and the
                // repulsion descent's grow flag stays off. A cloud
                // grows only when same-branch pairs contribute more
                // than half its standing E: standing E is the
                // cascade's own crossing readout, excluded E is the
                // same readout under the existing same-branch
                // exclusion flag, and the difference is the
                // same-branch contribution. Levels run outermost
                // first (branch, then subcategories); there is no
                // kink growth — growing kink leaves never reduces
                // collisions. Each level climbs the cumulative
                // ladder (step factor per step, at most the ruled
                // max steps, the step that would pass the cap
                // clipped to exactly the cap), every step gated by
                // the shared per-phase gate with back-up-a-step on
                // a trip. Lengths also respect the phase validator's
                // hard cap against the baked bases: a step whose
                // lengths can no longer advance under that cap
                // stops its level instead of being rejected.
                // Skipped when the run ended at the category shrink
                // back-out above (see TERMINATION at stepShrinkLadders).
                // STEP FIVE COMMENTED OUT (ruled 2026-10-31, Jason):
                // explanation step five — "Fit and growth" — is
                // out. The growth phase no longer runs in the
                // cascade. The stepGrowth definition above is kept
                // in the code, not deleted, and its invocation is
                // commented out, not removed:
                // if (!endedAtCategoryBackout) await stepGrowth();
                // F4 STEP 6 — final patch: build the kept state on the pre-run
                // snapshot, carry held lengths through, commit as the 'final'
                // phase, then take the final measurements for the gate.
                // Both the final patch and the final gate are
                // skipped when the run ended at the category shrink
                // back-out above (see TERMINATION at
                // stepShrinkLadders): the backed-out state stands
                // unjudged by the gate and is never reverted here.
                if (!endedAtCategoryBackout) {
                await stepFinalPatch(dk, name, opts, report, tax, runPhase, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, diagCaptureFields, witnessTrippingLabel);
                // (7) GATE: exact-float improve-or-hold on the
                // branch's own-cloud CROSSING NUMBER (Q4 decider —
                // baseline.first / finalCloud carry crossing values
                // via the repointed readout; the xAreaCross area is
                // reported secondary above and never gates). A kept
                // run must also
                // provably differ from the pre-run snapshot — a
                // "kept" run whose final state is the snapshot kept
                // nothing.
                // STAGED SCORING (ruled 2026-11-02, Jason): the final
                // gate is the same judge as the descent — it judges the
                // shrink-stage composition, so its baseline is the
                // adjacent-composition value captured on the pre-run
                // geometry in stepBaseline (baseline.adjacentFirst),
                // falling back to baseline.first only when that capture
                // was unavailable.
                const gateBaseline = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.baseline.adjacentFirst : report.baseline.first;
                report.gateBaseline = gateBaseline;
                if (!dk.gate(gateBaseline, report.finalCloud)) throw new Error("gate failed: final cloud " + report.finalCloud + " exceeds baseline " + gateBaseline);
                if (dk.canonical(api.get()) === dk.canonical(snapshot)) throw new Error("kept-state verification failed: final state is identical to the pre-run snapshot");
                report.finalDiffers = !0, report.gate = "kept";
                }
            } catch (e) {
                report.fitDeviationTotal = tallyFitDev(report), report.gate = "reverted", report.reason = String(e && e.message || e);
                // Q1: a budget abort or a user cancel is named as
                // such on the report — phase and the phase's
                // iteration count ride along for the receipt.
                if (e && (e.dkBudget || e.dkCancelled)) report.aborted = { kind: e.dkBudget ? "budget" : "cancel", phase: e.phase != null ? String(e.phase) : null, iterations: e.iterations || 0 };
                try {
                    clearBranchFit(dk, name), snapshot && (dk.restore(snapshot), report.restoreVerified = dk.canonical(api.get()) === dk.canonical(snapshot));
                    snapshot && witnessRestore("whole-run-revert-restored", null, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                } catch (re) {
                    report.restoreError = String(re && re.message || re);
                }
            } finally {
                const wEv = report.witness.events.find(e => e.wholesaleDiscard);
                report.witness.verdict = wEv ? "proven" : report.witness.events.length ? "ruled-out" : "no-backout-observed", report.witness.culprit = wEv ? { event: wEv.event, phase: wEv.phase, subcats: wEv.wholesale.map(w => w.label) } : null, dkLog.push({ type: "witness-verdict", verdict: report.witness.verdict, culprit: report.witness.culprit, events: report.witness.events.length, frames: report.witness.frames.length });
                sxAnnealStageCtx = null, dk.end(), dkLog.push({ type: "run-report", report: report });
                // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31,
                // Jason): every commit above painted only the
                // approximation (see Mr) — paint the full map ONCE
                // here, at the run's end state: kept, ended-early,
                // or reverted alike (on a revert the catch above
                // has already restored the pre-run snapshot, so
                // this paints the state that actually stands).
                // The context is closed first, so this paint is
                // the run's terminal paint, settle search included.
                // ONE CLOSING REPAINT (ruled 2026-11-01, Jason —
                // supersedes the split closing paint this block
                // carried: a freeze-replay paint for the category
                // back-out ending and the ordinary paint for kept
                // and reverted endings): there is exactly ONE
                // closing repaint here, regardless of how the run
                // gets here — kept, ended-early (category back-out
                // included), reverted, aborted or cancelled alike —
                // and it paints the state that stands. The painted
                // witness named the ordinary closing re-solve as
                // the operation that re-derived larger painted
                // segments than the cascade delivered (Impact,
                // fit-branch-13: painted segments many times past
                // one step beyond the last kept delivered segments
                // while the bookkeeping witness held), so the one
                // repaint is the freeze-replay paint in the settle
                // guard's own pattern (sgRestorePaint) for EVERY
                // ending: every branch frozen, nothing recomputed,
                // each node seated at its delivered centre, and the
                // frozen capture replaying the delivered solve the
                // cascade just stood at — on a revert the catch
                // above has already restored the pre-run snapshot
                // and re-solved to it, so the replay carries that
                // restored state, not the discarded run. The mode
                // is chosen BEFORE any paint runs: only when the
                // freeze capture itself is unavailable (no
                // delivered branches or centres to replay) does
                // the one repaint run as the ordinary paint — a
                // paint that has run is never followed by a second
                // closing repaint, on any ending, for any failure.
                // The repaint is terminal: any blit session left
                // over from the run's scoped interim paints is
                // ended BEFORE it (so the paint-top gate's
                // same-frozen-set path can never carry a session
                // through it), blit session starts are held off
                // for its duration (sgHoldBlitStart, exactly as
                // sgRestorePaint holds them — an all-frozen paint
                // otherwise starts a session whose swap vaults the
                // whole map behind a raster and arms a settle
                // timer nobody is left to land), and any session
                // that nevertheless stands after it is ended
                // before the witnesses below read the painted map.
                let closingPaintMode = "ordinary", closingPaintResult = null;
                try {
                    const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                    diagCaptureFields = centres && centres.captureFields ? centres.captureFields : null;
                    if (cap && cap.branches && cap.branches.size && centres && centres.size) closingPaintMode = "freeze-replay", scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres };
                } catch (e) { __sxErrLog("layout-anneal-closing-paint-carry", e), scCtx = null, closingPaintMode = "ordinary"; }
                try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-anneal-closing-paint-blit-end", e); }
                if ("freeze-replay" === closingPaintMode) sgHoldBlitStart = !0;
                try {
                    closingPaintResult = Mr({
                        animate: !1,
                        forceRepaint: !0
                    });
                } catch (e) { __sxErrLog("layout-anneal-final-paint", e); } finally {
                    scCtx = null, sgHoldBlitStart = !1;
                }
                // A chunked closing paint completes across frames:
                // wait for it (raced against the same 900 ms bound
                // the painted witness below uses, so a throttled
                // frame can never hang the receipt) before anything
                // is read from — or cleared off — the painted map.
                try {
                    if (closingPaintResult && "function" == typeof closingPaintResult.then) await Promise.race([ closingPaintResult, new Promise(r => setTimeout(r, 900)) ]);
                    else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                } catch (e) {}
                try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-anneal-closing-paint-blit-end", e); }
                dkLog.push({ type: "closing-paint", branch: name, mode: closingPaintMode, gate: report.gate, endedEarly: !!report.endedEarly, opClass: "anneal-closing-paint" });
                // CAPSULE WIPE GATED ON FULL-PAINT COMPLETION
                // (Fix 2, ruled 2026-11-01, Jason): the interim
                // capsule layer's published live-number anchor is
                // cleared only HERE — after the one closing repaint
                // above has landed — never before it. Clearing it
                // ahead of the paint (as this block used to) wiped
                // the approximation state while the full paint was
                // still in flight, queued or failed, and the map
                // layer could be left empty: no capsule, no full
                // paint. The capsule DOM layer itself is gated the
                // same way inside Ar (see sxCapsuleKeep there): it
                // survives the paint's opening clear and is removed
                // only by the install that lands the full paint.
                window.__sxInterimAnchor = null;
                // ANNEAL-DIAG-03: the closing full paint has landed
                // (paint promise awaited above); pause here, before
                // settle / before the run ends, on the gate Accept
                // path only - diagPause no-ops on every other ending.
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01):
                // hand DIAG-03 the closing-paint traces that decide
                // between the two closing-paint paths - the mode this
                // finally block already chose (closingPaintMode), and
                // the scoped-paint counts / segment-timing presence
                // from the dkLog entries THIS paint pushed (the
                // entries after this run's run-report entry, which
                // was pushed immediately before the paint) - so the
                // expanded readout, the console diag object and the
                // receipt carry them without console digging.
                // Read-only: the scan only reads dkLog; it adds no
                // paint, capture, or fit call, and changes neither
                // the mode choice nor the paint.
                let diagClosing = null;
                try {
                    diagClosing = { mode: closingPaintMode, scopedPaint: null, segmentTiming: !1 };
                    let rr = -1;
                    for (let i = dkLog.length - 1; i >= 0; i--) if (dkLog[i] && "run-report" === dkLog[i].type) { rr = i; break; }
                    for (let i = dkLog.length - 1; i > rr; i--) {
                        const e = dkLog[i];
                        if (!e) continue;
                        if (!diagClosing.scopedPaint && "scoped-paint" === e.type) diagClosing.scopedPaint = { retained: e.retained, captured: e.captured, diverged: e.diverged };
                        if (!diagClosing.segmentTiming && "segment-timing" === e.type) diagClosing.segmentTiming = !0;
                        if (diagClosing.scopedPaint && diagClosing.segmentTiming) break;
                    }
                } catch (e) { diagClosing = { mode: closingPaintMode, scopedPaint: null, segmentTiming: !1 }; }
                await diagPause("ANNEAL-DIAG-03", "closing full paint \u2192 settle", diagClosing, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                // FINAL-STEP WITNESS (extension): the frame the
                // back-out judge could never take — every
                // subcategory's delivered radius and override as
                // they stand AFTER the closing full paint above,
                // the state the user actually sees when the run
                // ends. Both final-step transitions are judged
                // here (the final patch commit, bracketed in
                // stepFinalPatch; and the closing sequence —
                // context close plus this paint, settle search
                // included — against the last frame taken before
                // it), and the record names the operation this
                // run's final step actually was, on endings that
                // never reach the final patch as well. The record
                // lands on the report after the run-report log
                // entry above; the entry holds this same report
                // object by reference, and the receipt is built
                // from the returned report, so both carry it.
                // Observational only, and guarded: a failure here
                // is recorded as not-observed and never disturbs
                // the run's ending.
                try {
                    const fsOperation = witnessFinalOperation ? witnessFinalOperation + ("reverted" === report.gate ? ", then the whole-run revert to the pre-run snapshot" : "") + ", then the closing full paint" : report.backoutGate && "rejected" === report.backoutGate.decision ? "category shrink back-out gate-rejected ending (tripped trial geometry left standing; disarm, the final patch and the final gate did not run), then the closing full paint" : report.endedEarly ? "category shrink back-out ending (disarm restore; the final patch and final gate did not run), then the closing full paint" : "reverted" === report.gate ? "whole-run revert to the pre-run snapshot, then the closing full paint" : "closing full paint (no final patch ran)";
                    const fsBeforePaint = witnessFinalAfter || witnessLastFrame, fsAfterPaint = witnessFrame("final-step-after-paint", witnessFinalOperation ? "final" : null, null, witnessSubs, name, report, dk);
                    const fsTCommit = witnessFinalBefore && witnessFinalAfter ? witnessFinalJudge("final-patch-commit", witnessFinalBefore, witnessFinalAfter, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null, fsTPaint = fsBeforePaint ? witnessFinalJudge("closing-full-paint", fsBeforePaint, fsAfterPaint, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const fsTransitions = [ fsTCommit, fsTPaint ].filter(Boolean), fsCulpritT = fsTransitions.find(t => t.wholesale) || null, fsMovedT = fsTransitions.find(t => t.flung.length) || null;
                    report.witness.finalStep = {
                        operation: fsOperation,
                        finalPhaseTripped: witnessFinalTripped,
                        frames: { lastKept: witnessFinalLastKept, before: witnessFinalBefore, after: witnessFinalAfter, afterPaint: fsAfterPaint },
                        transitions: fsTransitions,
                        verdict: fsCulpritT ? "proven" : fsMovedT ? "moved-not-wholesale" : fsTransitions.length ? "held" : "not-observed",
                        culprit: fsCulpritT ? { transition: fsCulpritT.transition, subcats: fsCulpritT.flung.map(f => f.label) } : null
                    };
                    dkLog.push({ type: "witness-final-step", operation: fsOperation, verdict: report.witness.finalStep.verdict, culprit: report.witness.finalStep.culprit, transitions: fsTransitions.map(t => ({ transition: t.transition, wholesale: t.wholesale, flung: t.flung.map(f => f.label) })) });
                } catch (fsErr) {
                    report.witness.finalStep = { operation: witnessFinalOperation || null, finalPhaseTripped: witnessFinalTripped, frames: { lastKept: witnessFinalLastKept, before: witnessFinalBefore, after: witnessFinalAfter, afterPaint: null }, transitions: [], verdict: "not-observed", culprit: null, error: String(fsErr && fsErr.message || fsErr) };
                }
                // PAINTED-GEOMETRY WITNESS EXTENSION (the extended
                // frame): the painted capture pair spanning the
                // closing full paint, plus the settle frame one
                // visual frame further. The after-paint capture
                // reads the painted SVG as the closing paint left
                // it; then the run waits for the next animation
                // frame / settle — a chunked closing paint's
                // in-flight promise first (raced against a bound so
                // a throttled frame can never hang the receipt),
                // then a double requestAnimationFrame with a timer
                // fallback (the house yield pattern) — and captures
                // painted geometry AGAIN. Any of the three numbers
                // (branch radius / segment / absolute radius) that
                // moves past one step across the settle transition
                // is named against the post-paint settle operation;
                // any that moves across the closing paint is named
                // against the closing full paint (settle search and
                // stem finalisation included). The divergence flag
                // compares the painted segment at settle against
                // the bookkeeping delivered radius the existing
                // witness recorded after the same paint: painted
                // past one step beyond bookkeeping is the
                // measurement divergence Jason's report describes,
                // and with this extension the witness reads the
                // painted value, so the receipt reports the fling
                // instead of holding against it. Guarded exactly
                // like the final-step record above: a failure is
                // recorded as not-observed and never disturbs the
                // run's ending. Additive only — report.witness
                // .finalStep and every existing line stand as they
                // were.
                try {
                    const pwOperation = report.witness.finalStep && report.witness.finalStep.operation ? report.witness.finalStep.operation : "closing full paint";
                    witnessPaintedAfterPaint = witnessPaintedFrame("after-closing-paint", pwOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                    try {
                        const pwPaintP = typeof sxPaintPromise !== "undefined" ? sxPaintPromise : null;
                        if (pwPaintP && "function" == typeof pwPaintP.then) await Promise.race([ pwPaintP, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    await new Promise(r => { let done = !1; const fin = () => { if (!done) { done = !0; r(); } }; try { requestAnimationFrame(() => requestAnimationFrame(fin)); } catch (e) {} setTimeout(fin, 120); });
                    witnessPaintedAfterSettle = witnessPaintedFrame("after-settle", "post-paint settle (next animation frame / layout transition / chunked-paint completion after the closing full paint)", dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                    const pwTCommit = witnessPaintedBefore && witnessPaintedAfter ? witnessPaintedJudge("final-patch-commit", witnessFinalOperation || "final patch commit", witnessPaintedBefore, witnessPaintedAfter, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwPrePaint = witnessPaintedAfter || witnessPaintedLastKept;
                    const pwTPaint = pwPrePaint && witnessPaintedAfterPaint ? witnessPaintedJudge("closing-full-paint", pwOperation, pwPrePaint, witnessPaintedAfterPaint, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwTSettle = witnessPaintedAfterPaint && witnessPaintedAfterSettle ? witnessPaintedJudge("post-paint-settle", "post-paint settle (next animation frame / layout transition / chunked-paint completion after the closing full paint)", witnessPaintedAfterPaint, witnessPaintedAfterSettle, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwTransitions = [ pwTCommit, pwTPaint, pwTSettle ].filter(Boolean), pwCulpritT = pwTransitions.find(t => t.wholesale) || null, pwMovedT = pwTransitions.find(t => t.flung.length) || null;
                    let pwDivergence = !1;
                    try {
                        const bkFrame = report.witness.finalStep && report.witness.finalStep.frames ? report.witness.finalStep.frames.afterPaint : null;
                        if (bkFrame && witnessPaintedAfterSettle) Object.keys(witnessPaintedAfterSettle.subs).forEach(label => {
                            const bk = bkFrame.subs[label], pw = witnessPaintedAfterSettle.subs[label];
                            bk && pw && null != bk.d && null != pw.seg && bk.d > 0 && pw.seg > bk.d * WITNESS_ONE_STEP && (pwDivergence = !0);
                        });
                    } catch (e) {}
                    report.witness.painted = {
                        frames: { lastKept: witnessPaintedLastKept, before: witnessPaintedBefore, after: witnessPaintedAfter, afterPaint: witnessPaintedAfterPaint, afterSettle: witnessPaintedAfterSettle },
                        capturePair: { beforeClosingPaint: pwPrePaint ? pwPrePaint.stage : null, afterClosingPaint: witnessPaintedAfterPaint ? witnessPaintedAfterPaint.stage : null, afterSettle: witnessPaintedAfterSettle ? witnessPaintedAfterSettle.stage : null },
                        transitions: pwTransitions,
                        verdict: pwCulpritT ? "proven" : pwMovedT ? "moved-not-wholesale" : pwTransitions.length ? "held" : "not-observed",
                        culprit: pwCulpritT ? { transition: pwCulpritT.transition, operation: pwCulpritT.operation, subcats: pwCulpritT.flung.map(f => f.label + ":" + f.metric) } : null,
                        divergence: pwDivergence,
                        operation: pwOperation
                    };
                    dkLog.push({ type: "witness-painted-verdict", verdict: report.witness.painted.verdict, culprit: report.witness.painted.culprit, divergence: pwDivergence, capturePair: report.witness.painted.capturePair, transitions: pwTransitions.map(t => ({ transition: t.transition, operation: t.operation, wholesale: t.wholesale, flung: t.flung.map(f => f.label + ":" + f.metric) })) });
                } catch (pwErr) {
                    report.witness.painted = { frames: { lastKept: witnessPaintedLastKept, before: witnessPaintedBefore, after: witnessPaintedAfter, afterPaint: witnessPaintedAfterPaint, afterSettle: witnessPaintedAfterSettle }, capturePair: null, transitions: [], verdict: "not-observed", culprit: null, divergence: !1, operation: null, error: String(pwErr && pwErr.message || pwErr) };
                }
                // TAIL-END REFRESH (ruled 2026-11-02, Jason):
                // the run's own ending must leave the kept shape
                // standing on screen, with no manual repaint
                // needed. The closing full paint above installs
                // the kept geometry in the DOM — DIAG-03's
                // painted==stored capture on Jason's acceptance
                // drive proved that — yet his end frame still
                // showed the pre-run picture (the annealed cloud
                // standing at its pre-run seat, its overlay
                // number still the pre-run value) until a
                // centre-circle nudge repainted. Between the DOM
                // and the screen sit layers only a later ordinary
                // paint clears: a blit session's raster and vault
                // (in the default repulsion mode a session ends
                // only at a later paint's top gate), any interim
                // capsule remnant, and the separately positioned
                // metric overlay numbers, which re-seat only on
                // a paint. So end the run with ONE ordinary
                // (non-scoped) full repaint of the standing
                // state: its paint-top gate ends any blit session
                // and strips vault and raster, its DOM build
                // installs the standing state exactly as every
                // later user paint would draw it, and the shell's
                // settle watch then re-measures from the
                // repainted map. Display only: the solve state
                // is not written; no solver, throw, ladder, gate,
                // floor or stop-rule state is touched; and every
                // diagnostic capture above (DIAG-03, the
                // final-step and painted-geometry witnesses) is
                // already taken, so no diagnostic readout
                // changes. Guarded like the rest of this ending:
                // a failure is logged and never disturbs the
                // run's return.
                try {
                    const tailPaintResult = Mr({ animate: !1, forceRepaint: !0 });
                    try {
                        if (tailPaintResult && "function" == typeof tailPaintResult.then) await Promise.race([ tailPaintResult, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) {}
                    dkLog.push({ type: "tail-end-refresh", branch: name, closingPaintMode: closingPaintMode });
                } catch (e) { __sxErrLog("layout-anneal-tail-end-refresh", e); }
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01):
                // the run is ending - DIAG-03's Continue was pressed
                // and the witness settle frames above have run - so
                // re-read the camera state once more and land it on
                // the report's diag lines as the after-Continue line,
                // beside the camera line DIAG-03 itself carried, so
                // the receipt compares the two camera states after
                // the run ends. Only on a run whose DIAG-03 actually
                // fired carrying closing-paint traces; read-only, and
                // session-only like every diag record (never written
                // into a saved layout or profile).
                try {
                    if (diagAcceptCtx && report.diag && report.diag.some(d => d && "ANNEAL-DIAG-03" === d.code && d.closingPaint)) {
                        const endCam = diagCamera(), endText = diagCameraText(endCam, "camera after Continue (run end)");
                        report.diag.push({ code: "ANNEAL-DIAG-03", label: "camera after Continue", branch: name, phase: diagAcceptCtx.phase, camera: endCam, closingLines: [ endText ], text: endText, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) });
                        dkLog.push({ type: "anneal-diag", code: "ANNEAL-DIAG-03-END", phase: diagAcceptCtx.phase, branch: name, text: endText });
                        try { console.log("[ANNEAL-DIAG-03] " + endText, endCam); } catch (e) {}
                    }
                } catch (e) {}
            }
            return report;
        }
        h.forEach(e => {
            rn.add(e.name), un.set(catId(e.name), "all"), (e.subcategories || []).forEach(t => {
                const n = Un(e.name, t.name);
                un.set(n, "all"), mn.expandAll && on.add(n);
            }), e.topics.forEach(t => {
                const n = Wn(t);
                un.set(n, "all"), mn.expandAll && on.add(n);
            });
        });
        const fn = new Map;
        let yn = null, bn = 0, vn = null, wn = !1, kn = !0, xn = null, Sn = "all", $n = null, En = !1;
        const An = {
            compact: 12,
            roomy: 20,
            all: Number.POSITIVE_INFINITY
        };
        // Group C1 (Build 2026-10-16_1830): map detail levels. Compact/Medium cap how
        // many child topics an expanded category or subcategory branch shows, most
        // popular first; rated topics always show regardless of the cap.
        // Build 2026-10-17_1447: the map now OPENS in Medium — each expanded
        // branch shows its 7 most popular topics (popularity order, same
        // ordering as list view) instead of every topic. The Compact/Medium/
        // Full toggle in the map controls still lets the user show fewer or
        // more, and the level persists across profile/tab switches.
        // Build 2026-10-18_0343: the map now OPENS in Full — every topic in
        // each expanded branch shows by default; the toggle still lets the
        // user drop back to Medium or Compact.
        let mapDetailLevel = "full";
        const DETAIL_CAPS = {
            compact: 4,
            medium: 7,
            full: Number.POSITIVE_INFINITY
        };
        function topicRatedForDetail(e, t = Vi()) {
            const n = da(e, t);
            return Boolean(n && (n.giveKnown || n.receiveKnown));
        }
        window.__SEXCAPADES_SET_MAP_DETAIL = function(level) {
            if (!Object.prototype.hasOwnProperty.call(DETAIL_CAPS, level) || level === mapDetailLevel) return;
            mapDetailLevel = level, document.querySelectorAll("[data-detail-level]").forEach(e => e.setAttribute("aria-pressed", String(e.dataset.detailLevel === level))), 
            Mr({
                animate: !1,
                forceRepaint: !0
            });
        };
        const Cn = e.byId("mapSvg"), Mn = e.byId("mapScene"), In = e.byId("mapLayer"), Pn = e.byId("mapDefs"), Ln = e.byId("mapSafeFallback"), Tn = e.byId("mapSafeMessage"), Fn = e.byId("mapSafeOpen"), Nn = e.byId("mapSafeReset");
        let Dn = !1, Rn = !1, On = null, Bn = [], jn = !1;
        const qn = {};
        let sxStemFinaliseHook = null;
        function Hn(e) {
            return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        }
        
        function sxName(e) {
            return e && "object" == typeof e ? String(e.name || "") : String(e || "");
        }
        const LEGACY_NODE_IDS = Object.freeze({
    "cat-power-exchange": "c0001",
    "cat-bondage-restriction": "c0002",
    "cat-impact-pain-body-modification": "c0003",
    "cat-sensation-atmosphere": "c0004",
    "cat-roleplay-identity": "c0005",
    "cat-clothing-materials-objects": "c0006",
    "cat-body-focus-appearance": "c0007",
    "cat-psychological-dynamics": "c0008",
    "cat-watching-exposure-settings": "c0009",
    "cat-partner-configurations": "c0010",
    "cat-sex-acts": "c0011",
    "cat-positions": "c0012",
    "cat-orgasm-reproductive-play": "c0013",
    "cat-fluids-messy-play": "c0014",
    "cat-primal-pursuit": "c0015",
    "cat-service-ritual": "c0016",
    "cat-fantasy-transformation": "c0017",
    "cat-connection-aftercare": "c0018",
    "subcategory-bondage-restriction-flexible-ties": "s0001",
    "subcategory-bondage-restriction-restraints": "s0002",
    "subcategory-bondage-restriction-tape-wrapping": "s0003",
    "subcategory-bondage-restriction-sensory": "s0004",
    "subcategory-bondage-restriction-confinement": "s0005",
    "subcategory-bondage-restriction-challenge-bondage": "s0006",
    "subcategory-bondage-restriction-specialty": "s0007",
    "subcategory-impact-pain-body-modification-hand-spanking": "s0008",
    "subcategory-impact-pain-body-modification-flexible-implements": "s0009",
    "subcategory-impact-pain-body-modification-rigid-implements": "s0010",
    "subcategory-impact-pain-body-modification-clamps-pinching": "s0011",
    "subcategory-impact-pain-body-modification-cutting-piercing": "s0012",
    "subcategory-impact-pain-body-modification-genital-pain": "s0013",
    "subcategory-impact-pain-body-modification-extreme": "s0014",
    "subcategory-roleplay-identity-caregiver-little-roles": "s0015",
    "subcategory-roleplay-identity-authority": "s0016",
    "subcategory-roleplay-identity-captivity": "s0017",
    "subcategory-roleplay-identity-animal": "s0018",
    "subcategory-roleplay-identity-historical-fantasy": "s0019",
    "subcategory-clothing-materials-objects-materials": "s0020",
    "subcategory-clothing-materials-objects-footwear": "s0021",
    "subcategory-clothing-materials-objects-uniforms-costumes": "s0022",
    "subcategory-clothing-materials-objects-lingerie-hosiery": "s0023",
    "subcategory-clothing-materials-objects-undergarments": "s0024",
    "subcategory-clothing-materials-objects-masks-headwear": "s0025",
    "subcategory-clothing-materials-objects-objects-toys": "s0026",
    "subcategory-body-focus-appearance-head-hair": "s0027",
    "subcategory-body-focus-appearance-facial-body-hair": "s0028",
    "subcategory-body-focus-appearance-lower-body": "s0029",
    "subcategory-body-focus-appearance-torso": "s0030",
    "subcategory-body-focus-appearance-face": "s0031",
    "subcategory-body-focus-appearance-body-type": "s0032",
    "subcategory-body-focus-appearance-worship": "s0033",
    "subcategory-psychological-dynamics-humiliation": "s0034",
    "subcategory-psychological-dynamics-intimidation": "s0035",
    "subcategory-psychological-dynamics-mind-control": "s0036",
    "subcategory-psychological-dynamics-emotional": "s0037",
    "subcategory-psychological-dynamics-vulnerability": "s0038",
    "subcategory-psychological-dynamics-verbal": "s0039",
    "subcategory-sex-acts-oral": "s0040",
    "subcategory-sex-acts-anal": "s0041",
    "subcategory-sex-acts-manual": "s0042",
    "subcategory-sex-acts-insertion": "s0043",
    "subcategory-sex-acts-fluids": "s0044"
});
        function migrateNodeKey(id) {
            const s = String(id == null ? "" : id);
            return Object.prototype.hasOwnProperty.call(LEGACY_NODE_IDS, s) ? LEGACY_NODE_IDS[s] : s;
        }
        function isCatId(id) {
            if (id == null || id === "") return !1;
            const k = migrateNodeKey(id);
            return h.some(c => c.id === k);
        }
        function isSubId(id) {
            if (id == null || id === "") return !1;
            const k = migrateNodeKey(id);
            return h.some(c => (c.subcategories || []).some(s => s.id === k));
        }
        function nextLevelId(prefix, ids) {
            let max = 0;
            (ids || []).forEach(id => {
                const m = new RegExp("^" + prefix + "(\\d+)$").exec(String(id || ""));
                if (m) max = Math.max(max, Number(m[1]));
            });
            return prefix + String(max + 1).padStart(4, "0");
        }
        function nextCategoryId() {
            return nextLevelId("c", h.map(c => c.id));
        }
        function nextSubcategoryId() {
            const ids = [];
            h.forEach(c => (c.subcategories || []).forEach(s => ids.push(s.id)));
            return nextLevelId("s", ids);
        }
        function nextTopicId() {
            const ids = [];
            h.forEach(c => (c.topics || []).forEach(t => ids.push(t && t.id)));
            Object.values(topicRecords).forEach(rec => ids.push(rec && rec.id));
            return nextLevelId("t", ids);
        }
        function migrateLayoutKeys(patch) {
            if (!patch || "object" != typeof patch) return patch;
            [ "kinkOverrides", "kinkAngleOffsets" ].forEach(name => {
                const map = patch[name];
                if (!map || "object" != typeof map) return;
                Object.keys(map).forEach(key => {
                    const next = migrateNodeKey(key);
                    if (next !== key) {
                        map[next] = map[key];
                        delete map[key];
                    }
                });
            });
            return patch;
        }

        function Wn(e) {
            if (e && "object" == typeof e && e.id) return e.id;
            const t = sxName(e);
            for (const cat of h) for (const topic of cat.topics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
            const n = topicRecords[t] && topicRecords[t].id;
            if (!n) throw new Error(`Missing stored topic ID for "${t}". Assign max(existing ID) + 1 on the topic object.`);
            return n;
        }
        function catId(e) {
            const cat = h.find(c => c.name === String(e || ""));
            if (!cat || !cat.id) throw new Error(`Missing stored category ID for "${e}". Assign max(existing category ID) + 1 on the category; do not derive it from the name.`);
            return cat.id;
        }
        function Un(e, t) {
            const cat = h.find(c => c.name === String(e || ""));
            const sub = cat && (cat.subcategories || []).find(s => s.name === String(t || ""));
            if (!sub || !sub.id) throw new Error(`Missing stored subcategory ID for "${e}" / "${t}". Assign max(existing subcategory ID) + 1 on the subcategory; do not derive it from the name.`);
            return sub.id;
        }
        function Kn(e, t) {
            return "topic-" + Hn(String(e || "")) + "-" + Hn(String(t || ""));
        }
        function zn(e) {
            for (const t of h) for (const n of t.subcategories || []) if (Un(t.name, n.name) === e) return {
                id: e,
                label: n.name,
                branch: t.name,
                kind: "Subcategory",
                risk: t.risk,
                parentId: catId(t.name),
                topics: n.topics
            };
            return null;
        }
        function Vn(e, t) {
            const name = sxName(t);
            return (e.subcategories || []).find(sub => (sub.topics || []).some(topic => sxName(topic) === name)) || null;
        }
        function Yn(e) {
            return e.subcategories?.length ? (e.parentTopics || []).map(Wn).concat(e.subcategories.map(t => Un(e.name, t.name))) : e.topics.map(Wn);
        }
        function Xn(e) {
            const t = zn(e);
            if (t) return t;
            for (const t of h) {
                const n = t.topics.find(t => Wn(t) === e);
                if (n) {
                    const i = Vn(t, n);
                    return {
                        id: e,
                        label: n,
                        branch: t.name,
                        kind: "Topic",
                        risk: Boolean(((t.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                        parentId: i ? Un(t.name, i.name) : null
                    };
                }
            }
            return null;
        }
        function Zn(e, t) {
            if ("give" !== t && "receive" !== t) return "";
            const n = qn[e] || Xn(e) || (at[Vi()] || {})[e], i = n && n.parentId && (qn[n.parentId] || Xn(n.parentId)), a = n && (He[n.label] || i && He[i.label]);
            return a && a["give" === t ? 0 : 1] || "";
        }
        function Qn(e, t = Vi()) {
            const n = qn[e] || Xn(e) || (at[t] || {})[e];
            return n && n.label ? String(n.label).trim().toLowerCase() : "";
        }
        function Jn(e, t, n = Vi()) {
            const i = Ge(e, n);
            if (i.single || "give" !== i.labels[0] || "receive" !== i.labels[1]) return i.labels["give" === t ? 0 : 1] || t;
            const a = Qn(e, n);
            return a ? t + " " + a : t;
        }
        function ei(e, t, n = Vi()) {
            const i = Ge(e, n);
            return i.single || "give" !== i.labels[0] || "receive" !== i.labels[1] ? "" : Jn(e, t, n);
        }
        h.forEach(e => {
            Ke.add(catId(e.name)), (e.subcategories || []).forEach(t => Ke.add(Un(e.name, t.name))), 
            e.topics.forEach(e => Ke.add(Wn(e)));
        });
        const ti = {
            "boss secretary": "Boss / secretary",
            "over the knee otk spanking": "Over-the-knee spanking",
            "abdl diaper play": "ABDL / diaper play",
            "medical doctor nurse": "Doctor / nurse",
            "teacher student": "Teacher / student",
            "predator prey": "Predator / prey",
            "electric play violet wand e stim": "Violet wand / E-stim",
            "penis strap on": "Penis / strap-on",
            "words i enjoy saying hearing slut whore etc": "Humiliation words",
            "anal play": "Anal sex",
            rimming: "Analingus / rimming",
            facefucking: "Face fucking",
            collars: "Collars & symbols",
            paddles: "Paddles & straps",
            cuddling: "Cuddling & touch",
            ageplayer: "Age play",
            threesome: "Threesome"
        };
        function ni(e) {
            let t = String(e || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
            const n = "(?:everything|anything|all)(?:\\s+there\\s+is)?\\s+(?:to\\s+do\\s+)?(?:with|about)\\s+(?:it|this|that)|everything\\s+to\\s+do\\s+with\\s+it|giving(?:\\s*(?:and|&)\\s*receiving)?|receiving|both|switch|as\\s+a\\s+top|as\\s+a\\s+bottom|top|bottom|watching(?:\\s+others\\s+wear(?:ing)?)?|wearing";
            return t = t.replace(new RegExp(`\\s*(?:[—–|,:;]+\\s*)?[\\(\\[\\{]\\s*(?:${n})\\s*[\\)\\]\\}]\\s*$`, "i"), ""), 
            t = t.replace(new RegExp(`\\s*(?:[—–|,:;]+|\\betc\\.?\\s*)\\s*(?:${n})(?:\\s*(?:etc\\.?|and\\s+so\\s+on))?\\s*$`, "i"), ""), 
            t = t.replace(new RegExp(`\\s+(?:${n})\\s*$`, "i"), ""), t = t.replace(/(?:[,;/]\s*)?\betc\.?\s*$/i, "").replace(/\s*[—–|,:;]+\s*$/, "").replace(/\s+/g, " ").trim(), 
            (ti[ck(t)] || t).slice(0, 60);
        }
        function ii(e, t, n) {
            const i = Xn(n);
            if (!i) return null;
            const a = ni(t);
            if (!a) return null;
            const r = "subtopic-" + Hn(n) + "-" + Hn(a);
            return Hn(a) ? (e[r] = {
                id: r,
                label: a,
                parentId: n,
                branch: i.branch,
                kind: "Imported topic",
                risk: i.risk
            }, e[r]) : null;
        }
        function ai(e, t) {
            return Object.values(at[t] || {}).filter(t => t.parentId === e).map(e => e.id);
        }
        function ri() {
            const e = Qi() ? Xi() : [ Vi() ], t = {};
            let n = 0;
            return e.forEach(e => {
                n >= 560 || Object.values(at[e] || {}).some(e => n >= 560 || (t[e.id] || (t[e.id] = e, 
                n++), !1));
            }), Object.values(t);
        }
        function oi(e, t) {
            return `${e}\0${t}`;
        }
        function si(e, t = Vi()) {
            if (!Qi() || !t || !e.startsWith("subtopic-") || (at[t] || {})[e]) return null;
            const n = ca(e, t);
            return n.giveKnown || n.receiveKnown ? null : Xi().filter(e => e !== t).map(t => (at[t] || {})[e]).find(Boolean) || null;
        }
        function li() {
            const e = {};
            let t = 0;
            return Object.values(at).some(n => Object.values(n || {}).some(n => t >= 560 || (e[n.id] || (e[n.id] = n, 
            t++), !1))), Object.values(e);
        }
        function ci(e) {
            const t = qn[e];
            if (t && t.branch) return t.branch;
            for (const t of h) {
                if (e === catId(t.name)) return t.name;
                if ((t.subcategories || []).some(n => e === Un(t.name, n.name))) return t.name;
                if (t.topics.some(t => e === Wn(t))) return t.name;
            }
            return null;
        }
        function di(e, t = Mt) {
            const n = t && ft[t];
            if (!n || "group" !== n.kind || !n.results) return null;
            const i = qn[e] || Xn(e) || (at[t] || {})[e], a = i && i.label;
            return a ? (n.results.matches || []).includes(a) ? "mutual" : (n.results.curiousAbout || []).includes(a) ? "explore" : (n.results.mismatched || []).includes(a) ? "mismatch" : "other" : "other";
        }
        function ui(e, t = Vi()) {
            const n = da(e, t);
            return n.giveKnown && n.receiveKnown;
        }
        function pi(e, t = Vi()) {
            if (ui(e, t)) return !0;
            const n = zn(e);
            return n ? n.topics.some(e => pi(Wn(e), t)) : !isCatId(e) && !isSubId(e) && ai(e, t).some(e => ui(e, t));
        }
        function hi(e, t = Vi()) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id)).some(e => ui(e, t));
        }
        function gi(e, t = Vi()) {
            const n = zn(e);
            return n ? n.topics.some(e => gi(Wn(e), t)) : !ui(e, t) || !isCatId(e) && !isSubId(e) && ai(e, t).some(e => !ui(e, t));
        }
        function mi(e, t = Vi()) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id)).some(e => !ui(e, t));
        }
        function fi(e, t) {
            const n = un.get(e) || "rated", i = "all" === n ? t.slice() : t.filter(e => "rated" === n ? pi(e) : gi(e));
            return {
                mode: n,
                visible: i,
                hidden: t.length - i.length
            };
        }
        function yi(e, t, n, i, a = !1) {
            if (!n && !a) return "";
            const r = `+${n}`, o = Math.max(36, 8 * r.length + 16), s = `${n} hidden ${1 === n ? "child" : "children"}`;
            return e = Math.max(nh.x + o / 2 + 54, Math.min(nh.x + nh.width - o / 2 - 54, e)), 
            t = Math.max(nh.y + 14 + 54, Math.min(nh.y + nh.height - 14 - 54, t)), `<g class="hidden-count-badge" data-id="${Hi(i)}" data-width="${o}" data-height="28" transform="translate(${(e - o / 2).toFixed(2)} ${(t - 14).toFixed(2)})" tabindex="0" role="button" aria-label="${(typeof mx==='function'&&mx(i))||i}: ${s}. Switch between rated and unrated children."><rect width="${o}" height="28" rx="8"/><text x="${(o / 2).toFixed(2)}" y="14" text-anchor="middle" dominant-baseline="middle">${r}</text></g>`;
        }
        function bi(e) {
            const t = h.find(t => t.name === e.branch);
            return "Category" === e.kind ? t ? Yn(t) : [] : "Subcategory" === e.kind ? (e.topics || []).map(Wn) : ai(e.id, Vi());
        }
        function vi(e) {
            const t = qn[e];
            t && bi(t).length && (("Category" === t.kind ? rn.has(t.branch) : on.has(e)) ? (un.set(e, "rated" === un.get(e) ? "unrated" : "rated"), 
            rn.add(t.branch), "Topic" === t.kind && on.add(e), wn = !1, Lt = e, vn = e, Mr()) : Si(e));
        }
        function wi(e) {
            const t = bi(e), n = [];
            return t.forEach(e => {
                n.push(e);
                const t = Xn(e);
                "Subcategory" === t?.kind ? bi(t).forEach(e => {
                    n.push(e, ...ai(e, Vi()));
                }) : n.push(...ai(e, Vi()));
            }), new Set(n);
        }
        let ki = 0;
        function xi(e) {
            t.clear(ki), ki = 0, Mr(e);
        }
        function Si(e) {
            noteFitUserCamera();
            const t = qn[e];
            if (!t) return So(e);
            if (!bi(t).length) return So(e);
            if (wn = !1, "Category" === t.kind) {
                if (!kn) return Ei(), Lt = e, void Mr();
                if (rn.has(t.branch)) {
                    const e = wi(t);
                    return rn.delete(t.branch), Lt = null, void xi({
                        exitIds: e
                    });
                }
                return rn.add(t.branch), Lt = e, Mr(), void (Bt && requestAnimationFrame(() => Th(e, t.branch)));
            }
            if (rn.add(t.branch), on.has(e)) {
                const n = wi(t);
                return on.delete(e), Lt = null, void xi({
                    exitIds: n
                });
            }
            on.add(e), Lt = e, Mr(), Bt && requestAnimationFrame(() => Th(e, t.branch));
        }
        function $i(e) {
            noteFitUserCamera();
            (function(e) {
                const t = Vi(), n = si(e, t);
                if (!n) return !1;
                at[t] || (at[t] = {});
                const i = ii(at[t], n.label, n.parentId);
                return !!i && (Ke.add(i.id), gn.add(oi(t, i.id)), zt(t), rn.add(i.branch), on.add(i.parentId), 
                Lt = i.id, Nt = null, Mr({
                    anchorId: i.id
                }), !0);
            })(e) || Si(e);
        }
        function Ei() {
            xn && (rn.clear(), xn.branches.forEach(e => rn.add(e)), on.clear(), xn.topics.forEach(e => on.add(e))), 
            xn = null, kn = !0;
        }
        function Ai() {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const e = Cn.getAttribute("viewBox");
                e && (Cn.removeAttribute("viewBox"), Cn.getBoundingClientRect(), Cn.setAttribute("viewBox", e));
            }));
        }
        function Ci() {
            let e = null;
            kn ? (e = new Set([ ...rn ].flatMap(e => {
                const t = h.find(t => t.name === e);
                return t ? Yn(t).flatMap(e => {
                    const t = Xn(e);
                    return "Subcategory" === t?.kind ? [ e, ...t.topics.flatMap(e => {
                        const t = Wn(e);
                        return [ t, ...ai(t, Vi()) ];
                    }) ] : [ e, ...ai(e, Vi()) ];
                }) : [];
            })), xn = {
                branches: [ ...rn ],
                topics: [ ...on ]
            }, rn.clear(), on.clear(), kn = !1) : Ei();
            const t = {
                anchorPoint: {
                    x: 900,
                    y: 620
                },
                exitIds: e,
                forceRepaint: !e
            };
            e ? xi(t) : Mr(t);
        }
        const Mi = e.byId("centerProfileCard"), Ii = (e.byId("centerProfileCardTitle"), 
        e.byId("centerProfileAbout")), Pi = (e.byId("centerContactList"), e.byId("profileAboutDialog")), Li = e.byId("profileAboutSubtitle"), Ti = e.byId("profileAboutText"), Fi = e.byId("profileAboutResource"), Ni = [ [ "telegram", "Telegram" ], [ "linktree", "linktr.ee" ], [ "fetlife", "FetLife" ], [ "chaturbate", "Chaturbate" ], [ "stripchat", "Stripchat" ], [ "myfreecams", "MyFreeCams" ], [ "pornhub", "PornHub" ], [ "xvideos", "XVideos" ], [ "xhamster", "xHamster" ], [ "onlyfans", "OnlyFans" ], [ "reddit", "Reddit" ], [ "x", "X" ] ];
        function _i(e, t) {
            const n = encodeURIComponent(t);
            return {
                fetlife: `https://fetlife.com/users/${n}`,
                telegram: `https://t.me/${n}`,
                linktree: `https://linktr.ee/${n}`,
                chaturbate: `https://chaturbate.com/${n}/`,
                x: `https://x.com/${n}`,
                xhamster: `https://xhamster.com/users/${n}`,
                xvideos: `https://www.xvideos.com/profiles/${n}`,
                pornhub: `https://pornhub.com/model/${n}`,
                myfreecams: `https://www.myfreecams.com/${n}`,
                stripchat: `https://stripchat.com/${n}`,
                onlyfans: `https://onlyfans.com/${n}`,
                reddit: `https://reddit.com/user/${n}`
            }[e] || "";
        }
        function Di(e) {
            const t = Rv(e);
            return Ni.filter(([e]) => t[e]).map(([e, n]) => ({
                label: n,
                user: t[e],
                href: _i(e, t[e])
            })).concat((t.customSites || []).map(e => ({
                label: e.site,
                user: e.username,
                href: e.url
            })));
        }
        function Ri() {
            Mi.hidden = !0;
        }
        function Oi() {
            !Object.keys(wt).length ? roxyAbout() : (Ri(), Ci());
        }
        function Bi(e = Vi()) {
            return h.every(t => !ui(catId(t.name), e));
        }
        function ji(t, n = {}) {
            It = t, Mt = t, hn[t] = "saved";
            wn = !1, kn = !0, xn = null, Sn = "all", rn.clear(), on.clear(), Lt = null, 
            Nt = null, Tt = "";
            const a = e.byId("searchInput");
            a && (a.value = "");
            const r = e.byId("topicPicker");
            r && (r.value = "", nc()), h.forEach(e => {
                const n = catId(e.name);
                un.set(n, "all"), rn.add(e.name), (e.subcategories || []).forEach(n => {
                    const i = Un(e.name, n.name);
                    un.set(i, "all"), on.add(i);
                }), e.topics.forEach(e => {
                    const n = Wn(e);
                    un.set(n, "all"), on.add(n);
                });
            });
        }
        function qi(e, t, n = {}) {
            if (n.hasAttentionState) !function(e, t) {
                const n = t => Boolean(qn[t] || Xn(t) || (at[e] || {})[t]), i = new Set((Array.isArray(t && t.nodes) ? t.nodes : []).filter(t => n(t) && !Eo(e, t))), a = new Set((Array.isArray(t && t.newest) ? t.newest : []).filter(t => n(t) && !Eo(e, t)));
                Object.keys(vt[e] || {}).forEach(t => {
                    n(t) && !Eo(e, t) && ((at[e] || {})[t] ? a.add(t) : i.add(t));
                });
                const r = new Set([ ...i, ...a ].map(t => {
                    const n = qn[t] || Xn(t) || (at[e] || {})[t];
                    return n && n.branch || ci(t);
                }).filter(Boolean)), o = Array.isArray(t && t.branches) ? t.branches : [];
                ln[e] = new Set([ ...o, ...r ].filter(t => {
                    const n = catId(t);
                    return (e => h.some(t => t.name === e))(t) && (r.has(t) || ui(n, e) && !Eo(e, n));
                })), cn[e] = i, dn[e] = a;
            }(e, n.attentionState); else {
                const i = function(e) {
                    const t = [], n = new Set, i = e => {
                        e && !n.has(e) && (n.add(e), t.push(e));
                    };
                    return [ "ratings", "annotations", "notes" ].forEach(t => Object.keys(e[t] || {}).forEach(i)), 
                    Object.values(e.children || {}).forEach(e => i(e && e.id)), {
                        changed: t
                    };
                }(t);
                !function(e, t) {
                    const n = ln[e] || new Set, i = cn[e] || new Set, a = dn[e] || new Set;
                    t.forEach(t => {
                        const r = qn[t] || Xn(t) || (at[e] || {})[t], o = r && r.branch || ci(t);
                        o && n.add(o), r && "Topic" === r.kind ? i.add(t) : r && r.parentId && (i.add(r.parentId), 
                        a.add(t));
                    }), ln[e] = n, cn[e] = i, dn[e] = a;
                }(e, n.noFlash ? [] : i.changed);
            }
            ji(e), Jw(), Mr({
                animate: !1,
                forceRepaint: !0
            }), Ih(), Ai();
        }
        function Hi(e) {
            return (e == null ? "" : String(e)).replace(/[&<>"']/g, e => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[e]));
        }
        function Wi(e) {
            var h = window.__sxDialog;
            if (h && h.open) return void h.open(e);
            if (e && !e.open) try {
                "function" == typeof e.showModal ? e.showModal() : (e.setAttribute("open", ""), 
                e.classList.add("fallback-open"));
            } catch (t) {
                e.setAttribute("open", ""), e.classList.add("fallback-open");
            }
        }
        function Ui(e) {
            var h = window.__sxDialog;
            if (h && h.close) return void h.close(e);
            if (e) {
                try {
                    "function" == typeof e.close && e.open ? e.close() : e.removeAttribute("open");
                } catch (t) {
                    e.removeAttribute("open");
                }
                e.classList.remove("fallback-open");
            }
        }
        e.byId("closeCenterProfileCard") && e.byId("closeCenterProfileCard").addEventListener("click", Ri), Ii && Ii.addEventListener("click", function() {
            const e = Ii.dataset.profileId;
            e && vt[e] && (Ri(), bw(e, {
                mode: "about"
            }));
        }), e.byId("closeProfileAbout") && e.byId("closeProfileAbout").addEventListener("click", () => Ui(Pi)), Pi && Pi.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Pi);
        }), e.byId("toggleCenterBranches") && e.byId("toggleCenterBranches").addEventListener("click", () => {
            Ri(), Ci();
        }), e.byId("editCenterProfile") && e.byId("editCenterProfile").addEventListener("click", () => {
            Ri(), bw(Mt);
        }), window.__sxOnPtr( e => {
            Mi.hidden || Mi.contains(e.target) || __sxClosestAction(e.target, "centerHit") || Ri();
        }, !0), (() => {
            let sxTapX = 0, sxTapY = 0, sxTapDown = !1;
            window.__sxOnPtr( e => {
                sxTapX = e.clientX, sxTapY = e.clientY, sxTapDown = !0;
            }, !0);
            document.addEventListener("pointerup", e => {
                if (!sxTapDown) return;
                sxTapDown = !1;
                const dx = e.clientX - sxTapX, dy = e.clientY - sxTapY;
                if (dx * dx + dy * dy > 100) {
                    e.preventDefault(), e.stopPropagation();
                    const t = e.target;
                    t && t.addEventListener("click", function h(ev) {
                        ev.preventDefault(), ev.stopPropagation(), t.removeEventListener("click", h, !0);
                    }, !0);
                }
            }, !0);
        })();
        const Gi = e.byId("unsavedChangesDialog");
        function Ki() {
            const t = jt();
            t && !Gi.open && (e.byId("unsavedChangesQuestion").textContent = `${wt[t] || "This profile"} has changes that are not safely stored yet. Choose what to do before reloading.`, 
            Wi(Gi), requestAnimationFrame(() => e.byId("saveUnsavedToMemory").focus()));
        }
        // Interest-color stops — the one source both interest encodings
        // derive from (map-render refactor, finding 7): zi() interpolates
        // these rgb stops, and Ka's rating-rail CSS gradient uses the
        // same stops as the --red-deep / --curious / --green-deep custom
        // properties (shell :root: #bd4f51 / #d7bd55 / #3da874 — the
        // same values in hex). Change a stop here and in the shell
        // :root together.
        const INTEREST_STOPS = {
            curious: [ 215, 189, 85 ],
            positive: [ 61, 168, 116 ],
            negative: [ 189, 79, 81 ]
        };
        function zi(e) {
            e = Number(e) || 0;
            // The --curious value is read once and cached on the function
            // (finding 8): zi is called per spoke per render and
            // getComputedStyle forces style recalculation. No theme
            // switch exists in the app, so nothing invalidates the cache.
            if (0 === e) return zi._curious ??= getComputedStyle(document.documentElement).getPropertyValue("--curious").trim();
            const n = Math.min(1, Math.abs(e) / 100), i = INTEREST_STOPS.curious, a = e > 0 ? INTEREST_STOPS.positive : INTEREST_STOPS.negative;
            return `rgb(${Math.round(i[0] + (a[0] - i[0]) * n)},${Math.round(i[1] + (a[1] - i[1]) * n)},${Math.round(i[2] + (a[2] - i[2]) * n)})`;
        }
        function Vi() {
            return Mt || Et;
        }
        function Yi() {
            return Array.from(en).filter(e => vt[e]);
        }
        // Profiles-data F2: the chosen set changes ONLY through sxSel(),
        // and sxSel() is the only place the comparison-active flag (an)
        // is written: after every mutation the flag is re-derived from
        // the set (active exactly when the set holds more than one live
        // member). No caller hand-syncs the flag any more, so the set
        // and the flag cannot disagree — toggling a second profile in
        // now leaves comparison active. The flag stays a cache for one
        // reason: sxSel's "dismiss" operation (Hide group overlay)
        // clears the flag while leaving the chosen set untouched, as
        // that button has always behaved; a pure derivation cannot
        // express it without changing which profiles are chosen.
        function sxSel(e, t = "add") {
            if ("dismiss" === t) return void (an = !1);
            if ("clear" === t) en.clear();
            else if ("set" === t) en.clear(), (e || []).forEach(e => en.add(e));
            else if ("remove" === t) en.delete(e);
            else if ("toggle" === t) en.has(e) ? en.delete(e) : en.add(e);
            else en.add(e);
            an = Yi().length >= 2;
        }
        function Xi() {
            const e = Yi();
            return an && e.length >= 2 ? e : Mt && vt[Mt] ? [ Mt ] : [];
        }
        function Zi(e) {
            sxSel(null, "clear"), vt[e] && la(e);
        }
        function sxAutoSelect(id) {
            if (!vt[id]) return;
            if (!en.size && Mt && vt[Mt] && Mt !== id) {
                sxSel(Mt), la(Mt);
            }
            sxSel(id), la(id), Jw();
        }
        // Load landing (load-target stage, 2026-10-27): a load ends
        // on the loaded profile's own tab — ACTIVATED and SELECTED —
        // and never opens the comparison overlay or a group map.
        // The chosen set keeps every loaded profile slated for
        // multi-select; the comparison (crossmatch) appears only
        // when the bowtie or circle-dot button is fired, so after
        // selecting, the overlay flag is dismissed while the set is
        // left untouched. Quiet bundle creates keep their own landing
        // (their caller activates the last profile), and a share-link
        // boot keeps its pinned behavior (F7: no auto-select, no join).
        function sxLoadLanding(id, opts = {}) {
            if (!id || !vt[id] || opts.quiet || "share-link" === opts.source) return;
            opts.autoSelect || sxSel(id), sxSel(null, "dismiss"), ak(id), Jw();
        }
        function Qi() {
            return an && Xi().length >= 2;
        }
        function Ji(e) {
            return String(e || "").trim().split(/\s+/)[0] || "";
        }
        e.byId("stayWithUnsavedChanges") && e.byId("stayWithUnsavedChanges").addEventListener("click", () => Ui(Gi)), e.byId("saveUnsavedToMemory") && e.byId("saveUnsavedToMemory").addEventListener("click", () => {
            const e = jt(), t = window.SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x"), n = window.Sexcapades2xRememberProfiles;
            t && !t.checked && (t.checked = !0, t.dispatchEvent(new Event("change"))), n && "function" == typeof n.saveNow && n.saveNow() ? (e && Vt(e), 
            Ui(Gi), tS("Changes saved to profile memory.")) : tS("Could not save these changes to profile memory.", {
                tone: "error",
                persistent: !0
            });
        }), e.byId("exportUnsavedNow") && e.byId("exportUnsavedNow").addEventListener("click", () => {
            const e = jt();
            e && (Ui(Gi), Jf(e));
        }), e.byId("reloadWithUnsavedChanges") && e.byId("reloadWithUnsavedChanges").addEventListener("click", () => {
            qt = !0, document.documentElement.classList.remove("has-unsaved-changes"), document.body.classList.remove("has-unsaved-changes"), 
            location.reload();
        }), Gi.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Gi);
        }), window.__sxOnKey( e => {
            jt() && !Gi.open && ("F5" === e.key || (e.ctrlKey || e.metaKey) && "r" === e.key.toLowerCase()) && (e.preventDefault(), 
            e.stopImmediatePropagation(), Ki());
        }, !0), document.addEventListener("touchstart", e => {
            if (!jt() || 1 !== e.touches.length || document.scrollingElement && document.scrollingElement.scrollTop > 1) return;
            if (__sxClosestAction(e.target, "interactiveAncestor")) return;
            const t = e.touches[0];
            t.clientY > 96 || (Ht = {
                x: t.clientX,
                y: t.clientY
            });
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchmove", e => {
            if (!Ht || 1 !== e.touches.length) return;
            const t = e.touches[0], n = t.clientX - Ht.x, i = t.clientY - Ht.y;
            i > 18 && i > 1.35 * Math.abs(n) && e.preventDefault(), i >= 72 && i > 1.35 * Math.abs(n) && (Ht = null, 
            Ki());
        }, {
            capture: !0,
            passive: !1
        }), document.addEventListener("touchend", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchcancel", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        });
        // Center-node geometry (ea) — derivation note. These values are
        // frozen baselines, reached by successive rescalings of the center
        // node (builds 2026-10-17_1446, 2026-10-17_2027, 2026-10-18_0343,
        // 2026-10-18_1449, 2026-10-19_0119): the photo disc and at-a-glance
        // rings were grown until the outer ring's edge sat ~3 units clear
        // of the nearest first-generation label anchor (lineStartRadius +
        // 105 = 1315.17); the gen-1 spoke starts were then moved onto the
        // ring's exterior edge (spokeStartRadius = glanceRadii[0] + ring
        // stroke / 2); and the rings were finally respaced to an exact
        // 44-unit radial pitch, tiling edge to edge, with the innermost
        // ring's inner edge unchanged (photoRadius + 5.73 clearance).
        // outerRadius / lineStartRadius never moved: they are the layout
        // and label anchors. The full build-by-build history is preserved
        // in the map-render refactor completion report (2026-10-25).
        const MAP_CENTER_X = 900, MAP_CENTER_Y = 620, BRANCH_TOGGLE_DROP = 184.06;
        const ea = {
            photoRadius: 897.58,
            glanceRadii: [ 1013.31, 969.31, 925.31 ],
            outerRadius: 1200,
            lineStartRadius: 1210.17,
            spokeStartRadius: 1035.31,
            branchToggleY: 1839.37
        };
        // Font-as-master-knob, part 3 (Build 2026-10-19_0948): the layout
        // parameter centerRingScale (Layout Editor "Center ring scale",
        // layout-centerRingScale hash param, default 1) rescales the
        // center node independently of fontScale. eaBase freezes the 1.0
        // values; refreshCenterRing() re-derives the live ea radii from
        // them on every render (called at the top of Mr() and once here),
        // so moving the slider rescales the node live with no reload and
        // at 1.0 every radius is exactly its pre-part-3 value. Scaled:
        // photoRadius (photo circle, clip, hit disc, name arc), the three
        // glanceRadii (at-a-glance rings), and spokeStartRadius (gen-1
        // spoke starts at the ring's outer edge). NOT scaled:
        // outerRadius/lineStartRadius (layout + label anchors).
        // FQ2-BAKEIN (A4): branchToggleY is no longer a fixed constant —
        // refreshCenterRing() derives it from the scaled ring (see below).
        const eaBase = {
            photoRadius: ea.photoRadius,
            glanceRadii: ea.glanceRadii.slice(),
            spokeStartRadius: ea.spokeStartRadius
        };
        function centerRingScale() {
            const v = Number(mn && mn.centerRingScale);
            return Number.isFinite(v) && v > 0 ? v : 1;
        }
        // ICON DEPTH LAW (ruled 2026-11-02, Jason; SQUARE-ROOT
        // form — the owner adopted the same day's square-root
        // draft at 17:05, superseding the linear (0.6)^depth x R
        // law built earlier that day; the two-thirds base is
        // kept, as ruled; RADIUS reading ruled 13:38 the same
        // day — "I meant radius"): a node's icon RADIUS is
        // (2/3)^depth x sqrt(R x W) — the depth-scaled
        // geometric mean of R, the centre-disc radius
        // (ea.photoRadius = 897.58 x centerRingScale, set by
        // the Center circle slider; eaBase.photoRadius is the
        // fallback), and W, the ring width midlineStrokeWidth()
        // = 22 x mapFontScale() (the same width sxFontMaster()
        // reads as the font master F). Icons therefore grow
        // only as the square root when either slider rises,
        // instead of linearly with the centre alone. Depth 1 =
        // categories, depth 2 = subcategories AND kinks
        // hanging straight off a category, depth 3 = kinks
        // under a subcategory, imported children included. At
        // the baked defaults (fontScale 120, centre 90: R =
        // 80,782.20, W = 2,640, sqrt(RW) = 14,603.60) the depth
        // radii are 9,735.73 / 6,490.49 / 4,326.99 (diameters
        // double those). Sliders and tags scale by depth
        // exactly like the fonts (sxControlScale below — see
        // Ka / renderKinkLine control scales and sxSccBuild's
        // tagM); the icon ladder (2/3) and the font ladder
        // stay independent (font law since 2026-11-02 17:24:
        // sqrt(R x W) x (2/3)^(depth-1) for depths 1-3, glance
        // at W; the earlier (8/9)^depth font ladder is
        // superseded history). The pr.*Icon seeds remain
        // ONLY as solver estimate-space inputs and as the
        // slider-scale normalization (seed / 48); nothing
        // painted reads them for icon size any more.
        // ICON MINIMUM (ruled 2026-11-02 13:27, Jason): no
        // icon draws smaller than the current floor, and the
        // floor rises and falls with the FONT slider. No
        // single icon floor exists elsewhere in the code
        // (there is no 44px icon floor); the floor used here
        // is the one the spoke-trim helpers already enforce
        // — the 12-unit radius clamp in
        // SpokeGeometry.buildTipCircle (Math.max(12,
        // iconSize / 2)) and in renderKinkLine's leaf trim —
        // taken font-scaled, as ruled: minimum icon RADIUS =
        // 12 x mapFontScale() (1,440 world units at the baked
        // fontScale 120; minimum diameter 2,880). Under the
        // square-root law the floor binds nowhere at the baked
        // defaults — it binds only when the centre is small
        // or the font large.
        function sxIconRadius(depth) {
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.max(Math.pow(2 / 3, depth) * Math.sqrt(base * midlineStrokeWidth()), 12 * mapFontScale());
        }
        function sxIconDiameter(depth) {
            return 2 * sxIconRadius(depth);
        }
        // FONT DEPTH LADDER: the current law is the FONT LAW note
        // on sxFontSize below. Glance labels (depth 0) stay at the
        // slider basis W = 22 x mapFontScale(). Depths 1-3 use
        // sqrt(R x W), then x (2/3) per deeper level. The old
        // (8/9)^depth ladder is superseded and sizes nothing.
        // Baked defaults are text 120 and centre 90.
        function sxFontMaster() {
            return midlineStrokeWidth();
        }
        // FONT LAW (ruled 2026-11-02 17:24 CST, Jason; built
        // 2026-11-03, superseding the (8/9)^depth ladder above):
        // glance labels (depth 0) stay at the slider's basis
        // W = sxFontMaster() = 22 x mapFontScale(); depths 1-3
        // ride the square-root law the icons use, offset one
        // level: depth 1 (categories) = sqrt(R x W), depth 2
        // (subcategories AND kinks hanging straight off a
        // category) = (2/3) sqrt(R x W), depth 3 (kinks under
        // a subcategory) = (4/9) sqrt(R x W), where R is the
        // centre-disc radius from the same source sxIconRadius
        // reads (ea.photoRadius, eaBase.photoRadius fallback)
        // and W = midlineStrokeWidth(). The font helper shares
        // the sqrt(R x W) subexpression with sxIconRadius but
        // does NOT inherit the icon floor (12 x mapFontScale):
        // fonts are never floored. At the baked defaults
        // (fontScale 120, centre 90: W = 2,640, R = 80,782.20,
        // sqrt(RW) = 14,603.60) the sizes are glance 2,640,
        // depth 1 = 14,603.60, depth 2 = 9,735.73, depth 3 =
        // 6,490.49 — the category text is ~5.5 ring-widths,
        // LARGER than the at-a-glance rings (owner's ruling
        // 2026-11-03 01:18 CST). sxFontFactor stays the
        // dimensionless ratio sxFontSize(depth) / F so every
        // follower scaled by it (Ga widths, Ka controls,
        // strokes, tags) tracks the new law without rescaling.
        function sxFontSize(depth) {
            if (!(depth > 0)) return sxFontMaster();
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.pow(2 / 3, depth - 1) * Math.sqrt(base * midlineStrokeWidth());
        }
        function sxFontFactor(depth) {
            return sxFontSize(depth) / sxFontMaster();
        }
        function sxFontCoef(depth) {
            return 22 * sxFontFactor(depth);
        }
        // SLIDER / TAG + STROKE DEPTH LADDER (ruled 2026-11-02
        // 14:51 and 14:52, Jason): sliders and tags scale in the
        // same way as the fonts, by depth from the ring-width
        // font master — the plain font scale times
        // sxFontFactor(depth): since the 2026-11-02 17:24
        // font law the factor is sxFontSize(depth) / F —
        // depth 1 sqrt(R/W), then x (2/3) per level — so
        // sliders, tags and strokes follow the FONT sizes
        // (the historical (8/9)^depth factors, depth 1 8/9,
        // depth 2 64/81, depth 3 512/729, are superseded).
        // The spoke stroke widths follow too: a spoke at a
        // depth is stroked at sxStrokeWidth(depth) =
        // sxFontSize(depth),
        // and its outline and tapered-stem base widths scale by
        // the same factor, so a spoke's whole body thins with
        // its depth. sxControlScale keeps the historical
        // per-type seed normalization (seed / 48, clamped
        // .62–1.25) the Ka / renderKinkLine controls and
        // sxSccBuild's tagM have always used, and multiplies it
        // by the depth factor. Depths are the icon/font depths:
        // 1 = category spokes, 2 = subcategory spokes and
        // kinks hanging straight off a category, 3 = kinks
        // under a subcategory (imported children included).
        // NOT laddered: the centre glance rings (they are the
        // master), the fixed screen-px hit strokes and the
        // 44px tap geometry (CSS vars / sxRailPx caps stay as
        // they are; each control now also publishes its own
        // depth-scaled rail thickness as scoped CSS vars), and
        // the solver estimate-space allowances (rr.*), which
        // never painted.
        function sxControlScale(depth, seed) {
            return Math.max(.62, Math.min(1.25, (Number(seed) || 48) / 48)) * mapFontScale() * sxFontFactor(depth);
        }
        function sxStrokeWidth(depth) {
            return sxFontSize(depth);
        }
        // Canonical stroke at the current font scale (BAND-SHRINK,
        // ruled 2026-11-02, Jason: "the band shrinks to fit the
        // letters; the 44 shrinks to 22"): the ring
        // thickness the midline strokes (Ka, renderKinkLine),
        // Ga.outlineWidth / Ga.CLOUD_OUTLINE_WIDTH, and
        // refreshCenterRing's w all derive from. Ga.midlineWidth
        // and MIDLINE_SCALE are gone; this 22 x mapFontScale
        // stroke is the only midline width.
        function midlineStrokeWidth() {
            return 22 * mapFontScale();
        }
        function refreshCenterRing() {
            const s = centerRingScale();
            ea.photoRadius = eaBase.photoRadius * s;
            // Pitch = stroke (label-scale repair): the rings anchor to
            // the scaled disc (radius follows centerRingScale) but step
            // outward by exactly one ring thickness w, and w follows the
            // FONT scale — so the three bands tile edge to edge at every
            // combination of the two independent scales. (Previously the
            // radii scaled by s while the CSS stroke stayed a fixed 44,
            // opening gaps of 44*(s-1).) BAND-SHRINK (2026-11-02): w is
            // now 22 * font scale, so the bands tile edge to edge at
            // the new width and the s = 1 radii sit one half-stroke
            // closer to the disc than the frozen eaBase values (which
            // were struck at w = 44); eaBase stays the frozen
            // reference the clearance below was derived from.
            // GLANCE_INNER_CLEARANCE is the
            // frozen 1.0-baseline gap between the photo edge and the
            // innermost ring's inner edge: 925.31 - 44/2 - 897.58 = 5.73
            // (eaBase.glanceRadii[2], base stroke 44, eaBase.photoRadius).
            // At s = 1 and w = 44 this reproduced the eaBase values
            // exactly: glanceRadii [1013.31, 969.31, 925.31] and
            // spokeStartRadius 1035.31 (the outer ring's outer edge,
            // 1013.31 + 44/2). Since the band shrink (w = 22 at font
            // scale 1) the same formulas give [958.31, 936.31, 914.31]
            // and spokeStartRadius 969.31 — pitch = w preserved.
            // eaBase.glanceRadii stays the frozen 1.0 reference. The stroke itself is published as the
            // --glance-ring-width CSS variable, consumed by the
            // .center-glance-ring-track/-value/-hit rules so the track,
            // value, and hit strokes all equal w on every render.
            // Derived values are rounded to 2 decimals (the precision of
            // every eaBase value) so the s = 1 / w = 44 baseline is
            // byte-exact, with no floating-point dust in the emitted radii.
            const GLANCE_INNER_CLEARANCE = 5.73, w = midlineStrokeWidth(), innerEdge = ea.photoRadius + GLANCE_INNER_CLEARANCE, r2 = v => Math.round(v * 100) / 100;
            ea.glanceRadii = [ r2(innerEdge + 5 * w / 2), r2(innerEdge + 3 * w / 2), r2(innerEdge + w / 2) ];
            ea.spokeStartRadius = r2(innerEdge + 3 * w);
            document.documentElement.style.setProperty("--glance-ring-width", String(w));
            // FQ2-BAKEIN (A4, position driver): the center "+N branches"
            // toggle follows the center ring. At scale 1 its fixed Y
            // (1839.37) sat 184.06 world units below the outer ring's
            // outer edge (ring bottom 620 + 1035.31 = 1655.31). Deriving
            // Y as centerY + scaled spokeStartRadius + 184.06 preserves
            // that exact offset at every centerRingScale.
            ea.branchToggleY = MAP_CENTER_Y + ea.spokeStartRadius + BRANCH_TOGGLE_DROP;
        }
        refreshCenterRing();
        // Gen-1 spoke base circle radius: the base disc IS the center ring
        // (each category spoke's base arc hugs the ring's outer edge), so
        // the base radius derives directly from the scaled ring radius —
        // no separate control. The per-spoke base WIDTH is set in
        // Za.categoryTaperBaseWidth: TAPER_BASE_FRACTION (0.78) of the
        // chord 2R sin(π/18), the 18-slot equispaced pitch at the ring's
        // outer edge R (slot arc length 2πR/18), CAPPED at the tuned-era
        // value (TAPER_BASE_CAP, the R = 300 chord — TAPER-BASE
        // RE-ANCHOR, 2026-11-02) so bases no longer grow with the ring;
        // the cap only ever shrinks the chord term, so bases always
        // keep a margin from their neighbours.
        function gen1SpokeBaseRadius() {
            return ea.spokeStartRadius;
        }
        function ta(e) {
            const t = Uc(), n = t.length, i = t.filter(t => {
                const n = (e || {})[t];
                return "number" == typeof n || Boolean(n && "object" == typeof n && (Object.prototype.hasOwnProperty.call(n, "give") || Object.prototype.hasOwnProperty.call(n, "receive")));
            }).length;
            return {
                rated: i,
                total: n,
                percent: n ? Math.round(i / n * 100) : 0
            };
        }
        function na(e = Xi()) {
            const t = Mt && ft[Mt] && "group" === ft[Mt].kind ? ft[Mt] : null, n = t && e.length < 2 ? t.sourceProfiles || [] : e.filter(e => e === Et || vt[e]).map(e => ({
                ratings: e === Et ? At : vt[e]
            }));
            if (!n.length) return {
                rated: 0,
                total: Uc().length,
                percent: 0
            };
            const i = n.map(e => ta(e.ratings || {})), a = i.reduce((e, t) => e + t.rated, 0), r = i.reduce((e, t) => e + t.total, 0);
            return {
                rated: a,
                total: r,
                percent: r ? Math.round(a / r * 100) : 0
            };
        }
        function aa(e, t, n = "") {
            const i = Math.max(1, Number(e.width) || 1), a = Math.max(1, Number(e.height) || 1), r = Math.max(1, Number(e.cropZoom) || 1), o = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), s = Math.max(t.w / i, t.h / a) * r, l = i * s, c = a * s, d = Number(e.cropX), u = Number(e.cropY), p = A(Number.isFinite(d) ? d : .5), h = A(Number.isFinite(u) ? u : .5), g = t.w / 2 - p * l, m = t.h / 2 - h * c;
            return `<svg${n ? ` class="${n}"` : ""} x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}" overflow="hidden"><image href="${e.data}" x="${g.toFixed(4)}" y="${m.toFixed(4)}" width="${l.toFixed(4)}" height="${c.toFixed(4)}" preserveAspectRatio="none" transform="rotate(${o.toFixed(2)} ${(t.w / 2).toFixed(2)} ${(t.h / 2).toFixed(2)})"/></svg>`;
        }
        function ra(e, t) {
            const n = Math.max(0, Math.min(100, Number(e) || 0)), i = 620 - t;
            if (n <= 0) return "";
            if (n >= 100) return `M 900 ${i} A ${t} ${t} 0 1 1 900 ${620 + t} A ${t} ${t} 0 1 1 900 ${i}`;
            const a = -Math.PI / 2 + 2 * Math.PI * n / 100, r = 900 + t * Math.cos(a), o = 620 + t * Math.sin(a);
            return `M 900 ${i} A ${t} ${t} 0 ${n > 50 ? 1 : 0} 1 ${r.toFixed(3)} ${o.toFixed(3)}`;
        }
        function oa() {
            const e = 3 === pc.length ? pc : [ {
                label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                count: 0,
                percent: 0,
                color: "var(--green)"
            }, {
                label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                count: 0,
                percent: 0,
                color: "var(--curious)"
            }, {
                label: "Not topics", // FQ2-BAKEIN: "No" -> "Not topics"
                count: 0,
                percent: 0,
                color: "var(--red)"
            } ], t = ea.glanceRadii, n = [ "Green", "Yellow", "Red" ], i = [ "green", "yellow", "red" ];
            return `<g class="center-glance-rings">${e.map((e, a) => `<g class="center-glance-ring"><circle class="center-glance-ring-track is-${i[a]}" cx="900" cy="620" r="${t[a]}"/><path class="center-glance-ring-value is-${i[a]}" id="centerGlanceRing${n[a]}" data-ring-radius="${t[a]}" d="${ra(e.percent, t[a])}" style="opacity:${e.percent ? 1 : 0}"/><circle class="center-glance-ring-hit" data-center-glance-index="${a}" cx="900" cy="620" r="${t[a]}" tabindex="0" role="button" aria-label="${Hi(e.label)}, ${e.percent} percent, ${e.count} ${1 === e.count ? "topic" : "topics"}. Open rating details."/></g>`).join("")}</g>`;
        }

        function syncGlobalVisibilityControl() {
            // LR-G5: the rating state (Sn) used to be mirrored into a
            // hidden button's textContent (former id layoutRatedToggle);
            // it now lives in the visible Topics shown radio group
            // itself — syncing checks the radio whose value is Sn.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.checked = r.value === Sn;
            });
        }
        function setGlobalTopicVisibility(t) {
            Sn = "rated" === t || "unrated" === t ? t : "all", kn = !0, xn = null;
            h.forEach(t => {
                un.set(catId(t.name), Sn), (t.subcategories || []).forEach(n => un.set(Un(t.name, n.name), Sn)),
                t.topics.forEach(t => un.set(Wn(t), Sn));
            }), Object.keys(qn).forEach(e => un.set(e, Sn)), syncGlobalVisibilityControl(), Mr({
                animate: !1,
                forceRepaint: !0
            });
        }
        {
            // LR-G5: the Topics shown radios drive global visibility
            // directly. The editor's change handler used to click the
            // hidden button (former id layoutRatedToggle) in a loop
            // until its text matched the chosen radio; the radios' own
            // change events now call the same setGlobalTopicVisibility
            // the button's click handler cycled into.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.addEventListener("change", function() {
                    if (r.checked) setGlobalTopicVisibility(r.value);
                });
            }), syncGlobalVisibilityControl();
        }
        function sa(e) {
            if (mn.staticMap) return;
            e.target && e.target.closest && __sxClosestAction(e.target, "centerBranchToggle") && ("keydown" === e.type && "Enter" !== e.key && " " !== e.key || (e.preventDefault(),
            e.stopImmediatePropagation(), setGlobalTopicVisibility("rated" === Sn ? "all" : "rated")));
        }
        function la(e) {
            if (!tn[e]) {
                const t = new Set(Object.values(tn));
                tn[e] = nn.find(e => !t.has(e)) || nn[Object.keys(tn).length % nn.length];
            }
            return tn[e];
        }
        function ca(e, t) {
            const n = (t === Et ? At : vt[t] || {})[e];
            if ("number" == typeof n) return {
                give: n,
                receive: n,
                giveKnown: !0,
                receiveKnown: !0
            };
            if (n && "object" == typeof n) {
                const e = Object.prototype.hasOwnProperty.call(n, "give"), t = Object.prototype.hasOwnProperty.call(n, "receive");
                return {
                    give: e && Number(n.give) || 0,
                    receive: t && Number(n.receive) || 0,
                    giveKnown: e,
                    receiveKnown: t
                };
            }
            return {
                give: 0,
                receive: 0,
                giveKnown: !1,
                receiveKnown: !1
            };
        }
        function da(e, t) {
            const U = (give, receive, gk, rk, gd, rd, gr, rr, total) => ({
                give: give,
                receive: receive,
                giveKnown: gk,
                receiveKnown: rk,
                giveDerived: gd,
                receiveDerived: rd,
                giveRatedChildren: gr,
                receiveRatedChildren: rr,
                childCount: total
            });
            if (isCatId(e)) {
                const c = h.find(c => catId(c.name) === e);
                if (!c) return U(0, 0, !1, !1, !1, !1, 0, 0, 0);
                const d = ca(e, t), g = cuCat(c, t, "give"), r = cuCat(c, t, "receive"), gv = d.giveKnown ? d.give : g.value, rv = d.receiveKnown ? d.receive : r.value;
                return U(null === gv ? 0 : gv, null === rv ? 0 : rv, null !== gv, null !== rv, !d.giveKnown && null !== g.value, !d.receiveKnown && null !== r.value, d.giveKnown ? 0 : g.rated, d.receiveKnown ? 0 : r.rated, g.total);
            }
            const z = zn(e);
            if (z) {
                const d = ca(e, t), ids = z.topics.map(Wn).concat(ai(e, t)), ch = ids.map(id => da(id, t)), one = dir => {
                    if (d[dir + "Known"]) return {
                        value: d[dir],
                        rated: 0,
                        direct: !0
                    };
                    const k = ch.filter(c => c[dir + "Known"]);
                    return k.length ? {
                        value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                        rated: k.length
                    } : {
                        value: null,
                        rated: 0
                    };
                }, g = one("give"), r = one("receive");
                return U(null === g.value ? 0 : g.value, null === r.value ? 0 : r.value, null !== g.value, null !== r.value, !g.direct && null !== g.value, !r.direct && null !== r.value, g.rated, r.rated, ids.length);
            }
            const n = ca(e, t);
            if (!Xn(e)) return U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0);
            const ids = ai(e, t);
            if (!ids.length) return U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0);
            const ch = ids.map(id => da(id, t)), one = dir => {
                if (n[dir + "Known"]) return {
                    value: n[dir],
                    rated: 0,
                    derived: !1,
                    known: !0
                };
                const k = ch.filter(c => c[dir + "Known"]);
                return k.length ? {
                    value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                    rated: k.length,
                    derived: !0,
                    known: !0
                } : {
                    value: 0,
                    rated: 0,
                    derived: !1,
                    known: !1
                };
            }, g = one("give"), r = one("receive");
            return U(g.value, r.value, g.known, r.known, g.derived, r.derived, g.rated, r.rated, ids.length);
        }
        function ua(e, t) {
            const n = ca(e, t), i = [];
            return n.giveKnown && i.push(n.give), n.receiveKnown && i.push(n.receive), i.length ? i.reduce((e, t) => e + t, 0) / i.length : null;
        }
        function pa(e, t, n) {
            let i = 0, a = 0;
            return e.forEach(e => {
                const r = n(e);
                null != r && (i += r, a++);
            }), a ? Math.max(-100, Math.min(100, i / a)) : null;
        }
        function ha(e, t, n) {
            const i = ca(e, t);
            return "give" === n ? i.giveKnown ? i.give : null : i.receiveKnown ? i.receive : null;
        }
        function ga(e, t) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id));
        }
        function ma(e, t) {
            return pa(ga(e, t), t, e => ua(e, t));
        }
        function smSub(e, t, n, i) {
            const a = (e?.topics || []).map(Wn).concat(i ? ai(i, t) : []);
            return pa(a, t, e => ha(e, t, n));
        }
        function sgSub(e) {
            for (const t of h) for (const n of t.subcategories || []) if (Un(t.name, n.name) === e) return n;
            return null;
        }
        function cuCat(e, t, n) {
            const s = e.subcategories || [], u = [];
            if (!s.length) ga(e, t).forEach(x => u.push(ha(x, t, n))); else {
                (e.parentTopics || []).forEach(l => u.push(ha(Wn(l), t, n)));
                s.forEach(g => u.push(smSub(g, t, n, Un(e.name, g.name))));
                const d = new Set(s.map(g => Un(e.name, g.name)));
                Object.values(at[t] || {}).filter(x => x.branch === e.name && !d.has(x.parentId)).forEach(x => u.push(ha(x.id, t, n)));
            }
            const k = u.filter(v => null != v);
            return {
                value: k.length ? Math.max(-100, Math.min(100, k.reduce((a, b) => a + b, 0) / k.length)) : null,
                rated: k.length,
                total: u.length
            };
        }
        function fa(e, t, n) {
            return cuCat(e, t, n).value;
        }
        function ya(e, t, n, i) {
            if (null == i && e) for (const c of h) {
                const s = (c.subcategories || []).find(s => s === e);
                if (s) {
                    i = Un(c.name, s.name);
                    break;
                }
            }
            return smSub(e, t, n, i);
        }
        function ba(e) {
            const t = Math.round(Number(e) || 0);
            return t > 0 ? "+" + t : String(t);
        }
        function va(e, t = Vi()) {
            if (Rt) return "Rating value hidden in Blind match.";
            const n = Qi() ? Ua(e) : null;
            if (n) return `Heat map value: ${n.count} of ${n.total} overlaid profiles are into this.`;
            if (isCatId(e)) {
                const n = h.find(t => catId(t.name) === e);
                if (!n) return "Unrated.";
                const i = fa(n, t, "give"), a = fa(n, t, "receive"), o = [];
                return null !== i && o.push(`give ${ba(i)}`), null !== a && o.push(`receive ${ba(a)}`), o.length ? "Category values: " + o.join(" · ") + "." : "Unrated.";
            }
            const z = zn(e);
            if (z) {
                const g = sgSub(e), gv = g ? smSub(g, t, "give", e) : null, rv = g ? smSub(g, t, "receive", e) : null, a = [];
                return null !== gv && a.push(`give ${ba(gv)}`), null !== rv && a.push(`receive ${ba(rv)}`), a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
            }
            const i = ca(e, t), a = [];
            return i.giveKnown && a.push(`give ${ba(i.give)}`), i.receiveKnown && a.push(`receive ${ba(i.receive)}`), a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
        }
        function wa(e, t, n = Vi()) {
            return `${lo(t)} ${va(e, n)}`;
        }
        function ka(e, t, n = "", i = {}) {
            const a = [ t, n ].filter(Boolean).join(" "), r = i.tapFirst ? " data-tooltip-tap-first" : !1 === i.hoverOnly ? "" : " data-tooltip-hover-only";
            return ` data-ui-tooltip="${Hi(a)}" data-tooltip-name="${Hi(e || "Details")}" data-tooltip-definition="${Hi(t || "")}" data-tooltip-value="${Hi(n || "")}"${r}`;
        }
        function xa(e, t = Vi()) {
            return va(e, t).replace(/^(?:Category|Rating) values?:\s*/i, "").replace(/\.$/, "");
        }
        function Sa(e, t, n = Vi(), i = {}) {
            return ka(t?.label || "Topic", lo(t), xa(e, n), i);
        }
        function $a(e, t, n = Vi()) {
            const i = ei(e, t, n) || Jn(e, t, n), a = da(e, n);
            return `${i}. ${a[t + "Known"] ? `Rating ${ba(a[t])}.` : "Unrated."}`;
        }
        function Ea(e, t = {}, n = {}, i = {}) {
            const a = e.topics.map(e => Wn(e)).concat(Object.values(i || {}).filter(t => t && t.branch === e.name).map(e => e.id));
            let r = null;
            return a.forEach(e => {
                if (n && "favorite" === n[e]) return void (r = 100);
                const i = t && t[e];
                "number" == typeof i ? r = null === r ? Number(i) : Math.max(r, Number(i)) : i && "object" == typeof i && [ "give", "receive" ].forEach(e => {
                    Object.prototype.hasOwnProperty.call(i, e) && Number.isFinite(Number(i[e])) && (r = null === r ? Number(i[e]) : Math.max(r, Number(i[e])));
                });
            }), r;
        }
        function Aa(e) {
            return 80 - 1.8 * av(e);
        }
        function Ca(e, t = {}, n = {}) {
            if (n && "favorite" === n[e]) return 100;
            if (n && ("limit" === n[e] || "notinterested" === n[e])) return -100;
            const i = t && t[e], a = [];
            return "number" == typeof i && Number.isFinite(Number(i)) ? a.push(Number(i)) : i && "object" == typeof i && [ "give", "receive" ].forEach(e => {
                Object.prototype.hasOwnProperty.call(i, e) && Number.isFinite(Number(i[e])) && a.push(Number(i[e]));
            }), a.length ? Math.max(...a) : null;
        }
        function Ma(e, t) {
            const n = catId(e.name), i = ft[t], a = i && "group" === i.kind && Array.isArray(i.sourceIds) ? i.sourceIds.filter(e => vt[e] && vht[e]) : [];
            if (a.length) return a.every(t => {
                const i = Qe[t]?.[n];
                if ("favorite" === i) return !0;
                if ("limit" === i) return Aa(vpt[t]) <= -100;
                const a = Ea(e, vt[t], Qe[t], at[t]);
                return null !== a && a >= Aa(vpt[t]);
            });
            const r = i && "group" === i.kind && Array.isArray(i.sourceProfiles) ? i.sourceProfiles.filter(e => e && (e.veilEnabled ?? e.netEnabled)) : [];
            if (r.length) return r.every(t => {
                const i = t.annotations?.[n];
                if ("favorite" === i) return !0;
                if ("limit" === i) return Aa(null != t.veil ? t.veil : t.net) <= -100;
                const a = Ea(e, t.ratings, t.annotations, t.importedChildren);
                return null !== a && a >= Aa(null != t.veil ? t.veil : t.net);
            });
            const o = Qe[t]?.[n];
            if ("favorite" === o) return !0;
            if ("limit" === o) return Aa(vpt[t]) <= -100;
            const s = Ea(e, vt[t], Qe[t], at[t]);
            return null !== s && s >= Aa(vpt[t]);
        }
        function Ia(e = Mt) {
            const t = ft[e];
            if (t && "group" === t.kind) {
                const e = Array.isArray(t.sourceIds) ? t.sourceIds.filter(e => vt[e]) : [];
                return e.length ? e.some(e => vht[e]) : Array.isArray(t.sourceProfiles) && t.sourceProfiles.some(e => e && (e.veilEnabled ?? e.netEnabled));
            }
            return Boolean(vht[e] || $n);
        }
        function Pa(e, t) {
            const n = da(e, t), i = qn[e];
            if (!i || "Category" === i.kind || !i.parentId) return n;
            const a = da(i.parentId, t);
            return {
                give: n.giveKnown ? n.give : a.give,
                receive: n.receiveKnown ? n.receive : a.receive,
                giveKnown: n.giveKnown || a.giveKnown,
                receiveKnown: n.receiveKnown || a.receiveKnown
            };
        }
        function La(e, t, n) {
            // Per-topic pair classification now comes from the sync engine
            // v1.1 topic outcome for the pair (cached per render pass).
            const r = sxPairByIds(t, n), rec = r && r.topicsById[e];
            if (!rec) return "other";
            return "match" === rec.outcome ? "mutual" : "curious-fit" === rec.outcome ? "explore" : "conflict" === rec.outcome || "one-sided" === rec.outcome || "limit-blocked" === rec.outcome ? "mismatch" : "other";
        }
        function Ta() {
            const e = Yi();
            if (e.length >= 2) return e;
            const t = Kd(), n = Array.isArray(t?.sourceIds) ? t.sourceIds.filter(e => vt[e]) : [];
            return n.length >= 2 ? n : [];
        }
        function Fa() {
            return Ta().length >= 2 || Boolean(Kd());
        }

        // Phase 2: Semantic function bridge
        const sxIsVeilActive = Ia;
        const sxGetComparisonProfileIds = Ta;
        const sxIsComparisonActive = Fa;
        const sxGetTopicStance = ca;
        const sxGetTopicScore = Ca;
        const sxMapVeilThreshold = Aa;
        const sxGetActiveProfileOrDefault = Vi;
        const sxGetComparisonOutcome = di;
        const sxGetActiveOrComparisonProfiles = Xi;

        window.SexcapadesRuntime.Profiles = {
            isVeilActive: sxIsVeilActive,
            getComparisonProfileIds: sxGetComparisonProfileIds,
            isComparisonActive: sxIsComparisonActive,
            getActiveProfileOrDefault: sxGetActiveProfileOrDefault,
            getActiveOrComparisonProfiles: sxGetActiveOrComparisonProfiles,
            getComparisonOutcome: sxGetComparisonOutcome,
            autoSelect: sxAutoSelect
        };
        window.SexcapadesRuntime.Topics = {
            getStance: sxGetTopicStance,
            getScore: sxGetTopicScore,
            getVeilThreshold: sxMapVeilThreshold
        };
        function Na(e) {
            if (!Rt || isCatId(e)) return !1;
            const t = Ta();
            if (t.length >= 2) {
                for (let n = 0; n < t.length; n++) for (let i = n + 1; i < t.length; i++) if ("mutual" !== La(e, t[n], t[i])) return !1;
                return !0;
            }
            return "mutual" === di(e);
        }
        function _a() {
            const t = e.byId("blindModeSummary"), i = e.byId("blindModeHeading"), a = e.byId("blindModeList");
            if (!t || !i || !a) return;
            if (t.hidden = !Rt, !Rt) return void a.replaceChildren();
            const r = Rt ? Uc().filter(Na).map(e => {
                const t = qn[e] || Xn(e) || li().find(t => t.id === e);
                return t ? {
                    id: e,
                    label: t.label,
                    branch: t.branch
                } : null;
            }).filter(Boolean).sort((e, t) => e.branch.localeCompare(t.branch) || e.label.localeCompare(t.label)) : [];
            i.textContent = `You match on ${r.length} ${1 === r.length ? "topic" : "topics"}`, 
            n(a, r.length ? r.map(e => `<li><span>${Hi(e.label)}</span><small>${Hi(e.branch)}</small></li>`).join("") : "<li><span>No shared Want to do topics yet.</span></li>");
        }
        function Da() {
            const t = Fa(), n = e.byId("blindModeToggle"), i = an && Yi().length >= 2 && !Kd();
            i && "mutual" === Pt && (Pt = "all"), Rt && !t && (Rt = !1, Pt = Ot || "all"), document.body.classList.toggle("blind-mode", Rt), 
            n && (n.setAttribute("aria-pressed", String(Rt)), n.disabled = !t), e.all("[data-filter]").forEach(e => {
                const t = "mutual" === e.dataset.filter;
                // FQ2-BAKEIN: filter-chip tooltip below "shared Want to do topics" -> "shared Hot topics" (redundant trailing "topics" dropped: the new name already ends in "topics")
                e.disabled = Rt, e.setAttribute("aria-disabled", String(i && t)), t && e.setAttribute("data-ui-tooltip", i ? "Cast the selected profiles together first, or select a single profile, to score shared Hot topics." : "Show topics the selected profiles can enjoy together: one person wants to give what another wants to receive."), e.setAttribute("aria-pressed", String(Rt ? t : e.dataset.filter === Pt));
            }), _a();
        }
        function Ra(e) {
            if (Rt) return Na(e) ? "mutual" : "other";
            const t = di(e);
            if (t) return t;
            // Single-profile tab: classify by this profile's own ratings (Build 2026-10-17)
            const mt = Mt && ft[Mt];
            if (mt && "group" !== mt.kind && vt[Mt]) {
                return RaSingle(e, Mt);
            }
            const n = Qi() ? Xi() : Object.keys(wt), i = [];
            for (let t = 0; t < n.length; t++) for (let a = t + 1; a < n.length; a++) i.push(La(e, n[t], n[a]));
            return i.includes("mismatch") ? "mismatch" : i.includes("mutual") ? "mutual" : i.includes("explore") ? "explore" : "other";
        }
        function RaSingle(e, t) {
            // Classify a topic by a single profile's own ratings for individual-tab filters.
            // "mutual" = Want to do (green): strong want in either direction.
            // "explore" = Curious about (yellow): moderate interest.
            // "mismatch" = Mismatched (red): strong aversion or hard limit.
            if ("limit" === Qe[t]?.[e]) return "mismatch";
            const r = Pa(e, t), s = 35;
            if ((r.giveKnown && r.give > s) || (r.receiveKnown && r.receive > s)) return "mutual";
            if ((r.giveKnown && r.give <= -s) || (r.receiveKnown && r.receive <= -s)) return "mismatch";
            if ((r.giveKnown && r.give > 20) || (r.receiveKnown && r.receive > 20)) return "explore";
            return "other";
        }
        function Oa(e, t) {
            const n = Qe[t]?.[e];
            if (n) return n;
            const i = qn[e];
            return i && "Category" !== i.kind && (i.parentId && Qe[t]?.[i.parentId] || Qe[t]?.[catId(i.branch)]) || null;
        }
        function Ba(e, t, n) {
            if (Qe[t]?.[e] === n) return !0;
            const i = qn[e];
            return !(!i || "Category" === i.kind) && Boolean(i.parentId && Qe[t]?.[i.parentId] === n || Qe[t]?.[catId(i.branch)] === n);
        }
        function ja(e, t) {
            return Ba(e, t, "limit") || Ba(e, t, "notinterested");
        }
        function qa(e, t) {
            return (Qi() ? Xi() : [ Vi() ]).some(n => Boolean(t[n]?.[e]));
        }
        function Ha(e, t) {
            return Boolean(Je[t]?.[e]);
        }
        function Wa(e, t) {
            return Boolean(et[t]?.[e]);
        }
        function Ua(e) {
            const t = Xi(), n = 35;
            if (t.length < 3) return null;
            const i = t.filter(t => {
                if ("limit" === Oa(e, t)) return !1;
                const i = Pa(e, t);
                return i.giveKnown && i.give > n || i.receiveKnown && i.receive > n || "favorite" === Oa(e, t);
            }).length;
            if (!i) return null;
            const a = (i - 1) / Math.max(1, t.length - 1), r = [ 74, 158, 190 ], o = [ 255, 104, 91 ];
            return {
                count: i,
                total: t.length,
                color: `rgb(${Math.round(r[0] + (o[0] - r[0]) * a)},${Math.round(r[1] + (o[1] - r[1]) * a)},${Math.round(r[2] + (o[2] - r[2]) * a)})`
            };
        }
        Cn.addEventListener("pointerdown", sa, !0), Cn.addEventListener("keydown", sa, !0);
        /* ================= SpokeGeometry module — BEGIN ================= */
        /* ================================================================
           SpokeGeometry — spoke path geometry for the map renderer.
           (Refactor Step 3, Build 2026-10-18_0804: extracted from the Ga
           namespace, where taperedPath / flankPaths previously lived as
           methods. Ga.taperedPath and Ga.flankPaths remain as one-line
           delegates so any other caller keeps working; new code should
           call SpokeGeometry directly. Behavior is byte-identical to the
           pre-refactor Ga implementations — see the differential
           path-string test recorded in the build comment in index.html.)

           A "spoke" is the tapered band drawn from a parent node (the
           center node or a subcategory hub) out to a child node's icon.
           Two shapes are built here:

           - taperedPath: one filled band with a single color.
           - flankPaths: two filled bands ("flanks"), one per side of the
             centerline, so give and receive can carry different colors.

           Both shapes can hug two circles with concave arcs:

           - Tip circle (wraps the CHILD icon): when a valid tip circle
             is supplied, the flat tip edge is replaced by an arc that
             follows the icon's circumference. The two tip corners are
             projected radially onto the circle (corner -> ray from the
             circle center -> point at distance r), and the SVG arc is
             drawn between the projections with large-arc = 0. The sweep
             flag is chosen from the sign of the cross product of the two
             corner vectors (taken from the circle center), which selects
             the arc on the spoke-facing side of the circle — the short
             way around the back of the icon — never the arc that would
             cut through the icon disc.

           - Base circle (wraps the PARENT disc): symmetric trick at the
             other end. The base corners are projected radially onto the
             parent disc and joined by an arc along its circumference
             (same cross-product sweep rule), so the band's base follows
             the disc edge instead of cutting a flat chord across it.
             A base circle is ignored when the segment starts deep
             inside it (start within 0.5 * r of the disc center): those
             are center-drawn segments whose base is meant to stay
             buried under the parent node.

           All coordinates and lengths are in map units (SVG user units
           of the map viewBox). Widths are FULL widths: a corner is
           offset width / 2 to either side of the centerline.
           ================================================================ */
        const SpokeGeometry = (() => {
            /** Polyline samples per flank edge (matches the old Ga.SAMPLES). */
            const SAMPLES = 12;
            /** Flare falloff rate: flank width decays exponentially from base width to tip width along the spoke (matches the old Ga.FLARE_DECAY). */
            const FLARE_DECAY = 1;
            /** Narrow-tip cap: radius (map units) of the convex semicircular cap a near-zero-width tip earns. */
            const NARROW_TIP_CAP_RADIUS = 24;
            /** Narrow-tip cap: a narrow tip earns its cap only when the segment is longer than this (map units). */
            const NARROW_TIP_MIN_LENGTH = 25;
            /** Deep-start threshold: a base/tip disc is ignored when the segment starts closer than this fraction of the disc radius to its center. */
            const DEEP_START_FRACTION = 0.5;
            /**
             * Describe the straight segment from (x0, y0) to (x1, y1).
             * @param {number} x0 - Start x, map units.
             * @param {number} y0 - Start y, map units.
             * @param {number} x1 - End x, map units.
             * @param {number} y1 - End y, map units.
             * @returns {{x0:number, y0:number, x1:number, y1:number, dx:number, dy:number, len:number, ux:number, uy:number, nx:number, ny:number}}
             *   dx/dy = end - start; len = segment length (1 when degenerate);
             *   (ux, uy) = unit direction; (nx, ny) = unit normal (-uy, ux).
             */
            function segment(x0, y0, x1, y1) {
                const a = x1 - x0, r = y1 - y0, o = Math.hypot(a, r) || 1, s = a / o, l = r / o;
                return {
                    x0: x0,
                    y0: y0,
                    x1: x1,
                    y1: y1,
                    dx: a,
                    dy: r,
                    len: o,
                    ux: s,
                    uy: l,
                    nx: -l,
                    ny: s
                };
            }
            /**
             * Parse a spoke centerline path string of the form "M x0 y0 L x1 y1".
             * @param {string} d - SVG path data for the centerline.
             * @returns {object|null} A segment() descriptor, or null when the
             *   string does not match the expected M/L shape.
             */
            function parseSegment(d) {
                const t = String(d || "").match(/M\s*([\d.-]+)\s+([\d.-]+)\s+L\s*([\d.-]+)\s+([\d.-]+)/);
                return t ? segment(parseFloat(t[1]), parseFloat(t[2]), parseFloat(t[3]), parseFloat(t[4])) : null;
            }
            /**
             * Flank width at a fractional position along the spoke. The width
             * starts at the base width and decays exponentially toward the
             * tip width, so flanks flare wide at the base and settle fast.
             * @param {number} u - Fraction along the spoke: 0 at base, 1 at tip (unitless).
             * @param {number} baseWidth - Full width at the base, map units.
             * @param {number} tipWidth - Full width approached at the tip, map units.
             * @returns {number} Full width at u, map units.
             */
            function flareAt(u, baseWidth, tipWidth) {
                return tipWidth + (baseWidth - tipWidth) * Math.exp(-FLARE_DECAY * u);
            }
            /**
             * Build the tip circle for a spoke: the circle of the CHILD icon
             * that the spoke's tip arc hugs.
             *
             * Callers pass the spoke's drawn endpoint (x1, y1), which stops
             * (r - 1.5) map units short of the icon's center along the spoke
             * direction. This helper reconstructs the icon center by pushing
             * the endpoint that same distance further along the unit spoke
             * direction, so the returned circle IS the icon disc: its near
             * edge sits 1.5 units behind the drawn endpoint and the tip arc
             * wraps the icon's back edge.
             * @param {number} x0 - Spoke base x, map units.
             * @param {number} y0 - Spoke base y, map units.
             * @param {number} x1 - Spoke drawn endpoint (tip) x, map units.
             * @param {number} y1 - Spoke drawn endpoint (tip) y, map units.
             * @param {number} [iconSize] - Icon diameter, map units. Falsy or
             *   non-numeric values fall back to 48. The radius is clamped to
             *   at least 12.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildTipCircle(x0, y0, x1, y1, iconSize) {
                const tipSeg = segment(x0, y0, x1, y1), tipR = Math.max(12, (Number(iconSize) || 48) / 2), tipBack = Math.max(0, tipR - 1.5);
                return {
                    x: x1 + tipSeg.ux * tipBack,
                    y: y1 + tipSeg.uy * tipBack,
                    r: tipR
                };
            }
            /**
             * Build a base circle for a spoke: the PARENT disc that the
             * spoke's base arc hugs (the center node's disc for category
             * spokes, or a subcategory hub's disc for imported-child
             * spokes). A plain {x, y, r} factory so call sites name the
             * intent instead of inlining an anonymous circle object.
             * @param {number} cx - Disc center x, map units.
             * @param {number} cy - Disc center y, map units.
             * @param {number} r - Disc radius, map units.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildBaseCircle(cx, cy, r) {
                return {
                    x: cx,
                    y: cy,
                    r: r
                };
            }
            /**
             * Build a single-color tapered spoke band as SVG path data.
             *
             * Outline order: start at one base corner, run to the same-side
             * tip corner, cross the tip, come back down the other side, and
             * cross the base (the Z close). Both crossings are replaceable
             * by concave circle arcs (see the module header):
             * - Tip: when tipCircle is a valid circle (r > 0), the path first steps
             *   from the tip corner to its radial projection on the tip
             *   circle, arcs along the circumference to the other corner's
             *   projection (sweep from the cross-product sign, spoke-facing
             *   side), and continues. With no valid circle the tip stays a
             *   flat edge between the two tip corners.
             * - Narrow tip: when tipWidth <= 0.5 and the segment is longer
             *   than NARROW_TIP_MIN_LENGTH (25 units), the tip instead gets
             *   a CONVEX semicircular cap of radius NARROW_TIP_CAP_RADIUS
             *   (24) around the endpoint (this branch wins over the
             *   tip-circle arc; it is how zero-width heat spokes round off).
             * - Base: when baseCircle is a valid disc and the segment does
             *   not start deep inside it (start at least
             *   DEEP_START_FRACTION * baseCircle.r from the disc center),
             *   the path starts and ends on the base corners' projections
             *   onto the disc and the closing edge is an arc along the
             *   disc; otherwise the base stays flat.
             * @param {string} pathData - Centerline path string "M x0 y0 L x1 y1", map units. Returned unchanged when unparseable.
             * @param {number} baseWidth - Base width, map units (corners offset +/- baseWidth/2 from the centerline).
             * @param {number} tipWidth - Tip width, map units (corners offset +/- tipWidth/2).
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon), from buildTipCircle. Null/invalid = flat tip.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base disc (parent), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @returns {string} SVG path data for the filled band.
             */
            function taperedPath(pathData, baseWidth, tipWidth, tipCircle = null, baseCircle = null) {
                const i = parseSegment(pathData);
                if (!i) return pathData;
                const {x0: a, y0: r, x1: o, y1: s, nx: l, ny: c} = i, d = r + c * baseWidth / 2, u = a - l * baseWidth / 2, p = r - c * baseWidth / 2, h = o - l * tipWidth / 2, g = s - c * tipWidth / 2, m = o + l * tipWidth / 2, f = s + c * tipWidth / 2;
                // Build 2026-10-18_0343: optional base disc (baseCircle) — the
                // flat base edge is replaced by an arc along the disc,
                // mirroring the tip arc: both base corners are projected onto
                // the disc and the path starts/ends on the projections, so
                // the band hugs the parent circle. Ignored for center-drawn
                // segments.
                const zbP = baseCircle && baseCircle.r > 0 && Math.hypot(a - baseCircle.x, r - baseCircle.y) >= DEEP_START_FRACTION * baseCircle.r ? function() {
                    const v1 = { x: a + l * baseWidth / 2 - baseCircle.x, y: d - baseCircle.y }, v2 = { x: u - baseCircle.x, y: p - baseCircle.y }, m1 = Math.hypot(v1.x, v1.y) || 1, m2 = Math.hypot(v2.x, v2.y) || 1, q1 = { x: baseCircle.x + baseCircle.r * v1.x / m1, y: baseCircle.y + baseCircle.r * v1.y / m1 }, q2 = { x: baseCircle.x + baseCircle.r * v2.x / m2, y: baseCircle.y + baseCircle.r * v2.y / m2 }, crx = v2.x * v1.y - v2.y * v1.x;
                    return { q1: q1, q2: q2, swp: crx >= 0 ? 1 : 0 };
                }() : null, bSX = zbP ? zbP.q1.x : a + l * baseWidth / 2, bSY = zbP ? zbP.q1.y : d, bTail = zbP ? ` L ${zbP.q2.x.toFixed(2)} ${zbP.q2.y.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${zbP.swp} ${zbP.q1.x.toFixed(2)} ${zbP.q1.y.toFixed(2)} Z` : ` L ${u.toFixed(2)} ${p.toFixed(2)} Z`;
                if (tipWidth <= .5) {
                    const dx = o - a, dy = s - r, L = Math.hypot(dx, dy);
                    if (L > NARROW_TIP_MIN_LENGTH) {
                        const R = NARROW_TIP_CAP_RADIUS, ux = dx / L, uy = dy / L, ex = o - ux * R, ey = s - uy * R, wE = (baseWidth + (tipWidth - baseWidth) * (L - R) / L) / 2, c1x = ex + l * wE, c1y = ey + c * wE, c2x = ex - l * wE, c2y = ey - c * wE, d1 = Math.hypot(c1x - o, c1y - s) || 1, d2 = Math.hypot(c2x - o, c2y - s) || 1, p1x = o + R * (c1x - o) / d1, p1y = s + R * (c1y - s) / d1, p2x = o + R * (c2x - o) / d2, p2y = s + R * (c2y - s) / d2, cross = (p1x - o) * (p2y - s) - (p1y - s) * (p2x - o), sweep = cross >= 0 ? 1 : 0;
                        return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${R} ${R} 0 0 ${sweep} ${p2x.toFixed(2)} ${p2y.toFixed(2)}${bTail}`;
                    }
                }
                if (tipCircle && tipCircle.r > 0) {
                    const sv = {
                        x: m - tipCircle.x,
                        y: f - tipCircle.y
                    }, ev = {
                        x: h - tipCircle.x,
                        y: g - tipCircle.y
                    }, sm2 = Math.hypot(sv.x, sv.y) || 1, em2 = Math.hypot(ev.x, ev.y) || 1, spx = tipCircle.x + tipCircle.r * sv.x / sm2, spy = tipCircle.y + tipCircle.r * sv.y / sm2, epx = tipCircle.x + tipCircle.r * ev.x / em2, epy = tipCircle.y + tipCircle.r * ev.y / em2, crx = sv.x * ev.y - sv.y * ev.x, swp = crx >= 0 ? 1 : 0;
                    return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${spx.toFixed(2)} ${spy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${swp} ${epx.toFixed(2)} ${epy.toFixed(2)}${bTail}`;
                }
                return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${h.toFixed(2)} ${g.toFixed(2)}${bTail}`;
            }
            /**
             * Build the split give/receive flank bands for one spoke, as SVG
             * path data. Each flank is one side of the spoke: an OUTER edge
             * that flares from the base width toward the tip width (see
             * flareAt, sampled at SAMPLES + 1 points) and an INNER edge at
             * the fixed inner half-width innerHalf, so the two flanks leave
             * the center stripe (half-width stripeHalf) uncovered for the
             * midline.
             *
             * Emission order — what "first" means in the mode string: the
             * mode names which EDGE POLYLINE IS EMITTED FIRST in each
             * flank's path string.
             * - "innerFirst" (branch spokes: category and subcategory
             *   spokes drawn by the Ka renderer): each flank starts with
             *   its INNER edge polyline running base -> tip, then the tip
             *   arc (inner offset innerHalf out to the flared tip offset),
             *   then the OUTER edge polyline reversed (tip -> base), then
             *   the base arc (flared base offset in to inner offset
             *   innerHalf).
             * - "outerFirst" (kink spokes drawn by renderKinkLine): each
             *   flank starts with its OUTER edge polyline running
             *   base -> tip, then the tip arc (flared tip offset in to
             *   inner offset innerHalf), then a freshly built INNER edge
             *   polyline running tip -> base, then the base arc (inner
             *   offset innerHalf out to the flared base offset).
             * The two modes trace the same outline in opposite orders with
             * the arc connections mirrored; which one a spoke uses is
             * fixed by its renderer and level, and both produce the same
             * filled region.
             *
             * Circle hugging (see the module header for the general
             * mechanics): the base circle baseCircle, when valid and the
             * segment does not start deep inside it (start at least
             * DEEP_START_FRACTION * baseCircle.r from its center), first
             * pulls all four base corner points
             * radially onto the disc so the flanks themselves start on
             * the disc edge, and the base crossing is emitted as an arc
             * along the disc by the b() helper (skipped when the two
             * offsets are effectively equal). The tip circle tipCircle likewise
             * turns each flank's tip crossing into an arc along the icon
             * circumference via the bE() helper. Both helpers project the
             * crossing's endpoints onto their circle and pick the sweep
             * flag from the cross-product sign, so the arc always runs
             * along the spoke-facing side of the circle.
             * @param {number} baseX - Base point x, map units.
             * @param {number} baseY - Base point y, map units.
             * @param {number} dx - Base->tip delta x, map units. Tip point = (baseX + dx, baseY + dy).
             * @param {number} dy - Base->tip delta y, map units.
             * @param {number} nx - Unit normal x, unitless. Corners are offset along (nx, ny).
             * @param {number} ny - Unit normal y, unitless.
             * @param {number} baseWidth - Base width, map units: the flare's starting full width.
             * @param {number} tipWidth - Tip width, map units: the flare's limiting full width.
             * @param {number} innerHalf - Inner half-width, map units: fixed offset of each flank's inner edge from the centerline.
             * @param {number} stripeHalf - Center stripe half-width, map units: the flared edge offset is max(innerHalf, stripeHalf + flare / 2) so a flank never crosses the midline stripe.
             * @param {string} mode - Mode: "innerFirst" (branch spokes) or "outerFirst" (kink spokes). Any other value takes the outerFirst branch.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base circle (parent disc), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon). Null/invalid = flat tip crossing.
             * @returns {{top: string, bottom: string}} SVG path data for the two flanks: "top" is the (nx, ny)-negative side, "bottom" the positive side.
             */
            function flankPaths(baseX, baseY, dx, dy, nx, ny, baseWidth, tipWidth, innerHalf, stripeHalf, mode, baseCircle = null, tipCircle = null) {
                const p = SAMPLES, h = [], g = [], m = [], f = [];
                for (let si = 0; si <= p; si++) {
                    const frac = si / p, y = Math.max(innerHalf, stripeHalf + flareAt(frac, baseWidth, tipWidth) / 2), b = baseX + dx * frac, v = baseY + dy * frac;
                    h.push(`${(b - nx * y).toFixed(2)} ${(v - ny * y).toFixed(2)}`), g.push(`${(b - nx * innerHalf).toFixed(2)} ${(v - ny * innerHalf).toFixed(2)}`),
                    m.push(`${(b + nx * y).toFixed(2)} ${(v + ny * y).toFixed(2)}`), f.push(`${(b + nx * innerHalf).toFixed(2)} ${(v + ny * innerHalf).toFixed(2)}`);
                }
                // Build 2026-10-18_0343: spoke bases hug the parent disc. The
                // base-arc helper below only capped the base edge between the
                // corners' projections — the flank corners themselves stayed
                // outside the disc, joined by radial stubs that poked past
                // the circle. Now the four base corner points are projected
                // onto the base circle first, so the flanks themselves start
                // on the disc edge and the base follows the circle exactly.
                // A base circle is ignored when the segment starts deep
                // inside it (center-drawn segments keep the old flat base).
                baseCircle && baseCircle.r > 0 && Math.hypot(baseX - baseCircle.x, baseY - baseCircle.y) < DEEP_START_FRACTION * baseCircle.r && (baseCircle = null);
                if (baseCircle && baseCircle.r > 0) {
                    const pj = (e2, t2) => {
                        const n2 = e2 - baseCircle.x, i2 = t2 - baseCircle.y, a2 = Math.hypot(n2, i2) || 1;
                        return `${(baseCircle.x + baseCircle.r * n2 / a2).toFixed(2)} ${(baseCircle.y + baseCircle.r * i2 / a2).toFixed(2)}`;
                    }, y0 = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2);
                    h[0] = pj(baseX - nx * y0, baseY - ny * y0), g[0] = pj(baseX - nx * innerHalf, baseY - ny * innerHalf), m[0] = pj(baseX + nx * y0, baseY + ny * y0), f[0] = pj(baseX + nx * innerHalf, baseY + ny * innerHalf);
                }
                const y = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2), b = (side, startOff, endOff) => {
                    if (!baseCircle || !(baseCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + side * nx * startOff - baseCircle.x, y: baseY + side * ny * startOff - baseCircle.y}, end = {x: baseX + side * nx * endOff - baseCircle.x, y: baseY + side * ny * endOff - baseCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = baseCircle.x + baseCircle.r * start.x / sm, sy = baseCircle.y + baseCircle.r * start.y / sm, ex = baseCircle.x + baseCircle.r * end.x / em, ey = baseCircle.y + baseCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                const yE = Math.max(innerHalf, stripeHalf + flareAt(1, baseWidth, tipWidth) / 2), bE = (side, startOff, endOff) => {
                    if (!tipCircle || !(tipCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + dx + side * nx * startOff - tipCircle.x, y: baseY + dy + side * ny * startOff - tipCircle.y}, end = {x: baseX + dx + side * nx * endOff - tipCircle.x, y: baseY + dy + side * ny * endOff - tipCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = tipCircle.x + tipCircle.r * start.x / sm, sy = tipCircle.y + tipCircle.r * start.y / sm, ex = tipCircle.x + tipCircle.r * end.x / em, ey = tipCircle.y + tipCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                if ("innerFirst" === mode) return {
                    top: `M ${g.join(" L ")}${bE(-1, innerHalf, yE)} L ${h.slice().reverse().join(" L ")}${b(-1, y, innerHalf)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${f.slice().reverse().join(" L ")}${b(1, innerHalf, y)} Z`
                };
                const v = [], w = [];
                for (let si = p; si >= 0; si--) {
                    const px = baseX + dx * (si / p), py = baseY + dy * (si / p);
                    v.push(`${(px - nx * innerHalf).toFixed(2)} ${(py - ny * innerHalf).toFixed(2)}`), w.push(`${(px + nx * innerHalf).toFixed(2)} ${(py + ny * innerHalf).toFixed(2)}`);
                }
                baseCircle && baseCircle.r > 0 && (v[v.length - 1] = g[0], w[w.length - 1] = f[0]);
                return {
                    top: `M ${h.join(" L ")}${bE(-1, yE, innerHalf)} L ${v.join(" L ")}${b(-1, innerHalf, y)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${w.join(" L ")}${b(1, innerHalf, y)} Z`
                };
            }
            /**
             * Numeric unit tests for the circle-hugging geometry. Runnable
             * in the browser console / probe harness via
             * SpokeGeometry.runGeometryTests(), or in node by extracting this
             * module (between its BEGIN/END delimiters) and calling the
             * same function. Verifies, for both taperedPath and
             * flankPaths (innerFirst and outerFirst):
             * - every arc endpoint lies ON its circle (distance from the
             *   circle center == r, within rounding epsilon);
             * - concavity: a tip arc's midpoint sits BEHIND its chord
             *   midpoint (toward the spoke base), and a base arc's
             *   midpoint sits beyond its chord midpoint (toward the spoke
             *   tip) — i.e. each arc bows around its circle, not across it;
             * - the sweep flag routes the arc through that spoke-facing
             *   midpoint (the minor arc on the circle's spoke side), not
             *   through the through-icon antipode.
             * @returns {{passed:number, failed:number, failures:string[]}} Test tally; failures names each failed check.
             */
            function runGeometryTests() {
                const EPS = .025;
                let passed = 0;
                const failures = [];
                const check = (name, cond) => { cond ? passed++ : failures.push(name); };
                const distTo = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);
                const arcsOf = d => {
                    const out = [], re = /([ML])\s*([\d.-]+)\s+([\d.-]+)|A\s+([\d.]+)\s+[\d.]+\s+0\s+0\s+([01])\s+([\d.-]+)\s+([\d.-]+)/g;
                    let m, cur = null;
                    while ((m = re.exec(d))) {
                        if (m[1]) cur = { x: +m[2], y: +m[3] };
                        else if (cur) out.push({ r: +m[4], sweep: +m[5], x1: cur.x, y1: cur.y, x2: +m[6], y2: +m[7] }), cur = { x: +m[6], y: +m[7] };
                    }
                    return out;
                };
                const arcMid = (arc, c) => {
                    const a1 = Math.atan2(arc.y1 - c.y, arc.x1 - c.x), a2 = Math.atan2(arc.y2 - c.y, arc.x2 - c.x);
                    let sx = Math.cos(a1) + Math.cos(a2), sy = Math.sin(a1) + Math.sin(a2);
                    const m = Math.hypot(sx, sy) || 1;
                    return { x: c.x + c.r * sx / m, y: c.y + c.r * sy / m, a1: a1, a2: a2, amid: Math.atan2(sy, sx) };
                };
                const onSweptArc = (a1, amid, a2, sweep) => {
                    const TAU = Math.PI * 2, norm = x => ((x % TAU) + TAU) % TAU;
                    return sweep === 1 ? norm(amid - a1) <= norm(a2 - a1) + 1e-9 : norm(a1 - amid) <= norm(a1 - a2) + 1e-9;
                };
                const checkArc = (label, arc, circle, towardBase) => {
                    check(label + ": arc radius matches circle", Math.abs(arc.r - circle.r) < .01);
                    check(label + ": start point on circle", Math.abs(distTo(arc.x1, arc.y1, circle.x, circle.y) - circle.r) < EPS);
                    check(label + ": end point on circle", Math.abs(distTo(arc.x2, arc.y2, circle.x, circle.y) - circle.r) < EPS);
                    const mid = arcMid(arc, circle), chordX = (arc.x1 + arc.x2) / 2;
                    check(label + (towardBase ? ": arc midpoint behind chord (toward base)" : ": arc midpoint beyond chord (toward tip)"), towardBase ? mid.x < chordX - .05 : mid.x > chordX + .05);
                    check(label + ": sweep routes through spoke-facing midpoint", onSweptArc(mid.a1, mid.amid, mid.a2, arc.sweep));
                };
                // buildTipCircle / buildBaseCircle construction.
                const tc = buildTipCircle(0, 0, 100, 0, 48);
                check("buildTipCircle: radius is iconSize / 2", tc.r === 24);
                check("buildTipCircle: center is endpoint + unit * (r - 1.5)", Math.abs(tc.x - 122.5) < 1e-9 && Math.abs(tc.y) < 1e-9);
                const tcDefault = buildTipCircle(0, 0, 0, 50);
                check("buildTipCircle: default icon size 48", tcDefault.r === 24 && Math.abs(tcDefault.x) < 1e-9 && Math.abs(tcDefault.y - 72.5) < 1e-9);
                const tcMin = buildTipCircle(0, 0, 10, 0, 10);
                check("buildTipCircle: radius clamps to >= 12", tcMin.r === 12 && Math.abs(tcMin.x - 20.5) < 1e-9);
                const bc0 = buildBaseCircle(3, 4, 30);
                check("buildBaseCircle: passes {x, y, r} through", bc0.x === 3 && bc0.y === 4 && bc0.r === 30);
                // taperedPath tip arc (horizontal spoke, tip circle from buildTipCircle).
                const dTip = taperedPath("M 0 0 L 100 0", 20, 20, tc, null), aTip = arcsOf(dTip);
                check("taperedPath tip: exactly one arc", aTip.length === 1);
                aTip.length && checkArc("taperedPath tip", aTip[0], tc, !0);
                // taperedPath base arc (segment starts outside the disc).
                const bcBig = buildBaseCircle(0, 0, 30), dBase = taperedPath("M 40 0 L 140 0", 20, 10, null, bcBig), aBase = arcsOf(dBase);
                check("taperedPath base: exactly one arc", aBase.length === 1);
                aBase.length && checkArc("taperedPath base", aBase[0], bcBig, !1);
                // taperedPath guards: deep-inside base and no circles stay flat; invalid tip circle ignored.
                check("taperedPath base: center-drawn segment keeps flat base", !taperedPath("M 0 0 L 100 0", 20, 10, null, bcBig).includes(" A "));
                check("taperedPath: no circles means no arcs", !taperedPath("M 0 0 L 100 0", 20, 10).includes(" A "));
                check("taperedPath: r = 0 tip circle ignored", !taperedPath("M 0 0 L 100 0", 20, 10, { x: 100, y: 0, r: 0 }, null).includes(" A "));
                check("taperedPath: unparseable path returned unchanged", taperedPath("junk", 20, 10) === "junk");
                // taperedPath narrow-tip convex cap: arc of radius 24 around the endpoint.
                const aCap = arcsOf(taperedPath("M 0 0 L 100 0", 20, 0, null, null));
                check("taperedPath cap: exactly one arc of radius 24", aCap.length === 1 && aCap[0].r === 24);
                aCap.length && check("taperedPath cap: endpoints on the cap circle", Math.abs(distTo(aCap[0].x1, aCap[0].y1, 100, 0) - 24) < EPS && Math.abs(distTo(aCap[0].x2, aCap[0].y2, 100, 0) - 24) < EPS);
                // flankPaths: base disc off-center, tip circle offset past the tip point (as buildTipCircle returns).
                const fBase = buildBaseCircle(0, 0, 25), fTip = { x: 152.5, y: 0, r: 26 };
                const flankArgs = [ 30, 0, 100, 0, 0, 1, 60, 10, 5, 2 ];
                for (const mode of [ "innerFirst", "outerFirst" ]) {
                    const res = flankPaths(...flankArgs, mode, fBase, fTip), aTop = arcsOf(res.top), aBot = arcsOf(res.bottom);
                    check(`flankPaths ${mode}: two arcs per flank (tip + base)`, aTop.length === 2 && aBot.length === 2);
                    if (aTop.length === 2) {
                        checkArc(`flankPaths ${mode} top tip`, aTop[0], fTip, !0);
                        checkArc(`flankPaths ${mode} top base`, aTop[1], fBase, !1);
                    }
                    if (aBot.length === 2) {
                        checkArc(`flankPaths ${mode} bottom tip`, aBot[0], fTip, !0);
                        checkArc(`flankPaths ${mode} bottom base`, aBot[1], fBase, !1);
                    }
                    if (aTop.length && aBot.length) {
                        const mirrorPt = (ax, ay, bx, by) => Math.abs(ax - bx) < .011 && Math.abs(ay + by) < .011;
                        check(`flankPaths ${mode}: bottom tip arc mirrors top across the centerline`, (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x1, aTop[0].y1) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x2, aTop[0].y2)) || (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x2, aTop[0].y2) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x1, aTop[0].y1)));
                    }
                    const first = /^M ([\d.-]+) ([\d.-]+)/.exec(res.top);
                    check(`flankPaths ${mode}: first flank point projected onto base disc`, !!first && Math.abs(distTo(+first[1], +first[2], fBase.x, fBase.y) - fBase.r) < EPS);
                    const bare = flankPaths(...flankArgs, mode, null, null);
                    check(`flankPaths ${mode}: no circles means no arcs`, !bare.top.includes(" A ") && !bare.bottom.includes(" A "));
                }
                return { passed: passed, failed: failures.length, failures: failures };
            }
            return Object.freeze({
                SAMPLES: SAMPLES,
                FLARE_DECAY: FLARE_DECAY,
                segment: segment,
                parseSegment: parseSegment,
                flareAt: flareAt,
                buildTipCircle: buildTipCircle,
                buildBaseCircle: buildBaseCircle,
                taperedPath: taperedPath,
                flankPaths: flankPaths,
                runGeometryTests: runGeometryTests
            });
        })();
        window.SpokeGeometry = SpokeGeometry;
        /* ================= SpokeGeometry module — END ================= */
        const Ga = Object.freeze({
            WIDTH: 18,
            TIP_FRACTION: 0,
            OUTLINE_EXTRA: 1.25,
            OUTLINE_COLOR: "#f5f5f5",
            CLOUD_OUTLINE_WIDTH: (e, depth) => Ga.outlineWidth(e, depth),
            NO_CODE_COLOR: "#78817e",
            FALLBACK_COLOR: "#646d66",
            parseSegment(e) {
                // Delegate: the implementation lives in SpokeGeometry.parseSegment (see the SpokeGeometry module above); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.parseSegment(e);
            },
            segment(e, t, n, i) {
                // Delegate: the implementation lives in SpokeGeometry.segment (same descriptor shape); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.segment(e, t, n, i);
            },
            trimToIcons(e, t, n, i, a, r) {
                const o = Ga.segment(e, t, n, i);
                return {
                    seg: o,
                    sx0: e + o.ux * a,
                    sy0: t + o.uy * a,
                    sx1: n - o.ux * r,
                    sy1: i - o.uy * r
                };
            },
            // tipWidth has no SpokeGeometry counterpart (the module takes tip
            // widths as plain arguments); TIP_FRACTION is 0, so this is
            // always 0 — kept as the Ga-side width rule for heat spokes.
            tipWidth: e => e * Ga.TIP_FRACTION,
            flareAt: (e, t, n) => SpokeGeometry.flareAt(e, t, n),
            heatWidths(e, depth) {
                const t = Math.max(e + 8, 18) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3);
                return {
                    w0: t,
                    w1: .25 * t
                };
            },
            categoryBaseWidth: (e, t, n) => Za.categoryTaperBaseWidth(e, t, n),
            spokeBaseWidth: e => 5 * e,
            railsBaseWidth: (e, t, n, i, depth) => (isCatId(e) ? Ga.categoryBaseWidth(t, n, i) : Ga.spokeBaseWidth(t)) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3),
            cloudBaseWidth(e, t) {
                const n = Math.max(1, Number(t) || 1), i = e / 2 * er.spread;
                return Math.max(8, i / Math.max(n, 6));
            },
            outlineWidth: (e, depth) => { const f = null == depth ? 1 : sxFontFactor(depth); return midlineStrokeWidth() * f + 16 * (mapFontScale() * f / 3); },
            // splitInnerHalf is half the outline width above, so a
            // future outline-width change cannot silently strand it.
            splitInnerHalf: (e, depth) => Ga.outlineWidth(e, depth) / 2,
            midlineOutlinePath: (e, t, n, depth) => n ? "" : `<path class="hanky-midline-outline" d="${e}" fill="none" stroke="${Ga.OUTLINE_COLOR}" stroke-width="${Ga.outlineWidth(t, depth)}" stroke-linecap="butt" opacity="0.9" pointer-events="none"/>`,
            dashAttr: e => ` stroke-dasharray="${e} ${.66 * e}"`,
            taperedPath(e, t, n, z = null, zb = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.taperedPath (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.taperedPath(e, t, n, z, zb);
            },
            flankPaths(e, t, n, i, a, r, o, s, l, c, d, u = null, z = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.flankPaths (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.flankPaths(e, t, n, i, a, r, o, s, l, c, d, u, z);
            }
        });
        // Selection marking — the single authority (map-render refactor,
        // finding 5). selectionMarkKind(spokeId, selectedId, record)
        // decides whether a spoke carries the .selected-spoke mark for a
        // selection, and where the mark lives:
        //   "own"    — the selected node's own spoke (and a selected
        //              topic's parent spoke): the mark lives in that
        //              spoke's node group.
        //   "branch" — the branch spoke (cat-<slug of record.branch>):
        //              the mark lives in the branch line-group underlay
        //              item (.spoke-underlay-item[data-spoke-for=...]).
        //   null     — no mark. A subcategory carries no mark of its own:
        //              its line is drawn by renderKinkLine, which stamps
        //              no highlight, so selecting a subcategory marks
        //              only its branch's line.
        // Ka consults this while rendering (it marks the spokes it
        // builds; the render's underlay pass then moves the branch
        // spoke's visuals, mark included, into the underlay item), and
        // applySelectionMarking consults the same function to reproduce
        // exactly that end state on the existing DOM without a
        // re-render. Selection semantics change HERE only.
        function selectionMarkKind(spokeId, selectedId, record) {
            if (!spokeId || !selectedId) return null;
            const branchCatId = record && record.branch ? catId(record.branch) : null;
            if (branchCatId && spokeId === branchCatId) return "branch";
            if (spokeId === selectedId) return record && "Subcategory" === record.kind ? null : "own";
            if (record && spokeId === record.parentId) return "own";
            return null;
        }
        function Ka(e, t, n, i, a, r, o, s, l, c, d, u = 48, p = Ga.FALLBACK_COLOR, g = !0, m = "", f = null, y = null, b = null, v = !1, w = !0, k = h.length, bc = null, sxLeafD = null, sxDepth = null) {
            Ra(e);
            const sxD = null != sxDepth ? sxDepth : sxLeafD === sxIconDiameter(1) ? 1 : sxLeafD === sxIconDiameter(3) ? 3 : 2, sxF = sxFontFactor(sxD), sxSW = sxStrokeWidth(sxD);
            const x = Rt || Qi() ? null : Vi(), S = Rt ? null : x || function(e) {
                const t = Vi();
                return Qi() && t && (at[t] || {})[e] && gn.has(oi(t, e)) ? t : null;
            }(e), $ = Ge(e, S || Vi()), E = e => `translate(${(a * e).toFixed(2)} ${(r * e).toFixed(2)})`, A = e.replace(/[^a-z0-9-]/g, ""), C = Boolean(topicLabelById[e]), M = S || Vi(), I = qn[e] || Xn(e) || {
                id: e,
                label: i,
                branch: i,
                kind: C ? "Topic" : "Category"
            }, P = (wa(e, I, M), da(e, M)), L = $a(e, "give", M), T = $a(e, "receive", M), F = Sa(e, I, M), N = ka(i, L, P.giveKnown ? ba(P.give) : "Unrated", { tapFirst: !0 }), _ = ka(i, T, P.receiveKnown ? ba(P.receive) : "Unrated", { tapFirst: !0 });
            let D = "";
            const R = g && !Rt ? Ua(e) : null, O = Ga.heatWidths(n, sxD);
            if (SpokeGeometry.taperedPath(t, O.w0, O.w1), R) {
                const overlayTip = "Overlaid profiles into this topic", a = `${R.count}/${R.total}`;
                D += `<path class="group-heat${R.count === R.total ? " all-in" : ""}" d="${t}" stroke="${R.color}" stroke-width="${O.w0}" opacity="${(.2 + .48 * R.count / R.total).toFixed(2)}" tabindex="0" role="img" aria-label="${Hi(`${i}: ${a} overlaid profiles into this topic`)}"${ka(i, overlayTip, a, {
                    hoverOnly: !1
                })}/>`;
            }
            selectionMarkKind(e, Lt, Lt ? qn[Lt] || Xn(Lt) || (at[Vi()] || {})[Lt] : null) && (D += `<path class="selected-spoke" d="${t}" style="stroke-width:${9 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`);
            const B = m ? ` ${m}` : "", j = Math.hypot(o - pr.centerX, s - pr.centerY), q = Ga.railsBaseWidth(e, n, j, k, sxD), H = Ga.tipWidth(n);
            const tipCircle = SpokeGeometry.buildTipCircle(o, s, l, c, null != sxLeafD ? sxLeafD : u * mapFontScale());
            let W = "";
            if (w) if (w && f && y) {
                const seg = Ga.segment(o, s, l, c), i = sxSW, a = Ga.splitInnerHalf(n, sxD), r = SpokeGeometry.flankPaths(o, s, seg.dx, seg.dy, seg.nx, seg.ny, q, H, a, a, "innerFirst", bc, tipCircle), d = b || p || Ga.FALLBACK_COLOR, u = Ga.midlineOutlinePath(t, n, v, sxD);
                W = `<path class="tapered-stem${B}" d="${r.top}" fill="${f}" stroke="none" style="fill:${f}"${N}/><path class="tapered-stem${B}" d="${r.bottom}" fill="${y}" stroke="none" style="fill:${y}"${_}/>` + (v ? `<path class="hanky-midline hanky-none" d="${t}" fill="none" stroke="${Ga.FALLBACK_COLOR}" stroke-width="${i}" stroke-linecap="butt"${Ga.dashAttr(i)} opacity="0.85"${F}/>` : u + `<path class="hanky-midline" d="${t}" fill="none" stroke="${d}" stroke-width="${i}" stroke-linecap="butt" opacity="0.9"${F}/>`);
            } else {
                const taperedD = SpokeGeometry.taperedPath(t, q, H, tipCircle, bc), i = sxSW, a = v ? Ga.FALLBACK_COLOR : b || p || Ga.FALLBACK_COLOR, r = v ? Ga.dashAttr(i) : "";
                W = `<path class="tapered-stem${B}" d="${taperedD}" fill="${p}" stroke="none" style="fill:${p}"/><path class="hanky-midline" d="${t}" fill="none" stroke="${a}" stroke-width="${i}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            } else {
                const stemW = 1.3 * (n || 8), i = v ? Ga.NO_CODE_COLOR : b || p || Ga.NO_CODE_COLOR, a = Ga.midlineOutlinePath(t, n, v, sxD), r = v ? Ga.dashAttr(stemW) : "";
                W = a + `<path class="hanky-midline" d="${t}" fill="none" stroke="${i}" stroke-width="${sxSW}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            }
            if (D += W, D += `<path class="topic-pulse${B}${v ? " hanky-none" : ""}" d="${t}" stroke="${p}" style="stroke-width:${5 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`, 
            D += `<path class="concept-hit" data-id="${e}" data-nx="${a.toFixed(5)}" data-ny="${r.toFixed(5)}"${Sa(e, I, M)} d="${t}" tabindex="0" role="button" aria-label="${Hi(i)} concept line"/>`, 
            g && x && !d) {
                const n = da(e, x);
                ($.single ? [ {
                    key: "give",
                    offset: 0
                } ] : [ {
                    key: "give",
                    offset: -5
                }, {
                    key: "receive",
                    offset: 5
                } ]).forEach((e, i) => {
                    if (!n[e.key + "Known"]) return;
                    const a = n[e.key], r = $.labels[i] || e.key, o = n[e.key + "Derived"] ? ` · rolled up from ${n[e.key + "RatedChildren"]} of ${n.childCount} child topics` : "";
                    D += `<path class="visual-rail collapsed-rating-rail" d="${t}" transform="${E(e.offset)}" fill="none" stroke="${zi(a)}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${r}: ${Math.round(a)}${o}</title></path>`;
                });
            }
            if (g && !Rt && Qi() && 2 === Xi().length) {
                const n = function(e) {
                    const t = Xi();
                    if (t.some(t => "limit" === Oa(e, t))) return "limit";
                    if (t.some(t => "favorite" === Oa(e, t))) return "favorite";
                    const r = sxPairByIds(t[0], t[1]), rec = r && r.topicsById[e];
                    if (!rec) return "other";
                    return "match" === rec.outcome ? "mutual" : rec.mutualNo ? "disinterest" : "other";
                }(e), i = {
                    mutual: "mutual-halo",
                    disinterest: "disinterest-halo",
                    favorite: "favorite-halo",
                    limit: "limit-halo"
                }[n];
                i && (D += `<path class="${i}" d="${t}"/>`);
            }
            const U = S && "group" === ft[S]?.kind ? ft[S].matchDetails?.[e] : null;
            if (g && S && d && U) {
                const t = l - o, n = c - s, i = (Math.hypot(t, n), 180 * Math.atan2(n, t) / Math.PI), a = sxControlScale(sxD, u), r = function(e) {
                    if (!e) return "";
                    const t = Array.isArray(e.routes) ? e.routes : [];
                    return 1 === t.length ? `${Math.round(e.score)}% · ${_d(t[0])}` : `${Math.round(e.score)}% · ${t.length} matched routes`;
                }(U), d = (U.routes || []).map(e => `${_d(e, !0)}; combined ${Math.round(e.score)}%`).join(" · "), p = Za.controlTagWidth(r, "group") * a, h = 24 * a, g = l, m = c;
                D += `<g class="direction-control group-match-control" data-id="${e}" data-direction="group" data-base-cx="${g}" data-base-cy="${m}" data-base-angle="${i}" data-index="0" data-tag-width="${p}" data-tag-height="${h}" data-control-scale="${a}" role="img" tabindex="0" aria-label="Combined match ${Math.round(U.score)} percent. ${Hi(d)}"><title>Combined match ${Math.round(U.score)}%. ${Hi(d)}</title><rect class="direction-tag-bg" x="${(g - p / 2).toFixed(2)}" y="${(m - h / 2).toFixed(2)}" width="${p.toFixed(2)}" height="${h.toFixed(2)}" rx="${6 * a}" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" fill="${zi(U.score)}"/><text class="direction-tag" x="${g.toFixed(2)}" y="${m.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" textLength="${Math.max(50, p - 12 * a).toFixed(2)}" lengthAdjust="spacing" style="font-size:${5.5 * a}px">${Hi(r)}</text></g>`;
            } else if (g && S && d) {
                const t = da(e, S), n = l - o, i = c - s, d = Math.hypot(n, i), p = n / d, h = i / d, g = 180 * Math.atan2(i, n) / Math.PI, m = sxControlScale(sxD, u), f = $.keys, y = $.labels, b = !$.single && "give" === y[0] && "receive" === y[1], v = e => Za.controlTagWidth(e, "pair") * m, w = $.single ? {
                    give: Za.controlTagWidth(y[0], "single") * m
                } : {
                    give: v(y[0]),
                    receive: v(y[1])
                }, k = ($.single ? 20 : 24) * m, x = 320 * m, E = sxRailPx(m), C = $.single ? [ 0 ] : [ -w.give / 2, w.receive / 2 ];
                // Slider blow-up repair (2026-11-01): E (the rating rail's stroke-width) was 44 * mapFontScale() — unbounded and font-derived, so at the baked fontScale 40 the rail rendered 1760 screen px thick (non-scaling-stroke) and one inadvertently picked slider filled the viewport at high zoom-out. It is now the fixed 44 of the 44px spec at every font scale and zoom, matching the .rating-rail CSS rule. Track length (x = 320 * m, map units, camera-scaled) is unchanged.
                // Slider size repair #2 (2026-11-01): E now comes from sxRailPx(m) — 14% of the track's delivered screen length at the current camera, capped at the same fixed 44 — so the attribute, the .rating-rail CSS variable, and the hit strokes all agree at every zoom instead of the fixed 44px thickness dwarfing the shrunken track at Full zoom-out.
                f.forEach((n, i) => {
                    const o = w[n], s = o + 10 * m, d = C[i], u = l - p * d, f = c - h * d, v = u - a * x / 2, M = f - r * x / 2, I = u + a * x / 2, P = f + r * x / 2, L = `M ${v.toFixed(2)} ${M.toFixed(2)} L ${I.toFixed(2)} ${P.toFixed(2)}`, T = s / 2, F = `M ${(u - p * T).toFixed(2)} ${(f - h * T).toFixed(2)} L ${(u + p * T).toFixed(2)} ${(f + h * T).toFixed(2)}`, N = `grad-${A}-${n}`, _ = t[n + "Known"], R = _ ? t[n] : 0, O = (R + 100) / 200, B = Boolean(t[n + "Derived"]), j = Math.round(R), q = _ ? B ? `${j}, rolled up from ${t[n + "RatedChildren"]} of ${t.childCount} child topics` : String(j) : "Unrated", H = Zn(e, n), W = ei(e, n, S), U = Boolean(Nt && Nt.id === e && Nt.direction === n), G = U ? " active-rating" : "", K = `data-id="${e}" data-direction="${n}" data-x0="${v}" data-y0="${M}" data-x1="${I}" data-y1="${P}" data-nx="${a}" data-ny="${r}" data-offset="0"`, z = v + (I - v) * O, V = M + (P - M) * O, Y = $.single ? 1 : 0 === i ? -1 : 1, X = u + p * Y * (o / 2), Z = f + h * Y * (o / 2), Q = _ ? zi(R) : Ga.FALLBACK_COLOR;
                    D += `<g class="direction-control${$.single ? " single-label-control" : ""}${G}" data-id="${e}" data-direction="${n}"${W ? ` data-rating-tooltip="${Hi(W)}"` : ""} data-derived="${B}" data-base-cx="${u}" data-base-cy="${f}" data-base-angle="${g}" data-index="${i}" data-tag-width="${o}" data-tag-height="${k}" data-control-scale="${m}" style="--sx-rail-px:${E.toFixed(1)}px;--sx-rail-hit-px:${Math.max(14, Math.min(44, E * 1.6)).toFixed(1)}px">`, 
                    D += `<defs><linearGradient id="${N}" gradientUnits="userSpaceOnUse" x1="${v}" y1="${M}" x2="${I}" y2="${P}"><stop offset="0" stop-color="var(--red-deep)"/><stop offset=".5" stop-color="var(--curious)"/><stop offset="1" stop-color="var(--green-deep)"/></linearGradient></defs>`, 
                    D += `<path class="visual-rail rating-rail${G}" data-id="${e}" data-direction="${n}" d="${L}" fill="none" stroke="url(#${N})" stroke-width="${E}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`, 
                    (_ || U) && (D += `<circle class="slider-thumb${G}" data-id="${e}" data-direction="${n}" cx="${z.toFixed(2)}" cy="${V.toFixed(2)}" r="${10 * m}" fill="${zi(R)}"/>`), 
                    D += `<path class="rating-track-hit${G}" ${K} d="${L}"/>`;
                    const J = U ? `tabindex="0" role="button" aria-label="Clear ${Hi(`${Jn(e, n)}${H ? ` ${H}` : ""}`)} rating"` : 'tabindex="-1" aria-hidden="true"', ee = g + 90;
                    D += `<g class="rating-clear${G}" data-id="${e}" data-direction="${n}"><rect class="rating-clear-bg" x="${(X - 23 * (mapFontScale() * sxF / 3)).toFixed(2)}" y="${(Z - 10 * (mapFontScale() * sxF / 3)).toFixed(2)}" width="${46 * (mapFontScale() * sxF / 3)}" height="${20 * (mapFontScale() * sxF / 3)}" rx="5" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})"/><rect class="rating-clear-hit" data-id="${e}" data-direction="${n}" x="${(X - 28).toFixed(2)}" y="${(Z - 15).toFixed(2)}" width="56" height="30" rx="7" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})" ${J}/><text class="rating-clear-text" x="${X.toFixed(2)}" y="${Z.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})">Clear</text></g>`, 
                    D += `<path class="direction-hit" tabindex="0" role="slider" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="${_ ? j : 0}" aria-valuetext="${q}" aria-label="${Hi(`${Jn(e, n)}${H ? `: ${H}` : ""}. ${q}. Tap to open its rating scale; drag, then release to choose.`)}" aria-expanded="${U}" ${K} d="${F}"/>`, 
                    $.single && (D += `<rect class="direction-tag-occluder" x="${(u - o / 2 - 3 * m).toFixed(2)}" y="${(f - k / 2 - 3 * m).toFixed(2)}" width="${(o + 6 * m).toFixed(2)}" height="${(k + 6 * m).toFixed(2)}" rx="${7 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})"/>`), 
                    D += `<rect class="direction-tag-bg" data-id="${e}" data-direction="${n}" x="${(u - o / 2).toFixed(2)}" y="${(f - k / 2).toFixed(2)}" width="${o}" height="${k}" rx="${5 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" fill="${Q}" opacity="${_ ? 1 : .62}"/>`;
                    // TAG FILL (ruled 2026-11-02, Jason): the give/receive
                    // lettering fills its tag capsule — font-size equals
                    // the tag height k exactly (single 20 * m, pair
                    // 24 * m), no wasted space top or bottom. The capsule
                    // takes its width from the word itself at this font
                    // (Za.controlTagWidth), so the word fits with no
                    // sideways squeeze and no shrink: the old textLength
                    // cap (spacingAndGlyphs) is gone.
                    const te = $.single ? y[i] : b ? "give" === n ? "G" : "R" : y[i], ne = k;
                    D += `<text class="direction-tag" data-id="${e}" data-direction="${n}" x="${u.toFixed(2)}" y="${f.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" style="font-size:${ne}px">${Hi(te)}</text></g>`;
                });
            }
            if (g && !Rt && !x) {
                const i = Xi(), a = $.single ? [ "give" ] : [ "give", "receive" ], r = i.length * a.length, o = (n > 7 ? Math.min(18, 4 + 1.6 * r) : Math.min(14, 3 + 1.4 * r)) * (mapFontScale() * sxF / 3), s = Math.max(1.35, n / Math.min(r, 6)) * (mapFontScale() * sxF / 3);
                i.forEach((n, i) => {
                    const l = da(e, n);
                    a.forEach((c, d) => {
                        const u = i * a.length + d, p = 1 === r ? 0 : -o / 2 + o * u / (r - 1);
                        $.labels[d], D += `<path class="visual-rail" d="${t}" transform="${E(p)}" fill="none" ${function(e, t, n) {
                            return e[t + "Known"] ? `stroke="${la(n)}" opacity=".96"` : 'stroke="var(--line)" stroke-dasharray="2 6" opacity=".38"';
                        }(l, c, n)} stroke-width="${s}" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${Hi(wt[n])} — ${Hi(Jn(e, c))}</title></path>`;
                    });
                });
            }
            return D;
        }
        function za(e, t, n, i, a, r = 0) {
            const o = i - t, s = a - n, l = Math.hypot(o, s), c = o / l, d = s / l, u = i - c * r, p = a - d * r, h = Math.max(80, l - r), g = Za.leafLabelWidth(h), m = u - c * g, f = p - d * g;
            return {
                d: `M ${t.toFixed(2)} ${n.toFixed(2)} L ${i.toFixed(2)} ${a.toFixed(2)}`,
                labelD: `M ${m.toFixed(2)} ${f.toFixed(2)} L ${u.toFixed(2)} ${p.toFixed(2)}`,
                labelWidth: g,
                labelStartX: m,
                labelStartY: f,
                ux: c,
                uy: d,
                nx: -d,
                ny: c
            };
        }
        function Va(e, t, n, i, a) {
            return r => {
                const o = Math.max(0, Math.min(a, r));
                return {
                    x: e + n * o,
                    y: t + i * o
                };
            };
        }
        function Ya(e, t, n, i, a = pr.categoryIcon / 2) {
            const r = Math.max(1, Math.hypot(n - e, i - t)), o = (n - e) / r, s = (i - t) / r, l = -s, c = o, d = `M ${e.toFixed(2)} ${t.toFixed(2)} L ${n.toFixed(2)} ${i.toFixed(2)}`, u = `M ${n.toFixed(2)} ${i.toFixed(2)} L ${e.toFixed(2)} ${t.toFixed(2)}`, p = r, h = Va(e, t, o, s, p), g = a, m = Za.cloudLabel(p, g), f = m.labelOffset;
            return {
                d: d,
                labelD: d,
                reverseD: u,
                routedLength: p,
                labelWidth: m.labelWidth,
                labelOffset: f,
                icon: h(p),
                ux: o,
                uy: s,
                nx: l,
                ny: c,
                c1: h(.3 * p),
                c2: h(.7 * p),
                bend: 0,
                pointAtDistance: h
            };
        }
        function Xa(e, t) {
            return {
                x: MAP_CENTER_X + Math.cos(e) * t,
                y: MAP_CENTER_Y + Math.sin(e) * t
            };
        }
        const Za = Object.freeze({
            HALO_SPACING: Object.freeze({
                category: 8,
                topic: 6
            }),
            CENTER_SPACING_EM: .02,
            IDEAL_SIZE: 18,
            MIN_SIZE: 12.5,
            _context: document.createElement("canvas").getContext("2d"),
            _cache: new Map,
            _estimateCache: new Map,
            measure(e, t, n) {
                if (!Za._context) return 0;
                const i = "category" === n || "center" === n, a = i ? '"Barlow Condensed",sans-serif' : '"Source Sans 3",sans-serif', r = i ? 700 : 650, o = "center" === n ? Za.CENTER_SPACING_EM * t : Za.HALO_SPACING[n] || Za.HALO_SPACING.topic, s = n + "|" + t.toFixed(1) + "|" + e;
                if (Za._cache.has(s)) return Za._cache.get(s);
                Za._context.font = `${r} ${t}px ${a}`;
                const l = Za._context.measureText(e).width + o * Math.max(0, e.length - 1);
                return Za._cache.size > 2e3 && Za._cache.clear(), Za._cache.set(s, l), l;
            },
            fittedSize(e, t, n) {
                const i = Za.IDEAL_SIZE, a = Za.measure(e, i, n);
                return Math.max(Za.MIN_SIZE, Math.min(i, i * t / Math.max(t, a)));
            },
            fitWithin(e, t, n, i, a) {
                const r = Za.measure(e, t, a);
                return Math.max(n, Math.min(t, t * i / Math.max(1, r)));
            },
            fitAttr: (e, t, n, i) => Za.measure(e, t, n) > i ? ` textLength="${i.toFixed(0)}" lengthAdjust="spacing"` : "",
            // CAPSULE = THE WORD (ruled 2026-11-02, Jason): a tag
            // capsule's width IS its word's measured width at the tag
            // font, plus the renderer's existing inset (4 for the
            // give/receive tags, whose fit check was capsule width
            // minus 4 * scale; 12 for the group score tag, whose text
            // was set to capsule width minus 12 * scale). The old
            // per-character width table is gone: no fixed widths, no
            // caps, no floors. Tag fonts: single 20, pair 24 (the
            // tag heights, unchanged), group score 5.5 (halved from
            // 11 in the same ruling). Paint and the scored capsule
            // geometry both read this one definition, so they move
            // together.
            controlTagWidth: (e, t) => "single" === t ? Za.measure(e, 20, "topic") + 4 : "group" === t ? Za.measure(e, 5.5, "topic") + 12 : Za.measure(e, 24, "topic") + 4,
            leafLabelWidth: e => Math.min(e, Math.max(170, e - 38)),
            curveLabel(e, t, n) {
                const i = Math.max(.32, Math.min(.62, Number(n) || .32)), a = Number.isFinite(t) ? Math.min(e * i, Math.max(6, t)) : Math.min(12, Math.max(6, .03 * e));
                return {
                    labelOffset: a,
                    safeLabelLimit: i,
                    labelWidth: Math.max(120, e - a - 20)
                };
            },
            cloudLabel(e, t) {
                const n = Math.min(e - 40, Math.max(t + 44, .2 * e));
                return {
                    labelOffset: n,
                    // LABEL CLEARANCE (repair, 2026-11-01): the
                    // width offered to the fitted-size computation
                    // is the space actually left on the spoke —
                    // the old floor of 80 forced a label wider
                    // than a short spoke, so its text ran past
                    // the end of the spoke and impinged on the
                    // icon seated there. A short spoke now gets a
                    // smaller fitted label instead.
                    labelWidth: Math.max(30, e - n - 30)
                };
            },
            adaptivePlacement(e, t, n = 0) {
                const i = Math.max(.006, Number(e && e.sector) || .006), a = t >= 3, r = a ? 92 : 44, o = a ? n + 700 : n + 72, s = a ? hr(3) + 1280 : n + 420, l = Math.min(s, Math.max(o, r / i)), c = a ? 620 : 72, d = a ? 2560 : 560, u = Math.max(c, Math.min(d, l - n));
                return a ? {
                    offset: u,
                    limit: .72
                } : {
                    offset: u,
                    limit: .68
                };
            },
            topicLabelOffset: (e, t, n) => Math.max(30, Math.min(e - 36, t + (n % 2 ? 20 : 0))),
            angularDemand(e, t, n, i, a = 0) {
                const r = Math.max(n + 30, 2 * i + Math.min(40, .65 * String(e || "").length)) + a;
                return 2 * Math.asin(Math.min(.92, r / (2 * Math.max(1, t))));
            },
            allocateSectors(e, t, n, i, a, r, o = 0) {
                if (!e.length) return [];
                const s = e.map(e => Math.max(Za.angularDemand(e.label, i, a, r, o), Number(e.minDemand) || 0)), l = s.reduce((e, t) => e + t, 0), c = e.map(e => Math.max(1, e.weight || 1)), d = c.reduce((e, t) => e + t, 0);
                let u = c.map(e => n * e / d);
                if (l <= n) {
                    const t = new Set;
                    for (let i = 0; i < e.length; i++) {
                        let e = !1, i = 0, a = 0;
                        if (u.forEach((e, n) => {
                            t.has(n) ? i += s[n] : a += c[n];
                        }), u = u.map((e, r) => t.has(r) ? s[r] : Math.max(0, n - i) * c[r] / Math.max(1e-4, a)), 
                        u.forEach((n, i) => {
                            !t.has(i) && n < s[i] && (t.add(i), e = !0);
                        }), !e) break;
                    }
                    const i = u.reduce((e, t) => e + t, 0);
                    if (i < n - 1e-4) {
                        const t = (n - i) / e.length;
                        u = u.map(e => e + t);
                    }
                } else u = s.map(e => n * e / l);
                let p = t;
                return e.map((e, t) => {
                    const n = u[t], i = s[t], a = Math.max(0, (n - i) / Math.max(1e-4, i)), r = Object.assign({}, e, {
                        angle: p + n / 2,
                        sector: n,
                        start: p,
                        end: p + n,
                        demand: i,
                        slackRatio: a
                    });
                    return p += n, r;
                });
            },
            TAPER_BASE_FRACTION: .78,
            // TAPER-BASE RE-ANCHOR (2026-11-02, owner-approved): the
            // category taper base no longer grows with the radius R.
            // TAPER_BASE_CAP is the tuned-era base — TAPER_BASE_FRACTION
            // of the chord across one of 18 slots at R = 300, about
            // 81.26 units, the base this rule produced when it was
            // tuned — and categoryTaperBaseWidth now returns
            //   max(seed, min(0.78 * chord(R, count), TAPER_BASE_CAP))
            // so at any larger radius the base holds at the tuned value
            // and Ga.railsBaseWidth's fontScale / 3 carries that fixed
            // proportion forward (the painted base is about 1.23x the
            // 22 * fontScale band at every font size). The min() keeps
            // the Oct 13 neighbour-margin property at every radius:
            // the base never exceeds 0.78 of one slot chord, so
            // adjacent bases always keep their margin. flareAt and
            // FLARE_DECAY are untouched.
            TAPER_BASE_CAP: 2 * 300 * Math.sin(Math.PI / 18) * .78,
            categoryTaperBaseWidth(e, t, n) {
                const i = 2 * t * Math.sin(Math.PI / Math.max(1, Number(n) || 1));
                return Math.max(e, Math.min(i * Za.TAPER_BASE_FRACTION, Za.TAPER_BASE_CAP));
            },
            SETTLE: Object.freeze({
                controlGap: 14,
                iconGap: 2,
                startOffset: 2,
                parentOuterMargin: 12,
                boxPadding: 4,
                badgeGap: 0,
                gen2: Object.freeze({
                    step: 32,
                    attempts: 18
                }),
                gen3: Object.freeze({
                    step: 40,
                    attempts: 18
                })
            }),
            orientedBox(e, t, n, i, a = 0) {
                const r = a * Math.PI / 180, o = Math.cos(r), s = Math.sin(r), l = Za.SETTLE.boxPadding;
                return {
                    cx: e,
                    cy: t,
                    hw: Math.max(1, n / 2 + l),
                    hh: Math.max(1, i / 2 + l),
                    ux: {
                        x: o,
                        y: s
                    },
                    uy: {
                        x: -s,
                        y: o
                    }
                };
            },
            boxesOverlap(e, t) {
                const n = t.cx - e.cx, i = t.cy - e.cy;
                return [ e.ux, e.uy, t.ux, t.uy ].every(a => Math.abs(n * a.x + i * a.y) < e.hw * Math.abs(e.ux.x * a.x + e.ux.y * a.y) + e.hh * Math.abs(e.uy.x * a.x + e.uy.y * a.y) + (t.hw * Math.abs(t.ux.x * a.x + t.ux.y * a.y) + t.hh * Math.abs(t.uy.x * a.x + t.uy.y * a.y)));
            },
            isClear: (e, t) => !e.some(e => t.some(t => Za.boxesOverlap(e, t))),
            settleSearch: e => e ? Za.SETTLE.gen2 : Za.SETTLE.gen3,
            markerCandidates(e) {
                let t = 0;
                for (let n = 0; n < e.length; n++) t = 31 * t + e.charCodeAt(n) >>> 0;
                const n = t % 2 ? 1 : -1, i = 9 * (t % 3 - 1);
                return [ [ 36 * n, i ], [ 36 * -n, i ], [ 49 * n, -i ], [ 49 * -n, -i ], [ 38 * n, i + 24 ], [ 38 * -n, i - 24 ], [ 54 * n, i + 22 ], [ 54 * -n, i - 22 ] ];
            },
            markerAnchorAt(e, t, n, i, a) {
                const r = -n, o = t;
                return {
                    x: e.x + r * i[0] + t * i[1],
                    y: e.y + o * i[0] + n * i[1],
                    radius: a
                };
            },
            pickMarkerAnchor(e, t, n, i, a, r) {
                for (const o of a) {
                    const a = Za.markerAnchorAt(t, n, i, o, r);
                    if (e.every(e => Math.hypot(a.x - e.x, a.y - e.y) >= a.radius + e.radius + 8)) return a;
                }
                return null;
            },
            topicSpokeEstimate(e, t, depth) {
                // Memoised (T3, M6): the result is a pure function
                // of ALL of its inputs — the label, the radius, and
                // the canvas font-metrics state its measure calls
                // read (Source Sans 3, weight 650; see Za.measure).
                // The governing font signature is part of the cache
                // key — the bundle's signature-recapture discipline:
                // when the font state changes, entries under the old
                // signature simply never hit and the value is
                // recaptured, so a hit always returns exactly what
                // the unmemoised computation returns under the same
                // state. Hits hand back a fresh object, so a caller
                // can never mutate a cached entry. Bounded like
                // Za._cache: cleared past 2,000 entries.
                let sig = "nofonts";
                try {
                    document.fonts && document.fonts.check && (sig = document.fonts.status + "|" + document.fonts.check('650 16px "Source Sans 3"'));
                } catch (_) {}
                const dep = null == depth ? 2 : depth, key = sig + "|" + t + "|" + dep + "|" + e, hit = Za._estimateCache.get(key);
                if (hit) return {
                    fontSize: hit.fontSize,
                    spokeLength: hit.spokeLength
                };
                const n = Math.max(12, Math.min(17, Za.fittedSize(e, Math.max(80, t - 84)))) * sxFontCoef(dep) / 17, i = 96 + Za.measure(e, n) + 30, out = {
                    fontSize: n,
                    spokeLength: Math.max(t, i)
                };
                return Za._estimateCache.size > 2e3 && Za._estimateCache.clear(), Za._estimateCache.set(key, out), {
                    fontSize: out.fontSize,
                    spokeLength: out.spokeLength
                };
            },
            hubSpokeLength(e, t, n, i, a) {
                let r = n;
                for (let n = 0; n < 3; n++) {
                    const n = Math.min(r - 40, Math.max(i + 44, .2 * r)) + 20;
                    r = Math.max(r, n + Za.measure(e, t) + 3 + a);
                }
                return Math.max(n, r);
            },
            categoryFontSize: (e, t, n, i) => Math.max(15, Math.min(25, Za.fittedSize(e, t - n - (i ? 20 : 12), "category") + 5)),
            categoryUnderlineLength: (e, t) => Math.max(36, e.length * t * .5)
        });
        function Qa(e) {
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            // Build 2026-10-19_1535: expand/collapse on label/icon click COMMENTED OUT per Jason — click is selection only (highlight + dim), no expand/contract. Restore by uncommenting the $i(n) line.
            // n && $i(n);
            n && selectSpokeNode(n, !0);
        }
        function clearSelectionMarking() {
            if (Cn) Cn.querySelectorAll(".selected-spoke").forEach(el => el.remove());
        }
        function clearSpokeSelection() {
            // The one clear path (Build 2026-10-19_0543): clear the
            // selected node and any pending rating target, and remove
            // the selection marking from the existing DOM.
            // Geometry-neutral: no re-render — a full solve (Mr())
            // would discard delivered geometry (scoped editor commits,
            // DeKnotter runs) that exists only in the rendered DOM. The
            // map-selection-dim observer clears sel-keep /
            // has-selection in response to the marking removal.
            // Returns whether anything was selected.
            const had = Boolean(Lt || Nt);
            if (had) {
                Lt = null, Nt = null, sxSelEditorMirrored = null;
                clearSelectionMarking();
            }
            return had;
        }
        function stampSelectedSpoke(d, host) {
            if (!host) return;
            const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("class", "selected-spoke");
            p.setAttribute("d", d || "");
            p.setAttribute("aria-hidden", "true");
            let ref = host.firstChild;
            while (ref && 1 === ref.nodeType && ref.classList.contains("group-heat")) ref = ref.nextSibling;
            host.insertBefore(p, ref);
        }
        function applySelectionMarking(id, t) {
            // Stamp the .selected-spoke highlight(s) for a selection
            // onto the existing DOM, reproducing the render's end
            // state exactly (no re-render: Mr() re-solves and
            // re-renders the whole map from canonical layout state,
            // silently discarding delivered geometry). The render
            // builds each spoke through Ka, whose predicate marks the
            // spoke whose id is the selected node, its parent, or its
            // branch (cat-<slug of branch>) — but only spokes Ka
            // actually builds can carry the mark, and the render's
            // spoke-underlay pass then moves the branch spoke's
            // visuals out of the hub group. The end state is:
            // a topic's own mark stays in its node group (its Ka
            // output is wrapped in .second-gen-rating-controls-only,
            // which the underlay pass skips); the branch's mark lives
            // in the branch's line-group underlay element
            // (.spoke-underlay-item[data-spoke-for="cat-<slug>"]),
            // never in the hub node group; and a subcategory carries
            // no mark of its own (its line is drawn by
            // renderKinkLine, which stamps no highlight, and no mark
            // is stamped for a topic's parent subcategory either) —
            // selecting a subcategory marks only its branch's line.
            // Which spokes carry a mark, and where, is decided by
            // selectionMarkKind (the single selection-marking
            // authority, defined above Ka) — the same function Ka
            // consults during render, so the end state reproduced
            // here cannot drift from the render's.
            // Each stamp copies its d from the spoke's .concept-hit —
            // the same path data the render stamps. Element
            // add/remove is a childList mutation, so the
            // map-selection-dim observer mirrors the result into
            // sel-keep / has-selection unchanged. No canonical layout
            // state and no delivered-geometry registry entry is
            // written here.
            if (!Cn) return;
            clearSelectionMarking();
            const hits = new Map();
            Cn.querySelectorAll(".concept-hit").forEach(hit => {
                const hid = hit.getAttribute("data-id");
                if (hid && !hits.has(hid) && !hit.closest(".layout-exit-clone")) hits.set(hid, hit);
            });
            const branchCatId = t && t.branch ? catId(t.branch) : null;
            if ("own" === selectionMarkKind(id, id, t)) {
                const hit = hits.get(id);
                if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
            if ("branch" === selectionMarkKind(branchCatId, id, t)) {
                const hit = hits.get(branchCatId), underlay = Cn.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(branchCatId)}"]`);
                if (underlay) stampSelectedSpoke(hit ? hit.getAttribute("d") : "", underlay);
                else if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
        }
        function selectSpokeNode(n, notify) {
            // The one selection path for a spoke's node (Build
            // 2026-10-18_1401): spoke taps (click and gesture paths),
            // spoke keyboard activation, and the Layout Editor's selects
            // (via __SEXCAPADES_LAYOUT_API.selectNode) all land here, so
            // selecting a branch means the same thing everywhere — set
            // the selected node, clear any pending rating target, apply
            // the .selected-spoke marking to the existing DOM, and
            // (unless the Layout Editor initiated it) notify the editor
            // so its Advanced selects follow. Selection-only: no
            // re-render and no solve — Mr() would re-deliver every
            // node position from canonical layout state, discarding
            // delivered geometry (scoped editor commits, DeKnotter
            // runs) that exists only in the rendered DOM.
            if (!n) return;
            Lt = n, Nt = null, sxSelEditorMirrored = n;
            applySelectionMarking(n, qn[n] || Xn(n) || (at[Vi()] || {})[n] || null);
            if (notify === !1) return;
            try {
                window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.selectNode && window.__SEXCAPADES_LAYOUT_UI.selectNode(n);
            } catch (err) { __sxErrLog("layout-select-node", err); }
        }
        function Qsel(e) {
            // Spoke tap = select ONLY (Build 2026-10-18_1401, deprecating
            // the tap-to-expand/collapse toggle on spokes): tapping a
            // spoke — the hit line, the stem, the taper, or the midline —
            // selects that branch and never expands or collapses it, not
            // even when the tapped spoke's branch is already selected
            // (Build 1314's fall-through to Qa in that case is removed).
            // Expand/collapse lives on the label and icon taps (Qa).
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            n && selectSpokeNode(n, !0);
        }
        function Ja() {
            In.querySelectorAll(".map-label").forEach(e => {
                const t = qn[e.dataset.topicId];
                if (!t) return;
                const n = Tt && t.label.toLowerCase().includes(Tt);
                e.classList.toggle("revealed", Boolean(n || rn.has(t.branch)));
            }), function() {
                if ("number" != typeof $p || "number" != typeof Ep || "number" != typeof Ap || void 0 === nh) return;
                const e = nh;
                In.querySelectorAll(".node-group[data-layout-key]").forEach(t => {
                    t.dataset.layoutKey;
                    const n = Ep + Number(t.dataset.layoutX) * $p, i = Ap + Number(t.dataset.layoutY) * $p, a = !Number.isFinite(n) || !Number.isFinite(i) || n < e.x - 90 || n > e.x + e.width + 90 || i < e.y - 90 || i > e.y + e.height + 90;
                    a !== Boolean(t.dataset.cameraOffscreen) && (t.dataset.cameraOffscreen = a ? "true" : "", 
                    t.querySelectorAll("[role],[tabindex]").forEach(e => {
                        a ? (e.hasAttribute("role") && (e.dataset.cameraRole = e.getAttribute("role")), 
                        e.hasAttribute("tabindex") && (e.dataset.cameraTabindex = e.getAttribute("tabindex")), 
                        e.removeAttribute("role"), e.setAttribute("tabindex", "-1"), e.setAttribute("aria-hidden", "true"), 
                        e.style.pointerEvents = "none") : (void 0 !== e.dataset.cameraRole && (e.setAttribute("role", e.dataset.cameraRole), 
                        delete e.dataset.cameraRole), void 0 !== e.dataset.cameraTabindex ? (e.setAttribute("tabindex", e.dataset.cameraTabindex), 
                        delete e.dataset.cameraTabindex) : e.removeAttribute("tabindex"), e.removeAttribute("aria-hidden"), 
                        e.style.removeProperty("pointer-events"));
                    }));
                });
            }();
        }
        function focusRelationLink(link, event) {
            event?.preventDefault(), event?.stopPropagation();
            const branchNames = [link.dataset.branchA, link.dataset.branchB].filter(Boolean), topicIds = [link.dataset.topicA, link.dataset.topicB].filter(Boolean);
            topicIds.forEach(id => {
                const topic = qn[id] || Xn(id);
                topic?.branch && branchNames.push(topic.branch);
            });
            branchNames.forEach(name => rn.add(name));
            if (branchNames.length) Mr();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const endpointIds = topicIds.length ? topicIds : branchNames.map(name => catId(name));
                const points = endpointIds.map(id => In.querySelector(`[data-layout-key="${CSS.escape(id)}"]`)).filter(Boolean).map(node => {
                    node.classList.remove("is-hidden");
                    return {x:Number(node.dataset.labelX || node.dataset.layoutX), y:Number(node.dataset.labelY || node.dataset.layoutY)};
                }).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
                if (points.length < 2) return;
                const [a,b] = points, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, pad = innerWidth <= 620 ? 70 : 110, spanX = Math.abs(b.x-a.x) + 170, spanY = Math.abs(b.y-a.y) + 170, scale = Math.max(.28, Math.min(innerWidth <= 620 ? 2.2 : 2.6, (nh.width-2*pad)/Math.max(spanX,1), (nh.height-2*pad)/Math.max(spanY,1)));
                const prevBt = Bt; Bt = !0; Ph(scale, nh.x + nh.width/2 - cx*scale, nh.y + nh.height/2 - cy*scale); Bt = prevBt;
            }));
        }
        document.addEventListener("click", function(event) {
            const link = __sxClosestAction(event.target, "relationHit");
            link && focusRelationLink(link, event);
        }, !0);
        window.__sxOnKey( function(event) {
            const link = event.target.closest?.(".common-overlap-link.relation-hit");
            link && (event.key === "Enter" || event.key === " ") && focusRelationLink(link, event);
        }, !0);
        // ===== Map layout geometry ==============================================
        // One pipeline owns spoke radii, collision relief, crossing assignment,
        // and angular nudging. Keep this order stable: each later pass consumes the
        // coordinates established by the pass before it.
        const er = Object.freeze({
            fullTurn: 2 * Math.PI,
            inwardExclusion: Math.PI / 6,
            halfExclusion: Math.PI / 12,
            spread: 11 * Math.PI / 6,
            pitch: 150,
            minimumRadius: 170
        });
        function tr(e) {
            return Math.atan2(Math.sin(e), Math.cos(e));
        }
        const nr = Object.freeze({
            spread: 11 * Math.PI / 6,
            halfSpread: 11 * Math.PI / 12,
            inwardExclusion: Math.PI / 6,
            referenceSpread: 2 * Math.PI / 3,
            pitch: er.pitch,
            minimumRadius: er.minimumRadius
        });
        function ir(e, t, n) {
            const i = Math.max(0, Number(t) || 0);
            if (!i) return tr(e);
            const a = Math.ceil(i / 2), r = i % 2 == 1 ? 1 : -1;
            return tr(e + Math.max(-nr.halfSpread, Math.min(nr.halfSpread, r * a * (Number(n) || 0))));
        }
        function ar(e, t, n) {
            const i = Math.max(0, Number(t) || 0);
            if (!i) return [];
            const a = Math.ceil((i - 1) / 2), r = a > 0 ? nr.spread / (2 * a + 1) : 0, o = Math.max(Math.abs(Number(n) || 0), r);
            return !o || a * o <= nr.halfSpread ? Array.from({
                length: i
            }, (t, n) => ir(e, n, o)) : Array.from({
                length: i
            }, (e, t) => -nr.halfSpread + nr.spread * (t + .5) / i).slice().sort((e, t) => Math.abs(e) - Math.abs(t) || e - t).map(t => tr(e + t));
        }
        const rr = Object.freeze({
            // --- Spoke length calculations (uniform sibling radii) ---------------
            slotAngle: ir,
            fanAngles: ar,
            childFanAngles: (e, t, n) => ar(e, t, n),
            stepForRadius: e => nr.pitch / Math.max(1, e),
            cloudRadiusFor(e) {
                const t = Math.max(nr.minimumRadius, e * nr.pitch / nr.referenceSpread / .82), n = Math.ceil(Math.max(0, (Number(e) || 0) - 1) / 2), i = n > 0 ? n * nr.pitch / nr.halfSpread : 0;
                return Math.max(t, i);
            },
            branchDepth: e => Math.max(0, ...(e.topics || []).map(e => rr.renderedSpokeLength(e) + (e.topic.isSubcategory && e.children && e.children.length ? 1.18 * (e.childCloudRadius || 0) + pr.topicIcon + rr.CONTROL_STATION + rr.LABEL_ALLOWANCE : 0))),
            renderedSpokeLength(e) {
                const t = e.cloudRadius || 0, n = e.topic && e.topic.label || "";
                let i = t;
                try {
                    i = Za.topicSpokeEstimate(n, t).spokeLength;
                } catch (e) { __sxErrLog("layout-measure", e); }
                if (e.topic && e.topic.isSubcategory) {
                    i = Math.max(i, pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96, sxSpokeBase(e.cloudCount));
                    try {
                        const e = Za.topicSpokeEstimate(n, t);
                        i = Za.hubSpokeLength(n, e.fontSize, i, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                    } catch (e) { __sxErrLog("layout-measure", e); }
                }
                var subMul = 1, cloudMul = 1, kinkMul = 1;
                if (e.topic && e.topic.isSubcategory && mn.subcatOverrides) {
                    var so = mn.subcatOverrides[e.topic.label];
                    if (so) {
                        if (typeof so.length === "number" && so.length > 0) subMul = so.length;
                        if (typeof so.cloud === "number" && so.cloud > 0) cloudMul = so.cloud;
                    }
                }
                if (e.topic && !e.topic.isSubcategory && mn.kinkOverrides) {
                    var ko = mn.kinkOverrides[e.topic.id];
                    if (ko && typeof ko.length === "number" && ko.length > 0) kinkMul = ko.length;
                }
                return i * (e.topic && e.topic.isSubcategory ? mn.subLen * subMul : mn.spokeLen * kinkMul) * ("grow" === mn.collision ? 1.22 : "shrink" === mn.collision ? .72 : "off" === mn.collision ? .56 : 1);
            },
            CONTROL_STATION: 54,
            LABEL_ALLOWANCE: 44,
            branchExpanded: e => (e.topics || []).some(e => e.topic.isSubcategory && e.children && e.children.length),
            MAX_CASCADE_PASSES: 8,
            MAX_TOPIC_GROWTH: 1100,
            ELEMENT_CLEARANCE: 30,
            topicElementRadius(e) {
                const t = e.topic || e.child || {}, n = t.isSubcategory ? pr.subcategoryIcon : pr.topicIcon;
                let i = 0;
                try {
                    i = Za.measure(t.label || "", t.isSubcategory || !e.child ? sxFontCoef(2) : sxFontCoef(3));
                } catch (e) { __sxErrLog("layout-measure", e); }
                return Math.max(n / 2 + rr.ELEMENT_CLEARANCE * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1), n / 2 + rr.CONTROL_STATION, Math.min(260, i / 2 + 34 * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1)));
            },
            _lineEndpoint(e, t) {
                const n = e.child ? e.cloudRadius || 0 : rr.renderedSpokeLength(e);
                return {
                    x: t.x + Math.cos(e.cloudAngle) * n,
                    y: t.y + Math.sin(e.cloudAngle) * n
                };
            },
            _rotateSibling(e, t) {
                const n = Math.atan2(Math.sin(t - e.cloudAngle), Math.cos(t - e.cloudAngle));
                e.cloudAngle = tr(t), (e.children || []).forEach(e => {
                    e.cloudAngle = tr(e.cloudAngle + n);
                });
            },
            // --- Angular nudge -------------------------------------------------
            // Gently separates adjacent siblings without changing their radius.
            applyAngularNudge(e, t) {
                if (!mn.nudge || !Array.isArray(e) || e.length < 2) return;
                const n = e.map(e => ({
                    item: e,
                    rel: Math.atan2(Math.sin(e.cloudAngle - t), Math.cos(e.cloudAngle - t))
                })).sort((e, t) => e.rel - t.rel), i = Math.max(Math.PI / 45, Math.min(Math.PI / 7, Math.atan2(8 * rr.SPOKE_HALF_WIDTH + 32 * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1), 190)));
                for (let e = 1; e < n.length; e++) {
                    const t = n[e].rel - n[e - 1].rel;
                    if (t >= i) continue;
                    const a = Math.min(Math.PI / 24, (i - t) / 2);
                    n[e - 1].rel -= a, n[e].rel += a;
                }
                n.forEach(e => rr._rotateSibling(e.item, t + e.rel));
            },
            // --- Crossing minimizer (sibling angular assignment) -----------------
            _segmentsCross(e, t) {
                const n = (e, t, n) => (t.x - e.x) * (n.y - e.y) - (t.y - e.y) * (n.x - e.x);
                if ([ e.a, e.b ].some(e => [ t.a, t.b ].some(t => Math.hypot(e.x - t.x, e.y - t.y) < .5))) return !1;
                const i = n(e.a, e.b, t.a), a = n(e.a, e.b, t.b), r = n(t.a, t.b, e.a), o = n(t.a, t.b, e.b);
                return i * a < -.01 && r * o < -.01;
            },
            _siblingSegments(e, t) {
                const n = [];
                return e.forEach(e => {
                    const i = rr._lineEndpoint(e, t);
                    n.push({
                        a: t,
                        b: i
                    }), (e.children || []).forEach(e => {
                        n.push({
                            a: i,
                            b: rr._lineEndpoint(e, i)
                        });
                    });
                }), n;
            },
            _crossingScore(e, t) {
                let n = 0;
                for (let i = 0; i < e.length; i++) {
                    for (let t = i + 1; t < e.length; t++) rr._segmentsCross(e[i], e[t]) && n++;
                    for (const a of t) rr._segmentsCross(e[i], a) && n++;
                }
                return n;
            },
            minimizeSiblingCrossings(e, t, n) {
                if (!mn.crossmin || !Array.isArray(e) || e.length < 2) return rr._siblingSegments(e || [], t);
                for (let i = 0; i < 2; i++) {
                    let i = !1;
                    for (let a = 0; a < e.length - 1; a++) {
                        const r = e[a], o = e[a + 1], s = r.cloudAngle, l = o.cloudAngle, c = rr._crossingScore(rr._siblingSegments(e, t), n);
                        rr._rotateSibling(r, l), rr._rotateSibling(o, s), rr._crossingScore(rr._siblingSegments(e, t), n) < c ? i = !0 : (rr._rotateSibling(r, s), 
                        rr._rotateSibling(o, l));
                    }
                    if (!i) break;
                }
                return rr._siblingSegments(e, t);
            },
            minimizeCrossings(e) {
                if (!mn.crossmin || !Array.isArray(e)) return;
                const t = {
                    x: pr.centerX,
                    y: pr.centerY
                }, n = e.map(e => ({
                    a: t,
                    b: rr.branchAnchor(e)
                }));
                e.forEach(e => {
                    const t = rr.branchAnchor(e), i = rr.minimizeSiblingCrossings(e.topics || [], t, n);
                    n.push(...i), (e.topics || []).filter(e => e.children && e.children.length).forEach(e => {
                        const i = rr._lineEndpoint(e, t), a = rr.minimizeSiblingCrossings(e.children, i, n);
                        n.push(...a);
                    });
                });
            },
            // --- Collision avoidance: local grow/shrink ---------------------------
            resolveRadialSiblings(e, allowShrink = !0, itemGate = null, itemArm = null) {
                if ("off" === mn.collision || !Array.isArray(e) || e.length < 2) return;
                e.forEach(item => {
                    // _radialBase20 signature invalidation (E3): the
                    // captured base is recaptured whenever it is not
                    // finite OR the item's governing signature
                    // (_radialBase20Sig, see dkRadialBaseInfo) differs
                    // from the current key — from the item's fit target
                    // when fit-armed, else from its current cloudRadius,
                    // with the legacy max(1, ...) capture floor. With an
                    // unchanged signature there is NO recapture: the base
                    // captured in the first resolver round of a solve
                    // survives unchanged into the second round. A
                    // recapture driven by a signature mismatch — against
                    // the wrapper's own stored signature, or, for the
                    // fresh wrappers each fr() run allocates, against the
                    // same stable identity's entry in the driver's
                    // base-state registry — is recorded in the DeKnotter
                    // run log as 'base-recapture' with the item's stable
                    // key; a first-ever capture is not a recapture and is
                    // not logged. The registry is refreshed either way.
                    const info = dkRadialBaseInfo(item), prev = dkBaseStates.get(info.key), prevSig = "string" == typeof item._radialBase20Sig ? item._radialBase20Sig : prev ? prev.sig : null;
                    item._radialFit20 = info.fit, item._radialKey20 = info.key;
                    if (!Number.isFinite(item._radialBase20) || item._radialBase20Sig !== info.sig) {
                        const mismatch = null !== prevSig && prevSig !== info.sig;
                        item._radialBase20 = Math.max(1, null != info.fit ? info.fit : Number(item.cloudRadius) || 1), item._radialBase20Sig = info.sig, mismatch && dkLog.push({
                            type: "base-recapture",
                            key: info.key,
                            branch: dkCtx ? dkCtx.branch : null,
                            phase: dkCtx ? dkCtx.phase : null,
                            base: item._radialBase20,
                            sig: info.sig
                        });
                    }
                    dkBaseStates.set(info.key, {
                        base: item._radialBase20,
                        sig: item._radialBase20Sig
                    });
                });
                // Fit floor (E3, wired in E4): for a fit-armed item the
                // resolver floor IS its fit target, not max(82, 0.58 ×
                // base). _radialFit20 carries the item's registered
                // target whenever one exists; non-fit items keep the
                // legacy floor and cap exactly.
                const t = e => Number.isFinite(e._radialFit20) ? e._radialFit20 : Math.max(82, .58 * e._radialBase20), n = e => e._radialBase20 + rr.MAX_TOPIC_GROWTH, i = (e, t, n, i, a, r) => {
                    const o = e.cloudRadius, s = t.cloudRadius, l = Math.cos(e.cloudAngle) * o - Math.cos(t.cloudAngle) * s, c = Math.sin(e.cloudAngle) * o - Math.sin(t.cloudAngle) * s, d = Math.hypot(l, c), u = rr.topicElementRadius(e) + rr.topicElementRadius(t);
                    if (d + .5 >= u) return null;
                    const p = [], h = (e, t, n, i) => {
                        const a = e.cloudRadius, r = t.cloudRadius, o = Math.cos(e.cloudAngle - t.cloudAngle) * r, s = Math.max(0, r * r - o * o);
                        if (s >= u * u) return;
                        const l = Math.sqrt(Math.max(0, u * u - s)), c = o - l - 2, d = o + l + 2;
                        c < a && c >= n && p.push({
                            item: e,
                            radius: c,
                            delta: c - a,
                            shrink: 1
                        }), d > a && d <= i && p.push({
                            item: e,
                            radius: d,
                            delta: d - a,
                            shrink: 0
                        });
                    };
                    return h(e, t, n, i), h(t, e, a, r), p.filter(e => (!1 !== allowShrink || 1 !== e.shrink) && (!itemGate || 1 !== e.shrink || itemGate(e.item))).filter(e => "grow" === mn.collision ? e.delta > 0 || (1 === e.shrink && itemArm && itemArm(e.item)) : "shrink" !== mn.collision || e.delta < 0).filter(e => !(itemArm && e.delta > 0 && itemArm(e.item))).sort((e, t) => Math.abs(e.delta) - Math.abs(t.delta) || t.shrink - e.shrink)[0] || null;
                    // Group 3d fix (symptom #1, toggles move nothing): the
                    // last filter above is new. An item whose auto-shrink
                    // is armed enters this resolver already carrying the
                    // armed compaction factor (clouds 0.74x / spokes
                    // 0.76x, applied in frCloudLayout / frCollisionPasses)
                    // — but sibling separation then grew it back out
                    // toward the un-shrunk radius (the pair separation
                    // floor for dense child clouds lands within a few
                    // units of the un-shrunk radius), so the delivered
                    // layout showed no movement at all (Fleet 3: 0 of 466
                    // nodes). Armed items may still shrink or hold here;
                    // they may not grow. Separation for an armed pair is
                    // achieved by the unarmed partner growing, or not at
                    // all — the overlap trade the armed shrink commands.
                    // Unarmed items are untouched (itemArm null or false
                    // passes every candidate exactly as before).
                };
                for (let a = 0; a < 16; a++) {
                    let a = !1;
                    for (let r = 0; r < e.length; r++) for (let o = r + 1; o < e.length; o++) {
                        const s = e[r], l = e[o], c = i(s, l, t(s), n(s), t(l), n(l));
                        // Fit deviation (E4): an outward push that sibling
                        // separation forces on a fit item is allowed (its
                        // floor is the target, so it can never be pushed
                        // below it), but never silent — each push is
                        // recorded with the item's stable key, its
                        // target, and the radius it was pushed to.
                        c && (Number.isFinite(c.item._radialFit20) && c.radius > c.item._radialFit20 + 1e-9 && dkLog.push({
                            type: "fit-deviation",
                            key: c.item._radialKey20 || null,
                            target: c.item._radialFit20,
                            delivered: c.radius
                        }), c.item.cloudRadius = c.radius, a = !0);
                    }
                    if (!a) break;
                }
            },
            topicPosition(e, t, n) {
                const i = rr.renderedSpokeLength(t);
                return {
                    x: n.x + Math.cos(t.cloudAngle) * i,
                    y: n.y + Math.sin(t.cloudAngle) * i
                };
            },
            branchAnchor(e) {
                const t = yr(e.entry.branch);
                return {
                    x: pr.centerX + Math.cos(e.angle) * t,
                    y: pr.centerY + Math.sin(e.angle) * t
                };
            },
            // --- Expansion relief ------------------------------------------------
            // Expanded subtrees yield space through bounded branch/topic growth.
            applyBranchReliefPass(e, t, n) {
                const i = new Map;
                if (scCtx && scCtx.r6Abort) return !1;
                e.forEach((t, n) => {
                    const a = e[(n + 1) % e.length];
                    if (a === t) return;
                    const r = rr.branchAnchor(t), o = rr.branchAnchor(a), s = Math.hypot(r.x - o.x, r.y - o.y), l = rr.branchDepth(t) + rr.branchDepth(a) - s;
                    if (l <= 0) return;
                    const c = rr.branchExpanded(t), d = rr.branchExpanded(a), adds = c && !d ? [ [ a, t, l ] ] : d && !c ? [ [ t, a, l ] ] : c && d ? [ [ t, a, l / 2 ], [ a, t, l / 2 ] ] : [];
                    // Scoped solve (T3, L5): a relief candidate
                    // whose source or target branch is frozen is
                    // suppressed, counted, and logged as a boundary
                    // event (pass 0 = the branch relief pass);
                    // candidates between two recompute-set branches
                    // accumulate exactly as before.
                    adds.forEach(([tgt, src, amt]) => {
                        if (scCtx && (scSectorFrozen(tgt) || scSectorFrozen(src))) return void scReliefBoundary(scCtx, scSectorName(src), scSectorName(tgt), 0);
                        i.set(tgt, (i.get(tgt) || 0) + amt);
                    });
                });
                let a = !1;
                return i.forEach((e, i) => {
                    const r = t.get(i) || 0, o = Math.min(e, rr.MAX_TOPIC_GROWTH - r);
                    if (o <= 0) return;
                    t.set(i, r + o);
                    const s = Math.max(1, i.topicCloudRadius), l = (s + o) / s;
                    i.topicCloudRadius = s + o, (i.topics || []).forEach(e => {
                        // Fit guard (E4): branch relief never scales a
                        // fit item's cloudRadius — nor a fit
                        // subcategory's childCloudRadius — and every
                        // would-be touch of a fit item is logged.
                        const fv = dkFitTargetValueFor(e);
                        if (null != fv) dkLog.push({
                            type: "fit-relief-skip",
                            key: dkRadialBaseInfo(e).key,
                            target: fv,
                            delivered: Number.isFinite(e.cloudRadius) ? e.cloudRadius : null,
                            via: "branch-relief"
                        }); else e.cloudRadius = (e.cloudRadius || 0) * l, e.childCloudRadius && (e.childCloudRadius *= l);
                        n.add(e);
                    }), a = !0;
                }), a;
            },
            cascadeReliefPass(e, t, n) {
                if (scCtx && scCtx.r6Abort) return !1;
                // Scoped solve (T3, L5): rSrc records, per growth
                // demand, the sector whose obstacles exert the
                // pressure (the demand's source branch), and itemSec
                // maps each topic item to its owning sector (the
                // target branch) — the application loop below
                // suppresses any demand whose source or target
                // branch is frozen. Both maps are inert bookkeeping
                // when no scope is active.
                const i = e.length, a = new Map(e.map(e => [ e, rr.branchAnchor(e) ])), r = new Map, rSrc = new Map, itemSec = new Map, o = (e, t, n) => {
                    if (!e.length) return;
                    const i = rr.topicPosition(t, n, a.get(t)), o = rr.topicElementRadius(n), srcSec = t;
                    e.forEach(e => {
                        const t = i.x - e.x, a = i.y - e.y, s = Math.hypot(t, a), l = e.r + o - s;
                        if (l <= 1 || s < .001) return;
                        const c = Math.cos(n.cloudAngle) * (t / s) + Math.sin(n.cloudAngle) * (a / s);
                        var d, u;
                        c <= .1 || (d = n, (u = l / c) > 0 && (!r.has(d) || u > r.get(d)) && (r.set(d, u), rSrc.set(d, srcSec)));
                    });
                };
                scCtx && e.forEach(sec => (sec.topics || []).forEach(tp => itemSec.set(tp, sec)));
                e.forEach((n, r) => {
                    const s = a.get(n), l = [ n, e[(r + 1) % i], e[(r - 1 + i) % i] ].filter((e, t, n) => n.indexOf(e) === t);
                    (n.topics || []).forEach(e => {
                        const i = Boolean(e.topic.isSubcategory && e.children && e.children.length);
                        if (!i && !t.has(e)) return;
                        const a = rr.topicPosition(n, e, s), r = [];
                        i ? e.children.forEach(e => {
                            r.push({
                                x: a.x + Math.cos(e.cloudAngle) * (e.cloudRadius || 0),
                                y: a.y + Math.sin(e.cloudAngle) * (e.cloudRadius || 0),
                                r: pr.topicIcon / 2 + rr.ELEMENT_CLEARANCE
                            });
                        }) : r.push({
                            x: a.x,
                            y: a.y,
                            r: rr.topicElementRadius(e)
                        }), l.forEach(t => {
                            (t.topics || []).forEach(n => {
                                n !== e && o(r, t, n);
                            });
                        });
                    });
                });
                let s = !1;
                return r.forEach((e, i) => {
                    const a = n.get(i) || 0, r = Math.min(e, rr.MAX_TOPIC_GROWTH - a);
                    if (r <= .5) return;
                    // Scoped solve (T3, L5): a growth demand whose
                    // source branch (pressure) or target branch (the
                    // item's owner) is frozen is suppressed, counted,
                    // and logged as a boundary event at the current
                    // cascade pass. The pass's return value still
                    // reflects only applied growth, so the cascade
                    // terminates by its own rules.
                    if (scCtx) {
                        const scTgt = itemSec.get(i), scSrc = rSrc.get(i);
                        if (scSectorFrozen(scTgt) || scSectorFrozen(scSrc)) return void scReliefBoundary(scCtx, scSectorName(scSrc), scSectorName(scTgt), scCtx.reliefPass || 0);
                    }
                    // Fit guard (E4): cascade relief never grows a fit
                    // item away from its target — the skip is logged.
                    const fv = dkFitTargetValueFor(i);
                    if (null != fv) return void dkLog.push({
                        type: "fit-relief-skip",
                        key: dkRadialBaseInfo(i).key,
                        target: fv,
                        delivered: Number.isFinite(i.cloudRadius) ? i.cloudRadius : null,
                        via: "cascade-relief"
                    });
                    i.cloudRadius = (i.cloudRadius || 0) + r, n.set(i, a + r), t.add(i), s = !0;
                }), s;
            },
            applyExpansionRelief(e) {
                if (e.length <= 1 || "off" === mn.collision || "shrink" === mn.collision) return;
                const t = new Set, n = new Map, i = new Map;
                rr.applyBranchReliefPass(e, i, t);
                // Scoped solve (T3, L5): the context carries the
                // 1-based cascade pass number so boundaryLog entries
                // name the pass that produced them (the branch
                // relief pass above is pass 0); under the R6 abort
                // flag the cascade stops at once — pass accounting
                // is otherwise unchanged.
                for (let i = 0; i < rr.MAX_CASCADE_PASSES; i++) {
                    if (scCtx) {
                        if (scCtx.r6Abort) break;
                        scCtx.reliefPass = i + 1;
                    }
                    if (!rr.cascadeReliefPass(e, t, n)) break;
                }
            },
            // --- Element footprints and whole-branch spoke optimization -----------
            // Circles cover node icons, labels, slider controls, and badges.
            SPOKE_HALF_WIDTH: 16,
            SPOKE_MIN_RADIUS: 950,
            SPOKE_MAX_GROWTH: 4500,
            SPOKE_GROWTH_MARGIN: 56,
            SPOKE_ELEMENT_PAD: 50,
            BADGE_RADIUS: 30,
            elementCircles(e, t) {
                const n = Math.cos(e.angle), i = Math.sin(e.angle), a = [ {
                    x: t.x,
                    y: t.y,
                    r: pr.categoryIcon / 2 + rr.ELEMENT_CLEARANCE
                }, {
                    x: t.x - n * (pr.categoryIcon / 2 + 20),
                    y: t.y - i * (pr.categoryIcon / 2 + 20),
                    r: rr.BADGE_RADIUS
                } ];
                return (e.topics || []).forEach(n => {
                    const i = rr.topicPosition(e, n, t);
                    if (a.push({
                        x: i.x,
                        y: i.y,
                        r: rr.topicElementRadius(n)
                    }), n.topic.allImported && n.topic.allImported.length) {
                        const e = (n.topic.isSubcategory ? pr.subcategoryIcon : pr.topicIcon) / 2 + 20;
                        a.push({
                            x: i.x + Math.cos(n.cloudAngle) * e,
                            y: i.y + Math.sin(n.cloudAngle) * e,
                            r: rr.BADGE_RADIUS
                        });
                    }
                    n.topic.isSubcategory && n.children && n.children.forEach(e => {
                        a.push({
                            x: i.x + Math.cos(e.cloudAngle) * (e.cloudRadius || 0),
                            y: i.y + Math.sin(e.cloudAngle) * (e.cloudRadius || 0),
                            r: rr.topicElementRadius(e)
                        });
                    });
                }), a;
            },
            segmentDistance(e, t, n, i, a, r) {
                const o = a - n, s = r - i, l = o * o + s * s, c = l ? A(((e - n) * o + (t - i) * s) / l) : 0;
                return {
                    distance: Math.hypot(e - (n + o * c), t - (i + s * c)),
                    fraction: c
                };
            },
            optimizeSpokeLengths(e) {
                if (e.length <= 1 || "off" === mn.collision) return;
                const t = {
                    x: pr.centerX,
                    y: pr.centerY
                }, n = new Map, i = e => {
                    const t = rr.branchAnchor(e), i = rr.elementCircles(e, t).map(e => ({
                        x: e.x,
                        y: e.y,
                        r: e.r + rr.SPOKE_ELEMENT_PAD * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1)
                    })), a = Math.max(0, ...i.map(e => Math.hypot(e.x - t.x, e.y - t.y) + e.r)), r = [];
                    (e.topics || []).forEach(n => {
                        const i = rr.topicPosition(e, n, t);
                        r.push({
                            x1: t.x,
                            y1: t.y,
                            x2: i.x,
                            y2: i.y
                        }), n.topic.isSubcategory && n.children && n.children.forEach(e => {
                            r.push({
                                x1: i.x,
                                y1: i.y,
                                x2: i.x + Math.cos(e.cloudAngle) * (e.cloudRadius || 0),
                                y2: i.y + Math.sin(e.cloudAngle) * (e.cloudRadius || 0)
                            });
                        });
                    }), n.set(e, {
                        anchor: t,
                        circles: i,
                        depth: a,
                        segments: r
                    });
                };
                e.forEach(i);
                const a = (i = null) => {
                    const a = [], r = (e, t, n, i, r, o) => {
                        const s = ((e, t, n) => {
                            const i = (e => ({
                                x: Math.cos(e.angle),
                                y: Math.sin(e.angle)
                            }))(e);
                            return i.x * t + i.y * n;
                        })(n, i, r);
                        Math.abs(s) <= .1 || a.push({
                            a: e,
                            b: t,
                            target: n,
                            delta: (s > 0 ? 1 : -1) * (o / Math.abs(s) + rr.SPOKE_GROWTH_MARGIN)
                        });
                    };
                    for (let a = 0; a < e.length; a++) for (let o = a + 1; o < e.length; o++) {
                        const s = e[a], l = e[o];
                        // Scoped solve (T3, L4): a pair with BOTH
                        // branches frozen can only produce deltas
                        // against frozen targets, which are suppressed
                        // by construction — skip the pair outright
                        // (the latency win). Recompute×frozen pairs
                        // are still evaluated; their frozen-target
                        // candidates are suppressed + counted at the
                        // candidate filter below.
                        if (scCtx && scSectorFrozen(s) && scSectorFrozen(l)) continue;
                        if (i && s !== i && l !== i) continue;
                        const c = n.get(s), d = n.get(l);
                        Math.hypot(c.anchor.x - d.anchor.x, c.anchor.y - d.anchor.y) <= c.depth + d.depth && c.circles.forEach(e => d.circles.forEach(t => {
                            const n = e.x - t.x, i = e.y - t.y, a = Math.hypot(n, i), o = e.r + t.r - a;
                            if (o <= 1 || a < .001) return;
                            const c = n / a, d = i / a;
                            r(s, l, s, c, d, o), r(s, l, l, -c, -d, o);
                        })), [ [ s, l ], [ l, s ] ].forEach(([e, i]) => {
                            const a = n.get(e), o = n.get(i);
                            rr.segmentDistance(o.anchor.x, o.anchor.y, t.x, t.y, a.anchor.x, a.anchor.y).distance > o.depth + rr.SPOKE_HALF_WIDTH + 2 || o.circles.forEach(n => {
                                const o = rr.segmentDistance(n.x, n.y, t.x, t.y, a.anchor.x, a.anchor.y), s = n.r + rr.SPOKE_HALF_WIDTH - o.distance;
                                if (s <= 1 || o.distance < .001) return;
                                const l = t.x + (a.anchor.x - t.x) * o.fraction, c = t.y + (a.anchor.y - t.y) * o.fraction;
                                r(e, i, i, (n.x - l) / o.distance, (n.y - c) / o.distance, s);
                            });
                        }), [ [ s, l ], [ l, s ] ].forEach(([e, t]) => {
                            const i = n.get(e), a = n.get(t);
                            Math.hypot(i.anchor.x - a.anchor.x, i.anchor.y - a.anchor.y) > i.depth + a.depth + rr.SPOKE_HALF_WIDTH + 2 || i.segments.forEach(n => {
                                a.circles.forEach(i => {
                                    const a = rr.segmentDistance(i.x, i.y, n.x1, n.y1, n.x2, n.y2), o = i.r + rr.SPOKE_HALF_WIDTH - a.distance;
                                    if (o <= 1 || a.distance < .001) return;
                                    const s = n.x1 + (n.x2 - n.x1) * a.fraction, l = n.y1 + (n.y2 - n.y1) * a.fraction;
                                    r(e, t, t, (i.x - s) / a.distance, (i.y - l) / a.distance, o);
                                });
                            });
                        });
                    }
                    return a;
                };
                for (let e = 0; e < SX_SCORE.OPTIMIZER_MAX_PASSES; e++) {
                    // Q1: heartbeat / cancel / phase-budget poll —
                    // a no-op unless a DeKnotter context is active.
                    dkSolvePoll();
                    const e = a();
                    if (!e.length) break;
                    const t = e.map(e => {
                        const t = Number(e.target.entry.branch._spokeAdjust20) || 0, n = t + e.delta;
                        return {
                            ...e,
                            current: t,
                            next: n
                        };
                    }).filter(e => Math.abs(e.delta) > .5 && ("grow" === mn.collision ? e.delta > 0 || ("armed" === sxShrinkState(mn.branchSpokeAutoShrink, e.target.entry.branch.name)) : "shrink" !== mn.collision || e.delta < 0) && e.next >= rr.SPOKE_MIN_RADIUS - (e.target, 
                    1450) && e.next <= rr.SPOKE_MAX_GROWTH && (e.delta > 0 || ("veto" !== sxShrinkState(mn.branchSpokeAutoShrink, e.target.entry.branch.name)))).filter(e => !scCtx || !scSectorFrozen(e.target) || (scCtx.dropped.optimiser++, !1)).sort((e, t) => Math.abs(e.delta) - Math.abs(t.delta) || (e.delta < 0 ? -1 : 1) - (t.delta < 0 ? -1 : 1) || String(e.target.entry.branch.name).localeCompare(String(t.target.entry.branch.name))), n = t[0];
                    if (!n) break;
                    // DeKnotter log (E1): while a run context is active,
                    // record every change the optimiser makes to the
                    // ACTIVE branch's _spokeAdjust20 (before/after). The
                    // optimiser window itself is observed, not widened.
                    if (dkCtx && n.target && n.target.entry && n.target.entry.branch && n.target.entry.branch.name === dkCtx.branch && n.next !== n.current) dkLog.push({
                        type: "spoke-optimiser",
                        branch: dkCtx.branch,
                        phase: dkCtx.phase,
                        before: n.current,
                        after: n.next
                    });
                    // Fit guard (E4): an optimiser adjustment to a branch
                    // carrying fit items is recorded as a fit-deviation
                    // for each fit item of that branch, so a spoke move
                    // can never silently carry a fit item off target.
                    if (dkFitRegistry.size && n.target && n.target.topics) n.target.topics.forEach(tp => {
                        const fv = dkFitTargetValueFor(tp);
                        null != fv && dkLog.push({
                            type: "fit-deviation",
                            key: dkRadialBaseInfo(tp).key,
                            target: fv,
                            delivered: Number.isFinite(tp.cloudRadius) ? tp.cloudRadius : null,
                            via: "spoke-optimiser"
                        }), tp.topic && tp.topic.isSubcategory && (tp.children || []).forEach(ch => {
                            const cfv = dkFitTargetValueFor(ch);
                            null != cfv && dkLog.push({
                                type: "fit-deviation",
                                key: dkRadialBaseInfo(ch).key,
                                target: cfv,
                                delivered: Number.isFinite(ch.cloudRadius) ? ch.cloudRadius : null,
                                via: "spoke-optimiser"
                            });
                        });
                    });
                    n.target.entry.branch._spokeAdjust20 = n.next, i(n.target);
                }
            }
        }), or = Math.max(1, ...h.map(e => e.subcategories?.length ? (e.parentTopics || []).length + e.subcategories.length : e.topics.length)), sr = Math.ceil(20 / (2 * Math.sin(er.spread / (2 * or)))), lr = Math.max(48, 2 * sr), cr = Math.max(1, ...h.flatMap(e => (e.subcategories || []).map(e => e.topics.length))), dr = Math.ceil(20 / (2 * Math.sin(er.spread / (2 * cr)))), ur = Math.max(48, Math.min(lr - 24, 2 * dr)), pr = {
            centerX: 900,
            centerY: 620,
            centerRadius: ea.outerRadius,
            categoryIcon: lr,
            subcategoryIcon: ur,
            topicIcon: 48,
            importedIcon: 34
        };
        // Font-as-master-knob, part 2 (Build 2026-10-19_0924): mapFontScale()
        // reads the live fontScale layout value (Layout Editor "Font scale"
        // slider, part 1) through the same layout object the API getter
        // exposes, so map icon, give/receive slider, and hanky-midline
        // render geometry scales with the labels. At fontScale 1 every
        // consumer renders exactly as before this build.
        function mapFontScale() {
            const v = Number(mn && mn.fontScale);
            return Number.isFinite(v) && v > 0 ? v : 1;
        }
        // UNIFY (2026-11-02): sxSyncMapFontBase is the ONE setter of the
        // stylesheet's --map-font-base variable, fed by the LIVE scale
        // (mapFontScale() above) — U = 22 x live fontScale. It runs on
        // every render (Mr) and is exposed for the shell's boot/apply
        // paths, which call it instead of setting the variable from the
        // defaults/apply channel. No other code sets --map-font-base.
        function sxSyncMapFontBase() {
            try {
                document.documentElement.style.setProperty("--map-font-base", String(22 * mapFontScale()) + "px");
                // FONT LAW (2026-11-02 17:24): the stylesheet's
                // per-depth label fallbacks (.category-label,
                // .map-label, subcategory/child .map-label)
                // read these per-depth sizes, published here by
                // the same ONE setter; each CSS rule keeps its
                // historical calc() as the var() fallback for
                // any frame before this runs.
                if ("function" === typeof sxFontSize) {
                    document.documentElement.style.setProperty("--map-font-d1", String(sxFontSize(1)) + "px");
                    document.documentElement.style.setProperty("--map-font-d2", String(sxFontSize(2)) + "px");
                    document.documentElement.style.setProperty("--map-font-d3", String(sxFontSize(3)) + "px");
                }
            } catch (err) { __sxErrLog("map-font-base-sync", err); }
        }
        try { window.__sxSyncMapFontBase = sxSyncMapFontBase; } catch (_) {}
        // SPOKE BASE FORMULA (ruled 2026-11-01, Jason): the base of a
        // subcategory segment is no longer the fixed 430 floor. Base =
        // drawn icon radius x (300deg / number of spokes): the usable
        // circle around the branch hub icon — 360deg less the reserved
        // 60deg back angle = 300deg = 5pi/3 radians — shared equally
        // among the spokes fanning out of that hub, so a crowded fan
        // gets a smaller base and a sparse fan a bigger one. The icon
        // radius is the DRAWN radius (sxIconRadius(1) under
        // the 2026-11-02 icon depth law — (2/3)^1 x
        // sqrt(R x W), R the centre-disc radius and W the
        // ring width, floored at 12 x font scale; supersedes
        // the 0.6 linear law —
        // the size the hub icon actually renders at), never the
        // raw unscaled pr value the retired floor measured icons at.
        // The spoke count is the solved entry's cloudCount — the
        // number of gen-2 spokes in that branch's fan, stamped by
        // frCloudLayout. This helper is the ONE formula: every
        // segment-composition site (the closing capture, the
        // delivered-radius reading, the solver's renderedSpokeLength,
        // the SCC geometry build's drawH, and Ar's paint) calls it,
        // so solve, delivered, capsule and paint stay one formula.
        function sxSpokeBase(spokeCount) {
            const n = Math.max(1, Number(spokeCount) || 1);
            return sxIconRadius(1) * (5 * Math.PI / 3) / n;
        }
        // Slider size repair #2 (2026-11-01): the rating rail's visible
        // thickness and its hit strokes are screen-px quantities
        // (non-scaling-stroke), while the track length (320 * control
        // scale, map units) is camera-scaled — so a fixed 44px thickness
        // stays correct up close but dwarfs the delivered track at Full
        // zoom-out, where one inadvertently opened slider rendered as a
        // fat pill over the bunched centre spokes. sxRailPx(m) returns
        // the zoom-appropriate thickness for a control of scale m from
        // the track's CURRENT delivered screen length (14% of it, the
        // full 44px whenever the delivered length supports it, a 9px
        // floor); sxSyncRailPx() publishes that value plus the hit
        // thickness (1.6x visible, 44px cap, 14px floor) as the
        // --sx-rail-px / --sx-rail-hit-px custom properties the
        // .rating-rail / .rating-track-hit / .direction-hit CSS rules
        // read. It runs on every render (Mr) and every camera settle
        // (kh), so the open slider resizes with the camera instead of
        // keeping the size of the zoom it was opened at.
        function sxRailPx(m) {
            try {
                const rect = Cn.getBoundingClientRect(), vb = (Cn.getAttribute("viewBox") || "").split(/\s+/).map(Number), vbw = vb.length === 4 && vb[2] > 0 ? vb[2] : 3200, w = rect && rect.width > 0 ? rect.width : 1440, per = $p * w / vbw, len = 320 * (Number(m) > 0 ? m : mapFontScale()) * per;
                return Math.max(9, Math.min(44, len * .14));
            } catch (err) {
                return 44;
            }
        }
        function sxSyncRailPx() {
            try {
                const rail = sxRailPx(mapFontScale());
                Cn.style.setProperty("--sx-rail-px", rail.toFixed(1) + "px"), Cn.style.setProperty("--sx-rail-hit-px", Math.max(14, Math.min(44, rail * 1.6)).toFixed(1) + "px");
            } catch (err) { __sxErrLog("rail-px-sync", err); }
        }
        function hr(e) {
            return [ 128, 180, 1080, 3300 ][e] || 3300 + 1700 * (e - 3);
        }
        function gr(e, t, n, i, a = 0) {
            return Za.angularDemand(e, t, n, i, a);
        }
        function mr(e, t, n, i, a, r, o = 0) {
            return Za.allocateSectors(e, t, n, i, a, r, o);
        }
        // Branch order (Build 2026-10-16_2020): mn.branchOrder selects the angular
        // order of the top-level branches around the center node. "popularity"
        // places the most popular category at 12:00 and continues in descending
        // popularity clockwise, using the same mean-topic-popularity scoring
        // (z over H, ordered by U) as the outline and detail caps. "relations"
        // starts from the popularity order and hill-climbs pairwise branch swaps
        // to minimize the summed chord length over the branch relation pairs
        // (ue), so related branches sit angularly close. "landscape-antipodal" sorts by
        // descendant topic count and anchors to the landscape axis: densest at
        // 3:00, second densest at 9:00, sparsest at 12:00, second sparsest at
        // 6:00 (nearest available positions when the even spacing misses a
        // cardinal point), the rest in descending density toward the vertical
        // positions. Results are cached per mode; the data never changes at
        // runtime, so a cached order stays valid for the life of the page.
        // Build 2026-10-17_0308: the "stagger" mode is renamed
        // "landscape-antipodal" (display name "Landscape-Antipodal"); the
        // legacy value "stagger" is still accepted and normalized to the
        // new name in branchOrderRankMap, and the ordering function
        // (branchOrderStaggerNames) and its geometry are unchanged.
        // Build 2026-10-16_2101: branchOrderRankMap previously resolved any
        // mode other than "relations"/"stagger" to "stagger", so the
        // "popularity" mode silently rendered the stagger order; the mode
        // check below now accepts all three modes.
        // Build 2026-10-16_2206: fourth mode "alternate" (Alternate density)
        // interleaves the density-sorted branches — densest, sparsest, 2nd
        // densest, 2nd sparsest, ... — so every dense branch is flanked by
        // sparse neighbors. Separately, mn.propFan (Proportional fan) is
        // orthogonal to the order mode: when on, each branch spoke sits at
        // the center of the sector allocateSectors sized in proportion to
        // its topic weight, instead of the even 2π/count slot.
        // Build 2026-10-17_0044: fifth mode "subbranches" (Sub-branches)
        // orders by subcategory count with antipodal separation (see
        // branchOrderSubBranchesNames). Two more orthogonal flags land in
        // this build: mn.subcatOrder (Antipodal subcategories) reorders the
        // gen-2 siblings inside each subcategorized branch in fr(), and
        // mn.staggerDensity (Stagger density, default on) scales category
        // spoke lengths by kink-count density in yr().
        // Build 2026-10-17_0330: ninth mode "complexity-antipodal"
        // (Complexity-Antipodal) — see branchOrderComplexityAntipodalNames.
        let branchOrderCacheMode = "", branchOrderCacheMap = null;
        function branchOrderPopularityNames() {
            return U(h, z, e => e.name).map(e => e.name);
        }
        function branchOrderRelationsNames(start) {
            const order = start.slice(), count = order.length, pos = new Map(order.map((name, i) => [ name, i ])), pairs = pe(ue).filter(pair => pos.has(pair[0]) && pos.has(pair[1])), step = 2 * Math.PI / count, chord = (a, b) => {
                const d = Math.min(Math.abs(pos.get(a) - pos.get(b)), count - Math.abs(pos.get(a) - pos.get(b))) * step;
                return 2 * Math.sin(d / 2);
            }, total = () => pairs.reduce((sum, pair) => sum + chord(pair[0], pair[1]), 0);
            let cost = total();
            for (let pass = 0; pass < 80; pass++) {
                let improved = !1;
                for (let i = 0; i < count - 1; i++) for (let j = i + 1; j < count; j++) {
                    const a = order[i], b = order[j];
                    pos.set(a, j), pos.set(b, i), order[i] = b, order[j] = a;
                    const next = total();
                    if (next < cost - 1e-9) cost = next, improved = !0; else pos.set(a, i), pos.set(b, j), order[i] = a, order[j] = b;
                }
                if (!improved) break;
            }
            return order;
        }
        function branchOrderStaggerNames() {
            const count = h.length, byDensity = h.slice().sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, nearest = target => {
                let best = -1, bestDist = Infinity, bestSin = -Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p]) continue;
                    const a = angle(p), dist = Math.abs(Math.atan2(Math.sin(a - target), Math.cos(a - target))), sin = Math.sin(a);
                    if (dist < bestDist - 1e-9 || Math.abs(dist - bestDist) <= 1e-9 && sin > bestSin) best = p, bestDist = dist, bestSin = sin;
                }
                return best;
            };
            order[nearest(0)] = byDensity[0].name, order[nearest(Math.PI)] = byDensity[1].name, order[nearest(-Math.PI / 2)] = byDensity[count - 1].name, order[nearest(Math.PI / 2)] = byDensity[count - 2].name;
            const rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            rest.sort((p, q) => Math.abs(Math.cos(angle(q))) - Math.abs(Math.cos(angle(p))) || angle(p) - angle(q));
            const middle = byDensity.slice(2, count - 2);
            return rest.forEach((p, i) => order[p] = middle[i].name), order;
        }
        function branchOrderAlternateNames() {
            const byDensity = h.slice().sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = [];
            let lo = 0, hi = byDensity.length - 1, dense = !0;
            while (lo <= hi) dense ? (order.push(byDensity[lo++].name), dense = !1) : (order.push(byDensity[hi--].name), dense = !0);
            return order;
        }
        // Sub-branches (Build 2026-10-17_0044): order the primary branches by
        // SUBCATEGORY count (not kink count) with antipodal separation. The
        // branch with the most sub-branches anchors at 0°, the 2nd most at
        // 180°, the 3rd at 90°, the 4th at 270° (nearest free slots); the
        // remaining slots fill by descending |cos| (alternating sides toward
        // the verticals), taking branches sparse-first interleaved with
        // next-densest, so the slots beside the anchors go to the branches
        // with the fewest sub-branches and no two sub-branch-heavy branches
        // sit adjacent.
        function branchOrderSubBranchesNames() {
            const count = h.length, subCount = e => (e.subcategories || []).length, bySub = h.slice().sort((a, b) => subCount(b) - subCount(a) || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, nearest = target => {
                let best = -1, bestDist = Infinity, bestSin = -Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p]) continue;
                    const a = angle(p), dist = Math.abs(Math.atan2(Math.sin(a - target), Math.cos(a - target))), sin = Math.sin(a);
                    if (dist < bestDist - 1e-9 || Math.abs(dist - bestDist) <= 1e-9 && sin > bestSin) best = p, bestDist = dist, bestSin = sin;
                }
                return best;
            };
            order[nearest(0)] = bySub[0].name, order[nearest(Math.PI)] = bySub[1].name, order[nearest(Math.PI / 2)] = bySub[2].name, order[nearest(-Math.PI / 2)] = bySub[3].name;
            const rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            rest.sort((p, q) => Math.abs(Math.cos(angle(q))) - Math.abs(Math.cos(angle(p))) || angle(p) - angle(q));
            const tail = bySub.slice(4), fill = [];
            let lo = 0, hi = tail.length - 1, sparseFirst = !0;
            while (lo <= hi) sparseFirst ? (fill.push(tail[hi--].name), sparseFirst = !1) : (fill.push(tail[lo++].name), sparseFirst = !0);
            return rest.forEach((p, i) => order[p] = fill[i]), order;
        }
        // Three more modes (Build 2026-10-17_0103). "antipodal" (Antipodal
        // Total): sort by TOTAL children — subcategory count plus direct
        // (parent) topics for subcategorized branches, topic count for flat
        // ones — then pair the sorted list (1st with 2nd, 3rd with 4th, ...)
        // and place each pair 180° apart: pair leaders take every other slot
        // starting from the slot nearest 0°, partners sit exactly opposite,
        // so the heaviest branches are maximally separated, never adjacent.
        // "quadrant" (Quadrant Balance): deal the branches in descending
        // topic-weight order into the four quadrants (NE/SE/SW/NW slot
        // groups), each branch going to the eligible quadrant with the least
        // accumulated topic weight, so every quadrant carries roughly equal
        // visual weight; within a quadrant, dealt order fills its slots in
        // circular order. "branching" (Branching-First Interleave): the
        // categories that HAVE subcategories, sorted by subcategory count,
        // take evenly spaced slots (one per 360/7 step from the top), and
        // the flat categories fill the remaining slots in descending topic
        // count — structural branching complexity is spread around the map
        // instead of topic bulk.
        function branchOrderAntipodalNames() {
            const count = h.length, totalChildren = e => e.subcategories && e.subcategories.length ? e.subcategories.length + (e.parentTopics || []).length : e.topics.length, byTotal = h.slice().sort((a, b) => totalChildren(b) - totalChildren(a) || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, half = count / 2;
            let start = 0, bestDist = Infinity;
            for (let p = 0; p < count; p++) {
                const a = angle(p), d = Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
                d < bestDist - 1e-9 && (bestDist = d, start = p);
            }
            for (let j = 0; j < half; j++) {
                const s = (start + 2 * j) % count;
                order[s] = byTotal[2 * j].name, order[(s + half) % count] = byTotal[2 * j + 1].name;
            }
            return order;
        }
        function branchOrderQuadrantNames() {
            const count = h.length, angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, quadrants = [ [], [], [], [] ];
            for (let p = 0; p < count; p++) {
                const deg = (angle(p) * 180 / Math.PI + 360) % 360;
                quadrants[deg >= 270 ? 0 : deg < 90 ? 1 : deg < 180 ? 2 : 3].push(p);
            }
            const byWeight = h.slice().sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), dealt = [ [], [], [], [] ], load = [ 0, 0, 0, 0 ], order = new Array(count).fill(null);
            byWeight.forEach(e => {
                let pick = -1;
                for (let q = 0; q < 4; q++) {
                    if (dealt[q].length >= quadrants[q].length) continue;
                    if (pick < 0 || load[q] < load[pick] || load[q] === load[pick] && dealt[q].length < dealt[pick].length) pick = q;
                }
                dealt[pick].push(e.name), load[pick] += e.topics.length;
            });
            return quadrants.forEach((slots, q) => slots.forEach((p, i) => order[p] = dealt[q][i])), order;
        }
        function branchOrderBranchingNames() {
            const count = h.length, angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, branched = h.filter(e => e.subcategories && e.subcategories.length).sort((a, b) => b.subcategories.length - a.subcategories.length || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), flat = h.filter(e => !(e.subcategories && e.subcategories.length)).sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), spread = [];
            branched.forEach((e, k) => {
                const target = -Math.PI / 2 + k * 2 * Math.PI / branched.length;
                let best = -1, bestDist = Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p] || spread.includes(p)) continue;
                    const d = Math.abs(Math.atan2(Math.sin(angle(p) - target), Math.cos(angle(p) - target)));
                    d < bestDist - 1e-9 && (bestDist = d, best = p);
                }
                spread.push(best);
            });
            spread.sort((a, b) => a - b), spread.forEach((p, i) => order[p] = branched[i].name);
            const rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            return rest.forEach((p, i) => order[p] = flat[i].name), order;
        }
        // Complexity-Antipodal (Build 2026-10-17_0330): ninth mode
        // "complexity-antipodal". The categories that HAVE subcategories,
        // sorted by subcategory count descending (ties: topic count,
        // popularity, name), become anchors placed in exact antipodal
        // pairs around the clock: #1 at 3:00 with #2 exactly opposite at
        // 9:00, #3 at 12:00 with #4 at 6:00, #5 at 1:30 with #6 at 7:30,
        // #7 at 4:30 (nearest free slots to each target). Every other
        // slot is a buffer, filled sparsest-first: categories with NO
        // subcategories, fewest kinks (topics) first; if that list ever
        // runs out, the remaining categories with the fewest
        // subcategories come next. Slots beside an anchor fill before
        // slots farther away, so each complex branch is cushioned on
        // both sides by the simplest branches.
        function branchOrderComplexityAntipodalNames() {
            const count = h.length, subCount = e => (e.subcategories || []).length, angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, order = new Array(count).fill(null), used = new Set, nearest = target => {
                let best = -1, bestDist = Infinity, bestSin = -Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p]) continue;
                    const a = angle(p), dist = Math.abs(Math.atan2(Math.sin(a - target), Math.cos(a - target))), sin = Math.sin(a);
                    if (dist < bestDist - 1e-9 || Math.abs(dist - bestDist) <= 1e-9 && sin > bestSin) best = p, bestDist = dist, bestSin = sin;
                }
                return best;
            }, pairTargets = [ 0, -Math.PI / 2, -Math.PI / 4, Math.PI / 4, -3 * Math.PI / 8, 3 * Math.PI / 8 ], anchors = h.filter(e => subCount(e) > 0).sort((a, b) => subCount(b) - subCount(a) || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)).slice(0, 2 * pairTargets.length), anchorSlots = [];
            anchors.forEach((e, i) => {
                let p;
                if (i % 2 === 0) p = nearest(pairTargets[i / 2]); else {
                    const anti = (anchorSlots[i - 1] + count / 2) % count;
                    p = Number.isInteger(anti) && !order[anti] ? anti : nearest(pairTargets[(i - 1) / 2] + Math.PI);
                }
                order[p] = e.name, used.add(e.name), anchorSlots.push(p);
            });
            const buffers = h.filter(e => !used.has(e.name)).sort((a, b) => subCount(a) - subCount(b) || a.topics.length - b.topics.length || (z(a) ?? 0) - (z(b) ?? 0) || a.name.localeCompare(b.name)), rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            rest.sort((p, q) => {
                const steps = s => anchorSlots.length ? Math.min(...anchorSlots.map(a => Math.min(Math.abs(s - a), count - Math.abs(s - a)))) : 0;
                return steps(p) - steps(q) || p - q;
            });
            return rest.forEach((p, i) => order[p] = buffers[i].name), order;
        }
        function branchOrderRankMap() {
            const mode = "popularity" === mn.branchOrder || "relations" === mn.branchOrder || "landscape-antipodal" === mn.branchOrder || "stagger" === mn.branchOrder || "alternate" === mn.branchOrder || "subbranches" === mn.branchOrder || "antipodal" === mn.branchOrder || "quadrant" === mn.branchOrder || "branching" === mn.branchOrder || "complexity-antipodal" === mn.branchOrder ? ("stagger" === mn.branchOrder ? "landscape-antipodal" : mn.branchOrder) : "landscape-antipodal";
            if (branchOrderCacheMap && branchOrderCacheMode === mode) return branchOrderCacheMap;
            const order = "relations" === mode ? branchOrderRelationsNames(branchOrderPopularityNames()) : "landscape-antipodal" === mode ? branchOrderStaggerNames() : "alternate" === mode ? branchOrderAlternateNames() : "subbranches" === mode ? branchOrderSubBranchesNames() : "antipodal" === mode ? branchOrderAntipodalNames() : "quadrant" === mode ? branchOrderQuadrantNames() : "branching" === mode ? branchOrderBranchingNames() : "complexity-antipodal" === mode ? branchOrderComplexityAntipodalNames() : branchOrderPopularityNames(), map = new Map;
            return order.forEach((name, i) => map.set(name, i)), branchOrderCacheMode = mode, branchOrderCacheMap = map, map;
        }
        // Build the complete map geometry, then run the layout passes in a fixed,
        // documented order. Default sibling radii are uniform.
        // P1 refactor (Build 2026-10-18_2227): fr (map geometry) split by
        // responsibility — frBuildTree builds the visible topic tree,
        // frAssignCategoryAngles the branch spoke angles,
        // frAllocateTopicSectors the gen-2/gen-3 sectors, frCloudLayout
        // the topic clouds, frClampCloudRadii the neighbor radius clamp,
        // and frCollisionPasses the collision/crossing passes. fr itself
        // is now a thin orchestrator.
