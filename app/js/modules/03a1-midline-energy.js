        // ==== Stage 1 midline solver: SCC v2 hybrid energy + seeded annealer ====
        // Replaces the paint-stage settle search (Ar's inline radial loop)
        // when mn.solverMidline is "settle" (Stage 1 ASSESSMENT §§1.5, 3, 4).
        // Energy predicates port compute_v2.py (Stage 0 instrument) verbatim:
        // E = crossing number (chord of a foreign midline inside a topic's
        // Spoke Crossing Capsule / capsule band width) + graze-band
        // stadium-overlap area / F^2 (pairs 1-2 capsule radii apart, no
        // incursion) + inner-intersection count (strict
        // interior-interior, hub -> capsule-start segments + bare spokes).
        // CAPSULE STAGE 2 (ruled 2026-11-02 14:05, Jason): the crossing
        // term's victim region is the paddle UNION the topic's icon disc
        // (sxIconRadius at the topic's depth) - every stretch of a
        // foreign line is counted ONCE, at the width of the region it
        // is inside; see sxEvalCross.
        const SX_STEP_R = 8, SX_STEP_A = .5 * Math.PI / 180, SX_CUM_R = 32, SX_CUM_A = 2 * Math.PI / 180, SX_T0 = .25, SX_TCOOL = .8, SX_TFLOOR = .005, SX_STEPCOOL = .85, SX_SWEEPS = 24, SX_CELL = 256, SX_SEED = 0x5EED1234, SX_FONT_BASE = 22, SX_FAN_GAP = Math.PI / 45, SX_GRID_PAD = 128;
        // BASIS NOTE (2026-10-30, paragraph-6 solver-metrics edit):
        // these are the shipped tuned anneal constants. Their basis is
        // NOT recorded in code - the values are transcribed tuning
        // that produced the current judged-metric behaviour, not
        // quantities derived from a stated formula. Change any of
        // them only with re-measurement against the crossing-number
        // metric E; do not "tidy" a value toward a rounder one.
        // PAIR-KEY STRIDE: the pair-key packing below (i * stride +
        // j) is injective only while stride exceeds the count M of
        // keyed items (topics + spokes). M is 465 today (403 topics
        // + 62 spokes); the stride stays 1024, more than double M.
        // If the taxonomy ever grows past 1024 items, keys collide
        // silently and pair counts merge - raise the stride first.
        const SX_PAIR_STRIDE = 1024;
        // ============================================================
        // SOLVER-METRICS REFACTOR (F3 + F8): THE SOLVER FACADE - the
        // single front door for the three layout arrangers. The
        // engines themselves are NOT merged in this pass; the facade
        // names them, routes their call sites, and states the one
        // documented answer to "which engine runs when, and what
        // counts as better":
        //
        // 1. BUILD - facade.build() -> fr(), the everyday geometry
        //    builder (with its radial optimizer rr). Runs on every
        //    map build. "Better" inside the builder's collision
        //    passes is judged by segment-crossing counts (rr's
        //    _crossingScore - a swap is kept only when it lowers the
        //    count) and by element clearance in the radial resolver
        //    (center distance against the summed element radii, the
        //    smallest correction that separates the pair). No area
        //    figure is computed or consulted there. (Corrected
        //    2026-10-29, M3: this comment previously claimed AREA
        //    overlap (xAreaCross); the code contains no such
        //    judgment. The area metric has since been removed from
        //    observation entirely, M1.)
        // 2. TIDY - facade.tidy(geo) -> sxAnnealHook(), the
        //    paint-stage tidier (the Stage-1 SCC annealer). Runs
        //    immediately after build in the render flow, unless a
        //    scoped solve is active or the mode switch is off.
        //    (2026-11-01, Jason: this settle step is COMMENTED OUT
        //    at its invocation inside facade.tidy below - see the
        //    ruling note there. The route and the engine stay.)
        //    "Better" is the hybrid CROSSING NUMBER E: only an
        //    exactly-zero E settles a plateau (see sxAnnealRun).
        //    MODE NOTE (F8): sxSolverMode silently demotes "full"
        //    to "settle" and logs the demotion once to the shared
        //    log (dkLog); "shadow" is the real measure-only mode
        //    (zero sweeps, score unchanged).
        // 3. UNTANGLE - facade.untangle(branch, opts) ->
        //    dkRunCascade(), the deep untangler. Runs ONLY from the
        //    layout editor's "Anneal" BUTTON via the driver API
        //    (deknotter.run). F8 MAPPING: the Anneal button fires
        //    THIS engine (the untangler driver), while paint fires
        //    the TIDIER - the button label stays "Anneal" (settled
        //    law; renamed nowhere). "Better" is per-phase
        //    improve-or-hold on the branch's own-cloud crossing
        //    number: the per-phase gate (SX_SCORE.GATE_TOL, flat 2)
        //    is the only per-phase stop. The onset margin and the
        //    fine-tune margin are deleted. The final exact
        //    improve-or-hold gate is unchanged.
        //
        // All three engines read and write the same dials object
        // (mn, single-sourced per F2) and the same delivered-
        // geometry registry (dkLastBranches), and all report to
        // the same shared log (dkLog). Each engine still gates on
        // its own score, so a later engine can undo an earlier
        // one's gains - the facade documents that; this pass does
        // not change it.
        // ============================================================
        const SX_SOLVER_FACADE = {
            build() {
                var baked = null;
                try { baked = sxTryBaked(); } catch (e) { baked = null; }
                if (baked) {
                    try { window.__sxLastBuildMode = "baked"; } catch (e2) {}
                    return baked;
                }
                try { window.__sxLastBuildMode = "solved"; } catch (e3) {}
                return fr();
            },
            tidy(geo) {
                // STEP 4 (SETTLE) COMMENTED OUT (ruled 2026-11-01,
                // Jason): the Anneal's settle step - this
                // paint-stage tidier, sxAnnealHook running the SCC
                // annealer / repulsion run under the hybrid
                // crossing number - is out, because it seems to
                // only cause issues. The invocation below is
                // commented out, NOT deleted, and sxAnnealHook /
                // sxAnnealRun themselves stay in the code exactly
                // as before (as with the commented-out explanation
                // steps three and five in dkRunCascade): no paint
                // runs the settle step until Jason rules it back.
                // return sxAnnealHook(geo);
            },
            untangle(branch, opts) {
                return dkRunCascade(branch, opts);
            }
        };
        // ============================================================
        // BAKED POSITIONS (2026-11-15): the skin files carry solved
        // geometry (defaultLayout.positions). When the live state
        // exactly matches the captured state - same skin, same
        // settings fingerprint, same tree structure, no scoped or
        // DeKnotter context active - the paint uses the baked geometry
        // instead of solving. The solver itself stays for editor
        // operations (Anneal, Autofit, DeKnotter, KinkTest, fit
        // targets): any settings change, profile/detail/search change,
        // or taxonomy change fails the gate and the paint solves, as
        // before. The crossings readout needs no special case: the
        // reconstructed branches become dkLastBranches, so
        // window.__sxCrossingMeasure computes from the baked geometry.
        // The baked payload carries only solve-assigned numbers
        // (angles, sectors, cloud radii, spoke adjustments); the tree
        // itself (entries, topics, children) is rebuilt fresh every
        // paint, so the payload can never resurrect a stale taxonomy.
        // ============================================================
        // SOLVER VERSION (2026-11-15): bump whenever the solver's delivered
        // geometry changes, so positions baked under an older solver fail
        // the gate and the paint solves instead of serving stale geometry.
        // The settings fingerprint cannot catch a solver change - it hashes
        // mn only - so without this the minimum-spoke floor (or any future
        // solver change) would slip through the gate undetected. v2 = the
        // minimum primary-spoke floor (SX_MIN_BRANCH_THROW, 03-map-geometry).
        const SX_SOLVER_VERSION = 2;
        function sxBakedFingerprint() {
            try { return dkStableStringify(mn); } catch (e) { return null; }
        }
        // The signature is a MEMBERSHIP signature, deliberately
        // order-insensitive: branches sorted by catId, topics and
        // children sorted by id. The tree's order is NOT stable across
        // a skin round-trip - frBuildTree sorts each subcategory's
        // children by popularity score (02g G/U/W), and after a swap
        // the scores read as unrated, so the sort falls back to label
        // order (2026-11-15: switch-back tree reads t0291..t0296 where
        // the fresh boot reads t0294,t0293,t0291,t0296,t0292,t0295 -
        // same members, different order). The baked reconstruction
        // looks every branch/topic/child up BY ID, and the crossings
        // measure sums over pairs, so order carries no geometry; only
        // membership does. Sorting here keeps the gate from failing
        // on a benign reordering while still catching any real
        // taxonomy change (a missing/added topic or child changes
        // the sorted lists).
        function sxBakedTreeSignature(tree) {
            var parts = [];
            (tree || []).forEach(function (b) {
                var topics = (b.topics || []).map(function (t) {
                    var kids = (t.children || []).map(function (c) { return c.id; }).sort().join(",");
                    return t.id + "[" + kids + "]";
                }).sort().join(",");
                parts.push(b.catId + ":" + topics);
            });
            return parts.sort().join("|");
        }
        function sxSerializeBranch(br) {
            return {
                name: br.entry.branch.name,
                catId: br.entry.catId,
                angle: br.angle,
                sector: br.sector,
                topicCloudRadius: br.topicCloudRadius,
                topicCloudRadiusBase: br.topicCloudRadiusBase,
                spokeAdjust20: Number(br.entry.branch._spokeAdjust20) || 0,
                topics: (br.topics || []).map(function (t) {
                    return {
                        id: t.topic.id,
                        angle: t.angle,
                        sector: t.sector,
                        cloudAngle: t.cloudAngle,
                        cloudRadius: t.cloudRadius,
                        cloudCount: t.cloudCount,
                        cloudIndex: t.cloudIndex,
                        childCloudRadius: t.childCloudRadius,
                        curve: !!t.curve,
                        radialFit20: (typeof t._radialFit20 === "number" && isFinite(t._radialFit20)) ? t._radialFit20 : null,
                        children: (t.children || []).map(function (c) {
                            return {
                                id: c.child.id,
                                angle: c.angle,
                                sector: c.sector,
                                cloudAngle: c.cloudAngle,
                                cloudRadius: c.cloudRadius,
                                cloudCount: c.cloudCount,
                                cloudIndex: c.cloudIndex,
                                curve: !!c.curve,
                                radialFit20: (typeof c._radialFit20 === "number" && isFinite(c._radialFit20)) ? c._radialFit20 : null
                            };
                        })
                    };
                })
            };
        }
        function sxSerializeBaked() {
            if (!dkLastBranches) return null;
            var tree = null;
            try { tree = frBuildTree(); } catch (e) { return null; }
            var sig = sxBakedTreeSignature(tree);
            var crossings = null;
            try { var m = (typeof window.__sxCrossingMeasure === "function") ? window.__sxCrossingMeasure() : null; crossings = m ? m.crossing : null; } catch (e) { crossings = null; }
            var settingsHash = null;
            try { settingsHash = (window.__SEXCAPADES_LAYOUT_TEST && typeof window.__SEXCAPADES_LAYOUT_TEST.hash === "function") ? window.__SEXCAPADES_LAYOUT_TEST.hash() : null; } catch (e) { settingsHash = null; }
            var skin = "sexcapades";
            try { skin = window.__SX_ACTIVE_SKIN || "sexcapades"; } catch (e) {}
            return {
                skin: skin,
                solverVersion: SX_SOLVER_VERSION,
                capturedAt: new Date().toISOString(),
                settingsHash: settingsHash,
                fingerprint: sxBakedFingerprint(),
                treeSignature: sig,
                crossings: crossings,
                branches: (dkLastBranches || []).map(sxSerializeBranch)
            };
        }
        function sxBuildBaked(pos) {
            if (scCtx) return null;
            var tree = null;
            try { tree = frBuildTree(); } catch (e) { return null; }
            if (sxBakedTreeSignature(tree) !== pos.treeSignature) return null;
            var t = tree.map(function (e) { return { entry: e, label: e.branch.name, weight: e.weight, minDemand: e.minDemand }; });
            t.sort(function (a, b) { return (branchOrderRankMap().get(a.entry.branch.name) ?? 0) - (branchOrderRankMap().get(b.entry.branch.name) ?? 0); });
            var byCat = {};
            (pos.branches || []).forEach(function (b) { byCat[b.catId] = b; });
            var n = t.map(function (w) {
                var entry = w.entry;
                var baked = byCat[entry.catId];
                if (!baked) return null;
                var br = {
                    entry: entry,
                    label: entry.branch.name,
                    weight: entry.weight,
                    minDemand: entry.minDemand,
                    angle: baked.angle,
                    sector: baked.sector,
                    start: baked.angle - baked.sector / 2,
                    end: baked.angle + baked.sector / 2,
                    topicCloudRadius: baked.topicCloudRadius,
                    topicCloudRadiusBase: baked.topicCloudRadiusBase,
                    topics: []
                };
                entry.branch._spokeAdjust20 = baked.spokeAdjust20 || 0;
                var byId = {};
                (baked.topics || []).forEach(function (x) { byId[x.id] = x; });
                br.topics = entry.topics.map(function (tt) {
                    var bt = byId[tt.id];
                    if (!bt) return null;
                    var tw = {
                        topic: tt,
                        label: tt.label,
                        weight: tt.weight,
                        minDemand: tt.minDemand,
                        branchName: entry.branch.name,
                        startAngle: baked.angle,
                        angle: bt.angle,
                        sector: bt.sector,
                        start: bt.angle - bt.sector / 2,
                        end: bt.angle + bt.sector / 2,
                        cloudAngle: bt.cloudAngle,
                        cloudRadius: bt.cloudRadius,
                        cloudCount: bt.cloudCount,
                        cloudIndex: bt.cloudIndex,
                        childCloudRadius: bt.childCloudRadius,
                        curve: !!bt.curve,
                        children: []
                    };
                    if (typeof bt.radialFit20 === "number") tw._radialFit20 = bt.radialFit20;
                    var byKid = {};
                    (bt.children || []).forEach(function (x) { byKid[x.id] = x; });
                    tw.children = (tt.children || []).map(function (cc) {
                        var bc = byKid[cc.id];
                        if (!bc) return null;
                        var cw = {
                            child: cc,
                            label: cc.label,
                            weight: 1,
                            branchName: entry.branch.name,
                            parentTopic: tt,
                            startAngle: bt.angle,
                            angle: bc.angle,
                            sector: bc.sector,
                            start: bc.angle - bc.sector / 2,
                            end: bc.angle + bc.sector / 2,
                            cloudAngle: bc.cloudAngle,
                            cloudRadius: bc.cloudRadius,
                            cloudCount: bc.cloudCount,
                            cloudIndex: bc.cloudIndex,
                            curve: !!bc.curve
                        };
                        if (typeof bc.radialFit20 === "number") cw._radialFit20 = bc.radialFit20;
                        return cw;
                    });
                    if (tw.children.some(function (x) { return !x; })) return null;
                    return tw;
                });
                if (br.topics.some(function (x) { return !x; })) return null;
                return br;
            });
            if (n.some(function (x) { return !x; })) return null;
            dkLastBranches = n;
            n.forEach(function (b) {
                (b.topics || []).forEach(function (t) {
                    dkRecordDelivered(t);
                    if (t.topic && t.topic.isSubcategory) (t.children || []).forEach(function (ch) { dkRecordDelivered(ch); });
                });
            });
            return { tree: tree, branches: n };
        }
        function sxTryBaked() {
            var pos = null;
            try { pos = window.__SX_BAKED_POSITIONS || null; } catch (e) { return null; }
            if (!pos || !Array.isArray(pos.branches) || !pos.branches.length) return null;
            var skin = "sexcapades";
            try { skin = window.__SX_ACTIVE_SKIN || "sexcapades"; } catch (e) {}
            if (pos.skin && pos.skin !== skin) return null;
            if (pos.solverVersion !== SX_SOLVER_VERSION) return null;
            if (scCtx) return null;
            if (dkCtx) return null;
            var fp = null;
            try { fp = sxBakedFingerprint(); } catch (e) { return null; }
            if (!fp || fp !== pos.fingerprint) return null;
            return sxBuildBaked(pos);
        }
        window.__sxCaptureBakedGeometry = sxSerializeBaked;
        let sxDemoteLogged = !1, sxSettleDone = !1;
        function sxSolverModeQuiet() {
            const v = mn && mn.solverMidline;
            // Mode vocabulary (one dial, extended by exactly one value
            // for the settle replacement): "repulsion" selects the SCC
            // repulsion relaxation (sxRepulsionRun); "legacy" is the
            // rollback spelling of today's behaviour and resolves to
            // the same path as "settle"; "full" still demotes to
            // "settle"; "shadow" is measure-only; anything else off.
            return "repulsion" === v ? "repulsion" : "settle" === v || "full" === v || "legacy" === v ? "settle" : "shadow" === v ? "shadow" : "off";
        }
        function sxSolverMode() {
            const v = mn && mn.solverMidline;
            if ("full" === v && !sxDemoteLogged) {
                sxDemoteLogged = !0;
                try {
                    dkLog.push({
                        type: "solver-midline",
                        event: "full-demoted-to-settle"
                    });
                } catch (_) {}
            }
            return sxSolverModeQuiet();
        }
        // [SX-PREDICATES-BEGIN]
        function sxPtSegDist(p, a, b) {
            const abx = b.x - a.x, aby = b.y - a.y, q = abx * abx + aby * aby;
            let t = 0 === q ? 0 : ((p.x - a.x) * abx + (p.y - a.y) * aby) / q;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const dx = p.x - (a.x + abx * t), dy = p.y - (a.y + aby * t);
            return Math.hypot(dx, dy);
        }
        function sxOrient(a, b, c) {
            return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        }
        function sxSegSegDist(p1, p2, p3, p4) {
            const d1 = sxOrient(p3, p4, p1), d2 = sxOrient(p3, p4, p2), d3 = sxOrient(p1, p2, p3), d4 = sxOrient(p1, p2, p4);
            if ((d1 > 0) !== (d2 > 0) && (d3 > 0) !== (d4 > 0)) return 0;
            return Math.min(sxPtSegDist(p1, p3, p4), sxPtSegDist(p2, p3, p4), sxPtSegDist(p3, p1, p2), sxPtSegDist(p4, p1, p2));
        }
        // CAPSULE STAGE 2 (ruled 2026-11-02 14:05, Jason): the
        // stadium interval core of sxChordInStadium, exposed as
        // merged parameter intervals on the segment so the
        // crossing evaluator can UNION the paddle's intervals
        // with the icon disc's interval and count every stretch
        // of a foreign line once. sxChordInStadium keeps its
        // exact standing value (the same merge, summed).
        function sxStadiumIntervals(segA, segB, axisA, axisB, r) {
            const dx = segB.x - segA.x, dy = segB.y - segA.y, seglen = Math.hypot(dx, dy);
            if (seglen < 1e-12) return [];
            const ux = axisB.x - axisA.x, uy = axisB.y - axisA.y, ql = Math.hypot(ux, uy), ex = ux / ql, ey = uy / ql, nx = -ey, ny = ex;
            const p0e = (segA.x - axisA.x) * ex + (segA.y - axisA.y) * ey, p0n = (segA.x - axisA.x) * nx + (segA.y - axisA.y) * ny, de = dx * ex + dy * ey, dn = dx * nx + dy * ny, iv = [];
            let t0 = 0, t1 = 1, ok = !0;
            for (const [p, d, lo, hi] of [ [ p0e, de, 0, ql ], [ p0n, dn, -r, r ] ]) {
                if (Math.abs(d) < 1e-12) {
                    if (p < lo || p > hi) ok = !1;
                } else {
                    let ta = (lo - p) / d, tb = (hi - p) / d;
                    if (ta > tb) { const tt = ta; ta = tb; tb = tt; }
                    t0 = Math.max(t0, ta), t1 = Math.min(t1, tb);
                    if (t0 > t1) ok = !1;
                }
            }
            if (ok) iv.push([ t0, t1 ]);
            for (const c of [ axisA, axisB ]) {
                const ox = segA.x - c.x, oy = segA.y - c.y, A = dx * dx + dy * dy, B = 2 * (ox * dx + oy * dy), C = ox * ox + oy * oy - r * r, D = B * B - 4 * A * C;
                if (D >= 0) {
                    const sq = Math.sqrt(D);
                    iv.push([ Math.max(0, (-B - sq) / (2 * A)), Math.min(1, (-B + sq) / (2 * A)) ]);
                }
            }
            iv.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
            const out = [];
            let cs = -1, ce = -1;
            for (const [a, b] of iv) {
                if (a > ce) {
                    if (ce >= 0) out.push([ cs, ce ]);
                    cs = a, ce = b;
                } else ce = Math.max(ce, b);
            }
            if (ce >= 0) out.push([ cs, ce ]);
            return out;
        }
        function sxChordInStadium(segA, segB, axisA, axisB, r) {
            const seglen = Math.hypot(segB.x - segA.x, segB.y - segA.y);
            let tot = 0;
            for (const iv of sxStadiumIntervals(segA, segB, axisA, axisB, r)) tot += iv[1] - iv[0];
            return tot * seglen;
        }
        // The parameter interval of a segment inside a disc
        // (centre c, radius r), or null when the segment misses
        // the disc - the icon-disc half of the Stage 2 union.
        function sxDiscInterval(segA, segB, c, r) {
            const dx = segB.x - segA.x, dy = segB.y - segA.y, A = dx * dx + dy * dy;
            if (A < 1e-24 || !(r > 0)) return null;
            const ox = segA.x - c.x, oy = segA.y - c.y, B = 2 * (ox * dx + oy * dy), C = ox * ox + oy * oy - r * r, D = B * B - 4 * A * C;
            if (D < 0) return null;
            const sq = Math.sqrt(D), t0 = Math.max(0, (-B - sq) / (2 * A)), t1 = Math.min(1, (-B + sq) / (2 * A));
            return t1 > t0 ? [ t0, t1 ] : null;
        }
        function sxStadiumPoly(a, b, r) {
            const ux = b.x - a.x, uy = b.y - a.y, L = Math.hypot(ux, uy), ex = ux / L, ey = uy / L, nx = -ey, ny = ex, pts = [], base = Math.atan2(ny, nx);
            for (let i = 0; i <= 14; i++) {
                const ang = base - Math.PI * i / 14;
                pts.push({ x: b.x + r * Math.cos(ang), y: b.y + r * Math.sin(ang) });
            }
            for (let i = 0; i <= 14; i++) {
                const ang = base + Math.PI - Math.PI * i / 14;
                pts.push({ x: a.x + r * Math.cos(ang), y: a.y + r * Math.sin(ang) });
            }
            let area = 0;
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i], q = pts[(i + 1) % pts.length];
                area += p.x * q.y - q.x * p.y;
            }
            if (area < 0) pts.reverse();
            return pts;
        }
        function sxConvexClipArea(subject, clip) {
            const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
            let out = subject.slice();
            for (let i = 0; i < clip.length; i++) {
                const A = clip[i], B = clip[(i + 1) % clip.length];
                if (!out.length) break;
                const inp = out;
                out = [];
                for (let j = 0; j < inp.length; j++) {
                    const P = inp[j], Q = inp[(j + 1) % inp.length], cp = cross(A, B, P), cq = cross(A, B, Q);
                    if (cq >= -1e-12) {
                        if (cp < -1e-12) {
                            const t = cp / (cp - cq);
                            out.push({ x: P.x + (Q.x - P.x) * t, y: P.y + (Q.y - P.y) * t });
                        }
                        out.push(Q);
                    } else if (cp >= -1e-12) {
                        const t = cp / (cp - cq);
                        out.push({ x: P.x + (Q.x - P.x) * t, y: P.y + (Q.y - P.y) * t });
                    }
                }
            }
            if (out.length < 3) return 0;
            let area = 0;
            for (let i = 0; i < out.length; i++) {
                const p = out[i], q = out[(i + 1) % out.length];
                area += p.x * q.y - q.x * p.y;
            }
            return Math.abs(area) / 2;
        }
        function sxProperIntersect(p1, p2, p3, p4) {
            const d1 = sxOrient(p3, p4, p1), d2 = sxOrient(p3, p4, p2), d3 = sxOrient(p1, p2, p3), d4 = sxOrient(p1, p2, p4);
            return d1 * d2 < 0 && d3 * d4 < 0;
        }
        // [SX-PREDICATES-END]
        function sxBB(a, b, pad) {
            return [ Math.min(a.x, b.x) - pad, Math.min(a.y, b.y) - pad, Math.max(a.x, b.x) + pad, Math.max(a.y, b.y) + pad ];
        }
        function sxBBHit(p, q) {
            return p[0] <= q[2] && q[0] <= p[2] && p[1] <= q[3] && q[1] <= p[3];
        }
        function sxBBHitPad(p, q, pad) {
            return p[0] <= q[2] + pad && q[0] - pad <= p[2] && p[1] <= q[3] + pad && q[1] - pad <= p[3];
        }
        function sxLineSeg(geo, o) {
            return o < geo.topics.length ? geo.topics[o].M : geo.spokes[o - geo.topics.length].seg;
        }
        function sxInnerSeg(geo, o) {
            return o < geo.topics.length ? geo.topics[o].I : geo.spokes[o - geo.topics.length].seg;
        }
        // [SX-EVAL-BEGIN]
        function sxIdxCloud(geo, idx) {
            return idx < geo.topics.length ? geo.topics[idx].cloud : geo.spokes[idx - geo.topics.length].cloud;
        }
        function sxEvalCross(geo, v, o) {
            if (o === v) return 0;
            // Repulsion v1 only (geo.sxRepExcl, set solely by
            // sxRepulsionRun): same-branch pairs are blind, exactly as
            // the displayed roster treats them. Every other caller
            // leaves the flag unset and sees the standing evaluation.
            if (geo.sxRepExcl && sxIdxCloud(geo, o) === sxIdxCloud(geo, v)) return 0;
            const T = geo.topics[v], line = sxLineSeg(geo, o), lb = o < geo.topics.length ? geo.topics[o].bbM : geo.spokes[o - geo.topics.length].bb;
            // CAPSULE STAGE 2 (ruled 2026-11-02 14:05, Jason):
            // the paddle is priced exactly as before, and the
            // victim's ICON DISC - centre at the paint's icon
            // seat T.node, radius T.iconR = sxIconRadius at the
            // topic's depth, both set in finishTopic - is
            // superimposed on it. The pair is priced on the UNION
            // of the two regions, never their sum: a stretch of
            // the foreign line inside the disc is priced at the
            // disc's width (chord / 2 iconR, so one full disc
            // crossing counts one), a stretch inside the paddle
            // but outside the disc keeps the standing paddle rate
            // (chord / 2 hw), and the overlap of the two regions
            // is counted ONCE, at the disc's rate. The prefilter
            // bbox is the union bbox bbU so a disc-only incursion
            // is not culled before it is measured. Graze and
            // inner are untouched: graze already stands down
            // whenever a cross pair exists, so no pair is priced
            // twice across terms either.
            if (!sxBBHitPad(T.bbU || T.bbS, lb, T.hw)) return 0;
            const rI = T.iconR || 0, nearPaddle = sxSegSegDist(line[0], line[1], T.S[0], T.S[1]) < T.hw, nearDisc = rI > 0 && !!T.node && sxPtSegDist(T.node, line[0], line[1]) < rI;
            if (!nearPaddle && !nearDisc) return 0;
            const seglen = Math.hypot(line[1].x - line[0].x, line[1].y - line[0].y);
            if (seglen < 1e-12) return 0;
            const sIv = sxStadiumIntervals(line[0], line[1], T.S[0], T.S[1], T.hw), dIv = nearDisc ? sxDiscInterval(line[0], line[1], T.node, rI) : null;
            let stad = 0, both = 0;
            for (const iv of sIv) {
                stad += Math.max(0, iv[1] - iv[0]);
                if (dIv) both += Math.max(0, Math.min(iv[1], dIv[1]) - Math.max(iv[0], dIv[0]));
            }
            const disc = dIv ? Math.max(0, dIv[1] - dIv[0]) : 0, val = (disc > 0 ? disc * seglen / (2 * rI) : 0) + (stad - both > 0 ? (stad - both) * seglen / (2 * T.hw) : 0);
            return val > 0 ? val : 0;
        }
        function sxEvalGraze(geo, maps, i, j) {
            if (geo.sxRepExcl && sxIdxCloud(geo, i) === sxIdxCloud(geo, j)) return 0;
            if ((maps.cross.get(i * SX_PAIR_STRIDE + j) || 0) > 0 || (maps.cross.get(j * SX_PAIR_STRIDE + i) || 0) > 0) return 0;
            const A = geo.topics[i], B = geo.topics[j];
            // PER-DIRECTION GRAZE (ruled 2026-11-02 19:30 CST,
            // Jason): each capsule is a stadium at its OWN
            // topic's half-width, the graze band runs from the
            // wider half-width (neither centre line inside the
            // other's band) to the sum of the two half-widths
            // (bands just touching), and the overlap area is
            // priced EACH DIRECTION SEPARATELY - the direction
            // crossing B divides by B's own F squared, the
            // direction crossing A by A's own F squared; the
            // pair carries the sum. With equal depths this
            // reduces to the standing band, priced twice at
            // the shared F squared (once per direction).
            if (!sxBBHitPad(A.bbS, B.bbS, A.hw + B.hw)) return 0;
            const d = sxSegSegDist(A.S[0], A.S[1], B.S[0], B.S[1]);
            if (d < Math.max(A.hw, B.hw) || d >= A.hw + B.hw) return 0;
            const area = sxConvexClipArea(sxStadiumPoly(A.S[0], A.S[1], A.hw), sxStadiumPoly(B.S[0], B.S[1], B.hw));
            return area > 0 ? area / (B.F * B.F) + area / (A.F * A.F) : 0;
        }
        function sxEvalInner(geo, p, q) {
            if (geo.sxRepExcl && sxIdxCloud(geo, p) === sxIdxCloud(geo, q)) return 0;
            const A = sxInnerSeg(geo, p), B = sxInnerSeg(geo, q), ba = p < geo.topics.length ? geo.topics[p].bbI : geo.spokes[p - geo.topics.length].bb, bb = q < geo.topics.length ? geo.topics[q].bbI : geo.spokes[q - geo.topics.length].bb;
            if (!sxBBHit(ba, bb)) return 0;
            return sxProperIntersect(A[0], A[1], B[0], B[1]) ? 1 : 0;
        }
        function sxNewMaps() {
            return { cross: new Map, graze: new Map, inner: new Map, tc: 0, tg: 0, ti: 0, invT: null, invS: null, adjC: new Map, adjG: new Map, adjI: new Map };
        }
        function sxAdjTouch(maps, kind, k, add) {
            const adj = "cross" === kind ? maps.adjC : "graze" === kind ? maps.adjG : maps.adjI;
            if (!adj) return;
            const a = Math.floor(k / SX_PAIR_STRIDE), b = k % SX_PAIR_STRIDE;
            for (const e of [ a, b ]) {
                let s = adj.get(e);
                if (add) {
                    if (!s) adj.set(e, s = new Set);
                    s.add(k);
                } else if (s) {
                    s.delete(k);
                    if (!s.size) adj.delete(e);
                }
            }
        }
        function sxStorePair(geo, maps, kind, k, val) {
            const map = maps[kind];
            const old = map.get(k) || 0;
            if (old === val) return;
            if (old) { map.delete(k); sxInvAdd(geo, maps, kind, k, -old); sxAdjTouch(maps, kind, k, !1); }
            if (val > 0) { map.set(k, val); sxInvAdd(geo, maps, kind, k, val); sxAdjTouch(maps, kind, k, !0); }
            if ("cross" === kind) maps.tc += val - old; else if ("graze" === kind) maps.tg += val - old; else maps.ti += val - old;
        }
        function sxInvAdd(geo, maps, kind, k, delta) {
            if (!maps.invT) return;
            const N = geo.topics.length, a = Math.floor(k / SX_PAIR_STRIDE), b = k % SX_PAIR_STRIDE;
            if ("cross" === kind) {
                maps.invT[a] += delta > 0 ? 1 : -1;
                if (b < N) maps.invT[b] += delta > 0 ? 1 : -1; else maps.invS[b - N] += delta > 0 ? 1 : -1;
            } else if ("graze" === kind) {
                maps.invT[a] += delta > 0 ? 1 : -1, maps.invT[b] += delta > 0 ? 1 : -1;
            } else {
                if (a < N) maps.invT[a] += delta > 0 ? 1 : -1; else maps.invS[a - N] += delta > 0 ? 1 : -1;
                if (b < N) maps.invT[b] += delta > 0 ? 1 : -1; else maps.invS[b - N] += delta > 0 ? 1 : -1;
            }
        }
        function sxFullEval(geo, maps) {
            const N = geo.topics.length, M = N + geo.spokes.length;
            for (let v = 0; v < N; v++) for (let o = 0; o < M; o++) {
                if (o === v) continue;
                const val = sxEvalCross(geo, v, o);
                if (val > 0) sxStorePair(geo, maps, "cross", v * SX_PAIR_STRIDE + o, val);
            }
            for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
                const val = sxEvalGraze(geo, maps, i, j);
                if (val > 0) sxStorePair(geo, maps, "graze", i * SX_PAIR_STRIDE + j, val);
            }
            for (let p = 0; p < M; p++) for (let q = p + 1; q < M; q++) {
                const val = sxEvalInner(geo, p, q);
                if (val > 0) sxStorePair(geo, maps, "inner", p * SX_PAIR_STRIDE + q, val);
            }
            return { crossing: maps.tc, graze: maps.tg, inner: maps.ti, E: maps.tc + maps.tg + maps.ti };
        }
        // [SX-EVAL-END]
        // ---- Geometry build: derive SCC v2 segments from the solved tree ----
        // Mirrors Ar's draw path (topicSpokeEstimate + hub adjustments
        // + override multipliers; children ride their subcategory hub,
        // at Ar's label-clearance-extended radius). SCC DESIGN (owner's
        // ruling, 2026-10-23 + 2026-10-27; capsule-inversion correction
        // 2026-11-02; BAND-SHRINK redefinition, ruled 2026-11-02,
        // Jason - "the band shrinks to fit the letters; the 44 shrinks
        // to 22": the capsule definition CHANGES from centre line
        // ± one font size to centre line ± HALF a font size, so the
        // priced band (2 x hw = F) equals the painted midline stroke
        // (22 * font scale) exactly: ONE
        // capsule per spoke - the capsule S is the
        // PADDLE: centre line ± half a font size, from the label's inward
        // radius minus half a font size out PAST the end of the longest
        // slider (the paint's slider-end geometry, plus a little); and
        // a thin LINE back toward the branching point - for centre
        // spokes, back to the centre disc's RIM, never impinging on
        // the centre. The capsule prices what crosses the paddle out
        // where the sliders are; the inner line stretch prices the run
        // back toward the branching point. See finishTopic.
        function sxLabelClearance(radius, label, fontSize, iconR) {
            let r = radius;
            try {
                const fs = null == fontSize ? sxFontSize(3) : fontSize,
                      tabW = 5 * Za.measure(" ", fs, "topic"),
                      textW = Za.measure(label || "", fs) + tabW,
                      icon = null == iconR ? sxIconRadius(3) : iconR,
                      gap = Math.max(18, 6 * Za.measure(" ", fs, "topic"));
                const hub = typeof sxIconRadius === "function" ? sxIconRadius(2) : 88;
                for (let pass = 0; pass < 3; pass++) {
                    const need = hub + textW + icon + gap + 36;
                    if (!(Number.isFinite(need) && need > r)) break;
                    r = need;
                }
            } catch (_) {}
            return r;
        }
        function sxSccBuild(d) {
            const inn = sxSccInputs(d.branches), F = inn.F, iconR = inn.iconR[2], tagM = depth => inn.tagScale[depth], prof = inn.prof, geo = {
                F: F,
                Fmax: Math.max(inn.fontSize[1], inn.fontSize[2], inn.fontSize[3]),
                topics: [],
                spokes: [],
                movers: [],
                connSpoke: -1,
                t8: -1
            }, tagCache = new Map;
            const tagW = (id, depth) => {
                const key = id + "@" + depth;
                if (tagCache.has(key)) return tagCache.get(key);
                const g = Ge(id, prof);
                const w = g.single ? Za.controlTagWidth(g.labels[0], "single") * tagM(depth) : Math.max(...g.labels.map(x => Za.controlTagWidth(x, "pair") * tagM(depth)));
                return tagCache.set(key, w), w;
            };
            const pt = (x, y) => ({ x: x, y: y });
            const sxLabelLen = (txt, Fd) => {
                const n = Math.max(0, txt.length - 1), f = null == Fd ? F : Fd;
                return Math.max(0, Za.measure(txt, f, "topic") - (6 + .00948 * f) * n - .175);
            };
            d.branches.forEach((br, bi) => {
                const anchor = inn.branch[bi].anchor, cloud = br.entry.branch.name, fan = {
                    refAng: br.angle,
                    members: []
                };
                // Centre spoke line: from the centre disc's RIM out
                // to the branch anchor - never from the centre point
                // itself (the centre is never impinged; capsule-
                // inversion correction 2026-11-02). The rim is the
                // paint's own gen-1 spoke start (gen1SpokeBaseRadius:
                // the centre ring's outer edge, where Ar starts every
                // gen-1 spoke path), guarded to pr.centerRadius if
                // that helper is ever unavailable.
                const rimR = inn.rim, rimDx = anchor.x - pr.centerX, rimDy = anchor.y - pr.centerY, rimL = Math.hypot(rimDx, rimDy), rimStart = rimL > 1e-9 ? pt(pr.centerX + rimDx / rimL * Math.min(rimR, rimL), pr.centerY + rimDy / rimL * Math.min(rimR, rimL)) : pt(pr.centerX, pr.centerY);
                const catNodeId = (typeof catId === "function" ? (function(){ try { return catId(cloud); } catch(_){ return cloud; } })() : cloud);
                geo.spokes.push({
                    seg: [ rimStart, pt(anchor.x, anchor.y) ],
                    bb: null,
                    cloud: cloud,
                    kind: "center",
                    depth: 1,
                    gen: 1,
                    nodeId: catNodeId,
                    entry: null
                });
                if ("Connection & aftercare" === cloud) geo.connSpoke = geo.spokes.length - 1;
                (br.topics || []).forEach(item => {
                    const rec = item.topic, label = rec.label, isSub = !!rec.isSubcategory;
                    const drawH = w => {
                        const u = Za.topicSpokeEstimate(label, w || br.topicCloudRadius);
                        let h = u.spokeLength;
                        if (isSub) {
                            const hubR1 = typeof sxIconRadius === "function" ? sxIconRadius(1) : pr.categoryIcon / 2;
                            const hubR2 = typeof sxIconRadius === "function" ? sxIconRadius(2) : pr.subcategoryIcon / 2;
                            h = Math.max(h, hubR1 + hubR2 + 96, sxSpokeBase(item.cloudCount, 1)), h = Za.hubSpokeLength(label, u.fontSize, h, hubR1, hubR2);
                            let ov = mn.nodeOverrides && (mn.nodeOverrides[rec.id] || mn.nodeOverrides[label]);
                            if (!ov && mn.subcatOverrides) ov = mn.subcatOverrides[label];
                            if (ov && typeof ov.length === "number" && ov.length > 0) h *= ov.length;
                        } else {
                            let ov = mn.nodeOverrides && (mn.nodeOverrides[rec.id] || mn.nodeOverrides[label]);
                            if (!ov && mn.kinkOverrides) ov = mn.kinkOverrides[rec.id];
                            if (ov && typeof ov.length === "number" && ov.length > 0) h *= ov.length;
                        }
                        return h;
                    };
                    const mulOf = () => {
                        if (mn.nodeOverrides) {
                            const no = isSub ? (mn.nodeOverrides[rec.id] || mn.nodeOverrides[label]) : mn.nodeOverrides[rec.id];
                            if (no && typeof no.length === "number" && no.length > 0) return no.length;
                        }
                        const ov = isSub ? mn.subcatOverrides && mn.subcatOverrides[label] : mn.kinkOverrides && mn.kinkOverrides[rec.id];
                        return ov && typeof ov.length === "number" && ov.length > 0 ? ov.length : 1;
                    };
                    const entry = {
                        kind: isSub ? "sub" : "topic",
                        item: item,
                        rec: rec,
                        cloud: cloud,
                        subcloud: isSub ? label : null,
                        branchEntry: br,
                        anchor: anchor,
                        fan: fan,
                        drawH: drawH,
                        mul: mulOf(),
                        depth: isSub ? 2 : (item.depth || 2),
                        gen: isSub ? 2 : (item.depth || 2),
                        nodeId: rec.id || label,
                        node: null,
                        hubEntry: null,
                        children: [],
                        spokeIx: -1
                    };
                    if (isSub) {
                        const subNodeId = rec.id || (typeof Un === "function" ? (function(){ try { return Un(cloud, label); } catch(_){ return label; } })() : label);
                        geo.spokes.push({
                            seg: null,
                            bb: null,
                            cloud: cloud,
                            subcloud: label,
                            kind: "sub",
                            depth: 2,
                            gen: 2,
                            nodeId: subNodeId,
                            entry: entry
                        });
                        entry.spokeIx = geo.spokes.length - 1;
                    } else {
                        entry.topicIx = geo.topics.length;
                        geo.topics.push(entry);
                        if ("t0008" === rec.id) geo.t8 = entry.topicIx;
                    }
                    fan.members.push(entry);
                    if (isSub) (item.children || []).forEach(wrap => {
                        const crec = wrap.child;
                        if (!crec || !crec.isStaticTopic) return;
                        const cmul = (() => {
                            if (mn.nodeOverrides) {
                                const no = mn.nodeOverrides[crec.id];
                                if (no && typeof no.length === "number" && no.length > 0) return no.length;
                            }
                            const ov = mn.kinkOverrides && mn.kinkOverrides[crec.id];
                            return ov && typeof ov.length === "number" && ov.length > 0 ? ov.length : 1;
                        })();
                        const centry = {
                            kind: "topic",
                            item: wrap,
                            rec: crec,
                            cloud: cloud,
                            subcloud: label,
                            branchEntry: br,
                            parentItem: item,
                            hubEntry: entry,
                            fan: null,
                            mul: cmul,
                            depth: wrap.depth || 3,
                            gen: wrap.depth || 3,
                            nodeId: crec.id || crec.label,
                            topicIx: geo.topics.length
                        };
                        geo.topics.push(centry);
                        entry.children.push(centry);
                        if ("t0008" === crec.id) geo.t8 = centry.topicIx;
                    });
                });
            });
            // Second pass: children fans + per-entry geometry closures.
            geo.topics.forEach(e => {
                if (e.hubEntry) {
                    if (!e.hubEntry.childFan) e.hubEntry.childFan = {
                        refAng: e.hubEntry.item.cloudAngle,
                        members: []
                    };
                    e.fan = e.hubEntry.childFan, e.fan.members.push(e);
                }
            });
            const finishTopic = e => {
                const isChild = !!e.hubEntry;
                // PER-DEPTH BAND (font law 2026-11-02 17:24): the
                // capsule band contains the topic's own font, so
                // each topic carries its own F / half-width hw at
                // its own depth (direct kink 2, kink under a
                // subcategory 3) from sxFontSize - the evals price
                // against these, never the global geo.F / geo.hw.
                e.F = sxFontSize(isChild ? 3 : 2), e.hw = e.F / 2;
                e.getW = isChild ? () => e.item.cloudRadius || e.parentItem.childCloudRadius || 270 : () => e.item.cloudRadius || e.branchEntry.topicCloudRadius;
                e.setW = v => { e.item.cloudRadius = v; };
                e.getA = () => e.item.cloudAngle;
                e.setA = v => { e.item.cloudAngle = v; };
                e.compute = () => {
                    const hub = isChild ? e.hubEntry.node : e.anchor, ang = e.getA(), w = e.getW();
                    let h, P;
                    if (isChild) {
                        h = w * e.mul;
                        // PAINT'S DRAWN LENGTH (divergence fix,
                        // 2026-11-02; kept by the capsule-inversion
                        // correction, same day): a static child's
                        // drawn radius in Ar's paint is NOT the solved
                        // radius - Ar extends it by its label-clearance
                        // loop (the loop below, verbatim) until the
                        // label and icon fit the spoke. This extended
                        // length h is the spoke's painted length: it
                        // seats the node (the paint's icon seat) and
                        // it is the reach from which the capsule's
                        // OUTER end (the paddle's end, past the
                        // sliders) is measured below - the extension
                        // belongs to the capsule's outer reach.
                        h = sxLabelClearance(h, e.rec.label, inn.fontSize[3], inn.iconR[3]);
                        P = Za.cloudLabel(h, pr.subcategoryIcon / 2).labelOffset;
                    } else {
                        h = e.drawH(w), P = Za.topicLabelOffset(h, Za.cloudLabel(h, pr.categoryIcon / 2).labelOffset, e.item.cloudIndex);
                    }
                    if (e.C === undefined) e.C = sxLabelLen(isChild ? e.rec.label : "\u00A0" + e.rec.label, e.F);
                    const ux = Math.cos(ang), uy = Math.sin(ang), a2 = pt(hub.x + ux * (P - e.F / 2), hub.y + uy * (P - e.F / 2));
                    // CAPSULE-INVERSION CORRECTION (2026-11-02,
                    // owner's design 2026-10-23 + 2026-10-27): the
                    // capsule S is the PADDLE - its outer end b is
                    // the end of the rating controls when the map
                    // sliders show, and the icon's extreme end when
                    // they do not (map-sliders toggle, ruled
                    // 2026-11-13). The paddle runs from a2 (the
                    // label's inward radius P, minus half a font
                    // size - the capsule half-width, since the
                    // 2026-11-02 band shrink) all the way out to
                    // capEnd. There is NO sEnd label floor: the icon
                    // is set relative to the label end (seat = P +
                    // label length + 1 + icon radius), so the label
                    // can neither run into the icon nor outrun the
                    // sliders, which extend past the icon - there is
                    // no label-dominated regime, and the tag tail
                    // (+6 + half a tag) belongs only to the slider
                    // end, never to a label end. The slider end is
                    // the paint's own end-of-controls geometry -
                    // the icon seated at the spoke's full drawn
                    // length h (for children, h already carries the
                    // paint's label-clearance extension above),
                    // plus the icon radius, 6, and half a control
                    // tag. capEnd is that outer reach; the scored
                    // midline M (the foreign centre line other
                    // capsules are priced against, and the
                    // centreline the interim capsule paint draws)
                    // runs from the hub - the branching point - out
                    // to the same capEnd, so a foreign spoke is
                    // present everywhere its own paddle is; its
                    // inner stretch I (hub -> a2) is the thin line
                    // the inner count prices on the run back toward
                    // the branching point. The node seat stays the
                    // paint's icon seat (hub + u*h), so the interim
                    // paint's dots sit where the full paint seats
                    // the icons. The divergence fix (2026-11-02)
                    // had this exactly reversed - midline stretched
                    // to the icon, capsule stopping short of the
                    // sliders; that arrangement must not be
                    // reintroduced under any other name.
                    const capEnd = (inn.mn && inn.mn.mapSliders ? h + iconR + 6 + tagW(e.rec.id, isChild ? 3 : 2) / 2 : h + iconR), b = pt(hub.x + ux * capEnd, hub.y + uy * capEnd), bM = pt(hub.x + ux * capEnd, hub.y + uy * capEnd);
                    e.hub = hub, e.ang = ang, e.h = h, e.P = P, e.capEnd = capEnd;
                    e.M = [ pt(hub.x, hub.y), bM ], e.S = [ a2, b ], e.I = [ pt(hub.x, hub.y), a2 ];
                    e.bbS = sxBB(e.S[0], e.S[1], 0), e.bbI = sxBB(e.I[0], e.I[1], 0), e.bbM = sxBB(e.M[0], e.M[1], 0);
                    e.node = pt(hub.x + ux * h, hub.y + uy * h);
                    // CAPSULE STAGE 2 (ruled 2026-11-02 14:05): the
                    // topic's icon disc for sxEvalCross - centre at
                    // the paint's icon seat (e.node, just set),
                    // radius sxIconRadius at the topic's depth
                    // (direct kink 2, kink under a subcategory 3).
                    // bbD is the disc bbox; bbU unions it with the
                    // paddle segment's bbox and serves as the
                    // crossing prefilter bbox.
                    e.iconR = inn.iconR[isChild ? 3 : 2];
                    e.bbD = [ e.node.x - e.iconR, e.node.y - e.iconR, e.node.x + e.iconR, e.node.y + e.iconR ];
                    e.bbU = [ Math.min(e.bbS[0], e.bbD[0]), Math.min(e.bbS[1], e.bbD[1]), Math.max(e.bbS[2], e.bbD[2]), Math.max(e.bbS[3], e.bbD[3]) ];
                };
            };
            const subs = [];
            geo.spokes.forEach(sp => { if (sp.entry) subs.push(sp.entry); });
            subs.forEach(e => {
                e.getW = () => e.item.cloudRadius || e.branchEntry.topicCloudRadius;
                e.setW = v => { e.item.cloudRadius = v; };
                e.getA = () => e.item.cloudAngle;
                e.setA = v => { e.item.cloudAngle = v; };
                e.compute = () => {
                    const ang = e.getA(), w = e.getW(), h = e.drawH(w), ux = Math.cos(ang), uy = Math.sin(ang);
                    e.hub = e.anchor, e.ang = ang, e.h = h;
                    e.P = Za.topicLabelOffset(h, Za.cloudLabel(h, pr.categoryIcon / 2).labelOffset, e.item.cloudIndex);
                    e.node = pt(e.anchor.x + ux * h, e.anchor.y + uy * h);
                    const sp = geo.spokes[e.spokeIx];
                    sp.seg = [ pt(e.anchor.x, e.anchor.y), pt(e.node.x, e.node.y) ], sp.bb = sxBB(sp.seg[0], sp.seg[1], 0);
                };
            });
            geo.topics.forEach(finishTopic);
            geo.spokes.forEach(sp => { if (!sp.entry) sp.bb = sxBB(sp.seg[0], sp.seg[1], 0); });
            // Compute in dependency order: subcategories first, then topics.
            subs.forEach(e => e.compute());
            geo.topics.forEach(e => e.compute());
            // Fans: sort members by start angle (wrapped around the fan ref).
            const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
            const sortFan = fan => {
                fan.members.forEach(e => { e.rel0 = wrapA(e.getA() - fan.refAng); });
                fan.members.sort((a, b) => a.rel0 - b.rel0);
                fan.members.forEach((e, i) => { e.fanPos = i; });
            };
            const fansSeen = new Set;
            geo.topics.forEach(e => { if (e.fan && !fansSeen.has(e.fan)) fansSeen.add(e.fan), sortFan(e.fan); });
            subs.forEach(e => { if (e.fan && !fansSeen.has(e.fan)) fansSeen.add(e.fan), sortFan(e.fan); });
            // Movers in tree order: topics + subcategories (447 on the blank map).
            const moverOf = e => {
                const startW = e.getW(), startA = e.getA(), h0 = e.h, P0 = e.P;
                let floorW = Math.max(0, startW - (h0 - P0) / (e.mul > 0 ? e.mul : 1));
                if (Number.isFinite(e.item._radialFit20)) floorW = Math.max(floorW, e.item._radialFit20);
                return {
                    entry: e,
                    name: e.rec.label,
                    kind: e.kind,
                    floorW: floorW,
                    startW: startW,
                    startA: startA,
                    topics: "topic" === e.kind ? [ e.topicIx ] : e.children.map(c => c.topicIx),
                    spokes: "sub" === e.kind ? [ e.spokeIx ] : []
                };
            };
            d.branches.forEach(br => {
                (br.topics || []).forEach(item => {
                    const e = geo.topics.find(t => t.item === item) || subs.find(t => t.item === item);
                    if (!e) return;
                    geo.movers.push(moverOf(e));
                    if ("sub" === e.kind) e.children.forEach(c => geo.movers.push(moverOf(c)));
                });
            });
            geo.wrapA = wrapA;
            return geo;
        }
        // CAPSULE STAGE 2: coarse cell size for the disc grids
        // sxBuildGrid builds alongside the fine grid - large
        // enough that an icon disc's bbox covers only a handful
        // of cells.
        function sxCellKey(x, y) {
            return x + ":" + y;
        }
        function sxLenConvert(curLen, delivered, target) {
            return Number.isFinite(curLen) && curLen > 0 && Number.isFinite(delivered) && delivered > 0 && Number.isFinite(target) && target > 0 ? curLen * target / delivered : NaN;
        }
        const SX_DISC_CELL = 65536;
        // ---- Uniform grid (cell 256), rebuilt per sweep: candidate prefilter ----
        function sxBuildGrid(geo) {
            const grid = new Map, N = geo.topics.length, pad = 2 * (geo.Fmax || geo.F) + SX_GRID_PAD;
            const add = (ix, bb) => {
                const x0 = Math.floor((bb[0] - pad) / SX_CELL), y0 = Math.floor((bb[1] - pad) / SX_CELL), x1 = Math.floor((bb[2] + pad) / SX_CELL), y1 = Math.floor((bb[3] + pad) / SX_CELL);
                for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
                    const k = sxCellKey(x, y);
                    let s = grid.get(k);
                    if (!s) grid.set(k, s = new Set);
                    s.add(ix);
                }
            };
            geo.topics.forEach((e, i) => {
                add(i, e.bbM), add(i, e.bbS), add(i, e.bbI);
            });
            geo.spokes.forEach((sp, j) => add(N + j, sp.bb));
            geo.grid = grid;
            // CAPSULE STAGE 2: coarse disc grids for the icon
            // discs. A disc's diameter (tens of thousands of
            // world units) would flood the fine grid's 256-cell
            // area fill, so discs and line owners are ALSO
            // registered on a coarse grid (cell 65536): discV
            // maps a coarse cell to the topics whose disc bbox
            // covers it, discL to every line owner (topics by
            // midline bbox, spokes by segment bbox) whose bbox
            // covers it. sxReprice consults them only for cross
            // candidates; sxEvalCross's own prefilters still
            // decide every pair.
            const discV = new Map, discL = new Map;
            const addC = (map, ix, bb) => {
                if (!bb) return;
                const x0 = Math.floor(bb[0] / SX_DISC_CELL), y0 = Math.floor(bb[1] / SX_DISC_CELL), x1 = Math.floor(bb[2] / SX_DISC_CELL), y1 = Math.floor(bb[3] / SX_DISC_CELL);
                for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
                    const k = sxCellKey(x, y);
                    let s = map.get(k);
                    if (!s) map.set(k, s = new Set);
                    s.add(ix);
                }
            };
            geo.topics.forEach((e, i) => {
                addC(discV, i, e.bbD), addC(discL, i, e.bbM);
            });
            geo.spokes.forEach((sp, j) => addC(discL, N + j, sp.bb));
            geo.discV = discV, geo.discL = discL;
        }
        function sxGridNearSeg(geo, a, b, targetSet) {
            // Corridor query: walk the segment in <=128 wu steps and union the
            // 3x3 cell neighbourhood of each sample. Any element whose stored
            // (2F + SX_GRID_PAD)-inflated bbox can pair with this segment
            // registers in one of those cells; whole-bbox queries over long
            // diagonal spokes drown in bbox-rejected false candidates.
            const out = targetSet || new Set, len = Math.hypot(b.x - a.x, b.y - a.y), steps = Math.max(1, Math.ceil(len / 128));
            let prevCx = -999999, prevCy = -999999;
            for (let s = 0; s <= steps; s++) {
                const px = a.x + (b.x - a.x) * s / steps, py = a.y + (b.y - a.y) * s / steps, cx = Math.floor(px / SX_CELL), cy = Math.floor(py / SX_CELL);
                if (cx === prevCx && cy === prevCy) continue;
                prevCx = cx; prevCy = cy;
                for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) {
                    const set = geo.grid.get(sxCellKey(x, y));
                    if (set) set.forEach(ix => out.add(ix));
                }
            }
            return out;
        }
        function sxGridNear(geo, a, b) {
            const out = new Set, x0 = Math.floor(Math.min(a.x, b.x) / SX_CELL), y0 = Math.floor(Math.min(a.y, b.y) / SX_CELL), x1 = Math.floor(Math.max(a.x, b.x) / SX_CELL), y1 = Math.floor(Math.max(a.y, b.y) / SX_CELL);
            for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
                const s = geo.grid.get(sxCellKey(x, y));
                if (s) s.forEach(ix => out.add(ix));
            }
            return out;
        }
        // ---- Layer 2: Persistent scratch collections for sxReprice ----
        // Pre-allocated Sets reused across all trial steps to eliminate
        // thousands of object allocation and garbage collection cycles per sweep.
        const sxScratchA = new Set, sxScratchL = new Set;
        const sxScratchCandC = new Set, sxScratchCandG = new Set, sxScratchCandI = new Set;
        const sxScratchNear = new Set, sxScratchSeenDisc = new Set;

        // ---- Incremental repricing: delete + recompute every pair touching ----
        // the affected topics (A) or spokes (Bs); returns the tracked-E delta.
        function sxReprice(geo, maps, A, Bs) {
            const N = geo.topics.length, before = maps.tc + maps.tg + maps.ti;
            const affT = sxScratchA; affT.clear();
            const affL = sxScratchL; affL.clear();
            for (let idx = 0; idx < A.length; idx++) { const i = A[idx]; affT.add(i); affL.add(i); }
            for (let idx = 0; idx < Bs.length; idx++) { affL.add(N + Bs[idx]); }

            // Candidate pairs from the grid around the affected segments.
            const candC = sxScratchCandC; candC.clear();
            const candG = sxScratchCandG; candG.clear();
            const candI = sxScratchCandI; candI.clear();

            const near = (a, b, self) => {
                const nearSet = sxScratchNear; nearSet.clear();
                sxGridNearSeg(geo, a, b, nearSet);
                nearSet.forEach(ix => {
                    if (ix === self) return;
                    if (self < N) candC.add(self * SX_PAIR_STRIDE + ix);
                    if (ix < N) candC.add(ix * SX_PAIR_STRIDE + self);
                    if (self < N && ix < N) candG.add(Math.min(self, ix) * SX_PAIR_STRIDE + Math.max(self, ix));
                    candI.add(Math.min(self, ix) * SX_PAIR_STRIDE + Math.max(self, ix));
                });
            };
            // CAPSULE STAGE 2: disc candidates from the coarse
            // disc grids.
            const nearDiscLine = (a, b, self) => {
                if (!geo.discV) return;
                const len = Math.hypot(b.x - a.x, b.y - a.y), steps = Math.max(1, Math.ceil(len / (SX_DISC_CELL / 2)));
                const seen = sxScratchSeenDisc; seen.clear();
                for (let s = 0; s <= steps; s++) {
                    const k = sxCellKey(Math.floor((a.x + (b.x - a.x) * s / steps) / SX_DISC_CELL), Math.floor((a.y + (b.y - a.y) * s / steps) / SX_DISC_CELL));
                    if (seen.has(k)) continue;
                    seen.add(k);
                    const set = geo.discV.get(k);
                    if (set) set.forEach(ix => { if (ix !== self) candC.add(ix * SX_PAIR_STRIDE + self); });
                }
            };
            const nearDiscVictim = i => {
                if (!geo.discL) return;
                const bb = geo.topics[i].bbD;
                if (!bb) return;
                const x0 = Math.floor(bb[0] / SX_DISC_CELL), y0 = Math.floor(bb[1] / SX_DISC_CELL), x1 = Math.floor(bb[2] / SX_DISC_CELL), y1 = Math.floor(bb[3] / SX_DISC_CELL);
                for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
                    const set = geo.discL.get(sxCellKey(x, y));
                    if (set) set.forEach(jx => { if (jx !== i) candC.add(i * SX_PAIR_STRIDE + jx); });
                }
            };
            for (let idx = 0; idx < A.length; idx++) {
                const i = A[idx], e = geo.topics[i];
                near(e.S[0], e.S[1], i), near(e.M[0], e.M[1], i), near(e.I[0], e.I[1], i);
                nearDiscLine(e.M[0], e.M[1], i), nearDiscVictim(i);
            }
            for (let idx = 0; idx < Bs.length; idx++) {
                const j = Bs[idx], sp = geo.spokes[j];
                near(sp.seg[0], sp.seg[1], N + j);
                nearDiscLine(sp.seg[0], sp.seg[1], N + j);
            }
            // Existing stored pairs touching the affected set must be redone too
            // (per-element adjacency indexes, maintained by sxStorePair).
            const adjScan = (adj, cand) => {
                if (!adj) return;
                affL.forEach(e => {
                    const s = adj.get(e);
                    if (s) s.forEach(k => cand.add(k));
                });
                affT.forEach(e => {
                    const s = adj.get(e);
                    if (s) s.forEach(k => cand.add(k));
                });
            };
            adjScan(maps.adjC, candC), adjScan(maps.adjG, candG), adjScan(maps.adjI, candI);
            candC.forEach(k => {
                const v = Math.floor(k / SX_PAIR_STRIDE), o = k % SX_PAIR_STRIDE;
                const T = geo.topics[v], lb = o < N ? geo.topics[o].bbM : geo.spokes[o - N].bb;
                // Layer 1 fast bounding-box filter: if padded bounding boxes don't intersect, eval is guaranteed 0
                const val = (T && lb && sxBBHitPad(T.bbU || T.bbS, lb, T.hw)) ? sxEvalCross(geo, v, o) : 0;
                sxStorePair(geo, maps, "cross", k, val);
            });
            candG.forEach(k => {
                const i = Math.floor(k / SX_PAIR_STRIDE), j = k % SX_PAIR_STRIDE;
                const A = geo.topics[i], B = geo.topics[j];
                // Layer 1 fast bounding-box filter: if padded bounding boxes don't intersect, eval is guaranteed 0
                const val = (A && B && sxBBHitPad(A.bbS, B.bbS, A.hw + B.hw)) ? sxEvalGraze(geo, maps, i, j) : 0;
                sxStorePair(geo, maps, "graze", k, val);
            });
            candI.forEach(k => {
                const p = Math.floor(k / SX_PAIR_STRIDE), q = k % SX_PAIR_STRIDE;
                const ba = p < N ? geo.topics[p].bbI : geo.spokes[p - N].bb, bb = q < N ? geo.topics[q].bbI : geo.spokes[q - N].bb;
                // Layer 1 fast bounding-box filter: if bounding boxes don't intersect, inner eval is guaranteed 0
                const val = (ba && bb && sxBBHit(ba, bb)) ? sxEvalInner(geo, p, q) : 0;
                sxStorePair(geo, maps, "inner", k, val);
            });
            return maps.tc + maps.tg + maps.ti - before;
        }
