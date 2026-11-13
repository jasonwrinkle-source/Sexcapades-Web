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
            }), window.__sxLoad && window.__sxLoad(12 /* F5 checkpoint contract (at __sxProgressWidget in index.html): displayed band value — topic index */), (!(c || Mt && vt[Mt]) && !sxBootPaint)) return n(In, `<g>${oa()}${function(e) {
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
            // Boot slices only. A bare yield is swallowed by an ordinary
            // paint, and the boot driver keeps stepping until its 50ms
            // budget is used, so these checks do not add a frame per topic.
            let sxBootSlice = performance.now();
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
                "all" === Pt || b === Pt || S || w.push("is-hidden"), !Tt || String(i.name || "").toLowerCase().includes(Tt) || i.topics.some(e => sxName(e).toLowerCase().includes(Tt)) || w.push("is-dim");
                const $ = null !== Dt && (dCat === Dt || e.topics.some(e => e.topic.id === Dt || e.children.some(e => e.child.id === Dt)));
                Dt && !$ && w.push("is-dim"), Dt && dCat === Dt && w.push("is-preview");
                const E = Math.max(140, .48 * (s - ea.lineStartRadius)) + (t % 2 ? 55 : -35), A = Za.categoryFontSize(i.name, g.labelWidth, E, r), C = Vi(), M = Rt ? null : Qe[C]?.[dCat], I = Rt ? null : null !== fa(i, C, "give") || null !== fa(i, C, "receive") ? 1 : null, P = Ne.get(i.name) || Fe(i), L = (O = I, 
                B = P, Rt ? "var(--green)" : "noCode" === B.key ? Ga.NO_CODE_COLOR : Te(B.lineColor || B.color) || Ga.FALLBACK_COLOR), T = Rt ? null : fa(i, C, "give"), F = Rt ? null : fa(i, C, "receive"), N = Rt ? "var(--green)" : null === T ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(T), _ = Rt ? "var(--green)" : null === F ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(F), D = Rt || null !== I ? "" : "noCode" === P.key ? "gen1-hanky-line gen1-no-hanky-line no-hanky-code-line" : "gen1-hanky-line" + (P.mixed ? " mixed-hanky-code-line" : ""), R = Rt || null !== I || "noCode" !== P.key && !P.mixed ? "none" : "noCode" === P.key ? "5 7" : "18 12";
                var O, B;
                const sxCatHeatVals = Rt ? [] : [ T, F ].filter(v => null != v && Number.isFinite(+v));
                const sxCatHeat = sxCatHeatVals.length ? zi(sxCatHeatVals.reduce((s, v) => s + +v, 0) / sxCatHeatVals.length) : null;
                const j = g.labelStartX + g.ux * E, q = g.labelStartY + g.uy * E, H = Math.atan2(l.y - o.y, l.x - o.x), W = Math.cos(H) < 0, U = W ? -g.ux : g.ux, G = j + 0 * (W ? -g.uy : g.uy), K = q - 0 * U, z = 180 * (H + (W ? Math.PI : 0)) / Math.PI, V = W ? ' text-anchor="end"' : "", Y = sxIconDiameter(1), X = Y / 2, Z = Y / 24, Q = ge[i.name], J = Xa(a, yr(i)), ee = Q ? `<g class="branch-icon${"noCode" === Q.hankyKey ? " no-hanky-code-icon" : ""}" data-diameter="${Y}" ${Sa(dCat, qn[dCat], C, { tapFirst: !0 })} aria-hidden="true" style="color:${sxCatHeat || Q.color}" transform="translate(${(J.x - X).toFixed(2)} ${(J.y - X).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${X}" cy="${X}" r="${X - .5}"/><circle class="icon-disc" cx="${X}" cy="${X}" r="${X - 2}"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="${X}" cy="${X}" r="${X - 3.5}"/><g transform="scale(${Z.toFixed(5)})">${Q.glyph}</g></g>` : "", te = k(dCat, M, !Rt && qa(dCat, Je), !Rt && qa(dCat, et), !Rt && Boolean(tt[C]?.[dCat]?.length), J, g.ux, g.uy), ne = j - 11 * g.ux, ie = q - 11 * g.uy, ae = i.risk ? `<text class="risk-mark" x="${ne.toFixed(2)}" y="${ie.toFixed(2)}" dy="-8" text-anchor="middle" transform="rotate(${z.toFixed(2)} ${ne.toFixed(2)} ${ie.toFixed(2)})" aria-hidden="true">*</text>` : "", re = r ? h.hidden : n.topics.length, oe = X + 20, se = yi(J.x - g.ux * oe, J.y - g.uy * oe, re, dCat, !0), le = r ? function(e, t, n, i, a, r) {
                    if (!n) return "";
                    const o = `+${n} more`, s = Math.max(58, 7 * o.length + 16), l = i + s / 2 * Math.abs(a) + 12 * Math.abs(r), c = t + r * l;
                    return `<g class="hidden-count-badge density-count-badge" data-width="${s}" transform="translate(${(e + a * l - s / 2).toFixed(2)} ${(c - 12).toFixed(2)})" role="note" aria-label="${n} more ${1 === n ? "topic" : "topics"} hidden by hypermap density"><rect width="${s}" height="24" rx="7"/><text x="${(s / 2).toFixed(2)}" y="12" text-anchor="middle" dominant-baseline="middle">${o}</text></g>`;
                }(l.x, l.y, n.densityHidden, X, g.ux, g.uy) : "";
                v += `<g class="${w.join(" ")} gen1-line-group" data-layout-key="${dCat}" data-layout-x="${J.x.toFixed(2)}" data-layout-y="${J.y.toFixed(2)}" data-icon-distance-override="${g.labelWidth.toFixed(2)}" data-rated="${null === I ? "false" : "true"}" style="--profile-color:${f};--family-color:${sxCatHeat || Q.color};--gen1-line-color:${sxCatHeat || L};--gen1-line-dash:${R}">${Ka(dCat, m, 18, i.name, g.nx, g.ny, o2.x, o2.y, c.x, c.y, !1, pr.categoryIcon, sxCatHeat || L, !1, D, null === I ? L : N, null === I ? L : _, ("noCode" === P.key ? Ga.FALLBACK_COLOR : P.lineColor || P.color || Ga.FALLBACK_COLOR), "noCode" === P.key, null !== I, p, SpokeGeometry.buildBaseCircle(pr.centerX, pr.centerY, gen1SpokeBaseRadius()), sxIconDiameter(1), 1)}${sxCatHeat ? `<path class="branch-heat" d="${m}" fill="none" stroke="${sxCatHeat}" stroke-width="4" vector-effect="non-scaling-stroke" stroke-linecap="round" pointer-events="none"/>` : ""}${ee}${te}${ae}${se}${le}<path id="p-${dCat}" d="${y}" fill="none" stroke="transparent"/><line class="node-label-underline" style="stroke:${f}" data-offset="0" x1="${j.toFixed(2)}" y1="${q.toFixed(2)}" x2="${(j + g.ux * Za.categoryUnderlineLength(i.name, A)).toFixed(2)}" y2="${(q + g.uy * Za.categoryUnderlineLength(i.name, A)).toFixed(2)}"/><text class="category-label" data-id="${dCat}" data-path-id="p-${dCat}" data-label-offset="${E}" ${Sa(dCat, qn[dCat], C)} tabindex="0" role="button" aria-expanded="${r}" aria-label="${Hi(i.name)}${i.risk ? ", higher-risk practice requiring specialized knowledge and explicit negotiation" : ""}${x && x.has(i.name) ? ", contains newly imported additions" : ""}. ${r ? `${h.mode} children shown; press Enter to collapse` : `Children hidden; press Enter to expand with ${h.mode} children`}; press Shift Enter for description and markers." style="font-size:${(sxFontSize(1) * A / 23).toFixed(2)}px" x="${G.toFixed(2)}" y="${K.toFixed(2)}" dominant-baseline="middle"${V} transform="rotate(${z.toFixed(2)} ${G.toFixed(2)} ${K.toFixed(2)})">${Hi(i.name)}</text></g>`;
                for (let sxTi = 0; sxTi < e.topics.length; sxTi++) {
                    const t = e.topics[sxTi];
                    if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                    window.__sxNodeTick && window.__sxNodeTick();
                    const n = t.topic, a = n.label, r = n.id, o = Boolean(n.isSubcategory);
                    if ($n && !$n.has(r)) continue;
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
                    const g = l.x + Math.cos(s) * h, m = l.y + Math.sin(s) * h, y = Ya(l.x, l.y, g, m), b = Math.max(12, Math.min(17, Za.fittedSize(a, y.labelWidth, void 0))), w = y.labelD, x = o ? "all" : Ra(r);
                    const E = [ "node-group" ];
                    o && E.push("subcategory-node");
                    const A = cn[Vi()], C = dn[Vi()];
                    o || Rt || !Qi() && !Kd() || !qa(r, Je) || E.push("is-fantasy-only"), o || Rt || !Qi() && !Kd() || !qa(r, et) || E.push("is-already-tried"), 
                    !o && A && A.has(r) && !Eo(Vi(), r) && E.push("import-updated"), !o && C && C.has(r) && !Eo(Vi(), r) && E.push("import-newest");
                    const M = n.allImported.some(e => Ra(e.id) === Pt);
                    "all" === Pt || o || x === Pt || M || E.push("is-hidden"), !Tt || String(a || "").toLowerCase().includes(Tt) || String(i.name || "").toLowerCase().includes(Tt) || n.allImported.some(e => String(e.label || "").toLowerCase().includes(Tt)) || E.push("is-dim");
                    o && n.unratedHub && E.push("is-unrated"); /* DIMFIX F2 (was HUB-BACKBONE W4): the dim reads the F1 rating-presence flag, not the Net-filtered allImported list; the dedicated class (never is-dim) keeps selection/focus precedence clean */
                    !o && !Rt && Kd() && !sxTopicKnownInOpenGroup(r) && E.push("is-unrated");
                    const I = null !== Dt && (r === Dt || dCat === Dt || t.children.some(e => e.child.id === Dt));
                    Dt && !I && E.push("is-dim"), Dt && r === Dt && E.push("is-preview");
                    const P = Za.topicLabelOffset(y.routedLength, y.labelOffset, t.cloudIndex), L = Math.cos(s) < 0, T = L ? `pr-${r}` : `p-${r}`, F = L ? y.routedLength - P : P, N = L ? ' text-anchor="end"' : "", _ = L ? `<path id="pr-${r}" class="concept-path" d="${y.reverseD}" fill="none" stroke="transparent"/>` : "", D = Vi(), R = Rt ? null : o ? function(e, t) {
                        return pa((e?.topics || []).map(Wn), t, e => ua(e, t));
                    }(n.group, D) : ua(r, D), O = o || Rt ? null : Qe[D]?.[r], B = o ? Ae(a, i.name) : Oe(a, i.name), j = o || Rt ? null : ca(r, D), q = o && !Rt ? ya(n.group, D, "give", r) : null, H = o && !Rt ? ya(n.group, D, "receive", r) : null, W = j && j.giveKnown ? j.give : q, U = j && j.receiveKnown ? j.receive : H, G = o ? Q.color : Rt ? "var(--green)" : null === R ? Te(B.lineColor) : zi(R), K = Rt ? "var(--green)" : null === W ? Te(B.lineColor) : zi(W), z = Rt ? "var(--green)" : null === U ? Te(B.lineColor) : zi(U), V = y.icon.x, Y = y.icon.y, X = n.allImported, Z = n.topicFilter, J = on.has(r), ee = o ? Sa(r, qn[r], D, { tapFirst: !0 }) : ka(a, $e(qn[r], B, R, {
                        key: B.hankyKey
                    }, O), xa(r, D), { tapFirst: !0 }), te = sxIconDiameter(2), ne = te / 2, ie = te / 6, ae = te / 24, re = `<g class="topic-icon${o ? " subcategory-icon" : "noCode" === B.hankyKey ? " no-hanky-code-icon" : ""}${B.glyphFallback ? " glyph-fallback" : ""}"${B.glyphFallback ? ' data-glyph-fallback="star"' : ""} data-diameter="${te}" ${ee} aria-hidden="true" style="color:${B.color}" transform="translate(${(V - ne).toFixed(2)} ${(Y - ne).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${ne}" cy="${ne}" r="${ne - .5}"/><circle class="icon-disc" cx="${ne}" cy="${ne}" r="${ne - 2}"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="${ne}" cy="${ne}" r="${ne - 3.5}"/><g transform="translate(${ie.toFixed(3)} ${ie.toFixed(3)}) scale(${ae.toFixed(5)})">${B.glyph}${B.accent}</g></g>`, oe = o ? "" : k(r, O, !Rt && qa(r, Je), !Rt && qa(r, et), !Rt && Boolean(tt[D]?.[r]?.length), y.icon, y.ux, y.uy), se = J ? Z.hidden : X.length || (o ? n.group.topics.length : 0), /* HUB-BACKBONE badge: a wholly-unrated collapsed hub wears +N with N = its TOTAL topic count (owner ruling 2026-10-23); expanded and partially-rated hubs keep today's counts; plain topics unchanged */ le = yi(y.icon.x + y.ux * (ne + 20), y.icon.y + y.uy * (ne + 20), se, r), ce = X.length ? ` aria-expanded="${J}"` : "", de = X.length ? `${J ? "Topics shown" : "Topics hidden"}; press Enter to ${J ? "collapse" : "expand"}. ` : "", sxFl = sxPairTapers ? sxPairTapers(r) : null, peTr = Ga.trimToIcons(l.x, l.y, V, Y, sxIconRadius(1), sxIconRadius(2)), peT = `M ${peTr.sx0.toFixed(2)} ${peTr.sy0.toFixed(2)} L ${peTr.sx1.toFixed(2)} ${peTr.sy1.toFixed(2)}`, ue = o ? renderKinkLine(l.x, l.y, V, Y, B.hankyKey, Rt ? "var(--green)" : null != R ? zi(R) : Te(B.lineColor), sxFl ? sxFl.give : Rt || null !== q ? K : null, sxFl ? sxFl.receive : Rt || null !== H ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, pr.subcategoryIcon, sxIconDiameter(1), sxIconDiameter(2), 2) : renderKinkLine(l.x, l.y, V, Y, B.hankyKey, Rt ? "var(--green)" : j && (j.giveKnown || j.receiveKnown) ? zi(((j.giveKnown ? j.give : 0) + (j.receiveKnown ? j.receive : 0)) / ((j.giveKnown ? 1 : 0) + (j.receiveKnown ? 1 : 0))) : B.lineColor, sxFl ? sxFl.give : Rt || j && j.giveKnown ? K : null, sxFl ? sxFl.receive : Rt || j && j.receiveKnown ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, 48, sxIconDiameter(1), sxIconDiameter(2), 2), pe = o ? "" : `<g class="second-gen-rating-controls-only">${Ka(r, peT, 18, a, y.nx, y.ny, l.x, l.y, V, Y, !0, pr.topicIcon, G, !0, "", null, null, null, !1, !0, h.length, null, sxIconDiameter(2), 2)}</g>`, he = o ? "map-label concept-path-label subcategory-label" : "map-label concept-path-label hanky-topic-label", ge = o ? `${Hi(a)} subcategory. ${de}` : `${Hi(a)}. ${de}Press Shift Enter for description and markers.`;
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
                        }(V, Y, l.x, l.y, 0, s, hr(3), pr.importedIcon / 2 + 10, e.curve, 270, c.offset, u, c.limit), h = Math.cos(s) < 0, g = h ? `pr-${n.id}` : `p-${n.id}`, m = h ? p.routedLength - p.labelOffset : p.labelOffset, y = h ? ' text-anchor="end"' : "", b = h ? `<path id="pr-${n.id}" class="concept-path" d="${p.reverseD}" fill="none" stroke="transparent"/>` : "", w = Rt ? null : ua(n.id, D), x = Rt ? null : Qe[D]?.[n.id], S = Rt ? null : ca(n.id, D), $ = Le(n.label, i.name), E = S && S.giveKnown ? S.give : null, A = S && S.receiveKnown ? S.receive : null, M = Rt ? "var(--green)" : null === E ? Te($.lineColor) : zi(E), I = Rt ? "var(--green)" : null === A ? Te($.lineColor) : zi(A), P = Rt ? "var(--green)" : null === w ? Te($.lineColor) : zi(w), L = Oe(n.label, i.name), T = sxIconDiameter(3), F = T / 2, N = p.icon.x, _ = p.icon.y, R = Boolean(Tt && (String(n.label || "").toLowerCase().includes(Tt) || String(a || "").toLowerCase().includes(Tt) || String(i.name || "").toLowerCase().includes(Tt))), O = [ "node-group", o ? "subcategory-topic" : "imported-child" ];
                        !Rt && (Qi() || Kd()) && qa(n.id, Je) && O.push("is-fantasy-only"), !Rt && (Qi() || Kd()) && qa(n.id, et) && O.push("is-already-tried"), 
                        C && C.has(n.id) && !Eo(Vi(), n.id) && O.push("import-newest"), "all" !== Pt && Ra(n.id) !== Pt && O.push("is-hidden"), 
                        Tt && !R && O.push("is-dim"), Kd() && !sxTopicKnownInOpenGroup(n.id) && O.push("is-unrated");
                        const B = null !== Dt && (n.id === Dt || r === Dt || dCat === Dt);
                        Dt && !B && O.push("is-dim"), Dt && n.id === Dt && O.push("is-preview");
                        const j = !o && Boolean(si(n.id)) ? ` Tap to adopt it into ${wt[Vi()] || "the active profile"} unrated, then use the normal give and receive controls.` : "", q = `<g class="topic-icon${"noCode" === $.key ? " no-hanky-code-icon" : ""}${L.glyphFallback ? " glyph-fallback" : ""}"${L.glyphFallback ? ' data-glyph-fallback="star"' : ""} data-diameter="${T}" ${ka(n.label, $e(n, L, w, $, x), xa(n.id, D), { tapFirst: !0 })} aria-hidden="true" style="color:${L.color}" transform="translate(${(N - F).toFixed(2)} ${(_ - F).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${F}" cy="${F}" r="${F - .5}"/><circle class="icon-disc" cx="${F}" cy="${F}" r="${F - 2}"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="${F}" cy="${F}" r="${F - 3.5}"/><g transform="translate(${(T / 6).toFixed(2)} ${(T / 6).toFixed(2)}) scale(${(T / 24).toFixed(5)})">${L.glyph}${L.accent}</g></g>`, H = k(n.id, x, !Rt && qa(n.id, Je), !Rt && qa(n.id, et), !Rt && Boolean(tt[D]?.[n.id]?.length), p.icon, p.ux, p.uy), sxFl = sxPairTapers ? sxPairTapers(n.id) : null, pTr = Ga.trimToIcons(V, Y, o ? N : l.x, o ? _ : l.y, sxIconRadius(2), sxIconRadius(3)), pT = `M ${pTr.sx0.toFixed(2)} ${pTr.sy0.toFixed(2)} L ${pTr.sx1.toFixed(2)} ${pTr.sy1.toFixed(2)}`, W = o ? renderKinkLine(V, Y, N, _, $.key, $.lineColor, sxFl ? sxFl.give : Rt || S && S.giveKnown ? M : null, sxFl ? sxFl.receive : Rt || S && S.receiveKnown ? I : null, sxFl ? !0 : null !== w, e.cloudCount, n.id, n.label, D, pr.subcategoryIcon, 48, sxIconDiameter(2), sxIconDiameter(3), 3) : "", U = o ? `<g class="second-gen-rating-controls-only">${Ka(n.id, pT, 18, n.label, p.nx, p.ny, V, Y, N, _, !0, pr.topicIcon, P, !0, "", null, null, null, !1, !0, h.length, null, sxIconDiameter(3), 3)}</g>` : Ka(n.id, pT, 6, n.label, p.nx, p.ny, V, Y, l.x, l.y, !0, pr.importedIcon, P, !0, null === w && "noCode" === $.key ? "no-hanky-code-line" : "", null, null, $.lineColor, "noCode" === $.key, null !== w, h.length, SpokeGeometry.buildBaseCircle(V, Y, sxIconRadius(2)), sxIconDiameter(3), 3), G = o ? `${Hi(n.label)} in ${Hi(a)}. Press Shift Enter for description and markers.` : `${Hi(n.label)}, imported under ${Hi(a)}.${Hi(j)} Press Shift Enter for description and markers.`;
                        v += `<g class="${O.join(" ")}" data-layout-key="${n.id}" data-layout-x="${N.toFixed(2)}" data-layout-y="${_.toFixed(2)}" data-rated="${null === w ? "false" : "true"}" style="--profile-color:${f};--family-color:${Q.color}">${W}${U}${q}${H}<path id="p-${n.id}" class="concept-path" d="${p.labelD}" fill="none" stroke="transparent"/>${b}<text class="map-label concept-path-label${o ? " hanky-topic-label" : ""}" data-topic-id="${n.id}" data-id="${n.id}" data-path-id="p-${n.id}" data-label-offset="${p.labelOffset}" ${Sa(n.id, n, D)} tabindex="0" role="button" aria-label="${G}" style="font-size:${sxFontSize(3).toFixed(2)}px" dominant-baseline="middle"><textPath href="#${g}" xlink:href="#${g}" startOffset="${m}"${y}>${Hi(n.label)}</textPath></text></g>`;
                    });
                }
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
                    function* sxFinaliseStems() {
                        const centres = new Map();
                        const sxCentreGroups = Array.from(In.querySelectorAll("[data-layout-key]"));
                        for (let sxCi = 0; sxCi < sxCentreGroups.length; sxCi++) {
                            const g = sxCentreGroups[sxCi];
                            if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                            const x = Number.parseFloat(g.dataset.layoutX), y = Number.parseFloat(g.dataset.layoutY);
                            Number.isFinite(x) && Number.isFinite(y) && !centres.has(g.dataset.layoutKey) && centres.set(g.dataset.layoutKey, {
                                x: x,
                                y: y
                            });
                        }
                        // Pre-pass: a spoke's own flank arcs record the
                        // render-time parent/child centres; sibling stems
                        // of the same spoke (tapered bands) anchor to
                        // those when their own d carries no tip circle.
                        const spokeOld = new Map();
                        const sxStemPass = Array.from(In.querySelectorAll(".tapered-stem"));
                        for (let sxSt = 0; sxSt < sxStemPass.length; sxSt++) {
                            const stem = sxStemPass[sxSt];
                            if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                            const key = sxStemChildKey(stem), d = stem.getAttribute("d");
                            if (!key || !d || spokeOld.has(key)) continue;
                            const {arcs} = sxParseStemD(d);
                            if (arcs.length < 2 || arcs[0].at < 6) continue;
                            const tip = sxArcCentre(arcs[0]), base = sxArcCentre(arcs[arcs.length - 1]);
                            tip && base && spokeOld.set(key, {
                                tip: tip,
                                base: base
                            });
                        }
                        for (let sxSt = 0; sxSt < sxStemPass.length; sxSt++) {
                            const stem = sxStemPass[sxSt];
                            if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                            try {
                                sxReanchorStem(stem, centres, spokeOld);
                            } catch (e) { /* one bad stem never blocks the rest */ }
                        }
                    }
                    sxStemFinaliseHook = () => {
                        const sxStemGen = sxFinaliseStems();
                        let sxStemStep;
                        do { sxStemStep = sxStemGen.next(); } while (!sxStemStep.done);
                    };


            try {
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
                    const sxSettleGroups = Array.from(In.querySelectorAll(".node-group"));
                    for (let sxSi = 0; sxSi < sxSettleGroups.length; sxSi++) {
                        const l = sxSettleGroups[sxSi];
                        if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                        blitObst && blitFlushObstacles(blitObst, r, o, l.dataset.layoutKey);
                        if (l.classList.contains("is-hidden")) continue;
                        const c = l.querySelector(".category-label,.map-label"), d = c && c.querySelector("textPath"), u = d && d.getAttribute("href"), p = c && (c.dataset.pathId || u && u.slice(1)), h = p && e.byId(p);
                        if (!c || !h) continue;
                        const g = h.getTotalLength();
                        if (!g) continue;
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
                    }
                    blitObst && blitFlushObstacles(blitObst, r, o, null);
                    yield* sxFinaliseStems();
                    !function() {
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
            } catch (e) {
                console.warn("Direction controls kept at their fallback positions.", e);
            }
            try {
                if (!In.querySelector(":scope > .spoke-underlay")) {
                    const e = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    e.setAttribute("class", "spoke-underlay"), e.setAttribute("aria-hidden", "true");
                    const sxUnderGroups = Array.from(In.querySelectorAll(".node-group[data-layout-key]"));
                    for (let sxUi = 0; sxUi < sxUnderGroups.length; sxUi++) {
                        const t = sxUnderGroups[sxUi];
                        if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                        const n = [];
                        t.querySelectorAll(vr).forEach(el => {
                            __sxClosestAction(el, "directionControl") || __sxClosestAction(el, "secondGenRatingControls") || el.classList.contains("visual-rail") && el.classList.contains("rating-rail") || n.push(el);
                        });
                        if (!n.length) continue;
                        const i = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        i.setAttribute("class", `${t.getAttribute("class") || ""} spoke-underlay-item`);
                        const a = t.getAttribute("style");
                        a && i.setAttribute("style", a), i.dataset.spokeFor = t.dataset.layoutKey, n.forEach(el => i.appendChild(el)),
                        e.appendChild(i);
                    }
                    e.childNodes.length && In.insertBefore(e, In.firstChild);
                }
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
            }(E, A, C));
            // The walks below move every visible name and rating control.
            // They used to be one generator step. WebKit stayed inside
            // that step long enough that the boot dial, the 12s failsafe,
            // and a waiting page.evaluate never ran. A bare yield returns
            // the step to Mr, whose chunk budget gives the event loop a
            // frame. The synchronous render path calls next() straight
            // through, so those yields do not paint a gap.
            let sxStackSlice = performance.now();
            const sxOldOverlay = In.querySelector(".node-interaction-overlay");
            sxOldOverlay && sxOldOverlay.remove();
            const sxOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
            sxOverlay.setAttribute("class", "node-interaction-overlay");
            const sxStackGroups = Array.from(In.querySelectorAll(".node-group:not(.is-hidden)"));
            for (let sxGi = 0; sxGi < sxStackGroups.length; sxGi++) {
                const e = sxStackGroups[sxGi];
                const n = e.querySelector(":scope > .hidden-count-badge");
                if (n && sxOverlay.appendChild(n), isSubId(e.dataset.layoutKey)) {
                    const a = Number(e.dataset.layoutX), r = Number(e.dataset.layoutY);
                    if (Number.isFinite(a) && Number.isFinite(r)) {
                        const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle"), topicHit = e.querySelector(":scope > .concept-hit"), topicIcon = e.querySelector(":scope > .topic-icon"), d = Number(topicIcon && topicIcon.dataset.diameter);
                        hit.setAttribute("class", "category-toggle-hit category-icon-hit"), hit.setAttribute("data-id", e.dataset.layoutKey), 
                        hit.setAttribute("cx", a.toFixed(2)), hit.setAttribute("cy", r.toFixed(2)), hit.setAttribute("r", String(Number.isFinite(d) && d > 0 ? d / 2 : sxIconRadius(2))), 
                        hit.setAttribute("aria-hidden", "true");
                        const o = topicHit && topicHit.dataset.uiTooltip;
                        o && (hit.dataset.uiTooltip = o, hit.setAttribute("data-tooltip-hover-only", ""), ul(hit)), 
                        hit.addEventListener("click", Qa), sxOverlay.appendChild(hit);
                    }
                } else if (isCatId(e.dataset.layoutKey)) {
                    const label = e.querySelector(":scope > .category-label");
                    if (label) {
                        const clone = label.cloneNode(!0);
                        clone.setAttribute("class", "category-toggle-hit"), clone.setAttribute("data-id", e.dataset.layoutKey), 
                        clone.removeAttribute("tabindex"), clone.removeAttribute("role"), clone.removeAttribute("aria-label"), 
                        clone.removeAttribute("aria-expanded"), clone.setAttribute("aria-hidden", "true"), clone.addEventListener("click", Qa), 
                        sxOverlay.appendChild(clone);
                    }
                    const a = Number(e.dataset.layoutX), r = Number(e.dataset.layoutY);
                    if (Number.isFinite(a) && Number.isFinite(r)) {
                        const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle"), topicHit = e.querySelector(":scope > .concept-hit"), branchIcon = e.querySelector(":scope > .branch-icon"), d = Number(branchIcon && branchIcon.dataset.diameter);
                        hit.setAttribute("class", "category-toggle-hit category-icon-hit"), hit.setAttribute("data-id", e.dataset.layoutKey), 
                        hit.setAttribute("cx", a.toFixed(2)), hit.setAttribute("cy", r.toFixed(2)), hit.setAttribute("r", String(Number.isFinite(d) && d > 0 ? d / 2 : sxIconRadius(1))), 
                        hit.setAttribute("aria-hidden", "true");
                        const o = topicHit && topicHit.dataset.uiTooltip;
                        o && (hit.dataset.uiTooltip = o, hit.setAttribute("data-tooltip-hover-only", ""), ul(hit)), 
                        hit.addEventListener("click", Qa), sxOverlay.appendChild(hit);
                    }
                }
                if (performance.now() - sxStackSlice >= 40) {
                    yield;
                    sxStackSlice = performance.now();
                }
            }
            sxOverlay.childNodes.length && In.appendChild(sxOverlay);
            const sxCenterToggle = In.querySelector("[data-center-branch-toggle-wrap]");
            sxCenterToggle && In.appendChild(sxCenterToggle);
            const sxLabelExisting = In.querySelector(":scope > .map-label-stack");
            if (sxLabelExisting) In.appendChild(sxLabelExisting);
            else {
                const sxLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
                sxLabels.setAttribute("class", "map-label-stack");
                for (let sxGi = 0; sxGi < sxStackGroups.length; sxGi++) {
                    const e = sxStackGroups[sxGi];
                    const labelNode = e.querySelector(":scope > .category-label, :scope > .map-label");
                    if (labelNode) {
                        const stackItem = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        stackItem.setAttribute("class", "map-label-stack-item");
                        const stackStyle = e.getAttribute("style");
                        stackStyle && stackItem.setAttribute("style", stackStyle), e.classList.contains("is-dim") && stackItem.setAttribute("opacity", ".18"), 
                        stackItem.appendChild(labelNode), sxLabels.appendChild(stackItem);
                    }
                    if (performance.now() - sxStackSlice >= 40) {
                        yield;
                        sxStackSlice = performance.now();
                    }
                }
                sxLabels.childNodes.length && In.appendChild(sxLabels);
            }
            const sxOldControls = In.querySelector(":scope > .direction-control-stack");
            sxOldControls && sxOldControls.remove();
            const sxControls = document.createElementNS("http://www.w3.org/2000/svg", "g");
            sxControls.setAttribute("class", "direction-control-stack");
            const sxControlGroups = Array.from(In.querySelectorAll(".node-group:not(.is-hidden):not(.rating-control-stack-item)"));
            for (let sxGi = 0; sxGi < sxControlGroups.length; sxGi++) {
                const e = sxControlGroups[sxGi];
                const controls = Array.from(e.querySelectorAll(":scope > .direction-control"));
                if (controls.length) {
                    const stackItem = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    stackItem.setAttribute("class", "node-group rating-control-stack-item");
                    const stackStyle = e.getAttribute("style");
                    stackStyle && stackItem.setAttribute("style", stackStyle), e.classList.contains("is-dim") && stackItem.setAttribute("opacity", ".18"), 
                    controls.forEach(el => stackItem.appendChild(el)), sxControls.appendChild(stackItem);
                }
                if (performance.now() - sxStackSlice >= 40) {
                    yield;
                    sxStackSlice = performance.now();
                }
            }
            sxControls.childNodes.length && In.appendChild(sxControls);
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
            const sxStaleIconLayer = In.querySelector(":scope > .category-icon-hit-layer");
            sxStaleIconLayer && sxStaleIconLayer.remove();
            const sxIconHits = In.querySelectorAll(".node-interaction-overlay > circle.category-icon-hit");
            if (sxIconHits.length) {
                const sxIconLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
                sxIconLayer.setAttribute("class", "category-icon-hit-layer"), sxIconHits.forEach(el => sxIconLayer.appendChild(el)), 
                In.appendChild(sxIconLayer);
            }
            // Q3 selection sync: mirror every RENDERED selection
            // change into the Layout Editor, including the paths
            // that mutate the selection without notifying —
            // label/icon toggle taps (Si/$i), rating-target
            // clears, and profile resets all assign Lt and land
            // here through Mr(). A change to null is a map-side
            // clear, mirrored as an editor clear. Editor-
            // initiated selection (API selectNode) does not
            // render, so it never echoes back through here.
            if (Lt !== sxSelEditorMirrored) {
                sxSelEditorMirrored = Lt;
                try {
                    const ui = window.__SEXCAPADES_LAYOUT_UI;
                    if (ui) {
                        if (Lt) ui.selectNode && ui.selectNode(Lt); else ui.clearSelection && ui.clearSelection();
                    }
                } catch (err) { __sxErrLog("layout-select-sync", err); }
            }
            window.__sxLoad && window.__sxLoad(96 /* F5 checkpoint: DOM stacks, interaction overlays, and controls installed */);
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
                yield* sxFinaliseStems();
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
                const sxGlanceRings = In && In.querySelector(".center-glance-rings");
                sxGlanceRings && In.appendChild(sxGlanceRings);
            } catch (_) {}
            try {
                blitPaintEnd(scKeep, scSeg);
            } catch (_) {
                __sxErrLog("layout-blit-end", _);
            try {
                yield* sxFinaliseStems();
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
        // Boot-stall fix (mechanism 2): set by Mr() for the boot paint
        // only (see the sxBootArm assignment there); Ar()'s no-profile
        // early return skips itself while this is true, so the boot
        // paint always paints the map.
        let sxBootPaint = !1;
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
            const sxBootArm = sxConsumeChunkArm("__sxBootChunkPaint");
            let sxBootChunk = sxBootArm || sxConsumeChunkArm("__sxRouteChunkPaint") || sxConsumeChunkArm("__sxCloseChunkPaint");
            // Boot-stall fix (mechanism 2): the boot paint always paints
            // the map. The Remember restore can land before this paint
            // starts, leaving profiles restored but none selected, and
            // the no-profile early return in Ar below would then install
            // the empty map and finish the boot at 100% with 0 nodes.
            // (A snapshot of c/Mt would not help: Mr, Ar and the check
            // run in one synchronous task, so it would read the same
            // state.) Later paints keep the early return.
            sxBootPaint = sxBootArm;
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
            return window.sxPaintPromise = sxPaintPromise = p, p.then(ok => (release(), sxPaintPromise === p && (window.sxPaintPromise = sxPaintPromise = null), ok), () => (release(), window.sxPaintPromise = null, !1));
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
        sxBindMarkRatings();
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
        function sxSyncMarkRatings(id) {
            const give = e.byId("markGive"), recv = e.byId("markReceive"), giveOut = e.byId("markGiveOut"), recvOut = e.byId("markReceiveOut"), giveLabel = e.byId("markGiveLabel"), recvLabel = e.byId("markReceiveLabel"), recvRow = e.byId("markReceiveRow");
            if (!give || !id) return;
            const shape = Ge(id), rec = ca(id, Vi()), single = Boolean(shape.single);
            recvRow && (recvRow.hidden = single);
            giveLabel && (giveLabel.textContent = single ? shape.labels[0] || "Rating" : shape.labels[0] || "Give");
            recvLabel && (recvLabel.textContent = shape.labels[1] || "Receive");
            give.value = rec.giveKnown ? rec.give : 0;
            recv && (recv.value = rec.receiveKnown ? rec.receive : 0);
            giveOut && (giveOut.textContent = rec.giveKnown ? String(Math.round(rec.give)) : "Unrated");
            recvOut && (recvOut.textContent = rec.receiveKnown ? String(Math.round(rec.receive)) : "Unrated");
        }
        function sxBindMarkRatings() {
            const give = e.byId("markGive"), recv = e.byId("markReceive"), giveOut = e.byId("markGiveOut"), recvOut = e.byId("markReceiveOut");
            if (!give || give.dataset.bound) return;
            give.dataset.bound = "1";
            const show = (input, out, known) => { out && (out.textContent = known ? String(Math.round(Number(input.value))) : "Unrated"); };
            give.addEventListener("input", () => show(give, giveOut, !0));
            give.addEventListener("change", () => { Qr && (To(Qr, "give", Number(give.value), !0), sxSyncMarkRatings(Qr)); });
            e.byId("markGiveClear") && e.byId("markGiveClear").addEventListener("click", () => { Qr && (Fo(Qr, "give", !0), sxSyncMarkRatings(Qr)); });
            if (!recv) return;
            recv.addEventListener("input", () => show(recv, recvOut, !0));
            recv.addEventListener("change", () => { Qr && (To(Qr, "receive", Number(recv.value), !0), sxSyncMarkRatings(Qr)); });
            e.byId("markReceiveClear") && e.byId("markReceiveClear").addEventListener("click", () => { Qr && (Fo(Qr, "receive", !0), sxSyncMarkRatings(Qr)); });
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
            sxSyncMarkRatings(e), 
            Pr.dataset.openedAt = String(performance.now()),
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
                label: sxName(i),
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
            let r = a && (a === Et || vt[a]) ? a : Mt && vt[Mt] ? Mt : Et;
            if (r === Et && typeof ik === "function" && typeof SX_PROFILE_RECORD_LISTS !== "undefined") {
                const pid = ik("New profile");
                SX_PROFILE_RECORD_LISTS.forEach(k => k[pid] = {});
                wt[pid] = "New profile";
                vt[pid] = {};
                Lo(pid);
                Mt = pid;
                if (typeof Go !== "undefined" && Go === Et) Go = pid;
                if (typeof sxAutoSelect === "function") sxAutoSelect(pid);
                r = pid;
                if (typeof Jw === "function") Jw();
            }
            const o = Io(r), s = Math.max(-100, Math.min(100, Number(n)));
            if (Ge(e, r).single) {
                const t = o[e], n = "number" != typeof t || Number(t) !== s;
                return o[e] = s, Co(r, e, "give", "manual"), Co(r, e, "receive", "manual"), n && zt(r),
                $o(e, r), i && Mr(), s;
            }
            const l = o[e], c = l && "object" == typeof l ? Object.assign({}, l) : {}, d = !Object.prototype.hasOwnProperty.call(c, t) || Number(c[t]) !== s;
            return c[t] = s, o[e] = c, Co(r, e, t, "manual"), d && zt(r), $o(e, r),
            i && Mr(), c[t];
        }
        function Fo(e, t, n = !0, i = null) {
            let a = i && (i === Et || vt[i]) ? i : Mt && vt[Mt] ? Mt : Et;
            if (a === Et && typeof ik === "function" && typeof SX_PROFILE_RECORD_LISTS !== "undefined") {
                const pid = ik("New profile");
                SX_PROFILE_RECORD_LISTS.forEach(k => k[pid] = {});
                wt[pid] = "New profile";
                vt[pid] = {};
                Lo(pid);
                Mt = pid;
                if (typeof Go !== "undefined" && Go === Et) Go = pid;
                if (typeof sxAutoSelect === "function") sxAutoSelect(pid);
                a = pid;
                if (typeof Jw === "function") Jw();
            }
            const r = Io(a), o = r[e], s = Ge(e, a).single, l = "number" == typeof o || Boolean(o && "object" == typeof o && Object.prototype.hasOwnProperty.call(o, t));
            if (s) delete r[e], Mo(a, e, "give"), Mo(a, e, "receive"); else if ("number" == typeof o) {
                const n = "give" === t ? "receive" : "give";
                r[e] = {
                    [n]: o
                };
            } else if (o && "object" == typeof o) {
                const n = Object.assign({}, o);
                delete n[t], Object.prototype.hasOwnProperty.call(n, "give") || Object.prototype.hasOwnProperty.call(n, "receive") ? r[e] = n : delete r[e];
            }
            s || Mo(a, e, t), Nt = null, l && (zt(a), $o(e, a)), n && Mr();
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
        Pr && Pr.querySelectorAll("[data-mark]").forEach(e => e.addEventListener("click", () => {
            if (!Qr || performance.now() - Number(Pr.dataset.openedAt || 0) < 400) return;
            const t = Vi(), previousRatedCount = cs(t).rated, n = Qr, i = e.dataset.mark, a = Qe[t][n];
            "neutral" === i ? delete Qe[t][n] : Qe[t][n] = i, Pr.querySelectorAll("[data-mark]").forEach(e => e.setAttribute("aria-checked", String(e.dataset.mark === ("neutral" === i ? "neutral" : i)))), 
            a !== ("neutral" === i ? void 0 : i) && zt(t), Mr(), checkMilestoneTransition(t, previousRatedCount);
        })), Pr && Pr.querySelectorAll("[data-topic-flag]").forEach(e => e.addEventListener("click", () => {
            if (!Qr || performance.now() - Number(Pr.dataset.openedAt || 0) < 400) return;
            const t = Vi(), previousRatedCount = cs(t).rated, n = Qr, i = "fantasy" === e.dataset.topicFlag ? Je : et, a = !i[t]?.[n];
            i[t] || (i[t] = {}), a ? i[t][n] = !0 : delete i[t][n], e.setAttribute("aria-pressed", String(a)), 
            zt(t), Mr(), checkMilestoneTransition(t, previousRatedCount);
        })), Zr && Zr.addEventListener("change", () => {
            ao(), Mr({
                animate: !1
            });
        }), Vr && Vr.addEventListener("click", () => {
            oo();
            const e = zr ? zr.hidden : !0;
            zr && (zr.hidden = !e), Vr.setAttribute("aria-expanded", String(e));
        }), zr && zr.addEventListener("click", e => e.stopPropagation()), jr && jr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(jr);
        }), qr && qr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(qr);
        }), Hr && Hr.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), ko(Hr);
        }), Ur && Ur.addEventListener("click", e => {
            e.stopPropagation(), __sxClosestAction(e.target, "openLocalCommunities") && (oo(), 
            so(), Ol());
        }), window.addEventListener("resize", () => {
            no && Ur && !Ur.hidden && bo(no);
        }), e.byId("closeMarkMenu") && e.byId("closeMarkMenu").addEventListener("click", so), window.__sxOnPtr( e => {
            (!Pr || Pr.hidden) || (!zr || zr.hidden) || __sxClosestAction(e.target, "markMeta") || ro(), (!Ur || Ur.hidden) || Ur.contains(e.target) || e.target === no || oo(),
            (!Pr || Pr.hidden) || Pr.contains(e.target) || so();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && ((!Ur || Ur.hidden) ? so() : oo());
        });
