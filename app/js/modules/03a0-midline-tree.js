        function frBuildTree() {
                const e = sxIsVeilEnabled(), t = t => $n ? $n.has(t) : !e || sxTopicPassesVeil(t, Mt), n = Lt ? sxCollectComparedImports().find(e => e.id === Lt) : null, i = Lt && (sxNodeRegistry[Lt] || sxNodeById(Lt) || n), a = i && i.parentId;
                const hbSrc = (() => {
                    const rec = ft[Mt], ids = rec && "group" === rec.kind && Array.isArray(rec.sourceIds) ? rec.sourceIds.filter(id => vt[id]) : [];
                    if (ids.length) return ids.map(id => [ vt[id], Qe[id] ]);
                    const profs = rec && "group" === rec.kind && Array.isArray(rec.sourceProfiles) ? rec.sourceProfiles.filter(p => p) : [];
                    return profs.length ? profs.map(p => [ p.ratings, p.annotations ]) : [ [ vt[Mt], Qe[Mt] ] ];
                })(), hbRated = id => hbSrc.some(([r, a]) => null !== sxScoreTopicForVeil(id, r, a)), hbCtx = hbSrc.some(([r, a]) => {
                    const ks = new Set([ ...Object.keys(r || {}), ...Object.keys(a || {}) ]);
                    for (const k of ks) if (null !== sxScoreTopicForVeil(k, r, a)) return !0;
                    return !1;
                }); /* DIMFIX F1 (extends HUB-BACKBONE): rating-presence for the hub dim, computed from ACTUAL ratings over the active context (groups: rated-in-any source), never routed through the Net visibility filter t() — with Net off t() passes every topic, so an allImported-based stamp can never fire for ordinary profiles. The source resolution mirrors t()'s cascade minus its Net gates (no ht / netEnabled filtering) and minus its threshold. hbCtx is the Finding C guard (owner-ruled 2026-10-23): a context with no ratings anywhere flags nothing, so a zero-rating profile stands at full register. */
                let r = Math.max(0, 560 - h.length);
                return h.slice().filter(e => function(e, t = Mt) {
                    return !Object.keys(vt).length || window.__SX_FORCE_UNRATED_TREE || !(!t || !vt[t]) && (!(!$n || !$n.has(catId(e.name))) || !sxIsVeilEnabled(t) || sxIsBranchVeilShown(e, t));
                }(e)).map(e => {
                    const i = catId(e.name), o = rn.has(e.name), s = DETAIL_CAPS[mapDetailLevel], l = !En && !$n && Number.isFinite(s), c = sxOrderByScore(e.subcategories?.length ? (e.parentTopics || []).map(e => ({
                        id: sxResolveTopicId(e),
                        label: sxName(e),
                        isSubcategory: !1
                    })).concat(e.subcategories.map(t => ({
                        id: sxResolveSubcategoryId(e.name, t.name),
                        label: t.name,
                        isSubcategory: !0,
                        group: t
                    }))) : e.topics.map(e => ({
                        id: sxResolveTopicId(e),
                        label: sxName(e),
                        isSubcategory: !1
                    })), e => e.isSubcategory ? sxMeanScore(e.group.topics) : sxBlendedScore(e.label)), d = e => e.isSubcategory ? e.group.topics.some(e => t(sxResolveTopicId(e))) : t(e.id), u = t => Boolean(Tt && (String(t.label || "").toLowerCase().includes(Tt) || String(e.name || "").toLowerCase().includes(Tt) || t.isSubcategory && t.group.topics.some(e => sxName(e).toLowerCase().includes(Tt)))), p = c.filter((e, t) => {
                        const n = e.id === Lt || e.id === a || e.isSubcategory && e.group.topics.some(e => sxResolveTopicId(e) === Lt);
                        /* HUB-BACKBONE W1: a subcategory child stands on its own standing (the backbone); d(e) is unchanged because it also feeds densityHidden */
                        return (d(e) || e.isSubcategory) && (!l || t < s || topicRatedForDetail(e.id) || e.isSubcategory && e.group.topics.some(e => topicRatedForDetail(sxResolveTopicId(e))) || u(e) || n);
                    }), h = l ? c.filter(d).length - p.length : 0, g = sxFilterVisibleNodes(i, p.map(e => e.id)), m = [];
                    p.forEach(i => {
                        if (Dn || r <= 0) return;
                        const s = u(i);
                        if (!En && !o && !s) return;
                        if (!En && o && !$n && g.mode && !i.isSubcategory && !g.visible.includes(i.id) && !s) return; /* HUB-BACKBONE W2: subcategories are exempt from the rated-topic filter guard — a hub's presence must not depend on a rating predicate; its children's own filtering is untouched */
                        if (r--, i.isSubcategory) {
                            const n = sxOrderByScore(i.group.topics.filter(e => t(sxResolveTopicId(e))), sxBlendedScore).map(t => ({
                                id: sxResolveTopicId(t),
                                label: sxName(t),
                                branch: e.name,
                                kind: "Topic",
                                risk: Boolean(((e.topics || []).find(topic => sxName(topic) === sxName(t)) || {}).risk),
                                parentId: i.id,
                                isStaticTopic: !0
                            })), a = sxFilterVisibleNodes(i.id, n.map(e => e.id)), o = on.has(i.id) ? n.filter(e => a.visible.includes(e.id) || e.id === Lt || Tt && String(e.label || "").toLowerCase().includes(Tt)).filter((e, t) => !Number.isFinite(DETAIL_CAPS[mapDetailLevel]) || t < DETAIL_CAPS[mapDetailLevel] || topicRatedForDetail(e.id)).slice(0, r) : [];
                            r = Math.max(0, r - o.length);
                            const s = sxAngularDemand(i.label, sxDepthRadius(2), pr.subcategoryIcon, 18, 176), l = o.reduce((e, t) => e + sxAngularDemand(t.label, sxDepthRadius(3), pr.topicIcon, 15, 112), 0);
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
                                unratedHub: !i.group.topics.some(e => hbRated(sxResolveTopicId(e))) /* DIMFIX F1, owner supersession 2026-10-28: a wholly-unrated hub dims in every context — the Finding C guard (no dim when a context has no ratings anywhere) no longer applies, so zero-rating profiles and the no-profile unrated map dim their hubs too */
                            });
                        }
                        const l = i.id, c = i.label;
                        let d = sxOrderByScore(sxCollectComparedImports().filter(e => e.parentId === l && t(e.id)), e => sxBlendedScore(e.label)).slice(0, r);
                        a === l && n && !d.some(e => e.id === n.id) && (d = [ n, ...d.slice(0, Math.max(0, r - 1)) ]);
                        const p = sxFilterVisibleNodes(l, d.map(e => e.id)), h = on.has(l) ? d.filter(e => p.visible.includes(e.id) || e.id === Lt).slice(0, r) : [];
                        r = Math.max(0, r - h.length);
                        const f = sxAngularDemand(c, sxDepthRadius(2), pr.topicIcon, 18, 176), y = h.reduce((e, t) => e + sxAngularDemand(t.label, sxDepthRadius(3), pr.importedIcon, 15, 112), 0);
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
                    // then the next-densest pair, alternating outward -
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
                    const f = sxAngularDemand(e.name, sxDepthRadius(1), pr.categoryIcon, 25), y = m.reduce((e, t) => e + t.minDemand, 0);
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
                e.topics = sxAllocateSectors(t.topics.map(e => ({
                    topic: e,
                    label: e.label,
                    weight: e.weight,
                    minDemand: e.minDemand
                })), i, o, sxDepthRadius(2), pr.topicIcon, 18, 196), e.topics.forEach(n => {
                    n.branchName = t.branch.name, n.startAngle = e.angle, a.push(n);
                    const i = n.topic, o = Math.min(.02 * n.sector, Math.PI / 240), s = n.start + o, l = Math.max(.001, n.sector - 2 * o);
                    n.children = sxAllocateSectors(i.children.map(e => ({
                        child: e,
                        label: e.label,
                        weight: 1
                    })), s, l, sxDepthRadius(3), pr.importedIcon, 15, 118), n.children.forEach(e => {
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
                        if (1 === i) return sxWrapAngle(e);
                        const a = e + Math.PI, r = (Math.max(0, Math.min(i - 1, Number(t) || 0)) + .5) / i;
                        return sxWrapAngle(a - er.halfExclusion - er.spread * r);
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
                        if (_ao) e.cloudAngle = sxWrapAngle(e.cloudAngle + _ao * Math.PI / 180);
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
                            if (_kao3 && typeof _kao3.angle === "number" && _kao3.angle) e.cloudAngle = sxWrapAngle(e.cloudAngle + _kao3.angle * Math.PI / 180);
                        } catch (_) { __sxErrLog("layout-override", _); }
                    });
                });
            });
        }
        function frClampCloudRadii(n) {
            n.forEach(e => {
                // Scoped solve (T3, L3): a frozen branch's cap is
                // not evaluated at all - its delivered radius is a
                // constant of the scoped solve, and recompute-set
                // branches below still read its centre (delivered
                // angle + preserved _spokeAdjust20) as a constant
                // through yr(). Each skipped evaluation is counted.
                if (scCtx && e.entry && e.entry.branch && scCtx.frozenBranches.has(e.entry.branch.name)) return void scCtx.dropped.clamp++;
                e.topicCloudRadiusBase = e.topicCloudRadius;
                const t = sxBranchSpokeLength(e.entry.branch), i = 900 + Math.cos(e.angle) * t, a = 620 + Math.sin(e.angle) * t;
                let r = 1 / 0;
                n.forEach(t => {
                    if (t === e) return;
                    const n = sxBranchSpokeLength(t.entry.branch), o = 900 + Math.cos(t.angle) * n, s = 620 + Math.sin(t.angle) * n, l = Math.hypot(o - i, s - a);
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
        // surrounds them - relief follows the first, the curve reset
        // follows the second. The spoke-length optimizer likewise runs
        // after EACH pass: the second run is INTENTIONAL post-relief
        // re-optimization (relief moves radii, so spoke lengths are
        // re-fit against the relieved geometry before curves reset),
        // not a leftover - confirmed in this pass from the pass order
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
                // explicitly switched on (map value true - not merely
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
                // mn.subcatCloudShrinkFactor - see sxArmedFactor) -
                // a scoped shrink of its spoke, in any collision mode.
                e.topics.forEach(t => {
                    // Fit start (E4): a fit gen-2 item - plain topic or
                    // subcategory node alike - starts the collision
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
