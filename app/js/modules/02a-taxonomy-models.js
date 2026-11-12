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
            const res = el.closest(sel);
            if (!res && window.__SX_ALLOW_DOM_FALLBACK) return el;
            return res;
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
        // sxName's other copy lives inside the map IIFE in 02-taxonomy-core.js.
        // This catalog pass runs in the outer boot function, before that IIFE,
        // so it needs its own copy. Function declarations do not cross that boundary.
        function sxName(e) {
            return e && "object" == typeof e ? String(e.name || "") : String(e || "");
        }
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
