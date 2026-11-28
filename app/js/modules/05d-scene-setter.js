        const Au = new Map;
        function sxSceneCastPrefs(e) {
            const t = function(e) {
                return e.slice().sort().join("|");
            }(e);
            Au.has(t) || Au.set(t, {
                safewords: "",
                aftercare: Object.fromEntries(e.map(e => [ e, "" ])),
                length: "5",
                lengthUnit: "paragraphs",
                detail: "balanced",
                negotiationLength: "1",
                negotiationLengthUnit: "pages"
            });
            const n = Au.get(t);
            return e.forEach(e => {
                Object.prototype.hasOwnProperty.call(n.aftercare, e) || (n.aftercare[e] = "");
            }), n;
        }
        function sxSceneNodeLabel(e, t) {
            const n = sxNodeRegistry[e] || sxNodeById(e) || t.map(t => (at[t] || {})[e]).find(Boolean);
            return n ? n.label : e;
        }
        /* Sex research "why" (2026-11-28): the reasons behind an
           activity, from the skin topic's `research` field, for the
           negotiation document. Mirrors the Scribe's
           sxTopicResearchText but for Sex research keys (give /
           receive / self / pole keys) and returns a compact " Why: ..."
           suffix for an activity line. Only reasons are included, plus
           a real statistic (never the "No reliable statistic found"
           placeholder). Returns "" when the topic carries no research
           or nothing the cast holds, so topics without research add
           nothing and nothing is invented. */
        function sxSexResearchWhy(topicId, profileIds) {
            const research = (typeof window !== "undefined" && typeof window.__SX_RESEARCH_FOR_TOPIC === "function") ? window.__SX_RESEARCH_FOR_TOPIC(topicId) : null;
            if (!research || "object" !== typeof research) return "";
            const w = (typeof sxWidgetConfig === "function") ? sxWidgetConfig(topicId) : null;
            const seen = new Set(), keys = [];
            const addKey = k => { if (k && research[k] && !seen.has(k)) { seen.add(k); keys.push(k); } };
            if (research.self) addKey("self");
            (profileIds || []).forEach(pid => {
                let st = null;
                try { st = sxDecodeTopicStance(topicId, pid); } catch (err) { st = null; }
                if (!st) return;
                if (w && 1 === (w.keys || []).length && "line" === w.keys[0] && st.lineKnown) {
                    const v = Number(st.line) || 0, pk = w.poleKeys || [];
                    if (v > 20 && pk[2]) addKey(pk[2]);
                    else if (v < -20 && pk[0]) addKey(pk[0]);
                    else if (pk[1]) addKey(pk[1]);
                    return;
                }
                if (st.giveKnown && (Number(st.give) || 0) >= 20) addKey("give");
                if (st.receiveKnown && (Number(st.receive) || 0) >= 20) addKey("receive");
                if (w && Array.isArray(w.keys)) {
                    w.keys.filter(k => "give" !== k && "receive" !== k && "line" !== k).forEach(k => {
                        if (!st[k + "Known"]) return;
                        const v = Number(st[k]) || 0;
                        if (v > 20 || v < -35) addKey(k);
                    });
                }
            });
            if (!keys.length) return "";
            const keyList = (w && (w.poleKeys || w.keys)) || [], labels = (w && w.labels) || [];
            const parts = keys.map(k => {
                const r = research[k];
                let label;
                if ("give" === k) label = "Giving";
                else if ("receive" === k) label = "Receiving";
                else if ("self" === k) label = "Why this appeals";
                else {
                    const idx = keyList.indexOf(k);
                    label = (idx >= 0 && labels[idx]) || k;
                }
                let text = `${label} — Reasons: ${r.reasons}`;
                const stat = r.statistic ? String(r.statistic).trim() : "";
                if (stat && "No reliable statistic found." !== stat && !/^No reliable statistic/i.test(stat)) text += ` Statistic: ${stat}`;
                return text;
            });
            return ` Why: ${parts.join(" | ")}`;
        }
        function sxSceneNegotiationData(e, t = {}) {
            const sxCanon = e => {
                try {
                    return sxResolveTopicId(e);
                } catch (t) {
                    return e;
                }
            }, sxOwnUniverse = e => [ ...new Set([ ...sxAllTopicIds(), ...Object.keys(vt[e] || {}), ...Object.keys((Ye[e] || {}).ratings || {}) ]) ], sxDeepSets = [ ...new Set((Array.isArray(e) ? e : []).filter(e => vt[e])) ].map(e => {
                const t = new Set;
                return sxOwnUniverse(e).forEach(n => {
                    const i = sxDecodeTopicStance(n, e), a = Ye[e] ? sxNormalizeRating(Ye[e], n) : null;
                    (i.giveKnown && i.give <= -36 || i.receiveKnown && i.receive <= -36 || a && (a.giveKnown && a.give <= -36 || a.receiveKnown && a.receive <= -36)) && t.add(sxCanon(n));
                }), t;
            });
            const n = [ ...new Set((Array.isArray(e) ? e : []).filter(e => vt[e])) ], i = n.map(e => sxCastNameText(e)), a = new Set(sxAllTopicIds().filter(e => n.some(t => sxIsLimitOrUninterested(e, t)))), r = new Set(t.excludeFantasy ? sxAllTopicIds().filter(e => n.some(t => sxIsFantasyOnly(e, t))) : []), o = new Set([ ...a, ...r ]), s = n.map(e => sxHardLimitLines([ e ])), l = n.map(e => [ ...new Set([ ...new Set(sxOwnUniverse(e).map(e => sxCanon(e))) ].filter(n => !(t.hideExcludedNames && o.has(n))).filter(t => sxDeepSets[n.indexOf(e)].has(t)).map(e => sxSceneNodeLabel(e, n)).sort()) ]), c = [];
            sxAllTopicIds().forEach(e => {
                a.has(e) || t.excludeFantasy && r.has(e) || sxAllUnorderedPairs(n).forEach(([t, a]) => {
                    const r = n.indexOf(t), o = n.indexOf(a), s = sxDecodeTopicStance(e, t), l = sxDecodeTopicStance(e, a), d = [];
                    s.giveKnown && l.receiveKnown && s.give >= 36 && l.receive <= -36 && d.push(`${i[r]} gives / ${i[o]} receives`), 
                    s.receiveKnown && l.giveKnown && s.receive >= 36 && l.give <= -36 && d.push(`${i[r]} receives / ${i[o]} gives`), 
                    l.giveKnown && s.receiveKnown && l.give >= 36 && s.receive <= -36 && d.push(`${i[o]} gives / ${i[r]} receives`), 
                    l.receiveKnown && s.giveKnown && l.receive >= 36 && s.give <= -36 && d.push(`${i[o]} receives / ${i[r]} gives`), 
                    d.length && c.push(`${sxSceneNodeLabel(e, n)} — ${d.join("; ")}${sxSexResearchWhy(e, n)}`);
                });
            });
            const sxSettings = Object.fromEntries(n.map(id => [ id, { heat: sxHeatFor(id), veil: sxVeilFor(id) } ])), d = n.length > 2 ? sxMultiMatchData(n, sxSettings) : sxCastMatchData(n[0], n[1], sxSettings), sxTeasers = function() {
                const seen = new Set, out = [];
                const line = rec => {
                    const dets = rec.teaserDetail && rec.teaserDetail.length ? rec.teaserDetail : rec.teaserFor.map(o => ({ owner: o, partner: "", heat: 0, flanks: [] }));
                    return dets.map(d => {
                        let s = `${d.owner} marked this Not Interested`;
                        if (d.heat > 0 && d.flanks && d.flanks.length) {
                            const ft = d.flanks.map(f => `${f.dir}${d.heat >= 34 ? ` (${"strong" === f.stance ? "strong" : "curious"}${d.heat >= 67 && null != f.rating ? `, ${Math.round(f.rating)}` : ""})` : ""}`).join(" and ");
                            s += 100 === d.heat ? `, at full ${sxTerm("heatMax")} heat (+100) ${d.partner} is offering more of themselves: ${d.partner} wants to ${ft}` : `; at the current Heat (+${d.heat}) it is teaser-eligible only: ${d.partner} wants to ${ft}`;
                        } else s += "; at the current Heat it is teaser-eligible only";
                        return s;
                    }).join("; ");
                };
                const take = rec => {
                    if (!rec || !rec.teaserFor || !rec.teaserFor.length || seen.has(rec.id)) return;
                    if (n.some(t => sxIsFantasyOnly(rec.id, t))) return;
                    seen.add(rec.id), out.push(`${rec.label} — ${line(rec)} — a soft no being revisited, never a match. Surface it solely as a flagged conversation point with an easy opt-out.`);
                };
                if (2 === n.length) {
                    const pair = sxPairByIds(n[0], n[1], sxSettings);
                    pair && pair.topics.forEach(take);
                } else if (n.length > 2) sxGroupCompute(n.map(x => sxProfileById(x)), {
                    heat: n.map(id => sxSettings[id].heat),
                    veil: n.map(id => sxSettings[id].veil)
                }).pairs.forEach(pr => pr.topics.forEach(take));
                return out.sort((x, y) => x.localeCompare(y));
            }(), sxFirstName = Object.fromEntries(n.map((e, t) => [ wt[e] || "", i[t] ])), sxDirOf = e => {
                const t = e.route ? [ e.route ] : e.routes && e.routes.length ? e.routes : [];
                return [ ...new Set(t.map(e => `${sxFirstName[e.giver] || e.giver} gives → ${sxFirstName[e.receiver] || e.receiver} receives`)) ].join("; ");
            }, sxIsFantasy = e => Boolean(e.fantasyOnly) || n.some(t => sxIsFantasyOnly(e.id, t)), sxRedFor = e => n.map((t, a) => sxDeepSets[a] && sxDeepSets[a].has(sxCanon(e.id)) ? i[a] : "").filter(Boolean), sxLineOf = e => {
                const t = sxDirOf(e), a = sxRedFor(e);
                return `${e.label}${t ? ` — ${t}` : ""}${a.length ? ` — red/no for ${a.join(" and ")}` : ""}${sxSexResearchWhy(e.id, n)}`;
            }, u = e => e.filter(e => !o.has(e.id) && !sxIsFantasy(e)).map(sxLineOf), sxFantasySeen = new Set, sxFantasyOf = e => e.filter(e => !o.has(e.id) && sxIsFantasy(e) && !sxFantasySeen.has(e.id) && sxFantasySeen.add(e.id)).map(e => `☁ ${sxLineOf(e)}`), p = sxSceneCastPrefs(n), h = n.map(e => function(e, t, n = new Set) {
                return sxAllTopicIds().filter(t => {
                    const i = sxNodeRegistry[t] || sxNodeById(t);
                    if (!i || "Connection & aftercare" !== i.branch || sxIsLimitOrUninterested(t, e) || n.has(t)) return !1;
                    const a = sxDecodeTopicStance(t, e);
                    return "favorite" === Qe[e]?.[t] || a.giveKnown && a.give > 35 || a.receiveKnown && a.receive > 35;
                }).map(n => {
                    const i = sxDecodeTopicStance(n, e);
                    return `${sxSceneNodeLabel(n, t)}${sxRatingProseText(i, n) ? ` — ${sxRatingProseText(i, n)}` : ""}${sxSexResearchWhy(n, [e])}`;
                }).sort();
            }(e, n, t.hideExcludedNames ? o : new Set));
            return {
                ids: n,
                names: i,
                limits: s,
                reds: l,
                discuss: c,
                warmup: u(d.warmup),
                main: u(d.escalation.concat(d.peak)),
                aftercare: u(d.aftercare),
                fantasy: sxFantasyOf([ ...d.warmup, ...d.escalation, ...d.peak, ...d.aftercare ]),
                teasers: sxTeasers,
                ratedAftercare: h,
                safewords: String(p.safewords || "").trim(),
                aftercareNeeds: n.map(e => String(p.aftercare[e] || "").trim()),
                excluded: sxHardLimitLines(n),
                terms: n.map(e => String(it[e] || "").trim()),
                mutuals: n.length > 1 ? sxAllTopicIds().filter(e => sxDeepSets.every(t => t.has(e))).map(e => sxSceneNodeLabel(e, n)).sort() : []
            };
        }
        function sxListItemMarkup(e, t) {
            return e.length ? e.map(e => `<li>${sxEscapeHtmlText(e)}</li>`).join("") : `<li>${sxEscapeHtmlText(t)}</li>`;
        }
        function sxTermsBlock(e, t, a) {
            const n = e.map((e, n) => {
                const i = String(it[e] || "").trim();
                return i ? `${t[n]}: "${i}"` : "";
            }).filter(Boolean);
            return n.length ? [ a && a.flavor ? "TERMS — IN THEIR OWN WORDS (each person's stated terms, quoted verbatim as flavor and character context for the writing; let them color voice, motivation, and texture — they are not the binding layer here):" : "TERMS — BINDING (quoted law, do not interpret or soften):", ...n ].join(" ") : "";
        }
        function sxAboutBlock(e, t) {
            // E8: About Me reaches the Scribe prompt only - per-profile,
            // attributed by name, framed as the person's own words /
            // profile context. Never binding: the binding layer stays
            // marks and Terms only. Empty About yields no section.
            const n = e.map((e, n) => {
                const i = String(nt[e] || "").trim();
                return i ? `ABOUT ${t[n]} (their own words):\n${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "PROFILE CONTEXT — IN THEIR OWN WORDS (background color for voice and character only; not binding limits and not checklist data — the binding layer is marks and Terms only):", ...n ].join("\n\n") : "";
        }
        function sxAgeBlock(e, t) {
            // Age context-on-tap: fires only when ageplay is in play -
            // the ageplayer role on any cast profile. All participants
            // are adults; the ages below are ageplay framing context for
            // the writers only. This is the only prompt-side reader of lt;
            // age never reaches matching, eligibility, or any boundary.
            if (!e.some(e => sxNormalizeRoles(st[e]).includes("ageplayer"))) return "";
            const n = e.map((e, n) => {
                const i = String(lt[e] || "").trim();
                return i ? `${t[n]}: age ${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "AGE CONTEXT — AGEPLAY FRAMING ONLY (all participants are adults; these chronological ages are supplied solely as ageplay framing context for the writers — they do not affect matching, eligibility, or any boundary):", ...n ].join(" ") : "";
        }
        function sxRolesBlock(e, t) {
            const n = e.map((e, n) => {
                const i = sxRoleLabelsText(st[e], ", ");
                return i ? `${t[n]}: roles: ${i}` : "";
            }).filter(Boolean);
            return n.length ? [ "CAST — ROLES (identity language):", ...n ].join(" ") : "";
        }
        function sxCastBlock(e, t) {
            const n = e.map((e, n) => {
                const i = sxNormalizeGenders(rt[e]), a = sxNormalizeOrientations(ot[e]), r = String(pz[e] || "").trim();
                return `${t[n]}: gender: ${i.length ? sxGenderLabelsText(i, " and ") : "unspecified"}; orientation: ${a.length ? sxOrientationLabelsText(a, " and ") : "unspecified"}. Pronouns for ${t[n]}: ${sxPronounText(e)}. Do not infer anatomy from gender labels. Gender, orientation, and roles guide identity and partner-gender choices only.`;
            }).filter(Boolean);
            return n.length ? [ "CAST — GENDER, ORIENTATION & PRONOUNS (identity language):", ...n ].join(" ") : "";
        }
        function sxWriterStamp(ids) {
            // E6 stamp: every writer output names the live session compare
            // settings - mode, and each cast profile's Heat (zone + signed
            // value) and Veil - read from the same session state the
            // Compare panel reads (sxcv / sxHeatFor / sxVeilFor).
            const names = ids.map(id => sxCastNameText(id)), heat = ids.map((id, i) => {
                const v = sxHeatFor(id);
                return `${names[i]} ${sxHeatZone(v)} ${v > 0 ? "+" + v : v}`;
            }), veil = ids.map((id, i) => `${names[i]} ${sxVeilFor(id)}`);
            return `COMPARE SETTINGS — Mode: ${"play" === sxcv.mode ? sxTerm("playMode") : sxTerm("conversationMode")} · Heat: ${heat.join(" · ")} · Veil: ${veil.join(" · ")}`;
        }
        // Shared plain-text lines for the BINDING surfaces only
        // (refactor F11): the per-person binding Terms line and the
        // stated-aftercare-needs line are byte-identical in Lu()'s
        // negotiation checklist and in sxStoreNegotiationGuide()'s
        // guide document - same text, same per-person inputs - so
        // both render through these two helpers. The promise stays
        // explicit at each call site: these helpers format BINDING
        // lines only. Scribe's flavor rendering is a different
        // promise and does not use them (sxTermsBlock with
        // { flavor: true } at the Scribe call sites); Lu()'s
        // hideTerms guard likewise stays at the Lu() call site,
        // not inside the helper.
        function sxBindingTermsLine(terms) {
            return `- Terms (binding): "${terms}"`;
        }
        function sxStatedAftercareLine(needs) {
            return `- ${needs}`;
        }
        // Binding vs flavor (refactor F11 - read before "deduplicating"
        // the per-person terms/aftercare lines): Scribe's sxTermsBlock
        // renders a person's Terms as FLAVOR - character context for a
        // story or guide prompt, explicitly non-binding (its flavor
        // parameter says so). Scene Setter's per-person lines in Lu()
        // below and in sxStoreNegotiationGuide() are the BINDING layer:
        // the negotiation checklist and guide document a partner is
        // held to, where Terms sit alongside the marker lists. The two
        // renderings intentionally differ in wording, punctuation, and
        // empty-state lines (e.g. "- None marked" in the checklist vs
        // "- None marked." in the guide document), so the surrounding
        // renderings are NOT merged - merging them would change
        // shipped bytes and blur the promise each surface makes. What
        // IS shared safely is the block level: sxTermsBlock /
        // sxAboutBlock / sxAgeBlock / sxRolesBlock / sxCastBlock feed
        // both Scribe's prompt and Setter's documents (via Fu /
        // sxStoreNegotiationGuide), and that sharing stays. Two
        // single lines are also shared, via the helpers directly
        // above: the binding Terms line and the stated-aftercare
        // line are byte-identical between the checklist and the
        // guide document (both binding surfaces, same per-person
        // inputs). Deliberately left unshared: the limits/reds lists
        // and their empty states (punctuation differs, above);
        // Lu()'s aftercare fallback chain - stated needs, else rated
        // aftercare lines, else the not-filled-out line - because
        // the guide document renders rated aftercare in its own
        // tier-gated section instead; and the on-screen checklist
        // panel's HTML terms line, which carries no "- " prefix
        // because Pu() wraps it in an <li>.
        function sxNegotiationChecklistText(e, t = {}) {
            const n = [ sxWriterStamp(e.ids), `NEGOTIATION CHECKLIST DATA — BINDING — ${e.names.join(" + ")}` ], i = Boolean(t.hideExcluded), sxNoTerms = Boolean(t.hideTerms);
            return e.names.forEach((t, a) => {
                const r = [ ...(i ? e.limits[a].length ? [ `- ${e.limits[a].length} ${sxIsVanillaSkin() ? "red-line-excluded" : "hard-excluded"} ${1 === e.limits[a].length ? "topic is" : "topics are"} omitted; names intentionally absent.` ] : [] : e.limits[a].map(e => `- ${e}`)), ...(e.terms && e.terms[a] && !sxNoTerms ? [ sxBindingTermsLine(e.terms[a]) ] : []) ];
                r.length || r.push("- None marked"), n.push("", `${t} — ${sxMarkHeading("limit")}`, ...r, `${t} — RED TOPICS`, ...e.reds[a].length ? e.reds[a].map(e => `- ${e}`) : [ "- None rated red" ], `${t} — STATED AFTERCARE NEEDS`, ...e.aftercareNeeds[a] ? [ sxStatedAftercareLine(e.aftercareNeeds[a]) ] : e.ratedAftercare[a].length ? e.ratedAftercare[a].map(e => `- ${e}`) : [ "- Not filled out; agree before play." ]);
            }), n.push("", "MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED", ...e.mutuals && e.mutuals.length ? e.mutuals.map(e => `- ${e}`) : [ "- None — no topic is rated deep-red by both partners." ]), n.push("", "DISCUSS FIRST — GREEN / RED CLASHES", ...e.discuss.length ? e.discuss.map(e => `- ${e}`) : [ "- No green-versus-red clashes found." ], "", "SAFEWORDS + STOP SIGNALS", `- ${e.safewords || "Not filled out; choose verbal safewords and a nonverbal stop signal before play."}`, "", "OTHER BEFORE-PLAY CHECKS", "- Agree what “pause” means and who may call it.", "- Confirm intensity, pacing, injuries, medication, allergies, and supplies."), 
            n.join(" ");
        }
        function sxPlayGuideSourceText(e) {
            return [ "PLAY GUIDE DATA — SOURCE MATERIAL", "Warm-up", ...e.warmup.length ? e.warmup.map(e => `- ${e}`) : [ "- Agree on a gentle start together." ], "Main play", ...e.main.length ? e.main.map(e => `- ${e}`) : [ "- No shared green/green main-play topic is recorded." ], "Aftercare ideas from rated profiles", ...e.aftercare.length ? e.aftercare.map(e => `- ${e}`) : [ "- No shared aftercare topic is recorded." ], ...(e.fantasy && e.fantasy.length ? [ `${sxMarkLabel("fantasyonly").label} — excluded from practical ${sxIsVanillaSkin() ? "plans" : "play"}`, ...e.fantasy.map(e => `- ${e}`) ] : []), ...(e.teasers && e.teasers.length ? [ "Teasers — soft no revisited at the current Heat (flagged; teaser-eligible only, never a match)", ...e.teasers.map(e => `- ${e}`) ] : []) ].join(" ");
        }
        function sxNegotiationLengthSpec(t) {
            const raw = String(t.negotiationLength || "1").trim().replace(/[–—]/g, "-"), unit = [ "words", "paragraphs", "pages", "chapters" ].includes(String(t.negotiationLengthUnit || "")) ? String(t.negotiationLengthUnit) : "pages", m = raw.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/), first = m ? Number(m[1]) : 1, labelNum = m ? m[2] ? `${m[1]}–${m[2]}` : `${m[1]}` : "1", pages = "words" === unit ? first / 500 : "paragraphs" === unit ? first / 5 : first, tier = pages <= 1 ? "compact" : pages <= 3 ? "standard" : "full", mod = sxSetterIsModeration();
            return {
                label: `${labelNum} ${unitWord(labelNum, unit)}`,
                tier: tier,
                // The moderation tier labels name the shared-ground
                // detail instead of the rated-aftercare detail - there
                // is no aftercare on a stance map.
                tierLabel: "compact" === tier ? "compact (full per-topic detail folded)" : "standard" === tier ? (mod ? "standard (shared-ground detail included)" : "standard (rated-aftercare detail included)") : (mod ? "full (shared-ground detail and per-topic appendix included)" : "full (rated-aftercare detail and per-topic appendix included)")
            };
        }
        function sxStoreNegotiationGuide(g) {
            const st = sxSceneCastPrefs(g.ids), sp = sxNegotiationLengthSpec(st), list = (items, empty) => items && items.length ? items.map(x => `- ${x}`) : [ `- ${empty}` ], L = [ "NEGOTIATION GUIDE", g.names.join(" + "), sxWriterStamp(g.ids), `Target length: ${sp.label} · Detail: ${sp.tierLabel}`, "This document records the completed negotiation checklist as the agreement itself. A hypermap match is not consent." ], roles = sxRolesBlock(g.ids, g.names), cast = sxCastBlock(g.ids, g.names), termsBlock = sxTermsBlock(g.ids, g.names), hardExcluded = [ ...new Set((g.excluded || []).concat(g.mutuals || [])) ];
            roles && L.push("", roles), cast && L.push("", cast), g.names.forEach((name, idx) => {
                L.push("", `${name} — ${sxMarkHeading("limit")}`, ...list(g.limits[idx], "None marked."));
                g.terms && g.terms[idx] && L.push(sxBindingTermsLine(g.terms[idx]));
                L.push("", `${name} — RED TOPICS`, ...list(g.reds[idx], "None rated red."));
            }), L.push("", "MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED", ...list(g.mutuals, "None — no topic is rated deep-red by both partners.")), L.push("", "DISCUSS FIRST — GREEN / RED CLASHES", ...list(g.discuss, "No green-versus-red clashes found.")), L.push("", "SAFEWORDS + STOP SIGNALS", ...list(g.safewords ? [ g.safewords ] : [], "Not filled out; choose verbal safewords and a nonverbal stop signal before play.")), L.push("", "AFTERCARE"), g.names.forEach((name, idx) => {
                L.push("", `${name} — STATED AFTERCARE NEEDS`, ...(g.aftercareNeeds[idx] ? [ sxStatedAftercareLine(g.aftercareNeeds[idx]) ] : list([], "Not filled out; agree before play.")));
            }), L.push("", sxIsVanillaSkin() ? "RED-LINE-EXCLUDED NOTICE" : "HARD-EXCLUDED NOTICE", `The topics below are ${sxIsVanillaSkin() ? "red-line-excluded" : "hard-excluded"}: outside this agreement and outside any play guide generated from it.`, ...list(hardExcluded, "None marked.")), g.terms && g.terms.some(Boolean) && L.push(`- ${sxIsVanillaSkin() ? "Red lines" : "Limits"} named in a profile’s Terms also apply, exactly as quoted in this guide.`), termsBlock && L.push("", termsBlock), L.push("", "BEFORE-PLAY CHECKS"), "compact" === sp.tier ? L.push("- Confirm the meaning of “pause”, intensity and pacing, injuries, medication, allergies, and supplies before play.") : L.push("- Agree what “pause” means and who may call it.", "- Confirm intensity, pacing, injuries, medication, allergies, and supplies."), "compact" === sp.tier ? L.push("", "PER-TOPIC DETAIL — FOLDED AT THIS LENGTH", `- Rated aftercare preferences: ${g.names.map((name, idx) => `${name} ${g.ratedAftercare[idx].length} recorded`).join("; ")}.`, `- Topic detail folded: ${g.warmup.length} warm-up, ${g.main.length} main-play, and ${g.aftercare.length} aftercare ideas are recorded; ${sxMarkLabel("fantasyonly").label.toLowerCase().replace(" ", "-")} and teaser entries stay labelled in the full setting.`) : (L.push("", "PER-TOPIC DETAIL — RATED AFTERCARE PREFERENCES"), g.names.forEach((name, idx) => {
                L.push("", `${name} — RATED AFTERCARE PREFERENCES`, ...list(g.ratedAftercare[idx], "None recorded."));
            })), "full" === sp.tier && (L.push("", "APPENDIX — PER-TOPIC DETAIL", "", "Warm-up", ...list(g.warmup, "Agree on a gentle start together."), "", "Main play", ...list(g.main, "No shared green/green main-play topic is recorded."), "", "Aftercare ideas from rated profiles", ...list(g.aftercare, "No shared aftercare topic is recorded."), "", `${sxMarkLabel("fantasyonly").label} — excluded from practical ${sxIsVanillaSkin() ? "plans" : "play"}`, ...list(g.fantasy, `No ${sxMarkLabel("fantasyonly").label.toLowerCase().replace(" ", "-")} topics are in the shared pool.`), "", "Teasers — soft no revisited at the current Heat (flagged; teaser-eligible only, never a match)", ...list(g.teasers, "No soft-no topics are teaser-eligible at the current settings."))), L.push("", "End of negotiation guide.");
            const doc = L.join("\n"), panel = e.byId("negotiationPanel");
            return panel && (panel.dataset.negotiationGuide = doc, panel.dataset.negotiationLength = sp.label, panel.dataset.negotiationDetail = sp.tier), doc;
        }
        // Scene Setter shared handler pieces (refactor F3): the full
        // play-guide prompt text (stored copy document plus the phase
        // and details sections), and the freshness step every
        // negotiation handler starts with - read the dialog's
        // participant ids and re-render the stored documents when a
        // pair is selected.
        function playGuidePromptText() {
            const t = e.byId("negotiationPanel"), x = [ setterPhaseSection(), setterDetailsSection() ].filter(Boolean).join("\n");
            return (t?.dataset.copy || "") + (x ? "\n" + x : "") + "\n\n" + (sxSetterIsModeration() ? SX_DISCUSSION_PLAN_FORMAT : SX_PLAY_GUIDE_FORMAT);
        }
        window.__sxPlayGuidePromptText = playGuidePromptText;
        const SX_DISCUSSION_PLAN_FORMAT = [ "STRUCTURED DISCUSSION PLAN FORMAT — REQUIRED", "End your answer with a timed discussion plan in EXACTLY this format, so Scene Sentinel can read it back and run its timers. One step per line, every line in this shape:", "[MM:SS-MM:SS] Activity name — what happens in this step, in one or two sentences.", "Rules: (1) Time codes are elapsed time from the start of the discussion, zero-based: the first step starts at 00:00, steps run back to back with no gaps or overlaps, and the last step ends at the planned discussion length. Use MM:SS under an hour, H:MM:SS over an hour. (2) The activity name MUST be one of this fixed set, spelled exactly: Opening; Position statements; Rebuttal; Cross-examination; Synthesis; Closing; Other. Put anything else in the guidance after the dash, never in the activity name. (3) End with a Synthesis or Closing step. (4) After the timed steps, add one line: CHECK-IN EVERY: N MINUTES, with N between 1 and 15, so the app knows how often to pulse the watch for a check-in. (5) Keep the timed plan as plain lines — no tables, no bullet markers, no extra time formats anywhere else in the plan.", "Example:", "[00:00-05:00] Opening — Each side states its position in two minutes, uninterrupted.", "[05:00-20:00] Position statements — The strongest form of each position, with its reasons.", "[20:00-25:00] Synthesis — Where the positions agree, where they part, and what follows.", "CHECK-IN EVERY: 5 MINUTES" ].join("\n");
        const SX_PLAY_GUIDE_FORMAT = [ "STRUCTURED PLAY GUIDE FORMAT — REQUIRED (Scene Sentinel Way B standard, guide-1106-0847)", "End your answer with a timed play guide in EXACTLY this format, so Scene Sentinel can read it back and run its timers. One step per line, every line in this shape:", "[MM:SS-MM:SS] Activity name — what happens in this step, in one or two sentences.", "Rules: (1) Time codes are elapsed time from the start of the scene, zero-based: the first step starts at 00:00, steps run back to back with no gaps or overlaps, and the last step ends at the planned scene length. Use MM:SS under an hour, H:MM:SS over an hour. (2) The activity name MUST be one of this fixed set, spelled exactly: Warm-up; Negotiation check; Bondage; Impact play; Sensation play; Teasing & denial; Oral; Manual stimulation; Penetrative sex; Orgasm control; Roleplay; Service; Worship; Free play; Aftercare; Other. Put anything else in the guidance after the dash, never in the activity name. (3) End with an Aftercare step. (4) After the timed steps, add one line: CHECK-IN EVERY: N MINUTES, with N between 1 and 15, so the app knows how often to pulse the watch for a check-in. (5) Keep the timed guide as plain lines — no tables, no bullet markers, no extra time formats anywhere else in the guide.", "Example:", "[00:00-05:00] Warm-up — Slow massage and teasing, building touch gradually.", "[05:00-20:00] Impact play — Flogging, starting light and checking in before building.", "[20:00-25:00] Aftercare — Water, blanket, quiet cuddling.", "CHECK-IN EVERY: 5 MINUTES" ].join("\n");

        // Negotiation guide BYOK prompts (2026-11-28, queue item 54).
        // Tone split (Jason, 2026-11-28): the written guide and the
        // readable version are the binding record - DRY AND PRECISE,
        // plain language, never playful, no softening of limits. The
        // discussion plan is the conversation - warm and playful is
        // allowed there, because the negotiation conversation can be
        // part of foreplay - but its limits, safewords and stop
        // signals stay crisp and unambiguous. The e-signature form
        // signs the dry, precise written guide; nothing signed is
        // warmed up. The deterministic negotiation guide document
        // itself (sxStoreNegotiationGuide) is untouched.
        const SX_NEGOTIATION_DISCUSSION_FORMAT = [ "STRUCTURED NEGOTIATION DISCUSSION PLAN FORMAT — REQUIRED", "End your answer with a timed discussion plan in EXACTLY this format. One step per line, every line in this shape:", "[MM:SS-MM:SS] Step name — what happens in this step, in one or two sentences: who raises it, what gets decided.", "Rules: (1) Time codes are elapsed time from the start of the conversation, zero-based: the first step starts at 00:00, steps run back to back with no gaps or overlaps, and the last step ends at the planned conversation length. Use MM:SS under an hour, H:MM:SS over an hour. (2) The step name MUST be one of this fixed set, spelled exactly: Opening; Check-ins & safewords; Limits & hard exclusions; What each person wants & likes; Discuss-first clashes; Warm-up agreement; Main-play agreement; Aftercare agreement; Closing & signatures; Other. Put anything else in the guidance after the dash, never in the step name. (3) End with a Closing & signatures step. (4) Keep the timed plan as plain lines — no tables, no bullet markers, no extra time formats anywhere else in the plan.", "Example:", "[00:00-05:00] Opening — Each person says what they want from this conversation, uninterrupted.", "[05:00-10:00] Check-ins & safewords — Agree the safewords and the nonverbal stop signal, and what “pause” means.", "[10:00-18:00] What each person wants & likes — Each person says what they want, what they like, and how they like to be touched, in detail.", "[18:00-25:00] Discuss-first clashes — Talk through each green-versus-red clash as an open question, never as assumed consent.", "[25:00-30:00] Closing & signatures — Read the agreement back, confirm it, and sign." ].join("\n");
        function negotiationDiscussionPlanPromptText() {
            const ids = setterParticipantIds(), t = e.byId("negotiationPanel"), guide = (t && t.dataset.negotiationGuide) || "", mod = sxSetterIsModeration(), data = ids.length >= 2 ? sxSceneNegotiationData(ids) : null, parts = [ mod ? "AI DISCUSSION-PLAN REQUEST — FROM THE DISCUSSION AGREEMENT" : "AI NEGOTIATION DISCUSSION-PLAN REQUEST", mod ? "Write a structured discussion plan for the verbal negotiation between the participants below, using the completed agreement and the ground rules as its binding layer. Give each side its strongest form before comparing, and never let one side speak for the other." : "Write a structured discussion plan for the verbal negotiation between the participants below, using the completed agreement as its binding layer. Structure it like a pre-scene interview — the sit-down talk where each person says what they want, what they like, their limits, and how they like to be touched — but make it detailed and purposeful, a real thorough conversation, not a shallow or performative chat. Cover what each person wants, likes, limits, preferences, and how things should be done, in what order. The conversation itself may be warm and playful — it can be part of foreplay — but the limits, safewords, and stop signals in the plan must stay crisp and unambiguous: state them exactly as agreed, never soften them, never blur them." ];
            if (guide) parts.push("", "THE AGREEMENT (binding — do not contradict it):", "", guide);
            if (data) {
                const roles = sxRolesBlock(data.ids, data.names), cast = sxCastBlock(data.ids, data.names), terms = sxTermsBlock(data.ids, data.names);
                roles && parts.push("", roles), cast && parts.push("", cast), terms && parts.push("", terms);
                const hardExcluded = [ ...new Set((data.excluded || []).concat(data.mutuals || [])) ];
                parts.push("", (sxIsVanillaSkin() ? "RED-LINE-EXCLUDED" : "HARD-EXCLUDED") + " — never in the plan, never suggested: " + (hardExcluded.length ? hardExcluded.map(x => `- ${x}`).join(" ") : "none marked"));
                parts.push("", "DISCUSS FIRST — GREEN / RED CLASHES (each one is an explicit negotiation point in the plan — an open question to talk through, never assumed consent, never a planned action): " + (data.discuss.length ? data.discuss.map(x => `- ${x}`).join(" ") : "none found"));
                data.safewords && parts.push("", "SAFEWORDS + STOP SIGNALS (state exactly as agreed): " + data.safewords);
            }
            if (mod) {
                if (ids.length >= 2) {
                    const m = sxSetterModerationData(ids);
                    parts.push("", sxGroundRulesBlock(m));
                }
                parts.push("", "Write the complete, timed discussion plan now in the EXACT required format specified above.");
                return parts.join(" ") + "\n\n" + SX_DISCUSSION_PLAN_FORMAT;
            }
            parts.push("", "Write the complete, timed negotiation discussion plan now in the EXACT required format specified above.");
            return parts.join(" ") + "\n\n" + SX_NEGOTIATION_DISCUSSION_FORMAT;
        }
        window.__sxNegotiationDiscussionPlanPromptText = negotiationDiscussionPlanPromptText;
        function negotiationReadablePromptText() {
            const ids = setterParticipantIds(), t = e.byId("negotiationPanel"), guide = (t && t.dataset.negotiationGuide) || "", mod = sxSetterIsModeration(), data = ids.length >= 2 ? sxSceneNegotiationData(ids) : null, parts = [ mod ? "AI READABLE DISCUSSION-AGREEMENT REQUEST" : "AI READABLE NEGOTIATION-GUIDE REQUEST", "Rewrite the agreement below as a polished, plain-language version that any participant can read and understand at a glance. This is the binding record — once signed, it is the nearest thing to a binding record there is — so write it DRY AND PRECISE: clear, unambiguous, complete, faithful to the checklist. Use plain language, not playful or spicy language. Do not soften, blur, or reword any limit, safeword, stop signal, or exclusion. Do not invent terms, activities, or agreements that are not in the checklist. Hard-excluded topics stay out entirely. If a field is not filled out, say so plainly instead of inventing an answer." ];
            if (guide) parts.push("", "THE AGREEMENT (binding source — rewrite this, do not contradict it):", "", guide);
            if (data) {
                const terms = sxTermsBlock(data.ids, data.names);
                terms && parts.push("", terms);
                const hardExcluded = [ ...new Set((data.excluded || []).concat(data.mutuals || [])) ];
                parts.push("", (sxIsVanillaSkin() ? "RED-LINE-EXCLUDED" : "HARD-EXCLUDED") + " (leave out of the readable version entirely): " + (hardExcluded.length ? hardExcluded.map(x => `- ${x}`).join(" ") : "none marked"));
            }
            parts.push("", "End with a short SIGNATURES section listing each participant by name with a line to sign and date.");
            return parts.join(" ");
        }
        window.__sxNegotiationReadablePromptText = negotiationReadablePromptText;
        function setterParticipantIds() {
            const ids = String(e.byId("negotiationDialog")?.dataset.participants || "").split(",").filter(Boolean);
            return ids.length >= 2 && sxStoreSceneGuide(ids), ids;
        }
        window.__sxSetterParticipantIds = setterParticipantIds;
        // Scene Setter discussion moderation (2026-11-16): on a
        // vanilla stance/belief skin, Scene Setter moderates a
        // discussion between the stances - it is NOT a play checklist.
        // The moderation prompt is built from the selected profiles'
        // actual pole stances (the same pole-aware readers Scribe
        // uses), with the ground rules as its binding layer and the
        // discussion data as inspiration. The Sexcapades play-guide
        // path below is untouched.
        function sxSetterModerationData(ids) {
            // The shared ground for the Scene Setter's own participant
            // ids - unlike sxScribeMatchData, which reads the Scribe
            // dialog's lead/partner for pairs. The heat/veil settings
            // are the same ones Iu() passes, so the shared ground
            // matches the discussion data below.
            const sxSettings = Object.fromEntries(ids.map(id => [ id, { heat: sxHeatFor(id), veil: sxVeilFor(id) } ])),
                match = ids.length > 2 ? sxMultiMatchData(ids, sxSettings) : sxCastMatchData(ids[0], ids[1], sxSettings),
                established = match.established || [], curious = match.curious || [];
            // Agreement split (the ruled comparison runs 100 =
            // identical stances, 0 = opposite on every pole): a shared
            // topic is "where they agree" at 50% or above, "where they
            // part" below 50%. A topic with no agreement field (a
            // single-profile or unrated entry) counts as agreed - it
            // is in the shared pool, not a disagreement.
            return {
                ids, names: ids.map(id => sxCastNameText(id)),
                established, curious,
                agree: established.filter(e => null == e.agreement || e.agreement * 100 >= 50),
                part: established.filter(e => null != e.agreement && e.agreement * 100 < 50),
                perPerson: ids.map(id => sxSingleProfileData(id))
            };
        }
        function sxGroundRulesBlock(mod) {
            const spec = window.__SX_SETTER || null,
                rules = (spec && Array.isArray(spec.groundRules)) ? spec.groundRules : [],
                // Research WHY appended after the detail, exactly as
                // the Scribe discussion composer does - the moderator
                // and the on-screen panel both see the reasons.
                fmt = e => `- ${e.label} (${Math.round(e.score)}%${null != e.agreement ? `; agreement ${Math.round(e.agreement * 100)}%` : ""}): ${e.detail || ""}${sxTopicResearchText(e.id, mod.ids)}`,
                lines = [ `GROUND RULES — BINDING — ${mod.names.join(" + ")}` ];
            // Each side's anchor stances: the strongest recorded
            // positions per profile, so the moderator knows what each
            // side stands on. Capped at five per profile - the shared
            // ground below carries the full overlap.
            mod.perPerson.forEach((p, i) => {
                const top = (p.established || []).slice().sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 5);
                lines.push("", `${mod.names[i]} — STRONGEST RECORDED STANCES`, ...(top.length ? top.map(e => `- ${e.label} (${Math.round(e.score)}%): ${e.detail || ""}${sxTopicResearchText(e.id, mod.ids)}`) : [ "- No established stance recorded." ]));
            });
            lines.push("", "WHERE THEY AGREE", ...(mod.agree.length ? mod.agree.map(fmt) : [ "- No shared established stance." ]));
            lines.push("", "WHERE THEY PART", ...(mod.part.length ? mod.part.map(fmt) : [ "- No shared established stance where they part." ]));
            lines.push("", "GROUND RULES", ...(rules.length ? rules.map(r => `- ${r}`) : [ "- Steelman every position: state each side in its strongest form before comparing." ]));
            return lines.join(" ");
        }
        function sxDiscussionDataBlock(e) {
            // The discussion source material: the same phase-grouped
            // shared topics Iu() computes, relabelled Opening /
            // Development / Closing. The fantasy/teasers groups are
            // Sexcapades concepts; they are included only if
            // non-empty, under neutral labels.
            return [ "DISCUSSION DATA — SOURCE MATERIAL", "Opening", ...e.warmup.length ? e.warmup.map(x => `- ${x}`) : [ "- Agree on a gentle opening together." ], "Development", ...e.main.length ? e.main.map(x => `- ${x}`) : [ "- No shared development topic is recorded." ], "Closing", ...e.aftercare.length ? e.aftercare.map(x => `- ${x}`) : [ "- No shared closing topic is recorded." ], ...(e.fantasy && e.fantasy.length ? [ "Excluded from the discussion", ...e.fantasy.map(x => `- ${x}`) ] : []), ...(e.teasers && e.teasers.length ? [ "Flagged — revisit only after an explicit check-in", ...e.teasers.map(x => `- ${x}`) ] : []) ].join(" ");
        }
        function sxComposeSetterModeration(ids, iuData, mod) {
            const spec = window.__SX_SETTER || null, pr = (spec && spec.prompt) || {};
            const opening = pr.opening || "Write a moderated discussion plan for the stances recorded on this map.";
            const rules = Array.isArray(pr.rules) ? pr.rules : [];
            const rigor = pr.rigor || "";
            // The detail level is the depth control (the Setter dialog
            // has no Depth slider): "detailed" turns the plan into
            // dissertation-defense material, gated on the JSON's rigor
            // text - the same rule Scribe uses for its Depth-5 line.
            const i = sxSceneCastPrefs(ids), a = `${i.length || "5"} ${unitWord(i.length || "5", i.lengthUnit)}`,
                detailLine = "concise" === i.detail ? "Concise: use short phase notes and only essential check-ins." : "detailed" === i.detail ? "High detail: include specific phase timing, transitions, turn-taking, check-ins, and closing synthesis." : "Balanced detail: include enough timing, transitions, turn-taking, and check-ins to follow without over-scripting.",
                rigorLine = "detailed" === i.detail && rigor ? rigor : "";
            // The stance lists, with each topic's pole detail and the
            // pair agreement - the same fmtStance the Scribe discussion
            // composer uses. The cast is by name only: gender,
            // orientation, and give/receive roles are Sexcapades data
            // and have no meaning for a stance map. The research WHY
            // is appended after the detail, exactly as the Scribe does
            // (sxTopicResearchText, 05b2) - reasons + a real statistic
            // + what would move a holder, for poles the cast holds;
            // "" when the topic carries no research, so nothing is
            // invented and an unresearched stance is unchanged.
            const fmtStance = e => `- ${e.label} (${Math.round(e.score)}%${null != e.agreement ? `; agreement ${Math.round(e.agreement * 100)}%` : ""}): ${e.detail || ""}${sxTopicResearchText(e.id, mod.ids)}`,
                stanceDetail = `ESTABLISHED STANCES: ${mod.established.map(fmtStance).join(" ") || "none recorded"}. CURIOUS STANCES: ${mod.curious.map(fmtStance).join(" ") || "none recorded"}.`;
            return [ "AI MODERATION-PLAN REQUEST", `${opening} targeting approximately ${a}. ${detailLine} Use DISCUSSION DATA as inspiration while treating GROUND RULES as binding. Give each side its strongest form before comparing, and never let one side speak for the other. Use only the named topics below as the positions in the discussion. Do not invent positions, sources, or facts beyond the supplied data. If a field is not filled out, leave a clear pre-discussion decision point instead of inventing an answer.`, "", `CAST: ${mod.names.join(" + ")} (by name only)`, "", `STANCE DETAIL: ${stanceDetail}`, "", sxDiscussionDataBlock(iuData), "", sxGroundRulesBlock(mod), "", sxTermsBlock(mod.ids, mod.names), "", `${sxIsVanillaSkin() ? "RED-LINE-EXCLUDED" : "HARD-EXCLUDED"} FROM DISCUSSION ${iuData.excluded.length ? iuData.excluded.map(x => `- ${x}`).join(" ") : iuData.mutuals.length ? "- no marked red lines; mutual deep-red exclusions follow" : iuData.terms && iuData.terms.some(Boolean) ? "- no marked red lines or mutual deep-red exclusions; red lines named in the Terms above still apply" : "- none marked"}${iuData.mutuals.length ? ` MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED ${iuData.mutuals.map(x => `- ${x}`).join(" ")}` : ""}`, "", "Rules:", ...rules.map(r => `- ${r}`), rigorLine ? `- ${rigorLine}` : "" ].join(" ");
        }
        function sxStoreDiscussionAgreement(ids, iuData, mod) {
            // The vanilla branch of sxStoreNegotiationGuide: a
            // discussion agreement, not a negotiation guide. CAST by
            // name only (no gender/orientation/roles - Sexcapades
            // data); per-person stances, the shared ground split by
            // agreement, the ground rules, and the discussion data.
            // Tier-gated detail mirrors the negotiation guide's tiers,
            // without the aftercare mention - there is no aftercare on
            // a stance map.
            const st = sxSceneCastPrefs(ids), sp = sxNegotiationLengthSpec(st),
                list = (items, empty) => items && items.length ? items.map(x => `- ${x}`) : [ `- ${empty}` ],
                L = [ "DISCUSSION AGREEMENT", mod.names.join(" + "), sxWriterStamp(ids), `Target length: ${sp.label} · Detail: ${sp.tierLabel}`, "This document records the completed ground rules as the agreement itself. A hypermap match is not agreement." ];
            L.push("", "CAST", ...mod.names.map(n => `- ${n}`));
            mod.perPerson.forEach((p, i) => {
                const top = (p.established || []).slice().sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 10);
                // Research WHY appended after the detail, exactly as
                // the Scribe discussion composer does - the stored
                // agreement carries the reasons for the humans who meet.
                L.push("", `${mod.names[i]} — RECORDED STANCES`, ...(top.length ? top.map(e => `- ${e.label} (${Math.round(e.score)}%): ${e.detail || ""}${sxTopicResearchText(e.id, mod.ids)}`) : [ "- No established stance recorded." ]));
                const cur = p.curious || [];
                L.push("", `${mod.names[i]} — CURIOUS ABOUT`, ...(cur.length ? cur.slice(0, 5).map(e => `- ${e.label} (${Math.round(e.score)}%): ${e.detail || ""}${sxTopicResearchText(e.id, mod.ids)}`) : [ "- None recorded." ]));
            });
            L.push("", "WHERE THEY AGREE", ...list(mod.agree.map(e => `${e.label} (${Math.round(e.score)}%; agreement ${Math.round((null == e.agreement ? 1 : e.agreement) * 100)}%)`), "No shared established stance."));
            L.push("", "WHERE THEY PART", ...list(mod.part.map(e => `${e.label} (${Math.round(e.score)}%; agreement ${Math.round((null == e.agreement ? 1 : e.agreement) * 100)}%)`), "No shared established stance where they part."));
            const spec = window.__SX_SETTER || null, rules = (spec && Array.isArray(spec.groundRules)) ? spec.groundRules : [];
            L.push("", "GROUND RULES", ...list(rules, "Steelman every position: state each side in its strongest form before comparing."));
            L.push("", "DISCUSSION DATA", "", "Opening", ...list(iuData.warmup, "Agree on a gentle opening together."), "", "Development", ...list(iuData.main, "No shared development topic is recorded."), "", "Closing", ...list(iuData.aftercare, "No shared closing topic is recorded."));
            if ("compact" === sp.tier) {
                L.push("", "PER-TOPIC DETAIL — FOLDED AT THIS LENGTH", `- Topic detail folded: ${iuData.warmup.length} opening, ${iuData.main.length} development, and ${iuData.aftercare.length} closing ideas are recorded.`);
            } else {
                L.push("", "PER-TOPIC DETAIL — SHARED GROUND", "", "Where they agree", ...list(mod.agree.map(e => `- ${e.label}: ${e.detail || ""}${sxTopicResearchText(e.id, mod.ids)}`), "None."), "", "Where they part", ...list(mod.part.map(e => `- ${e.label}: ${e.detail || ""}${sxTopicResearchText(e.id, mod.ids)}`), "None."));
            }
            if ("full" === sp.tier) {
                L.push("", "APPENDIX — PER-TOPIC DETAIL", "", "Opening", ...list(iuData.warmup, "Agree on a gentle opening together."), "", "Development", ...list(iuData.main, "No shared development topic is recorded."), "", "Closing", ...list(iuData.aftercare, "No shared closing topic is recorded."));
            }
            L.push("", "End of discussion agreement.");
            const doc = L.join("\n"), panel = e.byId("negotiationPanel");
            return panel && (panel.dataset.negotiationGuide = doc, panel.dataset.negotiationLength = sp.label, panel.dataset.negotiationDetail = sp.tier), doc;
        }
        function sxSkinDownloadPrefix() {
            // Download filename prefix: the active skin's display name
            // (Quantacapades, Poliscapades, …) - derived from the skin
            // key, so a vanilla download is not mislabelled Sexcapades.
            const key = String(window.__SX_ACTIVE_SKIN || "sexcapades"), base = key.replace(/capades$/, "");
            return base.charAt(0).toUpperCase() + base.slice(1) + "capades";
        }
        function sxSetterModerationPanelHtml(i, mod) {
            // The on-screen Scene Setter panel for a moderation skin:
            // the ground rules (shared ground + per-person stances +
            // the six rules) and the discussion source material. No
            // safeword or aftercare inputs - there are none on a stance
            // map, so the input listener that saves them is not
            // attached (06d). Called from the dialog's open handler.
            const spec = window.__SX_SETTER || null,
                rules = (spec && Array.isArray(spec.groundRules)) ? spec.groundRules : [];
            return `<p class="sx-stamp">${sxEscapeHtmlText(sxWriterStamp(i.ids))}</p><section class="guide-block"><h4>Ground rules</h4><p class="guide-source-intro">The ground rules below are the binding layer for the discussion plan. The shared ground and the per-person stances come from the selected profiles' recorded ratings.</p><h5>Where they agree</h5><ul>${sxListItemMarkup(mod.agree.map(e => null == e.agreement ? e.label : `${e.label} — ${Math.round(e.agreement * 100)}% agreement`), "No shared established stance.")}</ul><h5>Where they part</h5><ul>${sxListItemMarkup(mod.part.map(e => `${e.label} — ${Math.round(e.agreement * 100)}% agreement`), "No shared established stance where they part.")}</ul>${mod.perPerson.map((p, pi) => `<strong>${sxEscapeHtmlText(mod.names[pi])}</strong><ul>${sxListItemMarkup((p.established || []).slice().sort((x, y) => Math.abs(y.score) - Math.abs(x.score)).slice(0, 5).map(e => `${e.label} (${Math.round(e.score)}%)`), "No established stance recorded.")}</ul>`).join("")}<h5>Ground rules</h5><ul>${sxListItemMarkup(rules, "Steelman every position: state each side in its strongest form before comparing.")}</ul></section><section class="guide-block"><h4>Discussion source material</h4><p class="guide-source-intro">This is the profile-derived idea pool the AI may arrange into a plan. It is not an agreement: the ground rules above are the binding layer.</p><div class="guide-source-grid"><div class="guide-source-group"><h5>Opening ideas</h5><ul>${sxListItemMarkup(i.warmup, "Agree on a gentle opening together.")}</ul></div><div class="guide-source-group"><h5>Development ideas</h5><ul>${sxListItemMarkup(i.main, "No shared development topic is recorded.")}</ul></div><div class="guide-source-group"><h5>Closing ideas</h5><ul>${sxListItemMarkup(i.aftercare, "No shared closing topic is recorded.")}</ul></div><div class="guide-source-group"><h5>${sxIsVanillaSkin() ? "Red-line-excluded" : "Hard-excluded"}</h5><ul>${sxListItemMarkup([ ...new Set(i.excluded.concat(i.mutuals)) ].concat(i.names.map((e, t) => i.terms[t] ? e + ` — ${sxIsVanillaSkin() ? "red lines" : "hard limits"} named in Terms (binding), quoted above` : "").filter(Boolean)), "None marked.")}</ul></div></div></section>`;
        }
        // Draft data computed once per open (writers refactor): the
        // open handler hands Fu the Iu() result it already computed
        // for the on-screen panel, instead of Fu recomputing the
        // full match a second time to rebuild the same documents.
        // Other callers pass nothing and Fu computes it, as before.
        function sxStoreSceneGuide(t, precomputed, precomputedMod) {
            // Moderation branch (2026-11-16): on a vanilla skin the
            // stored documents are a discussion-moderation plan + a
            // discussion agreement, built from the pole stances. The
            // Sexcapades play-guide path below is untouched.
            if (sxSetterIsModeration()) {
                const iuData = precomputed || sxSceneNegotiationData(t),
                    mod = precomputedMod || sxSetterModerationData(t),
                    copy = sxComposeSetterModeration(t, iuData, mod);
                e.byId("negotiationPanel").dataset.copy = copy;
                e.byId("negotiationPanel").dataset.playGuide = copy;
                sxStoreDiscussionAgreement(t, iuData, mod);
                return;
            }
            var n;
            const i = sxSceneCastPrefs(t), a = `${i.length || "5"} ${unitWord(i.length || "5", i.lengthUnit)}`, r = "concise" === i.detail ? "Concise: use short phase notes and only essential check-ins." : "detailed" === i.detail ? "High detail: include specific phase timing, transitions, role cues, check-ins, stop options, and aftercare steps." : "Balanced detail: include enough timing, transitions, role cues, check-ins, and aftercare to follow without over-scripting.";
            e.byId("negotiationPanel").dataset.copy = [ "AI PLAY-GUIDE REQUEST", `Create or randomize a practical play guide targeting approximately ${a}. ${r} Use PLAY GUIDE DATA as inspiration while treating NEGOTIATION CHECKLIST DATA as binding. Keep every hard limit completely out. Treat every red topic as a no for that person. Mention each discuss-first clash only as an explicit negotiation point, never as assumed consent or planned action. Work the agreed safewords and stop signals naturally into the guide, and build the aftercare section from every participant’s stated aftercare needs. If a field is not filled out, leave a clear pre-scene decision point instead of inventing an answer.`, "", sxPlayGuideSourceText(n = precomputed || sxSceneNegotiationData(t)), "", sxNegotiationChecklistText(n), "", sxRolesBlock(n.ids, n.names), "", sxCastBlock(n.ids, n.names), "", sxTermsBlock(n.ids, n.names), "", sxAgeBlock(n.ids, n.names), "", `HARD-EXCLUDED FROM SCENE GENERATION ${n.excluded.length ? n.excluded.map(e => `- ${e}`).join(" ") : n.mutuals.length ? "- no marked limits; mutual deep-red exclusions follow" : n.terms && n.terms.some(Boolean) ? "- no marked limits or mutual deep-red exclusions; limits named in the Terms above still apply" : "- none marked"}${n.mutuals.length ? ` MUTUAL EXCLUSIONS — BOTH PARTNERS RATED DEEP-RED ${n.mutuals.map(e => `- ${e}`).join(" ")}` : ""}` ].join(" "), e.byId("negotiationPanel").dataset.playGuide = e.byId("negotiationPanel").dataset.copy, sxStoreNegotiationGuide(n);
        }
