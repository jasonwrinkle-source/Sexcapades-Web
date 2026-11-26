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
                        a: { give: a.raw.give, giveKnown: a.raw.giveKnown, receive: a.raw.receive, receiveKnown: a.raw.receiveKnown, single: a.single, singleValue: a.singleValue, polesKnown: a.polesKnown, lineKnown: a.lineKnown },
                        b: { give: b.raw.give, giveKnown: b.raw.giveKnown, receive: b.raw.receive, receiveKnown: b.raw.receiveKnown, single: b.single, singleValue: b.singleValue, polesKnown: b.polesKnown, lineKnown: b.lineKnown }
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
                /* Multi-pole comparison (ruled 2026-11-16): for a
                   shared multi-pole topic, the Play MS entry is the
                   agreement fraction (0–1) and the Play KF entry is
                   the agreement × the Depth Factor intensity
                   (geometric mean over members of each member's
                   strongest stance ÷100). The flanked computation is
                   skipped for these topics — they have no flanks, so
                   it would give a null KF entry and a 0 MS entry.
                   (Flag folding for multi-pole entries is not defined
                   in the design; the samples carry no flags, so the
                   entries are the agreement and agreement ×
                   intensity exactly.) */
                rec.polesA = a.poles, rec.polesB = b.poles, rec.lineA = a.line, rec.lineB = b.line;
                rec.advocacyA = a.advocacy;
                rec.advocacyB = b.advocacy;
                rec.receptivityA = a.receptivity;
                rec.receptivityB = b.receptivity;

                // Deliberative flow: A_adv x B_rec and B_adv x A_rec
                let delibAtoB = null, delibBtoA = null;
                if (a.advocacy && b.receptivity && a.advocacy.poles && b.receptivity.poles) {
                    const pKeys = [...new Set([...Object.keys(a.advocacy.poles), ...Object.keys(b.receptivity.poles)])];
                    let sum = 0;
                    pKeys.forEach(k => {
                        const va = Math.max(0, Number(a.advocacy.poles[k]) || 0);
                        const vb = Math.max(0, Number(b.receptivity.poles[k]) || 0);
                        sum += va * vb;
                    });
                    const iA = (a.advocacy.intensity != null) ? a.advocacy.intensity : 100;
                    const iB = (b.receptivity.intensity != null) ? b.receptivity.intensity : 100;
                    const rel = sxRelevancePair(iA, iB);
                    delibAtoB = (sum / 10000) * (rel.aversion || rel.opposed ? 0 : rel.factor);
                }
                if (b.advocacy && a.receptivity && b.advocacy.poles && a.receptivity.poles) {
                    const pKeys = [...new Set([...Object.keys(b.advocacy.poles), ...Object.keys(a.receptivity.poles)])];
                    let sum = 0;
                    pKeys.forEach(k => {
                        const vb = Math.max(0, Number(b.advocacy.poles[k]) || 0);
                        const va = Math.max(0, Number(a.receptivity.poles[k]) || 0);
                        sum += vb * va;
                    });
                    const iB = (b.advocacy.intensity != null) ? b.advocacy.intensity : 100;
                    const iA = (a.receptivity.intensity != null) ? a.receptivity.intensity : 100;
                    const rel = sxRelevancePair(iB, iA);
                    delibBtoA = (sum / 10000) * (rel.aversion || rel.opposed ? 0 : rel.factor);
                }
                rec.deliberative = (delibAtoB != null || delibBtoA != null) ? { AtoB: delibAtoB, BtoA: delibBtoA } : null;

                // Straight components: Advocacy x Advocacy & Receptivity x Receptivity
                if (a.advocacy && b.advocacy && a.advocacy.poles && b.advocacy.poles) {
                    const pKeys = [...new Set([...Object.keys(a.advocacy.poles), ...Object.keys(b.advocacy.poles)])];
                    let allied = 0;
                    pKeys.forEach(k => {
                        const va = Math.max(0, Number(a.advocacy.poles[k]) || 0);
                        const vb = Math.max(0, Number(b.advocacy.poles[k]) || 0);
                        allied += (va * vb) / 10000;
                    });
                    rec.straightAdvocacy = allied;
                }
                if (a.receptivity && b.receptivity && a.receptivity.poles && b.receptivity.poles) {
                    const pKeys = [...new Set([...Object.keys(a.receptivity.poles), ...Object.keys(b.receptivity.poles)])];
                    let open = 0;
                    pKeys.forEach(k => {
                        const va = Math.max(0, Number(a.receptivity.poles[k]) || 0);
                        const vb = Math.max(0, Number(b.receptivity.poles[k]) || 0);
                        open += (va * vb) / 10000;
                    });
                    rec.straightReceptivity = open;
                }
                const agreement = sxPoleAgreement(a, b);
                const role = a.polesKnown && b.polesKnown ? sxPoleMatch(meta, a.poles, b.poles) : null;
                if (role) {
                    // Play reads the complementary role. The talk reads
                    // the similar role. A shared no stays a talk. Opposite
                    // interest on a same-pole widget is the argument, so
                    // that overlap moves to the feud and leaves the talk.
                    // Play still drops a shared no and a sign split.
                    const rel = sxRelevancePair(a.intensity, b.intensity);
                    const playWeight = rel.aversion || rel.opposed ? 0 : rel.factor;
                    const talkWeight = rel.opposed ? 0 : rel.factor;
                    rec.poleRole = !0;
                    rec.agreement = role.straight;
                    rec.roleStraight = role.straight;
                    rec.roleCross = role.cross;
                    rec.roleEnemy = meta && "same" === meta.poleReading && rel.opposed ? role.straight : role.enemy;
                    rec.debateIntensity = sxDebateFactor([ a.intensity, b.intensity ]);
                    rec.poleIntensity = rel.factor;
                    rec.sharedAversion = rel.aversion;
                    rec.relevanceOpposed = rel.opposed;
                    rec.intensityA = a.intensity;
                    rec.intensityB = b.intensity;
                    rec.crossEntry = role.cross * playWeight;
                    rec.straightEntry = role.straight * talkWeight;
                    rec.crossFitGive = null;
                    rec.crossFitReceive = null;
                    rec.playMSEntry = rec.crossEntry;
                    rec.playKFEntry = rec.crossEntry;
                } else if (null != agreement) {
                    const rel = a.intensityKnown && b.intensityKnown ? sxRelevancePair(a.intensity, b.intensity) : null;
                    const intensity = rel ? rel.aversion ? 0 : rel.factor : sxPoleIntensity(a, b);
                    rec.agreement = agreement;
                    rec.poleIntensity = intensity;
                    rec.sharedAversion = Boolean(rel && rel.aversion);
                    rec.relevanceOpposed = Boolean(rel && rel.opposed);
                    rec.intensityA = a.intensity;
                    rec.intensityB = b.intensity;
                    // Effective care for the debate factor and the
                    // play-list gates: the stored relevance when there
                    // is one, else the strongest stance's size (a line
                    // topic's scalar is its stance).
                    rec.careA = null != a.intensity ? a.intensity : Math.abs(a.strongest || 0);
                    rec.careB = null != b.intensity ? b.intensity : Math.abs(b.strongest || 0);
                    rec.debateIntensity = sxDebateFactor([ rec.careA, rec.careB ]);
                    rec.crossFitGive = null, rec.crossFitReceive = null;
                    rec.playMSEntry = agreement * (rel ? intensity : 1);
                    rec.playKFEntry = agreement * intensity;
                } else {
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
                }
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
                // A role topic joins the play lists from the complementary
                // role, not from give/receive flanks (it has none). Two
                // people on the same pole stay out of play; they land in
                // the straight register below. Shared aversion and a
                // don't-care stay out of both "do this" lists.
                if (rec.poleRole) {
                    const Ta = sxClamp(35 - heatA, 0, 85), Tb = sxClamp(35 - heatB, 0, 85);
                    const iA = a.intensity, iB = b.intensity;
                    rec.strength = null;
                    rec.bestFit = null;
                    if (rec.sharedAversion || rec.relevanceOpposed || !(iA > 0 && iB > 0) || !(rec.roleCross > 0)) rec.outcome = "not-topics";
                    else if (iA > Ta && iB > Tb && rec.roleCross >= .5) {
                        rec.outcome = "match";
                        rec.strength = Math.round(rec.roleCross * rec.poleIntensity * 100);
                    } else {
                        rec.outcome = "curious-fit";
                        rec.strength = Math.round(rec.roleCross * rec.poleIntensity * 100);
                    }
                }
                // A line topic (and any shared pole topic the role
                // reading did not claim) joins the play lists from its
                // agreement, under the same gates the role topics use
                // (ruled 2026-11-21: pole topics are visible to the
                // match lists in every mode). Both members must care,
                // neither may be averse or opposed, and agreement of
                // at least half makes a match; any lesser shared
                // ground is a curious fit. Shared aversion and a
                // don't-care stay out of the "do this" lists.
                if (!rec.poleRole && null != rec.agreement) {
                    const Ta2 = sxClamp(35 - heatA, 0, 85), Tb2 = sxClamp(35 - heatB, 0, 85);
                    rec.strength = null, rec.bestFit = null;
                    if (rec.sharedAversion || rec.relevanceOpposed || !(rec.careA > 0 && rec.careB > 0) || !(rec.agreement > 0)) rec.outcome = "not-topics";
                    else if (rec.careA > Ta2 && rec.careB > Tb2 && rec.agreement >= .5) {
                        rec.outcome = "match";
                        rec.strength = Math.round(rec.agreement * rec.poleIntensity * 100);
                    } else {
                        rec.outcome = "curious-fit";
                        rec.strength = Math.round(rec.agreement * rec.poleIntensity * 100);
                    }
                }
                rec.playOutcome = fantasy ? "fantasy-excluded" : rec.outcome;
                if ("conflict" === rec.outcome) rec.mismatchShape = `opposed — ${rec.clashes[0].against}`;
                if ("one-sided" === rec.outcome) rec.mismatchShape = sxOneSidedShape(sA, sB, nameA, nameB);
                if (rec.poleRole && rec.sharedAversion) rec.mismatchShape = "shared aversion";
                if (rec.poleRole && rec.relevanceOpposed) {
                    rec.outcome = "conflict";
                    rec.playOutcome = fantasy ? "fantasy-excluded" : "conflict";
                    rec.mismatchShape = "opposed";
                }
                if ("match" === rec.outcome || "curious-fit" === rec.outcome) rec.countClass = fantasy ? "fantasy" : "match";
                else if (fantasy && ((a.fantasyScope && (anyPos(sB) || rec.fits.length)) || (b.fantasyScope && (anyPos(sA) || rec.fits.length)))) rec.countClass = "fantasy";
                if (!rec.countClass && (a.triedScope || b.triedScope)) rec.countClass = "experience";
                // countClass "soft-no" is assigned by the teaser selection
                // pass after the topic loop, so the ring counts (via the MOVEs) and
                // the popover Teasers sections always share one selected set.
                rec.hotContribution = !rec.countClass ? 0 : "experience" === rec.countClass || "soft-no" === rec.countClass ? 25 : rec.bestFit ? rec.bestFit.strength : null != rec.strength ? rec.strength : rec.fits.length ? Math.max(...rec.fits.map(f => f.strength)) : 0;
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
                    // A role topic's straight sum is the similar-role
                    // overlap times the smaller relevance. Give/receive
                    // topics keep their flank products. A line topic
                    // (agreement, no flanks) sums its agreement times
                    // its relevance, so it bands and lists with the
                    // rest of the register (ruled 2026-11-21).
                    sum = rec.poleRole ? rec.straightEntry > 0 ? rec.straightEntry * 100 : null : null == giveGive && null == recvRecv ? null != rec.agreement && rec.poleIntensity > 0 ? rec.agreement * rec.poleIntensity * 100 : null : (giveGive || 0) + (recvRecv || 0),
                    // Multi-pole comparison (ruled 2026-11-16): a pole
                    // vector or a line scalar counts as rated here too,
                    // so a shared multi-pole topic is "shared" in the
                    // straight register (its Parlay entry comes from
                    // the agreement, carried on the record).
                    aRated = ra.giveKnown || ra.receiveKnown || ra.polesKnown || ra.lineKnown, bRated = rb.giveKnown || rb.receiveKnown || rb.polesKnown || rb.lineKnown;
                let status;
                if (rec.limiters.length) status = "limit-blocked", straightLimitBlocked++;
                else if (!(aRated && bRated)) status = "invisible", aRated !== bRated && straightOneSided++;
                else status = "shared", straightShared++;
                const srec = { id: rec.id, label: rec.label, branch: rec.branch, giveGive: giveGive, recvRecv: recvRecv, sum: sum, status: status, ratings: rec.ratings, flags: rec.flags, agreement: null != rec.agreement ? rec.agreement : null, poleIntensity: null != rec.poleIntensity ? rec.poleIntensity : null, roleStraight: null != rec.roleStraight ? rec.roleStraight : null, roleCross: null != rec.roleCross ? rec.roleCross : null, roleEnemy: null != rec.roleEnemy ? rec.roleEnemy : null, debateIntensity: null != rec.debateIntensity ? rec.debateIntensity : null, sharedAversion: Boolean(rec.sharedAversion), polesA: rec.polesA || null, polesB: rec.polesB || null, lineA: null != rec.lineA ? rec.lineA : null, lineB: null != rec.lineB ? rec.lineB : null };
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
                    // Multi-pole comparison (ruled 2026-11-16): a pole
                    // vector or a line scalar counts as rated, so a
                    // shared multi-pole topic is in the considered set.
                    return (ra.giveKnown || ra.receiveKnown || ra.polesKnown || ra.lineKnown) && (rb.giveKnown || rb.receiveKnown || rb.polesKnown || rb.lineKnown) && !r.limiters.length;
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
