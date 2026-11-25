        function sxMulberry32(seed) {
            let a = seed >>> 0;
            return function() {
                a |= 0, a = a + 0x6D2B79F5 | 0;
                let t = Math.imul(a ^ a >>> 15, 1 | a);
                return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }
        function sxPairTrace(geo) {
            if (geo.connSpoke < 0 || geo.t8 < 0) return { d: null, c: 0 };
            const sp = geo.spokes[geo.connSpoke], I = geo.topics[geo.t8].I;
            return {
                d: sxSegSegDist(sp.seg[0], sp.seg[1], I[0], I[1]),
                c: sxProperIntersect(sp.seg[0], sp.seg[1], I[0], I[1]) ? 1 : 0
            };
        }
        // ---- The annealer (ASSESSMENT §4.1) ----
        function sxAnnealRun(d, mode) {
            const wall0 = performance.now(), geo = sxSccBuild(d), maps = sxNewMaps();
            maps.invT = new Array(geo.topics.length).fill(0), maps.invS = new Array(geo.spokes.length).fill(0);
            const start = sxFullEval(geo, maps), termsStart = {
                crossing: start.crossing,
                graze: start.graze,
                inner: start.inner
            };
            let E = start.E;
            const pt0 = sxPairTrace(geo), trace = [ {
                E: E,
                pair_distance: pt0.d,
                pair_count: pt0.c
            } ];
            if ("shadow" === mode) {
                dkLog.push({
                    type: "anneal-settle",
                    flag: "shadow",
                    sweeps: 0,
                    termination: "shadow",
                    E_start: E,
                    E_end: E,
                    E_audit: E,
                    drift: 0,
                    terms_start: termsStart,
                    terms_end: termsStart,
                    accepted: 0,
                    uphill_count: 0,
                    uphill: [],
                    max_displacement: { radial_wu: 0, angular_deg: 0 },
                    pair_trace: trace,
                    wall_ms: performance.now() - wall0
                });
                return !1;
            }
            const rng = sxMulberry32(SX_SEED);
            let accepted = 0, termination = "budget", sweepsDone = 0, prevNet = null;
            const uphill = [];
            for (let k = 0; k < SX_SWEEPS; k++) {
                const T = Math.max(SX_TFLOOR, SX_T0 * Math.pow(SX_TCOOL, k)), stepScale = Math.pow(SX_STEPCOOL, k), sweepStartE = E;
                let uphillThis = 0;
                sxBuildGrid(geo);
                for (const mv of geo.movers) {
                    const e = mv.entry, curW = e.getW(), curA = e.getA();
                    const involved = mv.topics.some(i => maps.invT[i] > 0) || mv.spokes.some(j => maps.invS[j] > 0);
                    const types = involved ? [ "r-", "r+", "a-", "a+", "shrink" ] : [ "r-", "r+", "a-", "a+" ];
                    const pick = types[Math.floor(rng() * types.length)], mag = .25 + .75 * rng();
                    let newW = null, newA = null;
                    if ("shrink" === pick) {
                        newW = Math.max(mv.floorW, curW * .95);
                        newW = Math.max(newW, curW - SX_STEP_R * stepScale, mv.startW - SX_CUM_R);
                        if (newW >= curW - 1e-9) continue;
                    } else if ("r-" === pick || "r+" === pick) {
                        const step = SX_STEP_R * stepScale * mag * ("r-" === pick ? -1 : 1);
                        newW = Math.min(mv.startW, Math.max(mv.floorW, curW + step));
                        if (mv.startW - newW > SX_CUM_R) newW = mv.startW - SX_CUM_R;
                        if (Math.abs(newW - curW) < 1e-9) continue;
                    } else {
                        const step = SX_STEP_A * stepScale * mag * ("a-" === pick ? -1 : 1);
                        newA = curA + step;
                        const rel = geo.wrapA(newA - mv.startA);
                        if (Math.abs(rel) > SX_CUM_A) newA = mv.startA + Math.sign(rel) * SX_CUM_A;
                        // Angular order inside the fan (ASSESSMENT §3.4).
                        const fan = e.fan, pos = e.fanPos;
                        if (fan && pos !== undefined) {
                            let lo = -Infinity, hi = Infinity;
                            if (pos > 0) lo = fan.members[pos - 1].getA() + SX_FAN_GAP;
                            if (pos < fan.members.length - 1) hi = fan.members[pos + 1].getA() - SX_FAN_GAP;
                            // Compare in the fan's wrapped frame.
                            const relNew = geo.wrapA(newA - fan.refAng), relLo = geo.wrapA(lo - fan.refAng), relHi = geo.wrapA(hi - fan.refAng);
                            if (isFinite(lo) && relNew < relLo) newA = fan.refAng + relLo;
                            if (isFinite(hi) && relNew > relHi) newA = fan.refAng + relHi;
                            const rel2 = geo.wrapA(newA - mv.startA);
                            if (Math.abs(rel2) > SX_CUM_A) newA = mv.startA + Math.sign(rel2) * SX_CUM_A;
                        }
                        if (Math.abs(geo.wrapA(newA - curA)) < 1e-12) continue;
                    }
                    const savedA = e.getA(), savedW = e.getW();
                    if (null !== newW) e.setW(newW);
                    if (null !== newA) e.setA(newA);
                    if ("sub" === e.kind) {
                        e.compute(), e.children.forEach(c => c.compute());
                    } else e.compute();
                    const dE = sxReprice(geo, maps, mv.topics, mv.spokes);
                    let keep = !1;
                    if (dE <= 0) keep = !0; else if (rng() < Math.exp(-dE / T)) keep = !0;
                    if (keep) {
                        accepted++, E += dE;
                        if (dE > 0) uphill.push({
                            sweep: k + 1,
                            item: mv.name,
                            depth: dE,
                            climbE: E - dE,
                            payoff: !1
                        }), uphillThis++;
                    } else {
                        e.setA(savedA), e.setW(savedW);
                        if ("sub" === e.kind) {
                            e.compute(), e.children.forEach(c => c.compute());
                        } else e.compute();
                        sxReprice(geo, maps, mv.topics, mv.spokes);
                    }
                }
                sweepsDone = k + 1;
                const pt = sxPairTrace(geo);
                trace.push({
                    E: E,
                    pair_distance: pt.d,
                    pair_count: pt.c
                });
                if (0 === E) {
                    termination = "zero";
                    break;
                }
                const net = E - sweepStartE, thresh = -.001 * start.E;
                if (null !== prevNet && prevNet > thresh && net > thresh && 0 === uphillThis) {
                    termination = "plateau";
                    break;
                }
                prevNet = net;
            }
            // Q4 PLATEAU RULE: the threshold "plateau" termination
            // above (two consecutive sweeps under 0.1% net change,
            // zero uphill) is a termination LABEL, not an
            // acceptance. A plateau state may be accepted - kept as
            // the settled state - ONLY at crossing exactly 0, and
            // E === 0 exits as termination "zero" before the
            // plateau test can see it, so a "plateau" exit here
            // always carries E > 0. Such a state is therefore NOT
            // accepted as a plateau success: every mover returns to
            // its start angle/length (the same restore the
            // rejected-move path performs), the entry records
            // plateau_accepted false / plateau_reverted true, and
            // the run returns false so the settle is not treated
            // as anneal-settled. The anneal's energy IS the
            // crossing number throughout - no area figure plays
            // any part in this decision.
            let plateauAccepted = "plateau" !== termination, plateauReverted = !1;
            if ("plateau" === termination && 0 !== E) {
                geo.movers.forEach(mv => {
                    const e = mv.entry;
                    e.setA(mv.startA), e.setW(mv.startW);
                    if ("sub" === e.kind) {
                        e.compute(), e.children.forEach(c => c.compute());
                    } else e.compute();
                }), E = start.E, plateauAccepted = !1, plateauReverted = !0;
            }
            const plateauCopyFired = ("zero" === termination || "plateau" === termination) && 0 === E;
            const auditMaps = sxNewMaps(), audit = sxFullEval(geo, auditMaps), drift = audit.E - E;
            uphill.forEach(u => {
                u.payoff = E < u.climbE, delete u.climbE;
            });
            let maxRad = 0, maxAng = 0;
            geo.movers.forEach(mv => {
                maxRad = Math.max(maxRad, Math.abs(mv.entry.getW() - mv.startW));
                maxAng = Math.max(maxAng, Math.abs(geo.wrapA(mv.entry.getA() - mv.startA)) * 180 / Math.PI);
            });
            const entry = {
                type: "anneal-settle",
                flag: "settle",
                sweeps: sweepsDone,
                termination: termination,
                E_start: start.E,
                E_end: E,
                E_audit: audit.E,
                drift: drift,
                terms_start: termsStart,
                terms_end: plateauReverted ? {
                    crossing: audit.crossing,
                    graze: audit.graze,
                    inner: audit.inner
                } : {
                    crossing: maps.tc,
                    graze: maps.tg,
                    inner: maps.ti
                },
                plateau_accepted: plateauAccepted,
                plateau_copy_fired: plateauCopyFired,
                plateau_reverted: plateauReverted,
                accepted: accepted,
                uphill_count: uphill.length,
                uphill: uphill,
                max_displacement: { radial_wu: maxRad, angular_deg: maxAng },
                pair_trace: trace,
                wall_ms: performance.now() - wall0
            };
            dkLog.push(entry);
            // Q4: a plateau-reverted run did not settle anything -
            // report not-done so the paint takes its ordinary path
            // over the restored start geometry.
            return !plateauReverted;
        }
        // ==== Settle replacement v1: SCC repulsion relaxation ====
        // Runs only when the solver mode value is "repulsion". ONE
        // repulsive mechanism per spoke: the SCC capsule itself (spoke
        // centre line plus/minus one font size, from the label's inward
        // radius to past the longest slider's end, with the inner
        // stretch running back to the centre disc's rim; the disc is
        // never impinged). The energy descended is the standing hybrid
        // crossing number E over those capsules (counting drives),
        // with same-branch pairs blind for v1 via geo.sxRepExcl.
        // The descent is NESTED, strongest first: (1) category spokes
        // twiddle in angle about the hub (the centre circle is the
        // only fixed anchor; a category's motion carries its whole
        // branch rigidly), (2) the same algorithm over subcategory
        // movers only (a subcategory's motion carries its leaves),
        // (3) the same algorithm over every mover, leaves included.
        // LEVEL (1) IS COMMENTED OUT (ruled 2026-10-31, Jason):
        // the branch angle tweak is out throughout - categories
        // no longer twiddle in angle about the hub anywhere in
        // this descent; the trial, its driver and its runLevel
        // call below are commented out, not deleted, and the
        // descent runs levels (2) and (3) only. The branchMovers
        // machinery stays live for snapshot/restore, which keeps
        // every branch angle exactly where the build placed it.
        // Steps are capped per sweep at SX_STEP_R (8 world units)
        // radial and SX_STEP_A (0.5 degrees) angular, so the map
        // relaxes instead of jumping. Descent is monotone with
        // backtracking: a sweep that ends above its start energy is
        // restored and retried at halved steps, at most 3 halvings,
        // then the level is abandoned. The budget is counted in
        // sweeps, never wall-clock, so repeat solves are identical.
        // The relaxation is sign-free: it never reads the collision
        // mode switch; geometry and mode policy stay separate.
        // SX_REP_ALLOW_GROW is the single policy point where growth
        // returns in a later version (growth is how the font reaches
        // the 44px tap size): v1 holds it off, so outward radial
        // steps cap at each mover's start radius, as the tidier's do.
        const SX_REP_ALLOW_GROW = !1, SX_REP_EPS = 1e-9;
        function sxRepulsionRun(d) {
            const wall0 = performance.now(), geo = sxSccBuild(d);
            geo.sxRepExcl = !0;
            let maps = sxNewMaps();
            maps.invT = new Array(geo.topics.length).fill(0), maps.invS = new Array(geo.spokes.length).fill(0);
            const start = sxFullEval(geo, maps), termsStart = {
                crossing: start.crossing,
                graze: start.graze,
                inner: start.inner
            };
            let E = start.E, accepted = 0, halvingsTotal = 0, sweepsDone = 0, reverted = !1;
            // Stock-currency witness: the standing evaluation of the
            // same geometry without the v1 same-branch exclusion,
            // logged so the relaxation's numbers can be cross-read
            // against the shell's crossing readout.
            geo.sxRepExcl = !1;
            const stockStart = sxFullEval(geo, sxNewMaps()).E;
            geo.sxRepExcl = !0;
            // Category (branch) movers: angle about the hub only.
            const branchMovers = d.branches.map(br => {
                const cloud = br.entry.branch.name, bm = {
                    br: br,
                    cloud: cloud,
                    startA: br.angle,
                    topics: [],
                    spokes: [],
                    topicE: [],
                    subE: [],
                    anchorObj: null,
                    centerSpokeIx: -1,
                    prevA: null,
                    nextA: null
                };
                geo.topics.forEach((e, i) => {
                    if (e.branchEntry === br) bm.topics.push(i), bm.topicE.push(e), bm.anchorObj || (bm.anchorObj = e.anchor || null);
                });
                geo.spokes.forEach((sp, j) => {
                    if (sp.cloud === cloud) {
                        bm.spokes.push(j);
                        if ("center" === sp.kind) bm.centerSpokeIx = j;
                        if (sp.entry && sp.entry.branchEntry === br) bm.subE.push(sp.entry), bm.anchorObj || (bm.anchorObj = sp.entry.anchor || null);
                    }
                });
                return bm;
            });
            const byAngle = branchMovers.slice().sort((a, b) => a.startA - b.startA);
            byAngle.forEach((bm, i) => {
                bm.prevA = byAngle[(i + byAngle.length - 1) % byAngle.length].startA, bm.nextA = byAngle[(i + 1) % byAngle.length].startA;
            });
            const applyBranch = (bm, newA) => {
                bm.br.angle = newA;
                const a = rr.branchAnchor(bm.br);
                if (bm.anchorObj) bm.anchorObj.x = a.x, bm.anchorObj.y = a.y;
                if (bm.centerSpokeIx >= 0) {
                    const sp = geo.spokes[bm.centerSpokeIx];
                    sp.seg[1].x = a.x, sp.seg[1].y = a.y, sp.bb = sxBB(sp.seg[0], sp.seg[1], 0);
                }
                bm.subE.forEach(e => e.compute()), bm.topicE.forEach(e => e.compute());
            };
            const applyItem = mv => {
                const e = mv.entry;
                if ("sub" === e.kind) {
                    e.compute(), e.children.forEach(c => c.compute());
                } else e.compute();
            };
            const snapState = () => ({
                branches: branchMovers.map(bm => bm.br.angle),
                movers: geo.movers.map(mv => [ mv.entry.getW(), mv.entry.getA() ])
            });
            const restoreState = s => {
                branchMovers.forEach((bm, i) => {
                    if (bm.br.angle !== s.branches[i]) applyBranch(bm, s.branches[i]);
                });
                geo.movers.forEach((mv, i) => {
                    mv.entry.setW(s.movers[i][0]), mv.entry.setA(s.movers[i][1]);
                });
                geo.movers.forEach(mv => applyItem(mv));
                maps = sxNewMaps(), maps.invT = new Array(geo.topics.length).fill(0), maps.invS = new Array(geo.spokes.length).fill(0);
                E = sxFullEval(geo, maps).E;
            };
            const snap0 = snapState();
            const branchInvolved = bm => bm.topics.some(i => maps.invT[i] > 0) || bm.spokes.some(j => maps.invS[j] > 0);
            const itemInvolved = mv => mv.topics.some(i => maps.invT[i] > 0) || mv.spokes.some(j => maps.invS[j] > 0);
            // BRANCH ANGLE TWEAK - COMMENTED OUT (ruled
            // 2026-10-31, Jason): the branch angle trial below
            // is commented out, not deleted.
            /*
            const trialBranch = (bm, delta) => {
                const curA = bm.br.angle;
                let newA = curA + delta;
                const rel = geo.wrapA(newA - bm.startA);
                if (Math.abs(rel) > SX_CUM_A) newA = bm.startA + Math.sign(rel) * SX_CUM_A;
                const relN = geo.wrapA(newA - bm.startA), relLo = geo.wrapA(bm.prevA - bm.startA) + SX_FAN_GAP, relHi = geo.wrapA(bm.nextA - bm.startA) - SX_FAN_GAP;
                if (relN < relLo) newA = bm.startA + relLo;
                if (relN > relHi) newA = bm.startA + relHi;
                const rel2 = geo.wrapA(newA - bm.startA);
                if (Math.abs(rel2) > SX_CUM_A) newA = bm.startA + Math.sign(rel2) * SX_CUM_A;
                if (Math.abs(geo.wrapA(newA - curA)) < 1e-12) return !1;
                applyBranch(bm, newA);
                const dE = sxReprice(geo, maps, bm.topics, bm.spokes);
                if (dE < -SX_REP_EPS) return E += dE, accepted++, !0;
                return applyBranch(bm, curA), sxReprice(geo, maps, bm.topics, bm.spokes), !1;
            };
            */
            const trialItem = (mv, kind, scale) => {
                const e = mv.entry, curW = e.getW(), curA = e.getA();
                let newW = null, newA = null;
                if ("r-" === kind || "r+" === kind) {
                    const step = SX_STEP_R * scale * ("r-" === kind ? -1 : 1), capW = SX_REP_ALLOW_GROW ? mv.startW + SX_CUM_R : mv.startW;
                    newW = Math.min(capW, Math.max(mv.floorW, curW + step));
                    if (mv.startW - newW > SX_CUM_R) newW = mv.startW - SX_CUM_R;
                    if (Math.abs(newW - curW) < 1e-9) return !1;
                } else {
                    const step = SX_STEP_A * scale * ("a-" === kind ? -1 : 1);
                    newA = curA + step;
                    const rel = geo.wrapA(newA - mv.startA);
                    if (Math.abs(rel) > SX_CUM_A) newA = mv.startA + Math.sign(rel) * SX_CUM_A;
                    const fan = e.fan, pos = e.fanPos;
                    if (fan && pos !== undefined) {
                        let lo = -Infinity, hi = Infinity;
                        if (pos > 0) lo = fan.members[pos - 1].getA() + SX_FAN_GAP;
                        if (pos < fan.members.length - 1) hi = fan.members[pos + 1].getA() - SX_FAN_GAP;
                        const relNew = geo.wrapA(newA - fan.refAng), relLo = geo.wrapA(lo - fan.refAng), relHi = geo.wrapA(hi - fan.refAng);
                        if (isFinite(lo) && relNew < relLo) newA = fan.refAng + relLo;
                        if (isFinite(hi) && relNew > relHi) newA = fan.refAng + relHi;
                        const rel2 = geo.wrapA(newA - mv.startA);
                        if (Math.abs(rel2) > SX_CUM_A) newA = mv.startA + Math.sign(rel2) * SX_CUM_A;
                    }
                    if (Math.abs(geo.wrapA(newA - curA)) < 1e-12) return !1;
                }
                const savedA = e.getA(), savedW = e.getW();
                if (null !== newW) e.setW(newW);
                if (null !== newA) e.setA(newA);
                applyItem(mv);
                const dE = sxReprice(geo, maps, mv.topics, mv.spokes);
                if (dE < -SX_REP_EPS) return E += dE, accepted++, !0;
                return e.setA(savedA), e.setW(savedW), applyItem(mv), sxReprice(geo, maps, mv.topics, mv.spokes), !1;
            };
            // BRANCH ANGLE TWEAK - COMMENTED OUT (ruled
            // 2026-10-31, Jason): the branch angle driver below
            // is commented out, not deleted.
            /* const tryBranch = (bm, scale) => branchInvolved(bm) && (trialBranch(bm, SX_STEP_A * scale) || trialBranch(bm, -SX_STEP_A * scale)); */
            const tryItem = (mv, scale) => itemInvolved(mv) && (trialItem(mv, "a+", scale) || trialItem(mv, "a-", scale) || trialItem(mv, "r-", scale) || trialItem(mv, "r+", scale));
            // One nested level: sweeps over its movers until a sweep
            // moves nothing, the sweep budget ends, or E reaches 0.
            // A sweep whose tracked energy rose (incremental repricing
            // drift) is restored and retried at halved steps.
            const runLevel = (list, tryOne, maxSweeps) => {
                let scale = 1, halvings = 0;
                for (let s = 0; s < maxSweeps; s++) {
                    if (E <= SX_REP_EPS) return;
                    const sweepStartE = E, snap = snapState();
                    sxBuildGrid(geo);
                    let moved = 0;
                    for (const it of list) if (tryOne(it, scale)) moved++;
                    sweepsDone++;
                    if (E > sweepStartE + 1e-9) {
                        restoreState(snap), halvings++, halvingsTotal++;
                        if (halvings > 3) return;
                        scale /= 2, s--;
                        continue;
                    }
                    if (!moved || sweepStartE - E < 1e-9) return;
                }
            };
            if (E > SX_REP_EPS) {
                // BRANCH ANGLE TWEAK - COMMENTED OUT (ruled
                // 2026-10-31, Jason): the branch-angle descent
                // level below is commented out, not deleted;
                // levels (2) and (3) still run.
                /* runLevel(branchMovers, tryBranch, 6); */
                runLevel(geo.movers.filter(mv => "sub" === mv.kind), tryItem, 6);
                runLevel(geo.movers, tryItem, 6);
            }
            let auditMaps = sxNewMaps(), audit = sxFullEval(geo, auditMaps);
            if (audit.E > start.E + 1e-9) {
                // Monotone guarantee: never hand the paint geometry
                // worse than the build produced. Restore the start
                // state whole and report not-settled, so the paint
                // takes its ordinary path over the start geometry.
                restoreState(snap0), reverted = !0, auditMaps = sxNewMaps(), audit = sxFullEval(geo, auditMaps), E = audit.E;
            }
            const drift = audit.E - E;
            geo.sxRepExcl = !1;
            const stockEnd = sxFullEval(geo, sxNewMaps()).E;
            geo.sxRepExcl = !0;
            let maxRad = 0, maxAng = 0;
            geo.movers.forEach(mv => {
                maxRad = Math.max(maxRad, Math.abs(mv.entry.getW() - mv.startW));
                maxAng = Math.max(maxAng, Math.abs(geo.wrapA(mv.entry.getA() - mv.startA)) * 180 / Math.PI);
            });
            branchMovers.forEach(bm => {
                maxAng = Math.max(maxAng, Math.abs(geo.wrapA(bm.br.angle - bm.startA)) * 180 / Math.PI);
            });
            dkLog.push({
                type: "repulsion-settle",
                flag: "repulsion",
                sweeps: sweepsDone,
                termination: reverted ? "reverted" : 0 === audit.E ? "zero" : 0 === accepted ? "local-minimum" : "descent",
                E_start: start.E,
                E_end: audit.E,
                E_audit: audit.E,
                drift: drift,
                E_stock_start: stockStart,
                E_stock_end: stockEnd,
                terms_start: termsStart,
                terms_end: {
                    crossing: auditMaps.tc,
                    graze: auditMaps.tg,
                    inner: auditMaps.ti
                },
                accepted: accepted,
                halvings: halvingsTotal,
                reverted: reverted,
                max_displacement: { radial_wu: maxRad, angular_deg: maxAng },
                wall_ms: performance.now() - wall0
            });
            return !reverted;
        }
        function sxAnnealHook(d) {
            sxSettleDone = !1;
            if (scCtx) return;
            const mode = sxSolverMode();
            if ("off" === mode) return;
            try {
                sxSettleDone = "repulsion" === mode ? sxRepulsionRun(d) : sxAnnealRun(d, mode);
            } catch (err) {
                __sxErrLog("anneal-settle", err), sxSettleDone = !1;
            }
        }
        // ---- Crossing-number readout (Fleet2 Item2): the read-only
        // entry point the shell metrics layer calls for the hybrid
        // crossing number E. It evaluates the CURRENT solved state -
        // dkLastBranches, the delivered-geometry registry fr() keeps -
        // with the port's own geometry build (sxSccBuild) and full
        // evaluation (sxFullEval); no geometry or predicate is
        // reimplemented here and the anneal path is untouched. The
        // per-cloud values are a direct read of the port's pair maps
        // under the instrument's stated attribution: a crossing term
        // goes in full to the victim topic's cloud (cross keys are
        // victim * SX_PAIR_STRIDE + other line); a graze term splits half/half
        // between the two topics' clouds; an inner intersection is
        // attributed to BOTH participants' clouds (a participant line
        // is a topic below N, a spoke at N + spoke index), so the
        // per-cloud values sum to E + inner count.
        //
        // FINGERPRINT CACHE (2026-10-30, paragraph-6 solver-metrics
        // edit): this readout is quadratic - sxSccBuild plus the
        // full pair evaluation - and it is read on unchanged state
        // several times in a row (the onset baseline and the first
        // growth step, the settle guard's before/after pair, the
        // shell metric's compute + clouds). sxCrossingMeasure
        // therefore caches one result per excl slot, keyed by a
        // linear fingerprint of EVERY input sxSccBuild reads,
        // recomputed fresh on each call. The cache is exact, not
        // heuristic: the delivered sectors are mutated in place by
        // the tidier (sxAnnealHook's setW/setA write cloudRadius /
        // cloudAngle on the same item objects dkLastBranches points
        // at), so an identity check would serve pre-tidy geometry -
        // the fingerprint reads the values themselves, so a tidy
        // that moves anything changes the key and the next read
        // rebuilds. The key is sxSccInputs: the values sxSccBuild
        // reads (font law, icon law, pr, mn, the solved tree, the
        // anchor yr() returns), stringified. There is no second
        // list to maintain. On any
        // fingerprint error the cache is bypassed and cleared, and
        // the readout computes fresh - the pre-cache behaviour.
        // Cached results are returned as shallow copies so no caller
        // can poison the stored entry.
        let sxEvalCache = { standing: null, excluded: null };
        // KINK LEAF OVERGROWTH (ruled 2026-11-03, Jason): the Layout
        // Editor's "% kink leaf overgrowth" slider (mn.leafOvergrowth,
        // a percent, default 300, range 100-500) is the ONE multiple of
        // the full fit target (dkComputeFitTarget's max-envelope:
        // name + neighbour pitch + icon + clearance) that sets BOTH
        // the kink-leaf throw length in stepThrow (the throwFitCap
        // multiple, which is also the leaf minimum - leaves have no
        // shrink ladder of their own, so no separate leaf floor
        // exists or is needed) AND the length Autofit delivers in
        // computeAutofitPatch. It replaces the hard 3x those two sites
        // carried (SX_SCORE.LEAF_FIT_FACTOR / the Autofit driver's
        // literal 3, and the THROW_KINK baked-base fallback multiple,
        // which was 3 for the same reason). Category/subcategory
        // 50x/20x throws and 1x floors, the shrinkKinksToLabel
        // driver's 1x, and the settle drift check's 1x comparison are
        // untouched. 100% is the minimum and default size.
        function sxLeafOvergrowthFactor() {
            const pct = Number(mn && mn.leafOvergrowth);
            return Number.isFinite(pct) && pct >= 100 ? pct / 100 : 1;
        }
        function sxSccInputs(branches) {
            const fontScale = mapFontScale();
            let fontStatus = "?", fontCheck = null;
            try {
                if (document.fonts) {
                    fontStatus = document.fonts.status;
                    if (document.fonts.check) fontCheck = document.fonts.check('650 16px "Source Sans 3"');
                }
            } catch (_) {}
            const fontSize = [ 0, 1, 2, 3 ].map(sxFontSize), iconR = [ 0, 1, 2, 3 ].map(d => d ? sxIconRadius(d) : 0);
            const prSnap = { topicIcon: pr.topicIcon, categoryIcon: pr.categoryIcon, subcategoryIcon: pr.subcategoryIcon, centerX: pr.centerX, centerY: pr.centerY, centerRadius: pr.centerRadius };
            const tagScale = { 2: sxControlScale(2, prSnap.topicIcon), 3: sxControlScale(3, prSnap.topicIcon) };
            let rim = prSnap.centerRadius;
            try {
                const v = gen1SpokeBaseRadius();
                if (Number.isFinite(v) && v > 0) rim = v;
            } catch (_) {}
            const mnSnap = { branchOverrides: mn.branchOverrides, kinkOverrides: mn.kinkOverrides, subcatOverrides: mn.subcatOverrides, stagger: mn.stagger, staggerDensity: mn.staggerDensity, collision: mn.collision, spokeLen: mn.spokeLen, subLen: mn.subLen, pad: mn.pad, repulsion: mn.repulsion, repulsionEnabled: mn.repulsionEnabled, branchSpokeAutoShrink: mn.branchSpokeAutoShrink, subcatSpokeAutoShrink: mn.subcatSpokeAutoShrink, autoShrinkFactor: mn.autoShrinkFactor, solverMidline: mn.solverMidline, fontScale: mn.fontScale, centerRingScale: mn.centerRingScale, leafOvergrowth: mn.leafOvergrowth, mapSliders: mn.mapSliders };
            const order = (typeof h !== "undefined" && h || []).map(b => ({ name: b && b.name, n: b && b.topics ? b.topics.length : 0 }));
            const branch = (branches || []).map(br => ({
                angle: br && br.angle || 0,
                topicCloudRadius: br && br.topicCloudRadius || 0,
                name: br && br.entry && br.entry.branch ? br.entry.branch.name : (br && br.name || ""),
                spokeAdjust: Number(br && br.entry && br.entry.branch && br.entry.branch._spokeAdjust20) || 0,
                anchor: typeof rr !== "undefined" && rr && rr.branchAnchor ? rr.branchAnchor(br) : { x: 0, y: 0 },
                topics: (br && br.topics || []).map(item => {
                    const rec = item && item.topic ? item.topic : { id: "unknown", label: "", isSubcategory: false };
                    return {
                        cloudRadius: item && item.cloudRadius || 0,
                        cloudAngle: item && item.cloudAngle || 0,
                        cloudIndex: item && item.cloudIndex || 0,
                        childCloudRadius: item && item.childCloudRadius || 0,
                        cloudCount: item && item.cloudCount || 0,
                        radialFit: item && item._radialFit20,
                        id: rec.id,
                        label: rec.label,
                        isSub: rec.isSubcategory ? 1 : 0,
                        children: (item && item.children || []).map(wrap => {
                            const crec = wrap && wrap.child ? wrap.child : null;
                            return crec ? { cloudRadius: wrap.cloudRadius, cloudAngle: wrap.cloudAngle, radialFit: wrap._radialFit20, id: crec.id, label: crec.label, isStatic: crec.isStaticTopic ? 1 : 0 } : null;
                        }).filter(Boolean)
                    };
                })
            }));
            return { F: SX_FONT_BASE * fontScale, fontScale: fontScale, fontStatus: fontStatus, fontCheck: fontCheck, prof: Vi(), fontSize: fontSize, iconR: iconR, pr: prSnap, tagScale: tagScale, rim: rim, mn: mnSnap, order: order, branch: branch };
        }
        function sxCrossingSig() {
            return dkStableStringify(sxSccInputs(dkLastBranches));
        }
        function sxGetEval(excl) {
            if (!dkLastBranches) return null;
            let sig = null;
            try { sig = sxCrossingSig(); } catch (e) { sig = null; }
            const slot = excl ? "excluded" : "standing";
            if (null !== sig) {
                const hit = sxEvalCache[slot];
                if (hit && hit.sig === sig) return hit;
            }
            try {
                const geo = sxSccBuild({ branches: dkLastBranches }), maps = sxNewMaps();
                // Growth dominance readout (ruled 2026-10-28): with excl
                // set, the SAME evaluation runs under the existing
                // geo.sxRepExcl flag (same-branch pairs blind, exactly as
                // the repulsion descent sets it), so a cloud's excluded
                // value is its standing value minus its same-branch
                // contribution. The default call is unchanged.
                excl && (geo.sxRepExcl = !0);
                const tot = sxFullEval(geo, maps);
                const entry = { sig: sig, geo: geo, maps: maps, tot: tot };
                if (null !== sig) sxEvalCache[slot] = entry;
                else sxEvalCache = { standing: null, excluded: null };
                return entry;
            } catch (err) {
                if (window.console && typeof window.console.warn === "function") window.console.warn("[sxGetEval] Error calculating crossing:", err);
                return null;
            }
        }
        function sxCrossingMeasure(excl) {
            const ev = sxGetEval(excl);
            if (!ev) return null;
            const geo = ev.geo, maps = ev.maps, tot = ev.tot;
            const clouds = {}, byDepth = {}, byNode = {}, subclouds = {}, generations = {};
            const N = geo.topics.length;
            const add = (c, v) => { if (c) clouds[c] = (clouds[c] || 0) + v; };
            const addDepth = (d, v) => { if (d != null) byDepth[d] = (byDepth[d] || 0) + v; };
            const addNode = (nid, v) => { if (nid) byNode[nid] = (byNode[nid] || 0) + v; };
            const addSub = (sc, v) => { if (sc) subclouds[sc] = (subclouds[sc] || 0) + v; };
            const addGenPair = (d1, d2, v) => {
                if (d1 != null && d2 != null) {
                    const k = d1 <= d2 ? (d1 + "_" + d2) : (d2 + "_" + d1);
                    generations[k] = (generations[k] || 0) + v;
                }
            };
            const itemOf = ix => (ix < N ? geo.topics[ix] : geo.spokes[ix - N]);

            geo.topics.forEach(e => {
                if (undefined === clouds[e.cloud]) clouds[e.cloud] = 0;
                if (e.depth != null && undefined === byDepth[e.depth]) byDepth[e.depth] = 0;
                if (e.nodeId && undefined === byNode[e.nodeId]) byNode[e.nodeId] = 0;
                if (e.subcloud && undefined === subclouds[e.subcloud]) subclouds[e.subcloud] = 0;
            });
            geo.spokes.forEach(sp => {
                if (undefined === clouds[sp.cloud]) clouds[sp.cloud] = 0;
                if (sp.depth != null && undefined === byDepth[sp.depth]) byDepth[sp.depth] = 0;
                if (sp.nodeId && undefined === byNode[sp.nodeId]) byNode[sp.nodeId] = 0;
                if (sp.subcloud && undefined === subclouds[sp.subcloud]) subclouds[sp.subcloud] = 0;
            });

            maps.cross.forEach((val, k) => {
                const v = Math.floor(k / SX_PAIR_STRIDE), o = k % SX_PAIR_STRIDE;
                const victim = geo.topics[v], obst = itemOf(o);
                if (victim) {
                    add(victim.cloud, val);
                    addDepth(victim.depth, val);
                    addNode(victim.nodeId, val);
                    addSub(victim.subcloud, val);
                    if (obst) addGenPair(victim.depth, obst.depth, val);
                }
            });
            maps.graze.forEach((val, k) => {
                const i = Math.floor(k / SX_PAIR_STRIDE), j = k % SX_PAIR_STRIDE;
                const ti = geo.topics[i], tj = geo.topics[j];
                const half = val / 2;
                if (ti) {
                    add(ti.cloud, half);
                    addDepth(ti.depth, half);
                    addNode(ti.nodeId, half);
                    addSub(ti.subcloud, half);
                }
                if (tj) {
                    add(tj.cloud, half);
                    addDepth(tj.depth, half);
                    addNode(tj.nodeId, half);
                    addSub(tj.subcloud, half);
                }
                if (ti && tj) addGenPair(ti.depth, tj.depth, val);
            });
            maps.inner.forEach((val, k) => {
                const p = Math.floor(k / SX_PAIR_STRIDE), q = k % SX_PAIR_STRIDE;
                const ip = itemOf(p), iq = itemOf(q);
                if (ip) {
                    add(ip.cloud, val);
                    addDepth(ip.depth, val);
                    addNode(ip.nodeId, val);
                    addSub(ip.subcloud, val);
                }
                if (iq) {
                    add(iq.cloud, val);
                    addDepth(iq.depth, val);
                    addNode(iq.nodeId, val);
                    addSub(iq.subcloud, val);
                }
                if (ip && iq) addGenPair(ip.depth, iq.depth, val);
            });

            return {
                E: tot.E,
                crossing: tot.crossing,
                graze: tot.graze,
                inner: tot.inner,
                clouds: Object.assign({}, clouds),
                byDepth: Object.assign({}, byDepth),
                byGen: Object.assign({}, byDepth),
                byNode: Object.assign({}, byNode),
                subclouds: Object.assign({}, subclouds),
                generations: Object.assign({}, generations)
            };
        }
        window.__sxCrossingMeasure = sxCrossingMeasure;
        window.__sxCrossingMeasureExcluded = () => sxCrossingMeasure(!0);
        // STAGED SCORING FOR ANNEAL (ruled 2026-11-02, Jason): while a
        // cascade run is active (sxAnnealStageCtx set by dkRunCascade),
        // the run's judged cloud score is STAGED by run phase. From the
        // start of the run until the WHOLE RUN enters its shrink stage
        // (stepShrinkLadders), the score counts SAME-BRANCH crossings
        // only: a pair term counts toward the judged branch only when
        // BOTH participants belong to the judged branch's own cloud.
        // Once the run has entered its shrink stage, terms whose other
        // participant belongs to a RADIAL NEIGHBOUR branch (the two
        // branches flanking the judged branch around the centre, by
        // centre-spoke angle) join the score; no other branch ever
        // joins. The pair terms themselves are the standing port pair
        // maps (sxFullEval over sxSccBuild) under the standing
        // attribution - crossing in full to the victim topic's cloud,
        // graze split half/half, inner attributed to both participants
        // (so a same-branch inner pair still counts twice) - the stage
        // filter only decides WHICH pairs count, never how much a
        // counted pair counts; the attribution / divide-by-2 question
        // is untouched. Outside an active run this readout is never
        // consulted: deknotter.measureCloud falls back to the standing
        // readout, and the shell metric, the onset hold's readout and
        // the neighbor reports keep the standing values exactly.
        let sxAnnealStageCtx = null;
        function sxRadialNeighbourClouds(geo, branch) {
            const pts = [];
            geo.spokes.forEach(sp => {
                "center" === sp.kind && pts.push({ cloud: sp.cloud, ang: Math.atan2(sp.seg[1].y - pr.centerY, sp.seg[1].x - pr.centerX) });
            }), pts.sort((a, b) => a.ang - b.ang);
            const ix = pts.findIndex(q => q.cloud === branch);
            if (ix < 0 || pts.length < 3) return [];
            const n = pts.length;
            return [ pts[(ix - 1 + n) % n].cloud, pts[(ix + 1) % n].cloud ];
        }
        function sxCrossingStagedCloud(branch, includeAdjacent) {
            if (!branch) return null;
            const ev = sxGetEval(false);
            if (!ev) return null;
            const geo = ev.geo, maps = ev.maps;
            const allowed = new Set([ branch ]);
            if (includeAdjacent) sxRadialNeighbourClouds(geo, branch).forEach(c => allowed.add(c));
            const N = geo.topics.length, cloudOf = ix => ix < N ? geo.topics[ix] && geo.topics[ix].cloud : geo.spokes[ix - N] && geo.spokes[ix - N].cloud;
            let total = 0;
            maps.cross.forEach((val, k) => {
                const v = Math.floor(k / SX_PAIR_STRIDE), o = k % SX_PAIR_STRIDE;
                if ((geo.topics[v] && geo.topics[v].cloud) !== branch) return;
                allowed.has(cloudOf(o)) && (total += val);
            }), maps.graze.forEach((val, k) => {
                const i = Math.floor(k / SX_PAIR_STRIDE), j = k % SX_PAIR_STRIDE, ci = geo.topics[i] && geo.topics[i].cloud, cj = geo.topics[j] && geo.topics[j].cloud;
                ci === branch && allowed.has(cj) && (total += val / 2), cj === branch && allowed.has(ci) && (total += val / 2);
            }), maps.inner.forEach((val, k) => {
                const pp = Math.floor(k / SX_PAIR_STRIDE), qq = k % SX_PAIR_STRIDE, cp = cloudOf(pp), cq = cloudOf(qq);
                cp === branch && allowed.has(cq) && (total += val), cq === branch && allowed.has(cp) && (total += val);
            });
            return total;
        }
        window.__sxCrossingStagedCloud = (branch, adjacent) => sxCrossingStagedCloud(branch, !!adjacent);
        window.__sxAnnealStageState = () => sxAnnealStageCtx ? { branch: sxAnnealStageCtx.branch, adjacent: !!sxAnnealStageCtx.adjacent } : null;
