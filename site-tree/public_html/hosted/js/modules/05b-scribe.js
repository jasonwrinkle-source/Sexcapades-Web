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
        // Stance-strength word for a pole affinity v in [-100, 100],
        // on the same 80-100 / 56-79 / 36-55 / 0-35 emphasis bands
        // Scribe uses for give/receive. A negative affinity is a stance
        // AGAINST the pole; 0 is a recorded don't-care.
        function sxPoleBand(v) {
            const a = Math.abs(Number(v) || 0);
            if (0 === a) return "don't care";
            const s = a > 79 ? "very strong" : a > 55 ? "strong" : a > 35 ? "moderate" : a > 20 ? "mild" : "slight";
            return (Number(v) || 0) < 0 ? s + ", against" : s;
        }
        // The absolute pole affinities (or the line scalar's absolute
        // value) for a multi-pole / line topic, from a ca() rating.
        // Null for a give/receive or single-slider topic, or when the
        // profile holds no pole/line rating on the topic.
        function sxPoleAffinities(topicId, rating) {
            const w = Ge(topicId);
            if (!w || !Array.isArray(w.keys) || w.single) return null;
            if (1 === w.keys.length && "line" === w.keys[0]) return rating.lineKnown ? [ Math.abs(Number(rating.line) || 0) ] : null;
            const poleKeys = w.keys.filter(k => "give" !== k && "receive" !== k);
            if (!poleKeys.length) return null;
            const vals = poleKeys.filter(k => rating[k + "Known"]).map(k => Math.abs(Number(rating[k]) || 0));
            return vals.length ? vals : null;
        }
        // The strongest stance a profile holds on a multi-pole / line
        // topic: the signed pole affinity with the largest absolute
        // value, or the line scalar. Null when the profile holds no
        // pole/line rating there. Built from ca() + the widget config,
        // so it works wherever a pair record's reduced ratings cannot
        // carry the pole vector.
        function sxStrongestPole(topicId, profileId) {
            const w = Ge(topicId), s = ca(topicId, profileId);
            if (!w || !Array.isArray(w.keys) || w.single) return null;
            if (1 === w.keys.length && "line" === w.keys[0]) return s.lineKnown ? Number(s.line) || 0 : null;
            const poleKeys = w.keys.filter(k => "give" !== k && "receive" !== k);
            if (!poleKeys.length) return null;
            let best = null;
            poleKeys.forEach(k => {
                if (!s[k + "Known"]) return;
                const v = Number(s[k]) || 0;
                if (null == best || Math.abs(v) > Math.abs(best)) best = v;
            });
            return best;
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
        function ad(e, t = "") {
            const n = Ge(t), i = [];
            // Pole/line topic: the rating is a per-pole affinity vector
            // (or a line scalar), not give/receive. Name each recorded
            // pole with its value and strength; a 0 is a rating (don't
            // care). Flanked give/receive topics carry keys give/receive
            // and fall through to the give/receive branch below.
            if (n && Array.isArray(n.keys) && !n.single) {
                const keys = n.keys;
                if (1 === keys.length && "line" === keys[0] && e.lineKnown) {
                    i.push(`${(n.labels && n.labels[0]) || "Line"} ${Math.round(e.line)} (${sxPoleBand(e.line)})`);
                    return i.join(" · ");
                }
                const poleKeys = keys.filter(k => "give" !== k && "receive" !== k);
                if (poleKeys.length && poleKeys.some(k => e[k + "Known"])) {
                    poleKeys.forEach(k => {
                        if (!e[k + "Known"]) return;
                        const v = Number(e[k]) || 0;
                        const label = (n.labels && n.labels[keys.indexOf(k)]) || k;
                        i.push(`${label} ${Math.round(v)} (${sxPoleBand(v)})`);
                    });
                    return i.join(" · ");
                }
            }
            return e.giveKnown && e.give >= 0 && i.push(`${n.labels[0]} ${Math.round(e.give)} (${id(e.give)})`), 
            !n.single && e.receiveKnown && e.receive >= 0 && i.push(`${n.labels[1]} ${Math.round(e.receive)} (${id(e.receive)})`), 
            i.join(" · ");
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
                // Multi-pole / line topic (2026-11-16): the strongest pole
                // affinity (or the line scalar) joins the give/receive
                // ratings in the same 35 threshold — established when
                // |strongest| > 35, curious when 0 <= |strongest| <= 35,
                // score = the strongest affinity. A 0 is a rating, so an
                // all-zero vector lands in curious, not in "unrated".
                const s = ca(r, e), l = "favorite" === Qe[e]?.[r], pa = sxPoleAffinities(r, s), c = [ s.giveKnown && s.give > 35 ? s.give : null, s.receiveKnown && s.receive > 35 ? s.receive : null ].concat(pa ? pa.filter(v => v > 35) : []).filter(e => null !== e), d = [ s.giveKnown && s.give >= 0 && s.give <= 35 ? s.give : null, s.receiveKnown && s.receive >= 0 && s.receive <= 35 ? s.receive : null ].concat(pa ? pa.filter(v => v >= 0 && v <= 35) : []).filter(e => null !== e);
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
                // 0–35 curious band. The strong list above already
                // holds the both-strong ones (excluded via n), and the
                // both-strong guard below is belt-and-braces. Score is
                // the same Depth Factor intensity as the strong list.
                pair.topics.forEach(rec => {
                    if (n.has(rec.id)) return;
                    if (rec.poleRole) {
                        if (rec.sharedAversion || rec.relevanceOpposed || !(rec.poleIntensity > 0)) return;
                        if (rec.intensityA > 35 && rec.intensityB > 35) return;
                    } else {
                        if (null == rec.agreement || "not-topics" !== rec.outcome) return;
                        const aStrong = sxStrongestPole(rec.id, e), bStrong = sxStrongestPole(rec.id, t);
                        if (null == aStrong || null == bStrong) return;
                        if (Math.abs(aStrong) > 35 && Math.abs(bStrong) > 35) return;
                    }
                    const d = qn[rec.id];
                    if (!d) return;
                    const g = (rec.poleIntensity || 0) * 100, y = [ e, t ].some(x => "favorite" === Oa(rec.id, x)), b = cd(rec.id, [ e, t ]);
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
        let sxNovelAiFields = null, scribeMode = "porn", scribeTarget = "grok", scribeCastKey = "", scribePromptCache = "", scribeLengthValue = "5", scribeLengthDisplay = "~5", scribeRequestText = "", scribeLengthUnit = "paragraphs", scribeDetailLevel = "balanced", scribeRigor = 4;
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
            return "novelai" === scribeTarget || ids.length > 2 ? sxMultiMatchData(ids) : sxCastMatchData(scribeLeadId, single ? null : scribePartnerId);
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
        function Ad(e) {
            const t = String(scribeRequestText || "").trim();
            const kind = sxScribeIsDiscussion() ? "DISCUSSION" : e ? "STORY" : "PLAY-GUIDE";
            return t ? [ `USER’S ${kind} REQUEST — CREATIVE DIRECTION`, t, "Honor this request wherever it fits the selected hypermap data. If any part conflicts with a hard exclusion, recorded role, shared-ground boundary, consent rule, or other binding requirement below, omit the conflicting part and preserve the binding profile data." ].join("\n") : "";
        }
        function unitWord(e, t) {
            const n = {
                words: [ "word", "words" ],
                paragraphs: [ "paragraph", "paragraphs" ],
                pages: [ "page", "pages" ],
                minutes: [ "minute", "minutes" ],
                chapters: [ "chapter", "chapters" ]
            }[t] || [ "paragraph", "paragraphs" ];
            return "1" === String(e) ? n[0] : n[1];
        }
        // Effective target text: the user's target. A blank length
        // means the 5-paragraph default (value 5, unit paragraphs).
        function sxScribeTargetText() {
            return `${scribeLengthValue} ${unitWord(scribeLengthValue, scribeLengthUnit)}`;
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
        // Shared prompt sections for both Scribe composers (refactor
        // F1): the cast line and unnamed-partner line, the established /
        // curious splits, marker handling + rated preference detail, the
        // hard-excluded limits line, the role-dynamics block, the
        // authoritative full-group shared ground, the pairwise shared
        // ground, the combined group block, and the length/detail plan
        // lines — everything the story and guide composers share. Pure
        // text assembly from the match data; no DOM writes.
        function sxScribeSharedSections(o, s, u, p, f, g, m) {
            const A = o.map(e => `- ${function(e) {
                const t = bb(rt[e]), n = iv(ot[e]), i = rd(e), r = Kb(st[e], ", "), a = hp(e), l = String(pz[e] || "").trim();
                return `${i}: gender: ${t.length ? vb(t, " and ") : "unspecified"}; orientation: ${n.length ? Nb(n, " and ") : "unspecified"}${r ? `; roles: ${r}` : ""}. Pronouns for ${i}: ${a}. Do not infer anatomy from gender labels. Gender, orientation, and roles guide identity and partner-gender choices only.`;
            }(e)}`).join(" "), C = s ? `  UNNAMED PARTNER GENDER: - ${function(e) {
                const t = bb(rt[e]), n = iv(ot[e]), i = n.find(e => ![ "sapiosexual", "demisexual", "asexual", "questioning", "other", "private" ].includes(e)) || n[0], a = rd(e), r = t.some(e => [ "man", "trans-man", "intersex-man" ].includes(e)) && !t.some(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)), o = t.some(e => [ "woman", "trans-woman", "intersex-woman" ].includes(e)) && !t.some(e => [ "man", "trans-man", "intersex-man" ].includes(e)), s = Nb(n, " and "), l = [ n.includes("sapiosexual") ? "Treat intellectual connection as an important part of attraction." : "", n.includes("demisexual") && "demisexual" !== i ? "Do not invent attraction without a strong emotional bond." : "" ].filter(Boolean).join(" "), c = e => `${e}${l ? ` ${l}` : ""}`;
                if (!n.length) return c(`${a}’s orientation is unspecified. Choose an adult partner gender without inventing anatomy or unsupported relationship history.`);
                return "straight" === i || "heterosexual" === i ? c(r ? `Choose an adult woman as ${a}’s unnamed partner to fit ${a}’s ${s.toLowerCase()} identity.` : o ? `Choose an adult man as ${a}’s unnamed partner to fit ${a}’s ${s.toLowerCase()} identity.` : `Choose an adult partner configuration consistent with ${a}’s ${s.toLowerCase()} identity; this shared profile does not identify one person’s gender.`) : "lesbian" === i ? c(`Choose an adult woman as ${a}’s unnamed partner. Do not infer anatomy.`) : "gay" === i ? c(r ? `Choose an adult man as ${a}’s unnamed partner. Do not infer anatomy.` : o ? `Choose an adult woman as ${a}’s unnamed partner. Do not infer anatomy.` : `Choose an adult partner gender consistent with ${a}’s gay identity; the profile does not identify one person’s gender.`) : "heteroflexible" === i ? c(r ? `Prefer an adult woman as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s heteroflexible identity.` : o ? `Prefer an adult man as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s heteroflexible identity.` : `Choose an adult partner gender consistent with ${a}’s heteroflexible identity.`) : "homoflexible" === i ? c(r ? `Prefer an adult man as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s homoflexible identity.` : o ? `Prefer an adult woman as ${a}’s unnamed partner, while allowing another gender when the story deliberately reflects ${a}’s homoflexible identity.` : `Choose an adult partner gender consistent with ${a}’s homoflexible identity.`) : [ "bisexual", "pansexual", "queer", "fluid", "bicurious", "omnisexual" ].includes(i) ? c(`Choose an adult partner gender that fits ${a}’s ${s.toLowerCase()} identity; do not default automatically to an opposite-gender partner, and do not infer anatomy.`) : c("asexual" === i ? `${a} is asexual, which does not determine partner gender. Choose any adult partner gender only as the story needs, without inventing sexual-attraction assumptions.` : "demisexual" === i ? `${a} is demisexual, which does not determine partner gender. Choose any adult partner gender without inventing anatomy or unsupported relationship history.` : `${a}’s recorded sexuality (${s}) does not determine one partner gender. Choose an adult partner gender without contradicting that identity or inventing anatomy.`);
            }(scribeLeadId)}` : "", M = u ? f.established.filter(e => "Connection & aftercare" !== e.branch) : f.established, I = u ? f.curious.filter(e => "Connection & aftercare" !== e.branch) : f.curious, P = g.length ? u ? `- FANTASY ONLY: ${g.map(e => e.label).join(", ")}. These may appear only as clearly imagined fantasies; never treat them as real-world willingness or consent.` : `- ${g.length} fantasy-only ${1 === g.length ? "topic is" : "topics are"} omitted from this practical guide. Their names are intentionally absent from the prompt.` : "", L = m.length ? `- ALREADY TRIED: ${m.map(e => e.label).join(", ")}. Explicitly reference this as past experience without inventing details or assuming current consent.` : "";
            var T;
            const F = [ (T = u, [ "MARKER HANDLING — BINDING:", ...i, ...T ? a : r ].map(e => "MARKER HANDLING — BINDING:" === e ? e : `- ${e}`).join(" ")), P, L, M.concat(I).map(e => `- ${e.label}: ${ud(e.id, o)} SLIDER RATINGS AND ROLES — ${(u ? td : ed)(e.detail)}`).join(" ") ].filter(Boolean).join(" ") || "- none recorded", N = sxHardLimitLines(o).length, _ = N ? `- ${N} hard-excluded ${1 === N ? "topic is" : "topics are"} omitted from this prompt. Their names are intentionally absent.` : "- No hard-excluded topics are marked.", D = sxScribeIsDiscussion() ? "" : s ? "" : [ "ESTABLISHED ROLE DYNAMICS — INFERRED FROM RECORDED DIRECTION SCORES", p.length ? p.map(e => `- ${e.text}`).join(" ") : "- No clear complementary dominant/submissive pairing is established.", "- When a clear pairing is listed, keep those dominant/submissive roles stable throughout. Do not suggest, schedule, or narrate a role reversal; explicit per-activity give/receive directions still control who performs each named activity." ].join(" "), R = s ? "" : [ "AUTHORITATIVE FULL-GROUP SHARED GROUND — PRECOMPUTED", `- Scores computed by the sync comparison engine (v1.1).`, `- Established: ${M.map(e => `${e.label} (${Math.round(e.score)}%${e.route ? `; ${_d(e.route, !0)}` : e.routes ? `; ${e.routes.map(e => _d(e, !0)).join(" | ")}` : ""})`).join("; ") || "none"}.`, `- Curious: ${I.map(e => `${e.label} (${Math.round(e.score)}%${e.route ? `; ${_d(e.route, !0)}` : e.routes ? `; ${e.routes.map(e => _d(e, !0)).join(" | ")}` : ""})`).join("; ") || "none"}.`, "- This is the already-computed overlap for every selected profile. Treat it as authoritative. Do not calculate, infer, broaden, or recompute the intersection yourself.", sxScribeIsDiscussion() ? "- Positions may come only from this full-group shared ground. Pairwise and individual profiles add character texture and dynamics, not new positions." : "- Activities may come only from this full-group shared ground. Pairwise and individual profiles add character texture and dynamics, not new activity permission." ].join(" "), O = s ? "" : function(e, n = {}) {
                if (e.length < 3) return "";
                const i = new Set(Uc().filter(t => e.some(e => ja(t, e)))), a = new Set(n.excludeFantasy ? Uc().filter(t => e.some(e => Ha(t, e))) : []);
                return Id(e).map(([e, n]) => {
                    const r = sxCastMatchData(e, n), o = t => sxMatchDetail("pairwise", { ...t, ids: [ e, n ] }), s = r.established.filter(e => !i.has(e.id) && !a.has(e.id)).map(o).join("; ") || "none", l = r.curious.filter(e => !i.has(e.id) && !a.has(e.id)).map(o).join("; ") || "none";
                    return [ `PAIRWISE SHARED GROUND — ${rd(e)} + ${rd(n)}`, `- Precomputed overlap from the sync comparison engine (v1.1). Do not recalculate it.`, `- Established: ${s}.`, `- Curious: ${l}.`, "- This pairing profile may shape pair dynamics only within the authoritative full-group shared ground." ].join(" ");
                }).join("  ");
            }(o, {
                excludeFantasy: !u
            }), B = [ D, R, O, s ? "" : sxIndividualProfileTexts(o, f, {
                excludeFantasy: !u
            }) ].filter(Boolean).join("  "), j = unitWord(scribeLengthValue, scribeLengthUnit), z = "concise" === scribeDetailLevel ? "Keep the document concise: short phase notes and only essential check-ins." : "detailed" === scribeDetailLevel ? "Use high detail: specific phase timing, transitions, role cues, check-ins, stop options, and aftercare steps." : "Use balanced detail: enough timing, transitions, role cues, check-ins, and aftercare to follow without over-scripting.", q = !u ? `- Plan approximately ${scribeLengthValue} ${j}, with flexible phase pacing that adds up to that target while allowing check-ins, pauses, or stopping. ${z}` : `- Target approximately ${scribeLengthValue} ${j} of story text. Return only the finished story directly as plain text. ${z}`, H = [ "", `CAST, GENDER & SEXUALITY: ${A}${C}`, s ? "" : ` ${B}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `HARD-EXCLUDED LIMITS: ${_}` ];
            return { A: A, C: C, M: M, I: I, F: F, _: _, D: D, R: R, O: O, B: B, j: j, q: q, H: H };
        }
        // On-screen brief rendering (writers refactor, Phase 1):
        // the brief meta line, the negotiation title and list, and
        // the four phase lists, split out of the prompt builder.
        // DOM writes only — the prompt text itself is assembled by
        // the composers and the finisher below.
        function sxRenderScribeBrief(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f, targetInfo, targetDisplayName: k } = ctx;
            const isDisc = sxScribeIsDiscussion();
            n(e.byId("sceneBriefMeta"), `<span>${Hi(b)}</span><span>${u ? (isDisc ? "Informed discussion" : targetInfo.storyMeta) : `${k} play guide`}</span><span>Target ${Hi(scribeLengthValue)} ${unitWord(scribeLengthValue, scribeLengthUnit)} · ${Hi("detailed" === scribeDetailLevel ? "high detail" : "concise" === scribeDetailLevel ? "concise" : "balanced detail")}</span>${s ? "" : `<span>Cast ${sxWriterLeniency}</span>`}<span>${f.established.length} ${y}${1 === f.established.length ? "" : "s"}</span><span>${f.curious.length} curious</span>${g.length ? `<span>${g.length} fantasy-only ${u ? "kept fictional" : "excluded"}</span>` : ""}${m.length ? `<span>${m.length} already tried</span>` : ""}<span>${f.limits} limit${1 === f.limits ? "" : "s"} excluded</span>`);
            const establishedLabels = f.established.map(e => e.label).join(" · ") || "None recorded", curiousLabels = f.curious.map(e => e.label).join(" · ") || "None recorded";
            e.byId("sceneNegotiationTitle").textContent = u ? (isDisc ? "Discussion ingredients" : "Story ingredients") : "Negotiation notes";
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
        // Story composer (refactor F1): assembles the story-mode
        // prompt for the resolved target from the shared sections.
        // Top-level (writers refactor, Phase 1): the builder's
        // context object carries the assembled sections and
        // match data; the body is the former story branch,
        // unchanged.
        function sxComposeScribeStory(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f } = ctx, { A, C, M, I, F, _, D, R, O, B, j, q, H } = ctx.sections;
            // One story-ingredients line (writers refactor): the four
            // target branches below repeated this line verbatim; it is
            // built once here from the shared sections' lists, so the
            // wording and the empty-state text have a single owner.
            const sxStoryIngredients = `STORY INGREDIENTS: - Established: ${M.map(e => e.label).join("; ") || "none recorded"}. - Curious: ${I.map(e => e.label).join("; ") || "none recorded"}.`;
            let composedPromptText;
            const e = s ? `${d} with an unnamed adult partner` : w;
            composedPromptText = "novelai" === scribeTarget ? function(e, t = {}) {
                const n = String(t.names || "").trim(), i = String(t.dynamic || "").trim(), a = n.replace(/, and | and /g, " & "), r = [ Ad(!0), String(e || "").trim(), sxAboutBlock(o, v), sxTermsBlock(o, v, { flavor: !0 }), sxAgeBlock(o, v) ].filter(Boolean).join("\n\n");
                return sxNovelAiFields = {
                    genre: "Erotica",
                    title: a ? `${a}: Behind Closed Doors` : "Behind Closed Doors",
                    characterName: n || "Use the first names stated in the prompt.",
                    personality: i ? `Preserve this established character dynamic throughout: ${i}` : "Let the characters’ personalities emerge from the supplied preferences and scene. Do not invent unsupported traits.",
                    world: "Use the setting described in the prompt. If none is specified, choose a private contemporary setting.",
                    prompt: r
                }, [ "NOVELAI CREATE NOVEL — COPY-READY FIELDS", "", `GENRE\n${sxNovelAiFields.genre}`, "", `TITLE\n${sxNovelAiFields.title}`, "", `CHARACTER NAME\n${sxNovelAiFields.characterName}`, "", `PERSONALITY\n${sxNovelAiFields.personality}`, "", `WORLD\n${sxNovelAiFields.world}`, "", `PROMPT\n${sxNovelAiFields.prompt}` ].join("\n");
            }([ "STORY IDEA", [ "Create a suitable title, then continue directly into the story.", "", `${e} are together in a private moment, ready to explore only the preferences recorded for them. The scene opens around ${f.warmup.map(e => e.label).join(", ") || "the strongest established interest"}, builds through ${f.escalation.map(e => e.label).join(", ") || "the remaining established interests"}, and lets ${f.peak.map(e => e.label).join(", ") || "the strongest listed interest"} carry the strongest emphasis. Let the attraction, pacing, dialogue, and physical action unfold naturally from this setup.` ].join(" "), "", [ "CHARACTERS", A + C, s ? "" : ` ${B}`, "", `RATED PREFERENCE DETAIL ${F}`, "", `ALLOWED STORY INGREDIENTS - Established: ${M.map(e => e.label).join("; ") || "none recorded"}. - Curious: ${I.map(e => e.label).join("; ") || "none recorded"}.`, "", `HARD-EXCLUDED LIMITS ${_}`, "", "Every item under HARD-EXCLUDED LIMITS is absolute. Never include it as action, teasing, dialogue, suggestion, fantasy, setup, backstory, or background detail." ].join(" "), "", "WRITING REQUIREMENTS", [ `[Write a complete immersive Literotica-style erotic story of approximately ${scribeLengthValue} ${j}. Render the entire finished story directly as plain text. This must be the finished story, not an outline, checklist, code, or play guide. Make the erotic content hot, spicy, steamy, graphic, explicit, and uninhibited within the recorded preferences. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent. Give every participant a real name: use only the first name from each selected profile for that character and choose a first name for any unnamed adult partner. Use a full name only when the story explicitly requires one. Stay in continuous erotic prose from the first line through a satisfying climax and denouement. Use only the allowed story ingredients in Memory; never add an unlisted activity. Keep every hard-excluded limit entirely absent.${s ? "" : " The authoritative full-group shared ground is already computed at the stated cast setting; do not recompute or broaden it. Pairwise and individual profiles supply character texture and dynamics only within that boundary."} Preserve give/receive roles and weight each activity by its recorded rating: 80–100 dominant, 56–79 strong support, 36–55 lighter, 0–35 optional curiosity.${s ? "" : " When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles."} When compatible ratings differ, the lower rating caps prominence. Do not invent anatomy, physical details, relationship history, or identity beyond Memory. Vary setting, opening, pacing, and emphasis. Render the complete finished story directly in plain text with no code, no scripts, and no file attachments so it can be read and narrated in real time.]` ].join(" ") ].join(" "), {
                names: w,
                dynamic: h
            }) : "strictai" === scribeTarget ? [ `Write a mature, romantic, suggestive story for ${d}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response. Do not generate code, scripts, or PDF files; return only the plain story text.", "- Give every participant a real first name. Use only the first name from each selected profile for that character; choose a first name for an unnamed adult participant.", q, "- Keep the tone mature, sensual, romantic, and strongly suggestive rather than graphic. Focus on chemistry, anticipation, dialogue, emotion, atmosphere, power dynamics, consent, and aftermath.", "- Do not describe explicit anatomy, bodily fluids, penetration, or step-by-step sexual acts. Use discreet, non-graphic phrasing and fade to black whenever needed.", "- The supplied preference labels are private planning data. Translate them into tasteful, general language in the story rather than repeating graphic labels verbatim.", "- Use only the named topics below as boundaries for the fantasy. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Pairwise and individual profiles may shape character texture and dynamics only inside that boundary.", "- Treat curious items as optional and keep all roles consistent with the recorded give/receive directions.", "- Use ratings as emphasis: 80–100 central, 56–79 supporting, 36–55 light, and 0–35 optional curiosity. The lower compatible rating caps prominence.", "- Do not invent identity, anatomy, physical details, relationship history, or permissions beyond the supplied data.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open with attraction, anticipation, and a private moment.", td), "", nd("ESCALATION", f.escalation, "Build tension through dialogue, emotion, and suggestive action.", td), "", nd("CLIMAX", f.peak, "Bring the emotional and sensual tension to a satisfying peak without graphic detail.", td), "", "CLOSING: - Fade back in for a warm, satisfying denouement and aftercare." ].join(" ") : "suggestive" === scribeTarget ? [ `Write a mature, sensual, suggestive story for ${d}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response. Do not generate code, scripts, or PDF files; return only the plain story text.", "- Give every participant a real first name. Use only the first name from each selected profile for that character; choose a first name for an unnamed adult participant.", q, "- Keep the tone mature, sensual, and strongly suggestive without turning graphic. Describe chemistry, anticipation, touch, and desire in warm sensual detail, but do not describe explicit anatomy, bodily fluids, penetration, or step-by-step sexual acts. Use discreet phrasing and fade to black whenever an act would turn graphic.", "- The supplied preference labels are private planning data. Translate them into tasteful, sensual language in the story rather than repeating graphic labels verbatim.", "- Use only the named topics below as boundaries for the fantasy. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Pairwise and individual profiles may shape character texture and dynamics only inside that boundary.", "- Treat curious items as optional and keep all roles consistent with the recorded give/receive directions.", "- Use ratings as emphasis: 80–100 central, 56–79 supporting, 36–55 light, and 0–35 optional curiosity. The lower compatible rating caps prominence.", "- Do not invent identity, anatomy, physical details, relationship history, or permissions beyond the supplied data.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open with attraction, anticipation, and a private moment.", td), "", nd("ESCALATION", f.escalation, "Build tension through dialogue, emotion, and sensual action.", td), "", nd("CLIMAX", f.peak, "Bring the emotional and sensual tension to a satisfying peak without graphic detail.", td), "", "CLOSING: - Fade back in for a warm, satisfying denouement and aftercare." ].join(" ") : "explicit" === scribeTarget ? [ `Write an immersive, explicit erotic story for ${d} to enjoy, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response so it can be narrated in real time. Do not generate code, scripts, or PDF files; return only the plain story text.", "- Do not return an outline, checklist, programming code, or writing commentary.", '- Give every participant a real first name in the finished story. Use only the first name from each selected profile for that character; choose a first name for any additional unnamed participant. Use a full name only when the story explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', q, "- Write continuous erotic prose with a vivid setup, rising tension, sensory detail, spontaneous action, and a satisfying climax. This is a story, not instructions, a checklist, or a play guide.", "- Make the erotic content explicit and uninhibited in detail within the recorded preferences, keeping the tone elegant and restrained rather than raw. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent.", "- Stay in immersive fantasy prose from the first line through the final sentence.", "- Use only the named topics below. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Use pairwise shared ground and individual profiles only for character texture, reactions, dialogue, negotiation, and pair dynamics within that boundary.", "- Treat curious items as optional story ingredients.", "- Preserve every participant’s give/receive role and use each person’s recorded rating as narrative weight: 80–100 should dominate the story, 56–79 should be strong supporting material, 36–55 should appear more lightly, and 0–35 is optional curiosity. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles.", "- Do not flatten the list into equal-weight beats. When participants’ compatible ratings differ, the lower rating caps how prominent that shared beat should be.", "- Vary the scenario, setting, opening, pacing, and emphasis each time while staying inside this preference pool.", "- Do not invent identity details beyond the recorded profile data and unnamed-partner guidance; do not invent physical details, anatomy, or relationship facts.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open directly into the fantasy.", td), "", nd("ESCALATION", f.escalation, "Escalate naturally from the listed interests.", td), "", nd("CLIMAX", f.peak, "Choose the strongest listed interest for the climax.", td), "", "CLOSING: - End with a satisfying erotic denouement after the climax." ].join(" ") : [ `Write an immersive Literotica-style porn story for ${s ? `${d} to enjoy and masturbate to` : `${w} to enjoy`}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response so it can be narrated in real time. Do not generate code, scripts, or PDF files; return only the plain story text.", "- Do not return an outline, checklist, programming code, or writing commentary.", '- Give every participant a real first name in the finished story. Use only the first name from each selected profile for that character; choose a first name for any additional unnamed participant. Use a full name only when the story explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', q, "- Write continuous erotic prose with a vivid setup, rising tension, sensory detail, spontaneous action, and a satisfying climax. This is a story, not instructions, a checklist, or a play guide.", "- Make the erotic content hot, spicy, steamy, graphic, explicit, and uninhibited within the recorded preferences. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent.", "- Stay in immersive fantasy prose from the first line through the final sentence.", "- Use only the named topics below. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Use pairwise shared ground and individual profiles only for character texture, reactions, dialogue, negotiation, and pair dynamics within that boundary.", "- Treat curious items as optional story ingredients.", "- Preserve every participant’s give/receive role and use each person’s recorded rating as narrative weight: 80–100 should dominate the story, 56–79 should be strong supporting material, 36–55 should appear more lightly, and 0–35 is optional curiosity. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles.", "- Do not flatten the list into equal-weight beats. When participants’ compatible ratings differ, the lower rating caps how prominent that shared beat should be.", "- Vary the scenario, setting, opening, pacing, and emphasis each time while staying inside this preference pool.", "- Do not invent identity details beyond the recorded profile data and unnamed-partner guidance; do not invent physical details, anatomy, or relationship facts.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open directly into the fantasy.", td), "", nd("ESCALATION", f.escalation, "Escalate naturally from the listed interests.", td), "", nd("CLIMAX", f.peak, "Choose the strongest listed interest for the climax.", td), "", "CLOSING: - End with a satisfying erotic denouement after the climax." ].join(" ");
            return composedPromptText;
        }
        // Discussion composer (2026-11-16, Jason's ruling): on the
        // vanilla stance/belief maps Scribe writes an informed
        // discussion between the stances recorded on the map — or, for
        // a multi-profile cast, between the stances and the
        // commonalities of the bow-tie (Play/Commune) and circle-dot
        // (Conversation/Converse) profiles. It is NOT a story: no
        // Literotica framing, no erotic content, no give/receive roles,
        // no Scene Setter pointer. The per-skin prompt template
        // (opening, rules, rigor) comes from the skin JSON's
        // `scribe.prompt` section via window.__SX_SCRIBE. The Depth
        // slider (scribeRigor, 1-5) is the rigor knob: at 5 the
        // discussion is dissertation-defense standard.
        function sxComposeScribeDiscussion(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f } = ctx, { A, C, M, I, F, _, D, R, O, B, j, q, H } = ctx.sections;
            const spec = window.__SX_SCRIBE || null, pr = (spec && spec.prompt) || {};
            const opening = pr.opening || "Write an informed discussion between the stances recorded on this map.";
            const rawRules = Array.isArray(pr.rules) ? pr.rules : [];
            const rules = rawRules.map(r => r === "Do not invent positions, sources, or facts beyond the supplied data." ? "Explore the philosophical principles, practical rationale, trade-offs, and implications of each stance in depth, without introducing unlisted topics." : r);
            const rigor = pr.rigor || "";
            // The cast, by name only: gender, orientation, and
            // give/receive roles are Sexcapades data and have no meaning
            // for a stance map, so the shared cast line (A) is not used.
            const castLine = s ? `${d} (one profile)` : w;
            // The stance lists, with each topic's pole detail. The
            // detail strings are already pole-aware through ad(), and
            // the pair details already carry the agreement and the
            // Depth Factor intensity — so the score in parens is the
            // intensity and the detail states the agreement, with no
            // matchLabel to repeat it.
            const fmtStance = e => `- ${e.label} (${Math.round(e.score)}%): ${ed(e.detail)}`;
            const stanceDetail = [ `ESTABLISHED STANCES: ${M.map(fmtStance).join(" ") || "none recorded"}.`, `CURIOUS STANCES: ${I.map(fmtStance).join(" ") || "none recorded"}.` ].join(" ");
            // The shared ground for a multi-profile cast: the
            // authoritative overlap, stated as positions (not
            // activities). For a single profile there is no overlap.
            const sharedLine = s ? "" : [ "SHARED GROUND — THE COMMONALITIES", `- Established: ${M.map(e => `${e.label} (${Math.round(e.score)}%${null != e.agreement ? `; agreement ${Math.round(e.agreement * 100)}%` : ""})`).join("; ") || "none"}.`, `- Curious: ${I.map(e => `${e.label} (${Math.round(e.score)}%${null != e.agreement ? `; agreement ${Math.round(e.agreement * 100)}%` : ""})`).join("; ") || "none"}.`, "- This is the already-computed overlap for every selected profile. Treat it as authoritative. Do not calculate, infer, broaden, or recompute the intersection yourself.", "- Positions may come only from this shared ground. Pairwise and individual profiles add character texture and dynamics, not new positions." ].join(" ");
            // The rigor line: the Depth slider at 5 ("Dissertation
            // defense") turns the discussion into dissertation-defense
            // material. The length and detail knobs are carried by the
            // length line below; the JSON's rigor text names all three
            // because the slider is the depth/rigor control and the
            // length/detail lines already reflect the other two.
            const rigorLine = 5 === scribeRigor && rigor ? rigor : "";
            const estWords = "paragraphs" === scribeLengthUnit ? Math.round((Number(String(scribeLengthValue).match(/\d+/)?.[0]) || 5) * 150) : null;
            const lengthLine = `- Target approximately ${scribeLengthValue} ${j}${estWords ? ` (around ${estWords} words total; each paragraph must be a substantive, fully developed paragraph of multiple sentences, never a brief or one-sentence paragraph)` : ""} of discussion text. Return only the finished discussion directly as plain text. ${"concise" === scribeDetailLevel ? "Keep the discussion concise: short sections and only the essential arguments." : "detailed" === scribeDetailLevel ? "Use high detail: full arguments, objections, and replies." : "Use balanced detail: enough argument and reply to follow without over-writing."}`;
            return [
                opening,
                "",
                `CAST: ${castLine}`,
                "",
                `STANCE DETAIL: ${stanceDetail}`,
                "",
                `HARD-EXCLUDED LIMITS: ${_}`,
                "",
                "Rules:",
                ...rules.map(r => `- ${r}`),
                rigorLine ? `- ${rigorLine}` : "",
                lengthLine,
                "- Use only the named topics below as the positions in the discussion. Do not add, imply, or reference any unlisted stance.",
                "- Every marked Limit has been hard-excluded. Never reintroduce an excluded topic — not as a position, an objection, a suggestion, or background detail.",
                s ? "- Use the one profile as the source of stance detail." : "- Use the authoritative shared ground above as the position boundary. Do not calculate the intersection yourself. Pairwise and individual profiles may shape character texture and dynamics only inside that boundary.",
                "- Treat curious items as mild stances: include them as open questions, not settled positions.",
                "- Use each profile's recorded stance as emphasis: 80–100 central, 56–79 strong support, 36–55 light, and 0–35 optional curiosity. When two profiles disagree, give each side its strongest form before comparing them.",
                "- Explore the philosophical principles, practical rationale, trade-offs, and implications of each stance in depth.",
                sharedLine ? "" : "",
                sharedLine
            ].filter(e => "" !== e).join("\n\n");
        }
        // One phase-lines builder (writers refactor): the single and
        // group guide composers and the YoBitch rebuild below repeated
        // the same four nd() phase lines, differing only in the
        // aftercare line's label and empty-state text, which stay
        // parameters. Callers join the returned lines with "  ", the
        // separator both the ""-separated guide arrays and the
        // YoBitch array produced when joined.
        function sxGuidePhaseLines(f, aftercareLabel, aftercareEmpty) {
            return [ nd("WARM-UP", f.warmup, "No separate warm-up item is specified."), nd("ESCALATION", f.escalation, "No additional escalation or exploration item is specified."), nd("PEAK", f.peak, "No established non-aftercare peak is specified; keep it open until agreed together."), nd(aftercareLabel, f.aftercare, aftercareEmpty) ];
        }
        // Guide composer (refactor F1): assembles the play-guide
        // prompt (single-profile scene treatment or group guide)
        // from the same shared sections; the body is the former
        // guide branch, unchanged.
        function sxComposeScribeGuide(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f } = ctx, { A, C, M, I, F, _, D, R, O, B, j, q, H } = ctx.sections;
            let composedPromptText;
            const e = [ s ? `- Source profile: ${d} only. Do not assume a partner shares these interests.` : `- Group profiles: ${w}.`, `- Want to do: ${f.established.map(e => e.label).join("; ") || "none recorded"}.`, `- Curious about: ${f.curious.map(e => e.label).join("; ") || "none recorded"}.`, "- Curious about is not Want to do. Ask explicitly and make declining or stopping easy.", "- Confirm actual intensity, pacing, roles, stop signals, and practical details together before starting." ];
            if (s) composedPromptText = [ `Write a practical, coordination-focused scene treatment for ${d} and an unnamed adult partner from the structured brief below.`, "", `CAST, GENDER & SEXUALITY: ${A}${C}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `HARD-EXCLUDED LIMITS: ${_}`, "", "Rules:", "- Render the complete finished scene treatment and play guide in the chat as plain text with a suitable title so it can be narrated in real time. Do not generate code, scripts, or PDF files; return only the plain text.", q, '- Give every participant a real first name in the finished scene treatment and play guide. Use only the first name from each selected profile for that participant; choose a first name for any additional unnamed participant. Use a full name only when the story or guide explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', `- Make phase timing serve the requested ${scribeLengthValue} ${j}; keep the pace flexible enough for check-ins, pauses, or stopping.`, "- Use a sequence people can follow together, with roles, dialogue cues, consent check-ins, transitions, and clear pause or stop options—not a piece of erotic fiction.", "- Use only the named topics in this brief. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity in any form.", "- Use the one profile as the source of character and preference detail.", "- Treat [CURIOUS ABOUT] items as tentative invitations: include a specific consent check and an easy opt-out before each one.", "- Preserve each participant’s recorded give/receive roles exactly as written. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use each person’s recorded rating to set emphasis and pacing: 80–100 is a central priority, 56–79 is strong supporting material, 36–55 is lighter, and 0–35 remains tentative. When two people differ, the lower compatible rating sets the ceiling until they explicitly agree otherwise.", "- Build from lower recorded interest toward established favorites or stronger interests, while keeping physical intensity adjustable through explicit check-ins. Ratings measure interest, not safe force or duration.", "- Do not invent preferences, permissions, identity details beyond the recorded profile data and unnamed-partner guidance, physical details, anatomy, or relationship facts.", "", `NEGOTIATION NOTES: ${e.join(" ")}`, "", sxGuidePhaseLines(f, "AFTERCARE", "No aftercare preference is recorded; define aftercare before the scene.").join("  ") ].join(" "); else {
                const e = Iu(o, {
                    hideExcludedNames: !0,
                    excludeFantasy: !0
                });
                composedPromptText = [ `Create a practical, coordination-focused scene treatment and play guide for ${w}. Randomize the sequence and details for variety while staying inside the supplied data and every negotiation constraint.`, "", `CAST, GENDER & SEXUALITY: ${A}`, "", "AI INSTRUCTIONS — THE NEGOTIATION CHECKLIST IS BINDING:", "- Use PLAY GUIDE DATA as source material and inspiration, but use NEGOTIATION CHECKLIST DATA as the controlling safety and consent layer.", "- Keep every hard limit completely out of the guide. Never reintroduce it as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", "- Treat every red topic as a no for that participant. A DISCUSS FIRST green/red clash is not consent: frame it as an explicit conversation and opt-in decision, never as assumed or scheduled play.", "- Incorporate the filled-in safewords, pause language, and nonverbal stop signals naturally in the briefing, check-ins, and stop options.", "- Build the aftercare section from every participant’s stated aftercare needs. If a safeword or aftercare field is blank, insert a clear decision point before play instead of inventing an answer.", "- If the user replaces PLAY GUIDE DATA with an existing guide, revise and randomize that guide under the same binding checklist rather than preserving any conflict.", "- Render the complete finished guide in the chat as plain text with a suitable title so it can be narrated in real time. Do not generate code, scripts, or PDF files; return only the plain text.", q, '- Give every participant a real first name. Use only the first name from each selected profile. Use a full name only when the story or guide explicitly requires one. Never use generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner" unless a profile is explicitly anonymous.', `- Make phase timing serve the requested ${scribeLengthValue} ${j}; keep the pace flexible enough for check-ins, pauses, or stopping.`, "- Use a sequence people can follow together, with roles, dialogue cues, consent check-ins, transitions, and clear pause or stop options—not erotic fiction.", "- Use only the named topics in PLAY GUIDE DATA. Use the authoritative full-group profile as the activity boundary; do not calculate, infer, broaden, or recompute the intersection.", "- Pairwise shared ground and individual profiles may shape character, reactions, negotiation, and pair dynamics only within the authoritative full-group shared ground.", "- Treat [CURIOUS ABOUT] items as tentative invitations: include a specific consent check and an easy opt-out before each one.", "- Preserve each participant’s recorded give/receive roles exactly as written. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use each person’s recorded rating to set emphasis and pacing: 80–100 is a central priority, 56–79 is strong support, 36–55 is lighter, and 0–35 remains tentative. The lower compatible rating sets the ceiling until everyone explicitly agrees otherwise.", "- Build from lower recorded interest toward established favorites or stronger interests, while keeping physical intensity adjustable through explicit check-ins. Ratings measure interest, not safe force or duration.", "- Do not invent preferences, permissions, identity details, physical details, anatomy, or relationship facts.", "", [ "PLAY GUIDE DATA — SOURCE MATERIAL", B, "", `RATED PREFERENCE DETAIL: ${F}`, "", sxGuidePhaseLines(f, "AFTERCARE IDEAS FROM RATINGS", "No shared aftercare preference is recorded.").join("  ") ].join(" "), "", Lu(e, {
                    hideExcluded: !0,
                    hideTerms: "novelai" !== scribeTarget
                }), "", `HARD-EXCLUDED LIMITS — DUPLICATED FOR VISIBILITY: ${_}` ].join(" ");
            }
            return composedPromptText;
        }
        // Prompt finisher (writers refactor, Phase 1): applies the
        // target-specific guide wrappers (the strict-AI, suggestive,
        // and explicit prefixes, and the YoBitch rebuild), then the
        // shared appends in their shipped order — the user request
        // text, the phase section, and the terms / about / age
        // blocks — and finally the writer stamp. Returns the finished
        // prompt text; the builder performs the state writes.
        function sxFinishScribePrompt(promptText, ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f } = ctx, { A, C, M, I, F, _, D, R, O, B, j, q, H } = ctx.sections;
            if ("strictai" === scribeTarget && !u && (promptText = [ "SAFE FOR STRICT AI — TONED-DOWN PLAY GUIDE", "Keep the response practical, mature, consent-focused, and non-graphic. Avoid explicit anatomical detail, bodily-fluid descriptions, and step-by-step depictions of sexual acts. Refer to supplied activities discreetly and generally; fade to black or summarize transitions whenever needed. Preserve the useful sequence, roles, timing, boundaries, check-ins, stop options, and aftercare. If one detail cannot be described under these constraints, omit or neutralize that detail rather than refusing the entire guide.", "", promptText ].join(" ")), "suggestive" === scribeTarget && !u && (promptText = [ "SUGGESTIVE PLAY GUIDE — MODERATE AI", "Keep the response practical, mature, and consent-focused, using warm, sensual language for the activities. Avoid explicit anatomical detail, bodily-fluid descriptions, and step-by-step depictions of sexual acts. Preserve the useful sequence, roles, timing, boundaries, check-ins, stop options, and aftercare.", "", promptText ].join(" ")), "explicit" === scribeTarget && !u && (promptText = [ "EXPLICIT PLAY GUIDE — RESTRAINED TONE", "Keep the response practical, mature, and consent-focused with a restrained, elegant tone. Explicit anatomical and practical detail is allowed where the supplied data requires it. Preserve the useful sequence, roles, timing, boundaries, check-ins, stop options, and aftercare.", "", promptText ].join(" ")), 
            "yobitch" === scribeTarget) {
                const e = Iu(o, {
                    hideExcludedNames: !0,
                    excludeFantasy: !0
                });
                const seqLen = `a sequence of ${sxScribeTargetText()}`;
                promptText = [ "YO BITCH — WRITE THE FULL PLAY GUIDE NOW", "You are YoBitch, the user’s Muse personal AI. Write the complete, practical play guide directly in this chat. Do not return an outline, a prompt for another AI, or commentary about how to write it. Make the finished guide clear and naturally spoken, rendering it in the chat as you write so it can be voiced aloud in real time.", "", `CAST, GENDER & SEXUALITY: ${A}${C}`, "", `PROFILE DATA: ${sxIndividualProfileTexts(o, f, {
                    excludeFantasy: !0
                })}`, "", `OVERLAP / COMPARISON RESULTS: ${s ? "No overlap or comparison result is available because only one profile is selected. Do not infer a partner’s preferences or consent." : [ D, R, O ].filter(Boolean).join("  ")}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `PLAY GUIDE SOURCE: ${sxGuidePhaseLines(f, "AFTERCARE IDEAS FROM RATINGS", "No rated aftercare preference is recorded.").join("  ")}`, "", Lu(e, {
                    hideExcluded: !0,
                    hideTerms: "novelai" !== scribeTarget
                }), "", `HARD-EXCLUDED LIMITS — DUPLICATED FOR VISIBILITY: ${_}`, "", "REQUIREMENTS:", "- Treat the negotiation checklist as binding. Keep every hard limit completely out, and treat every red topic as a no for that person.", "- Use the supplied overlap/comparison results as authoritative. Do not infer, broaden, or recalculate shared consent.", `- Include a short pre-scene briefing, ${seqLen}, with phase timings that fill that length, roles, dialogue cues, transitions, consent check-ins, and clear pause or stop options.`, "- Work the recorded safewords, pause language, and nonverbal stop signals into the briefing and check-ins. If they are blank, add a visible decision point before play instead of inventing them.", "- Build the aftercare section from every participant’s stated or rated aftercare needs. If those fields are blank, add a visible decision point before play instead of inventing an answer.", "- Treat curious items as invitations to discuss and explicitly opt into, never as established consent.", "- Preserve every give/receive role and let the lower compatible rating cap prominence until everyone explicitly agrees otherwise. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use only the named activities in the supplied data. Do not invent preferences, permissions, identities, anatomy, physical details, or relationship history.", "- Use only first names for every participant. Use a full name only when the guide explicitly requires one.", "- Give the guide a suitable title and render the complete finished play guide in the chat as plain text, ready to voice aloud in real time. Do not generate code, scripts, or PDF files; return only the plain text.", q ].join(" ");
            }
            if ("novelai" !== scribeTarget) {
                const e = Ad(u);
                e && (promptText = [ e, "", promptText ].join("\n\n"));
            }
            const phaseSection = scribePhaseSection();
            phaseSection && (promptText = [ promptText, "", phaseSection ].join("\n"));
            if ("novelai" !== scribeTarget) {
                const sxT = sxTermsBlock(o, v, { flavor: !0 });
                sxT && (promptText = [ promptText, "", sxT ].join("\n"));
                const sxA = sxAboutBlock(o, v);
                sxA && (promptText = [ promptText, "", sxA ].join("\n"));
                const sxAge = sxAgeBlock(o, v);
                sxAge && (promptText = [ promptText, "", sxAge ].join("\n"));
            }
            // Closing length line (2026-11-17): restate the target at
            // the very end of the finished prompt, so the length is the
            // last instruction the model reads — the mid-prompt
            // "approximately" line alone was being ignored and the model
            // stopped early. NovelAI is skipped: its output is a
            // copy-ready field block, not a free prompt.
            if ("novelai" !== scribeTarget) {
                const kind = sxScribeIsDiscussion() ? "discussion" : u ? "story" : "guide";
                promptText = [ promptText, "", `LENGTH — FINAL CHECK: this ${kind} must run ${sxScribeTargetText()}. Do not stop early: if you reach what feels like a natural ending before that length, keep going — add ${"story" === kind ? "scenes, tension, and development" : "discussion" === kind ? "arguments, objections, and replies" : "phases, detail, and check-ins"} — until the full length is reached.` ].join("\n");
            }
            return [ sxWriterStamp(o), "", promptText ].join("\n");
        }
        function sxBuildScribePrompt(precomputed) {
            if (!vt[scribeLeadId]) return;
            const requestedCastIds = scribeCastIds.filter(e => vt[e]), castIds = requestedCastIds.length ? requestedCastIds : [ scribeLeadId ], isSingle = 1 === castIds.length;
            // Missing gender/orientation is handled neutrally downstream
            // (unspecified wording, neutral pronouns): it no longer
            // blocks Scribe.
            const rawMatchData = precomputed || sxScribeMatchData(castIds, isSingle), leadName = rd(castIds[0]), isStory = "porn" === scribeMode, roleDynamics = isSingle ? [] : sxRoleDynamics(castIds), roleDynamicText = roleDynamics.map(e => e.text).join(" "), fantasyTopics = [ ...rawMatchData.established, ...rawMatchData.curious ].filter(e => e.fantasyOnly), triedTopics = [ ...rawMatchData.established, ...rawMatchData.curious ].filter(e => e.alreadyTried && (isStory || !e.fantasyOnly)), promptMatchData = isStory ? rawMatchData : Object.assign({}, rawMatchData, {
                established: rawMatchData.established.filter(e => !e.fantasyOnly),
                curious: rawMatchData.curious.filter(e => !e.fantasyOnly),
                warmup: rawMatchData.warmup.filter(e => !e.fantasyOnly),
                escalation: rawMatchData.escalation.filter(e => !e.fantasyOnly),
                peak: rawMatchData.peak.filter(e => !e.fantasyOnly),
                aftercare: rawMatchData.aftercare.filter(e => !e.fantasyOnly)
            });
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
            return {
                data: l,
                established: c,
                curious: d,
                missing: u,
                total: p,
                availability: p ? `${c} established ${1 === c ? "item" : "items"} and ${d} curious ${1 === d ? "topic" : "topics"} ready, weighted by each person’s ratings.` : isSingle ? "Mark a topic Favorite, rate it above curious, or record a curious rating to build a scene brief." : "Add compatible positive or curious ratings to build a scene brief."
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
