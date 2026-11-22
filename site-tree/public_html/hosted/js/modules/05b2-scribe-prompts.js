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
            const w = (rating && rating.shape) || (typeof Ge === "function" ? Ge(topicId) : null);
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
            const s = ca(topicId, profileId), w = s.shape || (typeof Ge === "function" ? Ge(topicId) : null);
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
                    const v = Number(e.line) || 0;
                    if (n.labels && n.labels.length >= 3) {
                        // 3-pole trilinear line: -100 left, 0 center, +100 right
                        if (v > 20) i.push(`affirms "${n.labels[2]}" (${Math.round(v)}% conviction)`);
                        else if (v < -20) i.push(`affirms "${n.labels[0]}" (${Math.round(Math.abs(v))}% conviction)`);
                        else i.push(`affirms center/moderate position "${n.labels[1]}" (neutral/balanced)`);
                    } else {
                        i.push(`${(n.labels && n.labels[0]) || "Line"} ${Math.round(v)} (${sxPoleBand(v)})`);
                    }
                    return i.join(" · ");
                }
                const poleKeys = keys.filter(k => "give" !== k && "receive" !== k);
                if (poleKeys.length && poleKeys.some(k => e[k + "Known"])) {
                    const affirmed = [], rejected = [];
                    poleKeys.forEach(k => {
                        if (!e[k + "Known"]) return;
                        const v = Number(e[k]) || 0;
                        const label = (n.labels && n.labels[keys.indexOf(k)]) || k;
                        if (v > 20) {
                            affirmed.push(`affirms "${label}" (${Math.round(v)}% conviction)`);
                        } else if (v < -35) {
                            rejected.push(`rejects "${label}"`);
                        }
                    });
                    if (affirmed.length) {
                        let res = affirmed.join(" and ");
                        if (rejected.length) res += ` [explicitly rejects: ${rejected.join(", ")}]`;
                        return res;
                    } else if (rejected.length) {
                        return `rejects: ${rejected.join(", ")}`;
                    } else {
                        // All neutral or low
                        poleKeys.forEach(k => {
                            if (!e[k + "Known"]) return;
                            const v = Number(e[k]) || 0;
                            const label = (n.labels && n.labels[keys.indexOf(k)]) || k;
                            i.push(`${label} ${Math.round(v)} (${sxPoleBand(v)})`);
                        });
                        return i.join(" · ");
                    }
                }
            }
            return e.giveKnown && e.give >= 0 && i.push(`${n.labels[0]} ${Math.round(e.give)} (${id(e.give)})`),
            !n.single && e.receiveKnown && e.receive >= 0 && i.push(`${n.labels[1]} ${Math.round(e.receive)} (${id(e.receive)})`),
            i.join(" · ");
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
        // Dynamic topic budgeting (refactor 2026-11-21): calculates
        // target-appropriate limits on established and curious topics
        // injected into Scribe prompts. Prevents flooding small prompts
        // (1-2 paragraphs) with dozens of topics, cutting prompt token
        // sizes dramatically. When depth/rigor is set to 5 ("Dissertation
        // defense"), the cap is removed and all stances are included.
        function sxGetScribeTopicBudget() {
            if (5 === scribeRigor) return { established: Infinity, curious: Infinity };
            const num = Number(String(scribeLengthValue).match(/\d+/)?.[0]) || 5;
            const unit = String(scribeLengthUnit || "paragraphs").toLowerCase();
            let paraEq = num;
            if (unit.startsWith("page")) paraEq = num * 3;
            else if (unit.startsWith("word")) paraEq = Math.max(1, Math.round(num / 150));
            else if (unit.startsWith("chapter")) paraEq = num * 5;
            else if (unit.startsWith("minute")) paraEq = num;

            if (paraEq <= 2) {
                return { established: 8, curious: 4 };
            } else if (paraEq <= 5) {
                return "concise" === scribeDetailLevel ? { established: 12, curious: 6 } : { established: 18, curious: 8 };
            } else if (paraEq <= 10) {
                return { established: 30, curious: 12 };
            } else {
                return { established: 50, curious: 20 };
            }
        }
        function sxBudgetPromptMatchData(data) {
            if (!data) return data;
            const budget = sxGetScribeTopicBudget();
            if (!Number.isFinite(budget.established) && !Number.isFinite(budget.curious)) return data;
            const allEst = data.established || [], allCur = data.curious || [];
            if (allEst.length <= budget.established && allCur.length <= budget.curious) return data;
            const est = allEst.slice(0, budget.established);
            const cur = allCur.slice(0, budget.curious);
            const allowedIds = new Set(est.concat(cur).map(e => e.id));
            return Object.assign({}, data, {
                established: est,
                curious: cur,
                warmup: (data.warmup || []).filter(e => allowedIds.has(e.id)),
                escalation: (data.escalation || []).filter(e => allowedIds.has(e.id)),
                peak: (data.peak || []).filter(e => allowedIds.has(e.id)),
                aftercare: (data.aftercare || []).filter(e => allowedIds.has(e.id)),
                budgeted: (allEst.length > est.length) || (allCur.length > cur.length),
                totalEstablished: allEst.length,
                totalCurious: allCur.length
            });
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
            }) ].filter(Boolean).join("  "), j = unitWord(scribeLengthValue, scribeLengthUnit), z = "concise" === scribeDetailLevel ? "Keep the document concise: short phase notes and only essential check-ins." : "detailed" === scribeDetailLevel ? "Use high detail: specific phase timing, transitions, role cues, check-ins, stop options, and aftercare steps." : "Use balanced detail: enough timing, transitions, role cues, check-ins, and aftercare to follow without over-scripting.", budgetNote = f && f.budgeted ? ` Prioritized the top ${M.length} established ${u ? "interests" : "activities"} and top ${I.length} curious topics for this ${scribeLengthValue}-${j} ${u ? "story" : "guide"} (selected by preference strength).` : "", q = !u ? `- Plan approximately ${scribeLengthValue} ${j}, with flexible phase pacing that adds up to that target while allowing check-ins, pauses, or stopping. ${z}${budgetNote}` : `- Target approximately ${scribeLengthValue} ${j} of story text. Return only the finished story directly as plain text. ${z}${budgetNote}`, H = [ "", `CAST, GENDER & SEXUALITY: ${A}${C}`, s ? "" : ` ${B}`, "", `RATED PREFERENCE DETAIL: ${F}`, "", `HARD-EXCLUDED LIMITS: ${_}` ];
            return { A: A, C: C, M: M, I: I, F: F, _: _, D: D, R: R, O: O, B: B, j: j, q: q, H: H };
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
            const budgetLine = f && f.budgeted ? `- Focused scope: prioritized the top ${M.length} established stances and top ${I.length} mild stances for this ${scribeLengthValue}-${unitWord(scribeLengthValue, scribeLengthUnit)} discussion (selected by conviction strength).` : "";
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
                budgetLine ? budgetLine : "",
                lengthLine,
                "- Use only the named topics below as the positions in the discussion. Do not add, imply, or reference any unlisted stance.",
                "- Pay strict attention to affirmed versus rejected stances: when a profile affirms a position (e.g. bodily resurrection, virgin birth) and explicitly rejects opposing positions, present their affirmed conviction faithfully. Do not invert or reverse their stated beliefs.",
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
