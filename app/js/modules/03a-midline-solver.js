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
                    })), e => e.isSubcategory ? K(e.group.topics) : H(e.label)), d = e => e.isSubcategory ? e.group.topics.some(e => t(Wn(e))) : t(e.id), u = t => Boolean(Tt && (String(t.label || "").toLowerCase().includes(Tt) || String(e.name || "").toLowerCase().includes(Tt) || t.isSubcategory && t.group.topics.some(e => sxName(e).toLowerCase().includes(Tt)))), p = c.filter((e, t) => {
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
                            })), a = fi(i.id, n.map(e => e.id)), o = on.has(i.id) ? n.filter(e => a.visible.includes(e.id) || e.id === Lt || Tt && String(e.label || "").toLowerCase().includes(Tt)).filter((e, t) => !Number.isFinite(DETAIL_CAPS[mapDetailLevel]) || t < DETAIL_CAPS[mapDetailLevel] || topicRatedForDetail(e.id)).slice(0, r) : [];
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
