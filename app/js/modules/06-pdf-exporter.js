        Cn.addEventListener("pointerdown", e => {
            if (mn.staticMap) return;
            if (Xp) { cancelAnimationFrame(Xp); Xp = 0; }
            Cn && Cn.classList.remove("is-camera-moving");
            __sxInvalidateCtm(), Gp && sxStopViewportCamera(), eh.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            });
            const n = __sxClosestAction(e.target, "centerHit"), i = __sxClosestAction(e.target, "centerGlanceRingHit"), a = __sxClosestAction(e.target, "hiddenCountBadge") || function(e, t) {
                const n = Cn.createSVGPoint();
                n.x = e, n.y = t;
                const i = Array.from(In.querySelectorAll(".hidden-count-badge"));
                for (let t = i.length - 1; t >= 0; t--) {
                    const a = i[t], r = a.querySelector("rect"), o = r && __sxScreenCtm(r);
                    if (r && o && !__sxClosestAction(a, "hiddenState")) try {
                        const e = n.matrixTransform(o.inverse()), t = Number(r.getAttribute("x")) || 0, i = Number(r.getAttribute("y")) || 0, s = Number(r.getAttribute("width")) || 0, l = Number(r.getAttribute("height")) || 0;
                        if (e.x >= t && e.x <= t + s && e.y >= i && e.y <= i + l) return a;
                    } catch (e) { __sxErrLog("matrix-inverse", e); }
                }
                return null;
            }(e.clientX, e.clientY), r = __sxClosestAction(e.target, "directionHit"), o = (__sxClosestAction(e.target, "curveEditHandle"), 
            __sxClosestAction(e.target, "conceptHit")), s = __sxClosestAction(e.target, "mapLabelHit") || (e.target.closest && e.target.closest(".concept-path,.tapered-stem,.hanky-midline,.spoke-underlay-item,.subcategory-node,.node-group,.node-circle,.node-icon,.leaf-node,.category-node")), l = __sxClosestAction(e.target, "ratingTrackHit"), c = __sxClosestAction(e.target, "ratingClearHit"), d = e => Boolean(e && Nt && e.dataset.id === Nt.id && e.dataset.direction === Nt.direction);
            const triHitEl = __sxClosestAction(e.target, "triangleHit") || (e.target.closest && e.target.closest(".map-triangle-hit, .map-triangle-puck, .map-triad-control"));
            const triHit = triHitEl ? (triHitEl.classList.contains("map-triangle-hit") ? triHitEl : ((triHitEl.closest && triHitEl.closest(".map-triad-control")) || triHitEl).querySelector(".map-triangle-hit") || (triHitEl.classList.contains("map-triangle-hit") ? triHitEl : null)) : null;
            const tetradHit = __sxClosestAction(e.target, "tetradHit") || (e.target.closest && e.target.closest(".map-tetrad-hit, .map-tetrad-control"));
            const pentadHit = __sxClosestAction(e.target, "pentadHit") || (e.target.closest && e.target.closest(".map-pentad-hit, .map-pentad-control"));
            const hexadHit = __sxClosestAction(e.target, "hexadHit") || (e.target.closest && e.target.closest(".map-hexad-hit, .map-hexad-control"));
            const heptadHit = __sxClosestAction(e.target, "heptadHit") || (e.target.closest && e.target.closest(".map-heptad-hit, .map-heptad-control"));
            const octadHit = __sxClosestAction(e.target, "octadHit") || (e.target.closest && e.target.closest(".map-octad-hit, .map-octad-control"));
            const sxWidgetNoteHit = octadHit || heptadHit || hexadHit || pentadHit || tetradHit || triHit;
            if (sxWidgetNoteHit && 1 === eh.size && sxWidgetNoteOnDown(e, sxWidgetNoteHit.dataset && sxWidgetNoteHit.dataset.id)) return;
            if (octadHit && 1 === eh.size) {
                e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                const topicId = octadHit.dataset.id;
                if (topicId) {
                    Nt = { id: topicId, direction: "octad" };
                    // Tap = set only (owner decision pending): the drag
                    // starts here; the placard still opens by
                    // double-tapping the node. The old Pi() call was dead
                    // (never assigned as a function) and is removed, not
                    // left guarded.
                    sxMapRadarDragStart(e, octadHit, "octad");
                }
                return;
            }
            if (heptadHit && 1 === eh.size) {
                e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                const topicId = heptadHit.dataset.id;
                if (topicId) {
                    Nt = { id: topicId, direction: "heptad" };
                    // Tap = set only (owner decision pending); see octad.
                    sxMapRadarDragStart(e, heptadHit, "heptad");
                }
                return;
            }
            if (hexadHit && 1 === eh.size) {
                e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                const topicId = hexadHit.dataset.id;
                if (topicId) {
                    Nt = { id: topicId, direction: "hexad" };
                    // Tap = set only (owner decision pending); see octad.
                    sxMapRadarDragStart(e, hexadHit, "hexad");
                }
                return;
            }
            if (pentadHit && 1 === eh.size) {
                e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                const topicId = pentadHit.dataset.id;
                if (topicId) {
                    Nt = { id: topicId, direction: "pentad" };
                    // Tap = set only (owner decision pending); see octad.
                    sxMapRadarDragStart(e, pentadHit, "pentad");
                }
                return;
            }
            if (tetradHit && 1 === eh.size) {
                e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                const topicId = tetradHit.dataset.id;
                if (topicId) {
                    Nt = { id: topicId, direction: "tetrad" };
                    // Tap = set only (owner decision pending); see octad.
                    // Quad-compass topics render as this tetrad diamond
                    // (same drag-a-vertex behaviour; keys in vertex order).
                    sxMapRadarDragStart(e, tetradHit, "tetrad");
                }
                return;
            }
            if (triHit && 1 === eh.size) {
                e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                const topicId = triHit.dataset.id;
                if (topicId) {
                    Nt = { id: topicId, direction: "triangle" };
                    In.querySelectorAll(".active-rating").forEach(el => el.classList.remove("active-rating"));
                    const ctl = triHit.closest(".map-triad-control");
                    ctl && ctl.classList.add("active-rating");
                }
                const v0x = parseFloat(triHit.dataset.v0x), v0y = parseFloat(triHit.dataset.v0y);
                const v1x = parseFloat(triHit.dataset.v1x), v1y = parseFloat(triHit.dataset.v1y);
                const v2x = parseFloat(triHit.dataset.v2x), v2y = parseFloat(triHit.dataset.v2y);
                if (Number.isFinite(v0x) && Number.isFinite(v1x) && Number.isFinite(v2x)) {
                    const v0 = { x: v0x, y: v0y };
                    const v1 = { x: v1x, y: v1y };
                    const v2 = { x: v2x, y: v2y };
                    const pt = Cn.createSVGPoint();
                    pt.x = e.clientX, pt.y = e.clientY;
                    // Pointer in the triangle hit polygon's own local
                    // space (same mixed-space trap as the radar drag:
                    // the map-root conversion is wrong when the control
                    // carries its own transform).
                    const mapPt = sxMapClientToLocal(e, triHit) || pt.matrixTransform(__sxScreenCtm(In).inverse());
                    const bary = sxPointToBarycentric(mapPt.x, mapPt.y, v0, v1, v2);
                    const shape = sxWidgetConfig(topicId);
                    // Live intensity (placard memory, else signed sum of
                    // stored absolute values, else gesture memory); 0
                    // defaults to 70, the placard's drag-start rule. The
                    // old hardcoded 80 is gone.
                    const intensity = sxMapTriIntensity(topicId) || 70;
                    if (shape && shape.keys && shape.keys.length === 3) {
                        const v0r = Math.round(bary.w0 * intensity);
                        const v1r = Math.round(bary.w1 * intensity);
                        const v2r = Math.round(bary.w2 * intensity);
                        sxStoreFlankRating(topicId, shape.keys[0], v0r, !1);
                        sxStoreFlankRating(topicId, shape.keys[1], v1r, !1);
                        sxStoreFlankRating(topicId, shape.keys[2], v2r, !1);
                        sxMapPatchTriLive(topicId, v0, v1, v2, bary, [v0r, v1r, v2r], intensity);
                        sxMapTriRemember(topicId, intensity, bary.w0, bary.w1, bary.w2);
                    }
                    triDragState = {
                        pointerId: e.pointerId,
                        id: topicId,
                        v0: v0, v1: v1, v2: v2,
                        intensity: intensity,
                        prevRated: sxOutlineRatedCounts(sxActiveProfileId()).rated
                    };
                }
                return;
            }
            if (a && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId),
            void (Lp = {
                pointerId: e.pointerId,
                id: a.dataset.id,
                startX: e.clientX,
                startY: e.clientY
            });
            if (Nt && !d(r) && !d(l) && !d(c) && !triHit) {
                Nt = null;
                In.querySelectorAll(".active-rating").forEach(e => e.classList.remove("active-rating"));
            }
            if (i && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId), 
            void (Tp = {
                pointerId: e.pointerId,
                index: Number(i.dataset.centerGlanceIndex),
                target: i,
                startX: e.clientX,
                startY: e.clientY
            });
            if (c && 1 === eh.size) return e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId), 
            void (Pp = {
                pointerId: e.pointerId,
                id: c.dataset.id,
                direction: c.dataset.direction,
                startX: e.clientX,
                startY: e.clientY
            });
            if (n && 1 === eh.size) {
                if ("touch" === e.pointerType) return;
                return e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId), Fp = {
                    pointerId: e.pointerId,
                    startX: e.clientX,
                    startY: e.clientY,
                    longPressed: !1
                }, sxClearCenterHold(), void (_p = t.setTimeout(() => {
                    Fp && Fp.pointerId === e.pointerId && (Fp.longPressed = !0, sxOpenMapAbout());
                }, 520));
            }
            if (r && 1 === eh.size) {
                const sxTapNow = performance.now(), sxTapDist = Math.hypot(e.clientX - sxLastNodeTapX, e.clientY - sxLastNodeTapY);
                if (e.detail >= 2 || sxLastNodeTapId === r.dataset.id && sxTapNow - sxLastNodeTapTime < 520 && sxTapDist < 60) {
                    e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                    eo = {
                        pointerId: e.pointerId,
                        id: r.dataset.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        spoke: !1,
                        longPressed: !1
                    };
                    return;
                }
                e.preventDefault(), e.stopPropagation();
                const n = r.dataset.id, i = r.dataset.direction;
                if ("mouse" !== e.pointerType && sxOpenRatingFlyout(__sxClosestAction(r, "directionControl"), !0, sxPointerPoint(e)), 
                Nt && (Nt.id !== n || Nt.direction !== i)) return;
                return sxCaptureSvgPointer(e.pointerId), Ip = {
                    pointerId: e.pointerId,
                    el: r,
                    id: n,
                    direction: i,
                    startX: e.clientX,
                    startY: e.clientY,
                    dragged: !1,
                    longPressed: !1,
                    value: null
                }, In.querySelectorAll(".active-rating").forEach(e => e.classList.remove("active-rating")), 
                Nt = {
                    id: n,
                    direction: i
                }, sxPreviewSpokeThumb(r, null), sxClearPlacardTimer(), void (Jr = t.setTimeout(() => {
                    Ip && Ip.pointerId === e.pointerId && !Ip.dragged && (Ip.longPressed = !0, Nt = {
                        id: Ip.id,
                        direction: Ip.direction
                    }, sxPreviewSpokeThumb(Ip.el, null));
                }, 420));
            }
            if (s && !l && 1 === eh.size) {
                const n = s.dataset.id || s.dataset.topicId || s.dataset.spokeFor || s.closest?.(".node-group")?.dataset.layoutKey || __sxClosestAction(s, "nodeGroup")?.dataset.layoutKey;
                e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId);
                const i = Cn.createSVGPoint();
                i.x = e.clientX, i.y = e.clientY;
                const a = i.matrixTransform(__sxScreenCtm(In).inverse());
                if (sxPendingNodeTapTimer) {
                    try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                    sxPendingNodeTapTimer = null;
                }
                return eo = {
                    pointerId: e.pointerId,
                    id: n,
                    startX: e.clientX,
                    startY: e.clientY,
                    startTime: performance.now(),
                    startLocalX: a.x,
                    startLocalY: a.y,
                    startBend: Number(bt[n]) || 0,
                    curveLine: Boolean(!1),
                    spoke: s.classList.contains("concept-hit") || s.classList.contains("topic-stem") || s.classList.contains("category-icon-hit"),
                    curveNx: Number(o && o.dataset.nx) || 0,
                    curveNy: Number(o && o.dataset.ny) || 0,
                    longPressed: !1,
                    tipEl: s.closest?.("[data-ui-tooltip]") || s
                }, sxClearPlacardTimer(), void (Jr = t.setTimeout(() => {
                    eo && eo.pointerId === e.pointerId && (eo.longPressed = !0, to = !0, sxShowTopicTip(n, eo.startX, eo.startY, e.pointerType, eo.tipEl));
                }, 520));
            }
            return l && 1 === eh.size ? (e.preventDefault(), e.stopPropagation(), sxCaptureSvgPointer(e.pointerId), 
            Nt = {
                id: l.dataset.id,
                direction: l.dataset.direction
            }, void (Mp = {
                pointerId: e.pointerId,
                el: l,
                id: l.dataset.id,
                direction: l.dataset.direction,
                value: sxPreviewSpokeThumb(l, sxRatingAlongRail(l, e.clientX, e.clientY))
            })) : (Gp || (fh = sxLiveCameraProfile()), sxCaptureSvgPointer(e.pointerId), eh.size >= 2 ? (sxClearPlacardTimer(), sxClearCenterHold(), Mp = null, 
            Ip = null, Pp = null, Lp = null, Tp = null, eo = null, Fp = null, Sq = null, triDragState = null, radarDragState = null, yn && sxClearCurvePreview(!0), 
            void sxStorePinchBaseline()) : void (__sxClosestAction(e.target, "categoryLabel") || (Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }, Sq = {
                pointerId: e.pointerId,
                x: e.clientX,
                y: e.clientY
            })));
        }), Cn.addEventListener("pointermove", e => {
            if (!eh.has(e.pointerId)) return;
            sxNoteHoldMove(e);
            if (eh.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), eh.size >= 2) {
                Mp = null, Pp = null, Lp = null, triDragState = null, radarDragState = null, qp || sxStorePinchBaseline();
                const e = sxTwoPointerMapSpan();
                if (!qp || !e) return;
                return noteFitUserCamera(), $p = Math.max(1e-9, Math.min(Eh(), qp.scale * (e.distance / qp.distance))), 
                Ep = e.cx - qp.contentX * $p, Ap = e.cy - qp.contentY * $p, void sxMarkCameraMoving();
            }
            if (Pp && Pp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Pp.startX, e.clientY - Pp.startY) >= 10 && (Pp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Lp && Lp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Lp.startX, e.clientY - Lp.startY) >= 10 && (Lp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Tp && Tp.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Tp.startX, e.clientY - Tp.startY) >= 10 && (Tp = null, 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (Fp && Fp.pointerId === e.pointerId) {
                if (Math.hypot(e.clientX - Fp.startX, e.clientY - Fp.startY) >= 16) {
                    if (sxClearCenterHold(), Fp.longPressed) return void (Fp = null);
                    Fp = null, Cp = !0, jp = {
                        x: e.clientX,
                        y: e.clientY
                    };
                }
                return;
            }
            if (yn && yn.pointerId === e.pointerId) return void sxPreviewCurveBend(yn, sxBendFromPointer(yn, e.clientX, e.clientY));
            if (Ip && Ip.pointerId === e.pointerId) return void (Math.hypot(e.clientX - Ip.startX, e.clientY - Ip.startY) >= 10 && (sxClearPlacardTimer(), 
            Ip = null, Nt = null, In.querySelectorAll(".active-rating").forEach(e => e.classList.remove("active-rating")), 
            Cp = !0, jp = {
                x: e.clientX,
                y: e.clientY
            }));
            if (triDragState && triDragState.pointerId === e.pointerId) {
                const st = triDragState;
                // Staleness guard: a repaint/settle mid-drag re-emits the
                // hit polygon; if the vertices moved, cancel the drag
                // rather than writing against stale geometry.
                const triHitNow = In.querySelector(`.map-triangle-hit[data-id="${CSS.escape(st.id)}"]`);
                let triStale = !triHitNow;
                if (triHitNow) {
                    const liveVs = [[+triHitNow.dataset.v0x, +triHitNow.dataset.v0y], [+triHitNow.dataset.v1x, +triHitNow.dataset.v1y], [+triHitNow.dataset.v2x, +triHitNow.dataset.v2y]];
                    const stVs = [st.v0, st.v1, st.v2];
                    for (let k = 0; k < 3; k++) if (Math.abs(liveVs[k][0] - stVs[k].x) > 0.01 || Math.abs(liveVs[k][1] - stVs[k].y) > 0.01) { triStale = true; break; }
                }
                if (triStale) { triDragState = null; return; }
                const pt = Cn.createSVGPoint();
                pt.x = e.clientX, pt.y = e.clientY;
                const mapPt = sxMapClientToLocal(e, triHitNow) || pt.matrixTransform(__sxScreenCtm(In).inverse());
                const bary = sxPointToBarycentric(mapPt.x, mapPt.y, st.v0, st.v1, st.v2);
                const shape = sxWidgetConfig(st.id);
                if (shape && shape.keys && shape.keys.length === 3) {
                    const intensity = st.intensity;
                    const v0r = Math.round(bary.w0 * intensity);
                    const v1r = Math.round(bary.w1 * intensity);
                    const v2r = Math.round(bary.w2 * intensity);
                    sxStoreFlankRating(st.id, shape.keys[0], v0r, !1);
                    sxStoreFlankRating(st.id, shape.keys[1], v1r, !1);
                    sxStoreFlankRating(st.id, shape.keys[2], v2r, !1);
                    sxMapPatchTriLive(st.id, st.v0, st.v1, st.v2, bary, [v0r, v1r, v2r], intensity);
                    sxMapTriRemember(st.id, intensity, bary.w0, bary.w1, bary.w2);
                }
                return;
            }
            if (sxMapRadarDragMove(e)) return;
            if (eo && eo.pointerId === e.pointerId) {
                if (eo.longPressed) return;
                if (Math.hypot(e.clientX - eo.startX, e.clientY - eo.startY) >= sxNoteSlop(e)) {
                    sxClearPlacardTimer();
                    eo = null;
                    Cp = !0;
                    jp = {
                        x: e.clientX,
                        y: e.clientY
                    };
                } else {
                    return;
                }
            }
            if (Mp && Mp.pointerId === e.pointerId) return void (Mp.value = sxPreviewSpokeThumb(Mp.el, sxRatingAlongRail(Mp.el, e.clientX, e.clientY)));
            if (!Cp) return;
            const t = Mn.parentElement.getBoundingClientRect();
            noteFitUserCamera(), Ep += (e.clientX - jp.x) * (1800 / t.width), Ap += (e.clientY - jp.y) * (1240 / t.height), 
            jp = {
                x: e.clientX,
                y: e.clientY
            }, sxMarkCameraMoving();
        }), Cn.addEventListener("pointerup", sxReleaseMapGesture), Cn.addEventListener("pointercancel", sxReleaseMapGesture), 
        /* Build 2026-10-18_1305: viewport lockup fix. Kh was only registered on the map SVG, so a pointerup/pointercancel delivered anywhere else never cleaned up the gesture state — the pointer stayed in the active-pointer map (eh) forever, every later press read as a phantom extra finger (all tap branches require exactly one active pointer, and pan is unreachable in the multi-pointer path), and only wheel zoom, which never consults eh, kept working. The exposed path: a touch long-press on the center node opens the modal About dialog (sh via Wi/showModal) while the finger is still down — the touch branch takes no pointer capture — so the release lands on the dialog, not the SVG. Rescue: window-level capture listeners run the same Kh cleanup whenever the map owns the pointer (tracked in eh or any gesture state) but the release lands outside the map; lostpointercapture on the SVG cleans up the same way if capture is lost mid-gesture. In-map releases are untouched (Cn.contains guard) and Kh is idempotent, so normal gestures behave exactly as before. */
        window.addEventListener("pointerup", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn, triDragState, radarDragState ].some(t => t && t.pointerId === e.pointerId)) && !Cn.contains(e.target) && sxReleaseMapGesture(e);
        }, !0), window.addEventListener("pointercancel", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn, triDragState, radarDragState ].some(t => t && t.pointerId === e.pointerId)) && !Cn.contains(e.target) && sxReleaseMapGesture(e);
        }, !0), Cn.addEventListener("lostpointercapture", e => {
            (eh.has(e.pointerId) || [ Pp, Lp, Tp, Fp, Ip, Mp, eo, yn, triDragState, radarDragState ].some(t => t && t.pointerId === e.pointerId)) && sxReleaseMapGesture(e);
        }), Cn.addEventListener("touchstart", e => {
            if (mn.staticMap || 1 !== e.touches.length || !e.target.closest || !__sxClosestAction(e.target, "centerHit")) return;
            const n = e.touches[0];
            e.preventDefault(), e.stopPropagation(), Np = {
                identifier: n.identifier,
                startX: n.clientX,
                startY: n.clientY,
                moved: !1,
                longPressed: !1
            }, sxClearCenterHold(), _p = t.setTimeout(() => {
                Np && Np.identifier === n.identifier && !Np.moved && (Np.longPressed = !0, sxOpenMapAbout());
            }, 520);
        }, {
            passive: !1
        }), Cn.addEventListener("touchmove", e => {
            if (!Np) return;
            const t = Array.from(e.touches).find(e => e.identifier === Np.identifier);
            t && (Math.hypot(t.clientX - Np.startX, t.clientY - Np.startY) >= 32 && (Np.moved = !0, 
            sxClearCenterHold()), e.preventDefault(), e.stopPropagation());
        }, {
            passive: !1
        }), Cn.addEventListener("touchend", e => {
            if (!Np) return;
            const touchPoint = Array.from(e.changedTouches).find(e => e.identifier === Np.identifier), n = Np.longPressed, i = Boolean(touchPoint && !Np.moved && !n && Math.hypot(touchPoint.clientX - Np.startX, touchPoint.clientY - Np.startY) < 32);
            sxClearCenterHold(), Np = null, Fp = null, eh.clear(), Cp = !1, e.preventDefault(), e.stopPropagation(), 
            n ? Dp = performance.now() : i && (Dp = performance.now(), function() {
                const e = performance.now();
                e - Op < 520 ? Rp += 1 : Rp = 1, Op = e, Bp && t.clear(Bp), 3 === Rp ? (Rp = 0, 
                window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.open()) : Bp = t.setTimeout(() => {
                    if (2 === Rp) {
                        sxOpenMapAbout();
                    } else if (1 === Rp) {
                        sxApplyMapFit();
                    }
                    Rp = 0, Bp = 0;
                }, 280);
            }());
        }, {
            passive: !1
        }), Cn.addEventListener("touchcancel", () => {
            sxClearCenterHold(), Np = null, Fp = null, Tp = null, Pp = null, Lp = null, eh.clear(), Cp = !1, 
            Gp && sxStopViewportCamera();
        }, {
            passive: !0
        }), window.__sxOnPtr( e => {
            Bh && Fs.visibleFor(Bh) && !__sxClosestAction(e.target, "directionControl") && sxHideRatingFlyout(), Nt && !Cn.contains(e.target) && (Nt = null, 
            sxRequestMapPaint());
        }, !0);
        // Slider Escape close (repair #2, 2026-11-01, Jason's requirement,
        // second report: Escape still did not close the opened slider):
        // the first repair's handler listened in the bubble phase on
        // window and yielded whenever the event was already
        // defaultPrevented - any document or element handler that
        // consumed Escape first (menu, popover and tooltip handlers all
        // run earlier in the flow) silently vetoed the close, and it
        // also trusted Nt alone, so a slider left visible in the DOM
        // with Nt already cleared could never be closed. This handler
        // listens in the CAPTURE phase on window, so it runs before
        // every document and element handler; it treats a slider as
        // open when Nt is set OR the DOM still shows an active rating
        // rail / thumb / track-hit, and closing clears both the state
        // and the DOM classes before re-rendering. It still yields to
        // an open modal dialog and to text-entry targets, whose Escape
        // keeps its own meaning; nothing else can veto it.
        window.addEventListener("keydown", e => {
            if ("Escape" !== e.key) return;
            if (!Nt && !In.querySelector(".rating-rail.active-rating,.slider-thumb.active-rating,.rating-track-hit.active-rating")) return;
            const t = e.target;
            if (document.querySelector("dialog[open]") || t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""))) return;
            e.preventDefault(), e.stopPropagation(), Nt = null, Ip = null, Mp = null, In.querySelectorAll(".active-rating").forEach(el => el.classList.remove("active-rating")), sxRequestMapPaint();
        }, !0);
        const zh = e.byId("mapHint"), Vh = __sxClosestAction(zh, "mapCard"), Yh = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        if (zh) zh.textContent = Yh ? "Pinch to zoom · Drag to pan" : "Scroll to zoom · Drag to pan";
        const Xh = () => {
            if (zh) zh.hidden = !0;
        };
        Vh && (Vh.addEventListener("pointerdown", Xh, {
            once: !0,
            capture: !0
        }), Vh.addEventListener("wheel", Xh, {
            once: !0,
            capture: !0
        }), Vh.addEventListener("keydown", Xh, {
            once: !0,
            capture: !0
        })), e.byId("mapZoomOut") && (e.byId("mapZoomOut").onclick = () => {
            mn.staticMap || sxScaleCameraAtPoint($p / 1.25);
        }), e.byId("mapZoomIn") && (e.byId("mapZoomIn").onclick = () => {
            mn.staticMap || sxScaleCameraAtPoint(1.25 * $p);
        }), e.byId("mapFit") && (e.byId("mapFit").onclick = () => {
            if (mn.staticMap) return;
            // Fit eases on the same machines that already ease a focus zoom:
            // reduced-motion, a coarse pointer, and a low-memory/low-core
            // device keep the instant frame. Opening and profile changes
            // still call Ih() and land in one step.
            const sxFitMotion = Bt && !kp && !xp;
            if (!sxFitMotion) return void sxApplyMapFit();
            const f = sxFitFrame();
            sxEaseViewportCamera(f.scale, f.x, f.y);
        });
        const Zh = e.byId("legendControl"), Qh = e.byId("legendButton"), Jh = e.byId("legendPopup"), eg = e.byId("legendPopupClose"), tg = e.one("[data-open-hanky-chart]"), ng = e.byId("hankyChartLightbox"), ig = e.byId("hankyChartClose"), ag = e.byId("hankyChartViewport"), rg = e.byId("hankyChartStage"), og = e.byId("hankyChartImage");
        let sg = !1, lg = 1, cg = null, dg = null, ug = "";
        const pg = new Map;
        function sxUnhideLegendEntries() {
            if (!Jh) return;
            const grp = Jh.querySelector('[data-legend-group="ratings"]');
            if (grp) grp.hidden = !1;
            Jh.querySelectorAll("[data-legend-entry]").forEach(e => {
                e.hidden = !1;
            });
            const emptyEl = e.byId("legendEmpty");
            if (emptyEl) emptyEl.hidden = !0;
        }
        function sxSetLegendVisible(e) {
            e && sxUnhideLegendEntries(), Jh.hidden = !e, Qh.setAttribute("aria-expanded", String(e));
        }
        function sxCloseMapLegend(e = {}) {
            sg = !1, sxSetLegendVisible(!1), e.focus && Qh.focus({
                preventScroll: !0
            });
        }
        function sxPlaceHankyChart(e = !1, t = null) {
            const n = og.naturalWidth || 576, i = og.naturalHeight || 1024, a = ag.clientWidth, r = ag.clientHeight;
            if (!a || !r) return;
            const o = t ? t.viewX : a / 2, s = t ? t.viewY : r / 2, l = t ? t.contentX : e ? (ag.scrollLeft + a / 2) / Math.max(1, rg.scrollWidth) : .5, c = t ? t.contentY : e ? (ag.scrollTop + r / 2) / Math.max(1, rg.scrollHeight) : .5, d = Math.min(a / n, r / i), u = Math.max(1, Math.round(n * d * lg)), p = Math.max(1, Math.round(i * d * lg));
            rg.style.width = `${Math.max(a, u)}px`, rg.style.height = `${Math.max(r, p)}px`, 
            og.style.width = `${u}px`, og.style.height = `${p}px`, requestAnimationFrame(() => {
                ag.scrollLeft = Math.max(0, l * rg.scrollWidth - o), ag.scrollTop = Math.max(0, c * rg.scrollHeight - s);
            });
        }
        function sxScaleHankyChart(e, t = !0, n = null) {
            lg = Math.max(1, Math.min(4, e)), sxPlaceHankyChart(t, n);
        }
        function sxHideHankyLightbox(e = {}) {
            ng.hidden || (ng.hidden = !0, document.documentElement.style.overflow = ug, cg = null, 
            dg = null, pg.clear(), ag.classList.remove("is-dragging"), e.focus && tg.focus({
                preventScroll: !0
            }));
        }
        function sxStartHankyPinch() {
            const e = Array.from(pg.values());
            if (e.length < 2) return void (dg = null);
            const [t, n] = e, i = ag.getBoundingClientRect(), a = (t.x + n.x) / 2 - i.left, r = (t.y + n.y) / 2 - i.top;
            dg = {
                distance: Math.max(1, Math.hypot(t.x - n.x, t.y - n.y)),
                scale: lg,
                contentX: (ag.scrollLeft + a) / Math.max(1, rg.scrollWidth),
                contentY: (ag.scrollTop + r) / Math.max(1, rg.scrollHeight)
            }, cg = null, ag.classList.add("is-dragging");
        }
        Qh.addEventListener("click", e => {
            e.stopPropagation(), sg ? sxCloseMapLegend() : (sg = !0, sxSetLegendVisible(!0));
        }), eg.addEventListener("click", e => {
            e.stopPropagation(), sxCloseMapLegend({
                focus: !0
            });
        }), Jh.addEventListener("click", e => e.stopPropagation()), tg.addEventListener("click", function() {
            sg = !0, sxSetLegendVisible(!0), lg = 1.8, ug = document.documentElement.style.overflow, document.documentElement.style.overflow = "hidden", 
            ng.hidden = !1, requestAnimationFrame(() => {
                sxPlaceHankyChart(), ig.focus({
                    preventScroll: !0
                });
            });
        }), ig.addEventListener("click", () => sxHideHankyLightbox({
            focus: !0
        })), e.byId("hankyChartZoomOut") && e.byId("hankyChartZoomOut").addEventListener("click", () => sxScaleHankyChart(lg / 1.35)), 
        e.byId("hankyChartZoomIn") && e.byId("hankyChartZoomIn").addEventListener("click", () => sxScaleHankyChart(1.35 * lg)), e.byId("hankyChartFit") && e.byId("hankyChartFit").addEventListener("click", () => sxScaleHankyChart(1, !1)), 
        ng.addEventListener("click", e => {
            e.target === ng && sxHideHankyLightbox({
                focus: !0
            });
        }), ag.addEventListener("pointerdown", e => {
            "mouse" === e.pointerType && 0 !== e.button || (ag.setPointerCapture(e.pointerId), 
            ag.classList.add("is-dragging"), "mouse" === e.pointerType ? cg = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                left: ag.scrollLeft,
                top: ag.scrollTop
            } : (pg.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), pg.size >= 2 ? sxStartHankyPinch() : cg = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                left: ag.scrollLeft,
                top: ag.scrollTop
            }), e.preventDefault());
        }), ag.addEventListener("pointermove", e => {
            if ("mouse" !== e.pointerType && pg.has(e.pointerId) && (pg.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY
            }), pg.size >= 2)) {
                dg || sxStartHankyPinch();
                const [t, n] = Array.from(pg.values()), i = ag.getBoundingClientRect(), a = (t.x + n.x) / 2 - i.left, r = (t.y + n.y) / 2 - i.top, o = Math.max(1, Math.hypot(t.x - n.x, t.y - n.y));
                return sxScaleHankyChart(dg.scale * o / dg.distance, !1, {
                    contentX: dg.contentX,
                    contentY: dg.contentY,
                    viewX: a,
                    viewY: r
                }), void e.preventDefault();
            }
            cg && cg.id === e.pointerId && (ag.scrollLeft = cg.left - (e.clientX - cg.x), ag.scrollTop = cg.top - (e.clientY - cg.y), 
            e.preventDefault());
        });
        const wg = e => {
            if ("mouse" !== e.pointerType && pg.delete(e.pointerId), 1 === pg.size) {
                const [e, t] = pg.entries().next().value;
                dg = null, cg = {
                    id: e,
                    x: t.x,
                    y: t.y,
                    left: ag.scrollLeft,
                    top: ag.scrollTop
                };
            } else pg.size ? sxStartHankyPinch() : (dg = null, cg = null, ag.classList.remove("is-dragging"));
            "mouse" === e.pointerType && cg && cg.id === e.pointerId && (cg = null, ag.classList.remove("is-dragging"));
        };
        ag.addEventListener("pointerup", wg), ag.addEventListener("pointercancel", wg), 
        ag.addEventListener("wheel", e => {
            (e.ctrlKey || e.metaKey) && (e.preventDefault(), sxScaleHankyChart(lg * (e.deltaY < 0 ? 1.18 : 1 / 1.18)));
        }, {
            passive: !1
        }), ag.addEventListener("keydown", e => {
            "+" === e.key || "=" === e.key ? (e.preventDefault(), sxScaleHankyChart(1.35 * lg)) : "-" === e.key ? (e.preventDefault(), 
            sxScaleHankyChart(lg / 1.35)) : "0" === e.key && (e.preventDefault(), sxScaleHankyChart(1, !1));
        }), og.addEventListener("load", () => {
            ng.hidden || sxPlaceHankyChart();
        }), window.addEventListener("resize", () => {
            ng.hidden || sxPlaceHankyChart(!0);
        }), window.__sxOnPtr( e => {
            Jh.hidden || !ng.hidden || Zh.contains(e.target) || sxCloseMapLegend();
        }, !0), window.__sxOnKey( e => {
            "Escape" === e.key && (ng.hidden ? Jh.hidden || (e.preventDefault(), sxCloseMapLegend({
                focus: !0
            })) : (e.preventDefault(), sxHideHankyLightbox({
                focus: !0
            })));
        });
