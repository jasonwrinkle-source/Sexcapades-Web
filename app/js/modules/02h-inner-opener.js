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
