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
