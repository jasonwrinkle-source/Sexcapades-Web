        // Fit-target registry (E4): target radii in final rendered
        // units, keyed by the same stable item identity as the
        // base-state registry above ('topic|<branch>|<topicId>',
        // 'subcat|<branch>|<label>', 'child|<branch>|<label>|<topicId>').
        // dkFitRevision increments on every registration change and
        // feeds the resolver signature (see dkRadialBaseInfo) through
        // dkFitTargetFor, so arming, retargeting, or clearing an item
        // invalidates its captured _radialBase20 and the next solve
        // recaptures under the new governing state; on disarm the fit
        // fields leave the signature and the item returns to legacy
        // behavior.
        const dkFitRegistry = new Map;
        let dkFitRevision = 0;
        // The most recent solve's branch sectors, kept so the driver
        // can enumerate the currently rendered items of a branch (fit
        // arming and fit reporting) by stable identity.
        let dkLastBranches = null;
        // Fit-target accessor (E3 contract, E4 wiring): the ONE read
        // point for fit state. Returns null ("no fit") for an unarmed
        // item, else { target, revision } for the item's stable key.
        // The signature and floor rules that consume it are unchanged
        // from E3: a fit-armed item's resolver floor IS its target.
        function dkFitTargetFor(key) {
            return dkFitRegistry.has(key) ? {
                target: dkFitRegistry.get(key),
                revision: dkFitRevision
            } : null;
        }
        // Convenience for solver sites that hold an item wrapper rather
        // than a key: the item's fit target, or null when unarmed. The
        // empty-registry fast path keeps every legacy solve path free of
        // per-item key work while no fit is registered, so non-fit
        // behavior (and cost) is unchanged.
        function dkFitTargetValueFor(item) {
            if (!dkFitRegistry.size) return null;
            const fit = dkFitTargetFor(dkRadialBaseInfo(item).key);
            return fit ? fit.target : null;
        }
        function dkSigNum(value) {
            const n = Number(value);
            return Number.isFinite(n) ? String(n) : "-";
        }
        function dkSigLen(map, key) {
            const entry = map ? map[key] : null;
            return entry && "object" == typeof entry ? dkSigNum(entry.length) : "-";
        }
        function dkSigArm(map, key) {
            const value = map ? map[key] : void 0;
            return !0 === value ? "1" : !1 === value ? "0" : "-";
        }
        // Stable identity + governing signature for one radial-resolver
        // item wrapper (E3, ASSESSMENT §2.4). Identity: branch name +
        // topic ID for gen-2 topics, branch name + subcategory label for
        // subcategory nodes, branch name + subcategory label + child
        // topic ID for subcategory children. The signature adds the
        // item's governing length overrides (branch / subcategory / kink,
        // as applicable), its group's auto-shrink arm/gate values, the
        // collision mode, the shared layout scalars the resolver's
        // geometry depends on (spokeLen / subLen / pad / repulsion /
        // fontScale), and — only when a fit target is registered for the
        // item — the fit target value and the fit-registry revision, so
        // a target change invalidates the captured base too. On disarm
        // the fit fields leave the key, the signature changes, and the
        // next resolver entry recaptures from the then-current
        // cloudRadius: the return to legacy behavior.
        function dkRadialBaseInfo(item) {
            let key = "item|" + String(item && item.label || ""), branch = "", subLabel = null, kinkId = null;
            if (item && item.child) {
                branch = String(item.branchName || item.child.branch || ""), subLabel = item.parentTopic ? String(item.parentTopic.label || "") : "", kinkId = null != item.child.id ? item.child.id : null, key = "child|" + branch + "|" + subLabel + "|" + String(null != item.child.id ? item.child.id : item.label || "");
            } else if (item && item.topic) {
                branch = String(item.branchName || ""), item.topic.isSubcategory ? (subLabel = String(item.topic.label || ""), key = "subcat|" + branch + "|" + subLabel) : (kinkId = null != item.topic.id ? item.topic.id : null, key = "topic|" + branch + "|" + String(null != item.topic.id ? item.topic.id : item.topic.label || ""));
            }
            const fit = dkFitTargetFor(key), fitTarget = null == fit ? NaN : Number(fit.target), parts = [ key, "bo=" + dkSigLen(mn.branchOverrides, branch), "so=" + (null != subLabel ? dkSigLen(mn.subcatOverrides, subLabel) : "-"), "ko=" + (null != kinkId ? dkSigLen(mn.kinkOverrides, kinkId) : "-"), "bsa=" + dkSigArm(mn.branchSpokeAutoShrink, branch), "ssa=" + (null != subLabel ? dkSigArm(mn.subcatSpokeAutoShrink, subLabel) : "-"), "cm=" + (null != mn.collision ? String(mn.collision) : "-"), "sl=" + dkSigNum(mn.spokeLen), "ul=" + dkSigNum(mn.subLen), "pd=" + dkSigNum(mn.pad), "rp=" + dkSigNum(mn.repulsion), "fs=" + dkSigNum(Number(mn.fontScale) || 1), "cs=" + dkSigNum(Number(mn.centerRingScale) || 1), Number.isFinite(fitTarget) ? "fit=" + dkSigNum(fitTarget) + "@" + dkSigNum(fit.revision) : "fit=-" ];
            return {
                key: key,
                sig: parts.join("|"),
                fit: Number.isFinite(fitTarget) ? fitTarget : null
            };
        }
        // Fit-target derivation (E4): a target is a MEASURED length —
        // the item's own label measured at its actual render font, plus
        // hub clearance and control/icon allowances, reusing the same
        // measurement primitives the solver already trusts (Za.measure
        // and the allowances inside rr.topicElementRadius). There is
        // deliberately no fixed shrink factor: every allowance is a
        // rendered length at the live font scale (mapFontScale), so a
        // target derived at fontScale 2 is twice the target derived at
        // fontScale 1 for the same item among the same siblings.
        function dkFitElementRadius(label, isSubcat, isChild) {
            const fs = mapFontScale(), iconR = sxIconRadius(isSubcat ? 2 : isChild ? 3 : 2), padRep = (Number(mn.pad) || 0) * (Number(mn.repulsion) || 0) * (mn.repulsionEnabled === !1 ? 0 : 1);
            let labelW = 0;
            try {
                labelW = Za.measure(label || "", isChild && !isSubcat ? sxFontCoef(3) : sxFontCoef(2));
            } catch (e) { __sxErrLog("layout-measure", e); }
            return Math.max(iconR + rr.ELEMENT_CLEARANCE * padRep * fs, iconR + rr.CONTROL_STATION * fs, labelW * fs / 2 + 34 * padRep * fs);
        }
        // The target for one item: far enough from its hub that its own
        // element clears the hub icon, and far enough out that its
        // element exactly meets each angular neighbor's element at the
        // sibling pitch the most recent solve delivered (the tighter
        // neighbor governs). Siblings carry { label, isSubcat, angle }.
        function dkFitComputeTarget(label, isSubcat, isChild, sibs, selfIdx) {
            const E = dkFitElementRadius(label, isSubcat, isChild), hubR = sxIconRadius(isChild ? 2 : 1);
            let target = hubR + E;
            const order = sibs.map((s, i) => i).sort((a, b) => sibs[a].angle - sibs[b].angle), pos = order.indexOf(selfIdx);
            return [ pos - 1, pos + 1 ].forEach(p => {
                if (p < 0 || p >= order.length) return;
                const nb = sibs[order[p]];
                let d = Math.abs(Math.atan2(Math.sin(nb.angle - sibs[selfIdx].angle), Math.cos(nb.angle - sibs[selfIdx].angle)));
                if (d < 1e-6 || d >= Math.PI) return;
                const need = (E + dkFitElementRadius(nb.label, nb.isSubcat, isChild && !nb.isSubcat)) / (2 * Math.sin(d / 2));
                Number.isFinite(need) && need > target && (target = need);
            }), Number.isFinite(target) && target > 0 ? target : null;
        }
        function dkFitFindRendered(key) {
            if (!dkLastBranches) return null;
            for (const b of dkLastBranches) {
                const topics = b.topics || [];
                for (const t of topics) {
                    if (dkRadialBaseInfo(t).key === key) return { wrapper: t, siblings: topics, isChild: !1 };
                    if (t.topic && t.topic.isSubcategory && t.children) for (const c of t.children) if (dkRadialBaseInfo(c).key === key) return { wrapper: c, siblings: t.children, isChild: !0 };
                }
            }
            return null;
        }
        // The currently rendered items of one branch — gen-2 topics,
        // subcategory nodes, and subcategory children — as wrappers
        // from the most recent solve.
        function dkFitBranchItems(branchName) {
            const out = [];
            if (!dkLastBranches) return out;
            const sector = dkLastBranches.find(b => b.entry && b.entry.branch && b.entry.branch.name === branchName);
            if (!sector) return out;
            return (sector.topics || []).forEach(t => {
                out.push(t), t.topic && t.topic.isSubcategory && (t.children || []).forEach(c => out.push(c));
            }), out;
        }
        function dkComputeFitTarget(key) {
            const rendered = dkFitFindRendered(key);
            let label = null, isSubcat = !1, isChild = !1, sibs = null, selfIdx = -1;
            if (rendered) {
                const w = rendered.wrapper;
                rendered.isChild ? (label = w.child ? w.child.label : w.label, isChild = !0) : (label = w.topic ? w.topic.label : w.label, isSubcat = !!(w.topic && w.topic.isSubcategory)), sibs = rendered.siblings.map(s => ({
                    label: s.topic ? s.topic.label : s.child ? s.child.label : s.label,
                    isSubcat: !!(s.topic && s.topic.isSubcategory),
                    angle: Number(s.cloudAngle) || 0
                })), selfIdx = rendered.siblings.indexOf(w);
            } else {
                const parts = String(key || "").split("|"), branch = h.find(b => b.name === parts[1]);
                if (!branch) return null;
                if ("topic" === parts[0] || "subcat" === parts[0]) {
                    const gen2 = branch.subcategories && branch.subcategories.length ? (branch.parentTopics || []).map(l => ({ label: l, isSubcat: !1 })).concat(branch.subcategories.map(s => ({ label: s.name, isSubcat: !0 }))) : (branch.topics || []).map(l => ({ label: l, isSubcat: !1 }));
                    "subcat" === parts[0] ? (label = parts[2], isSubcat = !0, selfIdx = gen2.findIndex(s => s.isSubcat && s.label === label)) : (label = topicLabelById[parts[2]] || null, selfIdx = gen2.findIndex(s => !s.isSubcat && s.label === label));
                    if (null == label || selfIdx < 0) return null;
                    const step = gen2.length ? er.spread / gen2.length : 0;
                    sibs = gen2.map((s, i) => ({ label: s.label, isSubcat: s.isSubcat, angle: i * step }));
                } else if ("child" === parts[0]) {
                    const sub = (branch.subcategories || []).find(s => s.name === parts[2]);
                    if (!sub) return null;
                    label = topicLabelById[parts[3]] || null, isChild = !0;
                    if (null == label) return null;
                    const labels = sub.topics || [];
                    if ((selfIdx = labels.indexOf(label)) < 0) return null;
                    const angles = rr.childFanAngles(0, labels.length, rr.stepForRadius(rr.cloudRadiusFor(labels.length)));
                    sibs = labels.map((l, i) => ({ label: l, isSubcat: !1, angle: Number(angles[i]) || 0 }));
                } else return null;
            }
            return null == label || !sibs || selfIdx < 0 ? null : dkFitComputeTarget(label, isSubcat, isChild, sibs, selfIdx);
        }
        // Refresh one item's delivered cloudRadius in the base-state
        // registry at solve end (E4). Only identities the resolver has
        // already captured gain a delivered field, so baseState()'s
        // unknown-key behavior is unchanged.
        // NAME-LENGTH FIT TARGET (ruled 2026-11-01 01:44, Jason):
        // a subcategory's shrink floor is the length of its own
        // name — hub clearance plus its own label's element
        // radius, with NO neighbour-pitch term. dkFitComputeTarget
        // takes the max of this base and each neighbour's pitch
        // need, so in a crowded fan the neighbour term can sit at
        // or above the thrown radius, and a ladder floored there
        // holds at the thrown length without ever attempting a
        // step down (the long unshrunk subcategory branches of
        // the 2026-11-01 inspection). The name target is that
        // computation's base component alone: the item's own fit
        // length, reachable from the thrown length.
        function dkNameFitTarget(label, isSubcat, isChild) {
            if (null == label) return null;
            const E = dkFitElementRadius(label, isSubcat, isChild), hubR = sxIconRadius(isChild ? 2 : 1), target = hubR + E;
            return Number.isFinite(target) && target > 0 ? target : null;
        }
        function dkNameFitTargetForKey(key) {
            const rendered = dkFitFindRendered(key);
            if (rendered) {
                const w = rendered.wrapper;
                return rendered.isChild ? dkNameFitTarget(w.child ? w.child.label : w.label, !1, !0) : dkNameFitTarget(w.topic ? w.topic.label : w.label, !!(w.topic && w.topic.isSubcategory), !1);
            }
            const parts = String(key || "").split("|");
            if ("subcat" === parts[0]) return dkNameFitTarget(parts[2], !0, !1);
            if ("topic" === parts[0]) return dkNameFitTarget(topicLabelById[parts[2]] || null, !1, !1);
            if ("child" === parts[0]) return dkNameFitTarget(topicLabelById[parts[3]] || null, !1, !0);
            return null;
        }
        function dkRecordDelivered(item) {
            if (!item || !Number.isFinite(item.cloudRadius)) return;
            const key = dkRadialBaseInfo(item).key, prev = dkBaseStates.get(key);
            prev && dkBaseStates.set(key, {
                base: prev.base,
                sig: prev.sig,
                delivered: item.cloudRadius
            });
        }
        // Scoped-solve capture (Stage 3, T2): snapshot everything the
        // freeze replay needs for the frozen branches, taken from the
        // last solved tree (dkLastBranches — the delivered truth the
        // bundle retains) BEFORE the patch is applied. Per frozen
        // branch: the sector's angle / topicCloudRadius /
        // topicCloudRadiusBase, the taxonomy branch's _spokeAdjust20,
        // and per rendered node — keyed by the node's data-layout-key
        // (branch catId, topic id, child id) — the wrapper fields the
        // paint path derives its position from (cloudAngle /
        // cloudRadius / angle / cloudIndex / childCloudRadius), at
        // full internal precision. Plus every delivered-geometry
        // registry entry (dkBaseStates) belonging to a frozen branch's
        // items, for the post-solve registry merge.
        function scCaptureFrozen(frozen) {
            const cap = { branches: new Map, baseStates: new Map };
            (dkLastBranches || []).forEach(sec => {
                const bname = sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
                if (!bname || !frozen.has(bname) || cap.branches.has(bname)) return;
                const b = {
                    angle: sec.angle,
                    topicCloudRadius: sec.topicCloudRadius,
                    topicCloudRadiusBase: sec.topicCloudRadiusBase,
                    spokeAdjust: Number(sec.entry.branch._spokeAdjust20) || 0,
                    topics: new Map
                };
                (sec.topics || []).forEach(t => {
                    if (!t.topic || null == t.topic.id) return;
                    const tc = {
                        cloudAngle: t.cloudAngle,
                        cloudRadius: t.cloudRadius,
                        angle: t.angle,
                        cloudIndex: t.cloudIndex,
                        childCloudRadius: t.childCloudRadius,
                        children: new Map
                    };
                    (t.children || []).forEach(ch => {
                        if (!ch.child || null == ch.child.id) return;
                        tc.children.set(String(ch.child.id), {
                            cloudAngle: ch.cloudAngle,
                            cloudRadius: ch.cloudRadius,
                            angle: ch.angle,
                            childCloudRadius: ch.childCloudRadius
                        });
                    }), b.topics.set(String(t.topic.id), tc);
                }), cap.branches.set(bname, b);
            });
            return dkBaseStates.forEach((v, k) => {
                const seg = String(k).split("|");
                seg.length > 1 && frozen.has(seg[1]) && cap.baseStates.set(k, {
                    base: v.base,
                    sig: v.sig,
                    delivered: v.delivered
                });
            }), cap;
        }
        // Scoped-solve delivered centers (Stage 3, T2): the currently
        // rendered data-layout-x/y of every frozen branch's nodes,
        // read from the live DOM before the patch is applied, keyed
        // by data-layout-key (branch membership via the qn registry
        // the last paint built). The post-paint settle pass in Ar()
        // seats a frozen node at exactly this center (see the settle
        // search guard there): the solved-tree replay alone cannot
        // reproduce a delivered position the settle search itself
        // produced, because that search is a global, DOM-ordered
        // pass over rendered label/control geometry.
        function scCaptureDeliveredCenters(frozen, opts) {
            const centers = new Map;
            if (opts && opts.paintComposition) {
                // CORRECT-SOURCE CAPTURE (ruled 2026-11-01, per
                // CENTRE-CAPTURE-DIAGNOSIS.md): the Anneal closing
                // paint's centres, composed from the solve registry
                // (dkLastBranches — at this call the restored-kept
                // solve) with the PAINT'S OWN seating arithmetic.
                // Never the solver-model length (rr.renderedSpokeLength
                // inflates every spoke by the layout multipliers and
                // the collision factor the paint never applies) and
                // never the pre-run page centres. Hub: rr.branchAnchor
                // — centre + sector angle x yr(branch), the point Ar
                // seats the category icon at. Topic: the delivered
                // radius Ar finalizes at its draw site —
                // topicSpokeEstimate over (cloudRadius ||
                // topicCloudRadius), the subcategory hub floor via
                // hubSpokeLength, then exactly ONE length override
                // (subcatOverrides by label / kinkOverrides by id;
                // the composition dkDeliveredItemRadius mirrors) —
                // placed along cloudAngle; Ar routes that endpoint
                // through Ya, whose icon point is the endpoint
                // itself. Child: Ar's static-child composition —
                // (cloudRadius || parent childCloudRadius || 270) x
                // the child's kink multiplier, extended by Ar's
                // label-clearance loop — placed along cloudAngle
                // from the parent's composed centre. The per-item
                // fields consumed (registry cloudRadius / cloudAngle
                // and the override multiplier applied, with the
                // composed centre) ride on the returned map as
                // captureFields, for the DIAG-03 readout.
                const fields = new Map;
                try {
                    (dkLastBranches || []).forEach(sec => {
                        if (!sec || !sec.entry || !sec.entry.branch || !frozen.has(sec.entry.branch.name)) return;
                        const bname = sec.entry.branch.name, anchor = rr.branchAnchor(sec);
                        if (!anchor || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) return;
                        sec.entry.catId && centers.set(sec.entry.catId, {
                            x: anchor.x,
                            y: anchor.y
                        }), (sec.topics || []).forEach(t => {
                            if (!t || !t.topic || null == t.topic.id) return;
                            const label = t.topic.label || "", isSub = !!t.topic.isSubcategory, est = Za.topicSpokeEstimate(label, t.cloudRadius || sec.topicCloudRadius);
                            let h = est.spokeLength;
                            if (isSub) h = Math.max(h, pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96, sxSpokeBase(t.cloudCount)), h = Za.hubSpokeLength(label, est.fontSize, h, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                            const ov = isSub ? mn.subcatOverrides && mn.subcatOverrides[label] : mn.kinkOverrides && mn.kinkOverrides[t.topic.id], mul = ov && Number(ov.length) > 0 ? Number(ov.length) : 1;
                            h = h * mul;
                            const tp = {
                                x: anchor.x + Math.cos(t.cloudAngle) * h,
                                y: anchor.y + Math.sin(t.cloudAngle) * h
                            };
                            if (!Number.isFinite(tp.x) || !Number.isFinite(tp.y)) return;
                            centers.set(t.topic.id, tp), fields.set(String(t.topic.id), {
                                kind: isSub ? "subcat" : "topic",
                                branch: bname,
                                label: label,
                                cloudRadius: null == t.cloudRadius ? null : Number(t.cloudRadius),
                                cloudAngle: null == t.cloudAngle ? null : Number(t.cloudAngle),
                                override: mul,
                                radius: Math.round(100 * h) / 100,
                                centre: {
                                    x: Math.round(100 * tp.x) / 100,
                                    y: Math.round(100 * tp.y) / 100
                                }
                            }), (t.children || []).forEach(ch => {
                                if (!ch || !ch.child || null == ch.child.id || !ch.child.isStaticTopic) return;
                                const ko = mn.kinkOverrides && mn.kinkOverrides[ch.child.id], kmul = ko && Number(ko.length) > 0 ? Number(ko.length) : 1;
                                let r = (ch.cloudRadius || t.childCloudRadius || 270) * kmul;
                                r = sxLabelClearance(r, ch.child.label);
                                const cp = {
                                    x: tp.x + Math.cos(ch.cloudAngle) * r,
                                    y: tp.y + Math.sin(ch.cloudAngle) * r
                                };
                                if (!Number.isFinite(cp.x) || !Number.isFinite(cp.y)) return;
                                centers.set(ch.child.id, cp), fields.set(String(ch.child.id), {
                                    kind: "child",
                                    branch: bname,
                                    label: ch.child.label || "",
                                    cloudRadius: null == ch.cloudRadius ? null : Number(ch.cloudRadius),
                                    cloudAngle: null == ch.cloudAngle ? null : Number(ch.cloudAngle),
                                    override: kmul,
                                    radius: Math.round(100 * r) / 100,
                                    centre: {
                                        x: Math.round(100 * cp.x) / 100,
                                        y: Math.round(100 * cp.y) / 100
                                    }
                                });
                            });
                        });
                    });
                } catch (_) { __sxErrLog("layout-scoped-centers", _); }
                return centers.captureFields = fields, centers;
            }
            if (dkCtx) {
                // Interim (capsule-only paint, 2026-10-31): while an
                // Anneal run is live the full map is not repainted, so
                // frozen centres are taken from the solve registry
                // (dkLastBranches) in the solver's own position model
                // — rr.branchAnchor for the category node,
                // rr.topicPosition for topics, hub + cloudAngle /
                // cloudRadius for children (the arithmetic
                // rr._lineEndpoint uses) — never from the last full
                // paint's DOM positions.
                try {
                    (dkLastBranches || []).forEach(sec => {
                        if (!sec || !sec.entry || !sec.entry.branch || !frozen.has(sec.entry.branch.name)) return;
                        const anchor = rr.branchAnchor(sec);
                        anchor && Number.isFinite(anchor.x) && Number.isFinite(anchor.y) && sec.entry.catId && centers.set(sec.entry.catId, {
                            x: anchor.x,
                            y: anchor.y
                        }), (sec.topics || []).forEach(t => {
                            if (!t || !t.topic) return;
                            const tp = rr.topicPosition(sec, t, anchor);
                            tp && Number.isFinite(tp.x) && Number.isFinite(tp.y) && centers.set(t.topic.id, {
                                x: tp.x,
                                y: tp.y
                            }), (t.children || []).forEach(ch => {
                                if (!ch || !ch.child) return;
                                const cr = ch.cloudRadius || 0;
                                centers.set(ch.child.id, {
                                    x: tp.x + Math.cos(ch.cloudAngle) * cr,
                                    y: tp.y + Math.sin(ch.cloudAngle) * cr
                                });
                            });
                        });
                    });
                } catch (_) { __sxErrLog("layout-scoped-centers", _); }
                return centers;
            }
            try {
                In.querySelectorAll("[data-layout-key]").forEach(el => {
                    const key = el.dataset.layoutKey, info = qn[key];
                    info && info.branch && frozen.has(info.branch) && centers.set(key, {
                        x: Number(el.dataset.layoutX),
                        y: Number(el.dataset.layoutY)
                    });
                });
            } catch (_) { __sxErrLog("layout-scoped-centers", _); }
            return centers;
        }
        // Scoped-solve ring-auto (Stage 3, T5): the declared ring
        // for a target set, computed from PRE-OP delivered geometry
        // only — the branch centres the last paint delivered (the
        // category nodes' data-layout-x/y, the same delivered
        // centres scCaptureDeliveredCenters reads) — following the
        // §2.3 formula the T4 containment matrix was proved
        // RETIRED (ruled 2026-11-01 01:52, Jason): no live caller
        // remains — applyScoped no longer computes or honours a
        // ring (see the commented-out ring lines there). Kept in
        // the code, not deleted, per the comment-out rule.
        // against: ring(B) = {angular neighbours of B, branches in
        // centre-angle order around the map centre (900, 620)}
        // ∪ {branches whose nearest other centre is B} ∪ {the
        // branch that is B's own nearest other centre}; for a
        // multi-branch target the ring is the union over targets,
        // minus the targets themselves. Called by applyScoped
        // before the patch applies, only when the caller omitted
        // scope.ring; an explicit ring is never recomputed.
        // RING COMPUTATION COMMENTED OUT (ruled 2026-11-01 01:53,
        // Jason: "throw out" = comment out, never delete): the
        // whole auto-ring computation — angular neighbours,
        // nearest-neighbour, reverse-nearest — stands below as
        // comment, with its call site in applyScoped. Nothing in
        // the live code calls it.
        // function scComputeAutoRing(targetSet, names) {
//             const ring = new Set;
//             try {
//                 const centers = new Map;
//                 if (dkCtx) {
//                     // Interim (capsule-only paint, 2026-10-31): while
//                     // an Anneal run is live the full map is not
//                     // repainted, so category centres come from the
//                     // solve registry (dkLastBranches) through the
//                     // solver's own anchor arithmetic.
//                     // rr.branchAnchor(sector) is exactly the point
//                     // the paint writes as the category node's
//                     // data-layout-x/y (Xa(angle, yr(branch)) in the
//                     // draw loop), and category nodes are never moved
//                     // by the settle search, so these are the same
//                     // values the DOM read returned — taken from the
//                     // approximation instead of the last full paint.
//                     (dkLastBranches || []).forEach(sec => {
//                         if (!sec || !sec.entry || !sec.entry.branch) return;
//                         const bn = sec.entry.branch.name;
//                         if (centers.has(bn)) return;
//                         const a = rr.branchAnchor(sec);
//                         a && Number.isFinite(a.x) && Number.isFinite(a.y) && centers.set(bn, {
//                             x: a.x,
//                             y: a.y
//                         });
//                     });
//                 } else In.querySelectorAll("[data-layout-key]").forEach(el => {
//                     const info = qn[el.dataset.layoutKey];
//                     if (info && "Category" === info.kind && info.branch && !centers.has(info.branch)) {
//                         const x = Number(el.dataset.layoutX), y = Number(el.dataset.layoutY);
//                         Number.isFinite(x) && Number.isFinite(y) && centers.set(info.branch, {
//                             x: x,
//                             y: y
//                         });
//                     }
//                 });
//                 const ordered = names.filter(n => centers.has(n)).sort((a, b) => Math.atan2(centers.get(a).y - 620, centers.get(a).x - 900) - Math.atan2(centers.get(b).y - 620, centers.get(b).x - 900)), nearest = new Map;
//                 centers.forEach((c, X) => {
//                     let best = null, bestD = Infinity;
//                     centers.forEach((o, Y) => {
//                         if (Y === X) return;
//                         const d = (o.x - c.x) * (o.x - c.x) + (o.y - c.y) * (o.y - c.y);
//                         d < bestD && (bestD = d, best = Y);
//                     }), null !== best && nearest.set(X, best);
//                 }), targetSet.forEach(B => {
//                     const i = ordered.indexOf(B);
//                     if (i >= 0 && ordered.length > 2) ring.add(ordered[(i + ordered.length - 1) % ordered.length]), ring.add(ordered[(i + 1) % ordered.length]);
//                     const n = nearest.get(B);
//                     n && ring.add(n);
//                 }), nearest.forEach((n, X) => {
//                     targetSet.has(n) && ring.add(X);
//                 });
//             } catch (_) { __sxErrLog("layout-scoped-ring", _); }
//             return targetSet.forEach(B => ring.delete(B)), Array.from(ring);
//         }
        // Scoped-solve freeze replay (Stage 3, T2): run inside fr() at
        // solve completion, after the delivered-registry refresh,
        // before paint reads the tree. Restores every frozen branch's
        // solved geometry and _spokeAdjust20 verbatim from the capture,
        // so the paint path re-derives the frozen nodes'
        // data-layout-x/y strings identically to the pre-op render;
        // then merges the delivered-geometry registry — entries for
        // recompute-set items keep this solve's refresh, entries for
        // frozen items are retained from the pre-solve snapshot
        // (frozen entries the solve created are dropped, frozen
        // entries it overwrote or resolved away are put back). Every
        // frozen branch's replay is recorded in the context's
        // boundaryLog.
        function scRestoreFrozen(sectors, ctx) {
            const cap = ctx.capture;
            if (!cap) return;
            sectors.forEach(sec => {
                const bname = sec.entry && sec.entry.branch ? sec.entry.branch.name : null;
                if (!bname || !ctx.frozenBranches.has(bname)) return;
                const b = cap.branches.get(bname);
                if (!b) return void ctx.boundaryLog.push({
                    type: "freeze-miss",
                    branch: bname
                });
                sec.angle = b.angle, sec.topicCloudRadius = b.topicCloudRadius, sec.topicCloudRadiusBase = b.topicCloudRadiusBase, sec.entry.branch._spokeAdjust20 = b.spokeAdjust;
                let nodes = 1;
                (sec.topics || []).forEach(t => {
                    if (!t.topic || null == t.topic.id) return;
                    const tc = b.topics.get(String(t.topic.id));
                    if (!tc) return;
                    t.cloudAngle = tc.cloudAngle, t.cloudRadius = tc.cloudRadius, t.angle = tc.angle, t.cloudIndex = tc.cloudIndex, t.childCloudRadius = tc.childCloudRadius, nodes++;
                    (t.children || []).forEach(ch => {
                        if (!ch.child || null == ch.child.id) return;
                        const cc = tc.children.get(String(ch.child.id));
                        cc && (ch.cloudAngle = cc.cloudAngle, ch.cloudRadius = cc.cloudRadius, ch.angle = cc.angle, ch.childCloudRadius = cc.childCloudRadius, nodes++);
                    });
                }), ctx.boundaryLog.push({
                    type: "freeze-replay",
                    branch: bname,
                    nodes: nodes,
                    spokeAdjust: b.spokeAdjust
                });
            });
            const drop = [];
            dkBaseStates.forEach((v, k) => {
                const seg = String(k).split("|");
                seg.length > 1 && ctx.frozenBranches.has(seg[1]) && !cap.baseStates.has(k) && drop.push(k);
            }), drop.forEach(k => dkBaseStates.delete(k)), cap.baseStates.forEach((v, k) => {
                dkBaseStates.set(k, {
                    base: v.base,
                    sig: v.sig,
                    delivered: v.delivered
                });
            });
        }
        // DeKnotter cascade driver (E5, ASSESSMENT §3.4, §3.7, §5.6,
        // §5.8, §5.11): one full run for one branch, driven entirely
        // through the bundle layout API — never the editor shell's
        // collect()/apply — so no intermediate state is broadcast to
        // other windows mid-run. Sequence: subcategory-label check →
        // precondition staging → snapshot + double baseline → throw
        // (branch x50, subcategories x20, kinks autofit to
        // three times their kink (fit) length — full cascade
        // armed, ONE applyPhase commit) →
        // FINE-TUNE (ruled 2026-10-29): when the
        // cascade baseline (measured twice, above) is strictly below
        // 5, zero included, the throw is SKIPPED — a staging-and-
        // arming commit lands the throw's staged values and full
        // arming minus its length changes, the shrink ladders run
        // from the branch's current lengths under the per-phase
        // gate only (flat GATE_TOL 2; the fine-tune margin and the
        // onset margin were deleted Phase 4, 2026-11-04 — the
        // skip-throw under 5 is unchanged), and the branch ladder
        // descends to a
        // label-fit floor instead of stopping at the pre-run length
        // → ruled shrink sequence (Jason,
        // 2026-10-24 adjustment: subcategory nodes first, then the
        // branch itself, each level descending a square-root-step ladder of
        // committed sub-solves toward its label-fit floor under the
        // per-phase gate (flat 2) — a level's ladder halts when that
        // gate trips, and the cascade proceeds to the
        // next level; there is NO kink shrink stage in the cascade —
        // kinks keep their thrown autofit room (3x the kink
        // length, 2026-11-01); the kink shrink to
        // label length is a separate one-time driver normalization,
        // deknotter.shrinkKinksToLabel) → scoped same-branch GROWTH
        // (ruled 2026-10-28: grow-branch then grow-subcats ratio
        // patches, dominance-gated, laddered at 1.25x steps to a 3x
        // cumulative target — see stepGrowth in dkRunCascade) → a
        // CONSTRUCTED final patch (§3.7: arm maps and staged values
        // back to their exact pre-run values, the onset-held length
        // overrides carried into per-item length overrides exactly
        // as they stand after the ladders, fit registrations
        // cleared) → the
        // E2 gate on the branch's own-cloud crossing number (Q4:
        // repointed from the local xAreaCross area, which is now
        // reported secondary only), exact-float improve-or-hold.
        // Q2 adds a per-phase gate on the same record.cloud
        // readout; its trip consequence is back-up-a-step (ruled
        // 2026-10-28, all phases): the tripping step is discarded,
        // the last-kept phase snapshot is restored, that level's
        // ladder stops, and the cascade continues — only the final
        // gate still reverts a whole run. Any other failure or
        // exception restores the
        // pre-run snapshot through restore() and verifies the restore
        // canonically; every exit path ends the run context and
        // leaves the branch's fit registry empty.
        function dkMedian(values) {
            if (!values.length) return null;
            const sorted = values.slice().sort((a, b) => a - b), mid = sorted.length >> 1;
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }
        function dkRange(values) {
            return values.length ? [ Math.min.apply(null, values), Math.max.apply(null, values) ] : null;
        }
        // Q2 staged shrink ladder (Phase Q2): the cascade's fit
        // movement descends in small steps, never in one chop from a
        // thrown radius to the label-fit floor. SHRINK STEP (ruled
        // 2026-11-02, Jason — supersedes the 2026-11-01 uniform
        // 10%-of-current step): the steps are UNEQUAL, large at
        // first then small toward the end, with each step's size in
        // proportion to the SQUARE ROOT of the steps remaining at
        // that step (the first step is weighted sqrt(N), the next
        // sqrt(N-1), …, the last sqrt(1)). The step count is FIXED
        // at DK_SHRINK_STEPS_FIXED = 7 for every descent, so the
        // largest step is sqrt(7) ≈ 2.65 times the smallest and the
        // final stage lands exactly on the floor: a 100 → 30 descent
        // drops about 14, 13, 12, 10, 9, 7, 5. Logarithmic steps
        // were considered and REJECTED in the same ruling — no
        // logarithmic option exists here. This one computation is
        // shared by the subcategory ladder and the branch ladder,
        // on the normal (throw) path and on the skip-throw-under-5
        // path alike. An item already at or below its floor never
        // grows — it holds.
        const DK_SHRINK_STEPS_FIXED = 7, DK_LADDER_MAX_STAGES = 512;
        function dkLadderSteps(from, to) {
            if (!Number.isFinite(from) || !Number.isFinite(to) || !(from > to) || !(to > 0)) return 0;
            return DK_SHRINK_STEPS_FIXED;
        }
        function dkLadderValue(from, to, stage, stages) {
            if (!Number.isFinite(from) || !Number.isFinite(to) || !(from > to)) return from;
            const n = Number.isFinite(stages) && stages > 0 ? Math.floor(stages) : DK_SHRINK_STEPS_FIXED, s = Number.isFinite(stage) ? Math.floor(stage) : 0;
            if (s <= 0) return from;
            if (s >= n) return to;
            let total = 0, cum = 0;
            for (let r = 1; r <= n; r++) total += Math.sqrt(r);
            for (let i = 0; i < s; i++) cum += Math.sqrt(n - i);
            return from - (from - to) * (cum / total);
        }
        // Q2: one phase record's fit-deviation count, out of its
        // limiter-hit slice — surfaced per phase and totalled into
        // the run report so the receipt lead can carry it.
        function dkFitDeviationCount(entries) {
            let n = 0;
            return (entries || []).forEach(e => {
                e && "fit-deviation" === e.type && n++;
            }), n;
        }
        // One rendered item's delivered radius: the distance from its
        // hub at which the draw path places the item, recomputed with
        // the draw path's own arithmetic (topicSpokeEstimate,
        // subcategory hub floors via hubSpokeLength, per-item
        // length-override multipliers; children ride Ar's drawn
        // radius — solved radius times their kink multiplier,
        // extended by Ar's label-clearance loop, as Ar paints it).
        // A phase's
        // delivered ratio is post-phase delivered ÷ pre-run delivered
        // on this same measure.
        function dkDeliveredItemRadius(item) {
            if (!item) return NaN;
            if (item.child) {
                const ko = mn.kinkOverrides && item.child.id ? mn.kinkOverrides[item.child.id] : null;
                // ONE GEOMETRY SOURCE (divergence fix, 2026-11-02):
                // the delivered radius of a static child is the
                // radius Ar's paint actually draws — the solved
                // radius (with the parent's childCloudRadius
                // fallback Ar uses) times the kink multiplier,
                // extended by Ar's label-clearance loop when the
                // spoke is too short for its label. This reading
                // used the unextended solved radius, so the
                // ladders and receipts stepped on lengths the
                // paint never drew.
                let r = (Number(item.cloudRadius) || Number(item.childCloudRadius) || 270) * (ko && Number(ko.length) > 0 ? Number(ko.length) : 1);
                r = sxLabelClearance(r, item.child.label);
                return r;
            }
            const t = item.topic;
            if (!t) return NaN;
            const est = Za.topicSpokeEstimate(t.label || "", Number(item.cloudRadius) || 0);
            let h = est.spokeLength;
            if (t.isSubcategory) {
                h = Math.max(h, pr.categoryIcon / 2 + pr.subcategoryIcon / 2 + 96, sxSpokeBase(item.cloudCount)), h = Za.hubSpokeLength(t.label || "", est.fontSize, h, pr.categoryIcon / 2, pr.subcategoryIcon / 2);
                const so = mn.subcatOverrides && mn.subcatOverrides[t.label];
                return h * (so && Number(so.length) > 0 ? Number(so.length) : 1);
            }
            const ko = mn.kinkOverrides && t.id ? mn.kinkOverrides[t.id] : null;
            return h * (ko && Number(ko.length) > 0 ? Number(ko.length) : 1);
        }
        // Delivered radii for every currently rendered item of one
        // branch, keyed by stable identity, plus the branch's own
        // delivered spoke radius (yr() on the taxonomy branch object,
        // whose _spokeAdjust20 the last solve left in place).
        function dkDeliveredRadii(branchName) {
            const items = {};
            dkFitBranchItems(branchName).forEach(w => {
                items[dkRadialBaseInfo(w).key] = dkDeliveredItemRadius(w);
            });
            const branchObj = h.find(b => b.name === branchName);
            return { items: items, branch: branchObj ? yr(branchObj) : NaN };
        }
        // Taxonomy facts for one branch: its subcategory labels, the
        // topic IDs of every kink in it (gen-2 topics and subcategory
        // children alike — entry.topics is the full union), and the
        // total item count (topics + subcategory hubs) that the
        // coverage record compares the rendered/acted-on count to.
        function dkBranchTaxonomy(branchName) {
            const entry = h.find(b => b.name === branchName);
            if (!entry) return null;
            const subLabels = (entry.subcategories || []).map(s => s.name), kinkIds = [];
            return (entry.topics || []).forEach(l => {
                const id = topicIdByLabel[sxName(l)] || (l && l.id);
                null != id && kinkIds.push(id);
            }), { entry: entry, subLabels: subLabels, kinkIds: kinkIds, total: (entry.topics || []).length + subLabels.length };
        }
        // SOLVER-METRICS REFACTOR (F4): dkRunCascade is a thin
        // orchestrator over named phase steps — stepLabelCheck,
        // stepPreconditions, stepBaseline, the shared phase runner
        // (runPhase), stepThrow, stepOnsetSetup, stepShrinkLadders,
        // stepGrowth, stepFinalPatch, then the final gate in the orchestrator.
        // Each step closes over the shared run state (report above
        // all) and returns its piece; the phase order and the
        // phase-boundary yields inside runPhase are unchanged, so
        // the busy readout still paints between phases.
        function dkBakeGate(report) {
            try {
                const sumNb = o => o ? Object.keys(o).reduce((a, k) => a + (Number(o[k]) || 0), 0) : 0;
                const bkBase = (Number(report.baseline.first) || 0) + sumNb(report.neighbors.baseline), bkFin = (Number(report.finalCloud) || 0) + sumNb(report.neighbors.final);
                report.bakeGate = { metric: "crossingnumber-total", baseline: bkBase, final: bkFin, delta: bkFin - bkBase, limit: SX_SCORE.BAKE_GATE_LIMIT, pass: bkFin - bkBase < SX_SCORE.BAKE_GATE_LIMIT };
            } catch (e) { report.bakeGate = null; }
        }
        function tallyFitDev(report) {
            return report.phases.reduce((s, p) => s + (p && p.fitDeviationCount || 0), 0);
        }
        function clearBranchFit(dk, name) {
            Object.keys(dk.fitTargets()).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && dk.clearFitTarget(k);
            });
        }
        function diagRound(v) {
            return null == v || !Number.isFinite(Number(v)) ? null : Math.round(100 * Number(v)) / 100;
        }
        function diagCameraText(cam, label) {
            return label + ": scale " + (cam && null != cam.scale ? cam.scale : "\u2014") + " \u00b7 translate " + (cam && null != cam.tx ? cam.tx : "\u2014") + ", " + (cam && null != cam.ty ? cam.ty : "\u2014");
        }
        function yieldNow() {
            return new Promise(r => { let done = false; const fin = () => { if (!done) { done = true; r(); } }; requestAnimationFrame(() => requestAnimationFrame(fin)); setTimeout(fin, 60); });
        }
        let lastKeptSnapshot;
        function captureKept(dk, refreshKeptFit, name) {
            lastKeptSnapshot = dk.snapshot(), refreshKeptFit(dk, name);
        }
        let witnessFrameSeq;
        let witnessLastFrame;
        function witnessFrame(event, phase, radii, witnessSubs, name, report, dk) {
            const frame = { i: witnessFrameSeq++, event: event, phase: phase || null, subs: witnessSubs(radii || dkDeliveredRadii(name), dk) };
            return witnessLastFrame = frame, report.witness.frames.length < 600 && report.witness.frames.push(frame), dkLog.push({ type: "witness-frame", event: event, phase: frame.phase, subs: frame.subs }), frame;
        }
        function witnessRestore(event, phase, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP) {
            const before = witnessLastFrame, after = witnessFrame(event, phase, null, witnessSubs, name, report, dk);
            return witnessJudge(event, phase, witnessTrippingLabel, before, after, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report);
        }
        let lastKeptFit;
        function refreshKeptFit(dk, name) {
            const fit = {}, all = dk.fitTargets();
            Object.keys(all).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && (fit[k] = all[k]);
            }), lastKeptFit = fit;
        }
        function witnessSubs(radii, dk) {
            const subs = {}, snap = dk.snapshot(), ov = snap && snap.subcatOverrides ? snap.subcatOverrides : {};
            return Object.keys(radii && radii.items || {}).forEach(k => {
                if ("subcat" !== k.split("|")[0]) return;
                const label = k.split("|")[2], d = radii.items[k];
                subs[label] = { d: Number.isFinite(d) ? Math.round(d * 1e4) / 1e4 : null, o: ov[label] && Number(ov[label].length) > 0 ? Number(ov[label].length) : null };
            }), subs;
        }
        function witnessPaintedFrame(stage, operation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg) {
            try {
                const g = dkPaintedGeometry(stage, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                g.operation = operation || null;
                dkLog.push({ type: "witness-painted-frame", stage: stage, operation: g.operation, source: g.source, blitActive: g.blitActive, subs: g.subs });
                return g;
            } catch (e) { return null; }
        }
        function diagClosingLines(snap) {
            if (!snap.closingPaint) return [];
            const cp = snap.closingPaint, lines = [ "closing-paint mode: " + cp.mode ];
            lines.push(cp.scopedPaint ? "closing-paint scoped-paint: retained " + cp.scopedPaint.retained + " / captured " + cp.scopedPaint.captured + " / diverged " + cp.scopedPaint.diverged : "closing-paint scoped-paint: no entry");
            lines.push("closing-paint segment-timing: " + (cp.segmentTiming ? "present" : "absent"));
            lines.push(diagCameraText(snap.camera, "camera at DIAG-03"));
            return lines;
        }
        async function diagPause(code, label, extra, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields) {
            if (!diagAcceptCtx || !opts || "function" != typeof opts.onDiagPause) return;
            const snap = diagSnapshot(code, label, extra, name, tax, diagAcceptCtx, diagCaptureFields);
            (report.diag || (report.diag = [])).push(snap);
            dkLog.push({ type: "anneal-diag", code: code, phase: snap.phase, branch: name, text: snap.text });
            try { console.log("[" + code + "] " + snap.text, snap); } catch (e) {}
            try { await opts.onDiagPause(snap); } catch (e) {}
        }
        let throwBracketBefore;
        async function throwBracketPoint(code, throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report) {
            const stamp = code + ":first-throw";
            const label = "THROW-BEFORE" === code ? "pre-throw full paint \u2192 stepThrow" : "stepThrow \u2192 post-throw full paint";
            const paintInfo = await throwBracketFullPaint(stamp, name, dkPaintedNodeCentre, tax);
            const snap = throwBracketSnapshot(code, label, stamp, paintInfo, name, tax, report);
            if ("THROW-BEFORE" === code) throwBracketBefore = snap;
            if (opts && "function" == typeof opts.onThrowBracketPause) { try { await opts.onThrowBracketPause(snap); } catch (e) {} }
            return snap;
        }
        let mark;
        async function stepFineTuneArm(snapshot, staged, name, tax, runPhase, report, opts, dk, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            mark = dkLog.length;
            const armPatch = dkDeepCloneLayout(snapshot);
            staged.forEach(s => {
                armPatch[s.key] = s.to;
            }), armPatch.branchSpokeAutoShrink[name] = !0, tax.subLabels.forEach(l => {
                armPatch.subcatSpokeAutoShrink[l] = !0;
            }), await runPhase("fine-tune-arm", armPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP), report.fineTune.armPhase = "fine-tune-arm";
            }
        function diagText(snap) {
            const f = v => null == v ? "\u2014" : String(v);
            let t = snap.code + " \u00b7 " + snap.label + " \u00b7 branch " + snap.branch + " \u00b7 phase " + f(snap.phase) + " \u00b7 crossing last-kept " + f(diagRound(snap.crossingBefore)) + " \u2192 tripped " + f(diagRound(snap.crossingAfter)) + " \u00b7 branch delivered radius " + f(snap.storedBranchRadius);
            Object.keys(snap.paintedSubs).forEach(l => { const ps = snap.paintedSubs[l]; t += " \u00b7 " + l + ": seg " + f(ps.seg) + " / abs " + f(ps.absR) + " (stored " + f(snap.storedSubs[l]) + ")"; });
            t += " \u00b7 viewBox " + f(snap.view.viewBox) + " \u00b7 transform " + f(snap.view.sceneTransform || snap.view.transform) + " \u00b7 bbox " + (snap.view.bbox ? snap.view.bbox.x + "," + snap.view.bbox.y + " " + snap.view.bbox.width + "\u00d7" + snap.view.bbox.height : "\u2014") + " \u00b7 " + snap.atChicago + " America/Chicago";
            if (snap.closingLines && snap.closingLines.length) t += "\n" + snap.closingLines.join("\n");
            if (snap.captureLines && snap.captureLines.length) t += "\n" + snap.captureLines.join("\n");
            if (snap.hubLines && snap.hubLines.length) t += "\n" + snap.hubLines.join("\n");
            return t;
        }
        function witnessFinalJudge(transition, beforeFrame, afterFrame, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) {
            if (!beforeFrame || !afterFrame) return null;
            const flung = [];
            Object.keys(afterFrame.subs).forEach(label => {
                const b = beforeFrame.subs[label], a = afterFrame.subs[label], t = witnessThrown ? witnessThrown[label] : null;
                if (!b || !a || null == b.d || null == a.d || !(b.d > 0)) return;
                a.d > b.d * WITNESS_ONE_STEP && flung.push({ label: label, before: b.d, after: a.d, thrown: t && null != t.d ? t.d : null, overrideBefore: b.o, overrideAfter: a.o, toThrown: !!(t && null != t.d && t.d > 0 && a.d >= t.d * (1 - WITNESS_EPS)) });
            });
            const rec = { transition: transition, flung: flung, wholesale: flung.length > 1 || flung.some(f => f.toThrown) };
            return dkLog.push(Object.assign({ type: "witness-final-transition" }, rec)), rec;
        }
        function diagCaptureView() {
            const view = { viewBox: null, transform: null, sceneTransform: null, bbox: null };
            try {
                const svg = document.getElementById("mapSvg"), scene = document.getElementById("mapScene"), layer = document.getElementById("mapLayer");
                if (svg) { view.viewBox = svg.getAttribute("viewBox"); view.transform = svg.getAttribute("transform"); }
                if (scene) view.sceneTransform = scene.getAttribute("transform");
                const bbEl = layer || scene;
                if (bbEl && "function" == typeof bbEl.getBBox) { const bb = bbEl.getBBox(); view.bbox = { x: diagRound(bb.x), y: diagRound(bb.y), width: diagRound(bb.width), height: diagRound(bb.height) }; }
            } catch (e) {}
            return view;
        }
        function witnessJudge(event, phase, trippingLabel, beforeFrame, afterFrame, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report) {
            if (!witnessThrown || !beforeFrame || !afterFrame) return null;
            const wholesale = [], steppedBack = [];
            Object.keys(afterFrame.subs).forEach(label => {
                const b = beforeFrame.subs[label], a = afterFrame.subs[label], t = witnessThrown[label];
                if (!b || !a || !t || null == b.d || null == a.d || null == t.d || !(t.d > 0) || !(b.d < t.d * (1 - WITNESS_EPS))) return;
                const isTrip = null != trippingLabel && label === trippingLabel;
                if (a.d >= t.d * (1 - WITNESS_EPS)) (isTrip && a.d <= b.d * WITNESS_ONE_STEP ? steppedBack : wholesale).push({ label: label, before: b.d, after: a.d, thrown: t.d }); else a.d > b.d * (isTrip ? WITNESS_ONE_STEP : 1.005) && steppedBack.push({ label: label, before: b.d, after: a.d, thrown: t.d });
            });
            const rec = { event: event, phase: phase || null, tripping: trippingLabel || null, wholesale: wholesale, steppedBack: steppedBack, wholesaleDiscard: wholesale.some(w => w.label !== trippingLabel) || wholesale.length > 1 };
            return report.witness.events.push(rec), dkLog.push(Object.assign({ type: "witness-event" }, rec)), rec;
        }
        function dkPaintedGeometry(stage, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg) {
            const centre = { x: pr.centerX, y: pr.centerY };
            const branchKey = catId(name), branchPt = dkPaintedNodeCentre(branchKey);
            const subs = {};
            tax.subLabels.forEach(l => {
                const key = Un(name, l), pt = dkPaintedNodeCentre(key);
                if (!pt || !branchPt) { subs[l] = { branchR: null, seg: null, absR: null, stemSeg: dkPaintedStemSeg(key), source: pt ? pt.source : "missing" }; return; }
                const r2 = v => Math.round(v * 100) / 100;
                subs[l] = { branchR: r2(Math.hypot(branchPt.x - centre.x, branchPt.y - centre.y)), seg: r2(Math.hypot(pt.x - branchPt.x, pt.y - branchPt.y)), absR: r2(Math.hypot(pt.x - centre.x, pt.y - centre.y)), stemSeg: dkPaintedStemSeg(key), source: pt.source, x: r2(pt.x), y: r2(pt.y) };
            });
            return { stage: stage || null, centre: centre, branchPt: branchPt ? { x: Math.round(branchPt.x * 100) / 100, y: Math.round(branchPt.y * 100) / 100, source: branchPt.source } : null, subs: subs, blitActive: !!blitSess, source: branchPt ? branchPt.source : "missing" };
        }
        function stepLabelCheck() {
            // (1) LABEL CHECK (§5.11): subcategory state maps are
            // keyed by BARE label, so a label borne by two branches is
            // armed in both by any per-branch cascade. Checked across
            // the whole taxonomy; duplicates are reported, and the run
            // may still proceed on that understanding.
            const labelCounts = {};
            h.forEach(b => (b.subcategories || []).forEach(s => {
                labelCounts[s.name] = (labelCounts[s.name] || 0) + 1;
            }));
            const duplicates = Object.keys(labelCounts).filter(l => labelCounts[l] > 1).sort();
                return duplicates;
            }
        function diagCamera() {
            const cam = { scale: null, tx: null, ty: null };
            try {
                if ("number" == typeof $p && Number.isFinite($p)) cam.scale = $p;
                if ("number" == typeof Ep && Number.isFinite(Ep)) cam.tx = Ep;
                if ("number" == typeof Ap && Number.isFinite(Ap)) cam.ty = Ap;
            } catch (e) {}
            if (null == cam.scale || null == cam.tx || null == cam.ty) try {
                const vp = document.getElementById("viewport"), tr = vp ? vp.getAttribute("transform") : null, m = tr ? /translate\(\s*([-\d.eE+]+)[ ,]+([-\d.eE+]+)\s*\)\s*scale\(\s*([-\d.eE+]+)\s*\)/.exec(tr) : null;
                if (m) { if (null == cam.tx) cam.tx = Number(m[1]); if (null == cam.ty) cam.ty = Number(m[2]); if (null == cam.scale) cam.scale = Number(m[3]); }
            } catch (e) {}
            return { scale: diagRound(cam.scale), tx: diagRound(cam.tx), ty: diagRound(cam.ty) };
        }
        function restoreKept(forFinal, dk, snapshot, name) {
            dk.restore(lastKeptSnapshot || snapshot);
            // The final phase deliberately cleared this
            // branch's fit registrations before committing;
            // a backed-up final restores the kept LAYOUT
            // only and never re-arms what the final patch
            // disarmed. Every other phase restores its kept
            // fit registrations with its layout.
            if (!forFinal && lastKeptFit) {
                clearBranchFit(dk, name);
                Object.keys(lastKeptFit).forEach(k => dk.setFitTarget(k, lastKeptFit[k]));
            }
        }
        function diagHubIdentity(name) {
            const out = { matches: 0, exitClone: null, hasTextPath: null };
            try {
                const key = catId(name), all = document.querySelectorAll('[data-layout-key="' + key + '"]');
                out.matches = all.length;
                const grp = document.querySelector('[data-layout-key="' + key + '"]');
                if (grp) {
                    out.exitClone = grp.classList.contains("layout-exit-clone");
                    const lab = grp.querySelector(".category-label");
                    out.hasTextPath = !!(lab && lab.querySelector("textPath"));
                }
            } catch (e) {}
            return out;
        }
        function stepPreconditions(api, report) {
            // (2) PRECONDITIONS (§5.6): the choreography assumes
            // collision mode 'grow', staggerDensity off (it makes
            // yr() ignore the branch length override entirely),
            // and the branch fully rendered (expandAll). A
            // violated value is STAGED: recorded here, written by
            // the throw commit below, covered by the pre-run
            // snapshot taken next, and restored by the final
            // patch or by a revert. Never proceeded on silently.
            const before = api.get(), staged = [];
            "grow" !== before.collision && staged.push({ key: "collision", from: before.collision, to: "grow" }), !1 !== before.staggerDensity && staged.push({ key: "staggerDensity", from: before.staggerDensity, to: !1 }), !0 !== before.expandAll && staged.push({ key: "expandAll", from: before.expandAll, to: !0 });
            report.preconditionsStaged = staged;
                return staged;
            }
        function witnessPaintedJudge(transition, operation, beforeG, afterG, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) {
            if (!beforeG || !afterG) return null;
            const flung = [];
            Object.keys(afterG.subs || {}).forEach(label => {
                const b = beforeG.subs[label], a = afterG.subs[label], t = witnessThrown ? witnessThrown[label] : null;
                if (!b || !a) return;
                [ "seg", "absR", "branchR" ].forEach(metric => {
                    const bv = b[metric], av = a[metric];
                    if (null == bv || null == av || !(bv > 0)) return;
                    av > bv * WITNESS_ONE_STEP && flung.push({ label: label, metric: metric, before: bv, after: av, thrown: "seg" === metric && t && null != t.d ? t.d : null, toThrown: "seg" === metric && !!(t && null != t.d && t.d > 0 && av >= t.d * (1 - WITNESS_EPS)) });
                });
            });
            const segFlung = flung.filter(f => "seg" === f.metric || "absR" === f.metric);
            const rec = { transition: transition, operation: operation || null, flung: flung, wholesale: segFlung.length > 1 || flung.some(f => f.toThrown) };
            return dkLog.push(Object.assign({ type: "witness-painted-transition" }, rec)), rec;
        }
        function dkPaintedStemSeg(key) {
            // Painted stem cross-check: the subcategory group's
            // own stem / hit path is emitted as M <parent point>
            // L <child point>; its endpoint distance is the
            // segment as actually drawn, independent of node
            // centres. Tapered bands are bands, not centrelines,
            // so they are not parsed here.
            try {
                const el = In.querySelector('.node-group[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)');
                if (!el) return null;
                const path = el.querySelector(":scope > .topic-stem, :scope > .concept-hit");
                const d = path && path.getAttribute("d");
                if (!d) return null;
                const nums = (String(d).match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number).filter(Number.isFinite);
                if (nums.length < 4) return null;
                const x1 = nums[0], y1 = nums[1], x2 = nums[nums.length - 2], y2 = nums[nums.length - 1];
                const len = Math.hypot(x2 - x1, y2 - y1);
                return Number.isFinite(len) && len > 0 ? Math.round(len * 100) / 100 : null;
            } catch (e) { return null; }
        }
        async function throwBracketFullPaint(stamp, name, dkPaintedNodeCentre, tax) {
            let preHub = null;
            try { const pre = dkPaintedGeometry("throwbracket-pre:" + stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); preHub = pre ? pre.branchPt : null; } catch (e) {}
            let mode = "skipped-no-capture";
            try {
                const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (cap && cap.branches && cap.branches.size && centres && centres.size) {
                    mode = "freeze-replay";
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-throwbracket-paint-blit-end", e); }
                    scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres }, sgHoldBlitStart = !0;
                    let paintRes = null;
                    try { paintRes = Mr({ animate: !1, forceRepaint: !0, __sxDiagFullPaint: !0 }); } catch (e) { __sxErrLog("layout-throwbracket-paint", e); } finally { scCtx = null, sgHoldBlitStart = !1; }
                    try {
                        if (paintRes && "function" == typeof paintRes.then) await Promise.race([ paintRes, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-throwbracket-paint-blit-end", e); }
                }
            } catch (e) { try { scCtx = null, sgHoldBlitStart = !1; } catch (_) {} }
            return { mode: mode, prePaintHubSeat: preHub };
        }
        function diagRegistrySnapshot(stamp, ordinal, phaseName, patch, record, now, prevCloud, dk, name, tax, report) {
            const fit = (() => { try { return dk.fitTargets(); } catch (e) { return {}; } })();
            let sec = null;
            try { sec = (dkLastBranches || []).find(s => s && s.entry && s.entry.branch && s.entry.branch.name === name) || null; } catch (e) {}
            const rows = [];
            tax.subLabels.forEach(l => {
                const key = "subcat|" + name + "|" + l;
                let solveR = null;
                try { const t = sec && (sec.topics || []).find(t => t && t.topic && t.topic.isSubcategory && t.topic.label === l); if (t && null != t.cloudRadius) solveR = diagRound(t.cloudRadius); } catch (e) {}
                const ovW = patch && patch.subcatOverrides && patch.subcatOverrides[l] && null != patch.subcatOverrides[l].length ? diagRound(patch.subcatOverrides[l].length) : mn.subcatOverrides && mn.subcatOverrides[l] && null != mn.subcatOverrides[l].length ? diagRound(mn.subcatOverrides[l].length) : null;
                rows.push({ key: key, label: l, fitTargetSet: null != fit[key] ? diagRound(fit[key]) : null, overrideWritten: ovW, solveRadius: solveR, deliveredRadius: diagRound(now && now.items ? now.items[key] : null), composedSegment: diagRound(now && now.items ? now.items[key] : null) });
            });
            const gateTol = null != prevCloud && null != record.cloud && Number.isFinite(prevCloud) && Number.isFinite(record.cloud) ? SX_SCORE.GATE_TOL : null;
            const gate = { prev: diagRound(prevCloud), cloud: diagRound(record.cloud), tolerance: diagRound(gateTol), threshold: null != gateTol && null != prevCloud ? diagRound(prevCloud + gateTol) : null, verdict: null == gateTol || null == record.cloud ? "n/a" : record.cloud > prevCloud + gateTol ? "trip" : "pass" };
            let onsetReading = null;
            try { const m = "function" == typeof window.__sxCrossingMeasure ? window.__sxCrossingMeasure() : null, v = m && m.clouds ? Number(m.clouds[name]) : NaN; onsetReading = Number.isFinite(v) ? diagRound(v) : null; } catch (e) {}
            const onsetBase = report.onset && null != report.onset.baseline ? report.onset.baseline : null;
            const onset = { baseline: diagRound(onsetBase), reading: onsetReading, margin: null, verdict: "n/a" };
            const entry = { type: "registry-snapshot", stageStamp: stamp, runPhaseOrdinal: ordinal, phase: phaseName, branch: name, cloud: diagRound(record.cloud), gate: gate, onset: onset, subs: rows };
            record.registrySnapshot = entry, (report.registrySnapshots || (report.registrySnapshots = [])).push(entry), dkLog.push(entry);
            return entry;
        }
        async function diagOnDemandPaint(stamp, paintOrdinal, phaseName, name, dkPaintedNodeCentre, tax, report) {
            let preHub = null;
            try { const pre = dkPaintedGeometry("ondemand-pre:" + stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); preHub = pre ? pre.branchPt : null; } catch (e) {}
            let mode = "skipped-no-capture";
            try {
                const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (cap && cap.branches && cap.branches.size && centres && centres.size) {
                    mode = "freeze-replay";
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-ondemand-paint-blit-end", e); }
                    scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres }, sgHoldBlitStart = !0;
                    let paintRes = null;
                    try { paintRes = Mr({ animate: !1, forceRepaint: !0, __sxDiagFullPaint: !0 }); } catch (e) { __sxErrLog("layout-ondemand-paint", e); } finally { scCtx = null, sgHoldBlitStart = !1; }
                    try {
                        if (paintRes && "function" == typeof paintRes.then) await Promise.race([ paintRes, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-ondemand-paint-blit-end", e); }
                }
            } catch (e) { try { scCtx = null, sgHoldBlitStart = !1; } catch (_) {} }
            let painted = null;
            try { painted = dkPaintedGeometry("ondemand:" + stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) {}
            const stored = dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera(), subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { subs[l] = { seg: painted.subs[l].seg, absR: painted.subs[l].absR, stored: diagRound(stored.items ? stored.items["subcat|" + name + "|" + l] : null) }; });
            const rec = { type: "ondemand-full-paint", stageStamp: stamp, runPhaseOrdinal: paintOrdinal, phase: phaseName, branch: name, mode: mode, opClass: "anneal-closing-paint", bbox: view.bbox, viewBox: view.viewBox, storedBranchRadius: diagRound(stored.branch), paintedBranchPt: painted ? painted.branchPt : null, branchRadius: painted && painted.branchPt ? diagRound(Math.hypot(painted.branchPt.x - pr.centerX, painted.branchPt.y - pr.centerY)) : null, subs: subs, prePaintHubSeat: preHub, camera: cam, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            (report.onDemandPaints || (report.onDemandPaints = [])).push(rec), dkLog.push(rec);
            try { console.log("[ANNEAL-ONDEMAND-PAINT] " + stamp + " \u00b7 " + phaseName + " \u00b7 mode " + mode + " \u00b7 bbox " + (view.bbox ? view.bbox.width + "\u00d7" + view.bbox.height : "\u2014"), rec); } catch (e) {}
            return rec;
        }
        let snapshot;
        async function stepBaseline(dk, report, name) {
            snapshot = dk.snapshot();
            report.baseline.first = await dk.measureCloud(name), report.baseline.second = await dk.measureCloud(name), report.baseline.variance = Math.abs(report.baseline.first - report.baseline.second);
            // STAGED SCORING (ruled 2026-11-02, Jason): the SAME
            // pre-run geometry also measured under the shrink-stage
            // composition (same-branch plus radial neighbours), so
            // the final gate — which judges after the switch —
            // compares like with like: descent and judge agree at
            // every stage. baseline.first above stays the run-start
            // (same-branch-only) value the per-phase gate chain and
            // the fine-tune decision read.
            try {
                const adjBase = sxCrossingStagedCloud(name, !0);
                null != adjBase && Number.isFinite(adjBase) && (report.baseline.adjacentFirst = adjBase, report.stagedScoring.baselineAdjacent = adjBase);
            } catch (e) {}
            // Q4: every NEIGHBOR cloud's crossing number at
            // baseline, reported-not-gated (the annealed branch
            // itself is excluded; its values are
            // baseline/finalCloud). The baseline's former
            // secondary xAreaCross readout was removed with the
            // area observation (M1); its commented-out copy was
            // deleted with the rest in 2026-10-30.
            try {
                const allBase = await dk.measureCloudsAll(), nb = {};
                Object.keys(allBase).forEach(k => {
                    k !== name && (nb[k] = allBase[k]);
                }), report.neighbors.baseline = nb;
            } catch (e) {}
            const preDelivered = dkDeliveredRadii(name);
            report.coverage.actedOn = Object.keys(preDelivered.items).length;
                return preDelivered;
            }
        function dkPaintedNodeCentre(key) {
            // Painted sources ONLY: the icon's rendered centre
            // through its own CTM chain, or the node's painted
            // stem endpoint. data-layout-x/y is NEVER
            // substituted — elsewhere in this bundle those
            // attributes are documented as holding rest-era
            // values for vault-resident branches, so a dataset
            // read could report stale positions as if painted.
            // When neither painted source reads, the node is
            // missing and its frame records not-observed for
            // that node (the judge skips null metrics).
            try {
                const el = In.querySelector('.node-group[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)') || In.querySelector('[data-layout-key="' + CSS.escape(key) + '"]:not(.layout-exit-clone)');
                if (!el) return null;
                try {
                    const icon = el.querySelector(":scope > .branch-icon, :scope > .topic-icon");
                    const layerCTM = In.getCTM(), inv = layerCTM && layerCTM.inverse();
                    if (icon && inv) {
                        const dia = Number(icon.dataset.diameter), bb = icon.getBBox();
                        if (bb && bb.width > 0 && bb.height > 0) {
                            const lc = dia > 0 ? { x: dia / 2, y: dia / 2 } : { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }, ctm = icon.getCTM();
                            if (ctm) {
                                const p = new DOMPoint(lc.x, lc.y).matrixTransform(ctm).matrixTransform(inv);
                                if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return { x: p.x, y: p.y, source: "rendered-ctm" };
                            }
                        }
                    }
                } catch (e) {}
                try {
                    const path = el.querySelector(":scope > .topic-stem, :scope > .concept-hit");
                    const d = path && path.getAttribute("d");
                    if (d) {
                        const nums = (String(d).match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number).filter(Number.isFinite);
                        if (nums.length >= 4) {
                            const ex = nums[nums.length - 2], ey = nums[nums.length - 1];
                            if (Number.isFinite(ex) && Number.isFinite(ey)) return { x: ex, y: ey, source: "stem-endpoint" };
                        }
                    }
                } catch (e) {}
                return null;
            } catch (e) { return null; }
        }
        function diag00Capture(pre, name, tax, report) {
            const stamp = "ANNEAL-DIAG-00:pre-run:ord-0", r2 = diagRound;
            const painted = (() => { try { return dkPaintedGeometry(stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { return null; } })();
            const stored = pre || dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera();
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = r2(stored.items[k]); });
            const branches = [];
            h.forEach(b => {
                const btax = dkBranchTaxonomy(b.name), pt = (() => { try { return dkPaintedNodeCentre(catId(b.name)); } catch (e) { return null; } })(), pts = [], bsubs = {};
                if (pt) pts.push(pt);
                (btax ? btax.subLabels : []).forEach(l => { const sp = (() => { try { return dkPaintedNodeCentre(Un(b.name, l)); } catch (e) { return null; } })(); if (sp) { pts.push(sp); bsubs[l] = { x: r2(sp.x), y: r2(sp.y), absR: r2(Math.hypot(sp.x - pr.centerX, sp.y - pr.centerY)) }; } });
                let bb = null;
                if (pts.length) { const xs = pts.map(p => p.x), ys = pts.map(p => p.y); bb = { x: r2(Math.min.apply(null, xs)), y: r2(Math.min.apply(null, ys)), width: r2(Math.max.apply(null, xs) - Math.min.apply(null, xs)), height: r2(Math.max.apply(null, ys) - Math.min.apply(null, ys)) }; }
                branches.push({ branch: b.name, hubPt: pt ? { x: r2(pt.x), y: r2(pt.y), source: pt.source } : null, hubRadius: pt ? r2(Math.hypot(pt.x - pr.centerX, pt.y - pr.centerY)) : null, nodeCentreBBox: bb, subs: bsubs });
            });
            let fieldCount = 0; const perBranchCounts = {}, captureItems = {}, captureLines = [];
            try {
                const allNames = new Set(h.map(b => b.name)), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (centres && centres.captureFields) {
                    fieldCount = centres.captureFields.size;
                    centres.captureFields.forEach((fld, k) => { if (fld && fld.branch) perBranchCounts[fld.branch] = (perBranchCounts[fld.branch] || 0) + 1; if (fld && fld.branch === name) captureItems[k] = fld; });
                }
            } catch (e) {}
            captureLines.push("capture fields at DIAG-00 (paintComposition, all branches): " + (fieldCount ? fieldCount + " items captured \u00b7 " + Object.keys(captureItems).length + " on this branch \u00b7 per-branch " + Object.keys(perBranchCounts).map(bn => bn + " " + perBranchCounts[bn]).join(", ") : "unavailable"));
            Object.keys(subs).forEach(l => {
                const f = Object.keys(captureItems).map(k => captureItems[k]).find(v => v && "subcat" === v.kind && v.label === l), cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5);
                f && captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
            });
            const snapOverrides = snapshot ? { branch: snapshot.branchOverrides || null, subcat: snapshot.subcatOverrides || null, kinkCount: snapshot.kinkOverrides ? Object.keys(snapshot.kinkOverrides).length : 0, kink: snapshot.kinkOverrides || null } : null;
            const provLine = "pre-run override provenance: branch override length " + (snapOverrides && snapOverrides.branch && snapOverrides.branch[name] && null != snapOverrides.branch[name].length ? snapOverrides.branch[name].length : "\u2014") + " \u00b7 subcat overrides " + (snapOverrides && snapOverrides.subcat ? tax.subLabels.map(l => l + " " + (snapOverrides.subcat[l] && null != snapOverrides.subcat[l].length ? snapOverrides.subcat[l].length : "\u2014")).join(", ") : "\u2014") + " \u00b7 kink override entries " + (snapOverrides ? snapOverrides.kinkCount : "\u2014") + " \u00b7 preDelivered branch " + r2(stored.branch);
            const hid = diagHubIdentity(name), hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
            const snap = { code: "ANNEAL-DIAG-00", label: "pre-run painted-geometry snapshot \u2014 saved layout, before the cascade", stage: stamp, branch: name, phase: null, crossingBefore: null, crossingAfter: null, storedBranchRadius: r2(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: view, camera: cam, branches: branches, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, captureItems: captureItems, snapshotOverrides: snapOverrides, preDelivered: { branch: r2(stored.branch), items: stored.items || {} }, hubIdentity: hid, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.captureLines = captureLines;
            snap.hubLines = [ "painted hub (paintedBranchPt): " + (snap.paintedBranchPt ? hf(snap.paintedBranchPt.x) + ", " + hf(snap.paintedBranchPt.y) + " \u00b7 radius " + hubR(snap.paintedBranchPt) + " \u00b7 source " + (snap.paintedBranchPt.source || "\u2014") : "\u2014"), "hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") ];
            snap.extraLines = [ "per-branch bbox decomposition (node centres, stage " + stamp + "): " + branches.map(b => b.branch + " hub radius " + (null != b.hubRadius ? b.hubRadius : "\u2014") + " \u00b7 centre extent " + (b.nodeCentreBBox ? b.nodeCentreBBox.width + "\u00d7" + b.nodeCentreBBox.height + " @ " + b.nodeCentreBBox.x + "," + b.nodeCentreBBox.y : "\u2014")).join(" \u00b7 "), provLine, diagCameraText(cam, "camera at DIAG-00") ];
            snap.text = diagText(snap) + "\n" + snap.extraLines.join("\n") + "\n" + captureLines.join("\n") + "\n" + snap.hubLines.join("\n");
            (report.diag || (report.diag = [])).push(snap), report.diag00 = snap;
            dkLog.push({ type: "anneal-diag", code: "ANNEAL-DIAG-00", stage: stamp, phase: null, branch: name, text: snap.text });
            dkLog.push({ type: "diag00-snapshot", stage: stamp, branch: name, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, branches: branches, view: view, camera: cam });
            try { console.log("[ANNEAL-DIAG-00] " + snap.text, snap); } catch (e) {}
            return snap;
        }
        function throwBracketSnapshot(code, label, stamp, paintInfo, name, tax, report) {
            const r2 = diagRound, hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
            const painted = (() => { try { return dkPaintedGeometry(stamp, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { return null; } })();
            const stored = dkDeliveredRadii(name), view = diagCaptureView(), cam = diagCamera();
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = r2(stored.items[k]); });
            const branches = [];
            h.forEach(b => {
                const btax = dkBranchTaxonomy(b.name), pt = (() => { try { return dkPaintedNodeCentre(catId(b.name)); } catch (e) { return null; } })(), pts = [], bsubs = {};
                if (pt) pts.push(pt);
                (btax ? btax.subLabels : []).forEach(l => { const sp = (() => { try { return dkPaintedNodeCentre(Un(b.name, l)); } catch (e) { return null; } })(); if (sp) { pts.push(sp); bsubs[l] = { x: r2(sp.x), y: r2(sp.y), absR: r2(Math.hypot(sp.x - pr.centerX, sp.y - pr.centerY)) }; } });
                let bb = null;
                if (pts.length) { const xs = pts.map(p => p.x), ys = pts.map(p => p.y); bb = { x: r2(Math.min.apply(null, xs)), y: r2(Math.min.apply(null, ys)), width: r2(Math.max.apply(null, xs) - Math.min.apply(null, xs)), height: r2(Math.max.apply(null, ys) - Math.min.apply(null, ys)) }; }
                branches.push({ branch: b.name, hubPt: pt ? { x: r2(pt.x), y: r2(pt.y), source: pt.source } : null, hubRadius: pt ? r2(Math.hypot(pt.x - pr.centerX, pt.y - pr.centerY)) : null, nodeCentreBBox: bb, subs: bsubs });
            });
            let fieldCount = 0; const perBranchCounts = {}, captureItems = {}, captureLines = [];
            try {
                const allNames = new Set(h.map(b => b.name)), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                if (centres && centres.captureFields) {
                    fieldCount = centres.captureFields.size;
                    centres.captureFields.forEach((fld, k) => { if (fld && fld.branch) perBranchCounts[fld.branch] = (perBranchCounts[fld.branch] || 0) + 1; if (fld && fld.branch === name) captureItems[k] = fld; });
                }
            } catch (e) {}
            captureLines.push("capture fields at " + code + " (paintComposition, all branches): " + (fieldCount ? fieldCount + " items captured \u00b7 " + Object.keys(captureItems).length + " on this branch \u00b7 per-branch " + Object.keys(perBranchCounts).map(bn => bn + " " + perBranchCounts[bn]).join(", ") : "unavailable"));
            Object.keys(subs).forEach(l => {
                const f = Object.keys(captureItems).map(k => captureItems[k]).find(v => v && "subcat" === v.kind && v.label === l), cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5);
                f && captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
            });
            const snapOverrides = snapshot ? { branch: snapshot.branchOverrides || null, subcat: snapshot.subcatOverrides || null, kinkCount: snapshot.kinkOverrides ? Object.keys(snapshot.kinkOverrides).length : 0 } : null;
            const liveOv = { branch: mn.branchOverrides && mn.branchOverrides[name] && null != mn.branchOverrides[name].length ? r2(mn.branchOverrides[name].length) : null, subcat: {} };
            tax.subLabels.forEach(l => { liveOv.subcat[l] = mn.subcatOverrides && mn.subcatOverrides[l] && null != mn.subcatOverrides[l].length ? r2(mn.subcatOverrides[l].length) : null; });
            const provLine = code + " override provenance: pre-run (snapshot) branch override length " + (snapOverrides && snapOverrides.branch && snapOverrides.branch[name] && null != snapOverrides.branch[name].length ? snapOverrides.branch[name].length : "\u2014") + " \u00b7 pre-run subcat overrides " + (snapOverrides && snapOverrides.subcat ? tax.subLabels.map(l => l + " " + (snapOverrides.subcat[l] && null != snapOverrides.subcat[l].length ? snapOverrides.subcat[l].length : "\u2014")).join(", ") : "\u2014") + " \u00b7 live branch override length at " + code + " " + hf(liveOv.branch) + " \u00b7 live subcat overrides " + tax.subLabels.map(l => l + " " + hf(liveOv.subcat[l])).join(", ");
            let R = null;
            try { R = eaBase.photoRadius * centerRingScale(); } catch (e) {}
            const tr = report.throwRadii, throwLines = [];
            if ("THROW-BEFORE" === code) throwLines.push("throw inputs (pre-throw, read-only): center-avatar radius " + hf(R) + " \u00b7 branch target " + hf(null != R ? R * SX_SCORE.THROW_BRANCH : null) + " (" + SX_SCORE.THROW_BRANCH + "\u00d7R delivered from centre) \u00b7 subcat target " + hf(null != R ? R * SX_SCORE.THROW_SUBCAT : null) + " (" + SX_SCORE.THROW_SUBCAT + "\u00d7R delivered segment from branch node) \u00b7 delivered before: branch " + hf(stored.branch) + " \u00b7 subcat stored " + tax.subLabels.map(l => l + " " + hf(storedSubs[l])).join(", "));
            else throwLines.push("throw inputs (committed by stepThrow): center-avatar radius " + hf(tr ? tr.centerRadius : R) + " \u00b7 branch target " + hf(tr ? tr.branchTarget : null) + " \u00b7 subcat target " + hf(tr ? tr.subcatTarget : null) + " \u00b7 override lengths committed: branch " + hf(tr ? tr.branchLength : null) + " \u00b7 subcats " + (tr ? tax.subLabels.map(l => l + " " + hf(tr.subcatLengths ? tr.subcatLengths[l] : null)).join(", ") : "\u2014") + " \u00b7 not converted: " + (tr && tr.subcatNotConverted && tr.subcatNotConverted.length ? tr.subcatNotConverted.join(", ") : "none") + " \u00b7 delivered after: branch " + hf(stored.branch) + " \u00b7 subcat stored " + tax.subLabels.map(l => l + " " + hf(storedSubs[l])).join(", "));
            const deltaLines = [];
            let deltas = null;
            if ("THROW-AFTER" === code && throwBracketBefore) {
                const b = throwBracketBefore, dSubs = {};
                Object.keys(subs).forEach(l => { const bs = b.paintedSubs ? b.paintedSubs[l] : null; if (bs) dSubs[l] = { segBefore: bs.seg, segAfter: subs[l].seg, segDelta: null != bs.seg && null != subs[l].seg ? r2(subs[l].seg - bs.seg) : null, absBefore: bs.absR, absAfter: subs[l].absR, absDelta: null != bs.absR && null != subs[l].absR ? r2(subs[l].absR - bs.absR) : null }; });
                deltas = { branchRadiusBefore: b.storedBranchRadius, branchRadiusAfter: r2(stored.branch), branchRadiusDelta: null != b.storedBranchRadius ? r2(stored.branch - b.storedBranchRadius) : null, subs: dSubs };
                deltaLines.push("throw effect (THROW-AFTER \u2212 THROW-BEFORE): branch delivered radius " + hf(b.storedBranchRadius) + " \u2192 " + hf(stored.branch) + " (\u0394 " + hf(deltas.branchRadiusDelta) + ")" + Object.keys(dSubs).map(l => " \u00b7 " + l + ": seg " + hf(dSubs[l].segBefore) + " \u2192 " + hf(dSubs[l].segAfter) + " (\u0394 " + hf(dSubs[l].segDelta) + ") / abs " + hf(dSubs[l].absBefore) + " \u2192 " + hf(dSubs[l].absAfter) + " (\u0394 " + hf(dSubs[l].absDelta) + ")").join(""));
            }
            const hid = diagHubIdentity(name);
            const hubLines = [ "painted hub (paintedBranchPt): " + (painted && painted.branchPt ? hf(painted.branchPt.x) + ", " + hf(painted.branchPt.y) + " \u00b7 radius " + hubR(painted.branchPt) + " \u00b7 source " + (painted.branchPt.source || "\u2014") : "\u2014"), "hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") ];
            const snap = { code: code, label: label, stage: stamp, branch: name, phase: null, crossingBefore: null, crossingAfter: null, storedBranchRadius: r2(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: view, camera: cam, branches: branches, captureFieldCount: fieldCount, capturePerBranch: perBranchCounts, captureItems: captureItems, snapshotOverrides: snapOverrides, liveOverrides: liveOv, hubIdentity: hid, paintMode: paintInfo ? paintInfo.mode : null, prePaintHubSeat: paintInfo ? paintInfo.prePaintHubSeat : null, throwRadii: tr || null, deltas: deltas, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.extraLines = [ "per-branch bbox decomposition (node centres, stage " + stamp + "): " + branches.map(b => b.branch + " hub radius " + (null != b.hubRadius ? b.hubRadius : "\u2014") + " \u00b7 centre extent " + (b.nodeCentreBBox ? b.nodeCentreBBox.width + "\u00d7" + b.nodeCentreBBox.height + " @ " + b.nodeCentreBBox.x + "," + b.nodeCentreBBox.y : "\u2014")).join(" \u00b7 "), provLine, diagCameraText(cam, "camera at " + code), "bracket paint mode: " + snap.paintMode + " \u00b7 opClass anneal-closing-paint" ];
            snap.captureLines = captureLines, snap.hubLines = hubLines, snap.throwLines = throwLines, snap.deltaLines = deltaLines;
            snap.text = diagText(snap) + "\n" + snap.extraLines.join("\n") + "\n" + throwLines.join("\n") + (deltaLines.length ? "\n" + deltaLines.join("\n") : "");
            (report.diag || (report.diag = [])).push(snap), (report.throwBracket || (report.throwBracket = {}))["THROW-BEFORE" === code ? "before" : "after"] = snap;
            dkLog.push({ type: "anneal-diag", code: code, stage: stamp, phase: null, branch: name, text: snap.text });
            dkLog.push({ type: "throw-bracket", code: code, stage: stamp, branch: name, paintMode: snap.paintMode, storedBranchRadius: snap.storedBranchRadius, paintedBranchPt: snap.paintedBranchPt, subs: subs, storedSubs: storedSubs, branches: branches, view: view, camera: cam, throwRadii: tr || null, deltas: deltas });
            try { console.log("[" + code + "] " + snap.text, snap); } catch (e) {}
            return snap;
        }
        let diagPrePaintHub;
        function diagSnapshot(code, label, extra, name, tax, diagAcceptCtx, diagCaptureFields) {
            const stored = dkDeliveredRadii(name);
            let painted = null;
            try { painted = dkPaintedGeometry("diag:" + code, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg); } catch (e) { painted = null; }
            const subs = {};
            if (painted && painted.subs) Object.keys(painted.subs).forEach(l => { const ps = painted.subs[l]; subs[l] = { seg: ps.seg, absR: ps.absR, branchR: ps.branchR, source: ps.source || null }; });
            const storedSubs = {};
            Object.keys(stored.items || {}).forEach(k => { const parts = k.split("|"); if ("subcat" === parts[0]) storedSubs[parts[parts.length - 1]] = diagRound(stored.items[k]); });
            const snap = { code: code, label: label, branch: name, phase: diagAcceptCtx ? diagAcceptCtx.phase : null, crossingBefore: diagAcceptCtx ? diagAcceptCtx.crossingBefore : null, crossingAfter: diagAcceptCtx ? diagAcceptCtx.crossingAfter : null, storedBranchRadius: diagRound(stored.branch), storedSubs: storedSubs, paintedBranchPt: painted ? painted.branchPt : null, paintedSubs: subs, view: diagCaptureView(), atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) };
            snap.closingPaint = null, snap.camera = null, snap.closingLines = [];
            // CAPTURE FIELDS (diagnostic-only, ruled
            // 2026-11-01, per CENTRE-CAPTURE-DIAGNOSIS.md):
            // at DIAG-03, carry the closing-paint capture's
            // per-item fields for this branch — registry
            // cloudRadius / cloudAngle and the override
            // multiplier as held at the capture moment, with
            // the composed radius and centre — plus each
            // subcategory's painted measurement source
            // (already on paintedSubs above), so the next
            // live drive can close the per-item spread
            // between the capture-time sectors and the
            // closing solve's sectors. Read-only.
            snap.captureItems = null, snap.captureLines = [];
            if ("ANNEAL-DIAG-03" === code) {
                const cf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(1e5 * Number(v)) / 1e5), items = {};
                if (diagCaptureFields) diagCaptureFields.forEach((fld, k) => { fld && fld.branch === name && (items[k] = fld); });
                snap.captureItems = items;
                // The summary line is unconditional at
                // DIAG-03: a missing or empty capture is
                // stated, never silent.
                snap.captureLines.push("capture fields at the capture moment: " + (diagCaptureFields ? diagCaptureFields.size + " items captured \u00b7 " + Object.keys(items).length + " on this branch" : "unavailable"));
                Object.keys(subs).forEach(l => {
                    const f = Object.keys(items).map(k => items[k]).find(v => v && "subcat" === v.kind && v.label === l);
                    f && snap.captureLines.push("capture " + l + ": cloudRadius " + cf(f.cloudRadius) + " \u00b7 cloudAngle " + cf(f.cloudAngle) + " \u00b7 override " + cf(f.override) + " \u00b7 composed radius " + cf(f.radius) + " \u00b7 centre " + cf(f.centre.x) + ", " + cf(f.centre.y) + " \u00b7 painted source " + (subs[l].source || "\u2014"));
                });
            }
            // HUB LOGGING (diagnostic-only, ruled 2026-11-01,
            // per HUB-SIDE-DIAGNOSIS.md): the painted hub seat
            // (paintedBranchPt — on the snapshot object all
            // along, printed in no strip), the pre-paint hub
            // seat stashed at DIAG-02, the hub group's
            // label-path length and data-icon-distance-
            // override as they stand at this pause, and the
            // closing solve's sector angle with its yr()
            // inputs — so the hub seat is attributable on the
            // next live drive. Read-only.
            snap.hubSeat = null, snap.hubLines = [];
            try {
                const hf = v => null == v || !Number.isFinite(Number(v)) ? "\u2014" : String(Math.round(100 * Number(v)) / 100), hubR = pt => pt && Number.isFinite(Number(pt.x)) && Number.isFinite(Number(pt.y)) ? hf(Math.hypot(Number(pt.x) - pr.centerX, Number(pt.y) - pr.centerY)) : "\u2014";
                if ("ANNEAL-DIAG-02" === code && painted && painted.branchPt) diagPrePaintHub = painted.branchPt;
                let pathLen = null, iconOv = null;
                try {
                    const grp = document.querySelector('[data-layout-key="' + catId(name) + '"]'), lab = grp && grp.querySelector(".category-label"), pel = lab && lab.dataset.pathId ? document.getElementById(lab.dataset.pathId) : null;
                    if (pel && "function" == typeof pel.getTotalLength) pathLen = pel.getTotalLength();
                    if (grp) iconOv = grp.dataset.iconDistanceOverride;
                } catch (e) {}
                let secInfo = null;
                try {
                    const sec = (dkLastBranches || []).find(s => s && s.entry && s.entry.branch && s.entry.branch.name === name);
                    if (sec) {
                        const anch = rr.branchAnchor(sec), bov = mn.branchOverrides && mn.branchOverrides[name];
                        secInfo = { angle: diagRound(sec.angle), overrideLength: bov && null != bov.length ? diagRound(bov.length) : null, spokeAdjust: diagRound(Number(sec.entry.branch._spokeAdjust20) || 0), anchorRadius: anch ? diagRound(Math.hypot(anch.x - pr.centerX, anch.y - pr.centerY)) : null };
                    }
                } catch (e) {}
                snap.hubSeat = { painted: snap.paintedBranchPt, prePaint: diagPrePaintHub, labelPathLength: diagRound(pathLen), iconDistanceOverride: null == iconOv ? null : iconOv, sector: secInfo };
                snap.hubLines.push("painted hub (paintedBranchPt): " + (snap.paintedBranchPt ? hf(snap.paintedBranchPt.x) + ", " + hf(snap.paintedBranchPt.y) + " \u00b7 radius " + hubR(snap.paintedBranchPt) + " \u00b7 source " + (snap.paintedBranchPt.source || "\u2014") : "\u2014"));
                snap.hubLines.push("pre-paint hub seat (at DIAG-02): " + (diagPrePaintHub ? hf(diagPrePaintHub.x) + ", " + hf(diagPrePaintHub.y) + " \u00b7 radius " + hubR(diagPrePaintHub) : "\u2014"));
                snap.hubLines.push("hub label path: length " + hf(pathLen) + " \u00b7 data-icon-distance-override " + (null == iconOv ? "\u2014" : iconOv));
                try { const hid = diagHubIdentity(name); snap.hubIdentity = hid; snap.hubLines.push("hub group identity: matched elements " + hid.matches + " \u00b7 exit-clone " + (null == hid.exitClone ? "\u2014" : hid.exitClone ? "yes" : "no") + " \u00b7 label textPath " + (null == hid.hasTextPath ? "\u2014" : hid.hasTextPath ? "yes" : "no") + " \u00b7 settle scCenterPt-vs-presnap delta \u2014 (settle-internal; not readable at this pause)"); } catch (e) {}
                snap.hubLines.push("closing solve sector: angle " + (secInfo ? hf(secInfo.angle) : "\u2014") + " \u00b7 yr inputs: branch override " + (secInfo ? hf(secInfo.overrideLength) : "\u2014") + " \u00b7 _spokeAdjust20 " + (secInfo ? hf(secInfo.spokeAdjust) : "\u2014") + " \u00b7 anchor radius " + (secInfo ? hf(secInfo.anchorRadius) : "\u2014"));
            } catch (e) {}
            if (extra) {
                snap.closingPaint = { mode: String(extra.mode || "ordinary"), scopedPaint: extra.scopedPaint ? { retained: extra.scopedPaint.retained, captured: extra.scopedPaint.captured, diverged: extra.scopedPaint.diverged } : null, segmentTiming: !!extra.segmentTiming };
                snap.camera = diagCamera();
                snap.closingLines = diagClosingLines(snap);
            }
            snap.text = diagText(snap);
            return snap;
        }
        function stepOnsetSetup(name, fineTuneActive, report) {
            // COLLISION-ONSET RULE (Jason, 2026-10-24): the
            // shrink ladders below run "until colliding", judged
            // on the branch cloud's hybrid crossing number. The
            // BASELINE is that number in the THROWN state,
            // captured here — immediately after the throw commit,
            // before any shrink stage — and held for the whole
            // run. The readout is the metric dropdown's own
            // computation (window.__sxCrossingMeasure, the port
            // readout behind defs.crossingnumber.clouds), keyed
            // by branch name; it is a read-only measurement for
            // the onset rule ONLY and never feeds any gate
            // readout. Null when the readout is unavailable —
            // onset then never trips this run.
            const onsetCrossing = () => {
                try {
                    const m = "function" == typeof window.__sxCrossingMeasure ? window.__sxCrossingMeasure() : null, v = m && m.clouds ? Number(m.clouds[name]) : NaN;
                    return Number.isFinite(v) ? v : null;
                } catch (e) {
                    return null;
                }
            };
            // Skip path: there is no thrown state, so the recorded
            // baseline is the pre-run cascade baseline
            // (report.baseline.first). Phase 4 (2026-11-04): that
            // baseline is report-only. The fine-tune margin and the
            // onset margin are deleted; neither stops a ladder.
            const onsetBaseline = fineTuneActive ? (Number.isFinite(report.baseline.first) ? report.baseline.first : null) : onsetCrossing();
            fineTuneActive ? dkLog.push({ type: "fine-tune-baseline", branch: name, baseline: onsetBaseline }) : (report.onset.baseline = onsetBaseline, dkLog.push({ type: "onset-baseline", branch: name, baseline: onsetBaseline }));
            // Phase 4 (2026-11-04): no margin test. The onset
            // margin and the fine-tune margin are deleted, and the
            // stop-rule selector is gone. This check never stops a
            // ladder. The per-phase gate (SX_SCORE.GATE_TOL, flat 2)
            // inside runPhase is the only stop.
            const onsetCheck = () => !1;
                return onsetCheck;
            }
        async function stepGrowth(report, dk, name, prevPhaseCloud, opts, runPhase, tax, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            report.growth = { dominance: null, factors: [], branchSteps: 0, subcatSteps: 0, skipped: null };
            let standing = null, excluded = null;
            try { standing = await dk.measureCloud(name); } catch (e) { standing = prevPhaseCloud; }
            try {
                const xm = "function" == typeof window.__sxCrossingMeasureExcluded ? window.__sxCrossingMeasureExcluded() : null, v = xm && xm.clouds ? Number(xm.clouds[name]) : NaN;
                excluded = Number.isFinite(v) ? v : null;
            } catch (e) { excluded = null; }
            if (null == standing || null == excluded || !(standing > 0)) {
                report.growth.skipped = null != standing && null != excluded && 0 === standing ? "standing-zero-nothing-to-relieve" : "dominance-unmeasurable", dkLog.push({ type: "growth-skip", branch: name, reason: report.growth.skipped, standing: standing, excluded: excluded });
                return;
            }
            const sameBranch = standing - excluded, share = sameBranch / standing;
            report.growth.dominance = { standing: standing, excluded: excluded, sameBranch: sameBranch, share: share, threshold: SX_SCORE.GROWTH_DOMINANCE }, dkLog.push({ type: "growth-dominance", branch: name, standing: standing, excluded: excluded, sameBranch: sameBranch, share: share, threshold: SX_SCORE.GROWTH_DOMINANCE });
            if (!(share > SX_SCORE.GROWTH_DOMINANCE)) {
                report.growth.skipped = "same-branch-share-not-dominant";
                return;
            }
            // Test-only hook (opts._testGrowthStepFactor): a
            // multiplier on the ladder's step factors, used by
            // the acceptance harness to force an overshooting
            // growth step and prove the back-up. Not part of
            // any production run.
            const testFactor = opts && Number.isFinite(Number(opts._testGrowthStepFactor)) && Number(opts._testGrowthStepFactor) > 0 ? Number(opts._testGrowthStepFactor) : 1, factors = [];
            {
                let f = 1;
                for (let j = 0; j < SX_SCORE.GROWTH_MAX_STEPS; j++) f *= SX_SCORE.GROWTH_STEP, factors.push(Math.min(f, SX_SCORE.GROWTH_CAP) * testFactor);
            }
            report.growth.factors = factors.slice();
            const growthBase = dkDeliveredRadii(name);
            const annotateGrowth = (phaseName, factor) => {
                const rec = report.phases[report.phases.length - 1];
                if (!rec || rec.name !== phaseName) return;
                const nowD = dkDeliveredRadii(name), sR = [], kR = [];
                Object.keys(nowD.items).forEach(k => {
                    const pre = growthBase.items[k], cur = nowD.items[k];
                    if (!(pre > 0) || !Number.isFinite(cur)) return;
                    "subcat" === k.split("|")[0] ? sR.push(cur / pre) : kR.push(cur / pre);
                }), rec.growth = { factor: factor, deliveredBranch: growthBase.branch > 0 && Number.isFinite(nowD.branch) ? nowD.branch / growthBase.branch : null, deliveredSubcatMedian: dkMedian(sR), deliveredKinkMedian: dkMedian(kR) };
            };
            // Branch level: direct length patches on the
            // branch override, the fit-branch ladder's lever.
            const branchBase = dkBakedBranchBase(name), bSnap = dk.snapshot(), bEntry = (bSnap.branchOverrides || {})[name], branchLen0 = bEntry && Number(bEntry.length) > 0 ? Number(bEntry.length) : branchBase, branchHeadroom = 200 / (branchLen0 / branchBase);
            let lastBranchEff = 1;
            for (let j = 0; j < factors.length; j++) {
                const eff = Math.min(factors[j], branchHeadroom);
                if (!(eff > lastBranchEff + 1e-12)) {
                    report.growth.branchCappedByValidation = !0;
                    break;
                }
                const patch = dk.snapshot();
                patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: branchLen0 * eff }), mark = dkLog.length;
                const res = await runPhase("grow-branch-" + (j + 1), patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                annotateGrowth("grow-branch-" + (j + 1), factors[j]), lastBranchEff = eff;
                if (res && res.dkPhaseTripped) break;
                report.growth.branchSteps++;
            }
            // Subcategory level: length patches on every
            // subcategory override of this branch, with the
            // subcategories' fit targets raised by the same
            // factor — the ladder's lever — so the solve
            // delivers the grown radii the final patch then
            // carries through the overrides.
            if (tax.subLabels.length) {
                const sSnap = dk.snapshot(), subLen0 = {}, subBase = {}, subApplied = {};
                tax.subLabels.forEach(l => {
                    const e0 = (sSnap.subcatOverrides || {})[l];
                    subBase[l] = dkBakedSubBase(l), subLen0[l] = e0 && Number(e0.length) > 0 ? Number(e0.length) : subBase[l], subApplied[l] = subLen0[l];
                });
                const fitAll = dk.fitTargets(), subFit0 = {};
                Object.keys(fitAll).forEach(k => {
                    const p = k.split("|");
                    "subcat" === p[0] && p[1] === name && (subFit0[k] = fitAll[k]);
                });
                for (let j = 0; j < factors.length; j++) {
                    let advances = !1;
                    const patch = dk.snapshot();
                    tax.subLabels.forEach(l => {
                        const eff = Math.min(subLen0[l] * factors[j], subBase[l] * 200);
                        eff > subApplied[l] + 1e-12 && (advances = !0), patch.subcatOverrides[l] = Object.assign({}, patch.subcatOverrides[l], { length: eff });
                    });
                    if (!advances) {
                        report.growth.subcatCappedByValidation = !0;
                        break;
                    }
                    Object.keys(subFit0).forEach(k => dk.setFitTarget(k, subFit0[k] * factors[j])), mark = dkLog.length;
                    const res = await runPhase("grow-subcats-" + (j + 1), patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                    tax.subLabels.forEach(l => {
                        const pe = (patch.subcatOverrides || {})[l];
                        pe && Number.isFinite(Number(pe.length)) && (subApplied[l] = Number(pe.length));
                    }), annotateGrowth("grow-subcats-" + (j + 1), factors[j]);
                    if (res && res.dkPhaseTripped) break;
                    report.growth.subcatSteps++;
                }
            } else report.growth.subcatSkipped = "no-subcategories";
            }
        let witnessFinalLastKept;
        let witnessFinalOperation;
        let witnessFinalBefore;
        let witnessPaintedBefore;
        let witnessFinalTripped;
        let witnessFinalAfter;
        let witnessPaintedAfter;
        async function stepFinalPatch(dk, name, opts, report, tax, runPhase, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, diagCaptureFields, witnessTrippingLabel) {
            // (6) FINAL PATCH (§3.7, rewire A — Jason,
            // 2026-10-24): built on the pre-run snapshot, so
            // (a) all four arm maps return to their exact
            // pre-run values and (b) staged precondition values
            // return to pre-run. (c) Each fit item's length
            // override is carried into the patch EXACTLY as it
            // stands in the post-ladder state — no
            // delivered-radius factor multiplication (the
            // growth phase that supplied those factors is
            // removed, with the fit-target recompute whose only
            // consumer it was): a level whose ladder ran to its
            // final stage stands at its restored pre-run
            // length; a level held by onset stands at its held
            // length — in particular the branch override is NOT
            // forced back to its pre-run snapshot value when
            // the branch ladder onset-held above it; and kink
            // overrides stand at their thrown autofit values
            // (3x the kink length), the
            // room this run exists to keep. An entry the
            // post-ladder state lacks is dropped from the patch
            // rather than revived from the snapshot. (d) The
            // branch's fit registrations are cleared before the
            // commit, so the final solve — and the gate
            // measurement after it — runs on the true kept
            // state, unarmed.
            const finalPatch = dkDeepCloneLayout(snapshot), heldState = dk.snapshot();
            Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name).forEach(k => {
                const p = k.split("|");
                if ("subcat" === p[0]) {
                    const cur = heldState.subcatOverrides ? heldState.subcatOverrides[p[2]] : null;
                    cur ? finalPatch.subcatOverrides[p[2]] = Object.assign({}, cur) : delete finalPatch.subcatOverrides[p[2]];
                } else {
                    const id = "child" === p[0] ? p[3] : p[2], cur = heldState.kinkOverrides ? heldState.kinkOverrides[id] : null;
                    cur ? finalPatch.kinkOverrides[id] = Object.assign({}, cur) : delete finalPatch.kinkOverrides[id];
                }
            });
            const heldBranch = heldState.branchOverrides ? heldState.branchOverrides[name] : null;
            heldBranch ? finalPatch.branchOverrides[name] = Object.assign({}, heldBranch) : delete finalPatch.branchOverrides[name];
            // Test-only hook (opts._testFinalPatch): an object
            // merged into the final patch just before it is
            // applied — map values merge per key, scalars
            // replace. The acceptance harness uses it to force a
            // gate failure and prove the full revert. Not part of
            // any production run.
            if (opts && opts._testFinalPatch && "object" == typeof opts._testFinalPatch) Object.keys(opts._testFinalPatch).forEach(k => {
                const tv = opts._testFinalPatch[k];
                if (tv && "object" == typeof tv && !Array.isArray(tv) && finalPatch[k] && "object" == typeof finalPatch[k]) {
                    const merged = {};
                    Object.keys(finalPatch[k]).forEach(ek => {
                        merged[ek] = finalPatch[k][ek];
                    }), Object.keys(tv).forEach(ek => {
                        const ev = tv[ek];
                        merged[ek] = ev && "object" == typeof ev ? Object.assign({}, ev) : ev;
                    }), finalPatch[k] = merged;
                } else finalPatch[k] = tv;
            });
            clearBranchFit(dk, name), mark = dkLog.length;
            const wBeforeFinal = witnessLastFrame;
            // FINAL-STEP WITNESS (extension): name this run's
            // final-step operation and bracket its commit —
            // the last kept phase stands in wBeforeFinal, a
            // fresh frame lands immediately before the commit,
            // and one immediately after it.
            witnessFinalLastKept = wBeforeFinal, witnessFinalOperation = "final patch (pre-run snapshot rebuilt with held lengths carried through, branch fit cleared, committed as the 'final' phase)", witnessFinalBefore = witnessFrame("final-step-before", "final", null, witnessSubs, name, report, dk);
            witnessPaintedBefore = witnessPaintedFrame("before-final-step", witnessFinalOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            const finalRes = await runPhase("final", finalPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
            // STAGED SCORING: finalCloud is judged under the
            // shrink-stage composition; report.delta stays the
            // receipt's displayed difference (final minus the
            // displayed run-start baseline.first), and the gate's
            // judged change rides separately as gateDelta against
            // gateBaseline (set at the gate below from
            // baseline.adjacentFirst, the neighbour-inclusive
            // baseline captured on the pre-run geometry).
            report.finalCloud = await dk.measureCloud(name), report.delta = report.finalCloud - report.baseline.first, report.gateDelta = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.finalCloud - report.baseline.adjacentFirst : report.delta;
            witnessFinalTripped = !!(finalRes && finalRes.dkPhaseTripped), witnessFinalTripped && (witnessFinalOperation += " — the final phase gate-tripped and backed up to the last kept state");
            witnessFinalAfter = witnessFrame("final-step-after", "final", null, witnessSubs, name, report, dk);
            witnessPaintedAfter = witnessPaintedFrame("after-final-step", witnessFinalOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            witnessJudge("final-patch", "final", null, wBeforeFinal, witnessLastFrame, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, report);
            // Q4: the final SECONDARY area (reported only), the
            // neighbor clouds' final crossing numbers
            // (reported-not-gated — measured BEFORE the gate
            // below runs, so a reverted run still reports the
            // kept-state candidates it judged), and the PLATEAU
            // record: the plateau copy fires ONLY at crossing
            // exactly 0 — an area improvement with crossing
            // still non-zero never fires it.
            try {
                const allFin = await dk.measureCloudsAll(), nf = {};
                Object.keys(allFin).forEach(k => {
                    k !== name && (nf[k] = allFin[k]);
                }), report.neighbors.final = nf;
            } catch (e) {}
            // Bake gate (M4): dkBakeGate above, the single
            // computation shared by both run endings.
            dkBakeGate(report);
            report.plateau = { metric: "crossingnumber", finalCrossing: report.finalCloud, copyFired: 0 === report.finalCloud };
            // Q2: the run's total fit-deviation count rides on
            // the report so the receipt lead can surface it.
            report.fitDeviationTotal = tallyFitDev(report);
            }
        async function stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // (4) THROW: one commit. The branch is thrown to a
            // delivered distance of 50 center-avatar radii
            // from the center and every subcategory to a
            // delivered segment of 20 radii out from its
            // branch node (the 2026-11-01 center-avatar-radii
            // re-ruling; the subcategory factor is the
            // corrected 20, not the first-said 10; the radii
            // are converted to override lengths below, after
            // the throwFitCap block), every kink autofit to three times its
            // kink (fit) length — 3x (re-ruled 2026-11-02
            // 16:59 CST, Jason; throwFitCap below governs,
            // no kink throw factor caps it),
            // any staged
            // precondition
            // values, and the FULL cascade armed in the same
            // patch — both spoke arm maps, overwriting inherited
            // explicit-false vetoes (restored later from the
            // snapshot).
            mark = dkLog.length;
            // THROW TOPIC AUTOFIT (re-ruled 2026-11-01, Jason —
            // supersedes the 2026-10-31 throw topic cap): in
            // the throw, the kink leaves are not thrown by a
            // radii factor; each one autofits to THREE TIMES
            // its kink length — its fit length x
            // LEAF_FIT_FACTOR (3, re-ruled 2026-11-02 16:59
            // CST, Jason, reversing the same day's 13:11 1x
            // leaf ruling; the shared SHRINK_FLOOR_FACTOR is
            // NOT read here — it stays 1 for the subcategory
            // and category floors only). The value computed here IS the thrown
            // kink length (it governed only as a min-cap
            // against the old THROW_KINK factor before this
            // re-ruling). The fit
            // length in override units is converted from the
            // item's label-fit target (rendered units) through
            // its pre-run delivered radius, exactly as the
            // kink shrink-to-label driver converts its targets
            // (afterLength = curLen x target / delivered), with
            // curLen the pre-run (snapshot) length. The
            // smallest cap across an id's items governs; an
            // item with no computable fit target caps nothing.
            const throwFitCap = {};
            try {
                dkFitBranchItems(name).forEach(w => {
                    const info = dkRadialBaseInfo(w), kind = info.key.split("|")[0];
                    if ("topic" !== kind && "child" !== kind) return;
                    const id = "child" === kind ? (w.child ? w.child.id : null) : (w.topic ? w.topic.id : null);
                    if (null == id) return;
                    const target = dkComputeFitTarget(info.key), delivered = dkDeliveredItemRadius(w), cur = snapshot.kinkOverrides ? snapshot.kinkOverrides[id] : null, curLen = cur && Number(cur.length) > 0 ? Number(cur.length) : 1;
                    if (null == target || !(target > 0) || !Number.isFinite(delivered) || !(delivered > 0)) return;
                    const capLen = curLen * target * sxLeafOvergrowthFactor() / delivered;
                    Number.isFinite(capLen) && capLen > 0 && (null == throwFitCap[id] || capLen < throwFitCap[id]) && (throwFitCap[id] = capLen);
                });
            } catch (e) {}
            // THROW RADII CONVERSION (fix, 2026-11-01, Jason —
            // definition settled 04:56 CST after diagnosis
            // c17e4775 CONFIRMED the over-extension): the
            // THROW_BRANCH / THROW_SUBCAT factors count
            // CENTER-AVATAR RADII in world units, not multiples
            // of the baked base. The old code set the branch
            // override to bakedBase x 50 and each subcategory
            // override to bakedBase x 20; a baked base is itself
            // a large multiplier (Bondage ≈ 29.9), so the
            // delivered throw landed tens of times past the
            // ruled distance. The radius R is the center
            // avatar's own circle: the avatar disc radius the
            // Center ring scale slider (mn.centerRingScale —
            // the slider next to the text / font slider) sets,
            // eaBase.photoRadius x centerRingScale(), the same
            // value refreshCenterRing() leaves in ea.photoRadius
            // on every render; it is the fundamental scale of
            // the center avatar. The branch node is thrown to a
            // DELIVERED distance of THROW_BRANCH x R from the
            // center; each subcategory is thrown to a DELIVERED
            // segment of THROW_SUBCAT x R out from its branch
            // node. World targets convert into override lengths
            // with the kink delivered-radius pattern the
            // throwFitCap above already uses (afterLength =
            // curLen x target / delivered), with curLen the
            // pre-run (snapshot) length and delivered the
            // pre-run delivered radius (preDelivered: yr() for
            // the branch, the hub spoke x override for a
            // subcategory segment). An item with no positive
            // pre-run delivered radius is NOT thrown at all:
            // its override is never written, so it keeps its
            // pre-run length, and it is recorded in
            // report.throwRadii as not converted (the old
            // baked-base multiple is never a fallback — it was
            // the over-extension being fixed). The conversion
            // is recorded on report.throwRadii (fields added
            // only) and in the run log.
            const throwCenterRadius = eaBase.photoRadius * centerRingScale();
            const throwBranchTarget = throwCenterRadius * SX_SCORE.THROW_BRANCH;
            const throwSubcatTarget = throwCenterRadius * SX_SCORE.THROW_SUBCAT;
            const throwConvert = (curLen, delivered, target) => sxLenConvert(curLen, delivered, target);
            const branchCurEntry = snapshot && snapshot.branchOverrides
                ? snapshot.branchOverrides[name] : null;
            const branchCurLen = branchCurEntry && Number(branchCurEntry.length) > 0
                ? Number(branchCurEntry.length) : 1;
            const throwBranchRaw = throwConvert(branchCurLen,
                preDelivered ? preDelivered.branch : NaN, throwBranchTarget);
            const throwBranchLen = Number.isFinite(throwBranchRaw) && throwBranchRaw > 0
                ? throwBranchRaw : null;
            const throwSubcatLens = {}, throwSubcatSkipped = [];
            tax.subLabels.forEach(l => {
                const curEntry = snapshot && snapshot.subcatOverrides
                    ? snapshot.subcatOverrides[l] : null;
                const curLen = curEntry && Number(curEntry.length) > 0
                    ? Number(curEntry.length) : 1;
                const delivered = preDelivered && preDelivered.items
                    ? preDelivered.items["subcat|" + name + "|" + l] : NaN;
                const len = throwConvert(curLen, delivered, throwSubcatTarget);
                if (Number.isFinite(len) && len > 0) throwSubcatLens[l] = len;
                else throwSubcatSkipped.push(l);
            });
            report.throwRadii = {
                centerRadius: throwCenterRadius,
                branchFactor: SX_SCORE.THROW_BRANCH,
                subcatFactor: SX_SCORE.THROW_SUBCAT,
                branchTarget: throwBranchTarget,
                subcatTarget: throwSubcatTarget,
                branchLength: throwBranchLen,
                subcatLengths: throwSubcatLens,
                subcatNotConverted: throwSubcatSkipped
            };
            dkLog.push({
                type: "throw-radii", branch: name,
                centerRadius: throwCenterRadius,
                branchTarget: throwBranchTarget,
                subcatTarget: throwSubcatTarget,
                branchLength: throwBranchLen,
                subcatLengths: throwSubcatLens,
                subcatNotConverted: throwSubcatSkipped
            });
            const throwPatch = dkDeepCloneLayout(snapshot);
            staged.forEach(s => {
                throwPatch[s.key] = s.to;
            });
            // A level whose conversion failed is NOT thrown:
            // its override is simply never written here, so
            // the snapshot clone keeps its pre-run length.
            if (null != throwBranchLen)
                throwPatch.branchOverrides[name] = Object.assign({},
                    throwPatch.branchOverrides[name], { length: throwBranchLen });
            tax.subLabels.forEach(l => {
                if (null != throwSubcatLens[l])
                    throwPatch.subcatOverrides[l] = Object.assign({},
                        throwPatch.subcatOverrides[l], { length: throwSubcatLens[l] });
            });
            tax.kinkIds.forEach(id => {
                // Kink leaves autofit to 3x the kink length
                // (2026-11-02 16:59 CST re-ruling): the fit cap IS the
                // thrown length; the THROW_KINK multiple of
                // the baked base (also 3) is only the fallback
                // for a kink with no computable fit target.
                const fitCapLen = throwFitCap[id];
                throwPatch.kinkOverrides[id] = Object.assign({}, throwPatch.kinkOverrides[id], { length: null != fitCapLen && Number.isFinite(fitCapLen) ? fitCapLen : dkBakedKinkBase(id) * sxLeafOvergrowthFactor() });
            });
            throwPatch.branchSpokeAutoShrink[name] = !0;
            tax.subLabels.forEach(l => {
                throwPatch.subcatSpokeAutoShrink[l] = !0;
            });
            await runPhase("throw", throwPatch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
            }
        async function stepThrowRepeated(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // THROW REPEAT (ruled 2026-11-06, Jason): the throw
            // step as it exists (stepThrow above — same targets,
            // same factors, nothing about it changed), repeated
            // when it does not clear. The crossing number BEFORE
            // is the run baseline (report.baseline.first,
            // measured twice in stepBaseline under the same
            // own-cloud composition measureCloud reads here —
            // the staged-scoring switch to same-plus-adjacent
            // happens later, at shrink-stage entry, so every
            // reading in this loop is like-for-like). After each
            // throw the standing crossing number is measured
            // fresh; the drop is (before - after) / before. A
            // drop of MORE than SX_SCORE.THROW_REPEAT_DROP
            // (75%) is substantial and stops the repetition;
            // otherwise the throw runs again, up to
            // SX_SCORE.THROW_REPEAT_MAX_EXTRA (3) extra times —
            // four throws total. A throw whose phase gate trips
            // and backs up leaves the last kept geometry
            // standing, and the fresh measurement reads that
            // standing geometry, so a backed-up repeat simply
            // shows no further drop. An unmeasurable crossing
            // (before or after not a positive finite number)
            // cannot be judged, so the loop stops after that
            // throw rather than repeating blind. Every check is
            // recorded in dkLog and on report.throwRepeat
            // (fields added only) for the receipt.
            const throwBefore = report.baseline && Number.isFinite(report.baseline.first) ? report.baseline.first : null;
            const throwRec = { before: throwBefore, attempts: [], throws: 0, substantial: !1, finalAfter: null };
            report.throwRepeat = throwRec;
            for (let attempt = 1; attempt <= 1 + SX_SCORE.THROW_REPEAT_MAX_EXTRA; attempt++) {
                await stepThrow(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                throwRec.throws = attempt;
                let after = null;
                try { after = await dk.measureCloud(name); } catch (e) { after = null; }
                const drop = null != throwRec.before && throwRec.before > 0 && null != after && Number.isFinite(after) ? (throwRec.before - after) / throwRec.before : null;
                const substantial = null != drop && drop > SX_SCORE.THROW_REPEAT_DROP;
                throwRec.attempts.push({ attempt: attempt, after: after, drop: drop, substantial: substantial });
                throwRec.finalAfter = after, throwRec.substantial = substantial;
                dkLog.push({ type: "throw-repeat-check", branch: name, attempt: attempt, before: throwRec.before, after: after, drop: drop, substantial: substantial });
                if (substantial || null == drop) break;
            }
            if (throwRec.throws > 1) dkLog.push({ type: "throw-repeat", branch: name, throws: throwRec.throws, before: throwRec.before, after: throwRec.finalAfter, substantial: throwRec.substantial });
        }
        let diagPhaseOrdinal;
        let diagPaintCount;
        let diagFitSubcatsCount;
        let diagPaintBase;
        let diagAcceptCtx;
        let prevPhaseCloud;
        let witnessThrown;
        let witnessPaintedLastKept;
        async function runPhase(phaseName, patch, logStart, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) {
            // E6: yield at the phase boundary BEFORE the phase's
            // synchronous apply, so UI state set before the call
            // (busy spinner, readout, driven-control refresh) can
            // paint between phases.
            await yieldNow();
            // Q1: heartbeat at the phase's start, so the
            // readout names the phase being solved from its
            // first moment, not only once it commits.
            if (opts && "function" == typeof opts.onHeartbeat) {
                try {
                    opts.onHeartbeat({ phase: phaseName, phaseElapsedMs: 0, iterations: 0 });
                } catch (e) {}
            }
            const res = dk.applyPhase(patch, phaseName);
            if (!res || !res.ok) throw new Error("phase '" + phaseName + "' rejected by ratio validation" + (res && res.rejected ? ": " + JSON.stringify(res.rejected) : ""));
            await yieldNow();
            const entries = dkLog.slice(logStart), phaseEntry = entries.find(e => "phase" === e.type && e.phase === phaseName), ratios = phaseEntry ? phaseEntry.ratios : { branch: {}, subcat: {}, kink: {} }, now = dkDeliveredRadii(name), subRatios = [], kinkRatios = [];
            Object.keys(now.items).forEach(k => {
                const pre = preDelivered.items[k], cur = now.items[k];
                if (!(pre > 0) || !Number.isFinite(cur)) return;
                "subcat" === k.split("|")[0] ? subRatios.push(cur / pre) : kinkRatios.push(cur / pre);
            });
            const record = {
                name: phaseName,
                requestedRatios: {
                    branch: null != ratios.branch[name] ? ratios.branch[name] : null,
                    subcatMedian: dkMedian(tax.subLabels.map(l => ratios.subcat[l]).filter(v => null != v)),
                    kinkMedian: dkMedian(tax.kinkIds.map(id => ratios.kink[id]).filter(v => null != v))
                },
                deliveredRatios: {
                    branch: preDelivered.branch > 0 && Number.isFinite(now.branch) ? now.branch / preDelivered.branch : null,
                    subcatMedian: dkMedian(subRatios),
                    kinkMedian: dkMedian(kinkRatios)
                },
                deliveredRanges: { subcat: dkRange(subRatios), kink: dkRange(kinkRatios) },
                limiterHits: entries.filter(e => "phase" !== e.type),
                // STAGED SCORING (ruled 2026-11-02, Jason):
                // the scoring stage this phase's cloud was
                // judged under — false until the whole run
                // enters its shrink stage, true from the
                // first shrink phase on.
                stagedAdjacent: !!(sxAnnealStageCtx && sxAnnealStageCtx.adjacent),
                cloud: null
            };
            // Q2: this phase's fit-deviation count, broken
            // out of the limiter hits so it can be surfaced
            // per phase and in the receipt lead.
            record.fitDeviationCount = dkFitDeviationCount(record.limiterHits);
            // Cascade containment (Stage 3, T6): the phase
            // commit's scoped outcome — declared ring,
            // frozen count, dropped counters, boundary
            // count, or the declared fallback when a commit
            // ran unscoped — rides in the phase record
            // beside the limiter hits. (The full boundary
            // log stays in dkLog's "scoped-apply" entry,
            // which the limiter-hit slice above carries.)
            record.scoped = res && res.scoped ? {
                scoped: res.scoped.scoped,
                ring: res.scoped.ring,
                frozenCount: res.scoped.frozenCount,
                dropped: res.scoped.dropped,
                boundaryCount: (res.scoped.boundaryLog || []).length,
                fallback: res.scoped.fallback
            } : null;
            // E6: the phase's running cloud value, when the
            // metric hook can supply it. Q4: record.cloud is
            // the DECIDER — the branch's own-cloud crossing
            // number via the repointed measureCloud readout.
            // (The phase's former xAreaCross ride-along was
            // removed from observation with the area metric,
            // M1 2026-10-29; its commented-out copy was deleted
            // in 2026-10-30.)
            try { record.cloud = await dk.measureCloud(name); } catch (e) { record.cloud = null; }
            report.phases.push(record);
            // DIAG-00 / REGISTRY / ON-DEMAND PAINT (ruled
            // 2026-11-01, Jason): the registry snapshot logs
            // here — after the commit and the cloud
            // measurement, BEFORE the gate decision below,
            // so tripped stages are snapshotted too — and
            // the on-demand full paint fires here on its
            // exact trigger: the 3rd runPhase commit of the
            // fit-subcats ladder, and every 5th runPhase
            // commit thereafter counting across ALL ladders
            // (throw excluded; the count is the runPhase
            // ordinal, not a per-node stage number), painted
            // after commit/measurement and before the gate
            // decision, tripped stages included. The registry
            // snapshot is measurement only; the paint is
            // gated by opts.onDemandFullPaint (session-only,
            // default OFF) and changes no decision input.
            diagPhaseOrdinal += 1;
            const diagStamp = "runPhase-" + diagPhaseOrdinal + ":" + phaseName;
            if (opts && opts.diag00) { try { diagRegistrySnapshot(diagStamp, diagPhaseOrdinal, phaseName, patch, record, now, prevPhaseCloud, dk, name, tax, report); } catch (e) {} }
            if ("throw" !== phaseName) {
                diagPaintCount += 1;
                let diagTrigger = !1;
                if (/^fit-subcats-\d+$/.test(phaseName)) { diagFitSubcatsCount += 1; if (3 === diagFitSubcatsCount) { diagTrigger = !0, diagPaintBase = diagPaintCount; } } else if (null != diagPaintBase && diagPaintCount > diagPaintBase && 0 === (diagPaintCount - diagPaintBase) % 5) diagTrigger = !0;
                if (diagTrigger && opts && opts.onDemandFullPaint) { try { await diagOnDemandPaint(diagStamp, diagPaintCount, phaseName, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
            }
            // E6: opts.onPhase fires after the phase commits,
            // with the phase's summary (phase name, requested /
            // delivered ratios, limiter hits, running cloud).
            // A throwing callback is logged, never fatal.
            if (opts && "function" == typeof opts.onPhase) {
                try {
                    await opts.onPhase({ phase: record.name, name: record.name, branch: name, requestedRatios: record.requestedRatios, deliveredRatios: record.deliveredRatios, deliveredRanges: record.deliveredRanges, limiterHits: record.limiterHits, cloud: record.cloud, fitDeviationCount: record.fitDeviationCount, scoped: record.scoped || null });
                } catch (e) {
                    dkLog.push({ type: "onphase-error", phase: record.name, message: String(e && e.message || e) });
                }
            }
            // Q2 PER-PHASE GATE, trip consequence ruled
            // 2026-10-28 (BACK-UP-A-STEP, all phases): this
            // phase's cloud metric against the previous kept
            // phase's (the baseline for the first phase), on
            // the existing record.cloud readout. A regression
            // beyond tolerance — flat GATE_TOL (2) — no longer unwinds the run:
            // the tripping step is discarded, the last-kept
            // phase snapshot is restored (the pre-run
            // snapshot only if nothing has committed yet),
            // and the caller stops that level's ladder while
            // the cascade continues to the next level. The
            // trip and its back-up are recorded on the phase
            // record and the report (tripped ratios, restored
            // ratios, backed-up flag); the final
            // improve-or-hold gate below still judges the
            // end state exactly as before and is the only
            // whole-run revert left.
            if (null != prevPhaseCloud && null != record.cloud && Number.isFinite(prevPhaseCloud) && Number.isFinite(record.cloud)) {
                const gateTol = SX_SCORE.GATE_TOL;
                if (record.cloud > prevPhaseCloud + gateTol) {
                    const trippedRatios = { requested: record.requestedRatios, delivered: record.deliveredRatios };
                    // BACK-OUT CONFIRMATION GATE (ruled 2026-11-01,
                    // Jason): when the shell supplies
                    // opts.onBackoutGate, a trip in THIS branch
                    // (category) shrink ladder — phase fit-branch-*
                    // only; subcategory / kink / growth / final
                    // trips never reach this gate — PAUSES here,
                    // BEFORE restoreKept reverts any geometry, and
                    // asks. The tripped trial geometry stands on
                    // screen while the confirmation is open; the
                    // phase budget is only polled inside a phase's
                    // iterations, so no timeout can fire while the
                    // run waits. The gate info carries a code
                    // naming this exact check in code (runPhase's
                    // per-phase gate trip, ahead of restoreKept),
                    // the branch, the phase, and the crossing
                    // before (last kept) and after (tripped).
                    // ACCEPT (or no gate supplied, or the gate
                    // callback failing): exactly today's path —
                    // restoreKept below reverts to the last kept
                    // shape and the caller ends the run as a
                    // category back-out. REJECT: restoreKept is
                    // NOT called — the tripped trial geometry is
                    // left standing — and the returned marker
                    // (dkGateRejected) makes the caller end the
                    // run on the rejection, with no growth, no
                    // final patch and no final gate after it.
                    let gateCode = null, gateDecision = null;
                    if (/^fit-branch-\d+$/.test(phaseName) && opts && "function" == typeof opts.onBackoutGate) {
                        gateCode = "ANNEAL-BO-01 · runPhase per-phase gate → restoreKept · " + phaseName;
                        try { gateDecision = await opts.onBackoutGate({ code: gateCode, branch: name, phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol }); } catch (e) { gateDecision = null; }
                        dkLog.push({ type: "backout-gate", phase: phaseName, code: gateCode, decision: "reject" === gateDecision ? "rejected" : "accepted", prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol });
                        report.backoutGate = { code: gateCode, branch: name, phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol, decision: "reject" === gateDecision ? "rejected" : "accepted" };
                    }
                    if (gateCode && "reject" !== gateDecision) {
                        diagAcceptCtx = { phase: phaseName, crossingBefore: prevPhaseCloud, crossingAfter: record.cloud, tolerance: gateTol };
                        await diagPause("ANNEAL-DIAG-01", "Accept \u2192 restoreKept", undefined, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                    }
                    if ("reject" === gateDecision) {
                        record.phaseGate = { prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !1, gated: !0, decision: "rejected", code: gateCode, trippedRatios: trippedRatios }, report.phaseGate = { phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !1, gated: !0, decision: "rejected", code: gateCode, trippedRatios: trippedRatios };
                        const standingNow = dkDeliveredRadii(name);
                        standingNow.dkPhaseTripped = !0, standingNow.dkGateRejected = !0;
                        return standingNow;
                    }
                    restoreKept("final" === phaseName, dk, snapshot, name);
                    await diagPause("ANNEAL-DIAG-02", "restoreKept \u2192 closing full paint", undefined, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                    const restoredNow = dkDeliveredRadii(name), rSub = [], rKink = [];
                    Object.keys(restoredNow.items).forEach(k => {
                        const pre = preDelivered.items[k], cur = restoredNow.items[k];
                        if (!(pre > 0) || !Number.isFinite(cur)) return;
                        "subcat" === k.split("|")[0] ? rSub.push(cur / pre) : rKink.push(cur / pre);
                    });
                    const restoredRatios = {
                        branch: preDelivered.branch > 0 && Number.isFinite(restoredNow.branch) ? restoredNow.branch / preDelivered.branch : null,
                        subcatMedian: dkMedian(rSub),
                        kinkMedian: dkMedian(rKink)
                    };
                    let restoredCloud = null;
                    try { restoredCloud = await dk.measureCloud(name); } catch (e) { restoredCloud = null; }
                    record.phaseGate = { prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !0, trippedRatios: trippedRatios, restoredRatios: restoredRatios, restoredCloud: restoredCloud }, report.phaseGate = { phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, backedUp: !0, trippedRatios: trippedRatios, restoredRatios: restoredRatios, restoredCloud: restoredCloud };
                    dkLog.push({ type: "phase-gate-backup", phase: phaseName, prev: prevPhaseCloud, cloud: record.cloud, tolerance: gateTol, restoredCloud: restoredCloud });
                    witnessRestore("gate-backup-restored", phaseName, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                    restoredNow.dkPhaseTripped = !0;
                    return restoredNow;
                }
            }
            null != record.cloud && Number.isFinite(record.cloud) && (prevPhaseCloud = record.cloud);
            captureKept(dk, refreshKeptFit, name);
            const wFrame = witnessFrame("phase-kept", phaseName, now, witnessSubs, name, report, dk);
            "throw" === phaseName && (witnessThrown = wFrame.subs);
            // PAINTED-GEOMETRY WITNESS: the last kept phase's
            // painted capture. During the run the full-map
            // DOM still holds the last full paint (interim
            // commits paint only the capsule approximation),
            // so this frame records the painted domain as it
            // stands at this phase — the divergence between
            // it and the bookkeeping frame above is itself
            // recorded, and the decisive painted frames are
            // the closing-paint and settle frames in the
            // finally block.
            witnessPaintedLastKept = witnessPaintedFrame("last-kept:" + phaseName, "phase commit '" + phaseName + "' kept (interim capsule domain; full-map DOM holds the last full paint)", dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
            return now;
        }
        let witnessTrippingLabel;
        async function stepShrinkLadders(name, report, dk, fineTuneActive, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, opts, tax, diagCaptureFields, onsetCheck) {
            // STAGED SCORING SWITCH (ruled 2026-11-02, Jason): this
            // step IS the whole run's shrink stage — the single
            // run-level entry point every run passes through after
            // the throw (or the fine-tune arming), on the normal
            // path and the skip-throw path alike. Entering it flips
            // the run's judged score from same-branch-only to
            // same-plus-adjacent (radial neighbours), and the
            // per-phase gate's reference is RE-BASED on the current
            // (last-kept) geometry under the new composition, so
            // the first shrink phase is judged against the same
            // composition it is scored under — descent and judge
            // agree across the switch. Every later judged read in
            // the run (shrink phases, back-out restored readings,
            // the final patch's measurement and the final gate)
            // uses the new composition through measureCloud.
            if (sxAnnealStageCtx && sxAnnealStageCtx.branch === name) {
                sxAnnealStageCtx.adjacent = !0, report.stagedScoring.adjacentFromPhase = "fit-subcats-1";
                dkLog.push({ type: "staged-scoring-switch", branch: name, stage: "same-plus-adjacent", at: "shrink-stage-entry" });
                try {
                    const rebased = await dk.measureCloud(name);
                    null != rebased && Number.isFinite(rebased) && (prevPhaseCloud = rebased, report.stagedScoring.rebasedAtShrinkEntry = rebased);
                } catch (e) {}
            }
            // (5) RULED SHRINK SEQUENCE (Jason, 2026-10-24
            // adjustment — supersedes the 08:05 order and every
            // earlier ordering; one-at-a-time step-down added
            // 2026-10-31, Jason). After the throw, shrink in
            // exactly this order: (1) the subcategory nodes
            // step down ONE AT A TIME within the branch, each
            // in geometric fashion down to THREE TIMES its
            // kink length (3x its fit target —
            // SHRINK_FLOOR_FACTOR, ruled 2026-11-01, Jason)
            // or until collisions start, in
            // which case it backs up a step and the next node
            // takes its turn; (2) the same step-down process
            // is then repeated for the category — the main
            // branch steps down geometrically to its floor,
            // backing up a step when collisions start. There
            // is NO kink shrink stage: kinks keep their thrown,
            // fit-capped lengths (the fit cap at 3x the kink
            // length since the 2026-11-01 ruling), and no code
            // here restores kink overrides to pre-run lengths.
            // Each ladder descends in square-root steps
            // (dkLadderSteps / dkLadderValue — step sizes in
            // proportion to the square root of the steps
            // remaining, largest first, fixed count landing
            // exactly on the floor; ruled 2026-11-02, Jason),
            // one committed sub-solve per stage,
            // stopping at its floor OR at collision onset (see
            // the onset rule above), whichever comes first.
            // Fit targets are FLOORS, not ceilings: every item
            // is first PINNED at its thrown radius, and only
            // its own ladder's stages advance it, so no stage
            // can chop a later node early or grow an item up
            // to a floor computed at thrown geometry. A node
            // whose ladder runs to its final stage also
            // restores its own length override at that stage
            // (an entry the snapshot lacks is removed) — the
            // old shorten commit's job, distributed per node;
            // for subcategories the restored value is the
            // fit-derived floor, not the pre-run snapshot
            // value (lever unification, ruled 2026-11-01
            // 20:25, Jason — see runLadder and the
            // fit-subcats restore below); the branch
            // ladder in step (2) IS the branch level's
            // restore, taken in log stages rather than one
            // commit. A node held by onset backs up a stage
            // (step-four ruling, 2026-10-31 — see onsetBackUp
            // below), so the lengths of the stage before the
            // tripping one stand. (On the skip-throw path
            // under 5 this back-up now applies too — re-ruled
            // 2026-11-01, Jason; see onsetBackUp's call sites
            // in the ladders below.) The cascade stays armed throughout.
            const restoreLen = (map, key, snapMap) => {
                null != snapMap && Object.prototype.hasOwnProperty.call(snapMap, key) ? map[key] = Object.assign({}, snapMap[key]) : delete map[key];
            };
            dk.armFitForBranch(name);
            const fullFitTargets = {}, stageFrom = {}, fitNow = dk.fitTargets();
            Object.keys(fitNow).forEach(k => {
                "revision" !== k && k.split("|")[1] === name && (fullFitTargets[k] = fitNow[k]);
            }), dkFitBranchItems(name).forEach(w => {
                const k = dkRadialBaseInfo(w).key;
                Number.isFinite(w.cloudRadius) && (stageFrom[k] = w.cloudRadius);
            }), Object.keys(fullFitTargets).forEach(k => {
                Number.isFinite(stageFrom[k]) && dk.setFitTarget(k, stageFrom[k]);
            });
            // Back-up-a-step fit coherence: the armed + pinned
            // registry above is the fit state the first ladder
            // stage builds on, so it becomes the kept fit state
            // paired with the post-throw kept layout — a first
            // stage trip then restores a registry the rest of
            // the cascade (and the final patch's carry) can
            // still read, not the empty pre-arming one.
            refreshKeptFit(dk, name);
            // STEP-FOUR BACK-UP (ruled 2026-10-31, Jason): in
            // the shrink step, when collisions start — the
            // onset hold trips — the stage backs up a stage:
            // the last-kept state from BEFORE the tripping
            // stage is restored (layout and fit registrations
            // together), the ladder stops, and the cascade
            // proceeds from the backed-up state. This applies
            // to BOTH levels — the subcategory ladder and the
            // category (branch) ladder. It replaces the older
            // onset rule under which the tripping stage's
            // commit stood. The fine-tune skip path was
            // formerly excepted (its tripping commit stood);
            // the 2026-11-01 skip-throw re-ruling removed
            // that exception — the ladders call this on the
            // skip path too, so a subcategory back-out backs
            // up a step there exactly as here. An onset
            // back-up is NOT a category back-out: it never
            // sets branchBackedOut and never ends the run.
            const onsetBackUp = async (levelName, stage, keptBefore) => {
                lastKeptSnapshot = keptBefore.snap, lastKeptFit = keptBefore.fit, restoreKept(!1, dk, snapshot, name);
                let restoredCloud = null;
                try { restoredCloud = await dk.measureCloud(name); } catch (e) { restoredCloud = null; }
                null != restoredCloud && Number.isFinite(restoredCloud) && (prevPhaseCloud = restoredCloud);
                const holdsArr = fineTuneActive ? report.fineTune.holds : report.onset.holds, lastHold = holdsArr[holdsArr.length - 1];
                lastHold && (lastHold.backedUp = !0, lastHold.restoredCloud = restoredCloud);
                const rec = report.phases[report.phases.length - 1];
                rec && rec.onsetHold && (rec.onsetHold.backedUp = !0, rec.onsetHold.restoredCloud = restoredCloud);
                rec && rec.fineTuneHold && (rec.fineTuneHold.backedUp = !0, rec.fineTuneHold.restoredCloud = restoredCloud);
                witnessRestore("onset-backup-restored", levelName + "-" + stage, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                dkLog.push({ type: "onset-backup", level: levelName, stage: stage, restoredCloud: restoredCloud });
            };
            const runLadder = async (levelName, keys, restore, floors) => {
                if (!keys.length) return;
                // ONE AT A TIME (ruled 2026-10-31, Jason): the
                // level's nodes step down one at a time, not
                // in lockstep — each node descends its own
                // ladder in square-root steps (dkLadderSteps /
                // dkLadderValue, one
                // committed sub-solve per stage) all the way
                // down to its floor — for subcategories, THREE
                // TIMES its own length (SHRINK_FLOOR_FACTOR,
                // ruled 2026-11-01, Jason) — before the next
                // node starts. When collisions
                // start on a node's ladder — the onset hold
                // trips — that node backs up a step
                // (onsetBackUp, the step-four ruling) and its
                // ladder stops; the next node then takes its
                // turn from the backed-up state. A per-phase
                // gate trip likewise ends only that node's
                // ladder. At a node's final stage its own
                // length override is restored to its pre-run
                // snapshot value (restore(patch, k) below).
                let stageNo = 0;
                for (const k of keys) {
                    const floorFor = floors && null != floors[k] ? floors[k] : fullFitTargets[k], isSub = "subcat" === k.split("|")[0], subLabel = isSub ? k.split("|")[2] : null;
                    let outcome = null, stagesRun = 0;
                    // 3X-FLOOR ATTEMPT PRE-CHECK (repair,
                    // 2026-11-01; floors re-ruled to 3x the same
                    // day; override floor unified with the fit
                    // floor 2026-11-01 20:25, Jason): a
                    // subcategory is held without
                    // a ladder only when BOTH of its levers are
                    // already at their floors — its fit radius
                    // at or below THREE TIMES its name length
                    // AND its length override at or below the
                    // fit-derived floor (oFloorFor below: that
                    // same 3x name-length fit floor converted
                    // into override units).
                    // A node with no thrown radius and no
                    // override to step down is likewise recorded,
                    // never passed over in silence.
                    const curSnap0 = isSub ? dk.snapshot() : null, thrownEntry = curSnap0 && curSnap0.subcatOverrides ? curSnap0.subcatOverrides[subLabel] : null, thrownLen = thrownEntry && Number(thrownEntry.length) > 0 ? Number(thrownEntry.length) : NaN, preEntry = isSub && snapshot.subcatOverrides ? snapshot.subcatOverrides[subLabel] : null, preLen = preEntry && Number(preEntry.length) > 0 ? Number(preEntry.length) : (isSub ? dkBakedSubBase(subLabel || "") : NaN), fitSteps = Number.isFinite(stageFrom[k]) && Number.isFinite(floorFor) && floorFor < stageFrom[k] ? dkLadderSteps(stageFrom[k], floorFor) : 0;
                    // LEVER UNIFICATION (ruled 2026-11-01
                    // 20:25 CST, Jason): the fit lever and the
                    // override lever do the same job and are
                    // now the same thing — ONE floor, the
                    // fit-length floor (floorFor: THREE TIMES
                    // the name length), drives both. The
                    // override's floor is DERIVED from that
                    // fit floor through the item's pre-run
                    // delivered radius, exactly as the branch
                    // ladder's floor and the kink
                    // shrink-to-label driver convert a
                    // rendered fit target into an override
                    // length (afterLength = curLen x target /
                    // delivered, with curLen the pre-run
                    // length — preLen here — and delivered
                    // the pre-run delivered segment,
                    // preDelivered.items[k] here). The
                    // override lever's old separate floor —
                    // THREE TIMES the pre-run length — is
                    // retired for subcategories: with the
                    // paint following the override
                    // (segment = pre-override length x
                    // override, floored at 430 in drawH /
                    // capture), that separate floor stopped
                    // the painted segment at 430 x 3 x the
                    // pre-run length no matter how far the
                    // fit target descended. Derived from the
                    // fit floor instead, the override descends
                    // in lockstep with the fit target, and at
                    // the floor the painted segment stands at
                    // the fit-derived length (the fit floor
                    // itself, through the paint's own
                    // pre-override length). When the
                    // conversion inputs are not all finite
                    // and positive the derived floor is NaN
                    // and the override ladder does not run
                    // for that node (the fit ladder still
                    // does); every rendered subcategory has a
                    // pre-run delivered radius, so this is a
                    // guard, not an expected path.
                    const oFloorFor = isSub && Number.isFinite(preLen) && preLen > 0 && Number.isFinite(floorFor) && floorFor > 0 && preDelivered && preDelivered.items && Number.isFinite(Number(preDelivered.items[k])) && Number(preDelivered.items[k]) > 0 ? preLen * floorFor / Number(preDelivered.items[k]) : NaN, oSteps = Number.isFinite(thrownLen) && Number.isFinite(oFloorFor) && thrownLen > oFloorFor ? dkLadderSteps(thrownLen, oFloorFor) : 0;
                    if (isSub && floors) {
                        if (!Number.isFinite(stageFrom[k]) && oSteps <= 0) outcome = "no-thrown-radius"; else if (!Number.isFinite(floorFor) && oSteps <= 0) outcome = "no-floor-target"; else if (fitSteps <= 0 && oSteps <= 0) outcome = "held-at-1x-floor";
                    }
                    if (!outcome) {
                    const fitStages = Math.min(DK_LADDER_MAX_STAGES, fitSteps), oStages = Math.min(DK_LADDER_MAX_STAGES, oSteps), stages = Math.max(fitStages, oStages);
                    // ONE LEVER, ONE LADDER (repair,
                    // 2026-11-01; unified 2026-11-01 20:25,
                    // Jason): a subcategory's DRAWN spoke is
                    // its fit radius stepped out by its length
                    // override (renderedSpokeLength multiplies
                    // by the override), so the fit ladder alone
                    // barely moves the visible spoke — the
                    // override is the thrown length (x20 at the
                    // throw). Each stage therefore steps BOTH
                    // writings on their own square-root-step
                    // ladders (dkLadderSteps / dkLadderValue),
                    // in lockstep, toward the ONE floor: the
                    // fit target down to THREE TIMES the NAME
                    // length (SHRINK_FLOOR_FACTOR, ruled
                    // 2026-11-01, Jason), the override down to
                    // oFloorFor — that same fit floor derived
                    // into override units through the item's
                    // pre-run delivered radius (see the
                    // derivation at oFloorFor above) — the
                    // longer ladder setting the stage count
                    // and the shorter holding at its floor
                    // once reached. Before the 2026-11-01
                    // repair the override moved only in the
                    // final stage's restore jump, so a node
                    // held before its final stage (onset or
                    // gate) kept its full thrown override and
                    // stood visibly unshrunk — the long
                    // subcategory branches of the 2026-11-01
                    // inspection. Now a held node stands at
                    // its last kept step, one step above the
                    // tripping stage after the back-up.
                    for (let j = 1; j <= stages; j++) {
                        const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                        witnessTrippingLabel = isSub ? subLabel : null;
                        if (fitSteps > 0) dk.setFitTarget(k, dkLadderValue(stageFrom[k], floorFor, Math.min(j, Math.max(1, fitStages)), Math.max(1, fitSteps)));
                        const patch = dk.snapshot();
                        if (isSub && oSteps > 0 && patch.subcatOverrides) patch.subcatOverrides[subLabel] = Object.assign({}, patch.subcatOverrides[subLabel], { length: dkLadderValue(thrownLen, oFloorFor, Math.min(j, Math.max(1, oStages)), Math.max(1, oSteps)) });
                        j === stages && restore && restore(patch, k), mark = dkLog.length, stageNo += 1, stagesRun = j;
                        const ladderRes = await runPhase(levelName + "-" + stageNo, patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                        // A gate trip AT the final stage is the ruled
                        // completion: the node descended its whole
                        // ladder and stands at its last kept step.
                        // Only a trip before the final stage
                        // leaves the node held above its floor.
                        if (ladderRes && ladderRes.dkPhaseTripped) { outcome = j >= stages ? "reached-1x-floor" : "held-gate"; break; }
                        // Phase 4 (2026-11-04): onsetCheck is a no-op.
                        // The onset and fine-tune margins are deleted.
                        // Only the per-phase gate above rejects a stage.
                        onsetCheck(levelName, stageNo);
                    }
                    if (isSub && floors && !outcome) outcome = "reached-1x-floor";
                    }
                    if (isSub && floors) {
                        // The record reports the OVERRIDE
                        // writing — the thrown length that
                        // actually renders (thrown x20 down to
                        // oFloorFor, the fit-derived floor) —
                        // with the fit lever's 3x name target
                        // kept alongside as fitFloor. (Before
                        // the 2026-11-01 20:25 unification the
                        // reported floor was the override's own
                        // separate 3x pre-run floor.)
                        const rec = { key: k, label: subLabel || k, from: Number.isFinite(thrownLen) ? thrownLen : (Number.isFinite(stageFrom[k]) ? stageFrom[k] : null), floor: Number.isFinite(oFloorFor) ? oFloorFor : (Number.isFinite(floorFor) ? floorFor : null), fitFrom: Number.isFinite(stageFrom[k]) ? stageFrom[k] : null, fitFloor: Number.isFinite(floorFor) ? floorFor : null, stages: stagesRun, outcome: outcome || "reached-1x-floor", standing: (outcome && 0 === outcome.indexOf("held") && Number.isFinite(thrownLen) && oSteps > 0) ? dkLadderValue(thrownLen, oFloorFor, Math.max(0, stagesRun - 1), Math.max(1, oSteps)) : (Number.isFinite(thrownLen) ? thrownLen : null) };
                        report.subcatShrink.push(rec), dkLog.push(Object.assign({ type: "subcat-shrink-attempt" }, rec));
                    }
                }
            };
            const ladderKeys = Object.keys(fullFitTargets).filter(k => Number.isFinite(stageFrom[k]));
            // EVERY RENDERED SUBCATEGORY IS ATTEMPTED (repair,
            // ruled 2026-11-01 01:44, Jason): the attempt list
            // is built from the branch's rendered subcategory
            // items, not only from the fit keys that happened
            // to arm — a subcategory whose fit target could not
            // be computed still gets a 3x-length floor and a
            // recorded attempt in runLadder, so no rendered
            // subcategory can pass through the cascade
            // unattempted and unrecorded. The floor for this
            // level is THREE TIMES the NAME length
            // (dkNameFitTargetForKey x SHRINK_FLOOR_FACTOR,
            // ruled 2026-11-01, Jason — superseding the 1x
            // name-length floor of 2026-11-01 01:44), not the
            // neighbour-pitch fit target in
            // fullFitTargets: in a crowded fan that target can
            // sit at or above the thrown radius and hold the
            // node at its thrown length. A subcategory that
            // never armed is pinned at its thrown radius here,
            // exactly as the armed items are pinned above, so
            // its ladder's first stage has a starting target.
            const subcatKeys = [], subcatFloors = {};
            dkFitBranchItems(name).forEach(w => {
                if (!w.topic || !w.topic.isSubcategory) return;
                const k = dkRadialBaseInfo(w).key;
                if (subcatKeys.indexOf(k) >= 0) return;
                subcatKeys.push(k);
                const nt = dkNameFitTargetForKey(k);
                // SUBCATEGORY FIT FLOOR = 3 x the subcategory
                // name length (SHRINK_FLOOR_FACTOR) — this is
                // the floorFor endpoint the fit ladder in
                // runLadder descends to via dkLadderSteps /
                // dkLadderValue(stageFrom[k], floorFor, ...).
                const subcatFitFloor1x = null != nt && Number.isFinite(nt) ? nt * SX_SCORE.SHRINK_FLOOR_FACTOR : (null != fullFitTargets[k] && Number.isFinite(fullFitTargets[k]) ? fullFitTargets[k] * SX_SCORE.SHRINK_FLOOR_FACTOR : fullFitTargets[k]);
                subcatFloors[k] = subcatFitFloor1x;
                if (null == fullFitTargets[k] && Number.isFinite(stageFrom[k])) dk.setFitTarget(k, stageFrom[k]), fullFitTargets[k] = stageFrom[k];
            });
            // Ruled step (1) (one at a time, ruled 2026-10-31,
            // Jason): the subcategory nodes step down FIRST,
            // one at a time — each node descends its own
            // geometric ladder to its 3x floor (three times
            // its own length — SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason) before the next node starts,
            // onset-held: when collisions start on a node's
            // ladder it backs up a step (onsetBackUp inside
            // runLadder) and the next node takes its turn.
            // Kinks have no ladder at all — they keep their
            // thrown, fit-capped lengths (cap at 3x the kink
            // length). The final-stage restore below stands
            // the override at the FIT-DERIVED floor — the
            // node's 3x name-length fit floor (subcatFloors)
            // converted through its pre-run delivered
            // radius with the snapshot entry's length (or
            // the baked base when the snapshot carries
            // none) as curLen — the same derived value the
            // ladder's last stage writes (lever
            // unification, ruled 2026-11-01 20:25, Jason;
            // it replaces the restore's former THREE TIMES
            // the pre-run length, the override lever's old
            // separate floor). When the conversion inputs
            // are unavailable for a node the former 3x
            // pre-run value stands as the guard fallback.
            await runLadder("fit-subcats", subcatKeys, (patch, k) => { const l = k.split("|")[2]; if (null != l) { const se = snapshot.subcatOverrides ? snapshot.subcatOverrides[l] : null, sb = se && Number(se.length) > 0 ? Number(se.length) : dkBakedSubBase(l); const ff = subcatFloors ? subcatFloors[k] : null, pd = preDelivered && preDelivered.items ? Number(preDelivered.items[k]) : NaN, derived = sxLenConvert(sb, pd, ff); patch.subcatOverrides[l] = Object.assign({}, se || {}, { length: Number.isFinite(derived) && derived > 0 ? derived : sb * SX_SCORE.SHRINK_FLOOR_FACTOR }); } }, subcatFloors);
            // Ruled step (2): the branch's own length override
            // descends geometrically from its thrown length to
            // its pre-run length (the baked base when the
            // snapshot carries no override for it), onset-held:
            // a stage whose commit trips onset is the branch
            // ladder's last. (Step-four back-up, ruled
            // 2026-10-31: that stage now backs up a stage —
            // the previous stage's length stands and the
            // final patch below carries THAT through. Before
            // this ruling the tripping stage's length stood.)
            // TERMINATION FLAG (ruled 2026-10-28, Jason 23:43,
            // scope confirmed 23:49): a per-phase GATE trip in
            // THIS branch (category) ladder — a back-out, where
            // runPhase discarded the tripping stage and restored
            // the last-kept snapshot — is reported to the caller
            // as branchBackedOut, and the caller ENDS the run on
            // it (no growth, no final patch, no final gate; the
            // backed-out state stands). An ONSET hold in this
            // ladder is NOT a back-out (the tripping commit
            // stands, nothing is restored) and never sets this
            // flag; a subcategory-ladder back-out never sets it
            // either — runLadder's trips stay inside that level
            // and the cascade proceeds to this ladder as before.
            let branchBackedOut = !1, branchGateRejected = !1;
            const branchCur = (dk.snapshot().branchOverrides || {})[name], branchSnap = snapshot.branchOverrides ? snapshot.branchOverrides[name] : null;
            let branchFrom = branchCur ? Number(branchCur.length) : NaN, branchTo = branchSnap && Number(branchSnap.length) > 0 ? Number(branchSnap.length) : dkBakedBranchBase(name);
            // BRANCH LABEL-FIT FLOOR (first ruled 2026-10-29
            // 04:57 for the fine-tune skip path; generalized to
            // every run 2026-10-31, Jason): the ladder descends
            // toward the pre-run length by default, but Jason's
            // shrink rule is that it tries to shrink all the way
            // to the length of the category name — so this floor
            // now applies on every run, not only when the branch
            // starts at its pre-run length. The floor is
            // label-fit TIMES THREE (SHRINK_FLOOR_FACTOR, ruled
            // 2026-11-01, Jason — superseding the 1x floor):
            // three times the length of the branch's longest
            // kink name, from the existing label-fit mechanism
            // (dkComputeFitTarget — the item's own label measured
            // at its actual render font, font-relative). UNITS,
            // flagged as the ruling requires: fit targets are
            // RENDERED lengths in map units, while a branch
            // length override is a dimensionless multiplier on
            // the branch's delivered radius (yr) — the code's
            // units genuinely differ, so the floor converts
            // through the pre-run delivered branch radius exactly
            // as the existing kink shrink-to-label driver
            // converts its targets (afterLength = curLen x
            // target / delivered), with curLen the PRE-RUN length
            // (branchTo's value here, before the floor lowers
            // it). The governing item is the branch item with
            // the largest label-fit target: the branch spoke must
            // stay long enough that that kink's label still fits.
            // At 1x this floor could sit at or above the
            // pre-run length and the ladder then simply did
            // not run; at 3x the floor is the level's target
            // wherever it lands — the ladder descends to it
            // from the thrown length, and a branch standing
            // below it is set to it by the single-step path
            // below, exactly as the old pre-run target was.
            // The
            // descent still stops before the floor whenever
            // collisions start: the onset rule holds the level
            // when the cloud's crossing number rises (the
            // readout counts every crossing involving the
            // cloud's spokes — same-branch or foreign, any type
            // of collision), and a per-phase gate trip backs out
            // one step and ends the run per the termination
            // ruling above.
            {
                try {
                    let ftTarget = null, ftLabel = null;
                    dkFitBranchItems(name).forEach(w => {
                        const t = dkComputeFitTarget(dkRadialBaseInfo(w).key);
                        if (null != t && Number.isFinite(t) && (null == ftTarget || t > ftTarget)) {
                            ftTarget = t, ftLabel = w.child ? w.child.label : w.topic ? w.topic.label : w.label;
                        }
                    });
                    const ftCurLen = branchTo, ftDelivered = preDelivered.branch;
                    if (null != ftTarget && Number.isFinite(ftDelivered) && ftDelivered > 0 && ftCurLen > 0) {
                        // CATEGORY FLOOR = 3 x the category
                        // (label-fit) length: the 1x floor
                        // converted as before, times
                        // SHRINK_FLOOR_FACTOR. This ftFloor
                        // becomes branchTo below — the endpoint
                        // the branch ladder descends to via
                        // dkLadderSteps(branchFrom, branchTo) /
                        // dkLadderValue(branchFrom, branchTo, ...).
                        const ftFloor1x = ftCurLen * ftTarget / ftDelivered;
                        const ftFloor = ftFloor1x * SX_SCORE.SHRINK_FLOOR_FACTOR;
                        report.fineTune.branchFloor = { label: ftLabel || null, targetMapUnits: ftTarget, deliveredBranchMapUnits: ftDelivered, preRunLength: ftCurLen, floorLength: ftFloor, floorFactor: SX_SCORE.SHRINK_FLOOR_FACTOR };
                        dkLog.push({ type: "fine-tune-branch-floor", branch: name, label: ftLabel || null, target: ftTarget, delivered: ftDelivered, floorLength: ftFloor, floorFactor: SX_SCORE.SHRINK_FLOOR_FACTOR });
                        Number.isFinite(branchFrom) || (branchFrom = ftCurLen), ftFloor > 0 && (branchTo = ftFloor);
                    }
                } catch (e) {}
            }
            // 3X FLOOR FALLBACK (ruled 2026-11-01, Jason):
            // when no label-fit target could be computed
            // above, the category floor is three times the
            // branch's own pre-run length instead — the same
            // 3x rule on the only category length available.
            if (!(report.fineTune && report.fineTune.branchFloor) && Number.isFinite(branchTo) && branchTo > 0) branchTo = branchTo * SX_SCORE.SHRINK_FLOOR_FACTOR;
            if (Number.isFinite(branchFrom) && branchFrom > branchTo) {
                const bStages = Math.min(DK_LADDER_MAX_STAGES, Math.max(1, dkLadderSteps(branchFrom, branchTo)));
                for (let j = 1; j <= bStages; j++) {
                    const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                    witnessTrippingLabel = null;
                    const patch = dk.snapshot();
                    patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: dkLadderValue(branchFrom, branchTo, j, bStages) }), mark = dkLog.length;
                    const branchRes = await runPhase("fit-branch-" + j, patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                    if (branchRes && branchRes.dkPhaseTripped) { branchBackedOut = !0, branchRes.dkGateRejected && (branchGateRejected = !0); break; }
                    // Phase 4 (2026-11-04): onsetCheck is a no-op.
                    // Only the per-phase gate trip above ends this ladder.
                    onsetCheck("fit-branch", j);
                }
            } else if (Number.isFinite(branchFrom) && branchFrom !== branchTo) {
                const keptBeforeStage = { snap: lastKeptSnapshot, fit: lastKeptFit };
                witnessTrippingLabel = null;
                const patch = dk.snapshot();
                patch.branchOverrides[name] = Object.assign({}, patch.branchOverrides[name], { length: branchTo }), mark = dkLog.length;
                const branchRes1 = await runPhase("fit-branch-1", patch, mark, opts, dk, name, preDelivered, tax, report, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                if (branchRes1 && branchRes1.dkPhaseTripped) branchBackedOut = !0, branchRes1.dkGateRejected && (branchGateRejected = !0); else onsetCheck("fit-branch", 1); // no-op; gate above is the only stop
            }
                return { branchBackedOut: branchBackedOut, gateRejected: branchGateRejected };
            }
        async function dkRunCascade(branchName, opts) {
            const api = window.__SEXCAPADES_LAYOUT_API, dk = api.deknotter, name = null == branchName ? "" : String(branchName), tax = dkBranchTaxonomy(name);
            // F4 STEP 1a — label check (see the §5.11 note inside).
            const duplicates = stepLabelCheck();
            const report = {
                branch: name,
                labelCheck: { unique: !duplicates.length, duplicates: duplicates },
                preconditionsStaged: [],
                coverage: { actedOn: 0, totalInBranch: tax ? tax.total : 0 },
                baseline: { first: null, second: null, variance: null },
                phases: [],
                onset: { baseline: null, holds: [] },
                // FINE-TUNE (ruled 2026-10-29): skip-throw run record
                // — null-filled on a normal (throw) run; on a skip
                // run it carries the decision baseline, the arm
                // phase, the fine-tune holds, and the branch floor.
                fineTune: null,
                // STAGED SCORING (ruled 2026-11-02, Jason): this run's
                // scoring-stage record — the stage in force at run
                // start, the run-level switch point, the adjacent-
                // composition baseline captured on the pre-run
                // geometry for the final gate, and the phase the
                // switch landed in. Fields added only.
                stagedScoring: { stageAtStart: "same-branch-only", switchPoint: "shrink-stage-entry", adjacentFromPhase: null, baselineAdjacent: null },
                growth: null,
                // SUBCAT SHRINK ATTEMPTS (repair, 2026-11-01): one
                // record per rendered subcategory of this branch —
                // thrown radius, 3x length floor, stages run,
                // and the outcome (reached / held and why) — so a
                // run's receipt can prove every subcategory was
                // attempted and name any that was held.
                subcatShrink: [],
                // WITNESS DISCRIMINATOR (ruled 2026-11-01, Jason;
                // scope ruling 04:29 CST): per-subcategory delivered
                // radii captured frame by frame across every
                // back-out / restore of this run, judged ONLY
                // against the eyewitness hypothesis — a back-out
                // discarding per-subcategory shrink gains wholesale
                // (report.witness; helpers below). Fields added
                // only; no H1/H2/H3 fields are recorded.
                witness: { hypothesis: "wholesale-backout-discard", frames: [], events: [], verdict: "not-run", culprit: null, finalStep: null },
                // THROW RADII (conversion fix, 2026-11-01): the
                // throw's center-avatar radius, its world targets,
                // and the override lengths stepThrow converted
                // them into — recorded by stepThrow, null on a
                // skip-throw run. Fields added only.
                throwRadii: null,
                // Q4: the gate's decider is the branch's own-cloud
                // crossing number — baseline/finalCloud/delta below
                // (and every phase record's cloud) carry CROSSING
                // values under their existing names. Neighbor clouds'
                // crossing numbers are reported (baseline + final)
                // under neighbors, flagged reportedNotGated: no
                // neighbor value ever passes or fails this run.
                // The xAreaCross area used to be reported alongside,
                // explicitly secondary, in baseline.areaSecondary /
                // finalAreaSecondary / deltaAreaSecondary; those fields
                // and their measurements were removed with the area
                // observation (2026-10-29, M1) and the commented-out
                // copies were deleted (2026-10-30, paragraph-6
                // solver-metrics edit) so they cannot drift from the
                // live code — see the single record at measureCloud
                // below. In their place the report carries bakeGate
                // (M4): the total crossing number (this cloud plus
                // every neighbor cloud, combined) before -> after,
                // passing only when its increase is strictly less
                // than SX_SCORE.BAKE_GATE_LIMIT — reported for the
                // bake decision; this run's own gates are unchanged.
                metric: { decider: "crossingnumber" },
                neighbors: { reportedNotGated: !0, baseline: null, final: null },
                finalCloud: null,
                delta: null,
                bakeGate: null,
                plateau: null,
                gate: "reverted",
                reason: null
            };
            // BAKE GATE (M4, ruled 2026-10-29): the ONE computation of
            // the bake decision, called at both run endings (the
            // category back-out ending and the final patch) — the
            // limit and the comparison were previously written out
            // twice, once per ending. It sums the total crossing
            // number — this cloud plus every neighbor cloud,
            // combined — before and after, and passes only when the
            // increase is strictly less than
            // SX_SCORE.BAKE_GATE_LIMIT. Reported for the bake
            // decision; it does not gate this run. A failure to
            // compute leaves bakeGate null, exactly as the two
            // inline copies did.
            if (duplicates.length) report.labelCheck.note = "subcategory labels are keyed by bare label: arming a duplicated label arms it in every branch that bears it";
            if (!tax) {
                return report.reason = "unknown branch: " + (name || "(none)"), dkLog.push({ type: "run-report", report: report }), report;
            }
            // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31, Jason):
            // a live blit session at run start is ended BEFORE the
            // context opens, with one ordinary full paint — the
            // session's documented end ("any non-scoped paint") —
            // so its 20 s settle-guard timer can never fire
            // mid-run and fight the cascade's interim solves (the
            // guard's restore paints would replay a pre-session
            // capture over the run's delivered registry). With no
            // session active, nothing extra is painted.
            if (blitSess) {
                try {
                    Mr({
                        animate: !1,
                        forceRepaint: !0
                    });
                } catch (e) { __sxErrLog("layout-anneal-prerun-paint", e); }
            }
            if (!dk.begin({ branch: name, cap: 200, control: { onHeartbeat: opts && "function" == typeof opts.onHeartbeat ? opts.onHeartbeat : null, shouldCancel: opts && "function" == typeof opts.shouldCancel ? opts.shouldCancel : null } })) {
                return report.reason = "a DeKnotter context is already active", dkLog.push({ type: "run-report", report: report }), report;
            }
            snapshot = null;
            // Q2: the run's total fit-deviation count across every
            // phase record so far, for the report (and through it
            // the receipt lead).
            // WITNESS DISCRIMINATOR helpers (ruled 2026-11-01,
            // Jason; scope ruling 04:29 CST): this run investigates
            // ONLY the eyewitness report — the cloud scooches in
            // shortened, hits the collision mark, backs back out,
            // and then ALL subcategories stand back at extreme
            // (thrown) length instead of keeping the shortened
            // lengths of a frame before, as if a back-out threw out
            // every subcategory's shrink gains at once instead of
            // backing out one subcategory one step at a time. The
            // H1/H2/H3 options from diagnosis da3faf43
            // (floor-above-thrown, solve/paint re-expansion,
            // one-at-a-time back-out) are NOT investigated here and
            // no fields are recorded for them. Observational only:
            // frames are read from the delivered-radii readout the
            // phase records already use; nothing here writes layout
            // state, fit state, or any gate input, so the solve,
            // gates, receipts and scoped freeze are unchanged. One
            // frame per kept phase plus one after every restore
            // (per-phase gate back-up, onset back-up,
            // category-back-out disarm, final patch, whole-run
            // revert): a correct one-step back-out restores exactly
            // the last kept frame, so any subcategory a restore
            // moves — above all one it returns to its thrown
            // delivered radius when that subcategory was not the
            // tripping one — is the wholesale discard the witness
            // describes, and witnessJudge names it per event.
            const WITNESS_EPS = .02, WITNESS_ONE_STEP = 1.115;
            witnessLastFrame = null; witnessFrameSeq = 0; witnessThrown = null; witnessTrippingLabel = null;
            // FINAL-STEP WITNESS EXTENSION (ruled 2026-11-01,
            // Jason; refinement 07:30 CST): the eyewitness report
            // refined — the run pulls in almost perfectly until
            // the LAST step, and the last step flings the
            // subcategories back out. The back-out judge above
            // never sees that step: its last frame is the final
            // patch commit and its verdict is computed before the
            // closing full paint. This extension captures one
            // frame further, only around the final step: the
            // last kept phase, immediately before and after the
            // final patch commit, and one frame after the
            // closing full paint (in the finally block, once that
            // paint — settle search included — has run), and
            // judges each of those two transitions on its own:
            // a subcategory that grows past one ladder step
            // (WITNESS_ONE_STEP) across either transition was
            // flung, not stepped; two or more at once, or any
            // one returned to its thrown length, is the
            // wholesale fling the witness describes, and the
            // record names the transition — final patch commit
            // or closing full paint — that did it. Frames are
            // held by direct reference on report.witness
            // .finalStep, so the 600-frame cap on the frames
            // array can never drop them. Observational only,
            // exactly like the judge above: nothing here writes
            // layout state, fit state, or any gate input.
            witnessFinalLastKept = null; witnessFinalBefore = null; witnessFinalAfter = null; witnessFinalOperation = null; witnessFinalTripped = !1;
            // FINAL-STEP WITNESS judge (extension above): one
            // transition of the final step, before-frame against
            // after-frame. There is no tripping subcategory at
            // the final step — nothing there is entitled to move
            // a subcategory outward past one step — so any
            // subcategory that does is recorded as flung, with
            // its before / after delivered radii, the override
            // lengths standing at both frames, and whether it
            // landed back at its thrown delivered radius.
            // PAINTED-GEOMETRY WITNESS EXTENSION (ruled 2026-11-01,
            // Jason, 08:00 CST — painted-geometry witness extension):
            // the final-step witness above reads dkDeliveredRadii —
            // solve/override BOOKKEEPING. Jason's eyewitness report
            // on the Impact run (receipt: final-step witness HELD)
            // is that the subcategories were nevertheless flung back
            // out on the last frame he SAW. Taken at his word, the
            // fling either happens after the frame the bookkeeping
            // witness measures, or the last paint renders
            // differently from the radii it measures — a MEASUREMENT
            // DIVERGENCE the bookkeeping witness cannot see by
            // construction. This extension extends the witness one
            // visual frame further, in the painted domain: it reads
            // the ACTUAL PAINTED SVG GEOMETRY (node positions via
            // each icon's own getCTM chain — the same rendered read
            // the settle guard's sgCaptureRenderedCenters uses —
            // with the painted stem path's endpoints as the only
            // fallback when the CTM read fails; data-layout-x/y is
            // never substituted, and a node neither painted source
            // can read is recorded not-observed), and records, for
            // EVERY subcategory of the run's branch (all 7 on
            // Impact, pain & body modification; generic over any
            // branch — Bondage and Sex acts run through this same
            // code), THREE separate numbers per subcategory:
            //   branchR — centre to branch node (branch delivered
            //             radius, painted);
            //   seg     — branch node to subcategory node
            //             (subcategory segment length, painted);
            //   absR    — centre to subcategory node (absolute
            //             delivered radius, painted).
            // Frames are taken at the last kept phase, immediately
            // before and after the final step, after the closing
            // full paint, and after the next animation frame /
            // settle (the extended frame, awaited in the finally
            // block). The pair of painted captures spanning the
            // closing paint (after-final-step -> after-closing-
            // paint, plus after-settle) is the capture pair the
            // receipt names. Each painted transition is judged on
            // its own and NAMES the exact operation that moved any
            // of the three numbers past one ladder step. FIX for
            // the divergence branch of the ruling: the witness now
            // reads painted geometry, so a post-paint repaint /
            // settle that re-derives painted positions can no
            // longer hide behind bookkeeping that held. No shrink
            // step size, throw factor, floor, or stop rule is
            // touched by this extension; it is observational plus
            // the measurement fix, exactly as ruled.
            witnessPaintedBefore = null; witnessPaintedAfter = null; witnessPaintedLastKept = null; let witnessPaintedAfterPaint = null, witnessPaintedAfterSettle = null;
            // One painted transition judged on its own: any of the
            // three numbers (branchR / seg / absR) growing past one
            // ladder step names the subcategory and the metric; two
            // or more subcategories flung on seg or absR, or any one
            // returned to its thrown segment, is the wholesale
            // fling. The record carries the transition's operation
            // string verbatim, so the receipt names the exact
            // operation that moved the numbers.
                // ACCEPT-PATH STEP-THROUGH DIAGNOSTICS (ruled 2026-11-01,
                // Jason): read-only pauses at three checkpoints on the
                // back-out gate Accept path only - ANNEAL-DIAG-01 after
                // Accept, before restoreKept; ANNEAL-DIAG-02 after
                // restoreKept lands, before the closing full paint;
                // ANNEAL-DIAG-03 after the closing full paint lands,
                // before settle / run end (in the finally block below).
                // Active only when the shell supplies opts.onDiagPause
                // (session-only toggle; absent = no pauses, no cards, no
                // logs, exactly today's behavior). These helpers only
                // READ state - stored delivered radii, painted geometry,
                // and the live SVG view - and never write a length, a
                // delivered radius, a viewBox, or a crossing value.
                diagAcceptCtx = null;
                // Capture-time per-item fields from the closing
                // paint's centre capture (paintComposition branch of
                // scCaptureDeliveredCenters), stashed by the finally
                // block at the capture moment so DIAG-03 can report
                // the registry fields the capture consumed — the
                // closing solve reassigns dkLastBranches, so reading
                // them at pause time would give closing-time values.
                let diagCaptureFields = null;
                // HUB LOGGING (diagnostic-only, ruled 2026-11-01, per
                // HUB-SIDE-DIAGNOSIS.md): the painted hub seat read at
                // DIAG-02 — the last pause before the closing full
                // paint — stashed so DIAG-03 can print the pre-paint
                // hub seat beside the painted hub it ends with, and
                // the hub's movement across the closing paint is
                // attributable. Read-only.
                diagPrePaintHub = null;
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01,
                // Jason): the closing-paint traces the code-locate
                // assessor named as the deciding evidence between the
                // two closing-paint paths - the closing-paint mode,
                // the closing paint's scoped-paint counts, whether
                // its segment-timing entry exists, and the camera
                // state. Read-only: these helpers only READ the live
                // camera variables / the painted viewport transform,
                // and the traces themselves are read off values the
                // run already computed (the finally block's
                // closingPaintMode and the dkLog entries the closing
                // paint itself pushed). Nothing here paints, captures
                // a freeze or a segment, fits, or writes state.
                // HUB-GROUP ELEMENT IDENTITY (diagnostic-only, ruled
                // 2026-11-01, per CLOSING-PAINT-BLOWUP-ASSESSOR-REPORT
                // Q5): which element the hub-group query matches at a
                // capture moment — how many elements carry the hub's
                // layout key, whether the matched one is an exit
                // clone, and whether its category label rides a
                // textPath. Read-only; shared by DIAG-00 and DIAG-03.
                // DIAG-00 + PER-STAGE REGISTRY SNAPSHOT + ON-DEMAND
                // FULL PAINT (ruled 2026-11-01, Jason, per
                // CLOSING-PAINT-BLOWUP-ASSESSOR-REPORT Q3/Q5 and
                // HELD-FLOOR-AND-FULLPAINT-ASSESSOR-REPORT §1.7):
                // three measurement instruments, nothing else.
                // DIAG-00 and the registry snapshots ride the shell's
                // diagnostics option (opts.diag00; session-only,
                // default ON beside the step-through toggle) and are
                // pure reads — no paint, no settle, no state write —
                // so they change no geometry and no run outcome. The
                // on-demand paint rides its own session-only option
                // (opts.onDemandFullPaint, DEFAULT OFF, never written
                // into saved layouts/profiles). Counters for the
                // paint trigger: a run-wide runPhase ordinal, a
                // commit count excluding the throw, and the
                // fit-subcats commit count that arms the +5 series.
                diagPhaseOrdinal = 0; diagPaintCount = 0; diagFitSubcatsCount = 0; diagPaintBase = null;
                // DIAG-00: one painted-geometry snapshot of the saved
                // layout, taken after the baseline step and before
                // the throw / fine-tune arm — the DOM still holds
                // the pre-run full paint and no phase has committed.
                // Same helpers as DIAG-03 (dkPaintedGeometry,
                // diagCaptureView, diagCamera), plus the Q5 fields:
                // per-branch bbox decomposition, the paintComposition
                // capture fields for ALL items including non-target
                // branches, pre-run override provenance, and the
                // hub-group element identity. Stage-stamped
                // "ANNEAL-DIAG-00:pre-run:ord-0" on every capture it
                // takes, so no later baseline reads it as unstamped.
                // PER-STAGE REGISTRY SNAPSHOT (§1.7 columns, zero
                // paint): logged inside runPhase after the commit
                // and the cloud measurement, BEFORE the gate
                // decision, so tripped stages are included. Per
                // subcategory key: the fit target set, the override
                // written, the post-commit solve radius
                // (cloudRadius from the solve registry), the
                // delivered radius — plus the phase's gate threshold
                // and verdict and the onset reading and verdict
                // (report-only; the onset check itself still runs in
                // the ladder exactly as before). Registry reads
                // only: no DOM paint, no repaint, no settle, and no
                // state write beyond the record and the log.
                // ONE ON-DEMAND FULL PAINT (Q3 exact trigger wording,
                // implemented in runPhase): one freeze-replay full
                // paint with the run context live (dkCtx untouched),
                // under the closing-paint opClass so the hub snap
                // fires — if the freeze capture is unavailable the
                // paint does not run at all, never under another
                // opClass — with blit starts held and any standing
                // blit session ended before and after, exactly as
                // the closing paint does. The flag through Mr
                // (__sxDiagFullPaint) and the blit hold are set
                // together, gated by the same toggle. One
                // stage-stamped painted-geometry snapshot is logged
                // per paint. Decision inputs are registry reads, so
                // the paint changes no gate/onset verdict and no
                // run outcome.
                // THROW-BRACKET PAINTS (diagnostic, ruled 2026-11-01
                // 23:57 CST, Jason): measurement ONLY around the first
                // throw. One full paint + one stage-stamped
                // painted-geometry snapshot BEFORE stepThrow runs
                // (THROW-BEFORE) and one AFTER it commits
                // (THROW-AFTER), each followed by a prompt pause on
                // the shell's slim bottom-right strip
                // (opts.onThrowBracketPause; the strip opens slim
                // only, map fully visible behind it). Active only
                // when the shell supplies opts.throwBracket
                // (session-only toggle, default ON for this
                // diagnostic build, never written into saved
                // layouts/profiles); absent/false = no bracket
                // paints, no bracket snapshots, no bracket pauses,
                // no bracket log lines — exactly the pre-edit run.
                // The bracket paint replicates diagOnDemandPaint's
                // discipline exactly: freeze capture +
                // paintComposition centres, the run context live
                // (dkCtx untouched), hub seating only under the
                // closing-paint opClass ("anneal-closing-paint") —
                // if the freeze capture is unavailable the paint
                // does not run at all, never under another opClass —
                // any standing blit session ended before and after,
                // blit starts held for its duration, and the
                // __sxDiagFullPaint flag and the blit hold set
                // together. The snapshot uses the same helpers as
                // DIAG-00/DIAG-03 (dkPaintedGeometry,
                // diagCaptureView, diagCamera, diagHubIdentity,
                // diagText) and the same field list: per-branch bbox
                // decomposition, branch delivered radius,
                // per-subcategory segment / absolute radius / stored
                // radius, hub point + radius, camera state, override
                // provenance — plus the throw's own inputs (centre
                // radius, target radii, delivered radii, committed
                // override lengths from report.throwRadii).
                // stepThrow itself is untouched: nothing here writes
                // a length, an override, a fit target, a view, or
                // any gate/onset decision input, so the throw's
                // effect reads off BEFORE vs AFTER with no other
                // operation in between.
                throwBracketBefore = null;
            try {
                // STAGED SCORING (ruled 2026-11-02, Jason): the run's
                // judged score starts SAME-BRANCH ONLY; the context is
                // cleared in the finally block (dk.end) on every exit.
                sxAnnealStageCtx = { branch: name, adjacent: !1 };
                // F4 STEP 1b — preconditions: stage any violated choreography
                // values (written by the throw, restored by the final patch).
                const staged = stepPreconditions(api, report);
                // (3) SNAPSHOT + BASELINE: the snapshot is the
                // untouched pre-run state (taken before any staging is
                // applied, so a revert restores the user's real values,
                // staged ones included). The baseline is measured
                // TWICE (§5.8) and the observed variance reported.
                // F4 STEP 2 — snapshot + baseline: snapshot the untouched
                // pre-run state, measure the baseline twice (decider +
                // secondary + neighbors), and capture pre-run delivered radii.
                const preDelivered = await stepBaseline(dk, report, name);
                witnessFrame("pre-run", null, preDelivered, witnessSubs, name, report, dk);
                // DIAG-00 (ruled 2026-11-01, Jason): the pre-run
                // painted-geometry snapshot of the saved layout —
                // taken here, after the baseline step (which only
                // measures and takes the untouched snapshot) and
                // before any phase commits: the DOM still holds the
                // pre-run full paint. Read-only; gated on the
                // shell's diagnostics option (opts.diag00).
                if (opts && opts.diag00) { try { diag00Capture(preDelivered, name, tax, report); } catch (e) {} }
                // E6 phase-boundary yield: a double requestAnimationFrame
                // (with a timeout fallback) so busy / readout state set
                // before a phase can paint before the phase's synchronous
                // solve blocks the main thread.
                // One phase = exactly one applyPhase commit. The
                // record is assembled from the phase's own log slice:
                // requested ratios from the phase entry's validated
                // ratios (restricted to this branch's keys), delivered
                // ratios from delivered radii vs the pre-run radii,
                // and every other log entry the phase produced as its
                // limiter hits.
                // Q2 per-phase gate state: the cloud metric the
                // previous phase delivered (the run baseline, for
                // the first phase). After each phase commits, its
                // cloud is compared against this value; a regression
                // beyond tolerance stops the cascade (see the gate
                // at the end of runPhase) instead of carrying a
                // tangle through the remaining phases. The metric is
                // record.cloud — Q4 repointed that readout to the
                // own-cloud crossing number, not this gate: the
                // comparison and its tolerance below are unchanged
                // and now operate on crossing values.
                prevPhaseCloud = Number.isFinite(report.baseline.first) ? report.baseline.first : null;
                // BACK-UP-A-STEP (ruled 2026-10-28, all phases): the
                // cascade retains the last-kept phase snapshot
                // throughout the run — the layout state and this
                // branch's fit registrations as they stood right after
                // the most recent KEPT phase commit (the throw commit
                // counts as a kept state). A per-phase gate trip
                // restores it, discards the tripping step, and stops
                // that level's ladder; earlier kept steps stand and
                // the run continues to the next level from the
                // backed-up state. The pre-run snapshot is the
                // fallback only when no phase has committed yet, and
                // stays the final gate's whole-run restore.
                lastKeptSnapshot = null; lastKeptFit = null;

                // F4: the shared phase-commit step every cascade phase
                // runs through — one applyPhase commit, its record,
                // and the per-phase gate (tolerance SX_SCORE.GATE_TOL,
                // flat 2). The onset margin and the fine-tune margin
                // are deleted.
                mark = dkLog.length;
                // F4 STEP 3 — throw: one commit arming the full cascade at the
                // thrown lengths (factors: SX_SCORE.THROW_*).
                // FINE-TUNE SKIP-THROW DECISION (ruled 2026-10-29,
                // rulings adopted 09:42-09:43): judged HERE — after
                // the baseline step, before the throw — on the
                // CASCADE baseline (report.baseline.first, measured
                // twice in stepBaseline with its variance reported),
                // never on the shell pre-flight's single measure
                // (that measure acts only on exactly zero and is not
                // the fine-tune measure). Baseline STRICTLY below
                // SX_SCORE.FINE_TUNE_BELOW — zero included — takes
                // the skip path; exactly 5 or more throws as before.
                // On the skip path there is no thrown baseline.
                // The fine-tune margin is deleted; FINE_TUNE_BELOW
                // only chooses skip-throw versus throw.
                const fineTuneActive = Number.isFinite(report.baseline.first) && report.baseline.first < SX_SCORE.FINE_TUNE_BELOW;
                report.fineTune = { active: fineTuneActive, baseline: report.baseline.first, below: SX_SCORE.FINE_TUNE_BELOW, margin: null, armPhase: null, holds: [], branchFloor: null };
                fineTuneActive && dkLog.push({ type: "fine-tune-skip-throw", branch: name, baseline: report.baseline.first, below: SX_SCORE.FINE_TUNE_BELOW });
                // FINE-TUNE STAGING-AND-ARMING COMMIT (skip path,
                // ruling 6 — full arming mirroring the throw minus
                // length changes): the throw commit is what normally
                // writes the staged precondition values and arms the
                // full cascade (all four arm maps true, overwriting
                // inherited explicit-false vetoes, restored later
                // from the snapshot). A skip path that never throws
                // must still land that exact staging and arming as
                // its own kept commit, or the shrink solve would run
                // under the wrong choreography and its shrink moves
                // would be filtered out in Grow-only mode. This
                // commit changes NO length override: branch,
                // subcategory and kink lengths stay at their pre-run
                // values, and the shrink ladders below do the moving.
                // THROW-BRACKET (diagnostic, 2026-11-01 23:57 CST):
                // the bracket points wrap the run's throw sequence
                // (the first throw plus any THROW REPEAT re-throws,
                // ruled 2026-11-06), on the throw path only — a skip-throw
                // (fine-tune) run has no throw to bracket. With
                // opts.throwBracket absent/false neither point runs:
                // no bracket paint, snapshot, pause or log line, and
                // stepThrow runs exactly as before.
                if (!fineTuneActive && opts && opts.throwBracket) { try { await throwBracketPoint("THROW-BEFORE", throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
                fineTuneActive ? await stepFineTuneArm(snapshot, staged, name, tax, runPhase, report, opts, dk, preDelivered, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP) : await stepThrowRepeated(name, preDelivered, tax, report, staged, runPhase, opts, dk, diagCaptureFields, witnessTrippingLabel, WITNESS_EPS, WITNESS_ONE_STEP);
                if (!fineTuneActive && opts && opts.throwBracket) { try { await throwBracketPoint("THROW-AFTER", throwBracketFullPaint, throwBracketSnapshot, opts, name, dkPaintedNodeCentre, tax, report); } catch (e) {} }
                // WITNESS: on the skip-throw path there is no thrown
                // frame; gains are measured from the standing
                // (fine-tune-arm / pre-run) frame instead.
                witnessThrown || (witnessThrown = witnessLastFrame ? witnessLastFrame.subs : null);
                // F4 STEP 4 — onset setup still records the thrown-state
                // baseline (pre-run baseline on the skip path). Phase 4
                // (2026-11-04): no hold threshold. The onset margin and
                // the fine-tune margin are deleted. The per-phase gate
                // (flat GATE_TOL 2) is the only stop.
                const onsetCheck = stepOnsetSetup(name, fineTuneActive, report);
                // F4 STEP 5 — shrink ladders: subcategory level first, then the
                // branch level. The per-phase gate inside runPhase is the
                // only stop; the onset and fine-tune margins are deleted.
                // EXPLANATION STEP THREE IS COMMENTED OUT (ruled
                // 2026-10-31, Jason): the explanation's step three
                // — a separate geometric step-down stage — and its
                // step four — the shrink — were duplicating each
                // other. There is no separate step-down stage in
                // this cascade and none runs: the
                // step-down IS this shrink stage (these ladders,
                // their square-root-step staging and the per-phase gate),
                // one step-down/shrink stage, not two.
                const shrinkOutcome = await stepShrinkLadders(name, report, dk, fineTuneActive, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, opts, tax, diagCaptureFields, onsetCheck);
                // TERMINATION (ruled 2026-10-28, Jason 23:43, scope
                // confirmed 23:49): when the CATEGORY (branch) shrink
                // ladder backed out, the run ENDS here. Growth
                // (branch, then subcategories), the final patch and
                // the final gate do NOT run; the backed-out
                // (last-kept snapshot) state stands exactly as
                // runPhase restored it, and no final-gate revert
                // check judges it. The report closes the run out on
                // the backed-out state's own measurements — finalCloud
                // / delta (decider) and the secondary area, measured
                // on the state that stands — under its own gate value
                // ("ended-at-category-backout", neither the final
                // gate's "kept" nor its "reverted") with the early
                // end stated plainly in the reason, so the receipt
                // never presents this outcome as a final-gate result.
                // The block then runs the DISARM cleanup (ruled
                // 2026-10-29): the temporary staging the final patch
                // would have taken down is restored there instead —
                // see DISARM ON EARLY END inside the block. The run
                // still ends here; the disarm is not the final patch,
                // runs no phase and no gate, and changes no
                // backed-out length.
                // A subcategory back-out does not reach this block
                // (stepShrinkLadders reports only branch-ladder gate
                // trips), and a run with no category back-out takes
                // the unchanged full cascade below.
                const endedAtCategoryBackout = !!(shrinkOutcome && shrinkOutcome.branchBackedOut);
                // GATE-REJECTED END (ruled 2026-11-01, Jason): the
                // back-out confirmation gate was REJECTED at the trip
                // above, so nothing was reverted — the tripped trial
                // geometry stands. The run still ends here (no growth,
                // no final patch, no final gate), but the disarm
                // restore below is SKIPPED on this ending: a restore
                // re-solves, and the rejected ending must leave the
                // tripped geometry exactly as it stood on screen. The
                // rejection, its gate code and both crossings are
                // recorded on the report (report.backoutGate, set at
                // the trip) and in this reason for the receipt.
                const gateRejectedEnd = !!(shrinkOutcome && shrinkOutcome.gateRejected);
                if (endedAtCategoryBackout) {
                    report.endedEarly = { at: gateRejectedEnd ? "category-shrink-backout-gate-rejected" : "category-shrink-backout", phase: report.phaseGate && report.phaseGate.phase ? report.phaseGate.phase : null, gateRejected: gateRejectedEnd };
                    report.gate = "ended-at-category-backout", report.reason = gateRejectedEnd ? "category shrink back-out REJECTED at gate [" + (report.backoutGate ? report.backoutGate.code : "ANNEAL-BO-01") + "] at " + (report.endedEarly.phase || "fit-branch") + " — crossing " + (report.backoutGate ? Math.round(100 * report.backoutGate.crossingBefore) / 100 : null) + " → " + (report.backoutGate ? Math.round(100 * report.backoutGate.crossingAfter) / 100 : null) + " (tripped); tripped trial geometry left standing, nothing reverted — run ended there; growth, the final patch and the final gate did not run" : "category shrink backed out at " + (report.endedEarly.phase || "fit-branch") + " — run ended there; growth, the final patch and the final gate did not run";
                    dkLog.push({ type: "run-ended-early", at: report.endedEarly.at, phase: report.endedEarly.phase, gateRejected: gateRejectedEnd });
                    try { report.finalCloud = await dk.measureCloud(name); } catch (e) { report.finalCloud = report.phaseGate && null != report.phaseGate.restoredCloud ? report.phaseGate.restoredCloud : prevPhaseCloud; }
                    // STAGED SCORING: finalCloud is measured after
                    // the shrink-stage switch (neighbour-inclusive
                    // composition) while baseline.first is the
                    // run-start (own-cloud-only) value the receipt
                    // displays as the run's start — report.delta is
                    // the displayed pair's difference (final minus
                    // displayed start, one composition story per
                    // receipt line). The GATE's own judged change is
                    // recorded separately as gateDelta against
                    // gateBaseline, the neighbour-inclusive baseline
                    // captured on the pre-run geometry.
                    report.gateBaseline = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.baseline.adjacentFirst : report.baseline.first;
                    report.delta = null != report.finalCloud && null != report.baseline.first ? report.finalCloud - report.baseline.first : null, report.gateDelta = null != report.finalCloud ? report.finalCloud - report.gateBaseline : null;
                    try {
                        const allFinE = await dk.measureCloudsAll(), nfE = {};
                        Object.keys(allFinE).forEach(k => {
                            k !== name && (nfE[k] = allFinE[k]);
                        }), report.neighbors.final = nfE;
                    } catch (e) {}
                    // Bake gate (M4): dkBakeGate above, the single
                    // computation shared by both run endings.
                    dkBakeGate(report);
                    report.plateau = { metric: "crossingnumber", finalCrossing: report.finalCloud, copyFired: 0 === report.finalCloud };
                    report.fitDeviationTotal = tallyFitDev(report);
                    // DISARM ON EARLY END (ruled 2026-10-29, Jason
                    // 02:08): the final patch does not run on this
                    // path, so the cleanup it normally performs —
                    // taking the cascade's temporary staging down —
                    // runs HERE, after the backed-out state's
                    // measurements above are taken, as a plain
                    // restore, NOT as a phase: no "final" phase
                    // record, no runPhase commit, no gate. The
                    // concrete armed/staged state it clears, all of
                    // it written by the throw commit and the shrink
                    // ladders and left standing by restoreKept when
                    // the branch ladder backed out: (1) the two
                    // spoke auto-shrink arm maps at the keys the throw
                    // armed — branchSpokeAutoShrink[name], and for
                    // every subcategory label of this branch
                    // subcatSpokeAutoShrink[label], all set true by
                    // the throw, overwriting any pre-run explicit
                    // false veto; (2) the staged precondition values
                    // (the collision / staggerDensity / expandAll
                    // entries recorded in `staged`, applied by the
                    // throw commit); (3) this branch's fit-target
                    // registrations in dkFitRegistry (armed by
                    // armFitForBranch, retargeted per ladder stage,
                    // and restored with the kept layout by
                    // restoreKept; the final patch clears them via
                    // clearBranchFit before its commit and the
                    // gate-revert catch clears them too — only this
                    // early-end path left them armed). The disarm
                    // patch is the CURRENT (backed-out) state with
                    // only (1) and (2) overwritten from the pre-run
                    // snapshot — an arm key the snapshot lacks is
                    // deleted, exactly restoring its absence — so
                    // every length override (branch / subcat /
                    // kink) and every other field stands exactly as
                    // backed out. (3) is NOT cleared before the
                    // restore (DISARM FIX, ruled 2026-11-01, Jason):
                    // the compact kept shape lives in those fit
                    // targets — an unarmed re-solve starts every
                    // subcategory at the branch base radius and the
                    // locked "grow" collision never pulls it back
                    // down, so clearing first handed the closing
                    // paint the thrown lengths instead of the kept
                    // ones. The kept registrations (lastKeptFit, the
                    // pair restoreKept re-arms) are re-armed before
                    // the restore, so its solve runs armed and
                    // reproduces the backed-out geometry; (3) is
                    // then cleared AFTER the restore, so the post-run
                    // state this cleanup leaves is exactly as
                    // disarmed as before. A disarm failure is
                    // recorded on the report and never thrown: the
                    // early end and its backed-out state stand
                    // regardless.
                    if (gateRejectedEnd) {
                        report.disarm = { skipped: "backout-gate-rejected — tripped geometry left exactly as it stood" }, dkLog.push({ type: "run-disarm-skipped", at: "category-shrink-backout-gate-rejected" });
                    } else try {
                        const disarmPatch = dk.snapshot(), disarmLensBefore = dk.canonical({ branchOverrides: disarmPatch.branchOverrides, subcatOverrides: disarmPatch.subcatOverrides, kinkOverrides: disarmPatch.kinkOverrides }), restoreArmKey = (patchMap, snapMap, key) => {
                            if (!patchMap) return;
                            null != snapMap && Object.prototype.hasOwnProperty.call(snapMap, key) ? patchMap[key] = snapMap[key] : delete patchMap[key];
                        };
                        restoreArmKey(disarmPatch.branchSpokeAutoShrink, snapshot.branchSpokeAutoShrink, name), tax.subLabels.forEach(l => {
                            restoreArmKey(disarmPatch.subcatSpokeAutoShrink, snapshot.subcatSpokeAutoShrink, l);
                        }), staged.forEach(s => {
                            disarmPatch[s.key] = snapshot[s.key];
                        });
                        const fitKeysBeforeDisarm = Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name);
                        // DISARM FIX (see the block comment above):
                        // re-arm the kept fit registrations before
                        // the restore so its solve runs armed, then
                        // clear them after it — clearing a target
                        // solves nothing itself, so the armed solve's
                        // delivered geometry stands into the closing
                        // paint's capture while the post-run fit
                        // state is still fully cleared. With no kept
                        // fit on record, fall back to the original
                        // unarmed order.
                        if (lastKeptFit) {
                            clearBranchFit(dk, name);
                            Object.keys(lastKeptFit).forEach(k => dk.setFitTarget(k, lastKeptFit[k]));
                        } else clearBranchFit(dk, name);
                        dk.restore(disarmPatch), clearBranchFit(dk, name);
                        const disarmStateAfter = api.get(), fitKeysAfterDisarm = Object.keys(dk.fitTargets()).filter(k => "revision" !== k && k.split("|")[1] === name);
                        report.disarm = { armsRestored: [ "branchSpokeAutoShrink", "subcatSpokeAutoShrink" ], preconditionsRestored: staged.map(s => s.key), fitTargetsCleared: fitKeysBeforeDisarm.length, fitTargetsArmedForSolve: lastKeptFit ? Object.keys(lastKeptFit).length : 0, fitTargetsRemaining: fitKeysAfterDisarm.length, lengthsUnchanged: dk.canonical({ branchOverrides: disarmStateAfter.branchOverrides, subcatOverrides: disarmStateAfter.subcatOverrides, kinkOverrides: disarmStateAfter.kinkOverrides }) === disarmLensBefore };
                        dkLog.push({ type: "run-disarm", at: "category-shrink-backout", fitTargetsCleared: fitKeysBeforeDisarm.length, fitTargetsArmedForSolve: report.disarm.fitTargetsArmedForSolve, fitTargetsRemaining: fitKeysAfterDisarm.length, preconditionsRestored: report.disarm.preconditionsRestored.slice(), lengthsUnchanged: report.disarm.lengthsUnchanged });
                        witnessRestore("disarm-restored", "category-shrink-backout", witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                    } catch (disarmErr) {
                        report.disarm = { error: String(disarmErr && disarmErr.message || disarmErr) }, dkLog.push({ type: "run-disarm-error", at: "category-shrink-backout", message: report.disarm.error });
                    }
                }
                // F4 STEP 5b — growth: scoped same-branch growth
                // (ruled 2026-10-28), after the shrink ladders and
                // before the final patch. Growth arrives ONLY as
                // cascade ratio patches through runPhase — the
                // relaxation engines still never grow and the
                // repulsion descent's grow flag stays off. A cloud
                // grows only when same-branch pairs contribute more
                // than half its standing E: standing E is the
                // cascade's own crossing readout, excluded E is the
                // same readout under the existing same-branch
                // exclusion flag, and the difference is the
                // same-branch contribution. Levels run outermost
                // first (branch, then subcategories); there is no
                // kink growth — growing kink leaves never reduces
                // collisions. Each level climbs the cumulative
                // ladder (step factor per step, at most the ruled
                // max steps, the step that would pass the cap
                // clipped to exactly the cap), every step gated by
                // the shared per-phase gate with back-up-a-step on
                // a trip. Lengths also respect the phase validator's
                // hard cap against the baked bases: a step whose
                // lengths can no longer advance under that cap
                // stops its level instead of being rejected.
                // Skipped when the run ended at the category shrink
                // back-out above (see TERMINATION at stepShrinkLadders).
                // STEP FIVE COMMENTED OUT (ruled 2026-10-31, Jason):
                // explanation step five — "Fit and growth" — is
                // out. The growth phase no longer runs in the
                // cascade. The stepGrowth definition above is kept
                // in the code, not deleted, and its invocation is
                // commented out, not removed:
                // if (!endedAtCategoryBackout) await stepGrowth();
                // F4 STEP 6 — final patch: build the kept state on the pre-run
                // snapshot, carry held lengths through, commit as the 'final'
                // phase, then take the final measurements for the gate.
                // Both the final patch and the final gate are
                // skipped when the run ended at the category shrink
                // back-out above (see TERMINATION at
                // stepShrinkLadders): the backed-out state stands
                // unjudged by the gate and is never reverted here.
                if (!endedAtCategoryBackout) {
                await stepFinalPatch(dk, name, opts, report, tax, runPhase, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP, preDelivered, diagCaptureFields, witnessTrippingLabel);
                // (7) GATE: exact-float improve-or-hold on the
                // branch's own-cloud CROSSING NUMBER (Q4 decider —
                // baseline.first / finalCloud carry crossing values
                // via the repointed readout; the xAreaCross area is
                // reported secondary above and never gates). A kept
                // run must also
                // provably differ from the pre-run snapshot — a
                // "kept" run whose final state is the snapshot kept
                // nothing.
                // STAGED SCORING (ruled 2026-11-02, Jason): the final
                // gate is the same judge as the descent — it judges the
                // shrink-stage composition, so its baseline is the
                // adjacent-composition value captured on the pre-run
                // geometry in stepBaseline (baseline.adjacentFirst),
                // falling back to baseline.first only when that capture
                // was unavailable.
                const gateBaseline = null != report.baseline.adjacentFirst && Number.isFinite(report.baseline.adjacentFirst) ? report.baseline.adjacentFirst : report.baseline.first;
                report.gateBaseline = gateBaseline;
                if (!dk.gate(gateBaseline, report.finalCloud)) throw new Error("gate failed: final cloud " + report.finalCloud + " exceeds baseline " + gateBaseline);
                if (dk.canonical(api.get()) === dk.canonical(snapshot)) throw new Error("kept-state verification failed: final state is identical to the pre-run snapshot");
                report.finalDiffers = !0, report.gate = "kept";
                }
            } catch (e) {
                report.fitDeviationTotal = tallyFitDev(report), report.gate = "reverted", report.reason = String(e && e.message || e);
                // Q1: a budget abort or a user cancel is named as
                // such on the report — phase and the phase's
                // iteration count ride along for the receipt.
                if (e && (e.dkBudget || e.dkCancelled)) report.aborted = { kind: e.dkBudget ? "budget" : "cancel", phase: e.phase != null ? String(e.phase) : null, iterations: e.iterations || 0 };
                try {
                    clearBranchFit(dk, name), snapshot && (dk.restore(snapshot), report.restoreVerified = dk.canonical(api.get()) === dk.canonical(snapshot));
                    snapshot && witnessRestore("whole-run-revert-restored", null, witnessSubs, name, report, witnessJudge, witnessTrippingLabel, dk, witnessThrown, WITNESS_EPS, WITNESS_ONE_STEP);
                } catch (re) {
                    report.restoreError = String(re && re.message || re);
                }
            } finally {
                const wEv = report.witness.events.find(e => e.wholesaleDiscard);
                report.witness.verdict = wEv ? "proven" : report.witness.events.length ? "ruled-out" : "no-backout-observed", report.witness.culprit = wEv ? { event: wEv.event, phase: wEv.phase, subcats: wEv.wholesale.map(w => w.label) } : null, dkLog.push({ type: "witness-verdict", verdict: report.witness.verdict, culprit: report.witness.culprit, events: report.witness.events.length, frames: report.witness.frames.length });
                sxAnnealStageCtx = null, dk.end(), dkLog.push({ type: "run-report", report: report });
                // CAPSULE-ONLY INTERIM PAINT (ruled 2026-10-31,
                // Jason): every commit above painted only the
                // approximation (see Mr) — paint the full map ONCE
                // here, at the run's end state: kept, ended-early,
                // or reverted alike (on a revert the catch above
                // has already restored the pre-run snapshot, so
                // this paints the state that actually stands).
                // The context is closed first, so this paint is
                // the run's terminal paint, settle search included.
                // ONE CLOSING REPAINT (ruled 2026-11-01, Jason —
                // supersedes the split closing paint this block
                // carried: a freeze-replay paint for the category
                // back-out ending and the ordinary paint for kept
                // and reverted endings): there is exactly ONE
                // closing repaint here, regardless of how the run
                // gets here — kept, ended-early (category back-out
                // included), reverted, aborted or cancelled alike —
                // and it paints the state that stands. The painted
                // witness named the ordinary closing re-solve as
                // the operation that re-derived larger painted
                // segments than the cascade delivered (Impact,
                // fit-branch-13: painted segments many times past
                // one step beyond the last kept delivered segments
                // while the bookkeeping witness held), so the one
                // repaint is the freeze-replay paint in the settle
                // guard's own pattern (sgRestorePaint) for EVERY
                // ending: every branch frozen, nothing recomputed,
                // each node seated at its delivered centre, and the
                // frozen capture replaying the delivered solve the
                // cascade just stood at — on a revert the catch
                // above has already restored the pre-run snapshot
                // and re-solved to it, so the replay carries that
                // restored state, not the discarded run. The mode
                // is chosen BEFORE any paint runs: only when the
                // freeze capture itself is unavailable (no
                // delivered branches or centres to replay) does
                // the one repaint run as the ordinary paint — a
                // paint that has run is never followed by a second
                // closing repaint, on any ending, for any failure.
                // The repaint is terminal: any blit session left
                // over from the run's scoped interim paints is
                // ended BEFORE it (so the paint-top gate's
                // same-frozen-set path can never carry a session
                // through it), blit session starts are held off
                // for its duration (sgHoldBlitStart, exactly as
                // sgRestorePaint holds them — an all-frozen paint
                // otherwise starts a session whose swap vaults the
                // whole map behind a raster and arms a settle
                // timer nobody is left to land), and any session
                // that nevertheless stands after it is ended
                // before the witnesses below read the painted map.
                let closingPaintMode = "ordinary", closingPaintResult = null;
                try {
                    const allNames = new Set(h.map(b => b.name)), cap = scCaptureFrozen(allNames), centres = scCaptureDeliveredCenters(allNames, { paintComposition: !0 });
                    diagCaptureFields = centres && centres.captureFields ? centres.captureFields : null;
                    if (cap && cap.branches && cap.branches.size && centres && centres.size) closingPaintMode = "freeze-replay", scCtx = { targetBranches: new Set, ringBranches: new Set, recomputeBranches: new Set, frozenBranches: allNames, boundaryLog: [], dropped: { optimiser: 0, relief: 0, clamp: 0 }, fallback: null, policy: "contained", opClass: "anneal-closing-paint", reliefPass: 0, r6Abort: !1, capture: cap, centers: centres };
                } catch (e) { __sxErrLog("layout-anneal-closing-paint-carry", e), scCtx = null, closingPaintMode = "ordinary"; }
                try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-anneal-closing-paint-blit-end", e); }
                if ("freeze-replay" === closingPaintMode) sgHoldBlitStart = !0;
                try {
                    closingPaintResult = Mr({
                        animate: !1,
                        forceRepaint: !0
                    });
                } catch (e) { __sxErrLog("layout-anneal-final-paint", e); } finally {
                    scCtx = null, sgHoldBlitStart = !1;
                }
                // A chunked closing paint completes across frames:
                // wait for it (raced against the same 900 ms bound
                // the painted witness below uses, so a throttled
                // frame can never hang the receipt) before anything
                // is read from — or cleared off — the painted map.
                try {
                    if (closingPaintResult && "function" == typeof closingPaintResult.then) await Promise.race([ closingPaintResult, new Promise(r => setTimeout(r, 900)) ]);
                    else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                } catch (e) {}
                try { blitSess && blitEndSession(); } catch (e) { __sxErrLog("layout-anneal-closing-paint-blit-end", e); }
                dkLog.push({ type: "closing-paint", branch: name, mode: closingPaintMode, gate: report.gate, endedEarly: !!report.endedEarly, opClass: "anneal-closing-paint" });
                // CAPSULE WIPE GATED ON FULL-PAINT COMPLETION
                // (Fix 2, ruled 2026-11-01, Jason): the interim
                // capsule layer's published live-number anchor is
                // cleared only HERE — after the one closing repaint
                // above has landed — never before it. Clearing it
                // ahead of the paint (as this block used to) wiped
                // the approximation state while the full paint was
                // still in flight, queued or failed, and the map
                // layer could be left empty: no capsule, no full
                // paint. The capsule DOM layer itself is gated the
                // same way inside Ar (see sxCapsuleKeep there): it
                // survives the paint's opening clear and is removed
                // only by the install that lands the full paint.
                window.__sxInterimAnchor = null;
                // ANNEAL-DIAG-03: the closing full paint has landed
                // (paint promise awaited above); pause here, before
                // settle / before the run ends, on the gate Accept
                // path only - diagPause no-ops on every other ending.
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01):
                // hand DIAG-03 the closing-paint traces that decide
                // between the two closing-paint paths - the mode this
                // finally block already chose (closingPaintMode), and
                // the scoped-paint counts / segment-timing presence
                // from the dkLog entries THIS paint pushed (the
                // entries after this run's run-report entry, which
                // was pushed immediately before the paint) - so the
                // expanded readout, the console diag object and the
                // receipt carry them without console digging.
                // Read-only: the scan only reads dkLog; it adds no
                // paint, capture, or fit call, and changes neither
                // the mode choice nor the paint.
                let diagClosing = null;
                try {
                    diagClosing = { mode: closingPaintMode, scopedPaint: null, segmentTiming: !1 };
                    let rr = -1;
                    for (let i = dkLog.length - 1; i >= 0; i--) if (dkLog[i] && "run-report" === dkLog[i].type) { rr = i; break; }
                    for (let i = dkLog.length - 1; i > rr; i--) {
                        const e = dkLog[i];
                        if (!e) continue;
                        if (!diagClosing.scopedPaint && "scoped-paint" === e.type) diagClosing.scopedPaint = { retained: e.retained, captured: e.captured, diverged: e.diverged };
                        if (!diagClosing.segmentTiming && "segment-timing" === e.type) diagClosing.segmentTiming = !0;
                        if (diagClosing.scopedPaint && diagClosing.segmentTiming) break;
                    }
                } catch (e) { diagClosing = { mode: closingPaintMode, scopedPaint: null, segmentTiming: !1 }; }
                await diagPause("ANNEAL-DIAG-03", "closing full paint \u2192 settle", diagClosing, diagAcceptCtx, opts, diagSnapshot, report, name, tax, diagCaptureFields);
                // FINAL-STEP WITNESS (extension): the frame the
                // back-out judge could never take — every
                // subcategory's delivered radius and override as
                // they stand AFTER the closing full paint above,
                // the state the user actually sees when the run
                // ends. Both final-step transitions are judged
                // here (the final patch commit, bracketed in
                // stepFinalPatch; and the closing sequence —
                // context close plus this paint, settle search
                // included — against the last frame taken before
                // it), and the record names the operation this
                // run's final step actually was, on endings that
                // never reach the final patch as well. The record
                // lands on the report after the run-report log
                // entry above; the entry holds this same report
                // object by reference, and the receipt is built
                // from the returned report, so both carry it.
                // Observational only, and guarded: a failure here
                // is recorded as not-observed and never disturbs
                // the run's ending.
                try {
                    const fsOperation = witnessFinalOperation ? witnessFinalOperation + ("reverted" === report.gate ? ", then the whole-run revert to the pre-run snapshot" : "") + ", then the closing full paint" : report.backoutGate && "rejected" === report.backoutGate.decision ? "category shrink back-out gate-rejected ending (tripped trial geometry left standing; disarm, the final patch and the final gate did not run), then the closing full paint" : report.endedEarly ? "category shrink back-out ending (disarm restore; the final patch and final gate did not run), then the closing full paint" : "reverted" === report.gate ? "whole-run revert to the pre-run snapshot, then the closing full paint" : "closing full paint (no final patch ran)";
                    const fsBeforePaint = witnessFinalAfter || witnessLastFrame, fsAfterPaint = witnessFrame("final-step-after-paint", witnessFinalOperation ? "final" : null, null, witnessSubs, name, report, dk);
                    const fsTCommit = witnessFinalBefore && witnessFinalAfter ? witnessFinalJudge("final-patch-commit", witnessFinalBefore, witnessFinalAfter, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null, fsTPaint = fsBeforePaint ? witnessFinalJudge("closing-full-paint", fsBeforePaint, fsAfterPaint, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const fsTransitions = [ fsTCommit, fsTPaint ].filter(Boolean), fsCulpritT = fsTransitions.find(t => t.wholesale) || null, fsMovedT = fsTransitions.find(t => t.flung.length) || null;
                    report.witness.finalStep = {
                        operation: fsOperation,
                        finalPhaseTripped: witnessFinalTripped,
                        frames: { lastKept: witnessFinalLastKept, before: witnessFinalBefore, after: witnessFinalAfter, afterPaint: fsAfterPaint },
                        transitions: fsTransitions,
                        verdict: fsCulpritT ? "proven" : fsMovedT ? "moved-not-wholesale" : fsTransitions.length ? "held" : "not-observed",
                        culprit: fsCulpritT ? { transition: fsCulpritT.transition, subcats: fsCulpritT.flung.map(f => f.label) } : null
                    };
                    dkLog.push({ type: "witness-final-step", operation: fsOperation, verdict: report.witness.finalStep.verdict, culprit: report.witness.finalStep.culprit, transitions: fsTransitions.map(t => ({ transition: t.transition, wholesale: t.wholesale, flung: t.flung.map(f => f.label) })) });
                } catch (fsErr) {
                    report.witness.finalStep = { operation: witnessFinalOperation || null, finalPhaseTripped: witnessFinalTripped, frames: { lastKept: witnessFinalLastKept, before: witnessFinalBefore, after: witnessFinalAfter, afterPaint: null }, transitions: [], verdict: "not-observed", culprit: null, error: String(fsErr && fsErr.message || fsErr) };
                }
                // PAINTED-GEOMETRY WITNESS EXTENSION (the extended
                // frame): the painted capture pair spanning the
                // closing full paint, plus the settle frame one
                // visual frame further. The after-paint capture
                // reads the painted SVG as the closing paint left
                // it; then the run waits for the next animation
                // frame / settle — a chunked closing paint's
                // in-flight promise first (raced against a bound so
                // a throttled frame can never hang the receipt),
                // then a double requestAnimationFrame with a timer
                // fallback (the house yield pattern) — and captures
                // painted geometry AGAIN. Any of the three numbers
                // (branch radius / segment / absolute radius) that
                // moves past one step across the settle transition
                // is named against the post-paint settle operation;
                // any that moves across the closing paint is named
                // against the closing full paint (settle search and
                // stem finalisation included). The divergence flag
                // compares the painted segment at settle against
                // the bookkeeping delivered radius the existing
                // witness recorded after the same paint: painted
                // past one step beyond bookkeeping is the
                // measurement divergence Jason's report describes,
                // and with this extension the witness reads the
                // painted value, so the receipt reports the fling
                // instead of holding against it. Guarded exactly
                // like the final-step record above: a failure is
                // recorded as not-observed and never disturbs the
                // run's ending. Additive only — report.witness
                // .finalStep and every existing line stand as they
                // were.
                try {
                    const pwOperation = report.witness.finalStep && report.witness.finalStep.operation ? report.witness.finalStep.operation : "closing full paint";
                    witnessPaintedAfterPaint = witnessPaintedFrame("after-closing-paint", pwOperation, dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                    try {
                        const pwPaintP = typeof sxPaintPromise !== "undefined" ? sxPaintPromise : null;
                        if (pwPaintP && "function" == typeof pwPaintP.then) await Promise.race([ pwPaintP, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    await new Promise(r => { let done = !1; const fin = () => { if (!done) { done = !0; r(); } }; try { requestAnimationFrame(() => requestAnimationFrame(fin)); } catch (e) {} setTimeout(fin, 120); });
                    witnessPaintedAfterSettle = witnessPaintedFrame("after-settle", "post-paint settle (next animation frame / layout transition / chunked-paint completion after the closing full paint)", dkPaintedGeometry, name, dkPaintedNodeCentre, tax, dkPaintedStemSeg);
                    const pwTCommit = witnessPaintedBefore && witnessPaintedAfter ? witnessPaintedJudge("final-patch-commit", witnessFinalOperation || "final patch commit", witnessPaintedBefore, witnessPaintedAfter, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwPrePaint = witnessPaintedAfter || witnessPaintedLastKept;
                    const pwTPaint = pwPrePaint && witnessPaintedAfterPaint ? witnessPaintedJudge("closing-full-paint", pwOperation, pwPrePaint, witnessPaintedAfterPaint, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwTSettle = witnessPaintedAfterPaint && witnessPaintedAfterSettle ? witnessPaintedJudge("post-paint-settle", "post-paint settle (next animation frame / layout transition / chunked-paint completion after the closing full paint)", witnessPaintedAfterPaint, witnessPaintedAfterSettle, witnessThrown, WITNESS_ONE_STEP, WITNESS_EPS) : null;
                    const pwTransitions = [ pwTCommit, pwTPaint, pwTSettle ].filter(Boolean), pwCulpritT = pwTransitions.find(t => t.wholesale) || null, pwMovedT = pwTransitions.find(t => t.flung.length) || null;
                    let pwDivergence = !1;
                    try {
                        const bkFrame = report.witness.finalStep && report.witness.finalStep.frames ? report.witness.finalStep.frames.afterPaint : null;
                        if (bkFrame && witnessPaintedAfterSettle) Object.keys(witnessPaintedAfterSettle.subs).forEach(label => {
                            const bk = bkFrame.subs[label], pw = witnessPaintedAfterSettle.subs[label];
                            bk && pw && null != bk.d && null != pw.seg && bk.d > 0 && pw.seg > bk.d * WITNESS_ONE_STEP && (pwDivergence = !0);
                        });
                    } catch (e) {}
                    report.witness.painted = {
                        frames: { lastKept: witnessPaintedLastKept, before: witnessPaintedBefore, after: witnessPaintedAfter, afterPaint: witnessPaintedAfterPaint, afterSettle: witnessPaintedAfterSettle },
                        capturePair: { beforeClosingPaint: pwPrePaint ? pwPrePaint.stage : null, afterClosingPaint: witnessPaintedAfterPaint ? witnessPaintedAfterPaint.stage : null, afterSettle: witnessPaintedAfterSettle ? witnessPaintedAfterSettle.stage : null },
                        transitions: pwTransitions,
                        verdict: pwCulpritT ? "proven" : pwMovedT ? "moved-not-wholesale" : pwTransitions.length ? "held" : "not-observed",
                        culprit: pwCulpritT ? { transition: pwCulpritT.transition, operation: pwCulpritT.operation, subcats: pwCulpritT.flung.map(f => f.label + ":" + f.metric) } : null,
                        divergence: pwDivergence,
                        operation: pwOperation
                    };
                    dkLog.push({ type: "witness-painted-verdict", verdict: report.witness.painted.verdict, culprit: report.witness.painted.culprit, divergence: pwDivergence, capturePair: report.witness.painted.capturePair, transitions: pwTransitions.map(t => ({ transition: t.transition, operation: t.operation, wholesale: t.wholesale, flung: t.flung.map(f => f.label + ":" + f.metric) })) });
                } catch (pwErr) {
                    report.witness.painted = { frames: { lastKept: witnessPaintedLastKept, before: witnessPaintedBefore, after: witnessPaintedAfter, afterPaint: witnessPaintedAfterPaint, afterSettle: witnessPaintedAfterSettle }, capturePair: null, transitions: [], verdict: "not-observed", culprit: null, divergence: !1, operation: null, error: String(pwErr && pwErr.message || pwErr) };
                }
                // TAIL-END REFRESH (ruled 2026-11-02, Jason):
                // the run's own ending must leave the kept shape
                // standing on screen, with no manual repaint
                // needed. The closing full paint above installs
                // the kept geometry in the DOM — DIAG-03's
                // painted==stored capture on Jason's acceptance
                // drive proved that — yet his end frame still
                // showed the pre-run picture (the annealed cloud
                // standing at its pre-run seat, its overlay
                // number still the pre-run value) until a
                // centre-circle nudge repainted. Between the DOM
                // and the screen sit layers only a later ordinary
                // paint clears: a blit session's raster and vault
                // (in the default repulsion mode a session ends
                // only at a later paint's top gate), any interim
                // capsule remnant, and the separately positioned
                // metric overlay numbers, which re-seat only on
                // a paint. So end the run with ONE ordinary
                // (non-scoped) full repaint of the standing
                // state: its paint-top gate ends any blit session
                // and strips vault and raster, its DOM build
                // installs the standing state exactly as every
                // later user paint would draw it, and the shell's
                // settle watch then re-measures from the
                // repainted map. Display only: the solve state
                // is not written; no solver, throw, ladder, gate,
                // floor or stop-rule state is touched; and every
                // diagnostic capture above (DIAG-03, the
                // final-step and painted-geometry witnesses) is
                // already taken, so no diagnostic readout
                // changes. Guarded like the rest of this ending:
                // a failure is logged and never disturbs the
                // run's return.
                try {
                    const tailPaintResult = Mr({ animate: !1, forceRepaint: !0 });
                    try {
                        if (tailPaintResult && "function" == typeof tailPaintResult.then) await Promise.race([ tailPaintResult, new Promise(r => setTimeout(r, 900)) ]);
                        else if ("undefined" != typeof sxPaintPromise && sxPaintPromise && "function" == typeof sxPaintPromise.then) await Promise.race([ sxPaintPromise, new Promise(r => setTimeout(r, 900)) ]);
                    } catch (e) {}
                    try { blitSess && blitEndSession(); } catch (e) {}
                    dkLog.push({ type: "tail-end-refresh", branch: name, closingPaintMode: closingPaintMode });
                } catch (e) { __sxErrLog("layout-anneal-tail-end-refresh", e); }
                // MODE CAPTURE (diagnostic-only, ruled 2026-11-01):
                // the run is ending - DIAG-03's Continue was pressed
                // and the witness settle frames above have run - so
                // re-read the camera state once more and land it on
                // the report's diag lines as the after-Continue line,
                // beside the camera line DIAG-03 itself carried, so
                // the receipt compares the two camera states after
                // the run ends. Only on a run whose DIAG-03 actually
                // fired carrying closing-paint traces; read-only, and
                // session-only like every diag record (never written
                // into a saved layout or profile).
                try {
                    if (diagAcceptCtx && report.diag && report.diag.some(d => d && "ANNEAL-DIAG-03" === d.code && d.closingPaint)) {
                        const endCam = diagCamera(), endText = diagCameraText(endCam, "camera after Continue (run end)");
                        report.diag.push({ code: "ANNEAL-DIAG-03", label: "camera after Continue", branch: name, phase: diagAcceptCtx.phase, camera: endCam, closingLines: [ endText ], text: endText, atChicago: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) });
                        dkLog.push({ type: "anneal-diag", code: "ANNEAL-DIAG-03-END", phase: diagAcceptCtx.phase, branch: name, text: endText });
                        try { console.log("[ANNEAL-DIAG-03] " + endText, endCam); } catch (e) {}
                    }
                } catch (e) {}
            }
            return report;
        }
        h.forEach(e => {
            rn.add(e.name), un.set(catId(e.name), "all"), (e.subcategories || []).forEach(t => {
                const n = Un(e.name, t.name);
                un.set(n, "all"), mn.expandAll && on.add(n);
            }), e.topics.forEach(t => {
                const n = Wn(t);
                un.set(n, "all"), mn.expandAll && on.add(n);
            });
        });
        const fn = new Map;
        let yn = null, bn = 0, vn = null, wn = !1, kn = !0, xn = null, Sn = "all", $n = null, En = !1;
        const An = {
            compact: 12,
            roomy: 20,
            all: Number.POSITIVE_INFINITY
        };
        // Group C1 (Build 2026-10-16_1830): map detail levels. Compact/Medium cap how
        // many child topics an expanded category or subcategory branch shows, most
        // popular first; rated topics always show regardless of the cap.
        // Build 2026-10-17_1447: the map now OPENS in Medium — each expanded
        // branch shows its 7 most popular topics (popularity order, same
        // ordering as list view) instead of every topic. The Compact/Medium/
        // Full toggle in the map controls still lets the user show fewer or
        // more, and the level persists across profile/tab switches.
        // Build 2026-10-18_0343: the map now OPENS in Full — every topic in
        // each expanded branch shows by default; the toggle still lets the
        // user drop back to Medium or Compact.
        let mapDetailLevel = "full";
        const DETAIL_CAPS = {
            compact: 4,
            medium: 7,
            full: Number.POSITIVE_INFINITY
        };
        function topicRatedForDetail(e, t = Vi()) {
            const n = da(e, t);
            return Boolean(n && (n.giveKnown || n.receiveKnown));
        }
        window.__SEXCAPADES_SET_MAP_DETAIL = function(level) {
            if (!Object.prototype.hasOwnProperty.call(DETAIL_CAPS, level) || level === mapDetailLevel) return;
            try { window.SexcapadesEngine?.Map?.invalidateVault(); } catch (_) {}
            mapDetailLevel = level, document.querySelectorAll("[data-detail-level]").forEach(e => e.setAttribute("aria-pressed", String(e.dataset.detailLevel === level))),
            Mr({
                animate: !1,
                forceRepaint: !0
            });
        };
        const Cn = e.byId("mapSvg"), Mn = e.byId("mapScene"), In = e.byId("mapLayer"), Pn = e.byId("mapDefs"), Ln = e.byId("mapSafeFallback"), Tn = e.byId("mapSafeMessage"), Fn = e.byId("mapSafeOpen"), Nn = e.byId("mapSafeReset");
        let Dn = !1, Rn = !1, On = null, Bn = [], jn = !1;
        const qn = {};
        let sxStemFinaliseHook = null;
        function Hn(e) {
            return String(e == null ? "" : e).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        }
        
        function sxName(e) {
            return e && "object" == typeof e ? String(e.name || "") : String(e || "");
        }
        const LEGACY_NODE_IDS = Object.freeze({
    "cat-power-exchange": "c0001",
    "cat-bondage-restriction": "c0002",
    "cat-impact-pain-body-modification": "c0003",
    "cat-sensation-atmosphere": "c0004",
    "cat-roleplay-identity": "c0005",
    "cat-clothing-materials-objects": "c0006",
    "cat-body-focus-appearance": "c0007",
    "cat-psychological-dynamics": "c0008",
    "cat-watching-exposure-settings": "c0009",
    "cat-partner-configurations": "c0010",
    "cat-sex-acts": "c0011",
    "cat-positions": "c0012",
    "cat-orgasm-reproductive-play": "c0013",
    "cat-fluids-messy-play": "c0014",
    "cat-primal-pursuit": "c0015",
    "cat-service-ritual": "c0016",
    "cat-fantasy-transformation": "c0017",
    "cat-connection-aftercare": "c0018",
    "subcategory-bondage-restriction-flexible-ties": "s0001",
    "subcategory-bondage-restriction-restraints": "s0002",
    "subcategory-bondage-restriction-tape-wrapping": "s0003",
    "subcategory-bondage-restriction-sensory": "s0004",
    "subcategory-bondage-restriction-confinement": "s0005",
    "subcategory-bondage-restriction-challenge-bondage": "s0006",
    "subcategory-bondage-restriction-specialty": "s0007",
    "subcategory-impact-pain-body-modification-hand-spanking": "s0008",
    "subcategory-impact-pain-body-modification-flexible-implements": "s0009",
    "subcategory-impact-pain-body-modification-rigid-implements": "s0010",
    "subcategory-impact-pain-body-modification-clamps-pinching": "s0011",
    "subcategory-impact-pain-body-modification-cutting-piercing": "s0012",
    "subcategory-impact-pain-body-modification-genital-pain": "s0013",
    "subcategory-impact-pain-body-modification-extreme": "s0014",
    "subcategory-roleplay-identity-caregiver-little-roles": "s0015",
    "subcategory-roleplay-identity-authority": "s0016",
    "subcategory-roleplay-identity-captivity": "s0017",
    "subcategory-roleplay-identity-animal": "s0018",
    "subcategory-roleplay-identity-historical-fantasy": "s0019",
    "subcategory-clothing-materials-objects-materials": "s0020",
    "subcategory-clothing-materials-objects-footwear": "s0021",
    "subcategory-clothing-materials-objects-uniforms-costumes": "s0022",
    "subcategory-clothing-materials-objects-lingerie-hosiery": "s0023",
    "subcategory-clothing-materials-objects-undergarments": "s0024",
    "subcategory-clothing-materials-objects-masks-headwear": "s0025",
    "subcategory-clothing-materials-objects-objects-toys": "s0026",
    "subcategory-body-focus-appearance-head-hair": "s0027",
    "subcategory-body-focus-appearance-facial-body-hair": "s0028",
    "subcategory-body-focus-appearance-lower-body": "s0029",
    "subcategory-body-focus-appearance-torso": "s0030",
    "subcategory-body-focus-appearance-face": "s0031",
    "subcategory-body-focus-appearance-body-type": "s0032",
    "subcategory-body-focus-appearance-worship": "s0033",
    "subcategory-psychological-dynamics-humiliation": "s0034",
    "subcategory-psychological-dynamics-intimidation": "s0035",
    "subcategory-psychological-dynamics-mind-control": "s0036",
    "subcategory-psychological-dynamics-emotional": "s0037",
    "subcategory-psychological-dynamics-vulnerability": "s0038",
    "subcategory-psychological-dynamics-verbal": "s0039",
    "subcategory-sex-acts-oral": "s0040",
    "subcategory-sex-acts-anal": "s0041",
    "subcategory-sex-acts-manual": "s0042",
    "subcategory-sex-acts-insertion": "s0043",
    "subcategory-sex-acts-fluids": "s0044"
});
        function migrateNodeKey(id) {
            const s = String(id == null ? "" : id);
            return Object.prototype.hasOwnProperty.call(LEGACY_NODE_IDS, s) ? LEGACY_NODE_IDS[s] : s;
        }
        function isCatId(id) {
            if (id == null || id === "") return !1;
            const k = migrateNodeKey(id);
            return h.some(c => c.id === k);
        }
        function isSubId(id) {
            if (id == null || id === "") return !1;
            const k = migrateNodeKey(id);
            return h.some(c => (c.subcategories || []).some(s => s.id === k));
        }
        function nextLevelId(prefix, ids) {
            let max = 0;
            (ids || []).forEach(id => {
                const m = new RegExp("^" + prefix + "(\\d+)$").exec(String(id || ""));
                if (m) max = Math.max(max, Number(m[1]));
            });
            return prefix + String(max + 1).padStart(4, "0");
        }
        function nextCategoryId() {
            return nextLevelId("c", h.map(c => c.id));
        }
        function nextSubcategoryId() {
            const ids = [];
            h.forEach(c => (c.subcategories || []).forEach(s => ids.push(s.id)));
            return nextLevelId("s", ids);
        }
        function nextTopicId() {
            const ids = [];
            h.forEach(c => (c.topics || []).forEach(t => ids.push(t && t.id)));
            Object.values(topicRecords).forEach(rec => ids.push(rec && rec.id));
            return nextLevelId("t", ids);
        }
        function migrateLayoutKeys(patch) {
            if (!patch || "object" != typeof patch) return patch;
            [ "kinkOverrides", "kinkAngleOffsets" ].forEach(name => {
                const map = patch[name];
                if (!map || "object" != typeof map) return;
                Object.keys(map).forEach(key => {
                    const next = migrateNodeKey(key);
                    if (next !== key) {
                        map[next] = map[key];
                        delete map[key];
                    }
                });
            });
            return patch;
        }

        function Wn(e) {
            if (e && "object" == typeof e && e.id) return e.id;
            const t = sxName(e);
            for (const cat of h) for (const topic of cat.topics || []) if (sxName(topic) === t && topic && topic.id) return topic.id;
            const n = topicRecords[t] && topicRecords[t].id;
            if (!n) throw new Error(`Missing stored topic ID for "${t}". Assign max(existing ID) + 1 on the topic object.`);
            return n;
        }
        function catId(e) {
            const cat = h.find(c => c.name === String(e || ""));
            if (!cat || !cat.id) throw new Error(`Missing stored category ID for "${e}". Assign max(existing category ID) + 1 on the category; do not derive it from the name.`);
            return cat.id;
        }
        function Un(e, t) {
            const cat = h.find(c => c.name === String(e || ""));
            const sub = cat && (cat.subcategories || []).find(s => s.name === String(t || ""));
            if (!sub || !sub.id) throw new Error(`Missing stored subcategory ID for "${e}" / "${t}". Assign max(existing subcategory ID) + 1 on the subcategory; do not derive it from the name.`);
            return sub.id;
        }
        function Kn(e, t) {
            return "topic-" + Hn(String(e || "")) + "-" + Hn(String(t || ""));
        }
        function zn(e) {
            for (const t of h) for (const n of t.subcategories || []) if (Un(t.name, n.name) === e) return {
                id: e,
                label: n.name,
                branch: t.name,
                kind: "Subcategory",
                risk: t.risk,
                parentId: catId(t.name),
                topics: n.topics
            };
            return null;
        }
        function Vn(e, t) {
            const name = sxName(t);
            return (e.subcategories || []).find(sub => (sub.topics || []).some(topic => sxName(topic) === name)) || null;
        }
        function Yn(e) {
            return e.subcategories?.length ? (e.parentTopics || []).map(Wn).concat(e.subcategories.map(t => Un(e.name, t.name))) : e.topics.map(Wn);
        }
        function Xn(e) {
            const t = zn(e);
            if (t) return t;
            for (const t of h) {
                const n = t.topics.find(t => Wn(t) === e);
                if (n) {
                    const i = Vn(t, n);
                    return {
                        id: e,
                        label: sxName(n),
                        branch: t.name,
                        kind: "Topic",
                        risk: Boolean(((t.topics || []).find(topic => sxName(topic) === sxName(n)) || {}).risk),
                        parentId: i ? Un(t.name, i.name) : null
                    };
                }
            }
            return null;
        }
        function Zn(e, t) {
            if ("give" !== t && "receive" !== t) return "";
            const n = qn[e] || Xn(e) || (at[Vi()] || {})[e], i = n && n.parentId && (qn[n.parentId] || Xn(n.parentId)), a = n && (He[n.label] || i && He[i.label]);
            return a && a["give" === t ? 0 : 1] || "";
        }
        function Qn(e, t = Vi()) {
            const n = qn[e] || Xn(e) || (at[t] || {})[e];
            return n && n.label ? String(n.label).trim().toLowerCase() : "";
        }
        function Jn(e, t, n = Vi()) {
            const i = Ge(e, n);
            if (i.single || "give" !== i.labels[0] || "receive" !== i.labels[1]) return i.labels["give" === t ? 0 : 1] || t;
            const a = Qn(e, n);
            return a ? t + " " + a : t;
        }
        function ei(e, t, n = Vi()) {
            const i = Ge(e, n);
            return i.single || "give" !== i.labels[0] || "receive" !== i.labels[1] ? "" : Jn(e, t, n);
        }
        h.forEach(e => {
            Ke.add(catId(e.name)), (e.subcategories || []).forEach(t => Ke.add(Un(e.name, t.name))), 
            e.topics.forEach(e => Ke.add(Wn(e)));
        });
        const ti = {
            "boss secretary": "Boss / secretary",
            "over the knee otk spanking": "Over-the-knee spanking",
            "abdl diaper play": "ABDL / diaper play",
            "medical doctor nurse": "Doctor / nurse",
            "teacher student": "Teacher / student",
            "predator prey": "Predator / prey",
            "electric play violet wand e stim": "Violet wand / E-stim",
            "penis strap on": "Penis / strap-on",
            "words i enjoy saying hearing slut whore etc": "Humiliation words",
            "anal play": "Anal sex",
            rimming: "Analingus / rimming",
            facefucking: "Face fucking",
            collars: "Collars & symbols",
            paddles: "Paddles & straps",
            cuddling: "Cuddling & touch",
            ageplayer: "Age play",
            threesome: "Threesome"
        };
        function ni(e) {
            let t = String(e || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
            const n = "(?:everything|anything|all)(?:\\s+there\\s+is)?\\s+(?:to\\s+do\\s+)?(?:with|about)\\s+(?:it|this|that)|everything\\s+to\\s+do\\s+with\\s+it|giving(?:\\s*(?:and|&)\\s*receiving)?|receiving|both|switch|as\\s+a\\s+top|as\\s+a\\s+bottom|top|bottom|watching(?:\\s+others\\s+wear(?:ing)?)?|wearing";
            return t = t.replace(new RegExp(`\\s*(?:[—–|,:;]+\\s*)?[\\(\\[\\{]\\s*(?:${n})\\s*[\\)\\]\\}]\\s*$`, "i"), ""), 
            t = t.replace(new RegExp(`\\s*(?:[—–|,:;]+|\\betc\\.?\\s*)\\s*(?:${n})(?:\\s*(?:etc\\.?|and\\s+so\\s+on))?\\s*$`, "i"), ""), 
            t = t.replace(new RegExp(`\\s+(?:${n})\\s*$`, "i"), ""), t = t.replace(/(?:[,;/]\s*)?\betc\.?\s*$/i, "").replace(/\s*[—–|,:;]+\s*$/, "").replace(/\s+/g, " ").trim(), 
            (ti[ck(t)] || t).slice(0, 60);
        }
        function ii(e, t, n) {
            const i = Xn(n);
            if (!i) return null;
            const a = ni(t);
            if (!a) return null;
            const r = "subtopic-" + Hn(n) + "-" + Hn(a);
            return Hn(a) ? (e[r] = {
                id: r,
                label: a,
                parentId: n,
                branch: i.branch,
                kind: "Imported topic",
                risk: i.risk
            }, e[r]) : null;
        }
        function ai(e, t) {
            return Object.values(at[t] || {}).filter(t => t.parentId === e).map(e => e.id);
        }
        function ri() {
            const e = Qi() ? Xi() : [ Vi() ], t = {};
            let n = 0;
            return e.forEach(e => {
                n >= 560 || Object.values(at[e] || {}).some(e => n >= 560 || (t[e.id] || (t[e.id] = e, 
                n++), !1));
            }), Object.values(t);
        }
        function oi(e, t) {
            return `${e}\0${t}`;
        }
        function si(e, t = Vi()) {
            if (!Qi() || !t || !e.startsWith("subtopic-") || (at[t] || {})[e]) return null;
            const n = ca(e, t);
            return n.giveKnown || n.receiveKnown ? null : Xi().filter(e => e !== t).map(t => (at[t] || {})[e]).find(Boolean) || null;
        }
        function li() {
            const e = {};
            let t = 0;
            return Object.values(at).some(n => Object.values(n || {}).some(n => t >= 560 || (e[n.id] || (e[n.id] = n, 
            t++), !1))), Object.values(e);
        }
        function ci(e) {
            const t = qn[e];
            if (t && t.branch) return t.branch;
            for (const t of h) {
                if (e === catId(t.name)) return t.name;
                if ((t.subcategories || []).some(n => e === Un(t.name, n.name))) return t.name;
                if (t.topics.some(t => e === Wn(t))) return t.name;
            }
            return null;
        }
        function di(e, t = Mt) {
            const n = t && ft[t];
            if (!n || "group" !== n.kind || !n.results) return null;
            const i = qn[e] || Xn(e) || (at[t] || {})[e], a = i && i.label;
            return a ? (n.results.matches || []).includes(a) ? "mutual" : (n.results.curiousAbout || []).includes(a) ? "explore" : (n.results.mismatched || []).includes(a) ? "mismatch" : "other" : "other";
        }
        function ui(e, t = Vi()) {
            const n = da(e, t);
            return n.giveKnown && n.receiveKnown;
        }
        function pi(e, t = Vi()) {
            if (ui(e, t)) return !0;
            const n = zn(e);
            return n ? n.topics.some(e => pi(Wn(e), t)) : !isCatId(e) && !isSubId(e) && ai(e, t).some(e => ui(e, t));
        }
        function hi(e, t = Vi()) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id)).some(e => ui(e, t));
        }
        function gi(e, t = Vi()) {
            const n = zn(e);
            return n ? n.topics.some(e => gi(Wn(e), t)) : !ui(e, t) || !isCatId(e) && !isSubId(e) && ai(e, t).some(e => !ui(e, t));
        }
        function mi(e, t = Vi()) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id)).some(e => !ui(e, t));
        }
        function fi(e, t) {
            const n = un.get(e) || "rated", i = "all" === n ? t.slice() : t.filter(e => "rated" === n ? pi(e) : gi(e));
            return {
                mode: n,
                visible: i,
                hidden: t.length - i.length
            };
        }
        function yi(e, t, n, i, a = !1) {
            if (!n && !a) return "";
            const r = `+${n}`, o = Math.max(36, 8 * r.length + 16), s = `${n} hidden ${1 === n ? "child" : "children"}`;
            return e = Math.max(nh.x + o / 2 + 54, Math.min(nh.x + nh.width - o / 2 - 54, e)), 
            t = Math.max(nh.y + 14 + 54, Math.min(nh.y + nh.height - 14 - 54, t)), `<g class="hidden-count-badge" data-id="${Hi(i)}" data-width="${o}" data-height="28" transform="translate(${(e - o / 2).toFixed(2)} ${(t - 14).toFixed(2)})" tabindex="0" role="button" aria-label="${(typeof mx==='function'&&mx(i))||i}: ${s}. Switch between rated and unrated children."><rect width="${o}" height="28" rx="8"/><text x="${(o / 2).toFixed(2)}" y="14" text-anchor="middle" dominant-baseline="middle">${r}</text></g>`;
        }
        function bi(e) {
            const t = h.find(t => t.name === e.branch);
            return "Category" === e.kind ? t ? Yn(t) : [] : "Subcategory" === e.kind ? (e.topics || []).map(Wn) : ai(e.id, Vi());
        }
        function vi(e) {
            const t = qn[e];
            t && bi(t).length && (("Category" === t.kind ? rn.has(t.branch) : on.has(e)) ? (un.set(e, "rated" === un.get(e) ? "unrated" : "rated"), 
            rn.add(t.branch), "Topic" === t.kind && on.add(e), wn = !1, Lt = e, vn = e, Mr()) : Si(e));
        }
        function wi(e) {
            const t = bi(e), n = [];
            return t.forEach(e => {
                n.push(e);
                const t = Xn(e);
                "Subcategory" === t?.kind ? bi(t).forEach(e => {
                    n.push(e, ...ai(e, Vi()));
                }) : n.push(...ai(e, Vi()));
            }), new Set(n);
        }
        let ki = 0;
        function xi(e) {
            t.clear(ki), ki = 0, Mr(e);
        }
        function Si(e) {
            noteFitUserCamera();
            const t = qn[e];
            if (!t) return So(e);
            if (!bi(t).length) return So(e);
            if (wn = !1, "Category" === t.kind) {
                if (!kn) return Ei(), Lt = e, void Mr();
                if (rn.has(t.branch)) {
                    const e = wi(t);
                    return rn.delete(t.branch), Lt = null, void xi({
                        exitIds: e
                    });
                }
                return rn.add(t.branch), Lt = e, Mr(), void (Bt && requestAnimationFrame(() => Th(e, t.branch)));
            }
            if (rn.add(t.branch), on.has(e)) {
                const n = wi(t);
                return on.delete(e), Lt = null, void xi({
                    exitIds: n
                });
            }
            on.add(e), Lt = e, Mr(), Bt && requestAnimationFrame(() => Th(e, t.branch));
        }
        function $i(e) {
            noteFitUserCamera();
            (function(e) {
                const t = Vi(), n = si(e, t);
                if (!n) return !1;
                at[t] || (at[t] = {});
                const i = ii(at[t], n.label, n.parentId);
                return !!i && (Ke.add(i.id), gn.add(oi(t, i.id)), zt(t), rn.add(i.branch), on.add(i.parentId), 
                Lt = i.id, Nt = null, Mr({
                    anchorId: i.id
                }), !0);
            })(e) || Si(e);
        }
        function Ei() {
            xn && (rn.clear(), xn.branches.forEach(e => rn.add(e)), on.clear(), xn.topics.forEach(e => on.add(e))), 
            xn = null, kn = !0;
        }
        function Ai() {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const e = Cn.getAttribute("viewBox");
                e && (Cn.removeAttribute("viewBox"), Cn.getBoundingClientRect(), Cn.setAttribute("viewBox", e));
            }));
        }
        function Ci() {
            let e = null;
            kn ? (e = new Set([ ...rn ].flatMap(e => {
                const t = h.find(t => t.name === e);
                return t ? Yn(t).flatMap(e => {
                    const t = Xn(e);
                    return "Subcategory" === t?.kind ? [ e, ...t.topics.flatMap(e => {
                        const t = Wn(e);
                        return [ t, ...ai(t, Vi()) ];
                    }) ] : [ e, ...ai(e, Vi()) ];
                }) : [];
            })), xn = {
                branches: [ ...rn ],
                topics: [ ...on ]
            }, rn.clear(), on.clear(), kn = !1) : Ei();
            const t = {
                anchorPoint: {
                    x: 900,
                    y: 620
                },
                exitIds: e,
                forceRepaint: !e
            };
            e ? xi(t) : Mr(t);
        }
        const Mi = e.byId("centerProfileCard"), Ii = (e.byId("centerProfileCardTitle"), 
        e.byId("centerProfileAbout")), Pi = (e.byId("centerContactList"), e.byId("profileAboutDialog")), Li = e.byId("profileAboutSubtitle"), Ti = e.byId("profileAboutText"), Fi = e.byId("profileAboutResource"), Ni = [ [ "telegram", "Telegram" ], [ "linktree", "linktr.ee" ], [ "fetlife", "FetLife" ], [ "chaturbate", "Chaturbate" ], [ "stripchat", "Stripchat" ], [ "myfreecams", "MyFreeCams" ], [ "pornhub", "PornHub" ], [ "xvideos", "XVideos" ], [ "xhamster", "xHamster" ], [ "onlyfans", "OnlyFans" ], [ "reddit", "Reddit" ], [ "x", "X" ] ];
        function _i(e, t) {
            const n = encodeURIComponent(t);
            return {
                fetlife: `https://fetlife.com/users/${n}`,
                telegram: `https://t.me/${n}`,
                linktree: `https://linktr.ee/${n}`,
                chaturbate: `https://chaturbate.com/${n}/`,
                x: `https://x.com/${n}`,
                xhamster: `https://xhamster.com/users/${n}`,
                xvideos: `https://www.xvideos.com/profiles/${n}`,
                pornhub: `https://pornhub.com/model/${n}`,
                myfreecams: `https://www.myfreecams.com/${n}`,
                stripchat: `https://stripchat.com/${n}`,
                onlyfans: `https://onlyfans.com/${n}`,
                reddit: `https://reddit.com/user/${n}`
            }[e] || "";
        }
        function Di(e) {
            const t = Rv(e);
            return Ni.filter(([e]) => t[e]).map(([e, n]) => ({
                label: n,
                user: t[e],
                href: _i(e, t[e])
            })).concat((t.customSites || []).map(e => ({
                label: e.site,
                user: e.username,
                href: e.url
            })));
        }
        function Ri() {
            Mi.hidden = !0;
        }
        function Oi() {
            !Object.keys(wt).length ? roxyAbout() : (Ri(), Ci());
        }
        function Bi(e = Vi()) {
            return h.every(t => !ui(catId(t.name), e));
        }
        function ji(t, n = {}) {
            It = t, Mt = t, hn[t] = "saved";
            wn = !1, kn = !0, xn = null, Sn = "all", rn.clear(), on.clear(), Lt = null, 
            Nt = null, Tt = "";
            const a = e.byId("searchInput");
            a && (a.value = "");
            const r = e.byId("topicPicker");
            r && (r.value = "", nc()), h.forEach(e => {
                const n = catId(e.name);
                un.set(n, "all"), rn.add(e.name), (e.subcategories || []).forEach(n => {
                    const i = Un(e.name, n.name);
                    un.set(i, "all"), on.add(i);
                }), e.topics.forEach(e => {
                    const n = Wn(e);
                    un.set(n, "all"), on.add(n);
                });
            });
        }
        function qi(e, t, n = {}) {
            if (n.hasAttentionState) !function(e, t) {
                const n = t => Boolean(qn[t] || Xn(t) || (at[e] || {})[t]), i = new Set((Array.isArray(t && t.nodes) ? t.nodes : []).filter(t => n(t) && !Eo(e, t))), a = new Set((Array.isArray(t && t.newest) ? t.newest : []).filter(t => n(t) && !Eo(e, t)));
                Object.keys(vt[e] || {}).forEach(t => {
                    n(t) && !Eo(e, t) && ((at[e] || {})[t] ? a.add(t) : i.add(t));
                });
                const r = new Set([ ...i, ...a ].map(t => {
                    const n = qn[t] || Xn(t) || (at[e] || {})[t];
                    return n && n.branch || ci(t);
                }).filter(Boolean)), o = Array.isArray(t && t.branches) ? t.branches : [];
                ln[e] = new Set([ ...o, ...r ].filter(t => {
                    const n = catId(t);
                    return (e => h.some(t => t.name === e))(t) && (r.has(t) || ui(n, e) && !Eo(e, n));
                })), cn[e] = i, dn[e] = a;
            }(e, n.attentionState); else {
                const i = function(e) {
                    const t = [], n = new Set, i = e => {
                        e && !n.has(e) && (n.add(e), t.push(e));
                    };
                    return [ "ratings", "annotations", "notes" ].forEach(t => Object.keys(e[t] || {}).forEach(i)), 
                    Object.values(e.children || {}).forEach(e => i(e && e.id)), {
                        changed: t
                    };
                }(t);
                !function(e, t) {
                    const n = ln[e] || new Set, i = cn[e] || new Set, a = dn[e] || new Set;
                    t.forEach(t => {
                        const r = qn[t] || Xn(t) || (at[e] || {})[t], o = r && r.branch || ci(t);
                        o && n.add(o), r && "Topic" === r.kind ? i.add(t) : r && r.parentId && (i.add(r.parentId), 
                        a.add(t));
                    }), ln[e] = n, cn[e] = i, dn[e] = a;
                }(e, n.noFlash ? [] : i.changed);
            }
            ji(e), Jw(), Mr({
                animate: !1,
                forceRepaint: !0
            }), Ih(), Ai();
        }
        function Hi(e) {
            return (e == null ? "" : String(e)).replace(/[&<>"']/g, e => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[e]));
        }
        function Wi(e) {
            var h = window.__sxDialog;
            if (h && h.open) return void h.open(e);
            if (e && !e.open) try {
                "function" == typeof e.showModal ? e.showModal() : (e.setAttribute("open", ""), 
                e.classList.add("fallback-open"));
            } catch (t) {
                e.setAttribute("open", ""), e.classList.add("fallback-open");
            }
        }
        function Ui(e) {
            var h = window.__sxDialog;
            if (h && h.close) return void h.close(e);
            if (e) {
                try {
                    "function" == typeof e.close && e.open ? e.close() : e.removeAttribute("open");
                } catch (t) {
                    e.removeAttribute("open");
                }
                e.classList.remove("fallback-open");
            }
        }
        e.byId("closeCenterProfileCard") && e.byId("closeCenterProfileCard").addEventListener("click", Ri), Ii && Ii.addEventListener("click", function() {
            const e = Ii.dataset.profileId;
            e && vt[e] && (Ri(), bw(e, {
                mode: "about"
            }));
        }), e.byId("closeProfileAbout") && e.byId("closeProfileAbout").addEventListener("click", () => Ui(Pi)), Pi && Pi.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Pi);
        }), e.byId("toggleCenterBranches") && e.byId("toggleCenterBranches").addEventListener("click", () => {
            Ri(), Ci();
        }), e.byId("editCenterProfile") && e.byId("editCenterProfile").addEventListener("click", () => {
            Ri(), bw(Mt);
        }), window.__sxOnPtr( e => {
            Mi.hidden || Mi.contains(e.target) || __sxClosestAction(e.target, "centerHit") || Ri();
        }, !0), (() => {
            let sxTapX = 0, sxTapY = 0, sxTapDown = !1;
            window.__sxOnPtr( e => {
                sxTapX = e.clientX, sxTapY = e.clientY, sxTapDown = !0;
            }, !0);
            document.addEventListener("pointerup", e => {
                if (!sxTapDown) return;
                sxTapDown = !1;
                const dx = e.clientX - sxTapX, dy = e.clientY - sxTapY;
                if (dx * dx + dy * dy > 100) {
                    e.preventDefault(), e.stopPropagation();
                    const t = e.target;
                    t && t.addEventListener("click", function h(ev) {
                        ev.preventDefault(), ev.stopPropagation(), t.removeEventListener("click", h, !0);
                    }, !0);
                }
            }, !0);
        })();
        const Gi = e.byId("unsavedChangesDialog");
        function Ki() {
            const t = jt();
            t && !Gi.open && (e.byId("unsavedChangesQuestion").textContent = `${wt[t] || "This profile"} has changes that are not safely stored yet. Choose what to do before reloading.`, 
            Wi(Gi), requestAnimationFrame(() => e.byId("saveUnsavedToMemory").focus()));
        }
        // Interest-color stops — the one source both interest encodings
        // derive from (map-render refactor, finding 7): zi() interpolates
        // these rgb stops, and Ka's rating-rail CSS gradient uses the
        // same stops as the --red-deep / --curious / --green-deep custom
        // properties (shell :root: #bd4f51 / #d7bd55 / #3da874 — the
        // same values in hex). Change a stop here and in the shell
        // :root together.
        const INTEREST_STOPS = {
            curious: [ 215, 189, 85 ],
            positive: [ 61, 168, 116 ],
            negative: [ 189, 79, 81 ]
        };
        function zi(e) {
            e = Number(e) || 0;
            // The --curious value is read once and cached on the function
            // (finding 8): zi is called per spoke per render and
            // getComputedStyle forces style recalculation. No theme
            // switch exists in the app, so nothing invalidates the cache.
            if (0 === e) return zi._curious ??= getComputedStyle(document.documentElement).getPropertyValue("--curious").trim();
            const n = Math.min(1, Math.abs(e) / 100), i = INTEREST_STOPS.curious, a = e > 0 ? INTEREST_STOPS.positive : INTEREST_STOPS.negative;
            return `rgb(${Math.round(i[0] + (a[0] - i[0]) * n)},${Math.round(i[1] + (a[1] - i[1]) * n)},${Math.round(i[2] + (a[2] - i[2]) * n)})`;
        }
        function Vi() {
            return Mt || Et;
        }
        function Yi() {
            return Array.from(en).filter(e => vt[e]);
        }
        // Profiles-data F2: the chosen set changes ONLY through sxSel(),
        // and sxSel() is the only place the comparison-active flag (an)
        // is written: after every mutation the flag is re-derived from
        // the set (active exactly when the set holds more than one live
        // member). No caller hand-syncs the flag any more, so the set
        // and the flag cannot disagree — toggling a second profile in
        // now leaves comparison active. The flag stays a cache for one
        // reason: sxSel's "dismiss" operation (Hide group overlay)
        // clears the flag while leaving the chosen set untouched, as
        // that button has always behaved; a pure derivation cannot
        // express it without changing which profiles are chosen.
        function sxSel(e, t = "add") {
            if ("dismiss" === t) return void (an = !1);
            if ("show" === t) return void (an = Yi().length >= 2);
            if ("clear" === t) en.clear();
            else if ("set" === t) en.clear(), (e || []).forEach(e => en.add(e));
            else if ("remove" === t) en.delete(e);
            else if ("toggle" === t) en.has(e) ? en.delete(e) : en.add(e);
            else en.add(e);
            an = Yi().length >= 2;
        }
        function Xi() {
            const e = Yi();
            return an && e.length >= 2 ? e : Mt && vt[Mt] ? [ Mt ] : [];
        }
        function Zi(e) {
            sxSel(null, "clear"), vt[e] && la(e);
        }
        function sxAutoSelect(id) {
            if (!vt[id]) return;
            if (!en.size && Mt && vt[Mt] && Mt !== id) {
                sxSel(Mt), la(Mt);
            }
            sxSel(id), la(id), Jw();
        }
        // Load landing (load-target stage, 2026-10-27): a load ends
        // on the loaded profile's own tab — ACTIVATED and SELECTED —
        // and never opens the comparison overlay or a group map.
        // The chosen set keeps every loaded profile slated for
        // multi-select; the comparison (crossmatch) appears only
        // when the bowtie or circle-dot button is fired, so after
        // selecting, the overlay flag is dismissed while the set is
        // left untouched. Quiet bundle creates keep their own landing
        // (their caller activates the last profile), and a share-link
        // boot keeps its pinned behavior (F7: no auto-select, no join).
        function sxLoadLanding(id, opts = {}) {
            if (!id || !vt[id] || opts.quiet || "share-link" === opts.source) return;
            opts.autoSelect || sxSel(id), sxSel(null, "dismiss"), ak(id), Jw();
        }
        function Qi() {
            return an && Xi().length >= 2;
        }
        function Ji(e) {
            return String(e || "").trim().split(/\s+/)[0] || "";
        }
        e.byId("stayWithUnsavedChanges") && e.byId("stayWithUnsavedChanges").addEventListener("click", () => Ui(Gi)), e.byId("saveUnsavedToMemory") && e.byId("saveUnsavedToMemory").addEventListener("click", () => {
            const e = jt(), t = window.SexcapadesRuntime.DOM.byId("rememberProfileCheckbox2x"), n = window.Sexcapades2xRememberProfiles;
            t && !t.checked && (t.checked = !0, t.dispatchEvent(new Event("change"))), n && "function" == typeof n.saveNow && n.saveNow() ? (e && Vt(e), 
            Ui(Gi), tS("Changes saved to profile memory.")) : tS("Could not save these changes to profile memory.", {
                tone: "error",
                persistent: !0
            });
        }), e.byId("exportUnsavedNow") && e.byId("exportUnsavedNow").addEventListener("click", () => {
            const e = jt();
            e && (Ui(Gi), Jf(e));
        }), e.byId("reloadWithUnsavedChanges") && e.byId("reloadWithUnsavedChanges").addEventListener("click", () => {
            qt = !0, document.documentElement.classList.remove("has-unsaved-changes"), document.body.classList.remove("has-unsaved-changes"), 
            location.reload();
        }), Gi.addEventListener("cancel", e => {
            e.preventDefault(), Ui(Gi);
        }), window.__sxOnKey( e => {
            jt() && !Gi.open && ("F5" === e.key || (e.ctrlKey || e.metaKey) && "r" === e.key.toLowerCase()) && (e.preventDefault(), 
            e.stopImmediatePropagation(), Ki());
        }, !0), document.addEventListener("touchstart", e => {
            if (!jt() || 1 !== e.touches.length || document.scrollingElement && document.scrollingElement.scrollTop > 1) return;
            if (__sxClosestAction(e.target, "interactiveAncestor")) return;
            const t = e.touches[0];
            t.clientY > 96 || (Ht = {
                x: t.clientX,
                y: t.clientY
            });
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchmove", e => {
            if (!Ht || 1 !== e.touches.length) return;
            const t = e.touches[0], n = t.clientX - Ht.x, i = t.clientY - Ht.y;
            i > 18 && i > 1.35 * Math.abs(n) && e.preventDefault(), i >= 72 && i > 1.35 * Math.abs(n) && (Ht = null, 
            Ki());
        }, {
            capture: !0,
            passive: !1
        }), document.addEventListener("touchend", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        }), document.addEventListener("touchcancel", () => {
            Ht = null;
        }, {
            capture: !0,
            passive: !0
        });
        // Center-node geometry (ea) — derivation note. These values are
        // frozen baselines, reached by successive rescalings of the center
        // node (builds 2026-10-17_1446, 2026-10-17_2027, 2026-10-18_0343,
        // 2026-10-18_1449, 2026-10-19_0119): the photo disc and at-a-glance
        // rings were grown until the outer ring's edge sat ~3 units clear
        // of the nearest first-generation label anchor (lineStartRadius +
        // 105 = 1315.17); the gen-1 spoke starts were then moved onto the
        // ring's exterior edge (spokeStartRadius = glanceRadii[0] + ring
        // stroke / 2); and the rings were finally respaced to an exact
        // 44-unit radial pitch, tiling edge to edge, with the innermost
        // ring's inner edge unchanged (photoRadius + 5.73 clearance).
        // outerRadius / lineStartRadius never moved: they are the layout
        // and label anchors. The full build-by-build history is preserved
        // in the map-render refactor completion report (2026-10-25).
        const MAP_CENTER_X = 900, MAP_CENTER_Y = 620, BRANCH_TOGGLE_DROP = 184.06;
        const ea = {
            photoRadius: 897.58,
            glanceRadii: [ 1013.31, 969.31, 925.31 ],
            outerRadius: 1200,
            lineStartRadius: 1210.17,
            spokeStartRadius: 1035.31,
            branchToggleY: 1839.37
        };
        // Font-as-master-knob, part 3 (Build 2026-10-19_0948): the layout
        // parameter centerRingScale (Layout Editor "Center ring scale",
        // layout-centerRingScale hash param, default 1) rescales the
        // center node independently of fontScale. eaBase freezes the 1.0
        // values; refreshCenterRing() re-derives the live ea radii from
        // them on every render (called at the top of Mr() and once here),
        // so moving the slider rescales the node live with no reload and
        // at 1.0 every radius is exactly its pre-part-3 value. Scaled:
        // photoRadius (photo circle, clip, hit disc, name arc), the three
        // glanceRadii (at-a-glance rings), and spokeStartRadius (gen-1
        // spoke starts at the ring's outer edge). NOT scaled:
        // outerRadius/lineStartRadius (layout + label anchors).
        // FQ2-BAKEIN (A4): branchToggleY is no longer a fixed constant —
        // refreshCenterRing() derives it from the scaled ring (see below).
        const eaBase = {
            photoRadius: ea.photoRadius,
            glanceRadii: ea.glanceRadii.slice(),
            spokeStartRadius: ea.spokeStartRadius
        };
        function centerRingScale() {
            const v = Number(mn && mn.centerRingScale);
            return Number.isFinite(v) && v > 0 ? v : 1;
        }
        // ICON DEPTH LAW (ruled 2026-11-02, Jason; SQUARE-ROOT
        // form — the owner adopted the same day's square-root
        // draft at 17:05, superseding the linear (0.6)^depth x R
        // law built earlier that day; the two-thirds base is
        // kept, as ruled; RADIUS reading ruled 13:38 the same
        // day — "I meant radius"): a node's icon RADIUS is
        // (2/3)^depth x sqrt(R x W) — the depth-scaled
        // geometric mean of R, the centre-disc radius
        // (ea.photoRadius = 897.58 x centerRingScale, set by
        // the Center circle slider; eaBase.photoRadius is the
        // fallback), and W, the ring width midlineStrokeWidth()
        // = 22 x mapFontScale() (the same width sxFontMaster()
        // reads as the font master F). Icons therefore grow
        // only as the square root when either slider rises,
        // instead of linearly with the centre alone. Depth 1 =
        // categories, depth 2 = subcategories AND kinks
        // hanging straight off a category, depth 3 = kinks
        // under a subcategory, imported children included. At
        // the baked defaults (fontScale 120, centre 90: R =
        // 80,782.20, W = 2,640, sqrt(RW) = 14,603.60) the depth
        // radii are 9,735.73 / 6,490.49 / 4,326.99 (diameters
        // double those). Sliders and tags scale by depth
        // exactly like the fonts (sxControlScale below — see
        // Ka / renderKinkLine control scales and sxSccBuild's
        // tagM); the icon ladder (2/3) and the font ladder
        // stay independent (font law since 2026-11-02 17:24:
        // sqrt(R x W) x (2/3)^(depth-1) for depths 1-3, glance
        // at W; the earlier (8/9)^depth font ladder is
        // superseded history). The pr.*Icon seeds remain
        // ONLY as solver estimate-space inputs and as the
        // slider-scale normalization (seed / 48); nothing
        // painted reads them for icon size any more.
        // ICON MINIMUM (ruled 2026-11-02 13:27, Jason): no
        // icon draws smaller than the current floor, and the
        // floor rises and falls with the FONT slider. No
        // single icon floor exists elsewhere in the code
        // (there is no 44px icon floor); the floor used here
        // is the one the spoke-trim helpers already enforce
        // — the 12-unit radius clamp in
        // SpokeGeometry.buildTipCircle (Math.max(12,
        // iconSize / 2)) and in renderKinkLine's leaf trim —
        // taken font-scaled, as ruled: minimum icon RADIUS =
        // 12 x mapFontScale() (1,440 world units at the baked
        // fontScale 120; minimum diameter 2,880). Under the
        // square-root law the floor binds nowhere at the baked
        // defaults — it binds only when the centre is small
        // or the font large.
        function sxIconRadius(depth) {
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.max(Math.pow(2 / 3, depth) * Math.sqrt(base * midlineStrokeWidth()), 12 * mapFontScale());
        }
        function sxIconDiameter(depth) {
            return 2 * sxIconRadius(depth);
        }
        // FONT DEPTH LADDER: the current law is the FONT LAW note
        // on sxFontSize below. Glance labels (depth 0) stay at the
        // slider basis W = 22 x mapFontScale(). Depths 1-3 use
        // sqrt(R x W), then x (2/3) per deeper level. The old
        // (8/9)^depth ladder is superseded and sizes nothing.
        // Baked defaults are text 120 and centre 90.
        function sxFontMaster() {
            return midlineStrokeWidth();
        }
        // FONT LAW (ruled 2026-11-02 17:24 CST, Jason; built
        // 2026-11-03, superseding the (8/9)^depth ladder above):
        // glance labels (depth 0) stay at the slider's basis
        // W = sxFontMaster() = 22 x mapFontScale(); depths 1-3
        // ride the square-root law the icons use, offset one
        // level: depth 1 (categories) = sqrt(R x W), depth 2
        // (subcategories AND kinks hanging straight off a
        // category) = (2/3) sqrt(R x W), depth 3 (kinks under
        // a subcategory) = (4/9) sqrt(R x W), where R is the
        // centre-disc radius from the same source sxIconRadius
        // reads (ea.photoRadius, eaBase.photoRadius fallback)
        // and W = midlineStrokeWidth(). The font helper shares
        // the sqrt(R x W) subexpression with sxIconRadius but
        // does NOT inherit the icon floor (12 x mapFontScale):
        // fonts are never floored. At the baked defaults
        // (fontScale 120, centre 90: W = 2,640, R = 80,782.20,
        // sqrt(RW) = 14,603.60) the sizes are glance 2,640,
        // depth 1 = 14,603.60, depth 2 = 9,735.73, depth 3 =
        // 6,490.49 — the category text is ~5.5 ring-widths,
        // LARGER than the at-a-glance rings (owner's ruling
        // 2026-11-03 01:18 CST). sxFontFactor stays the
        // dimensionless ratio sxFontSize(depth) / F so every
        // follower scaled by it (Ga widths, Ka controls,
        // strokes, tags) tracks the new law without rescaling.
        function sxFontSize(depth) {
            if (!(depth > 0)) return sxFontMaster();
            const R = Number(ea && ea.photoRadius), base = Number.isFinite(R) && R > 0 ? R : eaBase.photoRadius;
            return Math.pow(2 / 3, depth - 1) * Math.sqrt(base * midlineStrokeWidth());
        }
        function sxFontFactor(depth) {
            return sxFontSize(depth) / sxFontMaster();
        }
        function sxFontCoef(depth) {
            return 22 * sxFontFactor(depth);
        }
        // SLIDER / TAG + STROKE DEPTH LADDER (ruled 2026-11-02
        // 14:51 and 14:52, Jason): sliders and tags scale in the
        // same way as the fonts, by depth from the ring-width
        // font master — the plain font scale times
        // sxFontFactor(depth): since the 2026-11-02 17:24
        // font law the factor is sxFontSize(depth) / F —
        // depth 1 sqrt(R/W), then x (2/3) per level — so
        // sliders, tags and strokes follow the FONT sizes
        // (the historical (8/9)^depth factors, depth 1 8/9,
        // depth 2 64/81, depth 3 512/729, are superseded).
        // The spoke stroke widths follow too: a spoke at a
        // depth is stroked at sxStrokeWidth(depth) =
        // sxFontSize(depth),
        // and its outline and tapered-stem base widths scale by
        // the same factor, so a spoke's whole body thins with
        // its depth. sxControlScale keeps the historical
        // per-type seed normalization (seed / 48, clamped
        // .62–1.25) the Ka / renderKinkLine controls and
        // sxSccBuild's tagM have always used, and multiplies it
        // by the depth factor. Depths are the icon/font depths:
        // 1 = category spokes, 2 = subcategory spokes and
        // kinks hanging straight off a category, 3 = kinks
        // under a subcategory (imported children included).
        // NOT laddered: the centre glance rings (they are the
        // master), the fixed screen-px hit strokes and the
        // 44px tap geometry (CSS vars / sxRailPx caps stay as
        // they are; each control now also publishes its own
        // depth-scaled rail thickness as scoped CSS vars), and
        // the solver estimate-space allowances (rr.*), which
        // never painted.
        function sxControlScale(depth, seed) {
            return Math.max(.62, Math.min(1.25, (Number(seed) || 48) / 48)) * mapFontScale() * sxFontFactor(depth);
        }
        function sxStrokeWidth(depth) {
            return sxFontSize(depth);
        }
        // Canonical stroke at the current font scale (BAND-SHRINK,
        // ruled 2026-11-02, Jason: "the band shrinks to fit the
        // letters; the 44 shrinks to 22"): the ring
        // thickness the midline strokes (Ka, renderKinkLine),
        // Ga.outlineWidth / Ga.CLOUD_OUTLINE_WIDTH, and
        // refreshCenterRing's w all derive from. Ga.midlineWidth
        // and MIDLINE_SCALE are gone; this 22 x mapFontScale
        // stroke is the only midline width.
        function midlineStrokeWidth() {
            return 22 * mapFontScale();
        }
        function refreshCenterRing() {
            const s = centerRingScale();
            ea.photoRadius = eaBase.photoRadius * s;
            // Pitch = stroke (label-scale repair): the rings anchor to
            // the scaled disc (radius follows centerRingScale) but step
            // outward by exactly one ring thickness w, and w follows the
            // FONT scale — so the three bands tile edge to edge at every
            // combination of the two independent scales. (Previously the
            // radii scaled by s while the CSS stroke stayed a fixed 44,
            // opening gaps of 44*(s-1).) BAND-SHRINK (2026-11-02): w is
            // now 22 * font scale, so the bands tile edge to edge at
            // the new width and the s = 1 radii sit one half-stroke
            // closer to the disc than the frozen eaBase values (which
            // were struck at w = 44); eaBase stays the frozen
            // reference the clearance below was derived from.
            // GLANCE_INNER_CLEARANCE is the
            // frozen 1.0-baseline gap between the photo edge and the
            // innermost ring's inner edge: 925.31 - 44/2 - 897.58 = 5.73
            // (eaBase.glanceRadii[2], base stroke 44, eaBase.photoRadius).
            // At s = 1 and w = 44 this reproduced the eaBase values
            // exactly: glanceRadii [1013.31, 969.31, 925.31] and
            // spokeStartRadius 1035.31 (the outer ring's outer edge,
            // 1013.31 + 44/2). Since the band shrink (w = 22 at font
            // scale 1) the same formulas give [958.31, 936.31, 914.31]
            // and spokeStartRadius 969.31 — pitch = w preserved.
            // eaBase.glanceRadii stays the frozen 1.0 reference. The stroke itself is published as the
            // --glance-ring-width CSS variable, consumed by the
            // .center-glance-ring-track/-value/-hit rules so the track,
            // value, and hit strokes all equal w on every render.
            // Derived values are rounded to 2 decimals (the precision of
            // every eaBase value) so the s = 1 / w = 44 baseline is
            // byte-exact, with no floating-point dust in the emitted radii.
            const GLANCE_INNER_CLEARANCE = 5.73, w = midlineStrokeWidth(), innerEdge = ea.photoRadius + GLANCE_INNER_CLEARANCE, r2 = v => Math.round(v * 100) / 100;
            ea.glanceRadii = [ r2(innerEdge + 5 * w / 2), r2(innerEdge + 3 * w / 2), r2(innerEdge + w / 2) ];
            ea.spokeStartRadius = r2(innerEdge + 3 * w);
            document.documentElement.style.setProperty("--glance-ring-width", String(w));
            // FQ2-BAKEIN (A4, position driver): the center "+N branches"
            // toggle follows the center ring. At scale 1 its fixed Y
            // (1839.37) sat 184.06 world units below the outer ring's
            // outer edge (ring bottom 620 + 1035.31 = 1655.31). Deriving
            // Y as centerY + scaled spokeStartRadius + 184.06 preserves
            // that exact offset at every centerRingScale.
            ea.branchToggleY = MAP_CENTER_Y + ea.spokeStartRadius + BRANCH_TOGGLE_DROP;
        }
        refreshCenterRing();
        // Gen-1 spoke base circle radius: the base disc IS the center ring
        // (each category spoke's base arc hugs the ring's outer edge), so
        // the base radius derives directly from the scaled ring radius —
        // no separate control. The per-spoke base WIDTH is set in
        // Za.categoryTaperBaseWidth: TAPER_BASE_FRACTION (0.78) of the
        // chord 2R sin(π/18), the 18-slot equispaced pitch at the ring's
        // outer edge R (slot arc length 2πR/18), CAPPED at the tuned-era
        // value (TAPER_BASE_CAP, the R = 300 chord — TAPER-BASE
        // RE-ANCHOR, 2026-11-02) so bases no longer grow with the ring;
        // the cap only ever shrinks the chord term, so bases always
        // keep a margin from their neighbours.
        function gen1SpokeBaseRadius() {
            return ea.spokeStartRadius;
        }
        function ta(e) {
            const t = Uc(), n = t.length, i = t.filter(t => {
                const n = (e || {})[t];
                return "number" == typeof n || Boolean(n && "object" == typeof n && (Object.prototype.hasOwnProperty.call(n, "give") || Object.prototype.hasOwnProperty.call(n, "receive")));
            }).length;
            return {
                rated: i,
                total: n,
                percent: n ? Math.round(i / n * 100) : 0
            };
        }
        function na(e = Xi()) {
            const t = Mt && ft[Mt] && "group" === ft[Mt].kind ? ft[Mt] : null, n = t && e.length < 2 ? t.sourceProfiles || [] : e.filter(e => e === Et || vt[e]).map(e => ({
                ratings: e === Et ? At : vt[e]
            }));
            if (!n.length) return {
                rated: 0,
                total: Uc().length,
                percent: 0
            };
            const i = n.map(e => ta(e.ratings || {})), a = i.reduce((e, t) => e + t.rated, 0), r = i.reduce((e, t) => e + t.total, 0);
            return {
                rated: a,
                total: r,
                percent: r ? Math.round(a / r * 100) : 0
            };
        }
        function aa(e, t, n = "") {
            const i = Math.max(1, Number(e.width) || 1), a = Math.max(1, Number(e.height) || 1), r = Math.max(1, Number(e.cropZoom) || 1), o = Math.max(-180, Math.min(180, Number(e.cropRotation) || 0)), s = Math.max(t.w / i, t.h / a) * r, l = i * s, c = a * s, d = Number(e.cropX), u = Number(e.cropY), p = A(Number.isFinite(d) ? d : .5), h = A(Number.isFinite(u) ? u : .5), g = t.w / 2 - p * l, m = t.h / 2 - h * c;
            return `<svg${n ? ` class="${n}"` : ""} x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}" overflow="hidden"><image href="${e.data}" x="${g.toFixed(4)}" y="${m.toFixed(4)}" width="${l.toFixed(4)}" height="${c.toFixed(4)}" preserveAspectRatio="none" transform="rotate(${o.toFixed(2)} ${(t.w / 2).toFixed(2)} ${(t.h / 2).toFixed(2)})"/></svg>`;
        }
        function ra(e, t) {
            const n = Math.max(0, Math.min(100, Number(e) || 0)), i = 620 - t;
            if (n <= 0) return "";
            if (n >= 100) return `M 900 ${i} A ${t} ${t} 0 1 1 900 ${620 + t} A ${t} ${t} 0 1 1 900 ${i}`;
            const a = -Math.PI / 2 + 2 * Math.PI * n / 100, r = 900 + t * Math.cos(a), o = 620 + t * Math.sin(a);
            return `M 900 ${i} A ${t} ${t} 0 ${n > 50 ? 1 : 0} 1 ${r.toFixed(3)} ${o.toFixed(3)}`;
        }
        function oa() {
            const e = 3 === pc.length ? pc : [ {
                label: "Hot topics", // FQ2-BAKEIN: "Want to do" -> "Hot topics"
                count: 0,
                percent: 0,
                color: "var(--green)"
            }, {
                label: "Curiosity?", // FQ2-BAKEIN: "Curious about" -> "Curiosity?"
                count: 0,
                percent: 0,
                color: "var(--curious)"
            }, {
                label: "Not topics", // FQ2-BAKEIN: "No" -> "Not topics"
                count: 0,
                percent: 0,
                color: "var(--red)"
            } ], t = ea.glanceRadii, n = [ "Green", "Yellow", "Red" ], i = [ "green", "yellow", "red" ];
            return `<g class="center-glance-rings">${e.map((e, a) => `<g class="center-glance-ring"><circle class="center-glance-ring-track is-${i[a]}" cx="900" cy="620" r="${t[a]}"/><path class="center-glance-ring-value is-${i[a]}" id="centerGlanceRing${n[a]}" data-ring-radius="${t[a]}" d="${ra(e.percent, t[a])}" style="opacity:${e.percent ? 1 : 0}"/><circle class="center-glance-ring-hit" data-center-glance-index="${a}" cx="900" cy="620" r="${t[a]}" tabindex="0" role="button" aria-label="${Hi(e.label)}, ${e.percent} percent, ${e.count} ${1 === e.count ? "topic" : "topics"}. Open rating details."/></g>`).join("")}</g>`;
        }

        function syncGlobalVisibilityControl() {
            // LR-G5: the rating state (Sn) used to be mirrored into a
            // hidden button's textContent (former id layoutRatedToggle);
            // it now lives in the visible Topics shown radio group
            // itself — syncing checks the radio whose value is Sn.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.checked = r.value === Sn;
            });
        }
        function setGlobalTopicVisibility(t) {
            Sn = "rated" === t || "unrated" === t ? t : "all", kn = !0, xn = null;
            h.forEach(t => {
                un.set(catId(t.name), Sn), (t.subcategories || []).forEach(n => un.set(Un(t.name, n.name), Sn)),
                t.topics.forEach(t => un.set(Wn(t), Sn));
            }), Object.keys(qn).forEach(e => un.set(e, Sn)), syncGlobalVisibilityControl(), Mr({
                animate: !1,
                forceRepaint: !0
            });
        }
        {
            // LR-G5: the Topics shown radios drive global visibility
            // directly. The editor's change handler used to click the
            // hidden button (former id layoutRatedToggle) in a loop
            // until its text matched the chosen radio; the radios' own
            // change events now call the same setGlobalTopicVisibility
            // the button's click handler cycled into.
            document.querySelectorAll("input[name=\"layoutRating\"]").forEach(r => {
                r.addEventListener("change", function() {
                    if (r.checked) setGlobalTopicVisibility(r.value);
                });
            }), syncGlobalVisibilityControl();
        }
        function sa(e) {
            if (mn.staticMap) return;
            e.target && e.target.closest && __sxClosestAction(e.target, "centerBranchToggle") && ("keydown" === e.type && "Enter" !== e.key && " " !== e.key || (e.preventDefault(),
            e.stopImmediatePropagation(), setGlobalTopicVisibility("rated" === Sn ? "all" : "rated")));
        }
        function la(e) {
            if (!tn[e]) {
                const t = new Set(Object.values(tn));
                tn[e] = nn.find(e => !t.has(e)) || nn[Object.keys(tn).length % nn.length];
            }
            return tn[e];
        }
        function ca(e, t) {
            const n = (t === Et ? At : vt[t] || {})[e];
            if ("number" == typeof n) return {
                give: n,
                receive: n,
                giveKnown: !0,
                receiveKnown: !0
            };
            if (n && "object" == typeof n) {
                const e = Object.prototype.hasOwnProperty.call(n, "give"), t = Object.prototype.hasOwnProperty.call(n, "receive");
                return {
                    give: e && Number(n.give) || 0,
                    receive: t && Number(n.receive) || 0,
                    giveKnown: e,
                    receiveKnown: t
                };
            }
            return {
                give: 0,
                receive: 0,
                giveKnown: !1,
                receiveKnown: !1
            };
        }
        function da(e, t) {
            const U = (give, receive, gk, rk, gd, rd, gr, rr, total) => ({
                give: give,
                receive: receive,
                giveKnown: gk,
                receiveKnown: rk,
                giveDerived: gd,
                receiveDerived: rd,
                giveRatedChildren: gr,
                receiveRatedChildren: rr,
                childCount: total
            });
            if (isCatId(e)) {
                const c = h.find(c => catId(c.name) === e);
                if (!c) return U(0, 0, !1, !1, !1, !1, 0, 0, 0);
                const d = ca(e, t), g = cuCat(c, t, "give"), r = cuCat(c, t, "receive"), gv = d.giveKnown ? d.give : g.value, rv = d.receiveKnown ? d.receive : r.value;
                return U(null === gv ? 0 : gv, null === rv ? 0 : rv, null !== gv, null !== rv, !d.giveKnown && null !== g.value, !d.receiveKnown && null !== r.value, d.giveKnown ? 0 : g.rated, d.receiveKnown ? 0 : r.rated, g.total);
            }
            const z = zn(e);
            if (z) {
                const d = ca(e, t), ids = z.topics.map(Wn).concat(ai(e, t)), ch = ids.map(id => da(id, t)), one = dir => {
                    if (d[dir + "Known"]) return {
                        value: d[dir],
                        rated: 0,
                        direct: !0
                    };
                    const k = ch.filter(c => c[dir + "Known"]);
                    return k.length ? {
                        value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                        rated: k.length
                    } : {
                        value: null,
                        rated: 0
                    };
                }, g = one("give"), r = one("receive");
                return U(null === g.value ? 0 : g.value, null === r.value ? 0 : r.value, null !== g.value, null !== r.value, !g.direct && null !== g.value, !r.direct && null !== r.value, g.rated, r.rated, ids.length);
            }
            const n = ca(e, t);
            if (!Xn(e)) return U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0);
            const ids = ai(e, t);
            if (!ids.length) return U(n.give, n.receive, n.giveKnown, n.receiveKnown, !1, !1, 0, 0, 0);
            const ch = ids.map(id => da(id, t)), one = dir => {
                if (n[dir + "Known"]) return {
                    value: n[dir],
                    rated: 0,
                    derived: !1,
                    known: !0
                };
                const k = ch.filter(c => c[dir + "Known"]);
                return k.length ? {
                    value: k.reduce((a, c) => a + c[dir], 0) / k.length,
                    rated: k.length,
                    derived: !0,
                    known: !0
                } : {
                    value: 0,
                    rated: 0,
                    derived: !1,
                    known: !1
                };
            }, g = one("give"), r = one("receive");
            return U(g.value, r.value, g.known, r.known, g.derived, r.derived, g.rated, r.rated, ids.length);
        }
        function ua(e, t) {
            const n = ca(e, t), i = [];
            return n.giveKnown && i.push(n.give), n.receiveKnown && i.push(n.receive), i.length ? i.reduce((e, t) => e + t, 0) / i.length : null;
        }
        function pa(e, t, n) {
            let i = 0, a = 0;
            return e.forEach(e => {
                const r = n(e);
                null != r && (i += r, a++);
            }), a ? Math.max(-100, Math.min(100, i / a)) : null;
        }
        function ha(e, t, n) {
            const i = ca(e, t);
            return "give" === n ? i.giveKnown ? i.give : null : i.receiveKnown ? i.receive : null;
        }
        function ga(e, t) {
            return e.topics.map(e => Wn(e)).concat(Object.values(at[t] || {}).filter(t => t.branch === e.name).map(e => e.id));
        }
        function ma(e, t) {
            return pa(ga(e, t), t, e => ua(e, t));
        }
        function smSub(e, t, n, i) {
            const a = (e?.topics || []).map(Wn).concat(i ? ai(i, t) : []);
            return pa(a, t, e => ha(e, t, n));
        }
        function sgSub(e) {
            for (const t of h) for (const n of t.subcategories || []) if (Un(t.name, n.name) === e) return n;
            return null;
        }
        function cuCat(e, t, n) {
            const s = e.subcategories || [], u = [];
            if (!s.length) ga(e, t).forEach(x => u.push(ha(x, t, n))); else {
                (e.parentTopics || []).forEach(l => u.push(ha(Wn(l), t, n)));
                s.forEach(g => u.push(smSub(g, t, n, Un(e.name, g.name))));
                const d = new Set(s.map(g => Un(e.name, g.name)));
                Object.values(at[t] || {}).filter(x => x.branch === e.name && !d.has(x.parentId)).forEach(x => u.push(ha(x.id, t, n)));
            }
            const k = u.filter(v => null != v);
            return {
                value: k.length ? Math.max(-100, Math.min(100, k.reduce((a, b) => a + b, 0) / k.length)) : null,
                rated: k.length,
                total: u.length
            };
        }
        function fa(e, t, n) {
            return cuCat(e, t, n).value;
        }
        function ya(e, t, n, i) {
            if (null == i && e) for (const c of h) {
                const s = (c.subcategories || []).find(s => s === e);
                if (s) {
                    i = Un(c.name, s.name);
                    break;
                }
            }
            return smSub(e, t, n, i);
        }
        function ba(e) {
            const t = Math.round(Number(e) || 0);
            return t > 0 ? "+" + t : String(t);
        }
        function va(e, t = Vi()) {
            if (Rt) return "Rating value hidden in Blind match.";
            const n = Qi() ? Ua(e) : null;
            if (n) return `Heat map value: ${n.count} of ${n.total} overlaid profiles are into this.`;
            if (isCatId(e)) {
                const n = h.find(t => catId(t.name) === e);
                if (!n) return "Unrated.";
                const i = fa(n, t, "give"), a = fa(n, t, "receive"), o = [];
                return null !== i && o.push(`give ${ba(i)}`), null !== a && o.push(`receive ${ba(a)}`), o.length ? "Category values: " + o.join(" · ") + "." : "Unrated.";
            }
            const z = zn(e);
            if (z) {
                const g = sgSub(e), gv = g ? smSub(g, t, "give", e) : null, rv = g ? smSub(g, t, "receive", e) : null, a = [];
                return null !== gv && a.push(`give ${ba(gv)}`), null !== rv && a.push(`receive ${ba(rv)}`), a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
            }
            const i = ca(e, t), a = [];
            return i.giveKnown && a.push(`give ${ba(i.give)}`), i.receiveKnown && a.push(`receive ${ba(i.receive)}`), a.length ? "Rating values: " + a.join(" · ") + "." : "Unrated.";
        }
        function wa(e, t, n = Vi()) {
            return `${lo(t)} ${va(e, n)}`;
        }
        function ka(e, t, n = "", i = {}) {
            const a = [ t, n ].filter(Boolean).join(" "), r = i.tapFirst ? " data-tooltip-tap-first" : !1 === i.hoverOnly ? "" : " data-tooltip-hover-only";
            return ` data-ui-tooltip="${Hi(a)}" data-tooltip-name="${Hi(e || "Details")}" data-tooltip-definition="${Hi(t || "")}" data-tooltip-value="${Hi(n || "")}"${r}`;
        }
        function xa(e, t = Vi()) {
            return va(e, t).replace(/^(?:Category|Rating) values?:\s*/i, "").replace(/\.$/, "");
        }
        function Sa(e, t, n = Vi(), i = {}) {
            return ka(t?.label || "Topic", lo(t), xa(e, n), i);
        }
        function $a(e, t, n = Vi()) {
            const i = ei(e, t, n) || Jn(e, t, n), a = da(e, n);
            return `${i}. ${a[t + "Known"] ? `Rating ${ba(a[t])}.` : "Unrated."}`;
        }
        function Ea(e, t = {}, n = {}, i = {}) {
            const a = e.topics.map(e => Wn(e)).concat(Object.values(i || {}).filter(t => t && t.branch === e.name).map(e => e.id));
            let r = null;
            return a.forEach(e => {
                if (n && "favorite" === n[e]) return void (r = 100);
                const i = t && t[e];
                "number" == typeof i ? r = null === r ? Number(i) : Math.max(r, Number(i)) : i && "object" == typeof i && [ "give", "receive" ].forEach(e => {
                    Object.prototype.hasOwnProperty.call(i, e) && Number.isFinite(Number(i[e])) && (r = null === r ? Number(i[e]) : Math.max(r, Number(i[e])));
                });
            }), r;
        }
        function Aa(e) {
            // The popover runs Revealed (0) to Concealed (100), and the
            // number it shows is the minimum rating that stays visible.
            // Unrated topics have no rating, so they stay hidden whenever
            // the veil is on. A level of 83 hides a 73 and keeps a 93.
            return av(e);
        }
        function Ca(e, t = {}, n = {}) {
            if (n && "favorite" === n[e]) return 100;
            if (n && ("limit" === n[e] || "notinterested" === n[e])) return -100;
            const i = t && t[e], a = [];
            return "number" == typeof i && Number.isFinite(Number(i)) ? a.push(Number(i)) : i && "object" == typeof i && [ "give", "receive" ].forEach(e => {
                Object.prototype.hasOwnProperty.call(i, e) && Number.isFinite(Number(i[e])) && a.push(Number(i[e]));
            }), a.length ? Math.max(...a) : null;
        }
        function Ma(e, t) {
            const n = catId(e.name), i = ft[t], a = i && "group" === i.kind && Array.isArray(i.sourceIds) ? i.sourceIds.filter(e => vt[e] && vht[e]) : [];
            if (a.length) return a.every(t => {
                const i = Qe[t]?.[n];
                if ("favorite" === i) return !0;
                if ("limit" === i) return Aa(vpt[t]) <= -100;
                const a = Ea(e, vt[t], Qe[t], at[t]);
                return null !== a && a >= Aa(vpt[t]);
            });
            const r = i && "group" === i.kind && Array.isArray(i.sourceProfiles) ? i.sourceProfiles.filter(e => e && (e.veilEnabled ?? e.netEnabled)) : [];
            if (r.length) return r.every(t => {
                const i = t.annotations?.[n];
                if ("favorite" === i) return !0;
                if ("limit" === i) return Aa(null != t.veil ? t.veil : t.net) <= -100;
                const a = Ea(e, t.ratings, t.annotations, t.importedChildren);
                return null !== a && a >= Aa(null != t.veil ? t.veil : t.net);
            });
            const o = Qe[t]?.[n];
            if ("favorite" === o) return !0;
            if ("limit" === o) return Aa(vpt[t]) <= -100;
            const s = Ea(e, vt[t], Qe[t], at[t]);
            return null !== s && s >= Aa(vpt[t]);
        }
        function Ia(e = Mt) {
            const t = ft[e];
            if (t && "group" === t.kind) {
                const e = Array.isArray(t.sourceIds) ? t.sourceIds.filter(e => vt[e]) : [];
                return e.length ? e.some(e => vht[e]) : Array.isArray(t.sourceProfiles) && t.sourceProfiles.some(e => e && (e.veilEnabled ?? e.netEnabled));
            }
            return Boolean(vht[e] || $n);
        }
        function Pa(e, t) {
            const n = da(e, t), i = qn[e];
            if (!i || "Category" === i.kind || !i.parentId) return n;
            const a = da(i.parentId, t);
            return {
                give: n.giveKnown ? n.give : a.give,
                receive: n.receiveKnown ? n.receive : a.receive,
                giveKnown: n.giveKnown || a.giveKnown,
                receiveKnown: n.receiveKnown || a.receiveKnown
            };
        }
        function La(e, t, n) {
            // Per-topic pair classification now comes from the sync engine
            // v1.1 topic outcome for the pair (cached per render pass).
            const r = sxPairByIds(t, n), rec = r && r.topicsById[e];
            if (!rec) return "other";
            return "match" === rec.outcome ? "mutual" : "curious-fit" === rec.outcome ? "explore" : "conflict" === rec.outcome || "one-sided" === rec.outcome || "limit-blocked" === rec.outcome ? "mismatch" : "other";
        }
        function Ta() {
            const e = Yi();
            if (e.length >= 2) return e;
            const t = Kd(), n = Array.isArray(t?.sourceIds) ? t.sourceIds.filter(e => vt[e]) : [];
            return n.length >= 2 ? n : [];
        }
        function Fa() {
            return Ta().length >= 2 || Boolean(Kd());
        }

        // Phase 2: Semantic function bridge
        const sxIsVeilActive = Ia;
        const sxGetComparisonProfileIds = Ta;
        const sxIsComparisonActive = Fa;
        const sxGetTopicStance = ca;
        const sxGetTopicScore = Ca;
        const sxMapVeilThreshold = Aa;
        const sxGetActiveProfileOrDefault = Vi;
        const sxGetComparisonOutcome = di;
        const sxGetActiveOrComparisonProfiles = Xi;

        window.SexcapadesEngine = window.SexcapadesEngine || {};
        window.SexcapadesEngine.Profiles = {
            isVeilActive: sxIsVeilActive,
            getComparisonProfileIds: sxGetComparisonProfileIds,
            isComparisonActive: sxIsComparisonActive,
            getActiveProfileOrDefault: sxGetActiveProfileOrDefault,
            getActiveOrComparisonProfiles: sxGetActiveOrComparisonProfiles,
            getComparisonOutcome: sxGetComparisonOutcome,
            autoSelect: sxAutoSelect
        };
        window.SexcapadesEngine.Topics = {
            getStance: sxGetTopicStance,
            getScore: sxGetTopicScore,
            getVeilThreshold: sxMapVeilThreshold
        };
        function Na(e) {
            if (!Rt || isCatId(e)) return !1;
            const t = Ta();
            if (t.length >= 2) {
                for (let n = 0; n < t.length; n++) for (let i = n + 1; i < t.length; i++) if ("mutual" !== La(e, t[n], t[i])) return !1;
                return !0;
            }
            return "mutual" === di(e);
        }
        function _a() {
            const t = e.byId("blindModeSummary"), i = e.byId("blindModeHeading"), a = e.byId("blindModeList");
            if (!t || !i || !a) return;
            if (t.hidden = !Rt, !Rt) return void a.replaceChildren();
            const r = Rt ? Uc().filter(Na).map(e => {
                const t = qn[e] || Xn(e) || li().find(t => t.id === e);
                return t ? {
                    id: e,
                    label: t.label,
                    branch: t.branch
                } : null;
            }).filter(Boolean).sort((e, t) => e.branch.localeCompare(t.branch) || e.label.localeCompare(t.label)) : [];
            i.textContent = `You match on ${r.length} ${1 === r.length ? "topic" : "topics"}`, 
            n(a, r.length ? r.map(e => `<li><span>${Hi(e.label)}</span><small>${Hi(e.branch)}</small></li>`).join("") : "<li><span>No shared Want to do topics yet.</span></li>");
        }
        function Da() {
            const t = Fa(), n = e.byId("blindModeToggle"), i = an && Yi().length >= 2 && !Kd();
            i && "mutual" === Pt && (Pt = "all"), Rt && !t && (Rt = !1, Pt = Ot || "all"), document.body.classList.toggle("blind-mode", Rt), 
            n && (n.setAttribute("aria-pressed", String(Rt)), n.disabled = !t), e.all("[data-filter]").forEach(e => {
                const t = "mutual" === e.dataset.filter;
                // FQ2-BAKEIN: filter-chip tooltip below "shared Want to do topics" -> "shared Hot topics" (redundant trailing "topics" dropped: the new name already ends in "topics")
                e.disabled = Rt, e.setAttribute("aria-disabled", String(i && t)), t && e.setAttribute("data-ui-tooltip", i ? "Cast the selected profiles together first, or select a single profile, to score shared Hot topics." : "Show topics the selected profiles can enjoy together: one person wants to give what another wants to receive."), e.setAttribute("aria-pressed", String(Rt ? t : e.dataset.filter === Pt));
            }), _a();
        }
        function Ra(e) {
            if (Rt) return Na(e) ? "mutual" : "other";
            const t = di(e);
            if (t) return t;
            // Single-profile tab: classify by this profile's own ratings (Build 2026-10-17)
            const mt = Mt && ft[Mt];
            if (mt && "group" !== mt.kind && vt[Mt]) {
                return RaSingle(e, Mt);
            }
            const n = Qi() ? Xi() : Object.keys(wt), i = [];
            for (let t = 0; t < n.length; t++) for (let a = t + 1; a < n.length; a++) i.push(La(e, n[t], n[a]));
            return i.includes("mismatch") ? "mismatch" : i.includes("mutual") ? "mutual" : i.includes("explore") ? "explore" : "other";
        }
        function RaSingle(e, t) {
            // Classify a topic by a single profile's own ratings for individual-tab filters.
            // "mutual" = Want to do (green): strong want in either direction.
            // "explore" = Curious about (yellow): moderate interest.
            // "mismatch" = Mismatched (red): strong aversion or hard limit.
            if ("limit" === Qe[t]?.[e]) return "mismatch";
            const r = Pa(e, t), s = 35;
            if ((r.giveKnown && r.give > s) || (r.receiveKnown && r.receive > s)) return "mutual";
            if ((r.giveKnown && r.give <= -s) || (r.receiveKnown && r.receive <= -s)) return "mismatch";
            if ((r.giveKnown && r.give > 20) || (r.receiveKnown && r.receive > 20)) return "explore";
            return "other";
        }
        function Oa(e, t) {
            const n = Qe[t]?.[e];
            if (n) return n;
            const i = qn[e];
            return i && "Category" !== i.kind && (i.parentId && Qe[t]?.[i.parentId] || Qe[t]?.[catId(i.branch)]) || null;
        }
        function Ba(e, t, n) {
            if (Qe[t]?.[e] === n) return !0;
            const i = qn[e];
            return !(!i || "Category" === i.kind) && Boolean(i.parentId && Qe[t]?.[i.parentId] === n || Qe[t]?.[catId(i.branch)] === n);
        }
        function ja(e, t) {
            return Ba(e, t, "limit") || Ba(e, t, "notinterested");
        }
        function qa(e, t) {
            return (Qi() ? Xi() : [ Vi() ]).some(n => Boolean(t[n]?.[e]));
        }
        function Ha(e, t) {
            return Boolean(Je[t]?.[e]);
        }
        function Wa(e, t) {
            return Boolean(et[t]?.[e]);
        }
        function Ua(e) {
            const t = Xi(), n = 35;
            if (t.length < 3) return null;
            const i = t.filter(t => {
                if ("limit" === Oa(e, t)) return !1;
                const i = Pa(e, t);
                return i.giveKnown && i.give > n || i.receiveKnown && i.receive > n || "favorite" === Oa(e, t);
            }).length;
            if (!i) return null;
            const a = (i - 1) / Math.max(1, t.length - 1), r = [ 74, 158, 190 ], o = [ 255, 104, 91 ];
            return {
                count: i,
                total: t.length,
                color: `rgb(${Math.round(r[0] + (o[0] - r[0]) * a)},${Math.round(r[1] + (o[1] - r[1]) * a)},${Math.round(r[2] + (o[2] - r[2]) * a)})`
            };
        }
        Cn.addEventListener("pointerdown", sa, !0), Cn.addEventListener("keydown", sa, !0);
        /* ================= SpokeGeometry module — BEGIN ================= */
        /* ================================================================
           SpokeGeometry — spoke path geometry for the map renderer.
           (Refactor Step 3, Build 2026-10-18_0804: extracted from the Ga
           namespace, where taperedPath / flankPaths previously lived as
           methods. Ga.taperedPath and Ga.flankPaths remain as one-line
           delegates so any other caller keeps working; new code should
           call SpokeGeometry directly. Behavior is byte-identical to the
           pre-refactor Ga implementations — see the differential
           path-string test recorded in the build comment in index.html.)

           A "spoke" is the tapered band drawn from a parent node (the
           center node or a subcategory hub) out to a child node's icon.
           Two shapes are built here:

           - taperedPath: one filled band with a single color.
           - flankPaths: two filled bands ("flanks"), one per side of the
             centerline, so give and receive can carry different colors.

           Both shapes can hug two circles with concave arcs:

           - Tip circle (wraps the CHILD icon): when a valid tip circle
             is supplied, the flat tip edge is replaced by an arc that
             follows the icon's circumference. The two tip corners are
             projected radially onto the circle (corner -> ray from the
             circle center -> point at distance r), and the SVG arc is
             drawn between the projections with large-arc = 0. The sweep
             flag is chosen from the sign of the cross product of the two
             corner vectors (taken from the circle center), which selects
             the arc on the spoke-facing side of the circle — the short
             way around the back of the icon — never the arc that would
             cut through the icon disc.

           - Base circle (wraps the PARENT disc): symmetric trick at the
             other end. The base corners are projected radially onto the
             parent disc and joined by an arc along its circumference
             (same cross-product sweep rule), so the band's base follows
             the disc edge instead of cutting a flat chord across it.
             A base circle is ignored when the segment starts deep
             inside it (start within 0.5 * r of the disc center): those
             are center-drawn segments whose base is meant to stay
             buried under the parent node.

           All coordinates and lengths are in map units (SVG user units
           of the map viewBox). Widths are FULL widths: a corner is
           offset width / 2 to either side of the centerline.
           ================================================================ */
        const SpokeGeometry = (() => {
            /** Polyline samples per flank edge (matches the old Ga.SAMPLES). */
            const SAMPLES = 12;
            /** Flare falloff rate: flank width decays exponentially from base width to tip width along the spoke (matches the old Ga.FLARE_DECAY). */
            const FLARE_DECAY = 1;
            /** Narrow-tip cap: radius (map units) of the convex semicircular cap a near-zero-width tip earns. */
            const NARROW_TIP_CAP_RADIUS = 24;
            /** Narrow-tip cap: a narrow tip earns its cap only when the segment is longer than this (map units). */
            const NARROW_TIP_MIN_LENGTH = 25;
            /** Deep-start threshold: a base/tip disc is ignored when the segment starts closer than this fraction of the disc radius to its center. */
            const DEEP_START_FRACTION = 0.5;
            /**
             * Describe the straight segment from (x0, y0) to (x1, y1).
             * @param {number} x0 - Start x, map units.
             * @param {number} y0 - Start y, map units.
             * @param {number} x1 - End x, map units.
             * @param {number} y1 - End y, map units.
             * @returns {{x0:number, y0:number, x1:number, y1:number, dx:number, dy:number, len:number, ux:number, uy:number, nx:number, ny:number}}
             *   dx/dy = end - start; len = segment length (1 when degenerate);
             *   (ux, uy) = unit direction; (nx, ny) = unit normal (-uy, ux).
             */
            function segment(x0, y0, x1, y1) {
                const a = x1 - x0, r = y1 - y0, o = Math.hypot(a, r) || 1, s = a / o, l = r / o;
                return {
                    x0: x0,
                    y0: y0,
                    x1: x1,
                    y1: y1,
                    dx: a,
                    dy: r,
                    len: o,
                    ux: s,
                    uy: l,
                    nx: -l,
                    ny: s
                };
            }
            /**
             * Parse a spoke centerline path string of the form "M x0 y0 L x1 y1".
             * @param {string} d - SVG path data for the centerline.
             * @returns {object|null} A segment() descriptor, or null when the
             *   string does not match the expected M/L shape.
             */
            function parseSegment(d) {
                const t = String(d || "").match(/M\s*([\d.-]+)\s+([\d.-]+)\s+L\s*([\d.-]+)\s+([\d.-]+)/);
                return t ? segment(parseFloat(t[1]), parseFloat(t[2]), parseFloat(t[3]), parseFloat(t[4])) : null;
            }
            /**
             * Flank width at a fractional position along the spoke. The width
             * starts at the base width and decays exponentially toward the
             * tip width, so flanks flare wide at the base and settle fast.
             * @param {number} u - Fraction along the spoke: 0 at base, 1 at tip (unitless).
             * @param {number} baseWidth - Full width at the base, map units.
             * @param {number} tipWidth - Full width approached at the tip, map units.
             * @returns {number} Full width at u, map units.
             */
            function flareAt(u, baseWidth, tipWidth) {
                return tipWidth + (baseWidth - tipWidth) * Math.exp(-FLARE_DECAY * u);
            }
            /**
             * Build the tip circle for a spoke: the circle of the CHILD icon
             * that the spoke's tip arc hugs.
             *
             * Callers pass the spoke's drawn endpoint (x1, y1), which stops
             * (r - 1.5) map units short of the icon's center along the spoke
             * direction. This helper reconstructs the icon center by pushing
             * the endpoint that same distance further along the unit spoke
             * direction, so the returned circle IS the icon disc: its near
             * edge sits 1.5 units behind the drawn endpoint and the tip arc
             * wraps the icon's back edge.
             * @param {number} x0 - Spoke base x, map units.
             * @param {number} y0 - Spoke base y, map units.
             * @param {number} x1 - Spoke drawn endpoint (tip) x, map units.
             * @param {number} y1 - Spoke drawn endpoint (tip) y, map units.
             * @param {number} [iconSize] - Icon diameter, map units. Falsy or
             *   non-numeric values fall back to 48. The radius is clamped to
             *   at least 12.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildTipCircle(x0, y0, x1, y1, iconSize) {
                const tipSeg = segment(x0, y0, x1, y1), tipR = Math.max(12, (Number(iconSize) || 48) / 2), tipBack = Math.max(0, tipR - 1.5);
                return {
                    x: x1 + tipSeg.ux * tipBack,
                    y: y1 + tipSeg.uy * tipBack,
                    r: tipR
                };
            }
            /**
             * Build a base circle for a spoke: the PARENT disc that the
             * spoke's base arc hugs (the center node's disc for category
             * spokes, or a subcategory hub's disc for imported-child
             * spokes). A plain {x, y, r} factory so call sites name the
             * intent instead of inlining an anonymous circle object.
             * @param {number} cx - Disc center x, map units.
             * @param {number} cy - Disc center y, map units.
             * @param {number} r - Disc radius, map units.
             * @returns {{x:number, y:number, r:number}} Circle {center x, center y, radius} in map units.
             */
            function buildBaseCircle(cx, cy, r) {
                return {
                    x: cx,
                    y: cy,
                    r: r
                };
            }
            /**
             * Build a single-color tapered spoke band as SVG path data.
             *
             * Outline order: start at one base corner, run to the same-side
             * tip corner, cross the tip, come back down the other side, and
             * cross the base (the Z close). Both crossings are replaceable
             * by concave circle arcs (see the module header):
             * - Tip: when tipCircle is a valid circle (r > 0), the path first steps
             *   from the tip corner to its radial projection on the tip
             *   circle, arcs along the circumference to the other corner's
             *   projection (sweep from the cross-product sign, spoke-facing
             *   side), and continues. With no valid circle the tip stays a
             *   flat edge between the two tip corners.
             * - Narrow tip: when tipWidth <= 0.5 and the segment is longer
             *   than NARROW_TIP_MIN_LENGTH (25 units), the tip instead gets
             *   a CONVEX semicircular cap of radius NARROW_TIP_CAP_RADIUS
             *   (24) around the endpoint (this branch wins over the
             *   tip-circle arc; it is how zero-width heat spokes round off).
             * - Base: when baseCircle is a valid disc and the segment does
             *   not start deep inside it (start at least
             *   DEEP_START_FRACTION * baseCircle.r from the disc center),
             *   the path starts and ends on the base corners' projections
             *   onto the disc and the closing edge is an arc along the
             *   disc; otherwise the base stays flat.
             * @param {string} pathData - Centerline path string "M x0 y0 L x1 y1", map units. Returned unchanged when unparseable.
             * @param {number} baseWidth - Base width, map units (corners offset +/- baseWidth/2 from the centerline).
             * @param {number} tipWidth - Tip width, map units (corners offset +/- tipWidth/2).
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon), from buildTipCircle. Null/invalid = flat tip.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base disc (parent), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @returns {string} SVG path data for the filled band.
             */
            function taperedPath(pathData, baseWidth, tipWidth, tipCircle = null, baseCircle = null) {
                const i = parseSegment(pathData);
                if (!i) return pathData;
                const {x0: a, y0: r, x1: o, y1: s, nx: l, ny: c} = i, d = r + c * baseWidth / 2, u = a - l * baseWidth / 2, p = r - c * baseWidth / 2, h = o - l * tipWidth / 2, g = s - c * tipWidth / 2, m = o + l * tipWidth / 2, f = s + c * tipWidth / 2;
                // Build 2026-10-18_0343: optional base disc (baseCircle) — the
                // flat base edge is replaced by an arc along the disc,
                // mirroring the tip arc: both base corners are projected onto
                // the disc and the path starts/ends on the projections, so
                // the band hugs the parent circle. Ignored for center-drawn
                // segments.
                const zbP = baseCircle && baseCircle.r > 0 && Math.hypot(a - baseCircle.x, r - baseCircle.y) >= DEEP_START_FRACTION * baseCircle.r ? function() {
                    const v1 = { x: a + l * baseWidth / 2 - baseCircle.x, y: d - baseCircle.y }, v2 = { x: u - baseCircle.x, y: p - baseCircle.y }, m1 = Math.hypot(v1.x, v1.y) || 1, m2 = Math.hypot(v2.x, v2.y) || 1, q1 = { x: baseCircle.x + baseCircle.r * v1.x / m1, y: baseCircle.y + baseCircle.r * v1.y / m1 }, q2 = { x: baseCircle.x + baseCircle.r * v2.x / m2, y: baseCircle.y + baseCircle.r * v2.y / m2 }, crx = v2.x * v1.y - v2.y * v1.x;
                    return { q1: q1, q2: q2, swp: crx >= 0 ? 1 : 0 };
                }() : null, bSX = zbP ? zbP.q1.x : a + l * baseWidth / 2, bSY = zbP ? zbP.q1.y : d, bTail = zbP ? ` L ${zbP.q2.x.toFixed(2)} ${zbP.q2.y.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${zbP.swp} ${zbP.q1.x.toFixed(2)} ${zbP.q1.y.toFixed(2)} Z` : ` L ${u.toFixed(2)} ${p.toFixed(2)} Z`;
                if (tipWidth <= .5) {
                    const dx = o - a, dy = s - r, L = Math.hypot(dx, dy);
                    if (L > NARROW_TIP_MIN_LENGTH) {
                        const R = NARROW_TIP_CAP_RADIUS, ux = dx / L, uy = dy / L, ex = o - ux * R, ey = s - uy * R, wE = (baseWidth + (tipWidth - baseWidth) * (L - R) / L) / 2, c1x = ex + l * wE, c1y = ey + c * wE, c2x = ex - l * wE, c2y = ey - c * wE, d1 = Math.hypot(c1x - o, c1y - s) || 1, d2 = Math.hypot(c2x - o, c2y - s) || 1, p1x = o + R * (c1x - o) / d1, p1y = s + R * (c1y - s) / d1, p2x = o + R * (c2x - o) / d2, p2y = s + R * (c2y - s) / d2, cross = (p1x - o) * (p2y - s) - (p1y - s) * (p2x - o), sweep = cross >= 0 ? 1 : 0;
                        return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${R} ${R} 0 0 ${sweep} ${p2x.toFixed(2)} ${p2y.toFixed(2)}${bTail}`;
                    }
                }
                if (tipCircle && tipCircle.r > 0) {
                    const sv = {
                        x: m - tipCircle.x,
                        y: f - tipCircle.y
                    }, ev = {
                        x: h - tipCircle.x,
                        y: g - tipCircle.y
                    }, sm2 = Math.hypot(sv.x, sv.y) || 1, em2 = Math.hypot(ev.x, ev.y) || 1, spx = tipCircle.x + tipCircle.r * sv.x / sm2, spy = tipCircle.y + tipCircle.r * sv.y / sm2, epx = tipCircle.x + tipCircle.r * ev.x / em2, epy = tipCircle.y + tipCircle.r * ev.y / em2, crx = sv.x * ev.y - sv.y * ev.x, swp = crx >= 0 ? 1 : 0;
                    return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${spx.toFixed(2)} ${spy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${swp} ${epx.toFixed(2)} ${epy.toFixed(2)}${bTail}`;
                }
                return `M ${bSX.toFixed(2)} ${bSY.toFixed(2)} L ${m.toFixed(2)} ${f.toFixed(2)} L ${h.toFixed(2)} ${g.toFixed(2)}${bTail}`;
            }
            /**
             * Build the split give/receive flank bands for one spoke, as SVG
             * path data. Each flank is one side of the spoke: an OUTER edge
             * that flares from the base width toward the tip width (see
             * flareAt, sampled at SAMPLES + 1 points) and an INNER edge at
             * the fixed inner half-width innerHalf, so the two flanks leave
             * the center stripe (half-width stripeHalf) uncovered for the
             * midline.
             *
             * Emission order — what "first" means in the mode string: the
             * mode names which EDGE POLYLINE IS EMITTED FIRST in each
             * flank's path string.
             * - "innerFirst" (branch spokes: category and subcategory
             *   spokes drawn by the Ka renderer): each flank starts with
             *   its INNER edge polyline running base -> tip, then the tip
             *   arc (inner offset innerHalf out to the flared tip offset),
             *   then the OUTER edge polyline reversed (tip -> base), then
             *   the base arc (flared base offset in to inner offset
             *   innerHalf).
             * - "outerFirst" (kink spokes drawn by renderKinkLine): each
             *   flank starts with its OUTER edge polyline running
             *   base -> tip, then the tip arc (flared tip offset in to
             *   inner offset innerHalf), then a freshly built INNER edge
             *   polyline running tip -> base, then the base arc (inner
             *   offset innerHalf out to the flared base offset).
             * The two modes trace the same outline in opposite orders with
             * the arc connections mirrored; which one a spoke uses is
             * fixed by its renderer and level, and both produce the same
             * filled region.
             *
             * Circle hugging (see the module header for the general
             * mechanics): the base circle baseCircle, when valid and the
             * segment does not start deep inside it (start at least
             * DEEP_START_FRACTION * baseCircle.r from its center), first
             * pulls all four base corner points
             * radially onto the disc so the flanks themselves start on
             * the disc edge, and the base crossing is emitted as an arc
             * along the disc by the b() helper (skipped when the two
             * offsets are effectively equal). The tip circle tipCircle likewise
             * turns each flank's tip crossing into an arc along the icon
             * circumference via the bE() helper. Both helpers project the
             * crossing's endpoints onto their circle and pick the sweep
             * flag from the cross-product sign, so the arc always runs
             * along the spoke-facing side of the circle.
             * @param {number} baseX - Base point x, map units.
             * @param {number} baseY - Base point y, map units.
             * @param {number} dx - Base->tip delta x, map units. Tip point = (baseX + dx, baseY + dy).
             * @param {number} dy - Base->tip delta y, map units.
             * @param {number} nx - Unit normal x, unitless. Corners are offset along (nx, ny).
             * @param {number} ny - Unit normal y, unitless.
             * @param {number} baseWidth - Base width, map units: the flare's starting full width.
             * @param {number} tipWidth - Tip width, map units: the flare's limiting full width.
             * @param {number} innerHalf - Inner half-width, map units: fixed offset of each flank's inner edge from the centerline.
             * @param {number} stripeHalf - Center stripe half-width, map units: the flared edge offset is max(innerHalf, stripeHalf + flare / 2) so a flank never crosses the midline stripe.
             * @param {string} mode - Mode: "innerFirst" (branch spokes) or "outerFirst" (kink spokes). Any other value takes the outerFirst branch.
             * @param {{x:number, y:number, r:number}} [baseCircle=null] - Base circle (parent disc), from buildBaseCircle. Null/invalid/deep-start = flat base.
             * @param {{x:number, y:number, r:number}} [tipCircle=null] - Tip circle (child icon). Null/invalid = flat tip crossing.
             * @returns {{top: string, bottom: string}} SVG path data for the two flanks: "top" is the (nx, ny)-negative side, "bottom" the positive side.
             */
            function flankPaths(baseX, baseY, dx, dy, nx, ny, baseWidth, tipWidth, innerHalf, stripeHalf, mode, baseCircle = null, tipCircle = null) {
                const p = SAMPLES, h = [], g = [], m = [], f = [];
                for (let si = 0; si <= p; si++) {
                    const frac = si / p, y = Math.max(innerHalf, stripeHalf + flareAt(frac, baseWidth, tipWidth) / 2), b = baseX + dx * frac, v = baseY + dy * frac;
                    h.push(`${(b - nx * y).toFixed(2)} ${(v - ny * y).toFixed(2)}`), g.push(`${(b - nx * innerHalf).toFixed(2)} ${(v - ny * innerHalf).toFixed(2)}`),
                    m.push(`${(b + nx * y).toFixed(2)} ${(v + ny * y).toFixed(2)}`), f.push(`${(b + nx * innerHalf).toFixed(2)} ${(v + ny * innerHalf).toFixed(2)}`);
                }
                // Build 2026-10-18_0343: spoke bases hug the parent disc. The
                // base-arc helper below only capped the base edge between the
                // corners' projections — the flank corners themselves stayed
                // outside the disc, joined by radial stubs that poked past
                // the circle. Now the four base corner points are projected
                // onto the base circle first, so the flanks themselves start
                // on the disc edge and the base follows the circle exactly.
                // A base circle is ignored when the segment starts deep
                // inside it (center-drawn segments keep the old flat base).
                baseCircle && baseCircle.r > 0 && Math.hypot(baseX - baseCircle.x, baseY - baseCircle.y) < DEEP_START_FRACTION * baseCircle.r && (baseCircle = null);
                if (baseCircle && baseCircle.r > 0) {
                    const pj = (e2, t2) => {
                        const n2 = e2 - baseCircle.x, i2 = t2 - baseCircle.y, a2 = Math.hypot(n2, i2) || 1;
                        return `${(baseCircle.x + baseCircle.r * n2 / a2).toFixed(2)} ${(baseCircle.y + baseCircle.r * i2 / a2).toFixed(2)}`;
                    }, y0 = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2);
                    h[0] = pj(baseX - nx * y0, baseY - ny * y0), g[0] = pj(baseX - nx * innerHalf, baseY - ny * innerHalf), m[0] = pj(baseX + nx * y0, baseY + ny * y0), f[0] = pj(baseX + nx * innerHalf, baseY + ny * innerHalf);
                }
                const y = Math.max(innerHalf, stripeHalf + flareAt(0, baseWidth, tipWidth) / 2), b = (side, startOff, endOff) => {
                    if (!baseCircle || !(baseCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + side * nx * startOff - baseCircle.x, y: baseY + side * ny * startOff - baseCircle.y}, end = {x: baseX + side * nx * endOff - baseCircle.x, y: baseY + side * ny * endOff - baseCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = baseCircle.x + baseCircle.r * start.x / sm, sy = baseCircle.y + baseCircle.r * start.y / sm, ex = baseCircle.x + baseCircle.r * end.x / em, ey = baseCircle.y + baseCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${baseCircle.r.toFixed(2)} ${baseCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                const yE = Math.max(innerHalf, stripeHalf + flareAt(1, baseWidth, tipWidth) / 2), bE = (side, startOff, endOff) => {
                    if (!tipCircle || !(tipCircle.r > 0) || Math.abs(endOff - startOff) < .01) return "";
                    const start = {x: baseX + dx + side * nx * startOff - tipCircle.x, y: baseY + dy + side * ny * startOff - tipCircle.y}, end = {x: baseX + dx + side * nx * endOff - tipCircle.x, y: baseY + dy + side * ny * endOff - tipCircle.y}, sm = Math.hypot(start.x, start.y) || 1, em = Math.hypot(end.x, end.y) || 1, sx = tipCircle.x + tipCircle.r * start.x / sm, sy = tipCircle.y + tipCircle.r * start.y / sm, ex = tipCircle.x + tipCircle.r * end.x / em, ey = tipCircle.y + tipCircle.r * end.y / em, cross = start.x * end.y - start.y * end.x, sweep = cross >= 0 ? 1 : 0;
                    return ` L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${tipCircle.r.toFixed(2)} ${tipCircle.r.toFixed(2)} 0 0 ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
                };
                if ("innerFirst" === mode) return {
                    top: `M ${g.join(" L ")}${bE(-1, innerHalf, yE)} L ${h.slice().reverse().join(" L ")}${b(-1, y, innerHalf)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${f.slice().reverse().join(" L ")}${b(1, innerHalf, y)} Z`
                };
                const v = [], w = [];
                for (let si = p; si >= 0; si--) {
                    const px = baseX + dx * (si / p), py = baseY + dy * (si / p);
                    v.push(`${(px - nx * innerHalf).toFixed(2)} ${(py - ny * innerHalf).toFixed(2)}`), w.push(`${(px + nx * innerHalf).toFixed(2)} ${(py + ny * innerHalf).toFixed(2)}`);
                }
                baseCircle && baseCircle.r > 0 && (v[v.length - 1] = g[0], w[w.length - 1] = f[0]);
                return {
                    top: `M ${h.join(" L ")}${bE(-1, yE, innerHalf)} L ${v.join(" L ")}${b(-1, innerHalf, y)} Z`,
                    bottom: `M ${m.join(" L ")}${bE(1, yE, innerHalf)} L ${w.join(" L ")}${b(1, innerHalf, y)} Z`
                };
            }
            /**
             * Numeric unit tests for the circle-hugging geometry. Runnable
             * in the browser console / probe harness via
             * SpokeGeometry.runGeometryTests(), or in node by extracting this
             * module (between its BEGIN/END delimiters) and calling the
             * same function. Verifies, for both taperedPath and
             * flankPaths (innerFirst and outerFirst):
             * - every arc endpoint lies ON its circle (distance from the
             *   circle center == r, within rounding epsilon);
             * - concavity: a tip arc's midpoint sits BEHIND its chord
             *   midpoint (toward the spoke base), and a base arc's
             *   midpoint sits beyond its chord midpoint (toward the spoke
             *   tip) — i.e. each arc bows around its circle, not across it;
             * - the sweep flag routes the arc through that spoke-facing
             *   midpoint (the minor arc on the circle's spoke side), not
             *   through the through-icon antipode.
             * @returns {{passed:number, failed:number, failures:string[]}} Test tally; failures names each failed check.
             */
            function runGeometryTests() {
                const EPS = .025;
                let passed = 0;
                const failures = [];
                const check = (name, cond) => { cond ? passed++ : failures.push(name); };
                const distTo = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);
                const arcsOf = d => {
                    const out = [], re = /([ML])\s*([\d.-]+)\s+([\d.-]+)|A\s+([\d.]+)\s+[\d.]+\s+0\s+0\s+([01])\s+([\d.-]+)\s+([\d.-]+)/g;
                    let m, cur = null;
                    while ((m = re.exec(d))) {
                        if (m[1]) cur = { x: +m[2], y: +m[3] };
                        else if (cur) out.push({ r: +m[4], sweep: +m[5], x1: cur.x, y1: cur.y, x2: +m[6], y2: +m[7] }), cur = { x: +m[6], y: +m[7] };
                    }
                    return out;
                };
                const arcMid = (arc, c) => {
                    const a1 = Math.atan2(arc.y1 - c.y, arc.x1 - c.x), a2 = Math.atan2(arc.y2 - c.y, arc.x2 - c.x);
                    let sx = Math.cos(a1) + Math.cos(a2), sy = Math.sin(a1) + Math.sin(a2);
                    const m = Math.hypot(sx, sy) || 1;
                    return { x: c.x + c.r * sx / m, y: c.y + c.r * sy / m, a1: a1, a2: a2, amid: Math.atan2(sy, sx) };
                };
                const onSweptArc = (a1, amid, a2, sweep) => {
                    const TAU = Math.PI * 2, norm = x => ((x % TAU) + TAU) % TAU;
                    return sweep === 1 ? norm(amid - a1) <= norm(a2 - a1) + 1e-9 : norm(a1 - amid) <= norm(a1 - a2) + 1e-9;
                };
                const checkArc = (label, arc, circle, towardBase) => {
                    check(label + ": arc radius matches circle", Math.abs(arc.r - circle.r) < .01);
                    check(label + ": start point on circle", Math.abs(distTo(arc.x1, arc.y1, circle.x, circle.y) - circle.r) < EPS);
                    check(label + ": end point on circle", Math.abs(distTo(arc.x2, arc.y2, circle.x, circle.y) - circle.r) < EPS);
                    const mid = arcMid(arc, circle), chordX = (arc.x1 + arc.x2) / 2;
                    check(label + (towardBase ? ": arc midpoint behind chord (toward base)" : ": arc midpoint beyond chord (toward tip)"), towardBase ? mid.x < chordX - .05 : mid.x > chordX + .05);
                    check(label + ": sweep routes through spoke-facing midpoint", onSweptArc(mid.a1, mid.amid, mid.a2, arc.sweep));
                };
                // buildTipCircle / buildBaseCircle construction.
                const tc = buildTipCircle(0, 0, 100, 0, 48);
                check("buildTipCircle: radius is iconSize / 2", tc.r === 24);
                check("buildTipCircle: center is endpoint + unit * (r - 1.5)", Math.abs(tc.x - 122.5) < 1e-9 && Math.abs(tc.y) < 1e-9);
                const tcDefault = buildTipCircle(0, 0, 0, 50);
                check("buildTipCircle: default icon size 48", tcDefault.r === 24 && Math.abs(tcDefault.x) < 1e-9 && Math.abs(tcDefault.y - 72.5) < 1e-9);
                const tcMin = buildTipCircle(0, 0, 10, 0, 10);
                check("buildTipCircle: radius clamps to >= 12", tcMin.r === 12 && Math.abs(tcMin.x - 20.5) < 1e-9);
                const bc0 = buildBaseCircle(3, 4, 30);
                check("buildBaseCircle: passes {x, y, r} through", bc0.x === 3 && bc0.y === 4 && bc0.r === 30);
                // taperedPath tip arc (horizontal spoke, tip circle from buildTipCircle).
                const dTip = taperedPath("M 0 0 L 100 0", 20, 20, tc, null), aTip = arcsOf(dTip);
                check("taperedPath tip: exactly one arc", aTip.length === 1);
                aTip.length && checkArc("taperedPath tip", aTip[0], tc, !0);
                // taperedPath base arc (segment starts outside the disc).
                const bcBig = buildBaseCircle(0, 0, 30), dBase = taperedPath("M 40 0 L 140 0", 20, 10, null, bcBig), aBase = arcsOf(dBase);
                check("taperedPath base: exactly one arc", aBase.length === 1);
                aBase.length && checkArc("taperedPath base", aBase[0], bcBig, !1);
                // taperedPath guards: deep-inside base and no circles stay flat; invalid tip circle ignored.
                check("taperedPath base: center-drawn segment keeps flat base", !taperedPath("M 0 0 L 100 0", 20, 10, null, bcBig).includes(" A "));
                check("taperedPath: no circles means no arcs", !taperedPath("M 0 0 L 100 0", 20, 10).includes(" A "));
                check("taperedPath: r = 0 tip circle ignored", !taperedPath("M 0 0 L 100 0", 20, 10, { x: 100, y: 0, r: 0 }, null).includes(" A "));
                check("taperedPath: unparseable path returned unchanged", taperedPath("junk", 20, 10) === "junk");
                // taperedPath narrow-tip convex cap: arc of radius 24 around the endpoint.
                const aCap = arcsOf(taperedPath("M 0 0 L 100 0", 20, 0, null, null));
                check("taperedPath cap: exactly one arc of radius 24", aCap.length === 1 && aCap[0].r === 24);
                aCap.length && check("taperedPath cap: endpoints on the cap circle", Math.abs(distTo(aCap[0].x1, aCap[0].y1, 100, 0) - 24) < EPS && Math.abs(distTo(aCap[0].x2, aCap[0].y2, 100, 0) - 24) < EPS);
                // flankPaths: base disc off-center, tip circle offset past the tip point (as buildTipCircle returns).
                const fBase = buildBaseCircle(0, 0, 25), fTip = { x: 152.5, y: 0, r: 26 };
                const flankArgs = [ 30, 0, 100, 0, 0, 1, 60, 10, 5, 2 ];
                for (const mode of [ "innerFirst", "outerFirst" ]) {
                    const res = flankPaths(...flankArgs, mode, fBase, fTip), aTop = arcsOf(res.top), aBot = arcsOf(res.bottom);
                    check(`flankPaths ${mode}: two arcs per flank (tip + base)`, aTop.length === 2 && aBot.length === 2);
                    if (aTop.length === 2) {
                        checkArc(`flankPaths ${mode} top tip`, aTop[0], fTip, !0);
                        checkArc(`flankPaths ${mode} top base`, aTop[1], fBase, !1);
                    }
                    if (aBot.length === 2) {
                        checkArc(`flankPaths ${mode} bottom tip`, aBot[0], fTip, !0);
                        checkArc(`flankPaths ${mode} bottom base`, aBot[1], fBase, !1);
                    }
                    if (aTop.length && aBot.length) {
                        const mirrorPt = (ax, ay, bx, by) => Math.abs(ax - bx) < .011 && Math.abs(ay + by) < .011;
                        check(`flankPaths ${mode}: bottom tip arc mirrors top across the centerline`, (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x1, aTop[0].y1) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x2, aTop[0].y2)) || (mirrorPt(aBot[0].x1, aBot[0].y1, aTop[0].x2, aTop[0].y2) && mirrorPt(aBot[0].x2, aBot[0].y2, aTop[0].x1, aTop[0].y1)));
                    }
                    const first = /^M ([\d.-]+) ([\d.-]+)/.exec(res.top);
                    check(`flankPaths ${mode}: first flank point projected onto base disc`, !!first && Math.abs(distTo(+first[1], +first[2], fBase.x, fBase.y) - fBase.r) < EPS);
                    const bare = flankPaths(...flankArgs, mode, null, null);
                    check(`flankPaths ${mode}: no circles means no arcs`, !bare.top.includes(" A ") && !bare.bottom.includes(" A "));
                }
                return { passed: passed, failed: failures.length, failures: failures };
            }
            return Object.freeze({
                SAMPLES: SAMPLES,
                FLARE_DECAY: FLARE_DECAY,
                segment: segment,
                parseSegment: parseSegment,
                flareAt: flareAt,
                buildTipCircle: buildTipCircle,
                buildBaseCircle: buildBaseCircle,
                taperedPath: taperedPath,
                flankPaths: flankPaths,
                runGeometryTests: runGeometryTests
            });
        })();
        window.SpokeGeometry = SpokeGeometry;
        /* ================= SpokeGeometry module — END ================= */
        const Ga = Object.freeze({
            WIDTH: 18,
            TIP_FRACTION: 0,
            OUTLINE_EXTRA: 1.25,
            OUTLINE_COLOR: "#f5f5f5",
            CLOUD_OUTLINE_WIDTH: (e, depth) => Ga.outlineWidth(e, depth),
            NO_CODE_COLOR: "#78817e",
            FALLBACK_COLOR: "#646d66",
            parseSegment(e) {
                // Delegate: the implementation lives in SpokeGeometry.parseSegment (see the SpokeGeometry module above); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.parseSegment(e);
            },
            segment(e, t, n, i) {
                // Delegate: the implementation lives in SpokeGeometry.segment (same descriptor shape); this keeps the Ga API stable for remaining callers.
                return SpokeGeometry.segment(e, t, n, i);
            },
            trimToIcons(e, t, n, i, a, r) {
                const o = Ga.segment(e, t, n, i);
                return {
                    seg: o,
                    sx0: e + o.ux * a,
                    sy0: t + o.uy * a,
                    sx1: n - o.ux * r,
                    sy1: i - o.uy * r
                };
            },
            // tipWidth has no SpokeGeometry counterpart (the module takes tip
            // widths as plain arguments); TIP_FRACTION is 0, so this is
            // always 0 — kept as the Ga-side width rule for heat spokes.
            tipWidth: e => e * Ga.TIP_FRACTION,
            flareAt: (e, t, n) => SpokeGeometry.flareAt(e, t, n),
            heatWidths(e, depth) {
                const t = Math.max(e + 8, 18) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3);
                return {
                    w0: t,
                    w1: .25 * t
                };
            },
            categoryBaseWidth: (e, t, n) => Za.categoryTaperBaseWidth(e, t, n),
            spokeBaseWidth: e => 5 * e,
            railsBaseWidth: (e, t, n, i, depth) => (isCatId(e) ? Ga.categoryBaseWidth(t, n, i) : Ga.spokeBaseWidth(t)) * (mapFontScale() * (null == depth ? 1 : sxFontFactor(depth)) / 3),
            cloudBaseWidth(e, t) {
                const n = Math.max(1, Number(t) || 1), i = e / 2 * er.spread;
                return Math.max(8, i / Math.max(n, 6));
            },
            outlineWidth: (e, depth) => { const f = null == depth ? 1 : sxFontFactor(depth); return midlineStrokeWidth() * f + 16 * (mapFontScale() * f / 3); },
            // splitInnerHalf is half the outline width above, so a
            // future outline-width change cannot silently strand it.
            splitInnerHalf: (e, depth) => Ga.outlineWidth(e, depth) / 2,
            midlineOutlinePath: (e, t, n, depth) => n ? "" : `<path class="hanky-midline-outline" d="${e}" fill="none" stroke="${Ga.OUTLINE_COLOR}" stroke-width="${Ga.outlineWidth(t, depth)}" stroke-linecap="butt" opacity="0.9" pointer-events="none"/>`,
            dashAttr: e => ` stroke-dasharray="${e} ${.66 * e}"`,
            taperedPath(e, t, n, z = null, zb = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.taperedPath (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.taperedPath(e, t, n, z, zb);
            },
            flankPaths(e, t, n, i, a, r, o, s, l, c, d, u = null, z = null) {
                // Refactor Step 3 (Build 2026-10-18_0804): implementation lives in SpokeGeometry.flankPaths (see the SpokeGeometry module above); this delegate keeps the Ga API stable for any remaining caller.
                return SpokeGeometry.flankPaths(e, t, n, i, a, r, o, s, l, c, d, u, z);
            }
        });
        // Selection marking — the single authority (map-render refactor,
        // finding 5). selectionMarkKind(spokeId, selectedId, record)
        // decides whether a spoke carries the .selected-spoke mark for a
        // selection, and where the mark lives:
        //   "own"    — the selected node's own spoke (and a selected
        //              topic's parent spoke): the mark lives in that
        //              spoke's node group.
        //   "branch" — the branch spoke (cat-<slug of record.branch>):
        //              the mark lives in the branch line-group underlay
        //              item (.spoke-underlay-item[data-spoke-for=...]).
        //   null     — no mark. A subcategory carries no mark of its own:
        //              its line is drawn by renderKinkLine, which stamps
        //              no highlight, so selecting a subcategory marks
        //              only its branch's line.
        // Ka consults this while rendering (it marks the spokes it
        // builds; the render's underlay pass then moves the branch
        // spoke's visuals, mark included, into the underlay item), and
        // applySelectionMarking consults the same function to reproduce
        // exactly that end state on the existing DOM without a
        // re-render. Selection semantics change HERE only.
        function selectionMarkKind(spokeId, selectedId, record) {
            if (!spokeId || !selectedId) return null;
            const branchCatId = record && record.branch ? catId(record.branch) : null;
            if (branchCatId && spokeId === branchCatId) return "branch";
            if (spokeId === selectedId) return record && "Subcategory" === record.kind ? null : "own";
            if (record && spokeId === record.parentId) return "own";
            return null;
        }
        function Ka(e, t, n, i, a, r, o, s, l, c, d, u = 48, p = Ga.FALLBACK_COLOR, g = !0, m = "", f = null, y = null, b = null, v = !1, w = !0, k = h.length, bc = null, sxLeafD = null, sxDepth = null) {
            Ra(e);
            const sxD = null != sxDepth ? sxDepth : sxLeafD === sxIconDiameter(1) ? 1 : sxLeafD === sxIconDiameter(3) ? 3 : 2, sxF = sxFontFactor(sxD), sxSW = sxStrokeWidth(sxD);
            const x = Rt || Qi() ? null : Vi(), S = Rt ? null : x || function(e) {
                const t = Vi();
                return Qi() && t && (at[t] || {})[e] && gn.has(oi(t, e)) ? t : null;
            }(e), $ = Ge(e, S || Vi()), E = e => `translate(${(a * e).toFixed(2)} ${(r * e).toFixed(2)})`, A = e.replace(/[^a-z0-9-]/g, ""), C = Boolean(topicLabelById[e]), M = S || Vi(), I = qn[e] || Xn(e) || {
                id: e,
                label: i,
                branch: i,
                kind: C ? "Topic" : "Category"
            }, P = (wa(e, I, M), da(e, M)), L = $a(e, "give", M), T = $a(e, "receive", M), F = Sa(e, I, M), N = ka(i, L, P.giveKnown ? ba(P.give) : "Unrated", { tapFirst: !0 }), _ = ka(i, T, P.receiveKnown ? ba(P.receive) : "Unrated", { tapFirst: !0 });
            let D = "";
            const R = g && !Rt ? Ua(e) : null, O = Ga.heatWidths(n, sxD);
            if (SpokeGeometry.taperedPath(t, O.w0, O.w1), R) {
                const overlayTip = "Overlaid profiles into this topic", a = `${R.count}/${R.total}`;
                D += `<path class="group-heat${R.count === R.total ? " all-in" : ""}" d="${t}" stroke="${R.color}" stroke-width="${O.w0}" opacity="${(.2 + .48 * R.count / R.total).toFixed(2)}" tabindex="0" role="img" aria-label="${Hi(`${i}: ${a} overlaid profiles into this topic`)}"${ka(i, overlayTip, a, {
                    hoverOnly: !1
                })}/>`;
            }
            selectionMarkKind(e, Lt, Lt ? qn[Lt] || Xn(Lt) || (at[Vi()] || {})[Lt] : null) && (D += `<path class="selected-spoke" d="${t}" vector-effect="non-scaling-stroke" stroke-width="14" aria-hidden="true"/>`);
            const B = m ? ` ${m}` : "", j = Math.hypot(o - pr.centerX, s - pr.centerY), q = Ga.railsBaseWidth(e, n, j, k, sxD), H = Ga.tipWidth(n);
            const tipCircle = SpokeGeometry.buildTipCircle(o, s, l, c, null != sxLeafD ? sxLeafD : u * mapFontScale());
            let W = "";
            if (w) if (w && f && y) {
                const seg = Ga.segment(o, s, l, c), i = sxSW, a = Ga.splitInnerHalf(n, sxD), r = SpokeGeometry.flankPaths(o, s, seg.dx, seg.dy, seg.nx, seg.ny, q, H, a, a, "innerFirst", bc, tipCircle), d = b || p || Ga.FALLBACK_COLOR, u = Ga.midlineOutlinePath(t, n, v, sxD);
                W = `<path class="tapered-stem${B}" d="${r.top}" fill="${f}" stroke="none" style="fill:${f}"${N}/><path class="tapered-stem${B}" d="${r.bottom}" fill="${y}" stroke="none" style="fill:${y}"${_}/>` + (v ? `<path class="hanky-midline hanky-none" d="${t}" fill="none" stroke="${Ga.FALLBACK_COLOR}" stroke-width="${i}" stroke-linecap="butt"${Ga.dashAttr(i)} opacity="0.85"${F}/>` : u + `<path class="hanky-midline" d="${t}" fill="none" stroke="${d}" stroke-width="${i}" stroke-linecap="butt" opacity="0.9"${F}/>`);
            } else {
                const taperedD = SpokeGeometry.taperedPath(t, q, H, tipCircle, bc), i = sxSW, a = v ? Ga.FALLBACK_COLOR : b || p || Ga.FALLBACK_COLOR, r = v ? Ga.dashAttr(i) : "";
                W = `<path class="tapered-stem${B}" d="${taperedD}" fill="${p}" stroke="none" style="fill:${p}"/><path class="hanky-midline" d="${t}" fill="none" stroke="${a}" stroke-width="${i}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            } else {
                const stemW = 1.3 * (n || 8), i = v ? Ga.NO_CODE_COLOR : b || p || Ga.NO_CODE_COLOR, a = Ga.midlineOutlinePath(t, n, v, sxD), r = v ? Ga.dashAttr(stemW) : "";
                W = a + `<path class="hanky-midline" d="${t}" fill="none" stroke="${i}" stroke-width="${sxSW}" stroke-linecap="butt"${r} opacity="0.9"${F}/>`;
            }
            if (D += W, D += `<path class="topic-pulse${B}${v ? " hanky-none" : ""}" d="${t}" stroke="${p}" style="stroke-width:${5 * mapFontScale() * sxF / 3}" aria-hidden="true"/>`, 
            D += `<path class="concept-hit" data-id="${e}" data-nx="${a.toFixed(5)}" data-ny="${r.toFixed(5)}"${Sa(e, I, M)} d="${t}" tabindex="0" role="button" aria-label="${Hi(i)} concept line"/>`, 
            g && x && !d) {
                const n = da(e, x);
                ($.single ? [ {
                    key: "give",
                    offset: 0
                } ] : [ {
                    key: "give",
                    offset: -5
                }, {
                    key: "receive",
                    offset: 5
                } ]).forEach((e, i) => {
                    if (!n[e.key + "Known"]) return;
                    const a = n[e.key], r = $.labels[i] || e.key, o = n[e.key + "Derived"] ? ` · rolled up from ${n[e.key + "RatedChildren"]} of ${n.childCount} child topics` : "";
                    D += `<path class="visual-rail collapsed-rating-rail" d="${t}" transform="${E(e.offset)}" fill="none" stroke="${zi(a)}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${r}: ${Math.round(a)}${o}</title></path>`;
                });
            }
            if (g && !Rt && Qi() && 2 === Xi().length) {
                const n = function(e) {
                    const t = Xi();
                    if (t.some(t => "limit" === Oa(e, t))) return "limit";
                    if (t.some(t => "favorite" === Oa(e, t))) return "favorite";
                    const r = sxPairByIds(t[0], t[1]), rec = r && r.topicsById[e];
                    if (!rec) return "other";
                    return "match" === rec.outcome ? "mutual" : rec.mutualNo ? "disinterest" : "other";
                }(e), i = {
                    mutual: "mutual-halo",
                    disinterest: "disinterest-halo",
                    favorite: "favorite-halo",
                    limit: "limit-halo"
                }[n];
                i && (D += `<path class="${i}" d="${t}"/>`);
            }
            const U = S && "group" === ft[S]?.kind ? ft[S].matchDetails?.[e] : null;
            if (g && S && d && U) {
                const t = l - o, n = c - s, i = (Math.hypot(t, n), 180 * Math.atan2(n, t) / Math.PI), a = sxControlScale(sxD, u), r = function(e) {
                    if (!e) return "";
                    const t = Array.isArray(e.routes) ? e.routes : [];
                    return 1 === t.length ? `${Math.round(e.score)}% · ${_d(t[0])}` : `${Math.round(e.score)}% · ${t.length} matched routes`;
                }(U), d = (U.routes || []).map(e => `${_d(e, !0)}; combined ${Math.round(e.score)}%`).join(" · "), p = Za.controlTagWidth(r, "group") * a, h = 24 * a, g = l, m = c;
                D += `<g class="direction-control group-match-control" data-id="${e}" data-direction="group" data-base-cx="${g}" data-base-cy="${m}" data-base-angle="${i}" data-index="0" data-tag-width="${p}" data-tag-height="${h}" data-control-scale="${a}" role="img" tabindex="0" aria-label="Combined match ${Math.round(U.score)} percent. ${Hi(d)}"><title>Combined match ${Math.round(U.score)}%. ${Hi(d)}</title><rect class="direction-tag-bg" x="${(g - p / 2).toFixed(2)}" y="${(m - h / 2).toFixed(2)}" width="${p.toFixed(2)}" height="${h.toFixed(2)}" rx="${6 * a}" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" fill="${zi(U.score)}"/><text class="direction-tag" x="${g.toFixed(2)}" y="${m.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i.toFixed(2)} ${g.toFixed(2)} ${m.toFixed(2)})" textLength="${Math.max(50, p - 12 * a).toFixed(2)}" lengthAdjust="spacing" style="font-size:${5.5 * a}px">${Hi(r)}</text></g>`;
            } else if (g && S && d) {
                const t = da(e, S), n = l - o, i = c - s, d = Math.hypot(n, i), p = n / d, h = i / d, g = 180 * Math.atan2(i, n) / Math.PI, m = sxControlScale(sxD, u), f = $.keys, y = $.labels, b = !$.single && "give" === y[0] && "receive" === y[1], v = e => Za.controlTagWidth(e, "pair") * m, w = $.single ? {
                    give: Za.controlTagWidth(y[0], "single") * m
                } : {
                    give: v(y[0]),
                    receive: v(y[1])
                }, k = ($.single ? 20 : 24) * m, x = 320 * m, E = sxRailPx(m), C = $.single ? [ 0 ] : [ -w.give / 2, w.receive / 2 ];
                // Slider blow-up repair (2026-11-01): E (the rating rail's stroke-width) was 44 * mapFontScale() — unbounded and font-derived, so at the baked fontScale 40 the rail rendered 1760 screen px thick (non-scaling-stroke) and one inadvertently picked slider filled the viewport at high zoom-out. It is now the fixed 44 of the 44px spec at every font scale and zoom, matching the .rating-rail CSS rule. Track length (x = 320 * m, map units, camera-scaled) is unchanged.
                // Slider size repair #2 (2026-11-01): E now comes from sxRailPx(m) — 14% of the track's delivered screen length at the current camera, capped at the same fixed 44 — so the attribute, the .rating-rail CSS variable, and the hit strokes all agree at every zoom instead of the fixed 44px thickness dwarfing the shrunken track at Full zoom-out.
                f.forEach((n, i) => {
                    const o = w[n], s = o + 10 * m, d = C[i], u = l - p * d, f = c - h * d, v = u - a * x / 2, M = f - r * x / 2, I = u + a * x / 2, P = f + r * x / 2, L = `M ${v.toFixed(2)} ${M.toFixed(2)} L ${I.toFixed(2)} ${P.toFixed(2)}`, T = s / 2, F = `M ${(u - p * T).toFixed(2)} ${(f - h * T).toFixed(2)} L ${(u + p * T).toFixed(2)} ${(f + h * T).toFixed(2)}`, N = `grad-${A}-${n}`, _ = t[n + "Known"], R = _ ? t[n] : 0, O = (R + 100) / 200, B = Boolean(t[n + "Derived"]), j = Math.round(R), q = _ ? B ? `${j}, rolled up from ${t[n + "RatedChildren"]} of ${t.childCount} child topics` : String(j) : "Unrated", H = Zn(e, n), W = ei(e, n, S), U = Boolean(Nt && Nt.id === e && Nt.direction === n), G = U ? " active-rating" : "", K = `data-id="${e}" data-direction="${n}" data-x0="${v}" data-y0="${M}" data-x1="${I}" data-y1="${P}" data-nx="${a}" data-ny="${r}" data-offset="0"`, z = v + (I - v) * O, V = M + (P - M) * O, Y = $.single ? 1 : 0 === i ? -1 : 1, X = u + p * Y * (o / 2), Z = f + h * Y * (o / 2), Q = _ ? zi(R) : Ga.FALLBACK_COLOR;
                    D += `<g class="direction-control${$.single ? " single-label-control" : ""}${G}" data-id="${e}" data-direction="${n}"${W ? ` data-rating-tooltip="${Hi(W)}"` : ""} data-derived="${B}" data-base-cx="${u}" data-base-cy="${f}" data-base-angle="${g}" data-index="${i}" data-tag-width="${o}" data-tag-height="${k}" data-control-scale="${m}" style="--sx-rail-px:${E.toFixed(1)}px;--sx-rail-hit-px:${Math.max(14, Math.min(44, E * 1.6)).toFixed(1)}px">`, 
                    D += `<defs><linearGradient id="${N}" gradientUnits="userSpaceOnUse" x1="${v}" y1="${M}" x2="${I}" y2="${P}"><stop offset="0" stop-color="var(--red-deep)"/><stop offset=".5" stop-color="var(--curious)"/><stop offset="1" stop-color="var(--green-deep)"/></linearGradient></defs>`, 
                    D += `<path class="visual-rail rating-rail${G}" data-id="${e}" data-direction="${n}" d="${L}" fill="none" stroke="url(#${N})" stroke-width="${E}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`, 
                    (_ || U) && (D += `<circle class="slider-thumb${G}" data-id="${e}" data-direction="${n}" cx="${z.toFixed(2)}" cy="${V.toFixed(2)}" r="${10 * m}" fill="${zi(R)}"/>`), 
                    D += `<path class="rating-track-hit${G}" ${K} d="${L}"/>`;
                    const J = U ? `tabindex="0" role="button" aria-label="Clear ${Hi(`${Jn(e, n)}${H ? ` ${H}` : ""}`)} rating"` : 'tabindex="-1" aria-hidden="true"', ee = g + 90;
                    D += `<g class="rating-clear${G}" data-id="${e}" data-direction="${n}"><rect class="rating-clear-bg" x="${(X - 23 * (mapFontScale() * sxF / 3)).toFixed(2)}" y="${(Z - 10 * (mapFontScale() * sxF / 3)).toFixed(2)}" width="${46 * (mapFontScale() * sxF / 3)}" height="${20 * (mapFontScale() * sxF / 3)}" rx="5" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})"/><rect class="rating-clear-hit" data-id="${e}" data-direction="${n}" x="${(X - 28).toFixed(2)}" y="${(Z - 15).toFixed(2)}" width="56" height="30" rx="7" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})" ${J}/><text class="rating-clear-text" x="${X.toFixed(2)}" y="${Z.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${ee.toFixed(2)} ${X.toFixed(2)} ${Z.toFixed(2)})">Clear</text></g>`, 
                    D += `<path class="direction-hit" tabindex="0" role="slider" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="${_ ? j : 0}" aria-valuetext="${q}" aria-label="${Hi(`${Jn(e, n)}${H ? `: ${H}` : ""}. ${q}. Tap to open its rating scale; drag, then release to choose.`)}" aria-expanded="${U}" ${K} d="${F}"/>`, 
                    $.single && (D += `<rect class="direction-tag-occluder" x="${(u - o / 2 - 3 * m).toFixed(2)}" y="${(f - k / 2 - 3 * m).toFixed(2)}" width="${(o + 6 * m).toFixed(2)}" height="${(k + 6 * m).toFixed(2)}" rx="${7 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})"/>`), 
                    D += `<rect class="direction-tag-bg" data-id="${e}" data-direction="${n}" x="${(u - o / 2).toFixed(2)}" y="${(f - k / 2).toFixed(2)}" width="${o}" height="${k}" rx="${5 * m}" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" fill="${Q}" opacity="${_ ? 1 : .62}"/>`;
                    // TAG FILL (ruled 2026-11-02, Jason): the give/receive
                    // lettering fills its tag capsule — font-size equals
                    // the tag height k exactly (single 20 * m, pair
                    // 24 * m), no wasted space top or bottom. The capsule
                    // takes its width from the word itself at this font
                    // (Za.controlTagWidth), so the word fits with no
                    // sideways squeeze and no shrink: the old textLength
                    // cap (spacingAndGlyphs) is gone.
                    const te = $.single ? y[i] : b ? "give" === n ? "G" : "R" : y[i], ne = k;
                    D += `<text class="direction-tag" data-id="${e}" data-direction="${n}" x="${u.toFixed(2)}" y="${f.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${g.toFixed(2)} ${u.toFixed(2)} ${f.toFixed(2)})" style="font-size:${ne}px">${Hi(te)}</text></g>`;
                });
            }
            if (g && !Rt && !x) {
                const i = Xi(), a = $.single ? [ "give" ] : [ "give", "receive" ], r = i.length * a.length, o = (n > 7 ? Math.min(18, 4 + 1.6 * r) : Math.min(14, 3 + 1.4 * r)) * (mapFontScale() * sxF / 3), s = Math.max(1.35, n / Math.min(r, 6)) * (mapFontScale() * sxF / 3);
                i.forEach((n, i) => {
                    const l = da(e, n);
                    a.forEach((c, d) => {
                        const u = i * a.length + d, p = 1 === r ? 0 : -o / 2 + o * u / (r - 1);
                        $.labels[d], D += `<path class="visual-rail" d="${t}" transform="${E(p)}" fill="none" ${function(e, t, n) {
                            return e[t + "Known"] ? `stroke="${la(n)}" opacity=".96"` : 'stroke="var(--line)" stroke-dasharray="2 6" opacity=".38"';
                        }(l, c, n)} stroke-width="${s}" stroke-linecap="round" vector-effect="non-scaling-stroke"><title>${Hi(wt[n])} — ${Hi(Jn(e, c))}</title></path>`;
                    });
                });
            }
            return D;
        }
        function za(e, t, n, i, a, r = 0) {
            const o = i - t, s = a - n, l = Math.hypot(o, s), c = o / l, d = s / l, u = i - c * r, p = a - d * r, h = Math.max(80, l - r), g = Za.leafLabelWidth(h), m = u - c * g, f = p - d * g;
            return {
                d: `M ${t.toFixed(2)} ${n.toFixed(2)} L ${i.toFixed(2)} ${a.toFixed(2)}`,
                labelD: `M ${m.toFixed(2)} ${f.toFixed(2)} L ${u.toFixed(2)} ${p.toFixed(2)}`,
                labelWidth: g,
                labelStartX: m,
                labelStartY: f,
                ux: c,
                uy: d,
                nx: -d,
                ny: c
            };
        }
        function Va(e, t, n, i, a) {
            return r => {
                const o = Math.max(0, Math.min(a, r));
                return {
                    x: e + n * o,
                    y: t + i * o
                };
            };
        }
        function Ya(e, t, n, i, a = pr.categoryIcon / 2) {
            const r = Math.max(1, Math.hypot(n - e, i - t)), o = (n - e) / r, s = (i - t) / r, l = -s, c = o, d = `M ${e.toFixed(2)} ${t.toFixed(2)} L ${n.toFixed(2)} ${i.toFixed(2)}`, u = `M ${n.toFixed(2)} ${i.toFixed(2)} L ${e.toFixed(2)} ${t.toFixed(2)}`, p = r, h = Va(e, t, o, s, p), g = a, m = Za.cloudLabel(p, g), f = m.labelOffset;
            return {
                d: d,
                labelD: d,
                reverseD: u,
                routedLength: p,
                labelWidth: m.labelWidth,
                labelOffset: f,
                icon: h(p),
                ux: o,
                uy: s,
                nx: l,
                ny: c,
                c1: h(.3 * p),
                c2: h(.7 * p),
                bend: 0,
                pointAtDistance: h
            };
        }
        function Xa(e, t) {
            return {
                x: MAP_CENTER_X + Math.cos(e) * t,
                y: MAP_CENTER_Y + Math.sin(e) * t
            };
        }
        const Za = Object.freeze({
            HALO_SPACING: Object.freeze({
                category: 8,
                topic: 6
            }),
            CENTER_SPACING_EM: .02,
            IDEAL_SIZE: 18,
            MIN_SIZE: 12.5,
            _context: document.createElement("canvas").getContext("2d"),
            _cache: new Map,
            _estimateCache: new Map,
            measure(e, t, n) {
                if (!Za._context) return 0;
                const i = "category" === n || "center" === n, a = i ? '"Barlow Condensed",sans-serif' : '"Source Sans 3",sans-serif', r = i ? 700 : 650, o = "center" === n ? Za.CENTER_SPACING_EM * t : Za.HALO_SPACING[n] || Za.HALO_SPACING.topic, s = n + "|" + t.toFixed(1) + "|" + e;
                if (Za._cache.has(s)) return Za._cache.get(s);
                Za._context.font = `${r} ${t}px ${a}`;
                const l = Za._context.measureText(e).width + o * Math.max(0, e.length - 1);
                return Za._cache.size > 2e3 && Za._cache.clear(), Za._cache.set(s, l), l;
            },
            fittedSize(e, t, n) {
                const i = Za.IDEAL_SIZE, a = Za.measure(e, i, n);
                return Math.max(Za.MIN_SIZE, Math.min(i, i * t / Math.max(t, a)));
            },
            fitWithin(e, t, n, i, a) {
                const r = Za.measure(e, t, a);
                return Math.max(n, Math.min(t, t * i / Math.max(1, r)));
            },
            fitAttr: (e, t, n, i) => Za.measure(e, t, n) > i ? ` textLength="${i.toFixed(0)}" lengthAdjust="spacing"` : "",
            // CAPSULE = THE WORD (ruled 2026-11-02, Jason): a tag
            // capsule's width IS its word's measured width at the tag
            // font, plus the renderer's existing inset (4 for the
            // give/receive tags, whose fit check was capsule width
            // minus 4 * scale; 12 for the group score tag, whose text
            // was set to capsule width minus 12 * scale). The old
            // per-character width table is gone: no fixed widths, no
            // caps, no floors. Tag fonts: single 20, pair 24 (the
            // tag heights, unchanged), group score 5.5 (halved from
            // 11 in the same ruling). Paint and the scored capsule
            // geometry both read this one definition, so they move
            // together.
            controlTagWidth: (e, t) => "single" === t ? Za.measure(e, 20, "topic") + 4 : "group" === t ? Za.measure(e, 5.5, "topic") + 12 : Za.measure(e, 24, "topic") + 4,
            leafLabelWidth: e => Math.min(e, Math.max(170, e - 38)),
            curveLabel(e, t, n) {
                const i = Math.max(.32, Math.min(.62, Number(n) || .32)), a = Number.isFinite(t) ? Math.min(e * i, Math.max(6, t)) : Math.min(12, Math.max(6, .03 * e));
                return {
                    labelOffset: a,
                    safeLabelLimit: i,
                    labelWidth: Math.max(120, e - a - 20)
                };
            },
            cloudLabel(e, t) {
                const n = Math.min(e - 40, Math.max(t + 44, .2 * e));
                return {
                    labelOffset: n,
                    // LABEL CLEARANCE (repair, 2026-11-01): the
                    // width offered to the fitted-size computation
                    // is the space actually left on the spoke —
                    // the old floor of 80 forced a label wider
                    // than a short spoke, so its text ran past
                    // the end of the spoke and impinged on the
                    // icon seated there. A short spoke now gets a
                    // smaller fitted label instead.
                    labelWidth: Math.max(30, e - n - 30)
                };
            },
            adaptivePlacement(e, t, n = 0) {
                const i = Math.max(.006, Number(e && e.sector) || .006), a = t >= 3, r = a ? 92 : 44, o = a ? n + 700 : n + 72, s = a ? hr(3) + 1280 : n + 420, l = Math.min(s, Math.max(o, r / i)), c = a ? 620 : 72, d = a ? 2560 : 560, u = Math.max(c, Math.min(d, l - n));
                return a ? {
                    offset: u,
                    limit: .72
                } : {
                    offset: u,
                    limit: .68
                };
            },
            topicLabelOffset: (e, t, n) => Math.max(30, Math.min(e - 36, t + (n % 2 ? 20 : 0))),
            angularDemand(e, t, n, i, a = 0) {
                const r = Math.max(n + 30, 2 * i + Math.min(40, .65 * String(e || "").length)) + a;
                return 2 * Math.asin(Math.min(.92, r / (2 * Math.max(1, t))));
            },
            allocateSectors(e, t, n, i, a, r, o = 0) {
                if (!e.length) return [];
                const s = e.map(e => Math.max(Za.angularDemand(e.label, i, a, r, o), Number(e.minDemand) || 0)), l = s.reduce((e, t) => e + t, 0), c = e.map(e => Math.max(1, e.weight || 1)), d = c.reduce((e, t) => e + t, 0);
                let u = c.map(e => n * e / d);
                if (l <= n) {
                    const t = new Set;
                    for (let i = 0; i < e.length; i++) {
                        let e = !1, i = 0, a = 0;
                        if (u.forEach((e, n) => {
                            t.has(n) ? i += s[n] : a += c[n];
                        }), u = u.map((e, r) => t.has(r) ? s[r] : Math.max(0, n - i) * c[r] / Math.max(1e-4, a)), 
                        u.forEach((n, i) => {
                            !t.has(i) && n < s[i] && (t.add(i), e = !0);
                        }), !e) break;
                    }
                    const i = u.reduce((e, t) => e + t, 0);
                    if (i < n - 1e-4) {
                        const t = (n - i) / e.length;
                        u = u.map(e => e + t);
                    }
                } else u = s.map(e => n * e / l);
                let p = t;
                return e.map((e, t) => {
                    const n = u[t], i = s[t], a = Math.max(0, (n - i) / Math.max(1e-4, i)), r = Object.assign({}, e, {
                        angle: p + n / 2,
                        sector: n,
                        start: p,
                        end: p + n,
                        demand: i,
                        slackRatio: a
                    });
                    return p += n, r;
                });
            },
            TAPER_BASE_FRACTION: .78,
            // TAPER-BASE RE-ANCHOR (2026-11-02, owner-approved): the
            // category taper base no longer grows with the radius R.
            // TAPER_BASE_CAP is the tuned-era base — TAPER_BASE_FRACTION
            // of the chord across one of 18 slots at R = 300, about
            // 81.26 units, the base this rule produced when it was
            // tuned — and categoryTaperBaseWidth now returns
            //   max(seed, min(0.78 * chord(R, count), TAPER_BASE_CAP))
            // so at any larger radius the base holds at the tuned value
            // and Ga.railsBaseWidth's fontScale / 3 carries that fixed
            // proportion forward (the painted base is about 1.23x the
            // 22 * fontScale band at every font size). The min() keeps
            // the Oct 13 neighbour-margin property at every radius:
            // the base never exceeds 0.78 of one slot chord, so
            // adjacent bases always keep their margin. flareAt and
            // FLARE_DECAY are untouched.
            TAPER_BASE_CAP: 2 * 300 * Math.sin(Math.PI / 18) * .78,
            categoryTaperBaseWidth(e, t, n) {
                const i = 2 * t * Math.sin(Math.PI / Math.max(1, Number(n) || 1));
                return Math.max(e, Math.min(i * Za.TAPER_BASE_FRACTION, Za.TAPER_BASE_CAP));
            },
            SETTLE: Object.freeze({
                controlGap: 14,
                iconGap: 2,
                startOffset: 2,
                parentOuterMargin: 12,
                boxPadding: 4,
                badgeGap: 0,
                gen2: Object.freeze({
                    step: 32,
                    attempts: 18
                }),
                gen3: Object.freeze({
                    step: 40,
                    attempts: 18
                })
            }),
            orientedBox(e, t, n, i, a = 0) {
                const r = a * Math.PI / 180, o = Math.cos(r), s = Math.sin(r), l = Za.SETTLE.boxPadding;
                return {
                    cx: e,
                    cy: t,
                    hw: Math.max(1, n / 2 + l),
                    hh: Math.max(1, i / 2 + l),
                    ux: {
                        x: o,
                        y: s
                    },
                    uy: {
                        x: -s,
                        y: o
                    }
                };
            },
            boxesOverlap(e, t) {
                const n = t.cx - e.cx, i = t.cy - e.cy;
                return [ e.ux, e.uy, t.ux, t.uy ].every(a => Math.abs(n * a.x + i * a.y) < e.hw * Math.abs(e.ux.x * a.x + e.ux.y * a.y) + e.hh * Math.abs(e.uy.x * a.x + e.uy.y * a.y) + (t.hw * Math.abs(t.ux.x * a.x + t.ux.y * a.y) + t.hh * Math.abs(t.uy.x * a.x + t.uy.y * a.y)));
            },
            isClear: (e, t) => !e.some(e => t.some(t => Za.boxesOverlap(e, t))),
            settleSearch: e => e ? Za.SETTLE.gen2 : Za.SETTLE.gen3,
            markerCandidates(e) {
                let t = 0;
                for (let n = 0; n < e.length; n++) t = 31 * t + e.charCodeAt(n) >>> 0;
                const n = t % 2 ? 1 : -1, i = 9 * (t % 3 - 1);
                return [ [ 36 * n, i ], [ 36 * -n, i ], [ 49 * n, -i ], [ 49 * -n, -i ], [ 38 * n, i + 24 ], [ 38 * -n, i - 24 ], [ 54 * n, i + 22 ], [ 54 * -n, i - 22 ] ];
            },
            markerAnchorAt(e, t, n, i, a) {
                const r = -n, o = t;
                return {
                    x: e.x + r * i[0] + t * i[1],
                    y: e.y + o * i[0] + n * i[1],
                    radius: a
                };
            },
            pickMarkerAnchor(e, t, n, i, a, r) {
                for (const o of a) {
                    const a = Za.markerAnchorAt(t, n, i, o, r);
                    if (e.every(e => Math.hypot(a.x - e.x, a.y - e.y) >= a.radius + e.radius + 8)) return a;
                }
                return null;
            },
            topicSpokeEstimate(e, t, depth) {
                // Memoised (T3, M6): the result is a pure function
                // of ALL of its inputs — the label, the radius, and
                // the canvas font-metrics state its measure calls
                // read (Source Sans 3, weight 650; see Za.measure).
                // The governing font signature is part of the cache
                // key — the bundle's signature-recapture discipline:
                // when the font state changes, entries under the old
                // signature simply never hit and the value is
                // recaptured, so a hit always returns exactly what
                // the unmemoised computation returns under the same
                // state. Hits hand back a fresh object, so a caller
                // can never mutate a cached entry. Bounded like
                // Za._cache: cleared past 2,000 entries.
                let sig = "nofonts";
                try {
                    document.fonts && document.fonts.check && (sig = document.fonts.status + "|" + document.fonts.check('650 16px "Source Sans 3"'));
                } catch (_) {}
                const dep = null == depth ? 2 : depth, key = sig + "|" + t + "|" + dep + "|" + e, hit = Za._estimateCache.get(key);
                if (hit) return {
                    fontSize: hit.fontSize,
                    spokeLength: hit.spokeLength
                };
                const n = Math.max(12, Math.min(17, Za.fittedSize(e, Math.max(80, t - 84)))) * sxFontCoef(dep) / 17, i = 96 + Za.measure(e, n) + 30, out = {
                    fontSize: n,
                    spokeLength: Math.max(t, i)
                };
                return Za._estimateCache.size > 2e3 && Za._estimateCache.clear(), Za._estimateCache.set(key, out), {
                    fontSize: out.fontSize,
                    spokeLength: out.spokeLength
                };
            },
            hubSpokeLength(e, t, n, i, a) {
                let r = n;
                for (let n = 0; n < 3; n++) {
                    const n = Math.min(r - 40, Math.max(i + 44, .2 * r)) + 20;
                    r = Math.max(r, n + Za.measure(e, t) + 3 + a);
                }
                return Math.max(n, r);
            },
            categoryFontSize: (e, t, n, i) => Math.max(15, Math.min(25, Za.fittedSize(e, t - n - (i ? 20 : 12), "category") + 5)),
            categoryUnderlineLength: (e, t) => Math.max(36, e.length * t * .5)
        });
        function Qa(e) {
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            // Build 2026-10-19_1535: expand/collapse on label/icon click COMMENTED OUT per Jason — click is selection only (highlight + dim), no expand/contract. Restore by uncommenting the $i(n) line.
            // n && $i(n);
            n && selectSpokeNode(n, !0);
            const rec = n && (qn[n] || Xn(n));
            if (rec && "Topic" === rec.kind && typeof xo === "function") {
                const box = t.getBoundingClientRect ? t.getBoundingClientRect() : { left: innerWidth / 2, width: 0, bottom: innerHeight / 2 };
                xo(n, box.left + box.width / 2, box.bottom + 8);
            }
        }
        function clearSelectionMarking() {
            if (Cn) Cn.querySelectorAll(".selected-spoke").forEach(el => el.remove());
        }
        function clearSpokeSelection() {
            // The one clear path (Build 2026-10-19_0543): clear the
            // selected node and any pending rating target, and remove
            // the selection marking from the existing DOM.
            // Geometry-neutral: no re-render — a full solve (Mr())
            // would discard delivered geometry (scoped editor commits,
            // DeKnotter runs) that exists only in the rendered DOM. The
            // map-selection-dim observer clears sel-keep /
            // has-selection in response to the marking removal.
            // A search focus and a relation-line focus dim the map
            // without a selected spoke, so those are cleared here too.
            // Returns whether anything was selected.
            if (typeof window.__sxStopFocusZoom === "function") window.__sxStopFocusZoom();
            const search = e.byId("searchInput"), picker = e.byId("topicPicker");
            const searchDim = Boolean(Dt || Tt || (search && search.value) || (Cn && (Cn.classList.contains("relation-focused") || Cn.querySelector(".is-dim, .is-preview"))));
            const had = Boolean(Lt || Nt || searchDim || (picker && picker.value) || (Cn && (Cn.classList.contains("has-selection") || Cn.classList.contains("relation-focused") || Cn.querySelector(".selected-spoke, .rel-active"))));
            Lt = null, Nt = null, Dt = null, Tt = "", sxSelEditorMirrored = null;
            search && (search.value = "");
            if (picker && picker.value) picker.value = "", picker.dispatchEvent(new Event("change", { bubbles: true }));
            clearSelectionMarking();
            if (Cn) {
                Cn.classList.remove("has-selection", "relation-focused");
                Cn.querySelectorAll(".sel-keep, .is-dim, .is-preview, .relation-focus-keep, .rel-endpoint, .rel-active").forEach(el => el.classList.remove("sel-keep", "is-dim", "is-preview", "relation-focus-keep", "rel-endpoint", "rel-active"));
                Cn.querySelectorAll(".map-label-stack-item[opacity], .rating-control-stack-item[opacity]").forEach(el => el.removeAttribute("opacity"));
            }
            const menu = e.byId("searchDropdown");
            menu && (menu.hidden = true);
            if (searchDim && typeof Ih === "function") Ih();
            return had;
        }
        function stampSelectedSpoke(d, host) {
            if (!host) return;
            const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("class", "selected-spoke");
            p.setAttribute("d", d || "");
            p.setAttribute("vector-effect", "non-scaling-stroke");
            p.setAttribute("stroke-width", "14");
            p.setAttribute("aria-hidden", "true");
            let ref = host.firstChild;
            while (ref && 1 === ref.nodeType && ref.classList.contains("group-heat")) ref = ref.nextSibling;
            host.insertBefore(p, ref);
        }
        function applySelectionMarking(id, t) {
            // Stamp the .selected-spoke highlight(s) for a selection
            // onto the existing DOM, reproducing the render's end
            // state exactly (no re-render: Mr() re-solves and
            // re-renders the whole map from canonical layout state,
            // silently discarding delivered geometry). The render
            // builds each spoke through Ka, whose predicate marks the
            // spoke whose id is the selected node, its parent, or its
            // branch (cat-<slug of branch>) — but only spokes Ka
            // actually builds can carry the mark, and the render's
            // spoke-underlay pass then moves the branch spoke's
            // visuals out of the hub group. The end state is:
            // a topic's own mark stays in its node group (its Ka
            // output is wrapped in .second-gen-rating-controls-only,
            // which the underlay pass skips); the branch's mark lives
            // in the branch's line-group underlay element
            // (.spoke-underlay-item[data-spoke-for="cat-<slug>"]),
            // never in the hub node group; and a subcategory carries
            // no mark of its own (its line is drawn by
            // renderKinkLine, which stamps no highlight, and no mark
            // is stamped for a topic's parent subcategory either) —
            // selecting a subcategory marks only its branch's line.
            // Which spokes carry a mark, and where, is decided by
            // selectionMarkKind (the single selection-marking
            // authority, defined above Ka) — the same function Ka
            // consults during render, so the end state reproduced
            // here cannot drift from the render's.
            // Each stamp copies its d from the spoke's .concept-hit —
            // the same path data the render stamps. Element
            // add/remove is a childList mutation, so the
            // map-selection-dim observer mirrors the result into
            // sel-keep / has-selection unchanged. No canonical layout
            // state and no delivered-geometry registry entry is
            // written here.
            if (!Cn) return;
            clearSelectionMarking();
            const hits = new Map();
            Cn.querySelectorAll(".concept-hit").forEach(hit => {
                const hid = hit.getAttribute("data-id");
                if (hid && !hits.has(hid) && !hit.closest(".layout-exit-clone")) hits.set(hid, hit);
            });
            const branchCatId = t && t.branch ? catId(t.branch) : null;
            if ("own" === selectionMarkKind(id, id, t)) {
                const hit = hits.get(id);
                if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
            if ("branch" === selectionMarkKind(branchCatId, id, t)) {
                const hit = hits.get(branchCatId), underlay = Cn.querySelector(`.spoke-underlay-item[data-spoke-for="${CSS.escape(branchCatId)}"]`);
                if (underlay) stampSelectedSpoke(hit ? hit.getAttribute("d") : "", underlay);
                else if (hit && hit.parentNode) stampSelectedSpoke(hit.getAttribute("d"), hit.parentNode);
            }
        }
        function selectSpokeNode(n, notify) {
            // The one selection path for a spoke's node (Build
            // 2026-10-18_1401): spoke taps (click and gesture paths),
            // spoke keyboard activation, and the Layout Editor's selects
            // (via __SEXCAPADES_LAYOUT_API.selectNode) all land here, so
            // selecting a branch means the same thing everywhere — set
            // the selected node, clear any pending rating target, apply
            // the .selected-spoke marking to the existing DOM, and
            // (unless the Layout Editor initiated it) notify the editor
            // so its Advanced selects follow. Selection-only: no
            // re-render and no solve — Mr() would re-deliver every
            // node position from canonical layout state, discarding
            // delivered geometry (scoped editor commits, DeKnotter
            // runs) that exists only in the rendered DOM.
            if (!n) return;
            Lt = n, Nt = null, sxSelEditorMirrored = n;
            applySelectionMarking(n, qn[n] || Xn(n) || (at[Vi()] || {})[n] || null);
            if (notify === !1) return;
            try {
                window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.selectNode && window.__SEXCAPADES_LAYOUT_UI.selectNode(n);
            } catch (err) { __sxErrLog("layout-select-node", err); }
        }
        function Qsel(e) {
            // Spoke tap = select ONLY (Build 2026-10-18_1401, deprecating
            // the tap-to-expand/collapse toggle on spokes): tapping a
            // spoke — the hit line, the stem, the taper, or the midline —
            // selects that branch and never expands or collapses it, not
            // even when the tapped spoke's branch is already selected
            // (Build 1314's fall-through to Qa in that case is removed).
            // Expand/collapse lives on the label and icon taps (Qa).
            if (mn.staticMap) return;
            if (e.preventDefault(), e.stopPropagation(), to) return void (to = !1);
            const t = e.currentTarget, n = t.dataset.id || t.dataset.topicId || __sxClosestAction(t, "nodeGroup")?.dataset.layoutKey;
            n && selectSpokeNode(n, !0);
        }
        function Ja() {
            // A rating-details pass can clear the expanded-branch set
            // while the map is still in its expanded state (kn). Re-seed
            // that set before deciding which topic names stay visible, so
            // fit zoom does not lose every label.
            kn && !rn.size && h.forEach(e => e && e.name && rn.add(e.name));
            In.querySelectorAll(".map-label").forEach(e => {
                const t = qn[e.dataset.topicId];
                if (!t) return;
                const n = Tt && String(t.label || "").toLowerCase().includes(Tt);
                e.classList.toggle("revealed", Boolean(n || rn.has(t.branch)));
            }), function() {
                if ("number" != typeof $p || "number" != typeof Ep || "number" != typeof Ap || void 0 === nh) return;
                const e = nh;
                In.querySelectorAll(".node-group[data-layout-key]").forEach(t => {
                    t.dataset.layoutKey;
                    const n = Ep + Number(t.dataset.layoutX) * $p, i = Ap + Number(t.dataset.layoutY) * $p, a = !Number.isFinite(n) || !Number.isFinite(i) || n < e.x - 90 || n > e.x + e.width + 90 || i < e.y - 90 || i > e.y + e.height + 90;
                    a !== Boolean(t.dataset.cameraOffscreen) && (t.dataset.cameraOffscreen = a ? "true" : "", 
                    t.querySelectorAll("[role],[tabindex]").forEach(e => {
                        a ? (e.hasAttribute("role") && (e.dataset.cameraRole = e.getAttribute("role")), 
                        e.hasAttribute("tabindex") && (e.dataset.cameraTabindex = e.getAttribute("tabindex")), 
                        e.removeAttribute("role"), e.setAttribute("tabindex", "-1"), e.setAttribute("aria-hidden", "true"), 
                        e.style.pointerEvents = "none") : (void 0 !== e.dataset.cameraRole && (e.setAttribute("role", e.dataset.cameraRole), 
                        delete e.dataset.cameraRole), void 0 !== e.dataset.cameraTabindex ? (e.setAttribute("tabindex", e.dataset.cameraTabindex), 
                        delete e.dataset.cameraTabindex) : e.removeAttribute("tabindex"), e.removeAttribute("aria-hidden"), 
                        e.style.removeProperty("pointer-events"));
                    }));
                });
            }();
        }
        function focusRelationLink(link, event) {
            event?.preventDefault(), event?.stopPropagation();
            const branchNames = [link.dataset.branchA, link.dataset.branchB].filter(Boolean), topicIds = [link.dataset.topicA, link.dataset.topicB].filter(Boolean);
            topicIds.forEach(id => {
                const topic = qn[id] || Xn(id);
                topic?.branch && branchNames.push(topic.branch);
            });
            branchNames.forEach(name => rn.add(name));
            if (branchNames.length) Mr();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const endpointIds = topicIds.length ? topicIds : branchNames.map(name => catId(name));
                const points = endpointIds.map(id => In.querySelector(`[data-layout-key="${CSS.escape(id)}"]`)).filter(Boolean).map(node => {
                    node.classList.remove("is-hidden");
                    return {x:Number(node.dataset.labelX || node.dataset.layoutX), y:Number(node.dataset.labelY || node.dataset.layoutY)};
                }).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
                if (points.length < 2) return;
                const [a,b] = points, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, pad = innerWidth <= 620 ? 70 : 110, spanX = Math.abs(b.x-a.x) + 170, spanY = Math.abs(b.y-a.y) + 170, scale = Math.max(.28, Math.min(innerWidth <= 620 ? 2.2 : 2.6, (nh.width-2*pad)/Math.max(spanX,1), (nh.height-2*pad)/Math.max(spanY,1)));
                const prevBt = Bt; Bt = !0; Ph(scale, nh.x + nh.width/2 - cx*scale, nh.y + nh.height/2 - cy*scale); Bt = prevBt;
            }));
        }
        document.addEventListener("click", function(event) {
            const link = __sxClosestAction(event.target, "relationHit");
            link && focusRelationLink(link, event);
        }, !0);
        window.__sxOnKey( function(event) {
            const link = event.target.closest?.(".common-overlap-link.relation-hit");
            link && (event.key === "Enter" || event.key === " ") && focusRelationLink(link, event);
        }, !0);
        // Map layout geometry (er, nr, rr, and the branch-order helpers)
        // lives in 02c-layout-solver.js. A second copy here is a strict-mode
        // SyntaxError (Identifier 'nr'/'rr' has already been declared) and
        // the bootstrap script never runs.
