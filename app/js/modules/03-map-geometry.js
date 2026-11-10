        function frBuildTree() {
                const e = Ia(), t = t => $n ? $n.has(t) : !e || function(e, t) {
                    const n = ft[t], i = n && "group" === n.kind && Array.isArray(n.sourceIds) ? n.sourceIds.filter(e => vt[e] && vht[e]) : [];
                    if (i.length) return i.every(t => {
                        const n = Ca(e, vt[t], Qe[t]);
                        return null !== n && n >= Aa(vpt[t]);
                    });
                    const a = n && "group" === n.kind && Array.isArray(n.sourceProfiles) ? n.sourceProfiles.filter(e => e && (e.veilEnabled ?? e.netEnabled)) : [];
                    if (a.length) return a.every(t => {
                        const n = Ca(e, t.ratings, t.annotations);
                        return null !== n && n >= Aa(null != t.veil ? t.veil : t.net);
                    });
                    const r = Ca(e, vt[t], Qe[t]);
                    return null !== r && r >= Aa(vpt[t]);
                }(t, Mt), n = Lt ? ri().find(e => e.id === Lt) : null, i = Lt && (qn[Lt] || Xn(Lt) || n), a = i && i.parentId;
                const hbSrc = (() => {
                    const rec = ft[Mt], ids = rec && "group" === rec.kind && Array.isArray(rec.sourceIds) ? rec.sourceIds.filter(id => vt[id]) : [];
                    if (ids.length) return ids.map(id => [ vt[id], Qe[id] ]);
                    const profs = rec && "group" === rec.kind && Array.isArray(rec.sourceProfiles) ? rec.sourceProfiles.filter(p => p) : [];
                    return profs.length ? profs.map(p => [ p.ratings, p.annotations ]) : [ [ vt[Mt], Qe[Mt] ] ];
                })(), hbRated = id => hbSrc.some(([r, a]) => null !== Ca(id, r, a)), hbCtx = hbSrc.some(([r, a]) => {
                    const ks = new Set([ ...Object.keys(r || {}), ...Object.keys(a || {}) ]);
                    for (const k of ks) if (null !== Ca(k, r, a)) return !0;
                    return !1;
                }); /* DIMFIX F1 (extends HUB-BACKBONE): rating-presence for the hub dim, computed from ACTUAL ratings over the active context (groups: rated-in-any source), never routed through the Net visibility filter t() — with Net off t() passes every topic, so an allImported-based stamp can never fire for ordinary profiles. The source resolution mirrors t()'s cascade minus its Net gates (no ht / netEnabled filtering) and minus its threshold. hbCtx is the Finding C guard (owner-ruled 2026-10-23): a context with no ratings anywhere flags nothing, so a zero-rating profile stands at full register. */
                let r = Math.max(0, 560 - h.length);
                return h.slice().filter(e => function(e, t = Mt) {
                    return !Object.keys(vt).length || !(!t || !vt[t]) && (!(!$n || !$n.has(catId(e.name))) || !Ia(t) || Ma(e, t));
                }(e)).map(e => {
                    const i = catId(e.name), o = rn.has(e.name), s = DETAIL_CAPS[mapDetailLevel], l = !En && !$n && Number.isFinite(s), c = G(e.subcategories?.length ? (e.parentTopics || []).map(e => ({
                        id: Wn(e),
                        label: sxName(e),
                        isSubcategory: !1
                    })).concat(e.subcategories.map(t => ({
                        id: Un(e.name, t.name),
                        label: t.name,
                        isSubcategory: !0,
                        group: t
                    }))) : e.topics.map(e => ({
                        id: Wn(e),
                        label: sxName(e),
                        isSubcategory: !1
                    })), e => e.isSubcategory ? K(e.group.topics) : H(e.label)), d = e => e.isSubcategory ? e.group.topics.some(e => t(Wn(e))) : t(e.id), u = t => Boolean(Tt && (t.label.toLowerCase().includes(Tt) || e.name.toLowerCase().includes(Tt) || t.isSubcategory && t.group.topics.some(e => e.toLowerCase().includes(Tt)))), p = c.filter((e, t) => {
                        const n = e.id === Lt || e.id === a || e.isSubcategory && e.group.topics.some(e => Wn(e) === Lt);
                        /* HUB-BACKBONE W1: a subcategory child stands on its own standing (the backbone); d(e) is unchanged because it also feeds densityHidden */
                        return (d(e) || e.isSubcategory) && (!l || t < s || topicRatedForDetail(e.id) || e.isSubcategory && e.group.topics.some(e => topicRatedForDetail(Wn(e))) || u(e) || n);
                    }), h = l ? c.filter(d).length - p.length : 0, g = fi(i, p.map(e => e.id)), m = [];
                    p.forEach(i => {
                        if (Dn || r <= 0) return;
                        const s = u(i);
                        if (!En && !o && !s) return;
                        if (!En && o && !$n && g.mode && !i.isSubcategory && !g.visible.includes(i.id) && !s) return; /* HUB-BACKBONE W2: subcategories are exempt from the rated-topic filter guard — a hub's presence must not depend on a rating predicate; its children's own filtering is untouched */
                        if (r--, i.isSubcategory) {
                            const n = G(i.group.topics.filter(e => t(Wn(e))), H).map(t => ({
                                id: Wn(t),
                                label: sxName(t),
                                branch: e.name,
                                kind: "Topic",
                                risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(t)) || {}).risk),
                                parentId: i.id,
                                isStaticTopic: !0
                            })), a = fi(i.id, n.map(e => e.id)), o = on.has(i.id) ? n.filter(e => a.visible.includes(e.id) || e.id === Lt || Tt && e.label.toLowerCase().includes(Tt)).filter((e, t) => !Number.isFinite(DETAIL_CAPS[mapDetailLevel]) || t < DETAIL_CAPS[mapDetailLevel] || topicRatedForDetail(e.id)).slice(0, r) : [];
                            r = Math.max(0, r - o.length);
                            const s = gr(i.label, hr(2), pr.subcategoryIcon, 18, 176), l = o.reduce((e, t) => e + gr(t.label, hr(3), pr.topicIcon, 15, 112), 0);
                            return void m.push({
                                id: i.id,
                                label: i.label,
                                isSubcategory: !0,
                                group: i.group,
                                children: o,
                                weight: 1 + o.length,
                                minDemand: Math.max(s, l),
                                allImported: n,
                                topicFilter: a,
                                unratedHub: !i.group.topics.some(e => hbRated(Wn(e))) /* DIMFIX F1, owner supersession 2026-10-28: a wholly-unrated hub dims in every context — the Finding C guard (no dim when a context has no ratings anywhere) no longer applies, so zero-rating profiles and the no-profile unrated map dim their hubs too */
                            });
                        }
                        const l = i.id, c = i.label;
                        let d = G(ri().filter(e => e.parentId === l && t(e.id)), e => H(e.label)).slice(0, r);
                        a === l && n && !d.some(e => e.id === n.id) && (d = [ n, ...d.slice(0, Math.max(0, r - 1)) ]);
                        const p = fi(l, d.map(e => e.id)), h = on.has(l) ? d.filter(e => p.visible.includes(e.id) || e.id === Lt).slice(0, r) : [];
                        r = Math.max(0, r - h.length);
                        const f = gr(c, hr(2), pr.topicIcon, 18, 176), y = h.reduce((e, t) => e + gr(t.label, hr(3), pr.importedIcon, 15, 112), 0);
                        m.push({
                            id: l,
                            label: c,
                            isSubcategory: !1,
                            children: h,
                            weight: 1 + h.length,
                            minDemand: Math.max(f, y),
                            allImported: d,
                            topicFilter: p
                        });
                    });
                    // Antipodal subcategories (Build 2026-10-17_0044): with
                    // mn.subcatOrder on, a subcategorized branch's gen-2
                    // sibling list is reordered by kink count (subcategory =
                    // its topic count, loose topic = 1) so the densest
                    // subcategory sits at the center of the branch's angular
                    // sector, flanked on both sides by the sparsest entries,
                    // then the next-densest pair, alternating outward —
                    // dense, sparse, 2nd-dense, 2nd-sparse from the center.
                    // Only the display order changes; membership, weights
                    // and demands were already computed above. Off keeps the
                    // default popularity order.
                    if (mn.subcatOrder && e.subcategories && e.subcategories.length > 1 && m.length > 2 && m.some(entry => entry.isSubcategory)) {
                        const weightOf = entry => entry.isSubcategory ? entry.group && entry.group.topics ? entry.group.topics.length : 1 : 1, desc = m.slice().sort((a, b) => weightOf(b) - weightOf(a) || a.label.localeCompare(b.label)), n = desc.length, center = Math.floor((n - 1) / 2), out = new Array(n);
                        out[center] = desc[0];
                        let denseIdx = 1, sparseIdx = n - 1, takeDense = !1;
                        for (let d = 1; d <= n; d++) {
                            const positions = [];
                            if (center - d >= 0 && positions.push(center - d), center + d < n && positions.push(center + d), !positions.length) break;
                            for (const p of positions) denseIdx <= sparseIdx && (out[p] = takeDense ? desc[denseIdx++] : desc[sparseIdx--]);
                            takeDense = !takeDense;
                        }
                        for (let i = 0; i < n; i++) m[i] = out[i];
                    }
                    const f = gr(e.name, hr(1), pr.categoryIcon, 25), y = m.reduce((e, t) => e + t.minDemand, 0);
                    return {
                        branch: e,
                        catId: i,
                        selected: o,
                        filter: g,
                        topics: m,
                        densityHidden: h,
                        minDemand: Math.max(f, y),
                        weight: Math.max(1, m.reduce((e, t) => e + t.weight, 0))
                    };
                });
            }
        function frAssignCategoryAngles(n, i) {
            // Base category spokes: evenly spaced, with only explicit per-branch angle overrides.
            // Proportional fan (Build 2026-10-16_2206): with mn.propFan on, a spoke
            // instead keeps the center of its allocated sector (e.start + e.sector / 2,
            // the angle allocateSectors returned), so each branch's angular width is
            // proportional to its topic count rather than an equal 2π/count slice.
                        n.forEach((e, t) => {
                const n = mn.branchOverrides && mn.branchOverrides[e.entry.branch.name] || {};
                e.angle = (mn.propFan ? e.start + e.sector / 2 : -Math.PI / 2 + t * Math.PI * 2 / i) + (Number(n.angle) || 0) * Math.PI / 180;
            });
        }
        function frAllocateTopicSectors(n, a, r) {
            n.forEach(e => {
                const t = e.entry, n = Math.min(.025 * e.sector, Math.PI / 180), i = e.start + n, o = Math.max(.001, e.sector - 2 * n);
                e.topics = mr(t.topics.map(e => ({
                    topic: e,
                    label: e.label,
                    weight: e.weight,
                    minDemand: e.minDemand
                })), i, o, hr(2), pr.topicIcon, 18, 196), e.topics.forEach(n => {
                    n.branchName = t.branch.name, n.startAngle = e.angle, a.push(n);
                    const i = n.topic, o = Math.min(.02 * n.sector, Math.PI / 240), s = n.start + o, l = Math.max(.001, n.sector - 2 * o);
                    n.children = mr(i.children.map(e => ({
                        child: e,
                        label: e.label,
                        weight: 1
                    })), s, l, hr(3), pr.importedIcon, 15, 118), n.children.forEach(e => {
                        e.branchName = t.branch.name, e.parentTopic = i, e.startAngle = n.angle, r.push(e);
                    });
                });
            });
        }
        // Cloud radius in this stage carries only the global collision
        // mode factor; branch/subcategory groups hold no preset shrink
        // factor of their own.
        function frCloudLayout(n) {
            n.forEach(e => {
                const t = e.topics, n = t.length, i = e.angle;
                e.topicCloudRadius = Math.max(er.minimumRadius, n * er.pitch / er.spread / .82) * ("grow" === mn.collision ? 1.24 : "shrink" === mn.collision ? .74 : "off" === mn.collision ? .58 : 1), 
                t.forEach((e, t) => {
                    e.cloudCount = n, e.cloudIndex = t, e.cloudAngle = function(e, t, n) {
                        const i = Math.max(1, Number(n) || 1);
                        if (1 === i) return tr(e);
                        const a = e + Math.PI, r = (Math.max(0, Math.min(i - 1, Number(t) || 0)) + .5) / i;
                        return tr(a - er.halfExclusion - er.spread * r);
                    }(i, t, n);
                    try {
                        var _ao = 0;
                        if (e.topic && e.topic.isSubcategory && mn.subcatAngleOffsets) {
                            var _sao = mn.subcatAngleOffsets[e.topic.label];
                            if (_sao && typeof _sao.angle === "number") _ao = _sao.angle;
                        } else if (e.topic && !e.topic.isSubcategory && mn.kinkAngleOffsets) {
                            var _kao = mn.kinkAngleOffsets[e.topic.id];
                            if (_kao && typeof _kao.angle === "number") _ao = _kao.angle;
                        }
                        if (_ao) e.cloudAngle = tr(e.cloudAngle + _ao * Math.PI / 180);
                    } catch (_) { __sxErrLog("layout-override", _); }
                }), t.filter(e => e.topic.isSubcategory).forEach(e => {
                    const t = e.children.length, n = rr.cloudRadiusFor(t);
                    e.childCloudRadius = n;
                    const i = rr.stepForRadius(n), a = rr.childFanAngles(e.cloudAngle, t, i);
                    var cloudMul = 1;
                    try { var so = mn.subcatOverrides && mn.subcatOverrides[e.topic && e.topic.label]; if (so) { if (typeof so.cloud === "number" && so.cloud > 0) cloudMul = so.cloud; } } catch (_) { __sxErrLog("layout-override", _); }
                    e.children.forEach((e, i) => {
                        // Fit start (E4): a fit child's radius starts at
                        // its target; unarmed children keep the legacy
                        // cloud-radius computation exactly.
                        const _fv = dkFitTargetValueFor(e);
                        e.cloudCount = t, e.cloudIndex = i, e.cloudAngle = a[i], e.cloudRadius = null != _fv ? _fv : n * 1.2 * cloudMul;
                        try {
                            var _kao3 = mn.kinkAngleOffsets && e.child && e.child.id ? mn.kinkAngleOffsets[e.child.id] : null;
                            if (_kao3 && typeof _kao3.angle === "number" && _kao3.angle) e.cloudAngle = tr(e.cloudAngle + _kao3.angle * Math.PI / 180);
                        } catch (_) { __sxErrLog("layout-override", _); }
                    });
                });
            });
        }
        function frClampCloudRadii(n) {
            n.forEach(e => {
                // Scoped solve (T3, L3): a frozen branch's cap is
                // not evaluated at all — its delivered radius is a
                // constant of the scoped solve, and recompute-set
                // branches below still read its centre (delivered
                // angle + preserved _spokeAdjust20) as a constant
                // through yr(). Each skipped evaluation is counted.
                if (scCtx && e.entry && e.entry.branch && scCtx.frozenBranches.has(e.entry.branch.name)) return void scCtx.dropped.clamp++;
                e.topicCloudRadiusBase = e.topicCloudRadius;
                const t = yr(e.entry.branch), i = 900 + Math.cos(e.angle) * t, a = 620 + Math.sin(e.angle) * t;
                let r = 1 / 0;
                n.forEach(t => {
                    if (t === e) return;
                    const n = yr(t.entry.branch), o = 900 + Math.cos(t.angle) * n, s = 620 + Math.sin(t.angle) * n, l = Math.hypot(o - i, s - a);
                    l < r && (r = l);
                });
                if (r < 1 / 0) {
                    const dkCapped = Math.min(e.topicCloudRadius, Math.max(er.minimumRadius, r / 2 - 25));
                    // DeKnotter throw relief (E1): while a run context is
                    // active AND the current phase is the throw phase, the
                    // ACTIVE branch skips the neighbor-distance cap; every
                    // other branch keeps the cap in every phase. A skip
                    // that changes the active branch's outcome is logged
                    // with the pre/post radius and the value the cap would
                    // have imposed.
                    if (dkCtx && "throw" === dkCtx.phase && e.entry && e.entry.branch && e.entry.branch.name === dkCtx.branch && dkCapped !== e.topicCloudRadius) dkLog.push({
                        type: "cloud-clamp-relief",
                        branch: dkCtx.branch,
                        phase: dkCtx.phase,
                        pre: e.topicCloudRadius,
                        post: e.topicCloudRadius,
                        cappedTo: dkCapped
                    }); else e.topicCloudRadius = dkCapped;
                }
            });
        }
        // SOLVER-METRICS REFACTOR (F5): the collision pass's sibling-
        // resolve block used to appear TWICE inside frCollisionPasses,
        // character-identical in its predicates (the second copy's own
        // comment admitted "same predicates as the first pass above").
        // It is now this ONE helper, called twice: once before expansion
        // relief and once after it. The two passes differ only in what
        // surrounds them — relief follows the first, the curve reset
        // follows the second. The spoke-length optimizer likewise runs
        // after EACH pass: the second run is INTENTIONAL post-relief
        // re-optimization (relief moves radii, so spoke lengths are
        // re-fit against the relieved geometry before curves reset),
        // not a leftover — confirmed in this pass from the pass order
        // resolve -> optimize -> relief -> resolve -> optimize -> reset.
        function frResolveSiblingsPass(n) {
            n.forEach(e => {
                var branchShrink = !0;
                // Per-item shrink gate for the gen-2 sibling group: plain topics
                // follow the global collision mode; a subcategory node's own
                // spoke follows the subcategory spoke toggle, independently.
                var spokeGate = function(item) {
                    return item.topic && item.topic.isSubcategory ? "veto" !== sxShrinkState(mn.subcatSpokeAutoShrink, item.topic.label) : branchShrink;
                };
                // Arming (Group 3d): a group whose auto-shrink the user has
                // explicitly switched on (map value true — not merely
                // absent) keeps its shrink moves in Grow-only mode, whose
                // candidate filter otherwise discards every shrink move
                // before these gates are consulted. Untouched groups keep
                // following the global collision mode exactly as before.
                var spokeArm = function(item) {
                    return item.topic && item.topic.isSubcategory ? "armed" === sxShrinkState(mn.subcatSpokeAutoShrink, item.topic.label) : !1;
                };
                rr.resolveRadialSiblings(e.topics, !0, spokeGate, spokeArm), e.topics.filter(e => e.topic.isSubcategory && e.children && e.children.length).forEach(sub => {
                    rr.resolveRadialSiblings(sub.children, !0, null, null);
                });
            });
        }
        function frCollisionPasses(n, a, r) {
            n.forEach(e => {
                // Uniform sibling radii are the stable baseline before collision passes.
                // A subcategory whose own spoke auto-shrink is off keeps the
                // pre-clamp radius instead of the neighbor-clamped one.
                // Armed (Group 3d, Build 2026-10-20_0853): a subcategory whose
                // spoke auto-shrink is explicitly on takes the armed
                // cloud factor (shipped 0.76x, editor-adjustable via
                // mn.subcatCloudShrinkFactor — see sxArmedFactor) —
                // a scoped shrink of its spoke, in any collision mode.
                e.topics.forEach(t => {
                    // Fit start (E4): a fit gen-2 item — plain topic or
                    // subcategory node alike — starts the collision
                    // passes at its target; unarmed items keep the
                    // legacy start exactly.
                    const fv = dkFitTargetValueFor(t);
                    t.cloudRadius = null != fv ? fv : t.topic.isSubcategory && "veto" === sxShrinkState(mn.subcatSpokeAutoShrink, t.topic.label) && Number.isFinite(e.topicCloudRadiusBase) ? e.topicCloudRadiusBase : e.topicCloudRadius * (t.topic.isSubcategory && "armed" === sxShrinkState(mn.subcatSpokeAutoShrink, t.topic.label) ? sxArmedFactor(mn.subcatCloudShrinkFactor) : 1);
                });
            });
            n.forEach(e => {
                rr.applyAngularNudge(e.topics, e.angle + Math.PI), e.topics.filter(e => e.topic.isSubcategory && e.children && e.children.length).forEach(e => rr.applyAngularNudge(e.children, e.cloudAngle));
            });
            rr.minimizeCrossings(n);
            frResolveSiblingsPass(n);
            rr.optimizeSpokeLengths(n);
            rr.applyExpansionRelief(n);
            frResolveSiblingsPass(n);
            rr.optimizeSpokeLengths(n);
            a.concat(r).forEach(e => {
                e.curve = !1, e.autoBend = 0;
            });
        }
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
        // (sxIconRadius at the topic's depth) — every stretch of a
        // foreign line is counted ONCE, at the width of the region it
        // is inside; see sxEvalCross.
        const SX_STEP_R = 8, SX_STEP_A = .5 * Math.PI / 180, SX_CUM_R = 32, SX_CUM_A = 2 * Math.PI / 180, SX_T0 = .25, SX_TCOOL = .8, SX_TFLOOR = .005, SX_STEPCOOL = .85, SX_SWEEPS = 24, SX_CELL = 256, SX_SEED = 0x5EED1234, SX_FONT_BASE = 22, SX_FAN_GAP = Math.PI / 45, SX_GRID_PAD = 128;
        // BASIS NOTE (2026-10-30, paragraph-6 solver-metrics edit):
        // these are the shipped tuned anneal constants. Their basis is
        // NOT recorded in code — the values are transcribed tuning
        // that produced the current judged-metric behaviour, not
        // quantities derived from a stated formula. Change any of
        // them only with re-measurement against the crossing-number
        // metric E; do not "tidy" a value toward a rounder one.
        // PAIR-KEY STRIDE: the pair-key packing below (i * stride +
        // j) is injective only while stride exceeds the count M of
        // keyed items (topics + spokes). M is 465 today (403 topics
        // + 62 spokes); the stride stays 1024, more than double M.
        // If the taxonomy ever grows past 1024 items, keys collide
        // silently and pair counts merge — raise the stride first.
        const SX_PAIR_STRIDE = 1024;
        // ============================================================
        // SOLVER-METRICS REFACTOR (F3 + F8): THE SOLVER FACADE — the
        // single front door for the three layout arrangers. The
        // engines themselves are NOT merged in this pass; the facade
        // names them, routes their call sites, and states the one
        // documented answer to "which engine runs when, and what
        // counts as better":
        //
        // 1. BUILD — facade.build() -> fr(), the everyday geometry
        //    builder (with its radial optimizer rr). Runs on every
        //    map build. "Better" inside the builder's collision
        //    passes is judged by segment-crossing counts (rr's
        //    _crossingScore — a swap is kept only when it lowers the
        //    count) and by element clearance in the radial resolver
        //    (center distance against the summed element radii, the
        //    smallest correction that separates the pair). No area
        //    figure is computed or consulted there. (Corrected
        //    2026-10-29, M3: this comment previously claimed AREA
        //    overlap (xAreaCross); the code contains no such
        //    judgment. The area metric has since been removed from
        //    observation entirely, M1.)
        // 2. TIDY — facade.tidy(geo) -> sxAnnealHook(), the
        //    paint-stage tidier (the Stage-1 SCC annealer). Runs
        //    immediately after build in the render flow, unless a
        //    scoped solve is active or the mode switch is off.
        //    (2026-11-01, Jason: this settle step is COMMENTED OUT
        //    at its invocation inside facade.tidy below — see the
        //    ruling note there. The route and the engine stay.)
        //    "Better" is the hybrid CROSSING NUMBER E: only an
        //    exactly-zero E settles a plateau (see sxAnnealRun).
        //    MODE NOTE (F8): sxSolverMode silently demotes "full"
        //    to "settle" and logs the demotion once to the shared
        //    log (dkLog); "shadow" is the real measure-only mode
        //    (zero sweeps, score unchanged).
        // 3. UNTANGLE — facade.untangle(branch, opts) ->
        //    dkRunCascade(), the deep untangler. Runs ONLY from the
        //    layout editor's "Anneal" BUTTON via the driver API
        //    (deknotter.run). F8 MAPPING: the Anneal button fires
        //    THIS engine (the untangler driver), while paint fires
        //    the TIDIER — the button label stays "Anneal" (settled
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
        // one's gains — the facade documents that; this pass does
        // not change it.
        // ============================================================
        const SX_SOLVER_FACADE = {
            build() {
                return fr();
            },
            tidy(geo) {
                // STEP 4 (SETTLE) COMMENTED OUT (ruled 2026-11-01,
                // Jason): the Anneal's settle step — this
                // paint-stage tidier, sxAnnealHook running the SCC
                // annealer / repulsion run under the hybrid
                // crossing number — is out, because it seems to
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
        // the disc — the icon-disc half of the Stage 2 union.
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
            // victim's ICON DISC — centre at the paint's icon
            // seat T.node, radius T.iconR = sxIconRadius at the
            // topic's depth, both set in finishTopic — is
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
            // priced EACH DIRECTION SEPARATELY — the direction
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
        // Jason — "the band shrinks to fit the letters; the 44 shrinks
        // to 22": the capsule definition CHANGES from centre line
        // ± one font size to centre line ± HALF a font size, so the
        // priced band (2 x hw = F) equals the painted midline stroke
        // (22 * font scale) exactly: ONE
        // capsule per spoke — the capsule S is the
        // PADDLE: centre line ± half a font size, from the label's inward
        // radius minus half a font size out PAST the end of the longest
        // slider (the paint's slider-end geometry, plus a little); and
        // a thin LINE back toward the branching point — for centre
        // spokes, back to the centre disc's RIM, never impinging on
        // the centre. The capsule prices what crosses the paddle out
        // where the sliders are; the inner line stretch prices the run
        // back toward the branching point. See finishTopic.
        function sxLabelClearance(radius, label, fontSize, iconR) {
            let r = radius;
            try {
                const textW = Za.measure(label || "", null == fontSize ? sxFontSize(3) : fontSize), icon = null == iconR ? sxIconRadius(3) : iconR;
                for (let pass = 0; pass < 3; pass++) {
                    const need = Za.cloudLabel(r, pr.subcategoryIcon / 2).labelOffset + textW + icon + 12;
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
                // to the branch anchor — never from the centre point
                // itself (the centre is never impinged; capsule-
                // inversion correction 2026-11-02). The rim is the
                // paint's own gen-1 spoke start (gen1SpokeBaseRadius:
                // the centre ring's outer edge, where Ar starts every
                // gen-1 spoke path), guarded to pr.centerRadius if
                // that helper is ever unavailable.
                const rimR = inn.rim, rimDx = anchor.x - pr.centerX, rimDy = anchor.y - pr.centerY, rimL = Math.hypot(rimDx, rimDy), rimStart = rimL > 1e-9 ? pt(pr.centerX + rimDx / rimL * Math.min(rimR, rimL), pr.centerY + rimDy / rimL * Math.min(rimR, rimL)) : pt(pr.centerX, pr.centerY);
                geo.spokes.push({
                    seg: [ rimStart, pt(anchor.x, anchor.y) ],
                    bb: null,
                    cloud: cloud,
                    kind: "center",
                    entry: null
                });
                if ("Connection & aftercare" === cloud) geo.connSpoke = geo.spokes.length - 1;
                (br.topics || []).forEach(item => {
                    const rec = item.topic, label = rec.label, isSub = !!rec.isSubcategory;
                    const drawH = w => {
                        const u = Za.topicSpokeEstimate(label, w || br.topicCloudRadius);
                        let h = u.spokeLength;
                        if (isSub) {
                            h = Math.max(h, pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96, sxSpokeBase(item.cloudCount)), h = Za.hubSpokeLength(label, u.fontSize, h, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                            const ov = mn.subcatOverrides && mn.subcatOverrides[label];
                            if (ov && typeof ov.length === "number" && ov.length > 0) h *= ov.length;
                        } else {
                            const ov = mn.kinkOverrides && mn.kinkOverrides[rec.id];
                            if (ov && typeof ov.length === "number" && ov.length > 0) h *= ov.length;
                        }
                        return h;
                    };
                    const mulOf = () => {
                        const ov = isSub ? mn.subcatOverrides && mn.subcatOverrides[label] : mn.kinkOverrides && mn.kinkOverrides[rec.id];
                        return ov && typeof ov.length === "number" && ov.length > 0 ? ov.length : 1;
                    };
                    const entry = {
                        kind: isSub ? "sub" : "topic",
                        item: item,
                        rec: rec,
                        cloud: cloud,
                        branchEntry: br,
                        anchor: anchor,
                        fan: fan,
                        drawH: drawH,
                        mul: mulOf(),
                        node: null,
                        hubEntry: null,
                        children: [],
                        spokeIx: -1
                    };
                    if (isSub) {
                        geo.spokes.push({
                            seg: null,
                            bb: null,
                            cloud: cloud,
                            kind: "sub",
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
                            const ov = mn.kinkOverrides && mn.kinkOverrides[crec.id];
                            return ov && typeof ov.length === "number" && ov.length > 0 ? ov.length : 1;
                        })();
                        const centry = {
                            kind: "topic",
                            item: wrap,
                            rec: crec,
                            cloud: cloud,
                            branchEntry: br,
                            parentItem: item,
                            hubEntry: entry,
                            fan: null,
                            mul: cmul,
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
                // subcategory 3) from sxFontSize — the evals price
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
                        // radius — Ar extends it by its label-clearance
                        // loop (the loop below, verbatim) until the
                        // label and icon fit the spoke. This extended
                        // length h is the spoke's painted length: it
                        // seats the node (the paint's icon seat) and
                        // it is the reach from which the capsule's
                        // OUTER end (the paddle's end, past the
                        // sliders) is measured below — the extension
                        // belongs to the capsule's outer reach.
                        h = sxLabelClearance(h, e.rec.label, inn.fontSize[3], inn.iconR[3]);
                        P = Za.cloudLabel(h, pr.subcategoryIcon / 2).labelOffset;
                    } else {
                        h = e.drawH(w), P = Za.topicLabelOffset(h, Za.cloudLabel(h, pr.categoryIcon / 2).labelOffset, e.item.cloudIndex);
                    }
                    if (e.C === undefined) e.C = sxLabelLen(isChild ? e.rec.label : "\u00A0" + e.rec.label, e.F);
                    const ux = Math.cos(ang), uy = Math.sin(ang), Dseat = P + e.C + 1 + iconR, sEnd = Dseat + iconR + 6 + tagW(e.rec.id, isChild ? 3 : 2) / 2, a2 = pt(hub.x + ux * (P - e.F / 2), hub.y + uy * (P - e.F / 2));
                    // CAPSULE-INVERSION CORRECTION (2026-11-02,
                    // owner's design 2026-10-23 + 2026-10-27): the
                    // capsule S is the PADDLE — its outer end b is
                    // NOT the label-zone end sEnd. The paddle runs
                    // from a2 (the label's inward radius P, minus
                    // half a font size — the capsule half-width,
                    // since the 2026-11-02 band shrink) all the way
                    // out PAST THE END
                    // OF THE LONGEST SLIDER, plus a little: the
                    // slider end is the paint's own end-of-controls
                    // geometry — the icon seated at the spoke's full
                    // drawn length h (for children, h already
                    // carries the paint's label-clearance extension
                    // above), plus the icon radius, 6, and half a
                    // control tag, the same tail sEnd carries past
                    // its label-estimate seat. The label estimate
                    // sEnd remains as a floor for the label-dominated
                    // regime, where it is the longer of the two.
                    // capEnd is that outer reach; the scored midline
                    // M (the foreign centre line other capsules are
                    // priced against, and the centreline the interim
                    // capsule paint draws) runs from the hub — the
                    // branching point — out to the same capEnd, so a
                    // foreign spoke is present everywhere its own
                    // paddle is; its inner stretch I (hub -> a2) is
                    // the thin line the inner count prices on the
                    // run back toward the branching point. The node
                    // seat stays the paint's icon seat (hub + u*h),
                    // so the interim paint's dots sit where the full
                    // paint seats the icons. The divergence fix
                    // (earlier today) had this exactly reversed —
                    // midline stretched to the icon, capsule stopping
                    // at sEnd short of the sliders; that arrangement
                    // must not be reintroduced under any other name.
                    const capEnd = Math.max(sEnd, h + iconR + 6 + tagW(e.rec.id, isChild ? 3 : 2) / 2), b = pt(hub.x + ux * capEnd, hub.y + uy * capEnd), bM = pt(hub.x + ux * capEnd, hub.y + uy * capEnd);
                    e.hub = hub, e.ang = ang, e.h = h, e.P = P, e.sEnd = sEnd, e.capEnd = capEnd;
                    e.M = [ pt(hub.x, hub.y), bM ], e.S = [ a2, b ], e.I = [ pt(hub.x, hub.y), a2 ];
                    e.bbS = sxBB(e.S[0], e.S[1], 0), e.bbI = sxBB(e.I[0], e.I[1], 0), e.bbM = sxBB(e.M[0], e.M[1], 0);
                    e.node = pt(hub.x + ux * h, hub.y + uy * h);
                    // CAPSULE STAGE 2 (ruled 2026-11-02 14:05): the
                    // topic's icon disc for sxEvalCross — centre at
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
        // sxBuildGrid builds alongside the fine grid — large
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
        function sxGridNearSeg(geo, a, b) {
            // Corridor query: walk the segment in <=128 wu steps and union the
            // 3x3 cell neighbourhood of each sample. Any element whose stored
            // (2F + SX_GRID_PAD)-inflated bbox can pair with this segment
            // registers in one of those cells; whole-bbox queries over long
            // diagonal spokes drown in bbox-rejected false candidates.
            const out = new Set, len = Math.hypot(b.x - a.x, b.y - a.y), steps = Math.max(1, Math.ceil(len / 128));
            for (let s = 0; s <= steps; s++) {
                const px = a.x + (b.x - a.x) * s / steps, py = a.y + (b.y - a.y) * s / steps, cx = Math.floor(px / SX_CELL), cy = Math.floor(py / SX_CELL);
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
        // ---- Incremental repricing: delete + recompute every pair touching ----
        // the affected topics (A) or spokes (Bs); returns the tracked-E delta.
        function sxReprice(geo, maps, A, Bs) {
            const N = geo.topics.length, before = maps.tc + maps.tg + maps.ti, affT = new Set(A), affL = new Set;
            A.forEach(i => affL.add(i)), Bs.forEach(j => affL.add(N + j));
            const touched = e => affT.has(e) || affL.has(e);
            // Candidate pairs from the grid around the affected segments.
            const candC = new Set, candG = new Set, candI = new Set;
            const near = (a, b, self) => {
                sxGridNearSeg(geo, a, b).forEach(ix => {
                    if (ix === self) return;
                    if (self < N) candC.add(self * SX_PAIR_STRIDE + ix);
                    if (ix < N) candC.add(ix * SX_PAIR_STRIDE + self);
                    if (self < N && ix < N) candG.add(Math.min(self, ix) * SX_PAIR_STRIDE + Math.max(self, ix));
                    candI.add(Math.min(self, ix) * SX_PAIR_STRIDE + Math.max(self, ix));
                });
            };
            // CAPSULE STAGE 2: disc candidates from the coarse
            // disc grids. A moved LINE may newly cross a static
            // topic's disc far from that topic's paddle (the fine
            // grid's registrations, padded by 2F + 128 around the
            // segments, cannot see the disc's outer reaches), and
            // a moved topic's DISC may newly cover a static line.
            // nearDiscLine walks the moved line's midline through
            // the coarse cells and adds every registered disc
            // owner as a cross victim; nearDiscVictim scans the
            // coarse cells under the moved topic's current disc
            // bbox and adds every registered line owner as a
            // cross line. Only cross candidates are added — the
            // discs play no part in graze or inner.
            const nearDiscLine = (a, b, self) => {
                if (!geo.discV) return;
                const len = Math.hypot(b.x - a.x, b.y - a.y), steps = Math.max(1, Math.ceil(len / (SX_DISC_CELL / 2))), seen = new Set;
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
            A.forEach(i => {
                const e = geo.topics[i];
                near(e.S[0], e.S[1], i), near(e.M[0], e.M[1], i), near(e.I[0], e.I[1], i);
                nearDiscLine(e.M[0], e.M[1], i), nearDiscVictim(i);
            });
            Bs.forEach(j => {
                const sp = geo.spokes[j];
                near(sp.seg[0], sp.seg[1], N + j);
                nearDiscLine(sp.seg[0], sp.seg[1], N + j);
            });
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
            candC.forEach(k => sxStorePair(geo, maps, "cross", k, sxEvalCross(geo, Math.floor(k / SX_PAIR_STRIDE), k % SX_PAIR_STRIDE)));
            candG.forEach(k => sxStorePair(geo, maps, "graze", k, sxEvalGraze(geo, maps, Math.floor(k / SX_PAIR_STRIDE), k % SX_PAIR_STRIDE)));
            candI.forEach(k => sxStorePair(geo, maps, "inner", k, sxEvalInner(geo, Math.floor(k / SX_PAIR_STRIDE), k % SX_PAIR_STRIDE)));
            return maps.tc + maps.tg + maps.ti - before;
        }
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
            // acceptance. A plateau state may be accepted — kept as
            // the settled state — ONLY at crossing exactly 0, and
            // E === 0 exits as termination "zero" before the
            // plateau test can see it, so a "plateau" exit here
            // always carries E > 0. Such a state is therefore NOT
            // accepted as a plateau success: every mover returns to
            // its start angle/length (the same restore the
            // rejected-move path performs), the entry records
            // plateau_accepted false / plateau_reverted true, and
            // the run returns false so the settle is not treated
            // as anneal-settled. The anneal's energy IS the
            // crossing number throughout — no area figure plays
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
            // Q4: a plateau-reverted run did not settle anything —
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
        // the branch angle tweak is out throughout — categories
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
            // BRANCH ANGLE TWEAK — COMMENTED OUT (ruled
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
            // BRANCH ANGLE TWEAK — COMMENTED OUT (ruled
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
                // BRANCH ANGLE TWEAK — COMMENTED OUT (ruled
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
        // crossing number E. It evaluates the CURRENT solved state —
        // dkLastBranches, the delivered-geometry registry fr() keeps —
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
        // edit): this readout is quadratic — sxSccBuild plus the
        // full pair evaluation — and it is read on unchanged state
        // several times in a row (the onset baseline and the first
        // growth step, the settle guard's before/after pair, the
        // shell metric's compute + clouds). sxCrossingMeasure
        // therefore caches one result per excl slot, keyed by a
        // linear fingerprint of EVERY input sxSccBuild reads,
        // recomputed fresh on each call. The cache is exact, not
        // heuristic: the delivered sectors are mutated in place by
        // the tidier (sxAnnealHook's setW/setA write cloudRadius /
        // cloudAngle on the same item objects dkLastBranches points
        // at), so an identity check would serve pre-tidy geometry —
        // the fingerprint reads the values themselves, so a tidy
        // that moves anything changes the key and the next read
        // rebuilds. The key is sxSccInputs: the values sxSccBuild
        // reads (font law, icon law, pr, mn, the solved tree, the
        // anchor yr() returns), stringified. There is no second
        // list to maintain. On any
        // fingerprint error the cache is bypassed and cleared, and
        // the readout computes fresh — the pre-cache behaviour.
        // Cached results are returned as shallow copies so no caller
        // can poison the stored entry.
        let sxEvalCache = { standing: null, excluded: null };
        // KINK LEAF OVERGROWTH (ruled 2026-11-03, Jason): the Layout
        // Editor's "% kink leaf overgrowth" slider (mn.leafOvergrowth,
        // a percent, default 300, range 100-500) is the ONE multiple of
        // the full fit target (dkComputeFitTarget's max-envelope:
        // name + neighbour pitch + icon + clearance) that sets BOTH
        // the kink-leaf throw length in stepThrow (the throwFitCap
        // multiple, which is also the leaf minimum — leaves have no
        // shrink ladder of their own, so no separate leaf floor
        // exists or is needed) AND the length Autofit delivers in
        // computeAutofitPatch. It replaces the hard 3x those two sites
        // carried (SX_SCORE.LEAF_FIT_FACTOR / the Autofit driver's
        // literal 3, and the THROW_KINK baked-base fallback multiple,
        // which was 3 for the same reason). Category/subcategory
        // 50x/20x throws and 1x floors, the shrinkKinksToLabel
        // driver's 1x, and the settle drift check's 1x comparison are
        // untouched. An absent or invalid setting falls back to 3
        // (300%), the long-standing size, so an untouched map renders
        // exactly as before.
        function sxLeafOvergrowthFactor() {
            const pct = Number(mn && mn.leafOvergrowth);
            return Number.isFinite(pct) && pct > 0 ? pct / 100 : 3;
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
            const mnSnap = { branchOverrides: mn.branchOverrides, kinkOverrides: mn.kinkOverrides, subcatOverrides: mn.subcatOverrides, stagger: mn.stagger, staggerDensity: mn.staggerDensity, collision: mn.collision, spokeLen: mn.spokeLen, subLen: mn.subLen, pad: mn.pad, repulsion: mn.repulsion, repulsionEnabled: mn.repulsionEnabled, branchSpokeAutoShrink: mn.branchSpokeAutoShrink, subcatSpokeAutoShrink: mn.subcatSpokeAutoShrink, autoShrinkFactor: mn.autoShrinkFactor, solverMidline: mn.solverMidline, fontScale: mn.fontScale, centerRingScale: mn.centerRingScale, leafOvergrowth: mn.leafOvergrowth };
            const order = (typeof h !== "undefined" && h || []).map(b => ({ name: b && b.name, n: b && b.topics ? b.topics.length : 0 }));
            const branch = (branches || []).map(br => ({
                angle: br.angle,
                topicCloudRadius: br.topicCloudRadius,
                name: br.entry.branch.name,
                spokeAdjust: Number(br.entry.branch._spokeAdjust20) || 0,
                anchor: rr.branchAnchor(br),
                topics: (br.topics || []).map(item => {
                    const rec = item.topic;
                    return {
                        cloudRadius: item.cloudRadius,
                        cloudAngle: item.cloudAngle,
                        cloudIndex: item.cloudIndex,
                        childCloudRadius: item.childCloudRadius,
                        cloudCount: item.cloudCount,
                        radialFit: item._radialFit20,
                        id: rec.id,
                        label: rec.label,
                        isSub: rec.isSubcategory ? 1 : 0,
                        children: (item.children || []).map(wrap => {
                            const crec = wrap.child;
                            return crec ? { cloudRadius: wrap.cloudRadius, cloudAngle: wrap.cloudAngle, radialFit: wrap._radialFit20, id: crec.id, label: crec.label, isStatic: crec.isStaticTopic ? 1 : 0 } : null;
                        })
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
        }
        function sxCrossingMeasure(excl) {
            const ev = sxGetEval(excl);
            if (!ev) return null;
            const geo = ev.geo, maps = ev.maps, tot = ev.tot, clouds = {};
            const add = (c, v) => { if (c) clouds[c] = (clouds[c] || 0) + v; };
            geo.topics.forEach(e => { if (undefined === clouds[e.cloud]) clouds[e.cloud] = 0; });
            geo.spokes.forEach(sp => { if (undefined === clouds[sp.cloud]) clouds[sp.cloud] = 0; });
            maps.cross.forEach((val, k) => { const v = Math.floor(k / SX_PAIR_STRIDE); add(geo.topics[v] && geo.topics[v].cloud, val); });
            maps.graze.forEach((val, k) => { const i = Math.floor(k / SX_PAIR_STRIDE), j = k % SX_PAIR_STRIDE; add(geo.topics[i] && geo.topics[i].cloud, val / 2); add(geo.topics[j] && geo.topics[j].cloud, val / 2); });
            maps.inner.forEach((val, k) => { const N = geo.topics.length, p = Math.floor(k / SX_PAIR_STRIDE), q = k % SX_PAIR_STRIDE, cOf = ix => ix < N ? geo.topics[ix] && geo.topics[ix].cloud : geo.spokes[ix - N] && geo.spokes[ix - N].cloud; add(cOf(p), val); add(cOf(q), val); });
            return { E: tot.E, crossing: tot.crossing, graze: tot.graze, inner: tot.inner, clouds: Object.assign({}, clouds) };
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
        // attribution — crossing in full to the victim topic's cloud,
        // graze split half/half, inner attributed to both participants
        // (so a same-branch inner pair still counts twice) — the stage
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

                function fr() {
            const e = frBuildTree(), t = e.map(e => ({
                entry: e,
                label: e.branch.name,
                weight: e.weight,
                minDemand: e.minDemand
            }));
            t.sort((e, t) => (branchOrderRankMap().get(e.entry.branch.name) ?? 0) - (branchOrderRankMap().get(t.entry.branch.name) ?? 0));
            const n = mr(t, -Math.PI / 2, 2 * Math.PI, hr(1), pr.categoryIcon, 25), i = n.length;
            frAssignCategoryAngles(n, i);
            const a = [], r = [];
            frAllocateTopicSectors(n, a, r);
            n.forEach(e => {
                // Scoped solve (T3, L4): frozen branches are exempt
                // from the _spokeAdjust20 reset that feeds
                // rr.optimizeSpokeLengths — their captured
                // adjustments persist through the solve, so the
                // optimiser never has a moved frozen branch to
                // restore (the T2 replay stays as the safety net).
                if (scCtx && e.entry && e.entry.branch && scCtx.frozenBranches.has(e.entry.branch.name)) return;
                e.entry.branch._spokeAdjust20 = 0;
            });
            frCloudLayout(n);
            frClampCloudRadii(n);
            frCollisionPasses(n, a, r);
            // Sub-group line length truthfulness (Group 4, G4-11):
            // frCloudLayout now bases each subcategory's child-cloud
            // radius on the fixed reference subLen 1.2 (the shipped
            // value) instead of the live slider, because the radial
            // sibling solver's separation demands swamped the slider's
            // contribution — rendered length saturated (+50% slider
            // rendered under +9%) and could even invert (0.7 rendering
            // longer than the 1.2 baseline). The live slider is
            // applied here, after the solver, as a uniform scale on
            // the solved radii: rendered child line length now tracks
            // the slider monotonically and proportionally, is exact
            // at the shipped 1.2 (scale 1), and returning the slider
            // to any value restores that value's rendering exactly.
            try {
                const _subLenScale = (Number(mn.subLen) || 1.2) / 1.2;
                if (_subLenScale !== 1) n.forEach(b => {
                    // Scoped solve (T2): the post-solve subLen scale
                    // applies only inside the recompute set — frozen
                    // branches are skipped so their children keep
                    // their delivered radii and the solved tree stays
                    // consistent with the delivered geometry the
                    // freeze replay below restores.
                    if (scCtx && b.entry && b.entry.branch && scCtx.frozenBranches.has(b.entry.branch.name)) return;
                    (b.topics || []).forEach(t => {
                        if (t.topic && t.topic.isSubcategory && t.children) t.children.forEach(ch => {
                            // Fit skip (E4): fit targets are in final
                            // rendered units, so the post-solve subLen
                            // scale never rescales a fit child away
                            // from its target.
                            if (Number.isFinite(ch.cloudRadius) && null == dkFitTargetValueFor(ch)) ch.cloudRadius *= _subLenScale;
                        });
                    });
                });
            } catch (_) { __sxErrLog("layout-sublen-scale", _); }
            // Delivered-geometry registry (E4): remember this solve's
            // branches so the driver can enumerate the branch's
            // currently rendered items, and refresh each resolved
            // item's delivered cloudRadius in the same stable-key
            // registry deknotter.baseState() reads.
            dkLastBranches = n;
            n.forEach(b => {
                (b.topics || []).forEach(t => {
                    dkRecordDelivered(t), t.topic && t.topic.isSubcategory && (t.children || []).forEach(ch => dkRecordDelivered(ch));
                });
            });
            // Scoped solve (T2): freeze replay — with a scope context
            // active, restore every frozen branch's solved geometry
            // and _spokeAdjust20 verbatim from the pre-patch capture
            // and merge the delivered-geometry registry (see
            // scRestoreFrozen). Runs after the registry refresh above,
            // inside the solve's own completion path, before paint
            // renders. Inactive context: no-op, byte-for-byte legacy.
            if (scCtx) try {
                scRestoreFrozen(n, scCtx);
            } catch (_) { __sxErrLog("layout-scoped-restore", _); }
            return {
                tree: e,
                branches: n
            };
        }
        // Stagger density (Build 2026-10-17_0044): the kink-count (topics)
        // range across branches never changes at runtime, so it is cached.
        // mn.staggerDensity defaults on; while on, a branch's spoke-length
        // factor is 0.7 + 0.6 × its normalized density (densest branch =
        // longest spoke, sparsest = shortest), overriding the manual
        // per-branch length overrides, which are preserved untouched in
        // mn.branchOverrides and apply again as soon as it is turned off.
        let staggerDensityRange = null;
        function yr(e) {
            const t = mn.branchOverrides && mn.branchOverrides[e.name] || {}, n = Math.max(0, h.indexOf(e));
            // SOLVER-METRICS REFACTOR (F9): the branch-length factor
            // pile-up split into named factors — same values, same
            // multiplication order (transcription, not redesign):
            //   manualFactor    the per-branch manual length override
            //   staggerFactor   alternating stagger, 1.18 / 0.82
            //   collisionFactor collision mode: grow 1.3, shrink 0.76,
            //                   off 0.62, anything else 1
            //   shrinkFactor    the armed factor (shipped 0.76,
            //                   editor-adjustable via
            //                   mn.autoShrinkFactor — see
            //                   sxArmedFactor) when this branch's kink-spoke
            //                   auto-shrink switch is explicitly armed
            //                   (tri-state true; see the F6 note)
            //   solverAdjust    the solver's own _spokeAdjust20 term
            const staggerFactor = mn.stagger ? (n % 2 ? 1.18 : .82) : 1, collisionFactor = "grow" === mn.collision ? 1.3 : "shrink" === mn.collision ? .76 : "off" === mn.collision ? .62 : 1, shrinkFactor = "armed" === sxShrinkState(mn.branchSpokeAutoShrink, e.name) ? sxArmedFactor(mn.autoShrinkFactor) : 1, solverAdjust = Number(e._spokeAdjust20) || 0;
            let manualFactor = Number(t.length) || 1;
            if (mn.staggerDensity) {
                if (!staggerDensityRange) {
                    let min = Infinity, max = -Infinity;
                    h.forEach(b => {
                        const d = b.topics.length;
                        d < min && (min = d), d > max && (max = d);
                    }), staggerDensityRange = {
                        min: min,
                        max: max
                    };
                }
                const normalized = staggerDensityRange.max > staggerDensityRange.min ? (e.topics.length - staggerDensityRange.min) / (staggerDensityRange.max - staggerDensityRange.min) : .5;
                // NOTE (F9): the density formula SILENTLY DISCARDS
                // the manual length override — manualFactor is
                // overwritten here, never combined with it. The
                // override value itself survives untouched in
                // mn.branchOverrides and applies again as soon as
                // staggerDensity is turned off.
                manualFactor = .7 + .6 * normalized;
            }
            return 1450 * mn.spokeLen * manualFactor * staggerFactor * collisionFactor * shrinkFactor + solverAdjust + pr.categoryIcon / 2 + 30;
        }
        function br(e, t) {
            const n = pr.centerX, i = pr.centerY, a = (pr.centerRadius + 150) * centerRingScale(), kp = p => { const dx = p.x - n, dy = p.y - i, dd = Math.hypot(dx, dy); return dd >= a + 2 ? p : dd < 1e-6 ? { x: n + a + 2, y: i } : { x: n + dx / dd * (a + 2), y: i + dy / dd * (a + 2) }; };
            e = kp(e), t = kp(t);
            const r = t.x - e.x, o = t.y - e.y, s = r * r + o * o, l = s ? A(((n - e.x) * r + (i - e.y) * o) / s) : 0, c = e.x + r * l, d = e.y + o * l;
            if (Math.hypot(c - n, d - i) >= a) return `M ${e.x.toFixed(2)} ${e.y.toFixed(2)} L ${t.x.toFixed(2)} ${t.y.toFixed(2)}`;
            const u = e => {
                const t = e.x - n, r = e.y - i, o = Math.hypot(t, r);
                if (o <= a + .01) return null;
                const s = Math.atan2(r, t), l = Math.acos(a / o);
                return {
                    radius: o,
                    angles: [ s - l, s + l ],
                    tangentLength: Math.sqrt(o * o - a * a)
                };
            }, p = u(e), h = u(t);
            if (!p || !h) return `M ${e.x.toFixed(2)} ${e.y.toFixed(2)} L ${t.x.toFixed(2)} ${t.y.toFixed(2)}`;
            let g = null;
            p.angles.forEach(e => h.angles.forEach(t => {
                const n = Math.atan2(Math.sin(t - e), Math.cos(t - e)), i = p.tangentLength + h.tangentLength + a * Math.abs(n);
                (!g || i < g.length) && (g = {
                    angleA: e,
                    angleB: t,
                    delta: n,
                    length: i
                });
            }));
            const m = {
                x: n + Math.cos(g.angleA) * a,
                y: i + Math.sin(g.angleA) * a
            }, f = {
                x: n + Math.cos(g.angleB) * a,
                y: i + Math.sin(g.angleB) * a
            }, y = g.delta >= 0 ? 1 : 0;
            return `M ${e.x.toFixed(2)} ${e.y.toFixed(2)} L ${m.x.toFixed(2)} ${m.y.toFixed(2)} A ${a} ${a} 0 0 ${y} ${f.x.toFixed(2)} ${f.y.toFixed(2)} L ${t.x.toFixed(2)} ${t.y.toFixed(2)}`;
        }
        // The two spoke renderers (map-render refactor, finding 3) share
        // one contract: Ka (branch spokes, above) and renderKinkLine
        // (kink spokes, here) are both module-scoped — no window global;
        // the layout/test hooks reach spokes through Mr and the layout
        // API, not through the renderers — and both emit their give /
        // receive flanks through the one flank emitter,
        // SpokeGeometry.flankPaths, differing only in the mode flag
        // (Ka: "innerFirst", renderKinkLine: "outerFirst"; the two
        // modes trace the same filled region — see the SpokeGeometry
        // module doc).
        const renderKinkLine = (e, t, n, i, a, r, o, s, l, c, d, u, p, h = pr.categoryIcon, g = 48, hubD = null, leafD = null, sxDepth = null) => {
            const sxD = null != sxDepth ? sxDepth : leafD === sxIconDiameter(3) ? 3 : 2, sxF = sxFontFactor(sxD), sxSW = sxStrokeWidth(sxD);
            const m = "noCode" === a, f = Ga.WIDTH, y = m ? Ga.NO_CODE_COLOR : r || Ga.NO_CODE_COLOR, b = m ? ` stroke-dasharray="${f} 11.9"` : "", v = qn[d] || Xn(d) || {
                id: d,
                label: u,
                branch: u,
                kind: "Topic"
            }, w = (wa(d, v, p), $a(d, "give", p)), k = $a(d, "receive", p), x = da(d, p), S = Sa(d, v, p), $ = ka(u, w, x.giveKnown ? ba(x.give) : "Unrated", { tapFirst: !0 }), E = ka(u, k, x.receiveKnown ? ba(x.receive) : "Unrated", { tapFirst: !0 }), A = null != hubD ? hubD / 2 : h * mapFontScale() / 2 + (h === pr.subcategoryIcon ? 6 : 0), C = null != leafD ? Math.max(12 * mapFontScale(), leafD / 2) : Math.max(12, (Number(g) || 51) * mapFontScale() / 2 + ("Subcategory" === v.kind ? 6 : 0)), {sx0: M, sy0: I, sx1: P, sy1: L} = Ga.trimToIcons(e, t, n, i, A, C), T = (m ? "" : `<line class="hanky-midline-outline" x1="${M}" y1="${I}" x2="${P}" y2="${L}" stroke="${Ga.OUTLINE_COLOR}" stroke-width="${Ga.CLOUD_OUTLINE_WIDTH(f, sxD)}" stroke-linecap="butt" opacity="0.9" pointer-events="none"/>`) + `<line class="hanky-midline${m ? " hanky-none" : ""}" x1="${M}" y1="${I}" x2="${P}" y2="${L}" stroke="${y}" stroke-width="${sxSW}"${b} opacity="1" stroke-linecap="butt"${S}/>`, F = Boolean(o), N = Boolean(s);
            if (!l || !F && !N) return T;
            const _ = F ? o : s, D = N ? s : o, R = Ga.tipWidth(f), O = Ga.cloudBaseWidth(h, c) * (mapFontScale() * sxF / 3), B = Ga.segment(M, I, P, L), j = P - M, q = L - I, H = f / 2, W = Ga.splitInnerHalf(f, sxD), U = SpokeGeometry.flankPaths(M, I, j, q, B.nx, B.ny, O, R, W, W, "outerFirst", SpokeGeometry.buildBaseCircle(e, t, A), {
                x: n,
                y: i,
                r: C
            });
            return `<path class="tapered-stem" d="${U.top}" fill="${_}" stroke="none" opacity="0.9" style="fill:${_}"${$}/><path class="tapered-stem" d="${U.bottom}" fill="${D}" stroke="none" opacity="0.9" style="fill:${D}"${E}/>` + T;
        };
        const vr = ".tapered-stem,.hanky-midline,.hanky-midline-outline,.topic-pulse,.group-heat,.selected-spoke,.mutual-halo,.disinterest-halo,.favorite-halo,.limit-halo,.visual-rail";
        function wr() {
            if ("number" != typeof $p || "number" != typeof Ep || "number" != typeof Ap) return;
            const e = Cn.classList.contains("is-camera-moving"), t = nh, n = 24 * $p, i = (e, i) => {
                const a = Ep + e * $p, r = Ap + i * $p;
                return a >= t.x - n && a <= t.x + t.width + n && r >= t.y - n && r <= t.y + t.height + n;
            }, a = Cn.getBoundingClientRect();
            In.querySelectorAll(".direction-control").forEach(e => {
                const t = e.getBoundingClientRect(), n = t.width > 0 && t.height > 0 && t.right >= a.left - 12 && t.left <= a.right + 12 && t.bottom >= a.top - 12 && t.top <= a.bottom + 12;
                e.classList.toggle("camera-clipped", !n), e.setAttribute("aria-hidden", n ? "false" : "true");
            }), In.querySelectorAll(".common-overlap-link").forEach(t => {
                if ("false" === t.dataset.connected) return void (t.style.display = "none");
                const n = Number(t.dataset.ax), a = Number(t.dataset.ay), r = Number(t.dataset.bx), o = Number(t.dataset.by);
                if (e) {
                    const e = i(n, a) || i(r, o);
                    return void (t.style.display = e ? "" : "none");
                }
                const s = i(n, a) || i(r, o);
                t.style.display = s ? "" : "none";
            });
        }
        function kr(e, t) {
            const n = Math.max(-260, Math.min(260, t));
            bt[e.id] = n, e.pendingBend = n, bn || (bn = requestAnimationFrame(() => {
                bn = 0, yn === e && function(e) {
                    if (!e || !e.previewPath || !e.pathPoints) return;
                    const t = (Number.isFinite(e.pendingBend) ? e.pendingBend : e.startBend) - e.startBend, n = e.pathPoints, i = e.nx, a = e.ny;
                    e.previewPath.setAttribute("d", `M ${n[0].toFixed(2)} ${n[1].toFixed(2)} C ${(n[2] + i * t * .58).toFixed(2)} ${(n[3] + a * t * .58).toFixed(2)}, ${(n[4] + i * t).toFixed(2)} ${(n[5] + a * t).toFixed(2)}, ${n[6].toFixed(2)} ${n[7].toFixed(2)}`);
                }(e);
            }));
        }
        function xr(e = !0) {
            bn && (cancelAnimationFrame(bn), bn = 0);
            const t = yn;
            return t ? (t.previewGroup?.classList.remove("is-curve-previewing"), t.previewPath?.remove(), 
            yn = null, e && Mr({
                anchorId: t.id
            }), t) : null;
        }
        function Sr(e, t, n) {
            const i = Cn.createSVGPoint();
            i.x = t, i.y = n;
            const a = i.matrixTransform(e.screenToLayer || __sxScreenCtm(In).inverse()), r = a.x - e.startX, o = a.y - e.startY;
            return e.startBend + r * e.nx + o * e.ny;
        }
        function $r() {
            void 0 !== Zp && Zp && (t.clear(Zp), Zp = 0), void 0 !== Qp && Qp && (cancelAnimationFrame(Qp), 
            Qp = 0), Cn.classList.remove("is-layout-moving"), In.querySelectorAll(".layout-exit-clone").forEach(e => e.remove()), 
            In.querySelectorAll(".rich-line-draw").forEach(e => {
                e.classList.remove("rich-line-draw"), e.removeAttribute("pathLength");
            }), In.querySelectorAll(".layout-transition,.layout-move-start,.layout-enter-start,.layout-exit-active,.rich-layout").forEach(e => {
                e.classList.remove("layout-transition", "layout-move-start", "layout-enter-start", "layout-exit-active", "rich-layout"), 
                e.style.removeProperty("--layout-dx"), e.style.removeProperty("--layout-dy"), e.style.removeProperty("--layout-enter-dx"), 
                e.style.removeProperty("--layout-enter-dy"), e.style.removeProperty("--layout-exit-dx"), 
                e.style.removeProperty("--layout-exit-dy");
            });
        }
        async function Er(n) {
            let i = [];
            try {
                i = Xi().slice(0, 2);
            } catch (e) { __sxErrLog("top-profiles", e); }
            if (i.length < 2) return;
            const a = i.map(e => {
                try {
                    return Ji(wt[e]) || "Partner";
                } catch (e) {
                    return "Partner";
                }
            }), r = `${a[0]} × ${a[1]}`, o = "mutual" === Pt ? "Want to do together" : "explore" === Pt ? "Curious about" : "mismatch" === Pt ? "Mismatched — talk about it" : "Comparison", s = "couple" === n, l = s ? "Want to compare your couple?" : "Want to compare hypermaps?", c = s ? "Make your hypermaps at sexcapades.io" : "Make your free hypermap at sexcapades.io", d = s ? "See how you two compare →" : "See how YOU compare →", u = e.byId("mapSvg");
            if (!u) return;
            const p = u.cloneNode(!0);
            p.setAttribute("width", "1600"), p.setAttribute("height", "1400"), p.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            let h = "";
            try {
                h = (new XMLSerializer).serializeToString(p);
            } catch (e) {
                return void console.warn("Overlap image serialization failed", e);
            }
            const g = new Blob([ h ], {
                type: "image/svg+xml;charset=utf-8"
            }), m = URL.createObjectURL(g);
            let f = null;
            try {
                f = await new Promise((e, t) => {
                    const n = new Image;
                    n.onload = () => e(n), n.onerror = () => t(new Error("map image failed to load")), 
                    n.src = m;
                });
            } catch (e) {
                return URL.revokeObjectURL(m), void console.warn("Overlap share aborted:", e.message);
            }
            const y = 1600, b = document.createElement("canvas");
            b.width = y, b.height = 2060;
            const v = b.getContext("2d");
            v.fillStyle = "#151816", v.fillRect(0, 0, y, 2060), v.textAlign = "center", v.textBaseline = "alphabetic", 
            v.fillStyle = "#edf2ee", v.font = "700 54px system-ui, sans-serif", v.fillText(r, 800, 85), 
            v.fillStyle = "#63c2c8", v.font = "500 36px system-ui, sans-serif", v.fillText(o, 800, 145), 
            v.fillStyle = "#aeb8b1", v.font = "400 28px system-ui, sans-serif", v.fillText("See what we have in common", 800, 192);
            try {
                v.drawImage(f, 0, 230, y, 1400);
            } catch (e) {
                console.warn("Overlap map draw failed", e);
            }
            URL.revokeObjectURL(m);
            const w = 1630;
            v.fillStyle = "#0d1110", v.fillRect(0, w, y, 430), v.strokeStyle = "rgba(99,194,200,.45)", 
            v.lineWidth = 3, v.beginPath(), v.moveTo(0, w), v.lineTo(y, w), v.stroke();
            try {
                const e = await qu("https://sexcapades.io/#app", 480);
                v.fillStyle = "#ffffff", v.fillRect(48, 1688, 304, 304), v.imageSmoothingEnabled = !1, 
                v.drawImage(e, 60, 1700, 280, 280), v.imageSmoothingEnabled = !0;
            } catch (e) {
                console.warn("Overlap QR failed:", e.message);
            }
            const k = 390;
            v.textAlign = "left", v.fillStyle = "#edf2ee", v.font = "700 46px system-ui, sans-serif", 
            v.fillText(l, k, 1750), v.fillStyle = "#d7ded8", v.font = "400 33px system-ui, sans-serif", 
            v.fillText(c, k, 1810), v.fillStyle = "#aeb8b1", v.font = "400 28px system-ui, sans-serif", 
            v.fillText("18+ · No account · Stays on your phone", k, 1865), v.fillStyle = "#63c2c8", 
            v.font = "700 32px system-ui, sans-serif", v.fillText(d, k, 1930), v.fillStyle = "#7a857e", 
            v.font = "400 24px system-ui, sans-serif", v.fillText("No profiles were shared — just the overlap.", k, 1985), 
            b.toBlob(e => {
                if (!e) return;
                // F9 (sharing-sync refactor): the download step
                // goes through the shared ny helper like every
                // other export; the layout above and the
                // no-profile-data rule stay overlap-only.
                const i = e => String(e || "partner").replace(/[^a-z0-9]+/gi, "-").slice(0, 20), r = URL.createObjectURL(e);
                ny(r, `Sexcapades-overlap-${i(a[0])}-${i(a[1])}.png`), t.setTimeout(() => {
                    URL.revokeObjectURL(r);
                }, 1500);
            }, "image/png");
        }
        // Layout-editor length overrides (map-render refactor, finding
        // 6): one helper for the render loop's three per-override
        // sites — per-subcategory overrides (mn.subcatOverrides, keyed
        // by topic label), per-kink overrides (mn.kinkOverrides, keyed
        // by topic id), and per-kink overrides for subcategory children
        // (same table; the sites pass a unit length and use the result
        // as the multiplier). Returns length * override.length when a
        // positive numeric override exists, else the length unchanged.
        // Errors keep the sites' historical shape: caught and logged
        // as "layout-override", length unchanged. (The draw path once
        // never read these tables — the multiplier lived only in the
        // collision estimate — until Builds 2026-10-19_0255 and
        // 2026-10-20_0023 wired the draw sites.)
        function applyLengthOverride(length, key, table) {
            try {
                const ov = table ? table[key] : null;
                if (ov && typeof ov.length === "number" && ov.length > 0) return length * ov.length;
            } catch (_) { __sxErrLog("layout-override", _); }
            return length;
        }
        // Q6 truthful progress (field fix, 2026-10-24): Ar is a
        // generator so Mr can step it. sxChunkPaint is set only by
        // the layout API's applyChunked (the layout editor's armed
        // task-session apply): Mr then steps the paint one phase per
        // frame instead of running it in one synchronous block, so
        // the pipeline's own __sxLoad / __sxNodeTick checkpoints get
        // frames in which to paint — progress becomes stage truth,
        // never an interpolated number. With the flag off (every
        // other render) Mr drives the generator to completion
        // synchronously inside the same call, exactly the old
        // behaviour. sxPaintPromise tracks the in-flight chunked
        // paint so applyChunked / applyScoped can await its settle.
        // sxChunkBudget is the per-frame work budget (ms) of a chunked
        // paint: 12 for the editor path (pinned in applyChunked), and
        // a larger shell-chosen slice for the boot-only paint (see
        // sxBootChunk in Mr) — bigger slices mean fewer double-rAF
        // waits per render, at the cost of fewer painted values.
        // Thread 2 boot entry: the shell boot controller arms
        // window.__sxBootChunkPaint with a budget before this bundle
        // executes; Mr consumes it one-shot for the first paint it
        // starts, so the boot render — and only the boot render —
        // paints its checkpoints progressively. Ordinary renders
        // stay synchronous; the global default is unchanged.
        let sxChunkPaint = !1, sxPaintPromise = null, sxChunkBudget = 12;

        // SX_PLANE_VAULT: Instant profile switching cache
        // Keeps rendered DOM trees (with attached event listeners)
        // intact in memory inside DocumentFragments.
        const sxPlaneVault = new Map();
        let sxActiveVaultKey = null;
        let sxActiveVaultProfileId = null;

        function sxGetMapVaultKey(id) {
            const profId = id || "__default__";
            const v = (typeof vht !== "undefined" && Boolean(vht[profId])) ? (typeof av === "function" && typeof vpt !== "undefined" ? av(vpt[profId]) : "on") : "off";
            const mode = (typeof Qi === "function" && Qi()) ? "compare:" + Array.from(Xi()).sort().join(",") : "single:" + profId;
            const search = (typeof $n !== "undefined" && $n && $n.size) ? Array.from($n).sort().join(",") : "none";
            const detail = typeof mapDetailLevel !== "undefined" ? mapDetailLevel : "norm";
            const cat = typeof Pt !== "undefined" ? Pt : "all";
            const rated = typeof Sn !== "undefined" ? Sn : "all";
            const blind = typeof Rt !== "undefined" ? Rt : false;
            return `${mode}|det:${detail}|cat:${cat}|srch:${search}|sn:${rated}|veil:${v}|blind:${blind}`;
        }

        function sxVaultCaptureCurrent() {
            if (!sxActiveVaultKey || !In || In.childNodes.length === 0) return;
            const frag = document.createDocumentFragment();
            while (In.firstChild) {
                frag.appendChild(In.firstChild);
            }
            if (sxPlaneVault.size >= 8) {
                const oldestKey = sxPlaneVault.keys().next().value;
                sxPlaneVault.delete(oldestKey);
            }
            sxPlaneVault.set(sxActiveVaultKey, frag);
            sxActiveVaultKey = null;
            sxActiveVaultProfileId = null;
        }

        function sxVaultTryRestore(profileId) {
            if (!profileId || !In) return false;
            if (typeof yt !== "undefined" && yt[profileId]) return false;
            const key = sxGetMapVaultKey(profileId);
            const cachedFrag = sxPlaneVault.get(key);
            if (!cachedFrag || cachedFrag.childNodes.length === 0) return false;

            sxVaultCaptureCurrent();
            if (typeof In.replaceChildren === "function") {
                In.replaceChildren(cachedFrag);
            } else {
                while (In.firstChild) In.removeChild(In.firstChild);
                In.appendChild(cachedFrag);
            }
            sxPlaneVault.delete(key);
            sxActiveVaultKey = key;
            sxActiveVaultProfileId = profileId;
            return true;
        }

        function sxWireMapListeners() {
            if (!In) return;
            In.querySelectorAll(".branch-icon,.topic-icon,.category-label,.map-label").forEach(ul);
            try { wh(); hg(); _a(); } catch (_) {}
            In.querySelectorAll(".center-glance-ring-hit").forEach(e => {
                e.addEventListener("mouseenter", () => Fc(e.dataset.centerGlanceIndex, e));
                e.addEventListener("mouseleave", _c);
                e.addEventListener("keydown", t => {
                    "Enter" !== t.key && " " !== t.key || (t.preventDefault(), t.stopPropagation(), Fc(e.dataset.centerGlanceIndex, e));
                });
            });
            In.querySelectorAll(".category-label,.map-label,.branch-icon,.topic-icon").forEach(e => e.addEventListener("click", Qa));
            In.querySelectorAll(".concept-hit,.topic-stem,.tapered-stem,.hanky-midline,.hanky-midline-outline").forEach(e => e.addEventListener("click", Qsel));
            In.querySelectorAll(".node-note-trigger").forEach(e => {
                const t = t => {
                    t.preventDefault(), t.stopPropagation();
                    const n = e.getBoundingClientRect();
                    xo(e.dataset.noteId, n.left + n.width / 2, n.bottom + 4, { focusNote: !0 });
                };
                e.addEventListener("click", t);
                e.addEventListener("mouseenter", t);
                e.addEventListener("keydown", e => { "Enter" !== e.key && " " !== e.key || t(e); });
            });
            In.querySelectorAll(".category-label,.map-label,.concept-hit,.topic-stem,.branch-icon,.topic-icon").forEach(e => e.addEventListener("dblclick", t => {
                t.preventDefault(), t.stopPropagation();
                const n = e.dataset.id || e.dataset.topicId || __sxClosestAction(e, "nodeGroup")?.dataset.layoutKey;
                n && xo(n, t.clientX, t.clientY);
            }));
            In.querySelectorAll(".category-label,.map-label,.concept-hit").forEach(e => e.addEventListener("keydown", t => {
                if ("Enter" !== t.key && " " !== t.key) return;
                t.preventDefault(), t.stopPropagation();
                const n = e.dataset.id || e.dataset.topicId;
                t.shiftKey ? xo(n, innerWidth / 2, innerHeight / 2) : e.classList.contains("concept-hit") ? selectSpokeNode(n, !0) : $i(n);
            }));
            In.querySelectorAll(".hidden-count-badge").forEach(e => e.addEventListener("keydown", t => {
                "Enter" !== t.key && " " !== t.key || (t.preventDefault(), t.stopPropagation(), vi(e.dataset.id));
            }));
            In.querySelectorAll(".direction-hit").forEach(e => e.addEventListener("keydown", t => function(e, t) {
                const n = "Enter" === t.key || " " === t.key, i = [ "ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End" ].includes(t.key);
                if (!n && !i) return;
                if (mn.staticMap) return;
                t.preventDefault(), t.stopPropagation();
                const a = e.dataset.id, r = e.dataset.direction;
                if (n) {
                    if (Nt) {
                        if (Nt.id !== a || Nt.direction !== r) return;
                    } else Nt = { id: a, direction: r };
                    return void Mr();
                }
                const o = da(a, Vi());
                let s = o[r + "Known"] ? o[r] : 0;
                if ("Home" === t.key) s = -100; else if ("End" === t.key) s = 100; else {
                    const e = t.shiftKey ? 10 : 1;
                    s += "ArrowRight" === t.key || "ArrowUp" === t.key ? e : -e;
                }
                const l = Vi(), c = cs(l).rated;
                Nt = null, To(a, r, s), checkMilestoneTransition(l, c);
            }(e, t)));
            In.querySelectorAll(".curve-edit-handle").forEach(e => e.addEventListener("keydown", t => {
                if (![ "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home" ].includes(t.key)) return;
                if (mn.staticMap) return;
                t.preventDefault(), t.stopPropagation();
                const n = e.dataset.curveId, i = Number(e.dataset.bend) || 0;
                "Home" === t.key ? delete bt[n] : bt[n] = Math.max(-260, Math.min(260, i + ("ArrowLeft" === t.key || "ArrowDown" === t.key ? -12 : 12)));
                Mr({ anchorId: n });
            }));
            In.querySelectorAll(".rating-clear-hit").forEach(e => e.addEventListener("keydown", t => {
                "Enter" !== t.key && " " !== t.key || (t.preventDefault(), t.stopPropagation(), Fo(e.dataset.id, e.dataset.direction));
            }));
            const x = In.querySelector(".center-hit");
            x && (x.addEventListener("keydown", e => {
                "Enter" !== e.key && " " !== e.key || (e.preventDefault(), e.stopPropagation(), sh());
            }), x.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), performance.now() - Dp <= 700 || sh();
            }), x.addEventListener("contextmenu", e => {
                e.preventDefault();
            }));
            try { Ja(); } catch (_) {}
        }

        const SX_WARM_BOOT_VER = "4.0.0-w1";
        const SX_WARM_BOOT_STORAGE_KEY = "sx_hypermap_warm_boot_v1";

        function sxSaveWarmBootCache(profileId) {
            if (!In || In.childNodes.length === 0) return;
            const profId = profileId || "__default__";
            try {
                const key = sxGetMapVaultKey(profId);
                const payload = JSON.stringify({
                    v: SX_WARM_BOOT_VER,
                    time: Date.now(),
                    key: key,
                    profileId: profId,
                    markup: In.innerHTML
                });
                let saved = false;
                try {
                    localStorage.setItem(SX_WARM_BOOT_STORAGE_KEY, payload);
                    saved = true;
                } catch (lsErr) {
                    console.warn("[Sexcapades WarmBoot] localStorage.setItem failed, fallback to sessionStorage:", lsErr);
                }
                if (!saved) {
                    try {
                        sessionStorage.setItem(SX_WARM_BOOT_STORAGE_KEY, payload);
                        saved = true;
                    } catch (ssErr) {
                        console.warn("[Sexcapades WarmBoot] sessionStorage.setItem failed:", ssErr);
                    }
                }
                if (saved) {
                    console.log("[Sexcapades WarmBoot] Saved hypermap cache for [" + profId + "] (" + Math.round(payload.length / 1024) + " KB)");
                }
            } catch (err) {
                console.warn("[Sexcapades WarmBoot] Cache save error:", err);
            }
        }

        function sxGetWarmBootRaw() {
            try {
                return localStorage.getItem(SX_WARM_BOOT_STORAGE_KEY) || sessionStorage.getItem(SX_WARM_BOOT_STORAGE_KEY);
            } catch (_) {
                try {
                    return sessionStorage.getItem(SX_WARM_BOOT_STORAGE_KEY);
                } catch (_) {
                    return null;
                }
            }
        }

        function sxTryRestoreWarmBoot() {
            if (!In) return false;
            try {
                const raw = sxGetWarmBootRaw();
                if (!raw) {
                    console.log("[Sexcapades WarmBoot] No warm-boot cache found in storage.");
                    return false;
                }
                const cached = JSON.parse(raw);
                if (!cached || cached.v !== SX_WARM_BOOT_VER) {
                    console.log("[Sexcapades WarmBoot] Cache version mismatch.");
                    return false;
                }
                if (!cached.key || !cached.markup || !cached.profileId) return false;

                const currentTargetId = Mt && vt[Mt] ? Mt : (Object.keys(vt).length ? Object.keys(vt)[0] : "__default__");
                if (cached.profileId !== currentTargetId) {
                    console.log("[Sexcapades WarmBoot] Profile mismatch:", cached.profileId, "vs current", currentTargetId);
                    return false;
                }

                const currentKey = sxGetMapVaultKey(currentTargetId);
                if (cached.key !== currentKey) {
                    console.log("[Sexcapades WarmBoot] Key mismatch:", cached.key, "vs current", currentKey);
                    return false;
                }
                if (typeof yt !== "undefined" && yt[currentTargetId]) return false;

                n(In, cached.markup);
                sxWireMapListeners();

                sxActiveVaultKey = currentKey;
                sxActiveVaultProfileId = currentTargetId;

                // Dismiss boot loading dial immediately (< 50ms)
                window.__sxBootChunkPaint = 0;
                if (typeof window.__sxBootProgress === "function") window.__sxBootProgress(100);
                if (typeof window.__sxBootFinish === "function") window.__sxBootFinish(false);
                if (typeof window.__sxLoad === "function") window.__sxLoad(100);

                try { vc(); } catch (_) {}
                try { Ih(); } catch (_) {}
                console.log("[Sexcapades WarmBoot] Warm boot restore SUCCESSFUL (< 50ms) for [" + currentTargetId + "]!");
                return true;
            } catch (err) {
                if (typeof __sxErrLog === "function") __sxErrLog("warm-boot-restore", err);
                console.warn("[Sexcapades WarmBoot] Warm boot restore error:", err);
                return false;
            }
        }

        function sxInvalidateWarmBootCache(id) {
            try {
                if (!id) {
                    localStorage.removeItem(SX_WARM_BOOT_STORAGE_KEY);
                    sessionStorage.removeItem(SX_WARM_BOOT_STORAGE_KEY);
                    return;
                }
                const raw = sxGetWarmBootRaw();
                if (raw && raw.includes(id)) {
                    localStorage.removeItem(SX_WARM_BOOT_STORAGE_KEY);
                    sessionStorage.removeItem(SX_WARM_BOOT_STORAGE_KEY);
                }
            } catch (_) {}
        }

        function sxVaultInvalidate(id) {
            sxInvalidateWarmBootCache(id);
            if (!id) {
                sxPlaneVault.clear();
                sxActiveVaultKey = null;
                sxActiveVaultProfileId = null;
                return;
            }
            if (sxActiveVaultProfileId === id) {
                sxActiveVaultKey = null;
                sxActiveVaultProfileId = null;
            }
            for (const k of sxPlaneVault.keys()) {
                if (k.includes(id)) {
                    sxPlaneVault.delete(k);
                }
            }
        }

        function* Ar(i = {}) {
            try { sxVaultCaptureCurrent(); } catch (_) {}
            const scT0 = performance.now();
            ki && (t.clear(ki), ki = 0), dh(), uh(), $r(), window.__sxLoad && window.__sxLoad(5 /* F5 checkpoint contract (at __sxProgressWidget in index.html): displayed band value — render start */);
            // Blit session (P3) paint-top gate: end the session
            // before a non-scoped paint or a scoped paint whose
            // frozen set differs from the session's, so this paint
            // runs as an ordinary segment/full paint (see
            // blitPaintGate at the scCtx declarations).
            try {
                blitPaintGate();
            } catch (_) {
                __sxErrLog("layout-blit-gate", _);
            }
            // Scoped paint (T3): while a scope is active, capture
            // frozen branches' live .node-group elements (branch
            // membership via the qn registry the previous paint
            // built — this paint rebuilds it below) so the end of
            // this function can restore those exact element objects
            // over the freshly built ones: the rebuild below replaces
            // the whole viewport's innerHTML, so without this the
            // frozen groups would be re-created even though their
            // solved geometry is replayed verbatim. Exit-animation
            // clones are not the branch's group and are never kept.
            const scKeep = scCtx ? new Map : null;
            if (scKeep) try {
                In.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => {
                    const info = qn[el.dataset.layoutKey];
                    info && info.branch && scCtx.frozenBranches.has(info.branch) && scKeep.set(el.dataset.layoutKey, el);
                });
            } catch (_) { __sxErrLog("layout-scoped-paint-capture", _); }
            // Segment paint (P1): alongside the T3 element capture
            // above, capture each frozen group's extracted pieces from
            // the pre-clear DOM, so a scoped paint can skip building
            // frozen branches entirely and splice the retained
            // segments back in after the (much smaller) string is
            // installed. Pieces are searched for inside the group
            // first (never extracted, or vaulted there by a blit
            // session), then in the extraction stacks: label in
            // .map-label-stack by data-id, direction controls in
            // .direction-control-stack by data-id, spoke stems as the
            // children of the .spoke-underlay-item keyed by
            // data-spoke-for, hidden-count badge in
            // .node-interaction-overlay by data-id (badges without a
            // data-id — the density-count variant — cannot be
            // attributed there and are only found in-group). Any
            // failure drops the whole segment mechanism for this paint
            // (scSeg = null) and the paint falls back to building
            // everything and using the T3 swap, exactly as before.
            let scSeg = null, scSegOrder = null, scSegDiverged = 0, scTCap = 0, scTAsm = 0, scTIns = 0, scTSplice = 0;
            const scSegDone = new Set, scSkipped = new Set;
            if (scKeep) { const scTCap0 = performance.now(); try {
                scSeg = new Map, scSegOrder = [];
                In.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => scSegOrder.push(el.dataset.layoutKey));
                const scLabelStack = In.querySelector(":scope > .map-label-stack"), scCtrlStack = In.querySelector(":scope > .direction-control-stack"), scUnderlay = In.querySelector(":scope > .spoke-underlay"), scOverlay = In.querySelector(".node-interaction-overlay");
                // Single-pass stack indexes (P1 perf): one scan per
                // extraction stack, bucketed by the same attribute the
                // per-key searches below used — first in document
                // order wins for the singleton pieces (label, badge,
                // underlay item), document order preserved for the
                // control lists — so every lookup returns exactly the
                // element(s) the per-key querySelector(All) returned,
                // in O(1) instead of a fresh stack scan per key.
                const scIdxLabel = new Map, scIdxControls = new Map, scIdxStems = new Map, scIdxBadge = new Map;
                if (scKeep.size) {
                    scLabelStack && scLabelStack.querySelectorAll(".category-label[data-id], .map-label[data-id]").forEach(el => { const id = el.dataset.id; id && !scIdxLabel.has(id) && scIdxLabel.set(id, el); });
                    scCtrlStack && scCtrlStack.querySelectorAll(".direction-control[data-id]").forEach(el => { const id = el.dataset.id; if (!id) return; const arr = scIdxControls.get(id); arr ? arr.push(el) : scIdxControls.set(id, [ el ]); });
                    scUnderlay && scUnderlay.querySelectorAll(".spoke-underlay-item[data-spoke-for]").forEach(el => { const id = el.dataset.spokeFor; id && !scIdxStems.has(id) && scIdxStems.set(id, el); });
                    scOverlay && scOverlay.querySelectorAll(".hidden-count-badge[data-id]").forEach(el => { const id = el.dataset.id; id && !scIdxBadge.has(id) && scIdxBadge.set(id, el); });
                }
                scKeep.forEach((el, key) => {
                    const seg = {
                        branch: (qn[key] || {}).branch || null,
                        label: null,
                        labelStack: !1,
                        controls: [],
                        controlsStack: !1,
                        stems: [],
                        stemsStack: !1,
                        badge: null,
                        badgeStack: !1
                    };
                    let found = el.querySelector(":scope > .category-label, :scope > .map-label");
                    if (found) seg.label = found; else if (scLabelStack && (found = scIdxLabel.get(key))) seg.label = found, seg.labelStack = !0;
                    const inControls = Array.from(el.querySelectorAll(":scope > .direction-control")), stackControls = scCtrlStack ? scIdxControls.get(key) || [] : [];
                    inControls.length && (seg.controls = inControls), stackControls.length && (seg.controls = seg.controls.concat(stackControls), seg.controlsStack = !0);
                    const inStems = Array.from(el.querySelectorAll(vr)).filter(c => !(__sxClosestAction(c, "directionControl") || __sxClosestAction(c, "secondGenRatingControls") || c.classList.contains("visual-rail") && c.classList.contains("rating-rail")));
                    if (!inStems.length && scUnderlay) {
                        const item = scIdxStems.get(key);
                        item && item.children.length && (seg.stems = Array.from(item.children), seg.stemsStack = !0);
                    }
                    found = el.querySelector(":scope > .hidden-count-badge");
                    if (found) seg.badge = found; else if (scOverlay && (found = scIdxBadge.get(key))) seg.badge = found, seg.badgeStack = !0;
                    scSeg.set(key, seg);
                });
            } catch (_) { __sxErrLog("layout-scoped-paint-segcapture", _), scSeg = null, scSegOrder = null; } scTCap = performance.now() - scTCap0; }
            const a = !1 !== i.animate && !!mn.animations;
            Cn.classList.toggle("curve-editing", !1), function() {
                const t = e.byId("mapCompareEmpty");
                if (!t) return;
                const n = "mutual" === Pt || "explore" === Pt || "mismatch" === Pt, i = Object.keys(vt).filter(e => vt[e] && wt[e]).length;
                t.hidden = !(n && i < 2), function() {
                    const t = e.byId("shareOverlapBtn");
                    if (!t) return;
                    const n = "mutual" === Pt || "explore" === Pt || "mismatch" === Pt;
                    let i = 0;
                    try {
                        i = Xi().length;
                    } catch (e) {
                        i = 0;
                    }
                    t.hidden = !(n && i >= 2);
                }();
            }();
            const r = new Map, o = new Map, s = "lite" === Kp ? 18 : 48;
            let l = 0;
            In.querySelectorAll("[data-layout-key]").forEach(e => {
                const t = e.dataset.layoutKey, n = {
                    x: Number(e.dataset.layoutX),
                    y: Number(e.dataset.layoutY)
                };
                r.set(t, n);
                const c = Boolean(i.exitIds && i.exitIds.has(t));
                a && i.exitIds && c && l < s ? (o.set(t, e.cloneNode(!0)), l++) : a && !i.exitIds && "lite" !== Kp && o.set(t, e.cloneNode(!0));
            }), i.anchorId ? r.get(i.anchorId) : i.anchorPoint;
            // CAPSULE WIPE GATED ON FULL-PAINT COMPLETION (Fix 2,
            // ruled 2026-11-01, Jason): the interim capsule layer
            // (sxInterimCapsulePaint's .sx-interim-capsules, a direct
            // child of the map layer) is captured BEFORE the opening
            // clear below (n(In, "")) and re-appended right after the
            // clear's early-return fork, so the clear cannot wipe it
            // before this paint lands. It stays visible through the
            // paint's yields / chunked steps — and survives a paint
            // that fails or is superseded mid-flight — and is removed
            // only by the markup install further down (n(In, v)),
            // which replaces the layer's content wholesale in the
            // same step that lands the full paint: the capsule dies
            // exactly when the full paint lands, never before, so
            // the wipe can never leave the map layer empty. The
            // no-profile early return just below installs its own
            // content in place of the clear, which is itself a
            // landed paint, so the capsule correctly dies with it
            // and is not re-appended on that path.
            const sxCapsuleKeep = (() => { try { return In.querySelector(":scope > .sx-interim-capsules"); } catch (_) { return null; } })();
            const c = !Object.keys(wt).length;
            if (n(Pn, `<linearGradient id="curiousGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--red-deep)"/><stop offset="50%" stop-color="var(--curious)"/><stop offset="100%" stop-color="var(--green-deep)"/></linearGradient><clipPath id="centerPhotoClip"><circle cx="900" cy="620" r="${ea.photoRadius}"/></clipPath>`), 
            n(In, ""), Object.keys(qn).forEach(e => delete qn[e]), h.forEach(e => {
                const t = catId(e.name);
                qn[t] = {
                    id: t,
                    label: e.name,
                    branch: e.name,
                    kind: "Category",
                    risk: e.risk
                }, (e.subcategories || []).forEach(n => {
                    const i = Un(e.name, n.name);
                    qn[i] = {
                        id: i,
                        label: n.name,
                        branch: e.name,
                        kind: "Subcategory",
                        risk: e.risk,
                        parentId: t,
                        topics: (n.topics || []).map(sxName)
                    };
                }), e.topics.forEach(t => {
                    const n = Wn(t), i = Vn(e, t);
                    qn[n] = {
                        id: n,
                        label: sxName(t),
                        branch: e.name,
                        kind: "Topic",
                        risk: Boolean(t && t.risk),
                        parentId: i ? Un(e.name, i.name) : null
                    };
                });
            }), window.__sxLoad && window.__sxLoad(12 /* F5 checkpoint contract (at __sxProgressWidget in index.html): displayed band value — topic index */), !(c || Mt && vt[Mt])) return n(In, `<g>${oa()}${function(e) {
                const t = 1.75 * ea.photoRadius, n = Za.fitWithin(e, 22 * mapFontScale(), 15, t, "center"), i = Za.fitAttr(e, n, "center", t);
                return `<text x="900" y="600" text-anchor="middle" class="center-label" pointer-events="none" style="font-size:${n.toFixed(2)}px"${i}>${Hi(e)}</text>`;
            }("Select a profile")}<text x="900" y="640" text-anchor="middle" class="center-sub" pointer-events="none">tap a profile tab to begin</text></g>`), 
            window.__sxLoad && window.__sxLoad(100), void vc();
            // Fix 2 (see sxCapsuleKeep above): re-append the
            // preserved interim capsule layer over the cleared map
            // layer; the markup install below removes it in the
            // same step that lands the full paint.
            if (sxCapsuleKeep && !sxCapsuleKeep.isConnected) try { In.appendChild(sxCapsuleKeep); } catch (_) {}
            yield;
            li().forEach(e => {
                qn[e.id] = e;
            });
            const d = SX_SOLVER_FACADE.build(), u = "all" === Pt ? [] : ri();
            SX_SOLVER_FACADE.tidy(d);
            yield;
            window.__sxNodesStart && window.__sxNodesStart(d.branches.reduce((s, e) => s + 1 + (e.topics || []).reduce((s2, t) => s2 + 1 + ((t.children || []).length), 0), 0)), window.__sxLoad && window.__sxLoad(12 /* F5 checkpoint contract (at __sxProgressWidget in index.html): displayed band value — node band start */);
            sn.clear(), d.branches.forEach(e => sn.set(e.entry.branch.name, e.angle));
            yield;
            const p = Math.max(1, d.branches.filter(e => {
                const t = e.entry, n = t.branch, i = t.selected, a = t.catId;
                if ($n && !$n.has(a) && !t.topics.some(e => $n.has(e.id))) return !1;
                if (("rated" === Sn ? !hi(n, Vi()) : "unrated" === Sn && !mi(n, Vi())) && !i) return !1;
                if ("all" !== Pt) {
                    const e = n.topics.some(e => {
                        const t = Wn(e);
                        return Ra(t) === Pt || u.some(e => e.parentId === t && Ra(e.id) === Pt);
                    });
                    if (Ra(a) !== Pt && !e) return !1;
                }
                return !0;
            }).length), g = function() {
                const e = Object.keys(vt).filter(e => vt[e] && wt[e]), t = Xi(), n = (t.length >= 2 ? t : Mt && vt[Mt] ? [ Mt ] : e.slice(0, 1)).map(e => Ji(wt[e])).filter(Boolean);
                return 1 === n.length ? n[0] : 2 === n.length ? `${n[0]} & ${n[1]}` : n.length > 2 ? `${n.slice(0, -1).join(", ")} & ${n[n.length - 1]}` : "Add a profile";
            }(), f = Rt ? "var(--green)" : c ? Ga.FALLBACK_COLOR : la(Vi());
            /* Two-ring header (O1/O4): the header rings are the single home
               for the headline numbers. Group tabs show the pair pair
               (outer Play MS, inner Play KF; circledot tabs
               the Parlay MS / Parlay KF pair); individual tabs show outer
               Charted, inner Personal Kink Factor. This is the only
               paint of the outer ring. */
            try {
                const sxHdrVals = (() => {
                    /* Match-stage rings live in the header Avatar only
                       (ruled 2026-10-30): while a match tab is the active
                       tab, the header rings show that tab's match-stage
                       scores, through the same cast provider the saved
                       group header uses — circledot reads the straight
                       pair for two, and the group Parlay aggregates
                       (group-Parlay fix, 2026-10-30) for casts of more
                       than 2, bowtie reads the crossed aggregates. The
                       below-strip score-ring hosts are gone; bucket
                       rings are a different mechanism and are
                       untouched. */
                    try {
                        const sxTab = sxCurrentTab();
                        if (sxTab) {
                            const sxTabCtx = sxTabContext(sxTab);
                            if (sxTabCtx && sxTabCtx.profiles && sxTabCtx.profiles.length >= 2) return sxRingValuesForCast(sxTabCtx.profiles, "circledot" === sxTab.kind ? "straight" : undefined);
                        }
                    } catch (err) { __sxErrLog("sx-header-match-rings", err); }
                    const rec = Mt && ft[Mt] ? ft[Mt] : null;
                    if (rec && "group" === rec.kind && Array.isArray(rec.sourceProfiles) && rec.sourceProfiles.length >= 2) return sxRingValuesForCast(rec.sourceProfiles, rec.pairOp);
                    if (Mt && vt[Mt]) return sxRingValuesForProfile(sxProfileById(Mt));
                    return null;
                })();
                const sxArc = v => null == v || !Number.isFinite(v) ? 0 : Math.max(0, Math.min(100, v)),
                    sxOuterEl = e.byId("headerHorizonValue"), sxInnerEl = e.byId("headerPersonalValue"), sxCapEl = e.byId("headerRingCaption"), sxCtl = e.byId("headerHorizonControl");
                if (sxOuterEl) { const a = sxArc(sxHdrVals && sxHdrVals.outer); sxOuterEl.style.strokeDasharray = `${a} ${100 - a}`; sxOuterEl.style.opacity = sxHdrVals && null != sxHdrVals.outer ? "1" : "0"; }
                if (sxInnerEl) { const a = sxArc(sxHdrVals && sxHdrVals.inner); sxInnerEl.style.strokeDasharray = `${a} ${100 - a}`; sxInnerEl.style.opacity = sxHdrVals && null != sxHdrVals.inner ? "1" : "0"; }
                if (sxCapEl) sxCapEl.textContent = sxHdrVals ? `${sxHdrVals.outerLabel} ${sxPctText(sxHdrVals.outer)} · ${sxHdrVals.innerLabel} ${sxPctText(sxHdrVals.inner)}` : "";
                if (sxCtl && sxHdrVals) { const t2 = `${sxHdrVals.outerLabel} ${sxPctText(sxHdrVals.outer)}; ${sxHdrVals.innerLabel} ${sxPctText(sxHdrVals.inner)}.`; sxCtl.setAttribute("aria-label", `Open Charted details. ${t2}`); sxCtl.dataset.uiTooltip = t2; }
                const sxRingSvg = e.byId("headerHorizonRing");
                if (sxRingSvg && sxHdrVals) sxRingSvg.setAttribute("aria-label", `Open Charted details. ${sxHdrVals.outerLabel} ${sxPctText(sxHdrVals.outer)}, ${sxHdrVals.innerLabel} ${sxPctText(sxHdrVals.inner)}.`);
                /* HEADER-HUG (2026-11-02, owner's order): the header rings hug
                   the avatar and each other the way the center node's rings
                   hug the center node — bands tiled close with one small even
                   clearance. Geometry only. The stylesheet radii (46 / 29 in a
                   108-unit box) drift loose because the seat is em-sized while
                   the avatar picture is a fixed 40px: whenever the seat
                   outgrows the picture, the picture floats in wide ring gaps.
                   So on every header-ring update the radii are re-derived from
                   the RENDERED sizes: inner band one small gap (2 units) off
                   the picture, outer band one small gap off the inner band,
                   the viewBox cropped to the tightened assembly, and the seat
                   shrunk to match so the pill closes around it. The unit scale
                   is kept fixed throughout, so the visible band (4 units) and
                   the tap band (11 units) render at exactly their former
                   sizes; no values, taps, or behavior change, and the O7
                   tap-target question stays open. */
                try {
                    const sxHugSvg = e.byId("headerHorizonRing"), sxHugWrap = sxHugSvg && sxHugSvg.closest ? sxHugSvg.closest(".guide-avatar-wrap") : null, sxHugImg = sxHugWrap ? sxHugWrap.querySelector(".avatar-music-btn img") : null;
                    if (sxHugSvg && sxHugWrap && sxHugImg) {
                        sxHugWrap.style.removeProperty("width"), sxHugWrap.style.removeProperty("height"), sxHugWrap.style.removeProperty("flex-basis");
                        const sxSeat0 = sxHugWrap.getBoundingClientRect().width, sxImgPx = sxHugImg.getBoundingClientRect().width;
                        if (sxSeat0 > 0 && sxImgPx > 0) {
                            const sxScale = sxSeat0 / 108, sxImgR = sxImgPx / 2 / sxScale, sxGap = 2, sxBand = 4, sxInnerR = sxImgR + sxGap + sxBand / 2, sxOuterR = sxInnerR + sxBand + sxGap, sxSide = 2 * (sxOuterR + sxBand / 2 + sxGap);
                            if (sxSide > 0 && sxSide < 108) {
                                const sxR2 = v => Math.round(100 * v) / 100, sxTracks = sxHugSvg.querySelectorAll(".horizon-ring-track"), sxHits = sxHugSvg.querySelectorAll(".horizon-ring-hit"), sxOuterVal = e.byId("headerHorizonValue"), sxInnerVal = e.byId("headerPersonalValue");
                                if (sxTracks[0]) sxTracks[0].setAttribute("r", String(sxR2(sxOuterR)));
                                if (sxOuterVal) sxOuterVal.setAttribute("r", String(sxR2(sxOuterR)));
                                if (sxTracks[1]) sxTracks[1].setAttribute("r", String(sxR2(sxInnerR)));
                                if (sxInnerVal) sxInnerVal.setAttribute("r", String(sxR2(sxInnerR)));
                                if (sxHits[0]) sxHits[0].setAttribute("r", String(sxR2(sxOuterR)));
                                if (sxHits[1]) sxHits[1].setAttribute("r", String(sxR2(sxInnerR)));
                                sxHugSvg.setAttribute("viewBox", `${sxR2(54 - sxSide / 2)} ${sxR2(54 - sxSide / 2)} ${sxR2(sxSide)} ${sxR2(sxSide)}`);
                                const sxSeatPx = `${sxR2(sxSide * sxScale)}px`;
                                sxHugWrap.style.width = sxSeatPx, sxHugWrap.style.height = sxSeatPx, sxHugWrap.style.flexBasis = sxSeatPx;
                                /* The seat's 15px bottom margin is the numbers
                                   caption's home inside the pill; when the
                                   caption is empty (no values yet) it is dead
                                   space inside the pill, so collapse it and the
                                   pill closes fully around the assembly. */
                                sxHugWrap.style.marginBottom = sxCapEl && sxCapEl.textContent && sxCapEl.textContent.trim() ? "" : "0px";
                            }
                        }
                    }
                } catch (err) { __sxErrLog("sx-header-hug", err); }
            } catch (err) { __sxErrLog("sx-header-rings", err); }
            const y = "Tap to open the About dialog for this profile";
            let v = function(e) {
                const t = !(Qi() ? Xi() : [ Vi() ]).some(e => {
                    const t = e === Et ? At : vt[e] || {};
                    return Object.values(t).some(e => "number" == typeof e || Boolean(e && "object" == typeof e && (Object.prototype.hasOwnProperty.call(e, "give") || Object.prototype.hasOwnProperty.call(e, "receive"))));
                }), n = new Map, i = new Map;
                e.forEach(e => {
                    const t = e.entry.branch;
                    n.set(t.name, e.angle), i.set(t.name, function(e) {
                        const t = h.find(t => t.name === e);
                        if (!t) return {
                            positive: !1,
                            negative: !1
                        };
                        const n = t.topics.map(e => Wn(e)), i = Qi() ? Xi() : [ Vi() ];
                        let a = !1, r = !1;
                        return i.forEach(e => n.forEach(t => {
                            const n = ca(t, e), i = Qe[e]?.[t];
                            a = a || n.giveKnown && n.give > 0 || n.receiveKnown && n.receive > 0 || "favorite" === i, 
                            r = r || n.giveKnown && n.give < 0 || n.receiveKnown && n.receive < 0 || "limit" === i;
                        })), {
                            positive: a,
                            negative: r
                        };
                    }(t.name));
                });
                const a = new Map, r = e => {
                    const t = n.get(e);
                    if (void 0 === t) return null;
                    const i = a.get(e) || 0;
                    return a.set(e, i + 1), Xa(t, 600 + 64 * i);
                }, o = pe(ue).map(n => {
                    const a = e.find(e => e.entry.branch.name === n[0]), o = e.find(e => e.entry.branch.name === n[1]), s = e => {
                        if (!e) return !1;
                        const t = catId(e.entry.branch.name);
                        return !($n && !$n.has(t)) && ("all" === Pt || Ra(t) === Pt || e.topics.some(e => Ra(e.topic.id) === Pt || e.children.some(e => Ra(e.child.id) === Pt)));
                    };
                    if (!s(a) || !s(o)) return "";
                    const l = i.get(n[0]), c = i.get(n[1]);
                    if (!l || !c) return "";
                    if (!t && !l.positive && !c.positive) return "";
                    const d = r(n[0]), u = r(n[1]);
                    if (!d || !u) return "";
                    const attrs = `data-branch-a="${Hi(n[0])}" data-branch-b="${Hi(n[1])}" data-ax="${d.x.toFixed(2)}" data-ay="${d.y.toFixed(2)}" data-bx="${u.x.toFixed(2)}" data-by="${u.y.toFixed(2)}" d="${br(d, u)}"`;
                    return `<path class="common-overlap-link relation-visual" ${attrs}/><path class="common-overlap-link relation-hit" tabindex="0" role="button" aria-label="Show related branches ${Hi(n[0])} and ${Hi(n[1])}" ${attrs}/>`;
                }).join(""), s = e.flatMap(e => e.topics || []), l = Qi() ? Xi() : [ Vi() ], c = e => {
                    const t = s.find(t => t.topic.id === e);
                    if (t) return t;
                    for (const t of s) {
                        const n = (t.children || []).find(t => t.child && t.child.id === e);
                        if (n) return n;
                    }
                    return null;
                }, d = o + pe(he).map(e => {
                    const n = c(e[0]), i = c(e[1]);
                    if (!n || !i) return "";
                    const a = e => {
                        let t = !1, n = !1;
                        return l.forEach(i => {
                            const a = ca(e, i), r = Qe[i]?.[e];
                            t = t || a.giveKnown && a.give > 0 || a.receiveKnown && a.receive > 0 || "favorite" === r, 
                            n = n || a.giveKnown && a.give < 0 || a.receiveKnown && a.receive < 0 || "limit" === r;
                        }), {
                            positive: t,
                            negative: n
                        };
                    }, r = a(e[0]), o = a(e[1]);
                    if (!t && !r.positive && !o.positive) return "";
                    const s = Xa(n.cloudAngle ?? n.angle, hr(2)), d = Xa(i.cloudAngle ?? i.angle, hr(2));
                    const attrs = `data-topic-a="${e[0]}" data-topic-b="${e[1]}" data-ax="${s.x.toFixed(2)}" data-ay="${s.y.toFixed(2)}" data-bx="${d.x.toFixed(2)}" data-by="${d.y.toFixed(2)}" d="${br(s, d)}"`;
                    return `<path class="common-overlap-link topic-overlap-link relation-visual" ${attrs}/><path class="common-overlap-link topic-overlap-link relation-hit" tabindex="0" role="button" aria-label="Show related topics" ${attrs}/>`;
                }).join("");
                return d ? `<g class="common-overlap-layer" aria-hidden="true">${d}</g>` : "";
            }(d.branches) + (c ? function() {
                return `<g data-empty-profile-map data-roxy-center>${oa()}${function() {
                    const img = document.querySelector("#sxCenterAvatarSource") || document.querySelector(".guide-avatar img"), src = img && img.getAttribute("src");
                    if (!src) return "";
                    const t = 2 * ea.photoRadius, rect = {
                        x: 900 - t / 2,
                        y: 620 - t / 2,
                        w: t,
                        h: t
                    };
                    return `<g clip-path="url(#centerPhotoClip)">${aa({
                        data: src,
                        width: img.naturalWidth || 512,
                        height: img.naturalHeight || 512
                    }, rect, "center-photo")}</g>`;
                }()}<circle class="center-hit" data-roxy-center-hit cx="900" cy="620" r="${ea.photoRadius + 3}" tabindex="0" role="button" aria-label="Yolanda &quot;Yo&quot; Biche, your map guide. Tap to open About Yolanda &quot;Yo&quot; Biche."/>${function(e) {
                    const t = ea.photoRadius, n = Za.fitWithin(e, 22 * mapFontScale(), 15, 288, "center"), i = Za.fitAttr(e, n, "center", 288);
                    return `<g class="center-circumference-text"><path id="center-bottom-arc" class="center-arc-path" d="M ${(900 - t).toFixed(0)} 620 A ${t} ${t} 0 0 0 ${(900 + t).toFixed(0)} 620"/><text class="center-arc-text center-name-arc-text" style="font-size:${n.toFixed(2)}px" dy="-1"${i}><textPath href="#center-bottom-arc" xlink:href="#center-bottom-arc" startOffset="50%" text-anchor="middle">${Hi(e)}</textPath></text></g>`;
                }('Yolanda "Yo" Biche')}</g>`;
            }() : `<g>${oa()}${function() {
                // Split center (split-center stage, 2026-10-27): when the
                // map's own profile is a saved pair/group tab, the center
                // shows WHO and WHAT KIND with zero math — the members'
                // own photos in a single row inside the disc, and the
                // pair's relation glyph sitting on each seam between
                // neighbours (N members → N−1 seams, one glyph per seam,
                // every seam carrying the pair's one recorded operation:
                // ⋈ for a cross pairing, ⊙ for a straight pairing).
                // Per-seam differing relations have no record to read —
                // a group stores exactly one pairOp — so mixed-relation
                // seams are not defined and none are invented here. The
                // multi-select overlay (Qi) keeps precedence and its
                // existing mosaic exactly as before; an individual tab
                // keeps its single full disc. This paints only where a
                // map is painted — the legacy 3+ match panel is a
                // separate section and never comes through here.
                const sxSplitGrp = !Qi() && Mt && ft[Mt] && "group" === ft[Mt].kind && Array.isArray(ft[Mt].sourceIds) ? ft[Mt] : null, sxSplitIds = sxSplitGrp ? sxSplitGrp.sourceIds.filter(e => vt[e]).slice(0, 8) : [];
                const sxCenterIds = sxSplitIds.length >= 2 ? sxSplitIds : function() {
                    const e = Xi();
                    return Qi() && e.length >= 2 ? e : Mt && vt[Mt] ? [ Mt ] : [];
                }(), e = sxCenterIds.slice(0, 8).map(e => (dt[e] || [])[0] || sxAnonAvatarPhoto(e));
                if (!e.length) return "";
                const t = 2 * ea.photoRadius, n = 900 - t / 2, i = 620 - t / 2, a = e.length, r = [];
                if (sxSplitIds.length >= 2) {
                    const sxSliceW = t / a;
                    for (let sxK = 0; sxK < a; sxK++) r.push({
                        x: n + sxK * sxSliceW,
                        y: i,
                        w: sxSliceW,
                        h: t
                    });
                } else if (1 === a) r.push({
                    x: n,
                    y: i,
                    w: t,
                    h: t
                }); else if (2 === a) for (let e = 0; e < 2; e++) r.push({
                    x: n + e * t / 2,
                    y: i,
                    w: t / 2,
                    h: t
                }); else if (3 === a) r.push({
                    x: n,
                    y: i,
                    w: t / 2,
                    h: t
                }), r.push({
                    x: n + t / 2,
                    y: i,
                    w: t / 2,
                    h: t / 2
                }), r.push({
                    x: n + t / 2,
                    y: i + t / 2,
                    w: t / 2,
                    h: t / 2
                }); else if (4 === a) for (let e = 0; e < 4; e++) r.push({
                    x: n + e % 2 * t / 2,
                    y: i + Math.floor(e / 2) * t / 2,
                    w: t / 2,
                    h: t / 2
                }); else {
                    const e = a <= 6 ? 3 : 4, o = t / e, s = t / 2;
                    for (let t = 0; t < a; t++) r.push({
                        x: n + t % e * o,
                        y: i + Math.floor(t / e) * s,
                        w: o,
                        h: s
                    });
                }
                const sxCenterPhotos = `<g clip-path="url(#centerPhotoClip)">${e.map((e, t) => aa(e, r[t], "center-photo")).join("")}</g>`;
                if (sxSplitIds.length < 2) return sxCenterPhotos;
                const sxSplitOp = "straight" === sxSplitGrp.pairOp ? "straight" : "bowtie", sxSplitGlyph = "straight" === sxSplitOp ? "⊙" : "⋈", sxSeamPlate = Math.max(120, ea.photoRadius * .17), sxSeamW = t / a, sxSeams = [];
                for (let sxK = 1; sxK < a; sxK++) {
                    const sxSeamX = n + sxK * sxSeamW;
                    sxSeams.push(`<g class="center-split-seam"><circle cx="${sxSeamX.toFixed(1)}" cy="620" r="${sxSeamPlate.toFixed(1)}"/><text x="${sxSeamX.toFixed(1)}" y="620" style="font-size:${(sxSeamPlate * 1.05).toFixed(0)}px" text-anchor="middle" dominant-baseline="middle">${sxSplitGlyph}</text></g>`);
                }
                return sxCenterPhotos + `<g class="center-split-seams" data-split-center="pair" data-pair-op="${sxSplitOp}" data-split-count="${a}" aria-hidden="true">${sxSeams.join("")}</g>`;
            }()}<circle class="center-hit" cx="900" cy="620" r="${ea.photoRadius + 3}" tabindex="0" role="button" aria-label="${Hi(g)}. ${Hi(y)}."/>${function(e) {
                const t = ea.photoRadius, n = Za.fitWithin(e, 22 * mapFontScale(), 15, 288, "center"), i = Za.fitAttr(e, n, "center", 288);
                return `<g class="center-circumference-text"><path id="center-bottom-arc" class="center-arc-path" d="M ${(900 - t).toFixed(0)} 620 A ${t} ${t} 0 0 0 ${(900 + t).toFixed(0)} 620"/><text class="center-arc-text center-name-arc-text" style="font-size:${n.toFixed(2)}px" dy="-1"${i}><textPath href="#center-bottom-arc" xlink:href="#center-bottom-arc" startOffset="50%" text-anchor="middle">${Hi(e)}</textPath></text></g>`;
            }(g)}${function() {
                if (!Mt || !vt[Mt]) return "";
                // FQ2-BAKEIN (A4, size driver): the toggle's SIZE scales with
                // mapFontScale() only (fsT below): base width 72 (240 in the
                // blank-profile state), height 44, corner radius 16 and text
                // 16px (17px blank) were all fixed constants that followed
                // neither knob. Its POSITION (ea.branchToggleY) follows the
                // center ring instead — see refreshCenterRing().
                const e = Vi(), t = "rated" === Sn, n = h.filter(n => t ? !hi(n, e) : !mi(n, e)).length, i = t && 0 === Object.keys(vt[e] || {}).length, a = t ? "unrated" : "rated", r = i ? 240 : 72, fsT = mapFontScale(), rW = r * fsT, rH = 44 * fsT, o = i ? `+${n} · show unrated branches` : `+${n}`, s = `${n} ${a} primary branches hidden. Switch the whole map to show ${a} branches.`;
                return `<g class="center-branch-toggle${i ? " is-blank-profile" : ""}" data-center-branch-toggle-wrap transform="translate(${900 - rW / 2} ${ea.branchToggleY})"><rect data-center-branch-toggle width="${rW}" height="${rH}" rx="${16 * fsT}" tabindex="0" role="button" aria-label="${s}" pointer-events="all"><title>Switch the whole map to show ${a} branches</title></rect><text x="${rW / 2}" y="${23 * fsT}" style="font-size:${(i ? 17 : 16) * fsT}px" text-anchor="middle" dominant-baseline="middle" pointer-events="none">${o}</text></g>`;
            }()}</g>`);
            const w = [], k = (e, t, n, i, a, r, o, s) => {
                const l = [];
                if (t && l.push({
                    kind: t,
                    glyph: "favorite" === t ? "★" : "notinterested" === t ? "⊘" : "×"
                }), n && l.push({
                    kind: "fantasy",
                    glyph: "☁"
                }), i && l.push({
                    kind: "tried",
                    glyph: "✓"
                }), a && l.push({
                    kind: "note",
                    glyph: "📝",
                    interactive: !0
                }), !l.length) return "";
                const c = Za.markerCandidates(e), d = l.length > 2 ? 34 : l.length > 1 ? 23 : 13;
                let u = Za.pickMarkerAnchor(w, r, o, s, c, d);
                u || (u = Za.markerAnchorAt(r, o, s, c[c.length - 1], d)), w.push(u);
                const p = -19 * (l.length - 1) / 2, h = l.map((t, n) => t.interactive ? `<text class="node-note-trigger node-marker node-marker-note" data-note-id="${e}" x="${p + 19 * n}" y="0" role="button" tabindex="0" aria-label="Open note for ${Hi(qn[e]?.label || "topic")}">${t.glyph}</text>` : "favorite" !== t.kind || isCatId(e) ? `<text class="node-marker node-marker-${t.kind}" x="${p + 19 * n}" y="0" aria-hidden="true">${t.glyph}</text>` : `<text class="node-marker node-marker-favorite" data-ui-tooltip="${Hi(lo(qn[e]))}" data-tooltip-tap-first x="${p + 19 * n}" y="0" aria-hidden="true">${t.glyph}</text>`).join("");
                return `<g class="node-marker-cluster" transform="translate(${u.x.toFixed(2)} ${u.y.toFixed(2)})">${h}</g>`;
            };
            // SX-PAIR-TAPER-PAINT (Phase 2, 2026-10-26): while a
            // two-profile match tab is the live viewport, topic lines
            // paint the PAIR's own taper intensities instead of the
            // active profile's wants. Cross (⋈) tab, per topic: give
            // flank = crossed give-fit (first give × second receive)
            // / 100; receive flank = crossed receive-fit (first
            // receive × second give) / 100. Straight (⊙) tab: give
            // flank = straight give-likeness (first give × second
            // give) / 100; receive flank = straight receive-likeness
            // (first receive × second receive) / 100. The values are
            // read straight off the pair record the engine already
            // computed (topicsById ratings; the straight products in
            // straight.byId) — no match math is recomputed here, and
            // the two flanks are never averaged or merged into one
            // number. "First" is the tab's first-named profile, so
            // swapping the pair exchanges the flanks and leaves the
            // fit itself unchanged. Colors come from zi(), the same
            // value-to-color mapping the profile tapers use, on the
            // same [-100, 100] scale. Any other view — a profile tab,
            // a cast of 3 or more, blind mode — resolves to null and
            // the paint below is exactly the profile paint.
            const sxPairTapers = function() {
                if (Rt) return null;
                const tab = sxCurrentTab();
                if (!tab) return null;
                const ctx = sxTabContext(tab), ids = ctx ? ctx.ids : tab.ids;
                if (!ids || 2 !== ids.length) return null;
                const pair = sxPairByIds(ids[0], ids[1]);
                if (!pair || !pair.topicsById) return null;
                const firstIsA = [ ids[0], ids[1] ].sort()[0] === ids[0], cross = "circledot" !== tab.kind;
                return id => {
                    const rec = pair.topicsById[id];
                    if (!rec) return null;
                    const mine = firstIsA ? rec.ratings.a : rec.ratings.b, yours = firstIsA ? rec.ratings.b : rec.ratings.a;
                    let give = null, receive = null;
                    if (cross) {
                        mine.giveKnown && yours.receiveKnown && (give = mine.give * yours.receive / 100),
                        mine.receiveKnown && yours.giveKnown && (receive = mine.receive * yours.give / 100);
                    } else {
                        const srec = pair.straight && pair.straight.byId[id];
                        srec && null != srec.giveGive && (give = srec.giveGive / 100),
                        srec && null != srec.recvRecv && (receive = srec.recvRecv / 100);
                    }
                    return {
                        give: null === give ? null : zi(give),
                        receive: null === receive ? null : zi(receive)
                    };
                };
            }();
            for (let t = 0; t < d.branches.length; t++) {
                const e = d.branches[t];
                yield;
                if (scSeg && scCtx.frozenBranches.has(e.entry.branch.name) && scSeg.has(e.entry.catId)) { scSkipped.add(e.entry.branch.name); continue; }
                window.__sxNodeTick && window.__sxNodeTick();
                const n = e.entry, i = n.branch, a = e.angle, r = n.selected;
                if ($n && !$n.has(n.catId) && !n.topics.some(e => $n.has(e.id))) continue;
                Math.cos(a);
                const o = Xa(a, ea.lineStartRadius), o2 = Xa(a, ea.spokeStartRadius), s = yr(i), l = Xa(a, s), c = Xa(a, s - (sxIconRadius(1) - 1.5)), dCat = n.catId, h = n.filter, g = za(0, o.x, o.y, l.x, l.y, 0), m = za(0, o2.x, o2.y, c.x, c.y, 0).d, y = g.labelD, b = Ra(dCat), w = [ "node-group" ], x = ln[Vi()];
                ("rated" === Sn ? !hi(i, Vi()) : "unrated" === Sn && !mi(i, Vi())) && !r && w.push("is-hidden"), 
                x && x.has(i.name) && !Eo(Vi(), dCat) && w.push("import-added");
                const S = i.topics.some(e => {
                    const t = Wn(e);
                    return Ra(t) === Pt || u.some(e => e.parentId === t && Ra(e.id) === Pt);
                });
                "all" === Pt || b === Pt || S || w.push("is-hidden"), !Tt || i.name.toLowerCase().includes(Tt) || i.topics.some(e => e.toLowerCase().includes(Tt)) || w.push("is-dim");
                const $ = null !== Dt && (dCat === Dt || e.topics.some(e => e.topic.id === Dt || e.children.some(e => e.child.id === Dt)));
                Dt && !$ && w.push("is-dim"), Dt && dCat === Dt && w.push("is-preview");
                const E = Math.max(140, .48 * (s - ea.lineStartRadius)) + (t % 2 ? 55 : -35), A = Za.categoryFontSize(i.name, g.labelWidth, E, r), C = Vi(), M = Rt ? null : Qe[C]?.[dCat], I = Rt ? null : null !== fa(i, C, "give") || null !== fa(i, C, "receive") ? 1 : null, P = Ne.get(i.name) || Fe(i), L = (O = I, 
                B = P, Rt ? "var(--green)" : "noCode" === B.key ? Ga.NO_CODE_COLOR : Te(B.lineColor || B.color) || Ga.FALLBACK_COLOR), T = Rt ? null : fa(i, C, "give"), F = Rt ? null : fa(i, C, "receive"), N = Rt ? "var(--green)" : null === T ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(T), _ = Rt ? "var(--green)" : null === F ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(F), D = Rt || null !== I ? "" : "noCode" === P.key ? "gen1-hanky-line gen1-no-hanky-line no-hanky-code-line" : "gen1-hanky-line" + (P.mixed ? " mixed-hanky-code-line" : ""), R = Rt || null !== I || "noCode" !== P.key && !P.mixed ? "none" : "noCode" === P.key ? "5 7" : "18 12";
                var O, B;
                const j = g.labelStartX + g.ux * E, q = g.labelStartY + g.uy * E, H = Math.atan2(l.y - o.y, l.x - o.x), W = Math.cos(H) < 0, U = W ? -g.ux : g.ux, G = j + 0 * (W ? -g.uy : g.uy), K = q - 0 * U, z = 180 * (H + (W ? Math.PI : 0)) / Math.PI, V = W ? ' text-anchor="end"' : "", Y = sxIconDiameter(1), X = Y / 2, Z = Y / 24, Q = ge[i.name], J = Xa(a, yr(i)), ee = Q ? `<g class="branch-icon${"noCode" === Q.hankyKey ? " no-hanky-code-icon" : ""}" data-diameter="${Y}" ${Sa(dCat, qn[dCat], C, { tapFirst: !0 })} aria-hidden="true" style="color:${Q.color}" transform="translate(${(J.x - X).toFixed(2)} ${(J.y - X).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${X}" cy="${X}" r="${X - .5}"/><circle class="icon-disc" cx="${X}" cy="${X}" r="${X - 2}"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="${X}" cy="${X}" r="${X - 3.5}"/><g transform="scale(${Z.toFixed(5)})">${Q.glyph}</g></g>` : "", te = k(dCat, M, !Rt && qa(dCat, Je), !Rt && qa(dCat, et), !Rt && Boolean(tt[C]?.[dCat]?.length), J, g.ux, g.uy), ne = j - 11 * g.ux, ie = q - 11 * g.uy, ae = i.risk ? `<text class="risk-mark" x="${ne.toFixed(2)}" y="${ie.toFixed(2)}" dy="-8" text-anchor="middle" transform="rotate(${z.toFixed(2)} ${ne.toFixed(2)} ${ie.toFixed(2)})" aria-hidden="true">*</text>` : "", re = r ? h.hidden : n.topics.length, oe = X + 20, se = yi(J.x - g.ux * oe, J.y - g.uy * oe, re, dCat, !0), le = r ? function(e, t, n, i, a, r) {
                    if (!n) return "";
                    const o = `+${n} more`, s = Math.max(58, 7 * o.length + 16), l = i + s / 2 * Math.abs(a) + 12 * Math.abs(r), c = t + r * l;
                    return `<g class="hidden-count-badge density-count-badge" data-width="${s}" transform="translate(${(e + a * l - s / 2).toFixed(2)} ${(c - 12).toFixed(2)})" role="note" aria-label="${n} more ${1 === n ? "topic" : "topics"} hidden by hypermap density"><rect width="${s}" height="24" rx="7"/><text x="${(s / 2).toFixed(2)}" y="12" text-anchor="middle" dominant-baseline="middle">${o}</text></g>`;
                }(l.x, l.y, n.densityHidden, X, g.ux, g.uy) : "";
                v += `<g class="${w.join(" ")} gen1-line-group" data-layout-key="${dCat}" data-layout-x="${J.x.toFixed(2)}" data-layout-y="${J.y.toFixed(2)}" data-icon-distance-override="${g.labelWidth.toFixed(2)}" data-rated="${null === I ? "false" : "true"}" style="--profile-color:${f};--family-color:${Q.color};--gen1-line-color:${L};--gen1-line-dash:${R}">${Ka(dCat, m, 18, i.name, g.nx, g.ny, o2.x, o2.y, c.x, c.y, !1, pr.categoryIcon, L, !1, D, null === I ? L : N, null === I ? L : _, "noCode" === P.key ? Ga.FALLBACK_COLOR : P.lineColor || P.color || Ga.FALLBACK_COLOR, "noCode" === P.key, null !== I, p, SpokeGeometry.buildBaseCircle(pr.centerX, pr.centerY, gen1SpokeBaseRadius()), sxIconDiameter(1), 1)}${ee}${te}${ae}${se}${le}<path id="p-${dCat}" d="${y}" fill="none" stroke="transparent"/><line class="node-label-underline" style="stroke:${f}" data-offset="0" x1="${j.toFixed(2)}" y1="${q.toFixed(2)}" x2="${(j + g.ux * Za.categoryUnderlineLength(i.name, A)).toFixed(2)}" y2="${(q + g.uy * Za.categoryUnderlineLength(i.name, A)).toFixed(2)}"/><text class="category-label" data-id="${dCat}" data-path-id="p-${dCat}" data-label-offset="${E}" ${Sa(dCat, qn[dCat], C)} tabindex="0" role="button" aria-expanded="${r}" aria-label="${Hi(i.name)}${i.risk ? ", higher-risk practice requiring specialized knowledge and explicit negotiation" : ""}${x && x.has(i.name) ? ", contains newly imported additions" : ""}. ${r ? `${h.mode} children shown; press Enter to collapse` : `Children hidden; press Enter to expand with ${h.mode} children`}; press Shift Enter for description and markers." style="font-size:${(sxFontSize(1) * A / 23).toFixed(2)}px" x="${G.toFixed(2)}" y="${K.toFixed(2)}" dominant-baseline="middle"${V} transform="rotate(${z.toFixed(2)} ${G.toFixed(2)} ${K.toFixed(2)})">${Hi(i.name)}</text></g>`, 
                e.topics.forEach(t => {
                    window.__sxNodeTick && window.__sxNodeTick();
                    const n = t.topic, a = n.label, r = n.id, o = Boolean(n.isSubcategory);
                    if ($n && !$n.has(r)) return;
                    t.angle;
                    const s = t.cloudAngle, c = t.cloudRadius || e.topicCloudRadius, u = Za.topicSpokeEstimate(a, c), p = u.fontSize;
                    let h = u.spokeLength;
                    if (o) {
                        const e = pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96;
                        h = Math.max(h, e, sxSpokeBase(t.cloudCount)), h = Za.hubSpokeLength(a, p, h, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                    }
                    // Per-subcategory length override (Build
                    // 2026-10-20_0023): the multiplier is applied to the
                    // drawn length here, where the spoke endpoint is
                    // finalized; subcatOverrides is keyed by topic label.
                    // The shipped defaults carry the tuned lengths, so
                    // the stock layout draws the same lengths the
                    // collision estimate already assumed.
                    if (o) h = applyLengthOverride(h, a, mn.subcatOverrides);
                    // Per-kink length override (Build 2026-10-19_0255):
                    // applied here, where the spoke endpoint is
                    // finalized; kinkOverrides is keyed by topic id and
                    // defaults to {} so the stock layout is unchanged.
                    if (!o) h = applyLengthOverride(h, r, mn.kinkOverrides);
                    const g = l.x + Math.cos(s) * h, m = l.y + Math.sin(s) * h, y = Ya(l.x, l.y, g, m), b = Math.max(12, Math.min(17, (S = a, 
                    $ = y.labelWidth, Za.fittedSize(S, $, void 0)))), w = y.labelD, x = o ? "all" : Ra(r);
                    var S, $;
                    const E = [ "node-group" ];
                    o && E.push("subcategory-node");
                    const A = cn[Vi()], C = dn[Vi()];
                    o || Rt || !Qi() && !Kd() || !qa(r, Je) || E.push("is-fantasy-only"), o || Rt || !Qi() && !Kd() || !qa(r, et) || E.push("is-already-tried"), 
                    !o && A && A.has(r) && !Eo(Vi(), r) && E.push("import-updated"), !o && C && C.has(r) && !Eo(Vi(), r) && E.push("import-newest");
                    const M = n.allImported.some(e => Ra(e.id) === Pt);
                    "all" === Pt || o || x === Pt || M || E.push("is-hidden"), !Tt || a.toLowerCase().includes(Tt) || i.name.toLowerCase().includes(Tt) || n.allImported.some(e => e.label.toLowerCase().includes(Tt)) || E.push("is-dim");
                    o && n.unratedHub && E.push("is-unrated"); /* DIMFIX F2 (was HUB-BACKBONE W4): the dim reads the F1 rating-presence flag, not the Net-filtered allImported list; the dedicated class (never is-dim) keeps selection/focus precedence clean */
                    const I = null !== Dt && (r === Dt || dCat === Dt || t.children.some(e => e.child.id === Dt));
                    Dt && !I && E.push("is-dim"), Dt && r === Dt && E.push("is-preview");
                    const P = Za.topicLabelOffset(y.routedLength, y.labelOffset, t.cloudIndex), L = Math.cos(s) < 0, T = L ? `pr-${r}` : `p-${r}`, F = L ? y.routedLength - P : P, N = L ? ' text-anchor="end"' : "", _ = L ? `<path id="pr-${r}" class="concept-path" d="${y.reverseD}" fill="none" stroke="transparent"/>` : "", D = Vi(), R = Rt ? null : o ? function(e, t) {
                        return pa((e?.topics || []).map(Wn), t, e => ua(e, t));
                    }(n.group, D) : ua(r, D), O = o || Rt ? null : Qe[D]?.[r], B = o ? Ae(a, i.name) : Oe(a, i.name), j = o || Rt ? null : ca(r, D), q = o && !Rt ? ya(n.group, D, "give", r) : null, H = o && !Rt ? ya(n.group, D, "receive", r) : null, W = j && j.giveKnown ? j.give : q, U = j && j.receiveKnown ? j.receive : H, G = o ? Q.color : Rt ? "var(--green)" : null === R ? Te(B.lineColor) : zi(R), K = Rt ? "var(--green)" : null === W ? Te(B.lineColor) : zi(W), z = Rt ? "var(--green)" : null === U ? Te(B.lineColor) : zi(U), V = y.icon.x, Y = y.icon.y, X = n.allImported, Z = n.topicFilter, J = on.has(r), ee = o ? Sa(r, qn[r], D, { tapFirst: !0 }) : ka(a, $e(qn[r], B, R, {
                        key: B.hankyKey
                    }, O), xa(r, D), { tapFirst: !0 }), te = sxIconDiameter(2), ne = te / 2, ie = te / 6, ae = te / 24, re = `<g class="topic-icon${o ? " subcategory-icon" : "noCode" === B.hankyKey ? " no-hanky-code-icon" : ""}${B.glyphFallback ? " glyph-fallback" : ""}"${B.glyphFallback ? ' data-glyph-fallback="star"' : ""} data-diameter="${te}" ${ee} aria-hidden="true" style="color:${B.color}" transform="translate(${(V - ne).toFixed(2)} ${(Y - ne).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${ne}" cy="${ne}" r="${ne - .5}"/><circle class="icon-disc" cx="${ne}" cy="${ne}" r="${ne - 2}"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="${ne}" cy="${ne}" r="${ne - 3.5}"/><g transform="translate(${ie.toFixed(3)} ${ie.toFixed(3)}) scale(${ae.toFixed(5)})">${B.glyph}${B.accent}</g></g>`, oe = o ? "" : k(r, O, !Rt && qa(r, Je), !Rt && qa(r, et), !Rt && Boolean(tt[D]?.[r]?.length), y.icon, y.ux, y.uy), se = J ? Z.hidden : X.length || (o ? n.group.topics.length : 0), /* HUB-BACKBONE badge: a wholly-unrated collapsed hub wears +N with N = its TOTAL topic count (owner ruling 2026-10-23); expanded and partially-rated hubs keep today's counts; plain topics unchanged */ le = yi(y.icon.x + y.ux * (ne + 20), y.icon.y + y.uy * (ne + 20), se, r), ce = X.length ? ` aria-expanded="${J}"` : "", de = X.length ? `${J ? "Topics shown" : "Topics hidden"}; press Enter to ${J ? "collapse" : "expand"}. ` : "", sxFl = sxPairTapers ? sxPairTapers(r) : null, peTr = Ga.trimToIcons(l.x, l.y, V, Y, sxIconRadius(1), sxIconRadius(2)), peT = `M ${peTr.sx0.toFixed(2)} ${peTr.sy0.toFixed(2)} L ${peTr.sx1.toFixed(2)} ${peTr.sy1.toFixed(2)}`, ue = o ? renderKinkLine(l.x, l.y, V, Y, B.hankyKey, Rt ? "var(--green)" : Te(B.lineColor), sxFl ? sxFl.give : Rt || null !== q ? K : null, sxFl ? sxFl.receive : Rt || null !== H ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, pr.subcategoryIcon, sxIconDiameter(1), sxIconDiameter(2), 2) : renderKinkLine(l.x, l.y, V, Y, B.hankyKey, B.lineColor, sxFl ? sxFl.give : Rt || j && j.giveKnown ? K : null, sxFl ? sxFl.receive : Rt || j && j.receiveKnown ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, 48, sxIconDiameter(1), sxIconDiameter(2), 2), pe = o ? "" : `<g class="second-gen-rating-controls-only">${Ka(r, peT, 18, a, y.nx, y.ny, l.x, l.y, V, Y, !0, pr.topicIcon, G, !0, "", null, null, null, !1, !0, h.length, null, sxIconDiameter(2), 2)}</g>`, he = o ? "map-label concept-path-label subcategory-label" : "map-label concept-path-label hanky-topic-label", ge = o ? `${Hi(a)} subcategory. ${de}` : `${Hi(a)}. ${de}Press Shift Enter for description and markers.`;
                    v += `<g class="${E.join(" ")}" data-layout-key="${r}" data-layout-x="${V.toFixed(2)}" data-layout-y="${Y.toFixed(2)}" data-has-visible-children="${t.children.length ? "true" : "false"}" data-hanky-color="${B.hankyKey}" data-rated="${null === R ? "false" : "true"}" style="--profile-color:${f};--family-color:${o ? Q.color : B.color};--hanky-color:${B.labelColor};--hanky-label-stroke:${B.labelStroke}">${ue}${pe}${re}${oe}${le}<path id="p-${r}" class="concept-path" d="${w}" fill="none" stroke="transparent"/>${_}<text class="${he}" data-topic-id="${r}" data-id="${r}" data-path-id="p-${r}" data-label-offset="${P}" ${Sa(r, qn[r], D)} tabindex="0" role="button"${ce} aria-label="${ge}" style="font-size:${(sxFontSize(2) * b / 17).toFixed(2)}px" dominant-baseline="middle"><textPath href="#${T}" xlink:href="#${T}" startOffset="${F}"${N}>&#160;${Hi(a)}</textPath></text></g>`, 
                    t.children.forEach(e => {
                        window.__sxNodeTick && window.__sxNodeTick();
                        // Per-kink length override for subcategory
                        // children (Build 2026-10-19_0255, same fix as
                        // the gen-2 draw above): the child's drawn
                        // radius scales by this multiplier.
                        var _childKinkMul = applyLengthOverride(1, e.child && e.child.id, mn.kinkOverrides);
                        const n = e.child, o = Boolean(n.isStaticTopic), s = o ? e.cloudAngle : e.angle, l = o ? (function() {
                            let r = (e.cloudRadius || t.childCloudRadius || 270) * _childKinkMul;
                            // LABEL CLEARANCE AT PAINT (repair,
                            // 2026-11-01): a static child's label is
                            // measured at the standard unit U (22 x fontScale) from
                            // cloudLabel's offset along this spoke,
                            // with no fitted-size shrink, so a child
                            // spoke shorter than hub clearance +
                            // label + icon seats the label under
                            // the hub icon or under the child's own
                            // icon (the impinging labels of the
                            // 2026-11-01 inspection). When the
                            // spoke is too short for its label,
                            // extend THIS child's drawn radius to
                            // the clearance length; longer spokes
                            // are untouched and no other node's
                            // geometry moves.
                            r = sxLabelClearance(r, n.label);
                            return {
                                x: V + Math.cos(s) * r,
                                y: Y + Math.sin(s) * r
                            };
                        })() : Xa(s, hr(3) + 1700), c = function(e, t, n = 0) {
                            return Za.adaptivePlacement(e, t, n);
                        }(e, 3, Math.hypot(V - pr.centerX, Y - pr.centerY)), u = !o && Number.isFinite(Number(bt[n.id])) ? Number(bt[n.id]) : 0, p = o ? Ya(V, Y, l.x, l.y, pr.subcategoryIcon / 2) : function(e, t, n, i, a, r, o, s = 35, l = !1, c = null, d = null, u = 0, p = .32) {
                            const h = Xa(r, Math.hypot(n - pr.centerX, i - pr.centerY)), g = Math.max(1, Math.hypot(h.x - e, h.y - t)), m = (h.x - e) / g, f = (h.y - t) / g, y = -f, b = m, v = `M ${e.toFixed(2)} ${t.toFixed(2)} L ${h.x.toFixed(2)} ${h.y.toFixed(2)}`, w = `M ${h.x.toFixed(2)} ${h.y.toFixed(2)} L ${e.toFixed(2)} ${t.toFixed(2)}`, k = g, x = Va(e, t, m, f, k), S = Number.isFinite(c) ? c : Math.max(38, s + 12), $ = Math.min(.42 * k, S), E = Za.curveLabel(k, d, p), A = x($), C = E.labelOffset, M = x(.28 * k), I = x(.72 * k);
                            return {
                                d: v,
                                labelD: v,
                                reverseD: w,
                                routedLength: k,
                                labelWidth: E.labelWidth,
                                labelOffset: C,
                                icon: A,
                                ux: m,
                                uy: f,
                                nx: y,
                                ny: b,
                                c1: M,
                                c2: I,
                                bend: 0,
                                pointAtDistance: x
                            };
                        }(V, Y, l.x, l.y, 0, s, hr(3), pr.importedIcon / 2 + 10, e.curve, 270, c.offset, u, c.limit), h = Math.cos(s) < 0, g = h ? `pr-${n.id}` : `p-${n.id}`, m = h ? p.routedLength - p.labelOffset : p.labelOffset, y = h ? ' text-anchor="end"' : "", b = h ? `<path id="pr-${n.id}" class="concept-path" d="${p.reverseD}" fill="none" stroke="transparent"/>` : "", w = Rt ? null : ua(n.id, D), x = Rt ? null : Qe[D]?.[n.id], S = Rt ? null : ca(n.id, D), $ = Le(n.label, i.name), E = S && S.giveKnown ? S.give : null, A = S && S.receiveKnown ? S.receive : null, M = Rt ? "var(--green)" : null === E ? Te($.lineColor) : zi(E), I = Rt ? "var(--green)" : null === A ? Te($.lineColor) : zi(A), P = Rt ? "var(--green)" : null === w ? Te($.lineColor) : zi(w), L = Oe(n.label, i.name), T = sxIconDiameter(3), F = T / 2, N = p.icon.x, _ = p.icon.y, R = Boolean(Tt && (n.label.toLowerCase().includes(Tt) || a.toLowerCase().includes(Tt) || i.name.toLowerCase().includes(Tt))), O = [ "node-group", o ? "subcategory-topic" : "imported-child" ];
                        !Rt && (Qi() || Kd()) && qa(n.id, Je) && O.push("is-fantasy-only"), !Rt && (Qi() || Kd()) && qa(n.id, et) && O.push("is-already-tried"), 
                        C && C.has(n.id) && !Eo(Vi(), n.id) && O.push("import-newest"), "all" !== Pt && Ra(n.id) !== Pt && O.push("is-hidden"), 
                        Tt && !R && O.push("is-dim");
                        const B = null !== Dt && (n.id === Dt || r === Dt || dCat === Dt);
                        Dt && !B && O.push("is-dim"), Dt && n.id === Dt && O.push("is-preview");
                        const j = !o && Boolean(si(n.id)) ? ` Tap to adopt it into ${wt[Vi()] || "the active profile"} unrated, then use the normal give and receive controls.` : "", q = `<g class="topic-icon${"noCode" === $.key ? " no-hanky-code-icon" : ""}${L.glyphFallback ? " glyph-fallback" : ""}"${L.glyphFallback ? ' data-glyph-fallback="star"' : ""} data-diameter="${T}" ${ka(n.label, $e(n, L, w, $, x), xa(n.id, D), { tapFirst: !0 })} aria-hidden="true" style="color:${L.color}" transform="translate(${(N - F).toFixed(2)} ${(_ - F).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${F}" cy="${F}" r="${F - .5}"/><circle class="icon-disc" cx="${F}" cy="${F}" r="${F - 2}"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="${F}" cy="${F}" r="${F - 3.5}"/><g transform="translate(${(T / 6).toFixed(2)} ${(T / 6).toFixed(2)}) scale(${(T / 24).toFixed(5)})">${L.glyph}${L.accent}</g></g>`, H = k(n.id, x, !Rt && qa(n.id, Je), !Rt && qa(n.id, et), !Rt && Boolean(tt[D]?.[n.id]?.length), p.icon, p.ux, p.uy), sxFl = sxPairTapers ? sxPairTapers(n.id) : null, pTr = Ga.trimToIcons(V, Y, o ? N : l.x, o ? _ : l.y, sxIconRadius(2), sxIconRadius(3)), pT = `M ${pTr.sx0.toFixed(2)} ${pTr.sy0.toFixed(2)} L ${pTr.sx1.toFixed(2)} ${pTr.sy1.toFixed(2)}`, W = o ? renderKinkLine(V, Y, N, _, $.key, $.lineColor, sxFl ? sxFl.give : Rt || S && S.giveKnown ? M : null, sxFl ? sxFl.receive : Rt || S && S.receiveKnown ? I : null, sxFl ? !0 : null !== w, e.cloudCount, n.id, n.label, D, pr.subcategoryIcon, 48, sxIconDiameter(2), sxIconDiameter(3), 3) : "", U = o ? `<g class="second-gen-rating-controls-only">${Ka(n.id, pT, 18, n.label, p.nx, p.ny, V, Y, N, _, !0, pr.topicIcon, P, !0, "", null, null, null, !1, !0, h.length, null, sxIconDiameter(3), 3)}</g>` : Ka(n.id, pT, 6, n.label, p.nx, p.ny, V, Y, l.x, l.y, !0, pr.importedIcon, P, !0, null === w && "noCode" === $.key ? "no-hanky-code-line" : "", null, null, $.lineColor, "noCode" === $.key, null !== w, h.length, SpokeGeometry.buildBaseCircle(V, Y, sxIconRadius(2)), sxIconDiameter(3), 3), G = o ? `${Hi(n.label)} in ${Hi(a)}. Press Shift Enter for description and markers.` : `${Hi(n.label)}, imported under ${Hi(a)}.${Hi(j)} Press Shift Enter for description and markers.`;
                        v += `<g class="${O.join(" ")}" data-layout-key="${n.id}" data-layout-x="${N.toFixed(2)}" data-layout-y="${_.toFixed(2)}" data-rated="${null === w ? "false" : "true"}" style="--profile-color:${f};--family-color:${Q.color}">${W}${U}${q}${H}<path id="p-${n.id}" class="concept-path" d="${p.labelD}" fill="none" stroke="transparent"/>${b}<text class="map-label concept-path-label${o ? " hanky-topic-label" : ""}" data-topic-id="${n.id}" data-id="${n.id}" data-path-id="p-${n.id}" data-label-offset="${p.labelOffset}" ${Sa(n.id, n, D)} tabindex="0" role="button" aria-label="${G}" style="font-size:${sxFontSize(3).toFixed(2)}px" dominant-baseline="middle"><textPath href="#${g}" xlink:href="#${g}" startOffset="${m}"${y}>${Hi(n.label)}</textPath></text></g>`;
                    });
                });
            }
            n(In, v);
            window.__sxLoad && window.__sxLoad(90 /* F5 checkpoint contract (at __sxProgressWidget in index.html): displayed band value — markup injected */);
            (function() {
                const e = In.querySelector(".common-overlap-layer");
                if (!e) return;
                const t = document.createElementNS("http://www.w3.org/2000/svg", "g");
                t.setAttribute("class", "common-overlap-layer branch-relation-layer"), t.setAttribute("aria-hidden", "true"), 
                e.querySelectorAll(":scope > .common-overlap-link").forEach(e => t.appendChild(e)), 
                t.childNodes.length ? (In.appendChild(t), e.childNodes.length || e.remove()) : e.childNodes.length || e.remove();
            })();
            (function() {
                // Segment paint (P1) splice: re-insert each retained
                // frozen segment whose branch the string build just
                // skipped. The segment's extracted pieces are moved
                // back into the captured group as direct children
                // (stems, then controls, then label, then badge;
                // pieces already inside the group stay where they
                // are), then a deep clone of the assembled group is
                // spliced into the layer at its capture-order
                // position. The clone is what gets spliced — never
                // the long-lived captured original — so the wiring
                // passes below attach exactly one set of listeners,
                // exactly as for a fresh-built group. From here on
                // the spliced group is indistinguishable from a fresh
                // one for the settle pass, extraction and overlay.
                // Blit session (P3): while a session is live and
                // this paint continues it (same frozen set), the
                // frozen segments are NOT spliced into the visible
                // flow at all — the raster image stands in for them
                // and the end-of-paint step (blitPaintEnd) vaults the
                // captured segments instead. Boundary events logged
                // by this paint's solve do not break the session:
                // under a contained scope they are suppressed
                // coupling candidates that do not change frozen
                // geometry.
                if (blitSess && blitSess.swapped && scCtx && blitSameFrozen(scCtx.frozenBranches, blitSess.frozen)) return;
                if (!scSeg || !scSeg.size) return;
                const scTSp0 = performance.now();
                try {
                    const present = new Map;
                    In.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)").forEach(el => {
                        el.parentNode === In && present.set(el.dataset.layoutKey, el);
                    });
                    // Ordered-walk insertion (P1 perf): the splice
                    // candidates are resolved up front, under the same
                    // skip conditions the per-clone loop applied, then
                    // sorted by their scSegOrder position (stable; a
                    // key missing from scSegOrder sorts as -1, exactly
                    // where the old indexOf scan started) and each
                    // clone's anchor is found by one cursor walk over
                    // the initially-present keys in scSegOrder order,
                    // instead of a per-clone indexOf + forward rescan.
                    // Insertions only ever add candidates at their own
                    // positions, so the first initially-present key
                    // after a candidate's position is exactly the
                    // anchor the rescan found.
                    const scOrderIx = new Map;
                    scSegOrder && scSegOrder.forEach((k, ix) => { scOrderIx.has(k) || scOrderIx.set(k, ix); });
                    const scCands = [];
                    scSeg.forEach((seg, key) => {
                        if (!seg.branch || !scSkipped.has(seg.branch) || present.has(key)) return;
                        const el = scKeep.get(key);
                        el && scCands.push({ seg: seg, key: key, el: el, ix: scOrderIx.has(key) ? scOrderIx.get(key) : -1 });
                    }), scCands.sort((a, b) => a.ix - b.ix);
                    const scPresentSeq = [], scPresentIx = [];
                    scSegOrder && scSegOrder.forEach(k => { present.has(k) && (scPresentSeq.push(k), scPresentIx.push(scOrderIx.get(k))); });
                    let scCur = 0;
                    scCands.forEach(cand => {
                        const seg = cand.seg, key = cand.key, el = cand.el;
                        const scTA0 = performance.now();
                        seg.stems.forEach(p => {
                            p && p.parentNode !== el && el.appendChild(p);
                        }), seg.controls.forEach(p => {
                            p && p.parentNode !== el && el.appendChild(p);
                        }), seg.label && seg.label.parentNode !== el && el.appendChild(seg.label), seg.badge && seg.badge.parentNode !== el && el.appendChild(seg.badge);
                        let incomplete = !1;
                        (seg.labelStack && (!seg.label || seg.label.parentNode !== el)) && (incomplete = !0), (seg.badgeStack && (!seg.badge || seg.badge.parentNode !== el)) && (incomplete = !0), 
                        (seg.controlsStack && seg.controls.some(p => !p || p.parentNode !== el)) && (incomplete = !0), (seg.stemsStack && seg.stems.some(p => !p || p.parentNode !== el)) && (incomplete = !0), 
                        incomplete && scSegDiverged++;
                        const clone = el.cloneNode(!0);
                        scTAsm += performance.now() - scTA0;
                        const scTI0 = performance.now();
                        while (scCur < scPresentSeq.length && scPresentIx[scCur] <= cand.ix) scCur++;
                        const anchor = scCur < scPresentSeq.length ? present.get(scPresentSeq[scCur]) : null;
                        anchor ? In.insertBefore(clone, anchor) : In.appendChild(clone), present.set(key, clone), scSegDone.add(key), scTIns += performance.now() - scTI0;
                    });
                } catch (_) { __sxErrLog("layout-scoped-paint-splice", _); }
                scTSplice = performance.now() - scTSp0;
            })();
            sxWireMapListeners();
            if (vn) {
                const e = In.querySelector(`.hidden-count-badge[data-id="${CSS.escape(vn)}"]`), t = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                e && Bt && !t && "function" == typeof e.animate && e.animate([ {
                    opacity: .55,
                    filter: "brightness(1)"
                }, {
                    opacity: 1,
                    filter: "brightness(1.35)"
                }, {
                    opacity: 1,
                    filter: "brightness(1)"
                } ], {
                    duration: 300,
                    easing: "cubic-bezier(.2,.8,.2,1)"
                }), vn = null;
            }
            yield;
            // (Helpers hoisted to render-function scope so the
            // end-of-paint restore/blit steps below can re-run
            // finalisation after retained stems are spliced back.)
                    // Stem re-anchoring (Build 2026-10-31_0715): two-pass settle,
                    // fixing displaced stems at the source. Pass 1 is the
                    // per-group loop below: it seats every icon and writes
                    // each group's settled centre into data-layout-x/y.
                    // Pass 2 (sxFinaliseStems, called once after that loop)
                    // re-emits every tapered stem from the SETTLED centres
                    // of its parent and child groups, re-calling the same
                    // emitter (SpokeGeometry.flankPaths / taperedPath) with
                    // the settled endpoints. A stem's base arc ends up
                    // centred exactly on the painted parent disc and its
                    // tip arc exactly on the painted child icon, whatever
                    // either disc did during settle. No delta is computed
                    // or applied, no existing d is shifted, no clamp, no
                    // skip for frozen nodes (a frozen node's settled
                    // centre is its snapped delivered centre, read from
                    // its dataset like any other), and no stem is left
                    // carrying a transform. The stem's radii, widths and
                    // mode are recovered from its own current path data —
                    // the emitter's own output — and its colours, opacity
                    // and tooltip attributes are untouched: only d is
                    // replaced. Finalisation is NOT gated by the label
                    // guard above: it runs over every .tapered-stem in the
                    // layer, whether the stem lives in a node group, in a
                    // .spoke-underlay-item (addressed by data-spoke-for),
                    // or was restored from a blit vault / scoped segment.
                    const sxParseStemD = d => {
                        const tokens = String(d || "").match(/[MLAZ]|-?\d*\.?\d+(?:e[+-]?\d+)?/g) || [], pts = [], arcs = [];
                        let cmd = "", nums = [];
                        const flush = () => {
                            if ("M" === cmd || "L" === cmd) for (let i = 0; i + 1 < nums.length; i += 2) pts.push({
                                x: nums[i],
                                y: nums[i + 1],
                                arc: !1
                            }); else if ("A" === cmd) for (let i = 0; i + 6 < nums.length; i += 7) {
                                const to = {
                                    x: nums[i + 5],
                                    y: nums[i + 6],
                                    arc: !0
                                };
                                arcs.push({
                                    r: nums[i],
                                    sweep: nums[i + 4],
                                    from: pts.length ? pts[pts.length - 1] : null,
                                    to: to,
                                    at: pts.length
                                }), pts.push(to);
                            }
                            nums = [];
                        };
                        for (const tok of tokens) /^[MLAZ]$/.test(tok) ? (flush(), cmd = tok) : nums.push(Number.parseFloat(tok));
                        return flush(), {
                            pts: pts,
                            arcs: arcs
                        };
                    };
                    // The spoke-facing centre of an arc: of the two circle
                    // centres consistent with the chord and radius, the
                    // sweep flag selects the one the minor arc travels
                    // around in the sweep direction.
                    const sxArcCentre = a => {
                        if (!a || !a.from || !(a.r > 0)) return null;
                        const x1 = a.from.x, y1 = a.from.y, x2 = a.to.x, y2 = a.to.y, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, dd = Math.sqrt(Math.max(0, a.r * a.r - len * len / 4)), px = -dy / len, py = dx / len;
                        for (const sgn of [ 1, -1 ]) {
                            const c = {
                                x: mx + sgn * dd * px,
                                y: my + sgn * dd * py
                            };
                            let delta = (1 === a.sweep ? Math.atan2(y2 - c.y, x2 - c.x) - Math.atan2(y1 - c.y, x1 - c.x) : Math.atan2(y1 - c.y, x1 - c.x) - Math.atan2(y2 - c.y, x2 - c.x)) % (2 * Math.PI);
                            if (delta < 0 && (delta += 2 * Math.PI), delta < Math.PI) return c;
                        }
                        return {
                            x: mx + dd * px,
                            y: my + dd * py
                        };
                    };
                    const sxStemChildKey = stem => {
                        const host = stem.closest(".spoke-underlay-item"), grp = stem.closest(".node-group");
                        return host && host.dataset.spokeFor || grp && grp.dataset.layoutKey || null;
                    };
                    const sxReanchorStem = (stem, centres, spokeOld) => {
                        const childKey = sxStemChildKey(stem);
                        if (!childKey) return;
                        const child = centres.get(childKey);
                        if (!child) return;
                        const rec = qn[childKey];
                        let parent = null;
                        const parentKey = rec && (rec.parentId || (rec.branch ? catId(rec.branch) : null));
                        if (parentKey && (parent = centres.get(parentKey) || null), !parent && isCatId(childKey)) parent = {
                            x: pr.centerX,
                            y: pr.centerY
                        };
                        if (!parent) return;
                        const d0 = stem.getAttribute("d");
                        if (!d0) return;
                        const {pts, arcs} = sxParseStemD(d0);
                        if (!pts.length || !arcs.length) return;
                        // Both emitters write the tip arc first and the
                        // base arc last; a tapered band's round cap (when
                        // present) also comes first and is centred on the
                        // segment's tip point, not on the icon.
                        const firstArc = arcs[0], lastArc = arcs[arcs.length - 1], isFlank = firstArc.at >= 6;
                        let tipArc, baseArc;
                        if (1 === arcs.length) isFlank ? (tipArc = firstArc, baseArc = null) : firstArc.at >= 4 ? (tipArc = null, baseArc = firstArc) : (tipArc = firstArc, baseArc = null); else tipArc = isFlank || 24 !== firstArc.r ? firstArc : null, baseArc = lastArc;
                        const old = spokeOld.get(childKey);
                        let Bold = baseArc ? sxArcCentre(baseArc) : old && old.base, Told = tipArc ? sxArcCentre(tipArc) : old && old.tip;
                        if (!Bold && old) Bold = old.base;
                        if (!Told && old) Told = old.tip;
                        if (!Bold || !Told) return;
                        const axisLenOld = Math.hypot(Told.x - Bold.x, Told.y - Bold.y);
                        if (!(axisLenOld > 1)) return;
                        const ux = (Told.x - Bold.x) / axisLenOld, uy = (Told.y - Bold.y) / axisLenOld, nx = -uy, ny = ux, unLen = Math.hypot(child.x - parent.x, child.y - parent.y);
                        if (!(unLen > 1)) return;
                        const unx = (child.x - parent.x) / unLen, uny = (child.y - parent.y) / unLen, nnx = -uny * Math.sign(nx * -uny + ny * unx || 1), nny = unx * Math.sign(nx * -uny + ny * unx || 1);
                        const along = p => (p.x - Bold.x) * ux + (p.y - Bold.y) * uy, off = p => (p.x - Bold.x) * nx + (p.y - Bold.y) * ny;
                        if (isFlank) {
                            // One flank: every vertex on one side of the
                            // centreline; the inner edge sits at the fixed
                            // inner half-width (the modal |offset|), the
                            // outer edge follows the flare curve.
                            const linePts = pts.filter(p => !p.arc);
                            if (linePts.length < 13) return;
                            // The inner edge is the densest cluster of
                            // |offset| values: its points sit at the fixed
                            // inner half-width, jittered by path rounding
                            // and centre recovery, so cluster by a sliding
                            // 0.3-wide window rather than exact buckets
                            // (a bucketed count splits the cluster across
                            // neighbouring buckets and under-counts it).
                            const absOffs = linePts.map(p => Math.abs(off(p))).sort((a2, b2) => a2 - b2);
                            let ihI = 0, ihN = 0;
                            for (let i2 = 0; i2 < absOffs.length; i2++) {
                                let n2 = 0;
                                while (i2 + n2 < absOffs.length && absOffs[i2 + n2] - absOffs[i2] <= .3) n2++;
                                n2 > ihN && (ihN = n2, ihI = i2);
                            }
                            if (ihN < 6) return;
                            const ih = absOffs[ihI + (ihN >> 1)], inner = linePts.filter(p => Math.abs(Math.abs(off(p)) - ih) < .75);
                            if (!inner.length) return;
                            const side = Math.sign(inner.reduce((s2, p) => s2 + off(p), 0)) || 1, mode = linePts.slice(0, 4).every(p => Math.abs(Math.abs(off(p)) - ih) < .75) ? "innerFirst" : "outerFirst", A = baseArc ? baseArc.r : Math.min(...inner.map(along)), C = tipArc.r, sAlong = A, eAlong = axisLenOld - C + ("innerFirst" === mode ? 1.5 : 0), span = eAlong - sAlong;
                            // A short spoke (length < A + C) trims to a
                            // backwards segment (span < 0): the emitter
                            // produced it at render time, so re-emit it
                            // the same way — the flare fit only needs
                            // |span| > 1, and a near-zero span falls back
                            // to the max-offset widths below. Never skip. 
                            // Least-squares flare fit: |offset| - ih =
                            // flare(f)/2, flare(f) = tipW + (baseW -
                            // tipW) * exp(-f), linear in (baseW, tipW).
                            let sEE = 0, sET = 0, sTT = 0, sEf = 0, sTf = 0, nFit = 0;
                            Math.abs(span) > 1 && linePts.forEach(p => {
                                const f = (along(p) - sAlong) / span;
                                if (f <= .02 || f >= .98) return;
                                const ao = Math.abs(off(p));
                                if (ao < ih + 1.5) return;
                                const E = Math.exp(-f), T = 1 - E, fl = 2 * (ao - ih);
                                sEE += E * E, sET += E * T, sTT += T * T, sEf += E * fl, sTf += T * fl, nFit++;
                            });
                            let baseW, tipW;
                            const det = sEE * sTT - sET * sET;
                            if (nFit >= 3 && Math.abs(det) > 1e-9) baseW = (sEf * sTT - sTf * sET) / det, tipW = (sTT ? (sTf - sET * baseW) / sTT : 0); else baseW = 2 * (Math.max(...linePts.map(p => Math.abs(off(p)))) - ih), tipW = 0;
                            if (!Number.isFinite(baseW) || !Number.isFinite(tipW)) return;
                            const Sx = parent.x + unx * sAlong, Sy = parent.y + uny * sAlong, back = C - ("innerFirst" === mode ? 1.5 : 0), Ex = child.x - unx * back, Ey = child.y - uny * back, res = SpokeGeometry.flankPaths(Sx, Sy, Ex - Sx, Ey - Sy, nnx, nny, baseW, tipW, ih, ih, mode, SpokeGeometry.buildBaseCircle(parent.x, parent.y, A), {
                                x: child.x,
                                y: child.y,
                                r: C
                            }), d1 = side * Math.sign(nx * nnx + ny * nny || 1) < 0 ? res.top : res.bottom;
                            d1 && d1 !== d0 && stem.setAttribute("d", d1), stem.removeAttribute("transform");
                        } else {
                            // Single tapered band (Ka's taperedPath): corners
                            // sit at +/- width/2 around the centreline
                            // segment; widths are linear base -> tip.
                            const A = baseArc ? baseArc.r : null, capC = !tipArc && firstArc ? sxArcCentre(firstArc) : null;
                            let sAlong, eAlong;
                            if (null !== A) sAlong = A; else {
                                const b0 = pts[0], b1 = pts[pts.length - 1];
                                sAlong = along({
                                    x: (b0.x + b1.x) / 2,
                                    y: (b0.y + b1.y) / 2
                                });
                            }
                            if (tipArc) eAlong = axisLenOld - (tipArc.r - 1.5); else if (capC) eAlong = (capC.x - Bold.x) * ux + (capC.y - Bold.y) * uy; else {
                                const t0 = pts[1] || pts[0];
                                eAlong = along(t0);
                            }
                            if (!(eAlong - sAlong > 1)) return;
                            const b0 = pts[0], b1 = pts[pts.length - 1];
                            let w0 = Math.hypot(b0.x - b1.x, b0.y - b1.y);
                            if (null !== A && A > 0) {
                                const h = w0 / 2;
                                h < A && (w0 = 2 * h * A / Math.sqrt(A * A - h * h));
                            }
                            if (!Number.isFinite(w0) || w0 <= 0) return;
                            const Sx = parent.x + unx * sAlong, Sy = parent.y + uny * sAlong, Ex = child.x - unx * (axisLenOld - eAlong), Ey = child.y - uny * (axisLenOld - eAlong), seg = `M ${Sx.toFixed(2)} ${Sy.toFixed(2)} L ${Ex.toFixed(2)} ${Ey.toFixed(2)}`, d1 = SpokeGeometry.taperedPath(seg, w0, 0, tipArc ? SpokeGeometry.buildTipCircle(Sx, Sy, Ex, Ey, 2 * tipArc.r) : null, null !== A ? SpokeGeometry.buildBaseCircle(parent.x, parent.y, A) : null);
                            d1 && d1 !== d0 && stem.setAttribute("d", d1), stem.removeAttribute("transform");
                        }
                    };
                    const sxFinaliseStems = () => {
                        const centres = new Map();
                        In.querySelectorAll("[data-layout-key]").forEach(g => {
                            const x = Number.parseFloat(g.dataset.layoutX), y = Number.parseFloat(g.dataset.layoutY);
                            Number.isFinite(x) && Number.isFinite(y) && !centres.has(g.dataset.layoutKey) && centres.set(g.dataset.layoutKey, {
                                x: x,
                                y: y
                            });
                        });
                        // Pre-pass: a spoke's own flank arcs record the
                        // render-time parent/child centres; sibling stems
                        // of the same spoke (tapered bands) anchor to
                        // those when their own d carries no tip circle.
                        const spokeOld = new Map();
                        In.querySelectorAll(".tapered-stem").forEach(stem => {
                            const key = sxStemChildKey(stem), d = stem.getAttribute("d");
                            if (!key || !d || spokeOld.has(key)) return;
                            const {arcs} = sxParseStemD(d);
                            if (arcs.length < 2 || arcs[0].at < 6) return;
                            const tip = sxArcCentre(arcs[0]), base = sxArcCentre(arcs[arcs.length - 1]);
                            tip && base && spokeOld.set(key, {
                                tip: tip,
                                base: base
                            });
                        });
                        In.querySelectorAll(".tapered-stem").forEach(stem => {
                            try {
                                sxReanchorStem(stem, centres, spokeOld);
                            } catch (e) { /* one bad stem never blocks the rest */ }
                        });
                    };
                    sxStemFinaliseHook = sxFinaliseStems;


            try {
                !function() {
                    const {controlGap: t, iconGap: n, startOffset: i, parentOuterMargin: a} = Za.SETTLE, r = [], o = Za.orientedBox, s = e => Za.isClear(e, r);
                    const sxBypassSearch = sxSettleDone && !scCtx;
                    // Blit session (P3) obstacle continuity: in a
                    // continuing session paint the frozen groups are
                    // absent from the layer (vault + raster), so
                    // their recorded shapes are flushed into the
                    // obstacle array at their branch-order positions
                    // (blitFlushObstacles) — live nodes keep their
                    // frozen obstacles exactly as in a vector paint.
                    const blitObst = blitSess && blitSess.swapped && scCtx && blitSameFrozen(scCtx.frozenBranches, blitSess.frozen) ? blitSess : null;
                    blitObst && (blitObst.flushIx = 0);
                    In.querySelectorAll(".node-group").forEach(l => {
                        blitObst && blitFlushObstacles(blitObst, r, o, l.dataset.layoutKey);
                        if (l.classList.contains("is-hidden")) return;
                        const c = l.querySelector(".category-label,.map-label"), d = c && c.querySelector("textPath"), u = d && d.getAttribute("href"), p = c && (c.dataset.pathId || u && u.slice(1)), h = p && e.byId(p);
                        if (!c || !h) return;
                        const g = h.getTotalLength();
                        if (!g) return;
                        const m = e => {
                            const t = Math.min(g, Math.max(0, e)), n = h.getPointAtLength(t), i = h.getPointAtLength(Math.max(0, t - 1)), a = h.getPointAtLength(Math.min(g, t + 1)), r = Math.hypot(a.x - i.x, a.y - i.y), o = (a.x - i.x) / Math.max(.001, r), s = (a.y - i.y) / Math.max(.001, r);
                            return e > g && (n.x += o * (e - g), n.y += s * (e - g)), {
                                point: n,
                                x: o,
                                y: s
                            };
                        }, f = h.getPointAtLength(0), y = h.getPointAtLength(Math.min(1, g)), b = (y.x - f.x) / Math.max(.001, Math.hypot(y.x - f.x, y.y - f.y)), v = (y.y - f.y) / Math.max(.001, Math.hypot(y.x - f.x, y.y - f.y)), w = Array.from(l.querySelectorAll(".direction-control")), k = c.classList.contains("category-label"), x = Number.parseFloat(c.dataset.labelOffset || d && d.getAttribute("startOffset")), S = Number.isFinite(x) ? x : i, $ = l.querySelector(".branch-icon,.topic-icon"), E = Number($ && $.dataset.diameter) || 0, A = E / 2;
                        let C = c.getComputedTextLength();
                        if (k && w.length && E) {
                            const e = Math.max(...w.map(e => Number(e.dataset.tagWidth) || 48)), i = g - (A + t + e + a), r = Math.max(48, i - n - A - S);
                            C > r && (c.setAttribute("textLength", r.toFixed(2)), c.setAttribute("lengthAdjust", "spacing"), 
                            C = r);
                        }
                        const M = l.querySelector(".node-label-underline");
                        if (M) {
                            const e = -v, t = b, n = Number(M.dataset.offset), i = Number.isFinite(n) ? n : 10, a = Number(c.getAttribute("x")), r = Number(c.getAttribute("y"));
                            M.setAttribute("x1", (a + e * i).toFixed(2)), M.setAttribute("y1", (r + t * i).toFixed(2)), 
                            M.setAttribute("x2", (a + b * C + e * i).toFixed(2)), M.setAttribute("y2", (r + v * C + t * i).toFixed(2));
                        }
                        let I = S + C, P = m(S + C / 2).point;
                        l.dataset.labelX = P.x.toFixed(2), l.dataset.labelY = P.y.toFixed(2);
                        const L = !k && !l.classList.contains("imported-child"), T = l.classList.contains("imported-child"), F = l.classList.contains("subcategory-node"), scFrozenNode = Boolean(scCtx && qn[l.dataset.layoutKey] && scCtx.frozenBranches.has(qn[l.dataset.layoutKey].branch)), N = L ? 1 : T ? 1 : n, _ = Number.parseFloat(l.dataset.iconDistanceOverride), D = F ? g : Number.isFinite(_) ? _ : I + N + A, R = e => {
                            const n = m(e).point, i = E ? e + A + (L ? 6 : t) : I, a = w.map(e => {
                                const t = Number(e.dataset.controlScale) || 1, n = Number(e.dataset.tagWidth) || 48, i = Number(e.dataset.tagHeight) || 20, a = Boolean(Nt && Nt.id === l.dataset.layoutKey && Nt.direction === e.dataset.direction);
                                return {
                                    control: e,
                                    scale: t,
                                    tagWidth: n,
                                    tagHeight: i,
                                    width: a ? 320 * t : n,
                                    height: a ? 40 * t : i
                                };
                            }), r = a.length ? Math.max(...a.map(e => e.width)) : 0, s = i + r / 2, c = m(s), d = c.x < 0, u = d ? -c.x : c.x, p = d ? -c.y : c.y, h = 180 * Math.atan2(p, u) / Math.PI, g = -p, f = u, y = a.length > 1 ? Math.max(...a.map(e => e.height / 2)) + 4 : 0, b = a.map(e => {
                                const t = Number(e.control.dataset.baseCx), n = Number(e.control.dataset.baseCy), i = Number(e.control.dataset.baseAngle) || 0, r = e.control.classList.contains("group-match-control") || 1 === a.length ? 0 : y, s = "give" === e.control.dataset.direction ? 1 : -1, l = c.point.x + g * r * s, d = c.point.y + f * r * s;
                                return {
                                    ...e,
                                    baseCx: t,
                                    baseCy: n,
                                    px: l,
                                    py: d,
                                    rotation: h - i,
                                    shape: o(l, d, e.width, e.height, h)
                                };
                            }), v = [];
                            return $ && E && v.push(o(n.x, n.y, E, E)), b.forEach(e => v.push(e.shape)), {
                                iconDistance: e,
                                iconCenter: n,
                                controlsStart: i,
                                controlsStationDistance: s,
                                controlsOuterEdge: i + r,
                                controlPlacements: b,
                                shapes: v
                            };
                        };
                        let O = R(D);
                        // Scoped solve (T2): the settle search is a
                        // paint-stage coupling channel — it re-seats
                        // an icon outward along its spoke when its
                        // shapes collide with the accumulated boxes
                        // of every earlier node in DOM order, so a
                        // recompute-set move could otherwise push a
                        // frozen node off its delivered position
                        // after the freeze replay (and a frozen
                        // node's delivered position may itself be a
                        // settled one, so simply skipping the search
                        // would move it back). While a scope is
                        // active, a frozen topic/child whose captured
                        // delivered center differs from the un-searched
                        // seat is therefore re-seated at that center
                        // instead — its along-path distance projected
                        // onto this paint's label path, which the
                        // freeze replay restored to the delivered
                        // line, with the center then snapped to the
                        // captured value exactly — and the search
                        // never runs for it. A frozen node already
                        // at its delivered center keeps the ordinary
                        // seat computation untouched. Its shapes
                        // still accumulate below as obstacles for
                        // the nodes that do recompute.
                        // Group 3d (2026-10-27): when this item's
                        // auto-shrink is armed, the settle search
                        // must not push its seat back out — the
                        // search's fixed outward steps overshoot
                        // the shrunken seat and can leave the
                        // cloud larger than before the shrink
                        // (settled xAreaCross rose ~31% on the
                        // test branch). Armed items keep their
                        // delivered seat D exactly as built.
                        let sxArmSeat = !1;
                        // HUB SEATING (ruled 2026-11-01, per
                        // HUB-SIDE-DIAGNOSIS.md): on the Anneal closing
                        // paint only, a category hub group is also
                        // snap-eligible: its captured centre is the
                        // paintComposition capture's rr.branchAnchor
                        // point — the seat closer to the centre avatar
                        // — so the hub is seated at the same anchor
                        // its icons were composed from, instead of
                        // standing at the spliced pre-paint seat the
                        // snap never reached. Every other paint keeps
                        // the (L || T) gate exactly as before.
                        const scCenterPt = scFrozenNode && (L || T || (k && scCtx && "anneal-closing-paint" === scCtx.opClass)) && scCtx.centers ? scCtx.centers.get(l.dataset.layoutKey) : null;
                        if (scCenterPt) {
                            if (Math.hypot(scCenterPt.x - O.iconCenter.x, scCenterPt.y - O.iconCenter.y) > .011) {
                                const scB = (scCenterPt.x - f.x) * b + (scCenterPt.y - f.y) * v;
                                Number.isFinite(scB) && (O = R(Math.max(0, scB)), O.iconCenter = {
                                    x: scCenterPt.x,
                                    y: scCenterPt.y
                                });
                            }
                        } else if (!F && (L || T) && !sxArmSeat && !sxBypassSearch && !s(O.shapes)) {
                            const e = Za.settleSearch(L), t = e.step, n = e.attempts;
                            for (let e = 1; e <= n; e++) {
                                const n = R(D + e * t);
                                if (O = n, s(n.shapes)) break;
                            }
                        }
                        const B = O.iconDistance, j = O.iconCenter, q = (O.controlsStart, O.controlsStationDistance);
                        // Build 2026-10-18_1706: capture the icon's render-time center before the settle write below overwrites data-layout-x/y with the settled center; the taper fix after the control placements needs the delta between the two.
                        const preSettleIconX = Number.parseFloat(l.dataset.layoutX), preSettleIconY = Number.parseFloat(l.dataset.layoutY);
                        if (O.controlsOuterEdge, $ && E && ($.setAttribute("transform", `translate(${(j.x - A).toFixed(2)} ${(j.y - A).toFixed(2)})`), 
                        l.dataset.layoutX = j.x.toFixed(2), l.dataset.layoutY = j.y.toFixed(2)), O.controlPlacements.forEach(e => {
                            const t = e.px - e.baseCx, n = e.py - e.baseCy;
                            e.control.setAttribute("transform", `translate(${t.toFixed(2)} ${n.toFixed(2)}) rotate(${e.rotation.toFixed(2)} ${e.baseCx.toFixed(2)} ${e.baseCy.toFixed(2)})`);
                        }), L && w.length) {
                            const e = m(Math.max(0, B - A)).point;
                            l.querySelectorAll(":scope > .hanky-midline-outline, :scope > .hanky-midline").forEach(t => {
                                "line" === t.tagName.toLowerCase() && (t.setAttribute("x2", e.x.toFixed(2)), t.setAttribute("y2", e.y.toFixed(2)));
                            });
                        }
                        // Stems are NOT touched here: pass 1 seats icons
                        // only. Every tapered stem is re-emitted from the
                        // settled parent/child centres by sxFinaliseStems
                        // after this loop (see the re-anchoring helpers
                        // above) — never shifted by a delta.
                        if ($ && E) {
                            // Build 2026-10-17_1050: anchor each label to its icon. The
                            // icon's final settled distance B is now known, so shift the
                            // text along its spoke until it TERMINATES just inside the
                            // icon (text end = B - A - N: icon center - radius - gap),
                            // extending outward along the spoke instead of floating
                            // centered around the spoke midpoint. Applies to every
                            // generation (topics, subcategory hubs, category labels);
                            // textPath labels move via startOffset (mirrored on reversed
                            // paths), plain category labels via their x/y anchor, rotate
                            // origin, and underline. Label center (data-label-x/y)
                            // follows the text so relation framing stays accurate.
                            const anchorEnd = B - A - N, endAnchored = !d && "end" === c.getAttribute("text-anchor"), anchorS = anchorEnd - C;
                            // Group 3d fix (symptom #2, label jetting): the
                            // anchor step used to fire only when the anchored
                            // position lay OUTWARD of the current offset
                            // (anchorS > S + .5), so a label whose spoke had
                            // been shortened — by an auto-shrink press — was
                            // never pulled back in: it stayed seated from the
                            // pre-shrink geometry, past the end of its
                            // shortened spoke, while the icon moved in with
                            // the shrink. The step now fires in BOTH
                            // directions (any |anchorS - S| > .5), so the
                            // label always terminates just inside its icon
                            // at the icon's CURRENT settled distance B,
                            // following the spoke in as well as out. The
                            // shift body below is unchanged and applies the
                            // same move to textPath offsets (mirrored on
                            // reversed paths) and to plain category labels
                            // (x/y anchor, rotate origin, underline) alike.
                            if (Math.abs(anchorS - S) > .5) {
                                if (d) {
                                    const hrefId = (d.getAttribute("href") || "").replace(/^#/, "");
                                    d.setAttribute("startOffset", (hrefId && hrefId !== p ? g - anchorS : anchorS).toFixed(2));
                                } else {
                                    const oldPt = m(S).point, newPt = m(anchorS).point, dx = newPt.x - oldPt.x, dy = newPt.y - oldPt.y, cx0 = Number(c.getAttribute("x")), cy0 = Number(c.getAttribute("y"));
                                    if (Number.isFinite(cx0) && Number.isFinite(cy0)) {
                                        c.setAttribute("x", (cx0 + dx).toFixed(2)), c.setAttribute("y", (cy0 + dy).toFixed(2));
                                        const trm = /rotate\((-?[\d.]+)[ ,]+(-?[\d.]+)[ ,]+(-?[\d.]+)\)/.exec(c.getAttribute("transform") || "");
                                        trm && c.setAttribute("transform", (c.getAttribute("transform") || "").replace(trm[0], `rotate(${trm[1]} ${(cx0 + dx).toFixed(2)} ${(cy0 + dy).toFixed(2)})`));
                                    }
                                    if (M) {
                                        const mx1 = Number(M.getAttribute("x1")), my1 = Number(M.getAttribute("y1")), mx2 = Number(M.getAttribute("x2")), my2 = Number(M.getAttribute("y2"));
                                        Number.isFinite(mx1) && M.setAttribute("x1", (mx1 + dx).toFixed(2)), Number.isFinite(my1) && M.setAttribute("y1", (my1 + dy).toFixed(2)), 
                                        Number.isFinite(mx2) && M.setAttribute("x2", (mx2 + dx).toFixed(2)), Number.isFinite(my2) && M.setAttribute("y2", (my2 + dy).toFixed(2));
                                    }
                                }
                                P = m(anchorS + C / 2).point, l.dataset.labelX = P.x.toFixed(2), l.dataset.labelY = P.y.toFixed(2);
                            }
                        }
                        if (r.push(...O.shapes), r.push(o(P.x, P.y, Math.max(24, C), k ? 30 : 22, 180 * Math.atan2(v, b) / Math.PI)), 
                        w.length && !k) {
                            const e = Math.min(g, q + 2);
                            if (e < g - 1) {
                                const t = h.getAttribute("d"), n = [];
                                l.querySelectorAll("path").forEach(e => {
                                    e.getAttribute("d") !== t || e.classList.contains("concept-hit") || e.id || n.push(e);
                                });
                                const i = Math.max(2, Math.min(48, Math.ceil(e / 24))), a = [];
                                for (let t = 0; t <= i; t++) a.push(m(e * t / i).point);
                                const r = a.map((e, t) => `${t ? "L" : "M"} ${e.x.toFixed(2)} ${e.y.toFixed(2)}`).join(" ");
                                n.forEach(e => {
                                    e.setAttribute("d", r), e.removeAttribute("stroke-dasharray");
                                });
                                const o = l.querySelector(".concept-hit");
                                o && o.setAttribute("d", r);
                            }
                        }
                        const H = l.querySelector(".hidden-count-badge");
                        if (H) {
                            const e = Number(H.dataset.width) || 30, t = Number(H.dataset.height) || 24, n = Za.SETTLE.badgeGap, i = k ? Math.max(0, B - A - n - e / 2) : B + A + n + e / 2, a = m(i), r = 180 * Math.atan2(a.y, a.x) / Math.PI;
                            if (H.setAttribute("transform", `translate(${(a.point.x - e / 2).toFixed(2)} ${(a.point.y - t / 2).toFixed(2)}) rotate(${r.toFixed(2)} ${(e / 2).toFixed(2)} ${(t / 2).toFixed(2)})`), 
                            k) {
                                // Spoke endpoints on the green ring's EXTERIOR: the label path (h) starts at radius 1248.17, inside the green at-a-glance band (inner edge 1183.51, outer edge 1312.17), so a replacement spoke path built from f (the label path's start) would terminate inside the ring. Start instead at the point along the same path whose radius from the center is ea.spokeStartRadius (1312.17, the ring's outer edge), capped at the path's end point n so a short path never inverts.
                                const t = Math.max(0, i - e / 2), n = h.getPointAtLength(t), s0 = h.getPointAtLength(Math.min(t, Math.max(0, (ea.spokeStartRadius || 0) - Math.hypot(f.x - pr.centerX, f.y - pr.centerY)))), a = `M ${s0.x.toFixed(2)} ${s0.y.toFixed(2)} L ${n.x.toFixed(2)} ${n.y.toFixed(2)}`;
                                l.querySelectorAll(":scope > .topic-stem, :scope > .topic-pulse, :scope > .concept-hit, :scope > .selected-spoke").forEach(e => e.setAttribute("d", a));
                            }
                        }
                        w.forEach(e => l.appendChild(e));
                    }), blitObst && blitFlushObstacles(blitObst, r, o, null), sxFinaliseStems(), function() {
                        const e = new Map, t = new Map;
                        In.querySelectorAll(".node-group:not(.is-hidden)[data-layout-key]").forEach(n => {
                            const i = n.dataset.layoutKey, a = qn[i], r = Number(n.dataset.layoutX), o = Number(n.dataset.layoutY);
                            a && Number.isFinite(r) && Number.isFinite(o) && (t.set(i, {
                                x: r,
                                y: o
                            }), isCatId(i) && e.set(a.branch, {
                                x: r,
                                y: o
                            }));
                        }), In.querySelectorAll(".common-overlap-link").forEach(e => {
                            if (!e.dataset.topicA) return void (e.dataset.connected = "true");
                            const n = t.get(e.dataset.topicA), i = t.get(e.dataset.topicB), a = Boolean(n && i);
                            e.dataset.connected = a ? "true" : "false", a ? (e.dataset.ax = n.x.toFixed(2), 
                            e.dataset.ay = n.y.toFixed(2), e.dataset.bx = i.x.toFixed(2), e.dataset.by = i.y.toFixed(2), 
                            e.setAttribute("d", br(n, i))) : e.style.display = "none";
                        }), wr();
                    }();
                }();
            } catch (e) {
                console.warn("Direction controls kept at their fallback positions.", e);
            }
            try {
                !function() {
                    if (In.querySelector(":scope > .spoke-underlay")) return;
                    const e = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    e.setAttribute("class", "spoke-underlay"), e.setAttribute("aria-hidden", "true"), 
                    In.querySelectorAll(".node-group[data-layout-key]").forEach(t => {
                        const n = [];
                        if (t.querySelectorAll(vr).forEach(e => {
                            __sxClosestAction(e, "directionControl") || __sxClosestAction(e, "secondGenRatingControls") || e.classList.contains("visual-rail") && e.classList.contains("rating-rail") || n.push(e);
                        }), !n.length) return;
                        const i = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        i.setAttribute("class", `${t.getAttribute("class") || ""} spoke-underlay-item`);
                        const a = t.getAttribute("style");
                        a && i.setAttribute("style", a), i.dataset.spokeFor = t.dataset.layoutKey, n.forEach(e => i.appendChild(e)), 
                        e.appendChild(i);
                    }), e.childNodes.length && In.insertBefore(e, In.firstChild);
                }();
            } catch (e) {
                console.warn("Spoke underlay kept in groups.", e);
            }
            window.__sxLoad && window.__sxLoad(93 /* F5 checkpoint: spoke underlays and geometry settled */);
            yield "paint";
            const S = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, $ = new Set, E = [], A = [], C = [], M = "lite" === Kp ? 18 : 48;
            In.querySelectorAll("[data-layout-key]").forEach(e => {
                const t = e.dataset.layoutKey, n = {
                    x: Number(e.dataset.layoutX),
                    y: Number(e.dataset.layoutY)
                }, i = r.has(t), o = r.get(t);
                if ($.add(t), fn.set(t, n), a && !S && i && o && Number.isFinite(o.x) && Number.isFinite(o.y)) {
                    const t = o.x - n.x, i = o.y - n.y, a = Math.hypot(t, i);
                    a > .5 && E.push({
                        group: e,
                        dx: t,
                        dy: i,
                        distance: a
                    });
                } else a && !S && r.size && !i && !e.classList.contains("is-hidden") && C.length < M && C.push(e);
            }), a && !S && (o.forEach((e, t) => {
                $.has(t) || (e.style.pointerEvents = "none", e.setAttribute("aria-hidden", "true"), 
                e.classList.add("layout-exit-clone"), e.querySelectorAll("[tabindex]").forEach(e => e.removeAttribute("tabindex")), 
                In.appendChild(e), A.push(e));
            }), function(e, n, i) {
                const a = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, r = void 0 !== Kp && "lite" === Kp, o = Boolean(window.CSS && CSS.supports && CSS.supports("transform", "translate3d(0px,0px,0px)"));
                if (a) return void n.forEach(e => e.remove());
                const s = Boolean(Bt && !r && o), l = o ? e : [];
                if (!l.length && !n.length && !i.length) return;
                const c = e => {
                    if (!s) return;
                    e.classList.add("rich-layout"), ((e, t) => {
                        if (!s) return;
                        const i = e.dataset.layoutKey, a = qn[i] || {}, r = a.parentId || (a.branch ? catId(a.branch) : ""), o = Number(e.dataset.layoutX), l = Number(e.dataset.layoutY), c = r && (In.querySelector(`[data-layout-key="${CSS.escape(r)}"]`) || n.find(e => e.dataset.layoutKey === r)), d = c ? {
                            x: Number(c.dataset.layoutX),
                            y: Number(c.dataset.layoutY)
                        } : null;
                        d && Number.isFinite(o) && Number.isFinite(l) && Number.isFinite(d.x) && Number.isFinite(d.y) && (e.style.setProperty(`--layout-${t}-dx`, .16 * (d.x - o) + "px"), 
                        e.style.setProperty(`--layout-${t}-dy`, .16 * (d.y - l) + "px"));
                    })(e, e.classList.contains("layout-exit-clone") ? "exit" : "enter"), e.querySelectorAll(".topic-stem,.visual-rail,.selected-spoke,.group-heat").forEach(e => {
                        e.classList.add("rich-line-draw"), e.setAttribute("pathLength", "1");
                    });
                    const t = e.dataset && e.dataset.layoutKey ? In.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(e.dataset.layoutKey)}"]`) : null;
                    t && (t.classList.add("rich-layout"), t.querySelectorAll(".topic-stem,.visual-rail,.selected-spoke,.group-heat,.tapered-stem,.hanky-midline").forEach(e => {
                        e.classList.add("rich-line-draw"), e.setAttribute("pathLength", "1");
                    }));
                };
                Cn.classList.add("is-layout-moving");
                const d = e => e.dataset && e.dataset.layoutKey ? In.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(e.dataset.layoutKey)}"]`) : null;
                l.forEach(e => {
                    e.group.style.setProperty("--layout-dx", `${e.dx}px`), e.group.style.setProperty("--layout-dy", `${e.dy}px`), 
                    e.group.classList.add("layout-transition", "layout-move-start"), s && e.group.classList.add("rich-layout");
                    const t = d(e.group);
                    t && (t.style.setProperty("--layout-dx", `${e.dx}px`), t.style.setProperty("--layout-dy", `${e.dy}px`), 
                    t.classList.add("layout-transition", "layout-move-start"), s && t.classList.add("rich-layout"));
                }), i.forEach(e => {
                    e.classList.add("layout-transition", "layout-enter-start"), c(e);
                    const t = d(e);
                    t && t.classList.add("layout-transition", "layout-enter-start");
                }), n.forEach(e => {
                    e.classList.add("layout-transition"), c(e);
                }), Cn.getBoundingClientRect(), Qp = requestAnimationFrame(() => {
                    Qp = 0, l.forEach(e => {
                        e.group.classList.remove("layout-move-start");
                        const t = d(e.group);
                        t && t.classList.remove("layout-move-start");
                    }), i.forEach(e => {
                        e.classList.remove("layout-enter-start");
                        const t = d(e);
                        t && t.classList.remove("layout-enter-start");
                    }), n.forEach(e => e.classList.add("layout-exit-active"));
                }), Zp = t.setTimeout($r, s ? 650 : l.length || i.length ? 560 : 430);
            }(E, A, C)), function() {
                const e = In.querySelector(".node-interaction-overlay");
                e && e.remove();
                const t = document.createElementNS("http://www.w3.org/2000/svg", "g");
                t.setAttribute("class", "node-interaction-overlay"), In.querySelectorAll(".node-group:not(.is-hidden)").forEach(e => {
                    const n = e.querySelector(":scope > .hidden-count-badge");
                    if (n && t.appendChild(n), isSubId(e.dataset.layoutKey)) {
                        const a = Number(e.dataset.layoutX), r = Number(e.dataset.layoutY);
                        if (Number.isFinite(a) && Number.isFinite(r)) {
                            const n = document.createElementNS("http://www.w3.org/2000/svg", "circle"), i = e.querySelector(":scope > .concept-hit"), s = e.querySelector(":scope > .topic-icon"), d = Number(s && s.dataset.diameter);
                            n.setAttribute("class", "category-toggle-hit category-icon-hit"), n.setAttribute("data-id", e.dataset.layoutKey), 
                            n.setAttribute("cx", a.toFixed(2)), n.setAttribute("cy", r.toFixed(2)), n.setAttribute("r", String(Number.isFinite(d) && d > 0 ? d / 2 : sxIconRadius(2))), 
                            n.setAttribute("aria-hidden", "true");
                            const o = i && i.dataset.uiTooltip;
                            o && (n.dataset.uiTooltip = o, n.setAttribute("data-tooltip-hover-only", ""), ul(n)), 
                            n.addEventListener("click", Qa), t.appendChild(n);
                        }
                        return;
                    }
                    if (!isCatId(e.dataset.layoutKey)) return;
                    const i = e.querySelector(":scope > .category-label");
                    if (i) {
                        const n = i.cloneNode(!0);
                        n.setAttribute("class", "category-toggle-hit"), n.setAttribute("data-id", e.dataset.layoutKey), 
                        n.removeAttribute("tabindex"), n.removeAttribute("role"), n.removeAttribute("aria-label"), 
                        n.removeAttribute("aria-expanded"), n.setAttribute("aria-hidden", "true"), n.addEventListener("click", Qa), 
                        t.appendChild(n);
                    }
                    const a = Number(e.dataset.layoutX), r = Number(e.dataset.layoutY);
                    if (Number.isFinite(a) && Number.isFinite(r)) {
                        const n = document.createElementNS("http://www.w3.org/2000/svg", "circle"), i = e.querySelector(":scope > .concept-hit"), s = e.querySelector(":scope > .branch-icon"), d = Number(s && s.dataset.diameter);
                        n.setAttribute("class", "category-toggle-hit category-icon-hit"), n.setAttribute("data-id", e.dataset.layoutKey), 
                        n.setAttribute("cx", a.toFixed(2)), n.setAttribute("cy", r.toFixed(2)), n.setAttribute("r", String(Number.isFinite(d) && d > 0 ? d / 2 : sxIconRadius(1))), 
                        n.setAttribute("aria-hidden", "true");
                        const o = i && i.dataset.uiTooltip;
                        o && (n.dataset.uiTooltip = o, n.setAttribute("data-tooltip-hover-only", ""), ul(n)), 
                        n.addEventListener("click", Qa), t.appendChild(n);
                    }
                }), t.childNodes.length && In.appendChild(t);
            }(), function() {
                const e = In.querySelector("[data-center-branch-toggle-wrap]");
                e && In.appendChild(e);
            }(), function() {
                const e = In.querySelector(":scope > .map-label-stack");
                if (e) return void In.appendChild(e);
                const t = document.createElementNS("http://www.w3.org/2000/svg", "g");
                t.setAttribute("class", "map-label-stack"), In.querySelectorAll(".node-group:not(.is-hidden)").forEach(e => {
                    const n = e.querySelector(":scope > .category-label, :scope > .map-label");
                    if (!n) return;
                    const i = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    i.setAttribute("class", "map-label-stack-item");
                    const a = e.getAttribute("style");
                    a && i.setAttribute("style", a), e.classList.contains("is-dim") && i.setAttribute("opacity", ".18"), 
                    i.appendChild(n), t.appendChild(i);
                }), t.childNodes.length && In.appendChild(t);
            }(), function() {
                const e = In.querySelector(":scope > .direction-control-stack");
                e && e.remove();
                const t = document.createElementNS("http://www.w3.org/2000/svg", "g");
                t.setAttribute("class", "direction-control-stack"), In.querySelectorAll(".node-group:not(.is-hidden):not(.rating-control-stack-item)").forEach(e => {
                    const n = Array.from(e.querySelectorAll(":scope > .direction-control"));
                    if (!n.length) return;
                    const i = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    i.setAttribute("class", "node-group rating-control-stack-item");
                    const a = e.getAttribute("style");
                    a && i.setAttribute("style", a), e.classList.contains("is-dim") && i.setAttribute("opacity", ".18"), 
                    n.forEach(e => i.appendChild(e)), t.appendChild(i);
                }), t.childNodes.length && In.appendChild(t);
            }(), (function() {
                // Q3 hub-icon hit raise: the label stack and the
                // direction-control (rating) stack are appended after
                // the interaction overlay in this pass, so at fit view
                // a neighbour's detached rating hit paths paint over a
                // branch hub icon's own centre and swallow its taps.
                // Move ONLY the icon hit circles into a fresh layer
                // appended last in this pass, so the icon's hit area
                // resolves to its own branch group; the label clones
                // and hidden-count badges stay in the overlay, in
                // their existing paint order.
                const stale = In.querySelector(":scope > .category-icon-hit-layer");
                stale && stale.remove();
                const icons = In.querySelectorAll(".node-interaction-overlay > circle.category-icon-hit");
                if (icons.length) {
                    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    g.setAttribute("class", "category-icon-hit-layer"), icons.forEach(el => g.appendChild(el)), 
                    In.appendChild(g);
                }
            })(), (function() {
                // Q3 selection sync: mirror every RENDERED selection
                // change into the Layout Editor, including the paths
                // that mutate the selection without notifying —
                // label/icon toggle taps (Si/$i), rating-target
                // clears, and profile resets all assign Lt and land
                // here through Mr(). A change to null is a map-side
                // clear, mirrored as an editor clear. Editor-
                // initiated selection (API selectNode) does not
                // render, so it never echoes back through here.
                if (Lt === sxSelEditorMirrored) return;
                sxSelEditorMirrored = Lt;
                try {
                    const ui = window.__SEXCAPADES_LAYOUT_UI;
                    if (!ui) return;
                    if (Lt) ui.selectNode && ui.selectNode(Lt); else ui.clearSelection && ui.clearSelection();
                } catch (err) { __sxErrLog("layout-select-sync", err); }
            })(), window.__sxLoad && window.__sxLoad(96 /* F5 checkpoint: DOM stacks, interaction overlays, and controls installed */);
            yield "paint";
            Nt && function(e, t) {
                const n = Array.from(In.querySelectorAll(".direction-control")).find(n => n.dataset.id === e && n.dataset.direction === t), i = n && __sxClosestAction(n, "nodeGroup");
                i && (i.appendChild(n), In.appendChild(i));
            }(Nt.id, Nt.direction), vc(), Jt(), (i.forceRepaint || innerWidth > 620 && Object.keys(wt).length) && Ai();
            window.__sxLoad && window.__sxLoad(98 /* F5 checkpoint: Scribe summary and framing ready */);
            yield "paint";
            window.__sxLoad && window.__sxLoad(100 /* F5 checkpoint contract: pipeline complete */);
            // Scoped paint (T3), restore half: swap each retained
            // frozen .node-group element back in place of the fresh
            // element this paint built for the same key. The frozen
            // node's delivered state is by construction its pre-op
            // state (freeze replay + the settle guard above), so the
            // retained element — same object, byte-identical markup
            // — IS the correct post-op rendering; the post-processing
            // segment above ran on the fresh twin, whose geometry
            // inputs are identical, and its whole-viewport steps
            // (relations layer, label/control stacks, spoke
            // underlay, interaction overlay) hold fresh elements
            // whose frozen-incident content is likewise identical.
            // Any fresh/retained markup divergence is counted, not
            // hidden. Recompute-set groups keep their fresh
            // elements and listeners untouched.
            if (scKeep && scKeep.size) try {
                let kept = scSegDone.size, diverged = scSegDiverged;
                scKeep.forEach((el, key) => {
                    // Segment paint (P1): keys spliced from captured
                    // segments have no fresh twin — the lookup below
                    // would find the spliced clone, which must never
                    // be replaced by the captured original or counted
                    // here; spliced keys are already accounted in
                    // kept/diverged from the segment mechanism.
                    if (scSegDone.has(key)) return;
                    const fresh = In.querySelector(`.node-group[data-layout-key="${CSS.escape(key)}"]:not(.layout-exit-clone)`);
                    if (!fresh || fresh === el) return;
                    fresh.outerHTML !== el.outerHTML && diverged++, fresh.replaceWith(el), kept++;
                }), dkLog.push({
                    type: "scoped-paint",
                    retained: kept,
                    captured: scSeg ? scSeg.size : scKeep.size,
                    diverged: diverged
                });
            } catch (_) { __sxErrLog("layout-scoped-paint", _); }
            try {
                sxFinaliseStems();
            } catch (_) { __sxErrLog("layout-stem-finalise-restore", _); }
            // Segment paint (P1) phase timings for this scoped paint,
            // recorded only in dkLog (no console output): capture =
            // segment capture, assemblyClone = per-group assembly +
            // deep clone inside the splice, spliceInsert = anchor
            // search + insertion inside the splice, spliceTotal = the
            // whole splice IIFE, rest = everything else in Ar.
            if (scSeg && scSeg.size) {
                const scTTot = performance.now() - scT0, scR1 = e => Math.round(10 * e) / 10;
                dkLog.push({
                    type: "segment-timing",
                    capture: scR1(scTCap),
                    assemblyClone: scR1(scTAsm),
                    spliceInsert: scR1(scTIns),
                    spliceTotal: scR1(scTSplice),
                    rest: scR1(scTTot - scTCap - scTSplice),
                    total: scR1(scTTot)
                });
            }
            // Blit session (P3), end-of-paint step — where the T3
            // restore block sits: start a session after a burst's
            // first scoped paint, or run a continuing session
            // paint's vault/image step (see blitPaintEnd at the
            // scCtx declarations).
            try {
                blitPaintEnd(scKeep, scSeg);
            } catch (_) {
                __sxErrLog("layout-blit-end", _);
            try {
                sxFinaliseStems();
            } catch (_) { __sxErrLog("layout-stem-finalise-blit", _); }
            }
            try {
                const activeId = Mt && vt[Mt] ? Mt : "__default__";
                const isDirty = Boolean(typeof yt !== "undefined" && yt[activeId]);
                if (!isDirty && In && In.childNodes.length > 0) {
                    sxActiveVaultKey = sxGetMapVaultKey(activeId);
                    sxActiveVaultProfileId = activeId;
                    sxSaveWarmBootCache(activeId);
                }
            } catch (_) {}
        }
        function Cr(e, t = "rendering problem") {
            window.__sxLoad && window.__sxLoad(-1);
            jn = !0, On = null, Tn && (Tn.textContent = `The hypermap hit a ${t}. Your open profile is unchanged.`),
            Ln && (Ln.hidden = !1), console.error("Map paused safely.", e);
        }
        // Item 11 (Build 2026-10-16_1909) made the tuned layout the default
        // for the unrated map view only; Build 2026-10-16_1957 makes the
        // tuned set the global default for every map state, rated or not,
        // so all maps share one geometry and stay directly comparable.
        // While the session has no explicit layout control — no layout-*
        // URL params at load (see the bootstrap in index.html), and the live
        // settings still match what this block last applied, so
        // layout-editor changes disengage it — the reconciler at the top of
        // Mr still tracks the profile state (the app's own empty-map test:
        // no named profiles) on every render, but both states now resolve
        // to the same tuned set, so loading a profile no longer switches
        // the layout back to the old compact defaults. The profile-state
        // detection itself is unchanged and remains available for other
        // features; it just no longer picks different layout values.
        const layoutAutoTuned = {
            spacing: "airy",
            stagger: !0,
            expandAll: !0,
            collision: "grow",
            crossmin: !1,
            nudge: !1,
            spokeLen: 2.6,
            subLen: 1.2,
            pad: 1.4,
            repulsion: 0,
            repulsionEnabled: !1
        }, layoutAutoDefaults = {
            spacing: "airy",
            stagger: !0,
            expandAll: !0,
            collision: "grow",
            crossmin: !1,
            nudge: !1,
            spokeLen: 2.6,
            subLen: 1.2,
            pad: 1.4,
            repulsion: 0,
            repulsionEnabled: !1
        }, layoutAutoKeys = [ "spacing", "stagger", "expandAll", "collision", "crossmin", "nudge", "spokeLen", "subLen", "pad", "repulsion", "repulsionEnabled", "subcatOverrides", "kinkOverrides", "subcatAngleOffsets", "kinkAngleOffsets", "branchSpokeAutoShrink", "subcatSpokeAutoShrink" ];
        let layoutAutoMode = !window.__SEXCAPADES_LAYOUT_FROM_URL, layoutAutoState = "unrated", layoutAutoValues = layoutAutoTuned;
        function layoutAutoSync() {
            if (!layoutAutoMode) return;
            const e = Object.keys(wt).length ? "rated" : "unrated";
            if (e === layoutAutoState) return;
            if (!layoutAutoKeys.every(e => mn[e] === layoutAutoValues[e])) return void (layoutAutoMode = !1);
            const t = "unrated" === e ? layoutAutoTuned : layoutAutoDefaults;
            Object.assign(mn, t), layoutAutoState = e, layoutAutoValues = t, rn.clear(), on.clear(), 
            h.forEach(e => {
                rn.add(e.name), mn.expandAll && ((e.subcategories || []).forEach(t => on.add(Un(e.name, t.name))), 
                e.topics.forEach(e => on.add(Wn(e))));
            });
        }
        // Ownership note (map-render refactor, finding 15): the
        // center-node global metric total (#metricMapGlobal) is NOT
        // computed or updated anywhere in this bundle — it is owned
        // by the shell's inline metric script in index.html
        // (showMetricGlobal / markMetricGlobalStale / clearMetricGlobal
        // / syncMetricGlobalVisibility / positionMetricOverlay). The
        // split is deliberate and documented at that side too; do not
        // look for the total's owner here.
        // One-shot chunked-paint arm (map-render refactor): the
        // boot, route-entry, and list-close triggers each arm one
        // window flag with a budget; this consumes the first armed
        // flag (boot, then route, then close, so an earlier arm
        // leaves a later arm armed for the next render), clamps
        // the budget to the ruled 25-50 ms range, and deletes the
        // flag as the paint starts. An arm is never consumed while
        // an editor chunked paint is in flight, so no later render
        // can go chunked from a leftover arm.
        function sxConsumeChunkArm(e) {
            if (sxChunkPaint) return !1;
            const t = window[e];
            if ("number" != typeof t || !(t > 0)) return !1;
            return sxChunkBudget = Math.min(50, Math.max(25, t)), delete window[e], !0;
        }
        // INTERIM CAPSULE PAINT (ruled 2026-11-01, Jason — the visible
        // half of the 2026-10-31 capsule-only ruling, revised): while
        // a cascade runs, every interim commit ALSO paints the SCC
        // capsule approximation of the branch being worked on, so the
        // intermediary stages are visible as the algorithm moves
        // instead of the branch jumping from its starting shape to
        // its final one at run end. The paint is the solver's own
        // approximation: sxSccBuild over the just-solved tree gives
        // every topic's capsule segment (e.S — the paddle the crossing
        // number judges: from the label's inward radius minus half a
        // font size out past the end of the longest slider, drawn at
        // stroke-width F with round caps — the band shrink (2026-11-02)
        // halved the capsule to centre line ± F/2, so the painted
        // band F IS the capsule), its centreline (e.M, branching
        // point -> the paddle's outer end), its node seat, and the
        // branch's spokes (centre spokes drawn from the centre disc's
        // rim), all in world coordinates. (Capsule-inversion
        // correction, 2026-11-02: the paddle reaches the slider ends
        // and the line runs back to the rim — not the reverse.) Drawing them is one <g> of stroked lines
        // inside #mapLayer — no DOM string build of the map, no
        // settle search, no blit — so an interim paint stays cheap
        // next to a full paint, and because the layer lives inside
        // the transformed map layer it shifts with the map under pan,
        // zoom and scene resize with no projection code of its own.
        // It is rebuilt from the current solve on every interim
        // commit; the next full paint replaces #mapLayer's content
        // and removes it with everything else, so nothing of it
        // survives the run. It only READS the solved tree: the solve,
        // gates, receipts and scoped freeze are untouched. It also
        // publishes the worked branch's current centroid as
        // window.__sxInterimAnchor (world coordinates) so the shell's
        // live crossing number rides on the approximation being
        // painted, not on the frozen pre-run DOM cloud.
        function sxInterimCapsulePaint(d) {
            try {
                if (!In || !dkCtx || !dkCtx.branch) return;
                const geo = sxSccBuild(d), F = geo.F, branch = dkCtx.branch, NS = "http://www.w3.org/2000/svg";
                let layer = In.querySelector(".sx-interim-capsules");
                if (!layer) {
                    layer = document.createElementNS(NS, "g"), layer.setAttribute("class", "sx-interim-capsules"), layer.setAttribute("aria-hidden", "true"), layer.setAttribute("pointer-events", "none"), In.appendChild(layer);
                }
                let html = "", cx = 0, cy = 0, cn = 0, anchorPt = null;
                const line = (a, b, w, stroke, opacity) => {
                    html += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="' + stroke + '" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round" opacity="' + opacity + '"/>';
                };
                // Presentation floors (world units, so they scale
                // with the camera like everything else on the map):
                // the true capsule band is F wide by definition
                // (centre line ± F/2 since the 2026-11-02 band shrink) and
                // is drawn as-is, but at a fitted zoom F can be a
                // handful of screen pixels — the capsule centrelines
                // (e.M, hub -> the paddle's outer end), the spokes and the node
                // dots carry minimum widths so the approximation
                // reads as a clue to where the algorithm is at any
                // zoom, without changing the geometry it depicts.
                geo.spokes.forEach(sp => {
                    if (sp.cloud !== branch || !sp.seg) return;
                    "center" === sp.kind && (anchorPt = sp.seg[1]), line(sp.seg[0], sp.seg[1], Math.max(14, F * .3), "#67e8f9", .85);
                });
                geo.topics.forEach(e2 => {
                    if (e2.cloud !== branch || !e2.S) return;
                    line(e2.S[0], e2.S[1], e2.F || F, "#67e8f9", .30);
                });
                geo.topics.forEach(e2 => {
                    if (e2.cloud !== branch || !e2.M) return;
                    line(e2.M[0], e2.M[1], Math.max(8, F * .1), "#a5f3fc", .55);
                });
                geo.topics.forEach(e2 => {
                    if (e2.cloud !== branch || !e2.node) return;
                    cx += e2.node.x, cy += e2.node.y, cn++, html += '<circle cx="' + e2.node.x.toFixed(1) + '" cy="' + e2.node.y.toFixed(1) + '" r="' + Math.max(26, F * .45).toFixed(1) + '" fill="#a5f3fc" opacity="0.95"/>';
                });
                geo.spokes.forEach(sp => {
                    if (sp.cloud !== branch || "sub" !== sp.kind || !sp.seg) return;
                    html += '<circle cx="' + sp.seg[1].x.toFixed(1) + '" cy="' + sp.seg[1].y.toFixed(1) + '" r="' + Math.max(30, F * .6).toFixed(1) + '" fill="#67e8f9" opacity="0.9"/>';
                });
                layer.innerHTML = html;
                const ctr = cn ? { x: cx / cn, y: cy / cn } : anchorPt;
                ctr && (window.__sxInterimAnchor = { branch: branch, x: ctr.x, y: ctr.y });
            } catch (err) { __sxErrLog("layout-interim-capsule-paint", err); }
        }

        const sxRenderMap = function(opts) { return Mr(opts); };
        window.SexcapadesEngine = window.SexcapadesEngine || {};
        window.SexcapadesEngine.Map = {
            render: sxRenderMap,
            invalidateVault: sxVaultInvalidate,
            tryRestoreWarmBoot: sxTryRestoreWarmBoot,
            saveWarmBootCache: sxSaveWarmBootCache,
            invalidateWarmBootCache: sxInvalidateWarmBootCache
        };
        window.SX = window.SexcapadesEngine;

        function Mr(e = {}) {
            sxInvalidatePairs(), layoutAutoSync(), refreshCenterRing(), sxSyncRailPx(), sxSyncMapFontBase();
            if (jn && !e.recovery) return !1;
            if (Rn) return On = {
                ...e
            }, !1;
            const t = performance.now();
            if (Bn = Bn.filter(e => t - e < 2e3), Bn.push(t), Bn.length > 180) return Cr(new Error("Excessive render activity"), "repeated rendering problem"), 
            !1;
            // Chunked paint arms: boot (armed by the shell boot
            // controller), route entry (armed by sxRouteRender
            // before its render), and list close (armed by
            // sxChunkClose) — consumed one-shot here, past the
            // recovery/lock early-returns above, so a queued or
            // refused call can never eat an arm, and THIS paint
            // runs chunked at the armed budget (see
            // sxConsumeChunkArm above).
            let sxBootChunk = sxConsumeChunkArm("__sxBootChunkPaint") || sxConsumeChunkArm("__sxRouteChunkPaint") || sxConsumeChunkArm("__sxCloseChunkPaint");
            Rn = !0;
            const release = () => {
                if (Rn = !1, On && !jn) {
                    const q = On;
                    On = null;
                    // A coalesced render used to wait for the next frame.
                    // During a DeKnotter run that frame lands after
                    // applyScoped has cleared scCtx, so the replay solved
                    // with the run open and branch relief unsuppressed.
                    // The solve already inside this call has consumed mn.
                    // Drop the follow-up while the run is open. Outside a
                    // run, replay on the next frame exactly as before.
                    if (!dkCtx) requestAnimationFrame(() => Mr(q));
                }
            };
            // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31, Jason):
            // while a DeKnotter cascade context is active (dkCtx),
            // every phase commit's decisions read the SOLVE, not
            // the painted map. fr() solves on the tree and records
            // the delivered-geometry registry (dkLastBranches /
            // dkBaseStates) that the phase runner then measures
            // from: delivered radii (dkDeliveredRadii), fit
            // targets (dkComputeFitTarget), base-state captures
            // (rr.resolveRadialSiblings, inside the solve) and
            // the crossing readout (sxCrossingMeasure —
            // sxSccBuild over dkLastBranches) are all computed
            // from that registry, inside the paint of the SCC
            // capsule approximation, never from DOM geometry.
            // An interim commit therefore runs exactly the solve
            // segment Ar() runs — build + tidy (the tidier itself
            // stands down under a scoped context, exactly as in
            // a scoped paint today) plus Ar's branch-angle map
            // update — and skips the full-map paint: the DOM
            // string build, the innerHTML install, the settle
            // search and the blit steps. The visible map keeps
            // the last full paint for the whole run — except the
            // worked branch's SCC capsule approximation, which
            // sxInterimCapsulePaint draws from this same solve on
            // every interim commit (ruled 2026-11-01, Jason:
            // intermediary stages ARE shown, as the capsule
            // approximation) — and dkRunCascade paints the full
            // map ONCE when the run ends, at the state that stands. The two captures
            // in applyScoped that used to read painted positions
            // — scComputeAutoRing (category centres) and
            // scCaptureDeliveredCenters (frozen nodes' delivered
            // centres) — read the solve registry (dkLastBranches,
            // through rr's own anchor/position arithmetic) while
            // a run is live, like every other decision input;
            // neither is fed the last full paint's positions
            // interim. Ar's
            // no-profile early paint (profiles exist, none
            // selected) never builds, so that state keeps the
            // ordinary path here too.
            if (dkCtx && !e.__sxDiagFullPaint && !e.recovery && (!Object.keys(wt).length || Mt && vt[Mt])) {
                try {
                    const d = SX_SOLVER_FACADE.build();
                    SX_SOLVER_FACADE.tidy(d);
                    sn.clear(), d.branches.forEach(e2 => sn.set(e2.entry.branch.name, e2.angle));
                    sxInterimCapsulePaint(d);
                    return !0;
                } catch (err) {
                    return Cr(err), !1;
                } finally {
                    release();
                }
            }
            if (!sxChunkPaint && !sxBootChunk) {
                // Ordinary render: drive Ar's generator to
                // completion inside this call — the same single
                // synchronous paint as before the generator split.
                try {
                    const gen = Ar(e);
                    let step;
                    do {
                        step = gen.next();
                    } while (!step.done);
                    try {
                        sxStemFinaliseHook && sxStemFinaliseHook();
                    } catch (_) {}
                    return !0;
                } catch (e) {
                    return Cr(e), !1;
                } finally {
                    release();
                }
            }
            // Chunked paint (Q6): step the same generator with a
            // small per-frame budget, waiting a double rAF between
            // steps (the house yield pattern, with a timer fallback
            // for throttled frames) so each phase's own progress
            // checkpoints paint before the next phase runs. The
            // render lock (Rn) is held for the whole stepped paint,
            // so a render requested mid-paint queues exactly as it
            // does during a synchronous paint today.
            const gen = Ar(e), sxBudgetMs = sxChunkBudget;
            const p = new Promise(resolve => {
                const step = () => {
                    const t0 = performance.now();
                    let s;
                    try {
                        do {
                            s = gen.next();
                        } while (!s.done && s.value !== "paint" && performance.now() - t0 < sxBudgetMs);
                    } catch (err) {
                        return Cr(err), void resolve(!1);
                    }
                    if (s.done) return void resolve(!0);
                    let fired = !1;
                    const next = () => {
                        if (!fired) fired = !0, step();
                    };
                    requestAnimationFrame(() => requestAnimationFrame(next)), setTimeout(next, 80);
                };
                step();
            });
            p.then(ok => {
                if (ok) try {
                    sxStemFinaliseHook && sxStemFinaliseHook();
                } catch (_) {}
            });
            return sxPaintPromise = p, p.then(ok => (release(), sxPaintPromise === p && (sxPaintPromise = null), ok), () => (release(), !1));
        }
        Fn && Fn.addEventListener("click", () => {
            Dn = !0, jn = !1, Bn = [], Ln.hidden = !0, Mr({
                animate: !1,
                forceRepaint: !0,
                recovery: !0
            }), Ih();
        }), Nn && Nn.addEventListener("click", () => {
            Dn = !1, jn = !1, Bn = [], Nt = null, Lt = null, Pt = "all", Tt = "", on.clear(), 
            rn.clear(), Ln.hidden = !0, e.all("[data-filter]").forEach(e => e.setAttribute("aria-pressed", String("all" === e.dataset.filter)));
            const t = e.byId("searchInput");
            t && (t.value = ""), Mr({
                animate: !1,
                forceRepaint: !0,
                recovery: !0
            }), Ih();
        });
        const Ir = Object.freeze({
            "Rope bondage": "https://en.wikipedia.org/wiki/Rope_bondage",
            "Japanese bondage": "https://en.wikipedia.org/wiki/Japanese_bondage",
            Gags: "https://en.wikipedia.org/wiki/Gag_%28BDSM%29",
            Mummification: "https://en.wikipedia.org/wiki/Mummification_%28BDSM%29",
            Spanking: "https://en.wikipedia.org/wiki/Spanking",
            Flogging: "https://en.wikipedia.org/wiki/Flagellation",
            Clamps: "https://en.wikipedia.org/wiki/Nipple_clamp",
            Tickling: "https://en.wikipedia.org/wiki/Tickling",
            "Sensory deprivation": "https://en.wikipedia.org/wiki/Sensory_deprivation",
            "Sensory overload": "https://en.wikipedia.org/wiki/Sensory_overload",
            "Tantra / energy play": "https://en.wikipedia.org/wiki/Neotantra",
            "Pet play": "https://en.wikipedia.org/wiki/Animal_roleplay",
            "Pony Play": "https://en.wikipedia.org/wiki/Animal_roleplay",
            "Puppy play": "https://en.wikipedia.org/wiki/Pup_play",
            "Doctor/Nurse Play": "https://en.wikipedia.org/wiki/Medical_fetishism",
            Leather: "https://en.wikipedia.org/wiki/Leather_subculture",
            Uniforms: "https://en.wikipedia.org/wiki/Uniform_fetishism",
            Diapers: "https://en.wikipedia.org/wiki/Paraphilic_infantilism",
            "Anal beads": "https://en.wikipedia.org/wiki/Anal_beads",
            "Body worship": "https://en.wikipedia.org/wiki/Body_worship",
            "Muscle Worship": "https://en.wikipedia.org/wiki/Muscle_worship",
            "Dirty talk": "https://en.wikipedia.org/wiki/Erotic_talk",
            Objectification: "https://en.wikipedia.org/wiki/Sexual_objectification",
            "Fear Play": "https://en.wikipedia.org/wiki/Fear_play",
            Interrogation: "https://en.wikipedia.org/wiki/Interrogation_scene",
            "Exhibition / voyeurism": "https://en.wikipedia.org/wiki/Exhibitionism",
            Threesomes: "https://en.wikipedia.org/wiki/Threesome",
            Swinging: "https://en.wikipedia.org/wiki/Swinging_%28sexual_practice%29",
            "Cuckold / hotwife": "https://en.wikipedia.org/wiki/Cuckold",
            "Anal fingering": "https://en.wikipedia.org/wiki/Fingering_%28sexual_act%29",
            "Vaginal fingering": "https://en.wikipedia.org/wiki/Fingering_%28sexual_act%29",
            Rimming: "https://en.wikipedia.org/wiki/Anilingus",
            Facefucking: "https://en.wikipedia.org/wiki/Irrumatio",
            Facesitting: "https://en.wikipedia.org/wiki/Facesitting",
            Facials: "https://en.wikipedia.org/wiki/Facial_%28sexual_act%29",
            "Vaginal fisting": "https://en.wikipedia.org/wiki/Fisting",
            "Anal fisting": "https://en.wikipedia.org/wiki/Fisting",
            Handjobs: "https://en.wikipedia.org/wiki/Handjob",
            Pegging: "https://en.wikipedia.org/wiki/Pegging",
            Squirting: "https://en.wikipedia.org/wiki/Female_ejaculation",
            Creampies: "https://en.wikipedia.org/wiki/Creampie_%28sexual_act%29",
            "Anal sex": "https://en.wikipedia.org/wiki/Anal_sex",
            "Oral sex": "https://en.wikipedia.org/wiki/Oral_sex",
            Penetration: "https://en.wikipedia.org/wiki/Sexual_penetration",
            69: "https://en.wikipedia.org/wiki/69_%28sex_position%29",
            Cowgirl: "https://en.wikipedia.org/wiki/Woman_on_top",
            Doggystyle: "https://en.wikipedia.org/wiki/Doggy_style",
            Missionary: "https://en.wikipedia.org/wiki/Missionary_position",
            "Reverse cowgirl": "https://en.wikipedia.org/wiki/Reverse_cowgirl",
            Spooning: "https://en.wikipedia.org/wiki/Spooning",
            "Orgasm control": "https://en.wikipedia.org/wiki/Orgasm_control",
            "Orgasm denial": "https://en.wikipedia.org/wiki/Erotic_sexual_denial",
            Teasing: "https://en.wikipedia.org/wiki/Erotic_sexual_denial",
            Edging: "https://en.wikipedia.org/wiki/Edging_%28sexual_practice%29",
            Watersports: "https://en.wikipedia.org/wiki/Urolagnia",
            Lactation: "https://en.wikipedia.org/wiki/Erotic_lactation",
            "Mythical creatures": "https://en.wikipedia.org/wiki/Teratophilia",
            Aliens: "https://en.wikipedia.org/wiki/Exophilia",
            "Gender Play": "https://en.wikipedia.org/wiki/Gender_bender",
            Crossdressing: "https://en.wikipedia.org/wiki/Cross-dressing",
            Sissification: "https://en.wikipedia.org/wiki/Feminization_%28sexual_activity%29",
            ABDL: "https://en.wikipedia.org/wiki/Paraphilic_infantilism",
            "ABDL (Adult Baby / Diaper Lover)": "https://en.wikipedia.org/wiki/Paraphilic_infantilism",
            "Age gap": "https://en.wikipedia.org/wiki/Age_disparity_in_sexual_relationships",
            "Age play between adults": "https://en.wikipedia.org/wiki/Ageplay",
            Androgyny: "https://en.wikipedia.org/wiki/Androgyny",
            Anime: "https://en.wikipedia.org/wiki/Anime",
            Ballbusting: "https://en.wikipedia.org/wiki/Cock_and_ball_torture",
            Bastinado: "https://en.wikipedia.org/wiki/Foot_whipping",
            "Body Modification": "https://en.wikipedia.org/wiki/Body_modification",
            "Boot Worship": "https://en.wikipedia.org/wiki/Boot_fetishism",
            Breastfeeding: "https://en.wikipedia.org/wiki/Breastfeeding",
            Breasts: "https://en.wikipedia.org/wiki/Breast",
            Burlesque: "https://en.wikipedia.org/wiki/Burlesque",
            Caning: "https://en.wikipedia.org/wiki/Caning",
            Chastity: "https://en.wikipedia.org/wiki/Chastity",
            "Cock and Ball Torture": "https://en.wikipedia.org/wiki/Cock_and_ball_torture",
            "Consensual Non-Consent": "https://en.wikipedia.org/wiki/Consent_in_BDSM",
            "Corporal Punishment": "https://en.wikipedia.org/wiki/Corporal_punishment",
            Corsets: "https://en.wikipedia.org/wiki/Corset",
            Cosplay: "https://en.wikipedia.org/wiki/Cosplay",
            Cuffs: "https://en.wikipedia.org/wiki/Handcuffs",
            "D/s": "https://en.wikipedia.org/wiki/Dominance_and_submission",
            "Dominance & Submission": "https://en.wikipedia.org/wiki/Dominance_and_submission",
            "Edge Play": "https://en.wikipedia.org/wiki/Edgeplay",
            "Electrical Play": "https://en.wikipedia.org/wiki/Erotic_electrostimulation",
            Enemas: "https://en.wikipedia.org/wiki/Enema",
            "Erotic Literature": "https://en.wikipedia.org/wiki/Erotic_literature",
            FemDom: "https://en.wikipedia.org/wiki/Dominatrix",
            Figging: "https://en.wikipedia.org/wiki/Figging",
            Findom: "https://en.wikipedia.org/wiki/Financial_domination",
            "Fire Play": "https://en.wikipedia.org/wiki/Temperature_play",
            Fisting: "https://en.wikipedia.org/wiki/Fisting",
            "Foot Worship": "https://en.wikipedia.org/wiki/Foot_fetishism",
            Furry: "https://en.wikipedia.org/wiki/Furry_fandom",
            Geisha: "https://en.wikipedia.org/wiki/Geisha",
            "Golden Showers": "https://en.wikipedia.org/wiki/Urolagnia",
            Gothic: "https://en.wikipedia.org/wiki/Goth_subculture",
            "Group Sex": "https://en.wikipedia.org/wiki/Group_sex",
            "Head Shaving": "https://en.wikipedia.org/wiki/Head_shaving",
            Hentai: "https://en.wikipedia.org/wiki/Hentai",
            "High Heels": "https://en.wikipedia.org/wiki/High-heeled_shoe",
            Humiliation: "https://en.wikipedia.org/wiki/Erotic_humiliation",
            Hypnosis: "https://en.wikipedia.org/wiki/Hypnosis",
            "Hypnosis & mind-control fantasy": "https://en.wikipedia.org/wiki/Erotic_hypnosis",
            "Impact Play": "https://en.wikipedia.org/wiki/Impact_play",
            Kilts: "https://en.wikipedia.org/wiki/Kilt",
            "Knife Play": "https://en.wikipedia.org/wiki/Knife_play",
            Latex: "https://en.wikipedia.org/wiki/Latex",
            "Latex & rubber": "https://en.wikipedia.org/wiki/Rubber_and_PVC_fetishism",
            Lingerie: "https://en.wikipedia.org/wiki/Lingerie",
            "Medical Play": "https://en.wikipedia.org/wiki/Medical_fetishism",
            "Military Uniforms": "https://en.wikipedia.org/wiki/Military_uniform",
            "Needle Play": "https://en.wikipedia.org/wiki/Play_piercing",
            Nyotaimori: "https://en.wikipedia.org/wiki/Nyotaimori",
            Paddling: "https://en.wikipedia.org/wiki/Paddling",
            "Pantyhose/Stockings": "https://en.wikipedia.org/wiki/Pantyhose",
            "Polyamory with kink": "https://en.wikipedia.org/wiki/Polyamory",
            "Pregnancy Fantasy": "https://en.wikipedia.org/wiki/Pregnancy_fetishism",
            "Pro Domme": "https://en.wikipedia.org/wiki/Dominatrix",
            "Puppy Play": "https://en.wikipedia.org/wiki/Pup_play",
            Retifism: "https://en.wikipedia.org/wiki/Shoe_fetishism",
            "Riding Crops": "https://en.wikipedia.org/wiki/Crop_(implement)",
            "Riding crops": "https://en.wikipedia.org/wiki/Crop_(implement)",
            "Robot Play": "https://en.wikipedia.org/wiki/Robot_fetishism",
            Roleplay: "https://en.wikipedia.org/wiki/Role-playing",
            Rubber: "https://en.wikipedia.org/wiki/Rubber_and_PVC_fetishism",
            Scarification: "https://en.wikipedia.org/wiki/Scarification",
            "Sensory Deprivation": "https://en.wikipedia.org/wiki/Sensory_deprivation",
            "Shoe Fetish": "https://en.wikipedia.org/wiki/Shoe_fetishism",
            Sissy: "https://en.wikipedia.org/wiki/Feminization_(sexual_activity)",
            Sounding: "https://en.wikipedia.org/wiki/Urethral_sounding",
            Stockings: "https://en.wikipedia.org/wiki/Stocking",
            "Suspension Bondage": "https://en.wikipedia.org/wiki/Suspension_bondage",
            Switching: "https://en.wikipedia.org/wiki/Top,_bottom,_switch",
            Tantra: "https://en.wikipedia.org/wiki/Tantra",
            "Temperature Play": "https://en.wikipedia.org/wiki/Temperature_play",
            Threesome: "https://en.wikipedia.org/wiki/Threesome",
            "Toilet Play": "https://en.wikipedia.org/wiki/Coprophilia",
            Trampling: "https://en.wikipedia.org/wiki/Trampling",
            Transvestism: "https://en.wikipedia.org/wiki/Transvestism",
            "Urethral Play": "https://en.wikipedia.org/wiki/Urethral_sounding",
            Vampires: "https://en.wikipedia.org/wiki/Vampire",
            "Violet Wand": "https://en.wikipedia.org/wiki/Erotic_electrostimulation",
            "Wax & temperature": "https://en.wikipedia.org/wiki/Wax_play",
            Whips: "https://en.wikipedia.org/wiki/Whip",
            Wrestling: "https://en.wikipedia.org/wiki/Wrestling",
            Zentai: "https://en.wikipedia.org/wiki/Zentai",
            "Rope Bondage": "https://en.wikipedia.org/wiki/Bondage"
        }), Pr = e.byId("markMenu"), Lr = e.byId("markMenuTitle"), Tr = e.byId("markDescription"), Fr = e.byId("markPrevalence"), Nr = e.byId("markPrevalenceText"), _r = e.byId("markPrevalenceSource"), Dr = e.byId("markCommunityRatings"), Rr = e.byId("markCommunityRatingsBody"), Or = e.byId("markPopularitySourcesList"), Br = e.byId("markLearnMore"), jr = e.byId("markFetlifeTrigger"), qr = e.byId("markRedditTrigger"), Hr = e.byId("markDiscordTrigger"), Wr = e.byId("markCommunityFallback"), Ur = e.byId("markCommunityPopover"), Gr = e.byId("markCommunityPopoverHeading"), Kr = e.byId("markCommunityList"), zr = e.byId("markSources"), Vr = e.byId("markSourcesTrigger"), Yr = e.byId("markImportNotes"), Xr = e.byId("markImportNotesList"), Zr = e.byId("markNoteInput");
        let Qr = null, Jr = null, eo = null, to = !1, no = null;
        function io() {
            Jr && (t.clear(Jr), Jr = null);
        }
        function ao() {
            if (!Qr) return;
            const e = Vi(), t = Zr.value.trim();
            t ? tt[e][Qr] = [ t ] : delete tt[e][Qr], zt(e);
        }
        function ro() {
            zr.hidden = !0, Vr.setAttribute("aria-expanded", "false");
        }
        function oo() {
            Ur.hidden = !0, no && no.setAttribute("aria-expanded", "false"), no = null;
        }
        function so() {
            Pr.hidden || ao(), oo(), ro(), Pr.hidden = !0, Qr = null;
        }
        function lo(e) {
            const t = je[e.branch] || {};
            let n = "";
            if ("Category" === e.kind) n = t.description || "A branch of related topics to rate and discuss."; else if ("Subcategory" === e.kind) n = `A navigation group for ${(e.topics || []).length} related topics in ${e.branch}.`; else if (qe[e.label]) n = qe[e.label]; else if (e.parentId) {
                const t = qn[e.parentId] || Xn(e.parentId), i = t && qe[t.label];
                n = i ? `${e.label} is an imported variation of this: ${i}` : `${e.label} is an imported, more specific act or scenario grouped under ${t ? t.label.toLowerCase() : "its parent topic"}.`;
            } else n = je[e.branch]?.description || `${e.label} does not yet have authored About text.`;
            const i = function(e) {
                if ("Category" === e.kind || "Subcategory" === e.kind) return "";
                const t = Ge(e.id, Vi());
                if (t.single) return "";
                const n = Zn(e.id, "give"), i = Zn(e.id, "receive");
                if (!n || !i) return "";
                const a = e => e.charAt(0).toUpperCase() + e.slice(1), r = Qn(e.id);
                return `${a(t.labels[0])} ${r} — ${n}. ${a(t.labels[1])} ${r} — ${i}.`;
            }(e);
            return i ? `${i} ${n}` : n;
        }
        function co(e) {
            const t = [ e, ...I[e] || [] ].map(e => w[e]).filter(e => e && Number.isFinite(Number(e.pct)) && String(e.label || "").trim() && String(e.source || "").trim()).sort((e, t) => Number(t.pct) - Number(e.pct))[0];
            return t ? {
                pct: Number(t.pct),
                label: String(t.label).trim(),
                source: String(t.source).trim(),
                display: String(t.display || "").trim()
            } : null;
        }
        function uo(e) {
            return Number.isInteger(e), String(e);
        }
        function po(e) {
            const t = function(e) {
                return ("Category" === e.kind ? (h.find(t => t.name === e.branch)?.topics || []).flatMap(e => {
                    const t = Wn(e);
                    return [ t, ...ai(t, Vi()) ];
                }) : "Subcategory" === e.kind ? (e.topics || []).flatMap(e => {
                    const t = Wn(e);
                    return [ t, ...ai(t, Vi()) ];
                }) : ai(e.id, Vi())).map(e => qn[e] || Xn(e)).filter(Boolean);
            }(e);
            if (!t.length) return null;
            const n = t.map(e => co(e.label)).filter(Boolean).map(e => e.pct).filter(Number.isFinite);
            if (!n.length) return null;
            const i = n.reduce((e, t) => e + t, 0) / n.length, a = Math.min(...n), r = Math.max(...n), o = e => Math.round(10 * e) / 10;
            return {
                count: n.length,
                missing: t.length - n.length,
                min: o(a),
                max: o(r),
                average: o(i),
                kind: "Category" === e.kind ? "category" : "parent"
            };
        }
        function ho(e, t) {
            return [ e, ...I[e] || [] ].map(e => w[e]).find(e => e && Number.isFinite(Number(e.pct)) && (/lehmiller/i.test(e.source || "") ? "lehmiller" : "joyal") === t) || null;
        }
        function go(e) {
            if (e.length < 2) return null;
            const t = e.reduce((e, t) => e + t, 0) / e.length;
            return Math.sqrt(e.reduce((e, n) => e + Math.pow(n - t, 2), 0) / e.length);
        }
        function mo(e) {
            if (e.topics && e.topics.length) return e.topics;
            const t = h.find(t => t.name === e.branch), n = t?.subcategories?.find(t => t.name === e.label);
            return n?.topics || [];
        }
        function popularitySourceStats(e, t) {
            const n = "Category" === e.kind ? h.find(t => t.name === e.branch)?.topics || [] : "Subcategory" === e.kind ? mo(e) : [ e.label ], i = "Category" === e.kind || "Subcategory" === e.kind, a = Math.max(1, n.length), r = [], o = n.map(B).filter(Number.isFinite), s = o.map(E), l = o.length ? o.reduce((e, t) => e + t, 0) / o.length : null, c = go(o);
                r.push({
                    name: "FetLife",
                    value: Number.isFinite(l) ? i ? `${Math.round(l).toLocaleString()} average kinksters across ${o.length} kinks` : `${Math.round(l).toLocaleString()} kinksters` : "No matched count",
                    uncertainty: null === c ? "Single matched-topic count; spread unavailable" : `Average ±2σ: ${Math.round(l).toLocaleString()} ± ${Math.round(2 * c).toLocaleString()} kinksters across matched kinks`,
                    weight: s.reduce((e, t) => e + t, 0) / a
                }), [ "joyal", "lehmiller" ].forEach(e => {
                    const t = n.map(t => ho(t, e)).filter(Boolean), o = t.map(e => Number(e.pct)), s = S[e], l = o.length ? o.reduce((e, t) => e + t, 0) / o.length : null, c = go(o), d = "joyal" === e ? "Joyal et al. 2015 (n=1,516)" : "Lehmiller 2018 (n=4,175)";
                    r.push({
                        name: d,
                        value: Number.isFinite(l) ? i ? `${l.toFixed(1)}% average across ${o.length} kinks` : `${l.toFixed(1)}% prevalence` : "No matched estimate",
                        uncertainty: null !== c ? `Average ±2σ: ${l.toFixed(1)}% ± ${(2 * c).toFixed(1)} percentage points across matched kinks` : "Single matched-topic estimate; spread unavailable",
                        weight: t.length ? t.length * $(s) / a : 0
                    });
                });
                const d = n.map(j).filter(Boolean), u = d.map(e => Math.max(0, Number(e.sampleSize) || 0)), p = Number.isFinite(Number(t)) ? Math.max(0, Number(t)) : u.length ? Math.max(...u) : 0, g = d.map(e => Number(e.value)).filter(Number.isFinite), m = go(g), f = g.length ? g.reduce((e, t) => e + t, 0) / g.length : null;
                r.push({
                    name: "Community ratings",
                    value: `${Math.round(p).toLocaleString()} submitted${Number.isFinite(f) ? `; ${f.toFixed(1)} average` : ""}`,
                    uncertainty: null !== m ? `Average ±2σ: ${f.toFixed(1)} ± ${(2 * m).toFixed(1)} rating points across matched kinks` : g.length ? "Single matched-topic average; spread unavailable" : "Submission count only; average and spread unavailable",
                    weight: $(p)
                });
                const available = r.filter(e => Number.isFinite(e.weight) && e.weight > 0 && !/^No matched|^0 submitted/.test(e.value));
                const y = available.reduce((e, t) => e + t.weight, 0);
                available.forEach(e => {
                    e.relativeWeight = y ? e.weight / y * 100 : 0;
                });
                // Rank 4: a Reddit/community sample too small to count
                // (size 0 or 1, weight zero in H) is stated here, in the
                // single-topic breakdown only, naming source and topic.
                // Aggregates (category/subcategory) have no single topic
                // to name, and their rows are averages, not H, so they
                // are unchanged. The notes carry weight 0 and are
                // appended after the weight filter, so they are never
                // filtered out as "no data" and never enter
                // relativeWeight.
                if (!i) sxO6TooSmallNotes(n[0]).forEach(note => {
                    available.push({
                        name: note.source,
                        value: (0 === note.sampleSize ? "Sample size 0" : "Sample of " + note.sampleSize) + " for \u201c" + note.topic + "\u201d was too small to count \u2014 it contributed nothing to the popularity aggregate",
                        uncertainty: "O6 weight is 0.5 \u00d7 ln(sample size): 0 at a sample of 1, rising gradually from a sample of 2 upward",
                        weight: 0,
                        tooSmall: !0
                    });
                });
            return available;
        }
        function fo(e, t) {
            const i = popularitySourceStats(e, t);
            n(Or, i.map(e => `<li><b>${Hi(e.name)}</b><span>${Hi(e.value)}</span><small>${Hi(e.uncertainty)}</small></li>`).join(""));
        }
        function yo(e) {
            const t = "Category" === e.kind ? z(h.find(t => t.name === e.branch) || {
                topics: []
            }) : "Subcategory" === e.kind ? ds({
                topics: mo(e)
            }) : sxTopicPopularity(e.id || e.label, e.label), n = "Popularity " + (Number.isFinite(t) ? `${Math.round(100 * t)}/100` : "unavailable"), i = popularitySourceStats(e, 0);
            return [ n, ...i.map(e => `${e.name}: ${e.value}. ${e.uncertainty}`) ].join("\n");
        }
        function bo(e) {
            const t = e.getBoundingClientRect(), n = Ur.getBoundingClientRect(), i = Math.max(8, Math.min(innerWidth - n.width - 8, t.left)), a = innerHeight - t.bottom - 7 - 8, r = t.top - 7 - 8, o = a >= Math.min(n.height, 220) || a >= r ? Math.min(innerHeight - n.height - 8, t.bottom + 7) : Math.max(8, t.top - n.height - 7);
            Ur.style.left = i + "px", Ur.style.top = Math.max(8, o) + "px";
        }
        function vo(e) {
            const t = document.createElement("li");
            t.className = "mark-community-section-label", t.setAttribute("role", "presentation"), 
            t.textContent = e, Kr.append(t);
        }
        function wo(e, t, n) {
            const i = document.createElement("li"), a = document.createElement("a"), r = document.createElement("span"), o = document.createElement("small");
            a.href = n, a.target = "_blank", a.rel = "noopener noreferrer", a.setAttribute("role", "menuitem"), 
            r.textContent = e, o.textContent = t, a.append(r, o), i.append(a), Kr.append(i);
        }
        function ko(e) {
            const t = e.dataset.network, i = e.dataset.topic, a = ce(i, t), r = "fetlife" === t ? "FetLife" : "discord" === t ? "Discord" : "Reddit";
            if (!a.length) return void oo();
            if (no === e && !Ur.hidden) return void oo();
            oo(), ro(), no = e, e.setAttribute("aria-expanded", "true"), Gr.textContent = `${r} communities for ${i}`,
            n(Kr, ""), a.forEach(e => wo(e.name, e.scope, e.url)), Ur.hidden = !1, bo(e), Kr.querySelector("a")?.focus({
                preventScroll: !0
            });
        }
        function xo(e, t, i, a = {}) {
            if (Rt || !qn[e]) return;
            Qr && Qr !== e && ao();
            const r = qn[e], o = je[r.branch] || {}, s = Qe[Vi()][e];
            Qr = e, n(Lr, function(e) {
                const t = e.risk ? '<span class="mark-risk" role="img" aria-label="Higher-risk practice requiring specialized knowledge and explicit negotiation">*</span>' : "";
                if ("Category" === e.kind) {
                    const n = ge[e.branch];
                    return n ? `<span>${t}${Hi(e.label)}</span><svg class="mark-title-icon branch-icon${"noCode" === n.hankyKey ? " no-hanky-code-icon" : ""}" viewBox="0 0 48 48" aria-hidden="true" style="--icon-family:${n.color};color:${n.color}"><circle class="icon-ring-outline icon-ring-outline-outer" cx="24" cy="24" r="23.5"/><circle class="icon-disc" cx="24" cy="24" r="22"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="24" cy="24" r="20.5"/><g transform="scale(2)">${n.glyph}</g></svg><sup class="mark-menu-title-note">(${Hi(we[e.branch] || "symbol")})</sup>` : `<span>${t}${Hi(e.label)}</span>`;
                }
                const n = "Subcategory" === e.kind, i = n ? Ae(e.label, e.branch) : Oe(e.label, e.branch);
                return `<span>${t}${Hi(e.label)}</span><svg class="mark-title-icon topic-icon${n ? " subcategory-icon" : "noCode" === i.hankyKey ? " no-hanky-code-icon" : ""}" viewBox="0 0 48 48" aria-hidden="true" style="--icon-family:${i.color};color:${i.color}"><circle class="icon-ring-outline icon-ring-outline-outer" cx="24" cy="24" r="23.5"/><circle class="icon-disc" cx="24" cy="24" r="22"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="24" cy="24" r="20.5"/><g transform="translate(8 8) scale(2)">${i.glyph}${i.accent}</g></svg><sup class="mark-menu-title-note">(${Hi(xe(i.key))})</sup>`;
            }(r)), Tr.textContent = lo(r);
            const l = po(r), c = l ? null : co(r.label), d = l ? null : B(r.label);
            if (Fr.hidden = !l && !c && !Number.isFinite(d), l) {
                const e = "category" === l.kind ? "Topics in this category" : "Child topics";
                Nr.textContent = `${e} range from ${uo(l.min)}% to ${uo(l.max)}% common; average ${uo(l.average)}% across ${l.count} with study data.`, 
                _r.textContent = `Simple average of available child-topic prevalence estimates${l.missing ? `; ${l.missing} without study data skipped` : ""}.`;
            } else if (c) {
                const e = /\bfantasiz/i.test(c.label) ? c.label : `Adults fantasize about this: ${c.label}`;
                Nr.textContent = c.display || `${e} (${uo(c.pct)}%)`, _r.textContent = `Source: ${c.source}${Number.isFinite(d) ? ` · ${Math.round(d).toLocaleString()} FetLife kinksters` : ""}`;
            } else Number.isFinite(d) ? (Nr.textContent = `${Math.round(d).toLocaleString()} FetLife kinksters list this interest.`, 
            _r.textContent = `Source: FetLife · captured ${x.captured || x.fetlife?.captured || "2026-10-08"}`) : (Nr.textContent = "", 
            _r.textContent = "");
            var u;
            Dr.hidden = !0, n(Rr, ""), fo(r, 0), e && 0 === e.indexOf("topic-") && (u = e, fetch("https://sexcapades.io/hosted/api/histogram.php?topic=" + encodeURIComponent(u)).then(function(e) {
                return e.json();
            }).then(function(e) {
                if (Qr === u && e && e.ok) {
                    Dr.hidden = !1, fo(r, e.count);
                    var t = function() {
                        if (!e.markers) return "";
                        var t = [];
                        return [ [ "favorite", "favorite ★" ], [ "limit", "hard limit ×" ], [ "notinterested", "not interested ⊘" ], [ "fantasyonly", "fantasy only" ], [ "alreadytried", "already tried ✓" ] ].forEach(function(n) {
                            var i = e.markers[n[0]];
                            i && i.n > 0 && t.push(Math.round(i.pct) + "% ±" + Math.round(i.ci) + "% " + n[1]);
                        }), t.length ? '<p style="font-size:11px;opacity:0.7;margin:6px 0 0;">' + t.join(" · ") + "</p>" : "";
                    }();
                    if (e.enough_data) {
                        for (var i = e.bins, a = Math.max.apply(null, i.concat([ 1 ])), o = 200 / i.length, s = '<div style="display:flex;flex-direction:column;gap:3px;margin:8px 0;" role="img" aria-label="Community rating distribution, ' + e.count + ' ratings">', l = 0; l < i.length; l++) {
                            var c = Math.round(i[l] / a * 100), d = (l + .5) * o - 100, p = d < -20 ? "#e27786" : d > 20 ? "#63c796" : "#d7bd55";
                            s += '<div style="display:flex;align-items:center;gap:6px;font-size:11px;"><span style="width:70px;flex-shrink:0;opacity:0.7;">' + (e.bin_labels && e.bin_labels[l] ? e.bin_labels[l] : "") + '</span><div style="flex:1;height:14px;background:rgba(128,128,128,0.15);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + c + "%;background:" + p + ';border-radius:3px;" title="' + i[l] + ' ratings"></div></div><span style="width:28px;text-align:right;flex-shrink:0;">' + i[l] + "</span></div>";
                        }
                        s += '</div><p style="font-size:11px;opacity:0.6;margin:4px 0 0;">Based on ' + e.count + " community ratings. Negative=red, neutral=yellow, positive=green.</p>" + t, 
                        n(Rr, s);
                    } else n(Rr, '<p style="font-size:12px;opacity:0.7;margin:6px 0;">' + e.count + " of " + e.min_required + " ratings submitted for histograms</p>" + t);
                }
            }).catch(function (e) { __sxErrLog("histogram-submit", e); }));
            const p = Ir[r.label];
            Br.hidden = !p, p ? Br.href = p : Br.removeAttribute("href"), oo(), function(e) {
                let t = !1;
                [ {
                    key: "fetlife",
                    trigger: jr
                }, {
                    key: "reddit",
                    trigger: qr
                }, {
                    key: "discord",
                    trigger: Hr
                } ].forEach(n => {
                    const i = ce(e, n.key), a = n.trigger;
                    a.style.removeProperty("display"), a.hidden = !i.length, a.dataset.network = n.key,
                    a.dataset.topic = e, a.setAttribute("aria-expanded", "false"), i.length && (t = !0);
                }), Wr.hidden = t, Wr.textContent = t ? "" : "Reddit, FetLife, Discord: no dedicated community found";
            }(r.label), ro(), n(zr, (o.sources || []).map(e => {
                const t = Be[e];
                return `<a href="${t.url}" target="_blank" rel="noopener noreferrer">${t.label}</a>`;
            }).join(""));
            const h = tt[Vi()]?.[e] || [], aftercareNote = "Connection & aftercare" === r.branch;
            Zr.maxLength = aftercareNote ? 1600 : 800, Zr.placeholder = aftercareNote ? "Describe your aftercare needs: touch or space, reassurance, water or food, cleanup, medication or accessibility needs, check-in timing, and anything to avoid…" : "Add a note for this topic…", __sxClosestAction(Zr, "markNoteField")?.classList.toggle("is-aftercare-note", aftercareNote);
            if (Zr.value = h.join(" "), Yr.hidden = !0, n(Xr, ""), Pr.querySelectorAll("[data-mark]").forEach(e => e.setAttribute("aria-checked", String(e.dataset.mark === (s || "neutral")))), 
            Pr.querySelector('[data-topic-flag="fantasy"]').setAttribute("aria-pressed", String(Boolean(Je[Vi()]?.[e]))), 
            Pr.querySelector('[data-topic-flag="tried"]').setAttribute("aria-pressed", String(Boolean(et[Vi()]?.[e]))), 
            Pr.hidden = !1, innerWidth <= 620) Pr.style.removeProperty("left"), Pr.style.removeProperty("top"); else {
                const e = Pr.getBoundingClientRect(), n = 12;
                Pr.style.left = Math.max(8, Math.min(innerWidth - e.width - 8, t - e.width / 2)) + "px", 
                Pr.style.top = (i - e.height - n >= 8 ? i - e.height - n : Math.min(innerHeight - e.height - 8, i + n)) + "px";
            }
            (a.focusNote ? Zr : Pr.querySelector("[data-mark]")).focus({
                preventScroll: !0
            });
        }
        function So(e) {
            noteFitUserCamera();
            if (Nt) return;
            let t = qn[e];
            if (t || h.some(n => n.topics.some(i => Wn(i) === e && (t = {
                id: e,
                label: i,
                branch: n.name,
                kind: "Topic",
                risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk)
            }, !0))), t) {
                if (qn[e] = t, Nt = null, "Category" === t.kind) {
                    if (wn = !1, rn.has(t.branch)) return rn.delete(t.branch), Lt = null, void Mr();
                    rn.add(t.branch);
                } else wn = !1, rn.add(t.branch);
                Lt = e, Mr(), Th(e, t.branch);
            }
        }
        function $o(e, t = Vi()) {
            const n = qn[e] || Xn(e) || (at[t] || {})[e];
            if (!n) return;
            const i = ln[t], a = cn[t], r = dn[t];
            if (a?.delete(e), r?.delete(e), "Category" === n.kind) return void i?.delete(n.branch);
            const o = new Set([ ...a || [], ...r || [] ]);
            Array.from(o).some(e => {
                const i = qn[e] || Xn(e) || (at[t] || {})[e];
                return (i && i.branch || ci(e)) === n.branch && !Eo(t, e);
            }) || i?.delete(n.branch);
        }
        function Eo(e, t) {
            return Object.values(Ze[e]?.[t] || {}).includes("manual");
        }
        function Ao(e, t, n) {
            return Ze[e]?.[t]?.[n] || null;
        }
        function Co(e, t, n, i) {
            Ze[e] || (Ze[e] = {}), Ze[e][t] || (Ze[e][t] = {}), Ze[e][t][n] = i;
        }
        function Mo(e, t, n) {
            const i = Ze[e]?.[t];
            i && (delete i[n], Object.keys(i).length || delete Ze[e][t]);
        }
        function Io(e) {
            return e === Et ? At : vt[e];
        }
        function Po() {
            Ct || Mt || (Ct = !0, requestAnimationFrame(() => {
                if (Mt) return;
                const t = e.one("#profileTabs [data-add-profile]");
                t && e.byId("profileAddMenu").hidden && Pw(t);
            }));
        }
        function Lo(e) {
            return !!(e && vt[e] && Object.keys(At).length) && (Object.entries(At).forEach(([t, n]) => {
                if (Ge(t, e).single || "number" == typeof n) {
                    const i = ("number" == typeof n ? [ n ] : [ n && n.give, n && n.receive ]).map(Number).find(Number.isFinite);
                    if (void 0 === i) return;
                    return vt[e][t] = Math.max(-100, Math.min(100, i)), Co(e, t, "give", "manual"), 
                    void Co(e, t, "receive", "manual");
                }
                if (!n || "object" != typeof n) return;
                const i = vt[e][t], a = i && "object" == typeof i ? Object.assign({}, i) : {};
                [ "give", "receive" ].forEach(i => {
                    Object.prototype.hasOwnProperty.call(n, i) && Number.isFinite(Number(n[i])) && (a[i] = Math.max(-100, Math.min(100, Number(n[i]))), 
                    Co(e, t, i, "manual"));
                }), Object.keys(a).length && (vt[e][t] = a);
            }), Object.keys(At).forEach(e => delete At[e]), Ze[Et] = {}, Ct = !1, zt(e), !0);
        }
        function To(e, t, n, i = !0, a = null) {
            const r = a && (a === Et || vt[a]) ? a : Mt && vt[Mt] ? Mt : Et, o = Io(r), s = Math.max(-100, Math.min(100, Number(n)));
            if (Ge(e, r).single) {
                const t = o[e], n = "number" != typeof t || Number(t) !== s;
                return o[e] = s, Co(r, e, "give", "manual"), Co(r, e, "receive", "manual"), n && r !== Et && zt(r), 
                $o(e, r), i && Mr(), r !== Et || Do.open || Po(), s;
            }
            const l = o[e], c = l && "object" == typeof l ? Object.assign({}, l) : {}, d = !Object.prototype.hasOwnProperty.call(c, t) || Number(c[t]) !== s;
            return c[t] = s, o[e] = c, Co(r, e, t, "manual"), d && r !== Et && zt(r), $o(e, r), 
            i && Mr(), r !== Et || Do.open || Po(), c[t];
        }
        function Fo(e, t, n = !0, i = null) {
            const a = i && (i === Et || vt[i]) ? i : Mt && vt[Mt] ? Mt : Et, r = Io(a), o = r[e], s = Ge(e, a).single, l = "number" == typeof o || Boolean(o && "object" == typeof o && Object.prototype.hasOwnProperty.call(o, t));
            if (s) delete r[e], Mo(a, e, "give"), Mo(a, e, "receive"); else if ("number" == typeof o) {
                const n = "give" === t ? "receive" : "give";
                r[e] = {
                    [n]: o
                };
            } else if (o && "object" == typeof o) {
                const n = Object.assign({}, o);
                delete n[t], Object.prototype.hasOwnProperty.call(n, "give") || Object.prototype.hasOwnProperty.call(n, "receive") ? r[e] = n : delete r[e];
            }
            s || Mo(a, e, t), Nt = null, l && a !== Et && (zt(a), $o(e, a)), n && Mr();
        }
        // P1 refactor (Build 2026-10-18_2227): getScreenCTM cache. During
        // a pointer gesture the viewport does not move, so the screen CTM
        // of the element being hit-tested (rating badge, map layer) is
        // cached and reused instead of forcing a layout recalculation on
        // every pointermove and for every badge in the hit-test loop.
        // The cache key includes the viewport group transform and the
        // SVG viewBox, so any pan/zoom invalidates it automatically; the
        // cache is also dropped at the start of each pointerdown gesture.
        let __sxCtmEl = null, __sxCtmVal = null, __sxCtmKey = "";
        function __sxScreenCtm(e) {
            const t = (Jp ? Jp.getAttribute("transform") : "") + "|" + (Cn ? Cn.getAttribute("viewBox") : "");
            return __sxCtmVal && __sxCtmEl === e && __sxCtmKey === t ? __sxCtmVal : (__sxCtmEl = e, __sxCtmKey = t, __sxCtmVal = e.getScreenCTM());
        }
        function __sxInvalidateCtm() {
            __sxCtmEl = null, __sxCtmVal = null, __sxCtmKey = "";
        }
        function No(e, t, n, i = !1) {
            const a = Number(e.dataset.x0), r = Number(e.dataset.y0), o = Number(e.dataset.x1), s = Number(e.dataset.y1), l = __sxScreenCtm(e);
            if (!l) return null;
            const c = Cn.createSVGPoint();
            c.x = t, c.y = n;
            const d = c.matrixTransform(l.inverse()), u = o - a, p = s - r, h = u * u + p * p, g = h ? ((d.x - a) * u + (d.y - r) * p) / h : .5;
            if (g < -.08 || g > 1.08) return Number.NaN;
            const m = A(g);
            return 200 * (m <= .16 ? 0 : m >= .84 ? 1 : (m - .16) / .68) - 100;
        }
        function _o(e, t) {
            const n = e.dataset.id, i = e.dataset.direction, a = __sxClosestAction(e, "nodeGroup"), r = Number.isNaN(t);
            if (a) {
                const t = __sxClosestAction(e, "directionControl");
                t && (t.classList.add("active-rating"), t.classList.toggle("is-clear-preview", r), 
                a.appendChild(t)), In.appendChild(a), a.querySelectorAll(".rating-rail.active-rating,.slider-thumb.active-rating").forEach(e => e.classList.remove("active-rating"));
            }
            const o = a && a.querySelector(`.visual-rail[data-id="${n}"][data-direction="${i}"]`);
            if (o && o.classList.add("active-rating"), null === t || r) {
                const e = da(n, Vi());
                t = e[i + "Known"] ? e[i] : 0;
            }
            const s = Math.max(-100, Math.min(100, Number(t))), l = (s + 100) / 200, c = Number(e.dataset.x0), d = Number(e.dataset.y0), u = Number(e.dataset.x1), p = Number(e.dataset.y1), h = Number(e.dataset.nx), g = Number(e.dataset.ny), m = Number(e.dataset.offset);
            let f = a && a.querySelector(`.slider-thumb[data-id="${n}"][data-direction="${i}"]`);
            if (!f && a) {
                f = document.createElementNS("http://www.w3.org/2000/svg", "circle"), f.setAttribute("class", "slider-thumb"), 
                f.dataset.id = n, f.dataset.direction = i, f.setAttribute("r", "7");
                const t = __sxClosestAction(e, "directionControl");
                (t || a).insertBefore(f, t ? e : null);
            }
            f && (f.classList.add("active-rating"), f.setAttribute("cx", (c + (u - c) * l + h * m).toFixed(2)), 
            f.setAttribute("cy", (d + (p - d) * l + g * m).toFixed(2)), f.setAttribute("fill", zi(s)));
            const y = a && a.querySelector(`.direction-tag-bg[data-id="${n}"][data-direction="${i}"]`);
            return y && (y.setAttribute("fill", zi(s)), y.setAttribute("opacity", "1")), e.setAttribute("aria-valuenow", String(s)), 
            e.setAttribute("aria-valuetext", r ? "Release to clear" : String(Math.round(s))), 
            r ? Number.NaN : s;
        }
        Pr.querySelectorAll("[data-mark]").forEach(e => e.addEventListener("click", () => {
            if (!Qr) return;
            const t = Vi(), previousRatedCount = cs(t).rated, n = Qr, i = e.dataset.mark, a = Qe[t][n];
            "neutral" === i ? delete Qe[t][n] : Qe[t][n] = i, Pr.querySelectorAll("[data-mark]").forEach(e => e.setAttribute("aria-checked", String(e.dataset.mark === ("neutral" === i ? "neutral" : i)))), 
            a !== ("neutral" === i ? void 0 : i) && zt(t), Mr(), checkMilestoneTransition(t, previousRatedCount);
        })), Pr.querySelectorAll("[data-topic-flag]").forEach(e => e.addEventListener("click", () => {
            if (!Qr) return;
            const t = Vi(), previousRatedCount = cs(t).rated, n = Qr, i = "fantasy" === e.dataset.topicFlag ? Je : et, a = !i[t]?.[n];
            i[t] || (i[t] = {}), a ? i[t][n] = !0 : delete i[t][n], e.setAttribute("aria-pressed", String(a)), 
            zt(t), Mr(), checkMilestoneTransition(t, previousRatedCount);
        })), Zr.addEventListener("change", () => {
            ao(), Mr({
                animate: !1
            });
        }), Vr.addEventListener("click", () => {
            oo();
            const e = zr.hidden;
            zr.hidden = !e, Vr.setAttribute("aria-expanded", String(e));
        }), zr.addEventListener("click", e => e.stopPropagation()), jr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(jr);
        }), qr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(qr);
        }), Hr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(Hr);
        }), Ur.addEventListener("click", e => {
            e.stopPropagation(), __sxClosestAction(e.target, "openLocalCommunities") && (oo(), 
            so(), Ol());
        }), window.addEventListener("resize", () => {
            no && !Ur.hidden && bo(no);
        }), e.byId("closeMarkMenu") && e.byId("closeMarkMenu").addEventListener("click", so), window.__sxOnPtr( e => {
            Pr.hidden || zr.hidden || __sxClosestAction(e.target, "markMeta") || ro(), Ur.hidden || Ur.contains(e.target) || e.target === no || oo(), 
            Pr.hidden || Pr.contains(e.target) || so();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && (Ur.hidden ? so() : oo());
        });
        const Do = e.byId("outlineDialog"), Ro = e.byId("outlineSections"), Oo = e.byId("outlineProfileName"), Bo = e.byId("outlineHeaderCount"), jo = e.byId("outlineProgressText"), qo = e.byId("outlineProgressBar"), Ho = e.byId("outlineTimerToggle"), Wo = e.byId("outlineTimerReset"), Uo = e.byId("outlineShowRated");
        // P1 refactor (Build 2026-10-18_2227): outline-row DOM helpers.
        // getOutlineRow(el) returns the .outline-row containing an element;
        // getOutlineRow(id) returns the row for a topic id within the
        // outline sections. getOutlineRows(root) returns the id-carrying
        // outline rows under a root (default: the outline sections).
        // getOutlineCell(row, name) returns the row's [data-outline-<name>]
        // cell ("direction", "mark", "note", "note-input", ...).
        function getOutlineRow(e) {
            return "string" == typeof e ? Ro.querySelector(`.outline-row[data-outline-id="${CSS.escape(e)}"]`) : e && e.closest ? __sxClosestAction(e, "outlineRow") : null;
        }
        function getOutlineRows(e = Ro) {
            return Array.from((e || Ro).querySelectorAll(".outline-row[data-outline-id]"));
        }
        function getOutlineCell(e, t) {
            return e ? e.querySelector(`[data-outline-${t}]`) : null;
        }
        let Go = null, Ko = null, zo = null, Vo = 0, Yo = 0, Xo = 0, Zo = !0, Qo = !1, Jo = !1, es = null, ts = 0, ns = 0, is = !1, as = null, ZoAuto = !1;
        const rs = new Set, os = new Set, ss = "Show the next three popular";
        const milestoneRungs = Object.freeze([ 54, 108, 162, 216, 270, 324, 378, 403 ]), milestoneShownByProfile = new Map;
        let milestoneProfileId = null, milestoneValue = 0;
        function ls(e, t) {
            const n = ca(e, t);
            return !!Ge(e, t).keys.some(e => Boolean(n[e + "Known"])) || !!Boolean((Qe[t] || {})[e]) || !!Boolean((Je[t] || {})[e]) || Boolean((et[t] || {})[e]);
        }
        function cs(e, t = null) {
            const n = function(e) {
                const t = [];
                return h.forEach(n => {
                    n.topics.forEach(i => {
                        const a = Wn(i);
                        t.push({
                            id: a,
                            label: i,
                            branch: n.name,
                            kind: "Topic",
                            risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk)
                        }), ai(a, e).forEach(i => {
                            const a = (at[e] || {})[i];
                            a && t.push({
                                id: i,
                                label: a.label || i,
                                branch: n.name,
                                kind: "Imported",
                                risk: Boolean(((n.topics || []).find(topic => sxName(topic) === sxName(i)) || {}).risk)
                            });
                        });
                    });
                }), t;
            }(e).filter(e => "Topic" === e.kind && (!t || e.branch === t));
            return {
                rated: n.filter(t => ls(t.id, e)).length,
                total: n.length
            };
        }
        function ds(e) {
            return K(e.topics);
        }
        let sxOutlineSortMode = "popularity";
        window.__sxSetOutlineSortMode = function(e) {
            sxOutlineSortMode = "interest" === e ? "interest" : "popularity";
        };
        function us(e = Go) {
            const sxScore = "interest" === sxOutlineSortMode && e && e !== Et ? t => {
                const n = ca(Wn(t), e);
                return n.giveKnown || n.receiveKnown ? n.giveKnown && n.receiveKnown ? (n.give + n.receive) / 2 : n.giveKnown ? n.give : n.receive : null;
            } : e => sxTopicPopularity(topicIdByLabel[sxName(e)] || sxName(e));
            return U(h, z, e => e.name).map(e => {
                const t = G(e.subcategories || [], ds), n = [ ...t.flatMap(e => G(e.topics || [], sxScore)), ...G(e.subcategories?.length ? e.parentTopics || e.topics.filter(t => !Vn(e, t)) : e.topics, sxScore) ], i = G(n, sxScore), a = new Map(i.map((e, t) => [ Wn(e), t ]));
                return Object.assign({}, e, {
                    subcategories: t,
                    topics: n,
                    outlineTopicRanks: a
                });
            });
        }
        function ps() {
            return Math.max(0, Math.floor((Yo + (Vo ? Date.now() - Vo : 0)) / 1e3));
        }
        function hs() {
            Ho.classList.toggle("is-paused", Zo), Ho.setAttribute("aria-label", Zo ? "Resume elapsed timer" : "Pause elapsed timer"), 
            Ho.title = Zo ? "Resume timer" : "Pause timer";
        }
        function gs() {
            if (!es) try {
                const e = window.AudioContext || window.webkitAudioContext;
                if (!e) return;
                es = new e, "suspended" === es.state && es.resume().catch((e) => { __sxErrLog("audio-context", e); });
            } catch (e) {
                es = null;
            }
        }
        function ms() {
            ts && cancelAnimationFrame(ts), ts = 0;
        }
        function fs() {
            t.clear(ns), ns = 0, ms(), Ui(Eg), milestoneProfileId = null, milestoneValue = 0;
        }
        function milestoneWasShown(e, t) {
            return milestoneShownByProfile.get(e)?.has(t) || !1;
        }
        function markMilestoneShown(e, t) {
            milestoneShownByProfile.has(e) || milestoneShownByProfile.set(e, new Set), milestoneShownByProfile.get(e).add(t);
        }
        function closeMilestoneCelebration() {
            Ui(milestoneDialog), milestoneProfileId = null, milestoneValue = 0;
        }
        function showMilestoneCelebration(t, n) {
            if (!t || milestoneWasShown(t, n)) return;
            if (403 === n) return void ys(t);
            if (milestoneDialog.open || Eg.open) return;
            markMilestoneShown(t, n), milestoneProfileId = t, milestoneValue = n, milestoneTitle.textContent = `${n} topics rated`, 
            milestoneMessage.textContent = n < 162 ? "Your hypermap has enough detail to be useful now. You can keep building it or put it to work." : n < 324 ? "Your hypermap is getting richer. Keep going, compare it with a partner, or save a copy now." : "You’re close to the full map. Keep rating, compare what you have, or export a copy now.", 
            Wi(milestoneDialog), requestAnimationFrame(() => milestoneContinue.focus({
                preventScroll: !0
            }));
        }
        function checkMilestoneTransition(e, t) {
            if (!e || !Number.isFinite(t)) return;
            const n = cs(e).rated;
            n > t && milestoneRungs.includes(n) && showMilestoneCelebration(e, n);
        }
        function openMilestoneDestination(e) {
            const t = milestoneProfileId;
            milestoneDialog.open ? closeMilestoneCelebration() : Eg.open && fs(), Do.open && Is(!1);
            requestAnimationFrame(() => {
                const n = t => {
                    if (!t || !vt[t]) return;
                    if ("export" === e) return void Jf(t);
                    if ("import" === e) return t !== Mt && Js(t), void ww();
                    if ("scribe" === e) return t !== Mt && Js(t), void (document.getElementById("scribeTab") ? document.getElementById("scribeTab").click() : (yc(), Jd()));
                    t !== Mt && Js(t);
                    const n = Object.keys(vt).filter(e => e !== t), i = tl.querySelector("[data-add-profile]");
                    if (!n.length) return i && (kw(), xw(), Sw(), Pw(i)), void tS("Add or import your partner’s profile, then hold its tab to compare.");
                    sxSel(null, "clear"), el(t);
                    const a = tl.querySelector(`button[data-view]:not([data-view="${CSS.escape(t)}"])`);
                    a && a.focus({
                        preventScroll: !0
                    }), tS("Choose a partner: hold their profile tab — or Ctrl+click on a computer.");
                };
                t === Et || !vt[t] ? (Vy = n, bw(null)) : n(t);
            });
        }
        function ys(t = Go || Vi()) {
            if (!t || milestoneWasShown(t, 403) && !Eg.open) return;
            markMilestoneShown(t, 403), milestoneProfileId = t, milestoneValue = 403;
            if (!Eg.open) {
                Cg.textContent = "Over 400 topics rated.", Ag.dataset.submitted = "false", Wi(Eg), 
                function() {
                    ms();
                    const e = Mg.getBoundingClientRect();
                    if (!e.width || !e.height) return;
                    const t = Math.min(2, window.devicePixelRatio || 1), n = e.width, i = e.height, a = Mg.getContext("2d");
                    Mg.width = Math.round(n * t), Mg.height = Math.round(i * t), a.setTransform(t, 0, 0, t, 0, 0);
                    const r = [ "#63c796", "#63c2c8", "#d7bd55", "#e4ac5f", "#e06f6a", "#eff2ec" ];
                    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                        a.clearRect(0, 0, n, i);
                        for (let e = 0; e < 44; e++) {
                            const t = e % 2 == 0, o = t ? e % 4 == 0 ? 10 + 75 * Math.random() : n - 85 + 75 * Math.random() : Math.random() * n, s = t ? Math.random() * i : 10 + 55 * Math.random();
                            a.fillStyle = r[e % r.length], a.save(), a.translate(o, s), a.rotate(.77 * e % Math.PI), 
                            a.fillRect(-3, -1.5, 6, 3), a.restore();
                        }
                        return;
                    }
                    const o = Array.from({
                        length: 96
                    }, (e, t) => ({
                        x: .5 * n + 46 * (Math.random() - .5),
                        y: .64 * i + 18 * (Math.random() - .5),
                        vx: 8.8 * (Math.random() - .5),
                        vy: -5.4 - 7.2 * Math.random(),
                        gravity: .13 + .07 * Math.random(),
                        spin: .28 * (Math.random() - .5),
                        angle: Math.random() * Math.PI,
                        w: 4 + 5 * Math.random(),
                        h: 2 + 4 * Math.random(),
                        color: r[t % r.length]
                    })), s = performance.now(), l = e => {
                        const t = e - s;
                        a.clearRect(0, 0, n, i), o.forEach(e => {
                            e.x += e.vx, e.y += e.vy, e.vy += e.gravity, e.vx *= .992, e.angle += e.spin, a.save(), 
                            a.globalAlpha = A((2500 - t) / 450), a.translate(e.x, e.y), a.rotate(e.angle), a.fillStyle = e.color, 
                            a.fillRect(-e.w / 2, -e.h / 2, e.w, e.h), a.restore();
                        }), ts = t < 2500 && Eg.open ? requestAnimationFrame(l) : 0;
                    };
                    ts = requestAnimationFrame(l);
                }(), function() {
                    const e = es;
                    if (e && "closed" !== e.state) try {
                        const t = e.currentTime + .025, n = e.createGain();
                        n.gain.setValueAtTime(1e-4, t), n.gain.exponentialRampToValueAtTime(.2, t + .035), 
                        n.gain.exponentialRampToValueAtTime(1e-4, t + 1.05), n.connect(e.destination), [ [ 523.25, 0 ], [ 659.25, .13 ], [ 783.99, .26 ], [ 1046.5, .43 ] ].forEach(([i, a], r) => {
                            const o = e.createOscillator(), s = e.createGain(), l = t + a, c = l + (3 === r ? .52 : .3);
                            o.type = 3 === r ? "sine" : "triangle", o.frequency.setValueAtTime(i, l), s.gain.setValueAtTime(1e-4, l), 
                            s.gain.exponentialRampToValueAtTime(3 === r ? .72 : .52, l + .025), s.gain.exponentialRampToValueAtTime(1e-4, c), 
                            o.connect(s), s.connect(n), o.start(l), o.stop(c + .03);
                        });
                    } catch (e) { __sxErrLog("audio-blip", e); }
                }(), requestAnimationFrame(() => e.byId("dismissCompletionCelebration").focus({
                    preventScroll: !0
                }));
                try {
                    bs();
                } catch (e) { __sxErrLog("audio-blip", e); }
            }
        }
        function bs() {
            try {
                var t = Go;
                if (!t) return;
                var n = 0;
                try {
                    n = cs(t).rated || 0;
                } catch (e) { __sxErrLog("storage", e); }
                var i = 0;
                try {
                    i = ps();
                } catch (e) { __sxErrLog("storage", e); }
                if (n <= 0 && i < 10) return;
                var a = "";
                try {
                    a = c();
                } catch (e) { __sxErrLog("storage", e); }
                if (!a) return;
                /* Send gate above unchanged (something rated, or 10+
                   seconds elapsed). The POST goes through the shared
                   analytics path (sxSendAnalytics) with this sender's
                   legacy dedup key, so the hostname guard and the dedup
                   live there and the sent marker is written only on
                   success — a failed send can retry on a later call
                   instead of being lost for the session. */
                sxSendAnalytics({
                    action: "event",
                    uuid: a,
                    event_type: "session_stats",
                    elapsed_seconds: i,
                    topic_count: n
                }, "sexcapades_session_stats");
            } catch (e) { __sxErrLog("analytics-beacon", e); }
        }
        function vs() {
            t.clear(ns), ns = t.setTimeout(() => {
                if (ns = 0, !Go || !vt[Go]) return;
                const e = cs(Go);
                e.total > 0 && e.rated === e.total && ys();
            }, 160);
        }
        function ws() {
            if (!Go || Go !== Et && !vt[Go]) return;
            const e = cs(Go), t = e.total > 0 && e.rated === e.total, n = t && !Jo;
            var i;
            if (e.rated && us(i = Go).every(e => e.topics.filter(t => (e.outlineTopicRanks?.get(Wn(t)) ?? Number.POSITIVE_INFINITY) < 3).every(e => ls(Wn(e), i))) && p("quickstart_completed"), 
            Jo = t, n && !Zo) return ks(!0), void vs();
            const a = Math.min(100, e.rated / 403 * 100), r = xt(ps()), o = Zo ? `${r} paused${ZoAuto ? " \u2014 tab hidden" : ""}` : `${r} elapsed`;
            Bo.textContent = window.__sxOnDeck ? `${window.__sxOnDeckTotal(Go)} topics on deck` : `${e.rated} of 403 topics rated`, jo.textContent = o, qo.style.width = a + "%", 
            qo.parentElement.setAttribute("aria-valuemin", "0"), qo.parentElement.setAttribute("aria-valuemax", String(403)), 
            qo.parentElement.setAttribute("aria-valuenow", String(Math.min(403, e.rated))), 
            qo.parentElement.setAttribute("aria-label", `${e.rated} of 403 topics rated; tick marks every 54 topics (3 per category across 18 categories), up to 403 for Full map`), 
            n && vs();
        }
        function ks(e) {
            const n = Boolean(e);
            if (n === Zo) return hs(), void ws();
            n || (ZoAuto = !1);
            n ? (Vo && (Yo += Math.max(0, Date.now() - Vo), Vo = 0), t.clear(Xo), Xo = 0) : (Vo = Date.now(), 
            Qo = !0, t.clear(Xo), Xo = t.setInterval(ws, 1e3)), Zo = n, hs(), ws();
        }
        let xs = 0;
        function Ss(e) {
            const t = e.dataset.outlineId, n = Go, i = ca(t, n), a = (Qe[n] || {})[t] || "", r = e.querySelector(".outline-topic-label");
            e.querySelectorAll("[data-outline-direction]").forEach(e => {
                const t = e.dataset.outlineDirection;
                !function(e, t, n) {
                    const i = Math.max(-100, Math.min(100, Number(n) || 0)), a = __sxClosestAction(e, "outlineRating").querySelector("output");
                    e.value = String(Math.round(i)), e.classList.toggle("is-unrated", !t), e.style.setProperty("--outline-thumb", t ? zi(i) : "#646d66"), 
                    e.setAttribute("aria-valuetext", t ? `${Math.round(i)}` : "Unrated"), a.textContent = t ? String(Math.round(i)) : "—", 
                    a.classList.toggle("is-unrated", !t);
                }(e, Boolean(i[t + "Known"]), i[t]);
            }), e.querySelectorAll("[data-outline-mark]").forEach(e => e.setAttribute("aria-pressed", String(e.dataset.outlineMark === a))), 
            e.querySelector('[data-outline-flag="fantasy"]')?.setAttribute("aria-pressed", String(Boolean(Je[n]?.[t]))), 
            e.querySelector('[data-outline-flag="tried"]')?.setAttribute("aria-pressed", String(Boolean(et[n]?.[t])));
            const o = getOutlineCell(e, "note"), s = getOutlineCell(e, "note-input"), l = (tt[n]?.[t] || []).join(" ");
            if (o) {
                const e = r?.textContent?.trim() || "this topic", t = Boolean(l), n = t ? `Tap to edit: ${l}` : "Add note…";
                o.dataset.hasNote = String(t), o.title = n, o.setAttribute("aria-label", t ? `Tap to edit note for ${e}: ${l}` : `Add note for ${e}`);
            }
            s && document.activeElement !== s && (s.value = l);
        }
        function $s(e, t) {
            return Array.from(e.querySelectorAll(".outline-row[data-outline-parent]")).filter(e => e.dataset.outlineParent === t);
        }
        function Es(e, t, n = !1) {
            if (!e) return null;
            const i = document.createElement("div");
            i.innerHTML = Kl(e, n);
            const a = i.firstElementChild;
            return a ? (a.dataset.popularityTooltip = yo(t), a.tabIndex = 0, a.setAttribute("aria-hidden", "false"), 
            a.setAttribute("role", "img"), a.setAttribute("aria-label", `Popularity details for ${t.label}`), 
            a) : null;
        }
        function As(e, t) {
            const n = document.createElement("div"), i = Ge(e.id, t), a = Boolean(e.expandable);
            n.className = "outline-row" + ("Imported" === e.kind ? " is-imported" : ""), n.dataset.outlineId = e.id, 
            e.parentId && (n.dataset.outlineParent = e.parentId);
            const r = document.createElement("div");
            r.className = "outline-topic-meta";
            const o = Oe(e.label, e.branch);
            r.insertAdjacentHTML("beforeend", Kl(o));
            const s = r.querySelector(":scope>.glance-tooltip-practice-icon"), l = yo(e);
            s && (s.dataset.popularityTooltip = l, s.tabIndex = 0, s.setAttribute("aria-hidden", "false"), 
            s.setAttribute("role", "img"), s.setAttribute("aria-label", `Popularity details for ${e.label}`));
            const c = document.createElement("div");
            c.className = "outline-topic-copy";
            const d = document.createElement("span");
            if (d.className = "outline-topic-label outline-description-trigger", d.textContent = e.label, 
            d.tabIndex = 0, d.setAttribute("role", "button"), d.setAttribute("aria-label", `${e.label}. ${a ? "Expand or collapse nested topics. " : ""}Press and hold for description.`), 
            d.dataset.outlineDescription = lo(e), a && (d.dataset.outlineExpandable = "true", 
            d.setAttribute("aria-expanded", String(Boolean(e.expanded)))), c.append(d), "Imported" === e.kind) {
                const e = document.createElement("small");
                e.className = "outline-imported-note", e.textContent = "added topic", c.append(e);
            }
            r.append(c);
            const u = document.createElement("span");
            u.className = "outline-marks", [ [ "favorite", "★", "Favorite" ], [ "notinterested", "⊘", "Not interested — not for me, but not a hard boundary" ], [ "limit", "×", "Hard limit" ] ].forEach(([t, n, i]) => {
                const a = document.createElement("button");
                a.type = "button", a.className = "outline-mark", a.dataset.outlineMark = t, a.textContent = n, 
                a.title = i, a.setAttribute("aria-label", `${i}: ${e.label}`), a.setAttribute("aria-pressed", "false"), 
                u.append(a);
            }), [ [ "fantasy", "☁", "Fantasy only — I fantasize about this but would not do it in real life" ], [ "tried", "✓", "Already tried — I have already done this" ] ].forEach(([t, n, i]) => {
                const a = document.createElement("button");
                a.type = "button", a.className = "outline-mark", a.dataset.outlineFlag = t, a.textContent = n, 
                a.title = i, a.setAttribute("aria-label", `${i}: ${e.label}`), a.setAttribute("aria-pressed", "false"), 
                u.append(a);
            });
            const p = document.createElement("button");
            p.type = "button", p.className = "outline-mark", p.dataset.outlineNote = "", p.dataset.hasNote = "false", 
            p.textContent = "📝", p.title = "Add or edit note", p.setAttribute("aria-label", `Add or edit note: ${e.label}`), 
            p.setAttribute("aria-expanded", "false"), u.append(p), r.append(u), n.append(r);
            const h = document.createElement("div");
            h.className = "outline-rating-group", (i.single ? [ "give" ] : i.keys).forEach((n, a) => {
                const r = document.createElement("label"), o = !i.single && "give" === i.labels[0] && "receive" === i.labels[1];
                r.className = "outline-rating";
                const s = document.createElement("span");
                s.className = "outline-rating-label", s.textContent = o ? n : i.labels[a] || n;
                const l = o ? function(e, t, n = Vi()) {
                    const i = Ge(e, n);
                    if (i.single || "give" !== i.labels[0] || "receive" !== i.labels[1]) return "";
                    const a = Zn(e, t), r = Qn(e, n), o = e => String(e || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
                    return a && o(a) !== o(r) ? `${"receive" === t ? "Receive" : "Give"}: ${a}` : "";
                }(e.id, n, t) : "";
                l && (r.dataset.ratingTooltip = l, r.setAttribute("data-tooltip-tap-first", ""), s.title = l);
                const c = document.createElement("input");
                c.type = "range", c.min = "-100", c.max = "100", c.step = "1", c.value = "0", c.dataset.outlineDirection = n, 
                c.setAttribute("aria-label", `${e.label}, ${s.textContent}${l ? `: ${l.replace(/^[^:]+:\s*/, "")}` : ""}`);
                const d = document.createElement("output");
                r.append(s, c, d), h.append(r);
            }), n.append(h);
            const g = document.createElement("label");
            g.className = "outline-note-editor", g.hidden = !0;
            const m = document.createElement("span");
            m.textContent = `Note about ${e.label}`;
            const f = document.createElement("textarea");
            return f.rows = 2, f.maxLength = 800, f.dataset.outlineNoteInput = "", f.placeholder = "Add context, preferences, or anything you want to remember…", 
            g.append(m, f), n.append(g), Ss(n), n;
        }
        // On Deck (2026-10-21): completion-queue membership. A topic is
        // queued when its rating state is incomplete — Tier 1: unrated
        // topics under a persisted FetLife broad-hit branch/subcategory;
        // Tier 2: marks or flags with no rating in either direction;
        // Direction: a dual-direction topic with exactly one direction
        // rated; Tier 3: coarse converter seed ratings not yet confirmed
        // by hand. Unreviewed (2026-10-27, LAST in precedence): any
        // topic holding a test-sourced direction that no earlier class
        // claimed — both-direction measured scores and mixed
        // hand-rated-plus-test topics alike; an Unreviewed row leaves
        // once every direction on its topic is hand-rated. A topic carrying
        // a hard-limit mark is NEVER queued (owner ruling 2026-10-21:
        // a hard limit is one-and-done).
        const __sxSeedValues = {
            "test:fetlife": [ 100, 85, 80, 0, 33 ],
            "test:kinktest": [ 33, 100 ],
            "test:checklist": [ 0, 20, 35, 40, 60, 80, 100 ],
            "test:bdsmtest": null
        };
        function __sxOnDeckIndex(e) {
            const t = new Map;
            h.forEach(n => {
                const i = catId(n.name);
                (n.topics || []).forEach(e => {
                    const a = Wn(e), r = Vn(n, e);
                    t.set(a, {
                        id: a,
                        label: e,
                        branch: n.name,
                        kind: "Topic",
                        catId: i,
                        subId: r ? Un(n.name, r.name) : null
                    });
                });
            });
            Array.from(t.values()).filter(e => "Topic" === e.kind).forEach(n => {
                ai(n.id, e).forEach(i => {
                    const a = (at[e] || {})[i];
                    a && t.set(i, {
                        id: i,
                        label: a.label || i,
                        branch: n.branch,
                        kind: "Imported",
                        parentId: n.id,
                        catId: n.catId,
                        subId: n.subId
                    });
                });
            });
            return t;
        }
        function __sxOnDeckMembers(e) {
            const t = {
                tier1: [],
                tier2: [],
                direction: [],
                tier3: [],
                unreviewed: []
            };
            if (!e || e !== Et && !vt[e]) return t;
            const n = __sxOnDeckIndex(e), i = new Set((gt[e] && gt[e].fetlife && gt[e].fetlife.categoryHits) || []), a = Qe[e] || {}, r = Je[e] || {}, o = et[e] || {};
            n.forEach((n, s) => {
                if ("limit" === a[s]) return;
                const l = ca(s, e), c = Ge(s, e);
                if (!l.giveKnown && !l.receiveKnown) {
                    if (i.size && (i.has(n.catId) || n.subId && i.has(n.subId))) return void t.tier1.push(s);
                    if (a[s] || r[s] || o[s]) t.tier2.push(s);
                    return;
                }
                if (!c.single && l.giveKnown !== l.receiveKnown) return void t.direction.push(s);
                const d = c.single ? l.giveKnown ? [ "give" ] : [] : [ "give", "receive" ].filter(e => l[e + "Known"]);
                if (d.length && d.every(t => {
                    const n = Ao(e, s, t);
                    if (!n || "manual" === n || !(n in __sxSeedValues)) return !1;
                    const i = __sxSeedValues[n];
                    return null === i || i.includes(Math.round("give" === t ? l.give : l.receive));
                })) return void t.tier3.push(s);
                d.some(t => {
                    const n = Ao(e, s, t);
                    return n && "manual" !== n && n in __sxSeedValues;
                }) && t.unreviewed.push(s);
            });
            const s = (e, t) => {
                const i = sxTopicPopularity(e, n.get(e)?.label), a = sxTopicPopularity(t, n.get(t)?.label), r = (null === i ? Number.NEGATIVE_INFINITY : i) - (null === a ? Number.NEGATIVE_INFINITY : a);
                return r ? -r : String(n.get(e).label).localeCompare(String(n.get(t).label));
            };
            return t.tier1.sort(s), t.tier2.sort(s), t.direction.sort(s), t.tier3.sort(s), t.unreviewed.sort(s), t;
        }
        window.__sxOnDeckMembers = __sxOnDeckMembers;
        window.__sxOnDeckIndex = __sxOnDeckIndex;
        window.__sxOnDeckTotal = function(e) {
            const t = __sxOnDeckMembers(e);
            return t.tier1.length + t.tier2.length + t.direction.length + t.tier3.length + t.unreviewed.length;
        };
        // On Deck list mode (2026-10-21): the completion queue rendered
        // into the Popularity list through the same As() row factory, so
        // sliders, marks, notes and map write-back are the shipped ones.
        // Session behaviour mirrors the shipped list (the "os" session
        // set): a topic written during this session stays visible until
        // its heading is collapsed and reopened, or the list closes.
        window.__sxOnDeck = !1;
        const __sxOnDeckTouched = new Map;
        // Row-pinning (2026-10-27): a touched row pins in the section it
        // was touched in until THAT section completes a collapse + reopen
        // cycle; only then do pending moves (to another queue section)
        // and removals apply. __sxOnDeckCollapsed records which sections
        // have been collapsed since the last render, so a section's
        // reopen — and only a reopen that follows a real collapse —
        // releases its pins. Header counts are untouched by pinning:
        // __sxOnDeckTotal still counts true membership only, so the
        // header drops the moment a topic completes while its row
        // stays pinned in view.
        const __sxOnDeckCollapsed = new Set;
        const __sxOnDeckTierOrder = [ [ "tier1", "Broad matches from your import — rate these first" ], [ "tier2", "Marked, but not rated yet" ], [ "direction", "One direction missing" ], [ "tier3", "Coarse import ratings — refine when ready" ], [ "unreviewed", "Unreviewed ratings from your tests — confirm them as your own" ] ];
        window.__sxOnDeckClear = function() {
            window.__sxOnDeck = !1, __sxOnDeckTouched.clear(), __sxOnDeckCollapsed.clear();
            const e = document.getElementById("outlineShowOnDeck");
            e && (e.checked = !1);
        };
        function __sxOnDeckMarkTouched(e) {
            const t = e.closest("[data-ondeck-tier]"), n = e.dataset.outlineId;
            t && n && __sxOnDeckTouched.set(n, t.dataset.ondeckTier);
        }
        function __sxOnDeckMakeSection(e) {
            const t = __sxOnDeckTierOrder.find(([t]) => t === e);
            if (!t) return null;
            const n = document.createElement("details");
            n.className = "outline-branch ondeck-branch", n.dataset.ondeckTier = e, n.open = !0;
            const i = document.createElement("summary"), a = document.createElement("span"), r = document.createElement("span"), o = document.createElement("span");
            a.className = "outline-branch-disclosure", a.textContent = "›", a.setAttribute("aria-hidden", "true"), 
            r.className = "outline-branch-title", r.textContent = t[1], o.className = "outline-branch-count", 
            o.textContent = "0", i.append(a, r, o), n.append(i);
            const s = document.createElement("div");
            s.className = "outline-rows", n.append(s), n.addEventListener("toggle", () => __sxOnDeckPrune(n, e));
            const l = __sxOnDeckTierOrder.findIndex(([t]) => t === e);
            let c = null;
            Ro.querySelectorAll(".ondeck-branch[data-ondeck-tier]").forEach(e => {
                if (c) return;
                __sxOnDeckTierOrder.findIndex(([t]) => t === e.dataset.ondeckTier) > l && (c = e);
            });
            const d = c || Ro.querySelector(".ondeck-unresolved") || Ro.querySelector(".ondeck-empty");
            return d ? Ro.insertBefore(n, d) : (Ro.append(n), n);
        }
        function __sxOnDeckPlaceRow(e, t, n, i) {
            const a = i.get(e);
            if (!a) return;
            const r = Ro.querySelector(`.ondeck-branch[data-ondeck-tier="${t}"]`) || __sxOnDeckMakeSection(t);
            if (!r) return;
            const o = r.querySelector(".outline-rows"), s = As(a, Go), l = n[t], c = l.indexOf(e);
            let d = null;
            o.querySelectorAll(".outline-row[data-outline-id]").forEach(e => {
                d || l.indexOf(e.dataset.outlineId) > c && (d = e);
            }), d ? o.insertBefore(s, d) : o.append(s);
            const u = r.querySelector(".outline-branch-count");
            u && (u.textContent = String(o.querySelectorAll(".outline-row[data-outline-id]").length));
        }
        function __sxOnDeckPrune(e, t) {
            if (!window.__sxOnDeck || !Go) return;
            if (!e.open) return void __sxOnDeckCollapsed.add(t);
            if (!__sxOnDeckCollapsed.delete(t)) return;
            const n = __sxOnDeckMembers(Go), i = __sxOnDeckIndex(Go), a = e => {
                for (const [t] of __sxOnDeckTierOrder) if (n[t].includes(e)) return t;
                return null;
            };
            Array.from(e.querySelectorAll(".outline-row[data-outline-id]")).forEach(e => {
                const r = e.dataset.outlineId;
                if (__sxOnDeckTouched.get(r) !== t) return;
                __sxOnDeckTouched.delete(r);
                const o = a(r);
                o === t || (e.remove(), o && __sxOnDeckPlaceRow(r, o, n, i));
            });
            const r = e.querySelector(".outline-branch-count");
            r && (r.textContent = String(e.querySelectorAll(".outline-row[data-outline-id]").length));
        }
        // On Deck unresolved queue (E4b): entries an import parked on
        // profile.droppedKeys because their keys matched no current
        // topic. They are not On Deck members and never count toward
        // the header's "N topics on deck" total — this section carries
        // its own count and offers hand placement onto a real catalog
        // topic, writing the parked value into the entry's own section.
        const __sxParkedSectionNames = {
            annotations: "annotations",
            fantasyOnly: "fantasy-only list",
            alreadyTried: "already-tried list",
            ratingSources: "rating sources",
            notes: "notes",
            importAttention: "import attention"
        };
        function __sxParkedGuess(rec) {
            if (rec && "string" == typeof rec.label && rec.label) return rec.label;
            const key = String(rec && rec.key || ""), parts = key.replace(/^topic-/, "").split("-").filter(Boolean), tail = parts.length > 2 ? parts.slice(2) : parts;
            return tail.join(" ") || key;
        }
        function __sxPlaceParked(profileId, rec, topicId) {
            if (!profileId || !vt[profileId] || !rec || !topicLabelById[topicId]) return !1;
            const value = rec.value, clone = v => v && "object" == typeof v ? JSON.parse(JSON.stringify(v)) : v;
            if ("ratings" === rec.section) vt[profileId][topicId] = clone(value); else if ("alreadyTried" === rec.section) (et[profileId] || (et[profileId] = {}))[topicId] = !0; else if ("annotations" === rec.section) (Qe[profileId] || (Qe[profileId] = {}))[topicId] = value; else if ("fantasyOnly" === rec.section) (Je[profileId] || (Je[profileId] = {}))[topicId] = value; else if ("ratingSources" === rec.section) (Ze[profileId] || (Ze[profileId] = {}))[topicId] = clone(value); else if ("notes" === rec.section) (tt[profileId] || (tt[profileId] = {}))[topicId] = clone(value); else if ("importAttention" === rec.section) (cn[profileId] || (cn[profileId] = new Set)).add(topicId); else return !1;
            const store = droppedKeyRecords[profileId] || [];
            return droppedKeyRecords[profileId] = store.filter(e => e !== rec), zt(profileId), !0;
        }
        function __sxRenderOnDeck(e) {
            const t = __sxOnDeckMembers(e), n = __sxOnDeckIndex(e), i = document.getElementById("outlineShowOnDeck");
            i && (i.checked = !0), Oo.textContent = e === Et ? "New profile" : wt[e] || "Profile", Ro.replaceChildren();
            __sxOnDeckCollapsed.clear();
            let r = 0;
            __sxOnDeckTierOrder.forEach(([e, i]) => {
                const o = t[e].filter(n => {
                    const t = __sxOnDeckTouched.get(n);
                    return !t || t === e;
                });
                __sxOnDeckTouched.forEach((t, n) => {
                    t === e && !o.includes(n) && o.push(n);
                });
                if (!o.length) return;
                r += o.length;
                const s = document.createElement("details");
                s.className = "outline-branch ondeck-branch", s.dataset.ondeckTier = e, s.open = !0;
                const l = document.createElement("summary"), c = document.createElement("span"), d = document.createElement("span"), u = document.createElement("span");
                c.className = "outline-branch-disclosure", c.textContent = "›", c.setAttribute("aria-hidden", "true"), 
                d.className = "outline-branch-title", d.textContent = i, u.className = "outline-branch-count", 
                u.textContent = String(o.length), l.append(c, d, u), s.append(l);
                const p = document.createElement("div");
                p.className = "outline-rows", o.forEach(e => {
                    const t = n.get(e);
                    t && p.append(As(t, Go));
                }), s.append(p), s.addEventListener("toggle", () => __sxOnDeckPrune(s, e)), Ro.append(s);
            });
            const parkedEntries = (droppedKeyRecords[e] || []).filter(rec => rec && "string" == typeof rec.key && rec.key);
            if (parkedEntries.length) {
                const s = document.createElement("details");
                s.className = "outline-branch ondeck-branch ondeck-unresolved", s.open = !0;
                const l = document.createElement("summary"), c = document.createElement("span"), d = document.createElement("span"), u = document.createElement("span");
                c.className = "outline-branch-disclosure", c.textContent = "›", c.setAttribute("aria-hidden", "true"), 
                d.className = "outline-branch-title", d.textContent = "Unresolved imports", u.className = "outline-branch-count", 
                u.textContent = String(parkedEntries.length), l.append(c, d, u), s.append(l);
                const intro = document.createElement("p");
                intro.className = "ondeck-unresolved-intro", intro.textContent = "These came in with an import and match no current topic. Place each one by hand onto the topic it belongs to, and it lands with its imported value.", 
                s.append(intro);
                const p = document.createElement("div");
                p.className = "ondeck-unresolved-rows";
                const topicOptions = Object.keys(topicLabelById).map(id => ({
                    id: id,
                    label: topicLabelById[id]
                })).sort((a, b) => a.label.localeCompare(b.label));
                parkedEntries.forEach(rec => {
                    const row = document.createElement("div");
                    row.className = "ondeck-unresolved-row";
                    const info = document.createElement("div");
                    info.className = "ondeck-unresolved-info";
                    const label = document.createElement("span");
                    label.className = "ondeck-unresolved-label", label.textContent = __sxParkedGuess(rec);
                    const keyLine = document.createElement("span");
                    keyLine.className = "ondeck-unresolved-key", keyLine.textContent = rec.section && "ratings" !== rec.section ? `${rec.key} · from ${__sxParkedSectionNames[rec.section] || rec.section}` : rec.key, 
                    info.append(label, keyLine);
                    const picker = document.createElement("select");
                    picker.className = "ondeck-unresolved-select", picker.setAttribute("aria-label", `Place “${__sxParkedGuess(rec)}” (${rec.key}) on a topic`);
                    const placeholder = document.createElement("option");
                    placeholder.value = "", placeholder.textContent = "Choose a topic…", picker.append(placeholder), topicOptions.forEach(o => {
                        const opt = document.createElement("option");
                        opt.value = o.id, opt.textContent = o.label, picker.append(opt);
                    });
                    const apply = document.createElement("button");
                    apply.type = "button", apply.className = "action-btn ondeck-unresolved-apply", apply.textContent = "Place it", apply.addEventListener("click", () => {
                        const topicId = picker.value;
                        if (!topicId) return void picker.focus();
                        __sxPlaceParked(e, rec, topicId) && (row.remove(), u.textContent = String((droppedKeyRecords[e] || []).length), 
                        (droppedKeyRecords[e] || []).length || s.remove(), ws());
                    }), row.append(info, picker, apply), p.append(row);
                }), s.append(p), Ro.append(s);
            }
            if (!r && !parkedEntries.length) {
                const e = document.createElement("p");
                e.className = "ondeck-empty", e.textContent = "Nothing on deck — every imported topic in this profile is fully rated.", 
                Ro.append(e);
            }
        }
        document.getElementById("outlineShowOnDeck")?.addEventListener("change", e => {
            window.__sxOnDeck = Boolean(e.target.checked), e.target.checked || (__sxOnDeckTouched.clear(), __sxOnDeckCollapsed.clear()), Cs();
        });
        Ro.addEventListener("input", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (t) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
        Ro.addEventListener("click", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineMarkFlag");
            if (t) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
        Ro.addEventListener("keydown", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (t && ("Delete" === e.key || "Backspace" === e.key)) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
        window.addEventListener("pointerup", e => {
            if (!window.__sxOnDeck || !Go) return;
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (t) {
                const n = getOutlineRow(t);
                n && __sxOnDeckMarkTouched(n);
            }
        });
        function Cs(e = {}) {
            const t = Go;
            if (!t || t !== Et && !vt[t]) return;
            os.clear();
            if (window.__sxOnDeck) return __sxRenderOnDeck(t), void ws();
            // Build 2026-10-18_1549 — FetLife review mode (armed by the
            // post-import summary's “Rate the categories your kinks map
            // to” button): render only the mapped branches, collapsed.
            const sxReview = window.__sxFetLifeReview instanceof Set && window.__sxFetLifeReview.size ? window.__sxFetLifeReview : null;
            const i = Boolean(e.preserveDisclosure), a = i ? new Set(Array.from(Ro.querySelectorAll(".outline-branch[open]")).map(e => e.dataset.outlineBranch)) : null, r = i ? new Set(Array.from(Ro.querySelectorAll(".outline-branch.is-expanded")).map(e => e.dataset.outlineBranch)) : null, o = i ? new Set(Array.from(Ro.querySelectorAll('.outline-subcategory[data-subcategory-expanded="true"]')).map(e => e.dataset.outlineSubcategory)) : null, s = i ? new Set(Array.from(Ro.querySelectorAll('.outline-topic-label[data-outline-expandable="true"][aria-expanded="true"]')).map(e => __sxClosestAction(e, "outlineRow")?.dataset.outlineId).filter(Boolean)) : null, l = i ? new Map(Array.from(Ro.querySelectorAll(".outline-branch")).map(e => [ e.dataset.outlineBranch, Number(e.dataset.outlineVisible) || 3 ])) : new Map, c = i ? new Map(Array.from(Ro.querySelectorAll(".outline-subcategory")).map(e => [ e.dataset.outlineSubcategory, Number(e.dataset.outlineSubcategoryVisible) ]).filter(([, e]) => Number.isFinite(e) && e > 0)) : new Map;
            Oo.textContent = t === Et ? "New profile" : wt[t] || "Profile", Ro.replaceChildren(), 
            us(t).forEach(e => {
                const d = e.name, sxCatHit = Boolean(sxReview && sxReview.has(catId(d))), sxSubHit = Boolean(sxReview && (e.subcategories || []).some(s => sxReview.has(Un(d, s.name))));
                if (sxReview && !sxCatHit && !sxSubHit) return;
                const u = Boolean(e.risk), p = document.createElement("details");
                p.className = "outline-branch", p.dataset.outlineBranch = d, p.open = sxReview && !i ? !1 : !i || a.has(d);
                const h = document.createElement("summary"), g = document.createElement("span"), m = document.createElement("span"), f = document.createElement("span"), y = "Collapse or expand this branch. The topic total stays fixed for this list session.";
                if (g.className = "outline-branch-disclosure", g.textContent = "›", g.tabIndex = 0, 
                g.dataset.tooltipTapFirst = "", g.dataset.outlineDisclosureTooltip = y, g.setAttribute("aria-label", y), 
                g.setAttribute("aria-expanded", "false"), m.className = "outline-branch-title outline-description-trigger", m.setAttribute("role", "heading"), m.setAttribute("aria-level", "2"), 
                m.textContent = d, m.dataset.outlineDescription = lo({
                    id: catId(d),
                    label: d,
                    branch: d,
                    kind: "Category"
                }), u) {
                    const e = document.createElement("span");
                    e.className = "outline-risk", e.textContent = "*", e.setAttribute("aria-label", "Higher-risk practice requiring specialized knowledge and explicit negotiation"), 
                    m.append(e);
                }
                f.className = "outline-branch-count", h.append(g, m, f), p.append(h);
                const b = Es(ge[d], {
                    id: catId(d),
                    label: d,
                    branch: d,
                    kind: "Category"
                }, !0);
                b && (h.classList.add("has-popularity-icon"), g.after(b));
                const v = document.createElement("div");
                v.className = "outline-rows";
                const w = new Map, k = new Map, x = function(e = {}) {
                    const t = {
                        limit: Math.max(3, Number(e.limit) || 3),
                        categoryExpanded: Boolean(e.categoryExpanded),
                        eligibleIds: new Set,
                        expandedSubcategories: new Set(e.expandedSubcategoryIds || []),
                        subcategoryLimits: new Map(e.subcategoryLimits || []),
                        subcategoryOverviewLimits: new Map
                    };
                    return {
                        get limit() {
                            return t.limit;
                        },
                        isCategoryExpanded: () => t.categoryExpanded,
                        setCategoryExpanded: e => (t.categoryExpanded = Boolean(e), t.categoryExpanded),
                        setLimit: e => (t.limit = Math.max(3, Number(e) || 3), t.limit),
                        advance() {
                            return this.setLimit(t.limit + 3);
                        },
                        eligibleIds: e => (t.eligibleIds = new Set(e()), t.eligibleIds),
                        isSubcategoryExpanded: e => t.expandedSubcategories.has(e),
                        refreshSubcategoryOverview(e, n) {
                            t.subcategoryOverviewLimits.set(e, n), t.expandedSubcategories.has(e) || t.subcategoryLimits.set(e, n);
                        },
                        subcategoryLimit: e => t.subcategoryLimits.get(e) || 0,
                        setSubcategoryLimit: (e, n) => (t.subcategoryLimits.set(e, Math.max(0, Number(n) || 0)), t.subcategoryLimits.get(e) || 0),
                        toggleSubcategory: (e, n) => t.expandedSubcategories.has(e) ? (t.expandedSubcategories.delete(e), 
                        t.subcategoryLimits.set(e, t.subcategoryOverviewLimits.get(e) ?? 0), !1) : (t.expandedSubcategories.add(e), 
                        t.subcategoryLimits.set(e, n), !0)
                    };
                }({
                    limit: l.get(d),
                    categoryExpanded: !!r && r.has(d),
                    expandedSubcategoryIds: Array.from(o || []),
                    subcategoryLimits: c
                });
                e.topics.forEach((n, a) => {
                    const r = Vn(e, sxName(n));
                    let o = v, l = null;
                    if (r) {
                        const e = Un(d, r.name);
                        if (l = e, !w.has(e)) {
                            const t = document.createElement("div"), n = document.createElement("div"), i = document.createElement("span"), a = document.createElement("span"), o = document.createElement("span"), s = document.createElement("div"), l = "Shows the most popular kinks. Click to expand and show all kinks in this subcategory.";
                            t.className = "outline-subcategory", t.dataset.outlineSubcategory = e, t.dataset.subcategoryExpanded = x.isSubcategoryExpanded(e) ? "true" : "false", 
                            x.isSubcategoryExpanded(e) && t.classList.add("is-expanded"), i.className = "outline-branch-disclosure outline-subcategory-disclosure", 
                            i.textContent = "›", i.tabIndex = 0, i.dataset.tooltipTapFirst = "", i.dataset.outlineDisclosureTooltip = l, 
                            i.setAttribute("aria-label", l), i.setAttribute("role", "button"), i.setAttribute("aria-expanded", x.isSubcategoryExpanded(e) ? "true" : "false"), 
                            a.className = "outline-subcategory-title outline-description-trigger", a.textContent = r.name, 
                            a.dataset.outlineDescription = lo({
                                id: e,
                                label: r.name,
                                branch: d,
                                kind: "Subcategory"
                            }), o.className = "outline-subcategory-count", o.textContent = `0 of ${r.topics.length} shown`, 
                            n.className = "outline-subcategory-summary", n.setAttribute("role", "button"), n.tabIndex = 0, 
                            n.setAttribute("aria-expanded", x.isSubcategoryExpanded(e) ? "true" : "false"), 
                            s.className = "outline-subcategory-rows", n.append(i, a, o), t.append(n, s), v.append(t), 
                            w.set(e, {
                                group: t,
                                summary: n,
                                rows: s,
                                count: o,
                                name: r.name
                            });
                            const c = Es(Ae(r.name, d), {
                                id: e,
                                label: r.name,
                                branch: d,
                                kind: "Subcategory",
                                topics: r.topics
                            });
                            c && (n.classList.add("has-popularity-icon"), i.after(c));
                        }
                        o = w.get(e).rows;
                    }
                    const c = Wn(n), p = function(e, t = e => e) {
                        return U(e, e => sxTopicPopularity(e, t(e)?.label), e => {
                            const n = t(e) || e;
                            return n?.label || e;
                        });
                    }(ai(c, t).filter(e => (at[t] || {})[e]), e => (at[t] || {})[e]), h = i ? s.has(c) : (sxReview ? !1 : function(e, t) {
                        if (!e.length) return !1;
                        let n = !1, i = !0;
                        return e.forEach(e => {
                            const a = ca(e, t), r = Ge(e, t).keys.map(e => Boolean(a[e + "Known"]));
                            r.some(Boolean) && (n = !0), r.every(Boolean) || (i = !1);
                        }), n && !i;
                    }(p, t)), g = As({
                        id: c,
                        label: n,
                        branch: d,
                        kind: "Topic",
                        risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                        expandable: p.length > 0,
                        expanded: h
                    }, t);
                    if (g.dataset.outlineBranch = d, g.dataset.outlineTopicRank = String(e.outlineTopicRanks?.get(c) ?? a), 
                    l) {
                        const e = k.get(l) || 0;
                        g.dataset.outlineSubcategoryRank = String(e), k.set(l, e + 1);
                    }
                    o.append(g), p.forEach(e => {
                        const n = As({
                            id: e,
                            label: (at[t] || {})[e].label || e,
                            branch: d,
                            kind: "Imported",
                            risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                            parentId: c
                        }, t);
                        n.hidden = !h, o.append(n);
                    });
                });
                const S = document.createElement("button");
                S.type = "button", S.className = "outline-more", n(S, '<span class="outline-more-label"></span>'), 
                h.append(S), p.append(v), Ro.append(p);
                const $ = e => {
                    const n = Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineTopicRank) - Number(t.dataset.outlineTopicRank)), i = Array.from(v.querySelectorAll(".outline-row[data-outline-id]")), a = x.setLimit(e);
                    p.dataset.outlineVisible = String(a);
                    const r = x.eligibleIds(() => i.filter(e => !ls(e.dataset.outlineId, t) || os.has(e.dataset.outlineId)).map(e => e.dataset.outlineId)), o = n.filter(e => r.has(e.dataset.outlineId)), s = Math.min(o.length, a), l = new Set(o.slice(0, s).map(e => e.dataset.outlineId)), priorRated = Uo.checked ? n.filter(e => ls(e.dataset.outlineId, t) && !os.has(e.dataset.outlineId)) : [], c = new Set(o.slice(0, 3).map(e => e.dataset.outlineId));
                    priorRated.forEach(e => l.add(e.dataset.outlineId));
                    w.forEach((e, t) => {
                        const n = Array.from(e.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineSubcategoryRank) - Number(t.dataset.outlineSubcategoryRank)), i = x.isSubcategoryExpanded(t) ? n : n.filter(e => r.has(e.dataset.outlineId)), a = i.filter(e => c.has(e.dataset.outlineId)).length;
                        x.refreshSubcategoryOverview(t, a), i.slice(0, Math.min(i.length, x.subcategoryLimit(t))).forEach(e => l.add(e.dataset.outlineId)), 
                        e.localRows = n, e.localEligible = i;
                    }), n.forEach(e => {
                        const t = l.has(e.dataset.outlineId), isPriorRating = Uo.checked && priorRated.includes(e);
                        e.hidden = !t, e.style.order = isPriorRating ? "2" : "";
                        const n = e.querySelector('.outline-topic-label[data-outline-expandable="true"]'), i = n && "false" !== n.getAttribute("aria-expanded");
                        $s(v, e.dataset.outlineId).forEach(e => {
                            e.hidden = !t || !i || !r.has(e.dataset.outlineId), e.style.order = isPriorRating ? "2" : "";
                        });
                    });
                    const u = n.filter(e => !e.hidden), h = o.filter(e => !l.has(e.dataset.outlineId)).length;
                    f.textContent = `${u.length} of ${n.length} shown`;
                    const m = x.isCategoryExpanded();
                    p.classList.toggle("is-expanded", m), g.setAttribute("aria-expanded", String(m)), 
                    w.forEach((e, t) => {
                        const n = e.localRows.filter(e => !e.hidden).length;
                        e.localEligible.filter(e => !l.has(e.dataset.outlineId)).length, e.count.textContent = `${n} of ${e.localRows.length} shown`, 
                        e.group.dataset.outlineSubcategoryVisible = String(x.subcategoryLimit(t));
                        const i = x.isSubcategoryExpanded(t);
                        e.group.dataset.subcategoryExpanded = i ? "true" : "false", e.group.classList.toggle("is-expanded", i), 
                        e.summary.setAttribute("aria-expanded", String(i)), e.summary.querySelector(".outline-subcategory-disclosure")?.setAttribute("aria-expanded", String(i)), 
                        e.group.hidden = !i && 0 === n;
                    }), S.hidden = h <= 0, S.dataset.outlineVisible = String(a), S.setAttribute("aria-label", h > 0 ? `${ss} topics in ${d}` : `All available topics shown in ${d}`), 
                    S.querySelector(".outline-more-label").textContent = h > 0 ? ss : "";
                };
                w.forEach((e, t) => {
                    const n = () => {
                        const n = e.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        x.isSubcategoryExpanded(t) || getOutlineRows(e.rows).forEach(e => os.delete(e.dataset.outlineId)), 
                        x.toggleSubcategory(t, window.__sxFetLifeReview ? Math.min(3, n) : n), $(x.limit);
                    };
                    e.summary.addEventListener("click", e => {
                        e.preventDefault(), n();
                    }), e.summary.addEventListener("keydown", e => {
                        "Enter" !== e.key && " " !== e.key || __sxClosestAction(e.target, "outlineSubcategoryDisclosure") || (e.preventDefault(), 
                        n());
                    });
                }), p._syncOutlineVisibility = $, p.addEventListener("toggle", () => {
                    p.open ? (getOutlineRows(p).forEach(e => os.delete(e.dataset.outlineId)), 
                    $(x.limit)) : (p.classList.remove("is-expanded"), g.setAttribute("aria-expanded", "false"));
                });
                const E = () => {
                    if (p.open || (p.open = !0), x.isCategoryExpanded()) x.setCategoryExpanded(!1), 
                    w.forEach((e, t) => {
                        x.isSubcategoryExpanded(t) && x.toggleSubcategory(t, 0);
                    }), $(3); else {
                        x.setCategoryExpanded(!0), getOutlineRows(p).forEach(e => os.delete(e.dataset.outlineId));
                        const e = v.querySelectorAll(".outline-row[data-outline-topic-rank]").length;
                        $(Math.max(e, 3));
                    }
                };
                p._toggleOutlineCategory = E, h.addEventListener("click", e => {
                    e.preventDefault(), Rs && e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") === Rs || E();
                }), $(x.limit), S.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation();
                    const t = new Set(Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).filter(e => e.hidden));
                    $(x.advance());
                    const n = Array.from(v.querySelectorAll(".outline-row[data-outline-topic-rank]")).sort((e, t) => Number(e.dataset.outlineTopicRank) - Number(t.dataset.outlineTopicRank)).find(e => t.has(e) && !e.hidden)?.querySelector(".outline-topic-label");
                    n?.focus({
                        preventScroll: !0
                    });
                });
                const sxHits = window.__sxOutlineHits;
                if (sxHits && sxHits.size && !sxReview) {
                    sxHits.has(catId(d)) && (p.open = !0);
                    w.forEach((grp, subId) => {
                        if (!sxHits.has(subId)) return;
                        p.open = !0, x.isSubcategoryExpanded(subId) ? x.setSubcategoryLimit(subId, Math.max(3, x.subcategoryLimit(subId))) : x.toggleSubcategory(subId, 3);
                        const total = grp.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        if (total > 3) {
                            const btn = document.createElement("button");
                            btn.type = "button", btn.className = "outline-more outline-more-subcategory", btn.setAttribute("aria-label", `Show the next three popular topics in ${grp.name}`), n(btn, '<span class="outline-more-label">+3 more</span>'), btn.hidden = x.subcategoryLimit(subId) >= total, btn.addEventListener("click", ev => {
                                ev.preventDefault(), ev.stopPropagation(), x.setSubcategoryLimit(subId, Math.min(total, x.subcategoryLimit(subId) + 3)), $(x.limit), btn.hidden = x.subcategoryLimit(subId) >= total;
                            }), grp.rows.append(btn);
                        }
                    }), $(x.limit);
                }
                if (sxReview) {
                    // Review mode: branches stay collapsed (no auto-expand).
                    // When only some subcategories of this category were
                    // hit, hide the other subcategory groups and the
                    // category's own direct topic rows; hit subcategories
                    // get the same top-3 “+3 more” stepper the auto-expand
                    // path uses, revealed when the user expands them.
                    if (!sxCatHit) w.forEach((grp, subId) => {
                        sxReview.has(subId) || (grp.group.style.display = "none");
                    }), Array.from(v.querySelectorAll(":scope > .outline-row")).forEach(r => r.style.display = "none");
                    w.forEach((grp, subId) => {
                        if (!sxCatHit && !sxReview.has(subId)) return;
                        const total = grp.rows.querySelectorAll(":scope > .outline-row[data-outline-topic-rank]").length;
                        if (total > 3) {
                            const btn = document.createElement("button");
                            btn.type = "button", btn.className = "outline-more outline-more-subcategory", btn.setAttribute("aria-label", `Show the next three popular topics in ${grp.name}`), n(btn, '<span class="outline-more-label">+3 more</span>'), btn.hidden = x.subcategoryLimit(subId) >= total, btn.addEventListener("click", ev => {
                                ev.preventDefault(), ev.stopPropagation(), x.setSubcategoryLimit(subId, Math.min(total, x.subcategoryLimit(subId) + 3)), $(x.limit), btn.hidden = x.subcategoryLimit(subId) >= total;
                            }), grp.rows.append(btn);
                        }
                    });
                }
            }), ws();
        }
        function Ms(n = Vi()) {
            p("quickstart_started");
            const i = n === Et;
            if (!i && !vt[n]) return Vy = e => Ms(e), void bw(null);
            const a = i ? null : St(mt[n]).outline, r = cs(n);
            Jo = r.total > 0 && r.rated === r.total, t.clear(Xo), Xo = 0, Go = n, Ko = null, 
            Yo = 1e3 * (a?.durationSeconds || 0), Zo = Jo, Qo = Boolean(a?.timerRan) || !Zo, 
            Vo = Zo ? 0 : Date.now(), !Jo && Zo && (Zo = !1, Vo = Date.now(), Qo = !0), Uo.checked = !1, 
            e.byId("doneOutlineButton").textContent = i ? "Create profile from ratings" : "Submit what you’ve got", 
            pw(!i), Cs(), hs(), Zo || (Xo = t.setInterval(ws, 1e3));
            const o = e.byId("outlineQuickstartTip");
            o && (o.hidden = is), Wi(Do), Ro.scrollTop = 0, Ro.scrollLeft = 0, requestAnimationFrame(() => (Ro.scrollTop = 0, Ro.scrollLeft = 0, Do.querySelector("summary")?.focus()));
        }
        function Is(n = !0, skipPaint = !1) {
            if (!Do.open) return;
            sxOutlineSortMode = "popularity", window.__sxFetLifeReview = null;
            window.__sxOnDeckClear && window.__sxOnDeckClear();
            try {
                bs();
            } catch (e) { __sxErrLog("ui-refresh", e); }
            js(), pw(!1);
            const i = Go;
            if (n && i && vt[i] && Qo) {
                const e = cs(i);
                $t(i, "outline", ps(), e.rated, e.total, {
                    timerRan: !0
                });
            }
            t.clear(Xo), Xo = 0, Ui(Do), e.byId("doneOutlineButton").textContent = i === Et ? "Create profile from ratings" : "Submit what you’ve got", 
            Go = null, Ko = null, Vo = 0, Yo = 0, Zo = !0, Qs = !1, Qo = !1, Jo = !1;
            const a = zo;
            zo = null, Ys(a);
            const r = i === Et && Object.keys(At).length > 0;
            i && vt[i] || r ? (ji(i, {
                forceRated: !Bi(i)
            }), Jw(), skipPaint || (Mr({
                animate: !1,
                forceRepaint: !0
            }), Ih())) : skipPaint || Mr();
            let o = String(location.hash || "");
            try {
                o = decodeURIComponent(o);
            } catch (e) { __sxErrLog("hash-decode", e); }
            /^#\/?(app\/)?(?:list|listview)\/?$/i.test(o) && (history.replaceState(null, "", "#app"), 
            rS = !1), vc();
        }
        // Non-route list-close chunk + indicate (2026-10-28): the
        // Is() fix (Option 1) made route-bound closes skip Is()'s
        // paint entirely, but the NON-route closes — Submit, Escape,
        // backdrop, cancel — still paint once via Is(), synchronously
        // and unindicated. This wrapper gives exactly those closes
        // the route render's treatment, modeled on sxRouteRender:
        // arm the "Building your map…" overlay session
        // (__sxLoadSessionStart — its map-complete gate holds the
        // session through any settle/blit tail after the paint) and
        // the #9 paintbrush pill (__sxPillSessionStart/Finish), defer
        // the close behind the house double-rAF + setTimeout(0)
        // pattern so the armed state paints before work begins, and
        // set the one-shot __sxCloseChunkPaint flag immediately
        // before the close runs so Is()'s Mr consumes it and paints
        // chunked. The pill finishes on the overlay session's
        // onDone — the same completion signal sxRouteRender uses —
        // so pill, overlay and tail share exactly one window and
        // clear together. No button is marked: Submit and cancel are
        // dialog buttons that vanish at close, and Escape / backdrop
        // press no button at all, so there is no persistent button
        // for these closes. When either surface cannot arm (a
        // session is already active), or the map sits in its
        // safe-fallback state (jn — Mr would refuse the paint and no
        // checkpoint would ever drive an armed session), the close
        // runs exactly as before: synchronous, unflagged, inside
        // this call. Route-bound closes never pass through here —
        // the hashchange handler's skipPaint path is untouched.
        function sxChunkClose(run) {
            let pillToken = null, armed = !1;
            const pillDone = () => {
                if (!pillToken) return;
                const t = pillToken;
                pillToken = null;
                try {
                    window.__sxPillSessionFinish(t);
                } catch (e) { __sxErrLog("close-paint-pill-finish", e); }
            };
            if (!jn) try {
                if ("function" == typeof window.__sxPillSessionStart) pillToken = window.__sxPillSessionStart({
                    button: null
                });
                if ("function" == typeof window.__sxLoadSessionStart) armed = !!window.__sxLoadSessionStart({
                    onDone: pillDone
                });
            } catch (e) { __sxErrLog("close-paint-arm", e); }
            const doClose = () => {
                if (armed && Do.open) window.__sxCloseChunkPaint = 50;
                run();
                if (!armed) pillDone();
            };
            if (armed && window.requestAnimationFrame) requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(doClose, 0))); else doClose();
        }
        function Ps() {
            as = null, Ui(e.byId("outlinePayoffDialog"));
        }
        function Ls(t, n) {
            !(t && vt[t] && n) || n.rated < 1 || rs.has(t) || (rs.add(t), as = t, e.byId("outlinePayoffMessage").textContent = `${n.rated} topic${1 === n.rated ? " is" : "s are"} rated. Use them now, even if you want to finish the rest later.`, 
            Wi(e.byId("outlinePayoffDialog")), e.byId("outlinePayoffStory").hidden = Yi().length < 1, requestAnimationFrame(() => (Yi().length < 1 ? e.byId("outlinePayoffCard") : e.byId("outlinePayoffStory")).focus({
                preventScroll: !0
            })));
        }
        function Ts(e) {
            return e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY) ? {
                x: e.clientX,
                y: e.clientY,
                pointerType: e.pointerType || "mouse"
            } : null;
        }
        const Fs = (() => {
            const n = e.byId("uiTooltip"), i = e.byId("uiTooltipName"), a = e.byId("uiTooltipDefinition"), r = e.byId("uiTooltipValue");
            let o = null, s = null, l = 0;
            function c() {
                t.clear(l), l = 0, o?.isConnected && "uiTooltip" === o.getAttribute("aria-describedby") && o.removeAttribute("aria-describedby"), 
                o = null, s = null, n.classList.remove("ui-tooltip--panel"), n.hidden = !0, i.textContent = "", a.textContent = "", r.textContent = "", 
                n.parentNode !== document.body && document.body.appendChild(n);
            }
            function d(e = s, t = o) {
                s = e, t && t.isConnected && !n.hidden && function(e, t, n) {
                    if (!e || e.hidden) return;
                    const i = e.getBoundingClientRect(), a = 12, r = Math.max(8, innerWidth - i.width - 8), o = Math.max(8, innerHeight - i.height - 8);
                    let s, l;
                    if (t && Number.isFinite(t.x) && Number.isFinite(t.y)) "touch" === t.pointerType ? (s = t.x - i.width / 2, 
                    l = t.y - i.height - a - 10, l < 8 && (l = t.y + a + 10)) : (s = t.x + a, l = t.y + a, 
                    s + i.width > innerWidth - 8 && (s = t.x - i.width - a), l + i.height > innerHeight - 8 && (l = t.y - i.height - a)); else {
                        if (!n || !n.isConnected) return;
                        {
                            const e = n.getBoundingClientRect();
                            s = e.left + e.width / 2 - i.width / 2, l = e.bottom + 7, l + i.height > innerHeight - 8 && (l = e.top - i.height - 7);
                        }
                    }
                    e.style.left = `${Math.max(8, Math.min(r, s))}px`, e.style.top = `${Math.max(8, Math.min(o, l))}px`;
                }(n, s, t);
            }
            return {
                element: n,
                show: function(e, u = {}) {
                    if (!e) return void c();
                    const p = function(e, t = {}) {
                        const n = e?.dataset || {}, i = "string" == typeof t ? {
                            definition: t
                        } : t, a = i.name ?? n.tooltipName ?? function(e) {
                            const t = e?.dataset?.tooltipName;
                            if (t) return t;
                            const n = e?.getAttribute?.("aria-label") || "";
                            return n ? n.replace(/\.(?:\s|$)[\s\S]*$/, "").replace(/\s+(?:concept line|topic symbol|branch symbol)$/i, "").trim() : String(e?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90) || "Details";
                        }(e), r = i.definition ?? n.tooltipDefinition ?? n.uiTooltip ?? "", o = i.value ?? n.tooltipValue ?? "";
                        return {
                            name: String(a || "Details"),
                            definition: String(r || ""),
                            value: null == o ? "" : String(o)
                        };
                    }(e, u);
                    if (!p.name && !p.definition && !p.value) return void c();
                    t.clear(l), o && o !== e && o.isConnected && "uiTooltip" === o.getAttribute("aria-describedby") && o.removeAttribute("aria-describedby"), 
                    o = e, s = u.point ?? null, n.classList.toggle("ui-tooltip--panel", Boolean(e.closest && e.closest(".layout-editor"))), i.textContent = p.name, a.textContent = p.definition, 
                    a.hidden = !p.definition, r.textContent = p.value;
                    const h = (e.closest ? e.closest("dialog") : null) || (Do.open ? Do : document.body);
                    n.parentNode !== h && h.appendChild(n), n.hidden = !1, e.setAttribute("aria-describedby", "uiTooltip"), 
                    d(s, e), u.autoHide && (l = t.setTimeout(() => {
                        o === e && c();
                    }, Number(u.duration) || 3200));
                },
                hide: c,
                position: d,
                visibleFor: function(e) {
                    return !n.hidden && o === e;
                },
                get anchor() {
                    return o;
                },
                get point() {
                    return s;
                }
            };
        })();
        let Ns = null, _s = null, Ds = null, Rs = null, Os = 0;
        const Bs = window.matchMedia ? window.matchMedia("(hover: hover)") : {
            matches: !0
        };
        function js() {
            Ns && Fs.visibleFor(Ns) && Fs.hide(), Ns = null, _s = null;
        }
        function qs(e, t, n = null) {
            if (!e || !t) return void js();
            Ns = e, _s = n;
            const i = getOutlineRow(e), a = i?.dataset.outlineId, r = e.querySelector?.("[data-outline-direction]")?.dataset.outlineDirection, o = a && r ? ca(a, Go) : null, s = o && Boolean(o[r + "Known"]), l = e.dataset.tooltipValue || (r ? s ? ba(o[r]) : "Unrated" : /(?:rating|popularity)\s*([+-]?\d+(?:\.\d+)?(?:\/100|%)?)/i.exec(t)?.[1] || "");
            Fs.show(e, {
                name: e.dataset.tooltipName || Hs(e),
                definition: e.dataset.popularityTooltip ? t.split("\n").slice(1).join("\n") : t,
                value: l,
                point: n
            });
        }
        function Hs(e) {
            return e.dataset.popularityTooltip ? "Popularity" : e.dataset.ratingTooltip ? e.querySelector?.(".outline-rating-label")?.textContent?.trim() || "Rating" : getOutlineRow(e)?.querySelector?.(".outline-topic-label")?.textContent?.trim() || e.getAttribute("aria-label") || "Topic details";
        }
        function Ws(e, t) {
            qs(e, e?.dataset.outlineDescription || "", t);
        }
        function Us(e) {
            return e instanceof Element ? __sxClosestAction(e, "outlineTooltipSource") : null;
        }
        function Gs(e) {
            return e?.dataset.outlineDisclosureTooltip || e?.dataset.outlineDescription || e?.dataset.popularityTooltip || e?.dataset.ratingTooltip || "";
        }
        function Ks() {
            Ds?.timer && t.clear(Ds.timer), Ds = null;
        }
        function zs(e) {
            Rs = e, t.clear(Os), Os = t.setTimeout(() => {
                Rs = null;
            }, 900);
        }
        function Vs(e) {
            if ("true" !== e.dataset.outlineExpandable) return !1;
            const t = getOutlineRow(e), n = t?.dataset.outlineId;
            if (!n) return !1;
            const i = !("false" !== e.getAttribute("aria-expanded"));
            return e.setAttribute("aria-expanded", String(i)), $s(Ro, n).forEach(e => {
                e.hidden = !i;
            }), !0;
        }
        function Ys(e = zo) {
            if (e) {
                e.input.classList.remove("is-dragging", "is-clear-preview"), e.thumb?.remove();
                try {
                    e.input.hasPointerCapture?.(e.pointerId) && e.input.releasePointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
            }
        }
        function Xs(e) {
            const t = zo;
            if (!t || t.pointerId !== e.pointerId) return;
            const n = t.rect, i = e.clientX < n.left - 18 || e.clientX > n.right + 18;
            t.clear = i, t.input.classList.toggle("is-clear-preview", i), t.thumb.style.left = `${e.clientX}px`, 
            t.thumb.style.top = `${e.clientY}px`, t.thumb.style.background = i ? "var(--red-deep)" : zi(Number(t.input.value));
        }
        Ro.addEventListener("pointerover", e => {
            if ("mouse" !== e.pointerType || !Bs.matches) return;
            const t = Us(e.target);
            t && !t.contains(e.relatedTarget) && qs(t, Gs(t), Ts(e));
        }), Ro.addEventListener("pointermove", e => {
            if ("mouse" !== e.pointerType || !Ns || !Fs.visibleFor(Ns)) return;
            const t = Us(e.target);
            t && Ns === t && (_s = Ts(e), Fs.position(_s, Ns));
        }), Ro.addEventListener("pointerout", e => {
            if ("mouse" !== e.pointerType || !Bs.matches) return;
            const t = Us(e.target);
            if (!t || t.contains(e.relatedTarget)) return;
            const n = Us(e.relatedTarget);
            n ? qs(n, Gs(n), Ts(e)) : js();
        }), Ro.addEventListener("focusin", e => {
            const t = Us(e.target);
            t && qs(t, Gs(t));
        }), Ro.addEventListener("click", e => {
            const t = e.target instanceof Element ? __sxClosestAction(e.target, "glancePracticeIcon") : null;
            var n, i;
            t && (e.preventDefault(), e.stopPropagation(), n = t, i = Ts(e), qs(n, n?.dataset.popularityTooltip || "", i));
        }, !0), Ro.addEventListener("focusout", e => {
            const t = Us(e.target);
            t && !t.contains(e.relatedTarget) && js();
        }), Ro.addEventListener("selectstart", e => {
            e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") && e.preventDefault();
        }), Ro.addEventListener("contextmenu", e => {
            e.target instanceof Element && __sxClosestAction(e.target, "outlineDescTrigger") && e.preventDefault();
        }), Ro.addEventListener("pointerdown", e => {
            if (e.target instanceof Element && __sxClosestAction(e.target, "glancePracticeIcon")) return;
            const n = e.target instanceof Element ? __sxClosestAction(e.target, "outlineDescTriggerRich") : null;
            if (!n) return Ks(), void js();
            if (("mouse" === e.pointerType || "pen" === e.pointerType) && 0 !== e.button) return;
            Ks();
            const i = {
                pointerId: e.pointerId,
                trigger: n,
                startX: e.clientX,
                startY: e.clientY,
                longPressed: !1,
                timer: 0
            };
            i.timer = t.setTimeout(() => {
                Ds === i && (i.longPressed = !0, zs(n), Ws(n, {
                    x: i.startX,
                    y: i.startY,
                    pointerType: e.pointerType || "touch"
                }));
            }, 520), Ds = i;
        }), window.addEventListener("pointermove", e => {
            const t = Ds;
            if (t && t.pointerId === e.pointerId) return t.longPressed ? (_s = Ts(e), void Fs.position(_s, Ns)) : void (Math.hypot(e.clientX - t.startX, e.clientY - t.startY) > 9 && Ks());
        }, !0), window.addEventListener("pointerup", e => {
            const n = Ds;
            n && n.pointerId === e.pointerId && (n.timer && t.clear(n.timer), n.longPressed && zs(n.trigger), 
            Ds = null);
        }, !0), window.addEventListener("pointercancel", Ks, !0), Ro.addEventListener("contextmenu", e => {
            const t = __sxClosestAction(e.target, "outlineDescTriggerRich");
            t && Rs === t && (e.preventDefault(), e.stopPropagation());
        }, !0), Ro.addEventListener("click", e => {
            const n = __sxClosestAction(e.target, "outlineDescTriggerRich");
            if (n) return Rs === n ? (Rs = null, t.clear(Os), e.preventDefault(), void e.stopPropagation()) : void (__sxClosestAction(n, "summaryAncestor") ? js() : Vs(n) && (e.preventDefault(), 
            e.stopPropagation()));
        }), Ro.addEventListener("keydown", e => {
            const t = __sxClosestAction(e.target, "outlineBranchDisclosure");
            if (t && ("Enter" === e.key || " " === e.key)) {
                e.preventDefault(), e.stopPropagation();
                const n = __sxClosestAction(t, "outlineSubcategory");
                if (n) return void n.querySelector(":scope>.outline-subcategory-summary")?.click();
                const i = __sxClosestAction(t, "outlineBranch");
                return void (i && (i._toggleOutlineCategory ? i._toggleOutlineCategory() : i.open = !i.open));
            }
            const n = __sxClosestAction(e.target, "outlineDescTriggerRich");
            if (n && ("Enter" === e.key || " " === e.key)) return e.shiftKey ? (e.preventDefault(), 
            e.stopPropagation(), void (Ns === n && Fs.visibleFor(n) ? js() : Ws(n))) : void (__sxClosestAction(n, "summaryAncestor") || Vs(n) && (e.preventDefault(), 
            e.stopPropagation()));
        }), Ro.addEventListener("scroll", js, {
            passive: !0
        }), Ro.addEventListener("input", e => {
            const t = __sxClosestAction(e.target, "outlineNoteInput");
            if (t && Go) {
                const e = getOutlineRow(t), n = e.dataset.outlineId, i = t.value.trim();
                tt[Go] || (tt[Go] = {}), i ? tt[Go][n] = [ i ] : delete tt[Go][n], zt(Go);
                const a = getOutlineCell(e, "note");
                return void (a && (a.dataset.hasNote = String(Boolean(i))));
            }
            const n = __sxClosestAction(e.target, "outlineDirection");
            if (!n || !Go) return;
            const i = getOutlineRow(n).dataset.outlineId;
            "milestoneStartRated" in n.dataset || (n.dataset.milestoneStartRated = String(cs(Go).rated)), 
            To(i, n.dataset.outlineDirection, Number(n.value), !1, Go), os.add(i), Ss(getOutlineRow(n)), 
            ws();
        }), Ro.addEventListener("change", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            const n = Number(t.dataset.milestoneStartRated);
            delete t.dataset.milestoneStartRated, os.add(getOutlineRow(t).dataset.outlineId), checkMilestoneTransition(Go, n);
        }), Ro.addEventListener("click", e => {
            const t = __sxClosestAction(e.target, "outlineNote");
            if (t && Go) {
                const e = getOutlineRow(t), n = e.querySelector(".outline-note-editor"), i = n.hidden;
                return n.hidden = !i, t.setAttribute("aria-expanded", String(i)), void (i && requestAnimationFrame(() => getOutlineCell(e, "note-input")?.focus({
                    preventScroll: !0
                })));
            }
            const n = __sxClosestAction(e.target, "outlineMarkFlag");
            if (!n || !Go) return;
            const previousRatedCount = cs(Go).rated, i = getOutlineRow(n), a = i.dataset.outlineId;
            if (n.dataset.outlineFlag) {
                const e = "fantasy" === n.dataset.outlineFlag ? Je : et;
                e[Go] || (e[Go] = {}), e[Go][a] ? delete e[Go][a] : e[Go][a] = !0;
            } else {
                const e = n.dataset.outlineMark, t = (Qe[Go] || {})[a] || "";
                Qe[Go][a] = t === e ? "" : e, Qe[Go][a] || delete Qe[Go][a];
            }
            zt(Go), os.add(a), Ss(i), ws(), vc(), checkMilestoneTransition(Go, previousRatedCount);
        }), Ro.addEventListener("keydown", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            if (gs(), "Delete" !== e.key && "Backspace" !== e.key) return;
            e.preventDefault();
            const n = getOutlineRow(t);
            Fo(n.dataset.outlineId, t.dataset.outlineDirection, !1, Go), ls(n.dataset.outlineId, Go) ? os.add(n.dataset.outlineId) : os.delete(n.dataset.outlineId), 
            Ss(n), ws();
        }), Ro.addEventListener("pointerdown", e => {
            const t = __sxClosestAction(e.target, "outlineDirection");
            if (!t || !Go) return;
            gs(), Ys();
            const n = document.createElement("span");
            n.className = "outline-drag-thumb", n.setAttribute("aria-hidden", "true"), document.body.append(n), 
            zo = {
                input: t,
                rect: t.getBoundingClientRect(),
                pointerId: e.pointerId,
                clear: !1,
                thumb: n
            }, t.classList.add("is-dragging");
            try {
                t.setPointerCapture(e.pointerId);
            } catch (e) { __sxErrLog("pointer-capture", e); }
            Xs(e);
        }), window.addEventListener("pointermove", Xs, !0), window.addEventListener("pointerup", e => {
            if (!zo || zo.pointerId !== e.pointerId) return;
            Xs(e);
            const t = zo, {input: n, clear: i} = t;
            if (zo = null, Ys(t), !Go) return;
            const previousRatedCount = Number(n.dataset.milestoneStartRated), a = getOutlineRow(n);
            delete n.dataset.milestoneStartRated, i ? Fo(a.dataset.outlineId, n.dataset.outlineDirection, !1, Go) : To(a.dataset.outlineId, n.dataset.outlineDirection, Number(n.value), !1, Go), 
            Ss(a), ws(), ls(a.dataset.outlineId, Go) ? os.add(a.dataset.outlineId) : os.delete(a.dataset.outlineId), 
            checkMilestoneTransition(Go, previousRatedCount);
        }, !0), window.addEventListener("pointercancel", e => {
            if (!zo || zo.pointerId !== e.pointerId) return;
            const t = zo;
            zo = null, Ys(t);
        }, !0);
        let Zs = 0, Qs = !1;
        function Js(e, t = {}) {
            // Tab-switch camera fix (2026-10-30): profile activation
            // re-renders via Mr() but never refit, so the camera kept
            // whatever zoom/pan the previous view left behind. Refit
            // on activation, the same fitted state a fresh load ends
            // in; Ih()'s settle chain re-fits again if this render
            // paints in chunks. Detail level and profile data are
            // untouched.
            if (!vt[e]) return;
            kw(), xw(), Sw(), sxDeactivateMatchStage(), wf && Lw(), It = e, Mt = e, Nt = null, Jw();

            // Layer Vault (Step 1): If this profile was already rendered with
            // identical state, restore its DOM fragment instantly (< 5ms).
            if (sxVaultTryRestore(e)) {
                try { vc(); } catch (_) {}
                window.__sxLoad && window.__sxLoad(100);
                try { Ih(); } catch (_) {}
                return;
            }

            const name = (wt && wt[e]) || e;
            window.__sxRouteChunkPaint = 40;
            if (typeof window.__sxLoadSessionStart === "function") {
                window.__sxLoadSessionStart({
                    label: "Loading " + name + "…"
                });
            }
            const r = Mr({
                animate: !1,
                forceRepaint: !0
            });
            if (r && typeof r.then === "function") {
                r.then(() => { Ih(); });
            } else {
                Ih();
            }
        }
        function el(e) {
            if (!vt[e]) return;
            const t = an;
            en.has(e) ? sxSel(e, "remove") : (!en.size && Mt && vt[Mt] && (sxSel(Mt), la(Mt)), sxSel(e), 
            la(e)), qd = [], Wd = null, Jw();
            if (t) {
                window.__sxRouteChunkPaint = 40;
                if (typeof window.__sxLoadSessionStart === "function") {
                    window.__sxLoadSessionStart({
                        label: "Comparing profiles…"
                    });
                }
                const r = Mr({
                    animate: !1,
                    forceRepaint: !0
                });
                if (r && typeof r.then === "function") {
                    r.then(() => { Ih(); });
                } else {
                    Ih();
                }
            }
        }
        Ho.addEventListener("click", () => {
            const e = Date.now();
            e - Zs < 300 || (Zs = e, Qs = !1, ks(!Zo));
        }), document.addEventListener("visibilitychange", () => {
            document.hidden ? Zo || (Qs = !0, ZoAuto = !0, ks(!0)) : Qs && (Qs = !1, ZoAuto = !1, ks(!1));
        }), Wo.addEventListener("click", function() {
            Do.open && Go && (Qs = !1, Yo = 0, Vo = Date.now(), Qo = !0, Zo = !1, t.clear(Xo), 
            Xo = t.setInterval(ws, 1e3), hs(), ws());
        }), Uo.addEventListener("change", () => {
            const n = !Zo;
            ks(Uo.checked), Uo.checked && n && function() {
                try {
                    let n = e.byId("outlineTimerPauseNote");
                    n || (n = document.createElement("div"), n.id = "outlineTimerPauseNote", n.setAttribute("role", "status"), 
                    n.style.cssText = "position:fixed;z-index:9999;pointer-events:none;opacity:0;transition:opacity .3s ease;background:var(--panel,#222);color:var(--ink,#fff);border:1px solid var(--line-strong,#666);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.45);max-width:92vw;overflow:hidden;text-overflow:ellipsis;", 
                    document.body.appendChild(n)), n.textContent = "Timer paused — showing rated topics";
                    const i = e.byId("outlineTimerToggle");
                    if (i) {
                        const e = i.getBoundingClientRect(), t = Math.max(8, Math.min(window.innerWidth - 8, e.left + e.width / 2));
                        n.style.left = t + "px", n.style.transform = "translateX(-50%)", n.style.top = Math.min(window.innerHeight - 60, e.bottom + 8) + "px";
                    }
                    xs && t.clear(xs), requestAnimationFrame(() => {
                        try {
                            n.style.opacity = "1";
                        } catch (e) { __sxErrLog("label-flash", e); }
                    }), xs = t.setTimeout(() => {
                        try {
                            n.style.opacity = "0";
                        } catch (e) { __sxErrLog("label-flash", e); }
                        xs = 0;
                    }, 3e3);
                } catch (e) { __sxErrLog("label-flash", e); }
            }(), Ro.querySelectorAll(".outline-branch").forEach(e => e._syncOutlineVisibility?.(Number(e.dataset.outlineVisible) || 3));
        }), e.byId("outlineQuickstartDismiss")?.addEventListener("click", () => {
            is = !0, e.byId("outlineQuickstartTip").hidden = !0;
        }), e.byId("doneOutlineButton") && e.byId("doneOutlineButton").addEventListener("click", function() {
            if (!Do.open || !Go) return;
            const e = Go, t = cs(e), n = ps(), i = Qo;
            if (e === Et) return Vy = e => {
                i && $t(e, "outline", n, t.rated, t.total, {
                    timerRan: !0
                }), requestAnimationFrame(() => Ls(e, t));
            }, sxChunkClose(() => {
                Is(!1), bw(null), sm.textContent = `Create a profile to keep ${t.rated} rated topic${1 === t.rated ? "" : "s"}.`;
            });
            i && $t(e, "outline", n, t.rated, t.total, {
                timerRan: !0
            }), hw("save", e), sxChunkClose(() => {
                Is(!1), xg.textContent = `Submitted ${t.rated} of over 400 topics${i ? ` after ${xt(n)} total` : ""}. Ratings${i ? " and accumulated time" : ""} saved with ${wt[e]}.`, 
                requestAnimationFrame(() => Ls(e, t));
            });
        }), Do.addEventListener("cancel", e => {
            e.preventDefault(), sxChunkClose(() => Is());
        }), /* Build 2026-10-18_0343: the list view has no × button — a tap/click that starts and ends on the dialog backdrop closes it; Escape closes via the cancel handler above. */ Do.addEventListener("pointerdown", e => {
            Do._bk = e.target === Do;
        }), Do.addEventListener("click", e => {
            Do._bk && e.target === Do && sxChunkClose(() => Is()), Do._bk = !1;
        }), e.byId("startListRatingButton")?.addEventListener("click", () => {
            Ms(Vi());
        });
        const tl = e.byId("profileTabs");
        let nl = null, il = null, al = null, rl = 0, ol = null, tfHide = 0;
        function sl() {
            nl && Fs.visibleFor(nl) && Fs.hide(), nl = null, il = null;
        }
        function ll(e = nl, t = il) {
            e && Fs.visibleFor(e) && Fs.position(t, e);
        }
        function cl(e, t = !1, n = null) {
            const i = e?.dataset?.uiTooltip;
            i && (nl = e, il = n, Fs.show(e, {
                name: e.dataset.tooltipName,
                definition: e.dataset.tooltipDefinition || i,
                value: e.dataset.tooltipValue,
                point: n,
                autoHide: t
            }));
        }
        const dl = window.matchMedia ? window.matchMedia("(hover: hover)") : {
            matches: !0
        };
        function ul(e) {
            e && "true" !== e.dataset.mapTooltipBound && (e.dataset.mapTooltipBound = "true", 
            e.addEventListener("pointerenter", t => {
                !dl.matches || t.pointerType && "mouse" !== t.pointerType || cl(e, !1, Ts(t));
            }), e.addEventListener("pointermove", t => {
                nl !== e || !Fs.visibleFor(e) || !dl.matches || t.pointerType && "mouse" !== t.pointerType || (il = Ts(t), 
                ll());
            }), e.addEventListener("pointerleave", t => {
                nl !== e || t.relatedTarget && e.contains(t.relatedTarget) || sl();
            }));
        }
        const pl = e => e && e.closest ? __sxClosestAction(e, "uiTooltip") : null;
        document.addEventListener("pointerover", e => {
            if (!dl.matches || e.pointerType && "mouse" !== e.pointerType) return;
            const t = pl(e.target);
            t && cl(t, !1, Ts(e));
        }), document.addEventListener("pointermove", e => {
            if (!nl || !Fs.visibleFor(nl)) return;
            const t = pl(e.target);
            ("mouse" === e.pointerType && t === nl || "mouse" !== e.pointerType && nl.contains(e.target)) && (il = Ts(e), 
            ll());
        }), document.addEventListener("pointerout", e => {
            if (!dl.matches || e.pointerType && "mouse" !== e.pointerType) return;
            if (!pl(e.target)) return;
            const t = pl(e.relatedTarget);
            t ? cl(t, !1, Ts(e)) : sl();
        }), document.addEventListener("focusin", e => {
            const t = e.target.closest && __sxClosestAction(e.target, "uiTooltip");
            t && cl(t);
        }), document.addEventListener("focusout", e => {
            e.target.closest && __sxClosestAction(e.target, "uiTooltip") && (e.relatedTarget && e.relatedTarget.closest && __sxClosestAction(e.relatedTarget, "uiTooltip") || sl());
        }), window.__sxOnPtr( e => {
            if (nl && Fs.visibleFor(nl) && !nl.contains(e.target) && sl(), "mouse" === e.pointerType) return;
            const t = e.target.closest && __sxClosestAction(e.target, "uiTooltipHover");
            t && cl(t, !0, Ts(e));
        }, !0), document.addEventListener("pointerdown", e => {
            if ("mouse" === e.pointerType) return;
            const el = __sxClosestAction(e.target, "tooltipTapFirst");
            if (!el) return;
            const useCard = Boolean(el.dataset && el.dataset.uiTooltip), useOutline = !useCard && Boolean(Gs(el));
            if (!useCard && !useOutline) return;
            const n = performance.now();
            if (al === el && n < rl) return al = null, rl = 0, ol = null, t.clear(tfHide), tfHide = 0, void (sl(), js());
            al = el, rl = n + 3200, ol = el, useCard ? cl(el, !0, Ts(e)) : qs(el, Gs(el), Ts(e)), t.clear(tfHide), tfHide = t.setTimeout(() => {
                al === el && (al = null, rl = 0), useOutline && Ns === el && js();
            }, 3400), e.preventDefault(), e.stopImmediatePropagation();
        }, !0), document.addEventListener("click", e => {
            const el = __sxClosestAction(e.target, "tooltipTapFirst");
            el && ol === el && (ol = null, e.preventDefault(), e.stopImmediatePropagation());
        }, !0), addEventListener("resize", () => {
            nl && Fs.visibleFor(nl) && ll();
        });
        let hl = 0;
        function gl() {
            hl && cancelAnimationFrame(hl), hl = requestAnimationFrame(() => {
                hl = 0;
                const e = Array.from(tl.querySelectorAll(".profile-tab")), t = e.map(e => e.querySelector("[data-profile-label]")), n = matchMedia("(max-width:620px)").matches;
                if (tl.classList.remove("is-wrapped"), e.forEach(e => e.style.removeProperty("--profile-tab-width")), 
                t.forEach(e => {
                    e.textContent = e.dataset.fullLabel || "";
                }), !n || !e.length) return;
                const i = tl.querySelector(".profile-add-stack"), a = Math.max(0, tl.clientWidth - 6), r = i ? Math.ceil(i.getBoundingClientRect().width) : 42, o = 2 * (e.length + 1), s = [ {
                    name: "full",
                    labels: t.map(e => e.dataset.fullLabel || ""),
                    widths: t.map(e => Math.max(96, Math.min(180, 70 + 7 * (e.dataset.fullLabel || "").length)))
                }, {
                    name: "short",
                    labels: t.map(e => (e.dataset.fullLabel || "").slice(0, 3)),
                    widths: t.map(() => 82)
                }, {
                    name: "initial",
                    labels: t.map(e => (e.dataset.fullLabel || "").slice(0, 1)),
                    widths: t.map(() => 70)
                } ];
                let l = s.find(e => e.widths.reduce((e, t) => e + t, r + o) <= a) || s[s.length - 1];
                l.labels.forEach((e, n) => {
                    t[n] && (t[n].textContent = e);
                }), e.forEach((e, t) => e.style.setProperty("--profile-tab-width", l.widths[t] + "px")), 
                l.widths.reduce((e, t) => e + t, r + o) > a && tl.classList.add("is-wrapped");
            });
        }
        addEventListener("resize", gl), "ResizeObserver" in window && new ResizeObserver(gl).observe(tl);
        let ml = null, fl = null, yl = !1, bl = null, vl = 0;
        function wl() {
            yl = !0, t.clear(bl), bl = t.setTimeout(() => {
                yl = !1;
            }, 800);
        }
        function kl() {
            fl && (t.clear(fl), fl = null), ml = null;
        }
        tl.addEventListener("pointerdown", e => {
            const n = __sxClosestAction(e.target, "viewButton");
            if (n && 0 === e.button) if (e.ctrlKey || e.metaKey) kl(); else {
                kl(), ml = {
                    pointerId: e.pointerId,
                    id: n.dataset.view,
                    startX: e.clientX,
                    startY: e.clientY
                };
                try {
                    n.setPointerCapture(e.pointerId);
                } catch (e) { __sxErrLog("pointer-capture", e); }
                fl = t.setTimeout(() => {
                    if (!ml || ml.pointerId !== e.pointerId) return;
                    const t = ml.id;
                    vl = Date.now(), wl(), el(t);
                }, 360);
            }
        }), tl.addEventListener("pointermove", e => {
            ml && ml.pointerId === e.pointerId && Math.hypot(e.clientX - ml.startX, e.clientY - ml.startY) > 14 && kl();
        }), tl.addEventListener("pointerup", kl), tl.addEventListener("pointercancel", kl), 
        tl.addEventListener("lostpointercapture", kl), tl.addEventListener("keydown", e => {
            if (__sxClosestAction(e.target, "profileNameInput")) return void ("Enter" === e.key ? (e.preventDefault(), 
            tk()) : "Escape" === e.key && (e.preventDefault(), Xw && (Xw = null, Jw())));
            const t = __sxClosestAction(e.target, "viewButton");
            t && (!(e.shiftKey || e.ctrlKey || e.metaKey) || "Enter" !== e.key && " " !== e.key ? !e.altKey || "Enter" !== e.key && " " !== e.key || (e.preventDefault(), 
            bw(t.dataset.view)) : (e.preventDefault(), el(t.dataset.view)));
        }), tl.addEventListener("focusout", e => {
            const n = __sxClosestAction(e.target, "profileNameInput");
            if (!n) return;
            const i = Xw;
            t.setTimeout(() => {
                Xw === i && document.activeElement !== n && tk();
            }, 0);
        }), tl.addEventListener("contextmenu", e => {
            const t = __sxClosestAction(e.target, "viewButton");
            if (!t) return;
            e.preventDefault();
            const n = Date.now() - vl < 900;
            kl(), n || (vl = Date.now(), wl(), el(t.dataset.view));
        }), tl.addEventListener("click", t => {
            const n = __sxClosestAction(t.target, "profileVeil");
            if (n) {
                const e = n.dataset.profileVeil;
                return dv.hidden || Qt !== e || bv !== n ? (Qt = e, bv = n, Mv(), void Av(!0, !0)) : void Cv();
            }
            const i = __sxClosestAction(t.target, "saveProfile");
            if (i) return void Jf(i.dataset.saveProfile);
            const a = __sxClosestAction(t.target, "closeProfile");
            if (a) return void function(t, n) {
                if (!vt[t]) return;
                if (kw(), xw(), !yt[t]) return void nk(t);
                const i = e.byId("rememberProfileCheckbox2x"), a = Boolean(i && i.checked);
                vm.hidden = !a, wf = t, bm.textContent = a ? "Save or discard changes?" : "Discard changes?", 
                e.byId("closeProfileQuestion").textContent = a ? `Save ${wt[t]} on this device before closing, or discard its unsaved changes?` : `Close ${wt[t]} and lose its unsaved changes?`, 
                Wi(ym), requestAnimationFrame(() => {
                    const t = n && n.getBoundingClientRect(), i = ym.offsetWidth, r = ym.offsetHeight, o = t ? Math.max(8, Math.min(innerWidth - i - 8, t.right - i)) : Math.max(8, innerWidth - i - 12), s = t ? Math.max(8, Math.min(innerHeight - r - 8, t.bottom + 6)) : 12;
                    ym.style.left = `${o}px`, ym.style.top = `${s}px`, (a ? vm : e.byId("discardClosingProfile")).focus();
                });
            }(a.dataset.closeProfile, a);
            const r = __sxClosestAction(t.target, "profileLoad");
            if (r) return void function(e, t) {
                if (!vt[e]) return;
                const n = !Oy.hidden && qy === e;
                if (kw(), xw(), Sw(), n) return;
                // Activate-first (shell-ui stage, 2026-10-27, owner
                // ruling correcting the split-center no-switch phase):
                // pressing Load on a background tab SWITCHES the
                // viewport to that tab first (Js) — before the menu
                // opens and before any dialog the menu leads to. Only
                // then is the pressed tab recorded as the menu's
                // origin (qy). The origin remains the explicit target
                // of every Load path below; activation makes the
                // displayed profile that same profile, it does not
                // replace the origin as the targeting mechanism.
                // (Js closes menus as part of switching, so it must
                // run before qy is set and the menu is shown.)
                e !== Mt && Js(e), qy = e, Oy.hidden = !1;
                const i = [ ...tl.querySelectorAll("[data-profile-load]") ].find(t => t.dataset.profileLoad === e) || t;
                i.setAttribute("aria-expanded", "true"), Oy.setAttribute("aria-label", `Load or import data for ${wt[e]}`), 
                $w(Oy, i), Oy.querySelector("button").focus({
                    preventScroll: !0
                });
            }(r.dataset.profileLoad, r);
            const sxMo = t.target.closest && t.target.closest("[data-sx-match-open]");
            if (sxMo) return void sxOpenMatchTab(sxMo.dataset.sxMatchOpen);
            const sxMb = t.target.closest && t.target.closest("[data-sx-match-tab-btn]");
            if (sxMb) return void sxActivateMatchTab(sxMb.dataset.sxMatchTabBtn, !0);
            const sxMc = t.target.closest && t.target.closest("[data-sx-match-close]");
            if (sxMc) return void sxCloseMatchTab(sxMc.dataset.sxMatchClose);
            const sxHb = __sxClosestAction(t.target, "profileHeat");
            if (sxHb) return void sxToggleHeatPopover(sxHb.dataset.profileHeat, sxHb);
            const s = __sxClosestAction(t.target, "addProfile");
            if (s) return void Pw(s);
            const l = __sxClosestAction(t.target, "viewButton");
            if (!l) return;
            if (yl) return yl = !1, void t.preventDefault();
            const c = l.dataset.view;
            if (t.ctrlKey || t.metaKey) return t.preventDefault(), kl(), void el(c);
            yl = !1, c !== Mt && Js(c);
        }), e.byId("overlayTab") && e.byId("overlayTab").addEventListener("click", () => {
            if (!an) return;
            sxVaultInvalidate();
            sxSel(null, "dismiss"), Jw(), Mr(), Ih();
        }), e.all("[data-filter]").forEach(t => t.addEventListener("click", () => {
            "true" !== t.getAttribute("aria-disabled") && !Rt && (sxVaultInvalidate(), Pt = t.dataset.filter, e.all("[data-filter]").forEach(e => e.setAttribute("aria-pressed", String(e === t))),
            Mr());
        }));
        const xl = e.byId("blindModeToggle");
        xl && xl.addEventListener("click", () => function(e, {render: t = !0} = {}) {
            sxVaultInvalidate();
            const n = Boolean(e) && Fa();
            n !== Rt ? (n ? (Ot = Pt, Pt = "mutual", Nt = null, so()) : Pt = Ot || "all", Rt = n, 
            Da(), t && Mr({
                animate: !1
            })) : Da();
        }(!Rt)), function() {
            const t = e.byId("shareOverlapBtn"), n = e.byId("overlapShareDialog"), i = e.byId("closeOverlapShare");
            t && n && t.addEventListener("click", () => {
                Ui(e.one("dialog[open]")), Wi(n);
            }), i && n && i.addEventListener("click", () => Ui(n));
            const a = e.byId("overlapSharePerson"), r = e.byId("overlapShareCouple");
            a && a.addEventListener("click", () => {
                Ui(n), Er("person");
            }), r && r.addEventListener("click", () => {
                Ui(n), Er("couple");
            }), n && n.addEventListener("click", e => {
                e.target === n && Ui(n);
            });
        }();
        const Sl = e.byId("localCommunitiesDialog"), $l = e.byId("localCommunityConsentRow"), El = e.byId("localCommunityStatus"), Al = e.byId("localCommunityResults"), Cl = e.byId("localCommunityPlace"), Ml = e.byId("localFetlifeLinks"), Il = e.byId("localRedditLinks"), Pl = e.byId("nationalCommunityList");
        let Ll = !1, Tl = null, Fl = null;
        function Nl(e, t, n) {
            const i = document.createElement("a");
            i.href = n, i.target = "_blank", i.rel = "noopener noreferrer", i.textContent = t, 
            e.append(i);
        }
        function _l(e, t, n = "") {
            return `${e}${encodeURIComponent(t)}${n}`;
        }
        function Dl(e) {
            const t = (e && e.city || "").trim(), n = (e && e.state || "").trim(), i = [ t, n ].filter(Boolean).join(", "), a = t || n;
            if (Ml.replaceChildren(), Il.replaceChildren(), !a) return Cl.textContent = "Area name unavailable", 
            void (Al.hidden = !0);
            if (Cl.textContent = i, t && Nl(Ml, `Groups in ${t}`, _l("https://fetlife.com/groups/search?q=", t)), 
            n && n !== t && Nl(Ml, `Groups in ${n}`, _l("https://fetlife.com/groups/search?q=", n)), 
            Nl(Ml, "Search area places & events", _l("https://fetlife.com/groups/search?q=", `${a} events`)), 
            Nl(Il, `Search Reddit for ${a} kink communities`, _l("https://www.reddit.com/search/?q=", `${a} kink`, "&type=sr")), 
            t) {
                const e = t.toLowerCase().replace(/[^a-z0-9]+/g, "");
                e && Nl(Il, `Search for r/${e}kink`, _l("https://www.reddit.com/search/?q=", `r/${e}kink`, "&type=sr"));
            }
            (function() {
                Pl.replaceChildren();
                const e = function(e = 5) {
                    const t = Vi();
                    if (!t || !vt[t]) return [];
                    const n = [];
                    h.forEach(e => e.topics.forEach(e => {
                        const i = Wn(e), a = ca(i, t), r = "favorite" === Qe[t]?.[i], o = Math.max(a.giveKnown ? a.give : -101, a.receiveKnown ? a.receive : -101, r ? 101 : -101), s = de(e, "fetlife");
                        o > 0 && s && s.url && n.push({
                            label: e,
                            score: o,
                            community: s
                        });
                    })), ri().forEach(e => {
                        const i = ca(e.id, t), a = "favorite" === Qe[t]?.[e.id], r = Math.max(i.giveKnown ? i.give : -101, i.receiveKnown ? i.receive : -101, a ? 101 : -101), o = de(e.label, "fetlife");
                        r > 0 && o && o.url && n.push({
                            label: e.label,
                            score: r,
                            community: o
                        });
                    });
                    const i = new Set;
                    return n.sort((e, t) => t.score - e.score || e.label.localeCompare(t.label)).filter(e => !i.has(e.community.url) && (i.add(e.community.url), 
                    !0)).slice(0, e);
                }();
                if (!e.length) {
                    const e = document.createElement("li"), t = document.createElement("small");
                    return t.textContent = "Rate topics you’re into to see relevant national groups.", 
                    e.append(t), void Pl.append(e);
                }
                e.forEach(e => {
                    const t = document.createElement("li"), n = document.createElement("a"), i = document.createElement("small");
                    n.href = e.community.url, n.target = "_blank", n.rel = "noopener noreferrer", n.textContent = e.community.name || e.label, 
                    i.textContent = `Matched from ${e.label}`, t.append(n, i), Pl.append(t);
                });
            })(), Al.hidden = !1;
        }
        function Rl() {
            El.dataset.tone = "error", El.textContent = "Location unavailable — local search needs location permission.", 
            Al.hidden = !0, $l.hidden = !0;
        }
        function Ol() {
            Wi(Sl), Tl && Fl && Dl(Fl), requestAnimationFrame(() => {
                (Ll ? e.byId("closeLocalCommunities") : e.byId("findLocalCommunities")).focus();
            });
        }

        e.byId("profileCommunityMatches")?.addEventListener("click", () => {
            if (Hy && vt[Hy]) Et = Hy;
            Ui(_g);
            Ol();
            const t = Vi(), matches = [];
            h.forEach(branch => branch.topics.forEach(label => { const id=Wn(label), rating=ca(id,t), score=Math.max(rating.giveKnown?rating.give:-101,rating.receiveKnown?rating.receive:-101), community=de(label,"fetlife"); if(score>0&&community&&community.url) matches.push({label,score,community}); }));
            const grouped = new Map(); matches.forEach(m => { const key=m.community.url; if(!grouped.has(key)) grouped.set(key,{community:m.community,labels:[],score:m.score}); const g=grouped.get(key); g.labels.push(m.label); g.score=Math.max(g.score,m.score); });
            Pl.replaceChildren(); [...grouped.values()].sort((a,b)=>b.labels.length-a.labels.length||b.score-a.score).slice(0,8).forEach(m=>{ const li=document.createElement("li"),a=document.createElement("a"),small=document.createElement("small"); a.href=m.community.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=m.community.name||m.labels[0];small.textContent=(m.labels.length>1?`${m.labels.length} green matches: `:"Matched: ")+m.labels.join(", ");li.append(a,small);Pl.append(li); });
            Al.hidden = !1;
        });
        e.byId("localCommunitiesButton") && e.byId("localCommunitiesButton").addEventListener("click", () => {
            Pi.open && Ui(Pi), Ol();
        }), e.byId("findLocalCommunities") && e.byId("findLocalCommunities").addEventListener("click", async function() {
            Ll || (Ll = !0, El.removeAttribute("data-tone"), El.textContent = "Requesting location…", 
            navigator.geolocation ? navigator.geolocation.getCurrentPosition(async e => {
                Tl = {
                    latitude: e.coords.latitude,
                    longitude: e.coords.longitude
                }, $l.hidden = !0, El.textContent = "Finding your area…";
                try {
                    Fl = await async function() {
                        const e = new AbortController, n = t.setTimeout(() => e.abort(), 7e3), i = encodeURIComponent(Tl.latitude), a = encodeURIComponent(Tl.longitude);
                        try {
                            const t = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${i}&lon=${a}&zoom=10&addressdetails=1`, {
                                headers: {
                                    Accept: "application/json"
                                },
                                credentials: "omit",
                                cache: "no-store",
                                referrerPolicy: "strict-origin-when-cross-origin",
                                signal: e.signal
                            });
                            if (!t.ok) throw new Error("Reverse geocoding unavailable");
                            const n = await t.json(), r = n && n.address || {};
                            return {
                                city: r.city || r.town || r.village || r.municipality || r.county || "",
                                state: r.state || r.region || ""
                            };
                        } finally {
                            t.clear(n);
                        }
                    }(), El.textContent = "";
                } catch (e) {
                    Fl = null, El.textContent = "City lookup unavailable. No location was sent to FetLife or Reddit.";
                }
                Dl(Fl);
            }, Rl, {
                enableHighAccuracy: !1,
                maximumAge: 0,
                timeout: 1e4
            }) : Rl());
        }), e.byId("closeLocalCommunities") && e.byId("closeLocalCommunities").addEventListener("click", () => Ui(Sl)), Sl.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Sl);
        });
        const Bl = e.byId("searchInput"), jl = e.byId("searchDropdown"), ql = e.byId("topicPicker"), Hl = e.byId("topicPickerButton"), Wl = e.byId("topicPickerMenu"), Ul = [], Gl = G(h, z);
        function Kl(e, t = !1) {
            const n = !t && e.hankyKey && "subcategory" !== e.hankyKey ? ` data-hanky-code="${Hi(e.hankyKey)}"` : "";
            return `<svg class="glance-tooltip-practice-icon ${t ? "branch-icon" : "topic-icon"}${"subcategory" === e.hankyKey ? " subcategory-icon" : "noCode" === e.hankyKey ? " no-hanky-code-icon" : ""}" viewBox="0 0 48 48" aria-hidden="true"${n} style="--icon-family:${Hi(e.color)};color:${Hi(e.color)}"><circle class="icon-ring-outline icon-ring-outline-outer" cx="24" cy="24" r="23.5"/><circle class="icon-disc" cx="24" cy="24" r="22"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="24" cy="24" r="20.5"/><g transform="${t ? "scale(2)" : "translate(8 8) scale(2)"}">${e.glyph}${e.accent || ""}</g></svg>`;
        }
        function zl(e) {
            let t = [], i = [], a = -1, r = !1;
            const o = new Set;
            // P1 refactor (Build 2026-10-18_2227): zl internals split by
            // responsibility — zlFlatten prepares the visible item list
            // (tree flattening), zlRenderRows renders the option rows,
            // zlMove is the keyboard highlight step used by the key handler.
