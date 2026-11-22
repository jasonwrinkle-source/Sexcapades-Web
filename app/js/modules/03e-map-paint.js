        function* Ar(i = {}) {
            // JOB B GLIDE FIX — previous-positions capture: read the live
            // node positions BEFORE sxVaultCaptureCurrent() runs. The vault
            // moves In's children into a fragment (emptying In) whenever a
            // vault key is active, so the old r-population below (which ran
            // after the vault) always read an empty layer and no moved node
            // was ever detected. Capturing here keeps r (and the exit-clone
            // source list) populated in both the vaulted and unvaulted case.
            const r = new Map, sxPrevGroups = [];
            try {
                In.querySelectorAll("[data-layout-key]").forEach(e => {
                    r.set(e.dataset.layoutKey, { x: Number(e.dataset.layoutX), y: Number(e.dataset.layoutY) });
                    sxPrevGroups.push(e);
                });
            } catch (_) {}
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
            // LAYOUT GLIDE (tweening Jobs A+B, 2026-11-13): the end glide
            // is COUPLED to the global animations toggle — the toggle
            // is the master switch and governs all map animation
            // (Jason, 2026-11-13 ~16:57 CST). Glide runs only when
            // the caller passes animate AND mn.animations is on.
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
            // r (previous positions) and sxPrevGroups were captured at the
            // top of Ar, before the vault emptied In. The exit-clone source
            // below reads sxPrevGroups (not In) for the same reason.
            const o = new Map, s = "lite" === Kp ? 18 : 48;
            let l = 0;
            sxPrevGroups.forEach(e => {
                const t = e.dataset.layoutKey;
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
                        parentId: i ? Un(e.name, i.name) : null,
                        poleReading: t && t.poleReading || null,
                        poleEnemies: t && Array.isArray(t.poleEnemies) ? t.poleEnemies : null
                    };
                });
            }), window.__sxLoad && window.__sxLoad(12 /* F5 checkpoint contract (at __sxProgressWidget in index.html): displayed band value — topic index */), (!(c || Mt && vt[Mt]) && !sxBootPaint && !window.__SX_FORCE_UNRATED_TREE)) return n(In, `<g>${oa()}${function(e) {
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
            /* Skin switch (2026-11-17): the unrated-tree flag is one-shot
               per paint, like the boot-chunk arm — consumed here, right
               after the solve that used it, so no later paint sees it. */
            window.__SX_FORCE_UNRATED_TREE = false;
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
                            if (sxTabCtx && sxTabCtx.profiles && sxTabCtx.profiles.length >= 2) return sxRingValuesForCast(sxTabCtx.profiles, "circledot" === sxTab.kind ? "straight" : "circleminus" === sxTab.kind ? "minus" : undefined);
                        }
                    } catch (err) { __sxErrLog("sx-header-match-rings", err); }
                    const rec = Mt && ft[Mt] ? ft[Mt] : null;
                    if (rec && "group" === rec.kind && Array.isArray(rec.sourceProfiles) && rec.sourceProfiles.length >= 2) return sxRingValuesForCast(rec.sourceProfiles, rec.pairOp);
                    if (Mt && vt[Mt]) return sxRingValuesForProfile(sxProfileById(Mt));
                    return null;
                })();
                const sxArc = v => null == v || !Number.isFinite(v) ? 0 : Math.max(0, Math.min(100, v)),
                    sxOuterEl = e.byId("headerHorizonValue"), sxInnerEl = e.byId("headerPersonalValue"), sxCapEl = e.byId("headerRingCaption"), sxCtl = e.byId("headerHorizonControl"), sxInnerCtl = e.byId("headerPersonalControl") || (sxCtl && sxCtl.nextElementSibling);
                if (sxOuterEl) { const a = sxArc(sxHdrVals && sxHdrVals.outer); sxOuterEl.style.strokeDasharray = `${a} ${100 - a}`; sxOuterEl.style.opacity = sxHdrVals && null != sxHdrVals.outer ? "1" : "0"; }
                if (sxInnerEl) { const a = sxArc(sxHdrVals && sxHdrVals.inner); sxInnerEl.style.strokeDasharray = `${a} ${100 - a}`; sxInnerEl.style.opacity = sxHdrVals && null != sxHdrVals.inner ? "1" : "0"; }
                if (sxCapEl) sxCapEl.textContent = sxHdrVals ? `${sxHdrVals.outerLabel} ${sxPctText(sxHdrVals.outer)} · ${sxHdrVals.innerLabel} ${sxPctText(sxHdrVals.inner)}` : "";
                if (sxCtl && sxHdrVals) {
                    const outerTip = `${sxHdrVals.outerLabel}: ${sxPctText(sxHdrVals.outer)}. The share of the whole map attended to — rated or marked. Tap for details.`;
                    sxCtl.setAttribute("aria-label", outerTip);
                    sxCtl.dataset.uiTooltip = outerTip;
                    sxCtl.setAttribute("data-tooltip-name", sxHdrVals.outerLabel);
                } else if (sxCtl) {
                    sxCtl.setAttribute("aria-label", "Outer ring: Charted. Tap for details.");
                    delete sxCtl.dataset.uiTooltip;
                }
                if (sxInnerCtl && sxHdrVals) {
                    const innerTip = `${sxHdrVals.innerLabel}: ${sxPctText(sxHdrVals.inner)}. How far into the map your strongest direction reaches. Tap for details.`;
                    sxInnerCtl.setAttribute("aria-label", innerTip);
                    sxInnerCtl.dataset.uiTooltip = innerTip;
                    sxInnerCtl.setAttribute("data-tooltip-name", sxHdrVals.innerLabel);
                } else if (sxInnerCtl) {
                    sxInnerCtl.setAttribute("aria-label", "Inner ring. Tap for details.");
                    delete sxInnerCtl.dataset.uiTooltip;
                }
                const sxRingSvg = e.byId("headerHorizonRing");
                if (sxRingSvg && sxHdrVals) sxRingSvg.setAttribute("aria-label", `Open Charted details. ${sxHdrVals.outerLabel} ${sxPctText(sxHdrVals.outer)}, ${sxHdrVals.innerLabel} ${sxPctText(sxHdrVals.inner)}.`);
                else if (sxRingSvg) sxRingSvg.setAttribute("aria-label", "Open Charted details.");
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
                    return Object.values(t).some(e => "number" == typeof e || Boolean(e && "object" == typeof e && (Object.prototype.hasOwnProperty.call(e, "give") || Object.prototype.hasOwnProperty.call(e, "receive") || Object.prototype.hasOwnProperty.call(e, "line") || Object.keys(e).some(k => k !== "intensity" && Number.isFinite(Number(e[k]))))));
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
                // ⋈ for a cross pairing, ⊙ for a straight pairing,
                // ⊖ for a circle-minus pairing).
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
                }(), e = sxCenterIds.slice(0, 8).map(e => {
                    const photo = (dt[e] || [])[0];
                    if (photo && photo.data && !photo.data.includes("avatar-anon.webp")) return photo;
                    if (sampleProfileFlags && sampleProfileFlags[e]) {
                        return (typeof sxMakeArchetypePhoto === "function" ? sxMakeArchetypePhoto((Xe && Xe[e]) || e, profileSkins && profileSkins[e]) : sxAnonAvatarPhoto(e));
                    }
                    return photo || sxAnonAvatarPhoto(e);
                });
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
                const sxSplitOp = sxNormalizePairOp(sxSplitGrp.pairOp), sxSplitGlyph = sxPairJoin(sxSplitOp).trim(), sxSeamPlate = Math.max(120, ea.photoRadius * .17), sxSeamW = t / a, sxSeams = [];
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
                if (!tab || "circleminus" === tab.kind) return null;
                const ctx = sxTabContext(tab), ids = ctx ? ctx.ids : tab.ids;
                if (!ids || 2 !== ids.length) return null;
                const pair = sxPairByIds(ids[0], ids[1]);
                if (!pair || !pair.topicsById) return null;
                const firstIsA = [ ids[0], ids[1] ].sort()[0] === ids[0], cross = "circledot" !== tab.kind;
                return id => {
                    const rec = pair.topicsById[id];
                    if (!rec) return null;
                    const mine = firstIsA ? rec.ratings.a : rec.ratings.b, yours = firstIsA ? rec.ratings.b : rec.ratings.a;
                    return {
                        give: null === give ? null : zi(give),
                        receive: null === receive ? null : zi(receive)
                    };
                };
            }();

            // =========================================================================
            // MAP PAINT MODULAR RENDERERS (Phase 4 Step 2 Decomposition)
            // =========================================================================
            const SpokeRenderer = {
                renderBranchSpoke(dCat, spokeD, name, nx, ny, o2X, o2Y, cX, cY, catHeat, lineColor, hankyLineClass, giveColor, receiveColor, hankyColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter) {
                    return Ka(dCat, spokeD, 18, name, nx, ny, o2X, o2Y, cX, cY, !1, pr.categoryIcon, catHeat || lineColor, !1, hankyLineClass, giveColor, receiveColor, isNoCode ? Ga.FALLBACK_COLOR : hankyColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter, 1);
                },
                renderTopicSpoke(id, pathD, label, nx, ny, oX, oY, lX, lY, isStatic, icon, P, isSecondGen, hankyLineClass, giveColor, receiveColor, lineColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter, depth = 2) {
                    return Ka(id, pathD, isStatic ? 18 : 6, label, nx, ny, oX, oY, lX, lY, !0, icon, P, !0, hankyLineClass, giveColor, receiveColor, lineColor, isNoCode, isRated, filterLen, baseCircle, iconDiameter, depth);
                }
            };

            const HubRenderer = {
                renderIcon(id, diameter, glyphData, tapTarget, color, cx, cy, isBranch = false, isSubcategory = false) {
                    const r = diameter / 2, scale = diameter / 24, shift = diameter / 6;
                    const fallbackAttr = glyphData.glyphFallback ? ' data-glyph-fallback="star"' : "";
                    const cls = isBranch ? `branch-icon${"noCode" === glyphData.hankyKey ? " no-hanky-code-icon" : ""}` :
                        `topic-icon${isSubcategory ? " subcategory-icon" : "noCode" === glyphData.hankyKey ? " no-hanky-code-icon" : ""}${glyphData.glyphFallback ? " glyph-fallback" : ""}`;
                    const innerContent = isBranch ?
                        `<g transform="scale(${scale.toFixed(5)})">${glyphData.glyph}</g>` :
                        `<g transform="translate(${shift.toFixed(3)} ${shift.toFixed(3)}) scale(${scale.toFixed(5)})">${glyphData.glyph}${glyphData.accent || ""}</g>`;
                    return `<g class="${cls}"${fallbackAttr} data-diameter="${diameter}" ${tapTarget} aria-hidden="true" style="color:${color}" transform="translate(${(cx - r).toFixed(2)} ${(cy - r).toFixed(2)})"><circle class="icon-ring-outline icon-ring-outline-outer" cx="${r}" cy="${r}" r="${r - .5}"/><circle class="icon-disc" cx="${r}" cy="${r}" r="${r - 2}"/><circle class="icon-ring-outline icon-ring-outline-inner" cx="${r}" cy="${r}" r="${r - 3.5}"/>${innerContent}</g>`;
                },
                renderBadges(cx, cy, count, id, ux = 0, uy = 0, offset = 0, isCategory = false) {
                    return yi(cx + ux * offset, cy + uy * offset, count, id, isCategory);
                }
            };

            const LabelRenderer = {
                computeAnchoredOffset(routedLength, renderedW, hubR, iconR, gap, isReverse) {
                    let offset, anchor;
                    if (isReverse) {
                        offset = iconR + gap + renderedW;
                        const maxOff = routedLength - hubR - 20;
                        if (offset > maxOff) offset = maxOff;
                        if (offset < iconR + renderedW + 10) offset = iconR + renderedW + 10;
                        anchor = ' text-anchor="end"';
                    } else {
                        offset = routedLength - iconR - gap - renderedW;
                        const minOff = hubR + 20;
                        if (offset < minOff) offset = minOff;
                        if (offset > routedLength - iconR - renderedW - 10) offset = routedLength - iconR - renderedW - 10;
                        anchor = "";
                    }
                    return { offset, anchor };
                }
            };

            // Boot slices only. A bare yield is swallowed by an ordinary
            // paint, and the boot driver keeps stepping until its 50ms
            // budget is used, so these checks do not add a frame per topic.
            let sxBootSlice = performance.now();
            const sxActiveProfile = Vi();
            const sxHasSomeRatings = Boolean(!Rt && typeof cs === "function" && cs(sxActiveProfile)?.rated > 0);
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
                let E = Math.max(140, .48 * (s - ea.lineStartRadius)) + (t % 2 ? 55 : -35);
                const A = Za.categoryFontSize(i.name, g.labelWidth, E, r);
                const catFs = (sxFontSize(1) * A / 23);
                const catTextW = Za.measure(i.name, catFs, "category");
                const catGap = Math.max(22, 6 * Za.measure(" ", catFs, "category"));
                const availSpoke = s - ea.lineStartRadius - (sxIconRadius(1) || 48);
                const maxE = Math.max(20, availSpoke - catTextW - catGap);
                if (E > maxE) E = maxE;
                const catUnderlineW = Math.min(Za.categoryUnderlineLength(i.name, A), Math.max(20, availSpoke - catGap - E));
                const C = Vi(), M = Rt ? null : Qe[C]?.[dCat], I = Rt ? null : null !== fa(i, C, "give") || null !== fa(i, C, "receive") ? 1 : null, P = Ne.get(i.name) || Fe(i), L = (O = I,
                B = P, Rt ? "var(--green)" : "noCode" === B.key ? Ga.NO_CODE_COLOR : Te(B.lineColor || B.color) || Ga.FALLBACK_COLOR), T = Rt ? null : fa(i, C, "give"), F = Rt ? null : fa(i, C, "receive"), N = Rt ? "var(--green)" : null === T ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(T), _ = Rt ? "var(--green)" : null === F ? "noCode" === P.key ? Ga.NO_CODE_COLOR : Te(P.lineColor || P.color) : zi(F), D = Rt || null !== I ? "" : "noCode" === P.key ? "gen1-hanky-line gen1-no-hanky-line no-hanky-code-line" : "gen1-hanky-line" + (P.mixed ? " mixed-hanky-code-line" : ""), R = Rt || null !== I || "noCode" !== P.key && !P.mixed ? "none" : "noCode" === P.key ? "5 7" : "18 12";
                var O, B;
                const sxCatHeatVals = Rt ? [] : [ T, F ].filter(v => null != v && Number.isFinite(+v));
                const sxCatHeat = sxCatHeatVals.length ? zi(sxCatHeatVals.reduce((s, v) => s + +v, 0) / sxCatHeatVals.length) : null;
                const j = g.labelStartX + g.ux * E, q = g.labelStartY + g.uy * E, H = Math.atan2(l.y - o.y, l.x - o.x), W = Math.cos(H) < 0, U = W ? -g.ux : g.ux, G = j + 0 * (W ? -g.uy : g.uy), K = q - 0 * U, z = 180 * (H + (W ? Math.PI : 0)) / Math.PI, V = W ? ' text-anchor="end"' : "", Y = sxIconDiameter(1), X = Y / 2, Z = Y / 24, Q = ge[i.name], J = Xa(a, yr(i)), ee = Q ? HubRenderer.renderIcon(dCat, Y, Q, Sa(dCat, qn[dCat], C, { tapFirst: !0 }), sxCatHeat || Q.color, J.x, J.y, true) : "", te = k(dCat, M, !Rt && qa(dCat, Je), !Rt && qa(dCat, et), !Rt && Boolean(tt[C]?.[dCat]?.length), J, g.ux, g.uy), ne = j - 11 * g.ux, ie = q - 11 * g.uy, ae = i.risk ? `<text class="risk-mark" x="${ne.toFixed(2)}" y="${ie.toFixed(2)}" dy="-8" text-anchor="middle" transform="rotate(${z.toFixed(2)} ${ne.toFixed(2)} ${ie.toFixed(2)})" aria-hidden="true">*</text>` : "", re = r ? h.hidden : n.topics.length, oe = X + 20, se = HubRenderer.renderBadges(J.x, J.y, re, dCat, -g.ux, -g.uy, oe, true), le = r ? function(e, t, n, i, a, r) {
                    if (!n) return "";
                    const o = `+${n} more`, s = Math.max(58, 7 * o.length + 16), l = i + s / 2 * Math.abs(a) + 12 * Math.abs(r), c = t + r * l;
                    return `<g class="hidden-count-badge density-count-badge" data-width="${s}" transform="translate(${(e + a * l - s / 2).toFixed(2)} ${(c - 12).toFixed(2)})" role="note" aria-label="${n} more ${1 === n ? "topic" : "topics"} hidden by hypermap density"><rect width="${s}" height="24" rx="7"/><text x="${(s / 2).toFixed(2)}" y="12" text-anchor="middle" dominant-baseline="middle">${o}</text></g>`;
                }(l.x, l.y, n.densityHidden, X, g.ux, g.uy) : "";
                const branchSpokeSvg = SpokeRenderer.renderBranchSpoke(dCat, m, i.name, g.nx, g.ny, o2.x, o2.y, c.x, c.y, sxCatHeat, L, D, null === I ? L : N, null === I ? L : _, ("noCode" === P.key ? Ga.FALLBACK_COLOR : P.lineColor || P.color || Ga.FALLBACK_COLOR), "noCode" === P.key, null !== I, p, SpokeGeometry.buildBaseCircle(pr.centerX, pr.centerY, gen1SpokeBaseRadius()), sxIconDiameter(1));
                v += `<g class="${w.join(" ")} gen1-line-group" data-layout-key="${dCat}" data-layout-x="${J.x.toFixed(2)}" data-layout-y="${J.y.toFixed(2)}" data-icon-distance-override="${g.labelWidth.toFixed(2)}" data-rated="${null === I ? "false" : "true"}" style="--profile-color:${f};--family-color:${sxCatHeat || (Q && Q.color) || Ga.FALLBACK_COLOR};--gen1-line-color:${sxCatHeat || L};--gen1-line-dash:${R}">${branchSpokeSvg}${sxCatHeat ? `<path class="branch-heat" d="${m}" fill="none" stroke="${sxCatHeat}" stroke-width="4" vector-effect="non-scaling-stroke" stroke-linecap="round" pointer-events="none"/>` : ""}${ee}${te}${ae}${se}${le}<path id="p-${dCat}" d="${y}" fill="none" stroke="transparent"/><line class="node-label-underline" style="stroke:${f}" data-offset="0" x1="${j.toFixed(2)}" y1="${q.toFixed(2)}" x2="${(j + g.ux * catUnderlineW).toFixed(2)}" y2="${(q + g.uy * catUnderlineW).toFixed(2)}"/><text class="category-label" data-id="${dCat}" data-path-id="p-${dCat}" data-label-offset="${E}" ${Sa(dCat, qn[dCat], C)} tabindex="0" role="button" aria-expanded="${r}" aria-label="${Hi(i.name)}${i.risk ? ", higher-risk practice requiring specialized knowledge and explicit negotiation" : ""}${x && x.has(i.name) ? ", contains newly imported additions" : ""}. ${r ? `${h.mode} children shown; press Enter to collapse` : `Children hidden; press Enter to expand with ${h.mode} children`}; press Shift Enter for description and markers." style="font-size:${catFs.toFixed(2)}px" x="${G.toFixed(2)}" y="${K.toFixed(2)}" dominant-baseline="middle"${V} transform="rotate(${z.toFixed(2)} ${G.toFixed(2)} ${K.toFixed(2)})">${Hi(i.name)}</text></g>`;
                for (let sxTi = 0; sxTi < e.topics.length; sxTi++) {
                    const t = e.topics[sxTi];
                    if (performance.now() - sxBootSlice >= 40) { yield; sxBootSlice = performance.now(); }
                    window.__sxNodeTick && window.__sxNodeTick();
                    const n = t.topic, a = n.label, r = n.id, o = Boolean(n.isSubcategory);
                    if ($n && !$n.has(r)) continue;
                    t.angle;
                    const s = t.cloudAngle, c = t.cloudRadius || e.topicCloudRadius, u = Za.topicSpokeEstimate(a, c), p = u.fontSize;
                    let h = u.spokeLength;
                    const hubRadius1 = sxIconRadius(1);
                    const leafRadius2 = sxIconRadius(2);
                    if (o) {
                        const e = hubRadius1 + leafRadius2 + 96;
                        h = Math.max(h, e, sxSpokeBase(t.cloudCount, 1)), h = Za.hubSpokeLength(a, p, h, hubRadius1, leafRadius2);
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
                    const fsEst = sxFontSize(2);
                    const tabWEst = 5 * Za.measure(" ", fsEst, "topic");
                    const textWEst = Za.measure(a, fsEst, "topic") + tabWEst;
                    const gapEst = Math.max(20, 6 * Za.measure(" ", fsEst, "topic"));
                    const minReqSpoke = hubRadius1 + leafRadius2 + textWEst + gapEst + 48;
                    if (h < minReqSpoke) h = minReqSpoke;
                    const g = l.x + Math.cos(s) * h, m = l.y + Math.sin(s) * h, y = Ya(l.x, l.y, g, m, hubRadius1), b = Math.max(12, Math.min(17, Za.fittedSize(a, y.labelWidth, void 0))), w = y.labelD, x = o ? "all" : Ra(r);
                    const E = [ "node-group" ];
                    o && E.push("subcategory-node");
                    const D = Vi();
                    const R = Rt ? null : o ? function(e, t) {
                        return pa((e?.topics || []).map(Wn), t, e => ua(e, t));
                    }(n.group, D) : ua(r, D);
                    const A = cn[D], C = dn[D];
                    o || Rt || !Qi() && !Kd() || !qa(r, Je) || E.push("is-fantasy-only"), o || Rt || !Qi() && !Kd() || !qa(r, et) || E.push("is-already-tried"), 
                    !o && A && A.has(r) && !Eo(D, r) && E.push("import-updated"), !o && C && C.has(r) && !Eo(D, r) && E.push("import-newest");
                    const M = n.allImported.some(e => Ra(e.id) === Pt);
                    "all" === Pt || o || x === Pt || M || E.push("is-hidden"), !Tt || String(a || "").toLowerCase().includes(Tt) || String(i.name || "").toLowerCase().includes(Tt) || n.allImported.some(e => String(e.label || "").toLowerCase().includes(Tt)) || E.push("is-dim");
                    if (sxIsBranchLimited(r, D)) E.push("is-hidden");
                    o && n.unratedHub && E.push("is-unrated"); /* DIMFIX F2 (was HUB-BACKBONE W4): the dim reads the F1 rating-presence flag, not the Net-filtered allImported list; the dedicated class (never is-dim) keeps selection/focus precedence clean */
                    !o && !Rt && (Kd() ? !sxTopicKnownInOpenGroup(r) : (sxHasSomeRatings && null === R)) && E.push("is-unrated");
                    const I = null !== Dt && (r === Dt || dCat === Dt || t.children.some(e => e.child.id === Dt));
                    Dt && !I && E.push("is-dim"), Dt && r === Dt && E.push("is-preview");
                    const P = Za.topicLabelOffset(y.routedLength, y.labelOffset, t.cloudIndex), L = Math.cos(s) < 0, T = L ? `pr-${r}` : `p-${r}`;
                    const fs2 = (sxFontSize(2) * b / 17);
                    const textW2 = Za.measure(a, fs2, "topic");
                    const gap2 = Math.max(18, 6 * Za.measure(" ", fs2, "topic"));
                    const hubR2 = sxIconRadius(1);
                    const iconR2 = sxIconRadius(2);
                    let F, N;
                    // ICON-ANCHORED LABEL (2026-11-18): the label sits
                    // at the far end of the spoke, its icon-side end a
                    // six-space gap inside the icon; the hub side
                    // absorbs the slack, so labels no longer look
                    // centred on their spokes. Rendered width =
                    // measured width minus the halo (6 per character
                    // gap) the render does not draw, so the gap is
                    // measured to the glyphs actually drawn.
                    const renderedW2 = textW2 - 6 * Math.max(0, a.length - 1);
                    const anchored2 = LabelRenderer.computeAnchoredOffset(y.routedLength, renderedW2, hubR2, iconR2, gap2, L);
                    F = anchored2.offset;
                    N = anchored2.anchor;
                    const sxRevPath = L ? `<path id="pr-${r}" class="concept-path" d="${y.reverseD}" fill="none" stroke="transparent"/>` : "", O = o || Rt ? null : Qe[D]?.[r], B = o ? Ae(a, i.name) : Oe(a, i.name), j = o || Rt ? null : ca(r, D), q = o && !Rt ? ya(n.group, D, "give", r) : null, H = o && !Rt ? ya(n.group, D, "receive", r) : null;
                    const shape2 = Ge(r, D);
                    const isTriple2 = Boolean(shape2 && shape2.keys && shape2.keys.length === 3);
                    let W, U, midVal2 = null, midKnown2 = !1;
                    if (isTriple2 && j) {
                        const k0 = shape2.keys[0], k1 = shape2.keys[1], k2 = shape2.keys[2];
                        W = j[k0 + "Known"] ? j[k0] : null;
                        midKnown2 = Boolean(j[k1 + "Known"]);
                        midVal2 = midKnown2 ? j[k1] : null;
                        U = j[k2 + "Known"] ? j[k2] : null;
                    } else {
                        W = j && j.giveKnown ? j.give : q;
                        U = j && j.receiveKnown ? j.receive : H;
                    }
                    const G = o ? Q.color : Rt ? "var(--green)" : null === R ? Te(B.lineColor) : zi(R), K = Rt ? "var(--green)" : null === W ? Te(B.lineColor) : zi(W), z = Rt ? "var(--green)" : null === U ? Te(B.lineColor) : zi(U);
                    const midColor2 = isTriple2 && midKnown2 ? zi(midVal2) : (j && (j.giveKnown || j.receiveKnown) ? zi(((j.giveKnown ? j.give : 0) + (j.receiveKnown ? j.receive : 0)) / ((j.giveKnown ? 1 : 0) + (j.receiveKnown ? 1 : 0))) : B.lineColor);
                    const V = y.icon.x, Y = y.icon.y, X = n.allImported, Z = n.topicFilter, J = on.has(r), ee = o ? Sa(r, qn[r], D, { tapFirst: !0 }) : ka(a, $e(qn[r], B, R, {
                        key: B.hankyKey
                    }, O), xa(r, D), { tapFirst: !0 }), te = sxIconDiameter(2), ne = te / 2, ie = te / 6, ae = te / 24, re = HubRenderer.renderIcon(r, te, B, ee, B.color, V, Y, false, o), oe = o ? "" : k(r, O, !Rt && qa(r, Je), !Rt && qa(r, et), !Rt && Boolean(tt[D]?.[r]?.length), y.icon, y.ux, y.uy), se = J ? Z.hidden : X.length || (o ? n.group.topics.length : 0), /* HUB-BACKBONE badge: a wholly-unrated collapsed hub wears +N with N = its TOTAL topic count (owner ruling 2026-10-23); expanded and partially-rated hubs keep today's counts; plain topics unchanged */ le = HubRenderer.renderBadges(y.icon.x, y.icon.y, se, r, y.ux, y.uy, ne + 20), ce = X.length ? ` aria-expanded="${J}"` : "", de = X.length ? `${J ? "Topics shown" : "Topics hidden"}; press Enter to ${J ? "collapse" : "expand"}. ` : "", sxFl = sxPairTapers ? sxPairTapers(r) : null, peTr = Ga.trimToIcons(l.x, l.y, V, Y, sxIconRadius(1), sxIconRadius(2)), peT = `M ${peTr.sx0.toFixed(2)} ${peTr.sy0.toFixed(2)} L ${peTr.sx1.toFixed(2)} ${peTr.sy1.toFixed(2)}`, ue = o ? renderKinkLine(l.x, l.y, V, Y, B.hankyKey, Rt ? "var(--green)" : null != R ? zi(R) : Te(B.lineColor), sxFl ? sxFl.give : Rt || null !== q ? K : null, sxFl ? sxFl.receive : Rt || null !== H ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, pr.subcategoryIcon, sxIconDiameter(1), sxIconDiameter(2), 2) : renderKinkLine(l.x, l.y, V, Y, B.hankyKey, Rt ? "var(--green)" : midColor2, sxFl ? sxFl.give : Rt || (isTriple2 ? j && j[shape2.keys[0] + "Known"] : j && j.giveKnown) ? K : null, sxFl ? sxFl.receive : Rt || (isTriple2 ? j && j[shape2.keys[2] + "Known"] : j && j.receiveKnown) ? z : null, sxFl ? !0 : null !== R, t.cloudCount, r, a, D, pr.categoryIcon, 48, sxIconDiameter(1), sxIconDiameter(2), 2), pe = o ? "" : `<g class="second-gen-rating-controls-only">${SpokeRenderer.renderTopicSpoke(r, peT, a, y.nx, y.ny, l.x, l.y, V, Y, true, pr.topicIcon, G, true, "", null, null, null, false, true, h.length, null, sxIconDiameter(2), 2)}</g>`, he = o ? "map-label concept-path-label subcategory-label" : "map-label concept-path-label hanky-topic-label", ge = o ? `${Hi(a)} subcategory. ${de}` : `${Hi(a)}. ${de}Press Shift Enter for description and markers.`;
                    v += `<g class="${E.join(" ")}" data-layout-key="${r}" data-layout-x="${V.toFixed(2)}" data-layout-y="${Y.toFixed(2)}" data-has-visible-children="${t.children.length ? "true" : "false"}" data-hanky-color="${B.hankyKey}" data-rated="${null === R ? "false" : "true"}" style="--profile-color:${f};--family-color:${o ? Q.color : B.color};--hanky-color:${B.labelColor};--hanky-label-stroke:${B.labelStroke}">${ue}${pe}${re}${oe}${le}<path id="p-${r}" class="concept-path" d="${w}" fill="none" stroke="transparent"/>${sxRevPath}<text class="${he}" data-topic-id="${r}" data-id="${r}" data-path-id="p-${r}" data-label-offset="${F.toFixed(2)}" ${Sa(r, qn[r], D)} tabindex="0" role="button"${ce} aria-label="${ge}" style="font-size:${fs2.toFixed(2)}px" dominant-baseline="middle" xml:space="preserve"><textPath href="#${T}" xlink:href="#${T}" startOffset="${F.toFixed(2)}"${N}>${Hi(a)}</textPath></text></g>`,
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
                        }(V, Y, l.x, l.y, 0, s, hr(3), pr.importedIcon / 2 + 10, e.curve, 270, c.offset, u, c.limit), h = Math.cos(s) < 0, g = h ? `pr-${n.id}` : `p-${n.id}`;
                        const fs3 = sxFontSize(3);
                        const textW3 = Za.measure(n.label, fs3, "topic");
                        const gap3 = Math.max(16, 6 * Za.measure(" ", fs3, "topic"));
                        const hubR3 = sxIconRadius(2);
                        const iconR3 = sxIconRadius(3);
                        let m, y;
                        // ICON-ANCHORED LABEL (2026-11-18): same as the
                        // cloud-topics loop above — far end of the spoke,
                        // six-space gap inside the icon, rendered width.
                        const renderedW3 = textW3 - 6 * Math.max(0, n.label.length - 1);
                        const anchored3 = LabelRenderer.computeAnchoredOffset(p.routedLength, renderedW3, hubR3, iconR3, gap3, h);
                        m = anchored3.offset;
                        y = anchored3.anchor;
                        const b = h ? `<path id="pr-${n.id}" class="concept-path" d="${p.reverseD}" fill="none" stroke="transparent"/>` : "", w = Rt ? null : ua(n.id, D), x = Rt ? null : Qe[D]?.[n.id], S = Rt ? null : ca(n.id, D), $ = Le(n.label, i.name);
                        const shape3 = Ge(n.id, D);
                        const isTriple3 = Boolean(shape3 && shape3.keys && shape3.keys.length === 3);
                        let E, A, midVal3 = null, midKnown3 = !1;
                        if (isTriple3 && S) {
                            const k0 = shape3.keys[0], k1 = shape3.keys[1], k2 = shape3.keys[2];
                            E = S[k0 + "Known"] ? S[k0] : null;
                            midKnown3 = Boolean(S[k1 + "Known"]);
                            midVal3 = midKnown3 ? S[k1] : null;
                            A = S[k2 + "Known"] ? S[k2] : null;
                        } else {
                            E = S && S.giveKnown ? S.give : null;
                            A = S && S.receiveKnown ? S.receive : null;
                        }
                        const M = Rt ? "var(--green)" : null === E ? Te($.lineColor) : zi(E), I = Rt ? "var(--green)" : null === A ? Te($.lineColor) : zi(A), P = Rt ? "var(--green)" : null === w ? Te($.lineColor) : zi(w), L = Oe(n.label, i.name), T = sxIconDiameter(3), F = T / 2, N = p.icon.x, _ = p.icon.y, R = Boolean(Tt && (String(n.label || "").toLowerCase().includes(Tt) || String(a || "").toLowerCase().includes(Tt) || String(i.name || "").toLowerCase().includes(Tt))), O = [ "node-group", o ? "subcategory-topic" : "imported-child" ];
                        !Rt && (Qi() || Kd()) && qa(n.id, Je) && O.push("is-fantasy-only"), !Rt && (Qi() || Kd()) && qa(n.id, et) && O.push("is-already-tried"), 
                        C && C.has(n.id) && !Eo(Vi(), n.id) && O.push("import-newest"), "all" !== Pt && Ra(n.id) !== Pt && O.push("is-hidden"), 
                        sxIsBranchLimited(n.id, D) && O.push("is-hidden"),
                        Tt && !R && O.push("is-dim"), !Rt && (Kd() ? !sxTopicKnownInOpenGroup(n.id) : (sxHasSomeRatings && null === w)) && O.push("is-unrated");
                        const B = null !== Dt && (n.id === Dt || r === Dt || dCat === Dt);
                        Dt && !B && O.push("is-dim"), Dt && n.id === Dt && O.push("is-preview");
                        const midColor3 = isTriple3 && midKnown3 ? zi(midVal3) : $.lineColor;
                        const j = !o && Boolean(si(n.id)) ? ` Tap to adopt it into ${wt[Vi()] || "the active profile"} unrated, then use the normal give and receive controls.` : "";
                        const q = HubRenderer.renderIcon(n.id, T, L, ka(n.label, $e(n, L, w, $, x), xa(n.id, D), { tapFirst: !0 }), L.color, N, _, false, false);
                        const H = k(n.id, x, !Rt && qa(n.id, Je), !Rt && qa(n.id, et), !Rt && Boolean(tt[D]?.[n.id]?.length), p.icon, p.ux, p.uy), sxFl = sxPairTapers ? sxPairTapers(n.id) : null, pTr = Ga.trimToIcons(V, Y, o ? N : l.x, o ? _ : l.y, sxIconRadius(2), sxIconRadius(3)), pT = `M ${pTr.sx0.toFixed(2)} ${pTr.sy0.toFixed(2)} L ${pTr.sx1.toFixed(2)} ${pTr.sy1.toFixed(2)}`, W = o ? renderKinkLine(V, Y, N, _, $.key, midColor3, sxFl ? sxFl.give : Rt || (isTriple3 ? S && S[shape3.keys[0] + "Known"] : S && S.giveKnown) ? M : null, sxFl ? sxFl.receive : Rt || (isTriple3 ? S && S[shape3.keys[2] + "Known"] : S && S.receiveKnown) ? I : null, sxFl ? !0 : null !== w, e.cloudCount, n.id, n.label, D, pr.subcategoryIcon, 48, sxIconDiameter(2), sxIconDiameter(3), 3) : "", U = o ? `<g class="second-gen-rating-controls-only">${SpokeRenderer.renderTopicSpoke(n.id, pT, n.label, p.nx, p.ny, V, Y, N, _, true, pr.topicIcon, P, true, "", null, null, null, false, true, h.length, null, sxIconDiameter(3), 3)}</g>` : SpokeRenderer.renderTopicSpoke(n.id, pT, n.label, p.nx, p.ny, V, Y, l.x, l.y, false, pr.importedIcon, P, true, null === w && "noCode" === $.key ? "no-hanky-code-line" : "", null, null, $.lineColor, "noCode" === $.key, null !== w, h.length, SpokeGeometry.buildBaseCircle(V, Y, sxIconRadius(2)), sxIconDiameter(3), 3), G = o ? `${Hi(n.label)} in ${Hi(a)}. Press Shift Enter for description and markers.` : `${Hi(n.label)}, imported under ${Hi(a)}.${Hi(j)} Press Shift Enter for description and markers.`;
                        v += `<g class="${O.join(" ")}" data-layout-key="${n.id}" data-layout-x="${N.toFixed(2)}" data-layout-y="${_.toFixed(2)}" data-rated="${null === w ? "false" : "true"}" style="--profile-color:${f};--family-color:${Q.color}">${W}${U}${q}${H}<path id="p-${n.id}" class="concept-path" d="${p.labelD}" fill="none" stroke="transparent"/>${b}<text class="map-label concept-path-label${o ? " hanky-topic-label" : ""}" data-topic-id="${n.id}" data-id="${n.id}" data-path-id="p-${n.id}" data-label-offset="${m.toFixed(2)}" ${Sa(n.id, n, D)} tabindex="0" role="button" aria-label="${G}" style="font-size:${fs3.toFixed(2)}px" dominant-baseline="middle" xml:space="preserve"><textPath href="#${g}" xlink:href="#${g}" startOffset="${m.toFixed(2)}"${y}>${Hi(n.label)}</textPath></text></g>`;
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
            // Settle Engine (Build 2026-11-21): Delegated to 03e2-settle-engine.js.
            // Two-pass settle: Pass 1 seats every icon, widget, and label;
            // Pass 2 (sxFinaliseStems) re-emits tapered stems from settled endpoints.
            try {
                yield* sxRunNodeSettle(scCtx, blitSess);
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
                // LAYOUT-GLIDE SIGNAL (tweening Job B): fire only when
                // moved nodes actually glide (l non-empty) — never on
                // a paint with no moves. Enter/exit fades alone do
                // not count as a glide.
                l.length && sxLayoutGlideSignal(l.length);
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
                        // Branch-label zoom (2026-11-15): the real label
                        // paints above its overlay clone and swallows
                        // the click, so bind the same handler to the
                        // label itself. Marker-guarded: the overlay
                        // pass re-runs per render.
                        if (!label.dataset.sxLabelZoom) {
                            label.addEventListener("click", Qa), label.dataset.sxLabelZoom = "1";
                        }
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
                        stackItem.setAttribute("class", "map-label-stack-item" + (e.classList.contains("is-unrated") ? " is-unrated" : ""));
                        const stackStyle = e.getAttribute("style");
                        stackStyle && stackItem.setAttribute("style", stackStyle);
                        if ((e.classList.contains("is-dim") || e.classList.contains("is-unrated")) && !e.classList.contains("is-preview")) {
                            stackItem.setAttribute("opacity", ".18");
                        }
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
                    stackItem.setAttribute("class", "node-group rating-control-stack-item" + (e.classList.contains("is-unrated") ? " is-unrated" : ""));
                    const stackStyle = e.getAttribute("style");
                    stackStyle && stackItem.setAttribute("style", stackStyle);
                    if ((e.classList.contains("is-dim") || e.classList.contains("is-unrated")) && !e.classList.contains("is-preview")) {
                        stackItem.setAttribute("opacity", ".18");
                    }
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
        /* Flexcapades skin switch: the solver's expanded-branch set (rn) and
           per-node visibility modes (un) are keyed by category NAME / node
           ID and are populated from the taxonomy at boot / on profile
           select (see ji() in 02o). A skin swap changes the names and IDs,
           so the new ones must be registered here or frBuildTree skips
           every topic of an unregistered branch as collapsed
           (`if (!En && !o && !s) return;`) and hides every unrated topic
           behind the default "rated" visibility mode (`fi()` falls back
           to "rated" for unknown branch IDs — a fresh skin has no ratings
           yet, so its branches must start at "all"). The loader calls this
           before re-rendering; it mirrors ji()'s expansion pass and runs
           regardless of layout-auto mode. Collapse / visibility state is
           not preserved across a switch (all branches come back expanded
           and "all", as on a profile select).
           Known-topic set Ke (2026-11-16 fix): Ke is the import path's
           "is this a real topic" gate (applyProfileRatings drops any
           rating whose id is in neither Ke nor the subcategories), and
           it is populated ONCE at boot from the Sexcapades taxonomy
           (02o). A skin swap left it holding only Sexcapades ids, so
           every imported rating for a vanilla skin was silently
           dropped — archetype loads landed 0 ratings and pair matches
           came back blank, while Sexcapades archetypes (ids already in
           Ke) loaded fine. Re-register the new skin's ids here,
           alongside rn/on/un. Additive only, never cleared, so
           imported-children ids and the other skins' ids survive a
           switch (Ke is append-only by design; a stale id from another
           skin is still a real topic id, not an unknown key). */
        window.__SX_SKIN_LAYOUT_SYNC = function () {
            try {
                rn.clear(), on.clear();
                h.forEach(e => {
                    const n = catId(e.name);
                    Ke.add(n), un.set(n, "all"), rn.add(e.name), (e.subcategories || []).forEach(t => {
                        const i = Un(e.name, t.name);
                        Ke.add(i), un.set(i, "all"), on.add(i);
                    }), e.topics.forEach(t => {
                        const n = Wn(t);
                        Ke.add(n), un.set(n, "all"), on.add(n);
                    });
                });
            } catch (_) {}
        };
        /* Flexcapades skin switch: re-fit the camera to the new map. A plain
           Mr() deliberately keeps the user's zoom/pan (only the boot arm
           re-fits), so without this the smaller Chem map would sit tiny
           inside the Sexcapades fit — and restoring would leave Sexcapades
           cropped. Same call profile select makes (Ih() in 02o). */
        window.__SX_SKIN_REFIT = function () {
            try { Ih(); } catch (_) {}
        };
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
        // LAYOUT-GLIDE SIGNAL (tweening Job B, 2026-11-13): an
        // observable signal each time the B glide actually runs —
        // console entry + a short quiet tone + a brief on-screen
        // status pill. Fires ONLY when moved nodes glide, never on
        // a paint with no moves. Tone/status are best-effort: a
        // blocked AudioContext or missing DOM never throws, and the
        // console entry always lands.
        let sxGlideAudioCtx = null, sxGlideStatusEl = null, sxGlideStatusTimer = 0;
        function sxLayoutGlideSignal(count) {
            try { console.info("[layout-glide] B glide: " + count + " node(s) gliding to final positions"); } catch (_) {}
            try {
                if (!sxGlideAudioCtx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) sxGlideAudioCtx = new AC();
                }
                if (sxGlideAudioCtx) {
                    try { if ("suspended" === sxGlideAudioCtx.state) sxGlideAudioCtx.resume(); } catch (_) {}
                    const t0 = sxGlideAudioCtx.currentTime, osc = sxGlideAudioCtx.createOscillator(), gain = sxGlideAudioCtx.createGain();
                    osc.type = "sine", osc.frequency.value = 880, gain.gain.setValueAtTime(0.0001, t0), gain.gain.exponentialRampToValueAtTime(0.04, t0 + 0.01), gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
                    osc.connect(gain), gain.connect(sxGlideAudioCtx.destination), osc.start(t0), osc.stop(t0 + 0.13);
                }
            } catch (_) {}
            try {
                if (!sxGlideStatusEl) {
                    sxGlideStatusEl = document.createElement("div");
                    sxGlideStatusEl.id = "sxGlideStatus";
                    sxGlideStatusEl.setAttribute("role", "status");
                    sxGlideStatusEl.style.cssText = "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;pointer-events:none;background:rgba(15,23,42,.92);color:#a5f3fc;border:1px solid #155e75;border-radius:999px;padding:6px 14px;font:600 12px/1.4 system-ui,sans-serif;opacity:0;transition:opacity .25s ease;white-space:nowrap";
                    document.body.appendChild(sxGlideStatusEl);
                }
                sxGlideStatusEl.textContent = "Layout glide: " + count + " node" + (1 === count ? "" : "s") + " gliding";
                sxGlideStatusEl.style.opacity = "1";
                if (sxGlideStatusTimer) clearTimeout(sxGlideStatusTimer);
                sxGlideStatusTimer = setTimeout(() => { if (sxGlideStatusEl) sxGlideStatusEl.style.opacity = "0"; }, 1500);
            } catch (_) {}
        }

        // CAPSULE TWEEN (tweening Job A, 2026-11-13): the interim
        // capsule glides between solver commits instead of jumping.
        // COUPLED to the global animations toggle (Jason, 2026-11-13
        // ~16:57 CST): when the toggle is OFF the capsule draws
        // instantly (the old jump); when ON it tweens over 0.5s.
        // The tween only moves the interim capsule layer's painted
        // coordinates — every decision still reads the solve registry,
        // never the DOM — so the crossing number and gate are untouched.
        let sxCapLastSnap = null, sxCapLastBranch = null;
        const sxCapTween = { from: null, to: null, start: 0, raf: 0, layer: null, branch: null };
        // Snapshot the capsule's drawn primitives with stable keys so
        // consecutive commits can be interpolated: lines (centre + sub
        // spokes, paddle S, midline M) and circles (topic icon dots,
        // subcategory dots). Presentation floors match the old direct
        // draw byte-for-byte at t=1.
        function sxCapSnap(geo, branch) {
            const F = geo.F, lines = [], circles = [];
            let anchor = null;
            geo.spokes.forEach(sp => {
                if (sp.cloud !== branch || !sp.seg) return;
                const id = "center" === sp.kind ? sp.cloud : (sp.entry && sp.entry.rec && (sp.entry.rec.id || sp.entry.rec.label)) || sp.cloud;
                if ("center" === sp.kind) anchor = sp.seg[1];
                lines.push({ k: ("center" === sp.kind ? "c:" : "sp:") + id, x1: sp.seg[0].x, y1: sp.seg[0].y, x2: sp.seg[1].x, y2: sp.seg[1].y, w: Math.max(14, F * .3), s: "#67e8f9", o: .85 });
            });
            geo.topics.forEach(e2 => {
                if (e2.cloud !== branch) return;
                const id = (e2.rec && (e2.rec.id || e2.rec.label)) || "";
                if (e2.S) lines.push({ k: "S:" + id, x1: e2.S[0].x, y1: e2.S[0].y, x2: e2.S[1].x, y2: e2.S[1].y, w: e2.F || F, s: "#67e8f9", o: .30 });
                if (e2.M) {
                    // Leaf spoke line abuts the icon's inside edge
                    // (ruled 2026-11-13, Jason): the midline runs out
                    // to capEnd, so trim its drawn end to the node
                    // circle instead of past the icon. Solver geometry
                    // is untouched — only the drawn interim line.
                    let x2 = e2.M[1].x, y2 = e2.M[1].y;
                    if (e2.node) {
                        const dx = e2.node.x - e2.M[0].x, dy = e2.node.y - e2.M[0].y, len = Math.hypot(dx, dy), r = Math.max(26, F * .45);
                        if (len > r) { x2 = e2.node.x - dx / len * r; y2 = e2.node.y - dy / len * r; }
                    }
                    lines.push({ k: "M:" + id, x1: e2.M[0].x, y1: e2.M[0].y, x2: x2, y2: y2, w: Math.max(8, F * .1), s: "#a5f3fc", o: .55 });
                }
                if (e2.node) circles.push({ k: "n:" + id, cx: e2.node.x, cy: e2.node.y, r: Math.max(26, F * .45), f: "#a5f3fc", o: .95 });
            });
            geo.spokes.forEach(sp => {
                if (sp.cloud !== branch || "sub" !== sp.kind || !sp.seg) return;
                const id = (sp.entry && sp.entry.rec && (sp.entry.rec.id || sp.entry.rec.label)) || sp.cloud;
                circles.push({ k: "s:" + id, cx: sp.seg[1].x, cy: sp.seg[1].y, r: Math.max(30, F * .6), f: "#67e8f9", o: .9 });
            });
            return { F: F, lines: lines, circles: circles, anchor: anchor };
        }
        function sxCapRender(layer, branch, snap) {
            let html = "";
            snap.lines.forEach(e => {
                html += '<line x1="' + e.x1.toFixed(1) + '" y1="' + e.y1.toFixed(1) + '" x2="' + e.x2.toFixed(1) + '" y2="' + e.y2.toFixed(1) + '" stroke="' + e.s + '" stroke-width="' + e.w.toFixed(1) + '" stroke-linecap="round" opacity="' + e.o + '"/>';
            });
            snap.circles.forEach(e => {
                html += '<circle cx="' + e.cx.toFixed(1) + '" cy="' + e.cy.toFixed(1) + '" r="' + e.r.toFixed(1) + '" fill="' + e.f + '" opacity="' + e.o + '"/>';
            });
            layer.innerHTML = html;
            let cx = 0, cy = 0, cn = 0;
            snap.circles.forEach(e => { if ("n:" === e.k.slice(0, 2)) { cx += e.cx; cy += e.cy; cn++; } });
            const ctr = cn ? { x: cx / cn, y: cy / cn } : snap.anchor;
            ctr && (window.__sxInterimAnchor = { branch: branch, x: ctr.x, y: ctr.y });
        }
        function sxCapLerp(a, b, t) {
            if (!a) return b;
            const ln = (x, y) => x + (y - x) * t;
            const byKey = arr => { const m = new Map(); arr.forEach(e => m.set(e.k, e)); return m; };
            const aL = byKey(a.lines), aC = byKey(a.circles);
            return {
                F: ln(a.F, b.F),
                lines: b.lines.map(e => {
                    const p = aL.get(e.k);
                    return p ? { k: e.k, x1: ln(p.x1, e.x1), y1: ln(p.y1, e.y1), x2: ln(p.x2, e.x2), y2: ln(p.y2, e.y2), w: ln(p.w, e.w), s: e.s, o: ln(p.o, e.o) } : e;
                }),
                circles: b.circles.map(e => {
                    const p = aC.get(e.k);
                    return p ? { k: e.k, cx: ln(p.cx, e.cx), cy: ln(p.cy, e.cy), r: ln(p.r, e.r), f: e.f, o: ln(p.o, e.o) } : e;
                }),
                anchor: a.anchor && b.anchor ? { x: ln(a.anchor.x, b.anchor.x), y: ln(a.anchor.y, b.anchor.y) } : b.anchor
            };
        }
        function sxCapDraw(layer, branch, snap) {
            // Toggle OFF: draw instantly, exactly as before (no tween
            // state left running). Toggle ON: tween from the last
            // displayed snapshot over 0.5s (ease-out cubic, matching
            // the node glide's easing). A branch change has no tween
            // baseline (the old snapshot is another cloud's geometry),
            // so it draws instantly too.
            if (!mn || !mn.animations || sxCapLastBranch !== branch) {
                if (sxCapTween.raf) { try { cancelAnimationFrame(sxCapTween.raf); } catch (_) {} sxCapTween.raf = 0; }
                sxCapTween.from = null; sxCapTween.to = null;
                sxCapLastSnap = snap; sxCapLastBranch = branch;
                sxCapRender(layer, branch, snap);
                return;
            }
            const now = performance.now();
            let from = sxCapLastSnap;
            if (sxCapTween.raf && sxCapTween.to) {
                // A tween is in flight: re-base from the currently
                // displayed (interpolated) snapshot so the motion
                // stays continuous when a new commit lands mid-glide.
                const t = Math.min(1, (now - sxCapTween.start) / 500), e = 1 - Math.pow(1 - t, 3);
                from = sxCapLerp(sxCapTween.from, sxCapTween.to, e);
                try { cancelAnimationFrame(sxCapTween.raf); } catch (_) {}
                sxCapTween.raf = 0;
            }
            if (!from) { sxCapLastSnap = snap; sxCapRender(layer, branch, snap); return; }
            sxCapTween.from = from; sxCapTween.to = snap; sxCapTween.start = now; sxCapTween.layer = layer; sxCapTween.branch = branch;
            const step = t0 => {
                sxCapTween.raf = 0;
                // Stop if the run ended, the layer is gone, or a full
                // paint replaced it: never draw a stale capsule.
                if (!dkCtx || !layer.isConnected || sxCapTween.layer !== layer) return;
                const t = Math.min(1, (t0 - sxCapTween.start) / 500), e = 1 - Math.pow(1 - t, 3);
                sxCapRender(layer, branch, sxCapLerp(sxCapTween.from, sxCapTween.to, e));
                if (t < 1) sxCapTween.raf = requestAnimationFrame(step);
                else { sxCapLastSnap = sxCapTween.to; sxCapTween.from = null; sxCapTween.to = null; }
            };
            sxCapTween.raf = requestAnimationFrame(step);
        }

        function sxInterimCapsulePaint(d) {
            try {
                if (!In || !dkCtx || !dkCtx.branch) return;
                const geo = sxSccBuild(d), branch = dkCtx.branch, NS = "http://www.w3.org/2000/svg";
                let layer = In.querySelector(".sx-interim-capsules");
                if (!layer) {
                    layer = document.createElementNS(NS, "g"), layer.setAttribute("class", "sx-interim-capsules"), layer.setAttribute("aria-hidden", "true"), layer.setAttribute("pointer-events", "none"), In.appendChild(layer);
                }
                // Job A: draw via the snapshot tween (instant when the
                // animations toggle is off, gliding when it is on).
                // Presentation floors live in sxCapSnap/sxCapRender.
                sxCapDraw(layer, branch, sxCapSnap(geo, branch));
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
        window.TaxoPolemicsEngine = window.SexcapadesEngine;
        window.FlexcapadesEngine = window.SexcapadesEngine;
        window.TaxoPolemics = window.TaxoPolemicsEngine;
        window.Flexcapades = window.FlexcapadesEngine;

        // INTERIM-PAINT THROTTLE (anneal speed, 2026-11-13): the capsule
        // draw is the visible animation — keep it, but batch it to at
        // most one draw per animation frame during a run.
        // sxInterimPaintPending is set while a frame is scheduled;
        // sxInterimPaintGeo always holds the newest solved geometry,
        // so a burst of Mr calls inside one frame draws once, latest.
        let sxInterimPaintPending = !1, sxInterimPaintGeo = null;
        function Mr(e = {}) {
            sxInvalidatePairs(), layoutAutoSync(), refreshCenterRing(), sxSyncRailPx(), sxSyncMapFontBase();
            if (jn && !e.recovery) return !1;
            if (Rn) return On = {
                ...e
            }, !1;
            const t = performance.now();
            if (Bn = Bn.filter(e => t - e < 2e3), Bn.push(t), Bn.length > 250) return Cr(new Error("Excessive render activity"), "repeated rendering problem"),
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
                    // INTERIM-PAINT THROTTLE (anneal speed, 2026-11-13):
                    // the capsule draw is the animation — keep it visible,
                    // but draw at most once per animation frame. A burst of
                    // Mr calls inside one frame only replaces the pending
                    // geometry; the single rAF draws the latest state. The
                    // solve (build + angle map above) stays synchronous —
                    // only the DOM draw is deferred. If the run ends (or a
                    // new run starts) before the frame, the draw is
                    // skipped; the closing full paint shows the final state.
                    sxInterimPaintGeo = d;
                    if (!sxInterimPaintPending) {
                        sxInterimPaintPending = !0;
                        const ctx = dkCtx;
                        requestAnimationFrame(() => {
                            sxInterimPaintPending = !1;
                            const g = sxInterimPaintGeo;
                            sxInterimPaintGeo = null;
                            if (!g || dkCtx !== ctx) return;
                            try { sxInterimCapsulePaint(g); } catch (err) { __sxErrLog("layout-interim-capsule-paint", err); }
                        });
                    }
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
            // Boot-race fix (2026-11-16): the skin loader bumps
            // window.__SX_PAINT_GEN on every taxonomy swap. If the
            // generation moved since this paint started, the paint is
            // stale — abort quietly (no throw, no pause screen) and
            // let the queued re-render paint the new skin.
            const sxPaintGen = window.__SX_PAINT_GEN || 0;
            const p = new Promise(resolve => {
                const step = () => {
                    if ((window.__SX_PAINT_GEN || 0) !== sxPaintGen) return void resolve(!1);
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
                // Boot close-up fix (2026-11-13): the boot opens on a
                // hard-coded close-up of the centre avatar (the brief
                // "hello" portrait) because the camera is set before
                // the map is drawn. Once this boot paint has drawn
                // the map, pull back to the full map — Ih() also arms
                // the fit-settle chain, which re-fits again after the
                // anneal moves the nodes. Non-boot paints are untouched.
                // User-wins gate (2026-11-15): the boot paint can finish
                // AFTER the user has already focused a node (slow paint
                // on a loaded machine) — the pull-back then clobbers the
                // user's zoom (kh cancels the focus tween and re-fits).
                // A user camera move sets fitSettleUserHold via
                // noteFitUserCamera(); when it is set, skip the
                // pull-back and leave the user's camera alone.
                if (ok && sxBootArm && !fitSettleUserHold) try { Ih(); } catch (_) {}
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
