        function* Ar(i = {}) {
            // JOB B GLIDE FIX - previous-positions capture: read the live
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
            // Icons follow interest (2026-11-22): line topics and the
            // category/subcategory rollups read the (n+1) intensity,
            // which is seeded from the derivation once per profile.
            // Run the seeder before painting so a freshly loaded
            // profile's discs are colored on first paint, not only
            // after a sheet has been opened.
            try { "function" == typeof sxSeedProfileIntensities && sxSeedProfileIntensities(Vi()); } catch (_) {}
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
            // built - this paint rebuilds it below) so the end of
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
            // data-id - the density-count variant - cannot be
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
                // per-key searches below used - first in document
                // order wins for the singleton pieces (label, badge,
                // underlay item), document order preserved for the
                // control lists - so every lookup returns exactly the
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
            // is COUPLED to the global animations toggle - the toggle
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
            // paint's yields / chunked steps - and survives a paint
            // that fails or is superseded mid-flight - and is removed
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
                // shows WHO and WHAT KIND with zero math - the members'
                // own photos in a single row inside the disc, and the
                // pair's relation glyph sitting on each seam between
                // neighbours (N members → N−1 seams, one glyph per seam,
                // every seam carrying the pair's one recorded operation:
                // ⋈ for a cross pairing, ⊙ for a straight pairing,
                // ⊖ for a circle-minus pairing).
                // Per-seam differing relations have no record to read -
                // a group stores exactly one pairOp - so mixed-relation
                // seams are not defined and none are invented here. The
                // multi-select overlay (Qi) keeps precedence and its
                // existing mosaic exactly as before; an individual tab
                // keeps its single full disc. This paints only where a
                // map is painted - the legacy 3+ match panel is a
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
                // center ring instead - see refreshCenterRing().
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
