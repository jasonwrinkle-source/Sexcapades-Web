        // ===== Map layout geometry ==============================================
        // One pipeline owns spoke radii, collision relief, crossing assignment,
        // and angular nudging. Keep this order stable: each later pass consumes the
        // coordinates established by the pass before it.
        const er = Object.freeze({
            fullTurn: 2 * Math.PI,
            inwardExclusion: Math.PI / 6,
            halfExclusion: Math.PI / 12,
            spread: 11 * Math.PI / 6,
            pitch: 150,
            minimumRadius: 170
        });
        function tr(e) {
            return Math.atan2(Math.sin(e), Math.cos(e));
        }
        const nr = Object.freeze({
            spread: 11 * Math.PI / 6,
            halfSpread: 11 * Math.PI / 12,
            inwardExclusion: Math.PI / 6,
            referenceSpread: 2 * Math.PI / 3,
            pitch: er.pitch,
            minimumRadius: er.minimumRadius
        });
        function ir(e, t, n) {
            const i = Math.max(0, Number(t) || 0);
            if (!i) return tr(e);
            const a = Math.ceil(i / 2), r = i % 2 == 1 ? 1 : -1;
            return tr(e + Math.max(-nr.halfSpread, Math.min(nr.halfSpread, r * a * (Number(n) || 0))));
        }
        function ar(e, t, n) {
            const i = Math.max(0, Number(t) || 0);
            if (!i) return [];
            const a = Math.ceil((i - 1) / 2), r = a > 0 ? nr.spread / (2 * a + 1) : 0, o = Math.max(Math.abs(Number(n) || 0), r);
            return !o || a * o <= nr.halfSpread ? Array.from({
                length: i
            }, (t, n) => ir(e, n, o)) : Array.from({
                length: i
            }, (e, t) => -nr.halfSpread + nr.spread * (t + .5) / i).slice().sort((e, t) => Math.abs(e) - Math.abs(t) || e - t).map(t => tr(e + t));
        }
        const rr = Object.freeze({
            // --- Spoke length calculations (uniform sibling radii) ---------------
            slotAngle: ir,
            fanAngles: ar,
            childFanAngles: (e, t, n) => ar(e, t, n),
            stepForRadius: e => nr.pitch / Math.max(1, e),
            cloudRadiusFor(e) {
                const t = Math.max(nr.minimumRadius, e * nr.pitch / nr.referenceSpread / .82), n = Math.ceil(Math.max(0, (Number(e) || 0) - 1) / 2), i = n > 0 ? n * nr.pitch / nr.halfSpread : 0;
                return Math.max(t, i);
            },
            branchDepth: e => Math.max(0, ...(e.topics || []).map(e => rr.renderedSpokeLength(e) + (e.topic.isSubcategory && e.children && e.children.length ? 1.18 * (e.childCloudRadius || 0) + pr.topicIcon + rr.CONTROL_STATION + rr.LABEL_ALLOWANCE : 0))),
            renderedSpokeLength(e) {
                const t = e.cloudRadius || 0, n = e.topic && e.topic.label || "";
                let i = t;
                try {
                    i = Za.topicSpokeEstimate(n, t).spokeLength;
                } catch (e) { __sxErrLog("layout-measure", e); }
                if (e.topic && e.topic.isSubcategory) {
                    i = Math.max(i, pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96, sxSpokeBase(e.cloudCount));
                    try {
                        const e = Za.topicSpokeEstimate(n, t);
                        i = Za.hubSpokeLength(n, e.fontSize, i, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                    } catch (e) { __sxErrLog("layout-measure", e); }
                }
                var subMul = 1, cloudMul = 1, kinkMul = 1;
                if (e.topic && e.topic.isSubcategory && mn.subcatOverrides) {
                    var so = mn.subcatOverrides[e.topic.label];
                    if (so) {
                        if (typeof so.length === "number" && so.length > 0) subMul = so.length;
                        if (typeof so.cloud === "number" && so.cloud > 0) cloudMul = so.cloud;
                    }
                }
                if (e.topic && !e.topic.isSubcategory && mn.kinkOverrides) {
                    var ko = mn.kinkOverrides[e.topic.id];
                    if (ko && typeof ko.length === "number" && ko.length > 0) kinkMul = ko.length;
                }
                return i * (e.topic && e.topic.isSubcategory ? mn.subLen * subMul : mn.spokeLen * kinkMul) * ("grow" === mn.collision ? 1.22 : "shrink" === mn.collision ? .72 : "off" === mn.collision ? .56 : 1);
            },
            CONTROL_STATION: 54,
            LABEL_ALLOWANCE: 44,
            branchExpanded: e => (e.topics || []).some(e => e.topic.isSubcategory && e.children && e.children.length),
            MAX_CASCADE_PASSES: 8,
            MAX_TOPIC_GROWTH: 1100,
            ELEMENT_CLEARANCE: 30,
            topicElementRadius(e) {
                const t = e.topic || e.child || {}, n = t.isSubcategory ? pr.subcategoryIcon : pr.topicIcon;
                let i = 0;
                try {
                    i = Za.measure(t.label || "", t.isSubcategory || !e.child ? sxFontCoef(2) : sxFontCoef(3));
                } catch (e) { __sxErrLog("layout-measure", e); }
                return Math.max(n / 2 + rr.ELEMENT_CLEARANCE * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1), n / 2 + rr.CONTROL_STATION, Math.min(260, i / 2 + 34 * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1)));
            },
            _lineEndpoint(e, t) {
                const n = e.child ? e.cloudRadius || 0 : rr.renderedSpokeLength(e);
                return {
                    x: t.x + Math.cos(e.cloudAngle) * n,
                    y: t.y + Math.sin(e.cloudAngle) * n
                };
            },
            _rotateSibling(e, t) {
                const n = Math.atan2(Math.sin(t - e.cloudAngle), Math.cos(t - e.cloudAngle));
                e.cloudAngle = tr(t), (e.children || []).forEach(e => {
                    e.cloudAngle = tr(e.cloudAngle + n);
                });
            },
            // --- Angular nudge -------------------------------------------------
            // Gently separates adjacent siblings without changing their radius.
            applyAngularNudge(e, t) {
                if (!mn.nudge || !Array.isArray(e) || e.length < 2) return;
                const n = e.map(e => ({
                    item: e,
                    rel: Math.atan2(Math.sin(e.cloudAngle - t), Math.cos(e.cloudAngle - t))
                })).sort((e, t) => e.rel - t.rel), i = Math.max(Math.PI / 45, Math.min(Math.PI / 7, Math.atan2(8 * rr.SPOKE_HALF_WIDTH + 32 * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1), 190)));
                for (let e = 1; e < n.length; e++) {
                    const t = n[e].rel - n[e - 1].rel;
                    if (t >= i) continue;
                    const a = Math.min(Math.PI / 24, (i - t) / 2);
                    n[e - 1].rel -= a, n[e].rel += a;
                }
                n.forEach(e => rr._rotateSibling(e.item, t + e.rel));
            },
            // --- Crossing minimizer (sibling angular assignment) -----------------
            _segmentsCross(e, t) {
                const n = (e, t, n) => (t.x - e.x) * (n.y - e.y) - (t.y - e.y) * (n.x - e.x);
                if ([ e.a, e.b ].some(e => [ t.a, t.b ].some(t => Math.hypot(e.x - t.x, e.y - t.y) < .5))) return !1;
                const i = n(e.a, e.b, t.a), a = n(e.a, e.b, t.b), r = n(t.a, t.b, e.a), o = n(t.a, t.b, e.b);
                return i * a < -.01 && r * o < -.01;
            },
            _siblingSegments(e, t) {
                const n = [];
                return e.forEach(e => {
                    const i = rr._lineEndpoint(e, t);
                    n.push({
                        a: t,
                        b: i
                    }), (e.children || []).forEach(e => {
                        n.push({
                            a: i,
                            b: rr._lineEndpoint(e, i)
                        });
                    });
                }), n;
            },
            _crossingScore(e, t) {
                let n = 0;
                for (let i = 0; i < e.length; i++) {
                    for (let t = i + 1; t < e.length; t++) rr._segmentsCross(e[i], e[t]) && n++;
                    for (const a of t) rr._segmentsCross(e[i], a) && n++;
                }
                return n;
            },
            minimizeSiblingCrossings(e, t, n) {
                if (!mn.crossmin || !Array.isArray(e) || e.length < 2) return rr._siblingSegments(e || [], t);
                for (let i = 0; i < 2; i++) {
                    let i = !1;
                    for (let a = 0; a < e.length - 1; a++) {
                        const r = e[a], o = e[a + 1], s = r.cloudAngle, l = o.cloudAngle, c = rr._crossingScore(rr._siblingSegments(e, t), n);
                        rr._rotateSibling(r, l), rr._rotateSibling(o, s), rr._crossingScore(rr._siblingSegments(e, t), n) < c ? i = !0 : (rr._rotateSibling(r, s), 
                        rr._rotateSibling(o, l));
                    }
                    if (!i) break;
                }
                return rr._siblingSegments(e, t);
            },
            minimizeCrossings(e) {
                if (!mn.crossmin || !Array.isArray(e)) return;
                const t = {
                    x: pr.centerX,
                    y: pr.centerY
                }, n = e.map(e => ({
                    a: t,
                    b: rr.branchAnchor(e)
                }));
                e.forEach(e => {
                    const t = rr.branchAnchor(e), i = rr.minimizeSiblingCrossings(e.topics || [], t, n);
                    n.push(...i), (e.topics || []).filter(e => e.children && e.children.length).forEach(e => {
                        const i = rr._lineEndpoint(e, t), a = rr.minimizeSiblingCrossings(e.children, i, n);
                        n.push(...a);
                    });
                });
            },
            // --- Collision avoidance: local grow/shrink ---------------------------
            resolveRadialSiblings(e, allowShrink = !0, itemGate = null, itemArm = null) {
                if ("off" === mn.collision || !Array.isArray(e) || e.length < 2) return;
                e.forEach(item => {
                    // _radialBase20 signature invalidation (E3): the
                    // captured base is recaptured whenever it is not
                    // finite OR the item's governing signature
                    // (_radialBase20Sig, see dkRadialBaseInfo) differs
                    // from the current key — from the item's fit target
                    // when fit-armed, else from its current cloudRadius,
                    // with the legacy max(1, ...) capture floor. With an
                    // unchanged signature there is NO recapture: the base
                    // captured in the first resolver round of a solve
                    // survives unchanged into the second round. A
                    // recapture driven by a signature mismatch — against
                    // the wrapper's own stored signature, or, for the
                    // fresh wrappers each fr() run allocates, against the
                    // same stable identity's entry in the driver's
                    // base-state registry — is recorded in the DeKnotter
                    // run log as 'base-recapture' with the item's stable
                    // key; a first-ever capture is not a recapture and is
                    // not logged. The registry is refreshed either way.
                    const info = dkRadialBaseInfo(item), prev = dkBaseStates.get(info.key), prevSig = "string" == typeof item._radialBase20Sig ? item._radialBase20Sig : prev ? prev.sig : null;
                    item._radialFit20 = info.fit, item._radialKey20 = info.key;
                    if (!Number.isFinite(item._radialBase20) || item._radialBase20Sig !== info.sig) {
                        const mismatch = null !== prevSig && prevSig !== info.sig;
                        item._radialBase20 = Math.max(1, null != info.fit ? info.fit : Number(item.cloudRadius) || 1), item._radialBase20Sig = info.sig, mismatch && dkLog.push({
                            type: "base-recapture",
                            key: info.key,
                            branch: dkCtx ? dkCtx.branch : null,
                            phase: dkCtx ? dkCtx.phase : null,
                            base: item._radialBase20,
                            sig: info.sig
                        });
                    }
                    dkBaseStates.set(info.key, {
                        base: item._radialBase20,
                        sig: item._radialBase20Sig
                    });
                });
                // Fit floor (E3, wired in E4): for a fit-armed item the
                // resolver floor IS its fit target, not max(82, 0.58 ×
                // base). _radialFit20 carries the item's registered
                // target whenever one exists; non-fit items keep the
                // legacy floor and cap exactly.
                const t = e => Number.isFinite(e._radialFit20) ? e._radialFit20 : Math.max(82, .58 * e._radialBase20), n = e => e._radialBase20 + rr.MAX_TOPIC_GROWTH, i = (e, t, n, i, a, r) => {
                    const o = e.cloudRadius, s = t.cloudRadius, l = Math.cos(e.cloudAngle) * o - Math.cos(t.cloudAngle) * s, c = Math.sin(e.cloudAngle) * o - Math.sin(t.cloudAngle) * s, d = Math.hypot(l, c), u = rr.topicElementRadius(e) + rr.topicElementRadius(t);
                    if (d + .5 >= u) return null;
                    const p = [], h = (e, t, n, i) => {
                        const a = e.cloudRadius, r = t.cloudRadius, o = Math.cos(e.cloudAngle - t.cloudAngle) * r, s = Math.max(0, r * r - o * o);
                        if (s >= u * u) return;
                        const l = Math.sqrt(Math.max(0, u * u - s)), c = o - l - 2, d = o + l + 2;
                        c < a && c >= n && p.push({
                            item: e,
                            radius: c,
                            delta: c - a,
                            shrink: 1
                        }), d > a && d <= i && p.push({
                            item: e,
                            radius: d,
                            delta: d - a,
                            shrink: 0
                        });
                    };
                    return h(e, t, n, i), h(t, e, a, r), p.filter(e => (!1 !== allowShrink || 1 !== e.shrink) && (!itemGate || 1 !== e.shrink || itemGate(e.item))).filter(e => "grow" === mn.collision ? e.delta > 0 || (1 === e.shrink && itemArm && itemArm(e.item)) : "shrink" !== mn.collision || e.delta < 0).filter(e => !(itemArm && e.delta > 0 && itemArm(e.item))).sort((e, t) => Math.abs(e.delta) - Math.abs(t.delta) || t.shrink - e.shrink)[0] || null;
                    // Group 3d fix (symptom #1, toggles move nothing): the
                    // last filter above is new. An item whose auto-shrink
                    // is armed enters this resolver already carrying the
                    // armed compaction factor (clouds 0.74x / spokes
                    // 0.76x, applied in frCloudLayout / frCollisionPasses)
                    // — but sibling separation then grew it back out
                    // toward the un-shrunk radius (the pair separation
                    // floor for dense child clouds lands within a few
                    // units of the un-shrunk radius), so the delivered
                    // layout showed no movement at all (Fleet 3: 0 of 466
                    // nodes). Armed items may still shrink or hold here;
                    // they may not grow. Separation for an armed pair is
                    // achieved by the unarmed partner growing, or not at
                    // all — the overlap trade the armed shrink commands.
                    // Unarmed items are untouched (itemArm null or false
                    // passes every candidate exactly as before).
                };
                for (let a = 0; a < 16; a++) {
                    let a = !1;
                    for (let r = 0; r < e.length; r++) for (let o = r + 1; o < e.length; o++) {
                        const s = e[r], l = e[o], c = i(s, l, t(s), n(s), t(l), n(l));
                        // Fit deviation (E4): an outward push that sibling
                        // separation forces on a fit item is allowed (its
                        // floor is the target, so it can never be pushed
                        // below it), but never silent — each push is
                        // recorded with the item's stable key, its
                        // target, and the radius it was pushed to.
                        c && (Number.isFinite(c.item._radialFit20) && c.radius > c.item._radialFit20 + 1e-9 && dkLog.push({
                            type: "fit-deviation",
                            key: c.item._radialKey20 || null,
                            target: c.item._radialFit20,
                            delivered: c.radius
                        }), c.item.cloudRadius = c.radius, a = !0);
                    }
                    if (!a) break;
                }
            },
            topicPosition(e, t, n) {
                const i = rr.renderedSpokeLength(t);
                return {
                    x: n.x + Math.cos(t.cloudAngle) * i,
                    y: n.y + Math.sin(t.cloudAngle) * i
                };
            },
            branchAnchor(e) {
                const t = yr(e.entry.branch);
                return {
                    x: pr.centerX + Math.cos(e.angle) * t,
                    y: pr.centerY + Math.sin(e.angle) * t
                };
            },
            // --- Expansion relief ------------------------------------------------
            // Expanded subtrees yield space through bounded branch/topic growth.
            applyBranchReliefPass(e, t, n) {
                const i = new Map;
                if (scCtx && scCtx.r6Abort) return !1;
                e.forEach((t, n) => {
                    const a = e[(n + 1) % e.length];
                    if (a === t) return;
                    const r = rr.branchAnchor(t), o = rr.branchAnchor(a), s = Math.hypot(r.x - o.x, r.y - o.y), l = rr.branchDepth(t) + rr.branchDepth(a) - s;
                    if (l <= 0) return;
                    const c = rr.branchExpanded(t), d = rr.branchExpanded(a), adds = c && !d ? [ [ a, t, l ] ] : d && !c ? [ [ t, a, l ] ] : c && d ? [ [ t, a, l / 2 ], [ a, t, l / 2 ] ] : [];
                    // Scoped solve (T3, L5): a relief candidate
                    // whose source or target branch is frozen is
                    // suppressed, counted, and logged as a boundary
                    // event (pass 0 = the branch relief pass);
                    // candidates between two recompute-set branches
                    // accumulate exactly as before.
                    adds.forEach(([tgt, src, amt]) => {
                        if (scCtx && (scSectorFrozen(tgt) || scSectorFrozen(src))) return void scReliefBoundary(scCtx, scSectorName(src), scSectorName(tgt), 0);
                        i.set(tgt, (i.get(tgt) || 0) + amt);
                    });
                });
                let a = !1;
                return i.forEach((e, i) => {
                    const r = t.get(i) || 0, o = Math.min(e, rr.MAX_TOPIC_GROWTH - r);
                    if (o <= 0) return;
                    t.set(i, r + o);
                    const s = Math.max(1, i.topicCloudRadius), l = (s + o) / s;
                    i.topicCloudRadius = s + o, (i.topics || []).forEach(e => {
                        // Fit guard (E4): branch relief never scales a
                        // fit item's cloudRadius — nor a fit
                        // subcategory's childCloudRadius — and every
                        // would-be touch of a fit item is logged.
                        const fv = dkFitTargetValueFor(e);
                        if (null != fv) dkLog.push({
                            type: "fit-relief-skip",
                            key: dkRadialBaseInfo(e).key,
                            target: fv,
                            delivered: Number.isFinite(e.cloudRadius) ? e.cloudRadius : null,
                            via: "branch-relief"
                        }); else e.cloudRadius = (e.cloudRadius || 0) * l, e.childCloudRadius && (e.childCloudRadius *= l);
                        n.add(e);
                    }), a = !0;
                }), a;
            },
            cascadeReliefPass(e, t, n) {
                if (scCtx && scCtx.r6Abort) return !1;
                // Scoped solve (T3, L5): rSrc records, per growth
                // demand, the sector whose obstacles exert the
                // pressure (the demand's source branch), and itemSec
                // maps each topic item to its owning sector (the
                // target branch) — the application loop below
                // suppresses any demand whose source or target
                // branch is frozen. Both maps are inert bookkeeping
                // when no scope is active.
                const i = e.length, a = new Map(e.map(e => [ e, rr.branchAnchor(e) ])), r = new Map, rSrc = new Map, itemSec = new Map, o = (e, t, n) => {
                    if (!e.length) return;
                    const i = rr.topicPosition(t, n, a.get(t)), o = rr.topicElementRadius(n), srcSec = t;
                    e.forEach(e => {
                        const t = i.x - e.x, a = i.y - e.y, s = Math.hypot(t, a), l = e.r + o - s;
                        if (l <= 1 || s < .001) return;
                        const c = Math.cos(n.cloudAngle) * (t / s) + Math.sin(n.cloudAngle) * (a / s);
                        var d, u;
                        c <= .1 || (d = n, (u = l / c) > 0 && (!r.has(d) || u > r.get(d)) && (r.set(d, u), rSrc.set(d, srcSec)));
                    });
                };
                scCtx && e.forEach(sec => (sec.topics || []).forEach(tp => itemSec.set(tp, sec)));
                e.forEach((n, r) => {
                    const s = a.get(n), l = [ n, e[(r + 1) % i], e[(r - 1 + i) % i] ].filter((e, t, n) => n.indexOf(e) === t);
                    (n.topics || []).forEach(e => {
                        const i = Boolean(e.topic.isSubcategory && e.children && e.children.length);
                        if (!i && !t.has(e)) return;
                        const a = rr.topicPosition(n, e, s), r = [];
                        i ? e.children.forEach(e => {
                            r.push({
                                x: a.x + Math.cos(e.cloudAngle) * (e.cloudRadius || 0),
                                y: a.y + Math.sin(e.cloudAngle) * (e.cloudRadius || 0),
                                r: pr.topicIcon / 2 + rr.ELEMENT_CLEARANCE
                            });
                        }) : r.push({
                            x: a.x,
                            y: a.y,
                            r: rr.topicElementRadius(e)
                        }), l.forEach(t => {
                            (t.topics || []).forEach(n => {
                                n !== e && o(r, t, n);
                            });
                        });
                    });
                });
                let s = !1;
                return r.forEach((e, i) => {
                    const a = n.get(i) || 0, r = Math.min(e, rr.MAX_TOPIC_GROWTH - a);
                    if (r <= .5) return;
                    // Scoped solve (T3, L5): a growth demand whose
                    // source branch (pressure) or target branch (the
                    // item's owner) is frozen is suppressed, counted,
                    // and logged as a boundary event at the current
                    // cascade pass. The pass's return value still
                    // reflects only applied growth, so the cascade
                    // terminates by its own rules.
                    if (scCtx) {
                        const scTgt = itemSec.get(i), scSrc = rSrc.get(i);
                        if (scSectorFrozen(scTgt) || scSectorFrozen(scSrc)) return void scReliefBoundary(scCtx, scSectorName(scSrc), scSectorName(scTgt), scCtx.reliefPass || 0);
                    }
                    // Fit guard (E4): cascade relief never grows a fit
                    // item away from its target — the skip is logged.
                    const fv = dkFitTargetValueFor(i);
                    if (null != fv) return void dkLog.push({
                        type: "fit-relief-skip",
                        key: dkRadialBaseInfo(i).key,
                        target: fv,
                        delivered: Number.isFinite(i.cloudRadius) ? i.cloudRadius : null,
                        via: "cascade-relief"
                    });
                    i.cloudRadius = (i.cloudRadius || 0) + r, n.set(i, a + r), t.add(i), s = !0;
                }), s;
            },
            applyExpansionRelief(e) {
                if (e.length <= 1 || "off" === mn.collision || "shrink" === mn.collision) return;
                const t = new Set, n = new Map, i = new Map;
                rr.applyBranchReliefPass(e, i, t);
                // Scoped solve (T3, L5): the context carries the
                // 1-based cascade pass number so boundaryLog entries
                // name the pass that produced them (the branch
                // relief pass above is pass 0); under the R6 abort
                // flag the cascade stops at once — pass accounting
                // is otherwise unchanged.
                for (let i = 0; i < rr.MAX_CASCADE_PASSES; i++) {
                    if (scCtx) {
                        if (scCtx.r6Abort) break;
                        scCtx.reliefPass = i + 1;
                    }
                    if (!rr.cascadeReliefPass(e, t, n)) break;
                }
            },
            // --- Element footprints and whole-branch spoke optimization -----------
            // Circles cover node icons, labels, slider controls, and badges.
            SPOKE_HALF_WIDTH: 16,
            SPOKE_MIN_RADIUS: 950,
            SPOKE_MAX_GROWTH: 4500,
            SPOKE_GROWTH_MARGIN: 56,
            SPOKE_ELEMENT_PAD: 50,
            BADGE_RADIUS: 30,
            elementCircles(e, t) {
                const n = Math.cos(e.angle), i = Math.sin(e.angle), a = [ {
                    x: t.x,
                    y: t.y,
                    r: pr.categoryIcon / 2 + rr.ELEMENT_CLEARANCE
                }, {
                    x: t.x - n * (pr.categoryIcon / 2 + 20),
                    y: t.y - i * (pr.categoryIcon / 2 + 20),
                    r: rr.BADGE_RADIUS
                } ];
                return (e.topics || []).forEach(n => {
                    const i = rr.topicPosition(e, n, t);
                    if (a.push({
                        x: i.x,
                        y: i.y,
                        r: rr.topicElementRadius(n)
                    }), n.topic.allImported && n.topic.allImported.length) {
                        const e = (n.topic.isSubcategory ? pr.subcategoryIcon : pr.topicIcon) / 2 + 20;
                        a.push({
                            x: i.x + Math.cos(n.cloudAngle) * e,
                            y: i.y + Math.sin(n.cloudAngle) * e,
                            r: rr.BADGE_RADIUS
                        });
                    }
                    n.topic.isSubcategory && n.children && n.children.forEach(e => {
                        a.push({
                            x: i.x + Math.cos(e.cloudAngle) * (e.cloudRadius || 0),
                            y: i.y + Math.sin(e.cloudAngle) * (e.cloudRadius || 0),
                            r: rr.topicElementRadius(e)
                        });
                    });
                }), a;
            },
            segmentDistance(e, t, n, i, a, r) {
                const o = a - n, s = r - i, l = o * o + s * s, c = l ? A(((e - n) * o + (t - i) * s) / l) : 0;
                return {
                    distance: Math.hypot(e - (n + o * c), t - (i + s * c)),
                    fraction: c
                };
            },
            optimizeSpokeLengths(e) {
                if (e.length <= 1 || "off" === mn.collision) return;
                const t = {
                    x: pr.centerX,
                    y: pr.centerY
                }, n = new Map, i = e => {
                    const t = rr.branchAnchor(e), i = rr.elementCircles(e, t).map(e => ({
                        x: e.x,
                        y: e.y,
                        r: e.r + rr.SPOKE_ELEMENT_PAD * mn.pad * mn.repulsion * (mn.repulsionEnabled === !1 ? 0 : 1)
                    })), a = Math.max(0, ...i.map(e => Math.hypot(e.x - t.x, e.y - t.y) + e.r)), r = [];
                    (e.topics || []).forEach(n => {
                        const i = rr.topicPosition(e, n, t);
                        r.push({
                            x1: t.x,
                            y1: t.y,
                            x2: i.x,
                            y2: i.y
                        }), n.topic.isSubcategory && n.children && n.children.forEach(e => {
                            r.push({
                                x1: i.x,
                                y1: i.y,
                                x2: i.x + Math.cos(e.cloudAngle) * (e.cloudRadius || 0),
                                y2: i.y + Math.sin(e.cloudAngle) * (e.cloudRadius || 0)
                            });
                        });
                    }), n.set(e, {
                        anchor: t,
                        circles: i,
                        depth: a,
                        segments: r
                    });
                };
                e.forEach(i);
                const a = (i = null) => {
                    const a = [], r = (e, t, n, i, r, o) => {
                        const s = ((e, t, n) => {
                            const i = (e => ({
                                x: Math.cos(e.angle),
                                y: Math.sin(e.angle)
                            }))(e);
                            return i.x * t + i.y * n;
                        })(n, i, r);
                        Math.abs(s) <= .1 || a.push({
                            a: e,
                            b: t,
                            target: n,
                            delta: (s > 0 ? 1 : -1) * (o / Math.abs(s) + rr.SPOKE_GROWTH_MARGIN)
                        });
                    };
                    for (let a = 0; a < e.length; a++) for (let o = a + 1; o < e.length; o++) {
                        const s = e[a], l = e[o];
                        // Scoped solve (T3, L4): a pair with BOTH
                        // branches frozen can only produce deltas
                        // against frozen targets, which are suppressed
                        // by construction — skip the pair outright
                        // (the latency win). Recompute×frozen pairs
                        // are still evaluated; their frozen-target
                        // candidates are suppressed + counted at the
                        // candidate filter below.
                        if (scCtx && scSectorFrozen(s) && scSectorFrozen(l)) continue;
                        if (i && s !== i && l !== i) continue;
                        const c = n.get(s), d = n.get(l);
                        Math.hypot(c.anchor.x - d.anchor.x, c.anchor.y - d.anchor.y) <= c.depth + d.depth && c.circles.forEach(e => d.circles.forEach(t => {
                            const n = e.x - t.x, i = e.y - t.y, a = Math.hypot(n, i), o = e.r + t.r - a;
                            if (o <= 1 || a < .001) return;
                            const c = n / a, d = i / a;
                            r(s, l, s, c, d, o), r(s, l, l, -c, -d, o);
                        })), [ [ s, l ], [ l, s ] ].forEach(([e, i]) => {
                            const a = n.get(e), o = n.get(i);
                            rr.segmentDistance(o.anchor.x, o.anchor.y, t.x, t.y, a.anchor.x, a.anchor.y).distance > o.depth + rr.SPOKE_HALF_WIDTH + 2 || o.circles.forEach(n => {
                                const o = rr.segmentDistance(n.x, n.y, t.x, t.y, a.anchor.x, a.anchor.y), s = n.r + rr.SPOKE_HALF_WIDTH - o.distance;
                                if (s <= 1 || o.distance < .001) return;
                                const l = t.x + (a.anchor.x - t.x) * o.fraction, c = t.y + (a.anchor.y - t.y) * o.fraction;
                                r(e, i, i, (n.x - l) / o.distance, (n.y - c) / o.distance, s);
                            });
                        }), [ [ s, l ], [ l, s ] ].forEach(([e, t]) => {
                            const i = n.get(e), a = n.get(t);
                            Math.hypot(i.anchor.x - a.anchor.x, i.anchor.y - a.anchor.y) > i.depth + a.depth + rr.SPOKE_HALF_WIDTH + 2 || i.segments.forEach(n => {
                                a.circles.forEach(i => {
                                    const a = rr.segmentDistance(i.x, i.y, n.x1, n.y1, n.x2, n.y2), o = i.r + rr.SPOKE_HALF_WIDTH - a.distance;
                                    if (o <= 1 || a.distance < .001) return;
                                    const s = n.x1 + (n.x2 - n.x1) * a.fraction, l = n.y1 + (n.y2 - n.y1) * a.fraction;
                                    r(e, t, t, (i.x - s) / a.distance, (i.y - l) / a.distance, o);
                                });
                            });
                        });
                    }
                    return a;
                };
                for (let e = 0; e < SX_SCORE.OPTIMIZER_MAX_PASSES; e++) {
                    // Q1: heartbeat / cancel / phase-budget poll —
                    // a no-op unless a DeKnotter context is active.
                    dkSolvePoll();
                    const e = a();
                    if (!e.length) break;
                    const t = e.map(e => {
                        const t = Number(e.target.entry.branch._spokeAdjust20) || 0, n = t + e.delta;
                        return {
                            ...e,
                            current: t,
                            next: n
                        };
                    }).filter(e => Math.abs(e.delta) > .5 && ("grow" === mn.collision ? e.delta > 0 || ("armed" === sxShrinkState(mn.branchSpokeAutoShrink, e.target.entry.branch.name)) : "shrink" !== mn.collision || e.delta < 0) && e.next >= rr.SPOKE_MIN_RADIUS - (e.target, 
                    1450) && e.next <= rr.SPOKE_MAX_GROWTH && (e.delta > 0 || ("veto" !== sxShrinkState(mn.branchSpokeAutoShrink, e.target.entry.branch.name)))).filter(e => !scCtx || !scSectorFrozen(e.target) || (scCtx.dropped.optimiser++, !1)).sort((e, t) => Math.abs(e.delta) - Math.abs(t.delta) || (e.delta < 0 ? -1 : 1) - (t.delta < 0 ? -1 : 1) || String(e.target.entry.branch.name).localeCompare(String(t.target.entry.branch.name))), n = t[0];
                    if (!n) break;
                    // DeKnotter log (E1): while a run context is active,
                    // record every change the optimiser makes to the
                    // ACTIVE branch's _spokeAdjust20 (before/after). The
                    // optimiser window itself is observed, not widened.
                    if (dkCtx && n.target && n.target.entry && n.target.entry.branch && n.target.entry.branch.name === dkCtx.branch && n.next !== n.current) dkLog.push({
                        type: "spoke-optimiser",
                        branch: dkCtx.branch,
                        phase: dkCtx.phase,
                        before: n.current,
                        after: n.next
                    });
                    // Fit guard (E4): an optimiser adjustment to a branch
                    // carrying fit items is recorded as a fit-deviation
                    // for each fit item of that branch, so a spoke move
                    // can never silently carry a fit item off target.
                    if (dkFitRegistry.size && n.target && n.target.topics) n.target.topics.forEach(tp => {
                        const fv = dkFitTargetValueFor(tp);
                        null != fv && dkLog.push({
                            type: "fit-deviation",
                            key: dkRadialBaseInfo(tp).key,
                            target: fv,
                            delivered: Number.isFinite(tp.cloudRadius) ? tp.cloudRadius : null,
                            via: "spoke-optimiser"
                        }), tp.topic && tp.topic.isSubcategory && (tp.children || []).forEach(ch => {
                            const cfv = dkFitTargetValueFor(ch);
                            null != cfv && dkLog.push({
                                type: "fit-deviation",
                                key: dkRadialBaseInfo(ch).key,
                                target: cfv,
                                delivered: Number.isFinite(ch.cloudRadius) ? ch.cloudRadius : null,
                                via: "spoke-optimiser"
                            });
                        });
                    });
                    n.target.entry.branch._spokeAdjust20 = n.next, i(n.target);
                }
            }
        }), or = Math.max(1, ...h.map(e => e.subcategories?.length ? (e.parentTopics || []).length + e.subcategories.length : e.topics.length)), sr = Math.ceil(20 / (2 * Math.sin(er.spread / (2 * or)))), lr = Math.max(48, 2 * sr), cr = Math.max(1, ...h.flatMap(e => (e.subcategories || []).map(e => e.topics.length))), dr = Math.ceil(20 / (2 * Math.sin(er.spread / (2 * cr)))), ur = Math.max(48, Math.min(lr - 24, 2 * dr)), pr = {
            centerX: 900,
            centerY: 620,
            centerRadius: ea.outerRadius,
            categoryIcon: lr,
            subcategoryIcon: ur,
            topicIcon: 48,
            importedIcon: 34
        };
        // Font-as-master-knob, part 2 (Build 2026-10-19_0924): mapFontScale()
        // reads the live fontScale layout value (defined in 02e-font-ladder.js).
        // UNIFY (2026-11-02): sxSyncMapFontBase is the ONE setter of the
        // stylesheet's --map-font-base variable, fed by the LIVE scale
        // (mapFontScale() above) — U = 22 x live fontScale. It runs on
        // every render (Mr) and is exposed for the shell's boot/apply
        // paths, which call it instead of setting the variable from the
        // defaults/apply channel. No other code sets --map-font-base.
        function sxSyncMapFontBase() {
            try {
                document.documentElement.style.setProperty("--map-font-base", String(22 * mapFontScale()) + "px");
                // FONT LAW (2026-11-02 17:24): the stylesheet's
                // per-depth label fallbacks (.category-label,
                // .map-label, subcategory/child .map-label)
                // read these per-depth sizes, published here by
                // the same ONE setter; each CSS rule keeps its
                // historical calc() as the var() fallback for
                // any frame before this runs.
                if ("function" === typeof sxFontSize) {
                    document.documentElement.style.setProperty("--map-font-d1", String(sxFontSize(1)) + "px");
                    document.documentElement.style.setProperty("--map-font-d2", String(sxFontSize(2)) + "px");
                    document.documentElement.style.setProperty("--map-font-d3", String(sxFontSize(3)) + "px");
                }
            } catch (err) { __sxErrLog("map-font-base-sync", err); }
        }
        try { window.__sxSyncMapFontBase = sxSyncMapFontBase; } catch (_) {}
        // SPOKE BASE FORMULA (ruled 2026-11-01, Jason): the base of a
        // subcategory segment is no longer the fixed 430 floor. Base =
        // drawn icon radius x (300deg / number of spokes): the usable
        // circle around the branch hub icon — 360deg less the reserved
        // 60deg back angle = 300deg = 5pi/3 radians — shared equally
        // among the spokes fanning out of that hub, so a crowded fan
        // gets a smaller base and a sparse fan a bigger one. The icon
        // radius is the DRAWN radius (sxIconRadius(1) under
        // the 2026-11-02 icon depth law — (2/3)^1 x
        // sqrt(R x W), R the centre-disc radius and W the
        // ring width, floored at 12 x font scale; supersedes
        // the 0.6 linear law —
        // the size the hub icon actually renders at), never the
        // raw unscaled pr value the retired floor measured icons at.
        // The spoke count is the solved entry's cloudCount — the
        // number of gen-2 spokes in that branch's fan, stamped by
        // frCloudLayout. This helper is the ONE formula: every
        // segment-composition site (the closing capture, the
        // delivered-radius reading, the solver's renderedSpokeLength,
        // the SCC geometry build's drawH, and Ar's paint) calls it,
        // so solve, delivered, capsule and paint stay one formula.
        function sxSpokeBase(spokeCount) {
            const n = Math.max(1, Number(spokeCount) || 1);
            return sxIconRadius(1) * (5 * Math.PI / 3) / n;
        }
        // Slider size repair #2 (2026-11-01): the rating rail's visible
        // thickness and its hit strokes are screen-px quantities
        // (non-scaling-stroke), while the track length (320 * control
        // scale, map units) is camera-scaled — so a fixed 44px thickness
        // stays correct up close but dwarfs the delivered track at Full
        // zoom-out, where one inadvertently opened slider rendered as a
        // fat pill over the bunched centre spokes. sxRailPx(m) returns
        // the zoom-appropriate thickness for a control of scale m from
        // the track's CURRENT delivered screen length (14% of it, the
        // full 44px whenever the delivered length supports it, a 9px
        // floor); sxSyncRailPx() publishes that value plus the hit
        // thickness (1.6x visible, 44px cap, 14px floor) as the
        // --sx-rail-px / --sx-rail-hit-px custom properties the
        // .rating-rail / .rating-track-hit / .direction-hit CSS rules
        // read. It runs on every render (Mr) and every camera settle
        // (kh), so the open slider resizes with the camera instead of
        // keeping the size of the zoom it was opened at.
        function sxRailPx(m) {
            try {
                const rect = Cn.getBoundingClientRect(), vb = (Cn.getAttribute("viewBox") || "").split(/\s+/).map(Number), vbw = vb.length === 4 && vb[2] > 0 ? vb[2] : 3200, w = rect && rect.width > 0 ? rect.width : 1440, per = $p * w / vbw, len = 320 * (Number(m) > 0 ? m : mapFontScale()) * per;
                return Math.max(9, Math.min(44, len * .14));
            } catch (err) {
                return 44;
            }
        }
        function sxSyncRailPx() {
            try {
                const rail = sxRailPx(mapFontScale());
                Cn.style.setProperty("--sx-rail-px", rail.toFixed(1) + "px"), Cn.style.setProperty("--sx-rail-hit-px", Math.max(14, Math.min(44, rail * 1.6)).toFixed(1) + "px");
            } catch (err) { __sxErrLog("rail-px-sync", err); }
        }
        function hr(e) {
            return [ 128, 180, 1080, 3300 ][e] || 3300 + 1700 * (e - 3);
        }
        function gr(e, t, n, i, a = 0) {
            return Za.angularDemand(e, t, n, i, a);
        }
        function mr(e, t, n, i, a, r, o = 0) {
            return Za.allocateSectors(e, t, n, i, a, r, o);
        }
        // Branch order (Build 2026-10-16_2020): mn.branchOrder selects the angular
        // order of the top-level branches around the center node. "popularity"
        // places the most popular category at 12:00 and continues in descending
        // popularity clockwise, using the same mean-topic-popularity scoring
        // (z over H, ordered by U) as the outline and detail caps. "relations"
        // starts from the popularity order and hill-climbs pairwise branch swaps
        // to minimize the summed chord length over the branch relation pairs
        // (ue), so related branches sit angularly close. "landscape-antipodal" sorts by
        // descendant topic count and anchors to the landscape axis: densest at
        // 3:00, second densest at 9:00, sparsest at 12:00, second sparsest at
        // 6:00 (nearest available positions when the even spacing misses a
        // cardinal point), the rest in descending density toward the vertical
        // positions. Results are cached per mode; the data never changes at
        // runtime, so a cached order stays valid for the life of the page.
        // Build 2026-10-17_0308: the "stagger" mode is renamed
        // "landscape-antipodal" (display name "Landscape-Antipodal"); the
        // legacy value "stagger" is still accepted and normalized to the
        // new name in branchOrderRankMap, and the ordering function
        // (branchOrderStaggerNames) and its geometry are unchanged.
        // Build 2026-10-16_2101: branchOrderRankMap previously resolved any
        // mode other than "relations"/"stagger" to "stagger", so the
        // "popularity" mode silently rendered the stagger order; the mode
        // check below now accepts all three modes.
        // Build 2026-10-16_2206: fourth mode "alternate" (Alternate density)
        // interleaves the density-sorted branches — densest, sparsest, 2nd
        // densest, 2nd sparsest, ... — so every dense branch is flanked by
        // sparse neighbors. Separately, mn.propFan (Proportional fan) is
        // orthogonal to the order mode: when on, each branch spoke sits at
        // the center of the sector allocateSectors sized in proportion to
        // its topic weight, instead of the even 2π/count slot.
        // Build 2026-10-17_0044: fifth mode "subbranches" (Sub-branches)
        // orders by subcategory count with antipodal separation (see
        // branchOrderSubBranchesNames). Two more orthogonal flags land in
        // this build: mn.subcatOrder (Antipodal subcategories) reorders the
        // gen-2 siblings inside each subcategorized branch in fr(), and
        // mn.staggerDensity (Stagger density, default on) scales category
        // spoke lengths by kink-count density in yr().
        // Build 2026-10-17_0330: ninth mode "complexity-antipodal"
        // (Complexity-Antipodal) — see branchOrderComplexityAntipodalNames.
        let branchOrderCacheMode = "", branchOrderCacheMap = null;
        function branchOrderPopularityNames() {
            return U(h, z, e => e.name).map(e => e.name);
        }
        function branchOrderRelationsNames(start) {
            const order = start.slice(), count = order.length, pos = new Map(order.map((name, i) => [ name, i ])), pairs = pe(ue).filter(pair => pos.has(pair[0]) && pos.has(pair[1])), step = 2 * Math.PI / count, chord = (a, b) => {
                const d = Math.min(Math.abs(pos.get(a) - pos.get(b)), count - Math.abs(pos.get(a) - pos.get(b))) * step;
                return 2 * Math.sin(d / 2);
            }, total = () => pairs.reduce((sum, pair) => sum + chord(pair[0], pair[1]), 0);
            let cost = total();
            for (let pass = 0; pass < 80; pass++) {
                let improved = !1;
                for (let i = 0; i < count - 1; i++) for (let j = i + 1; j < count; j++) {
                    const a = order[i], b = order[j];
                    pos.set(a, j), pos.set(b, i), order[i] = b, order[j] = a;
                    const next = total();
                    if (next < cost - 1e-9) cost = next, improved = !0; else pos.set(a, i), pos.set(b, j), order[i] = a, order[j] = b;
                }
                if (!improved) break;
            }
            return order;
        }
        function branchOrderStaggerNames() {
            const count = h.length, byDensity = h.slice().sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, nearest = target => {
                let best = -1, bestDist = Infinity, bestSin = -Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p]) continue;
                    const a = angle(p), dist = Math.abs(Math.atan2(Math.sin(a - target), Math.cos(a - target))), sin = Math.sin(a);
                    if (dist < bestDist - 1e-9 || Math.abs(dist - bestDist) <= 1e-9 && sin > bestSin) best = p, bestDist = dist, bestSin = sin;
                }
                return best;
            };
            order[nearest(0)] = byDensity[0].name, order[nearest(Math.PI)] = byDensity[1].name, order[nearest(-Math.PI / 2)] = byDensity[count - 1].name, order[nearest(Math.PI / 2)] = byDensity[count - 2].name;
            const rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            rest.sort((p, q) => Math.abs(Math.cos(angle(q))) - Math.abs(Math.cos(angle(p))) || angle(p) - angle(q));
            const middle = byDensity.slice(2, count - 2);
            return rest.forEach((p, i) => order[p] = middle[i].name), order;
        }
        function branchOrderAlternateNames() {
            const byDensity = h.slice().sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = [];
            let lo = 0, hi = byDensity.length - 1, dense = !0;
            while (lo <= hi) dense ? (order.push(byDensity[lo++].name), dense = !1) : (order.push(byDensity[hi--].name), dense = !0);
            return order;
        }
        // Sub-branches (Build 2026-10-17_0044): order the primary branches by
        // SUBCATEGORY count (not kink count) with antipodal separation. The
        // branch with the most sub-branches anchors at 0°, the 2nd most at
        // 180°, the 3rd at 90°, the 4th at 270° (nearest free slots); the
        // remaining slots fill by descending |cos| (alternating sides toward
        // the verticals), taking branches sparse-first interleaved with
        // next-densest, so the slots beside the anchors go to the branches
        // with the fewest sub-branches and no two sub-branch-heavy branches
        // sit adjacent.
        function branchOrderSubBranchesNames() {
            const count = h.length, subCount = e => (e.subcategories || []).length, bySub = h.slice().sort((a, b) => subCount(b) - subCount(a) || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, nearest = target => {
                let best = -1, bestDist = Infinity, bestSin = -Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p]) continue;
                    const a = angle(p), dist = Math.abs(Math.atan2(Math.sin(a - target), Math.cos(a - target))), sin = Math.sin(a);
                    if (dist < bestDist - 1e-9 || Math.abs(dist - bestDist) <= 1e-9 && sin > bestSin) best = p, bestDist = dist, bestSin = sin;
                }
                return best;
            };
            order[nearest(0)] = bySub[0].name, order[nearest(Math.PI)] = bySub[1].name, order[nearest(Math.PI / 2)] = bySub[2].name, order[nearest(-Math.PI / 2)] = bySub[3].name;
            const rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            rest.sort((p, q) => Math.abs(Math.cos(angle(q))) - Math.abs(Math.cos(angle(p))) || angle(p) - angle(q));
            const tail = bySub.slice(4), fill = [];
            let lo = 0, hi = tail.length - 1, sparseFirst = !0;
            while (lo <= hi) sparseFirst ? (fill.push(tail[hi--].name), sparseFirst = !1) : (fill.push(tail[lo++].name), sparseFirst = !0);
            return rest.forEach((p, i) => order[p] = fill[i]), order;
        }
        // Three more modes (Build 2026-10-17_0103). "antipodal" (Antipodal
        // Total): sort by TOTAL children — subcategory count plus direct
        // (parent) topics for subcategorized branches, topic count for flat
        // ones — then pair the sorted list (1st with 2nd, 3rd with 4th, ...)
        // and place each pair 180° apart: pair leaders take every other slot
        // starting from the slot nearest 0°, partners sit exactly opposite,
        // so the heaviest branches are maximally separated, never adjacent.
        // "quadrant" (Quadrant Balance): deal the branches in descending
        // topic-weight order into the four quadrants (NE/SE/SW/NW slot
        // groups), each branch going to the eligible quadrant with the least
        // accumulated topic weight, so every quadrant carries roughly equal
        // visual weight; within a quadrant, dealt order fills its slots in
        // circular order. "branching" (Branching-First Interleave): the
        // categories that HAVE subcategories, sorted by subcategory count,
        // take evenly spaced slots (one per 360/7 step from the top), and
        // the flat categories fill the remaining slots in descending topic
        // count — structural branching complexity is spread around the map
        // instead of topic bulk.
        function branchOrderAntipodalNames() {
            const count = h.length, totalChildren = e => e.subcategories && e.subcategories.length ? e.subcategories.length + (e.parentTopics || []).length : e.topics.length, byTotal = h.slice().sort((a, b) => totalChildren(b) - totalChildren(a) || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, half = count / 2;
            let start = 0, bestDist = Infinity;
            for (let p = 0; p < count; p++) {
                const a = angle(p), d = Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
                d < bestDist - 1e-9 && (bestDist = d, start = p);
            }
            for (let j = 0; j < half; j++) {
                const s = (start + 2 * j) % count;
                order[s] = byTotal[2 * j].name, order[(s + half) % count] = byTotal[2 * j + 1].name;
            }
            return order;
        }
        function branchOrderQuadrantNames() {
            const count = h.length, angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, quadrants = [ [], [], [], [] ];
            for (let p = 0; p < count; p++) {
                const deg = (angle(p) * 180 / Math.PI + 360) % 360;
                quadrants[deg >= 270 ? 0 : deg < 90 ? 1 : deg < 180 ? 2 : 3].push(p);
            }
            const byWeight = h.slice().sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), dealt = [ [], [], [], [] ], load = [ 0, 0, 0, 0 ], order = new Array(count).fill(null);
            byWeight.forEach(e => {
                let pick = -1;
                for (let q = 0; q < 4; q++) {
                    if (dealt[q].length >= quadrants[q].length) continue;
                    if (pick < 0 || load[q] < load[pick] || load[q] === load[pick] && dealt[q].length < dealt[pick].length) pick = q;
                }
                dealt[pick].push(e.name), load[pick] += e.topics.length;
            });
            return quadrants.forEach((slots, q) => slots.forEach((p, i) => order[p] = dealt[q][i])), order;
        }
        function branchOrderBranchingNames() {
            const count = h.length, angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, branched = h.filter(e => e.subcategories && e.subcategories.length).sort((a, b) => b.subcategories.length - a.subcategories.length || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), flat = h.filter(e => !(e.subcategories && e.subcategories.length)).sort((a, b) => b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)), order = new Array(count).fill(null), spread = [];
            branched.forEach((e, k) => {
                const target = -Math.PI / 2 + k * 2 * Math.PI / branched.length;
                let best = -1, bestDist = Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p] || spread.includes(p)) continue;
                    const d = Math.abs(Math.atan2(Math.sin(angle(p) - target), Math.cos(angle(p) - target)));
                    d < bestDist - 1e-9 && (bestDist = d, best = p);
                }
                spread.push(best);
            });
            spread.sort((a, b) => a - b), spread.forEach((p, i) => order[p] = branched[i].name);
            const rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            return rest.forEach((p, i) => order[p] = flat[i].name), order;
        }
        // Complexity-Antipodal (Build 2026-10-17_0330): ninth mode
        // "complexity-antipodal". The categories that HAVE subcategories,
        // sorted by subcategory count descending (ties: topic count,
        // popularity, name), become anchors placed in exact antipodal
        // pairs around the clock: #1 at 3:00 with #2 exactly opposite at
        // 9:00, #3 at 12:00 with #4 at 6:00, #5 at 1:30 with #6 at 7:30,
        // #7 at 4:30 (nearest free slots to each target). Every other
        // slot is a buffer, filled sparsest-first: categories with NO
        // subcategories, fewest kinks (topics) first; if that list ever
        // runs out, the remaining categories with the fewest
        // subcategories come next. Slots beside an anchor fill before
        // slots farther away, so each complex branch is cushioned on
        // both sides by the simplest branches.
        function branchOrderComplexityAntipodalNames() {
            const count = h.length, subCount = e => (e.subcategories || []).length, angle = p => -Math.PI / 2 + p * 2 * Math.PI / count, order = new Array(count).fill(null), used = new Set, nearest = target => {
                let best = -1, bestDist = Infinity, bestSin = -Infinity;
                for (let p = 0; p < count; p++) {
                    if (order[p]) continue;
                    const a = angle(p), dist = Math.abs(Math.atan2(Math.sin(a - target), Math.cos(a - target))), sin = Math.sin(a);
                    if (dist < bestDist - 1e-9 || Math.abs(dist - bestDist) <= 1e-9 && sin > bestSin) best = p, bestDist = dist, bestSin = sin;
                }
                return best;
            }, pairTargets = [ 0, -Math.PI / 2, -Math.PI / 4, Math.PI / 4, -3 * Math.PI / 8, 3 * Math.PI / 8 ], anchors = h.filter(e => subCount(e) > 0).sort((a, b) => subCount(b) - subCount(a) || b.topics.length - a.topics.length || (z(b) ?? 0) - (z(a) ?? 0) || a.name.localeCompare(b.name)).slice(0, 2 * pairTargets.length), anchorSlots = [];
            anchors.forEach((e, i) => {
                let p;
                if (i % 2 === 0) p = nearest(pairTargets[i / 2]); else {
                    const anti = (anchorSlots[i - 1] + count / 2) % count;
                    p = Number.isInteger(anti) && !order[anti] ? anti : nearest(pairTargets[(i - 1) / 2] + Math.PI);
                }
                order[p] = e.name, used.add(e.name), anchorSlots.push(p);
            });
            const buffers = h.filter(e => !used.has(e.name)).sort((a, b) => subCount(a) - subCount(b) || a.topics.length - b.topics.length || (z(a) ?? 0) - (z(b) ?? 0) || a.name.localeCompare(b.name)), rest = [];
            for (let p = 0; p < count; p++) order[p] || rest.push(p);
            rest.sort((p, q) => {
                const steps = s => anchorSlots.length ? Math.min(...anchorSlots.map(a => Math.min(Math.abs(s - a), count - Math.abs(s - a)))) : 0;
                return steps(p) - steps(q) || p - q;
            });
            return rest.forEach((p, i) => order[p] = buffers[i].name), order;
        }
        function branchOrderRankMap() {
            const mode = "popularity" === mn.branchOrder || "relations" === mn.branchOrder || "landscape-antipodal" === mn.branchOrder || "stagger" === mn.branchOrder || "alternate" === mn.branchOrder || "subbranches" === mn.branchOrder || "antipodal" === mn.branchOrder || "quadrant" === mn.branchOrder || "branching" === mn.branchOrder || "complexity-antipodal" === mn.branchOrder ? ("stagger" === mn.branchOrder ? "landscape-antipodal" : mn.branchOrder) : "landscape-antipodal";
            if (branchOrderCacheMap && branchOrderCacheMode === mode) return branchOrderCacheMap;
            const order = "relations" === mode ? branchOrderRelationsNames(branchOrderPopularityNames()) : "landscape-antipodal" === mode ? branchOrderStaggerNames() : "alternate" === mode ? branchOrderAlternateNames() : "subbranches" === mode ? branchOrderSubBranchesNames() : "antipodal" === mode ? branchOrderAntipodalNames() : "quadrant" === mode ? branchOrderQuadrantNames() : "branching" === mode ? branchOrderBranchingNames() : "complexity-antipodal" === mode ? branchOrderComplexityAntipodalNames() : branchOrderPopularityNames(), map = new Map;
            return order.forEach((name, i) => map.set(name, i)), branchOrderCacheMode = mode, branchOrderCacheMap = map, map;
        }
        // Build the complete map geometry, then run the layout passes in a fixed,
        // documented order. Default sibling radii are uniform.
        // P1 refactor (Build 2026-10-18_2227): fr (map geometry) split by
        // responsibility — frBuildTree builds the visible topic tree,
        // frAssignCategoryAngles the branch spoke angles,
        // frAllocateTopicSectors the gen-2/gen-3 sectors, frCloudLayout
        // the topic clouds, frClampCloudRadii the neighbor radius clamp,
        // and frCollisionPasses the collision/crossing passes. fr itself
        // is now a thin orchestrator.
