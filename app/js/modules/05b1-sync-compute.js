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
                       Parlay KF fit = the max positive straight fit
                       over all member pairs. A same-flank split is
                       circle minus only, so a negative product never
                       raises the talk and never counts as its ground.
                       Parlay MS binary fit per member = 1 per
                       direction type (give-give / receive-receive) in
                       which any pair involving that member has a
                       positive straight term above epsilon, epsilon
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
                        [ sxPositiveFlank(sr.giveGive), sxPositiveFlank(sr.recvRecv) ].forEach(f => { if (null != f && (null == pMaxFit || f > pMaxFit)) pMaxFit = f; });
                    });
                    rec.parlayKFEntry = null == pMaxFit ? 0 : pMaxFit / 100 * pGm;
                    const pCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            if (pr.i !== pi && pr.j !== pi) return;
                            const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                            if (!sr) return;
                            if ((sxPositiveFlank(sr.giveGive) || 0) > sxGroupEps) giveFit = !0;
                            if ((sxPositiveFlank(sr.recvRecv) || 0) > sxGroupEps) recvFit = !0;
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxParlayTableFlags(gTd[pi]) : 0);
                    }), pCMax = Math.max(...pCs);
                    rec.parlayMSEntry = pCMax > 0 ? sxPlayGeoMean(pCs.map(v => v / pCMax)) : 0;
                    // Circle minus for a give/receive topic: the same
                    // Parlay shape, counting only the negative same-flank
                    // products (one person for it, the other against it)
                    // and keeping them as positive magnitudes.
                    let dMaxFit = null;
                    pairs.forEach(pr => {
                        const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                        if (!sr) return;
                        [ sxSplitMagnitude(sr.giveGive), sxSplitMagnitude(sr.recvRecv) ].forEach(f => { if (null != f && (null == dMaxFit || f > dMaxFit)) dMaxFit = f; });
                    });
                    rec.debateKFEntry = null == dMaxFit ? 0 : dMaxFit / 100 * pGm;
                    const dCs = profiles.map((p2, pi) => {
                        let giveFit = !1, recvFit = !1;
                        pairs.forEach(pr => {
                            if (pr.i !== pi && pr.j !== pi) return;
                            const sr = pr.straight && pr.straight.byId ? pr.straight.byId[id] : null;
                            if (!sr) return;
                            if ((sxSplitMagnitude(sr.giveGive) || 0) > 0) giveFit = !0;
                            if ((sxSplitMagnitude(sr.recvRecv) || 0) > 0) recvFit = !0;
                        });
                        return (giveFit ? 1 : 0) + (recvFit ? 1 : 0) + (gTd[pi] ? sxParlayTableFlags(gTd[pi]) : 0);
                    }), dCMax = Math.max(...dCs);
                    rec.debateMSEntry = dCMax > 0 ? sxPlayGeoMean(dCs.map(v => v / dCMax)) : 0;
                    // A pair keeps its own complement. A cast of three or
                    // more is scored as one combo: cross counts only when
                    // every pole has its own person, straight only when
                    // every person leans the same pole. The best pair no
                    // longer stands in for the group.
                    const poleMembers = [];
                    if (profiles.length >= 3) gTd.forEach((d, pi) => {
                        if (d && d.polesKnown) poleMembers.push({ poles: d.poles, intensity: d.intensity, heat: (opts.heat || [])[pi] || 0 });
                    });
                    if (poleMembers.length >= 3) {
                        const gRole = sxGroupRoleScore(poleMembers, meta);
                        const playWeight = gRole.aversion || gRole.opposed ? 0 : gRole.factor;
                        const talkWeight = gRole.opposed ? 0 : gRole.factor;
                        rec.roleStraight = gRole.straight;
                        rec.roleCross = gRole.cross;
                        rec.roleEnemy = gRole.enemy;
                        rec.sharedAversion = gRole.aversion;
                        rec.playKFEntry = gRole.cross * playWeight;
                        rec.playMSEntry = gRole.cross * playWeight;
                        rec.parlayKFEntry = gRole.straight * talkWeight;
                        rec.parlayMSEntry = gRole.straight * talkWeight;
                        rec.debateKFEntry = gRole.enemy * gRole.debate;
                        rec.debateMSEntry = gRole.enemy;
                        const strong = poleMembers.every(m => m.intensity > sxClamp(35 - m.heat, 0, 85));
                        if (gRole.aversion || gRole.opposed || !(playWeight > 0) || !(gRole.cross > 0)) rec.playOutcome = "mismatched";
                        else {
                            rec.playOutcome = strong && gRole.cross >= .5 ? "match" : "curious-fit";
                            rec.strength = Math.round(gRole.cross * playWeight * 100);
                        }
                    }
                    /* Line topics in a cast: no flanks and no poles,
                       so every construction above leaves their entries
                       at zero. Score the cast as one combo on the line
                       itself, in the pair entries' own shapes:
                       agreement from the holders' span (the pair
                       formula's n-holder form, 1 - span / 200),
                       relevance capped by the least-caring holder (a
                       stored intensity where one is carried, else the
                       stance's own size), feud from the strongest
                       holders on opposite sides of zero. Shared
                       aversion zeroes Play, opposed relevance zeroes
                       Parlay, exactly as for poles. */
                    const lineMembers = [];
                    gTd.forEach((d, pi) => {
                        if (d && d.lineKnown) lineMembers.push(d);
                    });
                    if (lineMembers.length >= 2) {
                        const lVals = lineMembers.map(d => d.line),
                            lSpan = Math.max(...lVals) - Math.min(...lVals),
                            lAgree = Math.max(0, 1 - lSpan / 200),
                            lCares = lineMembers.map(d => null != d.intensity ? d.intensity : Math.abs(d.line)),
                            lFactor = Math.min(...lCares.map(v => Math.abs(v))) / 100,
                            lAllStored = lineMembers.every(d => d.intensityKnown),
                            lAllNeg = lineMembers.every(d => d.intensityKnown && d.intensity < 0),
                            lOpposed = lineMembers.some(d => d.intensityKnown && d.intensity < 0) && lineMembers.some(d => d.intensityKnown && d.intensity > 0),
                            lPosMax = Math.max(0, ...lVals), lNegMag = Math.max(0, ...lVals.map(v => -v)),
                            lFeud = lPosMax * lNegMag / 10000,
                            lDebate = sxDebateFactor(lCares);
                        rec.lineAgreement = lAgree;
                        rec.lineFeud = lFeud;
                        rec.playKFEntry = lAgree * (lAllNeg ? 0 : lFactor);
                        rec.playMSEntry = lAgree * (lAllStored ? (lAllNeg ? 0 : lFactor) : 1);
                        rec.parlayKFEntry = lAgree * (lOpposed ? 0 : lFactor);
                        rec.parlayMSEntry = lAgree * (lOpposed ? 0 : lFactor);
                        rec.debateKFEntry = lFeud * lDebate;
                        rec.debateMSEntry = lFeud;
                    }
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
                    label: sxTerm("playMS"),
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
                    label: sxTerm("playKF"),
                    lists: {
                        counted: gCounted.sort(byLabel),
                        limits: topics.filter(r => r.groupLimited).sort(byLabel)
                    }
                };
            conversation.headlineText = sxHeadlineText(conversation.kinkFactor, kfAggG.counted, kfAggG.considered);
            const parlay = {
                considered: msParlayAggG.considered, counted: msParlayAggG.counted,
                headline: msParlayAggG.pct, kinkFactor: kfParlayAggG.pct,
                label: sxTerm("parlayMS"), kfLabel: sxTerm("parlayKF"),
                lists: {
                    limits: topics.filter(r => r.groupLimited).sort(byLabel)
                }
            };
            parlay.headlineText = sxHeadlineText(parlay.headline, msParlayAggG.counted, msParlayAggG.considered);
            parlay.kfHeadlineText = sxHeadlineText(parlay.kinkFactor, kfParlayAggG.counted, kfParlayAggG.considered);
            const msDebateAggG = sxPlayWeightedPct(topics, r => r.debateMSEntry, r => !r.groupLimited && r.groupSharedMajority),
                kfDebateAggG = sxPlayWeightedPct(topics, r => r.debateKFEntry, r => !r.groupLimited && r.groupSharedMajority),
                debate = {
                    considered: msDebateAggG.considered, counted: msDebateAggG.counted,
                    headline: msDebateAggG.pct, kinkFactor: kfDebateAggG.pct,
                    label: sxTerm("debateMS"), kfLabel: sxTerm("debateKF")
                };
            debate.headlineText = sxHeadlineText(debate.headline, msDebateAggG.counted, msDebateAggG.considered);
            debate.kfHeadlineText = sxHeadlineText(debate.kinkFactor, kfDebateAggG.counted, kfDebateAggG.considered);
            const hot = topics.filter(r => !r.groupLimited).map(r => ({
                id: r.id, label: r.label,
                score: pairs.reduce((sum, pr) => sum + (pr.topicsById[r.id] ? pr.topicsById[r.id].hotContribution : 0), 0)
            })).filter(r => r.score > 0).sort((x, y) => y.score - x.score || x.label.localeCompare(y.label));
            return {
                engine: "sync-1.1", pairs: pairs, topics: topics, topicsById: topicsById,
                play: play, conversation: conversation, parlay: parlay, debate: debate, hotTopics: hot, hotTopicsTop10: hot.slice(0, 10)
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
            else if (td.polesKnown || td.lineKnown) {
                // Multi-pole comparison (ruled 2026-11-16): Personal KF
                // is the largest absolute pole affinity, signed, ÷100;
                // the epsilon threshold applies to the largest absolute
                // pole affinity. (A line topic's strongest stance is
                // its scalar.)
                if (null != td.strongest && Math.abs(td.strongest) > e) flanks.push(td.strongest / 100);
            }
            else {
                if (td.raw.giveKnown && Math.abs(td.raw.give) > e) flanks.push(td.raw.give / 100);
                if (td.raw.receiveKnown && Math.abs(td.raw.receive) > e) flanks.push(td.raw.receive / 100);
                if (td.raw.advocacyKnown && td.raw.advocacyIntensityKnown && Math.abs(td.raw.advocacyIntensity) > e) flanks.push(td.raw.advocacyIntensity / 100);
                if (td.raw.receptivityKnown && td.raw.receptivityIntensityKnown && Math.abs(td.raw.receptivityIntensity) > e) flanks.push(td.raw.receptivityIntensity / 100);
            }
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
        // A positive same-flank product is talk. A negative one is
        // the argument. Both the pair rings and the group entries
        // read these, so a ruling about which product counts is
        // edited once.
        function sxPositiveFlank(product) {
            return null != product && product > 0 ? product / 100 : null;
        }
        function sxSplitMagnitude(product) {
            return null != product && product < 0 ? -product / 100 : null;
        }
        // The strongest argument on one shared straight-register
        // record, as a fraction 0-1 (ruled 2026-11-21: circle minus
        // is a measure, defined per pole as well as per flank, on
        // vanilla maps as well as Sexcapades). A stored enemy
        // overlap, a negative same-flank product, a line scalar
        // product across zero, and a same-pole sign split on a pole
        // vector all count; the topic's feud is the strongest of
        // them. No floor and no epsilon: the product grades itself,
        // so a −5 against a +5 is a feud of 0.0025 - formally a
        // debate topic, priced as nearly nothing. Declared once;
        // the pair rings, the minus adapter, and the minus tab's
        // buckets all read this.
        function sxDebateFeud(s) {
            let feud = 0;
            if (null != s.roleEnemy) feud = Math.max(feud, s.roleEnemy);
            [ sxSplitMagnitude(s.giveGive), sxSplitMagnitude(s.recvRecv) ].forEach(f => { if (null != f) feud = Math.max(feud, f / 100); });
            if (null != s.lineA && null != s.lineB) {
                const f = sxSplitMagnitude(s.lineA * s.lineB);
                if (null != f) feud = Math.max(feud, f / 100);
            }
            if (s.polesA && s.polesB) {
                const keys = [ ...new Set([ ...Object.keys(s.polesA), ...Object.keys(s.polesB) ]) ];
                keys.forEach(k => {
                    const va = k in s.polesA ? Number(s.polesA[k]) || 0 : 0, vb = k in s.polesB ? Number(s.polesB[k]) || 0 : 0,
                        f = sxSplitMagnitude(va * vb);
                    if (null != f) feud = Math.max(feud, f / 100);
                });
            }
            // Circle Minus unreceptivity feud signal (Spec Part 1.4):
            // Amplifies feud when both parties advocate and neither receives.
            if (s.advocacyA && s.advocacyB) {
                const advIntA = (s.advocacyA.intensity != null) ? s.advocacyA.intensity : (s.intensityA || 0);
                const advIntB = (s.advocacyB.intensity != null) ? s.advocacyB.intensity : (s.intensityB || 0);
                const recIntA = s.receptivityA && s.receptivityA.intensity != null ? s.receptivityA.intensity : null;
                const recIntB = s.receptivityB && s.receptivityB.intensity != null ? s.receptivityB.intensity : null;
                if (advIntA > 25 && advIntB > 25 && (recIntA == null || recIntA <= 0 || recIntB == null || recIntB <= 0)) {
                    const negBonus = (recIntA != null && recIntA < 0 ? 0.25 : 0.1) + (recIntB != null && recIntB < 0 ? 0.25 : 0.1);
                    const unrec = Math.min(1, (feud > 0 ? feud : 0.2) * (1 + negBonus));
                    s.unreceptivityFeud = unrec;
                    feud = Math.max(feud, unrec);
                }
            }
            return feud;
        }
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
               (unlike Play, where fantasy is out of considered).
               A same-flank split (one person for it, the other
               against it) belongs to circle minus only (Jason
               2026-11-19). The talk counts a positive product: a
               shared yes, or a shared no, since two noes multiply
               to an agreement. A topic that is only a split scores
               0 and stays in the denominator. No band counting is
               used in either number. This function is the pair
               path; group casts use the group construction in
               sxGroupCompute, on this same table and basis. */
            const sxParlayEps = sxPlayEpsilon(pair.heat ? [ pair.heat.a, pair.heat.b ] : []),
                recs = pair.straight.topics.map(s => {
                    if ("shared" !== s.status) return { id: s.id, entryKF: null, entryMS: null, consideredKF: !1, consideredMS: !1 };
                    // Multi-pole comparison (ruled 2026-11-16): Parlay
                    // includes the ratings too - the agreement feeds
                    // Parlay (Converse) as well as Play (Commune).
                    // The Parlay entries use the agreement exactly as
                    // the Play entries do (MS = the agreement fraction,
                    // KF = agreement × intensity). The samples carry no
                    // flags, so the Parlay flag table does not change
                    // these entries.
                    if (null != s.agreement) return {
                        id: s.id,
                        entryKF: s.agreement * (null != s.poleIntensity ? s.poleIntensity : 0),
                        // The overlap is drawn only when the interest
                        // counts. A zero or a sign split leaves this at
                        // 0. A shared no still counts: its factor is the
                        // smaller absolute intensity.
                        entryMS: s.poleIntensity > 0 ? s.agreement : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                    const rec = pair.topicsById ? pair.topicsById[s.id] : null, fl = rec ? rec.flags || {} : {},
                        ra = rec ? rec.ratings.a : null, rb = rec ? rec.ratings.b : null,
                        mkTd = (r, name) => ({
                            rated: !!(r && (r.giveKnown || r.receiveKnown)),
                            favorite: (fl.favoriteBy || []).includes(name),
                            triedScope: (fl.triedBy || []).includes(name) ? "topic" : null,
                            fantasyScope: (fl.fantasyBy || []).includes(name) ? "topic" : null
                        }),
                        tdA = mkTd(ra, pair.a), tdB = mkTd(rb, pair.b),
                        fitG = sxPositiveFlank(s.giveGive),
                        fitR = sxPositiveFlank(s.recvRecv),
                        sFits = [ fitG, fitR ].filter(v => null != v),
                        maxFit = sFits.length ? Math.max(...sFits) : null,
                        splitOnly = !sFits.length && (s.giveGive < 0 || s.recvRecv < 0),
                        totA = sxParlayMemberTotal(tdA), totB = sxParlayMemberTotal(tdB), totMax = Math.max(totA, totB),
                        gm = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                        binFit = (null != fitG && fitG > sxParlayEps ? 1 : 0) + (null != fitR && fitR > sxParlayEps ? 1 : 0),
                        cA = binFit + sxParlayTableFlags(tdA), cB = binFit + sxParlayTableFlags(tdB), cMax = Math.max(cA, cB);
                    return {
                        id: s.id,
                        entryKF: null == maxFit ? splitOnly ? 0 : null : maxFit / 100 * gm,
                        entryMS: cMax > 0 ? sxPlayGeoMean([ cA / cMax, cB / cMax ]) : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                }),
                msAggS = sxPlayWeightedPct(recs, r => r.entryMS, r => r.consideredMS),
                kfAggS = sxPlayWeightedPct(recs, r => r.entryKF, r => r.consideredKF);
            return { outer: msAggS.pct, inner: kfAggS.pct };
        }
        // Circle-minus rings, the same shape as circle dot. A stored
        // enemy pair fills from how much the two people sit on those
        // far poles. A give/receive topic fills from the negative
        // same-flank products, kept as positive magnitudes so the arc
        // can draw them. Shared topics with no argument stay in the
        // denominator, so an all-agreement pair scores low.
        function sxDebateInterim(pair) {
            if (!pair || !pair.straight) return { outer: null, inner: null, counted: 0, considered: 0 };
            const recs = pair.straight.topics.map(s => {
                    if ("shared" !== s.status) return { id: s.id, entryKF: null, entryMS: null, consideredKF: !1, consideredMS: !1 };
                    // Pole and line topics (ruled 2026-11-21): the
                    // feud is the strongest per-pole split
                    // (sxDebateFeud), the Kink Factor entry prices it
                    // by the debate factor, and the Match Score entry
                    // is the feud itself - any topic carrying a split
                    // counts, at its own strength.
                    if (null != s.agreement || null != s.roleEnemy) {
                        const feud = sxDebateFeud(s);
                        return {
                            id: s.id,
                            entryKF: feud * (null != s.debateIntensity ? s.debateIntensity : 0),
                            entryMS: feud,
                            consideredKF: !0,
                            consideredMS: !0
                        };
                    }
                    const rec = pair.topicsById ? pair.topicsById[s.id] : null, fl = rec ? rec.flags || {} : {},
                        ra = rec ? rec.ratings.a : null, rb = rec ? rec.ratings.b : null,
                        mkTd = (r, name) => ({
                            rated: !!(r && (r.giveKnown || r.receiveKnown)),
                            favorite: (fl.favoriteBy || []).includes(name),
                            triedScope: (fl.triedBy || []).includes(name) ? "topic" : null,
                            fantasyScope: (fl.fantasyBy || []).includes(name) ? "topic" : null
                        }),
                        tdA = mkTd(ra, pair.a), tdB = mkTd(rb, pair.b),
                        fitG = sxSplitMagnitude(s.giveGive),
                        fitR = sxSplitMagnitude(s.recvRecv),
                        fits = [ fitG, fitR ].filter(v => null != v),
                        maxFit = fits.length ? Math.max(...fits) : null,
                        totA = sxParlayMemberTotal(tdA), totB = sxParlayMemberTotal(tdB), totMax = Math.max(totA, totB),
                        gm = totMax > 0 ? sxPlayGeoMean([ totA / totMax, totB / totMax ]) : 0,
                        binFit = (null != fitG && fitG > 0 ? 1 : 0) + (null != fitR && fitR > 0 ? 1 : 0),
                        cA = binFit + sxParlayTableFlags(tdA), cB = binFit + sxParlayTableFlags(tdB), cMax = Math.max(cA, cB);
                    return {
                        id: s.id,
                        entryKF: null == maxFit ? 0 : maxFit / 100 * gm,
                        entryMS: cMax > 0 ? sxPlayGeoMean([ cA / cMax, cB / cMax ]) : 0,
                        consideredKF: !0,
                        consideredMS: !0
                    };
                }),
                msAgg = sxPlayWeightedPct(recs, r => r.entryMS, r => r.consideredMS),
                kfAgg = sxPlayWeightedPct(recs, r => r.entryKF, r => r.consideredKF);
            return { outer: msAgg.pct, inner: kfAgg.pct, counted: msAgg.counted, considered: msAgg.considered };
        }
        /* Score-ring values for a tab/profile context. kind: "profile"
           (outer Charted, inner Personal KF), "bowtie" (outer Play MS,
           inner Play KF, off the pair/group engine aggregates),
           "circledot" (Parlay MS / Parlay KF pair, provisional). */
        function sxRingValuesForProfile(profile) {
            const pc = sxPersonalCharted(profile);
            return { outerLabel: "Charted", outer: pc.charted, innerLabel: "Personal " + sxTerm("kinkFactor"), inner: pc.personal };
        }
        function sxRingValuesForCast(profiles, pairOp) {
            if (!profiles || profiles.length < 2) return null;
            const heats = profiles.map(p => p && p.id && typeof sxHeatDisplayFor === "function" ? sxHeatDisplayFor(p.id) : p && typeof p.heat === "number" ? p.heat : 0),
                veils = profiles.map(p => p && p.id && typeof sxVeilFor === "function" ? sxVeilFor(p.id) : p && null != p.veil ? av(p.veil) : 50),
                grp = sxGroupCompute(profiles, { heat: heats, veil: veils }), isPair = 2 === profiles.length, pair = isPair ? grp.pairs[0] : null;
            /* No Charted pass here (Rank 10, 2026-10-30): this function
               used to compute sxGroupCharted(profiles) into a `charted`
               field on every return, but its only frequent caller (the
               header paint) reads outer/inner only and threw that pass
               away on every render. The one consumer of group Charted,
               the dialog readback, calls sxGroupCharted directly, so
               the pass runs exactly once, only when the dialog opens. */
            if ("minus" === pairOp) {
                if (!isPair) {
                    const deb = grp.debate;
                    return { outerLabel: sxTerm("debateMS"), outer: deb ? deb.headline : null, innerLabel: sxTerm("debateKF"), inner: deb ? deb.kinkFactor : null };
                }
                const di = sxDebateInterim(pair);
                return { outerLabel: sxTerm("debateMS"), outer: di.outer, innerLabel: sxTerm("debateKF"), inner: di.inner };
            }
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
                    return { outerLabel: sxTerm("parlayMS"), outer: par ? par.headline : null, innerLabel: sxTerm("parlayKF"), inner: par ? par.kinkFactor : null };
                }
                const si = sxStraightInterim(pair);
                return { outerLabel: sxTerm("parlayMS"), outer: si.outer, innerLabel: sxTerm("parlayKF"), inner: si.inner };
            }
            const play = isPair ? pair.play : grp.play, conv = isPair ? pair.conversation : grp.conversation;
            return { outerLabel: sxTerm("playMS"), outer: play ? play.headline : null, innerLabel: sxTerm("playKF"), inner: conv ? conv.kinkFactor : null };
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
            window.__sxRings = { personalCharted: sxPersonalCharted, groupCharted: sxGroupCharted, straightInterim: sxStraightInterim, debateInterim: sxDebateInterim, ringValuesForProfile: sxRingValuesForProfile, ringValuesForCast: sxRingValuesForCast, topicShares: sxTopicShares };
        function sxProfileById(id) {
            return {
                id: id, name: wt[id] || "Profile",
                ratings: vt[id] || {}, annotations: Qe[id] || {}, fantasyOnly: Je[id] || {},
                alreadyTried: et[id] || {}, importedChildren: at[id] || {},
                genders: bb(rt[id]), orientations: iv(ot[id])
            };
        }
        var sxPairCache = new Map();
        function sxInvalidatePairs() {
            if (sxPairCache && typeof sxPairCache.clear === "function") {
                sxPairCache.clear();
            }
        }
        function sxPairByIds(idA, idB, sxSettings) {
            if (!vt[idA] || !vt[idB] || idA === idB) return null;
            const [ x, y ] = [ idA, idB ].sort();
            if (sxSettings) return sxPairCompute(sxProfileById(x), sxProfileById(y), {
                heatA: sxSettings[x] ? sxSettings[x].heat : 0, heatB: sxSettings[y] ? sxSettings[y].heat : 0,
                veilA: sxSettings[x] ? sxSettings[x].veil : 50, veilB: sxSettings[y] ? sxSettings[y].veil : 50
            });
            const hX = typeof sxHeatDisplayFor === "function" ? sxHeatDisplayFor(x) : typeof sxHeatFor === "function" ? sxHeatFor(x) : 0,
                hY = typeof sxHeatDisplayFor === "function" ? sxHeatDisplayFor(y) : typeof sxHeatFor === "function" ? sxHeatFor(y) : 0,
                vX = typeof sxVeilFor === "function" ? sxVeilFor(x) : 50,
                vY = typeof sxVeilFor === "function" ? sxVeilFor(y) : 50,
                veX = Boolean(typeof vht !== "undefined" && vht[x]) ? "1" : "0",
                veY = Boolean(typeof vht !== "undefined" && vht[y]) ? "1" : "0",
                key = `${x}|${y}|h:${hX},${hY}|v:${veX}:${vX},${veY}:${vY}`;
            if (!sxPairCache.has(key)) sxPairCache.set(key, sxPairCompute(sxProfileById(x), sxProfileById(y), { heatA: hX, heatB: hY, veilA: vX, veilB: vY }));
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
        function sxComputeProfileFingerprint(id, seen) {
            if (!id || !vt[id]) return "";
            seen = seen || new Set;
            if (seen.has(id)) return "";
            seen.add(id);
            const r = vt[id] || {}, q = Qe[id] || {}, j = Je[id] || {}, e = et[id] || {},
                ve = Boolean(typeof vht !== "undefined" && vht[id]) ? "1" : "0",
                vl = typeof sxVeilFor === "function" ? sxVeilFor(id) : (typeof vpt !== "undefined" && Number.isFinite(Number(vpt[id])) ? Math.round(Number(vpt[id])) : 50),
                ht = typeof sxHeatDisplayFor === "function" ? sxHeatDisplayFor(id) : (typeof sxHeatFor === "function" ? sxHeatFor(id) : 0),
                meta = typeof ft !== "undefined" ? ft[id] : null,
                inner = meta && "group" === meta.kind && Array.isArray(meta.sourceIds) ? "|src:" + meta.sourceIds.map(sId => sId + "=" + sxComputeProfileFingerprint(sId, new Set(seen))).join(",") : "";
            return Object.keys(r).length + ":" + JSON.stringify(r) + "|" + JSON.stringify(q) + "|" + JSON.stringify(j) + "|" + JSON.stringify(e) + "|v:" + ve + ":" + vl + "|h:" + ht + inner;
        }
        function sxSourcesFingerprint(sourceIds) {
            return (sourceIds || []).map(id => id + "=" + sxComputeProfileFingerprint(id)).join(";");
        }
        function sxIsPseudoProfile(id) {
            if (!id || typeof ft === "undefined") return !1;
            const meta = ft[id];
            return Boolean(meta && (meta.isPseudoProfile || meta.pairOp));
        }
        function sxEnsurePseudoProfileCurrent(id, visited) {
            if (!id || typeof ft === "undefined") return;
            visited = visited || new Set;
            if (visited.has(id)) return;
            visited.add(id);
            const meta = ft[id];
            if (!meta || ("group" !== meta.kind && !meta.isPseudoProfile) || !Array.isArray(meta.sourceIds) || meta.sourceIds.length < 2) return;
            meta.sourceIds.forEach(srcId => sxEnsurePseudoProfileCurrent(srcId, visited));
            const currentFp = sxSourcesFingerprint(meta.sourceIds);
            if (meta.fingerprint !== currentFp) {
                if (typeof Rd === "function") Rd(id);
            }
        }
        window.__SEXCAPADES_SYNC_ENGINE = {
            version: "1.1",
            pair: sxPairCompute,
            group: sxGroupCompute,
            pairByIds: sxPairByIds,
            livePair: sxLivePair,
            profileById: sxProfileById,
            computeProfileFingerprint: sxComputeProfileFingerprint,
            sourcesFingerprint: sxSourcesFingerprint,
            isPseudoProfile: sxIsPseudoProfile,
            ensurePseudoProfileCurrent: sxEnsurePseudoProfileCurrent
        };
