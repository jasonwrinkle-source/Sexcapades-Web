        const Oc = e.byId("scribeDialog"), Bc = e.byId("scribeChoiceDialog"), jc = e.byId("novelAiDialog");
        let scribeLeadId = null, scribePartnerId = null, scribeCastIds = [];
        function Uc() {
            return [ ...new Set(h.flatMap(e => e.topics.map(e => Wn(e))).concat(li().map(e => e.id))) ];
        }
        function Gc(e, t) {
            return t ? String(Math.round(e)) : "unrated";
        }
        function zc(e) {
            const t = e && e.giveKnown ? Number(e.give) : null, n = e && e.receiveKnown ? Number(e.receive) : null;
            if (null === t && null === n) return "";
            const i = null === t ? 0 : t, a = null === n ? 0 : n, r = Math.max(i, a), o = Math.abs(i - a);
            return r < 56 || o < 30 ? "" : i > a ? "dominant" : "submissive";
        }
        function Vc(e) {
            return "";
        }
        function Yc(e) {
            return "";
        }
        function Xc(e, t) {
            return "dominant" === e && "submissive" === t ? "firstGive" : "submissive" === e && "dominant" === t ? "secondGive" : "";
        }
        function Zc(e, t, n) {
            const i = Xc(t, n);
            if (!i) return "";
            const r = legacyTopicIdByOpaque[e] || e, a = r.startsWith("topic-bondage-restriction-") || r.startsWith("topic-impact-pain-body-modification-") || r.startsWith("topic-psychological-dynamics-") || r.startsWith("topic-primal-pursuit-") || [ "t0004", "t0005", "t0127", "topic-caregiver-roles-adults", "t0131", "topic-teacher-student-roleplay", "topic-captivity-kidnapping", "topic-consensual-non-consent-fantasy", "t0326", "t0327", "t0328" ].includes(e) ? "give" : [ "t0006", "t0375" ].includes(e) ? "receive" : "";
            return a ? "give" === a ? i : "firstGive" === i ? "secondGive" : "firstGive" : "";
        }
        function Qc(e, t, n, i, a, r) {
            const o = Ge(r), s = o.labels[0], l = o.labels[1] || o.labels[0];
            return "firstGive" === e.key ? `${i}: ${s} ${Gc(t.give, t.giveKnown)} · ${a}: ${l} ${Gc(n.receive, n.receiveKnown)}` : `${a}: ${s} ${Gc(n.give, n.giveKnown)} · ${i}: ${l} ${Gc(t.receive, t.receiveKnown)}`;
        }
        function Jc(e, t) {
            return t && e >= 0 && e <= 35;
        }
        function ed(e) {
            return String(e || "").replace(/\bProfile 1\b/gi, "Jason");
        }
        function td(e) {
            return ed(e).replace(/^(?:Explore and try only after a check-in|Curious about — discuss before deciding):\s*/i, "").replace(/\.\s*Confirm the other participant’s interest and make opting out easy\.?$/i, ".").replace(/^(?:Explore and try with an explicit check-in and easy opt-out\.|Curious about — discuss before deciding, with an easy opt-out\.)\s*/i, "").replace(/confirm give\/receive roles before starting/gi, "favorite without a recorded role");
        }
        function nd(e, t, n, i = ed) {
            return `${e}: ${(t.length ? t.map(e => `- ${"curious" === e.kind ? "[CURIOUS ABOUT] " : ""}${e.label}${e.matchLabel ? ` (${Math.round(e.score)}% ${e.matchLabel})` : ` (${"curious" === e.kind ? "Curious about" : "Want to do"} ${Math.round(e.score)})`}: ${i(e.detail)}`) : [ `- ${n}` ]).join(" ")}`;
        }
        function id(e) {
            const t = Math.max(0, Math.min(100, Number(e) || 0));
            return t <= 20 ? "tentatively Curious about" : t <= 35 ? "strongly Curious about" : t <= 55 ? "moderately Want to do" : t <= 79 ? "strongly Want to do" : "very strongly Want to do";
        }
        // The active skin's Scribe genre: "discussion" on the vanilla
        // stance/belief maps, "story" on Sexcapades. The loader sets
        // window.__SX_SCRIBE from the skin JSON's `scribe` section.
        function sxScribeIsDiscussion() {
            return !!(window.__SX_SCRIBE && "discussion" === window.__SX_SCRIBE.genre);
        }
        // The active skin's Scene Setter genre: "moderation" on the
        // vanilla stance/belief maps, "play" on Sexcapades. The loader
        // sets window.__SX_SETTER from the skin JSON's `sceneSetter`
        // section. A missing section reads as play (Sexcapades copy
        // stays in place) — honest, not stale.
        function sxSetterIsModeration() {
            return !!(window.__SX_SETTER && "moderation" === window.__SX_SETTER.genre);
        }
        function rd(e) {
            const t = wt[e] || "Participant";
            return Ji(/^profile\s*1$/i.test(t) ? "Jason" : t) || "Participant";
        }
        function hp(e) {
            const t = String(pz[e] || "").trim();
            if (t) return t;
            const n = bb(rt[e]);
            return n.length && n.every(e => [ "man", "trans-man", "intersex-man" ].includes(e)) ? "he/him" : n.length && n.every(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)) ? "she/her" : "they/them";
        }
        // Anonymous center avatar for a profile with no stored photo: matched to the
        // profile's gender as best as possible, through the same accessor (bb on rt)
        // the pronouns resolver (hp) above already uses. Genderfluid, mixed-side,
        // unknown, or absent gender takes the neutral default.
        // TODO: no feminine anonymous avatar asset exists yet, so the woman-side key
        // set maps to the neutral anonymous avatar too until one is made. The sample
        // profiles' menu portraits are those profiles' own icons, not generic
        // avatars — never substitute them here.
        function sxMakeArchetypePhoto(name, skinId) {
            name = String(name || "Archetype").trim();
            skinId = String(skinId || (typeof window !== "undefined" && window.__SX_ACTIVE_SKIN) || "sexcapades").toLowerCase();
            var bg1 = "#1e293b", bg2 = "#0f172a", fg = "#f8fafc", accent = "#38bdf8";
            if (skinId.includes("fores")) { bg1 = "#1e293b"; bg2 = "#0c1524"; accent = "#eab308"; fg = "#fef08a"; }
            else if (skinId.includes("sex")) { bg1 = "#2e1065"; bg2 = "#0f051d"; accent = "#ec4899"; fg = "#fbcfe8"; }
            else if (skinId.includes("dharma")) { bg1 = "#451a03"; bg2 = "#1c0a00"; accent = "#f59e0b"; fg = "#fde68a"; }
            else if (skinId.includes("philo")) { bg1 = "#14532d"; bg2 = "#052e16"; accent = "#84cc16"; fg = "#d9f99d"; }
            else if (skinId.includes("chem") || skinId.includes("matter")) { bg1 = "#164e63"; bg2 = "#082f49"; accent = "#06b6d4"; fg = "#a5f3fc"; }
            else if (skinId.includes("quanta") || skinId.includes("theori")) { bg1 = "#312e81"; bg2 = "#1e1b4b"; accent = "#a855f7"; fg = "#e9d5ff"; }
            else if (skinId.includes("polis")) { bg1 = "#1e3a8a"; bg2 = "#0f172a"; accent = "#3b82f6"; fg = "#bfdbfe"; }
            else if (skinId.includes("aesth")) { bg1 = "#701a75"; bg2 = "#2e0854"; accent = "#f43f5e"; fg = "#fecdd3"; }

            var parts = name.split(/\s+/).filter(Boolean);
            var initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
            var lower = name.toLowerCase();
            var symbolSvg = "";

            if (lower.includes("creed") || lower.includes("baptist") || lower.includes("catholic") || lower.includes("orthodox") || lower.includes("lutheran") || lower.includes("methodist") || lower.includes("christian") || lower.includes("faith")) {
                symbolSvg = '<path d="M256 120 V392 M180 200 H332" stroke="' + accent + '" stroke-width="24" stroke-linecap="round"/>' +
                            '<circle cx="256" cy="200" r="44" fill="none" stroke="' + fg + '" stroke-width="8" stroke-dasharray="6 8" opacity="0.8"/>';
            } else if (lower.includes("buddhism") || lower.includes("zen") || lower.includes("dharma")) {
                symbolSvg = '<circle cx="256" cy="240" r="72" fill="none" stroke="' + accent + '" stroke-width="16"/>' +
                            '<circle cx="256" cy="240" r="24" fill="' + fg + '"/>' +
                            '<path d="M256 168 V312 M184 240 H328 M205 189 L307 291 M205 291 L307 189" stroke="' + accent + '" stroke-width="10"/>';
            } else if (lower.includes("sadist") || lower.includes("degrader") || lower.includes("edge")) {
                symbolSvg = '<path d="M256 130 C270 200 320 230 320 280 C320 330 290 370 256 370 C222 370 192 330 192 280 C192 230 242 200 256 130 Z" fill="' + accent + '" opacity="0.85"/>' +
                            '<path d="M256 220 C265 250 285 270 285 300 C285 325 270 345 256 345 C242 345 227 325 227 300 C227 270 247 250 256 220 Z" fill="' + fg + '"/>';
            } else if (lower.includes("dominant") || lower.includes("brat tamer") || lower.includes("rigger")) {
                symbolSvg = '<path d="M176 340 L160 210 L216 270 L256 160 L296 270 L352 210 L336 340 Z" fill="' + accent + '" stroke="' + fg + '" stroke-width="12" stroke-linejoin="round"/>' +
                            '<circle cx="160" cy="195" r="10" fill="' + fg + '"/><circle cx="256" cy="145" r="12" fill="' + fg + '"/><circle cx="352" cy="195" r="10" fill="' + fg + '"/>';
            } else if (lower.includes("submissive") || lower.includes("masochist") || lower.includes("prey") || lower.includes("bunny")) {
                symbolSvg = '<path d="M256 140 C320 140 340 180 340 250 C340 330 256 370 256 370 C256 370 172 330 172 250 C172 180 192 140 256 140 Z" fill="none" stroke="' + accent + '" stroke-width="16"/>' +
                            '<circle cx="256" cy="245" r="32" fill="' + fg + '" opacity="0.9"/>';
            } else if (lower.includes("switch")) {
                symbolSvg = '<path d="M256 150 A90 90 0 0 1 256 330 A45 45 0 0 1 256 240 A45 45 0 0 0 256 150 Z" fill="' + accent + '"/>' +
                            '<path d="M256 150 A90 90 0 0 0 256 330 A45 45 0 0 0 256 240 A45 45 0 0 1 256 150 Z" fill="' + fg + '"/>' +
                            '<circle cx="256" cy="195" r="12" fill="' + bg2 + '"/><circle cx="256" cy="285" r="12" fill="' + bg1 + '"/>';
            } else if (lower.includes("chemist") || lower.includes("physic") || lower.includes("science")) {
                symbolSvg = '<ellipse cx="256" cy="240" rx="90" ry="36" fill="none" stroke="' + accent + '" stroke-width="12" transform="rotate(30 256 240)"/>' +
                            '<ellipse cx="256" cy="240" rx="90" ry="36" fill="none" stroke="' + accent + '" stroke-width="12" transform="rotate(-30 256 240)"/>' +
                            '<circle cx="256" cy="240" r="18" fill="' + fg + '"/>';
            } else {
                symbolSvg = '<circle cx="256" cy="240" r="85" fill="none" stroke="' + accent + '" stroke-width="8" stroke-dasharray="14 10"/>' +
                            '<text x="256" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="700" fill="' + fg + '" text-anchor="middle" dominant-baseline="middle">' + initials + '</text>';
            }

            var labelText = name.length > 20 ? name.slice(0, 18) + '…' : name;
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">' +
                      '<defs>' +
                      '<radialGradient id="arcBg" cx="50%" cy="40%" r="65%">' +
                      '<stop offset="0%" stop-color="' + bg1 + '"/>' +
                      '<stop offset="100%" stop-color="' + bg2 + '"/>' +
                      '</radialGradient>' +
                      '<linearGradient id="arcRim" x1="0%" y1="0%" x2="100%" y2="100%">' +
                      '<stop offset="0%" stop-color="' + accent + '" stop-opacity="0.9"/>' +
                      '<stop offset="100%" stop-color="' + accent + '" stop-opacity="0.3"/>' +
                      '</linearGradient>' +
                      '</defs>' +
                      '<rect width="512" height="512" fill="url(#arcBg)"/>' +
                      '<circle cx="256" cy="256" r="236" fill="none" stroke="url(#arcRim)" stroke-width="14"/>' +
                      '<circle cx="256" cy="256" r="218" fill="none" stroke="' + fg + '" stroke-width="2" opacity="0.3"/>' +
                      symbolSvg +
                      '<text x="256" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="' + fg + '" text-anchor="middle" letter-spacing="1" opacity="0.92">' +
                      labelText +
                      '</text>' +
                      '</svg>';

            return {
                data: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
                width: 512,
                height: 512,
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0
            };
        }
        if (typeof window !== "undefined") window.__sxMakeArchetypePhoto = sxMakeArchetypePhoto;

        // Anonymous center avatar for a profile with no stored photo:
        // For archetype and sample profiles with no stored human portrait,
        // render an archetype symbol/picture rather than a generic human face.
        function sxAnonAvatarPhoto(e) {
            if ((sampleProfileFlags && sampleProfileFlags[e]) || (typeof window !== "undefined" && window.SEXCAPADES_SAMPLE_PROFILES && window.SEXCAPADES_SAMPLE_PROFILES[e] && window.SEXCAPADES_SAMPLE_PROFILES[e].kind !== "sample")) {
                const name = (Xe && Xe[e]) || (typeof window !== "undefined" && window.SEXCAPADES_SAMPLE_PROFILES && window.SEXCAPADES_SAMPLE_PROFILES[e] && window.SEXCAPADES_SAMPLE_PROFILES[e].name) || e;
                const skin = (profileSkins && profileSkins[e]) || (typeof window !== "undefined" && window.__SX_ACTIVE_SKIN) || "sexcapades";
                return sxMakeArchetypePhoto(name, skin);
            }
            const n = bb(rt[e]), a = "assets/avatar-anon.webp";
            const src = n.length && n.every(e => [ "man", "trans-man", "intersex-man" ].includes(e)) ? a : n.length && n.every(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)) ? a : a;
            return {
                data: src,
                width: 1600,
                height: 1600,
                cropX: .5,
                cropY: .5,
                cropZoom: 1,
                cropReady: !0
            };
        }
        function od(e) {
            // Gender/orientation NO LONGER REQUIRED (owner ruling,
            // 2026-11-16): the profile-details demand is relaxed —
            // Scribe and Scene Setter pick pronouns from context
            // (hp() already falls back to they/them when no gender is
            // stored), so a profile without gender/sexuality is
            // complete as-is. od() stays as the "missing required
            // details" hook for any future required field; today the
            // set is empty. This stops the details dialog auto-opening
            // after archetype/sample loads (rk) and stops the export
            // gate (Jv) demanding them.
            return [];
        }
        function sd(e) {
            return e.filter(e => od(e).length).map(e => `${od(e).join(" and ")} for ${rd(e)}`).join("; ");
        }
        function ld(e, t, n) {
            const i = ca(e, t), a = ca(e, n);
            return `${rd(t)} — ${ad(i, e) || "no positive direction recorded"}; ${rd(n)} — ${ad(a, e) || "no positive direction recorded"}.`;
        }
        function cd(e, t) {
            const n = Array.isArray(t) ? t : [ t ];
            return {
                fantasyOnly: n.some(t => Ha(e, t)),
                alreadyTried: n.some(t => Wa(e, t))
            };
        }
        function dd(e) {
            return `${e.fantasyOnly ? " Fantasy only: keep this fictional and do not treat it as real-world willingness." : ""}${e.alreadyTried ? " Already tried: past experience may be referenced without inventing details." : ""}`;
        }
        function ud(e, t) {
            const n = Array.isArray(t) ? t : [ t ], i = e => n.filter(t => e(t)).map(e => rd(e)).join(", ") || "none";
            return `MARKERS — Favorite (★): ${i(t => "favorite" === Oa(e, t))}; Hard Limit (×): ${i(t => Ba(e, t, "limit"))}; Not Interested (⊘): ${i(t => Ba(e, t, "notinterested"))}; Fantasy-only (☁): ${i(t => Ha(e, t))}; Already Tried (✓): ${i(t => Wa(e, t))}.`;
        }
        // Established-rule note (writers, do not unify without a ruling):
        // the single-profile builder sxSingleProfileData() below establishes a topic by
        // Favorite OR by any single direction rating over 35
        // (s.give > 35 or s.receive > 35; score = the max qualifying
        // rating, or 100 for a Favorite). The pair builder
        // gdStrongMatches() establishes by sync-engine MATCH outcome
        // only, with NO score filter. These are two different intended
        // rules. The single-profile 35 is also a different 35 from the Heat teaser
        // threshold T = sxClamp(35 - heat, 0, 85) in the sync engine;
        // the shared numeral is coincidence, not a shared constant.
        // Established rule — INTENDED, do not "unify" (writers
        // refactor F10, documentation only): the single-profile rule
        // here is THRESHOLD-BASED — a topic is established when it is
        // marked Favorite OR when either direction rating is over 35
        // (give > 35 or receive > 35, each direction judged on its
        // own, never averaged); the established score is the max of
        // the over-35 direction ratings, or 100 for a Favorite with
        // none. The pair rule (gdStrongMatches, and the group rule in
        // sxMultiMatchData built on pair outcomes) is OUTCOME-BASED
        // instead: established means a sync-engine MATCH outcome,
        // with no score filter at all. The two rules differ
        // structurally on purpose; unifying them would change output
        // and needs the user's ruling, not a refactor. Note also:
        // the 35 above is a rating threshold and is a DIFFERENT 35
        // from Heat's T = clamp(35 − heat, 0, 85) in sxSides —
        // same number, unrelated meanings.
        function sxSingleProfileData(e) {
            const t = rd(e), n = [], i = [];
            let a = 0;
            const isDisc = sxScribeIsDiscussion();
            return Uc().forEach(r => {
                if (ja(r, e)) return void a++;
                const o = qn[r];
                if (!o) return;
                // Multi-pole / line topic: the strongest pole
                // affinity (or the line scalar) joins the give/receive
                // ratings in the same 35 threshold — established when
                // |strongest| > 35, curious when 15 < |strongest| <= 35,
                // score = the strongest affinity. Low-signal / near-zero
                // (|affinity| <= 15) are neutral noise and omitted unless
                // marked Favorite or Fantasy-only.
                const s = ca(r, e), l = "favorite" === Qe[e]?.[r], pa = sxPoleAffinities(r, s), c = [ s.giveKnown && s.give > 35 ? s.give : null, s.receiveKnown && s.receive > 35 ? s.receive : null ].concat(pa ? pa.filter(v => v > 35) : []).filter(e => null !== e), d = [ s.giveKnown && s.give > 15 && s.give <= 35 ? s.give : null, s.receiveKnown && s.receive > 15 && s.receive <= 35 ? s.receive : null ].concat(pa ? pa.filter(v => v > 15 && v <= 35) : []).filter(e => null !== e);
                if (l || c.length) {
                    const i = c.length ? Math.max(...c) : 100, a = cd(r, e), stance = ad(s, r);
                    n.push({
                        id: r,
                        label: o.label,
                        branch: o.branch,
                        score: i,
                        kind: l ? "favorite" : "interest",
                        ...a,
                        detail: isDisc ? (l ? `${t} marked this Favorite${stance ? " · holds " + stance : ""}.` : `${t} holds ${stance || "no recorded stance"}.`) + dd(a) : `${t}${l ? " marked this Favorite" : ""}${l && stance ? " · " : l ? "" : " wants to do · "}${stance || "confirm the roles before starting"}.${dd(a)}`
                    });
                } else if (d.length || Ha(r, e)) {
                    const n = cd(r, e), a = d.length ? Math.max(...d) : 1;
                    i.push({
                        id: r,
                        label: o.label,
                        branch: o.branch,
                        score: a,
                        kind: "curious",
                        ...n,
                        detail: isDisc ? `${t} recorded a mild stance: ${ad(s, r) || "no strong stance"}. A mild stance is not a settled position.${dd(n)}` : `${n.fantasyOnly ? "Fictional fantasy only:" : "Curious about — discuss before deciding:"} ${t} recorded ${ad(s, r) || "no real-world willingness"}. ${n.fantasyOnly ? "Do not treat this as a practical activity." : "Curious about is not Want to do; ask explicitly and make opting out easy."}${dd(n)}`
                    });
                }
            }), n.sort((e, t) => ("favorite" === t.kind) - ("favorite" === e.kind) || t.score - e.score || e.label.localeCompare(t.label)), 
            i.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label)), {
                name: t,
                established: n,
                curious: i,
                limits: a
            };
        }
        function sxPhaseSplit(e, t) {
            const n = e.concat(t).filter(e => "Connection & aftercare" === e.branch), i = e.filter(e => "Connection & aftercare" !== e.branch), a = t.filter(e => "Connection & aftercare" !== e.branch), r = i.slice(0, 1), o = i.slice(1).sort((e, t) => e.score - t.score || e.label.localeCompare(t.label)), s = o.slice(0, Math.ceil(o.length / 2)), l = o.slice(Math.ceil(o.length / 2)), c = Math.ceil(a.length / 2);
            return {
                established: e,
                curious: t,
                warmup: s.concat(a.slice(0, c)),
                escalation: l.concat(a.slice(c)),
                peak: r,
                aftercare: n
            };
        }
        // P1 refactor (Build 2026-10-18_2227): gd (Scribe/compatibility data
        // assembly) split by responsibility — gdPairReport computes the pair
        // report, gdStrongMatches the strong-match list, gdCuriousMatches
        // the curious-match list; gd itself is now a thin orchestrator.
        // One combined-match detail builder for every writer list
        // (refactor F7). The kind parameter selects the per-kind wording;
        // each branch reproduces its original string verbatim — a score,
        // a route via _d(), and the ld()/dd() fragments for the pair
        // kinds; the group kind lists every member's direction line; the
        // pairwise kind is the shared-ground line used by the Scribe
        // prompt's pairwise block.
        function sxMatchDetail(kind, x) {
            if ("strong" === kind) return `Combined match ${Math.round(x.score)}%. Matched direction: ${x.route ? _d(x.route, !0) : "recorded both ways"}. ${ld(x.id, x.ids[0], x.ids[1])}${dd(x.markers)}`;
            if ("curious" === kind) return `Combined match ${Math.round(x.score)}%. Curious about — discuss before deciding, with an easy opt-out. ${ld(x.id, x.ids[0], x.ids[1])} Preferred possible route: ${x.route ? _d(x.route, !0) : "recorded both ways"}.${dd(x.markers)}`;
            // Multi-pole pair detail (2026-11-16): the agreement is the
            // ruled per-pole comparison and the score is the Depth Factor
            // intensity (geometric mean of each member's strongest
            // stance). ld() names each member's pole stances through
            // the pole-aware ad(). The agreement is reported, never a
            // gate — what counts as a "match" for the matches/curious
            // lists is still an open ruling (see the multi-pole
            // follow-up); Scribe lists the shared stance either way.
            if ("pole-strong" === kind) return `Shared stance — agreement ${Math.round((x.agreement || 0) * 100)}%, Depth Factor intensity ${Math.round(x.score)}%. ${ld(x.id, x.ids[0], x.ids[1])}${dd(x.markers)}`;
            if ("pole-curious" === kind) return `Mild shared stance — agreement ${Math.round((x.agreement || 0) * 100)}%, Depth Factor intensity ${Math.round(x.score)}%. ${ld(x.id, x.ids[0], x.ids[1])} A mild stance is not a settled position.${dd(x.markers)}`;
            if ("group" === kind) return `Combined group match ${Math.round(x.score)}%. Matched directions: ${x.routes.map(e => _d(e, !0)).join("; ")}. ` + x.ids.map(id => `${rd(id)} — ${ad(ca(x.id, id), x.id) || "no positive direction recorded"}`).join("; ") + ".";
            return `${x.label} (${Math.round(x.score)}%${x.route ? `; ${_d(x.route, !0)}` : ""}) — ${ud(x.id, x.ids)}`;
        }
        function gdPairReport(e, t, sxSettings) {
                // Scribe's pair percentage comes from the sync engine v1.1:
                // the Play headline for play guides, the Conversation Kink
                // Factor for stories. No second formula survives here.
                const pair = sxPairByIds(e, t, sxSettings), story = "porn" === scribeMode, u = [], p = [];
                if (pair) pair.topics.forEach(rec => {
                    if ("invisible" === rec.outcome || "limit-blocked" === rec.outcome) return;
                    const x = qn[rec.id];
                    if (!x) return;
                    const route = rec.bestFit ? sxRouteRecord(rec.bestFit, rec.id) : null,
                        detail = route ? Qc(route, { give: rec.ratings.a.give, giveKnown: rec.ratings.a.giveKnown, receive: rec.ratings.a.receive, receiveKnown: rec.ratings.a.receiveKnown }, { give: rec.ratings.b.give, giveKnown: rec.ratings.b.giveKnown, receive: rec.ratings.b.receive, receiveKnown: rec.ratings.b.receiveKnown }, rd(e), rd(t), rec.id) : "";
                    2 === rec.flags.favoriteBy.length && ("match" === rec.outcome || "curious-fit" === rec.outcome) ? u.push({
                        id: rec.id,
                        label: x.label,
                        branch: x.branch,
                        score: rec.strength || 0,
                        detail: detail
                    }) : "curious-fit" === rec.outcome && p.push({
                        label: x.label,
                        score: rec.strength || 0,
                        detail: detail
                    });
                }), u.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label)), p.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label));
                return {
                    percent: pair ? (story ? pair.conversation.kinkFactor : pair.play.headline) || 0 : 0,
                    things: pair ? story ? pair.conversation.considered : pair.play.considered : 0,
                    clicks: pair ? pair.play.matches : 0,
                    limits: pair ? pair.coverage.limitBlocked : 0,
                    favorites: u,
                    conversation: p
                };
            }
        function gdStrongMatches(e, t, sxSettings) {
                // Established topics = sync engine v1.1 MATCH outcomes for
                // the pair (Conversation basis, so fantasy-marked topics
                // stay available to story mode; guides filter them later).
                // This is the OUTCOME-BASED pair established rule of
                // refactor F10: MATCH outcome only, no score filter —
                // deliberately unlike the threshold-based single-profile
                // rule documented at sxSingleProfileData.
                const i = [], pair = sxPairByIds(e, t, sxSettings);
                if (!pair) return i;
                pair.topics.forEach(rec => {
                    if ("match" !== rec.outcome || rec.poleRole) return;
                    const s = qn[rec.id];
                    if (!s) return;
                    const d = [ e, t ].filter(x => "favorite" === Oa(rec.id, x)).map(x => rd(x)), u = d.length > 0, p = cd(rec.id, [ e, t ]), l = rec.bestFit ? sxRouteRecord(rec.bestFit, rec.id) : null, c = rec.strength || 0;
                    i.push({
                        id: rec.id,
                        label: s.label,
                        branch: s.branch,
                        score: c,
                        kind: u ? "favorite" : "interest",
                        favorite: u,
                        ...p,
                        matchLabel: u ? `favorite for ${d.join(" + ")}` : "compatible intensity",
                        route: l,
                        detail: sxMatchDetail("strong", { id: rec.id, score: c, route: l, ids: [ e, t ], markers: p })
                    });
                });
                // Multi-pole topics (2026-11-16): the pair engine always
                // gives them outcome "not-topics" (no give/receive
                // flanks to route), so they never enter the MATCH branch
                // above. Established here means BOTH profiles hold a
                // strong stance (|strongest pole affinity| > 35, the
                // same 35 as the single-profile rule); the score is the
                // Depth Factor intensity (rec.poleIntensity × 100, the
                // ruled combined intensity). The agreement is reported
                // in the detail and does NOT gate inclusion — this does
                // not define a "match" threshold.
                pair.topics.forEach(rec => {
                    // Role topics stay in this detail list. A shared
                    // aversion, an opposed pair, or a don't-care is not
                    // enthusiasm, so those stay out. Strength is the
                    // stored relevance, not a pole magnitude. A line
                    // topic keeps the older strongest-stance test.
                    if (rec.poleRole) {
                        if (rec.sharedAversion || rec.relevanceOpposed || !(rec.poleIntensity > 0)) return;
                        if (!(rec.intensityA > 35) || !(rec.intensityB > 35)) return;
                    } else {
                        if (null == rec.agreement || "not-topics" !== rec.outcome) return;
                        const aStrong = sxStrongestPole(rec.id, e), bStrong = sxStrongestPole(rec.id, t);
                        if (null == aStrong || null == bStrong) return;
                        if (Math.abs(aStrong) <= 35 || Math.abs(bStrong) <= 35) return;
                    }
                    const s = qn[rec.id];
                    if (!s) return;
                    const c = (rec.poleIntensity || 0) * 100, p = cd(rec.id, [ e, t ]), fav = [ e, t ].filter(x => "favorite" === Oa(rec.id, x)).map(x => rd(x)), u = fav.length > 0;
                    i.push({
                        id: rec.id,
                        label: s.label,
                        branch: s.branch,
                        score: c,
                        kind: u ? "favorite" : "interest",
                        favorite: u,
                        ...p,
                        matchLabel: `shared stance, ${Math.round((rec.agreement || 0) * 100)}% agreement`,
                        agreement: rec.agreement,
                        poleIntensity: rec.poleIntensity,
                        detail: sxMatchDetail("pole-strong", { id: rec.id, score: c, agreement: rec.agreement, ids: [ e, t ], markers: p })
                    });
                });
                return i.sort((e, t) => ("favorite" === t.kind) - ("favorite" === e.kind) || t.score - e.score || e.label.localeCompare(t.label)), i;
            }
        function gdCuriousMatches(e, t, n, sxSettings) {
                // Curious topics = sync engine v1.1 CURIOUS FIT outcomes.
                const o = [], pair = sxPairByIds(e, t, sxSettings);
                if (!pair) return o;
                pair.topics.forEach(rec => {
                    if (n.has(rec.id) || rec.poleRole || "curious-fit" !== rec.outcome) return;
                    const d = qn[rec.id];
                    if (!d) return;
                    const y = [ e, t ].some(x => "favorite" === Oa(rec.id, x)), b = cd(rec.id, [ e, t ]), l = rec.bestFit ? sxRouteRecord(rec.bestFit, rec.id) : null, g = rec.strength || 0;
                    // Token efficiency: omit near-zero/low-signal curious matches unless favorite or fantasy-only
                    if (g <= 15 && !y && !b.fantasyOnly) return;
                    o.push({
                        id: rec.id,
                        label: d.label,
                        branch: d.branch,
                        score: g,
                        kind: "curious",
                        favorite: y,
                        ...b,
                        detail: sxMatchDetail("curious", { id: rec.id, score: g, route: l, ids: [ e, t ], markers: b })
                    });
                });
                // Multi-pole topics (2026-11-16): both rated but NOT
                // both strong (|strongest| > 35 for both) land here as
                // a mild shared stance, mirroring the single-profile
                // 16–35 curious band. The strong list above already
                // holds the both-strong ones (excluded via n), and the
                // both-strong guard below is belt-and-braces. Score is
                // the same Depth Factor intensity as the strong list.
                pair.topics.forEach(rec => {
                    if (n.has(rec.id)) return;
                    const y = [ e, t ].some(x => "favorite" === Oa(rec.id, x)), b = cd(rec.id, [ e, t ]);
                    if (rec.poleRole) {
                        if (rec.sharedAversion || rec.relevanceOpposed || !(rec.poleIntensity > 0)) return;
                        if (rec.intensityA > 35 && rec.intensityB > 35) return;
                        // Token efficiency: if both are near-zero (<= 15), omit unless favorite or fantasy-only
                        if (rec.intensityA <= 15 && rec.intensityB <= 15 && !y && !b.fantasyOnly) return;
                    } else {
                        if (null == rec.agreement || "not-topics" !== rec.outcome) return;
                        const aStrong = sxStrongestPole(rec.id, e), bStrong = sxStrongestPole(rec.id, t);
                        if (null == aStrong || null == bStrong) return;
                        if (Math.abs(aStrong) > 35 && Math.abs(bStrong) > 35) return;
                        // Token efficiency: if both are near-zero (<= 15), omit unless favorite or fantasy-only
                        if (Math.abs(aStrong) <= 15 && Math.abs(bStrong) <= 15 && !y && !b.fantasyOnly) return;
                    }
                    const d = qn[rec.id];
                    if (!d) return;
                    const g = (rec.poleIntensity || 0) * 100;
                    o.push({
                        id: rec.id,
                        label: d.label,
                        branch: d.branch,
                        score: g,
                        kind: "curious",
                        favorite: y,
                        ...b,
                        matchLabel: `mild shared stance, ${Math.round((rec.agreement || 0) * 100)}% agreement`,
                        agreement: rec.agreement,
                        poleIntensity: rec.poleIntensity,
                        detail: sxMatchDetail("pole-curious", { id: rec.id, score: g, agreement: rec.agreement, ids: [ e, t ], markers: b })
                    });
                });
                return o.sort((e, t) => Number(t.favorite) - Number(e.favorite) || t.score - e.score || e.label.localeCompare(t.label)), o;
            }
        function sxCastMatchData(e, t, sxSettings) {
            // Writers Phase 3 (F4): the retired leniency slot is gone.
            // The writers' list builders filter on sync-engine outcomes
            // alone and no leniency field is stored on the result object;
            // sxWriterLeniency survives only as the brief meta's displayed
            // cast value, never as an input to list building.
            if (!t) {
                const t = sxSingleProfileData(e), n = sxPhaseSplit(t.established, t.curious);
                return Object.assign({
                    mode: "single",
                    limits: t.limits
                }, n);
            }
            const i = gdPairReport(e, t, sxSettings), a = gdStrongMatches(e, t, sxSettings), r = gdCuriousMatches(e, t, new Set(a.map(e => e.id)), sxSettings), o = sxPhaseSplit(a, r);
            return Object.assign({
                mode: "pair",
                report: i,
                limits: i.limits
            }, o);
        }
        function sxMultiMatchData(e, sxSettings) {
            // Writers Phase 3 (F4): the retired leniency slot is gone
            // (see sxCastMatchData); it never affected any outcome and is
            // not stored on the result object.
            if (e.length < 2) return sxCastMatchData(e[0], null);
            if (2 === e.length) return sxCastMatchData(e[0], e[1], sxSettings);
            // Group topics come from the sync engine v1.1 group aggregation:
            // a topic is established when pairs with a MATCH outcome are a
            // strict majority of the relevant pairs, curious when MATCH or
            // CURIOUS FIT pairs are a strict majority.
            // sxSettings (Scene Setter only) carries the session's
            // per-profile Heat/Veil into the group compute; Scribe callers
            // pass nothing and keep the unheated default.
            const grp = sxGroupCompute(e.map(x => sxProfileById(x)), sxSettings ? {
                heat: e.map(x => sxSettings[x] ? sxSettings[x].heat : 0),
                veil: e.map(x => sxSettings[x] ? sxSettings[x].veil : 50)
            } : {}), i = [], a = [], r = (t, n, i) => sxMatchDetail("group", { id: t, routes: n, score: i, ids: e });
            let limits = 0;
            return grp.topics.forEach(rec => {
                if (rec.groupLimited) return void limits++;
                if ("match" !== rec.playOutcome && "curious-fit" !== rec.playOutcome) return;
                const s = qn[rec.id] || Xn(rec.id) || e.map(x => (at[x] || {})[rec.id]).find(Boolean);
                if (!s) return;
                const l = grp.pairs.map(pr => pr.topicsById[rec.id]).filter(pr => pr && pr.bestFit).map(pr => sxRouteRecord(pr.bestFit, rec.id)),
                    c = rec.strength || 0, d = e.filter(x => "favorite" === Oa(rec.id, x)).map(x => rd(x)), u = d.length > 0, p = cd(rec.id, e),
                    curious = "curious-fit" === rec.playOutcome, h = {
                        id: rec.id,
                        label: s.label,
                        branch: s.branch,
                        score: c,
                        kind: curious ? "curious" : u ? "favorite" : "interest",
                        favorite: u,
                        ...p,
                        matchLabel: curious ? null : u ? `favorite for ${d.join(" + ")}` : "coordinated intensity",
                        routes: l,
                        detail: r(rec.id, l, c) + dd(p)
                    };
                curious ? (h.detail = `Curious about, not Want to do: include only after an explicit check-in. ${h.detail}`, 
                a.push(h)) : i.push(h);
            }), i.sort((e, t) => ("favorite" === t.kind) - ("favorite" === e.kind) || t.score - e.score || e.label.localeCompare(t.label)), 
            a.sort((e, t) => Number(t.favorite) - Number(e.favorite) || t.score - e.score || e.label.localeCompare(t.label)), 
            Object.assign({
                mode: "group",
                limits: limits
            }, sxPhaseSplit(i, a));
        }
        function sxHardLimitLines(e) {
            const t = [];
            return h.forEach(n => {
                const i = catId(n.name);
                e.some(e => {
                    const t = Oa(i, e);
                    return "limit" === t || "notinterested" === t;
                }) && t.push(`${n.name} — entire branch`);
            }), Uc().forEach(n => {
                if (!e.some(e => ja(n, e))) return;
                const i = qn[n] || Xn(n);
                i && t.push(i.branch && i.label !== i.branch ? `${i.label} — ${i.branch}` : i.label);
            }), [ ...new Set(t) ].sort((e, t) => e.localeCompare(t));
        }
        function sxIndividualProfileTexts(e, t, n = {}) {
            const i = new Set(t.established.concat(t.curious).map(e => e.id)), a = new Set(Uc().filter(t => e.some(e => ja(t, e)))), r = new Set(n.excludeFantasy ? Uc().filter(t => e.some(e => Ha(t, e))) : []), isDisc = sxScribeIsDiscussion();
            return e.map(e => {
                const t = sxSingleProfileData(e), n = t.established.concat(t.curious).filter(e => !a.has(e.id) && !r.has(e.id)), o = n.filter(e => i.has(e.id)), s = n.filter(e => !i.has(e.id)), l = t => `${t.label} — ${ud(t.id, [ e ])} ${isDisc ? "STANCE DETAIL" : "SLIDER RATINGS AND ROLES"} — ${ad(ca(t.id, e), t.id) || t.kind}`;
                return [ `${rd(e)} — INDIVIDUAL PROFILE`, `- Within shared ground: ${o.map(l).join("; ") || "none recorded"}.`, `- Individual desires and differences: ${s.map(l).join("; ") || "none recorded"}.`, isDisc ? "- Use individual-only details for character texture, reactions, and dialogue—not as permission to add a position outside the authoritative shared ground." : "- Use individual-only details for character texture, reactions, dialogue, and negotiation—not as permission to add an activity outside the authoritative shared ground." ].join(" ");
            }).join("  ");
        }
        let sxNovelAiFields = null, scribeMode = "porn", scribeTarget = "grok", scribeCastKey = "", scribePromptCache = "", scribeLengthValue = "5", scribeLengthDisplay = "~5", scribeRequestText = "", scribeLengthUnit = "paragraphs", scribeDetailLevel = "balanced", scribeRigor = 4, scribeOperation = "cross";
        // Mode resolution (refactor F5), stated plainly: the target list
        // mixes outside-AI targets (novelai, yobitch, strictai) with
        // tones (suggestive, explicit); anything unrecognized falls back
        // to the general-AI target "grok". The NovelAI target always
        // writes a story, whatever the caller asked for; the YoBitch
        // target always writes a play guide; every other target follows
        // the caller's mode ("treatment" for a multi-profile cast,
        // "porn" for a single profile).
        function sxResolveScribeMode(target, callerMode) {
            const t = [ "novelai", "yobitch", "strictai", "suggestive", "explicit" ].includes(target) ? target : "grok";
            return {
                target: t,
                mode: "novelai" === t ? "porn" : "treatment" === callerMode ? "treatment" : "porn"
            };
        }
        // One lookup table for every target's dialog wording (refactor
        // F5), replacing the parallel nested-ternary chains that used to
        // live in the prompt builder and the dialog prep: displayName is
        // the Scribe brief's name for the target, shortName the dialog
        // prep's, storyMeta the brief meta's story label, and head /
        // title / intro / help / note produce the prep dialog's heading,
        // brief title, brief intro, prompt help, and the post-generation
        // availability note. Per-target strings are preserved verbatim.
        const sxScribeTargets = {
            novelai: {
                displayName: "NovelAI",
                shortName: "NovelAI",
                storyMeta: "NovelAI story",
                head: () => "NovelAI Create Novel fields.",
                title: () => "NovelAI erotic story",
                intro: () => "Separated into copy-ready NovelAI fields. The Prompt includes slider ratings plus Favorite, Limit, Not Interested, Fantasy-only, and Already Tried markers.",
                help: () => "Copy each generated field into the matching NovelAI Create Novel field.",
                note: () => "NovelAI story fields generated, including the target length."
            },
            yobitch: {
                displayName: "YoBitch",
                shortName: "YoBitch",
                storyMeta: "AI story",
                head: () => "YoBitch play-guide prompt, ready to download and upload into Muse.",
                title: () => "YoBitch play guide",
                intro: () => "Includes slider ratings, all five topic markers, overlap results, limits, safeword decisions, and aftercare needs. Download it for the full guide.",
                help: () => "Copy the full prompt below or download it as a text file, then give it to YoBitch in a Muse chat.",
                note: (story, single) => `YoBitch play-guide prompt generated from ${single ? "the loaded profile, including limits, safeword decisions, and aftercare needs" : "the selected profiles, overlap results, limits, safewords, and aftercare needs"}.`
            },
            strictai: {
                displayName: "Strict AI",
                shortName: "Strict AI",
                storyMeta: "Strict-AI story",
                head: () => "Toned-down prompt for Gemini, ChatGPT, or another strict AI, ready to download.",
                title: story => story ? "Suggestive story" : "Toned-down play guide",
                intro: () => "Uses suggestive, non-graphic language while preserving slider ratings, every topic marker, recorded boundaries, and roles.",
                help: () => "Copy the prompt below or download it, then give it to Gemini, ChatGPT, or another strict AI.",
                note: story => `Strict-AI ${story ? "story" : "play-guide"} prompt generated with suggestive, non-graphic language.`
            },
            suggestive: {
                displayName: "Suggestive",
                shortName: "Suggestive",
                storyMeta: "Suggestive story",
                head: () => "Suggestive prompt for a moderately strict AI, ready to download.",
                title: story => story ? "Suggestive story" : "Suggestive play guide",
                intro: () => "Uses sensual, non-graphic language while preserving slider ratings, every topic marker, recorded boundaries, and roles.",
                help: () => "Copy the prompt below or download it, then give it to a moderately strict AI such as Gemini, ChatGPT, or Claude.",
                note: story => `Suggestive ${story ? "story" : "play-guide"} prompt generated with sensual, non-graphic language.`
            },
            explicit: {
                displayName: "Explicit",
                shortName: "Explicit",
                storyMeta: "Explicit story",
                head: () => "Explicit prompt with a restrained tone, ready to download.",
                title: story => story ? "Explicit story" : "Explicit play guide",
                intro: () => "Uses restrained, explicit language while preserving slider ratings, every topic marker, recorded boundaries, and roles.",
                help: () => "Copy the full prompt below or download it as a text file, then give it to Grok, Claude, or another capable AI.",
                note: story => `Explicit ${story ? "story" : "play-guide"} prompt generated with restrained, explicit language.`
            },
            grok: {
                displayName: "General AI",
                shortName: "AI-agnostic",
                storyMeta: "AI story",
                head: story => sxScribeIsDiscussion() ? "AI-agnostic discussion prompt, ready to download and upload into Grok, Gemini, Claude, or another capable AI." : story ? "AI-agnostic story prompt, ready to download and upload into Grok, Gemini, Claude, or another capable AI." : "AI-agnostic play-guide prompt, ready to download.",
                title: story => sxScribeIsDiscussion() && story ? "Informed discussion" : story ? "Literotica-style story" : "Play guide",
                intro: (story, single) => sxScribeIsDiscussion() ? "Weighted from the recorded pole stances. Positions come only from the recorded stances; the discussion steelmans each side and follows the agreement where the profiles overlap." : story ? "Weighted from slider ratings and all five topic markers. Limits stay out; favorites lead; fantasy-only stays clearly imagined; already-tried becomes past experience." : single ? "Built from this profile’s slider ratings and all five topic markers. Limits and fantasy-only topics stay out of practical play." : "Built from compatible ratings, all five topic markers, and the filled negotiation checklist.",
                help: () => "Copy the full prompt below or download it as a text file, then give it to Grok, Gemini, Claude, or another capable AI.",
                note: (story, single) => sxScribeIsDiscussion() && story ? "AI-agnostic discussion prompt generated from the selected profile data." : story ? "AI-agnostic story prompt generated from the selected profile data." : `AI-agnostic play guide generated from ${single ? "the loaded profile" : "the current Group and negotiation checklist"}.`
            }
        };
        function sxScribeTargetInfo(target) {
            return sxScribeTargets[target] || sxScribeTargets.grok;
        }
        // One match-data computation per generation (refactor F8): the
        // dialog prep (counts) and the prompt build used to run the same
        // gd/md computation back to back with identical inputs; the
        // generate handler now computes it once and hands it to both.
        // Standalone callers (profile-save refresh) pass nothing and the
        // prep computes it itself, exactly as before.
        function sxScribeMatchData(ids, single) {
            if (single || ids.length < 2) return sxCastMatchData(ids[0], null);
            const op = scribeOperation || "cross";
            if ("minus" === op && typeof sxMinusMatchData === "function") return sxMinusMatchData(ids);
            if ("straight" === op && typeof sxStraightMatchData === "function") return sxStraightMatchData(ids);
            if ("full_arc" === op && typeof sxFullArcMatchData === "function") return sxFullArcMatchData(ids);
            return "novelai" === scribeTarget || ids.length > 2 ? sxMultiMatchData(ids) : sxCastMatchData(scribeLeadId, scribePartnerId);
        }
        // Established dominant/submissive pairings from recorded
        // direction scores, one entry per profile pair (extracted from
        // the prompt builder, refactor F1).
        function sxRoleDynamics(ids) {
            return Id(ids).map(([first, second]) => {
                const firstRole = Vc(first), secondRole = Vc(second), preferred = Xc(firstRole, secondRole);
                if (!preferred) return null;
                const dominantId = "firstGive" === preferred ? first : second, submissiveId = "firstGive" === preferred ? second : first;
                return {
                    firstRole: firstRole,
                    secondRole: secondRole,
                    preferred: preferred,
                    dominantId: dominantId,
                    submissiveId: submissiveId,
                    text: `${rd(dominantId)} is the established dominant and ${rd(submissiveId)} is the established submissive.`
                };
            }).filter(Boolean);
        }

        // One parameterized phase-section builder (refactor F2): the
        // Scribe and Scene Setter dialogs have identical phase controls
        // apart from the element-ID prefix (scribePhase* / setterPhase*)
        // and one header sentence, both passed in here.
        function sxPhaseSection(prefix, header) {
            const dur = {
                brief: "a short portion of the total length",
                standard: "a medium portion of the total length",
                extended: "a long portion of the total length",
                marathon: "the largest portion of the total length"
            }, val = id => String(e.byId(prefix + id)?.value || "").trim(), on = id => Boolean(e.byId(prefix + id)?.checked), rows = [];
            // Discussion phases (2026-11-16): on a vanilla skin the
            // Scribe dialog's phases are Opening / Development /
            // Closing (from the skin JSON's `scribe.phases` section),
            // not Warm-up / Main phase / Cool-down. The Scene Setter
            // ("setter" prefix) is skinned the same way (2026-11-16):
            // on a moderation skin its phases are Opening / Development
            // / Closing from the skin JSON's `sceneSetter.phases`
            // section; on Sexcapades it keeps the scene phases.
            const isDisc = ("scribe" === prefix && sxScribeIsDiscussion()) || ("setter" === prefix && sxSetterIsModeration()),
                spec = "setter" === prefix ? window.__SX_SETTER : window.__SX_SCRIBE,
                ph = isDisc && spec && spec.phases ? spec.phases : null,
                wLabel = ph && ph.warmup ? ph.warmup : "Warm-up",
                mLabel = ph && ph.main ? ph.main : "Main phase",
                cLabel = ph && ph.cooldown ? ph.cooldown : "Cool-down / aftercare",
                sectionHead = isDisc ? "DISCUSSION STRUCTURE" : "SCENE STRUCTURE";
            return on("PhaseWarmupOn") && rows.push(`- ${wLabel}: ${val("PhaseWarmupIntensity")} intensity, lasting ${dur[val("PhaseWarmupDuration")] || dur.standard} — ${isDisc ? "open the discussion, set out the positions, and frame the question before the main development." : "ease in, build anticipation, and set the tone before the main phase."}`),
            on("PhaseMainOn") && rows.push(`- ${mLabel}: ${val("PhaseMainIntensity")} intensity, lasting ${dur[val("PhaseMainDuration")] || dur.standard} — ${isDisc ? "the core of the discussion, carrying the strongest recorded stances." : "the core of the scene, carrying the strongest established interests."}`),
            on("PhaseCooldownOn") && rows.push(`- ${cLabel}: ${val("PhaseCooldownStyle")}, lasting ${dur[val("PhaseCooldownDuration")] || dur.standard} — ${isDisc ? "close by drawing the threads together." : "wind down gradually and close with care."}`),
            rows.length ? [ sectionHead, header, ...rows ].join("\n") : "";
        }
        function scribePhaseSection() {
            return sxPhaseSection("scribe", "Organize the output into the following phases, in this order, pacing each phase to its stated duration and transitioning clearly between phases:");
        }
        function setterPhaseSection() {
            return sxPhaseSection("setter", sxSetterIsModeration() ? "Organize the discussion plan into the following phases, in this order, pacing each phase to its stated duration and transitioning clearly between phases:" : "Organize the play guide into the following phases, in this order, pacing each phase to its stated duration and transitioning clearly between phases:");
        }
        // Phase toggle wiring shared by both dialogs (refactor F2):
        // the prefix selects the dialog ("scribe" or "setter"); each
        // phase's dependent selects stay disabled while its checkbox
        // is off.
        function sxWirePhaseToggles(prefix) {
            [ [ "PhaseWarmupOn", "PhaseWarmupIntensity", "PhaseWarmupDuration" ], [ "PhaseMainOn", "PhaseMainIntensity", "PhaseMainDuration" ], [ "PhaseCooldownOn", "PhaseCooldownStyle", "PhaseCooldownDuration" ] ].forEach(([t, ...n]) => {
                const i = e.byId(prefix + t), a = () => n.forEach(t => {
                    const n = e.byId(prefix + t);
                    n && (n.disabled = !i || !i.checked);
                });
                i && (i.addEventListener("change", a), a());
            });
        }
        function setterDetailsSection() {
            const t = String(e.byId("setterDetails")?.value || "").trim();
            return t ? [ "SCENE DETAILS — PROVIDED BY THE PARTICIPANTS", t, "Weave these details into the play guide wherever they fit the binding negotiation checklist above. If any part conflicts with a hard limit, a red topic, or another binding requirement, omit the conflicting part." ].join("\n") : "";
        }

        // On-screen brief rendering (writers refactor, Phase 1):
        // the brief meta line, the negotiation title and list, and
        // the four phase lists, split out of the prompt builder.
        // DOM writes only — the prompt text itself is assembled by
        // the composers and the finisher below.
        function sxRenderScribeBrief(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f, targetInfo, targetDisplayName: k } = ctx;
            const isDisc = sxScribeIsDiscussion();
            const estCountText = f && f.budgeted && f.totalEstablished > f.established.length
                ? `Top ${f.established.length} of ${f.totalEstablished} ${y}s`
                : `${f.established.length} ${y}${1 === f.established.length ? "" : "s"}`;
            const curCountText = f && f.budgeted && f.totalCurious > f.curious.length
                ? `Top ${f.curious.length} of ${f.totalCurious} curious`
                : `${f.curious.length} curious`;
            const opLabel = s ? "" : "full_arc" === scribeOperation ? "Full arc (⋈⊙⊖)" : "minus" === scribeOperation ? (o.length >= 3 ? "Polylectic (⊖)" : "Dialectic (⊖)") : "straight" === scribeOperation ? "Common ground (⊙)" : "Communion (⋈)";
            n(e.byId("sceneBriefMeta"), `<span>${Hi(b)}</span>${opLabel ? `<span>${Hi(opLabel)}</span>` : ""}<span>${u ? (isDisc ? "Informed discussion" : targetInfo.storyMeta) : `${k} play guide`}</span><span>Target ${Hi(scribeLengthValue)} ${unitWord(scribeLengthValue, scribeLengthUnit)} · ${Hi("detailed" === scribeDetailLevel ? "high detail" : "concise" === scribeDetailLevel ? "concise" : "balanced detail")}</span>${s ? "" : `<span>Cast ${sxWriterLeniency}</span>`}<span>${estCountText}</span><span>${curCountText}</span>${g.length ? `<span>${g.length} fantasy-only ${u ? "kept fictional" : "excluded"}</span>` : ""}${m.length ? `<span>${m.length} already tried</span>` : ""}<span>${f.limits} limit${1 === f.limits ? "" : "s"} excluded</span>`);
            const establishedLabels = f.established.map(e => e.label).join(" · ") || "None recorded", curiousLabels = f.curious.map(e => e.label).join(" · ") || "None recorded";
            e.byId("sceneNegotiationTitle").textContent = u ? (isDisc ? ("minus" === scribeOperation ? (o.length >= 3 ? "Polylectic debate ingredients" : "Dialectic debate ingredients") : "straight" === scribeOperation ? "Common ground ingredients" : "full_arc" === scribeOperation ? "Full arc ingredients (3 movements)" : "Discussion ingredients") : ("minus" === scribeOperation ? "Contrasting story ingredients" : "Story ingredients")) : "Negotiation notes";
            const roleDynamicItem = p.length ? `<li><strong>Established role dynamic</strong><span>${Hi(h)} Keep these dominant/submissive roles stable; do not suggest switching them.</span></li>` : "";
            if (u) n(e.byId("sceneNegotiation"), `<li><strong>Cast</strong><span>${Hi(s ? (isDisc ? d : d + " with an unnamed adult partner") : w)}</span></li>${roleDynamicItem}<li><strong>${isDisc ? "Established stances" : "Want to do"}</strong><span>${Hi(establishedLabels)}</span></li><li><strong>${isDisc ? "Curious stances" : "Curious about"}</strong><span>${Hi(curiousLabels)}</span></li>${g.length ? `<li><strong>Fantasy only</strong><span>${Hi(g.map(e => e.label).join(" · "))}. Keep these fictional; they do not signal real-world willingness.</span></li>` : ""}${m.length ? `<li><strong>Already tried</strong><span>${Hi(m.map(e => e.label).join(" · "))}. Past experience may shape the story without inventing details.</span></li>` : ""}`); else {
                const t = s ? `<li><strong>Source profile</strong><span>${Hi(d)} only. A partner’s preferences are not assumed.</span></li>` : `<li><strong>Group profiles</strong><span>${Hi(w)}</span></li>`;
                n(e.byId("sceneNegotiation"), `${t}${roleDynamicItem}<li><strong>Want to do</strong><span>${Hi(establishedLabels)}</span></li><li><strong>Curious about</strong><span>${Hi(curiousLabels)}</span></li>${g.length ? `<li><strong>Fantasy only — excluded</strong><span>${Hi(g.map(e => e.label).join(" · "))}. Do not schedule or suggest these in real-world play.</span></li>` : ""}${m.length ? `<li><strong>Already tried</strong><span>${Hi(m.map(e => e.label).join(" · "))}. Prior experience may inform pacing and check-ins.</span></li>` : ""}<li><strong>Before starting</strong><span>Confirm every named activity, actual intensity, pacing, roles, stop signals, and practical details. Curious about is not Want to do; ask explicitly before including it.</span></li>`);
            }
            const renderPhaseList = (listId, items, emptyText) => {
                const r = e.byId(listId);
                items.length ? n(r, items.map(e => `<li><strong>${Hi(function(e) {
                    const t = "curious" === e.kind ? (isDisc ? "Mild stance · " : "Curious about · ") : "favorite" === e.kind ? "Favorite · " : "", n = e.matchLabel ? ` · ${Math.round(e.score)}% ${e.matchLabel}` : "curious" === e.kind ? ` · ${isDisc ? "mild stance" : "curious"} ${Math.round(e.score)}` : ` · ${isDisc ? "stance" : "interest"} ${Math.round(e.score)}`;
                    return t + e.label + n;
                }(e))}</strong><span>${Hi(ed(e.detail))}</span></li>`).join("")) : n(r, `<li>${Hi(emptyText)}</li>`);
            };
            renderPhaseList("sceneWarmup", f.warmup, u ? (isDisc ? "Open with the positions." : "Open directly into the fantasy.") : "No separate warm-up item is recorded."), 
            renderPhaseList("sceneEscalation", f.escalation, u ? (isDisc ? "Develop the strongest stances." : "Escalate naturally from the listed interests.") : "No additional escalation or exploration item is recorded."), 
            renderPhaseList("scenePeak", f.peak, u ? (isDisc ? "Give the strongest stance the fullest treatment." : "Choose the strongest listed interest for the climax.") : "No established non-aftercare favorite or interest is recorded for a peak. Keep it open until agreed together."), 
            __sxClosestAction(e.one("#sceneAftercare"), "scenePhase").querySelector("h4").textContent = u ? "Closing" : "Aftercare", 
            renderPhaseList("sceneAftercare", u ? [] : f.aftercare, u ? (isDisc ? "Close by drawing the threads together." : "End with a satisfying erotic denouement after the climax.") : "No aftercare preference is recorded. Agree on aftercare before beginning.");
        }

        function sxBuildScribePrompt(precomputed) {
            if (!vt[scribeLeadId]) return;
            const requestedCastIds = scribeCastIds.filter(e => vt[e]), castIds = requestedCastIds.length ? requestedCastIds : [ scribeLeadId ], isSingle = 1 === castIds.length;
            // Missing gender/orientation is handled neutrally downstream
            // (unspecified wording, neutral pronouns): it no longer
            // blocks Scribe.
            const rawMatchData = precomputed || sxScribeMatchData(castIds, isSingle), leadName = rd(castIds[0]), isStory = "porn" === scribeMode, roleDynamics = isSingle ? [] : sxRoleDynamics(castIds), roleDynamicText = roleDynamics.map(e => e.text).join(" "), filteredMatchData = isStory ? rawMatchData : Object.assign({}, rawMatchData, {
                established: rawMatchData.established.filter(e => !e.fantasyOnly),
                curious: rawMatchData.curious.filter(e => !e.fantasyOnly),
                warmup: rawMatchData.warmup.filter(e => !e.fantasyOnly),
                escalation: rawMatchData.escalation.filter(e => !e.fantasyOnly),
                peak: rawMatchData.peak.filter(e => !e.fantasyOnly),
                aftercare: rawMatchData.aftercare.filter(e => !e.fantasyOnly)
            });
            const promptMatchData = sxBudgetPromptMatchData(filteredMatchData);
            const allowedPromptIds = new Set([ ...promptMatchData.established.map(e => e.id), ...promptMatchData.curious.map(e => e.id) ]);
            const fantasyTopics = [ ...rawMatchData.established, ...rawMatchData.curious ].filter(e => e.fantasyOnly && allowedPromptIds.has(e.id)), triedTopics = [ ...rawMatchData.established, ...rawMatchData.curious ].filter(e => e.alreadyTried && (isStory || !e.fantasyOnly) && allowedPromptIds.has(e.id));
            if (!(promptMatchData.established.length + promptMatchData.curious.length)) return e.byId("sceneAvailability").textContent = sxScribeIsDiscussion() ? "No strong or mild stances are recorded yet." : !isStory && fantasyTopics.length ? "Only fantasy-only topics are available. Add a real-world interest before creating a practical play guide." : "No favorites, positive interests, or curious ratings are available yet.",
            void (e.byId("sceneBrief").hidden = !0);
            const establishedKindLabel = isSingle ? "favorite / interest" : "compatible interest", castSummary = castIds.map(e => `${rd(e)} · ${vb(rt[e]) || "gender unspecified"} · ${Nb(ot[e]) || "orientation unspecified"}`).join(" + "), castNames = castIds.map(e => rd(e)), castNameList = castNames.length < 2 ? castNames[0] : 2 === castNames.length ? castNames.join(" and ") : `${castNames.slice(0, -1).join(", ")}, and ${castNames[castNames.length - 1]}`, targetInfo = sxScribeTargetInfo(scribeTarget), targetDisplayName = targetInfo.displayName;
            const promptCtx = { castIds, isSingle, isStory, leadName, castNames, castNameList, castSummary, establishedKindLabel, targetInfo, targetDisplayName, roleDynamics, roleDynamicText, fantasyTopics, triedTopics, promptMatchData, sections: null };
            sxRenderScribeBrief(promptCtx);
            promptCtx.sections = sxScribeSharedSections(castIds, isSingle, isStory, roleDynamics, promptMatchData, fantasyTopics, triedTopics);
            const composedPrompt = isStory ? (sxScribeIsDiscussion() ? sxComposeScribeDiscussion(promptCtx) : sxComposeScribeStory(promptCtx)) : sxComposeScribeGuide(promptCtx), finalPrompt = sxFinishScribePrompt(composedPrompt, promptCtx);
            scribePromptCache = finalPrompt, e.byId("scenePromptText").value = scribePromptCache, e.byId("sceneAvailability").textContent = targetInfo.note(isStory, isSingle), 
            e.byId("sceneDownloadStatus").textContent = "", e.byId("copyScenePrompt").textContent = "Copy", 
            e.byId("sceneBrief").hidden = !1;
        }
        // Scribe dialog prep counts (refactor F8): the count
        // computation, split out of the dialog prep below. It reads
        // the generation's shared match data when the generate
        // handler supplies it, or computes the match data itself on
        // the standalone counts-only path (profile-save refresh while
        // the dialog is open). Pure computation: it returns the counts
        // and the availability line; it writes no dialog state.
        function sxScribeCounts(precomputed, ids, isSingle) {
            const l = precomputed || sxScribeMatchData(ids, isSingle), c = l.established.length, d = l.curious.length, u = ids.filter(e => od(e).length), p = c + d;
            const op = isSingle ? "cross" : (scribeOperation || "cross");
            const opName = op === "minus" ? (ids.length >= 3 ? "polylectic" : "dialectic") : op === "straight" ? "common ground" : op === "full_arc" ? "full-arc" : "communion";
            return {
                data: l,
                established: c,
                curious: d,
                missing: u,
                total: p,
                availability: p ? `${c} established ${1 === c ? "item" : "items"} and ${d} curious ${1 === d ? "topic" : "topics"} ready (${opName}), weighted by each person’s ratings.` : isSingle ? "Mark a topic Favorite, rate it above curious, or record a curious rating to build a scene brief." : "Add compatible positive or curious ratings to build a scene brief."
            };
        }
        // Scribe dialog prep (refactor F8): the heading, brief title,
        // brief intro, and prompt help come from the shared target table
        // (refactor F5) and are this function's dialog updates; the
        // counts come from sxScribeCounts() above, split out of the
        // dialog updates. The prompt-state reset happens only when
        // resetDraft is passed (the generate handler, which rebuilds
        // the prompt immediately after) — that ordering is
        // contractual; other callers refresh chrome/counts only.
        function sxPrepScribeDialog(precomputed, resetDraft) {
            if (!vt[scribeLeadId]) return;
            const t = scribeCastIds.filter(e => vt[e]), n = t.length ? t : [ scribeLeadId ], i = 1 === n.length, story = "porn" === scribeMode, info = sxScribeTargetInfo(scribeTarget);
            const headP = e.one("#scribeChoiceDialog .dialog-head p, #scribeDialog .dialog-head p");
            if (headP) headP.textContent = info.head(story);
            scribeCastKey = `${scribeLeadId || ""}|${i ? "single" : scribePartnerId || ""}`;
            if (e.byId("sceneBriefTitle")) e.byId("sceneBriefTitle").textContent = info.title(story);
            if (e.byId("sceneBriefIntro")) e.byId("sceneBriefIntro").textContent = info.intro(story, i);
            if (e.byId("scenePromptHelp")) e.byId("scenePromptHelp").textContent = info.help();

            // Operation Chooser (Spec Part 3):
            const opField = e.byId("scribeOperationField");
            if (opField) {
                if (i) {
                    opField.hidden = true;
                } else {
                    opField.hidden = false;
                    const minusLabel = e.byId("scribeOpMinusLabel");
                    if (minusLabel) {
                        minusLabel.textContent = n.length >= 3 ? "Polylectic (⊖)" : "Dialectic (⊖)";
                    }
                    const isDisc = sxScribeIsDiscussion();
                    const defaultOp = isDisc ? "full_arc" : "cross";
                    const checkedRadio = document.querySelector('input[name="scribeOperation"]:checked');
                    if (!checkedRadio) {
                        const targetRadio = e.byId(defaultOp === "full_arc" ? "scribeOpFullArc" : defaultOp === "minus" ? "scribeOpMinus" : defaultOp === "straight" ? "scribeOpStraight" : "scribeOpCross");
                        if (targetRadio) targetRadio.checked = true;
                        scribeOperation = defaultOp;
                    } else {
                        scribeOperation = checkedRadio.value;
                    }
                }
            }

            const counts = sxScribeCounts(precomputed, n, i);
            if (e.byId("sceneAvailability")) e.byId("sceneAvailability").textContent = counts.availability;
            if (e.byId("sceneBrief")) e.byId("sceneBrief").hidden = !0;
            // Draft ownership (writers refactor): the generated prompt
            // is cleared ONLY when the caller rebuilds it immediately
            // after (the generate handler, resetDraft). The
            // profile-save refresh path calls this prep to refresh
            // chrome and counts and must not wipe a draft it does
            // not rebuild.
            resetDraft && (scribePromptCache = "", e.byId("scenePromptText") && (e.byId("scenePromptText").value = ""));
            e.byId("sceneDownloadStatus").textContent = "";
        }
