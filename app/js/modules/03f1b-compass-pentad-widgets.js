        function sxBindCompassWidget() {
            const canvas = e.byId("markCompassCanvas");
            const advSlider = e.byId("markCompassIntensity");
            const advOut = e.byId("markCompassIntensityOut");
            const advCol = e.byId("markCompassAdvCol");
            const recSlider = e.byId("markCompassRecIntensity");
            const recOut = e.byId("markCompassRecIntensityOut");
            const recCol = e.byId("markCompassRecCol");
            const clearBtn = e.byId("markCompassClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxCompassState.isDragging);

            const setMode = (newMode) => {
                sxCompassState.mode = newMode;
                if (advCol) advCol.classList.toggle("is-active", newMode === "advocacy");
                if (recCol) recCol.classList.toggle("is-active", newMode === "receptivity");
                if (Qr) {
                    const shape = sxWidgetConfig(Qr);
                    sxDrawCompassWidget(canvas, shape, sxCompassState);
                }
            };

            const updatePointFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);
                const sq = sxGetCompassSquare(canvas.width, canvas.height);
                const { u, v } = sxCompassPointToUV(px, py, sq);
                const isClassic = !sxDualPlacements(sxCompassState.topicId);
                const mode = isClassic ? "advocacy" : (sxCompassState.mode || "advocacy");

                if (mode === "receptivity") {
                    sxCompassState.recU = u;
                    sxCompassState.recV = v;
                    if (!sxCompassState.recRated) {
                        sxCompassState.recRated = true;
                        if (!sxCompassState.recIntensity) {
                            sxCompassState.recIntensity = 70;
                            if (recSlider) recSlider.value = "70";
                            if (recOut) recOut.textContent = "70";
                        }
                    }
                    if (recSlider) recSlider.style.setProperty("--rec-color", sxIntensityRGB(56, 189, 248, sxCompassState.recIntensity));
                } else {
                    sxCompassState.u = u;
                    sxCompassState.v = v;
                    if (!sxCompassState.intensity) {
                        sxCompassState.intensity = 70;
                        if (advSlider) advSlider.value = "70";
                        if (advOut) advOut.textContent = "70";
                    }
                    if (advSlider) advSlider.style.setProperty("--adv-color", sxIntensityRGB(255, 255, 255, sxCompassState.intensity));
                }

                if (Qr) {
                    const shape = sxWidgetConfig(Qr);
                    sxDrawCompassWidget(canvas, shape, sxCompassState);
                    sxApplyCompassRatings(Qr, true);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                const isClassic = !sxDualPlacements(sxCompassState.topicId);
                if (!isClassic && canvas.__sxPucks) {
                    const rect = canvas.getBoundingClientRect();
                    const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                    const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                    const px = (clientX - rect.left) * (canvas.width / rect.width);
                    const py = (clientY - rect.top) * (canvas.height / rect.height);
                    const pucks = canvas.__sxPucks;
                    const dAdv = pucks.adv ? Math.hypot(px - pucks.adv.x, py - pucks.adv.y) : Infinity;
                    const dRec = pucks.rec ? Math.hypot(px - pucks.rec.x, py - pucks.rec.y) : Infinity;
                    if (dAdv <= 18 && dRec <= 18) {
                        if (dRec > 7 && dRec <= 18) setMode("receptivity");
                        else setMode("advocacy");
                    } else if (dRec <= 18) {
                        setMode("receptivity");
                    } else if (dAdv <= 18) {
                        setMode("advocacy");
                    }
                }
                sxCompassState.isDragging = !0;
                canvas.setPointerCapture(evt.pointerId);
                updatePointFromPointer(evt);
            });
            canvas.addEventListener("pointermove", (evt) => {
                if (!sxCompassState.isDragging) return;
                updatePointFromPointer(evt);
            });
            const stopDrag = (evt) => {
                if (sxCompassState.isDragging) {
                    sxCompassState.isDragging = !1;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (ignore) {}
                    if (Qr) sxApplyCompassRatings(Qr);
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            // Mouse wheel strictly scoped to puck hover
            canvas.addEventListener("wheel", (evt) => {
                const isClassic = !sxDualPlacements(sxCompassState.topicId);
                const rect = canvas.getBoundingClientRect();
                const px = (evt.clientX - rect.left) * (canvas.width / rect.width);
                const py = (evt.clientY - rect.top) * (canvas.height / rect.height);
                const pucks = canvas.__sxPucks;
                const dAdv = (pucks && pucks.adv) ? Math.hypot(px - pucks.adv.x, py - pucks.adv.y) : Infinity;
                const dRec = (pucks && pucks.rec) ? Math.hypot(px - pucks.rec.x, py - pucks.rec.y) : Infinity;

                let target = null;
                if (dAdv <= 18 && (isClassic || dAdv < dRec)) {
                    target = "advocacy";
                } else if (!isClassic && dRec <= 18) {
                    target = "receptivity";
                }

                if (!target) return;

                evt.preventDefault();
                evt.stopPropagation();
                // Wheel tracks 10x (owner order, 2026-11-25): one notch
                // moves the value ten times as far as before.
                const step = (evt.shiftKey ? 50 : 10) * (evt.deltaY < 0 ? 1 : -1);

                if (target === "receptivity") {
                    if (!sxCompassState.recRated) {
                        sxCompassState.recRated = true;
                        sxCompassState.recIntensity = 70;
                    }
                    sxCompassState.recIntensity = Math.max(-400, Math.min(400, Math.round((Number(sxCompassState.recIntensity) || 0) + step)));
                    if (recSlider) {
                        recSlider.value = String(Math.round(sxCompassState.recIntensity));
                        recSlider.style.setProperty("--rec-color", sxIntensityRGB(56, 189, 248, sxCompassState.recIntensity));
                    }
                    if (recOut) recOut.textContent = String(Math.round(sxCompassState.recIntensity));
                    setMode("receptivity");
                    if (Qr) sxApplyCompassRatings(Qr, true);
                } else {
                    sxCompassState.intensity = Math.max(-400, Math.min(400, Math.round((Number(sxCompassState.intensity) || 0) + step)));
                    if (advSlider) {
                        advSlider.value = String(Math.round(sxCompassState.intensity));
                        advSlider.style.setProperty("--adv-color", sxIntensityRGB(255, 255, 255, sxCompassState.intensity));
                    }
                    if (advOut) advOut.textContent = String(Math.round(sxCompassState.intensity));
                    setMode("advocacy");
                    if (Qr) sxApplyCompassRatings(Qr, true);
                }
                if (Qr) {
                    const shape = sxWidgetConfig(Qr);
                    sxDrawCompassWidget(canvas, shape, sxCompassState);
                }
            }, { passive: false });

            if (advSlider) {
                advSlider.addEventListener("pointerdown", () => setMode("advocacy"));
                advSlider.addEventListener("focus", () => setMode("advocacy"));
                advSlider.addEventListener("input", () => {
                    setMode("advocacy");
                    sxCompassState.intensity = Math.max(-400, Math.min(400, Math.round(Number(advSlider.value) || 0)));
                    if (advOut) advOut.textContent = String(Math.round(sxCompassState.intensity));
                    advSlider.style.setProperty("--adv-color", sxIntensityRGB(255, 255, 255, sxCompassState.intensity));
                    if (Qr) {
                        sxPersistIntensity(Qr, sxCompassState.intensity);
                        const shape = sxWidgetConfig(Qr);
                        sxDrawCompassWidget(canvas, shape, sxCompassState);
                        sxApplyCompassRatings(Qr, true);
                    }
                });
            }

            if (recSlider) {
                recSlider.addEventListener("pointerdown", () => setMode("receptivity"));
                recSlider.addEventListener("focus", () => setMode("receptivity"));
                recSlider.addEventListener("input", () => {
                    setMode("receptivity");
                    if (!sxCompassState.recRated) sxCompassState.recRated = true;
                    sxCompassState.recIntensity = Math.max(-400, Math.min(400, Math.round(Number(recSlider.value) || 0)));
                    if (recOut) recOut.textContent = String(Math.round(sxCompassState.recIntensity));
                    recSlider.style.setProperty("--rec-color", sxIntensityRGB(56, 189, 248, sxCompassState.recIntensity));
                    if (Qr) {
                        const shape = sxWidgetConfig(Qr);
                        sxDrawCompassWidget(canvas, shape, sxCompassState);
                        sxApplyCompassRatings(Qr, true);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        sxClearCompassRatings(Qr);
                    }
                });
            }
        }

        function sxBindTetradWidget() {
            sxBindPolygonRadarWidget({
                canvasId: "markTetradCanvas",
                sliderId: "markTetradIntensity",
                recSliderId: "markTetradRecIntensity",
                advColId: "markTetradAdvCol",
                recColId: "markTetradRecCol",
                clearBtnId: "markTetradClear",
                intensityOutId: "markTetradIntensityOut",
                recIntensityOutId: "markTetradRecIntensityOut",
                state: sxTetradState,
                poleCount: 4,
                getVerticesFn: sxGetTetradVertices,
                drawFn: sxDrawTetradWidget,
                applyFn: sxApplyTetradRatings,
                clearFn: sxClearTetradRatings
            });
        }

        // --- 5-Pole Pentad Radar / Star Deformation State & Widget ---
        var sxPentadState = {
            topicId: null,
            mode: "advocacy",
            intensity: 0,
            recIntensity: 0,
            recRated: !1,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0,
            recP0: 0, recP1: 0, recP2: 0, recP3: 0, recP4: 0,
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_PENTAD_COLORS = ["#a855f7", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e"];

        function sxGetPentadVertices(width, height) {
            return sxGetRegularPolygonVertices(width, height, 5);
        }

        function sxDrawPentadWidget(canvas, shape, state) {
            sxDrawRadarPolygonWidget(canvas, shape, state, 5, sxGetPentadVertices, SX_PENTAD_COLORS);
        }

        function sxApplyPentadRatings(topicId, skipSync) {
            sxApplyPolygonRatings(topicId, sxPentadState, 5, skipSync);
        }

        function sxClearPentadRatings(topicId) {
            sxClearPolygonRatings(topicId, 5);
        }

        function sxBindPentadWidget() {
            sxBindPolygonRadarWidget({
                canvasId: "markPentadCanvas",
                sliderId: "markPentadIntensity",
                recSliderId: "markPentadRecIntensity",
                advColId: "markPentadAdvCol",
                recColId: "markPentadRecCol",
                clearBtnId: "markPentadClear",
                intensityOutId: "markPentadIntensityOut",
                recIntensityOutId: "markPentadRecIntensityOut",
                state: sxPentadState,
                poleCount: 5,
                getVerticesFn: sxGetPentadVertices,
                drawFn: sxDrawPentadWidget,
                applyFn: sxApplyPentadRatings,
                clearFn: sxClearPentadRatings
            });
        }

        // --- 6-Pole Hexad Radar Deformation State & Widget ---
        var sxHexadState = {
            topicId: null,
            mode: "advocacy",
            intensity: 0,
            recIntensity: 0,
            recRated: !1,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0,
            recP0: 0, recP1: 0, recP2: 0, recP3: 0, recP4: 0, recP5: 0,
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_HEXAD_COLORS = ["#22c55e", "#06b6d4", "#6366f1", "#ef4444", "#f97316", "#eab308"];

        function sxGetHexadVertices(width, height) {
            return sxGetRegularPolygonVertices(width, height, 6);
        }

        function sxDrawHexadWidget(canvas, shape, state) {
            sxDrawRadarPolygonWidget(canvas, shape, state, 6, sxGetHexadVertices, SX_HEXAD_COLORS);
        }

        function sxApplyHexadRatings(topicId, skipSync) {
            sxApplyPolygonRatings(topicId, sxHexadState, 6, skipSync);
        }

        function sxClearHexadRatings(topicId) {
            sxClearPolygonRatings(topicId, 6);
        }

        function sxBindHexadWidget() {
            sxBindPolygonRadarWidget({
                canvasId: "markHexadCanvas",
                sliderId: "markHexadIntensity",
                recSliderId: "markHexadRecIntensity",
                advColId: "markHexadAdvCol",
                recColId: "markHexadRecCol",
                clearBtnId: "markHexadClear",
                intensityOutId: "markHexadIntensityOut",
                recIntensityOutId: "markHexadRecIntensityOut",
                state: sxHexadState,
                poleCount: 6,
                getVerticesFn: sxGetHexadVertices,
                drawFn: sxDrawHexadWidget,
                applyFn: sxApplyHexadRatings,
                clearFn: sxClearHexadRatings
            });
        }

        // --- 7-Pole Heptad Radar Deformation State & Widget ---
        var sxHeptadState = {
            topicId: null,
            mode: "advocacy",
            intensity: 0,
            recIntensity: 0,
            recRated: !1,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0,
            recP0: 0, recP1: 0, recP2: 0, recP3: 0, recP4: 0, recP5: 0, recP6: 0,
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_HEPTAD_COLORS = ["#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"];

        function sxGetHeptadVertices(width, height) {
            return sxGetRegularPolygonVertices(width, height, 7);
        }

        function sxDrawHeptadWidget(canvas, shape, state) {
            sxDrawRadarPolygonWidget(canvas, shape, state, 7, sxGetHeptadVertices, SX_HEPTAD_COLORS);
        }

        function sxApplyHeptadRatings(topicId, skipSync) {
            sxApplyPolygonRatings(topicId, sxHeptadState, 7, skipSync);
        }

        function sxClearHeptadRatings(topicId) {
            sxClearPolygonRatings(topicId, 7);
        }

        function sxBindHeptadWidget() {
            sxBindPolygonRadarWidget({
                canvasId: "markHeptadCanvas",
                sliderId: "markHeptadIntensity",
                recSliderId: "markHeptadRecIntensity",
                advColId: "markHeptadAdvCol",
                recColId: "markHeptadRecCol",
                clearBtnId: "markHeptadClear",
                intensityOutId: "markHeptadIntensityOut",
                recIntensityOutId: "markHeptadRecIntensityOut",
                state: sxHeptadState,
                poleCount: 7,
                getVerticesFn: sxGetHeptadVertices,
                drawFn: sxDrawHeptadWidget,
                applyFn: sxApplyHeptadRatings,
                clearFn: sxClearHeptadRatings
            });
        }

        // --- 8-Pole Octad Radar Deformation State & Widget ---
        var sxOctadState = {
            topicId: null,
            mode: "advocacy",
            intensity: 0,
            recIntensity: 0,
            recRated: !1,
            p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0,
            recP0: 0, recP1: 0, recP2: 0, recP3: 0, recP4: 0, recP5: 0, recP6: 0, recP7: 0,
            shape: null,
            activeVertex: null,
            isDragging: !1,
            dragFromZero: !1,
            vertexLocked: !1
        };

        const SX_OCTAD_COLORS = ["#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f97316"];

        function sxGetOctadVertices(width, height) {
            return sxGetRegularPolygonVertices(width, height, 8);
        }

        function sxDrawOctadWidget(canvas, shape, state) {
            sxDrawRadarPolygonWidget(canvas, shape, state, 8, sxGetOctadVertices, SX_OCTAD_COLORS);
        }

        function sxApplyOctadRatings(topicId, skipSync) {
            sxApplyPolygonRatings(topicId, sxOctadState, 8, skipSync);
        }

        function sxClearOctadRatings(topicId) {
            sxClearPolygonRatings(topicId, 8);
        }
