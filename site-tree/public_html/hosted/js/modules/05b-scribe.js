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
        function ad(e, t = "") {
            const n = Ge(t), i = [];
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
        function sxAnonAvatarPhoto(e) {
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
            const t = [];
            return bb(rt[e]).length || t.push("gender"), iv(ot[e]).length || t.push("orientation"), 
            t;
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
            return Uc().forEach(r => {
                if (ja(r, e)) return void a++;
                const o = qn[r];
                if (!o) return;
                const s = ca(r, e), l = "favorite" === Qe[e]?.[r], c = [ s.giveKnown && s.give > 35 ? s.give : null, s.receiveKnown && s.receive > 35 ? s.receive : null ].filter(e => null !== e), d = [ s.giveKnown && s.give >= 0 && s.give <= 35 ? s.give : null, s.receiveKnown && s.receive >= 0 && s.receive <= 35 ? s.receive : null ].filter(e => null !== e);
                if (l || c.length) {
                    const i = c.length ? Math.max(...c) : 100, a = cd(r, e);
                    n.push({
                        id: r,
                        label: o.label,
                        branch: o.branch,
                        score: i,
                        kind: l ? "favorite" : "interest",
                        ...a,
                        detail: `${t}${l ? " marked this Favorite" : ""}${l && ad(s, r) ? " · " : l ? "" : " wants to do · "}${ad(s, r) || "confirm the roles before starting"}.${dd(a)}`
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
                        detail: `${n.fantasyOnly ? "Fictional fantasy only:" : "Curious about — discuss before deciding:"} ${t} recorded ${ad(s, r) || "no real-world willingness"}. ${n.fantasyOnly ? "Do not treat this as a practical activity." : "Curious about is not Want to do; ask explicitly and make opting out easy."}${dd(n)}`
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
                return pair.topics.forEach(rec => {
                    if ("match" !== rec.outcome) return;
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
                }), i.sort((e, t) => ("favorite" === t.kind) - ("favorite" === e.kind) || t.score - e.score || e.label.localeCompare(t.label)), i;
            }
        function gdCuriousMatches(e, t, n, sxSettings) {
                // Curious topics = sync engine v1.1 CURIOUS FIT outcomes.
                const o = [], pair = sxPairByIds(e, t, sxSettings);
                if (!pair) return o;
                return pair.topics.forEach(rec => {
                    if (n.has(rec.id) || "curious-fit" !== rec.outcome) return;
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
                }), o.sort((e, t) => Number(t.favorite) - Number(e.favorite) || t.score - e.score || e.label.localeCompare(t.label)), o;
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
            const i = new Set(t.established.concat(t.curious).map(e => e.id)), a = new Set(Uc().filter(t => e.some(e => ja(t, e)))), r = new Set(n.excludeFantasy ? Uc().filter(t => e.some(e => Ha(t, e))) : []);
            return e.map(e => {
                const t = sxSingleProfileData(e), n = t.established.concat(t.curious).filter(e => !a.has(e.id) && !r.has(e.id)), o = n.filter(e => i.has(e.id)), s = n.filter(e => !i.has(e.id)), l = t => `${t.label} — ${ud(t.id, [ e ])} SLIDER RATINGS AND ROLES — ${ad(ca(t.id, e), t.id) || t.kind}`;
                return [ `${rd(e)} — INDIVIDUAL PROFILE`, `- Within shared ground: ${o.map(l).join("; ") || "none recorded"}.`, `- Individual desires and differences: ${s.map(l).join("; ") || "none recorded"}.`, "- Use individual-only details for character texture, reactions, dialogue, and negotiation—not as permission to add an activity outside the authoritative shared ground." ].join(" ");
            }).join("  ");
        }
        let sxNovelAiFields = null, scribeMode = "porn", scribeTarget = "grok", scribeCastKey = "", scribePromptCache = "", scribeLengthValue = "1", scribeLengthDisplay = "~1", scribeRequestText = "", scribeLengthUnit = "pages", scribeDetailLevel = "balanced";
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
                note: () => "NovelAI story fields generated, including the target length and PDF output request."
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
                head: story => story ? "AI-agnostic story prompt, ready to download and upload into Grok, Gemini, Claude, or another capable AI." : "AI-agnostic play-guide prompt, ready to download.",
                title: story => story ? "Literotica-style story" : "Play guide",
                intro: (story, single) => story ? "Weighted from slider ratings and all five topic markers. Limits stay out; favorites lead; fantasy-only stays clearly imagined; already-tried becomes past experience." : single ? "Built from this profile’s slider ratings and all five topic markers. Limits and fantasy-only topics stay out of practical play." : "Built from compatible ratings, all five topic markers, and the filled negotiation checklist.",
                help: () => "Copy the full prompt below or download it as a text file, then give it to Grok, Gemini, Claude, or another capable AI.",
                note: (story, single) => story ? "AI-agnostic story prompt generated from the selected profile data." : `AI-agnostic play guide generated from ${single ? "the loaded profile" : "the current Group and negotiation checklist"}.`
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
            return t ? [ `USER’S ${e ? "STORY" : "PLAY-GUIDE"} REQUEST — CREATIVE DIRECTION`, t, "Honor this request wherever it fits the selected hypermap data. If any part conflicts with a hard exclusion, recorded role, shared-ground boundary, consent rule, or other binding requirement below, omit the conflicting part and preserve the binding profile data." ].join("\n") : "";
        }
        function unitWord(e, t) {
            const n = {
                words: [ "word", "words" ],
                paragraphs: [ "paragraph", "paragraphs" ],
                pages: [ "page", "pages" ],
                chapters: [ "chapter", "chapters" ]
            }[t] || [ "paragraph", "paragraphs" ];
            return "1" === String(e) ? n[0] : n[1];
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
            return on("PhaseWarmupOn") && rows.push(`- Warm-up: ${val("PhaseWarmupIntensity")} intensity, lasting ${dur[val("PhaseWarmupDuration")] || dur.standard} — ease in, build anticipation, and set the tone before the main phase.`),
            on("PhaseMainOn") && rows.push(`- Main phase: ${val("PhaseMainIntensity")} intensity, lasting ${dur[val("PhaseMainDuration")] || dur.standard} — the core of the scene, carrying the strongest established interests.`),
            on("PhaseCooldownOn") && rows.push(`- Cool-down / aftercare: ${val("PhaseCooldownStyle")}, lasting ${dur[val("PhaseCooldownDuration")] || dur.standard} — wind down gradually and close with care.`),
            rows.length ? [ "SCENE STRUCTURE", header, ...rows ].join("\n") : "";
        }
        function scribePhaseSection() {
            return sxPhaseSection("scribe", "Organize the output into the following phases, in this order, pacing each phase to its stated duration and transitioning clearly between phases:");
        }
        function setterPhaseSection() {
            return sxPhaseSection("setter", "Organize the play guide into the following phases, in this order, pacing each phase to its stated duration and transitioning clearly between phases:");
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
            const F = [ (T = u, [ "MARKER HANDLING — BINDING:", ...i, ...T ? a : r ].map(e => "MARKER HANDLING — BINDING:" === e ? e : `- ${e}`).join(" ")), P, L, M.concat(I).map(e => `- ${e.label}: ${ud(e.id, o)} SLIDER RATINGS AND ROLES — ${(u ? td : ed)(e.detail)}`).join(" ") ].filter(Boolean).join(" ") || "- none recorded", N = sxHardLimitLines(o).length, _ = N ? `- ${N} hard-excluded ${1 === N ? "topic is" : "topics are"} omitted from this prompt. Their names are intentionally absent.` : "- No hard-excluded topics are marked.", D = s ? "" : [ "ESTABLISHED ROLE DYNAMICS — INFERRED FROM RECORDED DIRECTION SCORES", p.length ? p.map(e => `- ${e.text}`).join(" ") : "- No clear complementary dominant/submissive pairing is established.", "- When a clear pairing is listed, keep those dominant/submissive roles stable throughout. Do not suggest, schedule, or narrate a role reversal; explicit per-activity give/receive directions still control who performs each named activity." ].join(" "), R = s ? "" : [ "AUTHORITATIVE FULL-GROUP SHARED GROUND — PRECOMPUTED", `- Scores computed by the sync comparison engine (v1.1).`, `- Established: ${M.map(e => `${e.label} (${Math.round(e.score)}%${e.route ? `; ${_d(e.route, !0)}` : e.routes ? `; ${e.routes.map(e => _d(e, !0)).join(" | ")}` : ""})`).join("; ") || "none"}.`, `- Curious: ${I.map(e => `${e.label} (${Math.round(e.score)}%${e.route ? `; ${_d(e.route, !0)}` : e.routes ? `; ${e.routes.map(e => _d(e, !0)).join(" | ")}` : ""})`).join("; ") || "none"}.`, "- This is the already-computed overlap for every selected profile. Treat it as authoritative. Do not calculate, infer, broaden, or recompute the intersection yourself.", "- Activities may come only from this full-group shared ground. Pairwise and individual profiles add character texture and dynamics, not new activity permission." ].join(" "), O = s ? "" : function(e, n = {}) {
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
            }) ].filter(Boolean).join("  "), j = unitWord(scribeLengthValue, scribeLengthUnit), z = "concise" === scribeDetailLevel ? "Keep the document concise: short phase notes and only essential check-ins." : "detailed" === scribeDetailLevel ? "Use high detail: specific phase timing, transitions, role cues, check-ins, stop options, and aftercare steps." : "Use balanced detail: enough timing, transitions, role cues, check-ins, and aftercare to follow without over-scripting.", q = !u ? `- Plan approximately ${scribeLengthValue} ${j}, with flexible phase pacing that adds up to that target while allowing check-ins, pauses, or stopping. ${z}` : `- Target approximately ${scribeLengthValue} ${j} in the downloadable PDF, using readable 11–12 pt body text and standard margins. Keep the complete chat text and PDF text identical. ${z}`, H = [ "", `CAST, GENDER & SEXUALITY: ${A}${C}`, s ? "" : ` ${B}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `HARD-EXCLUDED LIMITS: ${_}` ];
            return { A: A, C: C, M: M, I: I, F: F, _: _, D: D, R: R, O: O, B: B, j: j, q: q, H: H };
        }
        // On-screen brief rendering (writers refactor, Phase 1):
        // the brief meta line, the negotiation title and list, and
        // the four phase lists, split out of the prompt builder.
        // DOM writes only — the prompt text itself is assembled by
        // the composers and the finisher below.
        function sxRenderScribeBrief(ctx) {
            const { castIds: o, isSingle: s, isStory: u, leadName: d, castNames: v, castNameList: w, castSummary: b, establishedKindLabel: y, roleDynamics: p, roleDynamicText: h, fantasyTopics: g, triedTopics: m, promptMatchData: f, targetInfo, targetDisplayName: k } = ctx;
            n(e.byId("sceneBriefMeta"), `<span>${Hi(b)}</span><span>${u ? targetInfo.storyMeta : `${k} play guide`}</span><span>Target ${Hi(scribeLengthValue)} ${unitWord(scribeLengthValue, scribeLengthUnit)} · ${Hi("detailed" === scribeDetailLevel ? "high detail" : "concise" === scribeDetailLevel ? "concise" : "balanced detail")}</span>${s ? "" : `<span>Cast ${sxWriterLeniency}</span>`}<span>${f.established.length} ${y}${1 === f.established.length ? "" : "s"}</span><span>${f.curious.length} curious</span>${g.length ? `<span>${g.length} fantasy-only ${u ? "kept fictional" : "excluded"}</span>` : ""}${m.length ? `<span>${m.length} already tried</span>` : ""}<span>${f.limits} limit${1 === f.limits ? "" : "s"} excluded</span>`);
            const establishedLabels = f.established.map(e => e.label).join(" · ") || "None recorded", curiousLabels = f.curious.map(e => e.label).join(" · ") || "None recorded";
            e.byId("sceneNegotiationTitle").textContent = u ? "Story ingredients" : "Negotiation notes";
            const roleDynamicItem = p.length ? `<li><strong>Established role dynamic</strong><span>${Hi(h)} Keep these dominant/submissive roles stable; do not suggest switching them.</span></li>` : "";
            if (u) n(e.byId("sceneNegotiation"), `<li><strong>Cast</strong><span>${Hi(s ? d + " with an unnamed adult partner" : w)}</span></li>${roleDynamicItem}<li><strong>Want to do</strong><span>${Hi(establishedLabels)}</span></li><li><strong>Curious about</strong><span>${Hi(curiousLabels)}</span></li>${g.length ? `<li><strong>Fantasy only</strong><span>${Hi(g.map(e => e.label).join(" · "))}. Keep these fictional; they do not signal real-world willingness.</span></li>` : ""}${m.length ? `<li><strong>Already tried</strong><span>${Hi(m.map(e => e.label).join(" · "))}. Past experience may shape the story without inventing details.</span></li>` : ""}`); else {
                const t = s ? `<li><strong>Source profile</strong><span>${Hi(d)} only. A partner’s preferences are not assumed.</span></li>` : `<li><strong>Group profiles</strong><span>${Hi(w)}</span></li>`;
                n(e.byId("sceneNegotiation"), `${t}${roleDynamicItem}<li><strong>Want to do</strong><span>${Hi(establishedLabels)}</span></li><li><strong>Curious about</strong><span>${Hi(curiousLabels)}</span></li>${g.length ? `<li><strong>Fantasy only — excluded</strong><span>${Hi(g.map(e => e.label).join(" · "))}. Do not schedule or suggest these in real-world play.</span></li>` : ""}${m.length ? `<li><strong>Already tried</strong><span>${Hi(m.map(e => e.label).join(" · "))}. Prior experience may inform pacing and check-ins.</span></li>` : ""}<li><strong>Before starting</strong><span>Confirm every named activity, actual intensity, pacing, roles, stop signals, and practical details. Curious about is not Want to do; ask explicitly before including it.</span></li>`);
            }
            const renderPhaseList = (listId, items, emptyText) => {
                const r = e.byId(listId);
                items.length ? n(r, items.map(e => `<li><strong>${Hi(function(e) {
                    const t = "curious" === e.kind ? "Curious about · " : "favorite" === e.kind ? "Favorite · " : "", n = e.matchLabel ? ` · ${Math.round(e.score)}% ${e.matchLabel}` : "curious" === e.kind ? ` · curious ${Math.round(e.score)}` : ` · interest ${Math.round(e.score)}`;
                    return t + e.label + n;
                }(e))}</strong><span>${Hi(ed(e.detail))}</span></li>`).join("")) : n(r, `<li>${Hi(emptyText)}</li>`);
            };
            renderPhaseList("sceneWarmup", f.warmup, u ? "Open directly into the fantasy." : "No separate warm-up item is recorded."), 
            renderPhaseList("sceneEscalation", f.escalation, u ? "Escalate naturally from the listed interests." : "No additional escalation or exploration item is recorded."), 
            renderPhaseList("scenePeak", f.peak, u ? "Choose the strongest listed interest for the climax." : "No established non-aftercare favorite or interest is recorded for a peak. Keep it open until agreed together."), 
            __sxClosestAction(e.one("#sceneAftercare"), "scenePhase").querySelector("h4").textContent = u ? "Closing" : "Aftercare", 
            renderPhaseList("sceneAftercare", u ? [] : f.aftercare, u ? "End with a satisfying erotic denouement after the climax." : "No aftercare preference is recorded. Agree on aftercare before beginning.");
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
            }([ "STORY IDEA", [ "Create a suitable title, then continue directly into the story.", "", `${e} are together in a private moment, ready to explore only the preferences recorded for them. The scene opens around ${f.warmup.map(e => e.label).join(", ") || "the strongest established interest"}, builds through ${f.escalation.map(e => e.label).join(", ") || "the remaining established interests"}, and lets ${f.peak.map(e => e.label).join(", ") || "the strongest listed interest"} carry the strongest emphasis. Let the attraction, pacing, dialogue, and physical action unfold naturally from this setup.` ].join(" "), "", [ "CHARACTERS", A + C, s ? "" : ` ${B}`, "", `RATED PREFERENCE DETAIL ${F}`, "", `ALLOWED STORY INGREDIENTS - Established: ${M.map(e => e.label).join("; ") || "none recorded"}. - Curious: ${I.map(e => e.label).join("; ") || "none recorded"}.`, "", `HARD-EXCLUDED LIMITS ${_}`, "", "Every item under HARD-EXCLUDED LIMITS is absolute. Never include it as action, teasing, dialogue, suggestion, fantasy, setup, backstory, or background detail." ].join(" "), "", "WRITING REQUIREMENTS", [ `[Write a complete immersive Literotica-style erotic story of approximately ${scribeLengthValue} ${j} in the final downloadable PDF, using readable 11–12 pt body text and standard margins; render the same full text in chat. This must be the finished story, not an outline, checklist, or play guide. Make the erotic content hot, spicy, steamy, graphic, explicit, and uninhibited within the recorded preferences. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent. Give every participant a real name: use only the first name from each selected profile for that character and choose a first name for any unnamed adult partner. Use a full name only when the story explicitly requires one. Stay in continuous erotic prose from the first line through a satisfying climax and denouement. Use only the allowed story ingredients in Memory; never add an unlisted activity. Keep every hard-excluded limit entirely absent.${s ? "" : " The authoritative full-group shared ground is already computed at the stated cast setting; do not recompute or broaden it. Pairwise and individual profiles supply character texture and dynamics only within that boundary."} Preserve give/receive roles and weight each activity by its recorded rating: 80–100 dominant, 56–79 strong support, 36–55 lighter, 0–35 optional curiosity.${s ? "" : " When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles."} When compatible ratings differ, the lower rating caps prominence. Do not invent anatomy, physical details, relationship history, or identity beyond Memory. Vary setting, opening, pacing, and emphasis. Render the complete finished story in the response as you write it so it can be narrated in real time. Then automatically generate a downloadable PDF file containing exactly the same title and story text, suitable for attaching in Messenger, and clearly label the attachment “Download PDF.” Do not replace or shorten the rendered story when creating the PDF.]` ].join(" ") ].join(" "), {
                names: w,
                dynamic: h
            }) : "strictai" === scribeTarget ? [ `Write a mature, romantic, suggestive story for ${d}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response.", "- After the complete story appears in chat, generate a downloadable PDF containing exactly the same title and story text. Clearly label the attachment “Download PDF”.", "- Give every participant a real first name. Use only the first name from each selected profile for that character; choose a first name for an unnamed adult participant.", q, "- Keep the tone mature, sensual, romantic, and strongly suggestive rather than graphic. Focus on chemistry, anticipation, dialogue, emotion, atmosphere, power dynamics, consent, and aftermath.", "- Do not describe explicit anatomy, bodily fluids, penetration, or step-by-step sexual acts. Use discreet, non-graphic phrasing and fade to black whenever needed.", "- The supplied preference labels are private planning data. Translate them into tasteful, general language in the story rather than repeating graphic labels verbatim.", "- Use only the named topics below as boundaries for the fantasy. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Pairwise and individual profiles may shape character texture and dynamics only inside that boundary.", "- Treat curious items as optional and keep all roles consistent with the recorded give/receive directions.", "- Use ratings as emphasis: 80–100 central, 56–79 supporting, 36–55 light, and 0–35 optional curiosity. The lower compatible rating caps prominence.", "- Do not invent identity, anatomy, physical details, relationship history, or permissions beyond the supplied data.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open with attraction, anticipation, and a private moment.", td), "", nd("ESCALATION", f.escalation, "Build tension through dialogue, emotion, and suggestive action.", td), "", nd("CLIMAX", f.peak, "Bring the emotional and sensual tension to a satisfying peak without graphic detail.", td), "", "CLOSING: - Fade back in for a warm, satisfying denouement and aftercare." ].join(" ") : "suggestive" === scribeTarget ? [ `Write a mature, sensual, suggestive story for ${d}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response.", "- After the complete story appears in chat, generate a downloadable PDF containing exactly the same title and story text. Clearly label the attachment “Download PDF”.", "- Give every participant a real first name. Use only the first name from each selected profile for that character; choose a first name for an unnamed adult participant.", q, "- Keep the tone mature, sensual, and strongly suggestive without turning graphic. Describe chemistry, anticipation, touch, and desire in warm sensual detail, but do not describe explicit anatomy, bodily fluids, penetration, or step-by-step sexual acts. Use discreet phrasing and fade to black whenever an act would turn graphic.", "- The supplied preference labels are private planning data. Translate them into tasteful, sensual language in the story rather than repeating graphic labels verbatim.", "- Use only the named topics below as boundaries for the fantasy. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Pairwise and individual profiles may shape character texture and dynamics only inside that boundary.", "- Treat curious items as optional and keep all roles consistent with the recorded give/receive directions.", "- Use ratings as emphasis: 80–100 central, 56–79 supporting, 36–55 light, and 0–35 optional curiosity. The lower compatible rating caps prominence.", "- Do not invent identity, anatomy, physical details, relationship history, or permissions beyond the supplied data.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open with attraction, anticipation, and a private moment.", td), "", nd("ESCALATION", f.escalation, "Build tension through dialogue, emotion, and sensual action.", td), "", nd("CLIMAX", f.peak, "Bring the emotional and sensual tension to a satisfying peak without graphic detail.", td), "", "CLOSING: - Fade back in for a warm, satisfying denouement and aftercare." ].join(" ") : "explicit" === scribeTarget ? [ `Write an immersive, explicit erotic story for ${d} to enjoy, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response so it can be narrated in real time.", "- After the complete story appears in chat, automatically generate a downloadable PDF file containing exactly the same title and story text. Clearly label the attachment “Download PDF” so it can be shared in Messenger.", "- Do not replace, shorten, or summarize the rendered story when creating the PDF. Apart from the matching PDF attachment, do not return an outline, checklist, or writing commentary.", '- Give every participant a real first name in the finished story. Use only the first name from each selected profile for that character; choose a first name for any additional unnamed participant. Use a full name only when the story explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', q, "- Write continuous erotic prose with a vivid setup, rising tension, sensory detail, spontaneous action, and a satisfying climax. This is a story, not instructions, a checklist, or a play guide.", "- Make the erotic content explicit and uninhibited in detail within the recorded preferences, keeping the tone elegant and restrained rather than raw. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent.", "- Stay in immersive fantasy prose from the first line through the final sentence.", "- Use only the named topics below. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Use pairwise shared ground and individual profiles only for character texture, reactions, dialogue, negotiation, and pair dynamics within that boundary.", "- Treat curious items as optional story ingredients.", "- Preserve every participant’s give/receive role and use each person’s recorded rating as narrative weight: 80–100 should dominate the story, 56–79 should be strong supporting material, 36–55 should appear more lightly, and 0–35 is optional curiosity. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles.", "- Do not flatten the list into equal-weight beats. When participants’ compatible ratings differ, the lower rating caps how prominent that shared beat should be.", "- Vary the scenario, setting, opening, pacing, and emphasis each time while staying inside this preference pool.", "- Do not invent identity details beyond the recorded profile data and unnamed-partner guidance; do not invent physical details, anatomy, or relationship facts.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open directly into the fantasy.", td), "", nd("ESCALATION", f.escalation, "Escalate naturally from the listed interests.", td), "", nd("CLIMAX", f.peak, "Choose the strongest listed interest for the climax.", td), "", "CLOSING: - End with a satisfying erotic denouement after the climax." ].join(" ") : [ `Write an immersive Literotica-style porn story for ${s ? `${d} to enjoy and masturbate to` : `${w} to enjoy`}, featuring ${e}.`, ...H, "", "Rules:", "- Render the complete finished story, including a suitable title, as one regular plain-text chat response so it can be narrated in real time.", "- After the complete story appears in chat, automatically generate a downloadable PDF file containing exactly the same title and story text. Clearly label the attachment “Download PDF” so it can be shared in Messenger.", "- Do not replace, shorten, or summarize the rendered story when creating the PDF. Apart from the matching PDF attachment, do not return an outline, checklist, or writing commentary.", '- Give every participant a real first name in the finished story. Use only the first name from each selected profile for that character; choose a first name for any additional unnamed participant. Use a full name only when the story explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', q, "- Write continuous erotic prose with a vivid setup, rising tension, sensory detail, spontaneous action, and a satisfying climax. This is a story, not instructions, a checklist, or a play guide.", "- Make the erotic content hot, spicy, steamy, graphic, explicit, and uninhibited within the recorded preferences. Do not fade to black, cut away, or dodge explicit action with euphemisms; keep every hard-excluded limit entirely absent.", "- Stay in immersive fantasy prose from the first line through the final sentence.", "- Use only the named topics below. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity—not as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", s ? "- Use the one profile as the source of character and preference detail." : "- Use the authoritative full-group profile as the activity boundary. Do not calculate the intersection yourself. Use pairwise shared ground and individual profiles only for character texture, reactions, dialogue, negotiation, and pair dynamics within that boundary.", "- Treat curious items as optional story ingredients.", "- Preserve every participant’s give/receive role and use each person’s recorded rating as narrative weight: 80–100 should dominate the story, 56–79 should be strong supporting material, 36–55 should appear more lightly, and 0–35 is optional curiosity. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest or narrate switching those roles.", "- Do not flatten the list into equal-weight beats. When participants’ compatible ratings differ, the lower rating caps how prominent that shared beat should be.", "- Vary the scenario, setting, opening, pacing, and emphasis each time while staying inside this preference pool.", "- Do not invent identity details beyond the recorded profile data and unnamed-partner guidance; do not invent physical details, anatomy, or relationship facts.", "", sxStoryIngredients, "", nd("OPENING", f.warmup, "Open directly into the fantasy.", td), "", nd("ESCALATION", f.escalation, "Escalate naturally from the listed interests.", td), "", nd("CLIMAX", f.peak, "Choose the strongest listed interest for the climax.", td), "", "CLOSING: - End with a satisfying erotic denouement after the climax." ].join(" ");
            return composedPromptText;
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
            if (s) composedPromptText = [ `Write a practical, coordination-focused scene treatment for ${d} and an unnamed adult partner from the structured brief below.`, "", `CAST, GENDER & SEXUALITY: ${A}${C}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `HARD-EXCLUDED LIMITS: ${_}`, "", "Rules:", "- Render the complete finished scene treatment and play guide in the chat as plain text with a suitable title so it can be narrated in real time.", "- After the complete guide appears in chat, automatically generate a downloadable PDF file containing exactly the same title and guide text. Clearly label the attachment “Download PDF” so it can be shared in Messenger. Do not replace, shorten, or summarize the rendered guide when creating the PDF.", q, '- Give every participant a real first name in the finished scene treatment and play guide. Use only the first name from each selected profile for that participant; choose a first name for any additional unnamed participant. Use a full name only when the story or guide explicitly requires one. Never refer to a participant with generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner". Keep a participant anonymous only when that participant’s profile is explicitly marked anonymous.', `- Make phase timing serve the requested ${scribeLengthValue} ${j}; keep the pace flexible enough for check-ins, pauses, or stopping.`, "- Use a sequence people can follow together, with roles, dialogue cues, consent check-ins, transitions, and clear pause or stop options—not a piece of erotic fiction.", "- Use only the named topics in this brief. Do not add, imply, tease, or reference any unlisted activity.", "- Every marked Limit has been hard-excluded. Never reintroduce an excluded activity in any form.", "- Use the one profile as the source of character and preference detail.", "- Treat [CURIOUS ABOUT] items as tentative invitations: include a specific consent check and an easy opt-out before each one.", "- Preserve each participant’s recorded give/receive roles exactly as written. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use each person’s recorded rating to set emphasis and pacing: 80–100 is a central priority, 56–79 is strong supporting material, 36–55 is lighter, and 0–35 remains tentative. When two people differ, the lower compatible rating sets the ceiling until they explicitly agree otherwise.", "- Build from lower recorded interest toward established favorites or stronger interests, while keeping physical intensity adjustable through explicit check-ins. Ratings measure interest, not safe force or duration.", "- Do not invent preferences, permissions, identity details beyond the recorded profile data and unnamed-partner guidance, physical details, anatomy, or relationship facts.", "", `NEGOTIATION NOTES: ${e.join(" ")}`, "", sxGuidePhaseLines(f, "AFTERCARE", "No aftercare preference is recorded; define aftercare before the scene.").join("  ") ].join(" "); else {
                const e = Iu(o, {
                    hideExcludedNames: !0,
                    excludeFantasy: !0
                });
                composedPromptText = [ `Create a practical, coordination-focused scene treatment and play guide for ${w}. Randomize the sequence and details for variety while staying inside the supplied data and every negotiation constraint.`, "", `CAST, GENDER & SEXUALITY: ${A}`, "", "AI INSTRUCTIONS — THE NEGOTIATION CHECKLIST IS BINDING:", "- Use PLAY GUIDE DATA as source material and inspiration, but use NEGOTIATION CHECKLIST DATA as the controlling safety and consent layer.", "- Keep every hard limit completely out of the guide. Never reintroduce it as action, teasing, dialogue, suggestion, fantasy, setup, or background detail.", "- Treat every red topic as a no for that participant. A DISCUSS FIRST green/red clash is not consent: frame it as an explicit conversation and opt-in decision, never as assumed or scheduled play.", "- Incorporate the filled-in safewords, pause language, and nonverbal stop signals naturally in the briefing, check-ins, and stop options.", "- Build the aftercare section from every participant’s stated aftercare needs. If a safeword or aftercare field is blank, insert a clear decision point before play instead of inventing an answer.", "- If the user replaces PLAY GUIDE DATA with an existing guide, revise and randomize that guide under the same binding checklist rather than preserving any conflict.", "- Render the complete finished guide in the chat as plain text with a suitable title so it can be narrated in real time.", "- After the complete guide appears in chat, automatically generate a downloadable PDF file containing exactly the same title and guide text. Clearly label the attachment “Download PDF” so it can be shared in Messenger. Do not replace, shorten, or summarize the rendered guide when creating the PDF.", q, '- Give every participant a real first name. Use only the first name from each selected profile. Use a full name only when the story or guide explicitly requires one. Never use generic labels such as "the partner", "the one giving", "the one receiving", or "the other partner" unless a profile is explicitly anonymous.', `- Make phase timing serve the requested ${scribeLengthValue} ${j}; keep the pace flexible enough for check-ins, pauses, or stopping.`, "- Use a sequence people can follow together, with roles, dialogue cues, consent check-ins, transitions, and clear pause or stop options—not erotic fiction.", "- Use only the named topics in PLAY GUIDE DATA. Use the authoritative full-group profile as the activity boundary; do not calculate, infer, broaden, or recompute the intersection.", "- Pairwise shared ground and individual profiles may shape character, reactions, negotiation, and pair dynamics only within the authoritative full-group shared ground.", "- Treat [CURIOUS ABOUT] items as tentative invitations: include a specific consent check and an easy opt-out before each one.", "- Preserve each participant’s recorded give/receive roles exactly as written. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use each person’s recorded rating to set emphasis and pacing: 80–100 is a central priority, 56–79 is strong support, 36–55 is lighter, and 0–35 remains tentative. The lower compatible rating sets the ceiling until everyone explicitly agrees otherwise.", "- Build from lower recorded interest toward established favorites or stronger interests, while keeping physical intensity adjustable through explicit check-ins. Ratings measure interest, not safe force or duration.", "- Do not invent preferences, permissions, identity details, physical details, anatomy, or relationship facts.", "", [ "PLAY GUIDE DATA — SOURCE MATERIAL", B, "", `RATED PREFERENCE DETAIL: ${F}`, "", sxGuidePhaseLines(f, "AFTERCARE IDEAS FROM RATINGS", "No shared aftercare preference is recorded.").join("  ") ].join(" "), "", Lu(e, {
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
                promptText = [ "YO BITCH — WRITE THE FULL PLAY GUIDE NOW", "You are YoBitch, the user’s Muse personal AI. Write the complete, practical play guide directly in this chat. Do not return an outline, a prompt for another AI, or commentary about how to write it. Make the finished guide clear and naturally spoken, rendering it in the chat as you write so Grok can narrate it in real time.", "", `CAST, GENDER & SEXUALITY: ${A}${C}`, "", `PROFILE DATA: ${sxIndividualProfileTexts(o, f, {
                    excludeFantasy: !0
                })}`, "", `OVERLAP / COMPARISON RESULTS: ${s ? "No overlap or comparison result is available because only one profile is selected. Do not infer a partner’s preferences or consent." : [ D, R, O ].filter(Boolean).join("  ")}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `PLAY GUIDE SOURCE: ${sxGuidePhaseLines(f, "AFTERCARE IDEAS FROM RATINGS", "No rated aftercare preference is recorded.").join("  ")}`, "", Lu(e, {
                    hideExcluded: !0,
                    hideTerms: "novelai" !== scribeTarget
                }), "", `HARD-EXCLUDED LIMITS — DUPLICATED FOR VISIBILITY: ${_}`, "", "REQUIREMENTS:", "- Treat the negotiation checklist as binding. Keep every hard limit completely out, and treat every red topic as a no for that person.", "- Use the supplied overlap/comparison results as authoritative. Do not infer, broaden, or recalculate shared consent.", "- Include a short pre-scene briefing, an approximately 60-minute sequence with flexible phase timings, roles, dialogue cues, transitions, consent check-ins, and clear pause or stop options.", "- Work the recorded safewords, pause language, and nonverbal stop signals into the briefing and check-ins. If they are blank, add a visible decision point before play instead of inventing them.", "- Build the aftercare section from every participant’s stated or rated aftercare needs. If those fields are blank, add a visible decision point before play instead of inventing an answer.", "- Treat curious items as invitations to discuss and explicitly opt into, never as established consent.", "- Preserve every give/receive role and let the lower compatible rating cap prominence until everyone explicitly agrees otherwise. When the role-dynamics block identifies a clear dominant/submissive pairing, keep that dynamic stable and never suggest switching those roles.", "- Use only the named activities in the supplied data. Do not invent preferences, permissions, identities, anatomy, physical details, or relationship history.", "- Use only first names for every participant. Use a full name only when the guide explicitly requires one.", "- Give the guide a suitable title and render the complete finished play guide in the chat as plain text, ready for Grok to voice aloud in real time.", "- After the complete guide appears in chat, automatically generate a downloadable PDF file containing exactly the same title and guide text. Clearly label the attachment “Download PDF” so it can be shared in Messenger. Do not replace, shorten, or summarize the rendered guide when creating the PDF.", q ].join(" ");
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
            if (!(promptMatchData.established.length + promptMatchData.curious.length)) return e.byId("sceneAvailability").textContent = !isStory && fantasyTopics.length ? "Only fantasy-only topics are available. Add a real-world interest before creating a practical play guide." : "No favorites, positive interests, or curious ratings are available yet.", 
            void (e.byId("sceneBrief").hidden = !0);
            const establishedKindLabel = isSingle ? "favorite / interest" : "compatible interest", castSummary = castIds.map(e => `${rd(e)} · ${vb(rt[e]) || "gender unspecified"} · ${Nb(ot[e]) || "orientation unspecified"}`).join(" + "), castNames = castIds.map(e => rd(e)), castNameList = castNames.length < 2 ? castNames[0] : 2 === castNames.length ? castNames.join(" and ") : `${castNames.slice(0, -1).join(", ")}, and ${castNames[castNames.length - 1]}`, targetInfo = sxScribeTargetInfo(scribeTarget), targetDisplayName = targetInfo.displayName;
            const promptCtx = { castIds, isSingle, isStory, leadName, castNames, castNameList, castSummary, establishedKindLabel, targetInfo, targetDisplayName, roleDynamics, roleDynamicText, fantasyTopics, triedTopics, promptMatchData, sections: null };
            sxRenderScribeBrief(promptCtx);
            promptCtx.sections = sxScribeSharedSections(castIds, isSingle, isStory, roleDynamics, promptMatchData, fantasyTopics, triedTopics);
            const composedPrompt = isStory ? sxComposeScribeStory(promptCtx) : sxComposeScribeGuide(promptCtx), finalPrompt = sxFinishScribePrompt(composedPrompt, promptCtx);
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
        function Id(e) {
            const t = [];
            for (let n = 0; n < e.length; n++) for (let i = n + 1; i < e.length; i++) t.push([ e[n], e[i] ]);
            return t;
        }
        function Pd(e) {
            return structuredClone(e || {});
        }
        function Ld(e, t) {
            const n = (e.ratings || {})[t];
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
        function Td(e, t) {
            return (e.annotations || {})[t] || null;
        }
        function Fd(e, t) {
            const n = e => "limit" === e || "notinterested" === e;
            if (n(Td(e, t))) return !0;
            const i = qn[t] || Xn(t) || (e.importedChildren || {})[t];
            return !(!i || "Category" === i.kind) && Boolean(i.parentId && n(Td(e, i.parentId)) || n(Td(e, catId(i.branch))));
        }
        /* ===== Sync comparison engine v1.1 (ruled algorithm) =====
           The single computation behind every sync percentage in the app:
           the glance panel, the Cast panel, committed group profiles, and
           Scribe all read results produced here. Session inputs: mode is
           carried by the aggregation the caller reads ("play" vs
           "conversation"); per-person Heat in [-100, 100] (default 0)
           shifts the Strong threshold and the shed floor, and above zero
           opens the Soft-no-revisited teaser for that person's own soft
           no's — more topics and more detail as Heat climbs to +100.
           Per-person Veil in [0, 100] (default 50) is primarily a display
           filter, with ONE intended matching exception (ruled
           2026-10-29): teaser candidacy. A topic is a teaser candidate
           only if the excited partner's best positive rating clears
           Aa(veil) — interest >= 80 - 1.8 * veil — and a selected teaser
           feeds conversation.counted and hence the pair Kink Factor, so
           Veil DOES affect matching through teasers. The conversation
           bump itself remains veil-free. The
           retired leniency bands and the inferred role lock play no part
           in any outcome below. */
        function sxClamp(v, lo, hi) {
            return Math.max(lo, Math.min(hi, v));
        }
        function sxMeta(id, profiles) {
            let m = qn[id] || Xn(id) || null;
            if (!m && profiles) for (let k = 0; k < profiles.length; k++) {
                const c = (profiles[k].importedChildren || {})[id];
                if (c) { m = c; break; }
            }
            return !m || "Category" === m.kind ? null : m;
        }
        function sxAnnoScope(profile, id, meta, value) {
            const a = profile.annotations || {};
            if (a[id] === value) return "topic";
            if (meta && meta.parentId && a[meta.parentId] === value) return "subcategory";
            if (meta && meta.branch && a[catId(meta.branch)] === value) return "category";
            return null;
        }
        function sxFlagScope(store, id, meta) {
            if (!store) return null;
            if (store[id]) return "topic";
            if (meta && meta.parentId && store[meta.parentId]) return "subcategory";
            if (meta && meta.branch && store[catId(meta.branch)]) return "category";
            return null;
        }
        function sxTopicData(profile, id, meta) {
            const stored = (profile.ratings || {})[id], raw = Ld(profile, id);
            let single = "number" == typeof stored, singleValue = single ? Number(stored) : null;
            if (!single && Ue.has(id)) {
                single = !0, singleValue = raw.giveKnown ? raw.give : raw.receiveKnown ? raw.receive : null;
            }
            return {
                raw: raw,
                single: single,
                singleValue: singleValue,
                rated: Boolean(raw.giveKnown || raw.receiveKnown),
                limitScope: sxAnnoScope(profile, id, meta, "limit"),
                notInterested: Boolean(sxAnnoScope(profile, id, meta, "notinterested")),
                favorite: Boolean(sxAnnoScope(profile, id, meta, "favorite")),
                fantasyScope: sxFlagScope(profile.fantasyOnly, id, meta),
                triedScope: sxFlagScope(profile.alreadyTried, id, meta)
            };
        }
        function sxStance(value, known, T) {
            return !known ? "unknown" : value < 0 ? "against" : value > T ? "strong" : "curious";
        }
        function sxSides(td, heat) {
            const T = sxClamp(35 - heat, 0, 85);
            if (td.notInterested) return { give: "against", receive: "against" };
            if (td.single) {
                const s = !td.rated ? "unknown" : td.singleValue < 0 ? "against" : "curious";
                return { give: s, receive: s };
            }
            return { give: sxStance(td.raw.give, td.raw.giveKnown, T), receive: sxStance(td.raw.receive, td.raw.receiveKnown, T) };
        }
        function sxRawVal(td, dir) {
            if (td.single) return td.rated ? td.singleValue : null;
            return td.raw[dir + "Known"] ? td.raw[dir] : null;
        }
        function sxRoute(gS, gV, gSingle, rS, rV, rSingle) {
            if ("unknown" === gS || "unknown" === rS) return null;
            if ("against" === gS && "against" === rS) return { kind: "mutual-no" };
            if ("against" === gS || "against" === rS) return { kind: "clash" };
            let kind = "strong" === gS && "strong" === rS ? "full" : "curious" === gS && "curious" === rS ? "tentative" : "open";
            if ((gSingle || rSingle) && "full" === kind) kind = "open";
            return { kind: kind, strength: Math.min(gV, rV) };
        }
        function sxOneSidedShape(sA, sB, nameA, nameB) {
            const pos = s => "strong" === s || "curious" === s, aGive = pos(sA.give), aRecv = pos(sA.receive), bGive = pos(sB.give), bRecv = pos(sB.receive);
            if (aGive && bGive && !aRecv && !bRecv) return "both want to give";
            if (aRecv && bRecv && !aGive && !bGive) return "both want to receive";
            const who = [];
            (aGive || aRecv) && who.push(nameA), (bGive || bRecv) && who.push(nameB);
            return `one-sided — ${who.join(" and ") || nameA}`;
        }
        // Match-engine R1: the strongest-first ordering (strongest strength
        // first, ties broken by label A–Z) and the plain label ordering are
        // declared ONCE here, above every use — the pair scorer, the group
        // scorer, and both teaser bumps all sort through these two.
        const byStrength = (x, y) => (y.strength || 0) - (x.strength || 0) || x.label.localeCompare(y.label), byLabel = (x, y) => x.label.localeCompare(y.label);
        function sxLowestSet(pairs, profiles) {
            const kfOf = pr => pr.conversation ? pr.conversation.kinkFactor : null,
                scoreOf = m => {
                    const kfs = pairs.filter(pr => pr.i === m || pr.j === m).map(kfOf).filter(v => null !== v);
                    return kfs.length ? kfs.reduce((a, b) => a + b, 0) / kfs.length : null;
                },
                scores = profiles.map((p, m) => scoreOf(m)),
                min = scores.reduce((a, v) => null === v ? a : null === a ? v : Math.min(a, v), null),
                lowest = null === min ? [] : scores.map((v, m) => v === min ? m : -1).filter(m => m >= 0);
            return { scores: scores, min: min, lowest: lowest };
        }
        // Match-engine R5: the "take the top slice" curve — the first
        // ceil(|list| * heat / 100) entries, floored at one — is declared
        // ONCE here, above every use: the teaser selection and both
        // promotion bumps (pair and group) slice through it, each passing
        // its own heat value unchanged.
        const takeTop = (list, heat) => list.slice(0, Math.max(1, Math.ceil(list.length * heat / 100)));
        // Match-engine R4: the score headline sentence — the percent,
        // then "N of M shared topics" across the dash, with the group
        // prefix (e.g. "group match score for NAME") folded in ahead of
        // the dash where a view carries one — is written ONCE here,
        // above every use: the pair scorer and the group scorer each
        // build their Play and Conversation headline text through it,
        // each passing its own percent / count / considered values (and
        // its prefix, where present) unchanged. A null percent yields
        // null, exactly as each site's own null check did before.
        const sxHeadlineText = (percent, clicks, things, prefix) => null === percent ? null : `${percent}%${prefix ? ` ${prefix}` : ""} — ${clicks} of ${things} shared topics`;
        // Kinkiness weighting (ruled 2026-10-29, all four pair numbers,
        // pair and group both): Play KF, Play MS,
        // Parlay MS, and Parlay KF are weighted by
        // kinkiness just like Personal / Charted. Effective weight =
        // hierarchical share x kinkiness (sxTopicWeight; kinkiness =
        // 1 - the single O6 aggregate popularity per topic), applied
        // ONCE in numerator and denominator alike. The counted and
        // considered SETS (and the counts reported beside the percent)
        // stay exactly as defined at each call site; only the percent
        // is weighted. Numerator and denominator are summed
        // independently, preserving each site's existing set relation
        // (e.g. a teased topic can count toward the pair conversation
        // numerator). Solver energy is EXCLUDED from this weighting:
        // no solver / settler code calls this helper or sxTopicWeight.
        function sxKinkWeightedPct(recs, isCounted, isConsidered) {
            let num = 0, den = 0, consideredCount = 0;
            recs.forEach(r => {
                const w = sxTopicWeight(r.id);
                if (isConsidered(r)) { consideredCount++; den += w; }
                if (isCounted(r)) num += w;
            });
            return consideredCount && den > 0 ? Math.round(100 * num / den) : null;
        }
        // Play inclusion table (six-scores provisional build,
        // 2026-10-30): Play KF and Play MS use Play's OWN table for
        // now, copied from Charted (the FINAL inclusion tables are
        // DEFERRED — recommendation 2 unruled; Charted's own table,
        // sxFlagSum / sxTopicTerms, is NOT used by Play and is
        // unchanged). Per topic, per member, counted once per topic,
        // listing only what counts: Favorite 1, Tried +1, Fantasy
        // +0.5 ONLY when combined with a rating or another flag (a
        // Fantasy-ONLY flag counts 0 in Play). Limit is not in the
        // table at all — a limit-blocked topic is excluded by the
        // callers' considered sets, never scored here.
        function sxPlayTableFlags(td) {
            const fav = td.favorite ? 1 : 0, tried = td.triedScope ? 1 : 0,
                fantasy = td.fantasyScope ? (td.rated || fav || tried ? .5 : 0) : 0;
            return fav + tried + fantasy;
        }
        // A member's Play KF total for a topic: the binary
        // "rated or not" base plus the Play table's flag sum.
        function sxPlayMemberTotal(td) {
            return (td.rated ? 1 : 0) + sxPlayTableFlags(td);
        }
        // Parlay inclusion table (six-scores provisional build,
        // 2026-10-30, FOR-NOW — final table DEFERRED; Favorite
        // RESTORED at +1 2026-10-30 — its removal in the group-Parlay
        // fix was wrong; Favorite was ruled +1 in this table, not
        // zero): Parlay KF and Parlay MS
        // use Parlay's OWN table on the straight match. Per topic,
        // per member, counted once per topic, listing only what
        // counts: Favorite 1, Tried 1, Fantasy 1 (FULL 1, whether combined or
        // fantasy-only — unlike Play). Teased does not enter Parlay consideration at all
        // (absent, not zero). Limit is not in the table —
        // limit-blocked topics stay out of Parlay's considered set
        // entirely.
        function sxParlayTableFlags(td) {
            return (td.favorite ? 1 : 0) + (td.triedScope ? 1 : 0) + (td.fantasyScope ? 1 : 0);
        }
        // A member's Parlay KF total for a topic: the binary
        // "rated or not" base plus the Parlay table's flag sum.
        function sxParlayMemberTotal(td) {
            return (td.rated ? 1 : 0) + sxParlayTableFlags(td);
        }
        function sxPlayGeoMean(vals) {
            if (!vals.length) return 0;
            let prod = 1;
            vals.forEach(v => { prod *= v; });
            return Math.pow(prod, 1 / vals.length);
        }
        // Epsilon (six-scores provisional build, 2026-10-30;
        // recommendation 4 ACCEPTED with scale factor): epsilon =
        // e_0 * e^(-heat/100), with e_0 = 1 for now, in profile units
        // throughout, no rescaling (epsilon scale handling beyond
        // e_0 = 1 is NOT ruled). APPLIED as a threshold: for Play and
        // Parlay, a direction counts as binary fit only where the
        // absolute normed match term (scale -100..+100) exceeds
        // epsilon, with heat = the group heat = the arithmetic mean
        // of the members' individual heats at formation (Parlay
        // groups in Conversation mode included). For a SINGLE
        // profile the same epsilon, from that person's OWN heat,
        // thresholds their RATING: a flank counts by rating only if
        // its absolute rating exceeds epsilon (see sxTopicTerms).
        // Positive heat -> smaller epsilon (more counts); negative
        // heat -> larger epsilon (fewer counts).
        const SX_EPSILON_E0 = 1;
        function sxPlayEpsilon(heats) {
            const hs = (heats || []).filter(Number.isFinite);
            const h = hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 0;
            return SX_EPSILON_E0 * Math.exp(-h / 100);
        }
        // Hierarchy-share x kinkiness weighted mean of per-topic
        // entries (entries are fractions: KF entries are maxFit/100 x
        // geometric mean, MS entries are geometric means), the weight
        // applied ONCE, numerator and denominator alike. Returns the
        // rounded percent plus the counted (entry > 0) and considered
        // topic counts the headline text reports.
        function sxPlayWeightedPct(recs, entryOf, isConsidered) {
            let num = 0, den = 0, consideredCount = 0, countedCount = 0;
            recs.forEach(r => {
                if (!isConsidered(r)) return;
                const e = entryOf(r);
                if (null == e || !Number.isFinite(e)) return;
                const w = sxTopicWeight(r.id);
                consideredCount++, den += w, num += w * e;
                if (e > 0) countedCount++;
            });
            return { pct: consideredCount && den > 0 ? Math.round(100 * num / den) : null, counted: countedCount, considered: consideredCount };
        }
        // Match-engine (Edit 8): the display-layer MOVE rule — a teased
        // topic moves from the red bucket to the yellow bucket — is
        // governed by ONE predicate, stated once here: the topic's
        // teased list is non-empty AND its class is exactly "soft-no".
        // The pair-glance MOVE and the pair ring-bucket MOVE call this
        // predicate directly; the group ring-bucket MOVE calls it on
        // the pair-selected record and adds its own conditions
        // (non-fantasy, teased for a lowest-overall-kink-score member)
        // at its call site — those group-only conditions are NOT part
        // of this predicate and are not folded into it.
        const sxIsTeased = rec => (rec.teaserFor || []).length && "soft-no" === rec.countClass;
        // Match-engine (Edit 6): the blind-import filter — which of an
        // imported profile's topics survive a blind comparison against
        // the selected comparison group, plus the kept/discarded counts
        // the import toast reports — is declared ONCE here, with the
        // rest of the match engine; the import door calls it with the
        // new profile's id and the comparison-group ids, exactly as it
        // called the inline IIFE this replaces. Its keep rule (no group
        // member limit-blocks the topic, and every member is at >= 36 on
        // the give or the receive flank) is its own and moves unchanged.
        function sxBlindFilter(e, t) {
            const n = [ ...new Set(t.filter(e => vt[e])) ];
            if (n.length < 2) return null;
            const i = n.concat(e).map(e => ({
                name: wt[e],
                ratings: vt[e],
                annotations: Qe[e],
                fantasyOnly: Je[e],
                alreadyTried: et[e],
                importedChildren: at[e],
                roles: st[e]
            })), a = [ vt[e], Ze[e], Qe[e], Je[e], et[e], tt[e] ], r = new Set;
            a.forEach(e => Object.keys(e || {}).forEach(e => {
                isCatId(e) || r.add(e);
            })), Object.keys(at[e] || {}).forEach(e => r.add(e));
            const o = new Set([ ...r ].filter(e => !i.some(t => Fd(t, e)) && i.every(t => {
                const n = Ld(t, e);
                return n.giveKnown && n.give >= 36 || n.receiveKnown && n.receive >= 36;
            })));
            return a.forEach(e => Object.keys(e || {}).forEach(t => {
                o.has(t) || delete e[t];
            })), Object.keys(at[e] || {}).forEach(t => {
                o.has(t) || delete at[e][t];
            }), {
                kept: o.size,
                discarded: [ ...r ].filter(e => !o.has(e)).length,
                groupSize: n.length
            };
        }
        function sxPairFromData(A, B, ids, metas, dataA, dataB, opts) {
            opts = opts || {};
            const heatA = sxClamp(Number(opts.heatA) || 0, -100, 100), heatB = sxClamp(Number(opts.heatB) || 0, -100, 100),
                veilA = null == opts.veilA ? 50 : sxClamp(Number(opts.veilA) || 0, 0, 100), veilB = null == opts.veilB ? 50 : sxClamp(Number(opts.veilB) || 0, 0, 100),
                F = Math.max(0, -heatA, -heatB), nameA = A.name || "First partner", nameB = B.name || "Second partner",
                topics = [], topicsById = {}, teaserCand = [];
            /* Epsilon for this pair (six-scores provisional build):
               group heat = arithmetic mean of the two members' heats
               at formation; binary fit below requires |term| > eps. */
            const sxPairEps = sxPlayEpsilon([ heatA, heatB ]);
            let ratedA = 0, ratedB = 0, oneSidedCount = 0, limitBlocked = 0, fantasySetAside = 0, sharedCount = 0;
            ids.forEach((id, ix) => {
                const meta = metas[ix];
                if (!meta) return;
                const a = dataA[ix], b = dataB[ix];
                a.rated && ratedA++, b.rated && ratedB++;
                const limiters = [];
                a.limitScope && limiters.push({ name: nameA, scope: a.limitScope }), b.limitScope && limiters.push({ name: nameB, scope: b.limitScope });
                const rec = {
                    id: id, label: meta.label, branch: meta.branch,
                    outcome: "invisible", playOutcome: "invisible", strength: null, bestFit: null,
                    fits: [], directions: [], bothWays: !1, clashes: [], shed: !1, mutualNo: !1,
                    ratings: {
                        a: { give: a.raw.give, giveKnown: a.raw.giveKnown, receive: a.raw.receive, receiveKnown: a.raw.receiveKnown, single: a.single, singleValue: a.singleValue },
                        b: { give: b.raw.give, giveKnown: b.raw.giveKnown, receive: b.raw.receive, receiveKnown: b.raw.receiveKnown, single: b.single, singleValue: b.singleValue }
                    },
                    flags: {
                        notInterested: [ a.notInterested && nameA, b.notInterested && nameB ].filter(Boolean),
                        triedBy: [ a.triedScope && nameA, b.triedScope && nameB ].filter(Boolean),
                        fantasyBy: [ a.fantasyScope && nameA, b.fantasyScope && nameB ].filter(Boolean),
                        favoriteBy: [ a.favorite && nameA, b.favorite && nameB ].filter(Boolean)
                    },
                    limiters: limiters, differentIntensities: !1, mismatchShape: null,
                    countClass: null, hotContribution: 0, teaserFor: [], teaserDetail: []
                };
                topics.push(rec), topicsById[id] = rec;
                if (limiters.length) return rec.outcome = "limit-blocked", rec.playOutcome = "limit-blocked", void limitBlocked++;
                const sA = sxSides(a, heatA), sB = sxSides(b, heatB), pos = s => "strong" === s || "curious" === s, anyPos = s => pos(s.give) || pos(s.receive),
                    posFlanks = (s, td) => [ "give", "receive" ].filter(d => pos(s[d])).map(d => ({ dir: d, stance: s[d], rating: sxRawVal(td, d) }));
                /* Teaser candidacy gate (suppression, 2026-10-26): a topic is a teaser candidate only if the excited partner's best positive rating clears the veiled owner's veil threshold, interest >= 80 - 1.8 * veil (Aa). The owner's mark interest (-100) is what the veil hides, so it cannot be the operand that opens the gate: the literal mark-interest reading would admit rows only at veil 100 and would perversely admit unrated marks (null coerces to 0) over rated ones. Candidacy stays marks-only: notInterested marks, never bare -100 ratings. */
                const flanksA = posFlanks(sB, b), intA = flanksA.map(f => f.rating).filter(Number.isFinite), passA = intA.length > 0 && Math.max(...intA) >= Aa(veilA);
                const flanksB = posFlanks(sA, a), intB = flanksB.map(f => f.rating).filter(Number.isFinite), passB = intB.length > 0 && Math.max(...intB) >= Aa(veilB);
                a.notInterested && heatA > 0 && anyPos(sB) && passA && teaserCand.push({ rec: rec, side: "a", owner: nameA, partner: nameB, heat: heatA, flanks: flanksA });
                b.notInterested && heatB > 0 && anyPos(sA) && passB && teaserCand.push({ rec: rec, side: "b", owner: nameB, partner: nameA, heat: heatB, flanks: flanksB });
                if (!(a.rated && b.rated)) return void (a.rated !== b.rated && oneSidedCount++);
                sharedCount++;
                const fantasy = Boolean(a.fantasyScope || b.fantasyScope);
                /* Play KF / Play MS per-topic entries (six-scores
                   provisional build, 2026-10-30). GROUND x FIT: marks
                   and whether something has a fit determine the
                   ground; the ground is multiplied by the TYPE of
                   fit, positive or negative. Krossmatch fits, normed
                   by 100 to profile scale: give-fit = my give x your
                   receive / 100, receive-fit = my receive x your give
                   / 100, each in [-100, 100]; a direction with an
                   unrated flank has no fit. Play KF entry = max fit
                   (as a fraction; signed — max is positive if ANY
                   direction is positive, negative only if BOTH are
                   negative, least negative) x geometric mean over
                   members of (rated-or-not + Play table sum), each
                   member normalized by the group max of that same
                   total. Different marks count as ground in whatever
                   form (one member's fantasy, another's high rating,
                   another's tried — each is ground for that member);
                   fit does not create ground, it multiplies over it.
                   Play MS entry = geometric mean over members of
                   (binary fit existence + Play table flag sum),
                   normalized by the group max of that sum; binary fit
                   per direction = 1 iff |cross-match term| > epsilon
                   (sxPairEps, group heat at formation), and each
                   member takes part in both directions, so both
                   members share the count.
                   Marks vs fit (recommendation 1 ACCEPTED): NO extra
                   weight factor — the stated multiplication stands,
                   fit sets direction/magnitude, marks set how much of
                   that fit is covered. */
                const gvA = sxRawVal(a, "give"), rvA = sxRawVal(a, "receive"), gvB = sxRawVal(b, "give"), rvB = sxRawVal(b, "receive"),
                    fitGive = null != gvA && null != rvB ? gvA * rvB / 100 : null,
                    fitRecv = null != gvB && null != rvA ? gvB * rvA / 100 : null;
                rec.crossFitGive = fitGive, rec.crossFitReceive = fitRecv;
                const totA = sxPlayMemberTotal(a), totB = sxPlayMemberTotal(b), totMax = Math.max(totA, totB),
                    gmRated = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                    fitArr = [ fitGive, fitRecv ].filter(v => null != v),
                    maxFit = fitArr.length ? Math.max(...fitArr) : null;
                rec.playKFEntry = null == maxFit ? null : maxFit / 100 * gmRated;
                const binFit = (null != fitGive && Math.abs(fitGive) > sxPairEps ? 1 : 0) + (null != fitRecv && Math.abs(fitRecv) > sxPairEps ? 1 : 0),
                    cMsA = binFit + sxPlayTableFlags(a), cMsB = binFit + sxPlayTableFlags(b), cMsMax = Math.max(cMsA, cMsB);
                rec.playMSEntry = cMsMax > 0 ? sxPlayGeoMean([ cMsA / cMsMax, cMsB / cMsMax ]) : 0;
                fantasy && fantasySetAside++;
                const mkRoute = (dir, gS, gV, gSingle, rS, rV, rSingle, giverName, receiverName, againstName) => {
                    const r = sxRoute(gS, gV, gSingle, rS, rV, rSingle);
                    if (!r) return;
                    if ("mutual-no" === r.kind) return void (rec.mutualNo = !0);
                    if ("clash" === r.kind) return void rec.clashes.push({ direction: dir, against: againstName });
                    const fit = { direction: dir, kind: r.kind, strength: r.strength, giver: giverName, receiver: receiverName, giverRating: gV, receiverRating: rV, shed: r.strength < F };
                    rec.fits.push(fit), fit.shed && (rec.shed = !0);
                };
                mkRoute("AtoB", sA.give, sxRawVal(a, "give"), a.single, sB.receive, sxRawVal(b, "receive"), b.single, nameA, nameB, "against" === sA.give ? nameA : nameB);
                mkRoute("BtoA", sB.give, sxRawVal(b, "give"), b.single, sA.receive, sxRawVal(a, "receive"), a.single, nameB, nameA, "against" === sB.give ? nameB : nameA);
                const counting = rec.fits.filter(f => !f.shed);
                if (counting.length) {
                    const best = counting.slice().sort((x, y) => y.strength - x.strength)[0];
                    rec.bestFit = best, rec.strength = best.strength,
                    rec.directions = [ ...new Set(counting.map(f => f.direction)) ], rec.bothWays = rec.directions.length > 1,
                    rec.differentIntensities = Math.abs(best.giverRating - best.receiverRating) >= 40,
                    rec.outcome = counting.some(f => "full" === f.kind) ? "match" : "curious-fit";
                } else if (rec.clashes.length) rec.outcome = "conflict";
                else if (rec.shed || anyPos(sA) || anyPos(sB)) rec.outcome = "one-sided";
                else rec.outcome = "not-topics";
                rec.playOutcome = fantasy ? "fantasy-excluded" : rec.outcome;
                if ("conflict" === rec.outcome) rec.mismatchShape = `opposed — ${rec.clashes[0].against}`;
                if ("one-sided" === rec.outcome) rec.mismatchShape = sxOneSidedShape(sA, sB, nameA, nameB);
                if ("match" === rec.outcome || "curious-fit" === rec.outcome) rec.countClass = fantasy ? "fantasy" : "match";
                else if (fantasy && ((a.fantasyScope && (anyPos(sB) || rec.fits.length)) || (b.fantasyScope && (anyPos(sA) || rec.fits.length)))) rec.countClass = "fantasy";
                if (!rec.countClass && (a.triedScope || b.triedScope)) rec.countClass = "experience";
                // countClass "soft-no" is assigned by the teaser selection
                // pass after the topic loop, so the ring counts (via the MOVEs) and
                // the popover Teasers sections always share one selected set.
                rec.hotContribution = !rec.countClass ? 0 : "experience" === rec.countClass || "soft-no" === rec.countClass ? 25 : rec.bestFit ? rec.bestFit.strength : rec.fits.length ? Math.max(...rec.fits.map(f => f.strength)) : 0;
            });
            /* Straight register (Job 1, raw straight sum): same-direction
                products from the crossed records' own ratings, computed beside the
                crossed routes from the same data. Limits excluded everywhere;
                unshared topics stay invisible but coverage-counted. Independent of
                teaser selection, the teaser bump, countClass, heat, and veil — only
                the limit gate filters. No bucket classes, no headline, no counts
                display here; those are deferred rulings. */
            const straightTopics = [], straightById = {};
            let straightShared = 0, straightOneSided = 0, straightLimitBlocked = 0;
            topics.forEach(rec => {
                const ra = rec.ratings.a, rb = rec.ratings.b,
                    giveGive = ra.giveKnown && rb.giveKnown ? ra.give * rb.give : null,
                    recvRecv = ra.receiveKnown && rb.receiveKnown ? ra.receive * rb.receive : null,
                    sum = null == giveGive && null == recvRecv ? null : (giveGive || 0) + (recvRecv || 0),
                    aRated = ra.giveKnown || ra.receiveKnown, bRated = rb.giveKnown || rb.receiveKnown;
                let status;
                if (rec.limiters.length) status = "limit-blocked", straightLimitBlocked++;
                else if (!(aRated && bRated)) status = "invisible", aRated !== bRated && straightOneSided++;
                else status = "shared", straightShared++;
                const srec = { id: rec.id, label: rec.label, branch: rec.branch, giveGive: giveGive, recvRecv: recvRecv, sum: sum, status: status, ratings: rec.ratings, flags: rec.flags };
                straightTopics.push(srec), straightById[rec.id] = srec;
            });
            const straightList = straightTopics.filter(s => "shared" === s.status && null != s.sum && s.sum > 0).sort((x, y) => (y.sum || 0) - (x.sum || 0) || x.label.localeCompare(y.label)),
                straight = { topics: straightTopics, byId: straightById, list: straightList, coverage: { shared: straightShared, oneSided: straightOneSided, limitBlocked: straightLimitBlocked } };
            /* Teaser selection: per owner, the eligible soft-no topics
               (owner marked notInterested, owner's own Heat > 0, partner
               positive on some flank, and the excited partner's best positive rating clears the veiled owner's veil threshold) are
               ordered by the partner's best positive rating descending,
               ties by label A–Z, and the first ceil(|E| * heat / 100) are
               selected (at least one whenever heat > 0). The one selection
               drives teaserFor, the soft-no countClass, and the popover
               Teasers sections together, so they can never diverge. */
            [ "a", "b" ].forEach(side => {
                const mine = teaserCand.filter(c => side === c.side);
                if (!mine.length) return;
                const heat = mine[0].heat, bestOf = c => Math.max(...c.flanks.map(f => null == f.rating ? -1 : f.rating));
                mine.sort((x, y) => bestOf(y) - bestOf(x) || x.rec.label.localeCompare(y.rec.label)),
                takeTop(mine, heat).forEach(c => {
                    c.rec.teaserFor.push(c.owner), c.rec.teaserDetail.push({ owner: c.owner, partner: c.partner, heat: c.heat, flanks: c.flanks }),
                    !c.rec.countClass && "invisible" !== c.rec.outcome && (c.rec.countClass = "soft-no", c.rec.hotContribution = 25);
                });
            });
            /* Teaser bump (Curious → Hot promotion, Jason 2026-10-25): after
               the teaser selection, before lists are built. Per key, native
               curious topics (key "curious-fit", countClass not "soft-no")
               promote to "match", strongest first, ties
               label A–Z, first ceil(|C| * h / 100) with h = min(heatA, heatB),
               at least one when h > 0. Fantasy: the CONVERSATION bump
               (key "outcome") INCLUDES fantasy topics (ruled 2026-10-29,
               unified in the including direction with the group
               conversation bump); the PLAY bump (key "playOutcome") still
               excludes fantasy. The bump itself is veil-free: Veil gates
               nothing in this bump (its matching effect is teaser
               candidacy only, per the engine header). countClass is NEVER
               changed; only the key outcome changes. */
            const bumpH = Math.min(heatA, heatB);
            if (bumpH > 0) [ "outcome", "playOutcome" ].forEach(key => {
                const convKey = "outcome" === key;
                const cands = topics.filter(r => "curious-fit" === r[key] && "soft-no" !== r.countClass && (convKey || ("fantasy" !== r.countClass && 0 === r.flags.fantasyBy.length))).sort(byStrength);
                takeTop(cands, bumpH).forEach(r => { r[key] = "match"; });
            });
            /* Play MS / Play KF aggregates (definition build
               2026-10-30, PROVISIONAL): hierarchy-share x kinkiness
               weighted sums over topics, numerator and denominator
               alike. Play MS considered set = shared (both members
               rated), not limit-blocked, not fantasy. Play KF
               denominator = shared, non-limit-blocked topics
               (weighted). */
            const sxSharedRated = r => {
                    const ra = r.ratings.a, rb = r.ratings.b;
                    return (ra.giveKnown || ra.receiveKnown) && (rb.giveKnown || rb.receiveKnown) && !r.limiters.length;
                },
                msAgg = sxPlayWeightedPct(topics, r => r.playMSEntry, r => sxSharedRated(r) && !(r.flags.fantasyBy || []).length),
                kfAgg = sxPlayWeightedPct(topics, r => r.playKFEntry, r => sxSharedRated(r));
            const mkLists = key => ({
                    matches: topics.filter(r => "match" === r[key]).sort(byStrength),
                    curiousAbout: topics.filter(r => "curious-fit" === r[key]).sort(byStrength),
                    mismatched: topics.filter(r => "conflict" === r[key] || "one-sided" === r[key]).sort(byLabel),
                    limits: topics.filter(r => "limit-blocked" === r[key]).sort(byLabel)
                }),
                playLists = mkLists("playOutcome"), playConsidered = playLists.matches.length + playLists.curiousAbout.length + topics.filter(r => "conflict" === r.playOutcome || "one-sided" === r.playOutcome || "not-topics" === r.playOutcome).length,
                play = {
                    considered: playConsidered,
                    matches: playLists.matches.length,
                    headline: msAgg.pct,
                    lists: playLists
                };
            play.headlineText = sxHeadlineText(play.headline, msAgg.counted, msAgg.considered);
            const convLists = mkLists("outcome"), counted = topics.filter(r => r.countClass),
                conversation = {
                    considered: convLists.matches.length + convLists.curiousAbout.length + topics.filter(r => "conflict" === r.outcome || "one-sided" === r.outcome || "not-topics" === r.outcome).length,
                    counted: counted.length,
                    countsByClass: {
                        match: counted.filter(r => "match" === r.countClass).length,
                        fantasy: counted.filter(r => "fantasy" === r.countClass).length,
                        experience: counted.filter(r => "experience" === r.countClass).length,
                        softNo: counted.filter(r => "soft-no" === r.countClass).length
                    },
                    kinkFactor: null,
                    lists: convLists
                };
            conversation.kinkFactor = kfAgg.pct;
            conversation.headlineText = sxHeadlineText(conversation.kinkFactor, kfAgg.counted, kfAgg.considered);
            const catalog = sxCatalogCount();
            return {
                engine: "sync-1.1", a: nameA, b: nameB,
                heat: { a: heatA, b: heatB }, veil: { a: veilA, b: veilB }, shedFloor: F,
                topics: topics, topicsById: topicsById, play: play, conversation: conversation, straight: straight,
                coverage: {
                    aRated: ratedA, bRated: ratedB, catalog: catalog,
                    aPercent: catalog ? Math.round(ratedA / catalog * 100) : 0,
                    bPercent: catalog ? Math.round(ratedB / catalog * 100) : 0,
                    oneSided: oneSidedCount, limitBlocked: limitBlocked, fantasySetAside: fantasySetAside, shared: sharedCount
                },
                live: sxLivePair(A, B)
            };
        }
        function sxPairCompute(A, B, opts) {
            const ids = Uc(), metas = [], dataA = [], dataB = [];
            ids.forEach(id => {
                const m = sxMeta(id, [ A, B ]);
                metas.push(m), dataA.push(m ? sxTopicData(A, id, m) : null), dataB.push(m ? sxTopicData(B, id, m) : null);
            });
            return sxPairFromData(A, B, ids, metas, dataA, dataB, opts);
        }
        let sxCatalogCache = null;
        function sxCatalogCount() {
            if (null === sxCatalogCache) sxCatalogCache = Uc().filter(id => {
                const m = qn[id];
                return m && "Category" !== m.kind;
            }).length;
            return sxCatalogCache;
        }
        function sxGenderClass(genders) {
            const g = bb(genders || []), man = [ "man", "trans-man", "intersex-man", "demiman" ], woman = [ "woman", "trans-woman", "intersex-woman", "demiwoman" ],
                hasM = g.some(x => man.includes(x)), hasW = g.some(x => woman.includes(x));
            if (hasM && !hasW && g.every(x => man.includes(x))) return "man";
            if (hasW && !hasM && g.every(x => woman.includes(x))) return "woman";
            return null;
        }
        function sxExclusiveAttraction(profile) {
            const o = iv(profile.orientations || []);
            if (!o.length) return null;
            const self = sxGenderClass(profile.genders);
            let target = null;
            for (const t of o) {
                let cur = null;
                if ("straight" === t || "heterosexual" === t) cur = self ? "man" === self ? "woman" : "man" : null;
                else if ("lesbian" === t || "sapphic" === t || "gynesexual" === t) cur = "woman";
                else if ("gay" === t) cur = self;
                else if ("androsexual" === t || "achillean" === t || "uranic" === t || "minsexual" === t) cur = "man";
                else return null;
                if (!cur) return null;
                if (target && target !== cur) return null;
                target = cur;
            }
            return target;
        }
        function sxLivePair(A, B) {
            const classA = sxGenderClass(A.genders), classB = sxGenderClass(B.genders);
            if (!classA || !classB) return !0;
            const attA = sxExclusiveAttraction(A), attB = sxExclusiveAttraction(B);
            if (attA && attA !== classB) return !1;
            if (attB && attB !== classA) return !1;
            return !0;
        }
        function sxGroupCompute(profiles, opts) {
            opts = opts || {};
            const n = profiles.length, ids = Uc(), metas = ids.map(id => sxMeta(id, profiles)),
                data = profiles.map(p => ids.map((id, ix) => metas[ix] ? sxTopicData(p, id, metas[ix]) : null)),
                po = (i, j) => ({
                    heatA: (opts.heat || [])[i] ?? 0, heatB: (opts.heat || [])[j] ?? 0,
                    veilA: (opts.veil || [])[i] ?? 50, veilB: (opts.veil || [])[j] ?? 50
                }), pairs = [];
            for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(Object.assign({ i: i, j: j }, sxPairFromData(profiles[i], profiles[j], ids, metas, data[i], data[j], po(i, j))));
            const topics = [], topicsById = {};
            ids.forEach((id, ix) => {
                const meta = metas[ix];
                if (!meta) return;
                const limiters = [], flags = { notInterested: [], triedBy: [], fantasyBy: [], favoriteBy: [] };
                profiles.forEach((p, pi) => {
                    const d = data[pi][ix], nm = p.name || `Profile ${pi + 1}`;
                    d.limitScope && limiters.push({ name: nm, scope: d.limitScope }),
                    d.notInterested && flags.notInterested.push(nm), d.triedScope && flags.triedBy.push(nm),
                    d.fantasyScope && flags.fantasyBy.push(nm), d.favorite && flags.favoriteBy.push(nm);
                });
                const rec = {
                    id: id, label: meta.label, branch: meta.branch, limiters: limiters, groupLimited: limiters.length > 0,
                    playOutcome: "none", conversationCounts: !1, relevantPlayPairs: 0, relevantConvPairs: 0,
                    pairOutcomes: [], strength: null, flags: flags
                };
                topics.push(rec), topicsById[id] = rec;
                if (rec.groupLimited) return void (rec.playOutcome = "limit-blocked");
                const relPlay = pairs.filter(pr => pr.live && "invisible" !== pr.topicsById[id].outcome && "limit-blocked" !== pr.topicsById[id].outcome),
                    relConv = pairs.filter(pr => "invisible" !== pr.topicsById[id].outcome && "limit-blocked" !== pr.topicsById[id].outcome);
                rec.relevantPlayPairs = relPlay.length, rec.relevantConvPairs = relConv.length,
                rec.pairOutcomes = relConv.map(pr => ({ a: pr.a, b: pr.b, outcome: pr.topicsById[id].outcome }));
                if (relPlay.length) {
                    const mCount = relPlay.filter(pr => "match" === pr.topicsById[id].outcome).length,
                        cCount = relPlay.filter(pr => "match" === pr.topicsById[id].outcome || "curious-fit" === pr.topicsById[id].outcome).length,
                        strengths = relPlay.map(pr => pr.topicsById[id].strength).filter(s => null !== s);
                    rec.playOutcome = mCount > relPlay.length / 2 ? "match" : cCount > relPlay.length / 2 ? "curious-fit" : "mismatched",
                    rec.strength = strengths.length ? Math.min(...strengths) : null;
                }
                if (relConv.length) rec.conversationCounts = relConv.filter(pr => pr.topicsById[id].countClass).length > relConv.length / 2;
                /* Play KF / Play MS group entries (six-scores
                   provisional build, 2026-10-30; group handling =
                   recommendation 5 ACCEPTED: strict majority, more
                   than half, ties do NOT count — consistent with
                   group Charted and pair unanimity for two). Member
                   totals and table sums come from each member's own
                   topic data; the fit side reuses the pair records —
                   Play KF fit = the max cross fit over all member
                   pairs (signed max rule, as for pairs); Play MS
                   binary fit per member = 1 per direction type
                   (give-cross / receive-cross) in which any pair
                   involving that member has a cross term with
                   |term| > epsilon, epsilon from the GROUP heat
                   (arithmetic mean of member heats at formation,
                   sxGroupEps). A topic is group-shared when a strict
                   majority of members rated it. Group-max-zero: a
                   topic whose group max is zero contributes zero and
                   STAYS in the denominator (entries below are 0, never
                   null, for non-limited topics) — no fallback, no
                   invented average. No group-native tensor is
                   invented here. */
                const sxGroupEps = sxPlayEpsilon(opts.heat || []);
                const gTd = profiles.map((p2, pi) => data[pi][ix]),
                    gRatedCount = gTd.reduce((s, d) => s + (d && d.rated ? 1 : 0), 0);
                rec.groupSharedMajority = gRatedCount > profiles.length / 2;
                rec.groupFantasyAny = flags.fantasyBy.length > 0;
                if (!rec.groupLimited) {
                    const gTots = gTd.map(d => d ? sxPlayMemberTotal(d) : 0), gTotMax = Math.max(...gTots),
                        gGm = gTotMax > 0 ? sxPlayGeoMean(gTots.map(v => v / gTotMax)) : 0;
                    let gMaxFit = null;
                    pairs.forEach(pr => {
                        const pr2 = pr.topicsById[id];
                        if (!pr2) return;
                        [ pr2.crossFitGive, pr2.crossFitReceive ].forEach(f => { if (null != f && (null == gMaxFit || f > gMaxFit)) gMaxFit = f; });
                    });
                    rec.playKFEntry = null == gMaxFit ? 0 : gMaxFit / 100 * gGm;
                    const gCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            const pr2 = pr.topicsById[id];
                            if (!pr2) return;
                            if (pr.i === pi) { if (null != pr2.crossFitGive && Math.abs(pr2.crossFitGive) > sxGroupEps) giveFit = !0; if (null != pr2.crossFitReceive && Math.abs(pr2.crossFitReceive) > sxGroupEps) recvFit = !0; }
                            else if (pr.j === pi) { if (null != pr2.crossFitReceive && Math.abs(pr2.crossFitReceive) > sxGroupEps) giveFit = !0; if (null != pr2.crossFitGive && Math.abs(pr2.crossFitGive) > sxGroupEps) recvFit = !0; }
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxPlayTableFlags(gTd[pi]) : 0);
                    }), gCMax = Math.max(...gCs);
                    rec.playMSEntry = gCMax > 0 ? sxPlayGeoMean(gCs.map(v => v / gCMax)) : 0;
                    /* Parlay KF / Parlay MS group entries (group-Parlay
                       fix, 2026-10-30): the SAME construction as the
                       Play group entries directly above, with the
                       Straight Match as basis instead of the
                       Krossmatch. Member totals and table sums come
                       from each member's own topic data through
                       Parlay's OWN for-now table (sxParlayTableFlags:
                       Favorite 1 + Tried 1 + Fantasy 1 (full 1),
                       Teased absent); the fit side reuses the pair
                       records' straight register (pr.straight.byId) —
                       give-fit = give x give / 100, receive-fit =
                       receive x receive / 100, each in [-100, 100].
                       Parlay KF fit = the max straight fit over all
                       member pairs (signed max rule, as for pairs);
                       Parlay MS binary fit per member = 1 per
                       direction type (give-give / receive-receive) in
                       which any pair involving that member has a
                       straight term with |term| > epsilon, epsilon
                       from the GROUP heat (sxGroupEps, arithmetic
                       mean of member heats at formation). Group-max-
                       zero topics contribute zero and STAY in the
                       denominator (entries are 0, never null, for
                       non-limited topics). No peer-ground, no banded
                       topics are referred to in these scores. */
                    const pTots = gTd.map(d => d ? sxParlayMemberTotal(d) : 0), pTotMax = Math.max(...pTots),
                        pGm = pTotMax > 0 ? sxPlayGeoMean(pTots.map(v => v / pTotMax)) : 0;
                    let pMaxFit = null;
                    pairs.forEach(pr => {
                        const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                        if (!sr) return;
                        [ null != sr.giveGive ? sr.giveGive / 100 : null, null != sr.recvRecv ? sr.recvRecv / 100 : null ].forEach(f => { if (null != f && (null == pMaxFit || f > pMaxFit)) pMaxFit = f; });
                    });
                    rec.parlayKFEntry = null == pMaxFit ? 0 : pMaxFit / 100 * pGm;
                    const pCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            if (pr.i !== pi && pr.j !== pi) return;
                            const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                            if (!sr) return;
                            if (null != sr.giveGive && Math.abs(sr.giveGive / 100) > sxGroupEps) giveFit = !0;
                            if (null != sr.recvRecv && Math.abs(sr.recvRecv / 100) > sxGroupEps) recvFit = !0;
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxParlayTableFlags(gTd[pi]) : 0);
                    }), pCMax = Math.max(...pCs);
                    rec.parlayMSEntry = pCMax > 0 ? sxPlayGeoMean(pCs.map(v => v / pCMax)) : 0;
                }
            });
            /* Teaser bump, group level (Jason 2026-10-25). Standalone group
               rule, after majority assignment, before list construction.
               Group play: playOutcome "curious-fit" topics (fantasy
               excluded) promote to "match", strongest first, ties label
               A–Z, first ceil(|C| * h / 100) with h = lowest-set member's
               heat, at least one when h > 0. Group conversation:
               majority-curious topics (strict majority of members hold a
               curious stance on some flank; unrated never counts) that are
               not already counted promote to counted (conversationCounts
               = true), same curve and heat; fantasy IS allowed on the
               group conversation path, as it now is on the pair
               conversation bump too (ruled 2026-10-29, unified in the
               including direction; the earlier 00:36 group-only carve-out
               is superseded). Group PLAY above still excludes fantasy.
               The MOVE is feed-level and
               untouched; engine promotion here is disjoint from it by
               construction. Dd group glance reads grp.play, so group play
               flips flow there automatically; group-conversation promotions
               do NOT flow into Dd group glance (pre-existing gap, unchanged). */
            const bumpHeatArr = opts.heat || [],
                bumpLowest = sxLowestSet(pairs, profiles).lowest,
                bumpH = bumpLowest.length ? Math.min(...bumpLowest.map(m => bumpHeatArr[m] ?? 0)) : 0;
            if (bumpH > 0) {
                takeTop(topics.filter(r => !r.groupLimited && "curious-fit" === r.playOutcome && 0 === r.flags.fantasyBy.length).sort(byStrength), bumpH).forEach(r => { r.playOutcome = "match"; });
                takeTop(topics.filter(r => {
                    if (r.groupLimited || r.conversationCounts || r.relevantConvPairs <= 0) return !1;
                    const ix = ids.indexOf(r.id);
                    if (ix < 0) return !1;
                    let curious = 0;
                    profiles.forEach((p, pi) => {
                        const d = data[pi][ix];
                        if (!d) return;
                        const s = sxSides(d, bumpHeatArr[pi] ?? 0);
                        if ("curious" === s.give || "curious" === s.receive) curious++;
                    });
                    return curious > profiles.length / 2;
                }).sort(byStrength), bumpH).forEach(r => { r.conversationCounts = !0; });
            }
            const msAggG = sxPlayWeightedPct(topics, r => r.playMSEntry, r => !r.groupLimited && r.groupSharedMajority && !r.groupFantasyAny),
                kfAggG = sxPlayWeightedPct(topics, r => r.playKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                /* Parlay group aggregates (group-Parlay fix,
                   2026-10-30): hierarchy-share x kinkiness weighted,
                   via the same sxPlayWeightedPct as the Play group
                   aggregates. Considered set for BOTH numbers =
                   non-limit-blocked topics a strict majority of
                   members rated (groupSharedMajority) — fantasy is
                   INCLUDED in Parlay considered (unlike Play MS,
                   where fantasy is out), and limit-blocked topics
                   stay OUT of considered entirely. */
                msParlayAggG = sxPlayWeightedPct(topics, r => r.parlayMSEntry, r => !r.groupLimited && r.groupSharedMajority),
                kfParlayAggG = sxPlayWeightedPct(topics, r => r.parlayKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                gPlayTopics = topics.filter(r => !r.groupLimited && r.relevantPlayPairs > 0),
                gMatches = gPlayTopics.filter(r => "match" === r.playOutcome),
                play = {
                    considered: gPlayTopics.length, matches: gMatches.length,
                    headline: msAggG.pct,
                    label: "Play MS",
                    lists: {
                        matches: gMatches.sort(byStrength),
                        curiousAbout: gPlayTopics.filter(r => "curious-fit" === r.playOutcome).sort(byStrength),
                        mismatched: gPlayTopics.filter(r => "mismatched" === r.playOutcome).sort(byLabel),
                        limits: topics.filter(r => r.groupLimited).sort(byLabel)
                    }
                };
            play.headlineText = sxHeadlineText(play.headline, msAggG.counted, msAggG.considered);
            const gConvTopics = topics.filter(r => !r.groupLimited && r.relevantConvPairs > 0),
                gCounted = gConvTopics.filter(r => r.conversationCounts),
                conversation = {
                    considered: gConvTopics.length, counted: gCounted.length,
                    kinkFactor: kfAggG.pct,
                    label: "Play KF",
                    lists: {
                        counted: gCounted.sort(byLabel),
                        limits: topics.filter(r => r.groupLimited).sort(byLabel)
                    }
                };
            conversation.headlineText = sxHeadlineText(conversation.kinkFactor, kfAggG.counted, kfAggG.considered);
            const parlay = {
                considered: msParlayAggG.considered, counted: msParlayAggG.counted,
                headline: msParlayAggG.pct, kinkFactor: kfParlayAggG.pct,
                label: "Parlay MS", kfLabel: "Parlay KF",
                lists: {
                    limits: topics.filter(r => r.groupLimited).sort(byLabel)
                }
            };
            parlay.headlineText = sxHeadlineText(parlay.headline, msParlayAggG.counted, msParlayAggG.considered);
            parlay.kfHeadlineText = sxHeadlineText(parlay.kinkFactor, kfParlayAggG.counted, kfParlayAggG.considered);
            const hot = topics.filter(r => !r.groupLimited).map(r => ({
                id: r.id, label: r.label,
                score: pairs.reduce((sum, pr) => sum + (pr.topicsById[r.id] ? pr.topicsById[r.id].hotContribution : 0), 0)
            })).filter(r => r.score > 0).sort((x, y) => y.score - x.score || x.label.localeCompare(y.label));
            return {
                engine: "sync-1.1", pairs: pairs, topics: topics, topicsById: topicsById,
                play: play, conversation: conversation, parlay: parlay, hotTopics: hot, hotTopicsTop10: hot.slice(0, 10)
            };
        }
        /* ===== Two-ring scores (O5 + O6, ruled 2026-10-29) =====
           Personal Kink Factor and Charted are computed per TOPIC over ALL
           403 topics. (The pair/group Play KF and Play MS
           in the sync engine above are kinkiness-weighted too — same
           weight, over their shared considered topics, via
           sxKinkWeightedPct — as are the interim Straight / Parlay
           values below.) Effective topic weight = hierarchical share x
           kinkiness (kinkiness = 1 - O6 aggregated popularity); the
           denominator is the total weighted topic weight over all 403
           topics and never shrinks (limit-excluded topics stay in it).
           Personal: per topic, the MAX flank rating contribution (signed,
           value/100 per known flank; negatives count and subtract) plus the
           topic flag sum counted ONCE per topic (favorite 1, tried 1,
           fantasy 0.5; curious and teased are NOT in the table). Unrated
           but marked topics have base 0 and their flags still count.
           A topic carrying a limit counts NOTHING in either ring (limit
           wins over every other mark). Not Interested alone adds nothing
           to Personal. Percent is NOT clamped at 100.
           Charted: a topic is attended when rated on either flank OR
           flagged OR marked Not Interested alone (binary 1); its amount is
           (rated ? 1 : 0) + flag sum, with Not Interested alone counting
           the binary 1. No clamp. Group Charted (B4): a topic counts when
           a majority of members attend it under the same individual rules,
           members equal, weighted share over all 403 topics, no clamp.
           EPSILON AMENDMENT (six-scores provisional build, 2026-10-30;
           recommendation 4): the rating tests above are epsilon-
           thresholded — a flank counts BY RATING only if |rating| >
           epsilon, epsilon = e_0 * e^(-heat/100), e_0 = 1, from the
           person's OWN heat (Charted is personal-only; group Charted
           judges each member's attendance by that member's own heat,
           then takes the majority — group heat is NOT applied to
           Charted). High heat = smaller epsilon = more topics count;
           low heat = larger epsilon = fewer. This applies to
           Charted's rated term AND to Personal KF's flank term (the
           max is taken over epsilon-passing flanks only). Flag sums
           are unchanged and are NOT epsilon-thresholded. */
        let sxShareCache = null;
        function sxTopicShares() {
            if (sxShareCache) return sxShareCache;
            const ids = Uc(), metas = ids.map(id => sxMeta(id, null)), byBranch = new Map;
            ids.forEach((id, ix) => { const m = metas[ix]; if (!m) return; if (!byBranch.has(m.branch)) byBranch.set(m.branch, []); byBranch.get(m.branch).push([ id, m ]); });
            const shares = {}, nBranch = Math.max(1, byBranch.size);
            byBranch.forEach(list => {
                const peers = new Map;
                list.forEach(([ id, m ]) => { const k = m.parentId || id; if (!peers.has(k)) peers.set(k, []); peers.get(k).push(id); });
                const peerShare = (1 / nBranch) / Math.max(1, peers.size);
                peers.forEach(members => { const s = peerShare / Math.max(1, members.length); members.forEach(id => { shares[id] = s; }); });
            });
            return sxShareCache = shares;
        }
        function sxTopicWeight(id, meta) {
            const sh = sxTopicShares()[id] || 0;
            let kink = null;
            try { kink = window.__sxO6 ? window.__sxO6.kinkinessById(id) : null; } catch (err) { __sxErrLog("sx-o6-kinkiness", err); }
            return sh * (null == kink ? 1 : kink);
        }
        function sxFlagSum(td) {
            return (td.favorite ? 1 : 0) + (td.triedScope ? 1 : 0) + (td.fantasyScope ? .5 : 0);
        }
        function sxTopicTerms(td, eps) {
            if (td.limitScope) return null;
            /* Epsilon rating threshold (provisional amendment): eps
               defaults to the heat-0 value (e_0 = 1) when a caller
               passes none. A flank counts by rating only if its
               absolute rating exceeds eps; the epsilon-rated flag
               below replaces the plain rated flag in BOTH terms. */
            const e = Number.isFinite(eps) ? eps : SX_EPSILON_E0, flanks = [];
            if (td.single) { if (td.rated && null != td.singleValue && Math.abs(td.singleValue) > e) flanks.push(td.singleValue / 100); }
            else { if (td.raw.giveKnown && Math.abs(td.raw.give) > e) flanks.push(td.raw.give / 100); if (td.raw.receiveKnown && Math.abs(td.raw.receive) > e) flanks.push(td.raw.receive / 100); }
            const ratedE = flanks.length > 0,
                base = ratedE ? Math.max(...flanks) : 0, flags = sxFlagSum(td);
            const attended = ratedE || flags > 0 || td.notInterested;
            return {
                personal: base + flags,
                charted: attended ? (ratedE ? 1 : 0) + flags + (!ratedE && !flags && td.notInterested ? 1 : 0) : 0,
                attended: attended
            };
        }
        function sxPersonalCharted(profile) {
            if (!profile) return { personal: null, charted: null };
            const ids = Uc(); let num = 0, ch = 0, den = 0;
            /* Epsilon from this person's OWN heat (personal-only). */
            const eps = sxPlayEpsilon([ profile.id ? sxHeatFor(profile.id) : 0 ]);
            ids.forEach(id => {
                const meta = sxMeta(id, [ profile ]); if (!meta) return;
                const w = sxTopicWeight(id, meta); den += w;
                const terms = sxTopicTerms(sxTopicData(profile, id, meta), eps);
                if (!terms) return;
                num += w * terms.personal, ch += w * terms.charted;
            });
            return den > 0 ? { personal: 100 * num / den, charted: 100 * ch / den } : { personal: null, charted: null };
        }
        function sxGroupCharted(profiles) {
            if (!profiles || !profiles.length) return null;
            const ids = Uc(); let ch = 0, den = 0;
            ids.forEach(id => {
                const meta = sxMeta(id, profiles); if (!meta) return;
                const w = sxTopicWeight(id, meta); den += w;
                let attended = 0;
                /* Each member's attendance is judged by their OWN
                   heat (own epsilon), then strict majority. */
                profiles.forEach(p => { const terms = sxTopicTerms(sxTopicData(p, id, meta), sxPlayEpsilon([ p.id ? sxHeatFor(p.id) : 0 ])); if (terms && terms.attended) attended++; });
                if (attended > profiles.length / 2) ch += w;
            });
            return den > 0 ? 100 * ch / den : null;
        }
        /* Circledot (straight) ring values: Parlay MS (outer) and
           Parlay KF (inner) — Parlay mirrors Play on the straight
           match (give x give, receive x receive, normed /100).
           PROVISIONAL (six-scores build, 2026-10-30): built with the
           provisional rulings for consideration; the Saturday final
           adoption is still unanswered and the final inclusion
           tables are DEFERRED — both named as left in the build
           verdict. Kinkiness weighting: hierarchy share x kinkiness,
           once, numerator and denominator alike, via
           sxPlayWeightedPct. This function serves a PAIR only;
           group Parlay (casts of more than 2) is computed in
           sxGroupCompute by the same construction and served to
           the same header surface by sxRingValuesForCast (bands /
           seats / lists stay pair-only, unchanged). */
        function sxStraightInterim(pair) {
            if (!pair || !pair.straight) return { outer: null, inner: null };
            /* Parlay KF / Parlay MS (six-scores provisional build,
               2026-10-30): the Play formulas with the STRAIGHT match
               as basis instead of the Krossmatch, on Parlay's OWN
               for-now table (sxParlayTableFlags: Favorite 1, Tried 1, Fantasy 1
               FULL). GROUND x FIT, as for Play: marks and
               fit existence determine the ground; the signed fit
               multiplies over it. Straight fits, normed by 100:
               give-fit = my give x your give / 100, receive-fit = my
               receive x your receive / 100 (the straight register
               stores the raw products), each in [-100, 100].
               Parlay KF entry = max straight fit (as a fraction) x
               geometric mean over members of (rated-or-not + Parlay
               table sum), group-max normalized. Parlay MS entry =
               geometric mean over members of (binary straight fit +
               Parlay table flag sum), group-max normalized, binary
               fit per direction = 1 iff |term| > epsilon (epsilon
               from the group heat = mean of the two members' heats
               at formation, pair.heat). CONSIDERED SET
               (recommendation 3 ACCEPTED): shared, non-limit-blocked
               topics for BOTH numbers — the straight register's
               "shared" status already excludes limit-blocked topics,
               which stay OUT even though they could be conversational
               fodder, because they are not conversations to
               encourage. Fantasy is INCLUDED in Parlay considered
               (unlike Play, where fantasy is out of considered), and
               debate topics (negative fit) count in numerator and
               denominator alike. SIGN DIVERGENCE — PROVISIONAL,
               flagged open, NOT settled: Parlay MS counts both kinds
               of ground (binary fit uses |term|, so common ground and
               debate ground both count as conversational fodder),
               while Parlay KF keeps the sign via the signed max fit
               factor (max rule: max(-100, 80) = 80 — max is positive
               if ANY direction is positive; negative only if BOTH
               directions are negative, least negative). No band
               counting is used in either number. This function is
               the pair path; group casts use the group construction
               in sxGroupCompute, on this same table and basis. */
            const sxParlayEps = sxPlayEpsilon(pair.heat ? [ pair.heat.a, pair.heat.b ] : []),
                recs = pair.straight.topics.map(s => {
                    if ("shared" !== s.status) return { id: s.id, entryKF: null, entryMS: null, consideredKF: !1, consideredMS: !1 };
                    const rec = pair.topicsById ? pair.topicsById[s.id] : null, fl = rec ? rec.flags || {} : {},
                        ra = rec ? rec.ratings.a : null, rb = rec ? rec.ratings.b : null,
                        mkTd = (r, name) => ({
                            rated: !!(r && (r.giveKnown || r.receiveKnown)),
                            favorite: (fl.favoriteBy || []).includes(name),
                            triedScope: (fl.triedBy || []).includes(name) ? "topic" : null,
                            fantasyScope: (fl.fantasyBy || []).includes(name) ? "topic" : null
                        }),
                        tdA = mkTd(ra, pair.a), tdB = mkTd(rb, pair.b),
                        fitG = null != s.giveGive ? s.giveGive / 100 : null,
                        fitR = null != s.recvRecv ? s.recvRecv / 100 : null,
                        sFits = [ fitG, fitR ].filter(v => null != v),
                        maxFit = sFits.length ? Math.max(...sFits) : null,
                        totA = sxParlayMemberTotal(tdA), totB = sxParlayMemberTotal(tdB), totMax = Math.max(totA, totB),
                        gm = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                        binFit = (null != fitG && Math.abs(fitG) > sxParlayEps ? 1 : 0) + (null != fitR && Math.abs(fitR) > sxParlayEps ? 1 : 0),
                        cA = binFit + sxParlayTableFlags(tdA), cB = binFit + sxParlayTableFlags(tdB), cMax = Math.max(cA, cB);
                    return {
                        id: s.id,
                        entryKF: null == maxFit ? null : maxFit / 100 * gm,
                        entryMS: cMax > 0 ? sxPlayGeoMean([ cA / cMax, cB / cMax ]) : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                }),
                msAggS = sxPlayWeightedPct(recs, r => r.entryMS, r => r.consideredMS),
                kfAggS = sxPlayWeightedPct(recs, r => r.entryKF, r => r.consideredKF);
            return { outer: msAggS.pct, inner: kfAggS.pct };
        }
        /* Score-ring values for a tab/profile context. kind: "profile"
           (outer Charted, inner Personal KF), "bowtie" (outer Play MS,
           inner Play KF, off the pair/group engine aggregates),
           "circledot" (Parlay MS / Parlay KF pair, provisional). */
        function sxRingValuesForProfile(profile) {
            const pc = sxPersonalCharted(profile);
            return { outerLabel: "Charted", outer: pc.charted, innerLabel: "Personal Kink Factor", inner: pc.personal };
        }
        function sxRingValuesForCast(profiles, pairOp) {
            if (!profiles || profiles.length < 2) return null;
            const grp = sxGroupCompute(profiles, {}), isPair = 2 === profiles.length, pair = isPair ? grp.pairs[0] : null;
            /* No Charted pass here (Rank 10, 2026-10-30): this function
               used to compute sxGroupCharted(profiles) into a `charted`
               field on every return, but its only frequent caller (the
               header paint) reads outer/inner only and threw that pass
               away on every render. The one consumer of group Charted,
               the dialog readback, calls sxGroupCharted directly, so
               the pass runs exactly once, only when the dialog opens. */
            if ("straight" === pairOp) {
                if (!isPair) {
                    /* Group Parlay (group-Parlay fix, 2026-10-30):
                       casts of more than 2 read the group engine's
                       Parlay aggregates (grp.parlay, computed in
                       sxGroupCompute by the same construction as the
                       group Play aggregates) — the SAME header surface
                       pair Parlay and group Play already use; no new
                       surface is invented. */
                    const par = grp.parlay;
                    return { outerLabel: "Parlay MS", outer: par ? par.headline : null, innerLabel: "Parlay KF", inner: par ? par.kinkFactor : null };
                }
                const si = sxStraightInterim(pair);
                return { outerLabel: "Parlay MS", outer: si.outer, innerLabel: "Parlay KF", inner: si.inner };
            }
            const play = isPair ? pair.play : grp.play, conv = isPair ? pair.conversation : grp.conversation;
            return { outerLabel: "Play MS", outer: play ? play.headline : null, innerLabel: "Play KF", inner: conv ? conv.kinkFactor : null };
        }
        /* Score rings (two-ring build): the header Avatar rings are the
           only score-ring paint — outer + inner rings in the same
           108-unit geometry as the header seat (bands 16 units thick,
           tiling outward from the centre), painted by the header block
           in Mr from the ring value providers below. Arc length is
           clamped to the circle for display only; the printed number
           is always the true engine value, including values above 100
           or below 0. Bucket rings (sxRingsHtml) are a different
           mechanism and stay distinct: these rings show engine scores
           only. No below-strip or tab-strip score-ring surface
           remains (ruled 2026-10-30). */
        function sxPctText(v) { return null == v || !Number.isFinite(v) ? "—" : `${Math.round(v)}%`; }
        /* Tab-strip rings removed (ruled 2026-10-29) and match-stage
           score-ring hosts removed (ruled 2026-10-30): no rings render
           in the profile tab strip or below it for individual, group,
           or match tabs — ring numbers live only in the header Avatar
           rings. The ring value providers stay for the header paint. */
        window.__sxRings = { personalCharted: sxPersonalCharted, groupCharted: sxGroupCharted, straightInterim: sxStraightInterim, ringValuesForProfile: sxRingValuesForProfile, ringValuesForCast: sxRingValuesForCast, topicShares: sxTopicShares };
        function sxProfileById(id) {
            return {
                id: id, name: wt[id] || "Profile",
                ratings: vt[id] || {}, annotations: Qe[id] || {}, fantasyOnly: Je[id] || {},
                alreadyTried: et[id] || {}, importedChildren: at[id] || {},
                genders: bb(rt[id]), orientations: iv(ot[id])
            };
        }
        const sxPairCache = new Map;
        function sxInvalidatePairs() {
            sxPairCache.clear();
        }
        function sxPairByIds(idA, idB, sxSettings) {
            if (!vt[idA] || !vt[idB] || idA === idB) return null;
            const [ x, y ] = [ idA, idB ].sort();
            if (sxSettings) return sxPairCompute(sxProfileById(x), sxProfileById(y), {
                heatA: sxSettings[x] ? sxSettings[x].heat : 0, heatB: sxSettings[y] ? sxSettings[y].heat : 0,
                veilA: sxSettings[x] ? sxSettings[x].veil : 50, veilB: sxSettings[y] ? sxSettings[y].veil : 50
            });
            const key = x + "|" + y;
            if (!sxPairCache.has(key)) sxPairCache.set(key, sxPairCompute(sxProfileById(x), sxProfileById(y), {}));
            return sxPairCache.get(key);
        }
        function sxRouteRecord(fit, id) {
            const labels = Ge(id);
            return {
                key: "AtoB" === fit.direction ? "firstGive" : "secondGive",
                score: fit.strength, giver: fit.giver, receiver: fit.receiver,
                giverRating: Math.round(fit.giverRating), receiverRating: Math.round(fit.receiverRating),
                giverLabel: labels.labels[0], receiverLabel: labels.labels[1] || labels.labels[0],
                roleLocked: !1
            };
        }
        window.__SEXCAPADES_SYNC_ENGINE = {
            version: "1.1",
            pair: sxPairCompute,
            group: sxGroupCompute,
            pairByIds: sxPairByIds,
            livePair: sxLivePair,
            profileById: sxProfileById
        };
