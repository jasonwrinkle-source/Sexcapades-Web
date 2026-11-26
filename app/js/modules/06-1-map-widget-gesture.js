        let sxLastNodeTapTime = 0, sxLastNodeTapId = null, sxLastNodeTapX = 0, sxLastNodeTapY = 0, sxPendingNodeTapTimer = null, sxSingleTapTimeout = 0, sxLastDoubleTime = 0;
        function sxReleaseMapGesture(e) {
            sxNoteHoldRelease(e);
            if (eh.delete(e.pointerId), Cp = !1, qp = null, sxClearPlacardTimer(), Gp && sxStopViewportCamera(), triDragState && triDragState.pointerId === e.pointerId) {
                const t = triDragState;
                triDragState = null;
                sxRequestMapPaint();
                sxMapPlacardSync(t.id);
                checkMilestoneTransition(sxActiveProfileId(), t.prevRated);
                return;
            }
            if (radarDragState && radarDragState.pointerId === e.pointerId) {
                const t = radarDragState;
                radarDragState = null;
                sxRequestMapPaint();
                sxMapPlacardSync(t.id);
                checkMilestoneTransition(sxActiveProfileId(), t.prevRated);
                return;
            }
            if (Pp && Pp.pointerId === e.pointerId) {
                const t = Pp;
                return Pp = null, void ("pointerup" === e.type && sxClearTopicRating(t.id, t.direction));
            }
            if (Sq && Sq.pointerId === e.pointerId) {
                // Empty-space tap = deselect (Build 2026-10-19_0543): the
                // pointerdown fallback armed Sq only when the press hit no
                // node, control, or label, so a release within 10px is a
                // tap on empty map - clear the spoke selection through
                // the shared clear path (clearSpokeSelection: Lt/Nt,
                // a search dim, relation emphasis, marking removal,
                // no re-render) and
                // tell the Layout Editor so its selects follow. A drag
                // (pan) or a second finger disarms Sq without deselecting.
                const t = Sq;
                if (Sq = null, "pointerup" === e.type && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 10 && clearSpokeSelection()) (() => {
                    try {
                        window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.clearSelection && window.__SEXCAPADES_LAYOUT_UI.clearSelection();
                    } catch (err) {
                        __sxErrLog("layout-deselect", err);
                    }
                })();
            }
            if (Lp && Lp.pointerId === e.pointerId) {
                const t = Lp;
                return Lp = null, void ("pointerup" === e.type && sxFlipFilterOrExpand(t.id));
            }
            if (Tp && Tp.pointerId === e.pointerId) {
                const t = Tp;
                return Tp = null, void ("pointerup" === e.type && sxShowColorGlance(t.index, t.target));
            }
            if (Fp && Fp.pointerId === e.pointerId) {
                const curFp = Fp;
                Fp = null, sxClearCenterHold(), Dp = performance.now();
                if ("pointerup" === e.type && !curFp.longPressed) {
                    sxCenterAvatarClick(e.clientX, e.clientY, e.detail >= 2);
                }
                return;
            }
            if (yn && yn.pointerId === e.pointerId) return "pointerup" === e.type && sxPreviewCurveBend(yn, sxBendFromPointer(yn, e.clientX, e.clientY)),
            void sxClearCurvePreview(!0);
            if (eo && eo.pointerId === e.pointerId) {
                const n = eo;
                eo = null;
                to = !0;
                if (sxSingleTapTimeout) {
                    try { window.clearTimeout(sxSingleTapTimeout); } catch (_) {}
                }
                sxSingleTapTimeout = window.setTimeout(() => {
                    to = !1;
                }, 120);
                if (n.longPressed) return;
                // A phone ends a long-press with pointercancel just
                // before the 520ms timer. A finger that stayed put
                // still gets the hover tip.
                if ("pointercancel" === e.type) {
                    const held = n.startTime ? performance.now() - n.startTime : 0, moved = Math.hypot((e.clientX || n.startX) - n.startX, (e.clientY || n.startY) - n.startY);
                    if (held >= 400 && moved < 28) sxShowTopicTip(n.id, n.startX, n.startY, e.pointerType, n.tipEl);
                    return;
                }
                // Ctrl/Cmd-click (no Shift, no Alt) toggles this node's
                // branch in the Anneal checklist. It does not select,
                // focus, or open the sheet. `to` is already set above,
                // so the click that follows this pointerup is swallowed.
                if (sxMapAnnealChord(e)) {
                    if (sxPendingNodeTapTimer) {
                        try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                        sxPendingNodeTapTimer = null;
                    }
                    sxLastNodeTapTime = 0;
                    sxLastNodeTapId = null;
                    sxToggleAnnealFromMap(n.id);
                    return;
                }

                const now = performance.now();
                const timeDiff = now - sxLastNodeTapTime;
                const dist = Math.hypot(e.clientX - sxLastNodeTapX, e.clientY - sxLastNodeTapY);
                let rawSid = String(n.id || "");
                if (rawSid.startsWith("cat-")) rawSid = rawSid.slice(4);
                if (rawSid.startsWith("subcategory-")) rawSid = rawSid.slice(12);
                const sid = rawSid;
                const rec = sxNodeRegistry[sid] || sxNodeById(sid);
                const cat = h.find(c => c.name === sid || c.id === sid || catId(c.name) === sid || sxName(c.name) === sxName(sid));
                const isCat = Boolean(cat) || isCatId(sid) || (rec && rec.kind === "Category") || (sid.startsWith("c") && sid.length <= 5);
                const isSub = isSubId(sid) || (rec && rec.kind === "Subcategory") || (sid.startsWith("s") && sid.length <= 5);
                const isKnownNode = isCat || isSub || Boolean(rec);
                const branch = cat ? cat.name : ((rec && rec.branch) || sxLookupNodeBranch(sid) || "");

                const isDouble = (e.detail >= 2) || (timeDiff < 520 && (dist < 60 || sxLastNodeTapId === sid));

                if ((isKnownNode || sid) && isDouble) {
                    // Double tap / click opens the sheet for ALL nodes (category, subcategory, kink/topic)
                    if (sxPendingNodeTapTimer) {
                        try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                        sxPendingNodeTapTimer = null;
                    }
                    sxClearPlacardTimer();
                    sxLastNodeTapTime = 0;
                    sxLastNodeTapId = null;
                    sxLastDoubleTime = now;
                    window.__sxStopFocusZoom && window.__sxStopFocusZoom();

                    const targetNodeId = cat ? cat.id : sid;
                    if (typeof sxOpenMarkPlacard === "function") {
                        sxOpenMarkPlacard(targetNodeId, e.clientX, e.clientY);
                    }
                    return;
                }

                sxLastNodeTapTime = now;
                sxLastNodeTapId = sid;
                sxLastNodeTapX = e.clientX;
                sxLastNodeTapY = e.clientY;

                if (sxPendingNodeTapTimer) {
                    try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                    sxPendingNodeTapTimer = null;
                }
                // Single tap navigates / selects and animates camera focus
                sxPendingNodeTapTimer = window.setTimeout(() => {
                    sxPendingNodeTapTimer = null;
                    if (sxLastDoubleTime && performance.now() - sxLastDoubleTime < 520) return;
                    if ("pointerup" !== e.type) return;
                    if (isCat || isSub) {
                        // Branch-label tap, fast path (Build 2026-11-15_2225):
                        // a label tap on an already-expanded branch used to run
                        // the expand path, whose full re-render holds the camera
                        // zoom behind it (seconds on a loaded machine) although
                        // the branch is already open. When the label's own
                        // aria-expanded says the branch is open, select like
                        // the icon instead and zoom at once; only a collapsed
                        // branch still takes the expand path (which re-renders
                        // to reveal its children before the zoom). The
                        // aria-expanded="true" attribute selector matches only
                        // the real label: the overlay clone carries no
                        // aria-expanded (it is aria-hidden instead).
                        const sxLabelEl = document.querySelector(`.category-label[data-id="${CSS.escape(sid)}"][aria-expanded="true"], .subcategory-label[data-id="${CSS.escape(sid)}"][aria-expanded="true"]`);
                        n.spoke || sxLabelEl ? selectSpokeNode(n.id, !0) : sxImportPeerOrToggle(n.id);
                        window.__sxZoomFromNavigation = true;
                        if (typeof sxFrameNodeInCamera === "function") sxFrameNodeInCamera(sid, branch);
                        return;
                    }
                    selectSpokeNode(n.id, !0);
                    window.__sxZoomFromNavigation = true;
                    if (typeof sxFrameNodeInCamera === "function") sxFrameNodeInCamera(sid, branch);
                // Wait out the double-tap window before zooming, so the
                // second tap still lands on the topic it started on.
                }, 520);
                return;
            }
            if (Ip && Ip.pointerId === e.pointerId) {
                const t = Ip;
                if (Ip = null, "pointerup" === e.type && t.dragged) {
                    const profileId = sxActiveProfileId(), previousRatedCount = sxOutlineRatedCounts(profileId).rated, n = sxPreviewSpokeThumb(t.el, sxRatingAlongRail(t.el, e.clientX, e.clientY, !0));
                    Number.isNaN(n) ? (sxCommitRailValue(t.el, t.id, t.direction, n), Nt = null, sxRequestMapPaint()) : null === n ? (Nt = {
                        id: t.id,
                        direction: t.direction
                    }, sxRequestMapPaint()) : (sxCommitRailValue(t.el, t.id, t.direction, n), Nt = null, sxRequestMapPaint()), checkMilestoneTransition(profileId, previousRatedCount);
                } else "pointerup" === e.type && t.longPressed, Nt = {
                    id: t.id,
                    direction: t.direction
                }, sxRequestMapPaint(), "mouse" !== e.pointerType && function(e, t, n) {
                    requestAnimationFrame(() => {
                        const i = In.querySelector(`.direction-control[data-id="${CSS.escape(e)}"][data-direction="${CSS.escape(t)}"]`);
                        i && sxOpenRatingFlyout(i, !0, n);
                    });
                }(t.id, t.direction, sxPointerPoint(e));
                return;
            }
            if (Mp && Mp.pointerId === e.pointerId) {
                const t = Mp;
                // pointerup is the commit. lostpointercapture is the
                // fallback when capture ends without a pointerup (the
                // hit node was replaced mid-drag). pointerup runs first
                // and clears Mp, so the fallback does not write again.
                if (Mp = null, "pointerup" === e.type || "lostpointercapture" === e.type) {
                    const profileId = sxActiveProfileId(), previousRatedCount = sxOutlineRatedCounts(profileId).rated;
                    let n;
                    if ("lostpointercapture" === e.type && !e.clientX && !e.clientY && Number.isFinite(Number(t.value))) n = Number(t.value);
                    else n = sxPreviewSpokeThumb(t.el, sxRatingAlongRail(t.el, e.clientX, e.clientY));
                    Number.isNaN(n) ? sxCommitRailValue(t.el, t.id, t.direction, n) : null !== n && sxCommitRailValue(t.el, t.id, t.direction, n),
                    Nt = null, sxRequestMapPaint(), checkMilestoneTransition(profileId, previousRatedCount);
                } else Nt = null, sxRequestMapPaint();
            }
        }
        Cn.addEventListener("pointerover", e => {
            if ("mouse" !== e.pointerType) return;
            const t = sxFindDirectionControl(e.target);
            t && sxOpenRatingFlyout(t, !1, sxPointerPoint(e));
        }), Cn.addEventListener("pointermove", e => {
            Bh && Fs.visibleFor(Bh) && (sxFindDirectionControl(e.target) === Bh || "mouse" !== e.pointerType && (Ip || Mp)) && (jh = sxPointerPoint(e),
            sxMoveRatingFlyout());
        }), Cn.addEventListener("pointerout", e => {
            if ("mouse" !== e.pointerType) return;
            if (!sxFindDirectionControl(e.target)) return;
            const t = sxFindDirectionControl(e.relatedTarget);
            t ? sxOpenRatingFlyout(t, !1, sxPointerPoint(e)) : sxHideRatingFlyout();
        }), Cn.addEventListener("focusin", e => {
            const t = sxFindDirectionControl(e.target);
            t && sxOpenRatingFlyout(t);
        }), Cn.addEventListener("focusout", e => {
            if (!__sxClosestAction(e.target, "directionControl")) return;
            const t = sxFindDirectionControl(e.relatedTarget);
            t ? sxOpenRatingFlyout(t) : sxHideRatingFlyout();
        });
        // On-map n-pole widget interactivity (Build 2026-11-18): helpers for
        // the triad live intensity, radar drag math, live DOM patching, the
        // widget wheel, and the gesture-end placard sync. All rating writes
        // go through the rating setter (never a direct store write); during
        // a drag/wheel burst writes use the no-repaint flag and the widget
        // DOM is patched live; one full repaint + placard sync + milestone
        // check happen at gesture end.
        function sxMapTriMemoryFor(topicId) {
            // In-memory triad gesture state (session-only, never stored):
            // the live intensity + weights, mirroring the placard's
            // in-memory triad state. It is what carries the intensity
            // through the all-zero crossing, where the stored ratings round
            // to 0 and can no longer say whether the intensity was +1 or -1.
            return sxMapTriMemory[topicId] || null;
        }
        function sxMapTriRemember(topicId, intensity, w0, w1, w2) {
            sxMapTriMemory[topicId] = { intensity, w0, w1, w2 };
        }
        function sxMapTriIntensity(topicId) {
            // Live triad intensity: the placard's in-memory intensity when
            // it is open for this topic; else derived from the stored
            // ratings exactly as the placard sync does (signed sum of
            // absolute values); when the stored ratings are all zero, the
            // map's own gesture memory (if any) carries the intensity
            // through the zero crossing. Returns 0 when nothing is known;
            // callers apply the drag-start 70 default where it belongs.
            if (Qr === topicId && sxTriState.topicId === topicId) return sxTriState.intensity;
            const shape = sxWidgetConfig(topicId);
            if (!shape || !shape.keys || shape.keys.length !== 3) return 0;
            const rec = sxRatingRecord(topicId, sxActiveProfileId());
            const r0 = rec && rec[shape.keys[0] + "Known"] ? rec[shape.keys[0]] : 0;
            const r1 = rec && rec[shape.keys[1] + "Known"] ? rec[shape.keys[1]] : 0;
            const r2 = rec && rec[shape.keys[2] + "Known"] ? rec[shape.keys[2]] : 0;
            const sumAbs = Math.abs(r0) + Math.abs(r1) + Math.abs(r2);
            if (sumAbs > 0) return (r0 + r1 + r2 < 0 ? -1 : 1) * sumAbs;
            const mem = sxMapTriMemoryFor(topicId);
            return mem ? mem.intensity : 0;
        }
        function sxMapTriWeights(topicId) {
            // Barycentric weights from the stored ratings; when all stored
            // ratings are zero, keep the placard's in-memory weights if the
            // placard is open for this topic, else the map's own gesture
            // memory, else the centroid.
            const shape = sxWidgetConfig(topicId);
            const w = { w0: 1 / 3, w1: 1 / 3, w2: 1 / 3 };
            if (!shape || !shape.keys || shape.keys.length !== 3) return w;
            const rec = sxRatingRecord(topicId, sxActiveProfileId());
            const a0 = rec && rec[shape.keys[0] + "Known"] ? Math.abs(rec[shape.keys[0]]) : 0;
            const a1 = rec && rec[shape.keys[1] + "Known"] ? Math.abs(rec[shape.keys[1]]) : 0;
            const a2 = rec && rec[shape.keys[2] + "Known"] ? Math.abs(rec[shape.keys[2]]) : 0;
            const sum = a0 + a1 + a2;
            if (sum > 0) { w.w0 = a0 / sum; w.w1 = a1 / sum; w.w2 = a2 / sum; }
            else if (Qr === topicId && sxTriState.topicId === topicId && (sxTriState.w0 + sxTriState.w1 + sxTriState.w2) > 0) {
                w.w0 = sxTriState.w0; w.w1 = sxTriState.w1; w.w2 = sxTriState.w2;
            } else {
                const mem = sxMapTriMemoryFor(topicId);
                if (mem && (mem.w0 + mem.w1 + mem.w2) > 0) { w.w0 = mem.w0; w.w1 = mem.w1; w.w2 = mem.w2; }
            }
            return w;
        }
        function sxMapPlacardSync(topicId) {
            // Gesture-end placard sync: only when the placard is open for
            // this same topic; the sync re-derives the placard widget state
            // (sliders/capsule/puck/point + pole tips) from stored ratings.
            if (!topicId) return;
            try {
                if (Qr === topicId && Pr && !Pr.hidden && typeof sxSyncMarkRatings === "function") sxSyncMarkRatings(topicId);
            } catch (err) { __sxErrLog("map-placard-sync", err); }
        }
        function sxMapPatchTriLive(topicId, v0, v1, v2, bary, values, intensity) {
            // Live DOM patch for the on-map triangle: puck position/fill,
            // vertex-dot emphasis by weight, gradient brightness by
            // |intensity| (mirrors the placard draw's brightness rule).
            const ctl = In.querySelector(`.map-triad-control[data-id="${CSS.escape(topicId)}"]`);
            if (!ctl) return;
            if (!ctl.classList.contains("active-rating")) {
                In.querySelectorAll(".active-rating").forEach(el => el.classList.remove("active-rating"));
                ctl.classList.add("active-rating");
            }
            const puck = ctl.querySelector(".map-triangle-puck");
            if (puck) {
                const at = sxMapTriadPuckAt(v0, v1, v2, bary.w0, bary.w1, bary.w2);
                puck.setAttribute("cx", at.x.toFixed(1));
                puck.setAttribute("cy", at.y.toFixed(1));
                puck.setAttribute("fill", sxInterestColor(sxSignedIntensity(values)));
            }
            const dots = ctl.querySelectorAll("circle:not(.map-triangle-puck)");
            dots.forEach((dot, k) => {
                const w = [bary.w0, bary.w1, bary.w2][k];
                if (w === undefined) return;
                dot.setAttribute("fill-opacity", (0.3 + 0.7 * w).toFixed(2));
            });
            const br = 0.28 + 0.72 * (Math.abs(intensity) / 100);
            ctl.querySelectorAll("linearGradient stop").forEach(stop => {
                if (!stop.dataset.sxBaseOp) stop.dataset.sxBaseOp = stop.getAttribute("stop-opacity") || "0.35";
                stop.setAttribute("stop-opacity", (parseFloat(stop.dataset.sxBaseOp) * br).toFixed(2));
            });
        }
        function sxMapPatchRadarLive(topicId, type, cx, cy, vertices, values) {
            // Live DOM patch for an on-map radar: deformed polygon points
            // + vertex dots moved to the deformed positions. Creates the
            // deformed polygon if the paint never emitted one (all-zero
            // start: pentad/tetrad only emit it when some value > 0).
            const ctl = In.querySelector(`.map-${type}-control[data-id="${CSS.escape(topicId)}"]`);
            if (!ctl) return;
            const sxMapRadarMaxAbs = Math.max(...values.map(v => Math.abs(v || 0)), 0);
            const pts = vertices.map((v, k) => {
                const d = sxMapRadarMaxAbs > 0 ? Math.abs(values[k] || 0) / sxMapRadarMaxAbs : 0;
                return { x: cx + (v.x - cx) * d, y: cy + (v.y - cy) * d };
            });
            const ptsStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
            let def = ctl.querySelector("polygon[fill-opacity]");
            const maxV = sxSignedIntensity(values);
            if (!def) {
                const hit = ctl.querySelector(".direction-hit");
                if (!hit) return;
                def = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                def.setAttribute("fill-opacity", "0.55");
                def.setAttribute("stroke", "#ffffff");
                def.setAttribute("stroke-width", "1.4");
                hit.parentNode.insertBefore(def, hit);
            }
            def.setAttribute("points", ptsStr);
            def.setAttribute("fill", sxInterestColor(maxV));
            const dots = ctl.querySelectorAll("circle");
            dots.forEach((dot, k) => {
                if (!pts[k]) return;
                dot.setAttribute("cx", pts[k].x.toFixed(1));
                dot.setAttribute("cy", pts[k].y.toFixed(1));
            });
        }
        function sxMapClientToLocal(e, el) {
            // Convert a pointer event's client coords into an SVG element's
            // own local space. The element's getScreenCTM includes every
            // ancestor transform, including its control group's own
            // translate/rotate. The map-root conversion
            // (__sxScreenCtm(In)) lands in the camera group's space, which
            // is NOT a control's local space when the control carries a
            // non-identity transform - quad-compass controls do (a
            // translate of several hundred local units), so a root-space
            // pointer measured against local-space vertices read ~30% off
            // (drag-from-zero gave 100/40/40/40 instead of 80/25/25/25).
            // Controls with an identity transform are unaffected: the two
            // conversions agree there. Returns null when the element has
            // no CTM (callers fall back to the root conversion).
            try {
                const ctm = el && el.getScreenCTM ? el.getScreenCTM() : null;
                if (!ctm) return null;
                const pt = Cn.createSVGPoint();
                pt.x = e.clientX; pt.y = e.clientY;
                return pt.matrixTransform(ctm.inverse());
            } catch (err) { __sxErrLog("client-to-local", err); return null; }
        }
        function sxMapRadarVertices(hitEl, type) {
            // Reference vertices (in key order: Ka emits vertex k for key
            // k) from a radar hit polygon's points attribute, with angles.
            const poly = hitEl.classList.contains(`map-${type}-hit`) ? hitEl : hitEl.querySelector(`.map-${type}-hit`);
            if (!poly) return null;
            const ctl = poly.closest(".direction-control");
            const cx = ctl ? parseFloat(ctl.dataset.baseCx) : NaN;
            const cy = ctl ? parseFloat(ctl.dataset.baseCy) : NaN;
            if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
            const ptsAttr = poly.getAttribute("points") || "";
            const vertices = ptsAttr.trim().split(/\s+/).map(pair => {
                const parts = pair.split(",");
                const x = Number(parts[0]), y = Number(parts[1]);
                return { x, y, angle: Math.atan2(y - cy, x - cx) };
            }).filter(v => Number.isFinite(v.x) && Number.isFinite(v.y));
            if (!vertices.length) return null;
            return { cx, cy, vertices, r: Math.hypot(vertices[0].x - cx, vertices[0].y - cy), poly };
        }
        function sxMapRadarDragStart(e, hitEl, type) {
            // Tap/drag-a-vertex start, mirroring the placard bind pattern:
            // closest-axis pick with a 22px screen handle made scale-aware,
            // drag-from-zero polygon init (dragged = value, others = base =
            // max(20, value/2), lock once value > base).
            const topicId = hitEl.dataset.id;
            if (!topicId) return false;
            const shape = sxWidgetConfig(topicId);
            if (!shape || !shape.keys || shape.keys.length < 3) return false;
            const geom = sxMapRadarVertices(hitEl, type);
            if (!geom || geom.vertices.length !== shape.keys.length || !(geom.r > 0)) return false;
            const { cx, cy, vertices, r, poly } = geom;
            const pt = Cn.createSVGPoint();
            pt.x = e.clientX; pt.y = e.clientY;
            // Pointer in the hit polygon's own local space (see the helper:
            // the map-root conversion is the wrong space when the control
            // carries its own transform, as quad-compass controls do).
            const mapPt = sxMapClientToLocal(e, poly) || pt.matrixTransform(__sxScreenCtm(In).inverse());
            const rec = sxRatingRecord(topicId, sxActiveProfileId());
            const values = shape.keys.map(k => {
                const v = rec && rec[k + "Known"] ? rec[k] : 0;
                return Math.max(-100, Math.min(100, Math.round(v || 0)));
            });
            const isAllZero = values.every(v => !v);
            let handleRadius = 22;
            try {
                // 22 screen px expressed in the polygon's local units, so
                // the closest-axis handle is a real on-screen distance.
                // (Dividing by the map-root scale instead made it ~0.5px
                // on screen - drags still worked on-axis, but a tap
                // slightly off-axis would pick no axis at all.)
                const ctm = poly.getScreenCTM();
                const scale = ctm ? Math.hypot(ctm.a, ctm.b) : 0;
                if (scale > 0) handleRadius = 22 / scale;
            } catch (err) { __sxErrLog("radar-handle-scale", err); }
            const active = sxFindClosestAxis(mapPt.x, mapPt.y, cx, cy, vertices, isAllZero ? null : values, handleRadius);
            const angle = vertices[active].angle;
            const dot = (mapPt.x - cx) * Math.cos(angle) + (mapPt.y - cy) * Math.sin(angle);
            const val = Math.max(0, Math.min(100, Math.round((dot / r) * 100)));
            let dragFromZero = false, vertexLocked = false, base = 0;
            if (isAllZero && val > 0) {
                dragFromZero = true;
                base = Math.max(20, Math.round(val / 2));
                for (let k = 0; k < values.length; k++) values[k] = (k === active) ? val : base;
                if (val > base) vertexLocked = true;
                sxStorePolygon(topicId, values, !1);
            } else {
                values[active] = val;
                sxStoreFlankRating(topicId, shape.keys[active], val, !1);
            }
            radarDragState = {
                pointerId: e.pointerId, id: topicId, type,
                cx, cy, vertices, r, activeVertex: active,
                dragFromZero, vertexLocked, base, values,
                prevRated: sxOutlineRatedCounts(sxActiveProfileId()).rated
            };
            sxMapPatchRadarLive(topicId, type, cx, cy, vertices, values);
            return true;
        }
        function sxMapRadarDragMove(e) {
            // Returns true when the event was consumed by an active radar
            // drag (including a stale-geometry cancel).
            if (!radarDragState || radarDragState.pointerId !== e.pointerId) return false;
            const st = radarDragState;
            // Staleness guard: a repaint/settle mid-drag re-emits the hit
            // polygon; if the reference vertices moved, cancel the drag
            // rather than writing against stale geometry.
            const hit = In.querySelector(`.map-${st.type}-hit[data-id="${CSS.escape(st.id)}"]`);
            if (!hit) { radarDragState = null; return true; }
            const live = (hit.getAttribute("points") || "").trim().split(/\s+/).map(pair => {
                const parts = pair.split(",");
                return { x: Number(parts[0]), y: Number(parts[1]) };
            });
            let stale = live.length !== st.vertices.length;
            if (!stale) for (let k = 0; k < live.length; k++) {
                if (Math.abs(live[k].x - st.vertices[k].x) > 0.01 || Math.abs(live[k].y - st.vertices[k].y) > 0.01) { stale = true; break; }
            }
            if (stale) { radarDragState = null; return true; }
            const shape = sxWidgetConfig(st.id);
            if (!shape || !shape.keys || shape.keys.length !== st.vertices.length) { radarDragState = null; return true; }
            const pt = Cn.createSVGPoint();
            pt.x = e.clientX; pt.y = e.clientY;
            const mapPt = sxMapClientToLocal(e, hit) || pt.matrixTransform(__sxScreenCtm(In).inverse());
            if (st.dragFromZero && !st.vertexLocked) {
                st.activeVertex = sxClosestVertexByAngle(mapPt.x, mapPt.y, st.cx, st.cy, st.vertices);
            }
            const v = st.activeVertex;
            const angle = st.vertices[v].angle;
            const dot = (mapPt.x - st.cx) * Math.cos(angle) + (mapPt.y - st.cy) * Math.sin(angle);
            const val = Math.max(0, Math.min(100, Math.round((dot / st.r) * 100)));
            if (st.dragFromZero && !st.vertexLocked && val > 0) {
                const base = Math.max(20, Math.round(val / 2));
                st.base = base;
                for (let k = 0; k < st.values.length; k++) st.values[k] = (k === v) ? val : base;
                if (val > base) st.vertexLocked = true;
                sxStorePolygon(st.id, st.values, !1);
            } else {
                st.values[v] = val;
                sxStoreFlankRating(st.id, shape.keys[v], val, !1);
            }
            sxMapPatchRadarLive(st.id, st.type, st.cx, st.cy, st.vertices, st.values);
            return true;
        }
        function sxMapScheduleWidgetRepaint(topicId, prevRated) {
            // One trailing full repaint 150ms after the last wheel event in
            // a burst, then the placard sync + milestone check. The
            // previous-rated count is the burst's first (pre-write) count.
            if (sxWidgetWheelPending) {
                sxWidgetWheelPending.topicId = topicId;
                try { window.clearTimeout(sxWidgetWheelPending.timer); } catch (_) {}
            } else {
                sxWidgetWheelPending = { topicId, prevRated, timer: 0 };
            }
            sxWidgetWheelPending.timer = window.setTimeout(() => {
                const pending = sxWidgetWheelPending;
                sxWidgetWheelPending = null;
                if (!pending) return;
                sxRequestMapPaint();
                sxMapPlacardSync(pending.topicId);
                checkMilestoneTransition(sxActiveProfileId(), pending.prevRated);
            }, 150);
        }
        function sxMapWidgetWheel(e) {
            // Delegated widget wheel: returns true when the wheel was
            // consumed by an on-map n-pole widget (or swallowed on a frozen
            // map), false to let the existing zoom path run. Runs before any
            // zoom/debounce state is touched; routing is positional per
            // event, so leaving the widget releases back to zoom with no
            // capture state. Mid-drag wheels route the same way; the drag
            // re-anchors from the pointer on its next move.
            const tgt = e.target;
            const wHit = tgt && tgt.closest ? tgt.closest(".map-triangle-hit, .map-tetrad-hit, .map-pentad-hit, .map-hexad-hit, .map-heptad-hit, .map-octad-hit, .map-triangle-puck, .map-triad-control, .map-tetrad-control, .map-pentad-control, .map-hexad-control, .map-heptad-control, .map-octad-control") : null;
            if (!wHit) return false;
            e.preventDefault();
            if (mn.staticMap) return true;
            const ctl = wHit.closest ? wHit.closest(".direction-control") : null;
            const topicId = (ctl && ctl.dataset.id) || wHit.dataset.id;
            const direction = (ctl && ctl.dataset.direction) || wHit.dataset.direction;
            if (!topicId || !direction) return true;
            const shape = sxWidgetConfig(topicId);
            if (!shape || !shape.keys) return true;
            const step = (e.shiftKey ? 10 : 50) * (e.deltaY < 0 ? 1 : -1);
            const prevRated = sxOutlineRatedCounts(sxActiveProfileId()).rated;
            const rec = sxRatingRecord(topicId, sxActiveProfileId());
            if (direction === "triangle" && shape.keys.length === 3) {
                const w = sxMapTriWeights(topicId);
                // Wheel steps from the live intensity (no 70 default here:
                // the wheel must step through zero to the opposite sign,
                // which the gesture memory makes possible).
                const intensity = Math.max(-100, Math.min(100, sxMapTriIntensity(topicId) + step));
                const v0r = Math.round(w.w0 * intensity);
                const v1r = Math.round(w.w1 * intensity);
                const v2r = Math.round(w.w2 * intensity);
                sxStoreMapTriad(topicId, [ v0r, v1r, v2r ]);
                sxMapTriRemember(topicId, intensity, w.w0, w.w1, w.w2);
                const hit = In.querySelector(`.map-triangle-hit[data-id="${CSS.escape(topicId)}"]`);
                if (hit) {
                    const vv = [{ x: +hit.dataset.v0x, y: +hit.dataset.v0y }, { x: +hit.dataset.v1x, y: +hit.dataset.v1y }, { x: +hit.dataset.v2x, y: +hit.dataset.v2y }];
                    sxMapPatchTriLive(topicId, vv[0], vv[1], vv[2], w, [v0r, v1r, v2r], intensity);
                }
            } else if (["tetrad", "pentad", "hexad", "heptad", "octad"].indexOf(direction) >= 0) {
                const scale = (100 + step) / 100;
                const values = shape.keys.map(k => {
                    const v = rec && rec[k + "Known"] ? rec[k] : 0;
                    return Math.max(-100, Math.min(100, Math.round(v * scale)));
                });
                sxStorePolygon(topicId, values, !1);
                const geom = sxMapRadarVertices(In.querySelector(`.map-${direction}-hit[data-id="${CSS.escape(topicId)}"]`) || wHit, direction);
                if (geom && geom.vertices.length === shape.keys.length) sxMapPatchRadarLive(topicId, direction, geom.cx, geom.cy, geom.vertices, values);
            } else {
                return true;
            }
            sxMapScheduleWidgetRepaint(topicId, prevRated);
            return true;
        }
        Cn.addEventListener("wheel", e => {
            if (sxMapWidgetWheel(e)) return;
            e.preventDefault();
            if (mn.staticMap) return;
            if (Xp) { cancelAnimationFrame(Xp); Xp = 0; }
            Cn && Cn.classList.remove("is-camera-moving");
            const t = performance.now(), n = t - Nh, i = 1 === e.deltaMode ? 16 : 2 === e.deltaMode ? 320 : 1, a = e.deltaY * i, r = Math.sign(a), o = Math.abs(a);
            if (!r) return;
            const s = !Fh || n > 180;
            const sxMagnitudeGenuine = o > Math.max(14, 1.35 * Dh);
            if ((0 !== _h || Oh) && 0 !== Fh && r !== Fh && !sxMagnitudeGenuine) {
                if (sxWheelProb.dir !== r || t - sxWheelProb.t > 300) { sxWheelProb.dir = r; sxWheelProb.acc = 0; sxWheelProb.n = 0; }
                sxWheelProb.acc += o; sxWheelProb.n += 1; sxWheelProb.t = t;
                if (sxWheelProb.n < 3 && sxWheelProb.acc < 30) { return Nh = t, void (Dh = o); }
                sxWheelProb.dir = 0; sxWheelProb.acc = 0; sxWheelProb.n = 0;
                Fh = r; _h = 0; Rh = 0; Oh = !1;
            }
            s && (Fh = r, _h = 0, Rh = 0, Oh = !1);
            const l = r !== Fh && (n > 105 || o > Math.max(14, 1.35 * Dh));
            if (r !== Fh && !l) return Nh = t, void (Dh = o);
            if (l && (Fh = r, _h = 0, Rh = 0, Oh = !1), !s && r === Fh && o < .82 * Dh && n < 38 ? Rh++ : Rh = 0,
            Nh = t, Dh = o, Rh >= 4 && (Oh = !0), _h === r || Oh) return;
            const c = Eh(), d = Math.max(-48, Math.min(48, a)), u = $p * Math.exp(.0035 * -d);
            if (u < $p && $p <= 1e-9) return void (_h = r);
            const p = Math.max(1e-9, Math.min(c, u));
            if (Math.abs(p - $p) < 1e-5 * Math.min(1, $p * 1e3)) return void (_h = r);
            const h = sxPointerToMapPoint(e.clientX, e.clientY), g = $p;
            noteFitUserCamera(), $p = p, Ep = h.x - (h.x - Ep) * ($p / g), Ap = h.y - (h.y - Ap) * ($p / g), function() {
                if (sxCancelZoomFrame(), "gpu" !== Kp) return sxMarkCameraMoving(), void sxDebounceCameraStop();
                Gp || (fh = sxLiveCameraProfile()), Gp = !0, Cn.classList.add("is-camera-moving");
                const e = sxLiveCameraProfile();
                e && Cn.style.setProperty("--camera-steady-stroke", sxProfileColor(e));
                let t = sxCameraCssMatrix();
                sxIsCameraDeltaWild(t) && (sxFlushGpuCamera(), t = sxCameraCssMatrix()), Mn.style.transform = `matrix(${t.ratio},0,0,${t.ratio},${t.dx},${t.dy})`,
                sxDebounceCameraStop();
            }();
            sxZoomGateCheck();
        }, {
            passive: !1
        });
        // Readout chip (zoom gate): a click opens the full widget in
        // the popup, exactly like a Hot List row's widget button.
        const sxOpenChipPopup = chip => {
            const id = chip.getAttribute("data-id");
            if (id && "function" === typeof window.sxOpenHotListWidgetPopup) window.sxOpenHotListWidgetPopup(id, sxActiveProfileId());
        };
        // The chip paints inside its spoke group, under the map's
        // hit paths, so a real click usually lands on a hit path
        // rather than the chip itself: hit-test the click point
        // against the chips' screen rects as well as the target.
        const sxChipFromEvent = e => {
            const direct = e.target && e.target.closest ? e.target.closest(".map-readout-chip") : null;
            if (direct) return direct;
            if (!Cn || !e.target || !Cn.contains(e.target)) return null;
            const chips = Cn.querySelectorAll(".map-readout-chip");
            for (const chip of chips) {
                const r = chip.getBoundingClientRect();
                if (e.clientX >= r.left - 2 && e.clientX <= r.right + 2 && e.clientY >= r.top - 2 && e.clientY <= r.bottom + 2) return chip;
            }
            return null;
        };
        document.addEventListener("click", e => {
            const chip = sxChipFromEvent(e);
            if (!chip) return;
            e.preventDefault(), e.stopPropagation(), sxOpenChipPopup(chip);
        }, !0);
        document.addEventListener("keydown", e => {
            if ("Enter" !== e.key && " " !== e.key) return;
            const chip = e.target && e.target.closest ? e.target.closest(".map-readout-chip") : null;
            if (!chip) return;
            e.preventDefault(), e.stopPropagation(), sxOpenChipPopup(chip);
        }, !0);
        // Tap zooms. A hold shows the same tip a mouse hover shows.
        // A second tap opens the About and note sheet. A finger that
        // drifts a little, or a long-press the browser ends itself,
        // still counts as the hold. A widget's first tap still sets
        // the rating; its second tap opens the sheet.
        let sxNoteHold = null, sxNoteTapTime = 0, sxNoteTapId = null, sxNoteTapX = 0, sxNoteTapY = 0;
        function sxNoteSlop(e) {
            return e && ("touch" === e.pointerType || "pen" === e.pointerType) ? 28 : 10;
        }
        function sxClearNoteHold() {
            sxNoteHold && sxNoteHold.timer && t.clear(sxNoteHold.timer), sxNoteHold = null;
        }
        function sxOpenTopicNote(id, x, y, focusNote) {
            if (!id || "function" != typeof sxOpenMarkPlacard) return;
            if (sxPendingNodeTapTimer) {
                try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                sxPendingNodeTapTimer = null;
            }
            window.__sxStopFocusZoom && window.__sxStopFocusZoom();
            "function" == typeof sxHideMapTooltip && sxHideMapTooltip();
            sxOpenMarkPlacard(id, x, y, focusNote ? { focusNote: !0 } : void 0);
        }
        function sxShowTopicTip(id, x, y, pointerType, fromEl) {
            if (sxPendingNodeTapTimer) {
                try { window.clearTimeout(sxPendingNodeTapTimer); } catch (_) {}
                sxPendingNodeTapTimer = null;
            }
            window.__sxStopFocusZoom && window.__sxStopFocusZoom();
            const touch = "touch" === pointerType || "pen" === pointerType;
            let el = fromEl && fromEl.closest && fromEl.closest("[data-ui-tooltip]");
            if (!el && id && In) {
                const group = In.querySelector(`.node-group[data-layout-key="${CSS.escape(id)}"]`);
                el = group && group.querySelector("[data-ui-tooltip]");
            }
            const point = { x: x, y: y, pointerType: pointerType || "touch" };
            if (el && "function" == typeof sxShowMapTooltip) return void sxShowMapTooltip(el, touch, point);
            const rec = id && (sxNodeRegistry[id] || ("function" == typeof sxNodeById ? sxNodeById(id) : null));
            const text = rec && "function" == typeof sxPlacardAboutText ? sxPlacardAboutText(rec) : "";
            window.__SX_TIP_SHOW && window.__SX_TIP_SHOW(el || In, rec && rec.label || "Topic", text, x, y);
        }
        function sxWidgetNoteOnDown(e, topicId) {
            if (!topicId) return !1;
            const now = performance.now(), dist = Math.hypot(e.clientX - sxNoteTapX, e.clientY - sxNoteTapY);
            if (e.detail >= 2 || sxNoteTapId === topicId && now - sxNoteTapTime < 520 && dist < 60) {
                sxClearNoteHold(), sxNoteTapTime = 0, sxNoteTapId = null, sxOpenTopicNote(topicId, e.clientX, e.clientY, !1);
                return !0;
            }
            sxClearNoteHold();
            const hold = {
                pointerId: e.pointerId,
                id: topicId,
                x: e.clientX,
                y: e.clientY,
                t: now,
                moved: !1,
                fired: !1,
                timer: 0
            };
            hold.el = e.target;
            return hold.timer = t.setTimeout(() => {
                sxNoteHold === hold && !hold.moved && (hold.fired = !0, sxShowTopicTip(hold.id, hold.x, hold.y, e.pointerType, hold.el));
            }, 520), sxNoteHold = hold, !1;
        }
        function sxNoteHoldMove(e) {
            const n = sxNoteHold;
            n && n.pointerId === e.pointerId && !n.fired && !n.moved && Math.hypot(e.clientX - n.x, e.clientY - n.y) >= sxNoteSlop(e) && (n.moved = !0, sxClearNoteHold());
        }
        function sxNoteHoldRelease(e) {
            const n = sxNoteHold;
            if (!n || n.pointerId !== e.pointerId) return;
            const i = n.fired, a = n.moved, r = performance.now() - n.t;
            if (sxClearNoteHold(), i) return;
            if ("pointercancel" === e.type && !a && r >= 400) return sxNoteTapTime = 0, sxNoteTapId = null, void sxShowTopicTip(n.id, n.x, n.y, e.pointerType, n.el);
            a || "pointerup" !== e.type || (sxNoteTapTime = performance.now(), sxNoteTapId = n.id, sxNoteTapX = e.clientX, sxNoteTapY = e.clientY);
        }
